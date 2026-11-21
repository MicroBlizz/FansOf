// Fans of Island · adaptadores/arte-crazybunny: CRAZYBUNNY en lonchas hechas por Yoshi (tarea #306): la tira img/crazybunny-lonchas.png (modelo 3D de Trellis2
// cortado en 96 lonchas con lonchas_cortar y retocado con herramientas/lonchas/retocar.py). Las posturas no son dibujos aparte:
// se estira al saltar y se aplasta al aterrizar escalando las lonchas. Desde la 0.4.2 (Pepins, ADR 196) el dibujo mide lo mismo que el golpe: C_H.
'use strict';
{
const { TAREAS } = IS;
const C_H = 66;   // alto con el que chocan enemigos, cocos y zanahorias (el de la 0.4.0) y alto del dibujo en reposo
const PILAS_C = {};
(() => {
  const TIRA = { src: 'img/crazybunny-lonchas.png?v=1', ancho: 44, fondo: 47, alto: 96 };
  const POSES = {   // sx = ancho, sz = alto (1 = como el modelo)
    reposo: { sx: 1, sz: 1 }, paso1: { sx: 1.02, sz: 0.97 }, paso2: { sx: 0.99, sz: 1.01 }, salto: { sx: 0.94, sz: 1.06 },
    cae: { sx: 0.97, sz: 1.03 }, flota: { sx: 1.03, sz: 0.98 }, aterriza: { sx: 1.12, sz: 0.84 }, herido: { sx: 1, sz: 0.95 },
  };
  const img = new Image();
  let fallo = null;
  img.onerror = () => { fallo = new Error('Island: no carga ' + TIRA.src); };
  img.src = TIRA.src;
  function hoja(z, an, fo, ancho) {   // la loncha z de la tira, escalada a an x fo
    const c = document.createElement('canvas'); c.width = an; c.height = fo;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(img, z * ancho, 0, ancho, TIRA.fondo, 0, 0, an, fo);
    return c;
  }
  function postura(p) {   // la pila de una postura: cada loncha nueva toma la del modelo a su altura
    const e = C_H / TIRA.alto;   // la tira de 96 lonchas, encogida al alto del golpe
    const an = Math.round(TIRA.ancho * p.sx * e), fo = Math.round(TIRA.fondo * p.sx * e), al = Math.round(TIRA.alto * p.sz * e), hojas = [];
    for (let z = 0; z < al; z++) hojas.push(hoja(Math.min(TIRA.alto - 1, Math.floor((z + 0.5) / (p.sz * e))), an, fo, TIRA.ancho));
    return { hojas, an, fo, al, cache: new Map() };
  }
  function fabrica() {   // tarea de carga: si la imagen aún no ha llegado, vuelve a la cola
    if (fallo) throw fallo;
    if (!img.complete || !img.naturalWidth) { TAREAS.unshift(fabrica); return; }
    for (const n in POSES) PILAS_C[n] = postura(POSES[n]);
  }
  TAREAS.push(fabrica);
})();
IS.arte.C_H = C_H; IS.arte.PILAS_C = PILAS_C;
}
