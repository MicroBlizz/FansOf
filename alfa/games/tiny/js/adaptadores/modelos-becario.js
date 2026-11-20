// Tiny Fans · adaptador · MODELOS · BECARIO: el becario encogido (un robotito claro) con su mochila naranja y la grapadora en la mano
// derecha (que no cambia de mano al girar: el muñeco gira entero). anima(t, { andando, golpe }) mueve los pies y lo hace botar.
'use strict';
TN.modelos.becario = () => {
  const P = TN.piezas3d, K = AJUSTES.modelos.color, g = P.grupo(), c = P.grupo(), pies = [];
  pies.push(P.caja(g, 0x4a5670, .2, .12, .3, -.17, .06, .04), P.caja(g, 0x4a5670, .2, .12, .3, .17, .06, .04));
  g.add(c);
  P.caja(c, K.robot, .72, .66, .56, 0, .47, 0);
  P.caja(c, 0xd7dee9, .5, .07, .05, 0, .76, .27);
  P.caja(c, 0x1b4fc4, .56, .34, .06, 0, .55, .27);
  P.caja(c, 0xe8f1ff, .14, .045, .03, -.13, .6, .305, [0, 0, -.14]); P.caja(c, 0xe8f1ff, .14, .045, .03, .13, .6, .305, [0, 0, .14]);
  P.caja(c, 0xe8f1ff, .1, .03, .03, 0, .47, .305);
  P.palo(c, K.rojo, .035, -.2, .37, .29, 0, .2, .3); P.palo(c, K.rojo, .035, .2, .37, .29, 0, .2, .3);
  P.caja(c, 0xffffff, .2, .15, .03, 0, .19, .3); P.caja(c, 0x2e8bff, .16, .04, .035, 0, .22, .3);
  P.cilindro(c, 0x3a4252, .02, .02, .2, 0, .9, 0); P.bola(c, K.rojo, .07, .07, .07, 0, 1.03, 0, null, { emissive: 0x661010 });
  P.bola(c, K.robot, .11, .11, .11, -.44, .4, .05); P.bola(c, K.robot, .11, .11, .11, .44, .4, .05);
  // la mochila de expedición
  P.caja(c, K.naranja, .5, .46, .24, 0, .5, -.4); P.caja(c, 0xc96a10, .52, .14, .26, 0, .7, -.4); P.caja(c, K.oro, .12, .1, .03, 0, .62, -.535);
  P.cilindro(c, K.verde, .08, .08, .5, 0, .84, -.4, [0, 0, Math.PI / 2]);
  // la grapadora, en la mano derecha
  const arma = P.grupo(); c.add(arma);
  P.caja(arma, K.tinta, .12, .05, .5, .5, .34, .3); P.caja(arma, K.rojo, .13, .1, .48, .5, .45, .3, [-.14, 0, 0]); P.caja(arma, K.metal, .1, .04, .08, .5, .39, .56);
  g.scale.setScalar(AJUSTES.modelos.escalaBecario);
  P.aro(g, AJUSTES.modelos.aro.becario, .62, 0, 0);
  g.userData.anima = (t, d = {}) => {
    const paso = d.andando ? Math.sin(t * 14) : 0;
    pies[0].position.z = .04 + paso * .12; pies[1].position.z = .04 - paso * .12;
    c.position.y = d.andando ? Math.abs(Math.sin(t * 14)) * .06 : Math.sin(t * 2.4) * .015;
    c.rotation.z = paso * .05;
    arma.position.z = d.dispara ? -.08 : 0;
  };
  return g;
};
