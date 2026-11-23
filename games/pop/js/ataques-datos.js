// Fans of Pop · ATAQUES DE LOS COMPAÑEROS (solo datos; tarea #160, ADR 197). Cada COMPAÑERO tiene su ataque PROPIO
// (Pepins, 21-11-2026: «cada compañero tiene un ataque diferente para diferenciarlos y enamorarte de ellos»): cómo vuela de
// su hueco a la burbuja, qué golpe hace al llegar, sus «cositas» (piezas pequeñas de la estela y del golpe), su color y su
// estilo (brillo de hada o acuarela). La habilidad solo pone el sonido y, para un compañero nuevo sin fila, la forma de
// RESPALDO. Uno nuevo añade su fila en `cositas` con un vuelo+golpe que no tenga nadie (y, si trae una pieza nueva, su fila
// en `piezas` y su dibujo en js/ataques-piezas.js). Lo pinta el motor (js/ataques.js y js/ataques-fx.js) con el flag
// 'ataques-companeros'. Las habilidades están en PP_COMP.HAB (js/companeros-datos.js).
'use strict';
const PP_ATAQUES = (() => {
  const f = o => Object.freeze(o);
  const forma = (vuelo, golpe, sonido) => f({ vuelo, golpe, sonido });
  // vuelo: cómo va del hueco a su sitio · golpe: qué hace al llegar · sonido: id del sonido de esa forma (PP_SON_ATAQUE de
  // js/sonidos.js; las formas de las habilidades que saltan, revisión del 21-11-2026, reutilizan el más parecido)
  const formas = f({
    salto: forma('salto', 'estallido', 'ataque-salto'),          // salta a una burbuja buena y le hace pop
    hielo: forma('recto', 'zarpazo', 'ataque-especial'),         // derecho al hielo y escarcha
    concha: forma('arco', 'ola', 'ataque-pellizco'),             // un arco amplio y una ola con perlita (el plop del pellizco)
    cohete: forma('cohete', 'fuegos', 'ataque-rival'),           // sube en zigzag y estalla en fuegos (los silbidos del rayo)
    burbuja: forma('espiral', 'pompas', 'ataque-tiempo'),        // en espiral y pompas de jabón (el remolino del tiempo)
    lluvia: forma('lluvia', 'chaparron', 'ataque-lluvia'),       // cae sobre varias burbujas buenas a la vez
    marca: forma('arco', 'chispa', 'ataque-marca'),              // deja una marca o una pista brillando
    toque: forma('subida', 'onda', 'ataque-toque'),              // sube al contador: toques extra o que no cuentan
    premio: forma('arco', 'destello', 'ataque-premio'),          // estrellas, tickets y premios de toques gordos
    monedas: forma('fuente', 'tintineo', 'ataque-monedas'),      // monedas de más al ganar
    tiempo: forma('espiral', 'remolino', 'ataque-tiempo'),       // deshacer y no perder lo hecho
    pellizco: forma('recto', 'pellizco', 'ataque-pellizco'),     // cambia una sola burbuja (voltearla o quitarla)
    rival: forma('zigzag', 'rayo', 'ataque-rival'),              // va contra el rival del duelo
  });
  const porHabilidad = f({
    saltito: 'salto', primero: 'salto',
    hielo: 'hielo', concha: 'concha', cohete: 'cohete', burbuja: 'burbuja',
    lluvia: 'lluvia',
    chivato: 'marca', linterna: 'marca', lupa: 'marca',
    horas: 'toque', cielo: 'toque', calma: 'toque', fantasma: 'toque', rescate: 'toque',
    gordo: 'premio', estrella: 'premio', ticket: 'premio',
    fortuna: 'monedas', limpia: 'monedas', bolsa: 'monedas',
    rebobina: 'tiempo', deshaz: 'tiempo', racha: 'tiempo',
    volteo: 'pellizco', quita: 'pellizco',
    despiste: 'rival', salida: 'rival',
  });
  // los estilos de dibujo de un ataque (los dos del boceto cozy que eligió Pepins): 'hada' (brillo de hada: halo pastel,
  // destellitos, polvo de hada y corazoncitos) y 'acuarela' (piezas translúcidas con el color corrido a los bordes y manchas)
  const estilos = f(['hada', 'acuarela']);
  // el ataque PROPIO de cada compañero: su estilo ('hada' o 'acuarela', repartido al azar UNA vez con semilla 20261121 y
  // escrito aquí), el color de su estela (su color2 de PP_SLIMES o PP_COMP.NUEVOS), su VUELO (una de PP_ATAQUE.RUTAS), su
  // GOLPE (uno de PP_ATAQUE.EXTRA) y sus cositas. Ninguna pareja vuelo+golpe se repite (lo vigila el test). Uno nuevo sin
  // fila usa la forma de su habilidad y el estilo que le toca por su id (PP_ATAQUE.estiloPorId).
  const c = (estilo, color, vuelo, golpe, ...piezas) => f({ estilo, color, vuelo, golpe, piezas: f(piezas) });
  const cositas = f({
    // los 13 de siempre (PP_SLIMES)
    lola: c('hada', '#e07a3c', 'arco', 'chispa', 'lupa', 'estrellita'),                   // lupa y destello
    becario: c('acuarela', '#3f86d8', 'recto', 'carrusel', 'clip', 'cafe'),                // papeles y clips en corro
    bunny: c('hada', '#cfc2ea', 'salto', 'estallido', 'zanahoria', 'huella'),              // salta con zanahorias
    cofre: c('hada', '#c98a12', 'fuente', 'carrusel', 'moneda', 'llave'),                  // fuente de monedas y llaves
    ceo: c('acuarela', '#4a4a66', 'lluvia', 'chaparron', 'billete', 'corbata'),            // llueven billetes y corbatas
    copito: c('hada', '#6fb8e8', 'recto', 'zarpazo', 'copo', 'cristal-hielo'),             // escarcha
    medusa: c('hada', '#e07ab5', 'arco', 'ola', 'burbuja-rosa', 'concha', 'perla'),        // ola con perlas
    algodon: c('hada', '#9fdcff', 'subida', 'chaparron', 'azucar', 'nube'),                // sube y llueve azúcar
    nubecita: c('acuarela', '#c9b8f0', 'planeo', 'chaparron', 'nube', 'gota', 'arcoiris'), // planea y chispea
    hada: c('hada', '#4fc98a', 'espiral', 'fuegos', 'polvo-hada', 'estrellita', 'flor'),   // polvo de hada en espiral
    sirena: c('hada', '#3ab0c8', 'ola', 'ola', 'burbuja', 'perla'),                        // ola de agua
    maneki: c('hada', '#e0c8b0', 'fuente', 'chaparron', 'moneda', 'cascabel'),             // lluvia de moneditas doradas
    astro: c('acuarela', '#9a80d8', 'fugaz', 'chispa', 'estrella', 'planeta'),             // estrellas fugaces
    // los 20 Animales (PP_COMP.NUEVOS)
    ardilla: c('acuarela', '#b8662c', 'rebote', 'carrusel', 'bellota', 'hoja-otono'),
    castor: c('acuarela', '#8a5a30', 'salto', 'ola', 'astilla', 'gota'),
    capibara: c('acuarela', '#a87848', 'planeo', 'pompas', 'mandarina', 'gota'),
    pinguino: c('acuarela', '#2f5a8a', 'ola', 'zarpazo', 'copo', 'pez'),
    pato: c('acuarela', '#e0b020', 'rebote', 'pompas', 'pluma', 'gota'),
    cangrejo: c('acuarela', '#d8583c', 'zigzag', 'pompas', 'concha', 'burbuja'),
    osito: c('acuarela', '#a87a58', 'salto', 'tinta', 'miel', 'huella'),
    mariquita: c('acuarela', '#d83a3a', 'zigzag', 'estallido', 'hoja', 'ticket'),
    zorro: c('acuarela', '#e06a20', 'zigzag', 'fuegos', 'hoja-otono', 'huella'),
    suricata: c('acuarela', '#c0a070', 'subida', 'chispa', 'luz', 'huella'),
    mapache: c('hada', '#5a6070', 'espiral', 'carrusel', 'manzana', 'huella'),
    pulpito: c('acuarela', '#d85aa0', 'espiral', 'tinta', 'burbuja-rosa', 'tinta'),        // tinta pastel en remolino
    mariposa: c('hada', '#ff7ab8', 'planeo', 'estallido', 'flor', 'polvo-hada'),
    luciernaga: c('acuarela', '#a8c830', 'planeo', 'chispa', 'luz', 'hoja'),
    erizo: c('hada', '#7a5038', 'rebote', 'fuegos', 'pua', 'manzana'),
    huron: c('hada', '#3a2a20', 'fugaz', 'tinta', 'shuriken', 'humo'),
    pezglobo: c('hada', '#e0a040', 'subida', 'pompas', 'burbuja', 'pua'),
    caballito: c('hada', '#40b8a0', 'ola', 'carrusel', 'burbuja', 'alga', 'perla'),
    panda: c('hada', '#3a3a3a', 'subida', 'estallido', 'bambu', 'hoja'),
    mechavaca: c('acuarela', '#b84f86', 'cohete', 'fuegos', 'tuerca', 'chispa-electrica', 'flor'),
  });
  // qué pedirle a Yoshi de cada pieza (en inglés, como sus recetas); se reutilizan entre compañeros
  const piezas = f({
    'lupa': 'tiny magnifying glass with a shiny lens',
    'estrellita': 'tiny five-point yellow star sparkle',
    'clip': 'small bent paper clip, light blue metal',
    'cafe': 'tiny steaming coffee cup',
    'zanahoria': 'small orange carrot with green leafy top',
    'huella': 'small round animal paw print',
    'moneda': 'small shiny gold coin',
    'llave': 'tiny old golden key',
    'billete': 'small folded green banknote',
    'corbata': 'tiny dark blue necktie',
    'copo': 'small white-blue snowflake',
    'cristal-hielo': 'small pale blue ice crystal shard',
    'burbuja-rosa': 'small glossy pink bubble',
    'concha': 'tiny pink scallop seashell',
    'perla': 'small round white pearl with soft shine',
    'azucar': 'tiny sparkling sugar crystal cube',
    'nube': 'small fluffy white cloud puff',
    'gota': 'small clear blue water drop',
    'arcoiris': 'tiny short rainbow arc',
    'polvo-hada': 'cluster of tiny green-gold fairy dust sparkles',
    'flor': 'small white daisy flower',
    'burbuja': 'small glossy clear blue bubble',
    'cascabel': 'tiny golden jingle bell with red ribbon',
    'estrella': 'small chubby yellow star with a soft glow',
    'planeta': 'tiny ringed purple planet',
    'bellota': 'small brown acorn with cap',
    'hoja-otono': 'small orange autumn leaf',
    'astilla': 'small wood chip splinter',
    'mandarina': 'tiny round mandarin orange with leaf',
    'pez': 'tiny blue fish',
    'pluma': 'small soft yellow feather',
    'miel': 'small golden honey drop',
    'hoja': 'small bright green leaf',
    'ticket': 'tiny red-and-white fair ticket stub',
    'luz': 'small glowing yellow-green firefly light orb',
    'manzana': 'tiny shiny red apple',
    'tinta': 'small dark purple ink blot splash',
    'pua': 'small brown hedgehog spine quill',
    'shuriken': 'tiny dark grey ninja throwing star',
    'humo': 'small grey smoke puff',
    'alga': 'small wavy green seaweed strand',
    'bambu': 'short green bamboo segment with a leaf',
    'tuerca': 'small silver hex nut',
    'chispa-electrica': 'small yellow electric zigzag spark',
  });
  return f({ formas, porHabilidad, estilos, cositas, piezas });
})();
