// Fans of Pop · RANKING MUNDIAL (31-10-2026, Daniel: «el mejor del mundo al Memoria, al modo normal, difícil…»), con el servidor
// (servidor/104-pop-ranking-y-rival.sql). Cuatro clasificaciones: la mejor ronda de MEMORIA, las ESTRELLAS del camino normal, las del
// DIFÍCIL y los DUELOS ganados (contra el CEO, los rivales del camino y la gente). Se suben solas (ppSubeMarcas) al acabar algo que
// pueda mejorarlas y al arrancar, con la cuenta de core (también la de invitado, sin pedir nada). En el ranking solo sale tu apodo.
'use strict';
const PP_RANK = { tab: 'estrellas', datos: {}, subiendo: false };
const ppHayRanking = () => typeof CUENTA !== 'undefined' && CUENTA.activa;
// tus marcas de ahora: las estrellas salen de tu récord por nivel (SAVE.mejor: 'd' delante = difícil)
function ppMisMarcas() {
  let est = 0, dif = 0;
  for (const k in SAVE.mejor || {}) { if (k[0] === 'd' || k[0] === 'p') dif += SAVE.mejor[k]; else est += SAVE.mejor[k]; }   // pesadilla cuenta en «Difícil»
  const duelos = (SAVE.duelo ? SAVE.duelo.gan : 0) + (SAVE.pvp ? SAVE.pvp.gan : 0) + (SAVE.dueloNivel || 0);
  return { memoria: (SAVE.memoria && SAVE.memoria.record) || 0, estrellas: est, dificil: dif, duelos };
}
function ppSubeMarcas() {
  if (!ppHayRanking() || PP_RANK.subiendo) return;
  const m = ppMisMarcas(), clave = JSON.stringify(m);
  if (clave === SAVE.marcasSubidas || !(m.memoria || m.estrellas || m.dificil || m.duelos)) return;
  PP_RANK.subiendo = true;
  CUENTA.rpc('pop_marca', { p_memoria: m.memoria, p_estrellas: m.estrellas, p_dificil: m.dificil, p_duelos: m.duelos })
    .then(() => { SAVE.marcasSubidas = clave; ppGuarda(); PP_RANK.datos = {}; })
    .catch(e => { if (/marca_imposible/.test(String(e && (e.message || e)))) { SAVE.marcasSubidas = clave; ppGuarda(); } })
    .finally(() => { PP_RANK.subiendo = false; });
}
window.addEventListener('online', () => setTimeout(ppSubeMarcas, 1500));
const PP_RANK_TABS = [['estrellas', 'Estrellas'], ['dificil', 'Difícil'], ['memoria', 'Memoria'], ['duelos', 'Duelos']];
function ppVentanaRanking(tab) {
  if (tab) PP_RANK.tab = tab;
  ppSubeMarcas();
  const t = ppAbre(`<h2>${tr('Ranking mundial')}</h2>`, true);
  const tabs = document.createElement('div'); tabs.className = 'pp-tabs';
  for (const [k, txt] of PP_RANK_TABS) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-tab' + (PP_RANK.tab === k ? ' pp-on' : ''); b.textContent = tr(txt);
    b.onclick = () => { play('select'); ppVentanaRanking(k); }; tabs.appendChild(b);
  }
  t.appendChild(tabs);
  const caja = document.createElement('div'); caja.className = 'pp-ranking'; t.appendChild(caja);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', ppCierra));
  const unidad = { estrellas: tr('estrellas'), dificil: tr('estrellas'), memoria: tr('rondas'), duelos: tr('victorias') }[PP_RANK.tab];
  const pinta = d => {
    if (!caja.isConnected) return;
    if (!d.lista.length) { caja.innerHTML = `<p class="pp-sub">${tr('Todavía no hay nadie: ¡sé la primera!')}</p>`; return; }
    const fila = f => `<div class="pp-rfila${f.yo ? ' pp-yo' : ''}"><i class="pp-p${Math.min(4, f.puesto)}">${f.puesto}</i><span>${ppEsc(f.nombre || '')}</span><b>${Number(f.puntos).toLocaleString()}</b></div>`;
    caja.innerHTML = d.lista.map(fila).join('') + (d.yo && d.yo.puesto > 50 ? `<div class="pp-rpuntos">…</div>${fila(d.yo)}` : '')
      + `<p class="pp-sub"><small>${d.yo ? '' : tr('Juega para salir aquí.') + ' '}${tr('{n} jugadoras · en {u}', { n: d.total, u: unidad })}</small></p>`;
  };
  if (!ppHayRanking()) { caja.innerHTML = `<p class="pp-sub">${tr('El ranking necesita conexión.')}</p>`; return; }
  const k = PP_RANK.tab;
  if (PP_RANK.datos[k]) { pinta(PP_RANK.datos[k]); return; }
  caja.innerHTML = `<p class="pp-sub">${tr('Cargando…')}</p>`;
  CUENTA.rpc('pop_ranking', { p_tabla: k })
    .then(d => { PP_RANK.datos[k] = d || { lista: [], yo: null, total: 0 }; if (PP_RANK.tab === k) pinta(PP_RANK.datos[k]); })
    .catch(() => { if (caja.isConnected) caja.innerHTML = `<p class="pp-sub">${tr('No se ha podido cargar. Prueba otra vez en un rato.')}</p>`; });
}
const ppEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
