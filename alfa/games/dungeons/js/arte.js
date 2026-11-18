// Fans of Dungeons · Rejillas de letras para los iconos pequeños de la interfaz (una letra = un color de la paleta, '.' = nada).
// Los personajes y los objetos grandes se dibujan con el pincel de pixel.js (formas con sombras); esto es solo para lo diminuto.
// Cada rejilla se pinta una vez (a la escala que se pida) y se guarda. Nada de archivos de imagen.
'use strict';

const TS = 32;          // lado de una casilla, en píxeles del juego

// la paleta del juego: unos 32 colores, con su tono claro y oscuro
const PAL = {
  k: '#20102c', W: '#fff6ea', w: '#d9d2e0', g: '#8c879a', G: '#5b5868', x: '#3a3747',
  r: '#e43f4a', R: '#9b2233', o: '#f2922a', O: '#b65d14', y: '#f5d442', Y: '#c89a1c',
  n: '#8b5a2b', N: '#5a3719', p: '#f6a5c8', P: '#d6679a', b: '#4aa3ff', B: '#2456b8',
  c: '#4fe3e0', C: '#1f9aa0', v: '#3fcf6a', V: '#1e8a46', m: '#a86ef0', M: '#6b3bb0',
  s: '#f0c8a0', S: '#c9946a', e: '#1b1b2a', t: '#cfe8ff', T: '#8fb8e8', l: '#ffe9a8', d: '#2a2140',
};

const REJ = {};   // nombre → filas (rejilla de letras)
function defRej(nombre, filas) { REJ[nombre] = filas; }

// pinta una rejilla en un lienzo nuevo. o: { escala (píxeles por celda), espejo, cambio: { letra: color } para recolorear }
const REJ_CACHE = new Map();
function rejilla(nombre, o = {}) {
  const esc = o.escala || 1;
  const k = nombre + '|' + esc + '|' + (o.espejo ? 1 : 0) + '|' + (o.cambio ? JSON.stringify(o.cambio) : '');
  let c = REJ_CACHE.get(k);
  if (c) return c;
  const filas = REJ[nombre] || REJ.falta;
  const h = filas.length, w = Math.max(...filas.map(f => f.length));
  c = document.createElement('canvas'); c.width = w * esc; c.height = h * esc;
  const g = c.getContext('2d');
  for (let j = 0; j < h; j++) {
    const f = filas[j];
    for (let i = 0; i < f.length; i++) {
      const ch = f[i];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = (o.cambio && o.cambio[ch]) || PAL[ch] || '#ff00ff';
      g.fillRect((o.espejo ? w - 1 - i : i) * esc, j * esc, esc, esc);
    }
  }
  REJ_CACHE.set(k, c);
  return c;
}
// pinta una rejilla con su esquina de arriba a la izquierda en (x, y)
function pintaRejilla(ctx, nombre, x, y, o = {}) { ctx.drawImage(rejilla(nombre, o), Math.round(x), Math.round(y)); }

// el dibujo que sale si falta alguno (para que se note)
defRej('falta', [
  '....kkkkkkkk....', '...kmmmmmmmmk...', '..kmmmmkkmmmmk..', '..kmmmkmmkmmmk..', '..kmmmmmkmmmmk..', '..kmmmmkmmmmmk..',
  '..kmmmmkmmmmmk..', '..kmmmmmmmmmmk..', '..kmmmmkmmmmmk..', '...kmmmmmmmmk...', '....kkkkkkkk....',
]);

// cosas pequeñas de la interfaz (corazón, café, moneda, escalera, ojo, estrella)
defRej('ui_vida', ['.kk.kk.', 'krrkrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...']);
defRej('ui_cafe', ['kkkkkk.', 'knnnnkk', 'knnnnkWk', 'knnnnkWk', '.knnkk..', '..kk....']);
defRej('ui_moneda', ['.kkkk.', 'kyyyyk', 'kyYyyk', 'kyYyyk', 'kyyyyk', '.kkkk.']);
defRej('ui_escalera', ['....kk', '...kwk', '..kwwk', '.kwwwk', 'kwwwwk', 'kkkkkk']);
defRej('ui_ojo', ['.kkkkk.', 'kWWeWWk', '.kkkkk.']);
defRej('ui_rayo', ['..ky.', '.kyk.', 'kyyyk', '..ky.', '.ky..']);
defRej('ui_bolsa', ['..kk..', '.knnk.', 'knnnnk', 'knNnnk', 'knnnnk', '.kkkk.']);
defRej('ui_flecha', ['..k..', '.kwk.', 'kwwwk', '.kwk.', '.kwk.']);
defRej('ui_x', ['k...k', '.k.k.', '..k..', '.k.k.', 'k...k']);
defRej('ui_interrogante', ['.kkk.', 'k...k', '...k.', '..k..', '.....', '..k..']);
defRej('ui_escudo', ['kkkkk', 'kcccC', 'kcccC', '.kcC.', '..k..']);
defRej('corona', ['k.k.k', 'kykyk', 'kyyyk', 'kyryk', 'kkkkk']);
defRej('ui_menu', ['wwwww', '.....', 'wwwww', '.....', 'wwwww']);
defRej('ui_lupa', ['.WWW....', 'W...W...', 'W.t.W...', 'W...W...', '.WWWW...', '....WW..', '.....WW.', '......WW']);
defRej('ui_reloj', ['kkkkk', 'kWWWk', '.kyk.', '..k..', '.kWk.', 'kyyyk', 'kkkkk']);
// lo que va a hacer un enemigo en su turno (encima de su cabeza)
defRej('int_espada', ['.....kk', '....kWk', '...kWk.', 'k.kWk..', 'kYkk...', '.kYk...', 'kNkYk..', 'kk..k..']);
defRej('int_carga', ['kk.kk', 'ok.ok', 'ok.ok', 'ok.ok', 'kk.kk', '.....', 'kk.kk', 'ok.ok']);
defRej('int_mira', ['..k..', '.kRk.', 'kR.Rk', '.kRk.', '..k..']);
defRej('int_pies', ['.kk..', 'kgGk.', 'kgGk.', '.kk.k', '...kgk', '...kgk', '....k']);
defRej('int_cura', ['.kkk.', '.kvk.', 'kkvkk', 'kvvvk', 'kkvkk', '.kvk.', '.kkk.']);
defRej('ui_calavera', ['.kkkk.', 'kwwwwk', 'kwkwkk', 'kwwwwk', '.kwwk.', '.k.k..']);
