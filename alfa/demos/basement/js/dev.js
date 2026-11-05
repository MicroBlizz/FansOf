// Fans of Basement · utilidades del panel DEV. El panel DEV de core (core/js/sistema/desarrollo.js) solo existe en la alfa y en
// localhost, nunca en la web publicada: lo que se toca aquí es solo para probar (monedas de prueba y empezar de cero).
'use strict';
const UTILIDADES_JUEGO = [{ titulo: 'Fans of Basement: monedas de prueba', pinta(caja) {
  const estado = Object.assign(document.createElement('p'), { style: 'margin:4px 0;color:#ffe14a' });
  const pinta = () => { estado.textContent = 'Monedas ' + SAVE.progreso.monedas + ' · Récord: planta -' + SAVE.progreso.record; };
  const fila = document.createElement('div'); fila.className = 'fila';
  const boton = (txt, f) => fila.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: () => { f(); basGuarda(); pinta(); } }));
  boton('+100 monedas', () => { SAVE.progreso = { ...SAVE.progreso, monedas: SAVE.progreso.monedas + 100 }; });
  boton('+10000 monedas', () => { SAVE.progreso = { ...SAVE.progreso, monedas: SAVE.progreso.monedas + 10000 }; });
  boton('Empezar de cero', () => { SAVE.progreso = BAS.progresoNuevo(); });
  caja.append(estado, fila);
  pinta();
} }];
