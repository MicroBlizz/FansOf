-- Fase 3, paso 1 de PLAN-CUENTAS (punto 15): lo que se gana jugando ya no entra sin límite.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «anotar_con_topes»).
-- Antes, `anotar` aceptaba cualquier cantidad positiva (hasta 10 millones por movimiento) con cualquier motivo: había que cerrarlo ya que el servidor
-- manda sobre las gemas y el oro del gashapón. Ahora cada motivo tiene sus topes en tablas_juego.datos.topes (los pone cada juego, AJUSTES.topes, y
-- herramientas/subir_datos.py los sube):
--   topes[motivo] = { vez: {gold, gems, tickets}, dia: {gold, gems, tickets}, unica: true|false }
-- · motivo desconocido: se rechaza · cantidad positiva: no pasa de «vez» ni de lo que queda de «dia» (suma de las últimas 24 h de ese motivo)
-- · unica: ese motivo solo se cobra una vez por cuenta (la clave del servidor es el propio motivo)
-- · cantidades negativas (gastos que el cliente cuenta, o quitar el modo pruebas): pasan, solo perjudican al jugador
-- Lo recortado queda en movimientos.nota ({pedido: …}) para revisarlo.
create or replace function public._limitar(p_v bigint, p_vez bigint, p_dia bigint, p_usado bigint) returns bigint
language sql immutable set search_path = '' as $$
  select case when p_v <= 0 then greatest(p_v, -10000000)
              else least(p_v, coalesce(p_vez, 0), greatest(coalesce(p_dia, coalesce(p_vez, 0) * 1000) - p_usado, 0)) end;
$$;

create or replace function public.anotar(p_juego text, p_movs jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); d jsonb; T jsonb; tp jsonb; e jsonb; n int := 0; rech int := 0; filas int; mot text; v_clave text;
  p_o bigint; p_g bigint; p_e bigint; d_o bigint; d_g bigint; d_e bigint; u_o bigint; u_g bigint; u_e bigint;
  lim constant numeric := 10000000;
begin
  if u is null then raise exception 'sin_sesion'; end if;
  if jsonb_typeof(p_movs) <> 'array' then raise exception 'movimientos_no_validos'; end if;
  select t.datos->'topes' into T from public.tablas_juego t where t.juego = p_juego;
  if T is null then raise exception 'sin_topes'; end if;
  perform 1 from public.monedero w where w.usuario = u and w.juego = p_juego for update;
  if not found then raise exception 'sin_monedero'; end if;
  for e in select x from jsonb_array_elements(p_movs) x limit 200 loop
    continue when jsonb_typeof(e) <> 'object' or coalesce(e->>'clave', '') = '' or length(e->>'clave') > 80;
    mot := left(coalesce(e->>'motivo', ''), 40); tp := T->mot;
    if tp is null then rech := rech + 1; continue; end if;
    v_clave := case when coalesce((tp->>'unica')::boolean, false) then mot else e->>'clave' end;
    p_o := least(greatest(case when jsonb_typeof(e->'oro') = 'number' then floor((e->>'oro')::numeric) else 0 end, -lim), lim);
    p_g := least(greatest(case when jsonb_typeof(e->'gemas') = 'number' then floor((e->>'gemas')::numeric) else 0 end, -lim), lim);
    p_e := least(greatest(case when jsonb_typeof(e->'entradas') = 'number' then floor((e->>'entradas')::numeric) else 0 end, -1000), 1000);
    select coalesce(sum(mv.d_oro) filter (where mv.d_oro > 0), 0), coalesce(sum(mv.d_gemas) filter (where mv.d_gemas > 0), 0), coalesce(sum(mv.d_entradas) filter (where mv.d_entradas > 0), 0)
      into u_o, u_g, u_e from public.movimientos mv
      where mv.usuario = u and mv.juego = p_juego and mv.motivo = mot and mv.creado > now() - interval '24 hours';
    d_o := public._limitar(p_o, (tp->'vez'->>'gold')::bigint, (tp->'dia'->>'gold')::bigint, u_o);
    d_g := public._limitar(p_g, (tp->'vez'->>'gems')::bigint, (tp->'dia'->>'gems')::bigint, u_g);
    d_e := public._limitar(p_e, (tp->'vez'->>'tickets')::bigint, (tp->'dia'->>'tickets')::bigint, u_e);
    insert into public.movimientos (usuario, juego, motivo, clave, d_oro, d_gemas, d_entradas, nota)
    values (u, p_juego, mot, v_clave, d_o, d_g, d_e,
            case when (d_o, d_g, d_e) is distinct from (p_o, p_g, p_e) then jsonb_build_object('pedido', jsonb_build_object('oro', p_o, 'gemas', p_g, 'entradas', p_e)) end)
    on conflict (usuario, juego, clave) do nothing;
    get diagnostics filas = row_count;
    if filas = 1 then
      update public.monedero w set oro = greatest(w.oro + d_o, 0), gemas = greatest(w.gemas + d_g, 0), entradas = greatest(w.entradas + d_e::int, 0),
        rev = w.rev + 1, cambiado = now() where w.usuario = u and w.juego = p_juego;
      n := n + 1;
    end if;
  end loop;
  return public.estado(p_juego) || jsonb_build_object('aplicados', n, 'rechazados', rech);
end $$;
revoke all on function public._limitar(bigint, bigint, bigint, bigint) from public, anon, authenticated;
revoke all on function public.anotar(text, jsonb) from public, anon;
grant execute on function public.anotar(text, jsonb) to authenticated;
