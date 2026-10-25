// Fans of Boom · ESCENARIOS (4 de 4): la LAN Party de la Comunidad Gamer (un polideportivo a oscuras, filas de pantallas, luces RGB y un
// suelo de cajas de pizza) y el Sótano de Microblizz de los Olvidados (bombillas que se balancean, tuberías, cajas y una rata). Solo dibujo.
'use strict';
(() => {
  const { T, caja, bola, poli, raya } = ESC, W = BOOM.mundo.ancho, H = BOOM.mundo.alto;
  const rgb = (t, d, l) => `hsl(${((t * 90 + d) % 360 + 360) % 360},95%,${l || 60}%)`;

  /* ---------------- LA LAN PARTY ---------------- */
  ESCENARIOS.lan = {
    capas: [
      { par: 0.14, pinta(c, w, az) {   // el polideportivo: gradas, la pancarta y filas de mesas con pantallas encendidas
        c.fillStyle = '#2a1c46'; for (let i = 0; i < 6; i++) c.fillRect(0, 300 + i * 34, w, 20);
        for (let x = 140; x < w; x += 700) {
          caja(c, x, 130, 300, 70, 8, '#3a1e5a'); ESC.txt(c, tr('LAN PARTY'), x + 150, 166, 40, '#ffcb3d');
          c.fillStyle = '#2a1a40'; c.fillRect(x + 400, 120, 6, 120); c.strokeStyle = '#ff7a1a'; c.lineWidth = 4; c.beginPath(); c.ellipse(x + 380, 240, 22, 6, 0, 0, T); c.stroke();   // la canasta de baloncesto
        }
        for (let x = 0; x < w; x += 360) {   // guirnaldas de banderines de los clanes
          for (let i = 0; i < 12; i++) { const bx = x + i * 30, by = 250 + Math.sin(i / 11 * Math.PI) * 30; c.fillStyle = ['#ff4b5c', '#2e8bff', '#ffcb3d', '#7dff6a', '#ff4fd8'][(i + x / 360) % 5]; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 24, by + 2); c.lineTo(bx + 12, by + 26); c.fill(); }
        }
        for (let x = 520; x < w; x += 700) { caja(c, x, 330, 120, 74, 6, '#120c20'); c.fillStyle = '#1a3a6a'; c.fillRect(x + 8, 338, 104, 58); ESC.txt(c, 'GG', x + 60, 368, 34, '#7dff6a'); }   // el marcador
        for (let fila = 0; fila < 3; fila++) {
          const y = 560 + fila * 40;
          c.fillStyle = '#2a1e40'; c.fillRect(0, y, w, 10);
          for (let x = 10 + fila * 18; x < w; x += 46) { c.fillStyle = '#120c20'; c.fillRect(x, y - 24, 30, 22); c.fillStyle = az() < 0.5 ? 'rgba(90,180,255,.6)' : 'rgba(180,120,255,.55)'; c.fillRect(x + 3, y - 21, 24, 16); }
        }
      } },
      { par: 0.34, pinta(c, w, az) {   // jugadores de espaldas con cascos, mirando sus pantallas
        c.fillStyle = '#0e0a18'; c.fillRect(0, 640, w, H);
        for (let x = 20; x < w; x += 90 + az() * 60) {
          c.fillStyle = '#5a8aff'; c.globalAlpha = 0.5; c.fillRect(x - 30, 560, 60, 40); c.globalAlpha = 1;
          c.fillStyle = '#0e0a18'; c.fillRect(x - 34, 600, 68, 8);
          c.beginPath(); c.arc(x, 612, 18, 0, T); c.fill(); c.fillRect(x - 24, 626, 48, 30);
          c.strokeStyle = '#0e0a18'; c.lineWidth = 5; c.beginPath(); c.arc(x, 612, 22, Math.PI, 0); c.stroke();
          c.fillStyle = '#ff4fd8'; c.fillRect(x - 26, 608, 6, 10); c.fillRect(x + 20, 608, 6, 10);
        }
      } },
    ],
    vivo(c, V, CAM, t) {   // la tira de luces RGB del techo y un baño de color que va cambiando
      const y = 40 - CAM.y * 0.4;
      for (let x = ((-CAM.x * 0.4) % 24 + 24) % 24 - 24, i = 0; x < V.w + 24; x += 24, i++) {
        c.fillStyle = rgb(t, (x + CAM.x * 0.4) * 0.6); c.beginPath(); c.arc(x, y, 5, 0, T); c.fill();
      }
      c.fillStyle = rgb(t * 0.3, 0, 50); c.globalAlpha = 0.06; c.fillRect(0, 0, V.w, V.h); c.globalAlpha = 1;
    },
    suelo(c, az, sup) {
      ESC.traza(c, sup, 22); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      for (let y = 0, f = 0; y < H; y += 28, f++) for (let x = -((f * 47) % 110); x < W; x += 110) {   // cajas de pizza apiladas
        c.fillStyle = (f + Math.floor(x / 110)) % 3 ? 'rgba(255,220,170,.10)' : 'rgba(40,20,10,.12)'; c.fillRect(x + 2, y + 2, 106, 24);
        c.strokeStyle = 'rgba(60,30,14,.4)'; c.lineWidth = 2; c.strokeRect(x + 2, y + 2, 106, 24);
        if ((x * 3 + y) % 7 < 2) { c.fillStyle = 'rgba(120,60,20,.25)'; c.beginPath(); c.arc(x + 30 + (y % 50), y + 14, 7, 0, T); c.fill(); }   // manchas de grasa
      }
      c.restore();
      ESC.entierra(c, az, sup, 140, 36, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.3) { caja(c, -7, -12, 14, 24, 4, ['#7dff6a', '#4ff0ff', '#ff4fd8'][Math.floor(az() * 3)]); c.fillStyle = OL; c.fillRect(-7, -6, 14, 7); }   // lata de bebida energética
        else if (k < 0.5) { caja(c, -14, -8, 28, 16, 8, '#2a2a3a'); bola(c, -6, -1, 2.5, '#ff4b5c'); bola(c, 7, -1, 2.5, '#2e8bff'); }   // mando
        else if (k < 0.68) { caja(c, -7, -11, 14, 22, 7, '#3a3a4a'); c.fillStyle = rgb(az() * 4, 0); c.fillRect(-1, -9, 2, 6); }   // ratón
        else if (k < 0.85) { caja(c, -6, -6, 12, 12, 2, '#e8e0d0'); c.fillStyle = OL; c.fillRect(-2, -3, 4, 4); }   // tecla
        else { poli(c, [0, -12, 12, 10, -12, 10], '#e8a040'); c.fillStyle = '#ff4b5c'; c.beginPath(); c.arc(0, 2, 2.6, 0, T); c.arc(4, 6, 2, 0, T); c.fill(); }   // trozo de pizza
      });
    },
    capa(c, az, sup, m) {   // la maraña de cables por encima de todo
      ESC.traza(c, sup, 10); c.strokeStyle = m.hierba; c.lineWidth = 20; c.lineCap = 'butt'; c.stroke();
      const cols = ['#ff4b5c', '#2e8bff', '#ffcb3d', '#7dff6a', '#ff4fd8', '#e8e0d0'];
      for (let i = 0; i < 6; i++) {
        c.strokeStyle = cols[i]; c.lineWidth = 3; c.beginPath();
        for (let x = 0; x < W; x += 6) { const y = sup[x] + 6 + i * 2.2 + Math.sin(x * (0.02 + i * 0.007) + i) * 4; (x ? c.lineTo(x, y) : c.moveTo(x, y)); }
        c.stroke();
      }
      ESC.traza(c, sup, 1); c.strokeStyle = '#4a4a5e'; c.lineWidth = 3; c.stroke();
    },
    hueco: [70, 160],
    reparto: ['torre', 'torre', 'monitor', 'monitor', 'silla', 'pizza', 'latas', 'router'],
    props: {
      torre: { r: 24, trozos: ['#20202c', '#ff4fd8', '#4ff0ff'], pinta(c, p, t) {   // la torre del PC con sus ventiladores RGB
        caja(c, -16, -62, 32, 62, 4, '#20202c'); c.fillStyle = '#34344a'; c.fillRect(-12, -58, 18, 54);
        for (const y of [-46, -24]) { c.strokeStyle = rgb(t, y * 3 + p.v * 300); c.lineWidth = 3; c.beginPath(); c.arc(-3, y, 7, 0, T); c.stroke(); c.save(); c.translate(-3, y); c.rotate(t * 12); c.fillStyle = rgb(t, y * 3 + p.v * 300, 75); c.fillRect(-6, -1, 12, 2); c.restore(); }
        c.fillStyle = rgb(t, p.v * 300); c.fillRect(10, -58, 3, 54);
      } },
      monitor: { r: 24, trozos: ['#20202c', '#5ab4ff'], pinta(c, p, t) {   // un monitor con la partida a medias
        c.fillStyle = OL; c.fillRect(-3, -14, 6, 14); caja(c, -14, -4, 28, 4, 2, '#20202c');
        caja(c, -30, -56, 60, 42, 4, '#20202c'); c.fillStyle = '#1a3a6a'; c.fillRect(-26, -52, 52, 34);
        c.fillStyle = '#6fd04a'; c.fillRect(-26, -26, 52, 8); c.fillStyle = Math.sin(t * 6 + p.fase) > 0 ? '#ffcb3d' : '#ff7a1a'; c.beginPath(); c.arc(4 + Math.sin(t + p.fase) * 12, -36, 5, 0, T); c.fill();
        caja(c, -26, -8, 40, 7, 2, '#3a3a4a'); c.fillStyle = rgb(t, p.v * 200); c.fillRect(-24, -6, 36, 2);
      } },
      silla: { r: 20, trozos: ['#20202c', '#ff4b5c'], pinta(c, p, t) {   // silla gamer
        raya(c, [-12, -2, 12, -2], OL, 3); c.fillStyle = OL; c.fillRect(-2, -18, 4, 16);
        caja(c, -14, -24, 28, 7, 3, '#20202c'); caja(c, -14, -64, 12, 42, 5, '#20202c'); c.fillStyle = '#ff4b5c'; c.fillRect(-11, -60, 6, 34);
      } },
      pizza: { r: 16, trozos: ['#c8a06a', '#e8a040'], pinta(c) {   // caja de pizza abierta con lo que queda
        c.save(); c.translate(-18, -8); c.rotate(-1.2); caja(c, 0, -2, 36, 4, 1, '#c8a06a'); c.restore();
        caja(c, -18, -8, 36, 8, 2, '#c8a06a'); poli(c, [-12, -8, 0, -14, 6, -8], '#e8a040'); c.fillStyle = '#ff4b5c'; c.beginPath(); c.arc(-3, -10, 1.8, 0, T); c.fill();
      } },
      latas: { r: 16, trozos: ['#7dff6a', '#4ff0ff'], pinta(c, p) {   // la pirámide de latas
        const cols = ['#7dff6a', '#4ff0ff', '#ff4fd8'];
        for (const [x, y, i] of [[-14, 0, 0], [0, 0, 1], [14, 0, 2], [-7, -22, 1], [7, -22, 0], [0, -44, 2]]) { if (p.v < 0.4 && y < -30) continue; caja(c, x - 6, y - 20, 12, 20, 3, cols[i]); c.fillStyle = OL; c.fillRect(x - 6, y - 14, 12, 5); }
      } },
      router: { r: 12, trozos: ['#20202c', '#7dff6a'], pinta(c, p, t) {
        raya(c, [-8, -12, -12, -30], OL, 3); raya(c, [8, -12, 12, -30], OL, 3);
        caja(c, -16, -12, 32, 12, 3, '#20202c');
        for (let i = 0; i < 4; i++) { c.fillStyle = Math.sin(t * 9 + i * 1.7 + p.fase) > 0 ? '#7dff6a' : '#1a3a1a'; c.fillRect(-11 + i * 6, -8, 3, 3); }
      } },
    },
    amb: { n: 20,   // puntitos de luz de colores en el aire
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : V.h + 10; },
      mueve(p, dt, v, t) { p.x += (v * 2 + Math.sin(t + p.f) * 12) * dt; p.y -= (8 + p.v * 10) * dt; },
      pinta(c, p, t) { c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + p.f); c.fillStyle = rgb(t, p.f * 60); c.beginPath(); c.arc(p.x, p.y, 3 * p.z, 0, T); c.fill(); c.globalAlpha = 1; },
    },
  };

  /* ---------------- EL SÓTANO DE MICROBLIZZ ---------------- */
  ESCENARIOS.sotano = {
    capas: [
      { par: 0.14, pinta(c, w, az) {   // pared de ladrillo con estanterías llenas de cajas
        c.save(); c.beginPath(); c.rect(0, 0, w, H); c.clip(); ESC.filas(c, 0, 26, 54, 27, 'rgba(20,10,10,.35)', 2); c.restore();
        for (let x = 30; x < w; x += 260 + az() * 160) {
          for (let y = 260; y <= 500; y += 80) {
            c.fillStyle = '#3a2a24'; c.fillRect(x, y, 190, 8);
            for (let bx = x + 6; bx < x + 180; bx += 30 + az() * 20) { const bh = 30 + az() * 36; c.fillStyle = az() < 0.5 ? '#6a5040' : '#5a4436'; c.fillRect(bx, y - bh, 26, bh); }
          }
          c.fillStyle = '#3a2a24'; c.fillRect(x, 200, 6, 400); c.fillRect(x + 184, 200, 6, 400);
        }
      } },
      { par: 0.34, pinta(c, w, az) {   // tuberías gordas con válvulas y telarañas
        for (const y of [90, 140]) { c.fillStyle = y === 90 ? '#5a4e4a' : '#6a3a2a'; c.fillRect(0, y, w, 22); c.strokeStyle = OL; c.lineWidth = 3; c.strokeRect(-4, y, w + 8, 22); for (let x = 60; x < w; x += 220) { c.fillStyle = '#4a3e3a'; c.fillRect(x, y - 4, 14, 30); c.strokeRect(x, y - 4, 14, 30); } }
        for (let x = 200; x < w; x += 480 + az() * 300) {
          c.fillStyle = '#5a4e4a'; c.fillRect(x, 160, 24, H); c.strokeRect(x, 160, 24, H);
          c.strokeStyle = '#c0392b'; c.lineWidth = 5; c.beginPath(); c.arc(x + 12, 420, 15, 0, T); c.moveTo(x - 3, 420); c.lineTo(x + 27, 420); c.moveTo(x + 12, 405); c.lineTo(x + 12, 435); c.stroke(); c.strokeStyle = OL; c.lineWidth = 3;   // la llave de paso
          c.strokeStyle = 'rgba(230,230,230,.35)'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(x + 24, 160 + 70); c.lineTo(x + 24 + 70 * Math.cos(i * 0.4 - 1.5), 230 + 70 * Math.sin(i * 0.4 - 1.5) + 70); } c.stroke();
        }
      } },
    ],
    vivo(c, V, CAM, t) {   // bombillas que cuelgan del techo y se balancean
      for (let i = 0; i < 5; i++) {
        const x0 = ((i * 430 + 180 - CAM.x * 0.6) % 2150 + 2150) % 2150 - 300, y0 = -CAM.y * 0.6, a = Math.sin(t * 1.1 + i * 2.3) * 0.18, l = 120 + (i % 3) * 30;
        const x = x0 + Math.sin(a) * l, y = y0 + Math.cos(a) * l;
        c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x, y); c.stroke();
        const g = c.createRadialGradient(x, y, 4, x, y, 220); g.addColorStop(0, 'rgba(255,220,140,.28)'); g.addColorStop(1, 'rgba(255,220,140,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 220, 0, T); c.fill();
        c.lineWidth = 3; bola(c, x, y + 8, 9, Math.sin(t * 13 + i * 4) > 0.95 ? '#c8a860' : '#ffe9a8');
      }
    },
    suelo(c, az, sup) {
      ESC.traza(c, sup, 70); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      ESC.filas(c, 0, 26, 54, 27, 'rgba(30,14,10,.35)', 2.5);   // los cimientos de ladrillo, debajo del hormigón
      c.restore();
      for (let i = 0; i < 26; i++) {   // grietas en el hormigón
        let x = az() * W, y = sup[Math.floor(x)] + 10; if (y >= H) continue;
        c.strokeStyle = 'rgba(30,20,20,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 4; j++) { x += (az() - 0.5) * 30; y += 10 + az() * 14; c.lineTo(x, y); }
        c.stroke();
      }
      ESC.entierra(c, az, sup, 140, 50, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.25) { caja(c, -16, -8, 32, 16, 3, '#9a9aa6'); c.fillStyle = '#2a2a34'; c.fillRect(-12, -4, 12, 3); bola(c, 9, 0, 3, '#ff4b5c'); }   // consola vieja
        else if (k < 0.45) { caja(c, -12, -7, 24, 14, 2, '#20102c'); c.fillStyle = '#e8e0d0'; c.fillRect(-8, -5, 16, 4); }   // cinta de vídeo
        else if (k < 0.62) { caja(c, -10, -12, 20, 24, 3, '#8a8aa0'); c.fillStyle = '#ffcb3d'; c.fillRect(-7, -8, 14, 10); }   // cartucho
        else if (k < 0.8) { bola(c, 0, 0, 10, '#d8d8e0'); bola(c, 0, 0, 3, '#5b5f66'); }   // un disco sin caja
        else { caja(c, -14, -10, 28, 20, 2, '#7a5a40'); raya(c, [-14, -2, 14, -2], '#ffcb3d', 3); }   // caja aplastada
      });
    },
    capa(c, az, sup, m) {   // la losa de hormigón, con charcos y la línea amarilla pintada
      ESC.traza(c, sup, 14); c.strokeStyle = m.hierba; c.lineWidth = 28; c.lineCap = 'butt'; c.stroke();
      ESC.traza(c, sup, 10); c.strokeStyle = 'rgba(255,203,61,.75)'; c.lineWidth = 4; c.setLineDash([26, 18]); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(120,160,200,.45)'; for (let x = 90; x < W; x += 230 + (x * 7) % 90) { const y = sup[x]; if (y < H) { c.beginPath(); c.ellipse(x, y + 3, 26, 3.5, 0, 0, T); c.fill(); } }
      ESC.traza(c, sup, 1); c.strokeStyle = '#b8b6b0'; c.lineWidth = 3; c.stroke();
    },
    hueco: [70, 160],
    reparto: ['cajas', 'cajas', 'cajas', 'arcade', 'rata', 'fregona', 'tuberia', 'salida'],
    props: {
      cajas: { r: 26, fijo: true, trozos: ['#8a6a4a', '#6a5040'], pinta(c, p) {   // cajas apiladas con su etiqueta
        const textos = ['PROTOTIPOS', 'NO ABRIR', '2009', 'IDEAS'];
        caja(c, -26, -32, 34, 32, 2, '#8a6a4a'); caja(c, 6, -26, 24, 26, 2, '#7a5a40');
        if (p.v > 0.3) caja(c, -18, -58, 30, 26, 2, '#9a7a56');
        ESC.txt(c, tr(textos[Math.floor(p.v * textos.length)]), -9, -16, 7, '#ffe9c6');
      } },
      arcade: { r: 28, fijo: true, trozos: ['#5b3d8a', '#20102c'], pinta(c, p, t) {   // una recreativa olvidada que aún se enciende
        poli(c, [-18, 0, -18, -60, -12, -76, 18, -76, 18, 0], '#5b3d8a');
        c.fillStyle = '#20102c'; c.fillRect(-12, -62, 24, 20);
        if (Math.sin(t * 7 + p.fase) > -0.5) { c.fillStyle = '#6fd04a'; c.fillRect(-9, -59, 18, 14); ESC.txt(c, tr('PULSA'), 0, -52, 6, '#20102c'); }
        caja(c, -18, -40, 36, 8, 2, '#3a2a4a'); bola(c, -6, -42, 3, '#ff4b5c'); bola(c, 5, -42, 2.6, '#ffcb3d');
        c.fillStyle = '#ffcb3d'; c.fillRect(-12, -74, 24, 6);
      } },
      rata: { r: 10, trozos: ['#8a8090', '#d98aa0'], pinta(c, p, t) {   // la rata del sótano, que mira y menea la cola
        const m = Math.sin(t * 4 + p.fase);
        c.strokeStyle = '#d98aa0'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-10, -4); c.quadraticCurveTo(-22, -4 + m * 6, -26, -12); c.stroke();
        c.lineWidth = 3; c.strokeStyle = OL; c.fillStyle = '#8a8090'; c.beginPath(); c.ellipse(0, -7, 12, 7, 0, 0, T); c.fill(); c.stroke();
        bola(c, 11, -9, 5, '#8a8090'); bola(c, 6, -15, 3, '#d98aa0');
        if (Math.sin(t * 2.7 + p.fase * 3) > -0.9) { c.fillStyle = '#ff4b5c'; c.fillRect(12, -11, 2.5, 2.5); }
      } },
      fregona: { r: 18, trozos: ['#ffcb3d', '#c7c7d0'], pinta(c) {   // cubo y fregona
        poli(c, [-14, -24, 14, -24, 11, 0, -11, 0], '#ffcb3d'); c.strokeStyle = OL; c.lineWidth = 2; c.beginPath(); c.arc(0, -24, 13, Math.PI, 0); c.stroke();
        c.save(); c.rotate(0.3); raya(c, [4, -22, 4, -78], '#8a5a34', 4); c.restore();
        c.fillStyle = '#c7c7d0'; for (let i = -2; i <= 2; i++) c.fillRect(1 + i * 3, -30, 2.5, 10);
      } },
      tuberia: { r: 20, atras: true, hunde: 10, trozos: ['#6a3a2a', '#5a4e4a'], pinta(c, p, t) {   // tubería que sale del suelo y gotea
        caja(c, -8, -70, 16, 74, 3, '#6a3a2a'); caja(c, -8, -78, 34, 14, 4, '#6a3a2a'); caja(c, -12, -40, 24, 8, 2, '#4a3e3a');
        const k = (t * 0.9 + p.v) % 1; c.fillStyle = '#9ad0ff'; c.beginPath(); c.arc(22, -62 + k * 60, 3, 0, T); c.fill();
      } },
      salida: { r: 16, fijo: true, trozos: ['#3aa84a', '#fff'], pinta(c, p, t) {
        raya(c, [0, 0, 0, -50], OL, 4);
        caja(c, -26, -66, 52, 20, 3, Math.sin(t * 9 + p.fase) > -0.9 ? '#3aa84a' : '#1a4a22'); ESC.txt(c, tr('SALIDA'), 0, -56, 10, '#fff');
      } },
    },
    amb: { n: 22,   // polvo que flota a la luz de las bombillas
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : -10; },
      mueve(p, dt, v, t) { p.x += (v * 2 + Math.sin(t * 0.6 + p.f) * 8) * dt; p.y += (6 + p.v * 8) * dt; },
      pinta(c, p, t) { c.fillStyle = `rgba(255,230,190,${0.2 + 0.3 * Math.max(0, Math.sin(t + p.f))})`; c.fillRect(p.x, p.y, 2.2 * p.z, 2.2 * p.z); },
    },
  };
})();
