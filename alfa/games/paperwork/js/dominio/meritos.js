// Fans Of Paperwork · dominio · MÉRITOS y GRAPAS DE ORO: lo que trae el paquete del sindicato. Cada paquete da un mérito al azar (un bono
// de cuenta de +1 % a algo, sin tope: cuantos más, más fuerte) y unas pocas grapas de oro. Las grapas de oro son la moneda buena del juego:
// solo compran cosas sin azar (puntos del plan de carrera, a precio que sube), nunca un paquete ni nada al azar. Por ahora solo se ganan
// jugando. El azar entra como función.
'use strict';
PW.meritos = (() => {
  const AJ = PW.AJ;
  // un mérito al azar, todos igual de probables. Devuelve su id
  const tira = azar => PW.MERITOS[Math.min(PW.MERITOS.length - 1, Math.floor(azar() * PW.MERITOS.length))].id;
  // cuántas veces se tiene el mérito id
  const nivel = (e, id) => e.c.meritos[id] || 0;
  const total = e => PW.MERITOS.reduce((s, m) => s + nivel(e, m.id), 0);
  // las grapas de oro que trae cada paquete
  const grapasPaquete = B => AJ.grapas.porPaquete + B.grapasPaquete;
  // un paquete abierto: un mérito al azar y sus grapas. Devuelve { merito, nivel, grapas }
  function abre(e, B, azar) {
    const id = tira(azar), grapas = grapasPaquete(B);
    e.c.meritos[id] = nivel(e, id) + 1;
    e.c.grapas += grapas;
    return { merito: id, nivel: e.c.meritos[id], grapas };
  }
  // lo que cuesta en grapas de oro el siguiente punto del plan de carrera (sube con cada uno comprado)
  const precioPunto = e => Math.ceil(AJ.grapas.punto0 * Math.pow(AJ.grapas.puntoFactor, e.c.puntosComprados));
  // comprar un punto del plan de carrera con grapas de oro. Resultado: PW.ok(puntos comprados), 'no-disponible' o 'sin-saldo'
  function compraPunto(e) {
    if (!PW.desbloqueos.tiene(e, 'plan')) return PW.error('no-disponible');
    const precio = precioPunto(e);
    if (e.c.grapas < precio) return PW.error('sin-saldo', { falta: precio - e.c.grapas });
    e.c.grapas -= precio;
    e.c.puntosComprados++;
    return PW.ok(e.c.puntosComprados);
  }
  return { tira, nivel, total, grapasPaquete, abre, precioPunto, compraPunto };
})();
