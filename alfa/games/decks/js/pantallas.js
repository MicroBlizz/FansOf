// Fans Of Decks · Pantallas fuera de la reunión: el organigrama, la recompensa, los correos, la pausa para el café, el Economato de Lola y el final.
'use strict';
function dcMuestra(id) { for (const s of document.querySelectorAll('.dc-pantalla')) s.hidden = s.id !== id; dcCierraVentana(); }
const DC_NOMBRE_NODO = { facil: 'Reunión', normal: 'Reunión', elite: 'Jefe de departamento', jefe: 'Despacho del jefe', correo: 'Correo interno', pausa: 'Pausa para el café', economato: 'Economato de Lola' };
const DC_LETRA_NODO = { facil: 'R', normal: 'R', elite: 'JD', jefe: '!', correo: '@', pausa: 'C', economato: '€' };

// ---------- cabecera común: vida, nóminas, mazo ----------
function dcCabecera(titulo, volver) {
  const r = DCP.run, h = dcEl('header', 'dc-cab');
  if (volver) { const b = dcEl('button', 'dc-volver', '‹'); b.setAttribute('aria-label', tr('Volver')); b.onclick = volver; h.append(b); }
  h.append(dcEl('h2', 'ol', titulo));
  const d = dcEl('div', 'dc-datos');
  d.append(dcEl('span', 'dc-dato dc-dato-vida', r.hp + '/' + r.hpMax), dcEl('span', 'dc-dato dc-dato-nom', fmt(r.nominas) + ' ' + tr('nóminas')));
  const m = dcEl('button', 'dc-dato dc-dato-mazo', tr('Mazo') + ' ' + r.mazo.length); m.onclick = () => dcVerCartas(tr('Tu mazo'), r.mazo); d.append(m);
  h.append(d); return h;
}
// ---------- el organigrama ----------
function dcPintaMapa() {
  const r = DCP.run, m = r.mapa, s = document.getElementById('dc-mapa');
  s.textContent = ''; dcMuestra('dc-mapa');
  s.append(dcCabecera(tr('El organigrama'), () => dcPortada()));
  const pos = dcNodosPosibles(), col = dcEl('div', 'dc-organigrama');
  for (let p = m.pisos.length - 1; p >= 0; p--) {
    const fila = dcEl('div', 'dc-piso');
    m.pisos[p].forEach((n, k) => {
      const posible = pos.some(([a, b]) => a === p && b === k), actual = m.piso === p && m.nodo === k;
      const b = dcEl('button', 'dc-nodo dc-nodo-' + n.tipo + (posible ? ' dc-posible' : '') + (actual ? ' dc-actual' : '') + (p < m.piso ? ' dc-pasado' : ''));
      b.append(dcEl('b', '', DC_LETRA_NODO[n.tipo]), dcEl('small', '', tr(DC_NOMBRE_NODO[n.tipo])));
      b.disabled = !posible; b.onclick = () => { play('select'); dcIrA(p, k); dcResuelveNodo(); };
      fila.append(b);
    });
    col.append(fila);
  }
  s.append(col);
  const pie = dcEl('div', 'dc-pie');
  const objs = dcEl('div', 'dc-objetos'); for (const k of r.objetos) { const o = dcEl('span', 'dc-chip dc-chip-' + DC_OBJETOS[k].rar, tr(DC_OBJETOS[k].nombre)); o.title = tr(DC_OBJETOS[k].texto); o.onclick = () => toast(tr(DC_OBJETOS[k].texto)); objs.append(o); }
  for (const k of r.meriendas) { const o = dcEl('span', 'dc-chip dc-chip-merienda', tr(DC_MERIENDAS[k].nombre)); o.title = tr(DC_MERIENDAS[k].texto); objs.append(o); }
  pie.append(objs, dcEl('p', 'dc-nota', tr(m.piso < 0 ? 'Elige por dónde empiezas. Arriba te espera el despacho del jefe.' : 'Toca el siguiente nodo del camino.')));
  s.append(pie);
}
// Lo que toca hacer en el nodo actual (también al volver a abrir el juego con un nodo pendiente).
function dcResuelveNodo() {
  const n = dcNodoActual(), r = DCP.run;
  if (!n || !r.pendiente) return dcPintaMapa();
  if (DC_ENCUENTROS[n.tipo]) return dcEmpiezaReunion(n.enc, n.tipo, dcFinReunion);
  if (n.tipo === 'correo') return dcPintaCorreo(DC_CORREOS.find(c => c.id === n.correo) || DC_CORREOS[0]);
  if (n.tipo === 'pausa') return dcPintaPausa();
  if (n.tipo === 'economato') return dcPintaEconomato();
  dcNodoResuelto(); dcPintaMapa();
}
// ---------- la recompensa ----------
function dcFinReunion(resultado, C) {
  const r = DCP.run, n = dcNodoActual();
  if (resultado === 'derrota') { play('lose'); dcFinPartida(false); return dcPintaFin(false); }
  play('win');
  const [a, b] = DC_NOMINAS[n.tipo]; const nom = a + Math.round(Math.random() * (b - a)); r.nominas += nom;
  const s = dcPanel(tr(n.tipo === 'jefe' ? '¡Despacho conquistado!' : '¡Reunión ganada!'));
  s.append(dcEl('p', 'dc-nota', tr('Nóminas: +{n}', { n: nom }) + ' · ' + tr('Turnos: {n}', { n: C.turno })));
  const pasos = [];
  if (n.tipo === 'jefe') pasos.push(() => dcEligeObjeto(['zanahoriaoro', 'cofre'], tr('Un objeto legendario del despacho')));
  else if (n.tipo === 'elite') { const o = dcObjetoAlAzar(); if (o) pasos.push(() => dcEligeObjeto([o], tr('El jefe de departamento deja algo'))); }
  pasos.push(() => dcOfertaEmpleo(n.tipo === 'jefe'));
  const sig = () => { const p = pasos.shift(); if (p) p(); else if (n.tipo === 'jefe') { dcFinPartida(true); dcPintaFin(true); } else { dcNodoResuelto(); dcPintaMapa(); } };
  DCC.siguiente = sig;
  const bt = dcEl('button', 'btn-big ol', tr('SEGUIR')); bt.onclick = sig; s.append(bt);
}
function dcPanel(titulo) { const s = document.getElementById('dc-panel'); s.textContent = ''; dcMuestra('dc-panel'); if (DCP.run) s.append(dcCabecera(titulo)); else s.append(dcEl('h2', 'ol', titulo)); return s; }
function dcOfertaEmpleo(legendaria) {
  const r = DCP.run, s = dcPanel(tr('Oferta de empleo'));
  s.append(dcEl('p', 'dc-nota', tr('Elige una carta para tu mazo, o pasa y cobra 15 nóminas.')));
  const g = dcEl('div', 'dc-rejilla dc-oferta');
  const ids = dcOferta(3 + (dcObjeto('llavero') ? dcObjeto('llavero').oferta : 0)); if (legendaria) ids[0] = 'sp_pulgas';
  ids.forEach(id => { const c = dcCarta(id); g.append(dcPintaCarta(c, { grande: true, al: () => { play('card'); r.mazo.push(c); dcGuarda(); DCC.siguiente(); } })); });
  s.append(g);
  const b = dcEl('button', 'btn-ghost ol', tr('PASAR · +15 nóminas')); b.onclick = () => { r.nominas += 15; dcGuarda(); DCC.siguiente(); }; s.append(b);
}
function dcEligeObjeto(ids, titulo) {
  const r = DCP.run, s = dcPanel(titulo), g = dcEl('div', 'dc-rejilla');
  ids.forEach(k => { const O = DC_OBJETOS[k], b = dcEl('button', 'dc-objeto dc-rar-' + O.rar); b.append(dcEl('b', '', tr(O.nombre)), dcEl('span', '', tr(O.texto))); b.onclick = () => { play('levelup'); r.objetos.push(k); dcGuarda(); DCC.siguiente(); }; g.append(b); });
  s.append(g);
}
// ---------- correos ----------
function dcPintaCorreo(E) {
  const r = DCP.run, s = dcPanel(tr('Correo interno'));
  const caja = dcEl('div', 'dc-correo'); caja.append(dcEl('h3', 'ol', tr(E.titulo)), dcEl('p', '', tr(E.texto))); s.append(caja);
  for (const o of E.opciones) {
    const b = dcEl('button', 'dc-opcion dc-riesgo-' + o.riesgo); b.append(dcEl('b', '', tr(o.texto)), dcEl('small', 'dc-riesgo', tr(o.riesgo === 'seguro' ? 'Seguro' : 'Arriesgado')), dcEl('span', '', tr(o.det)));
    b.onclick = () => dcAplicaCorreo(o.fx); s.append(b);
  }
}
function dcAplicaCorreo(fx) {
  const r = DCP.run, luego = () => { dcNodoResuelto(); dcPintaMapa(); };
  if (fx.nominas) r.nominas = Math.max(0, r.nominas + fx.nominas);
  if (fx.vidaMax) { r.hpMax += fx.vidaMax; r.hp += fx.vidaMax; }
  if (fx.vida) dcVida(fx.vida);
  if (fx.objeto) { const o = dcObjetoAlAzar(); if (o) { r.objetos.push(o); toast(tr('Objeto nuevo: {n}', { n: tr(DC_OBJETOS[o].nombre) }), true); } }
  if (fx.merienda && r.meriendas.length < 2) r.meriendas.push(pick(Object.keys(DC_MERIENDAS)));
  if (r.hp <= 0) { dcFinPartida(false); return dcPintaFin(false); }
  play('select');
  if (fx.carta === 'quitar') return dcVerCartas(tr('¿Qué carta quitas?'), r.mazo, c => { r.mazo.splice(r.mazo.indexOf(c), 1); luego(); });
  if (fx.carta === 'ascender') return dcVerCartas(tr('¿Qué carta asciendes?'), r.mazo.filter(c => !c.asc && DC_CARTAS[c.id].asc), c => { c.asc = true; luego(); });
  if (fx.carta === 'rara') r.mazo.push(dcCarta(dcCartaRara()));
  else if (fx.carta) r.mazo.push(dcCarta(fx.carta));
  luego();
}
// ---------- la pausa para el café ----------
function dcPintaPausa() {
  const r = DCP.run, s = dcPanel(tr('Pausa para el café')), luego = () => { dcNodoResuelto(); dcPintaMapa(); };
  s.append(dcEl('p', 'dc-nota', tr('Cinco minutos de paz en la cafetería. Elige una cosa.')));
  const cura = Math.round(r.hpMax * 0.3);
  const b1 = dcEl('button', 'dc-opcion dc-riesgo-seguro'); b1.append(dcEl('b', '', tr('Descansar')), dcEl('span', '', tr('Te curas {n}.', { n: cura }))); b1.onclick = () => { dcVida(cura); play('heal'); luego(); };
  const b2 = dcEl('button', 'dc-opcion dc-riesgo-seguro'); b2.append(dcEl('b', '', tr('Ascender una carta')), dcEl('span', '', tr('Becario → Junior: la carta mejora sus cifras.')));
  b2.onclick = () => dcVerCartas(tr('¿Qué carta asciendes?'), r.mazo.filter(c => !c.asc && DC_CARTAS[c.id].asc), c => { c.asc = true; play('levelup'); luego(); });
  s.append(b1, b2);
  if (!r.quitarUsado) { const b3 = dcEl('button', 'dc-opcion dc-riesgo-seguro'); b3.append(dcEl('b', '', tr('Quitar una carta')), dcEl('span', '', tr('Una vez por acto: una carta desaparece del mazo.'))); b3.onclick = () => dcVerCartas(tr('¿Qué carta quitas?'), r.mazo, c => { r.mazo.splice(r.mazo.indexOf(c), 1); r.quitarUsado = true; luego(); }); s.append(b3); }
}
// ---------- el Economato de Lola ----------
function dcPintaEconomato() {
  const r = DCP.run, n = dcNodoActual();
  if (!n.tienda) { n.tienda = { cartas: dcOferta(3).map(id => ({ id, precio: dcPrecioCarta(id) })), objeto: dcObjetoAlAzar(), merienda: pick(Object.keys(DC_MERIENDAS)) }; dcGuarda(); }
  const T = n.tienda, s = dcPanel(tr('Economato de Lola'));
  s.append(dcEl('p', 'dc-nota', tr('«Lo que ves es lo que hay. Y lo que hay, lo he sacado yo del almacén de Microblizz».')));
  const compra = (precio, fn) => { if (r.nominas < precio) { play('deny'); toast(tr('No tienes nóminas suficientes')); return; } r.nominas -= precio; play('levelup'); fn(); dcGuarda(); dcPintaEconomato(); };
  const g = dcEl('div', 'dc-rejilla dc-oferta');
  T.cartas.forEach(it => { if (it.vendida) return; const c = dcCarta(it.id), w = dcEl('div', 'dc-producto'); w.append(dcPintaCarta(c, { grande: true, al: () => compra(it.precio, () => { r.mazo.push(c); it.vendida = true; }) }), dcEl('b', 'dc-precio', fmt(it.precio))); g.append(w); });
  s.append(g);
  const fila = dcEl('div', 'dc-fila');
  if (T.objeto && !T.objetoVendido) { const O = DC_OBJETOS[T.objeto], b = dcEl('button', 'dc-objeto dc-rar-' + O.rar); b.append(dcEl('b', '', tr(O.nombre)), dcEl('span', '', tr(O.texto)), dcEl('b', 'dc-precio', '120')); b.onclick = () => compra(120, () => { r.objetos.push(T.objeto); T.objetoVendido = true; }); fila.append(b); }
  if (T.merienda && !T.meriendaVendida) { const M = DC_MERIENDAS[T.merienda], b = dcEl('button', 'dc-objeto dc-rar-common'); b.append(dcEl('b', '', tr(M.nombre)), dcEl('span', '', tr(M.texto)), dcEl('b', 'dc-precio', '35')); b.disabled = r.meriendas.length >= 2; b.onclick = () => compra(35, () => { r.meriendas.push(T.merienda); T.meriendaVendida = true; }); fila.append(b); }
  const q = dcEl('button', 'dc-objeto dc-rar-basic'); q.append(dcEl('b', '', tr('Quitar una carta')), dcEl('span', '', tr('Lola la pierde «sin querer» en el archivo.')), dcEl('b', 'dc-precio', fmt(r.quitarPrecio)));
  q.onclick = () => { if (r.nominas < r.quitarPrecio) { play('deny'); toast(tr('No tienes nóminas suficientes')); return; } dcVerCartas(tr('¿Qué carta quitas?'), r.mazo, c => { r.nominas -= r.quitarPrecio; r.quitarPrecio += 15; r.mazo.splice(r.mazo.indexOf(c), 1); play('levelup'); dcGuarda(); dcPintaEconomato(); }); };
  fila.append(q); s.append(fila);
  const b = dcEl('button', 'btn-big ol', tr('SALIR')); b.onclick = () => { dcNodoResuelto(); dcPintaMapa(); }; s.append(b);
}
// ---------- el final ----------
function dcPintaFin(victoria) {
  const s = dcPanel(tr(victoria ? '¡SURVIVALBOT, DESPEDIDO!' : 'DESPIDO FULMINANTE')), u = DCP.meta.ultima || {};
  s.append(dcEl('p', 'dc-nota', tr(victoria ? 'Has subido todo el organigrama de las Oficinas. El acto 2 llegará en la siguiente versión.' : 'Microblizz te ha echado del edificio. Lola dice que la puerta de atrás sigue abierta.')));
  s.append(dcEl('p', 'dc-nota', tr('Nodos: {n}', { n: u.nodos || 0 }) + ' · ' + tr('Reuniones ganadas: {n}', { n: u.reuniones || 0 }) + ' · ' + tr('Turnos: {n}', { n: u.turnos || 0 }) + ' · ' + tr('{n} min', { n: u.min || 0 })));
  s.append(dcEl('p', 'dc-nota dc-joke', tr(victoria ? 'Microblizz ha emitido un comunicado: SurvivalBot «ha decidido explorar nuevos retos». Phony le ha ofrecido una suscripción.' : 'Microblizz asegura que el despido fue «por motivos de rendimiento». Phony ha cobrado por la caja de cartón.')));
  const b = dcEl('button', 'btn-big ol', tr('A LA PORTADA')); b.onclick = () => dcPortada(); s.append(b);
}
// ---------- cómo se juega ----------
function dcComoSeJuega() {
  const v = dcVentana(tr('Cómo se juega'));
  const ul = dcEl('ol', 'steps');
  for (const t of ['Subes por el organigrama de Microblizz nodo a nodo. Arriba espera SurvivalBot.', 'En cada reunión robas 5 cartas y tienes 3 de CAOS. Jugar una carta cuesta su CAOS. Toca la carta; si hay varios rivales, toca después a quién.', 'Cada rival enseña encima lo que hará en su turno: ataque con su daño, defensa, cura, refuerzos o Spam.', 'El bloqueo para daño y desaparece al acabar tu turno. Fuerza suma al daño; Vulnerable recibe +50 %; Débil pega −25 %.', 'CrazyBunny pega +1 con cada tropa por cada tropa jugada antes en el turno. Su Salto del caos pega a todos cada 3 turnos.', 'A partir del turno 6 es la hora de cierre: CAOS doble y los rivales pegan un 50 % más. Acaba rápido.', 'Las nóminas se gastan en el Economato de Lola; la pausa para el café cura o asciende una carta. Se guarda solo en cada nodo.'])
    ul.append((() => { const li = dcEl('li'); li.append(dcEl('span', 'n', String(ul.children.length + 1)), dcEl('span', '', tr(t))); return li; })());
  v.append(ul); const b = dcEl('button', 'btn-ghost ol', tr('CERRAR')); b.onclick = dcCierraVentana; v.append(b);
}
