// Fans of Shelter · EL SUELO Y LO QUE HAY ENCIMA. El suelo son WANG TILES (img/wang_hierba, wang_tierra, wang_agua: 16 losas cada una cuyos
// bordes casan, y wang_mascaras: 16 máscaras de transición por esquinas; herramientas/comfyui/shelter_wang.py). La hierba va de base;
// la tierra del claro y el agua del lago se pintan encima con la máscara de sus esquinas y un filo oscuro, así el borde es irregular y sin
// escalón de casillas. Cada casilla elige su losa por los colores de sus bordes (un número fijo por borde), así nunca se ve un patrón.
// Lo que tiene altura (árboles, pinos, rocas, mesa, refugio…) son sprites de img/ que se ordenan por los pies con los personajes.
'use strict';

const LOSA_CACHE = new Map();
// el color (0 o 1) de cada borde: horizontal (h) entre (i, j-1) y (i, j); vertical (v) entre (i-1, j) y (i, j). Siempre el mismo
const colorBorde = (i, j, tipo) => (hash2(i, j, tipo === 'h' ? 41 : 43) < 0.5 ? 0 : 1);
const indiceBordes = (i, j) => colorBorde(i, j, 'h') + colorBorde(i + 1, j, 'v') * 2 + colorBorde(i, j + 1, 'h') * 4 + colorBorde(i, j, 'v') * 8;

// la losa k (0..15) de una hoja de 4 × 4
function trozo(im, k, x, y, ctx) { ctx.drawImage(im, (k % 4) * CAS, (k >> 2) * CAS, CAS, CAS, x, y, CAS, CAS); }

// ¿la esquina de arriba a la izquierda de la casilla (i, j) es de este terreno? Lo es si lo son al menos 2 de las 4 casillas que la tocan
function esquina(i, j, t) { let n = 0; for (const [a, b] of [[i - 1, j - 1], [i, j - 1], [i - 1, j], [i, j]]) if (terreno(a, b) === t) n++; return n >= 2 ? 1 : 0; }
const indiceEsquinas = (i, j, t) => esquina(i, j, t) + esquina(i + 1, j, t) * 2 + esquina(i + 1, j + 1, t) * 4 + esquina(i, j + 1, t) * 8;

// la casilla de suelo ya compuesta (hierba + tierra + agua con sus máscaras y filos), guardada por su combinación
function losaSuelo(i, j) {
  const kb = indiceBordes(i, j), kt = indiceEsquinas(i, j, 'tierra'), ka = indiceEsquinas(i, j, 'agua');
  const clave = kb + '|' + kt + '|' + ka;
  let c = LOSA_CACHE.get(clave); if (c) return c;
  c = document.createElement('canvas'); c.width = CAS; c.height = CAS;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  trozo(IMG.wang_hierba, kb, 0, 0, g);
  capaTerreno(g, IMG.wang_tierra, kb, kt, '#5c3c20');
  capaTerreno(g, IMG.wang_agua, kb, ka, '#28467a');
  LOSA_CACHE.set(clave, c);
  return c;
}
// un terreno encima: su losa recortada por la máscara de las esquinas (canal alfa) y el filo oscuro (canal verde de la máscara)
function capaTerreno(g, hoja, kb, ke, colorFilo) {
  if (!ke) return;
  const t = document.createElement('canvas'); t.width = CAS; t.height = CAS;
  const tg = t.getContext('2d');
  trozo(hoja, kb, 0, 0, tg);
  tg.globalCompositeOperation = 'destination-in'; trozo(IMG.wang_mascaras, ke, 0, 0, tg);
  g.drawImage(t, 0, 0);
  if (ke === 15) return;
  const f = document.createElement('canvas'); f.width = CAS; f.height = CAS;
  const fg = f.getContext('2d');
  trozo(IMG.wang_mascaras, ke, 0, 0, fg);
  const d = fg.getImageData(0, 0, CAS, CAS), px = d.data, [r, gg, b] = [1, 3, 5].map(k => parseInt(colorFilo.substr(k, 2), 16));
  for (let p = 0; p < px.length; p += 4) { const a = px[p + 1]; px[p] = r; px[p + 1] = gg; px[p + 2] = b; px[p + 3] = a; }
  fg.putImageData(d, 0, 0);
  g.drawImage(f, 0, 0);
}

/* ---------- PINTAR: solo lo que cabe en la cámara ---------- */
function rangoCamara(cam, margen) {
  return [Math.max(0, Math.floor(cam.x / CAS) - margen), Math.max(0, Math.floor(cam.y / CAS) - margen),
    Math.min(MAPA.w - 1, Math.floor((cam.x + cam.w) / CAS) + margen), Math.min(MAPA.h - 1, Math.floor((cam.y + cam.h) / CAS) + margen + 2)];
}
function pintaSuelo(ctx, cam) {
  const [i0, j0, i1, j1] = rangoCamara(cam, 0);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const x = i * CAS - cam.x, y = j * CAS - cam.y, c = MAPA.t[j][i];
    ctx.drawImage(losaSuelo(i, j), x, y);
    if (c === 'S') pintaSpr(ctx, MAPA.puertaAbierta ? 'interruptor_1' : 'interruptor_0', x + CAS / 2, y + CAS / 2 + 2, { ancla: 'centro' });
    else if (c === 't') pintaSpr(ctx, 'tocon', x + CAS / 2, y + CAS - 4, { ancla: 'pies' });
  }
  for (const o of MAPA.construido) if (o.tipo === 'trampa') pintaSpr(ctx, 'trampa', (o.i + 0.5) * CAS - cam.x, (o.j + 1) * CAS - 4 - cam.y, { ancla: 'pies' });
}

// qué sprite lleva cada letra con altura, y cuánto se levantan sus pies del borde de abajo de la casilla
const ALTURA = {
  '#': { s: 'pino', pie: 2, sombra: 1 }, T: { s: 'arbol', pie: 3, sombra: 1 }, R: { s: 'roca', pie: 4 }, I: { s: 'mena', pie: 4 },
  B: { s: 'bloque', pie: 1 }, M: { s: 'mesa', pie: 3 }, H: { s: 'hoguera_0', pie: 4 }, D: { s: 'puerta', pie: 0 },
};
// lo que tiene altura se pinta ordenado por su pie, mezclado con los personajes: devuelve una lista de { y, pinta }
function cosasConAltura(cam) {
  const lista = [], [i0, j0, i1, j1] = rangoCamara(cam, 2);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const c = MAPA.t[j][i];
    let a = ALTURA[c];
    if (c === 'C') a = { s: MAPA.cofreAbierto ? 'cofre_1' : 'cofre_0', pie: 4 };
    if (c === 'D' && MAPA.puertaAbierta) a = null;
    if (!a) continue;
    const k = i + ',' + j, tiembla = MAPA.tiembla && MAPA.tiembla.k === k ? Math.round(Math.sin(MAPA.tiembla.t * 60)) : 0;
    const x = (i + 0.5) * CAS - cam.x + (c === '#' ? Math.round((hash2(i, j, 5) - 0.5) * 8) : 0), y = (j + 1) * CAS - a.pie - cam.y;
    lista.push({ y: (j + 1) * CAS, cx: (i + 0.5) * CAS, tapa: c === 'T' || c === '#', pinta: g => {
      if (a.sombra) { g.globalAlpha = 0.22; caja(g, x - CAS / 2 + 4, y - 3, CAS - 8, 4, PALETA.K); g.globalAlpha = 1; }
      pintaSpr(g, a.s, x + tiembla, y, { ancla: 'pies' });
    } });
  }
  if (MAPA.refugio) lista.push({ y: (MAPA.refugio.j + 1) * CAS, pinta: g => pintaRefugio(g, cam) });
  for (const o of MAPA.construido) if (o.tipo === 'torreta') lista.push({ y: (o.j + 1) * CAS, pinta: g => pintaSpr(g, 'torreta', (o.i + 0.5) * CAS - cam.x, (o.j + 1) * CAS - 4 - cam.y, { ancla: 'pies' }) });
  return lista;
}
