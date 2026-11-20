// Fans of Pop · PANTALLA DEL PASE NUEVO (tarea #165, ADR 165; boceto aprobado por Pepins el 19-11-2026): el tema del mes con sus colores,
// la barra de progreso, el Pase dorado y el Dorado+ que destacan, RECOGER TODO, las 3 misiones del día, los premios con SOLO ESTE MES y
// los escalones extra tras el 60. Recoger y volar a la barra lo hace js/pase.js (ppPaseRecoge); lo del juego, js/pase-nuevo.js.
'use strict';
function ppPaseCabeceraNueva(e, pts, tema) {
  const C = PP_PASE_R.CFG, completo = e >= C.escalones;
  const finMes = new Date(); finMes.setMonth(finMes.getMonth() + 1, 1); finMes.setHours(0, 0, 0, 0);
  const dias = Math.ceil((finMes - Date.now()) / 86400000), av = Math.round(100 * (C.porEscalon - PP_PASE_R.falta(pts)) / C.porEscalon);
  const texto = completo ? tr('¡Pase completo! Sigue jugando: escalones extra') : tr('{n} puntos para el escalón {e}', { n: PP_PASE_R.falta(pts), e: e + 1 });
  return `<p class="pp-pase-tema">${tr(tema.nombre)}</p><h2>${tr('Pase de Pop')}</h2>
    <p class="pp-sub">${tr('Escalón {e} de {t}', { e, t: C.escalones })} · ${tr('quedan {d} días', { d: dias })}</p>
    <div class="pp-pase-barra"><span style="width:${av}%"></span><b>${texto}</b></div>
    <p class="pp-pase-hoy">${tr('Hoy, jugando: {n} de {t} puntos (las misiones, aparte)', { n: ppPaseHoy().n, t: C.topeDia })}</p>`;
}
// el Pase dorado: comprar (4,99 € o Dorado+ 9,99 €) o, si ya lo tienes, cuánto da
function ppPaseDorado(t, P, tema) {
  const d = document.createElement('div'); d.className = 'pp-pase-dorado';
  if (P.premium) { d.innerHTML = `<b>${tr('¡Tienes el Pase dorado!')}</b><small>${tr('Todos los premios dorados son tuyos.')}</small>`; t.appendChild(d); return; }
  d.innerHTML = `<div><b>${tr('PASE DORADO')}</b><small>${tr('60 premios más: la bandeja {b} y un compañero de este mes', { b: tr(ppBandejaDe(tema.bandeja).nombre) })}</small></div>`;
  if (ppVentaCerrada()) { d.innerHTML = `<div><b>${tr('PASE DORADO')}</b><small>${tr('No disponible para menores')}</small></div>`; t.appendChild(d); return; }   // tarea #254
  const botones = document.createElement('div'); botones.className = 'pp-pase-compra';
  botones.append(ppBoton(PP_CFG.pase.precio, 'pp-btn2 pp-naranja', () => ppPaseCompra(false)),
    ppBoton(tr('Dorado+ {p}', { p: PP_CFG.pase.plus.precio }), 'pp-btn2 pp-rosa', () => ppPaseCompra(true)));
  d.appendChild(botones); t.appendChild(d);
}
// las 3 misiones del día: progreso y COBRAR (+5 puntos)
function ppPaseMisiones(t) {
  const caja = document.createElement('div'); caja.className = 'pp-pase-mis';
  caja.innerHTML = `<p class="pp-pase-mis-tit">${tr('Misiones de hoy')} <small>${tr('+{n} puntos cada una', { n: PP_PASE_R.CFG.puntos.mision })}</small></p>`;
  for (const m of PP_PASE_MIS.lista('d')) {
    const fila = document.createElement('div'); fila.className = 'pp-pase-mision' + (m.cobrada ? ' pp-cogido' : '');
    fila.innerHTML = `<span>${tr(m.txt)}</span><i>${m.prog}/${m.goal}</i>`;
    if (m.listo && !m.cobrada) fila.appendChild(ppBoton(tr('COBRAR'), 'pp-btn2 pp-verde', () => { PP_PASE_MIS.cobrar('d', m.id); play('ppPremio'); ppPaseRepinta(); }));
    else if (m.cobrada) fila.insertAdjacentHTML('beforeend', `<em>${tr('Hecha')}</em>`);
    caja.appendChild(fila);
  }
  t.appendChild(caja);
}
// la fila de los escalones extra (tras el 60): lo que da cada uno y cuántos esperan
function ppPaseFilaExtra(P, pts) {
  const n = PP_PASE_R.extrasListos(pts, P.extra || 0), fila = document.createElement('button'); fila.type = 'button';
  fila.className = 'pp-pase-extra' + (n ? ' pp-listo' : '');
  fila.innerHTML = `<b>${tr('Escalones extra')}</b>${ppPremioCandyHtml(PP_PASE_R.premioExtra(P.premium), 24)}<small>${n ? tr('{n} por recoger', { n }) : tr('Cada {n} puntos después del último', { n: PP_PASE_R.CFG.porEscalon })}</small>`;
  fila.onclick = () => ppPaseRecoge(ppPaseExtrasListos());
  return fila;
}
function ppPaseListaNueva(P, e, pts) {
  const lista = document.createElement('div'); lista.className = 'pp-pase';
  for (let k = 1; k <= PP_PASE_R.CFG.escalones; k++) {
    const fila = document.createElement('div'); fila.className = 'pp-pase-fila' + (k <= e ? ' pp-hecho' : '');
    fila.innerHTML = `<i>${k}</i>`;
    for (const premium of [false, true]) {
      const caja = ppPaseCaja(P, e, k, premium);
      if (PP_PASE_R.exclusivo(k, premium)) caja.insertAdjacentHTML('beforeend', `<em class="pp-pase-solo">${tr('SOLO ESTE MES')}</em>`);
      fila.appendChild(caja);
    }
    lista.appendChild(fila);
  }
  lista.appendChild(ppPaseFilaExtra(P, pts));
  return lista;
}
function ppVentanaPaseNueva(repinta) {
  if (!repinta) ppTutorial('pase');
  const P = ppPaseAlDia(), e = ppEscalon(), pts = ppPasePuntos(), tema = ppPaseTema();
  const t = ppAbre(ppPaseCabeceraNueva(e, pts, tema), true);
  t.classList.add('pp-pase-ventana', 'pp-pase-nuevo');
  t.style.setProperty('--tema1', tema.color); t.style.setProperty('--tema2', tema.color2);
  ppVicBarra(SAVE.monedas);   // la barra de arriba de la victoria (js/victoria-panel.js)
  ppPaseFinal(t, P, e, PP_PASE_R.CFG.escalones);
  ppPaseDorado(t, P, tema);
  const n = ppPaseListos().length, todo = ppBoton(n ? tr('RECOGER TODO ({n})', { n }) : tr('Nada que recoger'), 'pp-btn2 pp-verde pp-pase-todo', () => ppPaseRecoge(ppPaseListos()));
  todo.disabled = !n; t.appendChild(todo);
  ppPaseMisiones(t);
  t.appendChild(ppPaseListaNueva(P, e, pts));
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  if (!repinta) setTimeout(() => { const l = $pp('.pp-pase'), f = l && (l.querySelector('.pp-listo') || l.children[Math.max(0, e - 1)]); if (l && f) l.scrollTop = f.offsetTop - l.offsetTop - 10; }, 0);
}
// el botón del lado del camino: escalón, anillo con lo que falta y cuántos premios esperan (js/ofertas.js, ppPintaLateral)
// Con los dos pases, debajo, cuántos puntos faltan para el próximo premio (tarea #187)
function ppPaseLado(b) {
  if (!b) return b;
  const falta = ppPaseFaltaPremio();
  if (falta !== null) b.insertAdjacentHTML('beforeend', `<small class="pp-lado-falta">${tr('a {n} pts', { n: falta })}</small>`);
  if (!ppPaseNuevo()) return b;
  const pts = ppPasePuntos(), C = PP_PASE_R.CFG, n = ppPaseListos().length;
  b.classList.add('pp-lado-pase');
  b.style.setProperty('--av', Math.round(100 * (C.porEscalon - PP_PASE_R.falta(pts)) / C.porEscalon) + '%');
  b.querySelector('b').textContent = tr('Esc. {e}', { e: ppEscalon() });
  if (n) b.dataset.n = n;
  return b;
}
// los puntos que faltan para el próximo premio: los del pase nuevo o los del de siempre (null con el de siempre completo)
const ppPaseFaltaPremio = () => (ppPaseNuevo() ? PP_PASE_R.faltaPremio(ppPasePuntos())
  : PP_PASE_R.faltaPremio(ppPaseAlDia().puntos, PP_CFG.pase.puntos, PP_CFG.pase.escalones));
// arriba de la ventana, el premio final (el gratis y el dorado del último escalón) mientras no llegas a él: abajo de la lista no se ve.
// Cajas sin data-k: RECOGER y el vuelo de iconos (js/pase.js, ppPaseRecoge) no las tocan
function ppPaseFinal(t, P, e, total) {
  if (e >= total) return;
  const caja = premium => `<div class="pp-pase-premio${premium ? ' pp-premium' : ''}">${ppPremioCandyHtml(ppPremioPaseCon(total, premium), 24)}`
    + `${premium && !P.premium ? '<s></s>' : ''}${PP_PASE_R.exclusivo(total, premium) ? `<em class="pp-pase-solo">${tr('SOLO ESTE MES')}</em>` : ''}</div>`;
  const d = document.createElement('div'); d.className = 'pp-pase-final';
  d.innerHTML = `<b>${tr('Premio final')}<small>${tr('Esc. {e}', { e: total })}</small></b>${caja(false)}${caja(true)}`;
  t.appendChild(d);
}
