// Fans of Rouflage (prototipo) · ARRANQUE: espera a las letras (el mapa lleva carteles), construye el mapa, ajusta el lienzo a la
// pantalla y pone en marcha el bucle: avanzar la partida, mover la cámara, dibujar y refrescar el marcador.
'use strict';

function ajusta() {
  VW = Math.max(240, window.innerWidth); VH = Math.max(200, window.innerHeight);
  DPR = Math.min(2, window.devicePixelRatio || 1);   // con más de 2 el móvil trabaja el doble y casi no se nota
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  if (TALLER.abierto) encuadraTaller();
}
let RELOJ = 0, _ultimo = 0, _latido = 0;
function fotograma(ahora) {
  const dt = Math.min(0.05, (ahora - _ultimo) / 1000 || 0); _ultimo = ahora;
  if (!J.pausa) {
    RELOJ += dt; avanzaPartida(dt); avanzaFx(dt); avanzaTaller(dt);
    // el corazón: late más deprisa cuanto más sospechan de ti
    if (J.fase === 'caza' && J.peligro > 0.3) { _latido -= dt; if (_latido <= 0) { _latido = 1.05 - J.peligro * 0.6; play('latido', 0.4 + J.peligro * 0.6); } }
  }
  avanzaCamara(dt); dibuja(RELOJ); refrescaHud(false); vigilaMusica();
  requestAnimationFrame(fotograma);
}
async function arranca() {
  traducePagina(); ponIconos();
  // las letras de la serie: se esperan un poco, porque los carteles del mapa se pintan una sola vez
  try { await Promise.race([Promise.all([document.fonts.load('20px "Luckiest Guy"'), document.fonts.load('800 12px "Baloo 2"')]), new Promise(r => setTimeout(r, 2500))]); } catch (_) { /* sin letras: salen las del sistema */ }
  preparaAlubia(); construyeMapa();
  ajusta(); window.addEventListener('resize', ajusta);
  preparaInterfaz();
  const modo = new URLSearchParams(location.search).get('modo');   // ?modo=camaleon o ?modo=cazador entra directo (para probar)
  if (modo === 'camaleon' || modo === 'cazador') { pantalla(null); empiezaPartida(modo); } else irTitulo();
  $('carga').hidden = true;
  requestAnimationFrame(t => { _ultimo = t; fotograma(t); });
}
// al salir de la pestaña en mitad de una partida, pausa
document.addEventListener('visibilitychange', () => { if (document.hidden && (J.fase === 'prep' || J.fase === 'caza' || J.fase === 'cuenta') && !J.pausa) accionPausa(); });
arranca();
