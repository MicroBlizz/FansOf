// Fans of Snakes · El VS en pantalla: el tablero pequeño del rival (oculto hasta que tocas RIVAL en la franja de arriba), su
// nombre y su barra de Frenesí, y los ataques volando entre tu serpiente y el rival (o su botón, si está oculto).
'use strict';

// dónde está el tablero del rival: oculto, es el botón RIVAL de la franja (de ahí salen y ahí llegan los ataques); a la vista,
// flota en una esquina del tablero (la de arriba a la derecha) y, si tu serpiente se acerca, se aparta a la esquina más lejana;
// cuando ya no molesta, vuelve a su sitio
const CASILLA_RIVAL = 3.6, ESQUINA_RIVAL = 1;   // 0 arriba-izquierda, 1 arriba-derecha, 2 abajo-izquierda, 3 abajo-derecha
function tamPanel() { return { w: RC * CASILLA_RIVAL + 6, h: RR * CASILLA_RIVAL + 16 }; }
function esquinaPanel(e) {
  const { w, h } = tamPanel(), m = 4;
  return { x: e % 2 ? TAB.x0 + TAB.w - w - m : TAB.x0 + m, y: e < 2 ? TAB.y0 + m : TAB.y0 + TAB.h - h - m, w, h };
}
function panelVS() {
  if (!VS.ver) { const r = rectRival(); return { x: r.x, y: r.y, w: r.w, h: r.h, oculto: true }; }
  if (!VS.pos) VS.pos = esquinaPanel(ESQUINA_RIVAL);
  return { ...VS.pos, ...tamPanel() };
}
const cercaDe = (r, x, y, m) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.h + m;
function muevePanel(dt) {
  if (VS.esquina === undefined) VS.esquina = ESQUINA_RIVAL;
  const h = JUEGO.serp[0], hx = cx(h[0]), hy = cy(h[1]), c = TAB.c;
  if (cercaDe(esquinaPanel(VS.esquina), hx, hy, c * 1.5)) {   // se acerca: a la esquina más lejana de la cabeza
    let mejor = VS.esquina, dmax = -1;
    for (let e = 0; e < 4; e++) { const r = esquinaPanel(e), d = Math.hypot(r.x + r.w / 2 - hx, r.y + r.h / 2 - hy); if (d > dmax) { dmax = d; mejor = e; } }
    VS.esquina = mejor; VS.aparte = 0;
  } else if (VS.esquina !== ESQUINA_RIVAL) {   // vuelve a su sitio cuando ya no molesta
    VS.aparte = (VS.aparte || 0) + dt;
    if (VS.aparte > 2 && !cercaDe(esquinaPanel(ESQUINA_RIVAL), hx, hy, c * 3)) VS.esquina = ESQUINA_RIVAL;
  }
  const t = esquinaPanel(VS.esquina), k = Math.min(1, dt * 8);
  if (!VS.pos) VS.pos = { x: t.x, y: t.y };
  VS.pos.x += (t.x - VS.pos.x) * k; VS.pos.y += (t.y - VS.pos.y) * k;
}

function pintaVS(dt) {
  const R = VS.rival; if (!R || PARTIDA.tipo !== 'vs') return;
  if (VS.ver) muevePanel(dt);
  if (VS.ver) pintaPanelRival(R);
  pintaProyectiles();
}

function pintaPanelRival(R) {
  const P = panelVS(), c = CASILLA_RIVAL, gx = P.x + 3, gy = P.y + 13, t = JUEGO.t;
  G.save(); G.globalAlpha = 0.9;
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
}

// los ataques en el aire
function pintaProyectiles() {
  for (const p of VS.proy) {
    const k = p.t / p.dur, e = k * k * (3 - 2 * k), x = p.x + (p.tx - p.x) * e, y = p.y + (p.ty - p.y) * e - Math.sin(k * Math.PI) * 30;
    for (let i = 1; i <= 4; i++) { G.globalAlpha = 0.15 * (5 - i); circulo(x - (p.tx - p.x) * 0.04 * i, y + 3 * i, 4 - i * 0.6, p.col, null); }
    G.globalAlpha = 1; circulo(x, y, 4.5, p.col, '#06110a', 1.2);
    letra(p.txt, x, y - 9, 6.5, p.col, 'center', '#06110a', 2);
  }
}
