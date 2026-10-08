// Fans Of · PROBABILIDADES: la sección de la tienda con las tablas de porcentajes del gashapón (rareza, cada objeto y la calidad).
// Se calcula con las mismas cifras que usan el gashapón y el servidor (ECON.odds, los catálogos y QTIERS), así que no hay números escritos a mano.
// Una máquina propia de un juego sale aquí si en MAQUINAS tiene probs() -> { nombre, rareza: [[rareza, %]], lista: { rareza: [[nombre, %]] }, nota }.
'use strict';
const pct = v => fmtV(String(Math.round(v * 100) / 100)) + ' %';
function probsMaquina(kind) {
  const DB = kind === 'ab' ? ABILITIES : ITEMS, O = ECON.odds, lista = {};
  for (const r of ['legendary', 'epic', 'rare', 'common', 'basic']) {
    const ok = k => DB[k].rar === r && !DB[k].pass, ids = Object.keys(DB);
    const general = ids.filter(k => ok(k) && (kind === 'ab' || !DB[k].fac)), fp = kind === 'eq' ? ids.filter(k => ok(k) && DB[k].fac && isUnlocked(DB[k].fac)) : [];
    const gp = fp.length ? 0.5 : 1;   // en el equipo, la mitad de las veces sale uno de una facción que ya tienes
    lista[r] = general.map(k => [DB[k].name, O[r] * gp / general.length]).concat(fp.map(k => [DB[k].name, O[r] * 0.5 / fp.length]));
  }
  return { nombre: kind === 'ab' ? 'HABILIDADES' : 'OBJETOS DE EQUIPO', rareza: ['legendary', 'epic', 'rare', 'common', 'basic'].filter(r => O[r]).map(r => [r, O[r]]), lista,
    nota: kind === 'eq' ? 'En el equipo, la mitad de las veces sale un objeto de una facción que ya tienes (si tienes alguna) y la otra mitad uno general.' : '' };
}
function probsHtml() {
  const maqs = [probsMaquina('ab'), probsMaquina('eq')].concat(Object.values(MAQUINAS).filter(m => m.probs).map(m => m.probs()));
  const rn = r => RARITY[r] ? RARITY[r][0] : r, tabla = (cab, filas) => `<table class="probs-t"><tr><th>${cab[0]}</th><th>${cab[1]}</th></tr>${filas.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('')}</table>`;
  const una = m => `<h4 class="ol">${m.nombre}</h4>${tabla(['Rareza', 'Probabilidad'], m.rareza.map(([r, p]) => [rn(r), pct(p)]))}`
    + Object.keys(m.lista).filter(r => m.lista[r].length).map(r => `<details class="probs-sub"><summary>${rn(r)}: cada objeto</summary>${tabla(['Objeto', 'Probabilidad'], m.lista[r].map(([n, p]) => [n, pct(p)]))}</details>`).join('')
    + (m.nota ? `<p class="small-print">${m.nota}</p>` : '');
  return `<details class="probs"><summary class="ol">PROBABILIDADES DEL GASHAPÓN</summary><div class="probs-body">`
    + `<p class="small-print">Son las probabilidades reales de cada tirada, sin contar las garantías. Las calcula el servidor con las mismas cifras que se enseñan aquí. Comprar gemas o oro no cambia ninguna.</p>`
    + maqs.map(una).join('')
    + `<h4 class="ol">CALIDAD DE CADA COPIA</h4>${tabla(['Calidad', 'Probabilidad'], QTIERS.map(t => [t.name, pct(t.p)]))}`
    + `<p class="small-print">Garantías: una épica o mejor como mucho cada ${ECON.pityEpic} tiradas, una legendaria a las ${ECON.pityLeg} y una copia de calidad Director (excelente) o mejor como mucho cada ${ECON.pityQ}. Cada bloque de 10 tiradas trae al menos una épica.</p>`
    + `</div></details>`;
}
