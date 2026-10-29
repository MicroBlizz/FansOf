// Fans of Swipe · PANTALLAS: lo que va en HTML encima del canvas. La portada (Jugar o Seguir, Cómo se juega, Reliquias, Opciones),
// la pausa, el final de la subida, tu mazo, la colección de reliquias y las opciones. La portada se pinta en el canvas (swPintaPortada).
'use strict';
const SW_PANT = { actual: 'titulo', pausa: false };
const swH = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function swIrA(p) {
  SW_PANT.actual = p; SW_PANT.pausa = false;
  $('#sw-titulo').hidden = p !== 'titulo';
  swCierraModal();
  if (p === 'titulo') { swMusica('menu'); swPortadaBotones(); }
}
function swPortadaBotones() {
  const hay = !!SAVE.run;
  $('#sw-seguir').hidden = !hay;
  $('#sw-jugar').textContent = hay ? tr('NUEVA SUBIDA') : tr('JUGAR');
  $('#sw-jugar').classList.toggle('sw-enorme', !hay);
  $('#sw-record').textContent = SAVE.record ? tr('Récord: piso {n}', { n: SAVE.record }) + (SAVE.victorias ? ' · ' + tr('Victorias: {n}', { n: SAVE.victorias }) : '') : tr('Sube la Torre de Microblizz deslizando cartas.');
}
function swModal(html, clase = '') {
  const m = $('#sw-modal'), t = $('#sw-tarjeta');
  t.className = 'sw-tarjeta ' + clase; t.innerHTML = html; m.hidden = false;
  return t;
}
function swCierraModal() { $('#sw-modal').hidden = true; }

/* ---------- empezar ---------- */
function swEmpieza(seguir) {
  play('go'); swFxLimpia(); SW_COLA.length = 0;
  if (seguir && SAVE.run) swSigueSubida(); else swNuevaSubida();
  SW_PANT.actual = 'partida'; SW_PANT.pausa = false;
  $('#sw-titulo').hidden = true; swCierraModal();
  swMusicaPiso();
  if (!SAVE.ayuda) { SAVE.ayuda = true; swGuarda(); swAyuda(true); }
}
/* ---------- cómo se juega ---------- */
function swAyuda(enPartida) {
  if (enPartida) SW_PANT.pausa = true;
  const fila = (k, txt) => `<div class="sw-ay"><span data-mini="${k}"></span><p>${txt}</p></div>`;
  const t = swModal(`<h2>${tr('Cómo se juega')}</h2>
    ${fila('i-flecha', tr('<b>Desliza la carta</b> a la izquierda o a la derecha. Cada lado hace una cosa distinta: míralo antes de soltar.'))}
    ${fila('i-espada', tr('El enemigo enseña lo que va a hacer. <b>Ataca</b> o <b>cúbrete</b> con escudo a tiempo.'))}
    ${fila('i-escudo', tr('Los lados <b>cambian</b>: no siempre se ataca a la izquierda. El escudo que te sobra se guarda a medias (<b>guardia</b>) y la <b>Parada</b> devuelve lo que bloqueas.'))}
    ${fila('i-flecha', tr('A la derecha ves la <b>siguiente carta</b>: planea dos jugadas.'))}
    ${fila('n-elite', tr('Las élites y el CEO <b>cargan</b> golpes enormes. Hazles el daño que marcan mientras cargan y se lo <b>cortas</b>.'))}
    ${fila('i-caos', tr('Los ataques fuertes gastan <b>caos</b>. Ganas 1 cada turno.'))}
    ${fila('a-caos', tr('<b>¡Rápido!</b> Cada carta tiene su mecha. Si deslizas deprisa haces <b>racha</b>; con 4 seguidas entras en <b>FRENESÍ</b>: más daño y más oro.'))}
    ${fila('r-hielo', tr('Las <b>reliquias</b> premian tus gestos: tres a la izquierda, alternar lados… ¡Busca los combos!'))}
    ${fila('n-jefe', tr('Elige camino en cada piso y llega al piso 15: allí te espera <b>el CEO</b>.'))}
    <button class="sw-btn" id="sw-ay-ok" type="button">${tr('¡A SUBIR!')}</button>`, 'sw-ancha');
  t.querySelectorAll('[data-mini]').forEach(s => s.append(swMiniatura(s.dataset.mini, s.dataset.mini.startsWith('i-') ? 3 : 2)));
  $('#sw-ay-ok').onclick = () => { play('select'); swCierraModal(); SW_PANT.pausa = false; if (!enPartida) swIrA('titulo'); else swNuevaMecha(); };
}
/* ---------- pausa ---------- */
function swAbrePausa() {
  SW_PANT.pausa = true;
  swModal(`<h2>${tr('Pausa')}</h2>
    <button class="sw-btn" id="sw-p-seguir" type="button">${tr('SEGUIR')}</button>
    <button class="sw-btn2 sw-verde" id="sw-p-mazo" type="button">${tr('MI MAZO')}</button>
    <button class="sw-btn2 sw-verde" id="sw-p-ayuda" type="button">${tr('CÓMO SE JUEGA')}</button>
    <button class="sw-btn2 sw-azul" id="sw-p-opc" type="button">${tr('OPCIONES')}</button>
    <button class="sw-btn2 sw-rojo" id="sw-p-salir" type="button">${tr('SALIR (SE GUARDA)')}</button>`);
  $('#sw-p-seguir').onclick = () => { play('select'); swCierraModal(); SW_PANT.pausa = false; swNuevaMecha(); };
  $('#sw-p-mazo').onclick = () => { play('select'); swMazo(true); };
  $('#sw-p-ayuda').onclick = () => { play('select'); swAyuda(true); };
  $('#sw-p-opc').onclick = () => { play('select'); swAbreOpciones(true); };
  $('#sw-p-salir').onclick = () => { play('select'); swGuardaSubida(); swIrA('titulo'); };
}
/* ---------- tu mazo ---------- */
function swMazo(desdePausa) {
  if (!desdePausa) SW_PANT.pausa = true;
  const P = SW_P;
  const t = swModal(`<h2>${tr('Mi mazo')}</h2><p class="sw-sub">${tr('{n} cartas. Te van saliendo en orden aleatorio.', { n: P.mazo.length })}</p>
    <div class="sw-mazo">${P.mazo.map(c => { const D = SW_CARTAS[c.id]; return `<div class="sw-mc" style="--c:${SW_RAREZAS[D.rareza].col}"><b>${swH(swNombreCarta(c.id, c.mejor))}</b><span data-a="${D.arte[0]}"></span><span data-a="${D.arte[1]}"></span><small>${swH(swResumenCarta(P, c.id)).replace('\n', '<br>')}</small></div>`; }).join('')}</div>
    <button class="sw-btn" id="sw-mz-ok" type="button">${tr('CERRAR')}</button>`, 'sw-ancha');
  t.querySelectorAll('[data-a]').forEach(s => s.append(swMiniatura(s.dataset.a, 2)));
  $('#sw-mz-ok').onclick = () => { play('select'); if (desdePausa) swAbrePausa(); else { swCierraModal(); SW_PANT.pausa = false; swNuevaMecha(); } };
}
/* ---------- una reliquia (al tocarla arriba) ---------- */
function swInfoReliquia(id) {
  SW_PANT.pausa = true;
  const R = SW_RELIQUIAS[id];
  const t = swModal(`<span data-mini="${id}"></span><h2>${swH(tr(R.nombre))}</h2><p class="sw-sub">${swH(tr(R.texto))}</p><button class="sw-btn" id="sw-r-ok" type="button">${tr('VALE')}</button>`);
  t.querySelector('[data-mini]').append(swMiniatura(id, 5));
  $('#sw-r-ok').onclick = () => { play('select'); swCierraModal(); SW_PANT.pausa = false; swNuevaMecha(); };
}
/* ---------- el final ---------- */
const SW_FRASES_CAE = ['Recursos Humanos ha archivado tu caso. En la trituradora.', 'El CEO ni se ha enterado. Estaba en una reunión.', 'Microblizz te ofrece unas prácticas no remuneradas como consuelo.', 'CrazyBunny dice que la próxima vez sube por las escaleras.'];
const SW_FRASES_GANA = ['El CEO ha dimitido con una indemnización de nueve cifras. Pero ha dimitido.', 'La Torre de Microblizz ahora es un huerto de zanahorias.', 'Los becarios por fin cobran. En zanahorias, pero cobran.'];
function swPantallaFin(gana) {
  SW_PANT.pausa = true;
  const P = SW_P;
  const t = swModal(`<h2>${gana ? tr('¡Has llegado arriba!') : tr('Has caído')}</h2>
    <p class="sw-sub">${tr(pick(gana ? SW_FRASES_GANA : SW_FRASES_CAE))}</p>
    <div class="sw-fin"><div><small>${tr('PISO')}</small><b>${gana ? SW_CFG.pisos : P.piso}</b></div><div><small>${tr('ORO')}</small><b>${fmt(P.oro)}</b></div><div><small>${tr('RELIQUIAS')}</small><b>${P.reliquias.length}</b></div></div>
    <p class="sw-sub">${tr('Récord: piso {n}', { n: SAVE.record })}</p>
    <div class="sw-rel">${P.reliquias.map(r => `<span data-mini="${r}"></span>`).join('')}</div>
    <button class="sw-btn sw-enorme" id="sw-otra" type="button">${tr('OTRA SUBIDA')}</button>
    <button class="sw-btn2 sw-azul" id="sw-fin-sal" type="button">${tr('PORTADA')}</button>`);
  t.querySelectorAll('[data-mini]').forEach(s => s.append(swMiniatura(s.dataset.mini, 2)));
  $('#sw-otra').onclick = () => swEmpieza(false);
  $('#sw-fin-sal').onclick = () => { play('select'); SW_P = null; swIrA('titulo'); };
}
/* ---------- la colección de reliquias ---------- */
function swColeccion() {
  const todas = Object.keys(SW_RELIQUIAS), vistas = todas.filter(k => SAVE.vistas[k]).length;
  const t = swModal(`<h2>${tr('Reliquias')}</h2><p class="sw-sub">${tr('{n} de {t} descubiertas', { n: vistas, t: todas.length })}</p>
    <div class="sw-col">${todas.map(k => `<div class="sw-pz${SAVE.vistas[k] ? '' : ' sw-oculta'}"><span data-mini="${k}"></span><b>${SAVE.vistas[k] ? swH(tr(SW_RELIQUIAS[k].nombre)) : '?'}</b><small>${SAVE.vistas[k] ? swH(tr(SW_RELIQUIAS[k].texto)) : ''}</small></div>`).join('')}</div>
    <button class="sw-btn" id="sw-col-ok" type="button">${tr('CERRAR')}</button>`, 'sw-ancha');
  t.querySelectorAll('[data-mini]').forEach(s => s.append(swMiniatura(s.dataset.mini, 2)));
  $('#sw-col-ok').onclick = () => { play('select'); swCierraModal(); };
}
/* ---------- opciones ---------- */
function swAbreOpciones(desdePausa) {
  const t = swModal(`<h2>${tr('Opciones')}</h2><div id="sw-opc-lista"></div>`, 'sw-ancha');
  const { lista, version, cerrar } = OPCIONES.lista({
    filas: [
      OPCIONES.interruptor(tr('Sonido'), tr('Efectos y música.'), () => !SAVE.muted, v => { SAVE.muted = !v; swGuarda(); applyVolume(); }),
      OPCIONES.interruptor(tr('Música'), tr('La canción de fondo.'), () => SAVE.musica !== false, v => { SAVE.musica = v; swGuarda(); applyVolume(); }),
      'idioma', 'cuenta',
    ],
    versionTexto: 'Fans of Swipe · v' + VERSION,
    alCerrar: () => { if (desdePausa) swAbrePausa(); else swCierraModal(); },
  });
  const sitio = t.querySelector('#sw-opc-lista'); sitio.append(lista); if (version) sitio.append(version); if (cerrar) sitio.append(cerrar);
}
