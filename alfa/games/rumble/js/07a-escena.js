// Fans of Rumble · Dibujo (1/4): pintar la escena entera, el ambiente y el agua
'use strict';
/* =========================================================
   RENDER
   ========================================================= */
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const VIEW = { k: 1, top: 0, bot: 0, LH: H };
const CLOUDS = [{ x: 80, y: 220, r: 130, s: 9 }, { x: 420, y: 600, r: 160, s: 7 }, { x: 250, y: 870, r: 120, s: 11 }];
function render() {
  if (!READY) return;
  const rdt = Math.min(0.05, Math.max(0, G.t - (render.lt == null ? G.t : render.lt))); render.lt = G.t;
  ctx.setTransform(VIEW.k, 0, 0, VIEW.k, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = SAVE.ahorro ? 'low' : 'high';   // v0.9.39
  ctx.fillStyle = '#24133a'; ctx.fillRect(0, 0, W, VIEW.LH);
  camApply();   // v0.9.18: zoom
  ctx.translate(0, VIEW.top + FIELD_DY);
  if (G.shake > 0.15 && !SAVE.noShake) ctx.translate(rand(-1, 1) * G.shake, rand(-1, 1) * G.shake);
  ctx.drawImage(BG, 0, 0, W, H);
  if (!terrainGround()) drawWater();   // v0.9.18: el terreno del jefe puede cambiar el río
  ctx.drawImage(BRIDGE_LAYER, 0, 0, W, H);
  drawClouds();
  if (G.faction === 'nomuertos') drawFog();
  const showZones = G.state === 'play' && ((input.dragging && input.card) || input.selected);
  if (showZones && !isSpell((input.dragging && input.card) || input.selected)) drawZones();
  for (const p of parts) if (p.ground) drawPart(p);
  drawSpellsGround();   // v0.9.15
  locasSuelo();   // habilidades locas (07g)
  for (const s of structs) { if (s.hidden) continue; ctx.globalAlpha = 0.3; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(s.x + 3, s.y + 3, s.r * 1.15, s.r * 0.45, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  for (const u of units) {
    drawUnitShadow(u);
    if (G.state === 'play' && !SAVE.ahorro && u.moving && u.deployT <= 0 && u.r >= 17 && !TYPES[u.type].hover && Math.random() < 0.1)   // polvo al andar (unidades grandes)
      parts.push({ type: 'dust', x: u.x - u.face * u.r * 0.6 + rand(-3, 3), y: u.y + rand(-2, 2), z: 1, vx: -u.face * 10, vy: 0, vz: 8, g: 0, life: 0.45, max: 0.45, size: 3.2, color: 'rgba(225,205,165,.8)', ground: true });
  }
  if (G.state !== 'title') for (const st of structs) if (!st.alive && st.smokeUntil > G.t && Math.random() < (SAVE.ahorro ? 0.07 : 0.2))   // humo de las torres caídas
    parts.push({ type: 'smoke', x: st.x + rand(-12, 12), y: st.y, z: rand(4, 14), vx: rand(-6, 6), vy: 0, vz: rand(18, 30), g: 0, life: rand(1.2, 1.9), max: 1.9, size: rand(6, 10) });
  const list = structs.concat(units).sort((a, b) => a.y - b.y);
  for (const e of list) (e.kind === 'struct' ? drawStruct(e) : drawUnit(e));
  for (const p of projs) drawProj(p);
  for (const p of parts) if (!p.ground) drawPart(p);
  drawSpellsAir();
  locasAire();
  terrainAir();
  if (G.state !== 'title') drawAmbient(rdt); else G.flash = 0;
  for (const e of list) if (!(e.kind === 'unit' && inTunnel(e))) drawBars(e);   // v0.9.19: dentro del túnel no se ve nada
  for (const n of nums) drawNum(n);
  drawPend();
  if (showZones) drawGhost();
  if (G.flash > 0.01) { ctx.setTransform(VIEW.k, 0, 0, VIEW.k, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = `rgba(255,246,225,${Math.min(0.6, G.flash)})`; ctx.fillRect(0, 0, W, VIEW.LH); G.flash *= Math.pow(0.02, rdt); }
}
// v0.9.8: luz suave desde arriba a la izquierda y bordes algo más oscuros (se pinta una sola vez, dentro del fondo)
// v0.9.8: ambiente animado en cada mitad del campo según la facción
const AMB = { list: [], key: '' };
const AMB_KIND = { animales: 'butterfly', nomuertos: 'wisp', streamers: 'heart', heroes: 'mote', ciber: 'bit', memes: 'confetti', gamer: 'orb', olvidados: 'pixel', pop: 'flashbulb' };
const AMB_COL = { butterfly: ['#ffd84d', '#ff8fb1', '#b98cff', '#ffffff', '#7dd3fc'], wisp: ['#5ef2a0', '#a7ffd6'], heart: ['#ff5fa8', '#c084fc', '#f472b6'], mote: ['#ffe28a', '#fff3c4'],
  bit: ['#22e3ff', '#ff3df0', '#a3ff7a'], confetti: ['#ff3df0', '#22e3ff', '#ffe14d', '#7be04a', '#ff8a1f'], memo: ['#ffffff', '#e9eef7'], ember: ['#ff3348', '#ff7a5c', '#ffb36b'],
  orb: ['#7be04a', '#a3ff7a', '#4ade80'], pixel: ['#d6a96a', '#e8c48a', '#b98a55', '#a8b478'], flashbulb: ['#ffffff', '#fff7d6'], disc: ['#e5e7eb', '#f1f5f9'] };
function ambNew(kind, top, init) {
  const y0 = top ? 80 : RIVER.bottom + 20, y1 = top ? RIVER.top - 25 : 785;
  const a = { kind, top, x: rand(24, W - 24), y: rand(y0, y1), y0, y1, ph: Math.random() * 6.28, life: rand(5, 10), col: pick(AMB_COL[kind]), dir: Math.random() < 0.5 ? -1 : 1 };
  a.max = a.life; if (init) a.life = rand(0.8, a.max);
  return a;
}
function drawAmbient(dt) {
  if (REDUCED) return;
  const ek = G.efac === 'microblizz' ? 'memo' : G.efac === 'phony' ? 'disc' : G.efac === 'iahorro' ? 'bit' : 'ember', pk = AMB_KIND[G.faction] || 'butterfly', key = pk + ek;
  if (AMB.key !== key) { AMB.key = key; AMB.list = []; for (let i = 0; i < 12; i++) AMB.list.push(ambNew(pk, false, true)); for (let i = 0; i < 7; i++) AMB.list.push(ambNew(ek, true, true)); }
  for (let i = 0; i < AMB.list.length; i++) {
    let a = AMB.list[i]; a.life -= dt;
    if (a.life <= 0 || a.y < a.y0 - 30 || a.y > a.y1 + 30 || a.x < -20 || a.x > W + 20) a = AMB.list[i] = ambNew(a.kind, a.top, false);
    const age = a.max - a.life, fade = Math.max(0, Math.min(1, age / 0.8, a.life / 0.8)); a.ph += dt;
    ctx.globalAlpha = fade;
    switch (a.kind) {
      case 'butterfly': {
        a.x += (Math.sin(a.ph * 0.7) * 20 + a.dir * 9) * dt; a.y += Math.cos(a.ph * 0.9) * 12 * dt;
        const fl = Math.abs(Math.sin(a.ph * 13)), y = a.y - 16 - Math.sin(a.ph * 2) * 4;
        ctx.save(); ctx.translate(a.x, y); ctx.fillStyle = a.col; ctx.strokeStyle = OL; ctx.lineWidth = 0.8;
        for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 2.6 * (0.35 + 0.65 * fl), -0.6, 2.8 * (0.3 + 0.7 * fl), 2.4, sd * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
        ctx.fillStyle = OL; ctx.fillRect(-0.6, -2.4, 1.2, 4.4); ctx.restore(); break; }
      case 'wisp': {
        a.y -= 10 * dt; a.x += Math.sin(a.ph * 1.3) * 8 * dt; const f = 0.7 + 0.3 * Math.sin(a.ph * 9);
        ctx.globalAlpha = fade * 0.28 * f; ctx.fillStyle = a.col; ctx.beginPath(); ctx.arc(a.x, a.y - 14, 6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = fade * f; ctx.beginPath(); ctx.arc(a.x, a.y - 14, 1.9, 0, Math.PI * 2); ctx.fill(); break; }
      case 'heart': {
        a.y -= 12 * dt; a.x += Math.sin(a.ph * 2) * 6 * dt;
        ctx.globalAlpha = fade * 0.75; ctx.fillStyle = a.col; ctx.beginPath(); heartPath(ctx, a.x, a.y - 14, 3.2); ctx.fill(); break; }
      case 'mote': {
        a.y -= 7 * dt; a.x += Math.sin(a.ph) * 4 * dt; const r = 1.2 + 1.6 * Math.abs(Math.sin(a.ph * 3));
        ctx.fillStyle = a.col; ctx.beginPath(); starPath(ctx, a.x, a.y - 14, r * 1.6, r * 0.45, 4); ctx.fill(); break; }
      case 'bit': {
        a.y -= 9 * dt; ctx.globalAlpha = fade * (Math.sin(a.ph * 6) > -0.3 ? 0.9 : 0.25); ctx.fillStyle = a.col; ctx.fillRect(a.x - 1.6, a.y - 15.6, 3.2, 3.2); break; }
      case 'confetti': {
        a.y += 16 * dt; a.x += Math.sin(a.ph * 1.5) * 12 * dt;
        ctx.save(); ctx.translate(a.x, a.y - 14); ctx.rotate(a.ph * 3); ctx.scale(Math.cos(a.ph * 5), 1); ctx.fillStyle = a.col; ctx.fillRect(-2.6, -1.5, 5.2, 3); ctx.restore(); break; }
      case 'memo': {   // memorandos de Microblizz volando
        a.y += 8 * dt; a.x += (Math.sin(a.ph * 0.8) * 16 + a.dir * 4) * dt;
        ctx.save(); ctx.translate(a.x, a.y - 14); ctx.rotate(Math.sin(a.ph * 1.6) * 0.6); ctx.globalAlpha = fade * 0.85;
        ctx.fillStyle = a.col; ctx.strokeStyle = OL; ctx.lineWidth = 0.8; ctx.fillRect(-3, -4, 6, 8); ctx.strokeRect(-3, -4, 6, 8);
        ctx.fillStyle = '#9aa3b2'; ctx.fillRect(-2, -2.4, 4, 0.8); ctx.fillRect(-2, -0.6, 4, 0.8); ctx.fillRect(-2, 1.2, 2.6, 0.8); ctx.restore(); break; }
      case 'orb': {   // orbes de experiencia (Comunidad Gamer)
        a.y -= 11 * dt; a.x += Math.sin(a.ph * 1.7) * 6 * dt; const f = 0.75 + 0.25 * Math.sin(a.ph * 7);
        ctx.globalAlpha = fade * 0.3 * f; ctx.fillStyle = a.col; ctx.beginPath(); ctx.arc(a.x, a.y - 14, 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = fade * f; ctx.beginPath(); ctx.arc(a.x, a.y - 14, 2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(a.x - 0.6, a.y - 14.6, 0.7, 0, Math.PI * 2); ctx.fill(); break; }
      case 'pixel': {   // polvo de píxeles viejos (Olvidados)
        a.y -= 5 * dt; a.x += Math.sin(a.ph * 0.9) * 5 * dt; ctx.globalAlpha = fade * 0.75; ctx.fillStyle = a.col; ctx.fillRect(Math.round(a.x) - 1.5, Math.round(a.y - 14) - 1.5, 3, 3); break; }
      case 'flashbulb': {   // flashes de los fotógrafos (Cultura Pop)
        const k2 = Math.max(0, Math.sin(a.ph * 2.2 + a.dir)); if (k2 < 0.92) break; const r2 = (k2 - 0.92) * 70;
        ctx.globalAlpha = fade * 0.9; ctx.fillStyle = a.col; ctx.beginPath(); starPath(ctx, a.x, a.y - 16, r2 + 1, (r2 + 1) * 0.3, 4); ctx.fill(); break; }
      case 'disc': {   // discos tirados por Phony
        a.y += 9 * dt; a.x += (Math.sin(a.ph * 0.8) * 12 + a.dir * 3) * dt; const sx2 = Math.cos(a.ph * 4);
        ctx.save(); ctx.translate(a.x, a.y - 14); ctx.scale(sx2, 1); ctx.globalAlpha = fade * 0.85; ctx.fillStyle = a.col; ctx.strokeStyle = OL; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7dd3fc'; ctx.fillRect(-2.4, -0.6, 2, 1.2); ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(0, 0, 0.9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); break; }
      case 'ember': {
        a.y -= 14 * dt; a.x += Math.sin(a.ph * 2) * 5 * dt; ctx.globalAlpha = fade * (0.6 + 0.4 * Math.sin(a.ph * 11));
        ctx.fillStyle = a.col; ctx.beginPath(); ctx.arc(a.x, a.y - 14, 1.7, 0, Math.PI * 2); ctx.fill(); break; }
    }
  }
  ctx.globalAlpha = 1;
}
function drawWater() {
  ctx.save(); ctx.beginPath(); ctx.rect(0, RIVER.top, W, RIVER.bottom - RIVER.top); ctx.clip();
  ctx.strokeStyle = 'rgba(225,255,255,1)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (let i = 0; i < 18; i++) { const y = RIVER.top + 6 + (i % 4) * 8.5; const x = ((i * 71 + G.t * (16 + (i % 3) * 7)) % (W + 80)) - 40; ctx.globalAlpha = 0.3 + 0.22 * Math.sin(G.t * 2 + i); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y - 2, x + 16, y); ctx.stroke(); }
  const t = G.t, T0 = RIVER.top, B0 = RIVER.bottom;
  ctx.strokeStyle = '#effcff'; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.6;
  for (const [yy, dir] of [[T0 + 2, 1], [B0 - 2, -1]]) { ctx.beginPath(); for (let x = 0; x <= W; x += 9) { const y = yy + dir * (1.4 + Math.sin(x * 0.08 + t * 2.4 * dir) * 1.4); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 12; i++) { const c = t * 0.55 + i * 0.29, ph = c % 1, a = Math.sin(ph * Math.PI); if (a < 0.1) continue; const x = (i * 97 + 31 + Math.floor(c) * 53) % W, y = T0 + 9 + ((i * 7) % 21); ctx.globalAlpha = a; ctx.beginPath(); starPath(ctx, x, y, 1 + a * 2.6, 0.5 + a * 0.5, 4); ctx.fill(); }
  ctx.lineWidth = 1.5; ctx.strokeStyle = '#e8fbff';
  for (const bx of BRIDGES) for (const side of [-1, 1]) for (const o of [0, 0.5]) { const k = (t * 0.6 + o + (side > 0 ? 0.25 : 0)) % 1; ctx.globalAlpha = (1 - k) * 0.55; ctx.beginPath(); ctx.ellipse(bx + side * 36, RIVER.y, 3 + k * 16, 2 + k * 7, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawClouds() {
  for (const cl of CLOUDS) {
    const x = ((cl.x + G.t * cl.s) % (W + 400)) - 200;
    const g = ctx.createRadialGradient(x, cl.y, 0, x, cl.y, cl.r); g.addColorStop(0, 'rgba(20,30,40,.09)'); g.addColorStop(1, 'rgba(20,30,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, cl.y, cl.r, cl.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function drawFog() {
  for (let i = 0; i < 4; i++) {
    const x = ((i * 170 + G.t * (6 + i * 2)) % (W + 300)) - 150, y = 500 + i * 70 + Math.sin(G.t * 0.4 + i) * 10, rx = 150 + i * 20;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, 'rgba(200,255,230,.10)'); g.addColorStop(1, 'rgba(200,255,230,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function drawZones() {
  ctx.save();
  ctx.fillStyle = 'rgba(255,60,80,0.14)'; ctx.fillRect(0, 60, W, ZONE.p.y0 - 60);
  ctx.beginPath(); ctx.rect(0, 60, W, ZONE.p.y0 - 60); ctx.clip();
  ctx.strokeStyle = 'rgba(255,80,100,0.15)'; ctx.lineWidth = 6;
  for (let i = -H; i < W; i += 26) { ctx.beginPath(); ctx.moveTo(i, 60); ctx.lineTo(i + (ZONE.p.y0 - 60), ZONE.p.y0); ctx.stroke(); }
  ctx.restore();
  const a = 0.13 + 0.05 * Math.sin(G.t * 5);
  ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, ZONE.p.y0, W, ZONE.p.y1 - ZONE.p.y0);
  const lg = ctx.createLinearGradient(0, ZONE.p.y0 - 12, 0, ZONE.p.y0 + 16);   // v0.9.72: el borde de tu lado, en brillo (sin rayas)
  lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.45, 'rgba(255,255,255,.85)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = lg; ctx.fillRect(0, ZONE.p.y0 - 12, W, 28);
}
