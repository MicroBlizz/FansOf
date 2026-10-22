// Fans of Jump · Arranque y bucle: el mundo mide unos 200 de ancho y el canvas va a la resolución real de la pantalla (con
// la densidad de píxeles del móvil), así el dibujo se ve suave y nítido. También recoge el dedo (o el ratón).
'use strict';

const PAN = { W: 200, H: 400, k: 1 };
const cv = document.getElementById('juego');
G = cv.getContext('2d');

function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), r = document.getElementById('caja').getBoundingClientRect();
  // ancho fijo del mundo; el alto, el que dé la pantalla (entre 330 y 470); si sobra, se centra
  const W = 200, H = Math.max(330, Math.min(470, Math.round(r.height / r.width * W)));
  const css = Math.min(r.width / W, r.height / H);
  PAN.W = W; PAN.H = H; PAN.k = css * dpr;
  cv.width = Math.round(W * PAN.k); cv.height = Math.round(H * PAN.k);
  cv.style.width = Math.round(W * css) + 'px'; cv.style.height = Math.round(H * css) + 'px';
}

let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  // un error en un fotograma se apunta (core/errores.js lo manda al servidor) y el siguiente fotograma sigue: así nunca se congela la pantalla
  try { avanzaJuego(dt); vigilaMusica(); G.setTransform(PAN.k, 0, 0, PAN.k, 0, 0); pintaTodo(); }
  catch (e) { console.error(e); G.setTransform(PAN.k, 0, 0, PAN.k, 0, 0); if (typeof ERRORES !== 'undefined' && ERRORES.registrar) ERRORES.registrar('js', 'jump/fotograma', String(e && e.stack || e)); }
  requestAnimationFrame(fotograma);
}

async function arranca() {
  cargaGuarda();
  ajusta();
  // espera a la letra (Baloo 2 y Luckiest Guy); sin conexión, sigue con la del sistema
  try { await Promise.race([Promise.all([document.fonts.load('800 20px "Baloo 2"'), document.fonts.load('20px "Luckiest Guy"')]), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* sin letra propia */ }
  await cargaLamina();
  iniciaBonito();
  JS.arranca();   // la cuenta en el servidor (servidor.js): no se espera, lo que llegue sustituye lo local
  nuevaPartida();
  setTimeout(subePendiente, 4000);   // la mejor marca que no esté aún en el ranking mundial
  document.getElementById('carga').hidden = true;
  const punto = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height]; };
  cv.addEventListener('pointerdown', e => { audioInit(); cv.setPointerCapture(e.pointerId); dedoBaja(...punto(e)); e.preventDefault(); });
  cv.addEventListener('pointermove', e => { dedoMueve(...punto(e)); e.preventDefault(); });
  cv.addEventListener('pointerup', e => { dedoSube(...punto(e)); e.preventDefault(); });
  cv.addEventListener('pointercancel', () => { APUNTA.activo = false; });
  window.addEventListener('resize', ajusta);
  requestAnimationFrame(fotograma);
}
arranca();
