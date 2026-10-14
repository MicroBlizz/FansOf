// Fans of TD · Menús de este juego: el menú principal, sus opciones y traer el progreso de la dirección antigua.
// La cartera, la colección, el inventario, el gashapón y la tienda son comunes: core/js/sistema/.
'use strict';
const enPartida = () => G.screen === 'play';
function goHome() { showMenu(); }
// al abrir una pantalla de menú se esconde todo lo de la partida
hook('pantalla', id => { $('#btn-mode').hidden = true; $('#btn-wave').hidden = true; hidePanel(); $('#hud').hidden = $('#tray').hidden = true; $('#tut').hidden = true; $('#feed').hidden = true; $('#chat').innerHTML = ''; G.screen = id.slice(4); });
hook('insignias', () => { $('#news-badge').hidden = !novedadesPendientes(); });
// en este juego el equipo no se dibuja sobre el líder: el texto de la máquina de equipo no lo promete
hook('gacha.textos', () => { if (gachaTab === 'eq') $('#gacha-sub').textContent = 'Equipo freak solo para los líderes: arma, cabeza y accesorio. Cada objeto sale con su propia calidad.'; });
function openColl() { updateWallets(); show('scr-coll'); buildColl(); $('#coll-list').scrollTop = 0; }

// al volver al menú principal, de una en una: cómo te llamas (la primera vez), las novedades si hay versión nueva y el premio diario
function titlePopups() { if ($('#scr-title').hidden || !$('#scr-news').hidden) return; if (retosPopups()) return; if (novedadesPendientes()) { openNews(); return; } retosLogin(); }

/* ---------- menú principal ---------- */
function showMenu() {
  G.vs = null; G.xpPlay = {}; show('scr-title'); updateWallets(); titlePopups();
}

/* =========================================================
   OPCIONES de este juego (la música del menú, la versión e instalar son comunes: core/js/sistema/opciones.js)
   ========================================================= */
const optOn = k => SAVE[k] !== false;   // números de daño y temblor vienen activados
function openOptions() {
  show('scr-options'); updateWallets();
  $('#opt-vol').value = Math.round((SAVE.vol == null ? 1 : SAVE.vol) * 100); $('#opt-mus').value = Math.round((SAVE.mus == null ? 1 : SAVE.mus) * 100);
  optButtons(); $('#save-code').value = '';
}
function optButtons() {
  optComunes();   // la canción del menú y la versión (core/js/sistema/opciones.js)
  $('#btn-nums').textContent = optOn('nums') ? 'SÍ' : 'NO'; $('#btn-shake').textContent = optOn('shake') ? 'SÍ' : 'NO';
  botonPruebas($('#btn-test'));
}
$('#btn-opts').onclick = () => { play('select'); openOptions(); };
$('#btn-bib').onclick = () => { play('select'); updateWallets(); openBib(); };   // 0.13.1: la Biblioteca (core/js/sistema/biblioteca.js)
$('#opt-vol').oninput = e => { SAVE.vol = e.target.value / 100; if (SAVE.vol > 0 && SAVE.muted) { SAVE.muted = false; soundBtns(); } applyVolume(); saveGame(); };
$('#opt-vol').onchange = () => play('select');
$('#opt-mus').oninput = e => { SAVE.mus = e.target.value / 100; applyVolume(); saveGame(); };
$('#btn-nums').onclick = () => { SAVE.nums = !optOn('nums'); saveGame(); play('select'); optButtons(); };
$('#btn-shake').onclick = () => { SAVE.shake = !optOn('shake'); saveGame(); play('select'); optButtons(); };
// modo pruebas: es común (core/js/sistema/pruebas.js); aquí, lo de este juego: todos los niveles con 3 estrellas
hook('pruebas', () => { for (const w of WORLDS_TD) for (const l of w.levels) SAVE.stars[l.id] = 3; });
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
  if (!o || o.v !== 1 || typeof o.stars !== 'object') { play('deny'); toast('Ese código no vale. Cópialo entero desde el otro dispositivo y pégalo en la caja.'); return; }
  confirmBox('¿CARGAR ESE PROGRESO?', 'Se cambia todo tu progreso de este navegador por el del código.<small>No se puede deshacer.</small>', 'CARGAR', () => { SAVE = metaDefaults(o); saveGame(); location.reload(); });
};
$('#btn-reset').onclick = () => confirmBox('¿EMPEZAR DE CERO?', 'Se borra <b>todo</b>: estrellas, oro, gemas, niveles y objetos.<small>No se puede deshacer.</small>', 'BORRAR', () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* sin almacenamiento */ } location.reload(); });

/* ---------- progreso traído desde la dirección antigua de la web ---------- */
// La página antigua redirige aquí con el progreso que tenía guardado en la dirección (…#traer=código). Nunca se carga sin preguntar.
function importFromHash() {
  const m = /^#traer=(.+)$/.exec(location.hash); if (!m) return;
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* se queda en la dirección, sin más */ }
  let o = null; try { o = JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch (e) { /* código roto */ }
  if (!o || o.v !== 1 || typeof o.stars !== 'object' || JSON.stringify(o) === JSON.stringify(SAVE)) return;
  const st = Object.keys(o.stars).length;
  confirmBox('¿TRAER TU PROGRESO?', `Vienes de la dirección antigua del juego, donde tenías <b>${fmt(o.gold || 0)} de oro</b>, <b>${fmt(o.gems || 0)} gemas</b> y <b>${st} ${st === 1 ? 'nivel ganado' : 'niveles ganados'}</b>. ¿Quieres seguir aquí con ese progreso?<small>Sustituye al progreso guardado en esta dirección. No se puede deshacer.</small>`, 'TRAER', () => { SAVE = metaDefaults(o); saveGame(); location.reload(); });
}
