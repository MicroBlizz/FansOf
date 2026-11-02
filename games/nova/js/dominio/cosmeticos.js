// Fans Of Nova · NV.Cosmeticos: la colección de cosméticos de la galaxia de la comunidad (qué tienes, qué llevas puesto y la fila de
// las 27 casillas), sin pantalla ni dibujo. Un cosmético es un dato, 'facción-pieza' (por ejemplo 'pop-estela'); cómo se pinta está
// en cosmeticos-dibujo.js. Lo tuyo vive en la campaña (c.frente: cosmeticos = lo ganado, lleva = lo puesto). Diseño:
// docs/nova/cosmeticos-galaxia.md. Probado en tests/nova/unitarios/cosmeticos-dominio.test.mjs.
'use strict';
NV.Cosmeticos = (() => {
  const id = (fac, pieza) => fac + '-' + pieza;
  const parte = c => { const i = c.lastIndexOf('-'); return { fac: c.slice(0, i), pieza: c.slice(i + 1) }; };
  const tiene = (f, c) => !!f && (f.cosmeticos || []).includes(c);

  // Lo que llevas puesto: { pintura, estela, emblema } con el id o null. Lo que ya no tienes no se lleva.
  function lleva(f, piezas) {
    const l = (f && f.lleva) || {}, out = {};
    for (const p of piezas) out[p] = l[p] && tiene(f, l[p]) && parte(l[p]).pieza === p ? l[p] : null;
    return out;
  }
  // Ponerte uno (o quitarte la pieza con c = null). Solo lo que tienes y en su sitio. Devuelve true si cambió algo.
  function pon(f, pieza, c) {
    if (c !== null && (!tiene(f, c) || parte(c).pieza !== pieza)) return false;
    f.lleva = f.lleva || {};
    if ((f.lleva[pieza] || null) === c) return false;
    f.lleva[pieza] = c;
    return true;
  }
  // Las 27 casillas, por facción y en el orden de las piezas: cuál tienes y cuál llevas
  function coleccion(f, facciones, piezas) {
    const puesto = lleva(f, piezas);
    return facciones.map(fac => piezas.map(p => ({ id: id(fac, p), fac, pieza: p, tiene: tiene(f, id(fac, p)), puesto: puesto[p] === id(fac, p) })));
  }
  const cuenta = (f, facciones, piezas) => coleccion(f, facciones, piezas).flat().filter(x => x.tiene).length;
  // ¿Ya tienes toda la colección de una facción?
  const completa = (f, fac, piezas) => piezas.every(p => tiene(f, id(fac, p)));

  // Al ganar uno: si esa pieza la llevabas vacía, te lo pones (lo acabas de ganar: que se vea)
  function estrena(f, c) {
    const p = parte(c).pieza;
    if (!(f.lleva && f.lleva[p])) pon(f, p, c);
  }

  return { id, parte, tiene, lleva, pon, coleccion, cuenta, completa, estrena };
})();
