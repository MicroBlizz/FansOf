// Fans of Rouflage · MASCOTAS VIVAS QUE REPTAN Y CACHARROS: serpiente, bichito (mariquita), nanobot, recreativa y calavera, hechos como las
// demás vivas (mascotas-vivas.js): una sola silueta sin costuras, gestos en la cara y sus cosas propias. Cada uno es su propia función,
// con las piezas de MV_KIT.
'use strict';

(() => {
  const { OL, capsula, ovalo, tri, silueta, mancha, muelle, dtDe, gesto, ojo, boca, colorete, zetas, dormido, env } = MV_KIT;

  // ---------- SERPIENTE ----------
  // un cuerpo continuo (cadena de trozos que se estrechan hacia la cola) que avanza en ondas; lengua bífida. Enrosca (se hace un ovillo
  // y levanta la cabeza) y sisea (lengua fuera muchas veces y cabeza que se balancea)
  function serpiente(c, o) {
    dtDe(o);
    const cor = o.mov ? 1 : 0, duerme = dormido(o), enrosca = o.acc === 'enrosca' ? env(o.k, 0.15) : 0, sisea = o.acc === 'sisea' ? env(o.k, 0.12) : 0;
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) {
      const recta = [8 - i * 2.6, -2.6 + Math.sin(o.t * (cor ? 10 : 3) - i * 0.9) * (cor ? 2.2 : 1) * (i / n)];
      const a = i * 0.75 - 0.2, rr = 4.6 - i * 0.3, ovillo = [Math.cos(a) * rr - 1, -3 + Math.sin(a) * rr * 0.55];      // enroscada: en espiral
      const f = Math.max(enrosca, duerme);
      pts.push([recta[0] * (1 - f) + ovillo[0] * f, recta[1] * (1 - f) + ovillo[1] * f]);
    }
    const cab = [pts[0][0] + 2.2, pts[0][1] - 1.5 - enrosca * 6 + Math.sin(o.t * 6) * sisea * 0.6], radio = i => 2.6 - i * 0.2;
    const traza = cc => { for (let i = n - 1; i > 0; i--) capsula(cc, ...pts[i], ...pts[i - 1], radio(i), radio(i - 1)); capsula(cc, ...pts[0], cab[0] - 1, cab[1], radio(0), 2.6); ovalo(cc, cab[0], cab[1], 3.6, 2.9); };
    silueta(c, traza, '#22c55e', cc => { for (let i = 1; i < n; i += 2) mancha(cc, k => ovalo(k, ...pts[i], radio(i) * 0.75, radio(i) * 0.55), '#86efac'); });
    c.save(); c.translate(cab[0], cab[1]);
    ojo(c, 0, -0.8, 1.1, o, 1); ojo(c, 2.2, -0.9, 1, o, -1); colorete(c, 2.6, 1);
    const lengua = sisea ? Math.max(0, Math.sin(o.t * 26)) : ((o.t % 2.6) < 0.25 ? 1 : 0);
    if (lengua) { c.strokeStyle = '#ef4444'; c.lineWidth = 0.7; c.lineCap = 'round'; c.beginPath(); c.moveTo(3.4, 0.9); c.lineTo(5.4, 0.9); c.lineTo(6.4, 0.2); c.moveTo(5.4, 0.9); c.lineTo(6.4, 1.6); c.stroke(); }
    else boca(c, 2, 1.4, o, 0.8);
    c.restore();
    if (duerme) zetas(c, cab[0] + 2, cab[1] - 5, o.t);
  }

  // ---------- BICHITO (mariquita) ----------
  const antenasBicho = (ant, y0) => [[0, -1], [1, 1]].map(([i, s]) => [5.4 + s * 0.6, y0 - 2, 6 + s * 1.2 + Math.sin(ant[i]) * 2, y0 - 5.4 + Math.abs(ant[i])]);
  // caparazón rojo con lunares que se abre en dos alas para volar, cabecita negra con antenas que rebotan y seis patitas que corren.
  // Vuela (abre el caparazón, despega un poco y aterriza) y antenas (las mueve buscando algo)
  function bichito(c, o) {
    const dt = dtDe(o), m = o.m, cor = o.mov ? 1 : 0, duerme = dormido(o), vuela = o.acc === 'vuela' ? Math.sin(o.k * Math.PI) : 0, antenas = o.acc === 'antenas' ? env(o.k, 0.15) : 0;
    const y0 = -4.5 + duerme * 1.2 - vuela * 7, F = o.t * 20;
    const ant = [0, 1].map(i => muelle(m, 'ant' + i, (cor ? Math.sin(F * 0.5 + i) * 0.25 : 0) + antenas * Math.sin(o.t * 9 + i * 2) * 0.5, dt, 120, 6));
    const abre = vuela ? 0.9 : 0;
    const traza = cc => {
      for (let i = 0; i < 3; i++) { const hx = -2.6 + i * 2.6, p = cor * Math.sin(F + i * 2) * 1.4; capsula(cc, hx, y0 + 2, hx + 1 + p, y0 + 4.4 - duerme * 1.2 + vuela * 2, 0.6); }
      ovalo(cc, 5, y0 - 0.2, 2.6, 2.4);                                                  // cabeza
      for (const a of antenasBicho(ant, y0)) capsula(cc, ...a, 0.35, 0.75);
      cc.save(); cc.translate(0, y0); cc.rotate(-abre * 0.5); ovalo(cc, -0.6, 0, 5.8, 4.2); cc.restore();      // caparazón (se abre al volar)
    };
    silueta(c, traza, '#e53e3e', cc => {
      mancha(cc, k => ovalo(k, 5, y0 - 0.2, 2.6, 2.4), '#1f1a2e');
      for (const a of antenasBicho(ant, y0)) mancha(cc, k => capsula(k, ...a, 0.35, 0.75), '#1f1a2e');      // antenas negras, finas
      cc.save(); cc.translate(0, y0); cc.rotate(-abre * 0.5); for (const [x, y, r] of [[-3, -1.6, 1.2], [0.6, -2.2, 1], [-1, 1.4, 1.1], [2.6, 0.6, 0.9]]) mancha(cc, k => ovalo(k, x, y, r, r), '#1f1a2e');
      cc.lineWidth = 0.8; cc.strokeStyle = '#1f1a2e'; cc.beginPath(); cc.moveTo(4.6, -2.6); cc.quadraticCurveTo(0, -1, -6, 1); cc.stroke(); cc.restore();
    });
    if (vuela) for (const k of [-1, 1]) { c.globalAlpha = 0.5; mancha(c, q => ovalo(q, -2 + k * 1.5, y0 - 4, 4, 1.6, -0.6 + k * Math.sin(o.t * 50) * 0.4), '#e0f2fe'); c.globalAlpha = 1; }
    c.save(); c.translate(5, y0 - 0.2); for (const x of [0.4, 1.8]) mancha(c, k => ovalo(k, x, -0.4, 0.95, 1.05), '#ffffff'); ojo(c, 0.4, -0.4, 0.7, o, 1); ojo(c, 1.8, -0.4, 0.65, o, -1); c.restore();      // ojos blancos sobre la cabeza negra
    if (duerme) zetas(c, 6, y0 - 5, o.t);
  }

  // ---------- NANOBOT ----------
  // robotito redondo con pantalla de cara, antena con luz que parpadea y dos piernas cortas de muelle. Escanea (la antena gira y la luz se
  // pone verde) y baile (baile de robot a golpes)
  function nanobot(c, o) {
    const dt = dtDe(o), m = o.m, cor = o.mov ? 1 : 0, duerme = dormido(o), escanea = o.acc === 'escanea' ? env(o.k, 0.12) : 0, baile = o.acc === 'baile' ? env(o.k, 0.08) : 0;
    const paso = Math.floor(o.t * 4), golpe = baile ? (paso % 2 ? 1 : -1) : 0, F = o.t * 14;
    const y0 = -9 - cor * Math.abs(Math.sin(F)) * 1.2 + duerme * 2.5 + (baile ? Math.abs(Math.sin(o.t * 12.5)) * -1.2 : 0);
    const antR = muelle(m, 'antena', cor * 0.3 + golpe * 0.4, dt, 160, 6), giro = baile ? golpe * 0.15 : 0;
    const traza = cc => {
      for (const k of [-1, 1]) { const p = cor * Math.sin(F + (k > 0 ? Math.PI : 0)) * 1.3; capsula(cc, k * 2.4, y0 + 4, k * 2.4 + p, -1 + (baile && k === golpe ? -1.2 : 0), 1.2, 1.4); }
      cc.save(); cc.translate(0, y0); cc.rotate(giro); ovalo(cc, 0, 0, 6, 5.6);
      for (const k of [-1, 1]) capsula(cc, k * 5.4, 1, k * (7.4 + baile * 1.2), 3 - baile * golpe * k * 3, 1, 1);
      cc.save(); cc.translate(-1, -5.2); cc.rotate(antR + escanea * o.t * 6); capsula(cc, 0, 0, 0, -3, 0.5, 0.5); cc.restore();
      cc.restore();
    };
    silueta(c, traza, '#cbd5e1', cc => { cc.save(); cc.translate(0, y0); cc.rotate(giro); mancha(cc, k => k.roundRect(-3.6, -2.6, 7.6, 5.2, 2), '#0f172a'); mancha(cc, k => ovalo(k, -3.4, -3.6, 1.6, 1, -0.5), 'rgba(255,255,255,.6)'); cc.restore(); });
    c.save(); c.translate(0, y0); c.rotate(giro);
    c.save(); c.translate(-1, -5.2); c.rotate(antR + escanea * o.t * 6); const luz = escanea ? '#4ade80' : (o.t % 1.2) < 0.6 ? '#ef4444' : '#7f1d1d'; mancha(c, k => ovalo(k, 0, -3.6, 1.3, 1.3), luz); c.lineWidth = 0.8; c.strokeStyle = OL; c.stroke(); c.restore();
    // la cara en la pantalla: píxeles de luz (ojos según el gesto, boca)
    const g = gesto(o), px = (x, y, w = 0.9, h = 0.9) => mancha(c, k => k.rect(x, y, w, h), '#22e3ff');
    const mx = (o.mira || 0) * 0.5;
    if (g === 'duerme') { px(-2.2, -0.4, 1.6, 0.5); px(0.8, -0.4, 1.6, 0.5); }
    else if (g === 'feliz') { px(-2.2 + mx, -0.8, 0.6, 0.6); px(-1.6 + mx, -1.4, 0.6, 0.6); px(-1 + mx, -0.8, 0.6, 0.6); px(0.8 + mx, -0.8, 0.6, 0.6); px(1.4 + mx, -1.4, 0.6, 0.6); px(2 + mx, -0.8, 0.6, 0.6); }
    else if (g === 'susto') { px(-2.4, -1.6, 1.6, 1.6); px(0.8, -1.6, 1.6, 1.6); }
    else { px(-2 + mx, -1.2, 1.1, 1.4); px(1 + mx, -1.2, 1.1, 1.4); }
    if (g === 'feliz' || baile) { px(-1.2, 1, 2.6, 0.5); px(-1.6, 0.6, 0.5, 0.5); px(1.3, 0.6, 0.5, 0.5); } else if (g === 'susto') px(-0.4, 0.8, 1, 1); else px(-0.9, 1, 2, 0.5);
    c.restore();
    if (duerme) zetas(c, 5, y0 - 8, o.t);
  }

  // ---------- RECREATIVA ----------
  // una maquinita de arcade con patitas: pantalla con su cara de píxeles y tres botones planos (nada que sobresalga de la caja). Juega (en la pantalla sale un marcianito que se
  // mueve) y premio (la pantalla parpadea de colores y salta)
  function recreativa(c, o) {
    dtDe(o);
    const cor = o.mov ? 1 : 0, duerme = dormido(o), juega = o.acc === 'juega' ? env(o.k, 0.1) : 0, premio = o.acc === 'premio' ? o.k : 0, F = o.t * 13;
    const salto = premio ? Math.abs(Math.sin(premio * Math.PI * 3)) * 3 : 0, y0 = -1 - cor * Math.abs(Math.sin(F)) * 1.2 - salto + duerme * 1.5, ladeo = cor * Math.sin(F) * 0.06;
    const traza = cc => {
      for (const k of [-1, 1]) { const p = cor * Math.sin(F + (k > 0 ? Math.PI : 0)) * 1.4; capsula(cc, k * 3, y0 - 1, k * 3 + p, -0.8, 1.3); }
      cc.save(); cc.translate(0, y0); cc.rotate(ladeo); cc.moveTo(-6, -1); cc.lineTo(-6, -15); cc.lineTo(-4.6, -18.6); cc.lineTo(5.2, -18.6); cc.lineTo(6, -15); cc.lineTo(6, -1); cc.closePath(); cc.restore();      // caja lisa, sin nada que sobresalga
    };
    silueta(c, traza, '#6d28d9', cc => { cc.save(); cc.translate(0, y0); cc.rotate(ladeo); mancha(cc, k => k.rect(-6, -18.6, 12, 2.6), '#facc15'); mancha(cc, k => k.rect(-4, -5, 8, 3), '#4c1d95'); cc.restore(); });
    c.save(); c.translate(0, y0); c.rotate(ladeo);
    const fondo = premio ? ['#22e3ff', '#f472b6', '#facc15', '#4ade80'][Math.floor(o.t * 12) % 4] : '#0f172a';
    mancha(c, k => k.roundRect(-4.4, -14.6, 8.8, 7, 1.2), fondo); c.lineWidth = 1; c.strokeStyle = OL; c.stroke();
    const px = (x, y, w = 1, h = 1, col = premio ? '#0f172a' : '#22e3ff') => mancha(c, k => k.rect(x, y, w, h), col), g = gesto(o);
    if (juega) { const x = Math.sin(o.t * 4) * 2.2; px(x - 1, -12.6, 2.2, 1, '#4ade80'); px(x - 1.6, -11.6, 3.4, 1, '#4ade80'); px(x - 1.6, -10.6, 0.8, 0.8, '#4ade80'); px(x + 1, -10.6, 0.8, 0.8, '#4ade80'); px(-0.4, -8.8 - ((o.t * 3) % 1) * 3, 0.5, 1, '#fff'); }
    else if (g === 'duerme') { px(-2.8, -11.4, 1.6, 0.5); px(0.9, -11.4, 1.6, 0.5); }
    else if (g === 'feliz' || premio) { px(-2.8, -11.6, 0.6, 0.6); px(-2.2, -12.2, 0.6, 0.6); px(-1.6, -11.6, 0.6, 0.6); px(1, -11.6, 0.6, 0.6); px(1.6, -12.2, 0.6, 0.6); px(2.2, -11.6, 0.6, 0.6); px(-1.4, -9.8, 2.8, 0.6); }
    else if (g === 'susto') { px(-2.8, -12.4, 1.6, 1.6); px(1, -12.4, 1.6, 1.6); px(-0.5, -9.8, 1, 1); }
    else { px(-2.6, -12.2, 1.2, 1.5); px(1.2, -12.2, 1.2, 1.5); px(-1.2, -9.6, 2.4, 0.6); }
    ['#ef4444', '#facc15', '#22e3ff'].forEach((col, i) => { const pulsa = juega && Math.floor(o.t * 6) % 3 === i ? 0.4 : 0; mancha(c, k => ovalo(k, -2.4 + i * 2.4, -3.4 + pulsa, 0.95, 0.75 - pulsa * 0.5), col); });      // tres botones planos (sin palanca)
    c.restore();
    if (duerme) zetas(c, 5, y0 - 20, o.t);
  }

  // ---------- CALAVERA ----------
  // una calavera simpática que va a saltitos y castañetea los dientes; la mandíbula es parte de la silueta y se abre. Castañetea (tiembla
  // y chocan los dientes) y gira (da una vuelta sobre sí misma)
  function calavera(c, o) {
    const dt = dtDe(o), m = o.m, cor = o.mov ? 1 : 0, duerme = dormido(o), cast = o.acc === 'castañetea' ? env(o.k, 0.1) : 0, gira = o.acc === 'gira' ? Math.sin(o.k * Math.PI * 2) : 0;
    const bote = cor * Math.abs(Math.sin(o.t * 9)) * 4, y0 = -7.5 - bote + duerme * 1, apl = cor ? 1 - Math.min(1, Math.abs(Math.sin(o.t * 9)) * 4) * 0 : 1;
    const mand = muelle(m, 'mand', cor * Math.abs(Math.sin(o.t * 9)) * 1.2 + cast * Math.max(0, Math.sin(o.t * 40)) * 1.4 + (gesto(o) === 'susto' ? 1.4 : 0), dt, 200, 10);
    const tiembla = cast ? Math.sin(o.t * 50) * 0.4 : 0;
    c.save(); c.translate(tiembla, y0); c.scale(1 - Math.abs(gira) * 0.75 * (apl ? 1 : 1), 1);
    const traza = cc => { ovalo(cc, 0, -2, 6.2, 5.8); cc.roundRect(-3.6, 2, 7.2, 3 + mand, 1.4); };
    silueta(c, traza, '#f5f5f4', cc => { mancha(cc, k => ovalo(k, -2.6, -4.8, 1.8, 1.1, -0.4), '#ffffff'); cc.lineWidth = 0.6; cc.strokeStyle = '#a8a29e'; cc.beginPath(); for (const x of [-1.8, 0, 1.8]) { cc.moveTo(x, 2.6 + mand * 0.5); cc.lineTo(x, 4.6 + mand); } cc.moveTo(-3.6, 3.2 + mand * 0.5); cc.lineTo(3.6, 3.2 + mand * 0.5); cc.stroke(); });
    const g = gesto(o);
    for (const [x, k] of [[-2.2, 1], [2.2, -1]]) {
      if (g === 'duerme') { c.beginPath(); c.moveTo(x - 1.4, -2); c.quadraticCurveTo(x, -1, x + 1.4, -2); c.lineWidth = 1.1; c.strokeStyle = OL; c.stroke(); continue; }
      mancha(c, q => ovalo(q, x, -2, 1.8, 2.1), OL);
      if (g === 'susto') mancha(c, q => ovalo(q, x, -2, 0.6, 0.6), '#ff4b5c'); else if (g === 'feliz') { c.beginPath(); c.moveTo(x - 1, -1.6); c.quadraticCurveTo(x, -3.2, x + 1, -1.6); c.lineWidth = 0.8; c.strokeStyle = '#fff'; c.stroke(); } else mancha(c, q => ovalo(q, x + 0.5 + (o.mira || 0) * 0.4, -2.6, 0.5, 0.5), '#fff');
    }
    mancha(c, q => tri(q, -0.6, 0.8, 0.6, 0.8, 0, -0.4), OL);
    colorete(c, 4, 0.4); colorete(c, -4, 0.4);
    c.restore();
    if (duerme) zetas(c, 5, y0 - 8, o.t);
  }

  Object.assign(MASCOTAS_VIVAS, { serpiente, bichito, nanobot, recreativa, calavera });
  Object.assign(MASCOTAS_VIVAS_ACC, {
    serpiente: { duerme: 4.5, enrosca: 3, sisea: 1.6 },
    bichito: { duerme: 4.5, vuela: 1.6, antenas: 2 },
    nanobot: { duerme: 4.5, escanea: 2.4, baile: 2.4 },
    recreativa: { duerme: 4.5, juega: 3, premio: 1.4 },
    calavera: { duerme: 4.5, 'castañetea': 1.4, gira: 1 },
  });
  registraMascotasVivas(['serpiente', 'bichito', 'nanobot', 'recreativa', 'calavera']);
})();
