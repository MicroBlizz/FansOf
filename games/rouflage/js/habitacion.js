// Fans of Rouflage · LA HABITACIÓN: un paseo sin partida (fase 'paseo') para ver cómo te queda lo del armario en movimiento. Estás solo
// en la estación, con un armario de verdad en la sala; eliges el papel (camaleón o becario) y lo que llevas puesto se dibuja sobre tu
// galleta (vistePersonaje). Solo en la alfa y en desarrollo, como el armario (armario.js).
'use strict';
const HABITACION = { armario: { x: 780, y: 318, armario: true, ordenY: 0 }, cerca: false };
// le pone a un personaje la ropa del armario: tipo 'fan' (adornos de ARD) y el papel como piel
function vistePersonaje(e, ropa) {
  e.tipo = 'fan'; e.ropa = ropa;
  const [cv, g] = nuevaPiel(e.clase === 'cazador' && ropa.papel === 'blanco' ? '#aab4c4' : ARD.COLOR_PAPEL[ropa.papel] || BLANCO_PIEL, e.postura || 'firmes');
  if (ARD.PAPEL[ropa.papel]) { g.save(); g.scale(ESC_PIEL, ESC_PIEL); g.translate(PIE_X, PIE_Y); g.beginPath(); trazaAlubia(g, null, e.postura || 'firmes'); g.clip(); ARD.PAPEL[ropa.papel](g); g.restore(); }
  e.piel = cv; e.pctx = g; if (e.pasos) e.pasos.length = 0;
}
// los adornos del «fan»: lo que diga su ropa (en las medidas de la galleta, sin el encogido de los animales)
ADORNOS.fan = {
  detras(c, e) { const r = e.ropa; if (r && r.espalda && ARD.ESPALDAS[r.espalda]) ARD.ESPALDAS[r.espalda](c); },
  delante(c, e) { const r = e.ropa; if (r && r.cabeza && ARD.CABEZAS[r.cabeza]) ARD.CABEZAS[r.cabeza](c); },
};
function empiezaHabitacion(rol) {
  if (MAPA.id !== 'estacion') cargaMapa('estacion');      // la habitación es siempre en la estación (al volver al título se carga otra vez el mapa elegido)
  limpiaPartida(); J.modo = rol; J.t = 0; J.fase = 'paseo'; J.reloj = 0; PUERTA.cerrada = false; PUERTA.abierta = 1;
  const viejo = J.yo, [sx, sy] = viejo ? [viejo.x, viejo.y] : SALIDA_CAMALEONES[0];
  const yo = nuevoEnte(rol, 'fan', tr('Tú'), sx, sy); yo.jugador = true; J.yo = yo; J.cuenta = yo.pts; yo.dir = Math.PI / 2; yo.mira = 1;
  vistePersonaje(yo, ropaDe());
  pantalla(null); avanzaCamara(0, true); refrescaHud(true); musica('rfTitulo');
  E('hab').hidden = false; E('esquina').hidden = true; habRefrescaRol();
  cartel(tr('TU HABITACIÓN'), tr('Pasea y mira cómo te queda. El armario de la sala te cambia de ropa'));
}
function habRefrescaRol() { E('b-hab-cam').classList.toggle('activo', J.modo === 'camaleon'); E('b-hab-caz').classList.toggle('activo', J.modo === 'cazador'); }
function habCambiaRol(rol) {
  if (J.fase !== 'paseo' || J.modo === rol) return;
  const v = J.yo, i = J.entes.indexOf(v); if (i >= 0) J.entes.splice(i, 1);
  const lista = v.clase === 'cazador' ? J.cazadores : J.camaleones; const k = lista.indexOf(v); if (k >= 0) lista.splice(k, 1);
  const yo = nuevoEnte(rol, 'fan', tr('Tú'), v.x, v.y); yo.jugador = true; yo.dir = v.dir; yo.mira = v.mira; J.yo = yo; J.modo = rol; J.cuenta = yo.pts;
  vistePersonaje(yo, ropaDe()); play('select'); habRefrescaRol(); refrescaHud(true);
}
function habitacionSale() { E('hab').hidden = true; E('esquina').hidden = false; irTitulo(); }
function habitacionVuelve() { pantalla(null); if (J.fase === 'paseo' && J.yo) vistePersonaje(J.yo, ropaDe()); E('hab').hidden = false; }
function habitacionAbreArmario() { if (J.fase !== 'paseo') return; E('hab').hidden = true; abreArmario(null, 'habitacion'); }
// tocar el armario de la sala (o estar al lado y tocar el botón) lo abre
function habitacionToca(x, y) { const a = HABITACION.armario; if (Math.abs(x - a.x) < 34 && y > a.y - 80 && y < a.y + 6) { play('select'); habitacionAbreArmario(); return true; } return false; }
function habitacionAvanza() {
  if (J.fase !== 'paseo' || !J.yo) return;
  const a = HABITACION.armario, cerca = lejos(J.yo.x, J.yo.y, a.x, a.y) < 70;
  if (cerca !== HABITACION.cerca) { HABITACION.cerca = cerca; E('b-hab-armario').classList.toggle('cerca', cerca); if (cerca) pista(tr('Toca el armario para cambiarte de ropa'), 2.5); }
}
// el armario de la sala, dibujado en el mundo (los pies en x,y)
function pintaArmarioSala(c, a, t) {
  const { shape, rr, poly, line, dot } = ARD;
  c.save(); c.translate(a.x, a.y);
  shape(c, ARD.el(0, 1, 30, 7), 'rgba(20,10,40,.3)', 0);
  shape(c, rr(-26, -74, 52, 74, 3), '#b98a4f', 2.6);                      // el mueble
  shape(c, rr(-30, -78, 60, 7, 2), '#9a6a33', 2.2);                        // la cornisa
  shape(c, rr(-23, -70, 22, 64, 2), '#c99a62', 2); shape(c, rr(1, -70, 22, 64, 2), '#c99a62', 2);   // las dos puertas
  for (const x of [-12, 12]) for (let k = -64; k < -10; k += 6) line(c, [x - 8, k, x + 8, k], 'rgba(90,50,10,.25)', 1.2);   // la veta
  dot(c, -4, -38, 2.4, OL); dot(c, 4, -38, 2.4, OL); dot(c, -4, -38, 1.4, '#ffcb3d'); dot(c, 4, -38, 1.4, '#ffcb3d');   // los tiradores
  shape(c, poly(-24, -80, -6, -92, 6, -92, 24, -80), '#ff4b5c', 2);        // la percha de arriba con un gorro de fiesta colgado, para que se vea qué es
  rotulo(c, tr('ARMARIO'), 0, -104 + Math.sin(t * 2) * 1.5, 9, HABITACION.cerca ? '#ffcb3d' : '#fff6ea', OL, LETRA_UI);
  c.restore();
}
function preparaHabitacion() {
  E('b-hab-cam').onclick = () => habCambiaRol('camaleon');
  E('b-hab-caz').onclick = () => habCambiaRol('cazador');
  E('b-hab-armario').onclick = () => { if (J.fase === 'paseo') { play('select'); habitacionAbreArmario(); } };
  E('b-hab-salir').onclick = () => { play('select'); habitacionSale(); };
}
