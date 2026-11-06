// Fans of Zombies · LA ROPA EN EL PERSONAJE (pantalla, ADR 079): encima del modelo de tu animal se ponen cajas del color de cada prenda
// (gorro o casco en la cabeza, la chaqueta sobre el cuerpo, el pantalón y el calzado en cada pierna, que se mueven con ella) y la
// mochila de excursión o de mudanza a la espalda. Se rehace solo cuando cambia lo que llevas puesto.
'use strict';
const ROPA_VISTA = { firma: null, jug: null, piezas: [] };
// cada prenda: dónde va (cuerpo o piernas) y sus cajas [ancho, alto, fondo, x, y, z] (las del cuerpo, sobre el modelo sin escalar)
const CAJAS_ROPA = {
  cabeza: { gorro: [[0.66, 0.2, 0.56, 0, 1.9, 0.02], [0.14, 0.14, 0.14, 0, 2.06, 0.02, 0xe8e0d0]], casco: [[0.7, 0.56, 0.6, 0, 1.62, 0.02], [0.5, 0.16, 0.04, 0, 1.6, 0.33, 0x9ad8ff]] },
  cuerpo: [[0.72, 0.62, 0.54, 0, 0.93, 0.01], [0.24, 0.52, 0.26, -0.42, 0.95, 0.06], [0.24, 0.52, 0.26, 0.42, 0.95, 0.06]],
  piernas: [[0.27, 0.46, 0.29, 0, -0.25, 0]],
  pies: [[0.31, 0.18, 0.37, 0, -0.53, 0.04]],
};
const CAJAS_MOCHILA = { mochilaM: [0.6, 0.75, 0.36, 0, 1.0, -0.42, 0x5a7a3a], mochilaG: [0.74, 1.0, 0.5, 0, 1.2, -0.48, 0x9a4a2a] };

function pintaRopa(J) {
  const v = VISTA.jug;
  if (!v || !J.equipo) return;
  const firma = ['cabeza', 'cuerpo', 'piernas', 'pies'].map((h) => (J.equipo[h] ? J.equipo[h].id : '')).join(',') + '|' + J.equipo.mochila;
  if (firma === ROPA_VISTA.firma && v === ROPA_VISTA.jug) return;
  quitaRopa(); ROPA_VISTA.firma = firma; ROPA_VISTA.jug = v;
  const AJ = ZOM.AJ, E = J.equipo;
  if (E.cabeza) pon(v.cuerpo, CAJAS_ROPA.cabeza[E.cabeza.id], AJ.ropa[E.cabeza.id].color);
  if (E.cuerpo) pon(v.cuerpo, CAJAS_ROPA.cuerpo, AJ.ropa[E.cuerpo.id].color);
  for (const pierna of v.piernas) {
    if (E.piernas) pon(pierna, CAJAS_ROPA.piernas, AJ.ropa[E.piernas.id].color);
    if (E.pies) pon(pierna, CAJAS_ROPA.pies, AJ.ropa[E.pies.id].color);
  }
  const M = CAJAS_MOCHILA[E.mochila];
  if (M) pon(v.cuerpo, [M], M[6]);
}
// unas cajas juntas en una malla, colgada de la pieza que toca (para que se mueva con ella)
function pon(padre, cajas, color) {
  const o = new Obra();
  for (const [w, h, d, x, y, z, c] of cajas) o.caja(w, h, d, c || color, x, y, z);
  const m = o.hecha(); padre.add(m); ROPA_VISTA.piezas.push(m);
}
function quitaRopa() {
  for (const m of ROPA_VISTA.piezas) { if (m.parent) m.parent.remove(m); m.traverse((k) => { if (k.geometry) k.geometry.dispose(); }); }
  ROPA_VISTA.piezas.length = 0; ROPA_VISTA.firma = null;
}
