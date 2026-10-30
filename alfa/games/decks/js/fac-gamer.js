// Fans Of Decks · Facción Comunidad Gamer (líder ProGamer): mazos variados, un poco de todo y robar. Pasiva Comunidad: tu carta suma +1 al daño, el bloqueo o la cura por cada tipo
// DISTINTO de carta que ya has jugado ese turno (hasta +4; lo contrario de la Racha salvaje, que premia repetir). Los ganchos (bono, estados) los llama combate.js con dcGancho.
'use strict';
Object.assign(CFG.units, { progamer: { r: 18 }, noobs: { r: 10 }, speedrunner: { r: 12 }, modder: { r: 13 }, coleccionista: { r: 13 }, ragequitter: { r: 15 }, recreativa: { r: 22 }, campero: { r: 14 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  noobs: { fac: 'gamer', nombre: 'Noobs', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'noobs', fx: { dano: 2, veces: 3 }, asc: { dano: 3 }, texto: 'Tres novatos con gorro de hélice: {dano} de daño, {veces} veces.' },
  speedrunner: { fac: 'gamer', nombre: 'Speedrunner', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'speedrunner', fx: { dano: 7, roba: 1 }, asc: { dano: 9 }, texto: 'Se salta media reunión: {dano} de daño y robas {roba}.' },
  modder: { fac: 'gamer', nombre: 'Modder', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'modder', fx: { bloqueo: 8, cura: 1 }, asc: { bloqueo: 10, cura: 2 }, texto: 'Arregla la reunión mejor que la empresa: {bloqueo} de bloqueo y te cura {cura}.' },
  guia: { fac: 'gamer', nombre: 'Guía de trucos', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'GT', mini: 'emotes', fx: { bloqueo: 7, roba: 1 }, asc: { bloqueo: 9 }, texto: 'Alguien lo ha escrito en un foro: {bloqueo} de bloqueo y robas {roba}.' },
  logro: { fac: 'gamer', nombre: 'Logro desbloqueado', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'LD', mini: 'lanzaconfeti', fx: { roba: 1, bloqueo: 2 }, asc: { bloqueo: 5 }, texto: 'Gratis: ¡ding! Robas {roba} y {bloqueo} de bloqueo.' },
  sp_critico: { fac: 'gamer', nombre: 'Golpe crítico', tipo: 'tarea', rar: 'basic', coste: 2, arte: 'sp_critico', fx: { dano: 14 }, asc: { dano: 20 }, texto: '¡CRÍTICO! {dano} de daño.' },
  // ---------- pool ----------
  coleccionista: { fac: 'gamer', nombre: 'Coleccionista', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'coleccionista', fx: { dano: 8, obj: 'todos' }, asc: { dano: 10 }, texto: 'Lanza sus juegos en disco y rebotan en todos: {dano} de daño a todos los rivales.' },
  ragequitter: { fac: 'gamer', nombre: 'RageQuitter', tipo: 'empleado', rar: 'common', coste: 1, arte: 'ragequitter', fx: { dano: 17, pierde: 3, despedida: true }, asc: { dano: 22 }, texto: 'Pierde, se enfada y tira el mando: {dano} de daño, pero pierdes {pierde} de vida.' },
  recreativa: { fac: 'gamer', nombre: 'Recreativa', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'recreativa', fx: { bloqueo: 14, dano: 12, roba: 1 }, asc: { bloqueo: 18, dano: 15 }, texto: 'Una máquina arcade con piernas: {bloqueo} de bloqueo, {dano} de daño y robas {roba}.' },
  campero: { fac: 'gamer', nombre: 'Campero', tipo: 'empleado', rar: 'rare', coste: 1, arte: 'campero', fx: { dano: 7, cond: 'primerGolpe' }, asc: { dano: 9 }, texto: 'Escondido en el arbusto de la sala: {dano} de daño; el triple si el rival tiene toda la vida.' },
  sp_review: { fac: 'gamer', nombre: 'Review bombing', tipo: 'tarea', rar: 'epic', coste: 1, arte: 'sp_review', fx: { vulnerable: 2, obj: 'todos', roba: 1 }, asc: { vulnerable: 3 }, texto: 'Mil reseñas de una estrella: todos los rivales con Vulnerable {vulnerable} y robas {roba}.' },
  sp_energetica: { fac: 'gamer', nombre: 'Bebida energética', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_energetica', fx: { cura: 8, fuerzaTurno: 1 }, asc: { cura: 12, fuerzaTurno: 2 }, texto: 'Una lata para todos: te cura {cura} y los empleados de este turno pegan +{fuerzaTurno}.' },
  sp_ping: { fac: 'gamer', nombre: 'Ping de 999', tipo: 'tarea', rar: 'legendary', coste: 1, arte: 'sp_ping', fx: { aturde: 1, obj: 'todos', roba: 1 }, asc: { coste: 0 }, texto: 'Lag horrible: todos los rivales pierden su próximo turno y robas {roba}.' },
  combo: { fac: 'gamer', nombre: 'Combo de teclas', tipo: 'tarea', rar: 'common', coste: 1, ic: 'CT', mini: 'speedrun', fx: { dano: 8, vulnerable: 1 }, asc: { dano: 12 }, texto: '{dano} de daño y Vulnerable {vulnerable}.' },
  parche_eq: { fac: 'gamer', nombre: 'Parche de equilibrio', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'PQ', mini: 'mazo_hotfix', fx: { debil: 2, bloqueo: 7 }, asc: { bloqueo: 10 }, texto: 'Nerfeas al rival: Débil {debil} y {bloqueo} de bloqueo.' },
  torneo: { fac: 'gamer', nombre: 'Torneo de la comunidad', tipo: 'directiva', rar: 'rare', coste: 1, ic: 'TO', mini: 'ceo', fx: { poder: 'torneo', n: 1 }, asc: { n: 2 }, texto: 'Torneo: la Comunidad suma {n} más a cada carta durante la reunión.' },
  comp_noob: { fac: 'gamer', nombre: 'Noob con ganas', tipo: 'companero', rar: 'common', coste: 1, arte: 'noobs', fx: { companero: true, turnos: 3, dano: 3 }, asc: { dano: 7 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
  comp_modder: { fac: 'gamer', nombre: 'Moderador del foro', tipo: 'companero', rar: 'rare', coste: 2, arte: 'modder', fx: { companero: true, turnos: 3, bloqueo: 5, cura: 2 }, asc: { bloqueo: 7, cura: 3 }, texto: 'Se queda {turnos} turnos: al acabar cada uno te da {bloqueo} de bloqueo y te cura {cura}.' },
});
DC_MAZOS.progamer = ['noobs', 'noobs', 'speedrunner', 'speedrunner', 'modder', 'guia', 'guia', 'logro', 'sp_critico', 'sp_critico'];
DC_FACCIONES.gamer = { nombre: 'Comunidad Gamer', pasiva: 'Comunidad', tope: 4, texto: 'Comunidad Gamer: cada carta suma +1 a su daño, bloqueo o cura por cada tipo distinto de carta que ya hayas jugado ese turno (hasta +4).',
  bono(C, D) { return Math.min(DC_FACCIONES.gamer.tope + (C.poderes.torneo || 0), Object.keys(C.tiposTurno).filter(t => t !== D.tipo).length + (C.poderes.torneo || 0)); },
  estados(C) { const n = Object.keys(C.tiposTurno).length + (C.poderes.torneo || 0); return [{ cls: 'dc-est-turno', icono: 'refuerzo', texto: tr('Comunidad'), n: '+' + Math.min(DC_FACCIONES.gamer.tope + (C.poderes.torneo || 0), n), explica: tr(DC_FACCIONES.gamer.texto), turno: true }]; } };
DC_LIDERES.progamer = { nombre: 'ProGamer', faccion: 'gamer', arte: 'progamer', hp: 68,
  jugada: { nombre: 'Combo', carga: 6, dano: 6, roba: 2, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: {dano} de daño a todos los rivales y robas {roba}.' } };
DC_PODER_ICONO.torneo = 'fuerza';
Object.assign(DC_BIB_FACCIONES, { gamer: 'Comunidad Gamer' });
