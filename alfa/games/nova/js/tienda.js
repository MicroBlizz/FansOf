// Fans of Nova · Tienda de módulos de la estación: comprar módulos nuevos, mejorar armas y reciclar lo que ya no quieres, todo con la chatarra de la cartera.
// Nada de azar pagado: el surtido se echa a suertes al atracar (gratis) y lo que cuesta chatarra es siempre un módulo que ves antes de comprar. Las pantallas están en tienda-ui.js.
'use strict';
const NV_MEJ_PRECIO = { S: 25, M: 55, L: 110 };   // base de una mejora de arma, según su tamaño
const NV_RECICLA = 0.5;                            // parte de lo que vale un módulo que devuelve el reciclaje
const NV_PRECIO_DEF = 120, NV_PRECIO_SIS = 55, NV_RENOVAR = 30;

function nvRarezaArma(w) { const v = w && w.variante && NV_VAR_ID[w.variante]; return NOVA_RAREZAS[v ? v.rareza : 'comun']; }
function nvPrecioMejora(w) { return Math.round(NV_MEJ_PRECIO[w.tam] * (1 + 0.6 * w.nivel) * nvRarezaArma(w).precio); }
// Lo que vale un módulo: su precio de tienda más lo invertido en mejoras; el reciclaje devuelve la mitad.
function nvValorModulo(w) {
  if (w.portador === 'defensa') return NV_PRECIO_DEF;
  let v = NV_PRECIO_TAM[w.tam] * nvRarezaArma(w).precio * (w.fusion ? 2 : 1);
  for (let i = 0; i < w.nivel; i++) v += Math.round(NV_MEJ_PRECIO[w.tam] * (1 + 0.6 * i) * nvRarezaArma(w).precio);
  return Math.round(v);
}
function nvPrecioReciclar(w) { return Math.floor(nvValorModulo(w) * NV_RECICLA); }
function nvPuedeMejorar(S, w) { return w.portador !== 'defensa' && w.nivel < NOVA_ARMAS.mejora.maxNiveles && S.cartera >= nvPrecioMejora(w); }
function nvMejoraArma(S, w) {
  if (!nvPuedeMejorar(S, w)) return false;
  S.cartera -= nvPrecioMejora(w); w.nivel++;
  return true;
}
// Siempre queda un arma a bordo: sin armas no hay forma de ganar chatarra.
function nvPuedeReciclar(S, w) { return w.portador === 'defensa' || S.nave.armas.filter(x => x.portador !== 'defensa').length > 1; }
function nvReciclaModulo(S, w) {
  if (!nvPuedeReciclar(S, w)) return false;
  S.cartera += nvPrecioReciclar(w);
  S.nave.armas.splice(S.nave.armas.indexOf(w), 1);
  if (w.portador === 'defensa') { if (w.carga === 'energia') S.nave.esc = null; else delete S.mejoras.blindaje; }
  return true;
}

// ---------- surtido ----------
function nvRanuraDefensa(S) { return nvRanuras(S.nave.rango, S).find(r => !S.nave.armas.some(w => w.slot === r.id) && r.tipos.includes('defensa') && (r.cara === 'popa' || r.cara === 'dorsal')); }
function nvArmaAlAzar(S) {   // una arma del pool al estilo de las cartas: más común cuanto menos rara
  const tipos = NV_TIPOS_LIBRES.filter(t => nvVariantesPool(t).length); if (!tipos.length) return null;
  const p = tipos[Math.floor(Math.random() * tipos.length)], cs = nvCargasDe(p), c = cs[Math.floor(Math.random() * cs.length)];
  const vs = nvVariantesPool(p), tot = vs.reduce((t, v) => t + NOVA_RAREZAS[v.rareza].peso, 0);
  let r = Math.random() * tot, v = vs[0];
  for (const x of vs) { v = x; if ((r -= NOVA_RAREZAS[x.rareza].peso) <= 0) break; }
  return { tipo: 'arma', portador: p, carga: c, variante: v.variante, rareza: v.rareza, precio: Math.round(NV_PRECIO_TAM[nvTamNuevo(S.nave.rango)] * NOVA_RAREZAS[v.rareza].precio) };
}
function nvGeneraSurtido(S) {
  const out = [];
  for (let i = 0; i < 30 && out.filter(o => o.tipo === 'arma').length < 3; i++) {
    const o = nvArmaAlAzar(S);
    if (o && !out.some(x => x.portador === o.portador && x.carga === o.carga && x.variante === o.variante)) out.push(o);
  }
  if (!S.nave.esc && nvEnPool('def:escudo')) out.push({ tipo: 'defensa', id: 'escudo', carga: 'energia', precio: NV_PRECIO_DEF });
  if (!S.mejoras.blindaje && nvEnPool('def:blindaje')) out.push({ tipo: 'defensa', id: 'blindaje', carga: 'cinetica', precio: NV_PRECIO_DEF });
  const sis = NV_MEJORAS_SISTEMA.filter(m => nvEnPool('sis:' + m.id) && (S.sist[m.id] || 0) < m.max && !(m.id === 'robo' && !S.nave.armas.some(w => w.portador !== 'defensa')));
  for (let i = 0; i < 2 && sis.length; i++) { const m = sis.splice(Math.floor(Math.random() * sis.length), 1)[0]; out.push({ tipo: 'sistema', id: m.id, precio: Math.round(NV_PRECIO_SIS * (1 + 0.25 * (S.sist[m.id] || 0))) }); }
  return out;
}
function nvSurtido(S) { if (!S.est.surtido) S.est.surtido = nvGeneraSurtido(S); return S.est.surtido; }
function nvRenovarSurtido(S) { if (S.cartera < NV_RENOVAR) return false; S.cartera -= NV_RENOVAR; S.est.surtido = nvGeneraSurtido(S); return true; }
// Devuelve null si se compra, o el motivo (ya traducido) si no.
function nvCompraModulo(S, o) {
  if (S.cartera < o.precio) return tr('No te llega la chatarra');
  const n = S.nave;
  if (o.tipo === 'sistema') { const m = NV_MEJORAS_SISTEMA.find(x => x.id === o.id); m.aplicar(S); S.sist[m.id] = (S.sist[m.id] || 0) + 1; }
  else if (o.tipo === 'defensa') {
    const sl = nvRanuraDefensa(S); if (!sl) return tr('Sin anclaje libre en popa o arriba: recicla un módulo');
    if (o.id === 'escudo') n.esc = { hp: 200, cap: 200, reg: 15, sin: 0 }; else S.mejoras.blindaje = 0.25;
    n.armas.push({ slot: sl.id, cara: sl.cara, tam: sl.tam, portador: 'defensa', carga: o.carga, nivel: 0, cd: 0 });
  } else {
    const sl = nvRanuraLibre(S, o.portador); if (!sl) return tr('Sin ranura libre: recicla un módulo');
    const w = nvArmaNueva(sl, o.portador, o.carga, null, nvTamNuevo(n.rango)); if (o.variante) w.variante = o.variante;
    n.armas.push(w);
  }
  S.cartera -= o.precio; o.vendido = true;
  return null;
}
