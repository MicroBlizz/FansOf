// Fans of Karts (prototipo) · LOS MODELOS DE LOS PILOTOS: cada uno con su kart, montados con las piezas de modelos.js y con los
// colores de sus dibujos en Fans of Rumble (core/js/serie/arte). El kart mira hacia +y; las medidas van en unidades de pista
// (un kart mide unas 10 de ancho). Los seis líderes son jugables; SurvivalBot y el CEO de Microblizz solo los lleva la máquina.
'use strict';

const ESF = (c, r, m, x = {}) => ({ t: 'esf', c, r, m, ...x });
const BLOQUE = (c, r, m, x = {}) => ({ t: 'caja', c, r, m, ...x });
const CONO = (c, r, m, x = {}) => ({ t: 'cono', c, r, m, ...x });
const EJE_X = [0, 0, 90], EJE_Y = [0, 90, 0];   // giros que tumban un cono para que su eje vaya de lado o a lo largo

// el kart de todos: ruedas, chasis, morro, motor y asiento. o = { morro: 'redondo' | 'plano' | 'punta', escape: true }
function kartBase(o = {}) {
  const p = [];
  for (const [x, y, r, a] of [[-3.95, -3.5, 1.75, 0.95], [3.95, -3.5, 1.75, 0.95], [-3.75, 4.1, 1.5, 0.85], [3.75, 4.1, 1.5, 0.85]]) {
    p.push(CONO([x, y, r], [r, r, a], 'rueda', { g: EJE_X, parte: 1 }));
    p.push(CONO([x + Math.sign(x) * a, y, r], [r * 0.5, r * 0.42, 0.14], 'llanta', { g: EJE_X, parte: 1 }));
  }
  p.push(BLOQUE([0, 0.2, 2.0], [2.5, 4.9, 0.85], 'kart', { parte: 2 }));
  p.push(ESF([-2.5, -0.4, 2.1], [1.25, 3.3, 0.95], 'kart', { parte: 2 }), ESF([2.5, -0.4, 2.1], [1.25, 3.3, 0.95], 'kart', { parte: 2 }));
  if (o.morro === 'plano') p.push(BLOQUE([0, 5.3, 2.1], [2.3, 0.9, 0.95], 'kart', { parte: 2 }));
  else if (o.morro === 'punta') p.push(CONO([0, 5.9, 2.1], [1.9, 0.5, 1.5], 'kart', { g: [0, -90, 0], parte: 2 }));
  else p.push(ESF([0, 5.0, 2.15], [2.2, 2.3, 1.05], 'kart', { parte: 2 }));
  p.push(BLOQUE([0, 2.6, 2.95], [1.7, 1.5, 0.25], 'raya', { parte: 2 }));                     // la franja del capó
  p.push(BLOQUE([0, 6.5, 1.5], [3.0, 0.4, 0.5], 'raya', { parte: 3 }));                       // parachoques de delante
  p.push(BLOQUE([0, -5.3, 1.6], [3.1, 0.4, 0.55], 'raya', { parte: 3 }));                     // y de detrás
  p.push(BLOQUE([0, -4.3, 3.0], [2.1, 1.0, 1.05], 'motor', { parte: 4 }));
  if (o.escape !== false) for (const x of [-1.2, 1.2]) p.push(CONO([x, -5.7, 3.3], [0.5, 0.62, 0.8], 'tubo', { g: EJE_Y, parte: 4 }));
  p.push(BLOQUE([0, -2.75, 4.0], [1.9, 0.45, 1.7], 'asiento', { parte: 5 }));
  p.push(CONO([0, 2.15, 3.75], [0.95, 0.95, 0.16], 'rueda', { g: [0, 62, 0], parte: 6 }));  // el volante
  return p;
}
// el cuerpo del piloto: tronco, brazos hacia el volante y manos
function cuerpo(m, mano, o = {}) {
  const a = o.ancho || 1;
  return [
    ESF([0, -1.15, 4.9], [2.05 * a, 1.65, 2.3], m, { parte: 10 }),
    ESF([-2.0 * a, 0.3, 4.9], [0.85, 1.9, 0.85], o.brazo || m, { g: [-14, 14, 0], parte: 11 }), ESF([2.0 * a, 0.3, 4.9], [0.85, 1.9, 0.85], o.brazo || m, { g: [14, 14, 0], parte: 11 }),
    ESF([-1.25, 2.0, 4.25], [0.7, 0.7, 0.7], mano, { parte: 11 }), ESF([1.25, 2.0, 4.25], [0.7, 0.7, 0.7], mano, { parte: 11 }),
  ];
}
const RUEDAS = { rueda: { c: '#3a3446', s: '#1c1028', l: '#5b556b' }, llanta: '#c3cbe0', tubo: { c: '#9aa5ba', brillo: true }, motor: { c: '#4a4e66', brillo: true } };

const MODELOS = {
  // ---------- CrazyBunny (Animales Locos): conejo blanco con corona, capa naranja y el kart-zanahoria ----------
  bunny: () => ({
    mats: { ...RUEDAS, kart: '#ff8a1f', raya: '#ffcb3d', asiento: '#8b5530', pelo: { c: '#f7f3ff', s: '#b9aee0', l: '#ffffff' }, rosa: '#ffb3cf', capa: '#ff7a1a', oro: { c: '#ffcb3d', brillo: true }, hoja: '#5cc23a', ojo: { c: '#ffffff', plano: true }, espiral: { c: '#8a2bff', plano: true }, negro: { c: '#1c1028', plano: true }, boca: { c: '#5a1530', plano: true }, nariz: { c: '#ff7aa8', plano: true }, joya: { c: '#ff4b5c', plano: true } },
    piezas: [
      ...kartBase({ morro: 'punta', escape: false }),
      // las hojas de la zanahoria, en la parte de atrás
      ESF([-1.1, -5.6, 4.6], [0.6, 0.6, 1.5], 'hoja', { g: [0, -28, -14], parte: 7 }), ESF([1.1, -5.6, 4.6], [0.6, 0.6, 1.5], 'hoja', { g: [0, -28, 14], parte: 7 }), ESF([0, -5.9, 4.9], [0.6, 0.6, 1.7], 'hoja', { g: [0, -36, 0], parte: 7 }),
      ...cuerpo('pelo', 'pelo'),
      BLOQUE([0, -2.3, 5.0], [2.3, 0.3, 2.3], 'capa', { g: [0, -12, 0], parte: 12 }), ESF([0, -1.2, 6.5], [2.3, 1.95, 0.75], 'capa', { parte: 12 }),
      ESF([0, -0.85, 8.6], [2.95, 2.8, 2.7], 'pelo', { parte: 20, liso: true }),
      ESF([-1.9, 0.6, 7.6], [1.0, 0.9, 0.8], 'pelo', { parte: 20, liso: true }), ESF([1.9, 0.6, 7.6], [1.0, 0.9, 0.8], 'pelo', { parte: 20, liso: true }),   // mofletes
      // orejas: la izquierda tiesa y la derecha doblada
      ESF([-1.35, -1.1, 12.6], [0.85, 0.6, 2.7], 'pelo', { g: [0, 0, -7], parte: 21 }), ESF([-1.35, -0.62, 12.6], [0.42, 0.3, 2.0], 'rosa', { g: [0, 0, -7], parte: 21 }),
      ESF([1.3, -1.1, 11.9], [0.85, 0.6, 1.9], 'pelo', { g: [0, 0, 10], parte: 22 }), ESF([2.55, -1.1, 13.5], [0.8, 0.58, 1.6], 'pelo', { g: [0, 0, 68], parte: 22 }),
      ESF([1.3, -0.62, 11.9], [0.4, 0.3, 1.4], 'rosa', { g: [0, 0, 10], parte: 22 }),
      // corona
      CONO([-0.1, -0.9, 11.25], [1.25, 1.4, 0.42], 'oro', { parte: 23 }),
      ...[[-1.0, -0.9], [0.0, -0.1], [0.9, -0.9], [0.0, -1.8]].map(([x, y]) => CONO([x - 0.1, y, 12.0], [0.42, 0.05, 0.42], 'oro', { parte: 23 })),
      ESF([-0.1, 0.45, 11.25], [0.32, 0.25, 0.3], 'joya', { parte: 23 }),
      // cara: el ojo en espiral, el otro, la nariz y los dientes
      ESF([-1.25, 1.55, 9.0], [0.95, 0.5, 1.0], 'ojo', { parte: 20 }), ESF([-1.25, 1.95, 9.0], [0.55, 0.25, 0.58], 'espiral', { parte: 20 }), ESF([-1.25, 2.12, 9.0], [0.24, 0.15, 0.25], 'ojo', { parte: 20 }),
      ESF([1.3, 1.5, 9.1], [1.0, 0.5, 1.1], 'ojo', { parte: 20 }), ESF([1.45, 1.92, 9.15], [0.36, 0.2, 0.4], 'negro', { parte: 20 }),
      ESF([0, 2.05, 8.05], [0.36, 0.25, 0.26], 'nariz', { parte: 20 }),
      ESF([0, 1.75, 7.25], [1.25, 0.5, 0.52], 'boca', { parte: 20 }), BLOQUE([0, 2.18, 7.4], [0.5, 0.12, 0.34], 'ojo', { parte: 20 }),
    ],
  }),
  // ---------- StreamKing (Streamers): corona, cascos con luces, sudadera morada y capa rosa ----------
  twitchking: () => ({
    mats: { ...RUEDAS, kart: '#8b5cf6', raya: '#f472b6', asiento: '#2b2d3a', sudadera: '#8b5cf6', capa: '#e11d74', piel: { c: '#f1c27d', s: '#c98a52', l: '#ffe0b0' }, pelo: '#5b3a26', cascos: '#2b2d3a', luz: { c: '#22e3ff', plano: true }, oro: { c: '#ffcb3d', brillo: true }, rojo: { c: '#ff3348', plano: true }, negro: { c: '#1c1028', plano: true }, blanco: { c: '#ffffff', plano: true }, movil: '#a855f7' },
    piezas: [
      ...kartBase({ morro: 'redondo' }),
      // el palo selfi con el móvil, a un lado
      CONO([3.3, -3.6, 6.2], [0.16, 0.16, 3.2], 'oro', { g: [0, 0, 6], parte: 7 }), BLOQUE([3.65, -3.6, 9.9], [0.95, 0.22, 0.65], 'movil', { parte: 7 }), ESF([3.65, -3.35, 9.9], [0.38, 0.12, 0.36], 'blanco', { parte: 7 }),
      BLOQUE([0, -5.75, 2.9], [0.9, 0.12, 0.45], 'rojo', { parte: 4 }),   // el piloto rojo de EN DIRECTO
      ...cuerpo('sudadera', 'piel'),
      BLOQUE([0, -2.3, 5.0], [2.3, 0.3, 2.3], 'capa', { g: [0, -12, 0], parte: 12 }), ESF([0, -1.2, 6.5], [2.3, 1.95, 0.75], 'capa', { parte: 12 }),
      BLOQUE([0, 0.5, 5.3], [0.95, 0.2, 0.45], 'rojo', { parte: 10 }),
      ESF([0, -0.85, 8.6], [2.8, 2.7, 2.65], 'piel', { parte: 20, liso: true }),
      ESF([0, -1.25, 9.25], [2.95, 2.8, 2.35], 'pelo', { parte: 20 }), ESF([0.5, 0.9, 10.4], [1.9, 1.3, 0.95], 'pelo', { g: [0, 0, -8], parte: 20 }),   // el pelo y el flequillo
      // cascos: el arco y las dos orejeras con su luz
      ...[-72, -48, -24, 0, 24, 48, 72].map(a => ESF([Math.sin(a * RAD) * 3.05, -1.0, 8.75 + Math.cos(a * RAD) * 2.95], [0.52, 0.6, 0.52], 'cascos', { parte: 24 })),
      ESF([-3.05, -0.95, 8.5], [0.75, 1.15, 1.35], 'cascos', { parte: 24 }), ESF([3.05, -0.95, 8.5], [0.75, 1.15, 1.35], 'cascos', { parte: 24 }),
      ESF([-3.7, -0.95, 8.5], [0.25, 0.45, 0.5], 'luz', { parte: 24 }), ESF([3.7, -0.95, 8.5], [0.25, 0.45, 0.5], 'luz', { parte: 24 }),
      CONO([2.2, 0.9, 7.35], [0.16, 0.16, 1.1], 'cascos', { g: [58, 90, 0], parte: 24 }), ESF([1.3, 1.9, 7.3], [0.38, 0.38, 0.38], 'negro', { parte: 24 }),   // el micro
      // corona
      CONO([0, -1.0, 11.75], [1.45, 1.6, 0.42], 'oro', { parte: 23 }),
      ...[[-1.2, -1.0], [0, -0.1], [1.2, -1.0], [0, -1.9]].map(([x, y]) => CONO([x, y, 12.55], [0.45, 0.05, 0.45], 'oro', { parte: 23 })),
      ESF([0, 0.55, 11.75], [0.32, 0.25, 0.3], 'rojo', { parte: 23 }),
      // cara: un ojo guiñado, el otro abierto y la sonrisa
      BLOQUE([-1.15, 1.72, 8.75], [0.62, 0.12, 0.16], 'negro', { parte: 20 }), ESF([1.2, 1.7, 8.8], [0.42, 0.25, 0.5], 'negro', { parte: 20 }),
      ESF([0.1, 1.72, 7.55], [1.05, 0.4, 0.42], 'blanco', { parte: 20 }),
    ],
  }),
  // ---------- EpicChampion (Héroes): armadura dorada, casco con penacho rojo, capa azul y escudo a la espalda ----------
  epicchampion: () => ({
    mats: { ...RUEDAS, kart: '#f5f3ee', raya: '#ffcb3d', asiento: '#7c2d12', armadura: { c: '#facc15', s: '#b4790a', l: '#fff3a0', brillo: true }, capa: '#2563eb', piel: { c: '#f1c27d', s: '#c98a52', l: '#ffe0b0' }, penacho: '#ef4444', oro: { c: '#eab308', brillo: true }, azul: '#2563eb', negro: { c: '#1c1028', plano: true }, blanco: { c: '#fff7d6', plano: true } },
    piezas: [
      ...kartBase({ morro: 'plano' }),
      BLOQUE([0, 5.9, 2.9], [1.9, 0.5, 0.5], 'raya', { parte: 2 }),
      ...cuerpo('armadura', 'piel', { ancho: 1.08 }),
      ESF([-2.5, -0.9, 6.3], [1.2, 1.3, 0.85], 'oro', { parte: 13 }), ESF([2.5, -0.9, 6.3], [1.2, 1.3, 0.85], 'oro', { parte: 13 }),   // hombreras
      BLOQUE([0, -2.5, 4.9], [2.4, 0.3, 2.4], 'capa', { g: [0, -12, 0], parte: 12 }),
      // el escudo redondo con su estrella, colgado detrás
      CONO([0, -3.45, 5.3], [2.0, 2.0, 0.22], 'azul', { g: [0, 78, 0], parte: 14 }), CONO([0, -3.72, 5.25], [1.3, 1.3, 0.14], 'armadura', { g: [0, 78, 0], parte: 14 }), ESF([0, -3.9, 5.22], [0.5, 0.2, 0.5], 'blanco', { parte: 14 }),
      ESF([0, -0.85, 8.5], [2.7, 2.65, 2.6], 'piel', { parte: 20, liso: true }),
      // casco: la cúpula, la visera abierta y el penacho
      ESF([0, -1.15, 9.3], [2.95, 2.9, 2.35], 'armadura', { parte: 25 }), BLOQUE([0, -1.0, 8.45], [3.0, 2.0, 0.3], 'oro', { parte: 25 }),
      ESF([-2.6, -0.2, 8.0], [0.55, 1.2, 1.3], 'armadura', { parte: 25 }), ESF([2.6, -0.2, 8.0], [0.55, 1.2, 1.3], 'armadura', { parte: 25 }),
      ...[[1.2, 11.5, 0.75], [0.3, 12.35, 0.95], [-0.9, 12.7, 1.0], [-2.1, 12.4, 0.95], [-3.0, 11.6, 0.8], [-3.5, 10.6, 0.65]].map(([y, z, r]) => ESF([0, y, z], [0.62, r, r], 'penacho', { parte: 26 })),
      // cara
      ESF([-1.1, 1.62, 8.5], [0.4, 0.25, 0.48], 'negro', { parte: 20 }), ESF([1.1, 1.62, 8.5], [0.4, 0.25, 0.48], 'negro', { parte: 20 }),
      ESF([0, 1.72, 7.35], [0.85, 0.3, 0.28], 'negro', { parte: 20 }),
    ],
  }),
  // ---------- CyberMarine (Ciberpunks): armadura gris, visor cian, antena con luz y mochila ----------
  cybermarine: () => ({
    mats: { ...RUEDAS, kart: '#374151', raya: '#22e3ff', asiento: '#1f2937', armadura: { c: '#5b6678', s: '#2a3140', l: '#9aa5ba', brillo: true }, hombrera: '#0e7490', visor: { c: '#22e3ff', plano: true }, neon: { c: '#ff3df0', plano: true }, oscuro: '#1f2937', blanco: { c: '#e8fbff', plano: true } },
    piezas: [
      ...kartBase({ morro: 'plano' }),
      BLOQUE([-2.62, -0.4, 2.75], [0.3, 2.6, 0.14], 'neon', { parte: 2 }), BLOQUE([2.62, -0.4, 2.75], [0.3, 2.6, 0.14], 'raya', { parte: 2 }),
      ...cuerpo('armadura', 'oscuro', { ancho: 1.1 }),
      ESF([-2.6, -0.9, 6.25], [1.35, 1.4, 0.9], 'hombrera', { parte: 13 }), ESF([2.6, -0.9, 6.25], [1.35, 1.4, 0.9], 'hombrera', { parte: 13 }),
      // la mochila con sus dos luces
      BLOQUE([0, -3.0, 5.6], [1.75, 0.9, 1.9], 'oscuro', { parte: 14 }), ESF([-0.8, -3.95, 6.4], [0.35, 0.15, 0.35], 'neon', { parte: 14 }), ESF([0.8, -3.95, 6.4], [0.35, 0.15, 0.35], 'visor', { parte: 14 }),
      BLOQUE([0, -3.95, 5.0], [1.1, 0.1, 0.16], 'visor', { parte: 14 }),
      // el casco, cuadrado y con el visor por delante
      ESF([0, -0.9, 8.65], [2.95, 2.9, 2.8], 'armadura', { parte: 25 }), BLOQUE([0, -0.9, 8.6], [2.5, 2.5, 2.3], 'armadura', { parte: 25 }),
      BLOQUE([0.35, 1.45, 9.0], [1.9, 0.3, 0.75], 'visor', { parte: 25 }), BLOQUE([0.9, 1.78, 9.25], [0.9, 0.06, 0.12], 'blanco', { parte: 25 }),
      BLOQUE([0, 1.5, 7.3], [1.3, 0.25, 0.45], 'oscuro', { parte: 25 }),
      CONO([-1.6, -1.5, 12.3], [0.14, 0.14, 1.3], 'oscuro', { g: [0, 0, -12], parte: 27 }), ESF([-1.88, -1.5, 13.7], [0.5, 0.5, 0.5], 'neon', { parte: 27 }),
    ],
  }),
  // ---------- MemeLord (Memes): chistera con cinta dorada, gafas de píxeles, traje morado y capa verde ----------
  memelord: () => ({
    mats: { ...RUEDAS, kart: '#ffe14d', raya: '#7c3aed', asiento: '#27272a', traje: '#7c3aed', capa: '#16a34a', piel: { c: '#f1c27d', s: '#c98a52', l: '#ffe0b0' }, chistera: { c: '#34343c', s: '#16161c', l: '#5a5a66' }, oro: { c: '#ffcb3d', brillo: true }, negro: { c: '#1c1028', plano: true }, blanco: { c: '#ffffff', plano: true }, carta: { c: '#22c55e', plano: true } },
    piezas: [
      ...kartBase({ morro: 'redondo' }),
      // la carta del «?» en un palo, detrás
      CONO([-3.2, -3.8, 5.9], [0.16, 0.16, 2.6], 'chistera', { parte: 7 }), BLOQUE([-3.2, -3.8, 9.6], [1.05, 0.2, 1.4], 'blanco', { parte: 7 }), BLOQUE([-3.2, -3.5, 9.6], [0.75, 0.1, 1.1], 'carta', { parte: 7 }), BLOQUE([-3.2, -4.1, 9.6], [0.75, 0.1, 1.1], 'carta', { parte: 7 }),
      ...cuerpo('traje', 'piel'),
      BLOQUE([0, -2.3, 5.0], [2.3, 0.3, 2.3], 'capa', { g: [0, -12, 0], parte: 12 }), ESF([0, -1.2, 6.5], [2.3, 1.95, 0.7], 'capa', { parte: 12 }),
      ...[4.3, 5.3].map(z => ESF([0, 0.5, z], [0.3, 0.2, 0.3], 'oro', { parte: 10 })),
      ESF([0, -0.85, 8.5], [2.75, 2.7, 2.6], 'piel', { parte: 20, liso: true }),
      // chistera: el ala, la copa y la cinta
      CONO([0, -0.95, 10.6], [3.7, 3.7, 0.22], 'chistera', { parte: 28 }), CONO([0, -0.95, 12.35], [2.15, 2.4, 1.6], 'chistera', { parte: 28 }), CONO([0, -0.95, 11.2], [2.28, 2.3, 0.36], 'oro', { parte: 28 }),
      // gafas de píxeles
      BLOQUE([0, 1.75, 8.75], [2.45, 0.22, 0.2], 'negro', { parte: 20 }), BLOQUE([-1.2, 1.78, 8.35], [0.95, 0.24, 0.5], 'negro', { parte: 20 }), BLOQUE([1.2, 1.78, 8.35], [0.95, 0.24, 0.5], 'negro', { parte: 20 }),
      BLOQUE([-1.55, 2.05, 8.5], [0.22, 0.06, 0.16], 'blanco', { parte: 20 }), BLOQUE([0.85, 2.05, 8.5], [0.22, 0.06, 0.16], 'blanco', { parte: 20 }),
      BLOQUE([0.35, 1.75, 7.1], [0.85, 0.2, 0.14], 'negro', { parte: 20 }),
    ],
  }),
  // ---------- NecroLord (No-Muertos): calavera con corona oscura, túnica morada y el kart-ataúd ----------
  necrolord: () => ({
    mats: { ...RUEDAS, kart: '#3b2457', raya: '#5ef2d0', asiento: '#2a1840', tunica: '#3b2457', hueso: { c: '#efeadf', s: '#a79cc0', l: '#ffffff' }, acero: { c: '#5c6d8a', brillo: true }, pincho: '#8d9cc0', corona: { c: '#4a5677', brillo: true }, fuego: { c: '#5ef2d0', plano: true }, hueco: { c: '#1a1022', plano: true }, llanta: '#efeadf' },
    piezas: [
      ...kartBase({ morro: 'punta', escape: false }),
      // la tapa del ataúd sobre el capó y dos calaveritas de faros
      BLOQUE([0, 3.4, 2.95], [1.35, 2.3, 0.3], 'asiento', { parte: 2 }), BLOQUE([0, 3.4, 3.3], [0.2, 1.5, 0.1], 'hueso', { parte: 2 }), BLOQUE([0, 4.1, 3.3], [0.8, 0.2, 0.1], 'hueso', { parte: 2 }),
      ESF([-1.1, -5.6, 4.3], [0.5, 0.5, 0.75], 'fuego', { parte: 4 }), ESF([1.1, -5.6, 4.3], [0.5, 0.5, 0.75], 'fuego', { parte: 4 }),
      ...cuerpo('tunica', 'hueso'),
      ESF([-2.5, -0.9, 6.25], [1.25, 1.3, 0.85], 'acero', { parte: 13 }), ESF([2.5, -0.9, 6.25], [1.25, 1.3, 0.85], 'acero', { parte: 13 }),
      CONO([-3.1, -0.9, 7.3], [0.5, 0.05, 0.75], 'pincho', { g: [0, 0, -28], parte: 13 }), CONO([3.1, -0.9, 7.3], [0.5, 0.05, 0.75], 'pincho', { g: [0, 0, 28], parte: 13 }),
      BLOQUE([0, -2.3, 4.9], [2.2, 0.3, 2.3], 'tunica', { g: [0, -12, 0], parte: 12 }),
      // la calavera: cráneo, mandíbula, cuencas con luz y la nariz
      ESF([0, -0.9, 8.9], [2.85, 2.85, 2.6], 'hueso', { parte: 20, liso: true }), BLOQUE([0, 0.15, 7.0], [1.55, 1.35, 0.75], 'hueso', { parte: 20, liso: true }),
      ESF([-1.15, 1.55, 8.8], [0.85, 0.45, 0.9], 'hueco', { parte: 20 }), ESF([1.15, 1.55, 8.8], [0.85, 0.45, 0.9], 'hueco', { parte: 20 }),
      ESF([-1.15, 1.85, 8.8], [0.38, 0.2, 0.4], 'fuego', { parte: 20 }), ESF([1.15, 1.85, 8.8], [0.38, 0.2, 0.4], 'fuego', { parte: 20 }),
      ESF([0, 1.85, 7.85], [0.3, 0.2, 0.36], 'hueco', { parte: 20 }),
      ...[-0.75, 0, 0.75].map(x => BLOQUE([x, 1.52, 6.85], [0.09, 0.06, 0.5], 'hueco', { parte: 20 })),
      // la corona de puntas
      CONO([0, -1.0, 11.0], [2.3, 2.5, 0.5], 'corona', { parte: 23 }),
      ...[0, 60, 120, 180, 240, 300].map(a => CONO([Math.sin(a * RAD) * 2.1, -1.0 + Math.cos(a * RAD) * 2.1, 12.2], [0.55, 0.05, 0.85], 'corona', { parte: 23 })),
      ESF([0, 1.4, 11.0], [0.36, 0.25, 0.36], 'fuego', { parte: 23 }),
    ],
  }),
  // ---------- SurvivalBot (Microblizz): la cabezota de robot con un ojo rojo y el otro tapado con un parche ----------
  survivalbot: () => ({
    mats: { ...RUEDAS, kart: '#3a7de0', raya: '#e8f1ff', asiento: '#16306b', metal: { c: '#9aa5ba', s: '#5a6378', l: '#dfe6f2', brillo: true }, gris: '#7d889e', oscuro: '#5a6378', ojo: { c: '#ff3348', plano: true }, cuenca: { c: '#2a0d14', plano: true }, parche: { c: '#f1e3c6', plano: true }, cinta: { c: '#b89a6e', plano: true }, negro: { c: '#1c1028', plano: true }, blanco: { c: '#ffd0d4', plano: true } },
    piezas: [
      ...kartBase({ morro: 'plano' }),
      ...cuerpo('gris', 'oscuro', { ancho: 1.05 }),
      BLOQUE([0, -1.0, 6.9], [1.1, 1.0, 0.5], 'oscuro', { parte: 10 }),   // el cuello
      BLOQUE([0, -0.9, 9.5], [3.3, 2.55, 2.35], 'metal', { parte: 25 }), ESF([0, -0.9, 9.5], [3.55, 2.8, 2.6], 'metal', { parte: 25 }),
      ESF([-1.4, 1.75, 9.8], [1.15, 0.4, 1.15], 'cuenca', { parte: 25 }), ESF([-1.4, 2.0, 9.8], [0.68, 0.25, 0.68], 'ojo', { parte: 25 }), ESF([-1.6, 2.2, 10.0], [0.22, 0.1, 0.22], 'blanco', { parte: 25 }),
      BLOQUE([1.45, 1.8, 9.85], [1.05, 0.14, 0.85], 'parche', { parte: 25 }), BLOQUE([1.45, 1.95, 9.85], [0.85, 0.05, 0.1], 'cinta', { g: [0, 0, 40], parte: 25 }), BLOQUE([1.45, 1.95, 9.85], [0.85, 0.05, 0.1], 'cinta', { g: [0, 0, -40], parte: 25 }),
      BLOQUE([0, 1.78, 8.0], [1.75, 0.14, 0.38], 'oscuro', { parte: 25 }), ...[-1.05, -0.35, 0.35, 1.05].map(x => BLOQUE([x, 1.94, 8.0], [0.07, 0.05, 0.3], 'negro', { parte: 25 })),
      CONO([-1.9, -0.9, 12.7], [0.14, 0.14, 0.95], 'oscuro', { g: [0, 0, -12], parte: 27 }), ESF([-2.1, -0.9, 13.8], [0.55, 0.55, 0.55], 'ojo', { parte: 27 }),
      CONO([1.9, -0.9, 12.5], [0.14, 0.14, 0.75], 'oscuro', { g: [0, 0, 12], parte: 27 }), ESF([2.05, -0.9, 13.35], [0.42, 0.42, 0.42], 'raya', { parte: 27 }),
    ],
  }),
  // ---------- el CEO de Microblizz: traje gris, corbata roja, gafas de sol, y el maletín del dinero en un kart negro y dorado ----------
  ceo: () => ({
    mats: { ...RUEDAS, kart: '#22212c', raya: '#ffcb3d', asiento: '#7a4d1c', llanta: '#ffcb3d', traje: '#5b6170', piel: { c: '#f2c7a5', s: '#c08a66', l: '#ffe6d0' }, pelo: '#3b2a1a', camisa: '#fff6ea', corbata: { c: '#e63946', plano: true }, gafas: { c: '#111827', plano: true }, maletin: '#7a4d1c', dinero: { c: '#9ef07a', plano: true }, oro: { c: '#ffcb3d', brillo: true }, negro: { c: '#1c1028', plano: true } },
    piezas: [
      ...kartBase({ morro: 'plano' }),
      BLOQUE([0, 6.0, 3.2], [0.3, 0.3, 0.55], 'oro', { parte: 2 }), ESF([0, 6.0, 4.0], [0.5, 0.5, 0.5], 'oro', { parte: 2 }),   // la figurita del capó
      // el maletín con el símbolo del dinero, atado detrás
      BLOQUE([0, -4.5, 4.9], [2.0, 0.75, 1.3], 'maletin', { parte: 14 }), BLOQUE([0, -5.3, 4.9], [0.55, 0.08, 0.7], 'dinero', { parte: 14 }), BLOQUE([0, -4.5, 6.35], [0.7, 0.2, 0.18], 'negro', { parte: 14 }),
      ...cuerpo('traje', 'piel', { ancho: 1.06 }),
      BLOQUE([0, 0.38, 5.6], [0.75, 0.2, 1.0], 'camisa', { parte: 10 }), BLOQUE([0, 0.56, 5.4], [0.3, 0.1, 0.95], 'corbata', { parte: 10 }),
      ESF([0, -0.85, 8.5], [2.75, 2.7, 2.6], 'piel', { parte: 20, liso: true }),
      ESF([0, -1.25, 9.25], [2.9, 2.75, 2.2], 'pelo', { parte: 20 }), ESF([-0.6, 0.7, 10.5], [1.9, 1.3, 0.75], 'pelo', { g: [0, 0, 8], parte: 20 }),
      BLOQUE([-1.2, 1.72, 8.7], [0.95, 0.2, 0.55], 'gafas', { parte: 20 }), BLOQUE([1.2, 1.72, 8.7], [0.95, 0.2, 0.55], 'gafas', { parte: 20 }), BLOQUE([0, 1.72, 8.85], [2.6, 0.16, 0.13], 'gafas', { parte: 20 }),
      BLOQUE([0, 1.75, 7.2], [0.7, 0.14, 0.12], 'negro', { g: [0, 0, 8], parte: 20 }),
    ],
  }),
};
// de cada piloto, la zona que ocupa su foto (media anchura, alto y lo que baja del suelo, en unidades)
const CAJA_KART = { medio: 8.1, alto: 16.2, bajo: 3.4, angs: 32, incl: 20 };
const BASE_KART = 10 / 3;   // píxeles por unidad del kart del jugador (el tamaño mayor)
const FIGURAS = {};
function figuraDe(id) {
  if (!FIGURAS[id]) { const m = MODELOS[id](); FIGURAS[id] = new Figura({ ...CAJA_KART, piezas: m.piezas, mats: m.mats }); }
  return FIGURAS[id];
}
