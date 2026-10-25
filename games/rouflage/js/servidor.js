// Fans of Rouflage · LA CUENTA EN EL SERVIDOR (cliente, servidor/53-rouflage-cuenta.sql): Gotas, Acciones, la colección de disfraces, el pase, el diario, el gachapón y lo que
// llevas puesto viven en el servidor; aquí solo se ven. Cada acción (comprar, cobrar el diario, tirar…) la pide este archivo con una clave única y el servidor contesta con el
// estado completo, que sustituye lo de aquí. Así la misma cuenta en 2 dispositivos no pierde nada y lo que dices tener lo tienes de verdad.
// - Con servidor (cuenta activa y las funciones ya aplicadas): SAVE.gotas, acciones, pase, eco, diario, tienda, gacha y armario.tengo se ponen NO enumerables (no se guardan en
//   la partida local ni en la que sube core), y la última respuesta del servidor se guarda aparte (CACHE) para poder mirar sin conexión. Sin conexión no se compra, no se cobra
//   ni se tira; las partidas se apuntan en SAVE.rfCola y se mandan al volver (una cada 46 s: el servidor pide ese margen entre partidas).
// - Sin cuenta, con ?nube=0 o si el servidor aún no tiene las funciones: todo sigue como antes, en la partida local (RFS.activo() es false).
// - La primera vez que una cuenta entra, rf_estado le crea el perfil vacío: no se pasa ninguna partida local (la migración se cerró). Las acciones concretas están en servidor-economia.js.
'use strict';

const RFS = (() => {
  const CACHE = AJUSTES.guardado.replace('-partida', '-cuenta-cache'),      // rouflage-cuenta-cache (o …-alfa: la alfa guarda aparte, ajustes.js)
    CAMPOS = ['gotas', 'acciones', 'pase', 'eco', 'diario', 'tienda', 'gacha'];
  let activo = false, desfase = 0, ultimoPuesto = '', temporizador = 0, enviando = false, vaciandoCola = false;
  const nube = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
  const sinFuncion = e => /Could not find|HTTP 404|PGRST202/i.test(String((e && e.message) || e));
  const clave = nombre => nombre + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  // lo que manda el servidor se queda también en la partida guardada: la web publicada (más antigua) comparte esa partida con la alfa y, si le
  // faltaba la colección (armario.tengo), se quedaba pillada al empezar partida. Al entrar con cuenta, el servidor lo vuelve a poner igual
  const oculta = (o, k, v) => { o[k] = v; };
  function leeCache() { try { return JSON.parse(localStorage.getItem(CACHE) || 'null'); } catch (_) { return null; } }
  // Un invitado que consigue su primer cosmético recibe, UNA sola vez, la invitación a guardar su cuenta (si desinstala el juego, lo pierde)
  let nColeccion = null;
  function avisaCuenta() {
    try {
      if (typeof CUENTA === 'undefined' || !CUENTA.invitado || typeof confirmBox !== 'function' || typeof pedirCuenta !== 'function' || localStorage.getItem('rouflage-aviso-cuenta')) return;
      localStorage.setItem('rouflage-aviso-cuenta', '1');
      setTimeout(() => confirmBox(tr('GUARDA TU PROGRESO'), tr('¡Ya tienes tu primer cosmético! Ahora juegas como invitado: si pierdes la instalación del juego, lo pierdes todo. Crea una cuenta con email o Google para tenerlo a salvo.'), tr('CREAR CUENTA'),
        () => pedirCuenta('Con una cuenta guardas tu progreso, juegas en otros aparatos y entras en el PvP.'), tr('MÁS TARDE')), 3500);
    } catch (_) { /* sin almacenamiento: no se avisa */ }
  }
  function aplica(est) {
    if (!est) return;
    try { localStorage.setItem(CACHE, JSON.stringify(est)); } catch (_) { /* sin guardar: no pasa nada */ }
    const a = armarioEstado(), e = est.estado || {};
    oculta(SAVE, 'gotas', est.gotas); oculta(SAVE, 'acciones', est.acciones);
    for (const k of ['pase', 'eco', 'diario', 'tienda', 'gacha']) oculta(SAVE, k, e[k]);
    if (e.gachaCasa) oculta(SAVE, 'gachaCasa', e.gachaCasa);      // la máquina CASA (servidor/96): su pity
    if (typeof misionesDelServidor === 'function') misionesDelServidor(e);
    if (typeof talentosDelServidor === 'function') talentosDelServidor(e);      // la experiencia de los talentos (talentos-datos.js)      // lo cobrado de misiones y logros (misiones.js)
    const antes = nColeccion; nColeccion = (est.coleccion || []).length;
    if (antes !== null && nColeccion > antes) avisaCuenta();      // el primer cosmético que consigue un invitado
    oculta(a, 'tengo', est.coleccion || []);
    oculta(a, 'unidades', est.unidades || {});      // los muebles que tienes más de una vez (servidor/96)
    if (typeof unidadesDelServidor === 'function') unidadesDelServidor(est);
    for (const k in e.puesto || {}) a.puesto[k] = e.puesto[k] === '' ? null : e.puesto[k];      // lo puesto en otro dispositivo
    ultimoPuesto = JSON.stringify(a.puesto);
    if (typeof ecoEstado === 'function') ecoEstado();
  }
  const errorTexto = e => {
    const m = String((e && e.message) || e);
    return /faltan_gotas/.test(m) ? tr('Te faltan Gotas') : /faltan_acciones/.test(m) ? tr('No tienes bastantes Acciones') : /todavia_no/.test(m) ? tr('Todavía no toca. Aguanta un poco.')
      : /ya_la_tienes/.test(m) ? tr('Eso ya es tuyo') : /compras_cerradas/.test(m) ? tr('Las compras con euros solo están en la app de Android') : e && e.estado >= 400 ? tr('El servidor ha dado un error y ya queda apuntado') : tr('Necesitas conexión para esto');
  };
  // una acción del servidor: manda la petición con su clave y aplica el estado que contesta
  async function llama(nombre, args) {
    if (!activo) throw new Error('sin_servidor');
    const est = await CUENTA.rpc(nombre, Object.assign({ p_clave: clave(nombre) }, args || {}));
    aplica(est); return est;
  }
  function error(e) { play('deny'); avisa(errorTexto(e), 'malo'); }
  // el reloj del servidor frente al de aquí (para las tiradas gratis)
  async function relojes() {
    try { const g = await CUENTA.rpc('rf_gacha_gratis_estado', {}); desfase = g.ahora - Date.now(); } catch (_) { /* se queda el de antes */ }
  }
  async function arranca() {
    if (!nube() || typeof CUENTA.rpc !== 'function') return;
    const cache = leeCache();
    try {
      let est = await Promise.race([CUENTA.rpc('rf_estado', {}), new Promise((_, no) => setTimeout(() => no(new Error('tarda')), 6000))]);
      activo = true; aplica(est); guardaPartida(); relojes(); vaciaCola();      // guardado al momento: la web publicada lee esta misma partida
    } catch (e) {
      if (sinFuncion(e)) return;                                                       // el servidor aún no lo tiene: sigue la partida local
      if (cache) { try { activo = true; aplica(cache); } catch (_) { activo = false; } }      // sin conexión: lo último que se supo (y si la copia está rota, la partida local)
    }
  }
  // lo que llevas puesto se sube un momento después de cambiarlo (guardaPartida avisa)
  function alGuardar() {
    if (!activo) return;
    const p = JSON.stringify(armarioEstado().puesto); if (p === ultimoPuesto) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(async () => {
      try { const est = await CUENTA.rpc('rf_poner', { p_puesto: Object.fromEntries(Object.entries(armarioEstado().puesto).map(([k, v]) => [k, v || ''])) }); aplica(est); } catch (_) { /* se reintenta en el próximo cambio */ }
    }, 1500);
  }
  // antes de buscar partida online: lo puesto llega ya al servidor (la ropa que ven los demás sale de ahí)
  function ponerYa() {
    if (!activo) return;
    clearTimeout(temporizador);
    const p = JSON.stringify(armarioEstado().puesto); if (p === ultimoPuesto) return;
    CUENTA.rpc('rf_poner', { p_puesto: Object.fromEntries(Object.entries(armarioEstado().puesto).map(([k, v]) => [k, v || ''])) }).then(aplica).catch(() => { /* se reintenta en el próximo cambio */ });
  }
  // al acabar una partida: Gotas y experiencia (con el margen entre partidas, si no hay red se apuntan y se mandan después)
  function partida(victoria, linea) {
    const cola = SAVE.rfCola = SAVE.rfCola || [];
    cola.push({ k: clave('partida'), v: !!victoria, l: !!linea }); guardaPartida(); vaciaCola();
  }
  async function vaciaCola() {
    if (!activo || vaciandoCola) return; vaciandoCola = true;
    try {
      while (SAVE.rfCola && SAVE.rfCola.length) {
        const p = SAVE.rfCola[0];
        let est;
        try { est = await CUENTA.rpc('rf_partida', { p_clave: p.k, p_victoria: p.v, p_linea: p.l }); }
        catch (e) { if (/repetida/.test(String(e && e.message))) { SAVE.rfCola.shift(); guardaPartida(); continue; } throw e; }
        SAVE.rfCola.shift(); guardaPartida(); aplica(est);
        const g = est.ganado || {};
        if (g.subio) { const n = (g.piezas || []).map(k => { const [c, i] = k.split(':'), it = arItem(c, i); return it ? tr(it.n) : ''; }).filter(Boolean); avisa(tr('¡Pase: nivel {n}!', { n: g.nivel }) + (n.length ? ' ' + n.join(', ') : ''), 'bueno'); }
        if (SAVE.rfCola.length) await new Promise(r => setTimeout(r, 46000));
      }
    } catch (_) { /* sin red: se reintenta al volver */ }
    vaciandoCola = false;
  }
  window.addEventListener('online', () => { vaciaCola(); });
  document.addEventListener('visibilitychange', async () => {      // al volver a la pestaña: lo que hiciste en otro dispositivo
    if (document.hidden || !activo || enviando) return;
    refresca();
  });
  // vuelve a pedir el estado al servidor (al volver a la pestaña; tras una compra de Google Play, servidor-economia.js)
  async function refresca() {
    if (!activo || enviando) return;
    try { aplica(await CUENTA.rpc('rf_estado', {})); relojes(); if (typeof refrescaHud === 'function') refrescaHud(true); } catch (_) { /* sin red */ }
  }
  return { arranca, llama, error, errorTexto, aplica, alGuardar, ponerYa, partida, vaciaCola, refresca, activo: () => activo, desfase: () => desfase, relojes,
    reinicia: async () => { if (activo) await CUENTA.rpc('rf_reiniciar', {}); try { localStorage.removeItem(CACHE); } catch (_) { /* nada */ } } };
})();
