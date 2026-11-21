// Tiny Fans · AJUSTES: lo que core necesita saber del juego (nombre y clave de la partida) y las cifras de la simulación. El resto de
// cifras del prototipo (docs/tiny/PROTOTIPO.md) va por temas en js/ajustes/*.js, cada tema con un solo dueño (lo dice su cabecera).
// Cada cifra dice de dónde sale: (cuaderno) la decidió Pepins; (partida) es un valor de partida que se ajusta al probar.
// El dominio nunca lee AJUSTES por su cuenta: lo recibe como `reglas`. Dueño de este archivo: N1 (arquitectura).
'use strict';
const AJUSTES = {
  // sin `id` a propósito (como Pets): la cuenta de core queda apagada y la partida del prototipo vive solo en este móvil
  id: '',
  nombre: 'Tiny Fans',
  guardado: 'for-tiny-v1',      // la clave de la partida en este navegador
  sinFeedback: true,            // la pestaña de feedback de core necesita cuenta: en el prototipo no sale
};
// la simulación va con paso fijo y separada del pintado (ADR 170)
AJUSTES.simulacion = TN.congela({
  pasosPorSegundo: 30,          // (decisión) pasos de simulación por segundo
  maxPasosPorFotograma: 5,      // (partida) si el móvil se atasca, no se recupera más que esto de golpe
});
// el gestor de pantallas
AJUSTES.pantallas = TN.congela({
  inicial: 'nido',              // (cuaderno) la pantalla principal es el nido en vivo
});
