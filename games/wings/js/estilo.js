// Fans of Wings · El estilo militar en pixel art de los menús y del HUD (docs/wings/MENUS.md): las piezas con las que se
// pintan todas las pantallas. Paneles azul oscuro con borde cian y esquinas en escalón, cabeceras cian, opciones (la elegida en
// ámbar), botones ochavados, barras de segmentos, filas de datos, franjas de aviso, sellos, el emblema del escuadrón, el mapa
// táctico, la barra de ayuda de abajo y las líneas de barrido. Todo en la pantalla lógica de 720 de alto.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const E = A.estilo = {};
  const C = E.C = { cian: '#5fe3ff', amb: '#ffb020', nar: '#ff8a1c', azul: '#0c2350', fondo: '#06122a', claro: '#bfe9ff', blanco: '#e8f6ff',
    rojo: '#ff5a3a', verde: '#6dff8a', borde: '#2a5c96', panel: 'rgba(8,26,62,.86)', isla: '#1f8a45' };
  const F = (n) => n + "px 'Press Start 2P', monospace";
  const SIN_TILDE = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };

  // En mayúsculas y sin tildes, como en las recreativas (la letra de píxeles no las dibuja bien).
  E.sinTilde = (s) => String(s).replace(/[ÁÉÍÓÚ]/g, (c) => SIN_TILDE[c]);
  E.may = (s) => E.sinTilde(String(s).toUpperCase());

  // Texto plano; con `sombra`, una sombra dura abajo a la derecha.
  E.t = function (g, s, x, y, tam, color, alin, sombra) {
    g.font = F(tam); g.textAlign = alin || 'left'; g.textBaseline = 'alphabetic';
    if (sombra) { const d = Math.max(2, Math.round(tam / 9)); g.fillStyle = sombra; g.fillText(s, x + d, y + d); }
    g.fillStyle = color; g.fillText(s, x, y);
  };
  E.ancho = (g, s, tam) => { g.font = F(tam); return g.measureText(s).width; };

  // Parte un texto en líneas que quepan en `ancho` con la letra de `tam` píxeles.
  E.lineas = function (g, s, ancho, tam) {
    g.font = F(tam);
    const out = []; let linea = '';
    for (const palabra of String(s).split(' ')) {
      const prueba = linea ? linea + ' ' + palabra : palabra;
      if (g.measureText(prueba).width > ancho && linea) { out.push(linea); linea = palabra; } else linea = prueba;
    }
    if (linea) out.push(linea);
    return out;
  };

  // El contorno de un panel: esquinas de arriba a la derecha y de abajo a la izquierda cortadas en tres escalones.
  function escalon(g, x, y, w, h, p) {
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x + w - 3 * p, y);
    for (let i = 3; i > 0; i--) { g.lineTo(x + w - i * p, y + (4 - i) * p); g.lineTo(x + w - (i - 1) * p, y + (4 - i) * p); }
    g.lineTo(x + w, y + h); g.lineTo(x + 3 * p, y + h);
    for (let i = 3; i > 0; i--) { g.lineTo(x + i * p, y + h - (4 - i) * p); g.lineTo(x + (i - 1) * p, y + h - (4 - i) * p); }
    g.closePath();
  }

  // Un panel con su cabecera cian (título a la izquierda y dato a la derecha). Devuelve la y donde empieza el contenido.
  E.panel = function (g, x, y, w, h, cab, der) {
    escalon(g, x, y, w, h, 7);
    g.fillStyle = C.panel; g.fill(); g.strokeStyle = C.cian; g.lineWidth = 3; g.stroke();
    if (!cab) return y + 14;
    g.save(); escalon(g, x, y, w, h, 7); g.clip();
    g.fillStyle = C.cian; g.fillRect(x, y, w, 32);
    g.restore();
    E.t(g, cab, x + 14, y + 23, 12, C.fondo);
    if (der) E.t(g, der, x + w - 30, y + 23, 12, C.fondo, 'right');
    return y + 32;
  };

  // Una barra de n segmentos cuadrados, llenos hasta v (0 a 1).
  E.segs = function (g, x, y, n, v, color, tam) {
    const s = tam || 14, llenos = Math.round(Math.max(0, Math.min(1, v)) * n);
    for (let i = 0; i < n; i++) {
      const px = x + i * (s + 4);
      if (i < llenos) { g.fillStyle = color; g.fillRect(px, y, s, s); continue; }
      g.fillStyle = C.azul; g.fillRect(px, y, s, s); g.strokeStyle = C.borde; g.lineWidth = 1.5; g.strokeRect(px + 1, y + 1, s - 2, s - 2);
    }
    return n * (s + 4);
  };

  // Una fila de datos: nombre a la izquierda, valor a la derecha y una línea fina debajo.
  E.fila = function (g, x, y, w, nombre, valor, color, tam) {
    const t = tam || 12;
    E.t(g, nombre, x, y, t, C.claro);
    if (valor != null) E.t(g, String(valor), x + w, y, t, color || C.blanco, 'right');
    g.fillStyle = 'rgba(42,92,150,.7)'; g.fillRect(x, y + 9, w, 2);
  };

  // Una opción de menú. z = { x, y, w, h }; elegida, en ámbar con sombra dura y las flechas; peligro, en rojo.
  E.opcion = function (g, z, etiqueta, sub, elegida, peligro) {
    const tam = Math.min(19, Math.floor((z.w - 60) / Math.max(8, etiqueta.length + (sub ? sub.length * 0.6 + 3 : 2))), Math.floor(z.h * 0.42));
    if (elegida) {
      g.fillStyle = C.fondo; g.fillRect(z.x + 7, z.y + 7, z.w, z.h);
      g.fillStyle = C.amb; g.fillRect(z.x, z.y, z.w, z.h);
      g.fillStyle = '#fff'; g.fillRect(z.x, z.y, 7, z.h);
      E.t(g, '>>', z.x + z.w - 18, z.y + z.h / 2 + 8, 15, C.fondo, 'right');
    } else {
      g.fillStyle = 'rgba(12,35,80,.72)'; g.fillRect(z.x, z.y, z.w, z.h);
      g.fillStyle = peligro ? C.rojo : C.borde; g.fillRect(z.x, z.y, 7, z.h);
    }
    const color = elegida ? C.fondo : peligro ? C.rojo : C.claro;
    E.t(g, etiqueta, z.x + 26, z.y + z.h / 2 + tam / 2, tam, color);
    if (sub) E.t(g, sub, z.x + z.w - (elegida ? 62 : 28), z.y + z.h / 2 + 5, Math.max(10, Math.round(tam * 0.58)), color, 'right');
  };

  // Un botón con dos esquinas en chaflán: el principal, naranja con borde blanco; el secundario, azul oscuro con borde cian.
  E.boton = function (g, z, etiqueta, principal, tam, pulsa) {
    const p = 14, baja = pulsa ? 3 : 0, x = z.x, y = z.y + baja;
    const forma = (dx, dy) => { g.beginPath(); g.moveTo(x + dx + p, y + dy); g.lineTo(x + dx + z.w, y + dy); g.lineTo(x + dx + z.w, y + dy + z.h - p); g.lineTo(x + dx + z.w - p, y + dy + z.h); g.lineTo(x + dx, y + dy + z.h); g.lineTo(x + dx, y + dy + p); g.closePath(); };
    forma(7 - baja, 7 - baja); g.fillStyle = C.fondo; g.fill();
    forma(0, 0); g.fillStyle = principal ? C.nar : C.azul; g.fill();
    g.strokeStyle = principal ? '#fff' : C.cian; g.lineWidth = 3; g.stroke();
    E.t(g, etiqueta, x + z.w / 2, y + z.h / 2 + tam / 2, tam, principal ? C.fondo : C.cian, 'center');
  };

  // Un botón táctil ochavado (b = { x, y, r }) que se hunde al pulsarlo.
  E.ocho = function (g, b, color, etiqueta, tam) {
    const baja = b.pulsado != null ? 5 : 0;
    const forma = (r, dy) => { g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(b.x + Math.cos(a) * r, b.y + dy + Math.sin(a) * r); } g.closePath(); };
    forma(b.r + 4, 7); g.fillStyle = 'rgba(6,18,42,.75)'; g.fill();
    forma(b.r, baja); g.fillStyle = color; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
    if (etiqueta) E.t(g, etiqueta, b.x, b.y + baja + tam / 2, tam, C.fondo, 'center');
  };

  // Franja de aviso a rayas ámbar y negras.
  E.franja = function (g, x, y, w, h) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = C.fondo; g.fillRect(x, y, w, h);
    g.fillStyle = C.amb;
    for (let i = -h; i < w + h; i += 22) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + h, y); g.lineTo(x + i + h + 11, y); g.lineTo(x + i + 11, y + h); g.fill(); }
    g.restore();
  };

  // La línea cian con su remate grueso a la derecha.
  E.linea = function (g, x, y, w) { g.fillStyle = C.cian; g.fillRect(x, y, w, 3); g.fillRect(x + w - 52, y - 5, 52, 13); };

  // Un sello rojo girado, de tampón.
  E.sello = function (g, s, x, y, giro, tam) {
    const t = tam || 12, w = E.ancho(g, s, t) + 28;
    g.save(); g.translate(x, y); g.rotate(giro); g.globalAlpha = 0.85;
    g.strokeStyle = C.rojo; g.lineWidth = 3; g.strokeRect(-w / 2, -t - 8, w, t * 2 + 12);
    E.t(g, s, 0, t / 2 - 1, t, C.rojo, 'center');
    g.restore();
  };

  // El emblema del escuadrón: un escudo con el conejo y dos alas. (x, y) = arriba a la izquierda; k = tamaño de cada píxel.
  E.emblema = function (g, x, y, k) {
    const r = (c, px, py, w, h) => { g.fillStyle = c; g.fillRect(x + px * k, y + py * k, w * k, h * k); };
    g.fillStyle = C.cian; g.beginPath(); g.moveTo(x + 3 * k, y); g.lineTo(x + 21 * k, y); g.lineTo(x + 21 * k, y + 14 * k); g.lineTo(x + 12 * k, y + 23 * k); g.lineTo(x + 3 * k, y + 14 * k); g.fill();
    g.fillStyle = C.azul; g.beginPath(); g.moveTo(x + 5 * k, y + 2 * k); g.lineTo(x + 19 * k, y + 2 * k); g.lineTo(x + 19 * k, y + 13 * k); g.lineTo(x + 12 * k, y + 20 * k); g.lineTo(x + 5 * k, y + 13 * k); g.fill();
    r(C.amb, 0, 5, 3, 2); r(C.amb, 0, 7, 2, 2); r(C.amb, 21, 5, 3, 2); r(C.amb, 22, 7, 2, 2);   // las alas
    r(C.amb, 4, 3, 16, 2);
    r('#fff', 9, 6, 2, 6); r('#fff', 13, 6, 2, 6); r('#fff', 8, 11, 8, 6);   // orejas y cara
    r(C.fondo, 10, 13, 1, 1); r(C.fondo, 13, 13, 1, 1); r(C.nar, 11, 15, 2, 1);
  };

  // El mapa táctico: rejilla, islas, enemigos en rojo, tu caza (triángulo cian que apunta adonde vuelas) y la ruta en ámbar.
  // d = { pos: { x, z } (metros, z norte), rumbo, enemigos: [{ x, z }], zona: { x, z } o null, alcance (metros a cada lado) }
  E.mapa = function (g, x, y, w, h, d) {
    const k = w / (2 * d.alcance), cx = x + w * 0.3, cy = y + h * 0.62, MU = A.mundo;
    const aPantalla = (dx, dz) => [cx + dx * k, cy - dz * k];
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = C.fondo; g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(42,92,150,.55)';
    for (let i = 0; i <= w; i += 35) g.fillRect(x + i, y, 1.5, h);
    for (let i = 0; i <= h; i += 35) g.fillRect(x, y + i, w, 1.5);
    for (const i of (MU ? MU.islas : [])) {   // las islas están en coordenadas de dibujo (su z es el sur)
      const dx = MU.cerca(i.x, d.pos.x) - d.pos.x, dz = -(MU.cerca(i.z, -d.pos.z) + d.pos.z), [px, py] = aPantalla(dx, dz), r = Math.max(6, 520 * i.e * k);
      g.fillStyle = C.isla; g.strokeStyle = '#4de07a'; g.lineWidth = 2;
      g.fillRect(px - r, py - r * 0.6, r * 2, r * 1.2); g.fillRect(px - r * 0.5, py - r, r, r * 2);
      g.strokeRect(px - r, py - r * 0.6, r * 2, r * 1.2);
    }
    const objetivo = d.zona || d.enemigos[0];
    if (objetivo) {
      const [ox, oy] = aPantalla(objetivo.x - d.pos.x, objetivo.z - d.pos.z);
      g.strokeStyle = C.amb; g.lineWidth = 3; g.setLineDash([9, 8]); g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo((cx + ox) / 2, Math.max(cy, oy) + 18, ox, oy); g.stroke();
      if (d.zona) { g.strokeStyle = C.rojo; g.lineWidth = 2; g.setLineDash([6, 5]); g.strokeRect(ox - 48, oy - 42, 96, 84); E.t(g, d.zona.nombre, ox - 46, oy - 50, 9, C.rojo); }
      g.setLineDash([]);
    }
    g.fillStyle = C.rojo;
    for (const en of d.enemigos) { const [px, py] = aPantalla(en.x - d.pos.x, en.z - d.pos.z); g.beginPath(); g.moveTo(px, py - 8); g.lineTo(px + 8, py); g.lineTo(px, py + 8); g.lineTo(px - 8, py); g.fill(); }
    g.translate(cx, cy); g.rotate(d.rumbo || 0);
    g.fillStyle = C.cian; g.beginPath(); g.moveTo(0, -11); g.lineTo(9, 9); g.lineTo(-9, 9); g.fill();
    g.restore();
  };

  // La barra de ayuda de abajo. ayudas = [[tecla, texto]…] (la tecla va en un recuadro cian); der = texto a la derecha.
  E.pie = function (g, W, ayudas, der) {
    const y = 682;
    g.fillStyle = 'rgba(6,18,42,.95)'; g.fillRect(0, y, W, 38); g.fillStyle = C.cian; g.fillRect(0, y, W, 3);
    let x = 26;
    for (const [tecla, texto] of ayudas) {
      const w = E.ancho(g, tecla, 10) + 14;
      g.fillStyle = C.cian; g.fillRect(x, y + 11, w, 20);
      E.t(g, tecla, x + 7, y + 26, 10, C.fondo);
      E.t(g, texto, x + w + 8, y + 26, 10, C.claro);
      x += w + 8 + E.ancho(g, texto, 10) + 22;
    }
    if (der) E.t(g, der, W - 26, y + 26, 10, C.cian, 'right');
  };

  // Las dos esquinas de encuadre de arriba y las líneas de barrido por encima de todo.
  E.marco = function (g, W) {
    g.strokeStyle = C.cian; g.lineWidth = 3;
    g.beginPath(); g.moveTo(16, 44); g.lineTo(16, 16); g.lineTo(44, 16); g.moveTo(W - 44, 16); g.lineTo(W - 16, 16); g.lineTo(W - 16, 44); g.stroke();
  };
  E.barrido = function (g, W) { g.fillStyle = 'rgba(6,18,42,.16)'; for (let y = 5; y < 720; y += 7) g.fillRect(0, y, W, 2); };

  // Oscurece el mundo de detrás: 'lado' deja ver el caza a la derecha (título y hangar); 'todo', la pantalla entera.
  E.tinte = function (g, W, modo) {
    if (modo === 'todo') { g.fillStyle = 'rgba(6,18,42,.62)'; g.fillRect(0, 0, W, 720); return; }
    const gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, 'rgba(6,18,42,.9)'); gr.addColorStop(0.36, 'rgba(6,18,42,.55)'); gr.addColorStop(0.62, 'rgba(6,18,42,.1)'); gr.addColorStop(1, 'rgba(6,18,42,.4)');
    g.fillStyle = gr; g.fillRect(0, 0, W, 720);
  };

  E.reloj = (t) => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(Math.floor(t % 60)).padStart(2, '0');
  E.dentro = (p, z) => p.x >= z.x - 6 && p.x <= z.x + z.w + 6 && p.y >= z.y - 6 && p.y <= z.y + z.h + 6;
})(WINGS);
