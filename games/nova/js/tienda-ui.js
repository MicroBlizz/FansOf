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
  const T = S.estTienda, rep = () => nvRenderEstacion(S), n = S.nave;
  p.appendChild(nvEl('nv-titulo', tr('TIENDA DE MÓDULOS')));
  const tabs = nvEl('nv-tabs');
  for (const [id, txt] of [['comprar', 'Comprar'], ['mejorar', 'Mejorar'], ['reciclar', 'Reciclar']]) {
    const t = nvEl('nv-boton' + (T.tab === id ? ' nv-sel' : ''), tr(txt), 'button'); t.onclick = () => { T.tab = id; T.aviso = ''; rep(); }; tabs.appendChild(t);
  }
  p.appendChild(tabs);
  const aviso = nvEl('nv-cdet nv-aviso', T.aviso || ''); p.appendChild(aviso);
  const armas = n.armas.filter(w => w.portador !== 'defensa');
  if (T.tab === 'comprar') {
    p.appendChild(nvEl('nv-cdet', tr('Solo se vende lo que cabe en una ranura libre de tu nave')));
    for (const o of nvSurtido(S)) {
      let col, nom, det, ic;
      if (o.tipo === 'arma') { const V = o.variante ? NV_VAR_ID[o.variante] : null; col = NOVA_ARMAS.cargas[o.carga].color; nom = tr(V ? V.nombre : NOVA_ARMAS.portadores[o.portador].nombre) + ' · ' + tr(NOVA_ARMAS.cargas[o.carga].nombre); det = tr(NOVA_RAREZAS[o.rareza].nombre) + ' · ' + tr(V ? V.efecto : NOVA_ARMAS.portadores[o.portador].fuerte); ic = ['arma', o.variante || o.portador]; }
      else if (o.tipo === 'defensa') { col = o.id === 'escudo' ? '#4aa8ff' : '#ff9a3c'; nom = tr(o.id === 'escudo' ? 'Escudo' : 'Blindaje'); det = tr(o.id === 'escudo' ? 'Absorbe 200 de daño y se regenera si pasas 3 s sin que te peguen' : 'Recibes un 25 % menos de daño'); ic = ['sis', o.id]; }
      else { const m = NV_MEJORAS_SISTEMA.find(x => x.id === o.id); col = '#5be36b'; nom = tr(m.titulo); det = tr(m.detalle); ic = ['sis', o.id]; }
      const b = nvTiendaFila(col, nom, o.vendido ? tr('Vendido') : det, ic, o.vendido ? '—' : o.precio); b.disabled = !!o.vendido || S.cartera < o.precio;
      b.onclick = () => { const m = nvCompraModulo(S, o); if (m) T.aviso = m; else T.aviso = ''; rep(); };
      p.appendChild(b);
    }
    const r = nvEl('nv-boton', tr('Renovar el surtido') + ' (' + NV_RENOVAR + ')', 'button'); r.disabled = S.cartera < NV_RENOVAR; r.onclick = () => { nvRenovarSurtido(S); rep(); }; p.appendChild(r);
  } else if (T.tab === 'mejorar') {
    p.appendChild(nvEl('nv-cdet', tr('Cada mejora da un 25 % más de daño al arma')));
    for (const w of armas) {
      const max = NOVA_ARMAS.mejora.maxNiveles, tope = w.nivel >= max;
      const b = nvTiendaFila(NOVA_ARMAS.cargas[w.carga].color, nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : ''), tope ? tr('Al máximo') : tr('Subir a') + ' +' + (w.nivel + 1) + '/' + max, ['arma', w.portador], tope ? '—' : nvPrecioMejora(w));
      b.disabled = !nvPuedeMejorar(S, w); b.onclick = () => { nvMejoraArma(S, w); rep(); }; p.appendChild(b);
    }
  } else {
    p.appendChild(nvEl('nv-cdet', tr('Reciclar devuelve la mitad de lo que vale el módulo')));
    for (const w of n.armas) {
      const def = w.portador === 'defensa', ok = nvPuedeReciclar(S, w);
      const b = nvTiendaFila(NOVA_ARMAS.cargas[w.carga].color, def ? tr(w.carga === 'energia' ? 'Escudo' : 'Blindaje') : nvNombreArma(w) + (w.nivel ? ' +' + w.nivel : ''), ok ? tr('Reciclar') : tr('Es tu última arma'), def ? ['sis', w.carga === 'energia' ? 'escudo' : 'blindaje'] : ['arma', w.portador], ok ? '+' + nvPrecioReciclar(w) : '—');
      b.disabled = !ok; b.onclick = () => { nvReciclaModulo(S, w); T.aviso = ''; rep(); }; p.appendChild(b);
    }
  }
  const at = nvEl('nv-boton', tr('Atrás'), 'button'); at.onclick = () => { S.estTienda = null; rep(); }; p.appendChild(at);
}
