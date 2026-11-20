// Fans of Toys · pantalla · FIN DEL AÑO: despedido o ascendido, las cifras del año, el récord y lo nuevo que se abre en el catálogo
// para la próxima partida.
'use strict';
TY.pantallas.registra('fin', () => {
  const C = TY.crea, p = TY.sesion.partida, c = TY.sesion.cierre || { nivelAntes: 0, nivel: 0, esRecord: false }, gana = p.fin.tipo === 'ascendido';
  const sobran = Object.values(p.stock).reduce((n, u) => n + u, 0);
  const nuevos = [...TY.JUGUETES, ...TY.MEJORAS].filter(x => x.desde > c.nivelAntes && x.desde <= c.nivel);
  const otra = () => { TY.sonido.suena('produce'); TY.sesion.empieza(); TY.pantallas.sigue(); };
  return C('section', { className: `ty-pantalla ty-fin ${gana ? 'ty-fin-gana' : 'ty-fin-pierde'}` },
    C('h1', { className: 'ty-sello-grande', textContent: tr(gana ? 'Ascendido' : 'Despedido') }),
    C('p', { className: 'ty-sub', textContent: tr(gana ? 'Has cerrado el año fiscal. Te suben a la planta 40. La meta del año que viene, también.'
      : 'El consejo te desea mucha suerte en tus nuevos proyectos. Lejos de la Torre.') }),
    C('ul', { className: 'ty-cifras' },
      C('li', {}, C('span', { textContent: tr('Beneficio del año') }), C('b', { textContent: p.beneficioTotal })),
      C('li', {}, C('span', { textContent: tr('Trimestres superados') }), C('b', { textContent: `${p.fin.trimestres} / 4` })),
      C('li', { className: c.esRecord ? 'ty-nuevo-record' : '' }, C('span', { textContent: tr(c.esRecord ? 'Nuevo récord' : 'Récord') }), C('b', { textContent: TY.sesion.datos.record }))),
    sobran > 20 ? C('p', { className: 'ty-vertedero', textContent: tr('Han sobrado {n} juguetes. El CEO propone «una solución creativa de inventario»: el vertedero.', { n: sobran }) }) : null,
    nuevos.length ? C('div', { className: 'ty-carta ty-nuevos' }, C('h3', { textContent: tr('Nuevo en el catálogo') }), ...nuevos.map(x => C('p', { textContent: tr(x.nombre) }))) : null,
    C('div', { className: 'ty-botones' },
      C('button', { className: 'ty-boton ty-principal', id: 'ty-otra', textContent: tr('Otro año'), onclick: otra }),
      C('button', { className: 'ty-boton ty-azul', textContent: tr('Inicio'), onclick: () => { TY.sonido.suena('boton'); TY.pantallas.ve('inicio'); } })));
});
