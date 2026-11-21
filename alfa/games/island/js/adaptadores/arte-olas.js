// Fans of Island · adaptadores/arte-olas: las olas de delante (camino A, por código) en lonchas: una cresta alargada con espuma blanca
// arriba y sin contorno (Pepins, 21-11-2026); 3 variantes. Van a IS.arte.PILAS_OLA.
'use strict';
{
const { ruido, TAREAS } = IS;
const { pila, quieta } = IS.Lonchas;
const OLA = { an: 44, fo: 12, al: 10 }, PILAS_OLA = [];
function colorOla(z, h, y, x, v) {
  if (z >= h - 1.2) return ruido(x, y, v + 7) < 0.8 ? '#ffffff' : '#dff4ff';
  if (z >= h - 2.4) return ruido(x, y, v + 3) < 0.55 ? '#bfeaff' : '#ffffff';
  if (y < OLA.fo / 2) return '#7cc6ee';
  return z < 3 ? '#2a7fc0' : '#3f9ad8';
}
function pilaOla(v) {
  return pila(OLA.an, OLA.fo, OLA.al, (z, x, y) => {
    const fin = Math.sin(Math.PI * (x + 0.5) / OLA.an) ** 0.6, cuerpo = Math.sin(Math.PI * (y + 0.5) / OLA.fo);
    const h = OLA.al * fin * cuerpo * (0.75 + 0.25 * Math.sin(x * 0.45 + v * 2));
    return z < h ? colorOla(z, h, y, x, v) : null;
  });
}
TAREAS.push(() => { for (let v = 0; v < 3; v++) PILAS_OLA.push(quieta(pilaOla(v), false)); });
IS.arte.PILAS_OLA = PILAS_OLA;
}
