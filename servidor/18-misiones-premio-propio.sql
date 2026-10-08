-- Rumble v0.9.67: misiones con premio propio (la de «Completa 5 misiones diarias», las de la Arena…).
-- Sustituye la función _evento de 12-misiones-pase-logros.sql. Solo cambia la rama 'mision': si la misión tiene premio
-- propio en datos.premios.misiones (mision.r), da ese oro, gemas y xp de pase; si no, da lo de siempre (mision.d / mision.w).
-- Requiere servidor/datos/rumble.sql nuevo (herramientas/subir_datos.py rumble) para que la lista de misiones y el límite de 6 al día sean los de la versión.

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
    rw := P->'mision'->'r'->k;   -- premio propio de esta misión (si lo tiene): [oro, gemas, xp de pase]
    if rw is not null and jsonb_typeof(rw) = 'array' then
      o := coalesce((rw->>0)::bigint, 0); g := coalesce((rw->>1)::bigint, 0); xp := coalesce((rw->>2)::int, 0);
    else
      o := coalesce((P->'mision'->periodo->>0)::bigint, 0); g := coalesce((P->'mision'->periodo->>1)::bigint, 0);
      xp := coalesce((P->'mision'->'xp'->>periodo)::int, 0);
    end if;
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
