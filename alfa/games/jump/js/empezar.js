// Fans of Jump · Cómo se empieza: el botón «¡A JUGAR!» de la portada quita el menú y deja solo el río y el conejo, con un
// aro que late a su alrededor y una patita que lo toca, tira hacia abajo y suelta (y salen los puntitos). El primer salto
// empieza la partida. También la mirilla (un objeto del río y del kit): unos cuantos saltos en los que ves dónde caes.
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

/* ---------- la mirilla ---------- */
const MIRILLA_SALTOS = 5;
function iconoMirilla(x, y, r) {
  elipse(x, y, r, r, vol(x, y, r, r, PASTEL.lila), OLC, Math.max(0.5, r * 0.14));
  elipse(x, y, r * 0.62, r * 0.62, '#ffffff', null);
  const l = r * 0.14;
  for (const [a, b, c, d] of [[x - r * 0.95, y, x - r * 0.3, y], [x + r * 0.3, y, x + r * 0.95, y], [x, y - r * 0.95, x, y - r * 0.3], [x, y + r * 0.3, x, y + r * 0.95]]) trazo(a, b, c, d, l * 1.4, OLC, null);
  elipse(x, y, r * 0.18, r * 0.18, '#ff7aa8', null);
}
function cogeMirilla(t, x, wy) {
  const J = JUEGO;
  t.mirilla = false; J.mirilla += MIRILLA_SALTOS;
  aviso(tr('¡Mirilla! {n} saltos', { n: MIRILLA_SALTOS }), x, wy + 30, '#d8c0ff', 10); estrellas(x, wy); SONIDO.zana();
}
