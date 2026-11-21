// Fans of Pop · LA EDAD (dominio puro; tarea #254, Pepins 20-11-2026): para no enseñar ofertas con dinero a menores. Sin SAVE, reloj, DOM ni textos.
// · clasifica(año de nacimiento, año de hoy, mayoría de edad): 'adulto' o 'menor'. Solo se pregunta el AÑO, así que ante la duda es menor:
//   adulto solo si, aun habiendo nacido a final de año, ya ha cumplido la mayoría de edad.
// · decide(edad guardada, saltada): 'vende' (adulto), 'cierra' (menor, o quien dijo «Ahora no» en esta sesión) o 'pregunta' (aún no se sabe).
// Lo usa js/edad-juego.js; la puerta de adultos (core) sigue pidiendo su multiplicación al pagar, sea cual sea la respuesta.
'use strict';
const PP_EDAD = Object.freeze((() => {
  const ANIOS_MAX = 110;
  function clasifica(anio, actual, mayor = 18) {
    const a = Number(anio);
    if (!/^\s*\d{4}\s*$/.test(String(anio)) || a < actual - ANIOS_MAX || a > actual) return Object.freeze({ ok: false, error: 'anio_invalido' });
    return Object.freeze({ ok: true, edad: actual - a > mayor ? 'adulto' : 'menor' });
  }
  function decide(edad, saltada) {
    if (edad === 'adulto') return 'vende';
    return edad === 'menor' || saltada ? 'cierra' : 'pregunta';
  }
  return { clasifica, decide };
})());
