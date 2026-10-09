// Fans of Roguelite (prototipo) · Los datos: el conejo, los enemigos, las habilidades (con las rarezas y colores del juego) y los
// 6 días del viaje de La Madriguera a las oficinas de Microblizz. Las cifras son de prueba.
'use strict';

const HEROE_BASE = { vida: 100, atq: 12, crit: 0.1 };
const SUBIDA = { vida: 12, atq: 3, cura: 0.3 };   // al subir de nivel: +vida máxima, +ataque y te curas un 30 %

// rarezas: nombre, color claro y oscuro (los mismos que core/js/serie/catalogo.js)
const RAREZA = {
  basic: ['Común', '#c3c9d4', '#5f6673'], common: ['Poco común', '#7be04a', '#2f8a1c'], rare: ['Rara', '#5aaeff', '#1d5fc9'],
  epic: ['Épica', '#d08cff', '#6d28c9'], legendary: ['Legendaria', '#ffb547', '#d9620c'],
};
const PESO = { basic: 34, common: 30, rare: 22, epic: 10, legendary: 4 };
const PESO_COFRE = { rare: 55, epic: 33, legendary: 12 };

const HABILIDADES = {
  zanahoria: { n: 'Zanahoria afilada', rar: 'basic', d: '+5 de ataque.', varias: true },
  pelusa:    { n: 'Pelusa extra', rar: 'basic', d: '+30 de vida máxima y te curas 30.', varias: true },
  rabia:     { n: 'Rabia', rar: 'common', d: 'Un 35 % de las veces pegas dos veces.' },
  botiquin:  { n: 'Botiquín del bosque', rar: 'common', d: 'Te curas el 25 % del daño que haces.' },
  espiral:   { n: 'Ojo en espiral', rar: 'rare', d: '+25 % de golpes críticos (daño x2).' },
  bellotas:  { n: 'Lluvia de bellotas', rar: 'rare', d: 'Cada 3 turnos caen 3 bellotas de 7 de daño.' },
  pulgas:    { n: 'Pulgas', rar: 'rare', d: 'El enemigo se rasca y pierde su primer turno.' },
  ardilla:   { n: 'MadSquirrel', rar: 'epic', d: 'Una ardilla te sigue y muerde cada turno: 6 de daño.' },
  huelga:    { n: 'Huelga general', rar: 'epic', d: 'El primer golpe de cada combate no te hace nada.' },
  chaos:     { n: 'Chaos Jump', rar: 'legendary', d: 'Cada 3 turnos saltas encima del enemigo: daño x3.' },
};

const ENEMIGOS = {
  becario: { n: 'Becario', vida: 40, atq: 7, monedas: 6, spr: 'becario', alto: 30,
    llega: 'Un Becario de Microblizz te corta el paso con un café en la mano.', frase: '¿Esto cuenta como prácticas?', muere: 'Por fin, vacaciones…' },
  starbot: { n: 'StarBot', vida: 64, atq: 10, monedas: 9, spr: 'starbot', alto: 34, vuela: 18,
    llega: 'Un StarBot baja del cielo. Te está grabando para un anuncio.', frase: 'Escaneando… talento no rentable.', muere: 'Error 404: dron no encontrado.' },
  caja: { n: 'CajaBotín', vida: 96, atq: 12, monedas: 15, spr: 'caja', alto: 24, salta: true,
    llega: 'Una CajaBotín brillante en mitad del camino. Huele a trampa.', frase: '¡Ábreme! Solo 9,99 €.', muere: 'Contenía… polvo.' },
  jefe: { n: 'SurvivalBot', vida: 260, atq: 15, monedas: 40, spr: 'jefe', alto: 70, jefe: true,
    llega: 'SurvivalBot vigila la puerta de las oficinas. Lleva corbata.', frase: 'Tu puesto ha sido optimizado.', muere: 'Error: no encuentro mi finiquito.', especial: '¡Despido fulminante!' },
};

const DIAS = [
  { tipo: 'combate', enemigo: 'becario', titulo: 'La compra', intro: 'Microblizz ha comprado el bosque. CrazyBunny sale de La Madriguera con su zanahoria.' },
  { tipo: 'eleccion', titulo: 'El café de Lola', prop: 'puesto', quien: 'Lola',
    texto: 'Lola, despedida por Microblizz, ha montado un puesto de café en el camino. «Invita la casa. La casa soy yo.»',
    opciones: [
      { n: 'Café triple', d: '+6 de ataque, pero te tiemblan las patas: -10 de vida.', efecto: h => { h.atq += 6; h.vida = Math.max(1, h.vida - 10); }, dice: '«Vuelve cuando quieras. Bueno, cuando cierre Microblizz.»' },
      { n: 'Café con leche', d: 'Te sientas un rato con Lola: te curas 50.', efecto: h => { h.vida = Math.min(h.vidaMax, h.vida + 50); }, dice: '«Me despidieron por correo. Con faltas de ortografía.»' },
    ] },
  { tipo: 'combate', enemigo: 'starbot', titulo: 'Drones de vigilancia' },
  { tipo: 'eleccion', titulo: 'La letra pequeña', prop: 'abogado', quien: 'Abogado',
    texto: 'Un abogado de Microblizz te ofrece un contrato. La letra pequeña es MUY pequeña.',
    opciones: [
      { n: 'Firmar', d: '+50 % de ataque, pero te quitan 30 de vida máxima.', efecto: h => { h.atq = Math.round(h.atq * 1.5); h.vidaMax -= 30; h.vida = Math.min(h.vida, h.vidaMax); }, dice: '«Un placer hacer negocios. Sobre todo para mí.»' },
      { n: 'Leer la letra pequeña', d: 'Pagan en «visibilidad». Te ríes tanto que te curas 30.', efecto: h => { h.vida = Math.min(h.vidaMax, h.vida + 30); }, dice: '«Mi cliente lo lamenta mucho.»', nota: 'No lo lamenta.' },
    ] },
  { tipo: 'combate', enemigo: 'caja', titulo: 'Oferta especial', cofre: true },
  { tipo: 'combate', enemigo: 'jefe', titulo: 'SurvivalBot' },
];
