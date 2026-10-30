// Fans of Rouflage · LOS TALENTOS AL ACABAR: la experiencia de la partida para el papel que jugaste (talPuntos, talentos-datos.js), que se guarda en la partida
// local o, con cuenta, la sube el servidor (rf_talento_xp, servidor/61-rouflage-talentos.sql). En la pantalla del final, debajo del pase, un tubo pequeño
// del color del papel se llena (con el mismo dibujo que el del pase: tuboPinta) y, si sube de nivel, sale «¡Becario nivel 4!» con la habilidad nueva.
'use strict';

const TALF = { r: null, raf: 0, ultimo: 0, F: null, v: 0, meta: 0, espera: 0, nivel: 1 };
const TALF_SIN = /Could not find|HTTP 404|PGRST202/i;

// lo llama termina (partida.js), después de economiaPartida
function talentosFin(r) {
  const yo = J.yo; if (!yo || yo.dueno || !r) return;
  const { papel, xp } = talPuntos(r, yo), xpA = talXp(papel), nvA = talNivelDe(xpA), nvB = talNivelDe(xpA + xp);
  r.tal = { papel, xpA, xp, nvA, nvB, nuevas: habsDe(papel).filter(h => h.nv > nvA && h.nv <= nvB) };
  r.filas.push([papel === 'becario' ? tr('Nivel de becario') : tr('Nivel de colado'), tr('nivel {n}', { n: nvB }) + ' (+' + xp + ' XP)']);
  const local = () => { const t = talEstado(); t.xp[papel] = (+t.xp[papel] || 0) + xp; if (TAL.srv) TAL.srv[papel] += xp; guardaPartida(); talentosTitulos(); };
  if (RFS.activo()) {
    if (TAL.srv) TAL.srv[papel] = xpA + xp;      // lo previsto, hasta que conteste
    RFS.llama('rf_talento_xp', { p_papel: papel, p_puntos: xp }).then(() => talentosTitulos()).catch(e => { if (TAL.srv) TAL.srv[papel] = xpA; local(); if (!TALF_SIN.test(String((e && e.message) || e))) console.warn('[talentos]', e); });
  } else local();
  if (r.tal.nuevas.length) {      // sin el final a la vista (o en el PvP), también como aviso
    const h = r.tal.nuevas[r.tal.nuevas.length - 1];
    setTimeout(() => { if (E('p-fin').hidden) avisa((papel === 'becario' ? tr('¡Becario nivel {n}!', { n: nvB }) : tr('¡Colado nivel {n}!', { n: nvB })) + ' ' + (h.titulo ? tr('Nuevo título: {h}', { h: tr(h.n) }) : tr('Nueva habilidad: {h}', { h: tr(h.n) })), 'bueno'); }, 3600);
  }
}

/* ---------- en la pantalla del final ---------- */
function talFinCaja() {
  let caja = E('fin-tal'); if (caja) return caja;
  caja = document.createElement('div'); caja.className = 'fin-tal'; caja.id = 'fin-tal';
  caja.innerHTML = '<div class="ft-cab"><span class="ft-papel" id="ft-papel"></span><b id="ft-xp"></b></div><div class="ft-tubo"><canvas id="ft-tubo" aria-hidden="true"></canvas></div><div class="ft-nueva" id="ft-nueva" hidden></div>';
  (E('fin-pase') || E('fin-estrellas')).after(caja);
  return caja;
}
function talFinMuestra(r) {
  const caja = talFinCaja(); cancelAnimationFrame(TALF.raf); TALF.raf = 0;
  caja.hidden = !(r && r.tal); if (caja.hidden) return;
  const T = r.tal; caja.dataset.papel = T.papel;
  Object.assign(TALF, { r, v: T.xpA, meta: T.xpA + T.xp, nivel: T.nvA, espera: 1.3 });
  TALF.F = { t: 0, frac: 0, fase: 'espera', nivel: T.nvA, lleno: T.nvA >= TALENTOS.max, cols: TAL_COL[T.papel], burbujas: [], parts: [], flash: 0, R: 15, th: 22, vacia: 0, fiesta: 0 };
  E('ft-xp').textContent = '+' + T.xp + ' XP'; E('ft-nueva').hidden = true; E('ft-nueva').innerHTML = '';
  talFinTexto();
  TALF.ultimo = performance.now(); TALF.raf = requestAnimationFrame(talFinFotograma);
}
function talFinTexto() { E('ft-papel').textContent = (TALF.r.tal.papel === 'becario' ? tr('BECARIO') : tr('COLADO')) + ' · ' + tr('NIVEL {n}', { n: TALF.nivel }); }
const talFrac = v => { const n = TALF.nivel; if (n >= TALENTOS.max) return 1; const a = TALENTOS.acum[n], b = TALENTOS.acum[n + 1]; return Math.max(0, Math.min(1, (v - a) / (b - a))); };
function talFinFotograma(now) {
  const F = TALF.F, caja = E('fin-tal');
  if (E('p-fin').hidden || !caja || caja.hidden) { TALF.raf = 0; return; }
  const dt = Math.min(0.05, (now - TALF.ultimo) / 1000); TALF.ultimo = now; F.t += dt;
  if (F.fase === 'espera') { TALF.espera -= dt; F.frac = talFrac(TALF.v); if (TALF.espera <= 0) F.fase = 'llena'; }
  else if (F.fase === 'llena') {
    const tope = TALF.nivel >= TALENTOS.max ? TALF.v : Math.min(TALF.meta, TALENTOS.acum[TALF.nivel + 1]);
    TALF.v = Math.min(tope, TALF.v + Math.max(dt * 30, (tope - TALF.v) * dt * 3.2)); F.frac = talFrac(TALF.v);
    if (TALF.v >= tope - 0.5) { TALF.v = tope; if (TALF.nivel < TALENTOS.max && TALF.v >= TALENTOS.acum[TALF.nivel + 1]) talFinSube(); else F.fase = 'fin'; }
  } else if (F.fase === 'fiesta') { F.frac = 1; F.fiesta -= dt; if (F.fiesta <= 0) { F.fase = 'vacia'; F.vacia = 0.4; } }
  else if (F.fase === 'vacia') { F.vacia -= dt; F.frac = Math.max(0, F.vacia / 0.4); if (F.vacia <= 0) { TALF.nivel++; F.nivel = TALF.nivel; F.lleno = TALF.nivel >= TALENTOS.max; F.burbujas = []; F.fase = 'llena'; talFinTexto(); } }
  tuboPinta(E('ft-tubo'), F, dt);
  TALF.raf = requestAnimationFrame(talFinFotograma);
}
// sube de nivel: destello y chispas en el tubo pequeño, y la tarjeta de lo nuevo
function talFinSube() {
  const F = TALF.F, T = TALF.r.tal, n = TALF.nivel + 1;
  F.fase = 'fiesta'; F.fiesta = 1.2; F.flash = 1; play('levelup'); vibra(20);
  const L = finMedidas(F);
  for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 60 + Math.random() * 160; F.parts.push({ x: L.x0 + Math.random() * (L.x1 - L.x0), y: L.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, vida: 0.6 + Math.random() * 0.6, max: 1.2, s: 2 + Math.random() * 3, col: F.cols[i % F.cols.length], tipo: i % 3 ? 'confeti' : 'estrella', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14 }); }
  const h = T.nuevas.find(x => x.nv === n), caja = E('ft-nueva');
  if (!h) return;
  caja.innerHTML = '';
  const k = arLienzo(40, 40); arPinta(k, (c, w) => pintaInsignia(c, w, 'tal_' + h.id, h.titulo ? 'oro' : T.papel, 'lista')); caja.appendChild(k);
  const tx = elem('div', 'ft-nueva-t');
  tx.appendChild(elem('b', 'ol', T.papel === 'becario' ? tr('¡Becario nivel {n}!', { n }) : tr('¡Colado nivel {n}!', { n })));
  tx.appendChild(elem('span', '', (h.titulo ? tr('Nuevo título: {h}', { h: tr(h.n) }) : tr('Nueva habilidad: {h}', { h: tr(h.n) }))));
  caja.appendChild(tx); caja.hidden = false; caja.classList.remove('entra'); void caja.offsetWidth; caja.classList.add('entra');
  setTimeout(() => play('crown'), 200);
}
