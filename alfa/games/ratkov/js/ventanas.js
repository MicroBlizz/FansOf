// Fans of Ratkov · VENTANAS DE LA INCURSIÓN: lo común (abrir, cerrar, filas de objetos), el mapa entero, la pausa y el resumen del final.
// El botín y la mochila (la mochila Tetris) están en js/ventanas-mochila.js.
// Ojo: mientras miras el botín o la mochila, el juego sigue. Solo la pausa lo para.
'use strict';
function abreVentana(id, html) { const v = el(id); v.innerHTML = html; v.hidden = false; return v; }
function cierraVentana(id) { const v = el(id); if (!v.hidden) { v.hidden = true; v.innerHTML = ''; } if (id === 'v-botin') RAID.abierto = null; if ((id === 'v-botin' || id === 'v-mochila') && typeof REJ !== 'undefined') { REJ.sitios = []; REJ.sel = null; } if (id === 'v-pausa') RAID.pausa = false; }
function cierraTodas() { for (const id of ['v-botin', 'v-mochila', 'v-mapa', 'v-pausa', 'v-mini']) cierraVentana(id); if (typeof MINI !== 'undefined') MINI.tipo = null; }
const ventanaAbierta = () => ['v-botin', 'v-mochila', 'v-mapa', 'v-pausa', 'v-fin', 'v-teclas'].some(id => !el(id).hidden);
const cabecera = (titulo, sub) => '<header><b>' + esc(titulo) + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '<button type="button" class="x" data-cierra>' + esc(tr('CERRAR')) + '</button></header>';
function filaObj(o, botones, extra = '') {
  const D = OBJ[o.id], st = statsArma(o);
  const n = o.n > 1 ? ' <i>×' + o.n + '</i>' : '';
  const det = st ? (o.bal || 0) + '/' + st.carg + (o.anom ? ' · ' + esc(tr(OBJ[o.anom].n)) : '') : o.dur != null ? Math.round(o.dur) + '/' + D.dur : '';
  return '<div class="fila-obj r' + D.r + '">' + imgObj(o.id) + '<div class="fo-t"><b>' + esc(tr(D.n)) + n + (o.fir ? ' <u class="fir">' + esc(tr('ENCONTRADO')) + '</u>' : '') + '</b><span>' + pesoDe(o).toFixed(1) + ' kg · ' + miles(valorDe(o)) + ' ' + esc(tr('chapas')) + (det ? ' · ' + det : '') + '</span>' + extra + '</div><div class="fo-b">' + botones + '</div></div>';
}
// el PASE VIP (todavía no existe): lo que va con él sale con candado. Cuando lo hagamos, paseVip() mirará la partida
const paseVip = () => !!SAVE.paseVip;
const botonVip = (txt, accion, clase = '') => '<button type="button" class="' + clase + ' vip-cerrado" data-a="' + accion + '"><i class="candado"></i>' + esc(tr(txt)) + '<small>' + esc(tr('PASE VIP')) + '</small></button>';
const avisoVip = () => { play('deny'); avisa(tr(pick(FRASES_VIP)), 'raro'); if (typeof toast === 'function' && el('refugio') && !el('refugio').hidden) toast(tr(pick(FRASES_VIP))); };
const FRASES_VIP = ['Solo con el PASE VIP de Microblizz. Próximamente. O nunca. Depende de las ventas.', 'Función reservada al PASE VIP. Gracias por su comprensión y por su tarjeta.'];
const boton = (txt, accion, i, clase = '') => '<button type="button" class="mini ' + clase + '" data-a="' + accion + '" data-i="' + i + '">' + esc(tr(txt)) + '</button>';
function enganchaCerrar(v, id) { v.querySelectorAll('[data-cierra]').forEach(b => (b.onclick = () => { play('select'); cierraVentana(id); })); }

/* ---------- el mapa entero ---------- */
function abreMapa() {
  const v = abreVentana('v-mapa', cabecera(tr('MAPA DEL DISTRITO'), tr('Verde: salida abierta · Amarillo: hace falta algo · Gris: cerrada hoy')) + '<canvas id="m-grande"></canvas><div class="leyenda" id="m-ley"></div>');
  enganchaCerrar(v, 'v-mapa');
  const cv = el('m-grande'), k = 4, pl = HUD.mapa || (HUD.mapa = planoDelMapa(4)); cv.width = pl.width; cv.height = pl.height;
  const g = cv.getContext('2d'); g.drawImage(pl, 0, 0);
  const X = x => (x - MAPA.x0) * k, Z = z => (z - MAPA.z0) * k;
  g.font = 'bold 22px VT323, monospace'; g.textAlign = 'center';
  for (const s of SALIDAS) { const ab = RAID.salidas[s.id]; g.fillStyle = !ab ? '#6a6e74' : s.pide || s.cond ? '#ffcb3d' : '#3cb048'; g.fillRect(X(s.x) - 9, Z(s.z) - 9, 18, 18); g.fillStyle = '#10141a'; g.fillText(tr(s.n).toUpperCase(), Math.max(70, Math.min(cv.width - 70, X(s.x))), Z(s.z) + (s.z > 40 ? -16 : 30)); }
  const etiquetas = [['TORRE DE MICROBLIZZ', 0, -58], ['DESPACHO', 22, -48], ['ESTATUA', 0, -26], ['MERCADILLO', -45, -33], ['CONTROL MILITAR', 48, -31], ['GARAJES', -62, 17], ['POLICLÍNICA', -24, 17], ['PARQUE', 0, 18], ['PLAYA DE VÍAS', 50, 21]];
  g.fillStyle = '#20262e'; g.font = 'bold 20px VT323, monospace'; for (const [t, x, z] of etiquetas) g.fillText(tr(t), X(x), Z(z));
  g.save(); g.translate(X(JUG.x), Z(JUG.z)); g.rotate(-JUG.a + Math.PI); g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(0, -14); g.lineTo(9, 9); g.lineTo(-9, 9); g.closePath(); g.fill(); g.restore();
}

/* ---------- la pausa ---------- */
function abrePausa() {
  RAID.pausa = true;
  const h = cabecera(tr('PAUSA')) + '<div class="botones">' + '<button type="button" class="btn-grande" data-a="seguir">' + esc(tr('SEGUIR')) + '</button>' +
    '<button type="button" class="btn" data-a="son">' + esc(tr(AJUSTES.mudo ? 'SONIDO: NO' : 'SONIDO: SÍ')) + '</button>' + '<button type="button" class="btn" data-a="mus">' + esc(tr(AJUSTES.sinMusica ? 'MÚSICA: NO' : 'MÚSICA: SÍ')) + '</button>' +
    (ENT.tactil ? '<button type="button" class="btn" data-a="vert">' + esc(tr(AJUSTES.autoApunta === false ? 'APUNTADO AUTOMÁTICO: NO' : 'APUNTADO AUTOMÁTICO: SÍ')) + '</button>' : '') +
    (ENT.tactil ? '' : '<button type="button" class="btn" data-a="teclas">' + esc(tr('TECLAS')) + '</button>') +
    '<button type="button" class="btn" data-a="como">' + esc(tr('CÓMO SE JUEGA')) + '</button>' + '<button type="button" class="btn malo" data-a="rinde">' + esc(tr(RAID.tuto ? 'SALIR DEL TUTORIAL' : 'ABANDONAR LA INCURSIÓN')) + '</button></div>';
  const v = abreVentana('v-pausa', h); enganchaCerrar(v, 'v-pausa');
  v.querySelectorAll('[data-a]').forEach(b => (b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'seguir') cierraVentana('v-pausa');
    if (a === 'son') { cambiaSonido(); abrePausa(); }
    if (a === 'mus') { cambiaMusica(); abrePausa(); }
    if (a === 'como') muestraComo();
    if (a === 'teclas') { cierraVentana('v-pausa'); RAID.pausa = true; abreTeclas(abrePausa); }
    if (a === 'vert') { AJUSTES.autoApunta = AJUSTES.autoApunta === false; guardaAjustes(); ponOrientacion(); play('select'); abrePausa(); }
    if (a === 'rinde' && RAID.tuto) { cierraVentana('v-pausa'); RAID.activa = false; RAID.tuto = false; document.body.classList.remove('en-tuto'); el('h-tuto').hidden = true; TUTO.marca.visible = false; muestraHud(false); quitaJugador(); limpiaEnemigos(); limpiaBalas(); abreRefugio('incursion'); return; }
    if (a === 'rinde') confirmBox(tr('¿ABANDONAR?'), esc(tr('Si abandonas, cuenta como caer: pierdes todo lo que llevas menos la riñonera.')), tr('ABANDONAR'), () => { cierraVentana('v-pausa'); JUG.vida = 0; muereJugador(); });
  }));
}

/* ---------- el final ---------- */
function muestraFin(vivo, salida, ganado, perdido) {
  muestraHud(false);
  const min = Math.floor(RAID.t / 60), seg = Math.floor(RAID.t % 60);
  let h = '<div class="fin ' + (vivo ? 'bien' : 'malo') + '"><p class="fin-pre">' + esc(tr(vivo ? 'HAS SALIDO' : 'HAS CAÍDO')) + '</p><h2>' + esc(vivo ? trf('Por: %1', tr(salida.n)) : tr('Microblizz se queda con tu mochila.')) + '</h2>';
  h += '<div class="fin-datos"><div><b>' + min + ':' + String(seg).padStart(2, '0') + '</b><span>' + esc(tr('TIEMPO')) + '</span></div><div><b>' + RAID.cuentas.bajas + '</b><span>' + esc(tr('BAJAS')) + '</span></div>';
  h += vivo ? '<div><b>' + miles(ganado) + '</b><span>' + esc(tr('CHAPAS EN BOTÍN')) + '</span></div>' : '<div><b>' + miles(valorLista(perdido)) + '</b><span>' + esc(tr('CHAPAS PERDIDAS')) + '</span></div>';
  h += '</div>';
  if (vivo) { const cosas = [...RAID.mochila, ...RAID.bolsillos].filter(Boolean); h += '<h4>' + esc(tr('LO QUE TRAES')) + '</h4><div class="lista corta">' + (cosas.length ? cosas.map(o => filaObj(o, '')).join('') : '<p class="vacio">' + esc(tr('Nada. Pero has vuelto, que ya es mucho.')) + '</p>') + '</div>'; }
  else { h += '<h4>' + esc(tr('LO QUE HAS PERDIDO')) + '</h4><div class="lista corta">' + (perdido.length ? perdido.map(o => filaObj(o, '')).join('') : '<p class="vacio">' + esc(tr('No llevabas nada. Lección aprendida.')) + '</p>') + '</div>'; if (SAVE.rinonera.some(Boolean)) h += '<p class="nota">' + esc(tr('Lo de la riñonera se ha salvado.')) + '</p>'; }
  if (!vivo && RAID.phony) {
    const P = RAID.phony;
    if (P.vuelve.length) h += '<h4>' + esc(tr('PHONY TE LO DEVUELVE')) + '</h4><div class="lista corta">' + P.vuelve.map(o => filaObj(o, '')).join('') + '</div>';
    if (P.perdido.length) h += '<h4>' + esc(tr('PHONY HA PERDIDO EL PAPELEO DE')) + '</h4><div class="lista corta">' + P.perdido.map(o => filaObj(o, '')).join('') + '</div><p class="nota">' + esc(tr('«Habrá sido el becario. Lo siento muchísimo. Firma aquí que no ha pasado nada.»')) + '</p>';
  }
  const listos = ENCARGOS.filter(e => encargoListo(e) && !SAVE.encargos[e.id]);
  if (listos.length) h += '<p class="nota bien">' + esc(trf('Encargo cumplido: %1. Ve a ENCARGOS a por tu premio.', tr(listos[0].n))) + '</p>';
  h += '<button type="button" class="btn-grande" id="fin-ok">' + esc(tr('VOLVER AL REFUGIO')) + '</button></div>';
  const v = abreVentana('v-fin', h);
  el('fin-ok').onclick = () => { play('select'); v.hidden = true; quitaJugador(); limpiaEnemigos(); limpiaBalas(); abreRefugio('incursion'); };
}
