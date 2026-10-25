// Fans Of · SALAS con amigos, comunes a todos los juegos: código de 4 letras, enlace para compartir (?sala=CODIGO) y un canal en directo para la partida.
// Es el sistema de salas de Rouflage (games/rouflage/js/pvp-red.js) hecho común; el servidor está en servidor/89-salas.sql (salas_crear, salas_unirse, salas_estado, salas_poner, salas_salir).
// La sala vive mientras alguno de sus jugadores siga dentro (señal cada 2 s); quien se va puede volver con el código. El anfitrión es el de menor orden que sigue ahí.
// No se carga sola: cada juego que la usa la pide en su lista (NUCLEO.juego({ despues: ['../../core/js/sistema/salas.js', ...] })). Necesita la cuenta de core (CUENTA) y una cuenta vinculada.
// SALAS.red(juego) da la red del servidor; con ?salas=local (solo para desarrollar), una de PRUEBAS entre pestañas del mismo navegador, sin servidor ni cuenta.
// Una red: crear(max, misDatos) y unirse(codigo, misDatos) → Promise<sala>; seguir(aviso) avisa con la sala cada vez que cambia; misDatos(d) cambia los tuyos;
// poner(d, empezar) (anfitrión) cambia los de la sala o la arranca; salir(); canal(alMensaje, alEstado) → { enviar(d), cerrar() }.
// sala = { sala, codigo, max, estado: 'espera'|'jugando', datos, anfitrion, jugadores: [{ orden, nombre, datos, vivo, yo }] }.
'use strict';
const SALAS = (() => {
  const SERVIDOR = 'https://awivkedbmumwnkqlfixm.supabase.co', CLAVE = 'sb_publishable_iQ9OrvJmMx87u_uUMQ_uNw_UdBz78gn';   // pública: la seguridad la ponen las funciones del servidor
  const LATIDO = 2000;
  const local = () => /[?&]salas=local/.test(location.search) && (typeof NUCLEO === 'undefined' || NUCLEO.desarrollo || NUCLEO.alfa);
  // ¿se puede jugar en línea? (cuenta vinculada, no invitado)
  const puede = () => local() || (typeof CUENTA !== 'undefined' && CUENTA.activa && !CUENTA.invitado);
  const errorTexto = e => {
    const m = String((e && e.message) || e);
    return /cuenta_no_vinculada|sin_sesion/.test(m) ? 'Para jugar con amigos entra con tu cuenta.'
      : /could not find|schema cache|PGRST202|HTTP 404/i.test(m) ? 'Las salas con amigos todavía no están abiertas en el servidor. Pronto.'
      : /refresh|jwt|token/i.test(m) ? 'Tu sesión ha caducado: vuelve a abrir el juego.'
      : /codigo_no_valido/.test(m) ? 'Ese código no existe o la sala ya se cerró.' : /sala_llena/.test(m) ? 'La sala está llena.'
      : /sala_empezada/.test(m) ? 'Esa partida ya empezó.' : /faltan_jugadores/.test(m) ? 'Hacen falta al menos dos personas para empezar.'
      : /no_eres_anfitrion/.test(m) ? 'Solo el anfitrión puede hacer eso.' : /demasiadas_salas/.test(m) ? 'Ya estás en demasiadas salas.' : 'Necesitas conexión para jugar con amigos.';
  };
  // el enlace para compartir y el código que trae la dirección
  const enlace = codigo => { const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('sala', codigo); if (local()) u.searchParams.set('salas', 'local'); return u.toString(); };
  const codigoUrl = () => { const m = /[?&]sala=([A-Za-z]{4})\b/.exec(location.search); return m ? m[1].toUpperCase() : null; };
  const quitaCodigoUrl = () => { try { const u = new URL(location.href); u.searchParams.delete('sala'); history.replaceState(null, '', u.toString()); } catch (e) { /* da igual */ } };

  // ---------- el canal en directo (Supabase Realtime, protocolo Phoenix), como el de Rouflage ----------
  function canalServidor(juego, sala, alMensaje, alEstado) {
    const topic = 'realtime:' + juego + '-sala-' + sala;
    let ws = null, ref = 0, vivo = true, unido = false, reintentos = 0, cola = [];
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
    const latido = setInterval(() => manda({ topic: 'phoenix', event: 'heartbeat', payload: {} }), 25000);
    return {
      enviar(datos) { const d = { topic, event: 'broadcast', payload: { type: 'broadcast', event: 'r', payload: datos } }; if (unido) manda(d); else if (cola.length < 40) cola.push(d); },
      cerrar() { vivo = false; clearInterval(latido); try { if (ws) { manda({ topic, event: 'phx_leave', payload: {} }); ws.close(); } } catch (e) { /* ya cerrado */ } },
    };
  }

  // ---------- la red del servidor ----------
  function redServidor(juego) {
    let sala = null, mios = null, tic = null, aviso = null;
    const rpc = (n, c) => CUENTA.rpc(n, c);
    const toma = r => { if (r && r.sala) { sala = r; if (aviso) aviso(r); } return r; };
    const sondeo = async () => {
      if (!sala) return;
      try { const r = await rpc('salas_estado', { p_sala: sala.sala, p_datos: mios }); mios = null; if (!sala) return; if (r && r.sala) toma(r); else { sala = null; if (aviso) aviso(null, new Error('codigo_no_valido')); return; } }
      catch (e) { /* un corte: se reintenta en el siguiente latido */ }
      tic = setTimeout(sondeo, LATIDO);
    };
    const entra = r => { toma(r); clearTimeout(tic); tic = setTimeout(sondeo, LATIDO); return r; };
    return {
      crear: (max, d) => rpc('salas_crear', { p_juego: juego, p_max: max, p_datos: d || {} }).then(entra),
      unirse: (codigo, d) => rpc('salas_unirse', { p_juego: juego, p_codigo: String(codigo).toUpperCase(), p_datos: d || {} }).then(entra),
      seguir(f) { aviso = f; if (sala) f(sala); },
      misDatos(d) { mios = d; clearTimeout(tic); tic = setTimeout(sondeo, 50); },
      poner: (d, empezar) => rpc('salas_poner', { p_sala: sala.sala, p_datos: d || {}, p_empezar: !!empezar }).then(toma),
      salir() { const s = sala; sala = null; aviso = null; clearTimeout(tic); if (s) rpc('salas_salir', { p_sala: s.sala }).catch(() => { /* da igual */ }); },
      canal: (alMensaje, alEstado) => canalServidor(juego, sala.sala, alMensaje, alEstado),
      get sala() { return sala; },
    };
  }

  // ---------- pruebas: pestañas del mismo navegador (BroadcastChannel). Cada pestaña anuncia sus datos; la que entró antes y sigue es el anfitrión y anuncia los de la sala ----------
  function redLocal(juego) {
    const id = Math.random().toString(36).slice(2, 8);
    let t0 = Date.now();
    let bc = null, codigo = null, max = 2, mios = {}, datos = {}, estado = 'espera', aviso = null, tic = null, sala = null, host = null;
    const vistos = new Map();   // id → { t0, datos, visto }
    const calcula = () => {
      for (const [k, v] of vistos) if (k !== id && Date.now() - v.visto > 2500) vistos.delete(k);
      vistos.set(id, { t0, datos: mios, visto: Date.now() });
      const lista = [...vistos.entries()].sort((a, b) => a[1].t0 - b[1].t0 || (a[0] < b[0] ? -1 : 1)); host = lista[0][0];
      sala = { sala: 'local-' + codigo, juego, codigo, max, estado, datos, anfitrion: lista[0][0] === id,
        jugadores: lista.map(([k, v], i) => ({ orden: i, nombre: 'Pestaña ' + k.slice(0, 3).toUpperCase(), datos: v.datos, vivo: true, yo: k === id })) };
      return sala;
    };
    const anuncia = () => { if (!bc) return; const s = calcula(); bc.postMessage({ t: 'yo', id, t0, datos: mios }); if (s.anfitrion) bc.postMessage({ t: 'sala', id, datos, estado, max }); if (aviso) aviso(s); };
    const abre = (c, d) => {
      codigo = c; mios = d || {}; t0 = Date.now(); bc = new BroadcastChannel('fansof-salas-' + juego + '-' + c);
      bc.onmessage = e => {
        const m = e.data; if (!m) return;
        if (m.t === 'yo') vistos.set(m.id, { t0: m.t0, datos: m.datos, visto: Date.now() });
        else if (m.t === 'sala' && m.id !== id && (calcula(), host === m.id)) { datos = m.datos; estado = m.estado; max = m.max; }
        else if (m.t === 'canal' && canalLocal) canalLocal(m.d);
      };
      clearInterval(tic); tic = setInterval(anuncia, 700); anuncia();
    };
    let canalLocal = null;
    return {
      crear(n, d) { max = n; abre(String.fromCharCode(...[0, 0, 0, 0].map(() => 65 + Math.floor(Math.random() * 26))), d); return Promise.resolve(sala); },
      unirse(c, d) {
        abre(String(c).toUpperCase(), d);
        return new Promise((ok, mal) => setTimeout(() => {
          const s = calcula(), yo = s.jugadores.find(j => j.yo);
          if (s.jugadores.length < 2) { this.salir(); mal(new Error('codigo_no_valido')); } else if (yo.orden >= max) { this.salir(); mal(new Error('sala_llena')); } else ok(s);
        }, 1600));
      },
      seguir(f) { aviso = f; if (sala) f(sala); },
      misDatos(d) { mios = d; anuncia(); },
      poner(d, empezar) {
        if (!calcula().anfitrion) return Promise.reject(new Error('no_eres_anfitrion'));
        if (empezar && sala.jugadores.length < 2) return Promise.reject(new Error('faltan_jugadores'));
        datos = Object.assign({}, datos, d || {}); if (empezar) estado = 'jugando'; anuncia(); return Promise.resolve(sala);
      },
      salir() { clearInterval(tic); aviso = null; canalLocal = null; try { if (bc) bc.close(); } catch (e) { /* ya cerrado */ } bc = null; sala = null; vistos.clear(); },
      canal(alMensaje, alEstado) { canalLocal = alMensaje; if (alEstado) setTimeout(() => alEstado('unido'), 0); return { enviar: d => { if (bc) bc.postMessage({ t: 'canal', d }); }, cerrar: () => { canalLocal = null; } }; },
      get sala() { return sala; },
    };
  }

  return { red: juego => (local() ? redLocal(juego) : redServidor(juego)), puede, local, errorTexto, enlace, codigoUrl, quitaCodigoUrl };
})();
