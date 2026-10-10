// Fans of Tactics Advance (prototipo) · PRESENTACIÓN Y TÍTULO: «Arkioner y Pepins presentan», las viñetas de la historia con el
// texto escribiéndose solo (se pasan tocando y se pueden saltar) y la pantalla de título: cielo, logo, una islita con CrazyBunny,
// EpicChampion y un esqueleto, y «Toca para empezar». Al tocar sale el menú principal al lado de la isla.
'use strict';

const VISTO = { leer(k) { try { return localStorage.getItem('fota-' + k) === '1'; } catch (_) { return false; } }, poner(k) { try { localStorage.setItem('fota-' + k, '1'); } catch (_) { /* sin guardar */ } } };

/* ---------- la presentación ---------- */
const VINETAS = [
  { fondo: 'negro', texto: 'Arkioner y Pepins presentan', dura: 2.6 },
  { fondo: 'noche', texto: 'Microblizz, una empresa millonaria, ha comprado tus juegos favoritos.' },
  { fondo: 'tarde', texto: 'Ahora los cierra uno a uno y despide a todo el mundo. Hasta a Lola, la del café.' },
  { fondo: 'heroes', texto: 'Pero los fans no se rinden. CrazyBunny y EpicChampion van a plantarle cara…' },
  { fondo: 'heroes', texto: '…por turnos. Casilla a casilla.', final: true },
];
const INTRO = { i: 0, t: 0, fundido: 0 };
let FONDOS_INTRO = null;
function presentacion() {
  cierra(); TUT = null;
  if (!FONDOS_INTRO) FONDOS_INTRO = { noche: fondoNoche(), tarde: fondoAtardecer() };
  Object.assign(J, { fase: 'intro', unidades: [], bocadillos: [], banner: null, ocupado: true, pan: [0, 0], toque: null });
  Object.assign(INTRO, { i: 0, t: 0, letras: 0 });
  musica('menu');
}
const letrasVistas = () => Math.floor(INTRO.t * 38);
function avanzaIntro() {
  const v = VINETAS[INTRO.i], texto = tr(v.texto);
  if (!v.dura && letrasVistas() < texto.length) { INTRO.t = 99; return; }   // primero se completa el texto
  if (INTRO.i >= VINETAS.length - 1) return terminaIntro();
  INTRO.i++; INTRO.t = 0; INTRO.letras = 0; play('card');
}
function terminaIntro() { VISTO.poner('intro'); pantallaTitulo(); }
function actualizaIntro(dt) {
  INTRO.t += dt;
  vigilaMusica();
  const v = VINETAS[INTRO.i];
  // el texto suena al escribirse (una nota cada tres letras)
  if (!v.dura) { const n = Math.min(tr(v.texto).length, letrasVistas()); if (n - INTRO.letras >= 3) { INTRO.letras = n; play('tick'); } }
  if (v.dura && INTRO.t > v.dura) { INTRO.i++; INTRO.t = 0; }
}
const geoSaltar = () => { const w = anchoTexto(tr('Saltar')) + 18; return { x: UW - w - 4, y: 4, w, h: 17 }; };
// un fondo grande que cubre toda la pantalla (ampliado en números enteros) y centrado
function cubre(img, ancla = 0.5) {
  const k = Math.max(1, Math.ceil(Math.max(UW / img.width, UH / img.height)));
  const x = Math.round((UW - img.width * k) / 2), y = Math.round((UH - img.height * k) * ancla);
  uc.imageSmoothingEnabled = false; uc.drawImage(img, x, y, img.width * k, img.height * k);
  return { x, y, k };
}
function grande(s, x, y, e, alfa = 1) { uc.globalAlpha = alfa; uc.imageSmoothingEnabled = false; uc.drawImage(s.c, Math.round(x - s.ox * e), Math.round(y - s.oy * e), s.c.width * e, s.c.height * e); uc.globalAlpha = 1; }
function pintaIntro(t) {
  const v = VINETAS[INTRO.i], k = INTRO.t, e = Math.max(1, Math.min(3, Math.floor(UH / 70)));
  uc.fillStyle = '#05030a'; uc.fillRect(0, 0, UW, UH);
  if (v.fondo === 'negro') {
    const a = Math.min(1, k / 0.6, (v.dura - k) / 0.6);
    uc.globalAlpha = Math.max(0, a);
    escribe(uc, tr(v.texto), Math.round(UW / 2), Math.round(UH / 2) - 4, '#d8d2f0', null, 'centro');
    uc.globalAlpha = 1;
    return;
  }
  // la ventana del texto va abajo; los personajes, justo encima
  const texto = tr(v.texto), w = Math.min(UW - 12, 300), lineas = envuelve(texto.slice(0, letrasVistas()), w - 20), todas = envuelve(texto, w - 20);
  const h = 12 + todas.length * 10, x = Math.round((UW - w) / 2), y = UH - h - 8, suelo = y - 6;
  if (v.fondo === 'noche') {
    const c = cubre(FONDOS_INTRO.noche, 0.55);
    pintaLetrero(uc, t, c.x + 268 * c.k, c.y + 44 * c.k);
    // un becario cruza con su café, camino de su primer día sin sueldo
    grande(spr('becario', { vapor: Math.floor(t * 3) % 2, hy: Math.floor(t * 4) % 2 }, {}), ((k * 22) % (UW + 60)) - 30, suelo, e);
  } else if (v.fondo === 'tarde') {
    cubre(FONDOS_INTRO.tarde, 0.6);
    for (let i = 0; i < 5; i++) grande(spr(i % 2 ? 'cruz' : 'tumba'), UW / 2 + (i - 2) * 26 * e / 2, suelo - (i % 2) * 3, e);
  } else {
    cubre(FONDOS_INTRO.tarde, 0.35);
    uc.globalAlpha = 0.35; uc.fillStyle = '#1a0c30'; uc.fillRect(0, 0, UW, UH); uc.globalAlpha = 1;
    const salto = Math.abs(Math.sin(t * 2.4)) * 8 * e / 2, fin = v.final;
    grande(spr('campeon', { ondea: Math.floor(t * 2) % 2 }, {}), UW / 2 + 22 * e / 2, suelo, e);
    grande(spr('conejo', salto > 4 ? { ondea: -1, oreja: -1, espiral: Math.floor(t * 7) % 2 } : {}, {}), UW / 2 - 18 * e / 2, suelo - salto, e);
    if (fin) for (let i = 0; i < 3; i++) grande(spr('esqueleto', { hy: (Math.floor(t * 2.4) + i) % 2 }, { espejo: true }), UW - 26 - i * 20 * e / 2, suelo - 4 + i * 4, Math.max(1, e - 1), Math.min(1, k * 2));
  }
  // el texto, escribiéndose solo
  ventana(uc, x, y, w, h, 'oscuro');
  lineas.forEach((l, i) => escribe(uc, l, x + 10, y + 6 + i * 10, '#ffffff'));
  if (letrasVistas() >= texto.length && Math.floor(t * 3) % 2) { uc.fillStyle = '#ffe27a'; for (let i = 0; i < 3; i++) uc.fillRect(x + w - 12 + i, y + h - 9 + i, 5 - i * 2, 1); }
  const g = geoSaltar(); ventana(uc, g.x, g.y, g.w, g.h, 'oscuro'); escribe(uc, tr('Saltar'), g.x + 9, g.y + 5, '#d8e2ff');
  // fundido al cambiar de viñeta
  if (k < 0.35) { uc.globalAlpha = 1 - k / 0.35; uc.fillStyle = '#05030a'; uc.fillRect(0, 0, UW, UH); uc.globalAlpha = 1; }
}
function tocaIntro(x, y) { if (dentro(geoSaltar(), x, y)) { play('select'); return terminaIntro(); } avanzaIntro(); }

/* ---------- la pantalla de título ---------- */
const TITULO = { etapa: 'pulsa', t: 0 };
function pantallaTitulo() {
  cierra(); TUT = null;
  vista('cementerio');
  TITULO.etapa = 'pulsa'; TITULO.t = 0;
  musica('menu');
}
// dónde va cada cosa: el logo arriba; debajo, la isla (y el menú a su derecha si la pantalla es ancha, o debajo si es alta)
function escalaLogo() { return Math.max(1, Math.min(3, Math.floor((UW - 20) / 45), Math.floor(UH / 90))); }
// la isla ocupa (a escala 1) unos 104 × 100 píxeles: su dibujo empieza 12 más abajo y 28 más a la derecha de su lienzo
const ISLA_W = 104, ISLA_H = 100;
function geoTitulo(menu) {
  const s = escalaLogo(), alto = 13 * Math.max(1, s - 1) + 13 * s * 2 - 6 * s, logoY = Math.max(6, Math.round(UH * 0.04));
  const y0 = logoY + alto + 2, ancho = UW >= UH * 1.2 && UW >= 300, abajo = menu && !ancho ? menu.h + 12 : 26;
  const anchoIsla = ancho && menu ? UW * 0.5 : UW - 20;
  const e = Math.max(1, Math.min(3, Math.floor(Math.min(anchoIsla / ISLA_W, (UH - y0 - abajo) / ISLA_H))));
  const islaX = menu && ancho ? Math.round(UW * 0.3) : Math.round(UW / 2);
  const libre = UH - y0 - abajo - ISLA_H * e, islaY = y0 + Math.max(0, Math.round(libre / 2));
  let mx = 0, my = 0;
  if (menu) { if (ancho) { mx = Math.round(UW * 0.7 - menu.w / 2); my = Math.round(y0 + (UH - y0 - menu.h) / 2); } else { mx = Math.round((UW - menu.w) / 2); my = Math.min(UH - menu.h - 8, islaY + ISLA_H * e + 6); } }
  return { s, logoY, alto, e, islaX, islaY, mx, my };
}
// la isla: un trozo de 3 × 3 casillas del cementerio con dos héroes y un esqueleto (las casillas se pintan una vez)
let ISLA = null;
function islaLienzo() {
  if (ISLA && ISLA.esc === ESC) return ISLA;
  const c = lienzoNuevo(160, 140), g = c.getContext('2d');
  for (let d = 4; d <= 8; d++) for (let gx = 2; gx <= 4; gx++) {
    const gy = d - gx; if (gy < 2 || gy > 4) continue;
    const T = CASILLAS[gy * N + gx];
    g.drawImage(T.c, 64 + (gx - gy) * 16, 70 + (gx + gy - 6) * 8 - T.h * HU);
  }
  ISLA = { c, esc: ESC };
  return ISLA;
}
function pintaIsla(cx, top, e, t) {
  const I = islaLienzo(), ox = cx - 80 * e, oy = top - 12 * e;
  uc.imageSmoothingEnabled = false;
  uc.drawImage(I.c, ox, oy, 160 * e, 140 * e);
  const pie = (gx, gy) => [ox + (64 + (gx - gy) * 16 + 16) * e, oy + (70 + (gx + gy - 6) * 8 - altura(gx, gy) * HU + 8) * e];
  const salto = Math.abs(Math.sin(t * 2.6)) * 7, fase = Math.floor(t * 2.4) % 2;
  const cosas = [
    [4, 2, spr('tumba')], [2, 4, spr('campeon', { ondea: fase }, fase ? { sy: 0.97 } : {})],
    [3, 3, spr('conejo', salto > 4 ? { ondea: -1, oreja: -1, espiral: Math.floor(t * 7) % 2 } : {}, {}), salto],
    [4, 4, spr('esqueleto', { hy: 1 - fase }, { espejo: true })],
  ];
  for (const [gx, gy, s, alto = 0] of cosas) {
    const [x, y] = pie(gx, gy);
    uc.globalAlpha = 0.3; uc.fillStyle = '#1c1028'; uc.fillRect(x - 6 * e, y - e, 12 * e, 3 * e); uc.globalAlpha = 1;
    uc.drawImage(s.c, x - s.ox * e, y - (s.oy + alto) * e, s.c.width * e, s.c.height * e);
  }
}
let BRILLO = null;
function pintaLogo(t, g) {
  const s = g.s, a = textoGrande(tr('FANS OF'), '#ffffff', Math.max(1, s - 1)), b = textoGrande('TACTICS', '#ffffff', s), c = textoGrande('ADVANCE', '#ff8a2a', s);
  const y0 = g.logoY + Math.round(Math.sin(t * 1.8) * 1.5);
  uc.drawImage(a, Math.round((UW - a.width) / 2), y0);
  uc.drawImage(b, Math.round((UW - b.width) / 2), y0 + a.height - 3 * s);
  const cy = y0 + a.height + b.height - 6 * s;
  uc.drawImage(c, Math.round((UW - c.width) / 2), cy);
  // un brillo que cruza ADVANCE de vez en cuando
  const k = (t * 0.45) % 1.6;
  if (k < 1) {
    // el brillo solo cae sobre las letras (se pinta en una copia con «source-atop»)
    if (!BRILLO || BRILLO.width !== c.width || BRILLO.height !== c.height) BRILLO = lienzoNuevo(c.width, c.height);
    const g2 = BRILLO.getContext('2d'), bx = Math.round(k * (c.width + 30) - 15);
    g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, c.width, c.height); g2.drawImage(c, 0, 0);
    g2.globalCompositeOperation = 'source-atop'; g2.globalAlpha = 0.6; g2.fillStyle = '#fff6d0';
    for (let i = 0; i < c.height; i++) g2.fillRect(bx - Math.floor(i / 2), i, 3 * s, 1);
    g2.globalAlpha = 1;
    uc.drawImage(BRILLO, Math.round((UW - c.width) / 2), cy);
  }
}
function pintaTitulo(t) {
  const menu = PANT && PANT.logo ? tamPantalla(PANT) : null, g = geoTitulo(menu);
  pintaIsla(g.islaX, g.islaY, g.e, t);
  pintaLogo(t, g);
  if (!PANT) {
    if (Math.floor(t * 1.6) % 2 === 0) escribe(uc, tr('Toca para empezar'), Math.round(UW / 2), UH - 22, '#ffe27a', '#101438', 'centro');
    escribeMini(uc, 'ARKIONER Y PEPINS 2026', Math.round(UW / 2), UH - 9, '#8a82b0', null, 'centro');
  }
}
