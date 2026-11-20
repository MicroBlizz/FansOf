// Fans of Pinball · dominio · PROYECTILES: lo que vuela por la mesa sin ser la bola: el café del becario cafetero (cae; si da en una pala
// de su nivel, esa pala va lenta), el cubito de hielo del jefe (va derecho a una pala y la congela) y la bolsa de basura de JunkCoon (cae
// y explota). La bola rompe el café y el cubito si los toca en el aire. No chocan con las paredes: son ligeros y se ven por encima.
'use strict';
PB.proyectiles = (() => {
  const P = { x: 0, y: 0 };
  function cafe(s, o) {
    const c = s.r.enemigos.cafe;
    s.cafes.push({ tipo: 'cafe', x: o.x, y: o.y + o.r + c.radio, r: c.radio, nivel: o.nivel, vivo: true });
  }
  function cubito(s, desde, pala) {
    const f = s.r.jefe.frio;
    s.cubitos.push({ tipo: 'cubito', x: desde.x, y: desde.y, r: f.radio, pala: pala.id, vivo: true });
  }
  function bolsa(s, b) {
    s.bolsas.push({ tipo: 'bolsa', x: b.x, y: b.y, vy: 0, t: 0, cif: b.cif, vivo: true });
  }
  // ¿el punto (x, y) con radio r toca la pala p?
  function tocaPala(p, x, y, r) {
    PB.palas.punta(p, P);
    const lim = p.grosor + r;
    return PB.geo.dist2Segmento(x, y, p.x, p.y, P.x, P.y) < lim * lim;
  }
  function pasoCafe(s, c, h) {
    const rc = s.r.enemigos.cafe;
    c.y += rc.velocidad * h;
    const pala = s.palas.find(p => p.nivel === c.nivel && tocaPala(p, c.x, c.y, c.r));
    if (pala) {
      c.vivo = false; pala.lenta = rc.lenta;
      PB.emite(s, 'pala_lenta', { pala: pala.id, x: c.x, y: c.y, segundos: rc.lenta });
    } else if (c.y > PB.mesa.nivel(s.r.mesa, c.nivel).y1) c.vivo = false;
  }
  function pasoCubito(s, c, h) {
    const f = s.r.jefe.frio, pala = s.palas.find(p => p.id === c.pala);
    PB.palas.medio(pala, P);
    const dx = P.x - c.x, dy = P.y - c.y, d = Math.hypot(dx, dy), paso = f.velocidad * h;
    if (d > paso) { c.x += dx / d * paso; c.y += dy / d * paso; return; }
    c.vivo = false; pala.congelada = f.congela;
    PB.emite(s, 'pala_congelada', { pala: pala.id, x: P.x, y: P.y, segundos: f.congela });
  }
  function pasoBolsa(s, c, h) {
    c.t += h; c.vy += s.r.fisica.gravedad * h; c.y += c.vy * h;
    if (c.t < c.cif.caida) return;
    c.vivo = false;
    PB.golpes.explota(s, c.x, c.y, c.cif.radio, c.cif.danoPoder, 'basura');
  }
  // la bola toca un café o un cubito en el aire: se rompe
  function rompeAlTocar(s, c) {
    if (c.vivo && s.bolas.some(b => b.vivo && b.estado === 'mesa' && PB.geo.toca(b, c.x, c.y, c.r))) PB.golpes.proyectil(s, c);
  }
  function paso(s, h) {
    for (const c of s.cafes) { rompeAlTocar(s, c); if (c.vivo) pasoCafe(s, c, h); }
    for (const c of s.cubitos) { rompeAlTocar(s, c); if (c.vivo) pasoCubito(s, c, h); }
    for (const c of s.bolsas) if (c.vivo) pasoBolsa(s, c, h);
  }
  const vuela = s => s.cubitos.some(c => c.vivo);
  return { cafe, cubito, bolsa, paso, vuela };
})();
