-- Fase 3, paso 2 de PLAN-CUENTAS (punto 15): los premios de un solo cobro los calcula el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «premios_del_servidor»).
-- `anotar` ahora distingue tres casos por motivo (tablas_juego.datos.topes[motivo]):
--   · fijo: { fijo: 'gift' | { gold, gems, tickets } }  el servidor da SIEMPRE esa cantidad (la tabla datos.premios[clave] o la propia) y no mira lo que pida el cliente.
--     Con diario: true se cobra una vez por día natural de Madrid; con unica: true, una vez por cuenta.
--   · calcula: 'camp'  si el movimiento trae evento {tipo:'camp', nivel, dif, estrellas, victoria, jefe}, el servidor calcula el premio con datos.premios
--     (primer pase, repeticiones, tercera estrella, derrota, multiplicador de dificultad) y apunta las estrellas ya cobradas en `reclamos`.
--   · el resto: la cantidad la dice el cliente y la limitan los topes de siempre (vez y dia).
--     (desde el paso 3 solo si el nivel está abierto y el jefe lo dice el servidor)
-- En todos los casos siguen aplicándose los topes vez y dia.
create or replace function public.anotar(p_juego text, p_movs jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); d jsonb; T jsonb; tp jsonb; e jsonb; n int := 0; rech int := 0; filas int; mot text; v_clave text;
  p_o bigint; p_g bigint; p_e bigint; d_o bigint; d_g bigint; d_e bigint; u_o bigint; u_g bigint; u_e bigint;
  lim constant numeric := 10000000;
  fj jsonb; ev jsonb; cm jsonb; cv jsonb; rr jsonb; xp int; pay numeric; prev int; st int; i int; c_o numeric; c_g numeric;
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
    mot := left(coalesce(e->>'motivo', ''), 40); tp := T->mot;
    if tp is null then rech := rech + 1; continue; end if;
    v_clave := case when coalesce((tp->>'unica')::boolean, false) then mot else e->>'clave' end;
    p_o := least(greatest(case when jsonb_typeof(e->'oro') = 'number' then floor((e->>'oro')::numeric) else 0 end, -lim), lim);
    p_g := least(greatest(case when jsonb_typeof(e->'gemas') = 'number' then floor((e->>'gemas')::numeric) else 0 end, -lim), lim);
    p_e := least(greatest(case when jsonb_typeof(e->'entradas') = 'number' then floor((e->>'entradas')::numeric) else 0 end, -1000), 1000);
    ev := e->'evento';
    if tp ? 'fijo' then
      fj := case when jsonb_typeof(tp->'fijo') = 'string' then d->'premios'->(tp->>'fijo') else tp->'fijo' end;
      if fj is null then rech := rech + 1; continue; end if;
      p_o := coalesce((fj->>'gold')::bigint, 0); p_g := coalesce((fj->>'gems')::bigint, 0); p_e := coalesce((fj->>'tickets')::bigint, 0);
      if coalesce((tp->>'diario')::boolean, false) then v_clave := mot || ':' || ((now() at time zone 'Europe/Madrid')::date)::text; end if;
    elsif public._acepta(tp, 'camp') and jsonb_typeof(ev) = 'object' and ev->>'tipo' = 'camp' then
      cm := d->'premios'->'camp';
      if cm is null or coalesce(ev->>'dif', '') not in ('n', 'h', 'm') or coalesce(ev->>'nivel', '') !~ '^[A-Za-z0-9_-]{1,20}$' then rech := rech + 1; continue; end if;
      cv := public._camp_abierto(u, p_juego, d, ev->>'dif', ev->>'nivel');   -- ¿está abierto el nivel según lo que el servidor sabe? (11-progreso-de-campana.sql)
      if not (cv->>'ok')::boolean then rech := rech + 1; continue; end if;
      pay := coalesce((d->'premios'->'pay'->>(ev->>'dif'))::numeric, 1);
      select count(*) into prev from public.reclamos r
        where r.usuario = u and r.juego = p_juego and r.clave in ('camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':1', 'camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':2', 'camp:' || (ev->>'dif') || ':' || (ev->>'nivel') || ':3');
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
      else c_o := (cm->>'lose')::numeric * pay; end if;
      p_o := floor(c_o); p_g := floor(c_g); p_e := 0;
    elsif jsonb_typeof(ev) = 'object' and ev->>'tipo' not in ('camp', 'otro') and public._acepta(tp, ev->>'tipo') then
      -- misiones, racha de días, pase y logros (12-misiones-pase-logros.sql)
      rr := public._evento(u, p_juego, d, ev);
      if not coalesce((rr->>'ok')::boolean, false) then rech := rech + 1; continue; end if;
      p_o := (rr->>'oro')::bigint; p_g := (rr->>'gemas')::bigint; p_e := (rr->>'entradas')::bigint;
      if rr->>'clave' is not null then v_clave := rr->>'clave'; end if;
    end if;
    select coalesce(sum(mv.d_oro) filter (where mv.d_oro > 0), 0), coalesce(sum(mv.d_gemas) filter (where mv.d_gemas > 0), 0), coalesce(sum(mv.d_entradas) filter (where mv.d_entradas > 0), 0)
      into u_o, u_g, u_e from public.movimientos mv
      where mv.usuario = u and mv.juego = p_juego and mv.motivo = mot and mv.creado > now() - interval '24 hours';
    d_o := public._limitar(p_o, (tp->'vez'->>'gold')::bigint, (tp->'dia'->>'gold')::bigint, u_o);
    d_g := public._limitar(p_g, (tp->'vez'->>'gems')::bigint, (tp->'dia'->>'gems')::bigint, u_g);
    d_e := public._limitar(p_e, (tp->'vez'->>'tickets')::bigint, (tp->'dia'->>'tickets')::bigint, u_e);
    insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas, nota)
    values (u, p_juego, mot, v_clave, d_o, d_g, d_e,
            case when (d_o, d_g, d_e) is distinct from (p_o, p_g, p_e) then jsonb_build_object('pedido', jsonb_build_object('oro', p_o, 'gemas', p_g, 'entradas', p_e)) end)
    on conflict (usuario, juego, clave) do nothing;
    get diagnostics filas = row_count;
    if filas = 1 then
      update public.monedero w set oro = greatest(w.oro + d_o, 0), gemas = greatest(w.gemas + d_g, 0), entradas = greatest(w.entradas + d_e::int, 0),
        rev = w.rev + 1, cambiado = now() where w.usuario = u and w.juego = p_juego;
      n := n + 1;
      -- la xp del pase la cuenta el servidor: cada partida con evento suma xpWin o xpLose
      if mot = 'partida' and jsonb_typeof(ev) = 'object' and ev->>'tipo' in ('camp', 'otro') and d->'premios'->'pase' is not null then
        xp := case when coalesce((ev->>'victoria')::boolean, false) then (d->'premios'->'pase'->>'xpWin')::int else (d->'premios'->'pase'->>'xpLose')::int end;
        update public.monedero w set extra = jsonb_set(coalesce(w.extra, '{}'::jsonb), '{pase_xp}',
            to_jsonb(least((d->'premios'->'pase'->>'levels')::int * (d->'premios'->'pase'->>'xpPer')::int, coalesce((w.extra->>'pase_xp')::int, 0) + coalesce(xp, 0))))
          where w.usuario = u and w.juego = p_juego;
      end if;
    end if;
  end loop;
  return public.estado(p_juego) || jsonb_build_object('aplicados', n, 'rechazados', rech);
end $$;
revoke all on function public.anotar(text, jsonb) from public, anon;
grant execute on function public.anotar(text, jsonb) to authenticated;
