// Fans of Pop · RAID, el chat falso en directo (dominio puro, tarea 448, nodo n4; Pepins 28-11-2026: «el chat de Twitch falso de Rumble, pero que
// los usuarios falsos digan cosas monas y guays»). La idea viene del chat de Rumble (games/rumble/js/09a-chat-y-campana.js), pero con gente y
// frases propias de Pop: aquí nadie se mete con nadie. Elige QUIÉN escribe y QUÉ dice según lo que pasa en la raid. Los textos van en español
// (la pantalla los pasa por tr()); su inglés, en idioma/en-raid.js. Los nombres no se traducen. El azar entra por parámetro.
'use strict';
const PP_RAID_CHAT = (() => {
  // nombre y color (nada de lila ni de gris)
  const USUARIOS = Object.freeze([
    ['BurbuFan', '#ff8a2a'], ['Mochi_chan', '#ff5fa8'], ['PlopPlop99', '#2a9df4'], ['NubeDeFresa', '#ff6b7a'], ['GatitoPop', '#12a89d'],
    ['SlimeLover', '#3fae4a'], ['Chuche_7', '#e0a000'], ['LaAbuDelPlop', '#d9567b'], ['Pompita', '#1f8fd6'], ['TeamMenta', '#1aa67a'],
    ['Lola_fan_1', '#ff7a1a'], ['DedoVeloz', '#e8554e'],
  ]);
  const LINEAS = Object.freeze({
    hola: ['¡holaaa, a hacer pop!', 'qué bonito está el tablero hoy', 'buenas, vengo con el dedo descansado', 'hoy cae el CEO, lo noto', 'traigo galletas para todos'],
    ocio: ['qué gustito da cada plop', 'os quiero, equipo', 'este sonido me relaja un montón', 'mi gato también quiere tocar', 'poquito a poco lo vaciamos', 'se va viendo el dibujo de debajo', 'un plop al día alegra la vida', 'qué buen rollo hay aquí', 'yo vengo por las burbujas rosas', 'vamos, que ya queda menos'],
    racha: ['¡qué racha! sigue, sigue', 'ese dedo va con turbo', '¡madre mía qué velocidad!', 'no pares, que estás en racha', 'eso ha sonado a canción'],
    cofre: ['¡COFREEE! qué suerte', 'ooooh, lluvia de monedas', '¡enhorabuena por el cofre!', 'yo quiero uno así', 'el CEO llorando en 3, 2, 1'],
    ajenas: ['¡mirad, hay más gente haciendo pop!', 'no estás solo, equipo', '¡hola al que acaba de llegar!', 'así da gusto, todos a una', 'se oye plop por todas partes'],
    sinToques: ['descansa el dedo, ahora vuelven', 'respira, que el depósito se llena solo', 'momento perfecto para un vasito de agua', 'te guardamos el sitio'],
    premio: ['¡premio nuevo, bravo!', 'te lo has ganado a pulso', '¡qué crack! a por el siguiente', 'aplausos para ese dedo'],
    ceo: ['pobrecito CEO, casi me da pena. Casi', 'CEO, tómate una tila', 'jefe, que solo son burbujas', 'le queda bien el enfado, la verdad'],
    pelea: ['¡ha bajado el CEO! ¡todos a por él!', '¡dadle con cariño!', 'un toquecito de mi parte', '¡ya casi lo tenemos!', 'ánimo, que es el último empujón'],
    vencido: ['¡LO HEMOS CONSEGUIDO!', 'qué equipazo somos', 'abrazo de grupo', 'hasta la raid que viene, os quiero', 'la mejor semana de mi vida'],
  });

  // un mensaje de un tipo: { nombre, color, texto }, o null si el tipo no existe. `recientes` = los últimos textos que salieron (no se repiten
  // si hay otros)
  function elige(tipo, azar, recientes = []) {
    const lista = LINEAS[tipo];
    if (!lista) return null;
    const libres = lista.filter(t => !recientes.includes(t));
    const de = libres.length ? libres : lista;
    const [nombre, color] = USUARIOS[Math.min(USUARIOS.length - 1, Math.floor(azar() * USUARIOS.length))];
    return Object.freeze({ nombre, color, texto: de[Math.min(de.length - 1, Math.floor(azar() * de.length))] });
  }
  // los adornos de un mensaje: de 1 a 3 dibujitos de Pop (sobre todo corazones) que van detrás del texto, como emoticonos
  const ADORNOS = Object.freeze(['i-vida', 'i-vida', 'i-vida', 'i-vida', 'fx-estrellita', 'i-estrella', 'i-cereza', 'i-petalo', 'i-burbujas', 'i-perla']);
  function adornos(azar) {
    const n = 1 + Math.min(2, Math.floor(azar() * 3));
    return Array.from({ length: n }, () => ADORNOS[Math.min(ADORNOS.length - 1, Math.floor(azar() * ADORNOS.length))]);
  }
  // apunta un texto en los recientes (como mucho `tope`) y devuelve la lista nueva
  const recuerda = (recientes, texto, tope = 8) => [...recientes, texto].slice(-tope);
  // cada cuánto habla el chat cuando no pasa nada: de 5 a 10 s
  const esperaOcio = azar => 5 + azar() * 5;

  return Object.freeze({ USUARIOS, LINEAS, ADORNOS, elige, adornos, recuerda, esperaOcio });
})();
if (typeof module !== 'undefined') module.exports = PP_RAID_CHAT;
