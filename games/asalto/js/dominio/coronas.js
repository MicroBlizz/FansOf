// Fans of Asalto · DOMINIO · Las Coronas de la compra de PRUEBA (ADR 200, docs/core/MONEDAS.md). Las Coronas son la moneda comprada de Asalto: solo pagan
// aspectos de héroe, a precio fijo; nunca entran en el azar ni se cambian por plumas. Con cuenta, el saldo y lo comprado son del servidor (monedero 'asalto':
// dominio/monedero.js) y este archivo no interviene. Aquí queda lo LOCAL, que solo existe en el modo desarrollo para probar sin cuenta: el saldo de prueba,
// gastar y lo que entregan, en local, los productos de euros (las bolsas y el Pack de inicio, una sola vez). Las Coronas que daban los logros grandes se
// quitaron: el cliente no puede sumar al monedero del servidor (pendiente: una función de servidor).
// Errores con nombre: sin-coronas, ya-lo-tienes (el Pack de inicio), producto-desconocido.
'use strict';
AS.coronas = (() => {
  const entero = v => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  // lo guardado en este móvil (solo pruebas): el saldo y si ya se compró el Pack de inicio
  const lee = j => ({ coronas: entero(j && j.coronas), inicio: !!(j && j.inicio === true) });
  const suma = (p, n) => ({ ...p, coronas: p.coronas + entero(n) });
  function gasta(p, n) {
    const coste = entero(n);
    return p.coronas < coste ? AS.error('sin-coronas', { coste }) : AS.ok({ ...p, coronas: p.coronas - coste });
  }
  const bolsa = (datos, producto) => datos.compras.bolsas.find(b => b.producto === producto) || null;
  function entregaInicio(datos, p) {
    const I = datos.compras.inicio;
    if (p.inicio) return AS.error('ya-lo-tienes');
    const r = AS.aspectosTienda.da(datos, suma(p, I.coronas), I.aspecto);
    return r.ok ? AS.ok({ ...r.valor, inicio: true }) : r;
  }
  // lo que entrega un producto con euros, en local (la compra de prueba del modo desarrollo): AS.ok(progreso) o el error
  function entrega(datos, p, producto) {
    const b = bolsa(datos, producto);
    if (b) return AS.ok(suma(p, b.coronas));
    return producto === datos.compras.inicio.producto ? entregaInicio(datos, p) : AS.error('producto-desconocido');
  }
  // lo comprado con euros no se borra con «Borrar todo el progreso»: lo que hay que conservar de un progreso
  const pagado = p => ({ coronas: p.coronas, inicio: p.inicio, aspectos: p.aspectos, pieles: p.pieles });
  return { lee, suma, gasta, bolsa, entrega, pagado };
})();
