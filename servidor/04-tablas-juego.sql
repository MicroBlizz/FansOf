-- Cifras de cada juego que usa el servidor (probabilidades, costes, calidades, qué sale de cada rareza). Las sube herramientas/subir_datos.py.
-- Ya aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «tablas_juego»). Los datos están en servidor/datos/<juego>.sql.
create table public.tablas_juego (
  juego text primary key,
  version int not null default 1,
  datos jsonb not null,
  cambiado timestamptz not null default now()
);
alter table public.tablas_juego enable row level security;
-- son datos públicos (las probabilidades se enseñan al jugador): cualquiera con sesión las lee; nadie las escribe desde el cliente
create policy "leer todos" on public.tablas_juego for select to authenticated using (true);
revoke insert, update, delete on public.tablas_juego from anon, authenticated;
