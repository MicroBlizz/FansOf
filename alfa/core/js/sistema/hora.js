// Fans Of · HORA DEL JUEGO: la hora de Supabase (servidor/108-hora-servidor.sql) para los temporizadores que no deben fiarse del
// reloj del aparato (la flota de Nova, por ejemplo). HORA.sincroniza() pregunta una vez y guarda la diferencia con el reloj de aquí;
// HORA.ahora() da la hora corregida. Sin cuenta o sin red se usa el reloj del aparato y HORA.delServidor dice false.
// Donde hay panel DEV (desarrollo, alfa y, con el rol «alfa», también la release y la app: ADR 096) se puede PONER LA HORA A MANO (ADR 047): HORA.pon('7:00', dias) o
// ?hora=7:00 en la dirección; sigue corriendo desde ahí, dura lo que la pestaña y HORA.suelta() vuelve a la real. Guía: docs/guia/core/hora.md.
'use strict';
const HORA = (() => {
  const CLAVE = 'fansof-hora-manual', MINUTO = 60000, DIA = 24 * 60 * MINUTO;
  let desfase = 0, delServidor = false, pidiendo = null, manual = null, leida = false;
  const sePuede = () => typeof NUCLEO !== 'undefined' && !!(NUCLEO.desarrollo || NUCLEO.alfa || (typeof NUCLEO.panelDev === 'function' && NUCLEO.panelDev()));
  const guarda = v => { try { if (v === null) sessionStorage.removeItem(CLAVE); else sessionStorage.setItem(CLAVE, String(v)); } catch (e) { /* sin guardar: dura hasta recargar */ } };
  // «7:00» (o «7») y los días que se adelanta → cuánto hay que sumar al reloj del aparato; null si no es una hora
  function desfaseDe(texto, dias, ahora) {
    const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(String(texto).trim());
    if (!m || +m[1] > 23 || +(m[2] || 0) > 59) return null;
    const d = new Date(ahora); d.setHours(+m[1], +(m[2] || 0), 0, 0);
    return d.getTime() + (dias || 0) * DIA - ahora;
  }
  function pon(texto, dias = 0) {
    if (!sePuede()) return false;
    const v = desfaseDe(texto, dias, Date.now());
    if (v === null) return false;
    manual = v; leida = true; guarda(v);
    return true;
  }
  function suelta() { manual = null; leida = true; guarda(null); }
  // la primera vez que se pide la hora: la de ?hora= o la que se puso en esta pestaña (solo donde se puede)
  // (si core aún no ha dicho si es desarrollo, no se da por leída: se vuelve a mirar en la siguiente)
  function lee() {
    if (leida || typeof NUCLEO === 'undefined' || !('desarrollo' in NUCLEO)) return;
    leida = true;
    if (!sePuede() || typeof location === 'undefined') return;
    const q = new URLSearchParams(location.search).get('hora');
    if (q !== null && pon(q)) return;
    try { const v = sessionStorage.getItem(CLAVE); if (v !== null && Number.isFinite(+v)) manual = +v; } catch (e) { /* sin guardar */ }
  }
  const ahora = () => { lee(); return Date.now() + (manual !== null ? manual : desfase); };
  function sincroniza() {
    if (delServidor) return Promise.resolve(true);
    if (pidiendo) return pidiendo;
    if (typeof CUENTA === 'undefined' || !CUENTA.activa) return Promise.resolve(false);
    const antes = Date.now();
    pidiendo = CUENTA.rpc('hora_servidor', {}).then(ms => {
      if (typeof ms !== 'number') return false;
      desfase = ms - (antes + Date.now()) / 2; delServidor = true;   // la mitad del viaje de ida y vuelta
      return true;
    }).catch(() => false).finally(() => { pidiendo = null; });
    return pidiendo;
  }
  return { ahora, sincroniza, pon, suelta, get delServidor() { return delServidor; }, get manual() { lee(); return manual !== null; } };
})();
if (typeof module !== 'undefined') module.exports = HORA;
