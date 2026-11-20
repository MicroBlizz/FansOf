// Fans of Pinball · adaptador · VENTANA DE LA TIENDA DE LOLA: se abre cuando la bola entra en la tienda (fase «comprando» del dominio).
// Arriba, la cara de Lola (la de Swipe) con su frase y las fichas de la partida; debajo, 3 mejoras con su icono, nombre, texto corto,
// rareza (común verde, rara azul, épica naranja) y precio en fichas, cada una con su botón COMPRAR en verde (apagado si no llegan las
// fichas), y SALIR en azul. Botones de 48 px o más para el pulgar; los toques de las primeras décimas no cuentan (el pulgar que seguía
// en la pala no compra sin querer).
'use strict';
PB.ventanaTienda = (() => {
  const RAREZA = { comun: 'Común', rara: 'Rara', epica: 'Épica' };
  const ESPERA_MS = 350;
  function carta(m, i, fichas, alComprar) {
    const icono = PB.imagen(AJUSTES.arte.mejoras[m.id] || AJUSTES.arte.mejoras.pala_acero, 2, 'pb-icono-mejora');
    const llega = fichas >= m.precio;
    const precio = PB.crea('span', { className: 'pb-precio' }, PB.imagen(AJUSTES.arte.imagenes.moneda, 2, 'pb-icono'), PB.crea('b', { textContent: String(m.precio) }));
    const compra = PB.crea('button', { type: 'button', className: 'pb-boton pb-verde pb-comprar', textContent: tr('COMPRAR'), disabled: !llega, onclick: () => alComprar(i) });
    return PB.crea('div', { className: 'pb-mejora pb-articulo pb-' + m.rareza },
      icono,
      PB.crea('b', { textContent: tr(m.nombre) }),
      PB.crea('small', { textContent: tr(m.texto) }),
      PB.crea('em', { textContent: tr(RAREZA[m.rareza]) + (m.tiene ? ' · ' + tr('Nivel {n}').replace('{n}', m.tiene + 1) : '') }),
      PB.crea('div', { className: 'pb-caja-precio' }, precio, compra));
  }
  // foto: la del dominio (foto.tienda.oferta y foto.fichas); acciones: { compra(i), sale() }
  function abre(foto, acciones) {
    const desde = performance.now(), listo = () => performance.now() - desde >= ESPERA_MS;
    const comprar = i => { if (!listo()) return; PB.ventanas.cierra(); acciones.compra(i); };
    const lola = PB.crea('div', { className: 'pb-lola' }, PB.imagen(AJUSTES.arte.imagenes.lola, 2, 'pb-cara-lola'),
      PB.crea('p', {}, PB.crea('b', { textContent: 'LOLA' }), tr('¡Bienvenido! ¿Qué te llevas?'),
        PB.crea('span', { className: 'pb-chapa pb-chapa-fichas' }, PB.imagen(AJUSTES.arte.imagenes.moneda, 2, 'pb-icono'), PB.crea('b', { textContent: PB.miles(foto.fichas) }))));
    const lista = PB.crea('div', { className: 'pb-mejoras' }, ...foto.tienda.oferta.map((m, i) => carta(m, i, foto.fichas, comprar)));
    PB.ventanas.abre({
      clase: 'pb-hoja-tienda', titulo: tr('TIENDA DE LOLA'), cuerpo: [lola, lista],
      botones: [{ texto: tr('SALIR'), clase: 'pb-azul', queda: true, alPulsar: () => { if (!listo()) return; PB.ventanas.cierra(); acciones.sale(); } }],
    });
  }
  return { abre };
})();
