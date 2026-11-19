// Fans of Pop · CARITAS VARIADAS (tarea #110, Daniel 19-11-2026): muchas caras distintas en la burbuja, tanto en reposo como
// pulsada. Cada burbuja lleva la suya, fija mientras dura el nivel y distinta de un nivel a otro. Una cara es una fila de la tabla
// PP_CARA_PARTES (ojos, boca y un extra); los ojos, bocas y extras son tablas de trazos. Dominio puro arriba, dibujo abajo.
'use strict';

/* ---------- dominio: sin reloj, azar ni DOM ---------- */
const PP_CARAS = Object.freeze({
  despierta: Object.freeze(['sonrisa', 'feliz', 'guino', 'lengua', 'gatito', 'ilusion', 'asombro', 'timida', 'risa', 'silbido']),
  dormida: Object.freeze(['sueno', 'apretada', 'mareada', 'sorpresa', 'carcajada', 'burbuja', 'puchero', 'besito', 'gustito', 'lagrimita']),
});
const PP_CARA_PARTES = Object.freeze({
  // en reposo
  sonrisa: Object.freeze({ ojos: 'punto', boca: 'sonrisa', extra: null }),
  feliz: Object.freeze({ ojos: 'feliz', boca: 'abierta', extra: null }),
  guino: Object.freeze({ ojos: 'guino', boca: 'sonrisa', extra: null }),
  lengua: Object.freeze({ ojos: 'punto', boca: 'lengua', extra: null }),
  gatito: Object.freeze({ ojos: 'punto', boca: 'gato', extra: null }),
  ilusion: Object.freeze({ ojos: 'grande', boca: 'abierta', extra: 'brillo' }),
  asombro: Object.freeze({ ojos: 'redondo', boca: 'o', extra: null }),
  timida: Object.freeze({ ojos: 'punto', boca: 'linea', extra: 'rubor' }),
  risa: Object.freeze({ ojos: 'feliz', boca: 'sonrisa', extra: null }),
  silbido: Object.freeze({ ojos: 'punto', boca: 'o', extra: 'nota' }),
  // pulsada
  sueno: Object.freeze({ ojos: 'dormido', boca: 'punto', extra: 'z' }),
  apretada: Object.freeze({ ojos: 'apretado', boca: 'linea', extra: null }),
  mareada: Object.freeze({ ojos: 'espiral', boca: 'onda', extra: null }),
  sorpresa: Object.freeze({ ojos: 'redondo', boca: 'o', extra: 'gota' }),
  carcajada: Object.freeze({ ojos: 'apretado', boca: 'abierta', extra: null }),
  burbuja: Object.freeze({ ojos: 'dormido', boca: 'linea', extra: 'pompa' }),
  puchero: Object.freeze({ ojos: 'punto', boca: 'puchero', extra: null }),
  besito: Object.freeze({ ojos: 'dormido', boca: 'beso', extra: null }),
  gustito: Object.freeze({ ojos: 'feliz', boca: 'gato', extra: 'rubor' }),
  lagrimita: Object.freeze({ ojos: 'grande', boca: 'puchero', extra: 'gota' }),
});
// la cara de la burbuja i en el nivel `semilla`: `estado` es 'despierta' (levantada) o 'dormida' (pulsada), como da ppCaraDe
function ppCaraVariada(estado, i, semilla) {
  const lista = PP_CARAS[estado === 'despierta' ? 'despierta' : 'dormida'];
  const sal = (estado === 'despierta' ? 0x2d : 0x6b) + Math.imul((semilla | 0) + 1, 0x45d9f3b);
  return lista[Math.floor(ppHashCarita(i, sal) * lista.length) % lista.length];
}

/* ---------- dibujo: todo alrededor de (0, 0) y en radios r de la cara ---------- */
const PP_CARA_TINTA = '#3a1a1a';
function ppCaraTrazo(c, r, grosor = 0.1) { c.lineWidth = Math.max(2, r * grosor); c.strokeStyle = PP_CARA_TINTA; c.lineCap = 'round'; c.lineJoin = 'round'; }
function ppCaraArco(c, x, y, radio, desde, hasta) { c.beginPath(); c.arc(x, y, radio, Math.PI * desde, Math.PI * hasta); c.stroke(); }
function ppCaraLinea(c, puntos) { c.beginPath(); puntos.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
function ppCaraDisco(c, x, y, rx, ry, color) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = color; c.fill(); }

// un ojo en (x, 0): `lado` es -1 (izquierdo) o 1; `abre` es el parpadeo (1 abierto, 0 cerrado)
const PP_CARA_OJOS = Object.freeze({
  punto: (c, x, r, lado, abre) => ppCaritaOjo(c, x, 0, r * 0.2, abre),
  feliz: (c, x, r) => { ppCaraTrazo(c, r); ppCaraArco(c, x, r * 0.06, r * 0.16, 1.1, 1.9); },
  dormido: (c, x, r) => { ppCaraTrazo(c, r, 0.09); ppCaraArco(c, x, -r * 0.04, r * 0.15, 0.1, 0.9); },
  apretado: (c, x, r, lado) => { ppCaraTrazo(c, r); ppCaraLinea(c, [[x + lado * r * 0.15, -r * 0.13], [x - lado * r * 0.1, 0], [x + lado * r * 0.15, r * 0.13]]); },   // «> <»: la punta mira a la nariz
  guino: (c, x, r, lado, abre) => (lado < 0 ? PP_CARA_OJOS.punto(c, x, r, lado, abre) : PP_CARA_OJOS.feliz(c, x, r)),
  grande: (c, x, r, lado, abre) => {
    ppCaritaOjo(c, x, 0, r * 0.3, abre);
    if (abre > 0.5) ppCaraDisco(c, x + r * 0.08, r * 0.1, r * 0.06, r * 0.06, '#fff');
  },
  redondo: (c, x, r) => { ppCaraDisco(c, x, 0, r * 0.2, r * 0.2, '#fff'); ppCaraTrazo(c, r, 0.07); c.stroke(); ppCaraDisco(c, x, 0, r * 0.08, r * 0.08, PP_CARA_TINTA); },
  espiral: (c, x, r) => {
    ppCaraTrazo(c, r, 0.07); c.beginPath();
    for (let k = 0; k <= 24; k++) { const a = k / 24 * Math.PI * 3.5, d = r * 0.2 * k / 24; c.lineTo(x + Math.cos(a) * d, Math.sin(a) * d); }
    c.stroke();
  },
});
// la boca, centrada en (0, 0)
const PP_CARA_BOCAS = Object.freeze({
  sonrisa: (c, r) => { ppCaraTrazo(c, r); ppCaraArco(c, 0, -r * 0.06, r * 0.2, 0.15, 0.85); },
  abierta: (c, r) => {
    c.beginPath(); c.arc(0, -r * 0.02, r * 0.2, 0, Math.PI); c.closePath(); c.fillStyle = PP_CARA_TINTA; c.fill();
    ppCaraDisco(c, 0, r * 0.11, r * 0.1, r * 0.06, '#ff7a9a');
  },
  o: (c, r) => ppCaraDisco(c, 0, r * 0.04, r * 0.09, r * 0.11, PP_CARA_TINTA),
  lengua: (c, r) => {
    PP_CARA_BOCAS.sonrisa(c, r);
    c.beginPath(); c.arc(r * 0.06, r * 0.12, r * 0.09, 0, Math.PI); c.closePath(); c.fillStyle = '#ff7a9a'; c.fill(); ppCaraTrazo(c, r, 0.05); c.stroke();
  },
  gato: (c, r) => { ppCaraTrazo(c, r, 0.09); ppCaraArco(c, -r * 0.1, 0, r * 0.1, 0, 1); ppCaraArco(c, r * 0.1, 0, r * 0.1, 0, 1); },
  linea: (c, r) => { ppCaraTrazo(c, r, 0.09); ppCaraLinea(c, [[-r * 0.1, r * 0.06], [r * 0.1, r * 0.06]]); },
  onda: (c, r) => { ppCaraTrazo(c, r, 0.08); ppCaraLinea(c, [[-r * 0.2, r * 0.08], [-r * 0.1, 0], [0, r * 0.08], [r * 0.1, 0], [r * 0.2, r * 0.08]]); },
  punto: (c, r) => ppCaraDisco(c, 0, r * 0.06, r * 0.07, r * 0.05, PP_CARA_TINTA),
  puchero: (c, r) => { ppCaraTrazo(c, r); ppCaraArco(c, 0, r * 0.2, r * 0.14, 1.2, 1.8); },
  beso: (c, r) => { ppCaraTrazo(c, r, 0.08); ppCaraArco(c, 0, 0, r * 0.06, 1.5, 2.5); ppCaraArco(c, 0, r * 0.12, r * 0.06, 1.5, 2.5); },
});
// k va de 0 a 1 en bucle (lo que sube y se desvanece)
const PP_CARA_EXTRAS = Object.freeze({
  z: (c, r, k) => ppCaritaZ(c, r, k),
  rubor: (c, r) => { ppCaraDisco(c, -r * 0.62, r * 0.22, r * 0.26, r * 0.16, 'rgba(255,90,130,0.5)'); ppCaraDisco(c, r * 0.62, r * 0.22, r * 0.26, r * 0.16, 'rgba(255,90,130,0.5)'); },
  brillo: (c, r, k) => {
    const s = r * 0.14 * (0.6 + 0.4 * Math.sin(k * Math.PI * 2)), x = r * 0.7, y = -r * 0.55;
    c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.3, y - s * 0.3); c.lineTo(x + s, y); c.lineTo(x + s * 0.3, y + s * 0.3);
    c.lineTo(x, y + s); c.lineTo(x - s * 0.3, y + s * 0.3); c.lineTo(x - s, y); c.lineTo(x - s * 0.3, y - s * 0.3); c.closePath(); c.fillStyle = '#fff'; c.fill();
  },
  gota: (c, r) => {
    const x = r * 0.72, y = -r * 0.3, s = r * 0.12;
    c.beginPath(); c.moveTo(x, y - s * 1.6); c.quadraticCurveTo(x + s * 1.3, y + s * 0.4, x, y + s); c.quadraticCurveTo(x - s * 1.3, y + s * 0.4, x, y - s * 1.6);
    c.fillStyle = '#9adfff'; c.fill(); ppCaraTrazo(c, r, 0.05); c.stroke();
  },
  pompa: (c, r, k) => {
    const s = r * (0.1 + 0.14 * (0.5 + 0.5 * Math.sin(k * Math.PI * 2)));
    c.beginPath(); c.arc(r * 0.3 + s, r * 0.34, s, 0, Math.PI * 2); c.fillStyle = 'rgba(225,246,255,0.92)'; c.fill(); ppCaraTrazo(c, r, 0.05); c.stroke();
  },
  nota: (c, r, k) => {
    const x = r * 0.6 + k * r * 0.15, y = -r * 0.3 - k * r * 0.5, s = r * 0.1;
    c.save(); c.globalAlpha = 1 - k; ppCaraDisco(c, x, y, s, s * 0.8, PP_CARA_TINTA);
    ppCaraTrazo(c, r, 0.06); ppCaraLinea(c, [[x + s * 0.8, y], [x + s * 0.8, y - s * 2.6], [x + s * 2, y - s * 2]]); c.restore();
  },
});
// la cara `nombre` (de PP_CARA_PARTES) en (cx, cy) con radio r; abre = parpadeo; t = segundos; i = su burbuja (desfasa los extras)
function ppPintaCaraVariada(c, cx, cy, r, nombre, abre, t, i = 0) {
  const p = PP_CARA_PARTES[nombre];
  if (!p) return;
  const k = (((t * PP_CARITA.zPorSegundo + ppHashCarita(i, 0x3c)) % 1) + 1) % 1;
  c.save(); c.translate(cx, cy);
  ppCaritaColoretes(c, r);
  c.save(); c.translate(0, -r * 0.08);
  for (const lado of [-1, 1]) PP_CARA_OJOS[p.ojos](c, lado * r * 0.36, r, lado, abre);
  c.restore();
  c.save(); c.translate(0, r * 0.2); PP_CARA_BOCAS[p.boca](c, r); c.restore();
  if (p.extra) PP_CARA_EXTRAS[p.extra](c, r, k);
  c.restore();
}
