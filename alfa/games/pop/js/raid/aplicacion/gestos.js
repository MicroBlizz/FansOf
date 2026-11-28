// Fans of Pop · RAID, los gestos (aplicación, tarea 448, nodo n4): convierte los dedos sobre el tablero en tres cosas: TOCAR (un dedo que baja y
// sube sin moverse apenas y pronto), ARRASTRAR (un dedo que se mueve) y PELLIZCAR (dos dedos que se juntan o se separan; el tablero sigue además
// al punto medio). Sin DOM ni reloj: la pantalla le pasa cada dedo con su número, su sitio en píxeles de diseño y la hora en ms.
// · crea({ alTocar(x, y), alArrastrar(dx, dy), alPellizcar(x, y, factor) }, { holgura, toqueMs }) → { abajo(id, x, y, t), mueve(id, x, y),
//   arriba(id, t), suelta(), dedos() }.
'use strict';
const PP_RAID_GESTOS = (() => {
  function crea({ alTocar, alArrastrar, alPellizcar }, { holgura = 12, toqueMs = 450 } = {}) {
    const dedos = new Map();   // id → { x, y }
    let gesto = null;          // el toque en curso: { id, x0, y0, t0, movido }
    const separa = () => { const [a, b] = [...dedos.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
    let antes = null;          // con dos dedos: la separación y el punto medio de la última vez

    function abajo(id, x, y, t) {
      dedos.set(id, { x, y });
      if (dedos.size === 1) gesto = { id, x0: x, y0: y, t0: t, movido: false };
      else { if (gesto) gesto.movido = true; antes = dedos.size === 2 ? separa() : null; }   // con el segundo dedo ya no es un toque
    }
    function unDedo(d, x, y) {
      const dx = x - d.x, dy = y - d.y;
      if (gesto && !gesto.movido && Math.hypot(x - gesto.x0, y - gesto.y0) > holgura) gesto.movido = true;
      if (!gesto || gesto.movido) alArrastrar(dx, dy);   // sin gesto: el dedo que queda tras un pellizco sigue arrastrando
      return !gesto || gesto.movido;   // mientras no se ha movido de verdad, el dedo no «gasta» su sitio (el arrastre empieza suave)
    }
    function dosDedos() {
      const ahora = separa();
      if (antes && antes.d > 0 && ahora.d > 0) { alArrastrar(ahora.mx - antes.mx, ahora.my - antes.my); alPellizcar(ahora.mx, ahora.my, ahora.d / antes.d); }
      antes = ahora;
    }
    function mueve(id, x, y) {
      const d = dedos.get(id);
      if (!d) return;
      if (dedos.size === 1) { if (unDedo(d, x, y)) { d.x = x; d.y = y; } return; }
      d.x = x; d.y = y;
      if (dedos.size === 2) dosDedos();
    }
    function arriba(id, t) {
      const estaba = dedos.delete(id);
      antes = null;
      if (!estaba || !gesto || gesto.id !== id) { if (!dedos.size) gesto = null; return; }
      const g = gesto;
      gesto = null;
      if (!g.movido && t - g.t0 <= toqueMs) alTocar(g.x0, g.y0);
    }
    function suelta() { dedos.clear(); gesto = null; antes = null; }
    return Object.freeze({ abajo, mueve, arriba, suelta, dedos: () => dedos.size });
  }
  return Object.freeze({ crea });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_GESTOS;
