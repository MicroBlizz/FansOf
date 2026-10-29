// Fans of Asalto · PRINCIPAL: el lienzo y su tamaño (540x960 lógicos, escalado al móvil), los toques (botones del lienzo, arrastrar a
// los héroes por la cuadrícula y soltarlos en la tienda para venderlos), el bucle de cada fotograma y el arranque.
'use strict';
const AS_CV = document.getElementById('cv'), AS_CTX = AS_CV.getContext('2d');
const AS_ESCENARIO = document.getElementById('stage'), AS_UI = document.getElementById('as-ui');
const AS_TOQUE = { boton: null };
const AS_DRAG = { h: null, mov: false, x: 0, y: 0, x0: 0, y0: 0, celda: null };

function asAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 600 ? 0 : 20;
  let w = bw - pad * 2, h = (w * 960) / 540;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * 540) / 960; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * 960) / 540);
  AS_ESCENARIO.style.width = w + 'px'; AS_ESCENARIO.style.height = h + 'px';
  AS_V.sc = w / 540; AS_V.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  AS_CV.width = Math.round(w * AS_V.dpr); AS_CV.height = Math.round(h * AS_V.dpr);
  AS_UI.style.transform = `scale(${w / 540})`;
}
function asLogico(e) { const r = AS_CV.getBoundingClientRect(); return [(e.clientX - r.left) / AS_V.sc, (e.clientY - r.top) / AS_V.sc]; }
function asJugando() { return AS_PANT.actual === 'partida' && AS_P && !AS_PANT.pausa && $('#as-modal').hidden; }

/* ---------- los botones del lienzo ---------- */
function asPulsa(b) {
  const id = b.id, P = AS_P;
  if (id === 'pausa') { play('select'); asAbrePausa(); return; }
  if (id === 'vel') { P.vel = P.vel === 1 ? 2 : 1; play('select'); return; }
  if (id.startsWith('clase-')) { play('select'); asInfoClase(id.slice(6)); return; }
  if (P.estado === 'tienda') {
    if (id === 'lucha') { play('select'); asLucha(); }
    else if (id.startsWith('carta')) asCompra(+id.slice(5));
    else if (id === 'mejorar') asMejoraTienda();
    else if (id === 'refrescar') asRefresca();
  } else if (P.estado === 'mapa' && b.nodo) asIrA(b.nodo);
}
// ¿hay un héroe del equipo en ese punto? (solo en la tienda se pueden mover)
function asHeroeEn(x, y) {
  if (!AS_P || AS_P.estado !== 'tienda') return null;
  let mejor = null, dm = 34;
  for (const h of AS_P.equipo) { const [cx, cy] = asCelda('heroe', h.celda[0], h.celda[1]), d = Math.hypot(x - cx, y - (cy - 24)); if (d < dm) { dm = d; mejor = h; } }
  return mejor;
}
function asCeldaCerca(x, y) {
  let mejor = null, dm = 56;
  for (let c = 0; c < AS_COLS; c++) for (let f = 0; f < AS_FILAS; f++) { const [cx, cy] = asCelda('heroe', c, f), d = Math.hypot(x - cx, y - (cy - 24)); if (d < dm) { dm = d; mejor = [c, f]; } }
  return mejor;
}
AS_CV.addEventListener('pointerdown', e => {
  e.preventDefault(); if (!asJugando()) return;
  try { AS_CV.setPointerCapture(e.pointerId); } catch (er) { /* sin captura */ }
  const [x, y] = asLogico(e), b = asBotonEn(x, y);
  if (b) { AS_TOQUE.boton = b.id; return; }
  const h = asHeroeEn(x, y);
  if (h) Object.assign(AS_DRAG, { h, mov: false, x, y, x0: x, y0: y, celda: null });
});
AS_CV.addEventListener('pointermove', e => {
  if (!AS_DRAG.h) return;
  const [x, y] = asLogico(e);
  if (!AS_DRAG.mov && Math.hypot(x - AS_DRAG.x0, y - AS_DRAG.y0) > 8) AS_DRAG.mov = true;
  AS_DRAG.x = x; AS_DRAG.y = y; AS_DRAG.celda = y < 604 ? asCeldaCerca(x, y) : null;
});
AS_CV.addEventListener('pointerup', e => {
  const [x, y] = asLogico(e);
  if (AS_TOQUE.boton) { const b = asBotonEn(x, y), id = AS_TOQUE.boton; AS_TOQUE.boton = null; if (b && b.id === id && asJugando()) asPulsa(b); return; }
  const D = AS_DRAG; if (!D.h) return;
  const h = D.h; D.h = null;
  if (!D.mov) { const d = AS_HEROES[h.tipo]; asAviso(tr('{n} · nivel {v} · {c}', { n: tr(d.nombre), v: h.nivel, c: d.clases.map(k => tr(AS_CLASES[k].nombre)).join(' + ') }), true); return; }
  if (y >= 604) asVende(h);
  else if (D.celda) asMueve(h, D.celda);
});
AS_CV.addEventListener('pointercancel', () => { AS_DRAG.h = null; AS_TOQUE.boton = null; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && AS_PANT.actual === 'partida') { if (AS_PANT.pausa) { asCierraModal(); AS_PANT.pausa = false; } else asAbrePausa(); }
});

/* ---------- la portada (detrás del menú) ---------- */
function asPintaPortada(c, t) {
  c.fillStyle = '#2b2d6b'; c.fillRect(0, 0, 540, 960);
  c.imageSmoothingEnabled = false;
  if (AS_IMG.portada) { const im = AS_IMG.portada, h = im.height * 2; c.drawImage(im, 0, 0, im.width, im.height, 0, Math.min(0, 960 - h), 540, h); }
  // el desfile de los Animales Locos por abajo
  const lista = Object.keys(AS_HEROES).filter(asHay);
  lista.forEach((k, i) => { const x = ((t * 40 + i * 70) % 640) - 50; asPintaMuneco(c, { tipo: k, anim: 'andar', tAnim: t + i * 0.3, lado: 'heroe', id: i }, x, 920, t); });
}

/* ---------- el bucle ---------- */
// Todo se pinta en un lienzo pequeño (270x480, la mitad) y se amplía sin suavizar: así el texto, las sombras, los giros y los
// efectos salen con los mismos píxeles gordos que los dibujos de Yoshi. Nada se ve liso ni vectorial.
const AS_BUF = document.createElement('canvas'); AS_BUF.width = 270; AS_BUF.height = 480;
const AS_BCTX = AS_BUF.getContext('2d');
let AS_ULT = 0, AS_TRAS = false;
function asFotograma(ahora) {
  requestAnimationFrame(asFotograma);
  const dt = Math.min(0.05, (ahora - AS_ULT) / 1000 || 0.016); AS_ULT = ahora;
  const t = ahora / 1000, c = AS_BCTX;
  asMusicaBucle();
  c.setTransform(0.5, 0, 0, 0.5, 0, 0);
  c.imageSmoothingEnabled = false;
  if (AS_PANT.actual === 'partida' && AS_P) {
    if (AS_P.estado === 'batalla' && AS_B && !AS_PANT.pausa) {
      const pasos = AS_P.vel;
      for (let i = 0; i < pasos; i++) asAvanzaBatalla(dt);
      if (AS_B.fin && AS_B.tFin > 1.3 && !AS_TRAS) { AS_TRAS = true; asTrasBatalla(); }
    }
    if (AS_P && AS_P.estado !== 'batalla') AS_TRAS = false;
    if (AS_P) asPintaPartida(c, t);
  } else asPintaPortada(c, t);
  const g = AS_CTX;
  g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
  g.drawImage(AS_BUF, 0, 0, AS_CV.width, AS_CV.height);
}
function asArranque() {
  asAjusta();
  window.addEventListener('resize', asAjusta);
  $('#as-jugar').onclick = () => { play('select'); asEntrar(); };
  $('#as-equipo').onclick = () => asProximamente(tr('Equipo'));
  $('#as-herreria').onclick = () => asProximamente(tr('Herrería'));
  $('#as-logros').onclick = () => asProximamente(tr('Logros'));
  $('#as-tienda').onclick = () => asProximamente(tr('Tienda'));
  $('#as-ajustes').onclick = () => { play('select'); asAjustes(); };
  asCargaIconos();
  asCargaImagenes(() => {
    asMenu();
    const carga = $('#carga'); if (carga) carga.remove();
    requestAnimationFrame(asFotograma);
  });
}
asArranque();
