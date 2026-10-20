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
// la máquina: cúpula con cápsulas, cuerpo rojo con la ranura de las Gotas y la bandeja
function pintaMaquina(c, w) {
  c.save(); c.scale(w / 120, w / 120); c.lineJoin = 'round';
  c.beginPath(); c.arc(60, 46, 38, Math.PI, 0); c.lineTo(98, 66); c.lineTo(22, 66); c.closePath(); c.fillStyle = 'rgba(190,235,255,0.55)'; c.fill(); c.lineWidth = 3.4; c.strokeStyle = OL; c.stroke();
  [['comun', 38, 56], ['rara', 58, 60], ['epica', 80, 55], ['comun', 48, 38], ['rara', 70, 40], ['comun', 60, 24]].forEach(([r, x, y]) => { c.save(); c.translate(x - 12, y - 12); pintaCapsula(c, 24, r); c.restore(); });
  c.beginPath(); rrPathRF(c, 18, 64, 84, 46, 8); c.fillStyle = '#e8453c'; c.fill(); c.lineWidth = 3.4; c.strokeStyle = OL; c.stroke();
  c.beginPath(); rrPathRF(c, 28, 72, 30, 14, 4); c.fillStyle = '#2a1a3a'; c.fill(); c.lineWidth = 2.4; c.stroke();
  c.beginPath(); c.arc(76, 80, 9, 0, TAU); c.fillStyle = '#ffcb3d'; c.fill(); c.lineWidth = 2.6; c.stroke();
  c.beginPath(); c.moveTo(76, 73); c.lineTo(76, 87); c.lineWidth = 2.4; c.stroke();
  c.beginPath(); rrPathRF(c, 38, 94, 44, 14, 5); c.fillStyle = '#2a1a3a'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OL; c.stroke();
  c.restore();
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
function abreGacha() { gachaEstado(); GACHA_UI.ocupado = false; E('gacha-resultado').hidden = true; E('gacha-res').innerHTML = ''; gachaPinta(); pantalla('p-gacha'); gachaPintaGratis(); play('select'); clearInterval(_gachaReloj); _gachaReloj = setInterval(gachaPintaGratis, 1000); }
function cierraGacha() { if (GACHA_UI.ocupado) return; play('select'); clearInterval(_gachaReloj); irTitulo(); }

function gachaPinta() {
  const g = gachaEstado(), [t, n] = gachaCuenta();
  E('gacha-cartera').innerHTML = `<span>${tr('Gotas')} <b>${SAVE.gotas}</b></span><span>${tr('Acciones')} <b>${SAVE.acciones || 0}</b></span>`;
  arPinta(E('gacha-maquina'), (c, w) => pintaMaquina(c, w));
  E('gacha-cuenta').textContent = tr('Tienes {t} de {n} piezas del gachapón', { t, n });
  E('gacha-pity').textContent = tr('Garantías: una Rara o mejor cada {r} cápsulas y una Épica cada {e}. Llevas {a} y {b} desde la última.', { r: GACHA.pityRara, e: GACHA.pityEpica, a: g.sinRara, b: g.sinEpica });
  for (const [id, k] of [['b-gacha-1', 1], ['b-gacha-10', 10]]) {
    const b = E(id), coste = gachaCoste(k); b.innerHTML = '';
    b.appendChild(iconoPeq(pintaGotas, 24));
    const s = document.createElement('span'); s.textContent = tr(k === 1 ? '1 CÁPSULA · {n}' : '10 CÁPSULAS · {n}', { n: coste }); b.appendChild(s);
    b.classList.toggle('falta', SAVE.gotas < coste);
  }
  gachaPintaProbs(); gachaPintaGratis();
}
// el botón de la tirada gratis: lista, o cuánto falta (se repinta cada segundo)
function gachaPintaGratis() {
  const b = E('b-gacha-gratis'); if (!b || E('p-gacha').hidden) return;
  const falta = gachaGratisEn(), k = gachaGratisN(); b.classList.toggle('falta', falta > 0);
  if (falta > 0) { const s = Math.ceil(falta / 1000), t = s >= 3600 ? Math.floor(s / 3600) + ' h ' + String(Math.floor(s % 3600 / 60)).padStart(2, '0') + ' min' : Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); b.textContent = tr('TIRADA GRATIS en {t}', { t }); }
  else b.textContent = tr(k === 10 ? 'TIRADA GRATIS · ¡DOMINGO, DE 10!' : 'TIRADA GRATIS');
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

// una tirada: la máquina se agita un momento y salen las cápsulas, una a una
function gachaTirar(k, gratis) {
  if (GACHA_UI.ocupado) return;
  if (gratis) { if (gachaGratisEn() > 0) { play('deny'); return; } k = gachaGratisN(); }
  else if (SAVE.gotas < gachaCoste(k)) { play('deny'); avisa(tr('Te faltan {n} Gotas: juega partidas y recoge el premio diario', { n: gachaCoste(k) - SAVE.gotas }), 'malo'); return; }
  const sale = gachaTira(k, gratis); if (!sale) { play('deny'); return; }
  GACHA_UI.ocupado = true; play('select');
  const maq = E('gacha-maquina'), res = E('gacha-res'); E('gacha-resultado').hidden = true; res.innerHTML = '';
  maq.classList.remove('agita'); void maq.offsetWidth; maq.classList.add('agita');
  setTimeout(() => {
    maq.classList.remove('agita'); E('gacha-resultado').hidden = false;
    sale.forEach((x, i) => setTimeout(() => {
      res.appendChild(gachaTarjeta(x)); play(x.it.r === 'epica' ? 'crown' : 'select');
      if (i === sale.length - 1) { GACHA_UI.ocupado = false; gachaPinta(); }
    }, i * 170));
  }, 650);
}
function gachaTarjeta(x) {
  const d = document.createElement('div'); d.className = 'gc-carta gc-' + x.it.r + (x.nuevo ? ' nuevo' : '');
  const k = arLienzo(54, 54); arPinta(k, (c, w) => x.it.x(c, w)); d.appendChild(k);
  const n = document.createElement('b'); n.textContent = tr(x.it.n); d.appendChild(n);
  const s = document.createElement('small'); s.textContent = tr(RAREZA_AR[x.it.r]) + ' · ' + tr(arCat(x.cat).corto); d.appendChild(s);
  const e = document.createElement('i'); e.textContent = x.nuevo ? tr('¡NUEVO!') : tr('Repetido: +{n} Gotas', { n: x.devuelve }); d.appendChild(e);
  if (x.nuevo && !arCat(x.cat).conjuntos) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'boton peq'; b.textContent = tr('Ponérmelo');
    b.onclick = () => { armarioEstado().puesto[x.cat] = x.it.id; guardaPartida(); play('crown'); b.disabled = true; b.textContent = tr('Puesto'); };
    d.appendChild(b);
  }
  return d;
}
function preparaGacha() {
  const bi = E('b-gacha-info'); bi.innerHTML = ''; bi.appendChild(iconoPeq(pintaInfoBoton, 34));
  bi.onclick = () => { play('select'); E('gacha-info').hidden = !E('gacha-info').hidden; };
  E('b-gacha').onclick = abreGacha;
  E('b-gacha-gratis').onclick = () => gachaTirar(1, true);
  E('b-gacha-1').onclick = () => gachaTirar(1);
  E('b-gacha-10').onclick = () => gachaTirar(10);
  E('b-gacha-volver').onclick = cierraGacha;
  E('b-gacha-vale').onclick = () => { if (!GACHA_UI.ocupado) { play('select'); E('gacha-resultado').hidden = true; } };
  E('b-gacha-tienda').onclick = () => { if (!GACHA_UI.ocupado) abreTienda('gacha'); };
}
