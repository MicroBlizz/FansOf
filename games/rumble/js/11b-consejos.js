// Fans of Rumble · Consejos de Lola: la primera vez que abres cada modo o pantalla, Lola te cuenta en dos frases cómo va
'use strict';
/* v0.9.91 (elegido por Daniel: tutorial más largo + Lola en cada modo).
   · Solo salen con la partida guiada ya terminada, uno cada vez, y con un botón ¡VALE! que lo da por visto.
   · Lo visto se apunta en SAVE.tips (una marca por consejo). «Sin consejos» los apaga todos (SAVE.tips._off).
   · Las partidas de antes de esta versión no los ven (SAVE.tips._antes, en migrateSave); TUTORIAL en Opciones los vuelve a encender.
   · Usa la burbuja de la partida guiada (#coach): tutTick pinta lo que devuelve consejoWant() cuando no hay paso del tutorial. */
const prepEs = m => curScreen() === 'scr-prep' && !!G.prep && G.prep.mode === m;
const CONSEJOS = [
  { k: 'arena', si: () => prepEs('arena'), sel: '#prep-title', text: 'Esto es la <b>ARENA</b>. Eliges uno de 3 rivales: si ganas, te llevas <b>copas</b>, oro y gemas; si pierdes, te quitan copas. Con más copas subes de liga, de Becario a CEO. Como en una empresa, pero aquí los ascensos existen.' },
  { k: 'quick', si: () => prepEs('quick'), sel: '#diff-row', text: 'En la <b>PARTIDA RÁPIDA</b> juegas cuando quieras, sin campaña. <b>Becario</b> es para practicar, <b>Ejecutivo</b> va en serio y <b>CEO</b> gira la ruleta trucada de Microblizz antes de cada partida… pero paga mucho mejor.' },
  { k: 'boss', si: () => prepEs('boss'), sel: '#prep-title', text: 'En el <b>MODO JEFE</b> te enfrentas una y otra vez a los jefes de la campaña que ya has desbloqueado. Cuanto más daño les haces, más premios. Y no se rinden nunca, como el departamento legal.' },
  { k: 'sala', si: () => prepEs('sandbox'), sel: '#prep-title', text: 'La <b>SALA DE PRUEBAS</b>: CAOS infinito, las torres no se caen y tú eliges qué enemigos salen. No da premios: es para probar mazos, hechizos y habilidades sin miedo a perder.' },
  { k: 'pvp', si: () => curScreen() === 'scr-pvp', sel: '#scr-pvp .h2', text: 'Aquí juegas contra <b>personas de verdad</b>. Microblizz lo llama «contenido generado por los usuarios», y no te paga. Gana para subir en la clasificación.' },
  { k: 'bib', si: () => curScreen() === 'scr-bib', sel: '#scr-bib .h2', text: 'La <b>BIBLIOTECA</b>: todas las cartas, habilidades y objetos del juego, también los que aún no tienes. Mira qué hace cada cosa antes de gastarte las gemas.' },
  { k: 'inv', si: () => curScreen() === 'scr-inv', sel: '#scr-inv .h2', text: 'Tu <b>INVENTARIO</b>: todas tus habilidades y objetos. Cada copia sale con su <b>calidad</b>, de Becario a CEO. Las que no te sirvan, despídelas a cambio de oro. Microblizz lo hace con personas.' },
  // v0.9.92: el pase nuevo, el pase PvP y el armario. nuevo: también los ven las partidas de antes (a ellos es a quien más les cambia)
  { k: 'pass2', nuevo: true, si: () => curScreen() === 'scr-pass' && passTab === 't', sel: '#scr-pass .h2', text: 'Microblizz ha relanzado el <b>PASE</b>: ahora tiene <b>50 niveles</b> y fecha de caducidad, como los yogures. Cada 5 niveles hay un premio con <b>estrella</b>: marcos y títulos para tu <b>armario</b>. Ah, y todos empezamos de cero. «Por justicia», dicen.' },
  { k: 'passpvp', nuevo: true, si: () => curScreen() === 'scr-pass' && passTab === 'p', sel: '#pass-top .pass-tab.pt-p', text: 'El <b>PASE PVP</b> solo sube jugando contra personas: <b>+40</b> por partida y <b>+100</b> si ganas. Sus premios son solo para presumir, porque aquí gana el que mejor juega. Microblizz no soportaba no cobrar nada, así que se inventó el <b>Pase del Pase</b>.' },
  { k: 'armario', nuevo: true, si: () => curScreen() === 'scr-armario', sel: '#scr-armario .h2', text: 'Tu <b>ARMARIO</b>: marcos para tu cara y títulos para debajo de tu nombre. No dan ni un punto de vida, pero hay que tener estilo hasta en el paro. Se ganan en los pases: toca uno para ponértelo.' },
  { k: 'shop', si: () => curScreen() === 'scr-shop', sel: '#scr-shop .h2', text: 'La <b>TIENDA</b>. Aquí tienes un <b>regalo gratis cada día</b>: no te lo dejes. Lo demás te lo explica mejor Microblizz con tu tarjeta de crédito.' },
  { k: 'salon', si: () => curScreen() === 'scr-salon', sel: '#scr-salon .h2', text: 'El <b>SALÓN DE LA FAMA</b>: los mejores fans del mundo en estrellas de campaña, en poder y en copas PvP. Lo cuenta todo el servidor, así que aquí no se sube pagando… de momento.' },
  { k: 'ruleta', si: () => curScreen() === 'scr-roulette', sel: '#btn-rl', text: 'La <b>RULETA</b> de Microblizz decide antes de jugar un castigo para ti, una ventaja para la CPU o las dos. Trucada, por supuesto. A cambio, el premio es mucho mayor.' },
];
function consejoWant() {
  const T = SAVE.tips; if (!SAVE.tut.done || G.autoplay || !T || T._off) return null;
  const c = CONSEJOS.find(x => !T[x.k] && (!T._antes || x.nuevo) && x.si()); if (!c) return null;
  return { sel: c.sel, text: c.text, ok: '¡VALE!', go: () => { T[c.k] = 1; saveGame(); }, skip: ['Sin consejos', consejosFuera] };
}
function consejosFuera() { play('select'); SAVE.tips._off = 1; saveGame(); coachKey = '-'; tutTick(); toast('Lola ya no dará consejos. Puedes volver a verlos con TUTORIAL, en Opciones', true); }
