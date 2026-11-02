// Fans of Shelter · Arranque y bucle: el canvas va a una escala entera (cada píxel del juego son k píxeles de la pantalla) para que el
// píxel art quede nítido, con el lado corto de unas 11 casillas. Cada fotograma: entrada, juego (si no hay ventana), efectos y pintar.
'use strict';

const CV = document.getElementById('juego');
const G = CV.getContext('2d');
let K_ESCALA = 3, K_BASE = 3, PW = 0, PH = 0;   // K_ESCALA: escala actual (de noche baja un escalón: zoom out); K_BASE: la de día

function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), r = document.getElementById('caja').getBoundingClientRect();
  const pw = Math.floor(r.width * dpr), ph = Math.floor(r.height * dpr);
  PW = pw; PH = ph;
  K_BASE = Math.max(1, Math.floor(Math.min(pw, ph) / 150));
  K_ESCALA = K_BASE;
  CV.width = pw; CV.height = ph;
  CV.style.width = (pw / dpr) + 'px'; CV.style.height = (ph / dpr) + 'px';
  aplicaEscala();
}
// la escala que toca ahora: de noche un escalón menos (si hay sitio), para ver venir la horda
const escalaObjetivo = () => (NOCHE.fase === 'noche' && K_BASE >= 3 ? K_BASE - 1 : K_BASE);
function aplicaEscala() {
  PAN.W = Math.floor(PW / K_ESCALA); PAN.H = Math.floor(PH / K_ESCALA);
}
function avanzaZoom(dt) {
  const obj = escalaObjetivo();
  if (Math.abs(K_ESCALA - obj) < 0.01) { if (K_ESCALA !== obj) { K_ESCALA = obj; aplicaEscala(); } return; }
  K_ESCALA += (obj - K_ESCALA) * Math.min(1, dt * 3);   // transición suave (unos píxeles no enteros durante medio segundo)
  if (Math.abs(K_ESCALA - obj) < 0.02) K_ESCALA = obj;
  aplicaEscala();
}

let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  PAN.t += dt;
  avanzaZoom(dt);
  resumeEntrada();
  procesaToques(PAN.W, PAN.H);
  const jugando = NOCHE.fase === 'dia' || NOCHE.fase === 'noche' || NOCHE.fase === 'amanecer';
  if (jugando && !VENTANA.tipo) {
    avanzaJugador(dt);
    avanzaCiclo(dt);
    if (NOCHE.fase === 'noche') { avanzaArmas(dt); avanzaEnemigos(dt); }
    avanzaEfectos(dt);
  } else if (NOCHE.fase === 'fin') avanzaCiclo(dt);
  if (!jugando) FX.avisos.length = 0;
  vigilaMusica();
  G.setTransform(K_ESCALA, 0, 0, K_ESCALA, 0, 0);
  G.fillStyle = '#0b1020'; G.fillRect(0, 0, PAN.W + 2, PAN.H + 2);
  G.imageSmoothingEnabled = false;
  pintaTodo(G);
  finEntrada();
  requestAnimationFrame(fotograma);
}

async function arranca() {
  cargaGuarda();
  ajusta();
  await cargaImagenes();
  try { await Promise.race([document.fonts.load('8px "Press Start 2P"'), new Promise(r => setTimeout(r, 2000))]); } catch (e) { /* sin letra propia */ }
  document.getElementById('carga').hidden = true;
  const aPixel = e => { const r = CV.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height, PAN.W, PAN.H]; };
  entradaArranca(CV, aPixel);
  window.addEventListener('resize', ajusta);
  requestAnimationFrame(fotograma);
}
arranca();
