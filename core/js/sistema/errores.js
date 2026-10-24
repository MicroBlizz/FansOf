// Fans Of · ERRORES: apunta en el servidor los fallos del código (error y promesa sin atender) y los errores que devuelve el servidor, para encontrarlos después.
// Cada fallo distinto se manda UNA vez por sesión y como mucho 10 por sesión. Sin cuenta de core (CUENTA.activa) o sin que el servidor tenga la función, no hace nada.
// Un invitado no deja nada que lo identifique; una cuenta vinculada sí (para buscar sus fallos en /gestion). Servidor: enviar_error y gestion_errores (servidor/51-errores.sql).
// El servidor de verdad lo llama cuenta.js al fallar una función: ERRORES.servidor(nombre, e). Lo demás se engancha solo.
'use strict';
const ERRORES = (() => {
  const TOPE = 10, vistos = new Set();
  let enviados = 0;
  const recorta = (t, n) => String(t == null ? '' : t).replace(/\s+/g, ' ').slice(0, n);
  function registrar(tipo, donde, mensaje, codigo) {
    if (enviados >= TOPE || typeof CUENTA === 'undefined' || !CUENTA.activa || donde === 'enviar_error') return;
    if (typeof DATOS !== 'undefined' && !DATOS.activo()) return;   // el interruptor de «Datos de partida anónimos» manda: apagado, no sale nada
    const msg = recorta(mensaje, 300), clave = tipo + '|' + donde + '|' + msg;
    if (!msg || vistos.has(clave)) return;
    vistos.add(clave); enviados++;
    const d = {
      juego: (typeof AJUSTES !== 'undefined' && AJUSTES.id) || 'desconocido', version: recorta(NUCLEO.version, 24), alfa: !!NUCLEO.alfa,
      plataforma: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'movil' : 'pc', tipo, donde: recorta(donde, 120), codigo: recorta(codigo, 40), mensaje: msg
    };
    Promise.resolve().then(() => CUENTA.rpc('enviar_error', { p_datos: d })).catch(() => { /* sin la función o sin red: no pasa nada (enviar_error nunca se apunta a sí mismo) */ });
  }
  // un error de una función del servidor (HTTP 4xx/5xx con estado); los fallos de red (sin estado) no se apuntan: no llegarían
  function servidor(nombre, e) { if (e && e.estado && e.estado !== 401) registrar('servidor', nombre, (e && e.message) || e, e.estado); }
  window.addEventListener('error', ev => { if (ev && ev.message) registrar('js', ((ev.filename || '').split('/').slice(-2).join('/') || '?') + ':' + (ev.lineno || 0), ev.message); });
  window.addEventListener('unhandledrejection', ev => { const r = ev && ev.reason; registrar('promesa', 'promesa', (r && r.message) || r); });
  return { registrar, servidor };
})();
