// Tiny Fans · adaptador · RESUMEN de una salida: una sola pantalla con lo que traes (o lo que has perdido si caes), la meta que tienes
// a medias y el botón naranja para salir otra vez de un toque.
'use strict';
TN.hudResumen = (() => {
  let caja = null;
  const TITULO = { vuelve: '¡De vuelta en el nido!', cae: 'Sin batería', 'asalto-sale': '¡Asalto conseguido!', 'asalto-falla': 'El asalto ha fallado' };
  const linea = (material, cantidad) => TN.crea('li', {}, TN.iconos.nodo(material, 34), TN.crea('b', { textContent: '+' + cantidad }), TN.crea('span', { textContent: tr(TN.textos.materiales[material] || material) }));
  return {
    // datos: { motivo, botin: { material: cantidad }, unidades, segundos, meta: { texto, tiene, pide } | null, rescate: bool }; acciones: { otra(), nido() }
    abre(d, acciones) {
      this.cierra(); TN.guia.limpia();
      const cae = d.motivo === 'cae' || d.motivo === 'asalto-falla', botin = Object.entries(d.botin || {}).filter(([, c]) => c > 0);
      const cuerpo = cae
        ? TN.crea('p', { className: 'tn-aviso', textContent: d.aviso || tr(d.unidades ? 'Tu mochila se ha quedado en el suelo. Tienes 4 horas para ir a por ella.' : 'Te has quedado sin batería. No llevabas nada: no pierdes nada.') })
        : (botin.length ? TN.crea('ul', { className: 'tn-botin' }, ...botin.map(([m, c]) => linea(m, c))) : TN.crea('p', { className: 'tn-aviso', textContent: tr('Has vuelto con la mochila vacía.') }));
      const meta = d.meta ? TN.crea('div', { className: 'tn-meta' }, TN.crea('span', { textContent: d.meta.texto }), TN.crea('span', { className: 'tn-barra' }, TN.crea('i', { style: `width:${Math.min(100, d.meta.tiene / d.meta.pide * 100)}%` })), TN.crea('b', { textContent: d.meta.tiene + '/' + d.meta.pide })) : '';
      caja = TN.crea('div', { className: 'tn-ventana tn-resumen' + (cae ? ' tn-cae' : '') },
        TN.crea('h2', { className: 'tn-titulo', textContent: tr(TITULO[d.motivo] || '') }), cuerpo, meta,
        ...(d.construir
          ? [TN.crea('button', { type: 'button', className: 'tn-boton tn-verde tn-grande', textContent: tr('¡A construir!'), onclick: acciones.nido }),
            TN.crea('button', { type: 'button', className: 'tn-boton tn-principal', textContent: tr('Otra salida'), onclick: acciones.otra })]
          : [TN.crea('button', { type: 'button', className: 'tn-boton tn-principal tn-grande', textContent: tr(d.motivo === 'cae' && d.unidades ? 'Ir a por ella' : 'Otra salida'), onclick: acciones.otra }),
            TN.crea('button', { type: 'button', className: 'tn-boton', textContent: tr('Al nido'), onclick: acciones.nido })]));
      TN.capa().append(caja);
    },
    cierra() { if (caja) caja.remove(); caja = null; },
    get abierto() { return !!caja; },
  };
})();
