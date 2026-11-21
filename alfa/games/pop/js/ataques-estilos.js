// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, los dos estilos cozy de dibujo (tarea #160, ADR 197, revisión de Pepins del 21-11-2026:
// «el reborde negro rompe la magia»). Nada lleva contorno oscuro. Cada compañero pinta siempre en su estilo (PP_ATAQUE.de):
// · 'hada' (brillo de hada): halo pastel, resplandor blanco suave, destellitos de cuatro puntas, polvo que titila y corazoncitos.
// · 'acuarela': piezas translúcidas con el color corrido a los bordes y el centro claro, manchas de aguada que se secan despacio.
// Las piezas son sprites cacheados por estilo|pieza|color: el dibujo de Yoshi (img-liso/fx-<pieza>.png) con el halo del estilo
// si ya llegó; si no, el repuesto por código del boceto (relleno pastel) y, si la pieza no tiene dibujo, una burbujita del color de
// la estela. Copia el boceto aprobado (boceto https://claude.ai/artifact/3VYoR6TzMupFhxK5yHwvnn); los golpes se dibujan en sus
// unidades (320 de ancho), escalados por E. Lo usa js/ataques-fx.js; solo se llama con el flag 'ataques-companeros' abierto.
'use strict';
const PP_ATAQUE_ESTILO = (() => {
  const TAU = Math.PI * 2, E = 1.7;               // E: píxeles del juego por píxel del boceto
  const SPR = { lado: 128, s: 36 };               // cada sprite: un lienzo de 128 con la pieza de tamaño 36
  const DESVANECE = Object.freeze({ hada: 1.6, acuarela: 0.9 });   // lo que se apaga por segundo un punto de la estela
  const lerp = (a, b, k) => a + (b - a) * k;
  const sube = k => 1 - Math.pow(1 - k, 3);
  const limita = v => Math.max(0, Math.min(1, v));
  function rgb(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return [255, 255, 255];
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mezcla(hex, otro, k) {
    const a = rgb(hex), b = rgb(otro);
    return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join('');
  }
  const rgba = (hex, a) => 'rgba(' + rgb(hex).join(',') + ',' + a + ')';
  const pastel = col => mezcla(col, '#ffffff', 0.3);   // el color de la estela, aclarado para que sea cozy
  const azar = (a, b) => a + Math.random() * (b - a);  // solo para la textura de los sprites (se pintan una vez)
  function circulo(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
  function elipse(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); }

  /* ---------- formas de las piezas (solo relleno, nunca contorno) ---------- */
  function estrellaRuta(c, puntas, fuera, dentro) {
    c.beginPath();
    for (let i = 0; i < puntas * 2; i++) { const r = i % 2 ? dentro : fuera, a = -Math.PI / 2 + i * Math.PI / puntas; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath();
  }
  function destelloRuta(c, s) {
    const q = s * 0.12;
    c.beginPath(); c.moveTo(0, -s);
    c.quadraticCurveTo(q, -q, s, 0); c.quadraticCurveTo(q, q, 0, s); c.quadraticCurveTo(-q, q, -s, 0); c.quadraticCurveTo(-q, -q, 0, -s);
    c.closePath();
  }
  function corazonRuta(c, s) {
    c.beginPath(); c.moveTo(0, s * 0.8);
    c.bezierCurveTo(-s * 1.15, s * 0.05, -s * 0.7, -s * 0.95, 0, -s * 0.38);
    c.bezierCurveTo(s * 0.7, -s * 0.95, s * 1.15, s * 0.05, 0, s * 0.8);
    c.closePath();
  }
  function circulos(c, lista, s) {
    c.beginPath();
    for (const [x, y, r] of lista) { c.moveTo(x * s + r * s, y * s); c.arc(x * s, y * s, r * s, 0, TAU); }
  }
  function copoRuta(c, s) {
    c.lineCap = 'round'; c.lineWidth = s * 0.17; c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * TAU / 6, ca = Math.cos(a), sa = Math.sin(a), p = (x, y) => [x * ca - y * sa, x * sa + y * ca];
      c.moveTo(...p(0, 0)); c.lineTo(...p(0, -s * 0.9));
      c.moveTo(...p(0, -s * 0.5)); c.lineTo(...p(-s * 0.24, -s * 0.72));
      c.moveTo(...p(0, -s * 0.5)); c.lineTo(...p(s * 0.24, -s * 0.72));
    }
  }
  // cada pieza construye sus formas y llama a pinta(color, linea) para rellenarlas (linea: el trazo ES la forma, en pastel)
  const PIEZAS = {
    zanahoria(c, s, pinta) {
      for (const a of [-0.55, 0, 0.55]) { elipse(c, Math.sin(a) * s * 0.3, -s * 0.68, s * 0.15, s * 0.36, a); pinta('#a8eaa6'); }
      c.beginPath(); c.moveTo(-s * 0.44, -s * 0.4); c.quadraticCurveTo(0, -s * 0.66, s * 0.44, -s * 0.4);
      c.quadraticCurveTo(s * 0.3, s * 0.4, s * 0.07, s * 0.95); c.quadraticCurveTo(0, s * 1.05, -s * 0.07, s * 0.95);
      c.quadraticCurveTo(-s * 0.3, s * 0.4, -s * 0.44, -s * 0.4); c.closePath(); pinta('#ffb27c');
    },
    huella(c, s, pinta) {
      elipse(c, 0, s * 0.3, s * 0.46, s * 0.36); pinta('#ffb6d6');
      circulos(c, [[-0.52, -0.18, 0.19], [-0.19, -0.52, 0.19], [0.19, -0.52, 0.19], [0.52, -0.18, 0.19]], s); pinta('#ffc8e0');
    },
    azucar(c, s, pinta) {
      c.beginPath(); c.roundRect(-s * 0.5, -s * 0.5, s, s, s * 0.22); pinta('#ffeaf5');
      c.beginPath(); c.roundRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56, s * 0.12); pinta('#ffcfe6');
    },
    nube(c, s, pinta) { circulos(c, [[-0.45, 0.12, 0.34], [0, -0.14, 0.46], [0.45, 0.12, 0.34], [0, 0.22, 0.36]], s); pinta('#f4faff'); },
    copo(c, s, pinta) { copoRuta(c, s); pinta('#a6dcff', true); circulo(c, 0, 0, s * 0.24); pinta('#e6f6ff'); },
    'cristal-hielo'(c, s, pinta) {
      c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.46, -s * 0.22); c.lineTo(s * 0.3, s * 0.8); c.lineTo(-s * 0.3, s * 0.8); c.lineTo(-s * 0.46, -s * 0.22); c.closePath();
      pinta('#b8e4ff');
      c.beginPath(); c.moveTo(0, -s); c.lineTo(-s * 0.46, -s * 0.22); c.lineTo(-s * 0.3, s * 0.8); c.lineTo(0, s * 0.8); c.closePath(); pinta('#e2f5ff');
    },
    lupa(c, s, pinta) {
      c.lineCap = 'round'; c.lineWidth = s * 0.28;
      c.beginPath(); c.moveTo(s * 0.3, s * 0.3); c.lineTo(s * 0.86, s * 0.86); pinta('#f2b888', true);
      circulo(c, -s * 0.12, -s * 0.12, s * 0.54); pinta('#ffd690');
      circulo(c, -s * 0.12, -s * 0.12, s * 0.4); pinta('#e8f7ff');
    },
    estrellita(c, s, pinta) { estrellaRuta(c, 5, s, s * 0.5); pinta('#ffe27a'); },
    destello(c, s, pinta) { destelloRuta(c, s); pinta('#fff4b8'); },
    corazon(c, s, pinta) { corazonRuta(c, s); pinta('#ffa6cc'); },
    gotita(c, s, pinta, color) { circulo(c, 0, 0, s * 0.55); pinta(color); },
    confeti(c, s, pinta, color) { c.beginPath(); c.roundRect(-s * 0.3, -s * 0.55, s * 0.6, s * 1.1, s * 0.22); pinta(color); },
    burbujita(c, s, pinta, color) {
      circulo(c, 0, 0, s * 0.62); pinta(color);
      circulo(c, s * 0.08, s * 0.1, s * 0.44); pinta(mezcla(color, '#ffffff', 0.45));
    },
  };
  const HALO = {
    zanahoria: '#ffd0a6', huella: '#ffc6e0', azucar: '#ffbfe0', nube: '#b9ddff', copo: '#bfe6ff',
    'cristal-hielo': '#bfe6ff', lupa: '#ffe0a0', estrellita: '#fff0a0', destello: '#fff2b0', corazon: '#ffc2dc',
  };
  const BRILLO = {
    zanahoria: [-0.2, -0.26, 0.1], huella: [-0.16, 0.16, 0.09], azucar: [-0.26, -0.26, 0.1], nube: [-0.14, -0.3, 0.11],
    'cristal-hielo': [-0.15, -0.45, 0.08], lupa: [-0.3, -0.3, 0.1], estrellita: [-0.16, -0.18, 0.1], corazon: [-0.32, -0.3, 0.12],
    gotita: [-0.18, -0.18, 0.13], burbujita: [-0.22, -0.24, 0.13], copo: [-0.06, -0.06, 0.08],
  };

  /* ---------- los dibujos de Yoshi ---------- */
  const imgs = {};   // pieza → Image cargada, null mientras llega, false si no existe
  // la imagen de una pieza de las cositas si ya llegó; la pide la primera vez (las pinta Yoshi)
  function imagen(pieza) {
    if (!(pieza in PP_ATAQUES.piezas)) return null;
    if (pieza in imgs) return imgs[pieza] || null;
    imgs[pieza] = null;
    const im = new Image(), v = typeof VERSION !== 'undefined' ? VERSION : '0';
    im.onload = () => { imgs[pieza] = im; };
    im.onerror = () => { imgs[pieza] = false; };
    im.src = 'img-liso/fx-' + pieza + '.png?v=' + v;
    return null;
  }

  /* ---------- sprites de cada estilo (se pintan una vez y se reutilizan) ---------- */
  const almacen = new Map();
  function lienzo(clave, pinta) {
    let cv = almacen.get(clave);
    if (cv) return cv;
    cv = document.createElement('canvas');
    cv.width = cv.height = SPR.lado;
    const c = cv.getContext('2d');
    c.translate(SPR.lado / 2, SPR.lado / 2);
    pinta(c);
    almacen.set(clave, cv);
    return cv;
  }
  function brilloPieza(c, nombre, s, alfa) {
    const b = BRILLO[nombre]; if (!b) return;
    c.fillStyle = 'rgba(255,255,255,' + alfa + ')';
    elipse(c, b[0] * s, b[1] * s, b[2] * s * 1.25, b[2] * s * 0.85, -0.6); c.fill();
  }
  const rellenoPlano = c => (col, linea) => { if (linea) { c.strokeStyle = col; c.stroke(); } else { c.fillStyle = col; c.fill(); } };
  // la pieza en sí: el dibujo de Yoshi o el de código, con el relleno que diga el estilo
  function pieza(c, d, pinta) {
    if (d.im) c.drawImage(d.im, -SPR.s, -SPR.s, SPR.s * 2, SPR.s * 2); else PIEZAS[d.nombre](c, SPR.s, pinta, d.color);
  }
  function spriteHada(c, d) {
    const s = SPR.s, halo = HALO[d.nombre] || mezcla(d.color, '#ffffff', 0.3);
    const g = c.createRadialGradient(0, 0, s * 0.15, 0, 0, s * 1.65);
    g.addColorStop(0, rgba(halo, 0.75)); g.addColorStop(0.45, rgba(halo, 0.3)); g.addColorStop(1, rgba(halo, 0));
    c.fillStyle = g; circulo(c, 0, 0, s * 1.65); c.fill();
    c.save(); c.shadowColor = 'rgba(255,255,255,1)'; c.shadowBlur = 12; pieza(c, d, rellenoPlano(c)); c.restore();
    brilloPieza(c, d.nombre, s, 0.95);
    if (d.nombre === 'destello' || d.nombre === 'confeti') return;
    c.save(); c.translate(s * 0.66, -s * 0.66); destelloRuta(c, s * 0.28);
    c.shadowColor = '#ffffff'; c.shadowBlur = 6; c.fillStyle = '#ffffff'; c.fill(); c.restore();
  }
  function spriteAcuarela(c, d) {
    const s = SPR.s, halo = HALO[d.nombre] || d.color;
    for (const [x, y, r] of [[-0.3, 0.2, 0.75], [0.35, -0.1, 0.7], [0.05, 0.35, 0.6]]) { c.fillStyle = rgba(halo, 0.16); circulo(c, x * s, y * s, r * s); c.fill(); }
    c.save(); c.globalAlpha = 0.72;
    if (d.im) { c.shadowColor = rgba(halo, 0.9); c.shadowBlur = 8; }
    pieza(c, d, (col, linea) => {
      c.shadowColor = rgba(col, 0.9); c.shadowBlur = 8;
      if (linea) { c.strokeStyle = col; c.stroke(); } else { c.fillStyle = col; c.fill(); c.fill(); }
    });
    c.restore();
    // el pigmento se acumula en los bordes y el centro queda claro
    c.save(); c.globalCompositeOperation = 'source-atop';
    const g = c.createRadialGradient(-s * 0.15, -s * 0.2, s * 0.05, 0, 0, s * 1.05);
    g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(0.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(-64, -64, 128, 128);
    for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(255,255,255,' + azar(0.12, 0.32).toFixed(2) + ')'; circulo(c, azar(-s, s), azar(-s, s), azar(1.5, 4)); c.fill(); }
    c.restore();
    brilloPieza(c, d.nombre, s, 0.6);
  }
  // el sprite de una pieza en un estilo: el dibujo de Yoshi si llegó, el de código si lo hay, y si no una burbujita de `color`
  // (el color ya en pastel: lo aclara quien llama)
  function sprite(estilo, nombre, color) {
    const im = imagen(nombre), dibujo = im || PIEZAS[nombre] ? nombre : 'burbujita';
    const d = { nombre: dibujo, im, color };
    return lienzo(estilo + '|' + nombre + '|' + color + (im ? '|i' : ''), c => (estilo === 'acuarela' ? spriteAcuarela : spriteHada)(c, d));
  }
  // mancha suave: en hada un punto de luz; en acuarela una aguada de bordes difusos
  function manchaHada(c, color) {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 60);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.22, rgba(mezcla(color, '#ffffff', 0.4), 0.85));
    g.addColorStop(0.55, rgba(color, 0.35)); g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g; circulo(c, 0, 0, 60); c.fill();
  }
  function manchaAcuarela(c, color) {
    c.shadowColor = rgba(color, 0.8); c.shadowBlur = 14;
    for (let i = 0; i < 6; i++) { c.fillStyle = rgba(color, 0.3); circulo(c, azar(-14, 14), azar(-14, 14), azar(18, 30)); c.fill(); }
    c.shadowBlur = 0; c.globalCompositeOperation = 'source-atop';
    const g = c.createRadialGradient(-6, -8, 2, 0, 0, 46);
    g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(-64, -64, 128, 128);
  }
  const mancha = (estilo, color) => lienzo(estilo + '|mancha|' + color, c => (estilo === 'acuarela' ? manchaAcuarela : manchaHada)(c, color));
  // pon: dibuja un sprite centrado; tam es el tamaño de la pieza (sx: aplastado de lado, para el confeti que gira)
  function pon(c, spr, x, y, tam, rot, alfa, sx) {
    const lado = SPR.lado * tam / SPR.s;
    if (lado < 0.5 || alfa <= 0) return;
    c.save(); c.globalAlpha = limita(alfa); c.translate(x, y);
    if (rot) c.rotate(rot);
    if (sx !== undefined) c.scale(sx, 1);
    c.drawImage(spr, -lado / 2, -lado / 2, lado, lado);
    c.restore();
  }
  // un aro de luz: en hada doble (color y blanco con resplandor); en acuarela ancho y difuminado
  function aroDeLuz(c, estilo, r, color, grosor, esc) {
    circulo(c, 0, 0, r); c.save();
    if (estilo === 'acuarela') {
      c.shadowColor = rgba(color, 0.9); c.shadowBlur = 9 * esc;
      c.lineWidth = grosor * 1.6; c.strokeStyle = rgba(color, 0.42); c.stroke();
      c.lineWidth = grosor * 0.7; c.strokeStyle = rgba(color, 0.35); c.stroke();
    } else {
      c.shadowColor = '#ffffff'; c.shadowBlur = 12 * esc;
      c.lineWidth = grosor; c.strokeStyle = mezcla(color, '#ffffff', 0.35); c.stroke();
      c.shadowBlur = 0; c.lineWidth = grosor * 0.4; c.strokeStyle = 'rgba(255,255,255,.95)'; c.stroke();
    }
    c.restore();
  }

  /* ---------- la estela y las cositas ---------- */
  function pintaPunto(c, q) {
    const spr = mancha(q.estilo, q.col), N = PP_ATAQUE.FIESTA;
    if (q.estilo === 'acuarela') pon(c, spr, q.x, q.y, 11 * E * (0.7 + 0.3 * q.v) * N.estela, q.rot, 0.3 * Math.min(1, q.v * 1.5));
    else pon(c, spr, q.x, q.y, 10 * E * (0.4 + 0.6 * q.v) * N.estela, 0, 0.6 * q.v);
  }
  // el polvo titila: en hada destellitos; en acuarela gotitas de color y algún brillito
  function pintaPolvo(c, p) {
    const tw = 0.5 + 0.5 * Math.sin((p.max - p.vida) * 16 + p.fase), fuera = Math.min(1, p.vida / 0.5);
    if (p.estilo !== 'acuarela') return pon(c, sprite('hada', 'destello', p.color), p.x, p.y, p.s * (0.55 + 0.45 * tw), 0, fuera * (0.35 + 0.65 * tw));
    if (p.fase < 1.2) return pon(c, sprite('acuarela', 'destello', p.color), p.x, p.y, p.s * 0.8 * (0.6 + 0.4 * tw), 0, fuera * (0.3 + 0.5 * tw));
    const col = mezcla(pastel(p.color), PP_ATAQUE.CONFETI[Math.floor(p.fase) % PP_ATAQUE.CONFETI.length], 0.4);
    return pon(c, sprite('acuarela', 'gotita', col), p.x, p.y, p.s * 1.3, 0, fuera * 0.75);
  }
  function pintaCosita(c, p) {
    if (p.pieza === 'polvo') return pintaPolvo(c, p);
    const edad = p.max - p.vida, ent = Math.min(1, edad / 0.15), fuera = Math.min(1, p.vida / 0.5);
    const sx = p.pieza === 'confeti' ? 0.25 + 0.75 * Math.abs(Math.cos(edad * 7 + p.fase)) : undefined;
    const col = p.pieza === 'confeti' ? p.color : pastel(p.color);   // el confeti ya viene en pastel
    return pon(c, sprite(p.estilo, p.pieza, col), p.x, p.y, p.s * (0.5 + 0.5 * ent), p.rot, fuera, sx);
  }

  /* ---------- los golpes (en unidades del boceto, centrados en la burbuja) ---------- */
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
    // el estallido: una flor de burbujitas pastel con un destello en medio (el confeti sale en la ráfaga)
    flor(c, g) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 1.7)), a = u < 0.5 ? 1 : 1 - (u - 0.5) / 0.5, n = 7, col = mezcla(g.col, '#ffffff', 0.25);
      for (let i = 0; i < n; i++) {
        const ang = g.giro + i * TAU / n + u * 0.5, d = (8 + 26 * e) * g.k, ang2 = ang + Math.PI / n, d2 = d * 0.58;
        pon(c, sprite(g.estilo, 'burbujita', col), Math.cos(ang) * d, Math.sin(ang) * d, (3 + 5 * e) * g.k * (1 - 0.3 * u), 0, a);
        pon(c, sprite(g.estilo, 'burbujita', PP_ATAQUE.CONFETI[i % PP_ATAQUE.CONFETI.length]), Math.cos(ang2) * d2, Math.sin(ang2) * d2, (2 + 3.5 * e) * g.k, 0, a);
      }
      pon(c, sprite(g.estilo, 'destello', g.col), 0, 0, 9 * g.k * Math.sin(Math.min(1, u * 2) * Math.PI), g.giro, a);
    },
    // el zarpazo: un destello de escarcha que se abre como una flor
    escarcha(c, g, esc) {
      const u = g.t / g.dur, e = sube(Math.min(1, u * 2.2)), a = u < 0.5 ? 1 : 1 - (u - 0.5) / 0.5, L = (8 + 24 * e) * g.k;
      c.rotate(g.giro * 0.2 + u * 0.5); c.globalAlpha = a;
      for (let i = 0; i < 6; i++) {
        c.save(); c.rotate(i * TAU / 6); petaloEscarcha(c, g, L, esc); c.restore();
        const ang = -Math.PI / 2 + i * TAU / 6;
        pon(c, sprite(g.estilo, 'destello', g.col), Math.cos(ang) * (L + 5), Math.sin(ang) * (L + 5), 4 * g.k * e, 0, a);
      }
      pon(c, sprite(g.estilo, 'copo', g.col), 0, 0, 8 * g.k * (0.6 + 0.4 * e), 0, a);
    },
    // la chispa: un brillo con estrellitas que giran
    chispa(c, g) {
      const u = g.t / g.dur, a = 1 - u * u;
      pon(c, mancha(g.estilo, '#ffe08a'), 0, 0, 24 * g.k * (0.6 + 0.4 * sube(u)), 0, a * 0.7);
      pon(c, sprite(g.estilo, 'destello', g.col), 0, 0, 24 * g.k * Math.sin(Math.min(1, u * 1.25) * Math.PI), u * 1.2, a);
      for (let i = 0; i < 6; i++) {
        const ang = g.giro + i * TAU / 6 + u * 1.2, d = (10 + 28 * sube(u)) * g.k;
        pon(c, sprite(g.estilo, 'estrellita', g.col), Math.cos(ang) * d, Math.sin(ang) * d, 5 * g.k * (1 - u * 0.4), ang, a);
      }
    },
  };
  function petaloEscarcha(c, g, L, esc) {
    c.beginPath(); c.moveTo(0, -3 * g.k); c.lineTo(L * 0.2, -L * 0.55); c.lineTo(0, -L); c.lineTo(-L * 0.2, -L * 0.55); c.closePath();
    if (g.estilo === 'acuarela') { c.shadowColor = rgba('#8fd0ff', 0.9); c.shadowBlur = 8 * esc; c.fillStyle = rgba('#9fd6ff', 0.45); c.fill(); c.fill(); return; }
    const lg = c.createLinearGradient(0, 0, 0, -L);
    lg.addColorStop(0, '#bfe6ff'); lg.addColorStop(1, '#ffffff');
    c.shadowColor = '#ffffff'; c.shadowBlur = 10 * esc; c.fillStyle = lg; c.fill();
  }
  const DIBUJO_EXTRA = Object.freeze(['flor', 'escarcha', 'chispa']);   // los extras de PP_ATAQUE.EXTRA con dibujo propio ('anillo' es otra onda)
  function pintaGolpe(c, g) {
    if (g.t < 0) return;
    c.save(); c.translate(g.x, g.y); c.scale(E, E);
    const m = c.getTransform();
    GOLPES[g.tipo](c, g, Math.hypot(m.a, m.b));
    c.restore();
  }
  // los golpes de un ataque al llegar a (x, y): el fondo del estilo (resplandor o manchón de aguada), un aro de luz por onda y
  // el dibujo propio de su golpe (flor, escarcha o chispa); `g` es PP_ATAQUE.golpe y `rnd` el azar
  function golpes(x, y, g, ataque, rnd) {
    const col = pastel(ataque.color), base = { x, y, t: 0, k: g.k, col, estilo: ataque.estilo, giro: rnd() * TAU };
    const de = o => Object.assign({}, base, o), out = [];
    if (ataque.estilo === 'acuarela') {
      const manchas = PP_ATAQUE.CONFETI.slice(0, 4).map(cc => ({ col: mezcla(col, cc, 0.5), dx: lerp(-14, 14, rnd()), dy: lerp(-14, 14, rnd()), r: lerp(14, 22, rnd()), rot: rnd() * TAU }));
      out.push(de({ tipo: 'manchon', dur: 1.9, fondo: true, manchas }));
    } else out.push(de({ tipo: 'resplandor', dur: 0.8 }));
    for (const o of g.ondas) out.push(de({ tipo: 'aro', dur: 1, t: -o.retraso, k: o.k }));
    if (DIBUJO_EXTRA.includes(g.extra)) out.push(de({ tipo: g.extra, dur: 1.1 }));
    return out;
  }
  return Object.freeze({ DESVANECE, pastel, golpes, pintaPunto, pintaCosita, pintaGolpe });
})();
