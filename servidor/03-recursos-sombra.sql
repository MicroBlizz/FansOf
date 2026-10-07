-- Fase 1 de PLAN-CUENTAS (punto 15): recursos en el servidor, en modo sombra (el cliente sigue mandando).
-- Ya aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «recursos_fase1_sombra»).
create table public.monedero (
  usuario uuid not null references auth.users on delete cascade,
  juego text not null,
  oro bigint not null default 0,
  gemas bigint not null default 0,
  entradas int not null default 0,
  garantia jsonb not null default '{}'::jsonb,
  migrado timestamptz not null default now(),
  cambiado timestamptz not null default now(),
  rev int not null default 0,
  primary key (usuario, juego)
);
create table public.movimientos (
  id bigserial primary key,
  usuario uuid not null references auth.users on delete cascade,
  juego text not null,
  motivo text not null,
  clave text not null,
  d_oro bigint not null default 0,
  d_gemas bigint not null default 0,
  d_entradas int not null default 0,
  nota jsonb,
  creado timestamptz not null default now(),
  unique (usuario, juego, clave)
);
create table public.inventario (
  usuario uuid not null references auth.users on delete cascade,
  juego text not null,
  uid text not null,
  tipo text not null,
  objeto text not null,
  calidades jsonb not null default '[]'::jsonb,
  creado timestamptz not null default now(),
  primary key (usuario, juego, uid)
);
create table public.cartas (
  usuario uuid not null references auth.users on delete cascade,
  juego text not null,
  carta text not null,
  nivel int not null default 1,
  xp int not null default 0,
  extra jsonb,
  primary key (usuario, juego, carta)
);
create table public.reclamos (
  usuario uuid not null references auth.users on delete cascade,
  juego text not null,
  clave text not null,
  creado timestamptz not null default now(),
  primary key (usuario, juego, clave)
);
alter table public.monedero enable row level security;
alter table public.movimientos enable row level security;
alter table public.inventario enable row level security;
alter table public.cartas enable row level security;
alter table public.reclamos enable row level security;
-- solo se puede LEER lo propio; escribir, solo con las funciones de abajo
create policy "leer lo mio" on public.monedero for select using (auth.uid() = usuario);
create policy "leer lo mio" on public.movimientos for select using (auth.uid() = usuario);
create policy "leer lo mio" on public.inventario for select using (auth.uid() = usuario);
create policy "leer lo mio" on public.cartas for select using (auth.uid() = usuario);
create policy "leer lo mio" on public.reclamos for select using (auth.uid() = usuario);
revoke insert, update, delete on public.monedero, public.movimientos, public.inventario, public.cartas, public.reclamos from anon, authenticated;

create or replace function public.estado(p_juego text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m public.monedero;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  select * into m from public.monedero where usuario = u and juego = p_juego;
  if not found then return null; end if;
  return jsonb_build_object(
    'oro', m.oro, 'gemas', m.gemas, 'entradas', m.entradas, 'garantia', m.garantia, 'rev', m.rev,
    'inventario', coalesce((select jsonb_agg(jsonb_build_object('u', i.uid, 'k', i.tipo, 'id', i.objeto, 'q', i.calidades)) from public.inventario i where i.usuario = u and i.juego = p_juego), '[]'::jsonb),
    'cartas', coalesce((select jsonb_object_agg(c.carta, jsonb_build_object('lvl', c.nivel, 'xp', c.xp, 'extra', c.extra)) from public.cartas c where c.usuario = u and c.juego = p_juego), '{}'::jsonb),
    'reclamos', coalesce((select jsonb_agg(r.clave) from public.reclamos r where r.usuario = u and r.juego = p_juego), '[]'::jsonb));
end $$;

-- Una sola vez por cuenta y juego: crea el monedero, el inventario y las cartas a partir de la partida local, con un tope de seguridad.
create or replace function public.migrar(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid();
  v_oro numeric; v_gemas numeric; v_ent numeric;
  tope_oro constant numeric := 20000000; tope_gemas constant numeric := 500000; tope_ent constant numeric := 10000;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if p_juego !~ '^[a-z0-9_-]{1,32}$' then raise exception 'juego_no_valido'; end if;
  if p_save is null or jsonb_typeof(p_save) <> 'object' then raise exception 'partida_no_valida'; end if;
  if exists (select 1 from public.monedero where usuario = u and juego = p_juego) then return public.estado(p_juego); end if;
  v_oro := case when jsonb_typeof(p_save->'gold') = 'number' then floor((p_save->>'gold')::numeric) else 0 end;
  v_gemas := case when jsonb_typeof(p_save->'gems') = 'number' then floor((p_save->>'gems')::numeric) else 0 end;
  v_ent := case when jsonb_typeof(p_save->'tickets') = 'number' then floor((p_save->>'tickets')::numeric) else 0 end;
  insert into public.monedero (usuario, juego, oro, gemas, entradas, garantia)
  values (u, p_juego, least(greatest(v_oro, 0), tope_oro), least(greatest(v_gemas, 0), tope_gemas), least(greatest(v_ent, 0), tope_ent),
          case when jsonb_typeof(p_save->'pity') = 'object' then p_save->'pity' else '{}'::jsonb end);
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas, nota)
  values (u, p_juego, 'migracion', 'migracion', least(greatest(v_oro, 0), tope_oro), least(greatest(v_gemas, 0), tope_gemas), least(greatest(v_ent, 0), tope_ent),
          jsonb_build_object('declarado', jsonb_build_object('oro', v_oro, 'gemas', v_gemas, 'entradas', v_ent)));
  if jsonb_typeof(p_save->'inv') = 'array' then
    insert into public.inventario (usuario, juego, uid, tipo, objeto, calidades)
    select u, p_juego, e->>'u', coalesce(e->>'k', ''), coalesce(e->>'id', ''), case when jsonb_typeof(e->'q') = 'array' then e->'q' else '[]'::jsonb end
    from (select e from jsonb_array_elements(p_save->'inv') e limit 5000) t(e)
    where jsonb_typeof(e) = 'object' and e->>'u' is not null
    on conflict do nothing;
  end if;
  if jsonb_typeof(p_save->'units') = 'object' then
    insert into public.cartas (usuario, juego, carta, nivel, xp, extra)
    select u, p_juego, k,
      least(greatest(case when jsonb_typeof(x->'lvl') = 'number' then floor((x->>'lvl')::numeric)::int else 1 end, 1), 100),
      least(greatest(case when jsonb_typeof(x->'xp') = 'number' then floor((x->>'xp')::numeric)::int else 0 end, 0), 100000000),
      case when jsonb_typeof(p_save->'cards') = 'object' then p_save->'cards'->k else null end
    from (select * from jsonb_each(p_save->'units') limit 2000) t(k, x)
    where jsonb_typeof(x) = 'object'
    on conflict do nothing;
  end if;
  return public.estado(p_juego);
end $$;

-- Modo sombra: el cliente cuenta lo que gana y gasta; el servidor lo apunta (sin validar) para poder compararlo.
create or replace function public.anotar(p_juego text, p_movs jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); e jsonb; n int := 0; filas int;
  lim constant numeric := 10000000;
  d_o bigint; d_g bigint; d_e int;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if jsonb_typeof(p_movs) <> 'array' then raise exception 'movimientos_no_validos'; end if;
  perform 1 from public.monedero where usuario = u and juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  for e in select x from jsonb_array_elements(p_movs) x limit 200 loop
    continue when jsonb_typeof(e) <> 'object' or coalesce(e->>'clave', '') = '' or length(e->>'clave') > 80;
    d_o := least(greatest(case when jsonb_typeof(e->'oro') = 'number' then floor((e->>'oro')::numeric) else 0 end, -lim), lim);
    d_g := least(greatest(case when jsonb_typeof(e->'gemas') = 'number' then floor((e->>'gemas')::numeric) else 0 end, -lim), lim);
    d_e := least(greatest(case when jsonb_typeof(e->'entradas') = 'number' then floor((e->>'entradas')::numeric) else 0 end, -1000), 1000);
    insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas)
    values (u, p_juego, left(coalesce(e->>'motivo', ''), 40), e->>'clave', d_o, d_g, d_e)
    on conflict (usuario, juego, clave) do nothing;
    get diagnostics filas = row_count;
    if filas = 1 then
      update public.monedero set oro = greatest(oro + d_o, 0), gemas = greatest(gemas + d_g, 0), entradas = greatest(entradas + d_e, 0),
        rev = rev + 1, cambiado = now() where usuario = u and juego = p_juego;
      n := n + 1;
    end if;
  end loop;
  return public.estado(p_juego) || jsonb_build_object('aplicados', n);
end $$;

revoke all on function public.estado(text), public.migrar(text, jsonb), public.anotar(text, jsonb) from public, anon;
grant execute on function public.estado(text), public.migrar(text, jsonb), public.anotar(text, jsonb) to authenticated;
