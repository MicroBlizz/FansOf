// Tiny Fans · adaptador · MODELOS · NIDO: el robot aspirador con la casita de cartón encima (el nido visto desde fuera, con el felpudo
// de entrada), el suelo del nido por dentro y cada pieza que se construye o que hay en un asalto (paredes, puerta, chinchetas, almacén
// y trampas). Las piezas van centradas en su casilla, que mide 1 unidad.
'use strict';
(() => {
  const P = TN.piezas3d, K = AJUSTES.modelos.color;
  TN.modelos.aspirador = () => {
    const g = P.grupo(), y0 = 1.18;
    P.cilindro(g, 0xf2efe6, 5.2, 5.2, 1, 0, .65, 0, null, 24); P.cilindro(g, K.tinta, 5.3, 5.3, .3, 0, .4, 0, null, 24); P.cilindro(g, 0xbfcbd8, 4.4, 4.4, .06, 0, 1.17, 0, null, 24);
    P.cilindro(g, K.verde, .5, .5, .1, 0, 1.2, -4.3, null, 10, { emissive: 0x1d6a22 });
    // la casita: paredes de cartón, tejado de notas adhesivas y ventanas con luz
    P.caja(g, K.carton, 4.6, .14, 4.6, 0, y0, 0);
    P.caja(g, K.carton, 3.2, 2.1, 2.4, -.2, y0 + 1.1, -.4);
    for (const s of [-1, 1]) P.caja(g, K.nota, 3.6, .08, 1.75, -.2, y0 + 2.55, -.4 + s * .62, [s * .62, 0, 0]);
    P.caja(g, 0x5b3418, .8, 1.25, .06, .25, y0 + .66, .82); P.bola(g, K.oro, .07, .07, .04, .5, y0 + .66, .86);
    for (const x of [-1.15, -.45]) { P.caja(g, 0xffd27a, .48, .48, .05, x, y0 + 1.35, .82, null, { emissive: 0xffa53d }); P.halo(g, 0xffb45c, .5, x, y0 + 1.35, 1.05); }
    P.cilindro(g, K.rojo, .32, .32, .5, .7, y0 + 2.75, -.9, null, 12);
    P.palo(g, 0xd8b06a, .05, 1.8, y0, 1.6, 1.8, y0 + 2.4, 1.6); P.caja(g, K.naranja, .7, .42, .04, 2.15, y0 + 2.15, 1.6);
    for (let i = 0; i < 9; i++) { const a = -2.2 + i * .55; P.palo(g, 0xe9c98a, .07, a, y0, 2.2, a, y0 + .5, 2.2); }
    // el felpudo naranja delante: ahí se entra al nido
    P.caja(g, K.naranja, 3.2, .08, 2, 0, .05, 6.4); P.caja(g, 0xfff7d1, 2.4, .09, .3, 0, .06, 6.4);
    return g;
  };
  TN.modelos.sueloNido = (columnas, filas) => {
    const g = P.grupo();
    for (let c = 0; c < columnas; c++) for (let f = 0; f < filas; f++) P.caja(g, (c + f) % 2 ? 0xd9b77c : 0xcfa968, .98, .1, .98, c + .5, -.05, f + .5);
    P.caja(g, 0x9c7340, columnas + .6, .5, filas + .6, columnas / 2, -.36, filas / 2);
    return g;
  };
  const PIEZAS = {
    'pared-carton': g => { P.caja(g, 0xa9763a, .96, 1.1, .96, 0, .55, 0); P.caja(g, 0x8a5c28, .98, .14, .98, 0, 1.12, 0); },
    'pared-plastico': g => { P.caja(g, 0x4fb8e8, .96, 1.2, .96, 0, .6, 0); P.caja(g, 0x2e8bff, .98, .12, .98, 0, 1.2, 0); },
    puerta: g => { P.caja(g, 0x5b3418, .9, 1, .24, 0, .5, 0); P.bola(g, K.oro, .07, .07, .07, .26, .5, .14); },
    chinchetas: g => { for (const [x, z] of [[-.25, -.25], [.25, -.2], [0, .22], [-.28, .2], [.3, .28]]) { P.cono(g, K.metal, .07, .34, x, .2, z); P.cilindro(g, K.rojo, .12, .12, .05, x, .03, z); } },
    almacen: g => { P.caja(g, K.azul, .84, .56, .64, 0, .28, 0); P.caja(g, K.oro, .5, .28, .03, 0, .3, .33); P.halo(g, 0xffd23f, .7, 0, .5, 0); },
    ratonera: g => { P.caja(g, 0xd8b06a, .86, .08, .6, 0, .04, 0); P.palo(g, K.metal, .05, -.3, .1, -.2, .3, .1, -.2); P.caja(g, K.oro, .16, .1, .16, 0, .12, .12); },
    pegamento: g => { P.disco(g, 0xfff0a0, .44, 0, 0, .8); P.bola(g, 0xfff7d1, .2, .06, .16, .1, .05, -.08); },
    ventilador: g => { P.cilindro(g, 0x3a4252, .34, .4, .2, 0, .1, 0, null, 12); const a = P.grupo(); g.add(a); a.position.y = .3; for (let i = 0; i < 3; i++) P.caja(a, 0x7cc4f2, .7, .04, .16, 0, 0, 0, [0, i * 2.09, 0]); g.userData.anima = t => { a.rotation.y = t * 9; }; },
  };
  TN.modelos.pieza = nombre => { const g = P.grupo(); (PIEZAS[nombre] || PIEZAS['pared-carton'])(g); return g; };
})();
