// Fans of Rouflage · ESPECTADOR: un camaleón despedido no se queda mirando su sello: se hace un fantasma que se pasea por el mapa (sin chocar con nada) para ver qué pasa,
// (y el cazador sin cartas igual) con las mismas teclas o la misma palanca de siempre. La partida sigue sin él; para irse, el menú de pausa (Salir al menú / Rendirse). El fantasma solo lo ve quien lo lleva.
'use strict';

const FANTASMA = { vel: 250, espera: 1.3 };      // velocidad (puntos por segundo) y segundos que se ve el sello antes de soltarse
// sin juego: camaleón despedido o cazador sin cartas (en los dos casos pasa a mirar)
const sinJuego = e => e.clase === 'cazador' ? e.balas <= 0 : !!e.fuera;
const espectando = () => J.fase === 'caza' && !J.pausa && !!J.yo && sinJuego(J.yo) && (J.yo.clase === 'cazador' || J.yo.tFuera > FANTASMA.espera);

// cada fotograma, desde controlaJugador: lo mueve según las teclas o la palanca
function mueveFantasma(dt) {
  const yo = J.yo;
  if (!J.fantasma) { J.fantasma = { x: yo.x, y: yo.y - 20, t: 0 }; avisa(yo.clase === 'cazador' ? tr('Sin cartas: pasea por el mapa para ver qué pasa') : tr('Estás despedido: pasea por el mapa para ver qué pasa'), 'aviso'); }
  const f = J.fantasma, [mx, my] = vectorMueve();
  f.t += dt; f.mueve = Math.hypot(mx, my) > 0.1;
  f.x = limita(f.x + mx * FANTASMA.vel * dt, 6, ANCHO - 6); f.y = limita(f.y + my * FANTASMA.vel * dt, 6, ALTO - 6);
}
// el fantasma: una sábana blanca y translúcida que flota, con su nombre
function pintaFantasma(c, t) {
  const f = J.fantasma; if (!f || !espectando()) return;
  const bote = Math.sin(t * 3.4) * 3, x = f.x, y = f.y + bote;
  c.save(); c.globalAlpha = 0.82;
  c.beginPath(); c.moveTo(x - 11, y + 12); c.lineTo(x - 11, y - 4); c.arc(x, y - 4, 11, Math.PI, 0); c.lineTo(x + 11, y + 12);
  for (let k = 0; k < 4; k++) c.quadraticCurveTo(x + 11 - k * 5.5 - 2.75, y + 17 - (k % 2) * 3, x + 11 - (k + 1) * 5.5, y + 12);
  c.closePath(); c.fillStyle = '#f4f1fa'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
  c.fillStyle = OL; c.beginPath(); c.ellipse(x - 4, y - 4, 1.8, 2.6, 0, 0, TAU); c.ellipse(x + 4, y - 4, 1.8, 2.6, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(x, y + 2, 2, 2.8, 0, 0, TAU); c.fill();
  c.restore();
  rotulo(c, tr('TÚ'), x, y - 26, 10, '#ffcb3d', OL, LETRA_UI);
}
