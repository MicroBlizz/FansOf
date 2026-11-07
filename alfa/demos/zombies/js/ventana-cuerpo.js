// Fans of Zombies · EL CUERPO EN LA MOCHILA (pantalla, ADR 082): el muñeco con las 6 partes de colores (verde sano, amarillo arañazo,
// naranja corte, rojo mordisco o sangrando, blanco vendado, marrón venda sucia, morado roto). Tocar una parte enseña sus heridas y los botones para
// curarlas (VENDAR, DESINFECTAR, COSER, TABLILLA) con cuántos te quedan. Arriba, el dolor y si llevas analgésicos. Aquí también están
// los dibujos de las curas nuevas (los usa dibujaObjeto de js/ventana-mochila.js).
'use strict';
const VCUERPO = { parte: null };
const NOMBRE_PARTE = { cabeza: 'CABEZA', torso: 'TORSO', brazoI: 'BRAZO IZQ.', brazoD: 'BRAZO DCHO.', piernaI: 'PIERNA IZQ.', piernaD: 'PIERNA DCHA.' };
const BOTON_CURA = { vendar: ['VENDAR', 'venda'], desinfectar: ['DESINFECTAR', 'desinfectante'], puntos: ['COSER', 'aguja'], tablilla: ['TABLILLA', 'tablilla'] };
const COLOR_CURAS = { desinfectante: '#3a2a1a', aguja: '#3a3a4a', tablilla: '#4a3a24', analgesico: '#3a4a5a', antibiotico: '#5a2a2a' };
const DIBUJO_CURAS = {
  desinfectante: (P) => { P('#8a5a2a', 0.3, 0.25, 0.4, 0.7); P('#e8e0d0', 0.36, 0.45, 0.28, 0.2); P('#2a2e36', 0.38, 0.1, 0.24, 0.15); },
  aguja: (P) => { P('#c8ccd4', 0.2, 0.47, 0.6, 0.06); P('#c8282e', 0.25, 0.3, 0.5, 0.12); P('#c8282e', 0.3, 0.6, 0.4, 0.1); },
  tablilla: (P) => { P('#9a6a3a', 0.3, 0.05, 0.14, 0.9); P('#9a6a3a', 0.56, 0.05, 0.14, 0.9); P('#e8e0d0', 0.25, 0.35, 0.5, 0.08); P('#e8e0d0', 0.25, 0.6, 0.5, 0.08); },
  analgesico: (P) => { P('#e8e8e8', 0.2, 0.3, 0.6, 0.45); P('#58a8e8', 0.2, 0.3, 0.6, 0.12); P('#58a8e8', 0.42, 0.5, 0.16, 0.14); },
  antibiotico: (P) => { P('#e8e8e8', 0.2, 0.3, 0.6, 0.45); P('#c8282e', 0.2, 0.3, 0.6, 0.12); P('#c8282e', 0.42, 0.5, 0.16, 0.14); },
};

// el color de una parte: lo peor que tiene
function estadoParte(J, parte) {
  const hs = ZOM.heridasEn(J, parte), AJ = ZOM.AJ;
  if (!hs.length) return 'sana';
  if (hs.some((h) => h.tipo === 'fractura' && !h.tablilla)) return 'rota';
  if (hs.some((h) => ZOM.sangraDe(AJ, h) > 0)) return 'sangra';
  if (hs.some((h) => h.venda && h.venda.t >= AJ.cuerpo.vendaSucia)) return 'sucia';
  if (hs.every((h) => h.venda || h.tablilla || h.puntos)) return 'vendada';
  return hs.some((h) => h.tipo === 'mordisco') ? 'mordisco' : hs.some((h) => h.tipo === 'corte' || h.tipo === 'profundo') ? 'corte' : 'aranazo';
}
function htmlCuerpo(e) {
  const J = e.jugador, AJ = ZOM.AJ, dolor = ZOM.dolor(AJ, J);
  const partes = ZOM.PARTES.map((p) => '<button type="button" class="vm-parte p-' + p + ' ' + estadoParte(J, p) + (VCUERPO.parte === p ? ' sel' : '') + '" data-parte="' + p + '" title="' + esc(tr(NOMBRE_PARTE[p])) + '"></button>').join('');
  const nota = J.analgesico > 0 ? trf('Analgésicos: %1 h', Math.ceil(J.analgesico)) : trf('Dolor: %1', Math.round(dolor));
  return '<section class="vm-cuerpo"><header><b>' + esc(tr('CUERPO')) + '</b></header><div class="vm-munyeco">' + partes + '</div>' +
    '<p class="vm-dolor' + (dolor > 30 ? ' malo' : '') + '">' + esc(nota) + (J.infeccion > 0 ? ' · <span class="malo">' + esc(trf('Infección %1%', Math.ceil(J.infeccion))) + '</span>' : '') + '</p>' +
    htmlParte(J) + '</section>';
}
// las heridas de la parte elegida, con sus curas
function htmlParte(J) {
  const p = VCUERPO.parte;
  if (!p) return '<p class="vm-ayuda">' + esc(tr('Toca una parte del cuerpo para ver sus heridas.')) + '</p>';
  const hs = ZOM.heridasEn(J, p);
  return '<div class="vm-heridas"><b>' + esc(tr(NOMBRE_PARTE[p])) + '</b>' + (hs.length ? hs.map((h) => htmlHerida(J, h)).join('') : '<p>' + esc(tr('Sin heridas.')) + '</p>') + '</div>';
}
function htmlHerida(J, h) {
  const AJ = ZOM.AJ, notas = [];
  if (ZOM.sangraDe(AJ, h) > 0) notas.push('<span class="malo">' + esc(tr('SANGRA')) + '</span>');
  if (h.venda) notas.push(esc(tr(h.venda.t >= AJ.cuerpo.vendaSucia ? 'VENDA SUCIA' : 'VENDADA')));
  if (h.desinf) notas.push(esc(tr('DESINFECTADA')));
  if (h.puntos) notas.push(esc(tr('COSIDA')));
  if (h.tablilla) notas.push(esc(tr('CON TABLILLA')));
  const botones = ZOM.CURAS.filter((c) => ZOM.puedeCurar(AJ, h, c)).map((c) => {
    const [n, cosa] = BOTON_CURA[c], hay = ZOM.cuantosLleva(J, cosa);
    return '<button type="button" class="vm-accion' + (hay ? '' : ' no') + '" data-herida="' + h.id + '" data-cura="' + c + '">' + esc(tr(n)) + ' (' + hay + ')</button>';
  }).join('');
  return '<div class="vm-herida"><em>' + esc(tr(AJ.cuerpo.heridas[h.tipo].n)) + '</em> ' + notas.join(' · ') + '<div class="vm-acciones">' + botones + '</div></div>';
}
function enganchaCuerpo(v) {
  v.querySelectorAll('.vm-parte').forEach((b) => (b.onclick = () => { VCUERPO.parte = VCUERPO.parte === b.dataset.parte ? null : b.dataset.parte; pintaMochila(); }));
  v.querySelectorAll('.vm-herida [data-cura]').forEach((b) => (b.onclick = () => {
    const r = ZOM.cura(ZOM.AJ, JUEGO.e, +b.dataset.herida, b.dataset.cura);
    if (!r.ok) avisa(tr({ faltan: 'No te queda de eso.', noHaceFalta: 'No hace falta.' }[r.codigo] || 'No puedes hacer eso ahora.'));
    pintaMochila();
  }));
}
