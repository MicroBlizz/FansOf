// Fans of Rouflage · MASCOTAS VIVAS DE DOS PATAS: suricato, kaiju, pollito y zombi, hechos como las demás vivas (mascotas-vivas.js): una sola
// silueta sin costuras, gestos en la cara y cinco cosas propias cada una. Comparten un esqueleto de pie, bipedo(c, o, s): tronco derecho,
// cabeza encima, dos piernas que andan, dos bracitos (o alas) que van al revés que las piernas y cola si la tienen. Cada animal le pasa su
// forma (s) y lo que hacen sus acciones (s.pose cambia la postura; s.extra añade piezas a la silueta, como las púas del kaiju o la cresta;
// s.encima dibuja por encima). Usa las piezas de MV_KIT.
'use strict';

(() => {
  const { OL, capsula, ovalo, tri, silueta, mancha, muelle, dtDe, pataAnda, ojo, boca, colorete, zetas, dormido, env } = MV_KIT;
  function puntosCadena(x, y, angs, largo) { const p = [[x, y]]; for (const a of angs) { const [px, py] = p[p.length - 1]; p.push([px + Math.cos(a) * largo, py + Math.sin(a) * largo]); } return p; }

  function postura(o, s, dt) {
    const m = o.m, cor = o.mov ? 1 : 0, F = o.t * (s.lento ? 7 : 13);
    const P = { cor, F, duerme: dormido(o), sienta: o.acc === 'sienta' ? env(o.k) : 0, inclina: 0, alto: 0, brazos: 0, cabExtra: 0, ladeo: 0 };
    P.bote = cor * Math.abs(Math.sin(F)) * 1.2 + Math.sin(o.t * (P.duerme ? 1.4 : 2.6)) * (P.duerme ? 0.4 : 0.22);
    if (s.pose) s.pose(o, P);
    const piernas = s.piernas || 5;
    P.baja = P.duerme * (piernas - 1.2) + P.sienta * (piernas - 2.5);
    P.cadX = 0; P.cadY = -piernas - 1.5 - P.bote + P.baja - P.alto;
    const incl = cor * 0.12 + P.inclina + P.duerme * 0.5;
    P.pechoX = P.cadX + Math.sin(incl) * (s.tronco || 7); P.pechoY = P.cadY - Math.cos(incl) * (s.tronco || 7);
    P.caX = P.pechoX + 1.2 + (s.cuelloX || 0); P.caY = muelle(m, 'caY', P.pechoY - (s.rCabeza || 4.6) + 1.5 + P.cabExtra + P.duerme * 2, dt, 110, 10);
    P.cabR = muelle(m, 'cabR', (o.mira || 0) * 0.12 + P.ladeo + (o.contento ? Math.sin(o.t * 4) * 0.06 : 0), dt, 100, 10);
    P.brazoR = [0, 1].map(i => muelle(m, 'brazo' + i, (cor ? Math.sin(F + i * Math.PI) * 0.6 : Math.sin(o.t * 2 + i) * 0.08) + P.brazos * (i ? 1 : 1.1), dt, 120, 9));
    P.colaA = muelle(m, 'cola0', (s.colaBase ?? 2.6) + Math.sin(o.t * 2) * 0.12 + cor * Math.sin(F) * 0.1, dt, 50, 7);
    P.cresta = muelle(m, 'cresta', -cor * 0.4 + (o.susto ? 0.5 : 0), dt, 140, 7);
    return P;
  }

  function bipedo(c, o, s) {
    const dt = dtDe(o), P = postura(o, s, dt), m = o.m;
    const cola = s.cola ? puntosCadena(P.cadX - 2, P.cadY + 1, Array.from({ length: s.cola.trozos }, (_, i) => P.colaA + muelle(m, 'cola' + (i + 1), Math.sin(o.t * 2.4 - i * 0.8) * 0.15 * (i + 1) * 0.5, dt, 60, 7) - i * (s.cola.curva || 0)), s.cola.largo) : null;
    const hombro = [P.pechoX + 0.6 + (s.hombroX || 0), P.pechoY + 2];
    const brazos = [0, 1].map(i => { const a = (s.brazoAng ?? Math.PI / 2 + 0.35) + P.brazoR[i]; return [...hombro, hombro[0] + Math.cos(a) * (s.brazo || 4), hombro[1] + Math.sin(a) * (s.brazo || 4)]; });
    const piernas = [0, 1].map(i => pataAnda(P.F + i * Math.PI, P.cor, P.cadX + (i ? 1.4 : -1.4), P.cadY + 1, (s.piernas || 5) + P.bote - P.baja + 1, Math.max(P.duerme, P.sienta)));
    const traza = cc => {
      capsula(cc, P.cadX, P.cadY, P.pechoX, P.pechoY, s.anchoCadera || 4.4, s.anchoPecho || 3.6);
      if (cola) for (let i = 1; i < cola.length; i++) capsula(cc, ...cola[i - 1], ...cola[i], s.cola.r0 - (s.cola.r0 - s.cola.r1) * (i - 1) / (cola.length - 1), s.cola.r0 - (s.cola.r0 - s.cola.r1) * i / (cola.length - 1));
      cc.save(); cc.translate(P.caX, P.caY); cc.rotate(P.cabR); ovalo(cc, 0, 0, s.rCabeza || 4.6, (s.rCabeza || 4.6) * 0.95); if (s.cabeza) s.cabeza(cc, P, false); cc.restore();
      for (const p of piernas) capsula(cc, ...p, s.grosorPierna || 1.6, s.grosorPierna || 1.6);
      for (const b of brazos) capsula(cc, ...b, s.grosorBrazo || 1.2, s.grosorBrazo || 1.2);
      if (s.extra) s.extra(cc, P, cola);
    };
    silueta(c, traza, s.color, cc => {
      if (s.panza) mancha(cc, k => capsula(k, P.cadX + 1, P.cadY - 0.5, P.pechoX + 1, P.pechoY + 1.5, (s.anchoCadera || 4.4) * 0.6, (s.anchoPecho || 3.6) * 0.55), s.panza);
      if (s.manchas) s.manchas(cc, P, cola);
      cc.save(); cc.translate(P.caX, P.caY); cc.rotate(P.cabR); if (s.cabeza) s.cabeza(cc, P, true); cc.restore();
    });
    c.save(); c.translate(P.caX, P.caY); c.rotate(P.cabR);
    ojo(c, -0.2, -0.6, 1.25, o, 1); ojo(c, 2.6, -0.7, 1.2, o, -1); colorete(c, 3.4, 1.6);
    if (s.cara) s.cara(c, o, P); else boca(c, 2.4, 2.4, o, 1);
    c.restore();
    if (s.encima) s.encima(c, o, P);
    if (P.duerme) zetas(c, P.caX + 3, P.caY - 6, o.t);
  }

  const ESPECIES = {
    // SURICATO: alto y estirado, antifaz oscuro, orejitas y cola fina. Vigila (se pone de puntillas y mira a un lado y a otro) y cava
    suricato: {
      color: '#d9b27c', panza: '#f3e2c3', piernas: 4.5, tronco: 9, anchoCadera: 4, anchoPecho: 3, rCabeza: 4, brazo: 3.6, grosorBrazo: 1,
      cola: { trozos: 4, largo: 2.4, r0: 1.3, r1: 0.7, curva: -0.15 }, colaBase: 2.3,
      cabeza: (c, P, dentro) => { if (dentro) { for (const x of [-0.2, 2.6]) mancha(c, k => ovalo(k, x, -0.5, 1.8, 1.6), '#7a5530'); mancha(c, k => ovalo(k, 3.8, 0.8, 1.2, 1), '#3b2318'); } else { ovalo(c, -2.8, -1, 1.4, 1.4); capsula(c, 1.5, 0.6, 4.6, 0.8, 2, 1.2); } },
      pose: (o, P) => {
        if (o.acc === 'vigila') { const a = env(o.k, 0.15); P.alto = a * 2; P.brazos = -0.6 * a; P.ladeo = Math.sin(o.k * Math.PI * 3) * 0.35 * a; }
        if (o.acc === 'cava') { const a = env(o.k, 0.15); P.inclina = 0.9 * a; P.brazos = Math.sin(o.t * 20) * 0.8 * a - 0.3 * a; P.cabExtra = 2 * a; }
      },
      encima: (c, o, P) => { if (o.acc !== 'cava') return; for (let i = 0; i < 4; i++) { const q = (o.t * 2.5 + i / 4) % 1; c.globalAlpha = 1 - q; mancha(c, k => ovalo(k, P.pechoX + 3 - q * 10, -1 - Math.sin(q * Math.PI) * 6, 1, 0.8), '#b08a5a'); c.globalAlpha = 1; } },
    },
    // KAIJU: el lagartito monstruo de la serie: verde, púas en el lomo, cola gorda. Ruge (abre la boca, tiembla y salen ondas) y pisa
    // (pisotón que levanta polvo)
    kaiju: {
      color: '#34d399', panza: '#bbf7d0', piernas: 4.6, tronco: 7.5, anchoCadera: 5, anchoPecho: 4, rCabeza: 4.8, brazo: 3.4, grosorBrazo: 1.3, grosorPierna: 2, brazoAng: 0.5, hombroX: 2.4,
      cola: { trozos: 4, largo: 2.6, r0: 3, r1: 1.2, curva: -0.08 }, colaBase: 2.7, cuelloX: 0.8,
      extra: (c, P, cola) => {      // púas: por la espalda y la cola
        const pts = puasKaiju(P, cola);
        for (const [x, y, a] of pts) { c.save(); c.translate(x, y); c.rotate(a); tri(c, -1.7, 1.4, 1.7, 1.4, 0, -2.6); c.restore(); }
      },
      manchas: (c, P, cola) => { const pts = puasKaiju(P, cola); for (const [x, y, a] of pts) { c.save(); c.translate(x, y); c.rotate(a); mancha(c, k => tri(k, -1, 1.4, 1, 1.4, 0, -1.6), '#f472b6'); c.restore(); } },
      pose: (o, P) => {
        if (o.acc === 'ruge') { const a = env(o.k, 0.15); P.inclina = -0.25 * a; P.brazos = -1.2 * a; P.cabExtra = -1 * a; P.ladeo = -0.3 * a + Math.sin(o.t * 40) * 0.05 * a; }
        if (o.acc === 'pisa') { const q = o.k; P.alto = q < 0.5 ? Math.sin(q / 0.5 * Math.PI / 2) * 3 : Math.max(0, 3 - (q - 0.5) / 0.08 * 3); }
      },
      cara: (c, o) => {
        if (o.acc === 'ruge') { const a = env(o.k, 0.15); mancha(c, k => { k.moveTo(1.4, 1.6); k.lineTo(5, 1.4); k.lineTo(4.4, 2.2 + a * 2.4); k.closePath(); }, OL); mancha(c, k => tri(k, 2, 1.6, 2.6, 1.6, 2.3, 2.4), '#fff'); mancha(c, k => tri(k, 3.4, 1.5, 4, 1.5, 3.7, 2.3), '#fff'); c.lineWidth = 0.8; c.strokeStyle = OL; for (let i = 0; i < 3; i++) { const q = (o.t * 2 + i / 3) % 1; c.globalAlpha = (1 - q) * a; c.beginPath(); c.arc(6 + q * 5, 1.8, 2 + q * 5, -0.7, 0.7); c.stroke(); } c.globalAlpha = 1; return; }
        boca(c, 2.6, 2.6, o, 1.1);
      },
      encima: (c, o, P) => { if (o.acc !== 'pisa' || o.k < 0.55) return; const q = Math.min(1, (o.k - 0.55) / 0.4); for (let i = -2; i <= 2; i++) { c.globalAlpha = 1 - q; mancha(c, k => ovalo(k, i * (3 + q * 6), -1 - q * 3, 1.6 + q * 1.5, 1.2 + q), '#e8e1d4'); } c.globalAlpha = 1; },
    },
    // POLLITO: amarillo y redondito de pecho pero con patas largas de pollo, alitas, pico naranja y cresta roja que rebota. Picotea (pico
    // al suelo varias veces) y aletea (bate las alas y da saltitos)
    pollo: {
      color: '#fde047', panza: '#fef9c3', piernas: 4, tronco: 4.5, anchoCadera: 5.4, anchoPecho: 4.6, rCabeza: 4, brazo: 3.4, grosorBrazo: 1.8, grosorPierna: 0.9, cuelloX: 0.4,
      cola: { trozos: 1, largo: 2.6, r0: 2, r1: 1 }, colaBase: -2.5,
      cabeza: (c, P, dentro) => { if (dentro) return; c.save(); c.translate(-0.6, -3.6); c.rotate(P.cresta); tri(c, -1.8, 0.8, 0, -2.6, 0.6, 0.8); tri(c, 0, 0.8, 1.6, -2.2, 2, 0.8); c.restore(); },
      manchas: (c, P) => { c.save(); c.translate(P.caX, P.caY); c.rotate(P.cabR); c.translate(-0.6, -3.6); c.rotate(P.cresta); mancha(c, k => k.rect(-2.5, -3, 5, 3.4), '#ef4444'); c.restore(); },
      pose: (o, P) => {
        if (o.acc === 'picotea') { const q = Math.max(0, Math.sin(o.k * Math.PI * 8)); P.inclina = 1 * q * env(o.k, 0.1); P.cabExtra = 3 * q * env(o.k, 0.1); }
        if (o.acc === 'aletea') { const a = env(o.k, 0.1); P.brazos = (-1.5 + Math.sin(o.t * 30) * 1) * a; P.alto = Math.abs(Math.sin(o.k * Math.PI * 4)) * 3 * a; }
      },
      cara: (c, o) => { const ab = o.acc === 'aletea' || gestoFeliz(o) ? 0.7 : 0; mancha(c, k => tri(k, 3.6, 0.2 - ab * 0.3, 6.4, 1, 3.6, 1.8), '#fb923c'); c.lineWidth = 0.8; c.strokeStyle = OL; c.stroke(); if (ab) mancha(c, k => tri(k, 3.6, 1.2, 5.6, 1.6, 3.6, 2.4), '#ea7a20'); },
    },
    // ZOMBI: verde, anda despacio y torcido con los brazos por delante, ropa rota y un ojo más grande. Gruñe (tiembla con la boca abierta)
    // y tambalea (casi se cae y se recupera)
    zombi: {
      color: '#84cc16', panza: '#a3a3a3', piernas: 5, tronco: 7, anchoCadera: 4, anchoPecho: 3.8, rCabeza: 4.6, brazo: 4.4, grosorBrazo: 1.3, brazoAng: -0.15, hombroX: 1.6, lento: true,
      manchas: (c, P) => { mancha(c, k => { k.moveTo(P.cadX - 4, P.cadY + 1); k.lineTo(P.cadX + 4, P.cadY + 1); k.lineTo(P.cadX + 3, P.cadY + 3); k.lineTo(P.cadX + 1, P.cadY + 1.8); k.lineTo(P.cadX - 1, P.cadY + 3.2); k.lineTo(P.cadX - 3, P.cadY + 1.8); k.closePath(); }, '#5b4a8a'); mancha(c, k => ovalo(k, P.pechoX - 2.4, P.pechoY + 2.4, 1, 0.8), '#4d7c0f'); },
      pose: (o, P) => {
        P.inclina += 0.08 + Math.sin(o.t * 1.7) * 0.05; P.ladeo += 0.18;
        if (o.acc === 'gruñe') { const a = env(o.k, 0.15); P.ladeo += Math.sin(o.t * 35) * 0.06 * a - 0.2 * a; P.brazos = -0.4 * a; }
        if (o.acc === 'tambalea') { const q = o.k; P.inclina += Math.sin(q * Math.PI * 2) * 0.7 * (1 - q); P.brazos = Math.sin(q * Math.PI * 6) * 0.9 * (1 - q); }
      },
      cara: (c, o) => {
        if (o.acc === 'gruñe') { const a = env(o.k, 0.15); mancha(c, k => ovalo(k, 2.4, 2.6, 1.6, 0.5 + a), OL); return; }
        c.lineWidth = 0.9; c.strokeStyle = OL; c.lineCap = 'round'; c.beginPath(); c.moveTo(1.2, 2.8); c.lineTo(2.2, 2.4); c.lineTo(3.2, 2.9); c.lineTo(4, 2.5); c.stroke();
      },
    },
  };
  const gestoFeliz = o => MV_KIT.gesto(o) === 'feliz';
  // las púas del kaiju: tres en el borde de la espalda, por fuera del tronco y apuntando hacia atrás y arriba: [x, y, giro]
  function puasKaiju(P, cola) {
    const ang = Math.atan2(P.pechoY - P.cadY, P.pechoX - P.cadX), nx = Math.cos(ang - Math.PI / 2), ny = Math.sin(ang - Math.PI / 2), giro = ang - 0.35;
    const lomo = [0.15, 0.5, 0.85].map(f => [P.cadX + (P.pechoX - P.cadX) * f + nx * 4.2, P.cadY + (P.pechoY - P.cadY) * f + ny * 4.2, giro]);
    return lomo;
  }

  for (const [id, s] of Object.entries(ESPECIES)) MASCOTAS_VIVAS[id] = (c, o) => bipedo(c, o, s);
  Object.assign(MASCOTAS_VIVAS_ACC, {
    suricato: { sienta: 3, duerme: 4.5, vigila: 2.6, cava: 2 },
    kaiju: { sienta: 3, duerme: 4.5, ruge: 1.8, pisa: 1.2 },
    pollo: { sienta: 3, duerme: 4.5, picotea: 1.8, aletea: 1.4 },
    zombi: { sienta: 3, duerme: 4.5, 'gruñe': 1.8, tambalea: 1.6 },
  });
  registraMascotasVivas(Object.keys(ESPECIES));
})();
