// Fans of Goose · El marcador: todo arriba (vida, experiencia, Impulso, casilla, monedas, combo y el dado), el mapa de las 63
// casillas en el borde derecho, los avisos grandes del centro y el jefe. La parte de abajo queda libre para jugar.
'use strict';

const BOTONES = [];   // los botones de la pantalla actual: { x, y, w, h, accion } (se rehacen en cada fotograma)
const FUENTE_G = '"Pirata One", "Pixelify Sans", serif';
const FUENTE = '"Pixelify Sans", system-ui, sans-serif';

function texto2(t, x, y, tam, color, alinea = 'center', fuente = FUENTE, peso = 800, borde = 0.3) {
  G.font = `${peso} ${tam}px ${fuente}`; G.textAlign = alinea; G.textBaseline = 'middle'; G.lineJoin = 'round';
  if (borde) { G.lineWidth = tam * borde; G.strokeStyle = '#120808'; G.strokeText(t, x, y); }
  G.fillStyle = color; G.fillText(t, x, y);
}
function caja(x, y, w, h, r, relleno, borde = '#120808', grosor = 1.5) {
  G.beginPath(); G.roundRect(x, y, w, h, r); G.fillStyle = relleno; G.fill();
  if (borde) { G.lineWidth = grosor; G.strokeStyle = borde; G.stroke(); }
}
function barra(x, y, w, h, k, color, fondo = '#2a1414') {
  caja(x, y, w, h, h / 2, fondo, '#120808', 1.2);
  if (k > 0) { G.beginPath(); G.roundRect(x + 1, y + 1, Math.max(h - 2, (w - 2) * Math.min(1, k)), h - 2, (h - 2) / 2); G.fillStyle = color; G.fill(); }
}
function boton(x, y, w, h, txt, color, accion, tam = 10, sub) {
  const pulsado = ENTRADA.botonDown && ENTRADA.bx > x && ENTRADA.bx < x + w && ENTRADA.by > y && ENTRADA.by < y + h;
  const dy = pulsado ? 1.5 : 0;
  caja(x, y + 2.5, w, h, 6, '#120808', null);
  caja(x, y + dy, w, h, 6, color, '#120808', 1.8);
  G.globalAlpha = 0.25; caja(x + 3, y + dy + 2, w - 6, h * 0.35, 4, '#ffffff', null); G.globalAlpha = 1;
  texto2(txt, x + w / 2, y + dy + h / 2 + (sub ? -3 : 0.5), tam, '#fff8e8', 'center', FUENTE, 800, 0.32);
  if (sub) texto2(sub, x + w / 2, y + dy + h / 2 + 6, 6.5, '#fff1c2', 'center', FUENTE, 700, 0.3);
  BOTONES.push({ x, y, w, h, accion });
}

function pintaHud() {
  const J = JUEGO, W = PAN.W;
  // franja de arriba
  G.globalAlpha = 0.55; G.fillStyle = '#0a0608'; G.fillRect(0, 0, W, 34); G.globalAlpha = 1;
  // pausa
  caja(4, 4, 17, 17, 5, '#e8742a'); G.fillStyle = '#fff8e8'; G.fillRect(9.5, 8.5, 2.2, 8); G.fillRect(13.5, 8.5, 2.2, 8);
  BOTONES.push({ x: 0, y: 0, w: 26, h: 26, accion: () => pausa() });
  // vida
  const kv = J.vida / J.st.vidaMax;
  barra(25, 5, 96, 8, kv, kv < 0.3 ? '#ff3b3b' : '#e0303a');
  texto2(Math.ceil(J.vida) + ' / ' + Math.round(J.st.vidaMax), 73, 9.4, 5.5, '#fff', 'center', FUENTE, 800, 0.35);
  // monedas
  pinta('moneda', W - 9, 9, false, false, 1); texto2(String(J.monedasPartida), W - 15, 9.5, 7, '#ffcf33', 'right');
  // tiempo
  const s = Math.floor(J.t); texto2(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'), W - 46, 9.5, 6.5, '#f1e6c8', 'center', FUENTE, 700);
  // experiencia
  barra(25, 16, W - 64, 5, J.xp / J.xpNecesita, '#6bd4ff');
  texto2(tr('NV {n}', { n: J.nivel }), W - 36, 18.6, 6, '#6bd4ff', 'left');
  // impulso
  const ki = J.impulso / CFG.impulso.lleno, listo = ki >= 1;
  barra(25, 24, W - 64, 6, ki, listo ? (((J.t * 6) | 0) % 2 ? '#fff2a8' : '#ffd34d') : '#d9a520');
  texto2(listo ? tr('¡DOS TOQUES!') : tr('IMPULSO'), 25 + (W - 64) / 2, 27.3, 5, listo ? '#3a1d00' : '#fff1c2', 'center', FUENTE, 800, listo ? 0 : 0.3);
  if (listo) BOTONES.push({ x: 20, y: 21, w: W - 54, h: 12, accion: () => usaImpulso() });
  // casilla o jefe
  if (J.jefe) {
    texto2(tr('LA OCA MADRE'), W / 2, 42, 11, '#ff4d6b', 'center', FUENTE_G, 400, 0.25);
    barra(24, 49, W - 48, 6, J.jefe.hp / J.jefe.hpMax, '#ff2d4d');
  } else {
    texto2(tr('CASILLA'), W / 2, 39, 6, '#c9b98a', 'center', FUENTE, 700);
    texto2(J.casilla + ' / ' + CFG.jardin, W / 2, 48, 12, '#f6e7b8', 'center', FUENTE_G, 400, 0.25);
  }
  // combo
  if (J.combo >= 5) {
    const k = J.comboT / 2.2, pop = 1 + Math.max(0, (J.comboT - 2) * 2);
    texto2('x' + J.combo, 8, 44, 11 * pop, J.combo >= 100 ? '#ff4d6b' : J.combo >= 50 ? '#ffb04d' : '#ffd34d', 'left', FUENTE_G, 400, 0.25);
    texto2(tr('COMBO'), 9, 53, 5.5, '#c9b98a', 'left', FUENTE, 700);
    G.fillStyle = '#ffd34d'; G.fillRect(8, 57, 28 * k, 1.5);
  }
  pintaDado();
  pintaMapa();
  if (J.modo === 'juego') pintaAvisos();
}

// el mapa: la columna de las 63 casillas, con las especiales, tú y el derrumbe
function pintaMapa() {
  const J = JUEGO, x = PAN.W - 4, y0 = PAN.H - 50, y1 = 70, h = y0 - y1, N = CFG.jardin;
  const yDe = t => y0 - (t - 1) / (N - 1) * h;
  G.fillStyle = 'rgba(0,0,0,.5)'; G.fillRect(x - 2, y1 - 2, 4, h + 4);
  const caida = Math.max(0, Math.min(N, -J.yD / TH));
  G.fillStyle = '#ff5a2a'; G.fillRect(x - 1.5, yDe(caida + 1), 3, y0 - yDe(caida + 1) + 1);
  for (const t in CFG.ocaSalta) { G.fillStyle = '#ffd34d'; G.fillRect(x - 2, yDe(+t) - 1, 4, 2); }
  G.fillStyle = '#7dff6b'; G.fillRect(x - 2, yDe(CFG.pozo) - 1, 4, 2);
  G.fillStyle = '#ffb86b'; G.fillRect(x - 2, yDe(CFG.posada) - 1, 4, 2);
  G.fillStyle = '#ff2d2d'; G.fillRect(x - 2, yDe(CFG.muerte) - 1, 4, 2);
  G.fillStyle = '#3c7030'; G.fillRect(x - 2.5, y1 - 3, 5, 4);
  const yy = yDe(Math.min(N, -J.yo.y / TH + 1));
  G.fillStyle = '#fff'; G.beginPath(); G.arc(x, yy, 2.6, 0, 6.283); G.fill(); G.strokeStyle = '#8a1e22'; G.lineWidth = 1; G.stroke();
}

function pintaAvisos() {
  const J = JUEGO, a = J.avisos[0]; if (!a) return;
  const k = a.t / a.dur, entra = Math.min(1, a.t * 7), sale = k > 0.82 ? (1 - k) / 0.18 : 1;
  const esc = entra < 1 ? 0.4 + entra * 0.9 : 1.3 - Math.min(0.3, (a.t - 1 / 7) * 1.5) * 1;
  G.globalAlpha = Math.max(0, sale);
  const y = PAN.H * 0.43, tam = Math.min(20, 300 / Math.max(8, a.txt.length)) * esc;
  texto2(a.txt, PAN.W / 2, y, tam, a.color, 'center', FUENTE_G, 400, 0.22);
  if (J.aviso2) texto2(J.aviso2, PAN.W / 2, y + 16, 7, '#f6e7b8', 'center', FUENTE, 700);
  G.globalAlpha = 1;
}

// el joystick flotante (aparece donde apoyas el dedo)
function pintaPalanca() {
  const E = ENTRADA; if (!E.palanca) return;
  G.globalAlpha = 0.28; G.fillStyle = '#f6e7b8'; G.beginPath(); G.arc(E.px, E.py, 22, 0, 6.283); G.fill();
  G.globalAlpha = 0.6; G.strokeStyle = '#f6e7b8'; G.lineWidth = 1.5; G.stroke();
  G.globalAlpha = 0.8; G.fillStyle = '#e8742a'; G.beginPath(); G.arc(E.px + E.mx * 22, E.py + E.my * 22, 9, 0, 6.283); G.fill();
  G.globalAlpha = 1;
}
