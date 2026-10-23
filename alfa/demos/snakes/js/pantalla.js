// Fans of Snakes · Pantalla: el orden de todo lo que se pinta (tablero, marcador, y encima la pantalla en la que estés: portada,
// mapa, tienda, ranking, cartas o final) y el marcador de arriba de la partida (barra de Frenesí, cartas, puntos y monedas).
'use strict';

const enPartida = () => ['juego', 'cartas', 'pausa', 'fin'].includes(JUEGO.modo);

function pintaTodo(W, H, dt) {
  UI.length = 0; UI.enter = null; UI.atras = null;   // los botones de este fotograma (js/dibujo.js)
  const retro = esRetro() && enPartida(), fr = esFrenesi() && JUEGO.modo === 'juego', jugando = enPartida();
  // el fondo de toda la pantalla
  if (retro) { G.fillStyle = '#3a3f33'; G.fillRect(0, 0, W, H); }
  else if (fr) { G.fillStyle = `hsl(${(JUEGO.t * 120 + 200) % 360} 60% ${7 + Math.sin(JUEGO.t * 20) * 2}%)`; G.fillRect(0, 0, W, H); }
  else { G.fillStyle = '#06110a'; G.fillRect(0, 0, W, H); }
  G.save(); aplicaTemblor();
  if (jugando && locuraActiva('texto')) pintaTableroTexto();
  else {
    const zoom = jugando && camaraGigante(dt);
    pintaFondo(retro);
    if (jugando) { pintaMuros(retro); pintaManzanas(retro); pintaItems(retro); pintaSerpiente(retro); }
    pintaEfectos(retro);
    if (zoom) G.restore();
  }
  if (jugando) { pintaApagon(); pintaAnuncio(); }
  G.restore();
  if (JUEGO.modo === 'juego') pintaMandos(retro, dt);
  if (jugando) { pintaMarcador(W, retro, fr); pintaMisCartas(retro); pintaObjetivo(W, H); pintaVS(); pintaLocura(W, H); pintaTutorial(W, dt); }
  else pintaMarcadorMenu(W);
  if (JUEGO.modo === 'cartas') pintaCartas(W, H);
  if (JUEGO.modo === 'menu') pintaPortada(W, H);
  if (JUEGO.modo === 'mapa') pintaMapa(W, H);
  if (JUEGO.modo === 'tienda') pintaTienda(W, H);
  if (JUEGO.modo === 'ranking') pintaRanking(W, H);
  if (JUEGO.modo === 'fin') pintaFin(W, H);
  if (JUEGO.modo === 'menu' || JUEGO.modo === 'juego') pintaRueda(retro);
  if (OPC.abierto) { OPC.t += dt; pintaOpciones(W, H); }
  pintaAnuncioPremio(W, H, dt);
}

// en los Mundos, el objetivo de la fase y cuánto llevas, bajo el tablero
function pintaObjetivo(W, H) {
  if (PARTIDA.tipo !== 'mundo') return;
  const F = MUNDOS[PARTIDA.mundo].fases[PARTIDA.fase], v = Math.min(F.obj[1], OBJETIVOS[F.obj[0]].valor(JUEGO)), y = Math.min(H - 26, TAB.y0 + TAB.h + 10), x = TAB.x0 + 34, w = TAB.w - 40;
  letra(textoObjetivo(F), x, y, 7, '#ffd54a', 'left', '#06110a', 2);
  letra(v.toLocaleString('es-ES') + '/' + F.obj[1].toLocaleString('es-ES'), x + w, y, 7, '#fff', 'right', '#06110a', 2);
  caja(x, y + 5, w, 4, 2, '#06110a', null); G.fillStyle = '#ffd54a'; G.fillRect(x + 0.5, y + 5.5, (w - 1) * progresoObjetivo(), 3);
}

function pintaMarcador(W, retro, fr) {
  const J = JUEGO, y = 6, h = 24;
  if (retro) {   // el marcador del móvil antiguo: números a secas
    G.fillStyle = RETRO.fondo; G.fillRect(TAB.x0 - 3, y, TAB.w + 6, h);
    letraMono(String(J.puntos).padStart(4, '0'), TAB.x0 + 2, y + 12, 10, RETRO.tinta, 'left');
    letraMono(tr('FRENESÍ'), W / 2 - 4, y + 12, 7, RETRO.tinta, 'right');
    pintaBarraFrenesi(W / 2, y + 8, 48, 8, true);
    letraMono('$' + J.monedasPartida, TAB.x0 + TAB.w - 2, y + 12, 10, RETRO.tinta, 'right');
    return;
  }
  caja(TAB.x0 - 3, y, TAB.w + 6, h, 5, fr ? '#1a0f2a' : '#0f2a1b', fr ? arcoiris(3, J.t, 55) : '#2a4a36', 1.5);
  // la barra de Frenesí con su nombre
  letra(fr ? tr('¡FRENESÍ!') + ' x' + J.mult + ' · ' + Math.ceil(J.frenesiT) : tr('FRENESÍ'), TAB.x0 + 4, y + 8, 7, fr ? '#ffd54a' : '#9cff6b', 'left', '#06110a', 2);
  pintaBarraFrenesi(TAB.x0 + 4, y + 13, 70, 7, false);
  // puntos y monedas
  letra(J.puntos.toLocaleString('es-ES'), TAB.x0 + TAB.w - 4, y + 9, 11, '#fff', 'right', '#06110a', 2.5);
  circulo(TAB.x0 + TAB.w - 26, y + 18.5, 3, '#ffd54a', '#8a5a00', 0.8);
  letra(String(J.monedasPartida), TAB.x0 + TAB.w - 4, y + 18.5, 8, '#ffd54a', 'right', '#06110a', 2);
}


