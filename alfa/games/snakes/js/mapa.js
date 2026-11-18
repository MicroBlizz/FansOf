// Fans of Snakes · Mapa de los Mundos: cada mundo con sus 5 fases en un caminito; cada fase, un círculo con su número (la del
// jefe, más grande), sus estrellas y un candado si aún no está abierta. Al tocar una abierta sale su ficha (objetivo, estrellas
// y premio) con el botón de jugar.
'use strict';

const MAPA = { elegida: null };   // [mundo, fase] de la ficha abierta

function pintaMapa(W, H) {
  const y0 = TAB.y0, t = JUEGO.t;
  G.fillStyle = 'rgba(6,17,10,0.86)'; G.fillRect(0, 0, W, H);
  letra(tr('MUNDOS'), W / 2, y0 + 10, 15, '#9cff6b', 'center', '#06110a', 3);
  const alto = Math.min(98, (H - y0 - 64) / MUNDOS.length);
  MUNDOS.forEach((M, m) => {
    const yb = y0 + 24 + m * alto, abierto = faseAbierta(m, 0);
    caja(8, yb, W - 16, alto - 6, 8, abierto ? M.tema.fondo : '#0c1210', abierto ? M.color : '#2a3a30', 1.5);
    letra(tr(M.nombre), 16, yb + 10, 8, abierto ? M.color : '#5a6a60', 'left', '#06110a', 2);
    const est = M.fases.reduce((a, _, f) => a + estrellasDe(m, f), 0);
    estrella(W - 40, yb + 10, 3.5); letra(est + '/' + M.fases.length * 3, W - 16, yb + 10.5, 7, '#ffd54a', 'right', null, 0);
    // el caminito y las fases
    const xs = f => 26 + f * ((W - 52) / (M.fases.length - 1)), ys = f => yb + alto / 2 + 4 + (f % 2 ? 8 : -6);
    G.strokeStyle = abierto ? M.color : '#2a3a30'; G.globalAlpha = 0.4; G.lineWidth = 2; G.setLineDash([2, 3]);
    G.beginPath(); M.fases.forEach((_, f) => G.lineTo(xs(f), ys(f))); G.stroke(); G.setLineDash([]); G.globalAlpha = 1;
    M.fases.forEach((F, f) => {
      const x = xs(f), y = ys(f), r = F.jefe ? 12 : 9.5, ok = faseAbierta(m, f), e = estrellasDe(m, f);
      const late = ok && !e ? 1 + Math.sin(t * 5) * 0.06 : 1;   // la siguiente por jugar, latiendo
      circulo(x, y + 2, r * late, '#06110a', null);
      circulo(x, y, r * late, ok ? (e ? M.color : '#ffd54a') : '#26332c', '#06110a', 1.6);
      if (ok) letra(F.jefe ? tr('JEFE') : String(f + 1), x, y + 0.5, F.jefe ? 6.5 : 9, '#06110a', 'center', null, 0);
      else candado(x, y);
      for (let s = 0; s < 3; s++) if (ok) estrella(x - 7 + s * 7, y + r + 5, 2.6, s < e);
      if (ok) zonaUI(x - r - 3, y - r - 3, 2 * r + 6, 2 * r + 12, () => { MAPA.elegida = [m, f]; });
    });
  });
  const atras = () => { if (MAPA.elegida) MAPA.elegida = null; else alMenu('menu'); };
  if (!MAPA.elegida) botonUI(tr('VOLVER'), W / 2 - 40, H - 32, 80, 20, atras, '#9cff6b');
  UI.atras = atras;
  UI.enter = () => { const sig = siguienteFase(); if (sig) MAPA.elegida = sig; };
  if (MAPA.elegida) pintaFicha(W, H);
}

function candado(x, y) {
  caja(x - 4, y - 1, 8, 6, 1.5, '#5a6a60', '#06110a', 1);
  G.strokeStyle = '#5a6a60'; G.lineWidth = 1.6; G.beginPath(); G.arc(x, y - 1.5, 2.6, Math.PI, 0); G.stroke();
}

// la primera fase abierta sin estrellas (la que toca jugar)
function siguienteFase() {
  for (let m = 0; m < MUNDOS.length; m++) for (let f = 0; f < MUNDOS[m].fases.length; f++) if (faseAbierta(m, f) && !estrellasDe(m, f)) return [m, f];
  return null;
}

// la ficha de una fase: su objetivo, las estrellas por tiempo y el premio
function pintaFicha(W, H) {
  const [m, f] = MAPA.elegida, M = MUNDOS[m], F = M.fases[f], e = estrellasDe(m, f);
  G.fillStyle = 'rgba(6,17,10,0.7)'; G.fillRect(0, 0, W, H);
  zonaUI(0, 0, W, H, () => { MAPA.elegida = null; });   // tocar fuera la cierra
  const w = W - 30, h = 170, x = 15, y = H / 2 - h / 2;
  caja(x, y + 3, w, h, 10, '#06110a', null);
  caja(x, y, w, h, 10, M.tema.fondo, M.color, 2);
  zonaUI(x, y, w, h, () => {});   // tocar dentro no la cierra
  letra(tr(M.nombre), W / 2, y + 14, 7.5, M.color, 'center', '#06110a', 2);
  letra(F.jefe ? tr('FASE {n} · JEFE', { n: f + 1 }) : tr('FASE {n}', { n: f + 1 }), W / 2, y + 30, 13, '#fff', 'center', '#06110a', 3);
  letra(tr('Objetivo'), W / 2, y + 50, 7, '#9fb3a6', 'center', null, 0, 700);
  letra(textoObjetivo(F), W / 2, y + 62, 9, '#ffd54a', 'center', '#06110a', 2.5);
  [[1, tr('Supérala')], [2, tr('En menos de {n} s', { n: F.t2 })], [3, tr('En menos de {n} s', { n: F.t3 })]].forEach(([n, txt], i) => {
    const yy = y + 80 + i * 12;
    for (let s = 0; s < 3; s++) estrella(x + 22 + s * 7, yy, 2.8, s < n);
    letra(txt, x + 50, yy + 0.5, 7, e >= n ? '#ffd54a' : '#cfe', 'left', null, 0, 700);
  });
  letra(e ? tr('Premio ya cobrado') : tr('Premio: {n} monedas', { n: F.premio }), W / 2, y + 124, 7, e ? '#5a7a66' : '#ffd54a', 'center', null, 0, 700);
  const jugar = () => { MAPA.elegida = null; empieza('mundo', m, f); };
  botonUI(e ? tr('REPETIR') : tr('JUGAR'), W / 2 - 50, y + 136, 100, 22, jugar, M.color, '#06110a', 10);
  UI.enter = jugar;
}
