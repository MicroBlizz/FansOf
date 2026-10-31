// Fans Of Pets · TEXTOS: las preguntas de la entrevista de trabajo de Lola (docs/pets/diseno.md, «La entrevista de trabajo» y la pregunta
// del ritmo en «Calendario y desbloqueos») y las frases con humor de oficina de cada cuidado. Todo en español; el inglés, en idioma/en-pets.js.
'use strict';
const PT_ENTREVISTA = [
  { p: 'Llega un correo de Microblizz con el asunto URGENTE. ¿Qué haces?', r: ['Lo archivo sin leer', 'Respondo «visto»', 'Lo imprimo y hago un avión', 'Respondo con un GIF'] },
  { p: '¿Qué hay en tu taza de la oficina?', r: ['Café del becario', 'Caos primordial', 'Agua o lo que sea, aquí no se juzga', 'Nada: la taza es decorativa'] },
  { p: 'Phony te cobra por cruzar un puente. ¿Qué haces?', r: ['Lo cruzo a nado', 'Pago con monedas de chocolate', 'Construyo mi propio puente', 'Me quedo a vivir en este lado'] },
  { p: 'IAhorro ha copiado tu trabajo y le ha salido gris y a medias. ¿Qué le dices?', r: ['«Al menos lo ha intentado»', '«Pues ve tú a la reunión del lunes»', 'Le enseño a dibujar con contorno grueso', 'Le cambio la contraseña'] },
  { p: 'La reunión podía haber sido un correo. ¿Cuánto dura?', r: ['Cinco minutos (mentira)', 'Hasta que se acaben las galletas', 'Sigue ahora mismo', '¿Qué reunión?'] },
  { p: 'Lola te enseña un truco de la empresa. ¿Cuál eliges?', r: ['Parecer ocupado con una hoja de cálculo', 'Silenciar el chat de grupo', 'Salir a las 17:59', 'Llevarse los bolígrafos'] },
  { p: 'Elige algo para tu escritorio:', r: ['Una planta que nadie riega', 'Una silla que gira demasiado', 'Una grapadora roja', 'Un cajón lleno de chucherías'] },
  // la del ritmo: la única que cambia algo, y lo dice
  { p: '¿Cómo te gusta trabajar?', ritmo: true, nota: 'Esta sí cuenta: decide lo que dura cada etapa. Si quieres coleccionarlas todas, el rápido; si quieres disfrutar de cada una, el medio o el largo.',
    r: ['A tope, todo para ayer', 'A mi ritmo', 'Sin prisa, que lo bueno se hace esperar'], valores: ['rapido', 'medio', 'largo'] },
];
const PT_LOLA = {
  hola: 'Buenos días. Soy Lola: llevo la tienda desde que Microblizz me despidió. Esto es una entrevista de trabajo. Conteste con sinceridad, o como quiera.',
  fin: 'Gracias. Ya le llamaremos.',
  huevos: 'Ah, sí, casi se me olvida. Le toca cuidar de uno de estos huevos. Son de la empresa: no pregunte de dónde salen.',
  horario: 'Última formalidad: su horario. ¿A qué hora se levanta y a qué hora se acuesta? Le recomiendo poner como hora de despertar la hora a la que usted quiere levantarse.',
};
// las frases de cada cuidado: una al azar cada vez
const PT_FRASES = {
  comer: ['Ñam. Mejor que el catering de la última reunión.', 'Comida de verdad: nada de galletas de la sala de juntas.', 'Se lo ha comido todo y ha dejado el plato como un informe: impecable.', 'Desayuno de trabajo, sin trabajo. El mejor.'],
  beber: ['Glu, glu. Hidratación nivel máquina de café.', 'Ha bebido como quien sale de una reunión de tres horas.', 'Bebe con la pajita, como en la cena de empresa.', 'Agua o lo que sea: aquí no se juzga.'],
  banar: ['Limpia como una mesa el lunes a primera hora.', 'Ha salido del baño oliendo a ambientador de recepción.', 'Ni una mancha. Ni en el expediente.', 'Burbujas por todas partes. Recursos Humanos no lo aprobaría.'],
  dormir: ['A dormir. Si llama alguien, está reunida.', 'Se ha quedado frita como en la formación obligatoria.', 'Modo no molestar activado.'],
  despertar: ['Ya está en pie. Con legañas, pero en pie.', 'Arriba. El correo no se contesta solo.'],
  noche: ['Son horas de dormir. ¿Esto cuenta como horas extra?', 'La has despertado de noche. Bosteza como en la reunión de los viernes.', 'Medio dormida, pero presente. Como en cualquier reunión.'],
  durmiendo: ['Está durmiendo. Las reuniones, mejor mañana.', 'Shhh. Está en su descanso reglamentario.'],
  llena: { comer: 'No tiene hambre: se ha comido hasta el bollo del becario.', beber: 'No tiene sed. Ni de café.', banar: 'Ya está limpísima. Más, y desaparece.' },
  tocar: ['El huevo se mueve un poco. Parece que contesta correos ahí dentro.', 'Toc, toc. Dentro alguien dice «estoy en una llamada».', 'Está calentito. Buena señal.'],
  abrigar: ['Le pones una bufanda al huevo. Se le ve más profesional.', 'Bien abrigado, como en la oficina con el aire acondicionado a tope.'],
  nace: '¡Ha nacido {nombre}! Primer día en la empresa.',
  crecido: '{nombre} ya no es un bebé. El niño llegará en el próximo prototipo: de momento, sigue cuidándola.',
  triste: 'Tiene la cara de un lunes por la mañana. Necesita que la cuides.',
};
const ptFrase = clave => { const l = PT_FRASES[clave]; return tr(Array.isArray(l) ? l[Math.floor(Math.random() * l.length)] : l); };
