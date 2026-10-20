// Fans of Jump · La ola de barro: sube desde abajo empujada por las excavadoras de Microblizz y cada vez va más deprisa.
// Si alcanza a CrazyBunny, se acabó. Nunca se queda muy atrás: si el conejo se aleja mucho, la ola le recorta distancia.
// La ola es una franja de barro 3D que se repite de lado a lado; al principio la empuja la topadora gigante de Microblizz,
// pegada a la ola los primeros 120 m, que luego se va quedando atrás (lo que te persigue es la ola).
'use strict';

const OLA = { wy: -120, vel: 0, activa: false, gotas: [], pala: -130, humo: [], tHumo: 0 };
const ATRAS_MAX = 210;   // lo más lejos que se queda la ola por detrás del conejo

function reiniciaOla(wyConejo) { Object.assign(OLA, { wy: wyConejo - 76, vel: 0, activa: false, gotas: [], pala: wyConejo - 86, humo: [], tHumo: 0 }); }

function avanzaOla(dt, wyConejo, metros) {
  if (!OLA.activa) return;
  OLA.vel = 12 + Math.min(34, metros * 0.09);
  OLA.wy += OLA.vel * dt;
  if (OLA.wy < wyConejo - ATRAS_MAX) OLA.wy += (wyConejo - ATRAS_MAX - OLA.wy) * Math.min(1, dt * 1.5);
  // salpicones de barro por delante de la ola
  if (Math.random() < dt * 10) OLA.gotas.push({ x: Math.random() * PAN.W, wy: OLA.wy + 2, vx: azar(-10, 10), vy: azar(25, 50), v: 0.8, r: azar(1, 2.2) });
  for (const g of OLA.gotas) { g.x += g.vx * dt; g.wy += g.vy * dt; g.vy -= 110 * dt; g.v -= dt; }
  OLA.gotas = OLA.gotas.filter(g => g.v > 0);
  // la topadora empuja la ola pegada a ella los primeros 120 m (se ve bien) y luego va más despacio: se queda atrás
  if (metros < 120) OLA.pala += (OLA.wy - 10 - OLA.pala) * Math.min(1, dt * 3);
  else OLA.pala += OLA.vel * 0.3 * dt;
}
// el humo del tubo de escape (también antes de salir)
function avanzaHumo(dt) {
  OLA.tHumo -= dt;
  if (OLA.tHumo <= 0) { OLA.tHumo = 0.22; OLA.humo.push({ x: PAN.W / 2 - 11 + azar(-1, 1), wy: OLA.pala - 20, r: 2.5, v: 1.4, vx: azar(-4, 2) }); }
  for (const h of OLA.humo) { h.v -= dt; h.r += dt * 5; h.wy += dt * 9; h.x += h.vx * dt; }
  OLA.humo = OLA.humo.filter(h => h.v > 0);
}

function pintaOla(t) {
  const W = PAN.W, H = PAN.H, y0 = pantY(OLA.wy);
  if (y0 > H + 60 && pantY(OLA.pala) > H + 10) return;
  // la franja de barro 3D, repetida a lo ancho (se mueve sola: 6 fotogramas)
  const c = ATLAS.cuadros['ola' + Math.floor(t * 8) % 6], ancho = 130, k = ancho / c[2], alto = c[3] * k, arriba = y0 - alto * 0.34;
  const fondo = G.createLinearGradient(0, arriba + alto - 4, 0, H);
  fondo.addColorStop(0, '#7a4a28'); fondo.addColorStop(1, '#4e2e16');
  G.fillStyle = fondo; G.fillRect(0, arriba + alto * 0.8, W, Math.max(0, H - arriba - alto * 0.8));
  if (laminaLista) for (let x = -((t * 3) % ancho); x < W; x += ancho - 0.5) G.drawImage(LAMINA, c[0], c[1], c[2], c[3], x, arriba, ancho, alto);
  // la topadora gigante (se queda atrás) y su humo
  const yp = pantY(OLA.pala);
  if (yp < H + 10) {
    const p = ATLAS.cuadros['topadora' + Math.floor(t * 10) % 4], ap = W * 0.84, kp = ap / p[2];   // de orilla a orilla
    if (laminaLista) G.drawImage(LAMINA, p[0], p[1], p[2], p[3], W / 2 - ap / 2, yp - 4, ap, p[3] * kp);
  }
  for (const h of OLA.humo) { G.globalAlpha = Math.min(0.7, h.v * 0.6); elipse(h.x, pantY(h.wy), h.r, h.r * 0.85, vol(h.x, pantY(h.wy), h.r, h.r, '#e4e0ea'), null); G.globalAlpha = 1; }
  // salpicones de barro brillante
  for (const g of OLA.gotas) { const y = pantY(g.wy); elipse(g.x, y, g.r, g.r, vol(g.x, y, g.r, g.r, '#8a5530'), '#4a2a14', 0.5); }
}
