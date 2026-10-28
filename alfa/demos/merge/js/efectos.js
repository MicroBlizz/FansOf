// Fans of Merge · EFECTOS: las animaciones que no cambian las reglas. Piezas que vuelan a juntarse, la nueva que salta,
// bichos que andan o saltan, chispas, puntos que suben, avisos grandes y el cartel de cada evento.
// Todo va en casillas (x, y del tablero); js/pintar.js lo pasa a la pantalla.
'use strict';
const MG_FX = { t: 0, anim: new Map(), fantasmas: [], parts: [], textos: [], avisos: [], cartel: null, temblor: 0, ondas: [], estreno: null, racha: 0 };
const MG_MAX_PARTS = 140;
const mgAhora = () => MG_FX.t;
function mgFxLimpia() { MG_FX.anim.clear(); MG_FX.fantasmas.length = 0; MG_FX.parts.length = 0; MG_FX.textos.length = 0; MG_FX.avisos.length = 0; MG_FX.cartel = null; MG_FX.ondas.length = 0; MG_FX.estreno = null; }

function mgParte(x, y, col, n = 8, fuerza = 2.2, vida = 0.6) {
  for (let i = 0; i < n && MG_FX.parts.length < MG_MAX_PARTS; i++) {
    const a = Math.random() * Math.PI * 2, v = fuerza * (0.4 + Math.random());
    MG_FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.2, col, t0: mgAhora(), vida: vida * (0.6 + Math.random() * 0.6), r: 0.05 + Math.random() * 0.06 });
  }
}
// la pieza nueva salta (con un poco de retraso si viene detrás de otra cosa)
function mgFxNace(x, y, retraso = 0) { const c = MG_P.B[y][x]; if (c) MG_FX.anim.set(c.id, { tipo: 'nace', t0: mgAhora() + retraso }); }
// una fusión: las piezas quitadas vuelan hasta la casilla y la nueva sale con chispas
function mgFxJunta(p, i) {
  const t0 = mgAhora() + i * 0.18;
  for (const q of p.quitadas) MG_FX.fantasmas.push({ tipo: q.p.t, s: q.p.s, fx: q.x, fy: q.y, tx: p.x, ty: p.y, t0, dur: 0.2 });
  MG_FX.fantasmas.push({ tipo: p.de, s: false, fx: p.x, fy: p.y, tx: p.x, ty: p.y, t0, dur: 0.2 });
  const c = MG_P.B[p.y][p.x]; if (c) MG_FX.anim.set(c.id, { tipo: 'nace', t0: t0 + 0.2 });
  setTimeout(() => { mgParte(p.x, p.y, p.dorada ? '#ffd84a' : MG_PIEZAS[p.nuevo].col, p.dorada ? 26 : 16, 3); mgParte(p.x, p.y, '#ffffff', 6, 2.4); MG_FX.ondas.push({ x: p.x, y: p.y, t0: mgAhora(), col: p.dorada ? '#ffe14d' : '#ffffff', grande: i + 1 }); MG_FX.temblor = Math.max(MG_FX.temblor, 0.08 + i * 0.04); }, (i * 0.18 + 0.2) * 1000);
}
function mgFxMueve(movidos) {
  for (const m of movidos) {
    const c = MG_P.B[m.a[1]][m.a[0]]; if (!c) continue;
    MG_FX.anim.set(c.id, { tipo: m.salto ? 'salta' : 'anda', fx: m.de[0], fy: m.de[1], t0: mgAhora() + 0.12, dur: m.salto ? 0.4 : 0.22 });
  }
}
function mgFxBrillo(x, y) { mgParte(x, y, '#ff8ae0', 14, 2.6); mgParte(x, y, '#9be7ff', 8, 2); }
function mgFxQuita(x, y, con) { mgParte(x, y, con === 'rayo' ? '#ffb02e' : con === 'topo' ? '#a8754a' : '#ffffff', 14, 3); MG_FX.temblor = 0.12; }
function mgFxRompe(x, y, tipo) { mgParte(x, y, (MG_PIEZAS[tipo] || {}).col || '#ccc', 12, 2.6); }
function mgFxCofre(x, y) { mgParte(x, y, '#ffd84a', 22, 3.4, 0.9); }
function mgFxTexto(x, y, txt) { MG_FX.textos.push({ x, y, txt, t0: mgAhora() + 0.15 }); }
function mgFxAviso(txt) { if (MG_FX.avisos.some(a => a.txt === txt)) return; MG_FX.avisos.push({ txt, t0: mgAhora() + MG_FX.avisos.length * 0.5 }); }
function mgFxEstreno(tipo) { MG_FX.estreno = { tipo, t0: mgAhora() }; play('mgEstreno'); for (let i = 0; i < 3; i++) mgParte(2.5, 2.5, ['#ffd84a', '#ff8a2a', '#9be35a'][i], 16, 5, 1.2); }
function mgFxRacha() { MG_FX.racha = mgAhora(); }
function mgFxEvento(E) { MG_FX.cartel = { nombre: tr(E.nombre), texto: tr(E.texto), t0: mgAhora() }; }

// cuánto se desplaza y se estira una pieza en este momento (dx, dy en casillas; sc = escala)
function mgAnimDe(c) {
  const A = MG_FX.anim.get(c.id); if (!A) return null;
  const t = mgAhora() - A.t0;
  if (A.tipo === 'nace') {
    if (t < 0) return { oculta: true };
    if (t > 0.35) { MG_FX.anim.delete(c.id); return null; }
    const k = t / 0.35; return { dx: 0, dy: -Math.sin(k * Math.PI) * 0.18, sc: 0.55 + 0.45 * k + Math.sin(k * Math.PI) * 0.18 };
  }
  const k = clamp(t / A.dur, 0, 1);
  if (t > A.dur) { MG_FX.anim.delete(c.id); return null; }
  const e = k * k * (3 - 2 * k), alto = A.tipo === 'salta' ? Math.sin(k * Math.PI) * 0.6 : Math.sin(k * Math.PI) * 0.12;
  return { mueve: true, fx: A.fx, fy: A.fy, e, dy: -alto, sc: 1 };
}
// avanza lo que se mueve solo (chispas, textos); borra lo que ya acabó
function mgFxAvanza(dt) {
  MG_FX.t += dt; const t = MG_FX.t;
  MG_FX.temblor = Math.max(0, MG_FX.temblor - dt);
  for (const p of MG_FX.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 6 * dt; }
  MG_FX.parts = MG_FX.parts.filter(p => t - p.t0 < p.vida);
  MG_FX.fantasmas = MG_FX.fantasmas.filter(f => t - f.t0 < f.dur);
  MG_FX.textos = MG_FX.textos.filter(x => t - x.t0 < 1.1);
  MG_FX.avisos = MG_FX.avisos.filter(a => t - a.t0 < 2);
  if (MG_FX.cartel && t - MG_FX.cartel.t0 > 2.6) MG_FX.cartel = null;
  MG_FX.ondas = MG_FX.ondas.filter(o => t - o.t0 < 0.5);
  if (MG_FX.estreno && t - MG_FX.estreno.t0 > 2.2) MG_FX.estreno = null;
}
