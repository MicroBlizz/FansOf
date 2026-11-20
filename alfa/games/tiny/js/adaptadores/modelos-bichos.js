// Tiny Fans · adaptador · MODELOS · BICHOS: hormiga, araña y cucaracha hechas con bolas y palos, cada una con su aro rojo de peligro, y
// la tela de araña en el suelo. anima(t, { golpe }) las hace corretear y encogerse al recibir una grapa.
'use strict';
(() => {
  const P = TN.piezas3d, K = AJUSTES.modelos.color, ROJO = AJUSTES.modelos.aro.peligro;
  const ojos = (g, sep, y, z, r) => { for (const s of [-1, 1]) { P.bola(g, 0xffffff, r, r, r, s * sep, y, z); P.bola(g, K.tinta, r * .55, r * .55, r * .55, s * sep, y, z + r * .8); } };
  // envuelve un cuerpo en un grupo con su aro y su animación de correteo
  function bicho(cuerpo, escala, radioAro, ritmo) {
    const g = P.grupo(); cuerpo.scale.setScalar(escala); g.add(cuerpo); P.aro(g, ROJO, radioAro, 0, 0);
    g.userData.anima = (t, d = {}) => {
      cuerpo.position.y = Math.abs(Math.sin(t * ritmo)) * .05 * escala;
      cuerpo.rotation.z = Math.sin(t * ritmo) * .06;
      const k = d.golpe ? .82 : 1; cuerpo.scale.set(escala * (2 - k), escala * k, escala * (2 - k));
    };
    return g;
  }
  TN.modelos.hormiga = () => {
    const g = P.grupo(), c = 0x8a3324;
    P.bola(g, c, .2, .17, .24, 0, .24, -.32); P.bola(g, c, .13, .12, .18, 0, .22, 0); P.bola(g, 0x9c3d2a, .15, .14, .15, 0, .27, .26);
    ojos(g, .08, .33, .36, .045);
    for (const s of [-1, 1]) P.palo(g, c, .02, s * .06, .38, .3, s * .17, .54, .46);
    P.patas(g, c, .03, .1, .2, [-.08, .01, .1], .3, .3);
    return bicho(g, 1.5, .55, 18);
  };
  TN.modelos.arana = () => {
    const g = P.grupo(), c = 0x4a3426;
    P.bola(g, c, .34, .3, .38, 0, .42, -.32); P.bola(g, 0x5c4230, .22, .18, .24, 0, .36, .12); P.bola(g, K.naranja, .14, .03, .2, 0, .71, -.32);
    ojos(g, .08, .42, .33, .06);
    P.patas(g, c, .05, .16, .34, [-.16, -.04, .1, .22], .62, .78);
    return bicho(g, 1.5, .95, 11);
  };
  TN.modelos.cucaracha = () => {
    const g = P.grupo(), c = 0x6b3a1a;
    P.bola(g, c, .36, .2, .58, 0, .3, -.1); P.bola(g, 0x8a4e22, .3, .12, .5, 0, .42, -.14); P.bola(g, 0x3a2414, .22, .16, .2, 0, .3, .5);
    ojos(g, .1, .36, .64, .05);
    for (const s of [-1, 1]) P.palo(g, K.tinta, .02, s * .08, .4, .62, s * .34, .62, 1.2);
    P.patas(g, K.tinta, .045, .28, .26, [-.3, -.02, .26], .5, .46);
    return bicho(g, 1.7, 1.15, 14);
  };
  // la tela pegajosa en el suelo
  TN.modelos.tela = radio => {
    const g = P.grupo();
    P.disco(g, 0xffffff, radio, 0, 0, .28);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; P.palo(g, 0xffffff, .05, 0, .05, 0, Math.cos(a) * radio, .05, Math.sin(a) * radio); }
    return g;
  };
  TN.modelos.bicho = clase => (TN.modelos[clase] || TN.modelos.hormiga)();
})();
