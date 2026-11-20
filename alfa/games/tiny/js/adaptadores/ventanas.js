// Tiny Fans · adaptador · VENTANAS: los avisos del juego con pinta de oficina (nota adhesiva, hoja o circular de MicroBlizz). Una a la
// vez, encima de todo; el fondo no deja pasar los toques, así que ninguno se pierde ni se cuela al juego.
'use strict';
TN.ventanas = (() => {
  let velo = null, alCerrar = null;
  const yo = {
    // { clase: 'nota' | 'hoja' | 'circular', titulo, cuerpo (texto o elemento), sello, botones: [{ texto, clase, alPulsar }], alCerrar }
    abre(d) {
      yo.cierra();
      alCerrar = d.alCerrar || null;
      const botones = (d.botones || [{ texto: tr('Vale') }]).map(b => TN.crea('button', { type: 'button', className: 'tn-boton ' + (b.clase || 'tn-principal'), textContent: b.texto,
        onclick: () => { yo.cierra(); if (b.alPulsar) b.alPulsar(); } }));
      const cuerpo = typeof d.cuerpo === 'string' ? TN.crea('p', { textContent: d.cuerpo }) : (d.cuerpo || '');
      velo = TN.crea('div', { className: 'tn-ventana tn-velo' }, TN.crea('section', { className: 'tn-papel tn-' + (d.clase || 'nota') },
        d.sello ? TN.crea('span', { className: 'tn-sello-rojo', textContent: d.sello }) : '', TN.crea('h2', { className: 'tn-titulo', textContent: d.titulo || '' }), cuerpo, TN.crea('div', { className: 'tn-fila' }, ...botones)));
      TN.capa().append(velo);
    },
    cierra() { if (!velo) return; velo.remove(); velo = null; const f = alCerrar; alCerrar = null; if (f) f(); },
    get abierta() { return !!velo; },
    circular(texto, fin) { yo.abre({ clase: 'circular', titulo: tr('CIRCULAR DE MICROBLIZZ'), cuerpo: texto, sello: tr('URGENTE'), alCerrar: fin }); },
  };
  return yo;
})();
