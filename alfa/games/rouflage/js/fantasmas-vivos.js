// Fans of Rouflage · FANTASMAS DEL ARMARIO, VIVOS: el fantasma que eliges en el armario (sábana, globo, nube…) dibujado en la partida al
// tamaño del de galleta y con vida: cara que parpadea y dice «¡buuu!», y cada uno se mueve a su manera (la sábana ondea, el globo se
// mece, la caja abre las solapas…). fantasmaVivo(c, tipo, t, o) dibuja con la punta de abajo en 0,0, mirando a la derecha; o = { mueve }.
// Lo llama pintaFantasmaArmario (espectador.js). El icono quieto del armario sigue en ARD.fantasma (armario-dibujo2.js).
'use strict';
const fantasmaVivo = (() => {
  const { OL, T, shape, el, rr, poly, line, dot } = ARD;
  // la cara: ojos con brillo que parpadean, colorete y la boca en «o» que se abre y se cierra (¡buuu!)
  function cara(c, x, y, s, t, ojo = OL) {
    const parp = (t % 3.6) < 0.13;
    for (const k of [-1, 1]) {
      if (parp) line(c, [x + k * 5 * s - 2 * s, y, x + k * 5 * s + 2 * s, y], ojo, 1.8 * s);
      else { shape(c, el(x + k * 5 * s, y, 2.2 * s, 3 * s), ojo, 0); dot(c, x + k * 5 * s + 0.8 * s, y - 1.2 * s, 0.85 * s, '#fff'); }
      shape(c, el(x + k * 8.2 * s, y + 4 * s, 2.3 * s, 1.3 * s), 'rgba(255,110,150,.5)', 0);
    }
    shape(c, el(x, y + 5.4 * s, 1.8 * s, (2.1 + Math.sin(t * 2.6) * 0.8) * s), OL, 0);
  }
  // la sábana de siempre (o la dorada): el bajo ondea, los bracitos saludan y, al avanzar, se estira hacia atrás
  function sabana(c, t, o, col, brillo) {
    const tira = o.mueve ? 4 : 0;
    const silueta = g => {
      g.moveTo(-17, -6); g.bezierCurveTo(-19, -40, -12, -58, 0, -58); g.bezierCurveTo(12, -58, 19, -40, 17, -6);
      for (let k = 0; k < 5; k++) { const x0 = 17 - k * 6.8, x1 = x0 - 6.8, ola = Math.sin(t * 5 + k * 1.3) * 2.6; g.quadraticCurveTo((x0 + x1) / 2 - tira, (k % 2 ? 1 : 6) + ola, x1, -2 + Math.sin(t * 5 + k) * 1.2); }
      g.closePath();
    };
    for (const k of [-1, 1]) { const a = Math.sin(t * 4 + (k > 0 ? 1.6 : 0)) * 0.35; c.save(); c.translate(k * 15, -30); c.rotate(k * (0.6 + a)); shape(c, el(k * 5, 0, 6, 3.6), col, 2.6); c.restore(); }
    shape(c, silueta, col, 3);
    c.save(); c.beginPath(); silueta(c); c.clip(); c.globalAlpha = 0.12; c.fillStyle = OL; c.beginPath(); c.ellipse(-12, -26, 9, 34, 0, 0, T); c.fill(); c.restore();
    if (brillo) for (let k = 0; k < 3; k++) { const q = (t * 0.7 + k / 3) % 1, a = k * 2.1 + t * 0.3; c.save(); c.globalAlpha = Math.sin(q * Math.PI); estrella(c, Math.cos(a) * 24, -32 + Math.sin(a) * 26, 3.2, '#fff6c2'); c.restore(); }
    cara(c, 3, -36, 1, t);
  }
  const estrella = (c, x, y, r, col) => shape(c, g => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr2 = k % 2 ? r * 0.35 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); }, col, 0);

  const TIPOS = {
    sabana: (c, t, o) => sabana(c, t, o, '#f4f1fa', false),
    dorado: (c, t, o) => sabana(c, t, o, '#ffe27a', true),
    // el avión de papel: planea balanceándose, con rayas de velocidad detrás cuando avanza
    avion: (c, t, o) => {
      c.save(); c.translate(0, -30); c.rotate(Math.sin(t * 2.2) * 0.14 - 0.08);
      if (o.mueve) for (let k = 0; k < 3; k++) { const q = (t * 3 + k / 3) % 1; c.save(); c.globalAlpha = 0.5 * (1 - q); line(c, [-26 - q * 14, -6 + k * 7, -16 - q * 14, -6 + k * 7], '#fff', 2.2); c.restore(); }
      c.scale(1.2, 1.2);
      shape(c, poly(-24, 2, 28, -14, 2, 18), '#f4f1fa', 2.6);
      shape(c, poly(-24, 2, 28, -14, -4, 8), '#dcd6ea', 2.2);
      line(c, [-4, 8, 28, -14], OL, 1.8);
      cara(c, 3, 3, 0.85, t);
      c.restore();
    },
    // la caja de cartón: bota un poco y las solapas se abren y se cierran; los ojos asoman desde dentro
    caja: (c, t, o) => {
      const bote = Math.abs(Math.sin(t * 3)) * 3, a = 0.35 + Math.max(0, Math.sin(t * 2.4)) * 0.9;
      c.save(); c.translate(0, -bote);
      shape(c, rr(-19, -36, 38, 34, 3), '#b98a4f', 3);
      line(c, [-19, -24, 19, -24], 'rgba(60,35,15,.35)', 2); line(c, [-6, -36, -6, -24], 'rgba(60,35,15,.35)', 2);
      shape(c, rr(-14, -33, 28, 9, 2), '#3b2614', 0);      // la rendija oscura de la que miran los ojos
      cara(c, 0, -29, 0.7, t, '#fff6c2');
      for (const k of [-1, 1]) { c.save(); c.translate(k * 19, -36); c.rotate(k * a); shape(c, poly(0, 0, -k * 20, 0, -k * 17, -11, 0, -9), '#c99a62', 2.6); c.restore(); }
      c.restore();
    },
    // la bola de papel: gira despacio, se arruga y desarruga, con su cara asomando entre las arrugas
    bola: (c, t, o) => {
      c.save(); c.translate(0, -26 + Math.sin(t * 3) * 2);
      c.save(); c.rotate(t * (o.mueve ? 1.6 : 0.5));
      shape(c, g => { for (let k = 0; k < 14; k++) { const a = k / 14 * T, r = 21 + (k % 2) * 4 + Math.sin(t * 3 + k) * 1.2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }, '#ece6d8', 3);
      for (let k = 0; k < 4; k++) { const a = k * 1.7; line(c, [Math.cos(a) * 6, Math.sin(a) * 6, Math.cos(a + 0.5) * 18, Math.sin(a + 0.5) * 18], 'rgba(32,16,44,.25)', 1.6); }
      c.restore();
      cara(c, 2, -2, 0.8, t);
      c.restore();
    },
    // el globo: se mece en el aire, se estira y encoge un poco, con su brillo y el hilo ondeando
    globo: (c, t, o) => {
      const bote = Math.sin(t * 2.4) * 4, e = 1 + Math.sin(t * 2.4 + 1) * 0.04;
      c.save(); c.translate(0, -36 + bote);
      c.beginPath(); c.moveTo(0, 22); c.bezierCurveTo(6 * Math.sin(t * 3), 30, -6 * Math.sin(t * 3 + 1), 38, 2 * Math.sin(t * 2), 46 - bote); c.strokeStyle = OL; c.lineWidth = 1.8; c.stroke();
      c.save(); c.rotate(Math.sin(t * 1.8) * 0.12); c.scale(1 / e, e);
      shape(c, poly(-3, 23, 3, 23, 0, 19), '#ff6fb5', 2);
      shape(c, el(0, 0, 18, 21), '#ff6fb5', 3);
      shape(c, el(-7, -9, 3.6, 6, -0.4), 'rgba(255,255,255,.6)', 0);
      cara(c, 1, -1, 0.85, t);
      c.restore(); c.restore();
    },
    // la nube: respira (las bolas crecen y menguan) y de vez en cuando suelta unas gotitas
    nube: (c, t, o) => {
      c.save(); c.translate(0, -30 + Math.sin(t * 2) * 3);
      for (let k = 0; k < 3; k++) { const q = (t * 1.3 + k * 0.33) % 1; c.save(); c.globalAlpha = 1 - q; shape(c, el(-10 + k * 10, 14 + q * 22, 1.6, 2.6), '#8fd3ff', 0.9); c.restore(); }
      // las bolas de la nube: primero el contorno de todas y luego el relleno encima, para que quede una sola silueta
      const bolas = [[-14, 4, 10], [-4, -7, 12], [9, -4, 11], [15, 5, 8], [0, 6, 11]].map(([x, y, r], k) => [x, y, r * (1 + Math.sin(t * 2.6 + k) * 0.06)]);
      const traza = () => { c.beginPath(); for (const [x, y, r] of bolas) { c.moveTo(x + r, y); c.arc(x, y, r, 0, T); } };
      traza(); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); traza(); c.fillStyle = '#e8eefc'; c.fill();
      c.save(); traza(); c.clip(); c.globalAlpha = 0.1; c.fillStyle = OL; c.fillRect(-30, 8, 60, 20); c.restore();
      cara(c, 0, 0, 0.8, t);
      c.restore();
    },
    // la foto de despedida: se balancea como un cuadro colgado y el fantasmita de dentro saluda
    polaroid: (c, t, o) => {
      c.save(); c.translate(0, -60); c.rotate(Math.sin(t * 2) * 0.18);
      line(c, [0, 0, 0, 6], OL, 1.8); dot(c, 0, 0, 2.2, '#ef4444');
      c.translate(0, 6);
      shape(c, rr(-19, 0, 38, 46, 2), '#fff', 3);
      c.fillStyle = '#39275e'; c.fillRect(-15, 4, 30, 30);
      c.save(); c.beginPath(); c.rect(-15, 4, 30, 30); c.clip(); c.translate(0, 33); c.scale(0.42, 0.42); sabana(c, t, o, '#f4f1fa', false); c.restore();
      ARD.otxt(c, tr('ADIÓS'), 0, 40, 6.4, '#fff6ea');
      c.restore();
    },
  };
  return (c, tipo, t, o = {}) => { (TIPOS[tipo] || TIPOS.sabana)(c, t, o); };
})();
