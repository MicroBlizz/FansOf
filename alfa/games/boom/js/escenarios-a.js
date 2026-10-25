// Fans of Boom · ESCENARIOS (1 de 4): las Oficinas de Microblizz (moqueta, mesas, la fuente de agua, papeles volando) y la Madriguera
// de los Animales Locos (atardecer, montañas de chatarra, raíces, bellotas y un mapache en cada cubo). Solo dibujo (escenario.js).
'use strict';
(() => {
  const { T, caja, bola, poli, raya } = ESC, W = BOOM.mundo.ancho, H = BOOM.mundo.alto;

  /* ---------------- OFICINAS DE MICROBLIZZ ---------------- */
  ESCENARIOS.oficina = {
    vivo(c, V, CAM, t) {   // los fluorescentes del techo, que parpadean de vez en cuando
      const y = 16 - CAM.y * 0.4; if (y < -30) return;
      for (let x = ((-CAM.x * 0.4) % 260 + 260) % 260 - 260; x < V.w + 260; x += 260) {
        const fallo = Math.sin(t * 23 + x) > 0.97;
        caja(c, x + 40, y, 150, 12, 5, fallo ? '#c9d4dc' : '#fbfdff');
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(x + 40, y + 12); c.lineTo(x + 190, y + 12); c.lineTo(x + 230, y + 90); c.lineTo(x, y + 90); c.fill();
      }
    },
    capas: [
      { par: 0.16, pinta(c, w, az) {   // la ciudad por la ventana, con bruma
        for (let x = -20; x < w; x += 50 + az() * 70) {
          const bw = 60 + az() * 90, bh = 160 + az() * 320, y = 640 - bh;
          c.fillStyle = az() < 0.5 ? '#a9cbe2' : '#9cc0da'; c.fillRect(x, y, bw, H - y);
          c.fillStyle = '#d8ecfa'; for (let yy = y + 12; yy < 640; yy += 22) for (let xx = x + 8; xx < x + bw - 10; xx += 16) if (az() < 0.7) c.fillRect(xx, yy, 8, 11);
          if (az() < 0.3) { c.fillStyle = '#9cc0da'; c.fillRect(x + bw / 2 - 2, y - 40, 4, 40); }
        }
      } },
      { par: 0.4, pinta(c, w, az) {   // la pared de la oficina con sus ventanales, pizarras y cuadros
        c.fillStyle = '#e6d8c2'; c.fillRect(0, 0, w, H);
        c.fillStyle = '#d6c6ae'; for (let y = 0; y < H; y += 46) c.fillRect(0, y, w, 3);
        c.save(); c.globalCompositeOperation = 'destination-out';
        for (let x = 60; x < w; x += 380) c.fillRect(x, 110, 230, 300);
        c.restore();
        for (let x = 60; x < w; x += 380) {   // marcos de los ventanales y lo de la pared entre ellos
          c.strokeStyle = '#7a8aa0'; c.lineWidth = 10; c.strokeRect(x, 110, 230, 300); c.lineWidth = 6; c.beginPath(); c.moveTo(x + 115, 110); c.lineTo(x + 115, 410); c.moveTo(x, 250); c.lineTo(x + 230, 250); c.stroke();
          c.fillStyle = '#cbb89c'; c.fillRect(x - 10, 410, 250, 14);
          const q = x + 268, k = az();
          c.strokeStyle = OL; c.lineWidth = 3;
          if (k < 0.33) {   // pizarra con un gráfico que sube
            caja(c, q, 170, 84, 60, 4, '#fbfbf6'); raya(c, [q + 10, 218, q + 30, 205, q + 48, 210, q + 72, 182], '#2e8bff', 3);
            c.fillStyle = '#ff4b5c'; c.beginPath(); c.moveTo(q + 72, 176); c.lineTo(q + 76, 188); c.lineTo(q + 66, 186); c.fill();
          } else if (k < 0.66) {   // el reloj de la oficina, siempre en las cinco menos cinco
            bola(c, q + 42, 200, 26, '#fff'); raya(c, [q + 42, 200, q + 42, 180], OL, 3); raya(c, [q + 42, 200, q + 36, 186], OL, 3);
          } else {   // el cuadro del empleado del mes
            caja(c, q + 12, 160, 62, 76, 3, '#c79a4a'); c.fillStyle = '#bfe8ff'; c.fillRect(q + 20, 168, 46, 60);
            bola(c, q + 43, 192, 11, '#ffd9a8'); c.fillStyle = OL; c.fillRect(q + 36, 189, 14, 3);
          }
          if (az() < 0.5) {   // una planta alta o un archivador al fondo
            caja(c, q + 20, 470, 46, 110, 4, '#a8b4c0'); for (let y = 482; y < 570; y += 30) { c.fillStyle = '#8a96a2'; c.fillRect(q + 34, y, 18, 5); }
          }
        }
        c.fillStyle = '#b9a688'; c.fillRect(0, 600, w, H);   // el zócalo
      } },
    ],
    suelo(c, az, sup, m) {
      ESC.traza(c, sup, 30); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.save(); c.clip();
      ESC.filas(c, 0, 38, 76, 38, 'rgba(70,40,60,.22)', 2);   // baldosas bajo la moqueta
      c.restore();
      c.globalAlpha = 0.55;
      for (let i = 0; i < 12; i++) {   // cables de colores que cruzan el suelo, por debajo de las baldosas
        const col = ['#ff4b5c', '#2e8bff', '#ffcb3d', '#6fd04a'][i % 4], d = 90 + az() * 240, f = 0.006 + az() * 0.01, ph = az() * T, x0 = az() * W, l = 160 + az() * 360;
        c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
        for (let x = x0; x < Math.min(W, x0 + l); x += 8) { const y = sup[Math.floor(x)] + d + Math.sin(x * f + ph) * 12; (x === x0 ? c.moveTo(x, y) : c.lineTo(x, y)); }
        c.stroke();
      }
      c.globalAlpha = 1;
      ESC.entierra(c, az, sup, 150, 30, 330, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.22) { caja(c, -10, -10, 20, 20, 2, ['#2e8bff', '#ff4b5c', '#5b3d8a'][Math.floor(az() * 3)]); c.fillStyle = '#e8eef4'; c.fillRect(-6, -10, 12, 7); c.fillStyle = '#20102c'; c.fillRect(2, -9, 3, 5); }   // disquete
        else if (k < 0.4) { caja(c, -8, -8, 14, 16, 3, '#fff'); c.beginPath(); c.arc(8, 0, 4, -1.4, 1.4); c.stroke(); c.fillStyle = '#6b4a2e'; c.fillRect(-6, -6, 10, 3); }   // taza de café
        else if (k < 0.58) { caja(c, -12, -6, 24, 9, 3, '#5b3d8a'); caja(c, -12, -1, 24, 5, 2, '#3a2a4a'); }   // grapadora
        else if (k < 0.78) { c.fillStyle = '#fbfbf6'; c.fillRect(-9, -12, 18, 24); c.strokeRect(-9, -12, 18, 24); c.fillStyle = '#9aa6b4'; for (let y = -7; y < 10; y += 5) c.fillRect(-6, y, 12, 2); }   // papeles
        else caja(c, -6, -6, 12, 12, 2, '#e8e0d0');   // una tecla suelta
      });
    },
    capa(c, az, sup, m) {   // la moqueta azul de oficina, con sus motitas y el borde de la tarima
      ESC.traza(c, sup, 11); c.strokeStyle = m.hierba; c.lineWidth = 24; c.lineCap = 'butt'; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.16)'; for (let x = 0; x < W; x += 7) c.fillRect(x, sup[x] + 4 + (x * 7) % 15, 2, 2);
      ESC.traza(c, sup, 24); c.strokeStyle = '#a07a52'; c.lineWidth = 4; c.stroke();
      ESC.traza(c, sup, 1); c.strokeStyle = '#8a9cd8'; c.lineWidth = 3; c.stroke();
    },
    hueco: [80, 190],
    reparto: ['mesa', 'mesa', 'mesa', 'planta', 'planta', 'fuente', 'silla', 'archivador', 'cafetera', 'cartel'],
    props: {
      mesa: { r: 30, trozos: ['#c79a4a', '#2a2a3a', '#bfe8ff'], pinta(c, p, t) {   // mesa con su monitor encendido
        c.fillStyle = OL; c.fillRect(-30, -22, 4, 22); c.fillRect(26, -22, 4, 22);
        caja(c, -34, -28, 68, 8, 3, '#c79a4a');
        caja(c, -14, -58, 34, 24, 3, '#2a2a3a'); c.fillStyle = Math.sin(t * 2 + p.v * 9) > -0.8 ? '#7ad8ff' : '#fff'; c.fillRect(-11, -55, 28, 18);
        c.fillStyle = '#ff7a1a'; c.fillRect(-4, -50, 8, 8); c.fillStyle = OL; c.fillRect(1, -34, 4, 6);
        caja(c, -26, -34, 20, 6, 2, '#e8e0d0'); if (p.v < 0.5) { caja(c, 22, -38, 7, 10, 2, '#fff'); }
      } },
      planta: { r: 20, trozos: ['#5aa83a', '#c0603a'], pinta(c, p, t) {
        const b = Math.sin(t * 1.5 + p.fase) * 0.08;
        for (const [a, l] of [[-0.6, 34], [-0.2, 42], [0.3, 38], [0.7, 30]]) { c.save(); c.translate(0, -18); c.rotate(a + b); poli(c, [0, 0, -7, -l * 0.6, 0, -l, 7, -l * 0.6], '#5aa83a'); c.restore(); }
        poli(c, [-12, -20, 12, -20, 9, 0, -9, 0], '#c0603a');
      } },
      fuente: { r: 26, trozos: ['#7ad8ff', '#e8eef4'], pinta(c, p, t) {   // la fuente de agua, con sus burbujas
        caja(c, -13, -38, 26, 38, 4, '#e8eef4'); caja(c, -4, -30, 8, 6, 2, '#2e8bff');
        caja(c, -12, -70, 24, 34, 9, 'rgba(122,216,255,.85)');
        c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { const y = -42 - ((t * 18 + i * 10 + p.v * 30) % 26); c.beginPath(); c.arc(-3 + i * 3, y, 2, 0, T); c.fill(); }
      } },
      silla: { r: 18, trozos: ['#3a2a4a', '#5b5f66'], pinta(c, p) {
        raya(c, [-12, -2, 12, -2], OL, 3); bola(c, -12, -2, 3, '#5b5f66'); bola(c, 12, -2, 3, '#5b5f66'); c.fillStyle = OL; c.fillRect(-2, -16, 4, 14);
        caja(c, -14, -22, 28, 7, 3, '#3a2a4a'); caja(c, -14, -50, 8, 30, 4, '#3a2a4a');
      } },
      archivador: { r: 24, trozos: ['#a8b4c0', '#fbfbf6'], pinta(c, p) {
        caja(c, -16, -58, 32, 58, 3, '#a8b4c0');
        for (let y = -52; y < -4; y += 18) { c.strokeRect(-12, y, 24, 14); c.fillStyle = OL; c.fillRect(-4, y + 5, 8, 3); }
        if (p.v < 0.6) { c.fillStyle = '#fbfbf6'; c.fillRect(-10, -56, 14, 6); c.strokeRect(-10, -56, 14, 6); }
      } },
      cafetera: { r: 20, trozos: ['#2a2a3a', '#ff4b5c', '#6b4a2e'], pinta(c, p, t) {   // la máquina de café, sobre un mueble bajo
        caja(c, -18, -20, 36, 20, 3, '#c79a4a'); caja(c, -12, -50, 24, 30, 4, '#2a2a3a'); c.fillStyle = '#ff4b5c'; c.fillRect(-8, -46, 6, 4);
        caja(c, -4, -30, 9, 9, 2, '#fff');
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; for (let i = 0; i < 2; i++) { const k = (t * 0.8 + i * 0.5 + p.v) % 1; c.beginPath(); c.moveTo(i * 3, -32 - k * 20); c.quadraticCurveTo(4 + i * 3, -38 - k * 20, i * 3, -44 - k * 20); c.stroke(); }
      } },
      cartel: { r: 22, fijo: true, trozos: ['#fbfbf6', '#c79a4a'], pinta(c, p) {   // el caballete con el lema del trimestre
        raya(c, [-14, 0, -4, -54], OL, 4); raya(c, [14, 0, 4, -54], OL, 4);
        caja(c, -34, -64, 68, 36, 3, '#fbfbf6');
        ESC.txt(c, tr(p.v < 0.5 ? 'SINERGIA' : 'ENTREGA: AYER'), 0, -46, 10, '#ff7a1a');
      } },
    },
    amb: { n: 12,   // papeles que vuelan con el viento
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : -30; },
      mueve(p, dt, v, t) { p.x += (v * 7 + Math.sin(t * 2 + p.f) * 30) * dt * p.z; p.y += (26 + p.v * 30) * dt * p.z; },
      pinta(c, p, t) { c.save(); c.translate(p.x, p.y); c.rotate(Math.sin(t * 3 + p.f) * 0.8); c.scale(p.z, Math.abs(Math.cos(t * 2 + p.f)) * p.z + 0.2); c.fillStyle = '#fbfbf6'; c.fillRect(-8, -10, 16, 20); c.strokeRect(-8, -10, 16, 20); c.fillStyle = '#9aa6b4'; c.fillRect(-5, -5, 10, 2); c.fillRect(-5, 0, 10, 2); c.restore(); },
    },
  };

  /* ---------------- LA MADRIGUERA ---------------- */
  ESCENARIOS.madriguera = {
    cielo(c, V, CAM) {   // el sol del atardecer, gordo y bajo
      const x = V.w * 0.68 - CAM.x * 0.04, y = 250 - CAM.y * 0.12;
      c.fillStyle = 'rgba(255,240,170,.35)'; c.beginPath(); c.arc(x, y, 120, 0, T); c.fill();
      c.lineWidth = 4; bola(c, x, y, 76, '#ffd45a');
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 6; c.beginPath(); c.arc(x - 18, y - 18, 46, 3.6, 4.6); c.stroke();
    },
    capas: [
      { par: 0.14, pinta(c, w, az) {   // colinas lejanas con árboles redondos
        c.fillStyle = '#e8946a'; c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= w; x += 20) c.lineTo(x, 520 + Math.sin(x / 210) * 50 + Math.sin(x / 77) * 16); c.lineTo(w, H); c.fill();
        for (let x = 20; x < w; x += 30 + az() * 60) { const y = 520 + Math.sin(x / 210) * 50 + Math.sin(x / 77) * 16, r = 14 + az() * 16; c.fillRect(x - 2, y - r, 4, r); c.beginPath(); c.arc(x, y - r - r * 0.5, r, 0, T); c.fill(); }
      } },
      { par: 0.36, pinta(c, w, az) {   // montañas de chatarra: neveras, coches, ruedas y una valla torcida
        const col = '#b0603e', y0 = 600;
        c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= w; x += 24) c.lineTo(x, y0 - Math.abs(Math.sin(x / 260)) * 150 - Math.sin(x / 41) * 10); c.lineTo(w, H); c.fill();
        for (let x = 30; x < w; x += 70 + az() * 110) {
          const y = y0 - Math.abs(Math.sin(x / 260)) * 150, k = az();
          c.save(); c.translate(x, y + 6); c.rotate((az() - 0.5) * 0.7); c.lineWidth = 3;
          if (k < 0.3) { caja(c, -20, -50, 40, 56, 5, '#c8785a'); c.fillStyle = '#9a4e36'; c.fillRect(-14, -30, 28, 3); }   // nevera
          else if (k < 0.6) { caja(c, -46, -26, 92, 28, 10, '#a85a44'); caja(c, -26, -46, 48, 24, 8, '#a85a44'); bola(c, -26, 2, 12, '#7a3e2e'); bola(c, 26, 2, 12, '#7a3e2e'); }   // coche
          else { for (let i = 0; i < 3; i++) bola(c, (i - 1) * 6, -14 - i * 18, 16, '#7a3e2e'); }   // pila de ruedas
          c.restore();
        }
        for (let x = 0; x < w; x += 22) { const h = 70 + (x * 13) % 30; c.fillStyle = '#c88a5a'; c.save(); c.translate(x, 700); c.rotate(Math.sin(x) * 0.08); c.fillRect(-8, -h, 16, h + 200); c.strokeRect(-8, -h, 16, h + 200); c.restore(); }
      } },
    ],
    suelo(c, az, sup) {
      for (let i = 0; i < 70; i++) {   // raíces que bajan desde la superficie
        let x = az() * W, y = sup[Math.floor(x)] + 8; if (y >= H) continue;
        c.strokeStyle = '#6b4024'; c.lineWidth = 5 + az() * 3; c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 6; j++) { x += (az() - 0.5) * 50; y += 18 + az() * 20; c.lineTo(x, y); }
        c.stroke();
      }
      for (let i = 0; i < 9; i++) {   // túneles de madriguera (solo dibujados: el suelo sigue ahí)
        const x = 200 + az() * (W - 400), y = sup[Math.floor(x)] + 120 + az() * 160, l = 90 + az() * 140;
        c.fillStyle = 'rgba(40,20,10,.55)'; c.beginPath(); c.ellipse(x, y, l, 20, (az() - 0.5) * 0.5, 0, T); c.fill();
        c.strokeStyle = 'rgba(255,220,170,.18)'; c.lineWidth = 3; c.stroke();
      }
      ESC.entierra(c, az, sup, 170, 26, 340, (c, az) => {
        const k = az(); ESC.borde(c, 2.5);
        if (k < 0.3) { c.fillStyle = '#9a9488'; c.beginPath(); c.ellipse(0, 0, 8 + az() * 8, 6 + az() * 4, 0, 0, T); c.fill(); c.stroke(); }   // piedra
        else if (k < 0.48) { c.fillStyle = '#f4ecd8'; c.fillRect(-10, -2.5, 20, 5); for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 10, -2, 3, 0, T); c.arc(s * 10, 2, 3, 0, T); c.fill(); } }   // hueso
        else if (k < 0.68) { bola(c, 0, 2, 6, '#b0763f'); caja(c, -6, -6, 12, 6, 3, '#6b4024'); }   // bellota
        else if (k < 0.84) { caja(c, -7, -10, 14, 20, 3, '#c0c4cc'); c.fillStyle = '#ff4b5c'; c.fillRect(-7, -4, 14, 7); }   // lata
        else { c.fillStyle = '#ffcb3d'; c.beginPath(); for (let j = 0; j < 12; j++) { const a = j / 12 * T, r = j % 2 ? 5 : 7; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); c.stroke(); }   // chapa
      });
    },
    capa(c, az, sup, m) {   // tierra con hierba seca y briznas
      ESC.traza(c, sup, 8); c.strokeStyle = m.hierba; c.lineWidth = 16; c.lineCap = 'butt'; c.stroke();
      c.strokeStyle = '#7a9a2a'; c.lineWidth = 2; c.beginPath();
      for (let x = 0; x < W; x += 5) { const y = sup[x]; if (y >= H) continue; const h = 6 + (x * 17) % 9; c.moveTo(x, y + 15); c.lineTo(x + ((x * 7) % 5) - 2, y + 15 - h); }
      c.stroke();
      ESC.traza(c, sup, 1); c.strokeStyle = '#e4f07a'; c.lineWidth = 3; c.stroke();
    },
    hueco: [70, 170],
    reparto: ['cubo', 'cubo', 'neumatico', 'seta', 'seta', 'arbusto', 'arbusto', 'senal', 'caja'],
    props: {
      cubo: { r: 22, trozos: ['#9aa2ac', '#5b5f66'], pinta(c, p, t) {   // cubo de basura con un mapache que se asoma
        poli(c, [-16, -40, 16, -40, 13, 0, -13, 0], '#9aa2ac'); c.strokeStyle = OL; for (const x of [-7, 0, 7]) raya(c, [x, -34, x * 0.85, -6], '#7a828c', 2);
        const ab = 0.25 + Math.max(0, Math.sin(t * 0.9 + p.fase)) * 0.35;
        c.save(); c.translate(-16, -40); c.rotate(-ab); ESC.borde(c); caja(c, 0, -6, 34, 6, 3, '#7a828c'); c.restore();
        if (Math.sin(t * 3.1 + p.fase * 5) > -0.92) { c.fillStyle = '#ffe96b'; c.fillRect(-6, -45, 4, 3); c.fillRect(3, -45, 4, 3); }   // los ojos parpadean
      } },
      neumatico: { r: 18, atras: true, hunde: 10, trozos: ['#2a2a34', '#5b5f66'], pinta(c) { bola(c, 0, -14, 20, '#2a2a34'); bola(c, 0, -14, 8, '#5b5f66'); } },
      seta: { r: 14, trozos: ['#ff4b5c', '#fff'], pinta(c, p) {
        for (const [x, s] of [[0, 1], [12, 0.6], [-10, 0.5]]) {
          if (p.v < 0.4 && x) continue;
          caja(c, x - 3 * s, -16 * s, 6 * s, 16 * s, 2, '#f4ecd8');
          c.fillStyle = '#ff4b5c'; c.beginPath(); c.arc(x, -15 * s, 12 * s, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(x - 4 * s, -20 * s, 2.4 * s, 0, T); c.arc(x + 5 * s, -18 * s, 2 * s, 0, T); c.fill();
        }
      } },
      arbusto: { r: 22, trozos: ['#6f9a2a', '#a8c83a'], pinta(c, p, t) {
        const b = Math.sin(t * 1.2 + p.fase) * 1.5;
        for (const [x, y, r] of [[-14, -12, 13], [14, -12, 13], [0, -22, 17]]) bola(c, x + b, y, r, '#6f9a2a');
        c.fillStyle = '#a8c83a'; c.beginPath(); c.arc(-4 + b, -28, 6, 0, T); c.fill();
        if (p.v < 0.3) { c.fillStyle = '#ff4b5c'; for (const [x, y] of [[-12, -16], [8, -24], [16, -10]]) { c.beginPath(); c.arc(x + b, y, 2.6, 0, T); c.fill(); } }
      } },
      senal: { r: 20, fijo: true, trozos: ['#c79a4a', '#ffcb3d'], pinta(c, p) {   // cartel de madera torcido
        c.save(); c.rotate(-0.12); caja(c, -3, -54, 6, 54, 2, '#8a5a34');
        poli(c, [-30, -60, 26, -64, 30, -52, 26, -40, -30, -38], '#c79a4a');
        ESC.txt(c, tr(p.v < 0.5 ? '¡MAPACHES!' : '¡CUIDADO!'), -2, -51, 10, '#ffe96b'); c.restore();
      } },
      caja: { r: 18, trozos: ['#c8a06a', '#8a6a3e'], pinta(c, p) {   // caja de cartón abierta
        caja(c, -18, -30, 36, 30, 2, '#c8a06a'); poli(c, [-18, -30, -26, -40, -6, -38, 0, -30], '#d8b07a'); poli(c, [18, -30, 24, -42, 6, -38, 0, -30], '#d8b07a');
        ESC.txt(c, tr('FRÁGIL'), 0, -16, 9, '#ff4b5c');
      } },
    },
    amb: { n: 14,   // hojas secas que caen y se las lleva el viento
      nace(p, V, primera) { p.x = Math.random() * V.w; p.y = primera ? Math.random() * V.h : -30; p.c = ['#e8a92a', '#d9602e', '#c9d84a'][Math.floor(p.v * 3)]; },
      mueve(p, dt, v, t) { p.x += (v * 8 + Math.sin(t * 1.7 + p.f) * 40) * dt * p.z; p.y += (34 + p.v * 26) * dt * p.z; },
      pinta(c, p, t) { c.save(); c.translate(p.x, p.y); c.rotate(t * 2 + p.f); c.scale(p.z, p.z); c.fillStyle = p.c; c.beginPath(); c.ellipse(0, 0, 8, 4, 0, 0, T); c.fill(); c.stroke(); c.restore(); },
    },
  };
})();
