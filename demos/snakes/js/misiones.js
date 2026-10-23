// Fans of Snakes · Misiones del día: tres al día, iguales para todo el mundo (salen de la fecha), con su premio en monedas. Lo que
// pasa en la partida avisa con mision('tipo', cuánto) (o mision('tipo', valor, true) si cuenta el máximo, como la racha). Se
// cuentan entre partidas del mismo día y se cobran en la portada. Para añadir una: otra línea en MISIONES.
'use strict';

const MISIONES = [
  { id: 'manzanas', texto: 'Come {n} manzanas', n: [40, 70, 100] },
  { id: 'frenesi', texto: 'Haz {n} Frenesís', n: [2, 4, 6] },
  { id: 'trozos', texto: 'Corta {n} trozos de cola', n: [20, 40, 60] },
  { id: 'locuras', texto: 'Coge {n} locuras', n: [3, 6, 9] },
  { id: 'racha', texto: 'Consigue una racha x{n}', n: [4, 6, 8], max: true },
  { id: 'largo', texto: 'Llega a medir {n}', n: [20, 30, 40], max: true },
  { id: 'fase', texto: 'Supera {n} fases nuevas', n: [1, 2, 3] },
  { id: 'vs', texto: 'Gana {n} VS', n: [1, 2, 3] },
  { id: 'reto', texto: 'Juega el Reto diario', n: [1, 1, 1] },
];
const PREMIO_MISION = [30, 50, 80];   // por dificultad

// las de hoy: tres distintas, una de cada dificultad, sacadas de la fecha (la misma para todos)
function misionesDeHoy() {
  const dia = hoy();
  if (SAVE.misiones && SAVE.misiones.dia === dia) return SAVE.misiones.lista;
  let h = 0; for (const ch of dia) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pool = MISIONES.map((m, i) => i), lista = [];
  for (let d = 0; d < 3; d++) { const k = pool.splice(h % pool.length, 1)[0]; h = (h * 1103515245 + 12345) >>> 0; lista.push({ id: MISIONES[k].id, n: MISIONES[k].n[d], dif: d, va: 0, cobrada: false }); }
  SAVE.misiones = { dia, lista };
  return lista;
}

function mision(id, cuanto = 1, esMax = false) {
  const lista = misionesDeHoy();
  for (const m of lista) {
    if (m.id !== id || m.va >= m.n) continue;
    m.va = esMax ? Math.max(m.va, cuanto) : m.va + cuanto;
    if (m.va >= m.n) { m.va = m.n; if (JUEGO.modo === 'juego') numero(PAN.W / 2, TAB.y0 + 40, tr('¡Misión cumplida!'), '#ffd54a', 10); }
  }
}

function cobraMision(m) {
  if (m.cobrada || m.va < m.n) return;
  m.cobrada = true; SAVE.monedas += PREMIO_MISION[m.dif]; guarda();
  chispa(PAN.W / 2, PAN.H * 0.75, '#ffd54a', 20, 90); SONIDO.elige();
}

function pintaMisiones(x, y, w) {
  const lista = misionesDeHoy();
  letra(tr('MISIONES DE HOY'), x + 2, y, 8, '#ffd54a', 'left', '#06110a', 2);
  lista.forEach((m, i) => {
    const M = MISIONES.find(q => q.id === m.id), yy = y + 8 + i * 24, hecha = m.va >= m.n;
    caja(x, yy, w, 21, 5, m.cobrada ? '#0c1d13' : '#10251a', hecha && !m.cobrada ? '#ffd54a' : '#2a4a36', 1.2);
    letra(tr(M.texto, { n: m.n }), x + 5, yy + 7, 6.8, m.cobrada ? '#5a7a66' : '#fff', 'left', null, 0, 700);
    // la barra de progreso y el premio
    const bw = w - 62; caja(x + 5, yy + 13, bw, 4, 2, '#06110a', null);
    G.fillStyle = hecha ? '#ffd54a' : '#3ddc84'; G.fillRect(x + 5.5, yy + 13.5, (bw - 1) * Math.min(1, m.va / m.n), 3);
    letra(m.va + '/' + m.n, x + 5 + bw + 3, yy + 15, 5.5, '#9fb3a6', 'left', null, 0, 700);
    if (m.cobrada) letra(tr('COBRADA'), x + w - 22, yy + 10.5, 6, '#5a7a66', 'center', null, 0);
    else if (hecha) botonUI('+' + PREMIO_MISION[m.dif], x + w - 38, yy + 3.5, 33, 14, () => cobraMision(m), '#ffd54a', '#06110a', 7.5);
    else { circulo(x + w - 30, yy + 10.5, 3, '#ffd54a', '#8a5a00', 0.8); letra(String(PREMIO_MISION[m.dif]), x + w - 24, yy + 11, 6.5, '#ffd54a', 'left', null, 0); }
  });
}
