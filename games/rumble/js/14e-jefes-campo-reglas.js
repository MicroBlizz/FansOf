// Fans of Rumble · Jefes al campo (reglas): en el Modo Jefe, cuando la sede del jefe baja del 30 % de vida, el jefe sale a luchar.
// Solo datos y decisiones, sin pantalla ni partida (las prueba tests/rumble/jefes-campo.test.mjs). Lo que pasa en el campo: 14f-jefes-campo.js.
'use strict';
const JEFES_CAMPO = (() => {
  const UMBRAL = 0.3;   // fracción de vida de la sede a la que sale el jefe (Daniel, 6-11-2026)
  // por mundo del jefe (índice de WORLDS): qué unidad sale, su frase y qué parte de la vida de la sede le quita a la sede al morir.
  // De momento solo SurvivalBot (mundo 0); los demás jefes llegarán uno a uno, cada uno con su mecánica.
  const DATOS = Object.freeze({
    0: Object.freeze({ unidad: 'survivalbot', nombre: 'SurvivalBot', frase: 'Sobrevivo a todo… menos a las críticas.', golpe: 0.08 }),
  });
  const datos = wi => DATOS[wi] || null;
  // ¿tiene que salir ahora? Solo en el Modo Jefe, una vez por partida, con la sede viva y por debajo del umbral
  function debeSalir({ modo, hp, maxHp, yaSalio, wi }) {
    if (modo !== 'boss' || yaSalio || !datos(wi)) return false;
    return maxHp > 0 && hp > 0 && hp <= maxHp * UMBRAL;
  }
  // daño a la sede cuando cae el jefe (entero, al menos 1)
  function golpeAlCaer(maxHp, wi) {
    const J = datos(wi);
    return J ? Math.max(1, Math.round(maxHp * J.golpe)) : 0;
  }
  return Object.freeze({ UMBRAL, datos, debeSalir, golpeAlCaer });
})();
if (typeof module !== 'undefined') module.exports = JEFES_CAMPO;
