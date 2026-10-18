// Fans Of Decks · Rivales: vida, jugadas y encuentros del acto 1 (las Oficinas de Microblizz). Core dice quién es cada uno (nombre y dibujo).
// Una jugada: d (daño), n (veces), b (bloqueo), c (cura a todos los suyos), ref (invoca ese rival, refN veces), spam (mete Spam en tu pila de descartes),
// f (gana fuerza), debil (te deja Débil). orden: 'ciclo' (una tras otra) o 'azar' (al azar sin repetir la anterior). El jefe lleva su guion por turno.
'use strict';
const DC_RIVALES = {
  becario: { arte: 'becario', hp: 13, orden: 'azar', jugadas: [{ d: 5 }, { d: 4 }, { b: 5 }] },
  starbot: { arte: 'starbot', hp: 24, orden: 'ciclo', jugadas: [{ d: 7 }, { d: 3, n: 2 }, { b: 6 }] },
  cajabotin: { arte: 'cajabotin', hp: 34, orden: 'ciclo', jugadas: [{ b: 8, spam: 1 }, { d: 8 }, { d: 5 }] },
  soportebot: { arte: 'soportebot', hp: 22, orden: 'ciclo', jugadas: [{ c: 6 }, { d: 4 }, { debil: 1, d: 2 }] },
  parchebot: { arte: 'parchebot', hp: 60, elite: true, orden: 'ciclo', jugadas: [{ d: 11 }, { b: 10, f: 2 }, { d: 6, n: 2 }] },
  fallen: { arte: 'fallen', hp: 65, elite: true, orden: 'ciclo', jugadas: [{ d: 14 }, { d: 7, n: 2 }, { b: 8 }] },
  // SurvivalBot: el robot de RR. HH. que reparte cartas de despido (encima de la sede de Microblizz)
  survivalbot: { nombre: 'SurvivalBot', arte: 'e_base', alto: 120, hp: 120, jefe: true, orden: 'guion', jugadas: [{ spam: 2, d: 6 }, { d: 12 }, { ref: 'becario', refN: 2 }, { b: 12, f: 2 }, { d: 7, n: 2 }], bucle: 1 },
};
// Encuentros por tramo del acto 1: cada uno es la lista de rivales (de izquierda a derecha).
const DC_ENCUENTROS = {
  facil: [['becario', 'becario'], ['starbot'], ['becario', 'becario', 'becario']],
  normal: [['starbot', 'becario'], ['cajabotin'], ['soportebot', 'becario', 'becario'], ['starbot', 'starbot'], ['cajabotin', 'becario']],
  elite: [['parchebot'], ['fallen']],
  jefe: [['survivalbot']],
};
// Nóminas que suelta cada tipo de reunión [mín, máx].
const DC_NOMINAS = { facil: [10, 16], normal: [14, 20], elite: [25, 35], jefe: [90, 100] };
