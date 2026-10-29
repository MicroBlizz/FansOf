// Fans of Merge · TABLERO: las reglas puras, sin dibujo. Buscar grupos de piezas iguales que se tocan, juntarlas en cadena
// (siempre en la casilla donde se puso la última), decidir en qué se convierte la semilla mágica, mover zorros y cuervos
// y dormirlos cuando quedan encerrados, y sortear la pieza siguiente.
// Una casilla es null o { t: tipo, s: true si es dorada, id }.
'use strict';
let MG_ID = 1;
const mgPieza = (t, s = false) => ({ t, s: !!s, id: MG_ID++ });
const mgTableroNuevo = () => Array.from({ length: MG_CFG.lado }, () => Array(MG_CFG.lado).fill(null));
const mgDentro = (x, y) => x >= 0 && y >= 0 && x < MG_CFG.lado && y < MG_CFG.lado;
const MG_DIR = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const mgTipoDe = t => MG_PIEZAS[t] && MG_PIEZAS[t].tipo;
const mgSeJunta = t => !!(MG_PIEZAS[t] && MG_PIEZAS[t].sig);
const mgCopia = B => B.map(f => f.map(c => (c ? { ...c } : null)));
function mgVacias(B) { const v = []; for (let y = 0; y < B.length; y++) for (let x = 0; x < B.length; x++) if (!B[y][x]) v.push([x, y]); return v; }

// el grupo de piezas `tipo` unidas a (x, y) por los lados; la casilla (x, y) cuenta como de ese tipo aunque aún esté vacía
function mgGrupo(B, x, y, tipo) {
  const visto = new Set([y * 8 + x]), pila = [[x, y]], g = [];
  while (pila.length) {
    const [cx, cy] = pila.pop(); g.push([cx, cy]);
    for (const [dx, dy] of MG_DIR) {
      const nx = cx + dx, ny = cy + dy, k = ny * 8 + nx;
      if (!mgDentro(nx, ny) || visto.has(k)) continue;
      const c = B[ny][nx]; if (!c || c.t !== tipo) continue;
      visto.add(k); pila.push([nx, ny]);
    }
  }
  return g;
}

// Junta en cadena desde (x, y), donde ya hay una pieza. Cambia B. Devuelve los pasos (para animarlos) y los puntos.
// mult(x, y) devuelve el multiplicador de puntos de una casilla (la lluvia, las cartas).
function mgResuelve(B, x, y, mult = () => 1) {
  const pasos = []; let pts = 0;
  for (let vuelta = 0; vuelta < 20; vuelta++) {
    const c = B[y][x]; if (!c || !mgSeJunta(c.t)) break;
    const g = mgGrupo(B, x, y, c.t);
    if (g.length < MG_CFG.minimo) break;
    const nuevo = MG_PIEZAS[c.t].sig, dorada = g.length >= MG_CFG.superDesde;
    const quitadas = g.filter(([gx, gy]) => gx !== x || gy !== y).map(([gx, gy]) => ({ x: gx, y: gy, p: B[gy][gx] }));
    for (const q of quitadas) B[q.y][q.x] = null;
    B[y][x] = mgPieza(nuevo, dorada);
    const p = Math.round(MG_PIEZAS[nuevo].pts * (dorada ? 2 : 1) * mult(x, y));
    pts += p;
    pasos.push({ x, y, de: c.t, nuevo, dorada, quitadas, pts: p, cuantas: g.length });
  }
  return { pasos, pts };
}

// ¿En qué se convierte la semilla mágica en (x, y)? En la pieza cuya cadena acabe valiendo más puntos; si no junta nada, en piedra.
function mgSemillaEn(B, x, y) {
  let mejor = null, valor = -1;
  const vistos = new Set();
  for (const [dx, dy] of MG_DIR) {
    const nx = x + dx, ny = y + dy; if (!mgDentro(nx, ny)) continue;
    const c = B[ny][nx]; if (!c || !mgSeJunta(c.t) || vistos.has(c.t)) continue;
    vistos.add(c.t);
    const prueba = mgCopia(B); prueba[y][x] = mgPieza(c.t);
    const r = mgResuelve(prueba, x, y);
    if (!r.pasos.length) continue;
    const v = r.pts + MG_PIEZAS[prueba[y][x].t].pts * 0.001;   // a igualdad de puntos, la que llega más lejos
    if (v > valor) { valor = v; mejor = c.t; }
  }
  return mejor || 'piedra';
}

// Lo que pasaría al poner `tipo` en (x, y): las casillas que se juntarían (para que reboten antes de soltar) y en qué acaba
function mgPrevision(B, x, y, tipo) {
  if (B[y][x]) return null;
  const T = mgTipoDe(tipo);
  if (T === 'topo') return null;
  const real = T === 'semilla' ? mgSemillaEn(B, x, y) : tipo;
  if (!mgSeJunta(real)) return { real, celdas: [], final: real };
  const prueba = mgCopia(B); prueba[y][x] = mgPieza(real);
  const r = mgResuelve(prueba, x, y);
  const celdas = []; for (const p of r.pasos) for (const q of p.quitadas) celdas.push([q.x, q.y]);
  return { real, celdas, final: prueba[y][x].t, pts: r.pts };
}

// Mueve los bichos. Los cuervos saltan a cualquier casilla libre; los zorros, a una libre de al lado.
// Después, los zorros de un grupo sin ninguna salida se duermen (y los cuervos, si no queda ni una casilla libre).
// camino (un Set de casillas y*8+x, opcional): los zorros solo andan por él; fuera del camino se pierden y, si no tienen camino
// libre al lado, se duermen. Los cuervos vuelan: el camino no les importa.
// Devuelve lo que se ha movido y los que se han dormido, para animarlo.
function mgMueveBichos(B, quietos, camino) {
  const andable = (x, y) => mgDentro(x, y) && !B[y][x] && (!camino || camino.has(y * 8 + x));
  const movidos = [], dormidos = [];
  const bichos = []; for (let y = 0; y < B.length; y++) for (let x = 0; x < B.length; x++) if (B[y][x] && (B[y][x].t === 'zorro' || B[y][x].t === 'cuervo')) bichos.push([x, y]);
  if (!quietos) {
    for (const [x, y] of bichos.filter(([x, y]) => B[y][x].t === 'cuervo')) {
      const v = mgVacias(B); if (!v.length) break;
      const [nx, ny] = pick(v); B[ny][nx] = B[y][x]; B[y][x] = null; movidos.push({ de: [x, y], a: [nx, ny], salto: true });
    }
    for (const [x, y] of bichos.filter(([x, y]) => B[y][x] && B[y][x].t === 'zorro')) {
      const libres = MG_DIR.map(([dx, dy]) => [x + dx, y + dy]).filter(([nx, ny]) => andable(nx, ny));
      if (!libres.length) continue;
      const [nx, ny] = pick(libres); B[ny][nx] = B[y][x]; B[y][x] = null; movidos.push({ de: [x, y], a: [nx, ny] });
    }
  }
  // los zorros encerrados: se mira cada grupo de zorros unidos; si ninguno tiene una casilla libre al lado, se duermen todos
  const visto = new Set();
  for (let y = 0; y < B.length; y++) for (let x = 0; x < B.length; x++) {
    const c = B[y][x]; if (!c || c.t !== 'zorro' || visto.has(y * 8 + x)) continue;
    const g = mgGrupo(B, x, y, 'zorro'); g.forEach(([gx, gy]) => visto.add(gy * 8 + gx));
    const salida = g.some(([gx, gy]) => MG_DIR.some(([dx, dy]) => andable(gx + dx, gy + dy)));
    if (!salida) dormidos.push(...g);
  }
  if (!mgVacias(B).length) for (let y = 0; y < B.length; y++) for (let x = 0; x < B.length; x++) if (B[y][x] && B[y][x].t === 'cuervo') dormidos.push([x, y]);
  for (const [x, y] of dormidos) B[y][x] = mgPieza('dormido');
  return { movidos, dormidos };
}

// La pieza siguiente, por sorteo con pesos (las cartas cambian algunos)
function mgSorteo(cartas, base = MG_CFG.pesos) {
  const pesos = { ...base };
  if (cartas.includes('espanta')) delete pesos.cuervo;
  let total = 0; for (const k in pesos) total += pesos[k];
  let r = Math.random() * total;
  for (const k in pesos) { r -= pesos[k]; if (r <= 0) return k; }
  return 'brote';
}
