// Fans of Zombies · AJUSTES DE LA CASA Y EL CUERPO (dominio): las cifras de las heridas (ADR 082) y de construir (ADR 084). Se carga antes
// que js/ajustes.js, que las mezcla en ZOM.AJ (así ese archivo no pasa de 25 KB).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
ZOM.AJ_CASA = Object.freeze({
  // LAS HERIDAS (ADR 082, versión «menos dura»): dónde muerden (pesos), qué herida dejan, y de cada herida lo que sangra (vida por hora
  // sin vendar), las horas que tarda en curarse (sin sangrar y sin venda sucia), el riesgo de infección (se mira a la hora) y el dolor.
  // La venda se ensucia a las vendaSucia horas; el corte profundo vendado sangra vendaProfundo (hasta coserlo). Desinfectar en la primera
  // hora multiplica el riesgo por baja (por mordisco, el del mordisco). Ballena: fractura en un brazo o pierna; un choque a más de
  // fracturaChoque m/s rompe una pierna. piernas/brazos: lo que multiplican la velocidad y el golpe con herida, rotos o con tablilla
  cuerpo: {
    dondeMuerden: { brazoI: 3, brazoD: 3, piernaI: 2, piernaD: 2, torso: 2.5, cabeza: 1 }, queHerida: { aranazo: 5, corte: 3, mordisco: 2 }, profundo: 0.25, paraMax: 0.7,
    heridas: {
      aranazo: { n: 'ARAÑAZO', sangra: 1, cura: 6, infecta: 0.07, dolor: 5, paraSolo: 2 },   // deja de sangrar solo a las 2 h
      corte: { n: 'CORTE', sangra: 2.5, cura: 12, infecta: 0.25, dolor: 12 },
      profundo: { n: 'CORTE PROFUNDO', sangra: 5, cura: 24, infecta: 0.25, dolor: 20 },
      mordisco: { n: 'MORDISCO', sangra: 2, cura: 12, infecta: 0.9, dolor: 18 },
      fractura: { n: 'FRACTURA', sangra: 0, cura: 36, infecta: 0, dolor: 30 },
    },
    vendaSucia: 16, vendaProfundo: 0.5, vendaVida: 10, desinfecta: { hora: 1, baja: 0.3, mordisco: 0.85 }, fracturaBallena: 0.25, fracturaChoque: 14, analgesico: 4,
    piernas: { herida: 0.9, rota: 0.6, tablilla: 0.85 }, brazos: { herida: 0.85, rota: 0.5, tablilla: 0.75 }, temblor: 1,
  },
  // CONSTRUIR (ADR 084): cada obra pide un nivel de carpintería, material (con), segundos (tiempo), y si hace falta la mesa de trabajo
  // cerca (mesa) o el martillo (martillo: false = no). muro = los fans la rompen (vida); guarda = casillas que caben; w, d, alto = tamaño.
  // alcance = a cuántos metros de ti se puede poner; camaCerca y mesaCerca, a cuántos metros cuentan; luzAtrae = metros a los que una
  // lámpara encendida de noche atrae a los fans; sueloDuro = lo que recuperas de sueño durmiendo sin cama
  construir: {
    obras: {
      valla: { n: 'VALLA DE MADERA', nivel: 0, con: [['tablas', 1], ['clavos', 2]], tiempo: 2, muro: true, vida: 90, w: 1, d: 0.2, alto: 1.0 },
      caja: { n: 'CAJA', nivel: 0, con: [['tablas', 2], ['clavos', 2]], tiempo: 2.5, guarda: 16, w: 0.9, d: 0.7, alto: 0.7 },
      mesa: { n: 'MESA DE TRABAJO', nivel: 1, con: [['tablas', 4], ['clavos', 4]], tiempo: 3.5, w: 1.4, d: 0.8, alto: 0.9 },
      lampara: { n: 'LÁMPARA', nivel: 0, con: [['lampara', 1]], tiempo: 1, martillo: false, w: 0.4, d: 0.4, alto: 1.5 },
      muro: { n: 'MURO DE MADERA', nivel: 2, con: [['tablas', 3], ['clavos', 4]], tiempo: 4, muro: true, vida: 240, w: 1, d: 0.25, alto: 2.4 },
      cama: { n: 'CAMA', nivel: 2, con: [['tablas', 3], ['clavos', 3], ['tela', 3]], tiempo: 4, mesa: true, w: 1.1, d: 2, alto: 0.6 },
      armario: { n: 'ARMARIO', nivel: 3, con: [['tablas', 4], ['clavos', 4]], tiempo: 4, mesa: true, guarda: 32, w: 1.2, d: 0.6, alto: 1.8 },
    },
    alcance: 2.6, camaCerca: 2.2, mesaCerca: 3, luzAtrae: 22, sueloDuro: 0.7,
  },
});
