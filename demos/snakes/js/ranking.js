// Fans of Snakes · Reto diario y ranking mundial (servidor/77-snakes-ranking.sql). El Reto diario es una partida de Infinito con
// la semilla del día (js/modos.js): los mismos muros, manzanas, cartas y locuras para todo el mundo. Se puede jugar las veces que
// quieras: cuenta la mejor. Tu mejor marca de Infinito y la del reto de hoy se suben al acabar (con la cuenta de invitado de core,
// sin pedir nada); si no hay red, al arrancar o al volver la conexión. En el ranking solo sale tu apodo y tu marca.
'use strict';

const RANKING = { pestana: 'infinito', datos: {}, cargando: false, error: false };
const hayRanking = () => typeof CUENTA !== 'undefined' && CUENTA.activa;

function guardaReto(puntos, manzanas, seg) {
  const dia = hoy();
  if (!SAVE.reto || SAVE.reto.dia !== dia) SAVE.reto = { dia, mejor: 0, manzanas: 0, seg: 0, intentos: 0, subida: true };
  const r = SAVE.reto; r.intentos++;
  if (puntos > r.mejor) { Object.assign(r, { mejor: puntos, manzanas, seg, subida: false }); JUEGO.fin.recordReto = true; }
  subeReto();
}

function subeMarca(puntos, manzanas, seg) {
  if (!hayRanking() || puntos <= 0) return;
  CUENTA.rpc('snakes_marca', { p_puntos: Math.round(puntos), p_manzanas: Math.round(manzanas), p_segundos: Math.max(1, Math.round(seg)) })
    .then(() => { SAVE.marcaSubida = Math.max(SAVE.marcaSubida || 0, puntos); guarda(); RANKING.datos.infinito = null; })
    .catch(e => { if (/marca_imposible/.test(String(e && (e.message || e)))) { SAVE.marcaSubida = Math.max(SAVE.marcaSubida || 0, puntos); guarda(); } });
}
function subeReto() {
  const r = SAVE.reto;
  if (!hayRanking() || !r || !r.mejor || r.subida) return;
  CUENTA.rpc('snakes_reto_marca', { p_dia: r.dia, p_puntos: Math.round(r.mejor), p_manzanas: Math.round(r.manzanas || 0), p_segundos: Math.max(1, Math.round(r.seg || 10)) })
    .then(() => { r.subida = true; guarda(); RANKING.datos.reto = null; })
    .catch(e => { if (/marca_imposible|dia_no_vale/.test(String(e && (e.message || e)))) { r.subida = true; guarda(); } });
}
// al arrancar (y al volver la red): lo que aún no esté subido. Las marcas de antes del ranking no tienen sus manzanas: se estiman por lo alto
function subePendiente() {
  if (SAVE.record > (SAVE.marcaSubida || 0)) subeMarca(SAVE.record, Math.ceil(SAVE.record / 12), Math.max(30, SAVE.record / 25));
  subeReto();
}
window.addEventListener('online', () => setTimeout(subePendiente, 1500));

function cargaRanking(pestana) {
  if (!hayRanking() || RANKING.cargando) return;
  RANKING.cargando = true; RANKING.error = false;
  (pestana === 'reto' ? CUENTA.rpc('snakes_reto_ranking', { p_dia: hoy() }) : CUENTA.rpc('snakes_ranking', {}))
    .then(d => { RANKING.datos[pestana] = d || { lista: [], yo: null, total: 0 }; })
    .catch(() => { RANKING.error = true; })
    .finally(() => { RANKING.cargando = false; });
}
function abreRanking(pestana = 'infinito') { alMenu('ranking'); RANKING.pestana = pestana; RANKING.datos[pestana] = null; cargaRanking(pestana); }

function pintaRanking(W, H) {
  const y0 = TAB.y0, R = RANKING, d = R.datos[R.pestana];
  G.fillStyle = 'rgba(6,17,10,0.86)'; G.fillRect(0, 0, W, H);
  letra(tr('RANKING MUNDIAL'), W / 2, y0 + 12, 14, '#d36bff', 'center', '#06110a', 3);
  const pest = (id, txt, x) => { const on = R.pestana === id; botonUI(txt, x, y0 + 24, 86, 16, () => { R.pestana = id; if (!R.datos[id]) cargaRanking(id); }, on ? '#d36bff' : '#2a2140', on ? '#06110a' : '#cbb6ff', 7.5); };
  pest('infinito', tr('INFINITO'), W / 2 - 89); pest('reto', tr('RETO DE HOY'), W / 2 + 3);
  const y = y0 + 50;
  if (!hayRanking()) letra(tr('El ranking necesita conexión'), W / 2, y + 40, 8, '#cfe', 'center', null, 0, 700);
  else if (R.error) { letra(tr('No se ha podido cargar'), W / 2, y + 40, 8, '#ff6b6b', 'center', null, 0, 700); botonUI(tr('REINTENTAR'), W / 2 - 40, y + 52, 80, 16, () => cargaRanking(R.pestana), '#d36bff'); }
  else if (!d) letra(tr('Cargando…'), W / 2, y + 40, 8, '#cfe', 'center', null, 0, 700);
  else {
    const fila = (f, yy) => {
      caja(12, yy - 7, W - 24, 13, 4, f.yo ? '#3b1466' : (f.puesto % 2 ? '#10251a' : '#0c1d13'), f.yo ? '#d36bff' : null, 1);
      const col = f.puesto === 1 ? '#ffd54a' : f.puesto === 2 ? '#e0e0e0' : f.puesto === 3 ? '#ff9a5a' : '#9fb3a6';
      letra(String(f.puesto), 26, yy, 7.5, col, 'right', null, 0);
      letra(String(f.nombre || '').slice(0, 16), 32, yy, 7.5, '#fff', 'left', null, 0, 700);
      letra(Number(f.puntos).toLocaleString('es-ES'), W - 16, yy, 7.5, '#ffd54a', 'right', null, 0);
    };
    const filas = Math.max(5, Math.floor((H - y - 70) / 14));
    if (!d.lista.length) letra(tr('Todavía no hay nadie: ¡sé el primero!'), W / 2, y + 40, 8, '#cfe', 'center', null, 0, 700);
    d.lista.slice(0, filas).forEach((f, i) => fila(f, y + 6 + i * 14));
    const yYo = y + 6 + Math.min(filas, d.lista.length) * 14 + 6;
    if (d.yo && d.yo.puesto > filas) { letra('…', W / 2, yYo - 4, 8, '#9fb3a6', 'center', null, 0); fila(d.yo, yYo + 8); }
    else if (!d.yo) letra(R.pestana === 'reto' ? tr('Juega el reto de hoy para salir aquí') : tr('Haz un récord en Infinito para salir aquí'), W / 2, yYo + 8, 7, '#9fb3a6', 'center', null, 0, 700);
    letra(tr('{n} jugadores', { n: d.total }), W / 2, yYo + 24, 6.5, '#9fb3a6', 'center', null, 0, 700);
  }
  const atras = () => alMenu('menu');
  if (R.pestana === 'reto') botonUI(tr('JUGAR EL RETO'), W / 2 - 92, H - 34, 88, 20, () => empieza('reto'), '#7fd7ff', '#06110a', 8);
  botonUI(tr('VOLVER'), R.pestana === 'reto' ? W / 2 + 4 : W / 2 - 44, H - 34, 88, 20, atras, '#9cff6b');
  UI.enter = atras; UI.atras = atras;
}
