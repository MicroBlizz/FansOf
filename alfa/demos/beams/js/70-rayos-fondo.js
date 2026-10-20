// Fans of Beams · Dibujo de sprites, rayos gigantes (plasma, anillos, relámpagos, destello) y el fondo (nebulosas, planetas, lunas, asteroides).
// (Se carga por orden desde index.html: todos los archivos comparten ámbito global.)
'use strict';
// =====================================================================================================================================
// DIBUJO
// =====================================================================================================================================
function dibujaSpr(im, x, y, tam, vuelta, flash, rot) {
  if (!listo(im)) { c.fillStyle = '#c7c'; c.beginPath(); c.arc(x, y, tam / 3, 0, 6.28); c.fill(); return; }
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (vuelta) c.scale(-1, 1); c.imageSmoothingQuality = 'high'; c.drawImage(im, -tam / 2, -tam / 2, tam, tam);
  if (flash) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(0.85, flash * 10); c.drawImage(im, -tam / 2, -tam / 2, tam, tam); }
  c.restore();
}
// ---------- RAYOS: halo, plasma que corre, anillos de energía, relámpagos, bordes con aberración de color y destello de lente ----------
const STRIP = {};   // franja vertical de degradado por color: se estira a lo largo del rayo (sin crear degradados cada cuadro)
function franja(col) {
  if (STRIP[col]) return STRIP[col]; const o = lienzo(4, 128), g = o.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, col + '00'); gr.addColorStop(0.2, col + '88'); gr.addColorStop(0.36, col); gr.addColorStop(0.45, mezcla(col, 0.4)); gr.addColorStop(0.5, mezcla(col, 0.9)); gr.addColorStop(0.55, mezcla(col, 0.4)); gr.addColorStop(0.64, col); gr.addColorStop(0.8, col + '88'); gr.addColorStop(1, col + '00');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 128); return STRIP[col] = o;
}
const PLASMA = (() => {   // textura de plasma (vetas de luz) que se repite sin costuras
  const o = lienzo(256, 64), g = o.getContext('2d'); g.lineCap = 'round';
  for (let i = 0; i < 110; i++) { const y = Math.random() * 64, l = 30 + Math.random() * 130, x = Math.random() * 256, dy = (Math.random() - 0.5) * 8; g.strokeStyle = 'rgba(255,255,255,' + (0.12 + Math.random() * 0.4) + ')'; g.lineWidth = 0.7 + Math.random() * 2.4; for (const dx of [-256, 0, 256]) { g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + l, y + dy); g.stroke(); } }
  return o;
})();
function destello(x, y, ww, col, a, dir) {   // brillo y destello de lente en el origen del rayo
  brillo(x, y, ww * 1.1, col, a * 0.75); brillo(x, y, ww * 0.5, '#ffffff', a * 0.8);
  c.globalAlpha = a * 0.6; c.drawImage(glow('#ffffff'), x - ww * 2.4, y - ww * 0.1, ww * 4.8, ww * 0.2);
  c.globalAlpha = a * 0.4; c.drawImage(glow(col), x - ww * 0.1, y - ww * 1.2, ww * 0.2, ww * 2.4);
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.globalAlpha = a * 0.5; for (let k = 0; k < 4; k++) { const an = S.t * 3 + k * 0.785; c.beginPath(); c.moveTo(x - Math.cos(an) * ww * 0.8, y - Math.sin(an) * ww * 0.8); c.lineTo(x + Math.cos(an) * ww * 0.8, y + Math.sin(an) * ww * 0.8); c.stroke(); }
  for (const f of [[1.3, 0.22, '#ff9ad8', 0.35], [2.2, 0.15, '#9ad8ff', 0.35], [3.4, 0.3, '#ffe9a3', 0.25]]) brillo(x + dir * ww * f[0], y, ww * f[1], f[2], a * f[3] * 0.8);
}
function rayoGrande(x0, x1, y, w, col, alfa, flick) {
  const ww = w * (0.9 + 0.1 * Math.sin(S.t * 60)) * flick, dir = x1 > x0 ? 1 : -1, xa = Math.min(x0, x1), len = Math.abs(x1 - x0), st = franja(col);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.globalAlpha = alfa * 0.22; c.drawImage(st, xa, y - ww * 0.95, len, ww * 1.9);   // halo exterior
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = alfa * 0.92; c.drawImage(st, xa, y - ww * 0.55, len, ww * 1.1); c.globalCompositeOperation = 'lighter';   // el cuerpo, en normal, para que no se queme a blanco
  if (Q.plasma) {
    c.save(); c.beginPath(); c.rect(xa, y - ww * 0.5, len, ww); c.clip();   // dos capas de plasma que corren a distinta velocidad
    for (let l = 0; l < 2; l++) { const tw = 256 * (l ? 1.1 : 1.7), off = (((S.t * dir * (900 - l * 400)) % tw) + tw) % tw; c.globalAlpha = alfa * (l ? 0.22 : 0.38); c.save(); c.translate(0, y); c.scale(1, l ? -1 : 1); for (let x = xa - off; x < xa + len; x += tw) c.drawImage(PLASMA, x, -ww * 0.5, tw, ww); c.restore(); }
    c.restore();
    c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; const sep = 120, o2 = (S.t * dir * 700) % sep;   // anillos de energía que viajan por el rayo
    for (let x = (dir > 0 ? xa : xa + len) + o2; dir > 0 ? x < xa + len : x > xa; x += dir * sep) { c.globalAlpha = alfa * 0.5; c.beginPath(); c.ellipse(x, y, ww * 0.09, ww * 0.5, 0, 0, 6.283); c.stroke(); }
  }
  c.globalAlpha = alfa * 0.55; c.drawImage(franja('#ffffff'), xa, y - ww * 0.1, len, ww * 0.2);   // núcleo blanco
  c.globalAlpha = alfa * 0.45; c.fillStyle = '#ff3a6e'; c.fillRect(xa, y - ww * 0.5, len, 2.5); c.fillStyle = '#3a8cff'; c.fillRect(xa, y + ww * 0.48, len, 2.5);   // aberración de color en los bordes
  if (Q.plasma) { c.lineJoin = 'round'; for (let k = 0; k < 3; k++) { c.strokeStyle = k % 2 ? '#ffffff' : col; c.lineWidth = k % 2 ? 1.5 : 3; c.globalAlpha = alfa * 0.8; c.beginPath(); const off = (k - 1) * ww * 0.3; c.moveTo(x0, y + off); for (let x = x0; (x1 - x) * dir > 0; x += 34 * dir) c.lineTo(x, y + off + rnd(-1, 1) * ww * 0.22); c.stroke(); } }
  destello(x0, y, ww, col, alfa, dir);
  c.restore();
}
const FONDO = lienzo(W, H);
(() => { const g = FONDO.getContext('2d'); g.fillStyle = '#060a1a'; g.fillRect(0, 0, W, H); const gr = g.createRadialGradient(W * 0.55, H * 0.35, 10, W * 0.55, H * 0.35, H * 1.1); gr.addColorStop(0, '#1b2f6e'); gr.addColorStop(1, 'rgba(6,10,26,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); })();
let NEB = null, NEBcol = '', nebX = 0;
function nebulosa(col) {   // todas las nebulosas pintadas una vez en una imagen del doble de ancho
  if (NEB && NEBcol === col) return NEB; NEBcol = col; NEB = lienzo(W * 2, H); const g = NEB.getContext('2d'); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.17;
  for (let i = 0; i < 12; i++) { const r = rnd(200, 420), x = rnd(0, W * 2), y = rnd(0, H), im = glow(i % 3 === 0 ? col : i % 3 === 1 ? '#3a4cff' : '#8a2bd6'); for (const dx of [0, -W * 2, W * 2]) g.drawImage(im, x + dx - r, y - r, r * 2, r * 2); }
  return NEB;
}
function dibujaFondo() {
  const F = FACS[S.fac || 'animales'], col = F.col;
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(FONDO, 0, 0);
  nebX = (nebX + 0.5) % (W * 2); const nb = nebulosa(col); c.globalCompositeOperation = 'lighter'; c.drawImage(nb, -nebX, 0); c.drawImage(nb, W * 2 - nebX, 0);
  c.globalAlpha = 1; for (let i = 0; i < Q.estr; i++) { const e = EST[i]; c.globalAlpha = (0.3 + e.z * 0.7) * (0.75 + 0.25 * Math.sin(S.t * 3 + e.t)); c.fillStyle = '#cfe0ff'; const l = 1 + e.z * 1.6 + (S.rayo ? e.z * 14 : 0); c.fillRect(e.x, e.y, l, 1 + e.z * 1.4); }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  for (const p of PLANETAS) {
    if (p.x < -p.anc || p.x > W + p.anc) continue; if (p.luna && !p.cnv) { const im = img(p.luna); if (listo(im)) p.cnv = sombreaLuna(im, p.tam); else continue; }
    if (Q.rel || p.luna) { c.globalCompositeOperation = 'lighter'; brillo(p.x, p.y, p.anc * 0.6, p.atm, 0.09); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }   // halo de atmósfera
    c.drawImage(p.cnv, p.x - p.anc / 2, p.y - p.alt / 2);
  }
  if (Q.gig) dibujaGigantes();
  for (let i = 0; i < Q.rocas; i++) { const r = ROCAS_FONDO[i]; const im = img('enemigos/asteroide' + (r.n > 1 ? '-' + r.n : '') + '.png'); const o = oscuro(im, 0.78 - r.z * 0.3); if (!o) continue; c.save(); c.translate(r.x, r.y); c.rotate(r.rot); c.globalAlpha = 0.3 + r.z * 0.5; c.drawImage(o, -r.tam / 2, -r.tam / 2, r.tam, r.tam); if (r.luz > 0) { const im2 = img('enemigos/asteroide' + (r.n > 1 ? '-' + r.n : '') + '.png'); if (listo(im2)) { c.globalAlpha = Math.min(0.9, r.luz * 0.9); c.drawImage(im2, -r.tam / 2, -r.tam / 2, r.tam, r.tam); } } c.restore(); }
  c.globalAlpha = 1;
}
