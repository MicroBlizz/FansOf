// Fans of Pop · LOS COMBOS, LO QUE SE VE (tarea 396, ADR 234; las cuentas en js/combos.js):
// · ppComboLinea(T): la línea de la victoria con tu mejor combo del nivel y, si lo has batido, «¡Récord nuevo!» (js/pantalla-victoria.js).
// · ppComboLogros(): la caja «Logros de combo» de la ventana del Pase, debajo de las misiones (js/pase-pantalla.js): una fila por logro con
//   su barrita, COBRAR cuando está listo y Hecho al cobrarlo. Los de título dan uno de perfil que no se compra (Perfil → Título).
'use strict';
function ppComboLinea(T) {
  if (!T || !(T.comboMax >= 3)) return '';
  const record = T.comboRecord ? ` · <b>${tr('¡Récord nuevo!')}</b>` : '';
  return `<div class="pp-gana-tk">${tr('Mejor combo: x{n}', { n: T.comboMax })}${record}</div>`;
}
const ppComboPremio = r => (r.monedas ? tr('+{n} monedas', { n: r.monedas }) : tr('Título «{t}»', { t: tr(r.titulo) }));
function ppComboFila(l) {
  const t = document.createElement('div'), pct = Math.round(100 * Math.min(1, l.prog / l.goal));
  t.className = 'pp-pase-mision' + (l.cobrada ? ' pp-cogido' : l.listo ? ' pp-listo' : '');
  t.innerHTML = `<span>${tr(l.txt)}<br><small>${ppComboPremio(l.r)}</small></span><b class="pp-pase-mis-barra"><b style="width:${pct}%"></b></b>`;
  if (!l.listo) t.insertAdjacentHTML('beforeend', `<i>${l.prog}/${l.goal}</i>`);
  if (l.listo && !l.cobrada) t.appendChild(ppBoton(tr('COBRAR'), 'pp-btn2 pp-verde', () => { PP_COMBO.cobrar(l.id); play('ppPremio'); ppPaseRepinta(); }));
  else if (l.cobrada) t.insertAdjacentHTML('beforeend', `<em>${tr('Hecho')}</em>`);
  return t;
}
function ppComboLogros() {
  const caja = document.createElement('div'); caja.className = 'pp-pase-mis';
  caja.innerHTML = `<p class="pp-pase-mis-tit">${tr('Logros de combo')}</p>`;
  const fila = document.createElement('div'); fila.className = 'pp-pase-mis-fila';
  for (const l of PP_COMBO.logros()) fila.appendChild(ppComboFila(l));
  caja.appendChild(fila);
  return caja;
}
