-- Fase 2, paso 4 de PLAN-CUENTAS (punto 15): despedir, volver a tirar los números y mejorar cartas las hace el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «economia_paso4»).
-- Costes, valores y calidades salen de public.tablas_juego (econ.scrap, reroll, goldCost, xpNeed, maxLvl, maxStars; calidades; habilidades y objetos).
-- La experiencia de las cartas la sigue contando el cliente (p_xp) hasta la fase 3 (recompensas con tope).
alter table public.monedero add column if not exists conciliado boolean not null default false;

-- Una vez por cuenta y juego: lo que el cliente tiene y el servidor no (copias y niveles anteriores a este paso) se añade, con topes. Desde ahí manda el servidor.
create or replace function public.conciliar(p_juego text, p_save jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m public.monedero; d jsonb; max_lvl int; max_st int;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if m.conciliado then return public.estado(p_juego); end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  if d is null then raise exception 'sin_datos_del_juego'; end if;
  max_lvl := (d->'econ'->>'maxLvl')::int; max_st := coalesce((d->'econ'->>'maxStars')::int, 5);
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
      least(greatest(case when jsonb_typeof(x->'lvl') = 'number' then floor((x->>'lvl')::numeric)::int else 1 end, 1), max_lvl),
      0, null
    from (select * from jsonb_each(p_save->'units') limit 2000) t(k, x)
    where jsonb_typeof(x) = 'object'
    on conflict (usuario, juego, carta) do update set nivel = greatest(public.cartas.nivel, excluded.nivel);
  end if;
  if jsonb_typeof(p_save->'cards') = 'object' then
    insert into public.cartas (usuario, juego, carta, nivel, xp, extra)
    select u, p_juego, k, 1, 0, jsonb_build_object('n', least(greatest(coalesce((x->>'n')::int, 1), 0), 100000), 'st', least(greatest(coalesce((x->>'st')::int, 0), 0), max_st))
    from (select * from jsonb_each(p_save->'cards') limit 2000) t(k, x)
    where jsonb_typeof(x) = 'object'
    on conflict (usuario, juego, carta) do update set extra = jsonb_build_object(
      'n', greatest(coalesce((public.cartas.extra->>'n')::int, 0), (excluded.extra->>'n')::int),
      'st', greatest(coalesce((public.cartas.extra->>'st')::int, 0), (excluded.extra->>'st')::int));
  end if;
  update public.monedero w set conciliado = true, rev = w.rev + 1 where w.usuario = u and w.juego = p_juego;
  return public.estado(p_juego);
end $$;

-- calidad -> tramo (igual que tierOf del cliente)
create or replace function public.tramo_calidad(p_q jsonb) returns int
language sql immutable set search_path = '' as $$
  select case when a >= 1 then 4 when a >= 0.88 then 3 when a >= 0.7 then 2 when a >= 0.4 then 1 else 0 end
  from (select coalesce(avg(v::numeric), 0) a from jsonb_array_elements_text(p_q) v) s;
$$;

create or replace function public.despedir(p_juego text, p_uids text[], p_clave text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); m public.monedero; d jsonb; E jsonb; r record; def jsonb; total bigint := 0; n int := 0; mult numeric[] := array[1, 1.5, 2, 3, 5];
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if coalesce(p_clave, '') = '' or length(p_clave) > 80 then raise exception 'clave_no_valida'; end if;
  if coalesce(array_length(p_uids, 1), 0) not between 1 and 500 then raise exception 'lista_no_valida'; end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  if d is null then raise exception 'sin_datos_del_juego'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if not m.conciliado then raise exception 'sin_conciliar'; end if;
  if exists (select 1 from public.movimientos mv where mv.usuario = u and mv.juego = p_juego and mv.clave = p_clave) then raise exception 'repetida'; end if;
  E := d->'econ';
  for r in select i.uid, i.tipo, i.objeto, i.calidades from public.inventario i where i.usuario = u and i.juego = p_juego and i.uid = any (p_uids) for update loop
    def := case when r.tipo = 'ab' then d->'habilidades'->r.objeto else d->'objetos'->r.objeto end;
    if def is null or (def->>'pass')::boolean then continue; end if;
    total := total + round((E->'scrap'->>(def->>'rar'))::numeric * mult[1 + public.tramo_calidad(r.calidades)])::bigint;
    delete from public.inventario i where i.usuario = u and i.juego = p_juego and i.uid = r.uid;
    n := n + 1;
  end loop;
  if n = 0 then raise exception 'nada_que_despedir'; end if;
  update public.monedero w set oro = w.oro + total, rev = w.rev + 1, cambiado = now() where w.usuario = u and w.juego = p_juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, origen_servidor) values (u, p_juego, 'despedir', p_clave, total, true);
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego;
  return jsonb_build_object('despedidas', n, 'oro_ganado', total, 'oro', m.oro, 'gemas', m.gemas, 'entradas', m.entradas);
end $$;

create or replace function public.retirar_numeros(p_juego text, p_uid text, p_clave text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); m public.monedero; d jsonb; E jsonb; Q jsonb; it public.inventario; def jsonb; coste int; qs jsonb := '[]'::jsonb;
  s numeric; x numeric; qv numeric; tier int; j int;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if coalesce(p_clave, '') = '' or length(p_clave) > 80 then raise exception 'clave_no_valida'; end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  if d is null then raise exception 'sin_datos_del_juego'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if not m.conciliado then raise exception 'sin_conciliar'; end if;
  if exists (select 1 from public.movimientos mv where mv.usuario = u and mv.juego = p_juego and mv.clave = p_clave) then raise exception 'repetida'; end if;
  select * into it from public.inventario i where i.usuario = u and i.juego = p_juego and i.uid = p_uid for update;
  if not found then raise exception 'copia_no_existe'; end if;
  def := case when it.tipo = 'ab' then d->'habilidades'->it.objeto else d->'objetos'->it.objeto end;
  if def is null or (def->>'pass')::boolean then raise exception 'no_se_puede'; end if;
  E := d->'econ'; Q := d->'calidades'; coste := (E->'reroll'->>(def->>'rar'))::int;
  if m.oro < coste then raise exception 'falta_oro'; end if;
  for j in 1..greatest(1, jsonb_array_length(it.calidades)) loop
    s := 0; for tier in 0..jsonb_array_length(Q) - 1 loop s := s + (Q->tier->>'p')::numeric; end loop;
    x := random() * s; qv := 1;
    for tier in 0..jsonb_array_length(Q) - 1 loop
      if x < (Q->tier->>'p')::numeric then
        qv := floor(((Q->tier->>'lo')::numeric + random() * ((Q->tier->>'hi')::numeric - (Q->tier->>'lo')::numeric)) * 1000) / 1000; exit;
      end if;
      x := x - (Q->tier->>'p')::numeric;
    end loop;
    qs := qs || to_jsonb(qv);
  end loop;
  update public.inventario i set calidades = qs where i.usuario = u and i.juego = p_juego and i.uid = p_uid;
  update public.monedero w set oro = w.oro - coste, rev = w.rev + 1, cambiado = now() where w.usuario = u and w.juego = p_juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, origen_servidor) values (u, p_juego, 'retirar-numeros', p_clave, -coste, true);
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego;
  return jsonb_build_object('q', qs, 'oro', m.oro, 'gemas', m.gemas, 'entradas', m.entradas);
end $$;

create or replace function public.mejorar_carta(p_juego text, p_carta text, p_xp int, p_clave text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare u uuid := auth.uid(); m public.monedero; d jsonb; E jsonb; c public.cartas; coste int; necesita int; max_lvl int;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if coalesce(p_clave, '') = '' or length(p_clave) > 80 then raise exception 'clave_no_valida'; end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  if d is null then raise exception 'sin_datos_del_juego'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if not m.conciliado then raise exception 'sin_conciliar'; end if;
  if exists (select 1 from public.movimientos mv where mv.usuario = u and mv.juego = p_juego and mv.clave = p_clave) then raise exception 'repetida'; end if;
  E := d->'econ'; max_lvl := (E->>'maxLvl')::int;
  select * into c from public.cartas ct where ct.usuario = u and ct.juego = p_juego and ct.carta = p_carta for update;
  if not found then
    insert into public.cartas (usuario, juego, carta, nivel, xp) values (u, p_juego, p_carta, 1, 0) returning * into c;
  end if;
  if c.nivel >= max_lvl then raise exception 'nivel_maximo'; end if;
  necesita := (E->'xpNeed'->>c.nivel)::int; coste := (E->'goldCost'->>c.nivel)::int;
  if coalesce(p_xp, 0) < necesita then raise exception 'falta_xp'; end if;   -- la xp aún la cuenta el cliente (fase 3)
  if m.oro < coste then raise exception 'falta_oro'; end if;
  update public.cartas ct set nivel = ct.nivel + 1 where ct.usuario = u and ct.juego = p_juego and ct.carta = p_carta;
  update public.monedero w set oro = w.oro - coste, rev = w.rev + 1, cambiado = now() where w.usuario = u and w.juego = p_juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_oro, origen_servidor) values (u, p_juego, 'mejorar-carta', p_clave, -coste, true);
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego;
  return jsonb_build_object('nivel', c.nivel + 1, 'xp_gastada', necesita, 'oro', m.oro, 'gemas', m.gemas, 'entradas', m.entradas);
end $$;

revoke all on function public.conciliar(text, jsonb), public.despedir(text, text[], text), public.retirar_numeros(text, text, text), public.mejorar_carta(text, text, int, text), public.tramo_calidad(jsonb) from public, anon;
grant execute on function public.conciliar(text, jsonb), public.despedir(text, text[], text), public.retirar_numeros(text, text, text), public.mejorar_carta(text, text, int, text) to authenticated;
