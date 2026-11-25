// Fans Of · AHORRO DE BATERÍA (ADR 218): el interruptor común para que los juegos vayan fluidos en móviles modestos y gasten menos.
// Core guarda si está encendido en este aparato (vale para todos los juegos, como «Datos de partida anónimos»; viene apagado) y avisa
// al cambiarlo con fire('ahorro', encendido). Cada juego decide qué baja: engancha hook('ahorro', fn) o pregunta AHORRO.activo() al pintar,
// y AHORRO.densidad(dpr) le da la densidad de su lienzo. Se cambia en caliente: nada pide recargar.
// La fila de Opciones: AHORRO.fila(), u OPCIONES.lista({ filas: ['ahorro'] }). El panel DEV tiene un atajo (core/js/sistema/desarrollo.js).
'use strict';
const AHORRO = (() => {
  const CLAVE = 'fansof-ahorro', DENSIDAD_MAX = 1.5;
  const t = x => (typeof IDIOMA !== 'undefined' && IDIOMA.tr ? IDIOMA.tr(x) : x);
  const leer = () => { try { return localStorage.getItem(CLAVE) === 'si'; } catch (e) { return false; } };   // sin almacenamiento: apagado
  let on = leer();
  function poner(v) {
    if (!!v === on) return;
    on = !!v;
    try { localStorage.setItem(CLAVE, on ? 'si' : 'no'); } catch (e) { /* sin almacenamiento: vale para esta sesión */ }
    if (typeof fire === 'function') fire('ahorro', on);
  }
  // la densidad del lienzo: la del aparato, o como mucho DENSIDAD_MAX con el ahorro encendido
  const densidad = dpr => (on ? Math.min(dpr, DENSIDAD_MAX) : dpr);
  const fila = () => OPCIONES.interruptor(t('Ahorro de batería'), t('Más fluido en móviles modestos y gasta menos batería; se ve un poco menos nítido.'), () => on, poner);
  return Object.freeze({ activo: () => on, poner, cambia: () => poner(!on), densidad, fila, DENSIDAD_MAX });
})();
