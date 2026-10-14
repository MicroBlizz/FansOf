// Fans of Dungeons · La visión: lo que el héroe ve (radio y línea de visión, sin muros en medio) y lo que recuerda. Se
// recalcula después de cada acción. Las casillas vistas quedan en el mapa (vis: 2 a la vista, 1 recordada).
'use strict';

function calculaVision(m, x0, y0, radio) {
  for (let k = 0; k < m.vis.length; k++) if (m.vis[k] === 2) m.vis[k] = 1;
  const ve = (x, y) => { if (dentroM(m, x, y)) m.vis[y * m.w + x] = 2; };
  ve(x0, y0);
  const r2 = (radio + 0.5) * (radio + 0.5);
  const borde = [];
  for (let i = -radio; i <= radio; i++) { borde.push([x0 + i, y0 - radio], [x0 + i, y0 + radio], [x0 - radio, y0 + i], [x0 + radio, y0 + i]); }
  for (const [tx, ty] of borde) {
    for (const [x, y] of linea(x0, y0, tx, ty)) {
      const dx = x - x0, dy = y - y0;
      if (dx * dx + dy * dy > r2) break;
      ve(x, y);
      if (opacoM(m, x, y)) break;
    }
  }
  // las casillas pegadas al héroe se ven siempre (y las esquinas de los muros se rellenan para que no queden feas)
  for (const [dx, dy] of DIRS8) ve(x0 + dx, y0 + dy);
  for (let j = 1; j < m.h - 1; j++) for (let i = 1; i < m.w - 1; i++) {
    const k = j * m.w + i;
    if (m.vis[k] === 2 || m.t[k] !== T.MURO) continue;
    let vecinoVisto = false;
    for (const [dx, dy] of DIRS8) { const nk = (j + dy) * m.w + i + dx; if (m.vis[nk] === 2 && m.t[nk] !== T.MURO) { vecinoVisto = true; break; } }
    if (vecinoVisto && (i - x0) * (i - x0) + (j - y0) * (j - y0) <= r2) m.vis[k] = 2;
  }
  // las trampas se ven de cerca con buena visión
  for (const [k, t] of m.trampas) { const tx = k % 1000, ty = Math.floor(k / 1000); if (!t.vista && m.vis[ty * m.w + tx] === 2 && pasos(tx, ty, x0, y0) <= Math.max(1, radio - 6)) { t.vista = true; log(tr('Ves una trampa en el suelo.'), '#ffd040'); } }
}
// ¿hay línea de visión entre dos casillas (sin muros en medio)?
function veDesde(m, x0, y0, x1, y1) {
  const l = linea(x0, y0, x1, y1);
  for (let i = 0; i < l.length - 1; i++) if (opacoM(m, l[i][0], l[i][1])) return false;
  return true;
}
