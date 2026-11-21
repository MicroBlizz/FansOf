// Fans of Panic · Marcador del nivel: una franja fina arriba (corazones a la izquierda, pausa a la derecha y por el centro el tiempo,
// el mundo y los puntos) y, flotando sobre el panel, la barra del porcentaje (que late al acercarse al objetivo), el combo, los
// poderes activos y los consejos del primer nivel.
// También la cuenta atrás de salida. El panel ocupa casi toda la pantalla: nada se pinta debajo de él.
'use strict';

function pintaMarcador(W, H, dt) {
  const J = JUEGO, M = MUNDOS[J.mundo];
  G.fillStyle = M.fondo; G.fillRect(0, 0, W, TAB.y0);
  for (let i = 0; i < 3; i++) corazon(16 + i * 20, 20, 7, i < J.vidasNivel);          // corazones arriba a la izquierda
  botonUI('II', W - 36, 5, 30, 30, abreOpciones, COL.panel, COL.blanco, 14);       // pausa arriba a la derecha
  const urge = J.tiempo < 10;                                                        // y el resto, por el centro
  numero(Math.ceil(J.tiempo), W / 2, 20, urge ? 26 + Math.sin(J.t * 20) * 3 : 24, urge ? '#ff6b6b' : COL.blanco);
  letra(`${tr(M.nombre)} ${J.n}`, W / 2 - 36, 20, 11, M.claro, 'right');
  numero(J.puntos, W / 2 + 36, 20, 14, COL.oro, 'left');
  pintaBarraPct(W, M);
  pintaFlotante(W, H, M);
  if (J.tInicio > 0) pintaSalida(W, H);
}

// la barra del porcentaje, flotando justo bajo la franja de arriba
function pintaBarraPct(W, M) {
  const J = JUEGO, bx = 70, bw = W - 140, by = TAB.y0 + 6, lat = J.pct >= 0.7 ? Math.sin(J.t * 10) : 0;
  barra(bx, by - lat, bw, 11 + lat * 2, J.pct, J.pct >= AJUSTES.objetivo ? COL.oro : M.claro);
  const ox = bx + bw * AJUSTES.objetivo; G.fillStyle = COL.blanco; G.fillRect(ox - 1, by - 3, 2, 17);
  letra(`${Math.floor(J.pct * 100)} %`, bx + bw / 2, by + 6, 10, COL.blanco, 'center', COL.tinta, 2.5);
}

// abajo del panel, flotando: combo, poderes y consejos
function pintaFlotante(W, H, M) {
  const J = JUEGO, y = H - 22;
  if (J.combo > 1) letra(tr('COMBO x{n}', { n: J.combo }), W / 2, y - 2, 18, COL.oro);
  const activos = poderesActivos();
  if (activos.length) letra(activos.join(' · '), W - 10, y, 11, COL.oro, 'right');
  if (!SAVE.tutorial) pintaConsejo(W, y - 34);
}

// los poderes y locuras con tiempo, para el marcador
function poderesActivos() {
  const J = JUEGO, l = [];
  if (J.rapidoT > 0) l.push(tr('TIJERA {n}', { n: Math.ceil(J.rapidoT) }));
  if (J.fantasmaT > 0) l.push(tr('FANTASMA {n}', { n: Math.ceil(J.fantasmaT) }));
  if (J.dobleT > 0) l.push(tr('DOBLE {n}', { n: Math.ceil(J.dobleT) }));
  if (J.escudo) l.push(tr('ESCUDO'));
  if (LOC.activa) l.push(tr(LOCURAS[LOC.activa].nombre) + ' ' + Math.ceil(LOC.t));
  return l;
}

// los consejos del primer nivel, uno tras otro, sobre una banda oscura
function pintaConsejo(W, y) {
  const J = JUEGO, t = J.t;
  const c = !CUR.dir && J.cortes === 0 ? tr('Desliza el dedo para mover el cúter') : J.cortes === 0 ? tr('Entra en el panel y vuelve al borde para recortarlo') : J.cortes < 3 ? tr('No toques al Inspector ni a los becarios mientras cortas') : tr('Si te paras a medio corte, arde la mecha');
  caja(10, y - 12, W - 20, 30, 8, 'rgba(13,5,22,.7)', null);
  parrafo(c, W / 2, y + 2, W - 30, 12, COL.blanco);
  if (J.cortes === 0 && t % 2 < 1) { const x = W / 2 + Math.sin(t * 6) * 30; circulo(x, TAB.y0 + TAB.h - 60, 10, 'rgba(255,255,255,.35)', COL.blanco, 2); }
}

function pintaSalida(W, H) {
  const J = JUEGO, M = MUNDOS[J.mundo];
  G.fillStyle = 'rgba(0,0,0,.45)'; G.fillRect(0, TAB.y0, W, TAB.h);
  const cy = TAB.y0 + TAB.h / 2;
  palabra(J.mundo, tr(M.nombre), W / 2, cy - 44, 38, M.claro);
  palabra('nivel', tr('NIVEL'), W / 2 - 24, cy - 4, 28); numero(J.n, W / 2 + 30, cy - 4, 24);
  if (J.nivel.final) letra(tr('¡Jefe final!'), W / 2, cy + 20, 16, COL.rosa);
  if (J.tInicio > 0.3) numero(J.tInicio > 0.9 ? 3 : J.tInicio > 0.6 ? 2 : 1, W / 2, cy + 60, 44, COL.oro); else letra(tr('¡YA!'), W / 2, cy + 60, 40, COL.oro);
}
