// Fans of Roguelite (prototipo) · CrazyBunny y MadSquirrel en pixel art: cada pose se dibuja pieza a pieza (capa, cuerpo, orejas,
// corona, ojo en espiral, zanahoria). Mismos colores que su dibujo del juego (core/js/serie/arte/animales.js), con sombras lilas.
'use strict';

const SPR = {};   // todos los fotogramas del juego, por personaje y animación

const PAL_H = {
  pelo:  pal('#f7f3ff', '#c3b0e6', '#ffffff', '#7a5cb0'),
  peloF: pal('#d9cff0', '#a893d4', '#ece6fb', '#6a4f9e'),   // lo que queda detrás (más oscuro: da profundidad)
  rosa:  pal('#ffc2dc', '#f08cb8', '#ffe4f0', '#b8507e'),
  capa:  pal('#ff7a1a', '#d9431e', '#ffb347', '#8f2410'),
  zana:  pal('#ff8a1f', '#d9531a', '#ffc266', '#8a3010'),
  hoja:  pal('#5cc23a', '#2f8a3a', '#a8ec5c', '#1d5a26'),
  oro:   pal('#ffcb3d', '#e0821f', '#fff3a0', '#8a4a10'),
  ojo:   pal('#ffffff', '#d8d0f0', '#ffffff', '#3a2050'),
};
const BOCA = '#5a1530', LENGUA = '#ff7aa8', ESPIRAL = '#8a2bff';

// CrazyBunny de lado (perfil, mirando a la derecha): se ve un ojo, el de la espiral, con el hocico delante, la cola de algodón
// detrás y la pata larga de conejo. La oreja larga va hacia atrás y la doblada (la del otro lado) asoma por detrás.
// el ojo normal, el del otro lado: asoma un poco junto al hocico porque el conejo está girado un poquito hacia ti
function ojoLejos(p, o, ex, ey, cabeza) {
  if (o.ojo === 'x') { for (let d = -1; d <= 1; d++) { p.px(ex + d * 0.6, ey + d, OL); p.px(ex + d * 0.6, ey - d, OL); } return; }
  if (o.ojo === 'feliz') { p.px(ex - 0.5, ey, OL); p.px(ex + 0.5, ey - 0.5, OL); p.px(ex + 1.3, ey, OL); return; }
  p.parte(F.y(F.ov(ex, ey, 2.3, 3.3), cabeza), PAL_H.ojo, { sombra: 0, luz: false });
  p.plano(F.y(F.re(ex + 0.4, ey - 1.5, 1.4, o.ojo === 'furia' ? 2 : 2.8), cabeza), OL);
  if (o.ojo === 'furia') for (let i = -1; i <= 1; i++) p.px(ex + i, ey - 3.6 + i * 0.4, OL);
}
function ojoConejo(p, o, ex, ey) {
  if (o.ojo === 'x') { for (let d = -1.5; d <= 1.5; d++) { p.px(ex + d, ey + d, OL); p.px(ex + d, ey - d, OL); } return; }
  if (o.ojo === 'feliz') { p.px(ex - 1.5, ey + 0.5, OL); p.px(ex - 0.5, ey - 0.5, OL); p.px(ex + 0.5, ey - 0.5, OL); p.px(ex + 1.5, ey + 0.5, OL); return; }
  p.parte(F.ov(ex, ey, 3.3, 3.8), PAL_H.ojo, { sombra: 1, luz: false });
  for (let a = 0; a < 2.6 * Math.PI; a += 0.5) { const r = 0.2 + a * 0.36; p.px(ex + Math.cos(a + o.esp) * r, ey + Math.sin(a + o.esp) * r, ESPIRAL); }
  if (o.ojo === 'furia') for (let i = -2; i <= 2; i++) p.px(ex + i, ey - 4.4 + i * 0.4, OL);
}
// la boca, debajo del hocico, con los dos dientes de delante
function bocaConejo(p, o, mx, my) {
  if (o.boca === 'ay') { for (let i = 0; i < 5; i++) p.px(mx - 2 + i, my + (i % 2 ? -0.5 : 0.5), BOCA); return; }
  if (o.boca === 'grito') {
    p.plano(F.ov(mx, my + 0.5, 2.6, 2.9), BOCA);
    p.px(mx + 0.6, my - 1.6, '#ffffff'); p.px(mx + 1.6, my - 1.6, '#ffffff');
    p.plano(F.ov(mx - 0.4, my + 2, 1.5, 0.9), LENGUA);
    return;
  }
  const g = o.boca === 'feliz';
  p.plano(F.menos(F.ov(mx, my, g ? 3.4 : 3, g ? 3 : 2.4), F.re(-60, -80, 120, 80 + my)), BOCA);
  p.px(mx + 0.4, my + 0.4, '#ffffff'); p.px(mx + 1.4, my + 0.4, '#ffffff');
  p.plano(F.ov(mx - 0.6, my + (g ? 2 : 1.6), 1.4, 0.8), LENGUA);
}

// la zanahoria desde la mano (zx, zy), apuntando al ángulo za (0 = hacia delante, negativo = hacia arriba)
function zanahoria(p, o) {
  const a = o.za, dx = Math.cos(a), dy = Math.sin(a);
  const bx = o.zx - dx * 4, by = o.zy - dy * 4, tx = o.zx + dx * 12, ty = o.zy + dy * 12;
  for (const s of [-0.6, 0.6]) { const al = a + Math.PI + s; p.parte(F.ov(bx + Math.cos(al) * 3, by + Math.sin(al) * 3, 3.2, 1.5, al), PAL_H.hoja, { sombra: 1 }); }
  p.parte(F.tr(bx, by, tx, ty, 3.3, 0.8), PAL_H.zana, { sombra: 1 });
  for (const t of [0.32, 0.58]) { const cx = bx + (tx - bx) * t, cy = by + (ty - by) * t; p.px(cx + dy * 1.4, cy - dx * 1.4, PAL_H.zana.s); p.px(cx + dy * 0.4, cy - dx * 0.4, PAL_H.zana.s); }
}
const manoZanahoria = (p, o) => { zanahoria(p, o); p.parte(F.ov(o.zx, o.zy, 2.8, 2.6), PAL_H.pelo, { sombra: 1 }); };

function conejo(p, o) {
  const P = PAL_H, hx = o.hx, hy = o.hy;
  // la oreja del otro lado (la doblada), detrás de todo
  const rf = [2 + hx, -31 + hy], kf = [rf[0] + Math.sin(o.ob) * 7, rf[1] - Math.cos(o.ob) * 7], tf = [kf[0] + Math.cos(o.od) * 5.5, kf[1] + Math.sin(o.od) * 5.5];
  p.parte(F.un(F.tr(rf[0], rf[1], kf[0], kf[1], 2.8, 2.6), F.tr(kf[0], kf[1], tf[0], tf[1], 2.6, 2)), P.peloF, { sombra: 1 });
  // la capa (ondea al andar)
  const w1 = Math.round(Math.sin(o.fase) * 2.2 * o.capa), w2 = Math.round(Math.sin(o.fase + 1.9) * 2.2 * o.capa);
  p.parte(F.pol(-4 + hx, -20 + hy, 2 + hx, -19 + hy, 1, -10, -2, -2, -8 + w1, -1, -14 + w2, -5, -12 + w1, -13, -7 + hx, -18 + hy), P.capa, { sombra: 2 });
  // pie y mano del otro lado (más oscuros), cola de algodón, cuerpo, barriga, muslo y pie de este lado
  p.parte(F.ov(o.pa[0], o.pa[1], 4.8, 1.9), P.peloF, { sombra: 1 });
  p.parte(F.ov(o.ba[0], o.ba[1], 2.4, 2.6), P.peloF, { sombra: 1 });
  p.parte(F.un(F.ov(-8.4, -8.5, 3, 2.8), F.ov(-9.4, -10, 2, 2)), P.pelo, { sombra: 1 });
  p.parte(F.ov(0.5, -10, 7.6, 8.6, 0.18), P.pelo, { sombra: 3 });
  p.parte(F.y(F.ov(3.9, -9, 3.9, 6.2, 0.18), F.ov(0.5, -10, 6.6, 7.6, 0.18)), P.rosa, { sombra: 1, linea: false, luz: false });
  p.parte(F.ov(-2.5, -5.2, 5, 4.6), P.pelo, { sombra: 2 });
  p.parte(F.ov(o.pb[0], o.pb[1], 5.6, 2.1), P.pelo, { sombra: 1 });
  // zanahoria «detrás»: al hombro o preparando el golpe; la tapa la cabeza
  if (o.zDetras) manoZanahoria(p, o);
  // cabeza, hocico y la oreja larga de este lado
  const cabeza = F.ov(3 + hx, -24 + hy, 9, 8.6);
  p.parte(cabeza, P.pelo, { sombra: 3, luz: 2 });
  ojoLejos(p, o, 9.6 + hx, -26.8 + hy, F.ov(3 + hx, -24 + hy, 8.8, 8.4));
  p.parte(F.ov(10.2 + hx, -21.4 + hy, 4.2, 3.6), P.pelo, { sombra: 2 });
  const ra = [-1 + hx, -30.5 + hy], ca = [ra[0] + Math.sin(o.oa) * 9.5, ra[1] - Math.cos(o.oa) * 9.5];
  p.parte(F.ov(ca[0], ca[1], 3.3, 10, o.oa), P.pelo, { sombra: 2 });
  p.parte(F.ov(ca[0] + Math.cos(o.oa) * 0.8, ca[1] + Math.sin(o.oa) * 0.8 + 1, 1.4, 7, o.oa), P.rosa, { sombra: 0, linea: false, luz: false });
  // corona torcida
  const cx = 3 + hx, cy = -32.5 + hy;
  p.parte(F.gira(F.mueve(F.pol(-5, -32.5, 4.5, -32.5, 5, -38, 2.2, -35.2, 0, -39.5, -2.2, -35.2, -5, -38), cx, cy + 33), -0.22, cx, cy), P.oro, { sombra: 1 });
  const [gx, gy] = giraP(cx, cy - 1.4, -0.22, cx, cy);
  p.px(gx, gy, '#ff4b5c'); p.px(gx + 1, gy, '#ff4b5c');
  // cara: el ojo en espiral, la nariz rosa en la punta del hocico, la boca y el colorete
  ojoConejo(p, o, 5.4 + hx, -25.6 + hy);
  p.px(13.8 + hx, -22.8 + hy, LENGUA); p.px(13.8 + hx, -21.8 + hy, LENGUA);
  bocaConejo(p, o, 10.8 + hx, -18.6 + hy);
  p.px(5 + hx, -20.6 + hy, '#ff9ec4'); p.px(6 + hx, -20.6 + hy, '#ff9ec4');
  if (!o.zDetras) manoZanahoria(p, o);
}

const POSE_CONEJO = { hx: 0, hy: 0, fase: 0, capa: 0.3, pa: [5.5, -2.6], pb: [3, -1.4], ba: [5.5, -12], oa: -0.32, ob: 0.1, od: 0.5, ojo: 'loco', boca: 'risa', esp: 0, za: -2.6, zx: 4, zy: -14, zDetras: true };
const HOP_CONEJO = [0, 0, 0, 3, 6, 7, 5, 2];   // altura de cada fotograma del saltito al andar
const fotoConejo = (t, cambios) => { const p = new Pincel(64, 66, 28, 62, t); conejo(p, Object.assign({}, POSE_CONEJO, cambios)); return p.lienzo(); };

function creaHeroe() {
  const H = SPR.heroe = {};
  const T = [[1.14, 0.86], [1.05, 0.95], [1.07, 0.93], [0.9, 1.12], [0.95, 1.06], [1, 1], [0.96, 1.05], [0.92, 1.1]];
  const OA = [0, -0.15, -0.3, -0.55, -0.6, -0.45, -0.3, -0.25], OD = [1.2, 0.9, 0.6, 1, 1.1, 0.7, 0.1, -0.1];
  const PB = [[4, -1.4], [3, -1.4], [3, -1.4], [-2, -2.2], [1, -3], [1, -3], [5, -1.8], [5, -1.8]];
  const PA = PB.map(([x, y], f) => [x + (f === 3 ? 1.5 : 2.6), y - 1.1]);   // el otro pie, un poco por delante y más lejos
  H.andar = T.map(([sx, sy], f) => fotoConejo({ sx, sy }, { oa: OA[f], od: OD[f], pa: PA[f], pb: PB[f], capa: 1, fase: f * Math.PI / 4, esp: f * 0.8 }));
  const resp = [[1, 0], [1.02, 0], [1.04, -1], [1.02, 0]];
  H.quieto = resp.map(([sy, hy], f) => fotoConejo({ sy }, { hy, oa: -0.32 + Math.sin(f * Math.PI / 2) * 0.06, capa: 0.4, fase: f * Math.PI / 2, esp: f * 0.8 }));
  H.guardia = resp.map(([sy, hy], f) => fotoConejo({ sy }, { hy, oa: -0.36 + Math.sin(f * Math.PI / 2) * 0.06, capa: 0.4, fase: f * Math.PI / 2, esp: f * 0.8, zDetras: false, za: -0.55, zx: 10, zy: -11 + (f === 2 ? -1 : 0), ojo: 'furia', pa: [6.5, -2.6], pb: [4, -1.4] }));
  H.carga = fotoConejo({ sx: 1.08, sy: 0.92, inc: -0.22 }, { zDetras: true, za: -2.9, zx: -3, zy: -18, ojo: 'furia', boca: 'grito', oa: -0.7, od: 1.1, capa: 0.6, fase: 1, pa: [4.5, -2.6], pb: [2, -1.4] });
  H.golpe = fotoConejo({ sx: 1.12, sy: 0.92, inc: 0.3 }, { zDetras: false, za: 0.6, zx: 12, zy: -12, ojo: 'furia', boca: 'grito', oa: -0.75, od: 1.3, capa: 1, fase: 2, pa: [-3, -2.8], pb: [5, -1.8] });
  H.remate = fotoConejo({ sx: 1.04, sy: 0.96, inc: 0.15 }, { zDetras: false, za: 1.15, zx: 11, zy: -8, ojo: 'furia', oa: -0.5, od: 1, capa: 0.8, fase: 3, pa: [7.5, -2.6], pb: [5, -1.6] });
  H.dano = fotoConejo({ sx: 0.95, sy: 1.05, inc: -0.3 }, { zDetras: false, za: 2.3, zx: 4, zy: -10, ojo: 'x', boca: 'ay', oa: -0.75, od: 1.4, capa: 0.8, fase: 4, pa: [4.5, -2.8], pb: [2, -1.4] });
  H.sube = fotoConejo({ sx: 0.88, sy: 1.14 }, { zDetras: false, za: -1.35, zx: 13, zy: -15, ojo: 'furia', boca: 'grito', oa: -0.5, od: 1.3, pa: [1.5, -3.4], pb: [-1, -2.4], capa: 1, fase: 5 });
  H.cae = fotoConejo({ sx: 0.9, sy: 1.12 }, { zDetras: false, za: 1.45, zx: 7, zy: -7, ojo: 'furia', boca: 'grito', oa: -0.1, od: -0.4, pa: [6.5, -2.6], pb: [4, -1.4], capa: 1, fase: 6 });
  H.gana = [0, 1].map(f => fotoConejo({ sy: f ? 1.04 : 1 }, { zDetras: false, za: -1.3, zx: 13.5, zy: -26 - f, ojo: 'feliz', boca: 'feliz', oa: f ? -0.2 : -0.4, od: f ? 0.2 : 0.6, capa: 0.6, fase: f * 2 }));
  H.hop = HOP_CONEJO;
}

/* ---------- MadSquirrel: la ardilla que te sigue si eliges su habilidad ---------- */
const PAL_A = {
  pelo:  pal('#c45a22', '#8e3216', '#f0a065', '#5a1e0c'),
  cola:  pal('#d8692a', '#9a3a18', '#f6b070', '#5a1e0c'),
  crema: pal('#f6d7a7', '#d9a86c', '#fff0d6', '#8a5a2a'),
};
function ardilla(p, o) {
  const P = PAL_A, sw = o.cola, hx = o.hx, hy = o.hy;
  p.parte(F.un(F.ov(-5.5, -6.5, 3.4, 4.4, 0.6), F.ov(-8.5 + sw, -12.5, 4.2, 4.6), F.ov(-6.5 + sw * 1.6, -18.5, 3.8, 3.6)), P.cola, { sombra: 2 });
  p.plano(F.tr(-8.5 + sw, -10.5, -7 + sw * 1.6, -18, 0.7), '#f6b070');
  p.parte(F.ov(o.pa[0], o.pa[1], 2.4, 1.5), P.cola, { sombra: 0 });
  p.parte(F.ov(0, -6, 4.8, 4.8), P.pelo, { sombra: 2 });
  p.parte(F.ov(1.6, -5.5, 2.6, 3.3), P.crema, { sombra: 1, linea: false, luz: false });
  p.parte(F.ov(o.pb[0], o.pb[1], 2.6, 1.6), P.pelo, { sombra: 0 });
  p.parte(F.pol(-1.5 + hx, -14.5 + hy, 0 + hx, -20 + hy, 2.8 + hx, -15.5 + hy), P.pelo, { sombra: 1 });
  p.parte(F.ov(2 + hx, -12 + hy, 5, 4.5), P.pelo, { sombra: 2 });
  p.parte(F.ov(5.2 + hx, -10.6 + hy, 2.4, 1.8), P.crema, { sombra: 1, linea: false });
  p.parte(F.ov(3.2 + hx, -13.4 + hy, 1.9, 2.3), PAL_H.ojo, { sombra: 0, luz: false });
  p.px(3.8 + hx, -13.6 + hy, OL); p.px(3.8 + hx, -12.6 + hy, OL);
  p.px(7.3 + hx, -11.4 + hy, OL);
  if (o.boca) { p.plano(F.ov(6 + hx, -9 + hy, 1.6, 1.4), BOCA); p.px(5.8 + hx, -9.8 + hy, '#ffffff'); }
  else p.px(6.2 + hx, -9.4 + hy, '#ffffff');
  p.parte(F.ov(4.6, -6.5, 1.6, 1.6), P.pelo, { sombra: 0 });
}
const POSE_ARDILLA = { hx: 0, hy: 0, cola: 0, pa: [-2.5, -1.3], pb: [2.5, -1.3], boca: false };
const fotoArdilla = (t, c) => { const p = new Pincel(30, 30, 15, 27, t); ardilla(p, Object.assign({}, POSE_ARDILLA, c)); return p.lienzo(); };
function creaArdilla() {
  const A = SPR.ardilla = {};
  const T = [[1.15, 0.85], [1.05, 0.95], [0.9, 1.12], [0.95, 1.05], [1, 1], [0.95, 1.08]], SW = [-1, -0.5, 0.5, 1, 0.5, 0];
  A.andar = T.map(([sx, sy], f) => fotoArdilla({ sx, sy }, { cola: SW[f], pa: f < 2 ? [-3, -1.3] : [-1, -2], pb: f < 2 ? [3, -1.3] : [1.5, -2] }));
  A.hop = [0, 0, 2, 4, 4, 2];
  A.quieto = [0, 1].map(f => fotoArdilla({ sy: f ? 1.05 : 1 }, { cola: f ? 0.6 : -0.4 }));
  A.golpe = fotoArdilla({ sx: 1.18, sy: 0.9, inc: 0.35 }, { boca: true, cola: -1 });
}
