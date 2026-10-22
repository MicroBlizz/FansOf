// Fans of Snakes · Pantalla: el marcador de arriba (barra de Frenesí, puntos, monedas), la portada y la tarjeta del final.
// El tablero lo pinta js/tablero.js; aquí se decide el orden y lo que va encima.
'use strict';

const BOTONES = { sonido: null };

function pintaTodo(W, H, dt) {
  const retro = esRetro(), fr = esFrenesi() && JUEGO.modo === 'juego';
  // el fondo de toda la pantalla
  if (retro) { G.fillStyle = '#3a3f33'; G.fillRect(0, 0, W, H); }
  else if (fr) { G.fillStyle = `hsl(${(JUEGO.t * 120 + 200) % 360} 60% ${7 + Math.sin(JUEGO.t * 20) * 2}%)`; G.fillRect(0, 0, W, H); }
  else { G.fillStyle = '#06110a'; G.fillRect(0, 0, W, H); }
  G.save(); aplicaTemblor();
  pintaFondo(retro);
  if (JUEGO.modo !== 'menu') { pintaManzanas(retro); pintaItems(retro); pintaSerpiente(retro); }
  pintaEfectos(retro);
  G.restore();
  if (JUEGO.modo === 'juego') pintaPalanca(retro);
  pintaMarcador(W, retro, fr);
  pintaLocura(W, H);
  if (JUEGO.modo === 'menu') pintaPortada(W, H);
  if (JUEGO.modo === 'fin') pintaFin(W, H);
}

function pintaMarcador(W, retro, fr) {
  const J = JUEGO, y = 6, h = 24;
  if (retro) {   // el marcador del móvil antiguo: números a secas
    G.fillStyle = RETRO.fondo; G.fillRect(TAB.x0 - 3, y, TAB.w + 6, h);
    letraMono(String(J.puntos).padStart(4, '0'), TAB.x0 + 2, y + 12, 10, RETRO.tinta, 'left');
    letraMono(tr('FRENESÍ'), W / 2 - 4, y + 12, 7, RETRO.tinta, 'right');
    pintaBarraFrenesi(W / 2, y + 8, 48, 8, true);
    letraMono('$' + J.monedasPartida, TAB.x0 + TAB.w - 2, y + 12, 10, RETRO.tinta, 'right');
    BOTONES.sonido = null;
    return;
  }
  caja(TAB.x0 - 3, y, TAB.w + 6, h, 5, fr ? '#1a0f2a' : '#0f2a1b', fr ? arcoiris(3, J.t, 55) : '#2a4a36', 1.5);
  // la barra de Frenesí con su nombre
  letra(fr ? tr('¡FRENESÍ!') : tr('FRENESÍ'), TAB.x0 + 4, y + 8, 7, fr ? '#ffd54a' : '#9cff6b', 'left', '#06110a', 2);
  pintaBarraFrenesi(TAB.x0 + 4, y + 13, 70, 7, false);
  if (fr) letra('x' + J.mult + ' · ' + Math.ceil(J.frenesiT), TAB.x0 + 78, y + 16, 7, '#ffd54a', 'left', '#06110a', 2);
  // puntos y monedas
  letra(J.puntos.toLocaleString('es-ES'), TAB.x0 + TAB.w - 4, y + 9, 11, '#fff', 'right', '#06110a', 2.5);
  circulo(TAB.x0 + TAB.w - 26, y + 18.5, 3, '#ffd54a', '#8a5a00', 0.8);
  letra(String(J.monedasPartida), TAB.x0 + TAB.w - 4, y + 18.5, 8, '#ffd54a', 'right', '#06110a', 2);
  // el altavoz (toca para silenciar)
  const bx = W / 2 + 6, by = y + 3; BOTONES.sonido = { x: bx - 6, y: by - 2, w: 20, h: 20 };
  const on = SAVE.musica === 1; G.strokeStyle = on ? '#9cff6b' : '#5a7a66'; G.lineWidth = 1.2; G.fillStyle = G.strokeStyle;
  G.beginPath(); G.moveTo(bx, by + 6); G.lineTo(bx + 3, by + 6); G.lineTo(bx + 7, by + 2); G.lineTo(bx + 7, by + 14); G.lineTo(bx + 3, by + 10); G.lineTo(bx, by + 10); G.closePath(); G.fill();
  if (on) { G.beginPath(); G.arc(bx + 8, by + 8, 4, -0.9, 0.9); G.stroke(); } else { G.beginPath(); G.moveTo(bx + 9, by + 5); G.lineTo(bx + 14, by + 11); G.moveTo(bx + 14, by + 5); G.lineTo(bx + 9, by + 11); G.stroke(); }
}

function pintaPortada(W, H) {
  const t = JUEGO.t, y0 = TAB.y0;
  G.fillStyle = 'rgba(6,17,10,0.55)'; G.fillRect(0, 0, W, H);
  // una serpiente de adorno ondulando bajo el título
  for (let i = 0; i < 12; i++) {
    const x = 28 + i * 12, y = y0 + 120 + Math.sin(t * 3 + i * 0.6) * 6, lat = 10 - i * 0.3;
    caja(x - lat / 2, y - lat / 2, lat, lat, 3, i === 0 ? '#9cff6b' : `hsl(140 70% ${45 - i * 1.5}%)`, '#06110a', 1);
  }
  letra('FANS OF', W / 2, y0 + 56, 13, '#9cff6b', 'center', '#06110a', 3);
  letra('SNAKES', W / 2, y0 + 82, 30, '#3ddc84', 'center', '#06110a', 5);
  letra(tr('Roza tu cola para cargar el Frenesí'), W / 2, y0 + 160, 8, '#fff', 'center', '#06110a', 2.5);
  letra(tr('En Frenesí, córtate la cola por monedas'), W / 2, y0 + 173, 8, '#ffd54a', 'center', '#06110a', 2.5);
  letra(tr('Los «?» son locuras. Tú verás.'), W / 2, y0 + 186, 8, '#7fd7ff', 'center', '#06110a', 2.5);
  if (Math.sin(t * 4) > -0.3) letra(tr('Toca para jugar · arrastra el dedo para girar'), W / 2, y0 + 232, 9, '#fff', 'center', '#06110a', 2.5);
  if (SAVE.record > 0) letra(tr('Récord: {n}', { n: SAVE.record.toLocaleString('es-ES') }), W / 2, y0 + 262, 8, '#9cff6b', 'center', '#06110a', 2);
  if (SAVE.monedas > 0) letra(tr('Monedas: {n}', { n: SAVE.monedas }), W / 2, y0 + 274, 8, '#ffd54a', 'center', '#06110a', 2);
}

function pintaFin(W, H) {
  const J = JUEGO, k = Math.min(1, J.tFin / 0.5), y0 = TAB.y0 + 40;
  if (k <= 0) return;
  G.fillStyle = `rgba(6,17,10,${0.6 * k})`; G.fillRect(0, 0, W, H);
  G.save(); G.translate(0, (1 - k) * -30); G.globalAlpha = k;
  caja(14, y0, W - 28, 150, 10, '#0f2a1b', '#3ddc84', 2);
  letra(J.fin.motivo === 'pared' ? tr('¡Contra la pared!') : tr('¡Te has mordido!'), W / 2, y0 + 20, 13, '#ff4d4d', 'center', '#06110a', 3);
  letra(J.puntos.toLocaleString('es-ES'), W / 2, y0 + 48, 26, '#fff', 'center', '#06110a', 4);
  letra(J.fin.record ? tr('¡Nuevo récord!') : tr('Récord: {n}', { n: SAVE.record.toLocaleString('es-ES') }), W / 2, y0 + 70, 9, J.fin.record ? '#ffd54a' : '#9cff6b', 'center', '#06110a', 2.5);
  letra(tr('Largo: {n}', { n: J.serp.length }) + ' · ' + tr('Frenesís: {n}', { n: J.frenesis }), W / 2, y0 + 90, 8, '#cfe', 'center', '#06110a', 2);
  letra(tr('Monedas: {n}', { n: J.monedasPartida }) + ' · ' + tr('Locuras: {n}', { n: J.locuras }), W / 2, y0 + 103, 8, '#ffd54a', 'center', '#06110a', 2);
  if (J.tFin > 0.8 && Math.sin(J.t * 4) > -0.3) letra(tr('Toca para jugar otra vez'), W / 2, y0 + 130, 9, '#fff', 'center', '#06110a', 2.5);
  G.restore();
}
