// Fans of Rouflage · PEGATINAS (dibujo, 1 de 2): las ayudas para dibujar una pegatina (la galleta con cualquier postura, caras con más gesto, cositas
// de alrededor) y PEG_DIB.pinta(lienzo, def): el dibujo con su cartel, el borde blanco recortado y la sombra. Todo con las piezas del juego: la silueta
// de alubia.js (trazaPiezas) y las de ARD (armario-dibujo.js). Cada pegatina es un objeto { tag, col, g (la galleta), mas, giro, especial }: ver
// pegatinas-datos.js. El dibujo se hace en una caja de 120×120 unidades: la galleta con los pies en (60, 96) y el cartel abajo, en (60, 104).
'use strict';
const PEG_DIB = (() => {
  const { OL, T, shape, el, rr, poly, line, dot, starPath, otxt, OJOS, BOCAS, CABEZAS, ESPALDAS, COLOR_PAPEL, PAPEL } = ARD;

  // ---------- la galleta con una postura libre (ángulos de brazos y piernas como en POSTURAS de alubia.js) ----------
  const mano = (pose, k) => { const p = PIEZAS[k], a = p.ang + (pose[k] || 0); return [p.x + Math.cos(a) * (p.largo + 2), p.y + Math.sin(a) * (p.largo + 2) + (pose.dy || 0)]; };
  const poseDe = g => Object.assign({ piernaI: 0, piernaD: 0, brazoI: 0, brazoD: 0, dy: 0 }, (g && g.pose) || {});
  function galleta(c, o) {
    const pose = poseDe(o);
    if (o.espalda && ESPALDAS[o.espalda]) { c.save(); c.translate(0, pose.dy); ESPALDAS[o.espalda](c); c.restore(); }
    c.beginPath(); trazaPiezas(c, pose); c.lineWidth = 6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
    c.beginPath(); trazaPiezas(c, pose); c.fillStyle = o.color || COLOR_PAPEL[o.papel] || COLOR_PAPEL.blanco; c.fill();
    if ((o.papel && PAPEL[o.papel]) || o.manchas) { c.save(); c.beginPath(); trazaPiezas(c, pose); c.clip(); if (o.papel && PAPEL[o.papel]) PAPEL[o.papel](c); if (o.manchas) o.manchas(c); c.restore(); }
    const x = 2, y = -41.5 + pose.dy;
    if (o.cara) o.cara(c, x, y);
    else ARD.cara(c, o.ojos && OJOS[o.ojos], o.boca && BOCAS[o.boca], x, y);
    if (o.cabeza && CABEZAS[o.cabeza]) { c.save(); c.translate(0, pose.dy); CABEZAS[o.cabeza](c); c.restore(); }
  }

  // ---------- caras con más gesto (x, y = centro de los ojos, como ARD.cara) ----------
  const colorete = (c, x, y, a = 0.45) => { for (const s of [-1, 1]) shape(c, el(x + s * 7.2, y + 3.4, 2, 1.2), `rgba(255,120,150,${a})`, 0); };
  const bocaAbierta = (c, x, y, ancho, alto) => {
    shape(c, g => { g.moveTo(x - ancho, y + 2.4); g.quadraticCurveTo(x, y + 2.9, x + ancho, y + 2.4); g.quadraticCurveTo(x + ancho * 0.9, y + 2.4 + alto, x, y + 2.4 + alto); g.quadraticCurveTo(x - ancho * 0.9, y + 2.4 + alto, x - ancho, y + 2.4); g.closePath(); }, '#7a1f3d', 1.2);
    shape(c, el(x + 0.4, y + 1.6 + alto * 0.8, ancho * 0.5, alto * 0.2), '#ff6f8f', 0);
  };
  const arco = (c, x, y, r, a0, a1, lw = 1.5) => { c.beginPath(); c.arc(x, y, r, a0, a1); c.lineWidth = lw; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); };
  const CARAS = {
    feliz(c, x, y) { for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y - 0.5, 2.1, 2.7), OL, 0); dot(c, x + s * 4.4 + 0.8, y - 1.6, 0.8, '#fff'); } colorete(c, x, y, 0.6); bocaAbierta(c, x, y, 3.2, 3.8); },
    risa(c, x, y) {
      for (const s of [-1, 1]) arco(c, x + s * 4.4, y + 0.3, 2.1, Math.PI + 0.3, -0.3);
      colorete(c, x, y, 0.6); bocaAbierta(c, x, y, 4, 6.2);
      for (const s of [-1, 1]) shape(c, el(x + s * 8.6, y + 0.6, 1, 1.7), '#8fe3ff', 0.7);
    },
    picara(c, x, y) {
      for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y, 2, 1.6), OL, 0); line(c, [x + s * 4.4 - 2.6, y - 1.7, x + s * 4.4 + 2.6, y - 1.1 + (s < 0 ? -0.6 : 0.6)], OL, 1.3); }
      colorete(c, x, y);
      c.beginPath(); c.moveTo(x - 2.6, y + 3.6); c.quadraticCurveTo(x + 1, y + 5.4, x + 3.6, y + 2.6); c.lineWidth = 1.3; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke();
    },
    susto(c, x, y) {
      for (const s of [-1, 1]) { shape(c, el(x + s * 4.6, y - 0.6, 3, 3.5), '#fff', 1.3); dot(c, x + s * 4.6, y - 0.2, 1.1, OL); }
      shape(c, g => { g.moveTo(x - 3.4, y + 4.6); for (let k = 0; k < 4; k++) g.lineTo(x - 3.4 + (k + 0.5) * 1.7, y + (k % 2 ? 4.6 : 3.4)); g.lineTo(x + 3.4, y + 4.6); }, null, 1.3);
    },
    llanto(c, x, y) {
      for (const s of [-1, 1]) arco(c, x + s * 4.4, y - 0.4, 2, 0.3, Math.PI - 0.3);
      for (const s of [-1, 1]) shape(c, g => { g.moveTo(x + s * 4.4 - 1, y + 1.2); g.quadraticCurveTo(x + s * 5, y + 6, x + s * 4.6, y + 9); g.lineTo(x + s * 3.4, y + 9); g.quadraticCurveTo(x + s * 3.8, y + 5, x + s * 4.4 + 0.2, y + 1.2); g.closePath(); }, '#8fe3ff', 0.7);
      shape(c, g => { g.moveTo(x - 2.8, y + 6); g.quadraticCurveTo(x, y + 2.6, x + 2.8, y + 6); g.closePath(); }, '#7a1f3d', 1.1);
    },
    decidido(c, x, y) {
      for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y, 1.9, 2.3), OL, 0); dot(c, x + s * 4.4 + 0.7, y - 1, 0.7, '#fff'); line(c, [x + s * 2.2, y - 3.4, x + s * 6.8, y - 4.6], OL, 1.5); }
      line(c, [x - 2.4, y + 4, x + 2.4, y + 4], OL, 1.4);
    },
    enfado(c, x, y) {
      for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y + 0.4, 1.9, 2.1), OL, 0); line(c, [x + s * 2, y - 2.4, x + s * 7, y - 4.4], OL, 1.7); }
      shape(c, g => { g.moveTo(x - 3, y + 6); g.quadraticCurveTo(x, y + 3, x + 3, y + 6); g.closePath(); }, '#7a1f3d', 1.1);
      for (const [dx, dy] of [[9, -8], [11, -5]]) line(c, [x + dx, y + dy, x + dx + 2.6, y + dy - 1.4], '#ff4b5c', 1.4);
    },
    inocente(c, x, y) {
      for (const s of [-1, 1]) { shape(c, el(x + s * 4.4, y - 0.5, 1.9, 2.5), OL, 0); dot(c, x + s * 4.4 - 0.6, y - 1.8, 0.7, '#fff'); }
      colorete(c, x, y); shape(c, el(x + 1, y + 4.2, 1.5, 1.5), '#7a1f3d', 1.1);
    },
    loca(c, x, y, t = 0) {      // la espiral de CrazyBunny en los dos ojos y la boca de risa
      for (const s of [-1, 1]) { c.beginPath(); for (let q = 0; q < 3.4 * Math.PI; q += 0.3) { const r = 0.24 * q; c.lineTo(x + s * 4.4 + Math.cos(q * s + t) * r, y - 0.5 + Math.sin(q * s + t) * r); } c.strokeStyle = '#8a2bff'; c.lineWidth = 1.3; c.stroke(); }
      bocaAbierta(c, x, y, 3.6, 4.6); shape(c, rr(x - 1.6, y + 2.6, 3.2, 2.2, 0.4), '#fff', 0.8);
    },
  };

  // ---------- cositas de alrededor ----------
  const gota = (c, x, y, s = 1) => shape(c, g => { g.moveTo(x, y - 3.4 * s); g.quadraticCurveTo(x + 2.4 * s, y, x, y + 1.6 * s); g.quadraticCurveTo(x - 2.4 * s, y, x, y - 3.4 * s); g.closePath(); }, '#8fe3ff', 1.1);
  const rayitas = (c, x, y, a, n = 3, col = OL) => { for (let k = 0; k < n; k++) { const b = a + (k - (n - 1) / 2) * 0.45; line(c, [x + Math.cos(b) * 3, y + Math.sin(b) * 3, x + Math.cos(b) * 7, y + Math.sin(b) * 7], col, 1.6); } };
  const estrella = (c, x, y, r, col = '#ffcb3d') => shape(c, g => starPath(g, x, y, r, r * 0.45), col, 1.3);
  const confeti = (c, pts) => { const cols = ['#ff4b5c', '#ffcb3d', '#39d5e8', '#7ee04a', '#ff6fb5']; pts.forEach(([x, y, a], i) => { c.save(); c.translate(x, y); c.rotate(a); shape(c, rr(-1.6, -0.8, 3.2, 1.6, 0.3), cols[i % cols.length], 0.8); c.restore(); }); };
  const nube = (c, x, y, s) => { for (const [dx, dy, r] of [[-5, 0, 3.4], [0, -1.6, 4.2], [5, 0, 3.4], [1, 1.6, 3.4]]) shape(c, el(x + dx * s, y + dy * s, r * s, r * s), '#e6e2ee', 1.2); };
  const carta = (c, x, y, a = 0, s = 1, rota = false) => {
    c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s); shape(c, rr(-5, -7, 10, 14, 1.2), '#fff6ea', 1.6); c.fillStyle = '#ff4b5c'; c.fillRect(-4.2, -1.6, 8.4, 3.2);
    if (rota) line(c, [-5, -2, -1, 0, -4, 3, 5, 5], OL, 1.2); c.restore();
  };
  const linterna = (c, x, y, a) => {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(4, -3); c.lineTo(22, -9); c.lineTo(22, 9); c.lineTo(4, 3); c.closePath(); c.fillStyle = 'rgba(255,238,150,.55)'; c.fill();
    shape(c, rr(-5, -2.6, 9, 5.2, 1.4), '#3d4063', 1.5); shape(c, rr(3, -3.6, 3, 7.2, 1), '#ffcb3d', 1.4); c.restore();
  };
  const planta = (c, x, y, s = 1) => {
    c.save(); c.translate(x, y); c.scale(s, s);
    for (const [a, l] of [[-2.2, 13], [-1.6, 16], [-1.0, 13], [-1.9, 10], [-1.3, 11]]) { c.save(); c.rotate(a + Math.PI / 2); shape(c, el(0, -l / 2 - 2, 3, l / 2), '#4fae2a', 1.4); c.restore(); }
    shape(c, poly(-6, -2, 6, -2, 4.4, 8, -4.4, 8), '#d9733b', 1.6); shape(c, rr(-7, -3.6, 14, 3.4, 1), '#e88a4f', 1.4); c.restore();
  };
  const caja = (c, x, y) => {      // la caja de cartón del despedido
    shape(c, poly(x - 9, y - 6, x + 9, y - 6, x + 8, y + 6, x - 8, y + 6), '#c99a62', 1.6);
    shape(c, poly(x - 9, y - 6, x - 12, y - 10, x + 6, y - 10, x + 9, y - 6), '#d9ad74', 1.4);
    planta(c, x - 3, y - 7, 0.5); shape(c, rr(x + 1, y - 13, 5, 7, 0.8), '#fff', 1.1);
  };
  const reloj = (c, x, y) => { shape(c, el(x, y, 7, 7), '#fff6ea', 1.8); line(c, [x, y, x, y - 4.6], OL, 1.4); line(c, [x, y, x + 3.4, y + 1], OL, 1.4); dot(c, x, y, 1, '#ff4b5c'); for (const s of [-1, 1]) shape(c, el(x + s * 4.4, y - 7, 2.2, 1.6), '#ffcb3d', 1.1); };
  const taza = (c, x, y) => { shape(c, rr(x - 3.6, y - 4, 7.2, 8, 1.4), '#fff', 1.4); c.beginPath(); c.arc(x + 4, y, 2, -1.2, 1.2); c.lineWidth = 1.2; c.strokeStyle = OL; c.stroke(); for (const d of [-1.4, 1.4]) { c.beginPath(); c.moveTo(x + d, y - 5.4); c.quadraticCurveTo(x + d + 1.6, y - 8, x + d, y - 10.4); c.strokeStyle = '#c3cbe0'; c.lineWidth = 1.1; c.stroke(); } };
  const trebol = (c, x, y) => { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; shape(c, el(x + Math.cos(a) * 2.6, y + Math.sin(a) * 2.6, 2.6, 2.6), '#7ee04a', 1.2); } line(c, [x, y + 2, x + 1.6, y + 7], '#3f9a2a', 1.3); };
  const brocha = (c, x, y, a, col = '#ff6fb5') => { c.save(); c.translate(x, y); c.rotate(a); shape(c, rr(-1.2, -2, 2.4, 12, 1), '#d9a25b', 1.3); shape(c, rr(-3, -7, 6, 5.4, 1), '#c3cbe0', 1.3); shape(c, rr(-3, -11, 6, 4.6, 1.6), col, 1.3); c.restore(); };
  const lupa = (c, x, y, a) => { c.save(); c.translate(x, y); c.rotate(a); line(c, [0, 0, 0, 9], OL, 4); line(c, [0, 0.6, 0, 8.4], '#d9a25b', 2); shape(c, el(0, -5, 5, 5), 'rgba(191,238,250,.75)', 1.8); c.restore(); };
  const zanahoria = (c, x, y, a) => { c.save(); c.translate(x, y); c.rotate(a); shape(c, poly(-2.6, -6, 2.6, -6, 0, 9), '#ff8a2b', 1.4); for (const b of [-0.4, 0, 0.4]) { c.save(); c.translate(0, -6); c.rotate(b); shape(c, el(0, -4, 1.3, 3.6), '#4fae2a', 1); c.restore(); } c.restore(); };
  const signo = (c, s, x, y, tam = 10, col = '#ffcb3d') => otxt(c, s, x, y, tam, col);
  const nota = (c, x, y, s = 1) => { c.save(); c.translate(x, y); c.scale(s, s); shape(c, el(0, 0, 2.2, 1.7, -0.4), '#fff6ea', 1.1); line(c, [2, -0.6, 2, -8, 5, -6.6], OL, 1.3); c.restore(); };
  const fantasma = (c, extra) => { c.save(); c.translate(-42, -79.8); ARD.fantasma(c, 84, 'galleta', 0.6); c.restore(); if (extra) extra(c); };
  const AYUDAS = { mano, poseDe, galleta, CARAS, gota, rayitas, estrella, confeti, nube, carta, linterna, planta, caja, reloj, taza, trebol, brocha, lupa, zanahoria, signo, nota, fantasma, shape, el, rr, poly, line, dot, otxt, OL };

  // ---------- la pegatina: el dibujo, el borde blanco recortado y la sombra ----------
  const lienzo = (w, h) => { const k = document.createElement('canvas'); k.width = w; k.height = h; return k; };
  function dilata(src, r, color) {
    const k = lienzo(src.width, src.height), g = k.getContext('2d');
    for (let a = 0; a < T; a += T / 24) g.drawImage(src, Math.cos(a) * r, Math.sin(a) * r);
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, k.width, k.height); return k;
  }
  function arte(c, def, U) {
    c.save(); c.translate(U * 60, U * 96); c.scale(U * 1.25, U * 1.25); if (def.giro) c.rotate(def.giro);
    if (def.especial) def.especial(c, AYUDAS);
    else {
      const pose = poseDe(def.g);
      if (def.detras) def.detras(c, pose, AYUDAS);
      galleta(c, def.g);
      if (def.mas) def.mas(c, pose, AYUDAS);
    }
    c.restore();
    // el cartel, un poco torcido: cada uno lo lee en su idioma
    c.save(); c.translate(U * 60, U * 104); c.rotate(-0.06);
    const txt = tr(def.tag), tam = U * (txt.length > 13 ? 10 : txt.length > 10 ? 11.5 : 13);
    c.font = tam + 'px ' + LETRA_GORDA; const tw = Math.min(U * 110, c.measureText(txt).width + U * 12);
    shape(c, rr(-tw / 2, -U * 8.5, tw, U * 16, U * 5), OL, 0);
    otxt(c, txt, 0, U * 0.6, tam, def.col || '#ffcb3d', U * 102);
    c.restore();
  }
  // pinta la pegatina en el lienzo k (cuadrado), con su borde blanco y su sombra
  function pinta(k, def) {
    const S = k.width, U = S / 120, a = lienzo(S, S);
    try { arte(a.getContext('2d'), def, U); } catch (e) { console.warn('[pegatina]', e); }
    const c = k.getContext('2d'); c.clearRect(0, 0, S, S);
    c.drawImage(dilata(a, U * 5, 'rgba(20,10,40,.35)'), 0, U * 2.6);
    c.drawImage(dilata(a, U * 5, '#ffffff'), 0, 0);
    c.drawImage(a, 0, 0);
  }
  return { pinta, AYUDAS };
})();
