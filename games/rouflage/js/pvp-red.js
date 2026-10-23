// Fans of Rouflage (prototipo) · PvP, LA RED: la sesión de la cuenta (la de core, o la que dejó otro juego de Fans Of en este navegador), las llamadas al servidor
// (rouflage_pvp_buscar, rouflage_pvp_estado, rouflage_pvp_salir, rouflage_pvp_rendir, rouflage_pvp_cerrar, rouflage_pvp_clasificacion; salas con amigos: rouflage_pvp_privada y rouflage_pvp_empezar) y el canal de la partida por
// Supabase Realtime (difusión en 'rouflage-sala-<id>': cada jugador manda dónde está y lo que hace; pvp.js lo convierte en los personajes de los demás).
// También una red de PRUEBAS entre pestañas del mismo navegador (?pvp=local, solo para desarrollar), sin servidor ni cuenta.
'use strict';

const RFRED = (() => {
  const SERVIDOR = 'https://awivkedbmumwnkqlfixm.supabase.co', CLAVE = 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn';   // pública: la seguridad la ponen las reglas de la base de datos
  const SESION = 'fansof-cuenta';
  const leer = () => { try { return JSON.parse(localStorage.getItem(SESION) || 'null'); } catch (e) { return null; } };

  // ---------- la sesión: la de core (CUENTA) si está cargado; si no, la que dejó otro juego de Fans Of en este navegador ----------
  const conCuenta = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
  async function pedir(ruta, cuerpo, token) {
    const cab = { apikey: CLAVE, 'Content-Type': 'application/json' }; if (token) cab.Authorization = 'Bearer ' + token;
    const r = await fetch(SERVIDOR + ruta, { method: 'POST', cache: 'no-store', headers: cab, body: JSON.stringify(cuerpo) });
    const texto = await r.text(), datos = texto ? JSON.parse(texto) : null;
    if (!r.ok) throw new Error((datos && (datos.msg || datos.message || datos.error_description)) || ('HTTP ' + r.status));
    return datos;
  }
  let renovando = null;
  async function token() {
    const s = leer();
    if (!s || !s.refresh) throw new Error('sin_sesion');
    if (s.caduca - Date.now() > 60000) return s.access;
    // mismo cerrojo que core/js/sistema/cuenta.js: el token de renovación solo vale una vez y otra pestaña puede haberlo gastado ya
    const renovar = () => { const a = leer(); if (a && a.caduca - Date.now() > 60000) return Promise.resolve(a.access); return pedir('/auth/v1/token?grant_type=refresh_token', { refresh_token: (a || s).refresh }).then(d => {
      const n = { access: d.access_token, refresh: d.refresh_token, caduca: Date.now() + (d.expires_in || 3600) * 1000, usuario: d.user && d.user.id, invitado: !!(d.user && d.user.is_anonymous), email: (d.user && d.user.email) || '' };
      try { localStorage.setItem(SESION, JSON.stringify(n)); } catch (e) { /* sin guardar */ }
      return n.access;
    }); };
    if (!renovando) renovando = (navigator.locks ? navigator.locks.request('fansof-cuenta-renovar', renovar) : renovar()).finally(() => { renovando = null; });
    return renovando;
  }
  const rpc = async (nombre, cuerpo = {}) => (conCuenta() ? CUENTA.rpc(nombre, cuerpo) : pedir('/rest/v1/rpc/' + nombre, cuerpo, await token()));
  // ¿hay una cuenta vinculada (no invitado) con la que jugar?
  const vinculada = () => { if (conCuenta()) return !CUENTA.invitado; const s = leer(); return !!(s && s.refresh && s.invitado === false); };
  const errorTexto = e => {
    const m = String((e && e.message) || e);
    return /cuenta_no_vinculada|sin_sesion/.test(m) ? 'Para jugar en línea hace falta conexión. Vuelve a abrir el juego.'
      : /could not find|schema cache|PGRST202|HTTP 404/i.test(m) ? 'El PvP de Rouflage todavía no está abierto en el servidor. Pronto.' : /refresh|jwt|token/i.test(m) ? 'Tu sesión ha caducado: vuelve a abrir el juego.'
      : /sala_no_valida/.test(m) ? 'La sala ya no existe.' : /codigo_no_valido/.test(m) ? 'Ese código no existe o la sala ya empezó.' : /sala_llena/.test(m) ? 'La sala está llena.'
      : /voto_en_espera/.test(m) ? 'Aún no se puede volver a votar.' : /faltan_jugadores/.test(m) ? 'Hacen falta al menos dos personas para empezar.' : /no_eres_anfitrion/.test(m) ? 'Solo el anfitrión puede empezar.' : 'Necesitas conexión para jugar PvP.';
  };

  // ---------- el canal de la partida (Realtime, protocolo Phoenix): canal(sala, alMensaje, alEstado) → { enviar(datos), cerrar() } ----------
  function canal(sala, alMensaje, alEstado) {
    const topic = 'realtime:rouflage-sala-' + sala;
    let ws = null, ref = 0, latido = null, vivo = true, unido = false, reintentos = 0, cola = [];
    const manda = o => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(Object.assign({ ref: String(++ref) }, o))); };
    const abre = () => {
      if (!vivo) return;
      unido = false;
      ws = new WebSocket(SERVIDOR.replace('https', 'wss') + '/realtime/v1/websocket?apikey=' + CLAVE + '&vsn=1.0.0');
      ws.onopen = () => { reintentos = 0; manda({ topic, event: 'phx_join', payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } } }); };
      ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch (err) { return; }
        if (m.topic !== topic) return;
        if (m.event === 'phx_reply' && !unido) { unido = m.payload && m.payload.status === 'ok'; if (unido) { for (const d of cola) manda(d); cola = []; if (alEstado) alEstado('unido'); } }
        else if (m.event === 'broadcast' && m.payload && m.payload.event === 'r') alMensaje(m.payload.payload);
      };
      ws.onclose = () => { unido = false; if (!vivo) return; if (alEstado) alEstado('cortado'); if (reintentos++ < 6) setTimeout(abre, 400 * reintentos); else if (alEstado) alEstado('perdido'); };
      ws.onerror = () => { /* onclose se encarga */ };
    };
    abre();
    latido = setInterval(() => manda({ topic: 'phoenix', event: 'heartbeat', payload: {} }), 25000);
    return {
      enviar(datos) { const d = { topic, event: 'broadcast', payload: { type: 'broadcast', event: 'r', payload: datos } }; if (unido) manda(d); else if (cola.length < 40) cola.push(d); },
      cerrar() { vivo = false; clearInterval(latido); try { if (ws) { manda({ topic, event: 'phx_leave', payload: {} }); ws.close(); } } catch (e) { /* ya cerrado */ } },
      get unido() { return unido; },
    };
  }

  /* Una red tiene buscar(aviso, opc) → { cancelar() }. Sin opc busca partida pública; con opc.crear abre una sala con amigos (código de 4 letras) y con opc.codigo entra en esa.
     empezar() la arranca (solo el anfitrión). Mientras se espera, aviso(sala) cada vez que hay noticias, con sala = { sala, estado: 'espera', n, max, faltan, jugadores };
     cuando arranca, aviso(sala) con estado 'jugando' (y orden, semilla, ncaz y jugadores [{ orden, nombre, animal, rol, yo }]). Si falla: aviso(null, error).
     canal(sala, alMensaje, alEstado) abre el canal de la partida; cerrar(sala, gano) apunta el resultado; rendir() da la partida por abandonada; clasificacion() da la lista. */
  const servidor = {
    nombre: 'Servidor',
    buscar(aviso, opc) {
      let activo = true, tic = null, primera = false, viejo = false;
      const sondeo = async () => {
        if (!activo) return;
        try {
          const cola = opc && opc.talentos && !viejo ? 'rouflage_pvp_buscar_talentos' : 'rouflage_pvp_buscar_modos';      // las dos colas de BUSCAR PARTIDA: con y sin talentos (servidor/62-*)
          const r = await rpc(primera ? 'rouflage_pvp_estado' : opc && (opc.crear || opc.codigo) ? 'rouflage_pvp_privada' : cola, !primera && opc && opc.codigo ? { p_codigo: String(opc.codigo).toUpperCase() } : {});
          primera = true;
          if (!activo) return;
          if (r && r.sala) { aviso(r); if (r.estado !== 'espera') { activo = false; return; } }
          else if (r && r.espera === false) { primera = false; }      // la sala se esfumó: se vuelve a buscar
          tic = setTimeout(sondeo, 1500);
        } catch (e) { if (!viejo && opc && opc.talentos && /Could not find|HTTP 404|PGRST202/i.test(String((e && e.message) || e))) { viejo = true; tic = setTimeout(sondeo, 10); return; } activo = false; aviso(null, e); }      // (servidor sin la cola de talentos: la de siempre)
      };
      sondeo();
      return { cancelar() { if (!activo) return; activo = false; clearTimeout(tic); rpc('rouflage_pvp_salir').catch(() => { /* da igual */ }); } };
    },
    empezar: () => rpc('rouflage_pvp_empezar'),
    modo: m => rpc('rouflage_pvp_modo', { p_modo: m }),
    escenario: d => rpc('rouflage_pvp_escenario', { p_datos: d }),      // el anfitrión sube su escenario a la sala con amigos (sala-escenario.js)
    escenarioVer: v => rpc('rouflage_pvp_escenario_ver', { p_v: v | 0 }),
    voto: v => rpc('rouflage_pvp_voto', { p_voto: v }),      // en la sala pública: 'ya' (empezar ya), 'mas' (sumar 60 s) o null (quitar el voto); devuelve la sala      // el anfitrión de una sala con amigos elige el modo (modos.js); el sondeo lo trae a todos
    canal: (sala, alMensaje, alEstado) => canal(sala, alMensaje, alEstado),
    cerrar: (sala, gano) => rpc('rouflage_pvp_cerrar', { p_sala: sala, p_gano: !!gano }),
    // vivo = true: te vas con tu papel en juego (solo se apunta el abandono); false: espectador (cobras o pierdes con tu bando). Si el servidor aún no tiene la función nueva, la de siempre
    rendir: vivo => rpc('rouflage_pvp_retirar', { p_vivo: vivo !== false }).catch(() => rpc('rouflage_pvp_rendir')),
    pendientes: () => rpc('rouflage_pvp_pendientes').catch(() => []),
    latido: vivo => rpc('rouflage_pvp_latido', { p_vivo: vivo !== false }).catch(() => { /* da igual */ }),
    clasificacion: () => rpc('rouflage_pvp_clasificacion'),
  };

  // ---------- pruebas: varias pestañas del mismo navegador (BroadcastChannel). La de id más bajo hace de servidor: junta hasta 10 en 6 s, reparte los papeles y la sala ----------
  const local = {
    nombre: 'Pruebas (pestañas)',
    espera: 60, total: 10, ncaz: 2,
    arranque: false, modoSala: null, miVoto: null, votar: null,
    buscar(aviso, opc) {
      const codigo = opc && opc.crear ? 'PRUE' : opc && opc.codigo ? String(opc.codigo).toUpperCase() : null;      // en las pruebas la sala con amigos siempre se llama PRUE
      local.arranque = false; local.privada = !!codigo; local.modoSala = codigo ? null : Object.assign(modoAzar(), opc && opc.talentos ? { a: { t: 1 } } : {}); local.miVoto = null;
      const id = (opc && opc.crear ? '0' : '') + Math.random().toString(36).slice(2, 8), bc = new BroadcastChannel('rf-pvp-pruebas' + (codigo ? '-' + codigo : '')), vistos = new Map([[id, { t: Date.now() }]]), t0 = Date.now();
      let activo = true, tic = null;
      const para = () => { activo = false; clearInterval(tic); try { bc.close(); } catch (e) { /* ya cerrado */ } };
      const nombreDe = i => 'Pestaña ' + i.slice(0, 3).toUpperCase();
      let modoVisto = null, hasta = Date.now() + local.espera * 1000, libre = 0, empate = 0, ronda = 0, rondaHost = 0, votoHost = null;
      local.votar = v => { if (v && Date.now() < (votoHost ? votoHost.libre : libre)) return Promise.reject(new Error('voto_en_espera')); local.miVoto = v; paso(); return Promise.resolve(null); };
      const empieza = m => { para(); aviso({ sala: m.sala, estado: 'jugando', orden: m.ids.indexOf(id), semilla: m.semilla, n: m.ids.length, max: m.max || local.total, ncaz: m.ncaz || local.ncaz, faltan: 0, modo: m.modo || null,
        jugadores: m.ids.map((x, i) => ({ orden: i, nombre: nombreDe(x), animal: m.animales[i], rol: m.roles[i], yo: x === id })) }); };
      bc.onmessage = e => {
        const m = e.data; if (!activo || !m) return;
        if (m.t === 'busco') {
          vistos.set(m.id, { t: Date.now(), v: m.v, r: m.r });
          if (m.modo !== undefined && m.id < id) modoVisto = m.modo;
          if (m.host && m.id < id) { votoHost = m.host; if (m.host.ronda !== rondaHost) { rondaHost = m.host.ronda; local.miVoto = null; } }      // el que hace de servidor borra los votos: se vota otra vez
        }
        else if (m.t === 'par' && m.ids.includes(id)) empieza(m);
      };
      const paso = () => {
        if (!activo) return;
        for (const [k, v] of vistos) if (k !== id && Date.now() - v.t > 3000) vistos.delete(k);
        vistos.get(id).v = local.miVoto; vistos.get(id).r = [...vistos.keys()].sort()[0] === id ? ronda : rondaHost;
        const ids = [...vistos.keys()].sort(), n = ids.length, soy = ids[0] === id;
        // la votación (solo en la pública): la cuenta el que hace de servidor, igual que _rf_arranca
        let ya = 0, mas = 0;
        if (!codigo && soy) {
          for (const k of ids) { const v = vistos.get(k); if (v.r === ronda) { if (v.v === 'ya') ya++; else if (v.v === 'mas') mas++; } }
          if (ya * 2 > n) local.arranque = true;
          else if (mas * 2 > n) { hasta = Math.min(hasta + 60000, t0 + 300000); libre = Date.now() + 30000; ronda++; local.miVoto = null; ya = mas = 0; }
          else if (ya + mas === n && n > 0) { empate = Date.now(); ronda++; local.miVoto = null; ya = mas = 0; }
        }
        const h = soy ? { hasta, libre, empate, ronda, ya, mas } : votoHost || { hasta, libre: 0, empate: 0, ronda: 0, ya: 0, mas: 0 };
        bc.postMessage({ t: 'busco', id, modo: local.modoSala, v: local.miVoto, r: soy ? ronda : rondaHost, host: soy ? h : null });
        aviso({ sala: 'pruebas', estado: 'espera', n, max: local.total, ncaz: local.ncaz, faltan: codigo ? null : Math.max(0, Math.ceil((h.hasta - Date.now()) / 1000)), codigo, privada: !!codigo, anfitrion: 0, modo: ids[0] === id ? local.modoSala : modoVisto,
          votos: codigo ? null : { ya: h.ya, mas: h.mas, yo: local.miVoto, libre: Math.max(0, Math.ceil((h.libre - Date.now()) / 1000)), empate: Date.now() - h.empate < 4000 },
          jugadores: ids.map((x, i) => ({ orden: i, nombre: nombreDe(x), animal: 'bunny', rol: null, yo: x === id })) });
        const toca = codigo ? local.arranque && n >= 1 : n >= local.total || local.arranque || Date.now() >= hasta;
        if (ids[0] === id && toca) {
          // los papeles al azar: entre 1 y ncaz cazadores humanos, y al menos 1 camaleón humano
          const ord = ids.slice(0, local.total).map((x, i) => [Math.random(), i]).sort((a, b) => a[0] - b[0]).map(x => x[1]), nn = ord.length;
          const q = codigo ? salaCuantos(local.modoSala, nn) : { ncaz: local.ncaz, total: local.total };      // con amigos, lo que eligió el anfitrión
          const min = Math.max(1, nn - (q.total - q.ncaz)), max = Math.min(q.ncaz, nn - 1), cazs = nn === 1 ? (Math.random() < 0.5 ? 1 : 0) : min + Math.floor(Math.random() * (max - min + 1));      // solo contra la máquina: a cara o cruz
          const roles = ids.slice(0, local.total).map(() => 'camaleon'); ord.slice(0, cazs).forEach(i => { roles[i] = 'cazador'; });
          const m = { t: 'par', sala: id + Date.now().toString(36), ids: ids.slice(0, local.total), roles, animales: ids.slice(0, local.total).map(() => ['bunny', 'squirrel', 'fox', 'meercat', 'coon'][(Math.random() * 5) | 0]), semilla: (Math.random() * 2147483647) | 0, modo: local.modoSala, ncaz: q.ncaz, max: q.total };
          bc.postMessage(m); empieza(m);
        }
      };
      paso(); tic = setInterval(paso, 800);
      return { cancelar: para };
    },
    empezar: () => { local.arranque = true; return Promise.resolve(); },
    voto: v => local.votar ? local.votar(v) : Promise.resolve(null),
    modo: m => { local.modoSala = m; return Promise.resolve(); },
    // el escenario del anfitrión, entre pestañas del mismo navegador
    escenario: d => { try { localStorage.setItem('rf-pruebas-escenario', JSON.stringify({ v: Date.now() % 1e9, d })); } catch (_) { /* sin guardar */ } return Promise.resolve({}); },
    escenarioVer: v => { let x = null; try { x = JSON.parse(localStorage.getItem('rf-pruebas-escenario') || 'null'); } catch (_) { /* nada */ } return Promise.resolve(!x ? { v: 0 } : x.v === v ? { v } : { v: x.v, datos: x.d }); },
    canal(sala, alMensaje, alEstado) {
      const bc = new BroadcastChannel('rf-pvp-sala-' + sala);
      bc.onmessage = e => alMensaje(e.data);
      setTimeout(() => alEstado && alEstado('unido'), 0);
      return { enviar: d => bc.postMessage(d), cerrar: () => bc.close(), unido: true };
    },
    puntos: 1000,
    // como rouflage_pvp_cerrar (servidor/37-rouflage-amigos.sql): la sala con amigos no da ni quita puntos y lo dice (privada)
    cerrar: (sala, gano) => { const d = local.privada ? 0 : gano ? 12 : -12; local.puntos += d; return Promise.resolve({ estado: 'cerrada', gano: !!gano, puntos: local.puntos, delta: d, energia_premio: 0, privada: !!local.privada }); },
    rendir: () => Promise.resolve(),
    pendientes: () => Promise.resolve([]),
    latido: () => Promise.resolve(),
    clasificacion: () => Promise.resolve({ lista: [{ nombre: 'Pepins', puntos: 1048, jugadas: 9, ganadas: 6 }, { nombre: 'Arkioner', puntos: 1012, jugadas: 4, ganadas: 2, yo: true }, { nombre: 'Fan#A1B2', puntos: 976, jugadas: 3, ganadas: 1 }], yo: { puntos: 1012, jugadas: 4, ganadas: 2, puesto: 2 } }),
  };

  const esLocal = () => { try { return new URLSearchParams(location.search).get('pvp') === 'local'; } catch (e) { return false; } };
  // ¿se puede jugar en línea? Con cualquier sesión, también la de invitado (desde el 23-10-2026: quien llega por un enlace juega sin crear cuenta;
  // la tienda, el ranking y la liga sí piden cuenta). Con core cargado (CUENTA.activa) la sesión de invitado se crea sola en la primera llamada
  const conSesion = () => conCuenta() || !!(leer() && leer().refresh);
  // sin sesión (rol anon): lo que puede hacer cualquiera que llega por un enlace, como abrir un reto (reto.js)
  const rpcAnon = (nombre, cuerpo = {}) => pedir('/rest/v1/rpc/' + nombre, cuerpo);
  return { rpc, rpcAnon, vinculada, conSesion, errorTexto, servidor, local, get red() { return esLocal() ? local : servidor; }, esLocal };
})();
