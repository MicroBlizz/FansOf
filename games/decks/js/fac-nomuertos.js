// Fans Of Decks · Facción No-Muertos (líder NecroLord): su Despedida no se pierde. Pasiva Renacer: la primera carta con Despedida que juegas cada turno vuelve al descarte.
// Juegan con cartas que se van, que vuelven (Resucitar), que cobran por irse (Cementerio de empresa) y compañeros que se quedan en la mesa. Idea del diseño: la Despedida es su moneda.
'use strict';
Object.assign(CFG.units, { necrolord: { r: 18 }, skeleton: { r: 9 }, zombie: { r: 12 }, ghostmage: { r: 13 }, banshee: { r: 13 }, skullknight: { r: 18 }, stitchbrute: { r: 24 }, sombra: { r: 13 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  skeleton: { fac: 'nomuertos', nombre: 'SkeletonCrew', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'skeleton', fx: { dano: 5, veces: 4, despedida: true }, asc: { dano: 6 }, texto: 'Cuatro esqueletos piratas: {dano} de daño, {veces} veces.' },
  zombie: { fac: 'nomuertos', nombre: 'CrunchZombie', tipo: 'empleado', rar: 'basic', coste: 2, arte: 'zombie', fx: { dano: 12, bloqueo: 10 }, asc: { dano: 16, bloqueo: 12 }, texto: 'Un programador zombi, lento pero duro: {dano} de daño y {bloqueo} de bloqueo.' },
  ataud: { fac: 'nomuertos', nombre: 'Ataúd con ruedas', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'AT', mini: 'almohada', fx: { bloqueo: 12 }, asc: { bloqueo: 17 }, texto: 'Te metes en el ataúd de la sala de descanso: {bloqueo} de bloqueo.' },
  sp_lapidas: { fac: 'nomuertos', nombre: 'Lluvia de lápidas', tipo: 'tarea', rar: 'common', coste: 2, arte: 'sp_lapidas', fx: { dano: 11, obj: 'todos', debil: 1 }, asc: { dano: 13 }, texto: 'Caen lápidas del techo: {dano} de daño a todos los rivales y Débil {debil}.' },
  requiem: { fac: 'nomuertos', nombre: 'Cántico de ultratumba', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'CU', mini: 'lag', fx: { roba: 1, fuerzaTurno: 1 }, asc: { fuerzaTurno: 2 }, texto: 'Gratis: roba {roba} y los empleados de este turno pegan +{fuerzaTurno}.' },
  // ---------- pool ----------
  ghostmage: { fac: 'nomuertos', nombre: 'GhostMage', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'ghostmage', fx: { dano: 16, debil: 1 }, asc: { dano: 18 }, texto: 'Escarcha desde lejos: {dano} de daño y Débil {debil}.' },
  banshee: { fac: 'nomuertos', nombre: 'Banshee', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'banshee', fx: { dano: 7, obj: 'todos', vulnerable: 1 }, asc: { dano: 11 }, texto: 'Su grito se oye en toda la oficina: {dano} de daño a todos los rivales y Vulnerable {vulnerable}.' },
  skullknight: { fac: 'nomuertos', nombre: 'SkullKnight', tipo: 'empleado', rar: 'rare', coste: 2, arte: 'skullknight', fx: { dano: 11, bloqueo: 11, debil: 1 }, asc: { dano: 13, bloqueo: 13 }, texto: 'Espada de hielo y armadura de oficina: {dano} de daño, Débil {debil} y {bloqueo} de bloqueo.' },
  stitchbrute: { fac: 'nomuertos', nombre: 'StitchBrute', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'stitchbrute', fx: { bloqueo: 18, dano: 24, despedida: true }, asc: { bloqueo: 23, dano: 30 }, texto: 'Una mole cosida a trozos: {bloqueo} de bloqueo y {dano} de daño.' },
  sombra: { fac: 'nomuertos', nombre: 'Sombra', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'sombra', fx: { dano: 19, perfora: true }, asc: { dano: 24 }, texto: 'Una sombra sin cara que se cuela por debajo de la puerta: {dano} de daño.' },
  sp_formol: { fac: 'nomuertos', nombre: 'Poción de formol', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_formol', fx: { cura: 11, bloqueo: 10 }, asc: { cura: 13, bloqueo: 12 }, texto: 'Te conservas como nuevo: te cura {cura} y {bloqueo} de bloqueo.' },
  sp_crunch: { fac: 'nomuertos', nombre: 'Crunch', tipo: 'tarea', rar: 'epic', coste: 0, arte: 'sp_crunch', fx: { fuerzaTurno: 4, pierde: 4 }, asc: { pierde: 2 }, texto: 'Semana de crunch: los empleados de este turno pegan +{fuerzaTurno}, pero pierdes {pierde} de vida.' },
  sp_eternas: { fac: 'nomuertos', nombre: 'Horas extra eternas', tipo: 'tarea', rar: 'legendary', coste: 2, arte: 'sp_eternas', fx: { debil: 3, vulnerable: 3, obj: 'todos' }, asc: { coste: 1 }, texto: 'Todos los rivales se arrastran como zombis: Débil {debil} y Vulnerable {vulnerable}.' },
  cementerio: { fac: 'nomuertos', nombre: 'Cementerio de empresa', tipo: 'directiva', rar: 'rare', coste: 1, ic: 'CM', mini: 'pase_caducado', fx: { poder: 'cementerio', n: 2 }, asc: { n: 3 }, texto: 'Cementerio: cada vez que juegas una carta con Despedida, ganas {n} de bloqueo.' },
  resucitar: { fac: 'nomuertos', nombre: 'Vuelta del más allá', tipo: 'tramite', rar: 'rare', coste: 1, ic: 'VA', mini: 'cafeina', fx: { resucita: true }, asc: { coste: 0 }, texto: 'La última carta que se despidió vuelve a tu mano.' },
  comp_esqueleto: { fac: 'nomuertos', nombre: 'Esqueleto de guardia', tipo: 'companero', rar: 'common', coste: 1, arte: 'skeleton', fx: { companero: true, turnos: 2, dano: 7 }, asc: { dano: 11 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
  comp_fantasma: { fac: 'nomuertos', nombre: 'Fantasma del becario', tipo: 'companero', rar: 'rare', coste: 2, arte: 'banshee', fx: { companero: true, turnos: 3, dano: 4, bloqueo: 6 }, asc: { dano: 5, bloqueo: 7 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida y te da {bloqueo} de bloqueo.' },
});
DC_MAZOS.necrolord = ['skeleton', 'skeleton', 'skeleton', 'skeleton', 'zombie', 'zombie', 'ataud', 'ataud', 'sp_lapidas', 'requiem'];
DC_FACCIONES.nomuertos = { nombre: 'No-Muertos', pasiva: 'Renacer', renacer: 1, texto: 'No-Muertos: la primera carta con Despedida que juegas cada turno no se va: vuelve a tu descarte, como si nada.' };
DC_LIDERES.necrolord = { nombre: 'NecroLord', faccion: 'nomuertos', arte: 'necrolord', hp: 70,
  jugada: { nombre: 'Levantar a los caídos', carga: 6, invoca: 'comp_esqueleto', n: 2, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: levanta {n} esqueletos que te guardan 2 turnos.' } };
DC_PODER_ICONO.cementerio = 'cura';
Object.assign(DC_BIB_FACCIONES, { nomuertos: 'No-Muertos' });
