// Fans Of Paperwork · dominio · TIENDA DE GRAPAS DE ORO: lo que se compra con grapas de oro (PW.TIENDA en datos.js), siempre sin azar y para
// toda la carrera: mejoras del sindicato, de lectura y velocidad, el pasillo del despacho, drones y un monumento por zona. Se abre con su
// nivel de la Trituradora; un monumento pide haber pisado su zona alguna vez (la planta más honda de la carrera).
'use strict';
PW.tienda = (() => {
  const C = PW.curvas;
  const de = id => PW.TIENDA.find(t => t.id === id);
  const nivel = (e, id) => e.c.tienda[id] || 0;
  const precio = (e, id) => { const t = de(id); return Math.ceil(t.precio0 * Math.pow(t.factor, nivel(e, id))); };
  // la zona más honda pisada en toda la carrera
  const zonaPisada = e => C.zonaDeDocumento(C.documentosDe(e.c.plantaMax)[1]);
  const visible = (e, t) => t.zona === undefined || zonaPisada(e) >= t.zona;
  // lo que se enseña en la tienda ahora
  const lista = e => PW.TIENDA.filter(t => visible(e, t));
  // comprar un nivel. Resultado: PW.ok(nivel nuevo), 'no-disponible', 'desconocido', 'al-maximo' o 'sin-saldo'
  function compra(e, id) {
    const t = de(id);
    if (!PW.desbloqueos.tiene(e, 'tienda')) return PW.error('no-disponible');
    if (!t || !visible(e, t)) return PW.error('desconocido');
    if (nivel(e, id) >= t.max) return PW.error('al-maximo');
    const p = precio(e, id);
    if (e.c.grapas < p) return PW.error('sin-saldo', { falta: p - e.c.grapas });
    e.c.grapas -= p;
    e.c.tienda[id] = nivel(e, id) + 1;
    return PW.ok(e.c.tienda[id]);
  }
  return { nivel, precio, lista, compra };
})();
