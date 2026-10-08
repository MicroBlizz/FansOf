// Fans of Rumble · PvP: pantalla de buscar rival, avisos durante la partida y pantalla final
'use strict';
const PVP_ABIERTO = false;   // se pondrá a true cuando el servidor del PvP esté listo; mientras, el botón solo sale en modo desarrollo
const PVP_UI = { modo: 'estandar', busca: null, t0: 0, tic: null, ia: 30 };   // ia: segundos de búsqueda tras los que se ofrece jugar contra la IA
const pvpDisponible = () => PVP_ABIERTO || (typeof NUCLEO !== 'undefined' && !!NUCLEO.desarrollo);
const PVP_MODOS = { estandar: ['Estándar', 'Cuentan tu mazo y el nivel y las estrellas de tus cartas. Los objetos y las habilidades no entran.'], salvaje: ['Salvaje', 'Cuenta todo lo que llevas puesto: las habilidades de tus cartas y el equipo de tu líder.'] };

function pvpPantalla() {
  if (!pvpDisponible()) return;
  PVP_UI.modo = PVP_UI.modo || 'estandar'; pvpPara(); show('scr-pvp'); pvpPinta();
}
function pvpPinta() {
  const f = G.faction, F = FACTIONS[f], buscando = !!PVP_UI.busca, eq = pvpEquipo(PVP_UI.modo);
  for (const b of document.querySelectorAll('#scr-pvp [data-pm]')) { b.setAttribute('aria-pressed', String(b.dataset.pm === PVP_UI.modo)); b.disabled = buscando; }
  $('#pvp-sub').textContent = PVP_MODOS[PVP_UI.modo][1];
  $('#pvp-equipo').innerHTML = `<div class="ar-fac"><canvas data-pvl="${F.leader}"></canvas><span class="ar-fn"><b class="ol">${F.name}</b><small>${F.passive}</small></span><span class="ar-deck">${eq.deck.map(k => `<i class="${isSpell(k) ? 'sp' : ''}"><canvas data-pvd="${k}"></canvas></i>`).join('')}</span></div>`;
  for (const cv of document.querySelectorAll('#pvp-equipo canvas[data-pvl]')) drawArt(cv, cv.dataset.pvl, 74, 64);
  for (const cv of document.querySelectorAll('#pvp-equipo canvas[data-pvd]')) drawArt(cv, cv.dataset.pvd, 24, 22);
  const b = $('#btn-pvp-buscar'); b.textContent = buscando ? 'CANCELAR' : 'BUSCAR RIVAL'; b.className = (buscando ? 'btn-ghost' : 'btn-big') + ' ol';
  $('#btn-pvp-ia').hidden = !(buscando && (Date.now() - PVP_UI.t0) / 1000 >= PVP_UI.ia);
  if (!buscando && !$('#pvp-estado').dataset.fijo) $('#pvp-estado').textContent = `Red: ${PVPNET.redes[PVPNET.actual].nombre}`;
}
function pvpPara() { if (PVP_UI.busca) { PVP_UI.busca.cancelar(); PVP_UI.busca = null; } clearInterval(PVP_UI.tic); }
function pvpBuscar() {
  if (PVP_UI.busca) { pvpPara(); delete $('#pvp-estado').dataset.fijo; pvpPinta(); return; }
  const modo = PVP_UI.modo; delete $('#pvp-estado').dataset.fijo; PVP_UI.t0 = Date.now(); play('select');
  PVP_UI.busca = PVPNET.redes[PVPNET.actual].buscar(modo, pvpEquipo(modo), pvpEncontrado);
  const dibuja = () => { const s = Math.floor((Date.now() - PVP_UI.t0) / 1000); $('#pvp-estado').textContent = s >= PVP_UI.ia ? 'No hay rivales ahora. ¿Juegas contra la IA?' : `Buscando rival… ${s} s`; $('#btn-pvp-ia').hidden = s < PVP_UI.ia; };
  dibuja(); PVP_UI.tic = setInterval(dibuja, 500); pvpPinta();
}
function pvpEncontrado(r) {
  PVP_UI.busca = null; clearInterval(PVP_UI.tic);
  PVP.rival = r.rival.nombre; PVP.modo = PVP_UI.modo;
  toast(`Rival: ${r.rival.nombre}`);
  if (!pvpInicio({ seat: r.seat, seed: r.seed, equipos: r.equipos, red: r.red, conservar: true, alEstado: pvpAlEstado })) { toast('No se ha podido empezar la partida'); PVP_UI.modo = PVP_UI.modo; pvpFin(); goHome(); }
}

/* ---------- durante la partida ---------- */
function pvpAlEstado(e) {
  if (e === 'esperando') toast('Esperando al rival…');
  else if (e === 'jugando') { const t = document.getElementById('toast'); if (t && /Esperando/.test(t.textContent)) t.hidden = true; }
  else if (e === 'abandono' && G.state === 'play') endMatch(verEquipo(), 'abandono');   // el rival se ha ido (o se ha rendido): ganas
  else if ((e === 'desync' || e === 'error') && G.state === 'play') endMatch(null, e);   // la partida se anula: nadie gana ni pierde
}
// en PvP no hay pausa: el botón pregunta si quieres rendirte
function pvpRendirse() {
  if (G.state !== 'play') return;
  confirmBox('¿Rendirte?', 'Si te rindes, la partida cuenta como una derrota.', 'ME RINDO', () => {
    if (G.state !== 'play') return;
    if (PVP.red) PVP.red.enviar({ t: 'rendir' });
    endMatch(PVP.peer, 'abandono');
  });
}

/* ---------- el final ---------- */
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
  $('#end-rewards').innerHTML = `<div class="rw-xp">Partida de pruebas: de momento sin puntos ni premios.</div>`;
  $('#end-pass').innerHTML = ''; $('#end-quote').textContent = '';
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
