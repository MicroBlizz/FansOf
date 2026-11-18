// Fans of Spy · DOMINIO · La previsión: lo que la pantalla enseña ANTES de confirmar un movimiento, sin cambiar la partida.
// El camino hasta una casilla, en qué casillas del camino lo vería alguien (ahora mismo, sin contar lo que se muevan después)
// y qué guardias oirían el ruido al llegar. Así pisar un cono es siempre una decisión y no una sorpresa.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const R = S.rejilla, G = S.guardias, C = S.cartas;
  const ATENTOS = ['tranquilo', 'vuelve', 'sospecha', 'mira'];

  // Los guardias que oirían un ruido de `radio` casillas hecho en `celda`.
  const oyen = (c, celda, radio) => (radio > 0 ? c.p.guardias.filter((g) => ATENTOS.includes(g.estado) && R.cheb(g, celda) <= radio).map((g) => g.id) : []);

  // El camino del agente hasta `destino` andando como mucho `pasos` casillas. null si no llega.
  function camino(c, destino, pasos, radio) {
    const lista = R.camino(R.alcance(pisable(c), c.p.agente, pasos), destino);
    if (!lista || !lista.length) return null;
    const pasosVistos = lista.map((q) => ({ x: q.x, y: q.y, ven: G.quienVe(c, q) }));
    return { camino: pasosVistos, teVen: pasosVistos.some((q) => q.ven.length > 0), oyen: oyen(c, destino, radio) };
  }
  const pisable = (c) => (x, y) => c.planta.pisaAgente(x, y) && !c.p.guardias.some((g) => g.estado !== 'derribado' && g.x === x && g.y === y);

  // Todo lo que ve cada vigía ahora mismo, para pintar los conos: [{ id, clase, estado, celdas }].
  function conos(c) {
    const estado = (id) => (c.p.guardias.find((g) => g.id === id) || {}).estado || 'tranquilo';
    return G.vigias(c).map((v) => ({ id: v.id, clase: v.clase, estado: v.clase === 'camara' ? 'camara' : estado(v.id), celdas: S.vision.celdas(c.planta, v.ojos) }));
  }

  S.prevision = Object.freeze({ camino, oyen, conos, destinos: C.destinos });
})(SPY);
