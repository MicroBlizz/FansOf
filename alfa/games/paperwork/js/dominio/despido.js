// Fans Of Paperwork · dominio · DESPIDO: el reinicio del recorrido. En cuanto el Despido dé algo de Indemnización, el CEO puede despedir a tu equipo:
// se pierde todo el recorrido (plantas, documentos, expedientes, oro, nivel y mejoras) y se cobra la Indemnización, que compra Recuerdos.
// La carrera (Trituradora, facciones, Recuerdos, especialidad, plan de carrera) se queda.
'use strict';
PW.despido = (() => {
  const AJ = PW.AJ, C = PW.curvas;
  // lo que cobraría ahora: la Indemnización de su nivel con sus bonos, menos la sanción de los pedidos del CEO fallados
  const cobraria = (e, B) => Math.floor(C.indemnizacion(e.r.nivel) * B.indemn * (1 - (e.c.sancion || 0)));
  // se puede en cuanto cobraría al menos 1 (no hay un nivel fijo)
  const puede = (e, B) => cobraria(e, B || PW.bonos.calcula(e)) >= 1;

  // Resultado: PW.ok(Indemnización cobrada) o 'sin-indemnizacion' (aún no cobraría nada)
  function despide(e, B, azar) {
    if (!puede(e, B)) return PW.error('sin-indemnizacion');
    const cobra = cobraria(e, B);
    e.c.indemnizacion += cobra;
    e.c.despidos++;
    const objetos = e.r.objetos;   // los objetos guardados en cofres no son del recorrido: se quedan
    const plantado = !!e.r.pedido;   // irse con un pedido del CEO a medias cuenta como fallarlo: la sanción pasa al Despido siguiente
    e.r = PW.partida.recorridoNuevo(e.c, azar);
    e.r.objetos = objetos;
    e.c.sancion = plantado ? AJ.pedido.sancion : 0;   // la sanción cobrada se paga una vez
    PW.cartas.ofrece(e, azar);
    return PW.ok(cobra);
  }
  return { despide, cobraria, puede };
})();
