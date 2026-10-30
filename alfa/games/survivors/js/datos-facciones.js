// Fans of Survivors · Armas de las facciones (1/2): el constructor y las armas de No-Muertos, Streamers, Héroes y Ciberpunks.
// Cada facción tiene 8 armas: el líder lleva 2 (la de salida y una especial) y cada una de sus 6 cartas, 1.
// Cómo se cuentan y se mueven los tipos (bala, nova, bomba…): armas-tipos.js. El inglés: idioma/en-facciones.js.
// Para equilibrar: el daño, la recarga y el resto de cifras base están aquí; las mejoras de nivel 2 a 5 salen de PASOS.
'use strict';

/* ---------- qué facciones se pueden jugar y qué hace falta para abrirlas ---------- */
// minutos aguantados en total (todas las partidas). Animales Locos siempre está abierta.
const DESBLOQUEO = { nomuertos: 10, streamers: 30, heroes: 60, ciber: 100, memes: 150, gamer: 210, olvidados: 280, pop: 360 };

/* ---------- las mejoras de nivel: cada arma elige 4 de estas (niveles 2 a 5) ---------- */
const PASOS = {
  n:      ['+1 a la vez',                 v => { v.n += 1; }],
  n2:     ['+2 a la vez',                 v => { v.n += 2; }],
  golpe:  ['Aguanta un golpe más',        v => { v.n += 1; }],
  dano:   ['+30 % daño',                  v => { v.dano *= 1.3; }],
  dano2:  ['+50 % daño',                  v => { v.dano *= 1.5; }],
  cd:     ['Se recarga antes',            v => { if (v.cd) v.cd *= 0.78; }],
  r:      ['Área más grande',             v => { v.r *= 1.25; }],
  pierce: ['Atraviesa a más enemigos',    v => { v.atraviesa += 2; }],
  dura:   ['Dura más',                    v => { v.dura *= 1.5; }],
  lento:  ['Frena más a los enemigos',    v => { v.lento += 0.8; }],
  aturde: ['Aturde más tiempo',           v => { v.aturde += 0.5; }],
  cura:   ['Cura más',                    v => { v.cura *= 1.5; }],
  vel:    ['Va más rápido',               v => { v.vel *= 1.3; }],
  alc:    ['Llega más lejos',             v => { v.alc *= 1.3; }],
  tick:   ['Golpea más a menudo',         v => { v.tick *= 0.7; }],
  cadena: ['Salta a más enemigos',        v => { v.cadena += 2; }],
  rebota: ['Rebota una vez más',          v => { v.rebota += 1; }],
  arco:   ['Más alcance y más direcciones',   v => { v.arco = Math.min(270, v.arco + 60); v.r *= 1.12; }],
  giro:   ['Gira más rápido',             v => { v.giro *= 1.3; }],
  combo:  ['El combo llega antes',        v => { v.cadaN = Math.max(2, v.cadaN - 1); }],
};

/* ---------- las cifras base de cada tipo (cada arma cambia las que quiera) ----------
   dano · cd (segundos entre disparos) · n (cuántos a la vez) · r (radio) · vel · atraviesa · dur (cuánto vive) · alc (alcance)
   lento / aturde (segundos) · cura (vida por segundo) · tick (cada cuánto golpea) · rebota · cadena (saltos del rayo) */
const BASE_TIPO = {
  bala:   { dano: 14, cd: 0.9, n: 1, vel: 420, atraviesa: 1, dur: 1.3, lento: 0, aturde: 0, rebota: 0, tam: 18 },
  nova:   { dano: 12, cd: 2.4, n: 6, vel: 330, dur: 0.9, lento: 0, aturde: 0, tam: 16 },
  bomba:  { dano: 26, cd: 2.6, n: 1, r: 55, alc: 340, lento: 0, aturde: 0 },
  golpe:  { dano: 30, cd: 2.8, n: 1, alc: 320, lento: 0, aturde: 0 },
  rayo:   { dano: 22, cd: 2.2, n: 1, alc: 300, cadena: 2, lento: 0, aturde: 0 },
  onda:   { dano: 24, cd: 4.5, r: 100, lento: 0, aturde: 0, emp: 380 },
  charco: { dano: 8, cd: 5, n: 1, r: 60, dura: 4, tick: 0.5, alc: 320, lento: 0.3 },
  corre:  { dano: 40, cd: 3.4, n: 1, r: 70, vel: 280, lento: 0, aturde: 0 },
  aura:   { dano: 6, r: 75, tick: 0.5, cura: 0, lento: 0 },
  orbita: { dano: 14, n: 2, r: 80, giro: 3.2, tick: 0.45, lento: 0 },
  escudo: { cd: 9, n: 1 },
  // las armas iniciales de los líderes (armas-tipos-2.js)
  tajo:      { dano: 30, cd: 0.75, r: 80, arco: 90, lento: 0, aturde: 0 },
  eclosion:  { dano: 30, cd: 1.8, n: 2, r: 50, alc: 360, demora: 0.7, lento: 0, aturde: 0 },
  haz:       { dano: 10, n: 1, r: 150, giro: 2.2, tick: 0.25, lento: 0, aturde: 0 },
  torreta:   { dano: 9, cd: 6, n: 1, dura: 6, cadencia: 0.45, alc: 320, vel: 480 },
  ruleta:    { dano: 20, cd: 2.2, n: 1 },
  combo:     { dano: 16, cd: 0.28, r: 95, mult: 3, cadaN: 4 },
  boomerang: { dano: 20, cd: 1.6, n: 1, alc: 200, vel: 380, tam: 26 },
};
// armaFaccion(facción, id, carta, tipo, nombre, descripción, emoji, color, cifras que cambian, mejoras de nivel 2 a 5)
function armaFaccion(fac, id, carta, tipo, nombre, desc, emo, col, ov, pasos) {
  ARMAS[id] = { fac, tipo, nombre, carta, desc, emo, col, nv: pasos.map(p => PASOS[p][0]),
    v: n => { const v = Object.assign({}, BASE_TIPO[tipo], ov); for (let i = 0; i < n - 1; i++) PASOS[pasos[i]][1](v); return v; } };
}
// lo que sale al empezar con cada facción (la primera arma de su líder)
const ARMA_INICIAL = { animales: 'zanahoria' };

// nomuertos
armaFaccion('nomuertos', 'necrolord_a', 'necrolord', 'eclosion', 'Manos del cementerio', 'Unas manos salen del suelo bajo los enemigos tras un breve aviso y los agarran.', '🖐️', '#8a5cff', {}, ['n', 'dano', 'r', 'cd']);
armaFaccion('nomuertos', 'necrolord_b', 'necrolord', 'corre', 'Levantar esqueletos', 'Levanta esqueletos que corren hacia los enemigos y se deshacen al llegar.', null, '#efeadf', {spr: 'skeleton', dano: 30, n: 2, r: 55, cd: 3.6}, ['n', 'dano', 'r', 'cd']);
armaFaccion('nomuertos', 'skeleton', 'skeleton', 'nova', 'Calaveras pirata', 'Calaveras que salen volando en todas direcciones y atraviesan a todos.', '💀', '#efeadf', {n: 4, dano: 11}, ['n2', 'dano', 'cd', 'vel']);
armaFaccion('nomuertos', 'zombie', 'zombie', 'aura', 'Nube zombi', 'Un hedor que daña a los enemigos cercanos y los frena.', null, '#7ea35a', {dano: 8, r: 80, lento: 0.6}, ['r', 'dano', 'tick', 'lento']);
armaFaccion('nomuertos', 'ghostmage', 'ghostmage', 'bala', 'Rayo de escarcha', 'Disparos helados que frenan al enemigo que tocan.', '❄️', '#8fd9ff', {dano: 13, lento: 1.2}, ['n', 'dano', 'lento', 'pierce']);
armaFaccion('nomuertos', 'banshee', 'banshee', 'onda', 'Grito de Banshee', 'Un grito que aturde y empuja a los enemigos cercanos.', null, '#c9b6ff', {dano: 24, r: 105, aturde: 0.9, cd: 5}, ['r', 'aturde', 'dano', 'cd']);
armaFaccion('nomuertos', 'skullknight', 'skullknight', 'orbita', 'Espadas rúnicas', 'Espadas de hielo que giran a tu alrededor y frenan a quien tocan.', '🗡️', '#8fd9ff', {n: 2, dano: 12, r: 78, lento: 0.5}, ['n', 'dano', 'r', 'tick']);
armaFaccion('nomuertos', 'stitchbrute', 'stitchbrute', 'charco', 'Charco tóxico', 'Deja charcos tóxicos que dañan a quien los pisa.', '☣️', '#79c24a', {}, ['n', 'dano', 'dura', 'r']);
ARMA_INICIAL.nomuertos = 'necrolord_a';

// streamers
armaFaccion('streamers', 'twitchking_a', 'twitchking', 'haz', 'Foco del directo', 'Un foco gira a tu alrededor y daña todo lo que cruza.', '📸', '#ff5fa2', {}, ['n', 'r', 'dano', 'giro']);
armaFaccion('streamers', 'twitchking_b', 'twitchking', 'onda', 'Raid', 'Una oleada de espectadores golpea a todos los enemigos cercanos.', null, '#ff5fa2', {dano: 35, r: 120, cd: 6, aturde: 0.5}, ['dano', 'r', 'cd', 'aturde']);
armaFaccion('streamers', 'subswarm', 'subswarm', 'nova', 'Lluvia de likes', 'Likes que salen volando en todas direcciones.', '👍', '#4f9dff', {n: 6, dano: 9}, ['n2', 'dano', 'cd', 'vel']);
armaFaccion('streamers', 'hypebeast', 'hypebeast', 'golpe', 'Puñetazos del hype', 'Aparece junto a un enemigo y le suelta un puñetazo rapidísimo.', '👊', '#ff5fa2', {dano: 20, cd: 1.4}, ['n', 'dano', 'cd', 'alc']);
armaFaccion('streamers', 'viralbot', 'viralbot', 'rayo', 'Flash viral', 'El flash de la cámara daña y aturde a un enemigo.', null, '#fff6a8', {dano: 18, aturde: 0.6, cadena: 0}, ['n', 'aturde', 'dano', 'cd']);
armaFaccion('streamers', 'snackmom', 'snackmom', 'aura', 'Bocadillos de mamá', 'Un aura de cariño: te cura poco a poco y daña a los enemigos pegajosos.', null, '#ffb36b', {dano: 4, r: 72, cura: 1.0}, ['cura', 'r', 'dano', 'cura']);
armaFaccion('streamers', 'hypetrain', 'hypetrain', 'bala', 'Tren del hype', 'Un tren lento e imparable que atropella a todo lo que encuentra.', '🚂', '#b36bff', {dano: 38, cd: 3.2, vel: 260, atraviesa: 99, dur: 2.2, tam: 30, gira: 0}, ['dano', 'n', 'cd', 'vel']);
armaFaccion('streamers', 'banhammer', 'banhammer', 'onda', 'Martillo del ban', 'Un martillazo aplasta a los enemigos cercanos y los aparta.', '🔨', '#ffcb3d', {dano: 40, r: 85, cd: 3.4}, ['dano', 'r', 'cd', 'aturde']);
ARMA_INICIAL.streamers = 'twitchking_a';

// heroes
armaFaccion('heroes', 'epicchampion_a', 'epicchampion', 'tajo', 'Espadazos', 'EpicChampion da espadazos cuerpo a cuerpo hacia donde mira. Con cada nivel llega más lejos y cubre más direcciones, hasta 270 grados.', '⚔️', '#ffd04a', {}, ['arco', 'dano', 'arco', 'arco']);
armaFaccion('heroes', 'epicchampion_b', 'epicchampion', 'onda', 'Team Fight', 'Un grito de guerra golpea a todos los enemigos cercanos.', null, '#ffd04a', {dano: 38, r: 110, cd: 5.5}, ['dano', 'r', 'cd', 'aturde']);
armaFaccion('heroes', 'cupidarcher', 'cupidarcher', 'bala', 'Flechas de Cupido', 'Flechas rápidas contra el enemigo más cercano.', '💘', '#ff7aa8', {n: 2, dano: 12, cd: 0.7, vel: 520}, ['n', 'dano', 'cd', 'pierce']);
armaFaccion('heroes', 'hoplite', 'hoplite', 'bala', 'Lanzas de hoplita', 'Lanzas largas que atraviesan a muchos enemigos.', '🔱', '#c9d3e0', {dano: 20, atraviesa: 4, cd: 1.3}, ['dano', 'pierce', 'n', 'cd']);
armaFaccion('heroes', 'shieldmaiden', 'shieldmaiden', 'escudo', 'Escudo de valquiria', 'Un escudo que aguanta golpes y se recarga solo.', '🛡️', '#9fd3ff', {cd: 10}, ['golpe', 'cd', 'golpe', 'cd']);
armaFaccion('heroes', 'thundergod', 'thundergod', 'rayo', 'Rayo en cadena', 'Un rayo salta del primer enemigo a otros cercanos.', null, '#ffe14d', {dano: 24, cadena: 3}, ['cadena', 'dano', 'cd', 'n']);
armaFaccion('heroes', 'medusa', 'medusa', 'onda', 'Mirada de Medusa', 'Petrifica un rato a los enemigos cercanos.', null, '#9be07a', {dano: 15, r: 100, aturde: 1.4, cd: 7}, ['r', 'aturde', 'cd', 'dano']);
armaFaccion('heroes', 'minotaur', 'minotaur', 'corre', 'Embestida', 'El Minotauro embiste a un grupo de enemigos y revienta contra ellos.', null, '#ff9a3c', {spr: 'minotaur', dano: 55, r: 70, vel: 330, cd: 4}, ['dano', 'r', 'n', 'cd']);
ARMA_INICIAL.heroes = 'epicchampion_a';

// ciber
armaFaccion('ciber', 'cybermarine_a', 'cybermarine', 'torreta', 'Torreta desplegable', 'Deja una torreta que dispara sola a los enemigos cercanos durante unos segundos.', '🔫', '#4de0ff', {}, ['n', 'dano', 'dura', 'cd']);
armaFaccion('ciber', 'cybermarine_b', 'cybermarine', 'bomba', 'Drones de apoyo', 'Caen del cielo drones que explotan sobre los enemigos.', '🚁', '#4de0ff', {n: 2, dano: 26, r: 58}, ['n', 'dano', 'r', 'cd']);
armaFaccion('ciber', 'nanobot', 'nanobot', 'nova', 'NanoBots', 'Un enjambre de nanorrobots sale en todas direcciones.', null, '#7dffe0', {n: 5, dano: 10}, ['n2', 'dano', 'cd', 'vel']);
armaFaccion('ciber', 'cyberninja', 'cyberninja', 'golpe', 'Tajo neón', 'Se teletransporta junto a un enemigo y lo corta.', '⚡', '#d43cff', {dano: 36, cd: 2.4}, ['n', 'dano', 'cd', 'alc']);
armaFaccion('ciber', 'techdroid', 'techdroid', 'aura', 'Reparaciones', 'Un campo de reparación: te cura poco a poco y chamusca a los enemigos cercanos.', null, '#7dff7a', {dano: 4, r: 72, cura: 1.0}, ['cura', 'r', 'dano', 'cura']);
armaFaccion('ciber', 'hackerkid', 'hackerkid', 'onda', 'Hackeo', 'Hackea a los enemigos cercanos y los deja parados.', null, '#4dff9a', {dano: 12, r: 95, aturde: 1.5, cd: 7}, ['r', 'aturde', 'cd', 'dano']);
armaFaccion('ciber', 'neonsniper', 'neonsniper', 'rayo', 'Tiro de francotiradora', 'Un disparo con muchísimo daño a un enemigo desde muy lejos.', null, '#ff4bd8', {dano: 95, cd: 3.6, alc: 520, cadena: 0}, ['dano', 'cd', 'n', 'alc']);
armaFaccion('ciber', 'siegemech', 'siegemech', 'bomba', 'Cañón del Mecha', 'Proyectiles de artillería con una explosión enorme.', '💣', '#ff9a3c', {dano: 46, r: 85, cd: 4, alc: 420}, ['dano', 'r', 'cd', 'n']);
ARMA_INICIAL.ciber = 'cybermarine_a';
