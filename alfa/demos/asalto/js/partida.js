// Fans of Asalto · PARTIDA: una bajada a la mazmorra. El oro, los corazones, la tienda (5 héroes a la venta, mejorarla, refrescarla),
// el equipo en la cuadrícula (comprar uno que ya tienes le sube de nivel), el mapa de cada piso (salas unidas por pasillos: combate,
// cofre, reliquia y el jefe al final) y qué pasa al ganar o perder cada combate.
'use strict';
let AS_P = null;

function asNuevaPartida() {
  AS_P = { oro: AS_CFG.oro, corazones: AS_CFG.corazones, nivelTienda: 1, oferta: [], equipo: [], reliquias: [], zona: 0, piso: 0,
    mapa: null, nodo: null, combates: 0, combatesPiso: 0, estado: 'tienda', gemas: 0, vel: 1, cofreAbierto: false };
  asNuevoPiso();
  asLlenaOferta();
  asPreparaCombate();
  SAVE.partidas++; asGuarda();
}
function asPisoDef() { return AS_ZONAS[AS_P.zona].pisos[AS_P.piso]; }

/* ---------- el mapa del piso ---------- */
function asNuevoPiso() {
  const C = AS_MAPA.columnas, nodos = [];
  for (let c = 0; c < C; c++) {
    const n = c === 0 || c === C - 1 ? 1 : 2 + (Math.random() < 0.5 ? 1 : 0);
    const col = [];
    for (let i = 0; i < n; i++) {
      let tipo = 'combate';
      if (c === C - 1) tipo = 'jefe';
      else if (c > 0) { const r = Math.random(); tipo = r < AS_MAPA.tipos.combate ? 'combate' : r < AS_MAPA.tipos.combate + AS_MAPA.tipos.cofre ? 'cofre' : 'reliquia'; }
      col.push({ c, i, n, tipo, sig: [], hecho: false });
    }
    if (c > 0 && c < C - 1 && !col.some(x => x.tipo === 'combate')) col[0].tipo = 'combate';   // siempre se puede pelear
    nodos.push(col);
  }
  // pasillos: cada sala va a una o dos de la columna siguiente, y a todas se puede llegar
  for (let c = 0; c < C - 1; c++) {
    const a = nodos[c], b = nodos[c + 1];
    a.forEach((n, i) => { const j = Math.round(i * (b.length - 1) / Math.max(1, a.length - 1)); n.sig.push(j); if (b.length > 1 && Math.random() < 0.5) n.sig.push(clamp(j + (Math.random() < 0.5 ? -1 : 1), 0, b.length - 1)); });
    b.forEach((_, j) => { if (!a.some(n => n.sig.includes(j))) a[Math.min(a.length - 1, Math.round(j * (a.length - 1) / Math.max(1, b.length - 1)))].sig.push(j); });
    a.forEach(n => { n.sig = [...new Set(n.sig)]; });
  }
  AS_P.mapa = nodos; AS_P.nodo = nodos[0][0]; AS_P.combatesPiso = 0;
}
function asPuedeIr(n) { const a = AS_P.nodo; return a && a.hecho && n.c === a.c + 1 && a.sig.includes(n.i); }
function asIrA(n) {
  if (!asPuedeIr(n)) { play('asNoVale'); return; }
  AS_P.nodo = n; play('asPaso');
  if (n.tipo === 'combate' || n.tipo === 'jefe') { AS_P.estado = 'tienda'; asLlenaOferta(true); asPreparaCombate(); asMusica(n.tipo === 'jefe' ? 'boss' : 'animales'); asConsejo(n.tipo === 'jefe' ? 'jefe' : 'tienda2'); }
  else if (n.tipo === 'cofre') { AS_P.estado = 'sala'; asVentanaCofre(rand(AS_CFG.oroCofre[0], AS_CFG.oroCofre[1]) | 0, false, () => asSalaHecha()); }
  else if (n.tipo === 'reliquia') { AS_P.estado = 'sala'; asVentanaReliquias(() => asSalaHecha()); }
}
function asSalaHecha() { AS_P.nodo.hecho = true; AS_P.estado = 'mapa'; asMusica('animales'); }

/* ---------- la tienda ---------- */
function asHeroesDisponibles(tier) { return Object.keys(AS_HEROES).filter(k => AS_HEROES[k].tier === tier && asHay(k)); }
function asLlenaOferta(gratis) {
  const pr = AS_TIENDA.prob[AS_P.nivelTienda] || AS_TIENDA.prob[1];
  AS_P.oferta = [];
  for (let i = 0; i < AS_TIENDA.huecos; i++) {
    let r = Math.random(), tier = 1;
    if (r > pr[0]) tier = r > pr[0] + pr[1] ? 3 : 2;
    let lista = asHeroesDisponibles(tier);
    if (!lista.length) lista = asHeroesDisponibles(1);
    AS_P.oferta.push(lista.length ? pick(lista) : null);
  }
}
function asCapacidad() { return Math.min(Object.keys(AS_HEROES).length, AS_TIENDA.equipo(AS_P.nivelTienda)); }
function asEnEquipo(tipo) { return AS_P.equipo.find(h => h.tipo === tipo); }
function asCeldaLibre() {
  for (const col of [2, 1, 0]) for (const f of [1, 2, 0, 3]) if (!AS_P.equipo.some(h => h.celda[0] === col && h.celda[1] === f)) return [col, f];
  return null;
}
// ¿se puede comprar? devuelve el motivo si no
function asPorQueNo(i) {
  const tipo = AS_P.oferta[i]; if (!tipo) return 'vacio';
  const h = asEnEquipo(tipo), coste = AS_HEROES[tipo].tier;
  if (AS_P.oro < coste) return 'oro';
  if (h) return h.nivel >= AS_TIENDA.nivelMax ? 'max' : null;
  if (AS_P.equipo.length >= asCapacidad()) return 'lleno';
  return null;
}
function asCompra(i) {
  const no = asPorQueNo(i), tipo = AS_P.oferta[i];
  if (no) {
    play('asNoVale');
    if (no === 'oro') asAviso(tr('No tienes oro suficiente'));
    else if (no === 'lleno') asAviso(tr('Equipo lleno: mejora la tienda para que quepan más'));
    else if (no === 'max') asAviso(tr('Ese héroe ya está al máximo'));
    return false;
  }
  AS_P.oro -= AS_HEROES[tipo].tier;
  const h = asEnEquipo(tipo);
  if (h) { h.nivel++; h.brillo = 1; play('asSube'); asAviso(tr('{n} sube a nivel {v}', { n: tr(AS_HEROES[tipo].nombre), v: h.nivel }), true); }
  else { AS_P.equipo.push({ tipo, nivel: 1, celda: asCeldaLibre(), brillo: 1 }); play('asCompra'); asConsejo(AS_P.equipo.length === 1 ? 'mover' : 'clases'); }
  AS_P.oferta[i] = null;
  return true;
}
function asPrecioVenta(h) { return Math.max(1, Math.ceil(AS_HEROES[h.tipo].tier * h.nivel / 2)); }
function asVende(h) {
  if (AS_P.equipo.length <= 1) { play('asNoVale'); asAviso(tr('Te quedarías sin equipo')); return; }
  AS_P.oro += asPrecioVenta(h); AS_P.equipo = AS_P.equipo.filter(x => x !== h); play('asCompra');
}
function asMueve(h, celda) {
  const otro = AS_P.equipo.find(x => x !== h && x.celda[0] === celda[0] && x.celda[1] === celda[1]);
  if (otro) otro.celda = h.celda;
  h.celda = celda; play('asPaso');
}
function asCosteMejora() { return AS_TIENDA.mejorar[AS_P.nivelTienda] || 0; }
function asMejoraTienda() {
  if (AS_P.nivelTienda >= Object.keys(AS_TIENDA.prob).length) { play('asNoVale'); asAviso(tr('La tienda ya está al máximo')); return; }
  const c = asCosteMejora();
  if (AS_P.oro < c) { play('asNoVale'); asAviso(tr('No tienes oro suficiente')); return; }
  AS_P.oro -= c; AS_P.nivelTienda++; play('asSube'); asAviso(tr('Tienda a nivel {n}: salen héroes mejores y cabe uno más', { n: AS_P.nivelTienda }), true);
}
function asRefresca() {
  if (AS_P.oro < AS_TIENDA.refrescar) { play('asNoVale'); asAviso(tr('No tienes oro suficiente')); return; }
  AS_P.oro -= AS_TIENDA.refrescar; asLlenaOferta(); play('asRefresca');
}

/* ---------- los combates ---------- */
function asOleada() {
  const p = asPisoDef(), n = AS_P.nodo, lista = p.enemigos.filter(asHay), sale = [];
  const libres = []; for (let c = 0; c < AS_COLS; c++) for (let f = 0; f < AS_FILAS; f++) libres.push([c, f]);
  shuffle(libres);
  if (n.tipo === 'jefe' && asHay(p.jefe.tipo)) {
    sale.push({ tipo: p.jefe.tipo, fuerza: p.jefe.fuerza * p.fuerza, escala: p.jefe.escala, celda: [1, 1.5], jefe: true });
    for (const c of [[2, 0], [2, 3]]) if (lista.length) sale.push({ tipo: pick(lista), fuerza: p.fuerza, celda: c });
    return sale;
  }
  const k = AS_P.combatesPiso, cuantos = Math.min(9, Math.floor(p.n[0] + k * p.n[1] + AS_P.piso * 0.5));
  for (let i = 0; i < cuantos && lista.length; i++) sale.push({ tipo: pick(lista), fuerza: p.fuerza * (1 + 0.22 * k), celda: libres[i] });
  return sale;
}
function asPreparaCombate() { AS_P.proxima = asOleada(); }   // los enemigos se ven antes de luchar, para colocar al equipo
function asLucha() {
  if (!AS_P.equipo.length) { play('asNoVale'); asAviso(tr('Compra al menos un héroe')); return; }
  AS_P.estado = 'batalla';
  asEmpiezaBatalla(AS_P.proxima || asOleada()); AS_P.proxima = null;
  asConsejo('batalla');
}
// la batalla ha acabado (lo llama el bucle cuando AS_B.fin lleva un rato puesto)
function asTrasBatalla() {
  const P = AS_P, fin = AS_B.fin, jefe = P.nodo.tipo === 'jefe';
  if (fin === 'victoria') {
    P.combates++; P.combatesPiso++;
    const oro = AS_CFG.oroVictoria(P.combates) + (asTiene('hucha') ? 3 : 0);
    asSintonia('win');
    asVentanaCofre(oro, jefe, () => {
      AS_B = null; P.nodo.hecho = true;
      if (jefe) {
        P.gemas += AS_CFG.gemasJefe; SAVE.gemas += AS_CFG.gemasJefe;
        SAVE.mejor = Math.max(SAVE.mejor, P.piso + 1); asGuarda();
        if (P.piso + 1 >= AS_ZONAS[P.zona].pisos.length) { SAVE.victorias++; asGuarda(); asVentanaFin(true); return; }
        P.piso++; asNuevoPiso(); P.nodo.hecho = true;
        asAviso(tr('¡Piso {n}!', { n: P.piso + 1 }), true);
      }
      P.estado = 'mapa'; asMusica('animales'); asConsejo('mapa');
    });
  } else {
    P.corazones--;
    asSintonia('lose');
    if (P.corazones <= 0) { AS_B = null; SAVE.mejor = Math.max(SAVE.mejor, P.piso); asGuarda(); asVentanaFin(false); return; }
    asVentanaDerrota(() => { AS_B = null; P.oro += 2; P.estado = 'tienda'; asLlenaOferta(); asPreparaCombate(); asMusica(jefe ? 'boss' : 'animales'); });
  }
}
