// Fans of Rumble · PvP: la pestaña CONTRA JUGADORES de la Arena (liga, buscar rival), avisos durante la partida y pantalla final
'use strict';
const pvpDisponible = () => NUCLEO.flag('pvp-estandar', 'PvP Estándar: abierto a los jugadores como beta (para cerrarlo: fila de la tabla flags con valor false)', true);
const pvpSalvaje = () => NUCLEO.flag('pvp-salvaje', 'PvP modo Salvaje (habilidades y objetos): sale a los jugadores cuando se quite este flag');
const PVP_UI = { modo: 'estandar', busca: null, t0: 0, tic: null, ia: 30 };   // ia: segundos de búsqueda tras los que se avisa de que hay poca gente
const PVP_MODOS = { estandar: ['Estándar', 'Cuentan tu mazo y el nivel y las estrellas de tus cartas. Los objetos y las habilidades no entran.'], salvaje: ['Salvaje', 'Cuenta todo lo que llevas puesto: las habilidades de tus cartas y el equipo de tu líder.'] };

// qué red se usa: la del servidor si hay cuenta vinculada; en desarrollo, sin cuenta (o con localStorage 'fansof-pvp-red' = 'local'), la de pruebas entre dos pestañas
function pvpRed() {
  let local = false; try { local = localStorage.getItem('fansof-pvp-red') === 'local'; } catch (e) { /* sin guardar */ }
  const srv = PVPNET.redes.servidor.disponible();
  if (srv && !local) return 'servidor';
  if (NUCLEO.desarrollo) return 'local';
  return 'servidor';   // sin cuenta vinculada: la búsqueda dirá qué falta
}
function pvpPantalla() {
  if (!pvpDisponible()) { const m = NUCLEO.flagMensaje('pvp-estandar'); if (m) toast(m); return; }   // si se cierra con la partida en marcha, no se toca: solo se impide empezar otra
  PVP_UI.modo = PVP_UI.modo || 'estandar'; PVPNET.actual = pvpRed(); pvpPara(); SAVE.arenaTab = 'pvp';
  $('#scr-pvp').classList.remove('fac-abierta'); show('scr-pvp'); pvpPinta(); pvpClasificacion();   // v0.9.109: la cuenta se pide al BUSCAR RIVAL, no al entrar
}

/* ---------- v0.9.109: tus copas (los puntos del servidor), tu récord y tu liga ---------- */
function pvpMio(modo) {
  const P = SAVE.pvp || (SAVE.pvp = {}), m = modo || 'estandar';
  return P[m] || (P[m] = { copas: null, best: 0, w: 0, l: 0, racha: 0 });
}
const pvpCopas = modo => { const c = pvpMio(modo).copas; return c == null ? 1000 : c; };   // sin partidas: las 1000 con las que empieza el servidor
// al cerrarse una partida (una vez por partida): copas nuevas, récord, racha y las misiones de la Arena
let pvpAnotado = '';
function pvpAnota(r) {
  if (!r || r.error || r.estado !== 'cerrada' || !PVP.fin) return null;
  const k = PVP.fin.h + ':' + PVP.rival; if (pvpAnotado === k) return pvpAnota.ult; pvpAnotado = k;
  const M = pvpMio(PVP.modo), antes = pvpCopas(PVP.modo);
  if (r.puntos != null) { M.copas = r.puntos; M.best = Math.max(M.best, r.puntos); }
  if (r.empate) M.racha = 0; else if (r.gano) { M.w++; M.racha++; } else { M.l++; M.racha = 0; }
  if (!r.empate && r.gano) { missionEvent('arenawin', 1); stat('pvpwin', 1); if (typeof S === 'object' && S && S.e && S.e.crowns >= 2) stat('pvpcomeback', 1); }   // v0.9.112: logros del PvP
  missionEvent('arena', 1);
  saveGame();
  return (pvpAnota.ult = { d: r.puntos != null ? r.puntos - antes : null, copas: pvpCopas(PVP.modo) });
}
function pvpPintaLiga() {
  const M = pvpMio(PVP_UI.modo), c = pvpCopas(PVP_UI.modo), li = arenaLeagueIdx(c), L = ARENA.leagues[li][0];
  const racha = M.racha >= 2 ? ` · <span class="ar-streak">${FLAME_SVG}Racha ${M.racha}</span>` : '';
  $('#pvp-liga').innerHTML = `<div class="ar-liga">${arenaShield(li)}<div class="ar-ld"><b class="ar-ln ol">LIGA ${L.toUpperCase()}</b><span class="ar-cups ol">${CROWN_SVG}${fmt(c)} copas</span>`
    + `<span class="ar-meta">${esc(pname())} · Récord ${fmt(Math.max(M.best, c))} · ${M.w} ganadas · ${M.l} perdidas${racha}</span>${arenaBar(c, li)}</div></div>`;
}

async function pvpResumen() {
  const c = $('#pvp-resumen'); c.hidden = true;
  if (PVPNET.actual !== 'servidor' || !PVPNET.redes.servidor.disponible()) return;
  try {
    const r = await PVPNET.redes.servidor.resumen(); if (!r || $('#scr-pvp').hidden) return;
    c.innerHTML = `<i class="ar-vivo"></i>${`Partidas en la última hora: ${fmt(r.hora)}`}`; c.hidden = false;
  } catch (e) { /* sin conexión: sin resumen */ }
}
// la clasificación, en corto: los 3 primeros y tú
async function pvpClasificacion() {
  pvpResumen();
  const caja = $('#pvp-clasif'), cab = `<div class="pvp-cl-cab"><span class="ol">CLASIFICACIÓN</span><button class="btn-link" id="btn-pvp-salon">Ver entera</button></div>`;
  const pinta = filas => { caja.innerHTML = `<div class="pvp-cl">${cab}${filas}</div>`; $('#btn-pvp-salon').onclick = () => { play('select'); pvpPara(); openSalon('pvp'); }; };
  if (PVPNET.actual !== 'servidor' || !PVPNET.redes.servidor.disponible()) { pinta('<p class="pvp-cl-nada">Entra con tu cuenta para ver la clasificación.</p>'); return; }
  pinta('<p class="pvp-cl-nada">Cargando…</p>');
  try {
    const modo = PVP_UI.modo, l = (await PVPNET.redes.servidor.clasificacion(modo)) || [];
    const yo = l.findIndex(r => r.yo);
    if (yo >= 0 && l[yo].puntos != null) { const M = pvpMio(modo); M.copas = l[yo].puntos; M.best = Math.max(M.best, M.copas); saveGame(); if (!$('#scr-pvp').hidden) pvpPintaLiga(); }   // tus copas, al día con el servidor
    const fila = (r, i) => `<div class="pvp-fila${r.yo ? ' yo' : ''}"><b class="p${i + 1}">${i + 1}</b>${r.look && typeof lookCanvas === 'function' ? lookCanvas(r.look, 40) : ''}<span>${esc(r.nombre)}${r.yo ? ' (tú)' : ''}${r.look && r.look.titulo ? tituloHtml(r.look.titulo, 'pvp-tt') : ''}</span><i>${fmt(r.puntos)} copas · ${arenaLeague(r.puntos)}</i></div>`;
    const filas = l.slice(0, 3).map(fila).join('') + (yo >= 3 ? fila(l[yo], yo) : '');
    if (modo === PVP_UI.modo) pinta(filas || '<p class="pvp-cl-nada">Todavía no hay nadie en la clasificación.</p>');
    if (typeof pintaLooks === 'function') pintaLooks(caja);   // v0.9.110: con su marco
  } catch (e) { pinta('<p class="pvp-cl-nada">Sin conexión: no se puede ver la clasificación.</p>'); }
}
function pvpPinta() {
  const f = G.faction, F = FACTIONS[f], buscando = !!PVP_UI.busca, eq = pvpEquipo(PVP_UI.modo), abierta = $('#scr-pvp').classList.contains('fac-abierta');
  if (!pvpSalvaje()) PVP_UI.modo = 'estandar';   // sin Salvaje abierto, solo Estándar
  arenaTabs('pvp'); $('#scr-pvp').classList.toggle('buscando', buscando);
  for (const b of document.querySelectorAll('#scr-pvp [data-pm]')) { b.setAttribute('aria-pressed', String(b.dataset.pm === PVP_UI.modo)); b.disabled = buscando; b.hidden = b.dataset.pm === 'salvaje' && !pvpSalvaje(); }
  $('#pvp-sub').textContent = PVP_MODOS[PVP_UI.modo][1];
  pvpPintaLiga();
  // la facción se elige aquí mismo (botón FACCIÓN): salen todas y las que aún no tienes, en gris
  const facs = $('#pvp-facs'); facs.hidden = !abierta || buscando;
  facs.innerHTML = FACTION_ORDER.filter(x => FACTIONS[x].leader).map(x => `<button class="diff-opt fac-opt${isUnlocked(x) ? '' : ' locked'}" data-pf="${x}" aria-pressed="${x === f}" style="--fc: ${FAC_COLOR[x]}"><canvas data-pfl="${FACTIONS[x].leader}"></canvas><b class="ol">${FACTIONS[x].name}</b>${isUnlocked(x) ? '' : '<span class="lock">BLOQUEADA</span>'}</button>`).join('');   // 5 y 5, como la lista del entrenamiento
  for (const cv of facs.querySelectorAll('canvas')) drawArt(cv, cv.dataset.pfl, 40, 32);
  for (const bt of facs.querySelectorAll('button')) bt.addEventListener('click', () => { if (PVP_UI.busca || bt.dataset.pf === G.faction) return; if (!isUnlocked(bt.dataset.pf)) { play('deny'); toast('Aún no has desbloqueado esta facción', true); return; } play('select'); setFaction(bt.dataset.pf); pvpPinta(); });
  $('#pvp-equipo').innerHTML = arenaFacFila(f, eq.deck, abierta, 'pv'); arenaFacArte($('#pvp-equipo'), 'pv');
  $('#pvp-equipo [data-ar-fac]').onclick = () => { play('select'); $('#scr-pvp').classList.toggle('fac-abierta'); pvpPinta(); };
  $('#pvp-equipo [data-ar-mazo]').onclick = () => { play('select'); openDeck(G.faction, 'scr-pvp'); };
  const pase = typeof PASS_PVP !== 'undefined' && PASS_PVP ? ' · puntos del Pase PvP' : '';
  $('#pvp-premio').innerHTML = `<span>Si ganas: <b>unas +12 copas${pase}</b></span><span class="lose">Si pierdes: unas −12 copas</span>`;
  pvpPintaBusca();
  const b = $('#btn-pvp-buscar'); b.textContent = buscando ? 'CANCELAR' : 'BUSCAR RIVAL'; b.className = (buscando ? 'btn-ghost' : 'btn-big') + ' ol';
  if (!buscando && !$('#pvp-estado').dataset.fijo) $('#pvp-estado').textContent = NUCLEO.desarrollo ? `Red: ${PVPNET.redes[PVPNET.actual].nombre}${typeof PVP_SRV !== 'undefined' && PVP_SRV.ultimo ? ' [' + PVP_SRV.ultimo + ']' : ''}` : '';
}
// mientras buscas: tu líder con ondas contra un «?», el reloj y la oferta de entrenar
function pvpPintaBusca() {
  const c = $('#pvp-busca'), buscando = !!PVP_UI.busca; c.hidden = !buscando;
  if (!buscando) { c.innerHTML = ''; return; }
  if (c.dataset.hecho === String(PVP_UI.t0)) return; c.dataset.hecho = String(PVP_UI.t0);
  const F = FACTIONS[G.faction], co = pvpCopas(PVP_UI.modo);
  c.innerHTML = `<div class="pvp-bu"><span class="pvp-bu-t ol">${PVP_MODOS[PVP_UI.modo][0].toUpperCase()} · LIGA ${arenaLeague(co).toUpperCase()}</span>`
    + `<div class="pvp-vs"><div class="pvp-lado"><span class="pvp-yo"><i></i><i></i><i></i><canvas data-pbl="${F.leader}"></canvas></span><b class="ol">${esc(pname())}</b><small>${fmt(co)} copas</small></div>`
    + `<span class="pvp-vs-t ol-big">VS</span><div class="pvp-lado"><span class="pvp-otro"><b class="ol-big">?</b></span><b class="ol">Buscando…</b><small>un rival de verdad</small></div></div>`
    + `<span class="pvp-reloj ol-big" id="pvp-reloj">0:00</span><span class="pvp-bu-txt" id="pvp-bu-txt">Buscamos a alguien para jugar contigo. Puedes cancelar cuando quieras.</span></div>`
    + `<div class="ar-train pvp-bu-cpu">${ARENA_ROBOT}<span><b class="ol">¿Hay poca gente ahora?</b><small>Juega un entrenamiento contra la CPU. Da oro y cuenta para tus misiones.</small></span><button class="pvp-bu-btn ol" data-at="cpu">ENTRENAR</button></div>`
    + `<div class="pvp-bu-info"><b class="ol">MIENTRAS ESPERAS</b><span>Una partida PvP dura unos 4 minutos. Si te rindes, cuenta como derrota.</span></div>`;
  for (const cv of c.querySelectorAll('canvas[data-pbl]')) drawArt(cv, cv.dataset.pbl, 92, 80);
  c.querySelector('[data-at]').onclick = () => arenaIr('cpu');
}
function pvpPara() { if (PVP_UI.busca) { PVP_UI.busca.cancelar(); PVP_UI.busca = null; } clearInterval(PVP_UI.tic); if (!$('#scr-pvp').hidden) $('#scr-pvp').classList.remove('buscando'); }
function pvpBuscar() {
  if (PVP_UI.busca) { pvpPara(); delete $('#pvp-estado').dataset.fijo; pvpPinta(); return; }
  if (pvpRed() === 'servidor' && typeof pedirCuenta === 'function' && pedirCuenta('Para jugar PvP necesitas una cuenta: así tus victorias cuentan en la clasificación y nadie se hace pasar por ti.', 'pvp')) return;
  const modo = PVP_UI.modo; delete $('#pvp-estado').dataset.fijo; PVP_UI.t0 = Date.now(); play('select'); PVPNET.actual = pvpRed();
  if (PVPNET.actual === 'servidor' && !PVPNET.redes.servidor.disponible()) { toast(typeof CUENTA === 'undefined' || !CUENTA.activa ? 'El PvP necesita conexión' : 'Para jugar PvP necesitas vincular tu cuenta (Opciones → Cuenta)', true); return; }
  $('#scr-pvp').classList.remove('fac-abierta');
  PVP_UI.busca = PVPNET.redes[PVPNET.actual].buscar(modo, pvpEquipo(modo), pvpEncontrado);
  const dibuja = () => {
    const s = Math.floor((Date.now() - PVP_UI.t0) / 1000), r = $('#pvp-reloj'), t = $('#pvp-bu-txt');
    if (r) r.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    if (t && s >= PVP_UI.ia) t.textContent = 'Hay poca gente ahora mismo. Sigues en la cola.';
    $('#pvp-estado').textContent = NUCLEO.desarrollo && typeof PVP_SRV !== 'undefined' && PVP_SRV.ultimo ? '[' + PVP_SRV.ultimo + ']' : '';
  };
  pvpPinta(); dibuja(); PVP_UI.tic = setInterval(dibuja, 500);
}
function pvpEncontrado(r) {
  PVP_UI.busca = null; clearInterval(PVP_UI.tic);
  PVP.rival = r.rival.nombre; PVP.rivalLook = Object.assign({ nombre: r.rival.nombre }, r.rival.look || {}); PVP.modo = PVP_UI.modo; PVP.net = r; PVP.puntos = null;
  if (!pvpInicio({ seat: r.seat, seed: r.seed, equipos: r.equipos, red: r.red, retardo: r.retardo, conservar: true, alEstado: pvpAlEstado })) { toast('No se ha podido empezar la partida'); PVP_UI.modo = PVP_UI.modo; pvpFin(); goHome(); return; }
  pvpCaras();
}
// v0.9.110: durante la cuenta atrás, tu rival arriba y tú abajo, con vuestro marco y vuestro título (lo que ve el servidor: nadie presume de lo que no tiene)
function pvpCaras() {
  if (typeof lookCanvas !== 'function') { toast(`Rival: ${PVP.rival}`); return; }
  let el = $('#pvp-caras'); if (!el) { el = document.createElement('div'); el.id = 'pvp-caras'; el.setAttribute('aria-live', 'polite'); $('#ui').appendChild(el); }
  const tarjeta = (L, cls, quien) => `<div class="pvc ${cls}">${lookCanvas(L, 84)}<div class="pvc-t"><small class="ol">${quien}</small><b class="ol">${esc(L.nombre || 'Rival')}</b>${tituloHtml(L.titulo) || ''}</div></div>`;
  el.innerHTML = tarjeta(PVP.rivalLook || { nombre: PVP.rival }, 'rival', 'TU RIVAL') + tarjeta(miLook(), 'yo', 'TÚ');
  pintaLooks(el); el.className = ''; el.hidden = false;
  clearTimeout(pvpCaras.t); pvpCaras.t = setTimeout(() => { el.className = 'fuera'; pvpCaras.t = setTimeout(() => { el.hidden = true; }, 450); }, 3100);
}
// en la pantalla final: contra quién has jugado
const pvpCaraFin = () => (PVP.rivalLook && typeof lookCanvas === 'function' ? `<span class="pvc-fin">${lookCanvas(PVP.rivalLook, 52)}<span><small>CONTRA</small><b>${esc(PVP.rivalLook.nombre || PVP.rival || 'Rival')}</b>${tituloHtml(PVP.rivalLook.titulo) || ''}</span></span>` : '');

/* ---------- durante la partida ---------- */
function pvpAlEstado(e) {
  if (e === 'esperando') toast('Esperando al rival…');
  else if (e === 'jugando') { const t = document.getElementById('toast'); if (t && /Esperando/.test(t.textContent)) t.hidden = true; }
  else if (e === 'abandono' && G.state === 'play') endMatch(verEquipo(), 'abandono');   // el rival se ha ido (o se ha rendido): ganas
  else if ((e === 'desync' || e === 'error') && G.state === 'play') { if (PVP.error === 'version') toast('Tu rival tiene otra versión del juego: recarga la página', true); else if (PVP.error === 'retardo') toast('Tu rival usa otro retardo de red: partida anulada', true); endMatch(null, e); }   // la partida se anula: nadie gana ni pierde
}
// en PvP no hay pausa: el botón pregunta si quieres rendirte
function pvpRendirse() {
  if (G.state !== 'play') return;
  confirmBox('¿Rendirte?', 'Si te rindes, la partida cuenta como una derrota.', 'ME RINDO', () => {
    if (G.state !== 'play') return;
    try { if (PVP.red) PVP.red.enviar({ t: 'rendir' }); } catch (e) { /* aunque falle el aviso, te rindes igual */ }
    endMatch(PVP.peer, 'abandono');
  });
}

/* ---------- el final ---------- */
// v0.9.92: el pase PvP sube cuando el servidor da la partida por cerrada (una vez por partida); el servidor apunta lo mismo
let pvpPaseDado = '';
function pvpPase(r) {
  if (!r || r.error || r.estado !== 'cerrada' || typeof PASES === 'undefined' || !PASES.p || !PVP.fin) return;
  const k = PVP.fin.h + ':' + PVP.rival; if (pvpPaseDado === k) return; pvpPaseDado = k;
  const xp = r.gano ? PASS_PVP.xpWin : PASS_PVP.xpLose, up = pAddXp('p', xp); saveGame();
  const e = $('#end-pass'); if (e && !$('#scr-end').hidden) e.innerHTML = pFin('p') ? '' : `Pase PvP: +${xp} puntos${up ? ` · <b style="color:#ffe14d">¡NIVEL ${pLevel('p')}!</b>` : ''}`;
}
function pvpShowEnd() {
  const mi = verEquipo(), rival = PVP.peer, w = G.winner, gano = w === mi, perdio = w === rival, t = $('#end-title'), motivo = G.endReason;
  t.textContent = motivo === 'desync' || motivo === 'error' ? 'PARTIDA ANULADA' : gano ? '¡VICTORIA!' : perdio ? 'DERROTA' : 'EMPATE'; t.className = 'end-title ol-big ' + (gano ? 'win' : perdio ? 'lose' : '');
  $('#end-crowns').innerHTML = [0, 1, 2].map(i => `<span class="${i < S[mi].crowns ? 'on' : 'off'}">${CROWN_SVG}</span>`).join('');
  const rv = PVP.rival || 'tu rival';
  $('#end-sub').textContent = {
    base: gano ? `Has tirado la base de ${rv}.` : `${rv} ha tirado tu base.`,
    crowns: `Tiempo: ${S[mi].crowns} coronas contra ${S[rival].crowns}.`,
    hp: 'Empate a coronas: gana quien conserva más vida en sus torres.', draw: 'Mismas coronas y misma vida.',
    abandono: gano ? `${rv} se ha ido de la partida.` : 'Te has rendido.',
    desync: 'Las dos copias de la partida no coinciden. No cuenta para nadie.', error: 'No se ha podido seguir con la partida. No cuenta para nadie.',
  }[motivo] || '';
  const rw = $('#end-rewards'); rw.innerHTML = '';
  if (PVP.net && PVP.net.cerrar && G.winner && PVP.fin && motivo !== 'desync' && motivo !== 'error') {   // el servidor decide los puntos
    rw.innerHTML = '<div class="rw-xp">Esperando al servidor…</div>';
    const mi = verEquipo(), ot = PVP.peer, pl = S[mi].plays || {}, stats = { m: S[ot].kills, h: Object.keys(pl).filter(isSpell).reduce((n, k) => n + pl[k], 0), c: Math.round(S[mi].spent) };   // lo que ve este cliente: mis bajas por culpa del rival, mis hechizos y mi CAOS (los dos clientes suman el total)
    PVP.net.cerrar(G.winner, PVP.fin.h, r => { pvpPase(r); const an = pvpAnota(r); if ($('#scr-end').hidden) return; rw.innerHTML = r && r.error ? `<div class="rw-xp">${esc(r.error)}</div>` : r && r.puntos != null ? `<span class="rw-chip big ol">${an && an.d != null ? (an.d >= 0 ? '+' : '') + an.d + ' COPAS · ' : ''}${fmt(r.puntos)} · LIGA ${arenaLeague(r.puntos).toUpperCase()}</span>` : r && r.estado === 'esperando' ? '<div class="rw-xp">Esperando a que el rival confirme el resultado…</div>' : r && r.estado === 'discutida' ? '<div class="rw-xp">El resultado está en revisión: no cuenta por ahora.</div>' : ''; }, stats);
  } else rw.innerHTML = PVP.net && PVP.net.cerrar ? '<div class="rw-xp">Esta partida no cuenta para nadie.</div>' : '<div class="rw-xp">Partida de pruebas: de momento sin puntos ni premios.</div>';
  $('#end-pass').innerHTML = ''; $('#end-quote').innerHTML = pvpCaraFin() + (NUCLEO.desarrollo && PVP.stats ? `<small class="pvc-dbg">Esperas al rival: ${PVP.stats.n} (${(PVP.stats.ms / 1000).toFixed(1)} s) · retardo ${PVP.D} · v${typeof NUCLEO !== 'undefined' && NUCLEO.version || ''}</small>` : ''); if (typeof pintaLooks === 'function') pintaLooks($('#end-quote'));
  $('#st-cards').textContent = S[mi].deployed; $('#st-kills').textContent = S[mi].kills; $('#st-chaos').textContent = Math.round(S[mi].spent);
  $('#btn-next').hidden = true; $('#btn-share').hidden = true; $('#btn-again').textContent = 'OTRO RIVAL'; $('#btn-again').className = 'btn-big ol';
  PVP.resultado = pvpResultado();   // lo que se mandará al servidor: los dos clientes deben dar lo mismo
  show('scr-end');
}

/* ---------- los botones ---------- */
pvpSalvaje();   // se apunta en el panel DEV
hook('cuenta-vuelta', d => { if (d === 'pvp') { toast('¡Cuenta lista! Entrando en PvP', true); pvpPantalla(); } });
hook('pantalla', id => { if (id === 'scr-pvp' && !PVP_UI.busca) pvpPinta(); });   // al volver del editor de mazo
for (const b of document.querySelectorAll('#scr-pvp [data-pm]')) b.addEventListener('click', () => { if (PVP_UI.busca) return; PVP_UI.modo = b.dataset.pm; play('select'); pvpPinta(); pvpClasificacion(); });
$('#btn-pvp-buscar').addEventListener('click', pvpBuscar);
for (const b of document.querySelectorAll('#scr-pvp [data-back]')) b.addEventListener('click', pvpPara);

/* ---------- en desarrollo: medidor de la partida (cuánto tarda el servidor, cuánto se para, a cuántos fotogramas va) ---------- */
function pvpDebug(real) {
  if (!NUCLEO.desarrollo) return;
  pvpDebug.t = (pvpDebug.t || 0) - real; if (pvpDebug.t > 0) return; pvpDebug.t = 0.5;
  let el = document.getElementById('pvp-dbg');
  if (!el) { el = document.createElement('div'); el.id = 'pvp-dbg'; el.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:9999;font:11px monospace;background:rgba(0,0,0,.7);color:#9ef07a;padding:3px 6px;border-radius:6px;pointer-events:none'; document.body.append(el); }
  el.textContent = `${PVP.seat} · RTT ${Math.round(PVP.rtt)} ms (máx ${Math.round(PVP.rttMax)}) · llamadas ${PVP.llamadas} · esperas ${PVP.stats.n} (${(PVP.stats.ms / 1000).toFixed(1)} s) · tick ${SIM.tick} · ${Math.round(PVP.fps)} fps${PVP.fallos ? ` · FALLOS ${PVP.fallos}: ${PVP.ultimoError}` : ''}`;
}

/* ---------- solo en desarrollo: elegir el retardo de red (los dos jugadores el mismo) ---------- */
if (NUCLEO.desarrollo) {
  const fila = document.createElement('p'); fila.className = 'quote'; fila.id = 'pvp-dev-d';
  fila.innerHTML = 'Retardo de red (turnos, igual en los dos): <select id="pvp-d">' + [1, 2, 3, 4, 5, 6, 8].map(n => `<option value="${n}">${n}</option>`).join('') + '</select>';
  $('#btn-pvp-buscar').closest('.row').before(fila);
  const sel = $('#pvp-d'); try { sel.value = localStorage.getItem('fansof-pvp-d') || '5'; } catch (e) { sel.value = '5'; }   // 19f (que lee este valor) se carga después
  sel.addEventListener('change', () => { try { localStorage.setItem('fansof-pvp-d', sel.value); } catch (e) { /* sin guardar */ } });
}
