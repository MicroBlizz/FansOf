// Fans of Pinball · adaptador · VENTANAS: las ventanas del juego (mejoras, resultado, pausa, avisos). Una a la vez, encima de todo; el velo
// no deja pasar los toques, así que ninguno se pierde ni acciona una pala. Cerrarla por cualquier camino llama a su alCerrar.
'use strict';
PB.ventanas = (() => {
  let velo = null, alCerrar = null;
  const yo = {
    // { clase, titulo, cuerpo: [elementos], botones: [{ texto, clase, alPulsar }], alCerrar }
    abre(d) {
      yo.cierra();
      alCerrar = d.alCerrar || null;
      const botones = (d.botones || []).map(b => PB.crea('button', { type: 'button', className: 'pb-boton ' + (b.clase || 'pb-naranja'), textContent: b.texto,
        onclick: () => { if (PB.sonido) PB.sonido.toca('boton'); if (!b.queda) yo.cierra(); if (b.alPulsar) b.alPulsar(); } }));
      const hoja = PB.crea('section', { className: 'pb-hoja ' + (d.clase || '') },
        d.titulo ? PB.crea('h2', { className: 'pb-titulo', textContent: d.titulo }) : '', ...(d.cuerpo || []),
        botones.length ? PB.crea('div', { className: 'pb-fila' }, ...botones) : '');
      velo = PB.crea('div', { className: 'pb-ventana' }, hoja);
      velo.addEventListener('pointerdown', e => e.stopPropagation());
      PB.capa().append(velo);
      return hoja;
    },
    cierra() {
      if (!velo) return;
      velo.remove(); velo = null;
      const f = alCerrar; alCerrar = null;
      if (f) f();
    },
    get abierta() { return Boolean(velo); },
  };
  return yo;
})();
