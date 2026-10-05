// Fans Of · Progreso fuera de la partida, común a todos los juegos: oro y gemas, niveles y experiencia de las cartas,
// catálogo de habilidades y objetos, calidades, gashapón, tienda y recompensas.
// Mismos nombres, rarezas, calidades, precios y forma de guardar que el Rumble (js/02-progresion.js). Las pantallas están en menus.js e idle.js.
//
// AQUÍ VA EL SISTEMA; LOS NÚMEROS DE CADA JUEGO, NO. Cada juego carga antes su archivo de ajustes (games/<juego>/js/ajustes.js), que dice:
//   · qué puede mejorar una carta en ese juego (AJUSTES.stats) y cómo se llaman sus facetas (AJUSTES.facetas),
//   · qué hace y cuánto da cada habilidad y cada objeto en ese juego (AJUSTES.fx),
//   · y los números de economía que quiera cambiar respecto a los de aquí (AJUSTES.econ).
// Un objeto que no salga en AJUSTES.fx existe en el inventario pero no hace nada en ese juego.
'use strict';
// valores por defecto (los del Rumble); AJUSTES.econ los pisa en cada juego
const ECON = Object.assign({
  lvlStep: 0.06, maxLvl: 10,                                                     // +6 % por nivel
  xpNeed:   [0, 50, 100, 175, 300, 500, 800, 1300, 2000, 3200],                  // XP para pasar del nivel i al i+1
  goldCost: [0, 50, 100, 200, 400, 750, 1500, 3000, 6000, 12000],                // oro para pasar del nivel i al i+1
  xpPerPlay: 10, winXpMult: 1.3,                                                 // XP por cada carta jugada; +30 % si ganas
  camp: { first: [100, 10], replay: 30, stars3: [50, 10], boss: [300, 50], lose: 10 },   // [oro, gemas]
  pull: 50,                                                                      // gemas por tirada
  odds: { common: 55, rare: 30, epic: 12, legendary: 3 },                        // probabilidades del gashapón (%)
  pityEpic: 10, pityLeg: 50, pityQ: 10,                                          // garantías: épica cada 10, legendaria a las 50, calidad Director cada 10
  start: { gold: 150, gems: 100 },
  scrap: { common: 25, rare: 60, epic: 150, legendary: 400 },                    // oro al despedir una copia (más si es de buena calidad)
  reroll: { common: 250, rare: 500, epic: 1000, legendary: 2000 },               // oro por volver a tirar los números de una copia
}, AJUSTES.econ);
const STATS = AJUSTES.stats;   // qué puede mejorar cada faceta de una carta en este juego
const RARITY = { common: ['Común', '#63cfe0', '#2a7895'], rare: ['Rara', '#ffb04f', '#cf5a16'], epic: ['Épica', '#d08cff', '#6d28c9'], legendary: ['Legendaria', '#ffe06a', '#c47f10'] };
// calidad de cada copia: cada efecto sale entre el 50 % (calidad 0) y el 150 % (calidad 100) de su valor central
const QTIERS = [
  { name: 'Becario (básica)', p: 30, lo: 0, hi: 0.4, col: '#b4bccb' },
  { name: 'Junior (normal)', p: 40, lo: 0.4, hi: 0.7, col: '#63cfe0' },
  { name: 'Senior (buena)', p: 20, lo: 0.7, hi: 0.88, col: '#8cf05a' },
  { name: 'Director (excelente)', p: 9, lo: 0.88, hi: 0.99, col: '#e2a8ff' },
  { name: 'CEO (perfecta)', p: 1, lo: 1, hi: 1, col: '#ffcb3d' },
];
function rollQ(minTier) {
  const pool = QTIERS.slice(minTier || 0); let x = Math.random() * pool.reduce((a, t) => a + t.p, 0);
  for (const t of pool) { if (x < t.p) return Math.floor((t.lo + Math.random() * (t.hi - t.lo)) * 1000) / 1000; x -= t.p; }
  return 1;
}
const tierOf = q => (q >= 1 ? 4 : q >= 0.88 ? 3 : q >= 0.7 ? 2 : q >= 0.4 ? 1 : 0);
const avgQ = it => it.q.reduce((a, b) => a + b, 0) / it.q.length;

// Catálogo: qué habilidades y objetos existen, con su rareza. Es el mismo en todos los juegos; lo que hace cada uno lo pone AJUSTES.fx.
// ic: las dos letras del icono (como en el original).
// Gashapón de habilidades: una por carta
const ABILITIES = {
  cafeina:  { name: 'Cafeína', rar: 'common', ic: 'CF' },
  piel:     { name: 'Piel dura', rar: 'common', ic: 'PD' },
  punos:    { name: 'Puños de hierro', rar: 'common', ic: 'PH' },
  reflejos: { name: 'Reflejos', rar: 'common', ic: 'RF' },
  speedrun: { name: 'Speedrun', rar: 'common', ic: 'SR' },
  plasma:   { name: 'Escudo de plasma', rar: 'rare', fac: 'ciber', ic: 'EP' },
  sigilo:   { name: 'Sigilo inicial', rar: 'rare', fac: 'animales', ic: 'SG' },
  escarcha: { name: 'Escarcha', rar: 'rare', fac: 'nomuertos', ic: 'ES' },
  vampiro:  { name: 'Vampirismo', rar: 'rare', ic: 'VP' },
  hitbox:   { name: 'Hitbox dudosa', rar: 'rare', ic: 'HB' },
  microtrans: { name: 'Microtransacción', rar: 'rare', ic: 'MT' },
  cadena:   { name: 'Rayo en cadena', rar: 'epic', fac: 'heroes', ic: 'RC' },
  renacer:  { name: 'Renacer', rar: 'epic', fac: 'nomuertos', ic: 'RN' },
  grito:    { name: 'Grito', rar: 'epic', fac: 'nomuertos', ic: 'GR' },
  iman:     { name: 'Imán de CAOS', rar: 'epic', ic: 'IC' },
  clon:     { name: 'Clon viral', rar: 'legendary', fac: 'memes', ic: 'CV' },
  furia:    { name: 'Furia legendaria', rar: 'legendary', ic: 'FL' },
  gigante:  { name: 'Modo gigante', rar: 'legendary', ic: 'MG' },
};
// Gashapón de equipamiento: arma, cabeza y accesorio.
const SLOTS = { weapon: 'Arma', head: 'Cabeza', acc: 'Accesorio' };
const ITEMS = {
  espada_carton: { name: 'Espada de cartón piedra', slot: 'weapon', rar: 'common' },
  mando_cable:   { name: 'Mando con cable de 3 metros', slot: 'weapon', rar: 'common' },
  raton_dpi:     { name: 'Ratón de 16.000 DPI', slot: 'weapon', rar: 'rare' },
  baguette:      { name: 'Baguette de ayer', slot: 'weapon', rar: 'rare' },
  teclado_rgb:   { name: 'Teclado mecánico RGB', slot: 'weapon', rar: 'epic' },
  lanzaconfeti:  { name: 'Lanzaconfeti', slot: 'weapon', rar: 'epic' },
  banhammer_oro: { name: 'BanHammer de oro', slot: 'weapon', rar: 'legendary' },
  cuernos:       { name: 'Casco con cuernos', slot: 'head', rar: 'common' },
  gorra_reves:   { name: 'Gorra del revés', slot: 'head', rar: 'common' },
  corona_carton: { name: 'Corona de hamburguesería', slot: 'head', rar: 'rare' },
  casco_vr:      { name: 'Casco de realidad virtual', slot: 'head', rar: 'rare' },
  gorro_aluminio:{ name: 'Gorro de papel de aluminio', slot: 'head', rar: 'epic' },
  orejas_gato:   { name: 'Diadema de orejas de gato', slot: 'head', rar: 'epic' },
  auriculares:   { name: 'Auriculares con cancelación de ruido', slot: 'head', rar: 'legendary' },
  taza:          { name: 'Taza del becario', slot: 'acc', rar: 'common' },
  pase_caducado: { name: 'Pase de batalla caducado', slot: 'acc', rar: 'common' },
  almohada:      { name: 'Almohada de viaje', slot: 'acc', rar: 'rare' },
  disco_fisico:  { name: 'Disco físico de coleccionista', slot: 'acc', rar: 'rare' },
  silla_gamer:   { name: 'Silla gamer portátil', slot: 'acc', rar: 'epic' },
  alfombrilla:   { name: 'Alfombrilla XXL', slot: 'acc', rar: 'epic' },
  boton_pausa:   { name: 'Botón de pausa', slot: 'acc', rar: 'legendary' },
  // objetos de facción: más fuertes, pero solo los pueden llevar las cartas de su raza
  zanahoria_oro:   { name: 'Zanahoria de oro', slot: 'weapon', rar: 'legendary', fac: 'animales' },
  corona_huesos:   { name: 'Corona de huesos', slot: 'head', rar: 'legendary', fac: 'nomuertos' },
  microfono_oro:   { name: 'Micrófono de oro', slot: 'acc', rar: 'legendary', fac: 'streamers' },
  yelmo_olimpo:    { name: 'Yelmo del Olimpo', slot: 'head', rar: 'legendary', fac: 'heroes' },
  nucleo_plasma:   { name: 'Núcleo de plasma', slot: 'acc', rar: 'legendary', fac: 'ciber' },
  gafas_pixel:     { name: 'Gafas pixeladas', slot: 'head', rar: 'legendary', fac: 'memes' },
  raton_campeon:   { name: 'Ratón del campeón', slot: 'weapon', rar: 'legendary', fac: 'gamer' },
  cartucho_dorado: { name: 'Cartucho dorado', slot: 'acc', rar: 'legendary', fac: 'olvidados' },
  claqueta_oro:    { name: 'Claqueta de oro', slot: 'weapon', rar: 'legendary', fac: 'pop' },
};
// Los efectos vienen de los ajustes del juego. fx: [faceta, qué mejora, valor central]; un valor negativo es una pega y no cambia con la calidad.
// De cada «fx» salen lo que el original guardaba a mano: st (los valores centrales que cambian con la calidad) y desc (el texto con {0}, {1}…)
const SIDES = Object.keys(AJUSTES.facetas);
for (const DB of [ABILITIES, ITEMS]) for (const id in DB) {
  const D = DB[id], by = {}; D.fx = AJUSTES.fx[id] || []; D.st = []; D.fi = [];
  D.fx.forEach(([side, st, c]) => {
    const [txt, , signed] = STATS[side][st], fixed = c <= 0;
    if (!fixed) { D.fi.push(D.st.length); D.st.push(c); } else D.fi.push(-1);
    (by[side] = by[side] || []).push((signed ? (c < 0 ? '−' : '+') : '') + txt.replace('{v}', fixed ? String(Math.abs(c)) : '{' + (D.st.length - 1) + '}'));
  });
  D.side = SIDES.filter(s => by[s]).join('');   // qué facetas mejora
  D.desc = D.side ? SIDES.filter(s => by[s]).map(s => `<i class="${AJUSTES.facetas[s].cls}">${AJUSTES.facetas[s].nombre}</i> ${by[s].join(' y ')}.`).join(' ') : 'No hace nada en este juego.';
}
// para los textos de los menús: «· TORRE», «mejora la TORRE»…
const sideTag = D => (D.side.length === 1 ? '· ' + AJUSTES.facetas[D.side].nombre : D.side ? '· LAS DOS' : '');
const sideText = D => (D.side.length === 1 ? 'mejora ' + AJUSTES.facetas[D.side].con : D.side ? 'mejora las dos facetas' : 'no hace nada en este juego');
const fitsFac = (id, f) => !ITEMS[id] || !ITEMS[id].fac || ITEMS[id].fac === f;
const defOf = it => (it.k === 'ab' ? ABILITIES : ITEMS)[it.id];
const statDec = c => (c < 5 ? 2 : 1);
const statsOf = it => defOf(it).st.map(c => ({ c, dec: statDec(c) }));
const rnd = (v, dec) => { const m = Math.pow(10, dec); return Math.round(v * m) / m; };
const valsOf = it => statsOf(it).map((st, i) => rnd(st.c * (0.5 + (it.q[i] == null ? 0.5 : it.q[i])), st.dec));

// Tienda (como en el original: versión de prueba, no se cobra nada)
const SHOP = {
  gold: [
    { id: 'g1', name: 'Puñado de oro', amt: 1000, eur: 0.99, note: 'Para ir tirando.' },
    { id: 'g2', name: 'Saco de oro', amt: 6000, eur: 4.99, note: 'El CEO te lo agradece personalmente (no).' },
    { id: 'g3', name: 'Cofre de oro', amt: 13000, eur: 9.99, note: 'Huele a los millones de Microblizz.' },
    { id: 'g4', name: 'Cámara acorazada', amt: 28000, eur: 19.99, note: 'Incluye la llave. La puerta no.' },
    { id: 'g5', name: 'Bóveda del CEO', amt: 75000, eur: 49.99, note: 'Para subir cartas al 10 sin mirar el precio.' },
  ],
  gems: [
    { id: 'e1', name: 'Bolsita de gemas', amt: 100, eur: 0.99, note: 'Dos tiradas del gashapón.' },
    { id: 'e2', name: 'Puñado de gemas', amt: 550, eur: 4.99, note: 'Brillan más que el futuro de Microblizz.' },
    { id: 'e3', name: 'Saco de gemas', amt: 1200, eur: 9.99, note: '' },
    { id: 'e4', name: 'Cofre de gemas', amt: 2600, eur: 19.99, note: '' },
    { id: 'e5', name: 'Caja fuerte de gemas', amt: 7000, eur: 49.99, note: 'Ni el becario sabe la combinación.' },
  ],
  joke: { name: 'Paquete Millonario', amt: 1000000, was: 500, eur: 100 },
  gift: { gold: 100, gems: 5 },
};

/* ---------- guardado (misma forma que el del original) ---------- */
function metaDefaults(s) {
  const d = { gold: ECON.start.gold, gems: ECON.start.gems, units: {}, inv: [], invSeq: 0, abEquip: {}, equip: {}, pity: {}, giftDay: '', idle: null, seenVer: '', tickets: 0 };
  for (const k in d) if (s[k] == null) s[k] = d[k];
  // partidas guardadas con la primera versión del progreso: nivel por carta, un solo número de calidad y todo el equipo junto
  if (s.cards) { for (const k in s.cards) s.units[k] = { lvl: s.cards[k].lvl || 1, xp: 0 }; delete s.cards; }
  for (const it of s.inv) { if (!it.u) { it.u = 'i' + it.n; delete it.n; } if (!Array.isArray(it.q)) it.q = defOfSafe(it) ? defOfSafe(it).st.map(() => it.q) : [it.q]; }
  if (s.gear) { for (const k in s.gear) for (const sl in s.gear[k]) { const u = 'i' + s.gear[k][sl]; if (sl === 'ab') s.abEquip[k] = u; else (s.equip[k] = s.equip[k] || {})[sl] = u; } delete s.gear; }
  if (s.seq) { s.invSeq = Math.max(s.invSeq, s.seq); delete s.seq; }
  s.inv = s.inv.filter(it => defOfSafe(it));
  return s;
}
const defOfSafe = it => (it.k === 'ab' ? ABILITIES : ITEMS)[it.id];
const uSave = k => SAVE.units[k] || (SAVE.units[k] = { lvl: 1, xp: 0 });
const invGet = u => (u ? SAVE.inv.find(it => it.u === u) : null);
const facOfCard = k => FACTION_ORDER.find(f => FACTIONS[f].leader === k || FACTIONS[f].units.includes(k));

/* ---------- lo que lleva una carta, sumado y listo para el motor ---------- */
const noSides = () => Object.fromEntries(SIDES.map(s => [s, {}]));
const NOMODS = Object.assign({ lvl: 1, lvlMul: 1, n: 0 }, noSides());
function cardMods(k) {
  const lvl = (SAVE.units[k] && SAVE.units[k].lvl) || 1, M = Object.assign({ lvl, lvlMul: 1 + ECON.lvlStep * (lvl - 1), n: 0 }, noSides()), E = SAVE.equip[k] || {};
  for (const it of [invGet(SAVE.abEquip[k]), ...Object.keys(SLOTS).map(sl => invGet(E[sl]))]) {
    if (!it) continue; const D = defOf(it), V = valsOf(it); M.n++;
    D.fx.forEach(([side, st, c], i) => { const v = D.fi[i] < 0 ? c : V[D.fi[i]]; M[side][st] = (M[side][st] || 0) + (st === 'cc' ? 1 : STATS[side][st][1] ? v / 100 : v); });
  }
  return M;
}
/* ---------- experiencia y recompensas de las partidas (cuánto se da lo decide cada juego) ---------- */
function xpGrant(win) { const X = G.xpPlay || {}; let n = 0; for (const k in X) { const g = Math.round(X[k] * (win ? ECON.winXpMult : 1)); uSave(k).xp += g; n += g; } G.xpPlay = {}; return n; }
function give(gold, gems, xp) { SAVE.gold += gold; SAVE.gems += gems; saveGame(); return `<span class="rw-chip ol">${COIN_SVG}+${fmt(gold)}</span>${gems ? `<span class="rw-chip ol">${GEM_SVG}+${fmt(gems)}</span>` : ''}${xp ? `<div class="rw-xp">Experiencia: +${fmt(xp)} para las cartas que has usado</div>` : ''}`; }

/* ---------- horas extra: el líder que elijas sigue trabajando aunque no juegues. Se llena a las 12 h. El poder del líder lo calcula cada juego (idlePower) ---------- */
const IDLE = { cap: 12, gold: 60, gExp: 1.6, gems: 1, gemsK: 2.5, item: 0.02, itemK: 0.05 };
