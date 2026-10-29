// Fans of Asalto · COMBATE: la batalla automática. Los héroes salen de su casilla de la cuadrícula (4x8, a la izquierda) y los
// enemigos de sus puntos rojos (a la derecha); cada uno busca al rival más cercano, anda hasta tenerlo a tiro y ataca: cuerpo a
// cuerpo, flecha, bola mágica, bomba en área o cura. Aquí se aplican las 7 clases (AS_CLASES, con sus habilidades cada pocos
// segundos), las reliquias, el equipo (SAVE.equipo, en %), los críticos y esquivas, y el oro que suelta cada enemigo.
'use strict';
const AS_ARENA = { x: 0, y: 94, w: 540, h: 596 };
// el centro (los pies) de cada casilla de la cuadrícula de los héroes
function asCelda(col, fila) { return [60 + col * 44, AS_ARENA.y + 72 + fila * 66]; }
let AS_B = null;   // la batalla en curso
let AS_ID = 0;

// ¿qué clases están activas con este equipo? cuenta = héroes DISTINTOS por clase; act = nivel de cada habilidad (1, 2…)
function asSinergias(equipo) {
  const cuenta = {}, vistos = {};
  for (const h of equipo) { if (vistos[h.tipo]) continue; vistos[h.tipo] = 1; for (const k of AS_HEROES[h.tipo].clases) cuenta[k] = (cuenta[k] || 0) + 1; }
  const act = {};
  for (const k in AS_CLASES) { let n = 0; for (const u of AS_CLASES[k].umbral) if ((cuenta[k] || 0) >= u) n++; if (n) act[k] = n; }
  return { cuenta, act };
}
function asValorClase(k) { const n = AS_B && AS_B.sin[k]; return n ? AS_CLASES[k].v[n - 1] : 0; }
function asTiene(reliq) { return AS_P && AS_P.reliquias.includes(reliq); }

function asUnidad(lado, tipo, def, mult, pos, escala) {
  return { id: ++AS_ID, lado, tipo, def, x: pos[0], y: pos[1], max: Math.round(def.vida * mult.vida), vida: Math.round(def.vida * mult.vida),
    dano: def.dano * mult.dano, cada: def.cada / (mult.prisa || 1), alcance: def.alcance, vel: def.vel * (mult.botas || 1), area: def.area || 0,
    defensa: mult.defensa || 0, critico: mult.critico || 0, danoCrit: mult.danoCrit || 0, reflejo: mult.reflejo || 0, esquiva: mult.esquiva || 0,
    cd: 0.3 + Math.random() * 0.5, anim: 'reposo', tAnim: Math.random(), dura: 0.4, golpeYa: false, destello: 0, escudo: 0, tEscudo: 0,
    veneno: 0, tVeneno: 0, lento: 0, muerta: false, alfa: 1, escala: escala || 1, salto: !!def.salto, clases: AS_HEROES[tipo] ? AS_HEROES[tipo].clases : [], tHab: {} };
}

function asEmpiezaBatalla(enemigos) {
  const P = AS_P, sin = asSinergias(P.equipo).act, E = asStatsEquipo();
  const u = [];
  for (const h of P.equipo) {
    const d = AS_HEROES[h.tipo];
    const m = { vida: (1 + E.vida / 100) * (asTiene('coraza') ? 1.25 : 1), dano: (1 + E.ataque / 100) * (asTiene('zelote') ? 1.1 : 1), prisa: 1 + E.velAtaque / 100, botas: (1 + E.velMov / 100) * (asTiene('botas') ? 1.35 : 1),
      defensa: E.defensa / 100, critico: E.critico / 100 + (asTiene('mortal') ? 0.15 : 0), danoCrit: E.danoCrit / 100, reflejo: E.reflejo / 100 + (asTiene('reflejo') ? 0.1 : 0), esquiva: 0 };
    if (sin.luchador && d.clases.includes('luchador')) m.dano *= 1 + asValorClaseDe(sin, 'luchador') / 100;
    if (sin.tirador && d.clases.includes('tirador')) m.prisa *= 1 + asValorClaseDe(sin, 'tirador') / 100;
    if (asTiene('tenacidad') && d.clases.includes('luchador')) m.vida *= 1.25;
    if (asTiene('esprint') && d.clases.includes('asesino')) { m.prisa *= 1.3; m.botas *= 1.3; }
    if (asTiene('espinas') && d.clases.includes('tanque')) m.reflejo += 0.2;
    if (asTiene('escondite') && d.clases.includes('sanador')) m.esquiva = 0.3;
    const un = asUnidad('heroe', h.tipo, d, m, asCelda(h.celda[0], h.celda[1]));
    if (asTiene('carton')) un.escudo = Math.round(un.max * 0.2);
    un.equipo = h;
    u.push(un);
  }
  for (const e of enemigos) u.push(asUnidad('enemigo', e.tipo, AS_ENEMIGOS[e.tipo], { vida: e.fuerza, dano: Math.sqrt(e.fuerza) * (e.jefe ? 1.3 : 1) }, e.pos, e.escala));
  AS_B = { u, proy: [], nums: [], parts: [], rayos: [], t: 0, fin: null, tFin: 0, sin, tHab: {} };
  play('asLucha');
}
function asValorClaseDe(sin, k) { return sin[k] ? AS_CLASES[k].v[sin[k] - 1] : 0; }

function asVivos(lado) { return AS_B.u.filter(u => !u.muerta && u.lado === lado); }
function asRivales(u) { return asVivos(u.lado === 'heroe' ? 'enemigo' : 'heroe'); }
function asObjetivo(u) {
  const rivales = asRivales(u);
  if (!rivales.length) return null;
  if (u.salto) return rivales.reduce((a, b) => (u.lado === 'heroe' ? b.x > a.x : b.x < a.x) ? b : a);   // el asesino va a por el de más atrás
  let mejor = null, dm = 1e9;
  for (const r of rivales) { const d = Math.hypot(r.x - u.x, (r.y - u.y) * 1.3); if (d < dm) { dm = d; mejor = r; } }
  return mejor;
}
function asMasHerido(lado) {
  let mejor = null, pm = 0.98;
  for (const a of asVivos(lado)) { const p = a.vida / a.max; if (p < pm) { pm = p; mejor = a; } }
  return mejor;
}
function asNumero(x, y, txt, col, grande) { AS_B.nums.push({ x: x + rand(-6, 6), y, txt, col, t: 0, grande: !!grande }); }
function asChispas(x, y, col, n) { for (let i = 0; i < n; i++) AS_B.parts.push({ x, y, vx: rand(-90, 90), vy: rand(-140, -30), col, t: 0, vida: rand(0.25, 0.5), l: rand(2, 4) }); }
function asAlto(u) { return asAltoMuneco(u.tipo, u.escala); }

function asDana(de, a, dano, tipoGolpe) {
  if (!a || a.muerta) return;
  if (a.esquiva && Math.random() < a.esquiva) { asNumero(a.x, a.y - asAlto(a) - 4, tr('esquiva'), '#9fd4ff'); return; }
  let d = dano * rand(0.9, 1.1) * asMuerteSubita(), crit = false;
  if (de && de.critico && Math.random() < de.critico) { d *= 2 + (de.danoCrit || 0); crit = true; }
  if (de && de.lado === 'heroe' && asTiene('furia') && de.vida < de.max * 0.3) d *= 1.3;
  if (a.defensa) d *= Math.max(0.3, 1 - a.defensa);
  d = Math.max(1, Math.round(d));
  if (a.escudo > 0) { const q = Math.min(a.escudo, d); a.escudo -= q; d -= q; if (!d) { asNumero(a.x, a.y - asAlto(a), tr('bloqueo'), '#9fd4ff'); return; } }
  a.vida -= d; a.destello = 0.16;
  if (a.anim !== 'ataque' && a.anim !== 'muerte') { a.anim = 'golpe'; a.tAnim = 0; }
  asNumero(a.x, a.y - asAlto(a) - 4, '-' + d, a.lado === 'heroe' ? '#ff6a5a' : crit ? '#ffd23a' : '#fff', crit);
  if (crit) asNumero(a.x, a.y - asAlto(a) - 22, tr('¡crítico!'), '#ffd23a');
  asChispas(a.x, a.y - asAlto(a) * 0.5, tipoGolpe === 'magia' ? '#ffb347' : '#fff', 4);
  if (de && a.reflejo) { de.vida -= Math.max(1, Math.round(d * a.reflejo)); if (de.vida <= 0) asMuere(de); }
  if (de && de.lado === 'heroe' && asTiene('helado') && de.clases.includes('mago') && Math.random() < 0.3) a.lento = 2;
  if (a.vida <= 0) asMuere(a);
}
// para que ningún combate se eternice: desde el segundo 40 todo pega cada vez más
function asMuerteSubita() { return AS_B && AS_B.t > 40 ? 1 + (AS_B.t - 40) / 8 : 1; }
function asMuere(u) {
  if (u.muerta) return;
  u.muerta = true; u.vida = 0; u.anim = 'muerte'; u.tAnim = 0; play('asMuere');
  asChispas(u.x, u.y - 20, u.lado === 'heroe' ? '#ffd0d0' : '#ffe27a', 10);
  if (u.lado === 'enemigo' && AS_P) { AS_P.oroBatalla += AS_CFG.oroPorMuerte; asApuntaStat('enemigos', 1); AS_B.parts.push({ x: u.x, y: u.y - 10, vx: 0, vy: -50, col: '#ffd23a', t: 0, vida: 0.6, l: 4, moneda: true }); }
}
function asCura(a, cant) {
  if (!a || a.muerta) return;
  const c = Math.max(1, Math.round(cant));
  a.vida = Math.min(a.max, a.vida + c);
  asNumero(a.x, a.y - asAlto(a) - 4, '+' + c, '#7dff8a');
  for (let i = 0; i < 5; i++) AS_B.parts.push({ x: a.x + rand(-10, 10), y: a.y - rand(0, 24), vx: 0, vy: -rand(30, 60), col: '#9dffb0', t: 0, vida: 0.6, l: 3 });
}
// el momento del golpe de cada ataque
function asImpacto(u) {
  const ob = u.ob; if (!ob) return;
  const t = u.def.ataque;
  if (t === 'cuerpo') {
    if (u.area) { for (const r of asRivales(u)) if (Math.hypot(r.x - ob.x, r.y - ob.y) < u.area) asDana(u, r, u.dano); }
    else asDana(u, ob, u.dano);
    play('asEspada');
  } else if (t === 'cura') { if (u.curaA) { asCura(u.curaA, u.dano * 1.4); play('asCura'); } }
  else {
    const altura = asAlto(u) * 0.55;
    AS_B.proy.push({ x: u.x + (u.lado === 'heroe' ? 10 : -10), y: u.y - altura, ob, de: u, tipo: t, dano: u.dano, area: u.area,
      x0: u.x, y0: u.y - altura, t: 0, dura: t === 'bomba' ? 0.7 : 0.3 + Math.hypot(ob.x - u.x, ob.y - u.y) / 700, perfora: t === 'flecha' && asTiene('perforar') && u.clases.includes('tirador') });
    play(t === 'flecha' ? 'asFlecha' : t === 'bomba' ? 'asBomba' : 'asMagia');
  }
}

/* ---------- las habilidades de las clases, cada pocos segundos ---------- */
function asHabilidades(dt) {
  const B = AS_B, H = B.tHab, heroes = asVivos('heroe'), enem = asVivos('enemigo');
  if (!heroes.length || !enem.length) return;
  const de = k => heroes.filter(u => u.clases.includes(k));
  const cada = (k, s) => { H[k] = (H[k] || 0) + dt; if (H[k] >= s) { H[k] = 0; return true; } return false; };
  if (B.sin.tanque && cada('tanque', 6)) { for (const u of de('tanque')) u.escudo = Math.max(u.escudo, Math.round(u.max * asValorClase('tanque') / 100)); play('asEscudo'); }
  if (B.sin.asesino && cada('asesino', 12)) {
    for (const u of de('asesino')) { const r = pick(enem); if (r) { r.veneno = r.max * asValorClase('asesino') / 100; r.tVeneno = 3; B.proy.push({ x: u.x, y: u.y - 20, ob: r, de: u, tipo: 'dardo', dano: 0, x0: u.x, y0: u.y - 20, t: 0, dura: 0.3 }); } }
    play('asFlecha');
  }
  if (B.sin.mago && cada('mago', 6)) {
    for (const u of de('mago')) { let desde = u, lista = shuffle(enem.slice()).slice(0, 3); for (const r of lista) { B.rayos.push({ x1: desde.x, y1: desde.y - asAlto(desde) * 0.6, x2: r.x, y2: r.y - asAlto(r) * 0.5, t: 0 }); asDana(u, r, u.dano * asValorClase('mago') / 100, 'magia'); desde = r; } }
    play('asMagia');
  }
  if (B.sin.sanador && cada('sanador', 3)) { for (const u of de('sanador')) { const a = asMasHerido('heroe') || pick(heroes); asCura(a, a.max * asValorClase('sanador') / 100); } play('asCura'); }
  if (B.sin.brujo && cada('brujo', 6)) {
    for (const u of de('brujo')) for (let i = 0; i < asValorClase('brujo'); i++) { const r = pick(enem); if (r) B.proy.push({ x: u.x, y: u.y - 24, ob: r, de: u, tipo: 'sombra', dano: u.dano * 0.6 * (asTiene('sombra') ? 1.5 : 1), x0: u.x, y0: u.y - 24 - i * 6, t: -i * 0.08, dura: 0.5 }); }
    play('asMagia');
  }
}

function asAvanzaUnidad(u, dt) {
  u.tAnim += dt; u.destello = Math.max(0, u.destello - dt);
  if (u.muerta) { if (u.tAnim > 1.1) u.alfa = Math.max(0, u.alfa - dt * 2); return; }
  if (u.tVeneno > 0) { u.tVeneno -= dt; u.vida -= u.veneno * dt; if (Math.random() < dt * 2) asNumero(u.x, u.y - 30, '-' + Math.ceil(u.veneno), '#b56bff'); if (u.vida <= 0) { asMuere(u); return; } }
  if (u.lento > 0) u.lento -= dt;
  if (u.lado === 'heroe' && asTiene('tirita') && u.vida < u.max) u.vida = Math.min(u.max, u.vida + u.max * 0.02 * dt);   // la tirita regenera
  const frenado = u.lento > 0 ? 0.6 : 1;
  if (u.anim === 'ataque') {   // atacando: la animación manda; el golpe cae a mitad
    if (!u.golpeYa && u.tAnim >= u.dura * 0.6) { u.golpeYa = true; asImpacto(u); }
    if (u.tAnim >= u.dura) { u.anim = 'reposo'; u.tAnim = 0; }
    return;
  }
  if (u.anim === 'golpe' && u.tAnim < 0.22) return;
  u.cd -= dt * frenado;
  let ob = null;
  if (u.def.ataque === 'cura') { u.curaA = asMasHerido(u.lado); if (u.curaA) ob = u.curaA; }
  if (!ob) { u.curaA = null; ob = asObjetivo(u); }
  u.ob = ob;
  if (!ob) { if (u.anim !== 'reposo') { u.anim = 'reposo'; u.tAnim = 0; } return; }
  const dx = ob.x - u.x, dy = ob.y - u.y, d = Math.hypot(dx, dy);
  if (d > u.alcance) {
    const v = u.vel * (u.salto ? 2.6 : 1) * frenado;
    u.x += (dx / d) * v * dt; u.y += (dy / d) * v * dt;
    if (u.anim !== 'andar') { u.anim = 'andar'; u.tAnim = 0; }
  } else {
    u.salto = false;
    if (u.anim === 'andar') { u.anim = 'reposo'; u.tAnim = 0; }
    if (u.cd <= 0) { u.cd = u.cada; u.anim = 'ataque'; u.tAnim = 0; u.dura = Math.min(0.5, Math.max(0.3, u.cada * 0.5)); u.golpeYa = false; }
  }
}
// que no se amontonen
function asSepara(dt) {
  const v = AS_B.u.filter(u => !u.muerta);
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) {
    const a = v[i], b = v[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = 14 * Math.max(a.escala, b.escala);
    if (d < min) { const p = (min - d) / 2 * Math.min(1, dt * 12); a.x -= dx / d * p; a.y -= dy / d * p; b.x += dx / d * p; b.y += dy / d * p; }
  }
  for (const u of v) { u.x = clamp(u.x, 20, AS_ARENA.w - 20); u.y = clamp(u.y, AS_ARENA.y + 50, AS_ARENA.y + AS_ARENA.h - 6); }
}
function asAvanzaProyectiles(dt) {
  for (const p of AS_B.proy) {
    p.t += dt; if (p.t < 0) continue;
    const ob = p.ob, tx = ob.x, ty = ob.y - asAlto(ob) * 0.5, k = Math.min(1, p.t / p.dura);
    p.x = lerp(p.x0, tx, k); p.y = lerp(p.y0, ty, k) - (p.tipo === 'bomba' ? Math.sin(k * Math.PI) * 60 : 0);
    if ((p.tipo === 'magia' || p.tipo === 'sombra') && Math.random() < 0.6) AS_B.parts.push({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-20, 20), col: p.tipo === 'sombra' ? '#b56bff' : p.de.lado === 'enemigo' ? '#ff5050' : '#ffa030', t: 0, vida: 0.3, l: 3 });
    if (k >= 1) {
      p.fin = true;
      if (p.tipo === 'dardo') continue;
      if (p.area) {
        for (const r of asRivales(p.de)) if (Math.hypot(r.x - tx, r.y - ob.y) < p.area) asDana(p.de, r, p.dano, 'magia');
        AS_B.parts.push({ x: tx, y: ob.y, onda: p.area, t: 0, vida: 0.35, col: p.tipo === 'bomba' ? '#ffcf5a' : '#ffa030' });
        asChispas(tx, ty, '#ffcf5a', 12);
      } else {
        asDana(p.de, ob, p.dano, p.tipo);
        if (p.perfora) { const otro = asRivales(p.de).filter(r => r !== ob).sort((a, b) => Math.hypot(a.x - tx, a.y - ob.y) - Math.hypot(b.x - tx, b.y - ob.y))[0]; if (otro && Math.hypot(otro.x - tx, otro.y - ob.y) < 70) asDana(p.de, otro, p.dano * 0.7, 'flecha'); }
      }
    }
  }
  AS_B.proy = AS_B.proy.filter(p => !p.fin);
}
function asAvanzaBatalla(dt) {
  const B = AS_B; if (!B) return;
  B.t += dt;
  for (const u of B.u) asAvanzaUnidad(u, dt);
  if (!B.fin) asHabilidades(dt);
  asSepara(dt);
  asAvanzaProyectiles(dt);
  for (const n of B.nums) { n.t += dt; n.y -= dt * 34; }
  B.nums = B.nums.filter(n => n.t < 0.9);
  for (const p of B.parts) { p.t += dt; if (!p.onda) { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.moneda) p.vy += 300 * dt; } }
  B.parts = B.parts.filter(p => p.t < p.vida);
  for (const r of B.rayos) r.t += dt;
  B.rayos = B.rayos.filter(r => r.t < 0.25);
  if (!B.fin) {
    if (!asVivos('enemigo').length) B.fin = 'victoria';
    else if (!asVivos('heroe').length || B.t > AS_CFG.limiteCombate) B.fin = 'derrota';
  } else B.tFin += dt;
}
