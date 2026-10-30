// Fans Of Decks · Facción Héroes (líder EpicChampion): cada rival derrotado da experiencia. Pasiva Experiencia: cada 3 bajas subes de nivel (+1 Fuerza el resto de la reunión, hasta nivel 5).
// Pocos golpes grandes, rematar rivales y cartas que escalan con el nivel (porNivel). Los ganchos (alBaja, alJugar, estados) los llama combate.js a través de dcGancho.
'use strict';
Object.assign(CFG.units, { epicchampion: { r: 20 }, cupidarcher: { r: 11 }, hoplite: { r: 11 }, shieldmaiden: { r: 15 }, thundergod: { r: 15 }, medusa: { r: 13 }, minotaur: { r: 21 }, arpia: { r: 13 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  hoplite: { fac: 'heroes', nombre: 'Hoplites', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'hoplite', fx: { dano: 4, veces: 3 }, asc: { dano: 7 }, texto: 'Tres soldados con lanza larga: {dano} de daño, {veces} veces.' },
  shieldmaiden: { fac: 'heroes', nombre: 'ShieldMaiden', tipo: 'empleado', rar: 'basic', coste: 2, arte: 'shieldmaiden', fx: { dano: 8, bloqueo: 10 }, asc: { dano: 10, bloqueo: 12 }, texto: 'La valquiria del escudo: {dano} de daño y {bloqueo} de bloqueo.' },
  cupidarcher: { fac: 'heroes', nombre: 'CupidArcher', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'cupidarcher', fx: { dano: 9 }, asc: { dano: 11 }, texto: 'Una flecha desde lejos: {dano} de daño.' },
  escudo_bronce: { fac: 'heroes', nombre: 'Escudo de bronce', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'EB', mini: 'piel', fx: { bloqueo: 9 }, asc: { bloqueo: 12 }, texto: 'Levantas el escudo de la sala de trofeos: {bloqueo} de bloqueo.' },
  sp_rayo: { fac: 'heroes', nombre: 'Rayo divino', tipo: 'tarea', rar: 'basic', coste: 2, arte: 'sp_rayo', fx: { dano: 17 }, asc: { dano: 21 }, texto: 'Un dios enfadado desde la nube de la oficina: {dano} de daño.' },
  arenga: { fac: 'heroes', nombre: 'Arenga', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'AR', mini: 'grito', fx: { bloqueo: 4, roba: 1 }, asc: { bloqueo: 8 }, texto: 'Una charla motivacional a voces: {bloqueo} de bloqueo y roba {roba}.' },
  // ---------- pool ----------
  thundergod: { fac: 'heroes', nombre: 'ThunderGod', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'thundergod', fx: { dano: 10, obj: 'todos' }, asc: { dano: 12 }, texto: 'Su rayo salta de rival en rival: {dano} de daño a todos los rivales.' },
  medusa: { fac: 'heroes', nombre: 'Medusa', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'medusa', fx: { dano: 7, aturde: 1 }, asc: { dano: 9 }, texto: 'Se baja las gafas de sol: {dano} de daño y el rival pierde su próximo turno, petrificado.' },
  minotaur: { fac: 'heroes', nombre: 'Minotaur', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'minotaur', fx: { dano: 12, cond: 'primerGolpe', aturde: 1 }, asc: { dano: 14 }, texto: 'Embiste con el hacha doble: {dano} de daño, el triple si el rival tiene toda la vida, y lo aturde.' },
  arpia: { fac: 'heroes', nombre: 'Arpía', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'arpia', fx: { dano: 8, porNivel: 3 }, asc: { dano: 10, porNivel: 4 }, texto: 'Cae desde arriba: {dano} de daño, y {porNivel} más por cada nivel que tengas.' },
  falange: { fac: 'heroes', nombre: 'Falange', tipo: 'empleado', rar: 'common', coste: 2, arte: 'hoplite', fx: { dano: 4, bloqueo: 10 }, asc: { dano: 8, bloqueo: 12 }, texto: 'Escudos juntos y lanzas fuera: {dano} de daño y {bloqueo} de bloqueo.' },
  sp_ambrosia: { fac: 'heroes', nombre: 'Ambrosía', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_ambrosia', fx: { cura: 9, bloqueo: 4 }, asc: { cura: 12, bloqueo: 8 }, texto: 'La bebida de los dioses, en vaso de plástico: te cura {cura} y {bloqueo} de bloqueo.' },
  sp_nerfeo: { fac: 'heroes', nombre: 'Nerfeo divino', tipo: 'tarea', rar: 'legendary', coste: 2, arte: 'sp_nerfeo', fx: { debil: 3, vulnerable: 2, obj: 'todos' }, asc: { coste: 1 }, texto: 'Los dioses publican un parche: todos los rivales con Débil {debil} y Vulnerable {vulnerable}.' },
  hazana: { fac: 'heroes', nombre: 'Hazaña', tipo: 'tarea', rar: 'epic', coste: 2, ic: 'HZ', mini: 'furia', fx: { dano: 12, porNivel: 4 }, asc: { dano: 14, porNivel: 5 }, texto: 'Lo que cuentan los bardos: {dano} de daño, y {porNivel} más por cada nivel que tengas.' },
  duelo: { fac: 'heroes', nombre: 'Duelo singular', tipo: 'tarea', rar: 'common', coste: 1, ic: 'DU', mini: 'ragdoll', fx: { dano: 8, vulnerable: 1 }, asc: { dano: 11 }, texto: 'Uno contra uno en el pasillo: {dano} de daño y Vulnerable {vulnerable}.' },
  entrenamiento: { fac: 'heroes', nombre: 'Entrenamiento', tipo: 'tramite', rar: 'common', coste: 1, ic: 'EN', mini: 'speedrun', fx: { xp: 2, roba: 1 }, asc: { xp: 3 }, texto: 'Una hora en el gimnasio de la oficina: ganas {xp} de experiencia y robas {roba}.' },
  aliento: { fac: 'heroes', nombre: 'Segundo aliento', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'SA', mini: 'cafeina', fx: { cura: 8, roba: 1 }, asc: { cura: 11 }, texto: 'Te levantas otra vez: te cura {cura} y robas {roba}.' },
  estandarte: { fac: 'heroes', nombre: 'Estandarte de guerra', tipo: 'directiva', rar: 'rare', coste: 1, ic: 'ET', mini: 'lanzaconfeti', fx: { poder: 'estandarte', n: 4 }, asc: { n: 6 }, texto: 'Estandarte: cada rival que derrotas te da {n} de bloqueo.' },
  comp_escudero: { fac: 'heroes', nombre: 'Escudero', tipo: 'companero', rar: 'common', coste: 1, arte: 'hoplite', fx: { companero: true, turnos: 3, bloqueo: 3 }, asc: { bloqueo: 4 }, texto: 'Se queda {turnos} turnos: al acabar cada uno te da {bloqueo} de bloqueo.' },
  comp_cupido: { fac: 'heroes', nombre: 'Cupido de guardia', tipo: 'companero', rar: 'rare', coste: 2, arte: 'cupidarcher', fx: { companero: true, turnos: 3, dano: 4 }, asc: { dano: 8 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
});
DC_MAZOS.epicchampion = ['hoplite', 'hoplite', 'hoplite', 'shieldmaiden', 'shieldmaiden', 'cupidarcher', 'escudo_bronce', 'escudo_bronce', 'sp_rayo', 'arenga'];
DC_FACCIONES.heroes = { nombre: 'Héroes', pasiva: 'Experiencia', texto: 'Héroes: cada 3 rivales derrotados subes de nivel y ganas +1 de Fuerza el resto de la reunión (hasta el nivel 5).',
  alBaja(C) {
    C.xp = (C.xp || 0) + 1; if (C.poderes.estandarte) { C.bloqueo += C.poderes.estandarte; C.eventos.push({ t: 'bloqueo', r: -1, n: C.poderes.estandarte }); }
    dcSubeNivel(C);
  },
  alJugar(C, c, D, fx) { if (fx.xp) { C.xp = (C.xp || 0) + fx.xp; dcSubeNivel(C); } },
  estados(C) { return [{ cls: 'dc-est-fijo', icono: 'fuerza', texto: tr('Nivel'), n: (C.nivel || 0) + '/5', explica: tr(DC_FACCIONES.heroes.texto) + ' ' + tr('Experiencia: {n} de 3.', { n: (C.xp || 0) % 3 }) }]; } };
// Cada 3 de experiencia es un nivel (tope 5); el nivel sube la Fuerza y las cartas «por nivel».
function dcSubeNivel(C) {
  while ((C.nivel || 0) < 5 && (C.xp || 0) >= ((C.nivel || 0) + 1) * 3) { C.nivel = (C.nivel || 0) + 1; C.fuerza++; C.log.push(tr('¡Subes al nivel {n}!', { n: C.nivel })); }
}
DC_LIDERES.epicchampion = { nombre: 'EpicChampion', faccion: 'heroes', arte: 'epicchampion', hp: 78,
  jugada: { nombre: 'Team Fight', carga: 6, dano: 6, fuerzaTurno: 2, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: {dano} de daño a todos los rivales y tus empleados pegan +{fuerzaTurno} este turno.' } };
DC_PODER_ICONO.estandarte = 'defensa';
DC_BIB_PROPIEDADES.xp = 'Da experiencia'; DC_BIB_PROPIEDADES.porNivel = 'Escala con el nivel';
Object.assign(DC_BIB_FACCIONES, { heroes: 'Héroes' });
