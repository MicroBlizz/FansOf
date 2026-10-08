// Fans Of · La serie: QUÉ habilidades y objetos existen, con su nombre, su rareza y su icono. Son los mismos en todos los juegos.
// Lo que HACE cada uno, y cuánto, lo dice cada juego (el mismo objeto puede dar una cosa en un juego y otra en otro),
// y un juego solo reparte los que usa. ic: las dos letras del icono · fac: de qué facción es · pass: premio del pase de batalla
// (no sale en el gashapón ni se puede despedir o volver a sortear).
'use strict';
// Rarezas con los colores de siempre en los videojuegos (v0.9.62): Común gris, Poco común verde, Rara azul, Épica lila,
// Legendaria naranja y Mítica roja. [nombre, color claro, color oscuro]. OJO: la clave 'common' es «Poco común» (lo que antes
// se llamaba Común; así no cambian las partidas guardadas ni el servidor). 'basic' es la Común gris (desde v0.9.63). 'mythic' (Mítica)
// aún no tiene nada: se reserva para objetos de eventos y torneos. Las cartas de líder usan los colores de la Legendaria.
const RARITY = { basic: ['Común', '#c3c9d4', '#5f6673'], common: ['Poco común', '#7be04a', '#2f8a1c'], rare: ['Rara', '#5aaeff', '#1d5fc9'],
  epic: ['Épica', '#d08cff', '#6d28c9'], legendary: ['Legendaria', '#ffb547', '#d9620c'], mythic: ['Mítica', '#ff6464', '#b3121f'] };
const CATALOGO = {
  /* ---------- habilidades: una por carta ---------- */
  ab: {
    cafeina:  { name: 'Cafeína', rar: 'basic', ic: 'CF' },
    piel:     { name: 'Piel dura', rar: 'basic', ic: 'PD' },
    punos:    { name: 'Puños de hierro', rar: 'basic', ic: 'PH' },
    reflejos: { name: 'Reflejos', rar: 'common', ic: 'RF' },
    plasma:   { name: 'Escudo de plasma', rar: 'rare', fac: 'ciber', ic: 'EP' },
    sigilo:   { name: 'Sigilo inicial', rar: 'rare', fac: 'animales', ic: 'SG' },
    escarcha: { name: 'Escarcha', rar: 'rare', fac: 'nomuertos', ic: 'ES' },
    vampiro:  { name: 'Vampirismo', rar: 'rare', ic: 'VP' },
    cadena:   { name: 'Rayo en cadena', rar: 'epic', fac: 'heroes', ic: 'RC' },
    provoca:  { name: 'Provocación', rar: 'epic', fac: 'memes', ic: 'PV' },
    renacer:  { name: 'Renacer', rar: 'epic', fac: 'nomuertos', ic: 'RN' },
    grito:    { name: 'Grito', rar: 'epic', fac: 'nomuertos', ic: 'GR' },
    clon:     { name: 'Clon viral', rar: 'legendary', fac: 'memes', ic: 'CV' },
    furia:    { name: 'Furia legendaria', rar: 'legendary', ic: 'FL' },
    // v0.9.12: habilidades con efectos nuevos
    speedrun:   { name: 'Speedrun', rar: 'common', ic: 'SR' },
    hitbox:     { name: 'Hitbox dudosa', rar: 'common', ic: 'HB' },
    microtrans: { name: 'Microtransacción', rar: 'rare', ic: 'MT' },
    ragequit:   { name: 'Rage quit', rar: 'rare', ic: 'RQ' },
    modofoto:   { name: 'Modo foto', rar: 'epic', ic: 'MF' },
    dlc:        { name: 'DLC gratis', rar: 'epic', ic: 'DL' },
    gigante:    { name: 'Modo gigante', rar: 'legendary', ic: 'MG' },
    iman:       { name: 'Imán de CAOS', rar: 'epic', ic: 'IC' },
  },
  /* ---------- objetos: arma, cabeza y accesorio ---------- */
  eq: {
    espada_carton: { name: 'Espada de cartón piedra', slot: 'weapon', rar: 'basic' },
    raton_dpi:     { name: 'Ratón de 16.000 DPI', slot: 'weapon', rar: 'rare' },
    teclado_rgb:   { name: 'Teclado mecánico RGB', slot: 'weapon', rar: 'epic' },
    banhammer_oro: { name: 'BanHammer de oro', slot: 'weapon', rar: 'legendary' },
    cuernos:       { name: 'Casco con cuernos', slot: 'head', rar: 'basic' },
    corona_carton: { name: 'Corona de hamburguesería', slot: 'head', rar: 'rare' },
    gorro_aluminio:{ name: 'Gorro de papel de aluminio', slot: 'head', rar: 'epic' },
    auriculares:   { name: 'Auriculares con cancelación de ruido', slot: 'head', rar: 'epic' },
    taza:          { name: 'Taza del becario', slot: 'acc', rar: 'basic' },
    pase_caducado: { name: 'Pase de batalla caducado', slot: 'acc', rar: 'common' },
    almohada:      { name: 'Almohada de viaje', slot: 'acc', rar: 'rare' },
    silla_gamer:   { name: 'Silla gamer portátil', slot: 'acc', rar: 'epic' },
    cofre:         { name: 'Cofre de botín sin abrir', slot: 'acc', rar: 'legendary' },
    diploma:       { name: 'Diploma de Becario del Mes', slot: 'acc', rar: 'rare', pass: true },
    corbata_ceo:   { name: 'Corbata del CEO', slot: 'acc', rar: 'legendary', pass: true },
    // v0.9.12: objetos con efectos nuevos
    mando_cable:  { name: 'Mando con cable de 3 metros', slot: 'weapon', rar: 'common' },
    baguette:     { name: 'Baguette de ayer', slot: 'weapon', rar: 'rare' },
    lanzaconfeti: { name: 'Lanzaconfeti', slot: 'weapon', rar: 'epic' },
    gorra_reves:  { name: 'Gorra del revés', slot: 'head', rar: 'common' },
    casco_vr:     { name: 'Casco de realidad virtual', slot: 'head', rar: 'rare' },
    orejas_gato:  { name: 'Diadema de orejas de gato', slot: 'head', rar: 'epic' },
    bebida_xxl:   { name: 'Bebida energética XXL', slot: 'acc', rar: 'common' },
    disco_fisico: { name: 'Disco físico de coleccionista', slot: 'acc', rar: 'rare' },
    alfombrilla:  { name: 'Alfombrilla XXL', slot: 'acc', rar: 'epic' },
    // v0.9.15: objetos de facción: más fuertes, pero solo los puede llevar el líder de su facción
    zanahoria_oro:   { name: 'Zanahoria de oro', slot: 'weapon', rar: 'legendary', fac: 'animales' },
    corona_huesos:   { name: 'Corona de huesos', slot: 'head', rar: 'legendary', fac: 'nomuertos' },
    microfono_oro:   { name: 'Micrófono de oro', slot: 'acc', rar: 'legendary', fac: 'streamers' },
    yelmo_olimpo:    { name: 'Yelmo del Olimpo', slot: 'head', rar: 'legendary', fac: 'heroes' },
    nucleo_plasma:   { name: 'Núcleo de plasma', slot: 'acc', rar: 'legendary', fac: 'ciber' },
    gafas_pixel:     { name: 'Gafas pixeladas', slot: 'head', rar: 'legendary', fac: 'memes' },
    raton_campeon:   { name: 'Ratón del campeón', slot: 'weapon', rar: 'legendary', fac: 'gamer' },
    cartucho_dorado: { name: 'Cartucho dorado', slot: 'acc', rar: 'legendary', fac: 'olvidados' },
    claqueta_oro:    { name: 'Claqueta de oro', slot: 'weapon', rar: 'legendary', fac: 'pop' },
    boton_pausa:  { name: 'Botón de pausa', slot: 'acc', rar: 'epic' },
  },
};
const SLOTS = { weapon: 'Arma', head: 'Cabeza', acc: 'Accesorio' };
// la calidad de cada copia: cada efecto sale entre el 50 % (calidad 0) y el 150 % (calidad 100) de su valor central.
// v0.9.62: la calidad se enseña con estrellas (st: de 1 a 5), no con colores, para que el color solo diga la rareza.
const QTIERS = [
  { name: 'Becario (básica)', p: 30, lo: 0, hi: 0.4, st: 1, col: '#ffe06a' },
  { name: 'Junior (normal)', p: 40, lo: 0.4, hi: 0.7, st: 2, col: '#ffe06a' },
  { name: 'Senior (buena)', p: 20, lo: 0.7, hi: 0.88, st: 3, col: '#ffe06a' },
  { name: 'Director (excelente)', p: 9, lo: 0.88, hi: 0.99, st: 4, col: '#ffe06a' },
  { name: 'CEO (perfecta)', p: 1, lo: 1, hi: 1, st: 5, col: '#ffe06a' },
];
// la calidad en estrellas (HTML): las que tiene, encendidas; las que le faltan, apagadas; la CEO, además, brilla
const qStars = T => `<span class="qs${T.st === 5 ? ' qs-ceo' : ''}">${'★'.repeat(T.st)}<i>${'★'.repeat(5 - T.st)}</i></span>`;
