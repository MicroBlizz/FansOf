// Fans of Air · Menús: la pantalla de título, el hangar de La Madriguera (tres tarjetas de caza con su piloto, sus barras y su
// habilidad, y el botón DESPEGAR) y la pantalla de misión cumplida o fallida con el resumen. Qué zona se toca lo dice tocarHangar().
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const UI = A.ui, texto = UI.texto;
  const TARJETA = (i) => ({ x: 70 + i * 390, y: 112, w: 360, h: 440 });
  const DESPEGAR = { x: 640, y: 628, w: 340, h: 64 };

  UI.titulo = function (g, t, img) {
    if (img.cielo) g.drawImage(img.cielo, -128, -40, 1536, 800); else { g.fillStyle = '#1b2a6e'; g.fillRect(0, 0, 1280, 720); }
    g.fillStyle = 'rgba(10,12,30,.45)'; g.fillRect(0, 0, 1280, 720);
    texto(g, 'FANS OF AIR', 640, 230, 56, '#ffe14a');
    texto(g, tr('Los Animales Locos contra la fuerza aérea de Microblizz'), 640, 300, 15, '#fff');
    texto(g, tr('Despeja el cielo y bombardea la Torre del CEO'), 640, 340, 11, '#ff8a2a');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para despegar'), 640, 460, 16, '#fff');
    texto(g, tr('Teclado: flechas o WASD · ESPACIO ametralladora · M misil / bomba'), 640, 600, 10, '#ccc');
  };

  // Parte un texto en líneas que quepan en `ancho` con la letra de `tam` píxeles.
  function lineas(g, t, ancho, tam) {
    g.font = tam + "px 'Press Start 2P', monospace";
    const out = []; let linea = '';
    for (const palabra of String(t).split(' ')) {
      const prueba = linea ? linea + ' ' + palabra : palabra;
      if (g.measureText(prueba).width > ancho && linea) { out.push(linea); linea = palabra; } else linea = prueba;
    }
    if (linea) out.push(linea);
    return out;
  }

  function tarjeta(g, c, i, elegido, img, t) {
    const z = TARJETA(i), max = { vel: 1.3, escudo: 150, misiles: 8, bombas: 12 };
    g.fillStyle = elegido ? 'rgba(40,30,20,.92)' : 'rgba(10,12,30,.82)'; g.fillRect(z.x, z.y, z.w, z.h);
    g.strokeStyle = elegido ? '#ff8a2a' : '#3a4a6a'; g.lineWidth = elegido ? 6 : 3; g.strokeRect(z.x, z.y, z.w, z.h);
    const r = img['r-' + c.id];
    if (r) { const h = 96, w = r.width * h / r.height; g.drawImage(r, z.x + 16, z.y + 14, w, h); }
    texto(g, tr(c.nombre).toUpperCase(), z.x + 124, z.y + 44, 12, c.color, 'left');
    texto(g, tr('Piloto') + ': ' + c.piloto, z.x + 124, z.y + 72, 8, '#ccc', 'left');
    const avion = img['hangar-' + c.id] || img['caza-' + c.id];
    if (avion) { const w = 230, h = w * avion.height / avion.width, sube = elegido ? Math.sin(t * 3) * 6 : 0; g.drawImage(avion, z.x + z.w / 2 - w / 2, z.y + 125 + sube - h / 2 + 50, w, h); }
    const filas = [['VELOCIDAD', c.vel / max.vel, '#5fe05f'], ['ESCUDO', c.escudo / max.escudo, '#9fe0ff'], ['MISILES', c.misiles / max.misiles, '#fff'], ['BOMBAS', c.bombas / max.bombas, '#ffe14a']];
    filas.forEach(([n, v, color], k) => { texto(g, tr(n), z.x + 20, z.y + 262 + k * 26, 8, '#ccc', 'left'); UI.barra(g, z.x + 130, z.y + 251 + k * 26, 200, 10, v, color); });
    lineas(g, tr(c.texto), z.w - 40, 8).forEach((l, k) => texto(g, l, z.x + 20, z.y + 376 + k * 18, 8, '#fff', 'left'));
  }

  UI.hangar = function (g, AJ, sel, img, t, mejor) {
    if (img.hangar) g.drawImage(img.hangar, 0, 0, 1280, 720); else { g.fillStyle = '#2a1e12'; g.fillRect(0, 0, 1280, 720); }
    g.fillStyle = 'rgba(10,12,30,.35)'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr('HANGAR DE LA MADRIGUERA'), 640, 50, 22, '#ffe14a');
    texto(g, tr('Elige tu caza'), 640, 84, 11, '#fff');
    if (mejor) texto(g, tr('Mejor misión') + ': ' + mejor, 1264, 40, 9, '#ccc', 'right');
    AJ.cazas.forEach((c, i) => tarjeta(g, c, i, c.id === sel.caza, img, t));
    const b = DESPEGAR, brilla = Math.floor(t * 2) % 2;
    g.fillStyle = brilla ? '#ff9a3a' : '#ff8a2a'; g.strokeStyle = '#111'; g.lineWidth = 5;
    g.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h); g.strokeRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    texto(g, tr('DESPEGAR'), b.x, b.y + 8, 20, '#fff');
    texto(g, tr('Esquiva moviéndote · Mantén la retícula sobre un enemigo para fijarlo · Luego, bombardea la base'), 640, 700, 8, '#ccc');
  };

  UI.tocarHangar = function (p, AJ) {
    const dentro = (z) => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h;
    const i = AJ.cazas.findIndex((c, k) => dentro(TARJETA(k)));
    if (i >= 0) return { caza: AJ.cazas[i].id };
    const b = DESPEGAR;
    if (Math.abs(p.x - b.x) <= b.w / 2 + 10 && Math.abs(p.y - b.y) <= b.h / 2 + 10) return { jugar: true };
    return null;
  };

  UI.final = function (g, e, t, record) {
    const bien = e.fin === 'cumplida', AJ = e.aj;
    g.fillStyle = 'rgba(10,12,30,.82)'; g.fillRect(0, 0, 1280, 720);
    texto(g, tr(bien ? '¡MISIÓN CUMPLIDA!' : 'MISIÓN FALLIDA'), 640, 150, 40, bien ? '#5fe05f' : '#ff5a3a');
    texto(g, tr(bien ? 'La Torre del CEO ha caído. Microblizz «replanteará su estrategia».' : 'Los becarios lo celebran con café. Vuelve a intentarlo.'), 640, 200, 10, '#fff');
    const filas = [[tr('Derribos'), e.derribos], [tr('Objetivos destruidos'), e.destruidos + '/' + AJ.tierra.mapa.length],
      [tr('Puntería'), Math.round((e.disparos ? e.aciertos / e.disparos : 0) * 100) + '%'], [tr('Bonus de escudo y puntería'), e.bonus || 0]];
    filas.forEach(([n, v], k) => { texto(g, n, 560, 290 + k * 40, 12, '#ccc', 'right'); texto(g, v, 720, 290 + k * 40, 12, '#fff', 'left'); });
    texto(g, tr('PUNTOS'), 560, 470, 16, '#ffe14a', 'right'); texto(g, e.puntos, 720, 470, 16, '#ffe14a', 'left');
    if (record) texto(g, tr('¡NUEVO RÉCORD!'), 640, 530, 16, Math.floor(t * 4) % 2 ? '#fff' : '#ff8a2a');
    if (e.finT > 1.2 && Math.floor(t * 2) % 2) texto(g, tr('Toca para volver al hangar'), 640, 620, 13, '#fff');
  };
})(AIR);
