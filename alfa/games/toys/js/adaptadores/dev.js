// Fans of Toys · adaptador · GANCHOS DE PRUEBA (TY.dev): lo que usan el smoke-test y los probadores para mirar y mover la partida sin
// tocar la pantalla. Solo lee o llama a la sesión: no tiene reglas propias.
'use strict';
TY.dev = {
  estado: () => ({ pantalla: TY.pantallas.actual, partida: TY.sesion.partida, datos: TY.sesion.datos }),
  sinAnimaciones() { TY.animado = false; },
  // juega sola hasta la fase que se pida (o hasta el final), con la jugada más sencilla
  avanza(hastaFase) {
    for (let i = 0; i < 80; i++) {
      const p = TY.sesion.partida;
      if (!p || p.fase === 'fin' || p.fase === hastaFase) break;
      if (p.fase === 'director' || p.fase === 'mejora') TY.sesion.eligeMejora(p.ofertaMejoras[0]);
      else if (p.fase === 'noticia') TY.sesion.decideNoticia(0);
      else if (p.fase === 'resultado') TY.sesion.sigue();
      else TY.sesion.produce({ juguete: p.oferta[0], cantidad: TY.juego.plan(p, { juguete: p.oferta[0], cantidad: 'poca', precio: 'normal', publicidad: 'nada' }).puede ? 'poca' : 'nada', precio: 'normal', publicidad: 'nada' });
    }
    TY.pantallas.sigue();
  },
};
