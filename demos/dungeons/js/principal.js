// Fans of Dungeons · Arranque y bucle: la pantalla se dibuja a baja resolución y se amplía un número entero de veces (cada
// píxel nítido). Reparte el pintado según el modo (portada, clase, partida, paneles, final), avanza animaciones, efectos,
// cámara y el camino paso a paso, y recoge toques, deslizamientos y teclado. Guarda la partida al esconder la pestaña.
'use strict';

const cv = document.getElementById('juego'), g = cv.getContext('2d');
const buf = document.createElement('canvas');
let bctx = buf.getContext('2d');

function ajusta() {
  const dpr = window.devicePixelRatio || 1, caja = document.getElementById('caja').getBoundingClientRect();
  const dw = Math.max(1, Math.floor(caja.width * dpr)), dh = Math.max(1, Math.floor(caja.height * dpr));
  // pocos píxeles de juego por pantalla: en el móvil cada píxel del juego mide casi dos de verdad (letra y botones grandes)
  const k = Math.max(1, Math.round(Math.min(dw / 250, dh / 440)));
  const W = limita(Math.floor(dw / k), 220, 720), H = limita(Math.floor(dh / k), 380, 640);
  PAN.W = W; PAN.H = H; PAN.k = k;
  buf.width = W; buf.height = H; bctx = buf.getContext('2d'); bctx.imageSmoothingEnabled = false;
  cv.width = W * k; cv.height = H * k;
  cv.style.width = (W * k / dpr) + 'px'; cv.style.height = (H * k / dpr) + 'px';
  g.imageSmoothingEnabled = false;
  J.cam.listo = false;
}

function dibuja() {
  const b = bctx;
  BOTONES = [];
  b.fillStyle = COL.fondo; b.fillRect(0, 0, PAN.W, PAN.H);
  if (J.modo === 'titulo') pintaPortada(b);
  else if (J.modo === 'clase') pintaClase(b);
  else if (J.modo === 'registro') pintaRegistro(b);
  else if (J.modo === 'taquilla') pintaTaquilla(b);
  else if (J.modo === 'ayuda') pintaAyuda(b, J.panel || {});
  else if (J.modo === 'opciones') pintaOpciones(b, J.panel || {});
  else if (J.modo === 'aviso') pintaAviso(b, J.panel || {});
  else if (J.modo === 'fin' || J.modo === 'victoria') { if (J.mapa && J.heroe) pintaJuego(b); pintaFin(b); }
  else if (J.modo === 'juego' || J.modo === 'panel') { pintaJuego(b); if (J.modo === 'panel') pintaPanel(b); else pintaTuto(b); }
  g.drawImage(buf, 0, 0, cv.width, cv.height);
}

let ultimo = performance.now(), pasoT = 0;
function fotograma(ahora) {
  const dt = Math.min(0.1, Math.max(0, (ahora - ultimo) / 1000)); ultimo = ahora;
  J.tiempo += dt;
  // el instante congelado tras un golpe fuerte: todo se para un momento (el «hitstop» de los juegos de lucha)
  let dtj = dt; if (J.hitstop > 0) { J.hitstop -= dt; dtj = dt * 0.05; }
  if (J.mapa && J.heroe) { avanzaEntidades(dtj); avanzaCamara(dt); }
  avanzaFx(dtj);
  // el camino paso a paso: un paso cada poco (más rápido en velocidad rápida)
  revisaTuto(dt);
  if (J.modo === 'juego' && J.heroe && J.heroe.camino.length && !tutoBloquea()) { pasoT += dt; if (pasoT >= (GUARDA.vel === 2 ? 0.05 : 0.11)) { pasoT = 0; pasoCamino(); } } else pasoT = 0.2;
  vigilaMusica();
  dibuja();
  requestAnimationFrame(fotograma);
}

function arranca() {
  cargaMeta(); SON.on = GUARDA.sonido !== false; SON.musica = GUARDA.musica !== false;
  ajusta();
  creaFiguras(); creaObjetos(); creaIconosTactica(); creaRompibles(); creaIconosContenido(); creaCasillas();
  document.getElementById('carga').hidden = true;
  const aPan = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * PAN.W / r.width, (e.clientY - r.top) * PAN.H / r.height]; };
  cv.addEventListener('pointerdown', e => { sonidoInicia(); const [x, y] = aPan(e); TOQUE.x0 = x; TOQUE.y0 = y; TOQUE.t0 = performance.now(); TOQUE.activo = true; e.preventDefault(); });
  cv.addEventListener('pointerup', e => {
    if (!TOQUE.activo) return; TOQUE.activo = false;
    const [x, y] = aPan(e), dx = x - TOQUE.x0, dy = y - TOQUE.y0;
    if (y >= VISTA.y && y < VISTA.y + VISTA.h && J.modo === 'juego' && performance.now() - TOQUE.t0 < 400 && deslizamiento(dx, dy)) return;
    toque(TOQUE.x0, TOQUE.y0);
    e.preventDefault();
  });
  cv.addEventListener('pointercancel', () => { TOQUE.activo = false; });
  window.addEventListener('keydown', e => { if (e.key === 'Tab' || e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault(); sonidoInicia(); tecla(e.key); });
  window.addEventListener('resize', ajusta);
  document.addEventListener('visibilitychange', () => { if (document.hidden) guardaPartida(); });
  window.addEventListener('pagehide', guardaPartida);
  // ?semilla=N y ?clase=X arrancan una partida directa (para probar); ?planta=N empieza en esa planta
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('clase') && CLASES[q.get('clase')]) {
      const planta = +(q.get('planta') || 1);
      nuevaPartida(q.get('clase'), +(q.get('semilla') || 0) || undefined);
      for (let i = 1; i < planta; i++) subePlanta();
    }
  } catch (e) { /* nada */ }
  requestAnimationFrame(fotograma);
}
arranca();
