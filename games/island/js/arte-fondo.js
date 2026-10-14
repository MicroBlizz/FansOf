// Fans of Island · ARTE DEL FONDO: el paisaje en acuarela de píxeles (lona.js: lavados a manchas con grano de papel, borde que sangra y
// pigmento en el canto), en capas que se mueven a distinta velocidad que el suelo: cielo con sol, nubes, montes lejanos, colinas de
// colores y una franja de arbustos. Cada capa se pinta una vez (IS_FONDO) y se repite cada IS_FONDO_P píxeles.
'use strict';
const IS_PALETAS = {   // una paleta por paisaje (nivel.paleta)
  manana: { cielo: ['#74bfe6', '#8dcdec', '#aadcf0', '#c8e9f4', '#e4f3f6'], sol: ['#fff1b5', '#ffd98a'], nube: ['#d4e8f2', '#f2f8fb', '#ffffff'],
    lejos: [['#8e9cc0', '#b4c0dc', '#d8e0f0'], ['#9aa8c8', '#c0cce4', '#e0e6f4']],
    colinas: [['#a86a3e', '#d79a62', '#f1c48c'], ['#2f7a3c', '#5aae4e', '#9ad96e'], ['#8e4a36', '#c27856', '#e8a884'], ['#9a4a7a', '#d07aa8', '#f0b0d0']],
    arbusto: ['#2f7a3c', '#5aae4e', '#9ad96e'], valle: ['#86c070', '#5a9a4a', '#3d7a3a', '#2a5a2c'] },
  tarde: { cielo: ['#e07a8a', '#f09a8a', '#f7bc94', '#fbd8a8', '#f8e8c8'], sol: ['#fff4c0', '#ffc46a'], nube: ['#e6b8c8', '#f8dce4', '#fff4f6'],
    lejos: [['#6a4a8a', '#9a78b8', '#c4a8d8'], ['#7a5a9a', '#a88cc4', '#cdb8dc']],
    colinas: [['#6a3a7a', '#a05aa8', '#d090d0'], ['#2a6a5a', '#4a9a7a', '#8ccaa0'], ['#8a3a4a', '#c0606a', '#e898a0'], ['#b0583a', '#e08a5a', '#f8c090']],
    arbusto: ['#2a6a4a', '#4a9a6a', '#8cca90'], valle: ['#6a9a60', '#4a7a4a', '#345a3a', '#243c2c'] },
};
const IS_FONDO = { clave: '', capas: null, cielo: null, cieloW: 0 };
const IS_FONDO_P = 960;   // cada capa mide esto y se repite
function isCapa(h, pinta) { const c = lienzoNuevo(IS_FONDO_P, h), g = c.getContext('2d'); pinta(g); return c; }
function isFondoPrepara(paleta) {
  const P = IS_PALETAS[paleta] || IS_PALETAS.manana, W = IS_FONDO_P;
  const capas = {};
  // nubes: lavados blancos que sangran mucho
  capas.nubes = isCapa(90, g => { for (const [x, y, rx, ry, s] of [[90, 26, 30, 9, 1], [330, 18, 34, 8, 2], [470, 46, 18, 6, 3], [640, 32, 24, 7, 4], [830, 20, 30, 8, 5]]) lavado(g, F.ov(x, y, rx, ry), P.nube, s, { sangra: 5, escala: 7, canto: 0.8 }); });
  // montes lejanos: pálidos, picudos
  capas.lejos = isCapa(180, g => {
    for (const [x, y, rx, ry, k, s] of [[110, 200, 150, 110, 0, 11], [340, 210, 130, 90, 1, 12], [560, 196, 170, 120, 0, 13], [790, 206, 140, 100, 1, 14], [930, 212, 90, 70, 0, 15]])
      lavado(g, F.ov(x, y, rx, ry), P.lejos[k], s, { sangra: 4, escala: 16, luzArriba: 0.45, canto: 1 });
  });
  // colinas de colores, las de la foto de Yoshi: redondas y saturadas; ninguna cruza el borde de la capa (para que se repita sin costura)
  capas.colinas = isCapa(200, g => {
    for (const [x, y, rx, ry, k, s] of [[110, 190, 100, 86, 0, 21], [262, 178, 70, 56, 1, 22], [330, 196, 110, 96, 0, 23], [470, 184, 60, 64, 2, 24], [600, 200, 100, 80, 3, 25], [700, 176, 70, 58, 1, 26], [810, 198, 110, 92, 0, 27], [930, 190, 28, 40, 2, 28]])
      lavado(g, F.ov(x, y, rx, ry), P.colinas[k], s, { sangra: 4, escala: 13, luzArriba: 0.35 });
  });
  // arbustos: una franja de matas delante de todo, justo detrás del suelo
  capas.arbustos = isCapa(40, g => { for (let k = 0; k < 12; k++) { const x = 40 + k * 80 + hash(k) * 30, rx = 22 + hash(k + 5) * 16, ry = 12 + hash(k + 9) * 7; if (x - rx < 2 || x + rx > W - 2) continue; lavado(g, F.ov(x, 40, rx, ry), P.arbusto, 31 + k, { sangra: 3, escala: 8, luzArriba: 0.3 }); } });
  IS_FONDO.capas = capas; IS_FONDO.clave = paleta; IS_FONDO.cielo = null;
  return P;
}
function isCielo(W, P) {   // el degradado del cielo con trama, al ancho de la lona (se rehace si cambia)
  if (IS_FONDO.cielo && IS_FONDO.cieloW === W) return IS_FONDO.cielo;
  const c = lienzoNuevo(W, 270), g = c.getContext('2d');
  franjas(g, 0, 0, W, 190, P.cielo, { zona: 0.6 }); rect(g, 0, 190, W, 80, P.cielo[4]);
  franjas(g, 0, 232, W, 38, P.valle, { zona: 0.7 });   // el valle que se ve por los huecos del suelo
  IS_FONDO.cielo = c; IS_FONDO.cieloW = W; return c;
}
function isCapaRepite(c, capa, W, y, off) {   // la capa se repite a lo largo; off = cuánto se ha desplazado
  let x = -((off % IS_FONDO_P) + IS_FONDO_P) % IS_FONDO_P;
  for (; x < W; x += IS_FONDO_P) c.drawImage(capa, Math.round(x), y);
}
function isFondoPinta(c, W, H, camX, t, paleta) {
  paleta = paleta || 'manana';
  const P = IS_FONDO.clave === paleta && IS_FONDO.capas ? IS_PALETAS[paleta] : isFondoPrepara(paleta), K = IS_FONDO.capas;
  c.drawImage(isCielo(W, P), 0, 0);
  const sx = W - 70 - Math.round(camX * 0.02);   // el sol, casi quieto
  circuloPx(c, sx, 44, 20, P.sol[1]); circuloPx(c, sx, 44, 15, P.sol[0]);
  isCapaRepite(c, K.nubes, W, 6, camX * 0.08 + t * 4);
  isCapaRepite(c, K.lejos, W, 40, camX * 0.2);
  isCapaRepite(c, K.colinas, W, 46, camX * 0.4);
  isCapaRepite(c, K.arbustos, W, 192, camX * 0.7);
}
