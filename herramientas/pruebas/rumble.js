// Fans Of · Comparador: el guion de Fans of Rumble. Se ejecuta dentro del juego, con la partida de prueba de abajo.
// Cada T.paso() es una cosa que haría un jugador; T.foto() apunta lo que se ve y T.apunta() lo que queda guardado.
var PRUEBA = {
  clave: 'for-save-1', claves: ['for-save-1', 'for-muted', 'for-diff'], otras: { 'for-muted': '0' },
  lista: 'typeof READY !== "undefined" && READY === true',
  // una partida a medias: cuatro facciones, cartas de varios niveles, copias de todas las calidades, equipo puesto y cosas por cobrar
  guardado: {
    v: 1, gold: 54321, gems: 9000, tickets: 2, name: 'Prueba', since: '2026-09-01', lastFac: 'animales',
    unlocked: ['animales', 'nomuertos', 'streamers', 'memes'],
    units: { bunny: { lvl: 3, xp: 999 }, squirrel: { lvl: 2, xp: 120 }, beaver: { lvl: 1, xp: 10 }, fox: { lvl: 1, xp: 0 }, necrolord: { lvl: 5, xp: 10 }, skeleton: { lvl: 10, xp: 0 }, twitchking: { lvl: 2, xp: 0 }, memelord: { lvl: 4, xp: 600 }, huron: { lvl: 2, xp: 0 }, sp_bellotas: { lvl: 1, xp: 60 } },
    camp: { '1-1': 3, '1-2': 2, '1-3': 1, '1-4': 3, '2-1': 3, '2-2': 3, '2-3': 3, '2-4': 2, '3-1': 1, '3-2': 1, '3-3': 1, '3-4': 1 }, campH: { '1-1': 2, '1-2': 1, '1-3': 1, '1-4': 1 }, campM: {},
    inv: [{ u: 'i1', k: 'ab', id: 'cafeina', q: [0.75] }, { u: 'i2', k: 'ab', id: 'vampiro', q: [0.2] }, { u: 'i3', k: 'ab', id: 'vampiro', q: [0.95], lock: true }, { u: 'i4', k: 'ab', id: 'clon', q: [1] },
      { u: 'i5', k: 'ab', id: 'provoca', q: [0.5] }, { u: 'i6', k: 'ab', id: 'punos', q: [0.1] }, { u: 'i7', k: 'ab', id: 'punos', q: [0.3] }, { u: 'i19', k: 'ab', id: 'iman', q: [0.62] }, { u: 'i20', k: 'ab', id: 'ragequit', q: [0.33] },
      { u: 'i8', k: 'eq', id: 'espada_carton', q: [0.3] }, { u: 'i9', k: 'eq', id: 'espada_carton', q: [0.6] }, { u: 'i10', k: 'eq', id: 'raton_dpi', q: [0.9, 0.4] }, { u: 'i11', k: 'eq', id: 'cuernos', q: [0.5] },
      { u: 'i12', k: 'eq', id: 'taza', q: [0.05] }, { u: 'i13', k: 'eq', id: 'zanahoria_oro', q: [0.8, 0.7] }, { u: 'i14', k: 'eq', id: 'corona_huesos', q: [0.5, 0.5] }, { u: 'i15', k: 'eq', id: 'diploma', q: [0.9, 0.9] },
      { u: 'i16', k: 'eq', id: 'cofre', q: [0.7] }, { u: 'i17', k: 'eq', id: 'boton_pausa', q: [1] }, { u: 'i18', k: 'eq', id: 'auriculares', q: [0.45] }, { u: 'i21', k: 'eq', id: 'taza', q: [0.2] }, { u: 'i22', k: 'eq', id: 'cuernos', q: [0.15] }],
    invSeq: 22, abEquip: { bunny: 'i1', squirrel: 'i3', necrolord: 'i4' },
    equip: { animales: { weapon: 'i13', head: 'i11' }, nomuertos: { head: 'i14', acc: 'i17' }, streamers: { head: 'i11' } },
    pity: { ab: 3, abL: 20, eq: 9, eqL: 49, qab: 2, qeq: 9, cd: 0, cdL: 0 },
    cards: { huron: { n: 2, st: 1 }, sp_bellotas: { n: 1, st: 0 } }, decks: { animales: ['squirrel', 'beaver', 'fox', 'meercat', 'huron', 'sp_bellotas'] },
    pass: { id: 't1b', xp: 2600, prem: false, free: [1], paid: [] }, tut: { done: true, step: 3 }, tutGift: { cafe: 1, tix: 1 },
    stats: { win: 12, play: 20, kill: 600, card: 300, tower: 31, lvlup: 9, pull: 9, days: 3, caos: 900, quick: 8, camp: 12 }, achDone: ['win1'], achSeen: ['win1', 'kill500'],
    starter: false, speed2: false, chatOff: false, bestBoss: 2100, bossRec: { '6n': 2100 }, bossPay: { '6n': 1 }, bossSel: { wi: 6, d: 'n' }, mythPrize: {}, facItem: { animales: 1 }, menuMus: 'animales', vol: 80, mus: 60,
  },

  async pasos(T, parte) {
    const $ = T.$, quiere = p => !parte || parte.split(',').includes(p);
    const cierra = () => { for (const id of ['scr-login', 'scr-news', 'scr-name', 'scr-confirm', 'scr-item', 'scr-pick', 'scr-idle', 'scr-idlebox', 'scr-profile', 'scr-roulette', 'scr-share']) { const e = document.getElementById(id); if (e) e.hidden = true; } };
    const casa = () => { cierra(); goHome(); T.avanza(3000); cierra(); };
    const guardado = () => T.apunta('guardado', orden(SAVE));
    const orden = v => (Array.isArray(v) ? v.map(orden) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, orden(v[k])])) : typeof v === 'number' ? +v.toPrecision(10) : v);
    const ok = () => { T.clic('#cf-ok'); T.avanza(50); };
    const ficha = u => { openItem(u); };

    /* ---------- preparación: fechas del reloj de mentira y ninguna ventana de bienvenida ---------- */
    T.paso('preparación'); T.huella();
    cierra(); T.tapa('#scr-options .ver'); SAVE.seenVer = typeof NEWS_VER === 'string' ? NEWS_VER : VERSION; SAVE.login = { last: todayStr(), day: 3, best: 4 }; SAVE.daily = null; SAVE.weekly = null; SAVE.dayMark = todayStr(); SAVE.rlWeek = weekStr();
    SAVE.idle = { fac: 'animales', h: 3.25, gold: 1234.5, gems: 7.2, items: 1.3, last: Date.now() };
    saveGame(); casa(); T.apunta('versión', [VERSION, $('#scr-options .ver').textContent]); guardado();

    if (quiere('sonido')) {   // lo que el juego le pide al altavoz: cada efecto, el volumen y varias canciones
      T.paso('sonido: arranque'); casa(); audioInit(); T.sonido();
      T.paso('sonido: efectos'); for (const n of ['deploy', 'land', 'hit', 'boom', 'jump', 'slam', 'womp', 'despido', 'deny', 'heal', 'summon', 'revive', 'select', 'pop', 'note', 'card', 'hack', 'shield', 'levelup', 'roll', 'laugh', 'tick', 'go', 'crown', 'sad', 'win', 'lose']) { T.avanza(2000); play(n); } T.sonido();
      T.paso('sonido: volumen'); T.clic('#btn-options'); T.pon('#opt-vol', 30); T.pon('#opt-mus', 80); T.sonido('deslizadores'); T.clic('#btn-sound'); T.sonido('silencio'); T.apunta('guardado en', [localStorage.getItem('for-muted'), SAVE.muted]); play('select'); T.sonido('callado'); T.clic('#btn-sound'); T.sonido('otra vez');
      for (const c of ['menu', 'animales', 'memes', 'boss6', 'win']) { T.paso('sonido: canción ' + c); musicSet(c); T.altavoz().currentTime += 1; musicPump(T.altavoz().currentTime + 9); T.sonido(); }
      T.paso('sonido: qué suena en cada momento');
      const que = () => { musicUpdate(); return [M.want, M.tmT, M.duck]; }, L = [];
      G.state = 'title'; L.push(['menú', que()]); SAVE.menuMus = 'heroes'; L.push(['menú elegido', que()]);
      G.state = 'play'; G.mode = 'quick'; G.level = null; G.double = false; L.push(['partida', que()]); G.double = true; L.push(['último minuto', que()]);
      G.state = 'paused'; L.push(['pausa', que()]); G.state = 'play'; G.mode = 'boss'; G.bossWi = 3; L.push(['modo jefe', que()]);
      G.mode = 'camp'; G.level = findLevel('2-4'); L.push(['jefe de campaña', que()]); G.state = 'end'; G.winner = 'p'; L.push(['victoria', que()]); G.winner = 'e'; L.push(['derrota', que()]); G.state = 'countdown'; L.push(['cuenta atrás', que()]);
      T.apunta('canciones', L); T.sonido('cambios'); G.state = 'title'; G.mode = 'quick'; G.level = null; G.double = false; G.winner = null; SAVE.menuMus = 'animales'; SAVE.vol = 80; SAVE.mus = 60; applyVolume(); saveGame();
    }


    if (quiere('menus')) {
      T.paso('portada'); T.foto();

      /* ---------- colección ---------- */
      T.paso('colección'); T.clic('#btn-coll'); T.foto(); guardado();
      T.paso('colección: subir de nivel'); T.clic('#coll-list [data-up]:not([disabled])'); T.foto(); guardado();
      T.paso('colección: sin oro para subir'); { const g = SAVE.gold; SAVE.gold = 3; buildColl(); const b = $('#coll-list [data-up]:not([disabled])'); if (b) b.click(); T.foto('aviso'); SAVE.gold = g; updateWallets(); buildColl(); }
      T.paso('colección: otra facción'); T.clic('#coll-tabs [data-cf="nomuertos"]'); T.foto();
      T.paso('colección: facción bloqueada'); T.clic('#coll-tabs [data-cf="ciber"]'); T.foto();
      T.paso('colección: ranura de habilidad con algo'); T.clic('#coll-tabs [data-cf="animales"]'); T.clic('#coll-list [data-ab="bunny"]'); T.foto();
      T.paso('colección: cambiar habilidad'); T.clic('#ia-equip'); T.foto('lista'); T.clic('#pick-list [data-id="i2"]'); T.foto(); guardado();
      T.paso('colección: ranura de habilidad vacía'); T.clic('#coll-list [data-ab="beaver"]'); T.foto('lista'); T.clic('#pick-list [data-id="i5"]'); T.foto(); guardado();
      T.paso('colección: quitar habilidad'); T.clic('#coll-list [data-ab="beaver"]'); T.clic('#ia-unequip'); T.foto(); T.clic('#btn-item-close'); guardado();
      T.paso('colección: quitar desde la lista'); T.clic('#coll-list [data-ab="bunny"]'); T.clic('#ia-equip'); T.clic('#pick-list [data-id=""]'); T.foto(); guardado();
      T.paso('colección: ranura de objeto vacía'); T.clic('#coll-list [data-eq="acc"]'); T.foto('lista'); T.clic('#pick-list .pick-opt[data-id]:not([data-id=""])'); T.foto(); guardado();
      T.paso('colección: ranura de objeto con algo'); T.clic('#coll-list [data-eq="weapon"]'); T.foto(); T.clic('#btn-item-close');
      T.paso('colección: sin copias, ir al gashapón'); { const inv = SAVE.inv; SAVE.inv = inv.filter(x => x.k !== 'eq' || ITEMS[x.id].slot !== 'acc'); delete SAVE.equip.animales.acc; buildColl(); T.clic('#coll-list [data-eq="acc"]'); T.foto('lista'); T.clic('#pick-list [data-goto]'); T.foto('gashapón'); SAVE.inv = inv; T.clic('#scr-gacha .back'); T.avanza(3000); cierra(); T.clic('#btn-coll'); }
      if ($('#coll-list [data-eqall]')) { T.paso('colección: equipo para todos'); T.clic('#coll-list [data-eqall]'); T.foto('pregunta'); ok(); T.foto(); guardado(); }
      if ($('#btn-deck')) { T.paso('colección: mazo'); T.clic('#btn-deck'); T.foto(); T.clic('#deck-grid [data-dkp="junkcoon"]'); T.foto('elegida'); T.clic('#deck-board [data-dks="0"]'); T.foto('cambiada'); T.clic('#btn-deck-ok'); T.foto('listo'); guardado(); }
      if ($('#coll-list [data-goc]')) { T.paso('colección: carta que falta'); T.clic('#coll-list [data-goc]'); T.foto(); }

      /* ---------- inventario ---------- */
      T.paso('inventario'); casa(); T.clic('#btn-inv'); T.foto();
      T.paso('inventario: filtros y orden'); T.clic('#inv-filters [data-if="rare"]'); T.foto('raras'); T.clic('#inv-filters [data-if="all"]'); T.clic('#btn-inv-sort'); T.foto('por rareza'); T.clic('#btn-inv-sort'); T.foto('por nombre'); T.clic('#btn-inv-sort');
      T.paso('inventario: equipo'); T.clic('[data-it="eq"]'); T.foto(); T.clic('#inv-filters [data-if="weapon"]'); T.foto('armas'); T.clic('#inv-filters [data-if="all"]');
      T.paso('ficha: premio del pase'); T.clic('#inv-list [data-u="i15"]'); T.foto(); T.clic('#btn-item-close');
      T.paso('ficha: objeto de facción'); ficha('i14'); T.foto(); T.clic('#btn-item-close');
      T.paso('ficha: bloquear'); ficha('i9'); T.clic('#ia-lock'); T.foto(); T.clic('#ia-lock'); T.foto('otra vez'); guardado();
      T.paso('ficha: equipar un objeto'); T.clic('#ia-equip'); T.foto('lista'); T.clic('#pick-list [data-id="nomuertos"]'); T.foto(); guardado();
      T.paso('ficha: objeto a todos los líderes'); ficha('i18'); T.clic('#ia-equip'); T.clic('#pick-list [data-id="*"]'); T.foto(); guardado();
      T.paso('ficha: quitar un objeto'); T.clic('#ia-unequip'); T.foto(); guardado(); T.clic('#btn-item-close');
      T.paso('ficha: equipar una habilidad'); T.clic('[data-it="ab"]'); ficha('i6'); T.clic('#ia-equip'); T.foto('lista'); T.clic('#pick-list [data-id="fox"]'); T.foto(); guardado(); T.clic('#btn-item-close');
      T.paso('ficha: despedir'); ficha('i7'); T.clic('#ia-scrap'); T.foto('pregunta'); ok(); T.foto(); guardado();
      T.paso('ficha: evaluación'); ficha('i19'); T.clic('#ia-reroll'); T.foto('pregunta'); ok(); T.foto(); guardado(); T.clic('#btn-item-close');
      T.paso('ficha: evaluación sin oro'); { const g = SAVE.gold; SAVE.gold = 5; ficha('i19'); T.clic('#ia-reroll'); T.foto(); SAVE.gold = g; T.clic('#btn-item-close'); }
      T.paso('inventario: despido masivo'); T.clic('[data-it="eq"]'); T.foto('antes'); T.clic('#btn-mass'); T.foto('pregunta'); ok(); T.foto(); guardado();

      /* ---------- gashapón ---------- */
      T.paso('gashapón'); casa(); T.clic('#btn-gacha'); T.clic('[data-gt="ab"]'); T.foto(); T.apunta('máquina', (drawGacha(), T.lienzo($('#gacha-cv'))));
      T.paso('gashapón: x1'); T.clic('[data-pull="1"]'); T.foto('girando'); T.avanza(1200); T.foto(); guardado(); T.clic('#btn-gr-ok');
      T.paso('gashapón: x10'); T.clic('[data-pull="10"]'); T.avanza(1200); T.foto(); guardado();
      T.paso('gashapón: ver una de la tirada'); T.clic('#gr-card [data-gu]'); T.foto(); T.clic('#btn-item-close'); T.clic('#btn-gr-ok');
      T.paso('gashapón: equipo'); T.clic('[data-gt="eq"]'); T.foto(); T.clic('[data-pull="1"]'); T.avanza(1200); T.foto('x1'); T.clic('#btn-gr-ok'); T.clic('[data-pull="10"]'); T.avanza(1200); T.foto('x10'); guardado(); T.clic('#btn-gr-ok');
      T.paso('gashapón: x50'); T.clic('[data-pull="50"]'); T.avanza(1200); T.foto(); guardado();
      T.paso('gashapón: ver en el inventario'); T.clic('#btn-gr-inv'); T.foto('abierto');
      if ($('[data-gt="cd"]')) {
        T.paso('gashapón: cartas'); casa(); T.clic('#btn-gacha'); T.clic('[data-gt="cd"]'); T.foto(); T.apunta('máquina', (drawGacha(), T.lienzo($('#gacha-cv'))));
        T.clic('[data-pull="1"]'); T.avanza(1200); T.foto('x1'); T.clic('#btn-gr-ok'); T.clic('[data-pull="10"]'); T.avanza(1200); T.foto('x10'); guardado(); T.clic('#btn-gr-inv'); T.foto('ver en la colección');
      }
      T.paso('gashapón: sin gemas'); casa(); T.clic('#btn-gacha'); T.clic('[data-gt="ab"]'); { const g = SAVE.gems, t = SAVE.tickets; SAVE.gems = 10; SAVE.tickets = 0; buildGachaText(); T.clic('[data-pull="10"]'); T.foto(); T.clic('#cf-ok'); T.foto('a la tienda'); SAVE.gems = g; SAVE.tickets = t; }
      if ($('#gacha-ad [data-ad]')) { T.paso('gashapón: tirada con anuncio'); casa(); T.clic('#btn-gacha'); T.clic('[data-gt="eq"]'); T.clic('#gacha-ad [data-ad]'); T.foto('anuncio'); T.avanza(6000); T.foto('listo'); T.clic('#ad-get'); T.avanza(1200); T.foto(); guardado(); }

      /* ---------- tienda ---------- */
      T.paso('tienda'); casa(); T.clic('#btn-shop'); T.clic('[data-st="gold"]'); T.foto();
      T.paso('tienda: regalo diario'); T.clic('#btn-gift'); T.foto(); guardado();
      T.paso('tienda: comprar oro'); T.clic('#shop-list [data-buy]'); T.foto('pregunta'); ok(); T.foto(); guardado();
      T.paso('tienda: la oferta'); T.clic('#btn-joke'); T.foto(); T.clic('#cf-no');
      T.paso('tienda: gemas'); T.clic('[data-st="gems"]'); T.foto(); T.clic('#shop-list [data-buy="e3"]'); ok(); guardado();
      T.paso('tienda: reloj de la oferta'); T.clic('[data-st="gold"]'); T.avanza(5000); T.foto();
      if ($('#btn-starter')) { T.paso('tienda: pack de bienvenida'); T.clic('#btn-starter'); T.foto('pregunta'); ok(); T.avanza(600); T.foto(); guardado(); T.clic('#btn-item-close'); }
      if ($('#btn-noads')) { T.paso('tienda: sin anuncios'); T.clic('#btn-noads'); ok(); T.foto(); if ($('[data-ad="gift2"]')) { T.clic('[data-ad="gift2"]'); T.foto('regalo x2'); } guardado(); }
      T.paso('tienda: desde la cartera'); casa(); T.clic('#scr-title [data-wal="gems"]'); T.foto('abierto');

      /* ---------- horas extra ---------- */
      T.paso('horas extra'); casa(); T.salta(3 * 3600 * 1000); idleTick(); idleUI(true); T.foto(); guardado();
      T.paso('horas extra: elegir líder'); T.clic('#idle-hero'); T.foto(); T.clic('#idle-list [data-idf="nomuertos"]'); T.foto('cambiado'); guardado();
      T.paso('horas extra: recoger'); T.clic('#idle-get'); T.foto('ventana'); T.clic('#btn-ib-get'); T.foto('cobrado'); T.avanza(800); T.foto('objetos'); guardado(); cierra();
      T.paso('horas extra: nada que recoger'); T.clic('#idle-get'); T.foto();
      if ($('#idle-ads [data-ad="turbo"]')) { T.paso('horas extra: turbo y 4 horas'); T.clic('#idle-ads [data-ad="turbo"]'); T.avanza(100); T.foto('turbo'); T.clic('#idle-ads [data-ad="idle4"]'); T.avanza(100); T.foto('4 horas'); T.salta(3600 * 1000); idleTick(); idleUI(true); guardado(); }
      T.paso('horas extra: almacén lleno'); T.salta(13 * 3600 * 1000); idleTick(); idleUI(true); T.foto(); T.clic('#idle-get'); T.foto('ventana'); { const x2 = $('#ib-row [data-ad]'); T.clic(x2 || '#btn-ib-get'); } T.avanza(800); T.foto('cobrado'); guardado(); cierra();
      for (const f of ['animales', 'nomuertos', 'streamers', 'memes']) {   // la escena: cada líder con su especial
        T.paso('horas extra: escena de ' + f); idleSetHero(f); Object.assign(idleSc, { t: 0, off: 0, walk: 0, tick: 0, L: null, atkT: 0.6, lunge: 0, jump: 0, jumpHit: true, hit: 0, hp: 1, spec: 5, spawn: 0.3, wave: 0, sayT: 6, pend: null, pendT: 0, cast: 0, buffT: 0, wallT: 0, flur: 0, flurT: 0 }); idleSc.mobs.length = 0; idleSc.fx.length = 0; idleFrame(0.016);
        for (let i = 0; i < 900; i++) idleSim(1 / 30);
        T.apunta('estado', orden({ ola: idleSc.wave, vida: idleSc.hp, off: idleSc.off, bots: idleSc.mobs.map(m => [m.k, m.x, m.hp, !!m.dead]), fx: idleSc.fx.map(p => p.k).join(',') }));
        idleDraw(); T.apunta('dibujo', T.lienzo($('#idle-cv')));
      }

      /* ---------- opciones, novedades e instalar ---------- */
      T.paso('opciones'); casa(); T.clic('#btn-options'); T.foto();
      for (const b of ['btn-menumus', 'btn-nums', 'btn-feed', 'btn-badges', 'btn-blood', 'btn-shake', 'btn-chat']) if ($('#' + b)) { T.paso('opciones: ' + b); T.clic('#' + b); T.apunta('botón', $('#' + b).textContent); guardado(); T.clic('#' + b); }
      T.paso('opciones: volumen'); T.pon('#opt-vol', 40); T.pon('#opt-mus', 0); guardado(); T.pon('#opt-mus', 55);
      T.paso('opciones: copiar código'); T.clic('#btn-export'); await T.tic(); await T.tic(); T.foto('aviso'); T.apunta('código', orden(JSON.parse(decodeURIComponent(escape(atob($('#save-code').value))))));
      T.paso('opciones: cargar código'); { const o = JSON.parse(decodeURIComponent(escape(atob($('#save-code').value)))); o.gold = 777; o.unlocked = ['animales', 'nomuertos']; o.lastFac = 'nomuertos'; $('#save-code').value = btoa(unescape(encodeURIComponent(JSON.stringify(o)))); T.clic('#btn-import'); T.avanza(100); T.foto(); guardado(); }
      T.paso('opciones: código malo'); $('#save-code').value = 'esto no es un código'; T.clic('#btn-import'); T.foto('aviso');
      T.paso('opciones: novedades'); T.clic('#btn-news'); T.foto(); T.clic('#btn-news-ok'); T.avanza(100); cierra(); guardado();
      T.paso('opciones: instalar'); T.clic('#btn-install'); T.foto(); T.clic('#cf-no');
    }

    if (quiere('rumble')) {   // lo que solo tiene el Rumble y se apoya en los sistemas comunes: misiones, logros, pase, premio diario, campaña y perfil
      T.paso('misiones'); casa(); T.clic('#btn-missions'); T.foto(); SAVE.daily.list[0].prog = 9999; buildMissions(); T.clic('#mission-list [data-claim]:not([disabled])'); T.foto('cobrada'); guardado();
      if ($('#mission-list [data-ad="swap"]')) { T.paso('misiones: cambiar una'); T.clic('#mission-list [data-ad="swap"]'); T.avanza(6000); if ($('#ad-get') && !$('#ad-screen').hidden) T.clic('#ad-get'); T.foto(); }
      T.paso('misiones: semanales'); T.clic('[data-mt="w"]'); T.foto();
      T.paso('misiones: logros'); T.clic('[data-mt="a"]'); T.foto(); T.clic('#ach-cats [data-ac="g"]'); T.foto('gashapón'); T.clic('#btn-ach-all'); T.avanza(1000); T.foto('cobrados'); guardado();
      T.paso('pase'); casa(); T.clic('#btn-pass'); T.foto(); T.clic('#btn-claim-all'); T.foto('cobrado'); T.clic('#btn-buy-pass'); ok(); T.foto('ejecutivo'); T.clic('#btn-claim-all'); guardado();
      T.paso('premio diario'); casa(); SAVE.login = { last: '2026-10-6', day: 3, best: 4 }; openLogin(); T.foto(); T.clic('#btn-login'); T.foto('cobrado'); guardado();
      T.paso('campaña'); casa(); T.clic('#btn-camp'); T.foto(); T.clic('[data-cd="h"]'); T.foto('difícil'); T.clic('[data-cd="m"]'); T.foto('mítica'); T.clic('[data-cd="n"]');
      T.paso('campaña: ruleta'); openRoulette(); T.foto(); cierra();
      T.paso('antes de jugar: nivel'); T.clic('#world-list [data-lv="1-2"]'); T.foto(); T.clic('#fac-grid [data-fac="nomuertos"]'); T.foto('otra facción'); T.clic('#fac-grid [data-fac="ciber"]'); T.foto('bloqueada'); T.clic('#fac-grid [data-fac="animales"]');
      T.paso('antes de jugar: jefe en difícil'); campDiff = 'h'; openPrep('camp', findLevel('1-4')); T.foto(); campDiff = 'n';
      T.paso('antes de jugar: rápida'); openPrep('quick'); T.foto(); T.clic('[data-diff="normal"]'); T.foto('ejecutivo');
      T.paso('antes de jugar: modo jefe'); openPrep('boss'); T.foto(); T.clic('[data-bd="h"]'); T.foto('difícil');
      T.paso('antes de jugar: arena'); openPrep('arena'); T.foto(); guardado();
      T.paso('antes de jugar: sala de pruebas'); openPrep('sandbox'); T.foto();
      T.paso('cómo se juega'); casa(); T.clic('#btn-howto'); T.foto(); T.clic('#btn-howto-ok');
      T.paso('perfil'); casa(); T.clic('#btn-profile'); T.foto(); T.clic('#profile-avs [data-av="necrolord"]'); T.foto('otro avatar'); T.clic('#profile-name'); T.foto('nombre'); T.pon('#name-in', 'Otra Prueba 2'); T.clic('#name-ok'); T.avanza(100); T.foto('cambiado'); guardado(); cierra();
    }

    if (quiere('partida')) {   // una partida entera jugada por la máquina, paso a paso, y su pantalla final
      const juega = (nombre, prepara, segundos) => {
        T.paso(nombre); casa(); prepara(); startMatch(); T.avanza(4200); T.apunta('estado', G.state); T.foto('empieza'); G.autoplay = true;
        for (let i = 1; i <= segundos * 30; i++) {
          G.t += 1 / 30; updateGame(1 / 30); updateParts(1 / 30); if (i % 3 === 0) hud.update(); if (i % 30 === 0) T.avanza(1000);
          if (i % 300 === 0) T.apunta('segundo ' + i / 30, orden({ t: G.time, caos: [S.p.chaos, S.e.chaos], coronas: [S.p.crowns, S.e.crowns], gastado: [S.p.spent, S.e.spent], unidades: units.map(u => [u.team, u.type, u.x, u.y, u.hp, u.maxHp]), edificios: structs.map(s => [s.team, s.role, s.hp]), proyectiles: projs.length }));
          if (G.state !== 'play') break;
        }
        render(); T.apunta('campo', T.lienzo(cv)); T.foto('jugando');
        if (G.state === 'play') { T.clic('#btn-pause'); T.foto('pausa'); T.clic('#btn-resume'); endMatch('p', 'base'); }
        G.autoplay = false; T.avanza(100); G.state = 'end'; G.slowmo = 1; showEnd(); T.avanza(2000); T.foto('final'); guardado();
      };
      setFaction('animales');
      juega('partida rápida', () => { G.diff = 'normal'; G.diffCfg = CFG.diff.normal; G.prep = { mode: 'quick' }; setupMatch('quick'); }, 60);
      juega('partida de campaña con jefe', () => { campDiff = 'n'; G.prep = { mode: 'camp', lvl: findLevel('2-4'), cd: 'n' }; setupMatch('camp', findLevel('2-4'), 'n'); }, 50);
      juega('partida en difícil', () => { G.prep = { mode: 'camp', lvl: findLevel('1-2'), cd: 'h' }; setupMatch('camp', findLevel('1-2'), 'h'); }, 40);
      setFaction('nomuertos');
      juega('modo jefe con otra facción', () => { SAVE.bossSel = { wi: 6, d: 'n' }; G.prep = { mode: 'boss' }; setupMatch('boss'); }, 40);
      T.paso('después de jugar: menú'); T.clic('#btn-menu'); T.avanza(3000); cierra(); T.foto(); guardado();
    }

    if (quiere('borrar')) {
      T.paso('opciones: modo pruebas'); casa(); T.clic('#btn-options'); T.clic('#btn-test'); T.foto(); guardado(); T.clic('#scr-options .back'); T.avanza(3000); cierra(); T.clic('#btn-coll'); T.clic('#coll-tabs [data-cf="pop"]'); T.foto('todo abierto');
      T.paso('opciones: empezar de cero'); casa(); T.clic('#btn-options'); T.clic('#btn-reset'); T.foto('seguro'); T.clic('#btn-reset'); T.avanza(200); T.foto(); guardado();
    }
  },
};
