// Fans of Panic · Objetos del panel: salen sobre lo tapado y se cogen al destaparlos con un corte. Poderes: Hielo (congela a los
// enemigos), Escudo (aguanta un golpe), Tijera (el cúter va más deprisa), Bomba (destapa un círculo), Fantasma (atraviesas al
// Inspector), Imán (coge todos los objetos del panel), Doble cúter (tus cortes se reflejan al otro lado) y Lola (corta ella un
// trozo grande). Y el «?» de locura, que lanza una de js/locuras.js. Los dibujos son de Yoshi (img/obj-<tipo>.png).
'use strict';

const OBJETOS = [];
const PODERES = ['hielo', 'escudo', 'tijera', 'bomba', 'fantasma', 'iman', 'doble', 'lola'];
const OBJ_COL = { hielo: COL.cian, escudo: COL.verde, tijera: COL.oro, bomba: '#ff6b4a', fantasma: '#d8d8ff', iman: '#ff5fa2', doble: '#ffb347', lola: '#c86bff', locura: '#ffffff' };
const OBJ_TXT = { hielo: '¡HIELO!', escudo: '¡ESCUDO!', tijera: '¡TIJERA!', bomba: '¡BOMBA!', fantasma: '¡FANTASMA!', iman: '¡IMÁN!', doble: '¡DOBLE CÚTER!', lola: '¡Lola al rescate!' };

function nuevosObjetos() { OBJETOS.length = 0; JUEGO.objT = 5; JUEGO.locT = AJUSTES.locuraCada[0]; }

function avanzaObjetos(dt) {
  const J = JUEGO;
  J.objT -= dt; J.locT -= dt;
  for (const o of OBJETOS) o.t += dt;
  if (J.locT <= 0 && !OBJETOS.some(o => o.tipo === 'locura')) { J.locT = AJUSTES.locuraCada[0] + Math.random() * AJUSTES.locuraCada[1]; sueltaObjeto('locura'); return; }
  if (J.objT > 0 || OBJETOS.filter(o => o.tipo !== 'locura').length >= 2) return;
  J.objT = 6 + Math.random() * 4;
  sueltaObjeto(PODERES[Math.floor(Math.random() * PODERES.length)]);
}

// un objeto en una casilla tapada, lejos del jefe
function sueltaObjeto(tipo) {
  for (let i = 0; i < 30; i++) {
    const x = 2 + Math.floor(Math.random() * (TAB.cols - 4)), y = 2 + Math.floor(Math.random() * (TAB.filas - 4));
    if (TAB.cel[idx(x, y)] !== TAPADA || Math.hypot(x - JEFE.x, y - JEFE.y) < JEFE.r + 4) continue;
    OBJETOS.push({ x, y, tipo, t: 0 });
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

const centroObj = o => [TAB.x0 + (o.x + 0.5) * TAB.c, TAB.y0 + (o.y + 0.5) * TAB.c];

function cogeObjeto(o) {
  const [px, py] = centroObj(o);
  if (o.tipo === 'locura') { lanzaLocura(px, py); return; }
  EFECTO_PODER[o.tipo](o, px, py);
  textoSube(tr(OBJ_TXT[o.tipo]), px, py, OBJ_COL[o.tipo]);
  confeti(px, py, 20, OBJ_COL[o.tipo]);
}

// qué hace cada poder (una tabla, no un switch)
const EFECTO_PODER = {
  hielo: () => { JEFE.congelaT = 4; SONIDO.congela(); },
  escudo: () => { JUEGO.escudo = true; SONIDO.escudo(); },
  tijera: () => { JUEGO.rapidoT = 6; SONIDO.objeto(); },
  fantasma: () => { JUEGO.fantasmaT = 4; SONIDO.fantasma(); },
  doble: () => { JUEGO.dobleT = 10; SONIDO.objeto(); },
  bomba: o => { const sil = destapaCirculo(o.x, o.y, 7); recolocaJefe(); recolocaHijos(); sumaDestapado(sil, 'bomba'); SONIDO.grande(); temblor(1.2); vibra([40, 30, 80]); },
  iman: () => { SONIDO.objeto(); for (const o of OBJETOS.splice(0)) if (o.tipo !== 'locura') { EFECTO_PODER[o.tipo](o); textoSube(tr(OBJ_TXT[o.tipo]), ...centroObj(o), OBJ_COL[o.tipo]); } },
  lola: () => { const sil = corteDeLola(); recolocaJefe(); recolocaHijos(); sumaDestapado(sil, 'lola'); SONIDO.gana(); JUEGO.lolaT = 2; },
};

// Lola corta un rectángulo grande (un sexto del panel) donde no esté el jefe
function corteDeLola() {
  const w = Math.floor(TAB.cols * 0.4), h = Math.floor(TAB.filas * 0.4);
  const izq = JEFE.x > TAB.cols / 2, arr = JEFE.y > TAB.filas / 2;
  const x0 = izq ? 1 : TAB.cols - 1 - w, y0 = arr ? 1 : TAB.filas - 1 - h;
  let sil = 0;
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (TAB.sil[idx(x, y)] && TAB.cel[idx(x, y)] === TAPADA) sil++;
  cambiaRect(x0, y0, w, h, TAPADA, DESTAPADA);
  return sil;
}

function pintaObjetos(t) {
  for (const o of OBJETOS) {
    const [px, py0] = centroObj(o), py = py0 + Math.sin(t * 4 + o.x) * 2, alto = TAB.c * 3.6;
    circulo(px, py, alto / 2 + 2, 'rgba(255,255,255,.15)', null);
    pintaSprite('obj-' + o.tipo, px, py, alto, 0, OBJ_COL[o.tipo], o.tipo === 'locura' ? '?' : o.tipo[0].toUpperCase());
  }
}
