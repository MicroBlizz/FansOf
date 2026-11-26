// Fans of Pop · EL RETO DEL DÍA, EL SERVIDOR (tarea 367, ADR 226; servidor/197-pop-reto-del-dia.sql). Por puertos, sin globales ni DOM:
// · sube(dia, rondas): tu mejor ronda de hoy (pop_reto_marca; el servidor se queda con la mayor) → { ok, puesto, total }.
// · ranking(dia): el ranking de ese día (pop_reto_ranking) → { ok, lista: [los 50 primeros], yo, total }.
// Puertos: rpc(nombre, args) (como CUENTA.rpc) y hay() (¿hay cuenta?). Los fallos son resultados con nombre: sin_cuenta, sin_red y
// no_vale (el servidor no la quiere: día fuera de plazo o marca imposible; no se reintenta).
'use strict';
const PP_RETO_SERVIDOR = Object.freeze({
  crea({ rpc, hay }) {
    const error = motivo => Object.freeze({ ok: false, error: motivo });
    const motivo = e => { const m = String(e && (e.message || e)); return /marca_imposible|dia_no_vale/.test(m) ? 'no_vale' : /sin_sesion/.test(m) ? 'sin_cuenta' : 'sin_red'; };
    async function sube(dia, rondas) {
      if (!hay()) return error('sin_cuenta');
      try {
        const d = (await rpc('pop_reto_marca', { p_dia: dia, p_rondas: rondas })) || {};
        return Object.freeze({ ok: true, puesto: d.puesto || 0, total: d.total || 0 });
      } catch (e) { return error(motivo(e)); }
    }
    async function ranking(dia) {
      if (!hay()) return error('sin_cuenta');
      try {
        const d = (await rpc('pop_reto_ranking', { p_dia: dia })) || {};
        return Object.freeze({ ok: true, lista: d.lista || [], yo: d.yo || null, total: d.total || 0 });
      } catch (e) { return error(motivo(e)); }
    }
    return Object.freeze({ sube, ranking });
  },
});
