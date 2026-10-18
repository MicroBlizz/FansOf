// Fans Of Decks · La reunión en pantalla: rivales con su intención arriba, el líder en medio, la franja de CAOS y la mano abajo. Pinta el estado C de combate.js.
// Toques: con un rival, tocar la carta la juega; con varios, tocar la carta y luego el rival. Mantener pulsada una carta enseña su texto grande.
'use strict';
const DCC = { C: null, alFin: null, elegida: null };
const dcEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };

function dcEmpiezaReunion(encuentro, tramo, alFin) {
  DCC.C = dcCombateNuevo(encuentro, tramo); DCC.alFin = alFin; DCC.elegida = null;
  dcMuestra('dc-combate'); dcPintaCombate();
}
function dcBarraVida(hp, max, bloqueo) {
  const b = dcEl('div', 'dc-vida'); const f = dcEl('i'); f.style.width = Math.round(100 * hp / max) + '%'; b.append(f, dcEl('span', '', hp + ' / ' + max));
  if (bloqueo) b.append(dcEl('b', 'dc-bloqueo', String(bloqueo)));
  return b;
}
function dcEstados(o) {
  const e = dcEl('div', 'dc-estados');
  if (o.fuerza) e.append(dcEl('span', 'dc-est dc-est-fuerza', tr('Fuerza') + ' ' + o.fuerza));
  if (o.vulnerable) e.append(dcEl('span', 'dc-est dc-est-vul', tr('Vulnerable') + ' ' + o.vulnerable));
  if (o.debil) e.append(dcEl('span', 'dc-est dc-est-deb', tr('Débil') + ' ' + o.debil));
  if (o.aturdido) e.append(dcEl('span', 'dc-est dc-est-atu', tr('Aturdido')));
  return e;
}
function dcPintaRival(C, r, i) {
  const d = dcEl('div', 'dc-rival' + (r.hp <= 0 ? ' dc-ko' : '') + (DCC.elegida !== null && r.hp > 0 ? ' dc-elige' : ''));
  const D = DC_RIVALES[r.id], j = r.jug, tipo = dcTipoJugada(j), I = DC_INTENCION[tipo];
  const it = dcEl('div', 'dc-intencion'); it.style.setProperty('--ic', I[1]);
  let txt = I[0]; if (tipo === 'ataque') txt = dcDanoRival(C, r) + (j.n > 1 ? ' ×' + j.n : ''); else if (tipo === 'defensa') txt = I[0] + j.b; else if (tipo === 'cura') txt = '+' + j.c; else if (tipo === 'refuerzo') txt = '+' + (j.refN || 1);
  if (r.aturdido) txt = 'zZ';
  it.textContent = txt; it.title = tr(r.aturdido ? 'Pierde el turno' : I[2]);
  d.append(it, dcSprite(D.arte, D.alto || (D.jefe ? 110 : D.elite ? 92 : 72)), dcEl('b', 'dc-nombre', r.nombre), dcBarraVida(r.hp, r.hpMax, r.bloqueo), dcEstados(r));
  d.onclick = () => { if (DCC.elegida !== null && r.hp > 0) { const k = DCC.elegida; DCC.elegida = null; dcJugar(C, k, i); dcTrasJugada(); } };
  return d;
}
function dcPintaCombate() {
  const C = DCC.C, r = DCP.run, L = DC_LIDERES[r.lider], s = document.getElementById('dc-combate');
  s.textContent = '';
  // arriba: los rivales
  const top = dcEl('div', 'dc-rivales'); C.rivales.forEach((rv, i) => top.append(dcPintaRival(C, rv, i)));
  const cab = dcEl('div', 'dc-cabecera');
  cab.append(dcEl('span', '', tr('Turno {n}', { n: C.turno })), dcEl('span', C.turno >= C.cierre ? 'dc-cierre' : '', C.turno >= C.cierre ? tr('HORA DE CIERRE') : tr('Cierre en el turno {n}', { n: C.cierre })));
  // en medio: el líder
  const med = dcEl('div', 'dc-lider');
  const lsp = dcEl('div', 'dc-lider-arte'); lsp.append(dcSprite('bunny', 96));
  const inf = dcEl('div', 'dc-lider-info');
  inf.append(dcEl('b', 'dc-nombre', tr(L.nombre)), dcBarraVida(r.hp, r.hpMax, C.bloqueo), dcEstados(C));
  const objs = dcEl('div', 'dc-objetos'); for (const k of r.objetos) { const o = dcEl('span', 'dc-chip dc-chip-' + DC_OBJETOS[k].rar, tr(DC_OBJETOS[k].nombre)); o.title = tr(DC_OBJETOS[k].texto); objs.append(o); }
  inf.append(objs);
  const acc = dcEl('div', 'dc-acciones');
  const salto = dcEl('button', 'dc-boton dc-salto', tr(C.salto.nombre) + (C.saltoCd > 0 ? ' · ' + tr('{n} turnos', { n: C.saltoCd }) : ' · ' + C.salto.coste + ' CAOS'));
  salto.disabled = C.fase !== 'jugador' || C.saltoCd > 0 || C.caos < C.salto.coste; salto.title = tr(C.salto.texto, C.salto);
  salto.onclick = () => { if (dcUsaSalto(C)) { play('zap'); dcTrasJugada(); } };
  acc.append(salto);
  r.meriendas.forEach((k, i) => { const b = dcEl('button', 'dc-boton dc-merienda', tr(DC_MERIENDAS[k].nombre)); b.title = tr(DC_MERIENDAS[k].texto); b.disabled = C.fase !== 'jugador'; b.onclick = () => { if (dcUsaMerienda(C, i)) { play('heal'); dcTrasJugada(); } }; acc.append(b); });
  med.append(lsp, inf);
  const log = dcEl('div', 'dc-log', C.log.slice(-2).join(' · '));
  // la franja: CAOS, pilas y fin de turno
  const franja = dcEl('div', 'dc-franja');
  const caos = dcEl('div', 'dc-caos'); caos.append(dcEl('b', '', String(C.caos)), dcEl('small', '', 'CAOS'));
  const pilas = dcEl('div', 'dc-pilas');
  const bp = dcEl('button', 'dc-pila', tr('Mazo') + ' ' + C.pila.length); bp.onclick = () => dcVerCartas(tr('Mazo (sin orden)'), shuffle(C.pila.slice()));
  const bd = dcEl('button', 'dc-pila', tr('Descartes') + ' ' + C.descartes.length); bd.onclick = () => dcVerCartas(tr('Descartes'), C.descartes);
  pilas.append(bp, bd);
  const fin = dcEl('button', 'dc-boton dc-fin', tr('FIN DE TURNO')); fin.disabled = C.fase !== 'jugador';
  fin.onclick = () => { DCC.elegida = null; play('select'); dcFinTurno(C); dcTrasJugada(); };
  franja.append(caos, fin, pilas);
  // la mano
  const mano = dcEl('div', 'dc-mano');
  C.mano.forEach((c, i) => mano.append(dcPintaCarta(c, { enMano: true, jugable: dcPuedeJugar(C, c), elegida: DCC.elegida === i, al: () => dcTocaCarta(i) })));
  const aviso = dcEl('div', 'dc-aviso', DCC.elegida !== null ? tr('¿A quién? Toca un rival') : '');
  s.append(cab, top, med, acc, log, franja, aviso, mano);
  if (DCC.elegida !== null) s.onclick = ev => { if (!ev.target.closest('.dc-rival, .dc-carta')) { DCC.elegida = null; dcPintaCombate(); } }; else s.onclick = null;
}
function dcTocaCarta(i) {
  const C = DCC.C, c = C.mano[i];
  if (!dcPuedeJugar(C, c)) { play('deny'); toast(dcFx(c).injugable ? tr('Esa carta no se puede jugar') : tr('No tienes CAOS suficiente')); return; }
  if (DCC.elegida === i) { DCC.elegida = null; dcPintaCombate(); return; }
  if (dcNecesitaObjetivo(C, c)) { DCC.elegida = i; dcPintaCombate(); return; }
  DCC.elegida = null; dcJugar(C, i, dcPrimerRival(C)); play('card'); dcTrasJugada();
}
function dcTrasJugada() {
  const C = DCC.C;
  dcPintaCombate();
  if (C.fase === 'fin') setTimeout(() => DCC.alFin(C.resultado, C), 700);
}
// Una carta pintada: coste, dibujo, nombre y texto. Mantener pulsada la amplía.
function dcPintaCarta(c, o = {}) {
  const D = DC_CARTAS[c.id], d = dcEl('button', 'dc-carta dc-rar-' + D.rar + ' dc-tipo-' + D.tipo + (o.jugable === false ? ' dc-nojugable' : '') + (o.elegida ? ' dc-elegida' : '') + (c.asc ? ' dc-asc' : ''));
  const R = RARITY[D.rar] || RARITY.basic; d.style.setProperty('--rc', R[1]); d.style.setProperty('--ro', R[2]);
  if (!dcFx(c).injugable) d.append(dcEl('span', 'dc-coste', String(dcCoste(c))));
  const arte = dcEl('div', 'dc-arte'); arte.append(dcArteCarta(c, o.grande ? 72 : 46)); d.append(arte);
  d.append(dcEl('b', 'dc-cnombre', dcNombre(c)), dcEl('small', 'dc-ctipo', tr({ tropa: 'Tropa', hechizo: 'Hechizo', tactica: 'Táctica', clausula: 'Cláusula', spam: 'Spam' }[D.tipo])), dcEl('span', 'dc-ctexto', dcTextoCarta(c)));
  if (o.al) d.onclick = o.al;
  let t = null; const abre = () => { t = setTimeout(() => { t = null; dcVerCarta(c); }, 450); }, cierra = () => { if (t) clearTimeout(t); t = null; };
  d.addEventListener('pointerdown', abre); d.addEventListener('pointerup', cierra); d.addEventListener('pointerleave', cierra); d.addEventListener('pointercancel', cierra);
  return d;
}
function dcVerCarta(c) {
  const v = dcVentana(dcNombre(c)); const g = dcPintaCarta(c, { grande: true }); g.classList.add('dc-grande'); g.onclick = null;
  v.append(g, dcEl('p', 'dc-nota', tr({ tropa: 'Tropa: la unidad sale, actúa y vuelve al mazo.', hechizo: 'Hechizo: efecto inmediato.', tactica: 'Táctica: afecta a tu líder, tu mano o la reunión.', clausula: 'Cláusula: una carta que estorba. Se quita en el Economato.', spam: 'Spam: basura del rival. Se tira al acabar el turno.' }[DC_CARTAS[c.id].tipo])));
  const b = dcEl('button', 'btn-ghost ol', tr('CERRAR')); b.onclick = dcCierraVentana; v.append(b);
}
function dcVerCartas(titulo, cartas, alElegir) {
  const v = dcVentana(titulo), g = dcEl('div', 'dc-rejilla');
  if (!cartas.length) g.append(dcEl('p', 'dc-nota', tr('No hay cartas aquí')));
  cartas.forEach(c => g.append(dcPintaCarta(c, { al: alElegir ? () => { dcCierraVentana(); alElegir(c); } : () => dcVerCarta(c) })));
  v.append(g);
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
