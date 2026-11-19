// Fans Of · /gestion: ENTRAR CON LA SESIÓN DE LA WEB (tarea #146). Si en este navegador ya has entrado en la web con tu cuenta de Google (la de los juegos,
// guardada por core/js/sistema/cuenta.js en localStorage «fansof-cuenta», mismo dominio), /gestion la usa para pedir su token sin pulsar «Entrar con Google».
// El servidor hace la misma comprobación de siempre (gestion_entrar_google: cuenta no invitada con el rol admin); sin rol, se queda en la pantalla de entrar.
// Si en esta pestaña pulsaste «Salir», no vuelve a entrar sola hasta que entres a mano. `sesionWeb` es pura y se prueba en Node.
'use strict';
const GESTION_ENTRADA = (() => {
  const SESION_WEB = 'fansof-cuenta', SALIO = 'gestion-salio', MARGEN = 60000;   // ms que le tienen que quedar a la sesión de la web para usarla
  // El token de acceso de la sesión de la web, o '' si no hay, es de invitado, está mal guardada o le queda menos de un minuto
  function sesionWeb(texto, ahora) {
    let s = null;
    try { s = texto ? JSON.parse(texto) : null; } catch (e) { return ''; }
    const vale = s && typeof s.access === 'string' && s.access !== '' && !s.invitado && Number(s.caduca) > ahora + MARGEN;
    return vale ? s.access : '';
  }
  const lee = (almacen, clave) => { try { return almacen.getItem(clave); } catch (e) { return null; } };
  const anota = (almacen, clave, valor) => { try { if (valor) almacen.setItem(clave, '1'); else almacen.removeItem(clave); } catch (e) { /* sin almacenamiento: solo se pierde el recuerdo */ } };
  // El token de la web para entrar sola, o '' (también si en esta pestaña se pulsó «Salir»)
  const tokenParaEntrar = ({ local, sesion, ahora }) => (lee(sesion, SALIO) ? '' : sesionWeb(lee(local, SESION_WEB), ahora));
  const alSalir = sesion => anota(sesion, SALIO, true);
  const alEntrar = sesion => anota(sesion, SALIO, false);
  return { sesionWeb, tokenParaEntrar, alSalir, alEntrar };
})();
