// Fans of Rumble · Combate (5/5): la IA rival, el final de la partida, el bucle de juego y los efectos de muerte
'use strict';

/* ---------- enemy brain (also drives your side in autoplay tests) ---------- */
function chooseLane(team) {
  const t = towers[other(team)];
  if (!t[0].alive && t[1].alive) return 0; if (!t[1].alive && t[0].alive) return 1;
  const a = t[0].alive ? t[0].hp / t[0].maxHp : 0, b = t[1].alive ? t[1].hp / t[1].maxHp : 0;
  if (Math.abs(a - b) > 0.15) return a < b ? 0 : 1;
  return srnd() < 0.5 ? 0 : 1;
}
function aiUpdate(team, dt) {
  const A = AI[team]; A.think -= dt; if (A.think > 0) return;
  const D = G.diffCfg; A.think = team === 'e' ? srand(D.think[0], D.think[1]) : srand(0.6, 1.2);
  const me = S[team], foe = other(team); const cards = team === 'e' ? CFG.enemyCards : CFG.cards; const zone = ZONE[team];
  if (aiSpell(team, me.deck.filter(isSpell).map(k => ({ k, slot: -2 })), (c, x, y) => doDeploy(team, c.k, x, y))) return;   // v0.9.15
  const can = k => me.deck.includes(k) && me.chaos >= cards[k].cost && canDeploy(team, k);
  const myHalf = u => (team === 'e' ? u.y < RIVER.y + 24 : u.y > RIVER.y - 24);
  const myBase = bases[team];
  const threats = units.filter(u => u.alive && u.team === foe && u.deployT <= 0 && u.stealthT <= 0 && myHalf(u)).sort((a, b) => dst(a, myBase) - dst(b, myBase));
  if (threats.length) {
    const t = threats[0];
    const mine = units.filter(u => u.alive && u.team === team && !u.d.buildings && dst(u, t) < 130).length;
    if (mine < threats.length + 1) {
      const pref = team === 'e' ? (t.hp > 300 ? ['starbot', 'becario'] : ['becario', 'starbot']) : ['squirrel', 'fox', 'bunny'];
      const k = pref.find(can);
      if (k) { const x = clamp(t.x + srand(-20, 20), 34, W - 34), y = clamp(t.y + (team === 'e' ? -70 : 70), zone.y0 + 8, zone.y1 - 8); doDeploy(team, k, x, y); }
      return;
    }
  }
  if (!A.plan) {
    const plans = team === 'e' ? [['fallen', 'starbot'], ['becario', 'starbot'], ['fallen', 'becario'], ['starbot', 'becario', 'becario']] : [['bunny', 'squirrel'], ['fox', 'squirrel'], ['squirrel', 'fox', 'squirrel']];
    const ok = plans.map(pl => pl.filter(k => me.deck.includes(k))).filter(pl => pl.length);
    A.plan = { seq: (ok.length ? spick(ok) : [me.deck[0]]).slice(), lane: chooseLane(team), wait: srand(6, 9.5), started: false };
  }
  const P = A.plan; const k = P.seq[0];
  if (!canDeploy(team, k)) { P.seq.shift(); if (!P.seq.length) A.plan = null; return; }
  const total = P.seq.reduce((a, c) => a + cards[c].cost, 0);
  if (me.chaos < cards[k].cost) return;
  if (P.started || me.chaos >= Math.min(P.wait, total) || me.chaos >= CFG.chaosMax - 0.3) {
    const bx = laneBridge(P.lane); const tank = k === 'fallen' || k === 'bunny';
    const front = team === 'e' ? 330 : 495, back = team === 'e' ? 296 : 530;
    doDeploy(team, k, clamp(bx + srand(-16, 16), 34, W - 34), P.started && !tank ? back : front);
    P.started = true; P.seq.shift(); if (!P.seq.length) A.plan = null;
  }
}
// B (lee el campo): contra qué papel te conviene responder, según lo que tengas más en el campo
const CONTRA = { tank: ['assassin', 'control', 'buster'], swarm: ['control', 'ranged', 'buster', 'tank'], ranged: ['assassin', 'swarm', 'buster'], support: ['assassin', 'swarm', 'buster'], assassin: ['tank', 'support', 'ranged'], control: ['buster', 'assassin', 'swarm'], buster: ['tank', 'swarm', 'control'] };
function foeRoleDom(team) {
  const foe = other(team), cuenta = {};
  for (const u of units) if (u.alive && u.team === foe && u.deployT <= 0 && ROLES[u.type]) cuenta[ROLES[u.type]] = (cuenta[ROLES[u.type]] || 0) + 1;
  let dom = null, best = 0; for (const r in cuenta) if (cuenta[r] > best) { best = cuenta[r]; dom = r; }
  return dom;
}
// B (reparte): el carril donde tienes menos unidades; si están igual, el de la torre más débil
function laneLess(team) {
  const foe = other(team), n = [0, 1].map(l => units.filter(u => u.alive && u.team === foe && u.deployT <= 0 && Math.abs(u.x - laneBridge(l)) < 90).length);
  if (n[0] !== n[1]) return n[0] < n[1] ? 0 : 1;
  return chooseLane(team);
}
// IA por papeles (tanque, enjambre, distancia...): juega cualquier mazo. La usan los rivales de facción y el modo automático de pruebas
function aiGeneric(team, dt) {
  const A = AI[team]; A.think -= dt; if (A.think > 0) return;
  const D = G.diffCfg; A.think = team === 'e' ? srand(D.think[0], D.think[1]) : srand(0.6, 1.2);
  const me = S[team], foe = other(team), F = FACTIONS[facOf(team)], zone = ZONE[team], dir = team === 'p' ? 1 : -1;
  const avail = me.hand.map((k, i) => ({ k, slot: i })).filter(a => a.k);   // v1: la IA juega con la misma mano de 4 que el jugador (sin huecos si su mazo tiene menos de 4)
  if (F.leader && canDeploy(team, F.leader)) avail.push({ k: F.leader, slot: -1 });
  const find = roles => { for (const role of roles) { const c = avail.find(a => ROLES[a.k] === role && me.chaos >= cardDef(a.k).cost); if (c) return c; } return null; };
  const go = (c, x, y) => playCard(team, team === 'e' && !me.queue.length ? -2 : c.slot, c.k, x, y);   // gasta la carta y la rota en la mano, igual que tú (sin cola, con mazos de 4 o menos, la carta no se va de la mano)
  // v2: los hechizos de la IA salen de su mazo (no de la mano), así no se quedan atascados esperando un objetivo
  const hechizos = team === 'p' ? [] : sshuffle(me.deck.filter(k => isSpell(k)).map(k => ({ k, slot: -2 })));
  if (aiSpell(team, avail.concat(hechizos), go)) return;   // v0.9.15: hechizos (sobre todo contra tus sanadores)
  const myHalf = u => (team === 'e' ? u.y < RIVER.y + 24 : u.y > RIVER.y - 24);
  const bh = team === 'e' && G.mode === 'boss' && !!G.bossDiff && G.bossDiff !== 'n';
  const hard = bh || (team === 'e' && G.mode === 'camp' && cdHard(G.cdiff)), myth = hard && (bh ? G.bossDiff === 'm' : G.cdiff === 'm');
  const threats = units.filter(u => u.alive && u.team === foe && u.deployT <= 0 && u.stealthT <= 0 && myHalf(u)).sort((a, b) => dst(a, bases[team]) - dst(b, bases[team]));
  if (threats.length) {
    // defiende si la amenaza está cerca de una torre (o le sobra CAOS); si no, ahorra para atacar
    const t = threats[0];
    const foeHp = threats.filter(o => dst(o, t) < 120).reduce((a, o) => a + o.hp, 0);
    const myHp = units.filter(u => u.alive && u.team === team && !u.d.buildings && !u.d.healer && dst(u, t) < 140).reduce((a, u) => a + u.hp, 0);
    const close = structs.some(s => s.alive && s.team === team && dst(s, t) < 170);
    if (myHp < foeHp * (hard ? 1.6 : 1.2) && (close || me.chaos >= (hard ? 6 : 9))) {
      const c = find([...(CONTRA[ROLES[t.type]] || []), 'ranged', 'swarm', 'control', 'assassin', 'tank', 'support']);   // v2: defiende con el contrario de lo que le atacas
      if (c) { go(c, clamp(t.x + srand(-20, 20), 34, W - 34), clamp(t.y + 70 * dir, zone.y0 + 8, zone.y1 - 8)); A.plan = { lane: [0, 1].reduce((b, l) => Math.abs(t.x - laneBridge(l)) < Math.abs(t.x - laneBridge(b)) ? l : b, 0), n: 0 }; }   // v2: tras defender, contraataca en ese mismo carril
      return;
    }
  }
  if (!A.plan) A.plan = { lane: laneLess(team), n: 0 };
  const P = A.plan; if (P.n === 0 && me.chaos < (hard ? 6.5 : 8)) return;
  const dom = foeRoleDom(team), contra = dom ? CONTRA[dom] || [] : [];
  let c = P.n === 0 ? find(['tank', 'assassin', 'swarm']) : find([...contra, 'support', 'ranged', 'control', 'buster', 'swarm', 'assassin']);
  if (!c && me.chaos >= CFG.chaosMax - 1) c = avail.find(a => me.chaos >= cardDef(a.k).cost) || null;   // v2: con el CAOS casi lleno no lo dejes desperdiciar: juega lo que puedas pagar
  if (!c) { if (P.n > 0 && me.chaos >= 9) A.plan = null; return; }
  const front = team === 'p' ? 495 : 330, back = team === 'p' ? 530 : 296;
  go(c, clamp(laneBridge(P.lane) + srand(-16, 16), 34, W - 34), P.n === 0 ? front : back);
  P.n++; if (P.n >= (myth ? 4 : 3)) A.plan = null;
}
/* ---------- match flow ---------- */
function timeUp() {
  if (G.mode === 'boss') { endMatch('p', 'score'); return; }
  const pc = S.p.crowns, ec = S.e.crowns; let w = null;
  if (pc !== ec) w = pc > ec ? 'p' : 'e';
  else { const hp = t => structs.filter(s => s.team === t).reduce((a, s) => a + Math.max(0, s.hp) / s.maxHp, 0); const a = hp('p'), b = hp('e'); if (Math.abs(a - b) > 0.01) w = a > b ? 'p' : 'e'; }
  endMatch(w, pc !== ec ? 'crowns' : w ? 'hp' : 'draw');
}
function endMatch(w, reason) {
  if (G.state !== 'play') return;
  if (PVP.on) PVP.fin = { tick: SIM.tick, h: simHash() };   // lo que se compara con el rival: el mismo tick, la misma huella
  G.state = 'ending'; G.winner = w; G.endReason = reason; G.endT = 1.9; G.slowmo = 0.35;
  input.card = null; input.dragging = false; input.selected = null; input.ghost = null; hideTut(); $('#tut-tip').hidden = true;
  if (w === verEquipo()) { play('win'); for (let i = 0; i < 140; i++) parts.push({ type: 'conf', x: rand(0, W), y: rand(80, 780), z: rand(250, 700), vx: rand(-20, 20), vy: 0, vz: -rand(90, 160), g: 0, rot: rand(0, 6), vr: rand(-8, 8), life: 6, max: 6, color: pick(['#ff7a1a', '#ffcb3d', '#d43cff', '#63cfe0', '#ffffff', '#7be04a']) }); }
  else if (w) play('lose'); else play('tick');
  chatBurst(w === 'e' ? 'lose' : 'win', 3);
}
function updateGame(dt) {
  if (G.state === 'play') {
    if (G.mode !== 'sandbox') G.time -= dt;   // v0.9.20: en la sala de pruebas el tiempo no corre
    if (!G.double && G.time <= CFG.doubleAt) { G.double = true; $('#x2').hidden = false; banner('¡CAOS x2!', 'Último minuto: el CAOS se recarga el doble de rápido', 'chaos'); play('go'); chatSay('x2'); }
    chatTick(dt); chatWatch(dt);
    const rate = (G.double ? 2 : 1) / CFG.chaosEvery;
    S.p.chaos = Math.min(CFG.chaosMax, S.p.chaos + dt * rate * (G.pInc || 1));
    S.e.chaos = Math.min(CFG.chaosMax, S.e.chaos + dt * rate * G.diffCfg.aiIncome);
    for (const t of ['p', 'e']) if (S[t].leaderCd > 0) S[t].leaderCd = Math.max(0, S[t].leaderCd - dt);
    if (G.mode === 'sandbox') { S.p.chaos = CFG.chaosMax; S.e.chaos = CFG.chaosMax; if (SB.ai) aiGeneric('e', dt); sbTick(dt); }
    else if (G.pvp) { /* el rival juega por jugadas (simCmd), no con la IA */ }
    else if (G.classicAI) aiUpdate('e', dt); else aiGeneric('e', dt);
    terrainUpdate(dt);   // v0.9.18
    iaUpdate(dt);   // v0.9.23: pasivas de IAhorro y de Los Creadores, y el ¡Hotfix! de la IndieDev
    if (G.efac === 'phony') {   // v0.9.13: cada 20 s Phony te cobra la suscripción
      const PS = CFG.passives.phony; if (S.e.subT == null) S.e.subT = PS.every;
      S.e.subT -= dt;
      if (S.e.subT <= 0) {
        S.e.subT = PS.every; const take = Math.min(S.p.chaos, PS.take); S.p.chaos -= take; S.e.chaos = Math.min(CFG.chaosMax, S.e.chaos + PS.gain);
        const b = bases.p; addNum(b.x, b.y, TOPS[b.skin + '_base'] + 26, `SUSCRIPCIÓN: -${fmtV(rnd(take, 1))} CAOS`, '#ffcb3d', 14); play('card');
        if (!G.subShown) { G.subShown = true; banner('SUSCRIPCIÓN OBLIGATORIA', 'Pasiva de Phony: cada 20 s te cobra 0,5 de CAOS', 'enemy'); } else chatEv('sub', null, null, 0.5, 30);
      }
    }
    if (G.autoplay) aiGeneric('p', dt);
    updateBoss(dt);
    if (G.time <= 0) { G.time = 0; timeUp(); }
  }
  for (const r of revives) {
    r.t -= dt; if (r.t > 0) continue;
    const v = spawnUnit(r.team, r.type, r.x, r.y);
    v.hp = Math.round(v.maxHp * (r.frac || CFG.passives.nomuertos.hpFrac)); v.revived = true; v.rising = true; v.deployT = v.deployMax = 0.5; v.face = r.face; v.labelT = 0;
    if (r.seq) { const PP = CFG.passives.pop; v.sequel = true; v.mScale *= PP.scale; v.r *= PP.scale; v.maxHp = v.hp = Math.max(1, Math.round(v.maxHp * PP.hp)); v.labelT = 2.2; }
    const rgb = r.rgb || '94,242,160';
    ring(r.x, r.y, 8, 46, `rgba(${rgb},.9)`, 0.5, 5); puff(r.x, r.y, 10, r.col || '#7dffb8', 40, 6, true);
    addNum(r.x, r.y, TYPES[r.type].top + 16, r.txt || '¡RENACE!', r.col || '#7dffb8', 15); play(r.seq ? 'card' : 'revive'); r.done = true;
    if (r.team === 'p') chatEv(r.seq ? 'sequel' : 'revive', null, null, 0.5, 12);
  }
  if (revives.length) revives = revives.filter(r => !r.done);
  updatePassives();
  for (const u of units) if (u.alive) updateUnit(u, dt);
  for (const s of structs) updateStruct(s, dt);
  updateProjs(dt);
  updateSpells(dt);   // v0.9.15
  separate();
  for (const u of units) if (u.alive && !u.jump) constrain(u);
  units = units.filter(u => u.alive);
}
function updateParts(dt) {
  for (const p of parts) {
    p.life -= dt;
    if (p.type === 'env') {
      p.t += dt; const tg = p.tgt; if (tg.alive) { p.x = tg.x; p.y = tg.y; }
      const k = clamp(p.t / p.dur, 0, 1); p.z = lerp(170, TYPES[tg.type].top * 0.8, k * k);
      if (k >= 1) { p.life = 0; if (tg.alive && (G.state === 'play' || G.state === 'ending')) hurt(tg, p.dmg, null, 'boss'); puff(p.x, p.y, 5, '#ffffff', 30, 4, false, p.z); }
      continue;
    }
    if (p.vx !== undefined) { p.x += p.vx * dt; p.y += (p.vy || 0) * dt; }
    if (p.vz !== undefined) { p.vz -= (p.g || 0) * dt; p.z += p.vz * dt; if (p.z < 0) { if (p.type === 'conf') p.life = 0; else if (p.g) { p.z = 0; p.vz *= -0.3; p.vx *= 0.5; p.vy *= 0.5; } else p.z = 0; } }
    if (p.vr) p.rot += p.vr * dt;
  }
  parts = parts.filter(p => p.life > 0);
  if (parts.length > 700) parts.splice(0, parts.length - 700);
  for (const n of nums) { n.life -= dt; n.z += n.vz * dt; n.vz *= Math.pow(0.05, dt); }
  nums = nums.filter(n => n.life > 0);
}
const FUR = { bunny: ['#f7f3ff', '#ffb3cf', '#ff7a1a'], fox: ['#e8702a', '#fff4e6', '#7b2cbf'], squirrel: ['#b14d1c', '#f6d7a7'], beaver: ['#8a5a33', '#ffcb3d'], meercat: ['#d9b07a', '#ffffff'], junkcoon: ['#8d8f99', '#2b2d3a'], mechavaca: ['#ff8fc8', '#9fe3ff', '#3b3d47'], vaca: ['#ffffff', '#2b2d3a', '#ffb3cf'], necrolord: ['#3b2457', '#efeadf', '#5ef2d0'], skeleton: ['#efeadf'], zombie: ['#8fbf6a', '#bcd3e8'], ghostmage: ['#bef0eb', '#6a3fb0'], banshee: ['#e3def5', '#ffffff'], skullknight: ['#4a5677', '#efeadf', '#9fe3ff'], stitchbrute: ['#9cb88a', '#c6a4c9'],
  twitchking: ['#8b5cf6', '#e11d74', '#ffcb3d'], subswarm: ['#8b5cf6', '#22d3ee'], hypebeast: ['#f97316', '#111827'], viralbot: ['#4b4b66', '#8b5cf6', '#ff3348'], snackmom: ['#60a5fa', '#fde68a'], hypetrain: ['#8b5cf6', '#ffcb3d', '#2b2d3a'], banhammer: ['#16a34a', '#6b7280'],
  epicchampion: ['#facc15', '#2563eb', '#ef4444'], cupidarcher: ['#fbcfe8', '#ffffff', '#fcd34d'], hoplite: ['#d97706', '#dc2626'], shieldmaiden: ['#9ca3af', '#a16207', '#fcd34d'], thundergod: ['#f5f5f4', '#ffe14d'], medusa: ['#86efac', '#a855f7'], minotaur: ['#92400e', '#d1d5db'],
  cybermarine: ['#4b5563', '#22e3ff', '#0e7490'], drone: ['#4b5563', '#22e3ff'], nanobot: ['#cbd5e1', '#22e3ff'], cyberninja: ['#1f2937', '#ff3df0', '#22e3ff'], techdroid: ['#eef2f7', '#22d3ee'], hackerkid: ['#374151', '#a3ff7a'], neonsniper: ['#312e81', '#ff3df0'], siegemech: ['#6b7280', '#ffcb3d', '#22e3ff'],
  memelord: ['#7c3aed', '#16a34a', '#ffcb3d'], suchdog: ['#e8a04a', '#fff7ea'], gifblaster: ['#f97316', '#e5e7eb', '#8b5cf6'], synthcat: ['#f59e0b', '#ec4899'], trollbot: ['#6b7280', '#9ca3af', '#ff3348'], stonks: ['#1e3a8a', '#dc2626', '#16a34a'], chonkcat: ['#f59e0b', '#fde7c0'],
  progamer: ['#111827', '#22c55e', '#7c3aed'], noobs: ['#f97316', '#3b82f6'], speedrunner: ['#16a34a', '#dc2626'], modder: ['#0d9488', '#57534e'], coleccionista: ['#f59e0b', '#e5e7eb', '#2563eb'], ragequitter: ['#4b5563', '#f87171'], recreativa: ['#7c3aed', '#ffe14d', '#7be04a'],
  vikingo: ['#7c4a1e', '#e2572b', '#aab4c4'], swarmbug: ['#7c3aed', '#c4b5fd'], vikingsquad: ['#3b5b8a', '#f2c94c'], retromarine: ['#4d7c0f', '#fb923c'], ghostagent: ['#374151', '#22e3ff'], rockracer: ['#dc2626', '#ffffff', '#1f2937'], titanbeta: ['#78716c', '#ffe14d', '#65a30d'],
  directora: ['#d97706', '#dc2626', '#1f2937'], extras: ['#9ca3af', '#d6b07a'], doble: ['#f5f5f4', '#dc2626'], detective: ['#c8a97e', '#5b4636'], heroe: ['#2563eb', '#dc2626', '#facc15'], spoiler: ['#16a34a', '#f5f0e1'], kaiju: ['#8b5cf6', '#f472b6', '#facc15'] , huron: ["#9a6634", "#f3dfc0", "#e63946"], sombra: ["#3b1d5c", "#7dffb8"], hater: ["#6b7280", "#f1c9a5", "#e63946"], arpia: ["#9a6634", "#4a2f6b", "#ffb04f"], dron: ["#334155", "#ff3348", "#22e3ff"], clickbait: ["#ffe14d", "#ff3348", "#fff6ea"], campero: ["#65a30d", "#3f6212", "#a3e635"], espia: ["#c8a46e", "#4b5563", "#111827"], paparazzi: ["#78716c", "#e63946", "#ffe14d"] };
const BIG = ['mechavaca', 'stitchbrute', 'banhammer', 'minotaur', 'siegemech', 'chonkcat', 'hypetrain', 'recreativa', 'titanbeta', 'kaiju'];
const CORP_BIG = ['fallen', 'parchebot', 'cobradlc', 'servidorbot', 'remasterbot', 'granjaserv', 'clonador'];
function deathFx(u, src) {
  const top = topOf(u);
  if (SPR[u.type]) parts.push({ type: 'body', key: u.type, x: u.x, y: u.y, face: u.face || 1, ms: (u.mScale || 1) * (u.shrinkT > 0 ? u.shrinkF || 0.6 : 1), cor: !!u.corrupt, life: 0.6, max: 0.6, ground: true });   // v0.9.15
  if (!isCorp(facOf(u.team))) {
    if (u.team === 'e') parts.push({ type: 'stamp', x: u.x, y: u.y, z: top + 12, txt: src && src.type === 'banhammer' ? 'BANEADO' : 'LIBERADO', color: '#7c3aed', life: 0.9, max: 0.9 });
    puff(u.x, u.y, 10, '#ffffff', 60, 8, false, top * 0.4); flashAt(u.x, u.y, top * 0.5, BIG.includes(u.type) ? 64 : 34, '255,255,255', 0.28);
    const fur = FUR[u.type] || ['#ffffff'];
    chips(u.x, u.y, top * 0.5, BIG.includes(u.type) ? 14 : 6, fur, 'chip', BIG.includes(u.type) ? 5 : 3.5);
    parts.push({ type: 'ghost', x: u.x, y: u.y, z: top * 0.6, vz: 30, life: 1.4, max: 1.4 });
    play('poof');
  } else {
    const ph = facOf(u.team) === 'phony', ia = facOf(u.team) === 'iahorro', big = CORP_BIG.includes(u.type);
    sparks(u.x, u.y, top * 0.5, 10, '#ffd34d'); flashAt(u.x, u.y, top * 0.5, big ? 60 : 34, '255,200,80', 0.28);
    chips(u.x, u.y, top * 0.5, big ? 8 : 4, ['#9aa5ba'], 'gear', 4);
    if (ph) chips(u.x, u.y, top * 0.5, big ? 8 : 4, ['#ffcb3d', '#e5e7eb'], 'chip', 3.5);   // monedas y discos
    puff(u.x, u.y, 8, '#9aa3b2', 50, 7, false, top * 0.4);
    parts.push({ type: 'stamp', x: u.x, y: u.y, z: top + 12, txt: src && src.type === 'banhammer' ? 'BANEADO' : ia ? 'DESCONECTADO' : ph ? 'CANCELADO' : 'DESPEDIDO', color: '#ff3348', life: 0.9, max: 0.9 });
    play('clank');
  }
}
function structDeathFx(s) {
  const top = TOPS[s.skin + '_' + s.role];
  for (let i = 0; i < 4; i++) puff(s.x + rand(-s.r, s.r) * 0.6, s.y, 10, i % 2 ? '#ffb347' : '#8a8f9c', 120, 14, false, rand(10, top * 0.7));
  ring(s.x, s.y, 20, s.r * 4, 'rgba(255,190,80,.9)', 0.6, 8);
  chips(s.x, s.y, top * 0.5, 22, SKINS[s.skin].chips, 'chip', 7);
  sparks(s.x, s.y, top * 0.5, 16, '#ffd34d');
  flashAt(s.x, s.y, top * 0.5, s.role === 'base' ? 190 : 140, '255,190,80', 0.5); screenFlash(s.role === 'base' ? 0.5 : 0.3); s.smokeUntil = G.t + 8;
  shake(14); play('boom');
}

