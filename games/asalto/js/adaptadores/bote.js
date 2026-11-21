// Fans of Asalto · ADAPTADORES · El bote al andar: cuánto se levanta el muñeco en cada momento del paso cuando tiene sus propios
// fotogramas de andar (sin ellos ya se mueve entero por código, en dibujos.js). Va acompasado con los fotogramas: en los de apoyo
// (andar-1 y andar-3, al empezar cada paso) toca el suelo y en los de paso (andar-2 y andar-4) está arriba. En píxeles enteros,
// para que el pixel art no se emborrone. Puro: solo números.
'use strict';
AS.bote = (() => {
  const ALTO = 2;   // píxeles del dibujo que sube en lo más alto del paso (se multiplica por su escala)
  // t: segundos desde que empezó a andar; fotograma: lo que dura cada fotograma de andar; esc: su escala. Devuelve el dy (0 o negativo)
  return (t, fotograma, esc = 1) => {
    if (!(fotograma > 0) || !(t > 0)) return 0;
    const paso = fotograma * 2;   // un paso son dos fotogramas: apoyo y paso
    return -Math.round(Math.abs(Math.sin(Math.PI * t / paso)) * ALTO * esc);
  };
})();
