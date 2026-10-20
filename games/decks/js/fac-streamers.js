// Fans Of Decks · Facción Streamers (líder StreamKing): muchas cartas baratas y encadenarlas. Pasiva Hype: cada 3 cartas que juegas en un turno, el chat se anima y robas 1.
// Aturdir con ViralBot, curar con SnackMom y cartas que cuentan como más de una para el Hype (fx.hype). Los ganchos (alTurno, alJugar, estados) los llama combate.js con dcGancho.
'use strict';
Object.assign(CFG.units, { twitchking: { r: 19 }, subswarm: { r: 9 }, hypebeast: { r: 12 }, viralbot: { r: 13 }, snackmom: { r: 13 }, hypetrain: { r: 18 }, banhammer: { r: 21 }, hater: { r: 13 } });
Object.assign(DC_CARTAS, {
  // ---------- mazo inicial ----------
  subswarm: { fac: 'streamers', nombre: 'SubSwarm', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'subswarm', fx: { dano: 2, veces: 3 }, asc: { dano: 3 }, texto: 'Tres suscriptores muy entregados: {dano} de daño, {veces} veces.' },
  hypebeast: { fac: 'streamers', nombre: 'HypeBeast', tipo: 'empleado', rar: 'basic', coste: 0, arte: 'hypebeast', fx: { dano: 2 }, asc: { dano: 4 }, texto: 'Gratis: va tan rápido que casi no se le ve. {dano} de daño.' },
  snackmom: { fac: 'streamers', nombre: 'SnackMom', tipo: 'empleado', rar: 'basic', coste: 1, arte: 'snackmom', fx: { cura: 3, bloqueo: 3 }, asc: { cura: 6, bloqueo: 5 }, texto: 'Bocadillos para todos: te cura {cura} y {bloqueo} de bloqueo.' },
  tema: { fac: 'streamers', nombre: 'Tema de entrada', tipo: 'tramite', rar: 'basic', coste: 1, ic: 'TE', mini: 'auriculares', fx: { bloqueo: 5 }, asc: { bloqueo: 8 }, texto: 'Sales con tu música: {bloqueo} de bloqueo.' },
  saludo: { fac: 'streamers', nombre: 'Saludo al chat', tipo: 'tramite', rar: 'basic', coste: 0, ic: 'SC', mini: 'emotes', fx: { roba: 1 }, asc: { roba: 2 }, texto: 'Gratis: «¡Hola, chat!» Robas {roba}.' },
  sp_donaciones: { fac: 'streamers', nombre: 'Lluvia de donaciones', tipo: 'tarea', rar: 'basic', coste: 2, arte: 'sp_donaciones', fx: { dano: 3, obj: 'todos', caos: 1 }, asc: { dano: 5 }, texto: 'Caen monedas de los fans: {dano} de daño a todos los rivales y +{caos} CAOS.' },
  // ---------- pool ----------
  viralbot: { fac: 'streamers', nombre: 'ViralBot', tipo: 'empleado', rar: 'rare', coste: 1, arte: 'viralbot', fx: { dano: 3, aturde: 1 }, asc: { dano: 5 }, texto: 'Graba un clip del rival: {dano} de daño y pierde su próximo turno viéndose.' },
  hypetrain: { fac: 'streamers', nombre: 'HypeTrain', tipo: 'empleado', rar: 'epic', coste: 3, arte: 'hypetrain', fx: { dano: 11, hype: 1 }, asc: { dano: 15 }, texto: 'Nadie lo para: {dano} de daño y cuenta como dos cartas para el Hype.' },
  moderador: { fac: 'streamers', nombre: 'BanHammer', tipo: 'empleado', rar: 'epic', coste: 2, arte: 'banhammer', fx: { dano: 5, obj: 'todos', debil: 1 }, asc: { dano: 8 }, texto: 'Martillazo del moderador: {dano} de daño a todos los rivales y Débil {debil}.' },
  hater: { fac: 'streamers', nombre: 'Hater', tipo: 'empleado', rar: 'rare', coste: 1, arte: 'hater', fx: { dano: 7, cond: 'noMax' }, asc: { dano: 9 }, texto: '«ESTO ES MALÍSIMO»: {dano} de daño; el doble si el rival no es el que más vida tiene.' },
  mama: { fac: 'streamers', nombre: 'Bocadillo de la madre', tipo: 'tramite', rar: 'common', coste: 1, ic: 'BM', mini: 'baguette', fx: { cura: 5, roba: 1 }, asc: { cura: 9 }, texto: 'Te trae la merienda al directo: te cura {cura} y robas {roba}.' },
  sp_merienda: { fac: 'streamers', nombre: 'Pausa para merendar', tipo: 'tarea', rar: 'common', coste: 1, arte: 'sp_merienda', fx: { cura: 6, bloqueo: 3 }, asc: { cura: 11, bloqueo: 6 }, texto: 'Un descanso en pleno directo: te cura {cura} y {bloqueo} de bloqueo.' },
  sp_baneo: { fac: 'streamers', nombre: 'Ban temporal', tipo: 'tarea', rar: 'legendary', coste: 2, arte: 'sp_baneo', fx: { dano: 6, aturde: 1, obj: 'todos' }, asc: { coste: 1 }, texto: 'El moderador banea a todos: {dano} de daño a cada rival y pierden su próximo turno.' },
  clip: { fac: 'streamers', nombre: 'Clip viral', tipo: 'tarea', rar: 'common', coste: 0, ic: 'CV', mini: 'lanzaconfeti', fx: { dano: 3, hype: 1 }, asc: { dano: 5 }, texto: 'Gratis: {dano} de daño y cuenta como dos cartas para el Hype.' },
  directo: { fac: 'streamers', nombre: 'Directo de madrugada', tipo: 'tramite', rar: 'epic', coste: 1, ic: 'DM', mini: 'dlc', fx: { caos: 2, roba: 2, despedida: true }, asc: { roba: 3 }, texto: 'El chat no se va a dormir: +{caos} CAOS y robas {roba}.' },
  patrocinio: { fac: 'streamers', nombre: 'Patrocinador oficial', tipo: 'directiva', rar: 'rare', coste: 2, ic: 'PO', mini: 'zanahoria_oro', fx: { poder: 'patrocinio', n: 1 }, asc: { coste: 1 }, texto: 'Patrocinio: al empezar cada turno, +{n} CAOS.' },
  comp_sub: { fac: 'streamers', nombre: 'Suscriptor fiel', tipo: 'companero', rar: 'common', coste: 1, arte: 'subswarm', fx: { companero: true, turnos: 3, dano: 2 }, asc: { dano: 4 }, texto: 'Se queda {turnos} turnos: al acabar cada uno pega {dano} al rival con menos vida.' },
  comp_mama: { fac: 'streamers', nombre: 'La madre con la nevera', tipo: 'companero', rar: 'rare', coste: 2, arte: 'snackmom', fx: { companero: true, turnos: 3, cura: 3, bloqueo: 3 }, asc: { cura: 4, bloqueo: 4 }, texto: 'Se queda {turnos} turnos: al acabar cada uno te cura {cura} y te da {bloqueo} de bloqueo.' },
});
DC_MAZOS.twitchking = ['subswarm', 'subswarm', 'hypebeast', 'hypebeast', 'snackmom', 'tema', 'tema', 'saludo', 'saludo', 'sp_donaciones'];
DC_FACCIONES.streamers = { nombre: 'Streamers', pasiva: 'Hype', hype: 3, texto: 'Streamers: cada 3 cartas que juegas en un turno, el chat se anima y robas 1.',
  alTurno(C) { C.hypeCuenta = 0; if (C.poderes.patrocinio) { C.caos += C.poderes.patrocinio; C.log.push(tr('El patrocinador te da {n} CAOS', { n: C.poderes.patrocinio })); } },
  alJugar(C, c, D, fx) {
    const antes = Math.floor((C.hypeCuenta || 0) / 3); C.hypeCuenta = (C.hypeCuenta || 0) + 1 + (fx.hype || 0);
    const n = Math.floor(C.hypeCuenta / 3) - antes; if (n > 0) { dcRoba(C, n); C.log.push(tr('¡El chat se anima! Robas {n}', { n })); }
  },
  estados(C) { return [{ cls: 'dc-est-turno', icono: 'refuerzo', texto: tr('Hype'), n: (C.hypeCuenta || 0) % 3 + '/3', explica: tr(DC_FACCIONES.streamers.texto), turno: true }]; } };
DC_LIDERES.twitchking = { nombre: 'StreamKing', faccion: 'streamers', arte: 'twitchking', hp: 70,
  jugada: { nombre: 'En directo', carga: 6, caos: 3, roba: 1, texto: 'Gratis cuando has gastado {carga} de CAOS en cartas: +{caos} CAOS ahora y robas {roba}. El chat lo agradece.' } };
DC_PODER_ICONO.patrocinio = 'fuerza';
DC_BIB_PROPIEDADES.hype = 'Cuenta doble para el Hype';
Object.assign(DC_BIB_FACCIONES, { streamers: 'Streamers' });
