// Fans of Rumble · RETOS: logros nuevos de la 0.9.112 (PvP, CEO, misiones fijas, Mítica semanal, sanadores y armario).
// Van aparte porque retos-logros.js ya está lleno: se suman a los de siempre envolviendo RETOS.logros, y añaden la pestaña PvP.
// Lo que cuentan: pvpwin y pvpcomeback (19e-pvp-pantallas.js), frase (22-frases.js), ceowin, ceoflaw y ceocarton (09b-recompensas-y-hud.js),
// meta5 y meta7 (las misiones fijas, retos.js), towerheal (06f-sanadores.js). El resto se mira en la partida guardada.
'use strict';
RETOS.categorias = [['all', 'Todos'], ['b', 'Batallas'], ['f', 'Facciones'], ['c', 'Cartas'], ['k', 'Campaña'], ['e', 'Enemigos'], ['g', 'Gashapón'], ['d', 'Constancia'], ['p', 'PvP'], ['s', 'Secretos']];
const LOGROS_ANTES = RETOS.logros;
const PVP_LIGAS = [[1050, 'Junior'], [1150, 'Senior'], [1300, 'Director'], [1500, 'CEO']];   // las de ARENA.leagues (19-arena.js), que se carga después
// marcos y títulos que se pueden ganar (los de serie no cuentan)
const armGanables = () => { const A = RETOS.armario || {}; return ['marcos', 'titulos'].reduce((a, t) => a + Object.keys(A[t] || {}).filter(id => !A[t][id].serie).length, 0); };
const armTengo = () => { const A = RETOS.armario || {}, L = typeof lookDe === 'function' ? lookDe() : {}; return ['marcos', 'titulos'].reduce((a, t) => a + (L[t] || []).filter(id => A[t] && A[t][id] && !A[t][id].serie).length, 0); };
RETOS.logros = (famComun, veces) => {
  LOGROS_ANTES(famComun, veces);
  const fam = (id, cat, src, goals, gems, name, txt, joke, hint) => famComun(id, cat, src, goals, gems, name, txt, joke, hint);
  // -- PvP
  fam('pvpw', 'p', 'pvpwin', [1, 5, 25, 50, 100, 250], [15, 15, 25, 35, 50, 80], 'Cara a cara', g => veces(g, 'Gana una partida PvP.', 'Gana {n} partidas PvP.'), 'Esta vez el rival no era un robot.');
  fam('pvpliga', 'p', () => Math.max(0, ...Object.values(SAVE.pvp || {}).map(m => Math.max(m.best || 0, m.copas || 0))), PVP_LIGAS.map(l => l[0]), [15, 25, 40, 80],
    'Trepa corporativo', g => `Llega a la liga ${PVP_LIGAS.find(l => l[0] === g)[1]} en el PvP.`, 'Ascenso por méritos. Por fin.');
  fam('pvpchat', 'p', 'frase', [10, 50, 200], [5, 10, 20], 'Relaciones públicas', g => `Usa ${fmt(g)} frases o emoticonos en el chat.`, 'Comunicación corporativa de primer nivel.');
  // -- lo nuevo de estas semanas
  fam('ceow', 'b', 'ceowin', [1, 5, 10, 25, 50, 100], [15, 15, 20, 30, 45, 70], 'Despacho del CEO', g => veces(g, 'Gana una partida rápida en CEO.', 'Gana {n} partidas rápidas en CEO.'), 'Ahora el despacho es tuyo.');
  fam('towerh', 'b', 'towerheal', [500, 2000, 10000, 50000], [5, 15, 30, 60], 'Mantenimiento de edificios', g => `Tus sanadores curan ${fmt(g)} de vida a tus torres.`, 'Sin presupuesto, pero con tiritas.');
  fam('meta5', 'd', 'meta5', [1, 7, 30, 100, 365], [5, 10, 20, 40, 80], 'Empleado ejemplar', g => veces(g, 'Sé Empleado del día.', 'Sé Empleado del día {n} veces.'), 'Tu foto ya cuelga en la pared de la oficina.');
  fam('meta7', 'd', 'meta7', [1, 4, 12, 52], [15, 25, 40, 100], 'Empleado del año', g => veces(g, 'Completa «Empleado del mes».', 'Completa «Empleado del mes» {n} veces.'), 'Microblizz te sube el sueldo un 0,1 %.');
  const tot = armGanables(), metas = [3, 6, 10].filter(x => x < tot).concat(tot);
  fam('armario', 'd', armTengo, metas, [10, 15, 25, 60].slice(-metas.length), 'Fondo de armario', g => (g === tot ? 'Consigue todos los marcos y títulos.' : `Consigue ${g} marcos o títulos.`), 'Vestido para el éxito. Y para el despido.');
  fam('mitsem', 'k', () => Object.values(SAVE.mitHist || {}).filter(n => n > 0).length + (typeof mitSemana === 'function' && mitSemana() > 0 ? 1 : 0), [1, 4, 12, 26, 52], [10, 15, 30, 50, 100],
    'Habitual de la Mítica', g => veces(g, 'Consigue estrellas en la Mítica una semana.', 'Consigue estrellas en la Mítica {n} semanas distintas.'), 'La ruleta ya te saluda por tu nombre.');
  fam('mittop', 'k', () => Object.values(SAVE.mitPremio || {}).filter(p => p <= 10).length, [1, 5, 10], [30, 60, 100],
    'Top 10', g => veces(g, 'Acaba entre los 10 primeros de la Mítica semanal.', 'Acaba {n} semanas entre los 10 primeros de la Mítica semanal.'), 'Sales en la foto del Salón de la Fama.');
  // -- secretos nuevos
  for (const [id, src, gm, nm, txt, jk, hint] of [
    ['carton', 'ceocarton', 60, 'Contra todo pronóstico', 'Gana en CEO con el castigo «Torres de cartón».', 'Las torres eran de cartón. Tu estrategia, no.', 'Pista: gana al CEO con las torres más frágiles.'],
    ['ceoflaw', 'ceoflaw', 60, 'Ni un rasguño ejecutivo', 'Gana en CEO sin perder ninguna torre.', 'El CEO pide revisar las cámaras.', 'Pista: contra el CEO, sin un rasguño.'],
    ['pvpcb', 'pvpcomeback', 60, 'Te lo dije', 'Gana una partida PvP después de perder dos torres.', 'Tu rival ya estaba escribiendo «GG».', 'Pista: contra otra persona, nunca te rindas.'],
  ]) fam('s_' + id, 's', src, [1], [gm], nm, () => txt, jk, hint);
};
