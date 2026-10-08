// Fans of Rumble · Campos (1/2): los terrenos de los campos de jefe y su lógica
'use strict';
/* ---------- v0.9.18-0.9.19: campos de jefe ----------
   Cada jefe de mundo pelea en su propio campo, que sorprende al jugador y afecta a los DOS bandos:
   · un río distinto (lava, café, dulces, arcoíris, discos…), y a veces helado: se cruza por donde sea
   · 1, 2 o 3 puentes (de piedra, metal, galleta, oro…), un túnel donde no se ve la pelea o un peaje
   · zonas en el suelo, en sitios distintos cada partida: queman, pegan, resbalan, hacen tropezar, pinchan, aceleran o curan
   · cosas que caen del cielo con aviso: meteoritos, chicles gigantes, diapositivas del CEO…
   Los que vuelan no pisan las zonas del suelo, pero lo que cae del cielo les da igual.
   Para cambiar un campo: su entrada en TERRAINS. Para cambiar qué jefe lleva cuál: TERRAIN_OF (mundo empezando por 0). */

// ---- tipos de zona: qué hacen
//   burn: quema v (fracción de la vida) por segundo · spike: v de daño cada cuarto de segundo mientras anda
//   slow / fast: multiplica la velocidad por v · slide: más rápido y se va de lado · trip: al entrar, aturdido v segundos
//   heal: cura v (fracción de la vida) por segundo
const TERRAINS = {
  cafe: {
    ground: ['#c49a6a', 0.22],
    name: 'OFICINA INUNDADA', sub: 'Río de café, charcos que resbalan y cartas de despido que caen del techo.',
    tint: ['#e6c9a8', 0], river: { c: ['#3b2412', '#7a4a22', '#a8703f'], float: 'foam' }, bridges: [110, 430], bstyle: 'metal',
    zones: [{ kind: 'slide', art: 'coffee', n: 2, v: 1.45, rx: 34, ry: 18 }],
    fall: { art: 'paper', every: 9, warn: 1.4, r: 36, dmg: 0.03, stun: 1.1, say: '¡DESPEDIDO!' },
  },
  cripta: {
    ground: ['#14241a', 0.32],
    name: 'LA CRIPTA DEL TÚNEL', sub: 'Un túnel cruza por debajo del río: lo que pasa dentro, no se ve. Y las tumbas te agarran.',
    tint: ['#9fb4c8', 0.04], river: { c: ['#123b1f', '#2f9a4b', '#8ef07a'], float: 'slime' }, bridges: [110, 430], bstyle: 'stone',
    tunnel: 270,
    zones: [{ kind: 'slow', art: 'grave', n: 2, v: 0.45, rx: 30, ry: 17, say: '¡AGARRADO!' }],
  },
  plato: {
    ground: ['#2b1446', 0.22], weather: 'confetti',
    name: 'PLATÓ EN DIRECTO', sub: 'Río de chat, tres puentes, cables por el suelo y focos que se descuelgan.',
    tint: ['#e2c8ff', 0.04], river: { c: ['#2b1446', '#6d28c9', '#c084fc'], float: 'emoji' }, bridges: [110, 270, 430], bstyle: 'neon',
    zones: [{ kind: 'trip', art: 'cable', n: 3, v: 0.7, rx: 34, ry: 14, say: '¡TROPIEZO!' }],
    fall: { art: 'spot', every: 11, warn: 1.5, r: 38, dmg: 0.08, stun: 0.5 },
  },
  olimpo: {
    ground: ['#ffffff', 0.55], weather: 'snow',
    name: 'OLIMPO NEVADO', sub: '¡El río está helado! Se cruza por donde quieras, pero resbala. Y ojo con las bolas de nieve.',
    tint: ['#dfeeff', 0.08], river: { c: ['#8fc6e8', '#cfeaff', '#ffffff'], float: 'ice', frozen: true }, bridges: [110, 430], bstyle: 'stone',
    zones: [{ kind: 'slow', art: 'snow', n: 2, v: 0.55, rx: 36, ry: 19 }],
    fall: { art: 'snowball', every: 10, warn: 1.5, r: 34, dmg: 0.06, stun: 1 },
  },
  lava: {
    ground: ['#3a1206', 0.38],
    name: 'RÍO DE LAVA', sub: 'Grietas que queman a los dos bandos, en sitios distintos cada vez. ¡Y caen meteoritos!',
    tint: ['#d98a6a', 0.1], glow: true, river: { c: ['#b3200c', '#ff8a1c', '#ffd23f'], float: 'crust' }, bridges: [110, 430], bstyle: 'metal',
    zones: [{ kind: 'burn', art: 'lava', n: 2, v: 0.04, rx: 30, ry: 17 }],
    fall: { art: 'meteor', every: 8, warn: 1.6, r: 34, dmg: 0.1, leave: { kind: 'burn', art: 'lava', v: 0.06, rx: 26, ry: 15, life: 7 } },
  },
  dulces: {
    ground: ['#ffb6d9', 0.38], weather: 'sprinkles',
    name: 'FÁBRICA DE DULCES', sub: 'Río de chocolate, puentes de galleta y chicle por todas partes: ¡te quedas pegado!',
    tint: ['#ffd6ec', 0.05], river: { c: ['#3b1d0e', '#6b3a1f', '#9a5a32'], float: 'candy' }, bridges: [110, 270, 430], bstyle: 'cookie',
    zones: [{ kind: 'slow', art: 'gum', n: 3, v: 0.42, rx: 30, ry: 16, say: '¡PEGADO!' }],
    fall: { art: 'gumball', every: 9, warn: 1.4, r: 32, dmg: 0.05, leave: { kind: 'slow', art: 'gum', v: 0.4, rx: 26, ry: 14, life: 10 } },
  },
  juntas: {
    ground: ['#f3e3b5', 0.3], weather: 'paper',
    name: 'LA SALA DE JUNTAS', sub: 'Río de monedas, piezas de construcción en el suelo (1 de daño al pisarlas) y… ¡diapositivas del CEO!',
    tint: ['#fff2c8', 0.04], river: { c: ['#7a5310', '#d99a1f', '#ffe06a'], float: 'coin' }, bridges: [110, 430], bstyle: 'gold',
    zones: [{ kind: 'spike', art: 'bricks', n: 3, v: 1, rx: 30, ry: 15 }],
    fall: { art: 'slide', every: 8, warn: 1.5, r: 40, dmg: 0, stun: 1.5, say: () => `DIAPOSITIVA ${Math.floor(rand(12, 300))} DE 300` },
  },
  sotano: {
    ground: ['#141224', 0.4], weather: 'dust',
    name: 'EL SÓTANO', sub: 'Un solo puente en el centro, ratoneras escondidas y cajas que se caen de las estanterías.',
    tint: ['#9a9ab8', 0.12], river: { c: ['#1c2a3a', '#2e4a63', '#5d7f99'], float: 'cart' }, bridges: [270], bstyle: 'box',
    zones: [{ kind: 'trip', art: 'trap', n: 2, v: 1, rx: 24, ry: 14, say: '¡CLAC!' }],
    fall: { art: 'box', every: 10, warn: 1.5, r: 34, dmg: 0.08, stun: 0.4 },
  },
  discos: {
    ground: ['#c8d4ff', 0.25],
    name: 'LA TIENDA SIN DISCOS', sub: 'Un río de discos de verdad (formato físico), cristales rotos en el suelo y una lluvia de CDs.',
    tint: ['#d8e4ff', 0.04], river: { c: ['#1d2b5c', '#3b56a8', '#8fb4ff'], float: 'cd' }, bridges: [110, 430], bstyle: 'box',
    zones: [{ kind: 'spike', art: 'shards', n: 3, v: 1, rx: 30, ry: 15 }],
    fall: { art: 'disc', every: 6, warn: 1.2, r: 26, dmg: 0.05 },
  },
  lan: {
    ground: ['#06140b', 0.4], weather: 'pixels',
    name: 'LA LAN PARTY', sub: 'Río de bebida energética, tres puentes, alfombras RGB que te aceleran, cables… ¡y picos de lag!',
    tint: ['#cfffe0', 0.03], river: { c: ['#0b3b1c', '#1fbf5a', '#b6ff3a'], float: 'drink' }, bridges: [110, 270, 430], bstyle: 'neon',
    zones: [{ kind: 'fast', art: 'boost', n: 2, v: 1.5, rx: 30, ry: 15, say: '¡TURBO!' }, { kind: 'trip', art: 'cable', n: 1, v: 0.7, rx: 34, ry: 14, say: '¡TROPIEZO!' }],
    fall: { art: 'lag', every: 10, warn: 1.3, r: 44, dmg: 0, stun: 1.2, say: 'LAG 999 ms' },
  },
  arcoiris: {
    ground: ['#ffd6f0', 0.3], weather: 'confetti',
    name: 'EL PLATÓ ARCOÍRIS', sub: 'Río de arcoíris, pintura fresca que frena, maquillaje que cura… y focos que caen.',
    tint: ['#fff0fa', 0.03], river: { c: ['#ff5f6d', '#ffcb3d', '#4ade80'], float: 'rainbow', rainbow: true }, bridges: [110, 270, 430], bstyle: 'gold',
    zones: [{ kind: 'slow', art: 'paint', n: 2, v: 0.6, rx: 32, ry: 17 }, { kind: 'heal', art: 'makeup', n: 1, v: 0.025, rx: 28, ry: 15, say: '¡RETOQUE!' }],
    fall: { art: 'spot', every: 9, warn: 1.5, r: 38, dmg: 0.08, stun: 0.5 },
  },
  sede: {
    ground: ['#1c1640', 0.32],
    name: 'LA SEDE DE PAGO', sub: 'Los puentes tienen PEAJE: cada vez que una unidad cruza, su equipo paga 0,3 de CAOS. Suelo de mármol que resbala y facturas que vuelan.',
    tint: ['#e8e0ff', 0.05], river: { c: ['#0f1530', '#24306b', '#5a6ad8'], float: 'card' }, bridges: [110, 430], bstyle: 'gold', toll: 0.3,
    zones: [{ kind: 'slide', art: 'marble', n: 2, v: 1.4, rx: 34, ry: 18 }],
    fall: { art: 'bill', every: 9, warn: 1.4, r: 34, dmg: 0.04, stun: 0.8, say: 'FACTURA: 9,99 €' },
  },
};
// jefe de cada mundo → su campo
const TERRAIN_OF = { 0: 'cafe', 1: 'cripta', 2: 'plato', 3: 'olimpo', 4: 'lava', 5: 'dulces', 6: 'juntas', 7: 'sotano', 8: 'discos', 9: 'lan', 10: 'arcoiris', 11: 'sede' };
const BSTYLES = {
  stone: { deck: '#9a958c', plank: '#6f6a62', rail: '#7d7870', post: '#5d5850' },
  metal: { deck: '#8a98a8', plank: '#5d6b7a', rail: '#4d5866', post: '#3b4450', dots: '#c9d4df' },
  neon: { deck: '#2b1446', plank: '#d43cff', rail: '#3e2363', post: '#7df3ff' },
  cookie: { deck: '#d9a05b', plank: '#a8703f', rail: '#ff9ac8', post: '#ff6fb0', dots: '#7a4a22' },
  gold: { deck: '#e0a92a', plank: '#b07a10', rail: '#ffe06a', post: '#c48a12' },
  box: { deck: '#c99a62', plank: '#9a6f3e', rail: '#8a5f30', post: '#6b4520' },
};
const TR = { on: null, key: null, t: 0, zones: [], falls: [], fallT: 0, built: '' };
function terrainFor(mode, lvl) {
  if (mode === 'camp' && lvl && lvl.boss) return TERRAIN_OF[lvl.wi] || null;
  if (mode === 'boss') return TERRAIN_OF[G.bossWi] || null;
  if (mode === 'pvp') return pvpTerreno();
  return null;
}
// PvP: el campo sale al azar entre todos (el normal y los 12 de jefe), pero con la semilla de la partida: los dos jugadores tienen el mismo. PVP.terreno ('' = el normal, o una clave) lo fija.
function pvpTerreno() {
  if (PVP.terreno !== undefined && PVP.terreno !== null) return PVP.terreno || null;
  const todos = [null].concat(Object.keys(TERRAINS)), r = mulberry32(((G.seedNext == null ? 0 : G.seedNext) ^ 0x5bd1e995) >>> 0)();
  return todos[Math.floor(r * todos.length)];
}
// zonas repartidas al azar: las mismas en cada mitad (para que sea justo), pero en sitios distintos cada partida
function terrainPlace(defs) {
  const out = [];
  if (G.pvp) {   // PvP: se reparten en la mitad de arriba y la de abajo es su reflejo (y' = 840 - y): exactamente lo mismo para los dos
    for (const d of defs) for (let i = 0; i < d.n; i++) for (let tries = 0; tries < 60; tries++) {
      const x = srand(64, W - 64), y = srand(292, 380), y2 = 840 - y;
      if (out.some(z => Math.hypot((z.x - x) / 1.4, z.y - y) < 46 || Math.hypot((z.x - x) / 1.4, z.y - y2) < 46)) continue;
      if (structs.some(s => Math.hypot(s.x - x, (s.y - y) * 1.3) < s.r + (d.rx || 30) + 6 || Math.hypot(s.x - x, (s.y - y2) * 1.3) < s.r + (d.rx || 30) + 6)) continue;
      for (const yy of [y, y2]) out.push(Object.assign({}, d, { x, y: yy, rx: d.rx || 30, ry: d.ry || 16, id: out.length + 1, seed: Math.random() * 1000, life: Infinity }));
      break;
    }
    return out;
  }
  for (const d of defs) for (const half of ['e', 'p']) for (let i = 0; i < d.n; i++) for (let tries = 0; tries < 60; tries++) {
    const x = srand(64, W - 64), y = half === 'e' ? srand(292, 380) : srand(462, 556);
    if (out.some(z => Math.hypot((z.x - x) / 1.4, z.y - y) < 46)) continue;
    if (structs.some(s => Math.hypot(s.x - x, (s.y - y) * 1.3) < s.r + (d.rx || 30) + 6)) continue;
    out.push(Object.assign({}, d, { x, y, rx: d.rx || 30, ry: d.ry || 16, id: out.length + 1, seed: Math.random() * 1000, life: Infinity })); break;
  }
  return out;
}
function terrainStart() {   // al empezar la partida (después de colocar las torres)
  const k = G.terrain || null, T = k ? TERRAINS[k] : null; TR.on = T; TR.key = k; TR.t = 0; TR.zones = []; TR.falls = [];
  const br = T ? (T.tunnel ? [...new Set(T.bridges.concat(T.tunnel))].sort((a, b) => a - b) : T.bridges) : BASE_BRIDGES;
  BRIDGES.length = 0; BRIDGES.push(...br); RIVER_OPEN = !!(T && T.river.frozen); BRIDGE_STYLE = T ? BSTYLES[T.bstyle] || null : null;
  const sig = BRIDGES.join(',') + '|' + (T ? T.bstyle : '');
  if (TR.built !== sig) { BRIDGE_LAYER = buildBridges(); TR.built = sig; }
  if (!T) return;
  TR.zones = terrainPlace(T.zones || []); TR.fallT = T.fall ? T.fall.every * 0.7 : 0;
  setTimeout(() => { if (TR.on === T && (G.state === 'play' || G.state === 'countdown')) banner('¡' + T.name + '!', T.sub, 'boss'); }, 700);
}
const inZone = (u, z, grow = 1) => { const dx = (u.x - z.x) / (z.rx * grow), dy = (u.y - z.y) / (z.ry * grow); return dx * dx + dy * dy < 1; };
const inTunnel = u => TR.on && TR.on.tunnel != null && Math.abs(u.x - TR.on.tunnel) < 40 && u.y > RIVER.top - 44 && u.y < RIVER.bottom + 44;
function tSay(u, txt, col) { if (!u.saidT || G.t - u.saidT > 2.2) { u.saidT = G.t; addNum(u.x, u.y, topOf(u) + 16, typeof txt === 'function' ? txt() : txt, col || '#ffe06a', 13); } }
function terrainUpdate(dt) {
  const T = TR.on; if (!T || G.state !== 'play') return;
  TR.t += dt;
  // cosas que caen del cielo: aviso (sombra que crece) y golpe
  if (T.fall) {
    const F = T.fall;
    if ((TR.fallT -= dt) <= 0) {
      TR.fallT = F.every * srand(0.8, 1.2);
      let x = srand(60, W - 60), y = G.pvp ? srand(230, 610) : srand(250, 610);   // en PvP, simétrico respecto al río
      const crowd = units.filter(u => u.alive && u.deployT <= 0);   // a veces apunta donde hay jaleo
      if (crowd.length && srnd() < 0.55) { const u = spick(crowd); x = clamp(u.x + srand(-40, 40), 40, W - 40); y = clamp(u.y + srand(-30, 30), G.pvp ? 200 : 230, 640); }
      TR.falls.push({ x, y, t: F.warn, max: F.warn, done: false }); play('deny');
    }
    for (const f of TR.falls) {
      f.t -= dt; if (f.done || f.t > 0) continue;
      f.done = true; f.boom = 0.5; G.shake = Math.max(G.shake, 4); play('boom');
      for (const u of units) {
        if (!u.alive || u.deployT > 0 || Math.hypot(u.x - f.x, (u.y - f.y) * 1.25) > F.r + u.r * 0.5) continue;
        if (F.dmg) hurt(u, Math.max(1, Math.round(u.maxHp * F.dmg)), null, 'aoe');
        if (F.stun && u.alive && !u.immuneCC) { u.stunT = Math.max(u.stunT || 0, F.stun); u.stunKind = 'daze'; }
        if (F.say && u.alive) tSay(u, F.say, '#ffffff');
      }
      if (F.leave) TR.zones.push(Object.assign({}, F.leave, { x: f.x, y: f.y, id: 1000 + Math.floor(srnd() * 1e6), seed: Math.random() * 1000, life: F.leave.life, max: F.leave.life }));
    }
    TR.falls = TR.falls.filter(f => !f.done || (f.boom -= dt) > 0);
  }
  for (const z of TR.zones) if (z.life !== Infinity) z.life -= dt;
  TR.zones = TR.zones.filter(z => z.life > 0);
  // efectos del suelo
  for (const u of units) {
    u.tSpd = 1;
    if (!u.alive || u.deployT > 0 || u.jump) continue;
    const fly = TYPES[u.type] && TYPES[u.type].hover;
    if (T.toll) {   // peaje al cruzar el río
      const side = u.y < RIVER.y;
      if (u.tSide !== undefined && u.tSide !== side && S[u.team]) { S[u.team].chaos = Math.max(0, S[u.team].chaos - T.toll); addNum(u.x, u.y, topOf(u) + 16, `PEAJE -${fmtV(T.toll)} CAOS`, '#d8b4fe', 12); }
      u.tSide = side;
    }
    if (fly) continue;
    if (RIVER_OPEN && u.y > RIVER.top && u.y < RIVER.bottom) { u.tSpd = 1.35; u.x += Math.sin(TR.t * 2.4 + u.id) * 26 * dt; }   // hielo: resbala
    let trip = 0;
    for (const z of TR.zones) {
      if (!inZone(u, z)) continue;
      switch (z.kind) {
        case 'burn': u.tAcc = (u.tAcc || 0) + u.maxHp * z.v * dt; break;
        case 'spike': if (u.moving) { u.tSpk = (u.tSpk || 0) + dt; if (u.tSpk >= 0.25) { u.tSpk = 0; hurt(u, z.v, null, 'hit'); } } break;
        case 'slow': u.tSpd = Math.min(u.tSpd, z.v); if (z.say) tSay(u, z.say, '#ff9ef0'); break;
        case 'fast': u.tSpd = Math.max(u.tSpd, z.v); if (z.say) tSay(u, z.say, '#7df3ff'); break;
        case 'slide': u.tSpd = Math.max(u.tSpd, z.v); u.x += Math.sin(TR.t * 3 + u.id) * 30 * dt; break;
        case 'trip': trip = z.id; if (u.tTrip !== z.id && !u.immuneCC) { u.stunT = Math.max(u.stunT || 0, z.v); u.stunKind = 'daze'; if (z.say) tSay(u, z.say, '#ffe06a'); } break;
        case 'heal': if (u.hp < u.maxHp) { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * z.v * dt); if (z.say) tSay(u, z.say, '#8cf05a'); } break;
      }
    }
    u.tTrip = trip;
    if (u.tAcc >= 1) { u.tT = (u.tT || 0) + dt; if (u.tT >= 0.5) { const n = Math.floor(u.tAcc); u.tAcc -= n; u.tT = 0; hurt(u, n, null, 'rage'); if (Math.random() < 0.15) tSay(u, '¡QUEMA!', '#ff8a3d'); } }
    u.x = clamp(u.x, BOUNDS.x0 + u.r * 0.5, BOUNDS.x1 - u.r * 0.5);
  }
}

