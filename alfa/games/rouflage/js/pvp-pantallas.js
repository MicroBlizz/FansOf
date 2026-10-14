// Fans of Rouflage (prototipo) · PvP, LAS PANTALLAS: el menú del PvP (con el caos primordial y la cuenta), la sala llenándose (quién hay y qué papel te toca), la clasificación, la
// explicación y la ventana de la cuenta. Todo en HTML encima del lienzo (index.html); aquí se rellena y se conecta. La lógica está en pvp.js y pvp-sync.js.
'use strict';

// ---------- la cuenta: la fila de core (guardar con Google o email, entrar, cerrar sesión) en una ventana ----------
const CAJA_CUENTA = document.createElement('section'); CAJA_CUENTA.id = 'rf-cuenta'; CAJA_CUENTA.className = 'screen modal'; CAJA_CUENTA.hidden = true;
document.body.appendChild(CAJA_CUENTA);
function abreCuenta() {
  if (!window.filaCuenta) return;
  CAJA_CUENTA.innerHTML = '<div class="modal-card"><h3 class="ol">' + tr('CUENTA') + '</h3><div class="opt-list"></div><button class="btn-ghost ol" id="rf-cuenta-ok">' + tr('VOLVER') + '</button></div>';
  CAJA_CUENTA.querySelector('.opt-list').appendChild(window.filaCuenta);
  CAJA_CUENTA.hidden = false;
  E('rf-cuenta-ok').onclick = () => { play('select'); CAJA_CUENTA.hidden = true; if (!E('p-pvp').hidden) pvpPintaMenu(); };
}
hook('cuenta', () => { if (!CAJA_CUENTA.hidden) abreCuenta(); });

// ---------- el menú ----------
function pvpMuestra(id) {
  pantalla(id);
  if (id === 'p-pvp') pvpPintaMenu();
  else if (id === 'p-busca') pvpPintaBusca();
}
function pvpPintaMenu() {
  const err = E('pvp-error'); err.hidden = !RFP.error; err.textContent = RFP.error ? tr(RFP.error) : '';
  E('b-pvp-buscar').textContent = rfpSalaGuardada() ? tr('VOLVER A LA PARTIDA') : tr('BUSCAR PARTIDA');      // si te dejaste una partida abierta, buscar te devuelve a ella
  E('b-pvp-cuenta').hidden = RFRED.esLocal() || RFRED.vinculada();
  pvpPendientes();
}
// partidas de las que te retiraste de espectador: cómo acabaron y qué te tocó (el servidor te las apunta cuando alguien cierra la sala; se cuentan una sola vez)
function pvpPendientes() {
  const caja = E('pvp-pendiente'); if (!RFRED.red.pendientes || !RFRED.vinculada()) return;
  Promise.resolve(RFRED.red.pendientes()).then(lista => {
    if (!Array.isArray(lista) || !lista.length) return;
    caja.hidden = false;
    caja.textContent = lista.map(p => p.abandono ? tr('Abandonaste una partida') + ' · ' + p.delta + ' ' + tr('puntos') : (p.gano ? tr('Tu bando ganó la partida que dejaste') : tr('Tu bando perdió la partida que dejaste')) + ' · ' + (p.delta > 0 ? '+' : '') + p.delta + ' ' + tr('puntos') + (p.energia_premio > 0 ? ' · +' + p.energia_premio + ' ' + tr('de caos primordial') : '')).join('\n');
    setTimeout(() => { caja.hidden = true; }, 12000);
  }).catch(() => { /* sin red: ya saldrá la próxima vez */ });
}
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// la sala: quién hay y, cuando arranca, el papel de cada uno
function pvpPintaBusca() {
  const i = RFP.info, lista = E('busca-lista');
  if (!i) { E('busca-titulo').textContent = tr('BUSCANDO PARTIDA'); E('busca-sub').textContent = ''; lista.innerHTML = ''; return; }
  const jug = i.jugadores || [], jugando = i.estado !== 'espera', mio = jug.find(j => j.yo);
  E('busca-titulo').textContent = jugando ? tr('¡EMPIEZA LA PARTIDA!') : tr('SALA: {n} DE {max}', { n: i.n, max: i.max });
  E('busca-sub').textContent = jugando ? (mio && mio.rol === 'cazador' ? tr('Te toca de CAZADOR') : tr('Te toca de CAMALEÓN'))
    : i.faltan != null ? tr('Empieza en {t} s, o en cuanto se llene', { t: i.faltan }) : tr('Esperando a otro jugador. Mientras estás solo, el reloj no corre.');
  const hueco = Math.max(0, (i.max || 10) - jug.length);
  lista.innerHTML = jug.map(j => `<li class="${j.yo ? 'yo' : ''}"><i class="${j.rol === 'cazador' ? 'caz' : j.rol === 'camaleon' ? 'cam' : 'esp'}"></i><span>${esc(j.nombre)}</span>${j.rol ? `<small>${j.rol === 'cazador' ? tr('CAZADOR') : tr('CAMALEÓN')}</small>` : ''}</li>`).join('')
    + (hueco ? `<li class="maquina"><i class="esp"></i><span>${tr('+ {n} de la máquina', { n: hueco })}</span></li>` : '');
  E('b-busca-cancelar').hidden = jugando;
}
// la clasificación (los 20 primeros y tu sitio)
function pvpClasificacion() {
  pantalla('p-clasif'); E('clasif-lista').innerHTML = ''; E('clasif-yo').textContent = tr('Cargando…');
  Promise.resolve(RFRED.red.clasificacion()).then(r => {
    const y = r && r.yo; E('clasif-yo').textContent = y ? tr('Tienes {p} puntos (puesto {n})', { p: y.puntos, n: y.puesto }) : tr('Todavía no has jugado ninguna partida PvP.');
    E('clasif-lista').innerHTML = ((r && r.lista) || []).map((f, k) => `<li class="${f.yo ? 'yo' : ''}"><span class="pos">${k + 1}</span><span class="nom">${esc(f.nombre)}<small>${tr('{g} ganadas de {j}', { g: f.ganadas, j: f.jugadas })}</small></span><b>${f.puntos}</b></li>`).join('');
  }).catch(e => { E('clasif-yo').textContent = tr(RFRED.errorTexto(e)); });
}
// los puntos que ha dado la partida, en la pantalla final (llegan del servidor un poco después)
function pvpResultadoExtra() {
  const p = E('fin-pvp'), r = RFP.resultado; if (!p || !J.pvp || !r) return;
  p.hidden = false; p.classList.toggle('mal', !!r.error);
  p.textContent = r.error ? tr(r.error) : r.delta != null && r.puntos != null ? tr('PvP: {p} puntos ({d})', { p: r.puntos, d: (r.delta >= 0 ? '+' : '') + r.delta }) : '';
}

function preparaPvp() {
  E('b-pvp').onclick = () => { audioInit(); play('select'); RFP.error = ''; pvpMuestra('p-pvp'); };
  E('b-cuenta').onclick = () => { play('select'); abreCuenta(); };
  E('b-pvp-cuenta').onclick = () => { play('select'); abreCuenta(); };
  E('b-pvp-buscar').onclick = () => { play('select'); pvpBuscar(); };
  E('b-pvp-clasif').onclick = () => { play('select'); pvpClasificacion(); };
  E('b-pvp-info').onclick = () => { play('select'); pantalla('p-pvp-info'); };
  E('b-pvp-volver').onclick = () => { play('select'); irTitulo(); };
  E('b-busca-cancelar').onclick = () => { play('select'); pvpCancelar(); };
  E('b-clasif-volver').onclick = () => { play('select'); pvpMuestra('p-pvp'); };
  E('b-info-ok').onclick = () => { play('select'); pvpMuestra('p-pvp'); };
  // ?pvp=local o ?pvp=abrir: entra directo en el menú del PvP (para probar)
  try { const q = new URLSearchParams(location.search).get('pvp'); if (q === 'local' || q === 'abrir') pvpMuestra('p-pvp'); } catch (_) { /* da igual */ }
}
