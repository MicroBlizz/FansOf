// Fans of Pop · COMPAÑEROS ESCONDIDOS (dominio; tarea #294, ADR 199): en qué mundo y momento (de día = camino, de noche = Difícil) se
// esconde cada compañero, cada cuántos niveles sale la burbuja brillante (con garantía), qué rareza trae y cuál sale. Desde la tarea #329
// (ADR 205): qué pasa con la burbuja en la primera acción del nivel y cómo es el duelo por un compañero nuevo. Funciones puras:
// sin SAVE, reloj, DOM ni Math.random; el azar entra como función `azar()` que devuelve [0,1). Datos de los compañeros: js/companeros-datos.js.
'use strict';
const PP_ESC = (() => {
  const C = PP_COMP;
  // la pista de cada escondido: índice de su mundo en PP_MUNDOS (datos en js/regiones/) y momento. Un sitio (mundo + momento) solo lo ocupa uno.
  const DONDE = Object.freeze({
    ardilla: Object.freeze({ mundo: 0, momento: 'dia' }),
    pinguino: Object.freeze({ mundo: 2, momento: 'dia' }),
    osito: Object.freeze({ mundo: 2, momento: 'noche' }),
    cangrejo: Object.freeze({ mundo: 3, momento: 'dia' }),
    capibara: Object.freeze({ mundo: 3, momento: 'noche' }),
    mapache: Object.freeze({ mundo: 4, momento: 'noche' }),
    castor: Object.freeze({ mundo: 6, momento: 'dia' }),
    erizo: Object.freeze({ mundo: 6, momento: 'noche' }),
  });
  const CONSTANTES = Object.freeze({ frecuencia: 1 / 10, garantia: 15, rareza: Object.freeze({ c: 60, r: 28, e: 10, l: 2 }) });
  const ORDEN = Object.freeze(['c', 'r', 'e', 'l']);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const esEscondido = id => has(DONDE, id);
  const ids = () => Object.keys(DONDE);
  const pista = id => esEscondido(id) ? DONDE[id] : null;
  const entero = x => { const n = Math.floor(Number(x)); return Number.isFinite(n) && n >= 0 ? n : 0; };
  // ¿sale la burbuja brillante en este nivel? `sinBrillo` = niveles seguidos sin ninguna; devuelve si sale y el contador nuevo
  function sale(sinBrillo, azar) {
    const n = entero(sinBrillo);
    const si = n >= CONSTANTES.garantia || azar() < CONSTANTES.frecuencia;
    return Object.freeze({ sale: si, sinBrillo: si ? 0 : n + 1 });
  }
  // la rareza del que sale, según los pesos de cada 100
  function rareza(azar) {
    let x = azar() * 100;
    for (const r of ORDEN) { x -= CONSTANTES.rareza[r]; if (x < 0) return r; }
    return ORDEN[ORDEN.length - 1];
  }
  const elige1 = (lista, azar) => lista[Math.min(lista.length - 1, Math.floor(azar() * lista.length))];
  const nuevosDe = (tiene, mundo, momento, rar) => ids().filter(id => C.INFO[id].rar === rar && !has(tiene, id) && DONDE[id].mundo === mundo && DONDE[id].momento === momento);
  const repetidosDe = (tiene, rar) => Object.keys(tiene).filter(id => has(C.INFO, id) && C.INFO[id].rar === rar);
  // las rarezas a probar: la sacada primero y luego las demás de más común a más rara
  const probar = rar => [rar, ...ORDEN.filter(r => r !== rar)];
  // el compañero de la burbuja: { id, nuevo } o null. Un nuevo solo si se esconde en ese mundo y momento; si no, un repetido de los que ya tienes
  function elige(tiene, mundo, momento, azar) {
    const t = tiene || {};
    for (const r of probar(rareza(azar))) {
      const nuevos = nuevosDe(t, mundo, momento, r);
      if (nuevos.length) return Object.freeze({ id: elige1(nuevos, azar), nuevo: true });
      const reps = repetidosDe(t, r);
      if (reps.length) return Object.freeze({ id: elige1(reps, azar), nuevo: false });
    }
    return null;
  }
  /* ---------- el duelo por un compañero nuevo (tarea #329, ADR 205) ---------- */
  // cuánto se despista el rival según la rareza del compañero (de noche, la mitad) y el tablero: 6 filas de 2 a 6 burbujas
  const DUELO = Object.freeze({ fallo: Object.freeze({ c: 0.8, r: 0.55, e: 0.3, l: 0.08 }), noche: 0.5, minimo: 0.02, filas: 6, largo: Object.freeze([2, 6]),
    copias: Object.freeze({ nuevo: 1, duelo: 2, red: 1 }) });   // lo que se lleva: el nuevo; de un repetido, 2 copias ganando su duelo y 1 con la red
  // la primera acción del nivel (toque, martillo o bomba) en la casilla `i`: 'nada' (no hay burbuja), 'duelo' (es la burbuja y trae uno
  // nuevo: ventana y duelo), 'repetido' (trae uno que ya tienes y aún le sirve: ventana con duelo o red), 'regalo' (trae uno que ya
  // está al máximo, `lleno`: se da sin más, son monedas) o 'se-va' (cualquier otra cosa: se pierde la oportunidad)
  function primera(brillo, i) {
    if (!brillo) return 'nada';
    if (i !== brillo.i) return 'se-va';
    if (brillo.nuevo) return 'duelo';
    return brillo.lleno ? 'regalo' : 'repetido';
  }
  // cómo va un compañero que ya tienes (`x` = { est, rep }): sus estrellas, los repetidos guardados, los que pide la siguiente estrella,
  // los que le faltan para las 5 y si ya está `lleno` (otro repetido solo daría monedas)
  function progreso(x) {
    const precios = C.PRECIOS.repetidos, tope = precios.length + 1;
    const est = Math.min(tope, Math.max(1, entero(x && x.est))), rep = entero(x && x.rep);
    const faltan = Math.max(0, precios.slice(est - 1).reduce((a, n) => a + n, 0) - rep);
    return Object.freeze({ est, tope, rep, siguiente: precios[est - 1] || 0, faltan, lleno: faltan === 0 });
  }
  // el despiste del rival en el duelo por el compañero `id`
  function falloDuelo(id, momento) {
    const base = DUELO.fallo[has(C.INFO, id) ? C.INFO[id].rar : 'c'] || DUELO.fallo.c;
    return momento === 'noche' ? Math.max(DUELO.minimo, base * DUELO.noche) : base;
  }
  // el tablero del duelo: cuántas burbujas lleva cada una de las 6 filas
  function filasDuelo(azar) {
    const [a, b] = DUELO.largo;
    return Object.freeze(Array.from({ length: DUELO.filas }, () => a + Math.min(b - a, Math.floor(azar() * (b - a + 1)))));
  }
  return Object.freeze({ DONDE, CONSTANTES, DUELO, sale, rareza, elige, pista, esEscondido, ids, primera, progreso, falloDuelo, filasDuelo });
})();
