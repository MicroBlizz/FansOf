// Fans of Toys · dominio · COLECCIÓN: la vitrina. Una edición dorada se gana al vender un juguete `oroVentas` veces su demanda normal
// durante un año; un raro, al fabricarlo. `hallazgos` mira un mes recién cerrado; `suma` y `lee` cuidan lo guardado en la cuenta
// ({ oro: [ids], raros: [ids] }), que no se pierde al acabar el año. Puro.
'use strict';
TY.Coleccion = (() => {
  const unicos = lista => [...new Set((Array.isArray(lista) ? lista : []).filter(x => typeof x === 'string'))];
  const lee = json => ({ oro: unicos(json && json.oro), raros: unicos(json && json.raros) });
  const suma = (coleccion, hallazgos) => ({
    oro: unicos([...coleccion.oro, ...hallazgos.filter(h => h.tipo === 'oro').map(h => h.id)]),
    raros: unicos([...coleccion.raros, ...hallazgos.filter(h => h.tipo === 'raro').map(h => h.id)]),
  });

  // las ventas del año por juguete y lo nuevo que entra en la vitrina con el mes que acaba de cerrarse
  const hallazgos = (partida, resultado, juguete, reglas) => {
    const ventas = { ...partida.ventas, [juguete.id]: (partida.ventas[juguete.id] || 0) + resultado.vendidas };
    const lista = [];
    let oro = partida.oro;
    if (!juguete.raro && !oro.includes(juguete.id) && ventas[juguete.id] >= juguete.demanda * reglas.coleccion.oroVentas) {
      oro = [...oro, juguete.id];
      lista.push({ tipo: 'oro', id: juguete.id });
    }
    if (juguete.raro && resultado.unidades > 0) lista.push({ tipo: 'raro', id: juguete.id });
    return { ventas, oro, lista };
  };
  const cuantos = coleccion => coleccion.oro.length + coleccion.raros.length;
  return { lee, suma, hallazgos, cuantos };
})();
