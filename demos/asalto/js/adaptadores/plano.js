// Fans of Asalto · ADAPTADORES · El plano de la pantalla de la partida: dónde va cada cosa según el tamaño del lienzo (de 480 a 600 de
// ancho y de 900 a 1300 de alto; por debajo de 960 todo lo de abajo se aprieta un poco para dejarle sitio a la arena). Arriba el marcador, las oleadas y las clases; en medio la arena; abajo el Altar con el botón de
// invocar y el banquillo a su derecha, y el botón de luchar. En lo alto de la arena, la tira de misiones y el pergamino de la guía. También pasa del campo de batalla (540 x 420) a la pantalla.
'use strict';
AS.plano = (W, H) => {
  const corto = H < 960, c = H >= 980 ? 88 : corto ? 72 : 76, asoma = corto ? 30 : 34, hueco = 6;   // la losa del Altar, lo que asoman las de arriba y abajo
  const lu = corto ? 68 : 80, pieAlto = corto ? 40 : 46;                 // el botón de luchar y la franja de la pista
  const rejilla = c * 3 + hueco * 2, altarAlto = rejilla + asoma * 2 + 28, altarAncho = rejilla + 28;
  const abajo = 8 + altarAlto + 10 + lu + pieAlto, ay = 144, ah = H - ay - abajo, by = ay + ah + 8;
  const lx = 10 + altarAncho + 8, lw = W - lx - 10, inv = c >= 88 ? 96 : 84, emp = c >= 88 ? 40 : 34;
  const bq = Math.floor((altarAlto - inv - emp - 16 - 8) / 3);
  const arena = { x: 0, y: ay, w: W, h: ah };
  const S = AS.mazmorra.suelo(ah), suelo0 = ay + S.y0, sueloAlto = S.alto;
  const C = AS.batalla.CAMPO;
  // del campo de batalla a la pantalla (los pies)
  const aPantalla = (x, y) => ({ x: Math.round(x * W / C.w), y: Math.round(suelo0 + (y - C.yMin) / (C.yMax - C.yMin) * sueloAlto) });
  return {
    W, H, c, asoma, hueco, arena, aPantalla,
    misiones: { x: 6, y: ay + 6, w: W - 12, h: 40 }, guia: { x: Math.round(W * 0.475), y: ay + ah - 184, w: W - Math.round(W * 0.475) - 8, h: 176 },
    marcador: { x: 4, y: 4, w: W - 8, h: 50 }, oleadas: { x: 8, y: 58, w: W - 16, h: 32 }, clases: { x: 6, y: 96, w: W - 12, h: 42 },
    altar: { x: 10, y: by, w: altarAncho, h: altarAlto, gx: 10 + 14, gy: by + 14 + asoma },
    invocar: { x: lx, y: by, w: lw, h: inv }, empujon: { x: lx, y: by + inv + 8, w: lw, h: emp },
    banquillo: [0, 1, 2].map(i => ({ x: lx, y: by + inv + emp + 16 + i * (bq + 4), w: lw, h: bq })),
    luchar: { x: 10, y: by + altarAlto + 10, w: W - 20, h: lu }, pie: by + altarAlto + 10 + lu + Math.round(pieAlto / 2),
    // la losa (col, fila) del Altar; fila -1 y 3 son las que asoman
    losa(col, fila) {
      const x = 10 + 14 + col * (c + hueco);
      if (fila < 0) return { x, y: by + 12, w: c, h: asoma - 2 };
      if (fila > 2) return { x, y: by + 14 + asoma + rejilla + 2, w: c, h: asoma - 2 };
      return { x, y: by + 14 + asoma + fila * (c + hueco), w: c, h: c };
    },
    hueco: i => aPantalla(AS.batalla.HUECOS[i][0], AS.batalla.HUECOS[i][1]),
  };
};
