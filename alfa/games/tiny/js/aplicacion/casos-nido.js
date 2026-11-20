// Tiny Fans · aplicación · CASOS DE USO DEL NIDO: colocar, quitar y mover piezas. No tienen reglas: cargan el nido de la partida, piden
// al dominio, anuncian los eventos y guardan. Un intento rechazado se anuncia como 'pieza-rechazada'. Puertos: { reglas, sesion, reloj, eventos }.
'use strict';
TN.creaCasosNido = ({ reglas, sesion, eventos }) => {
  const carga = () => { const r = TN.Nido.desdeJson(reglas, sesion.partida.nido); return r.ok ? r.valor : TN.Nido.nuevo(reglas); };
  // hace la acción sobre el nido cargado y, si sale bien, lo guarda y anuncia lo que ha pasado
  function hace(accion, pieza, col, fila) {
    const n = carga(), r = accion(n);
    if (!r.ok) { eventos.emite({ tipo: 'pieza-rechazada', pieza: pieza || '', col, fila, error: r.error }); return r; }
    sesion.partida.ponNido(n.aJson()); sesion.guarda();
    eventos.emite(r.valor);
    return r;
  }
  return {
    get nido() { return carga(); },
    coloca: (pieza, col, fila) => hace(n => n.coloca(pieza, col, fila), pieza, col, fila),
    quita: (col, fila) => hace(n => n.quita(col, fila), '', col, fila),
    mueve: (col, fila, aCol, aFila) => hace(n => n.mueve(col, fila, aCol, aFila), '', aCol, aFila),
  };
};
