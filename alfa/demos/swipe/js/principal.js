// Fans of Swipe · PRINCIPAL: el lienzo y su tamaño, los toques (arrastrar la carta, tocar un lado, la pausa, las reliquias),
// el teclado (flechas), el bucle de cada fotograma, la portada pintada y el arranque.
'use strict';
const SW_CV = document.getElementById('cv'), SW_CTX = SW_CV.getContext('2d');
const SW_ESCENARIO = document.getElementById('stage'), SW_UI = document.getElementById('sw-ui');

function swAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, estrecho = bw < 600, pad = estrecho ? 0 : 24;
  const LH = estrecho ? clamp(Math.round((540 * bh) / Math.max(1, bw)), 960, 1170) : 960;
  let w = bw - pad * 2, h = (w * LH) / 540;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * 540) / LH; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * LH) / 540);
  SW_ESCENARIO.style.width = w + 'px'; SW_ESCENARIO.style.height = h + 'px';
  SW_V.H = LH; SW_V.sc = w / 540; SW_V.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  SW_CV.width = Math.round(w * SW_V.dpr); SW_CV.height = Math.round(h * SW_V.dpr);
  SW_UI.style.height = LH + 'px'; SW_UI.style.transform = `scale(${w / 540})`;
  swMide();
}
/* ---------- los toques ---------- */
function swLogico(e) { const r = SW_CV.getBoundingClientRect(); return [(e.clientX - r.left) / SW_V.sc, (e.clientY - r.top) / SW_V.sc]; }
function swBotonEn(lx, ly) { for (let i = SW_BOTONES.length - 1; i >= 0; i--) { const b = SW_BOTONES[i]; if (lx >= b.x && lx <= b.x + b.w && ly >= b.y && ly <= b.y + b.h) return b; } return null; }
let SW_TOQUE = null;
SW_CV.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (SW_PANT.actual !== 'partida' || SW_PANT.pausa || !SW_P) return;
  const [lx, ly] = swLogico(e);
  try { SW_CV.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ }
  if (swEmpiezaArrastre(lx, ly)) { SW_TOQUE = { carta: true, lx, ly }; return; }
  SW_TOQUE = { carta: false, b: swBotonEn(lx, ly) };
});
SW_CV.addEventListener('pointermove', e => { if (SW_TOQUE && SW_TOQUE.carta) swMueveArrastre(...swLogico(e)); });
function swFinToque(e) {
  const T = SW_TOQUE; SW_TOQUE = null; if (!T) return;
  if (T.carta) {
    const [lx, ly] = swLogico(e);
    // un toque sin arrastrar sobre la carta no hace nada; arrastrar lo decide al soltar
    swSueltaArrastre();
    return;
  }
  const b = T.b; if (!b) return;
  const [lx, ly] = swLogico(e); if (swBotonEn(lx, ly) !== b) return;
  if (b.id === 'pausa') { play('select'); swAbrePausa(); }
  else if (b.id === 'mazo') { play('select'); swMazo(false); }
  else if (b.id.startsWith('rel:')) { play('select'); swInfoReliquia(b.id.slice(4)); }
  else if (b.id === 'lado:L') swLanza('L');
  else if (b.id === 'lado:R') swLanza('R');
}
SW_CV.addEventListener('pointerup', swFinToque);
SW_CV.addEventListener('pointercancel', () => { SW_TOQUE = null; SW_G.arrastra = false; });
document.addEventListener('keydown', e => {
  if (SW_PANT.actual !== 'partida') return;
  if (e.key === 'Escape') { if (SW_PANT.pausa) { swCierraModal(); SW_PANT.pausa = false; } else swAbrePausa(); return; }
  if (SW_PANT.pausa) return;
  if (e.key === 'ArrowLeft' || e.key === 'a') swLanza('L');
  if (e.key === 'ArrowRight' || e.key === 'd') swLanza('R');
});
/* ---------- la portada (pintada) ---------- */
const SW_PORTADA = { carta: { tipo: 'accion', id: 'garrote', mejor: false } };
function swPintaPortada(c, t) {
  swPintaFondo(c, 'fondo-vestibulo', t);
  SW_FX.mano = Math.max(0, Math.sin(t * 1.3) * 1.2 - 0.6);
  swPintaManos(c, t);
  swTitulo(c, 'FANS OF', 270, 120, 54);
  swTitulo(c, 'SWIPE', 270, 190, 92);
  swTexto(c, tr('La Torre de Microblizz'), 270, 262, 24, '#fff6d8');
  // una carta que se balancea de un lado a otro, como enseñando el gesto
  const fake = { piso: 1, reliquias: [], mazo: [], C: null, fuerzaBase: 0, vida: 1, oro: 0 };
  const lado = Math.sin(t * 1.6);
  c.save(); c.translate(270 + lado * 46, 470); c.rotate(lado * 0.12); c.scale(0.8, 0.8);
  swDibujaCartaEn(c, fake, SW_PORTADA.carta, t, Math.abs(lado) > 0.5 ? Math.sign(lado) : 0);
  c.restore();
  swDibujaC(c, 'i-flecha', 92, 470, 3, true); swDibujaC(c, 'i-flecha', 448, 470, 3);
}
/* ---------- el bucle ---------- */
let SW_ULT = 0;
function swFotograma(ahora) {
  requestAnimationFrame(swFotograma);
  const dt = Math.min(0.05, (ahora - SW_ULT) / 1000 || 0.016); SW_ULT = ahora;
  const t = ahora / 1000, c = SW_CTX;
  swMusicaBucle();
  c.setTransform(SW_V.sc * SW_V.dpr, 0, 0, SW_V.sc * SW_V.dpr, 0, 0);
  c.imageSmoothingEnabled = false;
  if (SW_PANT.actual === 'partida' && SW_P) {
    if (!SW_PANT.pausa) { swFxAvanza(dt); const lento = SW_FX.paron > 0 ? dt * 0.08 : dt; swAvanzaCola(lento); swAvanzaMecha(lento); }
    if (!SW_P.C || SW_P.C.racha < SW_CFG.frenesi) SW_FX.frenesi = 0;
    swPintaPartida(c, t, SW_PANT.pausa ? 0 : dt);
  } else { swFxAvanza(dt); swPintaPortada(c, t); }
}
function swArranque() {
  swCargaImagenes();
  swAjusta();
  window.addEventListener('resize', swAjusta);
  $('#sw-jugar').onclick = () => swEmpieza(false);
  $('#sw-seguir').onclick = () => swEmpieza(true);
  $('#sw-ayuda').onclick = () => { play('select'); swAyuda(false); };
  $('#sw-col').onclick = () => { play('select'); swColeccion(); };
  $('#sw-opc').onclick = () => { play('select'); swAbreOpciones(false); };
  swIrA('titulo');
  const carga = $('#carga'); if (carga) carga.remove();
  requestAnimationFrame(swFotograma);
}
swArranque();
