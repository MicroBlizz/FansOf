// Fans Of · OPCIONES que valen para cualquier juego: qué canción suena en el menú, la versión que se enseña e instalar el juego como app.
// Lo demás de la pantalla de Opciones (volumen, lo que se ve en la partida, pasar o borrar el progreso) lo lleva todavía cada juego,
// que llama a optComunes() cuando abre o repinta la pantalla.
'use strict';
/* ---------- música del menú: cualquier canción de la serie (un juego puede añadir las suyas a MENU_TRACKS) ---------- */
const MENU_TRACKS = [['menu', 'Espera de Microblizz'], ['animales', 'Animales Locos'], ['nomuertos', 'No-Muertos'], ['streamers', 'Streamers'], ['heroes', 'Héroes'], ['ciber', 'Ciberpunks'], ['memes', 'Memes'], ['gamer', 'Comunidad Gamer'], ['olvidados', 'Olvidados'], ['pop', 'Cultura Pop'],
  ['boss0', 'Jefe: SurvivalBot'], ['boss1', 'Jefe: NecroLord'], ['boss2', 'Jefe: StreamKing'], ['boss3', 'Jefe: EpicChampion'], ['boss4', 'Jefe: CyberMarine'], ['boss5', 'Jefe: MemeLord'], ['boss6', 'Jefe: el CEO'], ['boss7', 'Jefe: Vikingo'], ['boss8', 'Jefe: PayStation'], ['boss9', 'Jefe: ProGamer'], ['boss10', 'Jefe: LaDirectora'], ['boss11', 'Jefe: Presidente de Phony']].filter(t => TRACKS[t[0]]);
const menuTrack = () => (MENU_TRACKS.find(t => t[0] === SAVE.menuMus) || MENU_TRACKS[0]);
$('#btn-menumus').addEventListener('click', () => { const i = MENU_TRACKS.indexOf(menuTrack()); SAVE.menuMus = MENU_TRACKS[(i + 1) % MENU_TRACKS.length][0]; saveGame(); play('select'); optComunes(); });
/* ---------- idioma: automático (el del navegador), español o inglés. Cambiarlo recarga la página (lo guarda NUCLEO en este navegador) ---------- */
const idiomaElegido = () => { try { return localStorage.getItem('fansof-idioma') || ''; } catch (e) { return ''; } };
$('#btn-idioma').addEventListener('click', () => { const o = ['', 'es', 'en']; play('select'); NUCLEO.elegirIdioma(o[(o.indexOf(idiomaElegido()) + 1) % o.length]); });
// pone al día lo que esta parte pinta en la pantalla de Opciones: la canción elegida y la versión (que sale de index.html: core/js/nucleo.js)
function optComunes() {
  $('#btn-menumus').textContent = menuTrack()[1].toUpperCase() + ' ▸';
  const bi = $('#btn-idioma'); if (bi) { const el = idiomaElegido(); bi.textContent = el === 'es' ? 'ESPAÑOL' : el === 'en' ? 'ENGLISH' : 'AUTO (' + NUCLEO.idioma.toUpperCase() + ')'; }
  $('#scr-options .ver').textContent = document.title + ' · versión ' + VERSION;
}
/* ---------- instalar en el móvil como una app ---------- */
// ---- instalar en el móvil como una app
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
window.addEventListener('appinstalled', () => { installEvt = null; toast('¡Instalado! Ya lo tienes en tu pantalla de inicio', true); });
const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
function installApp() {
  play('select');
  if (isStandalone()) { toast('Ya lo estás usando como app', true); return; }
  if (installEvt) { const e = installEvt; installEvt = null; e.prompt(); return; }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const web = location.protocol === 'https:';
  confirmBox('INSTALAR EN EL MÓVIL', (web ? '' : '<b>Ábrelo desde la web del juego</b> (no desde un archivo) para poder instalarlo.<br><br>') + (ios ? 'En iPhone, con <b>Safari</b>: toca el botón <b>Compartir</b> (el cuadrado con la flecha hacia arriba) y luego <b>«Añadir a pantalla de inicio»</b>.' : 'En Android, con <b>Chrome</b>: toca el menú <b>⋮</b> (arriba a la derecha) y luego <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b>.') + '<small>Se abre como una app, a pantalla completa, y también funciona sin internet.</small>', null, null, 'ENTENDIDO');
}
$('#btn-install').addEventListener('click', installApp);
