// Fans of Spy · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración del prototipo: el turno
// (cartas por turno, mano, robar, rebarajar), el agente, los guardias y la cámara (vida, ritmo, pasos y cono de visión), la alerta,
// las cartas (coste, ruido y texto), el mazo de salida y la nota. Las plantas van en js/plantas.js. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'spy',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-spy',    // la clave de la partida en este navegador
};
var SPY = globalThis.SPY || (globalThis.SPY = {});
SPY.congela = function congela(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) congela(o[k]); }
  return o;
};
SPY.AJ = SPY.congela({
  version: '0.2.0',
  // El turno del agente. Cada carta suma su coste al contador del agente: cuanto más gasta, más tarda en volver a jugar.
  turno: {
    cartas: 2,               // cartas por turno (3 más adelante, con nivel)
    mano: 6,                 // tope de cartas en la mano
    manoInicial: 4,          // cartas al empezar la planta
    roba: 2,                 // cartas que se roban al empezar cada turno
    rebarajar: 5,            // coste que suma rebarajar el mazo cuando se acaba (en el original eran 10)
    minimo: 1,               // un turno con cartas cuesta al menos esto
    esperas: 6,              // «esperar» deja actuar a los demás hasta que pase algo que se vea, con este tope de turnos ajenos
    andar: { pasos: 3, coste: 1, ruido: 1 },   // cualquier carta se puede gastar para andar: 3 casillas por 1 de coste, con un poco de ruido
  },
  agentes: {
    bunny: { nombre: 'CrazyBunny', vida: 6, veConos: true, descuento: 'cuerpo', firma: 'zanahoriazo' },   // a CrazyBunny, las cartas de cuerpo a cuerpo le cuestan 1 menos
  },
  // Los guardias son Becarios (robots con taza de café). ritmo = lo que tarda en volver a actuar; pasos = casillas por turno;
  // alcance (casillas) y apertura (grados a cada lado) = su cono de visión; golpe = vida que quita pegado al agente en alerta.
  guardias: {
    becario: { nombre: 'Becario', vida: 2, ritmo: 2, pasos: 2, alcance: 4, apertura: 42, golpe: 2 },
    vigilante: { nombre: 'Vigilante', vida: 3, ritmo: 4, pasos: 2, alcance: 6, apertura: 32, golpe: 2 },
  },
  camara: { nombre: 'Cámara', ritmo: 3, alcance: 4, apertura: 38 },
  // Alerta roja: todos van a por el agente y un contador baja cada turno que el agente acaba sin que nadie lo vea.
  alerta: { turnos: 4, ritmo: 2, pasosExtra: 1, mirar: 2 },   // mirar: turnos que un guardia otea un sitio sospechoso antes de volverse
  cafe: { turnos: 1 },       // turnos que un Becario se para a beberse un café abandonado (mientras bebe no mira)
  familias: {
    movimiento: { nombre: 'Movimiento', corto: 'MOV.', color: '#1F8FE0', fondo: '#BFE4FF' },
    sigilo: { nombre: 'Sigilo', corto: 'SIGILO', color: '#0E9F8A', fondo: '#BDEFE4' },
    ataque: { nombre: 'Ataque', corto: 'ATAQUE', color: '#D8343A', fondo: '#FFD0CC' },
    apoyo: { nombre: 'Apoyo', corto: 'APOYO', color: '#E0780F', fondo: '#FFE0BF' },
  },
  // Las cartas. ruido = radio (casillas) en el que se oye; 0 = silenciosa. cuerpo = cuerpo a cuerpo (la especialidad de CrazyBunny).
  cartas: {
    carrera: { nombre: 'Carrera de pasillo', familia: 'movimiento', coste: 2, ruido: 3, pasos: 5, texto: 'Corres hasta 5 casillas. Hace ruido.' },
    puntillas: { nombre: 'Paso de puntillas', familia: 'movimiento', coste: 1, ruido: 0, pasos: 3, texto: 'Te mueves hasta 3 casillas en silencio.' },
    caja: { nombre: 'Caja de mudanza', familia: 'sigilo', coste: 3, ruido: 0, texto: 'Te metes dentro. Mientras no te muevas, no te ven.' },
    golpe: { nombre: 'Golpe en la pared', familia: 'sigilo', coste: 1, ruido: 0, texto: 'El guardia más cercano viene a mirar dónde has golpeado.' },
    cafe: { nombre: 'Café abandonado', familia: 'sigilo', coste: 2, ruido: 0, texto: 'Dejas un café al lado. El Becario que lo pise se para un turno a bebérselo.' },
    grapadora: { nombre: 'Grapadora', familia: 'ataque', cuerpo: true, coste: 2, ruido: 0, texto: 'Derribas a un guardia tranquilo que tengas pegado y no te esté mirando.' },
    lanzapelotas: { nombre: 'Lanzapelotas antiestrés', familia: 'ataque', coste: 3, ruido: 4, alcance: 4, dano: 2, texto: 'Quitas 2 de vida a un guardia a 4 casillas o menos. Hace mucho ruido.' },
    maquina: { nombre: 'Café de máquina', familia: 'apoyo', coste: 2, ruido: 0, cura: 3, texto: 'Recuperas 3 de vida.' },
    descanso: { nombre: 'Descanso de cinco minutos', familia: 'apoyo', coste: 0, ruido: 0, resta: 3, texto: 'Restas 3 al coste que llevas gastado este turno.' },
    agenda: { nombre: 'Agenda', familia: 'apoyo', coste: 1, ruido: 0, roba: 2, texto: 'Robas 2 cartas.' },
    plano: { nombre: 'Plano de la planta', familia: 'apoyo', coste: 2, ruido: 0, turnos: 2, texto: 'Ves todos los conos durante 2 turnos.' },
    carro: { nombre: 'Carro del correo', familia: 'sigilo', coste: 2, ruido: 0, texto: 'Escondes a un guardia derribado que tengas pegado.' },
    zanahoriazo: { nombre: 'Zanahoriazo', familia: 'ataque', cuerpo: true, firma: 'bunny', coste: 3, ruido: 2, texto: 'Derribas de un golpe a un guardia pegado a ti, esté como esté. Hace ruido.' },
  },
  // El mazo de salida de cada agente: 20 cartas, como mucho 3 copias de cada una. CrazyBunny ve los conos, así que no lleva el Plano.
  mazos: {
    bunny: ['puntillas', 'puntillas', 'puntillas', 'carrera', 'carrera', 'caja', 'caja', 'golpe', 'golpe', 'cafe', 'cafe', 'grapadora', 'grapadora',
      'lanzapelotas', 'maquina', 'descanso', 'agenda', 'carro', 'carro', 'zanahoriazo'],
  },
  // La nota de la planta, de C a S: se parte de 100 puntos y restan las alertas, los guardias derribados que otro encuentra
  // y cada turno por encima del par de la planta. La S pide, además, cero alertas. Los Clips son la moneda ganada.
  nota: {
    alerta: 30, cuerpo: 10, turno: 2,
    cortes: [['S', 90], ['A', 70], ['B', 45], ['C', -Infinity]],
    clips: { S: 60, A: 45, B: 30, C: 15 },
    secreto: 20,             // Clips extra por cada secreto de la planta (el cochazo del CEO)
  },
});
