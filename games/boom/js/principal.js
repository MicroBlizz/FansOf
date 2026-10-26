// Fans of Boom · PRINCIPAL: el tamaño del lienzo, el bucle (paso fijo para la simulación, dibujo en cada fotograma), los toques y el arranque.
'use strict';
const BM_CV = document.getElementById('cv'), BM_CTX = BM_CV.getContext('2d'), BM_ESC = document.getElementById('stage'), BM_UI = document.getElementById('bm-ui');
const BM_V = { sc: 1, dpr: 1 };
window.enPartida = () => PANT.enPartida() && !!PARTIDA.get() && PARTIDA.get().fase !== 'fin';   // lo pregunta core (por ejemplo, para no tapar el aviso con la cuenta)

function bmAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 700 ? 0 : 16;
  const lw = bw < bh * 0.9 ? clamp(Math.round(BOOM.mundo.alto * (bw - pad * 2) / Math.max(1, bh - pad * 2)), 480, 640) : 960;   // en vertical el mundo se ve más estrecho y se aprovecha toda la altura (los botones, en dos filas)
  const alto = clamp(Math.round(lw * (bh - pad * 2) / Math.max(1, bw - pad * 2)), lw === 960 ? 420 : 640, BOOM.mundo.alto);
  let w = bw - pad * 2, h = (w * alto) / lw;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * lw) / alto; }
  w = Math.floor(w); h = Math.floor((w * alto) / lw);
  BM_ESC.style.width = w + 'px'; BM_ESC.style.height = h + 'px';
  BM_V.sc = w / lw; BM_V.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  BM_CV.width = Math.round(w * BM_V.dpr); BM_CV.height = Math.round(h * BM_V.dpr);
  BM_UI.style.width = lw + 'px'; BM_UI.style.height = alto + 'px'; BM_UI.style.transform = `scale(${w / lw})`; BM_UI.classList.toggle('bm-estrecho', lw < 800);
  PINTAR.tamano(lw, alto);
}
addEventListener('resize', bmAjusta);

/* ---------- los toques sobre el lienzo (el minimapa y el tirachinas) ---------- */
const bmLogico = e => { const r = BM_CV.getBoundingClientRect(); return [(e.clientX - r.left) / BM_V.sc, (e.clientY - r.top) / BM_V.sc]; };
BM_CV.addEventListener('pointerdown', e => {
  audioInit(); const [x, y] = bmLogico(e), P = PARTIDA.get(); if (!P) return;
  if (HUD.toca(x, y)) return;
  if (PARTIDA.puedePartir()) { PARTIDA.dispara(); return; }   // el Rage quit se parte tocando en cualquier sitio
  if (CONTROLES.empieza(x, y)) BM_CV.setPointerCapture(e.pointerId);
});
BM_CV.addEventListener('pointermove', e => { const [x, y] = bmLogico(e); CONTROLES.mueve(x, y); });
for (const ev of ['pointerup', 'pointercancel']) BM_CV.addEventListener(ev, () => CONTROLES.suelta());

/* ---------- el bucle ---------- */
let bmAntes = 0, bmAcum = 0, bmT = 0, bmFondo = null;
function bmFotograma(ahora) {
  requestAnimationFrame(bmFotograma);
  const dt = Math.min(0.1, (ahora - bmAntes) / 1000 || 0.016); bmAntes = ahora; bmT += dt;
  const k = BM_V.sc * BM_V.dpr, c = BM_CTX; c.setTransform(k, 0, 0, k, 0, 0);
  const P = PARTIDA.get();
  if (P) {
    if (!P.pausa) for (bmAcum += dt; bmAcum >= BOOM.paso; bmAcum -= BOOM.paso) PARTIDA.paso();
    const suc = PARTIDA.sucesos(); EFECTOS.procesa(suc);
    for (const s of suc) if (s.t === 'turno' && !P.hotSeat) EFECTOS.texto(tr('Turno de {n}', { n: s.m.nombre }), s.m.x, s.m.y - 96, BOOM.equipos[s.m.equipo].claro, 24, 1.6);
    if (!P.pausa) EFECTOS.avanza(dt);
    PINTAR.frame(c, P, dt, bmT); HUD.frame(c, P, bmT);
    if (P.actual && P.actual.ia && P.fase === 'apunta') PINTAR_TXT(c, tr('Piensa {n}…', { n: P.actual.nombre }), PINTAR.V.w / 2, 84, 18, '#fff');
    CONTROLES.pinta(c); CONTROLES.frame(dt); PANT.revisa();
  } else {   // en la portada y en preparar: el mapa de fondo, despacio de un lado a otro
    if (!bmFondo) { TERRENO.crea(BOOM.mapas[Math.floor(Math.random() * BOOM.mapas.length)].id, 4242, []); bmFondo = true; }   // un mapa distinto cada vez
    PINTAR.enfoca(960 + Math.sin(bmT * 0.12) * 800, 560, true); PINTAR.frame(c, { moviles: [], actual: null, fase: 'fin', proy: null }, dt, bmT);
    c.fillStyle = 'rgba(21,11,33,.45)'; c.fillRect(0, 0, PINTAR.V.w, 1000); $('#bm-panel').hidden = true;
  }
}
document.fonts && document.fonts.ready.then(() => { /* la letra de la serie ya está */ });
bmAjusta(); PANT.inicia(); requestAnimationFrame(bmFotograma);
