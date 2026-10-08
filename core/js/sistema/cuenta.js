// Fans Of · CUENTA: la partida también en la nube (Supabase), sin que el jugador tenga que hacer nada. Plan: PLAN-CUENTAS.md (pasos 2 y 3).
//
// · La primera vez que hay conexión se crea una cuenta de invitado (sin nombre ni email) y se guarda en este navegador; vale para todos los juegos.
// · La partida se sigue guardando primero aquí (saveGame). Cada cambio la marca como pendiente y se sube un rato después, al ocultar la página
//   y al volver la conexión. En la nube hay una fila por juego, con un número de versión que sube en cada subida.
// · Al abrir el juego se mira la nube: si otro aparato subió una más nueva y aquí no hay nada pendiente, se usa esa (recargando la página);
//   si las dos cambiaron, se pregunta cuál quedarse. Sin conexión no pasa nada: se juega igual y se sube al volver.
// · No funciona dentro de otra página (el comparador), ni en un archivo abierto a mano, ni con ?nube=0.
'use strict';
const CUENTA = (() => {
  const SERVIDOR = 'https://awivkedbmumwnkqlfixm.supabase.co';
  const CLAVE = 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn';   // pública: la seguridad la ponen las reglas de la base de datos
  const SESION = 'fansof-cuenta', APARATO = 'fansof-aparato', META = SAVE_KEY + '-nube', ESPERA = 10000;
  const leer = (k, d) => { try { const t = localStorage.getItem(k); return t ? JSON.parse(t) : d; } catch (e) { return d; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };

  const activa = (() => {
    let arriba = true; try { arriba = window.self === window.top; } catch (e) { arriba = false; }
    let apagada = false; try { apagada = new URLSearchParams(location.search).get('nube') === '0'; } catch (e) { /* sin dirección */ }
    return arriba && !apagada && !!AJUSTES.id && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  })();
  const juego = AJUSTES.id;
  const aparato = leer(APARATO, null) || (() => { const a = Math.random().toString(36).slice(2, 10); escribir(APARATO, a); return a; })();
  // version: la de la nube con la que coincide lo de aquí · pendiente: hay cambios aquí sin subir. Sin datos: pendiente si ya había partida.
  let meta = leer(META, null) || { version: 0, pendiente: (() => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } })() };
  let cambios = 0, ocupado = false, temporizador = null, estado = activa ? 'sin conectar' : 'apagada';
  const guardarMeta = () => escribir(META, meta);

  // ---------- la sesión: invitado al principio; se renueva sola antes de caducar ----------
  async function pedir(ruta, opciones = {}, token) {
    const cab = { apikey: CLAVE, 'Content-Type': 'application/json' }; if (token) cab.Authorization = 'Bearer ' + token;
    const r = await fetch(SERVIDOR + ruta, Object.assign({ cache: 'no-store' }, opciones, { headers: cab }));
    const cuerpo = await r.text(); const datos = cuerpo ? JSON.parse(cuerpo) : null;
    if (!r.ok) throw new Error((datos && (datos.msg || datos.message || datos.error_description)) || ('HTTP ' + r.status));
    return datos;
  }
  const deSesion = d => ({ access: d.access_token, refresh: d.refresh_token, caduca: Date.now() + (d.expires_in || 3600) * 1000, usuario: d.user && d.user.id, invitado: !!(d.user && d.user.is_anonymous), email: (d.user && d.user.email) || '', emailPendiente: (d.user && d.user.new_email) || '' });
  async function token() {
    let s = leer(SESION, null);
    if (s && s.caduca - Date.now() > 60000) return s.access;
    try {
      if (s && s.refresh) s = deSesion(await pedir('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: s.refresh }) }));
      else s = deSesion(await pedir('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ data: {} }) }));
    } catch (e) {
      // otra pestaña pudo renovarla a la vez: se usa la suya si ya está
      const otra = leer(SESION, null); if (otra && otra.caduca - Date.now() > 60000) return otra.access;
      throw e;
    }
    escribir(SESION, s); return s.access;
  }

  // ---------- subir y bajar ----------
  async function deLaNube(t) {
    const filas = await pedir('/rest/v1/partidas?select=datos,version,cambiado&juego=eq.' + encodeURIComponent(juego), {}, t);
    return filas && filas[0] ? filas[0] : null;
  }
  async function subir(t, version) {
    const antes = cambios;
    const r = await pedir('/rest/v1/rpc/guardar_partida', { method: 'POST', body: JSON.stringify({ p_juego: juego, p_datos: SAVE, p_version_esperada: version, p_aparato: aparato }) }, t);
    if (r && r.ok) { meta = { version: r.version, pendiente: cambios !== antes }; guardarMeta(); estado = 'al día'; return null; }
    return r;   // choque: alguien subió otra antes
  }
  function usar(nube) {   // la de la nube pasa a ser la de aquí; la página se recarga para que el juego la lea desde el principio
    if (!nube.datos) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(nube.datos)); } catch (e) { return; }
    meta = { version: nube.version, pendiente: false }; guardarMeta();
    location.reload();
  }
  // Huella de la partida: cuenta TODO (progreso, compras, equipo, mazos, contratos, ajustes): nada se pierde sin avisar.
  // Si la huella coincide no se pregunta nada; si no, se enseña un resumen de en qué se diferencian para elegir con datos.
  const canon = v => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => (v[k] === undefined ? o : (o[k] = canon(v[k]), o), o), {}) : v);
  const huella = s => { try { const t = JSON.stringify(canon(s)); let h = 5381; for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return h + ':' + t.length; } catch (e) { return String(Math.random()); } };
  const iguales = (a, b) => huella(a) === huella(b);
  const suma = (o, f) => Object.keys(o || {}).reduce((a, k) => a + (f ? f(o[k]) : +o[k]) || a, 0);
  const num = v => (typeof v === 'number' && isFinite(v) ? v : 0), cuenta = o => Object.keys(o || {}).length;
  // lo que se enseña de cada partida: [qué, valor]; el que valga 0 en las dos no sale
  const resumen = s => [
    ['Oro', num(s.gold)], ['Gemas', num(s.gems)],
    ['Nivel de las cartas (suma)', suma(s.units, u => num(u && u.lvl))], ['XP de las cartas', suma(s.units, u => num(u && u.xp))],
    ['Cartas conseguidas', cuenta(s.cards)], ['Estrellas de las cartas', suma(s.cards, c => num(c && c.st))],
    ['Habilidades y objetos', Array.isArray(s.inv) ? s.inv.length : 0], ['Con contrato indefinido', Array.isArray(s.inv) ? s.inv.filter(i => i && i.lock).length : 0],
    ['Equipados', cuenta(s.abEquip) + suma(s.equip, e => cuenta(e))], ['Mazos', cuenta(s.decks)], ['Tickets', num(s.tickets)], ['Facciones desbloqueadas', Array.isArray(s.unlocked) ? s.unlocked.length : 0], ['Estrellas de los niveles', suma(s.stars, num)],
    ['Niveles de campaña pasados', cuenta(s.camp)], ['XP del pase', num(s.pass && s.pass.xp)], ['Logros', Array.isArray(s.achDone) ? s.achDone.length : 0],
  ];
  function preguntar(nube, t) {
    if (nube.datos && iguales(nube.datos, SAVE)) {   // son la misma partida: no se pregunta, solo se apunta que ya coinciden
      meta = { version: nube.version, pendiente: false }; guardarMeta(); estado = 'al día'; return;
    }
    if (typeof confirmBox !== 'function') return;
    const n = v => (typeof fmt === 'function' ? fmt(v) : String(v));
    const aqui = resumen(SAVE), alla = resumen(nube.datos || {});
    const filas = aqui.map((a, i) => [a[0], a[1], alla[i][1]]).filter(f => f[1] !== f[2]);
    const otras = Object.keys(Object.assign({}, SAVE, nube.datos)).filter(k => huella((SAVE || {})[k]) !== huella((nube.datos || {})[k])).length;   // campos que difieren en total
    const mas = (x, y) => (x > y ? ' ▲' : '');
    const cuando = nube.cambiado ? '<br><small>' + tr('En la nube') + ': ' + new Date(nube.cambiado).toLocaleString(NUCLEO.idioma) + '</small>' : '';
    const tabla = '<table style="width:100%;margin-top:8px;font-size:.9em"><tr><th></th><th>' + tr('En este aparato') + '</th><th>' + tr('En la nube') + '</th></tr>' +
      (filas.length ? filas.map(f => `<tr><td style="text-align:left">${tr(f[0])}</td><td>${n(f[1])}${mas(f[1], f[2])}</td><td>${n(f[2])}${mas(f[2], f[1])}</td></tr>`).join('')
        : '') + `<tr><td colspan="3"><small>${tr('Apartados de la partida que difieren: {n}', { n: otras })}</small></td></tr></table>`;
    confirmBox(tr('¿QUÉ PARTIDA QUIERES?'), tr('Has jugado en este aparato y en otro, y las dos partidas son distintas. Elige con cuál sigues; la otra se pierde. ▲ marca dónde hay más.') + tabla + cuando,
      tr('LA DE LA NUBE'), () => usar(nube));
    const no = document.getElementById('cf-no');
    if (no) {
      no.textContent = tr('LA DE ESTE APARATO');
      no.onclick = () => { if (typeof play === 'function') play('select'); document.getElementById('scr-confirm').hidden = true; subir(t, nube.version).catch(() => { /* se intenta otra vez luego */ }); };
    }
  }
  async function sincronizar(alAbrir) {
    if (!activa || ocupado) return; ocupado = true;
    try {
      const t = await token();
      if (alAbrir || !meta.version) {
        const nube = await deLaNube(t), vn = nube ? nube.version : 0;
        if (vn > meta.version) { if (meta.pendiente) preguntar(nube, t); else usar(nube); return; }
        if (vn < meta.version) meta.version = vn;   // la de la nube se borró: se vuelve a subir la de aquí
        if (!meta.pendiente && vn) { estado = 'al día'; return; }
      }
      if (!meta.pendiente) return;
      let choque = await subir(t, meta.version);
      if (choque && !choque.datos) { meta.version = 0; choque = await subir(t, 0); }   // la de la nube ya no existe: se sube la de aquí
      if (choque) preguntar(choque, t);
    } catch (e) {
      estado = 'sin conexión';   // se intenta al volver la conexión, en el próximo cambio o al abrir otra vez
    } finally { ocupado = false; }
  }

  // ---------- la cuenta de verdad: email (y Google cuando esté configurado) ----------
  const volver = () => location.origin + location.pathname;   // los enlaces del email vuelven a esta misma página
  // Al volver de un enlace del email, la sesión llega en la dirección (#access_token=…). Si es otra cuenta (entrar en otro aparato),
  // lo de aquí aún no está en ella: se compara con la nube al abrir y, si las dos tienen partida, se pregunta.
  let aviso = '';
  async function deLaDireccion() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (!h.get('access_token') && !h.get('error_description')) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* se queda en la dirección */ }
    if (h.get('error_description')) { aviso = tr('El enlace no vale o ha caducado. Pide otro.'); return; }
    const t = h.get('access_token'), user = await pedir('/auth/v1/user', {}, t);
    const antes = leer(SESION, null), nueva = deSesion({ access_token: t, refresh_token: h.get('refresh_token'), expires_in: +h.get('expires_in') || 3600, user });
    escribir(SESION, nueva);
    if (!antes || antes.usuario !== nueva.usuario) { meta = { version: 0, pendiente: (() => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } })() }; guardarMeta(); }
    aviso = tr('Listo: tu progreso se guarda en tu cuenta.');
  }
  // invitado → cuenta con email: llega un enlace; al abrirlo, esta misma cuenta (con su partida) queda guardada con ese email
  async function guardarConEmail(email) {
    const user = await pedir('/auth/v1/user?redirect_to=' + encodeURIComponent(volver()), { method: 'PUT', body: JSON.stringify({ email }) }, await token());
    const s = leer(SESION, null); if (s) { s.emailPendiente = user.new_email || email; escribir(SESION, s); }
  }
  // en otro aparato: entrar en una cuenta que ya existe (no crea ninguna)
  async function entrarConEmail(email) {
    await pedir('/auth/v1/otp?redirect_to=' + encodeURIComponent(volver()), { method: 'POST', body: JSON.stringify({ email, create_user: false }) });
  }
  // Google: solo si el servidor lo tiene activado (así el botón no sale hasta que la credencial esté puesta)
  async function googleListo() {
    try { const a = await pedir('/auth/v1/settings'); return !!(a && a.external && a.external.google); } catch (e) { return false; }
  }
  // invitado → cuenta con Google: se enlaza a esta misma cuenta (conserva la partida); hace falta «manual linking» activado en Supabase
  async function guardarConGoogle() {
    const r = await pedir('/auth/v1/user/identities/authorize?provider=google&skip_http_redirect=true&redirect_to=' + encodeURIComponent(volver()), {}, await token());
    location.href = r.url;
  }
  // en otro aparato: entrar con la cuenta de Google que ya tienes
  function entrarConGoogle() { location.href = SERVIDOR + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(volver()); }
  async function cerrarSesion() {
    const s = leer(SESION, null);
    try { if (s) await pedir('/auth/v1/logout', { method: 'POST' }, s.access); } catch (e) { /* da igual: se olvida aquí */ }
    try { localStorage.removeItem(SESION); } catch (e) { /* sin almacenamiento */ }
    meta = { version: 0, pendiente: true }; guardarMeta();   // la partida de este aparato sigue aquí; irá a una cuenta de invitado nueva
  }
  async function borrarCuenta() {   // la cuenta y todas sus partidas en la nube; lo de este aparato no se toca
    await pedir('/rest/v1/rpc/borrar_mi_cuenta', { method: 'POST', body: '{}' }, await token());
    try { localStorage.removeItem(SESION); } catch (e) { /* sin almacenamiento */ }
    meta = { version: 0, pendiente: true }; guardarMeta();
  }

  // ---------- lo llama saveGame: hay algo nuevo que subir ----------
  function cambio() {
    if (!activa) return;
    cambios++;
    if (!meta.pendiente) { meta.pendiente = true; guardarMeta(); }
    clearTimeout(temporizador); temporizador = setTimeout(() => sincronizar(false), ESPERA);
  }

  if (activa) {
    window.addEventListener('load', () => setTimeout(() => deLaDireccion().catch(() => { aviso = tr('No se ha podido entrar. Prueba otra vez.'); }).then(() => { if (aviso && typeof toast === 'function') toast(aviso, true); fire('cuenta'); return sincronizar(true); }), 500));
    window.addEventListener('online', () => sincronizar(false));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && meta.pendiente) { clearTimeout(temporizador); sincronizar(false); } });
  }
  const sesion = () => leer(SESION, null) || {};
  // llamada a una función de la base de datos con la sesión de aquí; cuerpo puede ser una función que se evalúa justo después de tener la sesión
  const rpc = async (nombre, cuerpo) => { const t = await token(); return pedir('/rest/v1/rpc/' + nombre, { method: 'POST', body: JSON.stringify(typeof cuerpo === 'function' ? cuerpo() : cuerpo) }, t); };
  return { activa, cambio, sincronizar, rpc, get usuario() { return sesion().usuario || ''; }, guardarConEmail, entrarConEmail, googleListo, guardarConGoogle, entrarConGoogle, cerrarSesion, borrarCuenta,
    get estado() { return estado; }, get version() { return meta.version; }, get pendiente() { return meta.pendiente; },
    get invitado() { return sesion().invitado !== false; }, get email() { return sesion().email || ''; }, get emailPendiente() { return sesion().emailPendiente || ''; } };
})();
