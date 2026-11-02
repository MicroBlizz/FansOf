// Fans of Nova · Pantalla de la tienda de módulos: tres pestañas (Comprar, Mejorar, Reciclar). La lógica y los precios están en tienda.js.
'use strict';
function nvTiendaFila(col, nom, det, ic, precio) {   // una fila tocable: icono, nombre, detalle y el precio en una píldora a la derecha
  const b = nvEl('nv-carta nv-fila', '', 'button'); b.style.setProperty('--col', col);
  b.appendChild(nvEl('nv-cnom', nom)); b.appendChild(nvEl('nv-cdet', det));
  nvConIcono(b, ic[0], ic[1], col, 44);
  if (precio !== undefined) b.appendChild(nvEl('nv-precio', String(precio)));
  return b;
}
function nvRenderTienda(S, p) {
  const T = S.estTienda, rep = () => nvRenderEstacion(S);
  p.appendChild(nvEl('nv-titulo', tr('TIENDA DE MÓDULOS')));
  const tabs = nvEl('nv-tabs');
  for (const [id, txt] of [['comprar', 'Comprar'], ['mejorar', 'Mejorar'], ['reciclar', 'Reciclar']]) {
    const t = nvEl('nv-boton' + (T.tab === id ? ' nv-sel' : ''), tr(txt), 'button'); t.onclick = () => { T.tab = id; T.aviso = ''; rep(); }; tabs.appendChild(t);
  }
  p.appendChild(tabs);
  p.appendChild(nvEl('nv-cdet nv-aviso', T.aviso || ''));
  if (T.tab === 'comprar') nvTiendaComprar(S, p, T, rep);
  else if (T.tab === 'mejorar') nvTiendaMejorar(S, p, rep);
  else nvTiendaReciclar(S, p, T, rep);
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estTienda = null; rep(); }; p.appendChild(at);
}
// Color, nombre, detalle e icono de un módulo del surtido
function nvTextoModulo(o) {
  if (o.tipo === 'arma') { const V = o.variante ? NV_VAR_ID[o.variante] : null; return [NOVA_ARMAS.cargas[o.carga].color, tr(V ? V.nombre : NOVA_ARMAS.portadores[o.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[o.carga].nombre), tr(NOVA_RAREZAS[o.rareza].nombre) + ' · ' + tr(V ? V.efecto : NOVA_ARMAS.portadores[o.portador].fuerte), ['arma', o.variante || o.portador]]; }
  if (o.tipo === 'defensa') { const esc = o.id === 'escudo'; return [esc ? '#4aa8ff' : '#ff9a3c', tr(esc ? 'Escudo' : 'Blindaje'), tr(esc ? 'Absorbe 200 de daño y se regenera si pasas 3 s sin que te peguen' : 'Recibes un 25 % menos de daño'), ['sis', o.id]]; }
  const m = NV_MEJORAS_SISTEMA.find(x => x.id === o.id);
  return ['#5be36b', tr(m.titulo), tr(m.detalle), ['sis', o.id]];
}
function nvTiendaComprar(S, p, T, rep) {
  p.appendChild(nvEl('nv-cdet', tr('Solo se vende lo que cabe en una ranura libre de tu nave')));
  for (const o of nvSurtido(S)) {
    const [col, nom, det, ic] = nvTextoModulo(o);
    const b = nvTiendaFila(col, nom, o.vendido ? tr('Vendido') : det, ic, o.vendido ? '—' : o.precio); b.disabled = !!o.vendido || S.cartera < o.precio;
    b.onclick = () => { T.aviso = nvCompraModulo(S, o) || ''; rep(); };
    p.appendChild(b);
  }
  const r = nvEl('nv-boton', tr('Renovar el surtido') + ' (' + NV_RENOVAR + ')', 'button'); r.disabled = S.cartera < NV_RENOVAR; r.onclick = () => { nvRenovarSurtido(S); rep(); }; p.appendChild(r);
}
function nvTiendaMejorar(S, p, rep) {
  p.appendChild(nvEl('nv-cdet', tr('Cada mejora da un 25 % más de daño al arma')));
  for (const w of S.nave.armas.filter(w => w.portador !== 'defensa')) {
    const max = NOVA_ARMAS.mejora.maxNiveles, tope = w.nivel >= max;
    const b = nvTiendaFila(NOVA_ARMAS.cargas[w.carga].color, nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : ''), tope ? tr('Al máximo') : tr('Subir a') + ' +' + (w.nivel + 1) + '/' + max, ['arma', w.portador], tope ? '—' : nvPrecioMejora(w));
    b.disabled = !nvPuedeMejorar(S, w); b.onclick = () => { nvMejoraArma(S, w); rep(); }; p.appendChild(b);
  }
}
function nvTiendaReciclar(S, p, T, rep) {
  p.appendChild(nvEl('nv-cdet', tr('Reciclar devuelve la mitad de lo que vale el módulo')));
  for (const w of S.nave.armas) {
    const def = w.portador === 'defensa', ok = nvPuedeReciclar(S, w), esc = w.carga === 'energia';
    const b = nvTiendaFila(NOVA_ARMAS.cargas[w.carga].color, def ? tr(esc ? 'Escudo' : 'Blindaje') : nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : ''), ok ? tr('Reciclar') : tr('Es tu última arma'), def ? ['sis', esc ? 'escudo' : 'blindaje'] : ['arma', w.portador], ok ? '+' + nvPrecioReciclar(w) : '—');
    b.disabled = !ok; b.onclick = () => { nvReciclaModulo(S, w); T.aviso = ''; rep(); }; p.appendChild(b);
  }
}
