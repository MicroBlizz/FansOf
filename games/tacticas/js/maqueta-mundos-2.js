// Fans of Rumble: Tácticas · MAQUETA (mundos 2): el Cementerio de juegos (de noche, luna, verja, niebla y fuegos fatuos) y el Plató
// Abandonado (pantalla gigante, telones y focos de colores). Mismo formato que maqueta-mundos-1.js.
'use strict';
Object.assign(PAL, {
  piedra: rampa('#14121e', '#22202e', '#343246', '#4c4a62', '#6c6a86', '#9694b0'),
  cesped: rampa('#05100c', '#0a1a14', '#10281e', '#18382a', '#244c38', '#36644a'),
  telon: rampa('#1a0408', '#30060e', '#4c0a16', '#6e1220', '#94202c', '#c2363a'),
  escenario: rampa('#04020a', '#0a0614', '#120a20', '#1c1230', '#2a1c44', '#3e2c5e', '#5a4282'),
  led: rampa('#060a1e', '#0c1636', '#14245a', '#203a82', '#3a5cb4', '#7a9ae8'),
});

/* =========================================================
   CEMENTERIO DE JUEGOS · donde Microblizz entierra los juegos que cierra
   ========================================================= */
const TUMBAS_SUELO = [[12, 214, 0.8], [258, 206, 0.8], [262, 300, 1], [8, 336, 1.1], [20, 268, 0.9], [250, 380, 1.2]];
function lapida(p, x, base, esc, R) {   // lápida de piedra con la cruz o la «R.I.P.» rayada y musgo
  const w = Math.round(9 * esc), h = Math.round(14 * esc);
  p.poli([x - w, base, x - w, base - h + w, x - w * 0.7, base - h, x + w * 0.7, base - h, x + w, base - h + w, x + w, base], (X, Y) => tono(R.piedra, 0.5 + (X < x - w * 0.4 ? 0.22 : 0) - (X > x + w * 0.6 ? 0.2 : 0) - (Y - base + h) * 0.008, X, Y));
  p.rect(x - 1, base - h + 3 * esc, 2, 6 * esc, R.piedra[1]); p.rect(x - 3 * esc, base - h + 5 * esc, 6 * esc, 2, R.piedra[1]);
  p.rect(x - w, base - 2, w * 2, 2, R.cesped[3]);
}
function pintaCementerio() {
  const p = new Pincel(PW, PH), R = PAL;
  p.degradado(0, 0, PW, PARED_Y, ['#07041a', '#0e0828', '#170e38', '#221448', '#301c58', '#3e2662', '#4a3068']);
  for (let i = 0; i < 90; i++) { const x = Math.floor(azarFijo(i, 1) * PW), y = Math.floor(azarFijo(1, i) * 110); p.px(x, y, azarFijo(i, 3) < 0.25 ? u32De('#ffffff') : u32De('#a89ae8')); }
  // la luna, con cráteres, y nubes finas que la cruzan
  p.elipse(212, 44, 21, 21, (x, y, i, j) => { const d = Math.hypot(i, j); if (d > 0.92) return u32De('#c8e8e0'); return tono(rampa('#8ab0b0', '#b8dcd4', '#e0f4ec', '#f8fff8'), 0.85 - (i + j) * 0.25, x, y); });
  for (const [cx, cy, r] of [[205, 38, 4], [219, 50, 3], [214, 33, 2], [203, 51, 2]]) p.elipse(cx, cy, r, r, u32De('#a8ccc4'));
  for (const [y, x0, x1] of [[48, 170, 250], [53, 186, 262], [60, 150, 228]]) for (let x = x0; x < x1; x++) if (trama(x, y) < 0.7) p.px(x, y, u32De('#3e2c62'));
  // colinas lejanas (dos capas) y árboles secos
  for (let x = 0; x < PW; x++) {
    const h1 = 112 + Math.sin(x * 0.03) * 10 + Math.sin(x * 0.11) * 4, h2 = 130 + Math.sin(x * 0.045 + 2) * 9 + Math.sin(x * 0.13) * 3;
    for (let y = Math.round(h1); y < PARED_Y; y++) p.px(x, y, u32De('#1c1236'));
    for (let y = Math.round(h2); y < PARED_Y; y++) p.px(x, y, u32De('#120a24'));
  }
  const rama = (x, y, a, l, n) => { if (n <= 0 || l < 2) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; p.linea(x, y, x2, y2, u32De('#08040e')); if (n > 2) p.linea(x + 1, y, x2 + 1, y2, u32De('#08040e')); rama(x2, y2, a - 0.45, l * 0.7, n - 1); rama(x2, y2, a + 0.4, l * 0.66, n - 1); };
  rama(26, 150, -1.6, 22, 5); rama(246, 148, -1.5, 20, 5);
  // el mausoleo: frontón, columnas y la puerta con brillo verde
  const m0 = 106, m1 = 164;
  p.poli([m0 - 4, 96, 135, 74, m1 + 4, 96], (x, y) => tono(R.piedra, 0.55 + (x < 135 ? 0.12 : -0.06), x, y));
  p.texto('GAME OVER', 135, 90, 7, R.piedra[1]);
  for (let y = 96; y < 172; y++) for (let x = m0; x < m1; x++) p.px(x, y, tono(R.piedra, 0.4 + (x < m0 + 3 ? 0.2 : 0) - (x > m1 - 4 ? 0.15 : 0) + ((y - 96) % 12 === 0 ? -0.15 : 0), x, y));
  for (const cx of [m0 + 5, m1 - 9]) for (let y = 100; y < 168; y++) for (let x = cx; x < cx + 5; x++) p.px(x, y, tono(R.piedra, 0.62 - (x - cx) * 0.09, x, y));
  for (let y = 116; y < 170; y++) for (let x = 124; x < 146; x++) { const arco = y < 126 && Math.hypot(x - 135, y - 126) > 11; if (!arco) p.px(x, y, tono(rampa('#04140e', '#0a2a1e', '#145a3e', '#2a9a6a', '#5ef2c0'), 0.15 + (170 - y) * 0.004 + (Math.abs(x - 135) < 4 ? 0.12 : 0), x, y)); }
  // la verja de hierro con puntas (abierta en el centro)
  for (let x = 0; x < PW; x++) { if (x > 116 && x < 154) continue; p.px(x, 152, u32De('#0a0612')); p.px(x, 166, u32De('#0a0612')); p.px(x, 151, u32De('#3a3050')); }
  for (let x = 2; x < PW; x += 6) { if (x > 114 && x < 156) continue; p.rect(x, 142, 2, 30, u32De('#0a0612')); p.px(x, 142, u32De('#4a4066')); p.px(x, 140, u32De('#0a0612')); p.px(x + 1, 141, u32De('#0a0612')); }
  for (const x of [114, 154]) { p.rect(x - 2, 134, 6, 38, R.piedra[2]); p.rect(x - 2, 134, 2, 38, R.piedra[4]); p.rect(x - 3, 132, 8, 3, R.piedra[3]); }
  // el suelo: césped oscuro y el camino de losas hasta el mausoleo; la luz de la luna viene de arriba a la derecha
  pintaSuelo(p, (u, v, X, Y, du, dv, s) => {
    let l = 0.24 + 0.32 * Math.exp(-((u - 1.5 - s * 0.3) ** 2) / 9) * Math.exp(-s / 16);
    if (s < 7 && ((u - s * 0.42) * 2.1 - Math.floor((u - s * 0.42) * 2.1)) < 0.18) l -= 0.1;   // sombras de los barrotes de la verja
    if (s < 0.8) l *= 0.5 + 0.6 * s;
    if (Math.abs(u) < 1.15) {
      const fu = (u + 0.37 * Math.floor(v * 1.4)) * 1.6, fv = v * 1.4;
      if ((fu - Math.floor(fu)) < du * 2.2 || (fv - Math.floor(fv)) < dv * 2.6) return tono(R.cesped, l + 0.05, X, Y);
      return tono(R.piedra, l + azarFijo(Math.floor(fu), Math.floor(fv)) * 0.12 - 0.02, X, Y);
    }
    const mata = azarFijo(X, Y) < 0.12 ? 0.14 : azarFijo(Y, X) < 0.06 ? -0.12 : 0;
    return tono(R.cesped, l + mata, X, Y);
  });
  for (const x of [20, 46, 72, 198, 224, 250]) lapida(p, x, 182 + (x % 3), 1, R);
  for (const [x, y, e] of TUMBAS_SUELO) lapida(p, x, y, e, R);
  for (const [x, y] of [[30, 183], [240, 184], [16, 268]]) { p.rect(x, y - 6, 2, 5, u32De('#efe4d0')); p.px(x, y - 8, u32De('#ffd36a')); p.px(x, y - 7, u32De('#ff9a3c')); }
  return p.fin();
}
MUNDOS_MAQUETA.cementerio = {
  pinta: pintaCementerio,
  rayos: x => { for (const [t0, t1, a0, a1, k] of [[420, 470, 190, 260, 1], [480, 520, 300, 370, 0.8], [360, 400, 90, 150, 0.6]]) haz(x, t0, t1, 60, a0, a1, 660, [170, 240, 230], 0.12 * k); },
  delante: x => {   // bancos de niebla a ras de suelo, matas y una lápida desenfocada
    for (const [cx, cy, rx, ry, a] of [[120, 640, 260, 34, 0.22], [430, 610, 240, 28, 0.18], [270, 700, 320, 40, 0.24], [60, 520, 180, 20, 0.12]]) {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rx); g.addColorStop(0, `rgba(190,230,230,${a})`); g.addColorStop(1, 'rgba(190,230,230,0)');
      x.save(); x.translate(cx, cy); x.scale(1, ry / rx); x.translate(-cx, -cy); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rx, 0, Math.PI * 2); x.fill(); x.restore();
    }
    x.fillStyle = '#0a0812'; x.beginPath(); x.moveTo(470, 960); x.lineTo(470, 760); x.quadraticCurveTo(505, 720, 540, 760); x.lineTo(540, 960); x.fill();
    plantaDelante(x, '#0e2a1e', '#1c4a34');
  },
  luces: [{ col: '#c8fff0', x: 424, y: 88, r: 120, a: 0.35 }, { col: '#ffffff', x: 424, y: 88, r: 50, a: 0.35 }, { col: '#5ef2c0', x: 270, y: 290, r: 70, a: 0.4 },
    ...[[30, 183], [240, 184], [16, 268]].map(([cx, cy]) => ({ col: '#ffb347', x: cx * 2 + 2, y: cy * 2 - 14, r: 22, a: 0.6 }))],
  bokeh: Array.from({ length: 12 }, (_, i) => ({ x: azarFijo(i, 31) * 540, y: 40 + azarFijo(i, 32) * 200, r: 3 + azarFijo(i, 33) * 6, col: i % 3 ? '#c8d4ff' : '#5ef2c0', a: 0.2 + azarFijo(i, 34) * 0.3, f: azarFijo(i, 35) * 6 })),
  mota: () => [rand(0, 540), rand(300, 680)],
  colMota: '#5ef2c0', motaGrande: true, contraluz: '#b8fff0', cdx: 1.6, cdy: -1.4,
  tinte: [[0, 'rgba(80,60,200,.35)'], [0.5, 'rgba(60,200,180,.12)'], [1, 'rgba(40,20,90,.3)']],
};

/* =========================================================
   PLATÓ ABANDONADO · Microblizz compró el canal, echó al público y ahora solo pone anuncios
   ========================================================= */
const FOCOS = [[42, '#a855f7', -3.4, 44], [96, '#22e3ff', -1.2, 48], [174, '#ff3df0', 1.4, 45], [228, '#ffcb3d', 3.4, 50]];   // x del foco, color, y adónde apunta (u, v)
function pintaPlato() {
  const p = new Pincel(PW, PH), R = PAL;
  p.degradado(0, 0, PW, PARED_Y, ['#06030c', '#0a0614', '#100a1e', '#160e28']);
  for (let x = 0; x < PW; x += 18) p.rect(x, 0, 1, PARED_Y, u32De('#1e1430'));
  // telones rojos con pliegues a los lados
  for (const [a, b] of [[0, 44], [226, 270]]) for (let y = 0; y < PARED_Y; y++) for (let x = a; x < b; x++) {
    const f = Math.sin((x - a) * 0.7 + (a ? 1 : 0)) * 0.5 + 0.5, borde = a ? x - a : b - 1 - x;
    p.px(x, y, tono(R.telon, 0.25 + f * 0.45 - y * 0.0012 - (borde < 3 ? 0.2 : 0), x, y));
  }
  // la pantalla gigante: «EN DIRECTO · 0 ESPECTADORES» y un anuncio
  p.rect(60, 26, 150, 96, u32De('#020104'));
  for (let y = 30; y < 118; y++) for (let x = 64; x < 206; x++) p.px(x, y, (y % 2) ? tono(R.led, 0.25 + (y - 30) * 0.004 + (x < 90 ? 0.05 : 0), x, y) : R.led[0]);
  p.elipse(84, 46, 4, 4, u32De('#ff3b4c')); p.texto('EN DIRECTO', 146, 47, 13, u32De('#ffffff'));
  p.texto('0 ESPECTADORES', 135, 70, 10, u32De('#9ab8ff'));
  p.rect(78, 84, 114, 26, u32De('#ffcb3d')); p.rect(78, 84, 114, 2, u32De('#fff0b0'));
  p.texto('COMPRA GEMAS', 135, 98, 11, u32De('#3a1a00'));
  // la estructura de focos (truss) y los focos colgados
  for (let x = 0; x < PW; x++) { p.px(x, 4, R.acero[3]); p.px(x, 12, R.acero[2]); if (x % 6 < 1) p.linea(x, 4, x + 6, 12, R.acero[1]); }
  for (const [fx, col] of FOCOS) { p.rect(fx - 5, 13, 10, 9, R.acero[1]); p.rect(fx - 5, 13, 2, 9, R.acero[3]); p.rect(fx - 4, 21, 8, 2, u32De(col)); p.rect(fx - 2, 21, 4, 1, u32De('#ffffff')); }
  // borde del escenario con tira de luz
  p.rect(0, PARED_Y - 8, PW, 8, u32De('#0a0612')); for (let x = 0; x < PW; x += 3) p.px(x, PARED_Y - 4, u32De(x % 9 === 0 ? '#c08bff' : '#6a3aa8'));
  // suelo negro brillante con la rejilla de neón y el reflejo de la pantalla
  pintaSuelo(p, (u, v, X, Y, du, dv, s) => {
    let l = 0.2;
    if (s < 5 && Math.abs(u + 0.15) < 3.1) l += 0.28 * (1 - s / 5) * (Y % 2 ? 1 : 0.7);
    for (const [, , fu, fv] of FOCOS) l += 0.2 * Math.exp(-((u - fu) ** 2 + ((v - fv) * 1.3) ** 2) / 1.5);
    const gu = (u / 1.5) - Math.floor(u / 1.5), gv = (v / 1.5) - Math.floor(v / 1.5);
    if (gu < du * 0.9 || gv < dv * 0.9) return tono(rampa('#1a0a30', '#3a1a66', '#6a2ab0', '#a855f7', '#d6a6ff'), l + 0.2, X, Y);
    return tono(R.escenario, l, X, Y);
  });
  // cajas de material, un micro con pie y un cartel de «APLAUSOS» apagado
  for (const [x0, w, h] of [[8, 26, 18], [14, 18, 12], [236, 28, 20]]) { const y0 = 186 - h - (w < 20 ? 18 : 0); for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) p.px(x, y, tono(R.acero, 0.25 + (y === y0 ? 0.3 : 0) + (x === x0 ? 0.15 : 0), x, y)); p.rect(x0 + 3, y0 + h / 2, w - 6, 1, R.acero[4]); }
  p.linea(204, 186, 204, 150, R.acero[3]); p.elipse(204, 148, 3, 4, R.acero[4]); p.linea(198, 186, 210, 186, R.acero[2]);
  p.rect(98, 132, 74, 14, u32De('#1a0a14')); p.texto('APLAUSOS', 135, 139, 9, u32De('#5a2a3a'));
  return p.fin();
}
MUNDOS_MAQUETA.plato = {
  pinta: pintaPlato,
  rayos: x => {   // conos de los focos hasta su charco de luz en el suelo (con el charco de color)
    for (const [fx, col, fu, fv] of FOCOS) {
      const [cxp, cyp] = sueloXY(fu, fv), rgb = rgbDe(col);
      haz(x, fx * 2 - 8, fx * 2 + 8, 46, cxp * 2 - 70, cxp * 2 + 70, cyp * 2 + 10, rgb, 0.2);
      const g = x.createRadialGradient(cxp * 2, cyp * 2, 0, cxp * 2, cyp * 2, 80); g.addColorStop(0, `rgba(${rgb.join(',')},.35)`); g.addColorStop(1, `rgba(${rgb.join(',')},0)`);
      x.save(); x.translate(cxp * 2, cyp * 2); x.scale(1, 0.4); x.translate(-cxp * 2, -cyp * 2); x.fillStyle = g; x.beginPath(); x.arc(cxp * 2, cyp * 2, 80, 0, Math.PI * 2); x.fill(); x.restore();
    }
  },
  delante: x => {   // una cámara de televisión desenfocada abajo a la izquierda y el cable
    x.fillStyle = '#06040a'; x.beginPath(); rrPath(x, -40, 600, 150, 90, 14); x.fill(); x.fillRect(80, 620, 70, 40);
    x.fillRect(20, 690, 14, 270); x.beginPath(); x.moveTo(-30, 960); x.lineTo(27, 760); x.lineTo(90, 960); x.fill();
    x.strokeStyle = '#06040a'; x.lineWidth = 10; x.beginPath(); x.moveTo(0, 900); x.bezierCurveTo(200, 860, 300, 940, 540, 900); x.stroke();
    x.fillStyle = '#ff3b4c'; x.beginPath(); x.arc(60, 625, 6, 0, Math.PI * 2); x.fill();
    columnaDelante(x, 'rgba(192,139,255,.5)');
  },
  luces: [...FOCOS.map(([fx, col]) => ({ col, x: fx * 2, y: 44, r: 46, a: 0.7 })), { col: '#5a7aff', x: 270, y: 150, r: 170, a: 0.25 }, { col: '#ff3b4c', x: 168, y: 92, r: 18, a: 0.8 }],
  bokeh: Array.from({ length: 16 }, (_, i) => ({ x: azarFijo(i, 41) * 540, y: 30 + azarFijo(i, 42) * 280, r: 6 + azarFijo(i, 43) * 12, col: FOCOS[i % 4][1], a: 0.12 + azarFijo(i, 44) * 0.2, f: azarFijo(i, 45) * 6 })),
  mota: () => [rand(0, 540), rand(80, 640)],
  colMota: ['#c08bff', '#22e3ff', '#ff7af0', '#ffe08a'], contraluz: '#e8c0ff', cdx: 0, cdy: -1.8,
  tinte: [[0, 'rgba(120,60,220,.35)'], [0.5, 'rgba(200,80,255,.12)'], [1, 'rgba(40,20,120,.3)']],
};
