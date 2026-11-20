// Fans of Pinball · adaptador · DEV: los ganchos de prueba (PB.dev), como TN.dev de Tiny. Con ellos una prueba mueve la mesa sin dedos ni
// esperas: nueva({ semilla, modo… }) crea una partida, avanza(segundos, entrada) da pasos de física a mano con la misma entrada
// ({ izquierda, derecha }) y foto() lee lo que hay. Si la pantalla ya tiene su partida, usa(partida) hace que los ganchos trabajen
// sobre ella. Cada módulo puede añadir botones para el panel DEV con PB.dev.boton('texto', fn); la sección del panel la monta principal.js.
'use strict';
PB.dev = (() => {
  const botones = [];
  let partida = null;
  const boton = (texto, fn) => { botones.push([texto, fn]); };
  // una partida nueva con estas opciones (semilla 1 e historia si no se dice): PB.ok(partida) o el error del dominio
  function nueva(opciones = {}) {
    const r = PB.Partida.nueva(AJUSTES, { semilla: 1, ...opciones });
    if (r.ok) partida = r.valor;
    return r;
  }
  const usa = p => { partida = p; };
  // avanza `segundos` de física con la misma entrada en cada paso; devuelve todos los eventos
  function avanza(segundos, entrada = { izquierda: false, derecha: false }) {
    if (!partida) nueva();
    const n = Math.round(segundos * AJUSTES.simulacion.pasosPorSegundo), dt = 1 / AJUSTES.simulacion.pasosPorSegundo, eventos = [];
    for (let i = 0; i < n; i++) eventos.push(...partida.paso(dt, entrada));
    return eventos;
  }
  const foto = () => (partida ? partida.foto() : null);
  return { boton, botones: () => botones.slice(), nueva, usa, avanza, foto, get partida() { return partida; } };
})();
