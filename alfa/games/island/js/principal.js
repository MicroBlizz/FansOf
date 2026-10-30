// Fans of Island · PRINCIPAL: la lona de píxel gordo (270 de alto; el ancho se adapta a la pantalla), que se amplía sin suavizar al
// lienzo de verdad; el bucle de cada fotograma (fondo, decorado, plataformas, meta, personajes y marcador) y el arranque. La capa de
// HTML (portada, ventanas, mandos) sigue siendo de 540 de alto lógico, como el resto de la serie.
'use strict';
const IS_CV = document.getElementById('cv'), IS_CTX = IS_CV.getContext('2d');
const IS_ESCENARIO = document.getElementById('stage'), IS_UI = document.getElementById('is-ui');
const IS_V = { W: 480, H: 270, uiW: 960, uiH: 540, sc: 1, dpr: 1, tactil: matchMedia('(pointer: coarse)').matches };
let IS_LONA = lienzoNuevo(480, 270), IS_L = IS_LONA.getContext('2d');
function isAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight;
  IS_V.W = Math.round(clamp((bw / bh) * 270, 400, 640)); IS_V.uiW = IS_V.W * 2;
  const sc = Math.min(bw / IS_V.uiW, bh / IS_V.uiH), w = Math.floor(IS_V.uiW * sc), h = Math.floor(IS_V.uiH * sc);
  IS_V.sc = sc; IS_V.dpr = Math.min(window.devicePixelRatio || 1, 2);
  IS_ESCENARIO.style.width = w + 'px'; IS_ESCENARIO.style.height = h + 'px';
  IS_CV.width = Math.round(w * IS_V.dpr); IS_CV.height = Math.round(h * IS_V.dpr);
  IS_UI.style.width = IS_V.uiW + 'px'; IS_UI.style.height = IS_V.uiH + 'px'; IS_UI.style.transform = `scale(${sc})`;
  if (IS_LONA.width !== IS_V.W) { IS_LONA = lienzoNuevo(IS_V.W, 270); IS_L = IS_LONA.getContext('2d'); }
  if (IS_P.mundo) isCamaraColoca(IS_P.mundo, IS_P.jugadores[0], IS_P.jugadores[1], IS_V.W);
}
function isPintaHud(c) {
  const m = IS_P.mundo, W = IS_V.W;
  escribe(c, tr(m.def.nombre), 4, 4, { c: BLANCO_ROTULO });
  escribe(c, fmtV(Math.floor(IS_P.tiempo * 10) / 10) + ' s', 4, 16, { fuente: 'mini', c: '#fff6ea' });
  // las zanahorias pequeñas cogidas, arriba a la derecha
  const txt = IS_P.cosecha + '/' + IS_P.cosechaTotal, ancho = escribe(c, txt, W - 54, 4, { alin: 'der', c: IS_P.cosecha === IS_P.cosechaTotal ? ORO_ROTULO : BLANCO_ROTULO });   // a la izquierda del botón de pausa
  pintaSpr(c, isCacheado('zana-peq', () => isDibujaZanahoria(MAT.capa, false)), W - 54 - ancho - 8, 15);
  if (IS_P.aviso > 0) {   // la pista, debajo del nombre, sin pisar el botón de pausa
    const msg = IS_P.avisoTexto || (IS_P.humanos === 2 ? tr('Llegad juntos a la bandera. Si uno se cae, el otro lo rescata.') : tr('Llega a la bandera. Mantén el salto para flotar; L coge y lanza a SlyFox.'));
    c.globalAlpha = Math.min(1, IS_P.aviso);
    envuelve(msg, W - 70, 1, 'normal').forEach((l, i) => escribe(c, l, W / 2, 34 + i * 11, { alin: 'centro', c: '#fff6ea' }));
    c.globalAlpha = 1;
  }
}
function isPinta(t) {
  const c = IS_L, W = IS_V.W, H = IS_V.H;
  isFondoPinta(c, W, H, IS_CAM.x, t, IS_P.mundo && IS_P.mundo.def.paleta);
  if (!IS_P.mundo) isPintaPortada(c, W, t);
  else {
    const m = IS_P.mundo, cx = Math.round(IS_CAM.x);
    for (const d of m.decor) if (d.x > cx - 80 && d.x < cx + W + 80) isPintaDecor(c, d, cx, t);
    for (const p of m.plataformas) if (p.x + p.w > cx - 12 && p.x < cx + W + 12) isPintaPlataforma(c, p, cx, t);
    for (const b of m.interruptores) isPintaInterruptor(c, b, cx, t);
    for (const e of m.enemigos) if (e.x > cx - 40 && e.x < cx + W + 40) isPintaEnemigo(c, e, cx, t);
    for (const z of m.pequenas) if (!z.cogida && z.x > cx - 20 && z.x < cx + W + 20) isPintaPequena(c, z, cx, t);
    for (const z of m.zanahorias) if (!z.cogida && z.x > cx - 20 && z.x < cx + W + 20) isPintaZanahoria(c, z, cx, t);
    isPintaMeta(c, m.meta, cx, t);
    const [a, b] = IS_P.jugadores, dos = IS_P.humanos === 2;
    const orden = a.llevadoPor ? [b, a] : [a, b];   // el que va a cuestas se pinta encima
    for (const p of orden) isPintaPersonaje(c, p, cx, t, dos ? (p === a ? 'P1' : 'P2') : '');
    if (IS_P.estado === 'juego' || IS_P.estado === 'pausa') isPintaHud(c);
  }
  // de la lona al lienzo de verdad, sin suavizar: píxel gordo
  const g = IS_CTX; g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(IS_LONA, 0, 0, IS_CV.width, IS_CV.height);
}
// en la portada: un trozo de pradera con los dos esperando
function isPintaPortada(c, W, t) {
  const s = isCacheado('suelo-portada-' + W, () => isDibujaSuelo({ id: 999, w: W + 4, h: 60 }));
  c.drawImage(s.c, -2 - s.ox, 220 - s.oy);
  const S = isSprites(), k = Math.floor(t * 1.6) % 2;
  pintaSpr(c, S.fox.normal.quieto[k], Math.round(W * 0.22) + 44, 220, true);
  pintaSpr(c, S.bunny.normal.quieto[1 - k], Math.round(W * 0.22), 220);
}
let IS_ULT = 0;
function isFotograma(ahora) {
  const dt = Math.min(1 / 30, (ahora - IS_ULT) / 1000 || 0); IS_ULT = ahora;
  if (IS_P.estado === 'juego') isPartidaActualiza(dt);
  else if (IS_P.estado === 'titulo') IS_CAM.x += 20 * dt;   // en la portada el paisaje pasa despacio
  isPinta(ahora / 1000);
  isEntradaFin(); isVigilaMusica();
  requestAnimationFrame(isFotograma);
}
function isArranque() {
  isAjusta(); window.addEventListener('resize', isAjusta);
  isEntradaArranca(); isPantallasArranca();
  isIrA('titulo');
  requestAnimationFrame(isFotograma);
}
isArranque();
