// Fans of Panic · Pantalla: el orden de todo lo que se pinta (el panel, los enemigos, el cúter, el marcador y, encima,
// la pantalla en la que estés: portada, mapa, galería o final; y las Opciones por encima de todo).
'use strict';

// Lola entra por un lado cuando corta ella
function pintaLola(t) {
  if (JUEGO.lolaT <= 0) return;
  const k = Math.min(1, (2 - JUEGO.lolaT) * 3), alto = TAB.c * 14;
  pintaSprite('lola', TAB.x0 + TAB.w + alto * 0.5 - alto * 0.95 * k, TAB.y0 + TAB.h - alto * 0.5, alto, 0, '#c86bff', 'L');
}

function pintaTodo(W, H, dt) {
  UI.length = 0; UI.enter = null; UI.atras = null;
  const J = JUEGO, jugando = enPartida();
  G.fillStyle = COL.fondo; G.fillRect(0, 0, W, H);
  if (jugando) {
    G.save(); aplicaTemblor();
    pintaTablero(J.t); pintaLocuras(J.t); pintaObjetos(J.t); pintaBecarios(J.t); pintaJefe(J.t); pintaCursor(J.t);
    pintaBarridos(dt); pintaMarco(); pintaEfectos(); pintaLola(J.t);
    G.restore();
    pintaMarcador(W, H, dt);
  }
  if (J.modo === 'menu') pintaPortada(W, H);
  if (J.modo === 'mapa') pintaMapa(W, H);
  if (J.modo === 'galeria') pintaGaleria(W, H);
  if (J.modo === 'fin') pintaFin(W, H);
  if (OPC.abierto) { OPC.t += dt; pintaOpciones(W, H); }
}
