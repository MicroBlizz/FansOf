// Fans of Jump · Lo bonito: la luz del sol con destellos suaves (como una foto a contraluz), mariposas por las orillas, pétalos
// que vuelan, brillitos en el agua, la estela de arcoíris del conejo cuando va de racha (los arcoíris grandes de la Fiebre, en fiesta.js),
// el confeti y los letreros que saltan en el centro («¡Meta!», «¡Nuevo récord!», «¡Torre x3!»…).
'use strict';

const ARCOIRIS = ['#ff5a6e', '#ff9a3c', '#ffd84a', '#7ad65a', '#4ac8f0', '#7a7aff', '#c46aff'];
const BONITO = { mariposas: [], petalos: [], brillos: [], estela: [], confeti: [], vuelan: [] };
const LETREROS = [];

function iniciaBonito() {
  const B = BONITO;
  B.mariposas = Array.from({ length: 6 }, (_, i) => ({ x: Math.random() * PAN.W, y: Math.random() * PAN.H, f: Math.random() * 6, v: azar(6, 12), c: i % 3 }));
  B.petalos = Array.from({ length: 14 }, () => ({ x: Math.random() * PAN.W, y: Math.random() * PAN.H, f: Math.random() * 6, r: azar(1.2, 2.2), c: Math.random() < 0.6 ? '#ffc4d8' : '#ffffff' }));
}

/* ---------- lo que pasa en una jugada ---------- */
function estela(x, wy, h, tipo = 'arcoiris') { BONITO.estela.push({ x, wy, h, v: 0.45, tipo, n: BONITO.n = (BONITO.n || 0) + 1 }); }
// el dibujito de cada estela (las que se compran en el puesto de Lola)
function pintaMotaEstela(tipo, x, y, r, i) {
  if (tipo === 'corazones') corazonForma(x, y, r, i % 2 ? '#ff7aa8' : '#ffb3cf');
  else if (tipo === 'chispas') estrellaForma(x, y, r * 1.2, i * 0.7, i % 2 ? '#ffd84a' : '#fff1a0');
  else if (tipo === 'burbujas') { elipse(x, y, r, r, 'rgba(220,250,255,0.35)', '#ffffff', 0.7); elipse(x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.25, '#ffffff', null); }
  else if (tipo === 'notas') { elipse(x, y + r * 0.5, r * 0.55, r * 0.42, PASTEL.lilaO, null, 0, -0.4); trazo(x + r * 0.45, y + r * 0.4, x + r * 0.45, y - r * 0.9, 0.7, PASTEL.lilaO, null); trazo(x + r * 0.45, y - r * 0.9, x + r * 1.0, y - r * 0.5, 0.7, PASTEL.lilaO, null); }
}
function petalos(x, wy, n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = azar(20, 50); FX.push({ t: 'petalo', x, wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.7 + 10, giro: Math.random() * 6, r: azar(1.4, 2.4), color: Math.random() < 0.6 ? '#ffb3cf' : '#ffffff', v: 1.2, v0: 1.2 }); }
}
function confeti(x, wy, n) {
  for (let i = 0; i < n; i++) BONITO.confeti.push({ x: x + azar(-PAN.W / 2, PAN.W / 2), y: azar(-20, 40), vx: azar(-20, 20), vy: azar(20, 60), giro: Math.random() * 6, c: ARCOIRIS[i % 7], v: azar(1.6, 2.6) });
}
// un letrero en el centro (color o 'arcoiris')
function bandera(txt, color) { LETREROS.push({ txt, color, t: 0, v: 1.6 }); while (LETREROS.length > 2) LETREROS.shift(); }

function avanzaBonito(dt) {
  const B = BONITO, W = PAN.W, H = PAN.H, J = JUEGO, mueve = GUARDA.suave ? 0.5 : 1;
  for (const v of B.vuelan) v.t += dt;
  B.vuelan = B.vuelan.filter(v => v.t < v.d + ZANA_VUELA);
  for (const m of B.mariposas) {
    m.f += dt * 3; m.x += Math.cos(m.f * 0.4) * m.v * dt * mueve; m.y += (Math.sin(m.f * 0.7) * 8 + 6) * dt * mueve;
    if (m.y > H + 10) { m.y = -10; m.x = Math.random() < 0.5 ? azar(4, 30) : azar(W - 30, W - 4); }
    if (m.x < -10) m.x = W + 8; if (m.x > W + 10) m.x = -8;
  }
  for (const p of B.petalos) { p.f += dt; p.x += (Math.sin(p.f * 1.3) * 8 + 4) * dt; p.y += 9 * dt; if (p.y > H + 5) { p.y = -5; p.x = Math.random() * W; } if (p.x > W + 5) p.x = -5; }
  if (Math.random() < dt * 6) B.brillos.push({ x: azar(30, W - 30), wy: CAM.y + azar(0, H), v: 0.8, v0: 0.8 });
  for (const b of B.brillos) b.v -= dt;
  B.brillos = B.brillos.filter(b => b.v > 0);
  for (const e of B.estela) e.v -= dt;
  B.estela = B.estela.filter(e => e.v > 0);
  for (const c of B.confeti) { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 30 * dt; c.giro += dt * 8; c.v -= dt; }
  B.confeti = B.confeti.filter(c => c.v > 0 && c.y < H + 10);
  for (const b of LETREROS) { b.t += dt; b.v -= dt; }
  while (LETREROS.length && LETREROS[0].v <= 0) LETREROS.shift();
}

/* ---------- pintar ---------- */
// el sol: un resplandor cálido arriba a la izquierda y círculos de luz que flotan
function pintaLuz(t) {
  const W = PAN.W, H = PAN.H, dia = 1 - nocheAhora();   // de noche no hay sol (paisaje.js)
  if (dia < 0.02) return;
  G.save(); G.globalAlpha = dia;
  const sol = G.createRadialGradient(W * 0.1, -20, 4, W * 0.1, -20, H * 0.75);
  sol.addColorStop(0, 'rgba(255,248,210,0.55)'); sol.addColorStop(0.4, 'rgba(255,240,200,0.18)'); sol.addColorStop(1, 'rgba(255,240,200,0)');
  G.fillStyle = sol; G.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) {
    const x = (i * 47 + Math.sin(t * 0.2 + i) * 14) % W, y = (i * 83 + t * 3) % (H * 0.7), r = 6 + (i % 3) * 5;
    const g = G.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,240,0.16)'); g.addColorStop(1, 'rgba(255,255,240,0)');
    G.fillStyle = g; G.fillRect(x - r, y - r, r * 2, r * 2);
  }
  G.restore();
}
function estrellita(x, y, r, alfa) {
  G.globalAlpha = alfa; G.fillStyle = '#ffffff';
  G.beginPath(); G.moveTo(x, y - r); G.quadraticCurveTo(x, y, x + r, y); G.quadraticCurveTo(x, y, x, y + r); G.quadraticCurveTo(x, y, x - r, y); G.quadraticCurveTo(x, y, x, y - r); G.fill();
  G.globalAlpha = 1;
}
// encima del agua, debajo de los troncos: brillitos y la estela de arcoíris
function pintaBonitoAgua(t) {
  for (const b of BONITO.brillos) { const k = b.v / b.v0; estrellita(b.x, pantY(b.wy), 2.4 * Math.sin(k * Math.PI), 0.9 * Math.sin(k * Math.PI)); }
  const E = BONITO.estela.filter(e => e.tipo === 'arcoiris');
  if (E.length > 1) {
    G.lineCap = 'round'; G.lineJoin = 'round';
    ARCOIRIS.forEach((col, i) => {
      G.beginPath();
      E.forEach((e, j) => { const y = pantY(e.wy) - e.h - 12 + (i - 3) * 1.6; if (j) G.lineTo(e.x, y); else G.moveTo(e.x, y); });
      G.globalAlpha = 0.75; G.lineWidth = 1.8; G.strokeStyle = col; G.stroke();
    });
    G.globalAlpha = 1;
  }
  for (const e of BONITO.estela) if (e.tipo !== 'arcoiris' && e.n % 3 === 0) {
    const k = e.v / 0.45; G.globalAlpha = Math.min(1, k * 1.6);
    pintaMotaEstela(e.tipo, e.x + Math.sin(e.n) * 3, pantY(e.wy) - e.h - 10 + (1 - k) * 4, 2.2 * (0.5 + k * 0.5), e.n);
  }
  G.globalAlpha = 1;
}
function mariposa(m, t) {
  const cols = [['#ffb3cf', '#ff7aa8'], ['#bfe6ff', '#6ab8ff'], ['#fff1a0', '#ffc93a']][m.c], aleteo = 0.25 + Math.abs(Math.sin(m.f * 6)) * 0.75;
  aqui(m.x, m.y, Math.sin(m.f) * 0.3, 1, 1, () => {
    for (const s of [-1, 1]) {
      aqui(0, 0, 0, aleteo * s, 1, () => {
        elipse(2.4, -1.4, 2.6, 2.2, vol(2.4, -1.4, 2.6, 2.2, cols[0]), OLC, 0.5, -0.4);
        elipse(2, 1.6, 1.8, 1.5, vol(2, 1.6, 1.8, 1.5, cols[1]), OLC, 0.5, 0.4);
      });
    }
    elipse(0, 0, 0.6, 2.2, '#4a3426', null);
  });
}
// encima de todo lo del mundo: pétalos, mariposas y confeti
function pintaBonitoAire(t) {
  for (const p of BONITO.petalos) aqui(p.x, p.y, p.f * 2, 1, Math.abs(Math.sin(p.f * 2)) * 0.6 + 0.4, () => elipse(0, 0, p.r, p.r * 0.6, p.c, 'rgba(200,120,150,0.4)', 0.3));
  for (const m of BONITO.mariposas) mariposa(m, t);
  for (const c of BONITO.confeti) aqui(c.x, c.y, c.giro, 1, Math.abs(Math.cos(c.giro)) * 0.8 + 0.2, () => { G.fillStyle = c.c; G.fillRect(-1.4, -0.8, 2.8, 1.6); });
}
// los letreros que saltan en el centro: pegatinas inclinadas con borde blanco y dos estrellitas
function pintaBanderas() {
  LETREROS.forEach((b, i) => {
    const pop = b.t < 0.25 ? 0.5 + b.t / 0.25 * 0.65 : 1.15 - Math.min(0.15, (b.t - 0.25) * 0.6), y = PAN.H * 0.26 + i * 27;
    G.globalAlpha = Math.min(1, b.v * 3);
    aqui(PAN.W / 2, y, (i % 2 ? 0.06 : -0.06) + Math.sin(b.t * 5) * 0.02, pop, pop, () => {
      const w = anchoLetras(b.txt, 14, { logo: true }) + 22;
      let fondo = b.color;
      if (b.color === 'arcoiris') { fondo = G.createLinearGradient(-w / 2, 0, w / 2, 0); ARCOIRIS.forEach((c, k) => fondo.addColorStop(k / 6, c)); }
      caja(-w / 2 - 3, -12, w + 6, 24, 9, '#ffffff', OLC, 1.2);
      caja(-w / 2, -9, w, 18, 7, fondo, null);
      caja(-w / 2 + 3, -7.5, w - 6, 4, 2, 'rgba(255,255,255,0.4)', null);
      letras(b.txt, 0, 1.2, 14, '#ffffff', { logo: true, borde: OLC, bw: 3 });
      estrellita(-w / 2 - 6, -10, 4 + Math.sin(b.t * 9) * 1, 1); estrellita(w / 2 + 6, 9, 3.4 + Math.cos(b.t * 9) * 1, 1);
    });
    G.globalAlpha = 1;
  });
}

/* ---------- las zanahorias de los troncos ---------- */
// grandes, flotando encima del tronco y botando, con un brillo dorado detrás, su sombra y algún destello
function pintaZanasTronco(tr, y, t) {
  const n = tr.zanas, sep = 13, gy = y - 10;
  const g = G.createRadialGradient(tr.x, gy, 1, tr.x, gy, 13 + n * 4);
  g.addColorStop(0, 'rgba(255,240,170,0.8)'); g.addColorStop(1, 'rgba(255,220,120,0)');
  G.fillStyle = g; G.fillRect(tr.x - 32, gy - 26, 64, 52);
  elipse(tr.x, y + 1, 4 + n * 4.5, 2.2, 'rgba(90,50,25,0.25)', null);
  for (let i = 0; i < n; i++) {
    const x = tr.x - (n - 1) * sep / 2 + i * sep, b = Math.sin(t * 3.2 + tr.id + i * 0.9) * 1.8;
    aqui(x, gy + b, Math.sin(t * 2 + i + tr.id) * 0.14, 1, 1, () => iconoZana(0, 0, 20));
  }
  const k = (t * 0.9 + tr.id * 0.37) % 1;
  if (k < 0.35) estrellita(tr.x + Math.cos(tr.id * 2.1) * (6 + n * 4), gy - 7 + Math.sin(tr.id) * 3, 2.6 * Math.sin(k / 0.35 * Math.PI), 0.95);
}
// al cogerlas, cada una sale volando hasta el contador de zanahorias del marcador
const ZANA_VUELA = 0.55;
function zanasVuelan(x, wy, n) { const y = pantY(wy) - 9; for (let i = 0; i < Math.min(n, 6); i++) BONITO.vuelan.push({ x: x + (i - (n - 1) / 2) * 13, y, t: 0, d: i * 0.07 }); }
function pintaZanasVuelan() {
  for (const v of BONITO.vuelan) {
    const k = Math.max(0, Math.min(1, (v.t - v.d) / ZANA_VUELA)), e = k * k * (3 - 2 * k), tx = 13.5, ty = 32.5;
    const cx = (v.x + tx) / 2 + 30, cy = Math.min(v.y, ty) - 40;   // por una curva hacia arriba
    const x = (1 - e) * (1 - e) * v.x + 2 * (1 - e) * e * cx + e * e * tx, y = (1 - e) * (1 - e) * v.y + 2 * (1 - e) * e * cy + e * e * ty;
    aqui(x, y, e * 6, 1, 1, () => iconoZana(0, 0, 20 - e * 9));
    if (k > 0.92) estrellita(tx, ty, 4 * (1 - (k - 0.92) / 0.08), 0.9);
  }
}

