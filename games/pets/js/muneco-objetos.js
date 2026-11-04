// Fans Of Pets · MUÑECO: los OBJETOS de las acciones (bol, cuchara, taza, alcachofa de la ducha, cepillo, orinal, puff, tableta) y los
// EFECTOS (agua, espuma, burbujas, lágrima, humo, brillos, zetas) del muñeco kawaii por código, como formas en capas igual que el muñeco
// (muneco.js): detrás del cuerpo, delante del cuerpo pero detrás de los brazos, o en la mano. Sin dibujar nada. Unidades del muñeco.
'use strict';
PT.munecoObjetos = (() => {
  const TRAZO = '#2a1a22', AGUA = '#8fd3ff', BLANCO = '#ffffff';
  const capa = (formas, contorno = true) => ({ contorno, formas });
  // cada objeto → { sitio: 'detras' | 'medio' | 'mano', capas }. o: el objeto de la pose ({ tipo, x, y, … })
  const OBJETOS = {
    puff: o => ({ sitio: 'detras', capas: [capa([{ t: 'elipse', x: o.x, y: o.y - 58, rx: 200, ry: 76, c: '#ff8fb8' }]),
      capa([{ t: 'elipse', x: o.x - 40, y: o.y - 92, rx: 90, ry: 22, c: '#ffc2da' }], false)] }),
    orinal: o => ({ sitio: 'detras', capas: [capa([{ t: 'elipse', x: o.x, y: o.y - 40, rx: 120, ry: 44, c: '#bfe6ff' }, { t: 'elipse', x: o.x, y: o.y - 64, rx: 128, ry: 26, c: '#e6f6ff' }])] }),
    alcachofa: o => ({ sitio: 'detras', capas: [capa([{ t: 'tubo', p: [[o.x + 140, o.y - 60], [o.x + 140, o.y - 10], [o.x + 40, o.y - 10]], w: 18, c: '#c9ced8' },
      { t: 'elipse', x: o.x, y: o.y + 4, rx: 62, ry: 22, c: '#dfe4ec' }])] }),
    bol: o => ({ sitio: 'mano', capas: [capa([{ t: 'poli', p: [[o.x - 62, o.y - 18], [o.x + 62, o.y - 18], [o.x + 44, o.y + 22], [o.x - 44, o.y + 22]], c: '#ffb74a' }]),
      capa([{ t: 'elipse', x: o.x, y: o.y - 18, rx: 56, ry: 10, c: '#fff0c8' }], false)] }),
    cuchara: o => ({ sitio: 'mano', capas: [capa([{ t: 'tubo', p: [[o.x + 26, o.y + 40], [o.x + 16, o.y + 20], [o.x + 4, o.y + 4]], w: 9, c: '#c9ced8' },
      { t: 'elipse', x: o.x - 6, y: o.y - 4, rx: 15, ry: 11, c: '#dfe4ec' }]), ...(o.lleno ? [capa([{ t: 'elipse', x: o.x - 6, y: o.y - 8, rx: 9, ry: 6, c: '#fff0c8' }], false)] : [])] }),
    // la taza se inclina hacia la boca al beber (o.inclina, en radianes)
    taza: o => {
      const g = ([x, y]) => [o.x + x * Math.cos(o.inclina || 0) - y * Math.sin(o.inclina || 0), o.y + x * Math.sin(o.inclina || 0) + y * Math.cos(o.inclina || 0)];
      return { sitio: 'mano', capas: [capa([{ t: 'tubo', p: [[40, -16], [62, 0], [40, 18]].map(g), w: 10, c: '#7ec4ff' },
        { t: 'poli', p: [[-40, -30], [40, -30], [34, 30], [-34, 30]].map(g), c: '#7ec4ff' }]),
      capa([{ t: 'elipse', x: g([-10, -2])[0], y: g([-10, -2])[1], rx: 10, ry: 10, c: BLANCO }], false)] };
    },
    cepillo: o => ({ sitio: 'mano', capas: [capa([{ t: 'tubo', p: [[o.x, o.y], [o.x + 40, o.y + 6], [o.x + 80, o.y + 12]], w: 12, c: '#5ad0a0' },
      { t: 'poli', p: [[o.x - 6, o.y - 10], [o.x + 14, o.y - 10], [o.x + 14, o.y + 4], [o.x - 6, o.y + 4]], c: BLANCO }])] }),
    // la tableta se ve por detrás (la pantalla mira a la criatura): la tapa con su logo, y al tocar sale un destello por arriba
    tableta: o => ({ sitio: 'medio', capas: [capa([{ t: 'poli', p: [[o.x - 74, o.y - 50], [o.x + 74, o.y - 50], [o.x + 74, o.y + 42], [o.x - 74, o.y + 42]], c: '#6c7393' }]),
      capa([{ t: 'elipse', x: o.x, y: o.y - 4, rx: 14, ry: 14, c: '#b9bfd6' }, ...(o.toca ? [{ t: 'elipse', x: o.x, y: o.y - 62, rx: 60, ry: 10, c: '#b8f0ff', a: 0.7 }] : [])], false)] }),
  };
  const gota = (x, y, r) => ({ t: 'elipse', x, y, rx: r * 0.7, ry: r, c: AGUA });
  const burbuja = (x, y, r) => ({ t: 'elipse', x, y, rx: r, ry: r, c: BLANCO });
  const estrella = (x, y, r) => ({ t: 'poli', p: [[x, y - r], [x + r * 0.28, y - r * 0.28], [x + r, y], [x + r * 0.28, y + r * 0.28], [x, y + r], [x - r * 0.28, y + r * 0.28], [x - r, y], [x - r * 0.28, y - r * 0.28]], c: '#fff3a0' });
  // cada efecto → sus capas, con f (de 0 a 1 en su vuelta) y las anclas del muñeco (boca, ojos, cima de la cabeza)
  const EFECTOS = {
    lluvia: e => [capa([0, 1, 2, 3, 4, 5, 6].map(i => gota(-120 + i * 46 + 18 * (i % 2), -560 + ((e.f + i * 0.37) % 1) * 520, 9)), false)],
    espuma: (e, a) => [capa([0, 1, 2, 3, 4].map(i => burbuja(a.cima[0] - 110 + i * 55, a.cima[1] + 14 - 10 * Math.sin((e.f + i * 0.2) * 6.28), 22 + 6 * (i % 2))))],
    burbujas: (e, a) => [capa([0, 1, 2].map(i => burbuja(a.boca[0] + 30 + i * 22, a.boca[1] - ((e.f + i / 3) % 1) * 60, 8 + 2 * i)))],
    salpica: (e, a) => [capa([-1, 1].flatMap(s => [0, 1].map(i => gota(a.boca[0] + s * (150 + 40 * e.f + 20 * i), a.boca[1] - 60 + 80 * e.f * e.f - 30 * i, 10))), false)],
    lagrima: (e, a) => [capa([gota(a.ojos[0][0] - 10, a.ojos[0][1] + 34 + 90 * e.f, 12)], false)],
    humo: (e, a) => [capa([-1, 1].map(s => burbuja(a.cima[0] + s * 120, a.cima[1] - 10 - 60 * e.f, 18 + 14 * e.f)).map(b => ({ ...b, c: '#e8e2f0', a: 1 - e.f })), false)],
    brillo: (e, a) => [capa([estrella(a.cima[0] - 170, a.cima[1] + 40, 22 * (1 - e.f)), estrella(a.cima[0] + 170, a.cima[1] + 10, 18 * e.f)])],
    zetas: (e, a) => [capa([0, 1].map(i => {
      const f = (e.f + i / 2) % 1, x = a.cima[0] + 120 + 50 * f, y = a.cima[1] + 20 - 120 * f, r = 14 + 12 * f;
      return { t: 'linea', p: [[x - r, y - r], [x + r, y - r], [x - r, y + r], [x + r, y + r]], w: 7, c: TRAZO, a: 1 - f * 0.6 };
    }), false)],
  };
  // los objetos y efectos de la pose, repartidos por sitio: { detras, medio, mano, efectos } (listas de capas)
  function capas(pose, anclas) {
    const sal = { detras: [], medio: [], mano: [], efectos: [] };
    for (const o of pose.objetos) {
      const hecho = OBJETOS[o.tipo] && OBJETOS[o.tipo](o);
      if (hecho) sal[hecho.sitio].push(...hecho.capas);
    }
    for (const e of pose.efectos) if (EFECTOS[e.tipo]) sal.efectos.push(...EFECTOS[e.tipo](e, anclas));
    return sal;
  }
  return { capas, objetos: () => Object.keys(OBJETOS), efectos: () => Object.keys(EFECTOS) };
})();
