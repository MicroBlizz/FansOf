// Fans of Roguelite (prototipo) · Las reglas, sin dibujos: el conejo, subir de nivel, qué habilidades se ofrecen y qué pasa en
// cada turno del combate (quién pega, cuánto y qué habilidades saltan). El dibujo lo pone combate.js.
'use strict';

function nuevoHeroe() {
  return { vida: HEROE_BASE.vida, vidaMax: HEROE_BASE.vida, atq: HEROE_BASE.atq, crit: HEROE_BASE.crit, nivel: 1, monedas: 0, habs: {} };
}
const tiene = (h, id) => !!h.habs[id];
function aplicaHabilidad(h, id) {
  h.habs[id] = (h.habs[id] || 0) + 1;
  if (id === 'zanahoria') h.atq += 5;
  if (id === 'pelusa') { h.vidaMax += 30; h.vida = Math.min(h.vidaMax, h.vida + 30); }
  if (id === 'espiral') h.crit += 0.25;
}
function subeNivel(h) {
  h.nivel++; h.vidaMax += SUBIDA.vida; h.atq += SUBIDA.atq;
  const cura = SUBIDA.vida + Math.round(h.vidaMax * SUBIDA.cura);
  h.vida = Math.min(h.vidaMax, h.vida + cura);
  return cura;
}
// tres habilidades distintas, según la rareza (en el cofre, de Rara para arriba)
function ofertas(h, cofre, azar = Math.random) {
  const pesos = cofre ? PESO_COFRE : PESO;
  const libres = id => HABILIDADES[id].varias || !h.habs[id];
  let lista = Object.keys(HABILIDADES).filter(id => libres(id) && pesos[HABILIDADES[id].rar]);
  const out = [];
  while (out.length < 3) {
    if (!lista.length) lista = Object.keys(HABILIDADES).filter(id => libres(id) && !out.includes(id));
    if (!lista.length) break;
    const total = lista.reduce((s, id) => s + (pesos[HABILIDADES[id].rar] || PESO[HABILIDADES[id].rar]), 0);
    let r = azar() * total, elegida = lista[0];
    for (const id of lista) { r -= pesos[HABILIDADES[id].rar] || PESO[HABILIDADES[id].rar]; if (r <= 0) { elegida = id; break; } }
    out.push(elegida); lista = lista.filter(id => id !== elegida);
  }
  return out;
}
function nuevoEnemigo(id) { const d = ENEMIGOS[id]; return Object.assign({ id, vidaMax: d.vida }, d); }

// el turno del conejo (número n, desde 1): lista de golpes en orden
function turnoHeroe(h, n, azar = Math.random) {
  const acc = [], var_ = () => 0.9 + azar() * 0.2;
  if (tiene(h, 'chaos') && n % 3 === 0) acc.push({ tipo: 'chaos', dano: Math.round(h.atq * 3) });
  else {
    const crit = azar() < h.crit;
    acc.push({ tipo: 'golpe', dano: Math.round(h.atq * var_() * (crit ? 2 : 1)), crit });
    if (tiene(h, 'rabia') && azar() < 0.35) acc.push({ tipo: 'rabia', dano: Math.round(h.atq * 0.8 * var_()) });
  }
  if (tiene(h, 'ardilla')) acc.push({ tipo: 'ardilla', dano: 6 });
  if (tiene(h, 'bellotas') && n % 3 === 0) acc.push({ tipo: 'bellotas', danos: [7, 7, 7] });
  return acc;
}
// el turno del enemigo (número n, desde 1). c.huelga: si ya se ha usado la huelga en este combate
function turnoEnemigo(h, e, n, c, azar = Math.random) {
  if (n === 1 && tiene(h, 'pulgas')) return { tipo: 'pulgas', dano: 0 };
  const especial = e.jefe && n % 3 === 0;
  const dano = Math.round(e.atq * (0.9 + azar() * 0.2) * (especial ? 1.8 : 1));
  if (tiene(h, 'huelga') && !c.huelga) { c.huelga = true; return { tipo: especial ? 'especial' : 'golpe', dano: 0, huelga: true }; }
  return { tipo: especial ? 'especial' : 'golpe', dano };
}
const curaBotiquin = (h, dano) => tiene(h, 'botiquin') ? Math.max(1, Math.round(dano * 0.25)) : 0;
