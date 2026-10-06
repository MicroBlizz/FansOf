// Fans of Rumble · RETOS (2/3): los avatares, el nombre y lo que enseña el perfil. Se añaden a RETOS, que se crea en retos.js
'use strict';
Object.assign(RETOS, {
  avatares: () => FACTION_ORDER.filter(f => FACTIONS[f].leader && (SAVE.unlocked.includes(f) || SAVE.testAll)).map(f => FACTIONS[f].leader),
  nombre: { primera: '<b>¡Hola! Soy Lola</b>, me despidió Microblizz. Antes de empezar, ¿cómo quieres que te llame? Será tu nombre en la <b>Arena</b> y en el chat.',
    cambio: 'Así te verán en la <b>Arena</b> y en el chat de las partidas.' },

  /* ---------- perfil: la liga de la Arena bajo el nombre y las casillas de números ---------- */
  perfil() {
    const A = SAVE.arena || { cups: 0, best: 0, w: 0, l: 0 }, L = arenaLeague(A.cups), [sg, sm] = campStars();
    const fa = FACTION_ORDER.filter(f => FACTIONS[f].leader), fu = fa.filter(f => SAVE.unlocked.includes(f)).length;
    const games = A.w + A.l, pct = games ? Math.round(A.w / games * 100) + ' %' : '—';
    return { chip: 'Liga ' + L, sub: `Liga ${L} · ${fmt(A.cups)} copas`, celdas: [
      ['ARENA', `${A.w} - ${A.l}`, `ganadas - perdidas · ${pct}`],
      ['RÉCORD DE COPAS', fmt(A.best), 'tu mejor marca'],
      ['CAMPAÑA', `${sg} / ${sm} ★`, 'estrellas en normal'],
      celdaLogros(),
      ['FACCIONES', `${fu} / ${fa.length}`, 'desbloqueadas'],
      celdaRacha()] };
  },

});
