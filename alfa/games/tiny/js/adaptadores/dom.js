// Tiny Fans · adaptador · DOM: las tres ayudas de página que usan todas las pantallas y ventanas. TN.$ busca, TN.esc escapa un texto
// para meterlo en HTML y TN.crea monta un elemento. La capa donde se monta la interfaz es #tn-capa (TN.capa()). Dueño: N1 (arquitectura).
'use strict';
TN.$ = selector => document.querySelector(selector);
TN.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// TN.crea('button', { className: 'tn-boton', textContent: tr('Salir'), onclick: fn }, hijo1, hijo2…)
TN.crea = (etiqueta, props = {}, ...hijos) => {
  const e = Object.assign(document.createElement(etiqueta), props);
  e.append(...hijos);
  return e;
};
TN.capa = () => document.getElementById('tn-capa');
