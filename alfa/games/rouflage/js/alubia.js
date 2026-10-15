// Fans of Rouflage (prototipo) · EL PERSONAJE: la galleta (forma de cortador de galletas, como un monigote de papel). Su silueta
// (lo que se pinta), su «piel» (un lienzo propio donde va la pintura) y cómo se dibuja: sombra, contorno, cara y los adornos de
// cada animal, con movimientos suaves (respira, se contonea al andar, da un saltito al congelarse). Al congelarse vuelve a su
// postura, y todo menos la piel se desvanece (`hielo` va de 0 a 1): solo queda la pintura sobre el suelo. Los adornos también
// se esconden, así nadie tiene ventaja por llevar orejas más pequeñas. (Las funciones se siguen llamando «alubia» por historia.)
'use strict';

const CAJA_W = 48, CAJA_H = 60, PIE_X = 24, PIE_Y = 56;   // la caja donde se pinta una alubia y dónde caen sus pies dentro de ella
const ESC_PIEL = 4;                                       // la piel se guarda a 4 píxeles por unidad: nítida también al ampliar
const BLANCO_PIEL = '#f4f1fa';

/* ---------- la silueta: la galleta (cortador de galletas de jengibre). Origen en los pies; cabe en x -24..24, y -54..0 ---------- */
// piezas redondas: dos piernas, dos brazos (el izquierdo afuera y el derecho saludando), el tronco y la cabeza
const PIEZAS = {
  piernaI: { x: -6, y: -12, largo: 8, ang: Math.PI / 2 + 0.12, r: 5.2 },
  piernaD: { x: 6, y: -12, largo: 8, ang: Math.PI / 2 - 0.12, r: 5.2 },
  brazoI: { x: -10, y: -27, largo: 9, ang: Math.PI - 0.32, r: 4.3 },
  brazoD: { x: 10, y: -28, largo: 9, ang: -0.62, r: 4.3 },
};
const CABEZA = { x: 0, y: -41.5, r: 11.5 };
const POSE_QUIETA = { piernaI: 0, piernaD: 0, brazoI: 0, brazoD: 0, dy: 0 };
// una pieza alargada con las puntas redondas (todas en el mismo sentido de giro, así se suman al rellenar)
function capsula(c, p, giro = 0) {
  const a = p.ang + giro, x2 = p.x + Math.cos(a) * p.largo, y2 = p.y + Math.sin(a) * p.largo;
  c.moveTo(x2 + Math.cos(a - Math.PI / 2) * p.r, y2 + Math.sin(a - Math.PI / 2) * p.r);
  c.arc(x2, y2, p.r, a - Math.PI / 2, a + Math.PI / 2);
  c.arc(p.x, p.y, p.r, a + Math.PI / 2, a + Math.PI * 1.5);
  c.closePath();
}
function trazaTronco(c) {
  c.moveTo(-9, -32); c.bezierCurveTo(-3, -34, 3, -34, 9, -32);
  c.bezierCurveTo(13, -24, 14, -15, 12.5, -10); c.bezierCurveTo(10, -6, -10, -6, -12.5, -10);
  c.bezierCurveTo(-14, -15, -13, -24, -9, -32); c.closePath();
}
function trazaCabeza(c) { c.moveTo(CABEZA.x + CABEZA.r, CABEZA.y); c.arc(CABEZA.x, CABEZA.y, CABEZA.r, 0, Math.PI * 2); c.closePath(); }
// las posturas fijas para congelarse (como en el juego original): cuánto gira cada brazo y pierna desde la del cortador y si el
// cuerpo baja. «Firmes» es la de siempre: brazos pegados al cuerpo, menos papel que pintar
const POSTURAS = {
  firmes: { piernaI: -0.1, piernaD: 0.1, brazoI: -1.13, brazoD: 2.07, dy: 0 },
  saludo: { piernaI: 0, piernaD: 0, brazoI: 0, brazoD: 0, dy: 0 },
  estrella: { piernaI: 0.4, piernaD: -0.4, brazoI: 0.75, brazoD: -0.3, dy: 0 },
  bolita: { piernaI: 1.25, piernaD: -1.25, brazoI: -1.95, brazoD: 2.9, dy: 7 },
};
const ORDEN_POSTURAS = ['firmes', 'saludo', 'estrella', 'bolita'];
const posturaDe = e => POSTURAS[(e && e.postura) || 'firmes'];
// la silueta con las piezas sueltas y los brazos y piernas girados (para el contorno grueso y el recorte mientras se mueve)
function trazaPiezas(c, pose = POSE_QUIETA) {
  c.save(); c.translate(0, pose.dy || 0);   // los puntos del camino se colocan al trazarlos: el desplazamiento se queda en él
  for (const k in PIEZAS) capsula(c, PIEZAS[k], pose[k] || 0);
  trazaTronco(c); trazaCabeza(c);
  c.restore();
}
// la silueta entera. Con `pose`: las piezas sueltas. Sin ella: el borde de fuera, de una pieza, de la postura `postura`
// (para rayas discontinuas, recortes y rellenos)
function trazaAlubia(c, pose, postura = 'firmes') {
  if (pose) { trazaPiezas(c, pose); return; }
  const P = FORMAS[postura] ? FORMAS[postura].contorno : contornoDe(POSTURAS[postura]);
  c.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) c.lineTo(P[i], P[i + 1]); c.closePath();
}
// el borde de fuera de una postura: se pinta grande y se recorre su orilla punto a punto (método de Moore)
function contornoDe(pose) {
  const S = 6, W = CAJA_W * S + 4, H = CAJA_H * S + 4, [, g] = lienzo(W, H, true);
  g.translate(2 + PIE_X * S, 2 + PIE_Y * S); g.scale(S, S); g.beginPath(); trazaPiezas(g, pose); g.fillStyle = '#000'; g.fill();
  const d = g.getImageData(0, 0, W, H).data, lleno = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 127;
  let x0 = -1, y0 = -1;
  for (let y = 0; y < H && x0 < 0; y++) for (let x = 0; x < W; x++) if (lleno(x, y)) { x0 = x; y0 = y; break; }
  const V = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]], orilla = [];
  let x = x0, y = y0, dir = 7;
  for (let n = 0; n < W * H; n++) {
    orilla.push(x, y);
    let k = (dir + 6) % 8, hallado = false;
    for (let m = 0; m < 8; m++, k = (k + 1) % 8) { const nx = x + V[k][0], ny = y + V[k][1]; if (lleno(nx, ny)) { x = nx; y = ny; dir = k; hallado = true; break; } }
    if (!hallado || (x === x0 && y === y0)) break;
  }
  const P = [];
  for (let i = 0; i < orilla.length; i += 2 * 3) P.push((orilla[i] - 2 + 0.5) / S - PIE_X, (orilla[i + 1] - 2 + 0.5) / S - PIE_Y);
  return P;
}
// cada postura, a tamaño real: su borde y su máscara (1 donde hay papel: para medir el camuflaje y saber si un disparo acierta)
const FORMAS = {};
function preparaAlubia() {
  for (const k of ORDEN_POSTURAS) {
    const contorno = contornoDe(POSTURAS[k]), mascara = new Uint8Array(CAJA_W * CAJA_H);
    FORMAS[k] = { contorno, mascara, pixeles: 0 };
    const [, g] = lienzo(CAJA_W, CAJA_H, true);
    g.translate(PIE_X, PIE_Y); g.beginPath(); trazaAlubia(g, null, k); g.fillStyle = '#fff'; g.fill();
    const d = g.getImageData(0, 0, CAJA_W, CAJA_H).data;
    for (let i = 0; i < mascara.length; i++) { mascara[i] = d[i * 4 + 3] > 127 ? 1 : 0; FORMAS[k].pixeles += mascara[i]; }
  }
}
const formaDe = e => FORMAS[(e && e.postura) || 'firmes'];
// una piel nueva, de un solo color, con la forma de una postura
function nuevaPiel(color = BLANCO_PIEL, postura = 'firmes') {
  const [cv, g] = lienzo(CAJA_W * ESC_PIEL, CAJA_H * ESC_PIEL, true);
  g.save(); g.scale(ESC_PIEL, ESC_PIEL); g.translate(PIE_X, PIE_Y); g.beginPath(); trazaAlubia(g, null, postura); g.fillStyle = color; g.fill(); g.restore();
  return [cv, g];
}
// cambiar de postura: la piel toma la forma nueva; lo ya pintado se queda donde coincide y el trozo nuevo sale en blanco
function cambiaPostura(e, postura) {
  if (!POSTURAS[postura] || (e.postura || 'firmes') === postura) return false;
  const [cv, g] = nuevaPiel(BLANCO_PIEL, postura);
  g.save(); g.globalCompositeOperation = 'source-atop'; g.drawImage(e.piel, 0, 0); g.restore();
  e.piel = cv; e.pctx = g; e.postura = postura; if (e.pasos) e.pasos.length = 0;
  return true;
}
// ¿cae este punto del mundo dentro del personaje? (con un margen, para que acertar con el dedo no sea imposible)
function dentroDeAlubia(e, x, y, margen = 0) {
  const bx = x - (Math.round(e.x) - PIE_X), by = y - (Math.round(e.y) - PIE_Y), M = formaDe(e).mascara;
  for (const [dx, dy] of margen ? [[0, 0], [margen, 0], [-margen, 0], [0, margen], [0, -margen], [margen * 0.7, margen * 0.7], [-margen * 0.7, margen * 0.7], [margen * 0.7, -margen * 0.7], [-margen * 0.7, -margen * 0.7]] : [[0, 0]]) {
    const i = Math.round(bx + dx), j = Math.round(by + dy);
    if (i >= 0 && j >= 0 && i < CAJA_W && j < CAJA_H && M[j * CAJA_W + i]) return true;
  }
  return false;
}

/* ---------- adornos de cada personaje (se dibujan mirando a la derecha; `detras` va por debajo del cuerpo) ---------- */
const ADORNOS = {
  // CrazyBunny: orejas (una doblada), corona y capa naranja
  bunny: {
    detras(c) { forma(c, poli(-10, -36, 6, -34, -6, -3, -25, -7), '#ff7a1a'); },
    delante(c) {
      forma(c, ovalo(-7, -57, 5, 13, -0.14), '#f7f3ff'); forma(c, ovalo(-7, -56, 2.2, 9, -0.14), '#ffb3cf', 0);
      forma(c, ovalo(6, -53, 4.8, 9, 0.22), '#f7f3ff'); forma(c, ovalo(13.5, -60, 4.4, 8, 1.15), '#f7f3ff'); forma(c, ovalo(13.5, -60, 1.9, 5.2, 1.15), '#ffb3cf', 0);
      c.save(); c.translate(-1, -49); c.rotate(-0.16);
      forma(c, poli(-7, 2, -7, -5, -3.5, -1.5, 0, -7, 3.5, -1.5, 7, -5, 7, 2), '#ffcb3d', 2); punto(c, 0, -0.5, 1.3, '#ff4b5c');
      c.restore();
    },
  },
  // MadSquirrel: orejitas y cola enorme con su raya
  squirrel: {
    detras(c) {
      forma(c, c => { c.moveTo(-10, -6); c.bezierCurveTo(-34, -2, -40, -30, -28, -44); c.bezierCurveTo(-20, -53, -8, -48, -11, -39); c.bezierCurveTo(-14, -33, -20, -34, -20, -28); c.bezierCurveTo(-20, -20, -12, -16, -10, -6); c.closePath(); }, '#b14d1c');
      c.beginPath(); c.moveTo(-17, -12); c.bezierCurveTo(-30, -16, -32, -32, -24, -40); c.strokeStyle = '#f0a065'; c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
    },
    delante(c) { forma(c, poli(-13, -44, -15, -57, -5, -49), '#b14d1c'); forma(c, poli(13, -44, 15, -57, 5, -49), '#b14d1c'); forma(c, poli(-12, -47, -13.4, -53, -8, -49), '#ff9bb0', 0); forma(c, poli(12, -47, 13.4, -53, 8, -49), '#ff9bb0', 0); },
  },
  // SlyFox: orejas de punta negra y cola con la punta blanca
  fox: {
    detras(c) {
      forma(c, c => { c.moveTo(-10, -8); c.bezierCurveTo(-28, -2, -40, -12, -38, -26); c.bezierCurveTo(-30, -20, -20, -22, -10, -20); c.closePath(); }, '#e8702a');
      forma(c, c => { c.moveTo(-38, -26); c.bezierCurveTo(-39, -18, -35, -12, -29, -9); c.bezierCurveTo(-31, -15, -32, -20, -30, -22); c.closePath(); }, '#fff4e6', 2);
    },
    delante(c) {
      forma(c, poli(-15, -42, -16, -60, -3, -49), '#e8702a'); forma(c, poli(15, -42, 16, -60, 3, -49), '#e8702a');
      forma(c, poli(-15.4, -52, -16, -60, -10.5, -55.4), '#2b1622', 0); forma(c, poli(15.4, -52, 16, -60, 10.5, -55.4), '#2b1622', 0);
    },
  },
  // MeerCat: orejitas, alas de ángel y la aureola
  meercat: {
    detras(c) {
      forma(c, c => { c.moveTo(-12, -30); c.quadraticCurveTo(-34, -46, -36, -22); c.quadraticCurveTo(-28, -24, -26, -15); c.quadraticCurveTo(-20, -20, -12, -18); c.closePath(); }, '#eef2fa');
      raya(c, [-30, -30, -22, -22], '#c3cbe0', 1.6);
    },
    delante(c) {
      forma(c, ovalo(-12, -47, 4.5, 4.5), '#d9b07a'); forma(c, ovalo(12, -47, 4.5, 4.5), '#d9b07a');
      c.strokeStyle = OL; c.lineWidth = 5; c.beginPath(); c.ellipse(0, -58, 10, 3.2, 0, 0, TAU); c.stroke();
      c.strokeStyle = '#ffcb3d'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(0, -58, 10, 3.2, 0, 0, TAU); c.stroke();
    },
  },
  // JunkCoon: orejas grises y cola a rayas
  coon: {
    detras(c) {
      forma(c, c => { c.moveTo(-10, -8); c.bezierCurveTo(-30, -4, -38, -18, -32, -32); c.bezierCurveTo(-26, -26, -18, -22, -10, -20); c.closePath(); }, '#8a8fa6');
      raya(c, [-21, -8, -24, -22], '#3a3d52', 4); raya(c, [-30, -12, -31, -27], '#3a3d52', 4);
    },
    delante(c) { forma(c, ovalo(-12, -49, 5.5, 6), '#8a8fa6'); forma(c, ovalo(12, -49, 5.5, 6), '#8a8fa6'); forma(c, ovalo(-12, -49, 2.4, 3), '#3a3d52', 0); forma(c, ovalo(12, -49, 2.4, 3), '#3a3d52', 0); },
  },
  // el becario vigilante de Microblizz: gorra con la luz de alerta, corbata y acreditación
  becario: {
    detras() {},
    delante(c, e) {
      const x = CABEZA.x, y = CABEZA.y, r = CABEZA.r;
      raya(c, [-1, y - r - 2, -1, y - r - 9], OL, 4); raya(c, [-1, y - r - 2, -1, y - r - 9], '#c3cbe0', 1.8);
      punto(c, -1, y - r - 10, 3.8, OL); punto(c, -1, y - r - 10, 2.3, e && e.alerta > 0.5 ? '#ff4b5c' : e && e.alerta > 0 ? '#ffcb3d' : '#7ee04a');
      forma(c, c => { c.moveTo(x - r, y - 2); c.quadraticCurveTo(x - r, y - r - 2.5, x, y - r - 2.5); c.quadraticCurveTo(x + r, y - r - 2.5, x + r, y - 2); c.lineTo(x + r + 6, y - 1); c.lineTo(x - r, y - 1); c.closePath(); }, '#3a7de0', 2);
      forma(c, poli(-2, -31, 2, -31, 3, -21, 0, -17.5, -3, -21), '#e2403f', 1.6);
      forma(c, c => c.rect(4, -26, 6, 7), '#ffffff', 1.5); c.fillStyle = '#2e8bff'; c.fillRect(5, -24.8, 4, 1.8);
    },
  },
};

/* ---------- cómo se mueve: una postura que se funde poco a poco (nada de saltos bruscos) ---------- */
const QUIETA = { piernaI: 0, piernaD: 0, brazoI: 0, brazoD: 0, dy: 0, salto: 0, inclina: 0, aplasta: 0, cabeza: 0 };
function posturaObjetivo(e, t) {
  const P0 = posturaDe(e), q = t * 2.2 + (e.semilla || 0);
  if (e.fuera) return { ...QUIETA, brazoD: 1.25, brazoI: -0.5, cabeza: 0.8, inclina: 0.08 };   // despedido: los brazos caídos
  const p = { ...QUIETA, ...P0 };
  if (e.hielo > 0) return p;                                                                    // congelado: su postura, quieta
  if (e.moviendo) {
    // andando, siempre de pie: piernas y brazos (pegados al cuerpo) se balancean
    const f = e.anda * 12, F = POSTURAS.firmes;
    p.dy = 0; p.piernaI = F.piernaI + Math.sin(f) * 0.5; p.piernaD = F.piernaD - Math.sin(f) * 0.5;
    p.brazoI = F.brazoI - Math.sin(f) * 0.3; p.brazoD = F.brazoD - Math.sin(f) * 0.3;
    p.salto = -Math.abs(Math.sin(f)) * 2.2; p.inclina = Math.sin(f) * 0.08; p.cabeza = Math.sin(f) * 0.4; p.aplasta = Math.cos(f * 2) * 0.1;
  } else {
    // quieto, en su postura: respira y balancea la cabeza
    p.salto = -Math.abs(Math.sin(q)) * 0.5; p.aplasta = Math.sin(q) * 0.1; p.cabeza = Math.sin(q * 0.6) * 0.5;
    p.brazoD += Math.sin(q * 0.8) * 0.1; p.brazoI += Math.sin(q * 0.8 + 1) * 0.07;
  }
  if (e.clase === 'cazador') p.brazoD = 0.72 + (e.moviendo ? Math.sin(e.anda * 12) * 0.1 : 0);   // el brazo de delante sujeta la linterna
  return p;
}
function postura(e, t) {
  if (!e.pz) { e.pz = { ...QUIETA, ...posturaDe(e) }; e.tPz = t; }
  const dt = Math.min(0.1, Math.max(0, t - e.tPz)); e.tPz = t;
  const obj = posturaObjetivo(e, t), k = 1 - Math.exp(-dt * 14);
  for (const n in obj) e.pz[n] += (obj[n] - e.pz[n]) * k;
  if (e.hielo > 0.5 && !e.fuera) Object.assign(e.pz, QUIETA, posturaDe(e));   // congelado: exactamente la postura en la que está pintado
  const p = { ...e.pz };
  // el saltito al congelarse
  if (e.hielo > 0 && e.hielo < 0.5 && !e.fuera) { const s = Math.sin((e.hielo / 0.5) * Math.PI); p.salto -= s * 3; p.aplasta -= s * 0.45; }
  return p;
}
// la piel con la postura: la piel está pintada en su postura fija; al moverse, cada brazo y pierna lleva su trozo de pintura
function pielConPostura(c, e, p) {
  const P0 = posturaDe(e), d0 = P0.dy || 0;
  if (['piernaI', 'piernaD', 'brazoI', 'brazoD', 'dy'].every(k => Math.abs((p[k] || 0) - (P0[k] || 0)) < 0.002)) { c.drawImage(e.piel, -PIE_X, -PIE_Y, CAJA_W, CAJA_H); return; }
  c.save(); c.translate(0, (p.dy || 0) - d0);
  const trozo = k => {
    const q = PIEZAS[k], py = q.y + d0;
    c.save(); c.translate(q.x, py); c.rotate((p[k] || 0) - (P0[k] || 0)); c.translate(-q.x, -py);
    c.beginPath(); c.save(); c.translate(0, d0); capsula(c, q, P0[k] || 0); c.restore(); c.clip();
    c.drawImage(e.piel, -PIE_X, -PIE_Y, CAJA_W, CAJA_H); c.restore();
  };
  trozo('piernaI'); trozo('piernaD');
  c.save(); c.beginPath(); c.save(); c.translate(0, d0); trazaTronco(c); trazaCabeza(c); c.restore(); c.clip(); c.drawImage(e.piel, -PIE_X, -PIE_Y, CAJA_W, CAJA_H); c.restore();
  trozo('brazoI'); trozo('brazoD');
  c.restore();
}
// la cara: ojos con brillo, mofletes y sonrisa (CrazyBunny lleva un ojo en espiral, como en el resto de la serie)
function pintaCara(c, e, t, p) {
  const x = CABEZA.x + 2 + p.cabeza * 1.5 + limita(e.ojoX || 0, -1.6, 1.6) * 0.5, y = CABEZA.y + limita(e.ojoY || 0, -1.2, 1.2) * 0.4;
  const parp = (t * 0.9 + (e.semilla || 0)) % 3.4 < 0.12;
  if (e.fuera || (e.clase === 'cazador' && e.ciego > 0)) {
    for (const s of [-1, 1]) { raya(c, [x + s * 4.4 - 1.8, y - 2.3, x + s * 4.4 + 1.8, y + 1.3], OL, 1.8); raya(c, [x + s * 4.4 + 1.8, y - 2.3, x + s * 4.4 - 1.8, y + 1.3], OL, 1.8); }
  } else if (e.ropa && e.ropa.ojos) e.ropa.ojos(c, x, y);   // unos ojos del armario (habitacion.js)
  else {
    for (const s of [-1, 1]) {
      if (parp) { raya(c, [x + s * 4.4 - 1.8, y - 0.5, x + s * 4.4 + 1.8, y - 0.5], OL, 1.6); continue; }
      if (s < 0 && e.tipo === 'bunny') {
        c.beginPath(); for (let q = 0; q < 3.4 * Math.PI; q += 0.3) { const r = 0.24 * q; c.lineTo(x - 4.4 + Math.cos(q + t * 3) * r, y - 0.5 + Math.sin(q + t * 3) * r); }
        c.strokeStyle = '#8a2bff'; c.lineWidth = 1.3; c.stroke(); continue;
      }
      const rr = e.susto ? 0.65 : 1;
      c.beginPath(); c.ellipse(x + s * 4.4, y - 0.5, 1.9 * rr, 2.5 * rr, 0, 0, TAU); c.fillStyle = OL; c.fill();
      if (!e.susto) punto(c, x + s * 4.4 + 0.7, y - 1.5, 0.7, '#ffffff');
    }
    if (e.clase === 'cazador' && e.alerta > 0.5) { raya(c, [x - 6.5, y - 5.2, x - 2.6, y - 3.8], OL, 1.5); raya(c, [x + 6.5, y - 5.2, x + 2.6, y - 3.8], OL, 1.5); }
  }
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * 7.2, y + 3.4, 2, 1.2, 0, 0, TAU); c.fillStyle = 'rgba(255,120,150,0.45)'; c.fill(); }
  if (e.ropa && e.ropa.boca && !e.susto && !e.fuera) { e.ropa.boca(c, x, y); return; }   // una boca del armario
  c.beginPath();
  if (e.susto || e.fuera) c.ellipse(x, y + 4.2, 1.4, 1.7, 0, 0, TAU); else c.arc(x, y + 2.6, 2.5, 0.25, Math.PI - 0.25);
  c.lineWidth = 1.3; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke();
}

// dibuja un personaje en el mundo. `t` es el reloj; `velo` < 1 lo deja medio transparente (el calco del taller)
function pintaAlubia(c, e, t, velo = 1) {
  const fundido = e.fuera && e.tFuera > 2.5 ? Math.max(0, (3 - e.tFuera) / 0.5) : 1;   // un despedido se desvanece al cabo de un rato
  const a = (1 - e.hielo) * fundido, p = postura(e, t);
  const x = e.hielo > 0 ? Math.round(e.x) : e.x, y = e.hielo > 0 ? Math.round(e.y) : e.y, ad = ADORNOS[e.tipo];
  c.save(); c.translate(x, y);
  if (e.tiembla > 0) c.translate(Math.sin(t * 70) * 1.1, 0);
  if (a > 0.01) { c.globalAlpha = a * 0.26; c.fillStyle = OL; c.beginPath(); c.ellipse(0, 0, 16, 4.5, 0, 0, TAU); c.fill(); }
  // todo el cuerpo: bote, balanceo y estirón (desde los pies)
  c.translate(0, p.salto); c.rotate(p.inclina * e.mira); c.scale(1 + p.aplasta * 0.12, 1 - p.aplasta * 0.12);
  // el cuerpo de un camaleón no se da la vuelta (su pintura y su silueta son fijas: así se mide el camuflaje); el del becario sí
  const espejo = e.clase === 'cazador' ? e.mira : 1, giraCara = e.mira * espejo;
  c.scale(espejo, 1);
  if (a > 0.01) {
    c.globalAlpha = a; c.save(); c.translate(0, p.dy || 0); c.scale(giraCara, 1); ad.detras(c, e); c.restore();
    c.beginPath(); trazaAlubia(c, p); c.lineWidth = 6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
  }
  // la piel: lo único que queda al congelarse
  c.globalAlpha = velo * fundido;
  pielConPostura(c, e, p);
  if (a > 0.01) {
    // un poco de sombra en el lado contrario a la cara
    c.save(); c.beginPath(); trazaAlubia(c, p); c.clip();
    c.globalAlpha = a * 0.13; c.fillStyle = OL; c.beginPath(); c.rect(-30, -60, 60, 70); c.ellipse(4 * giraCara, -30 + (p.dy || 0), 15, 26, 0, 0, TAU); c.fill('evenodd');
    c.restore();
    c.globalAlpha = a;
    c.save(); c.translate(0, p.dy || 0); c.scale(giraCara, 1); pintaCara(c, e, t, p);
    if (e.clase === 'cazador' || e.tipo === 'fan') ad.delante(c, e);   // el fan (habitacion.js) ya está en las medidas de la galleta
    else { c.save(); c.translate(0, CABEZA.y); c.scale(0.8, 0.8); c.translate(0, 33); ad.delante(c, e); c.restore(); }   // los adornos de cabeza estaban hechos para una cabeza más grande
    if (e.clase === 'cazador') {   // la linterna, en la mano de delante
      const q = PIEZAS.brazoD, an = q.ang + p.brazoD, hx = q.x + Math.cos(an) * (q.largo + 2), hy = q.y + Math.sin(an) * (q.largo + 2);
      c.save(); c.translate(hx, hy); c.rotate(an);
      forma(c, caja(-1, -3, 9, 6, 1.5), '#3d4063', 2); forma(c, poli(8, -4.5, 12.5, -6.5, 12.5, 6.5, 8, 4.5), '#ffcb3d', 2);
      c.restore();
    }
    c.restore();
  }
  c.restore();
}
