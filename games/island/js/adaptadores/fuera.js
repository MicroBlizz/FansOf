// Fans of Island · adaptadores/fuera: el ÚNICO sitio donde Island llama a las funciones globales de core (sonido, música y volumen). El
// resto del juego pide IS.fuera.play(...), IS.fuera.musicSet(...)… y así sabemos de qué depende. Se leen al llamar, no al cargar. Los
// textos siguen con tr('…') en cada pantalla: herramientas/idioma.py busca esas llamadas por su nombre para comprobar las traducciones.
'use strict';
IS.fuera = Object.freeze({
  play: nombre => play(nombre),
  audioInit: () => audioInit(),
  musicSet: nombre => musicSet(nombre),
  aplicaVolumen: () => applyVolume(),
});
