// Fans of Dungeons · El registro de figuras y sus animaciones cuadro a cuadro: cada personaje se dibuja al tamaño de la
// mazmorra mirando a los dos lados, con respirar (4 cuadros), andar (4, con aplastar y estirar), golpear (3) y daño (1), más
// la cara de muerto. Se dibujan la primera vez que hacen falta y se guardan. pintaFigura() los pone con los pies en la casilla.
'use strict';

const FIG = {};        // nombre → { hacer, o } (la receta) y, cuando se piden, sus cuadros
const ESC_FIG = 0.66;   // escala general: un héroe mide casilla y media, un Becario poco más de una

// cuadros de cada animación: t (aplastar/estirar/inclinar) y c (la pose que entiende el dibujo)
const ANIMS = {
  quieto: [[{}, { hy: 0 }], [{ sy: 1.02 }, { hy: -1 }], [{ sy: 1.04 }, { hy: -2 }], [{ sy: 1.02 }, { hy: -1 }]],
  anda: [[{ sx: 1.05, sy: 0.95 }, { paso: 0, hy: 0 }], [{ sx: 0.96, sy: 1.06 }, { paso: 0.25, hy: -3 }], [{ sx: 1.05, sy: 0.95 }, { paso: 0.5, hy: 0 }], [{ sx: 0.96, sy: 1.06 }, { paso: 0.75, hy: -3 }]],
  golpe: [[{ sx: 0.94, sy: 1.04, inc: -0.18 }, { golpe: 0.3, hy: -1 }], [{ sx: 1.1, sy: 0.92, inc: 0.28 }, { golpe: 1, hy: 0 }], [{ sx: 1.02, sy: 0.98, inc: 0.1 }, { golpe: 0.5, hy: 0 }]],
  dano: [[{ sx: 0.9, sy: 1.08, inc: -0.3 }, { hy: -1, cara: 'dolor' }]],
  muerto: [[{ sx: 1.08, sy: 0.9 }, { cara: 'x' }]],
};

// hacer(t, c) es la fábrica del dibujo (devuelve el lienzo con los pies en ox, oy). o: { esc, c (pose base), flota (sin andar) }
function figura(nombre, hacer, o = {}) { FIG[nombre] = { hacer, o, cuadros: {} }; }

// los cuadros de una animación de una figura, mirando a un lado (se fabrican la primera vez)
function cuadros(nombre, anim, izq) {
  const f = FIG[nombre];
  if (!f) return null;
  const k = anim + (izq ? 'I' : 'D');
  if (f.cuadros[k]) return f.cuadros[k];
  const esc = (f.o.esc || 1) * ESC_FIG, base = f.o.c || {};
  const lista = (ANIMS[anim] || ANIMS.quieto).map(([t, c]) => {
    const T = { sx: esc * (t.sx || 1), sy: esc * (t.sy || 1), inc: t.inc || 0, espejo: !!izq };
    const C = Object.assign({}, base, c);
    if (f.o.flota && anim === 'anda') { C.paso = 0; C.hy = (c.hy || 0) - 2; }
    return f.hacer(T, C);
  });
  f.cuadros[k] = lista;
  return lista;
}
// el cuadro que toca: anim, f (índice), izq
function cuadro(nombre, anim, fi, izq) { const l = cuadros(nombre, anim, izq); return l ? l[((fi % l.length) + l.length) % l.length] : null; }

function creaFiguras() {
  figura('bunny', fotoBunny, {});
  figura('cybermarine', fotoCyber, {});
  figura('necrolord', fotoNecro, {});
  figura('lola', fotoLola, { c: { vapor: 1 } });
  figura('bug', fotoBug, { esc: 1.1 });
  if (typeof creaFigurasEnemigos === 'function') creaFigurasEnemigos();
  if (typeof creaFigurasJefes === 'function') creaFigurasJefes();
  if (typeof creaFigurasNuevas === 'function') creaFigurasNuevas();
  // los cuadros de respirar de los héroes se fabrican ya (salen en la portada); el resto, cuando toque
  for (const n of ['bunny', 'cybermarine', 'necrolord']) cuadros(n, 'quieto', false);
}

// pinta una figura con los pies en (x, y) de la pantalla. o: { anim, f (cuadro), izq, blanco (destello) }
function pintaFigura(ctx, nombre, x, y, o = {}) {
  const s = cuadro(nombre, o.anim || 'quieto', o.f || 0, o.izq);
  if (s) pintaSpr(ctx, s, x, y, o.blanco);
}
// alto (en píxeles) de una figura, para colocar barras y coronas encima
// (mide la primera fila con color del dibujo, una vez por figura)
const ALTO_FIG = new Map();
function altoFigura(nombre) {
  if (ALTO_FIG.has(nombre)) return ALTO_FIG.get(nombre);
  const s = cuadro(nombre, 'quieto', 0, false); if (!s) return 24;
  let alto = s.oy - (s.h - s.oy);
  try {
    const d = s.c.getContext('2d').getImageData(0, 0, s.c.width, s.c.height).data;
    for (let y = 0; y < s.c.height; y++) { let hay = false; for (let x = 0; x < s.c.width; x++) if (d[(y * s.c.width + x) * 4 + 3] > 0) { hay = true; break; } if (hay) { alto = s.oy - y; break; } }
  } catch (e) { /* sin medir */ }
  ALTO_FIG.set(nombre, alto); return alto;
}
