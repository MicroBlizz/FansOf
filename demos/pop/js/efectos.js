// Fans of Pop · EFECTOS: lo que hace que el pop se SIENTA. Cada burbuja tiene su propia animación de aplastar y estirar
// (squash & stretch) al cambiar de estado, salen gotitas de gelatina, la pantalla tiembla un pelín, el slime salta fuera
// de su burbuja al liberarlo y el corazón perdido parpadea. Solo estado y avance; el dibujo está en pintar.js.
'use strict';
const PP_FX = { celdas: {}, pulsada: -1, parts: [], temblor: 0, dano: 0, saltos: [], textos: [], entrada: 0, pista: 0, vuelos: [], brilla: {}, combo: null, ondas: [] };
function ppFxEntraSala(T) {
  PP_FX.celdas = {}; PP_FX.parts = []; PP_FX.saltos = []; PP_FX.textos = []; PP_FX.vuelos = []; PP_FX.ondas = []; PP_FX.combo = null; PP_FX.pulsada = -1; PP_FX.entrada = 1; PP_FX.temblor = 0;
  for (let i = 0; i < T.up.length; i++) PP_FX.celdas[i] = { t: 9, dir: T.up[i] ? 'sube' : 'pop', demora: (i % T.n + Math.floor(i / T.n)) * 0.045 };
  if (T.pista !== null) { PP_FX.pista = 0.6; play('ppPista'); }
}
function ppFxToque(T, i, r) {
  const n = T.n;
  for (const j of r.pops) { PP_FX.celdas[j] = { t: 0, dir: 'pop', demora: j === i ? 0 : 0.05 }; }
  for (const j of r.subes) { PP_FX.celdas[j] = { t: 0, dir: 'sube', demora: j === i ? 0 : 0.05 }; }
  // las dobles que pierden la nata: rebotan (como al subir) y sueltan nata y virutas
  const gg = ppGeom(n);
  for (const j of r.grietas || []) {
    PP_FX.celdas[j] = { t: 0, dir: 'sube', demora: j === i ? 0 : 0.05 };
    const [cx, cy] = ppCentro(gg, j);
    for (let k = 0; k < 9; k++) { const a = rand(0, Math.PI * 2), v = rand(80, 220); PP_FX.parts.push({ x: cx, y: cy - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 160, r: rand(3, 6), t: 0, vida: rand(0.4, 0.7), col: ['#ffffff', '#fff3d6', '#ff6ec7', '#5be7ff', '#ffd64a'][k % 5] }); }
    setTimeout(() => play('ppUnpop', j), 30);
  }
  // sonidos: el pop de la tocada primero, las vecinas un pelín después
  r.pops.forEach((j, k) => setTimeout(() => play('ppPop', j), j === i ? 0 : 45 + k * 20));
  r.subes.forEach((j, k) => setTimeout(() => play('ppUnpop', j), 60 + k * 20));
  ppVibra(r.pops.length > 2 ? 18 : 10);
  PP_FX.temblor = Math.max(PP_FX.temblor, 0.25 + 0.08 * r.pops.length);
  // gotitas de gelatina desde cada burbuja reventada
  const g = ppGeom(n);
  for (const j of r.pops) {
    const [cx, cy] = ppCentro(g, j), col = T.slimes[j] ? PP_SLIMES[T.slimes[j]].color : null;
    for (let k = 0; k < 7; k++) { const a = rand(0, Math.PI * 2), v = rand(90, 260); PP_FX.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: rand(3, 7), t: 0, vida: rand(0.35, 0.6), col: col || ppColorBurbuja(j, n, 0) }); }
  }
  if (r.hecho) {
    // los slimes salen de sus burbujas de un salto
    for (const j in T.slimes) { const [cx, cy] = ppCentro(g, +j); PP_FX.saltos.push({ id: T.slimes[j], x: cx, y: cy, t: 0 }); }
    for (let k = 0; k < 30; k++) { const a = rand(0, Math.PI * 2), v = rand(120, 380); PP_FX.parts.push({ x: 270, y: g.y + g.lado / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, r: rand(4, 9), t: 0, vida: rand(0.6, 1.1), col: ['#ff6ec7', '#5be7ff', '#ffd64a', '#9dff6e'][k % 4] }); }
    ppVibra([20, 30, 20, 30, 40]);
  }
}
function ppFxDano() { PP_FX.dano = 1; PP_FX.temblor = Math.max(PP_FX.temblor, 0.6); ppFlota(tr('-1 corazón'), 270, 205, '#ff5a5a'); }
function ppFxCura(n) { ppFlota('+' + n, 270, 205, '#7bff7b'); for (let k = 0; k < 12; k++) PP_FX.parts.push({ x: rand(60, 200), y: 92, vx: rand(-30, 30), vy: rand(-120, -40), r: rand(3, 5), t: 0, vida: 0.8, col: '#7bff7b' }); }
function ppFlota(s, x, y, col) { PP_FX.textos.push({ s, x, y, col, t: 0 }); }
// un slime del equipo actúa: su hueco brilla y da un saltito
function ppFxHabilidad(id) { PP_FX.brilla[id] = 1; }
// el letrero de COMBO: crece con cada toque bueno seguido
function ppFxCombo(n) { PP_FX.combo = { n, t: 0 }; ppVibra(8 + n * 4); play('ppCombo', n); }
// un slime vuela desde su hueco del equipo hasta la burbuja i (llega en `dur` segundos)
function ppFxVuelo(id, k, i, n, dur) { const [x0, y0] = ppHuecoEquipo(k, n), [x1, y1] = ppCentro(ppGeom(n), i); PP_FX.vuelos.push({ id, x0, y0, x1, y1, t: 0, dur }); }
// el golpe del slime al llegar: onda, gotitas de colores y temblor (más grande con el CEO)
function ppFxImpacto(T, i, grande) {
  const [cx, cy] = ppCentro(ppGeom(T.n), i);
  PP_FX.ondas.push({ x: cx, y: cy, t: 0, r: grande ? 220 : 120 });
  for (let k = 0; k < (grande ? 40 : 18); k++) { const a = rand(0, Math.PI * 2), v = rand(140, grande ? 520 : 360); PP_FX.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150, r: rand(4, grande ? 11 : 8), t: 0, vida: rand(0.5, 0.9), col: ['#ff6ec7', '#5be7ff', '#ffd64a', '#9dff6e', '#fff'][k % 5] }); }
  PP_FX.temblor = Math.max(PP_FX.temblor, grande ? 1.2 : 0.7);
  ppVibra(grande ? [40, 30, 60] : 30);
}
function ppFxAvanza(dt) {
  for (const k in PP_FX.celdas) PP_FX.celdas[k].t += dt;
  PP_FX.temblor = Math.max(0, PP_FX.temblor - dt * 2.2);
  PP_FX.dano = Math.max(0, PP_FX.dano - dt * 1.6);
  PP_FX.entrada = Math.max(0, PP_FX.entrada - dt * 1.4);
  PP_FX.pista = Math.max(0, PP_FX.pista - dt);
  for (const p of PP_FX.parts) { p.t += dt; p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  PP_FX.parts = PP_FX.parts.filter(p => p.t < p.vida);
  for (const s of PP_FX.saltos) s.t += dt;
  for (const v of PP_FX.vuelos) v.t += dt;
  PP_FX.vuelos = PP_FX.vuelos.filter(v => v.t < v.dur);
  for (const o of PP_FX.ondas) o.t += dt;
  PP_FX.ondas = PP_FX.ondas.filter(o => o.t < 0.45);
  for (const k in PP_FX.brilla) PP_FX.brilla[k] = Math.max(0, PP_FX.brilla[k] - dt * 1.8);
  if (PP_FX.combo) { PP_FX.combo.t += dt; if (PP_FX.combo.t > 1.1) PP_FX.combo = null; }
  for (const x of PP_FX.textos) x.t += dt;
  PP_FX.textos = PP_FX.textos.filter(x => x.t < 1);
}
// aplastar/estirar: devuelve la escala [sx, sy] y la altura (0 = reventada, 1 = arriba) de una burbuja según su animación
function ppAnim(i, up) {
  const a = PP_FX.celdas[i]; if (!a) return [1, 1, up ? 1 : 0];
  const t = Math.max(0, a.t - a.demora);
  if (a.dir === 'pop') {
    // se hunde de golpe, rebota un poco y queda plana
    if (t > 0.42) return [1, 1, 0];
    const h = t < 0.08 ? 1 - t / 0.08 : -Math.sin((t - 0.08) / 0.34 * Math.PI) * 0.18 * (1 - (t - 0.08) / 0.34);
    const sq = t < 0.1 ? 1 + t * 3 : 1 + 0.3 * (1 - (t - 0.1) / 0.32);
    return [sq, 1, Math.max(-0.2, h)];
  }
  // sube: asoma estirada y rebota como gelatina
  if (t > 0.6) return [1, 1, 1];
  const k = t / 0.6, h = 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) ;
  const sy = 1 + Math.sin(k * Math.PI * 3) * 0.22 * (1 - k), sx = 2 - sy;
  return [sx, sy, Math.min(1.25, Math.max(0, h))];
}
