// Fans Of Decks · Biblioteca: todo lo que has descubierto (cartas, rivales, objetos y ventajas fiscales), como la de Rumble.
// Lo que aún no has visto sale tapado, con un «?» y «Por descubrir» (regla de Arkioner, 19-10-2026). Se descubre al verlo en
// partida: una carta en la mano, una oferta o el Economato; un rival en una reunión; un objeto o una merienda al ofrecértelo.
// Se guarda en DCP.meta.visto = { c: {id: 1}, r: {...}, o: {...} } (las ventajas se abren con su hito, dcVentajaAbierta).
'use strict';
function dcDescubre(tipo, id) { const v = DCP.meta.visto || (DCP.meta.visto = {}), t = v[tipo] || (v[tipo] = {}); if (!t[id]) t[id] = 1; }
function dcVisto(tipo, id) { const v = DCP.meta.visto; return !!(v && v[tipo] && v[tipo][id]); }
// lo de la partida en curso y el mazo inicial cuentan siempre (también para partidas guardadas antes de la Biblioteca)
function dcDescubreLoDeSiempre() {
  for (const k of DC_MAZOS.bunny) dcDescubre('c', k);
  const r = DCP.run; if (!r) return;
  for (const c of r.mazo || []) dcDescubre('c', c.id);
  for (const k of r.objetos || []) dcDescubre('o', k);
  for (const k of r.meriendas || []) dcDescubre('o', 'm:' + k);
}
const DC_BIB_TABS = { c: 'Cartas', r: 'Rivales', o: 'Objetos', v: 'Ventajas' };
const DC_BIB_FILTROS = { todo: 'Todo', visto: 'Descubierto', falta: 'Por descubrir' };
const DC_RAR_ORDEN = { basic: 0, common: 1, rare: 2, epic: 3, legendary: 4 };
const DC_TIPO_ORDEN = ['empleado', 'tarea', 'tramite', 'directiva', 'companero', 'protocolo', 'clausula', 'spam'];
// las cartas, además: por facción y por palabra clave o efecto (idea de Arkioner, 19-10-2026), y agrupadas por tipo
const DC_BIB_FACCIONES = { todas: 'Cualquier facción', animales: 'Animales Locos', neutral: 'Neutrales' };
const DC_BIB_PROPIEDADES = { todas: 'Cualquier efecto', despedida: 'Despedida', indefinido: 'Contrato indefinido', blindaje: 'Blindaje', madrugador: 'Madrugador',
  area: 'A todos los rivales', bloqueo: 'Bloqueo', cura: 'Cura', roba: 'Roba cartas', caos: 'Da CAOS', aturde: 'Aturde', debil: 'Débil', vulnerable: 'Vulnerable', fuerza: 'Fuerza', injugable: 'Injugable' };
let dcBibTab = 'c', dcBibFiltro = 'todo', dcBibFac = 'todas', dcBibProp = 'todas';
function dcBibCartaFac(id) { return DC_CARTAS[id].fac || 'animales'; }
// una propiedad cuenta si la tiene la carta normal o la ascendida
function dcBibCartaProp(id, k) { return [dcFx({ id }), dcFx({ id, asc: true })].some(fx => k === 'area' ? fx.obj === 'todos' : k === 'fuerza' ? fx.fuerza || fx.fuerzaTurno : !!fx[k]); }
function dcNombreRival(id) { const D = DC_RIVALES[id]; return tr(D.nombre || (CFG.enemyCards[id] ? CFG.enemyCards[id].name : id)); }
// cada pestaña: [{ id, visto }] en su orden
function dcBibLista(tab) {
  if (tab === 'c') return Object.keys(DC_CARTAS).filter(id => (dcBibFac === 'todas' || dcBibCartaFac(id) === dcBibFac) && (dcBibProp === 'todas' || dcBibCartaProp(id, dcBibProp))).sort((a, b) => DC_TIPO_ORDEN.indexOf(DC_CARTAS[a].tipo) - DC_TIPO_ORDEN.indexOf(DC_CARTAS[b].tipo) || DC_RAR_ORDEN[DC_CARTAS[a].rar] - DC_RAR_ORDEN[DC_CARTAS[b].rar]).map(id => ({ id, visto: dcVisto('c', id) }));
  if (tab === 'r') { const peso = D => (D.jefe ? 3 : D.mini ? 2 : D.elite ? 1 : 0); return Object.keys(DC_RIVALES).sort((a, b) => peso(DC_RIVALES[a]) - peso(DC_RIVALES[b]) || DC_RIVALES[a].hp - DC_RIVALES[b].hp).map(id => ({ id, visto: dcVisto('r', id) })); }
  if (tab === 'o') return Object.keys(DC_OBJETOS).sort((a, b) => DC_RAR_ORDEN[DC_OBJETOS[a].rar] - DC_RAR_ORDEN[DC_OBJETOS[b].rar]).concat(Object.keys(DC_MERIENDAS).map(k => 'm:' + k)).map(id => ({ id, visto: dcVisto('o', id) }));
  return Object.keys(DC_VENTAJAS).map(id => ({ id, visto: dcVentajaAbierta(id) }));
}
// lo tapado: un hueco con un «?»
function dcBibTapado(cls) { const d = dcEl('div', 'dc-bib-tapado ' + cls); d.append(dcEl('b', 'ol', '?'), dcEl('span', '', tr('Por descubrir'))); return d; }
// lo que sabe hacer un rival, por los tipos de sus jugadas
const DC_BIB_JUGADAS = { ataque: 'Ataca', defensa: 'Se defiende', cura: 'Cura a los suyos', refuerzo: 'Llama a refuerzos', spam: 'Manda Spam', fuerza: 'Se potencia', debil: 'Te debilita' };
function dcBibRival(id) {
  const D = DC_RIVALES[id], b = dcEl('div', 'dc-bib-rival' + (D.jefe ? ' dc-rival-jefe' : D.elite ? ' dc-rival-elite' : ''));
  b.append(dcSprite(D.arte, 58), dcEl('b', '', dcNombreRival(id)), dcEl('small', 'dc-bib-cat', tr(D.jefe ? 'Jefe' : D.mini ? 'Minijefe' : D.elite ? 'Rival duro' : 'Rival')), dcEl('span', '', tr('Vida {n}', { n: D.hp })));
  b.onclick = () => { play('select'); const t = [...new Set(D.jugadas.map(dcTipoJugada))].map(k => tr(DC_BIB_JUGADAS[k])); toast(dcNombreRival(id) + ': ' + t.join(' · ')); };
  return b;
}
function dcBibObjeto(id) {
  const mer = id.startsWith('m:'), O = mer ? DC_MERIENDAS[id.slice(2)] : DC_OBJETOS[id], rar = mer ? 'common' : O.rar;
  const b = dcEl('div', 'dc-objeto dc-bib-objeto dc-rar-' + rar), txt = dcEl('div');
  txt.append(dcEl('b', '', tr(O.nombre)), dcEl('small', 'dc-bib-cat', tr(mer ? 'Merienda' : 'Objeto')), dcEl('span', '', tr(O.texto)));
  b.append(dcIcono('+', rar, 46, O.mini), txt); return b;
}
function dcBibVentaja(id) {
  const V = DC_VENTAJAS[id], b = dcEl('div', 'dc-objeto dc-bib-objeto dc-rar-rare'), txt = dcEl('div');
  txt.append(dcEl('b', '', tr(V.nombre)), dcEl('small', 'dc-bib-cat', tr('Ventaja fiscal')), dcEl('span', '', tr(V.texto)));
  b.append(dcIcono('?', 'rare', 46, 'diploma'), txt); return b;
}
function dcBiblioteca(volver) {
  dcDescubreLoDeSiempre(); dcGuarda();
  const s = document.getElementById('dc-panel'); s.textContent = ''; dcMuestra('dc-panel'); dcPonFondo(s, null);
  const h = dcEl('header', 'dc-cab'), atras = dcEl('button', 'dc-volver'); atras.append(dcSvg('atras')); atras.setAttribute('aria-label', tr('Volver'));
  atras.onclick = () => { play('select'); volver(); }; h.append(atras, dcEl('h2', 'ol', tr('Biblioteca'))); s.append(h);
  const pest = dcEl('div', 'dc-bib-pestanas'), filtros = dcEl('div', 'dc-bib-filtros'), sub = dcEl('p', 'dc-nota'), g = dcEl('div', 'dc-rejilla dc-bib-' + dcBibTab);
  for (const k in DC_BIB_TABS) { const b = dcEl('button', 'dc-bib-pestana ol', tr(DC_BIB_TABS[k])); b.setAttribute('aria-pressed', dcBibTab === k); b.onclick = () => { dcBibTab = k; play('select'); dcBiblioteca(volver); }; pest.append(b); }
  for (const k in DC_BIB_FILTROS) { const b = dcEl('button', 'dc-bib-filtro', tr(DC_BIB_FILTROS[k])); b.setAttribute('aria-pressed', dcBibFiltro === k); b.onclick = () => { dcBibFiltro = k; play('select'); dcBiblioteca(volver); }; filtros.append(b); }
  const todos = dcBibLista(dcBibTab), vistos = todos.filter(e => e.visto).length;
  sub.textContent = tr('Has descubierto {a} de {b}.', { a: vistos, b: todos.length }) + ' ' + tr(dcBibTab === 'c' ? 'Toca una carta para verla en grande.' : dcBibTab === 'r' ? 'Toca un rival para ver qué hace.' : dcBibTab === 'v' ? 'Se desbloquean jugando.' : 'Te los ofrecen tras las reuniones, en el Economato y en los correos.');
  const vista = todos.filter(e => dcBibFiltro === 'todo' || (dcBibFiltro === 'visto') === e.visto);
  let selects = null;
  if (dcBibTab === 'c') {   // facción y propiedad, en dos desplegables para no llenar la pantalla de botones
    selects = dcEl('div', 'dc-bib-selects');
    for (const [opc, val, pon] of [[DC_BIB_FACCIONES, dcBibFac, v => { dcBibFac = v; }], [DC_BIB_PROPIEDADES, dcBibProp, v => { dcBibProp = v; }]]) {
      const sel = dcEl('select', 'dc-bib-select'); for (const k in opc) { const o = dcEl('option', '', tr(opc[k])); o.value = k; o.selected = val === k; sel.append(o); }
      sel.onchange = () => { pon(sel.value); play('select'); dcBiblioteca(volver); }; selects.append(sel);
    }
  }
  if (!vista.length) g.append(dcEl('p', 'dc-nota', tr(dcBibFiltro === 'falta' ? '¡Lo has descubierto todo!' : 'Aún no has descubierto nada aquí.')));
  // las cartas, agrupadas por tipo con su color; cada grupo dice cuántas llevas
  if (dcBibTab === 'c' && vista.length) {
    g.className = 'dc-bib-grupos';
    for (const t of DC_TIPO_ORDEN) {
      const del = vista.filter(e => DC_CARTAS[e.id].tipo === t); if (!del.length) continue;
      const tit = dcEl('h3', 'dc-bib-grupo dc-tipo-' + t), rej = dcEl('div', 'dc-rejilla');
      tit.append(dcEl('span', 'dc-bib-grupo-tipo', tr(DC_NOMBRE_TIPO[t])), dcEl('small', '', del.filter(e => e.visto).length + '/' + del.length));
      for (const e of del) { if (!e.visto) { rej.append(dcBibTapado('dc-bib-tapado-carta')); continue; } const c = { id: e.id }; rej.append(dcPintaCarta(c, { al: () => dcVerCarta(c) })); }
      g.append(tit, rej);
    }
    s.append(pest, filtros, selects, sub, g); return;
  }
  for (const e of vista) {
    if (!e.visto) { g.append(dcBibTapado(dcBibTab === 'c' ? 'dc-bib-tapado-carta' : dcBibTab === 'r' ? 'dc-bib-tapado-rival' : 'dc-bib-tapado-fila')); continue; }
    if (dcBibTab === 'c') { const c = { id: e.id }, el = dcPintaCarta(c, { al: () => dcVerCarta(c) }); g.append(el); }
    else g.append(dcBibTab === 'r' ? dcBibRival(e.id) : dcBibTab === 'o' ? dcBibObjeto(e.id) : dcBibVentaja(e.id));
  }
  s.append(pest, filtros, sub, g);
}
