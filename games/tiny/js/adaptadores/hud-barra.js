// Tiny Fans · adaptador · BARRA DEL NIDO: los botones grandes de abajo en la pantalla del nido. «Expedición» es el naranja; «Asaltos»
// no existe hasta que se abre (nada en gris); con una mochila caída, el botón de salir avisa en rojo.
'use strict';
TN.hudBarra = (() => {
  let caja = null;
  return {
    // datos: { asaltoAbierto, mochilaCaida, construyendo }; alIr(id): 'expedicion' | 'asalto' | 'construir'
    monta(capa, datos, alIr) {
      this.desmonta();
      const boton = (id, texto, clase) => TN.crea('button', { type: 'button', className: 'tn-boton ' + clase, onclick: () => alIr(id) }, TN.iconos.nodo(id, 30), TN.crea('span', { textContent: tr(texto) }));
      caja = TN.crea('nav', { className: 'tn-barra-nido' },
        boton('construir', datos.construyendo ? 'Listo' : 'Construir', datos.construyendo ? 'tn-verde' : ''),
        boton('expedicion', datos.mochilaCaida ? '¡A por la mochila!' : 'Expedición', 'tn-principal' + (datos.mochilaCaida ? ' tn-rescate' : '')),
        ...(datos.asaltoAbierto ? [boton('asalto', 'Asaltos', 'tn-asalto')] : []));
      capa.append(caja);
    },
    desmonta() { if (caja) caja.remove(); caja = null; },
  };
})();
