-- BORRADOR, SIN APLICAR (PLAN-TIENDA.md). Tienda con dinero real: productos, compras y entrega.
-- Solo la usa la Edge Function `pagos` con la clave de servicio; los jugadores no pueden ejecutar nada de aquí.
create table if not exists public.productos (
  id text primary key,
  juego text not null,
  nombre text not null,
  precio_eur numeric(8,2) not null check (precio_eur > 0),
  oro bigint not null default 0,
  gemas bigint not null default 0,
  entradas int not null default 0,
  pase boolean not null default false,
  activo boolean not null default false
);
create table if not exists public.compras (
  id text primary key,                       -- id del pago en el proveedor: una compra no se entrega dos veces
  usuario uuid not null references auth.users on delete cascade,
  juego text not null,
  producto text not null references public.productos(id),
  eur numeric(8,2) not null,
  pais text,
  estado text not null default 'pagada' check (estado in ('pagada','reembolsada')),
  creado timestamptz not null default now()
);
alter table public.productos enable row level security;
alter table public.compras enable row level security;
create policy "ver mis compras" on public.compras for select to authenticated using (usuario = auth.uid());
create policy "ver productos" on public.productos for select to authenticated using (activo);
revoke all on public.productos, public.compras from anon, authenticated;
grant select on public.productos, public.compras to authenticated;

create table if not exists public.paises_bloqueados (pais text primary key);
insert into public.paises_bloqueados values ('BE'), ('NL') on conflict do nothing;
alter table public.paises_bloqueados enable row level security;
revoke all on public.paises_bloqueados from anon, authenticated;

create or replace function public.entregar_compra(p_id text, p_usuario uuid, p_producto text, p_pais text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare pr public.productos;
begin
  select * into pr from public.productos where id = p_producto and activo;
  if pr.id is null then return jsonb_build_object('ok', false, 'error', 'producto'); end if;
  if exists (select 1 from public.paises_bloqueados where pais = upper(coalesce(p_pais, ''))) then return jsonb_build_object('ok', false, 'error', 'pais'); end if;
  insert into public.compras (id, usuario, juego, producto, eur, pais) values (p_id, p_usuario, pr.juego, pr.id, pr.precio_eur, p_pais) on conflict do nothing;
  if not found then return jsonb_build_object('ok', true, 'repetida', true); end if;
  insert into public.monedero (usuario, juego) values (p_usuario, pr.juego) on conflict do nothing;
  update public.monedero set oro = oro + pr.oro, gemas = gemas + pr.gemas, entradas = entradas + pr.entradas, cambiado = now(), rev = rev + 1
    where usuario = p_usuario and juego = pr.juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas)
    values (p_usuario, pr.juego, 'compra-real', 'pago:' || p_id, pr.oro, pr.gemas, pr.entradas);
  if pr.pase then insert into public.reclamos (usuario, juego, clave) values (p_usuario, pr.juego, 'pase:premium') on conflict do nothing; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.revertir_compra(p_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c public.compras; pr public.productos;
begin
  select * into c from public.compras where id = p_id and estado = 'pagada';
  if c.id is null then return jsonb_build_object('ok', true, 'nada', true); end if;
  select * into pr from public.productos where id = c.producto;
  update public.compras set estado = 'reembolsada' where id = p_id;
  update public.monedero set oro = oro - pr.oro, gemas = gemas - pr.gemas, entradas = entradas - pr.entradas, cambiado = now(), rev = rev + 1
    where usuario = c.usuario and juego = c.juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas)
    values (c.usuario, c.juego, 'reembolso', 'reembolso:' || p_id, -pr.oro, -pr.gemas, -pr.entradas) on conflict do nothing;
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.entregar_compra(text, uuid, text, text), public.revertir_compra(text) from public, anon, authenticated;
grant execute on function public.entregar_compra(text, uuid, text, text), public.revertir_compra(text) to service_role;
