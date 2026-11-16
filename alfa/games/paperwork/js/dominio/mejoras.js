// Fans Of Paperwork · dominio · MEJORAS DE PAGO: las dos mejoras que se compran con euros y son para siempre (ADR 125), sin azar.
// No viven en la partida (que se borra con cada versión) sino en la cuenta: el servidor las guarda como claves de reclamos y el adaptador
// se las pasa al juego. Aquí solo se traduce la lista de claves a un valor congelado y se dice qué hace cada una con el paquete del sindicato.
//   · Turno rápido: la espera del paquete se multiplica por AJ.mejoras.turno.factor, también por debajo del mínimo de los talentos.
//   · Taquilla XL: AJ.mejoras.taquilla.huecos paquetes más guardados en la taquilla.
//   · El pack da las dos.
'use strict';
PW.mejoras = (() => {
  const M = () => PW.AJ.mejoras;
  const NINGUNA = Object.freeze({ turno: false, taquilla: false });
  // las claves del servidor (o de una compra de prueba) → { turno, taquilla }. Lo que no se entiende se ignora
  function de(claves) {
    const l = Array.isArray(claves) ? claves : [], pack = l.includes(M().pack.clave);
    return Object.freeze({ turno: pack || l.includes(M().turno.clave), taquilla: pack || l.includes(M().taquilla.clave) });
  }
  // la espera y la taquilla del sindicato con las mejoras puestas (m puede faltar: sin mejoras)
  const espera = (m, cada) => (m && m.turno ? Math.round(cada * M().turno.factor) : cada);
  const taquilla = (m, max) => max + (m && m.taquilla ? M().taquilla.huecos : 0);
  // lo que se ofrece ahora: cada mejora que falta y el pack solo si faltan las dos (comprar el pack teniendo una sería pagar dos veces)
  function ofertas(m) {
    const t = !(m && m.turno), q = !(m && m.taquilla);
    return [t && 'turno', q && 'taquilla', t && q && 'pack'].filter(Boolean);
  }
  return { NINGUNA, de, espera, taquilla, ofertas };
})();
