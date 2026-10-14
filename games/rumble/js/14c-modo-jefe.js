// Fans of Rumble · Cartas y jefes (3/3): el Modo Jefe: elegir jefe y dificultad
'use strict';

/* ---------- Modo Jefe: elegir jefe y dificultad (v0.9.15) · v0.9.71: el jefe en grande, con su aura, flechas y puntitos ---------- */
let bossVer = null;   // el jefe que se está mirando (puede estar bloqueado); el que se juega es SAVE.bossSel.wi (siempre uno abierto)
const BOSS_AURA = { microblizz: '#4f8dff', phony: '#ffcb3d', iahorro: '#3fe0d0' };
const BOSS_HP_MAX = Math.max(...BOSS_HP) * BDIFF.m.hp;   // para que la barra de vida crezca con el jefe y la dificultad
function buildBossPrep() {
  const sel = SAVE.bossSel || (SAVE.bossSel = { wi: CEO_WI, d: 'n' }); if (!bossOpen(sel.wi)) sel.wi = CEO_WI; if (!BDIFF[sel.d]) sel.d = 'n';
  if (bossVer === null || !WORLDS[bossVer]) bossVer = sel.wi;
  const wi = bossVer, open = bossOpen(wi), d = sel.d, B = bossOf(wi), BD = BDIFF[d], hp = bossHp(wi, d), key = wi + d, rec = SAVE.bossRec[key] || 0, bits = SAVE.bossPay[key] || 0, lv = Math.min(12, avgLevel(G.faction) + BD.lvl);
  if (open && sel.wi !== wi) { sel.wi = wi; saveGame(); }
  const n = WORLDS.length, kills = ['n', 'h', 'm'].filter(x => (SAVE.bossPay[wi + x] || 0) & 8).length, aura = BOSS_AURA[B.efac] || FAC_COLOR[B.efac] || '#ff6b6b';
  const pick = $('#boss-pick');
  pick.innerHTML = `<div class="bs-stage cd-${d}${open ? '' : ' locked'}" style="--aura:${aura}">
      <button class="bs-arrow ol" data-bs="-1" aria-label="Jefe anterior">◀</button>
      <div class="bs-hero"><div class="bs-rays"></div><div class="bs-aura"></div><canvas class="bs-art" id="bs-art"></canvas>${open ? '' : '<span class="bs-lock ol">BLOQUEADO</span>'}</div>
      <button class="bs-arrow ol" data-bs="1" aria-label="Jefe siguiente">▶</button></div>
    <div class="bs-name ol-big">${open ? B.name.toUpperCase() : '???'}</div>
    <div class="bs-hp cd-${d}"><i style="width:${Math.max(8, Math.round(hp / BOSS_HP_MAX * 100))}%"></i><span class="ol">${open ? fmt(hp) + ' de vida' : 'Gánale en la campaña para retarle'}</span></div>
    <div class="bs-meta">${open ? `<span>Récord: ${fmt(rec)} (${Math.min(100, Math.floor(rec / hp * 100))} %)</span>` : ''}<span>Jefe ${wi + 1} de ${n}</span>${kills ? `<span class="bs-k">derrotado ${'★'.repeat(kills)}</span>` : ''}</div>
    <div class="bs-dots">${WORLDS.map((w, i) => `<button class="bs-dot${i === wi ? ' on' : ''}${bossOpen(i) ? '' : ' off'}" data-bw="${i}" aria-label="Jefe ${i + 1}"></button>`).join('')}</div>`;
  drawArt($('#bs-art'), BOSS_ART[wi], 210, 176);
  const ver = i => { bossVer = (i + n) % n; play('select'); buildBossPrep(); };
  for (const b of pick.querySelectorAll('[data-bs]')) b.onclick = () => ver(wi + +b.dataset.bs);
  for (const b of pick.querySelectorAll('[data-bw]')) b.onclick = () => ver(+b.dataset.bw);
  for (const b of document.querySelectorAll('[data-bd]')) b.setAttribute('aria-pressed', String(b.dataset.bd === d));
  for (const x of ['n', 'h', 'm']) $('#bd-' + x).textContent = `${fmt(bossHp(wi, x))} de vida${x === 'n' ? '' : ' · x' + BDIFF[x].pay}`;
  const tiers = BOSS_TIERS.map((f, i) => { const t = `${Math.round(f * 100)} % → ${BOSS_TGEMS[i] * BD.pay}`; return bits & (1 << i) ? `<s>${t}</s>` : t; }).join(' · '), kt = `derrotarlo → ${BOSS_KGEMS * BD.pay}`;
  $('#prep-info').innerHTML = open
    ? `<span class="cd-badge ${d} ol"${d === 'n' ? ' hidden' : ''}>${BD.name.toUpperCase()}</span> <span>Sede de ${fmt(hp)} de vida y 4 minutos para hacerle todo el daño posible. Rival de nivel ${lv}${BD.gear ? ', con tropas de élite y equipo' : ''}.</span><br><span class="rw">Gemas la primera vez que le quitas el ${tiers} · ${bits & 8 ? `<s>${kt}</s>` : kt}. Y oro según el daño (más si lo derrotas).</span>`
    : `Para retar a este jefe en el Modo Jefe, gánale primero en la campaña (mundo ${wi + 1}: ${WORLDS[wi].name}).`;
  const pb = $('#btn-play'); pb.disabled = !open; pb.textContent = open ? '¡A POR ÉL!' : 'BLOQUEADO';
  bossFacBar();
}
// tu facción, plegada en una línea: al tocarla se abre la rejilla de 5 + 5
function bossFacBar() {
  const F = FACTIONS[G.faction], ab = $('#scr-prep').classList.contains('fac-abierta');
  $('#boss-fac').innerHTML = `<span class="bf-lbl">TU FACCIÓN</span><button class="bf-btn" id="bf-btn" style="--fc:${FAC_COLOR[G.faction]}" aria-expanded="${ab}"><canvas id="bf-art"></canvas><b class="ol">${F.name}</b><small>${ICONS[F.icon] || ''} ${F.pname}</small><i>${ab ? '▲' : '▼'}</i></button>`;
  drawArt($('#bf-art'), F.leader, 40, 32);
  $('#bf-btn').onclick = () => { play('select'); $('#scr-prep').classList.toggle('fac-abierta'); bossFacBar(); };
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
MAQUINAS.cd = { nombre: 'CARTAS', estilo: 'garra', maquina: ['#8b3dff', '#5b21b6', '#4c1d95'], colores: CARD_RAR, tirar: cardPull, rpc: 'tirar_cartas', deServidor: cardDeServidor, ensenar: showCardPulls, textos: buildCardGachaText,
  probs() { const O = ECON.cardOdds, lista = {};
    for (const r of ['legendary', 'epic', 'rare']) { const ks = cardPool(r); lista[r] = ks.map(k => [CFG.cards[k].name || k, O[r] / ks.length]); }
    return { nombre: 'CARTAS', rareza: ['legendary', 'epic', 'rare'].map(r => [r, O[r]]), lista, nota: 'Solo salen cartas de las facciones que ya tienes.' }; },
  verEn() { deckEdit = null; collFac = cardsGoFac || collFac; updateWallets(); show('scr-coll'); buildColl(); } };
