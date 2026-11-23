// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, el dibujo de los golpes (tarea #160, ADR 197; revisión del 21-11-2026: cada compañero
// golpea a su manera y SIEMPRE con sus cositas). Al llegar a la burbuja: el fondo del estilo (resplandor en hada, manchón de
// aguada en acuarela), un aro de luz por onda y el dibujo propio de su golpe (PP_ATAQUE.EXTRA): flor de burbujitas, escarcha,
// brillo, ola con perlita, fuegos artificiales pastel, pompas de jabón, tinta pastel en remolino, chaparrón o corro de cositas.
// Todo cozy y sin contorno, en los dos estilos (los sprites y manchas de js/ataques-estilos.js). Se dibujan en las unidades del
// boceto (320 de ancho) escaladas por E. Lo usa js/ataques-fx.js; solo con el flag 'ataques-companeros' abierto.
'use strict';
const PP_ATAQUE_GOLPES = (() => {
  const TAU = Math.PI * 2, E = 1.7;
  const ES = PP_ATAQUE_ESTILO, { sprite, mancha, pon, aroDeLuz, mezcla } = ES;
  const lerp = (a, b, k) => a + (b - a) * k;
  const sube = k => 1 - Math.pow(1 - k, 3);
  const apaga = (u, desde) => (u < desde ? 1 : 1 - (u - desde) / (1 - desde));   // entero hasta `desde` y luego se apaga
  const confeti = i => PP_ATAQUE.CONFETI[i % PP_ATAQUE.CONFETI.length];
  // la cosita i-ésima del compañero, en su estilo
  const cosa = (g, i) => sprite(g.estilo, g.piezas[i % g.piezas.length], g.col);

  // una pompa de jabón irisada (en acuarela, más translúcida y con el borde corrido)
  function pompa(c, g, x, y, r, a) {
    const gr = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    const acu = g.estilo === 'acuarela', k = acu ? 0.75 : 1;
    gr.addColorStop(0, 'rgba(255,255,255,' + 0.08 * k + ')'); gr.addColorStop(0.72, 'rgba(200,232,255,' + 0.2 * k + ')');
    gr.addColorStop(0.86, 'rgba(255,180,228,' + 0.6 * k + ')'); gr.addColorStop(1, 'rgba(170,240,255,' + 0.85 * k + ')');
    c.save(); c.globalAlpha = a; c.fillStyle = gr;
    if (acu) { c.shadowColor = 'rgba(200,180,255,.8)'; c.shadowBlur = 6; }
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,.85)';
    c.beginPath(); c.ellipse(x - r * 0.38, y - r * 0.4, r * 0.22, r * 0.12, -0.7, 0, TAU); c.fill();
    c.restore();
  }
  // una chispa de los fuegos: un trazo pastel de luz que se adelgaza (sin contorno: el trazo es la luz)
  function rayita(c, g, x0, y0, x1, y1, ancho, col) {
    c.save(); c.lineCap = 'round'; c.lineWidth = ancho;
    if (g.estilo === 'acuarela') { c.shadowColor = col; c.shadowBlur = 6; c.strokeStyle = col; c.globalAlpha *= 0.7; } else { c.shadowColor = '#ffffff'; c.shadowBlur = 8; c.strokeStyle = mezcla(col, '#ffffff', 0.2); }
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.restore();
  }
  function palmera(c, g, u, cx, cy) {
    if (u <= 0) return;
    const e = sube(Math.min(1, u * 1.6)), a = apaga(u, 0.45), n = 10;
    c.globalAlpha = a;
    for (let i = 0; i < n; i++) {
      const ang = g.giro + i * TAU / n, r1 = (6 + 34 * e) * g.k, r0 = r1 * 0.45, cae = 14 * u * u * g.k;
      const x1 = cx + Math.cos(ang) * r1, y1 = cy + Math.sin(ang) * r1 + cae;
      rayita(c, g, cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 + cae * 0.5, x1, y1, 2.4 * g.k * (1 - u * 0.7), confeti(i));
      pon(c, i % 2 ? sprite(g.estilo, 'destello', g.col) : cosa(g, i >> 1), x1, y1, (i % 2 ? 3 : 4.5) * g.k, ang, a);
    }
  }

  const GOLPES = {
    resplandor(c, g) {
      const u = g.t / g.dur;
      pon(c, mancha(g.estilo, g.col), 0, 0, 30 * g.k * (0.6 + 0.4 * sube(u)), 0, Math.pow(1 - u, 2) * 0.9);
    },
    manchon(c, g) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 2.5)), a = (u < 0.4 ? 1 : 1 - (u - 0.4) / 0.6) * 0.6;
      for (const m of g.manchas) pon(c, mancha('acuarela', m.col), m.dx * e * g.k, m.dy * e * g.k, m.r * g.k * (0.5 + 0.5 * e), m.rot, a);
    },
    aro(c, g, esc) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 1.3));
      c.globalAlpha = Math.pow(1 - u, 2) * (g.estilo === 'acuarela' ? 0.8 : 0.9);
      aroDeLuz(c, g.estilo, (22 + 34 * e) * g.k, g.col, (6 * (1 - e) + 2) * g.k * 0.8, esc);
    },
    // el estallido: una flor de burbujitas pastel con sus cositas dentro y un destello en medio
    flor(c, g) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 1.7)), a = apaga(u, 0.5), n = 7, col = mezcla(g.col, '#ffffff', 0.25);
      for (let i = 0; i < n; i++) {
        const ang = g.giro + i * TAU / n + u * 0.5, d = (8 + 26 * e) * g.k, ang2 = ang + Math.PI / n, d2 = d * 0.58;
        pon(c, sprite(g.estilo, 'burbujita', col), Math.cos(ang) * d, Math.sin(ang) * d, (3 + 5 * e) * g.k * (1 - 0.3 * u), 0, a);
        pon(c, cosa(g, i), Math.cos(ang2) * d2, Math.sin(ang2) * d2, (2.5 + 3.5 * e) * g.k, ang2 * 0.3, a);
      }
      pon(c, sprite(g.estilo, 'destello', g.col), 0, 0, 9 * g.k * Math.sin(Math.min(1, u * 2) * Math.PI), g.giro, a);
    },
    // el zarpazo: un destello de escarcha que se abre como una flor, con sus cositas en las puntas y la primera en medio
    escarcha(c, g, esc) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 2.2)), a = apaga(u, 0.5), L = (8 + 24 * e) * g.k;
      c.rotate(g.giro * 0.2 + u * 0.5); c.globalAlpha = a;
      for (let i = 0; i < 6; i++) {
        c.save(); c.rotate(i * TAU / 6); petaloEscarcha(c, g, L, esc); c.restore();
        const ang = -Math.PI / 2 + i * TAU / 6;
        pon(c, cosa(g, i), Math.cos(ang) * (L + 6), Math.sin(ang) * (L + 6), 4.5 * g.k * e, ang, a);
      }
      pon(c, cosa(g, 0), 0, 0, 8 * g.k * (0.6 + 0.4 * e), 0, a);
    },
    // la chispa: un brillo con sus cositas que giran alrededor
    chispa(c, g) {
      const u = g.t / g.dur, a = 1 - u * u;
      pon(c, mancha(g.estilo, '#ffe08a'), 0, 0, 24 * g.k * (0.6 + 0.4 * sube(u)), 0, a * 0.7);
      pon(c, sprite(g.estilo, 'destello', g.col), 0, 0, 24 * g.k * Math.sin(Math.min(1, u * 1.25) * Math.PI), u * 1.2, a);
      for (let i = 0; i < 6; i++) {
        const ang = g.giro + i * TAU / 6 + u * 1.2, d = (10 + 28 * sube(u)) * g.k;
        pon(c, cosa(g, i), Math.cos(ang) * d, Math.sin(ang) * d, 5 * g.k * (1 - u * 0.4), ang * 0.3, a);
      }
    },
    // la ola: dos aros de agua que se abren, burbujitas que suben, sus cositas montadas en la ola y una perlita que brilla
    ola(c, g, esc) {
      const u = g.t / g.dur, a = apaga(u, 0.45);
      for (const [r, ret] of [[1, 0], [0.7, 0.18]]) {
        const v = Math.max(0, u - ret), e = sube(Math.min(1, v * 1.5));
        if (v > 0) { c.save(); c.globalAlpha = a * (1 - e * 0.5); aroDeLuz(c, g.estilo, (14 + 50 * e) * r * g.k, '#a8e0ff', 4 * g.k * (1 - e * 0.6), esc); c.restore(); }
      }
      const e = sube(Math.min(1, u * 1.5)), R = (14 + 50 * e) * g.k;
      for (let i = 0; i < 5; i++) {
        const ang = g.giro + i * TAU / 5 + Math.sin(u * 6 + i) * 0.15;
        pon(c, cosa(g, i), Math.cos(ang) * R, Math.sin(ang) * R * 0.8 - Math.sin(u * 8 + i) * 3, 6 * g.k, Math.sin(u * 6 + i) * 0.4, a);
        pon(c, sprite(g.estilo, 'burbujita', '#c4e8ff'), Math.cos(ang + 0.6) * R * 0.5, -u * 46 * g.k - i * 4, (2 + i % 3) * g.k, 0, a);
      }
      const brilla = 0.6 + 0.4 * Math.sin(u * 14);
      pon(c, sprite(g.estilo, 'perla', g.col), 0, 0, 10 * g.k * (0.7 + 0.3 * e), 0, a);
      pon(c, sprite(g.estilo, 'destello', '#ffffff'), -3.5 * g.k, -3.5 * g.k, 7 * g.k * brilla, u * 2, a * brilla);
    },
    // los fuegos: dos palmeras de chispas pastel que estallan hacia fuera y caen un poco, con sus cositas en las puntas
    fuegos(c, g) {
      const u = g.t / g.dur;
      palmera(c, g, u, 0, 0);
      palmera(c, g, (u - 0.25) / 0.75, 16 * g.k * Math.cos(g.giro), -14 * g.k);
    },
    // las pompas: pompas de jabón irisadas con una cosita dentro que suben meciéndose y estallan suaves soltando un destello
    pompas(c, g) {
      const u = g.t / g.dur;
      for (let i = 0; i < 7; i++) {
        const fin = 0.55 + 0.06 * i, x = Math.sin(g.giro + i * 2.4) * 26 * g.k + Math.sin(u * 7 + i) * 4, y = (8 - (8 + 60 * u) * (0.6 + i * 0.07)) * g.k;
        if (u < fin) {
          const r = (8 + i % 3 * 3) * g.k * (0.4 + 0.6 * sube(Math.min(1, u * 3)));
          pon(c, cosa(g, i), x, y, r * 0.55, Math.sin(u * 4 + i) * 0.4, 0.9);
          pompa(c, g, x, y, r, 1);
        } else {
          const v = Math.min(1, (u - fin) / 0.25);
          for (let j = 0; j < 4; j++) { const ang = j * TAU / 4 + i; pon(c, sprite(g.estilo, 'destello', g.col), x + Math.cos(ang) * 9 * v * g.k, y + Math.sin(ang) * 9 * v * g.k, 2.5 * g.k * (1 - v), 0, 1 - v); }
        }
      }
    },
    // la tinta: manchas de tinta pastel que se abren y sus cositas girando en remolino hacia fuera
    tinta(c, g) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 2)), a = apaga(u, 0.4), tinta = mezcla(g.col, '#d4b4f2', 0.45);
      for (let i = 0; i < 5; i++) {
        const ang = g.giro + i * TAU / 5, d = 16 * e * g.k;
        pon(c, mancha(g.estilo, i % 2 ? tinta : mezcla(tinta, confeti(i), 0.4)), Math.cos(ang) * d, Math.sin(ang) * d, (18 + 8 * (i % 3)) * g.k * (0.4 + 0.6 * e), ang, a * 0.85);
      }
      for (let i = 0; i < 8; i++) {
        const ang = g.giro + i * TAU / 8 + u * 5, d = (4 + 38 * u) * g.k;
        pon(c, cosa(g, i), Math.cos(ang) * d, Math.sin(ang) * d, 6 * g.k * (1 - u * 0.4), ang, a);
      }
    },
    // el chaparrón: sus cositas caen desde arriba sobre la burbuja y salpican un aro pequeño al llegar
    chaparron(c, g, esc) {
      const u = g.t / g.dur;
      for (let i = 0; i < 9; i++) {
        const ini = i * 0.05, v = (u - ini) / 0.45, x = Math.sin(g.giro + i * 2.1) * 30 * g.k, y1 = Math.cos(i * 1.7) * 10 * g.k;
        if (v <= 0) continue;
        if (v < 1) { pon(c, cosa(g, i), x, lerp(-90 * g.k, y1, v * v), 6 * g.k, Math.sin(i + u * 6) * 0.4, Math.min(1, v * 3)); continue; }
        const w = Math.min(1, (v - 1) * 0.9);
        pon(c, cosa(g, i), x, y1 + w * 6 * g.k, 6 * g.k * (1 - w * 0.5), 0, 1 - w);
        c.save(); c.translate(x, y1); c.globalAlpha = (1 - w) * 0.8; aroDeLuz(c, g.estilo, (3 + 10 * w) * g.k, g.col, 2 * g.k, esc); c.restore();
      }
    },
    // el corro: sus cositas dan vueltas alrededor de la burbuja, se abren y se apagan, con destellitos entre ellas
    carrusel(c, g) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 1.4)), a = apaga(u, 0.55), giro = g.giro + 9 * sube(u), R = (10 + 28 * e) * g.k;
      for (let i = 0; i < 8; i++) {
        const ang = giro + i * TAU / 8;
        pon(c, cosa(g, i), Math.cos(ang) * R, Math.sin(ang) * R, 6 * g.k * (0.6 + 0.4 * e), ang + Math.PI / 2, a);
        pon(c, sprite(g.estilo, 'destello', g.col), Math.cos(ang + 0.4) * R * 0.75, Math.sin(ang + 0.4) * R * 0.75, 2.5 * g.k, 0, a * (0.5 + 0.5 * Math.sin(u * 20 + i)));
      }
    },
  };
  function petaloEscarcha(c, g, L, esc) {
    c.beginPath(); c.moveTo(0, -3 * g.k); c.lineTo(L * 0.2, -L * 0.55); c.lineTo(0, -L); c.lineTo(-L * 0.2, -L * 0.55); c.closePath();
    if (g.estilo === 'acuarela') { c.shadowColor = 'rgba(143,208,255,.9)'; c.shadowBlur = 8 * esc; c.fillStyle = 'rgba(159,214,255,.45)'; c.fill(); c.fill(); return; }
    const lg = c.createLinearGradient(0, 0, 0, -L);
    lg.addColorStop(0, '#bfe6ff'); lg.addColorStop(1, '#ffffff');
    c.shadowColor = '#ffffff'; c.shadowBlur = 10 * esc; c.fillStyle = lg; c.fill();
  }
  // los extras de PP_ATAQUE.EXTRA con dibujo propio ('anillo' es solo otra onda)
  const DIBUJO_EXTRA = Object.freeze(['flor', 'escarcha', 'chispa', 'ola', 'fuegos', 'pompas', 'tinta', 'chaparron', 'carrusel']);
  // lo que dura cada dibujo propio (los que llevan más cositas, algo más)
  const DURA = Object.freeze({ pompas: 1.5, chaparron: 1.6, carrusel: 1.4, tinta: 1.3, fuegos: 1.3, ola: 1.3 });
  function pinta(c, g) {
    if (g.t < 0) return;
    c.save(); c.translate(g.x, g.y); c.scale(E, E);
    const m = c.getTransform();
    GOLPES[g.tipo](c, g, Math.hypot(m.a, m.b));
    c.restore();
  }
  // los golpes de un ataque al llegar a (x, y): el fondo del estilo (resplandor o manchón de aguada), un aro de luz por onda y
  // el dibujo propio de su golpe con sus cositas; `g` es PP_ATAQUE.golpe y `rnd` el azar
  function golpes(x, y, g, ataque, rnd) {
    const col = ES.pastel(ataque.color), base = { x, y, t: 0, k: g.k, col, estilo: ataque.estilo, giro: rnd() * TAU, piezas: ataque.piezas };
    const de = o => Object.assign({}, base, o), out = [];
    if (ataque.estilo === 'acuarela') {
      const manchas = PP_ATAQUE.CONFETI.slice(0, 4).map(cc => ({ col: mezcla(col, cc, 0.5), dx: lerp(-14, 14, rnd()), dy: lerp(-14, 14, rnd()), r: lerp(14, 22, rnd()), rot: rnd() * TAU }));
      out.push(de({ tipo: 'manchon', dur: 1.9, fondo: true, manchas }));
    } else out.push(de({ tipo: 'resplandor', dur: 0.8 }));
    for (const o of g.ondas) out.push(de({ tipo: 'aro', dur: 1, t: -o.retraso, k: o.k }));
    if (DIBUJO_EXTRA.includes(g.extra)) out.push(de({ tipo: g.extra, dur: DURA[g.extra] || 1.1 }));
    return out;
  }
  return Object.freeze({ GOLPES, DIBUJO_EXTRA, golpes, pinta });
})();
