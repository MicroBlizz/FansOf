// Fans of Rouflage · MI ESCENARIO, EL LIENZO (boceto aprobado por Daniel el 25-10-2026): un escenario más, «Lienzo en blanco», cuya forma la dibuja
// el jugador por casillas de 2 × 2 (40 px), como las letras de los planos de escenario-formas.js. En la pestaña CONSTRUIR del editor: SUELO (pinta
// casillas con un suelo), PARED (levanta muro; la pared de frente que se ve encima del suelo de abajo lleva el papel elegido) y PUERTA (un paso),
// además de DESHACER y COMPROBAR (¿vale para jugar?). Los suelos y papeles que se pueden usar son los de los escenarios que tienes (comprar un
// escenario te da sus suelos y sus paredes), más los azulejos blancos para pintarlos a tu gusto, que son de todos. El tamaño (LIENZO.TAM) se ampliará
// con Acciones; de momento, en la alfa y en localhost se prueban todos. Datos: SAVE.escenario.lz (texto: «t|letras|rejilla en tiradas») y, en los
// datos que viajan a la sala (salaADatos), d.lz. Cada lienzo es un mundo con id 'lienzo~…' (escMundo → lzMundo); el tuyo, mientras lo editas, 'lienzo~mio'.
'use strict';

const LIENZO = { W: 42, H: 30, TAM: [[12, 10], [18, 14], [28, 20], [38, 26]], NOMBRE: ['PEQUEÑO', 'MEDIANO', 'GRANDE', 'ENORME'], PUERTA: ['umbral', 'marco'], DEF: ['azulejoBlanco', 'rayas'],
  LETRAS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' };
const ESC_LZ = {};      // id del mundo → { t, g: [carácter por casilla], L: { letra: [suelo, pared] } }
const OBRA = { herr: 'suelo', suelo: 'azulejoBlanco', pared: 'rayas', pasos: [], pintando: false, ultimo: null, uso: {} };      // uso: lo que ya has probado (para el tutorial)
const escBase = id => (typeof id === 'string' && id.startsWith('lienzo') ? 'lienzo' : id);

// el suelo de azulejos blancos: para pintarlo entero con PINTAR (de todos, desde el principio)
SUELOS.azulejoBlanco = (c, z, R) => {
  c.fillStyle = '#f4f1ea'; c.fillRect(z.px, z.py, z.pw, z.ph);
  c.strokeStyle = 'rgba(120,120,140,0.22)'; c.lineWidth = 2; c.beginPath();
  for (let x = Math.floor(Math.max(z.px, R.x0) / 40) * 40; x <= Math.min(z.px + z.pw, R.x1); x += 40) { c.moveTo(x, z.py); c.lineTo(x, z.py + z.ph); }
  for (let y = Math.floor(Math.max(z.py, R.y0) / 40) * 40; y <= Math.min(z.py + z.ph, R.y1); y += 40) { c.moveTo(z.px, y); c.lineTo(z.px + z.pw, y); }
  c.stroke();
};
ESCENARIOS.lienzo = { suelo: LIENZO.DEF[0], pared: LIENZO.DEF[1], forma: 'lienzo', muro: '#2a2244', canto: '#4b3f78' };

/* ---------- los datos ---------- */
const lzRect = t => { const [w, h] = LIENZO.TAM[t] || LIENZO.TAM[0]; return { x0: 2, y0: 2, x1: 2 + w, y1: 2 + h }; };      // en casillas de 40, desde (2, 2): ESC_ORIGEN
const lzDentro = (lz, i, j) => { const R = lzRect(lz.t); return i >= R.x0 && i < R.x1 && j >= R.y0 && j < R.y1; };
function lzNuevo(t = 0) {
  const R = lzRect(t), g = [];
  for (let j = 0; j < LIENZO.H; j++) for (let i = 0; i < LIENZO.W; i++) g.push(i >= R.x0 && i < R.x1 && j >= R.y0 && j < R.y1 ? 'a' : '#');
  return { t, g, L: { a: LIENZO.DEF.slice() } };
}
const lzCopia = lz => ({ t: lz.t, g: lz.g.slice(), L: JSON.parse(JSON.stringify(lz.L)), b: lz.b });
const lzCentro = k => [(k % LIENZO.W) * 40 + 20, ((k / LIENZO.W) | 0) * 40 + 20];
// a texto, corto: «t|a:suelo.pared,b:…|rejilla en tiradas (número y carácter)». Las letras que ya no se usan no viajan
function lzCodifica(lz) {
  const usadas = new Set(lz.g), L = Object.keys(lz.L).filter(k => usadas.has(k)).map(k => k + ':' + lz.L[k].join('.')).join(',');
  let r = '', i = 0; while (i < lz.g.length) { const ch = lz.g[i]; let n = 1; while (i + n < lz.g.length && lz.g[i + n] === ch) n++; r += (n > 1 ? n : '') + ch; i += n; }
  return lz.t + '|' + L + '|' + r + (lz.b != null ? '|' + lz.b : '');      // la marca de BECARIOS (casilla), si hay
}
function lzDecodifica(txt) {
  if (typeof txt !== 'string') return null;
  const [t, Ls, r, bs] = txt.split('|'); if (r === undefined) return null;
  const L = {};
  for (const par of Ls ? Ls.split(',') : []) { const [k, v] = par.split(':'), [s, p] = (v || '').split('.'); if (k && k.length === 1 && SUELOS[s] && PAPELES[p]) L[k] = [s, p]; }
  const g = []; for (const m of r.matchAll(/(\d*)([^\d])/g)) { const n = Math.min(LIENZO.W * LIENZO.H, +m[1] || 1); for (let k = 0; k < n; k++) g.push(m[2]); }
  if (g.length !== LIENZO.W * LIENZO.H) return null;
  const lz = { t: Math.max(0, Math.min(LIENZO.TAM.length - 1, +t || 0)), g, L };
  for (let k = 0; k < g.length; k++) { const ch = g[k]; if (ch !== '#' && ch !== '+' && !L[ch]) g[k] = '#'; if (g[k] !== '#' && !lzDentro(lz, k % LIENZO.W, (k / LIENZO.W) | 0)) g[k] = '#'; }      // nada fuera de su tamaño
  const b = +bs; if (bs !== undefined && Number.isInteger(b) && b >= 0 && b < g.length && g[b] !== '#' && g[b] !== '+') lz.b = b;
  return lz;
}
// el mundo de un lienzo: su plano en letras para escConstruye (escenario-mundo.js); el armario, en la primera casilla de suelo; apareces en la del medio
function lzMundo(id) {
  const lz = ESC_LZ[id] || (ESC_LZ[id] = lzNuevo());
  const filas = []; for (let j = 0; j < LIENZO.H; j++) filas.push(lz.g.slice(j * LIENZO.W, (j + 1) * LIENZO.W).join(''));
  const letras = { '+': { nombre: '', suelo: LIENZO.PUERTA[0], pared: LIENZO.PUERTA[1] } };
  for (const k in lz.L) letras[k] = { nombre: '', suelo: lz.L[k][0], pared: lz.L[k][1] };
  const suelo = []; lz.g.forEach((ch, k) => { if (ch !== '#') suelo.push([k % LIENZO.W, (k / LIENZO.W) | 0]); });
  const R = lzRect(lz.t), cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
  const medio = suelo.reduce((a, q) => (!a || Math.hypot(q[0] - cx, q[1] - cy) < Math.hypot(a[0] - cx, a[1] - cy) ? q : a), null) || [R.x0, R.y0];
  const primera = suelo.find(q => lz.g[(q[1]) * LIENZO.W + q[0]] !== '+') || medio;
  let sal = medio;
  if (lz.b != null) {      // con la sala de los becarios marcada, los colados salen lo más lejos de ella
    const [bx, by] = lzCentro(lz.b); sal = suelo.filter(q => lz.g[q[1] * LIENZO.W + q[0]] !== '+').reduce((a, q) => (!a || Math.hypot(q[0] * 40 + 20 - bx, q[1] * 40 + 20 - by) > Math.hypot(a[0] * 40 + 20 - bx, a[1] * 40 + 20 - by) ? q : a), null) || medio;
  }
  const F = { armario: [primera[0] * 40 + 20, primera[1] * 40 + 36], salida: [sal[0] * 40 + 20, sal[1] * 40 + 30] };
  const M = escConstruye(id, ESCENARIOS.lienzo, F, filas.join('\n'), letras);
  if (lz.b != null) { const [bx, by] = lzCentro(lz.b), zi = M.zonaDe[((by / CEL) | 0) * M.MW + ((bx / CEL) | 0)]; if (zi >= 0) { M.esperaZona = M.zonas[zi]; M.becarios = [bx, by]; } }
  return M;
}
// los datos de alguien (d.lz): su mundo, con un id por su forma (dos salas con el mismo lienzo comparten mundo)
function lzDeDatos(txt) {
  const lz = lzDecodifica(txt) || lzNuevo();
  const id = 'lienzo~' + (typeof txt === 'string' ? hashTexto(txt) : 'nuevo');
  if (!ESC_LZ[id]) ESC_LZ[id] = lz;
  return id;
}
function hashTexto(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
// el tuyo, para editarlo: 'lienzo~mio', hecho de lo guardado
function lzMio() {
  if (!ESC_LZ['lienzo~mio']) ESC_LZ['lienzo~mio'] = lzDecodifica((SAVE.escenario || {}).lz) || lzNuevo();
  return 'lienzo~mio';
}
const lzMioTexto = () => (ESC_LZ['lienzo~mio'] ? lzCodifica(ESC_LZ['lienzo~mio']) : (SAVE.escenario || {}).lz);
// la letra de ese suelo con esa pared (la crea si no está)
function lzLetra(lz, suelo, pared) {
  for (const k in lz.L) if (lz.L[k][0] === suelo && lz.L[k][1] === pared) return k;
  const usadas = new Set(lz.g);
  for (const k of Object.keys(lz.L)) if (!usadas.has(k)) delete lz.L[k];      // las que ya no se ven dejan sitio
  const k = [...LIENZO.LETRAS].find(x => !lz.L[x]); if (!k) return null;
  lz.L[k] = [suelo, pared]; return k;
}

/* ---------- lo que se puede usar: los suelos y papeles de tus escenarios ---------- */
function lzMateriales() {
  const suelos = new Map([[LIENZO.DEF[0], { it: null, tuyo: true }]]), paredes = new Map([[LIENZO.DEF[1], { it: arItem('escenarios', 'oficina'), tuyo: true }]]);
  for (const it of arCat('escenarios').items) {
    const E0 = ESCENARIOS[it.id]; if (!E0 || it.id === 'lienzo') continue;
    const tuyo = arTiene('escenarios', it);
    for (const [s, p] of [[E0.suelo, E0.pared], E0.b || [], E0.c || []]) {
      if (s && SUELOS[s] && (!suelos.has(s) || (tuyo && !suelos.get(s).tuyo))) suelos.set(s, { it, tuyo });
      if (p && PAPELES[p] && (!paredes.has(p) || (tuyo && !paredes.get(p).tuyo))) paredes.set(p, { it, tuyo });
    }
  }
  return { suelos, paredes };      // nombre → { it: el escenario que lo trae, tuyo }
}

/* ---------- construir: el dedo pinta casillas ---------- */
const lzSala = () => escenarioSala();
const lzAct = () => ESC_LZ[lzSala().id];
function obraAbajo(p) {
  const lz = lzAct(); if (!lz) return;
  if (OBRA.herr === 'becarios') {      // un toque: esa sala es la de los becarios
    const i = Math.floor(p.x / 40), j = Math.floor(p.y / 40), k = j * LIENZO.W + i;
    if (!lzDentro(lz, i, j) || lz.g[k] === '#' || lz.g[k] === '+') { play('deny'); escAviso(tr('Toca el suelo de una sala')); return; }
    OBRA.pasos.push(lzCopia(lz)); lz.b = k; OBRA.uso.becarios = 1; play('pop'); obraRehace(); escGuarda();
    escAviso(tr('Aquí esperan los becarios al empezar (en azul)')); return;
  }
  OBRA.pasos.push(lzCopia(lz)); if (OBRA.pasos.length > 30) OBRA.pasos.shift();
  OBRA.pintando = true; OBRA.ultimo = null; OBRA.cambio = false; OBRA.uso[OBRA.herr] = 1;      // (ya la ha probado: el tutorial sigue)
  obraMueve(p);
}
function obraMueve(p) {
  if (!OBRA.pintando) return;
  const i = Math.floor(p.x / 40), j = Math.floor(p.y / 40), u = OBRA.ultimo || [i, j];
  const n = Math.max(Math.abs(i - u[0]), Math.abs(j - u[1]), 1);
  for (let k = 0; k <= n; k++) obraCasilla(Math.round(u[0] + (i - u[0]) * k / n), Math.round(u[1] + (j - u[1]) * k / n));
  OBRA.ultimo = [i, j];
}
function obraCasilla(i, j) {
  const lz = lzAct(); if (!lz || !lzDentro(lz, i, j)) return;
  const k = j * LIENZO.W + i, antes = lz.g[k]; let ch = antes;
  if (OBRA.herr === 'suelo') { const pared = lz.L[antes] ? lz.L[antes][1] : OBRA.pared; ch = lzLetra(lz, OBRA.suelo, pared) || antes; }
  else if (OBRA.herr === 'pared') {
    ch = '#';
    const kb = k + LIENZO.W, b = lz.g[kb];      // la pared de frente se ve encima del suelo de abajo: ese suelo lleva el papel elegido
    if (b && lz.L[b] && lz.L[b][1] !== OBRA.pared) { const nb = lzLetra(lz, lz.L[b][0], OBRA.pared); if (nb) { lz.g[kb] = nb; OBRA.cambio = true; } }
  } else if (OBRA.herr === 'puerta') ch = '+';
  if (ch === antes) return;
  lz.g[k] = ch; OBRA.cambio = true; OBRA.uso[OBRA.herr] = 1; play('tick');
  if (lz.b === k && (ch === '#' || ch === '+')) delete lz.b;      // la marca de los becarios se va si le pones una pared encima
  obraRehace();
}
// el mundo nuevo: se rehace el plano y se vuelve a pintar el fondo
function obraRehace() {
  const sala = lzSala();
  delete _escMundos[sala.id]; escTilesFuera(sala); sala._libre = null; escCambio();
  const M = escMundo(sala.id), yo = MIESC.yo; if (yo) yo.mundo = M.id;
  MIESC.sucio = true;
}
function obraArriba() {
  if (!OBRA.pintando) return;
  OBRA.pintando = false;
  if (!OBRA.cambio) { OBRA.pasos.pop(); return; }
  obraAjusta(); escGuarda();
}
// tras construir: los muebles que se han quedado dentro de una pared van al hueco más cercano, y tú también
function obraAjusta() {
  const sala = lzSala(), M = escMundo(sala.id), n = escRecoloca(sala); escCambio();
  const yo = MIESC.yo; if (yo && !escLibre(sala, M, yo.x, yo.y)) { [yo.x, yo.y] = M.salida; MIESC.camino = null; }
  if (n) escAviso(tr('{n} muebles no cabían y se han movido al hueco más cercano', { n }));
}
// dos dedos (zoom): lo que había hecho el primero se deshace
function obraCancela() {
  if (!OBRA.pintando) return;
  OBRA.pintando = false; const d = OBRA.pasos.pop(), sala = lzSala();
  if (d && OBRA.cambio && ESC_LZ[sala.id]) { ESC_LZ[sala.id] = d; obraRehace(); }
}
function obraDeshace() {
  const d = OBRA.pasos.pop(), sala = lzSala(); if (!d || !ESC_LZ[sala.id]) { play('deny'); return; }
  ESC_LZ[sala.id] = d; play('select'); obraRehace(); obraAjusta(); escGuarda();
}

/* ---------- COMPROBAR: ¿vale para jugar? Todo unido por puertas y, sin contar las puertas, al menos dos salas (una para los becarios).
   Lo que falla parpadea en rojo unos segundos encima del escenario (obraPintaEncima) ---------- */
function lzGrupos(lz, conPuertas) {
  const id = new Int16Array(lz.g.length).fill(-1), tam = []; let n = 0;
  const ok = q => lz.g[q] !== '#' && (conPuertas || lz.g[q] !== '+');
  for (let k = 0; k < lz.g.length; k++) {
    if (id[k] >= 0 || !ok(k)) continue;
    const pila = [k]; id[k] = n; let t = 0;
    while (pila.length) {
      const q = pila.pop(); t++;
      for (const r of [q - 1, q + 1, q - LIENZO.W, q + LIENZO.W]) {
        if (r < 0 || r >= lz.g.length || id[r] >= 0 || ((r === q - 1 || r === q + 1) && Math.floor(r / LIENZO.W) !== Math.floor(q / LIENZO.W)) || !ok(r)) continue;
        id[r] = n; pila.push(r);
      }
    }
    tam.push(t); n++;
  }
  return { n, id, tam };
}
// la sala de los becarios que se pondría sola: la zona grande más lejos de la salida (como mapa-escenario.js con los escenarios de siempre)
function lzAutoBecarios(lz, M) {
  const [sx, sy] = M.salida, centro = z => [(z.x + z.w / 2) * CEL, (z.y + z.h / 2) * CEL];
  const zonas = M.zonas.filter(z => z.letra !== '+'), grandes = zonas.filter(z => z.w * z.h >= 24);
  const z = (grandes.length ? grandes : zonas).reduce((a, q) => (!a || lejos(...centro(q), sx, sy) > lejos(...centro(a), sx, sy) ? q : a), null); if (!z) return null;
  const [cx, cy] = centro(z), k = Math.floor(cy / 40) * LIENZO.W + Math.floor(cx / 40);
  return lz.g[k] && lz.g[k] !== '#' && lz.g[k] !== '+' ? k : null;
}
// ¿vale para jugar? Devuelve '' o lo que falla (y deja en OBRA.malas las casillas que hay que marcar en rojo)
function lzProblema(lz) {
  const todo = lzGrupos(lz, true); OBRA.malas = null;
  const marca = cond => { OBRA.malas = []; for (let k = 0; k < lz.g.length; k++) if (cond(k)) OBRA.malas.push(k); OBRA.malasHasta = MIESC.t + 4; MIESC.sucio = true; };
  if (!todo.n) return tr('No hay suelo: pinta alguno con SUELO');
  if (todo.n > 1) { const grande = todo.tam.indexOf(Math.max(...todo.tam)); marca(k => todo.id[k] >= 0 && todo.id[k] !== grande); return tr('Hay zonas cerradas: ábreles una PUERTA'); }
  const M = escMundo(lzSala().id), z = M.esperaZona;
  if (z && z.w * z.h < 16) { marca(k => { const [x, y] = lzCentro(k); return x >= z.px && x < z.px + z.pw && y >= z.py && y < z.py + z.ph; }); return tr('La sala de los becarios es muy pequeña: hazla más grande o marca otra'); }
  return '';
}
function obraComprueba() {
  const lz = lzAct(); if (!lz) return false;
  const mal = lzProblema(lz);
  if (mal) { play('deny'); escAviso(mal); return false; }
  if (lz.b == null) {      // sin sala de becarios: se pone sola, y se dice dónde
    const k = lzAutoBecarios(lz, escMundo(lzSala().id));
    if (k != null) { lz.b = k; obraRehace(); escGuarda(); OBRA.azulHasta = MIESC.t + 4; play('pop'); escAviso(tr('He marcado en azul la sala de los becarios: cámbiala con BECARIOS si quieres')); return true; }
  }
  play('levelup'); escAviso(tr('¡Listo para jugar! Tus amigos lo verán en MI ESCENARIO')); OBRA.uso.comprobar = 1;
  return true;
}
// encima del escenario, en CONSTRUIR: lo que falla (en rojo, parpadeando) y la casilla que vas a tocar
function obraPintaEncima(c, pt) {
  if (OBRA.malas && MIESC.t < OBRA.malasHasta) {
    c.fillStyle = `rgba(255,75,92,${(0.3 + 0.25 * Math.sin(MIESC.t * 9)).toFixed(3)})`;
    for (const k of OBRA.malas) c.fillRect((k % LIENZO.W) * 40, ((k / LIENZO.W) | 0) * 40, 40, 40);
  } else if (OBRA.malas) { OBRA.malas = null; MIESC.sucio = true; }
  const lz0 = lzAct(), M0 = lz0 && escMundo(lzSala().id), z = M0 && M0.esperaZona;
  if (z && (MIESC.modo === 'obra' || MIESC.t < (OBRA.azulHasta || 0))) {      // la sala de los becarios, en azul
    c.fillStyle = 'rgba(79,149,245,0.28)'; c.fillRect(z.px, z.py, z.pw, z.ph);
    c.strokeStyle = '#4f95f5'; c.lineWidth = 4; c.setLineDash([12, 8]); c.strokeRect(z.px + 2, z.py + 2, z.pw - 4, z.ph - 4); c.setLineDash([]);
    rotulo(c, tr('BECARIOS'), z.px + z.pw / 2, z.py + 22, 15, '#cfe3ff', OL, LETRA_UI);
  }
  if (pt && MIESC.modo === 'obra') {
    const i = Math.floor(pt.x / 40), j = Math.floor(pt.y / 40), lz = lzAct(); if (!lz || !lzDentro(lz, i, j)) return;
    c.strokeStyle = OBRA.herr === 'pared' ? '#ff9f80' : OBRA.herr === 'puerta' ? '#ffcb3d' : OBRA.herr === 'becarios' ? '#4f95f5' : '#7ee04a'; c.lineWidth = 3;
    c.strokeRect(i * 40 + 1.5, j * 40 + 1.5, 37, 37);
  }
}

/* ---------- el panel CONSTRUIR (como el de PINTAR) ---------- */
Object.assign(ICONOS, {
  ladrillo: '<path d="M3.5 6h17v12h-17z"/><path d="M3.5 12h17M9 6v6M15 12v6M12 6v0" />',
  puerta: '<path d="M6.5 20.5V4.5h11v16"/><path d="M4 20.5h16"/><circle cx="14.5" cy="12.5" r="1" fill="currentColor"/>',
  baldosa: '<path d="M4 4h16v16H4z"/><path d="M4 12h16M12 4v16"/>',
  comprobar: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="3.2"/>',
  ampliar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  jugar: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
});
const OBRA_HERR = [['suelo', 'Suelo', 'baldosa'], ['pared', 'Pared', 'ladrillo'], ['puerta', 'Puerta', 'puerta'], ['becarios', 'Becarios', 'diana']];
function obraTarjetaSuelo(c, w, s) {
  const z = { px: 0, py: 0, pw: 120, ph: 120, x: 0, y: 0, w: 6, h: 6, suelo: s, pared: 'rayas', id: 'x' }, R = { x0: 0, y0: 0, x1: 120, y1: 120 };
  c.save(); c.scale(w / 120, w / 120); try { SUELOS[s](c, z, R); } catch (_) { c.fillStyle = '#556'; c.fillRect(0, 0, 120, 120); } c.restore();
}
function obraTarjetaPared(c, w, p) {
  const t = { x0: 0, y0: 0, x1: 120, y1: 80, alto: 3, zona: { pared: p, suelo: 'moqueta', px: 0, py: 80, pw: 120, ph: 40 } };
  c.save(); c.scale(w / 120, w / 120); c.fillStyle = '#4d5f93'; c.fillRect(0, 80, 120, 40);
  try { c.beginPath(); c.rect(0, 0, 120, 80); c.clip(); PAPELES[p](c, t); } catch (_) { c.fillStyle = '#887'; c.fillRect(0, 0, 120, 80); } c.restore();
}
function preparaObra() {
  if (E('esc-obra')) return;
  const d = document.createElement('div'); d.id = 'esc-obra'; d.hidden = true;
  d.innerHTML = '<div class="esc-herr" id="obra-herr"></div><div class="esc-cab"><span id="obra-cuenta"></span><span id="obra-pista"></span></div><div class="esc-tira" id="obra-tira"></div>';
  E('esc-pintar').after(d);
}
function obraRefresca() {
  preparaObra();
  const lz = lzAct(), fila = E('obra-herr'); fila.innerHTML = '';
  const boton = (clase, nombre, icono, activo, alTocar) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-h ' + clase + (activo ? ' activa' : ''); b.title = tr(nombre); b.setAttribute('aria-label', tr(nombre));
    b.id = 'obra-b-' + icono; b.innerHTML = '<i></i><small></small>'; ponIcono(b.firstChild, icono); b.lastChild.textContent = tr(nombre); b.onclick = alTocar; fila.appendChild(b); return b;      // (los ids, para el tutorial)
  };
  for (const [id, n, ic] of OBRA_HERR) boton('', n, ic, OBRA.herr === id, () => { OBRA.herr = id; play('select'); obraRefresca(); });
  boton('', 'Deshacer', 'deshacer', false, obraDeshace);
  boton('bien', 'Comprobar', 'comprobar', false, obraComprueba);
  boton('', 'Nuevo', 'sala', false, () => { play('select'); obraElige(); });      // en blanco o desde una plantilla
  boton('bien', 'Probar', 'jugar', false, () => escProbar('camaleon'));      // una partida contra bots aquí mismo
  if (lz) boton('', 'Ampliar', 'ampliar', false, obraAmplia);      // el siguiente tamaño: el mediano en el pase, los demás en la tienda (escenario-obra2.js)
  // las tarjetas de lo que pinta la herramienta
  const tira = E('obra-tira'); tira.innerHTML = '';
  const { suelos, paredes } = lzMateriales();
  const lista = OBRA.herr === 'suelo' ? suelos : OBRA.herr === 'pared' ? paredes : null;
  E('obra-cuenta').textContent = lz ? tr('Tamaño: {t}', { t: tr(LIENZO.NOMBRE[lz.t]) }) : '';
  E('obra-pista').textContent = OBRA.herr === 'becarios' ? tr('Toca la sala donde esperan los becarios al empezar') : OBRA.herr === 'puerta' ? tr('Arrastra el dedo sobre una pared para abrir un paso') : OBRA.herr === 'pared' ? tr('Arrastra el dedo para levantar paredes') : tr('Arrastra el dedo para poner suelo');
  if (!lista) return;
  const elegido = OBRA.herr === 'suelo' ? OBRA.suelo : OBRA.pared;
  for (const [nombre, q] of [...lista].sort((a, b) => (a[1].tuyo ? 0 : 1) - (b[1].tuyo ? 0 : 1))) {
    const falta = q.tuyo ? null : q.it;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'esc-carta r-comun' + (falta ? ' bloq' : '') + (nombre === elegido ? ' activa' : '');
    const k = arLienzo(64, 64); arPinta(k, (c, w) => (OBRA.herr === 'suelo' ? obraTarjetaSuelo : obraTarjetaPared)(c, w, nombre)); b.appendChild(k);
    const s = document.createElement('small'); s.textContent = !q.it ? tr('Azulejo blanco') : tr(q.it.n); b.appendChild(s);      // el nombre del escenario que lo trae
    if (falta) { const cd = arLienzo(22, 22, 'ar-candado'); arPinta(cd, (c, w) => ARD.ICONOS.candado(c, w)); b.appendChild(cd); }
    b.onclick = () => {
      if (falta) { play('tick'); escAviso(tr('Viene con el escenario {e}: {c}', { e: tr(falta.n), c: arTextoDe(falta) })); return; }
      play('select'); if (OBRA.herr === 'suelo') OBRA.suelo = nombre; else OBRA.pared = nombre; obraRefresca();
    };
    tira.appendChild(b);
  }
}
