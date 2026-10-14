// Fans of Recruit · EL ARRANQUE: ajusta el lienzo a la pantalla (píxeles enteros, entre 320 y 480 de ancho y entre 224 y 240
// de alto), hace todos los dibujos uno a uno enseñando una barra de carga y pone en marcha el juego: 60 pasos por segundo,
// vaya la pantalla a la velocidad que vaya.
'use strict';

const cv = document.getElementById('juego'), CTX = cv.getContext('2d');
const PASO = 1000 / 60;

// el lienzo, a píxeles enteros: cada punto del juego ocupa k × k puntos de la pantalla
function ajusta() {
  const dpr = window.devicePixelRatio || 1, aw = Math.floor(innerWidth * dpr), ah = Math.floor(innerHeight * dpr);
  let k = Math.max(1, Math.floor(ah / 224));
  while (k > 1 && 320 * k > aw) k--;
  const H = Math.max(224, Math.min(OFI.ALTO, Math.floor(ah / k))), W = Math.max(320, Math.min(480, Math.floor(aw / k)));
  const e = Math.min(k, aw / W, ah / H);   // si ni al tamaño más pequeño cabe, se encoge
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  cv.style.width = (W * e / dpr) + 'px'; cv.style.height = (H * e / dpr) + 'px';
  J.W = W; J.H = H; J.camY = (OFI.ALTO - H) >> 1;
  CTX.imageSmoothingEnabled = false;
}

/* ---------- la carga: cada paso hace unos cuantos dibujos ---------- */
const CARGA = {
  k: 0,
  frases: ['CONVOCANDO UNA REUNIÓN...', 'MIDIENDO LOS KPIS...', 'COMPRANDO OTRO ESTUDIO...', 'ALINEANDO SINERGIAS...', 'SIRVIENDO CAFÉ A LOS BECARIOS...', 'CASI: FALTA LA FIRMA DE UN EJECUTIVO...'],
  pasos: [
    () => { creaIconos(); creaSueltos(); },
    () => creaConejo(),
    () => { creaBecario(); creaDron(); },
    () => { creaFans(); creaPremios(); creaCartas(); },
    () => creaMecha(),
    () => creaJefe(),
    () => creaExplosiones(),
    () => creaExplosionGrande(),
    () => { NIVEL.lejos = pintaLejos(1010, 104); },
  ],
};
// el plano de la misión se monta ya (no pinta nada) para saber cuántos trozos de oficina hay que pintar
creaNivel();
for (let k = 0; k * TROZO < NIVEL.largo; k++) CARGA.pasos.push(() => pintaTrozo(k));
function carga() {
  pintaCarga(CTX);
  if (CARGA.k >= CARGA.pasos.length) { arranca(); return; }
  // se deja pintar la barra antes de ponerse con el paso siguiente
  setTimeout(() => { CARGA.pasos[CARGA.k++](); requestAnimationFrame(carga); }, 0);
}

/* ---------- el bucle ---------- */
let antes = 0, resto = 0, okAntes = false;
const VISTOS = new Set();
function fallo(e) { const s = String(e && e.message); if (!VISTOS.has(s)) { VISTOS.add(s); console.error(e); } }
function paso() {
  leeMando();
  MANDO.pok = MANDO.ok && !okAntes; okAntes = MANDO.ok;
  if (J.estado === 'juego') pasoJuego(); else if (J.estado === 'titulo') pasoTitulo(); else if (J.estado === 'pausa') pasoPausa(); else if (J.estado === 'fin') pasoFin(); else if (J.estado === 'victoria') pasoVictoria();
  MANDO.toque = null;
  vigilaMusica();
}
function cuadro(ahora) {
  requestAnimationFrame(cuadro);
  let dt = Math.min(100, ahora - antes), n = 0;
  antes = ahora;
  if (Math.abs(dt - PASO) < 2) dt = PASO;   // a 60 por segundo, un paso justo por cuadro (sin tirones)
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
window.addEventListener('keydown', e => { if (e.code === 'KeyM') cambiaSonido(); else if (e.code === 'KeyN') cambiaMusica(); });
document.getElementById('carga').hidden = true;
requestAnimationFrame(carga);
