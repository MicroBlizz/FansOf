-- Fans Of · Gashapón de habilidades y objetos (octubre de 2026): menos legendarias y respeto a los flags. Se aplica en Supabase (SQL editor o migración).
-- Cambia public.tirar y public._rolar_objeto (copia de 17-rareza-comun.sql, que es lo que había en Supabase el 9-10-2026) en tres cosas, todas opcionales por juego:
--  · econ.legSegura = false: la épica asegurada (cada 10 tiradas y en las tiradas de 10) nunca es legendaria. Sin el dato, como antes (a veces sí).
--  · econ.pityLegObj: a cuántas tiradas está garantizada la legendaria en habilidades y objetos. Sin el dato, econ.pityLeg (el de las cartas no cambia).
--  · Lo que en el catálogo lleva "flag" (objetos o habilidades nuevos aún cerrados) solo sale si public._flag_activo lo abre para ese juego.
-- Sin esos datos en tablas_juego todo funciona igual que antes, así que se puede aplicar antes de subir los datos nuevos (python herramientas/subir_datos.py rumble).
-- Mismo cálculo que el cliente (core/js/sistema/gachapon.js, rollRarity).

create or replace function public.tirar(p_juego text, p_maquina text, p_n int, p_clave text, p_desbloqueadas text[] default '{}') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); m public.monedero; d jsonb; E jsonb; Q jsonb;
  kind text := p_maquina; cat jsonb; pity jsonb;
  libres int; coste_gemas bigint; i int; seguro boolean; got_epic boolean := false;
  rar text; k text; fp text[]; pool text[]; id text;
  pk text; pl text; qk text; mint int; nst int; qs jsonb; tier int; qv numeric; s numeric; x numeric; avg numeric; j int;
  odds jsonb; resultados jsonb := '[]'::jsonb; uid text; v_seq int;
  o_leg numeric; o_epic numeric;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if kind not in ('ab', 'eq') then raise exception 'maquina_no_valida'; end if;
  if p_n not in (1, 10, 50) then raise exception 'tirada_no_valida'; end if;
  if coalesce(p_clave, '') = '' or length(p_clave) > 80 then raise exception 'clave_no_valida'; end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  if d is null then raise exception 'sin_datos_del_juego'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if exists (select 1 from public.movimientos mv where mv.usuario = u and mv.juego = p_juego and mv.clave = p_clave) then raise exception 'repetida'; end if;
  E := d->'econ'; Q := d->'calidades'; odds := E->'odds';
  cat := case when kind = 'ab' then d->'habilidades' else d->'objetos' end;
  libres := least(m.entradas, p_n);
  coste_gemas := (p_n - libres)::bigint * (E->>'pull')::int;
  if m.gemas < coste_gemas then raise exception 'faltan_gemas'; end if;
  pity := m.garantia; v_seq := m.seq;
  pk := kind; pl := kind || 'L'; qk := 'q' || kind;
  o_leg := (odds->>'legendary')::numeric; o_epic := (odds->>'epic')::numeric;
  for i in 0..p_n - 1 loop
    if i % 10 = 0 then got_epic := false; end if;
    seguro := p_n >= 10 and i % 10 = 9 and not got_epic;
    -- rareza
    pity := jsonb_set(pity, array[pk], to_jsonb(coalesce((pity->>pk)::int, 0) + 1));
    pity := jsonb_set(pity, array[pl], to_jsonb(coalesce((pity->>pl)::int, 0) + 1));
    rar := 'common';
    if (pity->>pl)::int >= coalesce((E->>'pityLegObj')::int, (E->>'pityLeg')::int) then rar := 'legendary';
    elsif seguro or (pity->>pk)::int >= (E->>'pityEpic')::int then
      rar := case when coalesce((E->>'legSegura')::boolean, true) and random() < o_leg / (o_leg + o_epic) then 'legendary' else 'epic' end;
    else
      x := random() * 100;
      foreach k in array array['legendary', 'epic', 'rare', 'common', 'basic'] loop
        if x < coalesce((odds->>k)::numeric, 0) then rar := k; exit; end if;
        x := x - coalesce((odds->>k)::numeric, 0);
      end loop;
    end if;
    if rar in ('epic', 'legendary') then pity := jsonb_set(pity, array[pk], '0'); got_epic := true; end if;
    if rar = 'legendary' then pity := jsonb_set(pity, array[pl], '0'); end if;
    -- qué sale (en el equipo, a veces un objeto de una facción desbloqueada)
    if kind = 'eq' then
      select coalesce(array_agg(e.key), '{}') into fp from jsonb_each(cat) e
        where e.value->>'rar' = rar and not (e.value->>'pass')::boolean and e.value->>'fac' is not null and (e.value->>'fac') = any (p_desbloqueadas) and (e.value->>'flag' is null or public._flag_activo(e.value->>'flag', p_juego, false));
      select coalesce(array_agg(e.key), '{}') into pool from jsonb_each(cat) e
        where e.value->>'rar' = rar and not (e.value->>'pass')::boolean and e.value->>'fac' is null and (e.value->>'flag' is null or public._flag_activo(e.value->>'flag', p_juego, false));
      if coalesce(array_length(fp, 1), 0) > 0 and random() < 0.5 then pool := fp; end if;
    else
      select coalesce(array_agg(e.key), '{}') into pool from jsonb_each(cat) e
        where e.value->>'rar' = rar and not (e.value->>'pass')::boolean and (e.value->>'flag' is null or public._flag_activo(e.value->>'flag', p_juego, false));
    end if;
    if coalesce(array_length(pool, 1), 0) = 0 then raise exception 'sin_objetos_de_rareza_%', rar; end if;
    id := pool[1 + floor(random() * array_length(pool, 1))::int];
    -- calidades (garantía de calidad Director o mejor cada pityQ)
    pity := jsonb_set(pity, array[qk], to_jsonb(coalesce((pity->>qk)::int, 0) + 1));
    mint := case when (pity->>qk)::int >= (E->>'pityQ')::int then 3 else 0 end;
    nst := greatest(1, (cat->id->>'n')::int);
    qs := '[]'::jsonb; avg := 0;
    for j in 1..nst loop
      s := 0; for tier in mint..jsonb_array_length(Q) - 1 loop s := s + (Q->tier->>'p')::numeric; end loop;
      x := random() * s; qv := 1;
      for tier in mint..jsonb_array_length(Q) - 1 loop
        if x < (Q->tier->>'p')::numeric then
          qv := floor(((Q->tier->>'lo')::numeric + random() * ((Q->tier->>'hi')::numeric - (Q->tier->>'lo')::numeric)) * 1000) / 1000; exit;
        end if;
        x := x - (Q->tier->>'p')::numeric;
      end loop;
      qs := qs || to_jsonb(qv); avg := avg + qv / nst;
    end loop;
    if avg >= 0.88 then pity := jsonb_set(pity, array[qk], '0'); end if;
    v_seq := v_seq + 1; uid := 'n' || v_seq;
    insert into public.inventario (usuario, juego, uid, tipo, objeto, calidades) values (u, p_juego, uid, kind, id, qs);
    resultados := resultados || jsonb_build_array(jsonb_build_object('u', uid, 'k', kind, 'id', id, 'q', qs, 'rar', rar));
  end loop;
  update public.monedero w set gemas = w.gemas - coste_gemas, entradas = w.entradas - libres, garantia = pity, seq = v_seq, rev = w.rev + 1, cambiado = now()
    where w.usuario = u and w.juego = p_juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_gemas, d_entradas, origen_servidor)
    values (u, p_juego, 'gachapon', p_clave, -coste_gemas, -libres, true);
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego;
  return jsonb_build_object('resultados', resultados, 'oro', m.oro, 'gemas', m.gemas, 'entradas', m.entradas, 'garantia', m.garantia);
end $$;

create or replace function public._rolar_objeto(p_d jsonb, p_facs text[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  E jsonb := p_d->'econ'; Q jsonb := p_d->'calidades'; odds jsonb := p_d->'econ'->'odds'; kind text; cat jsonb; rar text := 'common'; x numeric; k text;
  pool text[]; id text; nst int; qs jsonb := '[]'::jsonb; j int; tier int; s numeric; qv numeric;
begin
  kind := case when random() < 0.5 then 'ab' else 'eq' end;
  cat := case when kind = 'ab' then p_d->'habilidades' else p_d->'objetos' end;
  x := random() * 100;
  foreach k in array array['legendary', 'epic', 'rare', 'common', 'basic'] loop
    if x < coalesce((odds->>k)::numeric, 0) then rar := k; exit; end if;
    x := x - coalesce((odds->>k)::numeric, 0);
  end loop;
  select coalesce(array_agg(e.key), '{}') into pool from jsonb_each(cat) e
    where e.value->>'rar' = rar and not (e.value->>'pass')::boolean
      and (kind = 'ab' or e.value->>'fac' is null or (e.value->>'fac') = any (coalesce(p_facs, '{}')))
      and (e.value->>'flag' is null or public._flag_activo(e.value->>'flag', p_d->>'juego', false));
  if coalesce(array_length(pool, 1), 0) = 0 then return null; end if;
  id := pool[1 + floor(random() * array_length(pool, 1))::int];
  nst := greatest(1, (cat->id->>'n')::int);
  for j in 1..nst loop
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
  return jsonb_build_object('k', kind, 'id', id, 'q', qs);
end $$;

revoke all on function public.tirar(text, text, int, text, text[]) from public, anon;
grant execute on function public.tirar(text, text, int, text, text[]) to authenticated;
revoke all on function public._rolar_objeto(jsonb, text[]) from public, anon, authenticated;
