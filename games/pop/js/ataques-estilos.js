// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, los dos estilos cozy de dibujo (tarea #160, ADR 197, revisión de Pepins del 21-11-2026:
// «el reborde negro rompe la magia»). Nada lleva contorno oscuro. Cada compañero pinta siempre en su estilo (PP_ATAQUE.de):
// · 'hada' (brillo de hada): halo pastel, resplandor blanco suave, destellitos de cuatro puntas, polvo que titila y corazoncitos.
// · 'acuarela': piezas translúcidas con el color corrido a los bordes y el centro claro, manchas de aguada que se secan despacio.
// Las piezas son sprites cacheados por estilo|pieza|color: el dibujo de Yoshi (img-liso/fx-<pieza>.png) con el halo del estilo
// si ya llegó; si no, su dibujo por código (js/ataques-piezas.js, las 44) y, si la pieza no tiene dibujo, una burbujita del color
// de la estela. Copia el boceto aprobado (boceto https://claude.ai/artifact/3VYoR6TzMupFhxK5yHwvnn). Los golpes están en
// js/ataques-golpes.js. Lo usa js/ataques-fx.js; solo se llama con el flag 'ataques-companeros' abierto.
'use strict';
const PP_ATAQUE_ESTILO = (() => {
  const E = 1.7;                                  // E: píxeles del juego por píxel del boceto
  const SPR = { lado: 128, s: 36 };               // cada sprite: un lienzo de 128 con la pieza de tamaño 36
  const DESVANECE = Object.freeze({ hada: 1.6, acuarela: 0.9 });   // lo que se apaga por segundo un punto de la estela
  const { PIEZAS, HALO, BRILLO, mezcla, rgba, circulo, elipse, destelloRuta } = PP_ATAQUE_PIEZAS;
  const limita = v => Math.max(0, Math.min(1, v));
  const pastel = col => mezcla(col, '#ffffff', 0.3);   // el color de la estela, aclarado para que sea cozy
  const azar = (a, b) => a + Math.random() * (b - a);  // solo para la textura de los sprites (se pintan una vez)

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

  return Object.freeze({ DESVANECE, pastel, mezcla, sprite, mancha, pon, aroDeLuz, pintaPunto, pintaCosita });
})();
