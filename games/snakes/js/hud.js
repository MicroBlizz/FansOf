// Fans of Snakes · El marcador de arriba en la partida (todo arriba: abajo solo hay tablero). Dos filas:
//   1. el botón de PAUSA (abre las Opciones), la barra de Frenesí, tus cartas (js/cartas-pantalla.js) y puntos y monedas
//   2. la FRANJA: la locura en marcha con su barra de tiempo, el objetivo de la fase en los Mundos y, en el VS, el botón RIVAL
//      (enseña u oculta su tablero; su barrita de Frenesí parpadea cuando está a punto de atacarte)
'use strict';

const HUD = { y: 4, h: 24, fy: 31, fh: 11 };   // la fila del marcador y la de la franja
const rectPausa = () => ({ x: TAB.x0 - 3, y: 0, w: 24, h: HUD.y + HUD.h + 2 });
const rectRival = () => ({ x: TAB.x0 + TAB.w - 56, y: HUD.fy - 1, w: 58, h: HUD.fh + 3 });

function pintaMarcador(W, retro, fr) {
  const J = JUEGO, y = HUD.y, h = HUD.h, x0 = TAB.x0;
  // el botón de pausa (dos rayas)
  const p = rectPausa(); zonaUI(p.x, p.y, p.w, p.h, abreOpciones);
  if (retro) {   // el marcador del móvil antiguo: números a secas
    G.fillStyle = RETRO.fondo; G.fillRect(x0 - 3, y, TAB.w + 6, h);
    G.fillStyle = RETRO.tinta; G.fillRect(x0 + 4, y + 7, 3, 10); G.fillRect(x0 + 10, y + 7, 3, 10);
    letraMono(String(J.puntos).padStart(4, '0'), x0 + 22, y + 12, 10, RETRO.tinta, 'left');
    pintaBarraFrenesi(W / 2, y + 8, 48, 8, true);
    letraMono('$' + J.monedasPartida, x0 + TAB.w - 2, y + 12, 10, RETRO.tinta, 'right');
    return;
  }
  caja(x0 - 3, y, TAB.w + 6, h, 5, fr ? '#1a0f2a' : '#0f2a1b', fr ? arcoiris(3, J.t, 55) : '#2a4a36', 1.5);
  caja(x0 + 1, y + 4, 15, 16, 4, '#17331f', '#06110a', 1);
  G.fillStyle = '#9cff6b'; G.fillRect(x0 + 5, y + 8, 2.5, 8); G.fillRect(x0 + 9.5, y + 8, 2.5, 8);
  // la barra de Frenesí con su nombre
  letra(fr ? tr('¡FRENESÍ!') + ' x' + J.mult : tr('FRENESÍ'), x0 + 21, y + 7.5, 6.5, fr ? '#ffd54a' : '#9cff6b', 'left', '#06110a', 2);
  pintaBarraFrenesi(x0 + 21, y + 12.5, 60, 7, false);
  // puntos y monedas
  letra(J.puntos.toLocaleString('es-ES'), x0 + TAB.w - 4, y + 9, 11, '#fff', 'right', '#06110a', 2.5);
  circulo(x0 + TAB.w - 26, y + 18.5, 3, '#ffd54a', '#8a5a00', 0.8);
  letra(String(J.monedasPartida), x0 + TAB.w - 4, y + 18.5, 8, '#ffd54a', 'right', '#06110a', 2);
}

// la franja de debajo del marcador
function pintaFranja(W, retro) {
  const x0 = TAB.x0, y = HUD.fy, h = HUD.fh, tinta = retro ? RETRO.tinta : null;
  let x = x0, fin = x0 + TAB.w;
  if (PARTIDA.tipo === 'vs') { pintaBotonRival(retro); fin -= 60; }
  // en los Mundos, el objetivo (si además hay una locura, el objetivo ocupa la mitad)
  const hayLocura = LOCURA.t > 0, ancho = fin - x;
  if (PARTIDA.tipo === 'mundo') {
    const F = MUNDOS[PARTIDA.mundo].fases[PARTIDA.fase], v = Math.min(F.obj[1], OBJETIVOS[F.obj[0]].valor(JUEGO));
    const w = hayLocura ? ancho / 2 - 4 : ancho;
    tramo(x, y, w, h, textoObjetivo(F), v + '/' + F.obj[1], progresoObjetivo(), tinta || '#ffd54a', retro);
    x += w + 8;
  }
  if (hayLocura) {
    const L = LOCURAS[LOCURA.tipo];
    tramo(x, y, fin - x, h, tr(L.aviso), Math.ceil(LOCURA.t) + ' s', LOCURA.t / LOCURA.dur, tinta || L.color, retro);
  }
}

// un tramo de la franja: un texto a la izquierda, otro a la derecha y una barra debajo
function tramo(x, y, w, h, txt, der, k, col, retro) {
  if (retro) { letraMono(txt, x, y + 3, 6, col, 'left'); letraMono(der, x + w, y + 3, 6, col, 'right'); }
  else { letra(txt, x + 1, y + 3.5, 6.5, col, 'left', '#06110a', 2); letra(der, x + w - 1, y + 3.5, 6.5, '#fff', 'right', '#06110a', 2); }
  caja(x, y + 7, w, 4, 2, retro ? RETRO.fondo : '#06110a', retro ? col : null, 0.8);
  G.fillStyle = col; G.fillRect(x + 0.5, y + 7.5, (w - 1) * Math.max(0, Math.min(1, k)), 3);
}

// el botón RIVAL del VS: su nombre corto, su barrita de Frenesí y si está fuera
function pintaBotonRival(retro) {
  const R = VS.rival; if (!R) return;
  const r = rectRival(), aviso = R.vivo === true && R.frenesi > 0.8 && Math.sin(JUEGO.t * 14) > 0;
  zonaUI(r.x - 2, r.y - 2, r.w + 4, r.h + 6, () => { VS.ver = !VS.ver; VS.aparte = 0; });
  if (retro) { G.strokeStyle = RETRO.tinta; G.lineWidth = 1; G.strokeRect(r.x, r.y, r.w, r.h); letraMono(VS.ver ? tr('OCULTAR') : tr('RIVAL'), r.x + r.w / 2, r.y + r.h / 2, 6, RETRO.tinta); return; }
  caja(r.x, r.y, r.w, r.h, 4, VS.ver ? '#3b1466' : aviso ? '#5a1030' : '#1a0f2a', R.vivo === true ? '#ff3d71' : '#5a4a6a', 1.2);
  if (R.vivo !== true) { letra(tr('¡FUERA!'), r.x + r.w / 2, r.y + r.h / 2 + 0.5, 6.5, '#ffd54a', 'center', null, 0); return; }
  letra(VS.ver ? tr('OCULTAR') : tr('RIVAL'), r.x + 4, r.y + 4.5, 5.8, '#ffb3c6', 'left', null, 0, 800);
  // su barra de Frenesí: cuando se llena, te ataca
  const bx = r.x + 30, bw = r.w - 34;
  caja(bx, r.y + 3, bw, 4, 2, '#06110a', null); G.fillStyle = aviso ? '#ffd54a' : '#ff3d71'; G.fillRect(bx + 0.5, r.y + 3.5, (bw - 1) * R.frenesi, 3);
  letra(tr('{n} pts', { n: R.puntos }), r.x + 4, r.y + 10.5, 5, '#cbb6ff', 'left', null, 0, 700);
}
