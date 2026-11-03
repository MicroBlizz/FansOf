// Fans Of Pets · MANIQUÍ 3D: las medidas de cada criatura sobre su dibujo original (en píxeles del lienzo de 640) y el esqueleto que
// sale de ellas (docs/pets/animacion-2d.md, «el maniquí 3D con el dibujo proyectado»). El maniquí se ajusta al dibujo: cabeza, cuerpo,
// orejas, brazos, piernas y cola caen donde están en el dibujo, y luego el adaptador (adaptadores/maniqui3d.js) proyecta el dibujo
// encima. Solo datos y cuentas, sin three.js ni dibujo. Unidades del mundo: 1 = k píxeles del dibujo; los pies en y = 0.
'use strict';
PT.maniqui = (() => {
  // padre de cada hueso; el resto de piezas (corona, nudo) van en el hueso que digan
  const PADRE = { cadera: null, cuerpo: 'cadera', cabeza: 'cuerpo', 'oreja-1': 'cabeza', oreja1: 'cabeza', 'brazo-1': 'cuerpo', brazo1: 'cuerpo',
    'pierna-1': 'cadera', pierna1: 'cadera', cola: 'cadera' };
  // cada pieza: hueso, forma ('bola' con centro c y radios r; 'palo' de la base a la punta, colgando o hacia arriba) y su color; los adornos
  // dicen qué son (adorno: 'corona', 'nudo'), para que el muñeco 3D completo les dé su forma, y una cola puede ser un pompón
  const MEDIDAS = {
    'animales:huron': {
      dibujo: 'img/criaturas/animales-huron-nino-base.webp', k: 500, cx: 322, suelo: 590, cadera: 540, cuello: 410, color: '#9a6a40',
      ojos: { de: 'dibujo', lista: [[243, 277, 34, 33], [395, 274, 33, 33]], fondo: [57, 59, 60], cerrados: '#efe4d6' }, boca: [320, 357],
      estampado: 'sushi',
      piezas: [
        { hueso: 'cuerpo', forma: 'bola', c: [318, 487], r: [0.235, 0.19, 0.19] },
        { hueso: 'cabeza', forma: 'bola', c: [322, 262], r: [0.425, 0.315, 0.3], z: 0.03, cara: true },
        { hueso: 'oreja-1', forma: 'bola', c: [180, 143], r: [0.115, 0.115, 0.06], z: -0.05 },
        { hueso: 'oreja1', forma: 'bola', c: [453, 133], r: [0.115, 0.115, 0.06], z: -0.05 },
        { hueso: 'cabeza', forma: 'bola', c: [515, 230], r: [0.09, 0.07, 0.03], color: '#d0343c', adorno: 'nudo' },   // el nudo de la cinta
        { hueso: 'brazo-1', forma: 'palo', base: [222, 425], punta: [180, 482], grueso: 0.05, z: 0.06 },
        { hueso: 'brazo1', forma: 'palo', base: [412, 415], punta: [477, 462], grueso: 0.05, z: 0.06 },
        { hueso: 'pierna-1', forma: 'bola', c: [240, 560], r: [0.075, 0.06, 0.07], z: 0.04 },
        { hueso: 'pierna1', forma: 'bola', c: [383, 560], r: [0.075, 0.06, 0.07], z: 0.04 },
        { hueso: 'cola', forma: 'palo', base: [205, 525], punta: [85, 365], grueso: 0.06, z: -0.08 },
      ],
      mechones: [   // los bigotitos de pelo de las mejillas, de dentro de la cabeza a su punta
        { base: [175, 296], punta: [104, 328], grueso: 0.06 },
        { base: [470, 288], punta: [538, 316], grueso: 0.06 },
      ],
    },
    'animales:bunny': {
      dibujo: 'img/criaturas/animales-bunny-nino-base.webp', k: 480, cx: 316, suelo: 557, cadera: 520, cuello: 437, color: '#fffcf8',
      ojos: { de: 'piezas', abiertos: 'img/caras/nino-ojos-base.webp', cerrados: 'img/caras/nino-ojos-cerrados.webp', boca: 'img/caras/nino-boca-base.webp', c: [309, 292] },
      boca: [309, 338], estampado: 'zanahorias',
      piezas: [
        { hueso: 'cuerpo', forma: 'bola', c: [317, 495], r: [0.25, 0.16, 0.19] },
        { hueso: 'cabeza', forma: 'bola', c: [318, 300], r: [0.425, 0.3, 0.3], z: 0.03, cara: true },
        { hueso: 'cabeza', forma: 'bola', c: [306, 125], r: [0.12, 0.085, 0.05], color: '#ffe14a', adorno: 'corona' },   // la corona
        { hueso: 'oreja-1', forma: 'palo', base: [197, 175], punta: [167, 47], grueso: 0.075, z: -0.04, hueca: true },
        { hueso: 'oreja1', forma: 'palo', base: [405, 175], punta: [460, 47], grueso: 0.075, z: -0.04, hueca: true },
        { hueso: 'brazo-1', forma: 'palo', base: [200, 425], punta: [160, 462], grueso: 0.05, z: 0.06 },
        { hueso: 'brazo1', forma: 'palo', base: [425, 425], punta: [455, 465], grueso: 0.05, z: 0.06 },
        { hueso: 'pierna-1', forma: 'bola', c: [240, 530], r: [0.08, 0.06, 0.07], z: 0.04 },
        { hueso: 'pierna1', forma: 'bola', c: [385, 530], r: [0.08, 0.06, 0.07], z: 0.04 },
        { hueso: 'cola', forma: 'bola', c: [462, 450], r: [0.085, 0.1, 0.08], z: -0.12, pompon: true },
      ],
    },
  };
  // del píxel del dibujo al mundo y del mundo a la uv del dibujo (proyección de frente)
  const aMundo = (m, [px, py]) => [(px - m.cx) / m.k, (m.suelo - py) / m.k];
  const uv = (m, [x, y], lado = 640) => [(x * m.k + m.cx) / lado, 1 - (m.suelo - y * m.k) / lado];
  // un palo de la base a la punta: dónde está la base, cuánto mide y cuánto gira (0 = colgando hacia abajo)
  function palo(m, base, punta) {
    const a = aMundo(m, base), b = aMundo(m, punta), dx = b[0] - a[0], dy = b[1] - a[1];
    return { base: a, largo: Math.hypot(dx, dy), giro: Math.atan2(dx, -dy) };
  }
  // dónde va cada hueso (en el mundo, en reposo): la cadera y el cuello por su altura, el resto por la primera pieza que lo use
  function huesos(m) {
    const h = { cadera: [0, aMundo(m, [m.cx, m.cadera])[1], 0], cuerpo: [0, aMundo(m, [m.cx, m.cadera])[1], 0], cabeza: [0, aMundo(m, [m.cx, m.cuello])[1], 0] };
    for (const p of m.piezas) {
      if (h[p.hueso]) continue;
      const pos = p.forma === 'palo' ? palo(m, p.base, p.punta).base : aMundo(m, p.c);
      h[p.hueso] = [pos[0], pos[1], p.z || 0];
    }
    return Object.keys(h).map(n => ({ nombre: n, padre: PADRE[n], pos: h[n] }));
  }
  // cada pieza lista para montar: en qué hueso va, su forma, su centro en el mundo y, si es un palo, su largo y su giro
  function piezas(m) {
    return m.piezas.map((p, i) => {
      const base = { id: i + 1, hueso: p.hueso, forma: p.forma, color: p.color || m.color, cara: !!p.cara, hueca: !!p.hueca, adorno: p.adorno || null,
        pompon: !!p.pompon };
      if (p.forma === 'palo') { const q = palo(m, p.base, p.punta); return { ...base, pos: [...q.base, p.z || 0], largo: q.largo, giro: q.giro, grueso: p.grueso }; }
      return { ...base, pos: [...aMundo(m, p.c), p.z || 0], r: p.r };
    });
  }
  // los mechones de pelo (solo los usa el muñeco 3D completo, la f16): picos de la cabeza, de la base a la punta
  const mechones = m => (m.mechones || []).map(q => { const p = palo(m, q.base, q.punta); return { hueso: 'cabeza', forma: 'pico', color: m.color, pos: [...p.base, 0], largo: p.largo, giro: p.giro, grueso: q.grueso }; });
  // PT.ok({ medidas, huesos, piezas, mechones }) o PT.error('maniqui-desconocido', { id })
  function de(id) {
    const m = Object.hasOwn(MEDIDAS, id) ? MEDIDAS[id] : null;
    return m ? PT.ok({ medidas: m, huesos: huesos(m), piezas: piezas(m), mechones: mechones(m) }) : PT.error('maniqui-desconocido', { id });
  }
  return { de, tiene: id => Object.hasOwn(MEDIDAS, id), ids: () => Object.keys(MEDIDAS), aMundo, uv, palo };
})();
