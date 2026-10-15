// Fans of Rouflage · EL DIBUJO DEL PARKING: asfalto (fácil), la rampa de rayas y la zona de aceite (difíciles), el hormigón de las paredes
// con su franja amarilla, los coches aparcados, las columnas numeradas y el EVENTO «faros»: cada poco un coche enciende los faros de golpe
// y alumbra un pasillo entero; a quien pilla el haz se le ve como si le dieran con una linterna.
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

Object.assign(TIPOS_MUEBLE, {
  // un coche aparcado (pequeñito, como de juguete): mirando a la cámara (faros abajo) o de espaldas (faros arriba, `arriba: true`)
  coche: { w: 46, d: 24, h: 24, pinta(c, m) {
    const col = COCHES[(m.v || 0) % COCHES.length], arr = !!m.arriba;
    forma(c, ovalo(0, -2, 24, 7), 'rgba(24,12,40,0.3)', 0);
    forma(c, caja(-23, -26, 46, 24, 8), col);                                   // la carrocería
    forma(c, caja(-16, -44, 32, 22, 7), tono(col, -0.12));                     // el techo
    forma(c, caja(-13, arr ? -24 : -42, 26, 9, 3), '#9fd6e8', 2.5);            // la luna (delante o detrás)
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-11, arr ? -22 : -40, 8, 5);
    forma(c, caja(-14, arr ? -45 : -8, 28, 6, 2), tono(col, 0.15), 2);          // el capó o el maletero
    const fy = arr ? -45 : -9;
    for (const dx of [-18, 18]) forma(c, ovalo(dx, fy + 3, 4, 3), arr ? '#ff4b5c' : '#fff6ea', 2);     // faros (o pilotos)
    for (const dx of [-21, 21]) forma(c, caja(dx - 4, -18, 8, 12, 2), '#20102c', 1.5);   // las ruedas
    c.fillStyle = '#f1e6cc'; c.fillRect(-7, arr ? -52 : -6, 14, 4); c.strokeStyle = OL; c.lineWidth = 1.5; c.strokeRect(-7, arr ? -52 : -6, 14, 4);   // la matrícula
  } },
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

/* ---------- el evento: los faros ---------- */
EVENTOS.faros = {
  primero: 9, cada: 15, dura: 4.5,
  nuevo() { return { coches: MUEBLES.filter(m => m.t === 'coche'), coche: null, ultimo: null }; },
  empieza(est, azar) {
    const lista = est.coches.filter(m => m !== est.ultimo); est.coche = lista[Math.floor(azar() * lista.length)] || est.coches[0]; est.ultimo = est.coche;
    play('luces');
    if (J.yo && J.yo.clase === 'camaleon') avisa(tr('Un coche enciende los faros'), 'aviso');
  },
  avanza() {},
  termina(est) { est.coche = null; },
  focos(est, t) {
    const m = est.coche; if (!m) return [];
    const parp = t < 0.5 && Math.floor(t * 20) % 2;      // al encenderse parpadean un instante
    return parp ? [] : [{ x: m.x, y: m.arriba ? m.y - 46 : m.y - 8, dir: m.arriba ? -Math.PI / 2 : Math.PI / 2, ang: 0.42, largo: 330 }];
  },
  pintaEncima(c, est, t) {
    if (t < 0 || !est.coche) return;
    for (const f of this.focos(est, t)) {
      const pts = abanicoFoco(f, []);
      c.fillStyle = 'rgba(255,240,180,0.22)'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath(); c.fill();
      for (const dx of [-18, 18]) punto(c, f.x + dx, f.y, 5, '#fff6ea');
    }
  },
};
