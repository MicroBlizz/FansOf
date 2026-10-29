// Fans of Asalto · COMBATE: la batalla automática. Los héroes salen de su casilla de la cuadrícula (izquierda), los enemigos de la
// suya (derecha); cada uno busca al rival más cercano, anda hasta tenerlo a tiro y ataca: cuerpo a cuerpo, flecha, bola mágica, bomba
// en área o cura al aliado más herido. Aquí se aplican las clases activas (AS_CLASES) y las reliquias, y salen los números de daño.
'use strict';
const AS_ARENA = { x: 0, y: 108, w: 540, h: 492 };
// el centro de cada casilla: columna 0 = la de atrás; los enemigos, en espejo
function asCelda(lado, col, fila) {
  const x = 96 + col * 54, y = AS_ARENA.y + 122 + fila * 90;   // dentro de la arena de arena, sin pisar las rocas de los lados
  return lado === 'heroe' ? [x, y] : [AS_ARENA.w - x, y];
}
const AS_COLS = 3, AS_FILAS = 4;
let AS_B = null;   // la batalla en curso
let AS_ID = 0;

// ¿qué clases están activas con este equipo? { clase: nivel (1, 2…) }
function asSinergias(equipo) {
  const cuenta = {};
  for (const h of equipo) for (const k of AS_HEROES[h.tipo].clases) cuenta[k] = (cuenta[k] || 0) + 1;
  const act = {};
  for (const k in AS_CLASES) { const u = AS_CLASES[k].umbral; let n = 0; for (const v of u) if ((cuenta[k] || 0) >= v) n++; if (n) act[k] = n; }
  return { cuenta, act };
}
function asTiene(reliq) { return AS_P && AS_P.reliquias.includes(reliq); }

function asUnidad(lado, tipo, def, mult, celda, escala) {
  const [x, y] = asCelda(lado, celda[0], celda[1]);
  return { id: ++AS_ID, lado, tipo, def, x, y, x0: x, y0: y, max: Math.round(def.vida * mult.vida), vida: Math.round(def.vida * mult.vida),
    dano: def.dano * mult.dano, cada: def.cada / (mult.prisa || 1), alcance: def.alcance, vel: def.vel * (mult.botas || 1), area: def.area || 0,
    cd: 0.3 + Math.random() * 0.5, anim: 'reposo', tAnim: Math.random(), dura: 0.4, golpeYa: false, destello: 0, escudo: 0, tEscudo: 0,
    veneno: 0, tVeneno: 0, muerta: false, alfa: 1, escala: escala || 1, salto: !!def.salto, clases: AS_HEROES[tipo] ? AS_HEROES[tipo].clases : [] };
}

function asEmpiezaBatalla(enemigos) {
  const P = AS_P, sin = asSinergias(P.equipo).act;
  const u = [];
  for (const h of P.equipo) {
    const d = AS_HEROES[h.tipo], niv = 1 + AS_TIENDA.porNivel * (h.nivel - 1);
    const m = { vida: niv * (asTiene('coraza') ? 1.25 : 1), dano: niv * (asTiene('colmillo') ? 1.2 : 1), prisa: asTiene('reloj') ? 1.2 : 1, botas: asTiene('botas') ? 1.35 : 1 };
    if (sin.luchador && d.clases.includes('luchador')) m.dano *= 1.3;
    if (sin.tirador && d.clases.includes('tirador')) m.prisa *= 1.4;
    if (sin.mago === 2 && d.clases.includes('mago')) m.dano *= 1.3;
    const un = asUnidad('heroe', h.tipo, d, m, h.celda);
    un.nivel = h.nivel;
    if (sin.mago && d.clases.includes('mago') && (d.ataque === 'magia' || d.ataque === 'bomba')) un.area = Math.max(un.area, sin.mago === 2 ? 62 : 44);
    if (asTiene('escudo')) un.escudo = Math.round(un.max * 0.2);
    un.equipo = h;
    u.push(un);
  }
  for (const e of enemigos) u.push(asUnidad('enemigo', e.tipo, AS_ENEMIGOS[e.tipo], { vida: e.fuerza, dano: Math.sqrt(e.fuerza) * (e.jefe ? 1.4 : 1) }, e.celda, e.escala));
  AS_B = { u, proy: [], nums: [], parts: [], t: 0, fin: null, tFin: 0, sin };
  play('asLucha');
}

function asVivos(lado) { return AS_B.u.filter(u => !u.muerta && u.lado === lado); }
function asObjetivo(u) {
  const rivales = asVivos(u.lado === 'heroe' ? 'enemigo' : 'heroe');
  if (!rivales.length) return null;
  if (u.salto) {   // el asesino va a por el de más atrás
    return rivales.reduce((a, b) => (u.lado === 'heroe' ? b.x > a.x : b.x < a.x) ? b : a);
  }
  let mejor = null, dm = 1e9;
  for (const r of rivales) { const d = Math.hypot(r.x - u.x, (r.y - u.y) * 1.3); if (d < dm) { dm = d; mejor = r; } }
  return mejor;
}
function asMasHerido(u) {
  let mejor = null, pm = 0.98;
  for (const a of asVivos(u.lado)) { const p = a.vida / a.max; if (p < pm) { pm = p; mejor = a; } }
  return mejor;
}
function asNumero(x, y, txt, col, grande) { AS_B.nums.push({ x: x + rand(-6, 6), y, txt, col, t: 0, grande: !!grande }); }
function asChispas(x, y, col, n) { for (let i = 0; i < n; i++) AS_B.parts.push({ x, y, vx: rand(-90, 90), vy: rand(-140, -30), col, t: 0, vida: rand(0.25, 0.5), l: rand(2, 4) }); }

function asDana(de, a, dano, tipoGolpe) {
  if (!a || a.muerta) return;
  let d = dano * rand(0.9, 1.1) * asMuerteSubita(), crit = false;
  if (de && de.lado === 'heroe' && asTiene('dado') && Math.random() < 0.15) { d *= 2; crit = true; }
  d = Math.max(1, Math.round(d));
  if (a.escudo > 0) { const q = Math.min(a.escudo, d); a.escudo -= q; d -= q; if (!d) { asNumero(a.x, a.y - asAltoMuneco(a.tipo, a.escala), tr('bloqueo'), '#9fd4ff'); return; } }
  a.vida -= d; a.destello = 0.16;
  if (!a.anim.startsWith('ataque') && a.anim !== 'muerte') { a.anim = 'golpe'; a.tAnim = 0; }
  asNumero(a.x, a.y - asAltoMuneco(a.tipo, a.escala) - 4, (crit ? '¡' : '') + '-' + d, a.lado === 'heroe' ? '#ff6a5a' : crit ? '#ffd23a' : '#fff', crit);
  asChispas(a.x, a.y - asAltoMuneco(a.tipo, a.escala) * 0.5, tipoGolpe === 'magia' ? '#ffb347' : '#fff', 4);
  // reflejo (reliquia) y veneno (clase asesino)
  if (a.lado === 'heroe' && de && asTiene('espejo')) { de.vida -= Math.max(1, Math.round(d * 0.2)); if (de.vida <= 0) asMuere(de); }
  if (de && de.lado === 'heroe' && AS_B.sin.asesino && de.clases.includes('asesino')) { a.veneno = de.dano * 0.35; a.tVeneno = 3; }
  if (a.vida <= 0) asMuere(a);
}
// para que ningún combate se eternice (sanadoras contra tanques): desde el segundo 40 todo pega cada vez más
function asMuerteSubita() { return AS_B && AS_B.t > 40 ? 1 + (AS_B.t - 40) / 8 : 1; }
function asMuere(u) {
  if (u.muerta) return;
  u.muerta = true; u.vida = 0; u.anim = 'muerte'; u.tAnim = 0; play('asMuere');
  asChispas(u.x, u.y - 20, u.lado === 'heroe' ? '#ffd0d0' : '#ffe27a', 10);
}
function asCura(de, a, cant) {
  if (!a || a.muerta) return;
  const c = Math.round(cant * (AS_B.sin.sanador && de.clases.includes('sanador') ? 2 : 1));
  a.vida = Math.min(a.max, a.vida + c);
  asNumero(a.x, a.y - asAltoMuneco(a.tipo, a.escala) - 4, '+' + c, '#7dff8a');
  for (let i = 0; i < 6; i++) AS_B.parts.push({ x: a.x + rand(-12, 12), y: a.y - rand(0, 30), vx: 0, vy: -rand(30, 60), col: '#9dffb0', t: 0, vida: 0.6, l: 3 });
}
// el momento del golpe de cada ataque
function asImpacto(u) {
  const ob = u.ob; if (!ob) return;
  const t = u.def.ataque;
  if (t === 'cuerpo') {
    if (u.area) { for (const r of asVivos(u.lado === 'heroe' ? 'enemigo' : 'heroe')) if (Math.hypot(r.x - ob.x, r.y - ob.y) < u.area) asDana(u, r, u.dano); }
    else asDana(u, ob, u.dano);
    play('asEspada');
  } else if (t === 'cura' && u.curaA) { asCura(u, u.curaA, u.dano * 1.4); play('asCura'); }
  else {
    const altura = asAltoMuneco(u.tipo, u.escala) * 0.55;
    AS_B.proy.push({ x: u.x + (u.lado === 'heroe' ? 14 : -14), y: u.y - altura, ob, de: u, tipo: t === 'cura' ? 'magia' : t, dano: u.dano, area: u.area,
      x0: u.x, y0: u.y - altura, t: 0, dura: t === 'bomba' ? 0.7 : 0.35 + Math.hypot(ob.x - u.x, ob.y - u.y) / 600 });
    play(t === 'flecha' ? 'asFlecha' : t === 'bomba' ? 'asBomba' : 'asMagia');
  }
}

function asAvanzaUnidad(u, dt) {
  u.tAnim += dt; u.destello = Math.max(0, u.destello - dt);
  if (u.muerta) { if (u.tAnim > 1.1) u.alfa = Math.max(0, u.alfa - dt * 2); return; }
  if (u.tVeneno > 0) { u.tVeneno -= dt; u.vida -= u.veneno * dt; if (Math.random() < dt * 3) asNumero(u.x, u.y - 30, '-' + Math.ceil(u.veneno), '#b56bff'); if (u.vida <= 0) { asMuere(u); return; } }
  if (u.lado === 'heroe' && asTiene('tirita')) u.vida = Math.min(u.max, u.vida + u.max * 0.015 * dt);
  if (u.lado === 'heroe' && AS_B.sin.tanque && u.clases.includes('tanque')) {
    u.tEscudo -= dt;
    if (u.tEscudo <= 0) { u.tEscudo = 6; u.escudo = Math.max(u.escudo, Math.round(u.max * 0.25)); play('asEscudo'); }
  }
  // atacando: la animación manda; el golpe cae a mitad
  if (u.anim === 'ataque') {
    if (!u.golpeYa && u.tAnim >= u.dura * 0.6) { u.golpeYa = true; asImpacto(u); }
    if (u.tAnim >= u.dura) { u.anim = 'reposo'; u.tAnim = 0; }
    return;
  }
  if (u.anim === 'golpe' && u.tAnim < 0.22) return;
  u.cd -= dt;
  // la sanadora: si hay un aliado herido, va a por él
  let ob = null, alcance = u.alcance;
  if (u.def.ataque === 'cura') { u.curaA = asMasHerido(u); if (u.curaA) { ob = u.curaA; } }
  if (!ob) { u.curaA = null; ob = asObjetivo(u); }
  u.ob = ob;
  if (!ob) { if (u.anim !== 'reposo') { u.anim = 'reposo'; u.tAnim = 0; } return; }
  const dx = ob.x - u.x, dy = ob.y - u.y, d = Math.hypot(dx, dy);
  if (d > alcance) {
    const v = u.vel * (u.salto ? 2.6 : 1);
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
    const a = v[i], b = v[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = 22 * Math.max(a.escala, b.escala);
    if (d < min) { const p = (min - d) / 2 * Math.min(1, dt * 12); a.x -= dx / d * p; a.y -= dy / d * p; b.x += dx / d * p; b.y += dy / d * p; }
  }
  for (const u of v) { u.x = clamp(u.x, 70, AS_ARENA.w - 70); u.y = clamp(u.y, AS_ARENA.y + 80, AS_ARENA.y + AS_ARENA.h - 8); }
}
function asAvanzaProyectiles(dt) {
  for (const p of AS_B.proy) {
    p.t += dt;
    const ob = p.ob, tx = ob.x, ty = ob.y - asAltoMuneco(ob.tipo, ob.escala) * 0.5, k = Math.min(1, p.t / p.dura);
    p.x = lerp(p.x0, tx, k); p.y = lerp(p.y0, ty, k) - (p.tipo === 'bomba' ? Math.sin(k * Math.PI) * 70 : 0);
    if (p.tipo === 'magia' && Math.random() < 0.6) AS_B.parts.push({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-20, 20), col: p.de.tipo === 'heroe-suricata' ? '#fff2a0' : p.de.lado === 'enemigo' ? '#ff5050' : '#ffa030', t: 0, vida: 0.3, l: 3 });
    if (k >= 1) {
      p.fin = true;
      if (p.area) {
        for (const r of asVivos(p.de.lado === 'heroe' ? 'enemigo' : 'heroe')) if (Math.hypot(r.x - tx, r.y - ob.y) < p.area) asDana(p.de, r, p.dano, 'magia');
        AS_B.parts.push({ x: tx, y: ob.y, onda: p.area, t: 0, vida: 0.35, col: p.tipo === 'bomba' ? '#ffcf5a' : '#ffa030' });
        asChispas(tx, ty, '#ffcf5a', 12);
      } else asDana(p.de, ob, p.dano, p.tipo);
    }
  }
  AS_B.proy = AS_B.proy.filter(p => !p.fin);
}
function asAvanzaBatalla(dt) {
  const B = AS_B; if (!B) return;
  B.t += dt;
  for (const u of B.u) asAvanzaUnidad(u, dt);
  asSepara(dt);
  asAvanzaProyectiles(dt);
  for (const n of B.nums) { n.t += dt; n.y -= dt * 34; }
  B.nums = B.nums.filter(n => n.t < 0.9);
  for (const p of B.parts) { p.t += dt; if (!p.onda) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; } }
  B.parts = B.parts.filter(p => p.t < p.vida);
  if (!B.fin) {
    if (!asVivos('enemigo').length) B.fin = 'victoria';
    else if (!asVivos('heroe').length || B.t > 90) B.fin = 'derrota';
  } else B.tFin += dt;
}
