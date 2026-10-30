// Fans Of Decks · Facción Cultura Pop (líder LaDirectora): empleados y compañeros que se multiplican. Pasiva Secuela: el primer Empleado que juegas cada turno deja en tu descarte
// una copia «2» con la mitad de cifras (solo esa reunión). Los ganchos (alTurno, alJugar, estados) los llama combate.js con dcGancho; la copia lleva `mitad` y dcFx la reduce (partida.js).
'use strict';
Object.assign(CFG.units, { directora: { r: 18 }, extras: { r: 9 }, doble: { r: 12 }, detective: { r: 12 }, heroe: { r: 14 }, spoiler: { r: 13 }, kaiju: { r: 24 }, paparazzi: { r: 13 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  extras: { fac: 'pop', nombre: 'Extras', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'extras', fx: { dano: 5, veces: 3 }, asc: { dano: 6 }, texto: 'Tres extras con disfraz de cartón: {dano} de daño, {veces} veces.' },
  doble: { fac: 'pop', nombre: 'DobleDeAcción', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'doble', fx: { dano: 13 }, asc: { dano: 16 }, texto: 'Rueda la escena peligrosa: {dano} de daño.' },
  heroe: { fac: 'pop', nombre: 'HéroeDeSaldo', tipo: 'empleado', rar: 'basic', coste: 2, arte: 'heroe', fx: { dano: 11, bloqueo: 14 }, asc: { dano: 14, bloqueo: 18 }, texto: 'Capa de cortina y mucho aguante: {dano} de daño y {bloqueo} de bloqueo.' },
  claqueta: { fac: 'pop', nombre: 'Claqueta', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'CL', mini: 'casco_moto', fx: { bloqueo: 13 }, asc: { bloqueo: 18 }, texto: '¡Toma uno! {bloqueo} de bloqueo.' },
  toma_falsa: { fac: 'pop', nombre: 'Toma falsa', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'TF', mini: 'emotes', fx: { roba: 1 }, asc: { roba: 2 }, texto: 'Gratis: se ríen todos y repites la toma. Robas {roba}.' },
  sp_taquilla: { fac: 'pop', nombre: 'Explosión de taquilla', tipo: 'tarea', rar: 'basic', coste: 2, arte: 'sp_taquilla', fx: { dano: 13, obj: 'todos' }, asc: { dano: 18 }, texto: 'Doscientos millones de presupuesto: {dano} de daño a todos los rivales.' },
  // ---------- pool ----------
  detective: { fac: 'pop', nombre: 'Detective', tipo: 'empleado', rar: 'rare', coste: 1, arte: 'detective', fx: { dano: 8, vulnerable: 2 }, asc: { dano: 11 }, texto: 'Encuentra el punto débil: {dano} de daño y Vulnerable {vulnerable}.' },
  spoiler: { fac: 'pop', nombre: 'Spoiler', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'spoiler', fx: { dano: 10, aturde: 1 }, asc: { dano: 13 }, texto: 'Cuenta el final: {dano} de daño y el rival se queda en shock, sin turno.' },
  paparazzi: { fac: 'pop', nombre: 'Paparazzi', tipo: 'empleado', rar: 'common', coste: 1, arte: 'paparazzi', fx: { dano: 13, debil: 1 }, asc: { dano: 16 }, texto: 'Flash en la cara: {dano} de daño y Débil {debil}.' },
  kaiju: { fac: 'pop', nombre: 'KaijuDeGoma', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'kaiju', fx: { dano: 24, obj: 'todos' }, asc: { dano: 30 }, texto: 'Pisotón de actor con disfraz de goma: {dano} de daño a todos los rivales.' },
  extra_estrella: { fac: 'pop', nombre: 'Extra con frase', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'extras', fx: { dano: 13, bloqueo: 6, veces: 2 }, asc: { dano: 16 }, texto: 'Por fin tiene una línea: {dano} de daño, {veces} veces, y {bloqueo} de bloqueo.' },
  sp_maquillaje: { fac: 'pop', nombre: 'Maquillaje de rodaje', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_maquillaje', fx: { cura: 14, bloqueo: 5 }, asc: { cura: 19, bloqueo: 8 }, texto: 'Un retoque antes de la toma: te cura {cura} y {bloqueo} de bloqueo.' },
  sp_remake: { fac: 'pop', nombre: 'Remake', tipo: 'tarea', rar: 'legendary', coste: 2, arte: 'sp_remake', fx: { dano: 16, debil: 2, vulnerable: 2 }, asc: { coste: 1 }, texto: 'El rival sale en versión remake, más pequeño: {dano} de daño, Débil {debil} y Vulnerable {vulnerable}.' },
  guion: { fac: 'pop', nombre: 'Guion reescrito', tipo: 'tramite', rar: 'common', coste: 1, ic: 'GR', mini: 'mazo_hotfix', fx: { roba: 2 }, asc: { coste: 0 }, texto: 'Otro borrador a las tres de la mañana: robas {roba}.' },
  cameo: { fac: 'pop', nombre: 'Cameo sorpresa', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'CA', mini: 'ceo', fx: { bloqueo: 10, fuerzaTurno: 2 }, asc: { bloqueo: 13, fuerzaTurno: 3 }, texto: '{bloqueo} de bloqueo y los empleados de este turno pegan +{fuerzaTurno}.' },
  franquicia: { fac: 'pop', nombre: 'Franquicia', tipo: 'directiva', rar: 'epic', coste: 2, ic: 'FR', mini: 'clon', fx: { poder: 'franquicia', n: 1 }, asc: { coste: 1 }, texto: 'Franquicia: la Secuela deja {n} copia más cada turno.' },
  comp_extra: { fac: 'pop', nombre: 'Extra de fondo', tipo: 'companero', rar: 'common', coste: 1, arte: 'extras', fx: { companero: true, turnos: 3, dano: 5 }, asc: { dano: 8 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
  comp_doble: { fac: 'pop', nombre: 'Doble de la directora', tipo: 'companero', rar: 'rare', coste: 2, arte: 'doble', fx: { companero: true, turnos: 3, dano: 6, bloqueo: 4 }, asc: { dano: 10, bloqueo: 5 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida y te da {bloqueo} de bloqueo.' },
});
DC_MAZOS.directora = ['extras', 'extras', 'extras', 'doble', 'doble', 'heroe', 'claqueta', 'claqueta', 'sp_taquilla', 'toma_falsa'];
DC_FACCIONES.pop = { nombre: 'Cultura Pop', pasiva: 'Secuela', texto: 'Cultura Pop: el primer Empleado que juegas cada turno deja en tu descarte una copia «2» con la mitad de cifras (solo esa reunión).',
  alTurno(C) { C.secuelaHecha = false; },
  alJugar(C, c, D) {
    if (D.tipo !== 'empleado' || c.mitad || C.secuelaHecha) return;
    C.secuelaHecha = true;
    for (let k = 0; k < 1 + (C.poderes.franquicia || 0); k++) C.descartes.push(Object.assign(dcCarta(c.id, c.asc), { mitad: true }));
    C.log.push(tr('Secuela: {carta} 2 al descarte', { carta: dcNombre(c) }));
  },
  estados(C) { return [{ cls: 'dc-est-fijo', icono: 'refuerzo', texto: tr('Secuela'), n: C.secuelaHecha ? 0 : 1, explica: tr(DC_FACCIONES.pop.texto), turno: true }]; } };
DC_LIDERES.directora = { nombre: 'LaDirectora', faccion: 'pop', arte: 'directora', hp: 74,
  jugada: { nombre: '¡Acción!', carga: 6, fuerzaTurno: 4, roba: 1, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: los empleados de este turno pegan +{fuerzaTurno} y robas {roba}.' } };
DC_PODER_ICONO.franquicia = 'refuerzo';
Object.assign(DC_BIB_FACCIONES, { pop: 'Cultura Pop' });
