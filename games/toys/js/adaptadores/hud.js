// Fans of Toys · adaptador · MARCADORES: la franja de arriba de las pantallas de partida. Mes, dinero, la meta del trimestre con su
// barra, la franquicia de moda y los fichajes (al tocar uno, dice lo que hace). TY.hud(partida) devuelve el elemento.
'use strict';
TY.hud = partida => {
  const C = TY.crea, mes = Math.max(0, partida.mes), trimestre = TY.juego.trimestre({ ...partida, mes }), meta = TY.juego.meta({ ...partida, mes });
  const logrado = partida.beneficioTrimestre, lleno = Math.max(0, Math.min(100, logrado / meta * 100));
  const fichajes = partida.mejoras.map(id => {
    const m = TY.MEJORAS.find(x => x.id === id);
    return C('button', { className: 'ty-fichaje', title: tr(m.nombre), onclick: () => { TY.sonido.suena('boton'); TY.aviso(tr(m.nombre), tr(m.texto)); } }, TY.retrato(id, 30));
  });
  const salir = C('button', { className: 'ty-salir', textContent: tr('Salir'), onclick: () => { TY.sonido.suena('boton'); TY.pantallas.ve('inicio'); } });
  return C('header', { className: 'ty-hud' },
    C('div', { className: 'ty-hud-fila' },
      C('span', { className: 'ty-chip ty-mes' }, tr(TY.TEXTOS.meses[mes]), C('small', { textContent: ` ${mes + 1}/12` })),
      C('span', { className: 'ty-chip ty-dinero' }, TY.icono('moneda', 22), C('b', { textContent: partida.dinero })),
      salir),
    C('div', { className: 'ty-meta' },
      C('span', { textContent: tr('Meta del trimestre {n}', { n: trimestre + 1 }) }),
      C('b', { textContent: `${logrado} / ${meta}` }),
      C('i', { className: 'ty-barra' }, C('i', { className: logrado >= meta ? 'ty-llena' : '', style: `width:${lleno}%` }))),
    C('div', { className: 'ty-hud-fila ty-equipo' }, ...fichajes,
      partida.moda ? C('span', { className: 'ty-chip ty-moda', textContent: tr('De moda: {f}', { f: tr(TY.FRANQUICIAS[partida.moda]) }) }) : null));
};
