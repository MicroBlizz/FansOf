// Fans of Toys · pantalla · INICIO: el título, el récord y los botones para empezar un año o seguir el que estaba a medias.
'use strict';
TY.pantallas.registra('inicio', () => {
  const C = TY.crea, d = TY.sesion.datos;
  const empieza = () => { TY.sonido.suena('produce'); TY.sesion.empieza(); TY.pantallas.sigue(); };
  const tutorial = () => { TY.sonido.suena('produce'); TY.tutorial.repite(); TY.sesion.empieza(); TY.pantallas.sigue(); };
  const pasos = ['Cada mes eliges qué fabricar, a qué precio y cuánto lo anuncias.', 'Cada tres meses hay una meta de beneficio. Si no llegas, te despiden.'];
  return C('section', { className: 'ty-pantalla ty-inicio' },
    C('div', { className: 'ty-escaparate' }, ...['bunny', 'survivalbot', 'caja', 'ceo', 'slime'].map((id, i) => Object.assign(TY.icono(id, 52), { style: `width:52px;height:52px;animation-delay:${i * -.4}s` }))),
    C('h1', { className: 'ty-logo' }, C('span', { textContent: 'FANS OF' }), C('b', { textContent: 'TOYS' })),
    C('p', { className: 'ty-lema', textContent: tr('La fábrica de juguetes de Microblizz. Año fiscal nuevo, meta nueva.') }),
    d.record !== null ? C('p', { className: 'ty-record', textContent: tr('Récord: {r} · Años jugados: {p} · Ascensos: {v}', { r: d.record, p: d.partidas, v: d.victorias }) }) : null,
    C('div', { className: 'ty-botones' },
      TY.sesion.enCurso() ? C('button', { className: 'ty-boton ty-azul', id: 'ty-continuar', textContent: tr('Seguir el año'), onclick: () => { TY.sonido.suena('boton'); TY.pantallas.sigue(); } }) : null,
      C('button', { className: 'ty-boton ty-principal', id: 'ty-empezar', textContent: tr('Empezar el año'), onclick: empieza }),
      C('div', { className: 'ty-botones-fila' },
        C('button', { className: 'ty-boton ty-dorado', id: 'ty-vitrina', textContent: tr('Vitrina {n}/{t}', { n: TY.Coleccion.cuantos(d.coleccion), t: TY.TODOS.length }),
          onclick: () => { TY.sonido.suena('boton'); TY.pantallas.ve('vitrina'); } }),
        C('button', { className: 'ty-boton ty-azul', id: 'ty-tutorial', textContent: tr('Cómo se juega'), onclick: tutorial }))),
    C('ol', { className: 'ty-ayuda' }, ...pasos.map(t => C('li', { textContent: tr(t) }))),
    C('p', { className: 'ty-nota', textContent: tr('Prototipo: los dibujos y los sonidos son provisionales.') }));
});
