// Tiny Fans · adaptador · EFECTOS: lo que se ve un instante y se va: la grapa que vuela, las chispas de un golpe, el humo de un bicho
// que cae, el zapato que baja y las chispas al recoger. Se apunta a los eventos mientras está montado en una escena.
'use strict';
TN.efectos = (() => {
  const P = TN.piezas3d;
  let escena = null, vivos = [], desapunta = null;
  // añade algo que vive `segundos`: mueve(k, objeto) con k de 0 a 1
  function vive(objeto, segundos, mueve) { escena.add(objeto); vivos.push({ objeto, segundos, t: 0, mueve }); }
  function chispas(x, z, color, cuantas, alto) {
    for (let i = 0; i < cuantas; i++) {
      const g = P.grupo(), a = Math.random() * 6.28, v = .8 + Math.random() * 1.6;
      P.caja(g, color, .14, .14, .14, 0, 0, 0, null, { emissive: color });
      vive(g, .35, k => { g.position.set(x + Math.cos(a) * v * k, alto + Math.sin(k * Math.PI) * .8, z + Math.sin(a) * v * k); g.scale.setScalar(1 - k * .7); });
    }
  }
  const HACE = {
    dispara(e) {
      const g = TN.modelos.grapa(), dx = e.ax - e.x, dz = e.az - e.z; g.rotation.y = Math.atan2(dx, dz);
      vive(g, AJUSTES.efectos.grapa.segundos, k => g.position.set(e.x + dx * k, .7, e.z + dz * k));
    },
    'golpe-bicho': e => chispas(e.x, e.z, 0xfff7d1, 3, .5),
    'muere-bicho': e => chispas(e.x, e.z, 0xff8a1f, 7, .4),
    recoge: e => chispas(e.x, e.z, 0xffd23f, 6, .5),
    'voltio-recoge': e => chispas(e.x, e.z, 0x7cf0ff, 2, .6),
    mordisco: e => chispas(e.x, e.z, 0xe2452f, 4, .8),
    'mochila-recuperada': e => chispas(e.x, e.z, 0xffd23f, 12, .6),
    rompe: e => chispas(e.x === undefined ? e.col + .5 : e.x, e.z === undefined ? e.fila + .5 : e.z, 0xc9a063, 9, .5),
    trampa: e => chispas(e.x, e.z, 0xe2452f, 8, .5),
    'gigante-pisa'(e) {
      const g = TN.modelos.zapato(); g.rotation.y = Math.random() * 6.28; g.scale.setScalar(e.radio / 4.6);
      vive(g, 1.1, k => g.position.set(e.x, k < .15 ? (1 - k / .15) * 30 : (k > .7 ? (k - .7) / .3 * 40 : 0), e.z));
      chispas(e.x, e.z, 0xfff7d1, 10, .3);
    },
  };
  return {
    monta(esc) {
      this.desmonta(); escena = esc;
      desapunta = TN.eventos.oye(Object.keys(HACE), e => { if (escena) HACE[e.tipo](e); });
    },
    pinta(dt) {
      for (const v of vivos) { v.t += dt; v.mueve(Math.min(1, v.t / v.segundos), v.objeto); }
      for (const v of vivos.filter(v => v.t >= v.segundos)) escena.remove(v.objeto);
      vivos = vivos.filter(v => v.t < v.segundos);
    },
    desmonta() { if (escena) for (const v of vivos) escena.remove(v.objeto); vivos = []; escena = null; if (desapunta) desapunta(); desapunta = null; },
  };
})();
