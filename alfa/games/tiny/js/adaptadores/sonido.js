// Tiny Fans · adaptador · SONIDO: los efectos hechos por código con el motor de core (tone y noise: sin archivos) y la vibración, que se
// puede apagar. Se apunta solo a los eventos (TN.eventos.oye) y guarda el silencio en el extra 'sonido' de la partida. Sin música.
// Las cuatro funciones sueltas del final son las que pide por su nombre el motor de sonido de core.
'use strict';
TN.sonido = (() => {
  const puede = () => typeof tone === 'function' && typeof noise === 'function';
  // cada sonido: una función que llama a tone(f0, f1, segundos, onda, volumen, retraso) y noise(segundos, volumen, frecuencia, filtro, retraso)
  const SONIDOS = {
    boton: () => tone(520, 620, .06, 'square', .12),
    abre: () => { tone(400, 600, .08, 'triangle', .16); tone(600, 800, .08, 'triangle', .14, .07); },
    cierra: () => tone(600, 380, .09, 'triangle', .14),
    dispara: () => { noise(.04, .16, 2600, 'highpass'); tone(900, 500, .05, 'square', .07); },
    'golpe-bicho': () => tone(240, 160, .06, 'square', .12),
    'muere-bicho': () => { noise(.09, .2, 900, 'lowpass'); tone(300, 90, .12, 'sawtooth', .12); },
    mordisco: () => { tone(160, 90, .14, 'sawtooth', .22); noise(.08, .16, 500, 'lowpass'); },
    'voltio-recoge': () => tone(880, 1320, .07, 'sine', .14),
    'mejora-lista': () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .12, 'triangle', .18, i * .08)); },
    'mejora-elegida': () => { tone(659, 988, .14, 'triangle', .2); tone(988, 1319, .16, 'triangle', .16, .1); },
    recoge: () => { tone(660, 880, .07, 'triangle', .18); tone(880, 1100, .08, 'triangle', .16, .06); },
    'mochila-llena': () => { tone(330, 330, .09, 'square', .14); tone(262, 262, .12, 'square', .14, .1); },
    'pila-usada': () => { tone(300, 900, .22, 'sine', .2); },
    'bateria-baja': () => { tone(440, 440, .1, 'square', .16); tone(440, 440, .1, 'square', .16, .18); },
    'gigante-aviso': () => tone(90, 60, .5, 'sine', .3),
    'gigante-pisa': () => { noise(.4, .45, 220, 'lowpass'); tone(70, 35, .4, 'sine', .4); },
    pisoton: () => tone(200, 60, .3, 'sawtooth', .3),
    'mochila-recuperada': () => { [523, 784, 1047].forEach((f, i) => tone(f, f, .12, 'triangle', .2, i * .09)); },
    vuelve: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .14, 'triangle', .2, i * .09)); },
    cae: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, f * .9, .2, 'sawtooth', .18, i * .16)); },
    'pieza-puesta': () => { noise(.05, .2, 700, 'lowpass'); tone(300, 380, .07, 'triangle', .16); },
    'pieza-quitada': () => tone(380, 260, .08, 'triangle', .14),
    'pieza-rechazada': () => { tone(180, 150, .1, 'square', .16); tone(150, 120, .12, 'square', .16, .1); },
    'asalto-empieza': () => { tone(196, 196, .15, 'sawtooth', .2); tone(262, 262, .2, 'sawtooth', .2, .16); },
    trampa: () => { noise(.1, .3, 1800, 'bandpass'); tone(500, 120, .16, 'square', .18); },
    'golpe-pieza': () => noise(.05, .18, 500, 'lowpass'),
    rompe: () => { noise(.2, .3, 400, 'lowpass'); tone(200, 80, .15, 'square', .14); },
    'asalto-coge': () => { [659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .1, 'triangle', .2, i * .07)); },
    'asalto-sale': () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, .14, 'triangle', .2, i * .09)); },
    'asalto-falla': () => { [330, 262, 196].forEach((f, i) => tone(f, f * .9, .22, 'sawtooth', .18, i * .18)); },
    'meta-cumplida': () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, .16, 'triangle', .2, i * .1)); },
  };
  // lo que no debe sonar más que cada tantos milisegundos
  const FRENO = { dispara: 90, 'golpe-bicho': 60, 'voltio-recoge': 50, 'golpe-pieza': 90 }, ultimo = {};
  const ajuste = () => (TN.sesion && TN.sesion.partida.extra('sonido')) || {};
  function guarda(cambio) { TN.sesion.partida.ponExtra('sonido', { ...ajuste(), ...cambio }); TN.sesion.guarda(); if (typeof applyVolume === 'function') applyVolume(); }
  const yo = {
    nombres: () => Object.keys(SONIDOS),
    toca(nombre) {
      const f = SONIDOS[nombre], ahora = performance.now();
      if (!f || yo.apagado || !puede() || ahora - (ultimo[nombre] || 0) < (FRENO[nombre] || 0)) return false;
      ultimo[nombre] = ahora;
      if (typeof audioInit === 'function') audioInit();
      f(); return true;
    },
    vibra(nombre) {
      const ms = AJUSTES.sonido.vibra[nombre];
      if (ms && !yo.sinVibrar && navigator.vibrate) navigator.vibrate(ms);
    },
    get apagado() { return !!ajuste().apagado; },
    get sinVibrar() { return !!ajuste().sinVibrar; },
    alterna() { guarda({ apagado: !yo.apagado }); },
    alternaVibrar() { guarda({ sinVibrar: !yo.sinVibrar }); },
  };
  TN.eventos.oyeTodo(e => { yo.toca(e.tipo); yo.vibra(e.tipo); });
  return yo;
})();
function sonidoApagado() { return TN.sonido.apagado; }
function volGeneral() { return sonidoApagado() ? 0 : AJUSTES.sonido.volumen; }
function volMusica() { return 0; }
function musicUpdate() { /* el prototipo no tiene música */ }
