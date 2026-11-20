// Tiny Fans · aplicación · EVENTOS: la lista CERRADA de lo que puede pasar (con los datos que lleva cada evento) y el tablón donde se
// anuncia. El dominio no conoce el tablón: devuelve listas de eventos { tipo, …datos } y el caso de uso las anuncia con emite(). Cada
// adaptador (sonido, efectos, marcadores, guía) se apunta solo con oye(). Un tipo que no está en la lista, o un evento al que le falta
// un dato, es un fallo de programación y lanza. Añadir un evento se pide al integrador. Dueño: N1. Tabla: docs/guia/juegos/tiny/README.md.
'use strict';
TN.EVENTOS = TN.congela({
  // la expedición
  sale: [],
  'sale-nido': [], 'entra-nido': [],
  dispara: ['bicho', 'x', 'z', 'ax', 'az'],
  'golpe-bicho': ['bicho', 'clase', 'x', 'z', 'dano', 'vida'],
  'muere-bicho': ['bicho', 'clase', 'x', 'z'],
  'bicho-sale': ['bicho', 'clase', 'x', 'z'],
  mordisco: ['bicho', 'clase', 'x', 'z', 'dano', 'bateria'],
  'mordisco-perdonado': ['bicho', 'clase', 'x', 'z'],
  tela: ['x', 'z', 'segundos'],
  'voltio-suelta': ['bolita', 'x', 'z', 'voltios'],
  'voltio-recoge': ['bolita', 'x', 'z', 'voltios', 'tiene', 'meta'],
  'mejora-lista': ['oferta'],
  'mejora-elegida': ['mejora', 'nivel'],
  recoge: ['material', 'cantidad', 'x', 'z', 'total'],
  'mochila-llena': ['material', 'x', 'z'],
  'pila-usada': ['bateria', 'sola'],
  'bateria-baja': ['bateria'],
  'gigante-aviso': ['x', 'z', 'radio', 'segundos'],
  'gigante-pisa': ['x', 'z', 'radio'],
  pisoton: ['x', 'z', 'dano', 'bateria'],
  'gigante-se-va': [],
  'mochila-recuperada': ['x', 'z', 'unidades'],
  vuelve: ['botin', 'unidades', 'segundos'],
  cae: ['x', 'z', 'unidades', 'segundos'],
  // el nido
  'pieza-puesta': ['pieza', 'col', 'fila'],
  'pieza-quitada': ['pieza', 'col', 'fila'],
  'pieza-rechazada': ['pieza', 'col', 'fila', 'error'],
  'almacen-cambia': ['almacen'],
  // el asalto
  'asalto-empieza': ['segundos'],
  trampa: ['trampa', 'col', 'fila', 'x', 'z', 'dano', 'bateria'],
  'golpe-pieza': ['pieza', 'col', 'fila', 'dano', 'aguante'],
  rompe: ['pieza', 'col', 'fila'],
  'asalto-coge': ['botin', 'unidades'],
  'asalto-sale': ['botin', 'unidades', 'segundos'],
  'asalto-falla': ['motivo'],
  // el juego
  pantalla: ['de', 'a'],
  'meta-avanza': ['meta', 'tiene', 'pide'],
  'meta-cumplida': ['meta'],
});
// lo que le falta a un evento para valer: '' si está bien
TN.eventoMal = e => {
  if (!e || typeof e.tipo !== 'string' || !TN.EVENTOS[e.tipo]) return 'tipo desconocido: ' + (e && e.tipo);
  const falta = TN.EVENTOS[e.tipo].filter(campo => e[campo] === undefined);
  return falta.length ? e.tipo + ' sin ' + falta.join(', ') : '';
};
TN.creaEventos = () => {
  const oyentes = new Map(), todos = [];
  const exige = tipo => { if (!TN.EVENTOS[tipo]) throw new Error('Tiny Fans: evento desconocido «' + tipo + '»'); };
  return {
    // fn(evento) cada vez que pase algo de ese tipo (o de varios: una lista). Devuelve la función que lo desapunta
    oye(tipos, fn) {
      const lista = [].concat(tipos);
      lista.forEach(exige);
      for (const t of lista) oyentes.set(t, (oyentes.get(t) || []).concat(fn));
      return () => { for (const t of lista) oyentes.set(t, oyentes.get(t).filter(f => f !== fn)); };
    },
    // fn(evento) con todo lo que pase (medidas, pruebas)
    oyeTodo(fn) { todos.push(fn); },
    // anuncia un evento o una lista, en orden
    emite(eventos) {
      for (const e of [].concat(eventos)) {
        const mal = TN.eventoMal(e);
        if (mal) throw new Error('Tiny Fans: evento mal formado (' + mal + ')');
        for (const fn of (oyentes.get(e.tipo) || []).concat(todos)) fn(e);
      }
    },
  };
};
TN.eventos = TN.creaEventos();   // el tablón del juego: los adaptadores se apuntan al cargarse
