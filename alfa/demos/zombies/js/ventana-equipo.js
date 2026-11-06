// Fans of Zombies · LA ROPA EN LA VENTANA DE LA MOCHILA (pantalla, ADR 079): la columna «PUESTO» con los huecos de la ropa (cabeza,
// cuerpo, piernas, pies) y la mochila, con lo que le queda a cada prenda, el botón de coser, la riñonera y los bolsillos. Clic en una
// prenda puesta para quitártela; clic derecho en una prenda o una mochila (tuya o del sitio), o arrastrarla a los huecos, para
// ponértela. Los dibujos de la ropa
// y de las mochilas también están aquí (los usa dibujaObjeto de js/ventana-mochila.js).
'use strict';
const HUECOS_ROPA = [['cabeza', 'CABEZA'], ['cuerpo', 'CUERPO'], ['piernas', 'PIERNAS'], ['pies', 'PIES']];
const QUE_HACE_ROPA = { gorro: 'Menos hambre con frío', casco: 'Los mordiscos hacen menos daño', abrigo: 'Sin hambre de frío; en verano, más sed', cuero: 'Los mordiscos infectan menos', chubasquero: 'Con lluvia se te oye aún menos', vaqueros: 'Los mordiscos hacen algo menos de daño', chandal: 'Correr cansa menos', botasNieve: 'Dejas la mitad de huellas', zapatillas: 'Pasos más silenciosos', botasGoma: 'El barro de la primavera no te cansa', mochilaP: '4 × 4 casillas', mochilaM: '5 × 5 casillas', mochilaG: '6 × 7 casillas, pero vas más lento' };
const COLOR_EQUIPO = { gorro: '#5a2a2a', casco: '#2a2e36', abrigo: '#4a3e2a', cuero: '#3a2418', chubasquero: '#5a4a1a', vaqueros: '#24344a', chandal: '#2e3038', botasNieve: '#3a2a1e', zapatillas: '#4a4a4a', botasGoma: '#1e3a24', mochilaP: '#4a3a24', mochilaM: '#3a4a2a', mochilaG: '#4a2a1a' };
// los dibujos (sobre 0..1 del ancho y alto de su caja)
const DIBUJO_EQUIPO = {
  gorro: (P) => { P('#c8282e', 0.2, 0.35, 0.6, 0.4); P('#e8e0d0', 0.2, 0.65, 0.6, 0.12); P('#e8e0d0', 0.44, 0.2, 0.12, 0.14); },
  casco: (P) => { P('#2a2e36', 0.15, 0.2, 0.7, 0.55); P('#9ad8ff', 0.3, 0.4, 0.5, 0.18); P('#c8282e', 0.15, 0.2, 0.7, 0.06); },
  abrigo: (P) => { P('#7a6a4a', 0.15, 0.12, 0.7, 0.8); P('#5a4a32', 0.47, 0.12, 0.06, 0.8); P('#e8e0d0', 0.15, 0.12, 0.7, 0.1); },
  cuero: (P) => { P('#3a2418', 0.15, 0.12, 0.7, 0.8); P('#6a4430', 0.18, 0.14, 0.18, 0.3); P('#c8ccd4', 0.48, 0.2, 0.04, 0.6); },
  chubasquero: (P) => { P('#e8c020', 0.12, 0.12, 0.76, 0.8); P('#b89010', 0.12, 0.12, 0.76, 0.12); },
  vaqueros: (P) => { P('#2a4a7a', 0.25, 0.08, 0.5, 0.86); P('#1a2a4a', 0.48, 0.3, 0.04, 0.64); },
  chandal: (P) => { P('#3a3e48', 0.25, 0.08, 0.5, 0.86); P('#e8e8e8', 0.27, 0.1, 0.05, 0.82); P('#e8e8e8', 0.68, 0.1, 0.05, 0.82); },
  botasNieve: (P) => { P('#5a3a24', 0.1, 0.3, 0.32, 0.5); P('#5a3a24', 0.58, 0.3, 0.32, 0.5); P('#e8e0d0', 0.1, 0.3, 0.32, 0.1); P('#e8e0d0', 0.58, 0.3, 0.32, 0.1); },
  zapatillas: (P) => { P('#e8e8e8', 0.08, 0.45, 0.36, 0.3); P('#e8e8e8', 0.56, 0.45, 0.36, 0.3); P('#c8282e', 0.08, 0.68, 0.36, 0.07); P('#c8282e', 0.56, 0.68, 0.36, 0.07); },
  botasGoma: (P) => { P('#2a6a3a', 0.12, 0.2, 0.3, 0.6); P('#2a6a3a', 0.58, 0.2, 0.3, 0.6); P('#1a4a2a', 0.12, 0.72, 0.3, 0.08); P('#1a4a2a', 0.58, 0.72, 0.3, 0.08); },
  mochilaP: (P) => mochilaDibujo(P, '#8a6a3a'),
  mochilaM: (P) => mochilaDibujo(P, '#5a7a3a'),
  mochilaG: (P) => mochilaDibujo(P, '#9a4a2a'),
};
function mochilaDibujo(P, c) { P(c, 0.18, 0.15, 0.64, 0.75); P('#2a2420', 0.3, 0.06, 0.4, 0.1); P('#2a2420', 0.26, 0.5, 0.48, 0.2); P('#e8c040', 0.46, 0.56, 0.08, 0.08); }

// la columna de lo puesto: huecos de ropa, la mochila, coser, la riñonera y los bolsillos
function htmlEquipo(e) {
  const J = e.jugador, AJ = ZOM.AJ;
  const huecos = HUECOS_ROPA.map(([h, n]) => htmlHuecoRopa(AJ, J.equipo[h], h, n)).join('');
  const M = J.equipo.mochila;
  return '<section class="vm-equipo"><header><b>' + esc(tr('PUESTO')) + '</b></header><div class="vm-huecos">' + huecos +
    '<div class="vm-hueco mochila" title="' + esc(tr(QUE_HACE_ROPA[M] || '')) + '"><span>' + esc(tr('MOCHILA')) + '</span>' + cajaEquipo(M) + '<em>' + esc(tr(AJ.objetos[M].n)) + '</em></div></div>' +
    '<div class="vm-acciones"><button class="vm-accion' + (puedeCoser(AJ, J) ? '' : ' no') + '" id="vm-coser">' + esc(tr('COSER (1 TELA)')) + '</button></div>' +
    '<b class="vm-sub">' + esc(tr('RIÑONERA')) + '</b>' + htmlRejilla(J, 'rinonera') +
    '<b class="vm-sub">' + esc(tr('BOLSILLOS')) + '</b>' + htmlRejilla(J, 'bolsillos') +
    '<p class="vm-ayuda">' + esc(tr('Clic derecho en ropa o en una mochila para ponértela. Clic en lo puesto para quitártelo.')) + '</p></section>';
}
function htmlHuecoRopa(AJ, p, h, n) {
  const f = p ? p.dur / AJ.ropa[p.id].dur : 0;
  return '<div class="vm-hueco' + (p ? ' lleno' : '') + '" data-hueco="' + h + '" title="' + esc(p ? tr(QUE_HACE_ROPA[p.id]) : '') + '"><span>' + esc(tr(n)) + '</span>' +
    (p ? cajaEquipo(p.id) + '<i class="barra"><i style="width:' + Math.round(f * 100) + '%;background:' + (f > 0.5 ? 'var(--rk-bien)' : f > 0.2 ? 'var(--rk-oro)' : 'var(--rk-mal)') + '"></i></i><em>' + esc(tr(AJ.objetos[p.id].n)) + '</em>' : '<div class="vm-vacio"></div><em>—</em>') + '</div>';
}
const cajaEquipo = (id) => '<div class="vm-caja"><canvas width="32" height="32" data-id="' + id + '" data-gr="0"></canvas></div>';
const puedeCoser = (AJ, J) => ZOM.lleva(J, 'tela') && ZOM.puesto(J).some((p) => p.dur < AJ.ropa[p.id].dur);
// una rejilla de una bolsa con sus piezas
function htmlRejilla(J, bolsa) {
  const m = J[bolsa], C = VM.celda, AJ = ZOM.AJ;
  return '<div class="vm-rejilla" data-bolsa="' + bolsa + '" style="width:' + m.w * C + 'px;height:' + m.h * C + 'px">' +
    m.piezas.map((p) => htmlPieza(p.id, p.n, p.gr, 'mia', 'data-bolsa="' + bolsa + '" data-uid="' + p.uid + '" title="' + esc(tr(AJ.objetos[p.id].n)) + '"')).join('') + '</div>';
}
function enganchaEquipo(v) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  v.querySelectorAll('.vm-hueco.lleno').forEach((d) => (d.onclick = () => resultadoEquipo(ZOM.quitarse(AJ, e, d.dataset.hueco))));
  el('vm-coser').onclick = () => resultadoEquipo(ZOM.coser(AJ, e));
}
// clic derecho en una cosa (tuya o del sitio): si se pone, te la pones; si se usa, la usas
// (soltar = se ha arrastrado a los huecos: lo que no se pone se queda donde estaba)
function usaOPon(desde, id, soltar) {
  const e = JUEGO.e, AJ = ZOM.AJ;
  if (ZOM.esRopa(AJ, id) || ZOM.esMochila(AJ, id)) return resultadoEquipo(ZOM.ponerse(AJ, e, desde));
  if (soltar) return resultadoEquipo(ZOM.error('noSePone'));
  if (desde.bolsa && AJ.objetos[id].usa) { const r = ZOM.usar(AJ, e, id); if (!r.ok) avisa(tr('No puedes hacer eso ahora.')); pintaMochila(); }
}
function resultadoEquipo(r) {
  if (!r.ok) avisa(tr({ faltan: 'Te falta tela.', nadaQueCoser: 'No llevas nada roto.', noSePone: 'Eso no se pone.', noEsta: 'Eso ya no está.' }[r.codigo] || 'No puedes hacer eso ahora.'));
  else play('coge');
  pintaMochila();
}
