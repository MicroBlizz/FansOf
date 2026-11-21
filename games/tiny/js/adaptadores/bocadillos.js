// Tiny Fans · adaptador · BOCADILLOS: textos cortos que salen sobre el mundo y se van solos (lo que dice el becario, «+3», «¡Llena!»).
// No estorban a los toques.
'use strict';
TN.bocadillos = (() => {
  const vivos = new Set();
  return {
    // punto: { x, y } en píxeles de CSS dentro de #tn-escenario (vista.aPantalla); clase: 'bueno' | 'malo' | '' ; segundos: lo que dura
    dice(texto, punto, segundos = 1.2, clase = '') {
      const b = TN.crea('div', { className: 'tn-bocadillo ' + clase, textContent: texto });
      b.style.left = Math.max(120, Math.min(TN.capa().clientWidth - 120, punto.x)) + 'px'; b.style.top = punto.y + 'px'; b.style.animationDuration = segundos + 's';
      TN.capa().append(b); vivos.add(b);
      setTimeout(() => { b.remove(); vivos.delete(b); }, segundos * 1000);
    },
    limpia() { for (const b of vivos) b.remove(); vivos.clear(); },
  };
})();
