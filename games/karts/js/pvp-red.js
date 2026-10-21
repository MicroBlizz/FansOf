// Fans of Karts (prototipo) · PvP, LA RED: la sesión de la cuenta (la misma que guardan los demás juegos en este navegador), las llamadas al
// servidor (karts_pvp8_buscar, karts_pvp8_privada, karts_pvp8_estado, karts_pvp8_votar, karts_pvp8_empezar, karts_pvp8_salir, karts_pvp8_cerrar,
// karts_pvp_clasificacion, karts_temporada) y el canal de la carrera por
// Supabase Realtime (difusión en 'karts-sala-<id>': cada jugador manda dónde va su kart y lo que lanza; pvp.js lo convierte en los karts rivales).
// También una red de PRUEBAS entre pestañas del mismo navegador (?pvp=local, solo para desarrollar), sin servidor ni cuenta.
'use strict';

const KRED = (() => {
  const SERVIDOR = 'https://awivkedbmumwnkqlfixm.supabase.co', CLAVE = 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn';   // pública: la seguridad la ponen las reglas de la base de datos
  const SESION = 'fansof-cuenta';
  const leer = () => { try { return JSON.parse(localStorage.getItem(SESION) || 'null'); } catch (e) { return null; } };

  // ---------- la sesión: si está cargado core (CUENTA), se usa; si no, la que dejó otro juego de Fans Of en este navegador ----------
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
    return /cuenta_no_vinculada|sin_sesion/.test(m) ? 'Para jugar PvP necesitas una cuenta vinculada: Opciones → Cuenta.'
      : /pvp_cerrado|could not find|schema cache|PGRST202|HTTP 404/i.test(m) ? 'El PvP de Karts todavía no está abierto en el servidor. Pronto.' : /refresh|jwt|token/i.test(m) ? 'Tu sesión ha caducado: vuelve a abrir el juego.'
      : /sala_no_valida/.test(m) ? 'La sala ya no existe.' : /codigo_no_valido/.test(m) ? 'No hay ninguna sala con ese código.' : /sala_llena/.test(m) ? 'Esa sala ya está llena.'
      : /no_eres_anfitrion/.test(m) ? 'Solo el anfitrión puede empezar.' : 'Necesitas conexión para jugar PvP.';
  };

  // ---------- el canal de la carrera (Realtime, protocolo Phoenix): canal(sala, alMensaje, alEstado) → { enviar(datos), cerrar() } ----------
  function canal(sala, alMensaje, alEstado) {
    const topic = 'realtime:karts-sala-' + sala;
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
        else if (m.event === 'broadcast' && m.payload && m.payload.event === 'k') alMensaje(m.payload.payload);
      };
      ws.onclose = () => { unido = false; if (!vivo) return; if (alEstado) alEstado('cortado'); if (reintentos++ < 6) setTimeout(abre, 400 * reintentos); else if (alEstado) alEstado('perdido'); };
      ws.onerror = () => { /* onclose se encarga */ };
    };
    abre();
    latido = setInterval(() => manda({ topic: 'phoenix', event: 'heartbeat', payload: {} }), 25000);
    return {
      enviar(datos) { const d = { topic, event: 'broadcast', payload: { type: 'broadcast', event: 'k', payload: datos } }; if (unido) manda(d); else if (cola.length < 20) cola.push(d); },
      cerrar() { vivo = false; clearInterval(latido); try { if (ws) { manda({ topic, event: 'phx_leave', payload: {} }); ws.close(); } } catch (e) { /* ya cerrado */ } },
      get unido() { return unido; },
    };
  }

  /* Una red tiene buscar(piloto, aviso) → { cancelar() }. Mientras se espera, aviso(sala) cada vez que hay noticias, con sala = { sala, estado: 'espera', n, max, faltan, jugadores };
     cuando arranca, aviso(sala) con estado 'jugando' (y orden, pista, semilla, jugadores [{ orden, nombre, piloto, yo }]). Si falla: aviso(null, error).
     canal(sala, alMensaje, alEstado) abre el canal de la carrera; cerrar(sala, puesto, tiempo) apunta el resultado; clasificacion() da la lista. */
  const servidor = {
    nombre: 'Servidor',
    // opc: { codigo } entra en la sala de ese código; { crear: true } abre una sala con amigos (karts_pvp8_privada); sin opc, la búsqueda de siempre
    buscar(piloto, aviso, opc = {}) {
      let activo = true, tic = null, primera = false;
      const priv = opc.crear || opc.codigo, pide = priv ? ['karts_pvp8_privada', { p_piloto: piloto, p_codigo: opc.codigo || null }] : ['karts_pvp8_buscar', { p_piloto: piloto }];
      const sondeo = async () => {
        if (!activo) return;
        try {
          const r = await rpc(primera ? 'karts_pvp8_estado' : pide[0], primera ? {} : pide[1]);
          primera = true; servidor.ultimo = JSON.stringify(r).slice(0, 140);
          if (!activo) return;
          if (r && r.sala) { aviso(r); if (r.estado !== 'espera') { activo = false; return; } }
          else if (r && r.espera === false) { primera = false; }      // la sala se esfumó: se vuelve a buscar
          tic = setTimeout(sondeo, 1500);
        } catch (e) { activo = false; aviso(null, e); }
      };
      sondeo();
      return { cancelar() { if (!activo) return; activo = false; clearTimeout(tic); rpc('karts_pvp8_salir').catch(() => { /* da igual */ }); } };
    },
    canal: (sala, alMensaje, alEstado) => canal(sala, alMensaje, alEstado),
    cerrar: (sala, puesto, tiempo) => rpc('karts_pvp8_cerrar', { p_sala: sala, p_puesto: puesto, p_tiempo: tiempo == null ? null : Math.round(tiempo * 100) / 100 }),
    clasificacion: () => rpc('karts_pvp_clasificacion'),
    // irse en plena carrera resta puntos como un último puesto; el latido (cada ~30 s) deja que el servidor note a quien desaparece más de 3 minutos
    retirar: () => rpc('karts_pvp8_retirar').catch(() => { /* servidor antiguo */ }),
    latido: () => rpc('karts_pvp8_latido').catch(() => { /* da igual */ }),
    pendientes: () => rpc('karts_pvp8_pendientes').catch(() => []),
    votar: pista => rpc('karts_pvp8_votar', { p_pista: pista }),
    premium: p => rpc('karts_pvp8_premium', { p_premium: !!p }).catch(() => null),      // tengo el pase premium (servidor antiguo: no hace nada)
    empezar: copa => rpc('karts_pvp8_empezar', { p_copa: !!copa }),
    temporada: () => rpc('karts_temporada'),
  };

  // ---------- pruebas: varias pestañas del mismo navegador (BroadcastChannel). La de id más bajo hace de servidor: junta hasta 8 en 6 s y reparte la sala ----------
  const local = {
    nombre: 'Pruebas (pestañas)',
    espera: 6,
    buscar(piloto, aviso, opc = {}) {
      const codigo = opc.crear ? 'PRUE' : opc.codigo ? String(opc.codigo).toUpperCase() : null;
      const id = (opc.crear ? '0' : '') + Math.random().toString(36).slice(2, 8), bc = new BroadcastChannel('fok-pvp-pruebas' + (codigo ? '-' + codigo : '')), vistos = new Map([[id, { piloto, t: Date.now() }]]), t0 = Date.now();
      local.voto = null; local.arranque = null;
      let activo = true, tic = null;
      const para = () => { activo = false; clearInterval(tic); try { bc.close(); } catch (e) { /* ya cerrado */ } };
      const nombreDe = i => 'Pestaña ' + i.slice(0, 3).toUpperCase();
      const empieza = m => { para(); aviso({ sala: m.sala, estado: 'jugando', orden: m.ids.indexOf(id), pista: m.pista, semilla: m.semilla, n: m.ids.length, max: 8, faltan: 0, copa: !!m.copa, codigo: m.codigo, privada: !!m.codigo, jugadores: m.ids.map((x, i) => ({ orden: i, nombre: nombreDe(x), piloto: m.pilotos[i], yo: x === id })) }); };
      bc.onmessage = e => {
        const m = e.data; if (!activo || !m) return;
        if (m.t === 'busco') vistos.set(m.id, { piloto: m.piloto, t: Date.now(), voto: m.voto, copa: m.copa, prem: !!m.prem });
        else if (m.t === 'par' && m.ids.includes(id)) empieza(m);
      };
      const paso = () => {
        if (!activo) return;
        vistos.get(id).voto = local.voto; vistos.get(id).prem = !!local.premium; vistos.get(id).t = Date.now();
        bc.postMessage({ t: 'busco', id, piloto, voto: local.voto, prem: !!local.premium });
        for (const [k, v] of vistos) if (k !== id && Date.now() - v.t > 3000) vistos.delete(k);
        const ids = [...vistos.keys()].sort(), n = ids.length, votos = {};
        for (const x of ids) { const v = vistos.get(x).voto; if (v) votos[v] = (votos[v] || 0) + 1; }
        aviso({ sala: 'pruebas' + (codigo || ''), estado: 'espera', n, max: 8, orden: ids.indexOf(id), semilla: 777, codigo, privada: !!codigo, anfitrion: 0, votos, premium: ids.some(x => vistos.get(x).prem), faltan: codigo ? null : n >= 2 ? Math.max(0, Math.ceil(local.espera - (Date.now() - t0) / 1000)) : null,
          jugadores: ids.map((x, i) => ({ orden: i, nombre: nombreDe(x), piloto: vistos.get(x).piloto, yo: x === id, voto: vistos.get(x).voto })) });
        const toca = codigo ? local.arranque != null : n >= 8 || (n >= 2 && Date.now() - t0 > local.espera * 1000);
        if (ids[0] === id && toca) {
          const masVotada = Object.entries(votos).sort((a, b) => b[1] - a[1])[0];
          const m = { t: 'par', sala: id + Date.now().toString(36), ids: ids.slice(0, 8), pilotos: ids.slice(0, 8).map(x => vistos.get(x).piloto), pista: masVotada ? masVotada[0] : (q => q[(Math.random() * q.length) | 0].id)(PISTAS.filter(p => p.mundo > 0 && !p.premium)), semilla: (Math.random() * 2147483647) | 0, copa: !!local.arranque, codigo };
          bc.postMessage(m); empieza(m);
        }
      };
      paso(); tic = setInterval(paso, 800);
      return { cancelar: para };
    },
    canal(sala, alMensaje, alEstado) {
      const bc = new BroadcastChannel('fok-pvp-sala-' + sala);
      bc.onmessage = e => alMensaje(e.data);
      setTimeout(() => alEstado && alEstado('unido'), 0);
      return { enviar: d => bc.postMessage(d), cerrar: () => bc.close(), unido: true };
    },
    puntos: 1000,
    retirar: () => Promise.resolve(), latido: () => Promise.resolve(), pendientes: () => Promise.resolve([]),
    votar: pista => { local.voto = pista; return Promise.resolve({}); },
    premium: p => { local.premium = !!p; return Promise.resolve({}); },
    empezar: copa => { local.arranque = !!copa; return Promise.resolve({}); },
    temporada: () => Promise.resolve({ n: 1, nombre: 'Despidos masivos', premio: null }),
    cerrar: (sala, puesto) => { const d = puesto === 1 ? 16 : puesto === 2 ? 4 : -8; local.puntos += d; return Promise.resolve({ estado: 'cerrada', puesto, puntos: local.puntos, delta: d }); },
    clasificacion: () => Promise.resolve({ lista: [{ nombre: 'Pepins', puntos: 1048, jugadas: 9, ganadas: 6 }, { nombre: 'Arkioner', puntos: 1012, jugadas: 4, ganadas: 2, yo: true }, { nombre: 'Fan#A1B2', puntos: 976, jugadas: 3, ganadas: 1 }], yo: { puntos: 1012, jugadas: 4, ganadas: 2, puesto: 2 } }),
  };

  const esLocal = () => { try { return new URLSearchParams(location.search).get('pvp') === 'local'; } catch (e) { return false; } };
  return { rpc, vinculada, errorTexto, servidor, local, get red() { return esLocal() ? local : servidor; }, esLocal };
})();
