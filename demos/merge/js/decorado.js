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
    const libre = (x, y) => mgDentro(x, y) && !P.B[y][x] && (!P.camino || P.camino.has(y * 8 + x));   // pasean por el camino
    if (!C.sitio || !libre(C.ax, C.ay)) {   // aparece en un camino cualquiera (si el suyo se ha ocupado)
      const v = mgVacias(P.B).filter(([x, y]) => libre(x, y)); if (!v.length) { C.sitio = false; continue; }
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
  if (!MG_PORTADA.lista) return;   // hasta que lleguen sus dibujos, solo el prado: nada provisional
  const a = Math.min(1, (performance.now() - MG_PORTADA.desde) / 350);   // y entra con un fundido
  c.save(); if (a < 1) c.globalAlpha = a;
  for (const L of MG_LLUVIA) {
    L.y += L.v * dt; L.r += dt; if (L.y > MG_V.H + 60) { L.y = -60; L.x = Math.random() * 540; }
    if (!MG_IMG[L.t]) continue;
    const g = mgCaeGirada(L.t, Math.sin(L.r) * 0.25), k = mgK();
    if (g) c.drawImage(g, L.x - g.width / 2 / k, L.y - g.height / 2 / k, g.width / k, g.height / k);
  }
  const y0 = MG_V.H * 0.2 + Math.sin(t * 1.6) * 4, logo = mgLogoListo();
  if (logo) c.drawImage(logo, 270 - logo.width / 2 / mgK(), y0 - logo.height / 2 / mgK(), logo.width / mgK(), logo.height / mgK());
  else { mgTexto(c, 'FANS OF', 270, y0 - 50, 44, '#ffffff'); mgTexto(c, 'MERGE', 270, y0 + 22, 108, '#ff8a2a'); }
  const by = MG_V.H * 0.52, salto = Math.abs(Math.sin(t * 2.4)) * 14;
  c.beginPath(); c.ellipse(270, by + 110, 84 - salto, 16, 0, 0, MG_TAU); c.fillStyle = 'rgba(20,40,10,.3)'; c.fill();
  if (MG_IMG.BUNNY) mgDibujaPieza(c, 'BUNNY', 270, by - salto, 260, mgK());
  c.restore();
}
// una pieza de las que caen en la portada, ya girada (9 giros por pieza, preparados una vez) y un poco transparente:
// girarlas en cada fotograma era lo otro que frenaba la portada
function mgCaeGirada(tipo, ang) {
  const k = mgK(), i = Math.round((ang / 0.25 + 1) * 4), clave = tipo + ':' + i + ':' + k;
  if (!MG_V.caen || MG_V.caenK !== k) { MG_V.caen = new Map(); MG_V.caenK = k; }
  let cv = MG_V.caen.get(clave);
  if (!cv) {
    const lado = Math.round(74 * k), W = Math.ceil(lado * 1.3), sp = mgSpriteListo(tipo, lado); if (!sp) return null;
    cv = document.createElement('canvas'); cv.width = cv.height = W;
    const c = cv.getContext('2d'); c.globalAlpha = 0.85; c.translate(W / 2, W / 2); c.rotate((i / 4 - 1) * 0.25); c.drawImage(sp, -lado / 2, -lado / 2);
    MG_V.caen.set(clave, cv);
  }
  return cv;
}
// el logo, encogido y girado una sola vez al tamaño real de la pantalla (hacerlo en cada fotograma era lo que frenaba la portada)
function mgLogoListo() {
  const im = MG_IMG.LOGO, k = mgK(); if (!im) return null;
  if (MG_V.logoK !== k) {
    const w = 500, h = 250, ang = -0.04, W = Math.ceil((w * Math.cos(-ang) + h * Math.sin(-ang)) * k) + 4, H = Math.ceil((h * Math.cos(-ang) + w * Math.sin(-ang)) * k) + 4;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high'; c.translate(W / 2, H / 2); c.rotate(ang); c.drawImage(im, -w * k / 2, -h * k / 2, w * k, h * k);
    MG_V.logo = cv; MG_V.logoK = k;
  }
  return MG_V.logo;
}
