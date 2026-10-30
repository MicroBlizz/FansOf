// Fans of Karts · MÁS AYUDAS PARA LAS PISTAS (las de los 4 mundos): hielo, corrientes que empujan (olas, agua, escaleras mecánicas,
// cintas), cosas que se mueven cruzando la pista (cangrejos, vagonetas, bichos…) y pinceles para el cielo (palmeras, pinos, edificios).
// Las posiciones van con `u`, como en pista-temas.js.
'use strict';

// hielo: una mancha donde el kart patina (no frena, pero casi no gira)
function hieloEn(P, u, lado, rx, ry, colores, semilla = 1) { manchaEn(P, u, lado, rx, ry, S_HIELO, colores, semilla); }
// una zona de corriente: un rectángulo de `largo` × `ancho` que empuja `lat` unidades/s hacia la derecha de la marcha (negativo:
// izquierda) y `av` hacia delante (negativo: hacia atrás). Se pinta con flechas en la dirección del empujón.
function corrienteEn(P, u, lado, largo, ancho, lat, av, colores) {
  if (INV_P === P) lat = -lat;      // en una pista invertida empuja hacia el mismo lado del mapa (y hacia delante sigue siendo hacia delante)
  const p = enVia(P, P.f(u), lado), c = Math.cos(p.ang), s = Math.sin(p.ang), vx = -s * lat + c * av, vy = c * lat + s * av, v = Math.hypot(vx, vy) || 1;
  const ux = vx / v, uy = vy / v, [A, B, Cn] = C32(...colores);
  sello(P, x => enPunto(x, p, x => { x.fillStyle = '#fff'; x.fillRect(-largo / 2, -ancho / 2, largo, ancho); }), {
    tipo: S_CORRIENTE, en: p, r: Math.max(largo, ancho), solo: t => t === S_PISTA,      // solo en el asfalto: en el margen te dejaría atascado contra el muro
    color: (px, py) => { const dx = px + 0.5 - p.x, dy = py + 0.5 - p.y, a = dx * ux + dy * uy, l = -dx * uy + dy * ux; const r = (((a - Math.abs(l) * 0.8 + 600) / 6) | 0) % 3; return r === 0 ? A : r === 1 ? B : Cn; },
  });
  P.corrientes.push({ x: p.x, y: p.y, r: Math.hypot(largo, ancho) / 2 + 2, vx, vy });
}
// el kart que pisa una corriente se va hacia donde empuja (si no hay muro)
function empujaCorriente(k, P, dt) {
  let mejor = null, d0 = 1e9;
  for (const c of P.corrientes) { const d = (k.x - c.x) ** 2 + (k.y - c.y) ** 2; if (d < d0) { d0 = d; mejor = c; } }
  if (!mejor) return;
  const nx = k.x + mejor.vx * dt, ny = k.y + mejor.vy * dt;
  if (!ES_MURO(supEn(P, nx, ny))) { k.x = nx; k.y = ny; }
}
// algo que cruza la pista de lado a lado una y otra vez (con `amp` unidades a cada lado del centro) y que choca como un adorno
function movilEn(P, lista, id, u, amp, periodo, fase = 0, o = {}) {
  const f = P.f(u), p = enVia(P, f, o.lado || 0), c = { x: p.x, y: p.y, fig: figCosa(id), r: o.r === undefined ? 3.6 : o.r, flota: o.flota || 0, fase: fase * 3, muerde: !!o.muerde,
    mov: { cx: p.x, cy: p.y, nx: -Math.sin(p.ang), ny: Math.cos(p.ang), amp, periodo, fase } };
  lista.push(c);
  (P.moviles || (P.moviles = [])).push(c);
}
function mueveMovil(c, t) {
  const m = c.mov, s = Math.sin((t / m.periodo) * TAU + m.fase);
  c.x = m.cx + m.nx * m.amp * s; c.y = m.cy + m.ny * m.amp * s;
}

// ---------- pinceles para el cielo (siempre rectángulos de píxeles, como el resto) ----------
function palmeraPx(x, a, base, h, tronco, hoja) {
  for (let j = 0; j < h; j++) rectPx(x, a + Math.round(Math.sin(j / h * 1.6) * 3), base - j, 2, 1, tronco);
  const ta = a + Math.round(Math.sin(1.6) * 3), tb = base - h;
  for (const [dx, dy] of [[-7, 2], [-5, 0], [5, 0], [7, 2], [-3, -2], [3, -2]]) { const n = Math.abs(dx); for (let i = 0; i <= n; i++) rectPx(x, ta + Math.sign(dx) * i, tb + dy * i / n + (i * i) / (n * 2), 2, 1, hoja); }
}
function pinoPx(x, a, base, h, col, nieve) {
  rectPx(x, a, base - 3, 2, 3, '#4a3424');
  for (let j = 0; j < h; j++) { const w = Math.round(1 + (j % Math.max(3, h / 3 | 0)) * 0.9 + j * 0.25); rectPx(x, a + 1 - w, base - 3 - h + j, w * 2, 1, nieve && (j % Math.max(3, h / 3 | 0)) === 0 ? nieve : col); }
}
function edificioPx(x, a, base, w, h, col, ventana, az, encendidas = 0.5) {
  rectPx(x, a, base - h, w, h, col);
  for (let j = base - h + 2; j < base - 2; j += 3) for (let i = a + 1; i < a + w - 1; i += 3) if (az() < encendidas) rectPx(x, i, j, 1, 1, ventana);
}

// ---------- colocar en serie ----------
// adornos a ambos lados entre u0 y u1, uno cada `paso` (con algo de azar), a `d0`–`d1` unidades del borde; `ids` se reparten al azar
function adornosPor(P, l, ids, u0, u1, paso, d0, d1, semilla, o) {
  const az = azarDe(semilla * 977 + 3);
  for (let u = u0; u < u1; u += paso * (0.75 + az() * 0.5)) adorno(P, l, ids[(az() * ids.length) | 0], u, (az() < 0.5 ? -1 : 1) * (d0 + az() * (d1 - d0)), o);
}
// filas de monedas: [[u, cuántas, lado], …]
function monedasPor(P, filas) { for (const [u, n, lado, paso, deriva] of filas) monedasEn(P, u, n, lado, paso, deriva); }
// carteles: [[líneas, u, fuera, fondo, tinta], …]
function cartelesPor(P, l, lista) { for (const [t, u, d, f, c] of lista) cartelEn(P, l, t, u, d, f, c); }

// ---------- atajos ----------
// un camino recto de la vía en u1 a la vía en u2 por fuera de la pista. tipo 'atajo': terreno malo (frena sin turbo), se pinta con
// tema.atajo (o con lo de los márgenes); tipo 'puente': estrecho, por encima del vacío, se corre normal (tema.puente).
function atajoEn(P, u1, u2, ancho = 26, tipo = 'atajo') {
  const a = enVia(P, P.f(u1)), b = enVia(P, P.f(u2)), T = P.def.tema, puente = tipo === 'puente';
  const pinta = puente ? (T.puente || (() => u32('#8b5530'))) : (T.atajo || T.lento), dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  const x0 = Math.max(0, Math.floor(Math.min(a.x, b.x) - ancho)), x1 = Math.min(TM - 1, Math.ceil(Math.max(a.x, b.x) + ancho));
  const y0 = Math.max(0, Math.floor(Math.min(a.y, b.y) - ancho)), y1 = Math.min(TM - 1, Math.ceil(Math.max(a.y, b.y) + ancho));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const t = limita(((x + 0.5 - a.x) * dx + (y + 0.5 - a.y) * dy) / (L * L), 0, 1), ex = x + 0.5 - a.x - dx * t, ey = y + 0.5 - a.y - dy * t, d = Math.hypot(ex, ey), k = y * TM + x, s = P.sup[k];
    if (d > ancho / 2 || s === S_PISTA || s === S_TURBO || s === S_RAMPA || s === S_CHARCO || s === S_BARRO || s === S_HIELO || s === S_CORRIENTE) continue;
    if (puente && d > ancho / 2 - 2.2) { P.tex[k] = u32('#4a2a18'); P.sup[k] = S_PUENTE; continue; }     // el canto del puente
    P.sup[k] = puente ? S_PUENTE : S_ATAJO; P.tex[k] = pinta(x, y, d, t * L, 0, null);
  }
  (P.atajos || (P.atajos = [])).push({ a, b, ancho });
}
// un adorno o un cartel no se planta en mitad de un atajo
function estorbaAtajo(P, p) {
  for (const t of P.atajos || []) { const dx = t.b.x - t.a.x, dy = t.b.y - t.a.y, l2 = dx * dx + dy * dy || 1, s = limita(((p.x - t.a.x) * dx + (p.y - t.a.y) * dy) / l2, 0, 1); if (Math.hypot(p.x - t.a.x - dx * s, p.y - t.a.y - dy * s) < t.ancho / 2 + 6) return true; }
  return false;
}

// ---------- lo que cae del cielo ----------
// cada `periodo` segundos cae algo en (u, lado): primero se ve su sombra crecer (aviso) y luego baja; a quien pilla debajo, le da.
// Se queda un momento en el suelo y desaparece.
function caidaEn(P, lista, id, u, lado, periodo, fase = 0, o = {}) {
  const p = enVia(P, P.f(u), lado), c = { x: p.x, y: p.y, fig: figCosa(id), r: 0, cae: { periodo, fase, alto: o.alto || 70, radio: o.radio || 9, tipo: o.tipo || 'trompo', ultima: -1 }, z: 0, ve: false, sombra: 0 };
  lista.push(c);
  (P.caidas || (P.caidas = [])).push(c);
}
function mueveCaida(c, C) {
  const q = c.cae, t = C.reloj / q.periodo + q.fase, ph = t - Math.floor(t), ciclo = Math.floor(t);
  if (ph < 0.14) { c.ve = true; c.z = 0; c.sombra = 0; }
  else if (ph < 0.55) { c.ve = false; c.sombra = 0; }
  else if (ph < 0.8) { c.ve = false; c.sombra = (ph - 0.55) / 0.25; }
  else { c.ve = true; c.sombra = 1; const f = (ph - 0.8) / 0.2; c.z = q.alto * (1 - f * f); }
  // el golpe, justo al llegar al suelo (una vez por ciclo)
  if (ph < 0.14 && q.ultima !== ciclo && C.estado !== 'cuenta') {
    q.ultima = ciclo;
    for (const k of C.karts) if (k.z < 6 && (k.x - c.x) ** 2 + (k.y - c.y) ** 2 < q.radio * q.radio) golpea(k, q.tipo, null);
    if (C.jugador && (C.jugador.x - c.x) ** 2 + (C.jugador.y - c.y) ** 2 < 140 * 140) play('golpe');
    for (let i = 0; i < 6; i++) chispa(c.x, c.y, 1, azar(-40, 40), azar(-40, 40), azar(20, 60), 0.5, PISTA.def.polvo || '#c9c2b0', 2);
  }
}
function pintaCaida(c, sx, sy, e) {
  if (c.sombra > 0 && e > 0.3) pintaSombra(sx, sy, c.fig.def.medio * (0.6 + c.sombra) * e);
  if (c.ve) c.fig.pinta(lx, Math.round(sx), Math.round(sy - c.z * e), e, BASE_COSA, 0);
}

// ---------- lo que vuela al fondo (la MechaVaca, dirigibles…) ----------
// def.voladores = [{ id, s (dónde empieza en la tira del cielo, 0–1024), y (altura en la pantalla), vel (puntos/s), tam }]
function pintaVoladores(P) {
  const V = P.def.voladores; if (!V) return;
  const oB = (CAM.ang / TAU) * CIELO_W;
  for (const v of V) {
    const s = (((v.s + RELOJ * v.vel - oB) % CIELO_W) + CIELO_W) % CIELO_W, x = s > CIELO_W - 60 ? s - CIELO_W : s;
    if (x < -40 || x > PW + 40) continue;
    figCosa(v.id).pinta(lx, Math.round(x * CAL), Math.round((v.y + HZV - HZ + Math.sin(RELOJ * 1.7 + v.s) * 2) * CAL), BASE_COSA * v.tam * CAL, BASE_COSA, v.vel < 0 ? Math.PI * 0.5 : Math.PI * 1.5);
  }
}
