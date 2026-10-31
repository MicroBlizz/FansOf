// Fans of Pop · DUELOS CONTRA GENTE (31-10-2026, Daniel: «un modo contra la gente, tus amigos, y al azar»). El mismo duelo de
// js/duelo.js (pop-it por turnos, pierde quien revienta la última), pero contra otra persona, sobre las SALAS de core
// (core/js/sistema/salas.js, servidor/89-salas.sql):
// · RETAR A UN AMIGO: abres una sala y compartes su código de 4 letras o el enlace (?sala=CODIGO); tu amigo entra con él.
// · RIVAL AL AZAR: pop_buscar_rival (servidor/104) te mete en la sala de alguien que espera o abre una tuya. Si en
//   PP_PVP_ESPERA segundos no aparece nadie, juegas contra el CEO y el juego lo dice claro (nunca se hace pasar por una persona).
// El anfitrión reparte el tablero (las filas) y quién empieza; cada jugada viaja por el canal en directo de la sala. Si tu rival se
// va a mitad, ganas. Solo cuentas vinculadas (como las salas de los demás juegos).
'use strict';
const PP_PVP = { red: null, sala: null, buscando: null, espera: null };
const PP_PVP_ESPERA = 25;   // segundos buscando rival antes de jugar contra el CEO
/* ---------- el menú de duelos ---------- */
function ppVentanaDuelos() {
  const t = ppAbre(`<h2>${tr('Duelos')}</h2><p class="pp-sub">${tr('Por turnos, revienta las que quieras de una sola fila. ¡Pierde quien revienta la última!')}</p>`);
  const col = document.createElement('div'); col.className = 'pp-columna'; t.appendChild(col);
  col.appendChild(ppBoton(tr('CONTRA EL CEO'), 'pp-btn', () => { ppCierra(); ppNuevoDuelo(); }));
  col.appendChild(ppBoton(tr('RIVAL AL AZAR'), 'pp-btn2 pp-rosa', ppPvpBuscar));
  col.appendChild(ppBoton(tr('RETAR A UN AMIGO'), 'pp-btn2 pp-verde', ppPvpCrear));
  col.appendChild(ppBoton(tr('TENGO UN CÓDIGO'), 'pp-btn2 pp-azul', ppPvpPideCodigo));
  t.insertAdjacentHTML('beforeend', `<p class="pp-sub"><small>${tr('Victorias contra gente: {g} · Derrotas: {p}', { g: (SAVE.pvp || {}).gan || 0, p: (SAVE.pvp || {}).per || 0 })}</small></p>`);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
}
const ppPvpPuede = () => { if (typeof SALAS !== 'undefined' && SALAS.puede()) return true; ppPvpAviso(tr(typeof SALAS !== 'undefined' ? SALAS.errorTexto('cuenta_no_vinculada') : 'Necesitas conexión para jugar con amigos.')); return false; };
function ppPvpAviso(txt) { const t = ppAbre(`<h2>${tr('Duelos')}</h2><p class="pp-sub">${txt}</p>`); t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppVentanaDuelos)); }
const ppPvpError = e => ppPvpAviso(tr(SALAS.errorTexto(e)));
/* ---------- buscar rival al azar ---------- */
function ppPvpBuscar() {
  if (!ppPvpPuede()) return;
  ppPvpLimpia();
  const t = ppAbre(`<h2>${tr('Buscando rival…')}</h2><div class="pp-cofre pp-gira">${ppIcono('i-pista', 90, '#bfe9ff')}</div><p class="pp-sub" id="pp-pvp-cuenta"></p>`);
  t.appendChild(ppBoton(tr('CANCELAR'), 'pp-btn2 pp-azul', () => { ppPvpLimpia(); ppVentanaDuelos(); }));
  const red = PP_PVP.red = SALAS.red('pop'), t0 = Date.now();
  PP_PVP.espera = setInterval(() => {
    const el = $pp('#pp-pvp-cuenta'), quedan = Math.max(0, PP_PVP_ESPERA - Math.floor((Date.now() - t0) / 1000));
    if (el) el.textContent = tr('Si nadie aparece en {n} s, te reta el CEO.', { n: quedan });
    if (quedan <= 0) { ppPvpLimpia(); ppCierra(); ppNuevoDuelo(); ppFlota(tr('No hay nadie, ¡te reta el CEO!'), 270, 240, '#ff8a2a'); }
  }, 500);
  CUENTA.rpc('pop_buscar_rival', { p_datos: {} })
    .then(s => { if (PP_PVP.red !== red) return; red.seguir(ppPvpSala); return red.unirse(s.codigo, {}); })
    .catch(e => { if (PP_PVP.red === red) { ppPvpLimpia(); ppPvpError(e); } });
}
/* ---------- retar a un amigo ---------- */
function ppPvpCrear() {
  if (!ppPvpPuede()) return;
  ppPvpLimpia();
  const red = PP_PVP.red = SALAS.red('pop');
  red.seguir(ppPvpSala);
  red.crear(2, {}).then(s => {
    if (PP_PVP.red !== red) return;
    const enlace = SALAS.enlace(s.codigo);
    const t = ppAbre(`<h2>${tr('Reta a un amigo')}</h2><p class="pp-sub">${tr('Pásale este código o el enlace:')}</p><p class="pp-codigo">${s.codigo}</p>
      <p class="pp-sub" id="pp-pvp-estado">${tr('Esperando a tu amigo…')}</p>`);
    t.appendChild(ppBoton(tr('COMPARTIR ENLACE'), 'pp-btn', () => {
      const txt = tr('¡Te reto a un duelo de pop-it en Fans of Pop! Código: {c}', { c: s.codigo });
      if (navigator.share) navigator.share({ title: 'Fans of Pop', text: txt, url: enlace }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(txt + ' ' + enlace).then(() => ppFlota(tr('¡Enlace copiado!'), 270, 300, '#4fc964'));
    }));
    t.appendChild(ppBoton(tr('CANCELAR'), 'pp-btn2 pp-azul', () => { ppPvpLimpia(); ppVentanaDuelos(); }));
  }).catch(e => { if (PP_PVP.red === red) { ppPvpLimpia(); ppPvpError(e); } });
}
function ppPvpPideCodigo() {
  const t = ppAbre(`<h2>${tr('Tengo un código')}</h2><p class="pp-sub">${tr('Escribe las 4 letras que te ha pasado tu amigo:')}</p>
    <input id="pp-pvp-codigo" class="pp-entrada" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false">`);
  t.appendChild(ppBoton(tr('ENTRAR'), 'pp-btn', () => { const c = ($pp('#pp-pvp-codigo').value || '').trim().toUpperCase(); if (/^[A-Z]{4}$/.test(c)) ppPvpEntraCodigo(c); }));
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppVentanaDuelos));
  setTimeout(() => { const i = $pp('#pp-pvp-codigo'); if (i) i.focus(); }, 50);
}
function ppPvpEntraCodigo(codigo) {
  if (SALAS.codigoUrl()) SALAS.quitaCodigoUrl();
  if (!ppPvpPuede()) return;
  ppPvpLimpia();
  const red = PP_PVP.red = SALAS.red('pop');
  red.seguir(ppPvpSala);
  ppAbre(`<h2>${tr('Entrando…')}</h2><p class="pp-codigo">${codigo}</p>`);
  red.unirse(codigo, {}).catch(e => { if (PP_PVP.red === red) { ppPvpLimpia(); ppPvpError(e); } });
}
/* ---------- la sala: empezar, jugadas y abandonos ---------- */
// cada vez que cambia la sala
function ppPvpSala(s) {
  PP_PVP.sala = s;
  const vivos = s.jugadores.filter(j => j.vivo), rival = s.jugadores.find(j => !j.yo);
  if (s.estado === 'espera' && s.anfitrion && vivos.length >= 2) {
    // el anfitrión reparte: 6 filas de largos al azar y quién empieza
    const filas = Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 6)), ordenes = s.jugadores.map(j => j.orden);
    PP_PVP.red.poner({ filas, empieza: ordenes[Math.floor(Math.random() * ordenes.length)] }, true).catch(() => {});
  }
  if (s.estado === 'jugando' && s.datos && s.datos.filas && !(PP_DUELO && PP_DUELO.pvp)) ppPvpEmpieza(s);
  // tu rival se ha ido a mitad del duelo (lleva más de 20 s sin dar señales): ganas
  const D = PP_DUELO;
  if (D && D.pvp && !D.fin && rival && !rival.vivo) { ppFlota(tr('Tu rival se ha ido'), 270, 240, '#ff8a2a'); ppDueloFin('gana'); }
}
function ppPvpEmpieza(s) {
  clearInterval(PP_PVP.espera);
  ppCierra();
  const yo = s.jugadores.find(j => j.yo), rival = s.jugadores.find(j => !j.yo);
  const n = 6, mask = new Uint8Array(n * n), need = new Array(n * n).fill(0);
  s.datos.filas.forEach((largo, y) => { const x0 = Math.floor((n - largo) / 2); for (let x = x0; x < x0 + largo; x++) { mask[y * n + x] = 1; need[y * n + x] = 1; } });
  const T = ppNuevoTablero({ g: 0, lado: n, mask, need, opt: [], limite: 99, amigos: 0, jefe: true }, { equipo: [] });
  PP_DUELO = { T, turno: s.datos.empieza === yo.orden ? 'yo' : 'rival', fila: null, esta: [], fin: null,
    pvp: { nombre: (rival && rival.nombre) || tr('Tu rival'), canal: null } };
  PP_DUELO.pvp.canal = PP_PVP.red.canal(m => ppPvpMensaje(m), () => {});
  ppIrA('duelo'); ppFxEntraSala(T); ppDueloBoton(); ppTutorial('duelo'); ppTutorial('trucoNim');
  play('ppRescate');
  ppFlota(PP_DUELO.turno === 'yo' ? tr('¡Empiezas tú!') : tr('Empieza {n}', { n: PP_DUELO.pvp.nombre }), 270, 240, '#ffd64a');
}
// tu jugada, al pulsar ¡LISTO! (o al reventar la última, que pierdes)
function ppPvpManda(celdas) { const D = PP_DUELO; if (D && D.pvp && D.pvp.canal) D.pvp.canal.enviar({ t: 'jugada', celdas }); }
// la jugada del rival: sus burbujas se revientan una a una
function ppPvpMensaje(m) {
  const D = PP_DUELO; if (!D || !D.pvp || D.fin || !m || m.t !== 'jugada' || !Array.isArray(m.celdas) || D.turno !== 'rival') return;
  const T = D.T, celdas = m.celdas.filter(i => Number.isInteger(i) && i >= 0 && i < T.up.length && T.mask[i] && T.up[i]);
  if (!celdas.length) return;
  D.fila = Math.floor(celdas[0] / T.n);
  celdas.forEach((i, k) => setTimeout(() => {
    if (PP_DUELO !== D || D.fin) return;
    if (ppDueloRevienta(i)) { ppDueloFin('gana'); return; }
    if (k === celdas.length - 1) setTimeout(() => { if (PP_DUELO === D && !D.fin) { D.turno = 'yo'; D.fila = null; ppDueloBoton(); play('ppPista'); } }, 400);
  }, 300 * (k + 1)));
}
function ppPvpLimpia() {
  clearInterval(PP_PVP.espera);
  if (PP_DUELO && PP_DUELO.pvp && PP_DUELO.pvp.canal) PP_DUELO.pvp.canal.cerrar();
  if (PP_PVP.red) PP_PVP.red.salir();
  PP_PVP.red = null; PP_PVP.sala = null;
}
