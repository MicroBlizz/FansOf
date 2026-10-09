-- Rumble 0.9.x: la MÍTICA SEMANAL. Aplicado en el proyecto awivkedbmumwnkqlfixm el 9-10-2026 (migración «mitica_semanal»).
--
-- Idea de Daniel: la Mítica vuelve a 0 estrellas cada lunes (hora de Madrid) y las estrellas que ganas cuentan para el Salón de la Fama.
--   · Los niveles NO se cierran: lo abierto sigue abierto (_camp_abierto no cambia: mira las claves camp:m:… de siempre).
--   · El oro y las gemas tampoco cambian: el primer pase, las repeticiones y la tercera estrella se cobran como antes
--     (las claves camp:m:<nivel>:<1|2|3> son para siempre), así que repetir la Mítica cada semana no regala más premios de la cuenta.
--   · Lo nuevo: cada victoria en Mítica apunta también sus estrellas DE ESTA SEMANA en `reclamos`, con la clave
--     mit:<lunes de la semana>:<nivel>:<1|2|3>  (por ejemplo mit:2026-10-05:3-4:2). Solo cuenta la mejor de cada nivel en cada semana.
--   · clasificacion() aprende tres tablas: 'mitica' (esta semana), 'mitica_pasada' (la semana anterior, la que ya se cerró: de ahí salen
--     los premios del lunes) y 'mitica_total' (todas las semanas sumadas). En las tres, extra = niveles con estrella (semana) o semanas jugadas (total).
-- Compatible con versiones anteriores del juego: el móvil manda el mismo evento {tipo:'camp', dif:'m', …} de siempre.
-- OJO: la lista de dificultades de anotar sigue siendo n/h/m, como está en la base; Fácil y Heroica llegan con 15-dificultades-facil-heroica.sql (pendiente).

create or replace function public._mit_semana(t timestamptz default now()) returns date
language sql stable set search_path = '' as $$ select date_trunc('week', t at time zone 'Europe/Madrid')::date $$;

-- anotar: igual que la que había en la base (10-premios…, con las señales y los objetos de las versiones siguientes) + el bloque «MÍTICA SEMANAL»
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
      if cm is null or coalesce(ev->>'dif', '') not in ('n', 'h', 'm') or coalesce(ev->>'nivel', '') !~ '^[A-Za-z0-9_-]{1,20}$' then rech := rech + 1; continue; end if;
      cv := public._camp_abierto(u, p_juego, d, ev->>'dif', ev->>'nivel');
      if not (cv->>'ok')::boolean then
        rech := rech + 1;
        perform public._senal(u, p_juego, 'evento_rechazado', 'debil', jsonb_build_object('motivo', mot, 'tipo', 'camp', 'nivel', ev->>'nivel', 'dif', ev->>'dif', 'pedido', jsonb_build_object('oro', o_o, 'gemas', o_g)));
        continue;
      end if;
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
        -- MÍTICA SEMANAL: las estrellas de esta semana, para el Salón (no dan oro ni gemas)
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

-- clasificacion: la de 20-clasificacion.sql (con _nombre_publico) + las tres tablas de la Mítica
create or replace function public.clasificacion(p_juego text, p_tabla text) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare u uuid := auth.uid(); b boolean; res jsonb; sem text;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if p_tabla not in ('campana', 'poder', 'mitica', 'mitica_pasada', 'mitica_total') then raise exception 'tabla_no_valida'; end if;
  select coalesce(m.marcado, false) into b from public.cuentas_marca m where m.usuario = u; b := coalesce(b, false);
  sem := case p_tabla when 'mitica' then public._mit_semana(now())::text when 'mitica_pasada' then (public._mit_semana(now()) - 7)::text end;

  with base as (
    select r.usuario,
           count(*)::int as valor,
           max(case split_part(r.clave, ':', 2) when 'f' then 1 when 'n' then 2 when 'h' then 3 when 'x' then 4 when 'm' then 5 else 0 end)::int as extra,
           max(r.creado) as cuando
      from public.reclamos r
     where p_tabla = 'campana' and r.juego = p_juego and r.clave like 'camp:%'
     group by r.usuario
    union all
    select c.usuario, sum(c.nivel)::int, (count(*) filter (where c.nivel > 1))::int, null::timestamptz
      from public.cartas c
     where p_tabla = 'poder' and c.juego = p_juego
     group by c.usuario
    union all
    select r.usuario, count(*)::int, count(distinct split_part(r.clave, ':', 3))::int, max(r.creado)
      from public.reclamos r
     where sem is not null and r.juego = p_juego and r.clave like 'mit:' || sem || ':%'
     group by r.usuario
    union all
    select r.usuario, count(*)::int, count(distinct split_part(r.clave, ':', 2))::int, max(r.creado)
      from public.reclamos r
     where p_tabla = 'mitica_total' and r.juego = p_juego and r.clave like 'mit:%'
     group by r.usuario
  ),
  limpia as (
    select x.* from base x
     where x.valor > 0
       and coalesce((select m.marcado from public.cuentas_marca m where m.usuario = x.usuario), false) = b
  ),
  puestos as (
    select l.*, row_number() over (order by l.valor desc, l.extra desc, l.cuando asc nulls last, l.usuario) as puesto from limpia l
  ),
  filas as (
    select p.puesto, p.usuario, jsonb_build_object(
             'puesto', p.puesto,
             'nombre', public._nombre_publico(p.usuario, p_juego),
             'look', public._look_publico(p.usuario, p_juego),   -- marco y título (24-aspecto-publico.sql)
             'avatar', g.datos->>'avatar', 'fac', coalesce(g.datos->>'lastFac', g.datos->>'fac'),
             'valor', p.valor, 'extra', p.extra, 'yo', p.usuario = u) as fila
      from puestos p left join public.partidas g on g.usuario = p.usuario and g.juego = p_juego
  )
  select jsonb_build_object(
           'lista', coalesce((select jsonb_agg(f.fila order by f.puesto) from filas f where f.puesto <= 50), '[]'::jsonb),
           'yo', (select f.fila from filas f where f.usuario = u),
           'total', (select count(*) from puestos),
           'semana', sem)
    into res;
  return res;
end $$;
revoke all on function public.clasificacion(text, text) from public, anon;
grant execute on function public.clasificacion(text, text) to authenticated;
