// Fans of Asalto · DOMINIO · Cómo se ve un héroe (tarea #85): el que ha ascendido pasa a su versión superior, la de su rama
// (la tira «superior-<tipo>-<rama>»), y lleva flotando a su lado un emblema por cada impronta que tenga grabada (hasta 3, en el orden
// en que se grabaron). El que no ha ascendido se ve como siempre y sin emblemas. Si falta el dibujo superior, el adaptador usa el normal.
'use strict';
AS.aspecto = (() => {
  const EMBLEMAS = 3;
  // tipo y rama del héroe (o de su unidad en la batalla) y sus improntas: { tira, emblemas }
  function de(tipo, rama, improntas) {
    if (!rama) return Object.freeze({ tira: tipo, superior: false, emblemas: Object.freeze([]) });
    return Object.freeze({ tira: 'superior-' + tipo + '-' + rama, superior: true, emblemas: Object.freeze((improntas || []).slice(0, EMBLEMAS)) });
  }
  const deHeroe = (datos, h) => de(h.tipo, h.rama, AS.heroe.improntas(datos, h));
  return { de, deHeroe };
})();
