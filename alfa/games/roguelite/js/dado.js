// Fans of Roguelite · El dado: cada día lo tiras tú tocando la pantalla. Sale 1, 2 o 3 y el conejo avanza esas casillas del
// mapa de arriba; si tienes repeticiones (la Pata de conejo de La Madriguera o el Dado de Lola) puedes volver a tirar.
// Aquí está la espera del toque, el giro, el resultado y el dibujo del dado con sus botones.
'use strict';

const DADO = { modo: null, cara: 1, res: 0, t0: 0, repitio: false, caras: 3 };

// una tirada entera: espera el toque, gira y, si quedan repeticiones, deja elegir entre quedarse o volver a tirar
async function tirada() {
  DADO.repitio = false;
  let res = await tiraUna();
  while (H.repes > 0) {
    DADO.modo = 'decide'; DADO.t0 = RELOJ.t;
    consejo('repe');
    const otra = (await esperaEleccion()) === 1;   // 0: vale (toque fuera o botón); 1: otra vez
    if (!otra) break;
    H.repes--; DADO.repitio = true; sonido('toque'); chatEv('repe', null, 0.7, 0);
    res = await tiraUna();
  }
  if (DADO.modo !== 'decide') await espera(0.55);   // un momento para ver el número
  DADO.modo = null;
  return res;
}
async function tiraUna() {
  DADO.modo = 'espera'; DADO.t0 = RELOJ.t; DADO.cara = 1 + Math.floor(Math.random() * DADO.caras);
  consejo('dado');
  if (Math.random() < 0.5) chatEv('dado', null, 1, 12);
  await esperaEleccion();   // el toque en la escena (interfaz.js → toqueLibre)
  DADO.modo = 'gira'; DADO.t0 = RELOJ.t; sonido('dado');
  await anima(0.6, k => { DADO.cara = 1 + Math.floor(k * 14 + RELOJ.t * 3) % DADO.caras; });
  DADO.res = 1 + Math.floor(Math.random() * DADO.caras); DADO.cara = DADO.res;
  DADO.modo = 'resultado'; DADO.t0 = RELOJ.t;
  sonido('elige'); chispas(posDado()[0], posDado()[1], 10, '#fff6ea', 70);
  return DADO.res;
}
// un toque que no cae en ningún botón: tira el dado si toca, o suelta el Zanahorazo si está cargado en un combate
function toqueLibre() {
  if (DADO.modo === 'espera' || DADO.modo === 'decide') { elige(0); return true; }
  if (VIAJE.modo === 'juego' && COMBATE.c && RIVAL && RIVAL.e.vida > 0 && zanaLista(H) && !COMBATE.c.zana) { COMBATE.c.zana = true; sonido('alerta'); return true; }
  return false;
}

/* ---------- el dibujo ---------- */
// dónde flota el dado: delante del conejo, a media altura (y nunca por encima de lo recortado de la escena)
function posDado() {
  const bob = DADO.modo === 'espera' ? Math.round(Math.sin(RELOJ.t * 4) * 2) : 0;
  return [CONEJO.x + 44, Math.max(ESC.Y + ESC.corte + 34, SUELO - 76) + bob];
}
// una cara del dado (14 × 14) con los puntos; «esc» lo agranda
function pintaCara(ctx, x, y, n, esc = 1) {
  const s = 14 * esc, u = esc;
  ctx.fillStyle = OL; ctx.fillRect(x + u, y, s - 2 * u, s); ctx.fillRect(x, y + u, s, s - 2 * u);
  ctx.fillStyle = '#fff6ea'; ctx.fillRect(x + u, y + u, s - 2 * u, s - 2 * u);
  ctx.fillStyle = '#d8ccc0'; ctx.fillRect(x + u, y + s - 2 * u, s - 2 * u, u); ctx.fillRect(x + s - 2 * u, y + u, u, s - 2 * u);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(x + u, y + u, s - 3 * u, u); ctx.fillRect(x + u, y + u, u, s - 3 * u);
  const P = { 1: [[6, 6]], 2: [[3, 3], [9, 9]], 3: [[3, 3], [6, 6], [9, 9]], 4: [[3, 3], [9, 3], [3, 9], [9, 9]], 5: [[3, 3], [9, 3], [6, 6], [3, 9], [9, 9]], 6: [[3, 3], [9, 3], [3, 6], [9, 6], [3, 9], [9, 9]] }[n] || [];
  ctx.fillStyle = n === 1 ? '#e63946' : OL;
  for (const [px, py] of P) ctx.fillRect(x + px * u, y + py * u, 2 * u, 2 * u);
}
function pintaDado(ctx) {
  if (!DADO.modo || VIAJE.modo !== 'juego') return;
  const [cx, cy] = posDado(), t = RELOJ.t - DADO.t0, W = PAN.W, S = 2;   // el dado se dibuja al doble (28 píxeles)
  let x = cx - 14, y = cy - 14;
  if (DADO.modo === 'gira') { x += Math.round(rnd(-2, 2)); y += Math.round(rnd(-2, 2)) - Math.round(salto(Math.min(1, t / 0.6)) * 12); }
  if (DADO.modo === 'espera') {   // el aro que respira y el aviso
    const r = 20 + Math.round(Math.sin(RELOJ.t * 4) * 2);
    ctx.save(); ctx.globalAlpha = 0.3; circuloPx(ctx, cx, cy, r, '#ffcb3d'); ctx.restore();
    if (Math.floor(RELOJ.t * 1.4) % 3 !== 2) escribe(ctx, tr('¡Toca para tirar!'), Math.min(W - 44, Math.max(44, cx)), cy + 19, { alin: 'centro', c: COL.oro });
  }
  if (DADO.modo === 'resultado' || DADO.modo === 'decide') {
    const k = Math.min(1, t / 0.25), esc = S + (k < 1 ? 1 : 0);
    if (esc > S) { x = cx - 21; y = cy - 21; }
    pintaCara(ctx, x, y, DADO.cara, esc);
    escribe(ctx, '¡' + DADO.res + '!', cx, y - 16, { alin: 'centro', c: COL.oro, esc: 2 });
  } else pintaCara(ctx, x, y, DADO.cara, S);
  if (DADO.modo === 'decide') {   // quedarse con la tirada o repetirla (el botón dice cuántas repeticiones quedan)
    const by = cy + 18, bw = 46, bx = Math.max(4, Math.min(W - 2 * bw - 8, cx - bw - 2));
    botonTxt(ctx, bx, by, bw, 16, tr('Vale'), COL.verde, COL.verdeO, () => elige(0));
    botonTxt(ctx, bx + bw + 4, by, bw + 8, 16, tr('Otra vez') + ' x' + H.repes, COL.naranja, COL.naranjaO, () => elige(1));
  }
}
