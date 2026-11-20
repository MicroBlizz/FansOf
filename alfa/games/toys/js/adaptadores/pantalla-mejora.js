// Fans of Toys · pantalla · MEJORA: elegir 1 de 3 ejecutivos o políticas de empresa. Sale al empezar el año (el primer fichaje) y al
// pasar la meta de cada trimestre.
'use strict';
TY.pantallas.registra('mejora', () => {
  const C = TY.crea, p = TY.sesion.partida, primera = p.fase === 'director';
  const elige = id => { TY.sonido.suena('suma'); TY.sesion.eligeMejora(id); TY.pantallas.sigue(); };
  const carta = id => {
    const m = TY.MEJORAS.find(x => x.id === id);
    return C('article', { className: 'ty-carta ty-carta-mejora' }, TY.retrato(id, 60),
      C('div', {}, C('h3', { textContent: tr(m.nombre) }), C('p', { textContent: tr(m.texto) })),
      C('button', { className: 'ty-boton ty-principal ty-fichar', textContent: tr('Fichar'), onclick: () => elige(id) }));
  };
  return C('section', { className: 'ty-pantalla ty-mejora' },
    C('h2', { className: 'ty-titulo', textContent: tr(primera ? 'Tu primer fichaje' : 'Meta conseguida') }),
    C('p', { className: 'ty-sub', textContent: tr(primera ? 'Elige con quién empiezas el año. Cada uno cambia una regla.' : 'El consejo está contento. Elige una mejora para lo que queda de año.') }),
    ...p.ofertaMejoras.map(carta));
});
