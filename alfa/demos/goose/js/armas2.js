// Fans of Goose · Las dos armas que se ganan con desafíos (js/desafios.js): la CAMPANA DE DIFUNTOS (cada toque, una onda que sale de ti,
// pega a todo lo que hay en su círculo y lo echa para atrás) y el TIRACHINAS (una piedra a la oca más cercana que atraviesa a varias).
// Mismo sistema que las de js/armas.js: sus cifras por nivel en NIV, su carta en ARMAS y su evolución con una pasiva.
'use strict';

Object.assign(NIV, {
  campana: { cd: [2.6, 2.4, 2.2, 2.0, 1.7], radio: [40, 46, 52, 58, 66], dano: [10, 13, 16, 20, 26] },
  tirachinas: { cd: [0.9, 0.82, 0.75, 0.68, 0.58], n: [1, 1, 2, 2, 3], perfora: [1, 2, 2, 3, 4], dano: [14, 17, 20, 24, 30] },
});
Object.assign(ARMAS, {
  campana: { nombre: 'Campana de difuntos', icono: 'campana', color: '#d9a85a',
    niveles: ['Cada toque, una onda que pega y empuja a todo lo que hay cerca.', 'Onda más grande.', 'Toca más a menudo y pega más.', 'Más grande y más fuerte.', 'Ondas enormes, casi sin parar.'],
    evo: { pasiva: 'plumon', nombre: 'Campana del Juicio', desc: 'Dos ondas seguidas que dejan a las ocas atontadas.' } },
  tirachinas: { nombre: 'Tirachinas', icono: 'tirachinas', color: '#a07a4a',
    niveles: ['Una piedra a la oca más cercana que atraviesa a otra.', 'Atraviesa a una más.', 'Dos piedras a la vez.', 'Más rápido y atraviesa más.', 'Tres piedras, rapidísimas.'],
    evo: { pasiva: 'cadencia', nombre: 'Tirachinas de la Oca Real', desc: 'Cada piedra estalla al final y suelta metralla.' } },
});
const ONDAS = [];     // las ondas de la campana que se ven: { x, y, r, t, dur, evo }
const PIEDRAS = [];   // las piedras del tirachinas: { x, y, vx, vy, vida, dano, perfora, golpeadas, evo }

function armasNuevas(A, dt) {
  if (A.campana) armaCampana(A.campana, dt);
  if (A.tirachinas && A.tirachinas.t <= 0) armaTirachinas(A.tirachinas);
  avanzaPiedras(dt);
  for (let i = ONDAS.length - 1; i >= 0; i--) { ONDAS[i].t += dt; if (ONDAS[i].t >= ONDAS[i].dur) ONDAS.splice(i, 1); }
}

// --- la campana ---
function toque(r, dano, evo) {
  const yo = JUEGO.yo, n = enemigosCerca(yo.x, yo.y, r + 12);
  for (let k = 0; k < n; k++) {
    const e = ENE.lista[CERCA[k]]; if (e.hp <= 0) continue;
    const dx = e.x - yo.x, dy = e.y - yo.y, d = Math.hypot(dx, dy) || 1; if (d > r + e.r) continue;
    danar(e, dano, dx / d, dy / d, 260, true);
    if (evo) { e.vx *= 0.1; e.vy *= 0.1; e.kx *= 0.3; e.ky *= 0.3; }
  }
  if (ONDAS.length < 6) ONDAS.push({ x: yo.x, y: yo.y, r, t: 0, dur: 0.35, evo });
  SONIDO.casilla();
}
function armaCampana(a, dt) {
  if (a.eco > 0) { a.eco -= dt; if (a.eco <= 0) toque(76 * multiArea(), 30 * JUEGO.st.dano * multiDado(), true); }
  if (a.t > 0) return;
  if (a.evo) { toque(76 * multiArea(), 30 * JUEGO.st.dano * multiDado(), true); a.eco = 0.3; a.t = 1.5 * JUEGO.st.cd; tiembla(2); return; }
  toque(nv('campana', 'radio') * multiArea(), nv('campana', 'dano') * JUEGO.st.dano * multiDado(), false);
  a.t = nv('campana', 'cd') * JUEGO.st.cd;
}

// --- el tirachinas ---
function ocaMasCercana(rango) {
  const yo = JUEGO.yo, n = enemigosCerca(yo.x, yo.y, rango); let mejor = null, md = rango * rango;
  for (let k = 0; k < n; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta) continue; const d = (e.x - yo.x) ** 2 + (e.y - yo.y) ** 2; if (d < md) { md = d; mejor = e; } }
  return mejor;
}
function armaTirachinas(a) {
  const yo = JUEGO.yo, obj = ocaMasCercana(150), n = a.evo ? 3 : nv('tirachinas', 'n');
  const base = obj ? Math.atan2(obj.y - yo.y, obj.x - yo.x) : Math.atan2(yo.miraY, yo.miraX);
  for (let i = 0; i < n; i++) {
    if (PIEDRAS.length >= 40) break;
    const an = base + (i - (n - 1) / 2) * 0.18;
    PIEDRAS.push({ x: yo.x, y: yo.y, vx: Math.cos(an) * 220, vy: Math.sin(an) * 220, vida: 0.8, dano: (a.evo ? 34 : nv('tirachinas', 'dano')) * JUEGO.st.dano * multiDado(), perfora: a.evo ? 5 : nv('tirachinas', 'perfora'), golpeadas: [], evo: a.evo });
  }
  a.t = (a.evo ? 0.5 : nv('tirachinas', 'cd')) * JUEGO.st.cd;
  SONIDO.lanza();
}
function avanzaPiedras(dt) {
  for (let i = PIEDRAS.length - 1; i >= 0; i--) {
    const p = PIEDRAS[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt;
    const n = enemigosCerca(p.x, p.y, 14);
    for (let k = 0; k < n && p.perfora >= 0; k++) {
      const e = ENE.lista[CERCA[k]]; if (e.hp <= 0 || e.oculta || p.golpeadas.includes(e.id)) continue;
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 > (e.r + 3) ** 2) continue;
      const d = Math.hypot(p.vx, p.vy) || 1; danar(e, p.dano, p.vx / d, p.vy / d, 90); p.golpeadas.push(e.id); p.perfora--;
    }
    if (p.vida <= 0 || p.perfora < 0) {
      if (p.evo) { estallido(p.x, p.y, 10, '#d9a85a', 80, 0.4, 2, 1, 20); const m = enemigosCerca(p.x, p.y, 26); for (let k = 0; k < m; k++) { const e = ENE.lista[CERCA[k]]; if (e.hp > 0 && Math.hypot(e.x - p.x, e.y - p.y) < 22 + e.r) danar(e, p.dano * 0.6, 0, -1, 60, true); } }
      PIEDRAS.splice(i, 1);
    }
  }
}

// --- dibujo ---
function pintaArmasNuevas() {
  for (const o of ONDAS) {
    const k = o.t / o.dur;
    G.globalAlpha = (1 - k) * 0.8; G.strokeStyle = o.evo ? '#ffd34d' : '#d9a85a'; G.lineWidth = 3 * (1 - k) + 1;
    G.beginPath(); G.arc(o.x, o.y, o.r * (0.3 + k * 0.7), 0, 6.283); G.stroke();
  }
  G.globalAlpha = 1;
  for (const p of PIEDRAS) { G.fillStyle = '#120808'; G.fillRect(p.x - 2, p.y - 2, 4, 4); G.fillStyle = p.evo ? '#ffd34d' : '#a09080'; G.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
}
function vaciaArmasNuevas() { ONDAS.length = 0; PIEDRAS.length = 0; }
