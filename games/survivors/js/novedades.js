// Fans of Survivors · Novedades: el informe de cada versión, la más nueva primero. La página de entrada (index.html de la raíz) lo lee.
// La versión que se publica se escribe en index.html (…/core/js/nucleo.js?v=…); aquí, `v` dice a qué versión corresponde cada informe.
'use strict';
const NEWS = [
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
