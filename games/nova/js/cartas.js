// Fans of Nova · Cartas de rango: arma nueva, mejora, fusión o defensa, con el pool inclinado por sinergia (PLAN-NOVA.md, «El pool inclinado»).
// Cada carta es { tipo, titulo, detalle, carga, tendencia, peso, aplicar() }.
'use strict';
// Las armas nuevas salen del tamaño que toca a tu rango (más tarde, medianas y grandes); el taller de la estación las une o las divide.
function nvTamNuevo(rango) { return rango >= 18 ? 'L' : rango >= 9 ? 'M' : 'S'; }
const NV_CARGAS = ['cinetica', 'energia', 'termica', 'em', 'explosiva'];
// Las cargas que tienen sentido en ese portador (railgun de iones sí; láser cinético no).
function nvCargasDe(portador) { const p = NOVA_ARMAS.portadores[portador]; return (p && p.admite) || NV_CARGAS; }
// Prototipo: todas las ranuras de armas admiten los cinco portadores, para probar toda la matriz de fusiones (en el juego real manda la plantilla de la facción).
const NV_TIPOS_LIBRES = ['railgun', 'flak', 'laser', 'lanzador', 'drones'];
const NV_MEJORAS_SISTEMA = [
  { id: 'dano', cat: 'of', titulo: 'Munición mejorada', detalle: 'Todas las armas hacen un 8 % más de daño', max: 40, aplicar: S => { S.mejoras.dano = (S.mejoras.dano || 1) * 1.08; } },
  { id: 'cadencia', cat: 'of', titulo: 'Cargador rápido', detalle: 'Todas las armas disparan un 6 % más rápido', max: 25, aplicar: S => { S.mejoras.cadencia = (S.mejoras.cadencia || 1) * 1.06; } },
  { id: 'robo', cat: 'de', titulo: 'Sifón de casco', detalle: 'Un 1 % más del daño que haces repara tu casco', max: 25, aplicar: S => { S.mejoras.robo = (S.mejoras.robo || 0) + 0.01; } },
  { id: 'casco', cat: 'de', titulo: 'Casco reforzado', detalle: 'Casco +10 % y se repara un 30 %', max: 25, aplicar: S => { S.nave.hpMax = Math.round(S.nave.hpMax * 1.1); S.nave.hp = Math.min(S.nave.hpMax, S.nave.hp + S.nave.hpMax * 0.3); } },
  { id: 'regen', cat: 'de', titulo: 'Reparación automática', detalle: 'El casco se repara solo un poco más cada segundo', max: 20, aplicar: S => { S.mejoras.regen = (S.mejoras.regen || 0) + 0.6; } },
  { id: 'vel', cat: 'ut', titulo: 'Motores afinados', detalle: 'La nave va un 5 % más rápido', max: 15, aplicar: S => { S.mejoras.vel = (S.mejoras.vel || 1) * 1.05; } },
  { id: 'iman', cat: 'ut', titulo: 'Imán de chatarra', detalle: 'La chatarra te alcanza desde más lejos', max: 12, aplicar: S => { S.mejoras.iman = (S.mejoras.iman || 0) + 1; } }
];

// Variantes de un portador que están en el pool (la básica es la de id null).
function nvVariantesPool(portador) {
  const out = [];
  if (nvEnPool('arma:' + portador + ':base')) out.push({ id: 'arma:' + portador + ':base', variante: null, rareza: 'comun' });
  for (const v of NOVA_VARIANTES) if (v.portador === portador && nvEnPool('arma:' + portador + ':' + v.id)) out.push({ id: 'arma:' + portador + ':' + v.id, variante: v.id, rareza: v.rareza });
  return out;
}
// Cuánto «encaja» un arma nueva con lo que llevas: ×1,5 por portador o carga repetidos, hasta ×4.
function nvPesoTendencia(S, portador, carga) {
  let k = 1;
  for (const w of S.nave.armas) { if (w.portador === portador) k *= 1.5; if (w.carga === carga) k *= 1.5; }
  return Math.min(4, k);
}
function nvCandidatas(S) {
  const n = S.nave, out = [], libres = nvRanuras(n.rango, S).filter(r => !n.armas.some(w => w.slot === r.id));
  for (const sl of libres) {
    if (sl.cara !== 'popa') for (const portador of NV_TIPOS_LIBRES) {   // el pool lleva todas las armas: las desbloqueadas y no retiradas en el Arsenal
      const vars = nvVariantesPool(portador), suma = vars.reduce((t, v) => t + NOVA_RAREZAS[v.rareza].peso, 0);
      for (const carga of nvCargasDe(portador)) {
        const tend = nvPesoTendencia(S, portador, carga);
        for (const v of vars) {
          const R = NOVA_RAREZAS[v.rareza], V = v.variante ? NV_VAR_ID[v.variante] : null;
          out.push({ tipo: 'arma', cat: 'of', ic: ['arma', v.variante || portador], rareza: v.rareza, peso: tend * (n.armas.length ? 0.35 : 1) * (R.peso * nvPesoPool(v.id) / suma) / NV_TIPOS_LIBRES.length / 2, carga, tendencia: tend > 1.4,
            titulo: (V ? tr(V.nombre) : tr(NOVA_ARMAS.portadores[portador].nombre)) + ' · ' + tr(NOVA_ARMAS.cargas[carga].nombre),
            detalle: tr('Nueva en la ranura') + ' ' + tr(sl.cara) + ' (' + nvTamNuevo(n.rango) + '). ' + tr(V ? V.efecto : NOVA_ARMAS.portadores[portador].fuerte),
            aplicar: () => { const w = nvArmaNueva(sl, portador, carga, null, nvTamNuevo(n.rango)); if (V) w.variante = V.id; n.armas.push(w); } });
        }
      }
    }
    if (sl.tipos.includes('defensa')) {
      if (!n.esc && nvEnPool('def:escudo')) out.push({ tipo: 'defensa', cat: 'de', ic: ['sis', 'escudo'], peso: 1.2 * nvPesoPool('def:escudo'), rareza: 'rara', carga: 'energia', titulo: tr('Escudo'), detalle: tr('Absorbe 200 de daño y se regenera si pasas 3 s sin que te peguen'), aplicar: () => { n.esc = { hp: 200, cap: 200, reg: 15, sin: 0 }; n.armas.push({ slot: sl.id, cara: sl.cara, tam: sl.tam, portador: 'defensa', carga: 'energia', nivel: 0, cd: 0 }); } });
      if (!S.mejoras.blindaje && nvEnPool('def:blindaje')) out.push({ tipo: 'defensa', cat: 'de', ic: ['sis', 'blindaje'], peso: 1 * nvPesoPool('def:blindaje'), rareza: 'rara', carga: 'cinetica', titulo: tr('Blindaje'), detalle: tr('Recibes un 25 % menos de daño'), aplicar: () => { S.mejoras.blindaje = 0.25; n.armas.push({ slot: sl.id, cara: sl.cara, tam: sl.tam, portador: 'defensa', carga: 'cinetica', nivel: 0, cd: 0 }); } });
    }
  }
  const act = n.armas.filter(w => w.portador !== 'defensa');
  for (const w of act) if (w.nivel < NOVA_ARMAS.mejora.maxNiveles) out.push({ tipo: 'mejora', cat: 'of', ic: ['arma', w.portador], peso: 0.9, carga: w.carga, titulo: tr('Mejora') + ': ' + nvNombreArma(w), detalle: tr('+25 % de daño') + ' (' + (w.nivel + 1) + '/' + NOVA_ARMAS.mejora.maxNiveles + ')', aplicar: () => { w.nivel++; } });
  const llenas = !out.some(o => o.tipo === 'arma');   // con todas las ranuras llenas, las mejoras pequeñas pasan a ser lo normal
  for (const m of NV_MEJORAS_SISTEMA) if (nvEnPool('sis:' + m.id) && (S.sist[m.id] || 0) < m.max && !(m.id === 'robo' && !act.length)) out.push({ tipo: 'sistema', cat: m.cat, ic: ['sis', m.id], peso: (llenas ? 1.6 : 0.5) * nvPesoPool('sis:' + m.id), carga: 'cinetica', titulo: tr(m.titulo), detalle: tr(m.detalle), aplicar: () => { m.aplicar(S); S.sist[m.id] = (S.sist[m.id] || 0) + 1; } });
  // fusiones: portador de una + carga de la otra (mixta), o dos del mismo portador (doble)
  for (const a of act) for (const b of act) {
    if (a === b || a.fusion || b.fusion) continue;
    for (const f of NOVA_ARMAS.fusiones) {
      const ok = f.tipo === 'doble' ? (a.portador === f.portador && b.portador === f.portador && a.carga === f.carga) : (a.portador === f.portador && b.carga === f.carga && a.carga !== b.carga);
      if (!ok) continue;
      out.push({ tipo: 'fusion', cat: 'of', ic: ['sis', 'fusion'], peso: 3, carga: f.carga, tendencia: true, titulo: tr('Fusión') + ': ' + tr(f.nombre), detalle: tr(f.efecto) + '. ' + tr('Ocupa una ranura y rinde lo de dos'),
        aplicar: () => { n.armas.splice(n.armas.indexOf(b), 1); a.fusion = f; a.portador = f.portador; a.carga = f.carga; a.nivel = Math.max(a.nivel, b.nivel); if (b.tam === 'L' || (b.tam === 'M' && a.tam === 'S')) a.tam = b.tam; } });
    }
  }
  return out;
}
// Cuatro cartas: una ofensiva, una defensiva, una de utilidad y una al azar.
function nvElige(pool) {
  if (!pool.length) return null;
  const total = pool.reduce((s, c) => s + c.peso, 0);
  let r = Math.random() * total, i = 0;
  while (i < pool.length - 1 && (r -= pool[i].peso) > 0) i++;
  return pool[i];
}
// Una carta para un rol (ofensiva, defensiva, utilidad o al azar). Si hay una ranura libre, la ofensiva es siempre un arma (o una fusión).
function nvCartaRol(rol, pool) {
  if (rol === 'of') {
    const armas = pool.filter(c => c.tipo === 'arma'), fus = pool.filter(c => c.tipo === 'fusion');
    return armas.length ? (fus.length && Math.random() < 0.5 ? nvElige(fus) : nvElige(armas)) : nvElige(pool.filter(c => c.cat === 'of'));
  }
  return rol === 'azar' ? nvElige(pool) : nvElige(pool.filter(c => c.cat === rol));
}
const NV_ROLES = ['of', 'de', 'ut', 'azar'];
function nvTresCartas(S) {
  let pool = nvCandidatas(S);
  const elegidas = [];
  for (const rol of NV_ROLES) {
    const c = nvCartaRol(rol, pool);
    if (!c) continue;
    c.rol = rol; elegidas.push(c); pool = pool.filter(x => x !== c && x.titulo !== c.titulo);
  }
  return elegidas;
}
function nvAbrirCartas(S) {
  S.estado = 'cartas';
  S.cartas = nvTresCartas(S);
  S.rr = S.cartas.map(() => S.cap === 'epicchampion' ? 0 : 1 + (S.rerollExtra || 0));   // cada carta tiene sus propias repeticiones
  if (!S.cartas.length) { S.estado = 'juego'; return; }
}
function nvElegirCarta(S, i) {
  const c = S.cartas && S.cartas[i];
  if (!c) return;
  c.aplicar();
  S.stats.cartas.push(c.titulo);
  nvAjustaTamanos(S);
  S.cartas = null; S.estado = 'juego';
}
// Cambia SOLO la carta i por otra del mismo rol; las demás se quedan. No sale ninguna de las que ya ves.
function nvRerollCarta(S, i) {
  if (S.estado !== 'cartas' || !S.cartas || !S.cartas[i] || !(S.rr[i] > 0)) return false;
  const vistas = S.cartas.map(c => c.titulo), c = nvCartaRol(S.cartas[i].rol, nvCandidatas(S).filter(x => !vistas.includes(x.titulo)));
  if (!c) return false;
  c.rol = S.cartas[i].rol;
  S.rr[i]--;
  S.cartas = S.cartas.map((x, j) => j === i ? c : x);
  return true;
}
// Cada arma crece con su ranura (S→M→L según el rango).
function nvAjustaTamanos(S) {
  const sl = nvRanuras(S.nave.rango, S);
  // el tamaño ya es del arma (se cambia en la estación): nada que ajustar al subir de rango
}

// ---------- estación: cambiar el arma de una ranura (cuesta chatarra de la cartera) ----------
const NV_PRECIO_TAM = { S: 40, M: 90, L: 180 };
function nvOfertasEstacion(S, slotId) {
  const sl = nvRanuras(S.nave.rango, S).find(r => r.id === slotId), tipos = NV_TIPOS_LIBRES.filter(t => nvVariantesPool(t).length), out = [];
  const tam = (S.nave.armas.find(w => w.slot === slotId) || { tam: 'S' }).tam;
  for (let i = 0; i < 40 && out.length < 3; i++) {
    const p = tipos[Math.floor(Math.random() * tipos.length)], cs = nvCargasDe(p), c = cs[Math.floor(Math.random() * cs.length)];
    const vs = nvVariantesPool(p), tot = vs.reduce((t, v) => t + NOVA_RAREZAS[v.rareza].peso, 0);
    let r = Math.random() * tot, v = vs[0];
    for (const x of vs) { v = x; if ((r -= NOVA_RAREZAS[x.rareza].peso) <= 0) break; }
    if (!out.some(o => o.portador === p && o.carga === c && o.variante === v.variante)) out.push({ portador: p, carga: c, variante: v.variante, rareza: v.rareza, precio: Math.round(NV_PRECIO_TAM[tam] * NOVA_RAREZAS[v.rareza].precio), slot: sl });
  }
  return out;
}
function nvCompraArma(S, oferta, viejo) {
  if (S.cartera < oferta.precio) return false;
  S.cartera -= oferta.precio;
  const n = S.nave, w = nvArmaNueva(oferta.slot, oferta.portador, oferta.carga, null, viejo.tam);
  if (oferta.variante) w.variante = oferta.variante;
  w.nivel = viejo.nivel;   // la mejora se conserva; la fusión no
  n.armas.splice(n.armas.indexOf(viejo), 1, w);
  return true;
}

// ---------- taller de la estación: 2 pequeñas = 1 mediana, 2 medianas = 1 grande, y al revés (dividir necesita una ranura libre) ----------
const NV_SIG_TAM = { S: 'M', M: 'L' }, NV_ANT_TAM = { M: 'S', L: 'M' };
function nvPuedeUnir(a, b) { return a && b && a !== b && a.tam === b.tam && !!NV_SIG_TAM[a.tam] && a.portador !== 'defensa' && b.portador !== 'defensa'; }
function nvUneArmas(S, a, b) {
  if (!nvPuedeUnir(a, b)) return false;
  a.tam = NV_SIG_TAM[a.tam]; a.nivel = Math.max(a.nivel, b.nivel);
  if (!a.fusion && b.fusion) { a.fusion = b.fusion; a.portador = b.portador; a.carga = b.carga; }
  S.nave.armas.splice(S.nave.armas.indexOf(b), 1);
  return true;
}
function nvRanuraLibre(S, portador) {
  return nvRanuras(S.nave.rango, S).find(r => r.cara !== 'popa' && !S.nave.armas.some(w => w.slot === r.id) && r.tipos.includes(portador));
}
function nvDivideArma(S, a) {
  const sl = a.portador !== 'defensa' && NV_ANT_TAM[a.tam] ? nvRanuraLibre(S, a.portador) : null;
  if (!sl) return false;
  const t = NV_ANT_TAM[a.tam], b = nvArmaNueva(sl, a.portador, a.carga, null, t);
  b.nivel = a.nivel; a.tam = t; a.fusion = null;
  S.nave.armas.push(b);
  return true;
}
