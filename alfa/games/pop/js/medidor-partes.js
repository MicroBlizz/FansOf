// Fans of Pop · el MEDIDOR POR PARTES del panel DEV: para buscar qué parte del dibujo de un nivel hace caer los fps en un aparato.
// Encendido, apunta cuántos ms de JS se lleva cada parte de ppPintaSala (js/pintar.js) y deja quitar cualquiera de ellas para ver en
// el contador de fps cuánto cuesta de verdad en la gráfica (lo que se pinta en la GPU no sale en los ms de JS). También quita el
// desenfoque del panel de victoria (css/victoria.css), que la gráfica rehace en cada fotograma mientras el lienzo se mueve detrás.
// Apagado no hace nada: pinta(parte) siempre dice que sí y marca() vuelve enseguida. Solo lo usa el panel DEV (js/dev.js).
'use strict';
// las cuentas, sin reloj propio (se le pasa): ms por fotograma de cada parte y qué partes no se pintan
function ppMedidorCrea(reloj) {
  const PARTES = Object.freeze(['fondo', 'bandeja', 'burbujas', 'arcoiris', 'marcador', 'efectos', 'cortinilla']);
  let activo = false, desde = 0, fotogramas = 0, suma = {};
  const quitadas = new Set();
  const poner = on => { activo = !!on; fotogramas = 0; suma = {}; };
  // al empezar cada fotograma de la sala
  function empieza() { if (!activo) return; fotogramas++; desde = reloj(); }
  // al acabar una parte: lo que ha tardado desde la marca anterior
  function marca(parte) {
    if (!activo) return;
    const ahora = reloj(); suma[parte] = (suma[parte] || 0) + (ahora - desde); desde = ahora;
  }
  const pinta = parte => !quitadas.has(parte);
  function quita(parte, si) { if (!PARTES.includes(parte)) return false; if (si) quitadas.add(parte); else quitadas.delete(parte); return true; }
  // los ms por fotograma de cada parte desde la última lectura (y vuelve a contar)
  function lee() {
    const n = Math.max(1, fotogramas), r = PARTES.map(p => ({ parte: p, ms: (suma[p] || 0) / n, quitada: quitadas.has(p) }));
    fotogramas = 0; suma = {}; return r;
  }
  return { PARTES, poner, empieza, marca, pinta, quita, lee, get activo() { return activo; }, get quitadas() { return [...quitadas]; } };
}
const PP_MEDIDOR = ppMedidorCrea(() => performance.now());
