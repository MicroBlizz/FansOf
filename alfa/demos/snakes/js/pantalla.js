// Fans of Snakes · Pantalla: el orden de todo lo que se pinta (tablero, marcador, y encima la pantalla en la que estés: portada,
// mapa, tienda, ranking, cartas o final). El marcador de arriba de la partida está en js/hud.js.
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
  if (jugando) { pintaVS(dt); pintaMarcador(W, retro, fr); pintaMisCartas(retro); pintaFranja(W, retro); pintaTutorial(W, dt); }
  else pintaMarcadorMenu(W);
  if (JUEGO.modo === 'cartas') pintaCartas(W, H);
  if (JUEGO.modo === 'menu') pintaPortada(W, H);
  if (JUEGO.modo === 'mapa') pintaMapa(W, H);
  if (JUEGO.modo === 'tienda') pintaTienda(W, H);
  if (JUEGO.modo === 'ranking') pintaRanking(W, H);
  if (JUEGO.modo === 'fin') pintaFin(W, H);
  if (OPC.abierto) { OPC.t += dt; pintaOpciones(W, H); }
  pintaAnuncioPremio(W, H, dt);
}




