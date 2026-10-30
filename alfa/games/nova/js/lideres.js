// Fans of Nova · Pasivas de los líderes que no estaban en partida.js: CyberMarine (escudos), MemeLord (RNG), Vikingo (armas grandes) y La Directora (auras).
// Cifras y textos en datos-tripulacion.js. Ganchos: nvLiderInicio (al empezar), nvLiderPaso (cada paso), nvLiderDano (daño de un arma) y nvLiderCartas (al abrir cartas).
'use strict';
const NV_LIDERES = ['cybermarine', 'memelord', 'vikingo', 'directora'];
const NV_RAR_RANGO = { comun: 0, rara: 1, epica: 2, legendaria: 3 };
function nvAura(S, id) { return !!(S.auras && S.auras.includes(id)); }
function nvAuraNueva(S) {   // La Directora: un aura que aún no tenga, al azar
  const libres = NOVA_TRIPULACION.aurasDirectora.filter(a => !S.auras.includes(a.id)); if (!libres.length) return;
  const a = libres[Math.floor(Math.random() * libres.length)]; S.auras.push(a.id);
  if (a.id === 'secuela') { S.mejoras.cadencia = (S.mejoras.cadencia || 1) * 1.15; S.nave.hpMax = Math.round(S.nave.hpMax * 0.85); S.nave.hp = Math.min(S.nave.hp, S.nave.hpMax); }
  if (a.id === 'cameo') { S.rerollExtra = (S.rerollExtra || 0) + 1; S.chatExtra = (S.chatExtra || 0) - 0.1; }
  S.aviso = { t: 3.5, txt: tr('Aura') + ': ' + tr(a.nombre) + '!' };
}
function nvLiderInicio(S) {
  if (S.cap === 'directora') { S.auras = []; S.dirClase = nvClase(S.nave.rango); nvAuraNueva(S); }
}
// Escudo: CyberMarine lo lleva +50 % y lo regenera también en combate (a un tercio); Taquillazo lo deja −15 %. Blindaje: CyberMarine −30 %.
function nvLiderPaso(S, dt) {
  const n = S.nave;
  if (S.cap === 'directora' && nvClase(n.rango) > S.dirClase) { S.dirClase = nvClase(n.rango); nvAuraNueva(S); }   // un aura más cada vez que la nave evoluciona
  const fe = (S.cap === 'cybermarine' ? 1.5 : 1) * (nvAura(S, 'taquillazo') ? 0.85 : 1);
  if (n.esc && fe !== 1 && !n.esc.lider) { n.esc.lider = true; n.esc.cap = Math.round(n.esc.cap * fe); n.esc.hp = Math.min(n.esc.cap, n.esc.hp * fe); }
  if (S.cap === 'cybermarine') {
    if (n.esc && n.esc.sin > 0) n.esc.hp = Math.min(n.esc.cap, n.esc.hp + n.esc.reg * dt / 3);
    if (S.mejoras.blindaje === 0.25) S.mejoras.blindaje = 0.175;
  }
}
function nvLiderDano(S, w) {
  let d = 1;
  if (S.cap === 'vikingo') d *= w.tam === 'L' ? 1.25 : w.tam === 'S' ? 0.7 : 1;
  if (nvAura(S, 'taquillazo') && w.carga === 'explosiva') d *= 1.2;
  if (nvAura(S, 'crossover') && w.fusion) d *= w.fusion.tipo === 'mixta' ? 1.2 : 0.8;
  return d;
}
// MemeLord: cada carta tiene un 25 % de salir de rareza superior y un 10 % de ser un meme caducado.
function nvLiderCartas(S) {
  if (S.cap !== 'memelord' || !S.cartas) return;
  let pool = null;
  S.cartas = S.cartas.map(c => {
    const r = Math.random();
    if (r < 0.1) return { tipo: 'basura', cat: c.cat, rol: c.rol, titulo: tr('Meme caducado'), detalle: tr('No hace nada. Bueno, da 15 de chatarra para la estación.'), aplicar: () => { S.cartera += 15; } };
    if (r < 0.35 && c.rareza && c.tipo === 'arma') {
      pool = pool || nvCandidatas(S);
      const mej = pool.filter(x => x.tipo === 'arma' && NV_RAR_RANGO[x.rareza] === NV_RAR_RANGO[c.rareza] + 1);
      const x = nvElige(mej); if (x) { x.rol = c.rol; return x; }
    }
    return c;
  });
}
