// Fans Of · core · CUENTA_ELECCION (dominio, sin reloj, azar, almacenamiento ni DOM): las reglas de la ventana «¿QUÉ PARTIDA QUIERES?»
// de cuenta.js. Compara dos partidas (huella: cuenta TODO menos la hora de la última visita), arma las filas del resumen y decide qué hacer
// con una partida de la nube que choca con la de aquí, recordando lo que la persona ya eligió (tarea 408, ADR 239: tras elegir, no se
// vuelve a preguntar por esa misma partida de la nube; si la nube cambia, sí).
//   CUENTA_ELECCION.iguales(a, b)              true si son la misma partida (no hace falta preguntar)
//   CUENTA_ELECCION.diferencias(a, b)          cuántos apartados de la partida difieren
//   CUENTA_ELECCION.filas(aqui, alla)          [[texto, aquí, nube]] de dos resúmenes [[texto, número]], solo las que difieren
//   CUENTA_ELECCION.paso(eleccion, version)    'preguntar' | 'subir' (ya eligió la de aquí: se sube sin preguntar) | 'nada' (ya eligió la nube)
//   CUENTA_ELECCION.elige(cual, version)       la elección que se recuerda: { cual: 'nube' | 'aqui', version }
//   CUENTA_ELECCION.resumenComun(s)            las filas del resumen de los juegos completos (quien no define resumenPartida)
'use strict';
const CUENTA_ELECCION = (() => {
  const canon = v => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => (v[k] === undefined ? o : (o[k] = canon(v[k]), o), o), {}) : v);
  // null si no se puede pasar a texto (con un ciclo): esa partida no es igual a nada, así se pregunta y nunca se da por igual sin serlo
  const huella = s => { try { const t = JSON.stringify(canon(s)); let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h + ':' + t.length; } catch (e) { return null; } };
  const distintas = (a, b) => { const ha = huella(a); return ha === null || ha !== huella(b); };
  // idle.last es la hora de la última visita: cambia en cada apertura y no es progreso, así que no cuenta
  const sinHora = s => (s && s.idle && typeof s.idle === 'object' ? Object.assign({}, s, { idle: Object.assign({}, s.idle, { last: undefined }) }) : s);
  const iguales = (a, b) => !distintas(sinHora(a), sinHora(b));
  function diferencias(a, b) {
    const A = sinHora(a) || {}, B = sinHora(b) || {};
    return Object.keys(Object.assign({}, A, B)).filter(k => distintas(A[k], B[k])).length;
  }
  const filas = (aqui, alla) => aqui.map((f, i) => [f[0], f[1], alla[i] ? alla[i][1] : 0]).filter(f => f[1] !== f[2]);
  // solo la MISMA versión: una más nueva es que el otro aparato ha seguido jugando; una más vieja, que la fila de la nube es otra (cuenta reseteada)
  function paso(eleccion, version) {
    if (!eleccion || version !== eleccion.version) return 'preguntar';
    return eleccion.cual === 'aqui' ? 'subir' : 'nada';
  }
  const elige = (cual, version) => Object.freeze({ cual: cual === 'aqui' ? 'aqui' : 'nube', version: +version || 0 });
  // las filas de los juegos completos (Rumble, TD, …), para quien no define resumenPartida(s): [[texto en español, número], …]
  const suma = (o, f) => Object.keys(o || {}).reduce((a, k) => a + (f ? f(o[k]) : +o[k]) || a, 0);
  const num = v => (typeof v === 'number' && isFinite(v) ? v : 0), cuenta = o => Object.keys(o || {}).length;
  const lista = v => (Array.isArray(v) ? v : []);
  const resumenComun = s => [
    ['Oro', num(s.gold)], ['Gemas', num(s.gems)],
    ['Nivel de las cartas (suma)', suma(s.units, u => num(u && u.lvl))], ['XP de las cartas', suma(s.units, u => num(u && u.xp))],
    ['Cartas conseguidas', cuenta(s.cards)], ['Estrellas de las cartas', suma(s.cards, c => num(c && c.st))],
    ['Habilidades y objetos', lista(s.inv).length], ['Con contrato indefinido', lista(s.inv).filter(i => i && i.lock).length],
    ['Equipados', cuenta(s.abEquip) + suma(s.equip, e => cuenta(e))], ['Mazos', cuenta(s.decks)], ['Tickets', num(s.tickets)], ['Facciones desbloqueadas', lista(s.unlocked).length], ['Estrellas de los niveles', suma(s.stars, num)],
    ['Niveles de campaña pasados', cuenta(s.camp)], ['XP del pase', num(s.pass && s.pass.xp)], ['Logros', lista(s.achDone).length],
  ];
  return Object.freeze({ iguales, diferencias, filas, paso, elige, resumenComun });
})();
