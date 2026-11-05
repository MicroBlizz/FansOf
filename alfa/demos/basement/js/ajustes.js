// Fans of Basement · Ajustes: todas las cifras del juego (el pozo del ascensor, el jugador, el café, la caja del despedido, el arma,
// los enemigos de cada planta, el botín, las zonas de la oficina de Microblizz y las tres mejoras de la mesa).
'use strict';
const AJUSTES = {
  id: 'basement',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-basement',    // la clave de la partida en este navegador
};
var BAS = globalThis.BAS || (globalThis.BAS = {});
BAS.AJ = Object.freeze({
  // El pozo: 360 de ancho (el ancho de la pantalla), paredes a los lados y una planta cada `altoPlanta` unidades hacia abajo.
  ancho: 360, pared: 18, altoPlanta: 380, inicio: 60,
  // El jugador: vel = velocidad con el dedo; deriva = lo que baja solo sin tocar; invul = segundos sin recibir daño tras un golpe.
  jugador: { radio: 13, vel: 125, deriva: 22, invul: 0.8 },
  // El café es el oxígeno: base + porNivel de la mejora. Se gasta cada segundo (más cuanto más abajo) y los golpes lo quitan.
  cafe: { base: 60, porNivel: 15, gasto: 1, gastoPorPlanta: 0.05, crunch: 1.3, taza: 14 },
  // La caja del despedido: cuánto peso de botín cabe (base + porNivel de la mejora).
  caja: { base: 15, porNivel: 6 },
  // El arma dispara sola al enemigo más cercano dentro del alcance. porNivel = +20 % de daño por nivel de la mejora.
  arma: { dano: 10, porNivel: 0.2, cadencia: 0.3, alcance: 150, velBala: 560, vidaBala: 0.45, radioBala: 3 },
  // Llamar al ascensor de emergencia: tarda `espera` segundos en llegar y te sube con lo que lleves.
  ascensor: { espera: 3 },
  // Enemigos: desde = primera planta en la que salen; peso = lo a menudo que salen; botin = qué sueltan.
  enemigos: {
    bug: { vida: 20, radio: 12, vel: 40, persigue: 95, golpe: 4, desde: 0, peso: 10, botin: 'codigo', puntos: 1 },
    correo: { vida: 26, radio: 14, vel: 30, persigue: 210, golpe: 3, desde: 2, peso: 6, botin: 'postit', divide: 'miniCorreo', puntos: 2 },
    miniCorreo: { vida: 9, radio: 9, vel: 55, persigue: 210, golpe: 2, desde: 99, peso: 0, botin: null, puntos: 1 },
    reunion: { vida: 70, radio: 24, vel: 18, persigue: 0, golpe: 2, desde: 4, peso: 3, botin: 'taza', frena: 0.45, frenaT: 1.6, puntos: 4 },
  },
  vidaPorPlanta: 0.12,              // cada planta los enemigos tienen un 12 % más de vida
  generar: { tramo: 40, delante: 620, detras: 560, base: 0.3, porPlanta: 0.02, max: 0.9, maxActivos: 45, zonaSegura: 180 },
  // El botín: valor en monedas (sube un 20 % por planta) y peso en la caja. La taza de café no ocupa sitio: rellena el café.
  objetos: {
    codigo: { valor: 3, peso: 1 },
    postit: { valor: 4, peso: 1 },
    taza: { valor: 10, peso: 3 },
    cafe: { valor: 0, peso: 0 },
  },
  valorPorPlanta: 0.2, probCafe: 0.07, iman: 50, recoge: 18, avisoLlena: 1.5,
  // Las zonas de la oficina, de arriba abajo. crunch = el café se gasta más deprisa.
  zonas: [
    { desde: 0, id: 'marketing', nombre: 'Marketing', fondo: '#f2c46b', pared: '#c98f3d', crunch: false },
    { desde: 5, id: 'soporte', nombre: 'Soporte', fondo: '#7fc4d8', pared: '#3f7f99', crunch: false },
    { desde: 10, id: 'qa', nombre: 'QA', fondo: '#e88a6a', pared: '#a64b35', crunch: true },
    { desde: 15, id: 'servidores', nombre: 'Sala de Servidores', fondo: '#4f6f8f', pared: '#26384c', crunch: true },
  ],
  // Las mejoras de la mesa: coste = base × factor^nivel, hasta el nivel máximo.
  mejoras: {
    cafe: { base: 20, factor: 1.55, max: 10 },
    caja: { base: 20, factor: 1.55, max: 10 },
    dano: { base: 25, factor: 1.6, max: 10 },
  },
});
