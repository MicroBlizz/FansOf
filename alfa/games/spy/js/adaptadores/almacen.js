// Fans of Spy · ADAPTADORES · El almacén: guarda en este navegador el progreso (tutorial hecho, mejor nota de cada planta y Clips)
// y los ajustes de sonido, y avisa a core para que lo suba a la nube. SAVE es la variable que core espera de todo juego
// (core/js/sistema/cuenta.js la sube tal cual). Las cuatro funciones de sonido del final también las pide core (sonido.js).
'use strict';
const SAVE = (() => {
  let j = null;
  try { j = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { j = null; }   // sin almacenamiento o con algo ilegible: se empieza de nuevo
  return { tutorial: false, notas: {}, clips: 0, vol: 1, mus: 0.5, ...(j && typeof j === 'object' ? j : {}) };
})();
SPY.almacen = (() => {
  function escribe() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { SPY.sinAlmacen = true; /* modo privado o disco lleno: se juega igual, sin guardar */ }
    if (typeof CUENTA !== 'undefined') CUENTA.cambio();
  }
  return {
    carga: () => JSON.parse(JSON.stringify(SAVE)),
    guarda(progreso) { Object.assign(SAVE, JSON.parse(JSON.stringify(progreso))); escribe(); },
    // el sonido: encendido (efectos a tope) o apagado (todo a cero)
    conSonido: () => SAVE.vol > 0,
    ponSonido(si) { SAVE.vol = si ? 1 : 0; SAVE.mus = si ? 0.5 : 0; escribe(); applyVolume(); },   // applyVolume (core) sube o baja el altavoz en el momento
  };
})();
// lo que pide el motor de sonido de core
const SPY_VOL = VOLUMEN.crear({ musicaBase: 0.3 });
function sonidoApagado() { return SPY_VOL.apagado(SAVE); }
function volGeneral() { return SPY_VOL.general(SAVE); }
function volMusica() { return SPY_VOL.musica(SAVE); }
function musicUpdate() { /* el prototipo aún no tiene música: la hará Yoshi */ }
