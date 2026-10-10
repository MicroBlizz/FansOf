// Fans of Roguelite · Las reglas, sin dibujos: el conejo y sus cifras (mejoras + niveles + habilidades + objetos), la
// experiencia, qué habilidades y objetos salen (con la suerte), los enemigos según el mundo y el día, y qué pasa en cada
// turno del combate. El dibujo lo pone combate.js.
'use strict';

const nvMejora = id => GUARDA.mejoras[id] || 0;
function nuevoHeroe() {
  const h = {
    base: { vida: HEROE_BASE.vida + nvMejora('vida') * MEJORAS.vida.v, atq: HEROE_BASE.atq + nvMejora('atq') * MEJORAS.atq.v, crit: HEROE_BASE.crit + nvMejora('crit') * MEJORAS.crit.v / 100,
      suerte: nvMejora('suerte') * MEJORAS.suerte.v, monedas: nvMejora('botin') * MEJORAS.botin.v, siesta: nvMejora('siesta') * MEJORAS.siesta.v },
    extra: { atq: 0, vida: 0, crit: 0, def: 0, suerte: 0 }, nivel: 1, xp: 0, monedas: 0, habs: {}, objs: { arma: null, cabeza: null, amuleto: null },
    contrato: nvMejora('contrato'), mecha: 0, cuota: 0, derrotados: 0,
  };
  recalcula(h); h.vida = h.vidaMax;
  return h;
}
const nivelHab = (h, id) => h.habs[id] || 0;
function valorHab(h, id) {
  const n = nivelHab(h, id); if (!n) return 0;
  const d = HABILIDADES[id];
  return d.suma ? d.v.slice(0, n).reduce((a, b) => a + b, 0) : d.v[n - 1];
}
const deObjetos = (h, campo) => HUECOS.reduce((s, k) => s + ((h.objs[k] && OBJETOS[h.objs[k]][campo]) || 0), 0);
// recalcula las cifras; si la vida máxima sube, la vida sube lo mismo
function recalcula(h) {
  const antes = h.vidaMax, corona = 1 + valorHab(h, 'corona') / 100;
  h.atq = Math.max(1, Math.round((h.base.atq + h.extra.atq + valorHab(h, 'zanahoria') + deObjetos(h, 'atq')) * corona));
  h.vidaMax = Math.max(20, Math.round((h.base.vida + h.extra.vida + valorHab(h, 'pelusa') + deObjetos(h, 'vida')) * corona));
  h.crit = Math.min(0.9, h.base.crit + (h.extra.crit + valorHab(h, 'espiral') + deObjetos(h, 'crit')) / 100);
  h.def = valorHab(h, 'piel') + deObjetos(h, 'def') + h.extra.def;
  h.esquiva = valorHab(h, 'reflejos') / 100;
  h.botin = (h.base.monedas + valorHab(h, 'hucha') + deObjetos(h, 'monedas')) / 100;
  h.suerte = h.base.suerte + h.extra.suerte + deObjetos(h, 'suerte');
  if (antes !== undefined && h.vidaMax > antes) h.vida += h.vidaMax - antes;
  h.vida = Math.min(h.vida === undefined ? h.vidaMax : h.vida, h.vidaMax);
}

/* ---------- ayudas para los eventos (devuelven cuánto ha cambiado) ---------- */
function cura(h, n) { const a = h.vida; h.vida = Math.min(h.vidaMax, h.vida + Math.max(0, Math.round(n))); return h.vida - a; }
function dana(h, n) { const a = h.vida; h.vida = Math.max(1, h.vida - Math.round(n)); return a - h.vida; }
function extra(h, campo, n) { h.extra[campo] += n; recalcula(h); }
function ganaMonedas(h, n) { const v = Math.round(n * (1 + h.botin)); h.monedas += v; return v; }
// la hoguera: sube de nivel una habilidad al azar (o +5 de ataque si no se puede)
function afilar(h) {
  const ids = Object.keys(h.habs).filter(id => h.habs[id] < NIVEL_MAX_HAB);
  if (!ids.length) { extra(h, 'atq', 5); return { dice: '+5 de ataque.' }; }
  const id = ids[Math.floor(Math.random() * ids.length)];
  aplicaHabilidad(h, id);
  return { sube: id };
}
function aplicaHabilidad(h, id) { h.habs[id] = Math.min(NIVEL_MAX_HAB, (h.habs[id] || 0) + 1); recalcula(h); }
function equipa(h, id) { const viejo = h.objs[OBJETOS[id].tipo]; h.objs[OBJETOS[id].tipo] = id; recalcula(h); return viejo; }
const precioVenta = id => [8, 14, 24, 40, 70][ORDEN_RAREZA.indexOf(OBJETOS[id].rar)];

/* ---------- experiencia y niveles ---------- */
function subeNivel(h) {
  h.nivel++; h.base.atq += SUBIDA.atq; h.base.vida += SUBIDA.vida;
  recalcula(h);
  return cura(h, Math.round(h.vidaMax * (SUBIDA.cura + h.base.siesta / 100)));
}
// suma experiencia y devuelve cuántos niveles se suben (se aplican luego, uno a uno, con su elección)
function ganaXp(h, n) {
  h.xp += Math.round(n);
  let sube = 0, nv = h.nivel;
  while (h.xp >= xpPara(nv)) { h.xp -= xpPara(nv); nv++; sube++; }
  return sube;
}

/* ---------- qué sale (la suerte mueve el peso hacia las rarezas buenas) ---------- */
const pesoRar = (r, pesos, suerte) => (pesos[r] || 0) * (1 + (suerte / 100) * ORDEN_RAREZA.indexOf(r) * 0.7);
function sorteo(lista, peso) {
  const total = lista.reduce((s, x) => s + peso(x), 0);
  let r = Math.random() * total;
  for (const x of lista) { r -= peso(x); if (r <= 0) return x; }
  return lista[lista.length - 1];
}
const minimo = (rar, min) => ORDEN_RAREZA.indexOf(rar) >= ORDEN_RAREZA.indexOf(min || 'basic');
// tres habilidades distintas para elegir (las que ya tienes salen para subir de nivel)
function ofertas(h, cofre) {
  const pesos = cofre ? PESO_COFRE : PESO;
  let libres = Object.keys(HABILIDADES).filter(id => nivelHab(h, id) < NIVEL_MAX_HAB);
  const out = [];
  while (out.length < 3 && libres.length) {
    const buenas = libres.filter(id => pesos[HABILIDADES[id].rar]);
    const lista = buenas.length ? buenas : libres;
    const id = sorteo(lista, id => pesoRar(HABILIDADES[id].rar, buenas.length ? pesos : PESO, h.suerte) || 1);
    out.push(id); libres = libres.filter(x => x !== id);
  }
  return out;
}
function habilidadAzar(h, min) {
  let l = Object.keys(HABILIDADES).filter(id => nivelHab(h, id) < NIVEL_MAX_HAB && minimo(HABILIDADES[id].rar, min));
  if (!l.length) l = Object.keys(HABILIDADES).filter(id => nivelHab(h, id) < NIVEL_MAX_HAB);
  return l.length ? sorteo(l, id => pesoRar(HABILIDADES[id].rar, PESO, h.suerte) || 1) : null;
}
function objetoAzar(h, min) {
  const l = Object.keys(OBJETOS).filter(id => minimo(OBJETOS[id].rar, min) && !HUECOS.some(k => h.objs[k] === id));
  return sorteo(l.length ? l : Object.keys(OBJETOS), id => pesoRar(OBJETOS[id].rar, PESO, h.suerte) || 1);
}

/* ---------- enemigos: los normales crecen con el día y con el mundo ---------- */
function nuevoEnemigo(id, mundo, dia, elite) {
  const d = ENEMIGOS[id], M = MUNDOS[mundo];
  let vida = d.vida, atq = d.atq, monedas = d.monedas, xp = d.xp;
  if (!d.mini && !d.jefe) {
    vida *= M.fuerza * (1 + 0.05 * (dia - 1)); atq *= M.fuerza * (1 + 0.028 * (dia - 1));
    monedas *= (1 + 0.03 * dia) * (1 + mundo * 0.8); xp *= 1 + 0.02 * dia;
  } else monedas *= 1 + mundo * 0.5;
  if (elite) { vida *= 1.9; atq *= 1.3; monedas *= 2.5; xp *= 2; }
  vida = Math.round(vida);
  return { id, def: d, vida, vidaMax: vida, atq: Math.round(atq), monedas: Math.round(monedas), xp: Math.round(xp), elite: !!elite, jefe: !!d.jefe, mini: !!d.mini };
}

/* ---------- el combate, turno a turno ---------- */
// lo que pasa nada más empezar (cafeína, castor) y lo que queda preparado (escudo, huelga)
function empiezaCombate(h, c) {
  c.escudo = valorHab(h, 'carton'); c.huelga = valorHab(h, 'huelga'); c.primero = false;
  const acc = [];
  if (nivelHab(h, 'castor')) acc.push({ tipo: 'castor', dano: valorHab(h, 'castor') });
  if (nivelHab(h, 'cafeina')) acc.push({ tipo: 'cafeina', dano: valorHab(h, 'cafeina') });
  return acc;
}
// el turno del conejo (número n, desde 1): lista de golpes y curas en orden
function turnoHeroe(h, n, c, azar = Math.random) {
  const acc = [], var_ = () => 0.9 + azar() * 0.2;
  if (nivelHab(h, 'chaos') && n % 3 === 0) acc.push({ tipo: 'chaos', dano: Math.round(h.atq * valorHab(h, 'chaos')) });
  else {
    const crit = azar() < h.crit;
    let mult = crit ? 2 : 1, zorro = false;
    if (!c.primero && nivelHab(h, 'zorro')) { mult *= valorHab(h, 'zorro'); zorro = true; }
    c.primero = true;
    acc.push({ tipo: 'golpe', dano: Math.round(h.atq * var_() * mult), crit, zorro });
    if (nivelHab(h, 'rabia') && azar() < valorHab(h, 'rabia') / 100) acc.push({ tipo: 'rabia', dano: Math.round(h.atq * 0.8 * var_()) });
  }
  if (nivelHab(h, 'ardilla')) acc.push({ tipo: 'ardilla', dano: valorHab(h, 'ardilla') });
  if (nivelHab(h, 'bellotas') && n % 3 === 0) acc.push({ tipo: 'bellotas', danos: [1, 2, 3].map(() => valorHab(h, 'bellotas')) });
  if (nivelHab(h, 'basura') && n % 4 === 0) acc.push({ tipo: 'basura', dano: valorHab(h, 'basura') });
  if (nivelHab(h, 'meercat')) acc.push({ tipo: 'meercat', cura: valorHab(h, 'meercat') });
  return acc;
}
// el turno del enemigo (número n, desde 1)
function turnoEnemigo(h, e, n, c, azar = Math.random) {
  if (nivelHab(h, 'pulgas') && (n === 1 || azar() < valorHab(h, 'pulgas') / 100)) return { tipo: 'pulgas', dano: 0 };
  const especial = (e.jefe && n % 3 === 0) || (e.mini && n % 4 === 0);
  const bruto = Math.round(e.atq * (0.9 + azar() * 0.2) * (especial ? (e.jefe ? 1.8 : 1.6) : 1));
  const r = { tipo: especial ? 'especial' : 'golpe', dano: 0, bruto };
  if (c.huelga > 0) { c.huelga--; r.bloqueo = 'huelga'; return r; }
  if (azar() < h.esquiva) { r.bloqueo = 'esquiva'; return r; }
  let dano = Math.max(1, bruto - h.def);
  if (c.escudo > 0) { r.escudo = Math.min(c.escudo, dano); c.escudo -= r.escudo; dano -= r.escudo; }
  r.dano = dano;
  if (nivelHab(h, 'espinas')) r.espinas = Math.max(1, Math.round(bruto * valorHab(h, 'espinas') / 100));
  return r;
}
const curaBotiquin = (h, dano) => nivelHab(h, 'botiquin') ? Math.max(1, Math.round(dano * valorHab(h, 'botiquin') / 100)) : 0;
// si el conejo cae: primero la MechaVaca (una vez), luego el Contrato indefinido (una vez). Devuelve quién le salva o null
function salvacion(h) {
  if (nivelHab(h, 'mechavaca') && !h.mecha) { h.mecha = 1; h.vida = Math.round(h.vidaMax * valorHab(h, 'mechavaca') / 100); return 'mechavaca'; }
  if (h.contrato > 0) { h.contrato = 0; h.vida = Math.round(h.vidaMax / 2); return 'contrato'; }
  return null;
}

/* ---------- el plan de días de un mundo ---------- */
function planMundo(mundo) {
  const M = MUNDOS[mundo], plan = [];
  let ultimo = '';
  for (let d = 1; d <= M.dias; d++) {
    let t;
    if (d === 1) t = 'combate';
    else if (d === M.dias) t = 'jefe';
    else if (d === M.dias / 2) t = 'mini';
    else if (DIAS_FIJOS[d]) t = DIAS_FIJOS[d];
    else {
      const pesos = Object.assign({}, PESOS_DIA);
      if (d < 5) delete pesos.elite;
      if (d < 8) delete pesos.hoguera;
      if (ultimo !== 'combate' && ultimo !== 'elite') pesos.combate *= 1.6;
      if (ultimo && ultimo !== 'combate') delete pesos[ultimo];
      t = sorteo(Object.keys(pesos), k => pesos[k]);
    }
    plan.push(t); ultimo = t;
  }
  return plan;
}
const encuentrosDe = mundo => ENCUENTROS.filter(e => !e.m || e.m.includes(mundo));
