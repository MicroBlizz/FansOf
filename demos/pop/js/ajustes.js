// Fans of Pop · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración del prototipo:
// los corazones, cuánto mide cada sala, cuántos toques de margen hay, qué slimes existen y qué pasiva tiene cada uno,
// y cómo se reparte la ruta hasta el jefe. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'pop',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-pop',    // la clave de la partida en este navegador
};

const PP_CFG = {
  vida: 5,                   // corazones; se pierde uno al quedarte sin toques con burbujas sin reventar
  equipo: 4,                 // amigos (slimes) activos como mucho
  vidaSeguir: 3,             // con cuántos corazones sigues si te quedas sin ninguno (hasta que lleguen las vidas que se recargan, fase 2)
};
// Los mundos, sus niveles y la curva de dificultad están en js/niveles.js (se generan solos).

// Los slimes rescatables y su pasiva. Todas HACEN algo en el tablero (no solo protegen): saltar a reventar burbujas,
// premios por combos o por toques gordos. COMBO = toques seguidos que revientan más burbujas de las que suben.
// El dibujo está en img/sl-<id>.png (Yoshi); mientras no esté, el juego pinta un slime de ese color con el detalle de `pinta`.
//   salta: cada cuántas burbujas reventadas salta al tablero · golpes: cuántas burbujas de la solución revienta gratis al saltar
//   combo: con qué combo actúa · gratis: toques que no cuentan · pista: burbujas marcadas · premio: toques de 4 y 5 burbujas
const PP_SLIMES = {
  bunny:   { nombre: 'CrazyBunny', color: '#f6f1ff', color2: '#cfc2ea', pinta: 'orejas',
             pasiva: 'Zanahoriazo', texto: 'Cada 8 burbujas reventadas salta al tablero y revienta gratis una de la solución.', fx: { salta: 8, golpes: 1 } },
  becario: { nombre: 'El Becario', color: '#7fc4ff', color2: '#3f86d8', pinta: 'antena',
             pasiva: 'Horas extra', texto: 'Con un COMBO x3, tu siguiente toque no cuenta.', fx: { combo: 3, gratis: 1 } },
  lola:    { nombre: 'Lola', color: '#ffb88a', color2: '#e07a3c', pinta: 'pelo',
             pasiva: 'Chivatazo', texto: 'Al entrar en una sala y con cada COMBO x2 te marca una burbuja de la solución.', fx: { combo: 2, pista: 1 } },
  cofre:   { nombre: 'Caja de botín', color: '#ffd64a', color2: '#c98a12', pinta: 'dientes',
             pasiva: 'Premio gordo', texto: 'Un toque que revienta 4 burbujas da +1 toque de margen; uno de 5, +1 corazón.', fx: { premio: 1 } },
  ceo:     { nombre: 'El CEO', color: '#8a8aa8', color2: '#4a4a66', pinta: 'corbata',
             pasiva: 'Recorte de plantilla', texto: 'Cada 15 burbujas reventadas explota y revienta gratis dos de la solución.', fx: { salta: 15, golpes: 2 } },
};
const PP_SLIME_IDS = Object.keys(PP_SLIMES);
