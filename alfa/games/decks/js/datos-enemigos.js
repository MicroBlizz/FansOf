// Fans Of Decks · Rivales: vida, jugadas y encuentros del mundo 1 (las Oficinas de Microblizz). Core dice quién es cada uno (nombre y dibujo).
// Una jugada: d (daño), n (veces), b (bloqueo), c (cura a todos los suyos), ref (invoca ese rival, refN veces), spam (mete Spam en tu pila de descartes),
// f (gana fuerza), debil (te deja Débil). orden: 'ciclo' (una tras otra), 'azar' (al azar sin repetir la anterior) o 'guion' (cada turno la suya y, al acabar, vuelve a la de `bucle`).
// elite: rival duro; mini: minijefe de fin de día (también elite); jefe: jefe de un acto. Sus encuentros fijos están en campana.js.
'use strict';
// Los radios que drawVector necesita para los pies de los rivales que no salen en datos-cartas.js (los mismos que en Rumble).
Object.assign(CFG.units, { descargabot: { r: 11 }, licenciabot: { r: 13 }, plusbot: { r: 13 }, trollbot: { r: 16 }, stonks: { r: 14 } });
const DC_RIVALES = {
  becario: { arte: 'becario', hp: 13, orden: 'azar', jugadas: [{ d: 5 }, { d: 4 }, { b: 5 }] },
  starbot: { arte: 'starbot', hp: 24, orden: 'ciclo', jugadas: [{ d: 7 }, { d: 3, n: 2 }, { b: 6 }] },
  cajabotin: { arte: 'cajabotin', hp: 34, orden: 'ciclo', jugadas: [{ b: 8, spam: 1 }, { d: 8 }, { d: 5 }] },
  soportebot: { arte: 'soportebot', hp: 22, orden: 'ciclo', jugadas: [{ c: 6 }, { d: 4 }, { debil: 1, d: 2 }] },
  descargabot: { nombre: 'Descarga99', arte: 'descargabot', hp: 26, orden: 'ciclo', jugadas: [{ spam: 1, b: 5 }, { d: 6 }, { d: 4, n: 2 }] },
  trollbot: { nombre: 'TrollBot', arte: 'trollbot', hp: 30, orden: 'ciclo', jugadas: [{ debil: 1, d: 3 }, { d: 9 }, { b: 7 }] },
  licenciabot: { nombre: 'LicenciaBot', arte: 'licenciabot', hp: 28, orden: 'ciclo', jugadas: [{ d: 10 }, { b: 6, f: 1 }, { d: 5, n: 2 }] },
  plusbot: { nombre: 'PayPlus', arte: 'plusbot', hp: 28, orden: 'ciclo', jugadas: [{ f: 2 }, { d: 6, n: 2 }, { c: 5 }] },
  parchebot: { arte: 'parchebot', hp: 60, elite: true, orden: 'ciclo', jugadas: [{ d: 11 }, { b: 10, f: 2 }, { d: 6, n: 2 }] },
  fallen: { arte: 'fallen', hp: 65, elite: true, orden: 'ciclo', jugadas: [{ d: 14 }, { d: 7, n: 2 }, { b: 8 }] },

  // ---- minijefes: uno al final de cada día (de 17:00), con su propio truco ----
  // Lunes · Atención al cliente: se cura y llama a becarios
  m_soporte: { nombre: 'Soporte de nivel 3', arte: 'soportebot', alto: 104, hp: 46, mini: true, elite: true, orden: 'ciclo', jugadas: [{ c: 7 }, { d: 6, debil: 1 }, { ref: 'becario', refN: 1 }, { d: 10 }] },
  // Martes · La actualización pendiente: inunda de Spam
  m_descarga: { nombre: 'Descarga99, la actualización', arte: 'descargabot', alto: 104, hp: 54, mini: true, elite: true, orden: 'ciclo', jugadas: [{ spam: 1, b: 6 }, { d: 8 }, { spam: 2 }, { d: 5, n: 2 }] },
  // Miércoles · Los recortes: golpes cada vez más fuertes
  m_licencia: { nombre: 'LicenciaBot, jefe de recortes', arte: 'licenciabot', alto: 104, hp: 62, mini: true, elite: true, orden: 'ciclo', jugadas: [{ d: 8 }, { d: 5, n: 2 }, { b: 8, f: 1 }, { d: 13 }] },
  // Jueves · El plan de suscripción: se potencia sin parar
  m_plus: { nombre: 'PayPlus, el de las suscripciones', arte: 'plusbot', alto: 104, hp: 70, mini: true, elite: true, orden: 'ciclo', jugadas: [{ f: 2, b: 6 }, { d: 6, n: 2 }, { ref: 'starbot', refN: 1 }, { d: 11 }] },
  // Viernes · La evaluación de desempeño: el robot de RR. HH. que reparte cartas de despido
  survivalbot: { nombre: 'SurvivalBot', arte: 'e_base', alto: 116, hp: 88, mini: true, elite: true, orden: 'guion', jugadas: [{ spam: 2, d: 6 }, { d: 12 }, { ref: 'becario', refN: 2 }, { b: 12, f: 2 }, { d: 7, n: 2 }], bucle: 1 },
  // El lunes del ascenso: el jefe de departamento
  jefedpto: { nombre: 'El jefe de departamento', arte: 'stonks', alto: 124, hp: 170, jefe: true, orden: 'guion', jugadas: [{ b: 12, f: 1 }, { d: 12 }, { ref: 'becario', refN: 2 }, { d: 8, n: 2 }, { debil: 1, d: 7 }, { spam: 2, b: 8 }, { d: 20 }], bucle: 1 },

  // Segunda semana: los minijefes aprietan más
  m_troll: { nombre: 'TrollBot, moderador de reuniones', arte: 'trollbot', alto: 108, hp: 84, mini: true, elite: true, orden: 'ciclo', jugadas: [{ debil: 1, d: 5 }, { d: 9, n: 2 }, { b: 12 }, { spam: 2, d: 6 }] },
  m_stonks: { nombre: 'Stonks, el de las cifras', arte: 'stonks', alto: 108, hp: 92, mini: true, elite: true, orden: 'ciclo', jugadas: [{ f: 2 }, { d: 7, n: 2 }, { b: 8, c: 6 }, { d: 15 }] },
  m_presi: { nombre: 'El presidente de Phony', arte: 'presi', alto: 112, hp: 100, mini: true, elite: true, orden: 'ciclo', jugadas: [{ b: 10, f: 1 }, { d: 10 }, { spam: 1, d: 7 }, { d: 6, n: 3 }] },
  m_prime: { nombre: 'StarBot Prime', arte: 'starbot', alto: 116, hp: 112, mini: true, elite: true, orden: 'guion', jugadas: [{ d: 9 }, { d: 5, n: 3 }, { b: 12, f: 2 }, { ref: 'starbot', refN: 1 }, { d: 16 }], bucle: 0 },
  // El lunes de RR. HH.: el CEO alterna diapositivas (Spam y refuerzos) y recortes (golpes)
  ceo: { nombre: 'El CEO de Microblizz', arte: 'ceo', alto: 130, hp: 260, jefe: true, orden: 'guion', jugadas: [{ b: 14, f: 2 }, { spam: 3 }, { d: 11, n: 2 }, { ref: 'licenciabot', refN: 1 }, { d: 18 }, { debil: 1, spam: 2 }, { d: 8, n: 3 }, { b: 12, c: 8 }, { d: 24 }], bucle: 2 },
};
// Encuentros normales por nivel de dureza (1 = primera semana, 2 = su mitad dura, 3 = segunda semana): cada uno es la lista de rivales (de izquierda a derecha).
const DC_ENCUENTROS = {
  facil: [
    [['becario', 'becario'], ['starbot'], ['becario', 'becario', 'becario']],
    [['starbot', 'becario'], ['soportebot', 'becario'], ['becario', 'becario', 'becario', 'becario']],
    [['starbot', 'becario', 'becario'], ['descargabot', 'becario'], ['soportebot', 'starbot']],
  ],
  normal: [
    [['starbot', 'becario'], ['cajabotin'], ['soportebot', 'becario', 'becario'], ['starbot', 'starbot'], ['cajabotin', 'becario']],
    [['cajabotin', 'starbot'], ['soportebot', 'starbot', 'becario'], ['descargabot', 'starbot'], ['trollbot', 'becario', 'becario'], ['licenciabot', 'starbot']],
    [['cajabotin', 'licenciabot'], ['plusbot', 'trollbot', 'becario'], ['descargabot', 'descargabot', 'starbot'], ['soportebot', 'trollbot', 'licenciabot'], ['cajabotin', 'plusbot', 'becario']],
  ],
  elite: [
    [['parchebot'], ['fallen']],
    [['parchebot', 'becario'], ['fallen', 'becario']],
    [['parchebot', 'descargabot'], ['fallen', 'plusbot']],
  ],
};
// Nóminas que suelta cada tipo de reunión [mín, máx].
const DC_NOMINAS = { facil: [10, 16], normal: [14, 20], elite: [25, 35], minijefe: [40, 50], jefe: [90, 100] };
