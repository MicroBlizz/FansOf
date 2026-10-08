// Fans of Rumble · PvP: la red. Busca rival y da al motor (19b-pvp.js) un objeto {enviar} y los mensajes que llegan. Hoy solo existe la red de PRUEBAS entre dos pestañas
'use strict';
/* Una red es un objeto con buscar(modo, equipo, aviso) → { cancelar() }. Cuando se encuentra rival llama a aviso({ seat, seed, equipos: {p, e}, red, rival }):
   · seat: 'p' si has creado la sala (juegas abajo en la simulación) o 'e' si te has unido · seed: la semilla de la partida · equipos: los dos equipos (ya validados por el servidor, cuando lo haya)
   · red: { enviar(msg) } para mandar al rival; lo que llegue del rival hay que dárselo a pvpRecibir(msg) · rival: { nombre }
   La red del servidor (el RPC pvp_jugar y la cola) será otra implementación de esta misma interfaz: el motor y las pantallas no cambian. */
const PVPNET = { actual: null, redes: {} };

// pruebas: dos pestañas del mismo navegador (BroadcastChannel). Se emparejan solas, sin cola ni servidor. Solo para desarrollar.
PVPNET.redes.local = {
  nombre: 'Pruebas (dos pestañas de este navegador)',
  buscar(modo, equipo, aviso) {
    const id = Math.random().toString(36).slice(2, 8), canal = new BroadcastChannel('fansof-pvp-pruebas'), yo = { nombre: typeof pname === 'function' ? pname() : 'Jugador' };
    let activo = true, tic = null;
    const cierra = () => { activo = false; clearInterval(tic); };
    const empieza = (seat, sala, seed, equipos, rival) => {
      cierra();
      canal.onmessage = e => { const m = e.data; if (m && m.t === 'jug' && m.sala === sala && m.de !== seat) pvpRecibir(m.m); };   // lo del rival
      aviso({ seat, seed, equipos, rival: { nombre: rival }, red: { enviar: msg => canal.postMessage({ t: 'jug', sala, de: seat, m: msg }) } });
    };
    canal.onmessage = e => {
      const m = e.data; if (!activo || !m) return;
      if (m.t === 'busco' && m.modo === modo && m.id !== id && id < m.id) {   // el de id menor crea la sala
        const sala = id + m.id, seed = Math.floor(Math.random() * 4294967296) >>> 0;
        canal.postMessage({ t: 'par', sala, p: id, e: m.id, seed, equipos: { p: equipo, e: m.equipo }, nombres: { p: yo.nombre, e: m.nombre } });
        empieza('p', sala, seed, { p: equipo, e: m.equipo }, m.nombre);
      } else if (m.t === 'par' && m.e === id) empieza('e', m.sala, m.seed, m.equipos, m.nombres.p);
    };
    const anuncia = () => { if (activo) canal.postMessage({ t: 'busco', id, modo, equipo, nombre: yo.nombre }); };
    anuncia(); tic = setInterval(anuncia, 1000);
    return { cancelar() { cierra(); try { canal.close(); } catch (e) { /* ya cerrado */ } } };
  },
};
PVPNET.actual = 'local';
