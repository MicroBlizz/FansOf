// Fans of Island · ARTE DE LOS PERSONAJES: CrazyBunny (con su cuerpo de conejo), SlyFox y los becarios, en píxel art con el pincel de la
// serie (pixel.js) y contorno negro gordo (lona.js). Cada pose se dibuja una vez y se guarda; la animación va a tirones (IS_C.fps), como
// plastelina movida a mano. Aquí están también la burbuja de rescate, la marca del poder sobre la cabeza y sus efectos.
'use strict';
const IS_SPR = {};
const ESPIRAL5 = ['.###.', '#...#', '#.##.', '#..#.', '.##..'];
const IS_POSE = { f: 0, aire: false, flota: 0, br: false, oreja: -0.25, by: 0 };

/* ---------- CRAZYBUNNY (34 de alto hasta la coronilla; las orejas, por encima). Origen en los pies, mira a la derecha ----------
   o: f = fase de la carrera (0 a 1), aire = en el aire (patas recogidas), flota = 1 o 2 (orejas aleteando), br = brazos arriba (lleva al
   compañero), oreja = ángulo de la oreja de delante, by = cuerpo un píxel más abajo (respira) */
function conejoIsla(p, o) {
  const P = MAT, f = o.f, s = Math.sin(f * Math.PI * 2), c = Math.cos(f * Math.PI * 2), by = o.by || 0;
  const pa = o.aire ? [-2, -5] : [3 * s, -2 - Math.max(0, -c) * 2], pb = o.aire ? [4, -3] : [-3 * s, -2 - Math.max(0, c) * 2];   // los pies
  // oreja de atrás (doblada; al flotar, estirada) y cola, detrás de todo
  if (o.flota) p.parte(F.ov(7 + (o.flota === 2 ? 3 : 0), -40, 2.6, 8, o.flota === 2 ? 1.2 : 0.9), P.peloF, { r: 2.4, sombra: 0 });
  else p.parte(F.fun(1.5, F.tr(5, -34 + by, 8.5, -41 + by, 2.4, 2.2), F.tr(8.5, -41 + by, 13, -38 + by, 2.2, 1.6)), P.peloF, { r: 2.2, sombra: 0 });
  p.parte(F.un(F.ov(-7.6, -11 + by, 2.9, 2.7), F.ov(-8.6, -12.6 + by, 1.9, 1.9)), P.pelo, { r: 2.8, sombra: 1 });
  // pata y brazo de atrás
  p.parte(F.ov(pb[0] - 3, pb[1], 4.6, 2.3), P.peloF, { r: 2.2, sombra: 1 });
  p.parte(F.ov(-2.5, -6.5 + by, 3.2, 3.4), P.peloF, { r: 3, sombra: 1 });
  p.parte(F.tr(-3, -18 + by, -6.5, (o.br ? -24 : -12) + by, 2), P.peloF, { r: 1.8, sombra: 0 });
  // el cuerpo y la barriga
  p.parte(F.ov(0, -14 + by, 7.2, 8), P.pelo, { r: 6, sombra: 2 });
  p.parte(F.ov(1.6, -13 + by, 4.2, 5.2), P.crema, { r: 4, linea: false, sombra: 0 });
  // pata de delante
  p.parte(F.ov(2, -6 + by, 3.4, 3.6), P.pelo, { r: 3, sombra: 1 });
  p.parte(F.ov(pa[0] + 3, pa[1], 5, 2.4), P.pelo, { r: 2.3, sombra: 1 });
  p.tonoPx(pa[0] + 6, pa[1] + 0.5, -1); p.tonoPx(pa[0] + 4, pa[1] + 1, -1);
  // la cabeza con el hocico
  const hy = -27 + by, craneo = F.ov(2, hy, 8, 7.4), cabeza = F.fun(2.5, craneo, F.ov(8.8, hy + 2.4, 3.8, 3.2));
  p.parte(cabeza, P.pelo, { r: 6.5, sombra: 2 });
  // la oreja de delante, larga, con el rosa de dentro
  const a = o.oreja, ex = -1 + Math.sin(a) * 9, ey = hy - 7 - Math.cos(a) * 9;
  p.parte(F.ov(ex, ey, 2.9, 8.6, a), P.pelo, { r: 2.8, sombra: 2 });
  p.parte(F.ov(ex + Math.cos(a) * 0.5, ey + Math.sin(a) * 0.5 + 0.8, 1.2, 6, a), P.rosa, { r: 1.2, linea: false, sombra: 0 });
  // la corona torcida: tres puntas, su banda y la piedra roja
  const cx = 3.5, cy = hy - 6.4, ac = -0.25, K = g => F.gira(F.mueve(g, cx, cy), ac, cx, cy), kp = (x, y) => giraP(cx + x, cy + y, ac, cx, cy);
  p.parte(K(F.pol(-4.5, 1, 4.5, 1, 5, -4.6, 2.2, -2.2, 0, -6, -2.2, -2.2, -5, -4.6)), P.oro, { r: 2, sombra: 1 });
  for (const [x, y] of [[-4.5, -4], [0, -5], [4.5, -4]]) { const [u, v] = kp(x, y); p.pxm(u, v, P.oro, 5); }
  { const [x, y] = kp(0, -1.6); p.pxm(x, y, P.rojo, 4); p.pxm(x + 1, y + 0.4, P.rojo, 2); }
  // la cara: el ojo loco en espiral, el otro ojo junto al hocico, nariz, boca con dientes y colorete
  const T = P.pelo.c[0];
  p.plano(F.ov(1.5, hy - 0.6, 3.4, 3.6), T); p.plano(F.ov(1.5, hy - 0.6, 2.6, 2.8), '#ffffff');
  ESPIRAL5.forEach((fila, j) => { for (let i = 0; i < 5; i++) if (fila[i] === '#') p.px(1.5 + i - 2, hy - 0.6 + j - 2, '#8a2bff'); });
  p.plano(F.ov(8.4, hy - 1.6, 1.4, 2), T); p.px(8.4, hy - 2.2, '#ffffff');
  p.px(12.2, hy + 1.4, '#ff6f9f'); p.px(11.4, hy + 1.2, '#ffa9c6');
  p.plano(F.menos(F.ov(8.6, hy + 5.4, 3, 2.4), F.rr(-30, -60, 60, 60 + hy + 5.4, 0)), '#5a1530');
  p.px(8, hy + 5.8, '#ffffff'); p.px(9, hy + 5.8, '#ffffff'); p.px(7.4, hy + 6.8, '#ff7aa8');
  p.px(1.5, hy + 4, '#ffb3cf'); p.px(2.5, hy + 4, '#ffd3e2');
  // el brazo de delante (arriba si lleva al compañero) con la zanahoria de la casa
  const mx = o.br ? 7 : 8.6, my = (o.br ? -23 : -13) + by;
  p.parte(F.tr(3, -17.4 + by, mx, my, 2.1, 1.9), P.pelo, { r: 1.9, sombra: 1 });
  if (!o.br) {
    p.parte(F.tr(mx + 0.5, my - 0.6, mx + 4.5, my - 7, 2, 1), P.capa, { r: 1.8, sombra: 1 });
    p.parte(F.tr(mx + 4.4, my - 7.2, mx + 3, my - 11, 1, 0.6), P.hoja, { r: 1, sombra: 0 });
    p.parte(F.tr(mx + 4.8, my - 7.2, mx + 7, my - 10.6, 1, 0.6), P.hoja, { r: 1, sombra: 0 });
  }
  p.parte(F.ov(mx, my, 2.3, 2.3), P.pelo, { r: 2.2, sombra: 1 });
}

/* ---------- SLYFOX: naranja, barriga crema, cola gorda con la punta blanca, orejas de pico y la capa morada de la serie ---------- */
function zorroIsla(p, o) {
  const P = MAT, f = o.f, s = Math.sin(f * Math.PI * 2), c = Math.cos(f * Math.PI * 2), by = o.by || 0;
  const pa = o.aire ? [-2, -5] : [3 * s, -2 - Math.max(0, -c) * 2], pb = o.aire ? [4, -3] : [-3 * s, -2 - Math.max(0, c) * 2];
  // la cola, detrás: gorda, hacia arriba (al correr, bailando)
  const tx = -11 - c * 1.5, ty = -14 + by - (o.aire ? 6 : 0);
  p.parte(F.fun(2.5, F.ov(-7, -11 + by, 4, 3.6), F.ov(tx - 4, ty - 2, 5.4, 4.4, -0.5), F.ov(tx - 9, ty - 6, 4, 3.6, -0.6)), P.zorro, { r: 4, sombra: 1 });
  p.parte(F.ov(tx - 10, ty - 7, 2.6, 2.4), P.crema, { r: 2.4, linea: false, sombra: 0 });
  // la capa: una cinta morada que cae por la espalda (al aire, vuela)
  const vuela = o.aire ? 1 : 0;
  p.parte(F.cinta([[-2, -22 + by], [-7 - vuela * 4, -17 + by + vuela * 2], [-10 - vuela * 7, -10 + by + vuela * 4]], [2, 3.4, 4.2], 2, 1.6), P.morado, { r: 2.4, sombra: 0 });
  // pata y brazo de atrás
  p.parte(F.ov(pb[0] - 2.5, pb[1], 3.8, 2.2), P.zorroF, { r: 2, sombra: 1 });
  p.parte(F.ov(-2.5, -6.5 + by, 3, 3.2), P.zorroF, { r: 2.8, sombra: 1 });
  p.parte(F.tr(-3, -18 + by, -6.5, (o.br ? -24 : -12) + by, 1.9), P.zorroF, { r: 1.8, sombra: 0 });
  // cuerpo, barriga crema y el nudo de la capa
  p.parte(F.ov(0, -14 + by, 6.8, 8), P.zorro, { r: 6, sombra: 2 });
  p.parte(F.ov(1.6, -13 + by, 4, 5.2), P.crema, { r: 4, linea: false, sombra: 0 });
  p.parte(F.ov(1, -21.4 + by, 4.4, 1.8), P.morado, { r: 1.6, sombra: 1 });
  // pata de delante (la pata de zorro es más corta que la de conejo)
  p.parte(F.ov(2, -6 + by, 3.2, 3.4), P.zorro, { r: 2.8, sombra: 1 });
  p.parte(F.ov(pa[0] + 2.5, pa[1], 4, 2.2), P.zorro, { r: 2, sombra: 1 });
  // cabeza con el hocico largo y la punta blanca
  const hy = -27 + by, craneo = F.ov(2, hy, 8, 7), cabeza = F.fun(2.5, craneo, F.ov(9.4, hy + 2.6, 4.4, 2.8));
  p.parte(cabeza, P.zorro, { r: 6.5, sombra: 2 });
  p.parte(F.ov(10.2, hy + 2.8, 2.6, 2), P.crema, { r: 2, linea: false, sombra: 0 });
  p.px(12.6, hy + 2, P.zorro.c[0]); p.px(12.6, hy + 3, P.zorro.c[0]);
  // la pelusa de la mejilla y las orejas de pico con la punta oscura (al flotar, de punta)
  p.parte(F.pol(-6, hy + 1, -9.5, hy + 4, -5, hy + 5), P.crema, { r: 1.5, linea: false, sombra: 0 });
  const ea = o.flota ? (o.flota === 2 ? 2 : -2) : 0;
  for (const [bx, px, tipo] of [[-3, -6 + ea, P.zorroF], [5, 10 - ea, P.zorro]]) {
    p.parte(F.pol(bx - 3, hy - 5, px, hy - 15, bx + 4, hy - 5.5), tipo, { r: 2, sombra: 1 });
    p.parte(F.pol(bx - 0.5, hy - 9, px, hy - 14.5, bx + 2, hy - 9.5), P.zorroF, { r: 1, linea: false, sombra: 0 });
  }
  // la cara: ojos de listillo (párpados a medias), con el brillo, y la sonrisa de lado
  const T = P.zorro.c[0];
  for (const ex of [1.5, 7.5]) { p.plano(F.ov(ex, hy - 0.8, 2.6, 2.6), T); p.plano(F.ov(ex, hy - 0.8, 1.8, 1.8), '#ffffff'); p.px(ex + 0.6, hy - 0.4, T); p.raya(ex - 2.6, hy - 2.6, ex + 2.6, hy - 2.6, T); p.raya(ex - 2.6, hy - 2.6, ex - 2.6, hy - 1.6, T); }
  p.raya(7, hy + 5.2, 10.6, hy + 4.4, T); p.px(10.6, hy + 3.4, T);
  // el brazo de delante
  const mx = o.br ? 7 : 8.6, my = (o.br ? -23 : -13) + by;
  p.parte(F.tr(3, -17.4 + by, mx, my, 2, 1.8), P.zorro, { r: 1.8, sombra: 1 });
  p.parte(F.ov(mx, my, 2.1, 2.1), P.zorro, { r: 2, sombra: 1 });
}

/* ---------- el becario de Microblizz (el de Fans of Recruit, a escala): caja con pantalla, tarjeta, antena y café ---------- */
function becarioIsla(p, o) {
  const P = MAT, d = o.dy || 0, U = f => F.mueve(f, 0, d);
  for (const [x, l] of [[4, o.la], [-3.4, o.lb]]) {
    p.parte(F.tr(x, -8 + d, x + l, -2.4, 1.7), P.robotO, { r: 1.5, sombra: 0 });
    p.parte(F.fun(1, F.ov(x + l + 1.2, -1.9, 3.3, 2.1), F.ov(x + l - 0.6, -2.6, 2, 1.6)), P.robot, { r: 2, sombra: 1 });
  }
  p.parte(U(F.rr(-12, -31, 20, 24, 4.5)), P.robotO, { r: 3, sombra: 0 });
  const idF = p.parte(U(F.rr(-8.5, -31, 20, 24, 4.5)), P.robot, { r: 3.5, sombra: 2 });
  p.tono(U(F.rr(-6.5, -29.4, 16, 1.6, 0.6)), 1, idF);
  p.parte(U(F.rr(-5.6, -27, 14.4, 10, 2.4)), P.pantalla, { r: 2.5, sombra: 0 });
  const E = '#e8f1ff', ey = -22.4 + d;
  if (o.cara === 'x') for (const cx of [-2.2, 5]) for (let k = -1; k <= 1; k++) { p.px(cx + k, ey + k, E); p.px(cx + k, ey - k, E); }
  else for (const cx of [-2.2, 5]) p.plano(U(F.ov(cx + 0.5, -22.4, 1.8, 2.2)), E);
  p.raya(0.5, -19 + d, 3.5, -19 + d, E);
  p.raya(-4.5, -14.6 + d, 0.8, -10.6 + d, P.rojo.c[3]); p.raya(7.6, -14.6 + d, 2.4, -10.6 + d, P.rojo.c[2]);
  p.parte(U(F.rr(-1.4, -11.4, 6, 5.6, 0.8)), P.blanco, { r: 1, sombra: 1 });
  p.raya(-0.4, -10.2 + d, 3.2, -10.2 + d, P.pantalla.c[3]);
  p.raya(1, -31 + d, 1 + o.ant, -36 + d, P.robotO.c[0]);
  p.parte(F.ov(1.4 + o.ant, -37.6 + d, 2.3, 2.3), P.rojo, { r: 2.3, sombra: 0 });
  const tx = -13.5, ty = -12 + d;
  p.parte(F.tr(-10.6, -19 + d, tx, ty - 0.4, 1.8), P.robotO, { r: 1.5, sombra: 1 });
  p.parte(F.menos(F.ov(tx - 5.4, ty - 2.2, 2.4, 2.4), F.ov(tx - 5.4, ty - 2.2, 1, 1)), P.blanco, { r: 1, sombra: 0 });
  p.parte(F.rr(tx - 5.6, ty - 5.4, 6.6, 6.8, 1.2), P.blanco, { r: 2, sombra: 1 });
  p.raya(tx - 4.4, ty - 4.8, tx - 0.4, ty - 4.8, '#6b3a1c');
  p.parte(F.ov(tx - 0.4, ty - 0.6, 2.4, 2.4), P.robot, { r: 2, sombra: 1 });
  p.parte(F.tr(9.5, -18.6 + d, 14, -12 + d, 1.8), P.robotO, { r: 1.5, sombra: 0 });
  p.parte(F.ov(14.4, -11.6 + d, 2.5, 2.5), P.robot, { r: 2, sombra: 1 });
}

/* ---------- las poses de cada uno, dibujadas una vez ---------- */
function isFoto(dibuja, o, t) { const p = new Pincel(48, 56, 22, 54, t); dibuja(p, Object.assign({}, IS_POSE, o)); return contornoNegro(p.lienzo()); }
function isPosesDe(dibuja) {
  const S = {};
  const juego = (br) => ({
    quieto: [isFoto(dibuja, { br }), isFoto(dibuja, { br, by: 1 })],
    corre: [0, 0.25, 0.5, 0.75].map(f => isFoto(dibuja, { f, br })),
    aire: [isFoto(dibuja, { aire: true, br, oreja: -0.6 })],
    flota: [isFoto(dibuja, { aire: true, br, oreja: -1.25, flota: 1 }), isFoto(dibuja, { aire: true, br, oreja: -0.95, flota: 2 })],
  });
  S.normal = juego(false); S.lleva = juego(true);
  return S;
}
function isSprites() {
  if (IS_SPR.bunny) return IS_SPR;
  IS_SPR.bunny = isPosesDe(conejoIsla); IS_SPR.fox = isPosesDe(zorroIsla);
  const bec = (o) => { const p = new Pincel(34, 32, 16, 30, { sx: 0.62, sy: 0.62 }); becarioIsla(p, Object.assign({ la: 0, lb: 0, ant: 0, cara: '' }, o)); return contornoNegro(p.lienzo()); };
  IS_SPR.becario = { anda: [bec({ la: 2, lb: -2, ant: -1 }), bec({ la: -2, lb: 2, ant: 1 })], x: bec({ cara: 'x', dy: 2 }) };
  return IS_SPR;
}
// qué fotograma le toca al personaje ahora mismo (a IS_C.fps, a tirones)
function isFotogramaDe(p, t) {
  const S = isSprites()[p.def.id], J = p.lleva ? S.lleva : S.normal, k = Math.floor(t * IS_C.fps);
  if (p.estado === 'burbuja') return J.quieto[0];
  if (p.flotando) return J.flota[k % 2];
  if (!p.suelo) return J.aire[0];
  if (Math.abs(p.vx) > 20) return J.corre[Math.floor(p.anim.t * IS_C.fps) % 4];
  return J.quieto[Math.floor(t * 1.6) % 2];
}

/* ---------- pintar ---------- */
function isPintaPersonaje(c, p, camX, t, etiqueta) {
  const s = isFotogramaDe(p, t), cx = Math.round(p.x + p.w / 2 - camX), py = Math.round(p.y + p.h);
  const sq = p.anim.squash, parpadea = p.invulnerable > 0 && Math.floor(t * 14) % 2;
  if (parpadea) c.globalAlpha = 0.45;
  if (p.estado === 'burbuja') c.globalAlpha = 0.9;
  if (Math.abs(sq) > 0.06) {   // squash al saltar y aterrizar: se estira o se aplasta desde los pies
    c.save(); c.translate(cx, py); c.scale(1 - sq * 0.5, 1 + sq); pintaSpr(c, s, 0, 0, p.mira < 0); c.restore();
  } else pintaSpr(c, s, cx, py, p.mira < 0);
  c.globalAlpha = 1;
  if (p.estado === 'burbuja') isPintaBurbuja(c, cx, Math.round(p.y + p.h / 2), t);
  if (p.poder && p.estado === 'normal') isPintaPoder(c, p, camX, t);
  if (etiqueta) escribe(c, etiqueta, cx, p.y - 14, { fuente: 'mini', alin: 'centro', c: '#ffffff' });
}
function isPintaEnemigo(c, e, camX, t) {
  if (!e.vivo) return;
  const S = isSprites().becario, s = e.suelo ? S.anda[Math.floor(e.anim * IS_C.fps * 0.8) % 2] : S.anda[0];
  pintaSpr(c, s, Math.round(e.x + e.w / 2 - camX), Math.round(e.y + e.h), e.mira < 0);
}
function isPintaBurbuja(c, x, y, t) {
  const r = 23 + Math.round(Math.sin(t * 3));
  c.globalAlpha = 0.35; circuloPx(c, x, y, r, '#dff3ff'); c.globalAlpha = 1;
  anilloPx(c, x, y, r, 1, MAT.hilo.c[3]);
  c.fillStyle = '#ffffff'; for (let k = 0; k < 5; k++) c.fillRect(x - r + 6 + k, y - r + 9 - Math.round(k * 0.9), 1, 1);   // el brillo
}
// la zanahoria pequeña del color del poder, sobre la cabeza, con la barra del tiempo que queda; y los efectos de cada poder
const IS_ICONO_PODER = {};
function isIconoPoder(z) {
  if (IS_ICONO_PODER[z]) return IS_ICONO_PODER[z];
  const M = MAT['z' + z[0].toUpperCase() + z.slice(1)] || MAT.capa, p = new Pincel(10, 12, 5, 11);
  p.parte(F.tr(0, -2, 0, -7, 2, 1), M, { r: 1.5, sombra: 0 });
  p.parte(F.tr(-0.4, -7.4, -2, -10, 1, 0.5), MAT.hoja, { r: 1, sombra: 0 }); p.parte(F.tr(0.6, -7.4, 2.2, -10, 1, 0.5), MAT.hoja, { r: 1, sombra: 0 });
  return (IS_ICONO_PODER[z] = contornoNegro(p.lienzo()));
}
function isPintaPoder(c, p, camX, t) {
  const Z = IS_ZANAHORIAS[p.poder.zanahoria], x = Math.round(p.x + p.w / 2 - camX), y = Math.round(p.y) - 18, k = p.poder.resto / p.poder.total;
  pintaSpr(c, isIconoPoder(p.poder.zanahoria), x, y);
  c.fillStyle = '#1a1410'; c.fillRect(x - 7, y + 2, 14, 3); c.fillStyle = Z.color; c.fillRect(x - 6, y + 3, Math.round(12 * k), 1);
  if (p.poder.tipo === 'iman' && p.anim.iman > 0.05 && p.companero) {   // chispas de imán hacia el compañero
    const cx2 = isCentro(p.companero).x - camX, cy2 = isCentro(p.companero).y, n = 7;
    for (let i = 0; i < n; i++) { const u = ((t * 1.5 + i / n) % 1); c.fillStyle = i % 2 ? Z.color : '#ffffff'; c.fillRect(Math.round(x + (cx2 - x) * u), Math.round(y + 18 + (cy2 - y - 18) * u), 2, 2); }
  }
  if (p.poder.tipo === 'escudo') { const g = Math.floor(t * 6) % 2; anilloPx(c, x, Math.round(p.y + p.h / 2) - 4, 22 + g, 1, g ? Z.color : '#fff1b5'); }
  if (p.poder.tipo === 'agua' && p.anim.agua > 0.05) {   // el chorro: gotas en arco por delante
    for (let i = 0; i < 9; i++) { const u = ((t * 2.2 + i * 0.11) % 1), gx = x + p.mira * (6 + u * IS_PODER_C.agua.alcance), gy = p.y + 11 - Math.sin(u * Math.PI) * 16 + u * u * 18; c.fillStyle = i % 3 ? '#9fd4ff' : '#ffffff'; c.fillRect(Math.round(gx), Math.round(gy), 2, 2); }
  }
  if (p.poder.tipo === 'fuego') for (let i = 0; i < 3; i++) {   // chispas en las orejas
    const fx = x + p.mira * (i - 1) * 5, fy = p.y - 20 - ((t * 60 + i * 11) % 14);
    c.fillStyle = i % 2 ? '#ffb13b' : '#ff6a2a'; c.fillRect(Math.round(fx), Math.round(fy), 2, 2);
  }
}
