// Fans of Rumble · HORAS EXTRA de este juego: cuánto vale cada líder y cómo se le dibuja. El sistema es común: core/js/sistema/horas-extra.js.
'use strict';
// poder del líder: 100 = nivel 1 sin nada; sube con el nivel, la habilidad y el equipo (lo que de verdad lleva en la batalla)
function idlePower(fac) {
  const k = FACTIONS[fac].leader, d = CFG.units[k], es = effStats(k, fac), E = SAVE.equip[fac] || {};
  let n = invGet(SAVE.abEquip[k]) ? 1 : 0; for (const sl in SLOTS) { const it = invGet(E[sl]); if (it && it.k === 'eq') n++; }
  return Math.max(1, Math.sqrt((es.hp / d.hp) * (es.dmg / d.dmg) / Math.max(0.4, es.u.mCd)) + 0.05 * n);
}
// en la escena, el líder lleva puesto su equipo y dispara con el color de su proyectil
hook('idle.equipo', (eu, T, c, capa) => { drawEquip(eu, T, c, capa); });
hook('idle.disparo', tipo => (PROJ[tipo] && PROJ[tipo].spark) || '');
