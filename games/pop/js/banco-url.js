// Fans of Pop · PRUEBA DE RENDIMIENTO, la dirección y las claves (dominio puro, tarea 404): cuándo está en modo banco (?banco=1 y la
// cuenta apagada con &nube=0, para que la partida de usar y tirar nunca suba a la nube), con qué parámetros (corta=1, solo=lado4,duelo),
// en qué clave del navegador se guarda la partida (la real no se toca nunca) y a qué dirección se va y se vuelve. Sin DOM ni reloj:
// recibe la dirección y una función que da el almacén (acceder a él puede fallar). Lo usan js/ajustes.js (antes de que core cargue la partida), js/banco-juego.js y js/banco-dev.js.
'use strict';
const PP_BANCO_URL = (() => {
  const CLAVES = Object.freeze({ partida: 'fansof-pop-banco', resultado: 'fansof-pop-banco-resultado', anterior: 'fansof-pop-banco-anterior' });
  const PARAMETROS = Object.freeze(['banco', 'nube', 'corta', 'solo', 'origen', 'cpu']);   // los que se quitan para volver a la dirección normal
  // origen=guion (un guion de pruebas la lanza; si no, 'panel') y cpu=N (la CPU frenada que se ha puesto a mano, entero de 1 a 20, o null)
  const origenDe = v => (v === 'guion' ? 'guion' : 'panel');
  function cpuDe(v) { const n = /^\d{1,2}$/.test(v || '') ? Number(v) : 0; return n >= 1 && n <= 20 ? n : null; }
  // { activo, corta, solo, origen, cpu }: activo solo con banco=1 Y nube=0; `solo` la lista de escenarios o null
  function parametros(search) {
    const q = new URLSearchParams(search || '');
    const solo = (q.get('solo') || '').split(',').map(s => s.trim()).filter(Boolean);
    return { activo: q.get('banco') === '1' && q.get('nube') === '0', corta: q.get('corta') === '1', solo: solo.length ? solo : null, origen: origenDe(q.get('origen')), cpu: cpuDe(q.get('cpu')) };
  }
  // la clave de la partida: la de usar y tirar en modo banco; si no, la normal del juego
  const claveGuardado = (normal, search) => (parametros(search).activo ? CLAVES.partida : normal);
  // en modo banco, la partida de usar y tirar empieza siempre de cero; devuelve true si la ha borrado (nunca toca la normal)
  function borraPartida(search, dameAlmacen) {
    if (!parametros(search).activo) return false;
    try { dameAlmacen().removeItem(CLAVES.partida); return true; } catch (e) { return false; }   // sin almacenamiento no hay nada que borrar
  }
  // la dirección de Pop de siempre: la actual sin los parámetros de la prueba (conserva lo demás: ruta, otros parámetros y #)
  function urlNormal(href) {
    const u = new URL(href, 'http://x/');
    PARAMETROS.forEach(p => u.searchParams.delete(p));
    return u.pathname + u.search + u.hash;
  }
  // la dirección que lanza la prueba: banco=1 y nube=0, con corta=1 si se pide y, si se dan, origen=guion y cpu=N (los de siempre se omiten)
  function urlBanco(href, corta = false, extra = {}) {
    const u = new URL(href, 'http://x/');
    PARAMETROS.forEach(p => u.searchParams.delete(p));
    u.searchParams.set('banco', '1'); u.searchParams.set('nube', '0');
    if (corta) u.searchParams.set('corta', '1');
    if (extra.origen === 'guion') u.searchParams.set('origen', 'guion');
    const cpu = cpuDe(String(extra.cpu == null ? '' : extra.cpu)); if (cpu) u.searchParams.set('cpu', String(cpu));
    return u.pathname + u.search + u.hash;
  }
  return Object.freeze({ CLAVES, parametros, claveGuardado, borraPartida, urlNormal, urlBanco });
})();
if (typeof module !== 'undefined') module.exports = PP_BANCO_URL;
