// Fans of Wings · Menús (se pintan sobre el mundo 3D, con el caza volando detrás): el título, el hangar (el caza elegido gira en
// pantalla; flechas para cambiarlo, su ficha con las barras y su truco, DESPEGAR y el botón de la PALANCA) y el parte final de
// la misión. Qué zona se toca lo dice tocarHangar().
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const UI = A.ui, texto = UI.texto;
  const zonas = () => ({ izq: { x: 86, y: 300, r: 46 }, der: { x: UI.W - 86, y: 300, r: 46 }, despegar: { x: UI.W - 220, y: 640, w: 340, h: 76 }, palanca: { x: 24, y: 24, w: 310, h: 58 } });

  UI.titulo = function (g, t) {
    const cx = UI.W / 2;
    texto(g, 'FANS OF WINGS', cx, 150, Math.min(60, UI.W / 20), '#ffe14a');
    texto(g, tr('Los Animales Locos contra la fuerza aérea de Microblizz'), cx, 200, 13, '#fff');
    if (Math.floor(t * 2) % 2) texto(g, tr('Toca para despegar'), cx, 600, 18, '#fff');
    texto(g, tr('Teclado: flechas o WASD · ESPACIO ametralladora · M misil · C cámara'), cx, 690, 9, '#fff');
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

  function flechaBoton(g, z, lado) {
    g.fillStyle = '#0b1a3a'; g.beginPath(); g.arc(z.x, z.y + 7, z.r + 5, 0, 7); g.fill();
    g.fillStyle = '#ffd23c'; g.strokeStyle = '#0b1a3a'; g.lineWidth = 5; g.beginPath(); g.arc(z.x, z.y, z.r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = '#0b1a3a'; g.beginPath(); g.moveTo(z.x + lado * 20, z.y); g.lineTo(z.x - lado * 12, z.y - 22); g.lineTo(z.x - lado * 12, z.y + 22); g.fill();
  }

  function ficha(g, c) {
    const x = 24, y = 500, w = Math.min(760, UI.W - 420), max = { vel: 1.3, escudo: 150, misiles: 8, bombas: 12 };
    g.fillStyle = 'rgba(8,20,48,.82)'; g.fillRect(x, y, w, 200); g.strokeStyle = c.color; g.lineWidth = 5; g.strokeRect(x, y, w, 200);
    texto(g, tr(c.nombre).toUpperCase(), x + 20, y + 40, 18, c.color, 'left');
    texto(g, tr('Piloto') + ': ' + c.piloto, x + 20, y + 68, 9, '#fff', 'left');
    const filas = [['VELOCIDAD', c.vel / max.vel, '#5fe05f'], ['ESCUDO', c.escudo / max.escudo, '#9fe0ff'], ['MISILES', c.misiles / max.misiles, '#fff'], ['BOMBAS', c.bombas / max.bombas, '#ffe14a']];
    filas.forEach(([n, v, color], k) => { texto(g, tr(n), x + 20, y + 102 + k * 24, 8, '#fff', 'left'); UI.barra(g, x + 130, y + 92 + k * 24, 180, 10, v, color); });
    lineas(g, tr(c.texto), w - 370, 9).forEach((l, k) => texto(g, l, x + 340, y + 104 + k * 20, 9, '#fff', 'left'));
  }

  UI.hangar = function (g, AJ, sel, t, mejor) {
    const Z = zonas(), c = AJ.cazas.find((q) => q.id === sel.caza) || AJ.cazas[0], cx = UI.W / 2;
    texto(g, tr('HANGAR DE LA MADRIGUERA'), cx, 56, 20, '#ffe14a');
    texto(g, tr('Elige tu caza'), cx, 88, 10, '#fff');
    if (mejor) texto(g, tr('Mejor misión') + ': ' + mejor, UI.W - 24, 40, 9, '#fff', 'right');
    flechaBoton(g, Z.izq, -1); flechaBoton(g, Z.der, 1);
    ficha(g, c);
    const b = Z.despegar, sube = Math.floor(t * 2) % 2 ? 0 : 3;
    g.fillStyle = '#0b1a3a'; g.fillRect(b.x - b.w / 2 - 5, b.y - b.h / 2 + 4, b.w + 10, b.h + 10);
    g.fillStyle = '#ff8a2a'; g.strokeStyle = '#0b1a3a'; g.lineWidth = 5; g.fillRect(b.x - b.w / 2, b.y - b.h / 2 - sube, b.w, b.h); g.strokeRect(b.x - b.w / 2, b.y - b.h / 2 - sube, b.w, b.h);
    texto(g, tr('DESPEGAR'), b.x, b.y + 10 - sube, 22, '#fff');
    const z = Z.palanca;
    g.fillStyle = sel.normal ? '#3a6cff' : '#2d9a46'; g.strokeStyle = '#0b1a3a'; g.lineWidth = 4; g.fillRect(z.x, z.y, z.w, z.h); g.strokeRect(z.x, z.y, z.w, z.h);
    texto(g, tr('PALANCA') + ': ' + tr(sel.normal ? 'NORMAL' : 'AVIÓN'), z.x + z.w / 2, z.y + 26, 11, '#fff');
    texto(g, tr(sel.normal ? 'Arriba sube el morro' : 'Hacia ti sube el morro'), z.x + z.w / 2, z.y + 46, 7, '#fff');
  };

  // Qué se ha tocado en el hangar: { jugar }, { palanca }, { paso: −1 | 1 } o null.
  UI.tocarHangar = function (p) {
    const Z = zonas(), en = (z) => p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h, redondo = (z) => Math.hypot(p.x - z.x, p.y - z.y) < z.r + 18;
    if (en(Z.palanca)) return { palanca: true };
    if (redondo(Z.izq)) return { paso: -1 };
    if (redondo(Z.der)) return { paso: 1 };
    const b = Z.despegar;
    if (Math.abs(p.x - b.x) <= b.w / 2 + 10 && Math.abs(p.y - b.y) <= b.h / 2 + 10) return { jugar: true };
    return null;
  };

  const POR_QUE = { derribado: 'Los becarios lo celebran con café. Vuelve a intentarlo.', estrellado: '¡Te has estrellado! Vigila la altura y tira de la palanca a tiempo.',
    combustible: 'Sin combustible. Los enemigos derribados sueltan bidones: recógelos.' };

  UI.final = function (g, e, t, record) {
    const bien = e.fin === 'cumplida', cx = UI.W / 2;
    g.fillStyle = 'rgba(8,20,48,.72)'; g.fillRect(0, 0, UI.W, 720);
    texto(g, tr(bien ? '¡MISIÓN CUMPLIDA!' : 'MISIÓN FALLIDA'), cx, 130, 38, bien ? '#5fe05f' : '#ff5a3a');
    texto(g, tr(bien ? 'Cielo despejado. La base de Microblizz será lo siguiente.' : (POR_QUE[e.finMotivo] || POR_QUE.derribado)), cx, 180, 10, '#fff');
    const filas = [[tr('Aviones derribados'), e.derribos], [tr('Puntería'), Math.round((e.disparos ? e.aciertos / e.disparos : 0) * 100) + '%'], [tr('Bonus de escudo y puntería'), e.bonus || 0]];
    filas.forEach(([n, v], k) => { texto(g, n, cx - 40, 290 + k * 46, 12, '#fff', 'right'); texto(g, v, cx + 40, 290 + k * 46, 12, '#fff', 'left'); });
    texto(g, tr('PUNTOS'), cx - 40, 460, 18, '#ffe14a', 'right'); texto(g, e.puntos, cx + 40, 460, 18, '#ffe14a', 'left');
    if (record) texto(g, tr('¡NUEVO RÉCORD!'), cx, 530, 16, Math.floor(t * 4) % 2 ? '#fff' : '#ff8a2a');
    if (e.finT > 1.2 && Math.floor(t * 2) % 2) texto(g, tr('Toca para volver al hangar'), cx, 630, 13, '#fff');
  };
})(WINGS);
