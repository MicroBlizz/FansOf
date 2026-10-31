// Fans of Goose · CONTRARRELOJ (31-10-2026, Daniel): llega a la 63 y vence a la Oca Madre lo antes posible. Se juega en la Noche 1 y sin
// Maldición ni Horda, para que todos corran igual. Al ganar: medalla de oro, plata o bronce según el tiempo (CR.medallas), monedas por la
// medalla y tu tiempo sube al RANKING MUNDIAL (servidor/105-goose-contrarreloj.sql: goose_tiempo y goose_ranking, con la cuenta de core,
// también la de invitado). Tu mejor marca se guarda en SAVE.cr.
'use strict';

const CR = {
  medallas: [   // segundos como mucho para cada medalla y las monedas que da
    { id: 'oro', nombre: 'ORO', max: 8 * 60, monedas: 200, color: '#ffd34d' },
    { id: 'plata', nombre: 'PLATA', max: 10 * 60, monedas: 120, color: '#dfe6ee' },
    { id: 'bronce', nombre: 'BRONCE', max: 13 * 60, monedas: 60, color: '#d98a4a' },
  ],
  datos: null, cargando: false, error: false,
};
const reloj = s => Math.floor(s / 60) + ':' + String(Math.floor(s) % 60).padStart(2, '0');
const medallaDe = s => CR.medallas.find(m => s <= m.max) || null;
const hayRanking = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
const crSave = () => { if (!SAVE.cr) SAVE.cr = { mejor: 0, subido: 0, partidas: 0 }; return SAVE.cr; };

function empiezaContrarreloj() { abreSelector(() => { JUEGO.crPedido = true; nuevaPartida(); }); }

// al acabar la partida (lo llama terminaPartida antes de contar las monedas)
function finContrarreloj(gana) {
  const J = JUEGO, S = crSave(); S.partidas++;
  if (!gana) return { gana: false };
  const seg = Math.floor(J.t), M = medallaDe(seg), record = !S.mejor || seg < S.mejor;
  if (M) J.monedasPartida += M.monedas;
  if (record) S.mejor = seg;
  subeTiempo();
  return { gana: true, seg, medalla: M, record };
}
function subeTiempo() {
  const S = crSave(); if (!hayRanking() || !S.mejor || S.subido === S.mejor) return;
  CUENTA.rpc('goose_tiempo', { p_segundos: S.mejor })
    .then(() => { S.subido = S.mejor; guarda(); CR.datos = null; })
    .catch(e => { if (/tiempo_imposible/.test(String(e && (e.message || e)))) { S.subido = S.mejor; guarda(); } });
}
addEventListener('online', () => setTimeout(subeTiempo, 1500));
function cargaRanking() {
  if (CR.cargando || !hayRanking()) return;
  CR.cargando = true; CR.error = false;
  CUENTA.rpc('goose_ranking', {})
    .then(d => { CR.datos = d || { lista: [], yo: null, total: 0 }; })
    .catch(() => { CR.error = true; })
    .finally(() => { CR.cargando = false; });
}

// el reloj grande en la partida, con la medalla a la que aún llegas
function pintaRelojCR() {
  const J = JUEGO; if (!J.contrarreloj || J.modo !== 'juego') return;
  const M = medallaDe(J.t), W = PAN.W;
  texto2(reloj(J.t), W / 2, 64, 13, M ? M.color : '#ff4d4d', 'center', FUENTE_G, 400, 0.25);
  texto2(M ? tr('A por el {m}: {t}', { m: tr(M.nombre), t: reloj(M.max) }) : tr('Sin medalla: ¡llega igual!'), W / 2, 75, 6, '#c9b98a');
}

// --- la pantalla del modo: tu marca, las medallas, el ranking mundial y JUGAR ---
function pintaContrarreloj() {
  const W = PAN.W, H = PAN.H, S = crSave();
  G.drawImage(FONDO, 0, 0, W, H); oscurece(0.45);
  texto2(tr('CONTRARRELOJ'), W / 2, 28, 18, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  parrafo(tr('Llega a la casilla 63 y vence a la Oca Madre lo antes posible. Noche 1, sin Maldición ni Horda: todos igual.'), 16, 44, W - 32, 7, '#e8dcc0');
  // tus medallas
  const M = S.mejor ? medallaDe(S.mejor) : null;
  caja(12, 64, W - 24, 34, 7, '#2a1610', M ? M.color : '#6e4426', 1.4);
  texto2(tr('Tu mejor tiempo'), 22, 74, 7, '#c9b98a', 'left');
  texto2(S.mejor ? reloj(S.mejor) : '--:--', 22, 88, 12, '#fff4dc', 'left', FUENTE_G, 400, 0.25);
  CR.medallas.forEach((m, i) => {
    const x = W - 86 + i * 26, ok = S.mejor && S.mejor <= m.max;
    G.globalAlpha = ok ? 1 : 0.35; icono('medalla-' + m.id, x, 78, 9); G.globalAlpha = 1;
    texto2(reloj(m.max), x, 92, 5, ok ? m.color : '#8a7a6a');
  });
  // el ranking mundial
  texto2(tr('Ranking mundial'), W / 2, 110, 9, '#ffd34d', 'center', FUENTE_G, 400, 0.2);
  const y0 = 120, filas = Math.max(3, Math.floor((H - 100 - y0) / 13));
  if (!hayRanking()) texto2(tr('El ranking necesita conexión.'), W / 2, y0 + 14, 7, '#c9b98a');
  else if (!CR.datos) { if (!CR.cargando && !CR.error) cargaRanking(); texto2(CR.error ? tr('No se ha podido cargar. Prueba otra vez en un rato.') : tr('Cargando…'), W / 2, y0 + 14, 7, '#c9b98a'); }
  else if (!CR.datos.lista.length) texto2(tr('Todavía no hay nadie: ¡sé el primero!'), W / 2, y0 + 14, 7, '#c9b98a');
  else {
    const L = CR.datos.lista.slice(0, filas), yo = CR.datos.yo;
    const fila = (f, y) => {
      if (f.yo) caja(12, y - 6, W - 24, 12, 3, '#4a2a08', null);
      const col = f.puesto === 1 ? '#ffd34d' : f.puesto === 2 ? '#dfe6ee' : f.puesto === 3 ? '#d98a4a' : '#fff4dc';
      texto2(String(f.puesto), 26, y, 7, col, 'right'); texto2(String(f.nombre || '').slice(0, 18), 32, y, 7, f.yo ? '#ffd34d' : '#fff4dc', 'left'); texto2(reloj(f.puntos), W - 18, y, 7, col, 'right');
    };
    L.forEach((f, i) => fila(f, y0 + 6 + i * 13));
    if (yo && yo.puesto > L.length) fila(yo, y0 + 6 + L.length * 13);
  }
  botonLosa(30, H - 70, W - 60, 30, tr('¡A CORRER!'), '#e8742a', () => { SONIDO.boton(); empiezaContrarreloj(); }, 13);
  boton(30, H - 34, W - 60, 24, tr('VOLVER'), '#2f74c0', () => { SONIDO.boton(); JUEGO.modo = 'portada'; }, 9);
}
