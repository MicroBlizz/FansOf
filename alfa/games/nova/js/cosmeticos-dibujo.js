// Fans of Nova · Cómo se ven los cosméticos de la galaxia de la comunidad en la vista 2D: la pintura sobre el casco (guardada en la caché,
// una vez por casco, clase y facción), la estela que suelta el motor y el emblema de la facción en el casco. El cosmético es un dato
// ('facción-pieza', reglas en dominio/cosmeticos.js): esta capa solo lo pinta. Sin Math.random: la variedad sale de un número fijo por
// partícula, para no tocar el azar de la partida. Diseño: docs/nova/cosmeticos-galaxia.md.
'use strict';
const nvRuido = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };   // 0..1, siempre el mismo para cada i

// Lo que lleva tu nave en esta misión: lo puesto en la campaña (nunca el bot ni el simulador, ni los enemigos)
function nvAspectoInicio(S) {
  const f = NVP.camp && !NVP.auto && NVP.camp.frente;
  S.lleva = f ? NV.Cosmeticos.lleva(f, NV_FRENTE.cosmeticos) : {};
  S.estelaP = [];
}
const nvFacDe = c => c ? NV.Cosmeticos.parte(c).fac : null;

// ---------- pintura: el dibujo de la facción sobre el casco (el color de base no cambia) ----------
const NV_PINTURAS = {
  animales: (c, col) => { c.fillStyle = NV_TINTA; for (let y = -130; y < 130; y += 34) for (const l of [-1, 1]) { c.beginPath(); c.moveTo(l * 140, y); c.quadraticCurveTo(l * 70, y + 10, l * 20, y + 24); c.quadraticCurveTo(l * 70, y + 22, l * 140, y + 16); c.fill(); } c.fillStyle = col; c.globalAlpha *= 0.35; c.fillRect(-140, -140, 280, 280); },
  nomuertos: (c, col) => { c.strokeStyle = col; c.lineCap = 'round'; c.shadowColor = col; c.shadowBlur = 12; for (let k = 0; k < 6; k++) { c.lineWidth = 5 - k % 3; c.beginPath(); let x = -90 + 36 * k, y = -110 + 30 * (k % 3); c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (nvRuido(k * 7 + j) - 0.5) * 50; y += 32; c.lineTo(x, y); } c.stroke(); } },
  streamers: (c, col) => { c.fillStyle = col; c.fillRect(-18, -140, 36, 280); c.fillStyle = '#fff'; c.fillRect(-6, -140, 12, 280); c.beginPath(); c.arc(0, -52, 13, 0, 6.283); c.fillStyle = '#ff2d2d'; c.fill(); c.lineWidth = 4; c.strokeStyle = NV_TINTA; c.stroke(); },
  heroes: (c, col) => { c.beginPath(); c.moveTo(-26, -10); c.lineTo(26, -10); c.lineTo(46, 140); c.lineTo(-46, 140); c.closePath(); c.fillStyle = '#d33a4a'; c.fill(); nvIcPoli(c, nvIcEstrella(0, -66, 24, 10, 5), col); },
  ciber: (c, col) => { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 4; for (let k = 0; k < 8; k++) { const x = -110 + 30 * k, y = -100 + 25 * (k % 4), dx = (k % 2 ? 1 : -1) * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 50); c.lineTo(x + dx, y + 80); c.lineTo(x + dx, y + 130); c.stroke(); c.beginPath(); c.arc(x, y, 6, 0, 6.283); c.arc(x + dx, y + 130, 6, 0, 6.283); c.fill(); } },
  memes: (c, col) => { const tonos = [col, '#ff4fd8', '#22e3ff', '#fff']; for (let k = 0; k < 70; k++) { c.fillStyle = tonos[k % 4]; const t = 8 + 10 * nvRuido(k + 3); c.fillRect(-130 + 260 * nvRuido(k), -130 + 260 * nvRuido(k + 100), t * 2.2, t); } },
  gamer: c => { const tonos = ['#ff3b3b', '#4ade80', '#3b82ff']; c.save(); c.rotate(-0.5); for (let k = -6; k < 6; k++) { c.fillStyle = tonos[(k + 6) % 3]; c.fillRect(-200, k * 30, 400, 14); } c.restore(); },
  olvidados: (c, col) => { for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(-100 + 200 * nvRuido(k + 40), -110 + 220 * nvRuido(k + 60), 10 + 16 * nvRuido(k), 0, 6.283); c.fillStyle = '#8a4b22'; c.fill(); } for (const [x, y] of [[-44, -30], [30, 30], [-20, 70]]) { c.fillStyle = col; c.fillRect(x, y, 34, 26); c.lineWidth = 3; c.strokeStyle = NV_TINTA; c.setLineDash([5, 4]); c.strokeRect(x + 4, y + 4, 26, 18); c.setLineDash([]); } },
  pop: (c, col) => { for (let y = -130; y < 140; y += 30) for (let x = -130 + (y / 30 % 2 ? 15 : 0); x < 140; x += 30) { c.beginPath(); c.arc(x, y, 8, 0, 6.283); c.fillStyle = col; c.fill(); } c.fillStyle = '#fff'; for (const [x, y] of [[-40, -60], [36, 10], [-10, 80]]) c.fill(new Path2D(nvRutaEstrella(x, y, 14, 4))); }
};
function nvRutaEstrella(x, y, R, n) { return nvIcEstrella(x, y, R, R * 0.3, n).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ') + 'Z'; }
// Las alas o el casco con la pintura encima, en un lienzo de la caché (una vez por casco, clase, capa y facción)
function nvCapaPintada(casco, k, capa, fac) {
  const id = casco + '-' + k + '-' + capa + '-p-' + fac; if (NV_CACHE.sombra[id]) return NV_CACHE.sombra[id];
  if (!NVA.listo || !NV_PINTURAS[fac]) return null;
  const s = document.createElement('canvas'); s.width = s.height = NV_SOMBRA_L; const c = s.getContext('2d');
  c.translate(NV_SOMBRA_L / 2, NV_SOMBRA_L / 2); nvCuerpo(c, casco, k, capa);
  c.globalCompositeOperation = 'source-atop'; c.globalAlpha = 0.6;
  const e = (capa === 'alas' ? 1.6 : 1) * (1 + 0.2 * k); c.scale(e, e);   // el dibujo está pensado para un casco de ±140: las alas y las clases grandes, más
  NV_PINTURAS[fac](c, NV_FAC_COLOR[fac]);
  return (NV_CACHE.sombra[id] = s);
}
// En nvDibujaNave, en lugar de las alas o el casco de siempre: con la pintura que lleves o, si no llevas, tal cual
function nvPintaCapa(c, S, k, capa) {
  const fac = S.lleva && nvFacDe(S.lleva.pintura), im = fac && nvCapaPintada(S.casco, k, capa, fac);
  if (im) c.drawImage(im, -NV_SOMBRA_L / 2, -NV_SOMBRA_L / 2); else nvCuerpo(c, S.casco, k, capa);
}

// ---------- emblema: el icono de la facción en el casco, donde no lo tapa ninguna ranura ----------
const NV_EMBLEMA_SITIO = {};
function nvSitioEmblema(H, clave) {
  if (NV_EMBLEMA_SITIO[clave]) return NV_EMBLEMA_SITIO[clave];
  let mejor = { y: 0, r: 0 };
  for (let y = -70; y <= 70; y += 4) {   // a lo largo del eje de la nave, el punto más lejos de todas las ranuras
    const d = Math.min(...H.ranuras.map(r => Math.hypot(r.x, r.y - y)));
    if (d > mejor.r) mejor = { y, r: d };
  }
  return (NV_EMBLEMA_SITIO[clave] = { y: mejor.y, r: Math.max(10, Math.min(18, mejor.r - 12)) });
}
function nvPintaEmblema(c, S, H, k) {
  const fac = S.lleva && nvFacDe(S.lleva.emblema);
  if (!fac || !NV_ICONOS.faccion[fac]) return;
  const p = nvSitioEmblema(H, S.casco + k);
  c.save(); c.translate(-p.r, p.y - p.r); c.scale(p.r / 32, p.r / 32); NV_ICONOS.faccion[fac](c, NV_FAC_COLOR[fac]); c.restore();
}

// ---------- estela: lo que suelta el motor, encima de la llama de siempre ----------
const NV_ESTELA_VIDA = 0.9;
const NV_ESTELAS = {
  animales: (c, col, i) => { c.fillStyle = col; c.beginPath(); c.ellipse(0, 3, 5, 4, 0, 0, 6.283); c.fill(); for (const x of [-5, 0, 5]) { c.beginPath(); c.arc(x, -4 - (x ? 0 : 2), 2.2, 0, 6.283); c.fill(); } },
  nomuertos: (c, col) => { c.fillStyle = 'rgba(220,255,240,.85)'; c.beginPath(); c.arc(0, -2, 6, Math.PI, 0); c.lineTo(6, 6); c.lineTo(3, 4); c.lineTo(0, 6); c.lineTo(-3, 4); c.lineTo(-6, 6); c.closePath(); c.fill(); c.fillStyle = NV_TINTA; c.fillRect(-3, -3, 2, 2); c.fillRect(1, -3, 2, 2); },
  streamers: (c, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 5); c.bezierCurveTo(-9, -1, -5, -8, 0, -3); c.bezierCurveTo(5, -8, 9, -1, 0, 5); c.fill(); },
  heroes: (c, col) => { c.fillStyle = col; c.beginPath(); nvIcEstrella(0, 0, 7, 2, 4).forEach((p, j) => c[j ? 'lineTo' : 'moveTo'](p[0], p[1])); c.fill(); },
  ciber: (c, col, i) => { if (i % 3 === 0) return; c.fillStyle = col; c.fillRect(-1.5, -7, 3, 14); },
  memes: (c, col, i) => { c.fillStyle = [col, '#ff4fd8', '#22e3ff', '#fff'][i % 4]; c.fillRect(-3.5, -3.5, 7, 7); },
  gamer: (c, col, i, S) => { c.fillStyle = 'hsl(' + Math.round((S.t * 240 + i * 20) % 360) + ',95%,60%)'; c.beginPath(); c.arc(0, 0, 4.5, 0, 6.283); c.fill(); },
  olvidados: (c, col, i) => { if (i % 3) { c.fillStyle = 'rgba(180,160,130,.7)'; c.beginPath(); c.arc(0, 0, 4, 0, 6.283); c.fill(); return; } c.beginPath(); for (let j = 0; j < 6; j++) c[j ? 'lineTo' : 'moveTo'](Math.cos(j * 1.047) * 5, Math.sin(j * 1.047) * 5); c.closePath(); c.fillStyle = '#9aa0b0'; c.fill(); c.fillStyle = NV_TINTA; c.beginPath(); c.arc(0, 0, 1.8, 0, 6.283); c.fill(); },
  pop: (c, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(-2, 4, 3.5, 2.6, -0.4, 0, 6.283); c.fill(); c.fillRect(0.5, -7, 1.8, 11); c.fillRect(0.5, -7, 5, 2); }
};
// Suelta partículas detrás del motor (más cuanto más rápido vas) y pinta las vivas; las viejas se van apagando
function nvDibujaEstela(c, S, H, r) {
  const fac = S.lleva && nvFacDe(S.lleva.estela), n = S.nave, P = S.estelaP;
  if (!fac || !P) return;
  const v = Math.hypot(n.vx, n.vy), cada = v > 40 ? 0.07 : 0.2;
  if (S.estado === 'juego' && S.t - (S.estelaT || 0) >= cada) {
    S.estelaT = S.t; S.estelaN = (S.estelaN || 0) + 1;
    const y = (H.motor.y + r * 3) * n.escala, lado = (nvRuido(S.estelaN) - 0.5) * r * 2 * n.escala;
    P.push({ x: n.x - Math.sin(n.ang) * y + Math.cos(n.ang) * lado, y: n.y + Math.cos(n.ang) * y + Math.sin(n.ang) * lado, t0: S.t, i: S.estelaN, giro: (nvRuido(S.estelaN + 9) - 0.5) * 1.2 });
  }
  while (P.length && S.t - P[0].t0 > NV_ESTELA_VIDA) P.shift();
  const dibuja = NV_ESTELAS[fac], col = NV_FAC_COLOR[fac], tam = 4 * n.escala;
  c.save();
  for (const p of P) {
    const k = (S.t - p.t0) / NV_ESTELA_VIDA;
    c.globalAlpha = 1 - k; c.save(); c.translate(p.x, p.y); c.rotate(n.ang + p.giro); c.scale(tam * (1 + 0.4 * k), tam * (1 + 0.4 * k)); dibuja(c, col, p.i, S); c.restore();
  }
  c.restore();
}
