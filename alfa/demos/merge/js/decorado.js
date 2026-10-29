// Fans of Merge · DECORADO y OBJETIVOS: los conejitos que pasean por los caminos de tierra (solo de adorno: no cuentan para nada)
// y la lista de objetivos de puntos de la partida (cada uno cumplido da una carga del Rayo zanahoria).
'use strict';
const MG_OBJETIVOS = [2000, 5000, 7500, 10000, 15000, 25000, 40000, 60000, 100000, 150000, 250000, 400000, 600000, 1000000];
// el objetivo en curso: { desde, de } (de = null si ya están todos)
function mgObjetivo() {
  const i = MG_OBJETIVOS.findIndex(o => o > (MG_P.objetivoHecho || 0));
  return { desde: i > 0 ? MG_OBJETIVOS[i - 1] : 0, de: i >= 0 ? MG_OBJETIVOS[i] : null };
}
function mgCompruebaObjetivo() {
  if (MG_P.nivel) return;   // en la Aventura manda el objetivo del nivel
  const O = mgObjetivo(); if (!O.de || MG_P.pts < O.de) return;
  MG_P.objetivoHecho = O.de;
  if (MG_P.cargas < MG_CFG.cargasMax) MG_P.cargas++;
  mgFxAviso(tr('¡Objetivo cumplido! +1 rayo')); play('mgCarga');
  mgCompruebaObjetivo();   // por si una fusión enorme cumple dos de golpe
}

/* ---------- los conejitos ---------- */
const MG_CONEJOS = [];
function mgConejosNuevos() {
  MG_CONEJOS.length = 0;
  for (let i = 0; i < 3; i++) MG_CONEJOS.push({ x: 0, y: 0, ax: 0, ay: 0, k: 1, pausa: Math.random() * 2, col: ['#ffffff', '#e8c7a0', '#cfcfd8'][i], mira: 1, sitio: false });
}
function mgConejosAvanza(dt) {
  const P = MG_P; if (!P.B) return;
  for (const C of MG_CONEJOS) {
    const libre = (x, y) => mgDentro(x, y) && !P.B[y][x];
    if (!C.sitio || !libre(C.ax, C.ay)) {   // aparece en un camino cualquiera (si el suyo se ha ocupado)
      const v = mgVacias(P.B); if (!v.length) { C.sitio = false; continue; }
      [C.ax, C.ay] = pick(v); C.x = C.ax; C.y = C.ay; C.k = 1; C.sitio = true; continue;
    }
    if (C.k < 1) { C.k = Math.min(1, C.k + dt * 1.6); continue; }
    C.pausa -= dt; if (C.pausa > 0) continue;
    const opciones = MG_DIR.map(([dx, dy]) => [C.ax + dx, C.ay + dy]).filter(([x, y]) => libre(x, y));
    if (!opciones.length) { C.pausa = 1; continue; }
    const [nx, ny] = pick(opciones);
    C.x = C.ax; C.y = C.ay; C.ax = nx; C.ay = ny; C.k = 0; C.mira = nx < C.x ? -1 : nx > C.x ? 1 : C.mira; C.pausa = 0.6 + Math.random() * 2.2;
  }
}
function mgPintaConejos(c, t) {
  const cs = MG_V.cs;
  for (const C of MG_CONEJOS) {
    if (!C.sitio) continue;
    const e = C.k * C.k * (3 - 2 * C.k), x = mgCx(lerp(C.x, C.ax, e)) + cs * 0.18, y = mgCy(lerp(C.y, C.ay, e)) + cs * 0.12 - Math.abs(Math.sin(C.k * Math.PI * 2)) * 6;
    if (MG_IMG.CONEJITO) { c.save(); c.translate(x, y); c.scale(C.mira, 1); mgImg(c, 'CONEJITO', -cs * 0.2, -cs * 0.3, cs * 0.4, cs * 0.4); c.restore(); continue; }
    c.save(); c.translate(x, y); c.scale(C.mira, 1); c.lineWidth = 2; c.strokeStyle = OL; c.fillStyle = C.col;
    c.beginPath(); c.ellipse(0, 6, 8, 3, 0, 0, MG_TAU); c.fillStyle = 'rgba(40,40,10,.25)'; c.fill(); c.fillStyle = C.col;
    c.beginPath(); c.ellipse(-2, 0, 8, 6, 0, 0, MG_TAU); c.fill(); c.stroke();        // cuerpo
    c.beginPath(); c.arc(6, -5, 5, 0, MG_TAU); c.fill(); c.stroke();                  // cabeza
    [[4, -16], [8, -15]].forEach(([ox, oy]) => { c.beginPath(); c.ellipse(ox, oy, 1.8, 5.5, 0.15, 0, MG_TAU); c.fill(); c.stroke(); });   // orejas
    c.fillStyle = OL; c.beginPath(); c.arc(8, -6, 1.1, 0, MG_TAU); c.fill();
    c.restore();
  }
}

/* ---------- la portada: el logo, piezas que caen y CrazyBunny saltando ---------- */
const MG_LLUVIA = Array.from({ length: 10 }, (_, i) => ({ t: MG_CADENA[i % 8], x: (i * 97) % 540, y: (i * 173) % 960, v: 30 + (i * 37) % 40, r: i * 1.7 }));
function mgPintaPortada(c, t, dt) {
  mgFondo(c, true);
  c.fillStyle = 'rgba(255,248,230,.12)'; c.fillRect(0, 0, 540, MG_V.H);
  for (const L of MG_LLUVIA) {
    L.y += L.v * dt; L.r += dt; if (L.y > MG_V.H + 60) { L.y = -60; L.x = Math.random() * 540; }
    c.save(); c.globalAlpha = 0.85; c.translate(L.x, L.y); c.rotate(Math.sin(L.r) * 0.25); mgDibujaPieza(c, L.t, 0, 0, 74, mgK()); c.restore();
  }
  const y0 = MG_V.H * 0.2 + Math.sin(t * 1.6) * 4;
  c.save(); c.translate(270, y0); c.rotate(-0.04);
  if (!mgImg(c, 'LOGO', -250, -125, 500, 250)) { mgTexto(c, 'FANS OF', 0, -50, 44, '#ffffff'); mgTexto(c, 'MERGE', 0, 22, 108, '#ff8a2a'); }
  c.restore();
  const by = MG_V.H * 0.52, salto = Math.abs(Math.sin(t * 2.4)) * 14;
  c.beginPath(); c.ellipse(270, by + 110, 84 - salto, 16, 0, 0, MG_TAU); c.fillStyle = 'rgba(20,40,10,.3)'; c.fill();
  mgDibujaPieza(c, MG_IMG.BUNNY ? 'BUNNY' : 'madriguera', 270, by - salto, 260, mgK());
}
