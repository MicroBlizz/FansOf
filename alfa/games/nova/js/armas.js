// Fans of Nova · Armas de la nave: ranuras, disparo, proyectiles y el golpe (estados y reacciones de datos-armas.js).
// Usa la partida S de partida.js. Las cifras salen de NOVA_ARMAS; aquí solo está la mecánica.
'use strict';
const NV_CARAS_DIR = { proa: [0, -1], babor: [-1, 0], estribor: [1, 0], dorsal: [0, -1], popa: [0, 1] };   // hacia dónde mira cada cara, en el sistema de la nave

const NV_ARCO_MIN = 90;   // grados: la torreta gira sola, así que ningún arco útil baja de aquí (en datos-cascos.js la proa tiene 30°: por decidir)

// Las ranuras del casco en un rango, con su id y su sitio en el casco (NOVA_PIEZAS).
function nvRanuras(rango, S) {
  const cuenta = {}, H = NOVA_PIEZAS.cascos[S.casco];
  const base = novaPlantilla(H.faccion, nvTier(rango));
  // más ranuras al hacerte grande: cada 5 rangos desde el 8 se abre un par más en las alas (S, luego M y L al crecer); sus anclajes están en datos-piezas
  const lat = novaPlantilla(H.faccion, 5).filter(r => r.cara === 'babor' || r.cara === 'estribor'), tipos = [...new Set([].concat(...lat.map(r => r.tipos)))];
  for (let k = 0; k < 4; k++) {
    const desde = 8 + 5 * k;
    if (rango < desde) break;
    const tam = rango >= desde + 16 ? 'L' : rango >= desde + 8 ? 'M' : 'S';
    for (const cara of ['babor', 'estribor']) base.push({ id: cara + (2 + k), cara, tam, tipos, arco: NOVA_CASCOS.caras[cara].arco, extra: 1 });
  }
  return base.map(r => {
    if (!r.extra) cuenta[r.cara] = (cuenta[r.cara] || 0) + 1;
    const id = r.extra ? r.id : r.cara + cuenta[r.cara], a = H.ranuras.find(x => x.id === id);
    return Object.assign({}, r, { id, x: a.x, y: a.y });
  });
}

// Un arma nueva en una ranura: portador + carga. `fusion` (de NOVA_ARMAS.fusiones) la sustituye por una de las estrella.
function nvArmaNueva(slot, portador, carga, fusion) {
  return { slot: slot.id, cara: slot.cara, tam: slot.tam, portador, carga, nivel: 0, fusion: fusion || null, cd: 0, ang: 0, fase: Math.random() * 6.28, rayo: 0 };
}
function nvNombreArma(w) {
  if (w.fusion) return tr(w.fusion.nombre);
  return tr(NOVA_ARMAS.portadores[w.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[w.carga].nombre);
}
// Daño de un proyectil de esa arma (todo multiplicado: tamaño, mejoras, cara, carga y premio de fusión).
function nvDanoArma(w) {
  const P = NOVA_ARMAS, p = P.portadores[w.portador], c = P.cargas[w.carga];
  let d = p.dano * P.tamanos[w.tam] * (1 + P.mejora.porNivel * w.nivel) * (NOVA_CASCOS.caras[w.cara].dano || 1) * c.multDano;
  d *= (NVP.S && NVP.S.mejoras.dano) || 1;
  if (w.fusion) d *= w.fusion.tipo === 'doble' ? (w.fusion.mult || 1) : P.fusionMixta.mult;
  return d;
}
function nvPosRanura(S, id) {
  const n = S.nave, a = NOVA_PIEZAS.cascos[S.casco].ranuras.find(x => x.id === id), e = n.escala, c = Math.cos(n.ang), s = Math.sin(n.ang);
  return { x: n.x + (a.x * c - a.y * s) * e, y: n.y + (a.x * s + a.y * c) * e };
}

// ---------- disparo ----------
function nvArmas(S, dt) {
  const n = S.nave;
  for (const w of n.armas) {
    if (w.cara === 'popa' || w.portador === 'defensa') continue;
    const p = NOVA_ARMAS.portadores[w.portador], pos = nvPosRanura(S, w.slot);
    w.x = pos.x; w.y = pos.y;
    if (w.portador === 'drones') { nvDrones(S, w, p, dt); continue; }
    const f = NV_CARAS_DIR[w.cara], dx = f[0] * Math.cos(n.ang) - f[1] * Math.sin(n.ang), dy = f[0] * Math.sin(n.ang) + f[1] * Math.cos(n.ang);
    const kf = nvFactor(n.rango), alc = p.alcance * kf * (w.fusion && w.fusion.id === 'bateriaFlak' ? 1.1 : 1), arco = Math.max(NOVA_CASCOS.caras[w.cara].arco, NV_ARCO_MIN) / 2 * Math.PI / 180;
    let obj = null, mejor = alc * alc, roca = null, mejorR = alc * alc;
    for (const e of S.enem) {
      if (e.muerto || e.d.pasivo === 2) continue;
      const vx = e.x - w.x, vy = e.y - w.y, d2 = vx * vx + vy * vy;
      if (d2 > mejor) continue;
      if (w.cara !== 'dorsal') { const dot = (vx * dx + vy * dy) / Math.sqrt(d2 || 1); if (Math.acos(Math.max(-1, Math.min(1, dot))) > arco) continue; }
      if (e.d.pasivo) { if (d2 < mejorR) { mejorR = d2; roca = e; } continue; }   // las rocas solo se disparan si no hay enemigos a tiro
      mejor = d2; obj = e;
    }
    if (!obj) obj = roca;
    w.cd -= dt;
    if (w.rayo > 0) w.rayo -= dt;
    if (!obj) { w.ang += (Math.atan2(dy, dx) - w.ang) * Math.min(1, dt * 6); continue; }
    w.ang = Math.atan2(obj.y - w.y, obj.x - w.x);
    if (w.cd > 0) continue;
    w.cd += 1 / (p.cadencia * (S.mejoras.cadencia || 1));
    nvDispara(S, w, p, obj);
  }
}
function nvDispara(S, w, p, obj) {
  const c = NOVA_ARMAS.cargas[w.carga], dano = nvDanoArma(w), id = w.fusion ? w.fusion.id : '';
  const base = { x: w.x, y: w.y, w, carga: w.carga, color: c.color, forma: c.forma, dano, golpeados: [] };
  if (w.portador === 'laser') {   // haz instantáneo contra el objetivo
    w.rayo = 0.09; w.rx = obj.x; w.ry = obj.y;
    nvGolpe(S, obj, dano * (id === 'hazEnfocado' ? 1.2 : 1), w, obj.x, obj.y, id === 'hazEnfocado' ? 2 : 1);
    return;
  }
  const kf = nvFactor(S.nave.rango), n = id === 'railgunGemela' ? 2 : w.portador === 'flak' ? (id === 'bateriaFlak' ? 10 : 6) : 1;
  for (let i = 0; i < n; i++) {
    let a = Math.atan2(obj.y - w.y, obj.x - w.x);
    if (w.portador === 'flak') a += (Math.random() - 0.5) * 0.9; else if (n > 1) a += (i - 0.5) * 0.12;
    const v = w.portador === 'railgun' ? 900 : w.portador === 'flak' ? 430 : 270;
    S.proy.push(Object.assign({}, base, {
      vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: (w.portador === 'railgun' ? 4 : w.portador === 'flak' ? 3 : 5) * kf,
      vida: (w.portador === 'flak' ? p.alcance * kf / v + 0.1 : w.portador === 'railgun' ? 0.9 * kf : 3), perf: w.portador === 'railgun' ? 3 : 1,
      guia: w.portador === 'lanzador' ? obj : null, golpeados: []
    }));
  }
}
function nvDrones(S, w, p, dt) {
  const n = S.nave, cant = p.proyectiles + (w.fusion ? 1 : 0), R = 85 * n.escala;
  w.fase += dt * 2.6; w.cd -= dt;
  w.drones = [];
  for (let i = 0; i < cant; i++) { const a = w.fase + i * 6.283 / cant; w.drones.push({ x: n.x + Math.cos(a) * R, y: n.y + Math.sin(a) * R }); }
  if (w.cd > 0) return;
  w.cd += 1 / p.cadencia;
  const dano = nvDanoArma(w);
  for (const d of w.drones) for (const e of S.enem) if (!e.muerto && Math.hypot(e.x - d.x, e.y - d.y) < e.r + 14) {
    nvGolpe(S, e, dano, w, d.x, d.y, 1);
    if (w.fusion && w.fusion.id === 'dronesKamikaze') nvExplosion(S, d.x, d.y, 45, dano * 0.8, w, e);
  }
}

// ---------- proyectiles ----------
function nvProyectiles(S, dt) {
  for (let i = S.proy.length - 1; i >= 0; i--) {
    const b = S.proy[i];
    b.vida -= dt;
    if (b.guia && !b.guia.muerto) {   // el misil gira hacia su objetivo
      const va = Math.atan2(b.vy, b.vx), na = Math.atan2(b.guia.y - b.y, b.guia.x - b.x);
      let d = na - va; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283;
      const a = va + Math.max(-3.5 * dt, Math.min(3.5 * dt, d)), v = Math.hypot(b.vx, b.vy);
      b.vx = Math.cos(a) * v; b.vy = Math.sin(a) * v;
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    let fin = b.vida <= 0;
    for (const e of S.enem) {
      if (e.muerto || b.golpeados.includes(e) || Math.hypot(e.x - b.x, e.y - b.y) > e.r + b.r) continue;
      b.golpeados.push(e);
      nvGolpe(S, e, b.dano, b.w, b.x, b.y, 1);
      if (b.carga === 'explosiva' || (b.w.fusion && b.w.fusion.id === 'misilRacimo')) nvExplosion(S, b.x, b.y, 55, b.dano * 0.6, b.w, e);
      if (--b.perf <= 0) { fin = true; break; }
    }
    if (fin) S.proy.splice(i, 1);
  }
}
function nvExplosion(S, x, y, radio, dano, w, salvo) {
  radio *= nvFactor(S.nave.rango);   // las explosiones también crecen con la nave
  S.fx.push({ t: 0.3, x, y, r: radio, color: NOVA_ARMAS.cargas[w.carga].color, tipo: 'onda' });
  for (const e of S.enem) if (e !== salvo && !e.muerto && Math.hypot(e.x - x, e.y - y) < radio + e.r) nvGolpe(S, e, dano, w, e.x, e.y, 0.5, true);
}

// ---------- el golpe: escudo, estados, reacciones ----------
// mult: multiplicador extra (haz enfocado); sinReaccion: los golpes de área no encadenan reacciones.
function nvGolpe(S, e, dano, w, x, y, mult, sinReaccion) {
  const A = NOVA_ARMAS, carga = w.carga, c = A.cargas[carga], est = e.est;
  let d = dano * (mult || 1), crit = false, reac = null;
  if (carga === 'cinetica' && est.brecha > 0) d *= 1.5;
  if (e.resiste === carga) d *= 0.5;
  if (est.marcado > 0 && carga !== 'explosiva') { crit = true; est.marcado = 0; }   // el siguiente impacto de otro tipo es crítico
  if (!sinReaccion) for (const r of A.reacciones) {
    if (!(est[r.a] > 0) && !(r.a === 'marcado' && est.marcado > 0)) continue;
    const ok = r.b === 'cualquiera' || r.b === carga || (r.id === 'impactoLimpio' && carga === 'cinetica') || (r.id === 'fundido' && carga === 'termica');
    if (!ok || (r.a === 'marcado' && carga !== 'explosiva')) continue;
    reac = r; break;
  }
  if (reac) nvReaccion(S, e, reac, w, d), d *= reac.id === 'fundido' ? 1 : reac.mult, crit = crit || reac.id === 'impactoLimpio';
  if (crit) d *= 2;
  // el escudo del enemigo absorbe; la energía lo tumba
  if (e.esc > 0 && !(est.escudoCaido > 0)) {
    const abs = Math.min(e.esc, d * (carga === 'energia' ? 1.6 : 1));
    e.esc -= abs; d = Math.max(0, d - abs * (carga === 'energia' ? 0.6 : 1));
    if (carga === 'energia' || e.esc <= 0) { est.escudoCaido = A.estados.escudoCaido.duracion; e.esc = 0; }
  }
  // estado que deja la carga
  const dur = A.estados[c.estado].duracion;
  if (c.estado === 'sobrecalentado') {
    e.calor += 14 * (w.fusion && w.fusion.id === 'hazEnfocado' ? 2 : 1);
    if (e.calor >= 100) { e.calor = 0; nvExplosion(S, e.x, e.y, 70, 50 * A.tamanos[w.tam], w, e); S.nums.push({ x: e.x, y: e.y - 20, t: 1, txt: tr('¡Sobrecarga!'), color: '#ff4b4b', g: 1 }); }
  } else if (c.estado === 'apagado') est.apagado = dur * ((est.brecha > 0 && !sinReaccion) ? 2 : 1);
  else est[c.estado] = dur;
  e.hp -= d;
  e.flash = 0.08;
  S.nums.push({ x: x + (Math.random() - 0.5) * 14, y: y - 8, t: 0.7, txt: String(Math.round(d)), color: crit ? '#ffd93d' : c.color, g: crit ? 1 : 0 });
  if (S.mejoras.robo) S.nave.hp = Math.min(S.nave.hpMax, S.nave.hp + d * S.mejoras.robo);
  S.stats.dano += d; if (d > S.stats.mayor) S.stats.mayor = d;
  if (e.hp <= 0 && !e.muerto) nvMuere(S, e);
}
function nvReaccion(S, e, r, w, d) {
  S.stats.reacciones[r.id] = (S.stats.reacciones[r.id] || 0) + 1;
  S.nums.push({ x: e.x, y: e.y - 34, t: 1.1, txt: tr(r.nombre), color: '#ffffff', g: 1 });
  if (r.id === 'fundido') e.dot = { t: 3, dps: d * 3 };
  if (r.id === 'detonacion') nvExplosion(S, e.x, e.y, 90, d * 1.2, w, e);
  if (r.id === 'dobleMarca') e.est.brecha = NOVA_ARMAS.estados.brecha.duracion;
}
