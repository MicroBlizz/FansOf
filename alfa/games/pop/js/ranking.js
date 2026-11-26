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
  if (!ppHayRanking()) return;
  PP_COMBO.sube();   // los puntos de combo de la semana van aparte (js/combos.js, tarea 396)
  if (PP_RANK.subiendo) return;
  const m = ppMisMarcas(), clave = JSON.stringify(m);
  if (clave === SAVE.marcasSubidas || !(m.memoria || m.estrellas || m.dificil || m.duelos)) return;
  PP_RANK.subiendo = true;
  CUENTA.rpc('pop_marca', { p_memoria: m.memoria, p_estrellas: m.estrellas, p_dificil: m.dificil, p_duelos: m.duelos })
    .then(() => { SAVE.marcasSubidas = clave; ppGuarda(); PP_RANK.datos = {}; })
    .catch(e => { if (/marca_imposible/.test(String(e && (e.message || e)))) { SAVE.marcasSubidas = clave; ppGuarda(); } })
    .finally(() => { PP_RANK.subiendo = false; });
}
window.addEventListener('online', () => setTimeout(ppSubeMarcas, 1500));
// con el reto del día (js/reto-dia.js, tarea 367) va primero la pestaña «Hoy»: el ranking del reto de hoy; con los combos (js/combos.js,
// tarea 396), la pestaña «Combos»: los puntos de combo de esta semana
const PP_RANK_TABS = [['estrellas', 'Estrellas'], ['dificil', 'Difícil'], ['memoria', 'Memoria'], ['duelos', 'Duelos']];
const ppRankTabs = () => [...(PP_RETO.activo() ? [['hoy', 'Hoy']] : []), ['combos', 'Combos'], ...PP_RANK_TABS];
function ppVentanaRanking(tab) {
  if (tab) PP_RANK.tab = tab;
  if (!ppRankTabs().some(([k]) => k === PP_RANK.tab)) PP_RANK.tab = 'estrellas';
  ppSubeMarcas();
  const t = ppAbre(`<h2>${tr('Ranking mundial')}</h2>`, true);
  const tabs = document.createElement('div'); tabs.className = 'pp-tabs';
  for (const [k, txt] of ppRankTabs()) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pp-tab' + (PP_RANK.tab === k ? ' pp-on' : ''); b.textContent = tr(txt);
    b.onclick = () => { play('select'); ppVentanaRanking(k); }; tabs.appendChild(b);
  }
  t.appendChild(tabs);
  const caja = document.createElement('div'); caja.className = 'pp-ranking'; t.appendChild(caja);
  ppBotonVolver(t, ppCierra, { color: 'naranja' });
  const unidad = { estrellas: tr('estrellas'), dificil: tr('estrellas'), memoria: tr('rondas'), hoy: tr('rondas'), combos: tr('puntos'), duelos: tr('victorias') }[PP_RANK.tab];
  const pinta = d => {
    if (!caja.isConnected) return;
    if (!d.lista.length) { caja.innerHTML = `<p class="pp-sub">${tr('Todavía no hay nadie: ¡abre tú el ranking!')}</p>`; return; }
    const fila = f => `<div class="pp-rfila${f.yo ? ' pp-yo' : ''}"><i class="pp-p${Math.min(4, f.puesto)}">${f.puesto}</i><span>${ppEsc(f.nombre || '')}</span><b>${Number(f.puntos).toLocaleString()}</b></div>`;
    caja.innerHTML = d.lista.map(fila).join('') + (d.yo && d.yo.puesto > 50 ? `<div class="pp-rpuntos">…</div>${fila(d.yo)}` : '')
      + `<p class="pp-sub"><small>${d.yo ? '' : tr('Juega para salir aquí.') + ' '}${tr('{n} participantes · en {u}', { n: d.total, u: unidad })}`
      + `${PP_RANK.tab === 'combos' ? '<br>' + tr('COMBO x3 = 1 punto, x4 = 2… Se empieza de cero cada lunes.') : ''}</small></p>`;
  };
  if (!ppHayRanking()) { caja.innerHTML = `<p class="pp-sub">${tr('El ranking necesita conexión.')}</p>`; return; }
  const k = PP_RANK.tab === 'hoy' ? 'hoy:' + PP_RETO.dia() : PP_RANK.tab === 'combos' ? 'combos:' + PP_COMBO.lunes() : PP_RANK.tab;   // el de hoy y el de la semana, con su día
  if (PP_RANK.datos[k]) { pinta(PP_RANK.datos[k]); return; }
  caja.innerHTML = `<p class="pp-sub">${tr('Cargando…')}</p>`;
  ppRankPide(k)
    .then(d => { PP_RANK.datos[k] = d || { lista: [], yo: null, total: 0 }; if (k.startsWith(PP_RANK.tab)) pinta(PP_RANK.datos[k]); })
    .catch(() => { if (caja.isConnected) caja.innerHTML = `<p class="pp-sub">${tr('No se ha podido cargar. Prueba otra vez en un rato.')}</p>`; });
}
const ppEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// lo que se pide al servidor: el de hoy, al reto (js/reto-dia-servidor.js); el de combos, a js/combo-servidor.js; los demás, a pop_ranking
function ppRankPide(k) {
  const ok = r => { if (!r.ok) throw new Error(r.error); return r; };
  if (k.startsWith('combos:')) return PP_COMBO.ranking(k.slice(7)).then(ok);
  if (!k.startsWith('hoy:')) return CUENTA.rpc('pop_ranking', { p_tabla: k });
  return PP_RETO.ranking(k.slice(4)).then(ok);
}
