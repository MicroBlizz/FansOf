// Fans of Karts · VOLUMEN: las barras de Efectos y Música son de core (VOLUMEN, ADR 037); aquí está la mezcla de Karts y el paso de lo guardado de antes.
// Va después de lo común (core/js/sistema/volumen.js) y antes de audio.js, que usa KVOL. Los números viven en AJUSTES (js/ajustes.js).
'use strict';
// Quien guardó el silencio o la música apagada de antes pasa a las barras a cero
const KVOL = VOLUMEN.crear({ musicaBase: 0.5 });   // la música a la mitad (el valor de serie) suena a 0,25, como antes
if (AJUSTES.mudo !== undefined || AJUSTES.sinMusica !== undefined) { AJUSTES.muted = AJUSTES.mudo; AJUSTES.musica = !AJUSTES.sinMusica; delete AJUSTES.mudo; delete AJUSTES.sinMusica; }
KVOL.migra(AJUSTES);
