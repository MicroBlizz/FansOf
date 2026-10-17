// Fans of Rouflage · EL DIBUJO DEL PARKING: asfalto (fácil), la rampa de rayas y la zona de aceite (difíciles), el hormigón de las paredes
// con su franja amarilla, los coches aparcados, las columnas numeradas y el EVENTO «faros» (la alarma): un coche con alguien moviéndose a su lado enciende
// los faros de golpe y alumbra un pasillo entero; a quien pilla el haz se le ve como si le dieran con una linterna.
'use strict';

const COCHES = ['#e0484f', '#3a7de0', '#f2c230', '#59e07a', '#f1e6cc', '#8b3dff'];

Object.assign(SUELOS, {
  // asfalto: gris oscuro casi liso, con alguna grieta y rodadas suaves (FÁCIL)
  asfalto(c, z, R) {
    c.fillStyle = '#474a55'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 501);
      if (h < 0.1) { c.fillStyle = '#434650'; c.fillRect(i * 20, j * 20, 20, 20); } else if (h > 0.95) { c.fillStyle = '#4c4f5b'; c.fillRect(i * 20, j * 20, 20, 20); }
      if (h > 0.4 && h < 0.42) raya(c, [i * 20 + 3, j * 20 + 4, i * 20 + 10, j * 20 + 12, i * 20 + 8, j * 20 + 18], '#33363f', 1.5);   // una grieta
    }
  },
  // la rampa: franjas amarillas y negras en diagonal, con el canto de hormigón (DIFÍCIL)
  rampa(c, z, R) {
    peligro(c, z.px, z.py, z.pw, z.ph, 26);
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = z.py; y < z.py + z.ph; y += 40) c.fillRect(z.px, y, z.pw, 20);
    c.fillStyle = '#80848f'; c.fillRect(z.px, z.py, 10, z.ph); c.fillRect(z.px + z.pw - 10, z.py, 10, z.ph);
    c.strokeStyle = OL; c.lineWidth = 2.5; c.beginPath(); c.moveTo(z.px + 10, z.py); c.lineTo(z.px + 10, z.py + z.ph); c.moveTo(z.px + z.pw - 10, z.py); c.lineTo(z.px + z.pw - 10, z.py + z.ph); c.stroke();
  },
  // asfalto con charcos de aceite tornasolados (DIFÍCIL)
  aceite(c, z, R) {
    SUELOS.asfalto(c, z, R);
    for (let k = 0; k < Math.round(z.pw * z.ph / 5500); k++) {
      const x = z.px + 20 + hash2(k, 1, 511) * (z.pw - 40), y = z.py + 16 + hash2(k, 2, 512) * (z.ph - 32), r = 16 + hash2(k, 3, 513) * 22;
      mancha(c, x, y, r, '#1b1a26', k + 40);
      mancha(c, x + 3, y - 2, r * 0.7, 'rgba(120,60,180,0.45)', k + 41); mancha(c, x - 4, y + 3, r * 0.45, 'rgba(40,180,200,0.45)', k + 42); mancha(c, x + 2, y + 1, r * 0.25, 'rgba(240,200,60,0.5)', k + 43);
    }
  },
  // la caseta del vigilante: baldosas blancas pequeñas con alguna rota
  baldosin(c, z, R) {
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) { const h = hash2(i, j, 521); c.fillStyle = h < 0.1 ? '#d6d2c4' : '#ebe7da'; c.fillRect(i * 20, j * 20, 20, 20); }
    c.strokeStyle = '#bdb8a8'; c.lineWidth = 1.5; c.beginPath();
    for (let i = i0; i <= i1; i++) { c.moveTo(i * 20, j0 * 20); c.lineTo(i * 20, j1 * 20); } for (let j = j0; j <= j1; j++) { c.moveTo(i0 * 20, j * 20); c.lineTo(i1 * 20, j * 20); }
    c.stroke();
  },
});

Object.assign(PAPELES, {
  // hormigón del parking: gris con la franja amarilla, tuberías arriba y, de vez en cuando, un número de planta pintado con plantilla
  hormigonP(c, t) {
    c.fillStyle = '#80848f'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = '#767a85'; for (let x = Math.floor(t.x0 / 80) * 80; x < t.x1; x += 80) if (hash2(x, t.y0, 531) > 0.5) c.fillRect(x, t.y0, 40, t.y1 - t.y0);
    c.fillStyle = '#f2c230'; c.fillRect(t.x0, t.y1 - 24, t.x1 - t.x0, 9);
    raya(c, [t.x0, t.y0 + 8, t.x1, t.y0 + 8], OL, 7); raya(c, [t.x0, t.y0 + 8, t.x1, t.y0 + 8], '#9aa0ad', 4);
    for (let x = Math.floor(t.x0 / 240) * 240 + 120; x < t.x1; x += 240) if (x > t.x0 + 30) rotulo(c, 'P-2', x, t.y0 + 30, 16, 'rgba(32,16,44,0.45)');
    c.fillStyle = '#5c606b'; c.fillRect(t.x0, t.y1 - 6, t.x1 - t.x0, 6);
  },
  // la caseta: cristal azulado con marco de aluminio
  cristal(c, t) {
    c.fillStyle = '#9fd6e8'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(t.x0, t.y1); c.lineTo(t.x0 + 30, t.y0); c.lineTo(t.x0 + 50, t.y0); c.lineTo(t.x0 + 20, t.y1); c.closePath(); c.fill();
    c.strokeStyle = '#c8ccd6'; c.lineWidth = 4; c.beginPath(); for (let x = Math.floor(t.x0 / 60) * 60; x <= t.x1; x += 60) { c.moveTo(x, t.y0); c.lineTo(x, t.y1); } c.stroke();
    c.fillStyle = '#6d7380'; c.fillRect(t.x0, t.y1 - 8, t.x1 - t.x0, 8);
  },
});

// el coche visto desde arriba, centrado en (cx, cy) y girado `giro` (0 = mirando hacia arriba); la sombra va aparte, sin girar (sx, sy)
function pintaCoche(c, m, cx, cy, giro, sx, sy) {
  const col = COCHES[(m.v || 0) % COCHES.length];
  forma(c, ovalo(sx, sy, giro % Math.PI ? 27 : 25, giro % Math.PI ? 25 : 27), 'rgba(24,12,40,0.28)', 0);
  c.save(); c.translate(cx, cy); c.rotate(giro);
  for (const sx2 of [-20, 20]) for (const sy2 of [-14, 14]) forma(c, caja(sx2 - 3.5, sy2 - 6, 7, 12, 2), '#20102c', 1.5);      // las ruedas asoman por los lados
  forma(c, caja(-19, -23, 38, 46, 10), col);                                                                                  // la carrocería
  forma(c, caja(-15, -21, 30, 11, 5), tono(col, 0.15), 2);                                                                    // el capó
  forma(c, c2 => { c2.moveTo(-13, -9); c2.lineTo(13, -9); c2.lineTo(11, -2); c2.lineTo(-11, -2); c2.closePath(); }, '#9fd6e8', 2.5);   // el parabrisas
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.moveTo(-9, -8); c.lineTo(-3, -8); c.lineTo(-5, -3); c.lineTo(-10, -3); c.closePath(); c.fill();
  forma(c, caja(-12, -2, 24, 14, 4), tono(col, -0.12), 2.5);                                                                  // el techo
  forma(c, c2 => { c2.moveTo(-11, 12); c2.lineTo(11, 12); c2.lineTo(13, 17); c2.lineTo(-13, 17); c2.closePath(); }, '#9fd6e8', 2.5);     // la luna de atrás
  for (const dx of [-14, 14]) { forma(c, ovalo(dx, -21, 4.5, 2.6), '#fff6ea', 2); forma(c, ovalo(dx, 21, 4.5, 2.6), '#ff4b5c', 2); }         // faros y pilotos
  for (const dx of [-22, 22]) forma(c, ovalo(dx, -4, 3, 4.5), tono(col, -0.12), 2);                                           // los retrovisores
  c.restore();
}

Object.assign(TIPOS_MUEBLE, {
  // un coche aparcado visto desde arriba (como todo el suelo del mapa): ruedas, carrocería, capó, parabrisas, techo y luna trasera.
  // Con `arriba: true` mira hacia arriba (faros arriba); si no, hacia abajo. Ocupa 44 × 46: el hueco de su plaza.
  coche: { w: 44, d: 46, h: 12, pinta(c, m) { pintaCoche(c, m, 0, -23, m.arriba ? 0 : Math.PI, 2, -19); } },
  // el mismo coche aparcado a lo largo de una calle (los de las calles de la urbanización): mira a la izquierda (`izq: true`) o a la derecha. Ocupa 46 × 44.
  cocheH: { w: 46, d: 44, h: 12, pinta(c, m) { pintaCoche(c, m, 0, -22, m.izq ? -Math.PI / 2 : Math.PI / 2, 2, -17); } },
  // una columna de hormigón con su franja y su número
  columna: { w: 28, d: 18, h: 62, pinta(c, m) {
    forma(c, caja(-14, -72, 28, 72, 2), '#8e929d'); c.fillStyle = '#767a85'; c.fillRect(5, -70, 7, 68);
    c.fillStyle = '#f2c230'; c.fillRect(-14, -30, 28, 10); c.strokeStyle = OL; c.lineWidth = 1.5; c.strokeRect(-14, -30, 28, 10);
    rotulo(c, String((m.v || 0) + 1), 0, -50, 15, '#fff6ea', OL);
    forma(c, caja(-16, -80, 32, 10, 2), '#7d818c', 2.5); forma(c, caja(-16, -8, 32, 8, 2), '#5c606b', 2.5);
  } },
  // el parquímetro: un poste con pantalla
  parquimetro: { w: 16, d: 10, h: 40, senuelo: true, pinta(c) {
    raya(c, [0, -2, 0, -24], OL, 7); raya(c, [0, -2, 0, -24], '#6d7380', 4);
    forma(c, caja(-9, -44, 18, 22, 3), '#3a7de0', 2.5); forma(c, caja(-6, -40, 12, 8, 1), '#9fd6e8', 1.5); punto(c, 0, -27, 2, '#f2c230');
  } },
});

Object.assign(PEGATINAS_EXTRA, {
  // las líneas blancas de una plaza (debajo de cada coche)
  plaza(c, x, y) { c.strokeStyle = 'rgba(255,246,234,0.75)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 30, y - 50); c.lineTo(x - 30, y + 2); c.moveTo(x + 30, y - 50); c.lineTo(x + 30, y + 2); c.stroke(); },
  flechaSuelo(c, x, y, s) { c.save(); c.translate(x, y); c.rotate(s % 2 ? Math.PI : 0); c.fillStyle = 'rgba(255,246,234,0.7)'; c.beginPath(); c.moveTo(-7, 24); c.lineTo(7, 24); c.lineTo(7, -6); c.lineTo(18, -6); c.lineTo(0, -28); c.lineTo(-18, -6); c.lineTo(-7, -6); c.closePath(); c.fill(); c.restore(); },
  rodada(c, x, y, s) { c.strokeStyle = 'rgba(20,18,30,0.35)'; c.lineWidth = 5; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(x - 50, y); c.quadraticCurveTo(x, y + (hash2(s, 1, 541) - 0.5) * 30, x + 50, y); c.moveTo(x - 50, y + 14); c.quadraticCurveTo(x, y + 14 + (hash2(s, 1, 541) - 0.5) * 30, x + 50, y + 14); c.stroke(); c.setLineDash([]); },
});

/* ---------- el evento: la alarma de los coches ---------- */
// Un coche con alguien moviéndose a su lado salta como una alarma: enciende los faros de golpe y alumbra el pasillo de delante (a quien pilla el haz se le ve
// como si le dieran con una linterna). Cada coche tiene su propio reloj: dura `dura` segundos y luego se calla `espera` antes de poder saltar otra vez.
const ALARMA = { cerca: 34, dura: 4.5, espera: 10 };
EVENTOS.faros = {
  primero: 0, cada: 0, dura: 1e9,      // vigila durante toda la caza
  nuevo() { return { coches: MUEBLES.filter(m => m.t === 'coche').map(m => ({ m, luz: 0, t: 0, espera: 0 })) }; },
  empieza() {},
  avanza(est, dt) {
    for (const k of est.coches) {
      if (k.luz > 0) { k.t += dt; k.luz -= dt; if (k.luz <= 0) k.espera = ALARMA.espera; continue; }
      if (k.espera > 0) { k.espera -= dt; continue; }
      const p = k.m.pisa, q = J.entes.find(e => !e.fuera && !e.congelado && (e.moviendo || Math.hypot(e.vx, e.vy) > 0.1) && e.x > p.x0 - ALARMA.cerca && e.x < p.x1 + ALARMA.cerca && e.y > p.y0 - ALARMA.cerca && e.y < p.y1 + ALARMA.cerca);
      if (!q) continue;
      k.luz = ALARMA.dura; k.t = 0; play('luces');
      if (J.yo && J.yo.clase === 'camaleon' && Math.hypot(J.yo.x - k.m.x, J.yo.y - k.m.y) < 420) avisa(tr('¡Salta la alarma de un coche!'), 'aviso');
    }
  },
  termina() {},
  focos(est) {
    const out = [];
    for (const k of est.coches) {
      if (k.luz <= 0 || (k.t < 0.5 && Math.floor(k.t * 20) % 2)) continue;      // al saltar parpadean un instante
      const m = k.m;
      out.push({ x: m.x, y: m.arriba ? m.y - 42 : m.y - 4, dir: m.arriba ? -Math.PI / 2 : Math.PI / 2, ang: 0.42, largo: 330, k });
    }
    return out;
  },
  pintaEncima(c, est) {
    for (const f of this.focos(est)) {
      const pts = abanicoFoco(f, []);
      c.fillStyle = 'rgba(255,240,180,0.22)'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath(); c.fill();
      for (const dx of [-14, 14]) punto(c, f.x + dx, f.y, 6, '#fff6ea');
    }
  },
};
