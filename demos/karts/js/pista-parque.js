// Fans of Karts · MUNDO 1 · MICROBLIZZ-LAND: el parque temático de la empresa. Cada atracción cuesta una ficha, y las fichas solo se
// compran en packs de 1.200. Asfalto de colores, rampas de montaña rusa que te hacen saltar y tacitas giratorias que se cruzan. Fácil.
'use strict';

PISTAS.push({
  id: 'parque', mundo: 1, nombre: 'Microblizz-Land', lema: 'El parque más feliz del mundo. La felicidad se vende aparte, en packs de 1.200 fichas.', dificultad: 1, musica: 'memes', color: '#ff7ab8',
  puntos: [[480, 140], [700, 145], [850, 235], [870, 390], [750, 470], [610, 400], [480, 430], [440, 560], [560, 650], [760, 640], [880, 700], [870, 840], [700, 900], [500, 880], [320, 870],
    [170, 790], [130, 630], [230, 510], [150, 370], [190, 230], [320, 150]],
  ancho: 70, margen: 40, borde: 'muro',
  tramos: [{ deU: 5.3, aU: 6.7, ancho: 60, suave: 0.03 }],      // la cola de la montaña rusa
  lejos: ['#6ab04a', '#62a644'],
  voladores: [{ id: 'globoconejo', s: 300, y: 14, vel: 4, tam: 0.38 }],
  atajos: [[8.38, 12.14, 26]],
  tema: (() => {
    const [p1, p2, raya, borde, k1, k2, c1, c2, c3, flor, v1, v2, f1, f2, f3] = C32('#8a7aa8', '#8274a0', '#ffe14d', '#ffffff', '#ff5c8a', '#ffe14d', '#5cbf4a', '#52b444', '#68c856', '#ff9ad0', '#f4f4f8', '#ff5c8a', '#6ab04a', '#62a644', '#7ac25a');
    const cesped = grano([c1, c1, c2, c3]);
    return {
      pista: (x, y, m, i, lado, v) => {
        if (m > -3) return borde;
        if (m + v.ancho / 2 < 1.3 && ((i >> 1) & 1)) return raya;
        const r = ruido(x >> 3, y >> 3);
        return r < 0.04 ? u32('#ff9ad0') : r > 0.96 ? u32('#5ef2f0') : ruido(x, y) < 0.5 ? p1 : p2;      // asfalto con confeti pisado
      },
      bordillo: (x, y, m, i) => ((i >> 1) & 1 ? k1 : k2),
      lento: (x, y) => (ruido(x, y) < 0.02 ? flor : cesped(x >> 1, y >> 1)),
      muro: (x, y, m) => ((((x + y) >> 2) & 1) ? v1 : v2),                       // valla de rayas de feria
      vacio: () => f1,
      fuera: (x, y) => (ruido(x >> 2, y >> 2) < 0.08 ? f3 : ((x >> 5) + (y >> 5)) & 1 ? f1 : f2),
      atajo: (x, y) => (ruido(x >> 1, y >> 1) < 0.18 ? flor : ((x + y) >> 2) & 1 ? c1 : c3),          // los parterres (pisar el césped: prohibido)
    };
  })(),
  cielo: {
    colores: ['#4a9be6', '#7ab8f0', '#b0d8f8', '#ffe8f4'], niebla: '#f0dcf0', filas: 10, viento: 4, semilla: 55,
    atras(x, az) {
      for (let i = 0; i < 9; i++) nubePx(x, az() * CIELO_W, 8 + az() * 24, 12 + az() * 18, '#ffffff', '#c8dcf4');
      for (let i = 0; i < 18; i++) { const a = az() * CIELO_W, b = 6 + az() * 30, c = ['#ff3348', '#ffcb3d', '#22b8f0', '#5ef27a'][i & 3]; elipsePx(x, a, b, 2, 3, c); rectPx(x, a, b + 3, 1, 4, '#f4f4f8'); }   // globos sueltos
    },
    delante(x, az) {
      // la montaña rusa, una noria lejana, el castillo del parque y casetas
      for (let i = 0; i < CIELO_W; i++) { const h = 14 + Math.sin(i / 40) * 8 + Math.sin(i / 13) * 3; if (i % 3 === 0) rectPx(x, i, HZ - h, 1, h, '#c35cff'); rectPx(x, i, HZ - h - 1, 1, 2, '#ff5c8a'); }
      for (const c of [180, 700]) { for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; rectPx(x, c + Math.cos(a) * 14, HZ - 24 + Math.sin(a) * 14, 2, 2, k & 1 ? '#ffcb3d' : '#22b8f0'); } rectPx(x, c - 6, HZ - 24, 2, 24, '#f4f4f8'); rectPx(x, c + 5, HZ - 24, 2, 24, '#f4f4f8'); }
      rectPx(x, 440, HZ - 22, 40, 22, '#ffd0ea'); for (const t of [440, 456, 474]) { rectPx(x, t, HZ - 32, 6, 12, '#ffd0ea'); montePx(x, t + 3, HZ - 32, 5, 7, '#7c3aed'); } rectPx(x, 456, HZ - 10, 8, 10, '#a01050');
      for (let i = 0; i < 14; i++) { const a = i * 74 + az() * 30; if (a > 420 && a < 500) continue; rectPx(x, a, HZ - 8, 14, 8, '#f4f4f8'); montePx(x, a + 7, HZ - 8, 9, 5, i & 1 ? '#ff5c8a' : '#22b8f0'); }
    },
  },
  pinta(P) {
    turboEn(P, 0.55, 0); turboEn(P, 7.6, -12); turboEn(P, 12.5, 0); turboEn(P, 18.6, 0, 20);
    rampaEn(P, 3.4, 10); rampaEn(P, 9.6, 10); rampaEn(P, 15.6, 10);       // las subidas de la montaña rusa: saltas sin querer
    const helado = ['#ffd0ea', '#ff9ad0', '#ffffff'];
    manchaEn(P, 2.4, 12, 9, 6, S_CHARCO, helado, 1); manchaEn(P, 8.6, -12, 9, 6, S_CHARCO, helado, 2); manchaEn(P, 14.3, 10, 9, 6, S_CHARCO, helado, 3); manchaEn(P, 19.4, -10, 9, 6, S_CHARCO, helado, 4);
  },
  cosas(P) {
    const l = [];
    regalosEn(P, 1.8); regalosEn(P, 8.1); regalosEn(P, 14.8);
    monedasPor(P, [[1.0, 5, 0], [3.6, 3, 0, 15], [5.8, 4, 0], [9.8, 3, 0, 15], [11.2, 5, -12], [13.4, 4, 12], [15.8, 3, 0, 15], [17.6, 4, -12], [20.0, 5, 0]]);
    adornosPor(P, l, ['globos', 'puesto', 'tiovivo', 'globos', 'puesto', 'planta'], 0.4, 20.6, 0.62, 14, 24, 2);
    adorno(P, l, 'noria', 6.2, 34); adorno(P, l, 'noria', 17.1, -34);
    movilEn(P, l, 'taza', 4.6, 22, 5, 0); movilEn(P, l, 'taza', 11.9, 24, 6, 1.5); movilEn(P, l, 'taza', 16.6, 22, 5.5, 3);
    cartelesPor(P, l, [[['BIENVENIDO A', 'MICROBLIZZ-LAND'], 0.75, 26, '#ff5c8a', '#ffffff'], [['FICHAS', '1.200 X 99 €'], 2.9, -24, '#22212c', '#ffcb3d'],
      [['COLA: 3 H'], 5.6, 24, '#22212c', '#ff5c8a'], [['PROHIBIDO', 'DIVERTIRSE GRATIS'], 8.9, -24, '#e63946', '#ffffff'], [['FAST PASS', 'PREMIUM'], 12.0, 26, '#ffcb3d', '#22212c'],
      [['SALIDA POR', 'LA TIENDA'], 16.3, 24, '#7c3aed', '#ffffff'], [['SOON™'], 19.0, -24, '#22212c', '#ffcb3d'], [['PROHIBIDO PISAR', 'EL CÉSPED'], 8.2, -26, '#3fae4a', '#ffffff']]);
    return l;
  },
});
