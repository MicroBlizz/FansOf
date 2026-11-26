// Fans of Pop · PERFIL DE JUGADOR (dominio; tarea #41, ADR 130): qué se tiene, qué se puede poner, cuánto cuesta y qué viaja al rival.
// Funciones puras: sin reloj, azar, SAVE, red ni dibujo. Reciben el catálogo (PP_PERFIL_CAT más los personajes), los precios por tipo
// (PP_CFG.perfil) y lo que tiene el jugador: { comprados: [reclamos 'fijo:perfil:<tipo>:<id>'], rescatados: { id: true } }.
// Los errores son resultados con nombre: no_existe, no_lo_tienes, ya_lo_tienes, gratis, de_logro (no se vende), faltan_perlas, pegatinas_llenas.
// Lo que viaja al rival (publico/deRival) son solo ids del catálogo, nunca la foto ni nada libre: lo que no existe se cambia por lo de serie.
'use strict';
const PP_PERFIL = Object.freeze((() => {
  const TIPOS = Object.freeze(['personaje', 'marco', 'frase', 'titulo', 'pegatina', 'efecto', 'fondo', 'entrada']);
  const CORTO = Object.freeze({ personaje: 'p', marco: 'm', frase: 'f', titulo: 't', pegatina: 'g', efecto: 'e', fondo: 'o', entrada: 'n' });
  const PEGATINAS = 4;   // cuántas pegatinas se llevan al duelo como mucho
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const busca = (cat, tipo, id) => (cat[tipo] || []).find(x => x.id === id) || null;
  const articulo = (tipo, id) => `perfil:${tipo}:${id}`;
  const reclamo = (tipo, id) => `fijo:${articulo(tipo, id)}`;
  const deSerie = (cat, tipo) => (cat[tipo] || []).filter(x => x.serie).map(x => x.id);
  // gratis: lo de serie, el amigo ya rescatado y lo de logro ya conseguido (`logro` en el catálogo; yo.logros = { id del logro: true }, tarea 396)
  const deLogro = (x, yo) => !!(x.logro && yo.logros && yo.logros[x.logro]);
  const gratis = (cat, tipo, id, yo) => { const x = busca(cat, tipo, id); return !!(x && (x.serie || (tipo === 'personaje' && yo.rescatados && yo.rescatados[id]) || deLogro(x, yo))); };
  const loTiene = (cat, tipo, id, yo) => !!busca(cat, tipo, id) && (gratis(cat, tipo, id, yo) || (yo.comprados || []).includes(reclamo(tipo, id)));
  function precio(cat, precios, tipo, id, yo) {
    if (!busca(cat, tipo, id)) return error('no_existe');
    return ok({ perlas: gratis(cat, tipo, id, yo) ? 0 : precios[tipo] });
  }
  // lo que se puede comprar ahora: comprueba lo mismo que el servidor (comprar_fijo) para avisar antes de pedirlo
  function comprar(cat, precios, tipo, id, yo) {
    if (!busca(cat, tipo, id)) return error('no_existe');
    if (gratis(cat, tipo, id, yo)) return error('gratis');
    if (busca(cat, tipo, id).logro) return error('de_logro');   // no se vende: se gana con su logro
    if (loTiene(cat, tipo, id, yo)) return error('ya_lo_tienes');
    if ((yo.perlas || 0) < precios[tipo]) return error('faltan_perlas');
    return ok({ perlas: precios[tipo], articulo: articulo(tipo, id) });
  }
  // el perfil de quien empieza: lo de serie de cada tipo (una pegatina)
  function inicial(cat) {
    const p = {};
    for (const t of TIPOS) if (t !== 'pegatina') p[t] = deSerie(cat, t)[0] || ((cat[t] || [])[0] || {}).id || '';
    p.pegatinas = deSerie(cat, 'pegatina').slice(0, PEGATINAS);
    return Object.freeze(p);
  }
  // ponerse algo; una pegatina entra o sale de la fila (hasta PEGATINAS)
  function poner(perfil, cat, tipo, id, yo) {
    if (!TIPOS.includes(tipo) || !busca(cat, tipo, id)) return error('no_existe');
    if (!loTiene(cat, tipo, id, yo)) return error('no_lo_tienes');
    if (tipo !== 'pegatina') return ok({ perfil: Object.freeze({ ...perfil, [tipo]: id }) });
    const fila = perfil.pegatinas || [];
    if (fila.includes(id)) return ok({ perfil: Object.freeze({ ...perfil, pegatinas: fila.filter(x => x !== id) }) });
    if (fila.length >= PEGATINAS) return error('pegatinas_llenas');
    return ok({ perfil: Object.freeze({ ...perfil, pegatinas: [...fila, id] }) });
  }
  // deja el perfil solo con lo que existe y (si se pasa `yo`) lo que se tiene: lo demás vuelve a lo de serie
  function limpia(perfil, cat, yo) {
    const base = inicial(cat), p = {}, vale = (t, id) => !!busca(cat, t, id) && (!yo || loTiene(cat, t, id, yo));
    const src = perfil && typeof perfil === 'object' ? perfil : {};
    for (const t of TIPOS) if (t !== 'pegatina') p[t] = vale(t, src[t]) ? src[t] : base[t];
    const fila = Array.isArray(src.pegatinas) ? [...new Set(src.pegatinas)].filter(id => vale('pegatina', id)) : base.pegatinas;
    p.pegatinas = fila.slice(0, PEGATINAS);
    return Object.freeze(p);
  }
  // lo que se manda al rival por la sala: solo ids, con claves cortas
  function publico(perfil) {
    const d = {};
    for (const t of TIPOS) if (t !== 'pegatina') d[CORTO[t]] = perfil[t];
    d[CORTO.pegatina] = (perfil.pegatinas || []).slice(0, PEGATINAS);
    return d;
  }
  // lo que llega del rival: nunca se fía, lo que no exista en el catálogo se cambia por lo de serie
  function deRival(datos, cat) {
    const d = datos && typeof datos === 'object' ? datos : {}, p = {};
    for (const t of TIPOS) p[t === 'pegatina' ? 'pegatinas' : t] = d[CORTO[t]];
    return limpia(p, cat, null);
  }
  // el perfil del rival en un duelo contra gente: de la lista de pop_perfil_sala (servidor/150; [{ orden, perfil }]) el de su orden, ya
  // comprobado por el servidor pero limpiado igual; si no está o nunca se puso nada, lo de serie (lo gratis)
  function deSala(lista, orden, cat) {
    const e = Array.isArray(lista) ? lista.find(x => x && x.orden === orden) : null;
    return limpia(e && e.perfil, cat, null);
  }
  return { TIPOS, PEGATINAS, articulo, reclamo, gratis, loTiene, precio, comprar, inicial, poner, limpia, publico, deRival, deSala };
})());
