// Fans of Toys · pantalla · NOTICIA: una noticia que pide decidir entre dos opciones antes de fabricar. Enseña también el caso real
// en que se inspira.
'use strict';
TY.pantallas.registra('noticia', () => {
  const C = TY.crea, p = TY.sesion.partida, n = TY.NOTICIAS.find(x => x.id === p.noticia.id);
  const decide = i => { TY.sonido.suena('boton'); TY.sesion.decideNoticia(i); TY.pantallas.sigue(); };
  TY.sonido.suena('noticia');
  return C('section', { className: 'ty-pantalla ty-noticia' }, TY.hud(p),
    C('article', { className: 'ty-carta ty-periodico' },
      C('span', { className: 'ty-cabecera', textContent: tr('Noticia del mes') }),
      C('h2', { textContent: tr(n.titulo) }),
      C('p', { textContent: tr(n.texto) }),
      C('p', { className: 'ty-real' }, C('b', { textContent: tr('Pasó de verdad:') }), ' ' + tr(n.real))),
    C('div', { className: 'ty-botones' }, ...n.opciones.map((o, i) => C('button', { className: `ty-boton ${i ? 'ty-azul' : 'ty-principal'}`, textContent: tr(o.texto), onclick: () => decide(i) }))));
});
