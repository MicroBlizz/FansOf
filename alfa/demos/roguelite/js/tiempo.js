// Fans of Roguelite (prototipo) · El reloj del juego: esperas y animaciones que se escriben en orden («salta, espera, pega»)
// y que se paran con el congelado del golpe (hit-stop) y van al doble con el botón x2. Volver a empezar las cancela todas.
'use strict';

const RELOJ = { t: 0, vel: 1, congela: 0, gen: 0 };
const CANCELADO = new Error('cancelado');
const ESPERAS = [], ANIMAS = [];
let ELECCION = null;   // la elección que espera un toque del jugador

function espera(s) { return new Promise((ok, no) => ESPERAS.push({ hasta: RELOJ.t + s, ok, no, gen: RELOJ.gen })); }
// llama a f(k) en cada fotograma, con k de 0 a 1, durante s segundos de juego
function anima(s, f) { return new Promise((ok, no) => ANIMAS.push({ ini: RELOJ.t, dur: Math.max(0.001, s), f, ok, no, gen: RELOJ.gen })); }
// espera a que el jugador toque una de las opciones (la interfaz llama a elige(i))
function esperaEleccion() { return new Promise((ok, no) => { ELECCION = { ok, no, gen: RELOJ.gen }; }); }
function elige(i) { const e = ELECCION; if (!e) return; ELECCION = null; e.ok(i); }
// congela la acción unos milisegundos (el golpe «pesa»)
function congela(ms) { RELOJ.congela = Math.max(RELOJ.congela, ms / 1000); }
function cancelaTodo() {
  RELOJ.gen++;
  for (const l of [ESPERAS, ANIMAS]) { for (const e of l) e.no(CANCELADO); l.length = 0; }
  if (ELECCION) { ELECCION.no(CANCELADO); ELECCION = null; }
}
// avanza el reloj con el tiempo real; devuelve cuánto ha pasado en el juego
function avanzaReloj(real) {
  real = Math.min(real, 0.05);
  if (RELOJ.congela > 0) { RELOJ.congela -= real; return 0; }
  const dt = real * RELOJ.vel;
  RELOJ.t += dt;
  for (let i = ANIMAS.length - 1; i >= 0; i--) {
    const a = ANIMAS[i], k = Math.min(1, (RELOJ.t - a.ini) / a.dur);
    a.f(k);
    if (k >= 1) { ANIMAS.splice(i, 1); a.ok(); }
  }
  for (let i = ESPERAS.length - 1; i >= 0; i--) if (RELOJ.t >= ESPERAS[i].hasta) { const e = ESPERAS.splice(i, 1)[0]; e.ok(); }
  return dt;
}
// curvas para que nada se mueva a velocidad constante
const suave = k => k * k * (3 - 2 * k);
const sale = k => 1 - (1 - k) * (1 - k);
const entra = k => k * k;
const salto = k => 4 * k * (1 - k);   // arco de 0 a 1 y vuelta a 0
