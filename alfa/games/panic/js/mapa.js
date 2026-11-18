// Fans of Panic · Mapa: los mundos en orden, cada uno con sus niveles, estrellas y la llave para abrir el siguiente (con las
// estrellas del mundo anterior o con fichas). Al tocar un nivel se gasta un corazón y empieza.
'use strict';

const MAPA = { mundo: 0 };

// una flecha de Yoshi (img/flecha.png, mira a la derecha; a la izquierda, volteada); si no está, un botón con «<» o «>»
function flechaUI(x, y, izquierda, accion) {
  if (!sprite('flecha')) { botonUI(izquierda ? '<' : '>', x - 18, y - 30, 36, 60, accion, COL.panel, COL.blanco, 20); return; }
  G.save(); G.translate(x, y); if (izquierda) G.scale(-1, 1); pintaSprite('flecha', 0, 0, 40); G.restore();
  zonaUI(x - 24, y - 30, 48, 60, accion);
}

function mundoAbierto(m) { return SAVE.llaves.includes(m); }

function abreMundo(m, con) {
  const i = ORDEN_MUNDOS.indexOf(m), ant = ORDEN_MUNDOS[i - 1];
  if (con === 'estrellas') { if (estrellasMundo(ant) < AJUSTES.llaveEstrellas) return; }
  else { if (SAVE.fichas < AJUSTES.llaveFichas) { toast(tr('Te faltan fichas')); return; } SAVE.fichas -= AJUSTES.llaveFichas; }
  SAVE.llaves.push(m); guarda(); SONIDO.gana(); toast(tr('¡Mundo abierto!'), true);
}

function entraNivel(m, n) {
  if (!gastaVida()) { toast(tr('Sin corazones: espera o mira un anuncio')); return; }
  empiezaNivel(m, n);
}

function pintaMapa(W, H) {
  const m = ORDEN_MUNDOS[MAPA.mundo], M = MUNDOS[m], t = JUEGO.t, abierto = mundoAbierto(m);
  if (!pintaFondo('mapa-' + m, W, H, M.fondo)) { G.fillStyle = M.color; G.globalAlpha = 0.15; for (let i = 0; i < 8; i++) { G.beginPath(); G.arc((i * 73) % W, (i * 131 + t * 10) % H, 30 + i * 6, 0, Math.PI * 2); G.fill(); } G.globalAlpha = 1; }
  botonUI('<', 8, 12, 40, 40, () => alMenu('menu'), COL.panel, COL.blanco, 18); UI.atras = () => alMenu('menu');
  ficha(W - 70, 32, 10); letra(String(SAVE.fichas), W - 56, 33, 15, COL.blanco, 'left');
  // flechas entre mundos
  if (MAPA.mundo > 0) flechaUI(32, 112, true, () => { MAPA.mundo--; });
  if (MAPA.mundo < ORDEN_MUNDOS.length - 1) flechaUI(W - 32, 112, false, () => { MAPA.mundo++; });
  palabra(m, tr(M.nombre), W / 2, 96, 36, M.claro);
  letra(`${M.chica} · ${tr(M.oficio)}`, W / 2, 124, 13, COL.blanco);
  letra(`${estrellasMundo(m)} / 15`, W / 2, 142, 12, COL.oro);
  parrafo(tr(M.intro), W / 2, 172, W - 60, 12, COL.blanco);
  if (!abierto) { pintaLlave(W, H, m, M); return; }
  // los niveles en zigzag
  let yaBloqueado = false;
  M.niveles.forEach((nv, i) => {
    const n = i + 1, x = W / 2 + (i % 2 ? 70 : -70) + (i === 4 ? 70 : 0), y = 260 + i * 68;
    const est = estrellasDe(m, n), puede = !yaBloqueado;
    if (i > 0) { G.beginPath(); G.moveTo(W / 2 + ((i - 1) % 2 ? 70 : -70) + (i - 1 === 4 ? 70 : 0), y - 68); G.lineTo(x, y); G.strokeStyle = 'rgba(255,255,255,.3)'; G.lineWidth = 4; G.setLineDash([6, 6]); G.stroke(); G.setLineDash([]); }
    const spr = !puede ? 'nivel-cerrado' : nv.final ? 'nivel-jefe' : 'nivel';
    if (!pintaSprite(spr, x, y, 56)) { circulo(x, y + 3, 26, COL.tinta, null); circulo(x, y, 26, puede ? (nv.final ? COL.rosa : M.color) : COL.panel, COL.tinta, 2.5); }
    if (puede) numero(n, x, y + 1, 22);
    for (let k = 0; k < 3; k++) estrella(x - 16 + k * 16, y + 36, 7, k < est);
    if (puede) zonaUI(x - 30, y - 30, 60, 60, () => entraNivel(m, n));
    if (!est) yaBloqueado = true;
  });
  for (let i = 0; i < AJUSTES.vidas; i++) corazon(W / 2 - 44 + i * 22, H - 30, 8, i < SAVE.vidas);
  const sv = segundosVida(); if (sv) letra(`${Math.floor(sv / 60)}:${String(sv % 60).padStart(2, '0')}`, W / 2 + 80, H - 30, 11, COL.gris);
}

// un mundo cerrado: cómo abrirlo
function pintaLlave(W, H, m, M) {
  const ant = ORDEN_MUNDOS[ORDEN_MUNDOS.indexOf(m) - 1], tiene = estrellasMundo(ant);
  caja(30, 280, W - 60, 190, 14, 'rgba(0,0,0,.4)', M.color, 2);
  pintaSprite('candado', W / 2, 300, 40, 0, COL.gris, '');
  letra(tr('MUNDO CERRADO'), W / 2, 330, 20, M.claro);
  parrafo(tr('Microblizz ha puesto una llave. Ábrelo con las estrellas del mundo anterior o con fichas.'), W / 2, 340, W - 100, 12, COL.blanco);
  const gratis = tiene >= AJUSTES.llaveEstrellas;
  botonUI(tr('{a}/{b} ESTRELLAS', { a: tiene, b: AJUSTES.llaveEstrellas }), 50, 395, W - 100, 32, () => abreMundo(m, 'estrellas'), gratis ? COL.oro : COL.panel, gratis ? COL.tinta : COL.gris, 13);
  botonUI(tr('{n} FICHAS', { n: AJUSTES.llaveFichas }), 50, 432, W - 100, 32, () => abreMundo(m, 'fichas'), SAVE.fichas >= AJUSTES.llaveFichas ? COL.rosa : COL.panel, SAVE.fichas >= AJUSTES.llaveFichas ? COL.tinta : COL.gris, 13);
}
