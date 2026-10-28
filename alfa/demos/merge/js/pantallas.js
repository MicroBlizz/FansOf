// Fans of Merge · PANTALLAS: lo que va en HTML encima del canvas. La portada (Jugar, Cómo se juega, Colección, Opciones),
// la elección de carta al empezar, la pausa, el final con la puntuación, la colección de piezas descubiertas y las opciones.
'use strict';
const MG_PANT = { actual: 'titulo', pausa: false };
const mgH = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function mgIrA(p) {
  MG_PANT.actual = p; MG_PANT.pausa = false;
  $('#mg-titulo').hidden = p !== 'titulo';
  mgCierraModal();
  if (p === 'titulo') { mgMusica('menu'); if (typeof mgBotonLibre === 'function') mgBotonLibre(); }
}
function mgModal(html, clase = '') {
  const m = $('#mg-modal'), t = $('#mg-tarjeta');
  t.className = 'mg-tarjeta ' + clase; t.innerHTML = html; m.hidden = false;
  return t;
}
function mgCierraModal() { $('#mg-modal').hidden = true; }
// una pieza dibujada en un lienzo pequeño (para la colección y las cartas)
function mgMiniatura(tipo, lado = 72, oculta = false) {
  const cv = document.createElement('canvas'), k = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = cv.height = lado * k; cv.style.width = cv.style.height = lado + 'px';
  const c = cv.getContext('2d'); c.scale(k, k);
  if (oculta) c.filter = 'brightness(0) opacity(.35)';
  mgDibujaPieza(c, tipo, lado / 2, lado / 2, lado, k);
  return cv;
}

/* ---------- empezar: elegir una carta ---------- */
// nivelId: el nivel de la Aventura (o nada para el Modo libre). En la Aventura solo se eligen cartas desde el nivel que las trae.
function mgNuevaPartida(nivelId) {
  play('go');
  MG_PANT.nivelId = nivelId || null;
  if (nivelId && !mgNivel(nivelId).cartas) { mgArranca(null); return; }
  const tres = shuffle(MG_CARTAS.slice()).slice(0, 3);
  const t = mgModal(`<h2>${tr('Elige tu carta')}</h2><p class="mg-sub">${tr('Te acompaña toda la partida.')}</p>
    <div class="mg-cartas">${tres.map(C => `<button class="mg-carta" type="button" data-id="${C.id}" style="--c:${C.col}"><b>${mgH(tr(C.nombre))}</b><span>${mgH(tr(C.texto))}</span></button>`).join('')}</div>
    <button class="mg-btn2" id="mg-sin-carta" type="button">${tr('SIN CARTA')}</button>`, 'mg-ancha');
  t.querySelectorAll('.mg-carta').forEach(b => { b.onclick = () => { play('mgCarta'); mgArranca(b.dataset.id); }; });
  $('#mg-sin-carta').onclick = () => { play('select'); mgArranca(null); };
  MG_PANT.actual = 'cartas'; $('#mg-titulo').hidden = true;
}
function mgArranca(carta) {
  mgCierraModal(); mgFxLimpia();
  mgEmpieza(carta, MG_PANT.nivelId);
  MG_PANT.actual = 'partida'; MG_PANT.pausa = false; $('#mg-titulo').hidden = true;
  if (!MG_PANT.nivelId && !SAVE.ayuda) { SAVE.ayuda = true; mgGuarda(); mgAyuda(true); }
}
/* ---------- cómo se juega ---------- */
function mgAyuda(enPartida) {
  if (enPartida) MG_PANT.pausa = true;
  const fila = (tipo, txt) => `<div class="mg-ay"><span data-mini="${tipo}"></span><p>${txt}</p></div>`;
  const t = mgModal(`<h2>${tr('Cómo se juega')}</h2>
    ${fila('zanahoria', tr('Planta la pieza en una casilla libre. <b>Tres iguales que se tocan</b> se juntan en una mejor, justo donde pusiste la última.'))}
    ${fila('palacio', tr('Brote, zanahoria, huerto, casita, madriguera, torre, palacio… ¡Llega al <b>palacio flotante</b>! Con cuatro o más sale dorada y vale el doble.'))}
    ${fila('zorro', tr('El <b>zorro</b> anda y el <b>cuervo</b> salta. Enciérralos y se duermen; tres dormidos hacen una cueva.'))}
    ${fila('semilla', tr('La <b>semilla mágica</b> se convierte en lo que más te conviene. El <b>topo</b> quita una pieza.'))}
    ${fila('cofre', tr('Guarda una pieza en la <b>reserva</b> para luego. Abre los <b>cofres</b> para hacer sitio. Si el tablero se llena, se acaba.'))}
    <button class="mg-btn" id="mg-ay-ok" type="button">${tr('¡A PLANTAR!')}</button>`, 'mg-ancha');
  t.querySelectorAll('[data-mini]').forEach(s => s.append(mgMiniatura(s.dataset.mini, 58)));
  $('#mg-ay-ok').onclick = () => { play('select'); mgCierraModal(); MG_PANT.pausa = false; if (!enPartida) mgIrA('titulo'); };
}
/* ---------- pausa ---------- */
function mgAbrePausa() {
  MG_PANT.pausa = true;
  mgModal(`<h2>${tr('Pausa')}</h2>
    <button class="mg-btn" id="mg-seguir" type="button">${tr('SEGUIR')}</button>
    <button class="mg-btn2 mg-verde" id="mg-ayuda2" type="button">${tr('CÓMO SE JUEGA')}</button>
    <button class="mg-btn2 mg-azul" id="mg-opc2" type="button">${tr('OPCIONES')}</button>
    <button class="mg-btn2 mg-rojo" id="mg-reinicia" type="button">${tr('REINICIAR')}</button>
    <button class="mg-btn2 mg-rojo" id="mg-salir" type="button">${tr('SALIR')}</button>`);
  $('#mg-seguir').onclick = () => { play('select'); mgCierraModal(); MG_PANT.pausa = false; };
  $('#mg-ayuda2').onclick = () => { play('select'); mgAyuda(true); };
  $('#mg-opc2').onclick = () => { play('select'); mgAbreOpciones(true); };
  $('#mg-reinicia').onclick = () => { play('select'); if (MG_PANT.nivelId) mgAbreNivel(MG_PANT.nivelId); else mgNuevaPartida(); };
  $('#mg-salir').onclick = () => { play('select'); MG_P.estado = 'nada'; mgIrA('titulo'); if (MG_PANT.nivelId) mgAbreNiveles(); };
}
/* ---------- el final ---------- */
const MG_FRASES_FIN = ['Los zorros se han quedado con tu huerto. Por ahora.', 'CrazyBunny dice que ha sido una gran cosecha.', 'Microblizz quiere comprar tu palacio para hacer oficinas.', 'Ni un hueco libre: eso es aprovechar el terreno.'];
function mgPantallaFin(record) {
  MG_PANT.pausa = true;
  const t = mgModal(`<h2>${record ? tr('¡Nuevo récord!') : tr('Tablero lleno')}</h2>
    <p class="mg-sub">${tr(pick(MG_FRASES_FIN))}</p>
    <div class="mg-fin"><span data-mini="${MG_P.mejor}"></span><div><small>${tr('PUNTOS')}</small><b>${fmt(MG_P.pts)}</b><small>${tr('Récord: {n}', { n: fmt(SAVE.record) })}</small><small>${tr('Lo mejor: {n}', { n: tr(MG_PIEZAS[MG_P.mejor].nombre) })}</small><small>${tr('Turnos: {n}', { n: MG_P.turno })}</small></div></div>
    <button class="mg-btn" id="mg-otra" type="button">${tr('OTRA PARTIDA')}</button>
    <button class="mg-btn2 mg-azul" id="mg-fin-sal" type="button">${tr('PORTADA')}</button>`);
  t.querySelectorAll('[data-mini]').forEach(s => s.append(mgMiniatura(s.dataset.mini, 110)));
  $('#mg-otra').onclick = () => mgNuevaPartida();
  $('#mg-fin-sal').onclick = () => { play('select'); MG_P.estado = 'nada'; mgIrA('titulo'); };
}
/* ---------- la colección ---------- */
function mgColeccion() {
  const todas = [...MG_CADENA, 'dormido', 'cueva', 'piedra', 'roca', 'cofre', 'zorro', 'cuervo', 'semilla', 'topo'];
  const vistas = todas.filter(k => SAVE.coleccion[k]).length;
  const t = mgModal(`<h2>${tr('Colección')}</h2><p class="mg-sub">${tr('{n} de {t} piezas descubiertas', { n: vistas, t: todas.length })}</p>
    <div class="mg-col">${todas.map(k => `<div class="mg-pz" data-k="${k}"><span></span><small>${SAVE.coleccion[k] ? mgH(tr(MG_PIEZAS[k].nombre)) : '?'}</small></div>`).join('')}</div>
    <button class="mg-btn" id="mg-col-ok" type="button">${tr('CERRAR')}</button>`, 'mg-ancha');
  t.querySelectorAll('.mg-pz').forEach(d => d.querySelector('span').append(mgMiniatura(d.dataset.k, 62, !SAVE.coleccion[d.dataset.k])));
  $('#mg-col-ok').onclick = () => { play('select'); mgCierraModal(); };
}
/* ---------- opciones ---------- */
function mgAbreOpciones(desdePausa) {
  const t = mgModal(`<h2>${tr('Opciones')}</h2><div id="mg-opc-lista"></div>`, 'mg-ancha');
  const { lista, version, cerrar } = OPCIONES.lista({
    filas: [
      OPCIONES.interruptor(tr('Sonido'), tr('Efectos y música.'), () => !SAVE.muted, v => { SAVE.muted = !v; mgGuarda(); applyVolume(); }),
      OPCIONES.interruptor(tr('Música'), tr('La canción de fondo.'), () => SAVE.musica !== false, v => { SAVE.musica = v; mgGuarda(); applyVolume(); }),
      'idioma', 'cuenta',
    ],
    versionTexto: 'Fans of Merge · v' + VERSION,
    alCerrar: () => { if (desdePausa) mgAbrePausa(); else mgCierraModal(); },
  });
  const sitio = t.querySelector('#mg-opc-lista'); sitio.append(lista); if (version) sitio.append(version); if (cerrar) sitio.append(cerrar);
}
