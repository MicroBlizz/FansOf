-- Fase 3, paso 6 de PLAN-CUENTAS (punto 15): los objetos que se regalan los crea (o los valida) el servidor.
-- Aplicada en el proyecto awivkedbmumwnkqlfixm el 7-10-2026 (migración «objetos_regalados»).
-- · Objetos de horas extra (eventos `horas` y `horas-anuncio`, campo `items` = cuántos dice el aparato y `facs` = facciones libres): el servidor limita la
--   cantidad a lo que cabe en el tiempo (a la mayor tasa de objetos por hora) y los TIRA él, con las probabilidades del gashapón sin garantía. Los devuelve en
--   `nuevos`; el aparato no los crea por su cuenta y los enseña cuando llegan.
-- · Regalos de un solo cobro (motivo `objeto`, evento `{tipo:'objeto', regalo, id, q, …}`): el aparato ya los ha sorteado y enseñado, así que el servidor
--   comprueba que sea posible y los apunta una sola vez: `cafe` (Cafeína 0,75, la del tutorial), `starter` (un objeto épico de calidad Director o mejor,
--   el pack de bienvenida), `mito` (un objeto o habilidad legendarios de calidad Director o mejor, una vez por mundo, premio de Mítica) y
--   `facitem` (el objeto de la facción, premios.facItems, calidad Buena o mejor, una vez por facción).
-- Los objetos se crean con uid `n<número>` y el aparato cambia su copia provisional (`pend`) por la del servidor.
create or replace function public._rolar_objeto(p_d jsonb, p_facs text[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  E jsonb := p_d->'econ'; Q jsonb := p_d->'calidades'; odds jsonb := p_d->'econ'->'odds'; kind text; cat jsonb; rar text := 'common'; x numeric; k text;
  pool text[]; id text; nst int; qs jsonb := '[]'::jsonb; j int; tier int; s numeric; qv numeric;
begin
  kind := case when random() < 0.5 then 'ab' else 'eq' end;
  cat := case when kind = 'ab' then p_d->'habilidades' else p_d->'objetos' end;
  x := random() * 100;
  foreach k in array array['legendary', 'epic', 'rare'] loop
    if x < (odds->>k)::numeric then rar := k; exit; end if;
    x := x - (odds->>k)::numeric;
  end loop;
  select coalesce(array_agg(e.key), '{}') into pool from jsonb_each(cat) e
    where e.value->>'rar' = rar and not (e.value->>'pass')::boolean
      and (kind = 'ab' or e.value->>'fac' is null or (e.value->>'fac') = any (coalesce(p_facs, '{}')));
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
revoke all on function public._rolar_objeto(jsonb, text[]) from public, anon, authenticated;

-- ¿son válidas estas calidades? (lista del tamaño del objeto, cada una entre minq y 1)
create or replace function public._calidades_validas(p_q jsonb, p_n int, p_minq numeric) returns boolean
language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(p_q) <> 'array' then false
              when jsonb_array_length(p_q) <> p_n then false
              else not exists (select 1 from jsonb_array_elements_text(p_q) v
                               where case when v ~ '^[0-9]+(\.[0-9]+)?$' then v::numeric < p_minq or v::numeric > 1 else true end) end;
$$;
revoke all on function public._calidades_validas(jsonb, int, numeric) from public, anon, authenticated;
