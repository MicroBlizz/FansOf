// Fans of Asalto · ADAPTADORES · La ventana «TUS RELIQUIAS» (HTML sobre el lienzo): cada reliquia que llevas con su icono, su nombre, la
// clase a la que sirve y lo que hace. Se abre al tocar la fila de reliquias de la arena (pinta-reliquias.js). Solo enseña: no decide reglas.
'use strict';
AS.ventanas.reliquias = (() => {
  const V = AS.ventanas, ico = V.ico, btn = V.btn;
  function fila(id) {
    const r = ASALTO.reliquias[id];
    if (!r) return '';
    const clase = r.clase ? ` · ${tr(ASALTO.clases[r.clase].nombre)}` : '';
    return `<li class="as-item">${ico(AS.pinta.reliquias.icono(id, r), 'as-ico2')}<div><b>${tr(r.nombre)}${clase}</b><span>${tr(r.txt)}</span></div></li>`;
  }
  return E => {
    const lista = E.casos.partida.reliquias;
    V.abre(`<h2>${tr('TUS RELIQUIAS')}</h2><p class="as-nota">${tr('Valen hasta el final de la partida.')}</p>
      <ul class="as-lista">${lista.map(fila).join('')}</ul><div class="as-fila">${btn('as-rel-vale', tr('VALE'), 'as-verde')}</div>`);
    V.alPulsar('as-rel-vale', () => V.cierra());
  };
})();
