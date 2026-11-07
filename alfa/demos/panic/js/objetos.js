// Fans of Panic · Objetos del panel: salen sobre lo tapado y se cogen al destaparlos con un corte. Hielo (congela a los enemigos),
// Escudo (aguanta un golpe) y Tijera (el cúter va más deprisa). Cada uno dura unos segundos.
'use strict';

const OBJETOS = [];
const TIPOS_OBJ = ['hielo', 'escudo', 'tijera'];
const OBJ_COL = { hielo: COL.cian, escudo: COL.verde, tijera: COL.oro };

function nuevosObjetos() { OBJETOS.length = 0; JUEGO.objT = 5; }

function avanzaObjetos(dt) {
  JUEGO.objT -= dt;
  for (const o of OBJETOS) o.t += dt;
  if (JUEGO.objT > 0 || OBJETOS.length >= 2) return;
  JUEGO.objT = 7 + Math.random() * 4;
  for (let i = 0; i < 30; i++) {   // una casilla tapada, lejos del jefe
    const x = 2 + Math.floor(Math.random() * (TAB.cols - 4)), y = 2 + Math.floor(Math.random() * (TAB.filas - 4));
    if (TAB.cel[idx(x, y)] !== TAPADA || Math.hypot(x - JEFE.x, y - JEFE.y) < JEFE.r + 4) continue;
    OBJETOS.push({ x, y, tipo: TIPOS_OBJ[Math.floor(Math.random() * TIPOS_OBJ.length)], t: 0 });
    return;
  }
}

// tras un corte: los objetos que han quedado destapados se cogen
function recogeObjetos() {
  for (let i = OBJETOS.length - 1; i >= 0; i--) {
    const o = OBJETOS[i];
    if (TAB.cel[idx(o.x, o.y)] !== DESTAPADA) continue;
    OBJETOS.splice(i, 1); cogeObjeto(o);
  }
}

function cogeObjeto(o) {
  const J = JUEGO, px = TAB.x0 + (o.x + 0.5) * TAB.c, py = TAB.y0 + (o.y + 0.5) * TAB.c;
  if (o.tipo === 'hielo') { JEFE.congelaT = 4; SONIDO.congela(); textoSube(tr('¡HIELO!'), px, py, COL.cian); }
  else if (o.tipo === 'escudo') { J.escudo = true; SONIDO.escudo(); textoSube(tr('¡ESCUDO!'), px, py, COL.verde); }
  else { J.rapidoT = 6; SONIDO.objeto(); textoSube(tr('¡TIJERA!'), px, py, COL.oro); }
  confeti(px, py, 20, OBJ_COL[o.tipo]);
}

function pintaObjetos(t) {
  const { x0, y0, c } = TAB;
  for (const o of OBJETOS) {
    const px = x0 + (o.x + 0.5) * c, py = y0 + (o.y + 0.5) * c + Math.sin(t * 4 + o.x) * 2, r = c * 1.6;
    circulo(px, py, r + 2, 'rgba(255,255,255,.15)', null);
    circulo(px, py, r, OBJ_COL[o.tipo], COL.tinta, 2);
    letra(o.tipo === 'hielo' ? '*' : o.tipo === 'escudo' ? 'O' : 'X', px, py + 1, r * 1.3, COL.tinta, 'center', null, 0);
  }
}
