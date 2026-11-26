// Fans of Pop · LOS COMBOS, EL SERVIDOR (tarea 396, ADR 234; servidor/200-pop-combos-semana.sql). Por puertos, sin globales ni DOM:
// · sube(lunes, puntos): tus puntos de combo de esa semana (pop_combo_marca; el servidor se queda con los mayores) → { ok, puesto, total }.
// · ranking(lunes): el ranking de esa semana (pop_combo_ranking) → { ok, lista: [los 50 primeros], yo, total }.
// Puertos: rpc(nombre, args) (como CUENTA.rpc) y hay() (¿hay cuenta?). Los fallos son resultados con nombre: sin_cuenta, sin_red y
// no_vale (el servidor no la quiere: semana fuera de plazo o puntos imposibles; no se reintenta).
'use strict';
const PP_COMBO_SERVIDOR = Object.freeze({
  crea({ rpc, hay }) {
    const error = motivo => Object.freeze({ ok: false, error: motivo });
    const motivo = e => { const m = String(e && (e.message || e)); return /puntos_imposibles|semana_no_vale/.test(m) ? 'no_vale' : /sin_sesion/.test(m) ? 'sin_cuenta' : 'sin_red'; };
    async function sube(lunes, puntos) {
      if (!hay()) return error('sin_cuenta');
      try {
        const d = (await rpc('pop_combo_marca', { p_lunes: lunes, p_puntos: puntos })) || {};
        return Object.freeze({ ok: true, puesto: d.puesto || 0, total: d.total || 0 });
      } catch (e) { return error(motivo(e)); }
    }
    async function ranking(lunes) {
      if (!hay()) return error('sin_cuenta');
      try {
        const d = (await rpc('pop_combo_ranking', { p_lunes: lunes })) || {};
        return Object.freeze({ ok: true, lista: d.lista || [], yo: d.yo || null, total: d.total || 0 });
      } catch (e) { return error(motivo(e)); }
    }
    return Object.freeze({ sube, ranking });
  },
});
