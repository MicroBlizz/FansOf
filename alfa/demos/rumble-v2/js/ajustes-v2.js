// Fans of Rumble v2 · Lo que la v2 cambia de los AJUSTES del original (se carga justo después de games/rumble/js/ajustes.js).
// Mismas reglas que el Rumble; solo cambia la partida guardada (la v2 empieza de cero y no pisa la del original).
'use strict';
AJUSTES.nombre = 'Fans of Rumble v2';
AJUSTES.guardado = 'for-v2-save-1';
// Tamaño en el campo de cada personaje animado respecto a su dibujo de siempre (1 = igual). Lo eligió Daniel con una fila
// de todos de pie junto a la torre (6-11-2026): el bastón, la pistola o lo que sobresale hacía que algunos salieran pequeños.
// Solo cambia el campo; las cartas y los retratos siguen igual. Lo lee animar-v2.js.
AJUSTES.tamanoV2 = Object.freeze({ beaver: 1.1, meercat: 1.2, mechavaca: 1.15, vaca: 1.15 });
