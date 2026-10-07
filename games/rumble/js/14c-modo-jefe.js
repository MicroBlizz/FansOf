// Fans of Rumble · Cartas y jefes (3/3): el Modo Jefe: elegir jefe y dificultad
'use strict';

/* ---------- v0.9.15: Modo Jefe: elegir jefe y dificultad ---------- */
function buildBossPrep() {
  const sel = SAVE.bossSel || (SAVE.bossSel = { wi: CEO_WI, d: 'n' }); if (!bossOpen(sel.wi)) sel.wi = CEO_WI; if (!BDIFF[sel.d]) sel.d = 'n';
  const wi = sel.wi, d = sel.d, B = bossOf(wi), BD = BDIFF[d], hp = bossHp(wi, d), key = wi + d, rec = SAVE.bossRec[key] || 0, bits = SAVE.bossPay[key] || 0, lv = Math.min(12, avgLevel(G.faction) + BD.lvl);
  const pick = $('#boss-pick');
  pick.innerHTML = WORLDS.map((w, i) => { const o = bossOpen(i), k = ['n', 'h', 'm'].filter(x => (SAVE.bossPay[i + x] || 0) & 8).length; return `<button class="bp${o ? '' : ' locked'}" data-bw="${i}" aria-pressed="${i === wi}" aria-label="${o ? bossOf(i).name : 'Bloqueado'}"><canvas data-ba="${BOSS_ART[i]}"></canvas><span>${o ? BOSS_SHORT[i] : 'Mundo ' + (i + 1)}</span>${k ? `<i class="bp-k">${'★'.repeat(k)}</i>` : ''}</button>`; }).join('');
  for (const cv of pick.querySelectorAll('canvas[data-ba]')) drawArt(cv, cv.dataset.ba, 50, 40);
  for (const b of pick.querySelectorAll('[data-bw]')) b.onclick = () => {
    const i = +b.dataset.bw; if (!bossOpen(i)) { toast(`Gana a ${bossOf(i).name} en la campaña (mundo ${i + 1}) para retarle aquí`); play('deny'); return; }
    sel.wi = i; saveGame(); play('select'); buildBossPrep();
  };
  const on = pick.querySelector('[aria-pressed="true"]'); if (on) pick.scrollLeft = Math.max(0, on.offsetLeft - pick.clientWidth / 2 + on.offsetWidth / 2);
  for (const b of document.querySelectorAll('[data-bd]')) b.setAttribute('aria-pressed', String(b.dataset.bd === d));
  for (const x of ['n', 'h', 'm']) $('#bd-' + x).textContent = `${fmt(bossHp(wi, x))} de vida${x === 'n' ? '' : ' · x' + BDIFF[x].pay}`;
  const tiers = BOSS_TIERS.map((f, i) => { const t = `${Math.round(f * 100)} % → ${BOSS_TGEMS[i] * BD.pay}`; return bits & (1 << i) ? `<s>${t}</s>` : t; }).join(' · '), kt = `derrotarlo → ${BOSS_KGEMS * BD.pay}`;
  $('#prep-info').innerHTML = `<b class="ol">${B.name}</b> <span class="cd-badge ${d} ol"${d === 'n' ? ' hidden' : ''}>${BD.name.toUpperCase()}</span><br>Sede de ${fmt(hp)} de vida y 4 minutos para hacerle todo el daño posible. Rival de nivel ${lv}${BD.gear ? ', con tropas de élite y equipo' : ''}. Récord: <b>${fmt(rec)}</b> (${Math.min(100, Math.floor(rec / hp * 100))} %)<br><span class="rw">Gemas la primera vez que le quitas el ${tiers} · ${bits & 8 ? `<s>${kt}</s>` : kt}. Y oro según el daño (más si lo derrotas).</span>`;
}
for (const b of document.querySelectorAll('[data-bd]')) b.addEventListener('click', () => { SAVE.bossSel.d = b.dataset.bd; saveGame(); play('select'); buildBossPrep(); });

/* ---------- v0.9.15: equipo compartido y objetos de facción ---------- */
function facItemsRetro() {   // a quien ya ganó a un jefe en Difícil antes de esta versión, se le da su objeto de facción
  SAVE.facItem = SAVE.facItem || {}; const got = [];
  WORLDS.forEach((w, wi) => { const f = worldFac(wi), id = w.levels[3].id; if (f && !SAVE.facItem[f] && (starsD(id, 'h') > 0 || starsD(id, 'x') > 0 || starsD(id, 'm') > 0)) { SAVE.facItem[f] = 1; { const c = newCopy('eq', FAC_ITEM[f], 2), clv = ECO.ganar('objeto', {}, { tipo: 'objeto', regalo: 'facitem', fac: f, id: c.id, q: c.q }); if (clv) c.pend = clv; got.push(ITEMS[c.id].name); } } });
  if (got.length) setTimeout(() => toast(`¡Objetos de facción nuevos en tu inventario: ${got.join(', ')}!`, true), 2500);
}

/* ---------- lo que este juego añade a la colección y al gashapón comunes (core/js/sistema/) ---------- */
hook('coleccion.arriba', fac => deckBarHtml(fac));                       // el mazo de la facción
hook('coleccion.abajo', (fac, lock) => gachaRows(fac, lock));            // sus cartas del gashapón
hook('coleccion.abrir', () => { deckEdit = null; });                  // al entrar en la colección desde el menú, el mazo vuelve plegado
hook('coleccion.nombre', k => (CFG.cards[k].gacha ? starsHtml(k) : ''));   // las estrellas de una carta del gashapón
hook('coleccion.lista', list => {
  for (const cv of list.querySelectorAll('canvas[data-dk]')) drawArt(cv, cv.dataset.dk, 40, 36);
  const db = $('#btn-deck'); if (db) db.onclick = () => { play('select'); openDeck(collFac); };
  deckBind(list);
  list.querySelectorAll('[data-goc]').forEach(b => { b.onclick = () => { play('select'); gachaTab = 'cd'; updateWallets(); openGacha(); }; });
});
// la tercera máquina del gashapón: cartas (hechizos y mata-sanadores)
MAQUINAS.cd = { nombre: 'CARTAS', maquina: ['#8b3dff', '#5b21b6', '#4c1d95'], colores: CARD_RAR, tirar: cardPull, rpc: 'tirar_cartas', deServidor: cardDeServidor, ensenar: showCardPulls, textos: buildCardGachaText,
  probs() { const O = ECON.cardOdds, lista = {};
    for (const r of ['legendary', 'epic', 'rare']) { const ks = cardPool(r); lista[r] = ks.map(k => [CFG.cards[k].name || k, O[r] / ks.length]); }
    return { nombre: 'CARTAS', rareza: ['legendary', 'epic', 'rare'].map(r => [r, O[r]]), lista, nota: 'Solo salen cartas de las facciones que ya tienes.' }; },
  verEn() { deckEdit = null; collFac = cardsGoFac || collFac; updateWallets(); show('scr-coll'); buildColl(); } };
