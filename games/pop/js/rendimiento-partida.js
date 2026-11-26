// Fans of Pop · RENDIMIENTO de la partida (tarea #339): avisa al medidor de core (RENDIMIENTO, core/js/sistema/rendimiento.js) de cuándo
// empieza y acaba cada momento de cada nivel, duelo o memoria (sin empezar, jugando, victoria, derrota o fin) y le da lo que ayuda a leer
// una bajada de fps: pantalla, momento, nivel jugado con su mundo y su modo, tablero, efectos, cortinilla y qué compañeros han actuado.
// Core mide y manda el resumen solo si el jugador deja encendido «Datos de partida anónimos» (DATOS.activo()); aquí no se envía nada.
// El contador de fps solo se ve en la alfa y en desarrollo. Lo llama el bucle (ppFotograma, js/principal.js) en cada fotograma.
'use strict';
const PP_RENDIMIENTO = (() => {
  let actual = null, ultimoDato = 0, actuan = {};
  const tableroDe = p => (p === 'sala' ? PP_P && PP_P.T : p === 'duelo' ? PP_DUELO && PP_DUELO.T : p === 'memoria' ? PP_MEM && PP_MEM.T : null);
  // cómo va la partida de cada pantalla, para PP_REND_REGLAS.momento: el nivel acaba ganado con el tablero limpio (o el duelo del nivel
  // ganado) y perdido si acaba sin limpiarlo; el duelo del menú, con su D.fin; la memoria no se gana ni se pierde: acaba
  function finSala(T) {
    if (T.nim) return T.nim.fin || null;
    return ppResuelto(T) ? 'gana' : T.hecho ? 'pierde' : null;
  }
  function estadoDe(p, T) {
    if (p === 'sala') return { fin: finSala(T), empezado: !!T.tocado };
    if (p === 'duelo') return { fin: PP_DUELO.fin || null, empezado: T.pops > 0 };
    return { fin: PP_MEM.fase === 'fin' ? 'fin' : null, empezado: true };
  }
  // el nivel que de verdad se juega (no por el que se va), su mundo y su modo: difícil (dif 1) o pesadilla (dif 2), duelo del nivel, duelo sorpresa
  function describeNivel(T) {
    const d = T.d || {};
    RENDIMIENTO.dato('nivel_jugado', (d.g || 0) + 1); RENDIMIENTO.dato('mundo', (d.mundo || 0) + 1); RENDIMIENTO.dato('dif', d.dif || 0);
    RENDIMIENTO.dato('jefe', T.tipo === 'jefe' ? 1 : 0); RENDIMIENTO.dato('nim', T.nim ? 1 : 0); RENDIMIENTO.dato('sorpresa', d.esc ? 1 : 0);
  }
  // en qué se juega: pantalla y momento (extra.sala y extra.juega = 1, por ejemplo), lado del tablero, densidad del lienzo y, en los niveles, cuál
  function describe(j) {
    RENDIMIENTO.dato(j.pantalla, 1);
    RENDIMIENTO.dato(j.momento, 1);
    RENDIMIENTO.dato('lado', j.tablero.n);
    RENDIMIENTO.dato('lienzo', PP_V.dpr * 100);   // la densidad con la que pinta el lienzo (x100): la del aparato o la del ahorro (js/ahorro-juego.js)
    if (j.pantalla === 'sala') describeNivel(j.tablero);
    for (const id in actuan) RENDIMIENTO.dato('comp_' + id, actuan[id]);   // cuántas veces ha actuado cada compañero en este resumen
  }
  // una vez por segundo: qué se juega (otra vez, porque core empieza otro resumen al cambiar el ahorro, ADR 218) y los máximos de lo que más pinta
  function apunta(j, ahora) {
    if (ahora - ultimoDato < 1000) return;
    ultimoDato = ahora;
    describe(j);
    RENDIMIENTO.dato('particulas', PP_FX.parts.length);
    RENDIMIENTO.dato('efectos', PP_FX.saltos.length + PP_FX.textos.length + PP_FX.vuelos.length + PP_FX.ondas.length);
    RENDIMIENTO.dato('cortinilla', ppCortActiva() ? 1 : 0);
  }
  function mira(ahora) {
    const p = PP_PANT.actual, T = tableroDe(p), R = PP_REND_REGLAS;
    const j = R.enJuego(p, T, T ? R.momento(estadoDe(p, T)) : undefined), que = R.paso(actual, j);
    if (que === 'para' || que === 'cambia') RENDIMIENTO.parar();
    if (que === 'empieza' || que === 'cambia') { RENDIMIENTO.activar({ mostrar: !!(NUCLEO.alfa || NUCLEO.desarrollo) }); ultimoDato = -Infinity; actuan = {}; }
    actual = j;
    if (actual) apunta(actual, ahora);
  }
  // un compañero actúa (ppFxHabilidad, js/efectos.js): se cuenta en el resumen que se está midiendo
  function actua(id) { if (actual && id) actuan[id] = (actuan[id] || 0) + 1; }
  if (typeof hook === 'function') {
    hook('ahorro', () => { ultimoDato = -Infinity; actuan = {}; });   // el resumen nuevo que empieza core al cambiar el ahorro, ya descrito en el fotograma siguiente
    hook('pp-companero', actua);
  }
  return { mira, actua };
})();
