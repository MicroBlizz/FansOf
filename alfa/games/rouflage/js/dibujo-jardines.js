// Fans of Rouflage · EL DIBUJO DE LOS JARDINES: césped (fácil), caminos de gravilla (fácil-medio), parterres de flores y el estanque
// (difíciles), los setos que hacen de muro, árboles, farolas, bancos, gnomos y el EVENTO «aspersores»: se enciende el que alguien toca
// o pasa muy cerca, se queda encendido mientras haya un infiltrado relativamente cerca (pista) y lava media pintura a quien pilla debajo: toca pintarse otra vez.
'use strict';

const FLORES = ['#ff4b5c', '#f2c230', '#ff7ad8', '#fff6ea', '#8b3dff', '#ff7a1a'];

Object.assign(SUELOS, {
  // césped: verde con alguna mata y calvas de tierra, muy parejo (FÁCIL)
  cesped(c, z, R) {
    c.fillStyle = '#5aa84a'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 701), x = i * 20, y = j * 20;
      if (h < 0.12) { c.fillStyle = '#55a045'; c.fillRect(x, y, 20, 20); } else if (h > 0.95) { c.fillStyle = '#62b351'; c.fillRect(x, y, 20, 20); }
      if (h > 0.5 && h < 0.58) raya(c, [x + 6, y + 14, x + 8, y + 7, x + 10, y + 14, x + 12, y + 6, x + 14, y + 14], '#3f8a35', 1.5);   // una mata
      if (h > 0.2 && h < 0.22) mancha(c, x + 10, y + 10, 7, 'rgba(120,90,40,0.35)', i + j);                                              // una calva
    }
  },
  // gravilla: beige con piedrecitas y el borde de piedra (FÁCIL-MEDIO)
  gravilla(c, z, R) {
    c.fillStyle = '#c9b98a'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 711); if (h < 0.15) { c.fillStyle = '#bfae7e'; c.fillRect(i * 20, j * 20, 20, 20); }
      for (let k = 0; k < 2; k++) punto(c, i * 20 + hash2(i + k, j, 712) * 18, j * 20 + hash2(i, j + k, 713) * 18, 1.6, hash2(i, j, 714 + k) > 0.5 ? '#a8966a' : '#e0d2a8');
    }
    c.strokeStyle = '#8f7f55'; c.lineWidth = 3; c.strokeRect(z.px + 1.5, z.py + 1.5, z.pw - 3, z.ph - 3);
  },
  // parterre de flores: tierra oscura con flores de colores por todas partes (DIFÍCIL)
  flores(c, z, R) {
    c.fillStyle = '#5a3d26'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 721), x = i * 20 + 4 + hash2(i, j, 722) * 12, y = j * 20 + 4 + hash2(i, j, 723) * 12;
      if (h < 0.1) { c.fillStyle = '#4e3420'; c.fillRect(i * 20, j * 20, 20, 20); }
      raya(c, [x, y + 6, x, y + 1], '#3f8a35', 2);
      const col = FLORES[Math.floor(hash2(i, j, 724) * FLORES.length)];
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; punto(c, x + Math.cos(a) * 3.6, y + Math.sin(a) * 3.6, 2.6, col); }
      punto(c, x, y, 2, '#f2c230');
    }
  },
  // el estanque: agua azul verdosa, nenúfares y ondas (DIFÍCIL)
  estanque(c, z, R) {
    c.fillStyle = '#3f8fa6'; c.fillRect(z.px, z.py, z.pw, z.ph);
    const [i0, i1, j0, j1] = rango(z, R, 20);
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) {
      const h = hash2(i, j, 731), x = i * 20 + 10, y = j * 20 + 10;
      if (h < 0.2) { c.fillStyle = '#39869c'; c.fillRect(i * 20, j * 20, 20, 20); }
      if (h > 0.5) { c.strokeStyle = 'rgba(200,240,250,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 6 + h * 5, hash2(i, j, 732) * TAU, hash2(i, j, 732) * TAU + 1.6); c.stroke(); }
      if (h > 0.3 && h < 0.36) { forma(c, g => { g.moveTo(x, y); g.arc(x, y, 8, 0.4, TAU - 0.4); g.closePath(); }, '#4caa52', 2); if (h > 0.34) punto(c, x + 3, y - 5, 2.5, '#ff7ad8'); }   // un nenúfar
    }
    c.strokeStyle = '#8f7f55'; c.lineWidth = 5; c.strokeRect(z.px + 2.5, z.py + 2.5, z.pw - 5, z.ph - 5); forma(c, caja(z.px, z.py, z.pw, z.ph), null, 2.5);
  },
  // la caseta del jardinero: tablas de madera
  tablas(c, z, R) {
    c.fillStyle = '#a87a4e'; c.fillRect(z.px, z.py, z.pw, z.ph);
    for (let y = Math.floor(z.py / 20) * 20; y < z.py + z.ph; y += 20) { c.fillStyle = ((y / 20) & 1) ? '#b0835a' : '#a07046'; c.fillRect(z.px, y, z.pw, 20); raya(c, [z.px, y, z.px + z.pw, y], 'rgba(32,16,44,0.3)', 1.5); }
    for (let x = Math.floor(z.px / 120) * 120; x < z.px + z.pw; x += 120) for (let y = Math.floor(z.py / 20) * 20 + 10; y < z.py + z.ph; y += 20) punto(c, x + 60 + ((y / 20) & 1) * 30, y, 1.6, '#5a3d26');
  },
});

Object.assign(PAPELES, {
  // el seto: hojas verdes a montones, más oscuras abajo, con alguna flor
  seto(c, t) {
    c.fillStyle = '#3f8a35'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let y = Math.floor(t.y0 / 12) * 12; y < t.y1 + 12; y += 12) for (let x = Math.floor(t.x0 / 14) * 14 - 14; x < t.x1 + 14; x += 14) {
      const h = hash2(x, y, 741), k = (y - t.y0) / Math.max(1, t.y1 - t.y0);
      c.fillStyle = h < 0.3 ? '#4f9d3e' : h > 0.85 ? '#67b954' : '#5aa84a'; if (k > 0.75) c.fillStyle = tono(c.fillStyle, -0.18);
      c.beginPath(); c.ellipse(x + ((y / 12) & 1) * 7 + h * 4, y + 6, 8, 6, h * 1.5, 0, TAU); c.fill();
      if (h > 0.96) punto(c, x + 6, y + 4, 2.6, '#ff7ad8');
    }
    c.fillStyle = 'rgba(32,16,44,0.3)'; c.fillRect(t.x0, t.y1 - 5, t.x1 - t.x0, 5);
  },
  // la valla de madera de la caseta
  valla(c, t) {
    c.fillStyle = '#8f6a3a'; c.fillRect(t.x0, t.y0, t.x1 - t.x0, t.y1 - t.y0);
    for (let x = Math.floor(t.x0 / 16) * 16; x < t.x1; x += 16) { c.fillStyle = ((x / 16) & 1) ? '#a87a4e' : '#9a6e44'; c.fillRect(x + 1, t.y0, 14, t.y1 - t.y0); forma(c, poli(x + 1, t.y0 + 6, x + 8, t.y0, x + 15, t.y0 + 6), '#a87a4e', 1.5); }
    raya(c, [t.x0, t.y0 + 18, t.x1, t.y0 + 18], '#6e4f28', 4); raya(c, [t.x0, t.y1 - 14, t.x1, t.y1 - 14], '#6e4f28', 4);
    c.fillStyle = '#5a3d26'; c.fillRect(t.x0, t.y1 - 5, t.x1 - t.x0, 5);
  },
});

Object.assign(TIPOS_MUEBLE, {
  // un árbol: tronco estrecho (se asoma uno por los lados) y copa redonda
  arbol: { w: 22, d: 14, h: 74, pinta(c, m) {
    forma(c, caja(-7, -40, 14, 40, 3), '#8f6a3a'); c.fillStyle = '#6e4f28'; c.fillRect(2, -38, 3, 36);
    const v = m.v || 0, col = ['#4f9d3e', '#5aa84a', '#3f8a35'][v % 3];
    for (const [dx, dy, r] of [[-18, -52, 18], [18, -54, 17], [0, -70, 20], [-10, -64, 14], [12, -66, 14]]) forma(c, ovalo(dx, dy, r, r * 0.85), col, 3);
    forma(c, ovalo(0, -62, 24, 18), tono(col, 0.08), 0); punto(c, -8, -72, 3, '#ff4b5c'); punto(c, 14, -58, 3, '#ff4b5c');
  } },
  // una farola de jardín
  farola: { w: 14, d: 10, h: 60, senuelo: true, pinta(c) {
    forma(c, ovalo(0, -3, 9, 4), '#5c606b', 2.5); raya(c, [0, -4, 0, -52], OL, 7); raya(c, [0, -4, 0, -52], '#3d4063', 4);
    forma(c, poli(-9, -52, 9, -52, 6, -68, -6, -68), '#3d4063', 2.5); forma(c, caja(-6, -66, 12, 12, 2), '#ffe9a8', 2); punto(c, 0, -70, 3, '#3d4063');
  } },
  // un aspersor: un piquete con la cabeza giratoria
  aspersor: { w: 10, d: 8, h: 14, pinta(c) {
    raya(c, [0, -1, 0, -10], OL, 5); raya(c, [0, -1, 0, -10], '#5c606b', 2.5); forma(c, ovalo(0, -12, 5, 3.5), '#59e07a', 2); punto(c, 0, -13, 1.5, OL);
  } },
  // la fuente del estanque: un pilón redondo con el chorro
  fuenteJardin: { w: 60, d: 36, h: 28, pinta(c) {
    forma(c, ovalo(0, -8, 30, 15), '#8f7f55', 3); forma(c, ovalo(0, -10, 24, 11), '#3f8fa6', 2.5);
    forma(c, caja(-5, -40, 10, 30, 2), '#9a9074', 2.5); forma(c, ovalo(0, -40, 12, 5), '#8f7f55', 2.5);
    c.strokeStyle = '#9fd6e8'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -42); c.quadraticCurveTo(-14, -58, -18, -16); c.moveTo(0, -42); c.quadraticCurveTo(14, -58, 18, -16); c.moveTo(0, -42); c.lineTo(0, -56); c.stroke();
    punto(c, 0, -58, 3, '#dff6fb');
  } },
  // un gnomo de jardín (de guiño: lleva el gorro de Microblizz)
  gnomo: { w: 14, d: 10, h: 26, senuelo: true, pinta(c) {
    forma(c, caja(-6, -14, 12, 14, 3), '#3a7de0'); forma(c, ovalo(0, -17, 6, 6), '#f3c9a8', 2); forma(c, ovalo(0, -12, 6, 4), '#f1e6cc', 1.5);
    forma(c, poli(-7, -20, 7, -20, 0, -36), '#ff4b5c', 2); punto(c, -2, -18, 1, OL); punto(c, 2, -18, 1, OL);
  } },
});

Object.assign(PEGATINAS_EXTRA, {
  hojas(c, x, y, s) { for (let k = 0; k < 6; k++) { const a = hash2(k, s, 751) * TAU, d = hash2(k, s, 752) * 22; c.save(); c.translate(x + Math.cos(a) * d, y + Math.sin(a) * d); c.rotate(a); c.fillStyle = k & 1 ? '#c98a3a' : '#a8562e'; c.beginPath(); c.ellipse(0, 0, 5, 2.6, 0, 0, TAU); c.fill(); c.restore(); } },
  topo(c, x, y) { forma(c, ovalo(x, y, 12, 7), '#6e4f28', 2); forma(c, ovalo(x, y - 3, 8, 4), '#8f6a3a', 0); },
});

/* ---------- el evento: los aspersores ---------- */
EVENTOS.aspersores = {
  primero: 0, cada: 0, dura: 1e9, radio: 120, toca: 30, rango: 170,      // vigila durante toda la caza
  nuevo() { return { todos: MUEBLES.filter(m => m.t === 'aspersor').map(m => ({ m, on: false, t: 0, lavados: new Set() })) }; },
  empieza() {},
  // un aspersor se enciende si alguien lo toca o pasa muy cerca; mientras haya un infiltrado relativamente cerca se queda encendido (pista) y cuando se marcha se apaga.
  // El agua corre la pintura a quien esté debajo (una vez por cada vez que se enciende).
  avanza(est, dt) {
    for (const a of est.todos) {
      const m = a.m;
      if (a.on) {
        a.t += dt;
        if (a.t > 1.5 && !infiltradoCerca(m.x, m.y - 10, this.rango)) { a.on = false; a.lavados.clear(); continue; }
        if (a.t < 1.2) continue;      // al segundo y pico de encenderse, el agua llega
        for (const e of J.camaleones) {
          if (a.lavados.has(e) || !eventoLeToca(e) || lejos(m.x, m.y - 10, e.x, e.y - 20) >= this.radio) continue;
          a.lavados.add(e); lavaPiel(e, 0.6); eventoMolesta(e, tr('¡El aspersor te ha lavado la pintura! Vuelve a pintarte'));
          fxSalpica(e.x, e.y - 20, '#9fd6e8', 14);
        }
      } else if (alguienPasa({ x0: m.x, y0: m.y - 10, x1: m.x, y1: m.y - 10 }, this.toca)) {
        a.on = true; a.t = 0; a.lavados.clear(); play('luces');
        if (J.yo && J.yo.clase === 'camaleon' && lejos(J.yo.x, J.yo.y, m.x, m.y) < 420) avisa(tr('Se encienden los aspersores'), 'aviso');
      }
    }
  },
  termina() {},
  pintaEncima(c, est, t0, reloj) {
    for (const a of est.todos) {
      if (!a.on) continue;
      const k = Math.min(1, a.t / 0.6), ox = a.m.x, oy = a.m.y - 12, r = this.radio * k;
      c.fillStyle = 'rgba(120,200,240,0.14)'; c.beginPath(); c.ellipse(ox, oy, r, r * 0.6, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(200,240,255,0.8)'; c.lineWidth = 2.5; c.beginPath();
      for (let n = 0; n < 7; n++) { const ang = reloj * 5 + (n / 7) * TAU; c.moveTo(ox, oy); c.quadraticCurveTo(ox + Math.cos(ang) * r * 0.5, oy - 30 + Math.sin(ang) * r * 0.3, ox + Math.cos(ang) * r, oy + Math.sin(ang) * r * 0.6); }
      c.stroke();
      for (let n = 0; n < 12; n++) { const ang = reloj * 5 + n * 0.52, d = r * (0.3 + ((reloj * 3 + n) % 1) * 0.7); punto(c, ox + Math.cos(ang) * d, oy + Math.sin(ang) * d * 0.6, 2, 'rgba(220,245,255,0.9)'); }
    }
  },
};
