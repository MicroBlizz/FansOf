// Fans of Pop · RAID, la semana (dominio puro, tarea 448): la raid dura de lunes a domingo en hora de España (Europe/Madrid), como el ranking
// de combos (ADR 234), y su id es la fecha de su lunes 'AAAA-MM-DD'. Quien llama calcula el día de hoy en Madrid y lo pasa; aquí no hay
// reloj ni zonas horarias. El instante exacto del fin lo da el servidor (finMs); el dominio solo calcula lo que queda.
// `lunes` repite la lógica de PP_COMBOS_R.lunes (js/combo-reglas.js) porque los archivos de la raid se pueden cargar sin combo-reglas; el test comprueba que dan lo mismo.
'use strict';
const PP_RAID_SEMANA = (() => {
  const DIA = /^\d{4}-\d{2}-\d{2}$/;
  const diaValido = d => typeof d === 'string' && DIA.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z')) && new Date(d + 'T00:00:00Z').toISOString().startsWith(d);

  // el lunes de la semana de un día; `atras` semanas antes. null si el día no es válido.
  function lunes(dia, atras = 0) {
    if (!diaValido(dia)) return null;
    const d = new Date(dia + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - 7 * atras);
    return d.toISOString().slice(0, 10);
  }
  // el id de la semana de un día = su lunes
  const id = dia => lunes(dia);
  // ¿es la raid de esta semana? (el día cae en la semana de ese id)
  const esDeLaSemana = (idRaid, dia) => idRaid !== null && lunes(dia) === idRaid;
  // ms que quedan hasta el fin (que da el servidor); nunca negativo
  const queda = (finMs, ahoraMs) => Math.max(0, finMs - ahoraMs);
  return Object.freeze({ diaValido, lunes, id, esDeLaSemana, queda });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_SEMANA;
