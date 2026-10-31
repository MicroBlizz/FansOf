// Fans of Goose · Sprites: los personajes son PNG pequeños de img/ (pixel art generado en Yoshi y reducido) y el resto se dibuja
// con código. Todo se pre-dibuja UNA vez por tamaño de pantalla en canvas ocultos (normal, girado y en blanco para el destello del
// golpe), y la partida solo hace drawImage: así aguantan cientos de ocas en un móvil flojo. Si un PNG falta, sale un dibujo de recambio.
'use strict';

let G = null;             // el pincel del canvas del juego (lo pone js/principal.js)
const SPR = {};         // nombre -> { n, f, b, w, h } (normal, flip, blanco; w y h en unidades del mundo)
const ARTE = 2;         // píxeles del dibujo por unidad del mundo: el pixel art de Yoshi se hizo a 2 (el canvas puede ir a más, PAN.k, y se amplía a número entero)
const IMG = {};           // los PNG cargados
// los objetos y adornos que tienen su PNG de Yoshi (si falta alguno, sale su dibujo de código, también pixelado)
const PNG_DE = { xp1: 'i-pluma', xp2: 'i-pluma-azul', xp3: 'i-pluma-roja', moneda: 'i-moneda', cuchilla: 'i-cuchilla', tornado: 'i-cuchilla-fuego', huevo: 'i-huevo', huevojefe: 'i-huevo-rojo', cofre: 'i-cofre', pollo: 'i-asada', iman: 'i-iman' };
const ICONO_PNG = { maldicion: 'i-maldicion', horda: 'i-horda', destierro: 'i-destierro', saltar: 'i-saltar', auto: 'i-auto', 'medalla-oro': 'i-medalla-oro', 'medalla-plata': 'i-medalla-plata', 'medalla-bronce': 'i-medalla-bronce', coraza: 'i-coraza', regen: 'i-regen', critico: 'i-critico', sabio: 'i-sabio', botin: 'i-botin', redado: 'i-redado', latigo: 'i-latigo', cuchilla: 'i-cuchilla', huevo: 'i-huevo', dado6: 'i-dado', fuerza: 'i-espada', prisa: 'i-bota', area: 'i-circulo', suerte: 'i-trebol', iman: 'i-iman', vida: 'i-corazon', plumon: 'i-pluma-azul', cadencia: 'i-reloj', moneda: 'i-moneda', pollo: 'i-asada', bolsa: 'i-bolsa', luna: 'i-luna', campana: 'i-campana', tirachinas: 'i-tirachinas', herradura: 'i-herradura', gaita: 'i-gaita', rayo: 'i-rayo', cepo: 'i-cepo', nota: 'i-nota', espinas: 'i-espinas', colmillo: 'i-colmillo', ojo: 'i-ojo', llave: 'i-llave', escudo: 'i-escudo', flechas: 'i-flechas', fenix: 'i-fenix', arsenal: 'i-arsenal', regateo: 'i-regateo', torbellino: 'h-torbellino', raices: 'h-raices', rafaga: 'h-rafaga', doble: 'h-doble', difuntos: 'h-difuntos', bendicion: 'h-bendicion', huevooro: 'i-huevo-oro', anuncio: 'i-anuncio', pase: 'i-pase', pack: 'i-pack' };   // los cuatro últimos: lo de pago (js/monetiza.js, js/pase.js)
const ADORNOS_PNG = ['arbol', 'seta', 'tocon', 'cuervo', 'calabaza', 'junco', 'charca', 'rana', 'lapida', 'cruz', 'vela', 'huesos', 'calavera', 'antorcha', 'cadena', 'barril', 'farol', 'carro', 'pozo', 'armadura', 'estandarte', 'estatua', 'carpa', 'globo', 'caballito', 'diana', 'pino', 'muneco', 'carambano', 'rocanieve', 'vagoneta', 'viga', 'cristal', 'pico'];
const ISLAS_PNG = ['bosque', 'pantano', 'cementerio', 'aldea', 'catacumbas', 'castillo', 'feria', 'helada', 'mina'].map(n => 'isla-' + n);   // la panza de las islas (js/tablero.js)
const FX_PNG = ['ui-panel', 'ui-losa', 'fx-charco', 'fx-charco-malo', 'fx-latigo', 'fx-onda', 'fx-estallido', 'fx-humo', 'fx-plumas', 'ui-panel', 'ui-carta', 's-cuerda', 'dado-1', 'dado-2', 'dado-3', 'dado-4', 'dado-5', 'dado-6', 'dadito-1', 'dadito-2', 'dadito-3', 'dadito-4', 'dadito-5', 'dadito-6'];
const ESCENAS_PNG = ['s-tabla', 's-pozo', 's-posada', 's-posadera', 's-cama', 's-dado', 's-cruce', 's-fuente', 's-mercader', 's-altar', 's-tesoro'];
const TEXTURAS_PNG = ['t-bosque', 't-pantano', 't-cementerio', 't-aldea', 't-catacumbas', 't-castillo', 't-feria', 't-helada', 't-mina'];
const HEROE_PNG = ['c-farol', ...['c-cuerpo', 'c-paso', 'c-golpe'].flatMap(n => [n, n + '-verde', n + '-azul', n + '-amarillo', n + '-negro', n + '-blanco']).flatMap(n => [n, n + '-izq'])];   // el héroe en capas (js/personajes.js)
// los fotogramas de los enemigos (Yoshi): cada ciclo es la lista de sprites que se van turnando
const CICLOS = {
  oca: ['e-oca-1', 'e-oca-2', 'e-oca-3', 'e-oca-2'],
  albatros: ['e-alb-1', 'albatros', 'e-alb-2', 'albatros'],
  gorda: ['e-gorda-1', 'gorda', 'e-gorda-2', 'gorda'],
  jefe: ['jefe', 'e-jefe-1'],
};
const NUEVOS_PNG = ['rana', 'cuervo', 'antorcha', 'armadura', 'zombi', 'mj-rana', 'mj-cuervo', 'mj-alcalde', 'mj-caballero', 'parca', 'parca-hoz', 'parca-guadana', 'hoz', 'fuego', 'payaso', 'nevada', 'minera', 'mj-domador', 'mj-yeti', 'mj-capataz'];
const ENEMIGOS_PNG = ['e-oca-1', 'e-oca-2', 'e-oca-3', 'e-alb-1', 'e-alb-2', 'e-gorda-1', 'e-gorda-2', 'e-jefe-1', 'e-jefe-2'];
// es una función: PARCA_PNG llega después (js/parca.js) y aquí aún no existe
const PNGS = () => [...new Set(['heroe', ...HEROE_PNG, ...ENEMIGOS_PNG, ...NUEVOS_PNG, ...(typeof PARCA_PNG !== 'undefined' ? PARCA_PNG : []), ...(typeof BARRERAS_PNG !== 'undefined' ? BARRERAS_PNG : []), 'oca', 'albatros', 'gorda', 'jefe', 'oca-dorada', 'portada', ...ESCENAS_PNG, ...ISLAS_PNG, ...FX_PNG, ...TEXTURAS_PNG, ...Object.values(PNG_DE), ...Object.values(ICONO_PNG), ...ADORNOS_PNG.map(n => 'a-' + n)])];

function cargaImagenes() {
  return Promise.all(PNGS().map(n => new Promise(ok => {
    const im = new Image(); im.onload = () => { IMG[n] = im; ok(); }; im.onerror = () => ok(); im.src = 'img/' + n + (n === 'portada' ? '.jpg' : '.png') + '?v=9';
  })));
}

const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

// prepara un sprite: dibuja(ctx, w, h) en unidades del mundo; k = píxeles reales por unidad
function hazSprite(nombre, w, h, dibuja, pixel) {
  const png = PNG_DE[nombre] || (nombre.startsWith('ad-') ? 'a-' + nombre.slice(3) : null);
  if (png && IMG[png]) { dibuja = dePng(png); w = IMG[png].width / ARTE; h = IMG[png].height / ARTE; pixel = true; }
  const k = PAN.k, c = lienzo(w * k, h * k), x = c.getContext('2d');
  x.imageSmoothingEnabled = !pixel; x.scale(k, k); dibuja(x, w, h);
  if (!pixel) { const d = x.getImageData(0, 0, c.width, c.height); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; x.putImageData(d, 0, 0); }   // los de código, sin suavizado: píxeles llenos o vacíos
  const f = lienzo(c.width, c.height), xf = f.getContext('2d'); xf.translate(c.width, 0); xf.scale(-1, 1); xf.drawImage(c, 0, 0);
  const b = lienzo(c.width, c.height), xb = b.getContext('2d'); xb.drawImage(c, 0, 0); xb.globalCompositeOperation = 'source-in'; xb.fillStyle = '#fff'; xb.fillRect(0, 0, b.width, b.height);
  SPR[nombre] = { n: c, f, b, w, h };
}

// un PNG de pixel art: se amplía sin suavizar (píxeles gordos)
const dePng = n => (x, w, h) => { const im = IMG[n]; const s = Math.min(w / im.width, h / im.height); x.drawImage(im, (w - im.width * s) / 2, (h - im.height * s) / 2, im.width * s, im.height * s); };

// --- dibujos de recambio y los que siempre son de código ---
function trazo(x, c, lw = 1.4) { x.lineWidth = lw; x.strokeStyle = '#120a0a'; x.lineJoin = 'round'; x.fillStyle = c; x.fill(); x.stroke(); }
function ocaCodigo(cuerpo, ojo) {
  return (x, w, h) => {
    const cx = w / 2, cy = h * 0.58;
    x.beginPath(); x.ellipse(cx, cy, w * 0.34, h * 0.26, 0, 0, 7); trazo(x, cuerpo);
    x.beginPath(); x.ellipse(cx + w * 0.16, cy - h * 0.3, w * 0.12, h * 0.16, 0.3, 0, 7); trazo(x, cuerpo);
    x.beginPath(); x.moveTo(cx + w * 0.24, cy - h * 0.33); x.lineTo(cx + w * 0.46, cy - h * 0.27); x.lineTo(cx + w * 0.24, cy - h * 0.22); trazo(x, '#e8892a');
    x.beginPath(); x.arc(cx + w * 0.19, cy - h * 0.33, w * 0.04, 0, 7); x.fillStyle = ojo; x.fill();
  };
}
const RECAMBIO = {
  heroe: (x, w, h) => {
    x.beginPath(); x.moveTo(w * 0.5, h * 0.08); x.lineTo(w * 0.85, h * 0.92); x.lineTo(w * 0.15, h * 0.92); x.closePath(); trazo(x, '#8a1e22');
    x.beginPath(); x.arc(w * 0.5, h * 0.3, w * 0.16, 0, 7); trazo(x, '#2a1418');
    x.beginPath(); x.arc(w * 0.78, h * 0.62, w * 0.11, 0, 7); trazo(x, '#ffd34d');
  },
  oca: ocaCodigo('#d9d3c4', '#ff2d2d'),
  albatros: (x, w, h) => {
    x.beginPath(); x.moveTo(w * 0.02, h * 0.45); x.quadraticCurveTo(w * 0.5, h * 0.05, w * 0.98, h * 0.45); x.quadraticCurveTo(w * 0.5, h * 0.35, w * 0.02, h * 0.45); trazo(x, '#9aa39a');
    x.beginPath(); x.ellipse(w / 2, h * 0.55, w * 0.12, h * 0.28, 0, 0, 7); trazo(x, '#c9cfc4');
    x.beginPath(); x.arc(w / 2, h * 0.3, w * 0.035, 0, 7); x.fillStyle = '#7dff6b'; x.fill();
  },
  gorda: (x, w, h) => { ocaCodigo('#b9b0a0', '#ff2d2d')(x, w, h); x.beginPath(); x.arc(w * 0.66, h * 0.22, w * 0.16, Math.PI, 0); trazo(x, '#6d6a66'); },
  jefe: (x, w, h) => {
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(w * (0.25 + i * 0.1), h * 0.7); x.quadraticCurveTo(w * (0.2 + i * 0.12), h * 0.95, w * (0.3 + i * 0.09), h * 0.98); x.lineWidth = 3; x.strokeStyle = '#3f6b2a'; x.stroke(); }
    ocaCodigo('#e5dcc8', '#ff2d2d')(x, w, h);
    x.beginPath(); x.moveTo(w * 0.52, h * 0.15); x.lineTo(w * 0.58, h * 0.02); x.lineTo(w * 0.64, h * 0.12); x.lineTo(w * 0.7, h * 0.0); x.lineTo(w * 0.74, h * 0.15); x.closePath(); trazo(x, '#ffc93d');
  },
  'oca-dorada': ocaCodigo('#ffc93d', '#7a3b00'),
};

function pluma(x, w, h, c1, c2) {
  x.save(); x.translate(w / 2, h / 2); x.rotate(-0.6);
  x.beginPath(); x.moveTo(0, -h * 0.46); x.quadraticCurveTo(w * 0.36, 0, 0, h * 0.46); x.quadraticCurveTo(-w * 0.36, 0, 0, -h * 0.46); x.fillStyle = c1; x.fill();
  x.lineWidth = 1; x.strokeStyle = '#3a1d00'; x.stroke();
  x.beginPath(); x.moveTo(0, -h * 0.42); x.lineTo(0, h * 0.46); x.strokeStyle = c2; x.lineWidth = 0.8; x.stroke(); x.restore();
}
const PUNTOS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
function caraDado(x, w, h, n, fondo = '#f1e6c8', punto = '#8a1010') {
  x.beginPath(); x.roundRect(1, 1, w - 2, h - 2, w * 0.2); x.fillStyle = fondo; x.fill(); x.lineWidth = Math.max(1.2, w * 0.07); x.strokeStyle = '#1a0d08'; x.stroke();
  x.fillStyle = punto; for (const [a, b] of PUNTOS[n]) { x.beginPath(); x.arc(w / 2 + a * w * 0.26, h / 2 + b * h * 0.26, w * 0.09, 0, 7); x.fill(); }
}

function preparaSprites() {
  for (const k in SPR) delete SPR[k];
  // con PNG, cada píxel del dibujo es un píxel de la pantalla pequeña (1:1): nada se deforma
  const pj = (n, w, h) => (IMG[n] ? hazSprite(n, IMG[n].width / ARTE, IMG[n].height / ARTE, dePng(n), true) : hazSprite(n, w, h, RECAMBIO[n], false));
  pj('heroe', 20, 20); pj('oca', 20, 20); pj('albatros', 26, 26); pj('gorda', 36, 36); pj('jefe', 72, 72); pj('oca-dorada', 30, 30);
  hazSprite('xp1', 6, 9, (x, w, h) => pluma(x, w, h, '#ffd34d', '#a45f00'));
  hazSprite('xp2', 8, 11, (x, w, h) => pluma(x, w, h, '#6bf2ff', '#086e8a'));
  hazSprite('xp3', 10, 14, (x, w, h) => pluma(x, w, h, '#ff6b4d', '#7a1000'));
  hazSprite('moneda', 8, 8, (x, w, h) => { x.beginPath(); x.arc(w / 2, h / 2, w * 0.42, 0, 7); trazo(x, '#ffcf33', 1); x.beginPath(); x.arc(w / 2, h / 2, w * 0.22, 0, 7); x.strokeStyle = '#a86a00'; x.lineWidth = 0.8; x.stroke(); });
  hazSprite('cuchilla', 10, 14, (x, w, h) => pluma(x, w, h, '#f4f0ff', '#5a6a8a'));
  hazSprite('tornado', 12, 16, (x, w, h) => pluma(x, w, h, '#ffe680', '#ff3b2f'));
  hazSprite('huevo', 8, 10, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.4, h * 0.44, 0, 0, 7); trazo(x, '#d8e3a0', 1); x.fillStyle = '#6b8a2a'; x.beginPath(); x.arc(w * 0.38, h * 0.4, w * 0.08, 0, 7); x.fill(); });
  hazSprite('bala', 8, 8, (x, w, h) => { x.beginPath(); x.arc(w / 2, h / 2, w * 0.36, 0, 7); trazo(x, '#7dff6b', 1); x.beginPath(); x.arc(w / 2, h / 2, w * 0.14, 0, 7); x.fillStyle = '#eaffdf'; x.fill(); });
  hazSprite('huevojefe', 10, 12, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.4, h * 0.44, 0, 0, 7); trazo(x, '#ff4d6b', 1.2); });
  hazSprite('cofre', 16, 14, (x, w, h) => {
    x.beginPath(); x.roundRect(1, h * 0.35, w - 2, h * 0.62, 2); trazo(x, '#7a3b16'); x.beginPath(); x.roundRect(1, 1, w - 2, h * 0.4, 3); trazo(x, '#9c4f1e');
    x.fillStyle = '#ffd34d'; x.fillRect(w * 0.42, h * 0.3, w * 0.16, h * 0.3); x.strokeRect(w * 0.42, h * 0.3, w * 0.16, h * 0.3);
  });
  hazSprite('pollo', 12, 10, (x, w, h) => { x.beginPath(); x.ellipse(w * 0.45, h * 0.55, w * 0.34, h * 0.36, 0, 0, 7); trazo(x, '#c9702a'); x.beginPath(); x.moveTo(w * 0.72, h * 0.45); x.lineTo(w * 0.95, h * 0.2); x.lineWidth = 2; x.strokeStyle = '#f1e6c8'; x.stroke(); });
  hazSprite('iman', 10, 8, (x, w, h) => { x.lineWidth = 2.4; x.strokeStyle = '#e0303a'; x.beginPath(); x.arc(w / 2, h * 0.55, w * 0.34, Math.PI, 0); x.stroke(); });
  for (const n of NUEVOS_PNG.concat(typeof PARCA_PNG !== 'undefined' ? PARCA_PNG : [])) if (IMG[n] && !SPR[n]) hazSprite(n, IMG[n].width / ARTE, IMG[n].height / ARTE, dePng(n), true);
  hazSprite('fuego', 8, 8, (x, w, h) => { x.beginPath(); x.arc(w / 2, h / 2, w * 0.36, 0, 7); trazo(x, '#ff7a2a', 1); x.fillStyle = '#ffd34d'; x.fillRect(w * 0.38, h * 0.3, w * 0.24, h * 0.3); });
  hazSprite('nieve', 8, 8, (x, w, h) => { x.beginPath(); x.arc(w / 2, h / 2, w * 0.38, 0, 7); trazo(x, '#eef6ff', 1); x.fillStyle = '#bfd8ef'; x.fillRect(w * 0.5, h * 0.5, w * 0.2, h * 0.2); });
  hazSprite('hoz', 10, 10, (x, w, h) => { x.beginPath(); x.arc(w / 2, h / 2, w * 0.4, 0.6, 4.2); x.lineWidth = 2.2; x.strokeStyle = '#120808'; x.stroke(); x.lineWidth = 1.2; x.strokeStyle = '#efe4c4'; x.stroke(); });
  for (const n of ENEMIGOS_PNG) if (IMG[n]) hazSprite(n, IMG[n].width / ARTE, IMG[n].height / ARTE, dePng(n), true);
  for (const n of HEROE_PNG) if (IMG[n]) hazSprite(n, IMG[n].width / ARTE, IMG[n].height / ARTE, dePng(n), true);
  for (const n of ISLAS_PNG.concat(FX_PNG)) if (IMG[n]) hazSprite(n, IMG[n].width / ARTE, IMG[n].height / ARTE, dePng(n), true);
  for (const n of ESCENAS_PNG) if (IMG[n]) hazSprite(n, IMG[n].width / ARTE, IMG[n].height / ARTE, dePng(n), true);
  for (const id in ICONO_PNG) if (IMG[ICONO_PNG[id]]) hazSprite('ic-' + id, IMG[ICONO_PNG[id]].width / ARTE, IMG[ICONO_PNG[id]].height / ARTE, dePng(ICONO_PNG[id]), true);
  const dadosYoshi = [1, 2, 3, 4, 5, 6].every(n => IMG['dado-' + n] && IMG['dadito-' + n]);   // las caras del dado de Yoshi (solo si están las seis)
  for (let n = 1; n <= 6; n++) if (dadosYoshi) { hazSprite('dado' + n, 12, 12, dePng('dadito-' + n), true); hazSprite('dadogrande' + n, 34, 34, dePng('dado-' + n), true); }
  if (!dadosYoshi) for (let n = 1; n <= 6; n++) hazSprite('dado' + n, 12, 12, (x, w, h) => caraDado(x, w, h, n));
  if (!dadosYoshi) for (let n = 1; n <= 6; n++) hazSprite('dadogrande' + n, 34, 34, (x, w, h) => caraDado(x, w, h, n, n % 2 ? '#3a1416' : '#f6e7b8', n % 2 ? '#ff4d4d' : '#8a1010'));
  preparaLosas();
}

// las losas del camino: tres variantes de tablones viejos, pre-dibujadas
const LOSAS = [];
function preparaLosas() {
  LOSAS.length = 0;
  const w = CFG.anchoCamino, h = CFG.altoCasilla;
  for (let v = 0; v < 3; v++) {
    const k = PAN.k, c = lienzo(w * k, h * k), x = c.getContext('2d'); x.scale(k, k);
    const r = azarSemilla(17 + v * 31);
    x.fillStyle = '#4a2f1d'; x.fillRect(0, 0, w, h);
    const tablas = 6; const tw = w / tablas;
    for (let i = 0; i < tablas; i++) {
      const tono = 50 + Math.floor(r() * 26);
      x.fillStyle = `rgb(${tono + 40},${tono + 12},${tono - 14})`; x.fillRect(i * tw + 0.6, 0, tw - 1.2, h);
      x.fillStyle = 'rgba(0,0,0,.18)'; for (let j = 0; j < 4; j++) x.fillRect(i * tw + 2 + r() * (tw - 6), r() * h, 0.8, 6 + r() * 16);
      x.fillStyle = '#26140a'; x.beginPath(); x.arc(i * tw + tw / 2, 4, 0.9, 0, 7); x.arc(i * tw + tw / 2, h - 4, 0.9, 0, 7); x.fill();
    }
    // grietas
    x.strokeStyle = 'rgba(15,6,2,.55)'; x.lineWidth = 0.8;
    for (let j = 0; j < 3; j++) { x.beginPath(); let px = r() * w, py = r() * h; x.moveTo(px, py); for (let s = 0; s < 4; s++) { px += (r() - 0.5) * 18; py += (r() - 0.5) * 18; x.lineTo(px, py); } x.stroke(); }
    // borde oscuro y franja inferior (el canto de la losa)
    x.strokeStyle = '#1a0c05'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2);
    LOSAS.push(c);
  }
}

// un azar con semilla (para que el tablero sea siempre igual)
function azarSemilla(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// dibuja un sprite centrado en (x, y) en unidades del mundo
function pinta(nombre, x, y, voltea, blanco, escala = 1, alfa = 1) {
  const s = SPR[nombre]; if (!s) return;
  const w = s.w * escala, h = s.h * escala;
  if (alfa !== 1) G.globalAlpha = alfa;
  G.drawImage(blanco ? s.b : voltea ? s.f : s.n, x - w / 2, y - h / 2, w, h);
  if (alfa !== 1) G.globalAlpha = 1;
}
function pintaGirado(nombre, x, y, ang, escala = 1) {
  const s = SPR[nombre]; if (!s) return;
  G.save(); G.translate(x, y); G.rotate(ang); G.drawImage(s.n, -s.w * escala / 2, -s.h * escala / 2, s.w * escala, s.h * escala); G.restore();
}
