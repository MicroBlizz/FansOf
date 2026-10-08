-- Rumble v0.9.71: cupos de anuncio por SEMANA (el de cambiar misiones semanales, «swapw»: 6 a la semana, se pueden gastar todos el mismo día).
-- · _gastar_anuncio: si el cupo está en datos.premios.anuncios.semana, se cuenta de lunes a domingo (reclamos 'adw:<lunes>:<cupo>:<n>')
--   y no entra en el total de anuncios del día; los demás cupos siguen igual ('ad:<día>:<cupo>:<n>').
-- · _evento_horas: acepta 'swapw' igual que 'swap' (no da nada: solo gasta el cupo). Solo se cambia esa línea; el resto de la función
--   (que ha crecido desde 13 y 14) queda tal cual. Si la línea no está como se espera, no se toca nada.
-- Compatible con versiones anteriores del juego: los cupos de siempre no cambian.

create or replace function public._gastar_anuncio(p_u uuid, p_juego text, p_P jsonb, p_slot text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  hoy text := ((now() at time zone 'Europe/Madrid')::date)::text;
  lunes text := (date_trunc('week', now() at time zone 'Europe/Madrid')::date)::text;
  semanal boolean := coalesce(p_P->'anuncios'->'semana' ? p_slot, false);
  pre text; mx int; tot int; i int; n int;
begin
  mx := (p_P->'anuncios'->'slots'->>p_slot)::int;
  if mx is null then return false; end if;
  if semanal then
    pre := 'adw:' || lunes;
  else
    pre := 'ad:' || hoy;
    select count(*) into tot from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave like 'ad:' || hoy || ':%';
    if tot >= coalesce((p_P->'anuncios'->>'dayMax')::int, 30) then return false; end if;
  end if;
  for i in 1..mx loop
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, pre || ':' || p_slot || ':' || i) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 1 then return true; end if;
  end loop;
  return false;
end $$;
revoke all on function public._gastar_anuncio(uuid, text, jsonb, text) from public, anon, authenticated;

do $$
declare
  f text := pg_get_functiondef('public._evento_horas(uuid,text,jsonb,jsonb,jsonb,numeric)'::regprocedure);
  viejo text := $v$elsif slot = 'swap' then null;$v$;
  nuevo text := $v$elsif slot in ('swap', 'swapw') then null;$v$;
begin
  if position(nuevo in f) > 0 then return; end if;   -- ya aplicada
  if position(viejo in f) = 0 then raise exception '_evento_horas no tiene la línea esperada: no se cambia nada'; end if;
  execute replace(f, viejo, nuevo);
end $$;
revoke all on function public._evento_horas(uuid, text, jsonb, jsonb, jsonb, numeric) from public, anon, authenticated;
