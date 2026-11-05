// Fans of Rouflage · DOMINIO: EL ESCAPARATE DE LA TIENDA (decidido por Daniel el 5-11-2026, ADR 052). La tienda vende todo lo de pago del
// armario por categorías; el armario ya solo sirve para vestirse. Lo de la TIENDA (de: 'tienda') se paga solo con Acciones; lo que siempre
// fue de Gotas (de: 'gotas': escenarios y muebles de Mi escenario) sigue pudiéndose pagar con las dos. Si te faltan Acciones, la pestaña
// ACCIONES marca el paquete de cambio de Gotas que te llega. Cada semana hay un conjunto del Rumble destacado, el mismo para todos.
// Reglas puras: sin pantalla, sin SAVE, sin reloj (la fecha llega de fuera).
'use strict';

RF.Escaparate = (() => {
  // con qué se puede pagar una pieza
  const monedas = it => (it && it.de === 'tienda' ? ['acciones'] : ['gotas', 'acciones']);

  // las categorías con algo a la venta y sus piezas: primero lo que aún no tienes, de más barato a más caro (lo tuyo, al final).
  // catalogo: [{ id, corto, items }]; precio(it) → { acciones } | null; tuyo(catId, it) → true si ya la tienes y no se compra otra
  const enVenta = (catalogo, precio, tuyo) => {
    const cats = [];
    for (const cat of catalogo) {
      const items = [];
      for (const it of cat.items) { const pr = precio(it); if (pr) items.push({ it, precio: pr, tuyo: !!tuyo(cat.id, it) }); }
      if (!items.length) continue;
      items.sort((a, b) => (a.tuyo - b.tuyo) || (a.precio.acciones - b.precio.acciones));
      cats.push({ id: cat.id, corto: cat.corto, items });
    }
    return cats;
  };

  // el paquete de cambio de Gotas más pequeño que cubre lo que te falta (canje: [{ gotas, n }], de menor a mayor); -1 si ninguno llega
  const paqueteQueLlega = (canje, faltan) => {
    if (!(faltan > 0)) return -1;
    return canje.findIndex(pk => pk.n >= faltan);
  };

  // la semana (número) de una fecha 'AAAA-MM-DD', contando desde el 1-1-1970; cambia de golpe cada 7 días
  const semanaDe = fecha => {
    const ms = Date.parse(String(fecha) + 'T00:00:00Z');
    return Number.isFinite(ms) ? Math.floor(ms / 864e5 / 7) : 0;
  };

  // el conjunto destacado de la semana: va rotando por la lista, igual para todos
  const destacado = (lista, semana) => (lista.length ? lista[((semana % lista.length) + lista.length) % lista.length] : null);

  return Object.freeze({ monedas, enVenta, paqueteQueLlega, semanaDe, destacado });
})();
