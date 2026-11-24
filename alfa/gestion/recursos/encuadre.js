// Fans Of · RECURSOS · encuadre al ampliar (pestaña Recursos de /gestion, su pantalla completa y el visor de lonchas): lo puro del zoom y del mover.
// Un encuadre es { escala, x, y }: la imagen se amplía «escala» veces desde su centro y se corre x, y píxeles. Los puntos van medidos desde
// el centro de la caja que la enseña. Sin DOM ni reloj: el adaptador (zoom.js) le pasa medidas, puntos y tiempos. Guía: docs/guia/herramientas/galeria.md
'use strict';
const ENCUADRE = (() => {
  const MIN = 1, MAX = 32;   // 1 = encajada; 32 veces deja ver cada píxel de una hoja grande
  const DOBLE_MS = 350, DOBLE_PX = 24, TOQUE_PX = 6;
  const RUEDA = 0.0015, LINEA = 16, PAGINA = 400;   // deltaMode 0 (píxeles), 1 (líneas) y 2 (páginas)
  const inicial = () => ({ escala: MIN, x: 0, y: 0 });
  const encajada = enc => enc.escala <= MIN;
  const limita = s => (Number.isFinite(s) ? Math.min(MAX, Math.max(MIN, s)) : MIN);

  // hasta dónde se corre en un eje: el centro de la imagen no pasa del borde de la caja, y si la ampliada es más grande que la caja,
  // su borde no pasa del centro de la caja (siempre queda imagen a la vista)
  const tope = (caja, medida, escala) => Math.max(caja, medida * escala) / 2;
  const entre = (v, t) => Math.min(t, Math.max(-t, v));
  /** El encuadre válido más cercano: escala entre MIN y MAX, y encajada del todo si no está ampliada. caja y medida: { ancho, alto } (la imagen sin ampliar) */
  function acota(enc, caja, medida) {
    const escala = limita(enc.escala);
    if (encajada({ escala })) return inicial();
    return { escala, x: entre(enc.x || 0, tope(caja.ancho, medida.ancho, escala)), y: entre(enc.y || 0, tope(caja.alto, medida.alto, escala)) };
  }
  /** Amplía «factor» veces alrededor de un punto (lo que estaba bajo el punto sigue bajo él, salvo lo que corte acota) */
  function zoomEn(enc, factor, punto, caja, medida) {
    const escala = limita(enc.escala * factor), k = escala / enc.escala;
    return acota({ escala, x: punto.x - (punto.x - enc.x) * k, y: punto.y - (punto.y - enc.y) * k }, caja, medida);
  }
  /** Corre la imagen dx, dy (encajada no se mueve) */
  const mueve = (enc, dx, dy, caja, medida) => acota({ escala: enc.escala, x: enc.x + dx, y: enc.y + dy }, caja, medida);
  /** Dos dedos: amplía lo que se separan y corre lo que se mueve su punto medio. antes y ahora: [{x, y}, {x, y}] */
  function pellizca(enc, antes, ahora, caja, medida) {
    const dist = ([a, b]) => Math.hypot(a.x - b.x, a.y - b.y), medio = ([a, b]) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const d0 = dist(antes), m0 = medio(antes), m1 = medio(ahora);
    const corrido = { escala: enc.escala, x: enc.x + m1.x - m0.x, y: enc.y + m1.y - m0.y };
    return zoomEn(corrido, d0 > 0 ? dist(ahora) / d0 : 1, m1, caja, medida);
  }
  /** Lo que amplía un paso de rueda: hacia arriba (deltaY < 0) acerca */
  function factorRueda(deltaY, deltaMode) {
    const px = (Number(deltaY) || 0) * (deltaMode === 1 ? LINEA : deltaMode === 2 ? PAGINA : 1);
    return Math.exp(-Math.max(-300, Math.min(300, px)) * RUEDA);
  }
  /** Un toque (o clic) es un dedo que se levanta casi donde bajó */
  const esToque = (desde, hasta) => Math.hypot(hasta.x - desde.x, hasta.y - desde.y) <= TOQUE_PX;
  /** Doble toque: dos toques seguidos en menos de DOBLE_MS y a menos de DOBLE_PX. toque: { t, x, y } */
  const esDoble = (anterior, toque) => !!anterior && toque.t - anterior.t <= DOBLE_MS && toque.t >= anterior.t && Math.hypot(toque.x - anterior.x, toque.y - anterior.y) <= DOBLE_PX;
  /** El transform de CSS de un encuadre (tras el que ya lleve el elemento, base) */
  const css = (enc, base = '') => `${base ? base + ' ' : ''}translate(${enc.x}px, ${enc.y}px) scale(${enc.escala})`;
  /** Si un paso de rueda es del zoom (y no debe mover la página): ya ampliada, o la escala cambia de verdad. Encajada y alejando, la rueda es de la página */
  const ruedaAmplia = (enc, factor) => !encajada(enc) || limita(enc.escala * factor) !== enc.escala;
  /** Las veces enteras que cabe una imagen (natural: { ancho, alto }) en una caja (su contenido, sin el relleno): 1 si no cabe ni una vez */
  const vecesEnteras = (caja, natural) => Math.max(1, Math.floor(Math.min(caja.ancho / (natural.ancho || 1), caja.alto / (natural.alto || 1))) || 1);
  /** Pasar a la siguiente (paso 1) o anterior (paso -1) de n, dando la vuelta; null si no hay ninguna */
  const siguiente = (n, i, paso) => (n > 0 ? (((i + paso) % n) + n) % n : null);
  /** Como siguiente, pero saltando las que no valen (vale(i) false); da la vuelta hasta i, y null si no vale ninguna */
  function siguienteQueVale(n, i, paso, vale) {
    for (let j = siguiente(n, i, paso), vueltas = 0; j !== null && vueltas < n; j = siguiente(n, j, paso), vueltas++) if (vale(j)) return j;
    return null;
  }
  return { MIN, MAX, ruedaAmplia, vecesEnteras, siguienteQueVale, inicial, encajada, limita, acota, zoomEn, mueve, pellizca, factorRueda, esToque, esDoble, css, siguiente };
})();
if (typeof module !== 'undefined') module.exports = ENCUADRE;   // en node (tests/gestion/) solo se carga
