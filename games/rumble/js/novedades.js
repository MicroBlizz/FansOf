// Fans of Rumble · Novedades: el informe de cada versión, la más nueva primero.
// real: lo nuevo de verdad · joke: las «notas» de Microblizz. La primera entrada es la que ve el jugador al abrir el juego después de actualizarse.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.9.33', real: [
      '<b>MENÚ</b>: colores más ordenados. Naranja para jugar, violeta para los modos de juego y dorado para conseguir cosas (gashapón y tienda). Los iconos de abajo, todos en dorado.'],
    joke: ['Microblizz ha contratado a un consultor de color. Cobró por decir «menos colores».'] },
  { v: '0.9.32', real: [
      '<b>INGLÉS</b>: las descripciones de habilidades y objetos ya salen enteras en inglés (antes se quedaban trozos en español).'],
    joke: ['Microblizz ha despedido al becario de traducción. Lo ha sustituido otro becario.'] },
  { v: '0.9.31', real: [
      '<b>BIBLIOTECA</b>: un botón nuevo en el menú con todas las habilidades y objetos del juego. Ves de un vistazo cuáles tienes (y cuántas copias), cuáles te faltan y qué hace cada uno. Puedes filtrar por «Lo tengo» y «Me falta».'],
    joke: ['Microblizz ha catalogado todo lo que no te va a tocar en el gashapón. Es una lista larga.'] },
  { v: '0.9.30', real: [
      '<b>CUENTA</b>: tu progreso se guarda ahora también en la nube, sin que tengas que hacer nada. En Opciones → Cuenta puedes guardarlo con tu email (sin contraseña) para no perderlo y seguir jugando en otro móvil o PC.',
      'Si juegas en dos aparatos y las dos partidas cambian, el juego te pregunta con cuál sigues.'],
    joke: ['Microblizz guarda tu partida en «la nube». Por lo visto, la nube es el ordenador de otro.'] },
  { v: '0.9.29.1',
    real: ['<b>ARREGLADO</b>: al subir de nivel a tu líder (o a cualquier carta), en la partida seguía saliendo el nivel antiguo hasta que cerrabas el juego y volvías a entrar. Ahora se ve el nivel nuevo al momento.'],
    joke: ['Microblizz jura que tu líder siempre fue nivel 2 «en espíritu».'], },
  { v: '0.9.29',
    real: ['<b>IDIOMAS</b>: el juego está ahora en español y en inglés. Se elige solo según el idioma de tu navegador y puedes cambiarlo en Opciones (Idioma / Language).',
      'El inglés cubre los menús, las cartas, el chat de las partidas, las misiones y los logros. Si ves algo que sigue en español, ya lo sabemos.'],
    joke: ['Microblizz ha descubierto que existen más idiomas y quiere cobrarte la traducción.', 'Phony lo llama «localización premium». Tú, «por fin».'], },
  { v: '0.9.28',
    real: ['<b>HORAS EXTRA</b> (0.9.28): cada líder hace ahora su propio especial. NecroLord invoca esqueletos, CyberMarine llama a sus drones, el Vikingo levanta su muro de escudos… Antes todos saltaban como CrazyBunny.',
      '<b>¡YA HAY APP DE ANDROID!</b> (de prueba). En la app, el botón ATRÁS del móvil pausa la partida, cierra ventanas y vuelve al menú.',
      '<b>TU PERFIL</b>: Lola te pregunta cómo te llamas. Tu nombre sale en la Arena, en el chat de las partidas y en los mensajes de Lola.',
      'Toca tu avatar arriba a la izquierda del menú para ver tus números (Arena, copas, estrellas, logros…), cambiar el nombre o elegir avatar entre los líderes de tus facciones.',
      '<b>Golpes con más jugo</b> (0.9.24) y opción de <b>Temblor de pantalla SÍ/NO</b> en Opciones (0.9.25).'],
    joke: ['Microblizz quería cobrarte 9,99 € por cambiar de nombre. Lola dijo que no.', 'El chat ya sabe cómo te llamas. El CEO de Microblizz, también.', 'IAhorro ha intentado llamarse como tú. Le salió «Usuario_7714».'], },
];
