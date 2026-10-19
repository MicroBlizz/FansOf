// Fans Of Decks · Pantallas fuera de la reunión: la agenda del día, la recompensa, los correos, la pausa para el café, el Economato de Lola y el final.
'use strict';
function dcMuestra(id) {
  for (const s of document.querySelectorAll('.dc-pantalla')) { const ver = s.id === id; if (ver && s.hidden) { s.classList.remove('dc-entra'); void s.offsetWidth; s.classList.add('dc-entra'); } s.hidden = !ver; }
  dcCierraVentana();
}
// Lo que se lee bajo el título de cada cita de la agenda.
function dcSubtituloNodo(n) {
  if (n.sub) return tr(n.sub);
  if (n.tipo === 'elite') return tr('Reunión difícil');
  if (n.enc) return tr(n.enc.length === 1 ? '1 asistente' : '{n} asistentes', { n: n.enc.length });
  return tr({ correo: 'Correo interno', pausa: 'Cinco minutos de paz', economato: 'Lola vende de todo' }[n.tipo] || '');
}
// Un dato de la cabecera: icono dibujado y cifra.
function dcDato(icono, texto, cls) { const d = dcEl(cls && cls.includes('dc-dato-mazo') ? 'button' : 'span', 'dc-dato ' + (cls || '')); d.append(dcSvg(icono), dcEl('span', '', texto)); return d; }

// ---------- cabecera común: vida, bonus, mazo ----------
function dcCabecera(titulo, volver) {
  const r = DCP.run, h = dcEl('header', 'dc-cab');
  if (volver) { const b = dcEl('button', 'dc-volver'); b.append(dcSvg('atras')); b.setAttribute('aria-label', tr('Volver')); b.onclick = volver; h.append(b); }
  h.append(dcEl('h2', 'ol', titulo));
  const d = dcEl('div', 'dc-datos');
  const nom = dcDato('nominas', fmt(r.nominas), 'dc-dato-nom'); nom.title = tr('Bonus de productividad: dinero extra para gastar en el Economato'); nom.onclick = () => toast(nom.title);
  d.append(dcDato('vida', r.hp + '/' + r.hpMax, 'dc-dato-vida'), nom);
  const m = dcDato('mazo', String(r.mazo.length), 'dc-dato-mazo'); m.title = tr('Tu mazo'); m.onclick = () => dcVerCartas(tr('Tu mazo'), r.mazo); d.append(m);
  h.append(d); return h;
}
// ---------- la agenda del día: cada hora, varias reuniones; se va a una ----------
function dcPintaMapa() {
  const r = DCP.run, m = r.mapa, s = document.getElementById('dc-mapa');
  s.textContent = ''; dcMuestra('dc-mapa');
  s.append(dcCabecera(tr('Agenda del día'), () => dcPortada()));
  const ag = dcEl('div', 'dc-agenda');
  const A = dcActo(), D = dcDia(), cab = dcEl('div', 'dc-agenda-cab'); cab.append(dcEl('b', '', tr(D.dia) + ' · ' + tr(A.titulo)), dcEl('span', '', dcRango())); ag.append(cab);
  ag.append(dcSemana());
  const sig = m.piso + 1;
  m.pisos.forEach((piso, p) => {
    const estado = p < m.piso ? 'pasada' : p === m.piso ? 'actual' : p === sig ? 'siguiente' : 'futura';
    const fila = dcEl('div', 'dc-hora dc-hora-' + estado);
    const eti = dcEl('div', 'dc-hora-eti'); eti.append(dcEl('b', '', DC_HORAS[p]), dcEl('small', '', tr({ pasada: 'Hecho', actual: 'Ahora', siguiente: 'Elige', futura: 'Más tarde' }[estado])));
    const citas = dcEl('div', 'dc-citas');
    // la cita elegida va la primera: se lee la hora y debajo lo que se dejó de lado
    const eleg = dcElegidoEn(p), orden = piso.map((n, k) => k); if (eleg >= 0) { orden.splice(orden.indexOf(eleg), 1); orden.unshift(eleg); }
    orden.forEach(k => {
      const n = piso[k], posible = estado === 'siguiente', elegida = k === eleg;
      const b = dcEl('button', 'dc-cita dc-cita-' + n.tipo + (posible ? ' dc-posible' : '') + (elegida ? (estado === 'actual' ? ' dc-actual' : ' dc-hecha') : '') + (p <= m.piso && !elegida ? ' dc-saltada' : '') + (estado === 'futura' ? ' dc-futura' : ''));
      const ic = dcEl('span', 'dc-cita-ic'); ic.append(dcSvg(DC_ICONO_NODO[n.tipo]));
      const txt = dcEl('span', 'dc-cita-txt'); txt.append(dcEl('b', '', dcTituloNodo(n)), dcEl('small', '', tr(n.sala) + ' · ' + dcSubtituloNodo(n)));
      b.append(ic, txt);
      if (n.enc) { const g = dcEl('span', 'dc-cita-gente'); for (const id of n.enc.slice(0, 3)) { const D = DC_RIVALES[id]; if (D) g.append(dcSprite(D.arte, 30)); } b.append(g); }
      if (elegida && estado === 'pasada') { const ok = dcEl('span', 'dc-cita-ok'); ok.append(dcSvg('check')); b.append(ok); }
      b.disabled = !posible; b.onclick = () => { play('select'); dcIrA(p, k); dcResuelveNodo(); };
      citas.append(b);
    });
    fila.append(eti, citas); ag.append(fila);
    if (DC_HORAS[p] === '13:00') { const com = dcEl('div', 'dc-hora dc-hora-comida'); const e2 = dcEl('div', 'dc-hora-eti'); e2.append(dcEl('b', '', '14:00')); const c2 = dcEl('div', 'dc-comida'); c2.append(dcSvg('merienda'), dcEl('span', '', tr('Comida') + ' · ' + tr('Sin reuniones. Milagro.'))); com.append(e2, c2); ag.append(com); }
  });
  s.append(ag);
  const pie = dcEl('div', 'dc-pie');
  const objs = dcEl('div', 'dc-objetos'); for (const k of r.objetos) { const o = dcEl('span', 'dc-chip dc-chip-' + DC_OBJETOS[k].rar, tr(DC_OBJETOS[k].nombre)); o.title = tr(DC_OBJETOS[k].texto); o.onclick = () => toast(tr(DC_OBJETOS[k].texto)); objs.append(o); }
  for (const k of r.meriendas) { const o = dcEl('span', 'dc-chip dc-chip-merienda', tr(DC_MERIENDAS[k].nombre)); o.title = tr(DC_MERIENDAS[k].texto); objs.append(o); }
  if (dcVentaja()) { const o = dcEl('span', 'dc-chip dc-chip-ventaja', tr(dcVentaja().nombre)); o.title = tr(dcVentaja().texto); o.onclick = () => toast(tr(dcVentaja().texto)); objs.prepend(o); }
  pie.append(objs, dcEl('p', 'dc-nota', tr(m.piso < 0 ? 'Cada hora eliges a qué reunión vas. A las 17:00: {b}.' : 'Elige la reunión de las {h}.', { b: dcNombreRival(D.fin), h: DC_HORAS[sig] || '17:00' })));
  s.append(pie);
  requestAnimationFrame(() => { const a = s.querySelector('.dc-hora-siguiente'); if (a && a.scrollIntoView) a.scrollIntoView({ block: 'center' }); });
}
// Lo que toca hacer en el nodo actual (también al volver a abrir el juego con un nodo pendiente).
function dcResuelveNodo() {
  const n = dcNodoActual(), r = DCP.run;
  if (r.pendiente === 'dia') return dcPintaDia();
  if (!n || !r.pendiente) return dcPintaMapa();
  if (n.enc) return dcEmpiezaReunion(n.enc, n.tipo, dcFinReunion);
  if (n.tipo === 'correo') return dcPintaCorreo(dcBuscaCorreo(n.correo));
  if (n.tipo === 'pausa') return dcPintaPausa();
  if (n.tipo === 'economato') return dcPintaEconomato();
  dcNodoResuelto(); dcPintaMapa();
}
// ---------- la recompensa ----------
function dcFinReunion(resultado, C) {
  const r = DCP.run, n = dcNodoActual();
  if (resultado === 'derrota') { play('lose'); dcFinPartida(false); return dcPintaFin(false); }
  play('win');
  const [a, b] = DC_NOMINAS[n.tipo]; const nom = a + Math.round(Math.random() * (b - a)) + (dcVentaja() && dcVentaja().nominas ? dcVentaja().nominas : 0); r.nominas += nom;
  const s = dcPanel(tr(n.tipo === 'jefe' ? '¡Despacho conquistado!' : n.tipo === 'minijefe' ? '¡Día superado!' : '¡Reunión ganada!'), n.tipo);
  s.append(dcTarjetaResultado(dcTituloNodo(n), tr(n.sala), [['nominas', '+' + nom, tr('bonus')], ['reloj', String(C.turno), tr('turnos')], ['vida', r.hp + '/' + r.hpMax, tr('vida')]]));
  const pasos = [];
  const ultimo = n.tipo === 'jefe' && dcEsUltimoActo(), finCap = n.tipo === 'jefe' && dcFinDeCapitulo();   // tras el último CEO no hay más premios; tras cualquier CEO, tampoco oferta de empleo
  if (n.tipo === 'jefe' && !ultimo) pasos.push(() => dcEligeObjeto(['zanahoriaoro', 'cofre'], tr('Un objeto legendario del despacho')));
  else if (n.tipo === 'elite') { const o = dcObjetoAlAzar(); if (o) pasos.push(() => dcEligeObjeto([o], tr('Alguien se ha dejado esto en la sala'))); }
  if (!finCap) pasos.push(() => dcOfertaEmpleo(n.tipo === 'jefe' ? 'legendaria' : n.tipo === 'minijefe' ? 'rara' : null));
  const sig = () => { const p = pasos.shift(); if (p) p(); else if (n.tipo === 'minijefe') dcFinDia(); else if (n.tipo === 'jefe') dcFinActo(); else { dcNodoResuelto(); dcPintaMapa(); } };
  DCC.siguiente = sig;
  const bt = dcEl('button', 'btn-big ol', tr('SEGUIR')); bt.onclick = sig; s.append(bt);
}
// La tarjeta de resultado: el líder, el título de la cita y las cifras en fichas.
function dcTarjetaResultado(titulo, sub, fichas, derrota) {
  const t = dcEl('div', 'dc-resultado' + (derrota ? ' dc-resultado-mal' : ''));
  const a = dcEl('div', 'dc-resultado-arte'); a.append(dcSprite('bunny', 120)); t.append(a);
  t.append(dcEl('h3', 'ol', titulo)); if (sub) t.append(dcEl('small', 'dc-resultado-sub', sub));
  const g = dcEl('div', 'dc-premios'); for (const [icono, valor, eti] of fichas) { const c = dcEl('div', 'dc-premio'); c.append(dcSvg(icono), dcEl('b', '', valor), dcEl('small', '', eti)); g.append(c); }
  t.append(g); return t;
}
function dcPanel(titulo, fondo) { const s = document.getElementById('dc-panel'); s.textContent = ''; dcMuestra('dc-panel'); dcPonFondo(s, fondo || null); if (DCP.run) s.append(dcCabecera(titulo)); else s.append(dcEl('h2', 'ol', titulo)); return s; }
function dcOfertaEmpleo(premio) {
  const r = DCP.run, n = dcNodoActual(), s = dcPanel(tr('Oferta de empleo'), n && n.tipo);
  s.append(dcEl('p', 'dc-nota', tr('Elige una carta para tu mazo, o pasa y cobra un bonus de 15.')));
  const g = dcEl('div', 'dc-rejilla dc-oferta');
  const ids = dcOferta(3 + (dcObjeto('llavero') ? dcObjeto('llavero').oferta : 0)); if (premio === 'legendaria') ids[0] = DC_LEGENDARIAS[(Math.random() * DC_LEGENDARIAS.length) | 0]; else if (premio === 'rara') ids[0] = dcCartaRara();
  ids.forEach(id => { const c = dcCarta(id); g.append(dcPintaCarta(c, { grande: true, al: () => { play('card'); r.mazo.push(c); dcGuarda(); DCC.siguiente(); } })); });
  s.append(g);
  const b = dcEl('button', 'btn-ghost ol', tr('PASAR · +15 de bonus')); b.onclick = () => { r.nominas += 15; dcGuarda(); DCC.siguiente(); }; s.append(b);
}
function dcEligeObjeto(ids, titulo) {
  const r = DCP.run, n = dcNodoActual(), s = dcPanel(titulo, n && n.tipo), g = dcEl('div', 'dc-rejilla');
  ids.forEach(k => { dcDescubre('o', k); const O = DC_OBJETOS[k], b = dcEl('button', 'dc-objeto dc-rar-' + O.rar); b.append(dcEl('b', '', tr(O.nombre)), dcEl('span', '', tr(O.texto))); b.onclick = () => { play('levelup'); r.objetos.push(k); dcGuarda(); DCC.siguiente(); }; g.append(b); });
  s.append(g);
}
// ---------- la ventaja fiscal: se elige una al empezar la partida ----------
function dcEligeVentaja(alElegir) {
  const s = dcPanel(tr('Ventaja fiscal'));
  s.append(dcEl('p', 'dc-nota', tr('Elige una ventaja para toda la partida. Jugando se desbloquean las demás.')));
  for (const k in DC_VENTAJAS) {
    const V = DC_VENTAJAS[k], abierta = dcVentajaAbierta(k), b = dcEl('button', 'dc-opcion dc-ventaja' + (abierta ? '' : ' dc-cerrada'));
    b.append(dcEl('b', '', tr(V.nombre)), dcEl('small', 'dc-riesgo', abierta ? tr('Desbloqueada') : tr('Se desbloquea: {h}', { h: dcTextoHito(k) })), dcEl('span', '', tr(V.texto)));
    b.disabled = !abierta; b.onclick = () => { play('levelup'); alElegir(k); }; s.append(b);
  }
  const n = dcEl('button', 'btn-ghost ol', tr('SIN VENTAJA')); n.onclick = () => alElegir(null); s.append(n);
}
// ---------- correos ----------
function dcPintaCorreo(E) {
  const r = DCP.run, s = dcPanel(tr('Correo interno'), 'correo');
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
  if (fx.suscripcion) { r.suscripcion = { cuota: 6, cura: 8 }; toast(tr('Suscrito al Plan Bienestar'), true); }
  if (fx.perderAzar && r.mazo.length > 5) r.mazo.splice((Math.random() * r.mazo.length) | 0, 1);
  if (fx.duplicaAzar && r.mazo.length) { const c = pick(r.mazo); r.mazo.push(Object.assign({}, c)); toast(tr('Un clon gris de {c} entra en tu mazo', { c: dcNombre(c) }), true); }
  if (fx.ascensoAzar) { const c = pick(r.mazo.filter(x => !x.asc && DC_CARTAS[x.id].asc)); if (c) { c.asc = true; toast(tr('{c} asciende', { c: dcNombre(c) }), true); } }
  if (r.hp <= 0) { dcFinPartida(false); return dcPintaFin(false); }
  play('select');
  if (fx.carta === 'quitar') return dcVerCartas(tr('¿Qué carta quitas?'), r.mazo, c => { r.mazo.splice(r.mazo.indexOf(c), 1); luego(); });
  if (fx.carta === 'ascender') return dcEligeAscenso(() => luego());
  if (fx.carta === 'rara') r.mazo.push(dcCarta(dcCartaRara()));
  else if (fx.carta) r.mazo.push(dcCarta(fx.carta));
  luego();
}
// ---------- la pausa para el café ----------
function dcPintaPausa() {
  const r = DCP.run, P = dcCap().pausa || {}, s = dcPanel(tr(P.titulo || 'Pausa para el café'), 'pausa'), luego = () => { dcNodoResuelto(); dcPintaMapa(); };
  s.append(dcEl('p', 'dc-nota', tr(P.nota || 'Cinco minutos de paz en la cafetería. Elige una cosa.')));
  const cura = Math.round(r.hpMax * 0.3);
  const b1 = dcEl('button', 'dc-opcion dc-riesgo-seguro'); b1.append(dcEl('b', '', tr('Descansar')), dcEl('span', '', tr('Te curas {n}.', { n: cura }))); b1.onclick = () => { dcVida(cura); play('heal'); luego(); };
  const b2 = dcEl('button', 'dc-opcion dc-riesgo-seguro'); b2.append(dcEl('b', '', tr('Ascender una carta')), dcEl('span', '', tr('Becario → Junior: la carta mejora sus cifras.')));
  b2.onclick = () => dcEligeAscenso(() => { play('levelup'); luego(); });
  s.append(b1, b2);
  if (!r.quitarUsado) { const b3 = dcEl('button', 'dc-opcion dc-riesgo-seguro'); b3.append(dcEl('b', '', tr('Quitar una carta')), dcEl('span', '', tr('Una vez por jornada: una carta desaparece del mazo.'))); b3.onclick = () => dcVerCartas(tr('¿Qué carta quitas?'), r.mazo, c => { r.mazo.splice(r.mazo.indexOf(c), 1); r.quitarUsado = true; luego(); }); s.append(b3); }
}
// ---------- el Economato de Lola ----------
function dcPintaEconomato() {
  const r = DCP.run, n = dcNodoActual();
  if (!n.tienda) {
    n.tienda = { cartas: dcOferta(3).map(id => ({ id, precio: dcPrecioCarta(id) })), objeto: dcObjetoAlAzar(), merienda: pick(Object.keys(DC_MERIENDAS)) };
    if ((dcCap().tienda || {}).dlc) { const id = dcCartaRara(); n.tienda.cartas[0] = { id, precio: Math.round(dcPrecioCarta(id) * 1.5), dlc: true }; }   // en la tienda de Phony, una carta «DLC»: más cara
    dcGuarda();
  }
  const T = n.tienda, TC = dcCap().tienda || {}, s = dcPanel(tr(TC.titulo || 'Economato de Lola'), 'economato'), desc = x => Math.round(x * (1 - (dcVentaja() && dcVentaja().descuento ? dcVentaja().descuento : 0)));
  s.append(dcEl('p', 'dc-nota', tr(TC.nota || '«Lo que ves es lo que hay. Y lo que hay, lo he sacado yo del almacén de Microblizz».')));
  const compra = (precio, fn) => { if (r.nominas < precio) { play('deny'); toast(tr('No tienes bonus suficiente')); return; } r.nominas -= precio; play('levelup'); fn(); dcGuarda(); dcPintaEconomato(); };
  const g = dcEl('div', 'dc-rejilla dc-oferta');
  T.cartas.forEach(it => { if (it.vendida) return; const c = dcCarta(it.id), w = dcEl('div', 'dc-producto'); w.append(dcPintaCarta(c, { grande: true, al: () => compra(desc(it.precio), () => { r.mazo.push(c); it.vendida = true; }) }), dcEl('b', 'dc-precio', fmt(desc(it.precio))));
    if (it.dlc) w.prepend(dcEl('small', 'dc-dlc', tr('DLC'))); g.append(w); });
  s.append(g);
  const fila = dcEl('div', 'dc-fila');
  if (T.objeto) dcDescubre('o', T.objeto); if (T.merienda) dcDescubre('o', 'm:' + T.merienda);
  if (T.objeto && !T.objetoVendido) { const O = DC_OBJETOS[T.objeto], b = dcEl('button', 'dc-objeto dc-rar-' + O.rar); b.append(dcEl('b', '', tr(O.nombre)), dcEl('span', '', tr(O.texto)), dcEl('b', 'dc-precio', String(desc(120)))); b.onclick = () => compra(desc(120), () => { r.objetos.push(T.objeto); T.objetoVendido = true; }); fila.append(b); }
  if (T.merienda && !T.meriendaVendida) { const M = DC_MERIENDAS[T.merienda], b = dcEl('button', 'dc-objeto dc-rar-common'); b.append(dcEl('b', '', tr(M.nombre)), dcEl('span', '', tr(M.texto)), dcEl('b', 'dc-precio', String(desc(35)))); b.disabled = r.meriendas.length >= 2; b.onclick = () => compra(desc(35), () => { r.meriendas.push(T.merienda); T.meriendaVendida = true; }); fila.append(b); }
  const q = dcEl('button', 'dc-objeto dc-rar-basic'); q.append(dcEl('b', '', tr('Quitar una carta')), dcEl('span', '', tr('Lola la pierde «sin querer» en el archivo.')), dcEl('b', 'dc-precio', fmt(desc(r.quitarPrecio))));
  q.onclick = () => { if (r.nominas < desc(r.quitarPrecio)) { play('deny'); toast(tr('No tienes bonus suficiente')); return; } dcVerCartas(tr('¿Qué carta quitas?'), r.mazo, c => { r.nominas -= desc(r.quitarPrecio); r.quitarPrecio += 15; r.mazo.splice(r.mazo.indexOf(c), 1); play('levelup'); dcGuarda(); dcPintaEconomato(); }); };
  fila.append(q); s.append(fila);
  const b = dcEl('button', 'btn-big ol', tr('SALIR')); b.onclick = () => { dcNodoResuelto(); dcPintaMapa(); }; s.append(b);
}
// ---------- el final ----------
function dcPintaFin(victoria) {
  const u = DCP.meta.ultima || {}, CP = DC_CAPITULOS[u.cap || 0], F = CP.final || { titulo: '¡CAMPAÑA SUPERADA!', carta: 'Campaña completada', texto: 'Has llegado hasta el final de lo que hay por ahora.', joke: 'Phony ha enviado una factura por el viaje.' };
  const s = dcPanel(tr(victoria ? F.titulo : 'DESPIDO FULMINANTE'), victoria ? 'jefe' : 'correo');
  s.append(dcTarjetaResultado(tr(victoria ? F.carta : 'Jornada truncada'), tr(CP.lugar), [['reunion', String(u.dias || 0), tr('días')], ['elite', String(u.nodos || 0), tr('citas')], ['ataque', String(u.reuniones || 0), tr('ganadas')], ['reloj', String(u.turnos || 0), tr('turnos')], ['pausa', String(u.min || 0), tr('min')]], !victoria));
  s.append(dcEl('p', 'dc-nota', tr(victoria ? F.texto : 'Microblizz te ha echado del edificio. Lola dice que la puerta de atrás sigue abierta.')));
  s.append(dcEl('p', 'dc-nota dc-joke', tr(victoria ? F.joke : 'Microblizz asegura que el despido fue «por motivos de rendimiento». Phony ha cobrado por la caja de cartón.')));
  const b = dcEl('button', 'btn-big ol', tr('A LA PORTADA')); b.onclick = () => dcPortada(); s.append(b);
}
// ---------- cómo se juega ----------
function dcComoSeJuega() {
  const v = dcVentana(tr('Cómo se juega'));
  const ul = dcEl('ol', 'steps');
  for (const t of ['Tu semana en Microblizz son días de agenda llena de reuniones: cada hora eliges a cuál vas y a las 17:00 te espera el minijefe del día. Cinco días, un ascenso y el jefe de departamento; después, otra semana que acaba ante el CEO.', 'En cada reunión robas 5 cartas y tienes 3 de CAOS. Jugar una carta cuesta su CAOS. Tócala dos veces o arrástrala hasta el rival; las de área se sueltan en cualquier sitio de la zona de rivales. Un solo toque solo la marca (y, si pide objetivo, tocas después a quién). Mantenla pulsada para leerla en grande.', 'Cada rival enseña encima lo que hará en su turno: ataque con su daño, defensa, cura, refuerzos o Spam.', 'El bloqueo para daño y desaparece al acabar tu turno. Fuerza suma al daño; Vulnerable recibe +50 %; Débil pega −25 %.', 'CrazyBunny es de los Animales Locos y lleva su pasiva, Racha salvaje: cada carta que juegas suma +1 al daño, el bloqueo o la cura de la siguiente de su mismo tipo en ese turno (hasta +5). Su Salto del caos se carga con el CAOS que gastas en cartas y sale gratis: pega a todos los rivales.', 'A partir del turno 6 es la hora de cierre: CAOS doble y los rivales pegan un 50 % más. Acaba rápido.', 'El bonus de productividad es el dinero extra que cobras al ganar reuniones y se gasta en el Economato de Lola; la pausa para el café cura o asciende una carta. Se guarda solo en cada cita.', 'Jugando desbloqueas Ventajas fiscales: al empezar una partida eliges una y vale hasta el final.'])
    ul.append((() => { const li = dcEl('li'); li.append(dcEl('span', 'n', String(ul.children.length + 1)), dcEl('span', '', tr(t))); return li; })());
  v.append(ul); const b = dcEl('button', 'btn-ghost ol', tr('CERRAR')); b.onclick = dcCierraVentana; v.append(b);
}
