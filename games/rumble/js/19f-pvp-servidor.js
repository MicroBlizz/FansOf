// Fans of Rumble · PvP: la red del servidor (Supabase): cola, sala, un RPC por turno y cierre con puntos
'use strict';
/* Usa las funciones de la base de datos pvp_buscar, pvp_estado, pvp_salir, pvp_jugar, pvp_cerrar y pvp_clasificacion (contrato en PLAN-CUENTAS.md, punto 9).
   Cumple la interfaz de 19d-pvp-red.js: buscar(modo, equipo, aviso) → { cancelar() }. El servidor guarda y valida el equipo (mazo, niveles, estrellas, objetos) y da la semilla:
   los equipos con los que se juega salen de lo que devuelve pvp_estado, nunca de lo que diga el otro cliente. */
// retardo: turnos de margen de red. En desarrollo se elige en la pantalla de PvP (guarda fansof-pvp-d) (los DOS jugadores el mismo; si no, la partida se anula)
const pvpRetardo = () => { let d = 0; try { d = NUCLEO.desarrollo ? +localStorage.getItem('fansof-pvp-d') : 0; } catch (e) { /* sin guardar */ } return d >= 1 && d <= 10 ? d : PVP_SRV.retardo; };
const PVP_SRV = { retardo: 5, turnoMs: 200, sondeoMs: 1500, cierreMs: 5000 };   // cada cuánto se habla con el servidor mientras se juega · se espera una sala · se pregunta por el cierre

const pvpErrorTexto = e => {
  const m = String((e && e.message) || e);
  return /cuenta_no_vinculada/.test(m) ? 'Para jugar PvP necesitas vincular tu cuenta (Opciones → Cuenta)' : /sin_sesion|refresh|jwt|token/i.test(m) ? 'Tu sesión ha caducado: vuelve a abrir el juego (una cuenta por navegador o perfil)'
    : /mazo_no_valido/.test(m) ? 'Tu mazo no vale para el PvP' : /objeto_no_es_tuyo/.test(m) ? 'Llevas un objeto que no está en tu cuenta' : /sala_no_valida/.test(m) ? 'La sala ya no existe'
    : /demasiadas_jugadas/.test(m) ? 'Demasiadas jugadas seguidas' : 'Necesitas conexión para jugar PvP';
};
const pvpFacDeMazo = mazo => { for (const c of mazo) { const f = FACTION_ORDER.find(x => FACTIONS[x].leader === c.c); if (f) return f; } return (FACTION_ORDER.find(x => mazo.every(c => FACTIONS[x].units.includes(c.c) || (FACTIONS[x].gacha || []).includes(c.c) || FACTIONS[x].leader === c.c))) || ''; };
// lo que devuelve el servidor (mazo [{c, n, st}] y equipo [{s, u, t, o, q}]) → el equipo que entiende el motor
function pvpEquipoDeServidor(mazo, equipo) {
  const fac = pvpFacDeMazo(mazo), F = FACTIONS[fac] || {}, eq = { fac, deck: [], lvl: {}, stars: {}, ab: {}, equip: {}, modo: (equipo && equipo.length) ? 'salvaje' : 'estandar' };
  for (const c of mazo) { if (c.c !== F.leader) eq.deck.push(c.c); eq.lvl[c.c] = c.n || 1; if (c.st) eq.stars[c.c] = c.st; }
  for (const it of equipo || []) {   // la clave es ab_<carta> o eq_<ranura>; el tipo lo pone el servidor (t)
    const x = { k: it.t === 'ab' ? 'ab' : 'eq', id: it.o, q: (it.q || []).slice() };
    if (x.k === 'ab') eq.ab[String(it.s).replace(/^ab_/, '')] = x; else eq.equip[String(it.s).replace(/^eq_/, '')] = x;
  }
  return eq;
}
// jugada de motor → trozo corto para el servidor (menos de 200 caracteres) y al revés
const pvpAServidor = m => (m.t === 'rendir' ? { v: VERSION, t: Math.floor(SIM.tick / PVP.T), r: 1 } : { v: VERSION, d: PVP.D, t: m.turno, k: m.tick, h: m.h, p: m.partes, c: m.cmds.map(c => [c.slot, c.key, c.x, c.y]), ...(m.f ? { f: m.f } : {}) });
const pvpDeServidor = (d, equipo) => d.r ? { t: 'rendir' } : ({ t: 't', turno: d.t, tick: d.k, h: d.h, f: d.f, cmds: (d.c || []).map(c => ({ team: equipo, slot: c[0], key: c[1], x: c[2], y: c[3] })) });

PVPNET.redes.servidor = {
  nombre: 'Servidor',
  disponible: () => typeof CUENTA !== 'undefined' && CUENTA.activa && !CUENTA.invitado,
  buscar(modo, equipo, aviso) {
    let activo = true, tic = null, sala = null, error = e => { activo = false; clearTimeout(tic); PVP_SRV.ultimo = 'ERROR ' + String((e && e.message) || e).slice(0, 160); toast(pvpErrorTexto(e), true); if (typeof pvpPinta === 'function') { PVP_UI.busca = null; clearInterval(PVP_UI.tic); pvpPinta(); } };
    const F = FACTIONS[equipo.fac], uid = {};   // el servidor comprueba que cada objeto sea tuyo: se manda el identificador de la copia, no lo que hace
    if (modo === 'salvaje') { const E = SAVE.equip[equipo.fac] || {}; for (const s in E) if (E[s]) uid['eq_' + s] = E[s]; for (const k of equipo.deck.concat(F.leader)) if (SAVE.abEquip[k]) uid['ab_' + k] = SAVE.abEquip[k]; }   // claves libres: ab_<carta> y eq_<ranura>
    const mazo = equipo.deck.concat(F.leader);
    const sondeo = async () => {
      if (!activo) return;
      try {
        const nom = sondeo.primera ? 'pvp_estado' : 'pvp_buscar';
        const r = await (sondeo.primera ? CUENTA.rpc('pvp_estado', {}) : CUENTA.rpc('pvp_buscar', { p_juego: AJUSTES.id, p_modo: modo, p_mazo: mazo, p_equipo: uid }));
        sondeo.primera = true; PVP_SRV.ultimo = nom + ' → ' + JSON.stringify(r).slice(0, 140);   // para ver qué responde el servidor (en desarrollo se enseña en la pantalla de buscar rival)
        if (!activo) return;
        const salaId = r && (r.sala || (r.estado && r.estado.sala));
        if (salaId) { await empieza(r.lado ? r : await CUENTA.rpc('pvp_estado', {})); return; }
        tic = setTimeout(sondeo, PVP_SRV.sondeoMs);
      } catch (e) { error(e); }
    };
    const empieza = async st => {
      if (!activo || !st || !st.sala) return;
      activo = false; sala = st.sala;
      const seat = st.lado === 'a' ? 'p' : 'e', equipos = { p: pvpEquipoDeServidor(st.mazo_a || [], st.equipo_a), e: pvpEquipoDeServidor(st.mazo_b || [], st.equipo_b) };
      let desde = 0, cola = [], ultimaH = null, vivo = true, cerrando = false, enVuelo = 0, ultimaLlamada = 0, temporizador = null;
      // UNA llamada a la vez (si van varias a la vez, el servidor les da el mismo número de orden y falla con «duplicate key … pvp_jugadas_pkey»). Cada turno sale en cuanto está listo;
      // en cuanto vuelve una respuesta, si hay algo en cola se manda ya, y si no, se pregunta cada 250 ms por lo del rival.
      const bucle = async () => {
        if (!vivo || enVuelo >= 1) return;
        enVuelo++; ultimaLlamada = Date.now();
        const items = cola.splice(0, 20), ult = items.length ? items[items.length - 1] : null; if (ult && ult.h) ultimaH = { k: ult.k, h: ult.h };
        try {
          const tr0 = performance.now();
          const r = await CUENTA.rpc('pvp_jugar', { p_sala: sala, p_jugadas: items.map(({ n, ...it }) => it), p_desde: desde, p_tick_huella: ultimaH ? ultimaH.k : null, p_huella: ultimaH ? parseInt(ultimaH.h, 16) : null });
          const dtr = performance.now() - tr0; PVP.rtt = PVP.rtt ? PVP.rtt * 0.8 + dtr * 0.2 : dtr; PVP.rttMax = Math.max(PVP.rttMax || 0, dtr); PVP.llamadas = (PVP.llamadas || 0) + 1;   // lo que tarda cada llamada al servidor (se ve en desarrollo)
          for (const x of (r && r.rival) || []) { if (x.s > desde) desde = x.s; if (x.d.v !== VERSION) { PVP.error = 'version'; pvpEstado('error'); continue; } if (x.d.d != null && x.d.d !== PVP.D) { PVP.error = 'retardo'; pvpEstado('error'); continue; } pvpRecibir(pvpDeServidor(x.d, seat === 'p' ? 'e' : 'p')); }   // otra versión del juego = otra simulación: no se puede seguir
          if (r && r.desync) pvpEstado('desync');
        } catch (e) {   // sin conexión: se repite; el motor avisa de la espera y, al final, del abandono
          PVP.fallos = (PVP.fallos || 0) + 1; PVP.ultimoError = String((e && e.message) || e).slice(0, 80);
          if (/duplicate key|pvp_jugadas_pkey/i.test(PVP.ultimoError)) items.length = 0;   // el servidor ya tiene esos mensajes (la respuesta se perdió): no se mandan otra vez
          for (const it of items) it.n = (it.n || 0) + 1;
          cola.unshift(...items.filter(it => it.n < 8));   // un mensaje que el servidor rechaza una y otra vez se descarta, para que no bloquee a los demás
        }
        enVuelo--;
        if (vivo && cola.length) bucle();   // lo que se ha encolado mientras esperábamos sale ya
      };
      // cerrar la partida: ganador ('p' o 'e' del motor) → el servidor decide los puntos; si el rival aún no ha cerrado se vuelve a preguntar
      const cerrar = async (ganadorEquipo, huella, alResultado, stats) => {
        if (cerrando) return; cerrando = true; vivo = false; clearInterval(temporizador);
        if (stats) CUENTA.rpc('pvp_anotar', { p_sala: sala, p_stats: stats }).catch(() => { /* son solo cifras para curiosear */ });
        const g = ganadorEquipo === 'p' ? 'a' : 'b';
        for (let i = 0; i < 30; i++) {
          try { const r = await CUENTA.rpc('pvp_cerrar', { p_sala: sala, p_ganador: g, p_huella: typeof huella === 'string' ? parseInt(huella, 16) : huella }); if (alResultado) alResultado(r); if (r && r.estado !== 'esperando') return; } catch (e) { if (alResultado) alResultado({ error: pvpErrorTexto(e) }); return; }
          await new Promise(res => setTimeout(res, PVP_SRV.cierreMs));
        }
      };
      aviso({ retardo: pvpRetardo(), seat, seed: st.semilla, equipos, rival: { nombre: st.rival || st.nombre_rival || 'Rival' }, red: { enviar: m => { cola.push(pvpAServidor(m)); bucle(); } }, cerrar, parar: () => { vivo = false; clearInterval(temporizador); } });
      bucle(); temporizador = setInterval(() => { if (Date.now() - ultimaLlamada >= 250) bucle(); }, 100);
    };
    sondeo();
    return { cancelar() { activo = false; clearTimeout(tic); if (!sala) CUENTA.rpc('pvp_salir', {}).catch(() => { /* ya no estaba en la cola */ }); } };
  },
  async resumen() { return CUENTA.rpc('pvp_resumen', {}); },   // partidas, unidades caídas, hechizos y CAOS de la última hora
  async clasificacion(modo) { return CUENTA.rpc('pvp_clasificacion', { p_juego: AJUSTES.id, p_modo: modo }); },
};
