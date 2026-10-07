-- Fase 3, paso 4 de PLAN-CUENTAS (punto 15): misiones, racha de días, pase de batalla y logros los valida el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «misiones_pase_logros»).
-- El cliente manda un evento y el servidor decide cantidad y si se puede cobrar, con la tabla datos.premios y lo que ya sabe de la cuenta:
--   · mision  {periodo: 'd'|'w', id}            la misión debe existir, solo una vez por periodo (día o semana de Madrid) y como mucho n al periodo
--   · login   {}                                racha de días en el servidor (monedero.extra.login); un cobro por día; el día lo calcula él
--   · pase    {pista: 'free'|'paid', nivel}     solo hasta el nivel que da la xp de pase que el servidor ha contado; la pista de pago pide el pase Ejecutivo
--   · pase-premium {}                           el pase Ejecutivo (compra de prueba; con pagos reales solo lo marcará el cobro)
--   · logros  {claves: ['familia:nivel', …]}    cada logro paga una vez (reclamos logro:familia:nivel) con las gemas de la tabla
-- La xp del pase la cuenta el servidor: cada movimiento 'partida' con evento (camp u otro) suma xpWin o xpLose, y cada misión cobrada, su xp.
-- Los eventos pueden ir en un motivo cuyo tope tenga calcula: 'tipo' o ['tipo', …]. En todos los casos siguen los topes vez y dia.
-- No se comprueba que el logro o la misión se hayan cumplido de verdad (el servidor no ve la partida): cada una solo se cobra una vez, así que el total es finito.
alter table public.monedero add column if not exists extra jsonb not null default '{}'::jsonb;

create or replace function public._acepta(tp jsonb, tipo text) returns boolean
language sql immutable set search_path = '' as $$
  select case when tp->'calcula' is null then false
              when jsonb_typeof(tp->'calcula') = 'array' then tp->'calcula' ? tipo
              else tp->>'calcula' = tipo end;
$$;

create or replace function public._evento(p_u uuid, p_juego text, p_d jsonb, p_ev jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  tipo text := p_ev->>'tipo'; P jsonb := p_d->'premios'; ex jsonb; hoy date := (now() at time zone 'Europe/Madrid')::date;
  per text; periodo text; n int; o bigint := 0; g bigint := 0; t bigint := 0; k text; i int; fam text; gm int; cl text;
  xp int; lv int; pista text; dia int; ult date; gap int; best int; rw jsonb; xpper int; niveles int;
begin
  select m.extra into ex from public.monedero m where m.usuario = p_u and m.juego = p_juego;
  ex := coalesce(ex, '{}'::jsonb);
  if P is null then return jsonb_build_object('ok', false); end if;

  if tipo = 'mision' then
    periodo := p_ev->>'periodo'; k := p_ev->>'id';
    if periodo not in ('d', 'w') or k is null or not coalesce(P->'misiones'->periodo ? k, false) then return jsonb_build_object('ok', false); end if;
    per := case when periodo = 'd' then hoy::text else (date_trunc('week', now() at time zone 'Europe/Madrid')::date)::text end;
    select count(*) into n from public.reclamos c where c.usuario = p_u and c.juego = p_juego and c.clave like 'mision:' || periodo || ':' || per || ':%';
    if n >= coalesce((P->'mision'->'n'->>periodo)::int, 4) then return jsonb_build_object('ok', false); end if;
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'mision:' || periodo || ':' || per || ':' || k) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 0 then return jsonb_build_object('ok', false); end if;
    o := coalesce((P->'mision'->periodo->>0)::bigint, 0); g := coalesce((P->'mision'->periodo->>1)::bigint, 0);
    xp := coalesce((P->'mision'->'xp'->>periodo)::int, 0);
    xpper := (P->'pase'->>'xpPer')::int; niveles := (P->'pase'->>'levels')::int;
    ex := jsonb_set(ex, '{pase_xp}', to_jsonb(least(niveles * xpper, coalesce((ex->>'pase_xp')::int, 0) + xp)));
    update public.monedero m set extra = ex where m.usuario = p_u and m.juego = p_juego;
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', 0, 'clave', 'mision-mov:' || periodo || ':' || per || ':' || k);

  elsif tipo = 'login' then
    ult := nullif(ex->'login'->>'last', '')::date;
    if ult = hoy then return jsonb_build_object('ok', false); end if;
    gap := case when ult is null then 0 else hoy - ult end;
    dia := coalesce((ex->'login'->>'day')::int, 0);
    dia := case when gap = 1 and dia < 7 then dia + 1 else 1 end;
    rw := P->'login'->(dia - 1);
    if rw is null then return jsonb_build_object('ok', false); end if;
    o := coalesce((rw->>'gold')::bigint, 0); g := coalesce((rw->>'gems')::bigint, 0); t := coalesce((rw->>'tickets')::bigint, 0);
    best := greatest(coalesce((ex->'login'->>'best')::int, 0), dia);
    ex := jsonb_set(ex, '{login}', jsonb_build_object('last', hoy::text, 'day', dia, 'best', best));
    update public.monedero m set extra = ex where m.usuario = p_u and m.juego = p_juego;
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', t, 'clave', 'login:' || hoy::text);

  elsif tipo = 'pase-premium' then
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'pase:premium') on conflict do nothing;
    return jsonb_build_object('ok', true, 'oro', 0, 'gemas', 0, 'entradas', 0, 'clave', 'pase-premium');

  elsif tipo = 'pase' then
    pista := p_ev->>'pista'; i := coalesce((p_ev->>'nivel')::int, 0);
    xpper := (P->'pase'->>'xpPer')::int; niveles := (P->'pase'->>'levels')::int;
    if pista not in ('free', 'paid') or xpper is null then return jsonb_build_object('ok', false); end if;
    lv := least(niveles, floor(coalesce((ex->>'pase_xp')::int, 0) / xpper)::int);
    if i < 1 or i > lv then return jsonb_build_object('ok', false); end if;
    if pista = 'paid' and not exists (select 1 from public.reclamos c where c.usuario = p_u and c.juego = p_juego and c.clave = 'pase:premium') then return jsonb_build_object('ok', false); end if;
    insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'pase:' || pista || ':' || i) on conflict do nothing;
    get diagnostics n = row_count;
    if n = 0 then return jsonb_build_object('ok', false); end if;
    rw := P->'pase'->pista->(i - 1);
    o := coalesce((rw->>'gold')::bigint, 0); g := coalesce((rw->>'gems')::bigint, 0); t := coalesce((rw->>'tickets')::bigint, 0);
    return jsonb_build_object('ok', true, 'oro', o, 'gemas', g, 'entradas', t, 'clave', 'pase-mov:' || pista || ':' || i);

  elsif tipo = 'logros' then
    if jsonb_typeof(p_ev->'claves') <> 'array' then return jsonb_build_object('ok', false); end if;
    for k in select jsonb_array_elements_text(p_ev->'claves') limit 80 loop
      fam := split_part(k, ':', 1);
      continue when split_part(k, ':', 2) !~ '^[0-9]{1,2}$';
      gm := (P->'logros'->fam->>(split_part(k, ':', 2)::int))::int;
      continue when gm is null;
      insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, 'logro:' || k) on conflict do nothing;
      get diagnostics n = row_count;
      if n = 1 then g := g + gm; end if;
    end loop;
    if g = 0 then return jsonb_build_object('ok', false); end if;
    return jsonb_build_object('ok', true, 'oro', 0, 'gemas', g, 'entradas', 0);
  end if;
  return jsonb_build_object('ok', false);
end $$;
revoke all on function public._acepta(jsonb, text), public._evento(uuid, text, jsonb, jsonb) from public, anon, authenticated;
