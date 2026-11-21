// Tiny Fans · adaptador · MODELOS · GIGANTE: el zapato enorme que cae del cielo y su disco de aviso en el suelo (liso a propósito: no
// delata el margen de gracia). zapato() mide unas 9 unidades de largo y se apoya en y = 0.
'use strict';
TN.modelos.zapato = () => {
  const P = TN.piezas3d, g = P.grupo();
  P.caja(g, 0x2b2118, 4.6, .7, 9.4, 0, .35, 0);                 // la suela
  P.caja(g, 0x7a4a26, 4.2, 2.2, 5.4, 0, 1.8, -1.9);             // el talón
  P.caja(g, 0x8a5630, 4.2, 1.4, 3.8, 0, 1.4, 2.6);              // la puntera
  P.bola(g, 0x8a5630, 2.1, 1.1, 1.6, 0, 1.3, 4.2);
  P.caja(g, 0x3a4a7a, 3.4, 5, 3.4, 0, 5.2, -2.4);               // el pantalón
  for (let i = 0; i < 3; i++) P.caja(g, 0xfff7d1, 2.6, .12, .3, 0, 2.2, 1.2 + i * .8);   // los cordones
  return g;
};
// el disco de sombra que avisa de dónde va a pisar
TN.modelos.sombraGigante = radio => {
  const P = TN.piezas3d, g = P.grupo();
  g.userData.disco = P.disco(g, 0x2b2118, radio, 0, 0, .35);
  return g;
};
