// Fans of Rouflage · LO QUE SE VE Y SE OYE DE LAS HABILIDADES (talentos-partida.js): el dron (hélices, luz roja, sombra en el suelo, el barrido y la diana con
// el nombre del marcado), el brillo ultravioleta, el contador, el pitido del silbato, el vapor del café, las huellas de gato, el humo del cambiazo y del señuelo.
// dibujo.js llama a talentosCosas (los señuelos van ordenados con los demás personajes), talentosPintaLuz (sobre la oscuridad) y talentosPinta (encima de todo).
'use strict';

Object.assign(SFX, {
  // el contador de mano: clic-clic y una campanita
  contador: (v = 1, out = master) => { ruidoEn(out, 0.03, 0.18 * v, 4200, 'highpass'); ruidoEn(out, 0.03, 0.18 * v, 4200, 'highpass', 0.11); tonoEn(out, 1568, 1568, 0.2, 'sine', 0.08 * v, 0.24); tonoEn(out, 2093, 2093, 0.25, 'sine', 0.06 * v, 0.3); },
  // el dron: el zumbido de las hélices (se repite mientras vuela), el despegue, el bip de que ha llegado y el de marcar
  dron: (v = 1, out = master) => { tonoEn(out, 196, 205, 0.24, 'sawtooth', 0.025 * v); tonoEn(out, 392, 400, 0.24, 'square', 0.012 * v); ruidoEn(out, 0.22, 0.02 * v, 900, 'bandpass'); },
  dronSale: () => { tone(160, 420, 0.5, 'sawtooth', 0.05); noise(0.4, 0.06, 1200, 'bandpass'); },
  dronBip: () => { tone(1320, 1320, 0.07, 'square', 0.05); tone(1320, 1320, 0.07, 'square', 0.05, 0.12); },
  dronMarca: () => { [880, 1175, 1568].forEach((f, i) => tone(f, f, 0.1, 'square', 0.06, i * 0.09)); },
  senal: () => { noise(0.5, 0.12, 2400, 'bandpass'); tone(700, 120, 0.5, 'sawtooth', 0.05); },
  // el silbato del jefe: un pitido de árbitro con su trino
  pito: (v = 1, out = master) => { for (let i = 0; i < 9; i++) tonoEn(out, i % 2 ? 2650 : 2850, i % 2 ? 2600 : 2900, 0.07, 'square', 0.05 * v, i * 0.06); tonoEn(out, 2800, 2750, 0.35, 'sine', 0.1 * v, 0.56); },
  // la linterna ultravioleta: un zumbido que sube
  uv: (v = 1, out = master) => { tonoEn(out, 110, 440, 0.45, 'sawtooth', 0.04 * v); tonoEn(out, 880, 1760, 0.4, 'sine', 0.05 * v, 0.05); },
  // el café: sorbo y arrancada
  cafe: (v = 1, out = master) => { ruidoEn(out, 0.25, 0.1 * v, 700, 'bandpass'); tonoEn(out, 300, 900, 0.3, 'triangle', 0.07 * v, 0.22); },
  gato: () => { tone(700, 1100, 0.12, 'sine', 0.06); tone(1100, 620, 0.22, 'sine', 0.05, 0.12); },
  senuelo: (v = 1, out = master) => { ruidoEn(out, 0.2, 0.14 * v, 1400, 'bandpass'); tonoEn(out, 520, 260, 0.2, 'triangle', 0.07 * v); tonoEn(out, 990, 1320, 0.1, 'sine', 0.05 * v, 0.12); },
  cambiazo: (v = 1, out = master) => { tonoEn(out, 300, 1200, 0.22, 'sine', 0.08 * v); tonoEn(out, 1200, 300, 0.22, 'sine', 0.07 * v, 0.2); ruidoEn(out, 0.3, 0.06 * v, 2000, 'bandpass'); },
});
Object.assign(THROTTLE, { dron: 180 });
const UV_COL = '#c77dff';

function talentosCosas(cosas, x0, y0, vw, vh) { for (const s of TALP.senuelos) if (!s.rota && s.x > x0 - 60 && s.x < x0 + vw + 60 && s.y > y0 - 20 && s.y < y0 + vh + 90) cosas.push(s); }

// sobre la oscuridad: la luz ultravioleta (el haz morado) y el brillo de la pintura de los colados que alumbra
function talentosPintaLuz(c, t) {
  for (const h of J.cazadores) {
    if (!(h.uv > 0) || !conLuz(h)) continue;
    const pts = abanico(h, []), a = Math.min(1, h.uv / 0.4, (habDef('uv').dura - h.uv) / 0.25 + 0.2);
    c.save(); c.globalAlpha = 0.22 * a; c.fillStyle = UV_COL; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath(); c.fill();
    c.globalAlpha = 0.6 * a; c.strokeStyle = '#e9c8ff'; c.lineWidth = 2; c.setLineDash([4, 5]); c.lineDashOffset = -t * 30; c.stroke(); c.restore();
    for (const k of J.camaleones) {
      if (k.fuera || invisible(k) || k === h.cuerpo || !veCazador(h, k.x, k.y - 20)) continue;
      const p = postura(k, t), pulso = 0.75 + 0.25 * Math.sin(t * 9 + k.semilla);
      c.save(); c.translate(Math.round(k.x), Math.round(k.y));
      c.globalAlpha = a * pulso; c.shadowColor = UV_COL; c.shadowBlur = 18; c.beginPath(); trazaAlubia(c, p); c.lineWidth = 4; c.strokeStyle = '#d9a6ff'; c.lineJoin = 'round'; c.stroke();
      c.shadowBlur = 0; c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.55 * a * pulso; pielConPostura(c, k, p);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 0.5 * a; c.beginPath(); trazaAlubia(c, p); c.lineWidth = 1.6; c.strokeStyle = '#fff'; c.stroke();
      c.restore();
    }
  }
}

// el dron, de lado, a cierta altura sobre su sombra
function pintaDron(c, d, t) {
  const x = d.x, y = d.y - d.alto, rota = t * 40, perdido = d.fase === 'perdida', a = d.fase === 'vuelve' || perdido ? Math.max(0, 1 - d.t / 1.4) : 1;
  c.save(); c.globalAlpha = a;
  c.fillStyle = 'rgba(16,8,30,.35)'; c.beginPath(); c.ellipse(d.x, d.y + 8, 18 - Math.min(8, d.alto / 12), 5, 0, 0, TAU); c.fill();
  if (d.fase === 'barre') {      // el barrido: un cono rojo que va y viene
    const g = c.createLinearGradient(x, y, x, d.y + 10); g.addColorStop(0, 'rgba(255,70,90,.55)'); g.addColorStop(1, 'rgba(255,70,90,.05)');
    const w = 26 + Math.sin(t * 12) * 8; c.fillStyle = g; c.beginPath(); c.moveTo(x - 4, y + 6); c.lineTo(x + 4, y + 6); c.lineTo(x + w, d.y + 12); c.lineTo(x - w, d.y + 12); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,140,150,.9)'; c.lineWidth = 2; const by = y + 6 + ((t * 2.4) % 1) * (d.y + 6 - y); c.beginPath(); c.moveTo(x - 6 - (by - y) * 0.45, by); c.lineTo(x + 6 + (by - y) * 0.45, by); c.stroke();
  }
  c.translate(x, y); if (perdido) c.rotate(Math.sin(d.t * 18) * 0.25); else c.rotate(Math.sin(t * 3) * 0.06);
  c.lineJoin = 'round'; c.lineCap = 'round';
  for (const s of [-1, 1]) {      // brazos y hélices
    c.strokeStyle = OL; c.lineWidth = 6; c.beginPath(); c.moveTo(s * 6, 0); c.lineTo(s * 17, -6); c.stroke(); c.strokeStyle = '#5d6a8a'; c.lineWidth = 2.6; c.stroke();
    c.fillStyle = OL; c.fillRect(s * 17 - 2, -10, 4, 5);
    const ab = Math.abs(Math.cos(rota + s)) * 11 + 3;
    c.beginPath(); c.ellipse(s * 17, -10, ab, 2.6, 0, 0, TAU); c.fillStyle = 'rgba(225,238,255,.85)'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.ellipse(s * 17, -10, 13, 3.2, 0, 0, TAU); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.stroke();
  }
  c.beginPath(); c.roundRect(-11, -6, 22, 13, 6); c.fillStyle = '#f4f1fa'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.moveTo(-7, -3); c.lineTo(3, -3); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.9)'; c.stroke();
  c.beginPath(); c.arc(0, 2, 4, 0, TAU); c.fillStyle = OL; c.fill(); c.beginPath(); c.arc(0, 2, 2.2, 0, TAU); c.fillStyle = perdido ? '#555' : d.fase === 'marca' || d.fase === 'barre' ? '#ff4b5c' : '#39d5e8'; c.fill();
  const luz = Math.sin(t * 10) > 0 && !perdido;
  c.beginPath(); c.arc(8, -2, 2, 0, TAU); c.fillStyle = luz ? '#ff4b5c' : '#7a2030'; c.fill();
  if (luz) { c.globalAlpha = a * 0.4; c.beginPath(); c.arc(8, -2, 6, 0, TAU); c.fillStyle = '#ff4b5c'; c.fill(); c.globalAlpha = a; }
  c.strokeStyle = OL; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-6, 7); c.lineTo(-8, 12); c.moveTo(6, 7); c.lineTo(8, 12); c.stroke();
  if (perdido) for (let i = 0; i < 3; i++) { const ax = Math.sin(t * 31 + i * 2) * 14, ay = -16 - i * 5; c.strokeStyle = '#ffe07a'; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + 3, ay - 4); c.lineTo(ax - 1, ay - 6); c.stroke(); }
  c.restore();
}
// la diana del dron sobre el colado marcado (la ven los becarios, los fantasmas y el propio marcado), con su nombre
function pintaMarcaDron(c, k, t) {
  const ve = !J.yo || J.yo.clase === 'cazador' || k === J.yo || espectando(); if (!ve) return;
  const a = Math.min(1, k.marcaDron / 0.5), x = k.x, y = k.y - 26, r = 30 + Math.sin(t * 8) * 3;
  c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(t * 1.4);
  c.strokeStyle = OL; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
  c.strokeStyle = '#ff4b5c'; c.lineWidth = 3; c.setLineDash([10, 7]); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.setLineDash([]);
  for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.strokeStyle = OL; c.lineWidth = 6; c.beginPath(); c.moveTo(r - 8, 0); c.lineTo(r + 8, 0); c.stroke(); c.strokeStyle = '#ff4b5c'; c.lineWidth = 3; c.stroke(); }
  c.restore();
  c.save(); c.globalAlpha = a; rotulo(c, k.nombre, x, y + r + 16, 13, '#ff8a96', OL); c.restore();      // debajo: encima está el dron
}
function talentosPinta(c, t) {
  for (const k of J.camaleones) if (k.marcaDron > 0 && !k.fuera) pintaMarcaDron(c, k, t);
  for (const s of TALP.senuelos) {      // tu señuelo: solo tú ves dónde está (contorno de puntos y su cartelito), como el fantasma de la granada
    if (s.rota || s.dueno2 !== J.yo) continue;
    c.save(); c.translate(s.x, s.y); c.beginPath(); trazaAlubia(c, postura(s, t)); c.setLineDash([4, 4]); c.lineDashOffset = -t * 12; c.lineWidth = 2; c.strokeStyle = 'rgba(226,184,255,.9)'; c.stroke(); c.restore();
    rotulo(c, tr('TU SEÑUELO'), s.x, s.y - 72, 11, '#e2b8ff', OL);
  }
  for (const d of TALP.drones) pintaDron(c, d, t);
  for (const f of TALP.fx) {
    const p = f.t / f.dur, e = f.e;
    c.save();
    if (f.k === 'contador' && e) {      // el contador de mano sobre la cabeza, con el número (solo lo ve quien lo usa)
      const sube = Math.min(1, p * 6), y = e.y - 58 - sube * 8, s = 1.35 * (0.6 + 0.4 * Math.min(1, p * 5) + (p < 0.2 ? Math.sin(p * 30) * 0.08 : 0));
      c.globalAlpha = Math.min(1, (1 - p) * 4); c.translate(e.x + 34, y); c.scale(s, s);
      c.beginPath(); c.arc(0, 0, 17, 0, TAU); c.fillStyle = OL; c.fill(); c.beginPath(); c.arc(0, -1.5, 15, 0, TAU); c.fillStyle = '#9fb3d6'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
      c.beginPath(); c.roundRect(-11, -9, 22, 14, 3); c.fillStyle = '#20283c'; c.fill();
      c.fillStyle = '#7ee04a'; c.font = '400 13px ' + LETRA_GORDA; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(f.n >= 0 ? String(Math.min(f.n, Math.floor(p * 14))).padStart(2, '0') : '??', 0, -1.5);
      c.beginPath(); c.roundRect(6, -22, 8, 7, 2); c.fillStyle = '#ff4b5c'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
    } else if (f.k === 'silbato' && e) {      // el pitido: aros amarillos y «¡PRIII!»
      for (let i = 0; i < 3; i++) { const q = Math.max(0, Math.min(1, p * 1.6 - i * 0.22)); if (!q || q >= 1) continue; c.globalAlpha = 1 - q; c.beginPath(); c.arc(e.x, e.y - 40, 20 + q * 140, 0, TAU); c.lineWidth = 5 * (1 - q) + 1; c.strokeStyle = '#ffcb3d'; c.stroke(); }
      c.globalAlpha = Math.min(1, (1 - p) * 3); rotulo(c, tr('¡PRIII!'), e.x, e.y - 86 - p * 14, 18, '#ffcb3d', OL);
    } else if (f.k === 'cafe' && e) { c.globalAlpha = 1 - p; rotulo(c, tr('¡CAFÉ!'), e.x, e.y - 80 - p * 20, 15, '#ffd9a8', OL); }
    else if (f.k === 'vapor') { c.globalAlpha = (1 - p) * 0.7; c.fillStyle = '#fff6ea'; c.beginPath(); c.arc(f.x, f.y - p * 14, 3 + p * 6, 0, TAU); c.fill(); }
    else if (f.k === 'huella') {      // huellas de gato que se borran
      c.globalAlpha = Math.min(1, (1 - p) * 1.6) * 0.8; c.translate(f.x, f.y); c.rotate(f.a + Math.PI / 2); c.scale(1.7, 1.7); c.shadowColor = 'rgba(32,16,44,.8)'; c.shadowOffsetY = 1; c.fillStyle = '#ffb3d1';
      c.beginPath(); c.ellipse(0, 2, 3.4, 2.8, 0, 0, TAU); c.fill(); for (const [x, y] of [[-3.6, -2.5], [-1.2, -4.4], [1.2, -4.4], [3.6, -2.5]]) { c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill(); }
    } else if (f.k === 'poof') {      // la nube de pintura del cambiazo y del señuelo
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = 10 + p * 30; c.globalAlpha = (1 - p) * 0.85; c.fillStyle = ['#fff6ea', '#e2b8ff', '#bdeeff'][i % 3]; c.beginPath(); c.arc(f.x + Math.cos(a) * d, f.y - 26 + Math.sin(a) * d * 0.7, 9 * (1 - p * 0.5), 0, TAU); c.fill(); }
    } else if (f.k === 'cambiazo') {      // un arco de chispas de un sitio al otro
      c.globalAlpha = 1 - p; c.strokeStyle = '#ffcb3d'; c.lineWidth = 3; c.setLineDash([6, 6]); c.lineDashOffset = -f.t * 60;
      const mx = (f.x1 + f.x2) / 2, my = Math.min(f.y1, f.y2) - 80; c.beginPath(); c.moveTo(f.x1, f.y1 - 30); c.quadraticCurveTo(mx, my, f.x2, f.y2 - 30); c.stroke();
    }
    c.restore();
  }
}
