// Fans of Jump · Los Animales Locos atrapados en el río: MadSquirrel, SlyFox, JunkCoon, MeerCat y BoomBeaver. Sus dibujos 3D
// (asustados de frente y de espaldas a cuestas) salen del estudio (herramientas/jump/estudio) y están en la lámina.
'use strict';

const AMIGOS = [
  { id: 'ardilla', nombre: 'MadSquirrel' },
  { id: 'zorro', nombre: 'SlyFox' },
  { id: 'mapache', nombre: 'JunkCoon' },
  { id: 'suricata', nombre: 'MeerCat' },
  { id: 'castor', nombre: 'BoomBeaver' },
];
const nombreAmigo = id => (AMIGOS.find(a => a.id === id) || {}).nombre || '';
