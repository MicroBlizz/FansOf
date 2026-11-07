// Fans of Panic · Marcador del nivel: arriba, la pausa, el tiempo y el porcentaje destapado (que late al acercarse al objetivo);
// abajo, las vidas del nivel, el combo, los puntos y los consejos del primer nivel. También la cuenta atrás de salida.
'use strict';

function pintaMarcador(W, H, dt) {
  const J = JUEGO, M = MUNDOS[J.mundo];
  // arriba
  G.fillStyle = M.fondo; G.fillRect(0, 0, W, TAB.y0);
  botonUI('II', 8, 12, 40, 40, abreOpciones, COL.panel, COL.blanco, 18);
  const txt = Math.ceil(J.tiempo), urge = J.tiempo < 10;
  letra(String(txt), W / 2, 22, urge ? 30 + Math.sin(J.t * 20) * 3 : 26, urge ? '#ff6b6b' : COL.blanco);
  letra(`${tr(M.nombre)} ${J.n}`, W - 10, 14, 12, M.claro, 'right');
  letra(String(J.puntos), W - 10, 34, 16, COL.oro, 'right');
  // la barra del porcentaje
  const bx = 58, bw = W - 116, by = 48, lat = J.pct >= 0.7 ? Math.sin(J.t * 10) * 1 : 0;
  caja(bx, by - lat, bw, 12 + lat * 2, 6, COL.tinta, null);
  caja(bx + 1, by + 1 - lat, (bw - 2) * Math.min(1, J.pct), 10 + lat * 2, 5, J.pct >= AJUSTES.objetivo ? COL.oro : M.claro, null);
  const ox = bx + bw * AJUSTES.objetivo; G.fillStyle = COL.blanco; G.fillRect(ox - 1, by - 3, 2, 18);
  letra(`${Math.floor(J.pct * 100)} %`, bx + bw / 2, by + 6, 11, COL.blanco, 'center', COL.tinta, 2.5);
  // abajo
  const y0 = TAB.y0 + TAB.h;
  G.fillStyle = M.fondo; G.fillRect(0, y0, W, H - y0);
  for (let i = 0; i < 3; i++) corazon(22 + i * 24, y0 + 22, 8, i < J.vidasNivel);
  if (J.combo > 1) letra(tr('COMBO x{n}', { n: J.combo }), W / 2, y0 + 22, 18, COL.oro);
  if (J.rapidoT > 0) letra(tr('TIJERA {n}', { n: Math.ceil(J.rapidoT) }), W - 12, y0 + 22, 12, COL.oro, 'right');
  else if (J.escudo) letra(tr('ESCUDO'), W - 12, y0 + 22, 12, COL.verde, 'right');
  if (!SAVE.tutorial) pintaConsejo(W, y0 + 48);
  else letra(tr('Destapa el {n} % para ganar', { n: Math.round(AJUSTES.objetivo * 100) }), W / 2, y0 + 50, 12, M.claro);
  if (J.tInicio > 0) pintaSalida(W, H);
}

// los consejos del primer nivel, uno tras otro
function pintaConsejo(W, y) {
  const J = JUEGO, t = J.t;
  const c = !CUR.dir && J.cortes === 0 ? tr('Desliza el dedo para mover el cúter') : J.cortes === 0 ? tr('Entra en el panel y vuelve al borde para recortarlo') : J.cortes < 3 ? tr('No toques al Inspector ni a los becarios mientras cortas') : tr('Si te paras a medio corte, arde la mecha');
  parrafo(c, W / 2, y, W - 30, 13, COL.blanco);
  if (J.cortes === 0 && t % 2 < 1) { const x = W / 2 + Math.sin(t * 6) * 30; circulo(x, TAB.y0 + TAB.h - 40, 10, 'rgba(255,255,255,.35)', COL.blanco, 2); }
}

function pintaSalida(W, H) {
  const J = JUEGO, M = MUNDOS[J.mundo];
  G.fillStyle = 'rgba(0,0,0,.45)'; G.fillRect(0, TAB.y0, W, TAB.h);
  const cy = TAB.y0 + TAB.h / 2;
  letra(tr(M.nombre), W / 2, cy - 40, 30, M.claro);
  letra(tr('NIVEL {n}', { n: J.n }), W / 2, cy - 8, 22, COL.blanco);
  if (J.nivel.final) letra(tr('¡Jefe final!'), W / 2, cy + 20, 16, COL.rosa);
  letra(J.tInicio > 0.9 ? '3' : J.tInicio > 0.6 ? '2' : J.tInicio > 0.3 ? '1' : tr('¡YA!'), W / 2, cy + 60, 40, COL.oro);
}
