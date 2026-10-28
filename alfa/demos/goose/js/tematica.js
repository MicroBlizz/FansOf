// Fans of Goose · La temática de las casillas: como en un tablero de la Oca de verdad, cada casilla tiene su dibujo. El camino
// pasa por seis tierras (Bosque, Pantano, Cementerio, Aldea, Catacumbas y Castillo), cada una con su suelo, su color de fondo y
// sus adornos (árboles, lápidas, faroles, barriles, huesos, armaduras…), y cada casilla elige los suyos con una semilla fija.
// Al entrar en una tierra nueva sale su nombre. Todo se pre-dibuja una vez por tamaño de pantalla.
'use strict';

const BIOMAS = [
  { desde: 1,  id: 'bosque', nombre: 'EL BOSQUE MUSTIO',    suelo: ['#5d4128', '#6b4a2c'], veta: '#3a2414', fondo: '#0d1410', niebla: '#8fb39a', adornos: ['arbol', 'seta', 'tocon', 'cuervo', 'calabaza'] },
  { desde: 11, id: 'pantano', nombre: 'EL PANTANO',          suelo: ['#3f4a2a', '#4a5530'], veta: '#232b14', fondo: '#0a140e', niebla: '#7dbf6b', adornos: ['junco', 'charca', 'seta', 'tocon', 'rana'] },
  { desde: 21, id: 'cementerio', nombre: 'EL CEMENTERIO',       suelo: ['#4b4a50', '#55545a'], veta: '#2a292e', fondo: '#0e0c14', niebla: '#a8a0c9', adornos: ['lapida', 'cruz', 'vela', 'huesos', 'cuervo'] },
  { desde: 31, id: 'aldea', nombre: 'LA ALDEA MALDITA',    suelo: ['#6e5a44', '#7a6449'], veta: '#3d2f20', fondo: '#140e0a', niebla: '#d9b38a', adornos: ['barril', 'farol', 'carro', 'calabaza', 'pozo'] },
  { desde: 41, id: 'catacumbas', nombre: 'LAS CATACUMBAS',      suelo: ['#5a3a2e', '#653f31'], veta: '#2c1a13', fondo: '#120808', niebla: '#c98a6b', adornos: ['huesos', 'vela', 'calavera', 'antorcha', 'cadena'] },
  { desde: 51, id: 'castillo', nombre: 'EL CASTILLO DE LA OCA', suelo: ['#3a2a3a', '#432f42'], veta: '#1f141f', fondo: '#100810', niebla: '#d98aa8', adornos: ['armadura', 'estandarte', 'antorcha', 'estatua', 'vela'] },
];
const biomaDe = t => { let b = BIOMAS[0]; for (const x of BIOMAS) if (t >= x.desde) b = x; return b; };
const indiceBioma = t => BIOMAS.indexOf(biomaDe(t));

// --- suelos: dos variantes por tierra ---
const SUELOS = [];   // SUELOS[bioma][variante]
function preparaSuelos() {
  SUELOS.length = 0;
  const w = CFG.anchoCamino + 24, h = CFG.altoCasilla, k = PAN.k;
  BIOMAS.forEach((B, bi) => {
    const lista = [];
    for (let v = 0; v < 2; v++) {
      const c = lienzo(w * k, h * k), x = c.getContext('2d'); x.scale(k, k);
      const r = azarSemilla(31 + bi * 17 + v * 7);
      x.fillStyle = B.veta; x.fillRect(0, 0, w, h);
      const tex = IMG['t-' + B.id];
      if (tex) {   // el suelo pintado por Yoshi, repetido (1 píxel del dibujo = 1 píxel de la pantalla pequeña)
        x.setTransform(1, 0, 0, 1, 0, 0);
        for (let ty = 0; ty < c.height; ty += tex.height) for (let tx = 0; tx < c.width; tx += tex.width) x.drawImage(tex, tx + (v ? tex.width / 2 : 0) - tex.width, ty, tex.width, tex.height), x.drawImage(tex, tx + (v ? tex.width / 2 : 0), ty, tex.width, tex.height);
        x.scale(k, k);
      } else if (bi === 0 || bi === 3) {   // tablones
        const n = 6, tw = w / n;
        for (let i = 0; i < n; i++) { x.fillStyle = B.suelo[(i + v) % 2]; x.fillRect(i * tw + 0.6, 0, tw - 1.2, h); x.fillStyle = 'rgba(0,0,0,.18)'; for (let j = 0; j < 4; j++) x.fillRect(i * tw + 2 + r() * (tw - 6), r() * h, 0.8, 6 + r() * 16); x.fillStyle = B.veta; x.beginPath(); x.arc(i * tw + tw / 2, 4, 0.9, 0, 7); x.arc(i * tw + tw / 2, h - 4, 0.9, 0, 7); x.fill(); }
      } else if (bi === 1) {        // tablas sobre el barro, con musgo
        x.fillStyle = '#2a3018'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 9; i++) { const y = i * h / 9; x.fillStyle = B.suelo[(i + v) % 2]; x.fillRect(2 + r() * 4, y + 1, w - 8 - r() * 6, h / 9 - 2); }
        for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? '#5f7a2e' : '#7d9a3a'; x.fillRect(r() * w, r() * h, 2 + r() * 3, 1.5); }
      } else {                      // losas de piedra / ladrillo / alfombra
        const fil = bi === 4 ? 10 : 6, col = bi === 4 ? 6 : 4, cw = w / col, ch = h / fil;
        for (let f = 0; f < fil; f++) for (let cc = 0; cc < col + 1; cc++) {
          const off = f % 2 ? cw / 2 : 0;
          x.fillStyle = B.suelo[(f + cc + v) % 2]; x.globalAlpha = 0.85 + r() * 0.15;
          x.fillRect(cc * cw - off + 0.8, f * ch + 0.8, cw - 1.6, ch - 1.6);
        }
        x.globalAlpha = 1;
        if (bi === 5) { x.fillStyle = '#7a1420'; x.fillRect(w * 0.3, 0, w * 0.4, h); x.fillStyle = '#c9a24a'; x.fillRect(w * 0.3, 0, 1.5, h); x.fillRect(w * 0.7 - 1.5, 0, 1.5, h); }
        if (bi === 2) for (let i = 0; i < 25; i++) { x.fillStyle = '#3d5a2a'; x.fillRect(r() * w, r() * h, 2, 1); }
      }
      // grietas y borde
      x.strokeStyle = 'rgba(10,4,2,.5)'; x.lineWidth = 0.8;
      for (let j = 0; j < 3; j++) { x.beginPath(); let px = r() * w, py = r() * h; x.moveTo(px, py); for (let s = 0; s < 4; s++) { px += (r() - 0.5) * 18; py += (r() - 0.5) * 18; x.lineTo(px, py); } x.stroke(); }
      x.strokeStyle = '#120805'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2);
      lista.push(c);
    }
    SUELOS.push(lista);
  });
  preparaAdornos();
}

// --- adornos: pequeños dibujos con contorno grueso ---
function preparaAdornos() {
  const t = (x, c) => { x.lineWidth = 1.2; x.strokeStyle = '#120808'; x.lineJoin = 'round'; x.fillStyle = c; x.fill(); x.stroke(); };
  const A = {
    arbol: [18, 26, (x, w, h) => { x.beginPath(); x.moveTo(w * 0.45, h); x.lineTo(w * 0.5, h * 0.3); x.lineTo(w * 0.2, h * 0.1); x.moveTo(w * 0.5, h * 0.45); x.lineTo(w * 0.85, h * 0.2); x.moveTo(w * 0.48, h * 0.3); x.lineTo(w * 0.6, h * 0.02); x.lineWidth = 3.4; x.strokeStyle = '#120808'; x.stroke(); x.lineWidth = 2; x.strokeStyle = '#4a3020'; x.stroke(); }],
    seta: [10, 10, (x, w, h) => { x.fillStyle = '#e8dcc0'; x.fillRect(w * 0.4, h * 0.45, w * 0.2, h * 0.5); x.beginPath(); x.ellipse(w / 2, h * 0.45, w * 0.45, h * 0.32, 0, Math.PI, 0); t(x, '#c0302f'); x.fillStyle = '#fff'; x.fillRect(w * 0.3, h * 0.25, 1.5, 1.5); x.fillRect(w * 0.6, h * 0.2, 1.5, 1.5); }],
    tocon: [14, 9, (x, w, h) => { x.beginPath(); x.roundRect(1, h * 0.3, w - 2, h * 0.65, 2); t(x, '#5a3a22'); x.beginPath(); x.ellipse(w / 2, h * 0.32, w * 0.44, h * 0.22, 0, 0, 7); t(x, '#a07a4a'); }],
    cuervo: [12, 10, (x, w, h) => { x.beginPath(); x.ellipse(w * 0.45, h * 0.6, w * 0.32, h * 0.3, 0, 0, 7); t(x, '#1a1420'); x.beginPath(); x.arc(w * 0.72, h * 0.35, w * 0.16, 0, 7); t(x, '#1a1420'); x.fillStyle = '#e8a42a'; x.fillRect(w * 0.84, h * 0.33, w * 0.16, 1.4); x.fillStyle = '#ff2d2d'; x.fillRect(w * 0.74, h * 0.3, 1.2, 1.2); }],
    calabaza: [12, 10, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h * 0.6, w * 0.45, h * 0.38, 0, 0, 7); t(x, '#e8742a'); x.fillStyle = '#3a1d00'; x.fillRect(w * 0.3, h * 0.5, 2, 2); x.fillRect(w * 0.6, h * 0.5, 2, 2); x.fillRect(w * 0.35, h * 0.72, w * 0.3, 1.4); x.fillStyle = '#3f6b2a'; x.fillRect(w * 0.46, h * 0.12, 2, h * 0.14); }],
    junco: [10, 18, (x, w, h) => { for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(w * (0.2 + i * 0.2), h); x.quadraticCurveTo(w * (0.1 + i * 0.25), h * 0.4, w * (0.15 + i * 0.22), h * 0.05); x.lineWidth = 1.6; x.strokeStyle = '#5f7a2e'; x.stroke(); } x.fillStyle = '#5a3418'; x.fillRect(w * 0.12, h * 0.05, 2.4, 5); }],
    charca: [20, 8, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.48, h * 0.42, 0, 0, 7); t(x, '#2f4a3a'); x.fillStyle = 'rgba(180,255,200,.3)'; x.fillRect(w * 0.3, h * 0.35, w * 0.2, 1); }],
    rana: [9, 7, (x, w, h) => { x.beginPath(); x.ellipse(w / 2, h * 0.6, w * 0.45, h * 0.38, 0, 0, 7); t(x, '#5f9a2e'); x.fillStyle = '#ffd34d'; x.fillRect(w * 0.25, h * 0.25, 1.6, 1.6); x.fillRect(w * 0.62, h * 0.25, 1.6, 1.6); }],
    lapida: [12, 15, (x, w, h) => { x.beginPath(); x.moveTo(1, h); x.lineTo(1, h * 0.35); x.arc(w / 2, h * 0.35, w / 2 - 1, Math.PI, 0); x.lineTo(w - 1, h); x.closePath(); t(x, '#7a7a84'); x.fillStyle = '#3a3a44'; x.fillRect(w * 0.42, h * 0.3, w * 0.16, h * 0.4); x.fillRect(w * 0.28, h * 0.42, w * 0.44, h * 0.1); }],
    cruz: [10, 16, (x, w, h) => { x.beginPath(); x.rect(w * 0.38, h * 0.05, w * 0.24, h * 0.95); x.rect(w * 0.08, h * 0.28, w * 0.84, h * 0.18); t(x, '#5a4a3a'); }],
    vela: [6, 12, (x, w, h) => { x.beginPath(); x.rect(w * 0.25, h * 0.4, w * 0.5, h * 0.6); t(x, '#efe4c4'); x.beginPath(); x.ellipse(w / 2, h * 0.25, w * 0.22, h * 0.16, 0, 0, 7); x.fillStyle = '#ffb04d'; x.fill(); x.fillStyle = '#fff2a8'; x.fillRect(w * 0.42, h * 0.2, w * 0.16, h * 0.1); }],
    huesos: [14, 8, (x, w, h) => { x.lineCap = 'round'; x.strokeStyle = '#120808'; x.lineWidth = 3; x.beginPath(); x.moveTo(2, h - 2); x.lineTo(w - 2, 2); x.moveTo(2, 2); x.lineTo(w - 2, h - 2); x.stroke(); x.strokeStyle = '#efe4c4'; x.lineWidth = 1.6; x.stroke(); }],
    calavera: [10, 10, (x, w, h) => { x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.42, 0, 7); t(x, '#efe4c4'); x.fillStyle = '#120808'; x.fillRect(w * 0.25, h * 0.38, 2, 2); x.fillRect(w * 0.58, h * 0.38, 2, 2); x.fillRect(w * 0.35, h * 0.78, w * 0.3, 1.2); }],
    antorcha: [6, 16, (x, w, h) => { x.fillStyle = '#4a3020'; x.fillRect(w * 0.35, h * 0.35, w * 0.3, h * 0.65); x.beginPath(); x.ellipse(w / 2, h * 0.22, w * 0.4, h * 0.2, 0, 0, 7); x.fillStyle = '#ff7a2a'; x.fill(); x.fillStyle = '#ffd34d'; x.fillRect(w * 0.38, h * 0.18, w * 0.24, h * 0.12); }],
    cadena: [6, 18, (x, w, h) => { for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(w / 2, 2 + i * 3.5, w * 0.35, 2, 0, 0, 7); x.lineWidth = 1.2; x.strokeStyle = '#8a8a94'; x.stroke(); } }],
    barril: [11, 13, (x, w, h) => { x.beginPath(); x.roundRect(1, 1, w - 2, h - 2, 3); t(x, '#7a4a26'); x.fillStyle = '#3a3a44'; x.fillRect(1, h * 0.25, w - 2, 1.4); x.fillRect(1, h * 0.7, w - 2, 1.4); }],
    farol: [8, 22, (x, w, h) => { x.fillStyle = '#1a1420'; x.fillRect(w * 0.42, h * 0.3, w * 0.16, h * 0.7); x.beginPath(); x.rect(w * 0.15, h * 0.05, w * 0.7, h * 0.28); t(x, '#ffd34d'); }],
    carro: [20, 12, (x, w, h) => { x.beginPath(); x.rect(2, 1, w - 4, h * 0.55); t(x, '#6b4a2c'); x.beginPath(); x.arc(w * 0.25, h * 0.75, h * 0.24, 0, 7); t(x, '#3a2414'); x.beginPath(); x.arc(w * 0.75, h * 0.75, h * 0.24, 0, 7); t(x, '#3a2414'); }],
    pozo: [14, 13, (x, w, h) => { x.beginPath(); x.roundRect(1, h * 0.45, w - 2, h * 0.5, 2); t(x, '#7a7a84'); x.beginPath(); x.ellipse(w / 2, h * 0.47, w * 0.4, h * 0.12, 0, 0, 7); x.fillStyle = '#05060a'; x.fill(); x.fillStyle = '#4a3020'; x.fillRect(2, 1, 1.6, h * 0.45); x.fillRect(w - 3.6, 1, 1.6, h * 0.45); x.fillRect(2, 1, w - 4, 1.6); }],
    armadura: [11, 20, (x, w, h) => { x.beginPath(); x.arc(w / 2, h * 0.16, w * 0.28, 0, 7); t(x, '#9aa0a8'); x.beginPath(); x.rect(w * 0.18, h * 0.3, w * 0.64, h * 0.4); t(x, '#8a9098'); x.beginPath(); x.rect(w * 0.25, h * 0.7, w * 0.18, h * 0.3); x.rect(w * 0.57, h * 0.7, w * 0.18, h * 0.3); t(x, '#7a8088'); x.fillStyle = '#120808'; x.fillRect(w * 0.3, h * 0.14, w * 0.4, 1.2); }],
    estandarte: [10, 22, (x, w, h) => { x.fillStyle = '#4a3020'; x.fillRect(1, 0, 1.6, h); x.beginPath(); x.moveTo(2.6, 2); x.lineTo(w - 1, 2); x.lineTo(w - 1, h * 0.75); x.lineTo((w + 2.6) / 2, h * 0.6); x.lineTo(2.6, h * 0.75); x.closePath(); t(x, '#8a1e22'); x.fillStyle = '#ffd34d'; x.beginPath(); x.arc((w + 2.6) / 2, h * 0.3, 2, 0, 7); x.fill(); }],
    estatua: [12, 18, (x, w, h) => { x.beginPath(); x.rect(1, h * 0.75, w - 2, h * 0.25); t(x, '#6e6e78'); x.beginPath(); x.ellipse(w / 2, h * 0.58, w * 0.32, h * 0.18, 0, 0, 7); t(x, '#8a8a94'); x.beginPath(); x.moveTo(w * 0.6, h * 0.5); x.quadraticCurveTo(w * 0.75, h * 0.2, w * 0.6, h * 0.08); x.lineWidth = 3; x.strokeStyle = '#8a8a94'; x.stroke(); x.fillStyle = '#e8a42a'; x.fillRect(w * 0.6, h * 0.06, w * 0.25, 1.6); }],
  };
  for (const n in A) hazSprite('ad-' + n, A[n][0], A[n][1], A[n][2]);
}

// los adornos de cada casilla (siempre los mismos): 2 o 3, pegados a los bordes para no estorbar
const ADORNOS = [];
function preparaAdornosCasillas() {
  ADORNOS.length = 0;
  for (let t = 2; t < CFG.jardin; t++) {
    const B = biomaDe(t), r = azarSemilla(t * 131 + 7), n = 2 + (r() < 0.45 ? 1 : 0), w = anchoDe(t), lista = [];
    for (let i = 0; i < n; i++) {
      const lado = i % 2 ? 1 : -1, nombre = B.adornos[(r() * B.adornos.length) | 0];
      lista.push({ n: 'ad-' + nombre, x: centroX(t) + lado * (w / 2 - 9 - r() * 10), y: -(t - 1) * TH - 12 - r() * (TH - 30), f: r() < 0.5, vela: nombre === 'vela' || nombre === 'antorcha' || nombre === 'farol' });
    }
    ADORNOS[t] = lista;
  }
}
function pintaAdornos(t) {
  const L = ADORNOS[t]; if (!L) return;
  for (const a of L) {
    if (a.y > JUEGO.yD - 4) continue;
    if (a.vela) { G.globalAlpha = 0.22 + Math.sin(JUEGO.t * 9 + a.x) * 0.06; pinta('luz', a.x, a.y - 4, false, false, 0.35); G.globalAlpha = 1; }
    pinta(a.n, a.x, a.y, a.f);
  }
}

// al entrar en una tierra nueva, su nombre
function vigilaBioma() {
  const J = JUEGO, i = indiceBioma(J.casilla);
  if (J.bioma === undefined || i <= J.bioma) { if (J.bioma === undefined) J.bioma = i; return; }
  J.bioma = i;
  if (!J.avisos.length) { aviso(tr(BIOMAS[i].nombre), BIOMAS[i].niebla, 2); aviso2(tr('Casilla {n}', { n: BIOMAS[i].desde })); }
  SONIDO.casilla();
}
