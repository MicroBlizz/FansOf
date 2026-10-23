// Fans of Snakes · La tarjeta del final, según el modo: en Infinito, puntos y récord; en Mundos, fase superada (con sus estrellas
// y el premio) o no; en el Reto, tu mejor de hoy; en el VS, si ganas o pierdes. Y sus botones: seguir (revivir una vez, con un
// anuncio de prueba o con monedas), otra vez, la siguiente fase, el ranking o el menú.
'use strict';

function pintaFin(W, H) {
  const J = JUEGO, F = J.fin, k = Math.min(1, J.tFin / 0.4);
  if (k <= 0) return;
  G.fillStyle = `rgba(6,17,10,${0.65 * k})`; G.fillRect(0, 0, W, H);
  const w = W - 24, x = 12, h = 196, y = Math.max(TAB.y0 + 4, H / 2 - h / 2 - 10) + (1 - k) * -20;
  G.save(); G.globalAlpha = k;
  caja(x, y + 3, w, h, 10, '#06110a', null);
  caja(x, y, w, h, 10, '#0f2a1b', F.gana ? '#ffd54a' : '#3ddc84', 2);
  const tipo = PARTIDA.tipo;
  // el titular
  const titular = tipo === 'vs' ? (F.gana ? tr('¡HAS GANADO!') : tr('¡TE HAN GANADO!'))
    : tipo === 'mundo' ? (F.gana ? tr('¡FASE SUPERADA!') : tr('¡CASI!'))
    : F.motivo === 'pared' ? tr('¡Contra la pared!') : F.motivo === 'muro' ? tr('¡Contra un muro!') : tr('¡Te has mordido!');
  letra(titular, W / 2, y + 18, 13, F.gana ? '#ffd54a' : '#ff6b6b', 'center', '#06110a', 3);
  if (tipo === 'mundo') {
    const M = MUNDOS[PARTIDA.mundo], Fa = M.fases[PARTIDA.fase];
    letra(tr(M.nombre) + ' · ' + tr('FASE {n}', { n: PARTIDA.fase + 1 }), W / 2, y + 34, 7, M.color, 'center', null, 0, 700);
    if (F.gana) {
      for (let s = 0; s < 3; s++) { const sale = J.tFin > 0.4 + s * 0.25; estrella(W / 2 - 22 + s * 22, y + 56, sale && s < F.estrellas ? 9 : 7, sale && s < F.estrellas); }
      letra(tr('{n} s', { n: Math.round(J.tVivo) }), W / 2, y + 76, 8, '#cfe', 'center', null, 0, 700);
      if (F.premio) letra(tr('Premio: {n} monedas', { n: F.premio }), W / 2, y + 90, 8, '#ffd54a', 'center', '#06110a', 2);
    } else {
      letra(textoObjetivo(Fa), W / 2, y + 54, 8, '#ffd54a', 'center', null, 0, 700);
      caja(x + 20, y + 64, w - 40, 7, 3, '#06110a', null); G.fillStyle = '#3ddc84'; G.fillRect(x + 21, y + 65, (w - 42) * progresoObjetivo(), 5);
      letra(Math.round(progresoObjetivo() * 100) + ' %', W / 2, y + 82, 8, '#cfe', 'center', null, 0, 700);
    }
  } else {
    letra(J.puntos.toLocaleString('es-ES'), W / 2, y + 46, 24, '#fff', 'center', '#06110a', 4);
    const sub = tipo === 'infinito' ? (F.record ? tr('¡Nuevo récord!') : tr('Récord: {n}', { n: SAVE.record.toLocaleString('es-ES') }))
      : tipo === 'reto' ? (F.recordReto ? tr('¡Tu mejor marca de hoy!') : tr('Tu mejor de hoy: {n}', { n: (SAVE.reto && SAVE.reto.mejor || 0).toLocaleString('es-ES') }))
      : F.gana ? tr('+{n} monedas', { n: PREMIO_VS }) : tr('Rival: {n}', { n: VS.rival ? VS.rival.nombre : '' });
    letra(sub, W / 2, y + 68, 9, F.record || F.recordReto || F.gana ? '#ffd54a' : '#9cff6b', 'center', '#06110a', 2.5);
    letra(tr('Largo: {n}', { n: J.serp.length }) + ' · ' + tr('Frenesís: {n}', { n: J.frenesis }) + ' · ' + tr('Monedas: {n}', { n: J.monedasPartida }), W / 2, y + 86, 7, '#cfe', 'center', null, 0, 700);
  }
  G.restore();
  if (J.tFin < 0.6) return;   // los botones salen cuando ya se ha visto el golpe
  // seguir (revivir)
  let yb = y + 104;
  if (puedeRevivir()) {
    letra(tr('¿Sigues? Una vez por partida'), W / 2, yb, 7, '#9cff6b', 'center', null, 0, 700);
    const bw = hayAnuncios() ? (w - 30) / 2 : w - 40;
    if (hayAnuncios()) botonUI(tr('VER ANUNCIO'), x + 10, yb + 8, bw, 20, () => verAnuncio(() => revive(false)), '#7fd7ff', '#06110a', 8);
    const puede = SAVE.monedas >= COSTE_REVIVIR;
    botonUI(tr('{n} MONEDAS', { n: COSTE_REVIVIR }), hayAnuncios() ? x + 20 + bw : x + 20, yb + 8, bw, 20, () => revive(true), puede ? '#ffd54a' : '#4a4a3a', '#06110a', 8);
    yb += 36;
  }
  // el resto
  const mitad = (w - 30) / 2, bx1 = x + 10, bx2 = x + 20 + mitad;
  if (tipo === 'mundo' && F.gana) {
    const sig = siguienteDe(PARTIDA.mundo, PARTIDA.fase);
    if (sig) botonUI(tr('SIGUIENTE'), bx1, yb + 4, mitad, 22, () => empieza('mundo', sig[0], sig[1]), '#ffd54a');
    else botonUI(tr('REPETIR'), bx1, yb + 4, mitad, 22, otraVez, '#3ddc84');
    botonUI(tr('MAPA'), bx2, yb + 4, mitad, 22, () => alMenu('mapa'), '#9cff6b');
    UI.enter = sig ? () => empieza('mundo', sig[0], sig[1]) : otraVez;
  } else {
    const txt = tipo === 'vs' ? tr('REVANCHA') : tipo === 'mundo' ? tr('REINTENTAR') : tr('OTRA VEZ');
    botonUI(txt, bx1, yb + 4, mitad, 22, otraVez, '#3ddc84');
    if (tipo === 'mundo') botonUI(tr('MAPA'), bx2, yb + 4, mitad, 22, () => alMenu('mapa'), '#9cff6b');
    else if (tipo === 'reto') botonUI(tr('RANKING'), bx2, yb + 4, mitad, 22, () => abreRanking('reto'), '#d36bff');
    else botonUI(tr('MENÚ'), bx2, yb + 4, mitad, 22, () => alMenu('menu'), '#9cff6b');
    UI.enter = otraVez;
  }
  if (tipo === 'reto') botonUI(tr('MENÚ PRINCIPAL'), W / 2 - 45, yb + 32, 90, 14, () => alMenu('menu'), '#2a4a36', '#9cff6b', 7);
  UI.atras = () => alMenu(tipo === 'mundo' ? 'mapa' : 'menu');
}

// la fase que va después (la siguiente del mundo, o la primera del mundo siguiente)
function siguienteDe(m, f) {
  if (f + 1 < MUNDOS[m].fases.length) return [m, f + 1];
  if (m + 1 < MUNDOS.length) return [m + 1, 0];
  return null;
}
