// Fans of Asalto · ADAPTADORES · Pinta la tira de la tienda, bajo la arena: el botón TIENDA (brilla cuando te llega la esencia para
// algo de la oferta) y los 6 huecos de objeto con lo comprado, cada uno con su icono y su nivel. Tocar la tira abre la ventana de la
// tienda (ventanas-tienda.js). En plena batalla se ve, pero no se toca.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.tienda = (() => {
  const T = AS.tema, C = T.C, tx = AS.texto.pinta;
  const COL = [C.piedra, C.celeste, C.oro];   // el fondo del hueco, por la rareza del objeto
  // ¿hay algo en la oferta que se pueda comprar ahora mismo?
  function tienta(p) {
    const t = p.tienda, lleno = t.objetos.length >= ASALTO.tienda.huecos;
    return t.oferta.some(id => id && AS.tienda.precio(ASALTO, id) <= p.esencia && (!lleno || AS.tienda.mio(t, id)));
  }
  function boton(g, b, p, E) {
    const vale = p.fase === 'preparar' && !E.batalla, abajo = E.hunde('tienda', !vale);
    T.boton(g, b.x, b.y, b.w, b.h, vale ? C.oro : C.madera, abajo);
    if (vale && tienta(p) && (E.t % 1.4) < 0.7) { g.fillStyle = C.rojo; g.fillRect(b.x + b.w - 20, b.y + 4, 12, 12); g.fillStyle = C.crema; g.fillRect(b.x + b.w - 16, b.y + 6, 4, 5); g.fillRect(b.x + b.w - 16, b.y + 12, 4, 2); }   // un aviso rojo: ¡hay algo a tu alcance!
    tx(g, tr('TIENDA'), b.x + b.w / 2, b.y + Math.round((b.h - 8) / 2) + (abajo ? 3 : 0), { col: vale ? C.tinta : '#c8a878', borde: !vale, ancla: 'c', max: b.w - 16 });
  }
  function hueco(g, r, o) {
    const d = o && ASALTO.objetos[o.id];
    T.losa(g, r.x, r.y, r.w, r.h, d ? COL[d.rareza] : C.muro2);
    if (!d) return;
    AS.dibujos.icono(g, d.icono, r.x + Math.round(r.w / 2) - 6, r.y + Math.round(r.h / 2) - 2, 1);
    for (let i = 0; i < o.nivel; i++) { g.fillStyle = C.tinta; g.fillRect(r.x + r.w - 14, r.y + r.h - 14 - i * 9, 9, 8); g.fillStyle = C.rojo; g.fillRect(r.x + r.w - 12, r.y + r.h - 12 - i * 9, 5, 4); }   // un punto por nivel
  }
  return (g, P, p, E) => {
    const o = P.objetos, n = ASALTO.tienda.huecos, bw = Math.round(o.w * 0.27), w = Math.floor((o.w - bw - 6 - (n - 1) * 4) / n);
    boton(g, { x: o.x, y: o.y, w: bw, h: o.h }, p, E);
    for (let i = 0; i < n; i++) hueco(g, { x: o.x + bw + 6 + i * (w + 4), y: o.y, w, h: o.h - 4 }, p.tienda.objetos[i]);
    if (!E.batalla) E.zona(o, 'tienda');
  };
})();
