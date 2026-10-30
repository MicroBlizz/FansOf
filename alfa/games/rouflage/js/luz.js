// Fans of Rouflage (prototipo) · LA LUZ: durante la caza Microblizz apaga las luces (para ahorrar) y cada cazador lleva una linterna.
// El abanico de luz se corta en los muros lanzando rayos; las paredes que se ven de frente sí se iluminan. La oscuridad es un velo
// sobre todo el mundo al que se le recortan los abanicos, pintado a la mitad de tamaño para que cueste poco en el móvil.
'use strict';

const LZ = { cv: null, c: null, w: 0, h: 0, pts: [] };

// el abanico de un cazador como lista de puntos del mundo: el foco y los extremos de cada rayo
// (soloMuros: el abanico que cortan solo las paredes, sin contar los muebles: la luz que se cuela entre ellos, difuminada)
function abanico(e, pts, soloMuros = false) {
  const ox = e.x, oy = e.y - 6, largo = REGLAS.luzLargo * (e.ciego > 0 ? 0.5 : 1) * eventoVisibilidad(), n = 30, medio = REGLAS.luzAngulo;
  pts.length = 0; pts.push(ox, oy);
  for (let k = 0; k <= n; k++) {
    const a = dirLuz(e) - medio + (2 * medio * k) / n, dx = Math.cos(a), dy = Math.sin(a);
    let d = soloMuros ? rayoMapa(ox, oy, dx, dy, largo) : rayo(ox, oy, dx, dy, largo);
    if (RAYO.cara && dy < -0.08) d = Math.min(largo, d + Math.min(76, 62 / -dy));   // la pared de frente se ilumina hasta arriba
    pts.push(ox + dx * d, oy + dy * d);
  }
  return pts;
}
const conLuz = e => !e.fuera && !(e.bot && e.bot.estado === 'espera') && e.balas > 0 && e.apagada <= 0;      // (apagada: el apagón de un fantasma)

function pintaLuces(c) {
  if (espectando() && J.yo.clase === 'cazador') return;      // el becario fantasma lo ve todo con luz normal (baliza.js)
  const a = J.oscuro * (extraOn('apagon') ? (J.modo === 'cazador' ? 0.985 : 0.86) : J.modo === 'cazador' ? 0.93 : 0.54); if (a < 0.01) return;      // Apagón total: casi nada
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
    const largo = REGLAS.luzLargo * (e.ciego > 0 ? 0.5 : 1) * eventoVisibilidad(), x = e.x, y = e.y - 6, pts = abanico(e, []);
    const gr = g.createRadialGradient(x, y, 8, x, y, largo); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.72, 'rgba(0,0,0,0.94)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.globalAlpha = REGLAS.luzPaso; const tras = abanico(e, [], true);      // primero la luz que atraviesa mesas, conos y estanterías a medias: sombras suaves en vez de duras
    g.beginPath(); g.moveTo(tras[0], tras[1]); for (let k = 2; k < tras.length; k += 2) g.lineTo(tras[k], tras[k + 1]); g.closePath(); g.fill(); g.globalAlpha = 1;
    g.beginPath(); g.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]); g.closePath(); g.fill();
    const rc = REGLAS.luzCerca + 16, gc = g.createRadialGradient(x, y, 6, x, y, rc); gc.addColorStop(0, 'rgba(0,0,0,0.92)'); gc.addColorStop(0.6, 'rgba(0,0,0,0.7)'); gc.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gc; g.beginPath(); g.arc(x, y, rc, 0, TAU); g.fill();
    haces.push(e.ropa && e.ropa.linterna ? { pts, col: e.ropa.linterna.color, borde: e.ropa.linterna.borde } : pts);      // la linterna del armario: su tono y su borde
  }
  for (const f of eventoFocos()) {      // los focos del mapa (faros, una ventana encendida…)
    const pts = abanicoFoco(f, []), gr = g.createRadialGradient(f.x, f.y, 8, f.x, f.y, f.largo); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.75, 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]); g.closePath(); g.fill();
    haces.push(pts);
  }
  c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingEnabled = true; c.drawImage(LZ.cv, 0, 0, cv.width, cv.height);
  // un velo cálido dentro de cada haz
  ponMundo(c);
  for (const hz of haces) {
    const pts = hz.pts || hz, traza = () => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath(); };
    c.fillStyle = hz.col ? hz.col.replace(/,[^,]*\)$/, `,${0.1 * J.oscuro})`) : `rgba(255,236,170,${0.075 * J.oscuro})`; traza(); c.fill();
    if (hz.borde) {
      c.save(); c.globalAlpha = 0.75 * J.oscuro; c.strokeStyle = hz.col.replace(/,[^,]*\)$/, ',1)'); c.lineWidth = 2.4; c.lineJoin = 'round';
      if (hz.borde === 'puntos') c.setLineDash([3, 6]);
      traza(); c.stroke(); c.restore();
      if (hz.borde === 'estrellas') for (let k = 1; k < 4; k++) { const i = 2 * Math.floor(pts.length / 4) - (k % 2) * 2, a = k / 4; c.save(); c.globalAlpha = 0.8 * J.oscuro; c.translate(pts[0] + (pts[i] - pts[0]) * a, pts[1] + (pts[i + 1] - pts[1]) * a); c.rotate(RELOJ * 1.5 + k); c.fillStyle = '#ffcb3d'; c.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 2.2 : 5.5, g = j * Math.PI / 5; c.lineTo(Math.cos(g) * r, Math.sin(g) * r); } c.closePath(); c.fill(); c.restore(); }
    }
  }
}
