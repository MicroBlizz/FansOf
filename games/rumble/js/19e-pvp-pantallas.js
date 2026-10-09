// Fans of Rumble · PvP: pantalla de buscar rival, avisos durante la partida y pantalla final
'use strict';
const PVP_ABIERTO = true;     // se pondrá a true cuando el PvP esté listo para los jugadores; mientras, el botón solo sale en modo desarrollo
const PVP_SALVAJE = false;   // el modo Salvaje (con habilidades y objetos) sale a los jugadores cuando esto pase a true; en desarrollo siempre sale
const PVP_UI = { modo: 'estandar', busca: null, t0: 0, tic: null, ia: 30 };   // ia: segundos de búsqueda tras los que se ofrece jugar contra la IA
const pvpDisponible = () => PVP_ABIERTO || (typeof NUCLEO !== 'undefined' && !!NUCLEO.desarrollo);
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
  if (!pvpDisponible()) return;
  PVP_UI.modo = PVP_UI.modo || 'estandar'; PVPNET.actual = pvpRed(); pvpPara(); show('scr-pvp'); pvpPinta(); pvpClasificacion();
}
async function pvpClasificacion() {
  const caja = $('#pvp-clasif'); caja.innerHTML = '';
  if (PVPNET.actual !== 'servidor' || !PVPNET.redes.servidor.disponible()) return;
  try {
    const l = await PVPNET.redes.servidor.clasificacion(PVP_UI.modo);
    caja.innerHTML = `<div class="ar-lbl ol">CLASIFICACIÓN · ${esc(PVP_MODOS[PVP_UI.modo][0].toUpperCase())}</div>` + (l || []).slice(0, 20).map((r, i) => `<div class="pvp-fila${r.yo ? ' yo' : ''}"><b>${i + 1}</b><span>${esc(r.nombre)}</span><i>${fmt(r.puntos)} · ${fmt(r.jugadas)} partidas</i></div>`).join('') || '<p class="quote">Todavía no hay nadie en la clasificación.</p>';
  } catch (e) { /* sin conexión: se queda sin lista */ }
}
function pvpPinta() {
  const f = G.faction, F = FACTIONS[f], buscando = !!PVP_UI.busca, eq = pvpEquipo(PVP_UI.modo);
  if (!PVP_SALVAJE && !NUCLEO.desarrollo) PVP_UI.modo = 'estandar';   // sin Salvaje abierto, solo Estándar
  for (const b of document.querySelectorAll('#scr-pvp [data-pm]')) { b.setAttribute('aria-pressed', String(b.dataset.pm === PVP_UI.modo)); b.disabled = buscando; b.hidden = b.dataset.pm === 'salvaje' && !PVP_SALVAJE && !NUCLEO.desarrollo; }
  $('#pvp-sub').textContent = PVP_MODOS[PVP_UI.modo][1];
  // la facción se elige aquí mismo: cualquiera de las que tienes desbloqueadas
  const facs = $('#pvp-facs'); facs.innerHTML = FACTION_ORDER.filter(x => FACTIONS[x].leader && isUnlocked(x)).map(x => `<button class="pvp-fac" data-pf="${x}" aria-pressed="${x === f}" aria-label="${esc(FACTIONS[x].name)}" ${buscando ? 'disabled' : ''}><canvas data-pfl="${FACTIONS[x].leader}"></canvas></button>`).join('');
  for (const cv of facs.querySelectorAll('canvas')) drawArt(cv, cv.dataset.pfl, 40, 36);
  for (const bt of facs.querySelectorAll('button')) bt.addEventListener('click', () => { if (PVP_UI.busca || bt.dataset.pf === G.faction) return; play('select'); setFaction(bt.dataset.pf); pvpPinta(); });
  $('#pvp-equipo').innerHTML = `<div class="ar-fac"><canvas data-pvl="${F.leader}"></canvas><span class="ar-fn"><b class="ol">${F.name}</b><small>${F.passive}</small></span><span class="ar-deck">${eq.deck.map(k => `<i class="${isSpell(k) ? 'sp' : ''}"><canvas data-pvd="${k}"></canvas></i>`).join('')}</span></div>`;
  for (const cv of document.querySelectorAll('#pvp-equipo canvas[data-pvl]')) drawArt(cv, cv.dataset.pvl, 74, 64);
  for (const cv of document.querySelectorAll('#pvp-equipo canvas[data-pvd]')) drawArt(cv, cv.dataset.pvd, 24, 22);
  const b = $('#btn-pvp-buscar'); b.textContent = buscando ? 'CANCELAR' : 'BUSCAR RIVAL'; b.className = (buscando ? 'btn-ghost' : 'btn-big') + ' ol';
  $('#btn-pvp-ia').hidden = !(buscando && (Date.now() - PVP_UI.t0) / 1000 >= PVP_UI.ia);
  if (!buscando && !$('#pvp-estado').dataset.fijo) $('#pvp-estado').textContent = NUCLEO.desarrollo ? `Red: ${PVPNET.redes[PVPNET.actual].nombre}${typeof PVP_SRV !== 'undefined' && PVP_SRV.ultimo ? ' [' + PVP_SRV.ultimo + ']' : ''}` : '';
}
function pvpPara() { if (PVP_UI.busca) { PVP_UI.busca.cancelar(); PVP_UI.busca = null; } clearInterval(PVP_UI.tic); }
function pvpBuscar() {
  if (PVP_UI.busca) { pvpPara(); delete $('#pvp-estado').dataset.fijo; pvpPinta(); return; }
  const modo = PVP_UI.modo; delete $('#pvp-estado').dataset.fijo; PVP_UI.t0 = Date.now(); play('select'); PVPNET.actual = pvpRed();
  if (PVPNET.actual === 'servidor' && !PVPNET.redes.servidor.disponible()) { toast(typeof CUENTA === 'undefined' || !CUENTA.activa ? 'El PvP necesita conexión' : 'Para jugar PvP necesitas vincular tu cuenta (Opciones → Cuenta)', true); return; }
  PVP_UI.busca = PVPNET.redes[PVPNET.actual].buscar(modo, pvpEquipo(modo), pvpEncontrado);
  const dibuja = () => { const s = Math.floor((Date.now() - PVP_UI.t0) / 1000); $('#pvp-estado').textContent = (s >= PVP_UI.ia ? `No hay rivales todavía. Sigues en la cola… ${s} s. ¿Juegas contra la IA mientras tanto?` : `Buscando rival… ${s} s`) + (NUCLEO.desarrollo && typeof PVP_SRV !== 'undefined' && PVP_SRV.ultimo ? ' [' + PVP_SRV.ultimo + ']' : ''); $('#btn-pvp-ia').hidden = s < PVP_UI.ia; };
  dibuja(); PVP_UI.tic = setInterval(dibuja, 500); pvpPinta();
}
function pvpEncontrado(r) {
  PVP_UI.busca = null; clearInterval(PVP_UI.tic);
  PVP.rival = r.rival.nombre; PVP.modo = PVP_UI.modo; PVP.net = r; PVP.puntos = null;
  toast(`Rival: ${r.rival.nombre}`);
  if (!pvpInicio({ seat: r.seat, seed: r.seed, equipos: r.equipos, red: r.red, retardo: r.retardo, conservar: true, alEstado: pvpAlEstado })) { toast('No se ha podido empezar la partida'); PVP_UI.modo = PVP_UI.modo; pvpFin(); goHome(); }
}

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
    PVP.net.cerrar(G.winner, PVP.fin.h, r => { pvpPase(r); if ($('#scr-end').hidden) return; rw.innerHTML = r && r.error ? `<div class="rw-xp">${esc(r.error)}</div>` : r && r.puntos != null ? `<span class="rw-chip big ol">${fmt(r.puntos)} PUNTOS</span>` : r && r.estado === 'esperando' ? '<div class="rw-xp">Esperando a que el rival confirme el resultado…</div>' : r && r.estado === 'discutida' ? '<div class="rw-xp">El resultado está en revisión: no cuenta por ahora.</div>' : ''; });
  } else rw.innerHTML = PVP.net && PVP.net.cerrar ? '<div class="rw-xp">Esta partida no cuenta para nadie.</div>' : '<div class="rw-xp">Partida de pruebas: de momento sin puntos ni premios.</div>';
  $('#end-pass').innerHTML = ''; $('#end-quote').textContent = NUCLEO.desarrollo && PVP.stats ? `Esperas al rival: ${PVP.stats.n} (${(PVP.stats.ms / 1000).toFixed(1)} s) · retardo ${PVP.D} · v${typeof NUCLEO !== 'undefined' && NUCLEO.version || ''}` : '';
  $('#st-cards').textContent = S[mi].deployed; $('#st-kills').textContent = S[mi].kills; $('#st-chaos').textContent = Math.round(S[mi].spent);
  $('#btn-next').hidden = true; $('#btn-share').hidden = true; $('#btn-again').textContent = 'OTRO RIVAL'; $('#btn-again').className = 'btn-big ol';
  PVP.resultado = pvpResultado();   // lo que se mandará al servidor: los dos clientes deben dar lo mismo
  show('scr-end');
}

/* ---------- los botones ---------- */
$('#btn-pvp').hidden = !pvpDisponible();
$('#btn-pvp').addEventListener('click', () => { play('select'); pvpPantalla(); });
for (const b of document.querySelectorAll('#scr-pvp [data-pm]')) b.addEventListener('click', () => { if (PVP_UI.busca) return; PVP_UI.modo = b.dataset.pm; play('select'); pvpPinta(); });
$('#btn-pvp-buscar').addEventListener('click', pvpBuscar);
$('#btn-pvp-ia').addEventListener('click', () => { pvpPara(); play('select'); openPrep('quick'); });
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
