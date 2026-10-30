// Fans of Ratkov · DATOS DEL REFUGIO Y DEL BOTÍN: el escuadrón (cada animal con su ventaja y su precio), las recetas del banco, lo que
// vende BoomBeaver, los encargos y qué sale de cada tipo de contenedor.
'use strict';
// ---- la dificultad (Opciones): Becario es la de empezar; Normal, la de verdad ----
// dano: lo que pegan los enemigos · vista: de lejos que te ven · reaccion: lo que tardan en disparar · cuantos: cuántos hay · dur: segundos hasta la ventisca · frio: lo deprisa que sube
const DIFICULTAD = {
  becario: { n: 'BECARIO (FÁCIL)', dano: 0.5, vista: 0.75, reaccion: 1.7, cuantos: 0.6, dur: 720, frio: 0.7 },
  normal: { n: 'NORMAL', dano: 1, vista: 1, reaccion: 1, cuantos: 1, dur: 540, frio: 1 },
};
const dif = () => DIFICULTAD[AJUSTES.dificultad] || DIFICULTAD.becario;
// ---- el escuadrón: vida, velocidad y su ventaja (las cuentas están en js/jugador.js) ----
const ANIMALES = {
  bunny: { n: 'CrazyBunny', rol: 'LÍDER', precio: 0, vida: 120, vel: 1, d: 'Más vida y esquiva el doble de seguido. El Salto del Caos, versión invierno. Su culatazo es una patada que aturde el doble.' },
  squirrel: { n: 'MadSquirrel', rol: 'EXPLORADORA', precio: 1500, vida: 95, vel: 1.2, d: 'Corre un 20 % más y el peso la frena la mitad. Correr le gasta la mitad de aguante.' },
  fox: { n: 'SlyFox', rol: 'TIRADORA', precio: 3000, vida: 100, vel: 1, d: 'Los enemigos la ven desde mucho más cerca y hace un 25 % más de daño de lejos. Despide por la espalda sin agacharse y su abrecartas se mella la mitad.' },
  junkcoon: { n: 'JunkCoon', rol: 'CARROÑERO', precio: 2500, vida: 105, vel: 0.95, d: 'Cuatro casillas más en la mochila y registra el doble de rápido. En las cerraduras necesita un acierto menos y rebusca cuerpos más rápido.' },
  meercat: { n: 'MeerCat', rol: 'MÉDICA', precio: 3500, vida: 100, vel: 1, d: 'Se cura sola fuera de combate y las vendas y botiquines le curan la mitad más. Recupera el aguante el doble de rápido.' },
};
const ORDEN_ANIMALES = ['bunny', 'squirrel', 'fox', 'junkcoon', 'meercat'];

// ---- el banco: qué se fabrica con qué ----
const RECETAS = [
  { sale: ['venda', 2], con: [['tela', 2]] },
  { sale: ['botiquin', 1], con: [['venda', 2], ['alcohol', 1]] },
  { sale: ['te', 2], con: [['hierbas', 2], ['lata', 1]] },
  { sale: ['inyector', 1], con: [['alcohol', 1], ['chip', 1], ['cafe', 1]] },
  { sale: ['m9', 40], con: [['polvora', 1], ['tornillos', 1]] },
  { sale: ['cart', 14], con: [['polvora', 1], ['tornillos', 1]] },
  { sale: ['m762', 30], con: [['polvora', 2], ['tornillos', 1]] },
  { sale: ['granada', 2], con: [['polvora', 1], ['lata', 1], ['cinta', 1]] },
  { sale: ['silenciador', 1], con: [['tuberia', 2], ['cinta', 1]] },
  { sale: ['canon', 1], con: [['tuberia', 2], ['tornillos', 2]] },
  { sale: ['mira', 1], con: [['lente', 1], ['cables', 1], ['cinta', 1]] },
  { sale: ['cargador', 1], con: [['tornillos', 3], ['cinta', 1]] },
  { sale: ['culata', 1], con: [['tuberia', 1], ['tela', 2], ['cinta', 1]] },
  { sale: ['chaleco-l', 1], con: [['tela', 3], ['placa', 1]] },
  { sale: ['chaleco-p', 1], con: [['tela', 4], ['placa', 3], ['cinta', 2]] },
  { sale: ['casco', 1], con: [['placa', 1], ['tela', 2]] },
  { sale: ['mochila-m', 1], con: [['tela', 5], ['cinta', 1]] },
  { sale: ['mochila-g', 1], con: [['tela', 8], ['cinta', 3], ['cables', 2]] },
  { sale: ['palanca', 1], con: [['tuberia', 2], ['cinta', 2]] },
];

// ---- BoomBeaver, el mercader: lo que vende (a su valor) y lo que paga por lo tuyo ----
const TIENDA = ['m9', 'cart', 'm762', 'venda', 'botiquin', 'te', 'granada', 'pistola', 'metralleta', 'escopeta', 'fusil', 'chaleco-l', 'casco', 'mochila-m', 'palanca', 'llave-despacho', 'abrecartas'];
const PAGA = 0.55;            // te paga el 55 % de lo que vale
const RECARGO = 1.15;          // y te cobra un 15 % más
const precioCompra = id => Math.round(OBJ[id].v * RECARGO * (OBJ[id].t === 'muni' ? 1 : 1));
const lotesTienda = { m9: 30, cart: 12, m762: 30 };   // la munición se vende en paquetes

// ---- los encargos de BoomBeaver: uno tras otro ----
// tipo 'cuenta': se cumple solo cuando una cuenta llega a un número · tipo 'entrega': hay que darle objetos del alijo
const ENCARGOS = [
  { id: 'e1', n: 'Bienvenida al frío', d: 'Sal con vida de una incursión.', tipo: 'cuenta', cuenta: 'salidas', meta: 1, premio: { chapas: 300 } },
  { id: 'e2', n: 'Chatarra útil', d: 'Tráele a BoomBeaver 5 tornillos y 2 cintas americanas.', tipo: 'entrega', pide: [['tornillos', 5], ['cinta', 2]], premio: { obj: ['silenciador', 1], chapas: 200 } },
  { id: 'e3', n: 'Despidos improcedentes', d: 'Elimina a 8 becarios carroñeros.', tipo: 'cuenta', cuenta: 'carroneros', meta: 8, premio: { chapas: 700 } },
  { id: 'e4', n: 'Discos de la verdad', d: 'Entrega 3 discos duros de Microblizz.', tipo: 'entrega', pide: [['disco', 3]], premio: { obj: ['mochila-m', 1], chapas: 300 } },
  { id: 'e5', n: 'Auditoría externa', d: 'Derrota a El Auditor, en la explanada de la torre.', tipo: 'cuenta', cuenta: 'auditor', meta: 1, premio: { chapas: 2000, obj: ['chaleco-p', 1] } },
  { id: 'e6', n: 'Lo que no debería existir', d: 'Monta una anomalía en un arma en el taller.', tipo: 'cuenta', cuenta: 'anomalias', meta: 1, premio: { chapas: 1200, obj: ['muestra', 1] } },
  { id: 'e7', n: 'Por las cloacas', d: 'Sal por la alcantarilla (hace falta una palanca).', tipo: 'cuenta', cuenta: 'alcantarilla', meta: 1, premio: { obj: ['blizzcoin', 1], chapas: 500 } },
  { id: 'e8', n: 'Cazafantasmas del código', d: 'Acaba con El Lag, junto a la estatua del Director.', tipo: 'cuenta', cuenta: 'lag', meta: 1, premio: { chapas: 1500, obj: ['an-hitbox', 1] } },
];

// ---- el botín: qué sale de cada contenedor ([objeto, peso en el sorteo, cuántos min-max]) ----
const TABLAS = {
  caja: { n: 'Cajas', veces: [1, 3], t: 1.4, sale: [['tornillos', 10, 1, 3], ['tela', 9, 1, 2], ['cables', 7, 1, 2], ['tuberia', 5, 1, 1], ['cinta', 4, 1, 1], ['lata', 6, 1, 1], ['taza', 4, 1, 1], ['polvora', 3, 1, 1], ['m9', 4, 8, 20], ['cafe', 3, 1, 1]] },
  archivador: { n: 'Archivador', veces: [1, 3], t: 1.8, sale: [['abrecartas', 3, 1, 1], ['documentos', 4, 1, 1], ['disco', 7, 1, 1], ['chip', 5, 1, 1], ['cables', 6, 1, 2], ['taza', 5, 1, 1], ['cafe', 4, 1, 1], ['tarjeta', 0.4, 1, 1]] },
  coche: { n: 'Maletero', veces: [1, 2], t: 2.0, sale: [['lata', 6, 1, 2], ['alcohol', 5, 1, 1], ['tela', 5, 1, 2], ['tuberia', 4, 1, 1], ['cart', 4, 6, 12], ['venda', 3, 1, 1], ['palanca', 1, 1, 1], ['escopeta', 0.8, 1, 1], ['figura', 0.6, 1, 1]] },
  militar: { n: 'Caja militar', veces: [2, 3], t: 2.4, sale: [['abrecartas', 2, 1, 1], ['m762', 6, 20, 40], ['m9', 5, 20, 40], ['cart', 4, 8, 16], ['granada', 4, 1, 2], ['polvora', 5, 1, 2], ['placa', 3, 1, 1], ['silenciador', 1.5, 1, 1], ['mira', 1.5, 1, 1], ['cargador', 1.5, 1, 1], ['culata', 1.5, 1, 1], ['canon', 1.2, 1, 1], ['fusil', 0.8, 1, 1], ['casco', 1, 1, 1], ['chaleco-l', 1, 1, 1]] },
  medico: { n: 'Botiquín de pared', veces: [1, 2], t: 1.4, sale: [['venda', 8, 1, 2], ['alcohol', 6, 1, 1], ['botiquin', 3, 1, 1], ['hierbas', 4, 1, 2], ['inyector', 1.2, 1, 1], ['te', 3, 1, 1]] },
  maquina: { n: 'Máquina de café', veces: [1, 2], t: 1.2, sale: [['cafe', 8, 1, 2], ['lata', 6, 1, 1], ['hierbas', 3, 1, 1], ['blizzcoin', 0.3, 1, 1]] },
  caja_fuerte: { n: 'Caja fuerte', veces: [3, 4], t: 3.2, sale: [['grafica', 4, 1, 1], ['blizzcoin', 5, 1, 2], ['mando', 4, 1, 1], ['documentos', 5, 1, 2], ['figura', 3, 1, 1], ['an-lag', 1, 1, 1], ['an-rebote', 1, 1, 1], ['an-desync', 1, 1, 1], ['chaleco-p', 1, 1, 1], ['franco', 1, 1, 1]] },
  grieta: { n: 'Grieta bugueada', veces: [1, 2], t: 2.6, sale: [['muestra', 6, 1, 1], ['an-hielo', 1.5, 1, 1], ['an-hitbox', 1.5, 1, 1], ['an-crack', 1, 1, 1], ['chip', 3, 1, 2]] },
};
// lo que lleva encima cada enemigo cuando cae
const TABLAS_ENEMIGO = {
  carronero: { veces: [1, 3], sale: [['m9', 6, 6, 16], ['cart', 3, 4, 8], ['tornillos', 5, 1, 2], ['tela', 4, 1, 2], ['lata', 4, 1, 1], ['venda', 3, 1, 1], ['taza', 2, 1, 1], ['pistola', 1.2, 1, 1], ['escopeta', 0.6, 1, 1], ['polvora', 2, 1, 1]] },
  seguridad: { veces: [2, 3], sale: [['abrecartas', 1.5, 1, 1], ['m762', 6, 15, 30], ['m9', 3, 10, 20], ['placa', 3, 1, 1], ['venda', 3, 1, 1], ['chip', 3, 1, 1], ['granada', 2, 1, 1], ['casco', 1.2, 1, 1], ['chaleco-l', 1, 1, 1], ['chaleco-p', 0.5, 1, 1], ['fusil', 0.8, 1, 1], ['metralleta', 1, 1, 1], ['mira', 0.8, 1, 1]] },
  auditor: { veces: [3, 3], fijo: [['tarjeta', 1]], sale: [['grafica', 3, 1, 1], ['blizzcoin', 3, 1, 2], ['mando', 2, 1, 1], ['an-lag', 1, 1, 1], ['an-crack', 1, 1, 1], ['chaleco-p', 2, 1, 1], ['m762', 3, 30, 60]] },
  practicas: { veces: [1, 1], sale: [['tornillos', 1, 1, 2]] },
  lag: { veces: [1, 2], fijo: [['muestra', 1]], sale: [['an-hielo', 1, 1, 1], ['an-hitbox', 1, 1, 1], ['an-rebote', 1, 1, 1], ['an-desync', 1, 1, 1], ['an-lag', 1, 1, 1], ['an-crack', 0.6, 1, 1]] },
};
