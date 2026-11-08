// Fans of Panic · Arranque y bucle: el mundo mide 360 de ancho y el canvas va a la resolución real de la pantalla (con la
// densidad de píxeles del móvil). Recoge el dedo (o el ratón) y se lo pasa a js/entrada.js.
'use strict';

const PAN = { W: 360, H: 640, k: 1 };
const cv = document.getElementById('juego');
G = cv.getContext('2d');
let PRIMARIO = null;

function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), r = document.getElementById('caja').getBoundingClientRect();
  const W = 360, H = Math.max(600, Math.min(780, Math.round(r.height / r.width * W)));
  const css = Math.min(r.width / W, r.height / H);
  PAN.W = W; PAN.H = H; PAN.k = css * dpr;
  cv.width = Math.round(W * PAN.k); cv.height = Math.round(H * PAN.k);
  cv.style.width = Math.round(W * css) + 'px'; cv.style.height = Math.round(H * css) + 'px';
  calculaTablero(W, H);
  if (enPartida() && ILUS.lienzo) preparaIlustracion(JUEGO.mundo, JUEGO.n, TAB.w, TAB.h);
}

let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  avanzaJuego(dt);
  vigilaMusica();
  G.setTransform(PAN.k, 0, 0, PAN.k, 0, 0);
  pintaTodo(PAN.W, PAN.H, dt);
  requestAnimationFrame(fotograma);
}

async function arranca() {
  cargaGuarda();
  ajusta();
  for (const m of ORDEN_MUNDOS) imagenNivel(m, 1);   // que las ilustraciones de Yoshi empiecen a cargar
  try { await Promise.race([document.fonts.load('800 20px "Baloo 2"'), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* sin letra propia */ }
  document.getElementById('carga').hidden = true;
  const punto = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height]; };
  cv.addEventListener('pointerdown', e => {
    audioInit(); try { cv.setPointerCapture(e.pointerId); } catch (_) { /* da igual */ } e.preventDefault();
    if (PRIMARIO !== null && JUEGO.modo !== 'juego') PRIMARIO = null;   // fuera del nivel un dedo que no soltó nunca no puede dejar los botones sin respuesta
    if (PRIMARIO === null) { PRIMARIO = e.pointerId; dedoBaja(...punto(e)); }
  });
  cv.addEventListener('pointermove', e => { if (e.pointerId === PRIMARIO && DEDO.activo) dedoMueve(...punto(e)); });
  const suelta = (e, cancela) => { if (e.pointerId !== PRIMARIO) return; PRIMARIO = null; if (cancela) DEDO.activo = false; else dedoSube(...punto(e)); };
  cv.addEventListener('pointerup', e => suelta(e, false));
  cv.addEventListener('pointercancel', e => suelta(e, true));
  const sueltaTodo = () => { PRIMARIO = null; DEDO.activo = false; };
  window.addEventListener('blur', sueltaTodo); document.addEventListener('visibilitychange', () => { if (document.hidden) sueltaTodo(); });
  window.addEventListener('resize', ajusta);
  requestAnimationFrame(fotograma);
}
arranca();
