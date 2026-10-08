-- Rumble v0.9.92: temporadas del pase y pase PvP.
-- · Temporadas: si el pase de un juego trae id (datos.premios.pase.id), sus puntos se guardan en monedero.extra->'pase_xp_<id>'
--   y sus cobros en reclamos 'pase:<id>:free|paid:<nivel>' y 'pase:<id>:premium'. Con un id nuevo todos empiezan de cero
--   y el pase Ejecutivo se vuelve a comprar. Sin id (TD, Survivors y las versiones de antes) todo sigue como en el 18.
-- · Pase PvP (datos.premios.pasePvp, con id): sus puntos los suma pvp_cerrar a los dos jugadores al cerrar una partida
--   (xpWin al que gana, xpLose al otro y en empate) en extra->'pasepvp_xp_<id>'. Cobros: evento 'pase-pvp' {pista, nivel}
--   y la compra de prueba 'pase-pvp-premium' (motivo compra-pase-pvp). Solo da oro, gemas y tiradas; marcos y títulos son del aparato.
-- Sustituye _evento (18-misiones-premio-propio.sql) y cambia dos trozos de anotar y pvp_cerrar sin reescribirlas
-- (se leen de la base de datos, se cambia el texto y se vuelven a crear: así no se pisa nada más de esas funciones).
-- Funciona con las versiones de antes del juego: mientras los datos subidos no traigan id, no cambia nada.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 9-10-2026 (migración «pase_temporadas_y_pvp»), probada antes dentro de una transacción deshecha.
-- Los datos nuevos del Rumble (pase con id 't1b' y pasePvp) se suben AL DESPLEGAR la versión que los usa:
--   python herramientas/subir_datos.py rumble  y ejecutar servidor/datos/rumble.sql

-- la clave de los puntos de un pase en monedero.extra
create or replace function public._pase_clave(p jsonb, pre text default 'pase_xp') returns text
language sql immutable set search_path = '' as $$
  select case when p is null or p->>'id' is null then pre else pre || '_' || (p->>'id') end;
$$;
-- el principio de las claves de cobro de un pase en reclamos
create or replace function public._pase_pre(p jsonb, pre text default 'pase') returns text
language sql immutable set search_path = '' as $$
  select case when p is null or p->>'id' is null then pre || ':' else pre || ':' || (p->>'id') || ':' end;
$$;

create or replace function public._evento(p_u uuid, p_juego text, p_d jsonb, p_ev jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  tipo text := p_ev->>'tipo'; P jsonb := p_d->'premios'; ex jsonb; hoy date := (now() at time zone 'Europe/Madrid')::date;
  per text; periodo text; n int; o bigint := 0; g bigint := 0; t bigint := 0; k text; i int; fam text; gm int; cl text;
  xp int; lv int; pista text; dia int; ult date; gap int; best int; rw jsonb; xpper int; niveles int;
  PS jsonb; kxp text; pre text; mov text;
begin
  select m.extra into ex from public.monedero m where m.usuario = p_u and m.juego = p_juego;
  ex := coalesce(ex, '{}'::jsonb);
  if P is null then return jsonb_build_object('ok', false); end if;

  if tipo = 'mision' then
    periodo := p_ev->>'periodo'; k := p_ev->>'id';
    if periodo not in ('d', 'w') or k is null or not coalesce(P->'misiones'->periodo ? k, false) then return jsonb_build_object('ok', false); end if;
    per := case when periodo = 'd' then hoy::text else (date_trunc('week', now() at time zone 'Europe/Madrid')::date)::text end;
    select count(*) into n from public.reclamos c where c.usuario = p_u and c.juego = p_juego and c.clave like 'mision:' || periodo || ':' || per || ':%';
    if n >= coalesce((P->'mision'->'n'->>periodo)::int, 4) then return jsonb_build_object('ok', false); end if;
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'mision:' || periodo || ':' || per || ':' || k) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 0 then return jsonb_build_object('ok', false); end if;
    rw := P->'mision'->'r'->k;   -- premio propio de esta misión (si lo tiene): [oro, gemas, xp de pase]
    if rw is not null and jsonb_typeof(rw) = 'array' then
      o := coalesce((rw->>0)::bigint, 0); g := coalesce((rw->>1)::bigint, 0); xp := coalesce((rw->>2)::int, 0);
    else
      o := coalesce((P->'mision'->periodo->>0)::bigint, 0); g := coalesce((P->'mision'->periodo->>1)::bigint, 0);
      xp := coalesce((P->'mision'->'xp'->>periodo)::int, 0);
    end if;
    xpper := (P->'pase'->>'xpPer')::int; niveles := (P->'pase'->>'levels')::int; kxp := public._pase_clave(P->'pase');
    ex := jsonb_set(ex, array[kxp], to_jsonb(least(niveles * xpper, coalesce((ex->>kxp)::int, 0) + xp)));
    update public.monedero m set extra = ex where m.usuario = p_u and m.juego = p_juego;
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', 0, 'clave', 'mision-mov:' || periodo || ':' || per || ':' || k);

  elsif tipo = 'login' then
    ult := nullif(ex->'login'->>'last', '')::date;
    if ult = hoy then return jsonb_build_object('ok', false); end if;
    gap := case when ult is null then 0 else hoy - ult end;
    dia := coalesce((ex->'login'->>'day')::int, 0);
    dia := case when gap = 1 and dia < 7 then dia + 1 else 1 end;
    rw := P->'login'->(dia - 1);
    if rw is null then return jsonb_build_object('ok', false); end if;
    o := coalesce((rw->>'gold')::bigint, 0); g := coalesce((rw->>'gems')::bigint, 0); t := coalesce((rw->>'tickets')::bigint, 0);
    best := greatest(coalesce((ex->'login'->>'best')::int, 0), dia);
    ex := jsonb_set(ex, '{login}', jsonb_build_object('last', hoy::text, 'day', dia, 'best', best));
    update public.monedero m set extra = ex where m.usuario = p_u and m.juego = p_juego;
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', t, 'clave', 'login:' || hoy::text);

  elsif tipo in ('pase-premium', 'pase-pvp-premium') then
    PS := case when tipo = 'pase-premium' then P->'pase' else P->'pasePvp' end;
    if tipo = 'pase-pvp-premium' and (PS is null or PS->>'id' is null) then return jsonb_build_object('ok', false); end if;
    pre := public._pase_pre(PS, case when tipo = 'pase-premium' then 'pase' else 'pasepvp' end);
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, pre || 'premium') on conflict do nothing;
    return jsonb_build_object('ok', true, 'oro', 0, 'gemas', 0, 'entradas', 0, 'clave', replace(pre, ':', '-') || 'premium');

  elsif tipo in ('pase', 'pase-pvp') then
    PS := case when tipo = 'pase' then P->'pase' else P->'pasePvp' end;
    if tipo = 'pase-pvp' and (PS is null or PS->>'id' is null) then return jsonb_build_object('ok', false); end if;
    pista := p_ev->>'pista'; i := coalesce((p_ev->>'nivel')::int, 0);
    xpper := (PS->>'xpPer')::int; niveles := (PS->>'levels')::int;
    if pista not in ('free', 'paid') or xpper is null then return jsonb_build_object('ok', false); end if;
    kxp := public._pase_clave(PS, case when tipo = 'pase' then 'pase_xp' else 'pasepvp_xp' end);
    pre := public._pase_pre(PS, case when tipo = 'pase' then 'pase' else 'pasepvp' end);
    lv := least(niveles, floor(coalesce((ex->>kxp)::int, 0) / xpper)::int);
    if i < 1 or i > lv then return jsonb_build_object('ok', false); end if;
    if pista = 'paid' and not exists (select 1 from public.reclamos c where c.usuario = p_u and c.juego = p_juego and c.clave = pre || 'premium') then return jsonb_build_object('ok', false); end if;
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, pre || pista || ':' || i) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 0 then return jsonb_build_object('ok', false); end if;
    rw := PS->pista->(i - 1);
    o := coalesce((rw->>'gold')::bigint, 0); g := coalesce((rw->>'gems')::bigint, 0); t := coalesce((rw->>'tickets')::bigint, 0);
    mov := case when tipo = 'pase' then 'pase-mov:' else 'pasepvp-mov:' end || coalesce(PS->>'id' || ':', '');
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', t, 'clave', mov || pista || ':' || i);

  elsif tipo = 'logros' then
    if jsonb_typeof(p_ev->'claves') <> 'array' then return jsonb_build_object('ok', false); end if;
    for k in select jsonb_array_elements_text(p_ev->'claves') limit 80 loop
      fam := split_part(k, ':', 1);
      continue when split_part(k, ':', 2) !~ '^[0-9]{1,2}$';
      gm := (P->'logros'->fam->>(split_part(k, ':', 2)::int))::int;
      continue when gm is null;
      insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'logro:' || k) on conflict do nothing;
      get diagnostics n = row_count;
      if n = 1 then g := g + gm; end if;
    end loop;
    if g = 0 then return jsonb_build_object('ok', false); end if;
    return jsonb_build_object('ok', true, 'oro', 0, 'gemas', g, 'entradas', 0);
  end if;
  return jsonb_build_object('ok', false);
end $$;

-- los puntos del pase PvP de un jugador al cerrar una partida (lo llama pvp_cerrar)
create or replace function public._pase_pvp_xp(p_juego text, p_u uuid, p_ganador uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare PS jsonb; k text; xp int;
begin
  select t.datos->'premios'->'pasePvp' into PS from public.tablas_juego t where t.juego = p_juego;
  if PS is null or PS->>'id' is null or p_u is null then return; end if;
  if PS->>'fin' is not null and (now() at time zone 'Europe/Madrid')::date > (PS->>'fin')::date then return; end if;
  xp := case when p_ganador is not null and p_ganador = p_u then (PS->>'xpWin')::int else (PS->>'xpLose')::int end;
  k := public._pase_clave(PS, 'pasepvp_xp');
  update public.monedero w set extra = jsonb_set(coalesce(w.extra, '{}'::jsonb), array[k],
      to_jsonb(least((PS->>'levels')::int * (PS->>'xpPer')::int, coalesce((w.extra->>k)::int, 0) + coalesce(xp, 0))))
    where w.usuario = p_u and w.juego = p_juego;
end $$;

revoke all on function public._pase_clave(jsonb, text), public._pase_pre(jsonb, text), public._evento(uuid, text, jsonb, jsonb), public._pase_pvp_xp(text, uuid, uuid) from public, anon, authenticated;

-- anotar: los puntos del pase por partida van a la clave de la temporada
do $$
declare d text;
begin
  select pg_get_functiondef('public.anotar(text, jsonb)'::regprocedure) into d;
  if position('_pase_clave' in d) = 0 then
    d := replace(d, '''{pase_xp}''', 'array[public._pase_clave(d->''premios''->''pase'')]');
    d := replace(d, '(w.extra->>''pase_xp'')', '(w.extra->>public._pase_clave(d->''premios''->''pase''))');
    if position('_pase_clave' in d) = 0 then raise exception 'anotar: no se encontró el trozo del pase'; end if;
    execute d;
  end if;
end $$;

-- pvp_cerrar: al cerrar una partida, los dos suman puntos del pase PvP
do $$
declare d text; viejo text := 'update public.pvp_sala set estado = ''cerrada'', ganador = ga where id = s.id;';
begin
  select pg_get_functiondef('public.pvp_cerrar(uuid, text, text)'::regprocedure) into d;
  if position('_pase_pvp_xp' in d) = 0 then
    if position(viejo in d) = 0 then raise exception 'pvp_cerrar: no se encontró dónde sumar el pase PvP'; end if;
    d := replace(d, viejo, viejo || E'\n  perform public._pase_pvp_xp(s.juego, s.a, ga); perform public._pase_pvp_xp(s.juego, s.b, ga);');
    execute d;
  end if;
end $$;
