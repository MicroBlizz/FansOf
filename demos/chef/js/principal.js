// Fans of Chef · Arranque y bucle: el canvas va a una escala entera (cada píxel del juego son k píxeles de la pantalla) para que el
// píxel art quede nítido, con el lado corto de unas 11 casillas. Cada fotograma: entrada, la fase de la jornada, efectos y pintar.
'use strict';

const CV = document.getElementById('juego');
const G = CV.getContext('2d');
let K_ESCALA = 3, PW = 0, PH = 0;

function ajusta() {
  const dpr = Math.min(3, window.devicePixelRatio || 1), r = document.getElementById('caja').getBoundingClientRect();
  PW = Math.floor(r.width * dpr); PH = Math.floor(r.height * dpr);
  K_ESCALA = Math.max(1, Math.floor(Math.min(PW, PH) / 270));
  CV.width = PW; CV.height = PH;
  CV.style.width = (PW / dpr) + 'px'; CV.style.height = (PH / dpr) + 'px';
  PAN.W = Math.floor(PW / K_ESCALA); PAN.H = Math.floor(PH / K_ESCALA);
}

let ultimo = performance.now();
function fotograma(ahora) {
  const dt = Math.min(0.05, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  PAN.t += dt;
  resumeEntrada();
  procesaToques();
  const f = JORNADA.fase;
  if (PAN.pausa > 0) { PAN.pausa -= dt; avanzaEfectos(dt * 0.2); }   // el parón de un golpe (hitstop)
  else if (f === 'caza') { avanzaJugador(dt); avanzaEnemigos(dt); avanzaJornada(dt); avanzaEfectos(dt); avanzaGuia(dt); }
  else if (f === 'subiendo') { avanzaJornada(dt); avanzaEfectos(dt); }
  else if (f === 'servicio') { avanzaServicio(dt); avanzaEfectos(dt); avanzaGuia(dt); }
  else FX.avisos.length = 0;
  vigilaMusica();
  G.setTransform(K_ESCALA, 0, 0, K_ESCALA, 0, 0);
  G.fillStyle = '#1a1008'; G.fillRect(0, 0, PAN.W + 2, PAN.H + 2);
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
  const aPixel = e => { const r = CV.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height]; };
  entradaArranca(CV, aPixel);
  window.addEventListener('resize', ajusta);
  requestAnimationFrame(fotograma);
}
arranca();
