// Fans of Rouflage · MASCOTAS VIVAS QUE VUELAN: murciélago, cupido, fantasma y dron, hechos como las demás vivas (mascotas-vivas.js): una
// sola silueta sin costuras, gestos en la cara y cinco cosas propias cada una. Flotan a un palmo del suelo (la sombra se queda abajo,
// mascotas.js) y se mecen; al ir deprisa se inclinan hacia delante y baten más rápido. Cada uno es su propia función, con las piezas de MV_KIT.
'use strict';

(() => {
  const { OL, capsula, ovalo, tri, silueta, mancha, muelle, dtDe, gesto, ojo, boca, colorete, zetas, dormido, env } = MV_KIT;
  // lo común de los que vuelan: altura (baja al dormir), meneo y la inclinación al ir deprisa
  function vuelo(o, alto = 15) {
    const cor = o.mov ? 1 : 0, duerme = dormido(o);
    return { cor, duerme, y: -alto + Math.sin(o.t * (cor ? 9 : 3)) * (cor ? 1.4 : 1) + duerme * (alto - 6), incl: muelle(o.m, 'incl', cor * 0.3, dtDe(o) || 0.016, 60, 8) };
  }

  // ---------- MURCIÉLAGO ----------
  // morado, orejas grandes y alas de membrana con el borde festoneado que baten. Cuelga (se da la vuelta boca abajo, envuelto en las alas)
  // y voltereta (da una vuelta entera en el aire)
  function murcielago(c, o) {
    const V = vuelo(o, 16), m = o.m, cuelga = o.acc === 'cuelga' ? env(o.k, 0.15) : 0, vuelta = o.acc === 'voltereta' ? o.k * Math.PI * 2 : 0;
    const bate = V.duerme || cuelga ? -0.9 : Math.sin(o.t * (V.cor ? 22 : 12)) * 0.75;
    c.save(); c.translate(0, V.y - cuelga * 2); c.rotate(V.incl + vuelta + cuelga * Math.PI);
    const ala = (cc, k) => { cc.save(); cc.scale(k, 1); cc.translate(2.4, -1); cc.rotate(-bate); cc.moveTo(0, -1.4); cc.lineTo(5, -4.4); cc.lineTo(9.6, -2.6); cc.quadraticCurveTo(8.4, -0.4, 9, 1.6); cc.quadraticCurveTo(7, 0.4, 6, 2.4); cc.quadraticCurveTo(4.6, 0.8, 3, 2.6); cc.quadraticCurveTo(1.6, 1, 0, 1.6); cc.closePath(); cc.restore(); };
    const traza = cc => { ovalo(cc, 0, 0, 4.2, 4.8); tri(cc, -3.6, -2.6, -1, -3.8, -3.2, -8.2); tri(cc, 1, -3.8, 3.6, -2.6, 3.2, -8.2); ala(cc, 1); ala(cc, -1); capsula(cc, -1, 4, -1.2, 6.2, 0.7); capsula(cc, 1, 4, 1.2, 6.2, 0.7); };
    silueta(c, traza, '#6d4aa8', cc => { mancha(cc, k => ovalo(k, 0, 1.4, 2.6, 2.6), '#9b7ad6'); mancha(cc, k => tri(k, -3, -3, -1.6, -3.6, -2.8, -6.6), '#f0a3c8'); mancha(cc, k => tri(k, 1.6, -3.6, 3, -3, 2.8, -6.6), '#f0a3c8'); });
    ojo(c, -1.4, -1, 1.15, o, 1); ojo(c, 1.4, -1, 1.15, o, -1); colorete(c, 2.6, 0.8);
    if (gesto(o) === 'feliz' || o.acc === 'voltereta') boca(c, 0, 1.8, o, 1); else { mancha(c, k => tri(k, -1, 1.5, -0.4, 1.5, -0.7, 2.6), '#fff'); mancha(c, k => tri(k, 0.4, 1.5, 1, 1.5, 0.7, 2.6), '#fff'); }
    c.restore();
    if (V.duerme || cuelga) zetas(c, 4, V.y - 6, o.t);
  }

  // ---------- CUPIDO ----------
  // un corazón rosa con alitas de plumas blancas. Late (bombea más grande y suelta corazoncitos) y flecha (tensa un arquito y dispara)
  function corazon(cc, x, y, r) { cc.moveTo(x, y + r * 0.9); cc.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.9, y - r * 1.5, x, y - r * 0.55); cc.bezierCurveTo(x + r * 0.9, y - r * 1.5, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); cc.closePath(); }
  function cupido(c, o) {
    const V = vuelo(o, 15), late = o.acc === 'late' ? Math.max(0, Math.sin(o.k * Math.PI * 6)) : 0, flecha = o.acc === 'flecha' ? o.k : 0;
    const bate = V.duerme ? -0.4 : Math.sin(o.t * (V.cor ? 20 : 10)) * 0.6, r = 5.2 * (1 + late * 0.18 + Math.sin(o.t * 4) * 0.02);
    c.save(); c.translate(0, V.y); c.rotate(V.incl * 0.6);
    const ala = (cc, k) => { cc.save(); cc.scale(k, 1); cc.translate(4, -2.4); cc.rotate(-0.3 - bate); ovalo(cc, 3, -1.2, 3.4, 1.6, -0.2); ovalo(cc, 3.4, 0.6, 3, 1.4, 0.1); ovalo(cc, 2.6, 2, 2.2, 1.2, 0.3); cc.restore(); };
    silueta(c, cc => ala(cc, -1), '#ffffff'); silueta(c, cc => ala(cc, 1), '#ffffff');      // las alas, cada una su silueta (van por detrás)
    silueta(c, cc => corazon(cc, 0, 0, r), '#ff6f9f', cc => mancha(cc, k => ovalo(k, -2.2, -3.2, 1.4, 0.9, -0.5), 'rgba(255,255,255,.55)'));
    ojo(c, -1.4, -1.2, 1.1, o, 1); ojo(c, 1.4, -1.2, 1.1, o, -1); colorete(c, 2.8, 0.6); boca(c, 0, 1, o, 0.9);
    if (flecha) {      // el arquito y la flecha: tensa hasta la mitad, dispara y la flecha sale volando
      c.save(); c.translate(6, 0); c.lineWidth = 0.9; c.strokeStyle = '#a8743e'; c.beginPath(); c.arc(0, 0, 3.2, -1.2, 1.2); c.stroke();
      const tensa = flecha < 0.5 ? flecha * 2 : 0; c.strokeStyle = '#fff'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(Math.cos(-1.2) * 3.2, Math.sin(-1.2) * 3.2); c.lineTo(-tensa * 2, 0); c.lineTo(Math.cos(1.2) * 3.2, Math.sin(1.2) * 3.2); c.stroke();
      const fx = flecha < 0.5 ? -tensa * 2 : (flecha - 0.5) * 50; c.strokeStyle = OL; c.lineWidth = 0.8; c.beginPath(); c.moveTo(fx, 0); c.lineTo(fx + 6, 0); c.stroke(); mancha(c, k => corazon(k, fx + 6.8, 0.2, 1.2), '#ff6f9f'); c.restore();
    }
    c.restore();
    if (late) for (let i = 0; i < 3; i++) { const q = (o.t * 1.4 + i / 3) % 1; c.globalAlpha = 1 - q; mancha(c, k => corazon(k, -5 + i * 5, V.y - 6 - q * 9, 1.2 + q), '#ff6f9f'); c.globalAlpha = 1; }
    if (V.duerme) zetas(c, 4, V.y - 6, o.t);
  }

  // ---------- FANTASMA ----------
  // una sábana con el borde de abajo que ondea y dos bracitos. Buu (se estira, abre la boca y asusta) e invisible (se vuelve transparente)
  function fantasma(c, o) {
    const V = vuelo(o, 13), buu = o.acc === 'buu' ? env(o.k, 0.2) : 0, invis = o.acc === 'invisible' ? env(o.k, 0.2) : 0;
    c.save(); c.globalAlpha = 1 - invis * 0.8; c.translate(0, V.y); c.rotate(V.incl * 0.5); c.scale(1 - buu * 0.08, 1 + buu * 0.22);
    const traza = cc => {
      cc.moveTo(-5.6, 6); cc.lineTo(-5.6, -2); cc.bezierCurveTo(-5.6, -9.4, 5.6, -9.4, 5.6, -2); cc.lineTo(5.6, 6);
      for (let i = 0; i <= 4; i++) { const x = 5.6 - i * 2.8, y = 6 + Math.sin(o.t * 6 + i * 1.3) * 1.2 + (i % 2 ? 1.2 : 0); cc.lineTo(x, y); }
      cc.closePath();
      const br = Math.sin(o.t * 3) * 0.3 - buu * 1.1; capsula(cc, 4.4, 0.6, 7.6, 1.2 + br * 3, 1.3, 1.1); capsula(cc, -4.4, 0.6, -7, 2 - br * 2, 1.3, 1.1);
    };
    silueta(c, traza, '#eef2ff', cc => mancha(cc, k => ovalo(k, -2.2, -5.4, 2, 1.2, -0.4), '#ffffff'));
    ojo(c, -1.6, -2.2, 1.3, o, 1); ojo(c, 1.8, -2.2, 1.3, o, -1); colorete(c, 3.2, 0);
    if (buu) mancha(c, k => ovalo(k, 0.2, 1.2, 1.4 * buu + 0.4, 1.8 * buu + 0.4), OL); else boca(c, 0.2, 0.9, o, 1);
    c.restore();
    if (V.duerme) zetas(c, 4, V.y - 9, o.t);
  }

  // ---------- DRON ----------
  // una cajita con ojo rojo y cuatro hélices que giran. Escanea (barre el suelo con un rayo) y foto (flash); dormido aterriza y las hélices paran
  function dron(c, o) {
    const V = vuelo(o, 17), escanea = o.acc === 'escanea' ? env(o.k, 0.15) : 0, foto = o.acc === 'foto' ? o.k : 0;
    const gira = V.duerme ? 0 : o.t * 60;
    c.save(); c.translate(0, V.y); c.rotate(V.incl * 0.7);
    const traza = cc => { cc.roundRect(-5, -3, 10, 6, 2.4); capsula(cc, -4, -2.4, -8.6, -4.4, 0.8); capsula(cc, 4, -2.4, 8.6, -4.4, 0.8); capsula(cc, -3, 3, -4, 6, 0.7); capsula(cc, 3, 3, 4, 6, 0.7); };
    silueta(c, traza, '#3a4258', cc => { mancha(cc, k => k.rect(-5, -3, 10, 1.6), '#596582'); mancha(cc, k => ovalo(k, 1.6, 0.4, 2.4, 2.2), '#1b2030'); });
    for (const x of [-8.6, 8.6]) { c.save(); c.translate(x, -5.2); c.scale(Math.abs(Math.cos(gira + x)) * 0.8 + 0.2, 1); mancha(c, k => ovalo(k, 0, 0, 4.2, 0.7), 'rgba(220,226,240,.9)'); c.lineWidth = 0.6; c.strokeStyle = OL; c.stroke(); c.restore(); }
    const g = gesto(o), ojoR = g === 'duerme' ? 0.3 : g === 'susto' ? 1.6 : 1.2;
    mancha(c, k => ovalo(k, 1.6 + (o.mira || 0) * 0.5, 0.4, ojoR, ojoR), V.duerme ? '#5a2030' : '#ff3b4f'); mancha(c, k => ovalo(k, 2 + (o.mira || 0) * 0.5, 0, 0.4, 0.4), '#fff');
    if (escanea) { const a = Math.sin(o.t * 3) * 0.5; c.globalAlpha = 0.35 * escanea; mancha(c, k => { k.moveTo(1.6, 2); k.lineTo(1.6 + Math.sin(a) * 14 - 4, 18); k.lineTo(1.6 + Math.sin(a) * 14 + 4, 18); k.closePath(); }, '#ff3b4f'); c.globalAlpha = 1; }
    c.restore();
    if (foto > 0.4 && foto < 0.6) { c.globalAlpha = 0.8 - Math.abs(foto - 0.5) * 8; mancha(c, k => ovalo(k, 1.6, V.y, 8, 8), '#ffffff'); c.globalAlpha = 1; }
    if (V.duerme) zetas(c, 6, V.y - 6, o.t);
  }

  Object.assign(MASCOTAS_VIVAS, { murcielago, cupido, fantasma, dron });
  Object.assign(MASCOTAS_VIVAS_ACC, {
    murcielago: { duerme: 4.5, cuelga: 3, voltereta: 1 },
    cupido: { duerme: 4.5, late: 1.8, flecha: 1.4 },
    fantasma: { duerme: 4.5, buu: 1.4, invisible: 2.2 },
    dron: { duerme: 4.5, escanea: 2.6, foto: 1 },
  });
  registraMascotasVivas(['murcielago', 'cupido', 'fantasma', 'dron']);
})();
