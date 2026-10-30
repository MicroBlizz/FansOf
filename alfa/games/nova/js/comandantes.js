// Fans of Nova · Comandantes de campaña: con la facción elegida al empezar la campaña, el capitán tiene que ser su líder o una de sus unidades.
// Los líderes con pasiva propia (NV_CAPITANES, partida.js) la mantienen; el resto de líderes y las unidades dan el bonus de la faceta de su rol en la serie.
// Las unidades y sus roles salen de core/js/serie (FACTIONS, ROLES y CFG.cards).
'use strict';
const NV_ROL_FACETA = { tank: 'defensa', swarm: 'navegacion', buster: 'fuego', assassin: 'fuego', ranged: 'fuego', support: 'ingenieria', spell: 'tacticas', control: 'tacticas' };
// La facción de la campaña, si hay campaña con facción elegida.
function nvFaccionCampana() { return NVP.camp && NVP.camp.faccion ? NVP.camp.faccion : null; }
// Los comandantes que se pueden elegir: en campaña, líder + unidades de la facción; sin campaña, los capitanes del prototipo.
function nvComandantes() {
  const f = nvFaccionCampana();
  if (!f || typeof FACTIONS === 'undefined' || !FACTIONS[f]) return NV_CAPITANES.slice();
  return [FACTIONS[f].leader].concat(FACTIONS[f].units).filter(Boolean);
}
// La faceta que da un comandante sin pasiva propia (null si la tiene o no se sabe su rol).
function nvCapFaceta(id) {
  if (NV_CAPITANES.includes(id) || typeof ROLES === 'undefined') return null;
  return NV_ROL_FACETA[ROLES[id]] || null;
}
function nvCapNombre(id) {
  const K = NOVA_TRIPULACION.capitanes.find(c => c.id === id);
  return K ? K.nombre : (typeof CFG !== 'undefined' && CFG.cards[id] ? CFG.cards[id].name : id);
}
