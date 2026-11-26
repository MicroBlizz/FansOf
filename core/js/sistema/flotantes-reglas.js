// Fans Of · FLOTANTES_REGLAS: las reglas puras de los botones fijos de core que se mueven a un borde de la pantalla (tarea #362, ADR 217): qué
// borde queda al soltar, dónde va el elemento sin salirse ni meterse en las zonas seguras, cómo se aparta el que llega para no montarse en otro
// y a dónde va al moverlo desde el panel DEV. Sin DOM, sin almacenamiento y sin reloj: las usa la página (flotantes.js) y se prueban en Node
// (tests/core/flotantes.test.mjs).
// Un sitio es { borde, a, d }: el borde ('izq', 'der', 'arriba', 'abajo'), dónde cae el centro a lo largo del borde (a, de 0 a 1: de arriba abajo
// o de izquierda a derecha) y, solo en los sitios de serie, unos px más allá (d) para ir pegado a otro. Un rectángulo es { x, y, ancho, alto }.
// Una pantalla es { ancho, alto, seguro: { izq, der, arriba, abajo } } (las zonas seguras del móvil, en px).
'use strict';
const FLOTANTES_REGLAS = (() => {
  const BORDES = Object.freeze(['izq', 'der', 'arriba', 'abajo']);
  const lateral = b => b === 'izq' || b === 'der';   // en los bordes de los lados el elemento corre de arriba abajo
  const limita = (v, min, max) => Math.max(min, Math.min(max, v));
  const fraccion = v => limita(Math.round(v * 1000) / 1000, 0, 1);

  // ¿es un sitio bien formado? Lo guardado llega del navegador: se mira antes de usarlo
  const valido = s => !!s && BORDES.includes(s.borde) && Number.isFinite(s.a) && s.a >= 0 && s.a <= 1 && (s.d === undefined || Number.isFinite(s.d));

  // el borde más cerca del punto (x, y) en una pantalla de ancho × alto
  function bordeCercano(x, y, ancho, alto) {
    const d = { izq: x, der: ancho - x, arriba: y, abajo: alto - y };
    return BORDES.reduce((m, b) => (d[b] < d[m] ? b : m));
  }
  // el sitio que queda al soltar con el centro del elemento en (x, y)
  function sitioAlSoltar(x, y, pantalla) {
    const borde = bordeCercano(x, y, pantalla.ancho, pantalla.alto);
    return Object.freeze({ borde, a: fraccion(lateral(borde) ? y / pantalla.alto : x / pantalla.ancho) });
  }
  // el sitio al mandarlo a otro borde desde el panel DEV: en un borde de la misma orientación conserva su a (abajo a la derecha → arriba a la
  // derecha); si cambia de orientación, a media altura (o anchura). Sin sitio de antes, al medio
  function sitioAlMover(actual, borde) {
    const sigue = valido(actual) && lateral(actual.borde) === lateral(borde);
    return Object.freeze({ borde, a: sigue ? actual.a : 0.5 });
  }
  // entre qué valores puede ir la esquina de arriba a la izquierda: dentro de la pantalla, fuera de las zonas seguras y a `hueco` px del borde
  function limites(tam, pantalla, hueco) {
    const s = pantalla.seguro;
    return { x0: s.izq + hueco, x1: pantalla.ancho - s.der - hueco - tam.ancho, y0: s.arriba + hueco, y1: pantalla.alto - s.abajo - hueco - tam.alto };
  }
  // el rectángulo de un elemento de tamaño `tam` en ese sitio. fuera: px de más hacia dentro (en los lados, junto al marco del juego)
  function rectDe(sitio, tam, pantalla, { hueco = 0, fuera = 0 } = {}) {
    const L = limites(tam, pantalla, hueco);
    const centro = sitio.a * (lateral(sitio.borde) ? pantalla.alto : pantalla.ancho) + (sitio.d || 0);
    const pegado = { izq: L.x0 + fuera, der: L.x1 - fuera, arriba: L.y0, abajo: L.y1 }[sitio.borde];
    const r = { ancho: tam.ancho, alto: tam.alto };
    if (lateral(sitio.borde)) return Object.assign(r, { x: limita(pegado, L.x0, L.x1), y: limita(centro - tam.alto / 2, L.y0, L.y1) });
    return Object.assign(r, { x: limita(centro - tam.ancho / 2, L.x0, L.x1), y: limita(pegado, L.y0, L.y1) });
  }
  // ¿se tocan dos rectángulos (con `sep` px de aire)?
  const cruzan = (p, q, sep) => p.x < q.x + q.ancho + sep && q.x < p.x + p.ancho + sep && p.y < q.y + q.alto + sep && q.y < p.y + p.alto + sep;
  // el que llega se aparta a lo largo de su borde lo justo para no montarse en `otros`; si no cabe en ningún hueco, se queda donde cayó
  function aparta(rect, otros, borde, lim, sep = 4) {
    const choca = r => otros.some(o => cruzan(r, o, sep));
    if (!choca(rect)) return rect;
    const eje = lateral(borde) ? 'y' : 'x', largo = lateral(borde) ? 'alto' : 'ancho';
    const libres = otros.flatMap(o => [o[eje] - sep - rect[largo], o[eje] + o[largo] + sep])
      .filter(v => v >= lim[eje + '0'] && v <= lim[eje + '1'])
      .map(v => Object.assign({}, rect, { [eje]: v }))
      .filter(r => !choca(r));
    libres.sort((p, q) => Math.abs(p[eje] - rect[eje]) - Math.abs(q[eje] - rect[eje]));
    return libres[0] || rect;
  }
  // el sitio que guarda un rectángulo ya colocado en ese borde (su centro, en fracción del borde)
  function sitioDeRect(rect, borde, pantalla) {
    return Object.freeze({ borde, a: fraccion(lateral(borde) ? (rect.y + rect.alto / 2) / pantalla.alto : (rect.x + rect.ancho / 2) / pantalla.ancho) });
  }
  // qué sitio manda: lo guardado, salvo cuando el juego tiene su propio sitio de serie para ese botón y lo guardado se movió en otro
  // sitio (página): entonces manda el del juego (Taxi aparta DEV de sus mandos; tarea #362). `donde` va guardado con el sitio.
  function elige(guardado, delJuego, serie, donde) {
    if (valido(guardado) && (!delJuego || guardado.donde === donde)) return guardado;
    return delJuego || serie || null;
  }
  return Object.freeze({ BORDES, valido, elige, bordeCercano, sitioAlSoltar, sitioAlMover, limites, rectDe, aparta, sitioDeRect });
})();
if (typeof module !== 'undefined') module.exports = FLOTANTES_REGLAS;
