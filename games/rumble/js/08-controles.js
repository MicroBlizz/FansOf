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
const slotKey = s => (s < 0 ? FACTIONS[G.faction].leader : S.p.hand[s]);
// card framing per character: [x offset (fraction of width), height factor]
const ART_FIT = { fox: [0.04, 0.92], junkcoon: [-0.04, 0.92], necrolord: [-0.06, 1], skullknight: [-0.05, 1], stitchbrute: [-0.05, 1], mechavaca: [0, 1], bunny: [0, 1],
  twitchking: [-0.06, 1], hypetrain: [-0.04, 0.86], banhammer: [-0.1, 0.98], viralbot: [-0.03, 0.92], snackmom: [-0.06, 0.94], hypebeast: [-0.03, 0.92],
  epicchampion: [-0.04, 1], minotaur: [-0.06, 1], thundergod: [-0.04, 0.98], shieldmaiden: [-0.05, 0.96], cupidarcher: [-0.04, 0.92], medusa: [0, 0.96],
  cybermarine: [-0.1, 1], siegemech: [-0.08, 1], neonsniper: [-0.12, 0.9], cyberninja: [-0.06, 0.92], techdroid: [0, 0.9], hackerkid: [-0.06, 0.92],
  memelord: [-0.06, 1], chonkcat: [0, 1], trollbot: [-0.06, 0.96], stonks: [-0.08, 0.96], synthcat: [-0.04, 0.92], gifblaster: [-0.06, 0.92],
  progamer: [-0.06, 1], recreativa: [0, 1], ragequitter: [0.03, 0.96], coleccionista: [0.02, 0.94], modder: [-0.04, 0.94], speedrunner: [0.02, 0.92],
  vikingo: [-0.02, 1], titanbeta: [0, 1], rockracer: [0, 0.78], ghostagent: [-0.12, 0.92], retromarine: [-0.07, 0.94],
  directora: [-0.05, 1], kaiju: [0.08, 1], heroe: [0, 0.94], detective: [-0.07, 0.94], spoiler: [-0.06, 0.94], doble: [0, 0.92] };
function drawArt(cv, key, LW, LH) {
  const R2 = 3; cv.width = LW * R2; cv.height = LH * R2; const x = cv.getContext('2d'); x.setTransform(R2, 0, 0, R2, 0, 0); x.clearRect(0, 0, LW, LH);
  x.fillStyle = 'rgba(20,10,30,.25)'; x.beginPath(); x.ellipse(LW / 2, LH - 4, LW * 0.32, Math.max(2, LH * 0.08), 0, 0, Math.PI * 2); x.fill();
  const h = LH - 8, n = Math.min(3, (CFG.cards[key] && CFG.cards[key].count) || 1);
  if (n === 2) { drawVector(x, key, LW / 2 - LW * 0.15, LH - 4, h * 0.74, 1); drawVector(x, key, LW / 2 + LW * 0.15, LH - 2, h * 0.8, -1); }
  else if (n === 3) { const hs = key === 'skeleton' ? 0.82 : 0.66; drawVector(x, key, LW / 2 - LW * 0.24, LH - 5, h * hs, 1); drawVector(x, key, LW / 2 + LW * 0.24, LH - 5, h * hs, -1); drawVector(x, key, LW / 2, LH - 2, h * (hs + 0.1), 1); }
  else { const f = ART_FIT[key] || [0, 0.92]; drawVector(x, key, LW / 2 + f[0] * LW, LH - 3, h * f[1], 1); }
}
function renderCard(el, k) {
  const c = CFG.cards[k]; el.dataset.card = k; el.dataset.rarity = c.rarity; el.dataset.spell = c.spell ? '1' : '';
  el.querySelector('.cost').textContent = c.cost; el.querySelector('.card-name').textContent = c.name; el.querySelector('.card-tag').textContent = c.tag;
  fitText(el.querySelector('.card-name'), 13.5, 8); fitText(el.querySelector('.card-tag'), 10.5, 7.5);
  el.querySelector('.card-lvl').textContent = 'NV ' + uSave(k).lvl;
  el.setAttribute('aria-label', `${c.name}, ${c.rar}, cuesta ${c.cost} de CAOS`);
  drawArt(el._art, k, 86, 58);
}
$('#fac-grid').innerHTML = FACTION_ORDER.map(f => { const F = FACTIONS[f]; return `<button class="diff-opt fac-opt" data-fac="${f}" aria-pressed="false" style="--fc: ${FAC_COLOR[f]}"><canvas></canvas><b class="ol">${F.name}</b><small>${ICONS[F.icon]} ${F.pname}</small></button>`; }).join('');
