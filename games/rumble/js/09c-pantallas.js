// Fans of Rumble · Menús (3/3): empezar la partida y la pantalla final
'use strict';

/* ---------- screens ---------- */
// v0.9.13: el campo cambia según tu facción y la empresa rival (se pinta de nuevo solo si hace falta)
let BG_KEY = '';
function ensureBG(plaza) { const key = verFac() + '|' + plaza; if (BG_KEY !== key) { BG = buildBG(verFac(), plaza); BG_KEY = key; } }
function startMatch() {
  ensureBG({ phony: 'ph', iahorro: 'ia' }[ownerOf()] || 'mb');
  audioInit(); hideScreens(); simSeed(G.seedNext); G.seedNext = null; resetMatch(); chatClear(); G.state = 'countdown'; camReset(); terrainStart();
  G.tutMatch = !G.autoplay && G.mode !== 'pvp' && !SAVE.tut.done && SAVE.tut.step === 0; tutBattleStart(); applySpeed(); applyMatchMods(); hudMods();
  const F = FACTIONS[verFac()];
  banner('PASIVA: ' + F.passive, F.banner, F.kind);
  const L = G.level;
  const intro = G.mode === 'pvp' ? [PVP.rival || 'RIVAL', PVP_MODOS[PVP.modo || 'estandar'][0] + ' · ' + (G.terrain && TERRAINS[G.terrain] ? TERRAINS[G.terrain].name : 'Campo normal')]
    : G.mode === 'boss' ? [G.bossName, BOSS_QUOTE[G.bossWi] || (G.bossWi === CEO_WI ? '«Os he comprado. Ahora os cierro.»' : isCorp(G.efac) ? '«Hemos comprado vuestro juego… y lo vamos a cerrar.»' : '«Microblizz me ha ascendido. Ahora despido yo.»')]
    : L && L.boss ? [L.boss, BOSS_QUOTE[L.wi] || (G.efac === 'microblizz' ? (L.wi ? '«Os he comprado. Ahora os cierro.»' : '«Hemos comprado vuestro juego… y lo vamos a cerrar.»') : '«Microblizz me ha ascendido. Ahora despido yo.»')]
    : L ? [L.name, isCorp(G.efac) ? `Mundo ${L.wi + 1}: ${WORLDS[L.wi].name}` : `${enemyLabel(G.efac)} por ${ownerName()}`]
    : ['SurvivalBot', '«Hemos comprado vuestro juego… y lo vamos a cerrar.»'];
  setTimeout(() => { if (G.state === 'countdown' || G.state === 'play') { banner(intro[0], intro[1], 'enemy'); if (G.cdiff !== 'n') hardBanner(); else if (G.mode === 'boss' && G.bossDiff !== 'n') banner(BDIFF[G.bossDiff].name.toUpperCase(), `Rival de nivel ${G.elvl}, tropas de élite${G.egear ? ' y equipo' : ''}. Su sede: ${fmt(bases.e.maxHp)} de vida`, 'enemy'); } }, 2400);
  const seq = ['3', '2', '1', '¡CAOS!']; let i = 0; const el = $('#count');
  const tick = () => {
    if (G.state !== 'countdown') return;
    el.textContent = seq[i]; el.className = 'ol-big' + (i === 3 ? ' go' : ''); void el.offsetWidth; el.classList.add('pop');
    play(i < 3 ? 'tick' : 'go'); i++;
    if (i < seq.length) setTimeout(tick, 800); else setTimeout(() => { if (G.state === 'countdown') { G.state = 'play'; if (G.tutMatch) showTut(true); else if (!(SAVE.stats.card > 0)) showTut(); chatBurst('start', 2); if (G.cdiff !== 'n') setTimeout(() => { if (G.state === 'play') chatSay(G.cdiff === 'h' ? 'hard' : 'mythic'); }, 2600); } }, 500);
  };
  setTimeout(tick, 900);
}
function pauseGame() { if (G.state !== 'play') return; if (PVP.on) { pvpRendirse(); return; } /* en PvP no hay pausa */ G.state = 'paused'; input.card = null; input.dragging = false; show('scr-pause'); }
function resumeGame() { if (G.state !== 'paused') return; hideScreens(); G.state = 'play'; }
function goHome() { if (PVP.on) pvpFin(); if (G.terrain) { G.terrain = null; terrainStart(); }   // v0.9.19: el menú vuelve al campo de siempre
  ensureBG('mb'); setTagline(); $('#hud-mods').hidden = true; G.state = 'title'; chatClear(); resetMatch(); hud.update(); drawTitleArt(); updateWallets(); show('scr-title'); profileChip(); idleSc.tick = 0; achDay(); titlePopups(); }
function toMenu() { chatClear(); if (G.mode === 'camp') { G.state = 'title'; resetMatch(); hud.update(); openCamp(); } else goHome(); }
// v0.9.13: lo que dice cada jefe nuevo al empezar
const BOSS_QUOTE = { 7: '«Microblizz me encerró aquí abajo. Ahora no sale nadie.»', 8: '«¿Discos? Eso es del siglo pasado. Ahora pagas cada mes.»', 9: '«Phony me paga por ganar. Tú pagas por jugar.»', 10: '«Phony quiere otra secuela. Y la vas a protagonizar tú.»', 11: '«Todo lo que compraste es mío. Lo borro cuando quiera.»' };
function showEnd() {
  chatClear(); bannerClear();   // v0.9.11: sin carteles de la partida encima de la pantalla final
  if (G.mode === 'pvp') { G.rewards = grantRewards(); pvpShowEnd(); return; }
  $('#btn-share').hidden = false;
  const w = G.winner, R = G.rewards = grantRewards(), t = $('#end-title');
  if (G.mode === 'boss') { t.textContent = w === 'e' ? 'DERROTA' : bases.e.alive ? '¡FIN DEL TURNO!' : G.bossWi === CEO_WI ? '¡CEO DESPEDIDO!' : '¡JEFE DERROTADO!'; t.className = 'end-title ol-big ' + (w === 'e' ? 'lose' : 'win'); }
  else { t.textContent = w === 'p' ? '¡VICTORIA!' : w === 'e' ? 'DERROTA' : 'EMPATE'; t.className = 'end-title ol-big ' + (w === 'p' ? 'win' : w === 'e' ? 'lose' : ''); }
  $('#end-crowns').innerHTML = G.mode === 'camp' && w === 'p' ? [0, 1, 2].map(i => `<span class="${i < R.stars ? 'on' : 'off'}">${STAR_SVG}</span>`).join('') : G.mode === 'boss' ? '' : [0, 1, 2].map(i => `<span class="${i < S.p.crowns ? 'on' : 'off'}">${CROWN_SVG}</span>`).join('');
  let sub;
  if (G.mode === 'boss') sub = `${G.bossName}${G.bossDiff !== 'n' ? ' (' + BDIFF[G.bossDiff].name + ')' : ''}: ${fmt(R.score)} de daño, el ${R.pct} % de su vida${R.record ? ' · ¡NUEVO RÉCORD!' : ' · Récord: ' + fmt(SAVE.bossRec[R.boss.key] || 0)}`;
  else if (G.mode === 'camp' && w === 'p') sub = `${G.level.name}${G.cdiff && G.cdiff !== 'n' ? ' (' + CDIFF[G.cdiff].name + ')' : ''}: ${R.stars === 3 ? '¡3 estrellas!' : R.stars + (R.stars === 1 ? ' estrella' : ' estrellas') + (S.e.crowns ? ' (perdiste una torre)' : ' (te faltó tirar su base)')}`;
  else sub = { base: w === 'p' ? `Has tirado ${isCorp(G.efac) ? FACTIONS[G.efac].end : 'su base'}.` : `Han tirado ${FACTIONS[G.faction].end}.`, crowns: `Tiempo: ${S.p.crowns} coronas contra ${S.e.crowns}.`, hp: 'Empate a coronas: gana quien conserva más vida en sus torres.', draw: 'Mismas coronas y misma vida.' }[G.endReason] || '';
  $('#end-sub').textContent = sub;
  let rw = '';
  if (R.unlock) rw += `<span class="rw-chip big ol">¡NUEVA FACCIÓN: ${FACTIONS[R.unlock].name.toUpperCase()}!</span>`;
  if (R.prize) rw += `<span class="rw-chip big ol">¡LEGENDARIO: ${defOf(R.prize).name.toUpperCase()}!</span>`;
  if (R.facItem) rw += `<span class="rw-chip big ol">¡OBJETO DE FACCIÓN: ${defOf(R.facItem).name.toUpperCase()}!</span>`;
  if (R.boss && R.boss.kill) rw += `<span class="rw-chip big ol">¡DERROTADO CON ${Math.round(Math.max(0, G.time))} S DE SOBRA! +${fmt(R.boss.bonus)} DE ORO${R.boss.first ? ' Y GEMAS' : ''}</span>`;
  if (R.boss && R.boss.tiers.length) rw += `<div class="rw-xp" style="color:#ffe06a">Premio por llegar al ${R.boss.tiers.map(i => Math.round(BOSS_TIERS[i] * 100) + ' %').join(', ')} de su vida.</div>`;
  if (R.gold) rw += `<span class="rw-chip ol">${COIN_SVG}+${fmt(R.gold)}</span>`;
  if (R.gems) rw += `<span class="rw-chip ol">${GEM_SVG}+${fmt(R.gems)}</span>`;
  if (R.xp.length) rw += `<div class="rw-xp">Experiencia: ${R.xp.map(([k, x]) => `${CFG.cards[k].name} +${x}`).join(' · ')}</div>`;
  if (R.ready.length) rw += `<div class="rw-xp" style="color:#9ef07a">¡Listas para subir de nivel en la Colección: ${R.ready.map(k => CFG.cards[k].name).join(', ')}!</div>`;
  if (R.arena) rw += `<span class="rw-chip big ol">${R.arena.d >= 0 ? '+' : ''}${R.arena.d} COPAS · ${fmt(R.arena.cups)} · LIGA ${R.arena.league.toUpperCase()}</span>`;   // v0.9.20
  if (R.arena && R.arena.regalo) rw += `<span class="rw-chip ol">${TICKET_SVG}+${R.arena.regalo} ${R.arena.regalo > 1 ? 'TIRADAS GRATIS' : 'TIRADA GRATIS'}</span>`;   // v0.9.35: regalo del camino de la arena
  $('#end-rewards').innerHTML = rw; adEndOffer(R);   // v0.9.16: premio x2 con anuncio
  $('#end-pass').innerHTML = passLevel() >= PASS.levels && !R.passUp ? 'Pase de batalla completado' : `Pase de batalla: +${R.passXp} puntos${R.passUp ? ` · <b style="color:#ffe14d">¡NIVEL ${passLevel()}!</b>` : ` · ${SAVE.pass.xp - passLevel() * PASS.xpPer}/${PASS.xpPer} para el nivel ${passLevel() + 1}`}`;
  $('#end-quote').textContent = R.unlock ? `${capFirst(losOf(R.unlock))} se libran de ${ownerName()} y se unen a la rebelión.` : pick((ownerOf() === 'phony' ? QUOTES_PH : ownerOf() === 'iahorro' ? QUOTES_IA : QUOTES)[w || 'd']);
  $('#st-cards').textContent = S.p.deployed; $('#st-kills').textContent = S.p.kills; $('#st-chaos').textContent = Math.round(S.p.spent);
  let nx = G.mode === 'camp' && w === 'p' ? nextLevel(G.level) : null; if (nx && !levelOpenD(nx, G.cdiff || 'n')) nx = null;
  $('#btn-next').hidden = !nx; $('#btn-next').textContent = nx && nx.wi !== G.level.wi ? 'MUNDO ' + (nx.wi + 1) : 'SIGUIENTE';
  $('#btn-again').textContent = G.mode === 'quick' ? 'REVANCHA' : 'REPETIR';
  $('#btn-again').className = nx ? 'btn-ghost ol' : 'btn-big ol';
  updateWallets(); show('scr-end');
  if (R.unlock) setTimeout(() => { if (!$('#scr-end').hidden) showUnlock(R.unlock); }, 1200);   // v0.9.71: la celebración de la facción nueva (no se cierra sola)
}
