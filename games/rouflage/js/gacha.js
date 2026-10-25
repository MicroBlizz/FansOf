// Fans of Rouflage · EL GACHAPÓN DE ARMARIO (lógica): cápsulas que se pagan SOLO con Gotas (la moneda ganada jugando) y dan cosméticos. Las Acciones (la
// comprada) no entran aquí nunca: lo que tiene azar solo se paga con lo ganado (PLAN-MONEDAS.md, MONEDAS.azar). Sale todo lo del armario que no es gratis
// ni de otra fuente (de: 'tienda'; lo del Pack de inicio es de: 'inicio' y no sale): piezas, conjuntos y legendarias. Lo del pase (gratis y premium) NO sale mientras su pase siga abierto, para que sea
// exclusivo: cuando un pase se cierre, sus claves ('cat:id') se añaden a GACHA.liberados y entran. Lo de aquí también se compra suelto en el armario, con Gotas o Acciones (arPrecio, economia.js; las comunes y raras, con recargo).
// Una pieza repetida devuelve Gotas. Garantías: una rara o mejor cada GACHA.pityRara tiradas y una épica cada GACHA.pityEpica. Las cifras, aquí.
// Se guarda en SAVE.gacha = { total, sinRara, sinEpica }. La pantalla es gacha-pantalla.js. Va después de armario.js y economia.js.
// DOS MÁQUINAS (Daniel, 25-10-2026): ROPA (lo de siempre, sin lo de la casa) y CASA (la máquina de gancho: muebles, escenarios y colores, más barata,
// GACHA.casa por encima de lo demás). En la CASA, un mueble repetido no da Gotas: suma una unidad (muebles-unidades.js). Su pity va en SAVE.gachaCasa.
'use strict';

const GACHA = {
  precio: 150, precio10: 1350,                    // Gotas por 1 y por 10 cápsulas (unas 2 de las 150 Gotas máximas que se ganan al día)
  odds: { comun: 60, rara: 28, epica: 10, legend: 2 },         // % por rareza (si una rareza se queda sin piezas, su parte se reparte entre las demás)
  repetida: { comun: 20, rara: 100, epica: 400, legend: 750 },   // Gotas que devuelve una pieza repetida: 10 comunes = 1 cápsula (150 y se ajusta con la rara), épica = 2, legendaria = 5 (la rara, a medias: 100)
  pityRara: 10, pityEpica: 40, pityLegend: 90,      // y una legendaria asegurada cada 90 (desde el 23-10-2026; antes solo el 2 % puro)
  gratisHoras: 8,                                  // como en el Rumble (core/js/sistema/gachapon-gratis.js): una x1 gratis cada 8 horas, sin acumular, y una x10 cada domingo (hora de Madrid)
  liberados: [],                                   // piezas de pases ya cerrados ('cat:id'): desde entonces salen en el gachapón
  casa: { precio: 100, precio10: 900 },            // la máquina CASA: más barata; probabilidades, garantías y Gotas por repetido, como la de ropa
};
const GACHA_CASA_CATS = ['muebles', 'escenarios', 'colores'];      // lo que sale en la CASA y no en la de ropa
const gachaEsCasa = catId => GACHA_CASA_CATS.includes(catId);
const gachaCfg = (maq = 'ropa') => (maq === 'casa' ? Object.assign({}, GACHA, GACHA.casa) : GACHA);

// el estado de una máquina (la de ropa lleva además las tiradas gratis)
function gachaEstado(maq = 'ropa') {
  if (maq === 'casa') { if (!SAVE.gachaCasa) SAVE.gachaCasa = { total: 0, sinRara: 0, sinEpica: 0, sinLegend: 0 }; return SAVE.gachaCasa; }
  if (!SAVE.gacha) SAVE.gacha = { total: 0, sinRara: 0, sinEpica: 0, sinLegend: 0 };
  if (typeof SAVE.gacha.sinLegend !== 'number') SAVE.gacha.sinLegend = 0;
  if (typeof SAVE.gacha.gratisT !== 'number') SAVE.gacha.gratisT = 0;
  if (typeof SAVE.gotas !== 'number') SAVE.gotas = 0;
  return SAVE.gacha;
}
// las piezas que pueden salir, por rareza: { comun: [{ cat, it }], rara: […], epica: […] }
function gachaPool(maq = 'ropa') {
  const pool = {};
  for (const r in GACHA.odds) pool[r] = [];
  for (const c of CATALOGO_AR) {
    if (gachaEsCasa(c.id) !== (maq === 'casa')) continue;      // cada máquina, lo suyo
    for (const it of c.items) if ((it.de === 'tienda' || GACHA.liberados.includes(c.id + ':' + it.id)) && pool[it.r] && !it.sg) pool[it.r].push({ cat: c.id, it });      // sg: no sale (los tamaños del lienzo)
  }
  return pool;
}
// % real de cada rareza, ya repartido entre las que tienen piezas (sin contar las garantías)
function gachaOdds(pool, maq) {
  const od = gachaCfg(maq).odds, vivas = Object.keys(od).filter(r => pool[r] && pool[r].length), t = vivas.reduce((s, r) => s + od[r], 0), o = {};
  for (const r of vivas) o[r] = od[r] * 100 / t;
  return o;
}
function gachaRareza(g, pool, maq) {
  g.sinRara++; g.sinEpica++; g.sinLegend++;
  const o = gachaOdds(pool, maq), C = gachaCfg(maq);
  let r;
  if (o.legend && g.sinLegend >= C.pityLegend) r = 'legend';
  else if (o.epica && g.sinEpica >= C.pityEpica) r = 'epica';
  else if (g.sinRara >= C.pityRara && (o.rara || o.epica)) r = !o.rara || (o.epica && Math.random() < o.epica / (o.epica + o.rara)) ? 'epica' : 'rara';
  else { let x = Math.random() * 100; r = 'comun'; for (const k of ['legend', 'epica', 'rara', 'comun']) { if (!o[k]) continue; if (x < o[k]) { r = k; break; } x -= o[k]; } if (!o[r]) r = Object.keys(o)[0]; }
  if (r !== 'comun') g.sinRara = 0;
  if (r === 'epica') g.sinEpica = 0;
  if (r === 'legend') { g.sinLegend = 0; g.sinEpica = 0; }
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
const gachaCoste = (n, maq) => { const C = gachaCfg(maq); return n === 10 ? C.precio10 : n * C.precio; };
// tira n cápsulas (1 o 10). Devuelve [{ cat, it, nuevo, devuelve }] o null si faltan Gotas. Primero pregunta a MONEDAS.azar y luego cobra.
// gratis: 'x1' o 'x10' (la tirada gratis: no cobra nada y solo si ya toca; se apunta la hora o el domingo)
function gachaTira(n, gratis, maq = 'ropa') {
  if (maq === 'casa') gratis = null;      // la CASA no tiene tiradas gratis
  const g = gachaEstado(maq), gr = gachaEstado(), pool = gachaPool(maq), coste = gratis ? 0 : gachaCoste(n, maq), C = gachaCfg(maq);
  if (gratis === 'x1' ? gachaFalta1() > 0 : gratis === 'x10' ? !gachaX10().listo : SAVE.gotas < coste) return null;
  if (!gratis && typeof MONEDAS !== 'undefined' && !MONEDAS.azar('gachapón de armario', { ganada: coste })) return null;
  if (gratis === 'x1') gr.gratisT = Date.now(); else if (gratis === 'x10') gr.gratisD = gachaMadrid().fecha; else SAVE.gotas -= coste;
  const a = armarioEstado(), sale = [];
  for (let i = 0; i < n; i++) {
    const r = gachaRareza(g, pool, maq), lista = pool[r], x = lista[Math.floor(Math.random() * lista.length)];
    const nuevo = !arTiene(x.cat, x.it), unidad = !nuevo && maq === 'casa' && x.cat === 'muebles';      // un mueble repetido de la CASA: una unidad más
    const devuelve = nuevo || unidad ? 0 : C.repetida[r];
    let unidades;
    if (nuevo) a.tengo.push(x.cat + ':' + x.it.id); else if (unidad) unidades = muebleSumaUnidad(x.it.id); else SAVE.gotas += devuelve;
    g.total++; sale.push({ cat: x.cat, it: x.it, nuevo, devuelve, unidades });
  }
  guardaPartida();
  return sale;
}
// cuántas piezas del gachapón ya tienes: [tengo, hay]
function gachaCuenta(maq) {
  const pool = gachaPool(maq); let t = 0, n = 0;
  for (const r in pool) for (const x of pool[r]) { n++; if (arTiene(x.cat, x.it)) t++; }
  return [t, n];
}
// las tablas de probabilidades que se enseñan: { rareza: [[rareza, %]], piezas: { rareza: [[nombre, %]] } }
function gachaProbs(maq) {
  const pool = gachaPool(maq), o = gachaOdds(pool, maq), piezas = {};
  for (const r in o) piezas[r] = pool[r].map(x => [x.it.n, o[r] / pool[r].length]);
  return { rareza: Object.keys(o).map(r => [r, o[r]]), piezas };
}
