// Fans of Asalto · DOMINIO · Las Coronas, la moneda comprada de Asalto (ADR 200, docs/core/MONEDAS.md): se compran con euros y solo pagan
// aspectos de héroe, a precio fijo; nunca entran en el azar ni se cambian por plumas. Las plumas son la ganada y no se venden. Aquí: el saldo,
// gastar, lo que dan los logros grandes y lo que entregan los productos con euros (las bolsas y el Pack de inicio, una sola vez).
// Una compra real la entrega el servidor y el cliente adopta lo que diga (adopta); entrega() es solo para la compra de prueba del modo desarrollo.
// Errores con nombre: sin-coronas, ya-lo-tienes (el Pack de inicio), producto-desconocido.
'use strict';
AS.coronas = (() => {
  const entero = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  // lo guardado: el saldo y si ya se compró el Pack de inicio
  const lee = j => ({ coronas: entero(j && j.coronas), inicio: !!(j && j.inicio === true) });
  const suma = (p, n) => ({ ...p, coronas: p.coronas + entero(n) });
  function gasta(p, n) {
    const coste = entero(n);
    return p.coronas < coste ? AS.error('sin-coronas', { coste }) : AS.ok({ ...p, coronas: p.coronas - coste });
  }
  // cobrar un logro grande: si da Coronas se suman (el cobro de sus plumas lo hace el progreso)
  const porLogro = (datos, p, id) => suma(p, (datos.coronasLogros || {})[id]);
  const bolsa = (datos, producto) => datos.compras.bolsas.find(b => b.producto === producto) || null;
  function entregaInicio(datos, p) {
    const I = datos.compras.inicio;
    if (p.inicio) return AS.error('ya-lo-tienes');
    const r = AS.aspectosTienda.da(datos, suma(p, I.coronas), I.aspecto);
    return r.ok ? AS.ok({ ...r.valor, inicio: true }) : r;
  }
  // lo que entrega un producto con euros, en local (la compra de prueba): AS.ok(progreso) o el error
  function entrega(datos, p, producto) {
    const b = bolsa(datos, producto);
    if (b) return AS.ok(suma(p, b.coronas));
    return producto === datos.compras.inicio.producto ? entregaInicio(datos, p) : AS.error('producto-desconocido');
  }
  // lo que dice el servidor tras una compra real: el saldo de Coronas y los aspectos que tienes (lo que no venga, se queda); el Pack de
  // inicio queda comprado si trae su aspecto
  function adopta(datos, p, estado) {
    const e = estado || {}, q = { ...p };
    if (Number.isFinite(e.coronas)) q.coronas = entero(e.coronas);
    if (Array.isArray(e.aspectos)) q.aspectos = AS.aspectosTienda.lee(datos, { aspectos: [...p.aspectos, ...e.aspectos] }).aspectos;
    if (q.aspectos.includes(datos.compras.inicio.aspecto)) q.inicio = true;
    return q;
  }
  // lo comprado con euros no se borra con «Borrar todo el progreso»: lo que hay que conservar de un progreso
  const pagado = p => ({ coronas: p.coronas, inicio: p.inicio, aspectos: p.aspectos, pieles: p.pieles });
  return { lee, suma, gasta, porLogro, bolsa, entrega, adopta, pagado };
})();
