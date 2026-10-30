// Fans of Jump · DATOS DE PARTIDA ANÓNIMOS (core/js/sistema/telemetria.js → servidor/74-jump-telemetria.sql): para saber dónde cae la gente,
// cuánto dura una partida y si la dificultad está bien cuando haya jugadores de verdad. Sin nombre ni cuenta: cada partida es un UUID al azar.
// Solo manda si el flag «jump-telemetria» está abierto y el jugador no ha apagado «Datos de partida anónimos» (está en Mi cuenta).
// Qué se manda: al empezar, la partida (reto y tutorial sí o no); en cada caída al agua o alcance de la ola, dónde y por qué; al acabar, el resumen.
'use strict';

TELEMETRIA.configurar({ rpc: 'enviar_jump', flag: 'jump-telemetria', descripcion: 'Mandar datos anónimos de cada partida de Fans of Jump (dónde cae la gente y cuánto dura) para afinar la dificultad' });

function telResumen(estado) {
  const J = JUEGO;
  return { estado, version: typeof VERSION !== 'undefined' ? String(VERSION) : '', alfa: !!NUCLEO.alfa, reto: !!RETO.activo, tutorial: !!tutoActivo() || !!J.tutoHecho,
    metros: J.metros, segundos: Math.round(J.t), puntos: J.puntos, saltos: J.saltos, perfectos: J.perfectos, rescatados: J.rescatados, zanas: J.zanas, seguidos: J.seguidos };
}
function telEmpieza() { JUEGO.tel = { id: TELEMETRIA.nueva(), n: 0 }; TELEMETRIA.estado(JUEGO.tel.id, telResumen('en curso')); }
// una caída: dónde (metros) y por qué (barro, ola, tortuga, crac, resbala)
function telCaida(causa) { const t = JUEGO.tel; if (t) TELEMETRIA.evento(t.id, { n: t.n++, m: JUEGO.metros, c: String(causa || 'barro').slice(0, 12) }); }
function telFin(estado) { const t = JUEGO.tel; if (t) { TELEMETRIA.estado(t.id, telResumen(estado), true); JUEGO.tel = null; } }
