// Fans Of · PASES: el pase de temporada (todos los juegos) y el pase PvP (solo el juego que lo trae). Cada uno con dos pistas:
// la gratis y la de pago (de prueba: no cobra nada). Va después de core/js/retos.js.
// Los DATOS son de cada juego (opcionales; sin ellos sale el pase de siempre, de 30 niveles):
//   RETOS.pase    = { id, name, levels, xpPer, eur, xpWin, xpLose, xpDaily, xpWeekly, fin: 'AAAA-MM-DD', capitulos: [{ hasta, tit, txt }], premio(pista, nivel) }
//   RETOS.pasePvp = lo mismo para el PvP (sus puntos solo llegan de partidas PvP en línea).
// id: cambia en cada temporada; con un id nuevo todos empiezan de cero y la pista de pago se vuelve a comprar (el servidor lleva lo mismo).
// Un premio es { gold } | { gems } | { tickets } | { item } | { marco } | { titulo } (estos dos van al armario: core/js/armario.js).
'use strict';
const PASS = Object.assign({ name: 'Temporada 1: La Gran Compra', sub: 'Dura hasta que Microblizz la cierre', levels: 30, xpPer: 400, eur: 4.99, xpWin: 100, xpLose: 40, xpDaily: 60, xpWeekly: 250 }, RETOS.pase || {});
const PASS_Q = 0.9;   // los objetos del pase salen siempre con calidad Excelente
const PASS_PVP = RETOS.pasePvp ? Object.assign({ name: 'Pase PvP', levels: 30, xpPer: 300, eur: 2.99, xpWin: 100, xpLose: 40 }, RETOS.pasePvp) : null;
// t: el de temporada · p: el de PvP. k: dónde se guarda · ev: el evento con el que el servidor comprueba el cobro
const PASES = { t: { C: PASS, k: 'pass', ev: 'pase', compra: 'compra-pase', evCompra: 'pase-premium', pago: 'EJECUTIVO', nombrePago: 'Pase Ejecutivo', corto: 'Ejecutivo', clase: 'pt-t' } };
if (PASS_PVP) PASES.p = { C: PASS_PVP, k: 'passPvp', ev: 'pase-pvp', compra: 'compra-pase-pvp', evCompra: 'pase-pvp-premium', pago: 'PASE DEL PASE', nombrePago: 'Pase del Pase', corto: 'Pase del Pase', clase: 'pt-p' };
let passTab = 't';
// candado que se ve sobre fondo oscuro (el arco claro con su contorno)
const CANDADO_SVG = '<svg viewBox="0 0 16 18" aria-hidden="true"><path d="M4.6 8V5.6a3.4 3.4 0 0 1 6.8 0V8" stroke="#20102c" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M4.6 8V5.6a3.4 3.4 0 0 1 6.8 0V8" stroke="#e7dcf7" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="2.2" y="7.6" width="11.6" height="9" rx="2" fill="#ffcb3d" stroke="#20102c" stroke-width="1.5"/><circle cx="8" cy="11.4" r="1.3" fill="#20102c"/><rect x="7.4" y="11.6" width="1.2" height="2.6" rx=".6" fill="#20102c"/></svg>';

// el pase de siempre (para los juegos que no traen el suyo)
function passRewardBase(track, i) {
  if (track === 'free') {
    if (i === PASS.levels) return { item: 'diploma' };
    if (i % 10 === 0) return { tickets: 1 };
    if (i % 3 === 0) return { gems: 15 };
    return { gold: 150 };
  }
  if (i === PASS.levels) return { item: 'corbata_ceo' };
  if (i % 5 === 0) return { tickets: 2 };
  if (i % 2 === 0) return { gems: 30 };
  return { gold: 400 };
}
const pReward = (p, track, i) => (PASES[p].C.premio ? PASES[p].C.premio(track, i) : p === 't' ? passRewardBase(track, i) : { gold: 0 });
const passReward = (track, i) => pReward('t', track, i);   // herramientas/datos.html la usa para subir el pase al servidor

// lo guardado de un pase; si la temporada es otra, se empieza de cero
function pSave(p) {
  const P = PASES[p], C = P.C; let S = SAVE[P.k];
  if (!S || typeof S !== 'object' || (C.id && S.id !== C.id)) S = SAVE[P.k] = { xp: 0, prem: false, free: [], paid: [] };
  if (C.id) S.id = C.id;
  if (!Array.isArray(S.free)) S.free = [];
  if (!Array.isArray(S.paid)) S.paid = [];
  if (typeof S.xp !== 'number') S.xp = 0;
  return S;
}
for (const p in PASES) pSave(p);
const pLevel = p => Math.min(PASES[p].C.levels, Math.floor(pSave(p).xp / PASES[p].C.xpPer));
const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const pFin = p => !!(PASES[p].C.fin && hoyISO() > PASES[p].C.fin);
const pDias = p => (PASES[p].C.fin ? Math.max(0, Math.ceil((new Date(PASES[p].C.fin + 'T23:59:59') - Date.now()) / 86400000)) : null);
function pAddXp(p, n) {
  if (pFin(p) || !n) return 0;
  const C = PASES[p].C, S = pSave(p), before = pLevel(p);
  S.xp = Math.min(C.levels * C.xpPer, S.xp + n);
  return pLevel(p) - before;
}
const pReady = (p, track, i) => { const S = pSave(p); return i <= pLevel(p) && !S[track === 'free' ? 'free' : 'paid'].includes(i) && (track === 'free' || S.prem); };
function pClaimable(p) { let n = 0; for (let i = 1; i <= pLevel(p); i++) { if (pReady(p, 'free', i)) n++; if (pReady(p, 'paid', i)) n++; } return n; }
function pClaim(p, track, i) {
  if (!pReady(p, track, i)) return false;
  const r = pReward(p, track, i), pista = track === 'free' ? 'free' : 'paid';
  giveReward(r, { tipo: PASES[p].ev, pista, nivel: i }); pSave(p)[pista].push(i);
  return r;
}
// lo que usaban los juegos antes de que hubiera dos pases (todo del de temporada, salvo los avisos, que cuentan los dos)
const passLevel = () => pLevel('t');
const addPassXp = n => pAddXp('t', n);
const passReady = (track, i) => pReady('t', track, i);
const claimPass = (track, i) => pClaim('t', track, i);
const passClaimable = () => Object.keys(PASES).reduce((a, p) => a + pClaimable(p), 0);

/* ---------- premios: dar, enseñar y contar ---------- */
function rewardHtml(r) {
  if (r.gold) return `${COIN_SVG}${fmt(r.gold)}`;
  if (r.gems) return `${GEM_SVG}${fmt(r.gems)}`;
  if (r.tickets) return `${TICKET_SVG}${r.tickets} ${r.tickets > 1 ? 'tiradas' : 'tirada'}`;
  if (r.item) return `<span class="itm">${ITEMS[r.item].name}</span>`;
  if (r.marco && typeof marcoDef === 'function' && marcoDef(r.marco)) return `<span class="itm">Marco ${marcoDef(r.marco).name}</span>`;
  if (r.titulo && typeof tituloDef === 'function' && tituloDef(r.titulo)) return `<span class="itm">«${tituloDef(r.titulo).name}»</span>`;
  return '';
}
const rewardTxt = r => (r.gold ? `${fmt(r.gold)} de oro` : r.gems ? `${fmt(r.gems)} gemas` : r.tickets ? `${r.tickets} ${r.tickets > 1 ? 'tiradas gratis' : 'tirada gratis'} del gashapón`
  : r.item ? ITEMS[r.item].name : r.marco && typeof marcoDef === 'function' && marcoDef(r.marco) ? `el marco ${marcoDef(r.marco).name}` : r.titulo && typeof tituloDef === 'function' && tituloDef(r.titulo) ? `el título «${tituloDef(r.titulo).name}»` : '');
function giveReward(r, evento) {
  const clave = ECO.ganar('premio', r, evento);
  if (r.item) { const it = addCopy('eq', r.item, Array.from({ length: Math.max(1, ITEMS[r.item].st.length) }, () => PASS_Q)); if (clave && evento && evento.tipo === 'pase') it.pend = clave; }   // el servidor crea la de verdad (copiasDelServidor)
  if (r.marco && typeof darLook === 'function') darLook('marco', r.marco);
  if (r.titulo && typeof darLook === 'function') darLook('titulo', r.titulo);
}
const esLook = r => !!(r && (r.marco || r.titulo));

/* =========================================================
   PANTALLA: pestañas (si hay pase PvP), la tarjeta de arriba y la lista de niveles con sus capítulos y sus hitos
   ========================================================= */
const diasTxt = n => (n <= 0 ? 'termina hoy' : n === 1 ? 'termina mañana' : `termina en ${n} días`);
const esHito = i => i % 5 === 0;
const esGordo = r => !!(r && (r.marco || r.titulo || r.item || r.tickets));   // un premio que no es oro ni gemas
const ESTRELLA_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z" fill="#ffcb3d" stroke="#20102c" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.6 7.6l1.4-3" stroke="#fff6c8" stroke-width="1.4" stroke-linecap="round"/></svg>';
// lo que cuesta de premio en una casilla: los hitos con dibujo (marco) o con el título en su color
function passCelda(p, track, i) {
  const S = pSave(p), lv = pLevel(p), r = pReward(p, track, i), pista = track === 'free' ? 'free' : 'paid';
  const got = S[pista].includes(i), ready = pReady(p, track, i), cerrada = track === 'paid' && !S.prem;
  const D = r.marco && typeof marcoDef === 'function' ? marcoDef(r.marco) : r.titulo && typeof tituloDef === 'function' ? tituloDef(r.titulo) : null;
  const gordo = esHito(i) && esGordo(r);
  const cls = 'pr-cell' + (track === 'paid' ? ' prem' : '') + (gordo ? ' hito' : '') + (D ? ' look' : '') + (got ? ' done' : ready ? ' ready' : i > lv || cerrada ? ' locked' : '');
  const st = D ? ` style="--rc:${rarColor(D.rar)};--rd:${rarColor(D.rar, 2)}"` : '';
  let dentro;
  if (r.marco && D) dentro = `<canvas class="pr-mk" data-mk="${r.marco}" aria-hidden="true"></canvas><span class="pr-lbl"><small>MARCO</small><b>${esc(D.name)}</b></span>`;
  else if (r.titulo && D) dentro = `<span class="pr-lbl"><small>TÍTULO</small>${tituloHtml(r.titulo)}</span>`;
  else if (r.item) dentro = `<span class="pr-lbl"><small>OBJETO EXCLUSIVO</small><b>${esc(ITEMS[r.item].name)}</b></span>`;
  else dentro = `<span class="pr-val">${rewardHtml(r)}</span>`;
  const marca = gordo && ready ? '<span class="pr-go">¡COBRAR!</span>' : got ? '<span class="pr-ok" aria-label="Cobrado">✓</span>' : cerrada ? `<span class="pr-lk">${CANDADO_SVG}</span>` : '';
  return `<button class="${cls}"${st} data-pc="${track}:${i}" ${ready ? '' : 'tabindex="-1"'}>${gordo ? `<i class="pr-rib">${ESTRELLA_SVG}</i>` : ''}${dentro}${marca}</button>`;
}
// el próximo hito con premio para el armario: para animar a seguir
function passProximo(p) {
  const C = PASES[p].C, lv = pLevel(p);
  for (let i = lv + 1; i <= C.levels; i++) for (const tr of ['free', 'paid']) { const r = pReward(p, tr, i); if (esLook(r) || r.item) return { i, r, tr }; }
  return null;
}
function buildPass() {
  if (!PASES[passTab]) passTab = 't';
  const p = passTab, P = PASES[p], C = P.C, S = pSave(p), lv = pLevel(p), into = S.xp - lv * C.xpPer, maxed = lv >= C.levels, fin = pFin(p), nClaim = pClaimable(p);
  const cols = document.querySelector('.pass-cols'); if (cols) cols.hidden = true;   // los encabezados van ahora dentro de la lista
  const tabs = PASES.p ? `<div class="pass-tabs">${Object.keys(PASES).map(k => { const n = pClaimable(k); return `<button class="pass-tab ${PASES[k].clase}" data-pt="${k}" aria-pressed="${k === p}">${k === 't' ? 'TEMPORADA' : 'PVP'}${n ? `<i class="pt-dot ol">${n}</i>` : ''}</button>`; }).join('')}</div>` : '';
  const dias = pDias(p);
  const sub = fin ? 'La temporada ha terminado: cobra lo que te falte.' : dias != null ? `${C.levels} niveles · ${diasTxt(dias)}` : C.sub || '';
  const pr = passProximo(p);
  const prox = pr && !fin ? `<div class="ph-next"><span>Próximo premio gordo: <b>nivel ${pr.i}</b>${pr.tr === 'paid' ? ` (${P.nombrePago})` : ''}</span><em>${rewardHtml(pr.r)}</em></div>` : '';
  const reglas = p === 'p' ? `<div class="ph-reglas"><span>Partida PvP <b>+${C.xpLose}</b></span><span>Ganar <b>+${C.xpWin}</b></span><span class="ph-limpio">Juego limpio: aquí todo es para lucirse</span></div>` : '';
  $('#pass-top').className = 'pass-top pass-hero ' + P.clase;
  $('#pass-top').innerHTML = tabs + `<div class="ph-main"><div class="ph-lvl ol"><small>NIVEL</small>${lv}</div><div class="ph-name"><b class="ol">${esc(C.name)}</b><small>${sub}${S.prem ? ` · <span class="ph-vip">${P.nombrePago} ✓</span>` : ''}</small></div></div>
    <div class="xpbar ph-bar"><i style="width:${maxed ? 100 : (into / C.xpPer) * 100}%"></i><span>${maxed ? '¡PASE COMPLETADO!' : `${fmt(into)} / ${fmt(C.xpPer)} puntos para el nivel ${lv + 1}`}</span></div>${reglas}${prox}
    <div class="pass-actions"><button class="btn-vip ol" id="btn-buy-pass" ${S.prem ? 'disabled' : ''}>${S.prem ? P.pago + ' ✓' : `${P.pago} <small>${eur(C.eur)}</small>`}</button><button class="btn-up" id="btn-claim-all" ${nClaim ? '' : 'disabled'}>COBRAR TODO${nClaim ? ` (${nClaim})` : ''}</button></div>`;
  // la lista: encabezado fijo, capítulos y niveles
  let rows = `<div class="pass-head ${P.clase}"><span></span><span class="ol">GRATIS</span><span class="ol">${P.pago}</span></div>`;
  const caps = C.capitulos || []; let desde = 1;
  for (let i = 1; i <= C.levels; i++) {
    const ci = caps.findIndex((c, k) => i === (k ? caps[k - 1].hasta + 1 : 1));
    if (ci >= 0) {
      const K = caps[ci], ini = ci ? caps[ci - 1].hasta + 1 : 1, est = lv >= K.hasta ? 'hecho' : lv >= ini - 1 ? 'ahora' : 'luego';
      rows += `<div class="pass-cap ${est}"><span class="pc-n ol">CAPÍTULO ${ci + 1}</span><b class="ol">${esc(K.tit)}</b><small>${esc(K.txt)}</small><i>${est === 'hecho' ? 'Completado ✓' : `Niveles ${ini} a ${K.hasta}`}</i></div>`;
      desde = ini;
    }
    rows += `<div class="pass-row${i <= lv ? ' reached' : ''}${i === lv + 1 && !fin ? ' cur' : ''}${esHito(i) && (esGordo(pReward(p, 'free', i)) || esGordo(pReward(p, 'paid', i))) ? ' hito' : ''}" data-row="${i}"><div class="pr-n ol">${i}</div>${passCelda(p, 'free', i)}${passCelda(p, 'paid', i)}</div>`;
  }
  const list = $('#pass-list'); list.innerHTML = rows; list.className = 'scroll-list pass-list ' + P.clase;
  if (typeof pintaAvatar === 'function') for (const cv of list.querySelectorAll('canvas[data-mk]')) pintaAvatar(cv, 46, cv.dataset.mk, avatarOf());
  list.querySelectorAll('[data-pc]').forEach(b => { b.onclick = () => {
    const [tr, i] = b.dataset.pc.split(':'); const r = pClaim(p, tr, +i);
    if (!r) { if (tr === 'paid' && !pSave(p).prem) buyPass(p); else if (+i > pLevel(p)) { play('deny'); toast(`Llega al nivel ${i} para cobrarlo`); } return; }
    saveGame(); play('crown'); updateWallets(); buildPass(); updateBadges();
    if (esLook(r) && typeof lookPremioBox === 'function') lookPremioBox(r); else toast('Has cobrado: ' + rewardTxt(r), true);
  }; });
  $('#btn-buy-pass').onclick = () => buyPass(p);
  $('#btn-claim-all').onclick = () => {
    let n = 0; const looks = [];
    for (let i = 1; i <= pLevel(p); i++) for (const tr of ['free', 'paid']) { const r = pClaim(p, tr, i); if (r) { n++; if (esLook(r)) looks.push(r); } }
    if (!n) return;
    saveGame(); play('win'); updateWallets(); buildPass(); updateBadges();
    if (looks.length && typeof lookPremioBox === 'function') lookPremioBox(looks[looks.length - 1], looks.length);
    else toast(`¡${n} recompensas cobradas!`, true);
  };
  for (const b of document.querySelectorAll('[data-pt]')) b.onclick = () => { if (passTab === b.dataset.pt) return; passTab = b.dataset.pt; play('select'); buildPass(); };
  // se baja hasta lo primero que puedas cobrar (o hasta tu nivel), con su capítulo si está cerca
  const listo = list.querySelector('.pr-cell.ready'), cur = (listo && listo.closest('.pass-row')) || list.querySelector(`[data-row="${Math.max(1, Math.min(C.levels, lv + 1))}"]`), cap = cur && [...list.querySelectorAll('.pass-cap')].filter(k => k.offsetTop <= cur.offsetTop).pop(), head = list.querySelector('.pass-head');
  if (cur) { const hh = head ? head.offsetHeight : 0; let y = cur.offsetTop - list.offsetTop - hh - 140; if (cap && cur.offsetTop - cap.offsetTop < 330) y = cap.offsetTop - list.offsetTop - hh - 6; list.scrollTop = Math.max(0, y); }
}
function buyPass(p = passTab) {
  const P = PASES[p], C = P.C, S = pSave(p); if (S.prem) return;
  let nM = 0, nT = 0; for (let i = 1; i <= C.levels; i++) { const r = pReward(p, 'paid', i); if (r.marco) nM++; if (r.titulo) nT++; }
  const extra = (nM ? `${nM} ${nM > 1 ? 'marcos' : 'marco'}` : '') + (nM && nT ? ' y ' : '') + (nT ? `${nT} ${nT > 1 ? 'títulos' : 'título'}` : '');
  const txt = p === 'p'
    ? `El <b>Pase del Pase</b>: porque un pase solo no bastaba. ${extra ? `<b>${extra}</b> para presumir en el PvP, ` : ''}más oro y gemas. No da ninguna ventaja en la partida.`
    : `Desbloquea la pista Ejecutiva de la ${esc(C.name)}: más oro, gemas, tiradas gratis${extra ? `, <b>${extra}</b>` : ''} y la <b>Corbata del CEO</b>, exclusiva.`;
  confirmBox(P.nombrePago.toUpperCase(), `${txt}<span class="big">${eur(C.eur)}</span><small>Versión de prueba: no se cobra nada.${C.id ? ' Vale para esta temporada.' : ''}</small>`, 'COMPRAR', () => {
    S.prem = true; ECO.ganar(P.compra, {}, { tipo: P.evCompra }); saveGame(); play('win'); updateWallets(); buildPass(); updateBadges();
    toast(p === 'p' ? '¡Ya tienes el Pase del Pase! (sin cobrar nada)' : '¡Ya eres Ejecutivo! (sin cobrar nada)', true);
  });
}
function openPass(tab) { if (tab && PASES[tab]) passTab = tab; updateWallets(); show('scr-pass'); buildPass(); }
// al acabar una partida: puntos de pase por jugar. Devuelve el trocito que se enseña en la pantalla del final
function passMatch(win) {
  const xp = win ? PASS.xpWin : PASS.xpLose, up = addPassXp(xp);
  return `<div class="rw-xp">Pase de batalla: +${xp} puntos${up ? ` · ¡NIVEL ${passLevel()}!` : ''}</div>`;
}
// de dónde sale un marco o un título (lo pregunta el armario)
function paseOrigen(t, id) {
  for (const p in PASES) for (let i = 1; i <= PASES[p].C.levels; i++) for (const tr of ['free', 'paid']) {
    const r = pReward(p, tr, i); if ((t === 'marco' ? r.marco : r.titulo) !== id) continue;
    const quien = tr === 'paid' ? PASES[p].corto : p === 'p' ? 'Pase PvP' : 'Temporada';
    return `${quien} · nivel ${i}`;
  }
  return '';
}
