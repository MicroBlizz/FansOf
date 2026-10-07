-- Fase 2, paso 3 de PLAN-CUENTAS (punto 15): la máquina de cartas de Rumble la tira el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «tirar_cartas»).
-- Rarezas, garantías y costes salen de public.tablas_juego (econ.cardOdds, pityEpic, pityLeg, pull, dupGems, maxStars; cartas; facciones[f].gacha).
-- El nivel de cada carta nueva lo sigue calculando el cliente (cardStartLevel) hasta el paso 4 (mejorar_carta).
create or replace function public.tirar_cartas(p_juego text, p_n int, p_clave text, p_desbloqueadas text[] default '{}') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); m public.monedero; d jsonb; E jsonb; O jsonb; cd_ jsonb; pity jsonb;
  libres int; coste_gemas bigint; extra_gemas bigint := 0; i int; seguro boolean; got_epic boolean := false;
  rar text; x numeric; o_leg numeric; o_epic numeric; f text; k text; pool text[]; todas text[] := '{}';
  ex jsonb; n_c int; st_c int; max_st int; dup int; resultados jsonb := '[]'::jsonb; r jsonb;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if p_n not in (1, 10, 50) then raise exception 'tirada_no_valida'; end if;
  if coalesce(p_clave, '') = '' or length(p_clave) > 80 then raise exception 'clave_no_valida'; end if;
  select t.datos into d from public.tablas_juego t where t.juego = p_juego;
  if d is null or d->'econ'->'cardOdds' is null then raise exception 'sin_datos_del_juego'; end if;
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  if exists (select 1 from public.movimientos mv where mv.usuario = u and mv.juego = p_juego and mv.clave = p_clave) then raise exception 'repetida'; end if;
  E := d->'econ'; O := E->'cardOdds'; cd_ := d->'cartas';
  max_st := (E->>'maxStars')::int; dup := (E->>'dupGems')::int;
  libres := least(m.entradas, p_n);
  coste_gemas := (p_n - libres)::bigint * (E->>'pull')::int;
  if m.gemas < coste_gemas then raise exception 'faltan_gemas'; end if;
  pity := m.garantia;
  o_leg := (O->>'legendary')::numeric; o_epic := (O->>'epic')::numeric;
  -- las cartas que pueden salir: las del gashapón de las facciones desbloqueadas
  foreach f in array p_desbloqueadas loop
    if d->'facciones'->f is not null then
      for k in select jsonb_array_elements_text(d->'facciones'->f->'gacha') loop todas := todas || k; end loop;
    end if;
  end loop;
  if coalesce(array_length(todas, 1), 0) = 0 then raise exception 'sin_cartas'; end if;
  for i in 0..p_n - 1 loop
    if i % 10 = 0 then got_epic := false; end if;
    seguro := p_n >= 10 and i % 10 = 9 and not got_epic;
    pity := jsonb_set(pity, array['cd'], to_jsonb(coalesce((pity->>'cd')::int, 0) + 1));
    pity := jsonb_set(pity, array['cdL'], to_jsonb(coalesce((pity->>'cdL')::int, 0) + 1));
    rar := 'rare';
    if (pity->>'cdL')::int >= (E->>'pityLeg')::int then rar := 'legendary';
    elsif seguro or (pity->>'cd')::int >= (E->>'pityEpic')::int then
      rar := case when random() < o_leg / (o_leg + o_epic) then 'legendary' else 'epic' end;
    else
      x := random() * 100;
      rar := case when x < o_leg then 'legendary' when x < o_leg + o_epic then 'epic' else 'rare' end;
    end if;
    if rar <> 'rare' then pity := jsonb_set(pity, array['cd'], '0'); got_epic := true; end if;
    if rar = 'legendary' then pity := jsonb_set(pity, array['cdL'], '0'); end if;
    select coalesce(array_agg(uc), '{}') into pool from unnest(todas) uc where cd_->uc->>'rarity' = rar;
    if coalesce(array_length(pool, 1), 0) = 0 then pool := todas; end if;
    k := pool[1 + floor(random() * array_length(pool, 1))::int];
    rar := cd_->k->>'rarity';
    select ct.extra into ex from public.cartas ct where ct.usuario = u and ct.juego = p_juego and ct.carta = k;
    if not found then
      insert into public.cartas (usuario, juego, carta, nivel, xp, extra) values (u, p_juego, k, 1, 0, jsonb_build_object('n', 1, 'st', 0));
      r := jsonb_build_object('k', k, 'rar', rar, 'isNew', true, 'n', 1, 'st', 0);
    else
      n_c := coalesce((ex->>'n')::int, 1) + 1; st_c := coalesce((ex->>'st')::int, 0);
      if st_c < max_st then
        st_c := st_c + 1;
        r := jsonb_build_object('k', k, 'rar', rar, 'up', true, 'n', n_c, 'st', st_c);
      else
        extra_gemas := extra_gemas + dup;
        r := jsonb_build_object('k', k, 'rar', rar, 'gems', true, 'n', n_c, 'st', st_c);
      end if;
      update public.cartas ct set extra = coalesce(ct.extra, '{}'::jsonb) || jsonb_build_object('n', n_c, 'st', st_c)
        where ct.usuario = u and ct.juego = p_juego and ct.carta = k;
    end if;
    resultados := resultados || jsonb_build_array(r);
  end loop;
  update public.monedero w set gemas = w.gemas - coste_gemas + extra_gemas, entradas = w.entradas - libres, garantia = pity, rev = w.rev + 1, cambiado = now()
    where w.usuario = u and w.juego = p_juego;
  insert into public.movimientos (usuario, juego, motivo, clave, d_gemas, d_entradas, origen_servidor)
    values (u, p_juego, 'gachapon-cartas', p_clave, extra_gemas - coste_gemas, -libres, true);
  select * into m from public.monedero w where w.usuario = u and w.juego = p_juego;
  return jsonb_build_object('resultados', resultados, 'oro', m.oro, 'gemas', m.gemas, 'entradas', m.entradas, 'garantia', m.garantia);
end $$;
revoke all on function public.tirar_cartas(text, int, text, text[]) from public, anon;
grant execute on function public.tirar_cartas(text, int, text, text[]) to authenticated;
