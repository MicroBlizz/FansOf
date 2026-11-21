// Fans of Island · EL LIENZO NÍTIDO: se pinta en pequeño (píxeles gordos, ctx) y se copia a la pantalla a tamaño real del móvil
// con un aumento entero y sin suavizar, así no hay borrosidad. ajusta() lo recalcula al girar el móvil.
'use strict';
const vista = document.getElementById('lienzo'), vctx = vista.getContext('2d');
const buf = document.createElement('canvas'), ctx = buf.getContext('2d');
const PANTALLA = { esc: 2 };   // cuántas veces se amplía cada píxel
let VW = 300, VH = 200, BASE = 140;
function ajusta() {
  const dpr = window.devicePixelRatio || 1;
  const bw = Math.round(innerWidth * dpr), bh = Math.round(innerHeight * dpr);
  vista.width = bw; vista.height = bh;
  vista.style.width = (bw / dpr) + 'px'; vista.style.height = (bh / dpr) + 'px';
  PANTALLA.esc = Math.max(2, Math.round(Math.min(bw, bh) / 240));
  VW = Math.ceil(bw / PANTALLA.esc); VH = Math.ceil(bh / PANTALLA.esc);
  buf.width = VW; buf.height = VH;
  BASE = Math.round(VH * 0.66);
  ctx.imageSmoothingEnabled = false; vctx.imageSmoothingEnabled = false;
  document.getElementById('girar').classList.toggle('oculto', innerWidth >= innerHeight);
}
function presenta() { vctx.drawImage(buf, 0, 0, VW, VH, 0, 0, VW * PANTALLA.esc, VH * PANTALLA.esc); }
addEventListener('resize', ajusta); ajusta();
