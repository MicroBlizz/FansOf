-- La puerta de entrada de las partidas locales (migrar y conciliar) se cierra sola en una fecha. Después:
--  · migrar: una cuenta nueva empieza con lo de econ.start y sin copias ni niveles (ignora lo que mande el cliente)
--  · conciliar: solo marca la cuenta como conciliada, sin añadir nada
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «cerrar_puerta_migracion»). Fecha: 21-10-2026 a las 00:00 UTC.
-- Para moverla:  update public.ajustes_servidor set valor = timestamptz '…' where clave = 'puerta_migracion';
create table if not exists public.ajustes_servidor (clave text primary key, valor timestamptz not null);
alter table public.ajustes_servidor enable row level security;   -- sin políticas: el cliente no la ve ni la toca
revoke all on public.ajustes_servidor from anon, authenticated;
insert into public.ajustes_servidor (clave, valor) values ('puerta_migracion', timestamptz '2026-10-21 00:00:00+00') on conflict (clave) do nothing;

create or replace function public.puerta_abierta() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select now() < valor from public.ajustes_servidor where clave = 'puerta_migracion'), false);
$$;
revoke all on function public.puerta_abierta() from public, anon, authenticated;

alter function public.migrar(text, jsonb) rename to migrar_abierta;
alter function public.conciliar(text, jsonb) rename to conciliar_abierta;
revoke all on function public.migrar_abierta(text, jsonb), public.conciliar_abierta(text, jsonb) from public, anon, authenticated;

create or replace function public.migrar(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); d jsonb;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if public.puerta_abierta() then return public.migrar_abierta(p_juego, p_save); end if;
  if p_juego !~ '^[a-z0-9_-]{1,32}$' then raise exception 'juego_no_valido'; end if;
  if exists (select 1 from public.monedero where usuario = u and juego = p_juego) then return public.estado(p_juego); end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  insert into public.monedero (usuario, juego, oro, gemas, conciliado)
  values (u, p_juego, coalesce((d->'econ'->'start'->>'gold')::bigint, 0), coalesce((d->'econ'->'start'->>'gems')::bigint, 0), true);
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas)
  values (u, p_juego, 'inicio', 'inicio', coalesce((d->'econ'->'start'->>'gold')::bigint, 0), coalesce((d->'econ'->'start'->>'gems')::bigint, 0));
  -- ignorada: la puerta está cerrada y no se ha mirado la partida local; el cliente vuelve a mandar lo que ganó sin conexión como movimientos
  return public.estado(p_juego) || jsonb_build_object('ignorada', true);   -- (migración «migrar_avisa_si_ignora»)
end $$;

create or replace function public.conciliar(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if public.puerta_abierta() then return public.conciliar_abierta(p_juego, p_save); end if;
  update public.monedero w set conciliado = true where w.usuario = u and w.juego = p_juego and not w.conciliado;
  if not found and not exists (select 1 from public.monedero where usuario = u and juego = p_juego) then raise exception 'sin_monedero'; end if;
  return public.estado(p_juego);
end $$;
revoke all on function public.migrar(text, jsonb), public.conciliar(text, jsonb) from public, anon;
grant execute on function public.migrar(text, jsonb), public.conciliar(text, jsonb) to authenticated;
