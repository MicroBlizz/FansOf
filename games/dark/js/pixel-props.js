// Fans of Dark · arte píxel (2 de 2): el decorado de cada mazmorra (lápidas, servidores, cajas…), el arma de cada animal vista en primera
// persona (la pata con su cosa) y los iconos del HUD (dibujados aquí, nada de emojis). Todo con píxeles gordos y contorno oscuro.
'use strict';
const PX_O = '#1a1226';   // el contorno de todo

/* ---------- decorado: {w, h} del dibujo y alto como parte de la pared (1 = hasta el techo) ---------- */
const PX_PROPS = {
  lapida: { w: 16, h: 20, alto: 0.3, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(2, 0, 12, 20); x.fillRect(0, 16, 16, 4); x.fillStyle = '#8c8aa6'; x.fillRect(3, 1, 10, 18); x.fillStyle = '#b4b2cc'; x.fillRect(3, 1, 10, 2); x.fillRect(3, 1, 2, 16); x.fillStyle = '#4e4c66'; x.fillRect(7, 5, 2, 8); x.fillRect(5, 7, 6, 2); x.fillStyle = ac; x.fillRect(1, 17, 5, 2); x.fillStyle = '#5e5c78'; x.fillRect(1, 16, 14, 1); } },
  pilar: { w: 12, h: 48, alto: 1, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 0, 12, 48); x.fillStyle = '#6a6888'; x.fillRect(2, 2, 8, 44); x.fillStyle = '#8c8aa6'; x.fillRect(2, 2, 3, 44); x.fillStyle = '#4e4c66'; x.fillRect(8, 2, 2, 44); x.fillStyle = '#8c8aa6'; x.fillRect(1, 1, 10, 3); x.fillRect(1, 44, 10, 3); x.fillStyle = ac; x.fillRect(4, 20, 4, 2); } },
  foco: { w: 18, h: 44, alto: 0.95, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(7, 10, 4, 34); x.fillRect(2, 40, 14, 4); x.fillRect(1, 0, 16, 12); x.fillStyle = '#3a3a4a'; x.fillRect(8, 11, 2, 30); x.fillRect(3, 41, 12, 2); x.fillStyle = '#5a5a70'; x.fillRect(2, 1, 14, 10); x.fillStyle = ac; x.fillRect(4, 3, 10, 6); x.fillStyle = '#fff'; x.fillRect(6, 4, 4, 2); } },
  pantalla: { w: 24, h: 36, alto: 0.6, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 0, 24, 18); x.fillRect(10, 18, 4, 14); x.fillRect(4, 31, 16, 5); x.fillStyle = '#2a2a3a'; x.fillRect(1, 1, 22, 16); x.fillStyle = ac; x.fillRect(2, 2, 20, 14); x.fillStyle = '#fff'; x.fillRect(4, 4, 6, 2); x.fillRect(4, 8, 12, 1); x.fillRect(4, 11, 8, 1); x.fillStyle = '#3a3a4a'; x.fillRect(11, 19, 2, 12); x.fillRect(5, 32, 14, 3); } },
  columna: { w: 16, h: 48, alto: 1, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(2, 0, 12, 48); x.fillRect(0, 0, 16, 5); x.fillRect(0, 43, 16, 5); x.fillStyle = '#e6dcc0'; x.fillRect(3, 5, 10, 38); x.fillStyle = '#fff6e0'; x.fillRect(3, 5, 2, 38); x.fillRect(8, 5, 2, 38); x.fillStyle = '#b8a888'; x.fillRect(6, 5, 1, 38); x.fillRect(11, 5, 2, 38); x.fillStyle = '#f0e6cc'; x.fillRect(1, 1, 14, 3); x.fillRect(1, 44, 14, 3); x.fillStyle = ac; x.fillRect(5, 2, 6, 1); } },
  pedestal: { w: 16, h: 24, alto: 0.4, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(2, 10, 12, 14); x.fillRect(0, 20, 16, 4); x.fillRect(4, 0, 8, 11); x.fillStyle = '#c8bca0'; x.fillRect(3, 11, 10, 9); x.fillStyle = '#e6dcc0'; x.fillRect(3, 11, 10, 2); x.fillRect(1, 21, 14, 2); x.fillStyle = ac; x.fillRect(5, 1, 6, 6); x.fillRect(7, 7, 2, 3); x.fillStyle = '#fff'; x.fillRect(6, 2, 2, 2); } },
  servidor: { w: 18, h: 48, alto: 0.75, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 0, 18, 48); x.fillStyle = '#2e3244'; x.fillRect(1, 1, 16, 46); x.fillStyle = '#404458'; for (let j = 0; j < 7; j++) x.fillRect(2, 2 + j * 6, 14, 5); x.fillStyle = '#1c1e2a'; for (let j = 0; j < 7; j++) x.fillRect(2, 6 + j * 6, 14, 1); for (let j = 0; j < 7; j++) { x.fillStyle = (j % 3 === 1) ? '#ff5b5b' : ac; x.fillRect(13, 3 + j * 6, 2, 2); } x.fillStyle = '#8c8ca0'; for (let j = 0; j < 7; j++) x.fillRect(3, 3 + j * 6, 6, 1); } },
  tubo: { w: 12, h: 48, alto: 1, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(1, 0, 10, 48); x.fillRect(0, 0, 12, 6); x.fillRect(0, 42, 12, 6); x.fillStyle = '#50546a'; x.fillRect(1, 1, 10, 4); x.fillRect(1, 43, 10, 4); x.fillStyle = ac; x.fillRect(2, 6, 8, 36); x.fillStyle = '#fff'; x.globalAlpha = 0.5; x.fillRect(3, 6, 2, 36); x.globalAlpha = 1; for (let j = 0; j < 5; j++) x.fillRect(4 + (j % 2) * 3, 10 + j * 7, 2, 2); } },
  caja: { w: 20, h: 18, alto: 0.35, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 0, 20, 18); x.fillStyle = '#a87440'; x.fillRect(1, 1, 18, 16); x.fillStyle = '#c8945a'; x.fillRect(1, 1, 18, 2); x.fillRect(1, 1, 2, 16); x.fillStyle = '#7a4a22'; x.fillRect(2, 8, 16, 1); x.fillRect(9, 2, 1, 14); x.fillRect(1, 16, 18, 1); x.fillStyle = ac; x.fillRect(5, 4, 4, 3); } },
  recreativa: { w: 20, h: 44, alto: 0.65, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 0, 20, 44); x.fillStyle = '#3a2a5a'; x.fillRect(1, 1, 18, 42); x.fillStyle = '#5a3a8a'; x.fillRect(1, 1, 18, 6); x.fillStyle = ac; x.fillRect(3, 8, 14, 12); x.fillStyle = '#fff'; x.fillRect(5, 10, 3, 3); x.fillRect(12, 14, 3, 3); x.fillStyle = '#2a1a4a'; x.fillRect(2, 21, 16, 6); x.fillStyle = '#ff5b5b'; x.fillRect(5, 23, 2, 2); x.fillStyle = '#ffd34d'; x.fillRect(9, 23, 2, 2); x.fillRect(13, 23, 2, 2); x.fillStyle = '#5a3a8a'; x.fillRect(2, 28, 16, 14); x.fillStyle = ac; x.fillRect(6, 3, 8, 2); } },
  estanteria: { w: 28, h: 48, alto: 0.8, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 0, 28, 48); x.fillStyle = '#6a4a2a'; x.fillRect(1, 1, 26, 46); x.fillStyle = '#2a1c12'; for (let j = 0; j < 3; j++) x.fillRect(3, 4 + j * 14, 22, 11); x.fillStyle = '#8a6a3a'; for (let j = 0; j < 4; j++) x.fillRect(1, 1 + j * 14, 26, 2); const cols = ['#c8945a', ac, '#9aa0b4', '#c8945a', '#ff5b5b']; let k = 0; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { x.fillStyle = cols[k++ % cols.length]; x.fillRect(4 + i * 7, 7 + j * 14, 6, 8); x.fillStyle = PX_O; x.fillRect(4 + i * 7, 11 + j * 14, 6, 1); } } },
  mesa: { w: 30, h: 20, alto: 0.35, dib: (x, ac) => { x.fillStyle = PX_O; x.fillRect(0, 8, 30, 4); x.fillRect(2, 11, 4, 9); x.fillRect(24, 11, 4, 9); x.fillRect(8, 0, 14, 9); x.fillStyle = '#8a6a3a'; x.fillRect(1, 9, 28, 2); x.fillStyle = '#6a4a2a'; x.fillRect(3, 12, 2, 7); x.fillRect(25, 12, 2, 7); x.fillStyle = '#2a2a3a'; x.fillRect(9, 1, 12, 7); x.fillStyle = ac; x.fillRect(10, 2, 10, 5); x.fillStyle = '#fff'; x.fillRect(11, 3, 4, 1); x.fillStyle = '#c8bca0'; x.fillRect(23, 7, 5, 2); } },
};
function pxProp(tipo, hexAcento) {
  const key = 'prop:' + tipo + hexAcento; if (PX_CACHE[key]) return PX_CACHE[key];
  const P = PX_PROPS[tipo] || PX_PROPS.caja, [c, x] = pxLienzo(P.w, P.h);
  P.dib(x, hexAcento);
  return (PX_CACHE[key] = Object.assign(pxImg(c, x), { alto: P.alto }));
}

/* ---------- el arma de cada animal, vista desde sus ojos: la pata (o la garra, o el guante del mecha) con su cosa ---------- */
const PX_PATAS = {   // color de la pata, de las almohadillas y de la manga
  bunny: ['#f4f1ff', '#f2a7c6', '#e8402a'], squirrel: ['#c8742c', '#f2c6a0', '#5a8a3a'], fox: ['#e8762a', '#f4e6d0', '#2a4a6a'], beaver: ['#7a4a22', '#d9b07a', '#3a6a9a'],
  meercat: ['#d9b07a', '#f4e6d0', '#f4f4f8'], junkcoon: ['#8c8c96', '#2a2a30', '#4a7a3a'], mechavaca: ['#ff8ac8', '#5a3050', '#9a3a7a'],
};
const PX_COSAS = {
  // cada una se dibuja apuntando hacia arriba a la izquierda (la mira); (x) es el lienzo de 72x56
  bunny: x => { const t = (f, p) => { x.beginPath(); p(); x.fillStyle = f; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.stroke(); };
    t('#ff8c2a', () => { x.moveTo(6, 8); x.lineTo(50, 21); x.lineTo(48, 33); x.closePath(); }); x.fillStyle = '#d35f12'; x.beginPath(); x.moveTo(9, 10); x.lineTo(48, 26); x.lineTo(48, 32); x.lineTo(7, 10); x.closePath(); x.fill();
    x.strokeStyle = PX_O; x.lineWidth = 1.2; for (const [ax, ay] of [[16, 11], [25, 14], [34, 17]]) { x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax - 1, ay + 4); x.stroke(); }
    for (const [lx, ly, rx, ry, rot] of [[56, 14, 7, 3, -0.6], [60, 19, 7, 3, -0.1], [54, 22, 6, 2.5, 0.5]]) t('#4fcb5a', () => x.ellipse(lx, ly, rx, ry, rot, 0, Math.PI * 2));
    x.fillStyle = '#fff3a0'; x.fillRect(2, 6, 7, 5); x.fillRect(4, 3, 3, 11); x.fillStyle = '#ffd24a'; x.fillRect(4, 7, 3, 3); },
  squirrel: x => { x.beginPath(); x.moveTo(44, 30); x.lineTo(14, 12); x.lineWidth = 7; x.strokeStyle = PX_O; x.stroke(); x.lineWidth = 3; x.strokeStyle = '#8a5a30'; x.stroke();   // una bellota gigante en un palo
    x.beginPath(); x.ellipse(13, 12, 11, 10, -0.3, 0, Math.PI * 2); x.fillStyle = '#b8742c'; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.stroke();
    x.beginPath(); x.ellipse(11, 6, 12, 5, -0.3, 0, Math.PI * 2); x.fillStyle = '#6a3a12'; x.fill(); x.stroke(); x.fillStyle = '#e8a060'; x.fillRect(8, 11, 4, 3); x.fillStyle = PX_O; for (const [px, py] of [[4, 10], [20, 14], [12, 20]]) x.fillRect(px, py, 2, 2); },
  fox: x => { x.beginPath(); x.moveTo(4, 2); x.lineTo(38, 24); x.lineTo(42, 32); x.lineTo(30, 28); x.closePath(); x.fillStyle = '#d9dbe8'; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.stroke();   // una daga fina
    x.fillStyle = '#9aa0b4'; x.beginPath(); x.moveTo(6, 4); x.lineTo(36, 26); x.lineTo(34, 28); x.closePath(); x.fill(); x.fillStyle = '#ffd34d'; x.fillRect(36, 24, 10, 6); x.fillStyle = PX_O; x.fillRect(36, 30, 10, 1); x.fillStyle = '#fff'; x.fillRect(5, 3, 3, 2); },
  beaver: x => { x.beginPath(); x.rect(8, 6, 44, 12); x.fillStyle = '#b8864a'; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.stroke(); x.fillStyle = '#8a5a30'; x.fillRect(10, 14, 40, 3); x.fillStyle = '#d8a86a'; x.fillRect(10, 8, 40, 2);   // un tablón mordido
    x.fillStyle = PX_O; for (const [px, py] of [[12, 8], [20, 16], [30, 7], [40, 16]]) { x.fillRect(px, py, 3, 3); } x.fillStyle = '#ff4d4d'; x.fillRect(40, 2, 6, 10); x.fillStyle = PX_O; x.fillRect(42, 0, 2, 3); x.fillStyle = '#ffd24a'; x.fillRect(42, 1, 2, 1); },
  meercat: x => { x.beginPath(); x.moveTo(46, 30); x.lineTo(10, 8); x.lineWidth = 8; x.strokeStyle = PX_O; x.stroke(); x.lineWidth = 4; x.strokeStyle = '#e8f4ff'; x.stroke();   // una jeringuilla enorme
    x.lineWidth = 2; x.strokeStyle = '#6fdc72'; x.beginPath(); x.moveTo(40, 26); x.lineTo(22, 15); x.stroke(); x.beginPath(); x.moveTo(12, 9); x.lineTo(2, 2); x.lineWidth = 3; x.strokeStyle = PX_O; x.stroke(); x.lineWidth = 1; x.strokeStyle = '#d9dbe8'; x.stroke();
    x.fillStyle = PX_O; x.fillRect(42, 24, 12, 12); x.fillStyle = '#ff5b8a'; x.fillRect(44, 26, 8, 8); x.fillStyle = '#fff'; x.fillRect(46, 28, 4, 1); x.fillRect(47, 27, 2, 3); },
  junkcoon: x => { x.beginPath(); x.ellipse(24, 20, 20, 15, -0.3, 0, Math.PI * 2); x.fillStyle = '#4a7a3a'; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.stroke();   // una bolsa de basura atada
    x.fillStyle = '#6a9a5a'; x.beginPath(); x.ellipse(18, 14, 8, 5, -0.3, 0, Math.PI * 2); x.fill(); x.fillStyle = PX_O; x.fillRect(36, 6, 8, 8); x.fillStyle = '#ffd34d'; x.fillRect(38, 8, 4, 4); x.fillStyle = PX_O; for (const [px, py] of [[10, 22], [28, 30], [34, 18]]) x.fillRect(px, py, 3, 2); x.fillStyle = '#8fe84a'; x.fillRect(6, 6, 3, 3); x.fillRect(14, 2, 2, 2); },
  mechavaca: x => { x.beginPath(); x.rect(6, 10, 40, 16); x.fillStyle = '#ff8ac8'; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.stroke(); x.fillStyle = '#c85a9a'; x.fillRect(8, 20, 36, 4); x.fillStyle = '#ffc2e8'; x.fillRect(8, 12, 36, 2);   // el cañón del mecha
    x.fillStyle = PX_O; x.fillRect(0, 8, 10, 20); x.fillStyle = '#3a3a4a'; x.fillRect(2, 10, 6, 16); x.fillStyle = '#22e3ff'; x.fillRect(3, 14, 4, 8); x.fillStyle = '#fff'; x.fillRect(4, 16, 2, 2); x.fillStyle = PX_O; for (let i = 0; i < 4; i++) x.fillRect(14 + i * 8, 16, 2, 2); },
};
function pxArma(heroe) {
  const key = 'arma:' + heroe; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(72, 56), [pata, alm, manga] = PX_PATAS[heroe] || PX_PATAS.bunny;
  const t = (f, p) => { x.beginPath(); p(); x.fillStyle = f; x.fill(); x.lineWidth = 2; x.strokeStyle = PX_O; x.lineJoin = 'round'; x.stroke(); };
  t(manga, () => x.rect(36, 44, 34, 14)); x.fillStyle = '#ffd24a'; x.globalAlpha = 0.8; x.fillRect(38, 45, 30, 3); x.globalAlpha = 1;   // la manga
  (PX_COSAS[heroe] || PX_COSAS.bunny)(x);   // la cosa que lleva
  // la pata cerrada encima, con los nudillos y las almohadillas
  t(pata, () => x.ellipse(51, 38, 14, 11, 0, 0, Math.PI * 2));
  x.fillStyle = pxCss(pxTono(pxHex(pata), -0.18)); x.beginPath(); x.ellipse(53, 43, 11, 5, 0, 0, Math.PI); x.fill();
  x.strokeStyle = PX_O; x.lineWidth = 1.4; for (const kx of [42, 48, 54]) { x.beginPath(); x.moveTo(kx, 31); x.lineTo(kx, 41); x.stroke(); }
  for (const kx of [40, 46, 52]) t(alm, () => x.ellipse(kx, 29, 3, 2.4, 0, 0, Math.PI * 2));
  t(pata, () => x.ellipse(44, 25, 5, 3.5, -0.4, 0, Math.PI * 2));   // el pulgar
  const img = x.getImageData(0, 0, 72, 56); pxPosteriza(img.data, 8); x.putImageData(img, 0, 0);
  return (PX_CACHE[key] = c);
}

/* ---------- iconos del HUD (16x16, se agrandan con image-rendering: pixelated) ---------- */
const PX_ICONOS = {
  bellota: x => { x.fillStyle = PX_O; x.fillRect(3, 5, 10, 10); x.fillRect(2, 3, 12, 4); x.fillStyle = '#b8742c'; x.fillRect(4, 7, 8, 7); x.fillStyle = '#6a3a12'; x.fillRect(3, 4, 10, 2); x.fillRect(7, 1, 2, 3); x.fillStyle = '#e8a060'; x.fillRect(5, 8, 2, 3); },
  pocion: x => { x.fillStyle = PX_O; x.fillRect(5, 0, 6, 4); x.fillRect(3, 4, 10, 12); x.fillStyle = '#6fdc72'; x.fillRect(4, 8, 8, 7); x.fillStyle = '#c8f0ff'; x.fillRect(4, 5, 8, 3); x.fillStyle = '#2f9a3a'; x.fillRect(4, 13, 8, 2); x.fillStyle = '#d9dbe8'; x.fillRect(6, 1, 4, 2); x.fillStyle = '#fff'; x.fillRect(5, 9, 2, 3); },
  escudo: x => { x.fillStyle = PX_O; x.fillRect(2, 1, 12, 9); x.fillRect(3, 10, 10, 3); x.fillRect(5, 13, 6, 2); x.fillRect(7, 15, 2, 1); x.fillStyle = '#4aa8ff'; x.fillRect(3, 2, 10, 8); x.fillRect(4, 10, 8, 2); x.fillRect(6, 12, 4, 2); x.fillStyle = '#a9d8ff'; x.fillRect(4, 3, 3, 5); x.fillStyle = '#ffd34d'; x.fillRect(7, 5, 2, 5); x.fillRect(6, 6, 4, 2); },
  esquiva: x => { x.fillStyle = PX_O; x.fillRect(4, 3, 10, 10); x.fillStyle = '#9ad7ff'; x.fillRect(5, 4, 8, 8); x.fillStyle = PX_O; x.fillRect(7, 6, 4, 4); x.fillStyle = '#fff'; x.fillRect(1, 5, 2, 1); x.fillRect(0, 8, 3, 1); x.fillRect(1, 11, 2, 1); x.fillStyle = '#9ad7ff'; x.fillRect(8, 7, 2, 2); },
  estrella: x => { x.fillStyle = PX_O; x.fillRect(7, 0, 2, 16); x.fillRect(0, 7, 16, 2); x.fillRect(3, 3, 10, 10); x.fillStyle = '#ffd34d'; x.fillRect(7, 1, 2, 14); x.fillRect(1, 7, 14, 2); x.fillRect(4, 4, 8, 8); x.fillStyle = '#fff'; x.fillRect(6, 6, 2, 2); },
  bolsa: x => { x.fillStyle = PX_O; x.fillRect(2, 3, 12, 13); x.fillRect(5, 0, 6, 4); x.fillStyle = '#8a5a30'; x.fillRect(3, 4, 10, 11); x.fillStyle = '#b8864a'; x.fillRect(3, 4, 10, 3); x.fillRect(6, 1, 4, 2); x.fillStyle = '#ffd34d'; x.fillRect(6, 9, 4, 3); x.fillStyle = PX_O; x.fillRect(7, 10, 2, 1); },
  moneda: x => { x.fillStyle = PX_O; x.fillRect(4, 1, 8, 14); x.fillRect(2, 3, 12, 10); x.fillStyle = '#e8b53a'; x.fillRect(5, 2, 6, 12); x.fillRect(3, 4, 10, 8); x.fillStyle = '#fff3a0'; x.fillRect(5, 3, 2, 6); x.fillStyle = '#a8731a'; x.fillRect(9, 7, 2, 6); x.fillStyle = PX_O; x.fillRect(7, 5, 2, 6); x.fillRect(6, 5, 1, 2); x.fillRect(9, 9, 1, 2); },
  sonido: x => { x.fillStyle = PX_O; x.fillRect(1, 5, 4, 6); x.fillRect(5, 2, 4, 12); x.fillStyle = '#f3eaff'; x.fillRect(2, 6, 3, 4); x.fillRect(5, 3, 3, 10); x.fillStyle = '#ffd34d'; x.fillRect(10, 5, 1, 6); x.fillRect(12, 3, 1, 10); x.fillRect(14, 1, 1, 14); },
  silencio: x => { x.fillStyle = PX_O; x.fillRect(1, 5, 4, 6); x.fillRect(5, 2, 4, 12); x.fillStyle = '#8a8098'; x.fillRect(2, 6, 3, 4); x.fillRect(5, 3, 3, 10); x.fillStyle = '#ff5b5b'; for (let i = 0; i < 5; i++) { x.fillRect(10 + i, 4 + i, 1, 1); x.fillRect(14 - i, 4 + i, 1, 1); } },
  pausa: x => { x.fillStyle = PX_O; x.fillRect(2, 1, 5, 14); x.fillRect(9, 1, 5, 14); x.fillStyle = '#f3eaff'; x.fillRect(3, 2, 3, 12); x.fillRect(10, 2, 3, 12); },
  espada: x => { x.fillStyle = PX_O; x.fillRect(9, 0, 5, 3); for (let i = 0; i < 9; i++) x.fillRect(9 - i, 2 + i, 4, 1); x.fillRect(2, 9, 5, 5); x.fillRect(0, 12, 4, 4); x.fillStyle = '#d9dbe8'; x.fillRect(10, 1, 3, 1); for (let i = 0; i < 8; i++) x.fillRect(10 - i, 2 + i, 2, 1); x.fillStyle = '#ffd34d'; x.fillRect(3, 10, 3, 3); x.fillStyle = '#8a5a30'; x.fillRect(1, 13, 2, 2); },
  armadura: x => { x.fillStyle = PX_O; x.fillRect(1, 2, 14, 12); x.fillRect(3, 14, 10, 2); x.fillStyle = '#9aa0b4'; x.fillRect(2, 3, 12, 10); x.fillRect(4, 13, 8, 2); x.fillStyle = '#d9dbe8'; x.fillRect(3, 4, 3, 4); x.fillStyle = PX_O; x.fillRect(6, 3, 4, 2); x.fillStyle = '#ffd34d'; x.fillRect(7, 7, 2, 4); },
  gema: x => { x.fillStyle = PX_O; x.fillRect(3, 2, 10, 4); x.fillRect(1, 5, 14, 4); x.fillRect(3, 9, 10, 3); x.fillRect(5, 12, 6, 2); x.fillRect(7, 14, 2, 2); x.fillStyle = '#b36bff'; x.fillRect(4, 3, 8, 2); x.fillRect(2, 6, 12, 2); x.fillRect(4, 9, 8, 2); x.fillRect(6, 12, 4, 1); x.fillStyle = '#fff'; x.fillRect(4, 3, 3, 2); x.fillStyle = '#7a3ad0'; x.fillRect(9, 7, 4, 1); x.fillRect(8, 10, 3, 1); },
  cofre: x => { x.fillStyle = PX_O; x.fillRect(1, 3, 14, 12); x.fillStyle = '#9a5a2a'; x.fillRect(2, 8, 12, 6); x.fillStyle = '#c47a3a'; x.fillRect(2, 4, 12, 3); x.fillStyle = '#e8c252'; x.fillRect(2, 7, 12, 1); x.fillRect(4, 4, 1, 10); x.fillRect(11, 4, 1, 10); x.fillStyle = '#fff3a0'; x.fillRect(7, 7, 2, 3); },
  llave: x => { x.fillStyle = PX_O; x.fillRect(1, 1, 8, 8); x.fillRect(7, 5, 8, 4); x.fillRect(12, 8, 2, 3); x.fillRect(9, 8, 2, 3); x.fillStyle = '#ffd34d'; x.fillRect(2, 2, 6, 6); x.fillRect(8, 6, 6, 2); x.fillRect(12, 8, 1, 2); x.fillRect(9, 8, 1, 2); x.fillStyle = PX_O; x.fillRect(4, 4, 2, 2); x.fillStyle = '#fff'; x.fillRect(2, 2, 2, 1); },
  vida: x => { x.fillStyle = PX_O; x.fillRect(3, 7, 10, 9); x.fillRect(1, 2, 4, 5); x.fillRect(6, 0, 4, 5); x.fillRect(11, 2, 4, 5); x.fillStyle = '#ff5b5b'; x.fillRect(4, 8, 8, 7); x.fillRect(2, 3, 2, 3); x.fillRect(7, 1, 2, 3); x.fillRect(12, 3, 2, 3); x.fillStyle = '#ffb0b0'; x.fillRect(5, 9, 2, 2); },   // la huella de una pata
  aguante: x => { x.fillStyle = PX_O; x.fillRect(6, 0, 6, 8); x.fillRect(3, 6, 6, 6); x.fillRect(5, 10, 5, 6); x.fillStyle = '#4aa8ff'; x.fillRect(7, 1, 4, 6); x.fillRect(4, 7, 4, 4); x.fillRect(6, 11, 3, 4); x.fillStyle = '#fff'; x.fillRect(8, 2, 2, 2); },
  niebla: x => { x.fillStyle = PX_O; x.fillRect(1, 7, 14, 7); x.fillRect(4, 3, 6, 5); x.fillRect(9, 5, 5, 3); x.fillStyle = '#8a4fd0'; x.fillRect(2, 8, 12, 5); x.fillRect(5, 4, 4, 4); x.fillRect(10, 6, 3, 2); x.fillStyle = '#c9a6ff'; x.fillRect(3, 9, 4, 1); x.fillRect(6, 5, 2, 1); },
  portal: x => { x.fillStyle = PX_O; x.fillRect(4, 1, 8, 14); x.fillRect(2, 3, 12, 10); x.fillStyle = '#8b3dff'; x.fillRect(5, 2, 6, 12); x.fillRect(3, 4, 10, 8); x.fillStyle = '#c9a6ff'; x.fillRect(5, 3, 2, 10); x.fillStyle = '#f0e4ff'; x.fillRect(7, 7, 2, 2); x.fillStyle = '#5a1fd0'; x.fillRect(9, 5, 3, 6); },
  calavera: x => { x.fillStyle = PX_O; x.fillRect(3, 1, 10, 9); x.fillRect(5, 10, 6, 4); x.fillStyle = '#f1ecdc'; x.fillRect(4, 2, 8, 7); x.fillRect(6, 9, 4, 4); x.fillStyle = PX_O; x.fillRect(5, 4, 2, 3); x.fillRect(9, 4, 2, 3); x.fillRect(7, 11, 1, 2); x.fillRect(9, 11, 1, 2); },
  mapa: x => { x.fillStyle = PX_O; x.fillRect(1, 1, 14, 14); x.fillStyle = '#5a5070'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#2a2440'; x.fillRect(4, 4, 3, 5); x.fillRect(9, 7, 4, 3); x.fillStyle = '#ffd34d'; x.fillRect(7, 10, 2, 2); x.fillStyle = '#3bb5ff'; x.fillRect(11, 3, 2, 2); },
};
function pxIcono(nombre) {
  const key = 'icono:' + nombre; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(16, 16); (PX_ICONOS[nombre] || PX_ICONOS.estrella)(x);
  return (PX_CACHE[key] = c.toDataURL());
}
// <img> con un icono, para meterlo en el HTML
const pxImgHtml = (nombre, clase = 'ico') => `<img class="${clase}" src="${pxIcono(nombre)}" alt="" draggable="false">`;
// el retrato de un personaje a píxel, como data URL (para la pantalla de preparar y el HUD)
function pxRetrato(k, alto = 48) {
  const key = 'retrato:' + k + alto; if (PX_CACHE[key]) return PX_CACHE[key];
  const p = pxPersonaje(k, alto); if (!p) return '';
  const [c, x] = pxLienzo(p.w, p.h); x.putImageData(p.img, 0, 0);
  return (PX_CACHE[key] = c.toDataURL());
}
