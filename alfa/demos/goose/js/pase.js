// Fans of Goose · EL CAMINO DE LA OCA, el pase de temporada (0.8.0). Una temporada por mes natural: cada partida da puntos (la casilla
// a la que llegas, más un extra si escapas) y cada CFG.pase.puntos se avanza una casilla del camino, hasta la 63. Cada casilla tiene un
// premio GRATIS y otro REAL; el Real se abre pagando el pase con huevos de oro (js/monetiza.js) y da lo de atrás también.
// Los premios se dan solos al llegar. El Real solo da aspecto, huevos y monedas: nada que haga más fuerte (el Tablero del día y la
// Escalera de Noches siguen siendo justos).
'use strict';

CFG.pase = { escalones: 63, puntos: 40, extraGanar: 30 };
// lo que da el Real en algunas casillas (capas y farolillos de js/aspecto.js; los «camino» solo salen aquí)
const PASE_ASPECTO = { 7: ['luz', 'azul'], 14: ['capa', 'rosa'], 21: ['luz', 'verde'], 28: ['capa', 'noche'], 35: ['luz', 'rosa'], 42: ['capa', 'fuego'], 49: ['luz', 'morada'], 56: ['luz', 'camino'], 63: ['capa', 'camino'] };

// la temporada de este mes (si cambia el mes, empieza una nueva)
const temporadaPase = () => new Date().toISOString().slice(0, 7);
function paseAlDia() {
  if (!SAVE.pase || SAVE.pase.t !== temporadaPase()) SAVE.pase = { t: temporadaPase(), puntos: 0, real: false, g: 0, r: 0 };
  return SAVE.pase;
}
const escalonPase = () => Math.min(CFG.pase.escalones, Math.floor(paseAlDia().puntos / CFG.pase.puntos));
function numeroTemporada() { const [a, m] = temporadaPase().split('-').map(Number); return (a - 2026) * 12 + m - 9; }   // octubre de 2026 = la 1
function diasQuedan() { const h = new Date(), fin = new Date(h.getFullYear(), h.getMonth() + 1, 1); return Math.max(1, Math.ceil((fin - h) / 864e5)); }

// el premio de cada casilla
function premioPase(k, real) {
  if (!real) {
    if (k === CFG.pase.escalones) return { tipo: 'monedas', n: 1500 };
    if (k % 9 === 0) return { tipo: 'huevos', n: 10 };
    return { tipo: 'monedas', n: 40 + k * 4 };
  }
  const a = PASE_ASPECTO[k]; if (a) return { tipo: a[0], id: a[1] };
  if (k % 3 === 0) return { tipo: 'huevos', n: 15 };
  return { tipo: 'monedas', n: 80 + k * 6 };
}
function dapremio(p) {
  if (p.tipo === 'monedas') SAVE.monedas += p.n;
  else if (p.tipo === 'huevos') SAVE.huevos = huevos() + p.n;
  else { const A = aspecto(), tuyos = p.tipo === 'capa' ? A.capas : A.luces; if (tuyos[p.id]) SAVE.huevos = huevos() + 30; else tuyos[p.id] = 1; }   // repetido: 30 huevos
}
// da lo que toca hasta la casilla de ahora (lo gratis siempre; lo Real si está abierto). Devuelve cuántos premios ha dado
function cobraPase() {
  const P = paseAlDia(), e = escalonPase(); let n = 0;
  for (let k = P.g + 1; k <= e; k++) { dapremio(premioPase(k, false)); n++; }
  P.g = Math.max(P.g, e);
  if (P.real) { for (let k = P.r + 1; k <= e; k++) { dapremio(premioPase(k, true)); n++; } P.r = Math.max(P.r, e); }
  return n;
}
// al acabar una partida (js/partida.js): suma los puntos y da los premios
function paseFinPartida(gana) {
  const J = JUEGO, antes = escalonPase(), pts = Math.max(0, J.mejorCasilla) + (gana ? CFG.pase.extraGanar : 0);
  paseAlDia().puntos += pts;
  const premios = cobraPase();
  return { pts, e: escalonPase(), sube: escalonPase() - antes, premios };
}
function textoPaseFin(F) {
  return F.sube > 0 ? tr('Camino de la Oca: +{p} puntos, casilla {e} y {n} premios', { p: F.pts, e: F.e, n: F.premios }) : tr('Camino de la Oca: +{p} puntos', { p: F.pts });
}
function compraPaseReal() {
  const P = paseAlDia(); if (P.real) return;
  if (!gastaHuevos(CFG.dinero.paseReal)) return;
  P.real = true; cobraPase(); guarda();
  SONIDO.evolucion(); destella('#ffd34d', 0.4); toast(tr('¡Pase Real abierto!'), true);
}

// --- la pantalla ---
let PASE_PAG = -1;   // -1: abre por la casilla en la que vas
function abrePase() { PASE_PAG = -1; JUEGO.modo = 'pase'; }
function pintaPremioPase(p, x, y, w, h, real, hecho, abierto) {
  caja(x, y, w, h, 5, real ? (abierto ? '#4a3410' : '#2a2010') : '#3b2014', hecho ? '#7dff6b' : real ? '#a9842a' : '#6e4426', hecho ? 1.6 : 1.1);
  if (!hecho && real && !abierto) G.globalAlpha = 0.55;
  const cx = x + w / 2, cy = y + h / 2;
  if (p.tipo === 'monedas') { pinta('moneda', cx - 12, cy, false, false, 0.9); texto2(String(p.n), cx - 5, cy + 0.5, 7.5, '#ffcf33', 'left'); }
  else if (p.tipo === 'huevos') { icono('huevooro', cx - 11, cy, 9); texto2(String(p.n), cx - 4, cy + 0.5, 7.5, '#ffe27a', 'left'); }
  else {
    const capa = p.tipo === 'capa', o = capa ? capaDe(p.id) : luzDe(p.id);
    pintaHeroeMuestra(x + 10, cy + 1, capa ? p.id : '', capa ? '' : p.id, 0.5);
    parrafo(tr(o ? o.nombre : ''), x + 18, y + 6, w - 20, 5.5, '#fff4dc');
  }
  G.globalAlpha = 1;
}
function pintaPase() {
  const W = PAN.W, H = PAN.H, P = paseAlDia(), e = escalonPase(), C = CFG.pase;
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.5);
  texto2(tr('CAMINO DE LA OCA'), W / 2, 24, 15, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  texto2((diasQuedan() > 1 ? tr('Temporada {n} · quedan {d} días', { n: numeroTemporada(), d: diasQuedan() }) : tr('Temporada {n} · último día', { n: numeroTemporada() })), W / 2, 38, 7, '#f1e6c8');
  // la barra hasta la siguiente casilla
  const resto = P.puntos % C.puntos;
  barra(14, 46, W - 28, 7, e >= C.escalones ? 1 : resto / C.puntos, '#ffd34d');
  texto2(e >= C.escalones ? tr('¡Camino completo!') : tr('Casilla {e} de 63 · {a}/{b} puntos', { e, a: resto, b: C.puntos }), W / 2, 60, 6.5, '#c9b98a');
  // las columnas
  const xg = 40, wc = (W - xg - 14) / 2, alto = 24, y0 = 80;
  texto2(tr('Gratis'), xg + wc / 2, y0 - 8, 7, '#c9b98a');
  texto2(tr('Real'), xg + wc + 4 + wc / 2, y0 - 8, 7, '#ffd34d');
  const caben = Math.max(3, Math.floor((H - y0 - (P.real ? 78 : 112)) / (alto + 3))), pags = Math.ceil(C.escalones / caben);
  if (PASE_PAG < 0) PASE_PAG = Math.floor(Math.max(0, Math.min(C.escalones - 1, e)) / caben);
  PASE_PAG = Math.max(0, Math.min(pags - 1, PASE_PAG));
  for (let i = 0; i < caben; i++) {
    const k = PASE_PAG * caben + i + 1; if (k > C.escalones) break;
    const y = y0 + i * (alto + 3), hecho = k <= e;
    caja(10, y, 26, alto, 5, hecho ? '#c98a4a' : '#5a3418', '#120808', 1.2);
    texto2(String(k), 23, y + alto / 2 + 0.5, 9, hecho ? '#3a1c06' : '#c9b98a');
    pintaPremioPase(premioPase(k, false), xg, y, wc, alto, false, hecho, true);
    pintaPremioPase(premioPase(k, true), xg + wc + 4, y, wc, alto, true, hecho && P.real, P.real);
  }
  let yb = H - 40;
  if (pags > 1) {
    yb -= 28;
    boton(10, yb, (W - 30) / 2, 22, '<', PASE_PAG > 0 ? '#e8742a' : '#7a3a22', () => { PASE_PAG--; }, 10);
    boton(20 + (W - 30) / 2, yb, (W - 30) / 2, 22, '>', PASE_PAG < pags - 1 ? '#e8742a' : '#7a3a22', () => { PASE_PAG++; }, 10);
  }
  if (!P.real) {
    yb -= 36;
    boton(20, yb, W - 40, 30, '', '#d99a1a', compraPaseReal, 10);
    icono('pase', 36, yb + 15, 11);
    texto2(tr('PASE REAL'), W / 2 - 4, yb + 10, 10, '#fff8e8', 'center');
    pintaHuevos(W / 2 - 4, yb + 22, CFG.dinero.paseReal, 7.5, 'center');
  }
  boton(30, H - 40, W - 60, 26, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 10);
}
