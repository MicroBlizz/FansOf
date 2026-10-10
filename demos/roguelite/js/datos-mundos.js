// Fans of Roguelite · Los 3 mundos (los de Fans of Rumble), sus enemigos, mini jefes y jefes, qué tipo de día puede tocar y los
// encuentros con elección. Las cifras de los enemigos normales crecen con el día (reglas.js); las del mini jefe y el jefe, no.
'use strict';

// ataque: 'cuerpo' (carrerilla y golpe), 'laser', 'hielo', 'sombra' y 'rayo' (disparos), 'salto' (salta y muerde)
const ENEMIGOS = {
  /* ---------- Mundo 1 · Oficinas de Microblizz ---------- */
  becario: { n: 'Becario', vida: 34, atq: 6, monedas: 5, xp: 8, spr: 'becario', alto: 30, ataque: 'cuerpo', gotas: '#6b3a1c',
    llega: 'Un Becario de Microblizz te corta el paso con un café en la mano.', frases: ['¿Esto cuenta como prácticas?', 'Mi jefe me está mirando…', 'Solo quería un café…'], muere: 'Por fin, vacaciones…' },
  starbot: { n: 'StarBot', vida: 40, atq: 8, monedas: 6, xp: 9, spr: 'starbot', alto: 34, vuela: 18, ataque: 'laser',
    llega: 'Un StarBot baja del cielo. Te está grabando para un anuncio.', frases: ['Escaneando… talento no rentable.', 'Sonríe, sales en el anuncio.'], muere: 'Error 404: dron no encontrado.' },
  caja: { n: 'CajaBotín', vida: 54, atq: 9, monedas: 10, xp: 10, spr: 'caja', alto: 24, ataque: 'salto',
    llega: 'Una CajaBotín brillante en mitad del camino. Huele a trampa.', frases: ['¡Ábreme! Solo 9,99 €.', 'Probabilidad de premio: secreta.'], muere: 'Contenía… polvo.' },
  becariomes: { n: 'Becario del Mes', vida: 330, atq: 14, monedas: 45, xp: 40, spr: 'becarioMes', alto: 46, ataque: 'cuerpo', gotas: '#6b3a1c', mini: true,
    llega: 'El Becario del Mes. Lleva tres años de prácticas y una corbata de oro.', frases: ['Me pagan en experiencia.'], muere: 'Por fin… un contrato… de verdad…', especial: '¡Café hirviendo!' },
  jefe: { n: 'SurvivalBot', vida: 900, atq: 24, monedas: 90, xp: 0, spr: 'jefe', alto: 70, ataque: 'cuerpo', jefe: true,
    llega: 'SurvivalBot vigila la puerta de las oficinas. Lleva corbata.', frases: ['Tu puesto ha sido optimizado.'], muere: 'Error: no encuentro mi finiquito.', especial: '¡Despido fulminante!' },
  /* ---------- Mundo 2 · Cementerio de juegos ---------- */
  esqueleto: { n: 'SkeletonCrew', vida: 32, atq: 7, monedas: 6, xp: 8, spr: 'esqueleto', alto: 26, ataque: 'cuerpo',
    llega: 'Un esqueleto pirata sale de una tumba. Viene de un juego que cerraron sin aviso.', frases: ['¡Al abordaje… del paro!', 'Mis huesos no tienen DLC.'], muere: '¡Se me ha caído el fémur!' },
  zombi: { n: 'CrunchZombie', vida: 46, atq: 7, monedas: 7, xp: 9, spr: 'zombi', alto: 34, ataque: 'cuerpo', gotas: '#8fbf6a',
    llega: 'Un programador zombi. Lleva meses de crunch y ya no se acuerda de su nombre.', frases: ['Cerebros… digo, fechas de entrega…', 'Solo un último commit…'], muere: 'Por fin… puedo dormir…' },
  fantasma: { n: 'GhostMage', vida: 38, atq: 9, monedas: 7, xp: 9, spr: 'fantasma', alto: 34, vuela: 14, ataque: 'hielo',
    llega: 'Un mago fantasma flota entre las lápidas, recitando parches que nunca salieron.', frases: ['Tu partida… ha sido borrada.', 'Buuu… de servidores caídos.'], muere: 'Me desconecto…' },
  cosido: { n: 'StitchBrute', vida: 600, atq: 22, monedas: 70, xp: 60, spr: 'cosido', alto: 52, ataque: 'cuerpo', gotas: '#8fbf6a', mini: true,
    llega: 'Una mole cosida con trozos de juegos cancelados. Huele a parche mal hecho.', frases: ['¡GRRR… REMASTER!'], muere: 'Se descose… por fin.', especial: '¡Nube tóxica!' },
  necrolord: { n: 'NecroLord corrupto', vida: 1500, atq: 36, monedas: 160, xp: 0, spr: 'necrolord', alto: 62, ataque: 'sombra', jefe: true,
    llega: 'NecroLord trabaja ahora para Microblizz. Le pagan en almas… y en acciones.', frases: ['Tu juego también será enterrado.'], muere: 'Mi contrato… era temporal…', especial: '¡Lluvia de lápidas!' },
  /* ---------- Mundo 3 · Torre de Microblizz ---------- */
  abogado: { n: 'Abogado', vida: 36, atq: 7, monedas: 8, xp: 9, spr: 'abogado', alto: 30, ataque: 'cuerpo',
    llega: 'Un abogado de Microblizz te persigue con un contrato de 400 páginas.', frases: ['Firme aquí, aquí y aquí.', 'Cláusula 7: todo es nuestro.'], muere: '¡Mi cliente lo niega todo!' },
  fallen: { n: 'FallenHero', vida: 48, atq: 9, monedas: 9, xp: 10, spr: 'fallen', alto: 38, ataque: 'cuerpo',
    llega: 'Un héroe caído. Fue el protagonista de un juego que Microblizz convirtió en cajas de botín.', frases: ['Yo era un héroe… ahora soy un skin.', 'Compra mi pase de temporada…'], muere: 'Por fin… libre de microtransacciones.' },
  soporte: { n: 'SoporteBot', vida: 40, atq: 9, monedas: 8, xp: 9, spr: 'soporte', alto: 34, vuela: 14, ataque: 'rayo',
    llega: 'El SoporteBot de Microblizz viene a ayudarte. Con un cable pelado.', frases: ['¿Ha probado a apagarlo y encenderlo?', 'Su queja es importante para nosotros.'], muere: 'Ticket cerrado.' },
  parche: { n: 'Parche Día 1', vida: 800, atq: 26, monedas: 110, xp: 90, spr: 'parche', alto: 58, ataque: 'cuerpo', mini: true,
    llega: 'El Parche del Día 1: 80 GB de tiritas para arreglar lo que no se probó.', frases: ['Descargando… 1 %… 1 %… 1 %…'], muere: 'Instalación cancelada.', especial: '¡Actualización obligatoria!' },
  ceo: { n: 'El CEO de Microblizz', vida: 2100, atq: 42, monedas: 300, xp: 0, spr: 'ceo', alto: 62, ataque: 'cuerpo', jefe: true,
    llega: 'El CEO de Microblizz deja de contar dinero un momento. Solo un momento.', frases: ['¿Cuánto cuesta tu zanahoria? La compro.'], muere: '¡Mi bonus! ¡Mi bonus de este trimestre!', especial: '¡Recorte de plantilla!' },
};

const MUNDOS = [
  { n: 'Oficinas de Microblizz', corto: 'Oficinas', dias: 40, fuerza: 1, enemigos: ['becario', 'starbot', 'caja'], mini: 'becariomes', jefe: 'jefe', fondo: 'bosque', musica: 'viaje', color: '#ff7a1a',
    capitulos: ['La salida', 'El polígono', 'Recursos Humanos', 'El despacho del jefe'],
    intro: 'Microblizz ha comprado el bosque. CrazyBunny sale de La Madriguera con su zanahoria.' },
  { n: 'Cementerio de juegos', corto: 'Cementerio', dias: 40, fuerza: 1.5, enemigos: ['esqueleto', 'zombi', 'fantasma'], mini: 'cosido', jefe: 'necrolord', fondo: 'cementerio', musica: 'cementerio', color: '#5ef2d0',
    capitulos: ['Las afueras', 'Las lápidas', 'Las criptas', 'El mausoleo'],
    intro: 'Aquí entierra Microblizz los juegos que cierra. Los No-Muertos trabajan para ellos… sin cobrar.' },
  { n: 'Torre de Microblizz', corto: 'Torre', dias: 40, fuerza: 1.9, enemigos: ['abogado', 'fallen', 'soporte'], mini: 'parche', jefe: 'ceo', fondo: 'ciudad', musica: 'torre', color: '#ff5a6a',
    capitulos: ['La calle', 'El vestíbulo', 'Las plantas de arriba', 'La azotea'],
    intro: 'La sede de la empresa. En el último piso, el CEO cuenta sus millones mientras decide qué juego cerrar.' },
];

// qué puede tocar cada día (el 1 siempre es combate; a mitad, el mini jefe; el último, el jefe) y los días fijos
const PESOS_DIA = { combate: 44, elite: 8, encuentro: 15, monedas: 6, ruleta: 5, gashapon: 5, cofre: 4, tienda: 3, hoguera: 3, raid: 3, misterioso: 3, bug: 3 };
const DIAS_CAPITULO = 10;   // cada mundo son 4 capítulos de 10 días
const DIAS_FIJOS = { 6: 'tienda', 10: 'cofre', 14: 'pase', 18: 'hoguera', 25: 'tienda', 29: 'cofre', 33: 'gashapon', 38: 'hoguera' };
const TITULO_DIA = {
  combate: 'En marcha', elite: '¡Élite!', mini: 'Mini jefe', jefe: '¡El jefe!', encuentro: 'Un encuentro', monedas: 'Monedas por el camino',
  ruleta: 'La ruleta', gashapon: 'El gashapón', cofre: 'Un cofre', tienda: 'La tienda de Lola', hoguera: 'La hoguera de la huelga', pase: 'El Pase Premium',
  raid: '¡Raid en el directo!', misterioso: 'Un comerciante misterioso', bug: '¡Un bug de Microblizz!',
};
