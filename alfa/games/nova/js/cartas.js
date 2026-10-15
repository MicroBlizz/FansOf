// Fans of Nova · Cartas de rango: arma nueva, mejora, fusión o defensa, con el pool inclinado por sinergia (PLAN-NOVA.md, «El pool inclinado»).
// Cada carta es { tipo, titulo, detalle, carga, tendencia, peso, aplicar() }.
'use strict';
const NV_CARGAS = ['cinetica', 'energia', 'termica', 'em', 'explosiva'];
// Prototipo: todas las ranuras de armas admiten los cinco portadores, para probar toda la matriz de fusiones (en el juego real manda la plantilla de la facción).
const NV_TIPOS_LIBRES = ['railgun', 'flak', 'laser', 'lanzador', 'drones'];
const NV_MEJORAS_SISTEMA = [
  { id: 'cadencia', titulo: 'Cargador rápido', detalle: 'Todas las armas disparan un 15 % más rápido', max: 3, aplicar: S => { S.mejoras.cadencia = (S.mejoras.cadencia || 1) * 1.15; } },
  { id: 'iman', titulo: 'Imán de chatarra', detalle: 'La chatarra te alcanza desde más lejos', max: 3, aplicar: S => { S.mejoras.iman = (S.mejoras.iman || 0) + 1; } },
  { id: 'casco', titulo: 'Casco reforzado', detalle: 'Casco +60 y se repara por completo', max: 3, aplicar: S => { S.nave.hpMax += 60; S.nave.hp = S.nave.hpMax; } },
  { id: 'vampiro', titulo: 'Sifón de casco', detalle: 'Un 2 % del daño que haces repara tu casco', max: 1, aplicar: S => { for (const w of S.nave.armas) w.vampiro = 1; S.mejoras.vampiro = 1; } }
];

// Cuánto «encaja» un arma nueva con lo que llevas: ×1,5 por portador o carga repetidos, hasta ×4.
function nvPesoTendencia(S, portador, carga) {
  let k = 1;
  for (const w of S.nave.armas) { if (w.portador === portador) k *= 1.5; if (w.carga === carga) k *= 1.5; }
  return Math.min(4, k);
}
function nvCandidatas(S) {
  const n = S.nave, out = [], libres = nvRanuras(n.rango).filter(r => !n.armas.some(w => w.slot === r.id));
  for (const sl of libres) {
    const tipos = (sl.cara === 'popa' ? [] : S.libre ? NV_TIPOS_LIBRES : sl.tipos).filter(t => NOVA_ARMAS.portadores[t]);
    for (const portador of tipos) for (const carga of NV_CARGAS) {
      const peso = nvPesoTendencia(S, portador, carga);
      out.push({ tipo: 'arma', peso: peso * (n.armas.length ? 0.35 : 1) * (sl.tam === 'S' ? 1 : 1.4) / (tipos.length || 1) / 2, carga, tendencia: peso > 1.4,
        titulo: tr(NOVA_ARMAS.portadores[portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[carga].nombre),
        detalle: tr('Nueva en la ranura') + ' ' + tr(sl.cara) + ' (' + sl.tam + '). ' + tr(NOVA_ARMAS.portadores[portador].fuerte),
        aplicar: () => n.armas.push(nvArmaNueva(sl, portador, carga)) });
    }
    if (sl.tipos.includes('defensa')) {
      if (!n.esc) out.push({ tipo: 'defensa', peso: 1.2, carga: 'energia', titulo: tr('Escudo'), detalle: tr('Absorbe 200 de daño y se regenera si pasas 3 s sin que te peguen'), aplicar: () => { n.esc = { hp: 200, cap: 200, reg: 15, sin: 0 }; n.armas.push({ slot: sl.id, cara: sl.cara, tam: sl.tam, portador: 'defensa', carga: 'energia', nivel: 0, cd: 0 }); } });
      if (!S.mejoras.blindaje) out.push({ tipo: 'defensa', peso: 1, carga: 'cinetica', titulo: tr('Blindaje'), detalle: tr('Recibes un 25 % menos de daño'), aplicar: () => { S.mejoras.blindaje = 0.25; n.armas.push({ slot: sl.id, cara: sl.cara, tam: sl.tam, portador: 'defensa', carga: 'cinetica', nivel: 0, cd: 0 }); } });
    }
  }
  const act = n.armas.filter(w => w.portador !== 'defensa');
  for (const w of act) if (w.nivel < NOVA_ARMAS.mejora.maxNiveles) out.push({ tipo: 'mejora', peso: 0.9, carga: w.carga, titulo: tr('Mejora') + ': ' + nvNombreArma(w), detalle: tr('+25 % de daño') + ' (' + (w.nivel + 1) + '/' + NOVA_ARMAS.mejora.maxNiveles + ')', aplicar: () => { w.nivel++; } });
  for (const m of NV_MEJORAS_SISTEMA) if ((S.sist[m.id] || 0) < m.max && !(m.id === 'vampiro' && !act.length)) out.push({ tipo: 'sistema', peso: 0.5, carga: 'cinetica', titulo: tr(m.titulo), detalle: tr(m.detalle), aplicar: () => { m.aplicar(S); S.sist[m.id] = (S.sist[m.id] || 0) + 1; } });
  // fusiones: portador de una + carga de la otra (mixta), o dos del mismo portador (doble)
  for (const a of act) for (const b of act) {
    if (a === b || a.fusion || b.fusion) continue;
    for (const f of NOVA_ARMAS.fusiones) {
      const ok = f.tipo === 'doble' ? (a.portador === f.portador && b.portador === f.portador && a.carga === f.carga) : (a.portador === f.portador && b.carga === f.carga && a.carga !== b.carga);
      if (!ok) continue;
      out.push({ tipo: 'fusion', peso: 3, carga: f.carga, tendencia: true, titulo: tr('Fusión') + ': ' + tr(f.nombre), detalle: tr(f.efecto) + '. ' + tr('Ocupa una ranura y rinde lo de dos'),
        aplicar: () => { n.armas.splice(n.armas.indexOf(b), 1); a.fusion = f; a.portador = f.portador; a.carga = f.carga; a.nivel = Math.max(a.nivel, b.nivel); if (b.tam === 'L' || (b.tam === 'M' && a.tam === 'S')) a.tam = b.tam; } });
    }
  }
  return out;
}
// Tres cartas distintas, a poder ser con al menos un arma o fusión.
function nvTresCartas(S) {
  let pool = nvCandidatas(S);
  const elegidas = [];
  while (elegidas.length < 3 && pool.length) {
    const total = pool.reduce((s, c) => s + c.peso, 0);
    let r = Math.random() * total, i = 0;
    while (i < pool.length - 1 && (r -= pool[i].peso) > 0) i++;
    const c = pool[i];
    elegidas.push(c);
    pool = pool.filter(x => x !== c && !(c.tipo === 'arma' && x.tipo === 'arma' && x.titulo === c.titulo) && !(x.tipo === c.tipo && x.titulo === c.titulo));
  }
  return elegidas;
}
function nvAbrirCartas(S) {
  S.estado = 'cartas';
  S.cartas = nvTresCartas(S);
  S.rerolls = 1;
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
function nvReroll(S) {
  if (S.estado !== 'cartas' || S.rerolls <= 0) return;
  S.rerolls--; S.cartas = nvTresCartas(S);
}
// Cada arma crece con su ranura (S→M→L según el rango).
function nvAjustaTamanos(S) {
  const sl = nvRanuras(S.nave.rango);
  for (const w of S.nave.armas) { const r = sl.find(x => x.id === w.slot); if (r && w.portador !== 'defensa') w.tam = r.tam; }
}
