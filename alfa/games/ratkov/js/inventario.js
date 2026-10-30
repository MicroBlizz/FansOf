// Fans of Ratkov · INVENTARIO: cómo se guardan las cosas. Hay dos clases de listas:
// - de casillas sueltas (el alijo y los bolsillos): cada casilla es un objeto { id, n } o null;
// - de cuadrícula, la mochila Tetris (la mochila, la riñonera y lo que hay dentro de un contenedor): cada objeto lleva además su sitio
//   (gx, gy) y su giro (gr), y ocupa las casillas de su forma (js/formas.js).
// meter() sabe cuál es cuál por lo que le pasas: un número de casillas o unas medidas { w, h }.
// Lo que se apila (balas, vendas…) se junta hasta su máximo (OBJ[id].max), pero solo con lo de su misma clase: lo «encontrado en
// incursión» (fir) no se mezcla con lo comprado.
'use strict';
let ALIJO_MAX = 120;   // crece con las estanterías (js/mejoras.js, ajustaAlijo)

// un objeto nuevo listo para guardar (las armas, con su cargador; lo que se gasta, con su durabilidad entera)
function nuevoObj(id, n = 1) {
  const o = { id, n };
  if (ARMAS[id]) { o.n = 1; o.mods = {}; o.bal = 0; }
  if (OBJ[id] && OBJ[id].dur) o.dur = OBJ[id].dur;
  return o;
}
const apilable = o => !ARMAS[o.id] && OBJ[o.id] && OBJ[o.id].max > 1 && o.dur == null;
const copia = o => (o ? JSON.parse(JSON.stringify(o)) : null);
const juntables = (a, b) => a.id === b.id && !!a.fir === !!b.fir;
const sinSitio = o => { delete o.gx; delete o.gy; delete o.gr; return o; };

/* ---------- la cuadrícula ---------- */
const enRejilla = cap => typeof cap === 'object' && cap !== null;
// ¿cabe la pieza id, girada rot, con su esquina en (x, y)? «sin» es la pieza que se está moviendo (no choca consigo misma)
function cabeEn(lista, dim, id, rot, x, y, sin) {
  const f = formaDe(id, rot);
  if (x < 0 || y < 0 || x + f.w > dim.w || y + f.h > dim.h) return false;
  for (const o of lista) {
    if (!o || o === sin || o.gx == null) continue;
    const g = formaDe(o.id, o.gr || 0);
    if (o.gx >= x + f.w || o.gx + g.w <= x || o.gy >= y + f.h || o.gy + g.h <= y) continue;
    for (const [a, b] of f.c) if (g.c.some(([c, d]) => o.gx + c === x + a && o.gy + d === y + b)) return false;
  }
  return true;
}
// el primer hueco (de arriba abajo, de izquierda a derecha) donde cabe, probando los cuatro giros
function sitioPara(lista, dim, id, rot0 = 0, sin = null) {
  for (let y = 0; y < dim.h; y++) for (let x = 0; x < dim.w; x++) for (let r = 0; r < 4; r++) { const rot = (rot0 + r) % 4; if (cabeEn(lista, dim, id, rot, x, y, sin)) return { gx: x, gy: y, gr: rot }; }
  return null;
}
// la pieza que ocupa la casilla (x, y)
function piezaEn(lista, x, y) {
  return lista.find(o => o && o.gx != null && formaDe(o.id, o.gr || 0).c.some(([a, b]) => o.gx + a === x && o.gy + b === y)) || null;
}
// coloca todo lo que no tenga sitio (partidas viejas, botín recién sorteado). Devuelve lo que no ha cabido (y lo saca de la lista)
function colocaTodo(lista, dim, crece = false) {
  compacta(lista);
  const fuera = [], sueltos = lista.filter(o => o.gx == null || !cabeEn(lista.filter(p => p !== o && p.gx != null), dim, o.id, o.gr || 0, o.gx, o.gy));
  for (const o of sueltos) sinSitio(o);
  sueltos.sort((a, b) => celdasDe(b.id) - celdasDe(a.id));
  for (const o of sueltos) {
    let s = sitioPara(lista, dim, o.id);
    while (!s && crece && dim.h < 40) { dim.h++; s = sitioPara(lista, dim, o.id); }
    if (s) Object.assign(o, s); else fuera.push(o);
  }
  for (const o of fuera) lista.splice(lista.indexOf(o), 1);
  return fuera;
}
// ORDENAR (solo en el refugio): vuelve a colocar todo de mayor a menor; si así no cabe, lo deja como estaba
function ordenaRejilla(lista, dim) {
  compacta(lista); const antes = lista.map(o => [o, o.gx, o.gy, o.gr]);
  lista.forEach(sinSitio);
  const orden = lista.slice().sort((a, b) => celdasDe(b.id) - celdasDe(a.id) || formaDe(b.id).w - formaDe(a.id).w);
  for (const o of orden) { const s = sitioPara(lista, dim, o.id); if (!s) { for (const [p, x, y, r] of antes) Object.assign(p, { gx: x, gy: y, gr: r }); return false; } Object.assign(o, s); }
  return true;
}

// mete un objeto en una lista: con «cap» número, en casillas sueltas; con «cap» { w, h }, en la cuadrícula.
// Devuelve cuántos no han cabido (0 si todo)
function meter(lista, o, cap) {
  if (!o) return 0;
  // un arma o algo de uno en uno sin su «n» (partidas viejas): cuenta como 1. Antes se daba por metido y se perdía
  if (!o.n && OBJ[o.id] && (ARMAS[o.id] || OBJ[o.id].max === 1)) o.n = 1;
  if (!o.n) return 0;
  const rejilla = enRejilla(cap);
  // en los bolsillos solo cabe lo de una casilla
  if (!rejilla && cap !== ALIJO_MAX && celdasDe(o.id) > 1) return o.n;
  let n = o.n;
  const nueva = m => { const p = copia(o); p.n = m; if (rejilla) { const s = sitioPara(lista, cap, o.id, o.gr || 0); if (!s) return false; Object.assign(p, s); lista.push(p); return true; } sinSitio(p); const i = huecoEn(lista, cap); if (i < 0) return false; lista[i] = p; return true; };
  if (apilable(o)) {
    const max = OBJ[o.id].max;
    for (const c of lista) if (c && juntables(c, o) && c.n < max) { const m = Math.min(max - c.n, n); c.n += m; n -= m; if (!n) return 0; }
    while (n > 0) { const m = Math.min(max, n); if (!nueva(m)) return n; n -= m; }
    return 0;
  }
  for (let k = 0; k < n; k++) if (!nueva(1)) return n - k;
  return 0;
}
// la primera casilla libre (o -1). Las listas fijas (bolsillos) tienen null; las variables (alijo) crecen hasta «casillas»
function huecoEn(lista, casillas) {
  for (let i = 0; i < Math.min(lista.length, casillas); i++) if (!lista[i]) return i;
  return lista.length < casillas ? lista.length : -1;
}
// ¿cabría? (sin meterlo)
function cabe(lista, o, cap) { const prueba = lista.map(copia); return meter(prueba, o, cap) === 0; }
const cuantos = (lista, id) => lista.reduce((t, c) => t + (c && c.id === id ? c.n : 0), 0);
const cuantosFir = (lista, id) => lista.reduce((t, c) => t + (c && c.id === id && c.fir ? c.n : 0), 0);
// quita n de un objeto (de las casillas que haga falta; «soloFir» para los encargos). Devuelve cuántos ha quitado
function quitar(lista, id, n, soloFir = false) {
  let q = 0;
  for (let i = lista.length - 1; i >= 0 && q < n; i--) {
    const c = lista[i]; if (!c || c.id !== id || (soloFir && !c.fir)) continue;
    const m = Math.min(c.n, n - q); c.n -= m; q += m; if (c.n <= 0) lista[i] = null;
  }
  return q;
}
// quita los huecos vacíos (para listas variables y cuadrículas)
function compacta(lista) { for (let i = lista.length - 1; i >= 0; i--) if (!lista[i]) lista.splice(i, 1); return lista; }
// casillas ocupadas: en la cuadrícula cuenta la forma; en casillas sueltas, una por objeto
const casillasUsadas = lista => lista.reduce((t, o) => t + (!o ? 0 : o.gx != null ? celdasDe(o.id) : 1), 0);
const pesoLista = lista => lista.reduce((t, c) => t + pesoDe(c), 0);
const valorLista = lista => lista.reduce((t, c) => t + valorDe(c), 0);

// las medidas de la mochila que llevas ({ w, h }; JunkCoon, una fila más)
function casillasMochila(eq = SAVE.equipo, animal = SAVE.animal) {
  const d = DIM_MOCHILA[eq.mochila && DIM_MOCHILA[eq.mochila.id] ? eq.mochila.id : ''];
  return { w: d.w, h: d.h + (animal === 'junkcoon' ? 1 : 0) };
}
const totalCasillas = d => d.w * d.h;
// lo que pesa todo lo que llevas encima
function pesoEncima(eq, mochila, bolsillos, rinonera) {
  let p = 0;
  for (const k of ['arma1', 'arma2', 'chaleco', 'casco', 'mochila']) p += pesoDe(eq[k]);
  return p + pesoLista(mochila) + pesoLista(bolsillos) + pesoLista(rinonera);
}
// a partir de este peso empiezas a ir más lento y a cansarte al esquivar (y con el doble, muy lento)
const PESO_LIBRE = 22;

// meter en el alijo (lo que no quepa se pierde: se avisa antes)
const meterAlijo = o => meter(SAVE.alijo, o, ALIJO_MAX);
const uid = () => (SAVE.uid = (SAVE.uid || 1) + 1);
// las partidas de antes de la mochila Tetris: la mochila y la riñonera pasan a cuadrícula; lo que no quepa, al alijo
function ajustaMochilas() {
  for (const o of colocaTodo(SAVE.mochila, casillasMochila())) meterAlijo(o);
  for (const o of colocaTodo(SAVE.rinonera, DIM_RINONERA)) meterAlijo(o);
  SAVE.bolsillos = SAVE.bolsillos.map(o => (o && celdasDe(o.id) > 1 ? (meterAlijo(o), null) : o));
  while (SAVE.bolsillos.length < 3) SAVE.bolsillos.push(null);
}
