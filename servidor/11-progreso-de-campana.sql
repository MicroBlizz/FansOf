-- Fase 3, paso 3 de PLAN-CUENTAS (punto 15): el servidor lleva el progreso de la campaña y solo paga niveles que de verdad se pueden jugar.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «progreso_de_campana»).
-- Un premio de campaña solo se da si el nivel está abierto según lo que el servidor sabe (estrellas ya cobradas en `reclamos`, claves camp:<dif>:<nivel>:<1|2|3>):
--   · dentro de un mundo, el nivel L pide haber cobrado el L-1 (misma dificultad)
--   · mundo abierto: el primero siempre; los demás, haber pasado el último nivel del anterior (o el nivel `openAfter` del mundo) en Normal
--   · Difícil pide el último nivel de ese mundo en Normal; Mítica, en Difícil
--   · que un nivel sea jefe lo dice el servidor (datos.premios.mundos[].jefe), no el cliente
-- El progreso que ya tuvieran los jugadores se sube una vez con conciliar_progreso (misma puerta que conciliar: se cierra el 21-10-2026).
-- Las cuentas que aún no lo han subido no se comprueban hasta que la puerta se cierre; después, todas.
alter table public.monedero add column if not exists progreso_ok boolean not null default false;

create or replace function public._camp_abierto(p_u uuid, p_juego text, p_d jsonb, p_dif text, p_nivel text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  w int; l int; mundo jsonb; n_niv int; ok boolean := true; estricto boolean; previo text;
begin
  select (m.progreso_ok or not public.puerta_abierta()) into estricto from public.monedero m where m.usuario = p_u and m.juego = p_juego;
  if p_nivel !~ '^[0-9]{1,2}-[0-9]{1,2}$' or p_dif not in ('n', 'h', 'm') then return jsonb_build_object('ok', false, 'jefe', false); end if;
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
    if p_dif = 'h' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || w || '-4:1') then ok := false; end if;
    elsif p_dif = 'm' then
      if not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:h:' || w || '-4:1') then ok := false; end if;
    else
      previo := coalesce(mundo->>'openAfter', case when w > 1 then (w - 1) || '-4' end);
      if previo is not null and not exists (select 1 from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave = 'camp:n:' || previo || ':1') then ok := false; end if;
    end if;
  end if;
  return jsonb_build_object('ok', ok, 'jefe', coalesce((mundo->>'jefe')::int, 0) = l);
end $$;
revoke all on function public._camp_abierto(uuid, text, jsonb, text, text) from public, anon, authenticated;

-- Una vez por cuenta y juego: el progreso de campaña que ya tenía el jugador pasa al servidor (con la puerta abierta). Cerrada, solo marca la cuenta.
create or replace function public.conciliar_progreso(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m public.monedero; dif text; k text; x jsonb; st int; i int; campo text;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if m.progreso_ok then return public.estado(p_juego); end if;
  if public.puerta_abierta() then
    foreach dif in array array['n', 'h', 'm'] loop
      campo := case dif when 'n' then 'camp' when 'h' then 'campH' else 'campM' end;
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
