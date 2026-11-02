// Fans of Nova · Galaxia de la comunidad con el servidor (fase 2, servidor/107-nova-galaxia-comun.sql): manda tus aportes y baja los
// totales de todos. El servidor solo suma; el mapa lo sigue calculando FRENTE.simula aquí, con los puntos de todos y el peso por pilotos.
// Sin cuenta, sin red o con el flag cerrado, todo sigue como en la fase 1 (simulado en el aparato). Diseño: docs/nova/galaxia-comunidad.md.
'use strict';
const NV_FRENTE_RED = { semanas: {}, enviando: false };
const nvFrenteEnRed = () => nvFrenteActivo() && typeof CUENTA !== 'undefined' && !!CUENTA.activa;

// Lo que dice el servidor al rechazar un aporte: 'red' y 'rapido' se reintentan más tarde; 'patron' se arregla avisando del patrón;
// el resto no tiene arreglo y el aporte se pierde (solo cuenta en tu campaña)
function nvFrenteError(e) {
  const m = String((e && e.message) || e);
  if (m.includes('no_es_tu_patron')) return 'patron';
  if (m.includes('demasiado_rapido')) return 'rapido';
  return ['aporte_imposible', 'faccion_no_vale', 'casilla_no_vale', 'tope_del_dia', 'cerrado', 'sin_sesion'].find(k => m.includes(k)) || 'red';
}

// ---------- mandar: cada misión va a una cola guardada en la campaña y se manda en cuanto se puede ----------
function nvFrenteEncola(a) {
  if (!nvFrenteEnRed()) return;
  const f = nvFrente();
  (f.cola = f.cola || []).push({ casilla: a.casilla, faccion: a.faccion, puntos: a.puntos });
  nvCampGuarda();
  return nvFrenteEnvia();
}
async function nvFrenteEnvia() {
  if (NV_FRENTE_RED.enviando || !nvFrenteEnRed()) return;
  const f = nvFrente();
  NV_FRENTE_RED.enviando = true;
  try {
    while (f.cola && f.cola.length) {
      const r = await nvFrenteManda(f.cola[0]);
      if (r === 'red' || r === 'rapido') break;   // se reintenta en la próxima misión o al abrir la galaxia
      f.cola.shift(); nvCampGuarda();
    }
  } finally { NV_FRENTE_RED.enviando = false; }
}
const nvFrenteRpcAporta = a => CUENTA.rpc('nova_frente_aporta', { p_casilla: a.casilla, p_faccion: a.faccion, p_puntos: a.puntos });
async function nvFrenteManda(a) {
  try { await nvFrenteRpcAporta(a); return 'ok'; } catch (e) {
    const k = nvFrenteError(e);
    if (k !== 'patron') return k;
  }
  try { await CUENTA.rpc('nova_frente_patron', { p_faccion: a.faccion }); await nvFrenteRpcAporta(a); return 'ok'; }   // cambiaste de patrón sin red
  catch (e) { return nvFrenteError(e) === 'red' ? 'red' : 'perdido'; }
}
// Al cambiar de patrón en la campaña, también en el servidor (si falla, lo arregla el próximo aporte)
function nvFrentePatronRed(fac) { if (nvFrenteEnRed()) CUENTA.rpc('nova_frente_patron', { p_faccion: fac }).catch(() => { /* lo arregla nvFrenteManda */ }); }

// ---------- bajar: los totales de todos de una semana (los días ya cerrados) y los pilotos de cada facción ----------
async function nvFrenteBaja(semana) {
  if (!nvFrenteEnRed()) return null;
  try {
    const d = await CUENTA.rpc('nova_frente_semana', { p_semana: semana });
    if (!d || !Array.isArray(d.aportes)) return null;
    NV_FRENTE_RED.semanas[semana] = { dias: d.dias, aportes: d.aportes, pesos: FRENTE.pesosPilotos(d.pilotos || {}, NV_FACCIONES), mios: d.mios || 0 };
    return NV_FRENTE_RED.semanas[semana];
  } catch (e) { return null; }
}
// Lo último que se bajó de esa semana, o null (y entonces se simula solo con lo tuyo, como en la fase 1)
const nvFrenteDeRed = semana => (nvFrenteEnRed() && NV_FRENTE_RED.semanas[semana]) || null;
