// Fans of Nova · Dibujo de la partida: fondo de estrellas, nave por piezas (arte/ + placas y armas pintadas en código), enemigos y efectos.
// Las piezas se colocan con los anclajes de datos-piezas.js: pivote de la pieza = anclaje (ver docs/nova/naves-modulares.md).
'use strict';
const NVA = { img: {}, meta: {}, listo: false, base: 'arte/' };   // piezas del arte final (cambiar base a 'bocetos/piezas/' usa el placeholder)
// Motor por rango: simple → doble → triple, y de tamaño S/M hasta el máximo de ese casco (tamMax de datos-piezas.js).
function nvMotorRango(casco, rango) {
  const L = NOVA_PIEZAS.cascos[casco].motor.tamMax === 'L';
  return [['simple', L ? 'M' : 'S'], ['simple', 'M'], ['doble', L ? 'L' : 'M'], ['doble', L ? 'L' : 'M'], ['triple', L ? 'L' : 'M']][Math.min(5, rango) - 1];
}

function nvCargaArte(listo) {
  fetch(NVA.base + 'piezas.json').then(r => r.json()).then(d => {
    let falta = d.piezas.length;
    for (const p of d.piezas) {
      NVA.meta[p.id] = p;
      const im = new Image();
      im.onload = im.onerror = () => { if (--falta === 0) { NVA.listo = true; listo && listo(); } };
      im.src = NVA.base + p.archivo; NVA.img[p.id] = im;
    }
  }).catch(() => { NVA.listo = true; listo && listo(); });
}
// Una pieza con su pivote sobre el anclaje (ax, ay), en unidades de nave (los PNG de muestra miden 2 px por unidad).
function nvPieza(c, id, ax, ay) {
  const m = NVA.meta[id], im = NVA.img[id];
  if (!m || !im || !im.complete || !im.naturalWidth) return;
  c.drawImage(im, ax - m.pivote[0] / 2, ay - m.pivote[1] / 2, m.ancho / 2, m.alto / 2);
}

// ---------- fondo ----------
const NV_ESTRELLAS = (() => { const l = []; let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 160; i++) l.push({ x: r(), y: r(), z: 0.2 + r() * 0.8, t: 0.6 + r() * 1.4 }); return l; })();
const NV_NUBES = [{ x: .1, y: .2, r: .55, c: 'rgba(70,40,140,.28)' }, { x: .6, y: .7, r: .65, c: 'rgba(20,90,140,.24)' }, { x: .85, y: .15, r: .4, c: 'rgba(140,40,90,.2)' }, { x: .35, y: .9, r: .5, c: 'rgba(40,60,150,.22)' }];
function nvFondo(c, S, W, H, vs) {
  c.fillStyle = '#070d1f'; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H * 0.3, 10, W / 2, H * 0.3, H * 0.9); g.addColorStop(0, '#16275a'); g.addColorStop(1, '#070d1f00'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (const b of NV_NUBES) {   // nubes lejanas: se mueven poco, dan fondo
    const x = (((b.x * W * 1.6 - S.cam.x * vs * 0.06) % (W * 1.6)) + W * 1.6) % (W * 1.6) - W * 0.3, y = (((b.y * H * 1.6 - S.cam.y * vs * 0.06) % (H * 1.6)) + H * 1.6) % (H * 1.6) - H * 0.3, rr = b.r * W;
    const gn = c.createRadialGradient(x, y, 0, x, y, rr); gn.addColorStop(0, b.c); gn.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gn; c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  for (const e of NV_ESTRELLAS) {
    const x = (((e.x * W - S.cam.x * vs * e.z * 0.35) % W) + W) % W, y = (((e.y * H - S.cam.y * vs * e.z * 0.35) % H) + H) % H;
    c.fillStyle = 'rgba(255,255,255,' + (0.25 + e.z * 0.6) + ')'; c.fillRect(x, y, e.t * e.z * 1.6, e.t * e.z * 1.6);
  }
}

// ---------- nave ----------
function nvLlama(c, x, y, r, t, rango) {
  const l = (18 + 7 * rango) * (0.8 + 0.2 * Math.sin(t * 40 + x)), g = c.createLinearGradient(0, y, 0, y + l);
  g.addColorStop(0, '#fff6c2'); g.addColorStop(0.35, '#ffb347'); g.addColorStop(1, '#ff5a1f00');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - r * 0.8, y); c.quadraticCurveTo(x, y + l * 1.2, x + r * 0.8, y); c.closePath(); c.fill();
}
function nvPlaca(c, x, y, r) {
  c.beginPath(); c.arc(x, y, r + 3, 0, 6.283); c.fillStyle = '#2a2f5e'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#1a0f2e'; c.stroke();
  c.beginPath(); c.arc(x, y, (r + 3) * 0.62, 0, 6.283); c.fillStyle = '#12142c'; c.fill();
}
function nvTorreta(c, w, r, rot) {
  const col = NOVA_ARMAS.cargas[w.carga].color, p = w.portador;
  c.save(); c.rotate(rot);
  c.lineWidth = 2; c.strokeStyle = '#1a0f2e'; c.fillStyle = '#aab0e0';
  if (p === 'railgun') { c.fillRect(-r * 0.18, -r * 2.1, r * 0.36, r * 1.8); c.strokeRect(-r * 0.18, -r * 2.1, r * 0.36, r * 1.8); }
  else if (p === 'flak') { for (const s of [-1, 1]) { c.fillRect(s * r * 0.45 - r * 0.2, -r * 1.35, r * 0.4, r * 1.1); c.strokeRect(s * r * 0.45 - r * 0.2, -r * 1.35, r * 0.4, r * 1.1); } }
  else if (p === 'lanzador') { for (const s of [-1, 1]) { c.beginPath(); c.arc(s * r * 0.5, -r * 0.5, r * 0.4, 0, 6.283); c.fill(); c.stroke(); } }
  else if (p === 'laser') { c.fillRect(-r * 0.12, -r * 1.6, r * 0.24, r * 1.3); c.strokeRect(-r * 0.12, -r * 1.6, r * 0.24, r * 1.3); }
  c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fillStyle = '#7b82c8'; c.fill(); c.stroke();
  c.beginPath(); c.arc(0, 0, r * 0.45, 0, 6.283); c.fillStyle = col; c.fill();
  c.restore();
}
function nvDibujaNave(c, S) {
  const n = S.nave, e = n.escala, H = NOVA_PIEZAS.cascos[S.casco], [tm, tam] = nvMotorRango(S.casco, n.rango), r = NOVA_PIEZAS.radioTobera[tam];
  c.save(); c.translate(n.x + 14 * e, n.y + 20 * e); c.rotate(n.ang); c.scale(e, e); c.globalAlpha = 0.28; c.filter = 'brightness(0)';   // sombra proyectada: da altura sobre el fondo
  nvPieza(c, S.casco + '-alas', H.alas.x, H.alas.y); nvPieza(c, S.casco + '-casco', 0, 0);
  c.restore();
  c.save(); c.translate(n.x, n.y); c.rotate(n.ang); c.scale(e, e);
  const xs = { simple: [0], doble: [-(r + 1.5), r + 1.5], triple: [-(2 * r + 3), 0, 2 * r + 3] }[tm];
  for (const x of xs) nvLlama(c, H.motor.x + x, H.motor.y + r * 1.9, r, S.t, n.rango);
  nvPieza(c, S.casco + '-alas', H.alas.x, H.alas.y);
  nvPieza(c, 'motor-' + tm + '-' + tam, H.motor.x, H.motor.y);
  nvPieza(c, S.casco + '-casco', 0, 0);
  const abiertas = nvRanuras(n.rango, S);
  for (const sl of abiertas) {
    const rr = NOVA_PIEZAS.radioRanura[sl.tam];
    nvPlaca(c, sl.x, sl.y, rr);
    const w = n.armas.find(a => a.slot === sl.id);
    if (!w) continue;
    if (w.portador === 'defensa') { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * 1.047 - 1.57; c[k ? 'lineTo' : 'moveTo'](sl.x + Math.cos(a) * rr, sl.y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = w.carga === 'energia' ? '#4aa8ff' : '#ff9a3c'; c.fill(); c.stroke(); continue; }
    c.save(); c.translate(sl.x, sl.y); nvTorreta(c, w, rr, (w.ang || 0) - n.ang + 1.5708); c.restore();
  }
  if (n.golpeado > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5; nvPieza(c, S.casco + '-casco', 0, 0); }
  c.restore();
  // escudo del jugador: una pompa que se apaga al caer
  if (n.esc && n.esc.hp > 0 && H.escudo) { c.save(); c.translate(n.x, n.y); c.rotate(n.ang); c.scale(e, e); c.globalAlpha = 0.35 + 0.65 * n.esc.hp / n.esc.cap; nvPieza(c, S.casco + '-escudo', H.escudo.x, H.escudo.y); c.restore(); }
  else if (n.esc && n.esc.hp > 0) { const R = 118 * e; c.beginPath(); c.arc(n.x, n.y, R, 0, 6.283); c.fillStyle = 'rgba(74,168,255,' + 0.10 * n.esc.hp / n.esc.cap + ')'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(160,220,255,' + (0.25 + 0.5 * n.esc.hp / n.esc.cap) + ')'; c.stroke(); }
  // drones orbitando
  for (const w of n.armas) if (w.drones) for (const d of w.drones) { c.beginPath(); c.arc(d.x, d.y, 7, 0, 6.283); c.fillStyle = NOVA_ARMAS.cargas[w.carga].color; c.fill(); c.lineWidth = 2; c.strokeStyle = '#1a0f2e'; c.stroke(); }
}

// ---------- enemigos, disparos y efectos ----------
function nvDibujaEnemigo(c, e, S) {
  const d = e.d, r = e.r;
  c.save(); c.translate(e.x, e.y);
  if (e.est.sobrecalentado > 0 || e.calor > 40) { c.beginPath(); c.arc(0, 0, r + 5, 0, 6.283); c.fillStyle = 'rgba(255,75,75,' + Math.min(0.5, e.calor / 200 + 0.1) + ')'; c.fill(); }
  c.lineWidth = 2.5; c.strokeStyle = '#1a0f2e'; c.fillStyle = e.flash > 0 ? '#ffffff' : d.color;
  if (e.tipo === 'asteroide') {   // roca irregular
    c.rotate(e.ang); c.beginPath();
    for (let k = 0; k < 9; k++) { const a = k * 0.698, q = r * (0.78 + 0.28 * Math.sin(k * 2.3 + e.forma * 9)); c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * q, Math.sin(a) * q); }
    c.closePath(); c.fillStyle = e.flash > 0 ? '#fff' : '#7b7f9c'; c.fill(); c.stroke();
    c.fillStyle = 'rgba(30,25,60,.45)'; c.beginPath(); c.arc(-r * 0.25, -r * 0.1, r * 0.22, 0, 6.283); c.arc(r * 0.3, r * 0.25, r * 0.15, 0, 6.283); c.fill();
  } else if (e.tipo === 'nido') {   // nido de huesos que late
    const lat = 1 + 0.05 * Math.sin(S.t * 5 + e.fase);
    c.scale(lat, lat); c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fillStyle = e.flash > 0 ? '#fff' : '#3d7a3a'; c.fill(); c.stroke();
    c.fillStyle = '#d8e6c8'; for (let k = 0; k < 6; k++) { const a = k * 1.047 + e.fase; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); c.lineTo(Math.cos(a + 0.18) * r * 1.2, Math.sin(a + 0.18) * r * 1.2); c.lineTo(Math.cos(a - 0.18) * r * 1.2, Math.sin(a - 0.18) * r * 1.2); c.fill(); c.stroke(); }
    c.fillStyle = '#9bff8a'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, 6.283); c.fill(); c.stroke();
  } else if (e.tipo === 'rastrero') {   // cráneo con patas
    c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); c.stroke();
    c.fillStyle = '#1a0f2e'; c.beginPath(); c.arc(-r * 0.35, -r * 0.1, r * 0.22, 0, 6.283); c.arc(r * 0.35, -r * 0.1, r * 0.22, 0, 6.283); c.fill();
  } else if (e.tipo === 'fusilero') {   // nave de huesos en flecha
    const a = Math.atan2(S.nave.y - e.y, S.nave.x - e.x) + 1.5708; c.rotate(a);
    c.beginPath(); c.moveTo(0, -r * 1.2); c.lineTo(r, r); c.lineTo(0, r * 0.5); c.lineTo(-r, r); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#1a0f2e'; c.fillRect(-r * 0.3, -r * 0.2, r * 0.6, r * 0.3);
  } else {   // sepulturero y jefe: lápida / corona de huesos
    c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * 0.785 + 0.39; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#1a0f2e'; c.beginPath(); c.arc(-r * 0.3, -r * 0.1, r * 0.2, 0, 6.283); c.arc(r * 0.3, -r * 0.1, r * 0.2, 0, 6.283); c.fill();
    if (d.capitan) { c.fillStyle = '#ffd93d'; c.font = '800 ' + r * 0.7 + 'px Baloo 2, sans-serif'; c.textAlign = 'center'; c.fillText(String(e.rango), 0, r * 0.62); }
    if (d.jefe) { c.fillStyle = '#ffd93d'; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * r * 0.3 - 6, -r * 0.95); c.lineTo(k * r * 0.3, -r * 1.3); c.lineTo(k * r * 0.3 + 6, -r * 0.95); c.fill(); } }
  }
  if (!d.pasivo && !d.nido && !d.jefe) {   // anillo de peligro según su rango frente al tuyo: rojo = huye, naranja = cuidado, amarillo = igual, verde = presa
    const df = e.rango - S.nave.rango, col = df >= 2 ? '#ff3b3b' : df === 1 ? '#ff9a3c' : df === 0 ? '#ffe066' : '#6bff8a';
    c.beginPath(); c.arc(0, 0, r + 4, 0, 6.283); c.lineWidth = df >= 2 ? 4 : 2.5; c.strokeStyle = col; c.globalAlpha = df >= 2 ? 0.55 + 0.4 * Math.sin(S.t * 8) : 0.75; c.stroke(); c.globalAlpha = 1;
    if (!d.capitan) { c.fillStyle = col; c.font = '800 ' + Math.max(11, r * 0.5) + 'px Baloo 2, sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#1a0f2e'; c.strokeText(String(e.rango), 0, -r - 8); c.fillText(String(e.rango), 0, -r - 8); }
  }
  if (e.esc > 0 && !(e.est.escudoCaido > 0)) { c.beginPath(); c.arc(0, 0, r + 6, 0, 6.283); c.lineWidth = 3; c.strokeStyle = 'rgba(120,190,255,' + (0.3 + 0.6 * e.esc / e.escMax) + ')'; c.stroke(); }
  if (e.est.brecha > 0) { c.strokeStyle = '#ff9a3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(-r * 0.5, -r * 0.6); c.lineTo(0, 0); c.lineTo(r * 0.4, r * 0.5); c.stroke(); }
  if (e.est.marcado > 0) { c.strokeStyle = '#ffd93d'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r + 9, 0, 6.283); c.moveTo(-r - 14, 0); c.lineTo(r + 14, 0); c.moveTo(0, -r - 14); c.lineTo(0, r + 14); c.stroke(); }
  if (e.est.apagado > 0) { c.fillStyle = 'rgba(180,107,255,.45)'; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); }
  if (d.capitan) { c.fillStyle = '#fff'; c.font = '800 13px Baloo 2, sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeText(tr(d.nombre) + ' ' + e.rango, 0, -r - 20); c.fillText(tr(d.nombre) + ' ' + e.rango, 0, -r - 20); }
  if (e.hp < e.hpMax || d.jefe || d.capitan) { c.fillStyle = '#1a0f2e'; c.fillRect(-r, -r - 12, 2 * r, 5); c.fillStyle = d.jefe ? '#ff4b9a' : '#ff6b6b'; c.fillRect(-r, -r - 12, 2 * r * Math.max(0, e.hp / e.hpMax), 5); }
  c.restore();
}
function nvFormaCarga(c, forma, x, y, r) {
  c.beginPath();
  if (forma === 'cuadrado') c.rect(x - r, y - r, 2 * r, 2 * r);
  else if (forma === 'rombo') { c.moveTo(x, y - r * 1.3); c.lineTo(x + r * 1.3, y); c.lineTo(x, y + r * 1.3); c.lineTo(x - r * 1.3, y); c.closePath(); }
  else if (forma === 'estrella') { for (let k = 0; k < 8; k++) { const a = k * 0.785, rr = k % 2 ? r * 0.7 : r * 1.5; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
  else if (forma === 'rayo') { c.moveTo(x - r, y - r * 1.2); c.lineTo(x + r * 0.2, y - r * 0.1); c.lineTo(x - r * 0.2, y + r * 0.1); c.lineTo(x + r, y + r * 1.2); c.lineTo(x - r * 0.1, y + r * 0.2); c.lineTo(x + r * 0.3, y - r * 0.2); c.closePath(); }
  else c.arc(x, y, r, 0, 6.283);
  c.fill();
}
function nvDibujaEstacion(c, st, t) {
  c.save(); c.translate(st.x, st.y);
  c.lineWidth = 4; c.strokeStyle = '#1a0f2e';
  c.rotate(t * 0.15); c.fillStyle = '#5a6bb8';
  for (let k = 0; k < 4; k++) { c.rotate(1.5708); c.fillRect(-9, 30, 18, 62); c.strokeRect(-9, 30, 18, 62); c.fillStyle = '#9fb3ff'; c.fillRect(-18, 84, 36, 14); c.strokeRect(-18, 84, 36, 14); c.fillStyle = '#5a6bb8'; }
  c.rotate(-t * 0.15);
  c.beginPath(); c.arc(0, 0, 34, 0, 6.283); c.fillStyle = '#c8d2ff'; c.fill(); c.stroke();
  c.beginPath(); c.arc(0, 0, 16, 0, 6.283); c.fillStyle = st.cd > 0 ? '#5a6bb8' : '#6fe3ff'; c.fill(); c.stroke();
  c.restore();
}
function nvDibujaPecio(c, p, t) {
  c.save(); c.translate(p.x, p.y); c.rotate(p.ang + Math.sin(t) * 0.1);
  c.lineWidth = 3; c.strokeStyle = '#1a0f2e'; c.fillStyle = p.rara ? '#ffd93d' : '#6f7fb8';
  c.beginPath(); c.moveTo(0, -p.r); c.lineTo(p.r * 0.7, p.r * 0.2); c.lineTo(p.r * 0.2, p.r * 0.8); c.lineTo(-p.r * 0.5, p.r * 0.5); c.lineTo(-p.r * 0.8, -p.r * 0.1); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(0, 0, p.r * 0.28, 0, 6.283); c.fillStyle = p.rara ? '#fff6c2' : '#6fe3ff'; c.fill();
  c.restore();
}
function nvDibujaMundo(c, S) {
  const n = S.nave, cx = S.cam.x, cy = S.cam.y, V = nvVista(S) * 0.75;
  for (const b of S.nebulosas) { if (Math.abs(b.x - cx) > b.r + V || Math.abs(b.y - cy) > b.r + V) continue; const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r); g.addColorStop(0, b.col + '55'); g.addColorStop(1, b.col + '00'); c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.283); c.fill(); }
  const cerca = o => Math.abs(o.x - cx) < V && Math.abs(o.y - cy) < V * 1.6;
  for (const st of S.estaciones) if (cerca(st)) nvDibujaEstacion(c, st, S.t);
  for (const p of S.pecios) if (cerca(p)) nvDibujaPecio(c, p, S.t * 2);
  c.beginPath(); c.arc(0, 0, NV_ARENA, 0, 6.283); c.lineWidth = 10; c.strokeStyle = 'rgba(120,160,255,.35)'; c.stroke();
  for (const r of S.restos) {   // restos de nave: chapas retorcidas con el borde dorado
    const q = 5 + Math.min(10, r.v * 0.6);
    c.save(); c.translate(r.x, r.y); c.rotate(r.ang + r.t * 0.8); c.lineWidth = 2; c.strokeStyle = '#ffd93d'; c.fillStyle = '#6b7090';
    c.beginPath(); c.moveTo(-q, -q * 0.4); c.lineTo(q * 0.2, -q); c.lineTo(q, q * 0.3); c.lineTo(-q * 0.3, q * 0.8); c.closePath(); c.fill(); c.stroke(); c.restore();
  }
  for (const e of S.enem) if (cerca(e)) nvDibujaEnemigo(c, e, S);
  for (const b of S.eproy) { c.fillStyle = '#ff6bd6'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.283); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#fff'; c.stroke(); }
  nvDibujaNave(c, S);
  for (const w of n.armas) if (w.rayo > 0) { c.strokeStyle = NOVA_ARMAS.cargas[w.carga].color; c.lineWidth = 3 + w.rayo * 20; c.beginPath(); c.moveTo(w.x, w.y); c.lineTo(w.rx, w.ry); c.stroke(); }
  for (const b of S.proy) {
    c.fillStyle = b.color; c.strokeStyle = '#1a0f2e'; c.lineWidth = 1;
    if (b.w.portador === 'railgun') { c.save(); c.translate(b.x, b.y); c.rotate(Math.atan2(b.vy, b.vx)); c.fillRect(-14, -2.5, 28, 5); c.restore(); }
    else nvFormaCarga(c, b.forma, b.x, b.y, b.r);
  }
  for (const f of S.fx) { c.beginPath(); c.arc(f.x, f.y, f.r * (1.4 - f.t * 2), 0, 6.283); c.lineWidth = 4; c.strokeStyle = f.color; c.globalAlpha = Math.max(0, f.t * 2.4); c.stroke(); c.globalAlpha = 1; }
  for (const p of S.parts) { c.globalAlpha = Math.max(0, p.t * 2); c.fillStyle = p.color; c.fillRect(p.x - 2, p.y - 2, 4, 4); c.globalAlpha = 1; }
  c.textAlign = 'center';
  for (const t of S.nums) { c.globalAlpha = Math.min(1, t.t * 2); c.font = (t.g ? '800 20px' : '700 14px') + ' Baloo 2, sans-serif'; c.lineWidth = 4; c.strokeStyle = '#1a0f2e'; c.strokeText(t.txt, t.x, t.y); c.fillStyle = t.color; c.fillText(t.txt, t.x, t.y); c.globalAlpha = 1; }
}

// ---------- fotograma completo ----------
function nvDibuja(S) {
  const cv = document.getElementById('nv-canvas');
  if (!cv) return;
  const W = cv.width, H = cv.height, vs = W / nvVista(S), c = cv.getContext('2d');
  nvFondo(c, S, W, H, vs);
  c.save(); c.translate(W / 2, H / 2); c.scale(vs, vs); c.translate(-S.cam.x, -S.cam.y);
  nvDibujaMundo(c, S);
  c.restore();
  nvHud(c, S, W, H, vs);
}
