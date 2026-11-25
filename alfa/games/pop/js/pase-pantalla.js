// Fans of Pop · PANTALLA DEL PASE NUEVO (tarea #165, ADR 165; rehecha con el boceto C «Escaparate y carril» que eligió Pepins el
// 20-11-2026, reporte 32). De arriba abajo: el ESCAPARATE del tema del mes (lo que solo da este mes, a lo grande, y los botones del Pase
// dorado y del Dorado+), la barra del escalón, el CARRIL de escalones en horizontal (gratis arriba, dorado abajo, se desliza con el dedo),
// las 3 misiones del día como tarjetas y, fijos abajo, VOLVER y RECOGER TODO. Recoger y volar a la barra lo hace js/pase.js
// (ppPaseRecoge); lo del juego, js/pase-nuevo.js; las reglas, js/pase-reglas.js.
'use strict';
const ppPaseDias = () => {
  const finMes = new Date(); finMes.setMonth(finMes.getMonth() + 1, 1); finMes.setHours(0, 0, 0, 0);
  return Math.ceil((finMes - Date.now()) / 86400000);
};
const ppPaseAvance = pts => Math.round(100 * (PP_PASE_R.CFG.porEscalon - PP_PASE_R.falta(pts)) / PP_PASE_R.CFG.porEscalon);
// los escalones con premio dorado que solo sale este mes (el compañero del 60 y la bandeja del 40), del más gordo al más pequeño
const ppPaseExclusivos = () => Array.from({ length: PP_PASE_R.CFG.escalones }, (_, i) => i + 1).filter(k => PP_PASE_R.exclusivo(k, true)).reverse();
const ppPaseSoloHtml = () => `<em class="pp-pase-solo">${tr('SOLO ESTE MES')}</em>`;
/* ---------- el escaparate ---------- */
function ppPaseEscaparate(P, tema) {
  const d = document.createElement('div'); d.className = 'pp-pase-hero';
  const vitrina = k => {
    const p = ppPremioPaseCon(k, true);   // sin el flag companeros, el del 60 son solo perlas: no es de este mes y no se luce
    return p.bandeja || p.companero ? `<div class="pp-pase-vitrina">${ppPremioCandyHtml(p, 58)}${ppPaseSoloHtml()}</div>` : '';
  };
  d.innerHTML = `<div class="pp-pase-hero-txt"><p class="pp-pase-tema">${tr('Pase de Pop')}</p><h2>${tr(tema.nombre)}</h2>
    <span class="pp-pase-dias">${tr('quedan {d} días', { d: ppPaseDias() })}</span></div>
    <div class="pp-pase-vitrinas">${ppPaseExclusivos().map(vitrina).join('')}</div>`;
  d.appendChild(ppPaseCompraZona(P));
  return d;
}
// comprar el Pase dorado (4,99 €) o el Dorado+ (9,99 €, 10 escalones ya); si ya lo tienes o eres menor (tarea #254), solo un aviso sin euros
function ppPaseCompraZona(P) {
  const z = document.createElement('div'); z.className = 'pp-pase-compra';
  if (P.premium || ppVentaCerrada()) {
    z.innerHTML = `<p class="pp-pase-aviso">${P.premium ? tr('¡Tienes el Pase dorado!') : tr('No disponible para menores')}</p>`;
    return z;
  }
  const oro = ppBoton('', 'pp-btn2 pp-oro pp-pase-oro', () => ppPaseCompra(false));
  oro.innerHTML = `${tr('PASE DORADO')}<small>${PP_CFG.pase.precio}</small>`;
  const plus = ppBoton('', 'pp-btn2 pp-pase-plus', () => ppPaseCompra(true));
  plus.innerHTML = `${tr('Dorado+ {p}', { p: PP_CFG.pase.plus.precio })}<small>${tr('y 10 escalones ya')}</small>`;
  z.append(oro, plus);
  return z;
}
/* ---------- la barra del escalón ---------- */
function ppPaseEje(e, pts) {
  const C = PP_PASE_R.CFG, d = document.createElement('div'); d.className = 'pp-pase-eje';
  const completo = e >= C.escalones ? `<small class="pp-pase-completo">${tr('¡Pase completo! Sigue jugando: escalones extra')}</small>` : '';
  d.innerHTML = `<b>${tr('Escalón {e} de {t}', { e, t: C.escalones })}</b><span class="pp-pase-barra"><span style="width:${ppPaseAvance(pts)}%"></span>`
    + `<i>${C.porEscalon - PP_PASE_R.falta(pts)}/${C.porEscalon}</i></span>${completo}
    <small>${tr('Hoy, jugando: {n} de {t} puntos (las misiones, aparte)', { n: ppPaseHoy().n, t: C.topeDia })}</small>`;
  return d;
}
/* ---------- el carril de escalones ---------- */
// una columna: el premio gratis arriba, el número en el raíl y el dorado abajo
function ppPaseColumna(P, e, k) {
  const col = document.createElement('div');
  col.className = 'pp-pase-col' + (k <= e ? ' pp-hecho' : '') + (k === e + 1 ? ' pp-aqui' : '');
  col.appendChild(ppPaseCaja(P, e, k, false, 36));
  col.insertAdjacentHTML('beforeend', `<i class="pp-pase-n">${k}</i>`);
  const dorado = ppPaseCaja(P, e, k, true, 36);
  if (PP_PASE_R.exclusivo(k, true)) dorado.insertAdjacentHTML('beforeend', ppPaseSoloHtml());
  col.appendChild(dorado);
  return col;
}
// tras el último escalón, la columna de los escalones extra: lo que da cada uno y cuántos esperan
function ppPaseColumnaExtra(P, pts) {
  const n = PP_PASE_R.extrasListos(pts, P.extra || 0), b = document.createElement('button'); b.type = 'button';
  b.className = 'pp-pase-extra' + (n ? ' pp-listo' : '');
  b.innerHTML = `<b>${tr('Escalones extra')}</b>${ppPremioCandyHtml(PP_PASE_R.premioExtra(P.premium), 30)}<small>${n ? tr('{n} por recoger', { n }) : tr('Cada {n} puntos después del último', { n: PP_PASE_R.CFG.porEscalon })}</small>`;
  b.onclick = () => ppPaseRecoge(ppPaseExtrasListos());
  return b;
}
function ppPaseCarril(P, e, pts) {
  const carril = document.createElement('div'); carril.className = 'pp-pase-carril';
  carril.innerHTML = `<div class="pp-pase-col pp-pase-etiquetas"><b class="pp-pase-et-g">${tr('GRATIS')}</b><b class="pp-pase-et-d">${tr('DORADO')}</b></div>`;
  for (let k = 1; k <= PP_PASE_R.CFG.escalones; k++) carril.appendChild(ppPaseColumna(P, e, k));
  carril.appendChild(ppPaseColumnaExtra(P, pts));
  return carril;
}
// al abrir, el carril se coloca en el primer premio que se puede recoger, en el escalón al que vas o, completo, en los escalones extra
function ppPaseCentraCarril() {
  const c = $pp('.pp-pase-carril'), f = c && (c.querySelector('.pp-listo') || c.querySelector('.pp-aqui') || c.querySelector('.pp-pase-extra'));
  const col = f && f.closest('.pp-pase-col, .pp-pase-extra'), et = c && c.querySelector('.pp-pase-etiquetas');
  if (col) c.scrollLeft = col.offsetLeft - (et ? et.offsetWidth : 0) - 8;
}
/* ---------- las misiones del día ---------- */
function ppPaseTarjetaMision(m) {
  const t = document.createElement('div');
  t.className = 'pp-pase-mision' + (m.cobrada ? ' pp-cogido' : m.listo ? ' pp-listo' : '');
  t.innerHTML = `<span>${tr(m.txt)}</span><i>${m.prog}/${m.goal}</i>`;
  if (m.listo && !m.cobrada) t.appendChild(ppBoton(tr('COBRAR'), 'pp-btn2 pp-verde', () => { PP_PASE_MIS.cobrar('d', m.id); play('ppPremio'); ppPaseRepinta(); }));
  else if (m.cobrada) t.insertAdjacentHTML('beforeend', `<em>${tr('Hecha')}</em>`);
  return t;
}
function ppPaseMisiones() {
  const caja = document.createElement('div'); caja.className = 'pp-pase-mis';
  caja.innerHTML = `<p class="pp-pase-mis-tit">${tr('Misiones de hoy')} <small>${tr('+{n} puntos cada una', { n: PP_PASE_R.CFG.puntos.mision })}</small></p>`;
  const fila = document.createElement('div'); fila.className = 'pp-pase-mis-fila';
  for (const m of PP_PASE_MIS.lista('d')) fila.appendChild(ppPaseTarjetaMision(m));
  caja.appendChild(fila);
  return caja;
}
/* ---------- la ventana ---------- */
function ppPasePie() {
  const pie = document.createElement('div'); pie.className = 'pp-pase-pie';
  const n = ppPaseListos().length, todo = ppBoton(n ? tr('RECOGER TODO ({n})', { n }) : tr('Nada que recoger'), 'pp-btn2 pp-verde pp-pase-todo', () => ppPaseRecoge(ppPaseListos()));
  todo.disabled = !n;
  pie.append(todo);   // volver va arriba a la izquierda, como en todas (tarea 346)
  return pie;
}
function ppVentanaPaseNueva(repinta) {
  if (!repinta) ppTutorial('pase');
  const P = ppPaseAlDia(), e = ppEscalon(), pts = ppPasePuntos(), tema = ppPaseTema();
  const t = ppAbre('', true);
  t.classList.add('pp-pase-ventana', 'pp-pase-nuevo');
  t.style.setProperty('--tema1', tema.color); t.style.setProperty('--tema2', tema.color2);
  ppVicBarra(SAVE.monedas);   // la barra de arriba de la victoria (js/victoria-panel.js)
  t.append(ppPaseEscaparate(P, tema), ppPaseEje(e, pts), ppPaseCarril(P, e, pts), ppPaseMisiones(), ppPasePie());
  ppBotonVolver(t, ppCierra, tr('Pase de Pop'));
  if (!repinta) setTimeout(ppPaseCentraCarril, 0);
}
// el botón del lado del camino: escalón, anillo con lo que falta y cuántos premios esperan (js/ofertas.js, ppPintaLateral)
// Con los dos pases, debajo, cuántos puntos faltan para el próximo premio (tarea #187)
function ppPaseLado(b) {
  if (!b) return b;
  const falta = ppPaseFaltaPremio();
  if (falta !== null) b.insertAdjacentHTML('beforeend', `<small class="pp-lado-falta">${tr('a {n} pts', { n: falta })}</small>`);
  if (!ppPaseNuevo()) return b;
  const n = ppPaseListos().length;
  b.classList.add('pp-lado-pase');
  b.style.setProperty('--av', ppPaseAvance(ppPasePuntos()) + '%');
  b.querySelector('b').textContent = tr('Esc. {e}', { e: ppEscalon() });
  if (n) b.dataset.n = n;
  return b;
}
// los puntos que faltan para el próximo premio: los del pase nuevo o los del de siempre (null con el de siempre completo)
const ppPaseFaltaPremio = () => (ppPaseNuevo() ? PP_PASE_R.faltaPremio(ppPasePuntos())
  : PP_PASE_R.faltaPremio(ppPaseAlDia().puntos, PP_CFG.pase.puntos, PP_CFG.pase.escalones));
// el pase de siempre (flag cerrado): arriba de la ventana, el premio final (el gratis y el dorado del último escalón) mientras no llegas a
// él. Cajas sin data-k: RECOGER y el vuelo de iconos (js/pase.js, ppPaseRecoge) no las tocan
function ppPaseFinal(t, P, e, total) {
  if (e >= total) return;
  const caja = premium => `<div class="pp-pase-premio${premium ? ' pp-premium' : ''}">${ppPremioCandyHtml(ppPremioPaseCon(total, premium), 24)}`
    + `${premium && !P.premium ? '<s></s>' : ''}${PP_PASE_R.exclusivo(total, premium) ? ppPaseSoloHtml() : ''}</div>`;
  const d = document.createElement('div'); d.className = 'pp-pase-final';
  d.innerHTML = `<b>${tr('Premio final')}<small>${tr('Esc. {e}', { e: total })}</small></b>${caja(false)}${caja(true)}`;
  t.appendChild(d);
}
