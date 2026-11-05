// Fans of Rouflage · MASCOTAS VIVAS (Daniel, 5-11-2026: «como los colados, sin uniones, que no sean un círculo con patas»): cada mascota es
// una sola silueta de cortador de galletas, igual que el colado (alubia.js): todas sus piezas (tronco, cabeza, hocico, orejas, cuatro patas,
// cola, tentáculos) se trazan en un mismo camino, se le pone el contorno grueso por detrás y el relleno por delante, así no se ve ninguna
// costura. Lo de dentro (panza, manchas, rayas, orejas de otro tono) se pinta recortado a la silueta, sin contorno propio. Las piezas se
// mueven con inercia: las patas siguen un paso de verdad (diagonales juntas), y las orejas y la cola van con retraso y rebotan (muelles).
// MASCOTAS_VIVAS[id](c, o) dibuja con los pies en 0,0 mirando a la derecha (unos 20 de alto); o = { t, mov, susto, acc, k (0..1 de la
// acción), m (estado: sus muelles), mira (-1..1, hacia su dueño), contento }. Por ahora gato, perro y pulpo; el resto sigue en
// armario-mascotas.js hasta rehacerlas. Se carga justo después de armario-mascotas.js y sustituye ahí a estas tres (ARD.MASCOTAS).
'use strict';

// una pata que anda, desde la cadera (hx, hy): el pie va hacia DELANTE (+x, adonde mira) mientras está levantado y hacia atrás apoyado en el
// suelo (así empuja); plegada (sentada) se dobla hacia delante. F: fase del paso; cor: 0 quieta, 1 andando. Devuelve [cadera x, y, pie x, y]
function mascotaPata(F, cor, hx, hy, largo, plega = 0) {
  const pie = -cor * Math.cos(F) * 3, alza = cor * Math.max(0, Math.sin(F)) * 2.2;
  return [hx, hy, hx + pie + plega * 3, hy + largo - alza - plega * (largo - 1.5)];
}

// las piezas comunes (silueta, muelles, caras…), para las mascotas de mascotas-vivas2.js
const MV_KIT = {};

const MASCOTAS_VIVAS = (() => {
  const OL = '#20102c', T = Math.PI * 2;
  // ---- piezas de la silueta (todas en el mismo sentido de giro: se suman al rellenar, como las del colado) ----
  function capsula(c, x1, y1, x2, y2, r1, r2 = r1) {
    const a = Math.atan2(y2 - y1, x2 - x1), n = a - Math.PI / 2;
    c.moveTo(x2 + Math.cos(n) * r2, y2 + Math.sin(n) * r2);
    c.arc(x2, y2, r2, n, n + Math.PI);
    c.arc(x1, y1, r1, n + Math.PI, n + T);
    c.closePath();
  }
  const ovalo = (c, x, y, rx, ry, rot = 0) => { c.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx); c.ellipse(x, y, rx, ry, rot, 0, T); c.closePath(); };
  const tri = (c, ...p) => { c.moveTo(p[0], p[1]); c.lineTo(p[2], p[3]); c.lineTo(p[4], p[5]); c.closePath(); };
  // una cadena (cola, tentáculo): trozos que se estrechan, cada uno con su ángulo
  function cadena(c, x, y, angs, largo, r0, r1) {
    let px = x, py = y;
    angs.forEach((a, i) => { const nx = px + Math.cos(a) * largo, ny = py + Math.sin(a) * largo, ra = r0 + (r1 - r0) * (i / angs.length), rb = r0 + (r1 - r0) * ((i + 1) / angs.length); capsula(c, px, py, nx, ny, ra, rb); px = nx; py = ny; });
    return [px, py];
  }
  // la silueta: contorno grueso por detrás y relleno por delante (sin costuras); luego `dentro` pinta recortado a ella
  function silueta(c, traza, color, dentro) {
    c.beginPath(); traza(c);
    c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = OL; c.stroke();
    c.fillStyle = color; c.fill();
    if (dentro) { c.save(); c.clip(); dentro(c); c.restore(); }
  }
  const mancha = (c, f, color) => { c.beginPath(); f(c); c.fillStyle = color; c.fill(); };

  // ---- movimiento ----
  function muelle(m, k, objetivo, dt, rigidez = 90, freno = 9) {
    const s = m.muelles[k] || (m.muelles[k] = { x: objetivo, v: 0 });
    s.v += ((objetivo - s.x) * rigidez - s.v * freno) * dt; s.x += s.v * dt;
    return s.x;
  }
  const dtDe = o => { const m = o.m; m.muelles = m.muelles || {}; const d = Math.min(0.05, Math.max(0, o.t - (m.tMuelle ?? o.t))); m.tMuelle = o.t; return d; };
  const pataAnda = mascotaPata;
  const parpadea = o => !o.susto && ((o.t + (o.m.sem || 0)) % 3.7) < 0.11;
  // el gesto de la cara: susto, duerme, serio (cazando u olfateando), feliz (cerca de su dueño, a ratos) o normal
  const gesto = o => o.susto ? 'susto' : o.acc === 'duerme' ? 'duerme' : (o.acc === 'caza' || o.acc === 'olfatea') ? 'serio'
    : (o.contento && ((o.t + (o.m.sem || 0)) % 5) < 1.6) || o.acc === 'saluda' || o.acc === 'rueda' ? 'feliz' : 'normal';
  function ojo(c, x, y, r, o, ceja = 0) {
    const mx = (o.mira || 0) * 0.45, g = gesto(o);
    c.lineCap = 'round';
    if (g === 'duerme') { c.beginPath(); c.moveTo(x - r, y + 0.2); c.quadraticCurveTo(x, y + r * 0.7, x + r, y + 0.2); c.lineWidth = 1; c.strokeStyle = OL; c.stroke(); return; }
    if (g === 'feliz') { c.beginPath(); c.moveTo(x - r, y + 0.4); c.quadraticCurveTo(x, y - r * 1.2, x + r, y + 0.4); c.lineWidth = 1.1; c.strokeStyle = OL; c.stroke(); return; }
    if (g === 'serio' || g === 'susto') {      // la ceja: decidida (baja hacia dentro) o preocupada (sube hacia dentro)
      const d = g === 'serio' ? 1 : -1; c.beginPath(); c.moveTo(x - r * 1.1, y - r * 1.5 - d * ceja * 0.5); c.lineTo(x + r * 1.1, y - r * 1.5 + d * ceja * 0.5);
      c.lineWidth = 0.9; c.strokeStyle = OL; c.stroke();
    }
    if (o.susto) { mancha(c, cc => ovalo(cc, x, y, r * 1.2, r * 1.3), '#fff'); c.lineWidth = 0.8; c.strokeStyle = OL; c.stroke(); mancha(c, cc => ovalo(cc, x + 0.3, y, r * 0.45, r * 0.45), OL); return; }
    if (parpadea(o)) { c.beginPath(); c.moveTo(x - r, y); c.quadraticCurveTo(x, y + r * 0.8, x + r, y); c.lineWidth = 1; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); return; }
    mancha(c, cc => ovalo(cc, x + mx, y, r * 0.78, r), OL); mancha(c, cc => ovalo(cc, x + mx + r * 0.28, y - r * 0.38, r * 0.3, r * 0.3), '#fff');
  }
  const colorete = (c, x, y) => mancha(c, cc => ovalo(cc, x, y, 1.6, 0.95), 'rgba(255,110,150,.5)');
  const sonrisa = (c, x, y, w = 1.3) => { c.beginPath(); c.arc(x, y - 0.6, w, 0.4, Math.PI - 0.4); c.lineWidth = 0.9; c.strokeStyle = OL; c.lineCap = 'round'; c.stroke(); };
  // la boca según el gesto: feliz, abierta con lengüita; susto, una «o»; duerme, una rayita; serio, recta; si no, la sonrisa
  function boca(c, x, y, o, w = 1.2) {
    const g = gesto(o); c.lineCap = 'round'; c.strokeStyle = OL; c.lineWidth = 0.9;
    if (g === 'feliz') { mancha(c, q => { q.moveTo(x - w, y - 0.5); q.quadraticCurveTo(x, y + w * 1.8, x + w, y - 0.5); q.closePath(); }, OL); mancha(c, q => ovalo(q, x, y + w * 0.55, w * 0.5, w * 0.35), '#ff6f8f'); return; }
    if (g === 'susto') { mancha(c, q => ovalo(q, x, y + 0.2, 0.75, 0.95), OL); return; }
    if (g === 'duerme' || g === 'serio') { c.beginPath(); c.moveTo(x - w * 0.6, y); c.lineTo(x + w * 0.6, y); c.stroke(); return; }
    sonrisa(c, x, y, w);
  }
  // las zetas de dormir: suben, se balancean y se desvanecen (dibujadas, no letras)
  function zetas(c, x, y, t) {
    for (let i = 0; i < 3; i++) {
      const q = ((t * 0.6 + i / 3) % 1), s = 1 + q * 1.4;
      c.save(); c.globalAlpha = Math.sin(q * Math.PI); c.translate(x + q * 5 + Math.sin(q * 6) * 1, y - q * 10);
      c.beginPath(); c.moveTo(-s, -s); c.lineTo(s, -s); c.lineTo(-s, s); c.lineTo(s, s);
      c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke(); c.lineWidth = 1; c.strokeStyle = '#fff'; c.stroke();
      c.restore();
    }
  }
  // dormir: se tumba entera (todas las patas plegadas, la cabeza baja) y respira despacio
  const dormido = o => (o.acc === 'duerme' ? env(o.k, 0.12) : 0);
  const env = (k, a = 0.25) => Math.min(1, k / a) * Math.min(1, (1 - k) / a);      // entra y sale suave

  // ---------- EL GATO ----------
  // tronco alargado, cabeza con orejas de punta, cuatro patas y cola larga en cadena que ondea con retraso. Naranja con rayas y panza crema.
  // Acciones: sienta (enrosca la cola), lame (se lame la pata), estira (culo en alto), duerme (zetas), caza (se agacha, menea el culo y salta)
  function gato(c, o) {
    const dt = dtDe(o), m = o.m, F = o.t * 13, cor = o.mov ? 1 : 0;
    const sienta = o.acc === 'sienta' ? env(o.k) : 0, estira = o.acc === 'estira' ? Math.sin(o.k * Math.PI) : 0, lame = o.acc === 'lame' ? env(o.k, 0.15) : 0;
    const duerme = dormido(o), caza = o.acc === 'caza' ? env(o.k, 0.1) : 0;
    // cazando: se agacha, menea el culo y al final salta sobre la presa
    const salto = o.acc === 'caza' && o.k > 0.72 ? Math.sin((o.k - 0.72) / 0.28 * Math.PI) * 7 : 0, meneaCulo = caza * (o.k < 0.72 ? Math.sin(o.t * 22) * 1.2 : 0);
    const bote = cor * Math.abs(Math.sin(F)) * 1.4 + Math.sin(o.t * (duerme ? 1.4 : 2.6)) * (duerme ? 0.45 : 0.25) + salto;
    const baja = duerme * 4.2 + caza * 2.6 * (salto ? 0 : 1);
    const cadX = -5.5 + meneaCulo, cadY = -8.5 - bote + sienta * 3.5 - estira * 1.5 + baja, homX = 5, homY = -8.5 - bote + estira * 2.5 - sienta * 2 + baja;
    const caY = muelle(m, 'caY', homY - 4.2 + duerme * 2.5, dt, 120, 11), caX = homX + 3 + estira * 1.5 - sienta * 0.5 + caza * 0.8;
    const colaA = muelle(m, 'cola0', -2.1 + sienta * 1.7 + cor * 0.6 + Math.sin(o.t * 2) * 0.2, dt, 55, 7);
    const angs = [0, 1, 2, 3, 4].map(i => colaA + muelle(m, 'cola' + (i + 1), (Math.sin(o.t * 2.4 - i * 0.8) * 0.28 + cor * Math.sin(F - i) * 0.1) * (i + 1) * 0.6 - sienta * 0.5 * i, dt, 70 - i * 8, 7));
    const orejas = [-1, 1].map(k => muelle(m, 'oreja' + k, (cor ? -0.25 : 0) + (o.susto ? -0.55 : 0) + (((o.t * 0.8 + k) % 4.5) < 0.12 ? 0.35 : 0), dt, 170, 8));
    const lameP = lame * Math.sin(o.k * Math.PI * 8) * 0.8;
    const traza = cc => {
      capsula(cc, cadX, cadY, homX, homY, 4.4, 4);                                     // el tronco
      cadena(cc, cadX - 2.5, cadY - 1.5, angs.map((a, i) => a + i * 0.12), 2.6, 1.7, 1.2);      // la cola
      cc.save(); cc.translate(caX, caY); cc.rotate(muelle(m, 'cabR', (o.mira || 0) * 0.12 + lame * 0.45 - estira * 0.15, dt, 110, 10));
      ovalo(cc, 0, 0, 4.9, 4.3);                                                       // la cabeza
      orejas.forEach((r, i) => { const k = i ? 1 : -1; cc.save(); cc.translate(k * 2.4, -2.8); cc.rotate(r * k); tri(cc, -2.1, 0.6, 2.1, 0.6, 0.1, -4.4); cc.restore(); });
      cc.restore();
      // patas: de atrás (cadera) y de delante (hombro); sentado, las de atrás se pliegan; lamiendo, la de delante sube a la boca
      for (const [hx, hy, ph, pl] of [[cadX + 1.2, cadY + 2, 0, sienta], [cadX - 1.2, cadY + 2, Math.PI, sienta], [homX - 1, homY + 2, Math.PI / 2, 0], [homX + 1.2, homY + 2, Math.PI * 1.5, 0]]) {
        const p = pataAnda(F + ph, cor, hx, hy, 6.5 + bote - salto + (hy === homY + 2 ? sienta * 2 : 0) - estira * (hx > 0 ? 0 : 3) - baja, Math.max(pl, duerme));
        if (lame && hx === homX + 1.2) { capsula(cc, hx, hy, caX + 2 + lameP, caY + 3.5, 1.5); continue; }
        capsula(cc, ...p, 1.6, 1.5);
      }
    };
    silueta(c, traza, '#ff9a3d', cc => {
      mancha(cc, k => ovalo(k, 1.5, cadY + 3, 6, 2.6), '#ffe7c7');                       // panza
      cc.lineWidth = 1.3; cc.strokeStyle = '#d9671a'; cc.lineCap = 'round';
      for (const f of [0.15, 0.38, 0.6]) { const x = cadX + (homX - cadX) * f, y = cadY + (homY - cadY) * f; cc.beginPath(); cc.moveTo(x, y - 4.6); cc.quadraticCurveTo(x + 0.8, y - 2.4, x, y - 1); cc.stroke(); }      // rayas, sobre el lomo
      cc.save(); cc.translate(caX, caY); cc.rotate(muelle(m, 'cabR', 0, 0));
      orejas.forEach((r, i) => { const k = i ? 1 : -1; cc.save(); cc.translate(k * 2.4, -2.8); cc.rotate(r * k); mancha(cc, q => tri(q, -1.05, -0.2, 1.05, -0.2, 0.1, -2.9), '#ff9fb5'); cc.restore(); });
      mancha(cc, q => ovalo(q, 1.8, 1.8, 2.7, 1.8), '#ffe7c7');                          // morro
      cc.restore();
    });
    c.save(); c.translate(caX, caY); c.rotate(muelle(m, 'cabR', 0, 0));
    ojo(c, -0.3, -0.6, 1.25, o, 1); ojo(c, 2.6, -0.6, 1.25, o, -1); colorete(c, 3.9, 1.4);
    mancha(c, q => tri(q, 2, 0.9, 3.2, 0.9, 2.6, 1.7), '#ff6f8f');
    if (lame) mancha(c, q => ovalo(q, 3, 3 + Math.abs(lameP), 0.9, 1.2), '#ff6f8f'); else boca(c, 2.6, 2.7, o, 1);
    c.lineWidth = 0.55; c.strokeStyle = OL; c.beginPath(); for (const d of [-0.5, 0.7]) { c.moveTo(4.4, 1.6 + d * 0.5); c.lineTo(7.2, 1.2 + d); } c.stroke();
    c.restore();
    if (duerme) zetas(c, caX + 3, caY - 5, o.t);
  }

  // ---------- EL PERRO ----------
  // tronco, cabeza con hocico alargado y orejas caídas (de otro tono, recortadas dentro), cuatro patas y cola que menea; con mancha en el
  // lomo. Acciones: sienta, jadea (lengua fuera), rueda (panza arriba y pedalea), duerme, olfatea (morro al suelo, olisqueando)
  function perro(c, o) {
    const dt = dtDe(o), m = o.m, F = o.t * 12, cor = o.mov ? 1 : 0;
    const sienta = o.acc === 'sienta' ? env(o.k) : 0, rueda = o.acc === 'rueda' ? env(o.k, 0.2) : 0, jadea = (o.acc === 'jadea' || cor) && !o.susto;
    const duerme = dormido(o), olfatea = o.acc === 'olfatea' ? env(o.k, 0.15) : 0;
    const bote = cor * Math.abs(Math.sin(F)) * 1.3 + Math.sin(o.t * (jadea ? 13 : duerme ? 1.4 : 3)) * (jadea ? 0.3 : duerme ? 0.45 : 0.18);
    const baja = duerme * 4.2;
    const cadX = -5.5, cadY = -8.5 - bote + sienta * 3.5 + baja, homX = 5, homY = -9 - bote - sienta * 2 + baja + olfatea * 1.2;
    const caY = muelle(m, 'caY', homY - 4.4 + duerme * 2.8 + olfatea * 5.5, dt, 110, 10), caX = homX + 2.8 + olfatea * 1.5;
    const meneo = Math.sin(o.t * (o.contento ? 24 : 9)) * (o.contento ? 0.55 : 0.25);
    const colaA = muelle(m, 'cola', -1 + meneo - sienta * 0.6, dt, 150, 8);
    const orejaR = muelle(m, 'oreja', Math.sin(F) * 0.35 * cor + (o.susto ? -1 : 0) + (o.contento ? Math.sin(o.t * 5) * 0.1 : 0), dt, 50, 4.5);
    const pedalea = rueda ? Math.sin(o.t * 16) : 0;
    c.save();
    if (rueda) { c.translate(0, -7); c.rotate(-rueda * Math.PI); c.translate(0, 7 - rueda * 1.5); }
    const cabR = muelle(m, 'cabR', (o.mira || 0) * 0.12 + (o.contento ? Math.sin(o.t * 4) * 0.08 : 0) + olfatea * (0.45 + Math.sin(o.t * 9) * 0.12), dt, 100, 10);
    const traza = cc => {
      capsula(cc, cadX, cadY, homX, homY, 4.6, 4.3);
      cadena(cc, cadX - 3, cadY - 2, [colaA, colaA - 0.25, colaA - 0.5], 2.3, 1.6, 1);
      cc.save(); cc.translate(caX, caY); cc.rotate(cabR);
      ovalo(cc, 0, 0, 4.7, 4.4);
      capsula(cc, 2, 1.2, 5.6, 1.4, 2.6, 2.1);                                        // el hocico
      cc.save(); cc.translate(-1.6, -2.6); cc.rotate(0.35 + orejaR); capsula(cc, 0, 0, -0.6, 5.2, 1.9, 2.3); cc.restore();      // la oreja
      cc.restore();
      for (const [hx, hy, ph, pl] of [[cadX + 1.2, cadY + 2, 0, sienta], [cadX - 1.2, cadY + 2, Math.PI, sienta], [homX - 1, homY + 2, Math.PI / 2, 0], [homX + 1.2, homY + 2, Math.PI * 1.5, 0]]) {
        const p = pataAnda(F + ph + pedalea * 2, cor || (rueda ? 0.7 : 0), hx, hy, 6.5 + bote + (hx > 0 ? sienta * 2 - olfatea * 1.2 : 0) - baja, Math.max(pl, duerme));
        capsula(cc, ...p, 1.7, 1.6);
      }
    };
    silueta(c, traza, '#e3ad72', cc => {
      mancha(cc, k => ovalo(k, -3, cadY - 2.4, 3.4, 2.6, 0.2), '#a8662e');             // la mancha del lomo
      mancha(cc, k => ovalo(k, 1.5, cadY + 3, 6, 2.4), '#fff3e0');                      // panza
      cc.save(); cc.translate(caX, caY); cc.rotate(cabR);
      mancha(cc, k => capsula(k, 2, 1.6, 5.6, 1.8, 2.2, 1.8), '#fff3e0');               // hocico claro
      cc.save(); cc.translate(-1.6, -2.6); cc.rotate(0.35 + orejaR); mancha(cc, k => capsula(k, 0, 0, -0.6, 5.2, 1.9, 2.3), '#a8662e'); cc.restore();
      cc.restore();
    });
    c.save(); c.translate(caX, caY); c.rotate(cabR);
    mancha(c, q => ovalo(q, 6.4, 0.6, 1.25, 0.95), OL);                                 // nariz
    ojo(c, 0.3, -1, 1.25, o, 1); ojo(c, 3, -1.3, 1.15, o, -1); colorete(c, 1.6, 1.8);
    if (jadea && gesto(o) !== 'feliz') mancha(c, q => q.roundRect(3.3, 2.8, 1.9, 1.6 + Math.abs(Math.sin(o.t * 13)) * 1.3, 0.9), '#ff6f8f'); else boca(c, 4, 3, o, 1.1);
    if (olfatea) for (let i = 0; i < 2; i++) { const q = (o.t * 2.5 + i * 0.5) % 1; c.globalAlpha = (1 - q) * 0.8; mancha(c, k => ovalo(k, 7.5 + q * 3, 1 + q * 1.5 - i, 0.8 + q, 0.6 + q * 0.8), '#fff'); c.globalAlpha = 1; }      // olisqueos
    c.restore();
    if (duerme) zetas(c, caX + 3, caY - 5, o.t);
    c.restore();
  }

  // ---------- EL PULPO ----------
  // cabeza grande y ocho tentáculos de la misma silueta (sin costuras), que ondean con retraso y se rizan en la punta. No anda: se impulsa
  // juntando los tentáculos y abriéndolos. Acciones: burbuja (sube y explota), colores (cambia de golpe), saluda, duerme, tinta (chorrito)
  function pulpo(c, o) {
    const dt = dtDe(o), m = o.m, cor = o.mov ? 1 : 0;
    const golpe = cor ? (o.t * 3) % 1 : 0, encoge = cor ? (golpe < 0.3 ? golpe / 0.3 : Math.max(0, 1 - (golpe - 0.3) / 0.3)) : 0;
    const duerme = dormido(o), tinta = o.acc === 'tinta' ? o.k : 0;
    const y0 = -12 + Math.sin(o.t * (duerme ? 1.2 : 2.4)) * (duerme ? 0.5 : 1.2) - encoge * 1.5 + duerme * 4;
    const tonos = ['#b45cff', '#ff6f8f', '#39d5e8', '#7ee04a', '#ffcb3d'];
    const color = o.acc === 'colores' ? tonos[Math.floor(o.k * 9) % tonos.length] : '#b45cff';
    const tentaculos = [];
    for (let i = 0; i < 8; i++) {
      const base = -5.6 + i * 1.6, lado = base < -0.2 ? -1 : 1, saluda = o.acc === 'saluda' && i === 7;
      let a = Math.PI / 2 - base * (0.17 + duerme * 0.18) + muelle(m, 'ten' + i, encoge * 0.5 * lado, dt, 45, 6);      // dormido, los tentáculos se esparcen por el suelo
      if (saluda) a = -0.9 + Math.sin(o.k * Math.PI * 6) * 0.5;
      const angs = [];
      for (let j = 0; j < 4; j++) { a += Math.sin(o.t * 4 - j * 0.9 + i * 1.4) * (0.15 + cor * 0.1) * (1 - encoge * 0.6) - lado * (j > 1 ? 0.3 : 0.08); angs.push(a); }
      tentaculos.push({ base, angs });
    }
    const traza = cc => {
      cc.save(); cc.translate(0, y0); cc.scale(1 - encoge * 0.12, 1 + encoge * 0.2); ovalo(cc, 0, -3, 6.6, 7.2); cc.restore();
      for (const t of tentaculos) cadena(cc, t.base, y0 + 2.6, t.angs, 2.3, 1.5, 0.75);
    };
    silueta(c, traza, color, cc => {
      cc.save(); cc.translate(0, y0);
      mancha(cc, k => ovalo(k, -2.2, -7, 2.2, 1.4, -0.4), 'rgba(255,255,255,.35)');
      for (const [x, y] of [[-3.8, -2], [3.8, -5], [-0.8, -8.5]]) mancha(cc, k => ovalo(k, x, y, 0.85, 0.85), 'rgba(255,255,255,.4)');
      cc.restore();
    });
    c.save(); c.translate(0, y0);
    ojo(c, -0.6, -1, 1.4, o, 1); ojo(c, 2.8, -1, 1.4, o, -1); colorete(c, 4.3, 1.2);
    if (o.acc === 'burbuja' && o.k < 0.5) { const r = o.k * 5.5 + 0.4; mancha(c, q => ovalo(q, 4.6 + r * 0.5, 1.6, r * 0.7, r * 0.7), 'rgba(160,230,255,.5)'); c.lineWidth = 0.7; c.strokeStyle = OL; c.stroke(); }
    else boca(c, 1.2, 1.9, o, 1);
    c.restore();
    if (duerme) zetas(c, 5, y0 - 9, o.t);
    if (tinta) for (let i = 0; i < 5; i++) {      // un chorrito de tinta por detrás: nubes que crecen y se desvanecen
      const q = Math.min(1, Math.max(0, tinta * 1.6 - i * 0.12)); if (!q || q >= 1) continue;
      c.globalAlpha = (1 - q) * 0.85; mancha(c, k => ovalo(k, -6 - q * 10 - i * 1.5, y0 + 4 + Math.sin(i * 2) * 2, 1.5 + q * 3.5, 1.2 + q * 3), '#2a1745'); c.globalAlpha = 1;
    }
    if (o.acc === 'burbuja' && o.k >= 0.5) {
      const q = (o.k - 0.5) * 2, bx = 7 + Math.sin(q * 9) * 1.5, by = y0 + 1.6 - q * 16;
      if (q < 0.85) { mancha(c, k => ovalo(k, bx, by, 2.4, 2.4), 'rgba(160,230,255,.5)'); c.lineWidth = 0.7; c.strokeStyle = OL; c.stroke(); }
      else for (let a = 0; a < 6; a++) mancha(c, k => ovalo(k, bx + Math.cos(a) * (q - 0.85) * 28, by + Math.sin(a) * (q - 0.85) * 28, 0.6, 0.6), '#a0e6ff');
    }
  }

  Object.assign(MV_KIT, { OL, T, capsula, ovalo, tri, silueta, mancha, muelle, dtDe, pataAnda, gesto, ojo, boca, colorete, zetas, dormido, env });
  return { gato, perro, pulpo };
})();

// lo que sabe hacer cada una estando quieta, y cuánto dura (segundos); mascotas.js elige entre estas en vez de las de siempre
const MASCOTAS_VIVAS_ACC = {
  gato: { sienta: 3.2, lame: 1.6, estira: 1.4, duerme: 4.5, caza: 2.2 },
  perro: { sienta: 3, jadea: 2.2, rueda: 1.8, duerme: 4.5, olfatea: 2.2 },
  pulpo: { burbuja: 1.8, colores: 1.4, saluda: 1.4, duerme: 4.5, tinta: 1.4 },
};

// el armario, la habitación y Mi escenario dibujan con ARD.MASCOTAS: las vivas también salen ahí (cada sitio, con su propio estado de
// muelles). Lo llama cada archivo de mascotas vivas con las suyas
function registraMascotasVivas(ids) {
  for (const id of ids) {
    const estados = new Map();
    ARD.MASCOTAS[id] = (c, o) => {
      const clave = o.m || c.canvas; let m = estados.get(clave); if (!m) { m = { muelles: {}, sem: Math.random() * 9 }; estados.set(clave, m); if (estados.size > 20) estados.delete(estados.keys().next().value); }
      MASCOTAS_VIVAS[id](c, { t: o.t || 0, mov: o.mov ? 1 : 0, susto: !!o.susto, acc: '', k: 0, m, mira: 0.3, contento: !o.mov });
    };
  }
}
registraMascotasVivas(Object.keys(MASCOTAS_VIVAS));
