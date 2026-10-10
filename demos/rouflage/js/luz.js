// Fans of Rouflage (prototipo) · LA LUZ: durante la caza Microblizz apaga las luces (para ahorrar) y cada cazador lleva una linterna.
// El abanico de luz se corta en los muros lanzando rayos; las paredes que se ven de frente sí se iluminan. La oscuridad es un velo
// sobre todo el mundo al que se le recortan los abanicos, pintado a la mitad de tamaño para que cueste poco en el móvil.
'use strict';

const LZ = { cv: null, c: null, w: 0, h: 0, pts: [] };

// el abanico de un cazador como lista de puntos del mundo: el foco y los extremos de cada rayo
function abanico(e, pts) {
  const ox = e.x, oy = e.y - 6, largo = AJUSTES.luzLargo * (e.ciego > 0 ? 0.5 : 1), n = 30, medio = AJUSTES.luzAngulo;
  pts.length = 0; pts.push(ox, oy);
  for (let k = 0; k <= n; k++) {
    const a = e.dir - medio + (2 * medio * k) / n, dx = Math.cos(a), dy = Math.sin(a);
    let d = rayo(ox, oy, dx, dy, largo);
    if (RAYO.cara && dy < -0.08) d = Math.min(largo, d + Math.min(76, 62 / -dy));   // la pared de frente se ilumina hasta arriba
    pts.push(ox + dx * d, oy + dy * d);
  }
  return pts;
}
const conLuz = e => !e.fuera && !(e.bot && e.bot.estado === 'espera') && e.balas > 0;

function pintaLuces(c) {
  const a = J.oscuro * (J.modo === 'cazador' ? 0.7 : 0.54); if (a < 0.01) return;
  const w = Math.ceil(cv.width / 2), h = Math.ceil(cv.height / 2);
  if (!LZ.cv || LZ.w !== w || LZ.h !== h) { [LZ.cv, LZ.c] = lienzo(w, h); LZ.w = w; LZ.h = h; }
  const g = LZ.c;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.fillStyle = `rgba(10,6,28,${a})`; g.fillRect(0, 0, w, h);
  g.setTransform(CAM.esc / 2, 0, 0, CAM.esc / 2, CAM.ox / 2, CAM.oy / 2);
  g.globalCompositeOperation = 'destination-out';
  const haces = [];
  for (const e of J.cazadores) {
    if (!conLuz(e)) continue;
    const largo = AJUSTES.luzLargo * (e.ciego > 0 ? 0.5 : 1), x = e.x, y = e.y - 6, pts = abanico(e, []);
    const gr = g.createRadialGradient(x, y, 8, x, y, largo); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.72, 'rgba(0,0,0,0.94)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]); g.closePath(); g.fill();
    const rc = AJUSTES.luzCerca + 16, gc = g.createRadialGradient(x, y, 6, x, y, rc); gc.addColorStop(0, 'rgba(0,0,0,0.92)'); gc.addColorStop(0.6, 'rgba(0,0,0,0.7)'); gc.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gc; g.beginPath(); g.arc(x, y, rc, 0, TAU); g.fill();
    haces.push(pts);
  }
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = true; c.drawImage(LZ.cv, 0, 0, cv.width, cv.height);
  // un velo cálido dentro de cada haz
  ponMundo(c); c.fillStyle = `rgba(255,236,170,${0.075 * J.oscuro})`;
  for (const pts of haces) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath(); c.fill(); }
}
