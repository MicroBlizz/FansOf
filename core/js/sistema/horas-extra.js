// Fans Of · HORAS EXTRA (1/2): el minijuego del menú. Lo que gana por hora, la ventana para elegir líder y la de cobrar. La escena está en horas-extra-escena.js
// Aquí está todo: lo que gana por hora, la ventana para elegir líder, la de cobrar y la escena animada (cada líder hace su especial).
//
// Cada juego dice:
//   idlePower(fac)    el poder de ese líder (1 = nivel 1 sin nada): de él sale cuánto gana por hora
//   idleFrame(dt)     hay que llamarla en cada fotograma mientras se ve el menú
// y puede enganchar (ver hook en core/js/sistema/utiles.js):
//   'idle.ui'         después de pintar el panel (para añadirle botones)
//   'idle.box'        después de montar la ventana de cobrar (para añadirle otra forma de cobrar)
//   'idle.equipo'     al dibujar al líder, por detrás y por delante, para pintarle lo que lleva puesto: (unidad, tipo, lienzo, capa)
//   'idle.disparo'    el color del disparo de un líder que ataca a distancia: (tipo de disparo) -> color
'use strict';
/* ---------- v0.9.14: HORAS EXTRA, el minijuego del menú: tu líder sigue luchando aunque no juegues ---------- */
// Gana oro, gemas y a veces un objeto por hora según su poder de verdad (nivel, habilidad y equipo). Se llena a las 12 h.
const IDLE = { cap: 12, gold: 60, gExp: 1.6, gems: 1, gemsK: 2.5, item: 0.02, itemK: 0.05 };
const IDLE_MOBS = ['becario', 'starbot', 'cajabotin', 'soportebot', 'descargabot', 'licenciabot', 'plusbot'];
const IDLE_SAY = {
  mob: ['¡Vuelve al trabajo!', 'Esto no cuenta como horas extra', '¡Firma el despido!', '¿Y tu productividad?', '¡Sin pausa para el café!', 'Reunión en 5 minutos', '¡Suscríbete!'],
  hero: ['¡Esto lo cobro yo!', '¡Por los fans!', 'Otra reunión más…', '¡El siguiente!', 'Mi jornada no acaba nunca', '¡Sin pausa!'],
};
const idleFacOk = f => !!(f && FACTIONS[f] && FACTIONS[f].leader && !isCorp(f) && isUnlocked(f));
let idleR = null;   // ritmo por hora del líder que trabaja
function idleState() {
  const I = SAVE.idle || (SAVE.idle = { fac: '', h: 0, gold: 0, gems: 0, items: 0, last: Date.now() });
  if (!idleFacOk(I.fac)) I.fac = idleFacOk(facNow()) ? facNow() : FACTION_ORDER.find(idleFacOk) || 'animales';
  if (!(I.last > 0)) I.last = Date.now();
  for (const k of ['h', 'gold', 'gems', 'items']) if (!(I[k] >= 0)) I[k] = 0;
  return I;
}
function idleRates(fac) { const pw = idlePower(fac); return { pw, gold: IDLE.gold * Math.pow(pw, IDLE.gExp), gems: IDLE.gems + (pw - 1) * IDLE.gemsK, item: IDLE.item + (pw - 1) * IDLE.itemK }; }
// suma lo ganado desde la última vez, hasta el tope de 12 h (si el reloj va hacia atrás no se suma nada)
function idleTick(now) {
  const I = idleState(); now = now || Date.now();
  const dh = Math.min((now - I.last) / 3600000, IDLE.cap - I.h), from = I.last; I.last = now;
  idleR = idleRates(I.fac);
  // v0.9.16: con el turbo (anuncio) gana el doble mientras dura
  const td = dh > 0 && I.turbo > from ? Math.min(dh, (Math.min(now, I.turbo) - from) / 3600000) : 0, x = dh + Math.max(0, td);
  if (dh > 0) { I.h = Math.min(IDLE.cap, I.h + dh); I.gold += idleR.gold * x; I.gems += idleR.gems * x; I.items += idleR.item * x; }
  return I;
}
const idleFull = () => idleState().h >= IDLE.cap - 1e-6;
function idleItem() {   // un objeto o una habilidad al azar con las probabilidades del gashapón (sin tocar sus garantías)
  const kind = Math.random() < 0.5 ? 'ab' : 'eq', DB = kind === 'ab' ? ABILITIES : ITEMS;
  let x = Math.random() * 100, rar = 'common'; for (const k of ['legendary', 'epic', 'rare', 'common', 'basic']) { if (x < (ECON.odds[k] || 0)) { rar = k; break; } x -= ECON.odds[k] || 0; }
  const pool = Object.keys(DB).filter(id => DB[id].rar === rar && !DB[id].pass && (kind === 'ab' || !DB[id].fac || isUnlocked(DB[id].fac)) && enCatalogo(DB, id));
  return newCopy(kind, pick(pool), 0);
}
function idleCollect(x2) {   // v0.9.16: x2 = premio doble por anuncio
  const I = idleTick(), m = x2 ? 2 : 1, g = Math.floor(I.gold), gm = Math.floor(I.gems), ni = Math.floor(I.items), h = I.h, full = h >= IDLE.cap - 1e-6;
  if (g < 1 && gm < 1 && ni < 1) { play('deny'); toast('Todavía no hay nada. ¡Dale un rato a tu líder!'); return; }
  I.gold -= g; I.gems -= gm; I.items -= ni; I.h = 0; ECO.ganar('horas-extra', { gold: g * m, gems: gm * m }, { tipo: 'horas', x2: !!x2, items: ECO.servidor('economia') ? ni * m : 0, facs: FACTION_ORDER.filter(isUnlocked) }); if (ni && ECO.servidor('economia')) ECO.ya();   // con servidor, los objetos los sortea él y llegan después
  const got = []; if (!ECO.servidor('economia')) for (let i = 0; i < ni * m; i++) got.push(idleItem());
  stat('idle', 1, true); stat('idleh', h, true); stat('idleg', g, true); stat('idlem', gm, true); if (ni) stat('idlei', ni, true); if (full) stat('idlefull', 1, true);
  achScan(); saveGame(); updateWallets(); play('crown'); idleBurst(); idleUI(true);
  toast(`Horas extra${x2 ? ' x2' : ''}: +${fmt(g * m)} de oro${gm ? ` y +${fmt(gm * m)} ${gm * m > 1 ? 'gemas' : 'gema'}` : ''}`, true);
  if (got.length) setTimeout(() => confirmBox(got.length > 1 ? `¡${got.length} OBJETOS!` : '¡HA ENCONTRADO ALGO!', got.map(it => { const D = defOf(it); return `<b>${D.name}</b> · ${RARITY[D.rar][0]}, calidad ${QTIERS[tierOf(avgQ(it))].name}`; }).join('<br>') + '<small>Tu líder lo ha encontrado haciendo horas extra. Ya lo tienes en el inventario.</small>', null, null, '¡GENIAL!'), 650);
}
function idleSetHero(f) {
  if (!idleFacOk(f)) return;
  const I = idleTick(); $('#scr-idle').hidden = true; if (I.fac === f) { play('select'); return; }
  I.fac = f; idleR = idleRates(f); stat('idleswap', 1); saveGame(); play('select'); idleSc.mobs.length = 0; idleSc.fx.length = 0; idleUI(true);
  toast(`${CFG.cards[FACTIONS[f].leader].name} empieza su turno de horas extra`, true);
}
function openIdlePick() {
  const I = idleTick(), L = FACTION_ORDER.filter(idleFacOk);
  $('#idle-list').innerHTML = L.map(f => {
    const k = FACTIONS[f].leader, R = idleRates(f), on = f === I.fac;
    return `<button class="idle-opt" data-idf="${f}" aria-pressed="${on}"><canvas aria-hidden="true"></canvas><span><b>${CFG.cards[k].name}</b><small>${FACTIONS[f].name} · nivel ${uSave(k).lvl}${on ? ' · <em>TRABAJANDO</em>' : ''}</small><small>Cada hora: ${fmt(R.gold)} de oro · ${fmtV(rnd(R.gems, 1))} ${rnd(R.gems, 1) === 1 ? 'gema' : 'gemas'}</small></span><span class="pw">${Math.round(R.pw * 100)}<small>PODER</small></span></button>`;
  }).join('');
  for (const b of $('#idle-list').querySelectorAll('[data-idf]')) { drawArt(b.querySelector('canvas'), FACTIONS[b.dataset.idf].leader, 44, 44); b.onclick = () => idleSetHero(b.dataset.idf); }
  const nl = FACTION_ORDER.length - L.length;
  $('#idle-more').textContent = nl ? `Libera más facciones en la campaña para tener más líderes (te ${nl > 1 ? 'faltan ' + nl : 'falta 1'}).` : '';
  $('#scr-idle').hidden = false; play('select');
}
let idleUIKey = '', idleFaceKey = '';
function idleUI(force) {
  if (!$('#idle')) return;
  const I = idleState(), R = idleR || (idleR = idleRates(I.fac)), k = FACTIONS[I.fac].leader, full = I.h >= IDLE.cap - 1e-6;
  const nI = Math.floor(I.items), pc = Math.floor((I.items - nI) * 100), hh = Math.floor(I.h * 10) / 10;
  const key = [I.fac, full, Math.floor(I.gold), Math.floor(I.gems), nI, pc, hh, Math.round(R.gold), Math.round(R.gems * 10), Math.round(R.pw * 100)].join('|');
  if (key === idleUIKey && !force) return; idleUIKey = key;
  $('#idle').classList.toggle('full', full); $('#idle-full').hidden = !full;
  $('#idle-sub').textContent = full ? 'Ya no cabe más: recoge lo que ha ganado' : 'Tu líder sigue luchando aunque no juegues';
  $('#idle-clock').innerHTML = `${full ? '¡LLENO! ' : ''}${fmtV(hh)} h / ${IDLE.cap} h<i style="--p:${Math.min(100, (I.h / IDLE.cap) * 100)}%"></i>`;
  $('#idle-acc').innerHTML = `<div class="ia">${COIN_SVG}<span>${fmt(I.gold)}</span>${GEM_SVG}<span>${fmt(I.gems)}</span>${CHEST_SVG}<span>${nI ? 'x' + nI : pc + ' %'}</span></div><small>Por hora: ${COIN_SVG}${fmt(R.gold)} ${GEM_SVG}${fmtV(rnd(R.gems, 1))}</small>`;
  $('#idle-name').textContent = CFG.cards[k].name; $('#idle-pw').textContent = `Poder ${Math.round(R.pw * 100)}`;
  $('#idle-get').setAttribute('aria-label', `Recoger ${fmt(I.gold)} de oro y ${fmt(I.gems)} gemas`);
  if (idleFaceKey !== k) { idleFaceKey = k; drawArt($('#idle-face'), k, 38, 38); }
  fitText($('#idle-name'), 15, 11);
  fire('idle.ui');
}
// al pulsar RECOGER sale una ventana con lo que vas a cobrar
function idleCollectBox() {
  const I = idleTick(), g = Math.floor(I.gold), gm = Math.floor(I.gems), ni = Math.floor(I.items);
  if (g < 1 && gm < 1 && ni < 1) { play('deny'); toast('Todavía no hay nada. ¡Dale un rato a tu líder!'); return; }
  $('#ib-sub').textContent = `${CFG.cards[FACTIONS[I.fac].leader].name} ha trabajado ${fmtV(Math.floor(I.h * 10) / 10)} h. Esto es lo que ha ganado:`;
  $('#ib-loot').innerHTML = `<span class="rw-chip big ol">${COIN_SVG}${fmt(g)}</span>${gm ? `<span class="rw-chip big ol">${GEM_SVG}${fmt(gm)}</span>` : ''}${ni ? `<span class="rw-chip big ol">${CHEST_SVG}x${ni}</span>` : ''}`;
  $('#ib-row').innerHTML = '<button class="btn-big ol" id="btn-ib-get">RECOGER</button>';
  $('#scr-idlebox').hidden = false; play('select');
  $('#btn-ib-get').onclick = () => { $('#scr-idlebox').hidden = true; idleCollect(); };
  fire('idle.box');
}
$('#btn-ib-close').addEventListener('click', () => { $('#scr-idlebox').hidden = true; play('select'); });
// ---- la escena: scroll lateral con parallax; el líder pega a los bots de Microblizz y Phony que van llegando
const idleSc = { t: 0, off: 0, walk: 0, mobs: [], fx: [], cw: 0, ch: 0, R: 0, L: null, lfac: '', tick: 0, atkT: 0.6, lunge: 0, jump: 0, jumpHit: true, hit: 0, hp: 1, spec: 5, spawn: 0.3, wave: 0, sayT: 6, eu: null, pend: null, pendT: 0, cast: 0, buffT: 0, buffCol: '#ffe06a', wallT: 0, flur: 0, flurT: 0 };
// v0.9.28: cada líder hace SU especial (antes todos saltaban como CrazyBunny). La etiqueta que sale es la de su carta.
const IDLE_SPEC = {
  bunny:        { kind: 'jump' },                                  // Chaos Jump: salta y cae en área
  necrolord:    { kind: 'summon', unit: 'skeleton', n: 2 },        // Invoca: 2 esqueletos corren a pegar
  twitchking:   { kind: 'buff', t: 4, col: '#c084fc' },            // En directo: 4 s atacando al doble de velocidad
  epicchampion: { kind: 'flurry', n: 3 },                          // Team Fight: 3 golpes seguidos
  cybermarine:  { kind: 'drop', unit: 'drone', n: 2 },             // Orbital Drop: caen 2 drones del cielo
  memelord:     { kind: 'card' },                                  // Carta viral: una al azar
  progamer:     { kind: 'flurry', n: 4 },                          // Combo: 4 golpes y el último, triple
  vikingo:      { kind: 'wall', t: 5 },                            // Muro de escudos: aparta a los bots y no recibe daño
  directora:    { kind: 'wave', t: 4, col: '#ff6b9a' },            // ¡Acción!: onda del megáfono que atraviesa a todos, y prisa
};
