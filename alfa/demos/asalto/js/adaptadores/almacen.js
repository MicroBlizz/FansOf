// Fans of Asalto · ADAPTADORES · El almacén: guarda el progreso (plumas, mejoras, equipo, logros…) en este navegador y avisa a core
// para que lo suba a la nube, y guarda aparte la partida en curso (esa no sube: es de este aparato).
// SAVE es la variable que core espera de todo juego (core/js/sistema/cuenta.js la sube tal cual): aquí es siempre una copia del
// progreso, que solo cambia por los casos de uso. Las cuatro funciones de sonido del final también las pide core (sonido.js).
'use strict';
const SAVE = (() => {
  let j = null;
  try { j = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { j = null; }   // sin almacenamiento o con algo ilegible: se empieza de nuevo
  return AS.progreso.deJSON(ASALTO, j);
})();
AS.almacen = (() => {
  const CLAVE_PARTIDA = SAVE_KEY + '-partida';
  const escribe = (clave, valor) => { try { if (valor === null) localStorage.removeItem(clave); else localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { AS.sinAlmacen = true; /* modo privado o disco lleno: se juega igual, sin guardar */ } };
  return {
    carga: () => JSON.parse(JSON.stringify(SAVE)),
    guarda(p) {
      for (const k of Object.keys(SAVE)) delete SAVE[k];
      Object.assign(SAVE, JSON.parse(JSON.stringify(p)));
      escribe(SAVE_KEY, SAVE);
      if (typeof CUENTA !== 'undefined') CUENTA.cambio();
    },
    cargaPartida() { try { return JSON.parse(localStorage.getItem(CLAVE_PARTIDA)); } catch (e) { return null; } },
    guardaPartida: j => escribe(CLAVE_PARTIDA, j),
  };
})();
// lo que pide el motor de sonido de core
const AS_VOL = VOLUMEN.crear({ musicaBase: 0.3 });
function sonidoApagado() { return AS_VOL.apagado(SAVE); }
function volGeneral() { return AS_VOL.general(SAVE); }
function volMusica() { return AS_VOL.musica(SAVE); }
function musicUpdate() { /* la música la elige AS.suena.bucle (sonidos.js) */ }
