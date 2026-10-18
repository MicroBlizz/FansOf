// Fans Of Decks · La reunión en pantalla: rivales con su intención arriba, el líder en medio, la franja de CAOS y la mano en abanico abajo. Pinta el estado C de combate.js.
// Toques: con un rival, tocar la carta la juega; con varios, tocar la carta y luego el rival. Mantener pulsada una carta enseña su texto grande.
// Lo que se mueve: la carta jugada vuela al centro, las cifras de daño flotan sobre quien las recibe (C.eventos), el golpeado tiembla y cada turno entra con su rótulo.
'use strict';
const DCC = { C: null, alFin: null, elegida: null, turnoVisto: 0 };
const dcEl = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };

function dcEmpiezaReunion(encuentro, tramo, alFin) {
  DCC.C = dcCombateNuevo(encuentro, tramo); DCC.alFin = alFin; DCC.elegida = null; DCC.turnoVisto = 0;
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
function dcPintaCombate() {
  const C = DCC.C, r = DCP.run, L = DC_LIDERES[r.lider], s = document.getElementById('dc-combate');
  s.textContent = ''; s.classList.toggle('dc-cierre-on', C.turno >= C.cierre);
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
  if (C.turno !== DCC.turnoVisto) { DCC.turnoVisto = C.turno; dcRotulo(C.turno >= C.cierre ? tr('HORA DE CIERRE') : tr('Turno {n}', { n: C.turno }), C.turno >= C.cierre); }
  dcPintaEventos(C);
}
// Un rótulo que cruza la pantalla (turno nuevo, hora de cierre).
function dcRotulo(texto, alarma) {
  const s = document.getElementById('dc-combate'), viejo = s.querySelector('.dc-rotulo'); if (viejo) viejo.remove();
  const r = dcEl('div', 'dc-rotulo' + (alarma ? ' dc-rotulo-alarma' : '')); r.append(dcEl('b', 'ol', texto)); s.append(r);
  setTimeout(() => r.remove(), 1300);
}
// Las cifras flotantes: daño, cura y bloqueo sobre quien lo recibe; el golpeado tiembla.
function dcPintaEventos(C) {
  const s = document.getElementById('dc-combate'), evs = C.eventos.splice(0);
  const porObjetivo = {};
  for (const e of evs) { const k = e.t + ':' + e.r; (porObjetivo[k] = porObjetivo[k] || []).push(e); }
  let orden = 0;
  for (const k in porObjetivo) {
    const grupo = porObjetivo[k], e = grupo[0], obj = e.r < 0 ? s.querySelector('.dc-lider-arte') : s.querySelector('.dc-rival[data-rival="' + e.r + '"] .dc-rival-arte');
    if (!obj) continue;
    const total = grupo.reduce((a, x) => a + x.n, 0);
    const f = dcEl('span', 'dc-flot dc-flot-' + e.t, e.t === 'dano' ? '−' + total : e.t === 'cura' ? '+' + total : e.t === 'bloqueo' ? '+' + total : tr('Bloqueado'));
    if (e.t === 'dano' && grupo.length > 1) f.append(dcEl('small', '', ' ×' + grupo.length));
    f.style.setProperty('--retardo', (orden * 90) + 'ms'); orden++;
    obj.append(f); setTimeout(() => f.remove(), 1400);
    if (e.t === 'dano') { const quien = obj.parentElement; quien.classList.remove('dc-tiembla'); void quien.offsetWidth; quien.classList.add('dc-tiembla'); }
  }
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
  dcPintaCombate();
  if (C.fase === 'fin') setTimeout(() => DCC.alFin(C.resultado, C), 900);
}
// Una carta pintada: coste, dibujo, nombre y texto. Mantener pulsada la amplía.
function dcPintaCarta(c, o = {}) {
  const D = DC_CARTAS[c.id], d = dcEl('button', 'dc-carta dc-rar-' + D.rar + ' dc-tipo-' + D.tipo + (o.jugable === false ? ' dc-nojugable' : '') + (o.elegida ? ' dc-elegida' : '') + (c.asc ? ' dc-asc' : '') + (o.grande ? ' dc-grande' : ''));
  const R = RARITY[D.rar] || RARITY.basic; d.style.setProperty('--rc', R[1]); d.style.setProperty('--ro', R[2]);
  if (!dcFx(c).injugable) d.append(dcEl('span', 'dc-coste', String(dcCoste(c))));
  const arte = dcEl('div', 'dc-arte'); arte.append(dcArteCarta(c, o.grande ? 72 : 46)); d.append(arte);
  const cab = dcEl('div', 'dc-ccab'); cab.append(dcEl('b', 'dc-cnombre', dcNombre(c)), dcEl('small', 'dc-ctipo', tr({ tropa: 'Tropa', hechizo: 'Hechizo', tactica: 'Táctica', clausula: 'Cláusula', spam: 'Spam' }[D.tipo]) + (o.grande ? ' · ' + tr(R[0]) : '')));
  d.append(cab, dcEl('span', 'dc-ctexto', dcTextoCarta(c)));
  if (o.al) d.onclick = o.al;
  let t = null; const abre = () => { t = setTimeout(() => { t = null; dcVerCarta(c); }, 450); }, cierra = () => { if (t) clearTimeout(t); t = null; };
  d.addEventListener('pointerdown', abre); d.addEventListener('pointerup', cierra); d.addEventListener('pointerleave', cierra); d.addEventListener('pointercancel', cierra);
  return d;
}
function dcVerCarta(c) {
  const v = dcVentana(dcNombre(c)); const g = dcPintaCarta(c, { grande: true }); g.onclick = null;
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
