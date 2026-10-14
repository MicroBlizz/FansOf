// Fans of Rumble · Dibujo (2/4): la sombra, el cuerpo, el equipo y el arma de cada unidad
'use strict';

function drawUnitShadow(u) {
  let z = u.z || 0;
  if (u.deployT > 0 && !u.rising) { const k = 1 - u.deployT / u.deployMax; if (k < 0.55) { const f = k / 0.55; z = (1 - f * f) * 170; } }
  const sc = Math.max(0.35, 1 - z / 260);
  if (u.deployT <= 0 && u.revived) { ctx.globalAlpha = 0.5 + 0.2 * Math.sin(G.t * 5 + u.id); ctx.fillStyle = '#5ef2a0'; ctx.beginPath(); ctx.ellipse(u.x, u.y + 1, u.r * 1.35, u.r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  if (u.slowT > 0) glowArea(ctx, u.x, u.y + 1, u.r * 1.6, '#9fe3ff', 1.6, 0.42);   // v0.9.72: ralentizada, brillo azul en el suelo
  if (u.rage > 0 && u.deployT <= 0 && !u.jump) {
    const k = u.rage / CFG.passives.animales.maxStacks, pulse = 0.85 + 0.15 * Math.sin(G.t * 8 + u.id);
    const g = ctx.createRadialGradient(u.x, u.y, 0, u.x, u.y, u.r * (1.4 + k * 0.8));
    g.addColorStop(0, `rgba(255,120,40,${(0.25 + 0.4 * k) * pulse})`); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(u.x, u.y, u.r * (1.4 + k * 0.8), u.r * (0.6 + k * 0.35), 0, 0, Math.PI * 2); ctx.fill();
  }
  if (u.corrupt && u.deployT <= 0) {   // aura de corrupción
    const g = ctx.createRadialGradient(u.x, u.y, 0, u.x, u.y, u.r * 1.6); g.addColorStop(0, 'rgba(170,0,80,.35)'); g.addColorStop(1, 'rgba(170,0,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(u.x, u.y, u.r * 1.6, u.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (S && facOf(u.team) === 'streamers' && S[u.team].hypeLvl > 0 && u.deployT <= 0) {
    const k = S[u.team].hypeLvl / CFG.passives.streamers.max, pulse = 0.85 + 0.15 * Math.sin(G.t * 7 + u.id);
    const g = ctx.createRadialGradient(u.x, u.y, 0, u.x, u.y, u.r * (1.4 + k * 0.7));
    g.addColorStop(0, `rgba(192,132,252,${(0.25 + 0.35 * k) * pulse})`); g.addColorStop(1, 'rgba(150,80,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(u.x, u.y, u.r * (1.4 + k * 0.7), u.r * (0.6 + k * 0.3), 0, 0, Math.PI * 2); ctx.fill();
  }
  if (u.deployT <= 0 && (u.actT > 0 || (u.d.fury && u.hp < u.maxHp * u.d.fury.f) || (S && facOf(u.team) === 'gamer' && S[u.team].comm > 1))) {   // v0.9.13: ¡Acción!, Furia y Comunidad
    const col = u.actT > 0 ? '255,154,184' : u.d.fury && u.hp < u.maxHp * u.d.fury.f ? '255,100,40' : '123,224,74', k = u.actT > 0 || u.d.fury ? 1 : S[u.team].comm / CFG.passives.gamer.max, pulse = 0.85 + 0.15 * Math.sin(G.t * 7 + u.id);
    const g = ctx.createRadialGradient(u.x, u.y, 0, u.x, u.y, u.r * (1.4 + k * 0.6)); g.addColorStop(0, `rgba(${col},${(0.22 + 0.33 * k) * pulse})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(u.x, u.y, u.r * (1.4 + k * 0.6), u.r * (0.6 + k * 0.25), 0, 0, Math.PI * 2); ctx.fill();
  }
  if (u.d.healer && u.deployT <= 0 && u.healGlowT != null) {   // v0.9.18: el cono solo se ve al curar: verde tenue que aparece y se va
    const e = G.t - u.healGlowT, a = e < 0.15 ? e / 0.15 : e < 0.45 ? 1 : Math.max(0, 1 - (e - 0.45) / 0.65);
    if (a > 0.01) {
      const ha = u.healAng === undefined ? healFwd(u) : u.healAng, R = u.d.healR, g = ctx.createRadialGradient(u.x, u.y, 4, u.x, u.y, R);
      g.addColorStop(0, `rgba(170,255,140,${0.26 * a})`); g.addColorStop(0.75, `rgba(140,240,110,${0.14 * a})`); g.addColorStop(1, 'rgba(140,240,110,0)');
      ctx.beginPath(); ctx.moveTo(u.x, u.y); ctx.arc(u.x, u.y, R, ha - HEAL_CONE / 2, ha + HEAL_CONE / 2); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    }
  }
  if (u.d.aura && u.deployT <= 0) glowArea(ctx, u.x, u.y, u.d.aura.r, u.team === 'p' ? '#c084fc' : '#8fc2ff', 0.75 + 0.2 * Math.sin(G.t * 3), 0.5);   // v0.9.72: el aura, en brillo
  ctx.globalAlpha = 0.3 * sc; ctx.fillStyle = '#140a1e'; ctx.beginPath(); ctx.ellipse(u.x, u.y + 1, u.r * 1.05 * sc, u.r * 0.42 * sc, 0, 0, Math.PI * 2); ctx.fill();
  if (u.deployT <= 0 && !u.jump) { ctx.globalAlpha = u.stealthT > 0 ? 0.4 : 0.95; ctx.strokeStyle = u.team === 'p' ? '#ffa23a' : '#3d9bff'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(u.x, u.y + 1, u.r * 0.95, u.r * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (isLeader(u.type) && u.deployT <= 0 && !u.jump) glowArea(ctx, u.x, u.y + 1, u.r * 1.7, '#ffcb3d', (u.stealthT > 0 ? 0.6 : 1.7) + 0.2 * Math.sin(G.t * 4), 0.42);   // v0.9.72: el líder, brillo dorado
  ctx.globalAlpha = 1;
}
function drawFoot(fx, fy, r, col) { ctx.beginPath(); ctx.ellipse(fx, fy - 1, r * 0.3, r * 0.19, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = OL; ctx.stroke(); }
function drawUnit(u) {
  const s = SPR[u.type], T = TYPES[u.type];
  let x = u.x, y = u.y, z = u.z || 0, sx = 1, sy = 1;
  let rise = 1, ang = 0;   // v0.9.15: inclinación del cuerpo (andar, atacar, recibir un golpe, aturdido)
  if (u.deployT > 0 && u.rising) { rise = 1 - u.deployT / u.deployMax; sy = 0.15 + 0.85 * rise; sx = 1 + 0.25 * (1 - rise); }
  else if (u.deployT > 0) {
    const k = 1 - u.deployT / u.deployMax;
    if (k < 0.55) { const f = k / 0.55; z = (1 - f * f) * 170; } else { const w = Math.sin(((k - 0.55) / 0.45) * Math.PI); sx = 1 + w * 0.22; sy = 1 - w * 0.22; }
  } else if (u.moving && u.stunT <= 0) { z += Math.abs(Math.sin(u.walk)) * 2.4 * (u.r / 14); const w = Math.sin(u.walk * 2); sy = 1 + w * 0.035; sx = 1 - w * 0.03; ang = (T.hover ? 0.08 : 0.05) + Math.sin(u.walk) * (T.hover ? 0.02 : 0.06); }   // se inclina hacia delante y se balancea al andar
  else if (u.stunT <= 0) { const br = Math.sin(G.t * 3 + u.id * 1.7) * 0.025; sy = 1 + br; sx = 1 - br * 0.6; }
  else if (u.stunKind !== 'stone') ang = Math.sin(G.t * 11 + u.id) * 0.07;   // aturdido: se tambalea
  let ghost = 0;   // v0.9.24: estela del golpe
  if (u.lungeT > 0) {   // el golpe: sale disparado (rápido) y vuelve (más lento); los de distancia dan un culatazo
    const lm = u.lungeMax || 0.18, p = 1 - u.lungeT / lm, k = p < 0.3 ? 1 - Math.pow(1 - p / 0.3, 3) : 1 - Math.pow((p - 0.3) / 0.7, 2);
    if (u.d.ranged || u.d.chain) { x += u.lungeX * k * 7; y += u.lungeY * k * 4; ang -= 0.16 * k; sx *= 1 - 0.06 * k; sy *= 1 + 0.06 * k; }
    else { x += u.lungeX * k * 12; y += u.lungeY * k * 7; ang += 0.32 * k; sx *= 1 + 0.16 * k; sy *= 1 - 0.1 * k; if (p < 0.55) ghost = k; }
  }
  else if (!u.moving && u.target && u.stunT <= 0 && u.deployT <= 0 && !u.d.ranged && !u.d.chain && u.atkT > 0 && u.atkT < 0.32) {   // coge impulso: se echa atrás y se encoge como un muelle
    const w = 1 - u.atkT / 0.32, e = w * w; ang -= 0.22 * e; x -= u.face * 2.5 * e; sx *= 1 + 0.08 * e; sy *= 1 - 0.1 * e;
  }
  if (u.kbT > 0 && u.deployT <= 0) { const h = u.kbT / 0.18, e = h * h; x += (u.kbX || 0) * 6 * e; y += (u.kbY || 0) * 3 * e; ang -= 0.16 * e; sx *= 1 + 0.12 * e; sy *= 1 - 0.12 * e; }   // le dan: sale despedido un poco y se aplasta
  else if (u.hitT > 0 && u.deployT <= 0) { const h = u.hitT / 0.12; ang -= 0.1 * h; x -= u.face * 2.2 * h; }
  if (T.hover && u.deployT <= 0) z += 4 + Math.sin(G.t * 4 + u.id) * 1.5;
  let alpha = rise; if (u.stealthT > 0 && u.deployT <= 0) alpha = 0.36 + Math.sin(G.t * 9 + u.id) * 0.07;
  if (u.mut === 'glass') alpha *= 0.72;
  const ms = (u.mScale || 1) * (u.shrinkT > 0 ? u.shrinkF || 0.6 : 1);
  if (u.banT > 0) alpha *= 0.22;   // v0.9.15: baneado
  if (u.loca) { const P = locaPose(u); alpha *= P.a; ang += P.ang; sx *= P.sx; sy *= P.sy; z += P.z; }   // habilidades locas (07g)
  if (ghost > 0.25 && !REDUCED && u.stealthT <= 0) for (const g of [0.55, 0.25]) {   // v0.9.24: estela
    ctx.save(); ctx.globalAlpha = alpha * ghost * (g === 0.55 ? 0.3 : 0.16); ctx.translate(x - u.lungeX * ghost * 12 * (1 - g), y - z - u.lungeY * ghost * 7 * (1 - g));
    if (ang) ctx.rotate(ang * u.face * g); ctx.scale(u.face * sx * ms, sy * ms); ctx.drawImage(s.w, -s.ax, -s.ay, s.wd, s.ht); ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y - z);
  if (u.jump) { const pv = T.top * 0.45; ctx.translate(0, -pv); ctx.rotate(u.spin); ctx.translate(0, pv); }
  if (ang) ctx.rotate(ang * u.face);
  ctx.scale(u.face * sx * ms, sy * ms);
  if (T.jet) { const fl = 4 + Math.random() * 3; ctx.fillStyle = 'rgba(120,230,255,.85)'; ctx.beginPath(); ctx.moveTo(-3.5, -6); ctx.lineTo(3.5, -6); ctx.lineTo(0, -4 + fl); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-1.6, -6); ctx.lineTo(1.6, -6); ctx.lineTo(0, -6 + fl); ctx.closePath(); ctx.fill(); }
  if (u.equip && u.equip.weapon && EQ_BACK[u.type]) drawEquip(u, T, ctx, 'back');
  ctx.drawImage(u.corrupt ? corruptOf(u.type) : s.c, -s.ax, -s.ay, s.wd, s.ht);
  if (u.equip) drawEquip(u, T);
  if (T.foot) { const l = u.moving && u.stunT <= 0 ? Math.sin(u.walk) * 2.2 : 0, fr = u.d.r; drawFoot(-fr * 0.4, -Math.max(0, l), fr, T.foot); drawFoot(fr * 0.4, -Math.max(0, -l), fr, T.foot); }
  if (T.spark && u.deployT <= 0) { const [fx, fy] = T.spark; const r = 2 + Math.random() * 2; ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fx, fy, r * 0.45, 0, Math.PI * 2); ctx.fill(); }
  if (u.hitT > 0) { ctx.globalAlpha = alpha * (u.hitT / 0.12) * 0.9; ctx.drawImage(s.w, -s.ax, -s.ay, s.wd, s.ht); }
  if (u.stunT > 0) { if (u.stunKind === 'stone' && s.g) { ctx.globalAlpha = alpha * 0.85; ctx.drawImage(s.g, -s.ax, -s.ay, s.wd, s.ht); } else { ctx.globalAlpha = 0.45; ctx.drawImage(s.w, -s.ax, -s.ay, s.wd, s.ht); } }
  ctx.restore();
  if (u.loca) locaEncima(u, x, y - z, T, ms);
  if (u.bshield > 0 && u.deployT <= 0) {   // v0.9.13: barrera dorada del muro de escudos
    const top = topOf(u), k = Math.min(1, u.bshT / 1.5);
    ctx.save(); ctx.globalAlpha = 0.35 + 0.5 * k; ctx.strokeStyle = '#ffcb3d'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(255,203,61,.10)';
    ctx.beginPath(); ctx.ellipse(x, y - z - top * 0.46, Math.max(u.r * 1.3, top * 0.44), top * 0.62, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  if (u.shield > 0 && u.deployT <= 0) {   // burbuja del escudo de plasma
    const k = u.shield / u.shieldMax, top = topOf(u);
    ctx.save(); ctx.globalAlpha = 0.3 + 0.45 * k; ctx.strokeStyle = '#7df3ff'; ctx.lineWidth = 1.6; ctx.fillStyle = 'rgba(34,227,255,.08)';
    ctx.beginPath(); ctx.ellipse(x, y - z - top * 0.46, Math.max(u.r * 1.25, top * 0.42), top * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  }
}
// tinte morado-rojizo de las facciones corrompidas por Microblizz (se genera al usarlo)
const CORRUPT = {};
function corruptOf(key) {
  if (CORRUPT[key]) return CORRUPT[key];
  const sp = SPR[key], c = document.createElement('canvas'); c.width = sp.c.width; c.height = sp.c.height;
  const x = c.getContext('2d'); x.drawImage(sp.c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(110,0,60,.34)'; x.fillRect(0, 0, c.width, c.height);
  return (CORRUPT[key] = c);
}
// equipo del gashapón dibujado sobre el líder (coordenadas del dibujo, ya escaladas y giradas)
const EQ_HEAD = { bunny: -47, necrolord: -56, twitchking: -60, epicchampion: -64, cybermarine: -62, memelord: -61, progamer: -53, vikingo: -57, directora: -53 };
const EQ_HAND = { bunny: [-12, -16], necrolord: [-13, -24], twitchking: [-20, -34.5], epicchampion: [17, -26], cybermarine: [-14, -21], memelord: [-15.6, -15.6], progamer: [-14.6, -14.6], vikingo: [16, -17], directora: [15, -28] };
// v0.9.15: el arma va en la mano libre (la izquierda del dibujo, en espejo); si tiene las dos ocupadas (espada y escudo, hacha y escudo, megáfono y claqueta), a la espalda
const EQ_NECK = { bunny: -26, necrolord: -31, twitchking: -31, epicchampion: -38, cybermarine: -44, memelord: -36, progamer: -39, vikingo: -35, directora: -36 };   // dónde está el cuello de cada líder (corbata, capa); si no está, debajo de la cabeza
const EQ_MIRROR = { bunny: 1, necrolord: 1, twitchking: 1, cybermarine: 1, memelord: 1, progamer: 1 };
const EQ_BACK = { epicchampion: [-11, -30, -0.4], vikingo: [-10, -29, -0.34], directora: [-10, -27, -0.4] };
function drawEquip(u, T, cc, part) {
  if (part === 'back') { const BK = EQ_BACK[u.type], c = cc || ctx; if (BK && u.equip.weapon) { c.save(); c.lineJoin = 'round'; c.lineCap = 'round'; c.translate(BK[0], BK[1]); c.rotate(BK[2]); c.scale(-1.55, 1.55); drawWeapon(c, u.equip.weapon, 0, 0); c.restore(); } return; }
  const c = cc || ctx, E = u.equip, hy = EQ_HEAD[u.type] || -T.top, [hx, hdy] = EQ_HAND[u.type] || [u.d.r * 0.85, -T.top * 0.42], ax = -u.d.r * 0.9, ay = -T.top * 0.32, ny = EQ_NECK[u.type] != null ? EQ_NECK[u.type] : hy + 13;
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  switch (E.head) {
    case 'corona_huesos': shape(c, poly(-8, hy + 2, -9, hy - 6, -5, hy - 2, -2, hy - 9, 2, hy - 2, 6, hy - 9, 9, hy - 2, 8, hy + 2), '#efeadf', 1.5); dot(c, -2, hy - 1, 1.2, '#5ef2d0'); dot(c, 4, hy - 1, 1.2, '#5ef2d0'); break;
    case 'yelmo_olimpo': shape(c, c2 => { c2.arc(0, hy + 4, 9.5, Math.PI, 0); c2.closePath(); }, '#ffcb3d', 1.5); shape(c, c2 => { c2.moveTo(-2, hy - 5); c2.quadraticCurveTo(2, hy - 16, 12, hy - 15); c2.quadraticCurveTo(6, hy - 10, 4, hy - 4); c2.closePath(); }, '#ef4444', 1.3); break;
    case 'gafas_pixel': c.fillStyle = OL; c.fillRect(-9, hy + 8, 18, 2.4); c.fillRect(-8, hy + 10.4, 7, 3.2); c.fillRect(1, hy + 10.4, 7, 3.2); c.fillStyle = '#fff'; c.fillRect(-7, hy + 10.6, 1.6, 1.6); c.fillRect(2, hy + 10.6, 1.6, 1.6); break;
    case 'cuernos': shape(c, c => { c.moveTo(-6, hy + 2); c.quadraticCurveTo(-14, hy, -13, hy - 9); c.quadraticCurveTo(-10, hy - 3, -4, hy - 1); c.closePath(); }, '#f5f0dc', 1.4); shape(c, c => { c.moveTo(6, hy + 2); c.quadraticCurveTo(14, hy, 13, hy - 9); c.quadraticCurveTo(10, hy - 3, 4, hy - 1); c.closePath(); }, '#f5f0dc', 1.4); break;
    case 'corona_carton': shape(c, poly(-8, hy + 2, -9, hy - 7, -4.5, hy - 3, 0, hy - 9, 4.5, hy - 3, 9, hy - 7, 8, hy + 2), '#ffd166', 1.5); line(c, [-7.5, hy - 0.5, 7.5, hy - 0.5], '#e63946', 1.4); break;
    case 'gorro_aluminio': shape(c, poly(-9, hy + 2, 0, hy - 15, 9, hy + 2), '#d9dde3', 1.6); line(c, [-4, hy - 4, 2, hy - 7], '#9aa3b2', 1); line(c, [-2, hy - 1, 5, hy - 3], '#9aa3b2', 1); break;
    case 'auriculares': c.beginPath(); c.arc(0, hy + 6, 10.5, Math.PI * 1.08, Math.PI * 1.92); c.strokeStyle = OL; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#ff3348'; c.lineWidth = 2.2; c.stroke(); shape(c, rr(-13, hy + 2, 5, 8, 2), '#1f2937', 1.4); shape(c, rr(8, hy + 2, 5, 8, 2), '#1f2937', 1.4); break;
    case 'gorra_reves': shape(c, c2 => { c2.arc(0, hy + 4, 9, Math.PI, 0); c2.closePath(); }, '#e63946', 1.5); shape(c, rr(-15, hy + 1.6, 8, 3.4, 1.6), '#b0213a', 1.3); dot(c, 0, hy - 4.6, 1.3, '#fff6ea'); break;
    case 'casco_vr': line(c, [-10, hy + 9, -12, hy + 3], OL, 1.6); line(c, [10, hy + 9, 12, hy + 3], OL, 1.6); shape(c, rr(-10, hy + 7, 20, 8, 2.6), '#2b2d42', 1.5); line(c, [-8, hy + 10.5, 8, hy + 10.5], '#22e3ff', 1.1); dot(c, 6.5, hy + 12.6, 1.1, '#ff3df0'); break;
    case 'orejas_gato': shape(c, poly(-10, hy + 4, -7, hy - 8, -2.5, hy + 1.5), '#2b2d42', 1.4); shape(c, poly(10, hy + 4, 7, hy - 8, 2.5, hy + 1.5), '#2b2d42', 1.4); shape(c, poly(-8, hy + 2.6, -6.6, hy - 4, -4.4, hy + 1.4), '#ff8fd0', 0.8); shape(c, poly(8, hy + 2.6, 6.6, hy - 4, 4.4, hy + 1.4), '#ff8fd0', 0.8); break;
    default: if (EQ_NUEVOS.head[E.head]) EQ_NUEVOS.head[E.head](c, hy);   // los nuevos, en 07f-objetos-nuevos.js
  }
  if (E.weapon && !EQ_BACK[u.type]) { if (EQ_MIRROR[u.type]) { c.save(); c.translate(hx, hdy); c.scale(-1, 1); drawWeapon(c, E.weapon, 0, 0); c.restore(); } else drawWeapon(c, E.weapon, hx, hdy); }
  switch (E.acc) {
    case 'microfono_oro': line(c, [ax, ay + 4, ax, ay - 4], OL, 2.4); shape(c, el(ax, ay - 6, 3.4, 4), '#ffcb3d', 1.3); break;
    case 'nucleo_plasma': shape(c, el(ax, ay, 5.4, 5.4), '#0e7490', 1.3); dot(c, ax, ay, 2.6, '#7df3ff'); break;
    case 'cartucho_dorado': shape(c, rr(ax - 4.5, ay - 6, 9, 11, 1.4), '#ffcb3d', 1.3); c.fillStyle = '#a16207'; c.fillRect(ax - 3, ay - 4, 6, 4); break;
    case 'taza': shape(c, rr(ax - 3.5, ay - 4, 7, 8, 1.4), '#fff', 1.3); c.beginPath(); c.arc(ax + 4, ay, 2, -1.2, 1.2); c.strokeStyle = OL; c.lineWidth = 1.2; c.stroke(); c.fillStyle = '#2e8bff'; c.fillRect(ax - 3, ay - 1, 6, 1.4); break;
    case 'pase_caducado': c.save(); c.translate(ax, ay); c.rotate(-0.3); shape(c, rr(-5, -3, 10, 6, 1), '#ffe14d', 1.2); line(c, [-3, 0, 3, 0], '#e63946', 1); c.restore(); break;
    case 'almohada': c.beginPath(); c.arc(0, hy + 18, 7, 0.1, Math.PI - 0.1); c.strokeStyle = OL; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#7dd3fc'; c.lineWidth = 4; c.stroke(); break;
    case 'silla_gamer': shape(c, rr(ax - 6, ay - 12, 7, 16, 2), '#e63946', 1.3); line(c, [ax - 5, ay - 8, ax - 1, ay - 8], '#1f2937', 1.4); break;
    case 'cofre': shape(c, rr(ax - 5, ay - 3, 10, 7, 1.4), '#a16207', 1.3); line(c, [ax - 5, ay, ax + 5, ay], '#ffcb3d', 1.4); dot(c, ax, ay + 1, 1, '#ffcb3d'); break;
    case 'diploma': c.save(); c.translate(ax, ay - 2); c.rotate(-0.15); shape(c, rr(-6, -4.5, 12, 9, 1), '#8a5a33', 1.2); shape(c, rr(-4.4, -3, 8.8, 6, 0.6), '#fff6ea', 0.8); line(c, [-3, -1, 3, -1], '#a08ab8', 0.8); line(c, [-3, 1, 1.5, 1], '#a08ab8', 0.8); dot(c, 2.6, 1.6, 1.1, '#e63946'); c.restore(); break;
    case 'corbata_ceo': { const ty = ny; shape(c, poly(-2.4, ty, 2.4, ty, 1.6, ty + 3, -1.6, ty + 3), '#b0213a', 1.1); shape(c, poly(-1.6, ty + 3, 1.6, ty + 3, 3, ty + 12, 0, ty + 15, -3, ty + 12), '#e63946', 1.1); line(c, [-1.6, ty + 7, 2, ty + 5.5], '#ffcb3d', 0.9); line(c, [-2.4, ty + 11, 2.6, ty + 9], '#ffcb3d', 0.9); break; }
    case 'bebida_xxl': shape(c, rr(ax - 3.6, ay - 7, 7.2, 12, 1.8), '#7be04a', 1.3); line(c, [ax - 3.6, ay - 4, ax + 3.6, ay - 4], OL, 1); shape(c, poly(ax - 1.5, ay - 1, ax + 1.5, ay - 2, ax - 0.5, ay + 3), '#ffcb3d', 0.6); break;
    case 'disco_fisico': shape(c, el(ax, ay, 6.4, 6.4), '#e5e7eb', 1.3); c.beginPath(); c.arc(ax, ay, 4.2, -0.6, 0.9); c.strokeStyle = '#ff8fd0'; c.lineWidth = 1.2; c.stroke(); dot(c, ax, ay, 1.6, OL); break;
    case 'alfombrilla': shape(c, rr(ax - 8, ay + 1, 16, 5, 1.6), '#2b2d42', 1.2); line(c, [ax - 6, ay + 3.5, ax + 6, ay + 3.5], '#a855f7', 1.1); break;
    case 'boton_pausa': shape(c, el(ax, ay, 5.8, 5.8), '#ff3348', 1.3); c.fillStyle = '#fff6ea'; c.fillRect(ax - 2.6, ay - 2.6, 1.8, 5.2); c.fillRect(ax + 0.8, ay - 2.6, 1.8, 5.2); break;
    default: if (EQ_NUEVOS.acc[E.acc]) EQ_NUEVOS.acc[E.acc](c, ax, ay, ny);
  }
  c.restore();
}
function drawWeapon(c, id, hx, hdy) {   // v0.9.15: las armas del gashapón (la mano está en hx, hdy)
  switch (id) {
    case 'zanahoria_oro': c.save(); c.translate(hx + 1, hdy - 4); c.rotate(0.25); shape(c, c2 => { c2.moveTo(-3.6, -14); c2.quadraticCurveTo(0, -17, 3.6, -14); c2.lineTo(0.8, 6); c2.quadraticCurveTo(0, 7.4, -0.8, 6); c2.closePath(); }, '#ffcb3d', 1.4); shape(c, poly(-1, -15, -4, -21, 0, -17, 3, -22, 1.4, -15), '#5cc23a', 1.1); c.restore(); break;
    case 'raton_campeon': shape(c, el(hx + 3, hdy - 3, 4.6, 6), '#ffcb3d', 1.4); line(c, [hx + 3, hdy - 9, hx + 3, hdy - 5], OL, 1); dot(c, hx + 3, hdy - 1, 1.2, '#22c55e'); break;
    case 'claqueta_oro': c.save(); c.translate(hx + 2, hdy - 5); c.rotate(-0.3); shape(c, rr(-7, -4, 14, 9, 1), '#ffcb3d', 1.4); shape(c, poly(-7, -4, -6, -9, 7, -9, 7, -4), '#1f2937', 1.2); c.restore(); break;
    case 'espada_carton': line(c, [hx, hdy, hx + 4, hdy - 16], OL, 4.4); line(c, [hx, hdy, hx + 4, hdy - 16], '#c8a27a', 2.6); line(c, [hx - 3, hdy - 2, hx + 3, hdy], OL, 2.4); break;
    case 'raton_dpi': shape(c, el(hx + 3, hdy - 2, 4, 5.4), '#1f2937', 1.4); line(c, [hx + 3, hdy - 7, hx + 3, hdy - 4], '#22e3ff', 1); dot(c, hx + 3, hdy, 1.2, '#ff3df0'); break;
    case 'teclado_rgb': c.save(); c.translate(hx + 2, hdy - 2); c.rotate(-0.5); shape(c, rr(-8, -3, 16, 6, 1.4), '#1f2937', 1.3); ['#ff3348', '#ffcb3d', '#7be04a', '#22e3ff', '#a855f7'].forEach((col, i) => { c.fillStyle = col; c.fillRect(-6.6 + i * 2.8, -1.4, 2, 2.6); }); c.restore(); break;
    case 'banhammer_oro': line(c, [hx, hdy, hx + 3, hdy - 14], OL, 3.6); line(c, [hx, hdy, hx + 3, hdy - 14], '#8a5a33', 2); c.save(); c.translate(hx + 3, hdy - 16); c.rotate(0.3); shape(c, rr(-7, -4, 14, 8, 2), '#ffcb3d', 1.4); c.restore(); break;
    case 'mando_cable': c.beginPath(); c.moveTo(hx, hdy - 4); c.quadraticCurveTo(hx - 14, hdy - 16, hx - 6, hdy - 28); c.strokeStyle = OL; c.lineWidth = 1.4; c.stroke(); shape(c, rr(hx - 7, hdy - 7, 14, 8, 3.4), '#2b2d42', 1.3); dot(c, hx - 3.5, hdy - 3, 1.2, '#ff3348'); dot(c, hx + 3.5, hdy - 3, 1.2, '#22e3ff'); break;
    case 'baguette': c.save(); c.translate(hx + 2, hdy - 9); c.rotate(0.5); shape(c, rr(-3.2, -15, 6.4, 28, 3.2), '#d9a35f', 1.4); for (const yy of [-9, -3, 3, 9]) line(c, [-1.8, yy, 1.8, yy - 2], '#a86b2d', 1); c.restore(); break;
    case 'lanzaconfeti': shape(c, poly(hx - 2.5, hdy, hx + 2.5, hdy, hx + 7, hdy - 15, hx - 7, hdy - 15), '#ffcb3d', 1.4); line(c, [hx - 5, hdy - 9, hx + 5, hdy - 9], '#ff3df0', 1.2); dot(c, hx - 5, hdy - 19, 1.5, '#ff5fa8'); dot(c, hx + 1, hdy - 21, 1.5, '#7be04a'); dot(c, hx + 6, hdy - 18, 1.5, '#63cfe0'); break;
    default: if (EQ_NUEVOS.weapon[id]) EQ_NUEVOS.weapon[id](c, hx, hdy);
  }
}
