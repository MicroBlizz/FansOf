// Fans of Recruit · EL JEFE: SurvivalBot, el robot de Microblizz del mundo 1 de Fans of Rumble: una cabeza de robot con parche
// en el ojo sobre un edificio de oficinas con corbata, dos brazos con pinzas y orugas. Mira a la derecha; el juego lo pinta en
// espejo. Se dibuja en grande (casi media pantalla) con las mismas piezas que su dibujo de la serie.
'use strict';

const ESC_JEFE = 1.7;   // cuánto se amplía el dibujo
// un brazo con codo y pinza. Devuelve dónde queda la pinza
function brazoBot(p, sx, sy, ang, codo, M) {
  const ex = sx + Math.cos(ang) * 9, ey = sy + Math.sin(ang) * 9, af = ang + codo, hx = ex + Math.cos(af) * 9, hy = ey + Math.sin(af) * 9;
  p.parte(F.tr(sx, sy, ex, ey, 3.2, 2.8), M, { r: 2.5, sombra: 1 });
  p.parte(F.tr(ex, ey, hx, hy, 2.9, 2.4), M, { r: 2.5, sombra: 1 });
  p.parte(F.ov(ex, ey, 2.6, 2.6), MAT.robotO, { r: 2, sombra: 0 });
  const pinza = s => F.gira(F.mueve(F.pol(0, s * 1.2, 6.5, s * 4.2, 7.5, s * 1, 2, s * 0.2), hx, hy), af, hx, hy);
  p.parte(F.un(pinza(-1), pinza(1)), MAT.robotO, { r: 1.2, sombra: 1 });
  p.parte(F.ov(sx, sy, 5.4, 5.4), M, { r: 4, sombra: 2 });
  return [hx + Math.cos(af) * 6, hy + Math.sin(af) * 6];
}
/* o: hy = cuánto sube la cabeza; bA, cA = brazo de detrás (ángulo y codo); bB, cB = brazo de delante; ant = antenas;
   luz = qué ventanas están encendidas; cara: '' normal, 'furia' (ojo blanco: va a disparar) o 'x'; boca = abierta; humo = está tocado.
   Devuelve { ojo, garra }: dónde quedan el ojo y la pinza de delante */
function survivalBot(p, o) {
  const P = MAT, hy = o.hy, ED = P.edificio;
  // la oruga de detrás y el brazo de detrás
  p.parte(F.rr(-17, -10, 15, 10, 4), P.negro, { r: 3, sombra: 0 });
  for (const x of [-13, -6]) p.plano(F.ov(x, -5, 1.8, 1.8), P.acero.c[2]);
  brazoBot(p, -14, -37, o.bA, o.cA, P.robotO);
  // el edificio: ventanas (unas encendidas y otras no), la corbata y el letrero
  const idE = p.parte(F.rr(-15, -43, 30, 34, 3), ED, { r: 5, sombra: 1 });
  for (let r = 0; r < 3; r++) for (const c of [-12, -8, 5, 9]) p.plano(F.rr(c, -40 + r * 5, 3, 3, 0), ((r * 7 + c * 3 + o.luz + 40) % 5) > 1 ? '#ffe08a' : ED.c[1]);
  p.parte(F.rr(-3, -43.5, 6, 3, 1), P.rojo, { r: 1.5, sombra: 0 });
  p.parte(F.pol(-2.5, -41, 2.5, -41, 3.6, -30, 0, -26, -3.6, -30), P.rojo, { r: 2.5, sombra: 1 });
  p.plano(F.rr(-13, -24, 26, 10, 0), ED.c[0]);
  letrasPared(p, 'MB', 0, -22.5, 1, P.blanco, 5, true);
  p.tono(F.rr(-14, -13, 28, 3, 0), -1, idE);
  if (o.humo) { p.plano(F.pol(6, -43, 9, -36, 7, -34, 11, -28, 8, -30, 5, -36), ED.c[0]); p.plano(F.pol(-12, -20, -8, -17, -11, -14), ED.c[0]); }
  // el cuello y la cabeza
  p.parte(F.rr(-5, -47, 10, 5, 1), P.robotO, { r: 2, sombra: 1 });
  p.parte(F.rr(-12, -65 + hy, 24, 19, 5), P.robot, { r: 5, sombra: 2 });
  // el ojo rojo (blanco cuando carga el rayo), el parche con su cruz y la ceja
  const ex = 4.5, ey = -57 + hy;
  p.plano(F.ov(ex, ey, 5, 5), '#2a0d14');
  p.parte(F.ov(ex, ey, 3.6, 3.6), o.cara === 'furia' ? P.oro : P.rojo, { r: 3.4, linea: false, sombra: 0 });
  if (o.cara === 'x') { p.plano(F.tr(ex - 2.4, ey - 2.4, ex + 2.4, ey + 2.4, 0.6), '#2a0d14'); p.plano(F.tr(ex - 2.4, ey + 2.4, ex + 2.4, ey - 2.4, 0.6), '#2a0d14'); }
  else p.plano(F.ov(ex - 1.3, ey - 1.5, 1, 1), '#ffe9e9');
  p.parte(F.rr(-10, -61 + hy, 8, 7, 1), P.carton, { r: 1.5, sombra: 1 });
  p.plano(F.tr(-8.6, -59.6 + hy, -3.4, -55.4 + hy, 0.45), P.carton.c[1]); p.plano(F.tr(-3.4, -59.6 + hy, -8.6, -55.4 + hy, 0.45), P.carton.c[1]);
  p.plano(F.tr(0, -60.8 + hy, 9.5, -63.4 + hy, 0.7), TINTA);
  // la boca de rejilla
  const alto = o.boca ? 6 : 4;
  p.plano(F.rr(-7, -52 + hy, 14, alto, 1), '#1b2033');
  for (let x = -5; x <= 5; x += 2) p.plano(F.rr(x, -52 + hy, 1, alto, 0), P.robot.c[2]);
  if (o.boca) p.plano(F.rr(-6, -49 + hy, 12, 1, 0), P.rojo.c[3]);
  // las antenas
  p.plano(F.tr(-6, -65 + hy, -8 + o.ant, -71 + hy, 0.5), TINTA); p.parte(F.ov(-8.5 + o.ant, -72 + hy, 2.3, 2.3), P.rojo, { r: 2, sombra: 0 });
  p.plano(F.tr(6, -65 + hy, 8 - o.ant * 0.5, -69 + hy, 0.5), TINTA); p.parte(F.ov(8.2 - o.ant * 0.5, -70 + hy, 1.8, 1.8), P.robot, { r: 1.6, sombra: 0 });
  // el brazo de delante y la oruga de delante
  const garra = brazoBot(p, 15, -37, o.bB, o.cB, P.robot);
  p.parte(F.rr(1, -10, 17, 10, 4), P.negro, { r: 3, sombra: 0 });
  for (const x of [6, 13]) p.plano(F.ov(x, -5, 2, 2), P.acero.c[3]);
  return { ojo: [ex * ESC_JEFE, ey * ESC_JEFE], garra: [garra[0] * ESC_JEFE, garra[1] * ESC_JEFE] };
}
const POSE_JEFE = { hy: 0, bA: 1.9, cA: 0.4, bB: 1.25, cB: -0.7, ant: 0, luz: 0, cara: '', boca: false, humo: false };
function fotoJefe(t, c) {
  const p = new Pincel(150, 142, 70, 134, { sx: (t.sx || 1) * ESC_JEFE, sy: (t.sy || 1) * ESC_JEFE, inc: t.inc || 0 });
  const d = survivalBot(p, Object.assign({}, POSE_JEFE, c)), s = p.lienzo();
  return Object.assign(s, d);
}
// todos sus dibujos; con humo = true, los de cuando ya está tocado
function creaJefe() {
  const hazlos = humo => {
    const J_ = {};
    J_.quieto = [0, 1, 2, 3].map(f => fotoJefe({}, { humo, hy: f === 2 ? -1 : 0, ant: [0, 1, 0, -1][f], luz: f, bB: 1.25 + Math.sin(f * 1.57) * 0.08, bA: 1.9 - Math.sin(f * 1.57) * 0.06 }));
    J_.alza = fotoJefe({ inc: -0.1 }, { humo, bB: -1.9, cB: -0.5, bA: 2.3, ant: -2, cara: 'furia', boca: true, luz: 2 });
    J_.golpe = fotoJefe({ inc: 0.14 }, { humo, bB: 0.55, cB: 0.2, bA: 2.2, ant: 2, boca: true, hy: 1, luz: 3 });
    J_.lanza = [fotoJefe({ inc: -0.06 }, { humo, bB: -2.6, cB: 0.9, bA: 2.1, ant: -1, boca: true, luz: 1 }), fotoJefe({ inc: 0.08 }, { humo, bB: -0.5, cB: 0.3, bA: 2, ant: 1.5, boca: true, luz: 2 })];
    J_.rayo = [0, 1].map(f => fotoJefe({ sy: f ? 1.02 : 1 }, { humo, cara: 'furia', boca: true, hy: -f, ant: f ? 2 : -2, luz: f * 3, bB: 1.5, cB: -1, bA: 2.2 }));
    J_.dano = fotoJefe({ inc: -0.16 }, { humo: true, cara: 'x', bB: 0.7, cB: 0.9, bA: 2.4, ant: 3, boca: true });
    return J_;
  };
  SPR.jefe = hazlos(false); SPR.jefeRoto = hazlos(true);
}
// lo que tira el jefe: una carta de despido (un sobre que gira; 2 dibujos)
function creaCartas() {
  SPR.carta = [0, 1].map(k => { const p = new Pincel(15, 13, 7, 6), G = f => F.gira(f, k ? 0.5 : -0.2, 0, 0);
    p.parte(G(F.rr(-5.5, -3.5, 11, 7.4, 0.6)), MAT.blanco, { plano: 5, canto: [0, -1], sombra: 0 });
    p.plano(G(F.tr(-5, -3, 0, 0.6, 0.45)), MAT.blanco.c[1]); p.plano(G(F.tr(5, -3, 0, 0.6, 0.45)), MAT.blanco.c[1]); p.plano(G(F.ov(0, 0.8, 1.5, 1.5)), MAT.rojo.c[3]);
    return p.lienzo(); });
}
