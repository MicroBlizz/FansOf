// Fans Of · Utilidades: lo pequeño que usan todos los sistemas y todos los juegos. No depende de nada más.
'use strict';
/* ---------- la página ---------- */
const $ = s => document.querySelector(s);
const OL = '#20102c';                                                    // el color del contorno de todos los dibujos
const FONT_D = '"Luckiest Guy", "Arial Black", Impact, sans-serif';
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;   // el jugador ha pedido menos animaciones
// reduce la letra hasta que el texto quepa en su recuadro
function fitText(el, max, min) { el.style.fontSize = max + 'px'; let sz = max; while (el.scrollWidth > el.clientWidth + 0.5 && sz > min) { sz -= 0.5; el.style.fontSize = sz + 'px'; } }

/* ---------- números y azar ---------- */
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[(Math.random() * a.length) | 0];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- textos ---------- */
const fmt = n => Math.floor(n).toLocaleString('es-ES');                 // 12345 -> «12.345»
const fmtV = v => String(v).replace('.', ',');                    // 1.5 -> «1,5»
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }   // el día de hoy, para lo que cambia cada día

/* ---------- dibujo ---------- */
function rrPath(c, x, y, w, h, r) { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
// luz suave sobre un fondo: más oscuro en los bordes y un toque de sol arriba a la izquierda (W y H son el tamaño del campo: core/js/serie/config.js)
function paintLight(x) {
  const v = x.createRadialGradient(W / 2, H * 0.47, H * 0.3, W / 2, H * 0.47, H * 0.7); v.addColorStop(0, 'rgba(20,6,36,0)'); v.addColorStop(1, 'rgba(20,6,36,.32)');
  x.fillStyle = v; x.fillRect(0, 0, W, H);
  const sl = x.createRadialGradient(70, 120, 0, 70, 120, 440); sl.addColorStop(0, 'rgba(255,238,200,.13)'); sl.addColorStop(1, 'rgba(255,238,200,0)');
  x.fillStyle = sl; x.fillRect(0, 0, W, H);
}

/* ---------- ganchos ----------
   Los sistemas comunes dejan huecos con nombre (fire) y cada juego engancha ahí lo que solo tiene él (hook): un botón de más,
   un dibujo, un dato. Si nadie engancha nada, no pasa nada. Lo que devuelvan los enganchados, si es texto, se junta. */
const HOOKS = {};
function hook(name, fn) { (HOOKS[name] = HOOKS[name] || []).push(fn); }
function fire(name, ...a) { let out = ''; for (const fn of HOOKS[name] || []) { const r = fn(...a); if (typeof r === 'string') out += r; } return out; }
