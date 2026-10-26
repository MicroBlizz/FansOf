// Fans of Cooking · PRINCIPAL: el tamaño del lienzo, el bucle (paso fijo para la simulación, dibujo en cada fotograma) y el arranque.
'use strict';
const CK_CV = document.getElementById('cv'), CK_CTX = CK_CV.getContext('2d'), CK_ESC = document.getElementById('stage'), CK_UI = document.getElementById('ck-ui');
const CK_V = { sc: 1, dpr: 1, lw: 960, lh: 600 };
window.enPartida = () => PANT.enPartida() && !!PARTIDA.get() && PARTIDA.get().fase !== 'fin';   // lo pregunta core (por ejemplo, para no tapar el aviso con la cuenta)

function ckAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 700 ? 0 : 16;
  const lw = CK_V.lw, lh = CK_V.lh;
  let w = bw - pad * 2, h = (w * lh) / lw;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * lw) / lh; }
  w = Math.floor(w); h = Math.floor((w * lh) / lw);
  CK_ESC.style.width = w + 'px'; CK_ESC.style.height = h + 'px';
  CK_V.sc = w / lw; CK_V.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  CK_CV.width = Math.round(w * CK_V.dpr); CK_CV.height = Math.round(h * CK_V.dpr);
  CK_UI.style.width = lw + 'px'; CK_UI.style.height = lh + 'px'; CK_UI.style.transform = `scale(${w / lw})`;
  PINTAR.tamano(lw, lh);
}
addEventListener('resize', ckAjusta);

/* ---------- el bucle ---------- */
let ckAntes = 0, ckAcum = 0, ckT = 0;
function ckFotograma(ahora) {
  requestAnimationFrame(ckFotograma);
  const dt = Math.min(0.1, (ahora - ckAntes) / 1000 || 0.016); ckAntes = ahora; ckT += dt;
  const k = CK_V.sc * CK_V.dpr, c = CK_CTX; c.setTransform(k, 0, 0, k, 0, 0);
  const P = PARTIDA.get();
  if (P) {
    if (!P.pausa && P.fase === 'juego') {
      if (CONTROLES.pausaPulsada()) { PANT.pausa(); }
      else { CONTROLES.volcar(P); for (ckAcum += dt; ckAcum >= COOK.paso; ckAcum -= COOK.paso) PARTIDA.paso(); }
    }
    HUD.procesa(P, PARTIDA.sucesos());
    PINTAR.frame(c, P, P.pausa ? 0 : dt, ckT); HUD.frame(c, P, P.pausa ? 0 : dt);
    PANT.revisa();
  } else {   // en las pantallas: una cocina de fondo, vacía y a media luz
    PINTAR.fondo(c, ckT);
  }
}
ckAjusta(); PANT.inicia(); requestAnimationFrame(ckFotograma);
