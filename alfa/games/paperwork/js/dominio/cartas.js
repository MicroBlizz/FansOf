// Fans Of Paperwork · dominio · CARTAS DE RECOMENDACIÓN: tras cada Despido, el antiguo jefe ofrece AJ.cartas.ofrece cartas al azar y el
// jugador elige una ventaja para el turno que empieza (c.oferta guarda las que hay; se puede elegir cuando se quiera, hasta el Despido
// siguiente, que trae otras). Qué cartas hay: PW.CARTAS (datos.js).
'use strict';
PW.cartas = (() => {
  const K = PW.AJ.cartas;
  // lo que hace cada carta sobre el turno en curso
  const EFECTO = {
    termo: e => { e.r.activos.cafe = (e.r.activos.cafe || 0) + K.termo; },
    temporal: e => { e.r.temporales = (e.r.temporales || 0) + 1; },
    ascensor: (e, B, azar, sucesos) => {
      const n = e.r.planta.n + K.planta;
      PW.rebuscar.ponPlanta(e, B, n, azar, sucesos);
    },
    guantes: e => { e.r.utiles.guantes = Math.min(PW.AJ.utiles.guantes.max, e.r.utiles.guantes + K.guantes); },
    adelanto: e => { e.r.oro += K.oro * (1 + e.c.trituradora.nivel); },
    lacre: e => { e.r.bonoCarta.confidencial = (e.r.bonoCarta.confidencial || 0) + K.lacre; },
  };
  // saca la oferta de un Despido: unas cuantas cartas distintas
  function ofrece(e, azar) {
    e.c.oferta = PW.saca(PW.CARTAS.map(c => c.id), K.ofrece, azar);
  }
  // elegir una de las ofrecidas. Resultado: PW.ok(id), 'sin-oferta' o 'desconocido'
  function elige(e, B, id, azar, sucesos = []) {
    if (!e.c.oferta.length) return PW.error('sin-oferta');
    if (!e.c.oferta.includes(id) || !EFECTO[id]) return PW.error('desconocido', { id });
    EFECTO[id](e, B, azar, sucesos);
    e.c.oferta = [];
    return PW.ok(id);
  }
  return { ofrece, elige };
})();
