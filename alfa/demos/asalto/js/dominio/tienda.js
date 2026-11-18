// Fans of Asalto · DOMINIO · La tienda de la partida: una oferta de tres objetos que se renueva cada dos oleadas, se paga con esencia
// (nunca con oro) y no vende rarezas ni héroes. Cambiar la oferta cuesta esencia, y cada vez una más hasta la oferta siguiente. Los
// objetos comprados ocupan un hueco (hay 6); comprar otra vez el mismo lo sube de nivel sin gastar hueco; vender devuelve la mitad de
// lo pagado. La tienda es un valor congelado: { oferta: [id o null], cambios, objetos: [{ id, nivel, pagado }] }; comprar, vender o
// cambiar devuelven otra, o un error con nombre. Puro: el azar llega de fuera.
'use strict';
AS.tienda = (() => {
  const congela = t => Object.freeze({ oferta: Object.freeze(t.oferta.slice()), cambios: t.cambios, objetos: Object.freeze(t.objetos.map(o => Object.freeze({ ...o }))) });
  const T = datos => datos.tienda;
  const mio = (t, id) => t.objetos.find(o => o.id === id) || null;
  const alTope = (datos, t, id) => { const o = mio(t, id); return !!o && o.nivel >= T(datos).nivelMax; };

  // tres objetos distintos, por el peso de su rareza; los que ya están al nivel máximo no salen
  function sortea(datos, t, azar) {
    const pesos = {}, oferta = [];
    for (const id in datos.objetos) if (!alTope(datos, t, id)) pesos[id] = T(datos).pesos[datos.objetos[id].rareza];
    while (oferta.length < T(datos).oferta && Object.keys(pesos).length) { const id = azar.pesos(pesos); oferta.push(id); delete pesos[id]; }
    while (oferta.length < T(datos).oferta) oferta.push(null);
    return oferta;
  }
  const nueva = (datos, azar) => ofertaNueva(datos, { oferta: [], cambios: 0, objetos: [] }, azar);
  // la oferta de cada dos oleadas: tres objetos nuevos y el cambio vuelve a su precio de salida
  const ofertaNueva = (datos, t, azar) => congela({ ...t, oferta: sortea(datos, t, azar), cambios: 0 });
  // ¿toca oferta nueva al empezar a preparar la oleada n? (la 1, la 3, la 5…)
  const toca = (datos, n) => (n - 1) % T(datos).cada === 0;
  // cuántas oleadas faltan para la oferta siguiente, estando en la n
  const faltan = (datos, n) => T(datos).cada - (n - 1) % T(datos).cada;
  // la esencia que da ganar la oleada n: 1, 3 en las acabadas en 5 y 5 en las acabadas en 0
  function esenciaDeOleada(datos, n) {
    const E = T(datos).esencia;
    return n % 10 === 0 ? E.diez : n % 5 === 0 ? E.cinco : E.normal;
  }
  const precio = (datos, id) => T(datos).precios[datos.objetos[id].rareza];
  const costeCambio = (datos, t) => T(datos).cambio.base + T(datos).cambio.sube * t.cambios;

  function cambia(datos, t, esencia, azar) {
    const coste = costeCambio(datos, t);
    if (esencia < coste) return AS.error('sin-esencia', { coste });
    return AS.ok({ tienda: congela({ ...t, oferta: sortea(datos, t, azar), cambios: t.cambios + 1 }), coste });
  }
  // otra oferta sin pagar (el anuncio): no sube el precio del cambio
  const cambiaGratis = (datos, t, azar) => congela({ ...t, oferta: sortea(datos, t, azar) });
  // compra el objeto i de la oferta: si ya lo tiene, sube de nivel; si no, ocupa un hueco
  function compra(datos, t, i, esencia) {
    const id = t.oferta[i];
    if (!id) return AS.error('nada-ahi');
    const coste = precio(datos, id), tengo = mio(t, id);
    if (tengo && tengo.nivel >= T(datos).nivelMax) return AS.error('nivel-maximo');
    if (!tengo && t.objetos.length >= T(datos).huecos) return AS.error('sin-hueco');
    if (esencia < coste) return AS.error('sin-esencia', { coste });
    const objeto = tengo ? { id, nivel: tengo.nivel + 1, pagado: tengo.pagado + coste } : { id, nivel: 1, pagado: coste };
    const objetos = tengo ? t.objetos.map(o => (o.id === id ? objeto : o)) : [...t.objetos, objeto];
    const oferta = t.oferta.slice(); oferta[i] = null;
    return AS.ok({ tienda: congela({ ...t, oferta, objetos }), coste, objeto });
  }
  const valorVenta = (datos, o) => Math.floor(o.pagado * T(datos).venta);
  function vende(datos, t, id) {
    const o = mio(t, id);
    if (!o) return AS.error('no-lo-tienes');
    return AS.ok({ tienda: congela({ ...t, objetos: t.objetos.filter(x => x.id !== id) }), esencia: valorVenta(datos, o) });
  }
  const objetoGuardado = (M, o) => ({ id: o.id, nivel: Math.max(1, Math.min(M.nivelMax, Math.floor(o.nivel) || 1)), pagado: Math.max(0, Math.floor(o.pagado) || 0) });
  // de la partida guardada: lo que venga roto se queda fuera; sin tienda guardada (una partida de antes), una nueva
  function deJSON(datos, j, azar) {
    if (!j || !Array.isArray(j.oferta) || !Array.isArray(j.objetos)) return nueva(datos, azar);
    const M = T(datos), objetos = [];
    for (const o of j.objetos) {
      const vale = o && datos.objetos[o.id] && !objetos.some(x => x.id === o.id) && objetos.length < M.huecos;
      if (vale) objetos.push(objetoGuardado(M, o));
    }
    const oferta = Array.from({ length: M.oferta }, (_, i) => (datos.objetos[j.oferta[i]] ? j.oferta[i] : null));
    return congela({ oferta, cambios: Math.max(0, Math.floor(j.cambios) || 0), objetos });
  }
  return { nueva, ofertaNueva, toca, faltan, esenciaDeOleada, precio, costeCambio, cambia, cambiaGratis, compra, vende, valorVenta, mio, deJSON };
})();
