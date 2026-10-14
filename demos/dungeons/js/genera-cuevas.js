// Fans of Dungeons · Receta B del generador: el archivo del Cementerio de juegos, por autómata celular. Se rellena al azar,
// se repasa con una regla fija hasta que quedan huecos redondeados, se deja solo el hueco grande (los demás se unen con
// túneles) y se incrustan criptas: salas rectangulares para los tesoros y el jefe. Las «salas» son los ensanchamientos.
'use strict';

function generaCuevas(m, d) {
  const w = m.w, h = m.h;
  let a = new Uint8Array(w * h);
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) a[j * w + i] = d.prob(0.55) ? 1 : 0;   // 1 = suelo
  // cinco repasos: muro si tiene 5 o más muros alrededor, suelo si 3 o menos
  for (let paso = 0; paso < 5; paso++) {
    const b = new Uint8Array(w * h);
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      let muros = 0;
      for (const [dx, dy] of DIRS8) if (!a[(j + dy) * w + i + dx]) muros++;
      b[j * w + i] = muros >= 5 ? 0 : muros <= 3 ? 1 : a[j * w + i];
    }
    a = b;
  }
  for (let k = 0; k < w * h; k++) m.t[k] = a[k] ? T.SUELO : T.MURO;
  // las zonas de suelo separadas: se quedan las grandes unidas con túneles; las minúsculas se tapan
  const zonaDeCasilla = new Int16Array(w * h).fill(-1), zonas = [];
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
    if (enM(m, i, j) !== T.SUELO || zonaDeCasilla[j * w + i] >= 0) continue;
    const id = zonas.length, cas = [], cola = [[i, j]]; zonaDeCasilla[j * w + i] = id;
    while (cola.length) {
      const [x, y] = cola.pop(); cas.push([x, y]);
      for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (enM(m, nx, ny) === T.SUELO && zonaDeCasilla[ny * w + nx] < 0) { zonaDeCasilla[ny * w + nx] = id; cola.push([nx, ny]); } }
    }
    zonas.push(cas);
  }
  zonas.sort((p, q) => q.length - p.length);
  for (let z = 1; z < zonas.length; z++) {
    const cas = zonas[z];
    if (cas.length < 12) { for (const [x, y] of cas) ponM(m, x, y, T.MURO); continue; }
    const [x0, y0] = d.elige(cas), [x1, y1] = d.elige(zonas[0]);
    pasillo(m, x0, y0, x1, y1, d);
  }
  // criptas: dos o tres salas rectangulares incrustadas, unidas a la cueva con un pasillo
  const criptas = d.entre(2, 3);
  for (let n = 0; n < criptas; n++) {
    const cw = d.entre(6, 9), ch = d.entre(5, 7), cx = d.entre(2, w - cw - 3), cy = d.entre(2, h - ch - 3);
    rellenaM(m, cx - 1, cy - 1, cw + 2, ch + 2, T.MURO);
    rellenaM(m, cx, cy, cw, ch, T.SUELO);
    const sala = { x: cx, y: cy, w: cw, h: ch, cx: cx + Math.floor(cw / 2), cy: cy + Math.floor(ch / 2), tipo: 'cripta' };
    m.salas.push(sala);
    const [tx, ty] = d.elige(zonas[0]);
    pasillo(m, sala.cx, sala.cy, tx, ty, d);
  }
  // los ensanchamientos de la cueva cuentan como salas (para repartir cosas): se buscan cuadrados de 5 × 5 de suelo
  const usados = new Uint8Array(w * h);
  for (let j = 1; j < h - 5; j++) for (let i = 1; i < w - 5; i++) {
    if (usados[j * w + i] || m.salas.some(s => i >= s.x - 2 && j >= s.y - 2 && i < s.x + s.w + 2 && j < s.y + s.h + 2)) continue;
    let lleno = true;
    for (let y = j; y < j + 5 && lleno; y++) for (let x = i; x < i + 5; x++) if (enM(m, x, y) !== T.SUELO) { lleno = false; break; }
    if (!lleno) continue;
    const sala = { x: i, y: j, w: 5, h: 5, cx: i + 2, cy: j + 2, tipo: 'hueco' };
    m.salas.push(sala);
    for (let y = j - 3; y < j + 8; y++) for (let x = i - 3; x < i + 8; x++) if (dentroM(m, x, y)) usados[y * w + x] = 1;
  }
}
