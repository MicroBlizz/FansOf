// Fans of Pop · RAID, el dibujo escondido (adaptador de pantalla, tarea 448, nodo n4; Pepins 28-11-2026: «un dibujo escondido» y «los gráficos
// tienen que ser como los del juego»): el dibujo que van formando las burbujas al hundirse (cada una se queda del color de su punto). Es el salón del jefe hecho con los dibujos de Pop:
// el fondo de los jefes (fondo-jefe), el CEO slime (sl-ceo) sentado en su sillón, y cofres y monedas a sus pies. Se pinta en un lienzo de 512x512
// (un píxel por burbuja) dentro de la zona de la raid: en la de la semana ocupa todo el tablero; en la de prueba, su bloque de 48x48.
// · crea(zona, creaLienzo, imagen) → { lienzo, pixeles } (pixeles = el color de cada burbuja hundida); 'imagen(k)' da el dibujo ya cargado de Pop o null (entonces queda el color crema).
'use strict';
const PP_RAID_DIBUJO = (() => {
  const LADO = 512;
  // dónde va cada cosa, en medidas de 0 a 100: [dibujo, x, y, lado]
  const COSAS = Object.freeze([
    ['sl-ceo', 27, 25, 46], ['i-cofre', 3, 66, 24], ['i-cofre', 73, 66, 24],
    ['i-moneda', 30, 82, 11], ['i-moneda', 44, 86, 11], ['i-moneda', 58, 82, 11], ['i-moneda', 16, 88, 9], ['i-moneda', 76, 89, 9],
    ['i-estrella', 6, 6, 13], ['i-estrella', 81, 6, 13],
  ]);

  // pinta el salón en un lienzo, en medidas de 0 a 100 escaladas a `lado` píxeles desde (x, y)
  function salon(c, x, y, lado, imagen) {
    c.save();
    c.translate(x, y);
    c.scale(lado / 100, lado / 100);
    c.beginPath(); c.rect(0, 0, 100, 100); c.clip();
    c.fillStyle = '#fff3d6'; c.fillRect(0, 0, 100, 100);
    const fondo = imagen('fondo-jefe');
    if (fondo) c.drawImage(fondo, 0, fondo.height * 0.16, fondo.width, fondo.width, 0, 0, 100, 100);   // el cuadrado del sillón
    for (const [k, cx, cy, l] of COSAS) { const im = imagen(k); if (im) c.drawImage(im, cx, cy, l, l); }
    c.restore();
  }

  function crea(zona, creaLienzo, imagen) {
    const lienzo = creaLienzo(LADO, LADO);
    const c = lienzo.getContext('2d', { willReadFrequently: true });
    salon(c, zona.x, zona.y, zona.lado, imagen);
    return Object.freeze({ lienzo, pixeles: new Uint32Array(c.getImageData(0, 0, LADO, LADO).data.buffer) });
  }
  return Object.freeze({ LADO, crea });
})();
