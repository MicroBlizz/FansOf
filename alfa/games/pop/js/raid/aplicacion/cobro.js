// Fans of Pop · RAID, el cobro del premio (aplicación, tarea 448, nodo n6, ADR 243): junta la red de la raid con la partida del móvil para
// cobrar UNA vez el premio de una raid acabada. Las perlas y el marco los da el servidor (pop_raid_cobrar, servidor/205-pop-raid.sql, que no
// paga dos veces); las MONEDAS viven en el móvil y las suma él, apuntando la raid por su firma para no sumarlas dos veces.
// Sin globales, DOM ni reloj: todo entra por puertos. crea({ red (PP_RAID_RED), cuenta(firma) (la libreta de esa raid en la partida: se le
// apunta `cobrado`), cobrada(firma) (¿lo tiene ya apuntado?, sin crear nada), paga(monedas), guarda(), alCobrar(premio) (el servidor ha movido perlas o marco: toca pedirle el saldo) }).
// · mira(raid): ¿qué hay de esa raid? { que: 'pendiente', raid, firma } (acabada, con algo tuyo y sin cobrar en este móvil), 'jugando' (aún no
//   ha acabado), 'nada' (no existe, no jugaste o ya está cobrada aquí) o 'fallo' (sin red o sin cuenta: se puede volver a mirar).
// · cobra(raid, firma): { ok: true, premio, repetido } (repetido = este móvil ya la tenía cobrada: no suma nada) o { ok: false, error, fin }
//   (fin = no tiene arreglo: nada que cobrar, plazo pasado o la raid ya no existe; queda apuntada para no insistir).
// Si el servidor dice que ya estaba cobrada pero este móvil no lo tiene apuntado (se cortó la respuesta, o se cobró en otro móvil), las monedas
// se suman aquí: son de cada móvil, y perder el premio por un corte de red sería peor.
'use strict';
const PP_RAID_COBRO = (() => {
  const SIN_ARREGLO = Object.freeze(['nada_que_cobrar', 'cobro_caducado', 'raid_no_existe']);
  const entero = n => (Number.isInteger(n) && n > 0 ? n : 0);
  const limpio = p => Object.freeze({ nivel: entero(p && p.nivel), monedasBase: entero(p && p.monedasBase), extra: entero(p && p.extra), monedas: entero(p && p.monedas), perlas: entero(p && p.perlas), marco: !!(p && p.marco) });

  function crea({ red, cuenta, cobrada, paga, guarda, alCobrar = () => {} }) {
    const enCurso = new Map();   // una sola llamada a la vez por raid: dos pulsaciones no cobran dos veces
    async function mira(raid) {
      const r = await red.estado(raid, [], []);
      if (!r.ok) return Object.freeze({ que: r.error === 'raid_no_existe' ? 'nada' : 'fallo', error: r.error });
      const s = r.datos, firma = s.id + ':' + s.inicio;
      if (!PP_RAID_PREMIOS.porCobrar(s)) return Object.freeze({ que: s.acabada || s.vaciada ? 'nada' : 'jugando' });
      return Object.freeze(cobrada(firma) ? { que: 'nada' } : { que: 'pendiente', raid: s.id, firma });
    }
    async function pide(raid, firma) {
      const r = await red.cobrar(raid);
      const c = cuenta(firma);
      if (!r.ok) {
        const fin = SIN_ARREGLO.includes(r.error);
        if (fin && !c.cobrado) { c.cobrado = true; guarda(); }
        return Object.freeze({ ok: false, error: r.error, fin });
      }
      const premio = limpio(r.datos.premio);
      if (c.cobrado) return Object.freeze({ ok: true, premio, repetido: true });
      c.cobrado = true;
      paga(premio.monedas);
      guarda();
      alCobrar(premio);
      return Object.freeze({ ok: true, premio, repetido: false });
    }
    function cobra(raid, firma) {
      if (!enCurso.has(firma)) enCurso.set(firma, pide(raid, firma).finally(() => enCurso.delete(firma)));
      return enCurso.get(firma);
    }
    return Object.freeze({ mira, cobra });
  }
  return Object.freeze({ crea });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_COBRO;
