// Fans Of Pets · PIELES del muñeco kawaii por código (muneco.js): qué lleva cada criatura encima del mismo muñeco. Son datos: colores
// del pelo, de la barriga y del hocico, el tipo de orejas y de cola, y sus detalles (corona, antifaz, cinta). Cada criatura que pase al
// muñeco añade aquí su piel; la que no tenga, usa la de su facción por defecto (pelo de su color). docs/pets/animacion-2d.md.
'use strict';
PT.pieles = (() => {
  const TRAZO = '#2a1a22';
  const PIELES = {
    // CrazyBunny: conejita blanca de orejas largas con su corona
    'animales:bunny': { pelo: '#ffffff', barriga: '#eee8f6', interior: '#ffb3c6', mejillas: '#ffb3c6', orejas: 'largas', cola: 'bola',
      detalles: ['corona'] },
    // el hurón ninja: marrón con hocico crema, antifaz oscuro, cinta roja con lazo y cola a rayas
    'animales:huron': { pelo: '#a8703f', barriga: '#fbecd0', interior: '#7a4f2c', mejillas: '#e7907a', orejas: 'redondas', cola: 'rayas',
      raya: '#5a3a22', hocico: '#fbecd0', antifaz: '#3a3438', cinta: '#d9363e', detalles: ['antifaz', 'cinta'] },
  };
  const tiene = id => !!PIELES[id];
  const ids = () => Object.keys(PIELES);
  // la piel de esa criatura (con el trazo común); sin piel propia, una lisa del color que se pase
  function de(id, color = '#ffffff') {
    const p = PIELES[id] || { pelo: color, barriga: '#ffffff', interior: '#ffb3c6', mejillas: '#ffb3c6', orejas: 'redondas', cola: 'bola', detalles: [] };
    return { trazo: TRAZO, ...p };
  }
  return { de, tiene, ids };
})();
