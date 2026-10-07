// Fans of Survivors · AJUSTES: los números de este juego sobre los sistemas comunes de core/ (economía, partida guardada y
// qué hace aquí cada habilidad y objeto del gashapón). Se carga ANTES de lo común. Las cifras de la partida están en js/datos.js.
'use strict';
/* =========================================================
   Como en el Rumble y el TD: cualquier carta lleva una habilidad y solo el líder lleva objetos (arma, cabeza y accesorio).
   Aquí el líder es tu personaje (CrazyBunny) y las otras 6 cartas de la facción son sus armas:
     · lo que lleva el LÍDER (nivel, habilidad y objetos) mejora al personaje y a todas sus armas;
     · el nivel de cada carta-arma sube el daño de esa arma (+6 % por nivel, como en los otros juegos).
   ========================================================= */
const AJUSTES = {
  id: 'survivors',
  nombre: 'Fans of Survivors',
  guardado: 'fosurv-save',   // la partida guardada de este juego: nunca se comparte con los otros
  servidor: {},              // todavía no hay nada de este juego que haga el servidor: todo se calcula aquí (la partida sí se guarda en la nube)
  topes: { recompensa: { vez: { gold: 3000, gems: 100 }, dia: { gold: 200000, gems: 3000 } } },
  // lo que cambia respecto a la economía común (core/js/sistema/progreso.js: ECON)
  econ: {
    xpPerPlay: 0,
    mission: [50, 10],
    // oro al acabar una partida: por minuto aguantado, por cada 100 bajas, por ganar al jefe; y gemas por ganar
    partida: { porMinuto: 15, por100Bajas: 8, victoria: 150, gemasVictoria: 15, xpPorMinuto: 10 },
  },
  // lo que puede mejorar cada habilidad u objeto aquí: [texto, es porcentaje, lleva signo]
  stats: {
    dmg: ['{v} % de daño', 1, 1], hp: ['{v} % de vida', 1, 1], speed: ['{v} % de velocidad', 1, 1], cd: ['las armas se recargan un {v} % antes', 1],
    area: ['{v} % de área de las armas', 1, 1], pickup: ['recoge el CAOS desde un {v} % más lejos', 1], regen: ['se cura {v} de vida por segundo', 0],
    armor: ['recibe un {v} % menos de daño', 1], dodge: ['esquiva el {v} % de los golpes', 1], crit: ['el {v} % de los golpes son críticos (doble)', 1],
    xp: ['{v} % de CAOS de cada cristal', 1, 1], revive: ['revive una vez con el {v} % de su vida', 1], heal: ['cada enemigo que cae le cura {v}', 0],
  },
  // qué hace cada habilidad y cada objeto: [qué mejora, valor central]. Cada copia sale entre el 50 % y el 150 % del valor central.
  // Un valor negativo es una pega y no cambia con la calidad.
  fx: {
    cafeina: [['speed', 12]], piel: [['hp', 20]], punos: [['dmg', 15]], reflejos: [['cd', 10]], speedrun: [['speed', 8], ['pickup', 20]],
    plasma: [['armor', 15]], sigilo: [['dodge', 8]], escarcha: [['area', 12]], vampiro: [['heal', 0.6]], hitbox: [['dodge', 12]],
    microtrans: [['xp', 15]], cadena: [['area', 18]], renacer: [['revive', 40]], grito: [['area', 10], ['armor', 6]], iman: [['pickup', 40]],
    provoca: [['armor', 10]], ragequit: [['area', 12]], modofoto: [['dodge', 6]], dlc: [['xp', 10]],
    clon: [['crit', 10]], furia: [['dmg', 22]], gigante: [['hp', 35], ['dmg', 20], ['speed', -12]],
    espada_carton: [['dmg', 10]], mando_cable: [['area', 10]], raton_dpi: [['area', 15], ['dmg', 8]], baguette: [['crit', 12]], teclado_rgb: [['cd', 15]],
    lanzaconfeti: [['area', 20]], banhammer_oro: [['dmg', 25]], cuernos: [['hp', 15]], gorra_reves: [['speed', 10]], corona_carton: [['hp', 10], ['dmg', 10]],
    casco_vr: [['dmg', 18], ['hp', -10]], gorro_aluminio: [['armor', 10], ['hp', 10]], orejas_gato: [['armor', 12]], auriculares: [['armor', 10], ['hp', 15]],
    cofre: [['crit', 8], ['xp', 8]], bebida_xxl: [['speed', 8], ['cd', 6]], taza: [['regen', 0.6]], pase_caducado: [['dmg', 3], ['hp', 3], ['speed', 3]], almohada: [['revive', 25]], disco_fisico: [['hp', 18]], silla_gamer: [['armor', 15]],
    alfombrilla: [['regen', 1]], boton_pausa: [['revive', 50]], diploma: [['dmg', 8], ['hp', 8]], corbata_ceo: [['dmg', 15], ['hp', 15], ['speed', 10]],
    zanahoria_oro: [['dmg', 22], ['cd', 10]], corona_huesos: [['hp', 22], ['regen', 0.8]], microfono_oro: [['dmg', 18], ['regen', 0.5]], yelmo_olimpo: [['hp', 20], ['armor', 14]],
    nucleo_plasma: [['armor', 20], ['dmg', 15]], gafas_pixel: [['crit', 22], ['speed', 15]], raton_campeon: [['cd', 22], ['area', 25]], cartucho_dorado: [['hp', 15], ['dmg', 15]],
    claqueta_oro: [['dmg', 18], ['area', 20]],
  },
};
