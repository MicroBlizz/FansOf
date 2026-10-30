// Fans of Rouflage (prototipo) · ARRANQUE: espera a las letras (el mapa lleva carteles), construye el mapa, ajusta el lienzo a la
// pantalla y pone en marcha el bucle: avanzar la partida, mover la cámara, dibujar y refrescar el marcador.
'use strict';

function ajusta() {
  VW = Math.max(240, window.innerWidth); VH = Math.max(200, window.innerHeight);
  DPR = dprGraficos();   // la calidad de OPCIONES (opciones.js): Alta hasta 2 (con más el móvil trabaja el doble y casi no se nota), Normal 1,5, Baja 1
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  if (TALLER.abierto) encuadraTaller();
}
let RELOJ = 0, _ultimo = 0, _latido = 0;
function fotograma(ahora) {
  if (!opcionesFotograma(ahora)) { requestAnimationFrame(fotograma); return; }      // el ahorro de batería se salta fotogramas (opciones.js)
  const dt = Math.min(0.05, (ahora - _ultimo) / 1000 || 0); _ultimo = ahora;
  if (!J.pausa) {
    RELOJ += dt; avanzaPartida(dt); avanzaFx(dt); avanzaTaller(dt); bocadilloAvanza(dt);
    // el corazón: late más deprisa cuanto más sospechan de ti
    if (J.fase === 'caza' && J.peligro > 0.3) { _latido -= dt; if (_latido <= 0) { _latido = 1.05 - J.peligro * 0.6; play('latido', 0.4 + J.peligro * 0.6); } }
  }
  midePartida();
  avanzaCamara(dt); if (!escenarioAbierto()) dibuja(RELOJ); refrescaHud(false); chatAvanza(dt); vigilaMusica();      // en MI ESCENARIO (escenario.js) no se ve el mapa: no se pinta
  requestAnimationFrame(fotograma);
}
async function arranca() {
  traducePagina(); ponIconos();
  // las letras de la serie: se esperan un poco, porque los carteles del mapa se pintan una sola vez
  try { await Promise.race([Promise.all([document.fonts.load('20px "Luckiest Guy"'), document.fonts.load('800 12px "Baloo 2"')]), new Promise(r => setTimeout(r, 2500))]); } catch (_) { /* sin letras: salen las del sistema */ }
  preparaAlubia(); cargaMapa(mapaElegido());
  ajusta(); window.addEventListener('resize', ajusta);
  preparaInterfaz(); preparaOpciones(); preparaMenusPintar(); preparaEligeMapa(); preparaPvp(); preparaArmario(); preparaEscenario(); preparaDiario(); preparaEconomia(); preparaTienda(); preparaGacha(); preparaReinicio(); preparaZoomCazador(); preparaMisiones(); preparaTalentos(); preparaTitulo(); preparaReto(); preparaReferidos(); preparaAvisos(); preparaGuia(); preparaAmigos(); preparaTemporada(); preparaCodigos(); preparaUnidades();
  try { await Promise.race([RFS.arranca(), new Promise(r => setTimeout(r, 12000))]); } catch (_) { /* sin cuenta: la partida local */ }      // la cuenta del servidor (servidor.js): Gotas, Acciones, colección… Si falla o tarda, el juego arranca igual (antes se quedaba en los tres puntos)
  refEntrada();      // un enlace ?inv= de un amigo (referidos.js)
  const modo = new URLSearchParams(location.search).get('modo');   // ?modo=camaleon o ?modo=cazador entra directo (para probar)
  if (modo === 'camaleon' || modo === 'cazador') { pantalla(null); empiezaPartida(modo); } else if (!retoEntrada()) { irTitulo(); pvpEntradaDirecta(); }      // un enlace ?reto= abre el reto (reto.js) en vez del título
  E('carga').hidden = true;
  requestAnimationFrame(t => { _ultimo = t; fotograma(t); });
}
// al salir de la pestaña en mitad de una partida, pausa
document.addEventListener('visibilitychange', () => { if (document.hidden && !J.pvp && (J.fase === 'prep' || J.fase === 'caza' || J.fase === 'cuenta') && !J.pausa) accionPausa(); });
arranca();
