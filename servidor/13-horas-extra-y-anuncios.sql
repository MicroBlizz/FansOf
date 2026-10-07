-- Fase 3, paso 5 de PLAN-CUENTAS (punto 15): horas extra y anuncios con el reloj en el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migraciones «horas_extra_anuncios» y «anotar_horas_anuncios»).
-- Eventos nuevos de `anotar` (se validan con datos.premios.horas y datos.premios.anuncios):
--   · horas          {x2?}  cobrar las horas extra: solo lo que cabe en el tiempo transcurrido desde el cobro anterior (máximo `cap` horas) a la mayor
--                           ganancia posible por hora (poder máximo `pwMax`), con el doble si el turbo estaba activo y otro doble si se cobra x2 con anuncio
--   · horas-anuncio  {}     el anuncio de «ganancias de N horas»: como mucho N horas a la mayor ganancia por hora
--   · turbo          {}     el turbo de horas extra (anuncio): el servidor apunta hasta cuándo dura
--   · anuncio        {slot} cualquier otro anuncio con premio: tiradas gratis (1 entrada), regalo diario x2 (premios.gift), premio x2 de partida (la cantidad
--                           que diga el cliente, con los topes de siempre), cambiar misión (sin premio)
-- Cada anuncio gasta uno de los cupos del día de su sitio (anuncios.slots) y del total (anuncios.dayMax); los cupos se cuentan en `reclamos`
-- (ad:<fecha de Madrid>:<sitio>:<n>). El reloj es la hora que manda el cliente en cada movimiento (`t`, en ms), sin pasar de la del servidor ni ir hacia
-- atrás, así que varios cobros hechos sin conexión y mandados juntos no se pisan. El primer cobro de una cuenta puede llevar hasta `cap` horas.
-- Los objetos que a veces encuentra el líder en horas extra se siguen creando en el aparato (paso siguiente).
create or replace function public._gastar_anuncio(p_u uuid, p_juego text, p_P jsonb, p_slot text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare hoy text := ((now() at time zone 'Europe/Madrid')::date)::text; mx int; tot int; i int; n int;
begin
  mx := (p_P->'anuncios'->'slots'->>p_slot)::int;
  if mx is null then return false; end if;
  select count(*) into tot from public.reclamos r where r.usuario = p_u and r.juego = p_juego and r.clave like 'ad:' || hoy || ':%';
  if tot >= coalesce((p_P->'anuncios'->>'dayMax')::int, 30) then return false; end if;
  for i in 1..mx loop
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'ad:' || hoy || ':' || p_slot || ':' || i) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 1 then return true; end if;
  end loop;
  return false;
end $$;
revoke all on function public._gastar_anuncio(uuid, text, jsonb, text) from public, anon, authenticated;

create or replace function public._evento_horas(p_u uuid, p_juego text, p_d jsonb, p_ev jsonb, p_pedido jsonb, p_t numeric) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  tipo text := p_ev->>'tipo'; P jsonb := p_d->'premios'; H jsonb := p_d->'premios'->'horas'; ex jsonb; slot text := p_ev->>'slot';
  now_ms bigint := (extract(epoch from now()) * 1000)::bigint; t bigint; last bigint; turbo bigint; hrs numeric; x numeric; mult numeric;
  r_g numeric; r_gm numeric; o bigint := 0; g bigint := 0; e bigint := 0; cap numeric; ped_o bigint; ped_g bigint; ped_e bigint;
begin
  if P is null then return jsonb_build_object('ok', false); end if;
  select m.extra into ex from public.monedero m where m.usuario = p_u and m.juego = p_juego;
  ex := coalesce(ex, '{}'::jsonb);
  t := least(coalesce(p_t, now_ms)::bigint, now_ms + 60000);
  ped_o := coalesce((p_pedido->>'oro')::bigint, 0); ped_g := coalesce((p_pedido->>'gemas')::bigint, 0); ped_e := coalesce((p_pedido->>'entradas')::bigint, 0);

  if tipo = 'anuncio' then
    if not public._gastar_anuncio(p_u, p_juego, P, slot) then return jsonb_build_object('ok', false); end if;
    if slot like 'pull\_%' then e := 1;
    elsif slot = 'gift2' then o := coalesce((P->'gift'->>'gold')::bigint, 0); g := coalesce((P->'gift'->>'gems')::bigint, 0);
    elsif slot = 'end2' then o := ped_o; g := ped_g;
    elsif slot = 'swap' then null;
    else return jsonb_build_object('ok', false); end if;
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', e);
  end if;

  if H is null then return jsonb_build_object('ok', false); end if;
  cap := (H->>'cap')::numeric;
  r_g := (H->>'gold')::numeric * power((H->>'pwMax')::numeric, (H->>'gExp')::numeric);
  r_gm := (H->>'gems')::numeric + ((H->>'pwMax')::numeric - 1) * (H->>'gemsK')::numeric;
  last := nullif(ex->'idle'->>'last', '')::bigint; turbo := coalesce(nullif(ex->'idle'->>'turbo', '')::bigint, 0);

  if tipo = 'turbo' then
    if not public._gastar_anuncio(p_u, p_juego, P, 'turbo') then return jsonb_build_object('ok', false); end if;
    ex := jsonb_set(ex, '{idle}', coalesce(ex->'idle', '{}'::jsonb) || jsonb_build_object('turbo', greatest(t, turbo) + coalesce((H->>'turboH')::numeric, 2) * 3600000));
    update public.monedero m set extra = ex where m.usuario = p_u and m.juego = p_juego;
    return jsonb_build_object('ok', true, 'oro', 0, 'gemas', 0, 'entradas', 0);

  elsif tipo = 'horas-anuncio' then
    if not public._gastar_anuncio(p_u, p_juego, P, 'idle4') then return jsonb_build_object('ok', false); end if;
    hrs := coalesce((H->>'idleH')::numeric, 4);
    return jsonb_build_object('ok', true, 'oro', least(ped_o, ceil(r_g * hrs)::bigint), 'gemas', least(ped_g, ceil(r_gm * hrs)::bigint), 'entradas', 0);

  elsif tipo = 'horas' then
    hrs := case when last is null then cap else greatest(0, least(cap, (t - last) / 3600000.0)) end;
    x := hrs;
    if turbo > coalesce(last, 0) then x := x + greatest(0, least(hrs, (least(t, turbo) - coalesce(last, t - (hrs * 3600000)::bigint)) / 3600000.0)); end if;
    mult := 1;
    if coalesce((p_ev->>'x2')::boolean, false) then
      if not public._gastar_anuncio(p_u, p_juego, P, 'idle2') then return jsonb_build_object('ok', false); end if;
      mult := 2;
    end if;
    ex := jsonb_set(ex, '{idle}', coalesce(ex->'idle', '{}'::jsonb) || jsonb_build_object('last', greatest(t, coalesce(last, 0))));
    update public.monedero m set extra = ex where m.usuario = p_u and m.juego = p_juego;
    return jsonb_build_object('ok', true, 'oro', least(ped_o, ceil(r_g * x * mult)::bigint), 'gemas', least(ped_g, ceil(r_gm * x * mult)::bigint), 'entradas', 0);
  end if;
  return jsonb_build_object('ok', false);
end $$;
revoke all on function public._evento_horas(uuid, text, jsonb, jsonb, jsonb, numeric) from public, anon, authenticated;
