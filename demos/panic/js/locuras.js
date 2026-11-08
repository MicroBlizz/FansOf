// Fans of Panic · Locuras: lo que suelta el «?» del panel. Unas lo ponen difícil y otras ayudan, y duran unos segundos:
// Espejo (izquierda y derecha al revés), Apagón (solo se ve alrededor del cúter), El panel crece (Microblizz vuelve a tapar lo
// recortado, poco a poco), Jefe furioso (el doble de rápido y suelta hijos), Huelga (los becarios se paran) y Anuncio de
// Microblizz (un cartel tapa un trozo del panel y hay que recortarlo).
'use strict';

const LOC = { activa: null, t: 0, crece: 0 };
const CARTELES = [];   // rectángulos tapados por un cartel: { x, y, w, h }

const LOCURAS = {
  espejo: { nombre: 'ESPEJO', dura: 7, mala: true, inicio: () => {} },
  apagon: { nombre: 'APAGÓN', dura: 7, mala: true, inicio: () => {} },
  crece: { nombre: 'EL PANEL CRECE', dura: 10, mala: true, inicio: () => { LOC.crece = 0; } },
  furioso: { nombre: 'JEFE FURIOSO', dura: 7, mala: true, inicio: () => { JEFE.vel *= 2; JEFE.vx *= 2; JEFE.vy *= 2; nuevosHijos(2); }, fin: () => { JEFE.vel /= 2; JEFE.vx /= 2; JEFE.vy /= 2; HIJOS.length = 0; } },
  huelga: { nombre: 'HUELGA', dura: 6, mala: false, inicio: () => { BECARIOS.huelga = true; }, fin: () => { BECARIOS.huelga = false; } },
  anuncio: { nombre: 'ANUNCIO', dura: 0, mala: true, inicio: () => ponAnuncio() },
};
const ORDEN_LOCURAS = Object.keys(LOCURAS);

function lanzaLocura(px, py) {
  const id = ORDEN_LOCURAS[Math.floor(Math.random() * ORDEN_LOCURAS.length)], L = LOCURAS[id];
  if (LOC.activa && LOCURAS[LOC.activa].fin) LOCURAS[LOC.activa].fin();
  LOC.activa = L.dura ? id : null; LOC.t = L.dura;
  L.inicio();
  textoSube(tr(L.nombre), px, py, L.mala ? '#ff6b6b' : COL.verde, 22);
  SONIDO.locura(L.mala); temblor(0.6); vibra(L.mala ? [40, 40, 40] : 40);
}

function avanzaLocuras(dt) {
  if (!LOC.activa) return;
  LOC.t -= dt;
  if (LOC.activa === 'crece') { LOC.crece += dt; while (LOC.crece > 0.25) { LOC.crece -= 0.25; creceTapado(6); JUEGO.pct = porcentaje(); } }
  if (LOC.t > 0) return;
  const L = LOCURAS[LOC.activa]; if (L.fin) L.fin();
  LOC.activa = null;
}

function limpiaLocuras() { if (LOC.activa && LOCURAS[LOC.activa].fin) LOCURAS[LOC.activa].fin(); LOC.activa = null; CARTELES.length = 0; HIJOS.length = 0; BECARIOS.huelga = false; }

const espejoActivo = () => LOC.activa === 'espejo';
const espeja = d => (espejoActivo() ? [-d[0], d[1]] : d);

// un cartel de Microblizz: tapa un rectángulo de lo destapado (si no hay sitio, no pasa nada)
function ponAnuncio() {
  const w = 14, h = 9;
  for (let i = 0; i < 20; i++) {
    const x = 1 + Math.floor(Math.random() * (TAB.cols - 2 - w)), y = 1 + Math.floor(Math.random() * (TAB.filas - 2 - h));
    if (Math.abs(x + w / 2 - CUR.x) < w && Math.abs(y + h / 2 - CUR.y) < h) continue;   // nunca encima del cúter
    const n = cambiaRect(x, y, w, h, DESTAPADA, TAPADA);
    if (n < w * h * 0.5) { cambiaRect(x, y, w, h, TAPADA, DESTAPADA); continue; }   // casi todo ya era tapado: no vale, deshacer lo poco cambiado no importa
    CARTELES.push({ x, y, w, h }); JUEGO.pct = porcentaje(); return;
  }
}

// los carteles se van (del todo) en cuanto se recorta la mitad de su rectángulo
function limpiaAnuncios() {
  for (let i = CARTELES.length - 1; i >= 0; i--) {
    const a = CARTELES[i]; let tap = 0;
    for (let y = a.y; y < a.y + a.h; y++) for (let x = a.x; x < a.x + a.w; x++) if (TAB.cel[idx(x, y)] === TAPADA) tap++;
    if (tap < a.w * a.h * 0.5) CARTELES.splice(i, 1);
  }
}

function pintaLocuras(t) {
  const { x0, y0, c } = TAB;
  for (const a of CARTELES) {
    G.save(); G.beginPath();
    for (let y = a.y; y < a.y + a.h; y++) for (let x = a.x; x < a.x + a.w; x++) if (TAB.cel[idx(x, y)] === TAPADA) G.rect(x0 + x * c, y0 + y * c, c, c);
    G.clip();
    pintaSprite('anuncio', x0 + (a.x + a.w / 2) * c, y0 + (a.y + a.h / 2) * c, a.h * c, 0, COL.oro, 'AD');
    G.restore();
  }
  if (LOC.activa === 'apagon') {
    const px = x0 + (CUR.x + 0.5) * c, py = y0 + (CUR.y + 0.5) * c, r = c * 9 + Math.sin(t * 6) * 4;
    const g = G.createRadialGradient(px, py, r * 0.5, px, py, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.96)');
    G.fillStyle = g; G.fillRect(x0, y0, TAB.w, TAB.h);
  }
  if (LOC.activa === 'espejo') { G.save(); G.globalAlpha = 0.35 + Math.sin(t * 8) * 0.1; G.fillStyle = COL.cian; G.fillRect(x0, y0, 3, TAB.h); G.fillRect(x0 + TAB.w - 3, y0, 3, TAB.h); G.restore(); }
  if (LOC.activa === 'crece') { G.save(); G.globalAlpha = 0.15 + Math.sin(t * 10) * 0.05; G.fillStyle = COL.panel; G.fillRect(x0, y0, TAB.w, TAB.h); G.restore(); }
}
