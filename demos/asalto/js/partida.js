// Fans of Asalto · PARTIDA: una bajada a la mazmorra. La mazmorra es una tira de niveles (salas) con el jefe al final: en cada nivel
// hay de 1 a 3 salas (combate, cofre, altar de reliquias o vacía) y el jugador elige con las flechas de la arena. El oro, la tienda
// (5 héroes con su precio; cada compra añade OTRO muñeco a la cuadrícula, también si ya lo tienes), mejorar y refrescar la tienda,
// mover y vender héroes, las reliquias, y qué pasa al ganar o perder (perder acaba la partida: no hay corazones).
'use strict';
let AS_P = null;

function asNuevaPartida(zona) {
  AS_P = { zona: zona || 0, oro: AS_CFG.oro, plumas: 0, nivelTienda: 1, oferta: [], equipo: [], reliquias: [], mapa: null, nodo: null,
    nivel: 0, combates: 0, estado: 'elegir', vel: 1, oroBatalla: 0, camino: null, objetos: [], cofre: null, t: 0 };
  asNuevaMazmorra();
  AS_P.nodo.hecho = true;
  asLlenaOferta();
  SAVE.partidas++; asGuarda();
}
function asZona() { return AS_ZONAS[AS_P.zona]; }

/* ---------- la mazmorra: columnas de salas unidas por pasillos ---------- */
function asNuevaMazmorra() {
  const Z = asZona(), C = Z.niveles + 1, cols = [];
  for (let c = 0; c < C; c++) {
    const n = c === 0 || c === C - 1 ? 1 : 1 + (Math.random() < 0.75 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0);
    const col = [];
    for (let i = 0; i < n; i++) {
      let tipo = 'combate';
      if (c === C - 1) tipo = 'jefe';
      else if (c === 0) tipo = 'vacia';
      else if (c > 1) { const r = Math.random(), S = AS_SALAS; tipo = r < S.combate ? 'combate' : r < S.combate + S.cofre ? 'cofre' : r < S.combate + S.cofre + S.altar ? 'altar' : 'vacia'; }
      col.push({ c, i, n, tipo, sig: [], hecho: false });
    }
    if (c > 0 && c < C - 1 && Math.random() < 0.7 && !col.some(x => x.tipo === 'combate')) col[0].tipo = 'combate';
    cols.push(col);
  }
  for (let c = 0; c < C - 1; c++) {   // pasillos: cada sala lleva a 1-3 de la columna siguiente y a todas se puede llegar
    const a = cols[c], b = cols[c + 1];
    a.forEach((n, i) => {
      const j = Math.round(i * (b.length - 1) / Math.max(1, a.length - 1)); n.sig.push(j);
      for (const d of [-1, 1]) if (b[j + d] && Math.random() < 0.55) n.sig.push(j + d);
    });
    b.forEach((_, j) => { if (!a.some(n => n.sig.includes(j))) a[Math.min(a.length - 1, Math.round(j * (a.length - 1) / Math.max(1, b.length - 1)))].sig.push(j); });
    a.forEach(n => { n.sig = [...new Set(n.sig)].sort((x, y) => x - y); });
  }
  AS_P.mapa = cols; AS_P.nodo = cols[0][0];
}
// las salas a las que se puede ir ahora, con su flecha: 1 → derecha; 2 → arriba y abajo; 3 → arriba, derecha y abajo
function asSalidas() {
  const P = AS_P, n = P.nodo;
  if (!n || !n.hecho || P.estado !== 'elegir') return [];
  const sig = n.sig.map(j => P.mapa[n.c + 1][j]);
  const flechas = sig.length === 1 ? ['der'] : sig.length === 2 ? ['arr', 'aba'] : ['arr', 'der', 'aba'];
  return sig.map((s, i) => ({ nodo: s, flecha: flechas[i] }));
}
function asIrA(nodo) {
  const P = AS_P;
  if (!asSalidas().some(s => s.nodo === nodo)) { play('asNoVale'); return; }
  P.estado = 'camino'; P.camino = { a: nodo, t: 0, dura: 1.3 }; play('asPaso');
}
// el grupo ha llegado a la sala nueva
function asLlega() {
  const P = AS_P, n = P.camino.a;
  P.nodo = n; P.nivel = n.c; P.camino = null;
  if (n.tipo === 'combate' || n.tipo === 'jefe') {
    P.estado = 'tienda'; asLlenaOferta(); asPreparaCombate();
    asMusica(n.tipo === 'jefe' ? 'boss' : 'animales');
    if (n.tipo === 'jefe') { asAviso(tr('¡LLEGA EL JEFE!'), false, true); asConsejo('jefe'); } else asConsejo('tienda2');
  } else if (n.tipo === 'cofre') { P.estado = 'cofre'; P.cofre = { t: 0, abierto: false, oro: rand(AS_CFG.oroCofre[0], AS_CFG.oroCofre[1] + 1) | 0, plumas: rand(AS_CFG.plumasCofre[0], AS_CFG.plumasCofre[1] + 1) | 0 }; play('asPaso'); asConsejo('cofre'); }
  else if (n.tipo === 'altar') { P.estado = 'altar'; P.altar = { t: 0 }; asConsejo('altar'); setTimeout(() => { if (AS_P === P && P.estado === 'altar') asVentanaReliquias(() => asSalaHecha()); }, 900); }
  else asSalaHecha();
}
function asSalaHecha() { AS_P.nodo.hecho = true; AS_P.estado = 'elegir'; asMusica('animales'); asConsejo('flechas'); }

/* ---------- la tienda ---------- */
function asLlenaOferta() {
  const P = AS_P, n = P.nivelTienda, tipos = Object.keys(AS_HEROES).filter(asHay);
  P.oferta = [];
  for (let i = 0; i < AS_TIENDA.huecos; i++) {
    const pesos = tipos.map(t => AS_TIENDA.peso(AS_HEROES[t].precio, n)), total = pesos.reduce((a, b) => a + b, 0);
    let r = Math.random() * total, k = 0;
    while (k < tipos.length - 1 && r >= pesos[k]) { r -= pesos[k]; k++; }
    P.oferta.push(tipos[k] || null);
  }
}
function asCeldaLibre() {
  for (let col = AS_COLS - 1; col >= 0; col--) for (const f of [3, 4, 2, 5, 1, 6, 0, 7]) if (!AS_P.equipo.some(h => h.celda[0] === col && h.celda[1] === f)) return [col, f];
  return null;
}
// ¿se puede comprar? devuelve el motivo si no
function asPorQueNo(i) {
  const tipo = AS_P.oferta[i]; if (!tipo) return 'vacio';
  if (AS_P.oro < AS_HEROES[tipo].precio) return 'oro';
  if (!asCeldaLibre()) return 'lleno';
  return null;
}
function asCompra(i) {
  const no = asPorQueNo(i), tipo = AS_P.oferta[i];
  if (no) {
    play('asNoVale');
    if (no === 'oro') asAviso(tr('No tienes oro suficiente'));
    else if (no === 'lleno') asAviso(tr('La cuadrícula está llena'));
    return false;
  }
  AS_P.oro -= AS_HEROES[tipo].precio;
  AS_P.equipo.push({ tipo, celda: asCeldaLibre(), brillo: 1 });
  AS_P.oferta[i] = null; play('asCompra');
  asConsejo(AS_P.equipo.length === 1 ? 'mover' : AS_P.equipo.length === 2 ? 'clases' : 'repetir');
  return true;
}
function asPrecioVenta(h) { return Math.max(1, Math.ceil(AS_HEROES[h.tipo].precio / 2)); }
function asVende(h) {
  if (AS_P.equipo.length <= 1) { play('asNoVale'); asAviso(tr('Te quedarías sin equipo')); return; }
  AS_P.oro += asPrecioVenta(h); AS_P.equipo = AS_P.equipo.filter(x => x !== h); play('asCompra');
}
function asMueve(h, celda) {
  const otro = AS_P.equipo.find(x => x !== h && x.celda[0] === celda[0] && x.celda[1] === celda[1]);
  if (otro) otro.celda = h.celda;
  h.celda = celda; play('asPaso');
}
function asCosteMejora() { return AS_TIENDA.mejorar[AS_P.nivelTienda - 1] || 0; }
function asMejoraTienda() {
  if (AS_P.nivelTienda >= AS_TIENDA.nivelMax) { play('asNoVale'); asAviso(tr('La tienda ya está al máximo')); return; }
  const c = asCosteMejora();
  if (AS_P.oro < c) { play('asNoVale'); asAviso(tr('No tienes oro suficiente')); return; }
  AS_P.oro -= c; AS_P.nivelTienda++; play('asSube'); asAviso(tr('¡Tienda mejorada! Nivel {n}: salen héroes mejores', { n: AS_P.nivelTienda }), true);
}
function asRefresca() {
  if (AS_P.oro < AS_TIENDA.refrescar) { play('asNoVale'); asAviso(tr('No tienes oro suficiente')); return; }
  AS_P.oro -= AS_TIENDA.refrescar; asLlenaOferta(); play('asRefresca');
}

/* ---------- los combates ---------- */
// dónde van a salir los enemigos: puntos rojos repartidos por la mitad derecha, que no se pisen
function asPuntosEnemigos(n) {
  const pts = [], A = AS_ARENA;
  for (let i = 0; i < n * 20 && pts.length < n; i++) {
    const p = [rand(300, 500), rand(A.y + 110, A.y + A.h - 30)];
    if (!pts.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 46)) pts.push(p);
  }
  return pts;
}
function asOleada() {
  const P = AS_P, Z = asZona(), n = P.nodo, lista = Z.enemigos.filter(asHay), sale = [];
  if (n.tipo === 'jefe' && asHay(Z.jefe.tipo)) {
    const pts = asPuntosEnemigos(3);
    sale.push({ tipo: Z.jefe.tipo, fuerza: Z.jefe.fuerza * Z.fuerza(P.nivel), escala: Z.jefe.escala, pos: [400, AS_ARENA.y + AS_ARENA.h / 2], jefe: true });
    for (const p of pts.slice(0, 2)) if (lista.length) sale.push({ tipo: pick(lista), fuerza: Z.fuerza(P.nivel), pos: p });
    return sale;
  }
  const pts = asPuntosEnemigos(Z.cuantos(P.nivel));
  for (const p of pts) if (lista.length) sale.push({ tipo: pick(lista), fuerza: Z.fuerza(P.nivel), pos: p });
  return sale;
}
function asPreparaCombate() { AS_P.proxima = asOleada(); }   // los puntos rojos (o el jefe) se ven antes de luchar
function asLucha() {
  const P = AS_P;
  if (!P.equipo.length) { play('asNoVale'); asAviso(tr('Compra al menos un héroe')); return; }
  P.estado = 'batalla'; P.oroBatalla = 0;
  asEmpiezaBatalla(P.proxima || asOleada());
  asConsejo('batalla');
  // los logros de «lucha con N»
  const { cuenta } = asSinergias(P.equipo);
  SAVE.stats.maxEquipo = Math.max(SAVE.stats.maxEquipo || 0, P.equipo.length);
  for (const k in cuenta) SAVE.stats.maxClase[k] = Math.max(SAVE.stats.maxClase[k] || 0, cuenta[k]);
}
// la batalla ha acabado (lo llama el bucle cuando AS_B.fin lleva un rato puesto)
function asTrasBatalla() {
  const P = AS_P, fin = AS_B.fin, jefe = P.nodo.tipo === 'jefe';
  if (fin === 'victoria') {
    P.combates++;
    const oro = (jefe ? AS_CFG.oroJefe : AS_CFG.oroVictoria(P.nivel)) + (asTiene('hucha') ? 3 : 0) + P.oroBatalla;
    asSintonia('win');
    const objetos = jefe ? asPremioJefe() : [];
    asVentanaVictoria(oro, jefe ? AS_CFG.plumasJefe : 0, objetos, () => {
      AS_B = null; P.nodo.hecho = true;
      if (jefe) { asApuntaStat('jefes', 1); asTerminaZona(); return; }
      P.estado = 'elegir'; asMusica('animales'); asConsejo('flechas');
    });
  } else {
    asSintonia('lose');
    SAVE.mejor = Math.max(SAVE.mejor, P.nivel); asGuarda();
    asVentanaFin(false);
  }
}
function asPremioJefe() {
  const Z = asZona();
  return Z.rareza.map(r => asObjetoNuevo(Math.min(2, r + (Math.random() < 0.25 ? 1 : 0))));
}
// la zona entera está hecha: se abre la siguiente, se guardan los objetos y salen los logros
function asTerminaZona() {
  const P = AS_P;
  if (!SAVE.zonas.includes(P.zona)) SAVE.zonas.push(P.zona);
  if (!SAVE.stats.zonas.includes(P.zona)) SAVE.stats.zonas.push(P.zona);
  SAVE.mejor = Math.max(SAVE.mejor, P.nivel); asGuarda();
  asVentanaFin(true);
}
// lo que da el oro y las plumas durante la partida (y a las estadísticas de los logros)
function asGanaOro(n) { AS_P.oro += n; asApuntaStat('oroTotal', n); }
function asGanaPlumas(n) { AS_P.plumas += n; SAVE.plumas += n; asGuarda(); }
