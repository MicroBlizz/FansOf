// Fans of Pop · RAID, el enlace para compartir (dominio puro, tarea 448, nodo n5): al quedarse sin toques se pasa a los amigos la dirección
// del juego con `?raid=1`, y quien la abre entra directo a la raid de la semana. `?raid=local` es otra cosa (el servidor de mentira de las
// pruebas, js/raid/adaptadores/pantalla.js) y no cuenta como enlace. Aquí no hay navegador: quien llama pasa `location.search` y la dirección base.
// · pide(search): ¿la dirección trae el enlace de la raid? · url(base): la dirección para compartir. · limpia(search): la misma búsqueda sin
//   `raid`, para quitarlo de la barra una vez abierta. · nueva(vista, lunes): ¿hay una raid que este jugador aún no ha abierto esta semana?
'use strict';
const PP_RAID_ENLACE = (() => {
  const valor = search => new URLSearchParams(search || '').get('raid');
  const pide = search => { const v = valor(search); return v !== null && v !== 'local'; };
  const url = base => String(base).split(/[?#]/)[0] + '?raid=1';
  function limpia(search) {
    const q = new URLSearchParams(search || '');
    if (q.get('raid') !== 'local') q.delete('raid');
    const s = q.toString();
    return s ? '?' + s : '';
  }
  const nueva = (vista, lunes) => !!lunes && vista !== lunes;
  return Object.freeze({ pide, url, limpia, nueva });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_ENLACE;
