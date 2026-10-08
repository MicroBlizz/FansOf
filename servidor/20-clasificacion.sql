-- Fans Of v0.9.91: el SALÓN DE LA FAMA (clasificación mundial de cada juego). Aplicado el 9-10-2026.
--
-- clasificacion(p_juego, p_tabla) devuelve { lista: [los 50 primeros], yo: tu fila (aunque estés el 5.000) o null, total: cuántos hay }.
-- Solo cuenta lo que el servidor ya sabe y no se puede trucar desde el móvil:
--   · 'campana': estrellas de campaña cobradas (claves camp:<dif>:<nivel>:<1|2|3> de `reclamos`), en todas las dificultades.
--                Desempata la dificultad más alta con alguna estrella (f < n < h < x < m) y, después, quien llegó antes.
--   · 'poder':   la suma de los niveles de todas tus cartas (`cartas`). Desempata cuántas cartas has subido por encima del nivel 1.
--                (Todas las cuentas tienen una fila por carta desde el principio, así que todas parten del mismo poder.)
-- El nombre y el retrato salen de la partida guardada en la nube (`partidas`): si no hay nombre, «Fan#XXXX».
-- Igual que el PvP, las cuentas marcadas por tramposas (`cuentas_marca`) solo se ven entre ellas.
-- Cada juego elige qué pestañas enseña; para una nueva (por ejemplo, el récord de Survivors) se añade otro «when» aquí.
create or replace function public.clasificacion(p_juego text, p_tabla text) returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare u uuid := auth.uid(); b boolean; res jsonb;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if p_tabla not in ('campana', 'poder') then raise exception 'tabla_no_valida'; end if;
  select coalesce(m.marcado, false) into b from public.cuentas_marca m where m.usuario = u; b := coalesce(b, false);

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
             'nombre', coalesce(nullif(left(btrim(regexp_replace(g.datos->>'name', '[^[:alnum:] _.\-]', '', 'g')), 14), ''),
                                'Fan#' || upper(substr(replace(p.usuario::text, '-', ''), 1, 4))),
             'avatar', g.datos->>'avatar', 'fac', coalesce(g.datos->>'lastFac', g.datos->>'fac'),
             'valor', p.valor, 'extra', p.extra, 'yo', p.usuario = u) as fila
      from puestos p left join public.partidas g on g.usuario = p.usuario and g.juego = p_juego
  )
  select jsonb_build_object(
           'lista', coalesce((select jsonb_agg(f.fila order by f.puesto) from filas f where f.puesto <= 50), '[]'::jsonb),
           'yo', (select f.fila from filas f where f.usuario = u),
           'total', (select count(*) from puestos))
    into res;
  return res;
end $$;

revoke all on function public.clasificacion(text, text) from public, anon;
grant execute on function public.clasificacion(text, text) to authenticated;
