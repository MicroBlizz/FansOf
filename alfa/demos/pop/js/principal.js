// Fans of Pop · PRINCIPAL: el lienzo y su tamaño, los toques (una burbuja en la sala, un nodo en el mapa), el teclado,
// el bucle de cada fotograma y el arranque.
'use strict';
const PP_CV = document.getElementById('cv'), PP_CTX = PP_CV.getContext('2d');
const PP_ESCENARIO = document.getElementById('stage'), PP_UI = document.getElementById('pp-ui');

function ppAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, estrecho = bw < 600, pad = estrecho ? 0 : 24;
  const LH = estrecho ? clamp(Math.round((540 * bh) / Math.max(1, bw)), 960, 1170) : 960;
  let w = bw - pad * 2, h = (w * LH) / 540;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * 540) / LH; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * LH) / 540);
  PP_ESCENARIO.style.width = w + 'px'; PP_ESCENARIO.style.height = h + 'px';
  PP_V.H = LH; PP_V.sc = w / 540; PP_V.dpr = Math.min(window.devicePixelRatio || 1, 3);
  PP_CV.width = Math.round(w * PP_V.dpr); PP_CV.height = Math.round(h * PP_V.dpr);
  PP_UI.style.height = LH + 'px'; PP_UI.style.transform = `scale(${w / 540})`;
}
/* ---------- los toques ---------- */
function ppLogico(e) { const r = PP_CV.getBoundingClientRect(); return [(e.clientX - r.left) / PP_V.sc, (e.clientY - r.top) / PP_V.sc]; }
PP_CV.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (!$pp('#pp-modal').hidden || !PP_P) return;
  ppCargaSonidos();
  const [lx, ly] = ppLogico(e);
  if (PP_PANT.actual === 'sala' && PP_P.T) {
    const i = ppCeldaEn(ppGeom(PP_P.T.n), lx, ly);
    if (i >= 0) ppToque(i);
  } else if (PP_PANT.actual === 'mapa') {
    for (const nd of PP_NODOS_MAPA) if (Math.hypot(lx - nd.x, ly - nd.y) <= nd.r) { play('ppNodo'); ppEntra(); break; }
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || PP_PANT.actual === 'titulo') return;
  if (PP_PANT.pausa) ppQuitaPausa(); else ppPausa();   // Esc abre y cierra la pausa (las demás ventanas se cierran con sus botones)
});
/* ---------- el bucle ---------- */
let PP_ULT = 0;
function ppFotograma(ahora) {
  requestAnimationFrame(ppFotograma);
  const dt = Math.min(0.05, (ahora - PP_ULT) / 1000 || 0.016); PP_ULT = ahora;
  const t = ahora / 1000, c = PP_CTX;
  ppMusicaBucle();
  c.setTransform(PP_V.sc * PP_V.dpr, 0, 0, PP_V.sc * PP_V.dpr, 0, 0);
  c.imageSmoothingEnabled = false;
  if (PP_PANT.actual === 'sala' && PP_P && PP_P.T) { if (!PP_PANT.pausa) ppFxAvanza(dt); ppPintaSala(c, t); }
  else if (PP_PANT.actual === 'mapa' && PP_P) ppPintaMapa(c, t);
  else ppPintaPortada(c, t, dt);
}
function ppEmpieza(seguir) {
  ppCargaSonidos(); play('select');
  PP_PORTADA.T = null; PP_FX.celdas = {}; PP_FX.parts = []; PP_FX.saltos = []; PP_FX.textos = []; PP_MAPA.cam = null;
  if (!(seguir && ppSigueCamino())) ppNuevaRuta();
  ppIrA('mapa');
}
function ppArranque() {
  ppCargaImagenes();
  ppAjusta();
  window.addEventListener('resize', ppAjusta);
  $pp('#pp-jugar').onclick = () => ppEmpieza(false);
  $pp('#pp-seguir').onclick = () => ppEmpieza(true);
  $pp('#pp-lola-vale').onclick = () => { play('select'); ppLolaSiguiente(); };
  $pp('#pp-pausa').onclick = () => { play('select'); ppPausa(); };
  $pp('#pp-ayuda').onclick = () => { play('select'); ppAyuda(); };
  $pp('#pp-sonido').onclick = () => { SAVE.muted = !SAVE.muted; ppGuarda(); applyVolume(); ppIrA('titulo'); play('select'); };
  ppIrA('titulo');
  const carga = $pp('#carga'); if (carga) carga.remove();
  requestAnimationFrame(ppFotograma);
}
ppArranque();
