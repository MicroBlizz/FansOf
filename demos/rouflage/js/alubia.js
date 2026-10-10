// Fans of Rouflage (prototipo) · LA ALUBIA: el personaje. Su silueta (lo que se pinta), su «piel» (un lienzo propio donde va la
// pintura) y cómo se dibuja: sombra, contorno negro, visor con ojos y los adornos de cada animal. Al congelarse, todo menos la piel
// se desvanece (`hielo` va de 0 a 1): solo queda la pintura sobre el suelo. Los adornos también se esconden, así nadie tiene
// ventaja por llevar orejas más pequeñas.
'use strict';

const CAJA_W = 48, CAJA_H = 60, PIE_X = 24, PIE_Y = 56;   // la caja donde se pinta una alubia y dónde caen sus pies dentro de ella
const ESC_PIEL = 4;                                       // la piel se guarda a 4 píxeles por unidad: nítida también al ampliar
const BLANCO_PIEL = '#f4f1fa';

// la silueta, con el origen en los pies: cabeza redonda, costados rectos y dos piernas (izq y der las levantan al andar)
function trazaAlubia(c, izq = 0, der = 0) {
  c.moveTo(-17, -33);
  c.arc(0, -33, 17, Math.PI, 0);
  c.lineTo(17, -5 - der); c.quadraticCurveTo(17, -der, 12, -der);
  c.lineTo(8.5, -der); c.quadraticCurveTo(3.5, -der, 3.5, -5 - der);
  c.lineTo(3.5, -10); c.quadraticCurveTo(0, -14, -3.5, -10);
  c.lineTo(-3.5, -5 - izq); c.quadraticCurveTo(-3.5, -izq, -8.5, -izq);
  c.lineTo(-12, -izq); c.quadraticCurveTo(-17, -izq, -17, -5 - izq);
  c.closePath();
}
// la silueta a tamaño real: 1 donde hay alubia (para medir el camuflaje y saber si un disparo acierta)
const MASCARA = new Uint8Array(CAJA_W * CAJA_H);
let PIXELES_ALUBIA = 0;
function preparaAlubia() {
  const [, g] = lienzo(CAJA_W, CAJA_H, true);
  g.translate(PIE_X, PIE_Y); g.beginPath(); trazaAlubia(g); g.fillStyle = '#fff'; g.fill();
  const d = g.getImageData(0, 0, CAJA_W, CAJA_H).data;
  for (let i = 0; i < MASCARA.length; i++) { MASCARA[i] = d[i * 4 + 3] > 127 ? 1 : 0; PIXELES_ALUBIA += MASCARA[i]; }
}
// una piel nueva, de un solo color
function nuevaPiel(color = BLANCO_PIEL) {
  const [cv, g] = lienzo(CAJA_W * ESC_PIEL, CAJA_H * ESC_PIEL, true);
  g.save(); g.scale(ESC_PIEL, ESC_PIEL); g.translate(PIE_X, PIE_Y); g.beginPath(); trazaAlubia(g); g.fillStyle = color; g.fill(); g.restore();
  return [cv, g];
}
// ¿cae este punto del mundo dentro de la alubia? (con un margen, para que acertar con el dedo no sea imposible)
function dentroDeAlubia(e, x, y, margen = 0) {
  const bx = x - (Math.round(e.x) - PIE_X), by = y - (Math.round(e.y) - PIE_Y);
  for (const [dx, dy] of margen ? [[0, 0], [margen, 0], [-margen, 0], [0, margen], [0, -margen], [margen * 0.7, margen * 0.7], [-margen * 0.7, margen * 0.7], [margen * 0.7, -margen * 0.7], [-margen * 0.7, -margen * 0.7]] : [[0, 0]]) {
    const i = Math.round(bx + dx), j = Math.round(by + dy);
    if (i >= 0 && j >= 0 && i < CAJA_W && j < CAJA_H && MASCARA[j * CAJA_W + i]) return true;
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
  // el becario vigilante de Microblizz: antena con luz y corbata
  becario: {
    detras() {},
    delante(c, e) {
      raya(c, [0, -50, 0, -61], OL, 4.5); raya(c, [0, -50, 0, -61], '#c3cbe0', 2);
      punto(c, 0, -62, 4.6, OL); punto(c, 0, -62, 2.8, e && e.alerta > 0.5 ? '#ff4b5c' : e && e.alerta > 0 ? '#ffcb3d' : '#7ee04a');
      forma(c, poli(2, -22, 7, -22, 6, -10, 4.5, -7, 3, -10), '#ff4b5c', 2);
    },
  },
};

// dibuja una alubia en el mundo. `t` es el reloj (para parpadear); `velo` < 1 la deja medio transparente (el calco del taller)
function pintaAlubia(c, e, t, velo = 1) {
  const fundido = e.fuera && e.tFuera > 2.5 ? Math.max(0, (3 - e.tFuera) / 0.5) : 1;   // un despedido se desvanece al cabo de un rato
  const a = (1 - e.hielo) * fundido, anda = e.moviendo && !e.congelado;
  const paso = anda ? Math.sin(e.anda * 15) : 0, izq = paso > 0.25 ? 4 : 0, der = paso < -0.25 ? 4 : 0, bote = anda ? Math.abs(paso) * 1.6 : 0;
  const x = e.hielo > 0 ? Math.round(e.x) : e.x, y = e.hielo > 0 ? Math.round(e.y) : e.y, ad = ADORNOS[e.tipo];
  c.save(); c.translate(x, y);
  if (e.tiembla > 0) c.translate(Math.sin(t * 70) * 1.1, 0);
  if (a > 0.01) {
    c.globalAlpha = a * 0.26; c.fillStyle = OL; c.beginPath(); c.ellipse(0, 0, 18, 5.5, 0, 0, TAU); c.fill();
    c.globalAlpha = a; c.translate(0, -bote);
    c.save(); c.scale(e.mira, 1); ad.detras(c, e); c.restore();
    c.beginPath(); trazaAlubia(c, izq, der); c.lineWidth = 6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
  }
  // la piel: lo único que queda al congelarse
  c.globalAlpha = velo * fundido;
  if (izq || der) { c.save(); c.beginPath(); trazaAlubia(c, izq, der); c.clip(); c.drawImage(e.piel, -PIE_X, -PIE_Y, CAJA_W, CAJA_H); c.restore(); }
  else c.drawImage(e.piel, -PIE_X, -PIE_Y, CAJA_W, CAJA_H);
  if (a > 0.01) {
    // el sombreado: más oscuro lejos de la cara
    c.save(); c.beginPath(); trazaAlubia(c, izq, der); c.clip();
    c.globalAlpha = a * 0.15; c.fillStyle = OL; c.beginPath(); c.rect(-30, -60, 60, 70); c.ellipse(e.mira * 5, -31, 16, 25, 0, 0, TAU); c.fill('evenodd');
    c.restore();
    c.globalAlpha = a; c.scale(e.mira, 1);
    if (e.clase === 'cazador') {
      // la cara del becario: una pantalla azul con dos rayas por ojos (rojas cuando te ha visto)
      forma(c, caja(-4, -43, 23, 15, 6), '#1b4fc4', 3);
      const col = e.alerta > 0.5 ? '#ff8a94' : '#e8f1ff';
      if (e.ciego > 0) { raya(c, [3, -38, 7, -34], col, 2); raya(c, [7, -38, 3, -34], col, 2); raya(c, [11, -38, 15, -34], col, 2); raya(c, [15, -38, 11, -34], col, 2); }
      else { raya(c, [3, -36, 7.5, -36 + (e.alerta > 0.5 ? 1.5 : 0)], col, 2.4); raya(c, [11, -36 + (e.alerta > 0.5 ? 1.5 : 0), 15.5, -36], col, 2.4); }
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(-1, -41, 9, 2.5);
    } else {
      // el visor de cristal, con los ojos dentro (se mueven hacia donde mira y parpadean)
      forma(c, caja(-4, -43, 23, 15, 7), e.fuera ? '#c9c5da' : '#9fe6f7', 3);
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); rrPath(c, -0.5, -41, 10, 3.4, 1.7); c.fill();
      c.fillStyle = 'rgba(40,110,150,0.28)'; c.fillRect(-2.5, -32.5, 20, 2.6);
      const ox = limita(e.ojoX || 0, -1.6, 1.6), oy = limita(e.ojoY || 0, -1.2, 1.2), parp = (t * 0.9 + e.semilla) % 3.4 < 0.12;
      if (e.fuera) { for (const ex of [4.5, 12]) { raya(c, [ex - 2, -37.5, ex + 2, -33.5], OL, 2); raya(c, [ex + 2, -37.5, ex - 2, -33.5], OL, 2); } }
      else if (parp) { raya(c, [3, -35.5, 6.5, -35.5], OL, 2); raya(c, [10.5, -35.5, 14, -35.5], OL, 2); }
      else if (e.tipo === 'bunny') {
        // un ojo normal y el otro en espiral, como en el resto de la serie
        c.beginPath(); for (let q = 0; q < 3.6 * Math.PI; q += 0.3) { const r = 0.26 * q; c.lineTo(4.6 + ox + Math.cos(q + t * 3) * r, -35.6 + oy + Math.sin(q + t * 3) * r); } c.strokeStyle = '#8a2bff'; c.lineWidth = 1.4; c.stroke();
        punto(c, 12.2 + ox, -35.6 + oy, e.susto ? 1.5 : 2.3, OL);
      } else { punto(c, 4.8 + ox, -35.6 + oy, e.susto ? 1.5 : 2.3, OL); punto(c, 12.2 + ox, -35.6 + oy, e.susto ? 1.5 : 2.3, OL); }
    }
    ad.delante(c, e);
    if (e.clase === 'cazador') {   // la linterna, en la mano de delante
      forma(c, caja(12, -19, 12, 7, 2), '#3d4063', 2.5); forma(c, poli(24, -21, 29, -23, 29, -10, 24, -12), '#ffcb3d', 2.5);
    }
  }
  c.restore();
}
