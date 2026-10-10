// Fans of Roguelite · El directo: la partida se emite «en directo». Arriba, la etiqueta EN DIRECTO con los espectadores, que
// suben con lo espectacular (críticos, jefes, legendarias…). Abajo, el panel cuenta lo que va pasando, y la primera vez de
// cada cosa Lola deja un consejo (sin parar el juego).
'use strict';

// lo espectacular trae espectadores
function espectadores(tipo) { if (ESPECTA[tipo]) VIAJE.esp += Math.round(ESPECTA[tipo] * (0.6 + Math.random()) * (1 + VIAJE.mundo * 0.5)); }
// el consejo de Lola la primera vez de cada cosa: una línea dorada en lo que va pasando
function consejo(k) {
  const T = GUARDA.consejos;
  if (!CONSEJOS[k] || T[k]) return;
  T[k] = 1; guarda();
  LOG.push({ txt: 'Lola: ' + tr(CONSEJOS[k]), t0: RELOJ.t, lola: true });
  if (LOG.length > 60) LOG.shift();
}
function avanzaDirecto(dt) { if (VIAJE.modo === 'juego') VIAJE.espVista += (VIAJE.esp - VIAJE.espVista) * Math.min(1, dt * 2); }
function nuevoDirecto() { VIAJE.esp = VIAJE.espVista = Math.round(60 + VIAJE.mundo * 140 + Math.random() * 40 + Math.min(200, GUARDA.partidas * 4)); }
const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, IDIOMA_RL === 'es' ? '.' : ',');

// la etiqueta EN DIRECTO con los espectadores
function pintaDirecto(ctx, x, y) {
  const t = tr('EN DIRECTO'), w = anchoTexto(t) + 12;
  ctx.fillStyle = OL; ctx.fillRect(x, y, w + 2, 11);
  ctx.fillStyle = '#e91e3c'; ctx.fillRect(x + 1, y + 1, w, 9);
  if (Math.sin(RELOJ.t * 4) > -0.3) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 3, y + 4, 3, 3); }
  escribe(ctx, t, x + 9, y + 2, { c: '#ffffff', borde: null });
  // el muñequito y cuántos miran
  const px = x + w + 6;
  ctx.fillStyle = OL; ctx.fillRect(px - 1, y + 1, 5, 4); ctx.fillRect(px - 2, y + 5, 7, 5);
  ctx.fillStyle = '#ffb0b8'; ctx.fillRect(px, y + 2, 3, 2); ctx.fillRect(px - 1, y + 6, 5, 3);
  escribe(ctx, miles(VIAJE.espVista), px + 7, y + 2, { c: '#ffb0b8' });
}

// lo que va pasando, de abajo arriba en el hueco [ya, yb]; la línea más nueva se escribe letra a letra
function pintaLog(ctx, W, ya, yb) {
  const ancho = W - 22, filas = [], cabe = Math.floor((yb - ya) / LINEA);
  if (cabe < 1) return;
  for (let i = LOG.length - 1; i >= 0 && filas.length < cabe; i--) {
    const e = LOG[i], ls = envuelve(e.txt, ancho);
    for (let j = ls.length - 1; j >= 0 && filas.length < cabe; j--) filas.unshift({ l: ls[j], j, e, antes: ls.slice(0, j).reduce((s, q) => s + q.length + 1, 0) });
  }
  const ult = LOG[LOG.length - 1];
  let y = yb - filas.length * LINEA;
  for (const f of filas) {
    const e = f.e, nueva = e === ult, vis = nueva ? Math.floor((RELOJ.t - e.t0) * 70) - f.antes : undefined;
    if (f.j === 0) escribe(ctx, '>', 7, y, { c: e.lola ? COL.oro : nueva ? COL.oro : '#6a4a9a' });
    if (vis === undefined || vis > 0) escribe(ctx, f.l, 15, y, { c: e.lola ? '#ffe08a' : nueva ? COL.tinta : COL.tenue, hasta: vis });
    y += LINEA;
  }
}
