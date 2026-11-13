// Fans Of · FEEDBACK · las REGLAS de los topes y de la oferta de beta tester (ADR 106), sin pantalla, red ni reloj: las usa feedback.js y se prueban solas.
// Cualquiera manda feedback, con tope (500 caracteres y 3 envíos al día); quien tiene el rol beta es de confianza y no tiene topes, solo un aviso suave
// cuando el texto se alarga. El servidor (servidor/127) es quien manda de verdad: cuenta los envíos y dice si hay solicitud; aquí solo se decide qué enseñar.
'use strict';
const FEEDBACK_REGLAS = (() => {
  const TOPES = Object.freeze({ texto: 500, dia: 3 });           // sin rol beta
  const BETA = Object.freeze({ texto: 5000, dia: null, suave: 1500 });   // con rol beta: sin tope de envíos; a partir de `suave` se pide brevedad
  // los topes que aplican: { texto, dia (null = sin tope), suave (null = sin aviso) }
  const topes = beta => (beta ? BETA : Object.freeze({ texto: TOPES.texto, dia: TOPES.dia, suave: null }));
  // ¿toca el aviso suave de «cuanto más corto, antes lo leemos»? Solo a quien no tiene tope duro
  const avisoLargo = (beta, largo) => { const t = topes(beta); return t.suave != null && largo > t.suave; };
  // cuántos caracteres quedan (nunca negativo)
  const quedan = (beta, largo) => Math.max(0, topes(beta).texto - largo);
  // lo que el cliente sabe de la persona: { beta, solicitud ('pendiente' | 'aceptada' | 'rechazada' | null), enviadosHoy, topeDia }
  // ¿se puede pedir ser beta tester? Quien ya lo es, o ya lo pidió (esté como esté la solicitud), no vuelve a ver el botón
  const puedePedir = e => !!e && !e.beta && !e.solicitud;
  // ¿se ofrece con ganas tras un envío? Al llegar al tope del día (el tercer mensaje): claramente es alguien activo
  const ofreceBeta = e => puedePedir(e) && e.topeDia != null && e.enviadosHoy >= e.topeDia;
  // el estado que sale de una respuesta del servidor (enviar_feedback_v2, pedir_beta); lo que no venga se queda como estaba
  const trasRespuesta = (antes, r) => {
    const e = Object.assign({ beta: false, solicitud: null, enviadosHoy: 0, topeDia: TOPES.dia }, antes);
    if (!r || typeof r !== 'object') return e;
    if (typeof r.beta === 'boolean') { e.beta = r.beta; if (r.beta) e.topeDia = null; }
    if ('tope_dia' in r) e.topeDia = r.tope_dia == null ? null : Number(r.tope_dia);
    if ('solicitud' in r) e.solicitud = r.solicitud || null;
    if (Number.isFinite(r.enviados_hoy)) e.enviadosHoy = r.enviados_hoy;
    return e;
  };
  return { topes, avisoLargo, quedan, puedePedir, ofreceBeta, trasRespuesta };
})();
if (typeof module !== 'undefined') module.exports = FEEDBACK_REGLAS;
