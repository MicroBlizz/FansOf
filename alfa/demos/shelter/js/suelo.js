// Fans of Shelter · EL SUELO: las casillas (CAS píxeles) se dibujan con código, con textura y relieve según los vecinos: la hierba
// con matas y flores, la tierra del refugio con su borde, el agua con espuma donde toca tierra, y los acantilados con su tapa de arriba,
// su cara y la sombra que echan sobre la casilla de abajo. Cada casilla distinta se pinta una vez y se guarda.
'use strict';

const SUELO_CACHE = new Map();
const PC = PALETA;

// un lienzo de casilla pintado por fn(g) y guardado con esa clave
function losa(clave, fn) {
  let c = SUELO_CACHE.get(clave); if (c) return c;
  c = document.createElement('canvas'); c.width = CAS; c.height = CAS;
  fn(c.getContext('2d'), c); SUELO_CACHE.set(clave, c);
  return c;
}
const pxs = (g, x, y, color) => { g.fillStyle = color; g.fillRect(x, y, 1, 1); };
// si hay textura de Yoshi (img/suelo_*.png, 96 × 96 = 4 × 4 casillas), pinta la casilla v (0..15) de ella y devuelve true
function baseTextura(g, nombre, v) {
  const im = IMG[nombre]; if (!im) return false;
  const n = Math.floor(im.width / CAS) || 1, i = v % n, j = Math.floor(v / n) % n;
  g.imageSmoothingEnabled = false; g.drawImage(im, i * CAS, j * CAS, CAS, CAS, 0, 0, CAS, CAS);
  return true;
}

// la hierba: base con manchas suaves de dos tonos, briznas y alguna flor (variante v = 0..7)
function losaHierba(v) {
  return losa('h' + v, g => {
    if (baseTextura(g, 'suelo_hierba', v)) return;
    g.fillStyle = PC.G; g.fillRect(0, 0, CAS, CAS);
    for (let j = 0; j < CAS; j++) for (let i = 0; i < CAS; i++) {
      const r = hash2(i + v * 37, j + v * 91, 3);
      if (r < 0.06) pxs(g, i, j, PC.G2); else if (r > 0.965) pxs(g, i, j, PC.H);
    }
    // matas de hierba: una «v» de tres píxeles claros
    for (let k = 0; k < 3; k++) {
      const x = 2 + Math.floor(hash2(v, k, 5) * (CAS - 5)), y = 2 + Math.floor(hash2(k, v, 6) * (CAS - 4));
      pxs(g, x, y + 1, PC.H); pxs(g, x + 1, y, PC.H); pxs(g, x + 2, y + 1, PC.H); pxs(g, x + 1, y + 1, PC.G2);
    }
    if (v === 2 || v === 5) { const x = 6 + v, y = 8 + v; pxs(g, x, y, PC.Y); pxs(g, x + 1, y, PC.W); pxs(g, x, y + 1, PC.W); pxs(g, x - 1, y, PC.W); pxs(g, x, y - 1, PC.W); }
    if (v === 7) { const x = 14, y = 15; pxs(g, x, y, PC.p); pxs(g, x + 1, y, PC.P); pxs(g, x, y + 1, PC.P); pxs(g, x - 1, y, PC.P); pxs(g, x, y - 1, PC.P); }
  });
}
// la tierra del refugio: motas y piedrecitas; bordes redondeados hacia la hierba (vecinos: arriba, derecha, abajo, izquierda = 1 si es hierba)
function losaTierra(v, ar, de, ab, iz) {
  return losa('t' + v + ar + de + ab + iz, g => {
    if (!baseTextura(g, 'suelo_tierra', v)) {
      g.fillStyle = PC.T; g.fillRect(0, 0, CAS, CAS);
      for (let j = 0; j < CAS; j++) for (let i = 0; i < CAS; i++) {
        const r = hash2(i + v * 13, j + v * 7, 9);
        if (r < 0.05) pxs(g, i, j, PC.B); else if (r > 0.975) pxs(g, i, j, '#dcae72');
      }
    }
    // el borde con la hierba: una línea de tierra oscura y hierba que invade un poco
    g.fillStyle = PC.b;
    if (ar) g.fillRect(0, 0, CAS, 1); if (ab) g.fillRect(0, CAS - 1, CAS, 1); if (iz) g.fillRect(0, 0, 1, CAS); if (de) g.fillRect(CAS - 1, 0, 1, CAS);
    g.fillStyle = PC.G;
    if (ar) for (let i = 0; i < CAS; i += 3) if (hash2(i, v, 2) < 0.5) g.fillRect(i, 0, 2, 2);
    if (ab) for (let i = 1; i < CAS; i += 3) if (hash2(i, v, 4) < 0.5) g.fillRect(i, CAS - 2, 2, 2);
    if (iz) for (let j = 0; j < CAS; j += 3) if (hash2(v, j, 8) < 0.5) g.fillRect(0, j, 2, 2);
    if (de) for (let j = 1; j < CAS; j += 3) if (hash2(v, j, 1) < 0.5) g.fillRect(CAS - 2, j, 2, 2);
  });
}
// el agua: ondas que se mueven (fase 0..3) y espuma clara donde toca tierra
function losaAgua(fase, ar, de, ab, iz) {
  return losa('a' + fase + ar + de + ab + iz, g => {
    g.fillStyle = PC.A; g.fillRect(0, 0, CAS, CAS);
    const conTextura = baseTextura(g, 'suelo_agua', fase);
    if (!conTextura) for (let k = 0; k < 6; k++) {
      const y = (3 + k * 4 + fase) % CAS, x = (2 + k * 7 + fase * 2) % CAS;
      g.fillStyle = k % 2 ? PC.Z : PC.a; g.fillRect(x, y, 4, 1); g.fillRect((x + 10) % CAS, (y + 2) % CAS, 2, 1);
    }
    g.fillStyle = PC.Z;
    if (ar) { g.fillRect(0, 0, CAS, 2); for (let i = fase; i < CAS; i += 4) g.fillRect(i, 2, 2, 1); }
    if (ab) { g.fillRect(0, CAS - 2, CAS, 2); for (let i = fase; i < CAS; i += 4) g.fillRect(i, CAS - 3, 2, 1); }
    if (iz) { g.fillRect(0, 0, 2, CAS); } if (de) { g.fillRect(CAS - 2, 0, 2, CAS); }
    g.fillStyle = PC.a;
    if (ar) g.fillRect(0, 3, CAS, 1); if (iz) g.fillRect(3, 0, 1, CAS);
  });
}
// un acantilado: la tapa (si arriba no hay pared, se ve la hierba de encima con su borde) y la cara de roca
function losaPared(v, ar, ab) {
  return losa('p' + v + ar + ab, g => {
    if (!baseTextura(g, 'suelo_roca', v)) {
      g.drawImage(spr('pared'), 0, 0);
      for (let j = 0; j < CAS; j++) for (let i = 0; i < CAS; i++) if (hash2(i + v, j, 21) < 0.04) pxs(g, i, j, PC.B);
    }
    if (!ar) {   // la tapa: hierba oscura con un borde de luz y la arista
      if (IMG.suelo_hierba) g.drawImage(IMG.suelo_hierba, 0, 0, CAS, 7, 0, 0, CAS, 7);
      else { g.fillStyle = PC.G2; g.fillRect(0, 0, CAS, 7); g.fillStyle = PC.G; g.fillRect(0, 0, CAS, 5); for (let i = 0; i < CAS; i++) if (hash2(i, v, 22) < 0.3) pxs(g, i, 2 + Math.floor(hash2(v, i, 23) * 3), PC.H); }
      g.fillStyle = PC.K; g.fillRect(0, 7, CAS, 1); g.fillStyle = PC.T; g.fillRect(0, 8, CAS, 1);
    }
    if (!ab) { g.fillStyle = PC.K; g.fillRect(0, CAS - 1, CAS, 1); g.fillStyle = PC.u; g.fillRect(0, CAS - 3, CAS, 2); }
  });
}

// el borde de una meseta: una franja de roca (la cara que se ve) con su línea de tinta y un filo de luz en la hierba de arriba
function pintaBorde(ctx, c, x, y) {
  const roca = IMG.suelo_roca;
  const cara = (rx, ry, rw, rh) => { if (roca) ctx.drawImage(roca, 0, 0, rw, rh, rx, ry, rw, rh); else { ctx.fillStyle = PC.b; ctx.fillRect(rx, ry, rw, rh); } };
  ctx.fillStyle = PC.K;
  if (c === 'e') { cara(x + CAS - 6, y, 6, CAS); ctx.fillRect(x + CAS - 7, y, 1, CAS); ctx.fillStyle = PC.H; ctx.fillRect(x + CAS - 9, y, 2, CAS); ctx.fillStyle = PC.u; ctx.fillRect(x + CAS - 2, y, 2, CAS); }
  else if (c === 'w') { cara(x, y, 6, CAS); ctx.fillRect(x + 6, y, 1, CAS); ctx.fillStyle = PC.H; ctx.fillRect(x + 7, y, 2, CAS); ctx.fillStyle = PC.u; ctx.fillRect(x, y, 2, CAS); }
  else { ctx.fillRect(x, y, CAS, 1); ctx.fillStyle = PC.G2; ctx.fillRect(x, y + 1, CAS, 2); ctx.fillStyle = PC.H; ctx.fillRect(x, y + 3, CAS, 2); }
}
// la escalera de piedra que sube a la meseta: peldaños con sus sombras, entre dos muretes
function pintaEscalera(ctx, x, y, sigueArriba) {
  ctx.fillStyle = PC.S; ctx.fillRect(x + 2, y, CAS - 4, CAS);
  for (let k = 0; k < CAS; k += 6) { ctx.fillStyle = PC.t; ctx.fillRect(x + 2, y + k, CAS - 4, 1); ctx.fillStyle = PC.s; ctx.fillRect(x + 2, y + k + 4, CAS - 4, 2); }
  ctx.fillStyle = PC.K; ctx.fillRect(x, y, 2, CAS); ctx.fillRect(x + CAS - 2, y, 2, CAS);
  if (!sigueArriba) { ctx.fillStyle = PC.K; ctx.fillRect(x, y, CAS, 1); }
}

/* ---------- PINTAR: el suelo y lo que hay encima, solo lo que cabe en la cámara ---------- */
function pintaSuelo(ctx, cam, t) {
  const i0 = Math.max(0, Math.floor(cam.x / CAS)), j0 = Math.max(0, Math.floor(cam.y / CAS));
  const i1 = Math.min(MAPA.w - 1, Math.floor((cam.x + cam.w) / CAS)), j1 = Math.min(MAPA.h - 1, Math.floor((cam.y + cam.h) / CAS));
  const fase = Math.floor(t * 3) % 4;
  const esTierra = (i, j) => { const c = casilla(i, j); return c === '_' || c === 'M' || c === 'H' || (MAPA_BASE[j] && MAPA_BASE[j][i] === '_'); };
  const esAgua = (i, j) => casilla(i, j) === '~';
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const c = MAPA.t[j][i], x = i * CAS - cam.x, y = j * CAS - cam.y, v = Math.floor(hash2(i, j, 7) * 16);
    let losaC;
    if (c === '~') losaC = losaAgua(fase, +!esAgua(i, j - 1), +!esAgua(i + 1, j), +!esAgua(i, j + 1), +!esAgua(i - 1, j));
    else if (c === '#') losaC = losaPared(v, +(casilla(i, j - 1) === '#'), +(casilla(i, j + 1) === '#'));
    else if (esTierra(i, j)) losaC = losaTierra(v, +!esTierra(i, j - 1), +!esTierra(i + 1, j), +!esTierra(i, j + 1), +!esTierra(i - 1, j));
    else losaC = losaHierba(v);
    ctx.drawImage(losaC, x, y);
    if (c === 'n' || c === 'e' || c === 'w') pintaBorde(ctx, c, x, y);
    else if (c === 's') pintaEscalera(ctx, x, y, casilla(i, j - 1) === 's' || casilla(i, j - 1) === '#' || casilla(i, j - 1) === 'n');
    // la sombra que echa un borde de meseta sobre el suelo bajo de al lado
    if (casilla(i - 1, j) === 'e' && c !== 'e') { ctx.fillStyle = 'rgba(20,12,40,0.3)'; ctx.fillRect(x, y, 5, CAS); ctx.fillStyle = 'rgba(20,12,40,0.15)'; ctx.fillRect(x + 5, y, 3, CAS); }
    if (casilla(i + 1, j) === 'w' && c !== 'w') { ctx.fillStyle = 'rgba(20,12,40,0.3)'; ctx.fillRect(x + CAS - 5, y, 5, CAS); ctx.fillStyle = 'rgba(20,12,40,0.15)'; ctx.fillRect(x + CAS - 8, y, 3, CAS); }
    // la sombra que echa un acantilado sobre lo que tiene debajo
    if (c !== '#' && casilla(i, j - 1) === '#') { ctx.fillStyle = 'rgba(20,12,40,0.35)'; ctx.fillRect(x, y, CAS, 5); ctx.fillStyle = 'rgba(20,12,40,0.18)'; ctx.fillRect(x, y + 5, CAS, 3); }
    if (c === 'S') pintaSpr(ctx, MAPA.puertaAbierta ? 'interruptor_1' : 'interruptor_0', x + CAS / 2, y + CAS / 2, { ancla: 'centro' });
    else if (c === 't') pintaSpr(ctx, 'tocon', x + CAS / 2, y + CAS - 2, { ancla: 'pies' });
    else if (c === 'D' && !MAPA.puertaAbierta) pintaSpr(ctx, 'puerta', x + CAS / 2, y + CAS, { ancla: 'pies' });
  }
  for (const o of MAPA.construido) if (o.tipo === 'trampa') pintaSpr(ctx, 'trampa', (o.i + 0.5) * CAS - cam.x, (o.j + 1) * CAS - 2 - cam.y, { ancla: 'pies' });
}
// lo que tiene altura se pinta ordenado por su pie, mezclado con los personajes: devuelve una lista de { y, pinta }
function cosasConAltura(cam, t) {
  const lista = [];
  const i0 = Math.max(0, Math.floor(cam.x / CAS) - 1), j0 = Math.max(0, Math.floor(cam.y / CAS) - 1);
  const i1 = Math.min(MAPA.w - 1, Math.floor((cam.x + cam.w) / CAS) + 1), j1 = Math.min(MAPA.h - 1, Math.floor((cam.y + cam.h) / CAS) + 2);
  const fuego = Math.floor(t * 6) % 2;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const c = MAPA.t[j][i], x = i * CAS - cam.x, y = j * CAS - cam.y, k = i + ',' + j;
    const tiembla = MAPA.tiembla && MAPA.tiembla.k === k ? Math.round(Math.sin(MAPA.tiembla.t * 60)) : 0;
    // cada cosa se ancla por los pies en el centro de su casilla (pie = un poco por encima del borde de abajo), mida lo que mida
    let s = null, pie = 2, sombra = 0;
    if (c === 'T') { s = 'arbol'; pie = 1; sombra = 1; }
    else if (c === 'R') { s = 'roca'; pie = 1; }
    else if (c === 'I') { s = 'mena'; pie = 1; }
    else if (c === 'B') { s = 'bloque'; pie = 0; }
    else if (c === 'M') s = 'mesa';
    else if (c === 'H') { s = 'hoguera_' + fuego; pie = 1; }
    else if (c === 'C') { s = MAPA.cofreAbierto ? 'cofre_1' : 'cofre_0'; pie = 1; }
    if (s) lista.push({ y: (j + 1) * CAS, cx: (i + 0.5) * CAS, tapa: c === 'T', pinta: ctx => {
      if (sombra) { ctx.globalAlpha = 0.25; ctx.fillStyle = PC.K; ctx.fillRect(x + 3, y + CAS - 4, CAS - 6, 3); ctx.globalAlpha = 1; }
      pintaSpr(ctx, s, x + CAS / 2 + tiembla, y + CAS - pie, { ancla: 'pies' });
    } });
  }
  for (const o of MAPA.construido) if (o.tipo === 'torreta') lista.push({ y: (o.j + 1) * CAS, pinta: ctx => pintaSpr(ctx, 'torreta', (o.i + 0.5) * CAS - cam.x, (o.j + 1) * CAS - 2 - cam.y, { ancla: 'pies' }) });
  return lista;
}
