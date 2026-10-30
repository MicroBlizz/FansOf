// Fans of Asalto · PRINCIPAL: el lienzo y su tamaño (540x960 lógicos, escalado al móvil), los toques (botones del lienzo, arrastrar a
// los héroes por la cuadrícula y soltarlos en la tienda para venderlos), el bucle de cada fotograma y el arranque.
'use strict';
const AS_CV = document.getElementById('cv'), AS_CTX = AS_CV.getContext('2d');
const AS_ESCENARIO = document.getElementById('stage'), AS_UI = document.getElementById('as-ui');
const AS_TOQUE = { boton: null };
const AS_DRAG = { h: null, mov: false, x: 0, y: 0, x0: 0, y0: 0, celda: null };

function asAjusta() {
  // El juego se pinta en un lienzo pequeño de 270 de ancho y se amplía un número ENTERO de veces en píxeles reales de la pantalla:
  // así cada píxel del dibujo ocupa exactamente 3x3, 4x4… y nada sale borroso. El ALTO se adapta al móvil (de 440 a 640 píxeles):
  // la pantalla se llena entera y lo que sobra se lo queda la arena.
  const dpr = window.devicePixelRatio || 1, bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 600 ? 0 : 20;
  const maxW = (bw - pad * 2) * dpr, maxH = (bh - pad * 2) * dpr;
  const k = Math.floor(Math.min(maxW / 270, maxH / 440));
  let devW, devH, alto;
  if (k >= 2) { alto = clamp(Math.floor(maxH / k), 440, 640); devW = 270 * k; devH = alto * k; }
  else { alto = 480; const s = Math.min(maxW / 270, maxH / 480); devW = Math.max(270, Math.floor(270 * s)); devH = Math.round(devW * 480 / 270); }
  const w = devW / dpr, h = devH / dpr;
  const st = AS_ESCENARIO.style;
  st.width = w + 'px'; st.height = h + 'px';
  st.position = 'absolute';   // en un píxel entero de la pantalla, para que el navegador no lo vuelva a muestrear
  st.left = Math.round((bw - w) / 2 * dpr) / dpr + 'px'; st.top = Math.round((bh - h) / 2 * dpr) / dpr + 'px';
  AS_V.sc = w / 540; AS_V.dpr = dpr; AS_V.H = alto * 2;
  AS_CV.width = devW; AS_CV.height = devH;
  AS_BUF.width = 270; AS_BUF.height = alto;
  // el panel de abajo mide siempre lo mismo (270); la arena se estira con el resto
  AS_Y = AS_V.H - 270; AS_ARENA.h = AS_Y - AS_ARENA.y;
  AS_UI.style.height = AS_V.H + 'px';
  AS_UI.style.zoom = w / 540;   // zoom (no transform): el navegador vuelve a dibujar las letras a su tamaño y no las emborrona
}
function asLogico(e) { const r = AS_CV.getBoundingClientRect(); return [(e.clientX - r.left) / AS_V.sc, (e.clientY - r.top) / AS_V.sc]; }
function asJugando() { return AS_PANT.actual === 'partida' && AS_P && !AS_PANT.pausa && $('#as-modal').hidden; }

/* ---------- los botones del lienzo ---------- */
function asPulsa(b) {
  const id = b.id, P = AS_P;
  if (id === 'pausa') { play('select'); asAbrePausa(); return; }
  if (id === 'vel') { P.vel = P.vel === 1 ? 2 : 1; play('select'); return; }
  if (id === 'equipo') { play('select'); AS_PANT.pausa = true; asInfoEquipo(); return; }
  if (id.startsWith('clase-')) { play('select'); asInfoClase(id.slice(6)); return; }
  if (id.startsWith('ir-') && b.nodo) { asIrA(b.nodo); return; }
  if (P.estado === 'tienda') {
    if (id === 'lucha') { play('select'); asLucha(); }
    else if (id.startsWith('carta')) asCompra(+id.slice(5));
    else if (id === 'mejorar') asMejoraTienda();
    else if (id === 'refrescar') asRefresca();
  } else if (P.estado === 'cofre') {
    if (id === 'cofre-abrir') asAbreCofre(1);
    else if (id === 'cofre-doble') asAnuncio(() => asAbreCofre(2));
    else if (id === 'cofre-sigue') { play('select'); asSalaHecha(); }
  }
}
// en la partida, el equipo solo se mira (las estadísticas que da)
function asInfoEquipo() {
  const s = asStatsEquipo(), lis = Object.keys(AS_EQUIPO.stats).filter(k => s[k]).map(k => `<li><span>${asH(tr(AS_EQUIPO.stats[k]))}</span><b>+${s[k]} %</b></li>`).join('');
  asModal(`<h2>${tr('TU EQUIPO')}</h2><p class="as-sub">${tr('Lo que llevas puesto vale para todos los héroes.')}</p>${lis ? `<ul class="as-stats">${lis}</ul>` : `<p>${tr('No llevas nada puesto: los objetos se ponen en el menú.')}</p>`}<button class="as-btn2" id="as-c-ok" type="button">${tr('VALE')}</button>`);
  $('#as-c-ok').onclick = () => { play('select'); asCierraModal(); AS_PANT.pausa = false; };
}
// ¿hay un héroe del equipo en ese punto? (solo en la tienda se pueden mover)
function asHeroeEn(x, y) {
  if (!AS_P || AS_P.estado !== 'tienda') return null;
  let mejor = null, dm = 22;
  for (const h of AS_P.equipo) { const [cx, cy] = asCelda(h.celda[0], h.celda[1]), d = Math.hypot(x - cx, y - (cy - 14)); if (d < dm) { dm = d; mejor = h; } }
  return mejor;
}
function asCeldaCerca(x, y) {
  let mejor = null, dm = 40;
  for (let c = 0; c < AS_COLS; c++) for (let f = 0; f < AS_FILAS; f++) { const [cx, cy] = asCelda(c, f), d = Math.hypot(x - cx, y - (cy - 14)); if (d < dm) { dm = d; mejor = [c, f]; } }
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
  AS_DRAG.x = x; AS_DRAG.y = y; AS_DRAG.celda = y < AS_Y ? asCeldaCerca(x, y) : null;
});
AS_CV.addEventListener('pointerup', e => {
  const [x, y] = asLogico(e);
  if (AS_TOQUE.boton) { const b = asBotonEn(x, y), id = AS_TOQUE.boton; AS_TOQUE.boton = null; if (b && b.id === id && asJugando()) asPulsa(b); return; }
  const D = AS_DRAG; if (!D.h) return;
  const h = D.h; D.h = null;
  if (!D.mov) { const d = AS_HEROES[h.tipo]; asAviso(tr('{n} · {c}', { n: tr(d.nombre), c: d.clases.map(k => tr(AS_CLASES[k].nombre)).join(' + ') }), true); return; }
  if (y >= AS_Y) asVende(h);
  else if (D.celda) asMueve(h, D.celda);
});
AS_CV.addEventListener('pointercancel', () => { AS_DRAG.h = null; AS_TOQUE.boton = null; });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && AS_PANT.actual === 'partida') { if (AS_PANT.pausa) { asCierraModal(); AS_PANT.pausa = false; } else asAbrePausa(); }
});

/* ---------- la portada (detrás del menú) ---------- */
function asPintaPortada(c, t) {
  c.fillStyle = '#2b2d6b'; c.fillRect(0, 0, 540, AS_V.H);
  c.imageSmoothingEnabled = false;
  if (AS_IMG.portada) { const im = AS_IMG.portada, h = im.height * 2; c.drawImage(im, 0, 0, im.width, im.height, 0, Math.min(0, AS_V.H - h), 540, h); }
  // el desfile de los Animales Locos por abajo
  const lista = Object.keys(AS_HEROES).filter(asHay);
  lista.forEach((k, i) => { const x = ((t * 40 + i * 60) % 620) - 40; asPintaMuneco(c, { tipo: k, anim: 'andar', tAnim: t + i * 0.3, lado: 'heroe', id: i, escala: 1.6 }, x, AS_V.H - 30, t); });
}

/* ---------- el bucle ---------- */
// Todo se pinta en un lienzo pequeño (270x480, la mitad) y se amplía sin suavizar: así el texto, las sombras, los giros y los
// efectos salen con los mismos píxeles gordos que los dibujos de Yoshi. Nada se ve liso ni vectorial.
const AS_BUF = document.createElement('canvas'); AS_BUF.width = 270; AS_BUF.height = 480;   // el alto lo pone asAjusta
const AS_BCTX = AS_BUF.getContext('2d');
// En el lienzo pequeño (que se pinta con medidas de 540x960 y escala 0.5) cada rectángulo se encaja en su píxel: si cayera en medio
// píxel, el navegador lo suavizaría y saldría un borde borroso.
(() => {
  const fr = AS_BCTX.fillRect.bind(AS_BCTX), par = v => Math.round(v / 2) * 2;
  AS_BCTX.fillRect = (x, y, w, h) => { const x0 = par(x), y0 = par(y), x1 = par(x + w), y1 = par(y + h); if (x1 > x0 && y1 > y0) fr(x0, y0, x1 - x0, y1 - y0); };
})();
let AS_ULT = 0, AS_TRAS = false;
function asFotograma(ahora) {
  requestAnimationFrame(asFotograma);
  const dt = Math.min(0.05, (ahora - AS_ULT) / 1000 || 0.016); AS_ULT = ahora;
  const t = ahora / 1000, c = AS_BCTX;
  asMusicaBucle();
  c.setTransform(0.5, 0, 0, 0.5, 0, 0);
  c.imageSmoothingEnabled = false;
  if (AS_PANT.actual === 'partida' && AS_P) {
    const P = AS_P;
    if (P.estado === 'batalla' && AS_B && !AS_PANT.pausa) {
      const pasos = P.vel;
      for (let i = 0; i < pasos; i++) asAvanzaBatalla(dt);
      if (AS_B.fin && AS_B.tFin > 1.3 && !AS_TRAS) { AS_TRAS = true; asTrasBatalla(); }
    } else if (P.estado === 'camino' && P.camino) { P.camino.t += dt; if (P.camino.t >= P.camino.dura) asLlega(); }
    else if (P.estado === 'cofre' && P.cofre) { P.cofre.t += dt; if (P.cofre.abierto) P.cofre.tAbre += dt; }
    else if (P.estado === 'altar' && P.altar) P.altar.t += dt;
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
  $('#as-equipo').onclick = () => { play('select'); asPantallaEquipo(); };
  $('#as-herreria').onclick = () => { play('select'); asPantallaHerreria(); };
  $('#as-logros').onclick = () => { play('select'); asPantallaLogros(); };
  $('#as-tienda').onclick = () => { play('select'); asPantallaTienda(); };
  $('#as-ajustes').onclick = () => { play('select'); asAjustes(); };
  asCargaIconos();
  // las letras de píxeles: el texto se guarda ya dibujado (AS_TXT), así que hay que esperar a que lleguen; si llegan tarde, se borra lo guardado
  if (document.fonts) document.fonts.addEventListener('loadingdone', () => AS_TXT.clear());
  const letras = document.fonts ? Promise.race([Promise.all(['16px "Jersey 10"', '32px "Jersey 10"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]) : Promise.resolve();
  asCargaImagenes(() => letras.then(() => {
    AS_TXT.clear();
    asMenu();
    const carga = $('#carga'); if (carga) carga.remove();
    requestAnimationFrame(asFotograma);
  }));
}
asArranque();
