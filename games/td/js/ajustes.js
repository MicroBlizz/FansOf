// Fans of TD · AJUSTES: los números de este juego sobre los sistemas comunes de core/.
// El catálogo de habilidades y objetos (nombres, rarezas, huecos) es común y está en core/js/meta.js.
// Aquí se decide qué hace y cuánto da cada uno EN ESTE JUEGO, y lo que cambia de la economía. Se puede recalibrar sin tocar core.
'use strict';
/* =========================================================
   Como en el Rumble: cualquier carta lleva una habilidad y solo el líder lleva objetos (arma, cabeza y accesorio).
   En Fans of TD una carta se usa de dos maneras, y por dentro cada mejora se apunta en una de las dos:
     · T: cuando es una TORRE en tu campo (daño, alcance, velocidad de ataque…).
     · U: cuando es una UNIDAD que envías al rival en el modo VS o que hace horas extra (vida, velocidad, escudo…).
   El jugador no ve esa división: un escudo solo sirve a la unidad y el alcance solo a la torre, sin más.
   El daño vale para las dos: la torre pega más y la unidad le quita más vida a la base rival.
   ========================================================= */
const AJUSTES = {
  id: 'td',
  nombre: 'Fans of TD',
  // lo máximo que el servidor deja ganar por motivo (suma a los de core/js/sistema/economia.js); ver PLAN-CUENTAS.md, 15.13
  topes: { recompensa: { vez: { gold: 5000, gems: 200 }, dia: { gold: 300000, gems: 5000 }, calcula: ['camp', 'otro'] } },   // en campaña el servidor calcula el premio; en VS cuenta la xp del pase
  servidor: { gachapon: true, economia: true },   // lo que ya hace el servidor cuando hay cuenta: el gashapón, despedir, volver a tirar los números y subir de nivel
  campRegla: 'todos',   // un mundo se abre cuando se han pasado todos los niveles del anterior (en Rumble, el último)
  guardado: 'fortd-save',   // la partida guardada de este juego: cada juego tiene la suya, con su oro, sus gemas y su inventario
  // lo que cambia respecto a la economía común (core/js/meta.js: ECON). Lo que no salga aquí vale lo mismo que en el Rumble.
  econ: {
    xpPerPlay: 4, xpCap: 60,                                 // XP por cada torre que pones o unidad que envías, hasta 60 por carta y partida
    vs: { facil: 40, normal: 60, dificil: 90, lose: 10 },    // oro por partida en modo VS
    mission: [50, 10],                                       // 0.13.1: oro y gemas de cada misión diaria (como el Rumble; sin esto no se abrían las Misiones)
  },
  facetas: { T: { nombre: 'TORRE', con: 'la TORRE', cls: 'ft' }, U: { nombre: 'UNIDAD', con: 'la UNIDAD', cls: 'fu' } },
  verFacetas: false,        // no se enseñan en los menús: los textos salen seguidos, como en el Rumble
  // lo que puede mejorar cada faceta. [texto, es un porcentaje, se escribe con signo]
  stats: {
    T: { dmg: ['{v} % de daño', 1, 1], range: ['{v} % de alcance', 1, 1], spd: ['ataca un {v} % más rápido', 1], crit: ['el {v} % de sus golpes son críticos (triple)', 1], splash: ['cada golpe salpica el {v} % del daño alrededor', 1],
         slowT: ['sus golpes frenan al enemigo {v} s', 0], chain: ['cada golpe salta a otro enemigo con el {v} % del daño', 1], grito: ['cada 9 s aturde {v} s a los enemigos cercanos', 0],
         furia: ['con tu base a menos de la mitad, +{v} % de daño', 1], iman: ['cada enemigo que derrota da {v} de CAOS extra', 0], desp: ['los jefes dejan parada su torre un {v} % menos de tiempo', 1] },
    U: { hp: ['{v} % de vida', 1, 1], speed: ['{v} % de velocidad', 1, 1], armor: ['recibe un {v} % menos de daño', 1], shield: ['escudo del {v} % de su vida que se recarga', 1], fog: ['las torres rivales tardan {v} s en verle', 0],
         steal: ['roba un {v} % más de vida a la base rival', 1], revive: ['revive una vez con el {v} % de su vida', 1], clon: ['al caer se divide en 2 copias con el {v} % de su vida', 1], rush: ['los primeros {v} s va al triple de velocidad', 0],
         dodge: ['esquiva el {v} % de los golpes', 1], caos: ['al llegar a la base rival le roba {v} de CAOS', 0], regen: ['se cura un {v} % de su vida cada segundo', 1], cc: ['inmune a aturdimientos y frenazos', 0],
         pause: ['una vez, cuando va a caer, es invulnerable {v} s', 0], leak: ['{v} % de daño a la base rival', 1, 1] },
  },
  // qué hace cada habilidad y cada objeto: [faceta, qué mejora, valor central]. El valor central es el de una copia de calidad media:
  // cada copia sale entre el 50 % y el 150 % de él. Un valor negativo es una pega y no cambia con la calidad.
  // Ejemplo: para que la Espada de cartón dé +20 % de daño en vez de +10 %, cambia aquí su 10 por 20.
  fx: {
    cafeina:         [['U', 'speed', 22]],
    piel:            [['U', 'hp', 22]],
    punos:           [['T', 'dmg', 18]],
    reflejos:        [['T', 'spd', 18]],
    speedrun:        [['U', 'rush', 3]],
    plasma:          [['U', 'shield', 25]],
    sigilo:          [['U', 'fog', 2.5]],
    escarcha:        [['T', 'slowT', 1.3]],
    vampiro:         [['U', 'steal', 40]],
    hitbox:          [['U', 'dodge', 15]],
    microtrans:      [['U', 'caos', 8]],
    cadena:          [['T', 'chain', 60]],
    renacer:         [['U', 'revive', 50]],
    grito:           [['T', 'grito', 1]],
    iman:            [['T', 'iman', 2]],
    clon:            [['U', 'clon', 40]],
    furia:           [['T', 'furia', 40]],
    gigante:         [['U', 'hp', 40], ['T', 'dmg', 40], ['U', 'speed', -15]],
    espada_carton:   [['T', 'dmg', 10]],
    mando_cable:     [['T', 'range', 15]],
    raton_dpi:       [['T', 'range', 12], ['T', 'dmg', 10]],
    baguette:        [['T', 'crit', 20]],
    teclado_rgb:     [['T', 'spd', 25]],
    lanzaconfeti:    [['T', 'splash', 40]],
    banhammer_oro:   [['T', 'dmg', 25], ['T', 'slowT', 0.6]],
    cuernos:         [['U', 'hp', 15]],
    gorra_reves:     [['U', 'speed', 12]],
    corona_carton:   [['U', 'hp', 10], ['T', 'dmg', 10]],
    casco_vr:        [['T', 'dmg', 25], ['U', 'hp', -10]],
    gorro_aluminio:  [['T', 'desp', 60], ['U', 'hp', 10]],
    orejas_gato:     [['U', 'armor', 20]],
    auriculares:     [['U', 'cc', 0], ['U', 'hp', 15]],
    taza:            [['U', 'regen', 1]],
    pase_caducado:   [['T', 'dmg', 3], ['U', 'hp', 3]],
    almohada:        [['T', 'desp', 40]],
    disco_fisico:    [['U', 'hp', 18]],
    silla_gamer:     [['U', 'armor', 15]],
    alfombrilla:     [['T', 'range', 15]],
    boton_pausa:     [['U', 'pause', 3]],
    zanahoria_oro:   [['T', 'dmg', 22], ['U', 'speed', 15]],
    corona_huesos:   [['U', 'hp', 22], ['U', 'regen', 1.5]],
    microfono_oro:   [['T', 'dmg', 18], ['T', 'spd', 10]],
    yelmo_olimpo:    [['U', 'hp', 20], ['U', 'armor', 14]],
    nucleo_plasma:   [['U', 'shield', 45], ['T', 'dmg', 15]],
    gafas_pixel:     [['T', 'crit', 22], ['U', 'speed', 15]],
    raton_campeon:   [['T', 'spd', 28], ['T', 'range', 15]],
    cartucho_dorado: [['T', 'dmg', 15], ['U', 'fog', 2]],
    claqueta_oro:    [['T', 'dmg', 18], ['T', 'splash', 35]],
    diploma:         [['U', 'hp', 8], ['T', 'dmg', 8]],                      // premio del pase (pista gratis)
    corbata_ceo:     [['U', 'hp', 15], ['T', 'dmg', 15], ['U', 'speed', 10]],   // premio del pase (pista Ejecutiva)
  },
};
