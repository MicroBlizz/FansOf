// Fans of Pop · ATAQUES DE LOS COMPAÑEROS (solo datos; tarea #160, ADR 197). La FORMA del ataque la marca la habilidad
// (cómo vuela de su hueco a la burbuja, qué golpe hace al llegar y qué sonido suena) y cada COMPAÑERO pone sus «cositas»
// en la estela (piezas pequeñas pintadas por Yoshi), su color y su estilo (brillo de hada o acuarela). Un compañero nuevo
// solo añade su fila en `cositas` (y, si trae una pieza nueva, su fila en `piezas`). Lo pinta el motor (js/ataques.js y
// js/ataques-fx.js) con el flag 'ataques-companeros'. Las habilidades están en PP_COMP.HAB (js/companeros-datos.js).
'use strict';
const PP_ATAQUES = (() => {
  const f = o => Object.freeze(o);
  const forma = (vuelo, golpe, sonido) => f({ vuelo, golpe, sonido });
  // vuelo: cómo va del hueco a su sitio · golpe: qué hace al llegar · sonido: id del sonido de esa forma
  const formas = f({
    salto: forma('salto', 'estallido', 'ataque-salto'),          // salta a una burbuja buena y le hace pop
    especial: forma('recto', 'zarpazo', 'ataque-especial'),      // va derecho a una burbuja especial (hielo, concha, cohete…)
    lluvia: forma('lluvia', 'estallido', 'ataque-lluvia'),       // cae sobre varias burbujas buenas a la vez
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
    hielo: 'especial', concha: 'especial', cohete: 'especial', burbuja: 'especial',
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
  // las cositas de cada compañero, el color de su estela (su color2 de PP_SLIMES o PP_COMP.NUEVOS) y su ESTILO de ataque
  // ('hada' o 'acuarela', revisión del 21-11-2026): se repartió al azar UNA sola vez (barajado con semilla 20261121, 16 hada
  // y 17 acuarela) y queda escrito aquí, así que cada compañero tiene siempre el mismo. Uno nuevo sin fila lo saca de su id
  // (PP_ATAQUE.estiloPorId).
  const c = (estilo, color, ...piezas) => f({ estilo, color, piezas: f(piezas) });
  const cositas = f({
    // los 13 de siempre (PP_SLIMES)
    lola: c('hada', '#e07a3c', 'lupa', 'estrellita'),
    becario: c('acuarela', '#3f86d8', 'clip', 'cafe'),
    bunny: c('hada', '#cfc2ea', 'zanahoria', 'huella'),
    cofre: c('hada', '#c98a12', 'moneda', 'llave'),
    ceo: c('acuarela', '#4a4a66', 'billete', 'corbata'),
    copito: c('hada', '#6fb8e8', 'copo', 'cristal-hielo'),
    medusa: c('hada', '#e07ab5', 'burbuja-rosa', 'concha', 'perla'),
    algodon: c('hada', '#9fdcff', 'azucar', 'nube'),
    nubecita: c('acuarela', '#c9b8f0', 'nube', 'gota', 'arcoiris'),
    hada: c('hada', '#4fc98a', 'polvo-hada', 'estrellita', 'flor'),
    sirena: c('hada', '#3ab0c8', 'burbuja', 'perla'),
    maneki: c('hada', '#e0c8b0', 'moneda', 'cascabel'),
    astro: c('acuarela', '#9a80d8', 'estrella', 'planeta'),
    // los 20 Animales (PP_COMP.NUEVOS)
    ardilla: c('acuarela', '#b8662c', 'bellota', 'hoja-otono'),
    castor: c('acuarela', '#8a5a30', 'astilla', 'gota'),
    capibara: c('acuarela', '#a87848', 'mandarina', 'gota'),
    pinguino: c('acuarela', '#2f5a8a', 'copo', 'pez'),
    pato: c('acuarela', '#e0b020', 'pluma', 'gota'),
    cangrejo: c('acuarela', '#d8583c', 'concha', 'burbuja'),
    osito: c('acuarela', '#a87a58', 'miel', 'huella'),
    mariquita: c('acuarela', '#d83a3a', 'hoja', 'ticket'),
    zorro: c('acuarela', '#e06a20', 'hoja-otono', 'huella'),
    suricata: c('acuarela', '#c0a070', 'luz', 'huella'),
    mapache: c('hada', '#5a6070', 'manzana', 'huella'),
    pulpito: c('acuarela', '#d85aa0', 'burbuja-rosa', 'tinta'),
    mariposa: c('hada', '#ff7ab8', 'flor', 'polvo-hada'),
    luciernaga: c('acuarela', '#a8c830', 'luz', 'hoja'),
    erizo: c('hada', '#7a5038', 'pua', 'manzana'),
    huron: c('hada', '#3a2a20', 'shuriken', 'humo'),
    pezglobo: c('hada', '#e0a040', 'burbuja', 'pua'),
    caballito: c('hada', '#40b8a0', 'burbuja', 'alga', 'perla'),
    panda: c('hada', '#3a3a3a', 'bambu', 'hoja'),
    mechavaca: c('acuarela', '#b84f86', 'tuerca', 'chispa-electrica', 'flor'),
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
