// Fans of Island · adaptadores/dibujo-terreno: EL TERRENO en lonchas (IS.Dibujo.terreno) con su contorno, y lo que va detrás de CrazyBunny
// (IS.Dibujo.atras): palmeras, hibiscos, puentes, islas flotantes y los peces que nadan por detrás del carril.
'use strict';
{
  const { T, D, CARRIL } = IS.MEDIDAS;
  const { BORDE } = IS.Lonchas;
  const { PIEZA, PLAT } = IS.arte;
  const { sy, cerca, pieza, ente } = IS.Dibujo;

  function bordes(v, c, x, top) {   // raya de contorno: borde de atrás y laterales donde la columna de al lado es más baja
    const { ctx, fisica } = v;
    ctx.fillStyle = BORDE; ctx.fillRect(x, sy(v, 0, top) - 1, T, 1);
    for (const [lado, xb] of [[-1, x], [1, x + T - 1]]) {
      const tv = fisica.arribaSuelo(c + lado);
      if (tv < top) { const y1 = sy(v, 0, top) - 1, y2 = tv === -Infinity ? v.L.vh : sy(v, D, tv); ctx.fillRect(xb, y1, 1, y2 - y1); }
    }
  }
  function columna(v, c) {
    const n = v.nivel.NIV[c]; if (n.s < 0) return;
    const x = c * T - v.cx, top = n.s * T;
    pieza(v, PIEZA.base, x, 0, -2 * T);
    for (let L = 0; L <= n.s; L++) pieza(v, L === n.s ? PIEZA.hierba[n.v] : PIEZA.arena[n.v], x, 0, (L - 1) * T);
    bordes(v, c, x, top);
    n.pila.forEach((t, k) => pieza(v, PIEZA[t], x, 0, (n.s + k) * T));
  }
  function terreno(v) {
    const c0 = Math.max(0, Math.floor(v.cx / T) - 1), c1 = Math.min(v.nivel.COLS - 1, Math.floor((v.cx + v.L.vw) / T) + 1);
    for (let c = c0; c <= c1; c++) columna(v, c);
  }
  function plataformas(v) {   // los puentes de tablas y las islas flotantes (su dibujo está en IS.arte.PLAT)
    for (const p of v.nivel.PLAT) {
      if (p.tipo === 'tabla') pieza(v, PLAT.get(p), p.a * T - v.cx, CARRIL - 12, p.z - 6);
      else pieza(v, PLAT.get(p), p.a * T - v.cx, CARRIL - 18, p.z - 22);
    }
  }
  function plantas(v) {   // palmeras e hibiscos
    const { NIV, ATRAS, DECO } = v.nivel, { arribaSuelo } = v.fisica;
    for (const a of ATRAS) if (NIV[a.c].s >= 0 && cerca(v, (a.c + 0.5) * T, 70)) ente(v, PIEZA.palmeras[a.tipo], a.giro, (a.c + 0.5) * T, a.y, arribaSuelo(a.c), 0);
    for (const d of DECO) if (d.t === 'flor' && cerca(v, d.x, 20)) ente(v, PIEZA.flor, d.giro, d.x, d.y, arribaSuelo(Math.floor(d.x / T)), 0);
  }
  function atras(v) {   // palmeras, hibiscos, puentes, islas flotantes y los peces del carril
    plantas(v);
    plataformas(v);
    for (const f of v.sesion.estado.peces) if (f.y <= CARRIL) IS.Dibujo.pez(v, f);
  }
  Object.assign(IS.Dibujo, { terreno, atras });
}
