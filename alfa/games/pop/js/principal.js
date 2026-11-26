// Fans of Pop · PRINCIPAL: el lienzo y su tamaño, los toques (una burbuja en la sala, el duelo o Memoria, un nodo en el mapa), el teclado,
// el bucle de cada fotograma y el arranque.
'use strict';
const PP_CV = document.getElementById('cv'), PP_CTX = PP_CV.getContext('2d');
const PP_ESCENARIO = document.getElementById('stage'), PP_UI = document.getElementById('pp-ui');

function ppAjusta() {
  const bw = document.body.clientWidth, bh = document.body.clientHeight, estrecho = bw < 600, pad = estrecho ? 0 : 24;
  const LH = estrecho ? clamp(Math.round((540 * bh) / Math.max(1, bw)), 960, 1170) : 960;
  let w = bw - pad * 2, h = (w * LH) / 540;
  if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * 540) / LH; }
  w = Math.max(200, Math.floor(w)); h = Math.floor((w * LH) / 540);
  PP_ESCENARIO.style.width = w + 'px'; PP_ESCENARIO.style.height = h + 'px';
  PP_V.H = LH; PP_V.sc = w / 540; PP_V.dpr = PP_AHORRO.densidad(Math.min(window.devicePixelRatio || 1, 3));   // con «Ahorro de batería», 1,5 como mucho (js/ahorro-juego.js)
  PP_CV.width = Math.round(w * PP_V.dpr); PP_CV.height = Math.round(h * PP_V.dpr);
  PP_UI.style.height = LH + 'px'; PP_UI.style.transform = `scale(${w / 540})`;
  const g = ppGeom(3); PP_UI.style.setProperty('--pp-bajo-tablero', g.y + g.lado + 'px');   // el borde de abajo del tablero, para las ayudas (tareas #129 y #269)
  PP_UI.style.setProperty('--pp-bajo-tarjeta', ppCortTarjetaY(LH) + PP_CORT_TARJETA_ALTO + 24 + 'px');   // ¡A JUGAR!, pegado bajo «Así se gana» (tarea #269)
}
/* ---------- los toques ---------- */
function ppLogico(e) { const r = PP_CV.getBoundingClientRect(); return [(e.clientX - r.left) / PP_V.sc, (e.clientY - r.top) / PP_V.sc]; }
PP_CV.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (!$pp('#pp-modal').hidden) return;
  ppCargaSonidos();
  const [lx, ly] = ppLogico(e);
  if (ppExplicaToque(lx, ly)) return;   // un compañero de «Tu equipo»: su bocadillo (js/equipo-explica.js); si no, lo cierra
  if (PP_PANT.actual === 'titulo') { ppPortadaToque(lx, ly); return; }
  if (ppCortActiva()) { ppCortCompleta(); return; }   // la cortinilla de duelo solo se quita con su botón (ADR 100); un toque la completa (#181)
  if (PP_PANT.actual === 'duelo' && PP_DUELO) { ppDueloToque(ppCeldaEn(ppGeom(PP_DUELO.T.n), lx, ly)); return; }
  if (PP_PANT.actual === 'memoria' && PP_MEM) { ppMemToque(ppCeldaEn(ppGeom(PP_MEM.T.n), lx, ly)); return; }
  if (!PP_P) return;
  if (PP_PANT.actual === 'sala' && PP_P.T) {
    const i = ppCeldaEn(ppGeom(PP_P.T.n), lx, ly);
    if (i >= 0) ppToque(i);
  } else if (PP_PANT.actual === 'mapa') ppMapaAbajo(lx, ly);
});
// el mapa se arrastra para ver los niveles pasados; se elige al soltar sin haber arrastrado
PP_CV.addEventListener('pointermove', e => { if (PP_PANT.actual === 'mapa') { const [lx, ly] = ppLogico(e); ppMapaMueve(lx, ly); } });
window.addEventListener('pointerup', () => { if (PP_PANT.actual === 'mapa' && $pp('#pp-modal').hidden) ppMapaArriba(); else PP_MAPA.toque = null; });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || PP_PANT.actual === 'titulo' || PP_PANT.actual === 'mapa') return;   // en el camino no hay pausa (tarea #272)
  if (PP_PANT.pausa) ppQuitaPausa(); else ppPausa();   // Esc abre y cierra la pausa (las demás ventanas se cierran con sus botones)
});
/* ---------- el bucle ---------- */
let PP_ULT = 0;
function ppFotograma(ahora) {
  requestAnimationFrame(ppFotograma);
  const real = (ahora - PP_ULT) / 1000 || 0.016, dt = Math.min(0.05, real); PP_ULT = ahora;   // la cortinilla va por reloj (`real`, tarea #181)
  const t = ahora / 1000, c = PP_CTX;
  ppMusicaBucle(); ppAdnMira(); PP_RENDIMIENTO.mira(ahora);   // la fila de pegatinas del duelo (js/duelo-adornos.js) y los fps de cada nivel, duelo o memoria (js/rendimiento-partida.js)
  c.setTransform(PP_V.sc * PP_V.dpr, 0, 0, PP_V.sc * PP_V.dpr, 0, 0);
  c.imageSmoothingEnabled = false;
  PP_MEDIDOR.empieza();   // el medidor por partes del panel DEV (js/medidor-partes.js): cada fotograma empieza a contar aquí, pinte la pantalla que pinte
  if (PP_PANT.actual === 'sala' && PP_P && PP_P.T) { if (!PP_PANT.pausa) { ppFxAvanza(dt); ppCortAvanza(real); ppVictoriaReloj(PP_P.T, dt); } ppPintaSala(c, t); if (PP_MEDIDOR.pinta('cortinilla')) ppPintaCortinilla(c, t); PP_MEDIDOR.marca('cortinilla'); }   // la cortinilla de jefe va encima (js/pintar-cortinilla.js); el medidor DEV, js/medidor-partes.js
  else if (PP_PANT.actual === 'mapa' && PP_P) ppPintaMapa(c, t);
  else if (PP_PANT.actual === 'duelo' && PP_DUELO) { if (!PP_PANT.pausa) { ppFxAvanza(dt); ppCortAvanza(real); ppAdnAvanza(dt); } ppPintaDuelo(c, t); if (PP_MEDIDOR.pinta('cortinilla')) ppPintaCortinilla(c, t); PP_MEDIDOR.marca('cortinilla'); }
  else if (PP_PANT.actual === 'memoria' && PP_MEM) { if (!PP_PANT.pausa) { ppFxAvanza(dt); if (!PP_LOLA.actual) ppMemAvanza(dt); } ppPintaMemoria(c, t); }   // la melodía espera a que Lola acabe de explicar
  else ppPintaPortada(c, t, dt);
}
function ppEmpieza(seguir) {
  ppCargaSonidos(); play('select');
  PP_PORTADA.T = null; PP_FX.celdas = {}; PP_FX.parts = []; PP_FX.saltos = []; PP_FX.textos = []; PP_MAPA.m = null;
  if (!(seguir && ppSigueCamino())) ppNuevaRuta();
  if (PP_PRIMEROS.directo(ppPrimeros()) && ppVidas() > 0) { ppEntra(); return; }   // partida nueva: JUGAR entra directo en el nivel 1 (tarea #140)
  ppIrA('mapa');
}
function ppArranque() {
  const salio = ppRevisaDentro();   // si se cerró el juego a media partida (después de tocar), se pierde ese corazón
  const imagenes = ppCargaImagenes();
  ppAjusta();
  window.addEventListener('resize', ppAjusta);
  if (typeof hook === 'function') hook('ahorro', ppAjusta);   // «Ahorro de batería» en caliente: el lienzo se rehace con su densidad
  $pp('#pp-jugar').onclick = () => ppEmpieza(false);
  $pp('#pp-seguir').onclick = () => ppEmpieza(true);
  $pp('#pp-duelo').onclick = () => { ppCargaSonidos(); play('select'); if (!ppPrimerosToca('duelos')) return; PP_P = null; ppVentanaDuelos(); };   // CEO, amigo o al azar (js/pvp.js)
  $pp('#pp-memoria').onclick = () => { ppCargaSonidos(); play('select'); if (!ppPrimerosToca('memoria')) return; PP_P = null; ppEligeMemoria(); };   // antes de jugar, el mundo y la dificultad (js/memoria-elige.js, tarea #141)
  $pp('#pp-cort-jugar').onclick = ppCortPulsa;
  $pp('#pp-listo').onclick = () => { if (ppCortActiva()) return; play('select'); if (PP_PANT.actual === 'sala') ppNimListo(); else ppDueloListo(); };
  $pp('#pp-lola-vale').onclick = () => { play('select'); ppLolaSiguiente(); };
  $pp('#pp-lola-saltar').onclick = () => { play('select'); ppLolaSalta(); };   // «Saltar»: sin consejos (js/lola.js)
  PP_UI.addEventListener('pointerdown', e => { if (e.target === PP_UI) ppLolaSacude(); });   // un toque en lo oscuro (la capa de css/lola.css): ¡VALE! salta (tarea #248)
  $pp('#pp-pausa').onclick = () => { play('select'); ppPausa(); };
  $pp('#pp-tienda').onclick = () => { ppCargaSonidos(); play('select'); ppTienda(null, 'ofertas'); };
  $pp('#pp-opciones').onclick = () => { ppCargaSonidos(); play('select'); ppOpciones(); };
  $pp('#pp-ranking').onclick = () => { ppCargaSonidos(); play('select'); if (ppPrimerosToca('ranking')) ppVentanaRanking(); };   // js/ranking.js
  $pp('#pp-perfil').onclick = () => { ppCargaSonidos(); play('select'); if (!ppPrimerosToca('perfil')) return; PP_SRV.arranca(); ppVentanaPerfil(); };   // js/pantalla-perfil.js
  $pp('#pp-amigos').onclick = () => { ppCargaSonidos(); play('select'); ppAmigosAbre(); };   // js/pantalla-amigos-ventana.js (tarea #145)
  $pp('#pp-companeros').onclick = () => { ppCargaSonidos(); play('select'); ppVentanaCompaneros('album'); };   // js/pantalla-album.js (tarea #142)
  setTimeout(() => { ppPerfilBoton(); ppCompanerosBoton(); ppAmigosBoton(); if (PP_PANT.actual === 'titulo') ppPrimerosPortada(); PP_SRV.arranca(); }, 2500);   // con los flags ya leídos: los botones PERFIL, COMPAÑEROS y AMIGOS y el monedero de perlas del servidor (tareas #41 y #142)
  setTimeout(ppSubeMarcas, 3000);   // lo que aún no esté en el ranking mundial
  if (typeof SALAS !== 'undefined' && SALAS.codigoUrl()) setTimeout(() => ppPvpEntraCodigo(SALAS.codigoUrl()), 1500);   // un enlace de reto de un amigo
  ppCorazonEnlaceArranca();   // un enlace de corazón de un amigo (?corazon=, js/pantalla-corazones-enlace.js)
  ppAmigosEnlaceArranca();   // un enlace de amigo (?amigo=, js/pantalla-amigos-regalos.js)
  ppIrA('titulo');
  // la portada sale cuando han llegado todos los dibujos, sin tope de tiempo: hasta entonces la tapa la splash de core (esperaListo en
  // index.html, ADR 091), y así no asoman los de repuesto del primer boceto. Si alguno no llega ni al segundo intento, la splash se queda
  // con «No se ha podido cargar» y su botón «Reintentar» (tarea #130)
  PP_ESCENARIO.style.visibility = 'hidden';
  imagenes.then(faltan => {
    PP_ESCENARIO.style.visibility = ''; const carga = $pp('#carga'); if (carga) carga.remove();
    if (!faltan.length) NUCLEO.listo();
    if (salio) ppVentanaSalioAMedias();   // y se dice por qué falta un corazón (tarea #185)
    else if (faltan.length && typeof SPLASH !== 'undefined') SPLASH.falla('pop/img-liso/' + faltan[0] + '.png');
  });
  requestAnimationFrame(ppFotograma);
  setInterval(() => { if (PP_PANT.actual === 'mapa' && $pp('#pp-modal').hidden) { ppPintaLateral(); ppPintaCaminoAyudas(); } }, 1000);   // los relojes de las ofertas y cuántas ayudas tienes
  setInterval(ppBuzonVigila, 5000);   // el buzón de corazones de los amigos: al llegar al camino y cada minuto (js/pantalla-buzon.js)
  setInterval(ppAmigosVigila, 5000);   // la pestaña Amigos: en la portada o el camino, al llegar y cada 45 s (js/pantalla-amigos.js)
}
ppArranque();
