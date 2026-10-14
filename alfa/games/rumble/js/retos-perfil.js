// Fans of Rumble · RETOS (2/3): los avatares, el nombre y lo que enseña el perfil. Se añaden a RETOS, que se crea en retos.js
'use strict';
Object.assign(RETOS, {
  avatares: () => FACTION_ORDER.filter(f => FACTIONS[f].leader && (SAVE.unlocked.includes(f) || SAVE.testAll)).map(f => FACTIONS[f].leader),
  nombre: { primera: '<b>¡Hola! Soy Lola</b>, me despidió Microblizz. Antes de empezar, ¿cómo quieres que te llame? Será tu nombre en la <b>Arena</b> y en el chat.',
    cambio: 'Así te verán en la <b>Arena</b> y en el chat de las partidas.' },

  /* ---------- perfil: la liga (copas del PvP Estándar) bajo el nombre y las casillas de números ---------- */
  perfil() {
    const M = pvpMio('estandar'), c = pvpCopas('estandar'), L = arenaLeague(c), [sg, sm] = campStars();
    const fa = FACTION_ORDER.filter(f => FACTIONS[f].leader), fu = fa.filter(f => SAVE.unlocked.includes(f)).length;
    const games = M.w + M.l, pct = games ? Math.round(M.w / games * 100) + ' %' : '—';
    return { chip: 'Liga ' + L, sub: `Liga ${L} · ${fmt(c)} copas`, celdas: [
      ['PVP', `${M.w} - ${M.l}`, `ganadas - perdidas · ${pct}`],
      ['RÉCORD DE COPAS', fmt(Math.max(M.best, c)), 'tu mejor marca'],
      ['CAMPAÑA', `${sg} / ${sm} ★`, 'estrellas en normal'],
      celdaLogros(),
      ['FACCIONES', `${fu} / ${fa.length}`, 'desbloqueadas'],
      celdaRacha()] };
  },

});
