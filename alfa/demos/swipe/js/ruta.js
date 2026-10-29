// Fans of Swipe · RUTA: la Torre de Microblizz piso a piso (qué hay en cada piso y los cruces de dos caminos) y TODAS las cartas
// que no son de combate: el cruce, los eventos, la tienda, el descanso, el tesoro, el botín y la carta nueva. Cada carta dice
// qué hay a cada lado (swLados) y lo que se sortea al crearla (pre), así la previsión puede decir exactamente qué te llevas.
'use strict';
/* ---------- el mapa ---------- */
function swPesoNodo(piso, prohibido) {
  const pesos = Object.entries(SW_CFG.nodos).filter(([k]) => k !== prohibido && (k !== 'elite' || piso >= SW_CFG.eliteDesde));
  let t = Math.random() * pesos.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of pesos) { t -= w; if (t <= 0) return k; }
  return 'combate';
}
function swNuevoMapa() {
  const mapa = [];
  for (let p = 1; p <= SW_CFG.pisos; p++) {
    if (p === 1) mapa.push(['combate']);
    else if (p === SW_CFG.tesoro) mapa.push(['tesoro']);
    else if (p === SW_CFG.descanso) mapa.push(['descanso']);
    else if (p === SW_CFG.pisos) mapa.push(['jefe']);
    else { const a = swPesoNodo(p); let b = swPesoNodo(p, a); if (p === SW_CFG.descanso - 1 && a === 'descanso') b = 'combate'; mapa.push([a, b]); }
  }
  return mapa;
}

/* ---------- crear cartas ---------- */
function swCartaCruce(P) { const op = P.mapa[P.piso - 1]; return { tipo: 'cruce', a: op[0], b: op[1] }; }
function swCartaEvento(P) {
  const libres = SW_EVENTOS.filter(e => !P.eventosVistos.includes(e.id));
  const E = pick(libres.length ? libres : SW_EVENTOS);
  P.eventosVistos.push(E.id);
  return { tipo: 'evento', id: E.id, pre: swSorteo(P, [...E.izq.ef, ...E.der.ef]) };
}
// lo que una carta deja sorteado de antemano: qué reliquia, qué carta nueva, cuál mejora y cuál se quita
function swSorteo(P, efectos) {
  const plano = []; const mira = l => l.forEach(e => { plano.push(e.t); if (e.si) mira(e.si); if (e.no) mira(e.no); }); mira(efectos);
  const pre = {};
  if (plano.includes('reliquia')) pre.reliquia = swReliquiaLibre(P);
  if (plano.includes('carta')) pre.carta = swCartaPremio(P);
  if (plano.includes('mejora')) { const sin = P.mazo.map((c, i) => (c.mejor ? -1 : i)).filter(i => i >= 0); pre.mejora = sin.length ? pick(sin) : null; }
  if (plano.includes('quita')) { const bas = P.mazo.map((c, i) => (SW_CARTAS[c.id].rareza === 0 ? i : -1)).filter(i => i >= 0); pre.quita = bas.length ? pick(bas) : (P.mazo.length > 3 ? 0 : null); }
  return pre;
}
function swCartaPremio(P) {
  const pool = Object.keys(SW_CARTAS).filter(k => SW_CARTAS[k].rareza > 0);
  const pesos = pool.map(k => (SW_CARTAS[k].rareza === 2 ? 1 : 3));
  let t = Math.random() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { t -= pesos[i]; if (t <= 0) return pool[i]; }
  return pool[0];
}
function swPrecio(P, rango) { return Math.round(rand(rango[0], rango[1]) * (swTieneR(P, 'r-tarjeta') ? 0.75 : 1)); }
function swCartasTienda(P) {
  const c1 = swCartaPremio(P); let c2 = swCartaPremio(P); for (let i = 0; i < 6 && c2 === c1; i++) c2 = swCartaPremio(P);
  const r = swReliquiaLibre(P), lista = [{ tipo: 'tienda', que: 'carta', id: c1, precio: swPrecio(P, SW_CFG.precioCarta) },
    { tipo: 'tienda', que: 'carta', id: c2, precio: swPrecio(P, SW_CFG.precioCarta) }];
  if (r) lista.push({ tipo: 'tienda', que: 'reliquia', id: r, precio: swPrecio(P, SW_CFG.precioReliquia) });
  lista.push({ tipo: 'tienda', que: 'quitar', precio: swPrecio(P, [SW_CFG.precioQuitar, SW_CFG.precioQuitar]), pre: swSorteo(P, [{ t: 'quita' }]) });
  return lista;
}
function swCartaDescanso(P) { return { tipo: 'descanso', pre: swSorteo(P, [{ t: 'mejora' }]) }; }

/* ---------- lo que hay a cada lado ---------- */
const swNombreCarta = (id, mejor) => tr(SW_CARTAS[id].nombre) + (mejor ? '+' : '');
// cada lado: { nombre, ef (efectos), icono, bloqueado, porque, flujo (lo que hace la partida además), pago }
function swLados(P, carta) {
  const lado = (nombre, ef, icono, extra = {}) => ({ nombre, ef, icono, bloqueado: false, porque: '', ...extra });
  const conPago = (L, pago) => { if (!pago) return L; L.ef = [{ t: 'pagar', n: pago }, ...L.ef]; L.pago = pago; if (P.oro < pago) { L.bloqueado = true; L.porque = tr('Te falta oro'); } return L; };
  switch (carta.tipo) {
    case 'accion': return [swLadoAccion(P, carta, 'L'), swLadoAccion(P, carta, 'R')];
    case 'cruce': return [lado(SW_NODOS[carta.a].nombre, [], SW_NODOS[carta.a].icono, { flujo: { ir: carta.a } }), lado(SW_NODOS[carta.b].nombre, [], SW_NODOS[carta.b].icono, { flujo: { ir: carta.b } })];
    case 'evento': {
      const E = SW_EVENTOS.find(e => e.id === carta.id);
      return [conPago(lado(E.izq.nombre, E.izq.ef.slice(), swIconoEf(E.izq.ef)), E.izq.pago), conPago(lado(E.der.nombre, E.der.ef.slice(), swIconoEf(E.der.ef)), E.der.pago)];
    }
    case 'tienda': {
      const comprar = carta.que === 'carta' ? [{ t: 'carta' }] : carta.que === 'reliquia' ? [{ t: 'reliquia' }] : [{ t: 'quita' }];
      const pre = carta.que === 'carta' ? { carta: carta.id } : carta.que === 'reliquia' ? { reliquia: carta.id } : carta.pre;
      carta.pre = pre;
      return [lado('Pasar', [], 'i-flecha'), conPago(lado('Comprar', comprar, 'i-oro'), carta.precio)];
    }
    case 'descanso': {
      const cura = Math.round(P.vidaMax * SW_CFG.curaDescanso);
      const ok = carta.pre && carta.pre.mejora != null;
      return [lado('Dormir', [{ t: 'cura', n: cura }], 'n-descanso'), lado('Entrenar', [{ t: 'mejora' }], 'a-golpe', ok ? {} : { bloqueado: true, porque: tr('Ya está todo mejorado') })];
    }
    case 'reliquia': return [lado('Venderla', [{ t: 'oro', n: 40 }], 'i-oro'), lado('Quedártela', [{ t: 'reliquia' }], carta.pre.reliquia)];
    case 'premio': return [lado('Descartar', [], 'i-flecha'), lado('Al mazo', [{ t: 'carta' }], SW_CARTAS[carta.pre.carta].arte[0])];
    case 'botin': return [lado('Todo el oro', [{ t: 'oro', n: carta.oro }], 'i-oro'), lado('Vendarte', [{ t: 'cura', n: SW_CFG.curaBotin }, { t: 'oro', n: Math.round(carta.oro / 2) }], 'a-cura')];
    case 'piso': return [lado('Seguir', [], 'i-flecha'), lado('Seguir', [], 'i-flecha')];
    case 'inicio': { const { a, b } = carta.pre; return [lado(SW_RELIQUIAS[a].nombre, [], a, { texto: SW_RELIQUIAS[a].texto }), lado(SW_RELIQUIAS[b].nombre, [], b, { texto: SW_RELIQUIAS[b].texto })]; }
  }
  return [lado('Seguir', [], 'i-flecha'), lado('Seguir', [], 'i-flecha')];
}
function swIconoEf(ef) {
  const t = ef[0] && ef[0].t;
  return { dano: 'a-golpe', escudo: 'a-escudo', cura: 'a-cura', oro: 'i-oro', herida: 'i-vida', reliquia: 'n-tesoro', carta: 'a-caos', mejora: 'a-golpe',
    quita: 'i-flecha', vidaMax: 'i-vida', fuerzaBase: 'i-espada', azar: 'n-evento' }[t] || 'n-evento';
}

/* ---------- los textos de cada efecto (para el lado de la carta) ---------- */
function swTextoEf(P, e, carta) {
  const pre = carta.pre || {};
  switch (e.t) {
    case 'dano': { let n = e.n + swFuerza(P) + (swTieneR(P, 'r-grapadora') ? 1 : 0); if (P.C && P.C.racha >= SW_CFG.frenesi) n = Math.round(n * SW_CFG.frenesiDano); return (e.k || 1) > 1 ? tr('{n} de daño x{k}', { n, k: e.k }) : tr('{n} de daño', { n }); }
    case 'danoEscudo': return tr('Daño igual a tu escudo');
    case 'escudo': return tr('+{n} de escudo', { n: e.n });
    case 'cura': return e.n >= 99 ? tr('Te curas del todo') : tr('Te curas {n}', { n: e.n });
    case 'caos': return e.n > 0 ? tr('+{n} de caos', { n: e.n }) : tr('Gasta {n} de caos', { n: -e.n });
    case 'veneno': return tr('{n} de veneno', { n: e.n });
    case 'congela': return tr('Congela al enemigo');
    case 'debil': return tr('Lo debilita {n} turnos', { n: e.n });
    case 'fuerza': return tr('+{n} de fuerza', { n: e.n });
    case 'fuerzaBase': return tr('+{n} de fuerza para siempre', { n: e.n });
    case 'oro': return tr('+{n} de oro', { n: Math.round(e.n * (swTieneR(P, 'r-corbata') ? 1.3 : 1)) });
    case 'pagar': return tr('Cuesta {n} de oro', { n: e.n });
    case 'herida': return tr('Pierdes {n} de vida', { n: e.n });
    case 'vidaMax': return tr('+{n} de vida máxima', { n: e.n });
    case 'reliquia': return pre.reliquia ? tr(SW_RELIQUIAS[pre.reliquia].nombre) : tr('Una reliquia');
    case 'carta': return pre.carta ? tr('Carta: {n}', { n: swNombreCarta(pre.carta) }) : tr('Una carta nueva');
    case 'mejora': return pre.mejora != null && P.mazo[pre.mejora] ? tr('Mejora: {n}', { n: swNombreCarta(P.mazo[pre.mejora].id) }) : tr('Mejora una carta');
    case 'quita': return pre.quita != null && P.mazo[pre.quita] ? tr('Quita: {n}', { n: swNombreCarta(P.mazo[pre.quita].id, P.mazo[pre.quita].mejor) }) : tr('Quita una carta');
    case 'azar': return tr('{p} %: {a} / si no: {b}', { p: Math.round(e.p * 100), a: e.si.map(x => swTextoEf(P, x, carta)).join(', '), b: e.no.map(x => swTextoEf(P, x, carta)).join(', ') });
  }
  return '';
}
function swLineas(P, carta, L) {
  if (L.texto) return [tr(L.texto)];
  if (L.flujo && L.flujo.ir) return [tr(SW_NODOS[L.flujo.ir].nombre)];
  if (!L.ef.length) return [];
  return L.ef.map(e => swTextoEf(P, e, carta)).filter(Boolean);
}

/* ---------- el aspecto de cada carta ---------- */
function swAspecto(P, carta) {
  switch (carta.tipo) {
    case 'accion': { const D = SW_CARTAS[carta.id]; return { titulo: swNombreCarta(carta.id, carta.mejor), iconos: D.arte, rareza: D.rareza, texto: '' }; }
    case 'cruce': return { titulo: tr('Dos caminos'), arte: 'ev-cruce', texto: tr('¿Por dónde subes?') };
    case 'evento': { const E = SW_EVENTOS.find(e => e.id === carta.id); return { titulo: tr(E.titulo), arte: E.arte, texto: tr(E.texto) }; }
    case 'tienda': {
      const base = { arte: 'ev-tienda' };
      if (carta.que === 'carta') return { ...base, titulo: swNombreCarta(carta.id), iconos: SW_CARTAS[carta.id].arte, rareza: SW_CARTAS[carta.id].rareza, texto: swResumenCarta(P, carta.id), arte: null };
      if (carta.que === 'reliquia') return { ...base, titulo: tr(SW_RELIQUIAS[carta.id].nombre), reliquia: carta.id, texto: tr(SW_RELIQUIAS[carta.id].texto), arte: null };
      return { ...base, titulo: tr('Trituradora'), texto: tr('El mapache tritura una carta de tu mazo por un módico precio.') };
    }
    case 'descanso': return { titulo: tr('Hoguera de sillas'), arte: 'ev-descanso', texto: tr('Un rincón tranquilo detrás de la fotocopiadora.') };
    case 'reliquia': return { titulo: tr(SW_RELIQUIAS[carta.pre.reliquia].nombre), reliquia: carta.pre.reliquia, texto: tr(SW_RELIQUIAS[carta.pre.reliquia].texto) };
    case 'premio': return { titulo: swNombreCarta(carta.pre.carta), iconos: SW_CARTAS[carta.pre.carta].arte, rareza: SW_CARTAS[carta.pre.carta].rareza, texto: swResumenCarta(P, carta.pre.carta), etiqueta: tr('CARTA NUEVA') };
    case 'botin': return { titulo: tr('¡Victoria!'), arte: 'ev-tesoro', texto: tr('{n} de oro entre los restos. ¿Te lo llevas todo o te paras a vendarte?', { n: carta.oro }) };
    case 'inicio': return { titulo: tr('Elige tu reliquia'), arte: 'ev-tesoro', texto: tr('Antes de subir, coge una. Te acompaña toda la subida.') };
    case 'piso': return { titulo: tr('Piso {n}', { n: P.piso }), arte: carta.arte || null, texto: carta.texto || '' };
  }
  return { titulo: '' };
}
// «izquierda: … / derecha: …» de una carta de acción, para cuando te la ofrecen
function swResumenCarta(P, id) {
  const D = SW_CARTAS[id], f = L => (L.coste ? tr('({n} caos) ', { n: L.coste }) : '') + L.ef.map(e => swTextoEf(P, e, {})).join(', ');
  return tr('Izquierda: {a}', { a: f(D.izq) }) + '\n' + tr('Derecha: {b}', { b: f(D.der) });
}
