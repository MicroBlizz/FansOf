-- Rumble v0.9.110: lo que los demás ven de ti (nombre, avatar, marco y título), comprobado por el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 9-10-2026 (migración «aspecto_publico»), probada antes dentro de una transacción deshecha; datos.look subidos (tablas_juego rumble v21).
-- 9-10-2026 (tarde): reaplicado el cambio de clasificacion después de que 23-mitica-semanal.sql la reescribiera; ese archivo ya lleva el look.
-- · _look_publico(usuario, juego): el nombre (_nombre_publico) y el avatar, la facción, el marco y el título de la partida guardada en la nube.
--   El marco y el título solo se enseñan si son de serie o si el servidor tiene apuntado el cobro del nivel del pase que los da
--   (tablas_juego.datos.look = { serie: { marco: [...], titulo: [...] }, de: { 'marco:billetes': ['pase:t1b:free:10', ...] } },
--   que sube herramientas/subir_datos.py). Si no, sale el marco de serie y ningún título: nadie presume de lo que no tiene.
-- · pvp_estado devuelve además 'rival_look'; pvp_clasificacion y clasificacion (Salón de la Fama) añaden 'look' a cada fila.
--   Solo se AÑADEN datos: las versiones de antes del juego los ignoran.
-- Las tres funciones se cambian leyendo su texto de la base de datos (como en el 20), sin reescribirlas enteras.

create or replace function public._look_publico(p_u uuid, p_juego text) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare d jsonb; L jsonb; av text; m text; t text;
begin
  select g.datos into d from public.partidas g where g.usuario = p_u and g.juego = p_juego;
  select x.datos->'look' into L from public.tablas_juego x where x.juego = p_juego;
  d := coalesce(d, '{}'::jsonb);
  av := d->>'avatar'; if av !~ '^[A-Za-z0-9_]{1,24}$' then av := null; end if;
  if L is null then
    return jsonb_build_object('nombre', public._nombre_publico(p_u, p_juego), 'avatar', av, 'fac', coalesce(d->>'lastFac', d->>'fac'));
  end if;
  m := d->'look'->>'marco'; t := d->'look'->>'titulo';
  -- marco: de serie o cobrado en el pase que lo da
  if m is null or m !~ '^[a-z0-9_]{1,24}$' or not (
       coalesce(L->'serie'->'marco' ? m, false)
       or exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego
                   and r.clave in (select jsonb_array_elements_text(coalesce(L->'de'->('marco:' || m), '[]'::jsonb))))) then
    m := L->'serie'->'marco'->>0;
  end if;
  -- título: sin elegir todavía → el de serie; '' → ninguno; uno que no es tuyo → ninguno
  if d->'look' is null or not (d->'look' ? 'titulo') then t := L->'serie'->'titulo'->>0;
  elsif t is null or t = '' or t !~ '^[a-z0-9_]{1,24}$' then t := null;
  elsif not (coalesce(L->'serie'->'titulo' ? t, false)
       or exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego
                   and r.clave in (select jsonb_array_elements_text(coalesce(L->'de'->('titulo:' || t), '[]'::jsonb))))) then
    t := null;
  end if;
  return jsonb_build_object('nombre', public._nombre_publico(p_u, p_juego), 'avatar', av, 'fac', coalesce(d->>'lastFac', d->>'fac'), 'marco', m, 'titulo', t);
end $$;
revoke all on function public._look_publico(uuid, text) from public, anon, authenticated;

-- pvp_estado: el aspecto del rival
do $$
declare d text; viejo text := '''nombre_rival'', public._nombre_publico(otro, s.juego)';
begin
  select pg_get_functiondef('public.pvp_estado()'::regprocedure) into d;
  if position('_look_publico' in d) = 0 then
    if position(viejo in d) = 0 then raise exception 'pvp_estado: no se encontró nombre_rival'; end if;
    execute replace(d, viejo, viejo || ', ''rival_look'', public._look_publico(otro, s.juego)');
  end if;
end $$;

-- pvp_clasificacion: el aspecto de cada fila
do $$
declare d text; viejo text := '''nombre'', public._nombre_publico(p.usuario, p_juego),';
begin
  select pg_get_functiondef('public.pvp_clasificacion(text, text)'::regprocedure) into d;
  if position('_look_publico' in d) = 0 then
    if position(viejo in d) = 0 then raise exception 'pvp_clasificacion: no se encontró el nombre'; end if;
    execute replace(d, viejo, viejo || ' ''look'', public._look_publico(p.usuario, p_juego),');
  end if;
end $$;

-- clasificacion (Salón de la Fama): el aspecto de cada fila
do $$
declare d text; viejo text := '''nombre'', public._nombre_publico(p.usuario, p_juego),';
begin
  select pg_get_functiondef('public.clasificacion(text, text)'::regprocedure) into d;
  if position('_look_publico' in d) = 0 then
    if position(viejo in d) = 0 then raise exception 'clasificacion: no se encontró el nombre'; end if;
    execute replace(d, viejo, viejo || E'\n             ''look'', public._look_publico(p.usuario, p_juego),');
  end if;
end $$;
