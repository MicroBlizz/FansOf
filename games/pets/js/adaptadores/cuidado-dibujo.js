// Fans Of Pets · adaptador · DIBUJO DE LOS CUIDADOS: lo que comparten los objetos de los minijuegos de cuidado (bol, cuchara, esponja, ducha, espuma):
// contorno grueso y colores de core, como el resto del juego. Nada de emojis: todo dibujado.
'use strict';
PT.cuidadoDibujo = (() => {
  const TINTA = '#2b1a14', GROSOR = 6;
  // rellena y contornea lo que traza(ctx) deja como camino
  function forma(ctx, relleno, traza, grosor = GROSOR) {
    ctx.beginPath(); traza(ctx);
    ctx.lineJoin = ctx.lineCap = 'round'; ctx.lineWidth = grosor; ctx.strokeStyle = TINTA; ctx.fillStyle = relleno;
    ctx.stroke(); ctx.fill();
  }
  const elipse = (x, y, rx, ry, giro = 0) => c => c.ellipse(x, y, rx, ry, giro, 0, Math.PI * 2);
  const poligono = puntos => c => { puntos.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
  // una frase de ayuda arriba, con el contorno de la tinta para que se lea sobre cualquier fondo
  function ayuda(ctx, texto, y = 110) {
    ctx.font = '700 26px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 7; ctx.strokeStyle = TINTA; ctx.fillStyle = '#fff6df';
    ctx.strokeText(texto, 270, y); ctx.fillText(texto, 270, y);
  }
  const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  return { forma, elipse, poligono, ayuda, distancia, TINTA };
})();
