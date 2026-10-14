// Fans Of · FRASES Y EMOTICONOS: lo que dices en la partida sin poder escribir (ni insultar). Solo para lucirse.
// Datos de cada juego en RETOS.armario.frases ({ t, rar, serie }) y RETOS.armario.emotes ({ name, k: personaje, ic: icono, rar, serie, anim }).
// Se ganan en los pases ({ frase: id } o { emote: id }) y se guardan en SAVE.look como los marcos (core/js/armario.js).
// Llevas puestas FR_N frases y FR_N emoticonos (SAVE.look.fPuestas y ePuestas), que se eligen en la pestaña FRASES del armario.
// Los dibujos de los emoticonos: core/js/frases-arte.js. Lo que pasa en la partida (el panel, los bocadillos, el rival) es de cada juego: games/rumble/js/22-frases.js.
'use strict';
const FR_N = 4;
const FRD = t => ((ARM() || {})[t === 'frase' ? 'frases' : 'emotes']) || {};
const fraseTipo = r => (r.frase ? ['frase', r.frase] : r.emote ? ['emote', r.emote] : [null, null]);
function fraseDef(r) { const [t, id] = fraseTipo(r); return t ? FRD(t)[id] || null : null; }
const fraseTxt = id => (FRD('frase')[id] ? tr(FRD('frase')[id].t) : '');
function fraseNombre(r) { const D = fraseDef(r); if (!D) return ''; return r.frase ? `la frase «${tr(D.t)}»` : `el emoticono ${tr(D.name)}`; }
// las puestas: siempre FR_N de cada, de las que tienes (si falta alguna, se rellena con las de serie y luego con las demás)
// quien ya cobró un nivel del pase que ahora trae frase o emoticono (antes daba oro o gemas) se lo lleva igualmente
function frasesRetro() {
  if (typeof PASES === 'undefined' || !ARM()) return 0; let n = 0;
  for (const p in PASES) { const S = pSave(p); for (const [tr, k] of [['free', 'free'], ['paid', 'paid']]) for (const i of S[k]) { const r = pReward(p, tr, i), [t, id] = fraseTipo(r); if (t && FRD(t)[id] && darLook(t, id)) n++; } }
  return n;
}
function frasesPuestas() {
  frasesRetro();
  const L = lookDe(), out = {};
  for (const [t, k, lista] of [['frase', 'fPuestas', 'frases'], ['emote', 'ePuestas', 'emotes']]) {
    const D = FRD(t), mias = L[lista].filter(id => D[id]);
    let P = (Array.isArray(L[k]) ? L[k] : []).filter((id, i, a) => mias.includes(id) && a.indexOf(id) === i);
    for (const id of mias) if (P.length < FR_N && !P.includes(id)) P.push(id);
    out[t] = L[k] = P.slice(0, FR_N);
  }
  return out;
}

/* ---------- el dibujo de cada emoticono está en core/js/frases-arte.js (pintaEmote) ---------- */
function pintaEmotes(root) { for (const cv of root.querySelectorAll('canvas[data-em]')) pintaEmote(cv, cv.dataset.em, +(cv.dataset.lw || 46)); }
// la casilla del pase
function fraseCelda(r) {
  const D = fraseDef(r); if (!D) return '';
  return r.frase ? `<span class="pr-lbl pr-fr"><small>FRASE</small><b>«${esc(tr(D.t))}»</b></span>`
    : `<canvas class="pr-mk" data-em="${r.emote}" data-lw="46" aria-hidden="true"></canvas><span class="pr-lbl"><small>EMOTICONO</small><b>${esc(D.name)}</b></span>`;
}

/* ---------- la pestaña FRASES del armario ---------- */
let frSel = null;   // { t, id }: lo que has tocado para ponértelo; ahora eliges por cuál lo cambias
function frasesTab() {
  const b = $('[data-armt="frase"]'); if (!b) return;
  const L = lookDe(), n = L.frases.filter(id => FRD('frase')[id]).length + L.emotes.filter(id => FRD('emote')[id]).length;
  b.innerHTML = `FRASES <small>${n}/${Object.keys(FRD('frase')).length + Object.keys(FRD('emote')).length}</small>`;
}
function frItem(t, id, o) {   // o: { slot, mio, on, nuevo }
  const D = FRD(t)[id], st = `style="--rc:${rarColor(D.rar)};--rd:${rarColor(D.rar, 2)}"`;
  const cls = `fr-${t === 'frase' ? 'f' : 'e'}${o.slot != null ? ' slot' : ''}${o.mio ? '' : ' lock'}${o.on ? ' on' : ''}${frSel && frSel.t === t && o.slot != null ? ' target' : ''}${frSel && frSel.t === t && frSel.id === id && o.slot == null ? ' pick' : ''} rar-${D.rar}`;
  const data = o.slot != null ? `data-frs="${t}:${o.slot}"` : `data-frp="${t}:${id}"`;
  const pie = o.slot != null ? '' : `<small>${o.on ? 'PUESTA' : o.mio ? esc(RARITY[D.rar][0]) : esc(lookOrigen(t, id))}</small>`;
  const lk = o.mio ? '' : `<span class="arm-lk">${CANDADO_SVG}</span>`;
  const nw = o.nuevo ? '<span class="arm-new ol">¡NUEVA!</span>' : '';
  return t === 'frase' ? `<button class="${cls}" ${data} ${st}>${nw}<span class="fr-txt">${esc(D.t)}</span>${pie}${lk}</button>`
    : `<button class="${cls}" ${data} ${st} aria-label="${esc(D.name)}">${nw}<canvas data-em="${id}" data-lw="${o.slot != null ? 58 : 64}" aria-hidden="true"></canvas>${o.slot != null ? '' : `<b>${esc(D.name)}</b>`}${pie}${lk}</button>`;
}
function buildFrasesArm(box) {
  const L = lookDe(), P = frasesPuestas(), nuevo = (t, id) => (L.nuevos || []).includes(t + ':' + id);
  const orden = (t, lista) => { const ks = Object.keys(FRD(t)); return ks.slice().sort((a, b) => (lista.includes(b) - lista.includes(a)) || (ks.indexOf(a) - ks.indexOf(b))); };
  const ayuda = frSel ? `Toca la ${frSel.t === 'frase' ? 'frase' : 'casilla'} de arriba que quieres cambiar. Toca otra vez para cancelar.` : 'Las que llevas puestas salen en la partida. Toca una de abajo para cambiarla por otra.';
  box.className = 'scroll-list fr-arm';
  box.innerHTML = `<div class="fr-puestas"><div class="fr-h ol">LLEVAS PUESTAS</div><div class="fr-row f">${P.frase.map((id, i) => frItem('frase', id, { slot: i, mio: true })).join('')}</div><div class="fr-row e">${P.emote.map((id, i) => frItem('emote', id, { slot: i, mio: true })).join('')}</div><p class="fr-ayuda">${ayuda}</p></div>`
    + `<div class="fr-h ol">FRASES</div><div class="fr-list">${orden('frase', L.frases).map(id => frItem('frase', id, { mio: L.frases.includes(id), on: P.frase.includes(id), nuevo: nuevo('frase', id) })).join('')}</div>`
    + `<div class="fr-h ol">EMOTICONOS</div><div class="fr-grid">${orden('emote', L.emotes).map(id => frItem('emote', id, { mio: L.emotes.includes(id), on: P.emote.includes(id), nuevo: nuevo('emote', id) })).join('')}</div>`;
  pintaEmotes(box);
  for (const b of box.querySelectorAll('[data-frp]')) b.onclick = () => {
    const [t, id] = b.dataset.frp.split(':');
    if (!tieneLook(t, id)) { play('deny'); toast(`${t === 'frase' ? '«' + tr(FRD(t)[id].t) + '»' : tr(FRD(t)[id].name)}: ${lookOrigen(t, id)}`); return; }
    if (frasesPuestas()[t].includes(id)) { play('select'); toast(t === 'frase' ? 'Ya la llevas puesta' : 'Ya lo llevas puesto'); return; }
    frSel = frSel && frSel.t === t && frSel.id === id ? null : { t, id }; play('select'); frasesRepinta();
  };
  for (const b of box.querySelectorAll('[data-frs]')) b.onclick = () => {
    const [t, i] = b.dataset.frs.split(':');
    if (!frSel || frSel.t !== t) { play('select'); toast(t === 'frase' ? 'Toca una frase de abajo para ponerla aquí' : 'Toca un emoticono de abajo para ponerlo aquí'); return; }
    const k = t === 'frase' ? 'fPuestas' : 'ePuestas', Lk = lookDe(); Lk[k] = frasesPuestas()[t].slice(); Lk[k][+i] = frSel.id;
    frSel = null; saveGame(); play('card'); frasesRepinta();
  };
}
function frasesRepinta() { const box = $('#arm-list'), y = box.scrollTop; buildFrasesArm(box); box.scrollTop = y; }
function openFrases(sel) { frSel = sel || null; openArmario('frase'); if (sel) { const b = document.querySelector(`[data-frp="${sel.t}:${sel.id}"]`); if (b) try { b.scrollIntoView({ block: 'center' }); } catch (e) { /* sin scroll */ } } }

/* ---------- al ganar una: enseñarla en grande y ofrecer ponérsela ---------- */
function frasePremioBox(r, n = 1) {
  const [t, id] = fraseTipo(r), D = fraseDef(r); if (!D) return;
  $('#cf-title').textContent = t === 'frase' ? '¡FRASE NUEVA!' : '¡EMOTICONO NUEVO!';
  const rar = `<span class="lp-rar" style="--rc:${rarColor(D.rar)}">${esc(RARITY[D.rar][0])}</span>`;
  const otros = n > 1 ? `<small>Y ${n - 1} ${n - 1 > 1 ? 'cosas más' : 'cosa más'} para tu armario.</small>` : '';
  $('#cf-body').innerHTML = t === 'frase'
    ? `<div class="lp-box fr-lp" style="--rc:${rarColor(D.rar)}"><span class="fr-bub">${esc(D.t)}</span>${rar}</div>${otros}`
    : `<div class="lp-box" style="--rc:${rarColor(D.rar)}"><canvas data-em="${id}" data-lw="132" aria-hidden="true"></canvas><b class="ol">${esc(D.name)}</b>${rar}</div>${otros}`;
  pintaEmotes($('#cf-body'));
  $('#cf-btns').innerHTML = '<button class="btn-ghost ol btn-ok" id="cf-ok">¡PONÉRMELA!</button><button class="btn-ghost ol" id="cf-no">LUEGO</button>';
  $('#scr-confirm').hidden = false; play('levelup');
  const close = () => { $('#scr-confirm').hidden = true; };
  $('#cf-no').onclick = () => { play('select'); close(); };
  $('#cf-ok').onclick = () => { play('select'); close(); openFrases({ t, id }); };
}
if (ARM() && $('[data-armt="frase"]')) $('[data-armt="frase"]').addEventListener('click', () => { frSel = null; });
