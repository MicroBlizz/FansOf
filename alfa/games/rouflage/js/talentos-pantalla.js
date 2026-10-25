// Fans of Rouflage · LA PANTALLA DE TALENTOS (botón TALENTOS de MI PERFIL, #p-talentos de pantallas-html.js): dos pestañas, BECARIO y COLADO, cada una con
// el tubo de cristal con pintura del pase (tuboPinta, fin-pase.js) que enseña su nivel y su experiencia, y las fichas de sus habilidades (desbloqueadas o con
// candado y su nivel) para elegir la que llevas. Además, la fila de habilidades para elegir antes de jugar: en CONTRA BOTS (#p-bots) y en la sala del PvP.
'use strict';

const TAL_UI = { pest: 'becario', raf: 0, ultimo: 0, tubo: null };
const TAL_COL = { becario: ['#2e8bff', '#39d5e8', '#9fd0ff', '#3a7de0', '#7fe9f5', '#5a9cff'], colado: ['#7ee04a', '#2fcf8f', '#c6f58a', '#22a063', '#e6ff7a', '#5fd86a'] };
const talUsos = h => (h.titulo ? tr('Título') : h.pasiva ? tr('Siempre activa') : h.usos === 1 ? tr('1 uso') : tr('{n} usos', { n: h.usos }));
const talTexto = papel => (papel === 'becario' ? tr('BECARIO') : tr('COLADO'));

// el tubo de la cabecera: se llena desde 0 hasta el nivel que tienes cada vez que cambias de pestaña
function talTuboPon(papel) {
  const xp = talXp(papel), nv = talNivel(papel), lleno = nv >= TALENTOS.max, a = TALENTOS.acum[nv], b = TALENTOS.acum[Math.min(TALENTOS.max, nv + 1)];
  const meta = lleno ? 1 : Math.max(0, Math.min(1, (xp - a) / Math.max(1, b - a)));
  TAL_UI.tubo = { t: 0, frac: 0, meta, fase: 'llena', nivel: nv, lleno, cols: TAL_COL[papel], burbujas: [], parts: [], flash: 0, R: 22, th: 34 };
  E('tal-xp').textContent = lleno || (talEstado().todo && arPruebasVisibles()) ? tr('¡Nivel máximo!') : tr('{a} / {b} XP', { a: xp - a, b: b - a });
  const sig = habsDe(papel).find(h => h.nv > nv);
  E('tal-sig').textContent = sig ? tr('Nivel {n}: {h}', { n: sig.nv, h: tr(sig.n) }) : tr('Todo desbloqueado');
}
function talTuboFotograma(now) {
  if (E('p-talentos').hidden) { TAL_UI.raf = 0; return; }
  const F = TAL_UI.tubo, dt = Math.min(0.05, (now - TAL_UI.ultimo) / 1000); TAL_UI.ultimo = now;
  F.t += dt;
  if (F.frac < F.meta) { F.frac = Math.min(F.meta, F.frac + dt * Math.max(0.25, (F.meta - F.frac) * 2.6)); if (F.frac >= F.meta) F.fase = 'fin'; }
  tuboPinta(E('tal-tubo'), F, dt);
  TAL_UI.raf = requestAnimationFrame(talTuboFotograma);
}

// el extra del señuelo pintado: la pintura de señuelos que da tu nivel de colado (y la siguiente subida)
function talExtraSen() {
  const nv = talNivel('colado'), n = Math.round(extraSen(nv) * 100), sig = nv < TALENTOS.max ? (Math.floor(nv / 5) + 1) * 5 : 0;
  const s = elem('span', 'tal-extra'); s.appendChild(elem('b', '', tr('Pintura de señuelos: +{n} %', { n })));
  if (sig) s.appendChild(elem('i', '', ' · ' + tr('nivel {n}: +{p} %', { n: sig, p: Math.round(extraSen(sig) * 100) })));
  return s;
}
// una ficha: la medalla con el dibujo, NV y usos, el nombre, lo que hace y el botón (ELEGIR, ELEGIDA o el candado con su nivel)
function talFila(h) {
  const abierta = habAbierta(h), elegida = abierta && !h.titulo && talElegida(h.papel) === h.id;
  const fila = elem('div', 'tal-fila ' + h.papel + (abierta ? '' : ' bloq') + (elegida ? ' elegida' : '') + (h.titulo ? ' titulo' : ''));
  const k = arLienzo(58, 58, 'mis-ico'); arPinta(k, (c, w) => pintaInsignia(c, w, 'tal_' + h.id, h.titulo ? 'oro' : abierta ? h.papel : 'bloq', abierta ? (elegida ? 'lista' : '') : 'bloqueada')); fila.appendChild(k);
  const txt = elem('div', 'mis-txt'), cab = elem('div', 'mis-cab');
  cab.appendChild(elem('span', 'mis-tag tal-nv', tr('NV {n}', { n: h.nv }))); cab.appendChild(elem('span', 'tal-usos', talUsos(h)));
  txt.appendChild(cab); txt.appendChild(elem('b', '', tr(h.n))); txt.appendChild(elem('small', '', tr(h.d)));
  if (h.id === 'senuelo') txt.appendChild(talExtraSen());
  fila.appendChild(txt);
  const lado = elem('div', 'tal-lado');
  if (!abierta) lado.appendChild(elem('span', 'tal-cerrada', tr('Nivel {n}', { n: h.nv })));
  else if (h.titulo) lado.appendChild(elem('span', 'tal-tuyo', tr('¡En tu armario!')));
  else if (elegida) lado.appendChild(elem('span', 'tal-tuyo', tr('ELEGIDA')));
  else { const bt = elem('button', 'boton tal-elegir', tr('ELEGIR')); bt.type = 'button'; bt.onclick = () => { if (talElige(h.papel, h.id)) { play('select'); play('pop'); talPantallaPinta(); } }; lado.appendChild(bt); }
  fila.appendChild(lado);
  return fila;
}
function talPantallaPinta() {
  const papel = TAL_UI.pest;
  for (const p of ['becario', 'colado']) { E('b-tal-' + p).classList.toggle('activa', p === papel); E('tal-nv-' + p).textContent = tr('NV {n}', { n: talNivel(p) }); }
  E('p-talentos').dataset.papel = papel;
  const lista = E('tal-lista'); lista.innerHTML = '';
  for (const h of habsDe(papel)) lista.appendChild(talFila(h));
  talFantasmas(lista, papel);
  E('tal-nota').textContent = papel === 'becario' ? tr('Sube jugando de becario: cada partida da experiencia, y más si despides a colados sin despidos improcedentes.') : tr('Sube jugando de colado: cada partida da experiencia, y más si aguantas sin que te despidan y con buen camuflaje.');
  talTuboPon(papel);
}
// LOS PODERES DE FANTASMA, al final de cada pestaña: no se desbloquean (los tiene todo el mundo), solo se explican. Los nuevos llevan NUEVO hasta verlos
const FP_NUEVOS = ['retoque', 'vaho', 'charco', 'susto', 'portazo', 'soplo', 'foco'];
function talFantasmas(lista, papel) {
  const cab = elem('div', 'tal-fp-cab');
  cab.appendChild(elem('b', 'ol', tr('PODERES DE FANTASMA')));
  cab.appendChild(elem('small', '', tr('Siempre abiertos. Cuando te quedas sin jugar eres un fantasma: llevas uno y cambia a otro cada vez que lo usas.')));
  lista.appendChild(cab);
  const nuevo = !!TAL_UI.fpNuevo;
  for (const k of Object.keys(PODERES)) {
    const p = PODERES[k]; if (p.papel !== papel) continue;
    const fila = elem('div', 'tal-fila tal-fp');
    const ic = arLienzo(58, 58, 'mis-ico'); arPinta(ic, (c, w) => pintaInsignia(c, w, 'fp_' + k, 'fantasma', '')); fila.appendChild(ic);
    const txt = elem('div', 'mis-txt'), cb = elem('div', 'mis-cab');
    cb.appendChild(elem('span', 'mis-tag tal-fp-tag', tr('FANTASMA')));
    cb.appendChild(elem('span', 'tal-usos', tr('Espera {n} s', { n: p.cada || PODER.cada })));
    if (nuevo && FP_NUEVOS.includes(k)) cb.appendChild(elem('span', 'mis-tag tal-fp-nuevo', tr('NUEVO')));
    txt.appendChild(cb); txt.appendChild(elem('b', '', tr(p.n))); txt.appendChild(elem('small', '', tr(p.d)));
    fila.appendChild(txt); lista.appendChild(fila);
  }
}
function abreTalentos() {
  SAVE.tuto = SAVE.tuto || {}; TAL_UI.fpNuevo = !SAVE.tuto['fp-vistos'];      // el NUEVO de los poderes de fantasma: solo la primera vez que abres TALENTOS
  if (TAL_UI.fpNuevo) { SAVE.tuto['fp-vistos'] = 1; guardaPartida(); }
  play('select'); pantalla('p-talentos'); talPantallaPinta();
  cancelAnimationFrame(TAL_UI.raf); TAL_UI.ultimo = performance.now(); TAL_UI.raf = requestAnimationFrame(talTuboFotograma);
}
// si cambia algo (DESBLOQUEAR TODO, el servidor), se repinta lo que esté a la vista
function talentosRefresca() {
  if (!E('p-talentos').hidden) talPantallaPinta();
  if (!E('p-bots').hidden) talPintaBots();
  talPintaSala();
}

/* ---------- elegir antes de jugar: una fila de fichas redondas y, debajo, la elegida con lo que hace ---------- */
function talFilaElige(caja, papel) {
  caja.innerHTML = '';
  const fila = elem('div', 'tal-chips ' + papel), elegida = talElegida(papel);
  for (const h of habsDe(papel)) {
    if (h.titulo) continue;
    const abierta = habAbierta(h), b = elem('button', 'tal-chip' + (abierta ? '' : ' bloq') + (h.id === elegida ? ' elegida' : '')); b.type = 'button';
    b.setAttribute('aria-label', tr(h.n) + (abierta ? '' : ' · ' + tr('Nivel {n}', { n: h.nv }))); b.setAttribute('aria-pressed', String(h.id === elegida));
    const k = arLienzo(34, 34); arPinta(k, (c, w) => pintaHabIcono(c, w, h.id, !abierta)); b.appendChild(k);
    if (!abierta) b.appendChild(elem('small', '', tr('NV {n}', { n: h.nv })));
    b.onclick = () => {
      if (!abierta) { play('deny'); pista(tr('{h}: se desbloquea en el nivel {n} de {p}', { h: tr(h.n), n: h.nv, p: papel === 'becario' ? tr('becario') : tr('colado') }), 2.4); return; }
      if (talElige(papel, h.id)) { play('select'); talFilaElige(caja, papel); }
    };
    fila.appendChild(b);
  }
  caja.appendChild(fila);
  const h = habDef(elegida), info = elem('p', 'tal-info');
  info.appendChild(elem('b', '', tr(h.n))); info.appendChild(document.createTextNode(' · ' + tr(h.d)));
  if (h.id === 'senuelo') { info.appendChild(document.createTextNode(' ')); info.appendChild(talExtraSen()); }
  caja.appendChild(info);
}
function talPintaBots() {
  const papel = BOTS.modo === 'cazador' ? 'becario' : 'colado';
  E('bots-hab-t').textContent = tr('3 · TU HABILIDAD DE {p}', { p: talTexto(papel) }) + ' · ' + tr('NV {n}', { n: talNivel(papel) });
  talFilaElige(E('bots-hab'), papel);
}
// en la sala del PvP: el rótulo CON TALENTOS o CLÁSICO y, con talentos, las dos filas (aún no sabes qué papel te toca)
function talModoSala() {
  const i = RFP.info; if (!i) return false;
  const mio = (i.jugadores || []).find(j => j.yo), soyAnf = !!i.privada && !!mio && mio.orden === i.anfitrion;
  return ajusteSala((soyAnf ? MODO_ELEGIDO : i.modo || {}).a, 't') === 1;
}
function talPintaSala() {
  const caja = E('busca-hab'), rot = E('busca-tal'); if (!caja || E('p-busca').hidden) return;
  const i = RFP.info, jugando = i && i.estado !== 'espera', on = talModoSala();
  rot.hidden = !i; if (i && rot.dataset.on !== String(on)) { rot.dataset.on = String(on); rot.innerHTML = ''; rot.appendChild(talRotulo(on)); }
  caja.hidden = !!jugando || !on;
  const clave = talEstado().eleg.becario + talEstado().eleg.colado + talNivel('becario') + talNivel('colado');
  if (caja.hidden || caja.dataset.pintado === clave) return;
  caja.dataset.pintado = clave; caja.innerHTML = '';
  caja.appendChild(elem('h3', 'ol', tr('TUS HABILIDADES')));
  for (const papel of ['becario', 'colado']) {
    const g = elem('div', 'tal-sala-papel'); g.appendChild(elem('span', 'tal-sala-t ' + papel, tr('DE {p}', { p: talTexto(papel) })));
    const c = elem('div', 'tal-sala-fila'); g.appendChild(c); caja.appendChild(g);
    talFilaElige(c, papel);
  }
  caja.addEventListener('click', () => { caja.dataset.pintado = talEstado().eleg.becario + talEstado().eleg.colado + talNivel('becario') + talNivel('colado'); });
}
// la medalla del rótulo: azul y verde con su estrella (CON) o gris y tachada (SIN)
function pintaMedallaTal(c, w, on) {
  c.save(); c.scale(w / 40, w / 40); c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.arc(20, 21.5, 16, 0, TAU); c.fillStyle = OL; c.fill();
  c.save(); c.beginPath(); c.arc(20, 20, 16, 0, TAU); c.clip();
  if (on) { c.fillStyle = '#4f95f5'; c.fillRect(0, 0, 20, 40); c.fillStyle = '#3fc47c'; c.fillRect(20, 0, 20, 40); } else { c.fillStyle = '#6d7891'; c.fillRect(0, 0, 40, 40); }
  c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(15, 9, 13, 6, -0.3, 0, TAU); c.fill(); c.restore();
  c.beginPath(); c.arc(20, 20, 16, 0, TAU); c.lineWidth = 3.2; c.strokeStyle = OL; c.stroke();
  c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 3.6 : 8.4; c.lineTo(20 + Math.cos(a) * r, 20.5 + Math.sin(a) * r); } c.closePath();
  c.fillStyle = on ? '#ffcb3d' : '#a9b2c6'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OL; c.stroke();
  if (!on) { c.beginPath(); c.moveTo(8, 32); c.lineTo(32, 8); c.lineWidth = 6.5; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3.4; c.strokeStyle = '#ff4b5c'; c.stroke(); }
  c.restore();
}
function talRotulo(on, grande) {
  const r = elem('div', 'tal-rotulo ' + (on ? 'con' : 'sin') + (grande ? ' grande' : '')), k = arLienzo(grande ? 46 : 34, grande ? 46 : 34);
  arPinta(k, (c, w) => pintaMedallaTal(c, w, on)); r.appendChild(k);
  const t = elem('div', 'tal-rotulo-t'); t.appendChild(elem('b', 'ol', on ? tr('CON TALENTOS') : tr('CLÁSICO')));
  t.appendChild(elem('small', '', on ? tr('Cada uno lleva su habilidad') : tr('Sin habilidades: solo la granada'))); r.appendChild(t);
  return r;
}
// al empezar una partida del PvP: el rótulo grande unos segundos, debajo del marcador
function talRotuloPartida(on) {
  let r = E('tal-rotulo'); if (!r) { r = elem('div', 'tal-rotulo-partida'); r.id = 'tal-rotulo'; E('hud').appendChild(r); }
  r.innerHTML = ''; r.appendChild(talRotulo(on, true)); r.hidden = false; r.classList.remove('entra'); void r.offsetWidth; r.classList.add('entra');
  clearTimeout(r.tm); r.tm = setTimeout(() => { r.hidden = true; }, 5200);
}
// BUSCAR PARTIDA: dos colas, con y sin talentos (nunca se mezclan); se recuerda la última
function talPintaCola() {
  const on = !!talEstado().pvp;
  for (const b of document.querySelectorAll('.tal-cola button')) { const si = (b.dataset.v === '1') === on; b.classList.toggle('puesto', si); b.setAttribute('aria-pressed', String(si)); }
}

function preparaTalentos() {
  if (!PANTALLAS.includes('p-talentos')) PANTALLAS.push('p-talentos');
  talEstado(); talentosTitulos();
  E('b-talentos').onclick = abreTalentos;
  for (const p of ['becario', 'colado']) E('b-tal-' + p).onclick = () => { if (TAL_UI.pest === p) return; TAL_UI.pest = p; play('select'); talPantallaPinta(); };
  E('b-tal-volver').onclick = () => { play('select'); irTitulo(); };
  // CONTRA BOTS: el grupo «3 · TU HABILIDAD» antes de ¡JUGAR!, que cambia con el papel
  const g = elem('div', 'grupo-titulo tal-bots'); g.innerHTML = '<h3 class="ol" id="bots-hab-t"></h3><div id="bots-hab"></div>';
  E('b-bots-jugar').before(g);
  for (const id of ['b-camaleon', 'b-cazador', 'b-bots-camaleon', 'b-bots-cazador']) { const o = E(id).onclick; E(id).onclick = ev => { o(ev); talPintaBots(); }; }
  // la sala del PvP: las dos filas antes de la lista de jugadores
  const s = elem('div', 'tal-sala'); s.id = 'busca-hab'; s.hidden = true; E('busca-lista').before(s);
  const rot = elem('div', 'tal-sala-modo'); rot.id = 'busca-tal'; rot.hidden = true; E('busca-sub').after(rot);
  const cola = elem('div', 'tal-cola'); cola.setAttribute('role', 'group'); cola.setAttribute('aria-label', tr('TALENTOS'));
  for (const v of ['1', '0']) {
    const b = elem('button'); b.type = 'button'; b.dataset.v = v; const k = arLienzo(26, 26); arPinta(k, (c, w) => pintaMedallaTal(c, w, v === '1')); b.appendChild(k); b.appendChild(elem('b', '', v === '1' ? tr('CON TALENTOS') : tr('CLÁSICO')));
    b.onclick = () => { play('select'); talEstado().pvp = v === '1'; MODO_ELEGIDO.a = MODO_ELEGIDO.a || {}; MODO_ELEGIDO.a.t = +v; modoElegidoGuarda(); guardaPartida(); talPintaCola(); }; cola.appendChild(b);      // vale para las tres: BUSCAR PARTIDA, AMIGOS y BOTS
  }
  E('b-pvp-buscar').before(cola); talPintaCola();
  preparaHab();      // los botones de la partida (talentos-partida.js)
}
