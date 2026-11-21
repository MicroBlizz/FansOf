// Tiny Fans · adaptador · MODELOS · OBJETOS: lo que se recoge (un montón de cada material, siempre con su aro amarillo), la bolita de
// voltio, la mochila caída y la grapa que vuela. Los montones flotan y giran un poco para que se vean (anima).
'use strict';
(() => {
  const P = TN.piezas3d, K = AJUSTES.modelos.color, ORO = AJUSTES.modelos.aro.recoge;
  const MONTON = {
    carton(g) { P.caja(g, K.carton, .9, .5, .7, 0, .25, 0, [0, .3, 0]); P.caja(g, 0x9c7340, .6, .4, .5, .2, .7, .1, [0, -.4, 0]); },
    grapas(g) { for (let i = 0; i < 4; i++) P.caja(g, K.metal, .7, .1, .12, 0, .1 + i * .12, (i % 2) * .16 - .08, [0, i * .5, 0]); },
    migas(g) { P.bola(g, 0xd9a55a, .4, .3, .36, 0, .3, 0); P.bola(g, 0xe8bf7a, .22, .2, .22, .34, .2, .2); P.bola(g, 0xc48f45, .18, .16, .18, -.3, .16, .24); },
    plastico(g) { P.cilindro(g, 0x4fb8e8, .34, .34, .16, 0, .1, 0, null, 12, { transparent: true, opacity: .85 }); P.cilindro(g, 0x2e8bff, .22, .3, .36, .1, .36, .05, [.3, 0, .2], 12); },
    pilas(g) { P.cilindro(g, 0x2e7d32, .2, .2, .8, 0, .22, 0, [0, 0, Math.PI / 2], 10); P.cilindro(g, K.oro, .21, .21, .2, .36, .22, 0, [0, 0, Math.PI / 2], 10); P.cilindro(g, K.metal, .08, .08, .1, .5, .22, 0, [0, 0, Math.PI / 2], 8); },
  };
  function flota(g, cuerpo) {
    g.userData.anima = t => { cuerpo.position.y = .12 + Math.sin(t * 3 + g.position.x) * .08; cuerpo.rotation.y = t * .8; };
    return g;
  }
  TN.modelos.material = nombre => {
    const g = P.grupo(), cuerpo = P.grupo(); g.add(cuerpo);
    (MONTON[nombre] || MONTON.carton)(cuerpo);
    cuerpo.scale.setScalar(1.25);
    P.aro(g, ORO, .85, 0, 0); P.halo(g, 0xffd23f, .9, 0, .45, 0);
    return flota(g, cuerpo);
  };
  TN.modelos.voltio = () => {
    const g = P.grupo(), cuerpo = P.grupo(); g.add(cuerpo);
    P.bola(cuerpo, 0x7cf0ff, .2, .2, .2, 0, .3, 0, null, { emissive: 0x2aa8c8 }); P.halo(g, 0x7cf0ff, .42, 0, .4, 0);
    return flota(g, cuerpo);
  };
  TN.modelos.mochilaCaida = () => {
    const g = P.grupo(), cuerpo = P.grupo(); g.add(cuerpo);
    P.caja(cuerpo, K.naranja, .9, .8, .5, 0, .4, 0, [0, 0, .5]); P.caja(cuerpo, 0xc96a10, .92, .24, .52, .18, .68, 0, [0, 0, .5]); P.caja(cuerpo, K.oro, .2, .18, .06, 0, .46, .27, [0, 0, .5]);
    P.aro(g, AJUSTES.modelos.aro.peligro, 1.1, 0, 0); P.halo(g, 0xff5a3c, 1.2, 0, .5, 0);
    return flota(g, cuerpo);
  };
  // la grapa que sale de la grapadora
  TN.modelos.grapa = () => { const g = P.grupo(); P.caja(g, 0xf4f8fb, .1, .1, .46, 0, 0, 0, null, { emissive: 0x8fa3b3 }); return g; };
})();
