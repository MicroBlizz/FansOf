-- Rumble 0.9.55: la campaña tiene cinco dificultades: f (Fácil), n (Normal), h (Difícil), x (Heroica) y m (Mítica).
-- APLICADO el 9-10-2026 dentro de 24-mitica-paga-y-facil-heroica.sql (allí está su anotar definitiva). Era para la 0.9.55:
-- y subir también servidor/datos/rumble.sql (trae los multiplicadores de premio de f y x y los logros nuevos de la Heroica).
-- Si se publica el juego antes, las partidas en Fácil y Heroica no cobran premio (el servidor las rechaza).
--
-- Reglas que comprueba el servidor (las mismas que el juego, games/rumble/js/10-dificultad.js):
--   · Fácil: el mundo está abierto si lo está en Normal, o si se ganó en Fácil el jefe del mundo anterior (o el nivel openAfter).
--   · Heroica: pide el último nivel de ese mundo ganado en Difícil.
--   · Mítica: pide el último nivel ganado en Heroica; quien ya tenía alguna estrella en Mítica en ese mundo lo sigue teniendo abierto.
--   · Dentro de un mundo, como siempre: el nivel L pide el L-1 en la misma dificultad.

-- 1) _camp_abierto: entiende f y x (sustituye a la de 11-progreso-de-campana.sql)
create or replace function public._camp_abierto(p_u uuid, p_juego text, p_d jsonb, p_dif text, p_nivel text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  w int; l int; mundo jsonb; n_niv int; ok boolean := true; estricto boolean; previo text;
begin
  select (m.progreso_ok or not public.puerta_abierta()) into estricto from public.monedero m where m.usuario = p_u and m.juego = p_juego;
  if p_nivel !~ '^[0-9]{1,2}-[0-9]{1,2}$' or p_dif not in ('f', 'n', 'h', 'x', 'm') then return jsonb_build_object('ok', false, 'jefe', false); end if;
  w := split_part(p_nivel, '-', 1)::int; l := split_part(p_nivel, '-', 2)::int;
  mundo := p_d->'premios'->'mundos'->(w - 1);
  if mundo is null or jsonb_typeof(mundo) <> 'object' then
    return jsonb_build_object('ok', false, 'jefe', false);   -- sin tabla de mundos: no se puede comprobar
  end if;
  n_niv := (mundo->>'niveles')::int;
  if l < 1 or l > n_niv then return jsonb_build_object('ok', false, 'jefe', false); end if;
  if coalesce(estricto, true) then
    -- nivel anterior del mismo mundo
    if l > 1 and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:' || p_dif || ':' || w || '-' || (l - 1) || ':1') then ok := false; end if;
    -- mundo abierto
    previo := coalesce(mundo->>'openAfter', case when w > 1 then (w - 1) || '-4' end);
    if p_dif = 'h' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || w || '-4:1') then ok := false; end if;
    elsif p_dif = 'x' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:h:' || w || '-4:1') then ok := false; end if;
    elsif p_dif = 'm' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego
                     and (r.clave = 'camp:x:' || w || '-4:1' or r.clave like 'camp:m:' || w || '-%:1')) then ok := false; end if;
    elsif p_dif = 'f' then
      if previo is not null and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego
                     and r.clave in ('camp:n:' || previo || ':1', 'camp:f:' || previo || ':1')) then ok := false; end if;
    else
      if previo is not null and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || previo || ':1') then ok := false; end if;
    end if;
  end if;
  return jsonb_build_object('ok', ok, 'jefe', coalesce((mundo->>'jefe')::int, 0) = l);
end $$;
revoke all on function public._camp_abierto(uuid, text, jsonb, text, text) from public, anon, authenticated;

-- 2) conciliar_progreso: también sube las estrellas de Fácil (campF) y Heroica (campX)
create or replace function public.conciliar_progreso(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m public.monedero; dif text; k text; x jsonb; st int; i int; campo text;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if m.progreso_ok then return public.estado(p_juego); end if;
  if public.puerta_abierta() then
    foreach dif in array array['f', 'n', 'h', 'x', 'm'] loop
      campo := case dif when 'f' then 'campF' when 'n' then 'camp' when 'h' then 'campH' when 'x' then 'campX' else 'campM' end;
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

-- 3) anotar: acepta los premios de campaña con dif f y x. Se cambia solo esa línea sobre la función que haya AHORA en la base
--    (así no se pisa ningún otro cambio que tenga). Si no encuentra la línea, para y no toca nada.
do $$
declare def text; viejo text := 'not in (''n'', ''h'', ''m'')'; nuevo text := 'not in (''f'', ''n'', ''h'', ''x'', ''m'')';
begin
  def := pg_get_functiondef('public.anotar(text, jsonb)'::regprocedure);
  if position(nuevo in def) > 0 then raise notice 'anotar ya acepta f y x: no se toca'; return; end if;
  if position(viejo in def) = 0 then raise exception 'anotar no tiene la lista de dificultades esperada: revisar a mano'; end if;
  execute replace(def, viejo, nuevo);
end $$;
