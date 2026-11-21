// Fans of Auto · LOS CAMINOS del barrio, lo que comparte toda la inteligencia: a qué cruce pertenece cada casilla, los pasos
// de cebra (dónde y hacia dónde se cruza), los semáforos (en qué color está cada cruce para cada eje), los «campos» de caminos
// (cuánto cuesta llegar desde cada casilla hasta un destino, para que los Moderadores, las bandas y las emergencias sepan ir
// por las calles en vez de en línea recta) y la línea de visión (si un edificio tapa a dos puntos). No guarda estado de la
// partida: se monta una vez con el mapa (preparaRutas) y lo demás son consultas.
'use strict';

const RUTAS = { cruceDe: null, paso: null, orillas: [], orillasDe: new Map(), cache: new Map() };
const CICLO_SEMAFORO = 660, VERDE = 240, AMBAR = 60;   // 4 s verde, 1 s ámbar y medio segundo todo en rojo, para cada eje

const idx = (tx, ty) => ty * MAPA.W + tx;
const esCalle = (tx, ty) => tipoEn(tx, ty) === TIPO.CALLE;
function carrilEn(tx, ty) { const k = idx(tx, ty) * 2; return [MAPA.carril[k], MAPA.carril[k + 1]]; }
function esCarril(tx, ty) { if (!esCalle(tx, ty)) return false; const [dx, dy] = carrilEn(tx, ty); return dx !== 0 || dy !== 0; }
function esCruce(tx, ty) { return enMapa(tx, ty) && RUTAS.cruceDe[idx(tx, ty)] >= 0; }
// casilla por la que andan los peatones sin peligro (acera, hierba o explanada)
function esAcera(tx, ty) { const t = tipoEn(tx, ty); return t === TIPO.ACERA || t === TIPO.HIERBA || t === TIPO.SOLAR; }

function preparaRutas() {
  RUTAS.cruceDe = new Int16Array(MAPA.W * MAPA.H).fill(-1);
  RUTAS.paso = new Uint8Array(MAPA.W * MAPA.H);
  RUTAS.orillas = []; RUTAS.orillasDe = new Map(); RUTAS.cache = new Map();
  MAPA.cruces.forEach((q, i) => {
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (enMapa(q.x + dx, q.y + dy)) RUTAS.cruceDe[idx(q.x + dx, q.y + dy)] = i;
    q.semaforo = q.salidas.length === 4;   // solo en los cruces de verdad; en las T del borde no hace falta
    q.desfase = (q.x * 37 + q.y * 91) % CICLO_SEMAFORO;
  });
  for (const q of MAPA.cruces) for (const brazo of brazosDe(q)) anadePaso(brazo);
}
// los cuatro brazos de un cruce: las dos casillas de calzada que se cruzan andando y las dos aceras de los extremos
function brazosDe(q) {
  const { x: c, y: f } = q;
  return [
    { casillas: [[c, f - 1], [c + 1, f - 1]], a: [c - 1, f - 1], b: [c + 2, f - 1], d: [1, 0] },
    { casillas: [[c, f + 2], [c + 1, f + 2]], a: [c - 1, f + 2], b: [c + 2, f + 2], d: [1, 0] },
    { casillas: [[c - 1, f], [c - 1, f + 1]], a: [c - 1, f - 1], b: [c - 1, f + 2], d: [0, 1] },
    { casillas: [[c + 2, f], [c + 2, f + 1]], a: [c + 2, f - 1], b: [c + 2, f + 2], d: [0, 1] },
  ];
}
function anadePaso(br) {
  if (!br.casillas.every(([x, y]) => esCarril(x, y)) || !esAcera(...br.a) || !esAcera(...br.b)) return;
  const n = RUTAS.orillas.length;
  RUTAS.orillas.push(br);
  for (const [x, y] of br.casillas) RUTAS.paso[idx(x, y)] = br.d[0] ? 1 : 2;   // 1: se cruza de lado a lado, 2: de arriba abajo
  for (const extremo of [br.a, br.b]) {
    const k = idx(...extremo);
    if (!RUTAS.orillasDe.has(k)) RUTAS.orillasDe.set(k, []);
    RUTAS.orillasDe.get(k).push(n);
  }
}

/* ---------- los semáforos ---------- */
// el color para el eje 'v' (coches que suben o bajan) o 'h' (los que van de lado) en el instante tick
function luz(q, eje, tick) {
  if (!q.semaforo) return 'verde';
  const t = (tick + q.desfase) % CICLO_SEMAFORO, mitad = CICLO_SEMAFORO / 2, u = eje === 'v' ? t : (t + mitad) % CICLO_SEMAFORO;
  return u < VERDE ? 'verde' : u < VERDE + AMBAR ? 'ambar' : 'rojo';
}
const ejeDe = (dx, dy) => (dy !== 0 ? 'v' : 'h');

/* ---------- los campos de caminos (Dijkstra sobre las casillas) ---------- */
// coste de pisar cada casilla: en coche, la calzada; a pie, la acera
function costeCoche(tx, ty) { const t = tipoEn(tx, ty); return t === TIPO.CALLE || t === TIPO.SOLAR ? 1 : t === TIPO.ACERA || t === TIPO.HIERBA ? 5 : Infinity; }
function costePie(tx, ty) { const t = tipoEn(tx, ty); return t === TIPO.CALLE ? 2 : t === TIPO.EDIFICIO || t === TIPO.ARBOL ? Infinity : 1; }
// lo que cuesta llegar desde cada casilla hasta (tx, ty)
function campoHacia(tx, ty, coste) {
  const n = MAPA.W * MAPA.H, d = new Float32Array(n).fill(Infinity), cola = new ColaMin();
  if (!enMapa(tx, ty)) return d;
  d[idx(tx, ty)] = 0; cola.mete(idx(tx, ty), 0);
  while (cola.n) {
    const [k, dk] = cola.saca();
    if (dk > d[k]) continue;
    const x = k % MAPA.W, y = (k / MAPA.W) | 0;
    for (const [ax, ay] of VECINOS4) relaja(d, cola, x + ax, y + ay, dk, coste);
  }
  return d;
}
const VECINOS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function relaja(d, cola, x, y, dk, coste) {
  if (!enMapa(x, y)) return;
  const c = coste(x, y);
  if (c === Infinity) return;
  const k = idx(x, y), nd = dk + c;
  if (nd < d[k]) { d[k] = nd; cola.mete(k, nd); }
}
// los campos dependen solo del mapa (que no cambia) y del destino: se guardan los 24 últimos usados y no se rehacen
const CAMPOS_GUARDADOS = 24;
function campoA(tx, ty, coste) {
  const clave = (coste === costePie ? 'pie-' : 'coche-') + tx + ',' + ty, c = RUTAS.cache.get(clave);
  if (c) { RUTAS.cache.delete(clave); RUTAS.cache.set(clave, c); return c; }
  const campo = campoHacia(tx, ty, coste);
  RUTAS.cache.set(clave, campo);
  if (RUTAS.cache.size > CAMPOS_GUARDADOS) RUTAS.cache.delete(RUTAS.cache.keys().next().value);
  return campo;
}
// la casilla vecina por la que se baja en el campo (más cerca del destino), o null si ya se está o no hay camino
function bajaCampo(campo, tx, ty) {
  let mejor = null, md = enMapa(tx, ty) ? campo[idx(tx, ty)] : Infinity;
  for (const [ax, ay] of VECINOS4) {
    const x = tx + ax, y = ty + ay;
    if (enMapa(x, y) && campo[idx(x, y)] < md) { md = campo[idx(x, y)]; mejor = [x, y]; }
  }
  return mejor;
}
// el punto (en píxeles) al que apuntar para seguir el campo: «n» casillas más allá, para que el giro salga suave
function puntoCampo(campo, x, y, n = 2) {
  let tx = Math.floor(x / T), ty = Math.floor(y / T), dio = 0;
  for (let i = 0; i < n; i++) { const s = bajaCampo(campo, tx, ty); if (!s) break; [tx, ty] = s; dio++; }
  return dio ? { x: tx * T + T / 2, y: ty * T + T / 2 } : null;
}

// una cola de prioridad mínima (montículo binario), para el Dijkstra
class ColaMin {
  constructor() { this.k = []; this.p = []; this.n = 0; }
  mete(k, p) { let i = this.n++; this.k[i] = k; this.p[i] = p; while (i > 0) { const m = (i - 1) >> 1; if (this.p[m] <= p) break; this.cambia(i, m); i = m; } }
  saca() {
    const r = [this.k[0], this.p[0]];
    this.n--; this.k[0] = this.k[this.n]; this.p[0] = this.p[this.n];
    let i = 0;
    for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < this.n && this.p[a] < this.p[m]) m = a; if (b < this.n && this.p[b] < this.p[m]) m = b; if (m === i) break; this.cambia(i, m); i = m; }
    return r;
  }
  cambia(i, j) { [this.k[i], this.k[j]] = [this.k[j], this.k[i]]; [this.p[i], this.p[j]] = [this.p[j], this.p[i]]; }
}

/* ---------- la línea de visión ---------- */
// ¿se ve b desde a? (a menos de «max» píxeles y sin edificios en medio; se mira cada 6 píxeles)
function seVe(a, b, max = 220) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  if (d > max) return false;
  const n = Math.ceil(d / 6);
  for (let i = 1; i < n; i++) if (solidoPx(a.x + dx * i / n, a.y + dy * i / n)) return false;
  return true;
}
