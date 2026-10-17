// Fans of Nova · Armas de las naves enemigas: usan los mismos portadores y cargas que las tuyas (railgun, flak, láser y lanzador).
// Cada arma cuesta puntos según su tamaño (S 1, M 2, L 4) y una nave de rango k tiene 1 + 0,7·(k-1); se reparten por sus anclajes.
// El alcance sale de la pantalla (los de más alcance, railgun y misil, llegan casi al borde; la flak, a un tercio) y nada dispara desde fuera.
// Los misiles se pueden derribar con armas cinéticas (nvMisilCerca / nvChocaMisil, que usa armas.js).
'use strict';
// fr: alcance en fracción de media pantalla · cada: segundos entre disparos · dps: daño por segundo y por punto · n: balas por disparo
const NV_ARMA_E = {
  railgun: { fr: 0.95, cada: 3.0, dps: 1.1, n: 1, v: 950, r: 3.5, cargas: ['cinetica', 'energia'] },
  flak: { fr: 0.4, cada: 2.0, dps: 1.1, n: 5, v: 380, r: 3, cargas: ['cinetica', 'termica'] },
  laser: { fr: 0.62, cada: 1.1, dps: 0.9, n: 1, v: 0, r: 0, cargas: ['energia', 'termica'] },
  lanzador: { fr: 0.95, cada: 4.2, dps: 1.1, n: 1, v: 210, r: 5.5, giro: 1.5, cargas: ['explosiva', 'termica'] }
};
const NV_TAM_E = { S: { c: 1, fr: 0.85, cada: 1, r: 1 }, M: { c: 2, fr: 1, cada: 1.15, r: 1.3 }, L: { c: 4, fr: 1.1, cada: 1.3, r: 1.7 } };
const NV_DOCTRINA_E = { rastrero: ['flak', 'laser'], fusilero: ['railgun', 'laser'], sepulturero: ['lanzador', 'railgun', 'flak'] };   // qué suele llevar cada tipo

function nvArmasEnemigo(tipo, rango) {
  const anc = NV_ANCLAJES[tipo];
  if (!anc) return null;
  let resto = Math.round(1 + 0.7 * (rango - 1));
  const modos = [[4, 0.6, 0], [2, 3, 0.4], [0.5, 2, 3], [3, 2, 1]], w = modos[Math.floor(Math.random() * modos.length)], lista = [];
  const libres = anc.slice().sort(() => Math.random() - 0.5), doc = NV_DOCTRINA_E[tipo] || Object.keys(NV_ARMA_E), TT = ['S', 'M', 'L'];
  while (resto > 0 && lista.length < anc.length) {
    const op = TT.filter((t, i) => NV_TAM_E[t].c <= resto && w[i] > 0), tot = op.reduce((a, t) => a + w[TT.indexOf(t)], 0);
    let q = Math.random() * tot, t = op[0];
    for (const o of op) { q -= w[TT.indexOf(o)]; if (q <= 0) { t = o; break; } }
    resto -= NV_TAM_E[t].c;
    const a = libres[lista.length], por = doc[Math.floor(Math.random() * doc.length)], cs = NV_ARMA_E[por].cargas;
    lista.push({ tam: t, portador: por, carga: cs[Math.floor(Math.random() * cs.length)], ax: a[0], ay: a[1], cd: 0.5 + Math.random() * 2 });
  }
  return lista;
}
// Alcance de un arma enemiga: sale del tamaño de la pantalla, no de la nave.
function nvAlcE(S, w) { return nvMediaPantalla(S)[0] * Math.min(0.97, NV_ARMA_E[w.portador].fr * NV_TAM_E[w.tam].fr); }
function nvAlcMaxE(S, e) { return e.armas.reduce((m, w) => Math.max(m, nvAlcE(S, w)), 0); }

// Un disparo de un arma enemiga contra tu nave desde su anclaje.
function nvDisparaE(S, e, w) {
  const A = NV_ARMA_E[w.portador], T = NV_TAM_E[w.tam], n = S.nave, c = NOVA_ARMAS.cargas[w.carga];
  const px = e.x + w.ax * e.r, py = e.y + w.ay * e.r, d = Math.hypot(n.x - px, n.y - py) || 1, ang = Math.atan2(n.y - py, n.x - px);
  const cada = A.cada * T.cada, dano = A.dps * T.c * cada / A.n;
  w.cd = cada;
  S.fx.push({ t: 0.12, x: px, y: py, r: 6 * T.r * nvZ(S), color: c.color, tipo: 'flash' });
  if (w.portador === 'laser') {   // haz instantáneo
    S.rayosE.push({ x: px, y: py, rx: n.x, ry: n.y, t: 0.12, color: c.color, g: 2 + T.r });
    nvDanoNave(S, dano);
    return;
  }
  for (let i = 0; i < A.n; i++) {
    const a = ang + (A.n > 1 ? (Math.random() - 0.5) * 0.7 : 0), v = A.v * (0.9 + Math.random() * 0.2);
    const b = { x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, dano, r: A.r * T.r, vida: nvAlcE(S, w) / v + 0.3, portador: w.portador, carga: w.carga, color: c.color, forma: c.forma };
    if (w.portador === 'lanzador') { b.misil = true; b.muerto = false; b.v = v; b.giro = A.giro; b.vida = 7; }
    S.eproy.push(b);
  }
}
// Disparos sueltos de los jefes, el nido y el capitán: balas cinéticas o de otra carga con el aspecto de las tuyas.
function nvBalaE(S, x, y, vx, vy, dano, r, vida, carga) {
  const c = NOVA_ARMAS.cargas[carga || 'cinetica'];
  S.eproy.push({ x, y, vx, vy, dano, r, vida, portador: 'flak', carga: carga || 'cinetica', color: c.color, forma: c.forma });
}

// ---------- balas enemigas en vuelo ----------
function nvProyectilesEnemigos(S, dt) {
  const n = S.nave;
  for (let i = S.rayosE.length - 1; i >= 0; i--) if ((S.rayosE[i].t -= dt) <= 0) S.rayosE.splice(i, 1);
  for (let i = S.eproy.length - 1; i >= 0; i--) {
    const b = S.eproy[i];
    if (b.muerto) { S.eproy.splice(i, 1); continue; }
    if (b.misil) {   // el misil gira hacia ti, pero con curva lenta: se esquiva o se derriba
      const va = Math.atan2(b.vy, b.vx), na = Math.atan2(n.y - b.y, n.x - b.x);
      let d = na - va; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283;
      const a = va + Math.max(-b.giro * dt, Math.min(b.giro * dt, d));
      b.vx = Math.cos(a) * b.v; b.vy = Math.sin(a) * b.v;
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (Math.hypot(b.x - n.x, b.y - n.y) < b.r + n.r) {
      nvDanoNave(S, b.dano);
      if (b.carga === 'explosiva') S.fx.push({ t: 0.3, x: b.x, y: b.y, r: 40 * nvZ(S), color: b.color, tipo: 'onda' });
      S.eproy.splice(i, 1); continue;
    }
    if ((b.vida -= dt) <= 0) S.eproy.splice(i, 1);
  }
}

// ---------- derribar misiles con armas cinéticas ----------
// El misil enemigo más cercano a tiro de esa arma (dentro de su arco), si el arma es cinética.
function nvMisilCerca(S, w, dx, dy, arco, grados, alc) {
  if (w.carga !== 'cinetica') return null;
  let mejor = alc * alc, m = null;
  for (const b of S.eproy) {
    if (!b.misil || b.muerto || !nvEnPantalla(S, b.x, b.y)) continue;
    const vx = b.x - w.x, vy = b.y - w.y, d2 = vx * vx + vy * vy;
    if (d2 > mejor) continue;
    if (grados < 360) { const dot = (vx * dx + vy * dy) / Math.sqrt(d2 || 1); if (Math.acos(Math.max(-1, Math.min(1, dot))) > arco) continue; }
    mejor = d2; m = b;
  }
  return m;
}
// ¿Esta bala cinética tuya toca un misil? Lo destruye con un pequeño estallido.
function nvChocaMisil(S, b, r) {
  r = r || b.r;
  for (const m of S.eproy) {
    if (!m.misil || m.muerto || Math.hypot(m.x - b.x, m.y - b.y) > m.r + r + 2) continue;
    m.muerto = true;
    S.fx.push({ t: 0.3, x: m.x, y: m.y, r: 26 * nvZ(S), color: '#ffd93d', tipo: 'onda' }, { t: 0.14, x: m.x, y: m.y, r: 10 * nvZ(S), color: '#ffffff', tipo: 'flash' });
    S.nums.push({ x: m.x, y: m.y - 14, t: 0.8, txt: tr('¡Derribado!'), color: '#ffd93d', g: 0 });
    return true;
  }
  return false;
}

// ---------- dibujo ----------
function nvDibujaBalasE(c, S) {
  const z = nvZ(S);
  for (const b of S.eproy) {
    if (!nvVisible(S, b.x, b.y, 40)) continue;   // lo de fuera de la pantalla no se dibuja
    const a = Math.atan2(b.vy, b.vx);
    c.save(); c.translate(b.x, b.y); c.rotate(a);
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = b.color; c.globalAlpha = 0.4; c.lineWidth = b.r * 1.4; c.lineCap = 'round';   // estela
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-Math.hypot(b.vx, b.vy) * (b.misil ? 0.12 : 0.05), 0); c.stroke();
    c.globalAlpha = 1; c.lineCap = 'butt'; c.globalCompositeOperation = 'source-over';
    c.fillStyle = b.color; c.strokeStyle = '#1a0f2e'; c.lineWidth = 1.5 * z;
    if (b.misil) { c.beginPath(); c.moveTo(b.r * 2, 0); c.lineTo(-b.r * 1.4, -b.r * 1.1); c.lineTo(-b.r * 0.8, 0); c.lineTo(-b.r * 1.4, b.r * 1.1); c.closePath(); c.fill(); c.stroke(); }
    else if (b.portador === 'railgun') { c.fillRect(-b.r * 4, -b.r * 0.6, b.r * 8, b.r * 1.2); }
    else { c.rotate(-a); nvFormaCarga(c, b.forma || 'círculo', 0, 0, b.r); c.stroke(); }
    c.restore();
  }
  c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  for (const r of S.rayosE) { c.strokeStyle = r.color; c.globalAlpha = Math.min(1, r.t * 9); c.lineWidth = (2 + r.g) * z; c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.rx, r.ry); c.stroke(); }
  c.globalAlpha = 1; c.lineCap = 'butt'; c.globalCompositeOperation = 'source-over';
}
