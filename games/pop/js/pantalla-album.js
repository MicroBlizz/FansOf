// Fans of Pop · PANTALLA DE COMPAÑEROS: EL ÁLBUM (tarea #142, ADR 157; boceto aprobado por Pepins, 19-11-2026). El botón COMPAÑEROS del
// menú (solo con el flag `companeros`) abre una ventana con dos pestañas: ÁLBUM (aquí) y MI EQUIPO (js/pantalla-equipo.js). El álbum
// enseña cada página con su contador y su barra, las cartas de los que tienes (borde de su rareza, estrellas y el modo en el que ayudan)
// y la silueta «?» de los que faltan (la de verdad, con su pista, si es un escondido: ADR 199; marco dorado a las 5 estrellas). Tocar una carta abre su ficha: subir una estrella, comprarlo si es de la tienda o cómo se consigue.
// Las reglas son las de js/coleccion.js; lo que hay que enseñar sale de js/companeros-vista.js. Aquí solo se pinta y se pregunta.
'use strict';
const PP_ALB = { tab: 'album', modo: 'N', aviso: '' };
const PP_ALB_MODOS = Object.freeze({ N: 'Niveles', P: 'Pesadilla', D: 'Duelos' });
const PP_ALB_ERRORES = Object.freeze({
  lleno: 'Equipo lleno: quita uno o abre otra casilla.', monedas: 'Te faltan monedas', sin_repetido: 'Te faltan repetidos para subirle una estrella.',
  tope: 'Ya no se puede más', ya_cobrada: 'Ese premio ya lo has recogido', incompleta: 'Aún te faltan compañeros en esta página', no_tiene: 'Eso todavía no es tuyo',
});
const ppAlbError = e => tr(PP_ALB_ERRORES[e] || 'No se ha podido. Prueba otra vez.');
const ppAlbAbierta = () => !$pp('#pp-modal').hidden && $pp('#pp-tarjeta').classList.contains('pp-comp');
// la inicial del modo en el idioma de cada uno (N/P/D en español; L/N/D en inglés): sin claves de una sola letra
const ppAlbInicial = m => tr(PP_ALB_MODOS[m]).charAt(0).toUpperCase();
// el botón del menú: solo con el flag abierto
function ppCompanerosBoton() {
  const b = $pp('#pp-companeros'); if (!b) return;
  b.hidden = !ppCompanerosActivo(); ppBarraBoton('#pp-companeros', 'companeros', tr('COMPAÑEROS'));   // en la barra de la portada (js/portada-barra.js)
}
/* ---------- lo de arriba: saldo y pestañas ---------- */
function ppAlbSaldo() {
  return ppPfEl('div', 'pp-cm-saldo', `${ppMonedasHtml(SAVE.monedas, 26)}${ppPerlasHtml(SAVE.perlas || 0, 26)}`);
}
function ppAlbTabs() {
  const tabs = ppPfEl('div', 'pp-tabs pp-cm-tabs');
  for (const [k, txt] of [['album', 'ÁLBUM'], ['equipo', 'MI EQUIPO']]) {
    const b = ppPfEl('button', 'pp-tab' + (PP_ALB.tab === k ? ' pp-on' : ''), tr(txt)); b.type = 'button';
    b.onclick = () => { play('select'); ppVentanaCompaneros(k); }; tabs.appendChild(b);
  }
  return tabs;
}
/* ---------- una carta ---------- */
// sus clases: rareza y estrellas si lo tienes (dorado a las 5), «falta» si no y, si es un escondido, su silueta (ADR 199)
function ppAlbCartaClase(c, extra) {
  const base = c.tiene ? `pp-cm-${c.rar} pp-cm-s${c.est}${c.dorado ? ' pp-cm-dorado' : ''}` : `pp-cm-falta${c.escondido ? ' pp-cm-escondido' : ''}`;
  return `pp-cm-carta ${base} ${extra || ''}`;
}
// lo de debajo del dibujo: su nombre, «???» o, en un escondido que falta, la pista corta (su momento dibujado y su mundo); la frase
// entera va en su ficha, que no cabe en una carta de cuatro por fila
function ppAlbCartaNombre(c, id) {
  if (c.tiene) return `<span class="pp-cm-nom">${ppEsc(tr(ppSlimeDe(id).nombre))}</span>`;
  if (!c.escondido) return '<span class="pp-cm-nom">???</span>';
  return `<span class="pp-cm-nom pp-cm-pista">${ppCompMomento(c.momento, 16)}${ppEsc(tr(PP_MUNDOS[c.pista.datos.m].nombre))}</span>`;
}
const ppAlbCartaDibujo = (c, id, lado) => c.escondido ? ppCompSombra(id, lado) : ppCompMini(id, lado, !c.tiene);
// `extra`: una clase más (en Mi equipo, 'pp-cm-puesto'); `alTocar`: qué hace al tocarla
function ppAlbCarta(e, id, extra, alTocar) {
  const c = PP_COMP_VISTA.carta(e, id), b = document.createElement('button');
  b.type = 'button'; b.className = ppAlbCartaClase(c, extra);
  if (c.tiene) b.insertAdjacentHTML('beforeend', `<span class="pp-cm-estrellas">${'★'.repeat(c.est)}</span><span class="pp-cm-modo pp-cm-m${c.modo}">${ppAlbInicial(c.modo)}</span>`);
  b.appendChild(ppAlbCartaDibujo(c, id, 70));
  b.insertAdjacentHTML('beforeend', ppAlbCartaNombre(c, id));
  b.onclick = () => { play('select'); alTocar(id); };
  return b;
}
/* ---------- una página ---------- */
// el premio de completarla: monedas, perla y, si lo hay, un compañero (el marco aún no existe: no se enseña)
function ppAlbPremioHtml(p) {
  const pr = p.premio, trozos = [ppMonedasHtml(pr.monedas, 22)];
  if (pr.perlas) trozos.push(ppPerlasHtml(pr.perlas, 22));
  if (pr.companero) trozos.push(`<b>${ppEsc(tr(ppSlimeDe(pr.companero).nombre))}</b>`);
  return trozos.join(' + ');
}
function ppAlbPagina(e, p) {
  const pr = PP_COLE.progreso(e, p.id), caja = ppPfEl('div', 'pp-cm-pagina');
  caja.innerHTML = `<h3>${ppEsc(tr(p.nombre))}<span class="pp-cm-cuenta">${pr.tengo} / ${pr.total}</span></h3>
    <div class="pp-cm-barra"><i style="width:${Math.round((pr.tengo * 100) / pr.total)}%"></i></div>
    <p class="pp-cm-premio">${pr.cobrada ? tr('Premio recogido') : `${tr('Al completarla:')} ${ppAlbPremioHtml(p)}`}</p>`;
  if (PP_COMP_VISTA.recoger(e, p.id)) caja.appendChild(ppBoton(tr('RECOGER PREMIO'), 'pp-btn2 pp-oro pp-cm-recoger', () => ppAlbRecoge(p.id)));
  const rejilla = ppPfEl('div', 'pp-cm-rejilla');
  for (const id of PP_COLE.idsDe(p.id)) rejilla.appendChild(ppAlbCarta(e, id, '', k => { PP_ALB.aviso = ''; ppVentanaCompanero(k); }));
  caja.appendChild(rejilla);
  return caja;
}
function ppAlbumLlena(t) {
  const e = ppCole();
  for (const p of PP_COMP.PAGINAS) t.appendChild(ppAlbPagina(e, p));
  t.appendChild(ppPfEl('div', 'pp-cm-proximo', tr('Próximamente: más facciones')));
}
// el premio de una página completa: monedas a la partida, la perla como ganada jugando (motivo 'pagina', una sola vez por página)
function ppAlbRecoge(pid) {
  const r = PP_COLE.cobraPagina(ppCole(), pid);
  if (!r.ok) { PP_ALB.aviso = ppAlbError(r.error); ppVentanaCompaneros(); return; }
  SAVE.monedas += r.premio.monedas;
  if (r.premio.companero) SAVE.vistos[r.premio.companero] = true;
  ppColeGuarda(r.estado);
  if (r.premio.perlas) ppPerlas(r.premio.perlas, 'pagina', 'pagina:' + pid);
  play('ppPremio'); ppVibra([20, 30, 20]);
  PP_ALB.aviso = tr('¡Premio recogido!');
  ppVentanaCompaneros();
}
/* ---------- la ventana ---------- */
function ppVentanaCompaneros(tab) {
  if (tab) { PP_ALB.tab = tab; PP_ALB.aviso = ''; }
  const antes = ppAlbAbierta() && !tab ? $pp('#pp-tarjeta').scrollTop : 0;
  const t = ppAbre(`<h2>${tr(PP_ALB.tab === 'album' ? 'Álbum' : 'Mi equipo')}</h2>`, true);
  t.classList.add('pp-comp');
  t.append(ppAlbSaldo(), ppAlbTabs());
  if (PP_ALB.aviso) t.appendChild(ppPfEl('p', 'pp-pf-aviso', ppEsc(PP_ALB.aviso)));
  if (PP_ALB.tab === 'album') ppAlbumLlena(t); else ppEquipoLlena(t);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { PP_ALB.aviso = ''; ppCierra(); }));
  t.scrollTop = antes;
}
/* ---------- la ficha de un compañero ---------- */
// la cabeza de la ficha: el dibujo (en un aro dorado si tiene las 5 estrellas), su nombre, su rareza y sus estrellas
function ppAlbFichaCabeza(t, id, c) {
  const d = ppSlimeDe(id), s = PP_COMP_VISTA.estrellas(c.est), dibujo = ppCompMini(id, 130);
  if (c.dorado) dibujo.classList.add('pp-cm-aro-oro');
  t.appendChild(dibujo);
  t.insertAdjacentHTML('beforeend', `<h2>${ppEsc(tr(d.nombre))}</h2>
    <p class="pp-cm-fila"><span class="pp-cm-rar pp-cm-${c.rar}">${tr(PP_COMP.RAREZAS[c.rar])}</span>
    ${c.dorado ? `<span class="pp-cm-rar pp-cm-oro">${tr('¡Dorado!')}</span>` : ''}
    ${c.tiene ? `<span class="pp-cm-estrellas-f">${ppCompEstrella(true, 24).repeat(s.llenas)}${ppCompEstrella(false, 24).repeat(s.vacias)}</span>` : ''}</p>`);
}
// qué es «de día» y «de noche» en la pista de un escondido
const PP_ALB_MOMENTO = Object.freeze({ dia: 'De día: en los niveles normales de ese mundo.', noche: 'De noche: en los niveles difíciles de ese mundo.' });
// la ficha de uno que falta: la silueta «?» o, si es un escondido, su silueta de verdad con su pista y dónde buscarlo (ADR 199)
function ppAlbFichaFalta(t, id, c) {
  t.append(c.escondido ? ppCompSombra(id, 130) : ppCompMini(id, 130, true), ppPfEl('h2', '', tr('¿Quién será?')));
  if (!c.escondido) return;
  t.appendChild(ppPfEl('p', 'pp-cm-pista-f', `${ppCompMomento(c.momento, 30)}<span>${ppEsc(ppAlbVia(id))}</span>`));
  t.appendChild(ppPfEl('p', 'pp-cm-via', `${ppEsc(tr(PP_ALB_MOMENTO[c.momento]))} ${ppEsc(tr('Sale a veces en una burbuja que brilla distinto: ¡reviéntala antes de acabar!'))}`));
}
function ppAlbHabilidad(id) {
  const h = PP_COMP.HAB[PP_COMP.INFO[id].hab];
  return ppPfEl('div', 'pp-cm-hab', `<b>${ppEsc(tr(h.nombre))}</b> · <span class="pp-cm-modo-t pp-cm-m${h.modo}">${tr(PP_ALB_MODOS[h.modo])}</span><br>${ppEsc(tr(h.texto))}${h.estrellas ? `<br><small>${ppEsc(tr(h.estrellas))}</small>` : ''}`);
}
// cómo se consigue, ya traducido (el nombre de la página o del mundo va por su lado en tr())
function ppAlbVia(id) {
  const v = PP_COMP_VISTA.via(id);
  if (!v) return '';
  const datos = { ...(v.datos || {}) };
  if (datos.p) datos.p = tr((PP_COMP.PAGINAS.find(p => p.id === datos.p) || { nombre: datos.p }).nombre);
  if ('m' in datos) datos.m = tr(PP_MUNDOS[datos.m].nombre);
  return tr(v.texto, datos);
}
// lo de las estrellas: los repetidos, lo que cuesta la siguiente y su botón
function ppAlbEstrellas(t, id, c) {
  const sig = PP_COMP_VISTA.siguienteEstrella(ppCole(), id);
  t.appendChild(ppPfEl('p', 'pp-cm-via', `<b>${tr('Repetidos:')}</b> ${c.rep}`));
  if (sig.puede) {
    t.appendChild(ppPfEl('p', 'pp-cm-via', `<b>${tr('Siguiente estrella:')}</b> ${tr('{n} repetidos y', { n: sig.repetidos })} ${ppMonedasHtml(sig.monedas, 22)}`));
    t.appendChild(ppBotonPrecio(tr('SUBIR ESTRELLA'), sig.monedas, 'pp-btn', () => ppAlbSube(id)));
  } else t.appendChild(ppPfEl('p', 'pp-cm-via', sig.motivo === 'tope' ? tr('¡Tiene todas las estrellas!') : tr('Te faltan repetidos para subirle una estrella: {n}', { n: `${c.rep}/${sig.repetidos}` })));
}
// comprar con perlas (solo los de la tienda que no tienes): la compra la hace ppCompraCompanero (servidor), si existe
function ppAlbBotonCompra(t, id) {
  const v = PP_COMP.INFO[id].via;
  if (v.t !== 'tienda' || typeof ppCompraCompanero !== 'function') return;
  const b = ppBoton('', 'pp-btn pp-cm-comprar', () => ppCompraCompanero(id, () => ppVentanaCompanero(id)));
  b.innerHTML = `${tr('COMPRAR')} · ${ppPerlasPrecioHtml(v.perlas, 28)}`;
  t.appendChild(b);
}
function ppVentanaCompanero(id) {
  const c = PP_COMP_VISTA.carta(ppCole(), id), tienda = PP_COMP.INFO[id].via.t === 'tienda';
  const t = ppAbre('', true);
  t.classList.add('pp-comp', 'pp-cm-ficha');
  if (c.tiene || tienda) { ppAlbFichaCabeza(t, id, c); t.appendChild(ppAlbHabilidad(id)); }
  else ppAlbFichaFalta(t, id, c);
  if (PP_ALB.aviso) t.appendChild(ppPfEl('p', 'pp-pf-aviso', ppEsc(PP_ALB.aviso)));
  if (!c.escondido) t.appendChild(ppPfEl('p', 'pp-cm-via', `<b>${tr('Cómo se consigue:')}</b> ${ppEsc(ppAlbVia(id))}`));
  if (c.tiene) ppAlbEstrellas(t, id, c);
  else ppAlbBotonCompra(t, id);
  t.appendChild(ppBoton(tr('VOLVER'), 'pp-btn2 pp-azul', () => { PP_ALB.aviso = ''; ppVentanaCompaneros(); }));
}
// subir una estrella: sus repetidos (2, 3, 5 u 8) y sus monedas
function ppAlbSube(id) {
  const r = PP_COLE.subeEstrella(ppCole(), id, SAVE.monedas);
  if (!r.ok || !ppCobra(r.gasta)) { PP_ALB.aviso = ppAlbError(r.ok ? 'monedas' : r.error); ppVentanaCompanero(id); return; }
  ppColeGuarda(r.estado);
  play('ppPremio'); ppVibra([20, 30, 20]);
  PP_ALB.aviso = tr('¡Una estrella más!');
  ppVentanaCompanero(id);
}
