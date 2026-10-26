// Fans of Boom · ESCENARIOS (2 de 4): el Cementerio de juegos de los No-Muertos (luna, niebla, lápidas con forma de cartucho y una mano
// que saluda desde abajo) y el Plató abandonado (focos que barren, telones, tarima de madera y la claqueta). Solo dibujo (escenario.js).
'use strict';
(() => {
  const { T, caja, bola, poli, raya } = ESC, W = BOOM.mundo.ancho, H = BOOM.mundo.alto;
  const ESTRELLAS = Array.from({ length: 70 }, (_, i) => ({ x: (i * 977) % 1400, y: (i * 389) % 420, r: 1 + (i % 3) * 0.6, f: i * 1.7 }));

  /* ---------------- CEMENTERIO DE JUEGOS ---------------- */
  ESCENARIOS.cementerio = {
    cielo(c, V, CAM, t) {   // estrellas que titilan y la luna llena
      for (const s of ESTRELLAS) {
        const x = ((s.x - CAM.x * 0.04) % 1400 + 1400) % 1400 - 200, y = s.y - CAM.y * 0.05;
        c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + s.f); c.fillStyle = '#fff6d8'; c.fillRect(x, y, s.r * 2, s.r * 2);
      }
      c.globalAlpha = 1;
      const x = V.w * 0.26 - CAM.x * 0.03, y = 150 - CAM.y * 0.1;
      c.fillStyle = 'rgba(220,240,255,.12)'; c.beginPath(); c.arc(x, y, 110, 0, T); c.fill();
      c.lineWidth = 4; bola(c, x, y, 62, '#eef2dc');
      c.fillStyle = '#cfd6bc'; for (const [a, b, r] of [[-20, -14, 12], [18, 10, 9], [-6, 26, 7], [24, -24, 6]]) { c.beginPath(); c.arc(x + a, y + b, r, 0, T); c.fill(); }
    },
    capas: [
      { par: 0.15, pinta(c, w, az) {   // la colina con el mausoleo, la capilla y árboles secos
        const y0 = x => 560 + Math.sin(x / 240) * 46 + Math.sin(x / 90) * 12;
        c.fillStyle = '#2c2a56'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= w; x += 20) c.lineTo(x, y0(x)); c.lineTo(w, H); c.fill();
        for (let x = 120; x < w; x += 300 + az() * 260) {
          const y = y0(x), k = az();
          if (k < 0.5) { c.fillRect(x - 40, y - 70, 80, 72); poli(c, [x - 50, y - 70, x, y - 104, x + 50, y - 70], '#2c2a56', true); c.fillStyle = '#ffd45a'; c.fillRect(x - 8, y - 46, 16, 22); c.fillStyle = '#2c2a56'; }   // mausoleo
          else { c.fillRect(x - 26, y - 90, 52, 92); poli(c, [x - 32, y - 90, x, y - 140, x + 32, y - 90], '#2c2a56', true); c.fillRect(x - 3, y - 166, 6, 28); c.fillRect(x - 11, y - 158, 22, 5); c.fillStyle = '#ffd45a'; c.beginPath(); c.arc(x, y - 60, 8, Math.PI, 0); c.fill(); c.fillRect(x - 8, y - 60, 16, 12); c.fillStyle = '#2c2a56'; }   // capilla
        }
        for (let x = 40; x < w; x += 90 + az() * 140) { const y = y0(x); c.strokeStyle = '#2c2a56'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 4, y - 60); c.lineTo(x - 18, y - 84); c.moveTo(x + 3, y - 46); c.lineTo(x + 24, y - 70); c.lineTo(x + 30, y - 66); c.stroke(); }
      } },
      { par: 0.35, pinta(c, w, az) {   // la verja de hierro y árboles retorcidos más cerca
        c.fillStyle = '#1c1838';
        for (let x = 30; x < w; x += 260 + az() * 300) {
          const y = 700; c.save(); c.translate(x, y); c.strokeStyle = '#1c1838'; c.lineCap = 'round';
          c.lineWidth = 16; c.beginPath(); c.moveTo(0, 200); c.quadraticCurveTo(-10, -60, 10, -150); c.stroke();
          c.lineWidth = 8; c.beginPath(); c.moveTo(4, -100); c.quadraticCurveTo(50, -140, 70, -200); c.moveTo(8, -140); c.quadraticCurveTo(-40, -170, -60, -220); c.moveTo(60, -180); c.lineTo(90, -186); c.stroke();
          c.restore();
        }
        c.fillRect(0, 618, w, 7); c.fillRect(0, 660, w, 7);
        for (let x = 0; x < w; x += 24) { c.fillRect(x - 2, 600, 5, 300); poli(c, [x - 6, 602, x + 0.5, 584, x + 7, 602], '#1c1838', true); }
      } },
    ],
    vivo(c, V, CAM, t) {   // la niebla, que se arrastra despacio
      for (let i = 0; i < 6; i++) {
        const x = ((i * 380 + t * (12 + i * 3) - CAM.x * 0.5) % 2300 + 2300) % 2300 - 400, y = 560 + (i % 3) * 50 - CAM.y * 0.6;
        c.fillStyle = 'rgba(200,220,235,.10)'; c.beginPath(); c.ellipse(x, y, 260, 34, 0, 0, T); c.fill();
      }
    },
    suelo(c, az, sup) {
      for (let i = 0; i < 12; i++) {   // fosas antiguas, más oscuras
        const x = 100 + az() * (W - 200), y = sup[Math.floor(x)] + 60 + az() * 100; c.fillStyle = 'rgba(10,4,16,.3)'; c.fillRect(x - 30, y, 60, 110);
      }
      ESC.entierra(c, az, sup, 150, 26, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.3) { caja(c, -12, -14, 24, 28, 3, '#8a8aa0'); c.fillStyle = ['#ff4b5c', '#2e8bff', '#6fd04a', '#ffcb3d'][Math.floor(az() * 4)]; c.fillRect(-8, -10, 16, 12); c.fillStyle = OL; c.fillRect(-9, 8, 18, 3); }   // cartucho
        else if (k < 0.45) { poli(c, [-8, -22, 8, -22, 13, -8, 8, 22, -8, 22, -13, -8], '#6b4a2e'); raya(c, [0, -14, 0, 4], '#3a2416', 3); raya(c, [-6, -8, 6, -8], '#3a2416', 3); }   // ataúd
        else if (k < 0.65) { bola(c, 0, 0, 9, '#f4ecd8'); c.fillStyle = OL; c.fillRect(-5, -2, 4, 4); c.fillRect(2, -2, 4, 4); c.fillRect(-3, 5, 6, 2); }   // calavera
        else if (k < 0.85) { c.fillStyle = '#e8e0c8'; c.fillRect(-10, -2.5, 20, 5); for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 10, -2, 3, 0, T); c.arc(s * 10, 2, 3, 0, T); c.fill(); } }   // hueso
        else { raya(c, [-10, 0, -4, -4, 2, 2, 8, -2], '#d98aa0', 4); }   // un gusano
      });
    },
    capa(c, az, sup, m) {   // hierba oscura y musgo
      ESC.traza(c, sup, 8); c.strokeStyle = m.hierba; c.lineWidth = 16; c.lineCap = 'butt'; c.stroke();
      c.strokeStyle = '#3a6a2a'; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x < W; x += 6) { const y = sup[x]; if (y >= H) continue; c.moveTo(x, y + 15); c.lineTo(x + 2, y + 6 + (x * 13) % 6); }
      c.stroke();
      ESC.traza(c, sup, 1); c.strokeStyle = '#9ad06a'; c.lineWidth = 3; c.stroke();
    },
    hueco: [70, 160],
    reparto: ['lapida', 'lapida', 'lapida', 'cruz', 'cruz', 'arbol', 'vela', 'calabaza', 'mano', 'ataud'],
    props: {
      lapida: { r: 22, atras: true, hunde: 6, fijo: true, trozos: ['#8a8aa0', '#5e5e74'], pinta(c, p) {   // una lápida con forma de cartucho
        c.save(); c.rotate((p.v - 0.5) * 0.25);
        poli(c, [-18, 0, -18, -44, -12, -50, 18, -50, 18, 0], '#8a8aa0');
        c.fillStyle = '#5e5e74'; for (let x = -12; x < 14; x += 5) c.fillRect(x, -50, 2, 6);
        caja(c, -12, -38, 24, 20, 2, '#a0a0b6'); ESC.txt(c, tr(p.v < 0.6 ? 'RIP' : 'FIN'), 0, -28, 10, '#d8e8c0');
        c.restore();
      } },
      cruz: { r: 18, atras: true, hunde: 6, trozos: ['#6b4a2e'], pinta(c, p) { c.save(); c.rotate((p.v - 0.5) * 0.4); caja(c, -3.5, -50, 7, 52, 2, '#7a5636'); caja(c, -14, -40, 28, 7, 2, '#7a5636'); c.restore(); } },
      arbol: { r: 26, atras: true, trozos: ['#3a2a3a', '#5a4458'], pinta(c, p) {   // árbol seco con un cuervo
        c.strokeStyle = '#4a3448'; c.lineCap = 'round'; c.lineWidth = 11; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(6, -40, -2, -90); c.stroke();
        c.lineWidth = 6; c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(26, -76, 34, -104); c.moveTo(-1, -78); c.quadraticCurveTo(-26, -92, -34, -116); c.moveTo(-2, -90); c.lineTo(4, -120); c.stroke();
        if (p.v < 0.5) { c.fillStyle = OL; c.beginPath(); c.ellipse(30, -108, 8, 6, 0, 0, T); c.arc(36, -114, 4, 0, T); c.fill(); c.fillStyle = '#ffcb3d'; c.fillRect(39, -115, 4, 2); }
      } },
      vela: { r: 12, trozos: ['#f4ecd8', '#ffcb3d'], pinta(c, p, t) {
        for (const [x, h] of [[-8, 18], [3, 26], [12, 14]]) {
          caja(c, x - 3, -h, 6, h, 1.5, '#f4ecd8');
          const f = 1 + Math.sin(t * 15 + x + p.fase) * 0.2; c.fillStyle = 'rgba(255,220,120,.25)'; c.beginPath(); c.arc(x, -h - 6, 10, 0, T); c.fill();
          c.fillStyle = '#ffcb3d'; c.beginPath(); c.ellipse(x, -h - 5, 2.6, 4.5 * f, 0, 0, T); c.fill();
        }
      } },
      calabaza: { r: 16, trozos: ['#ff7a1a', '#5aa83a'], pinta(c, p, t) {   // calabaza con la cara encendida
        c.fillStyle = 'rgba(255,170,60,.22)'; c.beginPath(); c.arc(0, -14, 30, 0, T); c.fill();
        for (const x of [-8, 8]) { c.fillStyle = '#e8681a'; c.beginPath(); c.ellipse(x, -14, 10, 14, 0, 0, T); c.fill(); c.stroke(); }
        c.fillStyle = '#ff8a2a'; c.beginPath(); c.ellipse(0, -14, 11, 15, 0, 0, T); c.fill(); c.stroke();
        caja(c, -2, -34, 5, 7, 1.5, '#5aa83a');
        c.fillStyle = Math.sin(t * 9 + p.fase) > -0.6 ? '#ffe96b' : '#ffb347';
        poli(c, [-9, -19, -3, -19, -6, -24], c.fillStyle, true); poli(c, [3, -19, 9, -19, 6, -24], c.fillStyle, true); poli(c, [-8, -10, 8, -10, 5, -5, 0, -8, -5, -5], c.fillStyle, true);
      } },
      mano: { r: 14, trozos: ['#8ac06a', '#5a8a3e'], pinta(c, p, t) {   // la mano de un no-muerto que saluda desde la tierra
        const a = Math.sin(t * 2.4 + p.fase) * 0.35;
        c.save(); c.rotate(a); caja(c, -5, -30, 10, 30, 3, '#8ac06a');
        for (let i = 0; i < 4; i++) caja(c, -6 + i * 3.6, -42 + Math.abs(i - 1.5) * 2, 3.4, 13, 1.5, '#8ac06a');
        caja(c, 4, -30, 9, 3.4, 1.5, '#8ac06a'); c.restore();
        c.fillStyle = '#3a2a3a'; c.beginPath(); c.ellipse(0, 0, 14, 4, 0, 0, T); c.fill();
      } },
      ataud: { r: 22, atras: true, hunde: 14, trozos: ['#6b4a2e', '#3a2416'], pinta(c, p) {
        c.save(); c.rotate(-0.5 + p.v * 0.3); poli(c, [-12, -60, 12, -60, 18, -36, 12, 0, -12, 0, -18, -36], '#6b4a2e');
        raya(c, [0, -50, 0, -18], '#c7a46a', 4); raya(c, [-8, -40, 8, -40], '#c7a46a', 4); c.restore();
      } },
    },
    amb: { n: 10,   // luciérnagas verdes
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : V.h + 20; },
      mueve(p, dt, v, t) { p.x += (v * 2 + Math.sin(t + p.f) * 18) * dt; p.y += (Math.cos(t * 0.8 + p.f) * 14 - 8) * dt; },
      pinta(c, p, t) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.5 + p.f)); c.fillStyle = `rgba(190,255,120,${a * 0.16})`; c.beginPath(); c.arc(p.x, p.y, 6 * p.z, 0, T); c.fill(); c.fillStyle = `rgba(220,255,160,${a})`; c.beginPath(); c.arc(p.x, p.y, 2 * p.z, 0, T); c.fill(); },
    },
  };

  /* ---------------- PLATÓ ABANDONADO ---------------- */
  ESCENARIOS.plato = {
    capas: [
      { par: 0.15, pinta(c, w, az) {   // el decorado del fondo (una ciudad de cartón desteñida) y la estructura de los focos
        for (let x = 0; x < w; x += 70 + az() * 50) {
          const bw = 60 + az() * 70, bh = 120 + az() * 220, y = 600 - bh;
          c.fillStyle = ['#5a3a5e', '#4a3a62', '#6a3e52'][Math.floor(az() * 3)]; c.fillRect(x, y, bw, H - y);
          c.fillStyle = 'rgba(255,220,160,.18)'; for (let yy = y + 14; yy < 600; yy += 26) for (let xx = x + 10; xx < x + bw - 12; xx += 20) c.fillRect(xx, yy, 9, 12);
          c.strokeStyle = 'rgba(30,16,30,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 6, y + 10); c.lineTo(x + bw - 6, y + bh); c.stroke();   // los listones de detrás
        }
        c.fillStyle = '#2a1a2e'; c.fillRect(0, 50, w, 12); for (let x = 0; x < w; x += 30) { c.save(); c.translate(x, 50); c.rotate(0.8); c.fillRect(0, 0, 3, 18); c.restore(); }
        c.fillRect(0, 74, w, 6);
        for (let x = 60; x < w; x += 160) { c.fillRect(x - 2, 80, 4, 20); caja(c, x - 12, 98, 24, 20, 4, '#3a2a3e'); }
      } },
      { par: 0.35, pinta(c, w, az) {   // telones rojos y cajas de material
        for (let x = 0; x < w; x += 560 + az() * 200) {
          const ancho = 140 + az() * 60;
          for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#7a1e2e' : '#9a2a3a'; c.fillRect(x + i * ancho / 6, 0, ancho / 6 + 1, 560 + Math.sin(i * 2) * 20); }
          c.fillStyle = '#c79a4a'; c.fillRect(x - 4, 0, ancho + 8, 26);
          caja(c, x + ancho + 60, 560, 90, 60, 6, '#2a2a34'); c.fillStyle = '#c7c7d0'; c.fillRect(x + ancho + 66, 566, 8, 8); c.fillRect(x + ancho + 136, 566, 8, 8);
        }
      } },
    ],
    vivo(c, V, CAM, t) {   // los focos de arriba barriendo el plató
      c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const x = ((i * 520 + 220 - CAM.x * 0.6) % 2080 + 2080) % 2080 - 300, y = 70 - CAM.y * 0.6, a = Math.sin(t * 0.5 + i * 1.9) * 0.45;
        c.save(); c.translate(x, y); c.rotate(a);
        const g = c.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, 'rgba(255,240,190,.20)'); g.addColorStop(1, 'rgba(255,240,190,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(150, 700); c.lineTo(-150, 700); c.fill(); c.restore();
      }
      c.restore();
    },
    suelo(c, az, sup) {
      ESC.traza(c, sup, 26); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      ESC.filas(c, 0, 60, 120, 60, 'rgba(30,20,30,.25)', 3);   // bloques de hormigón bajo la tarima
      c.restore();
      ESC.entierra(c, az, sup, 130, 40, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.25) { bola(c, 0, 0, 14, '#5b5f66'); c.fillStyle = '#2a2a34'; for (let i = 0; i < 5; i++) { const a = i / 5 * T; c.beginPath(); c.arc(Math.cos(a) * 8, Math.sin(a) * 8, 3, 0, T); c.fill(); } }   // bobina de película
        else if (k < 0.45) { caja(c, -12, -6, 24, 16, 2, '#2a2a34'); c.save(); c.translate(-12, -6); c.rotate(-0.4); caja(c, 0, -5, 24, 5, 1, '#fff'); c.restore(); }   // claqueta
        else if (k < 0.62) { poli(c, [-9, -10, 9, -10, 6, 10, -6, 10], '#ff4b5c'); c.fillStyle = '#fff'; c.fillRect(-2, -10, 4, 20); c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(-4, -11, 4, 0, T); c.arc(3, -12, 4, 0, T); c.fill(); }   // palomitas
        else if (k < 0.8) { caja(c, -12, -7, 24, 14, 2, '#20102c'); c.fillStyle = '#5b5f66'; c.beginPath(); c.arc(-5, 0, 3, 0, T); c.arc(5, 0, 3, 0, T); c.fill(); }   // cinta de vídeo
        else { caja(c, -13, -8, 26, 16, 6, '#b09a6a'); }   // saco de arena
      });
    },
    capa(c, az, sup, m) {   // la tarima: tablones con juntas, clavos y marcas de cinta
      ESC.traza(c, sup, 11); c.strokeStyle = m.hierba; c.lineWidth = 22; c.lineCap = 'butt'; c.stroke();
      ESC.traza(c, sup, 11); c.strokeStyle = 'rgba(80,40,20,.35)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#5a3418'; for (let x = 0; x < W; x += 64) { const y = sup[x]; if (y < H) { c.fillRect(x, y, 2.5, 22); c.fillRect(x + 6, y + 5, 2, 2); c.fillRect(x + 6, y + 16, 2, 2); } }
      c.fillStyle = '#ffcb3d'; for (let x = 140; x < W; x += 330) { const y = sup[x]; if (y < H) { c.save(); c.translate(x, y + 9); c.rotate(0.7); c.fillRect(-8, -2, 16, 4); c.rotate(-1.4); c.fillRect(-8, -2, 16, 4); c.restore(); } }
      ESC.traza(c, sup, 1); c.strokeStyle = '#e8a46a'; c.lineWidth = 3; c.stroke();
    },
    hueco: [80, 190],
    reparto: ['foco', 'foco', 'silla', 'claqueta', 'camara', 'carton', 'jirafa', 'luz'],
    props: {
      foco: { r: 22, trozos: ['#2a2a34', '#ffe96b'], pinta(c, p, t) {   // foco en su trípode
        raya(c, [0, -40, -14, 0], OL, 3); raya(c, [0, -40, 14, 0], OL, 3); raya(c, [0, -40, 0, -4], OL, 3);
        c.save(); c.translate(0, -46); c.rotate(-0.5 + p.v * 0.3); caja(c, -12, -10, 26, 20, 4, '#2a2a34'); c.fillStyle = '#ffe96b'; c.beginPath(); c.ellipse(14, 0, 3, 8, 0, 0, T); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,240,170,.18)'; c.beginPath(); c.moveTo(14, -8); c.lineTo(90, -30); c.lineTo(90, 30); c.lineTo(14, 8); c.fill(); c.restore();
      } },
      silla: { r: 18, fijo: true, trozos: ['#8a5a34', '#2a2a34'], pinta(c) {   // la silla del director
        raya(c, [-12, 0, 12, -24], '#8a5a34', 4); raya(c, [12, 0, -12, -24], '#8a5a34', 4);
        caja(c, -14, -28, 28, 5, 2, '#2a2a34'); caja(c, -14, -52, 28, 14, 2, '#2a2a34'); raya(c, [-14, -28, -14, -54], '#8a5a34', 4); raya(c, [14, -28, 14, -54], '#8a5a34', 4);
        ESC.txt(c, tr('DIRECCIÓN'), 0, -45, 7, '#ffe9c6');
      } },
      claqueta: { r: 18, trozos: ['#2a2a34', '#fff'], pinta(c, p, t) {
        const a = Math.max(0, Math.sin(t * 1.3 + p.fase)) * 0.5;
        caja(c, -18, -26, 36, 26, 2, '#2a2a34'); c.fillStyle = '#fff'; c.fillRect(-14, -18, 28, 2); c.fillRect(-14, -10, 28, 2);
        c.save(); c.translate(-18, -26); c.rotate(-a); caja(c, 0, -7, 36, 7, 1, '#2a2a34'); c.fillStyle = '#fff'; for (let x = 4; x < 34; x += 10) c.fillRect(x, -7, 5, 7); c.restore();
      } },
      camara: { r: 24, trozos: ['#2a2a34', '#5b5f66'], pinta(c) {   // cámara de cine antigua con sus dos bobinas
        raya(c, [0, -30, -16, 0], OL, 3); raya(c, [0, -30, 16, 0], OL, 3);
        caja(c, -16, -50, 32, 20, 3, '#2a2a34'); bola(c, -8, -60, 9, '#5b5f66'); bola(c, 10, -60, 9, '#5b5f66'); caja(c, 16, -46, 12, 12, 3, '#5b5f66');
        c.fillStyle = '#ff4b5c'; c.beginPath(); c.arc(-10, -44, 2.5, 0, T); c.fill();
      } },
      carton: { r: 22, trozos: ['#c8a06a', '#ff7a1a'], pinta(c, p) {   // un recorte de cartón del protagonista de la serie, con su pata detrás
        raya(c, [0, -30, 12, 0], '#8a6a3e', 4);
        poli(c, [-10, 0, -12, -40, -22, -56, -10, -64, -6, -78, 6, -78, 10, -64, 22, -56, 12, -40, 10, 0], p.v < 0.5 ? '#ff7a1a' : '#2e8bff');
        bola(c, 0, -86, 10, '#ffd9a8'); c.fillStyle = OL; c.fillRect(-5, -88, 3, 3); c.fillRect(3, -88, 3, 3);
        c.fillStyle = '#ffcb3d'; poli(c, [-6, -60, 6, -60, 0, -50], '#ffcb3d');
      } },
      jirafa: { r: 18, trozos: ['#5b5f66', '#2a2a34'], pinta(c, p) {   // micro de jirafa
        raya(c, [0, 0, 0, -60], OL, 4); raya(c, [-12, 0, 12, 0], OL, 4);
        raya(c, [0, -60, 46, -80], '#5b5f66', 4); caja(c, 40, -88, 22, 10, 5, '#8a8a96');
      } },
      luz: { r: 18, fijo: true, trozos: ['#ff4b5c', '#2a2a34'], pinta(c, p, t) {   // el cartel de «SE RUEDA», que se enciende y apaga
        raya(c, [0, 0, 0, -40], OL, 4);
        const on = Math.sin(t * 2 + p.fase) > 0;
        caja(c, -28, -60, 56, 22, 4, on ? '#ff4b5c' : '#5a2a32');
        ESC.txt(c, tr('SE RUEDA'), 0, -49, 10, on ? '#fff' : '#a07a80');
      } },
    },
    amb: { n: 26,   // motas de polvo en el aire, que brillan cuando las pilla la luz
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : V.h + 10; },
      mueve(p, dt, v, t) { p.x += (v * 1.5 + Math.sin(t * 0.7 + p.f) * 8) * dt; p.y -= (4 + p.v * 6) * dt; },
      pinta(c, p, t) { c.fillStyle = `rgba(255,240,200,${0.25 + 0.35 * Math.max(0, Math.sin(t + p.f))})`; c.fillRect(p.x, p.y, 2.4 * p.z, 2.4 * p.z); },
    },
  };
})();
