// Fans of Rouflage · EL GACHAPÓN DE ARMARIO (pantalla): la máquina de cápsulas, los botones de 1 y 10 tiradas (en Gotas), lo que ha salido, las probabilidades
// a la vista y el botón de información. La lógica y las cifras están en gacha.js. Se abre desde MI PERFIL › GACHAPÓN, y VOLVER te devuelve al título.
'use strict';

const GACHA_UI = { ocupado: false };
const GACHA_COLOR = { comun: ['#dfe3ee', '#9aa3bd'], rara: ['#6fd0ff', '#2e8bff'], epica: ['#d9a0ff', '#8a3fe0'], legend: ['#ffe07a', '#e0a11f'] };

// una cápsula: la mitad de arriba del color de la rareza y la de abajo blanca
function pintaCapsula(c, w, rar) {
  const [claro, oscuro] = GACHA_COLOR[rar] || GACHA_COLOR.comun;
  c.save(); c.scale(w / 40, w / 40); c.translate(20, 20); c.rotate(-0.5);
  const mitad = (a, col) => { c.beginPath(); c.arc(0, 0, 13, a, a + Math.PI); c.closePath(); c.fillStyle = col; c.fill(); };
  mitad(Math.PI, claro); mitad(0, '#fff6ea');
  c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.moveTo(-13, 0); c.lineTo(13, 0); c.lineWidth = 2.4; c.stroke();
  c.beginPath(); c.ellipse(-5, -6.5, 2.6, 4.4, -0.7, 0, TAU); c.fillStyle = 'rgba(255,255,255,0.75)'; c.fill();
  c.beginPath(); c.arc(0, 0, 13, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 1.6; c.strokeStyle = oscuro; c.stroke();
  c.restore();
}
// la máquina: la animada del gashapón del Rumble (core/js/sistema/gachapon-anim.js y gachapon-clasica.js), con su cartel y los colores de
// las rarezas de Rouflage; al tirar, la misma animación (la cápsula sale, tiembla más cuanto mejor es y se abre con rayos)
const RAR_FX = { comun: 'common', rara: 'rare', epica: 'epic', legend: 'legendary' };
const GACHA_MAQ = { nombre: 'COSMÉTICOS', maquina: ['#e8453c', '#8a1d16', '#c22a20'],
  colores: Object.fromEntries(Object.entries(RAR_FX).map(([r, k]) => [k, [RAREZA_AR[r], ...GACHA_COLOR[r]]])) };
if (typeof RAR_ORDER === 'undefined') window.RAR_ORDER = { mythic: -1, legendary: 0, epic: 1, rare: 2, common: 3, basic: 4 };      // lo usa la animación (en los otros juegos viene de core/js/sistema/pantallas.js)
let _gachaRAF = 0;
function gachaDibuja() {
  if (E('p-gacha').hidden) { _gachaRAF = 0; return; }
  GACHA_FX.maquina(E('gacha-cv'), GACHA_MAQ, 'rf');
  _gachaRAF = requestAnimationFrame(gachaDibuja);
}
// el botón de información, dibujado: una «i» blanca en un círculo azul con su contorno
function pintaInfoBoton(c, w) {
  c.save(); c.scale(w / 40, w / 40); c.lineJoin = 'round';
  c.beginPath(); c.arc(20, 20, 16, 0, TAU); c.fillStyle = '#39a0e8'; c.fill(); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
  c.beginPath(); c.arc(20, 11.5, 2.8, 0, TAU); c.fillStyle = '#fff6ea'; c.fill(); c.lineWidth = 1.6; c.stroke();
  c.beginPath(); rrPathRF(c, 17, 16.5, 6, 14, 2.4); c.fill(); c.lineWidth = 1.6; c.stroke();
  c.restore();
}
const pctRF = v => (IDIOMA_RF === 'es' ? String(Math.round(v * 100) / 100).replace('.', ',') : String(Math.round(v * 100) / 100)) + ' %';

let _gachaReloj = 0;
function abreGacha() { gachaEstado(); if (RFS.activo()) RFS.relojes(); GACHA_UI.ocupado = false; E('gacha-result').hidden = true; E('gacha-res').innerHTML = ''; gachaPinta(); pantalla('p-gacha'); if (!_gachaRAF) _gachaRAF = requestAnimationFrame(gachaDibuja); gachaPintaGratis(); play('select'); clearInterval(_gachaReloj); _gachaReloj = setInterval(gachaPintaGratis, 1000); }
function cierraGacha() { if (GACHA_UI.ocupado) return; play('select'); clearInterval(_gachaReloj); irTitulo(); }

function gachaPinta() {
  const g = gachaEstado(), [t, n] = gachaCuenta();
  E('gacha-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones || 0}</b></span>`;
  E('gacha-cuenta').textContent = tr('Tienes {t} de {n} piezas del gachapón', { t, n });
  E('gacha-pity').textContent = tr('Garantías: una Rara o mejor cada {r} cápsulas, una Épica cada {e} y una Legendaria cada {l}. Llevas {a}, {b} y {c} desde la última.', { r: GACHA.pityRara, e: GACHA.pityEpica, l: GACHA.pityLegend, a: g.sinRara, b: g.sinEpica, c: g.sinLegend || 0 });
  for (const [id, k] of [['b-gacha-1', 1], ['b-gacha-10', 10]]) {
    // como los del Rumble: «x1» grande y debajo el precio con su gota; el x10, con su cartelito
    const b = E(id), coste = gachaCoste(k); b.innerHTML = (k === 10 ? `<span class="tag">${tr('LA FAVORITA')}</span>` : '') + 'x' + k;
    const s = document.createElement('small'); s.appendChild(iconoPeq(pintaGotas, 18)); s.appendChild(document.createTextNode(' ' + coste)); b.appendChild(s);
    b.classList.toggle('falta', SAVE.gotas < coste);
  }
  gachaPintaProbs(); gachaPintaGratis();
}
// los botones de las tiradas gratis, con los mismos textos que en el Rumble: lista, o cuánto falta (se repinta cada segundo)
const gachaCuenta1 = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), p = n => String(n).padStart(2, '0'), d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24; return (d ? d + ' d ' : '') + p(d ? h : Math.floor(s / 3600)) + ':' + p(Math.floor(s / 60) % 60) + ':' + p(s % 60); };
function gachaPintaGratis() {
  if (E('p-gacha').hidden) return;
  const f1 = gachaFalta1(), x = gachaX10(), pon = (id, listo, titulo, espera, cuenta) => {
    const b = E(id); b.classList.toggle('lista', listo); b.disabled = !listo;
    b.innerHTML = `<span class="bg-t">${tr(listo ? titulo : espera)}</span><b>${listo && !cuenta ? tr('¡LISTA!') : cuenta}</b>`;
  };
  pon('b-gacha-g1', f1 <= 0, 'TIRADA GRATIS x1', 'PRÓXIMA x1 GRATIS EN', f1 <= 0 ? '' : gachaCuenta1(f1));
  pon('b-gacha-g10', x.listo, '¡RECLAMA TU x10 GRATIS! CADUCA EN', 'x10 GRATIS EL DOMINGO EN', gachaCuenta1(x.falta));
}
// las probabilidades reales de cada rareza y de cada pieza (sin contar las garantías), siempre a la vista
function gachaPintaProbs() {
  const p = gachaProbs(), tabla = (cab, filas) => `<table class="probs-t"><tr><th>${tr(cab[0])}</th><th>${tr(cab[1])}</th></tr>${filas.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('')}</table>`;
  E('gacha-probs').innerHTML = `<summary class="ol">${tr('PROBABILIDADES')}</summary><div class="probs-body">`
    + `<p class="small-print">${tr('Son las probabilidades reales de cada cápsula, sin contar las garantías. Comprar Acciones no cambia ninguna: las cápsulas solo se pagan con Gotas.')}</p>`
    + tabla(['Rareza', 'Probabilidad'], p.rareza.map(([r, v]) => [tr(RAREZA_AR[r]), pctRF(v)]))
    + Object.keys(p.piezas).map(r => `<details class="probs-sub"><summary>${tr(RAREZA_AR[r])}: ${tr('cada pieza')}</summary>${tabla(['Pieza', 'Probabilidad'], p.piezas[r].map(([nom, v]) => [tr(nom), pctRF(v)]))}</details>`).join('')
    + `</div>`;
}

// una tirada: la máquina se agita un momento y salen las cápsulas, una a una. Con servidor tira él (servidor-economia.js); sin él, gacha.js
async function gachaTirar(k, gratis) {
  if (GACHA_UI.ocupado) return;
  if (gratis) { if (gratis === 'x1' ? gachaFalta1() > 0 : !gachaX10().listo) { play('deny'); return; } k = gratis === 'x10' ? 10 : 1; }
  else if (SAVE.gotas < gachaCoste(k)) { play('deny'); avisa(tr('Te faltan {n} Gotas: juega partidas y recoge el premio diario', { n: gachaCoste(k) - SAVE.gotas }), 'malo'); return; }
  GACHA_UI.ocupado = true;
  let sale;
  try { sale = RFS.activo() ? await gachaTiraServidor(k, gratis) : gachaTira(k, gratis); } catch (e) { GACHA_UI.ocupado = false; RFS.error(e); return; }
  if (!sale) { GACHA_UI.ocupado = false; play('deny'); return; }
  play('select');
  E('gacha-result').hidden = true; E('gacha-res').innerHTML = '';
  // la animación del Rumble: la manivela gira, sale la bola y se abre; al abrirse, el premio a pantalla completa y en el centro (gacha-premio.js)
  // con diez, core abre una sola cápsula (la de la mejor, que tiembla según su rareza) y las diez se destapan después en la rejilla del premio
  const rars = sale.map(x => x.it.r), mejor = rars.reduce((a, r) => (RAR_RANGO[r] > RAR_RANGO[a] ? r : a));
  GACHA_FX.tirada((sale.length > 1 ? [mejor] : rars).map(r => RAR_FX[r] || 'common'), GACHA_MAQ, () => gachaPremio(sale));
}
function preparaGacha() {
  const bi = E('b-gacha-info'); bi.innerHTML = ''; bi.appendChild(iconoPeq(pintaInfoBoton, 34));
  bi.onclick = () => { play('select'); E('gacha-info').hidden = !E('gacha-info').hidden; };
  E('b-gacha').onclick = abreGacha;
  E('b-gacha-g1').onclick = () => gachaTirar(1, 'x1');
  E('b-gacha-g10').onclick = () => gachaTirar(10, 'x10');
  E('b-gacha-1').onclick = () => gachaTirar(1);
  E('b-gacha-10').onclick = () => gachaTirar(10);
  E('b-gacha-volver').onclick = cierraGacha;
  E('b-gacha-vale').onclick = () => { if (!GACHA_UI.ocupado) { play('select'); E('gacha-result').hidden = true; } };
  E('b-gacha-tienda').onclick = () => { if (!GACHA_UI.ocupado) abreTienda('gacha'); };
  preparaGachaPremio();
}
