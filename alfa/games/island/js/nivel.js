// Fans of Island · NIVEL: los datos de cada nivel y cómo se carga y se mueve. Las coordenadas son píxeles de la lona (270 de alto; el
// suelo normal está en y = 220); el ancho lo dice cada nivel. Tipos de plataforma: 'suelo' (tierra con hierba) y 'bloque' (plastelina,
// color: rosa '#f0a8a0', amarillo '#f0d8a0' o azul '#a8c8f0') son sólidos; 'hilo' es ganchillo (solo sostiene por arriba); 'barrera' es un
// muro de hilo que solo quema el poder de fuego; 'puerta' es otro muro de hilo que abre un interruptor (interruptores.js: {x, y, abre};
// la puerta lleva puerta: <mismo nombre>); 'mancha' es pintura que solo disuelve el agua. mov: vaivén {dx, dy, per}.
// zanahorias: las de poder {t: 'roja'|'verde'|'azul'|'morada'|'dorada', x, y} (zanahorias.js); pequenas: las de coleccionar, en filas {x, y, n, dx, dy}.
// enemigos: {x, y, dir} becarios que patrullan la plataforma donde caen (enemigos.js). decor: árboles, setas y flores (arte-escena.js).
'use strict';
const IS_NIVELES = [
  { id: 'pradera', nombre: 'La Pradera de Hilo', paleta: 'manana', ancho: 2600, inicio: { x: 60, y: 186 }, meta: { x: 2500, y: 154 },
    plataformas: [
      // A · la salida: una carrera, un bloque para probar el salto y el primer becario
      { t: 'suelo', x: 0, y: 220, w: 420, h: 60 },
      { t: 'bloque', x: 290, y: 190, w: 40, h: 30, color: '#f0a8a0' },
      // B · el primer hueco (con atajo de hilo por arriba) y la zanahoria verde: el brote sube a la repisa de los premios
      { t: 'hilo', x: 436, y: 176, w: 52, h: 12 },
      { t: 'suelo', x: 480, y: 220, w: 280, h: 60 },
      { t: 'bloque', x: 600, y: 134, w: 64, h: 14, color: '#f0d8a0' },
      // C · plataforma que sube y baja; la mancha de pintura solo la quita el agua
      { t: 'hilo', x: 764, y: 200, w: 46, h: 12, mov: { dx: 0, dy: -44, per: 3 } },
      { t: 'suelo', x: 820, y: 220, w: 360, h: 60 },
      { t: 'mancha', x: 930, y: 130, w: 30, h: 90 },
      { t: 'bloque', x: 1090, y: 176, w: 44, h: 44, color: '#a8c8f0' },
      // D · la puerta de hilo: el botón está en una repisa a la que solo se llega lanzando al compañero
      { t: 'hilo', x: 1192, y: 184, w: 46, h: 12 },
      { t: 'suelo', x: 1240, y: 220, w: 460, h: 60 },
      { t: 'bloque', x: 1380, y: 110, w: 60, h: 12, color: '#f0a8a0' },
      { t: 'puerta', x: 1460, y: 130, w: 22, h: 90, puerta: 'pradera-1' },
      { t: 'bloque', x: 1560, y: 190, w: 40, h: 30, color: '#f0d8a0' },
      // E · la plataforma que va y viene, la zanahoria roja y la barrera de hilo que arde
      { t: 'hilo', x: 1708, y: 192, w: 46, h: 12, mov: { dx: 30, dy: 0, per: 3.4 } },
      { t: 'suelo', x: 1780, y: 220, w: 420, h: 60 },
      { t: 'barrera', x: 1950, y: 130, w: 22, h: 90 },
      // F · la cuesta final de bloques y la bandera
      { t: 'suelo', x: 2200, y: 220, w: 400, h: 60 },
      { t: 'bloque', x: 2290, y: 190, w: 40, h: 30, color: '#f0a8a0' },
      { t: 'bloque', x: 2330, y: 160, w: 40, h: 60, color: '#f0d8a0' },
      { t: 'bloque', x: 2370, y: 130, w: 40, h: 90, color: '#a8c8f0' },
    ],
    zanahorias: [{ t: 'verde', x: 530, y: 200 }, { t: 'dorada', x: 625, y: 110 }, { t: 'azul', x: 860, y: 200 }, { t: 'morada', x: 1300, y: 200 }, { t: 'roja', x: 1890, y: 200 }],
    pequenas: [
      { x: 140, y: 200, n: 5 }, { x: 296, y: 166, n: 3 },                       // A
      { x: 440, y: 150, n: 4 }, { x: 606, y: 112, n: 5 },                       // B: sobre el atajo y en la repisa del brote
      { x: 770, y: 150, n: 3 }, { x: 1000, y: 200, n: 3 }, { x: 1096, y: 150, n: 3 },   // C
      { x: 1386, y: 86, n: 4 }, { x: 1500, y: 200, n: 4 }, { x: 1566, y: 166, n: 3 },   // D: la repisa del botón y tras la puerta
      { x: 1716, y: 160, n: 4 }, { x: 2000, y: 200, n: 4 }, { x: 2100, y: 180, n: 3, dy: -12 },   // E
      { x: 2296, y: 166, n: 3 }, { x: 2336, y: 136, n: 3 }, { x: 2376, y: 106, n: 3 }, { x: 2440, y: 200, n: 3 },   // F
    ],
    enemigos: [{ x: 370, y: 190, dir: -1 }, { x: 1050, y: 190, dir: -1 }, { x: 1620, y: 190, dir: -1 }, { x: 2040, y: 190, dir: 1 }, { x: 2130, y: 190, dir: -1 }],
    interruptores: [{ x: 1396, y: 100, abre: 'pradera-1', pista: 'Esa repisa está muy alta: lanza a tu compañero (L) para que pise el botón.' }],
    decor: [
      { t: 'arbol', x: 40, y: 220, s: 1 }, { t: 'seta', x: 120, y: 220 }, { t: 'flor', x: 220, y: 220 }, { t: 'flor', x: 350, y: 220, color: 'rosa' }, { t: 'arbol', x: 400, y: 220, s: 0.8 },
      { t: 'seta', x: 560, y: 220 }, { t: 'arbol', x: 700, y: 220, s: 1.1 }, { t: 'flor', x: 740, y: 220 },
      { t: 'arbol', x: 870, y: 220, s: 0.9 }, { t: 'flor', x: 990, y: 220, color: 'rosa' }, { t: 'seta', x: 1150, y: 220 },
      { t: 'arbol', x: 1280, y: 220, s: 1 }, { t: 'flor', x: 1340, y: 220 }, { t: 'seta', x: 1530, y: 220 }, { t: 'arbol', x: 1660, y: 220, s: 0.85 },
      { t: 'flor', x: 1830, y: 220, color: 'rosa' }, { t: 'arbol', x: 1900, y: 220, s: 1.1 }, { t: 'seta', x: 2170, y: 220 },
      { t: 'arbol', x: 2240, y: 220, s: 0.9 }, { t: 'flor', x: 2460, y: 220 }, { t: 'arbol', x: 2560, y: 220, s: 1 },
    ],
  },
];
function isNivelPorId(id) { return IS_NIVELES.find(n => n.id === id) || IS_NIVELES[0]; }
function isNivelSiguiente(id) { const i = IS_NIVELES.findIndex(n => n.id === id); return i >= 0 && i + 1 < IS_NIVELES.length ? IS_NIVELES[i + 1] : null; }
function isNivelAbierto(id) { const i = IS_NIVELES.findIndex(n => n.id === id); return i <= 0 || !!SAVE.niveles[IS_NIVELES[i - 1].id]; }
function isCargaNivel(id) {
  const N = isNivelPorId(id);
  const plataformas = N.plataformas.map((p, i) => ({ ...p, id: i, x0: p.x, y0: p.y, solida: p.t !== 'hilo', dx: 0, dy: 0, fase: i * 0.7, quemando: 0 }));
  return { def: N, ancho: N.ancho, alto: 270, plataformas, decor: N.decor, meta: { x: N.meta.x, y: 0, w: 24, h: N.meta.y + 66, bandera: N.meta.y },   /* la meta cuenta a cualquier altura: basta con cruzar la bandera */ zanahorias: isCargaZanahorias(N), pequenas: isCargaPequenas(N), interruptores: isCargaInterruptores(N), enemigos: isCargaEnemigos(N), t: 0 };
}
function isNivelActualiza(m, dt) {
  m.t += dt;
  for (const p of m.plataformas) {
    if (!p.mov || !p.mov.per) continue;   // los brotes (poderes.js) se mueven por su cuenta
    const k = (Math.sin((m.t / p.mov.per) * Math.PI * 2 + p.fase) + 1) / 2;
    const nx = p.x0 + p.mov.dx * k, ny = p.y0 + p.mov.dy * k;
    p.dx = nx - p.x; p.dy = ny - p.y; p.x = nx; p.y = ny;
  }
}
