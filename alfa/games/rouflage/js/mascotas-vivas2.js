// Fans of Rouflage · MASCOTAS VIVAS (2ª tanda): conejo, zorro, ardilla, mapache y hurón, hechos como el gato y el perro (mascotas-vivas.js):
// una sola silueta sin costuras, patas con paso de verdad, orejas y cola con muelles, gestos en la cara y cinco cosas propias cada uno.
// Comparten un esqueleto de cuatro patas, cuadrupedo(c, o, s), al que cada animal le pasa su forma (s): colores, largo del tronco, tipo de
// orejas y de cola, hocico, manchas, si anda o va a saltos, y lo que hacen sus acciones propias (s.pose cambia la postura; s.encima dibuja
// lo que lleva en las manos). Usa las piezas de MV_KIT.
'use strict';

(() => {
  const K = MV_KIT, { OL, capsula, ovalo, tri, silueta, mancha, muelle, dtDe, pataAnda, ojo, boca, colorete, zetas, dormido, env } = K;
  // los puntos de una cadena (cola): para trazarla y para pintar por dentro (anillos, punta blanca)
  function puntosCadena(x, y, angs, largo) { const p = [[x, y]]; for (const a of angs) { const [px, py] = p[p.length - 1]; p.push([px + Math.cos(a) * largo, py + Math.sin(a) * largo]); } return p; }
  const trazaCadena = (c, p, r0, r1) => { for (let i = 1; i < p.length; i++) capsula(c, ...p[i - 1], ...p[i], r0 + (r1 - r0) * (i - 1) / (p.length - 1), r0 + (r1 - r0) * i / (p.length - 1)); };

  // ---- la postura del momento (todas las cuentas; el dibujo va aparte) ----
  function postura(o, s, dt) {
    const m = o.m, cor = o.mov ? 1 : 0, F = o.t * (s.saltos ? 9 : 12);
    const P = { cor, F, sienta: o.acc === 'sienta' ? env(o.k) : 0, duerme: dormido(o), olfatea: o.acc === 'olfatea' ? env(o.k, 0.15) : 0, alto: 0, ladeo: 0, cabExtra: 0, manos: 0 };
    // a saltos (conejo): todas las patas a la vez y un bote grande; andando: el bote pequeño de cada pisada
    P.bote = s.saltos ? cor * Math.max(0, Math.sin(F)) * 4.5 : cor * Math.abs(Math.sin(F)) * 1.3;
    P.bote += Math.sin(o.t * (P.duerme ? 1.4 : 2.6)) * (P.duerme ? 0.45 : 0.22);
    if (s.pose) s.pose(o, P);
    const L = s.largo || 11, cadX = -L / 2, homX = L / 2, y = -(s.altoPatas || 6.5) - 2;
    P.baja = P.duerme * ((s.altoPatas || 6.5) - 2.3) + (P.agacha || 0);
    P.cadX = cadX + (P.culo || 0); P.homX = homX;
    P.cadY = y - P.bote + P.sienta * 3.5 + P.baja - P.alto;
    P.homY = y - P.bote - P.sienta * (s.erguido ? 5 : 2) + P.baja + P.olfatea * 1.2 - P.alto;
    P.caX = homX + (s.cuello || 2.8) + P.olfatea * 1.5;
    P.caY = muelle(m, 'caY', P.homY - (s.rCabeza || 4.8) + P.duerme * 2.6 + P.olfatea * 5.5 + P.cabExtra, dt, 110, 10);
    P.cabR = muelle(m, 'cabR', (o.mira || 0) * 0.12 + P.olfatea * (0.45 + Math.sin(o.t * 9) * 0.12) + (o.contento ? Math.sin(o.t * 4) * 0.06 : 0) + P.ladeo, dt, 100, 10);
    P.orejaR = muelle(m, 'oreja', (s.saltos ? -cor * Math.sin(F) * 0.4 : Math.sin(F) * 0.2 * cor) + (o.susto ? -0.6 : 0) + (P.orejaExtra || 0), dt, s.orejaFloja ? 45 : 150, s.orejaFloja ? 4.5 : 8);
    P.colaA = muelle(m, 'cola0', (s.colaBase ?? -1.9) + P.sienta * (s.erguido ? -0.2 : 0.9) + cor * 0.5 + Math.sin(o.t * 2.2) * 0.18 + (P.colaExtra || 0), dt, 55, 7);
    P.colaOnda = i => muelle(m, 'cola' + i, Math.sin(o.t * 2.4 - i * 0.8) * (s.colaOnda ?? 0.22) * (i + 1) * 0.5 + cor * Math.sin(F - i) * 0.08 - P.duerme * 0.35 * i + (s.colaRizo || 0) * i, dt, 70 - i * 8, 7);
    return P;
  }

  // ---- el dibujo ----
  function cuadrupedo(c, o, s) {
    const dt = dtDe(o), P = postura(o, s, dt), m = o.m;
    const cola = puntosCadena(P.cadX - 2, P.cadY - 1.5, Array.from({ length: s.colaTrozos || 4 }, (_, i) => P.colaA + P.colaOnda(i + 1)), s.colaLargo || 2.6);
    const patas = [[P.cadX + 1.2, 0, P.sienta], [P.cadX - 1.2, Math.PI, P.sienta], [P.homX - 1, Math.PI / 2, 0], [P.homX + 1.2, Math.PI * 1.5, 0]].map(([hx, ph, pl], i) => {
      const hy = (i < 2 ? P.cadY : P.homY) + 2, delante = i >= 2;
      const fase = s.saltos ? P.F + (delante ? 0.6 : 0) : P.F + ph;
      if (delante && P.manos) return [hx, hy, P.caX + 0.5 + (i === 3 ? 1.5 : -0.5), P.caY + 4 + Math.sin(o.t * 14 + i) * 0.6 * P.manos];      // las manos a la boca
      return pataAnda(fase, P.cor, hx, hy, (s.altoPatas || 6.5) + P.bote + (delante ? P.sienta * (s.erguido ? 5 : 2) - P.olfatea * 1.2 : 0) - P.baja + (delante ? 0 : P.alto * 0), Math.max(pl, P.duerme));
    });
    const traza = cc => {
      capsula(cc, P.cadX, P.cadY, P.homX, P.homY, s.gordo || 4.5, (s.gordo || 4.5) - 0.3);
      if (s.cola === 'pompon') ovalo(cc, P.cadX - 4, P.cadY - 1.5, 2.6, 2.6); else trazaCadena(cc, cola, s.colaR0 || 1.6, s.colaR1 || 1.1);
      cc.save(); cc.translate(P.caX, P.caY); cc.rotate(P.cabR);
      ovalo(cc, 0, 0, s.rCabeza || 4.8, (s.rCabeza || 4.8) * 0.92);
      if (s.hocico) capsula(cc, 2, 1.2, 2 + s.hocico, 1.5, 2.4, 1.7);
      orejas(cc, s, P, false);
      cc.restore();
      for (const p of patas) capsula(cc, ...p, s.grosorPata || 1.6, (s.grosorPata || 1.6) - 0.1);
    };
    silueta(c, traza, s.color, cc => {
      if (s.panza) mancha(cc, k => ovalo(k, 1.5, (P.cadY + P.homY) / 2 + 3, (s.largo || 11) / 2, 2.4), s.panza);
      if (s.manchas) s.manchas(cc, P, cola);
      cc.save(); cc.translate(P.caX, P.caY); cc.rotate(P.cabR);
      orejas(cc, s, P, true);
      if (s.morro) mancha(cc, k => ovalo(k, 2 + (s.hocico || 0) * 0.6, 1.8, 2.6 + (s.hocico || 0) * 0.4, 1.8), s.morro);
      if (s.antifaz) s.antifaz(cc);
      cc.restore();
    });
    c.save(); c.translate(P.caX, P.caY); c.rotate(P.cabR);
    const nx = 3 + (s.hocico || 0);
    ojo(c, -0.2, -0.8, 1.25, o, 1); ojo(c, 2.7, -0.9, 1.2, o, -1); colorete(c, 3.6, 1.6);
    mancha(c, k => ovalo(k, nx, 1, s.nariz || 0.9, (s.nariz || 0.9) * 0.75), s.colorNariz || OL);
    if (s.bigotes) { c.lineWidth = 0.5; c.strokeStyle = OL; c.beginPath(); for (const d of [-0.4, 0.7]) { c.moveTo(nx + 0.8, 1.4 + d * 0.4); c.lineTo(nx + 3.4, 1 + d); } c.stroke(); }
    if (s.cara) s.cara(c, o, P); else boca(c, nx - 0.6, 2.8, o, 1);
    c.restore();
    if (s.encima) s.encima(c, o, P);
    if (P.duerme) zetas(c, P.caX + 3, P.caY - 6, o.t);
  }
  // las orejas: largas (conejo), de punta (zorro, ardilla) o redondas (mapache, hurón); `dentro`: el color de dentro, recortado
  function orejas(c, s, P, dentro) {
    for (const k of [-1, 1]) {
      c.save(); c.translate(k * 2.2 - 0.4, -(s.rCabeza || 4.8) * 0.6); c.rotate(P.orejaR * (k > 0 ? 1 : 1.25) + k * 0.12 + (s.orejaGiro || 0));
      if (s.orejas === 'larga') { if (dentro) mancha(c, q => capsula(q, 0, -1, 0, -7.5, 0.9, 0.9), s.dentroOreja); else capsula(c, 0, 0, 0, -8, 1.9, 1.7); }
      else if (s.orejas === 'redonda') { if (dentro) mancha(c, q => ovalo(q, 0, -1.6, 0.9, 0.9), s.dentroOreja); else ovalo(c, 0, -1.4, 1.9, 1.9); }
      else if (dentro) mancha(c, q => tri(q, -1, -0.4, 1, -0.4, 0.2, -(s.picoOreja || 4.4) + 1.6), s.dentroOreja); else tri(c, -2.1, 0.6, 2.1, 0.6, 0.2, -(s.picoOreja || 4.4));
      c.restore();
    }
  }

  // ---------- los cinco ----------
  const ESPECIES = {
    // CONEJO: va a saltos; orejas largas y flojas; cola de pompón. Brinco (salta y se retuerce en el aire) y nariz (la mueve sin parar)
    conejo: {
      color: '#f7f3ff', panza: '#ffffff', orejas: 'larga', orejaFloja: true, dentroOreja: '#ffb3cf', cola: 'pompon', saltos: true, largo: 9, gordo: 5, altoPatas: 5,
      rCabeza: 5, colorNariz: '#ff7aa0', nariz: 0.8,
      pose: (o, P) => {
        if (o.acc === 'brinco') { const q = Math.sin(o.k * Math.PI); P.alto = q * 8; P.ladeo = Math.sin(o.k * Math.PI * 2) * 0.4; P.orejaExtra = -q * 0.6; }
        if (o.acc === 'nariz') P.orejaExtra = -0.35;
      },
      cara: (c, o) => { if (o.acc === 'nariz') { const w = Math.sin(o.t * 30) * 0.25; mancha(c, k => ovalo(k, 3, 1 + w, 0.9, 0.7), '#ff7aa0'); } boca(c, 2.6, 2.6, o, 0.9); },
    },
    // ZORRO: hocico largo, orejas de punta grandes y cola gorda con la punta blanca. Salta (el salto del zorro: arriba y de cabeza al suelo)
    zorro: {
      color: '#e8702a', panza: '#fff4e6', morro: '#fff4e6', hocico: 2.4, orejas: 'punta', picoOreja: 5.2, dentroOreja: '#3b2318', largo: 11,
      colaTrozos: 4, colaR0: 2.4, colaR1: 3, colaLargo: 2.8, colaBase: -2.5, colaOnda: 0.16, bigotes: true,
      manchas: (c, P, cola) => { const [x, y] = cola[cola.length - 1]; mancha(c, k => ovalo(k, x, y, 3.4, 3.4), '#fff4e6'); },
      pose: (o, P) => {
        if (o.acc === 'salta') { const q = o.k; P.alto = Math.sin(Math.min(1, q / 0.7) * Math.PI) * 10 * (q < 0.7 ? 1 : 0); P.ladeo = q < 0.35 ? -0.5 : q < 0.7 ? 0.9 : 0.6 * (1 - (q - 0.7) / 0.3); P.agacha = q > 0.7 ? 2 : 0; P.cabExtra = q > 0.7 ? 3 : 0; }
      },
    },
    // ARDILLA: se sienta erguida, cola enorme y esponjosa que se enrosca hacia arriba. Bellota (la coge con las manos y la mordisquea) y cola
    ardilla: {
      color: '#c2641f', panza: '#f0a065', orejas: 'punta', picoOreja: 3.8, dentroOreja: '#f0a065', largo: 8, gordo: 4.4, altoPatas: 5.5, erguido: true,
      colaTrozos: 5, colaR0: 2.2, colaR1: 3.6, colaLargo: 3, colaBase: -2.35, colaRizo: 0.2, colaOnda: 0.1, bigotes: true,      // la cola sube por detrás y se riza al final
      manchas: (c, P, cola) => { c.lineWidth = 1.1; c.strokeStyle = '#f0a065'; c.beginPath(); cola.slice(2).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); },
      pose: (o, P) => {
        if (o.acc === 'bellota') { P.sienta = Math.max(P.sienta, env(o.k, 0.15)); P.manos = env(o.k, 0.15); P.cabExtra = Math.sin(o.t * 16) * 0.4 * P.manos; }
        if (o.acc === 'cola') P.colaExtra = Math.sin(o.k * Math.PI * 8) * 0.35;
      },
      encima: (c, o, P) => { if (!P.manos) return; c.save(); c.translate(P.caX + 2.4, P.caY + 4.6); mancha(c, k => ovalo(k, 0, 0.6, 1.5, 1.8), '#8a5226'); c.lineWidth = 0.9; c.strokeStyle = OL; c.stroke(); mancha(c, k => ovalo(k, 0, -0.9, 1.7, 1), '#5b3417'); c.stroke(); c.restore(); },
    },
    // MAPACHE: gris con antifaz negro y cola de anillos. Lava (se frota las manos, como lavando algo) y olfatea
    mapache: {
      color: '#8d8f99', panza: '#d4d6dd', morro: '#e9eaee', hocico: 1.4, orejas: 'redonda', dentroOreja: '#3b3d47', largo: 10.5, gordo: 4.9,
      colaTrozos: 4, colaR0: 2, colaR1: 2.3, colaLargo: 2.6, colaBase: -2.4, bigotes: true,
      antifaz: c => mancha(c, k => { k.moveTo(-3.6, -1.9); k.quadraticCurveTo(1.3, -3, 4.6, -1.6); k.quadraticCurveTo(4.8, 0.6, 3.6, 0.6); k.quadraticCurveTo(1.3, -0.4, -1, 0.6); k.quadraticCurveTo(-3.8, 0.6, -3.6, -1.9); }, '#3b3d47'),
      manchas: (c, P, cola) => { for (let i = 1; i < cola.length; i += 1) { const [x, y] = cola[i]; if (i % 2) mancha(c, k => ovalo(k, x, y, 2.6, 1.2, Math.atan2(y - cola[i - 1][1], x - cola[i - 1][0]) + Math.PI / 2), '#3b3d47'); } },
      pose: (o, P) => { if (o.acc === 'lava') { P.sienta = Math.max(P.sienta, env(o.k, 0.15)); P.manos = env(o.k, 0.15); P.cabExtra = 1.5 * P.manos; } },
      encima: (c, o, P) => { if (!P.manos) return; for (let i = 0; i < 3; i++) { const q = (o.t * 2 + i / 3) % 1; c.globalAlpha = (1 - q) * 0.9; mancha(c, k => ovalo(k, P.caX + 2 + Math.sin(i * 2) * 2, P.caY + 4 - q * 6, 0.7 + q, 0.7 + q), '#bfe9ff'); c.globalAlpha = 1; } },
    },
    // HURÓN: tronco muy largo y patas cortas, antifaz claro y la cinta roja de la serie. Baile (el baile de guerra del hurón: brincos de lado
    // con el lomo arqueado y la boca abierta) y olfatea
    huron: {
      color: '#b9ad9d', panza: '#e7ddcc', orejas: 'redonda', dentroOreja: '#e7ddcc', largo: 15, gordo: 3.8, altoPatas: 4.5, rCabeza: 4.2, hocico: 1.4, morro: '#efe6d7',
      colaTrozos: 4, colaR0: 1.6, colaR1: 1.1, colaLargo: 2.4, colaBase: -2.7, colaOnda: 0.18,
      antifaz: c => { mancha(c, k => ovalo(k, 0.8, -0.8, 3.6, 1.5), '#5b4d3d'); mancha(c, k => k.rect(-4.6, -4.4, 9, 1.6), '#e8443a'); },
      manchas: (c, P, cola) => { for (let i = 2; i < cola.length; i++) mancha(c, k => ovalo(k, ...cola[i], 1.8, 1.8), '#6b5d4d'); },
      pose: (o, P) => {
        if (o.acc === 'baile') { const q = (o.k * 4) % 1; P.alto = Math.sin(q * Math.PI) * 4; P.ladeo = Math.sin(o.k * Math.PI * 8) * 0.3; P.agacha = -1.5; P.culo = Math.sin(o.k * Math.PI * 4) * 1.5; }
      },
      cara: (c, o, P) => { if (o.acc === 'baile') mancha(c, k => ovalo(k, 3.6, 2.8, 1, 1.2), OL); else boca(c, 3.6, 2.8, o, 0.9); },
    },
  };

  for (const [id, s] of Object.entries(ESPECIES)) MASCOTAS_VIVAS[id] = (c, o) => cuadrupedo(c, o, s);
  Object.assign(MASCOTAS_VIVAS_ACC, {
    conejo: { sienta: 3, duerme: 4.5, brinco: 0.9, nariz: 1.6, olfatea: 2 },
    zorro: { sienta: 3, duerme: 4.5, salta: 1.4, olfatea: 2.2 },
    ardilla: { sienta: 3, duerme: 4.5, bellota: 2.6, cola: 1.2 },
    mapache: { sienta: 3, duerme: 4.5, lava: 2.4, olfatea: 2.2 },
    huron: { sienta: 3, duerme: 4.5, baile: 2, olfatea: 2.2 },
  });
  registraMascotasVivas(Object.keys(ESPECIES));
})();
