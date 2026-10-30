// Fans of Rouflage · RENDIMIENTO de la partida: avisa a core (RENDIMIENTO) de cuándo empieza y acaba una partida, y le da lo que pesa.
// Core mide los fps y los manda solo si el jugador deja encendido «Datos de partida anónimos» (DATOS.activo()); aquí no se envía nada.
'use strict';
let _midiendo = false, _rendT = 0, _fase = null;
function midePartida() {
  if (_fase !== J.fase) { _fase = J.fase; REPORTE.suceso('fase', { id: J.fase, modo: J.modo }); }   // la caja negra: cada cambio de fase de la partida
  const jugando = J.fase === 'prep' || J.fase === 'caza' || J.fase === 'cuenta';
  if (jugando && !_midiendo) { _midiendo = true; RENDIMIENTO.activar({ mostrar: false }); }
  else if (!jugando && _midiendo) { _midiendo = false; RENDIMIENTO.parar(); }
  if (!_midiendo || J.pausa) return;
  const ahora = performance.now(); if (ahora - _rendT < 1000) return; _rendT = ahora;   // los máximos se apuntan una vez por segundo
  RENDIMIENTO.dato('entes', J.entes ? J.entes.length : 0);
}
