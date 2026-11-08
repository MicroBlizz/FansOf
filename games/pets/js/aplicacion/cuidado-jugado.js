// Fans Of Pets · aplicación · CUIDADO JUGADO: los casos de uso de los minijuegos de cuidado (comer con la cuchara, la ducha; docs/pets/cuidados-minijuegos.md).
// Empezar pregunta a la mascota si puede con ese cuidado (si no, el error de siempre: durmiendo, llena, empacho…) y crea el juego con las cifras
// de PETS.cuidado. Terminar aplica el cuidado UNA sola vez y solo si el juego ha acabado: lo abandonado a medias no cuenta. Sin pantalla.
//   casos: { puedeCuidar(tipo), cuida(tipo) } (PT.casos, o uno de mentira en la escena DEV, que no toca la partida)
// Resultado de empezar: { juego, termina() }, o el error. termina(): ok (el del cuidado), 'sin-terminar' o 'ya-aplicado'
'use strict';
PT.creaCuidadoJugado = (casos, ajustes = PETS.cuidado) => {
  function sesion(tipo, juego) {
    let aplicado = false;
    return {
      juego,
      termina() {
        if (aplicado) return PT.error('ya-aplicado');
        if (!juego.terminada) return PT.error('sin-terminar');
        const r = casos.cuida(tipo);
        aplicado = r.ok;
        return r;
      },
    };
  }
  function empieza(tipo, creaJuego) {
    const puede = casos.puedeCuidar(tipo);
    if (!puede.ok) return puede;
    const juego = creaJuego();
    return juego.ok ? PT.ok(sesion(tipo, juego.valor)) : juego;
  }
  return {
    comer: () => empieza('comer', () => PT.Comida.nueva(ajustes.comida.bocados)),
    banar: () => empieza('banar', () => PT.Ducha.nueva(Object.keys(ajustes.ducha.zonas), ajustes.ducha)),
  };
};
