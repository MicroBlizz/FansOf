// Fans of Pop · RENDIMIENTO de la partida (tarea #339): avisa al medidor de core (RENDIMIENTO, core/js/sistema/rendimiento.js) de cuándo
// empieza y acaba cada nivel, duelo o memoria, y le da lo que ayuda a leer una bajada de fps (pantalla, nivel, tablero, efectos, cortinilla).
// Core mide y manda el resumen solo si el jugador deja encendido «Datos de partida anónimos» (DATOS.activo()); aquí no se envía nada.
// El contador de fps solo se ve en la alfa y en desarrollo. Lo llama el bucle (ppFotograma, js/principal.js) en cada fotograma.
'use strict';
const PP_RENDIMIENTO = (() => {
  let actual = null, ultimoDato = 0;
  const tableroDe = p => (p === 'sala' ? PP_P && PP_P.T : p === 'duelo' ? PP_DUELO && PP_DUELO.T : p === 'memoria' ? PP_MEM && PP_MEM.T : null);
  function empieza(j) {
    RENDIMIENTO.activar({ mostrar: !!(NUCLEO.alfa || NUCLEO.desarrollo) });
    RENDIMIENTO.dato(j.pantalla, 1);   // en qué pantalla: extra.sala, extra.duelo o extra.memoria = 1
    RENDIMIENTO.dato('lado', j.tablero.n);
    if (j.pantalla === 'sala' && PP_P) { RENDIMIENTO.dato('nivel', PP_P.nivel + 1); RENDIMIENTO.dato('jefe', j.tablero.tipo === 'jefe' ? 1 : 0); }
  }
  // los máximos de lo que más pinta, una vez por segundo
  function apunta(ahora) {
    if (ahora - ultimoDato < 1000) return;
    ultimoDato = ahora;
    RENDIMIENTO.dato('particulas', PP_FX.parts.length);
    RENDIMIENTO.dato('efectos', PP_FX.saltos.length + PP_FX.textos.length + PP_FX.vuelos.length + PP_FX.ondas.length);
    RENDIMIENTO.dato('cortinilla', ppCortActiva() ? 1 : 0);
  }
  function mira(ahora) {
    const j = PP_REND_REGLAS.enJuego(PP_PANT.actual, tableroDe(PP_PANT.actual)), que = PP_REND_REGLAS.paso(actual, j);
    if (que === 'para' || que === 'cambia') RENDIMIENTO.parar();
    if (que === 'empieza' || que === 'cambia') empieza(j);
    actual = j;
    if (actual) apunta(ahora);
  }
  return { mira };
})();
