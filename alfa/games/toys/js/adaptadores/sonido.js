// Fans of Toys · adaptador · SONIDO: los efectos del prototipo, hechos por código con el motor de core (tone: sin archivos). Son
// provisionales: los definitivos los hará Yoshi cuando el prototipo se dé por bueno. Si core no trae sonido, no suena y no pasa nada.
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
  };
  return {
    nombres: () => Object.keys(SONIDOS),
    suena(nombre) { if (puede() && SONIDOS[nombre]) SONIDOS[nombre](); },
  };
})();
