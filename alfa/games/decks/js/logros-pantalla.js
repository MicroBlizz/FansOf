// Fans Of Decks · Pantalla de Trofeos (ficha de la portada) con los logros: el paro superado sumando todos los líderes y, por cada líder, su paro, sus logros y sus ventajas propias.
// Solo consulta: los logros se consiguen jugando (logros.js) y las ventajas se eligen al empezar la partida (ventajas.js).
'use strict';
function dcLogros(volver) {
  const s = dcPanel(tr('Trofeos')), M = DCP.meta, suma = dcParoSuma();
  const gen = Object.keys(DC_VENTAJAS).filter(k => DC_VENTAJAS[k].hito && DC_VENTAJAS[k].hito.paroSuma), genAb = gen.filter(dcVentajaAbierta);
  const sig = gen.filter(k => !dcVentajaAbierta(k)).sort((a, b) => DC_VENTAJAS[a].hito.paroSuma - DC_VENTAJAS[b].hito.paroSuma)[0];
  const cab = dcEl('div', 'dc-opcion dc-logros-cab');
  cab.append(dcEl('b', '', tr('Niveles de paro superados: {n}', { n: suma })), dcEl('span', '', tr('Ventajas generales abiertas: {a} de {b}', { a: genAb.length, b: gen.length })));
  if (sig) cab.append(dcEl('span', '', tr('Siguiente: {v} ({h})', { v: tr(DC_VENTAJAS[sig].nombre), h: dcHitoTexto(DC_VENTAJAS[sig].hito) })));
  s.append(cab);
  for (const k of DC_LIDERES_ORDEN.filter(x => DC_LIDERES[x])) {
    const L = DC_LIDERES[k], abierto = dcLiderAbierto(k), paro = dcParoAbierto(k), caja = dcEl('div', 'dc-opcion dc-logros-lider' + (abierto ? '' : ' dc-cerrada'));
    const fila = dcEl('div', 'dc-logros-fila'), arte = dcEl('span', 'dc-lider-op-arte'); arte.append(dcSprite(L.arte, 48));
    const nom = dcEl('div', 'dc-lider-op-txt'); nom.append(dcEl('b', '', tr(L.nombre)), dcEl('small', 'dc-lider-estado' + (abierto ? '' : ' dc-lider-candado'), abierto ? (paro ? tr('Abierto hasta el paro +{n}', { n: paro }) : tr('Sin paro todavía')) : dcCandadoLider(k)));
    nom.append(dcEl('small', '', tr('Reuniones ganadas: {n}', { n: (M.ganadas || {})[k] || 0 })));
    fila.append(arte, nom); caja.append(fila);
    const lista = dcEl('ul', 'dc-logros-lista');
    for (const [v] of DC_VENTAJAS_LIDER[k] || []) {
      const V = DC_VENTAJAS[v], h = V.hito, ok = dcVentajaAbierta(v), li = dcEl('li', ok ? 'dc-logro-hecho' : '');
      const que = h.logro ? tr('Logro «{l}»', { l: tr(DC_LOGROS[h.logro].nombre) }) : tr('Supera el paro +{n}', { n: h.paroLider - 1 });
      const LG = h.logro && DC_LOGROS[h.logro], pide = LG ? tr(LG.texto) + (LG.veterano && !ok ? ' ' + tr('({n} de {m})', { n: (M.ganadas || {})[k] || 0, m: DC_VETERANO }) : '') + ' · ' : '';
      li.append(dcEl('i', 'dc-logro-punto'), dcEl('b', '', que), dcEl('span', '', pide + tr('Ventaja: {v}', { v: tr(V.nombre) }) + ' (' + tr(V.texto) + ')'));
      lista.append(li);
    }
    caja.append(lista); s.append(caja);
  }
  const b = dcEl('button', 'btn-ghost ol', tr('VOLVER')); b.onclick = () => { play('select'); (volver || dcPortada)(); }; s.append(b);
}
