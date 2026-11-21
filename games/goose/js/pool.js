// Fans of Goose · Reservas de objetos y rejilla de choques. Nada se crea durante la partida: enemigos, balas, plumas, partículas
// y textos salen de listas ya hechas al empezar (así el navegador no tiene que limpiar memoria y no hay tirones). Cada lista
// guarda primero los vivos: `n` dice cuántos hay; al quitar uno, el último ocupa su sitio.
// La rejilla divide la zona de la pantalla en celdas de 24 y apunta qué enemigo hay en cada una: una bala solo mira los de su
// celda y las vecinas, no los 200.
'use strict';

function reserva(max, nuevo) {
  const R = { lista: [], n: 0, max };
  for (let i = 0; i < max; i++) R.lista.push(nuevo());
  R.saca = () => (R.n < R.max ? R.lista[R.n++] : null);
  R.quita = i => { const l = R.lista, o = l[i]; R.n--; l[i] = l[R.n]; l[R.n] = o; };
  R.vacia = () => { R.n = 0; };
  return R;
}

const ENE = reserva(CFG.maxEnemigos + 4, () => ({ tipo: 'oca', x: 0, y: 0, vx: 0, vy: 0, kx: 0, ky: 0, hp: 1, hpMax: 1, r: 7, vel: 30, dano: 8, xp: 1, flash: 0, cd: 0, cdPl: 0, cdLat: 0, t: 0, fase: 0, f2: 0, id: 0, pozo: false, caida: 0, sx: 0, sy: 0, cx: 0, cy: 0, furia: false, mira: 1, estado: '', animT: 0, siegaX: 0, siegaDir: 1, regateado: false }));
const BALAS = reserva(CFG.maxBalas, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 3, dano: 5, vida: 0, spr: 'bala', rebota: 0 }));
const PROY = reserva(90, () => ({ tipo: 'huevo', x: 0, y: 0, vx: 0, vy: 0, x0: 0, y0: 0, x1: 0, y1: 0, t: 0, dur: 0, dano: 0, r: 0, rebotes: 0, ultimo: -1, nivel: 1, evo: false, gira: 0 }));
const CHARCOS = reserva(40, () => ({ x: 0, y: 0, r: 0, vida: 0, dps: 0, tic: 0, malo: false }));
const PLUMAS = reserva(CFG.maxPlumas, () => ({ tipo: 'xp', x: 0, y: 0, vx: 0, vy: 0, valor: 1, atraida: false, t: 0, resu: false }));
const PART = reserva(CFG.maxParticulas, () => ({ x: 0, y: 0, vx: 0, vy: 0, vida: 0, max: 0, tam: 1, color: '#fff', g: 0, tipo: 0, rot: 0, vr: 0 }));
const TXT = reserva(CFG.maxTextos, () => ({ x: 0, y: 0, vy: 0, vida: 0, max: 0, txt: '', color: '#fff', tam: 7 }));

// --- rejilla ---
const REJ = { celda: 24, x0: -72, cols: 15, y0: 0, filas: 0, cab: null, sig: new Int16Array(CFG.maxEnemigos + 4) };
const CERCA = new Int16Array(CFG.maxEnemigos + 4);   // resultado de la última consulta

function preparaRejilla(alto) {
  REJ.filas = Math.ceil((alto + 200) / REJ.celda) + 1;
  REJ.cab = new Int16Array(REJ.cols * REJ.filas);
}
function llenaRejilla(camY) {
  REJ.y0 = camY - 100; REJ.cab.fill(-1);
  const l = ENE.lista, c = REJ.celda;
  for (let i = 0; i < ENE.n; i++) {
    const e = l[i], cx = Math.floor((e.x - REJ.x0) / c), cy = Math.floor((e.y - REJ.y0) / c);
    if (cx < 0 || cy < 0 || cx >= REJ.cols || cy >= REJ.filas) { REJ.sig[i] = -2; continue; }
    const k = cy * REJ.cols + cx; REJ.sig[i] = REJ.cab[k]; REJ.cab[k] = i;
  }
}
// apunta en CERCA los enemigos que pueden estar a menos de r de (x, y) y dice cuántos son
function enemigosCerca(x, y, r) {
  const c = REJ.celda, a = Math.max(0, Math.floor((x - r - REJ.x0) / c)), b = Math.min(REJ.cols - 1, Math.floor((x + r - REJ.x0) / c));
  const d = Math.max(0, Math.floor((y - r - REJ.y0) / c)), f = Math.min(REJ.filas - 1, Math.floor((y + r - REJ.y0) / c));
  let n = 0;
  for (let cy = d; cy <= f; cy++) for (let cx = a; cx <= b; cx++) {
    let i = REJ.cab[cy * REJ.cols + cx];
    while (i >= 0) { CERCA[n++] = i; i = REJ.sig[i]; }
  }
  return n;
}
