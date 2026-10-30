// Fans of Rumble · Controles: tocar y arrastrar cartas
'use strict';
/* =========================================================
   UI / INPUT
   ========================================================= */
const stage = $('#stage'), ui = $('#ui');
// tray: slot -1 = leader (always there), slots 0-3 = hand
$('#cards').innerHTML = [-1, 0, 1, 2, 3].map(s => `<button class="card" data-slot="${s}"><span class="card-art"><canvas></canvas></span><span class="cost ol"></span><span class="card-lvl"></span><span class="card-name ol"></span><span class="card-tag"></span><span class="card-charge"></span><span class="card-lock ol" hidden></span></button>`).join('');
const elCards = [...document.querySelectorAll('#cards .card')];
for (const el of elCards) { el._slot = +el.dataset.slot; el._art = el.querySelector('canvas'); el._charge = el.querySelector('.card-charge'); el._lock = el.querySelector('.card-lock'); el._wasPoor = true; el._lockTxt = ''; el._key = null; }
const input = { card: null, slot: null, dragging: false, pointerId: null, startX: 0, startY: 0, selected: null, selSlot: null, ghost: null, touch: false };
const slotKey = s => (s < 0 ? FACTIONS[verFac()].leader : S[verEquipo()].hand[s]);
function renderCard(el, k) {
  const c = CFG.cards[k]; el.dataset.card = k; el.dataset.rarity = c.rarity; el.dataset.spell = c.spell ? '1' : '';
  el.querySelector('.cost').textContent = c.cost; el.querySelector('.card-name').textContent = c.name; el.querySelector('.card-tag').textContent = c.tag;
  fitText(el.querySelector('.card-name'), 13.5, 8); fitText(el.querySelector('.card-tag'), 10.5, 7.5);
  el.querySelector('.card-lvl').textContent = 'NV ' + uSave(k).lvl;
  el.setAttribute('aria-label', `${c.name}, ${c.rar}, cuesta ${c.cost} de CAOS`);
  drawArt(el._art, k, 86, 58);
}
$('#fac-grid').innerHTML = FACTION_ORDER.map(f => { const F = FACTIONS[f]; return `<button class="diff-opt fac-opt" data-fac="${f}" aria-pressed="false" style="--fc: ${FAC_COLOR[f]}"><canvas></canvas><b class="ol">${F.name}</b><small>${ICONS[F.icon]} ${F.pname}</small></button>`; }).join('');
