// Fans of Pop · COMPAÑEROS ESCONDIDOS (dominio; tarea #294, ADR 199): en qué mundo y momento (de día = camino, de noche = Difícil) se
// esconde cada compañero, cada cuántos niveles sale la burbuja brillante (con garantía), qué rareza trae y cuál sale. Funciones puras:
// sin SAVE, reloj, DOM ni Math.random; el azar entra como función `azar()` que devuelve [0,1). Datos de los compañeros: js/companeros-datos.js.
'use strict';
const PP_ESC = (() => {
  const C = PP_COMP;
  // la pista de cada escondido: índice de su mundo en PP_MUNDOS (js/niveles.js) y momento. Un sitio (mundo + momento) solo lo ocupa uno.
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
  return Object.freeze({ DONDE, CONSTANTES, sale, rareza, elige, pista, esEscondido, ids });
})();
