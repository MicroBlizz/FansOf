// Fans of Jump · La FIESTA de la Fiebre arcoíris: cuantos más ¡Perfecto! seguidos (J.cadena), más sube el nivel (1 a 5) y más
// espectacular se pone: un arcoíris encima de otro, lluvia de confeti, globos que suben, mariposas de colores, los amigos
// animando desde las orillas, fuegos artificiales y, a tope, el borde de la pantalla brillando en arcoíris. La música va más
// deprisa en cada nivel (sonido.js). Un salto que no es perfecto baja la fiesta al nivel 1 hasta que se acaba la Fiebre.
'use strict';

const NIVELES_FIESTA = [3, 8, 14, 22, 32];   // ¡Perfecto! seguidos para cada nivel
const TITULOS_FIESTA = [null, null, '¡Doble arcoíris!', '¡Triple arcoíris!', '¡Fiesta en el bosque!', '¡ARCOÍRIS INFINITO!'];
const FIESTA = { nivel: 0, arcos: [0, 0, 0, 0, 0], globos: [], fuegos: [], chispas: [], maris: [], fans: [], borde: 0 };
const FANS_ID = ['zorro', 'castor', 'suricata', 'mapache', 'ardilla', 'zorro'];
const FANS_Y = [0.42, 0.58, 0.72, 0.3, 0.86, 0.47];   // a qué altura de la pantalla anima cada uno (pares a la izquierda)

function nivelFiesta() {
  const J = JUEGO;
  if (J.modo === 'final') return 5;   // en la madriguera, la fiesta a tope
  if (!(J.fiebre > 0) || J.modo !== 'juego') return 0;
  let n = 0; for (const u of NIVELES_FIESTA) if ((J.cadena || 0) >= u) n++;
  return Math.max(1, n);
}
function reiniciaFiesta() { Object.assign(FIESTA, { nivel: 0, arcos: [0, 0, 0, 0, 0], globos: [], fuegos: [], chispas: [], maris: [], fans: [], borde: 0 }); }

function subeFiesta(n) {
  const J = JUEGO;
  if (n < 2) return;   // el nivel 1 es la Fiebre de siempre (enciendeFiebre)
  bandera(tr(TITULOS_FIESTA[n]), 'arcoiris');
  confeti(PAN.W / 2, J.conejo.wy, 30 + n * 15);
  for (let i = 0; i < n; i++) FIESTA.globos.push(globo(true));
  if (n >= 4) for (let i = 0; i < n - 2; i++) fuego();
  SONIDO.fiesta(n); vibra([20, 30, 20 + n * 10]);
  llamaFans(n >= 3 ? (n - 2) * 2 : 0);   // los amigos de la orilla: entran en el nivel 3 y cada nivel trae más
}
function llamaFans(quiere) {
  while (FIESTA.fans.filter(f => !f.sale).length < quiere) {
    const i = FIESTA.fans.length, lado = i % 2 ? 1 : -1;
    FIESTA.fans.push({ id: FANS_ID[i % FANS_ID.length], lado, y: FANS_Y[i % FANS_Y.length], entra: 0, sale: false, f: Math.random() * 6 });
  }
}

/* ---------- lo que vuela ---------- */
function globo(abajo) {
  const W = PAN.W;
  return { x: azar(10, W - 10), y: abajo ? PAN.H + azar(5, 40) : PAN.H + 10, v: azar(26, 40), f: Math.random() * 6, r: azar(5.5, 8), c: ARCOIRIS[Math.floor(Math.random() * 7)], pum: 0 };
}
function fuego() {
  const W = PAN.W, x = azar(W * 0.15, W * 0.85), y = azar(PAN.H * 0.08, PAN.H * 0.32), c = ARCOIRIS[Math.floor(Math.random() * 7)], n = GUARDA.suave ? 14 : 26;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, s = azar(55, 80); FIESTA.chispas.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, v: azar(0.9, 1.3), c: i % 3 ? c : '#ffffff' }); }
  FIESTA.fuegos.push({ x, y, t: 0 });
  SONIDO.pum();
}

function avanzaFiesta(dt) {
  const F = FIESTA, n = nivelFiesta(), W = PAN.W, H = PAN.H, poco = GUARDA.suave ? 0.4 : 1;
  if (n > F.nivel) subeFiesta(n);
  F.nivel = n;
  // los arcoíris: cada uno aparece (y se va) suave
  F.arcos = F.arcos.map((a, i) => a + ((i < n ? 1 : 0) - a) * Math.min(1, dt * (i < n ? 2.5 : 3)));
  F.borde += ((n >= 5 ? 1 : 0) - F.borde) * Math.min(1, dt * 2);
  // lluvia de confeti, globos, mariposas y fuegos: más cuanto más alto el nivel
  if (n >= 2 && Math.random() < dt * (n - 1) * 5 * poco && BONITO.confeti.length < 260) confeti(W / 2, 0, 3);
  if (n >= 3 && Math.random() < dt * (n - 2) * 0.8 * poco && F.globos.length < 13) F.globos.push(globo(false));
  if (n >= 3 && Math.random() < dt * (n - 2) * 0.9 * poco && F.maris.length < 18) F.maris.push({ x: Math.random() < 0.5 ? -6 : W + 6, d: 0, y: azar(H * 0.15, H * 0.8), f: Math.random() * 6, v: azar(14, 24), c: Math.floor(Math.random() * 3), vida: 6 });
  if (n >= 4 && Math.random() < dt * (n - 3) * 0.9 * poco) fuego();
  for (const g of F.globos) { g.f += dt; g.y -= g.v * dt; g.x += Math.sin(g.f * 1.6) * 6 * dt; if (g.y < 30 && !g.pum && Math.random() < dt * 3) g.pum = 0.001; if (g.pum) g.pum += dt; }
  F.globos = F.globos.filter(g => g.y > -20 && g.pum < 0.25);
  for (const m of F.maris) { if (!m.d) m.d = m.x < 0 ? 1 : -1; m.f += dt * 3; m.vida -= dt; m.x += (m.d * m.v + Math.cos(m.f * 0.5) * 8) * dt; m.y += (Math.sin(m.f * 0.8) * 14 - 6) * dt; }
  F.maris = F.maris.filter(m => m.vida > 0);
  for (const c of F.chispas) { c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= 1 - dt * 1.8; c.vy = c.vy * (1 - dt * 1.8) + 30 * dt; c.v -= dt; }
  F.chispas = F.chispas.filter(c => c.v > 0);
  for (const f of F.fuegos) f.t += dt;
  F.fuegos = F.fuegos.filter(f => f.t < 0.35);
  // los amigos de la orilla: si baja la fiesta, se van saltando
  const quiere = n >= 3 ? (n - 2) * 2 : 0;
  F.fans.forEach((f, i) => { f.f += dt; if (i >= quiere) f.sale = true; f.entra = Math.max(0, Math.min(1, f.entra + (f.sale ? -dt * 2 : dt * 2.5))); });
  F.fans = F.fans.filter(f => !(f.sale && f.entra <= 0));
}

/* ---------- pintar ---------- */
// los arcoíris de la fiebre, uno encima de otro (detrás de lo de arriba del mundo)
function pintaArcos(t) {
  const F = FIESTA, W = PAN.W, H = PAN.H;
  G.save(); G.lineCap = 'butt';
  F.arcos.forEach((a, j) => {
    if (a < 0.02) return;
    const cx = W / 2 + Math.sin(t * 0.8 + j * 1.7) * j * 3, cy = H * (0.55 - j * 0.085) + Math.sin(t * 1.3 + j) * 2, R = W * (0.62 - j * 0.035) * (0.7 + a * 0.3);
    G.globalAlpha = (j ? 0.4 : 0.45) * a;
    ARCOIRIS.forEach((col, i) => { G.beginPath(); G.arc(cx, cy, R - i * 4.2, Math.PI * 1.05, Math.PI * 1.95); G.lineWidth = 4.4; G.strokeStyle = col; G.stroke(); });
    // brillitos que corren por encima del arco
    const k = (t * 0.35 + j * 0.23) % 1, ang = Math.PI * (1.05 + k * 0.9);
    estrellita(cx + Math.cos(ang) * (R - 12), cy + Math.sin(ang) * (R - 12), 3.4, 0.9 * a);
  });
  G.restore();
}
// los amigos animando desde las orillas (detrás de los troncos): entran desde el lado y botan con los brazos arriba
function pintaFans(t) {
  for (const f of FIESTA.fans) {
    const e = f.entra * f.entra * (3 - 2 * f.entra), y = PAN.H * f.y, x0 = f.lado < 0 ? -14 : PAN.W + 14;
    const borde = f.lado < 0 ? orillas(CAM.y + PAN.H - y)[0] - 9 : orillas(CAM.y + PAN.H - y)[1] + 9;
    const x = x0 + (borde - x0) * e, bote = Math.abs(Math.sin(f.f * 7)) * 5;
    elipse(x, y + 1, 5.5 - bote * 0.4, 1.8, 'rgba(60,90,40,0.25)', null);
    sprite(f.id + '_anima' + (Math.floor(f.f * 5) % 2), x, y - bote, 11, Math.sin(f.f * 7) * 0.08, f.lado < 0 ? 1 : -1, 1);
  }
}
// un globo de látex 3D (globo0_icono…globo6_icono, uno por color del arcoíris) con su cuerda; al explotar, estrellitas
function pintaGlobo(g) {
  if (g.pum) { const k = 1 + g.pum * 6; G.globalAlpha = Math.max(0, 1 - g.pum * 4); for (let i = 0; i < 6; i++) { const a = i * 1.047; estrellita(g.x + Math.cos(a) * g.r * k, g.y + Math.sin(a) * g.r * k, 2, 1); } G.globalAlpha = 1; return; }
  const s = Math.sin(g.f * 2) * 3;
  G.beginPath(); G.moveTo(g.x, g.y + g.r * 1.15); G.quadraticCurveTo(g.x + s, g.y + g.r * 2.2, g.x - s * 0.5, g.y + g.r * 3.4);
  G.lineWidth = 0.6; G.strokeStyle = 'rgba(80,60,100,0.6)'; G.stroke();
  aqui(g.x, g.y, Math.sin(g.f * 1.6) * 0.08, 1, 1, () => spriteEnCaja('globo' + ARCOIRIS.indexOf(g.c) + '_icono', -g.r * 1.2, -g.r * 1.3, g.r * 2.4, g.r * 2.6, 0));
}
// encima del mundo: globos, mariposas de fiesta, fuegos artificiales y el borde arcoíris
function pintaFiestaAire(t) {
  const F = FIESTA, W = PAN.W, H = PAN.H;
  for (const g of F.globos) pintaGlobo(g);
  for (const m of F.maris) { G.globalAlpha = Math.min(1, m.vida); mariposa(m, t); G.globalAlpha = 1; }
  for (const f of F.fuegos) { const k = f.t / 0.35, r = 6 + k * 26; G.globalAlpha = 1 - k; elipse(f.x, f.y, r, r, 'rgba(255,250,220,0.5)', null); G.globalAlpha = 1; }
  for (const c of F.chispas) { const a = Math.min(1, c.v * 1.6); G.globalAlpha = a; trazo(c.x - c.vx * 0.06, c.y - c.vy * 0.06, c.x, c.y, 1.6, c.c, null); elipse(c.x, c.y, 1.4, 1.4, c.c, null); if (c.v > 0.8) estrellita(c.x, c.y, 2.6, a); G.globalAlpha = 1; }
  if (F.borde > 0.02) {
    const p = 0.55 + Math.sin(t * 6) * 0.25, g = G.createLinearGradient(0, 0, W, H);
    ARCOIRIS.forEach((c, i) => g.addColorStop(((i / 7 + t * 0.3) % 1), c));
    G.save(); G.globalAlpha = F.borde * p; G.strokeStyle = g; G.lineWidth = 5;
    G.strokeRect(2.5, 2.5, W - 5, H - 5); G.globalAlpha = F.borde * p * 0.4; G.lineWidth = 12; G.strokeRect(6, 6, W - 12, H - 12);
    G.restore();
  }
}
