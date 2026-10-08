// Fans Of · PROGRESO: la economía, el catálogo de cada juego, las calidades, la tienda y la partida guardada.
//
// Cada juego dice, ANTES de que se cargue lo común (en su js/ajustes.js):
//   AJUSTES.guardado   el nombre de su partida guardada (cada juego tiene la suya: nunca se comparten)
//   AJUSTES.econ       los números de economía que cambia o añade respecto a los de aquí
// y DESPUÉS, en su código:
//   ABILITIES = catalogo('ab', {…}) e ITEMS = catalogo('eq', {…})   qué hace cada habilidad y objeto en ese juego
//   newSave() y migrateSave(partida, original)                       cómo es una partida nueva y cómo se pone al día una antigua
//   SAVE = loadSave()                                                 cuando ya tiene todo lo anterior
'use strict';
/* ---------- economía: los números comunes; AJUSTES.econ los cambia o añade otros ---------- */
const ECON = Object.assign({
  lvlStep: 0.06, maxLvl: 10,                                                     // +6 % de vida y daño por nivel
  xpNeed:   [0, 50, 100, 175, 300, 500, 800, 1300, 2000, 3200],                  // XP para pasar del nivel i al i+1
  goldCost: [0, 50, 100, 200, 400, 750, 1500, 3000, 6000, 12000],                // oro para pasar del nivel i al i+1
  xpPerPlay: 10, winXpMult: 1.3,                                                 // XP por cada carta jugada; +30 % si ganas
  camp: { first: [100, 10], replay: 30, stars3: [50, 10], boss: [300, 50], lose: 10 },  // [oro, gemas]
  pull: 50,                                                                      // gemas por tirada
  odds: { basic: 30, common: 25, rare: 30, epic: 12, legendary: 3 },            // probabilidades del gashapón (%) · v0.9.63: el 55 % de antes se reparte entre Común y Poco común
  pityEpic: 10, pityLeg: 50,                                                     // garantía: épica o mejor cada 10, legendaria a las 50
  start: { gold: 150, gems: 100 },
  scrap: { basic: 15, common: 25, rare: 60, epic: 150, legendary: 400 },      // oro al despedir una copia (x1 Básica, x1,5 Normal, x2 Buena, x3 Excelente, x5 Perfecta)
  reroll: { basic: 150, common: 250, rare: 500, epic: 1000, legendary: 2000 }, // oro por volver a tirar los números de una copia
  pityQ: 10,                                                       // garantía: calidad Director (excelente) o mejor como mucho cada 10 tiradas
}, AJUSTES.econ);

/* ---------- catálogo: lo que un juego usa de la serie, con lo que hace en él ---------- */
// efectos: { id: { desc: 'texto con {0}, {1}… (o {v})', st: [valores centrales] o vals: [flojo, central, fuerte], … } }
// Se puede cambiar cualquier dato de la serie para ese juego (por ejemplo, rar). El orden es el de `efectos`.
function catalogo(tipo, efectos) { const out = {}; for (const id in efectos) out[id] = Object.assign({}, CATALOGO[tipo][id], efectos[id]); return out; }
const fitsFac = (id, f) => !ITEMS[id] || !ITEMS[id].fac || ITEMS[id].fac === f;
const defOf = it => (it.k === 'ab' ? ABILITIES : ITEMS)[it.id];
/* ---------- calidades: cada copia tiene la suya ---------- */
function rollQ(minTier) {
  const pool = QTIERS.slice(minTier || 0); let x = Math.random() * pool.reduce((a, t) => a + t.p, 0);
  for (const t of pool) { if (x < t.p) return Math.floor((t.lo + Math.random() * (t.hi - t.lo)) * 1000) / 1000; x -= t.p; }
  return 1;
}
const tierOf = q => (q >= 1 ? 4 : q >= 0.88 ? 3 : q >= 0.7 ? 2 : q >= 0.4 ? 1 : 0);
const avgQ = it => it.q.reduce((a, b) => a + b, 0) / it.q.length;
// los efectos de una copia: su valor central (c) y con cuántos decimales se enseña (dec; los valores pequeños, con más)
const statsOf = it => { const D = defOf(it); return (D.st || [D.vals[1]]).map(c => ({ c, dec: D.dec != null ? D.dec : c < 5 ? 2 : 1 })); };
const rnd = (v, dec) => { const m = Math.pow(10, dec); return Math.round(v * m) / m; };
const valsOf = it => statsOf(it).map((st, i) => rnd(st.c * (0.5 + (it.q[i] == null ? 0.5 : it.q[i])), st.dec));

/* ---------- tienda (de prueba: nada se cobra; los precios son orientativos) ---------- */
const SHOP = {
  gold: [
    { id: 'g1', name: 'Puñado de oro', amt: 1000, eur: 0.99, note: 'Para ir tirando.' },
    { id: 'g2', name: 'Saco de oro', amt: 6000, eur: 4.99, note: 'El CEO te lo agradece personalmente (no).' },
    { id: 'g3', name: 'Cofre de oro', amt: 13000, eur: 9.99, note: 'Huele a los millones de Microblizz.' },
    { id: 'g4', name: 'Cámara acorazada', amt: 28000, eur: 19.99, note: 'Incluye la llave. La puerta no.' },
    { id: 'g5', name: 'Bóveda del CEO', amt: 75000, eur: 49.99, note: 'Para subir cartas al 10 sin mirar el precio.' },
  ],
  gems: [
    { id: 'e1', name: 'Bolsita de gemas', amt: 100, eur: 0.99, note: 'Dos tiradas del gashapón.' },
    { id: 'e2', name: 'Puñado de gemas', amt: 550, eur: 4.99, note: 'Brillan más que el futuro de Microblizz.' },
    { id: 'e3', name: 'Saco de gemas', amt: 1200, eur: 9.99, note: '' },
    { id: 'e4', name: 'Cofre de gemas', amt: 2600, eur: 19.99, note: '' },
    { id: 'e5', name: 'Caja fuerte de gemas', amt: 7000, eur: 49.99, note: 'Ni el becario sabe la combinación.' },
  ],
  joke: { name: 'Paquete Millonario', amt: 1000000, was: 500, eur: 100 },
  gift: { gold: 100, gems: 5 },
};

/* ---------- la partida guardada: en el navegador, una por juego ---------- */
const SAVE_KEY = AJUSTES.guardado;
let SAVE = null;
function loadSave() {
  try { const t = localStorage.getItem(SAVE_KEY); if (t) { const o = JSON.parse(t); if (o && o.v === 1) return migrateSave(Object.assign(newSave(), o), o); } } catch (e) { /* sin almacenamiento */ }
  return newSave();
}
function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: el progreso vive en memoria */ }
  if (typeof CUENTA !== 'undefined') CUENTA.cambio();   // y, un rato después, a la nube (core/js/sistema/cuenta.js)
}
const uSave = k => (SAVE.units[k] || (SAVE.units[k] = { lvl: 1, xp: 0 }));   // el nivel y la experiencia de una carta
const invGet = uid => (uid ? SAVE.inv.find(it => it.u === uid) : null);      // una copia del inventario
