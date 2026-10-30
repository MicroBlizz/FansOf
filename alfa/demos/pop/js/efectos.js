// Fans of Pop · EFECTOS: lo que hace que el pop se SIENTA. Cada burbuja tiene su propia animación de aplastar y estirar
// (squash & stretch) al cambiar de estado, salen gotitas de gelatina, la pantalla tiembla un pelín, el slime salta fuera
// de su burbuja al liberarlo y el corazón perdido parpadea. Solo estado y avance; el dibujo está en pintar.js.
'use strict';
const PP_FX = { celdas: {}, pulsada: -1, parts: [], temblor: 0, dano: 0, saltos: [], textos: [], entrada: 0, pista: 0 };
function ppFxEntraSala(T) {
  PP_FX.celdas = {}; PP_FX.parts = []; PP_FX.saltos = []; PP_FX.textos = []; PP_FX.pulsada = -1; PP_FX.entrada = 1; PP_FX.temblor = 0;
  for (let i = 0; i < T.up.length; i++) PP_FX.celdas[i] = { t: 9, dir: T.up[i] ? 'sube' : 'pop', demora: (i % T.n + Math.floor(i / T.n)) * 0.045 };
  if (T.pista !== null) { PP_FX.pista = 0.6; play('ppPista'); }
}
function ppFxToque(T, i, r) {
  const n = T.n;
  for (const j of r.pops) { PP_FX.celdas[j] = { t: 0, dir: 'pop', demora: j === i ? 0 : 0.05 }; }
  for (const j of r.subes) { PP_FX.celdas[j] = { t: 0, dir: 'sube', demora: j === i ? 0 : 0.05 }; }
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
  if (r.pasado && !r.castigo) ppFlota(tr('¡Fianza!'), 270, 205, '#ffd64a');
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
function ppFxAvanza(dt) {
  for (const k in PP_FX.celdas) PP_FX.celdas[k].t += dt;
  PP_FX.temblor = Math.max(0, PP_FX.temblor - dt * 2.2);
  PP_FX.dano = Math.max(0, PP_FX.dano - dt * 1.6);
  PP_FX.entrada = Math.max(0, PP_FX.entrada - dt * 1.4);
  PP_FX.pista = Math.max(0, PP_FX.pista - dt);
  for (const p of PP_FX.parts) { p.t += dt; p.vy += 700 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  PP_FX.parts = PP_FX.parts.filter(p => p.t < p.vida);
  for (const s of PP_FX.saltos) s.t += dt;
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
