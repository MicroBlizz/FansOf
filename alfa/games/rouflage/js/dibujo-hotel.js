// Fans of Rouflage · EL DIBUJO DEL HOTEL: el hotel de cinco estrellas (de cincuenta) de Microblizz. Habitaciones de moqueta lisa (FÁCIL),
// la alfombra roja (FÁCIL), el mármol del vestíbulo (MEDIO), la moqueta de hexágonos de los pasillos y los baños de azulejo pequeño (DIFÍCILES),
// la piscina, camas, maletas, el mostrador de recepción, el piano y el EVENTO «carrito»: cada poco el carrito de la limpieza recorre un
// pasillo entero con su lucecita; a quien pilla en medio lo empuja (y si estaba congelado, le toca volver a pintarse).
'use strict';

Object.assign(SUELOS, {
  // la moqueta de los pasillos: hexágonos naranjas, rojos y marrones encajados (DIFÍCIL)
  moquetaHotel(c, z, R) {
    c.fillStyle = '#6e2a1e'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const T = 40, [i0, i1, j0, j1] = rango(z, R, T);
    for (let j = j0 - 1; j <= j1; j++) for (let i = i0 - 1; i <= i1; i++) {
      const x = i * T + ((j & 1) ? T / 2 : 0), y = j * T;
      // un hexágono grande naranja con uno rojo dentro y un punto marrón: el dibujo se repite y despista
      c.fillStyle = '#d9792a'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17); } c.closePath(); c.fill();
      c.fillStyle = '#b8402a'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; c.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); } c.closePath(); c.fill();
      punto(c, x, y, 3.5, '#4a1e14');
    }
    c.fillStyle = 'rgba(32,16,44,0.12)'; for (let x = Math.ceil(z.px / 200) * 200; x < z.px + z.pw; x += 200) c.fillRect(x, z.py, 3, z.ph);   // las juntas de la moqueta
  },
  // la moqueta de las habitaciones: beige casi lisa, con alguna pelusa (FÁCIL)
  moquetaHab(c, z, R) {
    c.fillStyle = '#d9c7a4'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 901);
      if (h < 0.1) { c.fillStyle = '#d3c09c'; c.fillRect(i * 20, j * 20, 20, 20); } else if (h > 0.96) { c.fillStyle = '#ddccaa'; c.fillRect(i * 20, j * 20, 20, 20); }
    }
  },
  // el mármol del vestíbulo: damero blanco y negro de 80, con vetas (MEDIO)
  marmol(c, z, R) {
    const T = 80, [i0, i1, j0, j1] = rango(z, R, T);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const negro = (i + j) & 1, x = i * T, y = j * T;
      c.fillStyle = negro ? '#2f2a3a' : '#eee8dc'; c.fillRect(x, y, T, T);
      c.strokeStyle = negro ? 'rgba(200,190,220,0.25)' : 'rgba(120,110,130,0.3)'; c.lineWidth = 1.5; c.beginPath();
      for (let k = 0; k < 2; k++) { const a = hash2(i, j, 911 + k); c.moveTo(x + a * T, y); c.quadraticCurveTo(x + T * 0.5 + (a - 0.5) * 40, y + T * 0.5, x + (1 - a) * T, y + T); }
      c.stroke();
    }
    c.strokeStyle = 'rgba(32,16,44,0.3)'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * T, j0 * T); c.lineTo(i * T, j1 * T); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * T, j * T); c.lineTo(i1 * T, j * T); }
    c.stroke();
  },
  // la alfombra roja de la entrada, con su ribete dorado (FÁCIL)
  alfombraRoja(c, z) {
    c.fillStyle = '#c8303a'; c.fillRect(z.px, z.py, z.pw, z.ph);
    c.fillStyle = '#e0b84a'; c.fillRect(z.px + 4, z.py, 4, z.ph); c.fillRect(z.px + z.pw - 8, z.py, 4, z.ph);
    c.fillStyle = 'rgba(32,16,44,0.1)'; for (let y = z.py; y < z.py + z.ph; y += 40) c.fillRect(z.px + 8, y, z.pw - 16, 2);
  },
  // los baños: azulejo celeste de 10 con alguna pieza oscura (DIFÍCIL)
  banoAzulejo(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 10);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) { const h = hash2(i, j, 921); c.fillStyle = h < 0.12 ? '#3a7da6' : h > 0.85 ? '#e3f3ec' : '#9fd6e8'; c.fillRect(i * 10, j * 10, 10, 10); }
    c.strokeStyle = 'rgba(32,16,44,0.25)'; c.lineWidth = 1; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 10, j0 * 10); c.lineTo(i * 10, j1 * 10); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 10, j * 10); c.lineTo(i1 * 10, j * 10); }
    c.stroke();
  },
});

Object.assign(PAPELES, {
  // el papel de los pasillos: burdeos con flores de lis doradas y zócalo de madera
  damasco(c, t) {
    c.fillStyle = '#6a1f2a'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = 'rgba(224,184,74,0.55)';
    for (let y = Math.floor(t.y0 / 20) * 20; y < t.y1 - 8; y += 20) for (let x = Math.floor(t.x0 / 24) * 24; x < t.x1; x += 24) {
      const ox = ((y / 20) & 1) ? 12 : 0, cx = x + ox + 6, cy = y + 8;
      c.beginPath(); c.moveTo(cx, cy - 5); c.quadraticCurveTo(cx + 4, cy, cx, cy + 5); c.quadraticCurveTo(cx - 4, cy, cx, cy - 5); c.fill();
    }
    c.fillStyle = '#5a3d26'; c.fillRect(t.x0, t.y1 - 9, t.x1 - t.x0, 9); c.fillStyle = '#e0b84a'; c.fillRect(t.x0, t.y1 - 10, t.x1 - t.x0, 2);
  },
  // las habitaciones: rayas verde menta suaves, con moldura
  rayasHotel(c, t) {
    for (let x = Math.floor(t.x0 / 16) * 16; x < t.x1; x += 16) { c.fillStyle = ((x / 16) & 1) ? '#cfe6d4' : '#bcdcc4'; c.fillRect(x, t.y0, 16, t.y1 - t.y0); }
    c.fillStyle = '#f1e6cc'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, 5); c.fillStyle = '#8a7d6a'; c.fillRect(t.x0, t.y1 - 7, t.x1 - t.x0, 7);
  },
  // el vestíbulo: paneles de madera noble con molduras doradas
  maderaNoble(c, t) {
    c.fillStyle = '#5a3420'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let x = Math.floor(t.x0 / 60) * 60; x < t.x1; x += 60) { forma(c, caja(x + 6, t.y0 + 4, 48, t.y1 - t.y0 - 14, 2), '#6e4228', 1.5, '#3a2014'); c.strokeStyle = 'rgba(224,184,74,0.6)'; c.lineWidth = 1.2; c.strokeRect(x + 10, t.y0 + 8, 40, t.y1 - t.y0 - 22); }
    c.fillStyle = '#3a2014'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 6);
  },
});

Object.assign(CARTELES_EXTRA, {
  // el número de una habitación: placa dorada pequeña
  numHab(c, k) { forma(c, caja(k.x - 16, k.y - 9, 32, 18, 3), '#e0b84a', 2.5); rotulo(c, String(k.n), k.x, k.y + 1, 11, '#3a2014'); },
  // un cuadro con marco dorado: un paisaje o un retrato del jefe
  cuadro(c, k) {
    const { x, y } = k, v = k.v || 0;
    forma(c, caja(x - 24, y - 17, 48, 34, 1), '#e0b84a', 3);
    c.save(); c.beginPath(); c.rect(x - 19, y - 12, 38, 24); c.clip();
    if (v % 3 === 0) { c.fillStyle = '#9fd6e8'; c.fillRect(x - 19, y - 12, 38, 24); c.fillStyle = '#5aa84a'; c.beginPath(); c.moveTo(x - 19, y + 12); c.lineTo(x - 6, y - 4); c.lineTo(x + 4, y + 4); c.lineTo(x + 12, y - 6); c.lineTo(x + 19, y + 12); c.fill(); punto(c, x + 10, y - 6, 3, '#f2c230'); }
    else if (v % 3 === 1) { c.fillStyle = '#3a2a4a'; c.fillRect(x - 19, y - 12, 38, 24); forma(c, ovalo(x, y + 2, 8, 9), '#f3c9a8', 1.5); forma(c, caja(x - 10, y + 9, 20, 6, 2), '#20102c', 0); punto(c, x - 3, y, 1.2, OL); punto(c, x + 3, y, 1.2, OL); raya(c, [x - 6, y - 7, x + 6, y - 7], '#e0b84a', 3); }
    else { c.fillStyle = '#f1e6cc'; c.fillRect(x - 19, y - 12, 38, 24); for (let k2 = 0; k2 < 4; k2++) forma(c, ovalo(x - 12 + k2 * 8, y + (k2 & 1 ? -3 : 3), 4, 4), FLORES[k2], 1.2); }
    c.restore();
  },
  // la puerta de un ascensor, con la flecha y el piso
  ascensor(c, k) {
    const { x, y } = k;
    forma(c, caja(x - 30, y - 18, 60, 38, 2), '#c8ccd6', 3); raya(c, [x, y - 16, x, y + 18], '#8e929d', 2);
    forma(c, caja(x - 14, y - 30, 28, 11, 2), '#191430', 2); rotulo(c, k.piso || '13', x, y - 24, 8, '#ff4b5c');
  },
});

Object.assign(TIPOS_MUEBLE, {
  // una cama de matrimonio: cabecero, almohadas y la colcha (cada una de un color)
  cama: { w: 74, d: 54, h: 18, pinta(c, m) {
    const col = ['#8b3dff', '#3a7de0', '#c8303a', '#3f8a35', '#e0b84a'][(m.v || 0) % 5];
    forma(c, caja(-37, -78, 74, 22, 4), '#6e4228');                                  // el cabecero
    cajon(c, 74, 52, 16, '#f4f1e6', '#d9d2c0', 4);                                   // el colchón
    forma(c, caja(-33, -66, 30, 12, 5), '#fff6ea', 2); forma(c, caja(3, -66, 30, 12, 5), '#fff6ea', 2);   // las almohadas
    forma(c, caja(-37, -50, 74, 34, 4), col); c.fillStyle = tono(col, 0.18); c.fillRect(-33, -46, 66, 5);  // la colcha
    forma(c, caja(-37, -18, 74, 16, 4), tono(col, -0.15));
  } },
  // la mesilla, con su lamparita
  mesilla: { w: 22, d: 18, h: 18, pinta(c) { cajon(c, 22, 18, 18, '#a87a4e', '#8f6a3a', 2); raya(c, [0, -36, 0, -46], OL, 2); forma(c, poli(-8, -44, 8, -44, 5, -54, -5, -54), '#ffe9a8', 2); } },
  // una maleta olvidada (tiene forma de alubia agachada: buen señuelo)
  maleta: { w: 30, d: 14, h: 26, senuelo: true, pinta(c, m) {
    const col = ['#3a7de0', '#c8303a', '#59e07a'][(m.v || 0) % 3];
    forma(c, caja(-15, -30, 30, 28, 5), col); raya(c, [-15, -16, 15, -16], tono(col, -0.3), 2);
    forma(c, caja(-6, -36, 12, 7, 3), null, 2.5); forma(c, caja(-12, -26, 7, 5, 1), '#f1e6cc', 1.5);
  } },
  // el carro de las maletas del botones: barra dorada y dos maletas encima
  carroMaletas: { w: 46, d: 26, h: 24, pinta(c) {
    forma(c, caja(-23, -12, 46, 8, 2), '#e0b84a', 2.5); for (const dx of [-18, 18]) { raya(c, [dx, -12, dx, -56], OL, 5); raya(c, [dx, -12, dx, -56], '#e0b84a', 3); } raya(c, [-20, -56, 20, -56], '#e0b84a', 4);
    forma(c, caja(-16, -34, 18, 22, 4), '#c8303a', 2.5); forma(c, caja(2, -30, 14, 18, 4), '#3a7de0', 2.5);
    for (const dx of [-18, 18]) punto(c, dx, -2, 3.5, OL);
  } },
  // el mostrador de recepción: tablero de madera clara visto desde arriba, frente con paneles dorados y, encima, timbre, libro, flexo y ordenador
  mostrador: { w: 200, d: 34, h: 30, tope: 78, pinta(c) {
    cajon(c, 200, 34, 30, '#c08a56', '#7a4a2c', 4);                                                         // tablero (y -64..-30) y frente (-30..0)
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-96, -61, 192, 4);                                   // el canto con brillo
    for (let x = -88; x <= 56; x += 36) { forma(c, caja(x, -25, 30, 19, 2), '#6a3e24', 1.5); c.strokeStyle = '#e0b84a'; c.lineWidth = 1.5; c.strokeRect(x + 3, -22, 24, 13); }
    // encima del tablero (todo apoyado entre y -60 y -34)
    forma(c, ovalo(-70, -42, 9, 4), '#b8902e', 2); forma(c, g => { g.moveTo(-77, -43); g.quadraticCurveTo(-70, -55, -63, -43); g.closePath(); }, '#e0b84a', 2); punto(c, -70, -53, 2, '#e0b84a');   // el timbre
    forma(c, caja(-40, -54, 36, 16, 2), '#2c5f8a', 2); forma(c, caja(-38, -52, 15, 12, 1), '#f4f1e6', 1); forma(c, caja(-21, -52, 15, 12, 1), '#f4f1e6', 1);   // el libro de firmas abierto
    raya(c, [-30, -48, -26, -48], 'rgba(32,16,44,0.4)', 1); raya(c, [-14, -46, -9, -46], 'rgba(32,16,44,0.4)', 1);
    raya(c, [26, -40, 26, -62, 36, -70], OL, 2.5); forma(c, poli(32, -74, 44, -70, 40, -62), '#3f8a35', 2); forma(c, ovalo(26, -40, 7, 3), '#3f8a35', 2);   // el flexo verde
    forma(c, caja(56, -44, 30, 8, 2), '#c8ccd6', 2); forma(c, caja(64, -50, 14, 7, 1), '#8e929d', 1.5); forma(c, caja(54, -76, 34, 26, 3), '#2a2f55', 2.5); c.fillStyle = '#9fd6e8'; c.fillRect(58, -72, 26, 18);   // el ordenador
  } },
  // un piano de cola: caja negra con la tapa levantada (se le ve el interior dorado), teclado blanco y negro y tres patas
  piano: { w: 80, d: 50, h: 24, tope: 92, pinta(c) {
    for (const [dx, dy] of [[-32, 0], [30, 0], [24, -40]]) forma(c, caja(dx - 3, dy - 18, 6, 18, 1), '#20102c', 1.5);   // las patas
    const cuerpo = g => { g.moveTo(-40, -24); g.lineTo(-40, -66); g.quadraticCurveTo(-40, -78, -26, -78); g.lineTo(8, -78); g.quadraticCurveTo(40, -78, 40, -54); g.quadraticCurveTo(40, -30, 18, -28); g.lineTo(18, -24); g.closePath(); };
    forma(c, cuerpo, '#2a1f3a', 3);
    c.save(); c.beginPath(); cuerpo(c); c.clip(); c.fillStyle = '#c89a3a'; c.beginPath(); c.moveTo(-34, -30); c.lineTo(-34, -64); c.quadraticCurveTo(-34, -72, -24, -72); c.lineTo(6, -72); c.quadraticCurveTo(32, -72, 32, -54); c.quadraticCurveTo(32, -36, 14, -34); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,60,20,0.8)'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 8; k++) { c.moveTo(-30 + k * 7, -34); c.lineTo(-22 + k * 5, -70); } c.stroke(); c.restore();
    forma(c, poli(-40, -66, 30, -94, 36, -86, -36, -60), '#20102c', 2.5);                                     // la tapa levantada
    raya(c, [-2, -76, 6, -88], OL, 2);                                                                          // el palo de la tapa
    forma(c, caja(-40, -30, 60, 10, 2), '#20102c', 2.5); c.fillStyle = '#fff6ea'; c.fillRect(-37, -28, 54, 6);  // el teclado
    c.fillStyle = OL; for (let x = -34; x < 16; x += 5) if ((((x + 34) / 5) % 7) !== 2 && (((x + 34) / 5) % 7) !== 6) c.fillRect(x + 2.5, -28, 2.5, 3.5);
    forma(c, caja(-20, -40, 24, 9, 1), '#20102c', 1.5);                                                         // el atril
  } },
  // el váter del baño (otro señuelo con forma de alubia sentada)
  vater: { w: 22, d: 20, h: 16, senuelo: true, pinta(c) {
    forma(c, caja(-10, -36, 20, 14, 3), '#f4f1e6'); forma(c, ovalo(0, -14, 11, 9), '#f4f1e6'); forma(c, ovalo(0, -15, 7, 5), '#9fd6e8', 2);
  } },
  // un sillón de terciopelo
  sillon: { w: 36, d: 26, h: 20, pinta(c, m) {
    const col = (m.v || 0) ? '#3f8a35' : '#8b3dff';
    forma(c, caja(-18, -44, 36, 24, 8), tono(col, -0.12)); forma(c, caja(-20, -26, 40, 22, 6), col); forma(c, caja(-22, -30, 9, 26, 4), tono(col, -0.12)); forma(c, caja(13, -30, 9, 26, 4), tono(col, -0.12));
  } },
});

Object.assign(PEGATINAS_EXTRA, {
  toalla(c, x, y, s) { c.save(); c.translate(x, y); c.rotate(hash2(s, 1, 931) - 0.5); forma(c, caja(-14, -9, 28, 18, 3), '#fff6ea', 2); c.fillStyle = '#9fd6e8'; c.fillRect(-14, 3, 28, 3); c.restore(); },
  bombon(c, x, y) { forma(c, caja(x - 5, y - 4, 10, 8, 2), '#5a3420', 1.5); c.fillStyle = '#e0b84a'; c.fillRect(x - 5, y - 1, 10, 2); },
});

/* ---------- el evento: el carrito de la limpieza ---------- */
EVENTOS.carrito = {
  primero: 10, cada: 15, dura: 7,
  nuevo(cfg) { return { carriles: cfg.carriles, y: 0, x0: 0, x1: 0, x: 0, dir: 1, empujados: new Set() }; },
  empieza(est, azar) {
    const [y, x0, x1] = est.carriles[Math.floor(azar() * est.carriles.length)];
    est.y = y; est.dir = azar() < 0.5 ? 1 : -1; est.x0 = est.dir > 0 ? x0 : x1; est.x1 = est.dir > 0 ? x1 : x0; est.x = est.x0; est.empujados.clear();
    play('luces'); if (J.yo) avisa(tr('¡Limpieza! El carrito viene por el pasillo'), 'aviso');
  },
  avanza(est, dt, t) {
    est.x = entre(est.x0, est.x1, Math.min(1, t / this.dura));
    for (const e of J.entes) {
      if (!eventoLeToca(e) || est.empujados.has(e) || Math.abs(e.x - est.x) > 30 || Math.abs(e.y - est.y) > 46) continue;
      est.empujados.add(e);
      // lo aparta hacia el lado del pasillo que tenga sitio
      const lado = e.y < est.y ? -1 : 1;
      for (const d of [lado * 56, -lado * 56, lado * 30]) if (cabe(e.x, e.y + d)) { e.y += d; break; }
      if (e.clase === 'camaleon') eventoMolesta(e, tr('¡El carrito de la limpieza te ha arrollado! Vuelve a pintarte'));
      fxTexto(e.x, e.y - 70, tr('¡Ay!'), '#fff6ea'); play('pop');
    }
  },
  termina() {},
  // su lucecita: un haz cortito por delante
  focos(est) { return [{ x: est.x + est.dir * 20, y: est.y - 10, dir: est.dir > 0 ? 0 : Math.PI, ang: 0.5, largo: 150 }]; },
  pintaEncima(c, est, t) {
    if (t < 0) return;
    const x = est.x, y = est.y, d = est.dir;
    c.save(); c.translate(x, y); c.scale(d, 1);
    forma(c, ovalo(0, 2, 30, 7), 'rgba(24,12,40,0.3)', 0);
    forma(c, caja(-28, -40, 46, 34, 4), '#c8ccd6'); forma(c, caja(-24, -36, 18, 26, 2), '#9fd6e8', 2); forma(c, caja(-2, -36, 16, 26, 2), '#fff6ea', 2);   // el carrito con sus cubos
    raya(c, [-28, -38, -40, -48], OL, 4); forma(c, caja(-26, -54, 10, 14, 2), '#f2c230', 2);                                                            // el asa y el bote amarillo
    for (const dx of [-22, 14]) forma(c, ovalo(dx, -4, 5, 5), '#3d4063', 2);
    forma(c, ovalo(22, -24, 4, 4), '#ffe9a8', 2);                                                                                                       // la lucecita
    c.restore();
  },
};
