// Fans of Rumble: Tácticas · ESCENA: sprites de Fans Of, fondos de cada mundo y el dibujo del combate (efectos, números, flechas).
'use strict';
const LW = 540, LH = 460;                       // tamaño lógico de la escena
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
  c.save(); c.translate(x, y); c.scale(esc * giro, esc);
  if (o.rot) c.rotate(o.rot);
  c.globalAlpha = o.alfa == null ? 1 : o.alfa;
  const img = o.gris && sp.g ? sp.g : spriteDe(key, o.corrupto);
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

/* =========================================================
   FONDOS DE CADA MUNDO (se pintan una vez y se guardan)
   ========================================================= */
const FONDOS = {};
const SUELO = 165;   // dónde empieza el suelo
function fondoDe(tipo) {
  if (FONDOS[tipo]) return FONDOS[tipo];
  const R = 2, c = document.createElement('canvas'); c.width = LW * R; c.height = LH * R;
  const x = c.getContext('2d'); x.scale(R, R); x.lineJoin = 'round';
  const rnd = mulberry32(tipo.length * 977);
  const cielo = (a, b) => { const g = x.createLinearGradient(0, 0, 0, SUELO); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, LW, SUELO + 2); };
  const suelo = (a, b) => { const g = x.createLinearGradient(0, SUELO, 0, LH); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, SUELO, LW, LH - SUELO); };
  const borde = col => { x.fillStyle = col; x.fillRect(0, SUELO - 3, LW, 6); };
  if (tipo === 'oficina') {
    cielo('#3a3466', '#5a5290');
    for (let i = 0; i < 5; i++) {   // ventanas con la ciudad de noche
      const wx = 24 + i * 106; x.fillStyle = '#1b1838'; x.fillRect(wx, 26, 82, 92);
      for (let k = 0; k < 9; k++) { x.fillStyle = rnd() < 0.5 ? '#ffe58a' : '#3b3570'; x.fillRect(wx + 8 + (k % 3) * 24, 34 + Math.floor(k / 3) * 26, 14, 16); }
      x.lineWidth = 4; x.strokeStyle = '#20102c'; x.strokeRect(wx, 26, 82, 92);
    }
    x.fillStyle = '#ff4b5c'; x.font = '18px ' + FONT_D; x.textAlign = 'center'; x.fillText('MICROBLIZZ · SEGUIMOS CRECIENDO', LW / 2, 140);
    suelo('#5b6578', '#353c4d'); borde('#20102c');
    x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 2;
    for (let i = -8; i < 14; i++) { x.beginPath(); x.moveTo(LW / 2 + i * 40, SUELO); x.lineTo(LW / 2 + i * 110, LH); x.stroke(); }
    for (let j = 0; j < 6; j++) { const yy = SUELO + 14 + j * j * 7; x.beginPath(); x.moveTo(0, yy); x.lineTo(LW, yy); x.stroke(); }
  } else if (tipo === 'cementerio') {
    cielo('#1d1236', '#4a2c6a');
    x.fillStyle = '#f7f1d8'; x.beginPath(); x.arc(440, 52, 28, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#4a2c6a'; x.beginPath(); x.arc(452, 46, 24, 0, Math.PI * 2); x.fill();
    for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd() * 0.5) + ')'; x.fillRect(rnd() * LW, rnd() * 110, 2, 2); }
    x.fillStyle = '#2a1a3e'; x.beginPath(); x.moveTo(0, SUELO); for (let i = 0; i <= 12; i++) x.lineTo(i * 45, SUELO - 20 - rnd() * 34); x.lineTo(LW, SUELO); x.fill();
    const T = THEMES.nomuertos; suelo(T.grad[1], T.grad[3]); borde('#20102c');
    for (let i = 0; i < 7; i++) {   // lápidas
      const tx = 30 + i * 80 + rnd() * 20, ty = SUELO + 6 + rnd() * 12;
      x.fillStyle = '#8c8aa0'; x.beginPath(); x.moveTo(tx - 12, ty); x.lineTo(tx - 12, ty - 22); x.arc(tx, ty - 22, 12, Math.PI, 0); x.lineTo(tx + 12, ty); x.closePath(); x.fill();
      x.lineWidth = 2.5; x.strokeStyle = '#20102c'; x.stroke();
    }
    for (let i = 0; i < 26; i++) { x.fillStyle = pick(T.greens); x.beginPath(); x.ellipse(rnd() * LW, SUELO + 40 + rnd() * 220, 10 + rnd() * 16, 4 + rnd() * 4, 0, 0, Math.PI * 2); x.fill(); }
  } else if (tipo === 'plato') {
    cielo('#120a22', '#2b1446');
    for (const [lx, col] of [[90, 'rgba(168,85,247,.22)'], [270, 'rgba(34,227,255,.16)'], [450, 'rgba(255,61,240,.2)']]) {
      x.fillStyle = col; x.beginPath(); x.moveTo(lx - 10, 0); x.lineTo(lx + 10, 0); x.lineTo(lx + 90, LH); x.lineTo(lx - 90, LH); x.fill();
      x.fillStyle = '#20102c'; x.fillRect(lx - 14, 0, 28, 14);
    }
    x.fillStyle = '#ff4b5c'; x.beginPath(); x.arc(40, 34, 8, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.font = '16px ' + FONT_D; x.textAlign = 'left'; x.fillText('EN DIRECTO · 0 ESPECTADORES', 56, 40);
    suelo('#3e2363', '#1b0e2c'); borde('#a855f7');
    x.strokeStyle = 'rgba(192,139,255,.15)'; x.lineWidth = 2;
    for (let i = 0; i < 9; i++) { const yy = SUELO + 10 + i * i * 4; x.beginPath(); x.moveTo(0, yy); x.lineTo(LW, yy); x.stroke(); }
  } else {   // sede
    cielo('#2a1840', '#6b3f1f');
    x.fillStyle = 'rgba(255,203,61,.18)'; x.beginPath(); x.arc(LW / 2, 70, 56, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#ffcb3d'; x.font = '54px ' + FONT_D; x.textAlign = 'center'; x.fillText('M', LW / 2, 90);
    for (let i = 0; i < 6; i++) { x.fillStyle = '#20102c'; x.fillRect(20 + i * 98, 0, 14, SUELO); }
    suelo('#7a1f2b', '#3a0f16'); borde('#ffcb3d');
    x.fillStyle = 'rgba(255,203,61,.25)'; x.fillRect(LW / 2 - 60, SUELO, 120, LH - SUELO);   // alfombra
  }
  const v = x.createRadialGradient(LW / 2, LH * 0.55, LH * 0.3, LW / 2, LH * 0.55, LH * 0.85);
  v.addColorStop(0, 'rgba(20,6,36,0)'); v.addColorStop(1, 'rgba(20,6,36,.45)'); x.fillStyle = v; x.fillRect(0, 0, LW, LH);
  return (FONDOS[tipo] = c);
}

/* =========================================================
   DIBUJAR LA ESCENA
   ========================================================= */
function dibujar() {
  const k = cv.width / LW; cx.setTransform(k, 0, 0, k, 0, 0);
  const sx = B.temblor ? rand(-B.temblor, B.temblor) : 0, sy = B.temblor ? rand(-B.temblor, B.temblor) : 0;
  cx.save(); cx.translate(sx, sy);
  cx.drawImage(fondoDe(MUNDOS[B.wi].fondo), 0, 0, LW, LH);
  const todos = [...B.enemigos.filter(e => e.alfa > 0), ...B.heroes].sort((a, b) => a.y - b.y);
  for (const u of todos) pintarLuchador(u);
  // ondas y efectos
  for (const o of B.ondas) {
    const p = o.v / o.dur; cx.save(); cx.globalAlpha = 1 - p;
    if (o.tajo) { cx.strokeStyle = o.col; cx.lineWidth = 6 * (1 - p) + 1; cx.beginPath(); cx.moveTo(o.x - 30 + p * 10, o.y - 30 + p * 10); cx.lineTo(o.x + 30, o.y + 30); cx.stroke(); }
    else if (o.rayo) { cx.strokeStyle = o.col; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(o.x + 10, 0); cx.lineTo(o.x - 8, o.y - 50); cx.lineTo(o.x + 8, o.y - 40); cx.lineTo(o.x, o.y); cx.stroke(); }
    else { cx.strokeStyle = o.col; cx.lineWidth = 5 * (1 - p); cx.beginPath(); cx.ellipse(o.x, o.y, o.r * p, o.r * p * 0.4, 0, 0, Math.PI * 2); cx.stroke(); }
    cx.restore();
  }
  for (const p of B.parts) {
    cx.globalAlpha = Math.min(1, p.v * 3); cx.fillStyle = p.col;
    if (p.cruz) { cx.fillRect(p.x - p.r, p.y - p.r * 0.35, p.r * 2, p.r * 0.7); cx.fillRect(p.x - p.r * 0.35, p.y - p.r, p.r * 0.7, p.r * 2); }
    else { cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cx.fill(); }
  }
  cx.globalAlpha = 1;
  // flechas sobre los objetivos que puedes elegir, y sobre el héroe que tiene el turno
  const bote = Math.sin(B.t * 8) * 4;
  if (B.eligiendo) for (const u of B.eligiendo.lista) flecha(u.x, u.y - alto(u) - (u.lado === 'e' ? 16 : 4) + bote, '#ffcb3d');
  else if (B.menu) flecha(B.menu.h.x, B.menu.h.y - alto(B.menu.h) - 4 + bote, '#ff7a1a');
  cx.restore();
  // números
  cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.lineJoin = 'round';
  for (const n of B.nums) {
    const sube = Math.min(1, n.v * 4); cx.globalAlpha = n.v > 0.8 ? (1.1 - n.v) / 0.3 : 1;
    cx.font = n.tam + 'px ' + FONT_D; cx.lineWidth = 5; cx.strokeStyle = OL;
    const y = n.y - sube * 22 - n.v * 10; cx.strokeText(n.txt, n.x, y); cx.fillStyle = n.col; cx.fillText(n.txt, n.x, y);
  }
  cx.globalAlpha = 1;
  // vida e iniciativa de todos, siempre a la vista (también con el menú abierto)
  for (const u of [...B.heroes, ...B.enemigos]) if (u.hp > 0) placa(u);
  for (const e of B.enemigos) if (e.hp > 0 && e.jefe) {
    cx.font = '14px ' + FONT_D; cx.lineWidth = 4; cx.strokeStyle = OL; const y = e.y - alto(e) - 18;
    cx.strokeText(e.nombre, e.x, y); cx.fillStyle = '#fff'; cx.fillText(e.nombre, e.x, y);
  }
}
// placa bajo los pies: número de vida, barra de vida y barra de turno (dorada cuando le toca)
function placa(u) {
  const w = u.jefe ? 90 : 56, x = u.x - w / 2, y = u.y + 9;
  cx.font = '13px ' + FONT_D; cx.lineWidth = 4; cx.strokeStyle = OL;
  const t = u.hp + '/' + u.hpMax; cx.strokeText(t, u.x, y + 5); cx.fillStyle = u.hp < u.hpMax * 0.25 ? '#ff4b5c' : '#fff'; cx.fillText(t, u.x, y + 5);
  cx.fillStyle = OL; rrFill(x - 2, y + 12, w + 4, 9, 4.5);
  cx.fillStyle = u.lado === 'h' ? '#5ee06a' : u.fase2 ? '#ff4b5c' : '#ff8a3d'; rrFill(x, y + 14, w * u.hp / u.hpMax, 5, 2.5);
  let yb = y + 22;
  if (u.mpMax) {
    cx.fillStyle = OL; rrFill(x - 2, yb, w + 4, 7, 3.5); cx.fillStyle = '#d43cff'; rrFill(x, yb + 2, w * u.mp / u.mpMax, 3, 1.5);
    cx.font = '12px ' + FONT_D; cx.lineWidth = 3; cx.strokeStyle = OL; cx.textAlign = 'left'; cx.strokeText(u.mp, x + w + 5, yb + 5); cx.fillStyle = '#f3a6ff'; cx.fillText(u.mp, x + w + 5, yb + 5); cx.textAlign = 'center';
    yb += 8;
  }
  cx.fillStyle = OL; rrFill(x - 2, yb, w + 4, 7, 3.5);
  cx.fillStyle = u.atb >= 100 ? '#ffcb3d' : '#22e3ff'; rrFill(x, yb + 2, w * Math.min(100, u.atb) / 100, 3, 1.5);
}
function rrFill(x, y, w, h, r) { if (w <= 0) return; cx.beginPath(); rrPath(cx, x, y, w, h, Math.min(r, w / 2)); cx.fill(); }
function flecha(x, y, col) { cx.beginPath(); cx.moveTo(x - 9, y - 12); cx.lineTo(x + 9, y - 12); cx.lineTo(x, y); cx.closePath(); cx.fillStyle = col; cx.fill(); cx.lineWidth = 2.5; cx.strokeStyle = OL; cx.stroke(); }
function pintarLuchador(u) {
  const ko = u.lado === 'h' && u.hp <= 0, giro = u.lado === 'h' ? -1 : 1;
  const sp = SPR[u.key]; if (!sp) return;
  // sombra
  cx.fillStyle = 'rgba(20,6,36,.35)'; cx.beginPath(); cx.ellipse(u.x + u.dx, u.y, sp.wd * 0.32 * u.esc, 6 * u.esc, 0, 0, Math.PI * 2); cx.fill();
  const resp = u.hp > 0 && !u.esperando ? Math.sin(B.t * 3 + u.x) * 0.012 : 0;   // respiración
  const sacude = u.golpe > 0 ? Math.sin(u.golpe * 40) * 4 * u.golpe : 0;
  pintarSprite(cx, u.key, u.x + u.dx + sacude, u.y + (ko ? 6 : 0), u.esc * (1 + resp), giro, {
    corrupto: u.corrupto, alfa: u.lado === 'e' ? u.alfa : ko ? 0.75 : 1, gris: ko, rot: ko ? -1.3 * giro : 0, blanco: u.golpe > 0.6 ? 0.8 : 0 });
  if (u.est.aturdido > 0 && u.hp > 0) { const top = u.y - alto(u) - 4; for (let i = 0; i < 3; i++) { const a = B.t * 4 + i * 2.1; dot(cx, u.x + Math.cos(a) * 16, top + Math.sin(a) * 5, 3, '#ffe58a'); } }
  if (u.guardia && u.hp > 0) { cx.strokeStyle = 'rgba(192,139,255,.8)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(u.x, u.y - alto(u) * 0.45, alto(u) * 0.6, 0, Math.PI * 2); cx.stroke(); }
}
