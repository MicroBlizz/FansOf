// Fans Of · HORA DEL SERVIDOR: la hora de Supabase (servidor/108-hora-servidor.sql) para los temporizadores que no deben fiarse del
// reloj del aparato (la flota de Nova, por ejemplo). HORA.sincroniza() pregunta una vez y guarda la diferencia con el reloj de aquí;
// HORA.ahora() da la hora corregida. Sin cuenta o sin red se usa el reloj del aparato y HORA.delServidor dice false. Guía: docs/guia/core/hora.md.
'use strict';
const HORA = (() => {
  let desfase = 0, delServidor = false, pidiendo = null;
  const ahora = () => Date.now() + desfase;
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
  return { ahora, sincroniza, get delServidor() { return delServidor; } };
})();
if (typeof module !== 'undefined') module.exports = HORA;
