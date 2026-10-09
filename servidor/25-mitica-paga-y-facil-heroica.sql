-- Rumble: aplicado en el proyecto awivkedbmumwnkqlfixm el 9-10-2026 (migración «mitica_paga_y_facil_heroica»). Dos cosas:
--   · Lo pendiente de 15-dificultades-facil-heroica.sql: Fácil (f) y Heroica (x) cobran sus premios (_camp_abierto, conciliar_progreso y anotar).
--     Los multiplicadores de f y x ya estaban en tablas_juego (datos versión 21).
--   · Decisión de Daniel: la Mítica semanal da oro y gemas cada semana. En Mítica, el premio de «primera vez» (o de jefe) y el extra
--     de 3 estrellas se cobran mirando las estrellas DE ESTA SEMANA (claves mit:<lunes>:<nivel>:<n>), no las de siempre.
--     El legendario de cada jefe y el objeto de facción siguen siendo una sola vez (eso lo da el juego, con su propio evento).
-- Sustituye a la anotar de 23-mitica-semanal.sql. Compatible con versiones anteriores del juego (mismo evento de siempre).

-- 1) _camp_abierto: la que había en la base (con la regla 'todos' de Fans of TD) + Fácil y Heroica.
--    Mítica: pide el jefe del mundo ganado en Heroica; también vale en Difícil (la regla antigua, porque hasta hoy el servidor no apuntaba
--    las victorias en Heroica) o tener ya alguna estrella en Mítica en ese mundo.
create or replace function public._camp_abierto(p_u uuid, p_juego text, p_d jsonb, p_dif text, p_nivel text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  w int; l int; mundo jsonb; n_niv int; ok boolean := true; estricto boolean; previo text; l2 int; n_prev int;
begin
  select (m.progreso_ok or not public.puerta_abierta()) into estricto from public.monedero m where m.usuario = p_u and m.juego = p_juego;
  if p_nivel !~ '^[0-9]{1,2}-[0-9]{1,2}$' or p_dif not in ('f', 'n', 'h', 'x', 'm') then return jsonb_build_object('ok', false, 'jefe', false); end if;
  w := split_part(p_nivel, '-', 1)::int; l := split_part(p_nivel, '-', 2)::int;
  mundo := p_d->'premios'->'mundos'->(w - 1);
  if mundo is null or jsonb_typeof(mundo) <> 'object' then
    return jsonb_build_object('ok', false, 'jefe', false);
  end if;
  n_niv := (mundo->>'niveles')::int;
  if l < 1 or l > n_niv then return jsonb_build_object('ok', false, 'jefe', false); end if;
  if coalesce(estricto, true) then
    if l > 1 and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:' || p_dif || ':' || w || '-' || (l - 1) || ':1') then ok := false; end if;
    previo := coalesce(mundo->>'openAfter', case when w > 1 then (w - 1) || '-4' end);
    if p_dif = 'h' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || w || '-4:1') then ok := false; end if;
    elsif p_dif = 'x' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:h:' || w || '-4:1') then ok := false; end if;
    elsif p_dif = 'm' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego
                     and (r.clave in ('camp:x:' || w || '-4:1', 'camp:h:' || w || '-4:1') or r.clave like 'camp:m:' || w || '-%:1')) then ok := false; end if;
    elsif p_dif = 'f' then
      if previo is not null and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego
                     and r.clave in ('camp:n:' || previo || ':1', 'camp:f:' || previo || ':1')) then ok := false; end if;
    elsif coalesce(p_d->'premios'->>'campRegla', 'ultimo') = 'todos' then
      -- el mundo se abre al pasar todos los niveles del anterior (Fans of TD)
      if w > 1 and l = 1 then
        n_prev := coalesce((p_d->'premios'->'mundos'->(w - 2)->>'niveles')::int, 4);
        for l2 in 1..n_prev loop
          if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || (w - 1) || '-' || l2 || ':1') then ok := false; end if;
        end loop;
      end if;
    else
      if previo is not null and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || previo || ':1') then ok := false; end if;
    end if;
  end if;
  return jsonb_build_object('ok', ok, 'jefe', coalesce((mundo->>'jefe')::int, 0) = l);
end $$;
revoke all on function public._camp_abierto(uuid, text, jsonb, text, text) from public, anon, authenticated;

-- 2) conciliar_progreso: la que había en la base (Rumble y la de Fans of TD, stars) + campF (Fácil) y campX (Heroica)
create or replace function public.conciliar_progreso(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m public.monedero; dif text; k text; x jsonb; st int; i int; campo text;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if m.progreso_ok then return public.estado(p_juego); end if;
  if public.puerta_abierta() then
    foreach campo in array array['campF', 'camp', 'campH', 'campX', 'campM', 'stars'] loop
      dif := case campo when 'campF' then 'f' when 'campH' then 'h' when 'campX' then 'x' when 'campM' then 'm' else 'n' end;
      if jsonb_typeof(p_save->campo) = 'object' then
        for k, x in select * from jsonb_each(p_save->campo) limit 400 loop
          continue when k !~ '^[0-9]{1,2}-[0-9]{1,2}$' or jsonb_typeof(x) <> 'number';
          st := least(greatest(floor((x#>>'{}')::numeric)::int, 0), 3);
          for i in 1..st loop
            insert into public.reclamos (usuario, juego, clave) values (u, p_juego, 'camp:' || dif || ':' || k || ':' || i) on conflict do nothing;
          end loop;
        end loop;
      end if;
    end loop;
  end if;
  update public.monedero w set progreso_ok = true, rev = w.rev + 1 where w.usuario = u and w.juego = p_juego;
  return public.estado(p_juego);
end $$;
revoke all on function public.conciliar_progreso(text, jsonb) from public, anon;
grant execute on function public.conciliar_progreso(text, jsonb) to authenticated;

-- 3) anotar: la de 23-mitica-semanal.sql, ahora con f y x, y en Mítica cuenta como «primera vez» la primera de cada semana
create or replace function public.anotar(p_juego text, p_movs jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); d jsonb; T jsonb; tp jsonb; e jsonb; n int := 0; rech int := 0; filas int; mot text; v_clave text;
  p_o bigint; p_g bigint; p_e bigint; d_o bigint; d_g bigint; d_e bigint; u_o bigint; u_g bigint; u_e bigint;
  o_o bigint; o_g bigint; o_e bigint;
  lim constant numeric := 10000000;
  fj jsonb; ev jsonb; cm jsonb; cv jsonb; rr jsonb; xp int; pay numeric; prev int; st int; i int; c_o numeric; c_g numeric;
  it jsonb; sq int; cal jsonb; nuevos jsonb := '[]'::jsonb;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if jsonb_typeof(p_movs) <> 'array' then raise exception 'movimientos_no_validos'; end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  T := d->'topes';
  if T is null then raise exception 'sin_topes'; end if;
  perform 1 from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  for e in select x from jsonb_array_elements(p_movs) x limit 200 loop
    continue when jsonb_typeof(e) <> 'object' or coalesce(e->>'clave', '') = '' or length(e->>'clave') > 80;
    rr := null;
    mot := left(coalesce(e->>'motivo', ''), 40); tp := T->mot;
    if tp is null then
      rech := rech + 1;
      perform public._senal(u, p_juego, 'motivo_desconocido', 'clara', jsonb_build_object('motivo', mot, 'oro', e->'oro', 'gemas', e->'gemas', 'entradas', e->'entradas'));
      continue;
    end if;
    v_clave := case when coalesce((tp->>'unica')::boolean, false) then mot else e->>'clave' end;
    p_o := least(greatest(case when jsonb_typeof(e->'oro') = 'number' then floor((e->>'oro')::numeric) else 0 end, -lim), lim);
    p_g := least(greatest(case when jsonb_typeof(e->'gemas') = 'number' then floor((e->>'gemas')::numeric) else 0 end, -lim), lim);
    p_e := least(greatest(case when jsonb_typeof(e->'entradas') = 'number' then floor((e->>'entradas')::numeric) else 0 end, -1000), 1000);
    o_o := p_o; o_g := p_g; o_e := p_e;
    ev := e->'evento';
    if tp ? 'fijo' then
      fj := case when jsonb_typeof(tp->'fijo') = 'string' then d->'premios'->(tp->>'fijo') else tp->'fijo' end;
      if fj is null then rech := rech + 1; continue; end if;
      p_o := coalesce((fj->>'gold')::bigint, 0); p_g := coalesce((fj->>'gems')::bigint, 0); p_e := coalesce((fj->>'tickets')::bigint, 0);
      if coalesce((tp->>'diario')::boolean, false) then v_clave := mot || ':' || ((now() at time zone 'Europe/Madrid')::date)::text; end if;
    elsif public._acepta(tp, 'camp') and jsonb_typeof(ev) = 'object' and ev->>'tipo' = 'camp' then
      cm := d->'premios'->'camp';
      if cm is null or coalesce(ev->>'dif', '') not in ('f', 'n', 'h', 'x', 'm') or coalesce(ev->>'nivel', '') !~ '^[A-Za-z0-9_-]{1,20}$' then rech := rech + 1; continue; end if;
      cv := public._camp_abierto(u, p_juego, d, ev->>'dif', ev->>'nivel');
      if not (cv->>'ok')::boolean then
        rech := rech + 1;
        perform public._senal(u, p_juego, 'evento_rechazado', 'debil', jsonb_build_object('motivo', mot, 'tipo', 'camp', 'nivel', ev->>'nivel', 'dif', ev->>'dif', 'pedido', jsonb_build_object('oro', o_o, 'gemas', o_g)));
        continue;
      end if;
      pay := coalesce((d->'premios'->'pay'->>(ev->>'dif'))::numeric, 1);
      if ev->>'dif' = 'm' then   -- MÍTICA SEMANAL: los premios de primera vez y de 3 estrellas se vuelven a cobrar cada semana
        select count(*) into prev from public.reclamos r
          where r.usuario = u and r.juego = p_juego and r.clave like 'mit:' || public._mit_semana(now()) || ':' || (ev->>'nivel') || ':_';
      else
        select count(*) into prev from public.reclamos r
          where r.usuario = u and r.juego = p_juego and r.clave in ('camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':1', 'camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':2', 'camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':3');
      end if;
      c_o := 0; c_g := 0;
      if coalesce((ev->>'victoria')::boolean, false) then
        st := least(greatest(coalesce((ev->>'estrellas')::int, 1), 1), 3);
        if prev = 0 then
          if (cv->>'jefe')::boolean then c_o := (cm->'boss'->>0)::numeric * pay; c_g := (cm->'boss'->>1)::numeric * pay;
          else c_o := (cm->'first'->>0)::numeric * pay; c_g := (cm->'first'->>1)::numeric * pay; end if;
        else c_o := (cm->>'replay')::numeric * pay; end if;
        if st = 3 and prev < 3 then c_o := c_o + (cm->'stars3'->>0)::numeric * pay; c_g := c_g + (cm->'stars3'->>1)::numeric * pay; end if;
        for i in 1..st loop
          insert into public.reclamos (usuario, juego, clave) values (u, p_juego, 'camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':' || i) on conflict do nothing;
        end loop;
        -- MÍTICA SEMANAL: las estrellas de esta semana (para el Salón y para el premio de la semana)
        if ev->>'dif' = 'm' then
          for i in 1..st loop
            insert into public.reclamos (usuario, juego, clave) values (u, p_juego, 'mit:' || public._mit_semana(now()) || ':' || (ev->>'nivel') || ':' || i) on conflict do nothing;
          end loop;
        end if;
      else c_o := (cm->>'lose')::numeric * pay; end if;
      p_o := floor(c_o); p_g := floor(c_g); p_e := 0;
    elsif jsonb_typeof(ev) = 'object' and ev->>'tipo' not in ('camp', 'otro') and public._acepta(tp, ev->>'tipo') then
      if ev->>'tipo' in ('horas', 'horas-anuncio', 'turbo', 'anuncio', 'objeto') then
        rr := public._evento_horas(u, p_juego, d, ev, jsonb_build_object('oro', p_o, 'gemas', p_g, 'entradas', p_e), case when jsonb_typeof(e->'t') = 'number' then (e->>'t')::numeric end);
      else
        rr := public._evento(u, p_juego, d, ev);
      end if;
      if not coalesce((rr->>'ok')::boolean, false) then
        rech := rech + 1;
        perform public._senal(u, p_juego, 'evento_rechazado', case when ev->>'tipo' = 'objeto' then 'clara' else 'debil' end,
          jsonb_build_object('motivo', mot, 'tipo', ev->>'tipo', 'evento', ev - 'q', 'pedido', jsonb_build_object('oro', o_o, 'gemas', o_g, 'entradas', o_e)));
        continue;
      end if;
      p_o := (rr->>'oro')::bigint; p_g := (rr->>'gemas')::bigint; p_e := (rr->>'entradas')::bigint;
      if rr->>'clave' is not null then v_clave := rr->>'clave'; end if;
    end if;
    select coalesce(sum(mv.d_oro) filter (where mv.d_oro > 0), 0), coalesce(sum(mv.d_gemas) filter (where mv.d_gemas > 0), 0), coalesce(sum(mv.d_entradas) filter (where mv.d_entradas > 0), 0)
      into u_o, u_g, u_e from public.movimientos mv
      where mv.usuario = u and mv.juego = p_juego and mv.motivo = mot and mv.creado > now() - interval '24 hours';
    d_o := public._limitar(p_o, (tp->'vez'->>'gold')::bigint, (tp->'dia'->>'gold')::bigint, u_o);
    d_g := public._limitar(p_g, (tp->'vez'->>'gems')::bigint, (tp->'dia'->>'gems')::bigint, u_g);
    d_e := public._limitar(p_e, (tp->'vez'->>'tickets')::bigint, (tp->'dia'->>'tickets')::bigint, u_e);
    -- señales para revisar a mano: pedir mucho más de lo que se concede (absurdo = diez veces el máximo por cobro)
    if (o_o > 1000 and o_o > coalesce((tp->'vez'->>'gold')::bigint, 0) * 10) or (o_g > 100 and o_g > coalesce((tp->'vez'->>'gems')::bigint, 0) * 10) then
      perform public._senal(u, p_juego, 'cantidad_absurda', 'clara', jsonb_build_object('motivo', mot, 'pedido', jsonb_build_object('oro', o_o, 'gemas', o_g, 'entradas', o_e), 'concedido', jsonb_build_object('oro', d_o, 'gemas', d_g, 'entradas', d_e)));
    elsif o_o > d_o * 1.05 + 5 or o_g > d_g * 1.05 + 5 or o_e > d_e then
      perform public._senal(u, p_juego, 'tope_recortado', 'debil', jsonb_build_object('motivo', mot, 'pedido', jsonb_build_object('oro', o_o, 'gemas', o_g, 'entradas', o_e), 'concedido', jsonb_build_object('oro', d_o, 'gemas', d_g, 'entradas', d_e)));
    end if;
    insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas, nota)
    values (u, p_juego, mot, v_clave, d_o, d_g, d_e,
            case when (d_o, d_g, d_e) is distinct from (p_o, p_g, p_e) then jsonb_build_object('pedido', jsonb_build_object('oro', p_o, 'gemas', p_g, 'entradas', p_e)) end)
    on conflict (usuario, juego, clave) do nothing;
    get diagnostics filas = row_count;
    if filas = 1 then
      update public.monedero w set oro = greatest(w.oro + d_o, 0), gemas = greatest(w.gemas + d_g, 0), entradas = greatest(w.entradas + d_e::int, 0),
        rev = w.rev + 1, cambiado = now() where w.usuario = u and w.juego = p_juego;
      n := n + 1;
      if mot = 'partida' and jsonb_typeof(ev) = 'object' and ev->>'tipo' in ('camp', 'otro') and d->'premios'->'pase' is not null then
        xp := case when coalesce((ev->>'victoria')::boolean, false) then (d->'premios'->'pase'->>'xpWin')::int else (d->'premios'->'pase'->>'xpLose')::int end;
        update public.monedero w set extra = jsonb_set(coalesce(w.extra, '{}'::jsonb), array[public._pase_clave(d->'premios'->'pase')],
            to_jsonb(least((d->'premios'->'pase'->>'levels')::int * (d->'premios'->'pase'->>'xpPer')::int, coalesce((w.extra->>public._pase_clave(d->'premios'->'pase'))::int, 0) + coalesce(xp, 0))))
          where w.usuario = u and w.juego = p_juego;
      end if;
      if jsonb_typeof(rr->'items') = 'array' then
        for it in select * from jsonb_array_elements(rr->'items') loop
          update public.monedero w set seq = w.seq + 1 where w.usuario = u and w.juego = p_juego returning w.seq into sq;
          cal := case when jsonb_typeof(it->'q') = 'array' then it->'q'
                      else (select jsonb_agg(it->'q') from generate_series(1, greatest(1, coalesce((it->>'n')::int, 1)))) end;
          insert into public.inventario (usuario, juego, uid, tipo, objeto, calidades) values (u, p_juego, 'n' || sq, coalesce(it->>'k', 'eq'), it->>'id', cal);
          nuevos := nuevos || jsonb_build_array(jsonb_build_object('clave', e->>'clave', 'u', 'n' || sq, 'k', coalesce(it->>'k', 'eq'), 'id', it->>'id', 'q', cal));
        end loop;
      end if;
    end if;
  end loop;
  return public.estado(p_juego) || jsonb_build_object('aplicados', n, 'rechazados', rech, 'nuevos', nuevos);
end $$;
revoke all on function public.anotar(text, jsonb) from public, anon;
grant execute on function public.anotar(text, jsonb) to authenticated;

