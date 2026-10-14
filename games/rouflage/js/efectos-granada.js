// Fans of Rouflage (prototipo) · EFECTOS DE LA GRANADA: el estallido (destello, onda de choque, chispas y bocanadas de humo) y la nube que se queda mientras dura la invisibilidad.
// Se apuntan en FX.lista como los demás efectos (efectos.js) y los dibuja pintaGranadaFx, que llama pintaFx para cada uno que no conoce.
'use strict';

function fxGranada(x, y, dura) {
  const cy = y - 24;
  FX.lista.push({ k: 'destello', x, y: cy, t: 0, dur: 0.55 });
  FX.lista.push({ k: 'choque', x, y: cy, t: 0, dur: 0.9 });
  FX.lista.push({ k: 'choque', x, y: cy, t: -0.16, dur: 0.9, fino: true });
  for (let i = 0; i < 46; i++) fxGota(x, cy, pick(['#ffffff', '#fff2a8', '#ffcb3d', '#ff9a3d', '#ff5a5a']), rand(-260, 260), rand(-300, 40));
  for (let i = 0; i < 26; i++) {
    const a = rand(0, TAU), v = rand(30, 170);
    FX.lista.push({ k: 'bocanada', x: x + rand(-8, 8), y: cy + rand(-8, 8), vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.7, r: rand(14, 30), t: 0, dur: rand(1.6, 3.2), tono: rand(0, 1) });
  }
  FX.lista.push({ k: 'nube', x, y: cy, t: 0, dur: dura, s: Math.random() * 100 });
  if (typeof CAM !== 'undefined') CAM.tiembla = Math.max(CAM.tiembla || 0, 0.45);
}
// una bocanada de humo: círculo gris violáceo con borde suave
function humo(c, x, y, r, alfa, tono) {
  c.globalAlpha = alfa; c.fillStyle = tono > 0.5 ? '#d9d2ea' : '#b7aed0'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.globalAlpha = alfa * 0.7; c.lineWidth = 2.4; c.strokeStyle = '#7d7399'; c.stroke(); c.globalAlpha = 1;
}
// devuelve true si lo ha dibujado
function pintaGranadaFx(c, f, t) {
  if (f.t < 0) return f.k === 'choque';      // el segundo aro espera un momento
  const p = f.t / f.dur;
  if (f.k === 'destello') {
    const r = 40 + p * 150, g = c.createRadialGradient(f.x, f.y, 4, f.x, f.y, r);
    g.addColorStop(0, `rgba(255,255,255,${1 - p})`); g.addColorStop(0.45, `rgba(255,236,150,${0.8 * (1 - p)})`); g.addColorStop(1, 'rgba(255,200,80,0)');
    c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, r, 0, TAU); c.fill();
    c.globalAlpha = 1 - p; c.strokeStyle = '#fff6ea'; c.lineWidth = 3;
    for (let k = 0; k < 14; k++) { const a = k * TAU / 14 + 0.2, r0 = 20 + p * 40, r1 = 70 + p * 170 * (k % 2 ? 0.7 : 1); c.beginPath(); c.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); c.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1); c.stroke(); }
    c.globalAlpha = 1; return true;
  }
  if (f.k === 'choque') {
    const r = 10 + suaviza(p) * GRANADA.radio; c.globalAlpha = (1 - p) * 0.95;
    c.beginPath(); c.arc(f.x, f.y, r, 0, TAU); c.lineWidth = f.fino ? 3 : 9; c.strokeStyle = OL; c.stroke(); c.lineWidth = f.fino ? 1.6 : 5; c.strokeStyle = f.fino ? '#ffffff' : '#ffe07a'; c.stroke();
    c.globalAlpha = 1; return true;
  }
  if (f.k === 'bocanada') { humo(c, f.x, f.y, f.r * (0.6 + p * 0.9), (1 - p) * 0.85, f.tono); return true; }
  if (f.k === 'nube') {      // la nube que se queda: unas cuantas bocanadas que respiran, y se deshace en los dos últimos segundos
    const resto = f.dur - f.t, alfa = Math.min(1, f.t / 0.5) * Math.min(1, resto / 2) * 0.78;
    for (let k = 0; k < 11; k++) {
      const a = k * 2.4 + f.s, d = 18 + (k % 3) * 16 + Math.sin(t * 1.3 + k) * 5, r = 26 + (k % 4) * 6 + Math.sin(t * 2 + k * 1.7) * 2.5;
      humo(c, f.x + Math.cos(a) * d, f.y + Math.sin(a) * d * 0.7 - (k % 2) * 6, r, alfa, (k % 2) * 0.8);
    }
    return true;
  }
  return false;
}
