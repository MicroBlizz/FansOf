// Fans of Panic · Mundos y niveles. TRASFONDO: Microblizz ha comprado la revista ilustrada PANIC! y ha tapado todas sus portadas
// con paneles grises de «Cumplimiento Corporativo» para venderlas después en cajas sorpresa. Tú eres el último becario de
// maquetación, con el cúter en la mano: recorta los paneles y destapa cada ilustración antes de que se acabe el turno. Dentro
// de cada panel patrulla un Inspector (el jefe del mundo) y por los bordes corren los becarios-robot de Microblizz.
// Cada mundo es un departamento al que Microblizz ha mandado a una ilustradora de la revista. Aquí van sus textos, colores,
// el jefe y las cifras de cada nivel (velocidades, becarios, tiempo); las cifras generales están en js/ajustes.js.
'use strict';

const MUNDOS = {
  playa: {
    nombre: 'PLAYA', color: '#1fb6c9', claro: '#8fe9f5', fondo: '#07323b', chica: 'Coral', oficio: 'La socorrista',
    jefe: { nombre: 'Cangrejo Rey', tipo: 'cangrejo', color: '#ff6b4a' },
    intro: 'Microblizz ha comprado la playa para que sus ejecutivos veraneen gratis. Coral sigue vigilando el agua… tapada por un panel gris.',
    niveles: [
      { jefe: 14, becarios: 1, tiempo: 90, tam: 10 },
      { jefe: 17, becarios: 1, tiempo: 80, tam: 10 },
      { jefe: 20, becarios: 2, tiempo: 75, tam: 10 },
      { jefe: 24, becarios: 2, tiempo: 75, tam: 11 },
      { jefe: 28, becarios: 3, tiempo: 70, tam: 12, final: true },
    ],
  },
  oficina: {
    nombre: 'OFICINA', color: '#8f7bff', claro: '#cfc4ff', fondo: '#1b1340', chica: 'Nora', oficio: 'La ejecutiva',
    jefe: { nombre: 'Fotocopiadora Poseída', tipo: 'fotocopiadora', color: '#9aa3b2' },
    intro: 'Nora dirigía la revista. Ahora dirige la planta 12 de la Torre de Microblizz, donde la fotocopiadora escupe hojas de recortes.',
    niveles: [
      { jefe: 18, becarios: 2, tiempo: 80, tam: 10 },
      { jefe: 22, becarios: 2, tiempo: 75, tam: 11 },
      { jefe: 26, becarios: 3, tiempo: 75, tam: 11 },
      { jefe: 30, becarios: 3, tiempo: 70, tam: 12 },
      { jefe: 34, becarios: 4, tiempo: 70, tam: 12, final: true },
    ],
  },
  piscina: {
    nombre: 'PISCINA', color: '#ff5fa2', claro: '#ffb3d6', fondo: '#3a0f2e', chica: 'Dalia', oficio: 'La DJ',
    jefe: { nombre: 'Flamenco Hinchable', tipo: 'flamenco', color: '#ff8ac2' },
    intro: 'La fiesta de la piscina la paga Microblizz, así que Dalia solo puede pinchar el jingle de la empresa. Un flamenco hinchable rebota entre los paneles.',
    niveles: [
      { jefe: 22, becarios: 2, tiempo: 75, tam: 11 },
      { jefe: 26, becarios: 3, tiempo: 75, tam: 11 },
      { jefe: 30, becarios: 3, tiempo: 70, tam: 12 },
      { jefe: 34, becarios: 4, tiempo: 70, tam: 12 },
      { jefe: 38, becarios: 4, tiempo: 65, tam: 13, final: true },
    ],
  },
  gimnasio: {
    nombre: 'GIMNASIO', color: '#5fe88f', claro: '#b6ffd0', fondo: '#0d2e1c', chica: 'Kira', oficio: 'La entrenadora',
    jefe: { nombre: 'Mancuerna Gólem', tipo: 'mancuerna', color: '#7c8a99' },
    intro: 'Microblizz obliga a los becarios a hacer cardio para ahorrar en sillas. Kira los entrena, y una mancuerna gigante embiste todo lo que se mueve.',
    niveles: [
      { jefe: 26, becarios: 3, tiempo: 75, tam: 11 },
      { jefe: 30, becarios: 3, tiempo: 70, tam: 12 },
      { jefe: 34, becarios: 4, tiempo: 70, tam: 12 },
      { jefe: 38, becarios: 4, tiempo: 65, tam: 13 },
      { jefe: 42, becarios: 5, tiempo: 65, tam: 13, final: true },
    ],
  },
  fantasia: {
    nombre: 'FANTASÍA', color: '#c86bff', claro: '#e9c4ff', fondo: '#2a0f3f', chica: 'Elira', oficio: 'La hechicera',
    jefe: { nombre: 'Dragón Mimético', tipo: 'dragon', color: '#b24dff' },
    intro: 'La saga de fantasía de la revista era la más vendida: Microblizz la ha cancelado. Elira sigue dentro, y el dragón cambia de forma en cada panel.',
    niveles: [
      { jefe: 30, becarios: 3, tiempo: 70, tam: 12 },
      { jefe: 34, becarios: 4, tiempo: 70, tam: 12 },
      { jefe: 38, becarios: 4, tiempo: 65, tam: 13 },
      { jefe: 42, becarios: 5, tiempo: 65, tam: 13 },
      { jefe: 46, becarios: 5, tiempo: 60, tam: 14, final: true },
    ],
  },
  espacio: {
    nombre: 'ESPACIO', color: '#5ff2ff', claro: '#c8fbff', fondo: '#070b2e', chica: 'Vega', oficio: 'La capitana',
    jefe: { nombre: 'Kraken Estelar', tipo: 'kraken', color: '#3ad1ff' },
    intro: 'Microblizz ha lanzado su sede al espacio para no pagar impuestos. Vega pilota la nave; el Kraken Estelar barre los paneles con tentáculos de energía.',
    niveles: [
      { jefe: 34, becarios: 4, tiempo: 70, tam: 12 },
      { jefe: 38, becarios: 4, tiempo: 65, tam: 13 },
      { jefe: 42, becarios: 5, tiempo: 65, tam: 13 },
      { jefe: 46, becarios: 5, tiempo: 60, tam: 14 },
      { jefe: 50, becarios: 6, tiempo: 60, tam: 14, final: true },
    ],
  },
};
const ORDEN_MUNDOS = ['playa', 'oficina', 'piscina', 'gimnasio', 'fantasia', 'espacio'];

// las frases de Lola al acabar: cada nivel enseña un trozo de la historia del mundo
const CHARLA = {
  playa: ['El panel decía «Contenido pendiente de revisión». Lo revisaba un cangrejo.', 'Coral dice que el cangrejo lleva corbata desde que lo ascendieron.', 'Microblizz ha puesto una sombrilla con su logo. Sin sombra: la sombra es de pago.', 'Los becarios-robot se oxidan con el agua. Les han dado chalecos salvavidas de cartón.', 'Playa libre. El Cangrejo Rey ha pedido el traslado a la Oficina.'],
  oficina: ['La planta 12 no tiene ventanas. Las ventanas eran un gasto.', 'La fotocopiadora escupe el mismo informe desde 2019.', 'Nora guarda las portadas originales en el cajón de los clips.', 'Hay una reunión que empezó el lunes y nadie se atreve a cerrar.', 'Fotocopiadora apagada. El CEO ha pedido que se vuelva a encender el lunes.'],
  piscina: ['El jingle de Microblizz suena a 140 pulsaciones por minuto. Es ilegal en tres países.', 'El flamenco lo compró el CEO con la tarjeta de empresa.', 'Dalia pincha de espaldas a los paneles para no verlos.', 'Las pelotas de playa llevan un anuncio de cada lado.', 'Fiesta liberada. El flamenco ha salido volando. No se sabe hacia dónde.'],
  gimnasio: ['Las cintas de correr generan la electricidad de la Torre.', 'Kira cuenta las flexiones de los becarios. Los becarios no tienen brazos.', 'La mancuerna pesa lo mismo que las deudas de Microblizz.', 'Hay una báscula que cobra por pesarte.', 'Gimnasio cerrado por fin. Los becarios han pedido una silla.'],
  fantasia: ['La saga tenía 34 tomos. Microblizz los ha fundido en un resumen de dos páginas.', 'El dragón no sabe qué forma tiene porque nadie ha terminado de dibujarlo.', 'Elira guarda un hechizo para devolver a los despedidos.', 'Los fuegos fatuos son becarios con una vela.', 'Saga recuperada. Microblizz ya la ha vuelto a cancelar por si acaso.'],
  espacio: ['La sede espacial no paga impuestos ni oxígeno.', 'El Kraken era el logo de un juego cancelado. Se escapó del cementerio.', 'Vega vuela sin GPS: el GPS es un servicio premium.', 'Los drones son becarios que no cabían en la nave.', 'Panel final recortado. La revista PANIC! vuelve a los quioscos. Microblizz va a por el siguiente.'],
};
