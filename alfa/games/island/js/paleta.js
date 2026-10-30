// Fans of Island · LA PALETA: los materiales del píxel art (6 tonos cada uno: contorno, sombra honda, sombra, base, luz y brillo).
// Los de los personajes de la serie son los de Fans of Recruit; los del campo se sacan de un color base con rampa(). Las sombras tiran
// a morado y las luces a crema, para que todo parezca pintado con la misma caja de pinturas.
'use strict';
const PAL_OSCURO = '#2a1830', PAL_CLARO = '#fff6e0';
// los 6 tonos de un color base: hacia el oscuro común por abajo y hacia el claro común por arriba
function rampa(base, o = {}) { return material([mezcla(base, PAL_OSCURO, 0.78), mezcla(base, PAL_OSCURO, 0.5), mezcla(base, PAL_OSCURO, 0.24), base, mezcla(base, PAL_CLARO, 0.35), mezcla(base, PAL_CLARO, 0.7)], o); }
const MAT = {
  // CrazyBunny
  pelo:    material(['#3f3768', '#8580b4', '#b7b3da', '#e9e7f7', '#ffffff', '#ffffff'], { mate: true }),
  peloF:   material(['#332c58', '#5d5890', '#8580b6', '#b0acd8', '#cfccea', '#e6e4f6'], { mate: true }),   // lo del otro lado, más apagado
  rosa:    material(['#6e2148', '#b0457a', '#dc6a9e', '#f595be', '#ffbfd9', '#ffe3ef'], { mate: true }),
  crema:   material(['#5a4a3a', '#b09a7c', '#d8c4a4', '#f6e8cc', '#fff6e6', '#ffffff'], { mate: true }),
  capa:    material(['#5c1a0e', '#a02d10', '#d2501a', '#f47c20', '#ffa63d', '#ffd07a'], { mate: true }),   // también el naranja de las zanahorias
  oro:     material(['#5e3306', '#a8600e', '#dc9418', '#f9c531', '#ffe56e', '#fffac8'], { pulido: true }),
  hoja:    material(['#0f3320', '#1a5c2c', '#2c8a38', '#52b846', '#8cdc64', '#d0f8a0'], { mate: true }),
  rojo:    material(['#56101e', '#98192b', '#cf2b3b', '#f04b53', '#ff8a85', '#ffd2ca']),
  // SlyFox
  zorro:   material(['#4a1a0a', '#9a3a12', '#d05a1c', '#f47c20', '#ffa650', '#ffd0a0'], { mate: true }),
  zorroF:  material(['#3c1408', '#7a2e0e', '#a84818', '#c86020', '#e08040', '#f0a060'], { mate: true }),
  morado:  material(['#2a0e4a', '#4a1a86', '#6a26b0', '#8a3ad8', '#b070f0', '#d8b0ff'], { mate: true }),
  // el becario de Microblizz
  robot:   material(['#272c42', '#565f7e', '#808aa8', '#aab4c8', '#d0d8e6', '#f5f8fc']),
  robotO:  material(['#12141f', '#2a2f42', '#434a62', '#5d6682', '#8690aa', '#bcc6da']),
  pantalla: material(['#0a1a4a', '#12308c', '#1b4cc8', '#2f6ef0', '#6ca4ff', '#c0dcff'], { pulido: true }),
  blanco:  material(['#3c3a52', '#8684a0', '#b6b4c8', '#e2e0ea', '#f6f5fa', '#ffffff']),
  acero:   material(['#10121b', '#262b39', '#414859', '#5f687d', '#8d97ac', '#d5dceb'], { pulido: true }),
  // el campo
  madera:  rampa('#a0683a', { mate: true }),
  bloque:  rampa('#f0a8a0', { mate: true }),    // plastelina rosa
  bloqueA: rampa('#f0d8a0', { mate: true }),    // plastelina amarilla
  bloqueZ: rampa('#a8c8f0', { mate: true }),    // plastelina azul
  hilo:    rampa('#f0b24a', { mate: true }),    // ganchillo de las plataformas
  hiloR:   rampa('#e85a3c', { mate: true }),    // el hilo de las barreras (se quema)
  hiloM:   rampa('#b06ae0', { mate: true }),    // el hilo de las puertas (lo desteje el botón)
  pintura: rampa('#6a8af0', { mate: true }),    // las manchas de pintura (las disuelve el agua)
  boton:   rampa('#ff6a8a', { mate: true }),
  botonOk: rampa('#8fd36a', { mate: true }),
  seta:    rampa('#e2463b', { mate: true }),
  tulipan: rampa('#e8703a', { mate: true }),
  tulipanR: rampa('#e86aa0', { mate: true }),
  bandera: rampa('#ff7a1a', { mate: true }),
  // las zanahorias de poder, cada una de su color (zanahorias.js), y las pequeñas
  zRoja:   rampa('#ff5a3c', { mate: true }),
  zVerde:  rampa('#8fd36a', { mate: true }),
  zAzul:   rampa('#5fb8ff', { mate: true }),
  zMorada: rampa('#b57bff', { mate: true }),
  zDorada: material(['#5e3306', '#a8600e', '#dc9418', '#ffcb3d', '#ffe56e', '#fffac8'], { pulido: true }),
};
