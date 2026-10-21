// Fans of Rouflage · EL GACHAPÓN DE ARMARIO (lógica): cápsulas que se pagan SOLO con Gotas (la moneda ganada jugando) y dan cosméticos. Las Acciones (la
// comprada) no entran aquí nunca: lo que tiene azar solo se paga con lo ganado (PLAN-MONEDAS.md, MONEDAS.azar). Sale todo lo del armario que no es gratis
// ni de otra fuente (de: 'tienda'; lo del Pack de inicio es de: 'inicio' y no sale): piezas, conjuntos y legendarias. Lo del pase (gratis y premium) NO sale mientras su pase siga abierto, para que sea
// exclusivo: cuando un pase se cierre, sus claves ('cat:id') se añaden a GACHA.liberados y entran. Lo de aquí también se compra suelto en el armario, con Gotas o Acciones (arPrecio, economia.js; las comunes y raras, con recargo).
// Una pieza repetida devuelve Gotas. Garantías: una rara o mejor cada GACHA.pityRara tiradas y una épica cada GACHA.pityEpica. Las cifras, aquí.
// Se guarda en SAVE.gacha = { total, sinRara, sinEpica }. La pantalla es gacha-pantalla.js. Va después de armario.js y economia.js.
'use strict';

const GACHA = {
  precio: 150, precio10: 1350,                    // Gotas por 1 y por 10 cápsulas (unas 2 de las 150 Gotas máximas que se ganan al día)
  odds: { comun: 60, rara: 28, epica: 10, legend: 2 },         // % por rareza (si una rareza se queda sin piezas, su parte se reparte entre las demás)
  repetida: { comun: 20, rara: 100, epica: 400, legend: 750 },   // Gotas que devuelve una pieza repetida: 10 comunes = 1 cápsula (150 y se ajusta con la rara), épica = 2, legendaria = 5 (la rara, a medias: 100)
  pityRara: 10, pityEpica: 40,
  gratisHoras: 8,                                  // como en el Rumble (core/js/sistema/gachapon-gratis.js): una x1 gratis cada 8 horas, sin acumular, y una x10 cada domingo (hora de Madrid)
  liberados: [],                                   // piezas de pases ya cerrados ('cat:id'): desde entonces salen en el gachapón
};

function gachaEstado() {
  if (!SAVE.gacha) SAVE.gacha = { total: 0, sinRara: 0, sinEpica: 0 };
  if (typeof SAVE.gacha.gratisT !== 'number') SAVE.gacha.gratisT = 0;
  if (typeof SAVE.gotas !== 'number') SAVE.gotas = 0;
  return SAVE.gacha;
}
// las piezas que pueden salir, por rareza: { comun: [{ cat, it }], rara: […], epica: […] }
function gachaPool() {
  const pool = {};
  for (const r in GACHA.odds) pool[r] = [];
  for (const c of CATALOGO_AR) {
    for (const it of c.items) if ((it.de === 'tienda' || GACHA.liberados.includes(c.id + ':' + it.id)) && pool[it.r]) pool[it.r].push({ cat: c.id, it });
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
  else { let x = Math.random() * 100; r = 'comun'; for (const k of ['legend', 'epica', 'rara', 'comun']) { if (!o[k]) continue; if (x < o[k]) { r = k; break; } x -= o[k]; } if (!o[r]) r = Object.keys(o)[0]; }
  if (r !== 'comun') g.sinRara = 0;
  if (r === 'epica') g.sinEpica = 0;
  return r;
}
// las tiradas gratis, como en el Rumble: una x1 cada GACHA.gratisHoras (SAVE.gacha.gratisT = la hora de la última) y una x10 cada domingo, hora de Madrid
// (SAVE.gacha.gratisD = el día en que se cobró). Ninguna se acumula: la x10 caduca al acabar el domingo.
const gachaMadrid = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { fecha: p.year + '-' + p.month + '-' + p.day, dom: p.weekday === 'Sun', dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), pasado: ((+p.hour % 24) * 3600 + +p.minute * 60 + +p.second) * 1000 };
};
const gachaFalta1 = () => gachaEstado().gratisT + GACHA.gratisHoras * 3600000 - (Date.now() + RFS.desfase());   // ms para la x1 (≤ 0: lista)
function gachaX10() {   // { listo, falta }: lista hasta que acabe el domingo; si no, falta hasta el próximo
  const m = gachaMadrid(), listo = m.dom && gachaEstado().gratisD !== m.fecha;
  return { listo, falta: listo ? 86400000 - m.pasado : ((m.dom ? 7 : 7 - m.dow) * 86400000) - m.pasado };
}
const gachaCoste = n => (n === 10 ? GACHA.precio10 : n * GACHA.precio);
// tira n cápsulas (1 o 10). Devuelve [{ cat, it, nuevo, devuelve }] o null si faltan Gotas. Primero pregunta a MONEDAS.azar y luego cobra.
// gratis: 'x1' o 'x10' (la tirada gratis: no cobra nada y solo si ya toca; se apunta la hora o el domingo)
function gachaTira(n, gratis) {
  const g = gachaEstado(), pool = gachaPool(), coste = gratis ? 0 : gachaCoste(n);
  if (gratis === 'x1' ? gachaFalta1() > 0 : gratis === 'x10' ? !gachaX10().listo : SAVE.gotas < coste) return null;
  if (!gratis && typeof MONEDAS !== 'undefined' && !MONEDAS.azar('gachapón de armario', { ganada: coste })) return null;
  if (gratis === 'x1') g.gratisT = Date.now(); else if (gratis === 'x10') g.gratisD = gachaMadrid().fecha; else SAVE.gotas -= coste;
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
