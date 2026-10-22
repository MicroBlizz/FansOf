// Fans Of Decks · Objetos (del catálogo de la serie, con su efecto en Decks), meriendas y correos internos del acto 1.
// Un objeto es { nombre, rar, mini (su dibujo de la serie), texto, ...efecto }; el combate pregunta dcObjeto('clave') y lee el efecto que le toque.
'use strict';
const DC_OBJETOS = {
  taza: { nombre: 'Taza del becario', mini: 'taza', rar: 'basic', texto: '+1 CAOS en el primer turno de cada reunión.', caosTurno1: 1 },
  teclado: { nombre: 'Teclado mecánico RGB', mini: 'teclado_rgb', rar: 'epic', texto: 'Tus empleados pegan +1.', tropaDano: 1 },
  mochila: { nombre: 'Mochila con ruedas', mini: 'mochila_ruedas', rar: 'common', texto: 'Robas una carta más al empezar cada reunión.', manoInicial: 1 },
  pausa: { nombre: 'Botón de pausa', mini: 'boton_pausa', rar: 'epic', texto: 'La hora de cierre llega un turno más tarde.', cierre: 1 },
  almohada: { nombre: 'Almohada de viaje', mini: 'almohada', rar: 'rare', texto: 'Te curas 6 al acabar cada reunión.', trasReunion: 6 },
  gorra: { nombre: 'Gorra del revés', mini: 'gorra_reves', rar: 'common', texto: 'El primer ataque de cada reunión pega +4.', primerAtaque: 4 },
  llavero: { nombre: 'Llavero de la suerte', mini: 'llavero_suerte', rar: 'common', texto: 'Las ofertas de empleo traen 4 cartas en vez de 3.', oferta: 1 },
  alfombrilla: { nombre: 'Alfombrilla XXL', mini: 'alfombrilla', rar: 'epic', texto: '8 de bloqueo al empezar cada reunión.', bloqueoInicial: 8 },
  // legendarios: solo los da el jefe
  zanahoriaoro: { nombre: 'Zanahoria de oro', mini: 'zanahoria_oro', rar: 'legendary', texto: 'La habilidad de tu líder se carga con 2 de CAOS menos.', carga: 2 },
  cofre: { nombre: 'Cofre de botín sin abrir', mini: 'cofre', rar: 'legendary', texto: 'Al empezar cada reunión juegas gratis una carta al azar de tu mazo.', cartaGratis: 1 },
};
const DC_OBJETOS_POOL = Object.keys(DC_OBJETOS).filter(k => DC_OBJETOS[k].rar !== 'legendary');
// Ventajas fiscales (idea de Arkioner, 18-10-2026): se desbloquean jugando (hito sobre DCP.meta) y se elige UNA al empezar la partida; vale toda la partida.
// hito: { partidas | reuniones | victorias: n } o null (desde el principio). El efecto se lee con dcVentaja().
const DC_VENTAJAS = {
  desgravacion: { nombre: 'Desgravación', texto: '+5 de bonus por cada reunión ganada.', hito: null, nominas: 5 },
  seguro: { nombre: 'Seguro médico', texto: '+10 de vida máxima.', hito: { partidas: 1 }, vidaMax: 10 },
  deduccion: { nombre: 'Deducción de CAOS', texto: 'Empiezas cada reunión con 1 CAOS extra.', hito: { reuniones: 5 }, caosInicial: 1 },
  pensiones: { nombre: 'Plan de pensiones', texto: 'El Economato te hace un 20 % de descuento.', hito: { partidas: 3 }, descuento: 0.2 },
  objetivos: { nombre: 'Bonus por objetivos', texto: 'La habilidad de tu líder se carga con 1 de CAOS menos.', hito: { victorias: 1 }, carga: 1 },
  horasextra: { nombre: 'Horas extra', texto: 'Robas 1 carta más en el primer turno de cada reunión.', hito: { reuniones: 12 }, manoInicial: 1 },
};
// Meriendas: se usan en tu turno, de un toque. Dos huecos.
const DC_MERIENDAS = {
  energetica: { nombre: 'Bebida energética XXL', mini: 'bebida_xxl', texto: '+2 CAOS este turno.', caos: 2 },
  pipas: { nombre: 'Bolsa de pipas', mini: 'bolsa_pipas', texto: 'Roba 2 cartas.', roba: 2 },
  botiquin: { nombre: 'Botiquín de oficina', texto: 'Te cura 15.', cura: 15 },
};
// Correos internos: título, texto y dos opciones con su riesgo ('seguro' o 'arriesgado') y su efecto.
// Efectos: nominas, vida, vidaMax, carta ('rara' = una carta rara o épica al azar; 'quitar'; 'ascender'; una clave = esa carta), objeto (uno al azar), merienda.
const DC_CORREOS = [
  { id: 'maquina', titulo: 'La máquina de café', texto: 'Lola te escribe: «La máquina del pasillo B se ha quedado abierta. Hay café para todos… y una caja de monedas que nadie vigila».',
    opciones: [{ texto: 'Un café tranquilo', riesgo: 'seguro', fx: { vida: 10 }, det: 'Te curas 10.' }, { texto: 'Llevarte las monedas', riesgo: 'arriesgado', fx: { nominas: 35, vida: -6 }, det: '+35 de bonus, pero te pillan: −6 de vida.' }] },
  { id: 'reunion', titulo: 'Convocatoria: reunión de alineamiento', texto: 'Microblizz te invita a una reunión de dos horas sobre «sinergias transversales». Hay catering.',
    opciones: [{ texto: 'Escaquearse', riesgo: 'seguro', fx: {}, det: 'No pasa nada. Literalmente nada.' }, { texto: 'Ir por el catering', riesgo: 'arriesgado', fx: { nominas: 45, carta: 'cl_reunion' }, det: '+45 de bonus y una cláusula en tu mazo: «Reunión que podía ser un correo».' }] },
  { id: 'lola', titulo: 'Lola en el pasillo', texto: '«Psst. Tengo cinco minutos. ¿Te quito una carta que te sobra o te enseño un truco con una que ya tienes?»',
    opciones: [{ texto: 'Quitar una carta', riesgo: 'seguro', fx: { carta: 'quitar' }, det: 'Eliges una carta y desaparece del mazo.' }, { texto: 'Ascender una carta', riesgo: 'seguro', fx: { carta: 'ascender' }, det: 'Eliges una carta y la mejoras.' }] },
  { id: 'caja', titulo: 'Caja perdida de material', texto: 'En el almacén hay una caja con la etiqueta «NO ABRIR · RR. HH.». Pesa. Suena.',
    opciones: [{ texto: 'Pagar 15 de bonus al bedel', riesgo: 'seguro', fx: { nominas: -15, objeto: true }, det: 'Un objeto al azar por 15 de bonus.' }, { texto: 'Abrirla a lo bruto', riesgo: 'arriesgado', fx: { vida: -10, objeto: true, carta: 'rara' }, det: 'Un objeto y una carta rara, pero la caja muerde: −10 de vida.' }] },
  // Solo con el flag de niveles (campana.js: dcCorreosCap). sube3Baja: tres cartas al azar suben un nivel y la de mayor rareza baja uno (niveles.js: dcSubeTresBajaUna).
  { id: 'ruleta', nivel: true, titulo: 'La rueda de ascensos', texto: 'RR. HH. ha instalado una rueda de la fortuna junto a la fotocopiadora. En cada casilla, un cargo distinto. «Gire sin compromiso», dice el cartel.',
    opciones: [{ texto: 'Un giro tranquilo', riesgo: 'seguro', fx: { ascensoAzar: true }, det: 'Una carta de tu mazo, al azar, sube un nivel.' }, { texto: 'Apostar fuerte', riesgo: 'arriesgado', fx: { sube3Baja: true }, det: 'Tres cartas al azar suben un nivel, pero la de mayor rareza baja uno (al azar si hay varias).' }] },
  { id: 'encuesta', titulo: 'Encuesta de satisfacción', texto: 'Microblizz quiere saber cómo te sientes. Las respuestas son anónimas (tu nombre va en la primera línea).',
    opciones: [{ texto: 'Responder con sinceridad', riesgo: 'arriesgado', fx: { vidaMax: 8, nominas: -20 }, det: '+8 de vida máxima; te descuentan 20 de bonus por «actitud».' }, { texto: 'Poner un 10 en todo', riesgo: 'seguro', fx: { nominas: 25 }, det: '+25 de bonus por «compromiso».' }] },
];
