// Fans Of · /gestion: ENTRAR SOLA (tareas #146 y #300, ADR 190). Si en este navegador ya has entrado en la web con tu cuenta de Google (la de los juegos,
// «fansof-cuenta» en localStorage, mismo dominio), /gestion la usa para pedir su token sin pulsar «Entrar con Google»; si el token de la web caducó, lo
// renueva con su refresh token (core/js/cuenta/sesion-renovar.js, el mismo candado que cuenta.js). El servidor comprueba lo de siempre
// (gestion_entrar_google: cuenta no invitada con el rol admin); sin rol, se queda en la pantalla de entrar.
// El token de gestión se guarda en localStorage con su caducidad (8 h en el servidor, servidor/35-gestion-google.sql): sobrevive a cerrar la pestaña.
// Si el servidor lo rechaza, se borra y se intenta una vez con la sesión de la web. «Salir» lo borra y frena la entrada sola en este navegador hasta entrar a mano.
// Todo es lógica sin DOM: el almacenamiento, la sesión de la web, el servidor y abrir el panel llegan como parámetros (tests/gestion/entrada-web.test.mjs).
'use strict';
const GESTION_ENTRADA = (() => {
  const TOKEN = 'gestion-acceso', SALIO = 'gestion-salio';
  const VIDA = 8 * 3600e3 - 10 * 60e3;   // el servidor da 8 h; aquí se da por caducado 10 minutos antes, para no abrir el panel con un token a punto de morir
  const lee = (almacen, clave) => { try { return almacen.getItem(clave); } catch (e) { return null; } };
  const pon = (almacen, clave, valor) => { try { if (valor) almacen.setItem(clave, valor); else almacen.removeItem(clave); } catch (e) { /* sin almacenamiento: solo se pierde el recuerdo */ } };

  // El token de gestión guardado si sigue vivo, o ''
  function tokenGuardado(almacen, ahora) {
    let g = null;
    try { g = JSON.parse(lee(almacen, TOKEN) || 'null'); } catch (e) { return ''; }
    return g && typeof g.token === 'string' && g.token !== '' && Number(g.caduca) > ahora ? g.token : '';
  }
  const guardaToken = (almacen, token, ahora) => pon(almacen, TOKEN, JSON.stringify({ token, caduca: ahora + VIDA }));
  const olvidaToken = almacen => pon(almacen, TOKEN, '');
  const salio = almacen => !!lee(almacen, SALIO);
  const alSalir = almacen => { olvidaToken(almacen); pon(almacen, SALIO, '1'); };
  const alEntrar = almacen => pon(almacen, SALIO, '');

  // Lo que hace falta para entrar (todo puertos):
  //   local        el almacenamiento (localStorage; null si está bloqueado)
  //   ahora()      la hora
  //   accesoWeb()  async → el token vivo de la sesión de la web, o '' (CUENTA_RENOVAR: renueva si hace falta; no lanza)
  //   pedirToken(access) async → el token de gestión, '' si la cuenta no es admin (lanza sin red)
  //   abrir()      async → 'dentro' | 'rechazado' (el servidor no acepta el token guardado) | 'error' (sin red u otro fallo: ya lo ha dicho en pantalla)
  // Resultado: 'dentro' | 'fuera' (hay que entrar a mano) | 'error'
  async function conLaWeb({ local, ahora, accesoWeb, pedirToken, abrir }) {
    if (salio(local)) return 'fuera';
    let token = '';
    try { const access = await accesoWeb(); token = access ? await pedirToken(access) : ''; } catch (e) { return 'fuera'; }   // sin red o sin rol: la pantalla de entrar
    if (!token) return 'fuera';
    guardaToken(local, token, ahora());
    const r = await abrir();
    if (r !== 'rechazado') return r;
    olvidaToken(local);
    return 'fuera';
  }
  // Al cargar la página (y al recargar los datos): el token guardado si vale; si no hay o el servidor lo rechaza, una vez con la sesión de la web
  async function arranca(p) {
    if (tokenGuardado(p.local, p.ahora())) {
      const r = await p.abrir();
      if (r !== 'rechazado') return r;   // 'error' (sin red): el token se queda, puede que siga valiendo
      olvidaToken(p.local);
    } else olvidaToken(p.local);          // caducado o mal guardado: fuera
    return conLaWeb(p);
  }
  return { tokenGuardado, guardaToken, olvidaToken, salio, alSalir, alEntrar, arranca, VIDA };
})();
