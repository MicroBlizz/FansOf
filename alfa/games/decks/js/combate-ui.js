// Fans Of Decks · La reunión en pantalla: rivales con su intención arriba, el líder en medio, la franja de CAOS y la mano en abanico abajo. Pinta el estado C de combate.js.
// Toques: con un rival, tocar la carta la juega; con varios, tocar la carta y luego el rival. Mantener pulsada una carta enseña su texto grande.
// Lo que se mueve: la carta jugada vuela al centro, las cifras de daño flotan sobre quien las recibe (C.eventos), el golpeado tiembla y cada turno entra con su rótulo.
'use strict';
const DCC = { C: null, alFin: null, elegida: null, turnoVisto: 0, fondo: null, ocupado: 0 };
// Los tipos de carta (nombres de Arkioner, 18-10-2026): Empleado (sale, pega y vuelve), Tarea (efecto inmediato), Trámite (lo puntual del líder: bloqueo, robar, curar),
// Directiva (poder que dura la reunión), Cláusula (estorba) y Spam (basura del rival). Para la fase 1: Compañero (se queda varios turnos) y Protocolo (reacción armada).
const DC_NOMBRE_TIPO = { empleado: 'Empleado', tarea: 'Tarea', tramite: 'Trámite', directiva: 'Directiva', companero: 'Compañero', protocolo: 'Protocolo', clausula: 'Cláusula', spam: 'Spam' };
const DC_NOTA_TIPO = { empleado: 'Empleado: sale, hace su trabajo y vuelve al mazo.', tarea: 'Tarea: efecto inmediato.', tramite: 'Trámite: algo puntual de tu líder, como bloquear, robar o curarse.', directiva: 'Directiva: un poder que dura toda la reunión.', companero: 'Compañero: se queda en la mesa unos turnos y actúa solo al acabar cada turno tuyo.', protocolo: 'Protocolo: se deja armado y salta solo cuando un rival hace lo que anuncia.', clausula: 'Cláusula: una carta que estorba. Se quita en el Economato.', spam: 'Spam: basura del rival. Se tira al acabar el turno.' };
const dcEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };

function dcEmpiezaReunion(encuentro, tramo, alFin) {
  DCC.C = dcCombateNuevo(encuentro, tramo); DCC.alFin = alFin; DCC.elegida = null; DCC.turnoVisto = 0; DCC.fondo = tramo;
  DCC.C.eventos.length = 0;
  dcMuestra('dc-combate'); dcPintaCombate();
}
function dcBarraVida(hp, max, bloqueo) {
  const b = dcEl('div', 'dc-vida'); const f = dcEl('i'); f.style.width = Math.round(100 * hp / max) + '%'; if (hp / max < 0.3) f.classList.add('dc-vida-baja');
  b.append(f, dcEl('span', '', hp + ' / ' + max));
  if (bloqueo) { const bl = dcEl('b', 'dc-bloqueo'); bl.append(dcSvg('defensa'), dcEl('span', '', String(bloqueo))); bl.title = tr('Bloqueo: para {n} de daño este turno', { n: bloqueo }); b.append(bl); }
  return b;
}
function dcEstado(cls, icono, texto) { const e = dcEl('span', 'dc-est ' + cls); e.append(dcSvg(icono), dcEl('span', '', texto)); return e; }
function dcEstados(o) {
  const e = dcEl('div', 'dc-estados');
  if (o.fuerza) e.append(dcEstado('dc-est-fuerza', 'fuerza', tr('Fuerza') + ' ' + o.fuerza));
  if (o.vulnerable) e.append(dcEstado('dc-est-vul', 'ataque', tr('Vulnerable') + ' ' + o.vulnerable));
  if (o.debil) e.append(dcEstado('dc-est-deb', 'debil', tr('Débil') + ' ' + o.debil));
  if (o.aturdido) e.append(dcEstado('dc-est-atu', 'aturdido', tr('Aturdido')));
  return e;
}
function dcPintaRival(C, r, i) {
  const D = DC_RIVALES[r.id];
  const d = dcEl('div', 'dc-rival' + (D.jefe ? ' dc-rival-jefe' : D.elite ? ' dc-rival-elite' : '') + (r.hp <= 0 ? ' dc-ko' : '') + (DCC.elegida !== null && r.hp > 0 ? ' dc-elige' : ''));
  d.dataset.rival = i;
  const j = r.jug, tipo = dcTipoJugada(j), I = DC_INTENCION[tipo];
  const it = dcEl('div', 'dc-intencion dc-int-' + tipo); it.style.setProperty('--ic', I[1]);
  let txt = ''; if (tipo === 'ataque') txt = dcDanoRival(C, r) + (j.n > 1 ? ' ×' + j.n : ''); else if (tipo === 'defensa') txt = String(j.b); else if (tipo === 'cura') txt = '+' + j.c; else if (tipo === 'refuerzo') txt = '+' + (j.refN || 1); else if (tipo === 'spam') txt = String(j.spam || 1);
  it.append(dcSvg(r.aturdido ? 'aturdido' : tipo)); if (txt && !r.aturdido) it.append(dcEl('span', '', txt));
  it.title = tr(r.aturdido ? 'Pierde el turno' : I[2]);
  const arte = dcEl('div', 'dc-rival-arte'); arte.append(dcSprite(D.arte, D.alto || (D.jefe ? 110 : D.elite ? 92 : 72)));
  d.append(it, arte, dcEl('b', 'dc-nombre', r.nombre), dcBarraVida(r.hp, r.hpMax, r.bloqueo), dcEstados(r));
  d.onclick = () => { if (DCC.elegida !== null && r.hp > 0) { const k = DCC.elegida; DCC.elegida = null; dcAnimaCarta(k); dcJugar(C, k, i); play('card'); dcTrasJugada(); } };
  return d;
}
// Los compañeros sentados en la mesa (con los turnos que les quedan) y los protocolos armados.
function dcPintaEquipo(C) {
  const e = dcEl('div', 'dc-equipo');
  for (const k of C.companeros) { const D = DC_CARTAS[k.id], d = dcEl('span', 'dc-comp'); d.append(dcSprite(D.arte, 34), dcEl('b', '', String(k.turnos))); d.title = tr(D.nombre) + ': ' + dcTextoCarta({ id: k.id, asc: k.asc }); e.append(d); }
  for (const k of C.protocolos) { const D = DC_CARTAS[k.id], d = dcEl('span', 'dc-prot'); d.append(dcSvg('defensa'), dcEl('span', '', tr(D.nombre))); d.title = dcTextoCarta({ id: k.id, asc: k.asc }); e.append(d); }
  return e;
}
function dcPintaCombate() {
  const C = DCC.C, r = DCP.run, L = DC_LIDERES[r.lider], s = document.getElementById('dc-combate');
  s.textContent = ''; s.classList.toggle('dc-cierre-on', C.turno >= C.cierre); dcPonFondo(s, DCC.fondo);
  // arriba: turno y hora de cierre
  const cab = dcEl('div', 'dc-cabecera');
  const t1 = dcEl('span', 'dc-turno'); t1.append(dcSvg('reloj'), dcEl('span', '', tr('Turno {n}', { n: C.turno })));
  const t2 = dcEl('span', C.turno >= C.cierre ? 'dc-cierre' : 'dc-cierre-aviso', C.turno >= C.cierre ? tr('HORA DE CIERRE') : tr('Cierre en el turno {n}', { n: C.cierre }));
  cab.append(t1, t2);
  // los rivales
  const top = dcEl('div', 'dc-rivales' + (C.rivales.filter(x => x.hp > 0).length > 2 ? ' dc-rivales-muchos' : '')); C.rivales.forEach((rv, i) => top.append(dcPintaRival(C, rv, i)));
  // en medio: el líder
  const med = dcEl('div', 'dc-lider');
  const lsp = dcEl('div', 'dc-lider-arte'); lsp.append(dcSprite('bunny', 92));
  const inf = dcEl('div', 'dc-lider-info');
  inf.append(dcEl('b', 'dc-nombre', tr(L.nombre)), dcBarraVida(r.hp, r.hpMax, C.bloqueo), dcEstados(C));
  if (C.companeros.length || C.protocolos.length) inf.append(dcPintaEquipo(C));
  const objs = dcEl('div', 'dc-objetos'); for (const k of r.objetos) { const o = dcEl('span', 'dc-chip dc-chip-' + DC_OBJETOS[k].rar, tr(DC_OBJETOS[k].nombre)); o.title = tr(DC_OBJETOS[k].texto); objs.append(o); }
  if (r.objetos.length) inf.append(objs);
  med.append(lsp, inf);
  // acciones: la jugada del líder y las meriendas
  const acc = dcEl('div', 'dc-acciones');
  const listo = C.saltoCarga >= C.salto.carga, salto = dcEl('button', 'dc-boton dc-salto' + (listo ? ' dc-salto-listo' : ''));
  salto.style.setProperty('--carga', Math.min(1, C.saltoCarga / C.salto.carga)); salto.append(dcSvg('salto'), dcEl('span', '', tr(C.salto.nombre)), dcEl('small', '', listo ? tr('¡Gratis!') : Math.min(C.saltoCarga, C.salto.carga) + '/' + C.salto.carga + ' CAOS'));
  salto.disabled = C.fase !== 'jugador' || !listo; salto.title = tr(C.salto.texto, C.salto);
  salto.onclick = () => { if (dcUsaSalto(C)) { play('zap'); dcTrasJugada(); } };
  acc.append(salto);
  r.meriendas.forEach((k, i) => { const b = dcEl('button', 'dc-boton dc-merienda'); b.append(dcSvg('merienda'), dcEl('span', '', tr(DC_MERIENDAS[k].nombre))); b.title = tr(DC_MERIENDAS[k].texto); b.disabled = C.fase !== 'jugador'; b.onclick = () => { if (dcUsaMerienda(C, i)) { play('heal'); dcTrasJugada(); } }; acc.append(b); });
  const log = dcEl('div', 'dc-log', C.log.slice(-2).join(' · '));
  // la franja: CAOS, pilas y fin de turno
  const franja = dcEl('div', 'dc-franja');
  const caos = dcEl('div', 'dc-caos' + (C.caos === 0 ? ' dc-caos-vacio' : '')); caos.append(dcEl('b', '', String(C.caos)), dcEl('small', '', 'CAOS'));
  const pilas = dcEl('div', 'dc-pilas');
  const bp = dcEl('button', 'dc-pila'); bp.append(dcSvg('mazo'), dcEl('span', '', String(C.pila.length))); bp.title = tr('Mazo'); bp.onclick = () => dcVerCartas(tr('Mazo (sin orden)'), shuffle(C.pila.slice()));
  const bd = dcEl('button', 'dc-pila dc-pila-desc'); bd.append(dcSvg('mazo'), dcEl('span', '', String(C.descartes.length))); bd.title = tr('Descartes'); bd.onclick = () => dcVerCartas(tr('Descartes'), C.descartes);
  pilas.append(bp, bd);
  const fin = dcEl('button', 'dc-boton dc-fin', tr('FIN DE TURNO')); fin.disabled = C.fase !== 'jugador';
  fin.onclick = () => { DCC.elegida = null; play('select'); dcFinTurno(C); dcTrasJugada(); };
  franja.append(caos, fin, pilas);
  // la mano, en abanico
  const mano = dcEl('div', 'dc-mano'); const n = C.mano.length, ancho = Math.max(300, s.clientWidth - 16), wc = ancho < 400 ? 84 : ancho < 500 ? 96 : 104;
  mano.style.setProperty('--wc', wc + 'px'); mano.style.setProperty('--sol', n > 1 ? Math.max(0, (n * wc + (n - 1) * 6 - ancho) / (n - 1)).toFixed(1) + 'px' : '0px');
  C.mano.forEach((c, i) => {
    const el = dcPintaCarta(c, { enMano: true, jugable: dcPuedeJugar(C, c), elegida: DCC.elegida === i, al: () => dcTocaCarta(i) });
    const k = i - (n - 1) / 2; el.style.setProperty('--rot', (k * 3.5) + 'deg'); el.style.setProperty('--ty', (Math.abs(k) * 5) + 'px'); el.dataset.mano = i;
    mano.append(el);
  });
  const aviso = dcEl('div', 'dc-aviso', DCC.elegida !== null ? tr('¿A quién? Toca un rival') : '');
  s.append(cab, top, med, acc, log, franja, aviso, mano);
  if (DCC.elegida !== null) s.onclick = ev => { if (!ev.target.closest('.dc-rival, .dc-carta')) { DCC.elegida = null; dcPintaCombate(); } }; else s.onclick = null;
  // lo que pasó desde el último dibujo se anima en orden; mientras los rivales actúan no se toca nada
  const dur = dcPintaEventos(C);
  if (dur) { s.classList.add('dc-ocupado'); const mio = ++DCC.ocupado; setTimeout(() => { if (DCC.ocupado === mio) s.classList.remove('dc-ocupado'); }, dur); }
  if (C.turno !== DCC.turnoVisto) { DCC.turnoVisto = C.turno; const t = C.turno; setTimeout(() => { if (DCC.C === C) dcRotulo(t >= C.cierre ? tr('HORA DE CIERRE') : tr('Turno {n}', { n: t }), t >= C.cierre); }, Math.max(0, dur - 350)); }
  return dur;
}
// Un rótulo que cruza la pantalla (turno nuevo, hora de cierre).
function dcRotulo(texto, alarma) {
  const s = document.getElementById('dc-combate'), viejo = s.querySelector('.dc-rotulo'); if (viejo) viejo.remove();
  const r = dcEl('div', 'dc-rotulo' + (alarma ? ' dc-rotulo-alarma' : '')); r.append(dcEl('b', 'ol', texto)); s.append(r);
  setTimeout(() => r.remove(), 1300);
}
// Lo que pasó, animado en orden: cada 'accion' de un rival (o compañero) abre un tramo de medio segundo en el que ese actor se mueve y,
// un poco después, caen sus cifras (daño, cura, bloqueo) con su icono sobre quien las recibe; el golpeado tiembla. Devuelve lo que dura todo.
const DC_PASO = 520;
function dcPintaEventos(C) {
  const s = document.getElementById('dc-combate'), evs = C.eventos.splice(0);
  let total = 0, t = 0, enTramo = false, k = 0, lider = false;
  for (const e of evs) {
    if (e.t === 'accion') { t = total; total += DC_PASO; enTramo = true; k = 0; dcAnimaAccion(s, e, t + 40); continue; }
    const retardo = (enTramo ? t + 230 : 140) + k * 110; k++;
    dcAnimaEvento(s, e, retardo);
    if (!enTramo && e.t === 'dano' && e.r >= 0 && !lider) { lider = true; dcClase(s.querySelector('.dc-lider-arte'), 'dc-brinca', 60); }
  }
  if (!enTramo && evs.length) total = 400 + k * 110;
  return total ? total + 250 : 0;
}
function dcClase(el, cls, retardo, dura) { if (!el) return; setTimeout(() => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), dura || 700); }, retardo || 0); }
// El actor se mueve: el rival embiste, se escuda, cura, manda el sobre de Spam, se potencia…; el compañero brinca.
function dcAnimaAccion(s, e, retardo) {
  if (e.comp !== undefined) return dcClase(s.querySelectorAll('.dc-comp')[e.comp], 'dc-brinca', retardo);
  const rv = s.querySelector('.dc-rival[data-rival="' + e.r + '"]'); if (!rv) return;
  dcClase(rv, 'dc-acto-' + e.tipo, retardo);
  if (e.tipo === 'spam') setTimeout(() => dcVuela(rv.querySelector('.dc-rival-arte'), s.querySelector('.dc-pila-desc'), 'spam', '#f3a6ff'), retardo + 120);
  if (e.tipo === 'ataque') setTimeout(() => dcVuela(rv.querySelector('.dc-rival-arte'), s.querySelector('.dc-lider-arte'), 'ataque', '#ff4b5c', 260), retardo + 60);
  if (e.tipo === 'cura' || e.tipo === 'refuerzo') setTimeout(() => dcImpacto(rv.querySelector('.dc-rival-arte'), e.tipo), retardo + 150);
}
// Una cifra flotante con su icono sobre quien la recibe.
function dcAnimaEvento(s, e, retardo) {
  const obj = e.r < 0 ? s.querySelector('.dc-lider-arte') : s.querySelector('.dc-rival[data-rival="' + e.r + '"] .dc-rival-arte'); if (!obj) return;
  setTimeout(() => {
    const f = dcEl('span', 'dc-flot dc-flot-' + e.t, e.t === 'dano' ? '−' + e.n : e.t === 'cura' ? '+' + e.n : e.t === 'bloqueo' ? '+' + e.n : tr('Bloqueado'));
    obj.append(f); setTimeout(() => f.remove(), 1300);
    dcImpacto(obj, e.t === 'dano' ? 'ataque' : e.t === 'cura' ? 'cura' : 'defensa');
    if (e.t === 'dano') dcClase(obj.parentElement, 'dc-tiembla', 0, 450);
  }, retardo);
}
// Un icono que estalla sobre un objetivo.
function dcImpacto(obj, icono) { if (!obj) return; const i = dcEl('span', 'dc-impacto dc-impacto-' + icono); i.append(dcSvg(icono)); obj.append(i); setTimeout(() => i.remove(), 700); }
// Un icono que vuela de un elemento a otro (el sobre de Spam hacia los descartes, el golpe hacia el líder).
function dcVuela(de, a, icono, color, dura) {
  if (!de || !a) return; const st = document.getElementById('stage').getBoundingClientRect(), r1 = de.getBoundingClientRect(), r2 = a.getBoundingClientRect();
  const v = dcEl('span', 'dc-vuelo'); v.append(dcSvg(icono)); v.style.color = color; v.style.left = (r1.left + r1.width / 2 - st.left - 16) + 'px'; v.style.top = (r1.top + r1.height / 2 - st.top - 16) + 'px';
  document.getElementById('stage').append(v);
  const dx = (r2.left + r2.width / 2) - (r1.left + r1.width / 2), dy = (r2.top + r2.height / 2) - (r1.top + r1.height / 2);
  if (v.animate) v.animate([{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 30}px) scale(1.2)`, opacity: 1, offset: .35 }, { transform: `translate(${dx}px, ${dy}px) scale(.8)`, opacity: 0 }], { duration: dura || 520, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => v.remove(); else v.remove();
}
// La carta i de la mano vuela al centro y se desvanece (antes de que la mano se vuelva a pintar).
function dcAnimaCarta(i) {
  const s = document.getElementById('dc-combate'), el = s.querySelector('.dc-mano .dc-carta[data-mano="' + i + '"]'); if (!el || !el.animate) return;
  const st = document.getElementById('stage').getBoundingClientRect(), a = el.getBoundingClientRect();
  const g = el.cloneNode(true); g.className = 'dc-carta dc-carta-vuela ' + el.className.replace('dc-elegida', ''); g.style.cssText = el.style.cssText;
  g.style.left = (a.left - st.left) + 'px'; g.style.top = (a.top - st.top) + 'px'; g.style.width = a.width + 'px';
  document.getElementById('stage').append(g);
  const dx = (st.width / 2 - a.width / 2) - (a.left - st.left), dy = (st.height * 0.36 - a.height / 2) - (a.top - st.top);
  g.animate([{ transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }, { transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) rotate(-4deg) scale(1.15)`, opacity: 1, offset: 0.55 }, { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(0.6)`, opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => g.remove();
}
function dcTocaCarta(i) {
  const C = DCC.C, c = C.mano[i];
  if (!dcPuedeJugar(C, c)) { play('deny'); toast(dcFx(c).injugable ? tr('Esa carta no se puede jugar') : tr('No tienes CAOS suficiente')); const el = document.querySelector('.dc-mano .dc-carta[data-mano="' + i + '"]'); if (el) { el.classList.add('dc-niega'); setTimeout(() => el.classList.remove('dc-niega'), 400); } return; }
  if (DCC.elegida === i) { DCC.elegida = null; dcPintaCombate(); return; }
  if (dcNecesitaObjetivo(C, c)) { DCC.elegida = i; dcPintaCombate(); return; }
  DCC.elegida = null; dcAnimaCarta(i); dcJugar(C, i, dcPrimerRival(C)); play('card'); dcTrasJugada();
}
function dcTrasJugada() {
  const C = DCC.C;
  const dur = dcPintaCombate() || 0;
  if (C.fase === 'fin') setTimeout(() => DCC.alFin(C.resultado, C), Math.max(900, dur + 500));
}
// Una carta pintada: coste, dibujo, nombre y texto. Mantener pulsada la amplía.
function dcPintaCarta(c, o = {}) {
  const D = DC_CARTAS[c.id], d = dcEl('button', 'dc-carta dc-rar-' + D.rar + ' dc-tipo-' + D.tipo + (o.jugable === false ? ' dc-nojugable' : '') + (o.elegida ? ' dc-elegida' : '') + (c.asc ? ' dc-asc' : '') + (o.grande ? ' dc-grande' : ''));
  const R = RARITY[D.rar] || RARITY.basic; d.style.setProperty('--rc', R[1]); d.style.setProperty('--ro', R[2]);
  if (!dcFx(c).injugable) d.append(dcEl('span', 'dc-coste', String(dcCoste(c))));
  const arte = dcEl('div', 'dc-arte'); arte.append(dcArteCarta(c, o.grande ? 72 : 46)); d.append(arte);
  const cab = dcEl('div', 'dc-ccab'); cab.append(dcEl('b', 'dc-cnombre', dcNombre(c)), dcEl('small', 'dc-ctipo', tr(DC_NOMBRE_TIPO[D.tipo]) + (o.grande ? ' · ' + tr(R[0]) : '')));
  const tx = dcEl('span', 'dc-ctexto'), txi = dcEl('span', 'dc-ctexto-in'); if (o.resalta) txi.innerHTML = dcTextoCartaHTML(c, o.resalta); else txi.textContent = dcTextoCarta(c); tx.append(txi); d.append(cab, tx);
  if (o.resalta && o.resalta.has('coste')) { const co = d.querySelector('.dc-coste'); if (co) co.classList.add('dc-cambio'); }
  if (o.al) d.onclick = o.al;
  let t = null; const abre = () => { t = setTimeout(() => { t = null; dcVerCarta(c); }, 450); }, cierra = () => { if (t) clearTimeout(t); t = null; };
  d.addEventListener('pointerdown', abre); d.addEventListener('pointerup', cierra); d.addEventListener('pointerleave', cierra); d.addEventListener('pointercancel', cierra);
  return d;
}
function dcVerCarta(c) {
  const v = dcVentana(dcNombre(c)); const g = dcPintaCarta(c, { grande: true }); g.onclick = null;
  v.append(g, dcEl('p', 'dc-nota', tr(DC_NOTA_TIPO[DC_CARTAS[c.id].tipo])));
  if (!c.asc && DC_CARTAS[c.id].asc) { const a = dcEl('button', 'btn-ghost ol dc-ver-ascenso', tr('VER ASCENSO')); a.onclick = () => dcVerAscenso(c, null, () => dcVerCarta(c)); v.append(a); }
  const b = dcEl('button', 'btn-ghost ol', tr('CERRAR')); b.onclick = dcCierraVentana; v.append(b);
}
// El ascenso de una carta (Becario → Junior): la carta de ahora, la de después con lo que cambia marcado, y la lista de cambios.
// alConfirmar (si hay) asciende; alOtra vuelve a la lista o a la carta.
const DC_ETIQUETA_FX = { coste: 'Coste', dano: 'Daño', veces: 'Veces', bloqueo: 'Bloqueo', cura: 'Cura', roba: 'Roba', caos: 'CAOS', vulnerable: 'Vulnerable', debil: 'Débil', aturde: 'Aturde', fuerza: 'Fuerza', fuerzaTurno: 'Fuerza del turno', n: 'Cifra' };
const DC_PALABRA_CAMBIO = { despedida: ['Ya no se despide: vuelve al mazo', 'Despedida: se va al jugarla'], indefinido: ['Ya se descarta', 'Contrato indefinido: no se descarta'], madrugador: ['Ya no madruga', 'Madrugador: siempre en tu mano inicial'] };
function dcVerAscenso(c, alConfirmar, alOtra) {
  const v = dcVentana(tr('Ascenso: {n}', { n: dcNombre(c) })), cambios = dcCambiosAscenso(c), resalta = new Set(cambios.map(x => x.k));
  const fila = dcEl('div', 'dc-ascenso');
  const antes = dcEl('div', 'dc-ascenso-col'); antes.append(dcEl('small', '', tr('Ahora')), dcPintaCarta(dcCarta(c.id, false), { grande: true }));
  const fl = dcEl('div', 'dc-ascenso-flecha'); fl.append(dcSvg('fuerza'));
  const despues = dcEl('div', 'dc-ascenso-col dc-ascenso-nueva'); despues.append(dcEl('small', '', tr('Junior')), dcPintaCarta(dcCarta(c.id, true), { grande: true, resalta }));
  fila.append(antes, fl, despues); v.append(fila);
  const lista = dcEl('div', 'dc-cambios');
  for (const x of cambios) {
    const ch = dcEl('span', 'dc-cambio-chip');
    if (DC_PALABRA_CAMBIO[x.k]) ch.textContent = tr(DC_PALABRA_CAMBIO[x.k][x.despues ? 1 : 0]);
    else { ch.append(dcEl('span', '', tr(DC_ETIQUETA_FX[x.k] || x.k) + ' '), dcEl('s', '', String(x.antes)), dcEl('b', '', ' ' + String(x.despues))); }
    lista.append(ch);
  }
  v.append(lista);
  if (alConfirmar) { const b = dcEl('button', 'btn-big ol dc-ascender', tr('ASCENDER')); b.onclick = () => { dcCierraVentana(); alConfirmar(); }; v.append(b); }
  const o = dcEl('button', 'btn-ghost ol', tr(alConfirmar ? 'OTRA CARTA' : 'CERRAR')); o.onclick = () => { dcCierraVentana(); if (alOtra) alOtra(); }; v.append(o);
}
// Elegir qué carta ascender: la lista, y al tocar una, su ascenso para confirmarlo.
function dcEligeAscenso(alHecho) {
  const r = DCP.run, cands = r.mazo.filter(c => !c.asc && DC_CARTAS[c.id].asc);
  dcVerCartas(tr('¿Qué carta asciendes?'), cands, c => dcVerAscenso(c, () => { c.asc = true; alHecho(c); }, () => dcEligeAscenso(alHecho)), { mejoradas: true });
}
// o.mejoradas: con el interruptor «Ver mejoradas» cada carta se pinta como quedará ascendida, con los cambios marcados (se recuerda mientras dura la sesión).
function dcVerCartas(titulo, cartas, alElegir, o = {}) {
  const v = dcVentana(titulo), g = dcEl('div', 'dc-rejilla');
  let mejoradas = !!(o.mejoradas && DCC.verMejoradas);
  const pinta = () => {
    g.textContent = ''; if (!cartas.length) g.append(dcEl('p', 'dc-nota', tr('No hay cartas aquí')));
    cartas.forEach(c => {
      const m = mejoradas && !c.asc && DC_CARTAS[c.id].asc, cc = m ? dcCarta(c.id, true) : c;
      g.append(dcPintaCarta(cc, { resalta: m ? new Set(dcCambiosAscenso(c).map(x => x.k)) : undefined, al: alElegir ? () => { dcCierraVentana(); alElegir(c); } : () => dcVerCarta(cc) }));
    });
  };
  if (o.mejoradas) {
    const t = dcEl('button', 'dc-toggle'), caja = dcEl('span', 'dc-toggle-caja'); caja.append(dcSvg('check')); t.append(caja, dcEl('span', '', tr('Ver mejoradas')));
    const refresca = () => t.classList.toggle('dc-toggle-on', mejoradas); refresca();
    t.onclick = () => { mejoradas = !mejoradas; DCC.verMejoradas = mejoradas; play('select'); refresca(); pinta(); };
    v.append(t);
  }
  pinta(); v.append(g);
  const b = dcEl('button', 'btn-ghost ol', tr(alElegir ? 'MEJOR NO' : 'CERRAR')); b.onclick = dcCierraVentana; v.append(b);
}
// Una ventana encima de todo (una sola a la vez).
function dcVentana(titulo) {
  dcCierraVentana();
  const velo = dcEl('div', 'dc-velo'); velo.id = 'dc-velo'; const caja = dcEl('div', 'dc-ventana'); caja.append(dcEl('h3', 'ol', titulo)); velo.append(caja);
  velo.onclick = ev => { if (ev.target === velo) dcCierraVentana(); };
  document.getElementById('stage').append(velo); return caja;
}
function dcCierraVentana() { const v = document.getElementById('dc-velo'); if (v) v.remove(); }
