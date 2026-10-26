// Fans of Boom · ESCENARIOS (3 de 4): el Olimpo abandonado de los Héroes (islas flotantes con templos, mármol con vetas de oro, columnas
// rotas y ánforas) y el Sector Neón de los Ciberpunks (rascacielos, carteles que parpadean, chapa con circuitos y lluvia). Solo dibujo.
'use strict';
(() => {
  const { T, caja, bola, poli, raya } = ESC, W = BOOM.mundo.ancho, H = BOOM.mundo.alto;
  const nube = (c, x, y, s, col) => { c.fillStyle = col; c.beginPath(); for (const [a, b, r] of [[0, 0, 40], [44, 8, 32], [-42, 10, 30], [20, -22, 30], [-16, -18, 26]]) { c.moveTo(x + a * s + r * s, y + b * s); c.arc(x + a * s, y + b * s, r * s, 0, T); } c.fill(); };

  /* ---------------- OLIMPO ABANDONADO ---------------- */
  ESCENARIOS.olimpo = {
    cielo(c, V, CAM, t) {   // rayos de sol y nubes gordas que pasan despacio
      c.save(); c.translate(V.w * 0.85 - CAM.x * 0.03, -40 - CAM.y * 0.08); c.rotate(t * 0.03);
      c.fillStyle = 'rgba(255,240,170,.16)'; for (let i = 0; i < 10; i++) { c.rotate(T / 10); c.beginPath(); c.moveTo(0, 0); c.lineTo(-60, 900); c.lineTo(60, 900); c.fill(); }
      c.restore();
      for (let i = 0; i < 5; i++) nube(c, ((i * 470 + t * 6 - CAM.x * 0.08) % 2400 + 2400) % 2400 - 200, 90 + (i % 3) * 70 - CAM.y * 0.08, 0.9 + (i % 2) * 0.5, 'rgba(255,255,255,.75)');
    },
    capas: [
      { par: 0.12, pinta(c, w, az) {   // islas flotantes con templos, en la bruma
        for (let x = 80; x < w; x += 260 + az() * 240) {
          const y = 300 + az() * 200, s = 0.7 + az() * 0.6;
          c.fillStyle = '#b8b0d8'; c.beginPath(); c.moveTo(x - 80 * s, y); c.lineTo(x + 80 * s, y); c.lineTo(x + 30 * s, y + 70 * s); c.lineTo(x, y + 110 * s); c.lineTo(x - 36 * s, y + 66 * s); c.fill();
          c.fillStyle = '#e8e4f4'; c.fillRect(x - 50 * s, y - 12 * s, 100 * s, 12 * s); for (let i = 0; i < 5; i++) c.fillRect(x - 44 * s + i * 21 * s, y - 52 * s, 9 * s, 40 * s);
          c.fillStyle = '#e8d08a'; c.beginPath(); c.moveTo(x - 56 * s, y - 52 * s); c.lineTo(x, y - 80 * s); c.lineTo(x + 56 * s, y - 52 * s); c.fill();
          if (az() < 0.5) { c.fillStyle = 'rgba(220,240,255,.6)'; c.fillRect(x + 20 * s, y, 8 * s, 260); }   // una cascada que cae a las nubes
        }
      } },
      { par: 0.32, pinta(c, w, az) {   // el banco de nubes y una estatua gigante rota
        for (let x = 200; x < w; x += 900 + az() * 300) {
          c.fillStyle = '#ece4d4'; c.save(); c.translate(x, 640); c.rotate(-0.15);
          c.fillRect(-30, -260, 60, 260); c.beginPath(); c.arc(0, -300, 46, 0, T); c.fill();   // el brazo con la antorcha
          c.fillRect(-40, -320, 80, 24); c.fillStyle = '#ffcb3d'; c.beginPath(); c.moveTo(-30, -324); c.quadraticCurveTo(0, -400, 30, -324); c.fill(); c.restore();
        }
        for (let x = -40; x < w + 80; x += 70) nube(c, x, 640 + Math.sin(x / 90) * 20, 1.4, '#ffffff');
        c.fillStyle = '#ffffff'; c.fillRect(0, 650, w, H);
      } },
    ],
    suelo(c, az, sup) {
      ESC.traza(c, sup, 30); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      ESC.filas(c, 0, 44, 96, 48, 'rgba(120,100,90,.28)', 2.5);   // bloques de mármol
      c.restore();
      for (let i = 0; i < 40; i++) {   // vetas de oro
        let x = az() * W, y = sup[Math.floor(x)] + 40 + az() * 260; if (y >= H) continue;
        c.strokeStyle = 'rgba(214,170,60,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 5; j++) { x += 14 + az() * 26; y += (az() - 0.5) * 30; c.lineTo(x, y); }
        c.stroke();
      }
      ESC.entierra(c, az, sup, 80, 40, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.3) { poli(c, [-5, -14, 5, -14, 10, -4, 7, 12, -7, 12, -10, -4], '#e0803a'); c.fillStyle = OL; c.fillRect(-8, -2, 16, 3); c.fillRect(-6, 4, 12, 2); }   // ánfora
        else if (k < 0.55) { bola(c, 0, 0, 6, '#ffcb3d'); c.fillStyle = '#e8a92a'; c.fillRect(-2, -3, 4, 6); }   // moneda
        else if (k < 0.75) { bola(c, 0, -2, 9, '#f4f0e6'); c.fillStyle = '#7ac24a'; for (let a = -2.6; a < -0.4; a += 0.45) { c.beginPath(); c.ellipse(Math.cos(a) * 9, -2 + Math.sin(a) * 9, 3, 1.6, a, 0, T); c.fill(); } }   // cabeza de estatua
        else { caja(c, -16, -9, 32, 18, 2, '#f4f0e6'); c.fillStyle = 'rgba(120,100,90,.4)'; for (let x = -12; x < 14; x += 6) c.fillRect(x, -9, 2, 18); }   // tambor de columna caído
      });
    },
    capa(c, az, sup, m) {   // hierba con florecitas y una cenefa griega de oro debajo
      ESC.traza(c, sup, 7); c.strokeStyle = m.hierba; c.lineWidth = 14; c.lineCap = 'butt'; c.stroke();
      c.fillStyle = '#fff'; for (let x = 3; x < W; x += 13) if ((x * 7) % 5 < 2) c.fillRect(x, sup[x] + 3 + (x % 7), 3, 3);
      ESC.traza(c, sup, 21); c.strokeStyle = '#d8a83a'; c.lineWidth = 9; c.stroke();
      c.strokeStyle = '#8a6a1e'; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x < W - 12; x += 12) { const y = sup[x] + 17; if (y >= H) continue; c.moveTo(x, y + 8); c.lineTo(x, y); c.lineTo(x + 8, y); c.lineTo(x + 8, y + 5); c.lineTo(x + 4, y + 5); }
      c.stroke();
      ESC.traza(c, sup, 1); c.strokeStyle = '#c4f08a'; c.lineWidth = 3; c.stroke();
    },
    hueco: [80, 180],
    reparto: ['columna', 'columna', 'columna', 'anfora', 'anfora', 'estatua', 'laurel', 'brasero', 'lira'],
    props: {
      columna: { r: 26, atras: true, hunde: 4, trozos: ['#f4f0e6', '#c8bca8'], pinta(c, p) {   // columna rota, de altura distinta cada una
        const h = 40 + p.v * 90;
        caja(c, -18, -10, 36, 10, 2, '#e8e0d0');
        c.fillStyle = '#f4f0e6'; c.beginPath(); c.moveTo(-14, -10); c.lineTo(-14, -h); c.lineTo(-6, -h - 8); c.lineTo(2, -h + 2); c.lineTo(8, -h - 6); c.lineTo(14, -h); c.lineTo(14, -10); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(120,100,90,.3)'; for (let x = -9; x < 12; x += 6) c.fillRect(x, -h + 4, 2, h - 16);
      } },
      anfora: { r: 16, trozos: ['#e0803a', '#20102c'], pinta(c, p) {
        poli(c, [-6, -40, 6, -40, 8, -34, 14, -22, 10, -4, 6, 0, -6, 0, -10, -4, -14, -22, -8, -34], '#e0803a');
        c.fillStyle = OL; c.fillRect(-12, -24, 24, 4); c.fillRect(-10, -14, 20, 2);
        c.strokeStyle = OL; c.lineWidth = 3; c.beginPath(); c.arc(-12, -30, 5, 1.4, 4.4); c.moveTo(12, -35); c.arc(12, -30, 5, -1.4, 1.6); c.stroke();
      } },
      estatua: { r: 28, atras: true, trozos: ['#f4f0e6', '#c8bca8'], pinta(c, p) {   // héroe de mármol sin cabeza, con su lanza
        caja(c, -20, -14, 40, 14, 2, '#e8e0d0');
        poli(c, [-12, -14, -8, -50, -18, -74, -10, -86, 10, -86, 18, -74, 8, -50, 12, -14], '#f4f0e6');
        raya(c, [22, 0, 22, -110], '#c8bca8', 4); poli(c, [18, -110, 22, -124, 26, -110], '#d8a83a');
        raya(c, [16, -76, 22, -84], OL, 3);
      } },
      laurel: { r: 20, trozos: ['#5a9a3a', '#7ac24a'], pinta(c, p, t) {
        const b = Math.sin(t * 1.3 + p.fase) * 0.1;
        for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.3 + b; c.save(); c.rotate(a); c.fillStyle = i % 2 ? '#5a9a3a' : '#7ac24a'; c.beginPath(); c.ellipse(20, 0, 14, 6, 0, 0, T); c.fill(); c.stroke(); c.restore(); }
      } },
      brasero: { r: 16, trozos: ['#d8a83a', '#ff7a1a'], pinta(c, p, t) {   // brasero de bronce con fuego vivo
        raya(c, [-10, 0, -4, -26], OL, 4); raya(c, [10, 0, 4, -26], OL, 4);
        c.fillStyle = 'rgba(255,170,60,.25)'; c.beginPath(); c.arc(0, -40, 26, 0, T); c.fill();
        for (let i = 0; i < 3; i++) { const f = Math.sin(t * 11 + i * 2 + p.fase) * 3; poli(c, [-12 + i * 8, -30, -6 + i * 8 + f, -52 - (i === 1 ? 10 : 0), 0 + i * 8, -30], i === 1 ? '#ffe96b' : '#ff7a1a', true); }
        caja(c, -16, -32, 32, 8, 3, '#d8a83a');
      } },
      lira: { r: 14, trozos: ['#d8a83a'], pinta(c) {
        c.lineWidth = 4; c.strokeStyle = '#d8a83a'; c.beginPath(); c.moveTo(-12, -40); c.quadraticCurveTo(-16, -10, 0, -4); c.quadraticCurveTo(16, -10, 12, -40); c.stroke();
        raya(c, [-12, -36, 12, -36], '#d8a83a', 4); c.strokeStyle = '#fff'; c.lineWidth = 1; for (const x of [-5, 0, 5]) raya(c, [x, -36, x, -8], '#fff', 1);
        caja(c, -6, -6, 12, 6, 2, '#a07a2a');
      } },
    },
    amb: { n: 20,   // destellos dorados que flotan
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : V.h + 20; },
      mueve(p, dt, v, t) { p.x += (v * 3 + Math.sin(t + p.f) * 10) * dt; p.y -= (10 + p.v * 14) * dt; },
      pinta(c, p, t) { const a = 0.5 + 0.5 * Math.sin(t * 3 + p.f), s = 4 * p.z; c.fillStyle = `rgba(255,220,110,${a})`; c.beginPath(); c.moveTo(p.x, p.y - s); c.lineTo(p.x + s * 0.3, p.y); c.lineTo(p.x, p.y + s); c.lineTo(p.x - s * 0.3, p.y); c.fill(); },
    },
  };

  /* ---------------- SECTOR NEÓN ---------------- */
  const CARTELES = [];   // los carteles de neón de la capa cercana: se apuntan al pintarla y parpadean en vivo
  ESCENARIOS.neon = {
    capas: [
      { par: 0.14, pinta(c, w, az) {   // rascacielos lejanos con ventanas encendidas y luces rojas en las antenas
        for (let x = -10; x < w; x += 40 + az() * 50) {
          const bw = 50 + az() * 70, bh = 260 + az() * 340, y = 660 - bh;
          c.fillStyle = '#231a4a'; c.fillRect(x, y, bw, H - y);
          for (let yy = y + 10; yy < 660; yy += 16) for (let xx = x + 6; xx < x + bw - 6; xx += 10) if (az() < 0.28) { c.fillStyle = az() < 0.5 ? 'rgba(255,90,200,.55)' : 'rgba(90,230,255,.55)'; c.fillRect(xx, yy, 5, 7); }
          if (az() < 0.4) { c.fillStyle = '#231a4a'; c.fillRect(x + bw / 2 - 2, y - 50, 4, 50); c.fillStyle = '#ff4b5c'; c.fillRect(x + bw / 2 - 3, y - 54, 6, 6); }
        }
      } },
      { par: 0.34, pinta(c, w, az, m, mini) {   // edificios cercanos con sus carteles de neón
        if (!mini) CARTELES.length = 0;
        const textos = ['ABIERTO', '24 H', 'FANS OF', 'RAMEN', 'CABLES', 'HOTEL'], cols = ['#ff4fd8', '#4ff0ff', '#ffe14f', '#7dff6a'];
        for (let x = 0; x < w; x += 150 + az() * 140) {
          const bw = 110 + az() * 80, y = 330 + az() * 200;
          c.fillStyle = '#140e2c'; c.fillRect(x, y, bw, H - y); c.strokeStyle = '#2a2050'; c.lineWidth = 3; c.strokeRect(x, y, bw, H - y);
          c.fillStyle = '#2a2050'; for (let yy = y + 20; yy < 700; yy += 40) c.fillRect(x + 10, yy, bw - 20, 4);
          if (az() < 0.75 && !mini) CARTELES.push({ x: x + bw / 2, y: y + 34 + az() * 60, s: tr(textos[Math.floor(az() * textos.length)]), col: cols[Math.floor(az() * cols.length)], f: az() * 9 });
        }
      } },
    ],
    vivo(c, V, CAM, t) {
      for (const k of CARTELES) {
        const x = k.x - CAM.x * 0.34, y = k.y - CAM.y * 0.34; if (x < -120 || x > V.w + 120) continue;
        const on = Math.sin(t * 1.3 + k.f) > -0.7 && !(Math.sin(t * 31 + k.f * 7) > 0.93);   // a veces parpadea
        c.font = '800 22px "Baloo 2", system-ui, sans-serif'; const ww = c.measureText(k.s).width + 22;
        c.fillStyle = '#0c0820'; c.strokeStyle = on ? k.col : '#3a3050'; c.lineWidth = 3; c.beginPath(); rrPath(c, x - ww / 2, y - 18, ww, 36, 8); c.fill(); c.stroke();
        if (on) { c.shadowColor = k.col; c.shadowBlur = 14; }
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = on ? k.col : '#3a3050'; c.fillText(k.s, x, y + 1); c.shadowBlur = 0;
      }
    },
    suelo(c, az, sup) {
      ESC.traza(c, sup, 24); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      ESC.filas(c, 0, 52, 84, 42, 'rgba(10,8,24,.55)', 3);   // planchas de chapa
      c.fillStyle = 'rgba(160,170,200,.25)'; for (let y = 6; y < H; y += 52) for (let x = 6; x < W; x += 42) c.fillRect(x, y, 3, 3);   // remaches
      c.restore();
      for (let i = 0; i < 30; i++) {   // pistas de circuito que brillan
        let x = az() * W, y = sup[Math.floor(x)] + 40 + az() * 260; if (y >= H) continue;
        const col = az() < 0.5 ? '#4ff0ff' : '#ff4fd8'; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 5; j++) { if (j % 2) y += (az() - 0.5) * 60; else x += 30 + az() * 70; c.lineTo(x, y); }
        c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(x, y, 5, 0, T); c.fill();
      }
      ESC.entierra(c, az, sup, 100, 40, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.45) { caja(c, -10, -10, 20, 20, 2, '#20202c'); c.fillStyle = '#c7c7d0'; for (let i = -7; i <= 7; i += 4.6) { c.fillRect(i - 1, -14, 2, 4); c.fillRect(i - 1, 10, 2, 4); } c.fillStyle = '#4ff0ff'; c.fillRect(-3, -3, 6, 6); }   // chip
        else if (k < 0.75) { caja(c, -24, -6, 48, 12, 4, '#5a6074'); caja(c, -6, -9, 12, 18, 2, '#3e4460'); }   // tubería
        else { caja(c, -8, -12, 16, 24, 3, '#2a3a2a'); c.fillStyle = '#7dff6a'; c.fillRect(-5, -8, 10, 4); }   // batería
      });
    },
    capa(c, az, sup, m) {   // pasarela de acero con franjas de peligro y un neón al borde
      ESC.traza(c, sup, 10); c.strokeStyle = m.hierba; c.lineWidth = 20; c.lineCap = 'butt'; c.stroke();
      c.fillStyle = '#ffcb3d'; for (let x = 0; x < W; x += 16) { const y = sup[x]; if (y < H) { c.beginPath(); c.moveTo(x, y + 12); c.lineTo(x + 8, y + 12); c.lineTo(x + 4, y + 20); c.lineTo(x - 4, y + 20); c.fill(); } }
      ESC.traza(c, sup, 1); c.strokeStyle = '#4ff0ff'; c.lineWidth = 4; c.stroke();
    },
    hueco: [70, 170],
    reparto: ['farola', 'farola', 'maquina', 'antena', 'barril', 'barril', 'holo', 'cono'],
    props: {
      farola: { r: 20, trozos: ['#5a6074', '#ff4fd8'], pinta(c, p, t) {
        raya(c, [0, 0, 0, -86], OL, 5); raya(c, [0, -86, 18, -90], OL, 5);
        c.fillStyle = 'rgba(255,79,216,.18)'; c.beginPath(); c.moveTo(14, -88); c.lineTo(48, 0); c.lineTo(-14, 0); c.fill();
        caja(c, 10, -94, 22, 8, 3, '#ff4fd8');
      } },
      maquina: { r: 24, fijo: true, trozos: ['#2e8bff', '#4ff0ff', '#20102c'], pinta(c, p, t) {   // la máquina que solo vende cables
        caja(c, -20, -70, 40, 70, 4, '#2e5bbf'); c.fillStyle = '#9ff4ff'; c.fillRect(-15, -62, 22, 40); c.strokeRect(-15, -62, 22, 40);
        c.strokeStyle = ['#ff4b5c', '#ffcb3d', '#6fd04a'][Math.floor(p.v * 3)]; c.lineWidth = 2; for (let y = -56; y < -24; y += 9) { c.beginPath(); c.moveTo(-12, y); c.quadraticCurveTo(-4, y + 5, 4, y); c.stroke(); }
        caja(c, 10, -60, 6, 22, 2, '#20202c'); caja(c, -14, -16, 28, 8, 2, '#20202c');
        ESC.txt(c, tr('CABLES'), 0, -66, 7, Math.sin(t * 4 + p.fase) > 0 ? '#ffe14f' : '#fff');
      } },
      antena: { r: 22, trozos: ['#c7c7d0', '#5a6074'], pinta(c, p, t) {
        raya(c, [0, 0, 0, -40], OL, 4);
        c.save(); c.translate(0, -44); c.rotate(-0.7 + p.v * 0.4); c.fillStyle = '#c7c7d0'; c.beginPath(); c.arc(0, 0, 20, 0.1, Math.PI - 0.1); c.closePath(); c.fill(); c.stroke(); raya(c, [0, 4, 0, 20], OL, 3); c.restore();
        c.fillStyle = Math.sin(t * 5 + p.fase) > 0 ? '#ff4b5c' : '#5a1a22'; c.beginPath(); c.arc(0, -42, 3, 0, T); c.fill();
      } },
      barril: { r: 16, trozos: ['#3a8a3a', '#7dff6a'], pinta(c, p, t) {   // barril con algo verde que brilla
        caja(c, -14, -36, 28, 36, 4, '#3a6a3a'); c.fillStyle = '#2a4a2a'; c.fillRect(-14, -26, 28, 3); c.fillRect(-14, -12, 28, 3);
        c.fillStyle = `rgba(125,255,106,${0.5 + 0.3 * Math.sin(t * 3 + p.fase)})`; c.beginPath(); c.ellipse(0, -36, 12, 4, 0, 0, T); c.fill();
      } },
      holo: { r: 22, fijo: true, trozos: ['#4ff0ff', '#2a2050'], pinta(c, p, t) {   // holograma que tiembla
        caja(c, -18, -10, 36, 10, 3, '#2a2050');
        if (Math.sin(t * 17 + p.fase) > -0.85) {
          c.save(); c.globalAlpha = 0.55 + 0.2 * Math.sin(t * 6); c.fillStyle = '#4ff0ff'; c.beginPath(); c.moveTo(-14, -10); c.lineTo(14, -10); c.lineTo(28, -84); c.lineTo(-28, -84); c.fill();
          c.globalAlpha = 1; ESC.txt(c, 'M', Math.sin(t * 40) * 1.5, -50, 30, '#e8ffff'); c.restore();
        }
      } },
      cono: { r: 12, trozos: ['#ff7a1a', '#fff'], pinta(c) { poli(c, [-14, 0, 14, 0, 4, -30, -4, -30], '#ff7a1a'); c.fillStyle = '#fff'; c.fillRect(-8, -18, 16, 5); } },
    },
    amb: { n: 60,   // lluvia que se tuerce con el viento
      nace(p, V, primera) { p.x = Math.random() * (V.w + 200) - 100; p.y = primera ? Math.random() * V.h : -40 - Math.random() * 60; },
      mueve(p, dt, v) { p.vx = v * 14; p.x += p.vx * dt; p.y += (620 + p.v * 260) * dt * p.z; },
      pinta(c, p) { c.strokeStyle = 'rgba(160,200,255,.45)'; c.lineWidth = 1.6 * p.z; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - (p.vx || 0) * 0.04, p.y - 18 * p.z); c.stroke(); },
    },
  };
})();
