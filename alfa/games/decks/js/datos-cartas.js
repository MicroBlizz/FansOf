// Fans Of Decks · Cartas: qué hace cada una (coste, cifras, texto) y los mazos. Core dice quién es cada unidad (nombre, rareza, dibujo); aquí van sus cifras en Decks.
// fx: dano/veces/obj ('uno' o 'todos'), bloqueo, cura, roba, caos, vulnerable, debil, aturde, fuerza (toda la reunión), fuerzaTurno, poder (nido, espinas),
// palabras clave (se añaden solas al texto): despedida (se va al jugarla), indefinido (no se descarta), madrugador (siempre en la mano inicial).
// asc: lo que cambia al ascender (Becario → Junior): cifras, coste, quitar despedida (despedida: false) o añadir madrugador; dcVerAscenso lo enseña antes.
// cond ('primerGolpe' = x3 si el rival tiene toda la vida; 'noMax' = x2 si no es el rival con más vida; 'porTropa' = daño por cada empleado jugado este turno).
// Marcas: despedida (se va al jugarse), indefinido (no se descarta), primeraHora (siempre en la mano inicial), injugable, alRobar ('caos-1').
// asc: lo que cambia al ascender (Becario → Junior). El texto usa {clave} y se rellena con las cifras de la carta, ascendida o no.
'use strict';
// Los radios que drawVector necesita para los pies de cada unidad (los mismos que en Rumble).
Object.assign(CFG.units, {
  squirrel: { r: 12 }, fox: { r: 14 }, bunny: { r: 20 }, beaver: { r: 12 }, meercat: { r: 12 }, junkcoon: { r: 14 }, mechavaca: { r: 22 }, vaca: { r: 12 }, huron: { r: 13 },
  becario: { r: 12 }, starbot: { r: 14 }, fallen: { r: 21 }, cajabotin: { r: 15 }, soportebot: { r: 13 }, parchebot: { r: 20 },
});
const DC_CARTAS = {
  // ---------- mazo inicial de CrazyBunny ----------
  squirrel: { nombre: 'MadSquirrel', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'squirrel', fx: { dano: 3, veces: 2 }, asc: { dano: 4 }, texto: 'Salen dos ardillas: {dano} de daño, {veces} veces.' },
  beaver: { nombre: 'BoomBeaver', tipo: 'empleado', rar: 'basic', coste: 2, arte: 'beaver', fx: { dano: 12, despedida: true }, asc: { dano: 14, despedida: false }, texto: 'Corre con la dinamita: {dano} de daño.' },
  zanahoria: { nombre: 'Zanahoria', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'ZN', fx: { bloqueo: 6 }, asc: { bloqueo: 9 }, texto: 'Un mordisco de zanahoria: {bloqueo} de bloqueo.' },
  sp_bellotas: { nombre: 'Lluvia de bellotas', tipo: 'tarea', rar: 'common', coste: 2, arte: 'sp_bellotas', fx: { dano: 6, obj: 'todos' }, asc: { dano: 9 }, texto: 'Llueven bellotas: {dano} de daño a todos los rivales.' },
  grito: { nombre: 'Grito de la madriguera', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'GM', fx: { fuerzaTurno: 2 }, asc: { fuerzaTurno: 3 }, texto: 'Gratis: los empleados de este turno pegan +{fuerzaTurno}.' },
  // ---------- pool de los Animales Locos y de la rebelión ----------
  fox: { nombre: 'SlyFox', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'fox', fx: { dano: 8, cond: 'primerGolpe' }, asc: { dano: 10 }, texto: 'Invisible: {dano} de daño; el triple si el rival tiene toda la vida.' },
  meercat: { nombre: 'MeerCat', tipo: 'empleado', rar: 'rare', coste: 1, arte: 'meercat', fx: { cura: 5 }, asc: { cura: 7 }, texto: 'La enfermera te cura {cura}.' },
  junkcoon: { nombre: 'JunkCoon', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'junkcoon', fx: { dano: 7, obj: 'todos' }, asc: { dano: 9 }, texto: 'Bolsas de basura explosivas: {dano} de daño a todos los rivales.' },
  mechavaca: { nombre: 'MechaVaca', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'mechavaca', fx: { dano: 14, bloqueo: 6 }, asc: { dano: 18, bloqueo: 8 }, texto: 'El mecha embiste: {dano} de daño y {bloqueo} de bloqueo.' },
  huron: { nombre: 'HurónNinja', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'huron', fx: { dano: 8, cond: 'noMax' }, asc: { dano: 10 }, texto: 'Salta la primera línea: {dano} de daño; el doble si el rival no es el que más vida tiene.' },
  vaca: { nombre: 'La vaca', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'vaca', fx: { dano: 6, debil: 1 }, asc: { dano: 8 }, texto: 'La vaca empuja: {dano} de daño y Débil {debil}.' },
  ardillasfuriosas: { nombre: 'Ardillas furiosas', tipo: 'empleado', rar: 'common', coste: 2, arte: 'squirrel', fx: { dano: 3, veces: 4 }, asc: { dano: 4 }, texto: 'Una horda de ardillas: {dano} de daño, {veces} veces.' },
  sp_botiquin: { nombre: 'Botiquín del bosque', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_botiquin', fx: { cura: 8 }, asc: { cura: 11 }, texto: 'Tiritas, hojas y cariño: te cura {cura}.' },
  bellotagigante: { nombre: 'Bellota gigante', tipo: 'tarea', rar: 'common', coste: 3, arte: 'sp_bellotas', fx: { dano: 18 }, asc: { coste: 2 }, texto: 'Una bellota del tamaño de un despacho: {dano} de daño.' },
  sp_pulgas: { nombre: 'Pulgas', tipo: 'tarea', rar: 'legendary', coste: 2, arte: 'sp_pulgas', fx: { aturde: 1, obj: 'todos' }, asc: { coste: 1 }, texto: 'Una plaga de pulgas: todos los rivales pierden su próximo turno rascándose.' },
  madriguera: { nombre: 'Madriguera', tipo: 'tramite', rar: 'common', coste: 2, ic: 'MD', fx: { bloqueo: 10, roba: 1 }, asc: { bloqueo: 13 }, texto: 'Te metes en la madriguera: {bloqueo} de bloqueo y roba {roba}.' },
  cafe: { nombre: 'Café de la máquina', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'CF', fx: { roba: 2, despedida: true }, asc: { madrugador: true }, texto: 'Un café aguado: roba {roba}.' },
  horapunta: { nombre: 'Hora punta', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'HP', fx: { roba: 2 }, asc: { coste: 0 }, texto: 'Todo el mundo a la vez: roba {roba}.' },
  rabia: { nombre: 'Rabia', tipo: 'directiva', rar: 'rare', coste: 1, ic: 'RB', fx: { fuerza: 2 }, asc: { fuerza: 3 }, texto: 'Rabia: +{fuerza} de fuerza el resto de la reunión.' },
  esconderse: { nombre: 'Esconderse', tipo: 'tramite', rar: 'common', coste: 1, ic: 'ES', fx: { bloqueo: 5, indefinido: true }, asc: { bloqueo: 7 }, texto: 'Te escondes tras la fotocopiadora: {bloqueo} de bloqueo.' },
  zancadilla: { nombre: 'Zancadilla', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'ZC', fx: { dano: 4, vulnerable: 2 }, asc: { dano: 6 }, texto: '{dano} de daño y Vulnerable {vulnerable}.' },
  manada: { nombre: 'Manada', tipo: 'tramite', rar: 'rare', coste: 2, ic: 'MN', fx: { dano: 3, cond: 'porTropa' }, asc: { dano: 4 }, texto: '{dano} de daño a un rival por cada empleado jugado este turno.' },
  nido: { nombre: 'Nido', tipo: 'directiva', rar: 'rare', coste: 1, ic: 'ND', fx: { poder: 'nido', n: 3 }, asc: { n: 4 }, texto: 'Nido: al empezar cada turno, {n} de bloqueo.' },
  rastro: { nombre: 'Rastro', tipo: 'tramite', rar: 'common', coste: 0, ic: 'RS', fx: { caos: 1, roba: 1, despedida: true }, asc: { despedida: false }, texto: 'Sigues el rastro: +{caos} CAOS y roba {roba}.' },
  merendar: { nombre: 'Hora de merendar', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'HM', fx: { cura: 4, roba: 1 }, asc: { cura: 6 }, texto: 'Un bocadillo rápido: te cura {cura} y roba {roba}.' },
  espinas: { nombre: 'Espinas del seto', tipo: 'directiva', rar: 'common', coste: 1, ic: 'EP', fx: { poder: 'espinas', n: 2 }, asc: { n: 3 }, texto: 'Espinas: cada rival que te pega recibe {n} de daño.' },
  // ---------- cláusulas y spam ----------
  cl_suscripcion: { nombre: 'Suscripción obligatoria', tipo: 'clausula', rar: 'basic', coste: 0, ic: 'SO', fx: { injugable: true, alRobar: 'caos-1' }, texto: 'Injugable. Al robarla pierdes 1 CAOS.' },
  cl_reunion: { nombre: 'Reunión que podía ser un correo', tipo: 'clausula', rar: 'basic', coste: 0, ic: 'RC', fx: { injugable: true }, texto: 'Injugable. Ocupa sitio en la mano y no hace nada.' },
  spam: { nombre: 'Spam', tipo: 'spam', rar: 'basic', coste: 0, ic: 'SP', fx: { injugable: true }, texto: 'Injugable. Un correo de Microblizz. Se tira al acabar el turno.' },
};
// El mazo inicial de cada líder y el pool del que salen las ofertas (las legendarias solo las dan los jefes y los correos).
const DC_MAZOS = {
  bunny: ['squirrel', 'squirrel', 'squirrel', 'squirrel', 'beaver', 'beaver', 'zanahoria', 'zanahoria', 'sp_bellotas', 'grito'],
};
const DC_POOL = Object.keys(DC_CARTAS).filter(k => !['clausula', 'spam'].includes(DC_CARTAS[k].tipo) && DC_CARTAS[k].rar !== 'legendary' && !DC_MAZOS.bunny.includes(k));
const DC_PESOS_RAREZA = { basic: 60, common: 30, rare: 8, epic: 2 };
// Los líderes: vida, pasiva y jugada activa.
const DC_LIDERES = {
  bunny: { nombre: 'CrazyBunny', faccion: 'animales', hp: 75, pasiva: 'RABIA', pasivaTexto: 'Cada empleado pega +1 por cada empleado jugado antes en el turno (hasta +5).',
    jugada: { nombre: 'Salto del caos', carga: 6, dano: 8, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: {dano} de daño a todos los rivales.' } },
};
