// Fans of Recruit · LAS ANIMACIONES DE CRAZYBUNNY: todos sus dibujos, hechos una vez al arrancar a partir de sus poses.
// Corre en 8 dibujos (las patas van por su cuenta: apoyo, empuje, patada atrás y vuelta), respira parado, salta, se agacha y
// apunta al frente, hacia arriba y, en el aire, hacia abajo. Cada dibujo sabe dónde tiene la boca del cañón.
'use strict';

// las 8 posturas de una pata al correr: rodilla (r), talón (t) y ángulo del pie (a). La otra pata va 4 posturas por delante
const ZANCADA = [
  { r: [5.5, -6.5], t: [5.5, -3.2], a: -0.35 },   // apoya delante
  { r: [3, -5.6], t: [1, -2.4], a: 0 },           // carga el peso
  { r: [0.5, -5.6], t: [-3.5, -2.4], a: 0 },      // pasa por debajo
  { r: [-2.5, -5.5], t: [-8, -3.4], a: 0.35 },    // empuja
  { r: [-4.5, -5.5], t: [-11, -5.5], a: 0.8 },    // patada atrás
  { r: [-2, -6.5], t: [-8, -8], a: 0.9 },         // recoge
  { r: [2.5, -7.5], t: [-2, -7.5], a: 0.4 },      // pasa hacia delante
  { r: [5.5, -7.5], t: [4, -5.6], a: -0.2 },      // estira
];
const AP_DIAG = -0.78, AP_DIAG_ABAJO = 0.72;   // el ángulo del arma al apuntar en diagonal (arriba y abajo)
const BOTE = [1, 1.5, 0.5, -0.5, 1, 1.5, 0.5, -0.5];   // lo que baja el cuerpo en cada postura

// la pose entera de una postura de carrera. arriba: apuntando al techo
function poseCarrera(f, arriba) {
  const by = BOTE[f], lejos = ZANCADA[(f + 4) % 8], cerca = ZANCADA[f], sube = p => ({ r: [p.r[0], p.r[1] + by], t: p.t, a: p.a });
  return { cad: [-0.6, -9.6 + by], pa: sube(lejos), pb: sube(cerca), by, hy: by, hx: 1, vuelo: 1, capa: 1, fase: f * 0.8, oa: -0.95 + Math.sin(f * 0.785) * 0.1, od: 1 + Math.sin(f * 0.785 + 1) * 0.3, ob: 0.5,
    ap: arriba ? -1.5 : 0, boca: 'grito', ojo: 'furia', esp: f * 1.57 };
}
function creaConejo() {
  const C = SPR.conejo = {}, foto = (c, t) => fotoConejo(t || {}, c);
  const ARRIBA = { ap: -1.5 }, ABAJO = { ap: 1.35 };
  C.corre = ZANCADA.map((_, f) => foto(poseCarrera(f)));
  C.correArriba = ZANCADA.map((_, f) => foto(poseCarrera(f, true)));
  C.correDiag = ZANCADA.map((_, f) => foto(Object.assign(poseCarrera(f), { ap: AP_DIAG })));   // corriendo y apuntando en diagonal hacia arriba
  // parado: respira en 4 dibujos
  const resp = f => ({ by: [0, 0, 1, 0][f], hy: [0, 1, 1, 0][f], oa: -0.5 + Math.sin(f * 1.57) * 0.05, capa: 0.5, fase: f * 1.57, esp: 0, cad: [-0.6, -9.6 + [0, 0, 1, 0][f]] });
  C.quieto = [0, 1, 2, 3].map(f => foto(resp(f)));
  C.quietoArriba = [0, 1, 2, 3].map(f => foto(Object.assign(resp(f), ARRIBA)));
  // en el aire: sube con las patas recogidas y cae con ellas estiradas y las orejas arriba
  const sube = { by: -1, hy: -1, hx: 1, cad: [-0.6, -10.6], pa: { r: [6, -8.5], t: [2, -7], a: 0.5 }, pb: { r: [3, -6.5], t: [-4, -5.5], a: 0.7 }, vuelo: 0.25, capa: 1, fase: 2, oa: -1.1, od: 1.3, ob: 0.7, boca: 'grito', ojo: 'furia' };
  const cae = { by: 0, hy: -1, hx: 1, cad: [-0.6, -9.6], pa: { r: [4.5, -5.5], t: [1.5, -1.5], a: 0.55 }, pb: { r: [0.5, -5], t: [-4.5, -1], a: 0.7 }, vuelo: 0.85, capa: 1, fase: 4, oa: -0.15, od: -0.6, ob: -0.2, boca: 'grito', ojo: 'furia' };
  C.salta = [foto(sube), foto(cae)];
  C.saltaArriba = [foto(Object.assign({}, sube, ARRIBA)), foto(Object.assign({}, cae, ARRIBA))];
  C.saltaAbajo = [foto(Object.assign({}, sube, ABAJO)), foto(Object.assign({}, cae, ABAJO))];
  C.saltaDiag = [foto(Object.assign({}, sube, { ap: AP_DIAG })), foto(Object.assign({}, cae, { ap: AP_DIAG }))];
  C.saltaDiagAbajo = [foto(Object.assign({}, sube, { ap: AP_DIAG_ABAJO })), foto(Object.assign({}, cae, { ap: AP_DIAG_ABAJO }))];
  // agachado: el cuerpo baja y las patas se doblan
  const agacha = f => ({ by: 7, hy: 7 + (f ? 0.6 : 0), hx: 1.5, cad: [-1.6, -4.4], pa: { r: [5, -5.2], t: [1.5, -2.4], a: 0 }, pb: { r: [2.6, -4.6], t: [-4.6, -2.4], a: 0 }, capa: 0.5, fase: f * 2, oa: -0.75, od: 0.8, ob: 0.45, ojo: 'furia' });
  C.agachado = [0, 1].map(f => foto(agacha(f)));
  // le han dado: sale despedido hacia atrás con los ojos en cruz
  C.cae = [foto({ ojo: 'x', boca: 'ay', oa: -0.2, od: -0.4, ob: -0.2, vuelo: 0.9, capa: 1, fase: 1, hx: -1, pa: { r: [6, -7.5], t: [8, -4], a: -0.6 }, pb: { r: [3, -6.5], t: [4, -2.4], a: -0.5 } }, { inc: -0.3 }),
    foto({ ojo: 'x', boca: 'ay', oa: 0.1, od: -0.8, ob: -0.5, vuelo: 1, capa: 1, fase: 3, hx: -2, pa: { r: [7, -8.5], t: [10, -6], a: -0.9 }, pb: { r: [4, -7.5], t: [7, -4.4], a: -0.8 } }, { inc: -0.55, sy: 0.92 })];
  // lo ha conseguido: levanta el arma y sonríe
  C.gana = [0, 1].map(f => foto({ ap: -1.2, ojo: 'loco', boca: 'risa', by: f ? -1 : 0, hy: f ? -2 : 0, oa: f ? -0.3 : -0.5, od: f ? 0.1 : 0.4, capa: 0.6, fase: f * 2, cad: [-0.6, -9.6 - (f ? 1 : 0)] }));
}
