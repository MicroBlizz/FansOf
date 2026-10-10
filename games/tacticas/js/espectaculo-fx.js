// Fans of Rumble: Tácticas · ESPECTÁCULO (efectos): las piezas de las animaciones de los ataques. Rayos de luz al golpear, columnas
// de luz, ondas, tajos gigantes, relámpagos, auras, proyectiles, escudos, lluvias, entrada de técnica con el héroe en grande,
// estelas, parón al golpear (hit-stop) y las animaciones con tiempo (anim). Se pintan en tres capas: detrás, delante y pantalla.
'use strict';
const TAU = Math.PI * 2;

/* ---------- tiempo: animaciones que esperan (se paran con la pausa y van más rápido con la velocidad) ---------- */
function anim(seg, fn) { return new Promise(r => B.anims.push({ ini: B.t, seg, fn, r })); }
const suaveFx = p => p * p * (3 - 2 * p);
const sale = p => 1 - (1 - p) * (1 - p);
const entra = p => p * p;
function parada(seg) { B.parada = Math.max(B.parada || 0, seg); }   // el mundo se congela un instante al golpear fuerte
function fx(o) { o.v = 0; B.fx.push(o); return o; }

function avanzaFx(dtReal) {
  for (let i = B.anims.length - 1; i >= 0; i--) { const a = B.anims[i], p = Math.min(1, (B.t - a.ini) / a.seg); a.fn(p); if (p >= 1) { B.anims.splice(i, 1); a.r(); } }
  for (const o of B.fx) { o.v += dtReal; if (o.mueve) o.mueve(o, dtReal); }
  B.fx = B.fx.filter(o => o.v < o.dur);
  for (const g of B.fantasmas) g.v += dtReal; B.fantasmas = B.fantasmas.filter(g => g.v < 0.3);
  for (const u of [...B.heroes, ...B.enemigos]) if (u.estela) { u.tEstela = (u.tEstela || 0) + dtReal; if (u.tEstela > 0.025) { u.tEstela = 0; B.fantasmas.push({ u, x: u.x + u.dx, y: u.y + (u.dy || 0), col: u.estela, v: 0 }); } }
}

/* ---------- golpes: rayos de luz en cada impacto (los usa herir) ---------- */
function luzGolpe(u, d) {
  const [x, y] = [u.x + (u.dx || 0), u.y - alto(u) * 0.48], fuerte = d.crit || d.n > 80, col = u.lado === 'h' ? '#ff6a5a' : (d.crit ? '#ffcb3d' : '#fff2c0');
  fx({ t: 'rayos', x, y, col, n: fuerte ? 18 : 12, largo: fuerte ? 230 : 150, ancho: fuerte ? 0.09 : 0.07, rot: rand(0, TAU), dur: fuerte ? 0.45 : 0.32 });
  fx({ t: 'nucleo', x, y, col, r: fuerte ? 70 : 50, dur: fuerte ? 0.4 : 0.3 });
  chispasLuz(x, y, col, u.lado === 'h' ? 0 : Math.PI, fuerte ? 18 : 11);
  fx({ t: 'anillo', x, y: u.y, r: fuerte ? 110 : 70, col, grosor: 6, dur: 0.35 });
  parada(fuerte ? 0.11 : 0.05);
  if (d.crit) { fx({ t: 'destello', col: '#fff6d8', a: 0.28, dur: 0.2 }); B.temblor = Math.max(B.temblor, 8); }
}

/* ---------- atajos para las coreografías ---------- */
const rayos = (x, y, col, largo = 200, n = 16, dur = 0.45, ancho = 0.08) => fx({ t: 'rayos', x, y, col, n, largo, ancho, rot: rand(0, TAU), dur });
const nucleo = (x, y, col, r = 80, dur = 0.3) => fx({ t: 'nucleo', x, y, col, r, dur });
const corteLuz = (x, y, col, ang, largo = 170, dur = 0.32) => fx({ t: 'corteLuz', x, y, col, ang, largo, dur });
const franja = (y, col, dur = 0.35) => fx({ t: 'franja', y, col, dur });
// chispas que salen hacia `dir` (0 = derecha, π = izquierda) en abanico
const chispasLuz = (x, y, col, dir, n = 14, dur = 0.45) => fx({ t: 'chispasLuz', x, y, col, dur, chispas: Array.from({ length: n }, () => ({ a: dir + rand(-0.75, 0.75), v: rand(120, 340), g: rand(2, 4.5), blanca: Math.random() < 0.4 })) });
const anillo = (x, y, col, r = 120, dur = 0.45, grosor = 8) => fx({ t: 'anillo', x, y, col, r, grosor, dur });
const pilar = (x, y, col, ancho = 70, dur = 0.8) => fx({ t: 'pilar', x, y, col, ancho, dur });
const destello = (col = '#fff', a = 0.6, dur = 0.25) => fx({ t: 'destello', col, a, dur });
const oscuro = (dur = 1, a = 0.55) => fx({ t: 'oscuro', a, dur });
const aura = (u, col, dur = 0.9) => fx({ t: 'aura', u, col, dur });
const escudo = (u, col, dur = 1.1) => fx({ t: 'escudo', u, col, dur });
const rayoCielo = (x, y, col, dur = 0.4) => fx({ t: 'rayo', x, y, col, dur, semilla: rand(0, 1000) });
const tajoFx = (x, y, col, ang = 0.6, r = 110, dur = 0.32) => fx({ t: 'tajo', x, y, col, ang, r, dur });
const grieta = (x, y, col = '#ffb347', dur = 0.9) => fx({ t: 'grieta', x, y, col, dur, ramas: Array.from({ length: 7 }, (_, i) => ({ a: i / 7 * TAU + rand(-0.3, 0.3), l: rand(60, 130) })) });
const textoFx = (txt, x, y, col, tam = 60, dur = 0.8) => fx({ t: 'texto', txt, x, y, col, tam, dur });
const velocidad = (y, col, dur = 0.5) => fx({ t: 'velocidad', y, col, dur, lineas: Array.from({ length: 14 }, () => ({ y: rand(-60, 60), l: rand(80, 260), x: rand(0, 540), v: rand(900, 1600) })) });
function proyectil(x0, y0, x1, y1, seg, forma, col, arco = 0) {
  return fx({ t: 'proyectil', x0, y0, x1, y1, dur: seg, forma, col, arco, rot: rand(0, TAU) });
}
function lluvia(cx, ancho, forma, col, n = 18, dur = 1.1) {
  return fx({ t: 'lluvia', forma, col, dur, cosas: Array.from({ length: n }, () => ({ x: cx + rand(-ancho / 2, ancho / 2), y: rand(-200, 60), vy: rand(500, 800), r: rand(0, TAU), vr: rand(-8, 8) })),
    mueve: (o, dt) => { for (const c of o.cosas) { c.y += c.vy * dt; c.r += c.vr * dt; } } });
}
const estela = (u, col) => { u.estela = col; };
const sinEstela = u => { u.estela = null; };
// mueve a un luchador (dx: hacia los lados; dy: hacia arriba con negativo) con la curva que se pida
function mover(u, dx, dy, seg, curva = suaveFx, salto = 0) {
  const x0 = u.dx, y0 = u.dy || 0;
  return anim(seg, p => { const k = curva(p); u.dx = lerp(x0, dx, k); u.dy = lerp(y0, dy, k) - Math.sin(p * Math.PI) * salto; });
}
const volverCasa = (u, seg = 0.3, salto = 0) => mover(u, 0, 0, seg, suaveFx, salto);
// la entrada de la técnica: la pantalla se oscurece, una franja cruza con el héroe en grande y el nombre
async function entradaTecnica(h, nombre, col) {
  oscuro(1.1, 0.5); fx({ t: 'corte', key: h.key, nombre, col, dur: 0.95 }); play('card');
  await espera(720);
}

/* =========================================================
   DIBUJO
   ========================================================= */
function pintarFx(capa) {
  const c = cx;
  if (capa === 'detras') {
    for (const g of B.fantasmas) { const sp = SPR[g.u.key]; if (!sp) continue; pintarSprite(c, g.u.key, g.x, g.y, g.u.esc, g.u.lado === 'h' ? -1 : 1, { img: siluetaDe(g.u.key, g.col), alfa: 0.45 * (1 - g.v / 0.3) }); }
  }
  for (const o of B.fx) {
    const p = Math.min(1, o.v / o.dur), cap = CAPA_FX[o.t] || 'delante'; if (cap !== capa) continue;
    c.save(); DIBUJO_FX[o.t](c, o, p); c.restore();
  }
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
const CAPA_FX = { oscuro: 'detras', pilar: 'detras', aura: 'detras', grieta: 'detras', anillo: 'detras', corte: 'pantalla', destello: 'pantalla', texto: 'pantalla', barras: 'pantalla', ruleta: 'pantalla' };
const DIBUJO_FX = {
  oscuro(c, o, p) { c.globalAlpha = o.a * Math.min(1, p * 6, (1 - p) * 4); c.fillStyle = '#07020e'; c.fillRect(-20, -20, 580, 1000); },
  destello(c, o, p) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = o.a * (1 - p) * (1 - p); c.fillStyle = o.col; c.fillRect(-20, -20, 580, 1000); },
  rayos(c, o, p) {   // haces de luz que salen del golpe en todas direcciones
    c.globalCompositeOperation = 'lighter'; c.translate(o.x, o.y); c.rotate(o.rot + p * 0.5);
    const L = o.largo * sale(Math.min(1, p * 2.2)), a = (1 - p) * (1 - p);
    for (let i = 0; i < o.n; i++) {
      const ang = i / o.n * TAU, l = L * (0.55 + 0.45 * Math.abs(Math.sin(i * 7.3 + o.rot))), w = o.ancho * (i % 2 ? 0.6 : 1);
      const g = c.createLinearGradient(0, 0, Math.cos(ang) * l, Math.sin(ang) * l); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, o.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = a * 0.9; c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(ang - w) * l, Math.sin(ang - w) * l); c.lineTo(Math.cos(ang + w) * l, Math.sin(ang + w) * l); c.closePath(); c.fill();
    }
    c.globalAlpha = 1; pintaBrillo(c, o.col, 0, 0, o.largo * 0.5, a * 0.8);
  },
  nucleo(c, o, p) {   // destello en estrella: cuatro puntas finas y una franja horizontal larga (como la luz en una lente)
    c.globalCompositeOperation = 'lighter'; c.translate(o.x, o.y); const a = (1 - p) * (1 - p), r = o.r * (0.7 + sale(Math.min(1, p * 3)) * 0.6);
    const punta = (ang, largo, ancho, col) => { c.save(); c.rotate(ang); const g = c.createLinearGradient(-largo, 0, largo, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(-largo, 0); c.quadraticCurveTo(0, -ancho, largo, 0); c.quadraticCurveTo(0, ancho, -largo, 0); c.fill(); c.restore(); };
    c.globalAlpha = a; punta(0, r * 4.2, r * 0.07, o.col); punta(0, r * 2.4, r * 0.035, '#ffffff');
    c.globalAlpha = a * 0.9; punta(Math.PI / 2, r * 1.5, r * 0.06, o.col); punta(Math.PI / 2, r * 1, r * 0.03, '#ffffff');
    c.globalAlpha = a * 0.6; punta(Math.PI / 4 + o.v, r * 0.9, r * 0.04, '#ffffff'); punta(-Math.PI / 4 + o.v, r * 0.9, r * 0.04, '#ffffff');
    c.globalAlpha = a; pintaBrillo(c, '#ffffff', 0, 0, r * 0.22, 1);
  },
  corteLuz(c, o, p) {   // un corte de luz que cruza al enemigo de lado a lado: aparece de golpe y se afina
    c.globalCompositeOperation = 'lighter'; c.translate(o.x, o.y); c.rotate(o.ang); c.lineCap = 'round';
    const L = o.largo * sale(Math.min(1, p * 5)), a = 1 - Math.max(0, (p - 0.2) / 0.8), afina = 1 - p * 0.85;
    for (const [w, col, al] of [[26, o.col, 0.25], [10, o.col, 0.8], [3.5, '#ffffff', 1]]) {
      c.globalAlpha = a * al; c.strokeStyle = col; c.lineWidth = w * afina; c.beginPath(); c.moveTo(-L, 0); c.lineTo(L, 0); c.stroke();
    }
    for (const k of [-1, 1]) { c.globalAlpha = a * 0.5; c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-L * 0.8, k * 9 * (1 + p * 3)); c.lineTo(L * 0.8, k * 9 * (1 + p * 3)); c.stroke(); }
  },
  chispasLuz(c, o, p) {   // chispas alargadas que salen disparadas en la dirección del golpe
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (const s of o.chispas) {
      const d = s.v * sale(p), x = o.x + Math.cos(s.a) * d, y = o.y + Math.sin(s.a) * d + p * p * 60, cola = 18 + s.v * 0.08 * (1 - p);
      c.globalAlpha = (1 - p); c.strokeStyle = s.blanca ? '#ffffff' : o.col; c.lineWidth = s.g * (1 - p * 0.6);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(s.a) * cola, y - Math.sin(s.a) * cola); c.stroke();
    }
  },
  franja(c, o, p) {   // franja de luz horizontal que cruza toda la pantalla un instante
    c.globalCompositeOperation = 'lighter'; const a = (1 - p) * (1 - p) * 0.55, h = 26 * (1 - p * 0.7);
    const g = c.createLinearGradient(0, o.y - h, 0, o.y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, o.col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = a; c.fillStyle = g; c.fillRect(-20, o.y - h, 580, h * 2);
  },
  anillo(c, o, p) {
    c.globalCompositeOperation = 'lighter'; const r = o.r * (0.15 + sale(p) * 0.85);
    for (const [k, a, w] of [[1, 1, o.grosor], [0.75, 0.6, o.grosor * 0.5], [1, 0.25, o.grosor * 3]]) { c.globalAlpha = (1 - p) * a; c.strokeStyle = o.col; c.lineWidth = w * (1 - p * 0.5); c.beginPath(); c.ellipse(o.x, o.y, r * k, r * k * 0.34, 0, 0, TAU); c.stroke(); }
  },
  pilar(c, o, p) {   // columna de luz del cielo al suelo
    c.globalCompositeOperation = 'lighter'; const a = Math.min(1, p * 5) * (1 - p) * 1.4, w = o.ancho * (0.5 + 0.5 * Math.sin(Math.min(1, p * 3) * Math.PI / 2)) * (1 + 0.06 * Math.sin(o.v * 40));
    for (const [k, al] of [[1, 0.35], [0.45, 0.7], [0.15, 1]]) {
      const g = c.createLinearGradient(o.x - w * k, 0, o.x + w * k, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, k < 0.2 ? '#ffffff' : o.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = a * al; c.fillStyle = g; c.fillRect(o.x - w * k, 0, w * 2 * k, o.y);
    }
    c.globalAlpha = a; c.save(); c.translate(o.x, o.y); c.scale(1, 0.32); pintaBrillo(c, o.col, 0, 0, w * 2.2, 1); c.restore();
  },
  aura(c, o, p) {   // llamas de luz que suben alrededor del luchador
    const u = o.u, x = u.x + u.dx, y = u.y + (u.dy || 0), h = alto(u), a = Math.min(1, p * 5, (1 - p) * 3);
    c.globalCompositeOperation = 'lighter'; pintaBrillo(c, o.col, x, y - h * 0.5, h * 0.9, 0.55 * a);
    for (let i = 0; i < 9; i++) {
      const f = (o.v * 1.8 + i / 9) % 1, ax = x + Math.sin(i * 2.4 + o.v * 3) * h * 0.35, ay = y - f * h * 1.2;
      pintaBrillo(c, o.col, ax, ay, 18 * (1 - f) + 6, a * (1 - f) * 0.9);
    }
    c.globalAlpha = a * 0.8; c.strokeStyle = o.col; c.lineWidth = 3;
    for (let k = 0; k < 2; k++) { const f = (o.v * 1.5 + k * 0.5) % 1; c.globalAlpha = a * (1 - f); c.beginPath(); c.ellipse(x, y - f * h * 0.6, 34 + f * 10, 11, 0, 0, TAU); c.stroke(); }
  },
  escudo(c, o, p) {   // cúpula de hexágonos
    const u = o.u, x = u.x + u.dx, y = u.y - alto(u) * 0.45, R = alto(u) * 0.75, a = Math.min(1, p * 5, (1 - p) * 3);
    c.globalCompositeOperation = 'lighter'; pintaBrillo(c, o.col, x, y, R * 1.3, 0.35 * a);
    c.globalAlpha = a * 0.75; c.strokeStyle = o.col; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, R * (0.8 + 0.2 * sale(Math.min(1, p * 3))), 0, TAU); c.stroke();
    c.globalAlpha = a * 0.45;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const hx = x + i * 22 + (j % 2 ? 11 : 0), hy = y + j * 19; if (Math.hypot(hx - x, hy - y) > R * 0.85) continue;
      c.beginPath(); for (let k = 0; k < 6; k++) { const an = k / 6 * TAU + Math.PI / 6; c.lineTo(hx + Math.cos(an) * 10, hy + Math.sin(an) * 10); } c.closePath(); c.stroke();
    }
  },
  rayo(c, o, p) {   // relámpago del cielo, que cambia de forma cada fotograma
    c.globalCompositeOperation = 'lighter'; const a = p < 0.15 ? 1 : (1 - p) * 1.2;
    const pts = [[o.x + rand(-30, 30), 0]], n = 9; for (let i = 1; i < n; i++) pts.push([o.x + rand(-28, 28) * (1 - i / n), o.y * i / n]); pts.push([o.x, o.y]);
    for (const [w, col, al] of [[18, o.col, 0.35], [7, o.col, 0.9], [2.5, '#ffffff', 1]]) { c.globalAlpha = a * al; c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
    pintaBrillo(c, o.col, o.x, o.y, 110, a * 0.8);
  },
  tajo(c, o, p) {   // media luna de luz
    c.globalCompositeOperation = 'lighter'; c.translate(o.x, o.y); c.rotate(o.ang); c.lineCap = 'round';
    const barrido = sale(Math.min(1, p * 2.5)), a = 1 - Math.max(0, (p - 0.35) / 0.65);
    for (const [w, col, al] of [[34, o.col, 0.3], [14, o.col, 0.85], [5, '#ffffff', 1]]) {
      c.globalAlpha = a * al; c.strokeStyle = col; c.lineWidth = w * (1 - p * 0.5);
      c.beginPath(); c.arc(0, 0, o.r, -Math.PI * 0.85, -Math.PI * 0.85 + Math.PI * 1.25 * barrido); c.stroke();
    }
  },
  grieta(c, o, p) {
    c.globalCompositeOperation = 'lighter'; const a = Math.min(1, p * 8) * (1 - p), L = sale(Math.min(1, p * 4));
    c.strokeStyle = o.col; c.lineCap = 'round';
    for (const r of o.ramas) for (const [w, al] of [[7, 0.3], [2.5, 1]]) {
      c.globalAlpha = a * al; c.lineWidth = w; c.beginPath(); c.moveTo(o.x, o.y);
      const mx = o.x + Math.cos(r.a + 0.25) * r.l * 0.5 * L, my = o.y + Math.sin(r.a + 0.25) * r.l * 0.17 * L; c.lineTo(mx, my); c.lineTo(o.x + Math.cos(r.a) * r.l * L, o.y + Math.sin(r.a) * r.l * 0.34 * L); c.stroke();
    }
  },
  texto(c, o, p) {
    const e = p < 0.15 ? 0.4 + p / 0.15 * 0.8 : p < 0.25 ? 1.2 - (p - 0.15) * 2 : 1;
    c.globalAlpha = p > 0.75 ? (1 - p) / 0.25 : 1; c.translate(o.x, o.y); c.scale(e, e); c.rotate(-0.06);
    c.font = o.tam + 'px ' + FONT_D; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = o.tam * 0.24; c.strokeStyle = OL; c.strokeText(o.txt, 0, 0); c.fillStyle = o.col; c.fillText(o.txt, 0, 0);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.35; c.fillText(o.txt, 0, 0);
  },
  velocidad(c, o, p) {
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = o.col; c.lineCap = 'round';
    for (const l of o.lineas) { const x = (l.x + l.v * o.v) % 700 - 80; c.globalAlpha = (1 - p) * 0.6; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, o.y + l.y); c.lineTo(x - l.l, o.y + l.y); c.stroke(); }
  },
  proyectil(c, o, p) {
    const k = o.forma === 'bala' ? p : suaveFx(p), x = lerp(o.x0, o.x1, k), y = lerp(o.y0, o.y1, k) - Math.sin(p * Math.PI) * o.arco;
    const px = lerp(o.x0, o.x1, Math.max(0, k - 0.12)), py = lerp(o.y0, o.y1, Math.max(0, k - 0.12)) - Math.sin(Math.max(0, p - 0.12) * Math.PI) * o.arco;
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = o.col; c.lineCap = 'round';
    c.globalAlpha = 0.7; c.lineWidth = o.forma === 'bala' ? 3 : 10; c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke();
    pintaBrillo(c, o.col, x, y, o.forma === 'bala' ? 16 : 34, 1);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    if (o.forma === 'moneda') { c.fillStyle = '#ffcb3d'; c.beginPath(); c.ellipse(x, y, 9 * Math.abs(Math.cos(o.v * 12)) + 2, 9, 0, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); }
    else dot(c, x, y, o.forma === 'bala' ? 3 : 7, '#ffffff');
  },
  lluvia(c, o, p) {
    const a = Math.min(1, (1 - p) * 4);
    for (const k of o.cosas) {
      if (k.y < -20 || k.y > 980) continue; c.save(); c.globalAlpha = a; c.translate(k.x, k.y); c.rotate(k.r);
      if (o.forma === 'moneda') { c.fillStyle = '#ffcb3d'; c.beginPath(); c.ellipse(0, 0, 9 * Math.abs(Math.cos(k.r)) + 2, 9, 0, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = OL; c.stroke(); }
      else if (o.forma === 'lapida') { c.fillStyle = '#8c8aa0'; c.beginPath(); c.moveTo(-12, 14); c.lineTo(-12, -4); c.arc(0, -4, 12, Math.PI, 0); c.lineTo(12, 14); c.closePath(); c.fill(); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke(); }
      else if (o.forma === 'papel') { c.fillStyle = '#f4ead8'; c.fillRect(-9, -6, 18, 12); c.fillStyle = '#d8323a'; c.fillRect(4, -5, 4, 4); c.lineWidth = 1.5; c.strokeStyle = OL; c.strokeRect(-9, -6, 18, 12); }
      else { c.globalCompositeOperation = 'lighter'; pintaBrillo(c, o.col, 0, 0, 14, 0.9); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#fff'; c.fillRect(-2, -6, 4, 12); c.fillRect(-6, -2, 12, 4); }
      c.restore();
    }
  },
  corte(c, o, p) {   // la franja de la técnica: entra, se queda y sale, con el héroe en grande y el nombre
    const ent = p < 0.25 ? sale(p / 0.25) : p > 0.8 ? 1 - entra((p - 0.8) / 0.2) : 1, y = 330, h = 190;
    c.translate(0, y); c.rotate(-0.12);
    c.globalAlpha = 0.92 * ent; const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#120624'); g.addColorStop(0.5, '#2a0f48'); g.addColorStop(1, '#120624');
    c.fillStyle = g; c.fillRect(-60, -h / 2, 660 * ent, h);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = ent;
    for (let i = 0; i < 16; i++) { const yy = (i * 37 % h) - h / 2, x = (o.v * 1800 + i * 97) % 760 - 100; c.fillStyle = o.col; c.globalAlpha = 0.25 * ent; c.fillRect(x, yy, 120 + (i % 3) * 60, 2); }
    c.globalAlpha = ent; c.fillStyle = o.col; c.fillRect(-60, -h / 2, 660, 4); c.fillRect(-60, h / 2 - 4, 660, 4);
    pintaBrillo(c, o.col, 150, 0, 170, 0.5 * ent);
    c.globalCompositeOperation = 'source-over';
    const sp = SPR[o.key]; if (sp) { c.save(); c.beginPath(); c.rect(-60, -h / 2 + 4, 700, h - 8); c.clip(); const e = 3, dx = lerp(-120, 0, ent) + o.v * 20; pintarSprite(c, o.key, 150 + dx, 205, e, 1); c.restore(); }
    c.globalAlpha = ent; c.font = '46px ' + FONT_D; c.textAlign = 'right'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    const tx = lerp(700, 520, ent); c.lineWidth = 11; c.strokeStyle = OL; c.strokeText(o.nombre, tx, 18); c.fillStyle = '#fff6ea'; c.fillText(o.nombre, tx, 18);
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = ent * 0.5; c.fillStyle = o.col; c.fillText(o.nombre, tx, 18);
  },
  barras(c, o, p) { const k = p < 0.3 ? sale(p / 0.3) : p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1; c.fillStyle = '#000'; c.fillRect(0, 0, 540, 200 * k); c.fillRect(0, 960 - 200 * k, 540, 200 * k); },
  ruleta(c, o, p) {   // la ruleta de MemeLord: gira y frena
    const cols = ['#ff4b5c', '#22e3ff', '#ffcb3d', '#a3e635', '#c08bff', '#ff9a3c'], R = 90, x = 270, y = 300, a = Math.min(1, p * 6, (1 - p) * 6);
    const giro = (1 - Math.pow(1 - Math.min(1, p / 0.8), 3)) * 9 * TAU;
    c.globalAlpha = a; c.translate(x, y);
    c.globalCompositeOperation = 'lighter'; pintaBrillo(c, '#ffcb3d', 0, 0, R * 1.8, 0.4); c.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 6; i++) { c.fillStyle = cols[i]; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, giro + i / 6 * TAU, giro + (i + 1) / 6 * TAU); c.closePath(); c.fill(); c.lineWidth = 4; c.strokeStyle = OL; c.stroke(); }
    dot(c, 0, 0, 16, '#fff6ea'); c.lineWidth = 4; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.stroke();
    c.fillStyle = '#fff6ea'; c.beginPath(); c.moveTo(-14, -R - 22); c.lineTo(14, -R - 22); c.lineTo(0, -R + 6); c.closePath(); c.fill(); c.stroke();
  },
};
