// Fans of Rouflage · LA ECONOMÍA CON SERVIDOR: lo que hacen en servidor (servidor.js) las acciones de economia.js, diario.js, tienda.js, armario.js y gacha-pantalla.js.
// Cada una de esas funciones empieza con «if (RFS.activo()) return xServidor(...)»; sin servidor siguen con su versión local de siempre. Aquí solo se pide y se enseña:
// los precios, los topes y el reparto los pone el servidor (servidor/53-rouflage-cuenta.sql, cifras en servidor/datos/rouflage.sql). Va después de gacha-pantalla.js.
'use strict';

const nombrePieza = k => { const [c, i] = String(k).split(':'), it = arItem(c, i); return it ? tr(it.n) : k; };

// el final de una partida: enseña lo que dará (con las mismas cuentas que el servidor) y lo manda; la cartera la pone la respuesta del servidor
function economiaPartidaServidor(r) {
  if (!armarioVisible() || !J.yo) return;
  // ×2 solo en BUSCAR PARTIDA (las salas con amigos y contra bots se pueden llenar de bots)
  const linea = J.pvp && !(RFP.info && RFP.info.privada), e = SAVE.eco || {}, hoyGotas = e.dia === gachaMadrid().fecha ? e.gotasHoy || 0 : 0;
  const quiere = (ECO.gotas + (r.victoria ? ECO.gotasGanar : 0)) * (linea ? ECO.linea : 1), gotas = Math.max(0, Math.min(quiere, ECO.topeDia - hoyGotas));
  const xp = Math.round((ECO.xp + (r.victoria ? ECO.xpGanar : 0)) * (linea ? ECO.xpLinea : 1)), nivel = Math.min(ECO.niveles, 1 + Math.floor((ecoEstado().xp + xp) / ECO.xpNivel));
  r.filas.push([tr('Gotas'), gotas ? '+' + gotas : tr('tope de hoy')]);
  r.filas.push([tr('Pase de temporada'), tr('nivel {n}', { n: nivel }) + ' (+' + xp + ' XP)']);
  RFS.partida(r.victoria, linea);
}
// el premio diario: lo da el servidor (la fecha es la de Madrid)
async function diarioRecogeServidor() {
  if (!diarioPuede()) return;
  try {
    const est = await RFS.llama('rf_diario');
    const pr = est.premio || [], perdida = (pr.find(h => h.perdida) || {}).perdida;      // la racha (servidor/81-rouflage-racha.sql): sus apuntes no son premio
    const texto = pr.filter(h => h.gotas || h.pieza).map(h => h.deRacha && h.gotas ? tr('{n} Gotas de racha', { n: h.gotas }) : h.gotas && !h.repetida && !h.pieza ? tr('{n} Gotas', { n: h.gotas }) : h.pieza ? nombrePieza(h.pieza) : tr('{n} Gotas', { n: h.gotas }) + ' (' + nombrePieza(h.repetida) + ')').join(' + ');
    play('select'); play('go'); avisa(tr('Premio del día: {p}', { p: texto }), 'bueno'); diarioPinta(); diarioBoton();
    if (perdida) setTimeout(() => abreRescate(perdida), 900); else if ((diarioEstado().racha || 0) >= 2) avisosOfrece();
  } catch (e) { RFS.error(e); }
}
// comprar una pieza en el armario con la moneda elegida: rf_comprar_con (servidor/65-*.sql) cobra el precio de los datos del juego, no el del cliente.
// Devuelve una promesa con true si se ha comprado (la ventana de confirmar se cierra entonces)
async function arCompraServidor(cat, it, moneda) {
  const pr = arPrecio(it); if (!pr || arTiene(cat.id, it) || !(moneda in pr)) return false;
  if (SAVE[moneda] < pr[moneda]) { play('deny'); avisa(moneda === 'gotas' ? tr('Te faltan gotas: juega partidas y recoge el premio diario') : tr('No tienes bastantes Acciones'), 'malo'); return false; }
  try {
    const pieza = cat.id + ':' + it.id, deAntes = moneda === 'gotas' ? it.de === 'gotas' : it.de === 'tienda' && !pr.gacha;      // lo que ya vendía rf_comprar
    try { await RFS.llama('rf_comprar_con', { p_pieza: pieza, p_moneda: moneda }); }
    catch (e) { if (deAntes && /Could not find|PGRST202/i.test(String((e && e.message) || e))) await RFS.llama('rf_comprar', { p_pieza: pieza }); else throw e; }   // servidor sin el 65 todavía
    if (!cat.conjuntos && !arMira(cat)) armarioEstado().puesto[cat.id] = it.id;
    guardaPartida(); play('crown'); avisa(tr('¡{n} es tuyo!', { n: tr(it.n) }), 'bueno'); arPintaTodo();
    return true;
  } catch (e) { RFS.error(e); return false; }
}
// la tienda: paquetes de Acciones y pack de inicio (de prueba), y Acciones a cambio de Gotas
async function tiendaServidor(tipo, idx, texto) {
  if (tipo !== 'canje') return MONEDAS.recomiendaCuenta(() => tiendaServidorHecha(tipo, idx, texto));
  return tiendaServidorHecha(tipo, idx, texto);
}
async function tiendaServidorHecha(tipo, idx, texto) {
  try {
    if (tipo === 'canje') { await RFS.llama('rf_cambiar', { p_idx: idx }); play('crown'); avisa(tr('+{n} Acciones', { n: TIENDA.canje[idx].n }), 'bueno'); }
    else { await RFS.llama('rf_tienda_prueba', { p_tipo: tipo, p_idx: idx }); play('crown'); avisa(tr('¡Comprado! {c}', { c: texto }) + ' · ' + tr('Te invita {quien}', { quien: INVITA_TIENDA }), 'bueno'); }
    tiendaPinta();
  } catch (e) { RFS.error(e); }
}
async function pasePremiumServidor() {
  if (ecoEstado().premium) return;
  if (SAVE.acciones < ECO.premium) { play('deny'); avisa(tr('No tienes bastantes Acciones para el pase premium'), 'malo'); abreTienda('pase'); return; }
  try {
    const est = await RFS.llama('rf_pase_premium'), g = est.ganado || {}, n = (g.piezas || []).map(nombrePieza);
    play('crown'); avisa(tr('¡Pase premium activado!') + (n.length ? ' ' + n.join(', ') : ''), 'bueno'); pasePinta(); if (!E('p-tienda').hidden) tiendaPinta();
  } catch (e) { RFS.error(e); }
}
// el gachapón: tira el servidor. Devuelve una promesa con lo mismo que gachaTira
async function gachaTiraServidor(n, gratis) {
  const est = gratis ? await RFS.llama('rf_gacha_gratis', { p_tipo: gratis }) : await RFS.llama('rf_gacha_tirar', { p_n: n });
  return est.sale.map(s => { const [cat, id] = s.pieza.split(':'); return { cat, it: arItem(cat, id), nuevo: s.nuevo, devuelve: s.devuelve }; });
}
