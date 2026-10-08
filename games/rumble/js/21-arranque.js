// Fans of Rumble · Arranque del juego (va el último)
'use strict';
/* =========================================================
   LOOP
   ========================================================= */
let last = performance.now();
// v0.9.39: contador de FPS (Opciones) · cuenta las imágenes dibujadas y lo enseña dos veces por segundo
const FPS = { n: 0, t0: 0, box: null };
function fpsShow() { FPS.box = FPS.box || document.getElementById('fps-box'); if (FPS.box) FPS.box.hidden = !SAVE.fps; FPS.n = 0; FPS.t0 = performance.now(); }
function fpsCount(now) {
  if (!SAVE.fps || !FPS.box) return;
  FPS.n++; const pas = now - FPS.t0; if (pas < 500) return;
  const f = Math.round((FPS.n * 1000) / pas); FPS.n = 0; FPS.t0 = now;
  FPS.box.textContent = 'FPS ' + f;
  FPS.box.className = f >= 50 || (SAVE.ahorro && f >= 27) ? '' : f >= 25 ? 'medio' : 'malo';
}
function frame(now) {
  if (SAVE.ahorro && now - last < 28) { requestAnimationFrame(frame); return; }   // v0.9.39: modo ahorro = máximo 30 imágenes por segundo
  const real = Math.min(0.05, (now - last) / 1000); last = now;
  if (G.state === 'play' || G.state === 'ending') {   // la partida va a pasos fijos (simStep); el x2, el parón del golpe y la cámara lenta solo cambian cuántos pasos caben en cada fotograma
    const steps = Math.max(1, Math.round(G.timeScale));   // v0.9.11: el x2 solo acelera la partida
    let stop = 1; if (G.hitstop > 0) { G.hitstop -= real; stop = 0.07; }   // v0.9.24: parón del golpe
    SIM.acc += real * steps * G.slowmo * stop;
    for (let n = 0; SIM.acc >= SIM_DT; n++) {
      if (n >= SIM_MAX) { SIM.acc = 0; break; }
      SIM.acc -= SIM_DT;
      if (simStep(SIM_DT) === false) { SIM.acc = Math.min(SIM.acc + SIM_DT, SIM_DT * SIM_MAX); break; }   // PvP: esperando al rival
      if (G.state !== 'play' && G.state !== 'ending') break;
    }
    if (PVP.on) pvpTic(real);
    if (G.state === 'ending') { G.endT -= real * steps; if (G.endT <= 0) { G.state = 'end'; G.slowmo = 1; showEnd(); } }
  } else { SIM.acc = 0; simStep(real); }   // menús y cuenta atrás: un solo paso con el tiempo real
  if (G.state === 'play' || G.state === 'ending' || G.state === 'countdown') hud.update();
  musicUpdate();
  render(); fpsCount(now);
  if (G.state === 'title') idleFrame(real);   // v0.9.14: HORAS EXTRA
  requestAnimationFrame(frame);
}
async function boot() {
  applyLook(); setSoundIcon();
  try { await Promise.race([Promise.all([document.fonts.load('40px "Luckiest Guy"'), document.fonts.load('700 16px "Baloo 2"')]), new Promise(r => setTimeout(r, 1800))]); } catch (e) { /* fonts optional */ }
  buildSprites(); BRIDGE_LAYER = buildBridges(); setFaction(G.faction); updateWallets(); idleTick(); facItemsRetro(); achInit(); achDay(); achSoon(); saveGame(); READY = true;
  fpsShow(); requestAnimationFrame(t => { last = t; frame(t); });
  setInterval(tutTick, 250); titlePopups();
}
window.__FOR = { equipAll, facItemsRetro, fitsFac, FAC_ITEM, wearer, chooseFor, openPick, equipFromInv, VIEWX: VIEW, drawEquip, EQ_HAND, EQ_HEAD, bossOf, bossHp, bossOpen, BDIFF, BOSS_HP, BOSS_TIERS, buildBossPrep, grantRewards, deckOf, deckPool, ownsCard, cardPull, cardStars, openDeck, get deckEdit() { return deckEdit; }, cardPool, showCardPulls, isSpell, castSpell, applySpell, spellAim, spellPow, leapPrey, enemyExtras, get spells() { return spells; }, IDLE, idleState, idleTick, idleRates, idlePower, idleCollect, idleSetHero, openIdlePick, idleUI, idleSc, idleFrame, inHealCone, healAim, HEAL_BACK, updateGame, updateUnit, updateStruct, updateProjs, updatePassives, dmgMult, cdMult, ownerOf, ownerName, enemyLabel, losOf, isCorp, CORP, CEO_WI, BOSS_QUOTE, CHAT, CHAT_PH, CHAT_BOSS, CHAT_UNIT, CHAT_VS, CHAT_FAC, QUIPS, QUIPS_FAC, QUIPS_CORRUPT, TRACKS, PROJ, THEMES, AMB_KIND, FAC_COLOR, ICONS, SKINS, ROLES, FUR, NEWS, buildBG, ensureBG, get projs() { return projs; }, bases, towers, expireUnit, bounceShot, effStats, hudMods, hurt, kill, attack, CDIFF, ENEMY_GEAR, starsD, worldOpenD, levelOpenD, mythicWeek, MYTH_DEB, MYTH_BUF, openRoulette, rlSpin, applyItem, legendaryPrize, get campDiff() { return campDiff; }, set campDiff(v) { campDiff = v; }, chatEv, stat, ACHF, ACH_CATS, achProgF, achReady, achScan, achClaim, achInit, achName, achTotals, achDay, buildAchs, get achCat() { return achCat; }, set achCat(v) { achCat = v; }, LOGIN, loginState, openLogin, claimLogin, openNews, titlePopups, tutWant, tutTick, tutStep, tutFinish, curScreen, applySpeed, VERSION, buyStarter, get music() { return M; }, updateWallets, pull, pullCost, showCardTip, hideCardTip, roleOf, fitText, migrateSave, newCopy, addCopy, valsOf, avgQ, tierOf, rollQ, invGet, openInv, buildInv, openItem, massList, scrapValue, snapSpot, wornSet, QTIERS, G, get S() { return S; }, get units() { return units; }, get structs() { return structs; }, get parts() { return parts; }, get revives() { return revives; }, tryPlayerDeploy, playerPlay, spawnUnit, startMatch, setFaction, CFG, SPR, ART, BOX, TYPES, TOPS, drawVector, FACTIONS, get SAVE() { return SAVE; }, set SAVE(v) { SAVE = v; }, saveGame, setupMatch, startGame, openPrep, WORLDS, ECON, ABILITIES, ITEMS, findLevel, levelUp, pull, openCamp, buildColl, goHome, PASS, SHOP, passLevel, addPassXp, buildPass, openShop, buildMissions, makeShareImage, chatSay, missionEvent, get missionTab() { return missionTab; }, set missionTab(v) { missionTab = v; } };
boot();
