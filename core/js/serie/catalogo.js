// Fans Of · La serie: QUÉ habilidades y objetos existen, con su nombre, su rareza y su icono. Son los mismos en todos los juegos.
// Lo que HACE cada uno, y cuánto, lo dice cada juego (el mismo objeto puede dar una cosa en un juego y otra en otro),
// y un juego solo reparte los que usa. ic: las dos letras del icono · fac: de qué facción es · pass: premio del pase de batalla
// (no sale en el gashapón ni se puede despedir o volver a sortear).
'use strict';
const RARITY = { common: ['Común', '#63cfe0', '#2a7895'], rare: ['Rara', '#ffb04f', '#cf5a16'], epic: ['Épica', '#d08cff', '#6d28c9'], legendary: ['Legendaria', '#ffe06a', '#c47f10'] };
const CATALOGO = {
  /* ---------- habilidades: una por carta ---------- */
  ab: {
    cafeina:  { name: 'Cafeína', rar: 'common', ic: 'CF' },
    piel:     { name: 'Piel dura', rar: 'common', ic: 'PD' },
    punos:    { name: 'Puños de hierro', rar: 'common', ic: 'PH' },
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
    hitbox:     { name: 'Hitbox dudosa', rar: 'rare', ic: 'HB' },
    microtrans: { name: 'Microtransacción', rar: 'rare', ic: 'MT' },
    ragequit:   { name: 'Rage quit', rar: 'rare', ic: 'RQ' },
    modofoto:   { name: 'Modo foto', rar: 'epic', ic: 'MF' },
    dlc:        { name: 'DLC gratis', rar: 'epic', ic: 'DL' },
    gigante:    { name: 'Modo gigante', rar: 'legendary', ic: 'MG' },
    iman:       { name: 'Imán de CAOS', rar: 'legendary', ic: 'IC' },
  },
  /* ---------- objetos: arma, cabeza y accesorio ---------- */
  eq: {
    espada_carton: { name: 'Espada de cartón piedra', slot: 'weapon', rar: 'common' },
    raton_dpi:     { name: 'Ratón de 16.000 DPI', slot: 'weapon', rar: 'rare' },
    teclado_rgb:   { name: 'Teclado mecánico RGB', slot: 'weapon', rar: 'epic' },
    banhammer_oro: { name: 'BanHammer de oro', slot: 'weapon', rar: 'legendary' },
    cuernos:       { name: 'Casco con cuernos', slot: 'head', rar: 'common' },
    corona_carton: { name: 'Corona de hamburguesería', slot: 'head', rar: 'rare' },
    gorro_aluminio:{ name: 'Gorro de papel de aluminio', slot: 'head', rar: 'epic' },
    auriculares:   { name: 'Auriculares con cancelación de ruido', slot: 'head', rar: 'legendary' },
    taza:          { name: 'Taza del becario', slot: 'acc', rar: 'common' },
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
    boton_pausa:  { name: 'Botón de pausa', slot: 'acc', rar: 'legendary' },
  },
};
const SLOTS = { weapon: 'Arma', head: 'Cabeza', acc: 'Accesorio' };
// la calidad de cada copia: cada efecto sale entre el 50 % (calidad 0) y el 150 % (calidad 100) de su valor central
const QTIERS = [
  { name: 'Becario (básica)', p: 30, lo: 0, hi: 0.4, col: '#b4bccb' },
  { name: 'Junior (normal)', p: 40, lo: 0.4, hi: 0.7, col: '#63cfe0' },
  { name: 'Senior (buena)', p: 20, lo: 0.7, hi: 0.88, col: '#8cf05a' },
  { name: 'Director (excelente)', p: 9, lo: 0.88, hi: 0.99, col: '#e2a8ff' },
  { name: 'CEO (perfecta)', p: 1, lo: 1, hi: 1, col: '#ffcb3d' },
];
