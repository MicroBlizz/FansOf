// Fans of Ratkov · LOS MODELOS: el escuadrón (CrazyBunny, MadSquirrel, SlyFox, JunkCoon y MeerCat con equipo de invierno) y lo que hay
// ahí fuera (becario carroñero, Seguridad Microblizz, El Auditor y El Lag). Cada uno es un grupo con su cuerpo, dos piernas que se
// mueven al andar y el arma en la mano. Todo low-poly con cajas, juntadas con la OBRA (js/motor.js) para que pesen poco.
'use strict';
const NIEVE_C = 0xdfe6ee, NEGRO_C = 0x16181c, ARMA_C = 0x24272c;
// una caja dentro de otra pieza (con su desplazamiento)
const en = (o, b) => (w, h, d, c, x, y, z, rx, ry, rz) => o.caja(w, h, d, c, b[0] + x, b[1] + y, b[2] + z, ry, rx, rz);

// el cuerpo común: chaquetón, chaleco con cargadores, brazos, mochila y bufanda. Devuelve también las piernas
function cuerpoBase(o, op) {
  const c = en(o, [0, 0, 0]);
  c(0.62, 0.66, 0.42, op.chaqueta, 0, 0.92, 0);
  c(0.66, 0.5, 0.48, op.chaleco || 0x4a5236, 0, 0.95, 0.01);
  for (const x of [-0.2, 0, 0.2]) c(0.16, 0.18, 0.08, op.bolsillo || 0x3a4028, x, 0.84, 0.27);
  if (op.parche) c(0.14, 0.1, 0.02, op.parche, -0.2, 1.1, 0.26);
  for (const s of [-1, 1]) { c(0.2, 0.5, 0.22, op.chaqueta, s * 0.42, 0.95, 0.06, 0, 0, s * 0.15); c(0.18, 0.14, 0.2, op.guante || ARMA_C, s * 0.44, 0.7, 0.16); }
  if (op.mochila !== false) { const m = op.mochila || {}; const w = m.w || 0.56, h = m.h || 0.6, d = m.d || 0.32, y = m.y || 1.0; c(w, h, d, m.c || 0x5a4a32, 0, y, -0.22 - d / 2); c(w * 0.8, 0.12, 0.1, 0x3a3024, 0, y + 0.1, -0.24 - d); if (m.nieve) c(w + 0.02, 0.06, d + 0.02, NIEVE_C, 0, y + h / 2, -0.22 - d / 2); }
  if (op.bufanda) c(0.5, 0.14, 0.44, op.bufanda, 0, 1.3, 0.02);
}
function piernas(op) {
  return [-1, 1].map(s => { const o = new Obra(); o.caja(0.24, 0.5, 0.26, op.pantalon, 0, -0.27, 0); o.caja(0.28, 0.16, 0.34, NEGRO_C, 0, -0.52, 0.04); const m = o.hecha(); m.position.set(s * 0.15, 0.6, 0); return m; });
}
function cabezaBase(o, op) {
  const b = [0, 1.58, 0.02], c = en(o, b);
  c(0.62, 0.52, 0.52, op.pelo, 0, 0, 0);
  c(0.36, 0.22, 0.2, op.hocico || 0xf2ece4, 0, -0.1, 0.3); c(0.1, 0.08, 0.06, op.nariz || 0xff8aa8, 0, -0.04, 0.41);
  ojos(c, 0.06, 0.27, 0.15, op.espiral);
  return c;
}
function ojos(c, y, z, sep, espiral) {
  c(0.12, 0.12, 0.04, 0xffffff, -sep, y, z); c(0.07, 0.08, 0.05, NEGRO_C, -sep + 0.02, y, z + 0.01);
  if (espiral) { c(0.16, 0.16, 0.05, 0x8a2bff, sep, y, z); c(0.08, 0.08, 0.06, 0xe2c8ff, sep, y, z + 0.01); }
  else { c(0.12, 0.12, 0.04, 0xffffff, sep, y, z); c(0.07, 0.08, 0.05, NEGRO_C, sep - 0.02, y, z + 0.01); }
}

/* ---------- el escuadrón ---------- */
const ANIMAL_MODELO = {
  bunny: o => {
    cuerpoBase(o, { chaqueta: 0xe8e4f0, chaleco: 0x4a5236, parche: 0xff7a1a, bufanda: 0xff7a1a, mochila: { c: 0xc45a12, h: 0.66, nieve: true } });
    const c0 = en(o, [0, 0, 0]); c0(0.78, 0.5, 0.1, 0xff7a1a, 0, 1.05, -0.18, -0.15);
    const c = cabezaBase(o, { pelo: 0xf7f3ff, hocico: 0xffffff, nariz: 0xffb3cf, espiral: true });
    for (const s of [-1, 1]) { c(0.14, 0.7, 0.1, 0xf7f3ff, s * 0.17, 0.62, -0.02, 0, 0, -s * 0.12); c(0.07, 0.5, 0.02, 0xffb3cf, s * 0.17, 0.62, 0.04, 0, 0, -s * 0.12); }
    c(0.7, 0.2, 0.6, 0x4a5236, 0, 0.26, 0); c(0.74, 0.06, 0.64, 0x5a6244, 0, 0.16, 0);
    c(0.3, 0.14, 0.14, NEGRO_C, 0, 0.38, 0.2, -0.6); c(0.08, 0.08, 0.08, 0x2a8a4a, -0.07, 0.44, 0.3); c(0.08, 0.08, 0.08, 0x2a8a4a, 0.07, 0.44, 0.3);
    c(0.4, 0.08, 0.3, 0xf9c531, 0.08, 0.42, -0.02, 0, 0, 0.25); for (const x of [-0.13, 0.02, 0.17]) o.cono(0.06, 0.16, 4, 0xf9c531, x + 0.08, 1.58 + 0.53 + x * 0.25, 0, 0, 0, 0.25);
    return { pantalon: 0x3a3e48 };
  },
  squirrel: o => {
    cuerpoBase(o, { chaqueta: 0x6a4a3a, chaleco: 0x5a6244, bufanda: 0xff9bb0, mochila: { c: 0x6a5a40, h: 0.46, w: 0.44, y: 1.05 } });
    const c = cabezaBase(o, { pelo: 0xb14d1c, hocico: 0xf6d7a7, nariz: 0xff9bb0 });
    for (const s of [-1, 1]) { c(0.14, 0.2, 0.1, 0xb14d1c, s * 0.22, 0.32, 0, 0, 0, -s * 0.3); c(0.06, 0.1, 0.06, 0x7a3410, s * 0.25, 0.45, 0, 0, 0, -s * 0.3); }
    c(0.66, 0.18, 0.56, 0xd8443a, 0, 0.26, 0); c(0.14, 0.14, 0.14, 0xf0e8e0, 0, 0.42, 0);
    const k = en(o, [0, 0, 0]);
    [[0, 0.5, -0.5, 0.4], [0, 0.9, -0.75, 0.46], [0, 1.4, -0.8, 0.46], [0, 1.85, -0.62, 0.4]].forEach(([x, y, z, s], i) => k(s, s, s * 0.8, i % 2 ? 0xc45a22 : 0xb14d1c, x, y, z, 0.3 * i));
    k(0.4, 0.08, 0.3, NIEVE_C, 0, 2.08, -0.6);
    return { pantalon: 0x4a4038 };
  },
  fox: o => {
    cuerpoBase(o, { chaqueta: 0xe4e8ee, chaleco: 0xc8ced6, bolsillo: 0xb0b8c2, mochila: false });
    const k = en(o, [0, 0, 0]); k(0.8, 0.9, 0.12, 0xe8ecf0, 0, 1.0, -0.3, -0.1);
    for (const [x, y, c2] of [[-0.25, 0.7, 0xc8d0d8], [0.1, 1.2, 0x9aa4ae], [0.25, 0.8, 0xc8d0d8], [-0.1, 1.1, 0x9aa4ae]]) k(0.16, 0.25, 0.06, c2, x, y, -0.38);
    const c = cabezaBase(o, { pelo: 0xe8702a, hocico: 0xfff4e6, nariz: 0x2b1622 });
    for (const s of [-1, 1]) { o.cono(0.15, 0.34, 4, 0xe8702a, s * 0.2, 1.58 + 0.4, 0.02, 0, Math.PI / 4, -s * 0.2); }
    c(0.68, 0.22, 0.58, 0xe4e8ee, 0, 0.22, -0.04); c(0.5, 0.1, 0.06, NEGRO_C, 0, 0.1, 0.28);
    k(0.3, 0.3, 0.7, 0xe8702a, 0, 0.55, -0.55, -0.6); k(0.28, 0.28, 0.3, 0xfff4e6, 0, 0.3, -0.9, -0.6);
    return { pantalon: 0xd8dee6 };
  },
  junkcoon: o => {
    cuerpoBase(o, { chaqueta: 0x5a5e68, chaleco: 0x4a4a40, bufanda: 0x6a8a3a, mochila: { c: 0x6a6252, h: 1.0, w: 0.74, d: 0.5, y: 1.25 } });
    const k = en(o, [0, 0, 0]);
    k(0.2, 0.5, 0.2, 0x8a8f99, -0.2, 1.95, -0.45, 0.3); k(0.3, 0.2, 0.2, 0xffcb3d, 0.18, 1.85, -0.6, 0, 0.4); k(0.24, 0.24, 0.24, 0x3a7de0, -0.05, 1.8, -0.7);
    const c = cabezaBase(o, { pelo: 0x8d8f99, hocico: 0xc9cbd3, nariz: 0x2a2e3a });
    c(0.64, 0.14, 0.1, 0x2a2e3a, 0, 0.07, 0.26); ojos(c, 0.07, 0.32, 0.15);
    for (const s of [-1, 1]) c(0.18, 0.2, 0.1, 0x8d8f99, s * 0.22, 0.32, 0);
    c(0.66, 0.14, 0.56, 0x3a3e48, 0, 0.3, 0); c(0.7, 0.04, 0.3, 0x3a3e48, 0, 0.24, 0.32);
    for (let i = 0; i < 4; i++) k(0.24, 0.24, 0.2, i % 2 ? 0x2a2e3a : 0x8d8f99, 0, 0.45 - i * 0.03, -0.62 - i * 0.18, -0.4);
    return { pantalon: 0x3a3e48 };
  },
  meercat: o => {
    cuerpoBase(o, { chaqueta: 0xd6def0, chaleco: 0xd6def0, bolsillo: 0xff4b5c, mochila: { c: 0xf4f4f4, h: 0.6, w: 0.5 } });
    const k = en(o, [0, 0, 0]); k(0.2, 0.06, 0.02, 0xff4b5c, 0, 1.0, -0.55); k(0.06, 0.2, 0.02, 0xff4b5c, 0, 1.0, -0.55);
    for (const s of [-1, 1]) k(0.08, 0.5, 0.3, 0xffffff, s * 0.38, 1.15, -0.42, 0, s * 0.5);
    const c = cabezaBase(o, { pelo: 0xd9b07a, hocico: 0xf0dcb8, nariz: 0x5b3a26 });
    c(0.62, 0.18, 0.2, 0x5b3a26, 0, 0.06, 0.2); ojos(c, 0.06, 0.3, 0.15);
    for (const s of [-1, 1]) c(0.12, 0.14, 0.08, 0x5b3a26, s * 0.26, 0.2, 0);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c(0.1, 0.05, 0.1, 0xffcb3d, Math.cos(a) * 0.26, 0.55, Math.sin(a) * 0.26); }
    return { pantalon: 0x4a4e58 };
  },
};

/* ---------- lo que hay ahí fuera ---------- */
const ENEMIGO_MODELO = {
  carronero: o => {
    const k = en(o, [0, 0, 0]);
    k(0.62, 0.62, 0.42, 0x2a3a6a, 0, 0.92, 0); k(0.04, 0.5, 0.44, 0xe8eef4, -0.24, 0.92, 0); k(0.04, 0.5, 0.44, 0xe8eef4, 0.24, 0.92, 0);
    for (const s of [-1, 1]) k(0.2, 0.5, 0.22, 0x2a3a6a, s * 0.42, 0.95, 0.06, 0, 0, s * 0.15);
    const c = en(o, [0, 1.55, 0]);
    c(0.64, 0.5, 0.5, 0xb8c0cc, 0, 0, 0); c(0.5, 0.34, 0.04, 0x1a3a8a, 0, 0, 0.26);
    c(0.1, 0.06, 0.05, 0x9fd0ff, -0.12, 0.04, 0.29); c(0.1, 0.06, 0.05, 0x9fd0ff, 0.12, 0.04, 0.29); c(0.2, 0.04, 0.05, 0x9fd0ff, 0, -0.1, 0.29);
    c(0.72, 0.26, 0.6, 0x5a4030, 0, 0.32, 0); c(0.74, 0.1, 0.14, 0x8a6a50, 0, 0.22, 0.3); for (const s of [-1, 1]) c(0.12, 0.34, 0.3, 0x5a4030, s * 0.38, 0.02, 0);
    k(0.4, 0.3, 0.3, 0x6a5a40, 0, 1.0, -0.38);
    return { pantalon: 0x2a3a6a, escala: 1.5 };
  },
  seguridad: o => {
    const k = en(o, [0, 0, 0]);
    k(0.8, 0.78, 0.5, 0x3a4660, 0, 1.05, 0); k(0.84, 0.3, 0.54, 0x2a3448, 0, 1.3, 0);
    for (const s of [-1, 1]) { k(0.32, 0.32, 0.4, 0x2a3448, s * 0.55, 1.3, 0); k(0.24, 0.6, 0.26, 0x3a4660, s * 0.55, 0.95, 0.04); }
    const c = en(o, [0, 1.78, 0]);
    c(0.5, 0.42, 0.46, 0x2a3448, 0, 0, 0); c(0.42, 0.1, 0.04, 0xff3a40, 0, 0.02, 0.24); c(0.56, 0.1, 0.52, 0x3a4660, 0, 0.2, 0);
    // el escudo con el logo
    k(0.9, 1.3, 0.08, 0x1a2230, -0.35, 0.95, 0.45, 0, 0.3); k(0.4, 0.6, 0.02, 0x58c8ff, -0.33, 1.0, 0.5, 0, 0.3); k(0.2, 0.4, 0.03, 0x1a2230, -0.32, 1.0, 0.51, 0, 0.3);
    return { pantalon: 0x2a3448, escala: 1.5, piernaAncha: true };
  },
  auditor: o => {
    const k = en(o, [0, 0, 0]);
    k(1.0, 1.0, 0.64, 0x2a2420, 0, 1.4, 0); k(1.04, 0.3, 0.68, 0x6a5a4a, 0, 1.86, 0);
    k(0.4, 0.9, 0.04, 0xe8e4dc, 0, 1.4, 0.33); k(0.14, 0.5, 0.05, 0x8a2a2a, 0, 1.4, 0.35);
    for (const s of [-1, 1]) { k(0.42, 0.42, 0.48, 0x3a3e44, s * 0.7, 1.75, 0); k(0.3, 0.7, 0.32, 0x2a2420, s * 0.7, 1.3, 0.04); }
    k(0.6, 0.7, 0.4, 0x3a3e44, 0, 1.5, -0.45); for (const s of [-1, 1]) o.cil(0.08, 0.08, 0.4, 6, 0xff6a1a, s * 0.2, 1.9, -0.58);
    const c = en(o, [0, 2.28, 0]);
    c(0.52, 0.5, 0.46, 0xe0c4a8, 0, 0, 0); c(0.46, 0.1, 0.06, NEGRO_C, 0, 0.06, 0.24); c(0.3, 0.06, 0.05, 0x8a5a4a, 0, -0.14, 0.24);
    c(0.66, 0.3, 0.6, 0x4a3a30, 0, 0.32, 0); for (const s of [-1, 1]) c(0.14, 0.4, 0.44, 0x4a3a30, s * 0.36, 0.04, 0); c(0.16, 0.14, 0.04, 0xf9c531, 0, 0.36, 0.31);
    return { pantalon: 0x3a3e44, escala: 1.6, piernaAncha: true, alto: 1 };
  },
  lag: o => {
    // tres copias desfasadas: cian, roja y la de verdad morada
    for (const [dx, c1] of [[-0.6, 0x39d5e8], [-0.3, 0xff4b5c], [0, 0x8a2bff]]) {
      const k = en(o, [dx, 0, dx * 0.3]);
      k(0.5, 0.9, 0.4, c1, 0, 0.9, 0); k(0.6, 0.5, 0.5, c1, 0.06, 1.6, 0, 0, 0, 0.2); k(0.3, 0.3, 0.3, dx ? c1 : 0x39d5e8, -0.2, 2.0, 0.1, 0.5, 0.3);
      k(0.16, 1.0, 0.16, c1, 0.45, 1.0, 0.1, 0, 0, 0.5); k(0.16, 0.9, 0.16, c1, -0.4, 0.9, 0, 0, 0, -0.7);
      if (!dx) { k(0.1, 0.1, 0.05, 0xffffff, -0.08, 1.65, 0.26); k(0.1, 0.1, 0.05, 0xffffff, 0.16, 1.62, 0.26); }
    }
    return { pantalon: 0x8a2bff, escala: 1.5, brilla: true };
  },
};

ENEMIGO_MODELO.practicas = ENEMIGO_MODELO.carronero;   // el del tutorial: un carroñero en prácticas

/* ---------- las armas en la mano ---------- */
function modeloArma(id) {
  const o = new Obra();
  const largo = { pistola: 0.35, metralleta: 0.6, escopeta: 0.95, fusil: 1.0, franco: 1.45, trabuco: 0.75, rifleSeg: 0.95, maletin: 0, puno: 0 }[id] ?? 0.6;
  if (id === 'maletin') { o.caja(0.7, 0.5, 0.2, 0x3a2a20, 0, 0, 0); o.caja(0.2, 0.06, 0.06, 0xf9c531, 0, 0.28, 0); for (let i = 0; i < 4; i++) o.cil(0.04, 0.04, 0.7, 5, NEGRO_C, -0.15 + i * 0.1, 0, 0.45, Math.PI / 2); }
  else if (id === 'trabuco') { o.caja(0.18, 0.16, 0.5, 0xc84a3a, 0, 0, 0); o.cil(0.07, 0.07, 0.7, 6, 0x6a6a6a, 0, 0.02, 0.55, Math.PI / 2); }
  else if (largo > 0) {
    o.caja(0.1, 0.14, largo, ARMA_C, 0, 0, largo * 0.35); o.caja(0.08, 0.2, 0.1, ARMA_C, 0, -0.14, 0);
    if (id !== 'pistola') o.caja(0.08, 0.12, 0.24, id === 'rifleSeg' ? 0x2a2e36 : 0x5a4a32, 0, -0.02, -0.15);
    if (id === 'metralleta' || id === 'fusil' || id === 'rifleSeg') o.caja(0.08, 0.2, 0.1, 0x2a2e36, 0, -0.16, largo * 0.3);
    if (id === 'franco') { o.caja(0.08, 0.1, 0.4, NEGRO_C, 0, 0.12, largo * 0.25); o.caja(0.06, 0.06, 0.04, 0x6ad8ff, 0, 0.12, largo * 0.25 + 0.21); }
  }
  const m = o.hecha(); m.userData.boca = largo * 0.85 + 0.1; return m;
}

// monta un personaje: { grupo, cuerpo, piernas, mano (donde va el arma), arma, alto }
function montaPersonaje(tipo, esAnimal) {
  const o = new Obra();
  const op = (esAnimal ? ANIMAL_MODELO[tipo] : ENEMIGO_MODELO[tipo])(o);
  const grupo = new THREE.Group(), cuerpo = o.hecha(); grupo.add(cuerpo);
  const ps = piernas({ pantalon: op.pantalon }); if (op.piernaAncha) ps.forEach(p => p.scale.set(1.3, 1, 1.2));
  ps.forEach(p => grupo.add(p));
  if (op.brilla) { cuerpo.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = new THREE.Color(0x401070); } }); }
  const mano = new THREE.Group(); mano.position.set(0.36, op.alto ? 1.15 : 0.82, 0.22); grupo.add(mano);
  grupo.scale.setScalar(op.escala || 1.5);
  return { grupo, cuerpo, piernas: ps, mano, arma: null, escala: op.escala || 1.5 };
}
function ponArma(p, id) {
  if (p.arma) { p.mano.remove(p.arma); p.arma.traverse(m => { if (m.isMesh) m.geometry.dispose(); }); }
  p.arma = id ? modeloArma(id) : null; if (p.arma) p.mano.add(p.arma);
}
// andar: las piernas van adelante y atrás y el cuerpo bota un poco
function animaPersonaje(p, fase, mueve) {
  const a = mueve ? Math.sin(fase) * 0.7 : 0;
  p.piernas[0].rotation.x = a; p.piernas[1].rotation.x = -a;
  p.cuerpo.position.y = mueve ? Math.abs(Math.sin(fase)) * 0.06 : 0;
}
