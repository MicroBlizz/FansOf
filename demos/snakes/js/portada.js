// Fans of Snakes · Portada: el título, los modos (Infinito, Mundos, Reto diario, VS), la Tienda y el Ranking, y las tres
// misiones del día con su botón de cobrar. En el marcador de arriba, fuera de la partida, salen tus monedas y tu récord.
'use strict';

function pintaPortada(W, H) {
  const t = JUEGO.t, y0 = TAB.y0;
  G.fillStyle = 'rgba(6,17,10,0.6)'; G.fillRect(0, 0, W, H);
  // el título y una serpiente de adorno
  letra('FANS OF', W / 2, y0 + 16, 11, '#9cff6b', 'center', '#06110a', 3);
  letra('SNAKES', W / 2, y0 + 38, 28, '#3ddc84', 'center', '#06110a', 5);
  for (let i = 0; i < 12; i++) {
    const x = 34 + i * 11.5, y = y0 + 62 + Math.sin(t * 3 + i * 0.6) * 4, lat = 9 - i * 0.3;
    caja(x - lat / 2, y - lat / 2, lat, lat, 3, colorPiel(i, 12, t, i === 0), '#06110a', 1);
  }
  // los modos
  const x0 = 16, w = W - 32, mitad = (w - 6) / 2;
  botonUI(tr('JUGAR · INFINITO'), x0, y0 + 76, w, 26, () => empieza('infinito'), '#3ddc84', '#06110a', 11);
  botonUI(tr('MUNDOS'), x0, y0 + 108, mitad, 22, () => alMenu('mapa'), '#9cff6b');
  botonUI(tr('RETO DIARIO'), x0 + mitad + 6, y0 + 108, mitad, 22, () => empieza('reto'), '#7fd7ff');
  botonUI(tr('VS'), x0, y0 + 136, mitad, 22, () => empieza('vs'), '#ff6b6b');
  botonUI(tr('TIENDA'), x0 + mitad + 6, y0 + 136, mitad, 22, () => alMenu('tienda'), '#ffd54a');
  botonUI(tr('RANKING MUNDIAL'), x0, y0 + 164, mitad, 20, () => abreRanking(), '#d36bff', '#06110a', 8);
  botonUI(tr('OPCIONES'), x0 + mitad + 6, y0 + 164, mitad, 20, abreOpciones, '#9fb3a6', '#06110a', 8);
  // las estrellas de los mundos y el reto de hoy, pequeñito encima de sus botones
  const est = totalEstrellas(); if (est) { estrella(x0 + mitad - 22, y0 + 110, 3.5); letra(String(est), x0 + mitad - 4, y0 + 110.5, 6.5, '#ffd54a', 'right', '#06110a', 2); }
  if (SAVE.reto && SAVE.reto.dia === hoy() && SAVE.reto.mejor) letra(String(SAVE.reto.mejor), x0 + w - 4, y0 + 110, 6.5, '#fff', 'right', '#06110a', 2);
  pintaMisiones(x0, y0 + 194, w);
  UI.enter = () => empieza('infinito');
}

// el marcador fuera de la partida: tus monedas y tu récord
function pintaMarcadorMenu(W) {
  const y = 6, h = 24;
  caja(TAB.x0 - 3, y, TAB.w + 6, h, 5, '#0f2a1b', '#2a4a36', 1.5);
  letra(tr('Récord: {n}', { n: SAVE.record.toLocaleString('es-ES') }), TAB.x0 + 6, y + 12.5, 8, '#9cff6b', 'left', '#06110a', 2);
  circulo(TAB.x0 + TAB.w - 8, y + 12, 4, '#ffd54a', '#8a5a00', 1);
  letra(SAVE.monedas.toLocaleString('es-ES'), TAB.x0 + TAB.w - 15, y + 12.5, 10, '#ffd54a', 'right', '#06110a', 2.5);
}
