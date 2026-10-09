-- Survivors: objetos que pueden salir de las cajas rotas del campo.
-- Evento nuevo de `anotar` (motivo `cajas`, calcula `cajas`): {tipo:'cajas', items:n, facs:[…]}. El servidor limita n a premios.cajas.maxItems por cobro y
-- premios.cajas.diaMax al día (reclamos caja:<fecha de Madrid>:<n>) y TIRA él los objetos (_rolar_objeto). No da oro: el oro de las cajas va en la partida.
-- Compatible hacia atrás: solo añade un tipo de evento; las versiones anteriores no lo mandan. Parchea las funciones vivas (no las reescribe a mano).
do $$
declare a text; h text;
begin
  select pg_get_functiondef(p.oid) into h from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = '_evento_horas';
  if position('''cajas''' in h) = 0 then
    h := replace(h, E'  if H is null then return jsonb_build_object(''ok'', false); end if;',
E'  if tipo = ''cajas'' then
    if P->''cajas'' is null then return jsonb_build_object(''ok'', false); end if;
    facs := case when jsonb_typeof(p_ev->''facs'') = ''array'' then array(select jsonb_array_elements_text(p_ev->''facs'')) else ''{}''::text[] end;
    n_it := least(greatest(coalesce((p_ev->>''items'')::int, 0), 0), coalesce((P->''cajas''->>''maxItems'')::int, 0));
    for cnt in 1..coalesce((P->''cajas''->>''diaMax'')::int, 0) loop
      exit when jsonb_array_length(items) >= n_it;
      insert into public.reclamos (usuario, juego, clave) values (p_u, p_juego, ''caja:'' || ((now() at time zone ''Europe/Madrid'')::date)::text || '':'' || cnt) on conflict do nothing;
      get diagnostics nn = row_count;
      if nn = 1 then it := public._rolar_objeto(p_d, facs); if it is not null then items := items || jsonb_build_array(it); end if; end if;
    end loop;
    return jsonb_build_object(''ok'', true, ''oro'', 0, ''gemas'', 0, ''entradas'', 0, ''items'', items);
  end if;

  if H is null then return jsonb_build_object(''ok'', false); end if;');
    if position('''cajas''' in h) = 0 then raise exception 'no se pudo parchear _evento_horas'; end if;
    execute h;
  end if;
  select pg_get_functiondef(p.oid) into a from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = 'anotar';
  if position('''cajas''' in a) = 0 then
    a := replace(a, '''anuncio'', ''objeto'')', '''anuncio'', ''objeto'', ''cajas'')');
    if position('''cajas''' in a) = 0 then raise exception 'no se pudo parchear anotar'; end if;
    execute a;
  end if;
end $$;
-- datos de Survivors: el motivo y el tope (herramientas/subir_datos.py los sube igual al desplegar)
update public.tablas_juego set datos = jsonb_set(jsonb_set(datos, '{topes,cajas}', '{"vez":{},"dia":{},"calcula":"cajas"}'::jsonb), '{premios,cajas}', '{"maxItems":2,"diaMax":6}'::jsonb)
 where juego = 'survivors';
