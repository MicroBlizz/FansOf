// Fans Of Paperwork · adaptador · CUENTA DE PROBADOR (rol alfa, ADR 146; core/js/sistema/probador.js): lo que pone Paperwork.
// · Dónde se enseña la tienda de euros: donde ya se podía comprar (la app, la web con pagos o el modo desarrollo) y, además, con una cuenta
//   de probador en la alfa o en localhost, donde la compra no cobra y la entrega el servidor (la pide core: MONEDAS.compraReal).
// · Qué se limpia de este navegador tras resetear la cuenta (gancho 'probador-reseteo' de core, con el servidor ya reseteado):
//     recursos  lo comprado: la copia de las mejoras y del «Sin anuncios», y las compras de prueba (mejorasPago.olvida)
//     progreso  la partida guardada, con sus retos y logros (lugar.olvidaPartida: core la borra ahora y otra vez al arrancar)
//     todo      lo comprado; la partida la borra core por su cuenta
//   Paperwork no tiene moneda comprada: no hay nada que sumar y el panel DEV no enseña esos botones.
// Puertos: mejorasPago (PW.creaMejorasPago), probador (como PROBADOR de core, o null) y pagos() (¿se puede pagar aquí sin ser probador?).
'use strict';
PW.creaProbador = ({ mejorasPago, probador = null, pagos = () => false }) => {
  const LIMPIA = { recursos: { comprado: true }, progreso: { partida: true }, todo: { comprado: true } };
  // ¿hay dentro una cuenta de probador en un sitio de pruebas? (ahí la compra con euros no cobra)
  const compraSinPagar = () => !!probador && typeof probador.puede === 'function' && probador.puede() && probador.enPruebas();
  const sePuedeComprar = () => !!pagos() || compraSinPagar();
  // que: 'recursos' | 'progreso' | 'todo'; lugar: lo que da core ({ olvidaPartida() }). Devuelve lo que ha limpiado
  function alResetear(que, lugar) {
    const toca = LIMPIA[que] || {};
    if (toca.comprado) mejorasPago.olvida();
    if (toca.partida) lugar.olvidaPartida();
    return toca;
  }
  return { sePuedeComprar, compraSinPagar, alResetear };
};
