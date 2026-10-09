// Fans of Survivors · Menús de este juego: el menú principal, sus opciones y lo que los sistemas comunes le preguntan.
// La cartera, la colección, el inventario, la biblioteca, el gashapón, la tienda y las horas extra son comunes: core/js/sistema/.
'use strict';
let VISTA = 'menu';   // 'menu' o 'juego'
const enPartida = () => VISTA === 'juego';
function goHome() { showMenu(); }
// al abrir una pantalla de menú se esconde lo de la partida
hook('pantalla', () => { VISTA = 'menu'; $('#hud').hidden = true; });
hook('insignias', () => { $('#news-badge').hidden = !novedadesPendientes(); });
// aquí el equipo es para el líder de la facción con la que juegas, que es tu personaje
hook('gacha.textos', () => { if (gachaTab === 'eq') $('#gacha-sub').textContent = 'Equipo freak para tu líder: arma, cabeza y accesorio. Mejora al líder de cada facción y a todas sus armas. Cada objeto sale con su propia calidad.'; });
function openColl() { updateWallets(); show('scr-coll'); buildColl(); $('#coll-list').scrollTop = 0; }

// al volver al menú principal, de una en una: cómo te llamas (la primera vez), las novedades si hay versión nueva y el premio diario
function titlePopups() { if ($('#scr-title').hidden || !$('#scr-news').hidden) return; if (retosPopups()) return; if (novedadesPendientes()) { openNews(); return; } retosLogin(); }

/* ---------- menú principal ---------- */
function showMenu() {
  P = null; VISTA = 'menu'; show('scr-title'); updateWallets(); pintaRecord(); pintaFaccion(); titlePopups();
  try { dibujaPortada(); } catch (e) { /* la portada sale aunque falle el dibujo */ }
}
function pintaRecord() {
  const S = SAVE.stats || {};
  $('#rec-line').innerHTML = S.best_t ? `Tu récord: <b>${mmss(S.best_t)}</b> · ${fmt(S.best_k || 0)} robots · nivel ${S.best_n || 1}${S.win ? ` · 👑 x${S.win}` : ''}` : 'Aguanta 10 minutos y despide a SurvivalBot.';
}
// la portada: tu líder y dos de sus cartas, rodeados de becarios
function dibujaPortada() {
  const c = $('#title-art'), LW = 420, LH = 200, R2 = 3; c.width = LW * R2; c.height = LH * R2;
  const x = c.getContext('2d'); x.setTransform(R2, 0, 0, R2, 0, 0); x.lineJoin = 'round'; x.clearRect(0, 0, LW, LH);
  const fac = facNow(), F = FACTIONS[fac], TH = THEMES[fac] || THEMES.animales;
  x.fillStyle = 'rgba(0,0,0,.3)'; x.beginPath(); x.ellipse(210, 190, 192, 16, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(210, 180, 178, 24, 0, 0, Math.PI * 2); x.fillStyle = TH.title[0]; x.fill(); x.lineWidth = 3; x.strokeStyle = OL; x.stroke();
  x.beginPath(); x.ellipse(210, 175, 152, 13, 0, 0, Math.PI * 2); x.fillStyle = TH.title[1]; x.fill();
  drawVector(x, 'becario', 52, 182, 40, 1); drawVector(x, 'starbot', 360, 160, 50, -1); drawVector(x, 'becario', 380, 188, 38, -1); drawVector(x, 'descargabot', 300, 190, 40, -1);
  drawVector(x, F.units[0], 110, 188, 44, 1); drawVector(x, F.units[1], 152, 194, 40, 1); drawVector(x, F.leader, 220, 186, 130, 1);
}

/* =========================================================
   OPCIONES de este juego (la música del menú, la versión e instalar son comunes: core/js/sistema/opciones.js)
   ========================================================= */
const optOn = k => SAVE[k] !== false;   // números de daño, temblor y chat vienen activados
function openOptions() {
  show('scr-options'); updateWallets();
  $('#opt-vol').value = Math.round((SAVE.vol == null ? 1 : SAVE.vol) * 100); $('#opt-mus').value = Math.round((SAVE.mus == null ? 1 : SAVE.mus) * 100);
  optButtons(); $('#save-code').value = '';
}
function optButtons() {
  optComunes();
  $('#btn-nums').textContent = optOn('nums') ? 'SÍ' : 'NO'; $('#btn-shake').textContent = optOn('shake') ? 'SÍ' : 'NO'; $('#btn-chat').textContent = optOn('chat') ? 'SÍ' : 'NO';
  botonPruebas($('#btn-test'));
}
$('#btn-opts').onclick = () => { play('select'); openOptions(); };
$('#btn-bib').onclick = () => { play('select'); updateWallets(); openBib(); };
$('#opt-vol').oninput = e => { SAVE.vol = e.target.value / 100; if (SAVE.vol > 0 && SAVE.muted) { SAVE.muted = false; soundBtns(); } applyVolume(); saveGame(); };
$('#opt-vol').onchange = () => play('select');
$('#opt-mus').oninput = e => { SAVE.mus = e.target.value / 100; applyVolume(); saveGame(); };
$('#btn-nums').onclick = () => { SAVE.nums = !optOn('nums'); saveGame(); play('select'); optButtons(); };
$('#btn-shake').onclick = () => { SAVE.shake = !optOn('shake'); saveGame(); play('select'); optButtons(); };
$('#btn-chat').onclick = () => { SAVE.chat = !optOn('chat'); saveGame(); play('select'); optButtons(); };
// modo pruebas: es común (core/js/sistema/pruebas.js); este juego no tiene nada propio que añadir
$('#btn-test').onclick = () => pruebasClic(optButtons);
// pasar el progreso a otro móvil o PC con un código
const saveCode = () => btoa(unescape(encodeURIComponent(JSON.stringify(SAVE))));
$('#btn-export').onclick = () => {
  stat('export', 1);
  const code = saveCode(), ta = $('#save-code'); ta.value = code; ta.select(); play('select');
  const done = ok => toast(ok ? 'Código copiado. Pégalo en el otro dispositivo.' : 'Copia a mano el código de la caja', ok);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(() => done(true), () => done(false)); else done(false);
};
$('#btn-import').onclick = () => {
  let o = null; try { o = JSON.parse(decodeURIComponent(escape(atob($('#save-code').value.trim())))); } catch (e) { /* código mal copiado */ }
  if (!o || o.v !== 1 || typeof o.units !== 'object') { play('deny'); toast('Ese código no vale. Cópialo entero desde el otro dispositivo y pégalo en la caja.'); return; }
  confirmBox('¿CARGAR ESE PROGRESO?', 'Se cambia todo tu progreso de este navegador por el del código.<small>No se puede deshacer.</small>', 'CARGAR', () => { SAVE = metaDefaults(o); saveGame(); location.reload(); });
};
$('#btn-reset').onclick = () => confirmBox('¿EMPEZAR DE CERO?', 'Se borra <b>todo</b>: récords, oro, gemas, niveles y objetos.<small>No se puede deshacer.</small>', 'BORRAR', () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* sin almacenamiento */ } location.reload(); });
$('#btn-howto').onclick = () => { play('select'); stat('howto', 1); show('scr-howto'); };
$('#btn-howto-ok').onclick = () => { play('select'); showMenu(); };
// los botones de sonido (en la pausa)
const soundBtns = () => { for (const b of document.querySelectorAll('.btn-sound')) { b.textContent = SAVE.muted ? '🔇' : '🔊'; b.setAttribute('aria-label', SAVE.muted ? 'Activar sonido' : 'Silenciar sonido'); } };
for (const b of document.querySelectorAll('.btn-sound')) b.onclick = () => { SAVE.muted = !SAVE.muted; if (SAVE.muted) stat('mute', 1); audioInit(); applyVolume(); saveGame(); soundBtns(); };
