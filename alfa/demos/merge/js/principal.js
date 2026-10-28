// Fans of Merge · PRINCIPAL: el lienzo y su tamaño, los toques (con el dedo: un toque enseña qué pasará y otro planta;
// con el ratón: se ve al pasar por encima y se planta con un clic), el bucle de cada fotograma y el arranque.
'use strict';
const MG_CV = document.getElementById('cv'), MG_CTX = MG_CV.getContext('2d');
const MG_ESCENARIO = document.getElementById('stage'), MG_UI = document.getElementById('mg-ui');

function mgAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, estrecho = bw < 600, pad = estrecho ? 0 : 24;
  const LH = estrecho ? clamp(Math.round((540 * bh) / Math.max(1, bw)), 960, 1170) : 960;
  let w = bw - pad * 2, h = (w * LH) / 540;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * 540) / LH; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * LH) / 540);
  MG_ESCENARIO.style.width = w + 'px'; MG_ESCENARIO.style.height = h + 'px';
  MG_V.H = LH; MG_V.sc = w / 540; MG_V.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  MG_CV.width = Math.round(w * MG_V.dpr); MG_CV.height = Math.round(h * MG_V.dpr);
  MG_UI.style.height = LH + 'px'; MG_UI.style.transform = `scale(${w / 540})`;
  MG_CACHE.clear();
  mgMide();
}
/* ---------- los toques ---------- */
function mgLogico(e) { const r = MG_CV.getBoundingClientRect(); return [(e.clientX - r.left) / MG_V.sc, (e.clientY - r.top) / MG_V.sc]; }
function mgBotonPulsado(id) {
  const P = MG_P;
  if (id === 'pausa') { play('select'); mgAbrePausa(); return; }
  if (P.estado !== 'jugando') return;
  if (id.startsWith('reserva')) { mgReserva(+id.slice(7)); return; }
  if (id === 'rayo') {
    if (P.cargas > 0) { P.modo = P.modo === 'rayo' ? null : 'rayo'; P.sel = null; play('select'); }
    else { play('mgNoVale'); mgFxAviso(tr('Haz {n} fusiones más para cargar el rayo', { n: MG_CFG.cargaHabilidad - P.carga })); }
    return;
  }
  if (id === 'tirachinas' && P.tirachinas > 0) { P.modo = P.modo === 'tirachinas' ? null : 'tirachinas'; P.sel = null; play('select'); }
}
function mgToque(lx, ly, raton) {
  if (MG_PANT.actual !== 'partida' || MG_PANT.pausa) return;
  const b = mgBotonEn(lx, ly); if (b) { mgBotonPulsado(b.id); return; }
  const P = MG_P; if (P.estado !== 'jugando') return;
  const cas = mgCasillaEn(lx, ly); if (!cas) { P.sel = null; P.modo = null; return; }
  const [x, y] = cas;
  if (P.modo) { mgUsaModo(x, y); return; }
  const c = P.B[y][x];
  if (c && c.t === 'cofre' && mgTipoDe(P.actual) !== 'topo') { mgAbreCofre(x, y); return; }
  if (!mgPuedePoner(x, y)) { play('mgNoVale'); P.sel = null; return; }
  if (raton) { mgPon(x, y); return; }
  P.sel = [x, y]; MG_ARRASTRA.activo = true;   // con el dedo: se ve dónde cae mientras lo tienes apoyado y se planta al soltar
}
const MG_ARRASTRA = { activo: false };
function mgArrastra(lx, ly) {
  if (!MG_ARRASTRA.activo || MG_P.estado !== 'jugando') return;
  const cas = mgCasillaEn(lx, ly);
  MG_P.sel = cas && mgPuedePoner(cas[0], cas[1]) ? cas : null;
}
function mgSuelta() {
  if (!MG_ARRASTRA.activo) return; MG_ARRASTRA.activo = false;
  const P = MG_P; if (P.estado !== 'jugando' || MG_PANT.pausa || !P.sel) { P.sel = null; return; }
  const [x, y] = P.sel; P.sel = null; mgPon(x, y);
}
function mgPasa(lx, ly) {   // con el ratón: la previsión sigue al puntero
  if (MG_PANT.actual !== 'partida' || MG_PANT.pausa || MG_P.estado !== 'jugando' || MG_P.modo) return;
  const cas = mgCasillaEn(lx, ly);
  MG_P.sel = cas && mgPuedePoner(cas[0], cas[1]) ? cas : null;
}
MG_CV.addEventListener('pointerdown', e => { e.preventDefault(); try { MG_CV.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ } mgToque(...mgLogico(e), e.pointerType === 'mouse'); });
MG_CV.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') mgPasa(...mgLogico(e)); else mgArrastra(...mgLogico(e)); });
MG_CV.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') mgSuelta(); });
MG_CV.addEventListener('pointercancel', () => { MG_ARRASTRA.activo = false; MG_P.sel = null; });
MG_CV.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && MG_P.estado === 'jugando') MG_P.sel = null; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && MG_PANT.actual === 'partida') { if (MG_PANT.pausa) { mgCierraModal(); MG_PANT.pausa = false; } else mgAbrePausa(); }
});
/* ---------- el bucle ---------- */
let MG_ULT = 0;
function mgFotograma(ahora) {
  requestAnimationFrame(mgFotograma);
  const dt = Math.min(0.05, (ahora - MG_ULT) / 1000 || 0.016); MG_ULT = ahora;
  const t = ahora / 1000, c = MG_CTX;
  mgMusicaBucle();
  c.setTransform(MG_V.sc * MG_V.dpr, 0, 0, MG_V.sc * MG_V.dpr, 0, 0);
  if (MG_PANT.actual === 'partida' && MG_P.estado !== 'nada') { if (!MG_PANT.pausa) mgFxAvanza(dt); mgPintaPartida(c, t, MG_PANT.pausa ? 0 : dt); }
  else mgPintaPortada(c, t, dt);
}
function mgArranque() {
  mgAjusta();
  window.addEventListener('resize', mgAjusta);
  $('#mg-jugar').onclick = () => mgNuevaPartida();
  $('#mg-ayuda').onclick = () => { play('select'); mgAyuda(false); };
  $('#mg-col').onclick = () => { play('select'); mgColeccion(); };
  $('#mg-opc').onclick = () => { play('select'); mgAbreOpciones(false); };
  mgIrA('titulo');
  const carga = $('#carga'); if (carga) carga.remove();
  requestAnimationFrame(mgFotograma);
}
mgArranque();
