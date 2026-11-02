// Fans Of Pets · CRIATURAS: el catálogo de las 72 criaturas (los 8 personajes de cada una de las 9 facciones: líder, 6 unidades y mata-sanadores).
// Son datos, no reglas: los nombres y la rareza salen de las cartas de core (core/js/serie/facciones/<facción>.js) y el color, de FAC_COLOR
// (core/js/serie/iconos.js); aquí no se copia nada de la serie. Necesita que esos archivos se hayan cargado antes. El dominio lo recibe.
'use strict';
PT.criaturas = (() => {
  const lista = FACTION_ORDER.flatMap(fac => {
    const F = FACTIONS[fac];
    return [F.leader, ...F.units, PETS.mataSanadores[fac]].map(k => ({ id: fac + ':' + k, fac, carta: k, nombre: CFG.cards[k].name, rareza: CFG.cards[k].rarity }));
  });
  return {
    lista,
    facciones: FACTION_ORDER.slice(),
    busca: id => lista.find(c => c.id === id) || null,
    color: fac => FAC_COLOR[fac] || '#ff9a3c',
    nombre: c => tr(c.nombre),
    faccion: fac => tr(FACTIONS[fac].name),
  };
})();
