// Fans of Rumble · Progresión (1/5): las habilidades y los objetos de este juego, sus rarezas y el cofre
'use strict';
/* =========================================================
   PROGRESIÓN Y ECONOMÍA (v0.9): niveles, oro, gemas, gashapón, campaña
   ========================================================= */
const CARD_RAR = { rare: RARITY.rare, epic: RARITY.epic, legendary: RARITY.legendary };   // colores de las cartas del gashapón (v0.9.62: los de siempre)
// QUÉ HACE CADA HABILIDAD Y CADA OBJETO EN ESTE JUEGO (sus nombres, rarezas e iconos son de la serie: core/js/serie/catalogo.js).
// Habilidades: una por carta, de cualquier facción. vals: [flojo, valor central, fuerte]; desc: el texto, con {v} donde va el número.
const ABILITIES = catalogo('ab', {
  cafeina:  { desc: 'Se mueve un {v} % más rápido.', vals: [15, 22, 30] },
  piel:     { desc: '+{v} % de vida.', vals: [15, 22, 30] },
  punos:    { desc: '+{v} % de daño.', vals: [12, 18, 24] },
  reflejos: { desc: 'Ataca un {v} % más rápido.', vals: [12, 18, 24] },
  plasma:   { desc: 'Escudo del {v} % de su vida que se recarga.', vals: [20, 25, 30] },
  sigilo:   { desc: 'Sale invisible {v} s y su primer golpe hace el doble.', vals: [5, 7, 9] },
  escarcha: { desc: 'Sus golpes frenan al enemigo {v} s.', vals: [1, 1.3, 1.6] },
  vampiro:  { desc: 'Se cura el {v} % del daño que hace.', vals: [15, 20, 25] },
  cadena:   { desc: 'Cada golpe salta a otro enemigo con el {v} % del daño.', vals: [50, 60, 70] },
  provoca:  { desc: 'Los enemigos cercanos (a {v}) le atacan a él.', vals: [80, 95, 110], dec: 0 },
  renacer:  { desc: 'Revive una vez con el {v} % de su vida.', vals: [40, 50, 60] },
  grito:    { desc: 'Cada 9 s aturde {v} s a los enemigos cercanos.', vals: [0.8, 1, 1.2] },
  clon:     { desc: 'Al morir se divide en 2 copias pequeñas con el {v} % de su vida. No funciona en los líderes. Si la carta saca varias unidades, las copias son más pequeñas.', vals: [30, 40, 50] },
  furia:    { desc: 'Con menos de la mitad de vida: +{v} % de daño y velocidad.', vals: [30, 40, 50] },
  // v0.9.12: habilidades con efectos nuevos
  speedrun:   { desc: 'Los primeros {v} s va al triple de velocidad.', vals: [2, 3, 4] },
  hitbox:     { desc: 'Esquiva el {v} % de los golpes. Nadie sabe cómo.', vals: [10, 15, 20] },
  microtrans: { desc: 'Al entrar en el campo le roba {v} de CAOS al rival. Si la carta saca varias unidades, se lo reparten.', vals: [0.5, 0.8, 1.1] },
  ragequit:   { desc: 'Al caer se enfada y explota: {v} de daño alrededor. Si la carta saca varias unidades, se lo reparten.', vals: [60, 90, 120] },
  modofoto:   { desc: 'Al entrar congela {v} s a los enemigos de alrededor. ¡Sonreíd!', vals: [0.8, 1.2, 1.6] },
  dlc:        { desc: 'Al caer te devuelve {v} de CAOS. Si la carta saca varias unidades, se lo reparten.', vals: [1, 1.5, 2] },
  gigante:    { desc: 'Se hace enorme: +{v} % de vida y de daño, pero va más lento.', vals: [15, 20, 25] },
  iman:       { desc: 'Cada enemigo que derrota te da {v} de CAOS.', vals: [0.3, 0.45, 0.6] },
});
// gashapón de equipamiento: solo para el líder (arma, cabeza y accesorio)
const FAC_ITEM = { animales: 'zanahoria_oro', nomuertos: 'corona_huesos', streamers: 'microfono_oro', heroes: 'yelmo_olimpo', ciber: 'nucleo_plasma', memes: 'gafas_pixel', gamer: 'raton_campeon', olvidados: 'cartucho_dorado', pop: 'claqueta_oro' };   // v0.9.15
const worldFac = wi => (wi === 0 ? 'animales' : WORLDS[wi].unlock || null);   // de qué facción es el objeto que da el jefe de cada mundo en Difícil
const ITEMS = catalogo('eq', {   // st: valor central de cada efecto; cada copia sale entre el 50 % y el 150 % de ese valor
  espada_carton: { st: [10], desc: '+{0} % de daño. Hecha a mano en una convención.' },
  raton_dpi:     { st: [20, 10], desc: '+{0} % de alcance y +{1} % de daño.' },
  teclado_rgb:   { st: [25], desc: 'Ataca un {0} % más rápido. Clic, clic, clic.' },
  banhammer_oro: { st: [25], desc: '+{0} % de daño y cada golpe aparta al enemigo.' },
  cuernos:       { st: [15], desc: '+{0} % de vida.' },
  corona_carton: { st: [10, 10], desc: '+{0} % de vida y +{1} % de daño.' },
  gorro_aluminio:{ st: [10], desc: 'Inmune a las habilidades del jefe y +{0} % de vida.' },
  auriculares:   { st: [15], desc: 'Inmune a aturdimientos y frenazos, y +{0} % de vida.' },
  taza:          { st: [1], desc: 'Se cura un {0} % de su vida cada segundo.' },
  pase_caducado: { st: [3], desc: '+{0} % a todo. Algo es algo.' },
  almohada:      { st: [40], desc: 'Si cae, vuelve un {0} % antes.' },
  silla_gamer:   { st: [15], desc: 'Recibe un {0} % menos de daño.' },
  cofre:         { st: [100], desc: 'Cada partida, un efecto sorpresa (o ninguno) con un {0} % de potencia.' },
  diploma:       { st: [8, 8], desc: '+{0} % de vida y +{1} % de daño. Enmarcado en plástico. Exclusivo del pase.' },
  corbata_ceo:   { st: [15, 15, 10], desc: '+{0} % de vida, +{1} % de daño y +{2} % de velocidad. Viste como el que te despide. Exclusivo del Pase Ejecutivo.' },
  // v0.9.12: objetos con efectos nuevos
  mando_cable:  { st: [25], desc: '+{0} % de alcance. El cable llega a todas partes.' },
  baguette:     { st: [20], desc: 'El {0} % de sus golpes son críticos y hacen el triple. Está durísima.' },
  lanzaconfeti: { st: [40], desc: 'Cada golpe salpica el {0} % del daño a los enemigos de alrededor.' },
  gorra_reves:  { st: [12], desc: '+{0} % de velocidad. Más estilo, más rápido.' },
  casco_vr:     { st: [25], desc: 'No ve el peligro: +{0} % de daño, pero un 10 % menos de vida.' },
  orejas_gato:  { st: [20], desc: 'Los enemigos de alrededor pegan un {0} % menos. Es que es muy mono.' },
  bebida_xxl:   { st: [30], desc: 'Los primeros 10 s: +{0} % de daño y de velocidad.' },
  disco_fisico: { st: [18], desc: '+{0} % de vida. Es suyo para siempre: nadie se lo puede quitar.' },
  alfombrilla:  { st: [2], desc: 'Los aliados de alrededor se curan un {0} % de su vida cada segundo.' },
  // v0.9.15: objetos de facción: más fuertes, pero solo los puede llevar el líder de su facción
  zanahoria_oro:   { st: [22, 30], desc: '+{0} % de daño y su Chaos Jump vuelve un {1} % antes.' },
  corona_huesos:   { st: [22, 1.5], desc: '+{0} % de vida y se cura un {1} % de su vida cada segundo.' },
  microfono_oro:   { st: [18, 1.5], desc: '+{0} % de daño y los aliados de alrededor se curan un {1} % cada segundo.' },
  yelmo_olimpo:    { st: [20, 14], desc: '+{0} % de vida y recibe un {1} % menos de daño.' },
  nucleo_plasma:   { st: [45, 15], desc: 'Escudo de plasma del {0} % de su vida y +{1} % de daño.' },
  gafas_pixel:     { st: [22, 15], desc: 'El {0} % de sus golpes son críticos (triple) y +{1} % de velocidad. Deal with it.' },
  raton_campeon:   { st: [28, 25], desc: 'Ataca un {0} % más rápido y +{1} % de alcance.' },
  cartucho_dorado: { st: [15, 2], desc: '+{0} % de vida y de daño, y las torres tardan {1} s más en acordarse de él.' },
  claqueta_oro:    { st: [18, 35], desc: '+{0} % de daño y cada golpe salpica el {1} % a los de alrededor.' },
  boton_pausa:  { st: [3], desc: 'Una vez por vida, cuando va a caer, se pausa y es invulnerable {0} s.' },
});
const COFRE = [[p => `¡+${Math.round(30 * p)} % DE DAÑO!`, (u, p) => { u.mDmg *= 1 + 0.3 * p; }], [p => `¡+${Math.round(40 * p)} % DE VIDA!`, (u, p) => { u.mHp *= 1 + 0.4 * p; }], [() => '¡TURBO!', (u, p) => { u.mSpeed *= 1 + 0.3 * p; u.mCd *= 1 - 0.2 * p; }], [() => '¡REGENERACIÓN!', (u, p) => { u.regen = (u.regen || 0) + 0.02 * p; }], [() => '…estaba vacío', () => {}]];
