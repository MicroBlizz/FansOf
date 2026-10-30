// Fans of Jump · El FINAL VERDADERO: a los 9.999 m se acaba el río. Tras el último tronco está la madriguera de CrazyBunny
// (una colina con su puerta redonda) y un montón de animales esperándole y aplaudiendo. CrazyBunny salta hasta la puerta,
// la fiesta de la Fiebre se pone a tope (fiesta.js) y sale CONGRATULATIONS en letras de arcoíris. La marca se apunta como
// siempre (apuntaPartida) y el ranking del servidor rechaza las imposibles (servidor/63-jump-ranking.sql): sin trampas.
'use strict';

const FINAL_M = 9999, FINAL_WY = FINAL_M * 10;
const ORILLA_FINAL = FINAL_WY + 12;     // donde acaba el agua y empieza la pradera
const CASA_WY = FINAL_WY + 118;         // la madriguera
const PUERTA_WY = FINAL_WY + 62;        // donde se queda CrazyBunny, delante de la puerta
const FINAL = { gente: [], letras: 0 };

// el público: muchos animales en filas a los dos lados del camino hasta la puerta (siempre el mismo orden)
function preparaPublico() {
  const W = PAN.W, ids = ['zorro', 'castor', 'suricata', 'mapache', 'ardilla'], g = [];
  let k = 0;
  for (let fila = 0; fila < 5; fila++) {
    const wy = FINAL_WY + 26 + fila * 22, n = 4 + (fila % 2);
    for (let i = 0; i < n; i++) for (const lado of [-1, 1]) {
      const x = W / 2 + lado * (26 + i * (W * 0.42 - 26) / Math.max(1, n - 1) + (fila % 2) * 6);
      if (fila >= 3 && Math.abs(x - W / 2) < W * 0.3) continue;   // detrás, la colina
      g.push({ id: ids[k++ % ids.length], x, wy, tam: 9.5 - fila * 0.5, f: (k * 0.37) % 1 * 6, lado });
    }
  }
  FINAL.gente = g.sort((a, b) => b.wy - a.wy);   // de lo más lejano a lo más cercano
}

function empiezaFinal() {
  const J = JUEGO, c = J.conejo;
  if (J.modo !== 'juego') return;
  J.modo = 'final'; J.tFin = 0; APUNTA.activo = false;
  GUARDA.finales = (GUARDA.finales || 0) + 1;
  apuntaPartida('final');
  preparaPublico();
  FIESTA.nivel = 5; llamaFans(6);   // la fiesta a tope, sin su letrero (aquí manda el CONGRATULATIONS)
  // el último salto, solo, hasta la puerta
  c.tronco = null;
  c.salto = { x0: c.x, wy0: c.wy, x1: PAN.W / 2, wy1: PUERTA_WY, t: 0, T: 0.9, alto: 26 };
  SONIDO.salto();
}
function llegaMadriguera() {
  telFin('final');
  const J = JUEGO, c = J.conejo, s = c.salto;
  c.salto = null; c.x = s.x1; c.wy = s.wy1; c.cae = 1; c.ang = 0;
  confeti(PAN.W / 2, c.wy, 120); for (let i = 0; i < 6; i++) FIESTA.globos.push(globo(true)); for (let i = 0; i < 4; i++) fuego();
  SONIDO.fiesta(5); vibra([40, 60, 40, 60, 120]);
}
const camaraFinal = () => CASA_WY - PAN.H * 0.6;

/* ---------- pintar ---------- */
// la pradera del final, la madriguera y su público (encima del río, debajo de los troncos)
function pintaPradera(t) {
  const W = PAN.W, y0 = pantY(ORILLA_FINAL);
  if (y0 < -10) return;
  // la hierba con su orilla de arena ondulada
  G.beginPath(); G.moveTo(0, -5);
  for (let x = 0; x <= W; x += 5) G.lineTo(x, y0 + 4 + Math.sin(x / 13) * 2.5);
  G.lineTo(W, -5); G.closePath(); G.fillStyle = COL_RIO.arena; G.fill();
  G.beginPath(); G.moveTo(0, -5);
  for (let x = 0; x <= W; x += 5) G.lineTo(x, y0 - 2 + Math.sin(x / 13 + 1) * 2.5);
  G.lineTo(W, -5); G.closePath(); G.fillStyle = COL_RIO.hierba; G.fill();
  // el caminito de piedras hasta la puerta y unas flores
  for (let i = 0; i < 5; i++) elipse(W / 2 + Math.sin(i * 1.7) * 3, pantY(FINAL_WY + 20 + i * 9), 5 - i * 0.4, 2, COL_RIO.piedra, null);
  for (let i = 0; i < 24; i++) { const x = (i * 53) % W, wy = FINAL_WY + 18 + (i * 37) % 150; sprite(i % 2 ? 'flor0' : 'flor1', x, pantY(wy), 4.5); }
  const atras = FINAL.gente.filter(g => g.wy > CASA_WY - 20), delante = FINAL.gente.filter(g => g.wy <= CASA_WY - 20);
  atras.forEach(g => pintaFan(g, t));
  sprite('madriguera', W / 2, pantY(CASA_WY), W * 0.24);
  delante.forEach(g => pintaFan(g, t));
}
// cada animal del público bota y aplaude (las dos fotos de «animando», muy deprisa)
function pintaFan(g, t) {
  const y = pantY(g.wy), bote = Math.abs(Math.sin(t * 6 + g.f)) * 3.5;
  elipse(g.x, y + 1, g.tam * 0.45, g.tam * 0.16, 'rgba(60,90,40,0.25)', null);
  sprite(g.id + '_anima' + (Math.floor(t * 8 + g.f) % 2), g.x, y - bote, g.tam, Math.sin(t * 6 + g.f) * 0.06, g.lado < 0 ? 1 : -1, 1);
}

// CONGRATULATIONS en letras de arcoíris que saltan una a una, y luego la tarjeta con la marca y los botones
function pintaFinalVerdadero() {
  const J = JUEGO, W = PAN.W, H = PAN.H, t = J.tFin;
  if (t < 1.1) return;
  const txt = 'CONGRATULATIONS!', tam = Math.min(16, W / 12.5), anchos = [...txt].map(l => anchoLetras(l, tam, { logo: true }) * 0.98);
  let x = W / 2 - anchos.reduce((a, b) => a + b, 0) / 2;
  const y = H * 0.13;
  [...txt].forEach((l, i) => {
    const k = Math.max(0, Math.min(1, (t - 1.1 - i * 0.05) / 0.3)), pop = k < 1 ? 0.3 + k * 0.9 : 1.2 - Math.min(0.2, (t - 1.4 - i * 0.05) * 0.8);
    if (k > 0) aqui(x + anchos[i] / 2, y + Math.sin(t * 4 + i * 0.6) * 2.5, Math.sin(t * 3 + i) * 0.08, pop, pop, () => letras(l, 0, 0, tam, ARCOIRIS[i % 7], { logo: true, borde: '#ffffff', bw: 3.4 }));
    x += anchos[i];
  });
  if (t > 1.9) {
    G.globalAlpha = Math.min(1, (t - 1.9) * 3);
    letras(tr('¡Has llegado a la madriguera!'), W / 2, y + 20, 9.5, '#ffffff', { borde: OLC, bw: 2.6 });
    letras(tr('El final verdadero'), W / 2, y + 31, 7.5, PASTEL.oro, { borde: OLC, bw: 2.2 });
    G.globalAlpha = 1;
  }
  if (t < 4.5) return;
  // la tarjeta de abajo: la marca y otra vez o a la portada
  const e = Math.min(1, (t - 4.5) / 0.3), cw = W - 40, chh = 74, cx = 20, cy = H - chh - 18 + (1 - e) * 30;
  G.globalAlpha = e;
  caja(cx + 2, cy + 3, cw, chh, 6, 'rgba(40,25,60,0.35)', null);
  caja(cx, cy, cw, chh, 6, PASTEL.papel, OLC, 1);
  letras(tr('Huida') + ': ' + J.metros.toLocaleString('es-ES') + ' m', W / 2, cy + 11, 8, PASTEL.texto);
  letras(tr('Pérdidas de Microblizz') + ': ' + J.puntos.toLocaleString('es-ES') + ' €', W / 2, cy + 22, 7.5, PASTEL.texto);
  const bw = 96, bh = 20, bx = W / 2 - bw / 2 + 16, by = cy + chh - 28;
  caja(bx, by + 2, bw, bh, 5, OLC, null); caja(bx, by, bw, bh, 5, PASTEL.melocoton, OLC, 1);
  letras(tr('¡Más caos!'), bx + bw / 2, by + 10.5, 12, '#ffffff', { logo: true, borde: PASTEL.melocotonO, bw: 2.6 });
  const mx = bx - 36, mw = 28;
  caja(mx, by + 2, mw, bh, 5, OLC, null); caja(mx, by, mw, bh, 5, PASTEL.papel, OLC, 1); iconoCasa(mx + mw / 2, by + 10);
  G.globalAlpha = 1;
  if (e >= 1) boton(bx - 6, by - 6, bw + 12, bh + 12, () => { nuevaPartida('listo'); SONIDO.boton(); });
  if (e >= 1) boton(mx - 4, by - 4, mw + 8, bh + 8, vuelveAlMenu);
}
