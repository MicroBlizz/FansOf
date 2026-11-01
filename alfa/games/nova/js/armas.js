// Fans of Nova · Armas de la nave: ranuras, disparo, proyectiles y el golpe (estados y reacciones de datos-armas.js).
// Usa la partida S de partida.js. Las cifras salen de NOVA_ARMAS; aquí solo está la mecánica.
'use strict';
const NV_CARAS_DIR = { proa: [0, -1], babor: [-1, 0], estribor: [1, 0], dorsal: [0, -1], popa: [0, 1] };   // hacia dónde mira cada cara, en el sistema de la nave

// Arco de tiro de cada cara (datos-cascos.js): proa 90° al frente, laterales 180° hacia su lado, popa 180° hacia atrás y dorsal 360°.

// Las ranuras del casco en un rango, con su id y su sitio en el casco (NOVA_PIEZAS).
// Las de arma siguen Fibonacci: 2 al empezar (una con el arma de la facción y otra vacía para la primera subida), 3, 5 y 8; la de popa (defensa) va aparte.
const NV_FIB_SLOTS = [[1, 2], [6, 3], [12, 5], [20, 8]];   // [rango desde el que vale, cuántas ranuras de arma]
const NV_ORDEN_SLOTS = ['proa1', 'babor1', 'estribor1', 'dorsal1', 'dorsal2', 'babor2', 'estribor2', 'babor3', 'estribor3', 'babor4', 'estribor4', 'babor5', 'estribor5'];
function nvNumSlots(rango) { let n = 0; for (const [r, c] of NV_FIB_SLOTS) if (rango >= r) n = c; return n; }
function nvTodasArmas() { return ['railgun', 'flak', 'laser', 'lanzador', 'drones']; }
// Cuánto encaja un tipo de arma con tu facción y tu piloto (1 = nada; sube por cada uno que lo usa en su plantilla). Solo sesga las ofertas.
function nvAfinidad(S, portador) {
  const usa = fid => { const F = NOVA_CASCOS.facciones[fid]; if (!F) return false; const ts = new Set([].concat(...F.ranuras.map(r => r.tipos))); return ts.has(portador) && nvTodasArmas().some(t => !ts.has(t)); };
  const capF = S.capFaccion;
  return 1 + (usa(S.faccion) ? 1.5 : 0) + (capF && usa(capF) ? 1 : 0);
}
function nvRanuras(rango, S) {
  const H = nvHull(S.casco, rango), F = NOVA_CASCOS.facciones[H.faccion], tier = nvTier(rango), N = nvNumSlots(rango);
  const tamEn = r => { let t = r.tam; for (const k in (r.crece || {})) if (+k <= tier) t = r.crece[k]; return t; };
  const prop = F.ranuras.filter(r => r.cara !== 'popa'), libres = nvTodasArmas();
  // cualquier ranura de arma admite cualquier arma; las de solo defensa siguen siendo solo defensa. La facción no limita: inclina lo que se ofrece (nvAfinidad)
  const abre = ts => ts.some(t => t !== 'defensa') ? nvTodasArmas().concat(ts.includes('defensa') || ts.includes('universal') ? ['defensa'] : []) : ts;   // «universal»: cualquier arma y la defensa
  const out = [];
  for (const id of NV_ORDEN_SLOTS.filter(i => H.ranuras.some(x => x.id === i)).slice(0, N)) {
    const cara = id.replace(/\d+/, ''), i = +id.slice(cara.length) - 1, fr = prop.filter(r => r.cara === cara)[i], a = H.ranuras.find(x => x.id === id);
    out.push({ id, x: a.x, y: a.y, cara, tam: fr ? tamEn(fr) : rango >= 24 ? 'L' : rango >= 14 ? 'M' : 'S', tipos: fr ? abre(fr.tipos) : libres, arco: NOVA_CASCOS.caras[cara].arco });
  }
  F.ranuras.filter(r => r.cara === 'popa' && r.desde <= tier).forEach((r, i) => { const id = 'popa' + (i + 1), a = H.ranuras.find(x => x.id === id); out.push({ id, x: a.x, y: a.y, cara: 'popa', tam: tamEn(r), tipos: abre(r.tipos), arco: NOVA_CASCOS.caras.popa.arco }); });
  return out;
}

// Un arma nueva en una ranura: portador + carga. `fusion` (de NOVA_ARMAS.fusiones) la sustituye por una de las estrella.
// El tamaño es del arma, no de la ranura: empieza pequeña y se une/divide en la estación. Más tamaño = mucho más daño, alcance y bala.
const NV_RANGO_TAM = { S: 1, M: 1.2, L: 1.4 }, NV_BALA_TAM = { S: 1, M: 1.25, L: 1.5 };
function nvArmaNueva(slot, portador, carga, fusion, tam) {
  return { slot: slot.id, cara: slot.cara, tam: tam || 'S', portador, carga, nivel: 0, fusion: fusion || null, cd: 0, ang: 0, fase: Math.random() * 6.28, rayo: 0 };
}
function nvNombreArma(w) {
  if (w.fusion) return tr(w.fusion.nombre);
  if (w.variante) return tr(NV_VAR_ID[w.variante].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[w.carga].nombre);
  return tr(NOVA_ARMAS.portadores[w.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[w.carga].nombre);
}
// Daño de un proyectil de esa arma (todo multiplicado: tamaño, mejoras, cara, carga y premio de fusión).
function nvDanoArma(w) {
  const P = NOVA_ARMAS, p = P.portadores[w.portador], c = P.cargas[w.carga];
  let d = p.dano * P.tamanos[w.tam] * (1 + P.mejora.porNivel * w.nivel) * (NOVA_CASCOS.caras[w.cara].dano || 1) * c.multDano * nvVar(w).dano;
  d *= (NVP.S && NVP.S.mejoras.dano) || 1;
  if (NVP.S) { d *= (1 + (NVP.S.capDano || 0)) * (1 + (NVP.S.nucleoBono || 0)); if (NVP.S.cap === 'necrolord' && w.portador === 'drones') d *= 0.5; }
  if (w.fusion) d *= w.fusion.tipo === 'doble' ? (w.fusion.mult || 1) : P.fusionMixta.mult;
  if (NVP.S) d *= nvLiderDano(NVP.S, w);   // lideres.js
  return d;
}
function nvPosRanura(S, id) {
  const n = S.nave, a = nvHull(S.casco, n.rango).ranuras.find(x => x.id === id), e = n.escala, c = Math.cos(n.ang), s = Math.sin(n.ang);
  return { x: n.x + (a.x * c - a.y * s) * e, y: n.y + (a.x * s + a.y * c) * e };
}

// ---------- disparo ----------
function nvArmas(S, dt) {
  nvRasgoPaso(S, dt);   // facciones.js: la Secuela repite su disparo
  for (const w of S.nave.armas) if (w.portador !== 'defensa') nvArmaPaso(S, w, dt);
}
function nvArmaPaso(S, w, dt) {
  const n = S.nave, p = NOVA_ARMAS.portadores[w.portador], pos = nvPosRanura(S, w.slot);
  w.x = pos.x; w.y = pos.y;
  if (w.portador === 'drones') return nvDrones(S, w, p, dt);
  const f = NV_CARAS_DIR[w.cara], dx = f[0] * Math.cos(n.ang) - f[1] * Math.sin(n.ang), dy = f[0] * Math.sin(n.ang) + f[1] * Math.cos(n.ang);
  const alc = nvAlcanceArma(S, w, p), grados = NOVA_CASCOS.caras[w.cara].arco, arco = grados / 2 * Math.PI / 180;
  const obj = nvMisilCerca(S, w, dx, dy, arco, grados, alc) || nvArmaObjetivo(S, w, dx, dy, alc, grados, arco);   // las cinéticas derriban misiles: son lo primero
  w.cd -= dt;
  if (w.rayo > 0) w.rayo -= dt;
  if (!obj) { w.ang += (Math.atan2(dy, dx) - w.ang) * Math.min(1, dt * 6); return; }
  w.ang = Math.atan2(obj.y - w.y, obj.x - w.x);
  if (w.cd > 0) return;
  w.cd += 1 / (p.cadencia * nvVar(w).cad * (S.mejoras.cadencia || 1) * (S.hype || 1) * nvRasgoCad(S, w));
  nvDispara(S, w, p, obj);
}
// Alcance: el del portador, por el tamaño de la nave y del arma, la variante, la pega de Bunny (railgun y láser, −20 %) y la Batería de flak
function nvAlcanceArma(S, w, p) {
  return p.alcance * nvFactor(S.nave.rango) * NV_RANGO_TAM[w.tam] * nvVar(w).alc * (S.cap === 'bunny' && (w.portador === 'railgun' || w.portador === 'laser') ? 0.8 : 1) * (w.fusion && w.fusion.id === 'bateriaFlak' ? 1.1 : 1);
}
// El enemigo visible más cercano dentro del alcance y del arco; las rocas, solo si no hay enemigos a tiro
function nvArmaObjetivo(S, w, dx, dy, alc, grados, arco) {
  let obj = null, mejor = alc * alc, roca = null, mejorR = alc * alc;
  for (const e of S.enem) {
    if (e.muerto || e.d.pasivo === 2 || !nvEnPantalla(S, e.x, e.y, -e.r * 0.5)) continue;   // solo lo que se ve
    const vx = e.x - w.x, vy = e.y - w.y, d2 = vx * vx + vy * vy;
    if (d2 > mejor || !NV.Arma.enArco(vx, vy, dx, dy, d2, grados, arco)) continue;
    if (e.d.pasivo) { if (d2 < mejorR) { mejorR = d2; roca = e; } continue; }
    mejor = d2; obj = e;
  }
  return obj || roca;
}
function nvDispara(S, w, p, obj) {
  nvRasgoPre(S, w);   // facciones.js: rasgos de arma propia de facción
  const c = NOVA_ARMAS.cargas[w.carga], dano = nvDanoArma(w) * nvRasgoMult(S, w, obj);
  nvSnd({ laser: 'nvLaser', railgun: 'nvRail', flak: 'nvFlak', lanzador: 'nvMisil' }[w.portador] || 'nvLaser', S);
  if (w.portador === 'laser') return nvDisparaLaser(S, w, obj, dano, c.color);
  const kf = nvFactor(S.nave.rango), A = NV.Arma, n = A.balas(w.portador, w.fusion ? w.fusion.id : '', nvVar(w).n);
  const base = { x: w.x, y: w.y, w, carga: w.carga, color: c.color, forma: c.forma, dano, golpeados: [] };
  S.fx.push({ t: 0.14, x: w.x, y: w.y, r: 8 * nvZ(S), color: c.color, tipo: 'flash' });   // fogonazo
  for (let i = 0; i < n; i++) {
    let a = Math.atan2(obj.y - w.y, obj.x - w.x);
    if (w.portador === 'flak') a += (Math.random() - 0.5) * 0.9; else if (n > 1) a += (i - (n - 1) / 2) * 0.12;
    const v = A.velocidad(w.portador, kf);
    S.proy.push(Object.assign({}, base, {
      vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: A.radio(w.portador, kf, NV_BALA_TAM[w.tam]),
      vida: A.vida(w.portador, p.alcance, kf, NV_RANGO_TAM[w.tam], v), perf: A.perfora(w.portador, nvVar(w).perf),
      guia: w.portador === 'lanzador' ? obj : null, golpeados: []
    }));
  }
  nvRasgoDespues(S, w, obj);
}
// El láser es un haz instantáneo contra el objetivo (el Haz enfocado, +20 % y doble calor)
function nvDisparaLaser(S, w, obj, dano, color) {
  const enfocado = w.fusion && w.fusion.id === 'hazEnfocado';
  w.rayo = 0.09; w.rx = obj.x; w.ry = obj.y;
  nvGolpe(S, obj, dano * (enfocado ? 1.2 : 1), w, obj.x, obj.y, enfocado ? 2 : 1);
  nvRasgoImpacto(S, w, dano, obj, obj.x, obj.y); nvRasgoDespues(S, w, obj);
  S.fx.push({ t: 0.16, x: w.x, y: w.y, r: 9 * nvZ(S), color, tipo: 'flash' });
}
// Drones: cada uno caza, vuelve a orbitar o se guarda a recargar. La batería y la recarga son reglas de dominio/dron.js (NV.Dron).
function nvDrones(S, w, p, dt) {
  const n = S.nave, v = nvVar(w), cant = p.proyectiles + (w.fusion ? 1 : 0) + v.n, kf = nvFactor(n.rango);
  w.fase += dt * 2.6;
  if (!w.drones) w.drones = [];
  while (w.drones.length < cant) w.drones.push({ x: w.x, y: w.y, cd: 0, bat: 1, dock: false });
  w.drones.length = cant;
  const ctx = { v, cant, R: 85 * n.escala, alc: p.alcance * kf * NV_RANGO_TAM[w.tam], vel: 340 * Math.pow(kf, 0.9), dano: nvDanoArma(w), cad: 1 / (p.cadencia * v.cad), elegidos: new Set(), herido: n.hp < n.hpMax };
  w.drones.forEach((d, i) => nvDronPaso(S, w, d, i, dt, ctx));
}
function nvDronPaso(S, w, d, i, dt, ctx) {
  d.cd -= dt;
  if (d.dock) { d.x = w.x; d.y = w.y; NV.Dron.recarga(d, dt); return; }   // guardado en el hueco, recargando
  const obj = ctx.v.repara ? null : nvDronObjetivo(S, d, ctx);
  if (obj) ctx.elegidos.add(obj);
  if (!NV.Dron.gasta(d, dt, ctx.v.repara ? ctx.herido : !!obj)) return;   // sin batería: a recargar
  nvDronVuela(S, w, d, i, dt, obj, ctx);
  if (ctx.v.repara) return nvDronRepara(S, d, ctx.herido);
  if (d.cd <= 0) nvDronGolpea(S, w, d, ctx);
}
// Cada dron caza al enemigo visible más cercano dentro del alcance (repartidos si hay varios; las rocas, lo último)
function nvDronObjetivo(S, d, ctx) {
  const n = S.nave;
  let obj = null, mejor = Infinity;
  for (const e of S.enem) {
    if (e.muerto || e.d.pasivo === 2 || !nvEnPantalla(S, e.x, e.y, -e.r * 0.5)) continue;
    if (Math.hypot(e.x - n.x, e.y - n.y) > ctx.alc + e.r) continue;
    const dd = Math.hypot(e.x - d.x, e.y - d.y) + (e.d.pasivo ? 1e5 : 0) + (ctx.elegidos.has(e) ? 300 : 0);
    if (dd < mejor) { mejor = dd; obj = e; }
  }
  return obj;
}
// Vuela hacia su presa o a su sitio en la órbita; los cinéticos derriban misiles y los EM interfieren al tocar (Dron parásito)
function nvDronVuela(S, w, d, i, dt, obj, ctx) {
  const n = S.nave, a = w.fase + i * 6.283 / ctx.cant, gx = obj ? obj.x : n.x + Math.cos(a) * ctx.R, gy = obj ? obj.y : n.y + Math.sin(a) * ctx.R;
  const dx = gx - d.x, dy = gy - d.y, dist = Math.hypot(dx, dy) || 1, paso = Math.min(dist, (obj ? ctx.vel : ctx.vel * 1.6) * dt);
  d.x += dx / dist * paso; d.y += dy / dist * paso;
  if (w.carga === 'cinetica') nvChocaMisil(S, d, 14);
  if (w.carga === 'em' && obj && !NV.Golpe.escudoEnPie(obj) && Math.hypot(obj.x - d.x, obj.y - d.y) < obj.r + 16) obj.est.interferido = Math.max(obj.est.interferido || 0, NOVA_ARMAS.combos.dronParasito.duracion);
}
// El dron reparador cura cada pocos segundos mientras la nave está herida
function nvDronRepara(S, d, herido) {
  if (!herido || d.cd > 0) return;
  const n = S.nave;
  d.cd = 4; n.hp = Math.min(n.hpMax, n.hp + n.hpMax * 0.015);
  S.nums.push({ x: d.x, y: d.y - 12, t: 0.7, txt: '+', color: '#6fe08a', g: 0 });
}
// Un golpe por dron y turno, al primero que toque
function nvDronGolpea(S, w, d, ctx) {
  const e = S.enem.find(e => !e.muerto && Math.hypot(e.x - d.x, e.y - d.y) < e.r + 14);
  if (!e) return;
  d.cd = ctx.cad;
  nvGolpe(S, e, ctx.dano, w, d.x, d.y, 1);
  nvRasgoImpacto(S, w, ctx.dano, e, d.x, d.y);
  if (w.fusion && w.fusion.id === 'dronesKamikaze') nvExplosion(S, d.x, d.y, 45, ctx.dano * 0.8, w, e);
}

// ---------- proyectiles ----------
function nvProyectiles(S, dt) {
  for (let i = S.proy.length - 1; i >= 0; i--) {
    const b = S.proy[i];
    b.vida -= dt;
    if (b.guia && !b.guia.muerto) NV.Arma.guia(b, b.guia.x, b.guia.y, dt);   // el misil gira hacia su objetivo
    b.x += b.vx * dt; b.y += b.vy * dt;
    let fin = b.vida <= 0;
    if (b.carga === 'cinetica' && nvChocaMisil(S, b) && --b.perf <= 0) fin = true;   // una bala cinética derriba misiles enemigos
    if (nvBalaImpacta(S, b)) fin = true;
    if (fin) S.proy.splice(i, 1);
  }
}
// La bala golpea a cada enemigo que toca una sola vez, hasta gastar su perforación; devuelve true si se ha gastado
function nvBalaImpacta(S, b) {
  for (const e of S.enem) {
    if (e.muerto || b.golpeados.includes(e) || Math.hypot(e.x - b.x, e.y - b.y) > e.r + b.r) continue;
    b.golpeados.push(e);
    nvGolpe(S, e, b.dano, b.w, b.x, b.y, 1);
    nvRasgoImpacto(S, b.w, b.dano, e, b.x, b.y);
    if (b.carga === 'explosiva' || (b.w.fusion && b.w.fusion.id === 'misilRacimo')) nvExplosion(S, b.x, b.y, 55, b.dano * 0.6, b.w, e);
    if (--b.perf <= 0) return true;
  }
  return false;
}
function nvExplosion(S, x, y, radio, dano, w, salvo, sinEstado) {
  nvSnd('nvEstalla', S, x, y);
  radio *= nvFactor(S.nave.rango);   // las explosiones también crecen con la nave
  S.fx.push({ t: 0.3, x, y, r: radio, color: NOVA_ARMAS.cargas[w.carga].color, tipo: 'onda' });
  // una explosión puede encender la sobrecarga de un vecino, que explota y enciende la del siguiente...: la cadena se corta a 3 saltos
  if ((S.expProf || 0) >= 3) return;
  S.expProf = (S.expProf || 0) + 1;
  const pulso = w.carga === 'explosiva' && !sinEstado && salvo && salvo.est && salvo.est.interferido > 0;   // Pulso expansivo: la explosión sobre un Interferido interfiere a los vecinos
  try {
    for (const e of S.enem) {
      if (e === salvo || e.muerto || Math.hypot(e.x - x, e.y - y) >= radio + e.r) continue;
      nvGolpe(S, e, dano, w, e.x, e.y, 0.5, true, sinEstado);
      if (pulso) NV.Golpe.pulsoExpansivo(e, NOVA_ARMAS.combos);
    }
  }
  finally { S.expProf--; }
}

// ---------- el golpe: escudo, estados, reacciones ----------
// Las reglas (qué multiplica, qué absorbe el escudo, qué estado deja cada carga) están en dominio/golpe.js (NV.Golpe); aquí se junta todo,
// se llama a las explosiones y a las reacciones y se dibuja (chispas, números, sonido).
// mult: multiplicador extra (haz enfocado); sinReaccion: los golpes de área no encadenan reacciones.
function nvChispas(S, x, y, color) {
  const z = nvZ(S);
  for (let i = 0; i < 4; i++) { const a = Math.random() * 6.283, v = (60 + Math.random() * 140) * z; S.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.35, color, s: 3 * z }); }   // chispas de impacto
  S.fx.push({ t: 0.12, x, y, r: 7 * z, color: '#ffffff', tipo: 'flash' });
}
function nvAvisa(S, avisos) { for (const a of avisos) S.nums.push({ ...a, txt: tr(a.txt) }); }
function nvGolpe(S, e, dano, w, x, y, mult, sinReaccion, sinEstado) {
  nvSnd('nvImpacto', S, x, y, 0.8);
  const A = NOVA_ARMAS, G = NV.Golpe, carga = w.carga, c = A.cargas[carga], K = A.combos, est = e.est;
  nvChispas(S, x, y, c.color);
  const escudoArriba = G.escudoEnPie(e);
  if (G.repele(e, carga)) { S.nums.push({ x, y: y - 14, t: 0.6, txt: tr('Repelida'), color: c.color, g: 0 }); return; }   // el escudo repele la EM: antes hay que tumbarlo
  let d = G.multiplicaDano(dano * (mult || 1), e, w, K, nvSeAleja(S, e)), crit = G.consumeMarca(est, carga);
  const reac = sinReaccion ? null : G.eligeReaccion(est, carga, A.reacciones);
  if (reac) nvReaccion(S, e, reac, w, d), d *= reac.id === 'fundido' ? 1 : reac.mult, crit = crit || reac.id === 'impactoLimpio';
  if (crit) d *= 2;
  if (escudoArriba) d = G.absorbeEscudo(e, d, w, c, A);   // el escudo del enemigo absorbe; la energía lo tumba
  d *= c.multCasco;
  G.frenaEscudo(e, d, K, sinEstado);
  if (!sinEstado) nvGolpeEstado(S, e, w, c, sinReaccion);   // la onda de una sobrecarga solo hace daño en área: no calienta a los vecinos
  G.plasma(e, w, K, sinEstado);
  nvGolpeCasco(S, e, d, crit, c.color, x, y);
}
// El estado que deja la carga, con su explosión de sobrecarga, sus avisos y la Metralla incendiaria del flak térmico
function nvGolpeEstado(S, e, w, c, sinReaccion) {
  const estado = NV.Golpe.aplicaEstado(e, w, c, NOVA_ARMAS, sinReaccion);
  if (estado.explosion) nvExplosion(S, e.x, e.y, estado.explosion.radio, estado.explosion.dano, w, e, true);
  nvAvisa(S, estado.avisos);
  if (w.portador === 'flak' && w.carga === 'termica') nvMetrallaIncendiaria(S, e);
}
// El daño entra en el casco: número en pantalla, robo de vida, estadísticas y, si toca, la muerte
function nvGolpeCasco(S, e, d, crit, color, x, y) {
  e.hp -= d;
  e.flash = 0.08;
  if (d > 0) S.nums.push({ x: x + (Math.random() - 0.5) * 14, y: y - 8, t: 0.7, txt: String(Math.round(d)), color: crit ? '#ffd93d' : color, g: crit ? 1 : 0 });
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
// Especialidades de portador (NOVA_ARMAS.combos): si el enemigo se aleja de tu nave (Cazador del lanzador)
function nvSeAleja(S, e) { const n = S.nave; return ((e.x - n.x) * (e.vx || 0) + (e.y - n.y) * (e.vy || 0)) > 0; }
// Metralla incendiaria: el perdigón térmico del flak calienta también a los vecinos (sin pasar de 99: la sobrecarga la dispara un golpe)
function nvMetrallaIncendiaria(S, e) {
  const K = NOVA_ARMAS.combos.metrallaIncendiaria, r = K.radio * nvFactor(S.nave.rango);
  for (const o of S.enem) if (o !== e && !o.muerto && Math.hypot(o.x - e.x, o.y - e.y) < r + o.r) o.calor = Math.min(99, (o.calor || 0) + K.calor);
}
