// Fans of Goose · EL DADO ES TUYO: como en el Juego de la Oca, avanzas tirando el dado (dos toques, el botón del dado o espacio).
// Sale un número y se abren las barreras hasta esa casilla: vas tú andando (el CAMINO, js/barreras.js) y paras en la que toque. Pares, bendición
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
  let c = 1 + ((azarDado() * 6) | 0);   // azarDado: en el Tablero del día, los mismos dados para todos (js/desafios.js)
  if (D.soloPares) c = 2 * (1 + ((azarDado() * 3) | 0));
  if (D.soloImpares) c = 1 + 2 * ((azarDado() * 3) | 0);
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
const multiVel = () => (JUEGO.dado.efecto === 2 ? 1.45 : JUEGO.dado.efecto === 3 ? 0.7 : 1) * frenadoNieve() * (poderRueda('prisa') ? 1.3 : 1);   // y la Rueda de la fortuna (js/armas4.js)

// el dado en pantalla: grande en el centro mientras rueda; el botón TIRA EL DADO cuando estás parado; el efecto en marcha en su esquina
function pintaDado() {
  const J = JUEGO, D = J.dado, W = PAN.W;
  if (D.rodando > 0) {
    const k = 1 - D.rodando, y = 120 + Math.abs(Math.sin(k * 9)) * (1 - k) * -40, x = W / 2 + Math.sin(k * 5) * 30 * (1 - k);
    const cara = 1 + ((J.t * 18) | 0) % 6;
    G.globalAlpha = 0.5; disco(x, 142, Math.round(14 * (0.6 + k * 0.4)), 4, '#000'); G.globalAlpha = 1;
    pintaGirado('dadogrande' + cara, x, y, k * 14 * (1 - k * 0.7), 1);
    return;
  }
  if (D.mostrar > 0) { const k = Math.min(1, (1.6 - D.mostrar) * 6); pinta('dadogrande' + D.cara, W / 2, 120, false, false, 0.6 + k * 0.4); }
  // la esquina derecha: el efecto en marcha
  const x = W - 16, y = 46;
  if (D.efecto && D.quedan > 0) {
    pinta('dado' + D.efecto, x, y, false, false, 1.3);
    const F = CARAS[D.efecto];
    arcoPixel(x, y, 12, -1.57, -1.57 + 6.283 * Math.min(1, D.quedan / 3), 2, F.color);
  }
  // el botón del dado: abajo a la izquierda, enfrente del de la habilidad (donde llega el pulgar). Su aro dorado es el Impulso:
  // las plumas doradas lo llenan y, lleno, el dado se vuelve de oro (el próximo sale bendito)
  if (J.modo !== 'juego') return;
  if (puedeRetirar()) { pintaRetirar(); return; }
  const bx = 26, by = PAN.H - 60, puede = puedeTirar(), ki = D.bendito ? 1 : Math.min(1, J.impulso / plumasDado());
  const pulso = puede ? 1 + Math.sin(J.t * 6) * 0.05 : 1, col = D.bendito ? '#ffd34d' : D.maldito ? '#c9a0ff' : '#f6e7b8';
  disco(bx, by, 17, 17, '#120808'); disco(bx, by, 15.5, 15.5, D.bendito ? '#8a5a10' : puede ? '#3a2a1a' : '#24170f');
  if (puede) { G.globalAlpha = 0.3 + Math.sin(J.t * 6) * 0.15; disco(bx, by, Math.round(15 * pulso), Math.round(15 * pulso), col); G.globalAlpha = 1; }
  // el aro de plumas (gris de fondo, dorado lo que llevas)
  arcoPixel(bx, by, 19.5, 0, 6.283, 2, '#2a1a10');
  if (ki > 0) arcoPixel(bx, by, 19.5, -1.57, -1.57 + 6.283 * ki, 2, D.bendito && ((J.t * 6) | 0) % 2 ? '#fff2a8' : '#ffd34d');
  G.globalAlpha = puede ? 1 : J.fase === 'camino' ? 0.18 : 0.45;   // caminando, el dado casi se apaga y se lee la casilla de destino
  if (D.bendito) pintaDadoOro(bx, by + (puede ? Math.sin(J.t * 5) : 0), 0.62 * pulso);
  else if (SPR['s-dado']) pinta('s-dado', bx, by + (puede ? Math.sin(J.t * 5) : 0), false, false, 0.7 * pulso);
  else pintaGirado('dadogrande' + (1 + ((J.t * 0.8) | 0) % 6), bx, by, puede ? Math.sin(J.t * 2) * 0.15 : 0, 0.55 * pulso);
  G.globalAlpha = 1;
  if (D.bendito) texto2(tr('¡DADO BENDITO!'), bx + 2, by - 28, 7, '#ffd34d', 'left');
  else if (D.maldito) texto2(tr('DADO MALDITO'), bx + 2, by - 28, 7, '#c9a0ff', 'left');
  else if (puede) texto2(tr('TIRA EL DADO'), bx - 14, by - 28, 7, '#fff4dc', 'left');
  else if (J.fase === 'camino') { texto2(tr('Ve a la casilla {n}', { n: J.destino }), bx - 14, by - 28, 7, '#ffd34d', 'left'); texto2(String(J.destino), bx, by + 1, 13, '#ffd34d', 'center', FUENTE_G, 400, 0.3); }   // el dado se enciende al llegar
  if (puede) BOTONES.push({ x: bx - 24, y: by - 24, w: 48, h: 48, accion: () => tirarDado() });
}

// el dado de oro: el mismo dibujo teñido de dorado (se hace una vez y se guarda)
let DADO_ORO = null;
function pintaDadoOro(x, y, esc) {
  const S = SPR['s-dado'] || SPR.dadogrande6; if (!S) return;
  if (!DADO_ORO || DADO_ORO.de !== S.n) {
    const c = lienzo(S.n.width, S.n.height), o = c.getContext('2d');
    o.drawImage(S.n, 0, 0); o.globalCompositeOperation = 'source-atop'; o.globalAlpha = 0.55; o.fillStyle = '#ffc21a'; o.fillRect(0, 0, c.width, c.height);
    DADO_ORO = { c, de: S.n, w: S.w, h: S.h };
  }
  const w = DADO_ORO.w * esc, h = DADO_ORO.h * esc;
  G.drawImage(DADO_ORO.c, x - w / 2, y - h / 2, w, h);
}

// la Segunda tirada (tienda): nada más tirar, mientras no hayas cruzado ninguna barrera, puedes volver a tirar una vez por partida
const puedeRetirar = () => { const J = JUEGO; return (J.redado || 0) > 0 && J.fase === 'camino' && J.paso === J.casilla && J.tramoT < 5 && J.dado.rodando <= 0; };
function retira() {
  const J = JUEGO, D = J.dado; if (!puedeRetirar()) return;
  J.redado--; J.fase = 'parado'; J.destino = J.casilla; D.efecto = 0; D.quedan = 0; D.mostrar = 0;
  aviso(tr('¡OTRA VEZ!'), '#ffd34d', 1); tirarDado();
}
function pintaRetirar() {
  const J = JUEGO, bx = 26, by = PAN.H - 60, k = 1 - J.tramoT / 5;
  disco(bx, by, 17, 17, '#120808'); disco(bx, by, 15.5, 15.5, '#7a3a10');
  arcoPixel(bx, by, 19.5, -1.57, -1.57 + 6.283 * k, 2, '#ffd34d');
  if (SPR['ic-redado']) icono('redado', bx, by, 13); else pintaGirado('dadogrande' + (1 + ((J.t * 6) | 0) % 6), bx, by, Math.sin(J.t * 8) * 0.3, 0.5);
  texto2(tr('¿OTRA VEZ?'), bx - 14, by - 28, 7, '#ffd34d', 'left');
  BOTONES.push({ x: bx - 24, y: by - 24, w: 48, h: 48, accion: () => retira() });
}
