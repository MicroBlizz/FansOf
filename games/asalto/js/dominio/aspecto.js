// Fans of Asalto · DOMINIO · Cómo se ve un héroe (tarea #85): el que ha ascendido pasa a su versión superior, la de su rama
// (la tira «superior-<tipo>-<rama>»), y lleva flotando a su lado un emblema por cada impronta que tenga grabada (hasta 3, en el orden
// en que se grabaron). El que no ha ascendido se ve como siempre y sin emblemas. Si falta el dibujo superior, el adaptador usa el normal.
// Tarea #109: el legendario se ve con la tira «legendario-<tipo>-<rama>» y el ser secreto con «ser-<tipoA>_<tipoB>»; `respaldo` dice
// la tira superior, por si aún no está su dibujo. Tarea #156: el dios, con «dios-<id>» (el mismo respaldo).
'use strict';
AS.aspecto = (() => {
  const EMBLEMAS = 3;
  // la tira de su grado: dios, ser, legendario o superior
  function tiraDe(tipo, rama, grado) {
    if (grado && grado.dios) return 'dios-' + grado.dios;
    if (grado && grado.ser) return 'ser-' + grado.ser.replace('+', '_');
    return (grado && grado.legendario ? 'legendario-' : 'superior-') + tipo + '-' + rama;
  }
  // tipo y rama del héroe (o de su unidad en la batalla), sus improntas y, si lo es, su grado { legendario, ser: clave del ser,
  // dios: id del dios }: { tira, superior, legendario, ser, dios, respaldo, emblemas }
  function de(tipo, rama, improntas, grado) {
    if (!rama) return Object.freeze({ tira: tipo, superior: false, legendario: false, ser: false, dios: false, respaldo: tipo, emblemas: Object.freeze([]) });
    const g = grado || {}, legendario = !!(g.legendario || g.ser || g.dios);
    return Object.freeze({ tira: tiraDe(tipo, rama, grado), superior: true, legendario, ser: !!g.ser, dios: !!g.dios, respaldo: 'superior-' + tipo + '-' + rama,
      emblemas: Object.freeze((improntas || []).slice(0, EMBLEMAS)) });
  }
  // el grado de un héroe para su aspecto (lo mismo debe llevar su unidad en la batalla)
  const grado = h => ({ legendario: h.legendario === true, ser: h.ser ? h.ser.clave : null, dios: h.dios || null });
  const deHeroe = (datos, h) => de(h.tipo, h.rama, AS.heroe.improntas(datos, h), grado(h));
  return { de, deHeroe, grado };
})();
