// Fans Of Mining · dominio · DESPIDO: el reinicio del recorrido. En cuanto el Despido dé algo de Indemnización, el CEO puede despedir a tu equipo:
// se pierde todo el recorrido (plantas, materiales, piezas, oro, nivel y mejoras) y se cobra la Indemnización, que compra Recuerdos.
// La carrera (Trituradora, facciones, Recuerdos, expedientes, plan de carrera) se queda.
'use strict';
MN.despido = (() => {
  const AJ = MN.AJ, C = MN.curvas;
  const cobraria = (e, B) => Math.floor(C.indemnizacion(e.r.nivel) * B.indemn);
  // se puede en cuanto cobraría al menos 1 (sin bonos: depende solo del nivel, no de un nivel fijo)
  const puede = e => C.indemnizacion(e.r.nivel) >= 1;

  // Resultado: MN.ok(Indemnización cobrada) o 'sin-indemnizacion' (aún no cobraría nada)
  function despide(e, B, azar) {
    if (!puede(e)) return MN.error('sin-indemnizacion');
    const cobra = cobraria(e, B);
    e.c.indemnizacion += cobra;
    e.c.despidos++;
    const objetos = e.r.objetos;   // los objetos guardados en cofres no son del recorrido: se quedan
    e.r = MN.partida.recorridoNuevo(e.c, azar);
    e.r.objetos = objetos;
    return MN.ok(cobra);
  }
  return { despide, cobraria, puede };
})();
