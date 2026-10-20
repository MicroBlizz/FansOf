// Fans Of Decks · Facción Ciberpunks (líder CyberMarine): control con bloqueo, Blindaje y hackeo (Débil, aturdir). Pasiva Escudos: cada turno empiezas con un escudo de plasma
// (3 de bloqueo; 8 si el turno anterior no te pegaron). Francotirador que perfora y drones que caen del cielo. Los ganchos (alTurno, estados) los llama combate.js a través de dcGancho.
'use strict';
Object.assign(CFG.units, { cybermarine: { r: 19 }, nanobot: { r: 8 }, cyberninja: { r: 12 }, techdroid: { r: 13 }, hackerkid: { r: 11 }, neonsniper: { r: 12 }, siegemech: { r: 22 }, dron: { r: 12 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  nanobot: { fac: 'ciber', nombre: 'NanoBots', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'nanobot', fx: { dano: 2, veces: 4 }, asc: { dano: 3 }, texto: 'Cuatro robots diminutos rodean al rival: {dano} de daño, {veces} veces.' },
  techdroid: { fac: 'ciber', nombre: 'TechDroid', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'techdroid', fx: { bloqueo: 4, cura: 2 }, asc: { bloqueo: 6, cura: 3 }, texto: 'Soporte técnico a domicilio: {bloqueo} de bloqueo y te cura {cura}.' },
  cyberninja: { fac: 'ciber', nombre: 'CyberNinja', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'cyberninja', fx: { dano: 7 }, asc: { dano: 9 }, texto: 'Se teletransporta con la katana de neón: {dano} de daño.' },
  parche: { fac: 'ciber', nombre: 'Parche de seguridad', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'PS', mini: 'plasma', fx: { bloqueo: 6 }, asc: { bloqueo: 9 }, texto: 'Un parche urgente de viernes por la tarde: {bloqueo} de bloqueo.' },
  sp_nanobots: { fac: 'ciber', nombre: 'Parche de nanobots', tipo: 'tarea', rar: 'basic', coste: 1, arte: 'sp_nanobots', fx: { cura: 4, bloqueo: 5 }, asc: { cura: 6, bloqueo: 8 }, texto: 'Nanobots que reparan: te curan {cura} y {bloqueo} de bloqueo.' },
  escaneo: { fac: 'ciber', nombre: 'Escaneo de puertos', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'EP', mini: 'ping', fx: { debil: 1, roba: 1 }, asc: { debil: 2 }, texto: 'Gratis: el rival con Débil {debil} y robas {roba}.' },
  // ---------- pool ----------
  hackerkid: { fac: 'ciber', nombre: 'HackerKid', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'hackerkid', fx: { dano: 4, aturde: 1, debil: 1 }, asc: { dano: 6 }, texto: 'Hackea al rival: {dano} de daño, Débil {debil} y pierde su próximo turno.' },
  neonsniper: { fac: 'ciber', nombre: 'NeonSniper', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'neonsniper', fx: { dano: 13, perfora: true }, asc: { dano: 17 }, texto: 'Un solo disparo desde el edificio de enfrente: {dano} de daño que se salta el bloqueo.' },
  siegemech: { fac: 'ciber', nombre: 'SiegeMech', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'siegemech', fx: { dano: 10, obj: 'todos', bloqueo: 9 }, asc: { dano: 13, bloqueo: 12 }, texto: 'Artillería de asedio: {dano} de daño a todos los rivales y {bloqueo} de bloqueo.' },
  dron: { fac: 'ciber', nombre: 'DronCazador', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'dron', fx: { dano: 9, perfora: true, vulnerable: 1 }, asc: { dano: 12 }, texto: 'Cae del techo: {dano} de daño que se salta el bloqueo y deja Vulnerable {vulnerable}.' },
  firewall: { fac: 'ciber', nombre: 'Firewall', tipo: 'empleado', rar: 'common', coste: 2, ic: 'FW', mini: 'casco_moto', fx: { bloqueo: 10, blindaje: 1 }, asc: { bloqueo: 14, blindaje: 2 }, texto: 'El cortafuegos del departamento: {bloqueo} de bloqueo y Blindaje {blindaje}.' },
  sp_orbital: { fac: 'ciber', nombre: 'Ataque orbital', tipo: 'tarea', rar: 'epic', coste: 3, arte: 'sp_orbital', fx: { dano: 16, obj: 'todos' }, asc: { dano: 21 }, texto: 'Un satélite marca la sala y, un turno después de pensarlo, dispara: {dano} de daño a todos los rivales.' },
  sp_update: { fac: 'ciber', nombre: 'Actualización obligatoria', tipo: 'tarea', rar: 'legendary', coste: 1, arte: 'sp_update', fx: { aturde: 1, debil: 2, obj: 'todos' }, asc: { coste: 0 }, texto: 'Instalando la actualización 1 de 47: todos los rivales pierden su próximo turno y quedan con Débil {debil}.' },
  inyeccion: { fac: 'ciber', nombre: 'Inyección SQL', tipo: 'tarea', rar: 'common', coste: 1, ic: 'SQ', mini: 'bullet', fx: { dano: 5, debil: 1 }, asc: { dano: 8 }, texto: '{dano} de daño y Débil {debil}: borra la agenda del rival.' },
  cortafuegos: { fac: 'ciber', nombre: 'Cortafuegos corporativo', tipo: 'directiva', rar: 'rare', coste: 2, ic: 'CC', mini: 'mazo_hotfix', fx: { poder: 'cortafuegos', n: 4 }, asc: { n: 6 }, texto: 'Cortafuegos: al empezar cada turno, {n} de bloqueo más.' },
  overclock: { fac: 'ciber', nombre: 'Overclock', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'OC', mini: 'speedrun', fx: { bloqueo: 5, blindaje: 2, roba: 1 }, asc: { bloqueo: 7 }, texto: '{bloqueo} de bloqueo, Blindaje {blindaje} y robas {roba}.' },
  comp_dron: { fac: 'ciber', nombre: 'Dron de apoyo', tipo: 'companero', rar: 'common', coste: 1, arte: 'dron', fx: { companero: true, turnos: 2, dano: 4 }, asc: { dano: 6 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
  comp_marine: { fac: 'ciber', nombre: 'Escolta de plasma', tipo: 'companero', rar: 'rare', coste: 2, arte: 'cybermarine', fx: { companero: true, turnos: 3, dano: 2, bloqueo: 5 }, asc: { dano: 3, bloqueo: 7 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida y te da {bloqueo} de bloqueo.' },
});
DC_MAZOS.cybermarine = ['nanobot', 'nanobot', 'techdroid', 'techdroid', 'cyberninja', 'parche', 'parche', 'sp_nanobots', 'escaneo', 'cyberninja'];
DC_FACCIONES.ciber = { nombre: 'Ciberpunks', pasiva: 'Escudos', escudo: 3, escudoLleno: 8, texto: 'Ciberpunks: empiezas cada turno con un escudo de plasma de 3 de bloqueo; si el turno anterior no te pegaron, es de 8.',
  alTurno(C) {
    const F = DC_FACCIONES.ciber, n = C.turno === 1 || !C.golpeado ? F.escudoLleno : F.escudo;
    C.bloqueo += n; C.golpeado = false; C.eventos.push({ t: 'bloqueo', r: -1, n });
    if (C.poderes.cortafuegos) { C.bloqueo += C.poderes.cortafuegos; C.eventos.push({ t: 'bloqueo', r: -1, n: C.poderes.cortafuegos }); }
  },
  estados(C) { const F = DC_FACCIONES.ciber; return [{ cls: 'dc-est-fijo', icono: 'defensa', texto: tr(F.pasiva), n: C.golpeado ? F.escudo : F.escudoLleno, explica: tr(F.texto) }]; } };
DC_LIDERES.cybermarine = { nombre: 'CyberMarine', faccion: 'ciber', arte: 'cybermarine', hp: 72,
  jugada: { nombre: 'Orbital Drop', carga: 6, invoca: 'comp_dron', n: 2, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: le caen del cielo {n} drones que te guardan 2 turnos.' } };
DC_PODER_ICONO.cortafuegos = 'defensa';
Object.assign(DC_BIB_FACCIONES, { ciber: 'Ciberpunks' });
