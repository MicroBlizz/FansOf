// Fans Of Pets · adaptador · CUIDADO JUEGO: junta un minijuego de cuidado (comer con la cuchara, la ducha; docs/pets/cuidados-minijuegos.md) con el
// muñeco 3D y el puntero. Lo usan la partida (botones COMER y BAÑAR, con PT.casos: al acabar se aplica el cuidado de verdad) y la escena de animaciones
// del panel DEV (con un «casos» de mentira que no toca la partida). Solo hay un juego a la vez.
//   empieza(juego, casos): 'comer' o 'banar' → ok, o el error de puedeCuidar (durmiendo, llena, empacho…)
//   pinta(ctx, id, edad, x, y, lado, t): el muñeco con su pose y encima el juego; false mientras el muñeco carga
//   terminado: el instante en que acabó (el cuidado ya aplicado), o -1; cierra(): lo suelta todo
'use strict';
PT.cuidadoJuego = (() => {
  const JUEGOS = { comer: PT.cuidadoComer, banar: PT.cuidadoDucha };
  let ahora = null;   // { juego, vista, suelta }: el minijuego en marcha

  function cierra() {
    if (!ahora) return;
    ahora.suelta();
    ahora = null;
  }
  function empieza(juego, casos) {
    cierra();
    const r = PT.creaCuidadoJugado(casos)[juego]();
    if (!r.ok) return r;
    const vista = JUEGOS[juego].crea(r.valor);
    ahora = { juego, vista, suelta: PT.cuidadoPuntero(document.getElementById('cv'), vista) };
    return PT.ok(juego);
  }
  function pinta(ctx, id, edad, x, y, lado, t) {
    if (!ahora) return false;
    const vista = ahora.vista, pose = vista.pose(t);
    if (!PT.muneco3d.pinta(ctx, id, x, y, lado, Math.max(0, t - pose.desde), pose.nombre, edad)) return false;
    vista.pinta(ctx, t, { ancla: hueso => PT.muneco3d.ancla(id, edad, hueso, x, y, lado), lado });
    return true;
  }
  return { empieza, pinta, cierra, get activo() { return !!ahora; }, get juego() { return ahora ? ahora.juego : ''; }, get terminado() { return ahora ? ahora.vista.terminado : -1; } };
})();
