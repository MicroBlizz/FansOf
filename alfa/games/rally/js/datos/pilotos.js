// Fans of Rally · datos · PILOTOS: los Animales Locos (eliges uno) y los coches de Microblizz (los rivales). Cada piloto lleva los colores
// de su coche, que pinta adaptadores/hojas.js en lonchas, y tres cifras que multiplican las del coche de AJUSTES: velocidad (la punta),
// agarre (lo que derrapa) y aceleracion. Las tres suman 3 en todos: ninguno es mejor en todo.
'use strict';
RA.PILOTOS = RA.congela([
  { id: 'bunny', nombre: 'CrazyBunny', lema: 'Salta los baches. Literalmente.', velocidad: 1.06, agarre: 0.94, aceleracion: 1,
    colores: { base: '#26262e', medio: '#1a1a20', borde: '#09090c', raya: '#ff8a1f', rayaS: '#c9560a', techo: '#ff8a1f' } },
  { id: 'squirrel', nombre: 'MadSquirrel', lema: 'Arranca antes que el semáforo.', velocidad: 0.95, agarre: 0.97, aceleracion: 1.08,
    colores: { base: '#e2452f', medio: '#b8321f', borde: '#6e1a10', raya: '#ffd23f', rayaS: '#d9a514', techo: '#ffd23f' } },
  { id: 'beaver', nombre: 'BoomBeaver', lema: 'Si no hay camino, lo abre.', velocidad: 1.02, agarre: 1, aceleracion: 0.98,
    colores: { base: '#8a5a2b', medio: '#6c4420', borde: '#3a230e', raya: '#f2f5ff', rayaS: '#c9d2ee', techo: '#e2452f' } },
  { id: 'fox', nombre: 'SlyFox', lema: 'Nadie le ve adelantar.', velocidad: 1.04, agarre: 1.02, aceleracion: 0.94,
    colores: { base: '#ff7a1a', medio: '#d65f0c', borde: '#7a3306', raya: '#f2f5ff', rayaS: '#c9d2ee', techo: '#26262e' } },
  { id: 'meercat', nombre: 'MeerCat', lema: 'Lleva botiquín. Por si acaso.', velocidad: 0.96, agarre: 1.08, aceleracion: 0.96,
    colores: { base: '#f2f5ff', medio: '#c9d2ee', borde: '#5a6684', raya: '#ff4f86', rayaS: '#c42f62', techo: '#ff4f86' } },
  { id: 'mechavaca', nombre: 'MechaVaca', lema: 'Rosa, blindada y sin frenos.', velocidad: 1.08, agarre: 0.96, aceleracion: 0.96,
    colores: { base: '#ff6fb1', medio: '#e04d93', borde: '#7c1f4e', raya: '#f2f5ff', rayaS: '#c9d2ee', techo: '#26262e' } },
]);
// los de Microblizz: coches de empresa, todos iguales salvo el color del departamento
RA.RIVALES = RA.congela([
  { id: 'rrhh', nombre: 'Lola (RR. HH.)', colores: { base: '#2f8fd8', medio: '#1c6fb8', borde: '#0c315a', raya: '#f2f5ff', rayaS: '#c9d2ee', techo: '#f2f5ff' } },
  { id: 'conta', nombre: 'Contabilidad', colores: { base: '#4fae3c', medio: '#2f7d32', borde: '#163d18', raya: '#f2f5ff', rayaS: '#c9d2ee', techo: '#ffd23f' } },
  { id: 'marketing', nombre: 'Marketing', colores: { base: '#ffd23f', medio: '#d9a514', borde: '#6a4c06', raya: '#2f8fd8', rayaS: '#1c5fa8', techo: '#2f8fd8' } },
  { id: 'legal', nombre: 'Asesoría Legal', colores: { base: '#0f2a5c', medio: '#0a1d42', borde: '#040b1c', raya: '#ffd23f', rayaS: '#d9a514', techo: '#ffd23f' } },
  { id: 'ceo', nombre: 'El CEO', colores: { base: '#f2f5ff', medio: '#c9d2ee', borde: '#5a6684', raya: '#2f8fd8', rayaS: '#1c5fa8', techo: '#0f2a5c' } },
]);
