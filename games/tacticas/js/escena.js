// Fans of Rumble: Tácticas · ESCENA: sprites de Fans Of y el dibujo del combate en estilo maqueta: el decorado del mundo (maqueta-*.js),
// los personajes tal cual son (con sombra, reflejo en el suelo y contraluz), efectos con brillo, rayos de luz, polvo, números y barras.
'use strict';
const LW = 540, LH = 960;                       // tamaño lógico de la escena (la pantalla entera del combate)
let B = null;                                   // la batalla en curso
const cv = document.getElementById('cv'), cx = cv.getContext('2d');

/* =========================================================
   DIBUJO DE PERSONAJES (los sprites de Fans Of)
   ========================================================= */
const TINTE = {};
function spriteDe(key, corrupto) {
  const sp = SPR[key]; if (!corrupto) return sp.c;
  if (TINTE[key]) return TINTE[key];
  const c = document.createElement('canvas'); c.width = sp.c.width; c.height = sp.c.height;
  const x = c.getContext('2d'); x.drawImage(sp.c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(110,0,60,.34)'; x.fillRect(0, 0, c.width, c.height);
  return (TINTE[key] = c);
}
// dibuja un personaje con los pies en (x, y); giro = -1 mira a la izquierda
function pintarSprite(c, key, x, y, esc = 1, giro = 1, o = {}) {
  const sp = SPR[key]; if (!sp) return;
  c.save(); c.translate(x, y); c.scale(esc * giro, esc * (o.voltea ? -0.8 : 1));
  if (o.rot) c.rotate(o.rot);
  c.globalAlpha = o.alfa == null ? 1 : o.alfa;
  const img = o.img || (o.gris && sp.g ? sp.g : spriteDe(key, o.corrupto));
  c.drawImage(img, -sp.ax, -sp.ay, sp.wd, sp.ht);
  if (o.blanco) { c.globalAlpha *= o.blanco; c.drawImage(sp.w, -sp.ax, -sp.ay, sp.wd, sp.ht); }
  c.restore();
}
// retrato en un canvas pequeño (mapa, grupo, tienda)
function retrato(canvas, key, o = {}) {
  const r = canvas.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
  const w = Math.max(40, r.width || 64), h = Math.max(40, r.height || 64);
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
  const sp = SPR[key]; if (!sp) return;
  const esc = Math.min((w * 0.92) / sp.wd, (h * 0.9) / sp.ht);
  c.fillStyle = 'rgba(20,10,30,.3)'; c.beginPath(); c.ellipse(w / 2, h - 5, w * 0.3, 4, 0, 0, Math.PI * 2); c.fill();
  pintarSprite(c, key, w / 2 - (sp.wd / 2 - sp.ax) * esc, h - 5 - (sp.ht - sp.ay) * esc, esc, 1, o);
}
// la silueta del personaje de un color (contraluz) y el personaje que se borra hacia la cabeza (reflejo en el suelo)
const VERSION_SPR = {};
function siluetaDe(key, col) {
  const id = 's' + key + col; if (VERSION_SPR[id]) return VERSION_SPR[id];
  const sp = SPR[key], c = lienzo(sp.w.width, sp.w.height), x = c.getContext('2d');
  x.drawImage(sp.w, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  return (VERSION_SPR[id] = c);
}
function reflejoDe(key) {
  const id = 'r' + key; if (VERSION_SPR[id]) return VERSION_SPR[id];
  const sp = SPR[key], c = lienzo(sp.c.width, sp.c.height), x = c.getContext('2d');
  x.drawImage(sp.c, 0, 0); x.globalCompositeOperation = 'destination-in';
  const fy = sp.ay / sp.ht, g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(Math.max(0, fy - 0.45), 'rgba(0,0,0,0)'); g.addColorStop(fy, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,1)');
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  return (VERSION_SPR[id] = c);
}

/* =========================================================
   DIBUJAR LA ESCENA
   ========================================================= */
function dibujar() {
  const k = cv.width / LW, n = Math.max(2, Math.min(5, Math.round(cv.width / PW)));
  const M = prepararMaqueta(MUNDOS[B.wi].fondo, n), d = M.def, t = B.t;
  const sx = B.temblor ? rand(-B.temblor, B.temblor) : 0, sy = B.temblor ? rand(-B.temblor, B.temblor) : 0;
  cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
  cx.fillStyle = '#08030c'; cx.fillRect(0, 0, cv.width, cv.height);
  cx.setTransform(k, 0, 0, k, sx * k, sy * k);
  cx.drawImage(M.fondo, 0, 0, LW, LH);
  cx.globalCompositeOperation = 'lighter';   // las luces del fondo, que respiran un poco
  for (const b of d.bokeh) pintaBrillo(cx, b.col, b.x, b.y, b.r, b.a * (0.75 + 0.25 * Math.sin(t * 1.3 + b.f)), true);
  for (const l of d.luces) pintaBrillo(cx, l.col, l.x, l.y, l.r, l.a * (0.92 + 0.08 * Math.sin(t * 2.1 + l.x)));
  cx.globalCompositeOperation = 'source-over';
  const todos = [...B.enemigos.filter(e => e.alfa > 0), ...B.heroes].sort((a, b) => a.y - b.y);
  pintarFx('detras');
  for (const u of todos) if (u.hp > 0 && !(u.dy < -4)) pintarSprite(cx, u.key, u.x + u.dx, u.y + 2, u.esc, u.lado === 'h' ? -1 : 1, { img: reflejoDe(u.key), voltea: true, alfa: 0.16 * u.alfa });
  for (const u of todos) sombraDe(u);
  for (const u of todos) pintarLuchador(u, d);
  pintarEfectos();
  pintarFx('delante');
  cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.7);
  cx.drawImage(M.rayos, 0, 0, LW, LH); cx.globalAlpha = 1;
  pintaPolvo(cx, t);
  cx.globalCompositeOperation = 'source-over';
  cx.drawImage(M.delante, 0, 0, LW, LH);
  cx.drawImage(M.viñeta, 0, 0, LW, LH);
  pintarBarras();
  // flechas sobre los objetivos que puedes elegir, y sobre el héroe que tiene el turno
  const bote = Math.sin(t * 8) * 5;
  if (B.eligiendo) for (const u of B.eligiendo.lista) flecha(u.x, u.y - alto(u) - (u.lado === 'e' ? (u.jefe ? 76 : 46) : 10) + bote, '#ffcb3d');
  else if (B.menu) flecha(B.menu.h.x, B.menu.h.y - alto(B.menu.h) - 8 + bote, '#ff7a1a');
  cx.setTransform(k, 0, 0, k, 0, 0);
  // números
  cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
  for (const nm of B.nums) {
    const sube = Math.min(1, nm.v * 5), bota = nm.v < 0.3 ? Math.sin(nm.v / 0.3 * Math.PI) * 10 : 0, tam = nm.tam * 1.45;
    cx.globalAlpha = nm.v > 0.8 ? Math.max(0, (1.1 - nm.v) / 0.3) : 1;
    const esc = nm.v < 0.12 ? 0.6 + nm.v / 0.12 * 0.5 : nm.v < 0.22 ? 1.1 - (nm.v - 0.12) : 1;
    cx.save(); cx.translate(nm.x, nm.y - sube * 26 - bota - nm.v * 8); cx.scale(esc, esc);
    cx.font = tam + 'px ' + FONT_D; cx.lineWidth = tam > 36 ? 8 : 6; cx.strokeStyle = OL; cx.strokeText(nm.txt, 0, 0); cx.fillStyle = nm.col; cx.fillText(nm.txt, 0, 0);
    cx.restore();
  }
  cx.globalAlpha = 1;
  pintarFx('pantalla');
}
function sombraDe(u) {
  const sp = SPR[u.key]; if (!sp) return;
  const k = 1 / (1 + Math.max(0, -(u.dy || 0)) / 120), w = sp.wd * 0.36 * u.esc * k; cx.globalAlpha = 0.55 * u.alfa * k;
  cx.drawImage(brillo('#08020c'), u.x + u.dx - w * 1.5, u.y + Math.max(0, u.dy || 0) - 9 * u.esc, w * 3, 18 * u.esc); cx.globalAlpha = 1;
}
function rrFill(x, y, w, h, r) { if (w <= 0) return; cx.beginPath(); rrPath(cx, x, y, w, h, Math.min(r, w / 2)); cx.fill(); }
function flecha(x, y, col) { cx.beginPath(); cx.moveTo(x - 11, y - 15); cx.lineTo(x + 11, y - 15); cx.lineTo(x, y); cx.closePath(); cx.fillStyle = col; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = OL; cx.stroke(); }
function pintarLuchador(u, d) {
  const ko = u.lado === 'h' && u.hp <= 0, giro = u.lado === 'h' ? -1 : 1;
  const sp = SPR[u.key]; if (!sp) return;
  const resp = u.hp > 0 && !u.esperando ? Math.sin(B.t * 3 + u.x) * 0.012 : 0;   // respiración
  const sacude = u.golpe > 0 ? Math.sin(u.golpe * 40) * 4 * u.golpe : 0;
  const x = u.x + u.dx + sacude, y = u.y + (u.dy || 0) + (ko ? 6 : 0), esc = u.esc * (1 + resp);
  if (!ko) pintarSprite(cx, u.key, x + d.cdx, y + d.cdy, esc, giro, { img: siluetaDe(u.key, d.contraluz), alfa: 0.85 * u.alfa });   // contraluz
  pintarSprite(cx, u.key, x, y, esc, giro, {
    corrupto: u.corrupto, alfa: u.lado === 'e' ? u.alfa : ko ? 0.75 : 1, gris: ko, rot: ko ? -1.3 * giro : 0, blanco: u.golpe > 0.6 ? 0.7 : 0 });
  if (u.est.aturdido > 0 && u.hp > 0) { const top = u.y - alto(u) - 4; for (let i = 0; i < 3; i++) { const a = B.t * 4 + i * 2.1; dot(cx, u.x + Math.cos(a) * 18, top + Math.sin(a) * 6, 4, '#ffe58a'); } }
  if (u.guardia && u.hp > 0) { cx.strokeStyle = 'rgba(192,139,255,.85)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(u.x, u.y - alto(u) * 0.45, alto(u) * 0.6, 0, Math.PI * 2); cx.stroke(); }
}
function pintarEfectos() {
  for (const o of B.ondas) {
    const p = o.v / o.dur; cx.save(); cx.globalCompositeOperation = 'lighter';
    if (o.tajo) {
      cx.lineCap = 'round';
      for (const [lw, col, a] of [[16, o.col === '#fff' ? '#ffe58a' : o.col, 0.45], [6, '#fff', 1]]) { cx.strokeStyle = col; cx.globalAlpha = (1 - p) * a; cx.lineWidth = lw * (1 - p * 0.6); cx.beginPath(); cx.moveTo(o.x - 46 + p * 14, o.y - 50 + p * 14); cx.quadraticCurveTo(o.x + 10, o.y - 6, o.x + 48, o.y + 44); cx.stroke(); }
      pintaBrillo(cx, '#ffe58a', o.x, o.y, 70, 0.6 * (1 - p));
    } else if (o.rayo) {
      cx.globalAlpha = 1 - p; cx.strokeStyle = o.col; cx.lineJoin = 'round';
      for (const lw of [12, 4]) { cx.lineWidth = lw; cx.globalAlpha = (1 - p) * (lw > 8 ? 0.35 : 1); cx.beginPath(); cx.moveTo(o.x + 14, 0); cx.lineTo(o.x - 12, o.y - 70); cx.lineTo(o.x + 12, o.y - 56); cx.lineTo(o.x, o.y); cx.stroke(); }
      pintaBrillo(cx, o.col, o.x, o.y, 80, 0.7 * (1 - p));
    } else {
      cx.globalAlpha = 1 - p; cx.strokeStyle = o.col; cx.lineWidth = 7 * (1 - p) + 1;
      cx.beginPath(); cx.ellipse(o.x, o.y, o.r * 1.3 * (0.2 + p), o.r * 1.3 * (0.2 + p) * 0.36, 0, 0, Math.PI * 2); cx.stroke();
      cx.lineWidth = 18 * (1 - p); cx.globalAlpha = 0.25 * (1 - p); cx.stroke();
    }
    cx.restore();
  }
  for (const p of B.parts) {
    const a = Math.min(1, p.v * 3);
    cx.globalCompositeOperation = 'lighter'; pintaBrillo(cx, p.col, p.x, p.y, p.r * 3.4, 0.5 * a);
    cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = a; cx.fillStyle = p.col;
    if (p.cruz) { cx.fillRect(p.x - p.r, p.y - p.r * 0.35, p.r * 2, p.r * 0.7); cx.fillRect(p.x - p.r * 0.35, p.y - p.r, p.r * 0.7, p.r * 2); }
    else { cx.beginPath(); cx.arc(p.x, p.y, p.r * 1.2, 0, Math.PI * 2); cx.fill(); }
  }
  cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
}
// barra con contorno (vida en rojo, turno en cian; llena, en dorado)
function barraE(x, y, w, h, frac, c1, c2) {
  cx.fillStyle = OL; cx.beginPath(); rrPath(cx, x - 2, y - 2, w + 4, h + 4, (h + 4) / 2); cx.fill();
  cx.fillStyle = '#12081c'; cx.beginPath(); rrPath(cx, x, y, w, h, h / 2); cx.fill();
  if (frac > 0) { const g = cx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); cx.fillStyle = g; cx.beginPath(); rrPath(cx, x, y, Math.max(h, w * frac), h, h / 2); cx.fill(); cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x + h / 2, y + 1, Math.max(0, w * frac - h), h * 0.3); }
}
function pintarBarras() {
  cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
  for (const e of B.enemigos) if (e.hp > 0 && e.alfa > 0.5) {
    const w = e.jefe ? 156 : 76, top = e.y - alto(e) - (e.jefe ? 34 : 18), x = e.x - w / 2, lleno = e.atb >= 100;
    if (e.jefe) { cx.font = '22px ' + FONT_D; cx.lineWidth = 6; cx.strokeStyle = OL; cx.strokeText(e.nombre, e.x, top - 16); cx.fillStyle = '#fff'; cx.fillText(e.nombre, e.x, top - 16); }
    barraE(x, top, w, e.jefe ? 12 : 9, e.hp / e.hpMax, '#ff8a8a', '#d01c3a');
    barraE(x, top + (e.jefe ? 18 : 14), w, 6, Math.min(1, e.atb / 100), lleno ? '#ffe58a' : '#9af4ff', lleno ? '#ffb000' : '#14a8d8');
  }
}
