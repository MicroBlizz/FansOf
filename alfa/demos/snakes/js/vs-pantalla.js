// Fans of Snakes · El VS en pantalla: el tablero pequeño del rival (abajo a la derecha si hay sitio; si no, en la esquina de arriba
// del tablero, medio transparente), su nombre, sus puntos y su barra de Frenesí, y los ataques volando de un tablero al otro.
'use strict';

// dónde va el tablero del rival
function panelVS() {
  const hueco = PAN.H - (TAB.y0 + TAB.h) - 12;
  let c = Math.min(5, (hueco - 12) / RR), dentroTab = false;
  if (c < 3.2) { c = 3.4; dentroTab = true; }
  const w = RC * c + 6, h = RR * c + 16;
  const x = TAB.x0 + TAB.w - w - (dentroTab ? 4 : 0), y = dentroTab ? TAB.y0 + 4 : TAB.y0 + TAB.h + 8;
  return { x, y, w, h, c, dentroTab };
}

function pintaVS() {
  const R = VS.rival; if (!R || PARTIDA.tipo !== 'vs') return;
  const P = panelVS(), c = P.c, gx = P.x + 3, gy = P.y + 13, t = JUEGO.t;
  G.save(); if (P.dentroTab) G.globalAlpha = 0.88;
  const sacude = R.choque > 0 ? (Math.random() - 0.5) * 3 : 0;
  G.translate(sacude, 0);
  caja(P.x, P.y, P.w, P.h, 5, '#1a0f2a', R.vivo === true ? '#ff3d71' : '#5a4a6a', 1.5);
  letra(String(R.nombre).slice(0, 14), P.x + 3, P.y + 5, 5, '#ffb3c6', 'left', null, 0, 700);
  // su barra de Frenesí: cuando se llena, te ataca
  caja(P.x + 3, P.y + 8, P.w - 6, 3, 1.5, '#06110a', null); G.fillStyle = R.frenesi > 0.8 && Math.sin(t * 12) > 0 ? '#ffd54a' : '#ff3d71'; G.fillRect(P.x + 3.5, P.y + 8.5, (P.w - 7) * R.frenesi, 2);
  G.fillStyle = '#0b0614'; G.fillRect(gx, gy, RC * c, RR * c);
  for (const k of R.muros) { const [mc, mr] = k.split(',').map(Number); G.fillStyle = '#8a7aa0'; G.fillRect(gx + mc * c + 0.3, gy + mr * c + 0.3, c - 0.6, c - 0.6); }
  if (R.manzana) circulo(gx + (R.manzana[0] + 0.5) * c, gy + (R.manzana[1] + 0.5) * c, c * 0.38, '#ff4d4d', null);
  R.serp.forEach((s, i) => { G.fillStyle = i === 0 ? '#ffb3c6' : R.vivo === true ? '#ff3d71' : '#6a5a7a'; G.fillRect(gx + s[0] * c + 0.4, gy + s[1] * c + 0.4, c - 0.8, c - 0.8); });
  if (R.vivo !== true) letra(tr('¡FUERA!'), P.x + P.w / 2, P.y + P.h / 2, 8, '#ffd54a', 'center', '#06110a', 2);
  G.restore();
  // los ataques en el aire
  for (const p of VS.proy) {
    const k = p.t / p.dur, e = k * k * (3 - 2 * k), x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e - Math.sin(k * Math.PI) * 30;
    for (let i = 1; i <= 4; i++) { G.globalAlpha = 0.15 * (5 - i); circulo(x - (p.tx - p.x) * 0.04 * i, y + 3 * i, 4 - i * 0.6, p.col, null); }
    G.globalAlpha = 1; circulo(x, y, 4.5, p.col, '#06110a', 1.2);
    letra(p.txt, x, y - 9, 6.5, p.col, 'center', '#06110a', 2);
  }
}
