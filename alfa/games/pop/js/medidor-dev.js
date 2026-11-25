// Fans of Pop · la utilidad «Medidor por partes» del panel DEV (alfa y desarrollo): enciende el medidor (js/medidor-partes.js), enseña
// los ms de JS que se lleva cada parte del dibujo de un nivel y deja quitar partes, y el desenfoque del panel de victoria, para ver en el
// contador de fps cuál hace caer los fps en ese aparato. Lo quitado vuelve al apagar el medidor o al recargar.
'use strict';
const PP_MEDIDOR_NOMBRES = Object.freeze({ fondo: 'Fondo y flotantes', bandeja: 'Bandeja', burbujas: 'Burbujas y caritas', arcoiris: 'Burbuja arcoíris', marcador: 'Marcador y equipo', efectos: 'Partículas y ataques', cortinilla: 'Cortinilla de jefe' });
const PP_SIN_DESENFOQUE = 'pp-sin-desenfoque';   // css/victoria.css: el panel de victoria sin su backdrop-filter
UTILIDADES_JUEGO.push({ titulo: 'Fans of Pop: medidor por partes', pinta(caja) {
  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props), M = PP_MEDIDOR;
  caja.append(el('p', { textContent: 'Juega el tablero que va mal con el medidor encendido. Los ms son lo que tarda el JS de cada parte; lo que cuesta en la gráfica no sale ahí: quita partes y mira cuánto suben los fps en el contador.', style: 'margin:4px 0;color:#cdb9ea' }));
  const fila = el('div', { className: 'fila' }), tabla = el('div', { style: 'font:12px/1.5 monospace' });
  const enciende = el('button', { onclick: () => { M.poner(!M.activo); if (!M.activo) { M.PARTES.forEach(p => M.quita(p, false)); document.body.classList.remove(PP_SIN_DESENFOQUE); } pinta(); } });
  const desenfoque = el('button', { onclick: () => { document.body.classList.toggle(PP_SIN_DESENFOQUE); pinta(); } });
  fila.append(enciende, desenfoque); caja.append(fila, tabla);
  function linea(r) {
    const b = el('button', { textContent: r.quitada ? 'Volver a pintar' : 'Quitar', onclick: () => { M.quita(r.parte, !r.quitada); pinta(); }, disabled: !M.activo });
    const d = el('div', { className: 'fila' }); d.append(el('span', { textContent: `${PP_MEDIDOR_NOMBRES[r.parte]}: ${r.quitada ? 'quitada' : r.ms.toFixed(2) + ' ms'}`, style: 'min-width:16em;display:inline-block' }), b);
    return d;
  }
  function pinta() {
    enciende.textContent = M.activo ? 'Apagar el medidor (vuelve todo)' : 'Encender el medidor';
    desenfoque.textContent = document.body.classList.contains(PP_SIN_DESENFOQUE) ? 'Volver a poner el desenfoque de la victoria' : 'Quitar el desenfoque de la victoria';
    const filas = M.lee(), total = filas.reduce((s, r) => s + r.ms, 0);
    tabla.replaceChildren(...(M.activo ? [...filas.map(linea), el('div', { textContent: `Total JS: ${total.toFixed(2)} ms · fps: ${typeof RENDIMIENTO !== 'undefined' && RENDIMIENTO.fps ? Math.round(RENDIMIENTO.fps) : '—'}` })] : []));
  }
  pinta();
  const reloj = setInterval(() => { if (!caja.isConnected) { clearInterval(reloj); return; } pinta(); }, 1000);
} });
