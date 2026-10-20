// Fans of Rouflage · EL GACHAPÓN DE ARMARIO (lógica): cápsulas que se pagan SOLO con Gotas (la moneda ganada jugando) y dan cosméticos. Las Acciones (la
// comprada) no entran aquí nunca: lo que tiene azar solo se paga con lo ganado (PLAN-MONEDAS.md, MONEDAS.azar). Los conjuntos enteros y las legendarias
// no salen de las cápsulas: se quedan como ofertas de la tienda, en Acciones. Todo lo demás de la tienda del armario (piezas sueltas, mascotas…) sí.
// Una pieza repetida devuelve Gotas. Garantías: una rara o mejor cada GACHA.pityRara tiradas y una épica cada GACHA.pityEpica. Las cifras, aquí.
// Se guarda en SAVE.gacha = { total, sinRara, sinEpica }. La pantalla es gacha-pantalla.js. Va después de armario.js y economia.js.
'use strict';

const GACHA = {
  precio: 200, precio10: 1800,                    // Gotas por 1 y por 10 cápsulas (unas 2 de las 150 Gotas máximas que se ganan al día)
  odds: { comun: 62, rara: 30, epica: 8 },         // % por rareza (si una rareza se queda sin piezas, su parte se reparte entre las demás)
  repetida: { comun: 30, rara: 80, epica: 160 },   // Gotas que devuelve una pieza que ya tienes
  pityRara: 10, pityEpica: 40,
};

function gachaEstado() {
  if (!SAVE.gacha) SAVE.gacha = { total: 0, sinRara: 0, sinEpica: 0 };
  if (typeof SAVE.gotas !== 'number') SAVE.gotas = 0;
  return SAVE.gacha;
}
// las piezas que pueden salir, por rareza: { comun: [{ cat, it }], rara: […], epica: […] }
function gachaPool() {
  const pool = {};
  for (const r in GACHA.odds) pool[r] = [];
  for (const c of CATALOGO_AR) {
    if (c.conjuntos) continue;
    for (const it of c.items) if (it.de === 'tienda' && pool[it.r]) pool[it.r].push({ cat: c.id, it });
  }
  return pool;
}
// % real de cada rareza, ya repartido entre las que tienen piezas (sin contar las garantías)
function gachaOdds(pool) {
  const vivas = Object.keys(GACHA.odds).filter(r => pool[r].length), t = vivas.reduce((s, r) => s + GACHA.odds[r], 0), o = {};
  for (const r of vivas) o[r] = GACHA.odds[r] * 100 / t;
  return o;
}
function gachaRareza(g, pool) {
  g.sinRara++; g.sinEpica++;
  const o = gachaOdds(pool);
  let r;
  if (o.epica && g.sinEpica >= GACHA.pityEpica) r = 'epica';
  else if (g.sinRara >= GACHA.pityRara && (o.rara || o.epica)) r = !o.rara || (o.epica && Math.random() < o.epica / (o.epica + o.rara)) ? 'epica' : 'rara';
  else { let x = Math.random() * 100; r = 'comun'; for (const k of ['epica', 'rara', 'comun']) { if (!o[k]) continue; if (x < o[k]) { r = k; break; } x -= o[k]; } if (!o[r]) r = Object.keys(o)[0]; }
  if (r !== 'comun') g.sinRara = 0;
  if (r === 'epica') g.sinEpica = 0;
  return r;
}
const gachaCoste = n => (n === 10 ? GACHA.precio10 : n * GACHA.precio);
// tira n cápsulas (1 o 10). Devuelve [{ cat, it, nuevo, devuelve }] o null si faltan Gotas. Primero pregunta a MONEDAS.azar y luego cobra
function gachaTira(n) {
  const g = gachaEstado(), pool = gachaPool(), coste = gachaCoste(n);
  if (SAVE.gotas < coste) return null;
  if (typeof MONEDAS !== 'undefined' && !MONEDAS.azar('gachapón de armario', { ganada: coste })) return null;
  SAVE.gotas -= coste;
  const a = armarioEstado(), sale = [];
  for (let i = 0; i < n; i++) {
    const r = gachaRareza(g, pool), lista = pool[r], x = lista[Math.floor(Math.random() * lista.length)];
    const nuevo = !arTiene(x.cat, x.it), devuelve = nuevo ? 0 : GACHA.repetida[r];
    if (nuevo) a.tengo.push(x.cat + ':' + x.it.id); else SAVE.gotas += devuelve;
    g.total++; sale.push({ cat: x.cat, it: x.it, nuevo, devuelve });
  }
  guardaPartida();
  return sale;
}
// cuántas piezas del gachapón ya tienes: [tengo, hay]
function gachaCuenta() {
  const pool = gachaPool(); let t = 0, n = 0;
  for (const r in pool) for (const x of pool[r]) { n++; if (arTiene(x.cat, x.it)) t++; }
  return [t, n];
}
// las tablas de probabilidades que se enseñan: { rareza: [[rareza, %]], piezas: { rareza: [[nombre, %]] } }
function gachaProbs() {
  const pool = gachaPool(), o = gachaOdds(pool), piezas = {};
  for (const r in o) piezas[r] = pool[r].map(x => [x.it.n, o[r] / pool[r].length]);
  return { rareza: Object.keys(o).map(r => [r, o[r]]), piezas };
}
