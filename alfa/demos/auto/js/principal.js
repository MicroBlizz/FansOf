// Fans of Auto · EL ARRANQUE: ajusta el lienzo a la pantalla (píxeles enteros, entre 320 y 480 de ancho y entre 224 y 270 de
// alto), monta el barrio y hace todos los dibujos enseñando una barra de carga, y pone en marcha el juego: 60 pasos por
// segundo, vaya la pantalla a la velocidad que vaya.
'use strict';

const cv = document.getElementById('juego'), CTX = cv.getContext('2d');
const PASO = 1000 / 60;

function ajusta() {
  const dpr = window.devicePixelRatio || 1, aw = Math.floor(innerWidth * dpr), ah = Math.floor(innerHeight * dpr);
  let k = Math.max(1, Math.floor(ah / 224));
  while (k > 1 && 320 * k > aw) k--;
  const H = Math.max(224, Math.min(270, Math.floor(ah / k))), W = Math.max(320, Math.min(480, Math.floor(aw / k)));
  const e = Math.min(k, aw / W, ah / H);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  cv.style.width = (W * e / dpr) + 'px'; cv.style.height = (H * e / dpr) + 'px';
  J.W = W; J.H = H;
  CTX.imageSmoothingEnabled = false;
}

/* ---------- la carga ---------- */
const CARGA = {
  k: 0,
  frases: ['ASFALTANDO EL DISTRITO...', 'APARCANDO EN DOBLE FILA...', 'CONTRATANDO MODERADORES...', 'PONIENDO PEAJES...', 'DIBUJANDO LOS TEJADOS...', 'CASI: FALTA EL PARCHE DEL DÍA UNO...'],
  pasos: [() => creaMapa(), () => { creaConejo(); creaObjetos(); creaIconos(); }],
};
function pintaCarga(g) {
  g.fillStyle = '#101418'; g.fillRect(0, 0, J.W, J.H);
  escribe(g, 'FANS OF AUTO', J.W / 2, J.H / 2 - 30, { esc: 2, c: ORO_ROTULO, borde: TINTA, alin: 'centro' });
  const p = CARGA.k / CARGA.pasos.length;
  g.fillStyle = TINTA; g.fillRect(J.W / 2 - 60, J.H / 2, 120, 8); g.fillStyle = '#f28c28'; g.fillRect(J.W / 2 - 59, J.H / 2 + 1, Math.round(118 * p), 6);
  escribe(g, CARGA.frases[Math.min(CARGA.frases.length - 1, Math.floor(p * CARGA.frases.length))], J.W / 2, J.H / 2 + 14, { fuente: 'mini', c: '#8fc3e6', borde: TINTA, alin: 'centro' });
}
function carga() {
  pintaCarga(CTX);
  if (CARGA.k >= CARGA.pasos.length) { arranca(); return; }
  setTimeout(() => { CARGA.pasos[CARGA.k++](); requestAnimationFrame(carga); }, 0);
}

/* ---------- el bucle ---------- */
let antes = 0, resto = 0;
const VISTOS = new Set();
function fallo(e) { const s = String(e && e.message); if (!VISTOS.has(s)) { VISTOS.add(s); console.error(e); } }
function paso() {
  if (J.estado === 'juego') pasoJuego(); else if (J.estado === 'titulo') pasoTitulo(); else if (J.estado === 'pausa') pasoPausa(); else if (J.estado === 'opciones') pasoOpciones(); else if (J.estado === 'teclas') pasoTeclas(); else if (J.estado === 'fin') pasoFin();
  MANDO.toque = null;
  if (J.estado !== 'teclas') MANDO.ultimaTecla = null;
  vigilaMusica();
}
function pinta() {
  const g = CTX;
  if (J.estado === 'juego') pintaJuego(g); else if (J.estado === 'titulo') pintaTitulo(g); else if (J.estado === 'pausa') pintaPausa(g); else if (J.estado === 'opciones') pintaOpciones(g); else if (J.estado === 'teclas') pintaTeclas(g); else if (J.estado === 'fin') pintaFin(g);
}
function cuadro(ahora) {
  requestAnimationFrame(cuadro);
  let dt = Math.min(100, ahora - antes), n = 0;
  antes = ahora;
  if (Math.abs(dt - PASO) < 2) dt = PASO;
  resto += dt;
  try { while (resto >= PASO && n < 5) { paso(); resto -= PASO; n++; } } catch (e) { fallo(e); resto = 0; MANDO.toque = null; }
  if (n === 5) resto = 0;
  try { pinta(); } catch (e) { fallo(e); }
}
function arranca() {
  alTitulo();
  antes = performance.now();
  requestAnimationFrame(cuadro);
}

MANDO.tactil = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
ajusta();
window.addEventListener('resize', ajusta);
window.addEventListener('orientationchange', () => setTimeout(ajusta, 200));
iniciaMandos();
// el suelo se pinta por trozos durante la carga (hace falta el mapa primero, así que se añaden al arrancar)
CARGA.pasos.push(() => { const az = Azar(99); SUELO.nx = Math.ceil(MAPA.W / TROZO); SUELO.ny = Math.ceil(MAPA.H / TROZO); SUELO.az = az; });
for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) CARGA.pasos.push(() => {
  const [c, g] = lienzoNuevo(TROZO * T, TROZO * T);
  for (let y = 0; y < TROZO; y++) for (let x = 0; x < TROZO; x++) { const tx = i * TROZO + x, ty = j * TROZO + y; if (enMapa(tx, ty)) pintaCasilla(g, tx, ty, x * T, y * T, SUELO.az); }
  SUELO.trozos[j * SUELO.nx + i] = c;
});
CARGA.pasos.push(() => { for (const e of MAPA.edificios) fotoTejado(e); });
document.getElementById('carga').hidden = true;
requestAnimationFrame(carga);
