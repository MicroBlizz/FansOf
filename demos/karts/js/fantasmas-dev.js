// Fans of Karts · LOS FANTASMAS DEL DESARROLLADOR: una vuelta grabada de cada pista (la conduce la máquina en nivel CEO) para correr
// contra ella en la contrarreloj. Cada pista: { t (tiempo), p (piloto), d (los puntos, 5 por segundo) }. En `d` cada punto va como el
// paso desde el anterior, un carácter por número (de -45 a 45); un «!» seguido de dos números de dos caracteres es un salto entero.
'use strict';

const FANTASMAS_DEV = {};
const ALFA_F = ' #$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const FANTASMAS_DEC = {};
function fantasmaDev(id) {
  const F = FANTASMAS_DEV[id]; if (!F) return null;
  if (!FANTASMAS_DEC[id]) {
    const pts = [], d = F.d; let x = 0, y = 0, i = 0, n = 0;
    const lee = () => ALFA_F.indexOf(d[i++]);
    while (i < d.length) {
      if (d[i] === '!') { i++; x = lee() * 91 + lee(); y = lee() * 91 + lee(); }
      else { x += lee() - 45; y += lee() - 45; }
      pts.push(x, y, 0); n++;
    }
    // el ángulo, de hacia dónde va
    for (let k = 0; k < n; k++) { const a = Math.max(0, k - 1), b = Math.min(n - 1, k + 1); pts[k * 3 + 2] = Math.round(Math.atan2(pts[b * 3 + 1] - pts[a * 3 + 1], pts[b * 3] - pts[a * 3]) * 100); }
    FANTASMAS_DEC[id] = pts;
  }
  // va un 6 % más lento que la máquina que lo grabó (sola y con tres Hotfix es muy rápida): así se le puede ganar
  return { pts: FANTASMAS_DEC[id], hz: 5 / 1.06, t: Math.round(F.t * 106) / 100, fig: figuraDe(F.p), nombre: 'DESARROLLADOR', dev: true };
}
