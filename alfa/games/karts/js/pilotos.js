// Fans of Karts (prototipo) · LOS PILOTOS: los seis líderes de Fans of Rumble (jugables) y los dos de Microblizz (los lleva la máquina).
// Cada uno puntúa de 1 a 5 en velocidad punta, aceleración, manejo (lo que gira) y peso (quién empuja a quién).
// Sus modelos están en pilotos-modelos.js. Los textos van en español; su inglés, en textos.js.
'use strict';

const PILOTOS = [
  { id: 'bunny', nombre: 'CrazyBunny', corto: 'BUNNY', faccion: 'Animales Locos', kart: 'Zanahoria Turbo', color: '#ff8a1f', vel: 3, ace: 5, man: 5, peso: 1, jugable: true,
    lema: 'Ligero, nervioso y con corona. Frena poco: no sabe.', gana: '¡Zanahorias para todos! Menos para Microblizz.' },
  { id: 'twitchking', nombre: 'StreamKing', corto: 'KING', faccion: 'Streamers', kart: 'El Directo', color: '#8b5cf6', vel: 4, ace: 4, man: 3, peso: 3, jugable: true,
    lema: 'Conduce con una mano: con la otra saluda al chat.', gana: '¡Dale a seguir! Esto ha sido contenido.' },
  { id: 'epicchampion', nombre: 'EpicChampion', corto: 'EPIC', faccion: 'Héroes', kart: 'Corcel Blanco', color: '#facc15', vel: 5, ace: 2, man: 2, peso: 5, jugable: true,
    lema: 'Pesado y veloz. Un héroe no frena: embiste.', gana: '¡Por el honor! Y por el patrocinador.' },
  { id: 'cybermarine', nombre: 'CyberMarine', corto: 'CYBER', faccion: 'Ciberpunks', kart: 'Blindado 2077', color: '#22e3ff', vel: 4, ace: 3, man: 3, peso: 4, jugable: true,
    lema: 'Tarda en arrancar. Después no hay quien lo pare.', gana: 'Objetivo cumplido. Bajas: todas las demás.' },
  { id: 'memelord', nombre: 'MemeLord', corto: 'MEME', faccion: 'Memes', kart: 'El Clickbait', color: '#ffe14d', vel: 3, ace: 4, man: 4, peso: 2, jugable: true,
    lema: 'Ágil y tramposo. Si te adelanta, ya eres un meme.', gana: 'Esto va directo a mis memes.' },
  { id: 'necrolord', nombre: 'NecroLord', corto: 'NECRO', faccion: 'No-Muertos', kart: 'El Ataúd', color: '#5ef2d0', vel: 5, ace: 2, man: 3, peso: 4, jugable: true,
    lema: 'Rapidísimo en recta. Las curvas le dan igual: ya está muerto.', gana: 'No me pueden despedir: ya estoy muerto.' },
  { id: 'survivalbot', nombre: 'SurvivalBot', corto: 'BOT', faccion: 'Microblizz', kart: 'Unidad 404', color: '#3a7de0', vel: 4, ace: 4, man: 4, peso: 4, jugable: false,
    lema: 'El robot de Microblizz. Optimizado para ganar y para despedir.', gana: 'PROTOCOLO COMPLETADO. ESTÁS DESPEDIDO.' },
  { id: 'ceo', nombre: 'El CEO', corto: 'CEO', faccion: 'Microblizz', kart: 'Bonus Anual', color: '#e63946', vel: 5, ace: 3, man: 3, peso: 5, jugable: false,
    lema: 'Ha comprado la carrera. Y piensa cerrarla.', gana: 'He comprado esta victoria. Y voy a cerrar el circuito.' },
];
const PILOTO = Object.fromEntries(PILOTOS.map(p => [p.id, p]));
const JUGABLES = PILOTOS.filter(p => p.jugable);
