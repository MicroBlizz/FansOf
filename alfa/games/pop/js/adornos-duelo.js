// Fans of Pop · LOS ADORNOS DEL DUELO (dominio; tarea #41, ADR 130, nodo n8): las reglas de lo que se luce en partida con el perfil de
// jugador: lanzar pegatinas (y cuáles se aceptan del rival), qué efecto de pop sale en cada pop y cómo entra cada panel en el VS.
// Funciones puras: sin reloj (el momento llega como `ahora`, en segundos), azar, SAVE, red ni dibujo. El dibujo y los botones, en
// js/duelo-adornos.js. Los errores son resultados con nombre: no_la_tienes, espera, no_vale.
'use strict';
const PP_ADORNOS = Object.freeze((() => {
  const PAUSA = 2;   // segundos entre pegatina y pegatina (para que nadie llene la pantalla del otro)
  const ok = v => Object.freeze({ ok: true, ...v });
  const error = e => Object.freeze({ ok: false, error: e });
  const tiene = (perfil, id) => !!(perfil && Array.isArray(perfil.pegatinas) && typeof id === 'string' && perfil.pegatinas.includes(id));
  const libre = (ultimo, ahora) => ultimo === null || ultimo === undefined || ahora - ultimo >= PAUSA;
  // lanzar una de tus pegatinas: solo las que llevas puestas y no más de una cada PAUSA segundos
  function lanzar(perfil, id, ultimo, ahora) {
    if (!tiene(perfil, id)) return error('no_la_tienes');
    if (!libre(ultimo, ahora)) return error('espera');
    return ok({ id, mensaje: Object.freeze({ t: 'pegatina', id }) });
  }
  // la pegatina que manda el rival: solo una de las que lleva en su perfil (el comprobado por el servidor) y con la misma pausa
  function recibir(perfilRival, m, ultimo, ahora) {
    if (!m || m.t !== 'pegatina' || !tiene(perfilRival, m.id)) return error('no_vale');
    if (!libre(ultimo, ahora)) return error('espera');
    return ok({ id: m.id });
  }
  // el efecto de pop de quien revienta: el tuyo, el de tu rival (persona) o el normal (el CEO no compra)
  function efectoDe(quien, mio, rival) {
    const p = quien === 'yo' ? mio : quien === 'rival' ? rival : null;
    return (p && typeof p.efecto === 'string' && p.efecto) || 'normal';
  }
  // cómo está un panel del VS mientras entra (`a` de 0 a 1): desplazamiento hacia fuera de su lado (dx, en px, ya con su signo
  // aplicado por quien pinta), altura (dy), giro (vueltas en radianes) y escala. La normal se desliza desde su lado.
  const ENTRADAS = Object.freeze({
    normal: a => ({ dx: (1 - a) * 320, dy: 0, giro: 0, escala: 1 }),
    salto: a => ({ dx: (1 - a) * 320, dy: -Math.sin(a * Math.PI) * 140, giro: 0, escala: 1 }),
    giro: a => ({ dx: (1 - a) * 200, dy: 0, giro: (1 - a) * Math.PI * 2, escala: 0.3 + 0.7 * a }),
    nube: a => ({ dx: 0, dy: (1 - a) * 520, giro: 0, escala: 1 }),
  });
  function entrada(tipo, a) {
    const k = Math.min(1, Math.max(0, a));
    return Object.freeze((ENTRADAS[tipo] || ENTRADAS.normal)(k));
  }
  return { PAUSA, lanzar, recibir, efectoDe, entrada };
})());
