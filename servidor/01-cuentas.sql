-- Fans Of · paso 1 del PLAN-CUENTAS.md: partidas en la nube.
-- Pegar entero en Supabase > SQL Editor > Run. Se puede ejecutar varias veces sin romper nada.

-- Una fila por jugador y juego. 'datos' es el SAVE tal cual.
create table if not exists public.partidas (
  usuario  uuid not null references auth.users on delete cascade,
  juego    text not null check (juego ~ '^[a-z0-9-]{1,32}$'),
  datos    jsonb not null,
  version  int  not null default 1,
  aparato  text,
  cambiado timestamptz not null default now(),
  primary key (usuario, juego)
);

-- Cada uno solo ve su partida. Escribir solo se hace con guardar_partida (abajo).
alter table public.partidas enable row level security;
drop policy if exists "leer lo mio" on public.partidas;
create policy "leer lo mio" on public.partidas for select using (auth.uid() = usuario);
revoke insert, update, delete, truncate, trigger, references on public.partidas from anon, authenticated;
grant select on public.partidas to authenticated;

-- Subir partida con control de choques: solo escribe si la versión de la nube es la que esperas.
-- Devuelve { ok, version } o, si hubo choque, { ok:false, version, datos } con la de la nube.
create or replace function public.guardar_partida(p_juego text, p_datos jsonb, p_version_esperada int, p_aparato text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  yo uuid := auth.uid();
  fila public.partidas;
begin
  if yo is null then raise exception 'sin sesion'; end if;
  if pg_column_size(p_datos) > 200 * 1024 then raise exception 'partida demasiado grande'; end if;

  select * into fila from public.partidas where usuario = yo and juego = p_juego for update;

  if not found then
    if coalesce(p_version_esperada, 0) <> 0 then
      return jsonb_build_object('ok', false, 'version', 0, 'datos', null);
    end if;
    insert into public.partidas (usuario, juego, datos, version, aparato) values (yo, p_juego, p_datos, 1, p_aparato);
    return jsonb_build_object('ok', true, 'version', 1);
  end if;

  if fila.version <> p_version_esperada then
    return jsonb_build_object('ok', false, 'version', fila.version, 'datos', fila.datos);
  end if;

  update public.partidas set datos = p_datos, version = fila.version + 1, aparato = p_aparato, cambiado = now()
   where usuario = yo and juego = p_juego;
  return jsonb_build_object('ok', true, 'version', fila.version + 1);
end $$;

revoke all on function public.guardar_partida(text, jsonb, int, text) from public, anon;
grant execute on function public.guardar_partida(text, jsonb, int, text) to authenticated;
