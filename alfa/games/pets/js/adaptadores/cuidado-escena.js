// Fans Of Pets · adaptador · CUIDADO EN LA ESCENA: junta un minijuego de cuidado (comer con la cuchara, la ducha) con el muñeco 3D y el puntero. Por ahora
// solo vive en la ESCENA DE ANIMACIONES del panel DEV (docs/pets/cuidados-minijuegos.md): usa un «casos» de mentira, así que acabar un juego NO toca
// la partida. Cuando el muñeco 3D sustituya al dibujo en la partida, se le pasará PT.casos de verdad. Al acabar, a los 2,5 s empieza otra ración o ducha.
'use strict';
PT.cuidadoEscena = (() => {
  const JUEGOS = { comer: PT.cuidadoComer, banar: PT.cuidadoDucha }, REPITE = 2.5;
  const SIN_PARTIDA = { puedeCuidar: () => PT.ok(true), cuida: tipo => PT.ok(tipo) };
  let ahora = null;   // { juego, vista, suelta }: el minijuego en marcha

  function cierra() {
    if (!ahora) return;
    ahora.suelta();
    ahora = null;
  }
  function empieza(juego) {
    const cuidado = PT.creaCuidadoJugado(SIN_PARTIDA), r = cuidado[juego]();
    const vista = JUEGOS[juego].crea(r.valor);
    ahora = { juego, vista, suelta: PT.cuidadoPuntero(document.getElementById('cv'), vista) };
  }
  // pinta el muñeco con su pose y encima el minijuego. false mientras el muñeco carga (quien llama pinta lo de siempre)
  function pinta(ctx, id, etapa, x, y, lado, t, juego) {
    if (ahora && ahora.juego !== juego) cierra();
    if (!ahora) empieza(juego);
    const vista = ahora.vista, pose = vista.pose(t);
    if (!PT.muneco3d.pinta(ctx, id, x, y, lado, Math.max(0, t - pose.desde), pose.nombre, etapa)) return false;
    vista.pinta(ctx, t, { ancla: hueso => PT.muneco3d.ancla(id, etapa, hueso, x, y, lado), lado });
    if (vista.terminado >= 0 && t - vista.terminado > REPITE) { cierra(); empieza(juego); }
    return true;
  }
  return { pinta, cierra };
})();
