// Fans of Survivors · Novedades: el informe de cada versión, la más nueva primero. La página de entrada (index.html de la raíz) lo lee.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
  { v: '0.1.29', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.28', real: ['<b>MINIATURAS NUEVAS</b>: cada habilidad y cada objeto tiene ahora su propio dibujo, en lugar de dos letras o del mismo icono para todos. El fondo lleva el color de su rareza, y las Épicas y Legendarias brillan con rayos de luz. Las verás en la Biblioteca, el inventario y el gashapón.'], joke: ['Microblizz ha encargado 75 dibujos nuevos. Al ilustrador le ha pagado en «visibilidad».'] },
  { v: '0.1.27', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.26', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.25', real: ['<b>MEJORAS POR DENTRO</b>: cambios en los sistemas comunes de la serie. No notarás nada… y eso es buena señal.'], joke: [] },
  { v: '0.1.24', real: ['<b>MEJORAS POR DENTRO</b>: el pase ya sabe dar frases y emoticonos, que estrenan los Animales Locos en Fans of Rumble. Aquí no cambia nada… de momento.'],
    joke: ['Microblizz ha descubierto que puede vender frases hechas. Ha mandado a todo el departamento de marketing a buscar más.'] },
  { v: '0.1.23', real: [
      '<b>CADA LÍDER CON SU ARMA</b>: cada líder empieza con un arma propia: espadazos en abanico, manos que salen del suelo, un foco giratorio, una torreta, una carta al azar, combos, un hacha que vuelve como un bumerán y una claqueta que atrae a los enemigos.'],
    joke: ['Microblizz ha dado un arma distinta a cada líder. Dice que es «diversidad». Contabilidad dice que es «ocho veces más caro».'] },
  { v: '0.1.22', real: [
      '<b>COFRES MUCHO MÁS ÉPICOS</b>: cámara lenta y rayo de luz al pisarlo, mejoras con rareza (común, rara, épica y legendaria), falsos finales, un chat que se vuelve loco y, de vez en cuando, un susto: el cofre se atasca… y luego da el doble. Y con mucha suerte salen 5 mejoras: ¡cofres dentro del cofre, fuegos artificiales y SurvivalBot muerto de miedo!',
      '<b>CAJAS ROMPIBLES CON TODAS LAS FACCIONES</b>: las armas de las facciones nuevas por fin rompen las cajas del campo.'],
    joke: ['Microblizz asegura que el suspense «es gratis». Se ha quedado mirando el cofre media hora.'] },
  { v: '0.1.21', real: [
      '<b>8 FACCIONES NUEVAS</b>: ya puedes jugar con No-Muertos, Streamers, Héroes, Ciberpunks, Memes, Comunidad Gamer, Olvidados y Cultura Pop, cada una con 8 armas propias. Se eligen bajo JUGAR y se abren aguantando minutos en total (10, 30, 60, 100, 150, 210, 280 y 360).',
      '<b>COFRES CON SUSPENSE</b>: el cofre ahora se abre por fases. Sale una mejora, la música se acelera… ¿y habrá otra? Con un poco de suerte extra, ¡te da 5!'],
    joke: ['Microblizz ha repartido facciones como quien reparte folletos. Y ha acelerado la música «para generar expectación».'] },
  { v: '0.1.20', real: [
      '<b>COFRES DE ESPECTÁCULO</b>: ya no son una subida de nivel cualquiera. Cada cofre mejora al azar entre 1 y 3 cosas de las que ya tienes: con una, entrega épica; con dos, doble premio; con tres, ¡un 777 de tragaperras con todo!',
      '<b>CAJAS ROMPIBLES</b>: las cajas del mapa ahora se rompen y dan oro (y, con muy poca suerte, un objeto).',
      'Los shiny salen ahora con más calma: una tirada por grupo en vez de por enemigo.'],
    joke: ['Microblizz asegura que el 777 está «auditado». Por un becario con un dado.'] },
  { v: '0.1.19', real: ['<b>MINI JEFES</b>: cada 2 minutos sale un mini jefe, y al caer suelta un cofre.', '<b>BICHOS SHINY</b>: de vez en cuando sale un bicho brillante (más duro, con más experiencia y con cofre), y al menos uno cada 3 minutos.'],
    joke: ['Microblizz ha puesto purpurina a sus empleados. Dice que ahora cobran más y pegan más.'] },
  { v: '0.1.18', real: ['<b>PVP VUELVE A SU NOMBRE</b>: ajustes de textos en español.'],
    joke: ['Microblizz ha deshecho el cambio de una sigla. Dice que ya estaba acostumbrado.'] },
  { v: '0.1.17', real: ['<b>MENOS TECNICISMOS</b>: repasados textos en español para que se entiendan mejor.'],
    joke: ['Microblizz ha quitado una sigla. Dice que la nota del cambio es más larga que el cambio.'] },
  { v: '0.1.16', real: ['<b>MÁS TEXTOS EN INGLÉS</b>: hemos repasado y traducido textos que se habían quedado sin traducir.'],
    joke: ['Microblizz ha descubierto que el inglés también existe. Está muy orgulloso.'] },
  { v: '0.1.15', real: ['<b>INICIAR SESIÓN, MÁS FÁCIL</b>: el menú tiene un botón «Iniciar sesión / crear cuenta» para guardar tu progreso con Google o con tu email.'],
    joke: ['Microblizz ha puesto un cartel de «Entrada» en la puerta. Antes había que adivinar dónde estaba.'] },
  { v: '0.1.14', real: [
      '<b>PASE CON ASPECTO NUEVO</b>: el pase tiene un diseño renovado y pasa a funcionar como en Rumble.'],
    joke: ['Microblizz ha pintado el pase de otro color y lo llama «rediseño».'] },
  { v: '0.1.13', real: [
      '<b>SESIÓN MÁS ESTABLE</b>: arreglado el error «invalid refresh token» que a veces te sacaba de la cuenta.'],
    joke: ['Microblizz asegura que la sesión ahora es de las que no se cae. Ya lo dijo del puente.'] },
  { v: '0.1.12', real: [
      '<b>ENTRA CON GOOGLE</b>: ya puedes guardar tu progreso con tu cuenta de Google (Opciones → Cuenta). Ahora está en pruebas: escribe a fansofmicroblizz@gmail.com con tu correo de Google y te añadimos a mano.'],
    joke: ['Microblizz se compromete a abrir el acceso con Google a todo el mundo en menos de un año. Tiene la firma de un becario.'] },
  { v: '0.1.2', real: [
      '<b>TU PROGRESO, A SALVO EN LA NUBE</b>: con cuenta, el gashapón, los premios, las misiones y el pase los comprueba el servidor, como en el Rumble y el TD. Para tirar, despedir o mejorar necesitas conexión.'],
    joke: ['Microblizz asegura que el servidor cuenta las monedas «con muchísimo cariño».'] },
  { v: '0.1.0', real: [
      '<b>PRIMER PROTOTIPO</b>: CrazyBunny contra toda la plantilla de Microblizz y Phony. Muévete, que tus cartas disparan solas.',
      '<b>8 armas</b> (las cartas de Animales Locos: Zanahorias, Chaos Jump, MadSquirrel, BoomBeaver, SlyFox, MeerCat, JunkCoon y MechaVaca) y <b>8 mejoras</b> (habilidades del gashapón).',
      'Recoge los cristales de <b>CAOS</b> para subir de nivel y elegir 1 de 3 mejoras. Cofres de botín al despedir a los gordos.',
      'Aguanta <b>10 minutos</b> y despide a <b>SurvivalBot</b>.'],
    joke: ['Microblizz confirma que esta vez los becarios atacan en grupo. Lo llama «sinergia».'] },
];
