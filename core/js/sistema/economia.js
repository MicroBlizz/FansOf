// Fans Of · ECONOMÍA: el único sitio por donde entran y salen el oro, las gemas y las entradas del gashapón.
//
// Ningún código escribe SAVE.gold, SAVE.gems ni SAVE.tickets directamente: pide ECO.ganar o ECO.gastar con el motivo.
// Hoy hay un solo motor (local: apunta en la partida guardada, igual que antes). Cuando haya recursos en la nube
// (PLAN-CUENTAS.md, puntos 14 y 15) se cambia el motor aquí y los juegos no se enteran.
// Ni ganar ni gastar guardan la partida ni repintan la cartera: eso lo sigue haciendo quien llama (saveGame, updateWallets).
'use strict';
// Lo máximo que el servidor deja ganar por cada motivo (PLAN-CUENTAS.md, 15.13): vez = por cobro, dia = en 24 h (todas las vezes juntas), unica = una sola vez por cuenta.
// Son topes generosos para cortar las trampas gordas, no el cálculo del premio; se afinan con lo que apunte el servidor (movimientos.nota guarda lo recortado).
// Cada juego añade los suyos en AJUSTES.topes. herramientas/subir_datos.py los sube a tablas_juego.datos.topes.
const TOPES_COMUNES = {
  mision: { vez: { gold: 2000, gems: 200 }, dia: { gold: 20000, gems: 1000 }, calcula: 'mision' },   // el servidor da lo de premios.mision, una vez por misión y periodo
  premio: { vez: { gold: 20000, gems: 30000, tickets: 30 }, dia: { gold: 100000, gems: 40000, tickets: 60 }, calcula: ['logros', 'login', 'pase', 'pase-pvp'] },   // logros, racha de días y pase de batalla: el servidor pone la cantidad y comprueba que se pueda cobrar
  'compra-pase': { vez: {}, dia: {}, calcula: 'pase-premium' },
  'compra-pase-pvp': { vez: {}, dia: {}, calcula: 'pase-pvp-premium' },   // el Pase del Pase (compra de prueba del pase PvP)
  objeto: { vez: {}, dia: {}, calcula: 'objeto' },   // regalos de un objeto (starter, mito, facitem, cafe): el servidor comprueba que sean posibles y los apunta una vez   // el pase Ejecutivo (compra de prueba)
  'horas-extra': { vez: { gold: 150000, gems: 5000 }, dia: { gold: 600000, gems: 20000 }, calcula: 'horas' },   // el servidor limita lo cobrado al tiempo que ha pasado desde el cobro anterior
  'regalo-diario': { vez: { gold: 300, gems: 20 }, dia: { gold: 600, gems: 40 }, fijo: 'gift', diario: true },   // fijo: el servidor da SIEMPRE lo de premios.gift, una vez por día (hora de Madrid)
  compra: { vez: { gold: 100000, gems: 10000 }, dia: { gold: 1000000, gems: 100000 } },   // la tienda de prueba (no cobra); desaparece cuando haya pagos reales
  pruebas: { vez: { gold: 3000000, gems: 5000 }, dia: { gold: 12000000, gems: 20000 } },   // modo pruebas de quien desarrolla
  'quitar-pruebas': { vez: {}, dia: {} },   // solo restas
  gachapon: { vez: {}, dia: {} }, 'retirar-numeros': { vez: {}, dia: {} }, 'mejorar-carta': { vez: {}, dia: {} },   // gastos que cuenta un juego que aún los hace aquí: solo restas
  despedir: { vez: { gold: 1000000 }, dia: { gold: 5000000 } },   // oro de despedir copias (el juego con servidor lo calcula allí)
};
const ECO = {
  topes: () => Object.assign({}, TOPES_COMUNES, AJUSTES.topes || {}),
  // motivo: para qué es (ahora solo documenta; el servidor lo apuntará en el libro de movimientos)
  // v: { gold, gems, tickets }, cada uno opcional
  ganar(motivo, v, evento) { return ECO.motor.mover(motivo, v, 1, evento); },   // devuelve la clave con la que se manda al servidor (o nada si no se manda)   // evento: lo que ha pasado (el servidor calcula el premio con él si sabe), p. ej. { tipo: 'camp', nivel, dif, estrellas, victoria, jefe }
  gastar(motivo, v) { ECO.motor.mover(motivo, v, -1); },
  // ¿esta acción la hace el servidor? Solo si el juego lo pide (AJUSTES.servidor) y hay cuenta activa; si no, se calcula aquí como siempre
  servidor(accion) { return typeof CUENTA !== 'undefined' && CUENTA.activa && typeof ECO_SOMBRA !== 'undefined' && !!(AJUSTES.servidor && AJUSTES.servidor[accion]); },
  ya() { if (typeof ECO_SOMBRA !== 'undefined') ECO_SOMBRA.enviar(); },   // mandar ahora lo pendiente (cuando se espera algo del servidor, como objetos)
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
    mover(motivo, v, signo, evento) {
      if (v.gold) SAVE.gold += signo * v.gold;
      if (v.gems) SAVE.gems += signo * v.gems;
      if (v.tickets) SAVE.tickets = (SAVE.tickets || 0) + signo * v.tickets;
      if (typeof ECO_SOMBRA !== 'undefined') return ECO_SOMBRA.anota(motivo, v, signo, evento);   // economia-sombra.js: el servidor lo apunta y lo valida
    },
  },
};
