// Fans of Karts · RELIEVE: lo que hace que las pistas no se vean planas. Arcos que cruzan por encima de la pista (y que, seguidos,
// hacen túneles), y monumentos gigantes de cada pista (versiones enormes de sus adornos) que se ven desde lejos.
// Los arcos se hacen con arcoDe(estilo, colores, mitad): 'portico' (dos pilares y una viga), 'arco' (medio círculo con luces),
// 'cartel' (dos postes y un panel) y 'cueva' (roca). `mitad` es la distancia del centro a cada pilar: más que media pista.
'use strict';

function arcoDe(estilo, c1, c2, c3, mitad = 44) {
  const m = mitad, p = [], mats = { a: { c: c1, s: mezcla(c1, '#000000', 0.45), l: mezcla(c1, '#ffffff', 0.4) }, b: { c: c2, s: mezcla(c2, '#000000', 0.45), l: mezcla(c2, '#ffffff', 0.4) }, luz: { c: c3, plano: true } };
  if (estilo === 'portico') {
    for (const s of [-1, 1]) p.push(BLOQUE([s * m, 0, 11], [2.6, 2.6, 11], 'a'), BLOQUE([s * m, 0, 0.8], [3.4, 3.4, 0.8], 'b', { parte: 2 }));
    p.push(BLOQUE([0, 0, 23.5], [m + 4, 2.4, 2.4], 'b', { parte: 3 }));
    for (let x = -m + 6; x <= m - 6; x += 8) p.push(PL([x, -2.45, 23.5], [2, 0.1, 1.1], 'luz'));
  } else if (estilo === 'arco') {
    for (const s of [-1, 1]) p.push(BLOQUE([s * m, 0, 7], [2.4, 2.4, 7], 'a'));
    for (let a = 0; a <= 180; a += 12) { const r = a * RAD; p.push(ESF([Math.cos(r) * m, 0, 14 + Math.sin(r) * m * 0.42], [3.2, 2.4, 2.6], a % 24 ? 'a' : 'b', { parte: 2 })); }
    for (let a = 6; a < 180; a += 24) { const r = a * RAD; p.push(PL([Math.cos(r) * m, -2.45, 14 + Math.sin(r) * m * 0.42], [0.9, 0.1, 0.9], 'luz')); }
  } else if (estilo === 'cartel') {
    for (const s of [-1, 1]) p.push(CONO([s * m, 0, 12], [1.2, 1, 12], 'a'));
    p.push(BLOQUE([0, 0, 22], [m * 0.62, 1, 5.4], 'b', { parte: 2 }), BLOQUE([0, 0, 22], [m + 1.5, 0.7, 0.7], 'a', { parte: 3 }));
    for (let x = -m * 0.5; x <= m * 0.5; x += m * 0.25) p.push(PL([x, -1.05, 23.6], [m * 0.08, 0.1, 1.2], 'luz'));
    p.push(PL([0, -1.05, 20], [m * 0.5, 0.1, 0.5], 'luz'));
  } else {      // cueva: roca amontonada
    for (const s of [-1, 1]) for (let z = 3; z < 20; z += 5.5) p.push(ESF([s * (m + Math.sin(z) * 1.5), 0, z], [5, 4, 3.6], 'a'));
    for (let x = -m; x <= m; x += 7) p.push(ESF([x, 0, 22 + Math.cos(x / m * 1.4) * 2], [5.6, 4.2, 4], (x / 7 | 0) & 1 ? 'a' : 'b', { parte: 2 }));
    for (let x = -m + 8; x < m; x += 15) p.push(PL([x, -4, 19], [1, 0.1, 1.6], 'luz'));
  }
  return { medio: m + 6, alto: 29, mats, piezas: p };
}
// una versión enorme de un adorno (para los monumentos): todo multiplicado por `f`
function gigante(id, f) {
  const d = COSAS[id];
  return { medio: d.medio * f, alto: d.alto * f, bajo: (d.bajo === undefined ? 1.2 : d.bajo) * f, mats: d.mats, piezas: d.piezas.map(q => Object.assign({}, q, { c: q.c.map(v => v * f), r: q.r.map(v => v * f) })) };
}

Object.assign(COSAS, {
  // ---------- los arcos de cada pista ----------
  arcoOficinas: arcoDe('portico', '#d8dce8', '#3a7de0', '#ffffff', 42),
  arcoPlaya: arcoDe('cartel', '#c98a4b', '#22b8f0', '#ffffff', 44),
  arcoParque: arcoDe('arco', '#ff8ac0', '#ffe14d', '#ffffff', 42),
  arcoCentro: arcoDe('portico', '#f4f4f8', '#c35cff', '#ffe14d', 40),
  arcoDesierto: arcoDe('cueva', '#d8925a', '#c07a44', '#f2c08a', 45),
  arcoMinas: arcoDe('portico', '#8b5530', '#6e4628', '#ffcb3d', 36),
  arcoEstadio: arcoDe('cartel', '#c3cbe0', '#1c1f2a', '#22e3ff', 42),
  arcoCementerio: arcoDe('arco', '#3a3356', '#5a4a66', '#5ef2d0', 38),
  arcoNieve: arcoDe('arco', '#bdeaff', '#ffffff', '#22e3ff', 40),
  arcoFosa: arcoDe('cueva', '#ff6fae', '#ff9a3c', '#c35cff', 40),
  arcoVolcan: arcoDe('cueva', '#3a2a3a', '#4a3a42', '#ff7a1a', 40),
  arcoNube: arcoDe('arco', '#ffffff', '#c8e9ff', '#ff5cf0', 40),
  arcoSelva: arcoDe('arco', '#6e5a40', '#2f9a4a', '#5ef27a', 38),
  arcoHype: arcoDe('cartel', '#3a3f52', '#ff3df0', '#22e3ff', 41),
  arcoCastillo: arcoDe('portico', '#a8a0b8', '#8a8298', '#ffcb3d', 38),
  arcoTorre: arcoDe('cartel', '#c3cbe0', '#e63946', '#ffffff', 39),
  arcoTutorial: arcoDe('arco', '#ff8a1f', '#3fae4a', '#ffffff', 52),
});
// ---------- los monumentos (se crean cuando ya existen sus adornos) ----------
for (const [id, base, f] of [['granPlanta', 'planta', 3], ['granCastillo', 'castillo', 4], ['granTiovivo', 'tiovivo', 2.4], ['granManiqui', 'maniqui', 3.2], ['granCactus', 'cactus', 3.4],
  ['granCraneo', 'craneo', 4.5], ['granLapida', 'lapida', 4], ['granGema', 'gema', 3.6], ['granCopa', 'copa', 4], ['granMuneco', 'muneco', 4], ['granAncla', 'ancla', 3.4],
  ['granCofre', 'cofre', 3.4], ['granFumarola', 'fumarola', 4], ['granRack', 'rack', 2.6], ['granSeta', 'seta', 4], ['granHolograma', 'holograma', 3.6], ['granTorre', 'torre', 1.8],
  ['granEstatua', 'estatua', 3], ['granZanahoria', 'zanahoria', 4.2], ['granVaca', 'mechavaca', 1.5], ['granPalmera', 'palmera', 2.2], ['granPino', 'pino', 2.4]]) COSAS[id] = gigante(base, f);
