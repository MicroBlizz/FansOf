// Fans of Merge · PANTALLAS de la Aventura: la lista de niveles (con sus estrellas y los que faltan por abrir), la ficha de cada nivel
// antes de jugarlo (objetivo y turnos) y el final del nivel (estrellas, siguiente, reintentar). También el botón del Modo libre de la portada.
'use strict';
const mgEstrellasHtml = (n, de = 3) => `<span class="mg-estrellas">${Array.from({ length: de }, (_, i) => `<i class="${i < n ? 'si' : ''}"></i>`).join('')}</span>`;
function mgAbreNiveles() {
  const total = MG_NIVELES.reduce((a, N) => a + mgEstrellasDe(N.id), 0);
  const t = mgModal(`<h2>${tr('Aventura')}</h2><p class="mg-sub">${tr('{n} de {t} estrellas', { n: total, t: MG_NIVELES.length * 3 })}</p>
    <div class="mg-niveles">${MG_NIVELES.map(N => { const ab = mgAbierto(N.id), e = mgEstrellasDe(N.id);
      return `<button class="mg-nv ${ab ? '' : 'mg-cerrado'} ${ab && !e ? 'mg-toca' : ''}" type="button" data-id="${N.id}" ${ab ? '' : 'disabled'}><b>${N.id}</b>${mgEstrellasHtml(e)}</button>`; }).join('')}</div>
    <button class="mg-btn2 mg-azul" id="mg-nv-volver" type="button">${tr('PORTADA')}</button>`, 'mg-ancha');
  t.querySelectorAll('.mg-nv:not([disabled])').forEach(b => { b.onclick = () => { play('select'); mgAbreNivel(+b.dataset.id); }; });
  $('#mg-nv-volver').onclick = () => { play('select'); mgIrA('titulo'); };
  $('#mg-titulo').hidden = true; MG_PANT.actual = 'niveles';
}
function mgAbreNivel(id) {
  const N = mgNivel(id);
  const t = mgModal(`<h2>${tr('Nivel {n}', { n: id })}</h2>${N.intro ? `<p class="mg-sub">${mgH(tr(N.intro))}</p>` : ''}
    <div class="mg-objs">${N.obj.map(o => `<div class="mg-obj">${o.crear ? `<span data-mini="${o.crear}"></span>` : ''}<b>${mgH(mgObjTexto(o))}</b></div>`).join('')}</div>
    <p class="mg-turnos">${tr('En {n} turnos', { n: N.movs })}</p>
    <button class="mg-btn mg-enorme" id="mg-nv-jugar" type="button">${tr('JUGAR')}</button>
    <button class="mg-btn2 mg-azul" id="mg-nv-lista" type="button">${tr('NIVELES')}</button>`);
  t.querySelectorAll('[data-mini]').forEach(s => s.append(mgMiniatura(s.dataset.mini, 54)));
  $('#mg-nv-jugar').onclick = () => mgNuevaPartida(id);
  $('#mg-nv-lista').onclick = () => { play('select'); mgAbreNiveles(); };
  $('#mg-titulo').hidden = true; MG_PANT.actual = 'niveles';
}
function mgPantallaNivelFin(gana, estrellas) {
  MG_PANT.pausa = true;
  const N = MG_P.nivel, sig = mgNivel(N.id + 1), libreNuevo = gana && N.id === MG_LIBRE_DESDE;
  const motivo = MG_P.movs <= 0 ? tr('Se acabaron los turnos.') : tr('El tablero se ha llenado.');
  const t = mgModal(gana
    ? `<h2>${tr('¡Nivel superado!')}</h2>${mgEstrellasHtml(estrellas)}<p class="mg-sub">${tr('Puntos: {n}', { n: fmt(MG_P.pts) })}</p>
       ${libreNuevo ? `<p class="mg-premio">${tr('¡Modo libre desbloqueado!')}</p>` : ''}
       ${sig ? `<button class="mg-btn" id="mg-nf-sig" type="button">${tr('SIGUIENTE')}</button>` : `<p class="mg-premio">${tr('¡Has terminado la Aventura!')}</p>`}
       <button class="mg-btn2 mg-verde" id="mg-nf-otra" type="button">${tr('REPETIR')}</button>`
    : `<h2>${tr('¡Casi!')}</h2><p class="mg-sub">${motivo}</p>
       <div class="mg-objs">${N.obj.map(o => { const [a, b] = mgObjValor(o); return `<div class="mg-obj"><b>${mgH(mgObjTexto(o))}: ${o.puntos ? fmt(a) : a} / ${o.puntos ? fmt(b) : b}</b></div>`; }).join('')}</div>
       <button class="mg-btn" id="mg-nf-otra" type="button">${tr('REINTENTAR')}</button>`);
  t.insertAdjacentHTML('beforeend', `<button class="mg-btn2 mg-azul" id="mg-nf-lista" type="button">${tr('NIVELES')}</button>`);
  if (sig && gana) $('#mg-nf-sig').onclick = () => { play('select'); mgAbreNivel(sig.id); };
  $('#mg-nf-otra').onclick = () => { play('select'); mgAbreNivel(N.id); };
  $('#mg-nf-lista').onclick = () => { play('select'); MG_P.estado = 'nada'; mgAbreNiveles(); };
  if (gana) for (let i = 0; i < estrellas; i++) setTimeout(() => play('mgJunta', i + 2), 300 + i * 260);
}
// el botón del Modo libre de la portada: cerrado hasta pasar el nivel MG_LIBRE_DESDE
function mgBotonLibre() {
  const b = $('#mg-libre'); if (!b) return;
  const ab = mgLibreAbierto(); b.classList.toggle('mg-cerrado', !ab);
  b.onclick = () => { if (ab) { MG_PANT.nivelId = null; mgNuevaPartida(); } else { play('mgNoVale'); toast(tr('Pasa el nivel {n} de la Aventura para abrir el Modo libre.', { n: MG_LIBRE_DESDE })); } };
}
