// Fans of Rumble: Tácticas · FONDO DE LOS MENÚS: detrás del título, el mapa, el grupo y la tienda se ve la maqueta viva (luces,
// rayos de sol y polvo). En el título es el despacho del CEO con tu grupo esperando en el suelo y rayos de luz detrás del logo;
// en el resto, el mundo que estás mirando, más oscuro para que se lea bien lo de encima. Durante el combate no se pinta.
'use strict';
const FM = { cv: document.getElementById('fondo-menu'), t: 0, ultimo: 0 };
FM.c = FM.cv.getContext('2d');
function pantallaVisible() { const p = [...document.querySelectorAll('.pantalla')].find(s => !s.hidden); return p ? p.id : ''; }
function fondoMenu(ahora) {
  requestAnimationFrame(fondoMenu);
  const dt = Math.min(0.05, (ahora - (FM.ultimo || ahora)) / 1000); FM.ultimo = ahora;
  const id = pantallaVisible(); if (B || !id || id === 'p-batalla' || document.hidden) return;
  FM.t += dt;
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  if (FM.cv.width !== Math.round(W * dpr) || FM.cv.height !== Math.round(H * dpr)) { FM.cv.width = Math.round(W * dpr); FM.cv.height = Math.round(H * dpr); }
  const titulo = id === 'p-titulo', tipo = titulo ? 'sede' : MUNDOS[mundoVisto].fondo;
  // la escena de 540 × 960 cubre la pantalla entera (centrada)
  const K = Math.max(W / LW, H / LH), ox = (W - LW * K) / 2, oy = (H - LH * K) / 2;
  const n = Math.max(2, Math.min(4, Math.round(LW * K * dpr / PW)));
  const M = prepararMaqueta(tipo, n), d = M.def, c = FM.c, t = FM.t;
  avanzaPolvo(dt, t);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#08030c'; c.fillRect(0, 0, FM.cv.width, FM.cv.height);
  c.setTransform(K * dpr, 0, 0, K * dpr, ox * dpr, oy * dpr);
  c.drawImage(M.fondo, 0, 0, LW, LH);
  c.globalCompositeOperation = 'lighter';
  for (const b of d.bokeh) pintaBrillo(c, b.col, b.x, b.y, b.r, b.a * (0.75 + 0.25 * Math.sin(t * 1.3 + b.f)), true);
  for (const l of d.luces) pintaBrillo(c, l.col, l.x, l.y, l.r, l.a * (0.92 + 0.08 * Math.sin(t * 2.1 + l.x)));
  c.globalCompositeOperation = 'source-over';
  const aEsc = r => [(r.left + r.width / 2 - ox) / K, (r.top + r.height / 2 - oy) / K, r.width / K, r.height / K];
  if (titulo) grupoTitulo(c, d, aEsc($('#cv-titulo').getBoundingClientRect()), t);
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.7); c.drawImage(M.rayos, 0, 0, LW, LH); c.globalAlpha = 1;
  pintaPolvo(c, t);
  c.globalCompositeOperation = 'source-over'; c.drawImage(M.delante, 0, 0, LW, LH); c.drawImage(M.viñeta, 0, 0, LW, LH);
  if (titulo) rayosLogo(c, aEsc($('.logo').getBoundingClientRect()), t);
  else {   // más oscuro detrás de los menús, para leer bien
    c.setTransform(1, 0, 0, 1, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, FM.cv.height); g.addColorStop(0, 'rgba(14,6,26,.72)'); g.addColorStop(0.5, 'rgba(14,6,26,.5)'); g.addColorStop(1, 'rgba(14,6,26,.8)');
    c.fillStyle = g; c.fillRect(0, 0, FM.cv.width, FM.cv.height);
  }
}
// tu grupo, de pie en el suelo del despacho, respirando (con sombra, reflejo y contraluz como en el combate)
function grupoTitulo(c, d, [cx0, cy0, w, h], t) {
  const g = (SAVE.grupo || []).slice(0, 4); if (!g.length) return;
  const suelo = cy0 + h / 2;   // el primero del grupo, en el centro y delante
  const sitios = [[0, 10, 1.25], [-0.36, -6, 1.02], [0.36, -6, 1.02], [-0.18, -16, 0.9]];
  for (const i of [3, 1, 2, 0].filter(i => i < g.length)) {
    const key = g[i], sp = SPR[key]; if (!sp) continue;
    const [fx, fy, e0] = sitios[i], x = cx0 + fx * w, y = suelo + fy, esc = e0 * Math.min(1.3, h / 150) * (1 + Math.sin(t * 3 + i) * 0.012), giro = fx > 0.01 ? -1 : 1;
    c.globalAlpha = 0.5; c.drawImage(brillo('#08020c'), x - sp.wd * esc * 0.55, y - 10 * esc, sp.wd * esc * 1.1, 20 * esc); c.globalAlpha = 1;
    pintarSprite(c, key, x, y + 2, esc, giro, { img: reflejoDe(key), voltea: true, alfa: 0.16 });
    pintarSprite(c, key, x + d.cdx, y + d.cdy, esc, giro, { img: siluetaDe(key, d.contraluz), alfa: 0.85 });
    pintarSprite(c, key, x, y, esc, giro);
  }
}
// haces de luz que giran despacio detrás del logo
function rayosLogo(c, [x, y, w], t) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.rotate(t * 0.12);
  const L = w * 0.95;
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2, an = 0.07 + (i % 2) * 0.04, l = L * (0.7 + 0.3 * Math.sin(i * 3.1 + t));
    const g = c.createLinearGradient(0, 0, Math.cos(a) * l, Math.sin(a) * l); g.addColorStop(0, 'rgba(255,214,120,.5)'); g.addColorStop(1, 'rgba(255,170,60,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - an) * l, Math.sin(a - an) * l); c.lineTo(Math.cos(a + an) * l, Math.sin(a + an) * l); c.closePath(); c.fill();
  }
  c.restore(); c.globalCompositeOperation = 'lighter'; pintaBrillo(c, '#ffb347', x, y, w * 0.6, 0.35); c.globalCompositeOperation = 'source-over';
}
requestAnimationFrame(fondoMenu);
