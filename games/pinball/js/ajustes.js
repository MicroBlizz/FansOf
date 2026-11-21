// Fans of Pinball · AJUSTES: lo que core necesita saber del juego (nombre y clave de la partida) y las cifras del bucle. El resto de
// cifras del prototipo (docs/pinball/PROTOTIPO.md) va por temas en js/ajustes/*.js. Cada cifra dice de dónde sale: (espec.) la fija
// la especificación o una decisión de Pepins; (MOVIL) sale de docs/pinball/MOVIL.md; (partida) es un valor de partida que se ajusta al
// probar. El dominio nunca lee AJUSTES por su cuenta: lo recibe como `reglas` al crear la partida.
'use strict';
const AJUSTES = {
  // sin `id` a propósito (como Tiny): la cuenta de core queda apagada y el récord del prototipo vive solo en este móvil
  id: '',
  nombre: 'Fans of Pinball',
  guardado: 'for-pinball-v1',   // la clave de la partida guardada en este navegador
  sinFeedback: true,            // la pestaña de feedback de core necesita cuenta: en el prototipo no sale
};
// la física va con paso fijo y separada del pintado (MOVIL.md, apartado 2)
AJUSTES.simulacion = PB.congela({
  pasosPorSegundo: 240,         // (MOVIL) divide exacto 60 y 120 Hz
  maxPasosPorFotograma: 24,     // (MOVIL) unos 100 ms de física como mucho por cuadro: evita la espiral de cuadros lentos
  saltoMaximoMs: 250,           // (MOVIL) un salto mayor con la partida en marcha tira el tiempo sobrante y pausa
});
