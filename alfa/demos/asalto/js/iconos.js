// Fans of Asalto · ICONOS de pixel art: moneda, gema, corazón, las clases, las salas del mapa y las reliquias. Si Yoshi ya hizo el suyo
// (img/icono-<nombre>.png, reducido con sprites.py) se pinta ese; si no, uno de píxeles hecho a mano aquí. Nunca vectores ni emojis.
'use strict';
// cada icono: filas de letras; cada letra un color de la paleta, '.' vacío. Todos de 10x10.
const AS_PAL = { k: '#20102c', y: '#ffd23a', o: '#e89a1a', w: '#ffffff', b: '#4f8ae8', c: '#9fd4ff', r: '#e8433a', p: '#ff8fb0', g: '#9aa4b8', s: '#d8dee8', m: '#8a5a2a', v: '#9b4fd8', l: '#5fb83a', n: '#3a2a20', e: '#f06aa0', f: '#ffa030' };
const AS_PIX = {
  moneda: ['..kkkkkk..', '.kyyyyyyk.', 'kyyowwyyok', 'kyyyowyyok', 'kyyyowyyok', 'kyyyowyyok', 'kyyyoyyyok', 'kyooooooyk', '.kyyyyyyk.', '..kkkkkk..'],
  gema: ['..kkkkkk..', '.kcwccbbk.', 'kcwccbbbbk', 'kkkkkkkkkk', '.kcbbbbbk.', '.kcbbbbbk.', '..kcbbbk..', '...kcbk...', '....kk....', '..........'],
  corazon: ['.kkk..kkk.', 'krrrkkrrrk', 'krwrrrrrrk', 'krrrrrrrrk', 'krrrrrrrrk', '.krrrrrrk.', '..krrrrk..', '...krrk...', '....kk....', '..........'],
  'clase-luchador': ['........kk', '.......ksk', '......kswk', '.....kswk.', 'kk..kswk..', 'krk.kwk...', '.krkkk....', '..kmk.....', '.kmkrk....', 'kmk..k....'],
  'clase-tanque': ['.kkkkkkkk.', 'kssssssssk', 'ksbbbbbbsk', 'ksbbwbbbsk', 'ksbwbbbbsk', 'ksbbbbbbsk', '.ksbbbbsk.', '.ksbbbbsk.', '..ksbbsk..', '...kkkk...'],
  'clase-asesino': ['......kk..', '.....kvk..', '....kvvk..', '...kvvk...', '..kvvk....', '.kkvk.....', 'kmkk......', 'kmmk......', '.kk..kl...', '.....kl...'],
  'clase-tirador': ['.kk.......', 'kmmk...kk.', 'k.kmk.kwk.', 'k..kmkwk..', 'k...kkk...', 'k...kwkk..', 'k..kmk.k..', 'k.kmk...k.', 'kmmk.....k', '.kk.......'],
  'clase-mago': ['...kkk....', '..kyfyk...', '.kyywyyk..', '..kyfyk...', '...kmk....', '...kmk....', '...kmk....', '...kmk....', '...kmk....', '...kkk....'],
  'clase-sanador': ['...kkkk...', '...kssk...', '..kkkkkk..', '.kppwwppk.', '.kpwwwwpk.', '.kppwwppk.', '.kppwwppk.', '.kpppppPk.', '..kkkkkk..', '..........'],
  'sala-combate': ['kk......kk', 'kwk....kwk', '.kwk..kwk.', '..kwkkwk..', '...kwwk...', '...kwwk...', '..kwkkwk..', 'kkmk..kmkk', 'kmk....kmk', 'kk......kk'],
  'sala-reliquia': ['..k....k..', '.kyk..kyk.', '..kykkyk..', '...kyyk...', '..kkvvkk..', '.kvvwvvvk.', '.kvwvvvvk.', '.kvvvvvvk.', '..kvvvvk..', '...kkkk...'],
  'sala-jefe': ['.ky.yy.yk.', '.kyyyyyyk.', '..kkkkkk..', '.kwwwwwwk.', 'kwkkwwkkwk', 'kwkkwwkkwk', 'kwwwkkwwwk', '.kwwwwwwk.', '..kwkwkk..', '...kkkk...'],
};
AS_PIX['clase-sanador'][7] = '.kpppppppk';
// las reliquias: un dibujo sencillo de su color (la letra X es el color de cada una)
const AS_PIX_X = {};
for (const k in AS_RELIQUIAS) { AS_PIX['reliquia-' + k] = ['...kkkk...', '..kXXXXk..', '.kXwXXXXk.', 'kXwXXXXXXk', 'kXXXXXXXXk', 'kXXXXXXXXk', 'kXXXXXXXXk', '.kXXXXXXk.', '..kXXXXk..', '...kkkk...']; AS_PIX_X['reliquia-' + k] = AS_RELIQUIAS[k].col; }
const AS_ICO_IMG = {};
function asCargaIconos() {
  // solo los que ya hizo Yoshi (AS_ICONOS lo escribe sprites.py --todos en sprites-datos.js): así no se piden archivos que no existen
  for (const n of (typeof AS_ICONOS !== 'undefined' ? AS_ICONOS : [])) {
    const im = new Image();
    im.onload = () => { AS_ICO_IMG[n] = im; };
    im.src = 'img/icono-' + n + '.png?v=' + NUCLEO.version;
  }
}
// pinta el icono n en una caja de lado L centrada en (cx, cy)
function asIcono(c, n, cx, cy, L) {
  c.imageSmoothingEnabled = false;
  const im = AS_ICO_IMG[n];
  if (im) { const k = Math.max(1, Math.floor(L / Math.max(im.width, im.height))); c.drawImage(im, Math.round(cx - im.width * k / 2), Math.round(cy - im.height * k / 2), im.width * k, im.height * k); return; }
  const filas = AS_PIX[n]; if (!filas) return;
  const k = Math.max(1, Math.floor(L / 10)), x0 = Math.round(cx - 5 * k), y0 = Math.round(cy - 5 * k);
  filas.forEach((f, y) => {
    for (let x = 0; x < f.length; x++) {
      const ch = f[x]; if (ch === '.') continue;
      c.fillStyle = ch === 'X' ? AS_PIX_X[n] : AS_PAL[ch] || '#000';
      c.fillRect(x0 + x * k, y0 + y * k, k, k);
    }
  });
}
