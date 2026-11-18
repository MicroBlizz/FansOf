// Fans of Asalto · ADAPTADORES · La franja que explica y la mano que señala, para la partida guiada (guia.js) y los consejos que salen
// la primera vez que aparece algo (consejos.js): una franja de pergamino de lado a lado de la arena (arriba o abajo) con la frase en
// letra grande y un botón a la derecha, y una mano de píxeles con un marco de oro fino alrededor de lo que hay que mirar o tocar.
// Sin luces: no deben tapar el botón que señalan. Solo pinta; no decide reglas.
'use strict';
AS.franja = (() => {
  const T = AS.tema, C = T.C;
  /* ---------- la mano y el marco ---------- */
  // una mano de píxeles; (x, y) es la punta del dedo. Señala hacia arriba (está debajo de lo que toca) o hacia abajo (está encima),
  // siempre fuera del botón, para no tapar su texto ni su precio
  const MANO = ['..X.....', '.XWX....', '.XWX....', '.XWX....', '.XWXXX..', '.XWWXWXX', 'XXWWWWWX', 'XWWWWWWX', 'XWWWWWWX', '.XWWWWX.', '..XXXX..'];
  const K = 5, ALTO = MANO.length * K;
  function mano(g, x, y, haciaAbajo, aprieta) {
    const x0 = Math.round(x) - 2 * K - 2, y0 = Math.round(y) + (haciaAbajo ? -ALTO - (aprieta ? 3 : 0) : (aprieta ? 3 : 0));
    MANO.forEach((fila, j0) => {
      const j = haciaAbajo ? MANO.length - 1 - j0 : j0;
      for (let i = 0; i < fila.length; i++) if (fila[i] !== '.') { g.fillStyle = fila[i] === 'X' ? C.tinta : C.crema; g.fillRect(x0 + i * K, y0 + j * K, K, K); }
    });
    g.fillStyle = C.oro; g.fillRect(x0 + 2 * K, y0 + (haciaAbajo ? ALTO - 2 * K : K), K, K);   // la uña, para que se vea dónde apunta
  }
  // un marco de oro fino que late alrededor de lo que hay que tocar
  function marco(g, r, t) {
    const e = 3 + Math.round(Math.abs(Math.sin(t * 4)) * 3);
    g.fillStyle = C.tinta; g.fillRect(r.x - e - 2, r.y - e - 2, r.w + e * 2 + 4, 6); g.fillRect(r.x - e - 2, r.y + r.h + e - 4, r.w + e * 2 + 4, 6); g.fillRect(r.x - e - 2, r.y - e - 2, 6, r.h + e * 2 + 4); g.fillRect(r.x + r.w + e - 4, r.y - e - 2, 6, r.h + e * 2 + 4);
    g.fillStyle = C.oro; g.fillRect(r.x - e, r.y - e, r.w + e * 2, 3); g.fillRect(r.x - e, r.y + r.h + e - 3, r.w + e * 2, 3); g.fillRect(r.x - e, r.y - e, 3, r.h + e * 2); g.fillRect(r.x + r.w + e - 3, r.y - e, 3, r.h + e * 2);
  }
  // o: { r: lo que hay que mirar, lado: 'arriba' | 'abajo' (dónde va la mano), fx: a qué parte del ancho apunta (0 a 1) }
  function senala(g, o, t) {
    const r = o.r, sube = Math.round(Math.abs(Math.sin(t * 5)) * 6), x = r.x + Math.round(r.w * o.fx), arriba = o.lado === 'arriba';
    marco(g, r, t);
    mano(g, x, arriba ? r.y - 8 - sube : r.y + r.h + 8 + sube, arriba, Math.sin(t * 5) > 0.7);
  }
  // el recuadro de un héroe en su hueco del campo, para señalarlo
  const heroe = (P, i) => { const s = P.hueco(i); return { x: s.x - 44, y: s.y - 96, w: 88, h: 104 }; };

  /* ---------- la franja ---------- */
  const BW = 110;   // el ancho del botón de la derecha
  // cuántas líneas ocupa la frase a letra grande (48) en el hueco que le deja el botón
  const ancho = P => P.W - 12 - BW - 40;
  const lineas = (P, txt) => AS.texto.parte(txt, 48, ancho(P) - 8).length;
  // el recuadro de la franja: arriba tapa la tira de misiones; abajo queda justo encima de la tira de la tienda
  function sitio(P, txt, lado) {
    const n = lineas(P, txt), h = n <= 2 ? 100 : 64 + n * 36, a = P.arena;   // la letra siempre grande: si hace falta, la franja crece
    return { x: 6, y: lado === 'abajo' ? a.y + a.h - h - 6 : a.y + 6, w: P.W - 12, h, t: n <= 4 ? 48 : 32 };
  }
  // o: { txt (ya traducido), lado: 'arriba' | 'abajo', boton: { txt, col, que }, pasos: { n, total } (opcional) }. Devuelve el recuadro
  function pinta(g, P, E, o) {
    const r = sitio(P, o.txt, o.lado), b = { x: r.x + r.w - BW - 12, y: r.y + 14, w: BW, h: 46 };
    const tw = b.x - r.x - 20, cx = r.x + 12 + Math.round(tw / 2);
    T.pergamino(g, r.x, r.y, r.w, r.h);
    E.zona(r, 'franja');   // tapa lo de debajo: tocar la franja no hace nada
    AS.texto.parrafo(g, o.txt, cx, r.y + Math.round(r.h / 2) + 2, { t: r.t, col: C.tinta, borde: false, max: tw - 8 });
    T.boton(g, b.x, b.y, b.w, b.h, o.boton.col);
    AS.texto.pinta(g, o.boton.txt, b.x + b.w / 2, b.y + Math.round((b.h - 8) / 2), { col: C.crema, ancla: 'c', max: b.w - 12 });
    E.zona(b, o.boton.que);
    if (o.pasos) {   // por qué paso va, en puntos bajo el botón
      const N = o.pasos.total, d0 = b.x + Math.round((b.w - (N * 20 - 8)) / 2);
      for (let i = 0; i < N; i++) { g.fillStyle = i <= o.pasos.n ? C.sangre : C.perg3; g.fillRect(d0 + i * 20, b.y + b.h + 12, 12, 8); }
    }
    return r;
  }
  return { pinta, senala, marco, heroe };
})();
