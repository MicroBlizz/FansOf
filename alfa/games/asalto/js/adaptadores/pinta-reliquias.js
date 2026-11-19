// Fans of Asalto · ADAPTADORES · Pinta las reliquias que llevas en la partida, en su tira entre la arena y la tienda (P.reliquias, tarea
// #158: antes, tras elegirlas, no se veían en ningún sitio): la etiqueta RELIQUIAS y una casilla con el icono de cada una. Tocar la tira
// abre la ventana con lo que hace cada una (ventanas-reliquias.js). En plena batalla se ven, pero no se tocan, como la tienda.
'use strict';
AS.pinta = AS.pinta || {};
AS.pinta.reliquias = (() => {
  const T = AS.tema, C = T.C, tx = AS.texto.pinta;
  const HUECO = 4;

  function casilla(g, x, y, lado, id) {
    const r = ASALTO.reliquias[id];
    T.losa(g, x, y, lado, lado, C.oro);
    if (r) AS.dibujos.icono(g, AS.pinta.reliquias.icono(id, r), x + lado / 2, y + lado / 2, 1);
  }
  function mas(g, x, y, lado, n) {
    T.losa(g, x, y, lado, lado, C.madera);
    tx(g, '+' + n, x + lado / 2, y + Math.round((lado - 8) / 2), { col: C.crema, borde: true, ancla: 'c' });
  }
  // sin reliquias, la tira lo dice en apagado (y no se toca)
  function vacia(g, r) {
    tx(g, tr('Aún no tienes reliquias'), r.x + r.w / 2, r.y + Math.round((r.h - 8) / 2), { col: '#c8a878', ancla: 'c', max: r.w - 8 });
  }
  return (g, P, p, E) => {
    const r = P.reliquias, lista = p.reliquias;
    if (!lista.length) return vacia(g, r);
    const ew = Math.round(r.w * 0.27), lado = r.h, sitio = Math.floor((r.w - ew - 6 + HUECO) / (lado + HUECO));
    tx(g, tr('RELIQUIAS'), r.x + ew / 2, r.y + Math.round((r.h - 8) / 2), { col: C.oro, borde: true, ancla: 'c', max: ew - 4 });
    const se = lista.length > sitio ? sitio - 1 : lista.length, x0 = r.x + ew + 6;
    for (let i = 0; i < se; i++) casilla(g, x0 + i * (lado + HUECO), r.y, lado, lista[i]);
    if (se < lista.length) mas(g, x0 + se * (lado + HUECO), r.y, lado, lista.length - se);
    if (!E.batalla) E.zona(r, 'reliquias');
  };
})();
// el icono de una reliquia: el suyo, el de su clase o, si no tiene, la gema (como en la carta al elegirla); lo usa también la ventana
AS.pinta.reliquias.icono = (id, r) => r.icono || (r.clase ? 'clase-' + r.clase : 'gema');
