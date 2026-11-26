// Fans of Pop · la utilidad «Prueba de rendimiento» del panel DEV (tarea 404; alfa y desarrollo): lanza la prueba que juega Pop solo
// (js/banco-juego.js) navegando a ?banco=1&nube=0, completa o corta (&corta=1). Al acabar vuelve y enseña la tabla (js/banco-vista.js).
'use strict';
UTILIDADES_JUEGO.push({ titulo: 'Fans of Pop: prueba de rendimiento', pinta(caja) {
  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  const lanza = corta => { location.href = PP_BANCO_URL.urlBanco(location.href, corta); };
  caja.append(el('p', { textContent: 'Pop se juega solo y mide los fps de cada escenario (niveles, victoria, derrota, duelo y memoria), con todo, con ahorro y quitando una parte cada vez. La completa dura unos 5 minutos; la corta, unos 50 segundos. Usa una partida de usar y tirar con la cuenta apagada: la tuya no se toca.', style: 'margin:4px 0;color:#cdb9ea' }));
  const fila = el('div', { className: 'fila' });
  fila.append(el('button', { textContent: 'Prueba completa', onclick: () => lanza(false) }), el('button', { textContent: 'Prueba corta', onclick: () => lanza(true) }));
  caja.append(fila);
} });
