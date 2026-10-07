// Fans Of · ECONOMÍA: el único sitio por donde entran y salen el oro, las gemas y las entradas del gashapón.
//
// Ningún código escribe SAVE.gold, SAVE.gems ni SAVE.tickets directamente: pide ECO.ganar o ECO.gastar con el motivo.
// Hoy hay un solo motor (local: apunta en la partida guardada, igual que antes). Cuando haya recursos en la nube
// (PLAN-CUENTAS.md, puntos 14 y 15) se cambia el motor aquí y los juegos no se enteran.
// Ni ganar ni gastar guardan la partida ni repintan la cartera: eso lo sigue haciendo quien llama (saveGame, updateWallets).
'use strict';
const ECO = {
  // motivo: para qué es (ahora solo documenta; el servidor lo apuntará en el libro de movimientos)
  // v: { gold, gems, tickets }, cada uno opcional
  ganar(motivo, v) { ECO.motor.mover(motivo, v, 1); },
  gastar(motivo, v) { ECO.motor.mover(motivo, v, -1); },
  // ¿esta acción la hace el servidor? Solo si el juego lo pide (AJUSTES.servidor) y hay cuenta activa; si no, se calcula aquí como siempre
  servidor(accion) { return typeof CUENTA !== 'undefined' && CUENTA.activa && typeof ECO_SOMBRA !== 'undefined' && !!(AJUSTES.servidor && AJUSTES.servidor[accion]); },
  errorTexto(e) {
    const m = String((e && e.message) || e);
    return /faltan_gemas/.test(m) ? 'Te faltan gemas' : /falta_oro/.test(m) ? 'Te falta oro' : /falta_xp/.test(m) ? 'Todavía te falta experiencia'
      : /copia_no_existe|nada_que_despedir|no_se_puede/.test(m) ? 'Esa copia no está en tu cuenta (viene de antes de la nube o del modo pruebas)' : 'Necesitas conexión para esto';
  },
  // llamar a una función del servidor: antes se manda lo pendiente (y la cuenta se migra y concilia); después el saldo y las garantías del servidor mandan
  async pedir(rpc, params) {
    await ECO_SOMBRA.vaciar();
    const r = await CUENTA.rpc(rpc, Object.assign({ p_juego: AJUSTES.id, p_clave: ECO_SOMBRA.id() }, params));
    SAVE.gold = r.oro; SAVE.gems = r.gemas; SAVE.tickets = r.entradas; if (r.garantia) Object.assign(SAVE.pity, r.garantia);
    ECO_SOMBRA.apuntaLocal(r);
    return r;
  },
  // el servidor tira (n = 1, 10 o 50) y devuelve las copias nuevas
  async tirar(maquina, n) {
    const desbloqueadas = typeof FACTION_ORDER !== 'undefined' && typeof isUnlocked === 'function' ? FACTION_ORDER.filter(f => isUnlocked(f)) : [];
    const X = typeof MAQUINAS !== 'undefined' && MAQUINAS[maquina];   // una máquina de un juego trae su propia función del servidor (X.rpc)
    const r = X && X.rpc ? await ECO.pedir(X.rpc, { p_n: n, p_desbloqueadas: desbloqueadas }) : await ECO.pedir('tirar', { p_maquina: maquina, p_n: n, p_desbloqueadas: desbloqueadas });
    return r.resultados;
  },
  despedir(uids) { return ECO.pedir('despedir', { p_uids: uids }); },            // -> { despedidas, oro_ganado }
  retirarNumeros(uid) { return ECO.pedir('retirar_numeros', { p_uid: uid }); },   // -> { q: [calidades nuevas] }
  mejorar(carta, xp) { return ECO.pedir('mejorar_carta', { p_carta: carta, p_xp: Math.floor(xp) }); },   // -> { nivel, xp_gastada }
  motor: {
    mover(motivo, v, signo) {
      if (v.gold) SAVE.gold += signo * v.gold;
      if (v.gems) SAVE.gems += signo * v.gems;
      if (v.tickets) SAVE.tickets = (SAVE.tickets || 0) + signo * v.tickets;
      if (typeof ECO_SOMBRA !== 'undefined') ECO_SOMBRA.anota(motivo, v, signo);   // modo sombra (economia-sombra.js): el servidor lo apunta, sin mandar
    },
  },
};
