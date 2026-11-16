// Fans Of Paperwork · adaptador · PANEL DE LAS MEJORAS DE PAGO (ADR 125): la sección «Mejoras para siempre» de la pestaña Méritos, junto a la
// taquilla del sindicato, que es lo que mejoran. Mismo contrato que paneles.js: solo HTML con data-acc. El precio se escribe como en cada idioma.
// No sale donde no se puede comprar nada (la web sin pagos abiertos): ahí un botón con euros solo llevaría a «aún no está a la venta».
'use strict';
PW.panelesPago = (() => {
  const P = PW.paneles;
  // las cifras de los textos, sacadas de PW.AJ.mejoras para que no se queden atrás al calibrar
  const cifras = () => ({ p: PW.txt.pct(1 - PW.AJ.mejoras.turno.factor), n: PW.txt.num(PW.AJ.mejoras.taquilla.huecos) });
  // solo donde de verdad se puede comprar: la app (Google Play), la web con Paddle abierto o el modo desarrollo (compra de prueba)
  const sePuede = () => !!NUCLEO.desarrollo || (typeof PAGOS !== 'undefined' && PAGOS.disponible()) || (typeof PAGOS_WEB !== 'undefined' && PAGOS_WEB.disponible());
  const euros = v => (NUCLEO.idioma === 'en' ? '€' + v.toFixed(2) : v.toFixed(2).replace('.', ',') + ' €');
  // m: las mejoras que tiene la cuenta (PW.mejoras.de)
  function seccion(m) {
    if (!sePuede()) return '';
    const ofertas = PW.mejoras.ofertas(m);
    const filas = PW.MEJORAS_PAGO.filter(x => x.id !== 'pack' || ofertas.includes('pack')).map(x => {
      const der = ofertas.includes(x.id) ? P.boton('pago', x.id, euros(PW.AJ.mejoras[x.id].eur), true, 'pw-euros') : `<em>${tr('Tuya')}</em>`;
      return P.fila(P.icono('', ofertas.includes(x.id) ? '#3ddc84' : '#ffd23f'), tr(x.nombre), tr(x.txt, cifras()), der);
    }).join('');
    return `<h4 class="pw-sub">${tr('Mejoras para siempre')}</h4>`
      + `<p class="pw-nota">${tr('Se guardan en tu cuenta: no se pierden con el Despido ni con las versiones nuevas. Sin azar: te llevas justo esto.')}</p>${filas}`;
  }
  return { seccion, euros, cifras };
})();
