// Fans of Pop · LA PRÁCTICA DE COMBOS, LAS REGLAS (dominio; tarea 396, Pepins 26-11-2026: «un nivel del principio en el que Lola explique
// los combos con ejemplos prácticos», guiado con la manita y en el nivel 6). Antes del nivel 6 (o, para quien ya pasó de ahí, de su
// próximo nivel normal) sale UNA VEZ un tablero de práctica de 5x5 lleno: la manita de Lola marca 4 toques que hacen pop en 3 o más
// cada uno, seguidos (COMBO x2, x3 y x4), y Lola lo va contando. No cuesta corazones; da solo las monedas de x3 y x4. Funciones puras: sin reloj, azar,
// SAVE ni dibujo. Lo usa js/combo-guia.js.
'use strict';
const PP_COMBO_GUIA_R = (() => {
  const LADO = 5, DESDE = 6;   // el tablero de práctica y el primer nivel del Jardín en el que sale (el 4 ya explica las ayudas y el 5 es un duelo)
  // los toques guiados (celda del 5x5 y lo que dice Lola al marcarla). Con el tablero lleno, cada uno hace pop en 3 o más:
  // 6 (5 burbujas) → 18 (5, COMBO x2) → 16 (3, x3) → 9 (4, x4)
  const PASOS = Object.freeze([
    Object.freeze({ celda: 6, t: '¡Practica los combos! Toca la manita: pop en 3 o más.' }),
    Object.freeze({ celda: 18, t: '¡Otra vez, seguido! Así se hace un COMBO.' }),
    Object.freeze({ celda: 16, t: '¡Muy bien! Desde COMBO x3 ganas monedas.' }),
    Object.freeze({ celda: 9, t: 'Tus amigos también lo suben al saltar. ¡Una más!' }),
  ]);
  const FINAL = '¡Genial! Ahora encadena combos en el nivel.';
  // ¿sale la práctica antes del nivel d? Solo si aún no la viste y con los consejos de Lola encendidos (`callada`: los
  // apagaste), en un nivel normal del camino (ni difícil, ni pesadilla, ni duelo, ni jefe) desde el nivel DESDE del Jardín
  function sale(d, vista, callada = false) {
    if (vista || callada || !d || d.dif || d.lo || d.nim || d.jefe || d.tutorial) return false;
    return d.mundo > 0 || d.l >= DESDE;
  }
  // el nivel de la práctica: 5x5 lleno, sin amigos atrapados y con toques de sobra (no se puede perder). g 0 y mundo 0: como los
  // primeros niveles, no cuesta corazón ni enseña las ayudas
  function nivel() {
    const n = LADO * LADO;
    return { g: 0, mundo: 0, l: 0, lado: LADO, mask: new Uint8Array(n).fill(1), need: new Array(n).fill(1), esp: null, opt: [],
      limite: 30, amigos: 0, tutorial: true, practica: true };
  }
  // las monedas de un paso de la práctica: como en el juego, desde x3 (x3 = 1, x4 = 2)
  const monedas = combo => (Number.isFinite(combo) && combo >= 3 ? Math.floor(combo) - 2 : 0);
  // la celda que marca la manita tras `hechos` toques (null: ya se han hecho todos)
  const marca = hechos => (hechos < PASOS.length ? PASOS[hechos].celda : null);
  // en la práctica solo vale tocar la burbuja de la manita (así los pasos, el combo y lo que dice Lola no se descuadran); hechos todos,
  // ya no vale ninguna (se espera a entrar en el nivel)
  const bloquea = (hechos, i) => i !== marca(hechos);
  return Object.freeze({ LADO, DESDE, PASOS, FINAL, sale, nivel, marca, monedas, bloquea });
})();
