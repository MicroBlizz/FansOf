// Fans of Nova · Destrucción: las naves revientan en trozos que salen girando, y el final de la partida espera unos segundos
// (cadena de explosiones de tu nave o del jefe) antes de enseñar la puntuación, para que se vea cómo acaba.
'use strict';
const NV_FIN_T = 2.4;   // segundos entre el golpe final y la pantalla de puntuación
// Empieza el final: la partida sigue corriendo (enemigos, balas, efectos) pero tú ya no mandas; luego pasa a `estado`.
function nvAcaba(S, estado, x, y, r) {
  if (S.estado !== 'juego') return;
  S.estado = 'final'; S.fin = { t: NV_FIN_T, estado, x, y, r, boom: 0, grande: false };
  if (estado === 'derrota') S.nave.destruida = true;
  S.aviso = null;
}
// Un paso del final: explosiones pequeñas seguidas y, al rato, la gorda; al acabar el tiempo, la puntuación.
function nvPasoFinal(S, dt) {
  const F = S.fin, z = nvZ(S), x = F.estado === 'derrota' ? S.nave.x : F.x, y = F.estado === 'derrota' ? S.nave.y : F.y, r = F.estado === 'derrota' ? S.nave.r : F.r;
  F.t -= dt; F.boom -= dt;
  const pasado = NV_FIN_T - F.t;
  if (pasado < 1.1 && F.boom <= 0) {   // explosiones sueltas por el casco
    F.boom = 0.09 + Math.random() * 0.08;
    const a = Math.random() * 6.283, q = Math.random() * r * 0.9;
    nvEstallido(S, x + Math.cos(a) * q, y + Math.sin(a) * q, r * (0.3 + Math.random() * 0.3), Math.random() < 0.5 ? '#ffd93d' : '#ff9a3c', 6);
  }
  if (pasado >= 1.1 && !F.grande) {   // la gorda: onda, destello, chispas y trozos de la nave
    F.grande = true;
    nvEstallido(S, x, y, r * 2.2, '#fff3c4', 40);
    S.fx.push({ t: 0.7, x, y, r: r * 4, color: '#ffd93d', tipo: 'onda' });
    if (F.estado === 'derrota') nvTrozosNave(S); else if (S.jefe) nvTrozos(S, S.jefe, 8);
  }
  if (F.t <= 0) { S.estado = F.estado; S.fin = null; }
  // la cámara sigue el punto del final
  S.cam.x += (x - S.cam.x) * Math.min(1, dt * 4); S.cam.y += (y - S.cam.y) * Math.min(1, dt * 4);
  void z;
}
function nvEstallido(S, x, y, r, color, n) {
  const z = nvZ(S);
  S.fx.push({ t: 0.22, x, y, r, color, tipo: 'flash' });
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (60 + Math.random() * 240) * Math.max(z, r / 30); S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.4 + Math.random() * 0.5, color: i % 3 ? color : '#ffffff', s: Math.max(3 * z, r * 0.12) }); }
}
// Trozos: pedazos del sprite (o chapas, si no hay arte) que salen despedidos girando y se apagan.
function nvTrozos(S, e, k) {
  if (!S.trozos) S.trozos = [];
  if (S.trozos.length > 60) return;
  const im = typeof NVE !== 'undefined' ? NVE.img[e.tipo] : null, ok = im && im.complete && im.naturalWidth, t = e.r * 2.6, a0 = e.rumbo || e.ang || 0;
  for (let i = 0; i < k; i++) {
    const a = a0 + (i / k) * 6.283 + Math.random() * 0.6, v = (40 + Math.random() * 120) * Math.max(1, e.r / 30), cx = i % 2, cy = (i >> 1) % 2;
    S.trozos.push({ x: e.x, y: e.y, vx: Math.cos(a) * v + (e.vx || 0) * 0.3, vy: Math.sin(a) * v + (e.vy || 0) * 0.3, ang: a0, va: (Math.random() - 0.5) * 6, t: 0.9 + Math.random() * 0.5, T: 1.4,
      img: ok ? im : null, sx: cx * im?.naturalWidth / 2 || 0, sy: cy * im?.naturalHeight / 2 || 0, sw: ok ? im.naturalWidth / 2 : 0, sh: ok ? im.naturalHeight / 2 : 0, tam: t / 2, color: e.d.color });
  }
}
function nvTrozosNave(S) {   // tu nave: sus cuatro cuartos
  const n = S.nave, im = typeof nvNaveImagen === 'function' ? nvNaveImagen(S.casco, nvClase(n.rango)) : null, L = im ? im.width : 0, t = L * n.escala;
  if (!S.trozos) S.trozos = [];
  for (let i = 0; i < 6; i++) {
    const a = n.ang + i * 1.047 + Math.random() * 0.5, v = 60 + Math.random() * 140, cx = i % 2, cy = (i >> 1) % 2;
    S.trozos.push({ x: n.x, y: n.y, vx: Math.cos(a) * v * nvZ(S), vy: Math.sin(a) * v * nvZ(S), ang: n.ang, va: (Math.random() - 0.5) * 5, t: 1.6, T: 1.6,
      img: i < 4 ? im : null, sx: cx * L / 2, sy: cy * L / 2, sw: L / 2, sh: L / 2, tam: i < 4 ? t / 2 : n.r * 0.5, color: '#ff9a3c' });
  }
}
function nvPasoTrozos(S, dt) {
  const l = S.trozos; if (!l) return;
  for (let i = l.length - 1; i >= 0; i--) { const o = l[i]; o.t -= dt; o.x += o.vx * dt; o.y += o.vy * dt; o.vx *= 1 - dt * 0.8; o.vy *= 1 - dt * 0.8; o.ang += o.va * dt; if (o.t <= 0) l.splice(i, 1); }
}
function nvDibujaTrozos(c, S) {
  const l = S.trozos; if (!l || !l.length) return;
  for (const o of l) {
    if (!nvVisible(S, o.x, o.y, o.tam * 2)) continue;
    c.save(); c.translate(o.x, o.y); c.rotate(o.ang); c.globalAlpha = Math.min(1, o.t / 0.4);
    if (o.img) c.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, -o.tam / 2, -o.tam / 2, o.tam, o.tam);
    else { const q = o.tam; c.beginPath(); c.moveTo(-q, -q * 0.4); c.lineTo(q * 0.2, -q); c.lineTo(q, q * 0.3); c.lineTo(-q * 0.3, q * 0.8); c.closePath(); c.fillStyle = '#6b7090'; c.fill(); c.lineWidth = 2; c.strokeStyle = o.color; c.stroke(); }
    c.restore();
  }
  c.globalAlpha = 1;
}
