// Fans Of · Medición de balance de Rumble: se mete dentro del juego (lo hace balance-pagina.js) y juega partidas «espejo» con la IA en los dos lados.
// Espejo = misma facción, mismo mazo y mismo nivel en los dos lados; solo un lado lleva la habilidad o el objeto que se mide. Ver PLAN-BALANCE.md.
// window.BALANCE.lista() dice qué se puede medir; window.BALANCE.juega(casos) juega esas partidas y devuelve cómo acabó cada una.
'use strict';
(() => {
  // Lo visual (partículas, sonidos, chat, números flotantes) no cambia el resultado: usa Math.random y no el azar con semilla.
  // Se apaga para ir mucho más rápido. Comprobado: con y sin esto, las mismas partidas acaban igual.
  const nada = () => {};
  for (const n of ['play', 'banner', 'chatSay', 'chatEv', 'chatBurst', 'chatTick', 'chatWatch', 'addNum', 'puff', 'ring', 'sparks', 'chips', 'impact', 'flashAt', 'slashFx', 'hitLines', 'screenFlash', 'shake', 'feedAdd', 'deathFx', 'structDeathFx', 'confetti', 'toast']) if (typeof window[n] === 'function') window[n] = nada;

  const NIVEL = 5;   // nivel de todas las cartas en las dos partes
  // facciones jugables con líder (las que tienen objeto propio)
  const facciones = () => Object.keys(FAC_ITEM).filter(f => FACTIONS[f] && FACTIONS[f].leader);
  // el equipo de una facción: sus 6 primeras unidades y el líder; si se pide, la habilidad en las 7 cartas o el objeto en el líder
  function equipo(fac, c) {
    const F = FACTIONS[fac], deck = F.units.filter(k => !isSpell(k)).slice(0, 6), todas = deck.concat([F.leader]);
    const lvl = {}, ab = {}, equip = {};
    for (const k of todas) lvl[k] = NIVEL;
    if (c && c.ab) for (const k of todas) ab[k] = { k: 'ab', id: c.ab, q: [c.q] };
    if (c && c.eq) equip[ITEMS[c.eq].slot] = { k: 'eq', id: c.eq, q: ITEMS[c.eq].st.map(() => c.q) };
    return { fac, deck, lvl, stars: {}, ab, equip, modo: 'salvaje' };
  }
  // vida que le queda a un lado: torres y sede, cada una de 0 a 1 (de 0 a 3 en total)
  const vidaDe = t => towers[t].reduce((a, s) => a + (s.alive ? s.hp / s.maxHp : 0), 0) + (bases[t].alive ? bases[t].hp / bases[t].maxHp : 0);
  // una partida. caso: { fac, lado: 'p'|'e' (quién lleva lo que se mide), ab o eq (id), q (calidad 0-1), vals (opcional: probar otros números de una habilidad), semilla }
  function una(caso) {
    const D = caso.ab && caso.vals ? ABILITIES[caso.ab] : null, antes = D && D.vals; if (D) D.vals = caso.vals;
    try {
      const c = { ab: caso.ab, eq: caso.eq, q: caso.q == null ? 0.5 : caso.q };
      G.autoplay = true; setupMatch('pvp', null, null, { p: equipo(caso.fac, caso.lado === 'p' ? c : null), e: equipo(caso.fac, caso.lado === 'e' ? c : null) });
      G.diffCfg.think = [0.6, 1.2];   // los dos lados piensan igual de rápido
      G.seedNext = caso.semilla; startMatch(); G.state = 'play';   // sin la cuenta atrás
      const L = FACTIONS[caso.fac].leader; let n = 0;
      while (G.state === 'play' && n < 60 * 260) {
        aiGeneric('e', SIM_DT);   // en PvP el rival no tiene IA: se le pone la misma que al lado del jugador
        // La IA de pruebas no saca al líder por su cuenta, y quien juega de verdad sí: sin esto los objetos (que solo lleva el líder) no cuentan.
        if (n % 30 === 0) for (const t of ['p', 'e']) if (canDeploy(t, L) && S[t].chaos >= cardDef(L).cost) doDeploy(t, L, clamp(laneBridge(chooseLane(t)), 34, W - 34), t === 'p' ? 495 : 330);
        simStep(SIM_DT); n++; if (parts.length) parts.length = 0;
      }
      return { w: G.winner || '-', s: Math.round(n / 60), vp: +vidaDe('p').toFixed(2), ve: +vidaDe('e').toFixed(2) };
    } finally { G.state = 'title'; if (D) D.vals = antes; }
  }
  window.BALANCE = {
    lista: () => ({ facciones: facciones(), habilidades: Object.keys(ABILITIES), objetos: Object.keys(ITEMS).filter(id => !ITEMS[id].fac), deFaccion: Object.assign({}, FAC_ITEM), version: typeof VERSION === 'string' ? VERSION : '' }),
    juega: casos => casos.map(c => Object.assign({}, c, una(c))),
  };
})();
