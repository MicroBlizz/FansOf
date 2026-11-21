// Fans of Toys · adaptador · SONIDO Y MÚSICA: los efectos del prototipo, hechos por código con el motor de core (tone: sin archivos), y la
// música, que son las canciones de la serie (core/js/serie/canciones.js, como en los demás prototipos). Suena «menu» (la de espera de
// Microblizz) en el inicio y el final; en la partida, la de la franquicia de moda del trimestre, algo más deprisa en Navidad.
// Todo es provisional: lo definitivo lo hará Yoshi cuando el prototipo se dé por bueno. Las cuatro funciones sueltas del final son las
// que pide por su nombre el motor de sonido de core.
'use strict';
TY.sonido = (() => {
  const puede = () => typeof tone === 'function';
  const SONIDOS = {
    boton: () => tone(520, 620, .05, 'square', .1),
    carta: () => tone(300, 420, .06, 'triangle', .14),
    produce: () => { tone(180, 120, .12, 'sawtooth', .14); tone(240, 480, .1, 'square', .1, .1); },
    moneda: () => tone(1100, 1500, .05, 'square', .08),
    suma: () => { [523, 659, 784].forEach((f, i) => tone(f, f, .09, 'triangle', .16, i * .07)); },
    pierde: () => { tone(260, 180, .16, 'sawtooth', .14); },
    meta: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .13, 'triangle', .18, i * .09)); },
    despido: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, f * .9, .22, 'sawtooth', .16, i * .17)); },
    noticia: () => { tone(700, 700, .07, 'square', .12); tone(700, 700, .07, 'square', .12, .12); },
    pop: () => tone(900, 1400, .05, 'square', .1),                                  // un acierto en un minijuego
    golpe: () => { tone(160, 80, .12, 'sawtooth', .16); },                          // un fallo, o el golpe de la prensa
    hallazgo: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, .1, 'triangle', .17, i * .08)); },   // algo nuevo en la vitrina
  };
  return {
    nombres: () => Object.keys(SONIDOS),
    suena(nombre) { if (puede() && SONIDOS[nombre]) SONIDOS[nombre](); },
  };
})();

// la canción de cada franquicia: las de facción de la serie; la de la Torre (oficina), la de la comunidad gamer
TY.MUSICA = TY.congela({ animales: 'animales', nomuertos: 'nomuertos', pop: 'pop', streamers: 'streamers', ciber: 'ciber', oficina: 'gamer' });
function sonidoApagado() { return false; }
function volGeneral() { return 1; }
function volMusica() { return 0.35; }
// qué canción toca: la llama principal.js cada poco
function musicUpdate() {
  if (typeof AC === 'undefined' || !AC || !M.bus || typeof TRACKS === 'undefined' || !TY.sesion) return;
  const p = TY.sesion.partida, enPartida = TY.pantallas.enPartida() && p;
  const quiere = enPartida && TRACKS[TY.MUSICA[p.moda]] ? TY.MUSICA[p.moda] : 'menu';
  if (M.name !== quiere) musicSet(quiere);
  M.tmT = enPartida && p.mes === 11 ? 1.15 : 1;
}
