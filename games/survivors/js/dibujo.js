// Fans of Survivors · El dibujo de la partida: el suelo, los personajes (los dibujos de core), las armas, los efectos y el marcador.
'use strict';

let ctx = null, ESCALA = 1, DPR = 1, PAT = null;   // el lienzo, cuánto se agranda la pantalla de 540 x 960 y el dibujo del suelo
const VW = 540, VH = 960;

/* ---------- el suelo: hierba de Animales Locos, con cosas sueltas por el campo ---------- */
function hacerSuelo() {
  const K = Math.min(2, ESCALA * DPR), S = 256, c = document.createElement('canvas'); c.width = c.height = Math.round(S * K);
  const x = c.getContext('2d'); x.scale(K, K);
  const T = THEMES.animales, rnd = mulberry32(7);
  x.fillStyle = T.grad[1]; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 26; i++) { x.fillStyle = T.greens[(rnd() * 5) | 0]; x.globalAlpha = 0.22; const px = rnd() * S, py = rnd() * S, r = 18 + rnd() * 34; for (const [ox, oy] of [[0, 0], [S, 0], [-S, 0], [0, S], [0, -S]]) { x.beginPath(); x.ellipse(px + ox, py + oy, r, r * 0.6, 0, 0, Math.PI * 2); x.fill(); } }
  x.globalAlpha = 1;
  for (let i = 0; i < 70; i++) {   // matas de hierba
    const px = rnd() * S, py = rnd() * S; x.strokeStyle = T.greens[(rnd() * 5) | 0]; x.lineWidth = 1.6; x.lineCap = 'round';
    x.beginPath(); x.moveTo(px, py); x.lineTo(px - 2, py - 6); x.moveTo(px, py); x.lineTo(px + 1, py - 7); x.moveTo(px, py); x.lineTo(px + 3, py - 5); x.stroke();
  }
  for (let i = 0; i < 6; i++) { const px = rnd() * S, py = rnd() * S; dot(x, px, py, 2.4, pick(['#fff6ea', '#ffcb3d', '#ff8fd8'])); dot(x, px, py, 0.9, '#ffb347'); }
  PAT = { c, K };
}
// cosas grandes repartidas por el campo, siempre en el mismo sitio (piedras, setas, cajas de Microblizz…)
function cosaEn(ix, iy) {
  const h = Math.abs(Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453) % 1;
  if (h > 0.34) return null;
  return { x: ix * 180 + 40 + ((h * 997) % 1) * 100, y: iy * 180 + 40 + ((h * 7919) % 1) * 100, t: Math.floor(h * 1000) % 5 };
}
function dibujaCosa(o, golpe) {
  const c = ctx; c.save(); c.translate(o.x, o.y); c.lineJoin = 'round'; if (golpe) c.rotate(Math.sin(P.t * 60) * 0.06);
  c.globalAlpha = 0.25; c.fillStyle = '#140a1e'; c.beginPath(); c.ellipse(0, 2, 20, 7, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  if (o.t === 0) { shape(c, el(0, -8, 18, 12), '#9aa3b5'); shape(c, el(-5, -12, 6, 3.5), '#c8cfdc', 0); }   // piedra
  else if (o.t === 1) { shape(c, rr(-3, -14, 6, 14, 2), '#fff6ea'); shape(c, el(0, -15, 13, 8), THEMES.animales.cap); dot(c, -5, -17, 2.2, '#fff'); dot(c, 4, -14, 1.8, '#fff'); }   // seta
  else if (o.t === 2) { shape(c, rr(-16, -24, 32, 24, 3), '#c99a5b'); line(c, [-16, -14, 16, -14], OL, 1.6); c.fillStyle = '#2e8bff'; c.font = '7px ' + FONT_D; c.textAlign = 'center'; c.fillText('MICROBLIZZ', 0, -5); }   // caja de la mudanza
  else if (o.t === 3) { shape(c, el(-8, -10, 12, 10), THEMES.animales.hedge[0]); shape(c, el(8, -12, 13, 12), THEMES.animales.hedge[1]); shape(c, el(0, -18, 10, 9), '#6fbf4a'); }   // arbusto
  else { c.rotate(0.3); shape(c, rr(-12, -8, 24, 16, 1), '#fff'); line(c, [-8, -3, 8, -3], '#9aa3b5', 1.2); line(c, [-8, 2, 5, 2], '#9aa3b5', 1.2); c.rotate(-0.3); c.fillStyle = '#ff4b5c'; c.font = '6px ' + FONT_D; c.textAlign = 'center'; c.fillText(tr('DESPEDIDO'), 0, -10); }   // carta de despido
  c.restore();
}

/* ---------- dibujar un personaje de core ---------- */
function pies(key, r, walk, andando, esc) {
  const T = TYPES[key]; if (!T || !T.foot) return;
  const l = andando ? Math.sin(walk) * 2.2 : 0;
  for (const [fx, up] of [[-0.4, Math.max(0, l)], [0.4, Math.max(0, -l)]]) { ctx.beginPath(); ctx.ellipse(fx * r, -1 - up, r * 0.3, r * 0.19, 0, 0, Math.PI * 2); ctx.fillStyle = T.foot; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OL; ctx.stroke(); }
  void esc;
}
// o: { x, y, z, esc, face, walk, andando, blanco (0-1), alfa, ang, gris }
function personaje(key, o) {
  const s = SPR[key]; if (!s) return;
  const esc = o.esc || 1, T = TYPES[key] || {}, r = (CFG.units[key] || { r: 12 }).r;
  let sx = 1, sy = 1, z = o.z || 0, ang = o.ang || 0;
  if (o.andando) { z += Math.abs(Math.sin(o.walk)) * 2.4; const w = Math.sin(o.walk * 2); sy = 1 + w * 0.035; sx = 1 - w * 0.03; ang += 0.05 + Math.sin(o.walk) * 0.06; }
  if (T.hover) z += 4 + Math.sin((o.walk || 0) * 0.7) * 1.5;
  // sombra
  ctx.globalAlpha = 0.28 * (o.alfa ?? 1); ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(o.x, o.y + 1, r * 1.05 * esc, r * 0.42 * esc, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.globalAlpha = o.alfa ?? 1; ctx.translate(o.x, o.y - z); if (ang) ctx.rotate(ang * (o.face || 1)); ctx.scale((o.face || 1) * sx * esc, sy * esc);
  if (T.jet) { const fl = 4 + Math.random() * 3; ctx.fillStyle = 'rgba(120,230,255,.85)'; ctx.beginPath(); ctx.moveTo(-3.5, -6); ctx.lineTo(3.5, -6); ctx.lineTo(0, -4 + fl); ctx.closePath(); ctx.fill(); }
  ctx.drawImage(o.gris && s.g ? s.g : o.rojo ? rojoDe(key) : o.dorado ? doradoDe(key) : s.c, -s.ax, -s.ay, s.wd, s.ht);
  pies(key, r, o.walk || 0, o.andando, esc);
  if (o.blanco > 0) { ctx.globalAlpha = (o.alfa ?? 1) * o.blanco; ctx.drawImage(s.w, -s.ax, -s.ay, s.wd, s.ht); }
  ctx.restore(); ctx.globalAlpha = 1;
}
// el tinte rojo de los jefes y los élite (como las facciones corrompidas del Rumble)
const ROJOS = {};
function rojoDe(key) {
  if (ROJOS[key]) return ROJOS[key];
  const sp = SPR[key], c = document.createElement('canvas'); c.width = sp.c.width; c.height = sp.c.height;
  const x = c.getContext('2d'); x.drawImage(sp.c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(150,0,40,.38)'; x.fillRect(0, 0, c.width, c.height);
  return (ROJOS[key] = c);
}

/* ---------- la escena ---------- */
function dibujar() {
  const c = ctx; if (!c || !P) return;
  c.setTransform(ESCALA * DPR, 0, 0, ESCALA * DPR, 0, 0);
  const sh = P.sacudida > 0 && SAVE.shake !== false ? P.sacudida : 0;
  const ox = Math.round(VW / 2 - P.cam.x + rand(-sh, sh)), oy = Math.round(VH / 2 - P.cam.y + rand(-sh, sh));
  // el suelo
  if (!PAT) hacerSuelo();
  c.save(); c.translate(ox % 256 - 256, oy % 256 - 256); c.scale(1 / PAT.K, 1 / PAT.K);
  c.fillStyle = c.createPattern(PAT.c, 'repeat'); c.fillRect(0, 0, (VW + 512) * PAT.K, (VH + 512) * PAT.K); c.restore();
  c.save(); c.translate(ox, oy);
  const x0 = P.cam.x - VW / 2 - 60, x1 = P.cam.x + VW / 2 + 60, y0 = P.cam.y - VH / 2 - 60, y1 = P.cam.y + VH / 2 + 60;
  const ver = (x, y, m = 0) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m;
  // el aura de MeerCat y las marcas del jefe, pegadas al suelo
  const j = P.jug;
  if (P.armas.suricata) {
    const r = vArma('suricata').r, pul = 1 + Math.sin(P.t * 4) * 0.03;
    const g = c.createRadialGradient(j.x, j.y - 10, r * 0.2, j.x, j.y - 10, r * pul); g.addColorStop(0, 'rgba(255,240,170,0)'); g.addColorStop(0.8, 'rgba(255,230,140,.16)'); g.addColorStop(1, 'rgba(255,230,140,.32)');
    c.fillStyle = g; c.beginPath(); c.ellipse(j.x, j.y - 10, r * pul, r * pul * 0.85, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,240,170,.55)'; c.lineWidth = 2; c.setLineDash([6, 6]); c.lineDashOffset = -P.t * 20; c.stroke(); c.setLineDash([]);
  }
  dibujaSueloArmas(c);
  for (const m of P.marcas) {
    const k = 1 - m.t / m.max; c.globalAlpha = 0.3 + k * 0.5; c.fillStyle = 'rgba(125,211,252,.25)'; c.strokeStyle = '#7dd3fc'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(m.x, m.y, m.r, m.r * 0.8, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(m.x, m.y, m.r * k, m.r * 0.8 * k, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(125,211,252,.35)'; c.fill(); c.globalAlpha = 1;
  }
  // cosas del campo
  for (let ix = Math.floor(x0 / 180) - 1; ix <= Math.floor(x1 / 180); ix++) for (let iy = Math.floor(y0 / 180) - 1; iy <= Math.floor(y1 / 180); iy++) { const o = cosaEn(ix, iy); if (o && ver(o.x, o.y, 30) && !P.cajasRotas.has(ix + ',' + iy)) dibujaCosa(o, P.cajasGolpe.has(ix + ',' + iy)); }
  // cristales de CAOS, cafés, imanes y cofres
  for (const g of P.gemas) if (ver(g.x, g.y)) gema(g);
  for (const o of P.cosas) if (ver(o.x, o.y)) cosaSuelta(o);
  // los que van de pie, ordenados de arriba abajo
  const L = [];
  for (const e of P.enemigos) if (ver(e.x, e.y, 80 * e.escala)) L.push({ y: e.y, f: () => enemigo(e) });
  L.push({ y: j.y, f: jugador });
  armasPie(L);
  for (const p of P.proy) if (p.tipo === 'castor' || p.tipo === 'ardilla') L.push({ y: p.y, f: () => proyectil(p) });
  if (P.vacas) { const V = P.vacas; for (let i = 0; i < V.n; i++) { const a = V.a0 + V.t * V.giro + (i / V.n) * Math.PI * 2, x = j.x + Math.cos(a) * V.r, y = j.y - 10 + Math.sin(a) * V.r * 0.8; L.push({ y, f: () => personaje('vaca', { x, y, esc: 0.9, face: Math.cos(a + Math.PI / 2) > 0 ? 1 : -1, walk: P.t * 10, andando: true, alfa: Math.min(1, (V.dura - V.t) * 3) }) }); } }
  for (const f of P.efectos) if (f.tipo === 'zorro' || f.tipo === 'cuerpo') L.push({ y: f.y, f: () => efecto(f) });
  L.sort((a, b) => a.y - b.y); for (const o of L) o.f();
  // lo que vuela por encima
  for (const p of P.proy) if (p.tipo !== 'castor' && p.tipo !== 'ardilla' && p.gen !== 'corre') proyectil(p);
  for (const b of P.balas) { c.fillStyle = '#ff3348'; c.beginPath(); c.arc(b.x, b.y, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffd0d6'; c.beginPath(); c.arc(b.x, b.y, 2.2, 0, Math.PI * 2); c.fill(); }
  for (const f of P.efectos) if (f.tipo !== 'zorro' && f.tipo !== 'cuerpo') efecto(f);
  for (const p of P.parts) { c.globalAlpha = Math.max(0, 1 - p.t / p.max); c.fillStyle = p.col; c.fillRect(p.x - p.tam / 2, p.y - p.tam / 2, p.tam, p.tam); } c.globalAlpha = 1;
  if (SAVE.nums !== false) for (const n of P.numeros) { const k = n.t / 0.8; c.globalAlpha = 1 - k * k; otxt(c, n.v, n.x, n.y - k * 26, n.grande ? 20 : 14, n.col); } c.globalAlpha = 1;
  c.restore();
  marcador();
}

function gema(g) {
  const c = ctx, big = g.v >= 25, mid = g.v >= 5, s = big ? 9 : mid ? 7 : 5, col = big ? '#ff4b5c' : mid ? '#3fd0ff' : '#d43cff', y = g.y + Math.sin(P.t * 4 + g.x) * 1.5;
  c.beginPath(); c.moveTo(g.x, y - s * 1.4); c.lineTo(g.x + s, y); c.lineTo(g.x, y + s * 1.1); c.lineTo(g.x - s, y); c.closePath();
  c.fillStyle = col; c.fill(); c.lineWidth = 1.6; c.strokeStyle = OL; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.moveTo(g.x, y - s * 1.1); c.lineTo(g.x + s * 0.4, y - s * 0.2); c.lineTo(g.x, y); c.closePath(); c.fill();
}
function cosaSuelta(o) {
  const c = ctx, y = o.y - 8 + Math.sin(P.t * 3 + o.x) * 3;
  c.globalAlpha = 0.25; c.fillStyle = '#140a1e'; c.beginPath(); c.ellipse(o.x, o.y + 2, 14, 5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  if (o.tipo === 'cafe') { c.save(); c.translate(o.x, y); shape(c, rr(-8, -12, 16, 16, 3), '#fff6ea'); shape(c, el(10, -5, 4, 5), null); shape(c, el(0, -12, 7, 2.2), '#6b3a1e', 1.2); c.restore(); }
  else if (o.tipo === 'iman') { c.save(); c.translate(o.x, y - 6); c.lineWidth = 7; c.strokeStyle = OL; c.beginPath(); c.arc(0, 0, 9, Math.PI, 0); c.stroke(); c.lineWidth = 4.5; c.strokeStyle = '#ff4b5c'; c.stroke(); c.fillStyle = '#cdd6e6'; c.fillRect(-11, 0, 5, 5); c.fillRect(6, 0, 5, 5); c.restore(); }
  else if (o.tipo === 'cofre') {
    c.save(); c.translate(o.x, y); const b = 1 + Math.sin(P.t * 6) * 0.05; c.scale(b, b);
    c.globalAlpha = 0.5 + Math.sin(P.t * 5) * 0.2; c.fillStyle = '#ffcb3d'; c.beginPath(); c.arc(0, -10, 26, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    shape(c, rr(-16, -18, 32, 22, 4), '#c06a1a'); shape(c, rr(-17, -24, 34, 10, 4), '#e08a2a'); shape(c, rr(-4, -16, 8, 9, 2), '#ffcb3d'); c.restore();
  }
}
// el tinte dorado de los bichos shiny
const DORADOS = {};
function doradoDe(key) {
  if (DORADOS[key]) return DORADOS[key];
  const sp = SPR[key], c = document.createElement('canvas'); c.width = sp.c.width; c.height = sp.c.height;
  const x = c.getContext('2d'); x.drawImage(sp.c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,205,40,.6)'; x.fillRect(0, 0, c.width, c.height);
  return (DORADOS[key] = c);
}
function enemigo(e) {
  const c = ctx;
  if (e.shiny) {   // resplandor dorado y destellos
    c.globalAlpha = 0.4 + Math.sin(P.t * 7) * 0.15; c.fillStyle = '#ffd23c'; c.beginPath(); c.ellipse(e.x, e.y, e.r * 1.4, e.r * 0.6, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    otxt(c, '✦', e.x + Math.cos(P.t * 3 + e.id) * e.r, e.y - e.r * 1.6 + Math.sin(P.t * 5 + e.id) * 6, 14, '#fff3a0');
  }
  if (e.elite || e.jefe) {   // aura roja de los gordos
    c.globalAlpha = 0.35 + Math.sin(P.t * 5) * 0.12; c.fillStyle = '#ff3348'; c.beginPath(); c.ellipse(e.x, e.y, e.r * 1.25, e.r * 0.5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
  personaje(e.spr, { x: e.x, y: e.y, esc: e.escala * (e.jefe || e.elite ? 1 : 0.9), face: e.face, walk: e.walk + e.id, andando: e.congT <= 0, blanco: e.hitT / 0.12, rojo: e.elite || e.jefe, dorado: e.shiny });
  if ((e.elite && !e.jefe) && e.vida < e.vidaMax) barra(e.x, e.y + 8, 60, e.vida / e.vidaMax, '#ff4b5c');
  if (e.d.caduca && e.d.caduca - e.edad < 5) { c.globalAlpha = 0.9; otxt(c, Math.ceil(e.d.caduca - e.edad) + '', e.x, e.y - 50, 13, '#c4b5fd'); c.globalAlpha = 1; }
}
function jugador() {
  const j = P.jug, c = ctx, S = j.salto;
  let z = 0, ang = 0;
  if (S) { const k = S.t / S.dur; z = Math.sin(k * Math.PI) * 120; ang = k * Math.PI * 2; }
  if (j.muerto) { personaje(P.lider, { x: j.x, y: j.y, esc: 0.8, face: j.face, gris: true, alfa: Math.max(0, 1 - P.finT), ang: -1.2 }); return; }
  // el anillo dorado del líder
  c.globalAlpha = 0.9; c.strokeStyle = '#ffcb3d'; c.lineWidth = 2; c.setLineDash([5, 4]); c.lineDashOffset = -P.t * 16;
  c.beginPath(); c.ellipse(j.x, j.y + 1, 26, 11, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
  if (P.armas.suricata) { const b = Math.sin(P.t * 3) * 3; personaje('meercat', { x: j.x - j.face * 30, y: j.y - 6, z: 30 + b, esc: 0.55, face: j.face, alfa: 0.9 }); }
  const parp = j.invulT > 0 && Math.floor(P.t * 20) % 2 === 0;
  personaje(P.lider, { x: j.x, y: j.y, z, esc: 0.8, face: j.face, walk: j.walk, andando: j.andando && !S, blanco: j.golpeT / 0.2, alfa: parp ? 0.45 : 1, ang: S ? ang : 0 });
  if (j.congT > 0) { c.globalAlpha = 0.55; c.fillStyle = '#bfe9ff'; c.strokeStyle = '#7dd3fc'; c.lineWidth = 2; c.beginPath(); rrPath(c, j.x - 24, j.y - 58, 48, 60, 8); c.fill(); c.stroke(); c.globalAlpha = 1; }
  barra(j.x, j.y + 10, 46, j.vida / j.vidaMax, j.vida / j.vidaMax < 0.3 ? '#ff4b5c' : '#5fe05a');
}
function barra(x, y, w, k, col) {
  const c = ctx; c.fillStyle = OL; c.beginPath(); rrPath(c, x - w / 2 - 2, y - 2, w + 4, 9, 4); c.fill();
  c.fillStyle = '#3a2b52'; c.fillRect(x - w / 2, y, w, 5); c.fillStyle = col; c.fillRect(x - w / 2, y, w * clamp(k, 0, 1), 5);
}
function proyectil(p) {
  const c = ctx;
  if (p.gen) return proyectilGenDibuja(p);
  if (p.tipo === 'zanahoria') {
    c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(p.vy, p.vx));
    shape(c, poly(10, 0, -7, -4.5, -7, 4.5), '#ff8a1a', 1.6); line(c, [-7, -2, -12, -5], '#4fae3e', 2.2); line(c, [-7, 2, -12, 5], '#4fae3e', 2.2); c.restore();
  } else if (p.tipo === 'ardilla') {
    personaje('squirrel', { x: p.x, y: p.y, esc: 0.75, face: p.vx >= 0 ? 1 : -1, walk: p.walk, andando: true, alfa: Math.min(1, p.t * 5) });
  } else if (p.tipo === 'castor') {
    personaje('beaver', { x: p.x, y: p.y, esc: 0.8, face: p.face, walk: p.walk, andando: true });
    const r = 2 + Math.random() * 2; dot(c, p.x + p.face * 2.5, p.y - 19, r, '#ffd34d'); dot(c, p.x + p.face * 2.5, p.y - 19, r * 0.45, '#fff');
  } else if (p.tipo === 'bolsa') {
    c.globalAlpha = 0.25; c.fillStyle = '#140a1e'; c.beginPath(); c.ellipse(p.x, p.y, 9, 3.5, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    c.save(); c.translate(p.x, p.y - p.z - 8); c.rotate(p.k * 9); shape(c, el(0, 0, 9, 8), '#3b3d47'); line(c, [-3, -7, 0, -11, 3, -7], OL, 1.8); c.restore();
  }
}
function efecto(f) {
  const c = ctx, k = 1 - f.t / f.max;
  if (f.gen) return efectoGenDibuja(f);
  if (f.tipo === 'onda' || f.tipo === 'boom') {
    c.globalAlpha = (1 - k) * 0.85; c.strokeStyle = f.tipo === 'onda' ? '#fff6ea' : f.col; c.lineWidth = 6 * (1 - k) + 1;
    c.beginPath(); c.ellipse(f.x, f.y, f.r * (0.3 + k * 0.8), f.r * (0.3 + k * 0.8) * 0.75, 0, 0, Math.PI * 2); c.stroke();
    if (f.tipo === 'boom') { c.globalAlpha = (1 - k) * 0.6; c.fillStyle = f.col; c.beginPath(); c.arc(f.x, f.y - 8, f.r * 0.5 * (1 - k * 0.5), 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  } else if (f.tipo === 'zorro') {
    const a = k < 0.2 ? k / 0.2 : 1 - (k - 0.6) / 0.4;
    personaje('fox', { x: f.x, y: f.y, esc: 0.8, face: f.face, alfa: clamp(a, 0, 1) * 0.95, ang: k < 0.4 ? 0.3 : 0 });
    if (k < 0.5) { c.globalAlpha = 1 - k * 2; c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(f.x + f.face * 22, f.y - 22, 20, -1.2, 1.2); c.stroke(); c.globalAlpha = 1; }
  } else if (f.tipo === 'cuerpo') {
    personaje(f.spr, { x: f.x, y: f.y, esc: f.escala * 0.9 * (1 - k * 0.3), face: f.face, blanco: 1, alfa: 1 - k, z: k * 10 });
  } else if (f.tipo === 'curaE') {
    c.globalAlpha = (1 - k) * 0.6; c.strokeStyle = '#7dff7a'; c.lineWidth = 2; c.beginPath(); c.ellipse(f.x, f.y, f.r * k, f.r * k * 0.7, 0, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
  }
}

/* ---------- el marcador ---------- */
const ICONOS = {};
function iconoCarta(key, h) {
  const id = key + h; if (ICONOS[id]) return ICONOS[id];
  const K = Math.min(3, ESCALA * DPR * 1.5), c = document.createElement('canvas'); c.width = c.height = Math.round(h * K);
  const x = c.getContext('2d'); x.scale(K, K); drawVector(x, key, h / 2, h * 0.92, h * 0.82);
  return (ICONOS[id] = c);
}
function marcador() {
  const c = ctx;
  c.setTransform(ESCALA * DPR, 0, 0, ESCALA * DPR, 0, 0);
  // la barra de CAOS (experiencia)
  c.fillStyle = OL; c.fillRect(0, 0, VW, 22);
  const k = P.xp / P.xpSig, g = c.createLinearGradient(0, 0, VW, 0); g.addColorStop(0, '#7b22ff'); g.addColorStop(1, '#f3a6ff');
  c.fillStyle = '#2b1446'; c.fillRect(3, 3, VW - 6, 16); c.fillStyle = g; c.fillRect(3, 3, (VW - 6) * clamp(k, 0, 1), 16);
  otxt(c, tr('NIVEL') + ' ' + P.nivel, VW / 2, 12, 13, '#fff6ea');
  // el tiempo y las bajas
  const t = P.jefe ? Math.max(0, P.t - SV.duracion) : Math.max(0, SV.duracion - P.t), mm = Math.floor(t / 60), ss = Math.floor(t % 60);
  otxt(c, (P.jefe ? '+' : '') + mm + ':' + String(ss).padStart(2, '0'), VW / 2, 50, 30, P.jefe || t < 30 ? '#ff7a7a' : '#fff6ea');
  otxt(c, '💀 ' + fmt(P.kills), VW / 2, 76, 15, '#fff6ea');
  // las armas y las mejoras que llevas
  let x = 10;
  for (const k2 in P.armas) { hueco(x, 68, iconoCarta(ARMAS[k2].carta, 34), P.armas[k2], k2 === 'chaos'); x += 38; }
  x = 10; for (const k2 in P.pasivas) { c.font = '17px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(20,10,34,.7)'; c.beginPath(); rrPath(c, x, 112, 34, 28, 6); c.fill(); c.fillStyle = '#fff'; c.fillText(PASIVAS[k2].icono, x + 17, 126); pips(x, 142, P.pasivas[k2]); x += 38; }
  // la vida del jefe
  if (P.jefe && !P.jefe.muerto) {
    const J = P.jefe, w = 380, bx = (VW - w) / 2, by = 156;
    c.fillStyle = OL; c.beginPath(); rrPath(c, bx - 4, by - 4, w + 8, 22, 8); c.fill();
    c.fillStyle = '#3a2b52'; c.fillRect(bx, by, w, 14); c.fillStyle = '#ff3348'; c.fillRect(bx, by, w * J.vida / J.vidaMax, 14);
    otxt(c, 'SURVIVALBOT', VW / 2, by + 8, 13, '#fff6ea');
  }
  // el chat
  let cy = VH - 150;
  for (const m of P.chat) {
    const a = m.t > 7.5 ? 1 - (m.t - 7.5) / 1.5 : 1; c.globalAlpha = a * 0.92;
    c.font = '700 13px "Baloo 2", sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    const n = m.quien + ': ', wn = c.measureText(n).width, txt = m.txt.length > 46 ? m.txt.slice(0, 45) + '…' : m.txt, wt = c.measureText(txt).width;
    c.fillStyle = 'rgba(20,10,34,.6)'; c.beginPath(); rrPath(c, 8, cy - 11, wn + wt + 14, 22, 8); c.fill();
    c.fillStyle = m.col; c.fillText(n, 15, cy + 1); c.fillStyle = '#fff6ea'; c.fillText(txt, 15 + wn, cy + 1); cy += 25;
  }
  c.globalAlpha = 1;
  // el aviso grande del centro
  if (P.aviso) {
    const A = P.aviso, e = Math.min(1, A.t * 5), s = A.t > A.max - 0.4 ? (A.max - A.t) / 0.4 : 1;
    c.globalAlpha = s; otxt(c, A.titulo, VW / 2, 250, 30 * (0.7 + 0.3 * e), '#ffcb3d');
    if (A.sub) { c.font = '800 15px "Baloo 2", sans-serif'; otxt(c, A.sub, VW / 2, 284, 15, '#fff6ea'); }
    c.globalAlpha = 1;
  }
  // el mando de la pantalla táctil
  if (TACTIL.activo) {
    c.globalAlpha = 0.35; c.fillStyle = '#fff6ea'; c.beginPath(); c.arc(TACTIL.ox, TACTIL.oy, 56, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.8; c.fillStyle = '#ffb347'; c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.arc(TACTIL.ox + MANDO.x * 56, TACTIL.oy + MANDO.y * 56, 24, 0, Math.PI * 2); c.fill(); c.stroke(); c.globalAlpha = 1;
  }
}
function hueco(x, y, img, nv, lider) {
  const c = ctx; c.fillStyle = lider ? 'rgba(255,203,61,.35)' : 'rgba(20,10,34,.7)'; c.beginPath(); rrPath(c, x, y, 34, 34, 7); c.fill();
  c.drawImage(img, x, y, 34, 34); pips(x, y + 36, nv);
}
function pips(x, y, nv) { for (let i = 0; i < SV.nivelMax; i++) { ctx.fillStyle = i < nv ? '#ffcb3d' : 'rgba(255,255,255,.25)'; ctx.fillRect(x + 2 + i * 6.4, y, 5, 3); } }
