// Fans of Dark · datos: los héroes (los Animales Locos), las facciones enemigas con su mazmorra, los objetos y la partida guardada.
// Todo en español (el juego aún no tiene inglés). Quién dibuja a cada personaje es la serie (core/js/serie/arte): aquí solo se dice quién es quién.
// Las distancias van en casillas (una casilla = una unidad del mundo 3D) y las velocidades en casillas por segundo.
'use strict';
const tr = s => s;   // el motor de dibujo de Fans Of pide esta función; el juego aún solo está en español

/* ---------- ajustes ---------- */
const DK_MW = 44, DK_MH = 44;           // casillas del mapa
const DK_BOLSA = 10;                    // huecos de la mochila
const DK_POCION = { coste: 30, cura: 0.45, cd: 6, max: 3 };
const DK_NIEBLA = { espera: 75, cierre: 300, rMin: 3, dano: 4 };   // segundos antes de avanzar, segundos hasta cerrarse, radio final (casillas), daño por segundo
const DK_EXTRAER = 3;                   // segundos de pie dentro del portal
// El combate: aguante (esquivar y bloquear lo gastan), la rueda, el bloqueo y su ventana de parry, el lanzamiento y cuántos monstruos atacan a la vez
const DK_COMBATE = { aguante: 100, regen: 28, costeEsquiva: 30, esquiva: 0.35, velEsquiva: 3.2, costeBloqueo: 18, bloqueo: 0.3, parry: 0.3, aturdido: 2.2,
  municion: 3, recarga: 4, alcLanzar: 7, danoLanzar: 0.7, empuje: 0.35, aviso: 0.65, avisoJefe: 0.9, atacantes: 2 };
const DK_COLOR_RAREZA = ['#b9b3c4', '#6fdc72', '#4aa8ff', '#b36bff', '#ff9a2e'];
const DK_NOMBRE_RAREZA = ['Común', 'Poco común', 'Raro', 'Épico', 'Legendario'];

/* ---------- héroes: los Animales Locos, cada uno con su habilidad ---------- */
const DK_HEROES = {
  bunny:    { nombre: 'CrazyBunny', alto: 1.5, hp: 150, dmg: 20, vel: 2.6, cd: 0.6, alc: 1.3, arco: 1.5, desc: 'El líder. Pega fuerte y salta en medio del jaleo.',
    hab: { nombre: 'Salto caótico', cd: 8, desc: 'Salta sobre el grupo enemigo más grande que tengas a la vista y hace 50 de daño en área.' } },
  squirrel: { nombre: 'MadSquirrel', alto: 1.1, hp: 95, dmg: 12, vel: 3.3, cd: 0.35, alc: 1.1, arco: 1.3, desc: 'Rápida y frágil. Muerde mucho y corre más.',
    hab: { nombre: 'Frenesí', cd: 10, desc: 'Durante 4 s vas y pegas el doble de rápido.' } },
  fox:      { nombre: 'SlyFox', alto: 1.3, hp: 110, dmg: 16, vel: 2.9, cd: 0.5, alc: 1.2, arco: 1.4, desc: 'Invisible hasta que ataca. Su primer golpe duele el triple.',
    hab: { nombre: 'Esfumarse', cd: 12, desc: 'Durante 4 s nadie te ve y tu siguiente golpe hace el triple de daño.' } },
  beaver:   { nombre: 'BoomBeaver', alto: 1.2, hp: 130, dmg: 14, vel: 2.7, cd: 0.6, alc: 1.2, arco: 1.4, desc: 'Lleva dinamita. Siempre lleva dinamita.',
    hab: { nombre: 'Dinamita', cd: 9, desc: 'Lanza un cartucho que explota donde apuntas: 70 de daño en área.' } },
  meercat:  { nombre: 'MeerCat', alto: 1.3, hp: 125, dmg: 11, vel: 2.5, cd: 0.6, alc: 1.2, arco: 1.4, desc: 'Enfermera con alas de ángel. Se cura a sí misma, que para eso estudió.',
    hab: { nombre: 'Curita', cd: 11, desc: 'Recuperas un 40 % de tu vida.' } },
  junkcoon: { nombre: 'JunkCoon', alto: 1.3, hp: 105, dmg: 15, vel: 2.5, cd: 0.9, alc: 6, dist: true, desc: 'Lanza bolsas de basura explosivas desde lejos.',
    hab: { nombre: 'Lluvia de basura', cd: 10, desc: 'Tres bolsas seguidas sobre el enemigo más cercano, cada una con daño en área.' } },
  mechavaca:{ nombre: 'MechaVaca', alto: 1.9, hp: 230, dmg: 18, vel: 2.0, cd: 0.9, alc: 1.5, arco: 1.6, desc: 'Una vaca en un mecha rosa. Lenta, pero aguanta de todo.',
    hab: { nombre: 'Blindaje', cd: 14, desc: 'Durante 5 s el mecha absorbe el 70 % del daño.' } },
};
const DK_ORDEN_HEROES = ['bunny', 'squirrel', 'fox', 'beaver', 'meercat', 'junkcoon', 'mechavaca'];

/* ---------- facciones enemigas: cada una con su mazmorra (la de los animales nunca sale como enemiga) ---------- */
const DK_MAZMORRAS = {
  nomuertos: { nombre: 'LA CRIPTA', pared: '#4a4660', suelo: '#2a2636', techo: '#1a1724', luz: '#8a4fd0', niebla: '#0b0812', jefe: 'necrolord', musica: 'nomuertos', desc: 'Huesos, zombis y un señor muy pálido que no quiere visitas.' },
  streamers: { nombre: 'EL PLATÓ', pared: '#3a2a4a', suelo: '#241a30', techo: '#140c1c', luz: '#c084fc', niebla: '#0c0712', jefe: 'twitchking', musica: 'streamers', desc: 'Focos, hype y una horda de suscriptores. Todo en directo.' },
  heroes:    { nombre: 'EL TEMPLO', pared: '#6a5a3a', suelo: '#3a3224', techo: '#241e14', luz: '#ffcb3d', niebla: '#120e06', jefe: 'epicchampion', musica: 'heroes', desc: 'Columnas de mármol, hoplitas y un campeón con demasiada experiencia.' },
  ciber:     { nombre: 'EL BÚNKER', pared: '#2a4a4a', suelo: '#1a2e30', techo: '#0c1a1c', luz: '#22e3ff', niebla: '#050f12', jefe: 'cybermarine', musica: 'ciber', desc: 'Pasillos de neón, drones y escudos que se recargan.' },
  memes:     { nombre: 'EL FORO', pared: '#4a4a2a', suelo: '#2e2e1a', techo: '#1c1c0c', luz: '#a3e635', niebla: '#0f1005', jefe: 'memelord', musica: 'memes', desc: 'Gatos gordos, perros que hablan y un RNG que te odia.' },
  gamer:     { nombre: 'LA LAN', pared: '#2a4a3a', suelo: '#1a2e24', techo: '#0c1c14', luz: '#4ade80', niebla: '#05100a', jefe: 'progamer', musica: 'gamer', desc: 'Cables por el suelo, noobs por todas partes y una recreativa que pega.' },
  olvidados: { nombre: 'EL ALMACÉN', pared: '#5a5a4a', suelo: '#34342a', techo: '#1e1e18', luz: '#d6a96a', niebla: '#0e0d08', jefe: 'vikingo', musica: 'olvidados', desc: 'Cajas de cartuchos y héroes de juegos que nadie recuerda. Ellos sí se acuerdan.' },
  pop:       { nombre: 'EL ESTUDIO', pared: '#5a2a3a', suelo: '#341a24', techo: '#1e0c14', luz: '#ff6b9a', niebla: '#10050a', jefe: 'directora', musica: 'pop', desc: 'Dobles de acción, spoilers y una directora que grita ¡CORTEN!' },
  microblizz:{ nombre: 'LAS OFICINAS', pared: '#3a3a4a', suelo: '#222230', techo: '#14141c', luz: '#ff4d4d', niebla: '#08080e', jefe: 'ceo', musica: 'boss', desc: 'Becarios, bots de soporte y el CEO en su despacho. Cuidado con el crunch.' },
  phony:     { nombre: 'LA PAYSTATION', pared: '#2a3a5a', suelo: '#1a2234', techo: '#0c121e', luz: '#5b8cff', niebla: '#05080f', jefe: 'presi', musica: 'boss1', desc: 'Suscripciones obligatorias y un remaster del mismo pasillo. Otra vez.' },
};
// La forma de cada mazmorra: cuántas salas, de qué tamaño, cuántas vueltas y qué decorado (ver mapa.js y decorado.js)
const DK_FORMAS = {
  nomuertos: { salas: 10, min: 5, max: 9, vueltas: 2, props: ['lapida', 'pilar'] },        // criptas estrechas con lápidas
  streamers: { salas: 7, min: 8, max: 12, vueltas: 3, props: ['foco', 'pantalla'] },       // platós amplios
  heroes:    { salas: 8, min: 7, max: 11, vueltas: 2, props: ['columna', 'pedestal'] },    // templo con columnas
  ciber:     { salas: 12, min: 4, max: 7, vueltas: 5, props: ['servidor', 'tubo'] },       // búnker de pasillos
  memes:     { salas: 9, min: 5, max: 10, vueltas: 4, props: ['caja', 'pilar'] },
  gamer:     { salas: 9, min: 6, max: 10, vueltas: 3, props: ['recreativa', 'caja'] },
  olvidados: { salas: 8, min: 6, max: 11, vueltas: 1, props: ['caja', 'estanteria'] },     // almacén de cajas
  pop:       { salas: 8, min: 7, max: 11, vueltas: 2, props: ['foco', 'pedestal'] },
  microblizz:{ salas: 11, min: 5, max: 8, vueltas: 3, props: ['mesa', 'servidor'] },       // oficinas
  phony:     { salas: 10, min: 5, max: 8, vueltas: 2, props: ['tubo', 'pantalla'] },
};
const DK_ORDEN_MAZMORRAS = ['nomuertos', 'heroes', 'streamers', 'ciber', 'memes', 'gamer', 'olvidados', 'pop', 'microblizz', 'phony'];

// Las cifras de los monstruos salen de las del Rumble (CFG.units: vida, daño, enfriamiento, alcance en píxeles, velocidad en px/s) pasadas a la mazmorra.
// Un bicho con `ranged` dispara desde lejos. El líder de la facción es el jefe de su mazmorra, con mucha más vida.
function dkMonstruo(k, jefe = false) {
  const u = CFG.units[k] || { hp: 150, dmg: 15, cd: 1, range: 8, speed: 40, r: 12 };
  const dist = u.range > 40;
  const m = { k, nombre: cardDef(k) ? cardDef(k).name : k, alto: Math.max(0.9, Math.min(2.4, (BOX[k] ? BOX[k][1] : 50) / 42)),
    hp: Math.round(u.hp * (jefe ? 1.4 : 0.4)), dmg: Math.round(u.dmg * (jefe ? 1.3 : 0.9)), vel: Math.min(2.3, u.speed / 26), r: (u.r || 12) / 40,
    alc: dist ? Math.min(6, u.range / 20) : 0.9, cd: Math.max(1.2, u.cd * 1.8), vista: jefe ? 8 : dist ? 6.5 : 5, dist, botin: jefe ? 1 : dist ? 0.4 : 0.3, jefe };
  if (u.rarity === 'epic' || u.hp >= 500) { m.elite = !jefe; m.botin = jefe ? 1 : 0.7; }
  return m;
}
function dkUnidadesDe(fac) { return (FACTIONS[fac].units || []).filter(k => ART[k] && CFG.units[k]); }

/* ---------- objetos ---------- */
const DK_ARMAS = ['Daga', 'Espada', 'Hacha', 'Maza', 'Lanza', 'Bastón', 'Martillo', 'Zanahoria afilada'];
const DK_ARMADURAS = ['Jubón', 'Cota', 'Peto', 'Coraza', 'Capa', 'Armadura', 'Caparazón'];
const DK_TESOROS = ['Moneda de oro', 'Cáliz', 'Anillo viejo', 'Corona rota', 'Contrato de Microblizz', 'Dado de 20 caras', 'Calavera dorada', 'Gema turbia', 'Reloj sin horas', 'Cofre diminuto', 'Bellota de plata'];
const DK_APODOS = ['oxidada', 'del sótano', 'de la Cripta', 'del becario', 'maldita', 'de los fans', 'pulida', 'de Microblizz', 'del último nivel', 'olvidada', 'de la Madriguera'];
const DK_ICONO = { arma: 'espada', armadura: 'armadura', tesoro: 'gema' };   // nombres de iconos de pixel-props.js
let dkIdN = 0;

function dkCrearObjeto(rng, tipo, rareza) {
  const nombres = tipo === 'arma' ? DK_ARMAS : tipo === 'armadura' ? DK_ARMADURAS : DK_TESOROS;
  const base = nombres[Math.floor(rng() * nombres.length)];
  const o = { id: Date.now().toString(36) + (dkIdN++).toString(36), tipo, rareza, nombre: base };
  if (tipo !== 'tesoro') o.nombre = base + ' ' + DK_APODOS[Math.floor(rng() * DK_APODOS.length)];
  if (tipo === 'arma') o.dmg = Math.round((2 + rareza * 3.5) * (0.85 + rng() * 0.35));
  if (tipo === 'armadura') { o.arm = Math.round((4 + rareza * 7) * (0.85 + rng() * 0.3)); o.hp = rareza * 12; }
  o.valor = Math.round((tipo === 'tesoro' ? 14 : 8) * Math.pow(2.1, rareza) * (0.8 + rng() * 0.5));
  return o;
}
// rareza según la profundidad (0 a 2) y un empujón extra (cofres, jefe)
function dkRarezaAzar(rng, prof, extra = 0) {
  const pesos = [60 - prof * 14 - extra * 20, 28, 9 + prof * 6 + extra * 12, 3 + prof * 3 + extra * 10, 0.6 + prof * 1.4 + extra * 5].map(p => Math.max(0, p));
  let r = rng() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 5; i++) { if ((r -= pesos[i]) < 0) return i; }
  return 0;
}
function dkObjetoAzar(rng, prof, extra = 0) {
  const t = rng(), tipo = t < 0.3 ? 'arma' : t < 0.55 ? 'armadura' : 'tesoro';
  return dkCrearObjeto(rng, tipo, dkRarezaAzar(rng, prof, extra));
}
function dkTextoObjeto(o) {
  if (o.tipo === 'arma') return '+' + o.dmg + ' de daño';
  if (o.tipo === 'armadura') return '+' + o.arm + ' de defensa' + (o.hp ? ' · +' + o.hp + ' de vida' : '');
  return 'Solo se vende';
}

/* ---------- partida guardada (la de este juego; no se comparte con ningún otro) ---------- */
const DK_GUARDA = 'fansof-dark';
const SAVE = { muted: false, vol: 1, mus: 1 };   // los pide el motor de sonido de la serie
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : SAVE.vol; }
function volMusica() { return 0.3 * SAVE.mus; }
const DK_NUEVA = () => ({ oro: 60, alijo: [], heroe: 'bunny', mazmorra: 'nomuertos', lleva: { arma: null, armadura: null }, pociones: 1, bajadas: 0, salvos: 0, muertes: 0, mejor: 0, jefes: {}, mute: false });
let DKS = DK_NUEVA();
function dkCargar() {
  try { const j = JSON.parse(localStorage.getItem(DK_GUARDA)); if (j && typeof j === 'object') DKS = Object.assign(DK_NUEVA(), j); } catch (e) { /* partida nueva */ }
  if (!DK_HEROES[DKS.heroe]) DKS.heroe = 'bunny';
  if (!DK_MAZMORRAS[DKS.mazmorra]) DKS.mazmorra = 'nomuertos';
  SAVE.muted = !!DKS.mute;
}
function dkGuardar() { DKS.mute = SAVE.muted; try { localStorage.setItem(DK_GUARDA, JSON.stringify(DKS)); } catch (e) { /* sin guardar */ } }
