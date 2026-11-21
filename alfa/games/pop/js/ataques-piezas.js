// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, el dibujo por código de las 44 piezas de las cositas (tarea #160, ADR 197; revisión
// del 21-11-2026: «cada compañero tiene un ataque diferente»). Copia el estilo cozy del boceto aprobado: solo relleno pastel y un
// brillo blanco, NUNCA contorno. Así cada compañero se distingue ya, sin esperar a los dibujos de Yoshi (img-liso/fx-<pieza>.png),
// que lo sustituyen cuando llegan. Cada pieza construye sus formas en un lienzo centrado (tamaño s) y llama a pinta(color, linea)
// para rellenarlas (linea: el trazo ES la forma, en pastel). Además: los colores y trazos que comparten los estilos (rgb, mezcla,
// rutas de estrella, destello, corazón…), el halo de cada pieza y dónde va su brillo. Lo usa js/ataques-estilos.js.
'use strict';
const PP_ATAQUE_PIEZAS = (() => {
  const TAU = Math.PI * 2, f = o => Object.freeze(o);
  const lerp = (a, b, k) => a + (b - a) * k;
  function rgb(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return [255, 255, 255];
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mezcla(hex, otro, k) {
    const a = rgb(hex), b = rgb(otro);
    return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join('');
  }
  const rgba = (hex, a) => 'rgba(' + rgb(hex).join(',') + ',' + a + ')';
  function circulo(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
  function elipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); }
  // un polígono con los puntos en unidades de s
  function poli(c, s, puntos) { c.beginPath(); for (const [x, y] of puntos) c.lineTo(x * s, y * s); c.closePath(); }
  function estrellaRuta(c, puntas, fuera, dentro) {
    c.beginPath();
    for (let i = 0; i < puntas * 2; i++) { const r = i % 2 ? dentro : fuera, a = -Math.PI / 2 + i * Math.PI / puntas; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath();
  }
  function destelloRuta(c, s) {
    const q = s * 0.12;
    c.beginPath(); c.moveTo(0, -s);
    c.quadraticCurveTo(q, -q, s, 0); c.quadraticCurveTo(q, q, 0, s); c.quadraticCurveTo(-q, q, -s, 0); c.quadraticCurveTo(-q, -q, 0, -s);
    c.closePath();
  }
  function corazonRuta(c, s) {
    c.beginPath(); c.moveTo(0, s * 0.8);
    c.bezierCurveTo(-s * 1.15, s * 0.05, -s * 0.7, -s * 0.95, 0, -s * 0.38);
    c.bezierCurveTo(s * 0.7, -s * 0.95, s * 1.15, s * 0.05, 0, s * 0.8);
    c.closePath();
  }
  function circulos(c, lista, s) {
    c.beginPath();
    for (const [x, y, r] of lista) { c.moveTo(x * s + r * s, y * s); c.arc(x * s, y * s, r * s, 0, TAU); }
  }
  function copoRuta(c, s) {
    c.lineCap = 'round'; c.lineWidth = s * 0.17; c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6, ca = Math.cos(a), sa = Math.sin(a), p = (x, y) => [x * ca - y * sa, x * sa + y * ca];
      c.moveTo(...p(0, 0)); c.lineTo(...p(0, -s * 0.9));
      c.moveTo(...p(0, -s * 0.5)); c.lineTo(...p(-s * 0.24, -s * 0.72));
      c.moveTo(...p(0, -s * 0.5)); c.lineTo(...p(s * 0.24, -s * 0.72));
    }
  }
  // una gota: punta arriba y panza abajo
  function gotaRuta(c, s, k = 1) {
    c.beginPath(); c.moveTo(0, -0.9 * s * k);
    c.quadraticCurveTo(0.65 * s * k, 0, 0.55 * s * k, 0.35 * s * k); c.arc(0, 0.35 * s * k, 0.55 * s * k, 0, Math.PI);
    c.quadraticCurveTo(-0.65 * s * k, 0, 0, -0.9 * s * k); c.closePath();
  }
  function hojaRuta(c, s) {
    c.beginPath(); c.moveTo(0, -0.9 * s); c.quadraticCurveTo(0.75 * s, -0.2 * s, 0, 0.8 * s); c.quadraticCurveTo(-0.75 * s, -0.2 * s, 0, -0.9 * s); c.closePath();
  }
  function trazo(c, s, ancho, puntos) {
    c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = s * ancho; c.beginPath();
    for (const [x, y] of puntos) c.lineTo(x * s, y * s);
  }
  function hoja(c, s, pinta, relleno, nervio) {
    c.save(); c.rotate(0.5); hojaRuta(c, s); pinta(relleno);
    trazo(c, s, 0.09, [[0, -0.6], [0, 0.65]]); pinta(nervio, true); c.restore();
  }
  function burbuja(c, s, pinta, fuera, dentro) { circulo(c, 0, 0, s * 0.7); pinta(fuera); circulo(c, s * 0.08, s * 0.1, s * 0.5); pinta(dentro); }

  /* ---------- las piezas (las 44 de PP_ATAQUES.piezas y las del motor: destello, corazón, gotita, confeti y burbujita) ---------- */
  const PIEZAS = {
    zanahoria(c, s, pinta) {
      for (const a of [-0.55, 0, 0.55]) { elipse(c, Math.sin(a) * s * 0.3, -s * 0.68, s * 0.15, s * 0.36, a); pinta('#a8eaa6'); }
      c.beginPath(); c.moveTo(-s * 0.44, -s * 0.4); c.quadraticCurveTo(0, -s * 0.66, s * 0.44, -s * 0.4);
      c.quadraticCurveTo(s * 0.3, s * 0.4, s * 0.07, s * 0.95); c.quadraticCurveTo(0, s * 1.05, -s * 0.07, s * 0.95);
      c.quadraticCurveTo(-s * 0.3, s * 0.4, -s * 0.44, -s * 0.4); c.closePath(); pinta('#ffb27c');
    },
    huella(c, s, pinta) {
      elipse(c, 0, s * 0.3, s * 0.46, s * 0.36); pinta('#ffb6d6');
      circulos(c, [[-0.52, -0.18, 0.19], [-0.19, -0.52, 0.19], [0.19, -0.52, 0.19], [0.52, -0.18, 0.19]], s); pinta('#ffc8e0');
    },
    azucar(c, s, pinta) {
      c.beginPath(); c.roundRect(-s * 0.5, -s * 0.5, s, s, s * 0.22); pinta('#ffeaf5');
      c.beginPath(); c.roundRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56, s * 0.12); pinta('#ffcfe6');
    },
    nube(c, s, pinta) { circulos(c, [[-0.45, 0.12, 0.34], [0, -0.14, 0.46], [0.45, 0.12, 0.34], [0, 0.22, 0.36]], s); pinta('#f4faff'); },
    copo(c, s, pinta) { copoRuta(c, s); pinta('#a6dcff', true); circulo(c, 0, 0, s * 0.24); pinta('#e6f6ff'); },
    'cristal-hielo'(c, s, pinta) {
      poli(c, s, [[0, -1], [0.46, -0.22], [0.3, 0.8], [-0.3, 0.8], [-0.46, -0.22]]); pinta('#b8e4ff');
      poli(c, s, [[0, -1], [-0.46, -0.22], [-0.3, 0.8], [0, 0.8]]); pinta('#e2f5ff');
    },
    lupa(c, s, pinta) {
      trazo(c, s, 0.28, [[0.3, 0.3], [0.86, 0.86]]); pinta('#f2b888', true);
      circulo(c, -s * 0.12, -s * 0.12, s * 0.54); pinta('#ffd690');
      circulo(c, -s * 0.12, -s * 0.12, s * 0.4); pinta('#e8f7ff');
    },
    estrellita(c, s, pinta) { estrellaRuta(c, 5, s, s * 0.5); pinta('#ffe27a'); },
    clip(c, s, pinta) {
      c.lineWidth = s * 0.16; c.beginPath(); c.roundRect(-s * 0.32, -s * 0.85, s * 0.64, s * 1.7, s * 0.32); pinta('#a8d4ff', true);
      c.beginPath(); c.roundRect(-s * 0.14, -s * 0.58, s * 0.28, s * 1.1, s * 0.14); pinta('#cfe6ff', true);
    },
    cafe(c, s, pinta) {
      c.lineWidth = s * 0.16; circulo(c, s * 0.5, s * 0.2, s * 0.24); pinta('#f6e2d0', true);
      c.beginPath(); c.roundRect(-s * 0.5, -s * 0.2, s, s * 0.85, s * 0.24); pinta('#f6e2d0');
      elipse(c, 0, -s * 0.2, s * 0.46, s * 0.13); pinta('#d8a880');
      trazo(c, s, 0.1, [[-0.15, -0.45], [-0.05, -0.62], [-0.15, -0.8]]); pinta('#eaf4ff', true);
      trazo(c, s, 0.1, [[0.15, -0.45], [0.25, -0.62], [0.15, -0.8]]); pinta('#eaf4ff', true);
    },
    moneda(c, s, pinta) { circulo(c, 0, 0, s * 0.8); pinta('#ffd66e'); circulo(c, 0, 0, s * 0.56); pinta('#ffe7a6'); estrellaRuta(c, 5, s * 0.3, s * 0.15); pinta('#ffd66e'); },
    llave(c, s, pinta) {
      c.beginPath(); c.roundRect(-s * 0.15, -s * 0.1, s * 1.05, s * 0.22, s * 0.1); pinta('#ffd98a');
      poli(c, s, [[0.55, 0.1], [0.72, 0.1], [0.72, 0.4], [0.55, 0.4]]); pinta('#ffd98a');
      circulo(c, -s * 0.45, 0, s * 0.42); pinta('#ffd98a'); circulo(c, -s * 0.45, 0, s * 0.2); pinta('#fff3cf');
    },
    billete(c, s, pinta) {
      c.save(); c.rotate(-0.2); c.beginPath(); c.roundRect(-s * 0.9, -s * 0.52, s * 1.8, s * 1.04, s * 0.16); pinta('#b4e6ac');
      c.beginPath(); c.roundRect(-s * 0.7, -s * 0.34, s * 1.4, s * 0.68, s * 0.1); pinta('#d4f4cc');
      circulo(c, 0, 0, s * 0.24); pinta('#b4e6ac'); c.restore();
    },
    corbata(c, s, pinta) {
      poli(c, s, [[-0.2, -0.55], [0.2, -0.55], [0.36, 0.55], [0, 0.95], [-0.36, 0.55]]); pinta('#a6b8ec');
      poli(c, s, [[-0.3, -0.9], [0.3, -0.9], [0.2, -0.5], [-0.2, -0.5]]); pinta('#8ea4e4');
      poli(c, s, [[-0.06, -0.3], [0.1, -0.3], [0.22, 0.45], [0.1, 0.55]]); pinta('#c4d2f6');
    },
    'burbuja-rosa'(c, s, pinta) { burbuja(c, s, pinta, '#ffc0dc', '#ffe2ef'); },
    burbuja(c, s, pinta) { burbuja(c, s, pinta, '#b8e2ff', '#e4f5ff'); },
    concha(c, s, pinta) {
      c.beginPath(); c.moveTo(0, s * 0.7); c.arc(0, s * 0.15, s * 0.85, Math.PI * 1.08, Math.PI * 1.92); c.closePath(); pinta('#ffc2d6');
      for (const a of [-0.55, -0.2, 0.2, 0.55]) { trazo(c, s, 0.08, [[0, 0.6], [Math.sin(a) * 0.75, 0.15 - Math.cos(a) * 0.75]]); pinta('#ffe2ec', true); }
      c.beginPath(); c.roundRect(-s * 0.25, s * 0.55, s * 0.5, s * 0.3, s * 0.1); pinta('#ffb0c8');
    },
    perla(c, s, pinta) { circulo(c, 0, 0, s * 0.62); pinta('#fff0f6'); circulo(c, s * 0.1, s * 0.12, s * 0.42); pinta('#fffafc'); },
    gota(c, s, pinta) { gotaRuta(c, s); pinta('#a8d8ff'); gotaRuta(c, s, 0.55); pinta('#d6eeff'); },
    arcoiris(c, s, pinta) {
      c.lineCap = 'round'; c.lineWidth = s * 0.2;
      ['#ffb0c8', '#ffe08a', '#b8ecc0', '#bcdcff'].forEach((col, i) => { c.beginPath(); c.arc(0, s * 0.4, s * (0.88 - i * 0.2), Math.PI, TAU); pinta(col, true); });
      circulos(c, [[-0.68, 0.45, 0.22], [-0.42, 0.5, 0.2], [0.68, 0.45, 0.22], [0.42, 0.5, 0.2]], s); pinta('#ffffff');
    },
    'polvo-hada'(c, s, pinta) {
      for (const [x, y, k, col] of [[-0.35, -0.3, 0.55, '#e8f7a8'], [0.4, -0.05, 0.42, '#c8f0b8'], [-0.1, 0.45, 0.36, '#fff0a0']]) {
        c.save(); c.translate(x * s, y * s); destelloRuta(c, s * k); pinta(col); c.restore();
      }
      circulos(c, [[0.45, -0.6, 0.08], [0.3, 0.6, 0.07], [-0.65, 0.25, 0.07]], s); pinta('#ffffff');
    },
    flor(c, s, pinta) {
      for (let i = 0; i < 5; i++) { const a = i * TAU / 5; elipse(c, Math.sin(a) * s * 0.48, -Math.cos(a) * s * 0.48, s * 0.28, s * 0.4, a); pinta('#fff6fb'); }
      circulo(c, 0, 0, s * 0.3); pinta('#ffe08a');
    },
    cascabel(c, s, pinta) {
      circulo(c, 0, s * 0.15, s * 0.64); pinta('#ffd66e');
      c.beginPath(); c.roundRect(-s * 0.5, s * 0.15, s, s * 0.12, s * 0.06); pinta('#ffe8a8');
      circulo(c, 0, s * 0.5, s * 0.1); pinta('#f4c460');
      elipse(c, -s * 0.28, -s * 0.6, s * 0.28, s * 0.16, 0.4); pinta('#ffa0b4'); elipse(c, s * 0.28, -s * 0.6, s * 0.28, s * 0.16, -0.4); pinta('#ffa0b4');
    },
    estrella(c, s, pinta) { c.lineJoin = 'round'; c.lineWidth = s * 0.2; estrellaRuta(c, 5, s * 0.9, s * 0.48); pinta('#ffe27a', true); pinta('#ffe27a'); estrellaRuta(c, 5, s * 0.5, s * 0.26); pinta('#fff2b4'); },
    planeta(c, s, pinta) {
      circulo(c, 0, 0, s * 0.52); pinta('#d4c0ff');
      elipse(c, 0, -s * 0.12, s * 0.38, s * 0.12, -0.3); pinta('#e6daff');
      c.lineWidth = s * 0.14; elipse(c, 0, 0, s * 0.92, s * 0.26, -0.3); pinta('#ffd0ea', true);
    },
    bellota(c, s, pinta) {
      elipse(c, 0, s * 0.2, s * 0.42, s * 0.55); pinta('#f2b886');
      elipse(c, 0, -s * 0.3, s * 0.56, s * 0.3); pinta('#d8aa7c');
      trazo(c, s, 0.12, [[0, -0.55], [0.08, -0.8]]); pinta('#d8aa7c', true);
    },
    'hoja-otono'(c, s, pinta) { hoja(c, s, pinta, '#ffb070', '#ffd6a8'); },
    hoja(c, s, pinta) { hoja(c, s, pinta, '#a8e8a0', '#d6f6ce'); },
    astilla(c, s, pinta) {
      c.save(); c.rotate(0.7); poli(c, s, [[-0.18, -0.9], [0.2, -0.75], [0.16, 0.9], [-0.2, 0.7]]); pinta('#ecc89c');
      trazo(c, s, 0.07, [[0, -0.6], [0.02, 0.6]]); pinta('#f8e0c4', true); c.restore();
    },
    mandarina(c, s, pinta) {
      circulo(c, 0, s * 0.1, s * 0.68); pinta('#ffb870'); circulo(c, -s * 0.05, s * 0.15, s * 0.5); pinta('#ffc88e');
      elipse(c, s * 0.22, -s * 0.62, s * 0.26, s * 0.12, -0.5); pinta('#a8e8a0');
    },
    pez(c, s, pinta) {
      poli(c, s, [[0.35, 0], [0.9, -0.42], [0.9, 0.42]]); pinta('#c2dcff');
      elipse(c, -s * 0.12, 0, s * 0.6, s * 0.4); pinta('#a6cfff');
      circulo(c, -s * 0.4, -s * 0.06, s * 0.1); pinta('#ffffff');
    },
    pluma(c, s, pinta) {
      c.save(); c.rotate(0.6); elipse(c, 0, -s * 0.1, s * 0.32, s * 0.78); pinta('#fff0a6');
      trazo(c, s, 0.08, [[0, -0.7], [0, 0.95]]); pinta('#ffe07a', true); c.restore();
    },
    miel(c, s, pinta) { gotaRuta(c, s); pinta('#ffd060'); gotaRuta(c, s, 0.55); pinta('#ffe6a0'); },
    ticket(c, s, pinta) {
      c.save(); c.rotate(-0.25); c.beginPath(); c.roundRect(-s * 0.85, -s * 0.48, s * 1.7, s * 0.96, s * 0.14); pinta('#ffb8b8');
      c.beginPath(); c.roundRect(-s * 0.85, -s * 0.12, s * 1.7, s * 0.24, 0); pinta('#fff4f4');
      circulos(c, [[0.45, -0.48, 0.1], [0.45, 0.48, 0.1]], s); pinta('#ffe0e0'); c.restore();
    },
    luz(c, s, pinta) { circulo(c, 0, 0, s * 0.62); pinta('#ecffa8'); circulo(c, 0, 0, s * 0.38); pinta('#fdffe0'); },
    manzana(c, s, pinta) {
      circulos(c, [[-0.24, 0.12, 0.5], [0.24, 0.12, 0.5]], s); pinta('#ff9e9e');
      trazo(c, s, 0.1, [[0, -0.3], [0.05, -0.65]]); pinta('#d8aa7c', true);
      elipse(c, s * 0.28, -s * 0.55, s * 0.24, s * 0.11, -0.5); pinta('#a8e8a0');
    },
    tinta(c, s, pinta) {
      circulos(c, [[0, 0, 0.55], [-0.4, -0.3, 0.3], [0.45, -0.25, 0.28], [0.35, 0.42, 0.3], [-0.38, 0.38, 0.26]], s); pinta('#d4b4f2');
      circulos(c, [[-0.8, -0.65, 0.1], [0.82, 0.1, 0.09], [-0.1, 0.88, 0.08]], s); pinta('#d4b4f2');
    },
    pua(c, s, pinta) {
      c.save(); c.rotate(0.6); poli(c, s, [[0, -1], [0.17, 0.85], [-0.17, 0.85]]); pinta('#dcb48e');
      poli(c, s, [[0, -1], [0, 0.85], [-0.17, 0.85]]); pinta('#ecd0b0'); c.restore();
    },
    shuriken(c, s, pinta) { c.lineJoin = 'round'; c.lineWidth = s * 0.14; estrellaRuta(c, 4, s * 0.9, s * 0.3); pinta('#c8cedc', true); pinta('#c8cedc'); circulo(c, 0, 0, s * 0.16); pinta('#eef0f6'); },
    humo(c, s, pinta) { circulos(c, [[-0.4, 0.2, 0.36], [0.1, -0.1, 0.45], [0.48, 0.25, 0.3], [0, 0.4, 0.3]], s); pinta('#e6e6f0'); },
    alga(c, s, pinta) {
      c.lineCap = 'round'; c.lineWidth = s * 0.24; c.beginPath(); c.moveTo(0, s * 0.9);
      c.bezierCurveTo(s * 0.5, s * 0.4, -s * 0.5, -s * 0.2, s * 0.1, -s * 0.9); pinta('#a8e8b4', true);
      c.lineWidth = s * 0.08; pinta('#d4f6da', true);
    },
    bambu(c, s, pinta) {
      c.beginPath(); c.roundRect(-s * 0.22, -s * 0.9, s * 0.44, s * 1.8, s * 0.16); pinta('#b8e8a0');
      for (const y of [-0.3, 0.3]) { c.beginPath(); c.roundRect(-s * 0.26, y * s - s * 0.06, s * 0.52, s * 0.12, s * 0.06); pinta('#d8f4c6'); }
      elipse(c, s * 0.45, -s * 0.5, s * 0.3, s * 0.12, -0.6); pinta('#a0e090');
    },
    tuerca(c, s, pinta) {
      poli(c, s, [0, 1, 2, 3, 4, 5].map(i => [Math.cos(i * TAU / 6) * 0.78, Math.sin(i * TAU / 6) * 0.78])); pinta('#d6dae8');
      circulo(c, 0, 0, s * 0.32); pinta('#f4f6fb');
    },
    'chispa-electrica'(c, s, pinta) { poli(c, s, [[0.15, -0.95], [-0.45, 0.1], [-0.02, 0.1], [-0.2, 0.95], [0.48, -0.15], [0.05, -0.15]]); pinta('#fff08a'); },
    destello(c, s, pinta) { destelloRuta(c, s); pinta('#fff4b8'); },
    corazon(c, s, pinta) { corazonRuta(c, s); pinta('#ffa6cc'); },
    gotita(c, s, pinta, color) { circulo(c, 0, 0, s * 0.55); pinta(color); },
    confeti(c, s, pinta, color) { c.beginPath(); c.roundRect(-s * 0.3, -s * 0.55, s * 0.6, s * 1.1, s * 0.22); pinta(color); },
    burbujita(c, s, pinta, color) {
      circulo(c, 0, 0, s * 0.62); pinta(color);
      circulo(c, s * 0.08, s * 0.1, s * 0.44); pinta(mezcla(color, '#ffffff', 0.45));
    },
  };
  // el halo de cada pieza (si no lo tiene, el color de la estela en pastel)
  const HALO = f({
    zanahoria: '#ffd0a6', huella: '#ffc6e0', azucar: '#ffbfe0', nube: '#b9ddff', copo: '#bfe6ff', 'cristal-hielo': '#bfe6ff', lupa: '#ffe0a0',
    estrellita: '#fff0a0', destello: '#fff2b0', corazon: '#ffc2dc', clip: '#bfe0ff', cafe: '#f2d4b8', moneda: '#ffe48a', llave: '#ffe08a',
    billete: '#c8f0bc', corbata: '#c4d0f8', 'burbuja-rosa': '#ffc8e2', burbuja: '#c4e6ff', concha: '#ffd0e0', perla: '#ffe8f4', gota: '#bfe2ff',
    arcoiris: '#ffe6f2', 'polvo-hada': '#e4f8b0', flor: '#fff0c0', cascabel: '#ffe08a', estrella: '#fff0a0', planeta: '#e4d6ff', bellota: '#f8d2aa',
    'hoja-otono': '#ffd0a0', astilla: '#f4dcbc', mandarina: '#ffd2a0', pez: '#c8e0ff', pluma: '#fff4b8', miel: '#ffe08a', hoja: '#c8f2c0',
    ticket: '#ffcccc', luz: '#f4ffb0', manzana: '#ffc4c4', tinta: '#e4ccff', pua: '#f0d4b4', shuriken: '#dde2ee', humo: '#eeeef6', alga: '#c4f2cc',
    bambu: '#ccf0b8', tuerca: '#e4e8f2', 'chispa-electrica': '#fff4a0',
  });
  // dónde va el brillo blanco de cada pieza ([x, y, radio] en unidades de s)
  const BRILLO = f({
    zanahoria: [-0.2, -0.26, 0.1], huella: [-0.16, 0.16, 0.09], azucar: [-0.26, -0.26, 0.1], nube: [-0.14, -0.3, 0.11],
    'cristal-hielo': [-0.15, -0.45, 0.08], lupa: [-0.3, -0.3, 0.1], estrellita: [-0.16, -0.18, 0.1], corazon: [-0.32, -0.3, 0.12],
    gotita: [-0.18, -0.18, 0.13], burbujita: [-0.22, -0.24, 0.13], copo: [-0.06, -0.06, 0.08], moneda: [-0.3, -0.32, 0.12],
    'burbuja-rosa': [-0.26, -0.28, 0.14], burbuja: [-0.26, -0.28, 0.14], perla: [-0.2, -0.22, 0.14], gota: [-0.18, 0.1, 0.1],
    cascabel: [-0.24, -0.08, 0.12], estrella: [-0.15, -0.2, 0.1], planeta: [-0.2, -0.24, 0.1], bellota: [-0.16, 0.05, 0.1],
    mandarina: [-0.25, -0.15, 0.12], pez: [-0.2, -0.18, 0.1], miel: [-0.18, 0.1, 0.1], luz: [-0.2, -0.2, 0.13], manzana: [-0.38, -0.08, 0.12],
    tinta: [-0.18, -0.2, 0.1], cafe: [-0.3, 0.1, 0.1], billete: [-0.55, -0.3, 0.08], concha: [-0.3, -0.25, 0.1], tuerca: [-0.35, -0.35, 0.08],
  });
  return f({ PIEZAS: f(PIEZAS), HALO, BRILLO, rgb, mezcla, rgba, circulo, elipse, destelloRuta });
})();
