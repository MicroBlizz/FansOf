// Fans of Toys · pantalla · VITRINA: lo que has conseguido y no se pierde al acabar el año. Diez ediciones doradas (se ganan vendiendo
// mucho un juguete en un año) y seis juguetes raros (errores de fábrica que a veces salen en el mes). Lo que falta sale en silueta; al
// tocar una pieza, dice qué es o cómo se consigue.
'use strict';
TY.pantallas.registra('vitrina', () => {
  const C = TY.crea, col = TY.sesion.datos.coleccion, total = TY.JUGUETES.length + TY.RAROS.length;
  const pista = (j, tipo) => (tipo === 'oro' ? tr('Véndelo hasta llegar a {n} unidades en un mismo año.', { n: j.demanda * AJUSTES.coleccion.oroVentas })
    : tr('Sale a veces en la fábrica, como error de fábrica. Fabrícalo para guardarlo.'));
  const pieza = (j, tipo) => {
    const tiene = (tipo === 'oro' ? col.oro : col.raros).includes(j.id);
    const nombre = tr(j.nombre), detalle = tipo === 'oro' ? tr('Edición dorada: vendiste muchísimos.') : tr(j.texto);
    return C('button', { className: `ty-vit ${tiene ? (tipo === 'oro' ? 'ty-es-oro' : 'ty-es-raro') : 'ty-bloqueada'}`,
      onclick: () => { TY.sonido.suena('carta'); TY.aviso(tiene ? nombre : '???', tiene ? detalle : pista(j, tipo)); } },
      TY.icono(j.id, 56), C('small', { textContent: tiene ? nombre : '???' }));
  };
  const seccion = (titulo, lista, tipo) => [C('h3', { className: 'ty-vit-titulo', textContent: tr(titulo) }), C('div', { className: 'ty-vit-rejilla' }, ...lista.map(j => pieza(j, tipo)))];
  return C('section', { className: 'ty-pantalla ty-vitrina' },
    C('h2', { className: 'ty-titulo', textContent: tr('Vitrina') }),
    C('p', { className: 'ty-sub', textContent: tr('{n} de {t} piezas', { n: TY.Coleccion.cuantos(col), t: total }) }),
    ...seccion('Ediciones doradas', TY.JUGUETES, 'oro'), ...seccion('Juguetes raros', TY.RAROS, 'raro'),
    C('div', { className: 'ty-botones' }, C('button', { className: 'ty-boton ty-azul', id: 'ty-vit-volver', textContent: tr('Volver'), onclick: () => { TY.sonido.suena('boton'); TY.pantallas.ve('inicio'); } })));
});
