// Fans of Basement · Tu despacho (dominio): lo que se ve en él según tu progreso, para que se note todo lo que has conseguido. La
// sala crece con el cargo (cubículo, oficina, despacho con ventanal y la planta entera del CEO); en la estantería, un trofeo por
// cada jefe que has vencido alguna vez; en la pared, tus armas; en el terrario, los bichos que has capturado vivos; la cafetera,
// la mochila y los pósits según tu formación; la mascota que llevas; y el cuadro del catálogo completo. La escena la pinta despacho-ui.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  B.despachoDe = function (AJ, p) {
    let sala = AJ.despacho.salas[0][0];
    for (const [id, desde] of AJ.despacho.salas) if (p.rango >= desde) sala = id;
    const a = B.aspectoDe(AJ, p);
    return Object.freeze({
      sala, rango: p.rango,
      trofeos: AJ.jefes.orden.filter((id) => p.catalogo[id] > 0),
      armas: Object.keys(AJ.armas).filter((id) => AJ.armas[id].rareza && p.armas[id] > 0),
      terrario: Object.entries(p.terrario).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n })),
      formacion: a.formacion, mascota: p.mascota && p.mascotas[p.mascota] ? p.mascota : null,
      catalogoCompleto: B.catalogoCompleto(AJ, p), servidorArreglado: p.final || p.rango > 0,
    });
  };
})(BAS);
