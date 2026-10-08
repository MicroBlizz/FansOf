// Fans of Skate · prototipo técnico. Carriles arriba/abajo; el avance y los disparos son automáticos (como Skateboard Knight).
// Cada héroe va sobre su vehículo temático (dibujado aquí) y los enemigos, la música y las cifras son los de Fans of Rumble (core/ y games/rumble/).
'use strict';

/* ---------- ajustes del prototipo ---------- */
const SK_W = 960, SK_H = 540;
const SK_LANES = [240, 340, 440];       // suelo de cada carril, de arriba abajo
const SK_CALZADA = [190, 490];          // límites de la calzada de adoquines
const SK_HERO_X = 170;
const SK_VIDA = 5;
const SK_BOSS_T = 60;
const SK_OLA_T = 15;                    // cada cuántos segundos sube la oleada
const SK_ESCALA_HEROE = 1.15, SK_ESCALA_ENEMIGO = 1.4;
const SK_COLOR = { animales: '#ff8a1f', nomuertos: '#9d6bff', streamers: '#c084fc', heroes: '#ffd34d', ciber: '#21e6ff', memes: '#ffe14d', gamer: '#8fe84a', olvidados: '#e0b06a', pop: '#ff6fb1', microblizz: '#ff4d4d', phony: '#ff8a8a' };

/* ---------- SAVE y volúmenes: los pide el motor de sonido del núcleo ---------- */
const SAVE = { muted: false, vol: 1, mus: 1 };
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : SAVE.vol; }
function volMusica() { return 0.3 * SAVE.mus; }

/* ---------- héroes y enemigos: salen de los datos de la serie ---------- */
const SK_HEROES = FACTION_ORDER.map(f => ({ fac: f, key: FACTIONS[f].leader, nombre: FACTIONS[f].name }));
const SK_ENEMIGOS = [...new Set(Object.keys(FACTIONS).flatMap(f => FACTIONS[f].units || []))];
const SK_JEFES = ['kaiju', 'ceo', 'presi', 'banhammer'].filter(k => ART[k]);
const skU = k => SK_UNIDADES[k] || { hp: 150, speed: 40, dmg: 15, cd: 1, range: 8, r: 12 };
const skHp = k => Math.max(1, Math.round(skU(k).hp / 150));
const skRand = a => a[Math.floor(Math.random() * a.length)];
const skHeroe = fac => SK_HEROES.find(h => h.fac === fac);

/* ---------- cartas de subida de nivel ---------- */
const SK_ARMAS = {
  hacha: { titulo: 'Hacha giratoria', desc: 'Un hacha que da vueltas y pega a todo lo de tu carril.', cd: 1.4, dmg: 1, color: '#ffb04f', letra: 'H' },
  rayo:  { titulo: 'Rayo', desc: 'Cae un rayo sobre el enemigo más cercano, en cualquier carril.', cd: 2.2, dmg: 2, color: '#21e6ff', letra: 'R' },
  onda:  { titulo: 'Onda de choque', desc: 'Un anillo que daña a todos los enemigos cerca de ti.', cd: 3, dmg: 1, color: '#ff6fb1', letra: 'O' },
};
const SK_PASIVAS = [
  { id: 'fuerza', titulo: 'Fuerza', color: '#ff8a1f', letra: 'F', desc: '+25 % de daño con todas tus armas.' },
  { id: 'cadencia', titulo: 'Cadencia', color: '#8fe84a', letra: 'C', desc: 'Disparas un 15 % más rápido.' },
  { id: 'turbo', titulo: 'Turbo mejorado', color: '#21e6ff', letra: 'T', desc: 'El turbo dura un 50 % más.' },
  { id: 'vida', titulo: 'Vida máxima', color: '#ff5b5b', letra: '♥', desc: '+1 de vida máxima y +1 de vida ahora.' },
];
const SK_CLASES = {
  paladin: { titulo: 'Paladín', color: '#ffd34d', letra: 'P', desc: '+30 % de daño y +3 de vida máxima. Tu cuerpo aguanta más.' },
  maestro: { titulo: 'Maestro de armas', color: '#c084fc', letra: 'M', desc: 'Tus armas y disparos van un 30 % más rápidos y hacen +20 % de daño.' },
};
const SK_XP = () => SK.nivel * 3;   // cristales de XP para subir de nivel
/* ---------- árbol de talentos: se compra con ORO (que también se gana en partida) ---------- */
const SK_TALENTOS = [
  { id: 'o1', rama: 0, req: null, titulo: 'Filo', desc: '+15 % de daño.', coste: 20, efecto: s => { s.bonusDmg += 0.15; } },
  { id: 'o2', rama: 0, req: 'o1', titulo: 'Ritmo', desc: '+15 % de cadencia.', coste: 40, efecto: s => { s.mej.cadencia += 1; } },
  { id: 'o3', rama: 0, req: 'o2', titulo: 'Hacha inicial', desc: 'Empiezas con un Hacha giratoria.', coste: 80, efecto: s => { s.armas.push({ id: 'hacha', nivel: 1, t: SK_ARMAS.hacha.cd }); } },
  { id: 'd1', rama: 1, req: null, titulo: 'Corazón', desc: '+1 de vida máxima.', coste: 20, efecto: s => { s.vidaMax += 1; s.hp = s.vidaMax; } },
  { id: 'd2', rama: 1, req: 'd1', titulo: 'Escudo', desc: 'Más tiempo invulnerable tras un golpe (+0,4 s).', coste: 40, efecto: s => { s.invDur += 0.4; } },
  { id: 'd3', rama: 1, req: 'd2', titulo: 'Regeneración', desc: 'Recuperas 1 de vida al subir de nivel.', coste: 80, efecto: s => { s.regen = true; } },
  { id: 'f1', rama: 2, req: null, titulo: 'Cartera', desc: '+25 % de ORO en partida.', coste: 20, efecto: s => { s.oroMult *= 1.25; } },
  { id: 'f2', rama: 2, req: 'f1', titulo: 'Mente', desc: '+20 % de XP.', coste: 40, efecto: s => { s.xpMult *= 1.2; } },
  { id: 'f3', rama: 2, req: 'f2', titulo: 'Turbo fácil', desc: 'El turbo se activa cada 7 s en vez de 10.', coste: 80, efecto: s => { s.turboCd = 7; } },
];
function skCartera() { try { return JSON.parse(localStorage.getItem('sk-cartera-v1')) || { oro: 0, compras: [] }; } catch (e) { return { oro: 0, compras: [] }; } }
function skGuardaCartera(w) { try { localStorage.setItem('sk-cartera-v1', JSON.stringify(w)); } catch (e) { /* sin almacenamiento: el oro dura lo que la pestaña */ } }
function skAplicaTalentos(s) { const w = skCartera(); for (const t of SK_TALENTOS) if (w.compras.includes(t.id)) t.efecto(s); }

/* ---------- campaña: los 12 mundos de Fans of Rumble (SK_MUNDOS) con sus enemigos ---------- */
const SK_JEFE_DE = { microblizz: 'ceo', phony: 'presi' };   // el jefe de cada mundo: su líder (o el CEO / el Presidente)
const SK_DIFS = { f: { nombre: 'Fácil', hp: 0.7, vel: 0.9, spawn: 1.3, pago: 0.5 }, n: { nombre: 'Normal', hp: 1, vel: 1, spawn: 1, pago: 1 }, h: { nombre: 'Difícil', hp: 1.6, vel: 1.15, spawn: 0.75, pago: 2 } };
function skCampLeer() { try { return JSON.parse(localStorage.getItem('sk-campana-v1')) || { hechos: {}, dif: 'n' }; } catch (e) { return { hechos: {}, dif: 'n' }; } }
function skCampGuarda(c) { try { localStorage.setItem('sk-campana-v1', JSON.stringify(c)); } catch (e) { /* sin almacenamiento */ } }
// un mundo se abre cuando se ha superado el jefe del anterior (el primero siempre está abierto)
function skMundoAbierto(wi) { return wi === 0 || !!skCampLeer().hechos[(wi - 1) + '-3']; }
function skNivelAbierto(wi, li) { return li === 0 || !!skCampLeer().hechos[wi + '-' + (li - 1)]; }

/* ---------- estado ---------- */
const SK = { estado: 'menu', fac: 'animales', t: 0, dist: 0, kills: 0, xp: 0, nivel: 1, lane: 1, hy: SK_LANES[1], hp: SK_VIDA,
  inv: 0, cd: 0, anim: 0, boost: 0, boostCd: 10, enemigos: [], disparos: [], drops: [], parts: [], spawnT: 1, bossHecho: false,
  sacudida: 0, jefeVivo: null, aviso: null, avisoT: 0, menuIdx: 0, pausa: false, pendientes: 0, ataques: [], armas: [], mej: { fuerza: 0, cadencia: 0, turbo: 0 }, clase: null, claseOferta: false, cdMult: 1, bonusDmg: 0, vidaMax: SK_VIDA, destellos: [], anillos: [], giro: 0, opciones: null, oro: 0, oroMult: 1, xpMult: 1, invDur: 1.2, regen: false, turboCd: 10, volt: 0 };
const SK_CV = document.getElementById('cv');
const SKC = SK_CV.getContext('2d');
let skPolvoT = 0;

/* ---------- utilidades de dibujo ---------- */
function skRR(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function skTexto(c, txt, x, y, size, color = '#fff', align = 'left') {
  c.font = `900 ${size}px "Trebuchet MS", Arial, sans-serif`; c.textAlign = align;
  c.lineWidth = Math.max(3, size / 5); c.strokeStyle = OL; c.strokeText(txt, x, y);
  c.fillStyle = color; c.fillText(txt, x, y); c.textAlign = 'left';
}
function skSombra(c, x, y, rx, ry, a = 0.35) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = `rgba(20,8,30,${a})`; c.fill(); }

/* ---------- vehículos temáticos (origen en el suelo, bajo las ruedas) ---------- */
function skRuedas(c, t, x1, x2, y, r) {
  for (const x of [x1, x2]) {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = '#1b1426'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.arc(x, y, r * 0.45, 0, Math.PI * 2); c.fillStyle = '#c9d3e0'; c.fill();
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(t) * r * 0.8, y + Math.sin(t) * r * 0.8); c.strokeStyle = '#8ea0b5'; c.lineWidth = 1.4; c.stroke();
  }
}
function skVehiculo(c, fac, t, col) {
  // brillo de neón bajo el vehículo
  c.save(); c.shadowColor = col; c.shadowBlur = 14;
  shape(c, rr(-38, -12, 76, 7, 3.5), '#3d2a4d', 1.8);
  shape(c, rr(-34, -11, 60, 2.5, 1.2), 'rgba(255,255,255,.35)', 0);
  if (fac === 'animales') {
    shape(c, poly(24, -34, 24, -14, -34, -22), '#ff8a1f', 2);
    shape(c, poly(24, -34, 32, -46, 27, -34, 36, -41, 22, -30), '#3fa62a', 2);
    skRuedas(c, t, -22, 20, -6, 8);
  } else if (fac === 'nomuertos') {
    shape(c, el(0, -24, 24, 17), '#d7d2c4', 2.2);
    dot(c, -8, -26, 3.5, OL); dot(c, 8, -26, 3.5, OL);
    skRuedas(c, t, -18, 18, -6, 7);
  } else if (fac === 'streamers') {
    shape(c, rr(-30, -40, 60, 30, 6), '#7a3cff', 2.2);
    shape(c, rr(-22, -35, 44, 18, 3), '#20e3ff', 1.6);
    skRuedas(c, t, -20, 20, -6, 7);
  } else if (fac === 'heroes') {
    shape(c, poly(-24, -42, 24, -42, 24, -20, 0, -6, -24, -20), '#ffd34d', 2.2);
    shape(c, poly(-8, -36, 8, -36, 8, -22, 0, -14, -8, -22), '#fff3b0', 1.4);
    skRuedas(c, t, -18, 18, -6, 7);
  } else if (fac === 'ciber') {
    shape(c, rr(-34, -20, 68, 9, 4), '#21e6ff', 2);
    c.beginPath(); c.ellipse(0, -10, 40, 4, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(33,230,255,.35)'; c.fill();
  } else if (fac === 'memes') {
    shape(c, rr(-28, -40, 56, 32, 4), '#ffe14d', 2.2);
    line(c, [-20, -30, 20, -30], OL, 2); line(c, [-20, -20, 14, -20], OL, 2);
    skRuedas(c, t, -18, 18, -6, 7);
  } else if (fac === 'gamer') {
    shape(c, rr(-30, -36, 60, 24, 10), '#3a3a4d', 2.2);
    dot(c, -16, -24, 3, '#8fe84a'); dot(c, 16, -24, 3, '#ff6fb1');
    skRuedas(c, t, -20, 20, -6, 6);
  } else if (fac === 'olvidados') {
    shape(c, rr(-32, -38, 64, 32, 3), '#3b2b4f', 2.2);
    dot(c, -14, -26, 7, '#e9e4f5'); dot(c, 14, -26, 7, '#e9e4f5');
    skRuedas(c, t, -20, 20, -6, 7);
  } else {
    const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 12 : 26; p.push(Math.cos(a) * r, -28 + Math.sin(a) * r); }
    shape(c, poly(...p), '#ff6fb1', 2);
    skRuedas(c, t, -18, 18, -6, 7);
  }
  c.restore();
}
function skRider(c, key, x, y, s, flip = 1) {
  c.save(); c.translate(x, y); c.scale(s * flip, s); c.lineJoin = 'round'; c.lineCap = 'round'; ART[key](c); c.restore();
}

/* ---------- fondo: atardecer, ciudad en capas, calzada de adoquines ---------- */
const SK_EDIF_LEJOS = Array.from({ length: 16 }, (_, i) => ({ x: i * 110 + ((i * 37) % 40), w: 70 + ((i * 53) % 60), h: 110 + ((i * 71) % 110) }));
const SK_EDIF_CERCA = Array.from({ length: 12 }, (_, i) => ({ x: i * 150 + ((i * 29) % 50), w: 110 + ((i * 47) % 70), h: 170 + ((i * 61) % 90) }));
function skFondo(c, t) {
  // cielo
  const g = c.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, '#2b1450'); g.addColorStop(0.45, '#7a2f7d'); g.addColorStop(0.8, '#ff7a5c'); g.addColorStop(1, '#ffb56b');
  c.fillStyle = g; c.fillRect(0, 0, SK_W, 300);
  // sol
  const sol = c.createRadialGradient(780, 120, 10, 780, 120, 160); sol.addColorStop(0, 'rgba(255,240,190,1)'); sol.addColorStop(0.3, 'rgba(255,200,120,.6)'); sol.addColorStop(1, 'rgba(255,120,80,0)');
  c.fillStyle = sol; c.fillRect(600, 0, 360, 300);
  // nubes que se desplazan
  c.fillStyle = 'rgba(255,220,240,.22)';
  for (let i = 0; i < 4; i++) { const x = ((i * 300 - t * 14) % 1200 + 1200) % 1200 - 120; c.beginPath(); c.ellipse(x, 90 + (i % 2) * 40, 90, 18, 0, 0, Math.PI * 2); c.fill(); }
  // ciudad lejana (parallax lento)
  const off1 = (t * 12) % 110;
  c.fillStyle = '#4a2a6a';
  for (const b of SK_EDIF_LEJOS) { const x = b.x - off1; c.fillRect(x, 300 - b.h, b.w, b.h); }
  c.fillStyle = 'rgba(255,200,120,.45)';
  for (const b of SK_EDIF_LEJOS) for (let wy = 300 - b.h + 14; wy < 290; wy += 26) for (let wx = 8; wx < b.w - 10; wx += 16) if ((b.x + wx + wy) % 3) c.fillRect(b.x - off1 + wx, wy, 5, 7);
  // ciudad cercana, de piedra
  const off2 = (t * 30) % 150;
  for (const b of SK_EDIF_CERCA) {
    const x = b.x - off2;
    c.fillStyle = '#5b4370'; c.fillRect(x, 300 - b.h, b.w, b.h);
    c.fillStyle = '#3f2d52'; c.beginPath(); c.moveTo(x - 6, 300 - b.h); c.lineTo(x + b.w / 2, 300 - b.h - 30); c.lineTo(x + b.w + 6, 300 - b.h); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,190,110,.75)';
    for (let wy = 300 - b.h + 22; wy < 280; wy += 36) for (let wx = 14; wx < b.w - 20; wx += 30) c.fillRect(x + wx, wy, 10, 14);
  }
  // suelo: adoquines de piedra
  c.fillStyle = '#2d6b3a'; c.fillRect(0, 300, SK_W, 240);
  c.fillStyle = '#e0a64a'; c.fillRect(0, 296, SK_W, 6);
  c.fillStyle = '#3e3a4d'; c.fillRect(0, SK_CALZADA[0] - 12, SK_W, SK_CALZADA[1] - SK_CALZADA[0] + 24);
  c.fillStyle = '#6b6478'; c.fillRect(0, SK_CALZADA[0], SK_W, SK_CALZADA[1] - SK_CALZADA[0]);
  const cw = 64, ch = 50, offR = (t * 220) % cw;
  for (let row = 0; row < 3; row++) for (let x = -offR - (row % 2) * (cw / 2); x < SK_W + cw; x += cw) {
    const y = SK_CALZADA[0] + 8 + row * ch;
    c.fillStyle = (Math.floor(x / cw) + row) % 2 ? '#7c7589' : '#6a6378';
    skRR(c, x + 2, y, cw - 4, ch - 6, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 6, y + 3, cw - 16, 3);
  }
  // líneas de carril discontinuas
  for (let i = 0; i < 2; i++) { const y = (SK_LANES[i] + SK_LANES[i + 1]) / 2; c.fillStyle = 'rgba(255,240,200,.45)'; for (let x = -((t * 300) % 70); x < SK_W; x += 70) c.fillRect(x, y - 2, 36, 4); }
  // indicadores de carril en el borde
  for (let i = 0; i < SK_LANES.length; i++) { c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(SK_HERO_X - 60, SK_LANES[i] - 2, 4, 4); }
}

/* ---------- dibujar entidades ---------- */
function skDibujaEnemigo(c, e) {
  const bob = e.dead ? 0 : Math.sin(e.anim) * 3;
  c.save();
  if (e.dead) c.globalAlpha = Math.max(0, e.deadT / 0.4);
  skSombra(c, e.x, e.y + 4, 22 * SK_ESCALA_ENEMIGO / 1.2, 7);
  if (e.elite) { c.shadowColor = '#ff3b3b'; c.shadowBlur = 18; }
  skRider(c, e.key, e.x, e.y + bob, SK_ESCALA_ENEMIGO, -1);
  c.restore();
}
function skDibujaHeroe(c, S) {
  if (S.inv > 0 && Math.floor(S.inv * 14) % 2 === 0) return;
  const bob = Math.sin(S.anim) * 2.5;
  const col = SK_COLOR[S.fac] || '#fff';
  const enVolt = S.volt > 0;
  const p = enVolt ? 1 - S.volt / 0.5 : 0;
  const salto = enVolt ? Math.sin(p * Math.PI) * 34 : 0;
  const y = S.hy + bob - salto;
  skSombra(c, SK_HERO_X, S.hy + 4, 34 - salto * 0.3, 9, 0.45);
  c.save();
  if (enVolt) { const cy = y - 25; c.translate(SK_HERO_X, cy); c.rotate(p * Math.PI * 2); c.translate(-SK_HERO_X, -cy); }
  c.save(); c.translate(SK_HERO_X, y); c.scale(SK_ESCALA_HEROE, SK_ESCALA_HEROE); skVehiculo(c, S.fac, S.anim * 0.9, col); c.restore();
  skRider(c, skHeroe(S.fac).key, SK_HERO_X, y - 30 * SK_ESCALA_HEROE + 6, SK_ESCALA_HEROE * 1.05);
  c.restore();
}
function skDibujaDisparos(c, S) {
  for (const d of S.disparos) {
    const y = SK_LANES[d.lane] - 36;
    c.save(); c.shadowColor = d.col; c.shadowBlur = 16;
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(d.x - 26, y, 22, 4, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(d.x, y, 9, 0, Math.PI * 2); c.fillStyle = d.col; c.fill(); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke();
    c.beginPath(); c.arc(d.x - 2, y - 3, 3, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    c.restore();
  }
}
function skDibujaDrops(c, S) {
  for (const d of S.drops) {
    const y = SK_LANES[d.lane] - 14 + Math.sin(S.anim * 0.8 + d.x) * 3;
    if (d.tipo === 'oro') {
      c.save(); c.shadowColor = '#ffd34d'; c.shadowBlur = 12;
      c.beginPath(); c.arc(d.x, y, 9, 0, Math.PI * 2); c.fillStyle = '#ffd34d'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
      c.shadowBlur = 0; c.fillStyle = '#7a4d00'; c.font = '900 13px Arial'; c.textAlign = 'center'; c.fillText('$', d.x, y + 5); c.textAlign = 'left';
      c.restore(); continue;
    }
    c.save(); c.shadowColor = '#9af7ff'; c.shadowBlur = 14;
    c.beginPath(); c.moveTo(d.x, y - 9); c.lineTo(d.x + 6, y); c.lineTo(d.x, y + 9); c.lineTo(d.x - 6, y); c.closePath();
    c.fillStyle = '#7ef0ff'; c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
    c.restore();
  }
}
function skDibujaArmas(c, S) {
  if (S.armas.some(a => a.id === 'hacha')) {
    const d = SK_ARMAS.hacha, cx = SK_HERO_X, cy = S.hy - 30 * SK_ESCALA_HEROE * 0.5;
    for (let k = 0; k < 2; k++) {
      const a = S.giro + k * Math.PI;
      c.save(); c.translate(cx, cy); c.rotate(a); c.shadowColor = d.color; c.shadowBlur = 12;
      c.beginPath(); c.arc(0, 0, 58, -0.35, 0.35); c.strokeStyle = d.color; c.lineWidth = 6; c.lineCap = 'round'; c.stroke(); c.restore();
    }
  }
  for (const r of S.anillos) { c.save(); c.globalAlpha = Math.max(0, r.vida / r.max); c.strokeStyle = r.col; c.lineWidth = 6; c.shadowColor = r.col; c.shadowBlur = 18; c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2); c.stroke(); c.restore(); }
  for (const d of S.destellos) { c.save(); c.globalAlpha = Math.max(0, d.vida / d.max); c.strokeStyle = d.col; c.lineWidth = 6; c.shadowColor = d.col; c.shadowBlur = 20; c.beginPath(); c.moveTo(d.x1, d.y1); c.lineTo(d.x2, d.y2); c.stroke(); c.restore(); }
}
function skDibujaParticulas(c, S) {
  for (const p of S.parts) {
    const a = Math.max(0, p.vida / p.max);
    c.globalAlpha = a; c.fillStyle = p.col;
    c.beginPath(); c.arc(p.x, p.y, p.r * (0.5 + 0.5 * a), 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
}

/* ---------- marcador: retrato, vida, nivel, oleada, habilidades ---------- */
function skDibujaMarcador(c, S) {
  // panel izquierdo: retrato + vida + nivel
  c.save();
  c.fillStyle = 'rgba(20,8,30,.72)'; skRR(c, 12, 12, 290, 92, 14); c.fill();
  c.lineWidth = 3; c.strokeStyle = SK_COLOR[S.fac] || '#fff'; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.08)'; skRR(c, 20, 20, 70, 76, 10); c.fill();
  c.beginPath(); c.save(); skRR(c, 20, 20, 70, 76, 10); c.clip();
  skRider(c, skHeroe(S.fac).key, 55, 90, 0.95); c.restore();
  // barra de vida
  const hpPct = Math.max(0, S.hp) / S.vidaMax;
  c.fillStyle = '#20102c'; skRR(c, 102, 30, 186, 22, 8); c.fill();
  c.fillStyle = hpPct > 0.4 ? '#5be36a' : '#ff5b5b'; skRR(c, 105, 33, 180 * hpPct, 16, 6); c.fill();
  c.lineWidth = 2; c.strokeStyle = OL; skRR(c, 102, 30, 186, 22, 8); c.stroke();
  skTexto(c, `${Math.max(0, S.hp)}/${S.vidaMax}`, 195, 49, 14, '#fff', 'center');
  // nivel y XP
  const need = SK_XP();
  skTexto(c, `NIVEL ${S.nivel}`, 102, 84, 20, '#ffd34d');
  c.fillStyle = '#20102c'; skRR(c, 190, 70, 98, 14, 6); c.fill();
  c.fillStyle = '#9af7ff'; skRR(c, 192, 72, 94 * Math.min(1, S.xp / need), 10, 4); c.fill();
  c.restore();
  // centro: oleada y distancia
  c.save();
  c.fillStyle = 'rgba(20,8,30,.72)'; skRR(c, SK_W / 2 - 150, 12, 300, 52, 14); c.fill();
  skTexto(c, `OLEADA ${Math.floor(S.t / SK_OLA_T) + 1}`, SK_W / 2, 36, 22, '#fff', 'center');
  skTexto(c, `${Math.floor(S.dist)} m · ${S.kills} bajas · ORO ${S.oro}`, SK_W / 2, 56, 13, '#ffd9f0', 'center');
  c.restore();
  // armas equipadas (a la izquierda de las habilidades)
  S.armas.forEach((a, k) => {
    const d = SK_ARMAS[a.id], x = SK_W - 150 - 72 * (k + 1), y = 12;
    c.save(); c.fillStyle = 'rgba(20,8,30,.72)'; skRR(c, x, y, 62, 62, 10); c.fill();
    c.lineWidth = 3; c.strokeStyle = d.color; c.stroke(); c.restore();
    skTexto(c, d.letra, x + 31, y + 42, 26, d.color, 'center');
    skTexto(c, 'Nv ' + a.nivel, x + 31, y + 78, 11, '#fff', 'center');
  });
  // derecha: habilidades con cooldown
  const skills = [
    { n: 'Disparo', ico: SK_COLOR[S.fac], cd: skU(skHeroe(S.fac).key).cd, left: S.cd },
    { n: 'Turbo', ico: '#21e6ff', cd: S.boostCd, left: S.boost > 0 ? S.boost : S.boostCd },
  ];
  skills.forEach((s, i) => {
    const x = SK_W - 150 + i * 72, y = 12;
    c.save();
    c.fillStyle = 'rgba(20,8,30,.72)'; skRR(c, x, y, 62, 62, 10); c.fill();
    c.lineWidth = 3; c.strokeStyle = s.ico; c.stroke();
    const f = s.cd > 0 ? Math.min(1, s.left / s.cd) : 0;
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.moveTo(x + 31, y + 31); c.arc(x + 31, y + 31, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); c.closePath(); c.fill();
    c.beginPath(); c.arc(x + 31, y + 31, 10, 0, Math.PI * 2); c.fillStyle = s.ico; c.shadowColor = s.ico; c.shadowBlur = 12; c.fill();
    c.restore();
    skTexto(c, s.n, x + 31, y + 78, 11, '#fff', 'center');
  });
  // aviso (subida de nivel, jefe)
  if (S.avisoT > 0) { c.globalAlpha = Math.min(1, S.avisoT); skTexto(c, S.aviso, SK_W / 2, 150, 40, '#ffd34d', 'center'); c.globalAlpha = 1; }
}

function skDibujaTodo(c) {
  const S = SK;
  c.save();
  if (S.sacudida > 0) c.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
  skFondo(c, S.t);
  skDibujaDrops(c, S);
  const orden = S.enemigos.slice().sort((a, b) => a.y - b.y);
  for (const e of orden) skDibujaEnemigo(c, e);
  if (S.estado !== 'menu') skDibujaHeroe(c, S);
  skDibujaDisparos(c, S);
  skDibujaArmas(c, S);
  skDibujaAtaques(c, S);
  skDibujaParticulas(c, S);
  c.restore();
  if (S.estado !== 'menu') skDibujaMarcador(c, S);
  if (S.estado === 'juega' && S.t >= SK_BOSS_T - 4 && !S.bossHecho) skTexto(c, '¡JEFE EN CAMINO!', SK_W / 2, 220, 26, '#ff6fb1', 'center');
}

/* ---------- lógica ---------- */
function skSpawn(key, carril, extra = {}) {
  const k = key || (SK.pool ? skRand(SK.pool) : skRand(SK_ENEMIGOS));
  const y = SK_LANES[carril], d = SK.dif || SK_DIFS.n, nivel = SK.elvl || 1;
  SK.enemigos.push({ key: k, lane: carril, x: SK_W + 60, y, vel: extra.vel || (skU(k).speed * 2.5 + SK.t * 1.2) * d.vel,
    hp: extra.hp || Math.max(1, Math.round(skHp(k) * d.hp * (1 + 0.15 * (nivel - 1)))), dead: false, deadT: 0.4, anim: Math.random() * 6,
    r: extra.r || 34, jefe: !!extra.jefe, escala: extra.escala || SK_ESCALA_ENEMIGO, elite: !extra.jefe && SK.t > 90 && Math.random() < 0.25, disparoT: 2 + Math.random() * 2 });
}
function skSpawnOla() {
  const n = Math.random() < 0.35 ? 2 : 1;
  const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, n);
  for (const l of lanes) skSpawn(null, l);
}
function skSpawnJefe() {
  if (!SK_JEFES.length) return;
  skSpawn(SK.bossKey || skRand(SK_JEFES), 1, { vel: 60, hp: Math.round(30 * (SK.dif || SK_DIFS.n).hp), r: 70, jefe: true, escala: 2.1 });
  SK.jefeVivo = SK.enemigos[SK.enemigos.length - 1];
  SK.aviso = '¡JEFE!'; SK.avisoT = 2;
  musicSet(TRACKS.boss0 ? 'boss0' : 'boss');
}
function skParte(x, y, col, n = 10, vel = 180) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = Math.random() * vel; SK.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, r: 4 + Math.random() * 5, col, vida: 0.5 + Math.random() * 0.4, max: 0.9 }); }
}
function skDisparaEnemigo(e) {
  const S = SK;
  if (e.jefe) {
    if (Math.random() < 0.5) {
      S.ataques.push({ tipo: 'ola', lane: e.lane, x: e.x - 60, w: 120, vel: 600 + S.t * 2, dmg: 2 });
    } else {
      const libre = Math.floor(Math.random() * 3);
      for (let l = 0; l < 3; l++) if (l !== libre) S.ataques.push({ tipo: 'fajo', lane: l, x: e.x - 60, w: 96, vel: 480 + S.t * 2, dmg: 2 });
    }
    play('boom');
  } else {
    S.ataques.push({ tipo: 'fajo', lane: e.lane, x: e.x - 60, w: 84, vel: 420 + S.t * 2, dmg: 1 });
  }
}
function skDibujaAtaques(c, S) {
  for (const a of S.ataques) {
    const y = SK_LANES[a.lane];
    c.save();
    if (a.tipo === 'ola') {
      const g = c.createLinearGradient(a.x - a.w, 0, a.x, 0);
      g.addColorStop(0, 'rgba(126,240,255,0)'); g.addColorStop(0.7, 'rgba(126,240,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,.95)');
      c.shadowColor = '#7ef0ff'; c.shadowBlur = 24; c.fillStyle = g;
      skRR(c, a.x - a.w, y - 120, a.w, 150, 18); c.fill();
      c.lineWidth = 4; c.strokeStyle = '#ffffff'; c.beginPath(); c.moveTo(a.x, y - 120); c.lineTo(a.x, y + 30); c.stroke();
    } else {
      for (let k = 0; k < 2; k++) {
        const bx = a.x - a.w + k * 6, by = y - 52 - k * 10;
        c.shadowColor = '#7ef07a'; c.shadowBlur = 12;
        c.fillStyle = '#3fbf5a'; skRR(c, bx, by, a.w - 20, 40, 6); c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
        c.shadowBlur = 0; c.fillStyle = '#e8ffe0'; c.fillRect(bx + (a.w - 20) / 2 - 6, by + 4, 12, 32);
        skTexto(c, '$', bx + (a.w - 20) / 2, by + 30, 22, '#1f6b2c', 'center');
      }
    }
    c.restore();
  }
}
function skDaña(e, golpes) {
  const S = SK;
  if (e.dead) return;
  e.hp -= golpes;
  if (e.hp <= 0) {
    e.dead = true; S.kills++; play('pop');
    skParte(e.x, e.y - 30, '#ffffff', 14, 220);
    S.drops.push({ x: e.x, lane: e.lane, val: e.jefe ? 10 : 1 });
    if (e.jefe || Math.random() < 0.35) S.drops.push({ tipo: 'oro', x: e.x, lane: e.lane, val: e.jefe ? 30 : e.elite ? 5 : 1 });
    if (e.jefe) { S.aviso = '¡JEFE DERROTADO!'; S.avisoT = 3; if (S.campana) skCampVictoria(); }
  } else play('hit');
}
function skDmgArma(a) { return SK_ARMAS[a.id].dmg * (1 + 0.3 * (a.nivel - 1)) * (1 + 0.25 * SK.mej.fuerza + SK.bonusDmg); }
function skDisparaArma(a) {
  const S = SK, dmg = skDmgArma(a), col = SK_ARMAS[a.id].color;
  if (a.id === 'hacha') {
    for (const e of S.enemigos) if (!e.dead && e.lane === S.lane && e.x > SK_HERO_X - 60 && e.x < SK_HERO_X + 120) skDaña(e, dmg);
    S.anillos.push({ x: SK_HERO_X, y: S.hy - 30, r: 40, col, vida: 0.25, max: 0.25 });
  } else if (a.id === 'rayo') {
    let best = null;
    for (const e of S.enemigos) if (!e.dead && e.x > SK_HERO_X && (!best || e.x < best.x)) best = e;
    if (best) { S.destellos.push({ x1: best.x, y1: 0, x2: best.x, y2: best.y - 20, col, vida: 0.25, max: 0.25 }); skDaña(best, dmg); }
  } else if (a.id === 'onda') {
    const rad = 150 + 30 * (a.nivel - 1);
    for (const e of S.enemigos) if (!e.dead && Math.abs(e.x - SK_HERO_X) < rad) skDaña(e, dmg);
    S.anillos.push({ x: SK_HERO_X, y: S.hy, r: rad, col, vida: 0.5, max: 0.5 });
  }
}
function skUpdate(dt) {
  const S = SK;
  if (S.estado === 'victoria') { S.vicT -= dt; S.parts = S.parts.filter(p => (p.vida -= dt) > 0); if (S.vicT <= 0) skCampFinal(true); return; }
  if (S.estado !== 'juega' || S.pausa) {
    // menú, fin o pausa de subida de nivel: solo se mueven las partículas y los efectos
    S.parts = S.parts.filter(p => (p.vida -= dt) > 0);
    if (S.estado === 'juega') { S.anillos.forEach(r => r.vida -= dt); S.destellos.forEach(d => d.vida -= dt); S.anillos = S.anillos.filter(r => r.vida > 0); S.destellos = S.destellos.filter(d => d.vida > 0); }
    return;
  }
  S.t += dt;
  if (S.campana && !S.esBoss && S.t >= SK_BOSS_T) { skCampVictoria(); return; }
  const vel = Math.min(1 + S.t / 90, 2.2);
  S.dist += dt * 6 * vel;
  S.anim += dt * 12;
  S.giro += dt * 8;
  S.inv = Math.max(0, S.inv - dt);
  S.sacudida = Math.max(0, S.sacudida - dt);
  S.avisoT = Math.max(0, S.avisoT - dt);
  S.volt = Math.max(0, S.volt - dt);
  // turbo automático cada 10 s, dura 2 s (+50 % por cada punto de Turbo mejorado)
  S.boostCd -= dt; if (S.boostCd <= 0) { S.boost = 2 * (1 + 0.5 * S.mej.turbo); S.boostCd = S.turboCd; }
  if (S.boost > 0) S.boost -= dt; else S.boost = 0;
  S.hy += (SK_LANES[S.lane] - S.hy) * Math.min(1, dt * 12);
  skPolvoT -= dt; if (skPolvoT <= 0) { skPolvoT = 0.05; S.parts.push({ x: SK_HERO_X - 40, y: S.hy + 8, vx: -60 - Math.random() * 40, vy: -10 - Math.random() * 20, r: 3 + Math.random() * 3, col: 'rgba(230,220,255,.8)', vida: 0.45, max: 0.45 }); }
  // disparo principal (cadencia y turbo)
  const ritmo = (S.boost > 0 ? 2 : 1) * (1 + 0.15 * S.mej.cadencia) / S.cdMult;
  S.cd -= dt * ritmo;
  if (S.cd <= 0) {
    const hu = skU(skHeroe(S.fac).key);
    S.cd = hu.cd;
    S.disparos.push({ lane: S.lane, x: SK_HERO_X + 60, vx: 620, dmg: hu.dmg * (1 + 0.25 * S.mej.fuerza + S.bonusDmg), col: SK_COLOR[S.fac] || '#fff' });
    play('blip');
  }
  // armas automáticas
  for (const a of S.armas) { a.t -= dt * (S.boost > 0 ? 2 : 1); if (a.t <= 0) { a.t = SK_ARMAS[a.id].cd * Math.pow(0.9, a.nivel - 1) / S.cdMult; skDisparaArma(a); } }
  for (const d of S.disparos) d.x += d.vx * dt;
  // aparición y jefe
  S.spawnT -= dt;
  if (S.spawnT <= 0) { skSpawnOla(); S.spawnT = Math.max(0.5, 1.4 - S.t * 0.012) * (S.dif ? S.dif.spawn : 1); }
  if (!S.bossHecho && S.t >= SK_BOSS_T) { S.bossHecho = true; skSpawnJefe(); }
  // enemigos
  for (const e of S.enemigos) {
    if (e.dead) { e.deadT -= dt; continue; }
    e.x -= e.vel * dt;
    e.anim += dt * 8;
    e.y = SK_LANES[e.lane];
    for (const d of S.disparos) {
      if (d.hit || d.lane !== e.lane) continue;
      if (Math.abs(d.x - e.x) < e.r) { d.hit = true; skParte(d.x, e.y - 30, d.col, 4, 120); skDaña(e, Math.max(1, d.dmg / 25)); break; }
    }
    if (!e.dead && e.lane === S.lane && Math.abs(e.x - SK_HERO_X) < e.r + 20 && S.inv <= 0) {
      S.hp -= 1; S.inv = S.invDur; S.sacudida = 0.25; play('lose');
      skParte(SK_HERO_X + 30, S.hy - 30, '#ff5b5b', 12, 200);
      e.dead = true; e.deadT = 0.4;
      if (S.hp <= 0) { skFin(); return; }
    }
  }
  // ataques de élites y jefes (solo cuando la partida ya aprieta)
  for (const e of S.enemigos) {
    if (e.dead || S.t < 25 || !(e.jefe || e.elite || (SK_UNIDADES[e.key] && SK_UNIDADES[e.key].ranged))) continue;
    e.disparoT -= dt;
    if (e.disparoT <= 0) { skDisparaEnemigo(e); e.disparoT = e.jefe ? 2.6 : 3.6 + Math.random() * 1.5; }
  }
  for (const a of S.ataques) {
    a.x -= a.vel * dt;
    if (!a.hit && a.lane === S.lane && a.x > SK_HERO_X - 26 && a.x - a.w < SK_HERO_X + 26 && S.inv <= 0) {
      a.hit = true; S.hp -= a.dmg; S.inv = S.invDur; S.sacudida = 0.35; play('lose');
      skParte(SK_HERO_X, S.hy - 30, a.tipo === 'ola' ? '#7ef0ff' : '#7ef07a', 16, 240);
      if (S.hp <= 0) { skFin(); return; }
    }
  }
  S.ataques = S.ataques.filter(a => !a.hit && a.x > -200);
  // cristales de XP: al pasar por tu carril; al llenar la barra, subes de nivel
  for (const d of S.drops) {
    d.x -= 260 * dt;
    if (!d.hit && d.lane === S.lane && Math.abs(d.x - SK_HERO_X) < 40) {
      d.hit = true;
      if (d.tipo === 'oro') { S.oro += Math.round(d.val * S.oroMult); play('select'); }
      else { S.xp += d.val * S.xpMult; play('pop'); }
      while (S.xp >= SK_XP()) { S.xp -= SK_XP(); S.nivel++; S.pendientes++; if (S.regen) S.hp = Math.min(S.vidaMax, S.hp + 1); if (S.nivel === 20 && !S.clase) S.claseOferta = true; }
    }
  }
  S.drops = S.drops.filter(d => !d.hit && d.x > -40);
  S.enemigos = S.enemigos.filter(e => e.x > -160 && !(e.dead && e.deadT <= 0));
  S.disparos = S.disparos.filter(d => !d.hit && d.x < SK_W + 40);
  S.anillos.forEach(r => r.vida -= dt); S.anillos = S.anillos.filter(r => r.vida > 0);
  S.destellos.forEach(d => d.vida -= dt); S.destellos = S.destellos.filter(d => d.vida > 0);
  for (const p of S.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.vida -= dt; }
  S.parts = S.parts.filter(p => p.vida > 0);
  if (S.pendientes > 0) skAbreNivel();
}

/* ---------- subida de nivel: 3 o 4 cartas (o elegir clase en el nivel 20) ---------- */
function skOpciones() {
  const S = SK, res = [];
  if (S.claseOferta) {
    const recomendada = S.armas.length >= 2 ? 'maestro' : 'paladin';
    for (const id of ['paladin', 'maestro']) res.push({ tipo: 'clase', id, titulo: SK_CLASES[id].titulo, desc: SK_CLASES[id].desc + (id === recomendada ? ' (recomendada por tu partida)' : ''), color: SK_CLASES[id].color, letra: SK_CLASES[id].letra });
    return res;
  }
  const pool = [];
  for (const id of Object.keys(SK_ARMAS)) {
    const dueña = S.armas.find(a => a.id === id);
    if (!dueña && S.armas.length < 3) pool.push({ tipo: 'nueva', id, titulo: SK_ARMAS[id].titulo, desc: SK_ARMAS[id].desc, color: SK_ARMAS[id].color, letra: SK_ARMAS[id].letra, tag: 'NUEVA' });
    else if (dueña && dueña.nivel < 5) pool.push({ tipo: 'mejora', id, titulo: SK_ARMAS[id].titulo, desc: `Nivel ${dueña.nivel} → ${dueña.nivel + 1}: más daño y más rápida.`, color: SK_ARMAS[id].color, letra: SK_ARMAS[id].letra, tag: 'MEJORA' });
  }
  for (const p of SK_PASIVAS) pool.push({ tipo: 'pasiva', id: p.id, titulo: p.titulo, desc: p.desc, color: p.color, letra: p.letra, tag: 'PASIVA' });
  pool.sort(() => Math.random() - 0.5);
  const n = Math.random() < 0.3 ? 4 : 3;
  return pool.slice(0, Math.min(n, pool.length));
}
function skAbreNivel() {
  const S = SK;
  S.pausa = true;
  S.opciones = skOpciones();
  const ui = document.getElementById('sk-niv');
  const clase = S.claseOferta;
  ui.hidden = false;
  ui.innerHTML = `<h2 class="sk-niv-t">${clase ? '¡ELIGE TU CLASE!' : '¡NIVEL ' + S.nivel + '!'}</h2>
    <p>${clase ? 'Nivel 20: tus habilidades deciden tu evolución.' : 'Elige una mejora (1, 2, 3 o 4).'}</p>
    <div class="sk-cartas">${S.opciones.map((o, i) => `<button class="sk-carta" data-i="${i}" style="border-color:${o.color}">
      <div class="sk-icono" style="background:${o.color}">${o.letra}</div>
      <small class="sk-tag" style="color:${o.color}">${o.tag || 'CLASE'}</small>
      <b>${o.titulo}</b><p>${o.desc}</p></button>`).join('')}</div>`;
  ui.querySelectorAll('.sk-carta').forEach(b => b.onclick = () => skElige(+b.dataset.i));
  play('levelup');
}
function skElige(i) {
  const S = SK, o = S.opciones && S.opciones[i];
  if (!o || S.pausa === false) return;
  if (o.tipo === 'clase') {
    S.clase = o.id; S.claseOferta = false;
    if (o.id === 'paladin') { S.bonusDmg += 0.3; S.vidaMax += 3; S.hp += 3; }
    else { S.cdMult *= 1.3; S.bonusDmg += 0.2; }
    S.aviso = '¡CLASE: ' + SK_CLASES[o.id].titulo.toUpperCase() + '!'; S.avisoT = 2.5;
  } else if (o.tipo === 'nueva') {
    S.armas.push({ id: o.id, nivel: 1, t: SK_ARMAS[o.id].cd });
  } else if (o.tipo === 'mejora') {
    S.armas.find(a => a.id === o.id).nivel++;
  } else if (o.tipo === 'pasiva') {
    if (o.id === 'vida') { S.vidaMax += 1; S.hp = Math.min(S.vidaMax, S.hp + 1); }
    else S.mej[o.id]++;
  }
  S.pendientes--; S.opciones = null;
  if (S.pendientes > 0) { skAbreNivel(); return; }
  S.pausa = false;
  document.getElementById('sk-niv').hidden = true;
}
addEventListener('keydown', e => {
  if (SK.pausa && SK.opciones && ['1', '2', '3', '4'].includes(e.key)) skElige(+e.key - 1);
});

function skBanca() { const w = skCartera(); w.oro += SK.oro; SK.oro = 0; skGuardaCartera(w); }
function skCampVictoria() { const S = SK; S.estado = 'victoria'; S.vicT = 2.2; S.aviso = '¡NIVEL SUPERADO!'; S.avisoT = 2.2; play('win'); }
function skCampFinal(ganado) {
  const S = SK, c = skCampLeer();
  if (ganado && S.campana) {
    const k = S.campana.wi + '-' + S.campana.li, orden = ['f', 'n', 'h'];
    if (!c.hechos[k] || orden.indexOf(S.campana.dif) > orden.indexOf(c.hechos[k])) c.hechos[k] = S.campana.dif;
    skCampGuarda(c);
    const w = skCartera(); w.oro += Math.round(25 * (S.dif ? S.dif.pago : 1)); skGuardaCartera(w);
  }
  skBanca();
  S.estado = 'menu'; S.campana = null; S.pausa = false;
  document.getElementById('sk-niv').hidden = true;
  skMuestraCampana(ganado ? '¡Nivel superado! Desbloqueas el siguiente.' : 'Derrota. Puedes volver a intentarlo.');
}
function skCampEmpieza(wi, li) {
  const W = SK_MUNDOS[wi], L = W.levels[li], c = skCampLeer();
  audioInit();
  skReinicia(SK_HEROES[SK.menuIdx].fac);
  Object.assign(SK, { campana: { wi, li, dif: c.dif }, dif: SK_DIFS[c.dif] || SK_DIFS.n, pool: L.deck || (FACTIONS[W.efac] || {}).units || null,
    bossKey: L.boss ? (SK_JEFE_DE[W.efac] || (FACTIONS[W.efac] || {}).leader || null) : null, esBoss: !!L.boss, elvl: L.elvl, bossHecho: !L.boss, vicT: 0 });
  if (SK.bossKey && !ART[SK.bossKey]) SK.bossKey = null;
  musicSet(TRACKS[W.efac] ? W.efac : 'animales');
  document.getElementById('sk-ui').hidden = true;
  document.getElementById('sk-camp').hidden = true;
}
function skFin() {
  SK.estado = 'fin'; SK.pausa = false; document.getElementById('sk-niv').hidden = true;
  skBanca();
  play('lose');
  musicSet(TRACKS.lose ? 'lose' : undefined);
  skMostraFin();
}

/* ---------- entrada: teclado, toque y botones ---------- */
function skMueve(delta) {
  if (SK.estado !== 'juega') return;
  const nuevo = Math.max(0, Math.min(SK_LANES.length - 1, SK.lane + delta));
  if (nuevo !== SK.lane && Math.random() < 0.5) SK.volt = 0.5;   // a veces, cabriola
  SK.lane = nuevo;
}
addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') skMueve(-1);
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') skMueve(1);
});
SK_CV.addEventListener('pointerdown', e => {
  const r = SK_CV.getBoundingClientRect();
  skMueve(e.clientY - r.top < r.height / 2 ? -1 : 1);
});

/* ---------- pantallas ---------- */
function skReinicia(fac) {
  Object.assign(SK, { estado: 'juega', fac, t: 0, dist: 0, kills: 0, xp: 0, nivel: 1, lane: 1, hy: SK_LANES[1], hp: SK_VIDA, vidaMax: SK_VIDA, inv: 0, cd: 0, anim: 0, boost: 0, boostCd: 10, enemigos: [], disparos: [], drops: [], parts: [], spawnT: 1, bossHecho: false, sacudida: 0, jefeVivo: null, aviso: null, avisoT: 0,
    pausa: false, pendientes: 0, ataques: [], armas: [], mej: { fuerza: 0, cadencia: 0, turbo: 0 }, clase: null, claseOferta: false, cdMult: 1, bonusDmg: 0, destellos: [], anillos: [], giro: 0, opciones: null, ataques: [], oro: 0, oroMult: 1, xpMult: 1, invDur: 1.2, regen: false, turboCd: 10, volt: 0, campana: null, pool: null, dif: null, esBoss: false, bossKey: null, elvl: 1, vicT: 0 });
  skAplicaTalentos(SK);
  SK.boostCd = SK.turboCd;
  document.getElementById('sk-niv').hidden = true;
}
function skEmpieza(fac) {
  audioInit();
  skReinicia(fac);
  musicSet(TRACKS[fac] ? fac : 'animales');
  document.getElementById('sk-ui').hidden = true;
}
function skMenu() {
  SK.estado = 'menu';
  musicSet(TRACKS.menu ? 'menu' : undefined);
  const ui = document.getElementById('sk-ui');
  ui.hidden = false; ui.className = 'sk-menu';
  const h = SK_HEROES[SK.menuIdx];
  const u = skU(h.key), carta = (CFG.cards[h.key] || {}), col = SK_COLOR[h.fac], w = skCartera();
  const barra = (v, max, c) => `<div class="sk-barra"><i style="width:${Math.min(100, v / max * 100)}%;background:${c}"></i></div>`;
  ui.innerHTML = `
    <div class="sk-izq">
      <h1 class="logo"><span class="l1 ol">FANS OF</span><span class="l2 ol-big">SKATE</span></h1>
      <p class="tagline"><b>${h.nombre}</b> contra <i>Microblizz</i></p>
      <button class="btn-big ol" id="sk-jugar">CAMPAÑA</button>
      <div class="sk-tiles">
        <button class="home-tile" id="sk-rapida"><span class="ol">Partida rápida</span></button>
        <button class="home-tile" id="sk-arbol-btn"><span class="ol">Árbol de talentos</span></button>
        <button class="home-tile" id="sk-sonido"><span class="ol">Sonido ${SAVE.muted ? 'OFF' : 'ON'}</span></button>
      </div>
    </div>
    <div class="sk-centro">
      <div class="sk-chip ol">ORO ${w.oro}</div>
      <div class="sk-escena">
        <button class="sk-flecha" id="sk-izq" aria-label="Héroe anterior">◀</button>
        <canvas id="title-art" width="520" height="300" aria-hidden="true"></canvas>
        <button class="sk-flecha" id="sk-der" aria-label="Héroe siguiente">▶</button>
      </div>
    </div>
    <div class="sk-ficha" style="border-color:${col}">
      <b class="ol" style="color:${col}">${carta.name || h.nombre}</b>
      <small>${carta.tag || ''}</small>
      <p>${carta.desc || ''}</p>
      <div class="sk-stats">
        <span>VIDA ${u.hp}</span>${barra(u.hp, 600, '#5be36a')}
        <span>DAÑO ${u.dmg}</span>${barra(u.dmg, 60, '#ff8a1f')}
        <span>VELOCIDAD ${u.speed}</span>${barra(u.speed, 60, '#21e6ff')}
      </div>
    </div>`;
  document.getElementById('sk-izq').onclick = () => { SK.menuIdx = (SK.menuIdx + SK_HEROES.length - 1) % SK_HEROES.length; skMenu(); };
  document.getElementById('sk-der').onclick = () => { SK.menuIdx = (SK.menuIdx + 1) % SK_HEROES.length; skMenu(); };
  document.getElementById('sk-jugar').onclick = () => skMuestraCampana();
  document.getElementById('sk-rapida').onclick = () => skEmpieza(SK_HEROES[SK.menuIdx].fac);
  document.getElementById('sk-arbol-btn').onclick = () => skAbreArbol();
  document.getElementById('sk-sonido').onclick = () => { SAVE.muted = !SAVE.muted; applyVolume(); skMenu(); };
}
function skMuestraCampana(msg) {
  SK.estado = 'campana';
  musicSet(TRACKS.menu ? 'menu' : undefined);
  document.getElementById('sk-ui').hidden = true;
  document.getElementById('sk-arbol').hidden = true;
  document.getElementById('sk-camp').hidden = false;
  skCampRender(msg, SK.campSel);
}
function skCampRender(msg, wiSel) {
  const el = document.getElementById('sk-camp'), c = skCampLeer(), w = skCartera();
  const hechosDe = wi => [0, 1, 2, 3].filter(li => c.hechos[wi + '-' + li]).length;
  const mundos = SK_MUNDOS.map((W, wi) => {
    const ab = skMundoAbierto(wi), n = hechosDe(wi), col = SK_COLOR[W.efac] || '#ffffff';
    return `<button class="world ${ab ? '' : 'locked'} ${wiSel === wi ? 'sel' : ''}" data-wi="${wi}" style="--wc:${col}55;border-color:${col}">
      <div class="world-name ol">${W.name}<small>${CORP[W.efac] || (FACTIONS[W.efac] || {}).name || ''}</small></div>
      <div class="world-stars">${'★'.repeat(n)}${'☆'.repeat(4 - n)}</div>
      <p class="world-story">${ab ? W.story : 'Supera el jefe del mundo anterior para abrirlo.'}</p></button>`;
  }).join('');
  let niveles = '';
  if (wiSel !== null && wiSel !== undefined && skMundoAbierto(wiSel)) {
    const W = SK_MUNDOS[wiSel];
    niveles = `<div class="sk-niveles">${W.levels.map((L, li) => {
      const hecho = c.hechos[wiSel + '-' + li], ab = skNivelAbierto(wiSel, li);
      return `<button class="sk-nivel ${hecho ? 'hecho' : ''}" data-li="${li}" ${ab ? '' : 'disabled'}>
        <b class="ol">${L.name}</b><small>Nivel ${L.elvl} · ${L.boss ? 'JEFE: ' + L.boss : 'Oleadas'}</small>${hecho ? '<i>✔ superado</i>' : ''}</button>`;
    }).join('')}</div>`;
  }
  el.innerHTML = `
    <div class="sk-camp-cab">
      <button class="home-tile" id="sk-camp-volver"><span class="ol">← Menú</span></button>
      <h2 class="sk-niv-t">CAMPAÑA</h2>
      <div class="sk-chip ol">ORO ${w.oro}</div>
    </div>
    <div class="tabs camp-tabs">${Object.keys(SK_DIFS).map(k => `<button class="tab ol cd-${k}" data-cd="${k}" aria-pressed="${k === c.dif}">${SK_DIFS[k].nombre}</button>`).join('')}</div>
    <p class="deck-sub">${msg || 'Libera cada mundo corrompido por Microblizz: su facción se une a ti.'}</p>
    <div class="sk-mundos">${mundos}</div>${niveles}`;
  el.querySelectorAll('.tab').forEach(b => b.onclick = () => { c.dif = b.dataset.cd; skCampGuarda(c); skCampRender(null, wiSel); });
  el.querySelectorAll('.world').forEach(b => b.onclick = () => { const wi = +b.dataset.wi; if (!skMundoAbierto(wi)) return; SK.campSel = wi; skCampRender(null, wi); });
  el.querySelectorAll('.sk-nivel').forEach(b => b.onclick = () => skCampEmpieza(wiSel, +b.dataset.li));
  document.getElementById('sk-camp-volver').onclick = () => { document.getElementById('sk-camp').hidden = true; skMenu(); };
}
function skAbreArbol() {
  document.getElementById('sk-ui').hidden = true;
  document.getElementById('sk-arbol').hidden = false;
  skArbolRender();
}
function skArbolRender() {
  const a = document.getElementById('sk-arbol'), w = skCartera();
  const ramas = ['OFENSIVA', 'DEFENSA', 'FORTUNA'];
  a.innerHTML = `<h2 class="sk-niv-t">ÁRBOL DE TALENTOS</h2><div class="sk-chip ol">ORO ${w.oro}</div>
    <div class="sk-ramas">${ramas.map((nom, r) => `<div class="sk-rama"><h3 class="ol">${nom}</h3>${SK_TALENTOS.filter(t => t.rama === r).map(t => {
      const comprado = w.compras.includes(t.id), libre = !t.req || w.compras.includes(t.req);
      const estado = comprado ? 'comprado' : (libre ? 'disponible' : 'bloqueado');
      const pie = comprado ? 'COMPRADO' : libre ? `${t.coste} ORO` : 'Requiere ' + SK_TALENTOS.find(x => x.id === t.req).titulo;
      return `<button class="sk-nodo ${estado}" data-id="${t.id}"><b>${t.titulo}</b><p>${t.desc}</p><small>${pie}</small></button>`;
    }).join('<div class="sk-flecha-baja">↓</div>')}</div>`).join('')}</div>
    <button class="home-tile" id="sk-volver"><span class="ol">Volver</span></button>`;
  a.querySelectorAll('.sk-nodo').forEach(b => b.onclick = () => skCompra(b.dataset.id));
  document.getElementById('sk-volver').onclick = () => { a.hidden = true; skMenu(); };
}
function skCompra(id) {
  const w = skCartera(), t = SK_TALENTOS.find(x => x.id === id);
  if (w.compras.includes(id) || (t.req && !w.compras.includes(t.req))) return;
  if (w.oro < t.coste) { play('deny'); return; }
  w.oro -= t.coste; w.compras.push(id); skGuardaCartera(w);
  play('levelup'); skArbolRender();
}
function skDibujaTituloArte(t) {
  const cv = document.getElementById('title-art'); if (!cv || SK.estado !== 'menu') return;
  const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  const h = SK_HEROES[SK.menuIdx], col = SK_COLOR[h.fac] || '#fff';
  const g = c.createRadialGradient(260, 170, 20, 260, 170, 200); g.addColorStop(0, col + '55'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
  skSombra(c, 260, 262, 120, 22, 0.5);
  c.save(); c.translate(260, 252); c.scale(2.6, 2.6); skVehiculo(c, h.fac, t * 4, col); c.restore();
  skRider(c, h.key, 260, 252 - 30 * 2.6 + 10, 2.6 * 1.05);
}
function skMostraFin() {
  const ui = document.getElementById('sk-ui');
  ui.hidden = false; ui.className = '';
  const pie = `<p>${Math.floor(SK.dist)} m · ${SK.kills} bajas · nivel ${SK.nivel} · <b>+${SK.oro} ORO</b></p>`;
  if (SK.campana) {
    ui.innerHTML = `<h1>¡TE HAN ATROPELLADO!</h1>${pie}<div class="sk-grid"><button id="sk-otra">Reintentar</button><button id="sk-menu">Mapa</button></div>`;
    document.getElementById('sk-otra').onclick = () => skCampEmpieza(SK.campana.wi, SK.campana.li);
    document.getElementById('sk-menu').onclick = () => skCampFinal(false);
  } else {
    ui.innerHTML = `<h1>¡TE HAN ATROPELLADO!</h1>${pie}<div class="sk-grid"><button id="sk-otra">Otra vez</button><button id="sk-menu">Menú</button></div>`;
    document.getElementById('sk-otra').onclick = () => skEmpieza(SK.fac);
    document.getElementById('sk-menu').onclick = () => skMenu();
  }
}

/* ---------- bucle ---------- */
let skUltimo = performance.now();
function skBucle(ahora) {
  const dt = Math.min(0.05, (ahora - skUltimo) / 1000); skUltimo = ahora;
  try { skUpdate(dt); skDibujaTodo(SKC); if (SK.estado === 'menu') skDibujaTituloArte(ahora / 1000); } catch (err) { console.error(err); }
  requestAnimationFrame(skBucle);
}
skMenu();
requestAnimationFrame(skBucle);
