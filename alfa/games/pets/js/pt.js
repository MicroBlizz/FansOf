// Fans Of Pets · PT: el único objeto global del juego. Cada archivo cuelga de él sus piezas (PT.Bebe, PT.casos, PT.pantallas…) en vez de
// soltar variables globales; principal.js las compone al arrancar. Capas (docs/calidad/ARQUITECTURA.md): dominio/ (las reglas, puras),
// aplicacion/ (los casos de uso), adaptadores/ (pantalla, dibujo, partida guardada, reloj, sonido) y principal.js (la composición).
'use strict';
const PT = {};
// un resultado de dominio: lo que ha salido bien, o un error con nombre (nunca una excepción por una regla incumplida)
PT.ok = valor => ({ ok: true, valor });
PT.error = (error, datos) => ({ ok: false, error, datos });
// ¿Está abierto el prototipo? En desarrollo siempre; fuera, solo con el flag «pets-prototipo» (se abre primero en la alfa desde /gestion → Flags).
// Se pregunta en el momento, nunca en una constante: así el cambio llega sin recargar. Cerrado, solo se ve un huevo fijo.
PT.abierto = () => NUCLEO.desarrollo || NUCLEO.flag('pets-prototipo', 'Fans Of Pets: el prototipo con sus escenas reales (sin él, un huevo fijo)', false);
