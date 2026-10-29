// Fans of Goose · EL DADO ES TUYO: como en el Juego de la Oca, avanzas tirando el dado (dos toques, el botón del dado o espacio).
// Sale un número y sales disparado esas casillas hacia arriba (el TRAMO, js/escenas.js), parando en la que toque. Pares, bendición
// mientras dura el tramo (2 Prisa, 4 Gigante, 6 Doble daño); impares, maldición (1 Horda doble, 3 Patas de plomo, 5 Controles al revés).
// Con la barra de plumas llena el dado sale BENDITO (solo pares y una casilla más). Al salir de la Posada el dado sale MALDITO (impar).
'use strict';

const CARAS = {
  1: { nombre: 'HORDA DOBLE', desc: 'El doble de ocas', bueno: false, color: '#ff4d4d' },
  2: { nombre: 'PRISA', desc: 'Corres mucho más', bueno: true, color: '#6bf2ff' },
  3: { nombre: 'PATAS DE PLOMO', desc: 'Vas más lento', bueno: false, color: '#ff8a4d' },
  4: { nombre: 'GIGANTE', desc: 'Armas más grandes', bueno: true, color: '#7dff6b' },
  5: { nombre: 'CONTROLES AL REVÉS', desc: 'Izquierda es derecha', bueno: false, color: '#c9a0ff' },
  6: { nombre: 'DOBLE DAÑO', desc: '¡Todo pega el doble!', bueno: true, color: '#ffd34d' },
};

function nuevoDado() { return { rodando: 0, cara: 0, efecto: 0, quedan: 0, mostrar: 0, bendito: false, maldito: false, soloPares: false, soloImpares: false, extra: 0 }; }

// ¿se puede tirar ahora?
const puedeTirar = () => { const J = JUEGO; return J.modo === 'juego' && J.fase === 'parado' && !J.minijefe && !J.trato && J.dado.rodando <= 0 && J.salto <= 0 && J.caida <= 0 && J.muerto <= 0 && !J.jefe && !J.victoria && J.casilla < CFG.jardin; };

function tirarDado(opciones) {
  const J = JUEGO, D = J.dado; if (!puedeTirar()) return false;
  const o = opciones || {};
  salePosada();
  D.rodando = 1.0; D.cara = 0; D.extra = 0;
  D.soloPares = !!o.soloPares || D.bendito; D.soloImpares = !D.soloPares && (!!o.soloImpares || D.maldito);
  if (D.bendito) { D.extra = 1; D.bendito = false; J.impulso = 0; J.avisoImpulso = false; }
  D.maldito = false;
  J.yo.moviendo = false;
  SONIDO.dadoRueda(); vibra(20);
  return true;
}
// la Tirada de la suerte (casillas 26 y 53): sale sola y siempre par
function tiradaSuerte() { aviso(tr('¡TIRADA DE LA SUERTE!'), '#ffe9a8', 1.3); tirarDado({ soloPares: true }); }

function avanzaDado(dt) {
  const J = JUEGO, D = J.dado;
  if (D.quedan > 0) { D.quedan -= dt; if (D.quedan <= 0) { D.efecto = 0; SONIDO.dadoFin(); } }
  if (D.mostrar > 0) D.mostrar -= dt;
  if (D.rodando <= 0) return;
  D.rodando -= dt;
  if ((J.cuadro % 4) === 0) SONIDO.dadoTic();
  if (D.rodando > 0) return;
  // ha caído: la cara
  let c = 1 + ((Math.random() * 6) | 0);
  if (D.soloPares) c = 2 * (1 + ((Math.random() * 3) | 0));
  if (D.soloImpares) c = 1 + 2 * ((Math.random() * 3) | 0);
  if (maldita('sinseis') && c === 6) c = 4;
  // al principio el dado da pasos cortos (1-3 en el Bosque, 1-4 en el Pantano): la partida dura más y se aprende con calma
  const tope = J.casilla < 11 ? 3 : J.casilla < 21 ? 4 : 6; if (c > tope) c = tope;
  D.cara = c; D.efecto = c; D.quedan = 99; D.mostrar = 1.6;   // el efecto dura todo el tramo (lo cierra la llegada, +3 s)
  const F = CARAS[c];
  aviso(tr(F.nombre), F.color, 1.6); aviso2(tr('{n} casillas', { n: c + D.extra }));
  if (F.bueno) { destella(F.color, 0.3); SONIDO.dadoBueno(c === 6); if (c === 6) { tiembla(4); congela(0.1); } }
  else { destella('#ff2d2d', 0.25); SONIDO.dadoMalo(); tiembla(3); }
  vibra(F.bueno ? 30 : [40, 30, 40]);
  empiezaTramo(c + D.extra);
}
// al llegar a la casilla, el efecto del dado aguanta 3 s más
function cierraEfectoDado() { const D = JUEGO.dado; if (D.efecto) D.quedan = Math.min(D.quedan, 3); }

const invertido = () => JUEGO.dado.efecto === 5 && JUEGO.dado.quedan > 0;
const multiVel = () => (JUEGO.dado.efecto === 2 ? 1.45 : JUEGO.dado.efecto === 3 ? 0.7 : 1);

// el dado en pantalla: grande en el centro mientras rueda; el botón TIRA EL DADO cuando estás parado; el efecto en marcha en su esquina
function pintaDado() {
  const J = JUEGO, D = J.dado, W = PAN.W;
  if (D.rodando > 0) {
    const k = 1 - D.rodando, y = 120 + Math.abs(Math.sin(k * 9)) * (1 - k) * -40, x = W / 2 + Math.sin(k * 5) * 30 * (1 - k);
    const cara = 1 + ((J.t * 18) | 0) % 6;
    G.globalAlpha = 0.5; G.fillStyle = '#000'; G.beginPath(); G.ellipse(x, 142, 14 * (0.6 + k * 0.4), 4, 0, 0, 6.283); G.fill(); G.globalAlpha = 1;
    pintaGirado('dadogrande' + cara, x, y, k * 14 * (1 - k * 0.7), 1);
    return;
  }
  if (D.mostrar > 0) { const k = Math.min(1, (1.6 - D.mostrar) * 6); pinta('dadogrande' + D.cara, W / 2, 120, false, false, 0.6 + k * 0.4); }
  // la esquina derecha: el efecto en marcha
  const x = W - 16, y = 46;
  if (D.efecto && D.quedan > 0) {
    pinta('dado' + D.efecto, x, y, false, false, 1.3);
    const F = CARAS[D.efecto];
    G.strokeStyle = F.color; G.lineWidth = 2; G.beginPath(); G.arc(x, y, 12, -1.57, -1.57 + 6.283 * Math.min(1, D.quedan / 3)); G.stroke();
  }
  // el botón del dado
  if (puedeTirar()) {
    const pulso = 1 + Math.sin(J.t * 6) * 0.06, bx = W / 2, by = 76;
    G.globalAlpha = 0.35 + Math.sin(J.t * 6) * 0.15; G.fillStyle = D.bendito ? '#ffd34d' : D.maldito ? '#c9a0ff' : '#f6e7b8'; G.beginPath(); G.arc(bx, by, 18 * pulso, 0, 6.283); G.fill(); G.globalAlpha = 1;
    if (SPR['s-dado']) pinta('s-dado', bx, by + Math.sin(J.t * 5) * 1.5, false, false, 1); else pintaGirado('dadogrande' + (1 + ((J.t * 0.8) | 0) % 6), bx, by, Math.sin(J.t * 2) * 0.15, 0.75 * pulso);
    texto2(D.bendito ? tr('¡DADO BENDITO!') : D.maldito ? tr('DADO MALDITO') : tr('TIRA EL DADO'), bx, by + 22, 7, D.bendito ? '#ffd34d' : D.maldito ? '#c9a0ff' : '#fff4dc');
    BOTONES.push({ x: bx - 28, y: by - 22, w: 56, h: 52, accion: () => tirarDado() });
  }
}
