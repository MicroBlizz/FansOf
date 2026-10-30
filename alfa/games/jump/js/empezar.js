// Fans of Jump · Cómo se empieza: el botón «¡A JUGAR!» de la portada quita el menú y deja solo el río y el conejo, con un
// aro que late a su alrededor y una patita que lo toca, tira hacia abajo y suelta (y salen los puntitos). El primer salto
// empieza la partida.
'use strict';

function aJugar() { JUEGO.modo = 'listo'; PANEL.abierto = null; SONIDO.boton(); }

// una patita de conejo (almohadilla y tres deditos rosas), la que enseña cómo se tira
function pata(x, y, s = 1) {
  aqui(x, y, -0.25, s, s, () => {
    elipse(0, 0, 7, 6.2, '#ffffff', OLC, 1);
    elipse(0, 1, 3.4, 2.8, '#ffb3c8', null);
    for (const [dx, dy] of [[-3.8, -3.6], [0, -4.8], [3.8, -3.6]]) elipse(dx, dy, 1.5, 1.4, '#ffb3c8', null);
  });
}
function pintaListo(t) {
  const W = PAN.W, c = JUEGO.conejo, cy = pantY(c.wy), k = (t / 1.9) % 1, late = 1 + Math.sin(t * 5) * 0.06;
  // arriba: volver a la portada y, en el reto, su cartel
  caja(6, 7, 28, 16, 5, PASTEL.papel, OLC, 0.9); iconoCasa(20, 15.5);
  boton(2, 3, 36, 24, vuelveAlMenu);
  if (RETO.activo) { const r = tr('Reto del día') + (retoDeHoy() ? ' · ' + tr('hoy') + ': ' + retoDeHoy().mejor.toLocaleString('es-ES') + ' €' : ''), rw = anchoLetras(r, 7.5) + 30; caja(W / 2 - rw / 2, 8, rw, 15, 5, PASTEL.lila, OLC, 0.9); iconoCalendario(W / 2 - rw / 2 + 10, 15.5); letras(r, W / 2 + 6, 16, 7.5, '#ffffff', { borde: PASTEL.lilaO, bw: 2 }); }
  if (APUNTA.activo || c.salto) return;
  G.setLineDash([3, 2.5]); G.beginPath(); G.ellipse(c.x, cy, 30 * late, 22 * late, 0, 0, Math.PI * 2); G.lineWidth = 1.4; G.strokeStyle = 'rgba(255,255,255,0.9)'; G.stroke(); G.setLineDash([]);
  const tira = k < 0.18 ? 0 : k < 0.62 ? (k - 0.18) / 0.44 : 1, suelta = k > 0.66;
  if (k < 0.8) {
    G.globalAlpha = suelta ? Math.max(0, 1 - (k - 0.66) / 0.14) : Math.min(1, k / 0.08);
    for (let i = 1; i <= 4; i++) if (tira * 4 >= i - 0.5) elipse(c.x, cy - 12 - i * 7 * (0.4 + tira * 0.6), 1.6, 1.6, '#ffffff', OLC, 0.7);
    pata(c.x + 6, cy - 2 + tira * 26, k < 0.18 ? 1 - Math.sin(k / 0.18 * Math.PI) * 0.12 : 1);
    G.globalAlpha = 1;
  }
  const ct = tr('¡Tira del conejo hacia abajo y suelta!'), ctw = anchoLetras(ct, 8.5) + 20, cby = Math.min(PAN.H - 16, cy + 44) + Math.sin(t * 3);
  caja(W / 2 - ctw / 2, cby - 7 + 1.5, ctw, 15, 7.5, OLC, null); caja(W / 2 - ctw / 2, cby - 7, ctw, 15, 7.5, PASTEL.melocoton, OLC, 0.9);
  letras(ct, W / 2, cby + 0.6, 8.5, '#ffffff', { borde: PASTEL.melocotonO, bw: 2.2 });
}
