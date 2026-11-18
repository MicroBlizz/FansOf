// Fans of Snakes · Efectos: chispas, monedas que vuelan, números que suben, el «¡Uy!» del roce y el temblor de pantalla.
// Son solo adorno: la partida (js/partida.js) no depende de nada de aquí.
'use strict';

const PART = [];   // partículas: { x, y, vx, vy, t, dur, r, col, g (gravedad), forma }
const NUMS = [];   // números y letreros que suben: { x, y, txt, t, col, tam }
const TEMBLOR = { t: 0, fuerza: 0 };

function chispa(x, y, col, n = 8, vel = 60, forma = 'punto') {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = vel * (0.4 + Math.random() * 0.8);
    PART.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, dur: 0.35 + Math.random() * 0.3, r: 1.2 + Math.random() * 1.6, col, g: 60, forma });
  }
}

// una moneda que salta desde una casilla cortada
function monedaVuela(x, y) {
  const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, v = 90 + Math.random() * 60;
  PART.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, dur: 0.7 + Math.random() * 0.3, r: 3, col: '#ffd54a', g: 220, forma: 'moneda' });
}

function numero(x, y, txt, col = '#fff', tam = 9) {
  const medio = String(txt).length * tam * 0.3;   // que no se salga por los lados
  x = Math.max(medio + 4, Math.min(PAN.W - medio - 4, x));
  NUMS.push({ x, y, txt, t: 0, col, tam });
}

function tiembla(fuerza = 2, t = 0.2) { TEMBLOR.fuerza = Math.max(TEMBLOR.fuerza, fuerza); TEMBLOR.t = Math.max(TEMBLOR.t, t); }

function avanzaEfectos(dt) {
  for (let i = PART.length - 1; i >= 0; i--) {
    const p = PART[i]; p.t += dt;
    if (p.t >= p.dur) { PART.splice(i, 1); continue; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = NUMS.length - 1; i >= 0; i--) { const n = NUMS[i]; n.t += dt; n.y -= 22 * dt; if (n.t > 0.9) NUMS.splice(i, 1); }
  if (TEMBLOR.t > 0) { TEMBLOR.t -= dt; if (TEMBLOR.t <= 0) TEMBLOR.fuerza = 0; }
}

// desplaza el pincel si la pantalla tiembla (se llama antes de pintar el tablero)
function aplicaTemblor() {
  if (TEMBLOR.t <= 0) return;
  G.translate((Math.random() - 0.5) * 2 * TEMBLOR.fuerza, (Math.random() - 0.5) * 2 * TEMBLOR.fuerza);
}

function pintaEfectos(retro = false) {
  for (const p of PART) {
    const k = 1 - p.t / p.dur;
    if (retro) { G.fillStyle = RETRO.tinta; G.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2); continue; }
    G.globalAlpha = Math.min(1, k * 2);
    if (p.forma === 'moneda') { circulo(p.x, p.y, p.r, '#ffd54a', '#8a5a00', 1); circulo(p.x, p.y, p.r * 0.45, '#fff2b0', null); }
    else circulo(p.x, p.y, p.r * k, p.col, null);
  }
  G.globalAlpha = 1;
  for (const n of NUMS) {
    G.globalAlpha = Math.min(1, (0.9 - n.t) * 3);
    if (retro) letraMono(n.txt, n.x, n.y, n.tam, RETRO.tinta); else letra(n.txt, n.x, n.y, n.tam, n.col, 'center', '#06110a', 2.5);
  }
  G.globalAlpha = 1;
}
