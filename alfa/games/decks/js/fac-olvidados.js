// Fans Of Decks · Facción Olvidados (líder VikingoPerdido): arranque lento y seguro, compañeros, bloqueo y cartas retro. Pasiva Nostalgia: nadie se acuerda de ti, así que los rivales
// no te atacan el primer turno de cada reunión. Los ganchos (sinAtaque, estados) los llama combate.js con dcGancho; `herido` y el poder `retro` los lee dcResuelve.
'use strict';
Object.assign(CFG.units, { vikingo: { r: 19 }, swarmbug: { r: 8 }, vikingsquad: { r: 11 }, retromarine: { r: 13 }, ghostagent: { r: 12 }, rockracer: { r: 16 }, titanbeta: { r: 23 }, espia: { r: 13 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  swarmbug: { fac: 'olvidados', nombre: 'SwarmBugs', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'swarmbug', fx: { dano: 3, veces: 4 }, asc: { dano: 4 }, texto: 'Cuatro bichos de un juego que nunca salió: {dano} de daño, {veces} veces.' },
  vikingsquad: { fac: 'olvidados', nombre: 'Vikingos', tipo: 'empleado', rar: 'basic', coste: 2, arte: 'vikingsquad', fx: { dano: 7, bloqueo: 3 }, asc: { dano: 9, bloqueo: 5 }, texto: 'Tres vikingos con escudo y espada: {dano} de daño y {bloqueo} de bloqueo.' },
  retromarine: { fac: 'olvidados', nombre: 'RetroMarine', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'retromarine', fx: { dano: 3, veces: 2 }, asc: { dano: 4 }, texto: 'Ráfagas de 1998 con hombreras enormes: {dano} de daño, {veces} veces.' },
  polvo: { fac: 'olvidados', nombre: 'Polvo del almacén', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'PD', mini: 'gorro_abuela', fx: { bloqueo: 4 }, asc: { bloqueo: 7 }, texto: 'Te escondes entre cajas olvidadas: {bloqueo} de bloqueo.' },
  casete: { fac: 'olvidados', nombre: 'Cinta de casete', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'CS', mini: 'auriculares', fx: { roba: 1, bloqueo: 1 }, asc: { bloqueo: 3 }, texto: 'Gratis: la cinta suena un poco rara. Robas {roba} y {bloqueo} de bloqueo.' },
  sp_cartuchos: { fac: 'olvidados', nombre: 'Lluvia de cartuchos', tipo: 'tarea', rar: 'basic', coste: 2, arte: 'sp_cartuchos', fx: { dano: 7, obj: 'todos' }, asc: { dano: 9 }, texto: 'Caen cartuchos de juegos olvidados: {dano} de daño a todos los rivales.' },
  // ---------- pool ----------
  ghostagent: { fac: 'olvidados', nombre: 'GhostAgent', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'ghostagent', fx: { dano: 5, cond: 'primerGolpe' }, asc: { dano: 7 }, texto: 'Invisible: {dano} de daño; el triple si el rival tiene toda la vida.' },
  rockracer: { fac: 'olvidados', nombre: 'RockRacer', tipo: 'empleado', rar: 'common', coste: 1, arte: 'rockracer', fx: { dano: 8, perfora: true }, asc: { dano: 9 }, texto: 'Un misil desde un coche de carreras: {dano} de daño que se salta el bloqueo.' },
  titanbeta: { fac: 'olvidados', nombre: 'TitánBeta', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'titanbeta', fx: { dano: 12, bloqueo: 3, herido: 8 }, asc: { dano: 18, herido: 10 }, texto: '{dano} de daño y {bloqueo} de bloqueo; con la mitad de vida o menos se enfada y pega {herido} más.' },
  espia: { fac: 'olvidados', nombre: 'EspíaCancelado', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'espia', fx: { dano: 9, perfora: true, debil: 1 }, asc: { dano: 11 }, texto: 'Cae desde un juego que nunca existió: {dano} de daño que se salta el bloqueo y Débil {debil}.' },
  sp_parchefan: { fac: 'olvidados', nombre: 'Parche de la comunidad', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_parchefan', fx: { cura: 4, bloqueo: 4 }, asc: { cura: 7, bloqueo: 6 }, texto: 'Los fans arreglan lo que la empresa abandonó: te cura {cura} y {bloqueo} de bloqueo.' },
  sp_cancelado: { fac: 'olvidados', nombre: 'Juego cancelado', tipo: 'tarea', rar: 'legendary', coste: 1, arte: 'sp_cancelado', fx: { aturde: 1, bloqueo: 5, obj: 'todos' }, asc: { coste: 0 }, texto: 'Los rivales se quedan en gris: pierden su próximo turno. Tú ganas {bloqueo} de bloqueo.' },
  reedicion: { fac: 'olvidados', nombre: 'Reedición', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'RE', mini: 'dlc', fx: { resucita: true, bloqueo: 3 }, asc: { bloqueo: 4 }, texto: 'Vuelve a la tienda: la última carta que se despidió vuelve a tu mano y ganas {bloqueo} de bloqueo.' },
  aniversario: { fac: 'olvidados', nombre: 'Edición aniversario', tipo: 'directiva', rar: 'rare', coste: 2, ic: 'EA', mini: 'zanahoria_oro', fx: { poder: 'retro', n: 1 }, asc: { coste: 1 }, texto: 'Aniversario: tus compañeros se quedan {n} turno más.' },
  trofeo: { fac: 'olvidados', nombre: 'Muro de escudos', tipo: 'tramite', rar: 'common', coste: 2, ic: 'ME', mini: 'piel', fx: { bloqueo: 7, blindaje: 1 }, asc: { bloqueo: 9, blindaje: 2 }, texto: 'Todos con el escudo en alto: {bloqueo} de bloqueo y Blindaje {blindaje}.' },
  comp_viking: { fac: 'olvidados', nombre: 'Vikingo del sótano', tipo: 'companero', rar: 'common', coste: 1, arte: 'vikingsquad', fx: { companero: true, turnos: 3, dano: 3, bloqueo: 2 }, asc: { dano: 4, bloqueo: 3 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida y te da {bloqueo} de bloqueo.' },
  comp_bug: { fac: 'olvidados', nombre: 'Bicho del almacén', tipo: 'companero', rar: 'rare', coste: 1, arte: 'swarmbug', fx: { companero: true, turnos: 2, dano: 7 }, asc: { dano: 9 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
});
DC_MAZOS.vikingo = ['swarmbug', 'swarmbug', 'vikingsquad', 'vikingsquad', 'vikingsquad', 'retromarine', 'polvo', 'polvo', 'casete', 'sp_cartuchos'];
DC_FACCIONES.olvidados = { nombre: 'Olvidados', pasiva: 'Nostalgia', texto: 'Olvidados: nadie se acuerda de ti. Los rivales no te atacan el primer turno de cada reunión.',
  sinAtaque(C) { return C.turno === 1; },
  estados(C) { return C.turno === 1 ? [{ cls: 'dc-est-turno', icono: 'defensa', texto: tr('Nostalgia'), n: 1, explica: tr(DC_FACCIONES.olvidados.texto), turno: true }] : []; } };
DC_LIDERES.vikingo = { nombre: 'VikingoPerdido', faccion: 'olvidados', arte: 'vikingo', hp: 80,
  jugada: { nombre: 'Muro de escudos', carga: 6, bloqueo: 9, blindaje: 1, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: {bloqueo} de bloqueo y Blindaje {blindaje}.' } };
DC_PODER_ICONO.retro = 'cura';
DC_BIB_PROPIEDADES.herido = 'Más fuerte con poca vida';
Object.assign(DC_BIB_FACCIONES, { olvidados: 'Olvidados' });
