// Fans of Rouflage · EL MINIJUEGO DE LOS CAZADORES: los becarios salen con pocas cartas de despido, y mientras los colados se pintan
// tocan wakameles (unos bichos de alga que asoman de sus agujeros) para ganar cartas extra. Cada MINI_POR_CARTA aciertos, una carta.
// Fallar no cuesta nada. En el PvP el anfitrión es quien manda: aquí solo se le avisa de cuántas extra has ganado (mensaje 'cg').
'use strict';

const MINI_POR_CARTA = 4, MINI_W = 360, MINI_H = 440;
const MINI_AGUJEROS = [0, 1, 2].flatMap(j => [0, 1, 2].map(i => [60 + i * 120, 190 + j * 100]));
const MINI = { caja: null, cv: null, c: null, abierto: false, bichos: [], aciertos: 0, extra: 0, sig: 0, t: 0, raf: 0, ult: 0, destello: 0 };

function minijuegoMonta() {
  if (MINI.caja) return;
  const caja = document.createElement('section'); caja.id = 'rf-mini'; caja.hidden = true;
  const cv = document.createElement('canvas'); cv.width = MINI_W; cv.height = MINI_H; caja.appendChild(cv);
  document.body.appendChild(caja);
  MINI.caja = caja; MINI.cv = cv; MINI.c = cv.getContext('2d');
  cv.addEventListener('pointerdown', ev => {
    ev.preventDefault(); const r = cv.getBoundingClientRect();
    minijuegoToca((ev.clientX - r.left) / r.width * MINI_W, (ev.clientY - r.top) / r.height * MINI_H);
  });
}

function minijuegoEmpieza() {
  if (!J.yo || J.yo.clase !== 'cazador') return;
  minijuegoMonta();
  Object.assign(MINI, { abierto: true, bichos: [], aciertos: 0, extra: 0, sig: 0.5, t: 0, destello: 0, ult: performance.now() });
  MINI.caja.hidden = false; cancelAnimationFrame(MINI.raf); MINI.raf = requestAnimationFrame(minijuegoFotograma);
}
function minijuegoCierra() {
  if (!MINI.abierto) return;
  MINI.abierto = false; MINI.caja.hidden = true; cancelAnimationFrame(MINI.raf);
}

function minijuegoFotograma(ahora) {
  if (!MINI.abierto) return;
  const dt = Math.min(0.05, (ahora - MINI.ult) / 1000 || 0); MINI.ult = ahora;
  if (!J.pausa) minijuegoAvanza(dt);
  minijuegoDibuja(); MINI.raf = requestAnimationFrame(minijuegoFotograma);
}

function minijuegoAvanza(dt) {
  MINI.t += dt; MINI.destello = Math.max(0, MINI.destello - dt);
  for (const b of MINI.bichos) b.edad += dt;
  MINI.bichos = MINI.bichos.filter(b => b.edad < b.vida);
  MINI.sig -= dt;
  if (MINI.sig <= 0 && MINI.extra < REGLAS.balasExtra && MINI.bichos.length < 2) {
    const libres = MINI_AGUJEROS.map((_, i) => i).filter(i => !MINI.bichos.some(b => b.n === i));
    MINI.bichos.push({ n: pick(libres), edad: 0, vida: 1.25 - MINI.extra * 0.12, golpe: 0 });
    MINI.sig = rand(0.45, 0.85);
  }
}

// cuánto ha asomado un bicho (0 = escondido, 1 = fuera del todo)
const miniAsoma = b => b.golpe ? 1 : Math.min(1, b.edad / 0.14, (b.vida - b.edad) / 0.14);

function minijuegoToca(x, y) {
  if (J.pausa) return;
  let mejor = null, md = 52;
  for (const b of MINI.bichos) {
    if (b.golpe || miniAsoma(b) < 0.4) continue;
    const [hx, hy] = MINI_AGUJEROS[b.n], d = Math.hypot(x - hx, y - (hy - 26)); if (d < md) { md = d; mejor = b; }
  }
  if (!mejor) { play('deny', 0.3); return; }
  mejor.golpe = 1; mejor.edad = mejor.vida - 0.3; MINI.aciertos++; play('pop');
  if (MINI.aciertos % MINI_POR_CARTA === 0 && MINI.extra < REGLAS.balasExtra) {
    MINI.extra++; MINI.destello = 0.9; play('select');
    J.yo.balas = Math.min(REGLAS.balas, REGLAS.balasIni + MINI.extra);
    if (J.pvp) rfpManda({ t: 'cg', n: MINI.extra });
  }
}

// el wakamele: una bola de alga con dos hojas de wakame por flequillo y cara de pocos amigos
function miniBicho(c, x, y, p, golpe) {
  c.save(); c.beginPath(); c.rect(x - 60, y - 90, 120, 90); c.clip();   // solo se ve lo que sale del agujero
  const by = y + 30 - p * 52;
  c.lineWidth = 4; c.strokeStyle = '#0d1a14'; c.fillStyle = golpe ? '#d4f0a0' : '#4fae6a';
  c.beginPath(); c.ellipse(x, by, 26, 24, 0, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#1f6b44';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 4, by - 20); c.quadraticCurveTo(x + s * 30, by - 38, x + s * 22, by - 10); c.quadraticCurveTo(x + s * 14, by - 22, x + s * 4, by - 20); c.fill(); c.stroke(); }
  c.fillStyle = '#fff';
  for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 9, by - 3, 6, 0, TAU); c.fill(); c.stroke(); }
  c.fillStyle = '#0d1a14';
  if (golpe) { c.lineWidth = 3; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 9 - 4, by - 7); c.lineTo(x + s * 9 + 4, by + 1); c.moveTo(x + s * 9 + 4, by - 7); c.lineTo(x + s * 9 - 4, by + 1); c.stroke(); } }
  else for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 9, by - 2, 2.6, 0, TAU); c.fill(); }
  c.beginPath(); c.moveTo(x - 8, by + 12); c.quadraticCurveTo(x, by + (golpe ? 6 : 18), x + 8, by + 12); c.stroke();
  c.restore();
}

// una cartita de despido, la misma del panel del cazador: oscura con su raya roja, gris si aún no la tienes
function miniCarta(c, x, y, viva, nueva) {
  c.save(); c.translate(x, y); c.lineWidth = 3; c.strokeStyle = '#0b0b14';
  c.fillStyle = viva ? '#2a2f45' : '#4b4f60'; c.fillRect(-11, -15, 22, 30); c.strokeRect(-11, -15, 22, 30);
  c.fillStyle = viva ? '#ff4b5c' : '#6d7080'; c.fillRect(-11, -3, 22, 6);
  if (nueva) { c.strokeStyle = '#ffd34d'; c.lineWidth = 3; c.strokeRect(-14, -18, 28, 36); }
  c.restore();
}

function minijuegoDibuja() {
  const c = MINI.c; c.clearRect(0, 0, MINI_W, MINI_H);
  c.fillStyle = '#191430'; c.fillRect(0, 0, MINI_W, MINI_H);
  c.textAlign = 'center'; c.lineJoin = 'round'; c.font = '800 20px sans-serif'; c.fillStyle = '#ffd34d';
  c.fillText(tr('¡CAZA WAKAMELES!'), MINI_W / 2, 30);
  c.font = '700 13px sans-serif'; c.fillStyle = '#c9c3e6';
  c.fillText(MINI.extra >= REGLAS.balasExtra ? tr('¡Cartas al máximo! Espera a que acabe la preparación') : tr('Toca los wakameles: cada {n} te dan una carta extra').replace('{n}', MINI_POR_CARTA), MINI_W / 2, 52);
  for (let k = 0; k < REGLAS.balas; k++) miniCarta(c, MINI_W / 2 + (k - (REGLAS.balas - 1) / 2) * 34, 92, k < J.yo.balas, k === J.yo.balas - 1 && MINI.destello > 0);
  const frac = MINI.extra >= REGLAS.balasExtra ? 1 : (MINI.aciertos % MINI_POR_CARTA) / MINI_POR_CARTA;   // lo que falta para la siguiente carta
  c.fillStyle = '#2f2850'; c.fillRect(70, 126, 220, 10); c.fillStyle = '#4fae6a'; c.fillRect(70, 126, 220 * frac, 10);
  c.strokeStyle = '#0b0b14'; c.lineWidth = 2; c.strokeRect(70, 126, 220, 10);
  const orden = MINI_AGUJEROS.map((_, i) => i);
  for (const i of orden) {
    const [x, y] = MINI_AGUJEROS[i], b = MINI.bichos.find(q => q.n === i);
    c.fillStyle = '#0d0a1c'; c.strokeStyle = '#3d3566'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 36, 15, 0, 0, TAU); c.fill(); c.stroke();
    if (b) miniBicho(c, x, y, miniAsoma(b), b.golpe);
    c.fillStyle = '#0d0a1c'; c.beginPath(); c.ellipse(x, y + 4, 36, 11, 0, 0, Math.PI); c.fill();
  }
}
