// Fans Of Sótano · dominio · DESPIDO: el reinicio del recorrido. Desde el nivel AJ.despido.nivelMinimo el CEO despide a tu equipo:
// se pierde todo el recorrido (plantas, materiales, piezas, oro, nivel y mejoras) y se cobra la Indemnización, que compra Recuerdos.
// La carrera (Trituradora, facciones, Recuerdos, expedientes, plan de carrera) se queda.
'use strict';
SO.despido = (() => {
  const AJ = SO.AJ, C = SO.curvas;
  const cobraria = (e, B) => Math.floor(C.indemnizacion(e.r.nivel) * B.indemn);
  const puede = e => e.r.nivel >= AJ.despido.nivelMinimo;

  // Resultado: SO.ok(Indemnización cobrada) o 'nivel-bajo' (con el nivel que falta)
  function despide(e, B, azar) {
    if (!puede(e)) return SO.error('nivel-bajo', { falta: AJ.despido.nivelMinimo - e.r.nivel });
    const cobra = cobraria(e, B);
    e.c.indemnizacion += cobra;
    e.c.despidos++;
    const objetos = e.r.objetos;   // los objetos guardados en cofres no son del recorrido: se quedan
    e.r = SO.partida.recorridoNuevo(e.c, azar);
    e.r.objetos = objetos;
    return SO.ok(cobra);
  }
  return { despide, cobraria, puede };
})();
