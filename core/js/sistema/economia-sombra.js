// Fans Of · ECONOMÍA EN SOMBRA: el servidor apunta lo que el jugador gana y gasta, sin mandar todavía (PLAN-CUENTAS.md, punto 15, fase 1).
//
// · Los juegos siguen usando el oro y las gemas de la partida local; esto solo copia cada movimiento (lo que pasa por ECO) a la cuenta.
// · La primera vez de cada cuenta se llama a `migrar` con la partida de aquí: el servidor crea su monedero, inventario y cartas (con un tope).
// · Después, los movimientos se guardan en una cola local y se mandan con `anotar` (cada uno con su clave: si se repite, no cuenta dos veces).
// · Con ECO_SOMBRA.informe() se ve cuánto se parecen el saldo de aquí y el del servidor. No cambia nada de lo que ve el jugador.
// · Sin conexión, sin cuenta o con ?nube=0 no hace nada.
'use strict';
const ECO_SOMBRA = (() => {
  const CLAVE = SAVE_KEY + '-sombra', ESPERA = 10000;
  const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; } };
  let est = leer();   // { migrado: id de usuario, cola: [{ clave, motivo, oro, gemas, entradas }], servidor: {…}, local: {…}, cuando }
  est.cola = est.cola || [];
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(est)); } catch (e) { /* sin almacenamiento */ } };
  let ocupado = false, temporizador = null;
  const activa = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
  const id = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  function anota(motivo, v, signo) {   // lo llama ECO
    if (!activa()) return;
    est.cola.push({ clave: id(), motivo, oro: signo * (v.gold || 0), gemas: signo * (v.gems || 0), entradas: signo * (v.tickets || 0) });
    if (est.cola.length > 2000) est.cola.splice(0, est.cola.length - 2000);
    guardar(); clearTimeout(temporizador); temporizador = setTimeout(enviar, ESPERA);
  }
  const apunta = r => { est.servidor = { oro: r.oro, gemas: r.gemas, entradas: r.entradas }; est.local = { oro: SAVE.gold, gemas: SAVE.gems, entradas: SAVE.tickets || 0 }; est.cuando = Date.now(); };

  async function enviar() {
    if (!activa() || ocupado) return; ocupado = true;
    try {
      const usuario = CUENTA.usuario || (await CUENTA.rpc('estado', { p_juego: AJUSTES.id }).then(() => CUENTA.usuario));
      if (est.migrado !== usuario) {
        // la partida de ahora ya incluye todo lo de la cola: se vacía en el mismo instante en que se serializa la partida
        const r = await CUENTA.rpc('migrar', () => { est.cola = []; return { p_juego: AJUSTES.id, p_save: SAVE }; });
        est.migrado = usuario; if (r) apunta(r); guardar(); return;
      }
      while (est.cola.length) {
        const lote = est.cola.slice(0, 200);
        const r = await CUENTA.rpc('anotar', { p_juego: AJUSTES.id, p_movs: lote });
        est.cola = est.cola.slice(lote.length); apunta(r); guardar();
      }
    } catch (e) { /* sin conexión o sin cuenta aún: se intenta en el próximo cambio, al volver la red o al abrir */ }
    finally { ocupado = false; }
  }
  // texto para mirar en la consola o en el panel DEV
  const informe = () => {
    const s = est.servidor, l = est.local; if (!s) return 'Sin datos del servidor todavía (pendientes: ' + est.cola.length + ').';
    const d = k => (l[k] - s[k]);
    return `Servidor: oro ${s.oro}, gemas ${s.gemas}, entradas ${s.entradas} · Aquí (al comparar): oro ${l.oro}, gemas ${l.gemas}, entradas ${l.entradas} · Diferencia: oro ${d('oro')}, gemas ${d('gemas')}, entradas ${d('entradas')} · Pendientes de mandar: ${est.cola.length}`;
  };

  if (activa()) {
    window.addEventListener('load', () => setTimeout(enviar, 4000));
    window.addEventListener('online', enviar);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && est.cola.length) enviar(); });
  }
  return { anota, enviar, informe, get estado() { return est; } };
})();
