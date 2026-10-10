// Fans of Roguelite · Datos del conejo y de sus habilidades: 23 habilidades con 3 niveles cada una, con las rarezas y colores
// del juego (Común gris, Poco común verde, Rara azul, Épica lila y Legendaria naranja). Las cifras de cada nivel van en v.
// En d, {v} es la cifra del nivel; si d es una lista, cada nivel tiene su frase.
'use strict';

const HEROE_BASE = { vida: 100, atq: 12, crit: 0.08 };
const SUBIDA = { vida: 8, atq: 2, cura: 0.2 };   // al subir de nivel: +vida máxima, +ataque y te curas un 20 % (más con la Siesta)
const NIVEL_MAX_HAB = 3;
const xpPara = n => 12 + n * 6;                   // experiencia para pasar del nivel n al siguiente

// rarezas: nombre, color claro y oscuro (los mismos que core/js/serie/catalogo.js)
const RAREZA = {
  basic: ['Común', '#c3c9d4', '#5f6673'], common: ['Poco común', '#7be04a', '#2f8a1c'], rare: ['Rara', '#5aaeff', '#1d5fc9'],
  epic: ['Épica', '#d08cff', '#6d28c9'], legendary: ['Legendaria', '#ffb547', '#d9620c'],
};
const ORDEN_RAREZA = ['basic', 'common', 'rare', 'epic', 'legendary'];
const PESO = { basic: 34, common: 30, rare: 22, epic: 10, legendary: 4 };
const PESO_COFRE = { rare: 55, epic: 33, legendary: 12 };

const HABILIDADES = {
  zanahoria: { n: 'Zanahoria afilada', rar: 'basic', d: '+{v} de ataque.', v: [4, 5, 6], suma: true },
  pelusa:    { n: 'Pelusa extra', rar: 'basic', d: '+{v} de vida máxima y te curas lo mismo.', v: [25, 30, 35], suma: true },
  cafeina:   { n: 'Cafeína', rar: 'basic', d: 'Al empezar cada combate, un golpe gratis de {v}.', v: [8, 14, 20] },
  piel:      { n: 'Piel dura', rar: 'basic', d: 'Cada golpe que recibes hace {v} menos.', v: [2, 3, 4] },
  rabia:     { n: 'Rabia', rar: 'common', d: 'Un {v} % de las veces pegas dos veces.', v: [25, 35, 45] },
  botiquin:  { n: 'Botiquín del bosque', rar: 'common', d: 'Te curas el {v} % del daño que haces.', v: [12, 20, 28] },
  reflejos:  { n: 'Reflejos', rar: 'common', d: 'Un {v} % de esquivar cada golpe.', v: [10, 15, 20] },
  espinas:   { n: 'Pelo de erizo', rar: 'common', d: 'Devuelves el {v} % del daño que recibes.', v: [25, 40, 55] },
  hucha:     { n: 'Hucha rota', rar: 'common', d: '+{v} % de monedas.', v: [25, 45, 65] },
  espiral:   { n: 'Ojo en espiral', rar: 'rare', d: '+{v} % de golpes críticos (daño x2).', v: [12, 20, 28] },
  bellotas:  { n: 'Lluvia de bellotas', rar: 'rare', d: 'Cada 3 turnos caen 3 bellotas de {v} de daño.', v: [7, 11, 15] },
  pulgas:    { n: 'Pulgas', rar: 'rare', d: 'El enemigo pierde su primer turno y un {v} % de los demás.', v: [10, 20, 30] },
  carton:    { n: 'Escudo de cartón', rar: 'rare', d: 'Empiezas cada combate con un escudo de {v}.', v: [20, 35, 50] },
  basura:    { n: 'Bolsa de JunkCoon', rar: 'rare', d: 'Cada 4 turnos, JunkCoon lanza una bolsa de basura: {v} de daño.', v: [24, 36, 50] },
  vampira:   { n: 'Zanahoria vampira', rar: 'rare', d: 'Cada golpe crítico te cura {v}.', v: [8, 12, 16] },
  ardilla:   { n: 'MadSquirrel', rar: 'epic', d: 'Una ardilla te sigue y muerde cada turno: {v} de daño.', v: [6, 10, 14] },
  huelga:    { n: 'Huelga general', rar: 'epic', d: ['El primer golpe de cada combate no te hace nada.', 'Los 2 primeros golpes de cada combate no te hacen nada.', 'Los 3 primeros golpes de cada combate no te hacen nada.'], v: [1, 2, 3] },
  castor:    { n: 'BoomBeaver', rar: 'epic', d: 'Al empezar cada combate, un castor con dinamita explota: {v} de daño.', v: [30, 50, 75] },
  meercat:   { n: 'MeerCat enfermera', rar: 'epic', d: 'Te cura {v} cada turno.', v: [5, 8, 12] },
  zorro:     { n: 'SlyFox', rar: 'epic', d: 'Tu primer golpe de cada combate hace x{v}.', v: [3, 4, 5] },
  chaos:     { n: 'Chaos Jump', rar: 'legendary', d: 'Cada 3 turnos saltas encima del enemigo: daño x{v}.', v: [3, 4, 5] },
  mechavaca: { n: 'MechaVaca', rar: 'legendary', d: 'Si caes, la MechaVaca te salva una vez con el {v} % de vida.', v: [40, 60, 80] },
  corona:    { n: 'Corona torcida', rar: 'legendary', d: '+{v} % de ataque y de vida máxima.', v: [15, 15, 15], suma: true },
};
