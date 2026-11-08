// Fans of Zombies · LA FICHA DEL COCHE (pantalla, ADR 083): al abrir el maletero sale, junto a él, cada pieza del coche con su barra y
// sus botones: QUITAR (a tu mochila, con su estado), PONER (la mejor que lleves de ese tipo), y en el motor REPARAR (una pieza de
// motor) y DESMONTAR (lo deja a 0 y te da piezas de motor). Todo pide llave inglesa. También el sitio que queda en el maletero y los
// dibujos de las piezas nuevas (los usa dibujaObjeto de js/ventana-mochila.js).
'use strict';
const NOMBRE_PIEZA = { motor: 'MOTOR', rueda: 'RUEDA', bateria: 'BATERÍA', frenos: 'FRENOS', cristales: 'CRISTALES' };
const NOMBRE_RUEDA = ['DEL. IZQ.', 'DEL. DCHA.', 'TRAS. IZQ.', 'TRAS. DCHA.'];
const COLOR_PIEZAS = { llaveInglesa: '#3a3e46', rueda: '#2a2a2e', bateria: '#2a3a2a', frenos: '#3a3a3a', parabrisas: '#24405a', piezasMotor: '#3a3430' };
const DIBUJO_PIEZAS = {
  llaveInglesa: (P) => { P('#c8ccd4', 0.42, 0.2, 0.16, 0.7); P('#c8ccd4', 0.28, 0.08, 0.44, 0.16); P('#2a2e36', 0.44, 0.08, 0.12, 0.08); },
  rueda: (P) => { P('#111', 0.1, 0.1, 0.8, 0.8); P('#8a8e96', 0.32, 0.32, 0.36, 0.36); P('#111', 0.45, 0.45, 0.1, 0.1); },
  bateria: (P) => { P('#2a2a2e', 0.08, 0.25, 0.84, 0.6); P('#c8282e', 0.18, 0.15, 0.12, 0.12); P('#e8e8e8', 0.7, 0.15, 0.12, 0.12); P('#e8c040', 0.35, 0.45, 0.3, 0.2); },
  frenos: (P) => { P('#6a6e76', 0.15, 0.3, 0.7, 0.4); P('#2a2a2e', 0.2, 0.36, 0.6, 0.12); },
  parabrisas: (P) => { P('#9ad8ff', 0.06, 0.15, 0.88, 0.7); P('#e8f4ff', 0.2, 0.25, 0.15, 0.45); P('#2a2e36', 0.06, 0.15, 0.88, 0.06); },
  piezasMotor: (P) => { P('#6a6e76', 0.2, 0.2, 0.3, 0.3); P('#8a5a2a', 0.5, 0.45, 0.3, 0.3); P('#c8ccd4', 0.25, 0.6, 0.2, 0.2); },
};
function htmlCoche(e) {
  const AJ = ZOM.AJ, id = e.abierto.slice(6), c = ZOM.cocheDe(e, id);
  if (!c) return '';
  const P = ZOM.piezas(AJ, c), J = e.jugador, llave = ZOM.lleva(J, 'llaveInglesa');
  const filas = [filaPieza(J, 'motor', null, P.motor), ...P.ruedas.map((r, i) => filaPieza(J, 'rueda', i, r)), filaPieza(J, 'bateria', null, P.bateria), filaPieza(J, 'frenos', null, P.frenos), filaPieza(J, 'cristales', null, P.cristales)];
  const ocupa = ZOM.casillasDe(AJ, e.contenidos[e.abierto] || []);
  return '<section class="vm-coche"><header><b>' + esc(tr('EL COCHE')) + '</b></header>' + (llave ? '' : '<p class="malo">' + esc(tr('Necesitas una llave inglesa para tocar las piezas.')) + '</p>') +
    filas.join('') + '<p class="vm-ayuda">' + esc(trf('Maletero: %1 de %2 casillas', ocupa, AJ.coches.maletero)) + '</p></section>';
}
// una pieza: nombre, barra y botones
function filaPieza(J, pieza, i, v) {
  const n = tr(NOMBRE_PIEZA[pieza]) + (i != null ? ' ' + tr(NOMBRE_RUEDA[i]) : ''), datos = 'data-pieza="' + pieza + '"' + (i != null ? ' data-i="' + i + '"' : '');
  const barra = v == null ? '<span class="malo">' + esc(tr('NO TIENE')) + '</span>' : '<i class="barra"><i style="width:' + Math.round(v) + '%;background:' + (v > 50 ? 'var(--rk-bien)' : v > 20 ? 'var(--rk-oro)' : 'var(--rk-mal)') + '"></i></i><b>' + Math.round(v) + '</b>';
  return '<div class="vm-pz"><span>' + esc(n) + '</span>' + barra + '<div class="vm-acciones">' + botonesPieza(J, pieza, v).map(([acc, t, ok]) => '<button type="button" class="vm-accion' + (ok && ZOM.lleva(J, 'llaveInglesa') ? '' : ' no') + '" ' + datos + ' data-acc="' + acc + '">' + esc(t) + '</button>').join('') + '</div></div>';
}
function botonesPieza(J, pieza, v) {
  if (pieza === 'motor') return [['repara', tr('REPARAR') + ' (' + ZOM.cuantosLleva(J, 'piezasMotor') + ')', ZOM.lleva(J, 'piezasMotor') && v < 100], ['desmonta', tr('DESMONTAR'), v >= ZOM.AJ.coches.piezas.porPieza]];
  const obj = { rueda: 'rueda', bateria: 'bateria', frenos: 'frenos', cristales: 'parabrisas' }[pieza];
  return v == null ? [['pon', tr('PONER') + ' (' + ZOM.cuantosLleva(J, obj) + ')', ZOM.lleva(J, obj)]] : [['quita', tr('QUITAR'), true]];
}
function enganchaCoche(v) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  v.querySelectorAll('.vm-coche [data-acc]').forEach((b) => (b.onclick = () => {
    const id = e.abierto.slice(6), pieza = b.dataset.pieza, i = b.dataset.i != null ? +b.dataset.i : null;
    const r = { quita: () => ZOM.quitaPieza(AJ, e, id, pieza, i, azarJuego), pon: () => ZOM.ponPieza(AJ, e, id, pieza, i), repara: () => ZOM.reparaMotor(AJ, e, id), desmonta: () => ZOM.desmontaMotor(AJ, e, id) }[b.dataset.acc]();
    if (!r.ok) avisa(tr(NO_PUEDES[r.codigo] || 'No puedes hacer eso ahora.'));
    pintaMochila();
  }));
}
