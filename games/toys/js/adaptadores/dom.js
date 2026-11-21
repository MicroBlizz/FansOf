// Fans of Toys · adaptador · DOM: las ayudas de página que usan todas las pantallas. TY.crea monta un elemento, TY.capa() es donde se
// monta la interfaz (#ty-capa) y TY.cuenta hace subir un número poco a poco (o lo pone de golpe si las animaciones están apagadas).
'use strict';
TY.crea = (etiqueta, props = {}, ...hijos) => {
  const e = Object.assign(document.createElement(etiqueta), props);
  e.append(...hijos.filter(h => h !== null && h !== undefined && h !== false));
  return e;
};
TY.capa = () => document.getElementById('ty-capa');
TY.animado = true;   // las pruebas lo apagan para no esperar
TY.espera = ms => new Promise(listo => setTimeout(listo, TY.animado ? ms : 0));
// escribe en `elemento` un número que sube de 0 a `hasta` en `ms`
TY.cuenta = (elemento, hasta, ms = 500) => new Promise(listo => {
  if (!TY.animado) { elemento.textContent = hasta; return listo(); }
  const inicio = performance.now();
  const paso = ahora => {
    const t = Math.min(1, (ahora - inicio) / ms);
    elemento.textContent = Math.round(hasta * t);
    if (t < 1) requestAnimationFrame(paso); else listo();
  };
  requestAnimationFrame(paso);
});
