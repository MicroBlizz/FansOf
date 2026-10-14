// Fans of Rumble: Tácticas · MAQUETA (mundos 1): la Sede de Microblizz (el despacho del CEO al atardecer) y las Oficinas de Microblizz
// (de noche, con fluorescentes y pantallas). Cada mundo dice cómo se pinta en píxeles y qué luces, rayos y polvo lleva encima.
'use strict';
const MUNDOS_MAQUETA = {};
const PAL = {
  madera: rampa('#14060f', '#22091a', '#331226', '#461a34', '#5e2644', '#7a3656'),
  oro: rampa('#3a2410', '#6a4818', '#a07028', '#d6a03a', '#ffd36a', '#fff0b0'),
  marmolA: rampa('#140a1c', '#21132c', '#2f1d3c', '#47304f', '#6e4c62', '#a87868', '#e0a878'),
  marmolB: rampa('#10071a', '#1a0f25', '#261833', '#3c2846', '#5f4058', '#946a60', '#c99470'),
  junta: rampa('#24160a', '#3a2610', '#5e4218', '#8a6424', '#c0902e', '#ecc060'),
  alfombra: rampa('#1e060c', '#3a0a14', '#5e1420', '#8a222c', '#b8363a', '#e2604a', '#ff9a6a'),
  sillon: rampa('#2a0610', '#4a0c18', '#6e1a24', '#962a30', '#c4443c', '#ec7a52'),
  hojas: rampa('#0e2a16', '#1a4424', '#2a6a34', '#4a9a44', '#7cc85a'),
  pared: rampa('#141626', '#1d2034', '#272c46', '#343a5a', '#454d72', '#5d6890'),
  acero: rampa('#1a1c28', '#2a2e40', '#3e4460', '#5a6284', '#8892b4', '#c4ccec'),
  moqueta: rampa('#0c0e1a', '#141828', '#1c2238', '#283048', '#38425e', '#4e5a7a', '#6e7c9e'),
  pantalla: rampa('#06202c', '#0a3a4e', '#126278', '#1e94b0', '#5ad0e8', '#c4f6ff'),
};
const VENTANAS_SEDE = [{ x: 10, w: 82 }, { x: 178, w: 82 }];
const VEN_Y = 24, VEN_H = 126;

/* =========================================================
   SEDE DE MICROBLIZZ · el despacho del CEO, planta 99, al atardecer
   ========================================================= */
const SOL_INC = 0.45;   // el sol entra bajo por detrás y a la izquierda: la luz avanza hacia la cámara y hacia la derecha
function luzSede(u, v, s) {
  let l = 0.22;
  for (const w of VENTANAS_SEDE) {
    const ua = uDe(w.x), ub = uDe(w.x + w.w), um = (ua + ub) / 2, inc = s * SOL_INC, abre = s * 0.03, fuerza = w.x < PCX ? 0.66 : 0.4;
    if (s > 0.3 && u > ua + inc - abre && u < ub + inc + abre) {
      let f = Math.exp(-(s - 0.3) / 13) * fuerza;
      if (Math.abs(u - (um + inc)) < 0.16 + s * 0.008) f *= 0.22;            // sombra del parteluz
      if (Math.abs(s - 4.6) < 0.3 || Math.abs(s - 8.8) < 0.34) f *= 0.3;     // sombras del travesaño
      l += f;
    }
    if (s < 3.2 && u > ua && u < ub && Math.abs(u - um) > 0.12) l += 0.3 * Math.pow(1 - s / 3.2, 1.6);   // reflejo del ventanal
  }
  l += 0.22 * Math.exp(-((u + 0.8) ** 2 + ((v - 50.8) * 1.4) ** 2) / 1.6);   // la lámpara de la mesa
  if (s < 0.9) l *= 0.45 + 0.6 * s;
  return l;
}
function pintaSede() {
  const p = new Pincel(PW, PH), R = PAL;
  // pared de madera, techo con focos, moldura y rodapié
  for (let y = 0; y < PARED_Y; y++) for (let x = 0; x < PW; x++) {
    let l = 0.34 + 0.12 * Math.sin((y / PARED_Y) * Math.PI);
    const k = (x + 7) % 22; if (k === 0) l = 0.08; else if (k === 1) l = 0.62; else if (k === 2) l += 0.08;
    p.px(x, y, tono(R.madera, l, x, y));
  }
  p.rect(0, 0, PW, 10, u32De('#0c0412'));
  for (const fx of [24, 80, 135, 190, 246]) { p.rect(fx - 4, 6, 9, 2, u32De('#ffd36a')); p.rect(fx - 2, 6, 5, 2, u32De('#fff6d8')); }
  for (let x = 0; x < PW; x++) { p.px(x, 10, R.oro[4]); p.px(x, 11, R.oro[2]); p.px(x, 12, R.oro[1]); p.px(x, 13, R.oro[0]); }
  p.rect(0, PARED_Y - 6, PW, 6, u32De('#12050d'));
  for (let x = 0; x < PW; x++) { p.px(x, PARED_Y - 7, R.oro[4]); p.px(x, PARED_Y - 6, R.oro[2]); }
  // ventanales al atardecer (el de la izquierda, con el sol)
  for (const w of VENTANAS_SEDE) ventanal(p, { x: w.x, w: w.w, y: VEN_Y, h: VEN_H, cielo: ['#2a1446', '#4a1d5e', '#7a2a6a', '#b33f6a', '#e8644f', '#ff9a4c', '#ffc46a'],
    lejos: '#7a3466', bordeLejos: '#9a4a72', cerca: '#3a1842', bordeCerca: '#2a0f32', luces: ['#ffcf6b', '#ff8a5a'], marco: R.oro,
    sol: w.x < PCX ? [w.x + 30, VEN_Y + VEN_H - 30, 17, ['#fff6d0', '#ffe08a', '#ffc46a', '#ff9a4c']] : null });
  // panel con el emblema dorado de Microblizz
  const x0 = 98, x1 = 172; p.rect(x0, 18, x1 - x0, PARED_Y - 26, u32De('#1a0712'));
  for (let x = x0; x < x1; x++) { p.px(x, 18, R.oro[3]); p.px(x, PARED_Y - 9, R.oro[1]); }
  for (let y = 18; y < PARED_Y - 8; y++) { p.px(x0, y, R.oro[3]); p.px(x1 - 1, y, R.oro[1]); }
  p.elipse(135, 62, 25, 25, u32De('#20102c'));
  p.elipse(135, 62, 24, 24, (x, y, i, j) => Math.hypot(i, j) > 0.88 ? R.oro[1] : tono(R.oro, 0.62 - (i + j) * 0.28, x, y));
  p.texto('M', 136, 65, 30, R.oro[0]); p.texto('M', 135, 64, 30, u32De('#4a1d0c'));
  // suelo de mármol con juntas doradas y la alfombra roja
  pintaSuelo(p, (u, v, X, Y, du, dv, s) => {
    const l = luzSede(u, v, s), au = Math.abs(u);
    if (au < 1.0) {
      if (au > 0.84) return tono(R.oro, l * 1.05 + (au > 0.97 ? -0.15 : 0), X, Y);
      const fu = ((u + 0.5) * 1.2) % 1, fv = (v * 0.9) % 1, rombo = Math.abs(Math.abs(fu) - 0.5) + Math.abs(fv - 0.5) < 0.17;
      return tono(R.alfombra, l + (rombo ? 0.1 : 0) - (au > 0.76 ? 0.08 : 0), X, Y);
    }
    const fu = u - Math.floor(u), fv = v - Math.floor(v);
    if (fu < du * 1.1 || fv < dv * 1.1) return tono(R.junta, l * 0.8, X, Y);
    const par = (Math.floor(u) + Math.floor(v)) & 1, sem = azarFijo(Math.floor(u) + 50, Math.floor(v) + 50);
    const vena = sem > 0.45 && Math.abs(Math.sin((u * 1.7 + v * 1.1 + sem * 6) * Math.PI + Math.sin(v * 2.6 + sem * 9) * 1.2)) < 0.035;
    return tono(par ? R.marmolA : R.marmolB, l + (vena ? 0.12 : 0) + (fv < dv * 3 ? 0.05 : 0), X, Y);
  });
  // el sillón de masaje y la mesa
  const sx0 = 116, sx1 = 154, sy0 = 98, sy1 = 136;
  p.elipse(135, 100, 13, 8, (x, y, i) => tono(R.sillon, 0.45 + Math.abs(i) * 0.25 + (y < 96 ? 0.2 : 0), x, y));
  for (let y = sy0; y < sy1; y++) for (let x = sx0; x < sx1; x++) {
    const bx = Math.min(x - sx0, sx1 - 1 - x), l = 0.32 + (bx < 3 ? 0.32 : bx < 6 ? 0.12 : 0) + (y < sy0 + 3 ? 0.2 : 0);
    p.px(x, y, (x - sx0) % 7 === 3 && (y - sy0) % 7 === 3 ? R.sillon[0] : tono(R.sillon, l, x, y));
  }
  for (let y = sy0; y < sy1; y += 4) { p.px(sx0, y, R.oro[4]); p.px(sx1 - 1, y, R.oro[4]); }
  const mx0 = 96, mx1 = 174;
  for (let x = mx0; x < mx1; x++) for (let y = 128; y < 134; y++) p.px(x, y, tono(R.madera, 0.62 + (y === 128 ? 0.3 : 0) - (y - 128) * 0.04, x, y));
  for (let x = mx0; x < mx1; x++) { p.px(x, 134, R.oro[4]); p.px(x, 135, R.oro[2]); }
  for (let y = 136; y < 178; y++) for (let x = mx0 + 1; x < mx1 - 1; x++) p.px(x, y, tono(R.madera, 0.3 + (x < mx0 + 3 ? 0.18 : 0), x, y));
  for (const [a, b] of [[mx0 + 5, mx0 + 34], [mx1 - 34, mx1 - 5]]) {
    for (let x = a; x < b; x++) { p.px(x, 141, R.madera[0]); p.px(x, 170, R.madera[4]); }
    for (let y = 141; y < 171; y++) { p.px(a, y, R.madera[0]); p.px(b, y, R.madera[4]); }
    p.rect((a + b) / 2 - 3, 152, 7, 2, R.oro[4]); p.px((a + b) / 2 - 3, 153, R.oro[1]);
  }
  p.rect(mx0, 177, mx1 - mx0, 3, R.madera[0]);
  p.rect(104, 125, 9, 3, R.oro[2]); p.rect(107, 117, 2, 8, R.oro[3]);
  p.elipse(108, 116, 7, 4, (x, y, i, j) => tono(R.oro, 0.62 - j * 0.3 - i * 0.1, x, y)); p.rect(101, 117, 15, 1, R.oro[1]);
  p.rect(118, 121, 13, 7, u32De('#efe4d0')); for (let y = 122; y < 128; y += 2) p.rect(118, y, 13, 1, u32De('#bfb09a')); p.rect(127, 122, 3, 2, u32De('#d8323a'));
  p.rect(133, 124, 15, 4, R.oro[3]); p.rect(133, 124, 15, 1, R.oro[5]); p.rect(136, 126, 9, 1, R.oro[0]);
  p.rect(151, 121, 12, 7, u32De('#3f8f46')); p.rect(151, 121, 12, 1, u32De('#7cd07a')); p.rect(155, 121, 3, 7, u32De('#e8e0c0'));
  planta(p, 3, 176, R.hojas, R.oro);
  // caja fuerte con la copa de un juego que ya han cerrado
  for (let y = 140; y < 177; y++) for (let x = 244; x < 267; x++) p.px(x, y, tono(R.oro, 0.38 + (x < 246 ? 0.3 : 0) + (y < 142 ? 0.25 : 0) - (x > 264 ? 0.2 : 0), x, y));
  p.elipse(256, 156, 6, 6, (x, y, i, j) => Math.hypot(i, j) > 0.75 ? R.oro[5] : u32De('#2a1608'));
  p.linea(256, 156, 259, 153, R.oro[5]); p.rect(262, 152, 2, 9, R.oro[5]);
  p.elipse(255, 129, 6, 4, (x, y, i) => tono(R.oro, 0.7 - i * 0.3, x, y)); p.rect(254, 132, 3, 5, R.oro[3]); p.rect(251, 137, 9, 3, R.oro[2]);
  return p.fin();
}
// los haces de sol: salen del ventanal y bajan hasta la mancha de luz del suelo
function rayosSede(x) {
  for (const w of VENTANAS_SEDE) {
    const fuerza = w.x < PCX ? 1 : 0.55;
    for (const [f0, f1, k] of [[0.03, 0.16, 0.8], [0.2, 0.3, 1.25], [0.33, 0.47, 0.75], [0.53, 0.62, 1.3], [0.66, 0.8, 0.85], [0.84, 0.95, 1.1]]) {
      const sd = 15, [a0, yb] = sueloXY(uDe(w.x + w.w * f0) + sd * SOL_INC, V_PARED - sd), [a1] = sueloXY(uDe(w.x + w.w * f1) + sd * SOL_INC + sd * 0.03, V_PARED - sd);
      haz(x, (w.x + w.w * f0) * 2, (w.x + w.w * f1) * 2, VEN_Y * 2 + 10, a0 * 2, a1 * 2, yb * 2, [255, 196, 110], 0.34 * k * fuerza);
    }
  }
}
// un haz de luz: trapecio de arriba (t0..t1, ya) al suelo (a0..a1, yb), que se apaga hacia abajo
function haz(x, t0, t1, ya, a0, a1, yb, [r, g, b], A) {
  const gr = x.createLinearGradient(0, ya, 0, yb);
  gr.addColorStop(0, `rgba(${r},${g},${b},${A * 0.5})`); gr.addColorStop(0.25, `rgba(${r},${g},${b},${A})`); gr.addColorStop(0.62, `rgba(${r},${g},${b},${A * 0.55})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.beginPath(); x.moveTo(t0, ya); x.lineTo(t1, ya); x.lineTo(a1, yb); x.lineTo(a0, yb); x.closePath(); x.fill();
}
// lo que está delante de la cámara: una planta abajo a la izquierda y el borde de una columna a la derecha
function plantaDelante(x, col1, col2) {
  for (let i = 0; i < 9; i++) {
    const a = -1.95 + i * 0.25, len = 120 + azarFijo(i, 11) * 90;
    x.save(); x.translate(-10, 820); x.rotate(a + Math.PI / 2);
    const g = x.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, '#07140b'); g.addColorStop(0.7, col1); g.addColorStop(1, col2);
    x.fillStyle = g; x.beginPath(); x.ellipse(0, -len / 2, 20 + azarFijo(i, 3) * 10, len / 2, 0, 0, Math.PI * 2); x.fill(); x.restore();
  }
}
function columnaDelante(x, filo) {
  const g = x.createLinearGradient(522, 0, 540, 0); g.addColorStop(0, '#2a0d20'); g.addColorStop(0.3, '#10040c'); g.addColorStop(1, '#07020a');
  x.fillStyle = g; x.fillRect(522, 0, 18, 960); x.fillStyle = filo; x.fillRect(523, 0, 2, 960);
}
const bokehDe = (ventanas, cols, n = 18) => Array.from({ length: n }, (_, i) => {
  const w = ventanas[i % ventanas.length];
  return { x: (w.x + 4 + azarFijo(i, 21) * (w.w - 8)) * 2, y: 120 + azarFijo(i, 22) * 170, r: 6 + azarFijo(i, 23) * 11, col: cols[i % cols.length], a: 0.16 + azarFijo(i, 24) * 0.24, f: azarFijo(i, 25) * 6 };
});
MUNDOS_MAQUETA.sede = {
  pinta: pintaSede, rayos: rayosSede,
  delante: x => { plantaDelante(x, '#123a20', '#2c6a34'); columnaDelante(x, 'rgba(255,211,106,.55)'); },
  luces: [{ col: '#ffc46a', x: 80, y: 238, r: 130, a: 0.5 }, { col: '#fff0b0', x: 80, y: 238, r: 44, a: 0.55 }, { col: '#ffcf6b', x: 216, y: 232, r: 48, a: 0.55 },
    { col: '#ffcb3d', x: 270, y: 124, r: 84, a: 0.22 }, ...[48, 160, 270, 380, 492].map(fx => ({ col: '#ffe08a', x: fx, y: 14, r: 34, a: 0.42 }))],
  bokeh: bokehDe(VENTANAS_SEDE, ['#ffcf6b', '#ff9a5a', '#ff7aa8', '#ffe08a']),
  // el polvo flota casi todo en el haz del ventanal del sol, que cruza en diagonal hasta el grupo
  mota: () => { const izq = Math.random() < 0.82, y = rand(80, 640), f = (y - 58) / 590; return [izq ? lerp(20, 272, f) + rand(0, lerp(164, 254, f)) : lerp(356, 744, f) + rand(0, 160), y]; },
  colMota: '#ffd68a', contraluz: '#ffd88a', cdx: -1.6, cdy: -1.5,
  tinte: [[0, 'rgba(90,60,200,.35)'], [0.4, 'rgba(255,170,90,.2)'], [1, 'rgba(255,120,60,.25)']],
};

/* =========================================================
   OFICINAS DE MICROBLIZZ · de noche, fluorescentes, pantallas encendidas y nadie cobrando horas extra
   ========================================================= */
const VENTANAS_OFI = [{ x: 8, w: 76 }, { x: 186, w: 76 }];
const FLUOR = [[-3.2, 52], [0, 52], [3.2, 52], [-3.2, 47], [0, 47], [3.2, 47], [-3.2, 42], [0, 42], [3.2, 42]];   // fluorescentes del techo, en baldosas (u, v)
function luzOficina(u, v, s) {
  let l = 0.2;
  for (const [fu, fv] of FLUOR) l += 0.2 * Math.exp(-(((u - fu) * 0.9) ** 2 + ((v - fv) * 1.1) ** 2) / 1.4);   // charcos de luz bajo cada fluorescente
  if (s < 2.6) for (const mu of [-4.6, -2.6, 2.6, 4.6]) l += 0.32 * Math.exp(-((u - mu) ** 2) / 0.5) * (1 - s / 2.6);   // el resplandor de las pantallas
  if (s < 0.8) l *= 0.5 + 0.6 * s;
  return l;
}
function mesaOficina(p, x0, R) {
  // mesa gris con dos pantallas encendidas (cian) y la silla
  p.rect(x0 + 4, 120, 26, 18, tono(R.pantalla, 0.1, x0, 120)); p.rect(x0 + 5, 121, 24, 16, R.pantalla[0]);
  for (let y = 122; y < 136; y++) for (let x = x0 + 6; x < x0 + 28; x++) p.px(x, y, tono(R.pantalla, 0.55 + (y < 125 ? 0.25 : 0) - (x > x0 + 24 ? 0.15 : 0), x, y));
  for (let k = 0; k < 4; k++) p.rect(x0 + 8, 126 + k * 2, 6 + Math.floor(azarFijo(x0, k) * 12), 1, R.pantalla[5]);
  p.rect(x0 + 15, 138, 4, 6, R.acero[2]); p.rect(x0 + 11, 143, 12, 2, R.acero[3]);
  for (let y = 145; y < 152; y++) for (let x = x0 - 6; x < x0 + 40; x++) p.px(x, y, tono(R.acero, 0.6 - (y - 145) * 0.07 + (y === 145 ? 0.25 : 0), x, y));
  p.rect(x0 - 4, 152, 3, 22, R.acero[1]); p.rect(x0 + 35, 152, 3, 22, R.acero[1]);
  p.elipse(x0 + 17, 162, 9, 7, (x, y, i, j) => tono(R.sillon, 0.15 + (j < -0.3 ? 0.2 : 0) + (i < -0.4 ? 0.12 : 0), x, y));
  p.rect(x0 + 16, 168, 3, 8, R.acero[1]); p.rect(x0 + 10, 175, 15, 2, R.acero[2]);
}
function pintaOficina() {
  const p = new Pincel(PW, PH), R = PAL;
  // pared de paneles grises con luz fría
  for (let y = 0; y < PARED_Y; y++) for (let x = 0; x < PW; x++) {
    let l = 0.42 - (y / PARED_Y) * 0.18; const k = x % 30;
    if (k === 0) l = 0.1; else if (k === 1) l += 0.16; if (y % 46 === 20) l = 0.12;
    p.px(x, y, tono(R.pared, l, x, y));
  }
  p.rect(0, 0, PW, 12, u32De('#0a0b16'));
  for (const fx of [30, 105, 165, 240]) { p.rect(fx - 18, 7, 36, 3, u32De('#dff4ff')); p.rect(fx - 18, 10, 36, 1, u32De('#8ab4d8')); }
  for (const w of VENTANAS_OFI) ventanal(p, { x: w.x, w: w.w, y: 20, h: 96, cielo: ['#05061a', '#0b0f2c', '#141c44', '#1e2a5a', '#2c3c70'], estrellas: true,
    lejos: '#141a3e', bordeLejos: '#22305a', cerca: '#0a0d24', bordeCerca: '#060818', luces: ['#ffd36b', '#7ad8ff'], marco: R.acero });
  // el cartel de la empresa
  p.rect(94, 26, 82, 40, u32De('#20102c')); p.rect(95, 27, 80, 38, u32De('#b8162c')); p.rect(95, 27, 80, 2, u32De('#ff5a6a')); p.rect(95, 63, 80, 2, u32De('#6a0a18'));
  p.texto('MICROBLIZZ', 135, 40, 14, u32De('#fff6ea'));
  p.texto('SEGUIMOS CRECIENDO', 135, 56, 9, u32De('#ffcbd0'));
  // gráfica de beneficios (sube) y reloj
  p.rect(100, 76, 40, 30, u32De('#e8ecf4')); p.rect(100, 76, 40, 1, u32De('#ffffff'));
  for (let i = 0; i < 6; i++) p.rect(104 + i * 6, 102 - (4 + i * i * 0.6), 4, 4 + i * i * 0.6, u32De(i === 5 ? '#d8323a' : '#4a7ad8'));
  p.elipse(158, 90, 11, 11, (x, y, i, j) => Math.hypot(i, j) > 0.8 ? R.acero[1] : u32De('#f4f6fb'));
  p.linea(158, 90, 158, 82, u32De('#20102c')); p.linea(158, 90, 164, 92, u32De('#d8323a'));
  // rodapié
  p.rect(0, PARED_Y - 5, PW, 5, R.acero[0]); p.rect(0, PARED_Y - 6, PW, 1, R.acero[3]);
  // suelo de moqueta a cuadros con las juntas marcadas
  pintaSuelo(p, (u, v, X, Y, du, dv, s) => {
    const l = luzOficina(u, v, s), fu = (u * 0.5) - Math.floor(u * 0.5), fv = (v * 0.5) - Math.floor(v * 0.5);
    if (fu < du * 0.6 || fv < dv * 0.6) return tono(R.moqueta, l - 0.12, X, Y);
    const par = (Math.floor(u * 0.5) + Math.floor(v * 0.5)) & 1;
    return tono(R.moqueta, l + (par ? 0.05 : -0.03) + (azarFijo(X, Y) < 0.08 ? 0.08 : 0), X, Y);
  });
  // mesas con pantallas pegadas a la pared, el dispensador de agua y una planta
  for (const x0 of [10, 52, 186, 226]) mesaOficina(p, x0, R);
  p.rect(126, 132, 18, 42, R.acero[3]); p.rect(126, 132, 2, 42, R.acero[4]); p.rect(129, 150, 4, 3, u32De('#3a6ad8'));
  p.elipse(135, 120, 8, 12, (x, y, i) => tono(PAL.pantalla, 0.55 + (i < -0.3 ? 0.3 : 0), x, y)); p.rect(127, 109, 16, 2, R.acero[4]);
  planta(p, 98, 176, R.hojas, R.acero);
  return p.fin();
}
MUNDOS_MAQUETA.oficina = {
  pinta: pintaOficina,
  rayos: x => {   // conos suaves de luz fría bajo los fluorescentes
    for (const fx of [60, 210, 330, 480]) for (const k of [0, 1]) {
      const [a0, yb] = sueloXY(uDe(fx / 2) * (k ? 1.4 : 1) - 0.9, 46 - k * 4), [a1] = sueloXY(uDe(fx / 2) * (k ? 1.4 : 1) + 0.9, 46 - k * 4);
      haz(x, fx - 34, fx + 34, 22, a0 * 2, a1 * 2, yb * 2, [190, 225, 255], 0.09);
    }
  },
  delante: x => { plantaDelante(x, '#123a2a', '#2c6a50'); columnaDelante(x, 'rgba(160,200,255,.45)'); },
  luces: [...[30, 105, 165, 240].map(fx => ({ col: '#dff4ff', x: fx * 2, y: 18, r: 70, a: 0.4 })),
    ...[20, 62, 196, 236].map(mx => ({ col: '#5ad0e8', x: (mx + 17) * 2, y: 258, r: 44, a: 0.5 })), { col: '#ff4b5c', x: 270, y: 92, r: 90, a: 0.2 }],
  bokeh: bokehDe(VENTANAS_OFI, ['#ffd36b', '#7ad8ff', '#9a8aff', '#ffe08a'], 14),
  mota: () => [rand(0, 540), rand(80, 640)],
  colMota: '#cfe8ff', contraluz: '#d4ecff', cdx: 0, cdy: -1.8,
  tinte: [[0, 'rgba(60,90,200,.35)'], [0.5, 'rgba(120,160,255,.14)'], [1, 'rgba(60,40,140,.25)']],
};
