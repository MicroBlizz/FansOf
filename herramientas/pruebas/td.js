// Fans Of · Comparador: el guion de Fans of TD. Se ejecuta dentro del juego, con la partida de prueba de abajo.
// Cada T.paso() es una cosa que haría un jugador; T.foto() apunta lo que se ve y T.apunta() lo que queda guardado.
var PRUEBA = {
  clave: 'fortd-save', claves: ['fortd-save'],
  lista: 'typeof G !== "undefined" && !!window.__TD && !document.querySelector("#scr-title").hidden',
  // una partida a medias: niveles ganados, cartas de varios niveles, copias de todas las calidades y equipo puesto en varias cartas
  guardado: {
    v: 1, stars: { '1-1': 3, '1-2': 2, '1-3': 1, '1-4': 2, '2-1': 1 }, muted: false, gold: 54321, gems: 9000, tickets: 2, fac: 'animales', vsDiff: 'normal',
    units: { bunny: { lvl: 3, xp: 999 }, squirrel: { lvl: 2, xp: 120 }, beaver: { lvl: 1, xp: 10 }, fox: { lvl: 1, xp: 0 }, necrolord: { lvl: 5, xp: 10 }, skeleton: { lvl: 10, xp: 0 }, memelord: { lvl: 4, xp: 600 } },
    inv: [{ u: 'i1', k: 'ab', id: 'cafeina', q: [0.75] }, { u: 'i2', k: 'ab', id: 'vampiro', q: [0.2] }, { u: 'i3', k: 'ab', id: 'vampiro', q: [0.95], lock: true }, { u: 'i4', k: 'ab', id: 'clon', q: [1] },
      { u: 'i5', k: 'ab', id: 'furia', q: [0.5] }, { u: 'i6', k: 'ab', id: 'punos', q: [0.1] }, { u: 'i7', k: 'ab', id: 'punos', q: [0.3] }, { u: 'i19', k: 'ab', id: 'iman', q: [0.62] }, { u: 'i20', k: 'ab', id: 'gigante', q: [0.33, 0.8] },
      { u: 'i8', k: 'eq', id: 'espada_carton', q: [0.3] }, { u: 'i9', k: 'eq', id: 'espada_carton', q: [0.6] }, { u: 'i10', k: 'eq', id: 'raton_dpi', q: [0.9, 0.4] }, { u: 'i11', k: 'eq', id: 'cuernos', q: [0.5] },
      { u: 'i12', k: 'eq', id: 'taza', q: [0.05] }, { u: 'i13', k: 'eq', id: 'zanahoria_oro', q: [0.8, 0.7] }, { u: 'i14', k: 'eq', id: 'corona_huesos', q: [0.5, 0.5] }, { u: 'i15', k: 'eq', id: 'casco_vr', q: [0.9] },
      { u: 'i17', k: 'eq', id: 'boton_pausa', q: [1] }, { u: 'i18', k: 'eq', id: 'auriculares', q: [0.45] }, { u: 'i21', k: 'eq', id: 'taza', q: [0.2] }, { u: 'i22', k: 'eq', id: 'cuernos', q: [0.15] }],
    invSeq: 22, abEquip: { bunny: 'i1', squirrel: 'i3', necrolord: 'i4' },
    equip: { bunny: { weapon: 'i13', head: 'i11' }, necrolord: { head: 'i14', acc: 'i17' }, squirrel: { weapon: 'i10' } },
    pity: { ab: 3, abL: 20, eq: 9, eqL: 49, qab: 2, qeq: 9 }, giftDay: '', idle: null, seenVer: '', vol: 0.8, mus: 0.6, menuMus: 'animales', tut: { done: true },
  },

  async pasos(T, parte) {
    const $ = T.$, quiere = p => !parte || parte.split(',').includes(p);
    const cierra = () => { for (const id of ['scr-news', 'scr-confirm', 'scr-item', 'scr-pick', 'scr-idle', 'scr-idlebox', 'scr-pause']) { const e = document.getElementById(id); if (e) e.hidden = true; } };
    const casa = () => { cierra(); (typeof goHome === 'function' ? goHome : showMenu)(); T.avanza(3000); cierra(); };
    const orden = v => (Array.isArray(v) ? v.map(orden) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, orden(v[k])])) : typeof v === 'number' ? +v.toPrecision(10) : v);
    const guardado = () => T.apunta('guardado', orden(SAVE));
    const pregunta = () => !$('#scr-confirm').hidden;
    const ok = () => { T.clic('#cf-ok'); T.avanza(50); };
    const ficha = u => { openItem(u); };

    /* ---------- preparación: fechas del reloj de mentira y ninguna ventana de bienvenida ---------- */
    T.paso('preparación');
    cierra(); SAVE.seenVer = VERSION; SAVE.idle = { fac: 'animales', h: 3.25, gold: 1234.5, gems: 7.2, items: 1.3, last: Date.now() };
    saveGame(); casa(); T.apunta('versión', VERSION); guardado();

    if (quiere('sonido')) {   // lo que el juego le pide al altavoz: cada efecto, el volumen y lo que suena en cada momento
      const efecto = n => (typeof sfx === 'function' ? sfx(n) : play(n));
      T.paso('sonido: efectos de la partida'); G.screen = 'play'; for (const n of ['shot', 'hit', 'crit', 'lob', 'boom', 'stomp', 'pop', 'coin', 'place', 'up', 'leak', 'horn', 'jump', 'zap', 'womp', 'boss', 'win']) { T.avanza(2000); efecto(n); } T.sonido(); G.screen = 'title';
      T.paso('sonido: efectos de los menús'); for (const n of ['select', 'deny', 'levelup', 'win', 'crown', 'roll', 'despido', 'sad']) { T.avanza(2000); play(n); } T.sonido();
      T.paso('sonido: volumen'); T.clic('#btn-opts'); T.pon('#opt-vol', 30); T.pon('#opt-mus', 80); T.apunta('guardado', [SAVE.vol, SAVE.mus]); T.avanza(2000); efecto('coin'); T.sonido('más bajo');
      T.clic('#scr-title .btn-sound'); T.apunta('silencio', [SAVE.muted, $('#scr-title .btn-sound').textContent]); T.avanza(2000); efecto('coin'); T.sonido('callado'); T.clic('#scr-title .btn-sound'); T.pon('#opt-vol', 80); T.pon('#opt-mus', 60);
      const suena = () => { musicUpdate(); const o = [M.want, M.tmT, M.duck]; for (let i = 0; i < 30; i++) { T.altavoz().currentTime += 0.3; musicPump(); } return o; };
      casa(); T.paso('sonido: música del menú'); T.apunta('canción', suena()); T.sonido();
      T.paso('sonido: música de la partida'); startLevel(WORLDS_TD[1].levels[3]); T.apunta('canción', suena()); T.sonido(); G.paused = true; T.apunta('en pausa', suena()); T.sonido('pausa'); G.paused = false;
      T.paso('sonido: última oleada con jefe'); G.wave = G.waves; G.inWave = true; T.apunta('canción', suena()); T.sonido();
      T.paso('sonido: música del final'); G.screen = 'result'; $('#end-title').className = 'end-title ol-big win'; T.apunta('canción', suena()); T.sonido(); $('#end-title').className = 'end-title ol-big lose'; T.apunta('canción de la derrota', suena()); T.sonido('derrota');
      G.over = true; casa();
    }

    if (quiere('menus')) {
      T.paso('portada'); T.foto();

      /* ---------- colección ---------- */
      T.paso('colección'); T.clic('#btn-coll'); T.foto(); guardado();
      T.paso('colección: subir de nivel'); T.clic('#coll-list [data-up]:not([disabled])'); T.foto(); guardado();
      T.paso('colección: sin oro para subir'); { const g = SAVE.gold; SAVE.gold = 3; buildColl(); const b = $('#coll-list [data-up]:not([disabled])'); if (b) b.click(); T.foto('aviso'); SAVE.gold = g; updateWallets(); buildColl(); }
      T.paso('colección: otra raza'); T.clic('#coll-tabs [data-cf="nomuertos"]'); T.foto(); T.clic('#coll-tabs [data-cf="pop"]'); T.foto('la última');
      T.paso('colección: ranura de habilidad con algo'); T.clic('#coll-tabs [data-cf="animales"]'); T.clic('#coll-list [data-ab="bunny"]'); T.foto();
      T.paso('colección: cambiar habilidad'); T.clic('#ia-equip'); T.foto('lista'); T.clic('#pick-list [data-id="i2"]'); T.foto(); guardado();
      T.paso('colección: ranura de habilidad vacía'); T.clic('#coll-list [data-ab="beaver"]'); T.foto('lista'); T.clic('#pick-list [data-id="i5"]'); T.foto(); guardado();
      T.paso('colección: quitar habilidad'); T.clic('#coll-list [data-ab="beaver"]'); T.clic('#ia-unequip'); T.foto(); T.clic('#btn-item-close'); guardado();
      T.paso('colección: quitar desde la lista'); T.clic('#coll-list [data-ab="bunny"]'); T.clic('#ia-equip'); T.clic('#pick-list [data-id=""]'); T.foto(); guardado();
      T.paso('colección: ranura de objeto vacía'); T.clic('#coll-list [data-eq="acc"][data-ek="bunny"]'); T.foto('lista'); T.clic('#pick-list .pick-opt[data-id]:not([data-id=""])'); T.foto(); guardado();
      T.paso('colección: objeto que llevaba otra carta'); T.clic('#coll-list [data-eq="weapon"][data-ek="beaver"]'); T.foto('lista'); T.clic('#pick-list [data-id="i13"]'); T.foto(); guardado();
      T.paso('colección: ranura de objeto con algo'); T.clic('#coll-list [data-eq="head"][data-ek="bunny"]'); T.foto(); T.clic('#btn-item-close');
      T.paso('colección: sin copias, ir al gashapón'); { const inv = SAVE.inv; SAVE.inv = inv.filter(x => x.k !== 'eq' || ITEMS[x.id].slot !== 'acc'); for (const k in SAVE.equip) delete SAVE.equip[k].acc; buildColl(); T.clic('#coll-list [data-eq="acc"][data-ek="fox"]'); T.foto('lista'); T.clic('#pick-list [data-goto]'); T.foto('gashapón'); SAVE.inv = inv; T.clic('#scr-gacha .back'); T.avanza(3000); cierra(); }

      /* ---------- inventario ---------- */
      T.paso('inventario'); casa(); T.clic('#btn-inv'); T.clic('[data-it="ab"]'); T.foto();
      T.paso('inventario: filtros y orden'); T.clic('#inv-filters [data-if="rare"]'); T.foto('raras'); T.clic('#inv-filters [data-if="all"]'); T.clic('#btn-inv-sort'); T.foto('por rareza'); T.clic('#btn-inv-sort'); T.foto('por nombre'); T.clic('#btn-inv-sort');
      T.paso('inventario: equipo'); T.clic('[data-it="eq"]'); T.foto(); T.clic('#inv-filters [data-if="weapon"]'); T.foto('armas'); T.clic('#inv-filters [data-if="all"]');
      T.paso('ficha: con una pega'); T.clic('#inv-list [data-u="i15"]'); T.foto(); T.clic('#btn-item-close');
      T.paso('ficha: objeto de facción'); ficha('i14'); T.foto(); T.clic('#btn-item-close');
      T.paso('ficha: habilidad con tres efectos'); ficha('i20'); T.foto(); T.clic('#btn-item-close');
      T.paso('ficha: bloquear'); ficha('i9'); T.clic('#ia-lock'); T.foto(); T.clic('#ia-lock'); T.foto('otra vez'); guardado();
      T.paso('ficha: equipar un objeto'); T.clic('#ia-equip'); T.foto('lista'); T.clic('#pick-list [data-id="skeleton"]'); T.foto(); guardado();
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
      T.paso('gashapón: sin gemas'); casa(); T.clic('#btn-gacha'); T.clic('[data-gt="ab"]'); { const g = SAVE.gems, t = SAVE.tickets; SAVE.gems = 10; SAVE.tickets = 0; buildGachaText(); T.clic('[data-pull="10"]'); T.foto(); T.clic('#cf-ok'); T.foto('a la tienda'); SAVE.gems = g; SAVE.tickets = t; }

      /* ---------- tienda ---------- */
      T.paso('tienda'); casa(); T.clic('#btn-shop'); T.clic('[data-st="gold"]'); T.foto();
      T.paso('tienda: regalo diario'); T.clic('#btn-gift'); T.foto(); guardado();
      T.paso('tienda: comprar oro'); T.clic('#shop-list [data-buy]'); T.foto('pregunta'); ok(); T.foto(); guardado();
      T.paso('tienda: la oferta'); T.clic('#btn-joke'); T.foto(); T.clic('#cf-no');
      T.paso('tienda: gemas'); T.clic('[data-st="gems"]'); T.foto(); T.clic('#shop-list [data-buy="e3"]'); ok(); guardado();
      T.paso('tienda: reloj de la oferta'); T.clic('[data-st="gold"]'); T.avanza(5000); T.foto();
      T.paso('tienda: desde la cartera'); casa(); T.clic('#scr-title [data-wal="gems"]'); T.foto('abierto');

      /* ---------- horas extra ---------- */
      T.paso('horas extra'); casa(); T.salta(3 * 3600 * 1000); idleTick(); idleUI(true); T.foto(); guardado();
      T.paso('horas extra: elegir líder'); T.clic('#idle-hero'); T.foto(); T.clic('#idle-list [data-idf="nomuertos"]'); T.foto('cambiado'); guardado();
      T.paso('horas extra: recoger'); T.clic('#idle-get'); T.foto('ventana'); T.clic('#btn-ib-get'); T.foto('cobrado'); T.avanza(800); T.foto('objetos'); guardado(); cierra();
      T.paso('horas extra: nada que recoger'); T.clic('#idle-get'); T.foto();
      T.paso('horas extra: almacén lleno'); T.salta(13 * 3600 * 1000); idleTick(); idleUI(true); T.foto(); T.clic('#idle-get'); T.foto('ventana'); T.clic('#btn-ib-get'); T.avanza(800); T.foto('cobrado'); guardado(); cierra();
      for (const f of ['animales', 'nomuertos', 'ciber', 'memes']) {   // la escena: cada líder con su especial
        T.paso('horas extra: escena de ' + f); idleSetHero(f);
        Object.assign(idleSc, { t: 0, off: 0, walk: 0, tick: 0, L: null, atkT: 0.6, lunge: 0, jump: 0, jumpHit: true, hit: 0, hp: 1, spec: 5, spawn: 0.3, wave: 0, sayT: 6, pend: null, pendT: 0, cast: 0, buffT: 0, wallT: 0, flur: 0, flurT: 0 }); idleSc.mobs.length = 0; idleSc.fx.length = 0; idleFrame(0.016);
        for (let i = 0; i < 900; i++) idleSim(1 / 30);
        T.apunta('estado', orden({ ola: idleSc.wave, vida: idleSc.hp, off: idleSc.off, bots: idleSc.mobs.map(m => [m.k, m.x, m.hp, !!m.dead]), fx: idleSc.fx.map(p => p.k).join(',') }));
        idleDraw(); T.apunta('dibujo', T.lienzo($('#idle-cv')));
      }

      /* ---------- opciones, novedades e instalar ---------- */
      T.paso('opciones'); casa(); T.clic('#btn-opts'); T.foto();
      for (const b of ['btn-menumus', 'btn-nums', 'btn-feed', 'btn-badges', 'btn-blood', 'btn-shake', 'btn-chat']) if ($('#' + b)) { T.paso('opciones: ' + b); T.clic('#' + b); T.apunta('botón', $('#' + b).textContent); guardado(); T.clic('#' + b); }
      T.paso('opciones: volumen'); T.pon('#opt-vol', 40); T.pon('#opt-mus', 0); guardado(); T.pon('#opt-mus', 55);
      T.paso('opciones: copiar código'); T.clic('#btn-export'); await T.tic(); await T.tic(); T.foto('aviso'); T.apunta('código', orden(JSON.parse(decodeURIComponent(escape(atob($('#save-code').value))))));
      T.paso('opciones: cargar código'); { const o = JSON.parse(decodeURIComponent(escape(atob($('#save-code').value)))); o.gold = 777; o.fac = 'nomuertos'; $('#save-code').value = btoa(unescape(encodeURIComponent(JSON.stringify(o)))); T.clic('#btn-import'); T.avanza(100); T.foto(); if (pregunta()) T.clic('#cf-no'); guardado(); }
      T.paso('opciones: código malo'); $('#save-code').value = 'esto no es un código'; T.clic('#btn-import'); T.foto('aviso');
      T.paso('opciones: código de otro juego'); $('#save-code').value = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, gold: 5, gems: 5, unlocked: ['animales'], camp: {}, units: {}, inv: [] })))); T.clic('#btn-import'); T.avanza(100); T.foto('aviso'); if (pregunta()) T.clic('#cf-no'); guardado();
      T.paso('opciones: novedades'); T.clic($('#btn-opt-news') ? '#btn-opt-news' : '#scr-options #btn-news'); T.foto(); T.clic('#btn-news-ok'); T.avanza(100); cierra(); guardado();
      T.paso('opciones: instalar'); T.clic('#btn-install'); T.foto(); T.clic('#cf-no');
      T.paso('novedades desde el menú'); casa(); T.clic('#scr-title #btn-news'); T.foto('abierto'); T.clic('#btn-news-ok'); T.avanza(100); cierra();
    }

    if (quiere('td')) {   // las pantallas propias del TD que usan los estilos y las funciones comunes
      T.paso('campaña'); casa(); T.clic('#btn-camp'); T.foto();
      T.paso('antes de jugar: nivel'); T.clic('#world-list [data-lv="1-2"]'); T.foto(); T.clic('#fac-grid [data-fac="nomuertos"]'); T.foto('otra raza'); T.clic('#fac-grid [data-fac="animales"]'); guardado();
      T.paso('antes de jugar: jefe'); T.clic('#btn-prep-back'); T.clic('#world-list [data-lv="1-4"]'); T.foto();
      T.paso('antes de jugar: modo VS'); casa(); T.clic('#btn-vs'); T.foto(); T.clic('[data-vd="dificil"]'); T.foto('CEO'); T.clic('[data-vd="normal"]'); guardado();
      T.paso('cómo se juega'); casa(); T.clic('#btn-howto'); T.foto(); T.clic('#btn-howto-ok');
    }

    if (quiere('partida')) {   // un nivel y una partida VS jugados paso a paso, con sus pantallas
      const ks = Object.keys(TOWERS.animales);
      T.paso('nivel de campaña'); casa(); SAVE.fac = 'animales'; startLevel(WORLDS_TD[0].levels[1]); T.avanza(1500); T.foto('empieza');
      T.apunta('torres', [[7, 6, ks[0]], [6, 6, ks[1]], [8, 6, ks[1]], [5, 6, ks[2]], [9, 6, ks[2]], [4, 7, ks[1]], [10, 7, ks[3]], [7, 0, ks[1]], [99, 3, ks[1]]].map(([c, r, k]) => build(k, c, r)));
      if (G.towers[1]) { G.sel = G.towers[1]; hud(); T.foto('torre elegida'); upgrade(G.towers[1]); G.sel = null; hud(); }
      for (let i = 1; i <= 3600 && !G.over; i++) {
        if (!G.inWave && G.wave < G.waves) startWave();
        update(1 / 30); if (i % 3 === 0) hud(); if (i % 30 === 0) T.avanza(1000);
        if (i === 450) { T.clic('#btn-pause'); T.foto('pausa'); T.clic('#btn-resume'); }
        if (i % 300 === 0) T.apunta('segundo ' + i / 30, orden({ caos: G.gold, vida: G.lives, oleada: [G.wave, G.waves, G.inWave], bajas: G.kills, enemigos: G.foes.map(f => [f.k, f.x, f.y, f.hp]), torres: G.towers.map(t => [t.k, t.lvl, t.cell, t.rage]) }));
      }
      draw(); T.apunta('campo', T.lienzo(cv)); T.foto('jugando'); T.apunta('acabó sola', [G.over, G.wave, G.lives]);
      if (!G.over) finish(true);
      T.avanza(2000); T.foto('final'); guardado();
      T.paso('nivel perdido'); T.clic('#btn-again'); T.avanza(500); G.lives = 0.5; finish(false); T.avanza(2000); T.foto('final'); guardado();

      T.paso('modo VS'); casa(); startVS('normal'); T.avanza(1500); T.foto('empieza');
      T.apunta('torres', [[7, 6, ks[1]], [6, 6, ks[1]], [8, 6, ks[2]]].map(([c, r, k]) => build(k, c, r)));
      T.apunta('envíos', [vsSend(ks[1]), vsSend(ks[1]), vsUpgrade(ks[1]), vsSend(ks[2])]);
      T.clic('#btn-mode'); hud(); T.foto('enviar unidades'); T.clic('#btn-mode');
      for (let i = 1; i <= 1500 && !G.over; i++) {
        vsUpdate(1 / 30); if (i % 3 === 0) hud(); if (i % 30 === 0) T.avanza(1000); if (i % 200 === 0) vsSend(ks[1]);
        if (i % 300 === 0) { const V = G.vs; T.apunta('segundo ' + i / 30, orden({ t: V.t, caos: G.gold, vida: G.lives, income: V.me.income, enviadas: V.me.sent, torres: G.towers.length, enemigos: G.foes.length, rival: [V.ai.lives, V.ai.gold, V.ai.income, V.ai.towers.length, V.ai.foes.length] })); }
      }
      draw(); T.apunta('campo', T.lienzo(cv)); T.foto('jugando'); vsView('ai'); hud(); draw(); T.apunta('campo rival', T.lienzo(cv)); T.foto('mirando al rival'); vsView('me');
      if (!G.over) { G.vsCur = 'ai'; finish(true); G.vsCur = 'me'; } T.avanza(2000); T.foto('final'); guardado();
      T.paso('después de jugar: menú'); T.clic('#btn-menu'); T.avanza(3000); cierra(); T.foto(); guardado();
    }

    if (quiere('borrar')) {
      T.paso('opciones: modo pruebas'); casa(); T.clic('#btn-opts'); T.clic('#btn-test'); T.foto('pregunta'); if (pregunta()) ok(); T.foto(); guardado(); T.clic('#scr-options .back'); T.avanza(3000); cierra(); T.clic('#btn-camp'); T.foto('todo abierto');
      T.paso('opciones: empezar de cero'); casa(); T.clic('#btn-opts'); T.clic('#btn-reset'); T.foto('seguro');
      if (pregunta()) T.clic('#cf-no'); else { T.clic('#btn-reset'); T.avanza(200); T.foto(); }
      guardado();
    }
  },
};
