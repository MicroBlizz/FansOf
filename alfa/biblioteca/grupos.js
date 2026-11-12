// Fans Of · LA PORTADA · en qué grupo de la biblioteca va cada tarjeta (ADR 102). Regla pura: sin pantalla ni almacenamiento. La usa biblioteca/agrupar.js.
// Dos ejes aparte: el TIPO de la tarjeta (data-tipo: «Juego», «Prototipo» o «En pausa») y si se puede JUGAR aquí (core/js/proximamente.js).
//   jugar        → «Juega ya»: un juego que se puede jugar.
//   proximamente → «Próximamente»: un juego que aún no está abierto.
//   prototipos   → todo lo que no es un juego terminado (demos, bocetos y pruebas incluidos), se juegue o no.
//   pausa        → lo parado.
'use strict';
const GRUPOS = (() => {
  const de = (tipo, jugable) => {
    if (tipo === 'En pausa') return 'pausa';
    if (tipo === 'Juego') return jugable ? 'jugar' : 'proximamente';
    return 'prototipos';
  };
  return { de };
})();
