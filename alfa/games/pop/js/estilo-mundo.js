// Fans of Pop · ESTILO POR MUNDO (dominio): qué burbujas y qué bandeja tiene cada mundo (tarea #110). La muestra es la Pastelería:
// burbujas de macaron sobre un tablero de galleta. Todo son datos congelados y funciones puras (sin reloj, azar, SAVE ni dibujo): el
// dibujo lo hacen pintar.js y bandeja.js. Lo único de fuera del dominio es ppEstiloActivo(), que pregunta el flag 'estilo-mundo'.
'use strict';
// Por índice del mundo en PP_MUNDOS (niveles.js): 1 = Pastelería. Un mundo sin entrada se pinta como siempre.
const PP_ESTILO_MUNDO = Object.freeze({
  1: Object.freeze({
    burbuja: 'macaron',
    bandeja: 'tablero-galleta',
    // la galleta dorada del tablero
    material: Object.freeze({ relleno: '#e8b46a', borde: '#a8672c', sombra: '#7a4518', adorno: '#fbe3b0' }),
    // los paneles del mundo: crema y marrón (nunca lila ni gris)
    panel: Object.freeze({ fondo: '#fff3d9', borde: '#8a4f22', texto: '#5a2f10' }),
  }),
});
const PP_ESTILO_DEFECTO = Object.freeze({ burbuja: null, bandeja: null, material: null, panel: null });

// El estilo del mundo (su índice en PP_MUNDOS) si está activo y tiene entrada; si no, el de siempre
function ppEstiloDe(mundo, activo) {
  if (activo !== true || !Object.hasOwn(PP_ESTILO_MUNDO, mundo)) return PP_ESTILO_DEFECTO;
  return PP_ESTILO_MUNDO[mundo];
}

// El nombre del dibujo de una burbuja: `estado` es 'arriba', 'abajo' o 'doble'. Sin estilo de burbuja, el de siempre ('b-rosa-arriba').
// La doble aún no tiene dibujo propio en ningún estilo: sale la de siempre.
function ppSpriteDeEstilo(estilo, color, estado) {
  const propia = estilo && estilo.burbuja && estado !== 'doble';
  return (propia ? 'bm-' + estilo.burbuja + '-' : 'b-') + color + '-' + estado;
}

// Fuera del dominio: el flag, preguntado en el momento (cerrado en la web; abierto en el modo dev)
function ppEstiloActivo() {
  return NUCLEO.flag('estilo-mundo', 'Pop: burbujas y bandeja propias de cada mundo (tarea #110)', false);
}
// El estilo del tablero que se está jugando: el de su mundo (T.d.mundo); un tablero sin nivel (portada, duelos) va como siempre
function ppEstiloDeTablero(T) {
  return ppEstiloDe(T && T.d ? T.d.mundo : -1, ppEstiloActivo());
}

// Qué bandeja lleva el tablero (dominio): `idPuesta` es la bandeja que lleva puesta el jugador. Una comprada manda siempre (la
// pagó): 'comprada'. Con la de siempre ('arcoiris') y un mundo con material (la galleta de la Pastelería): 'material'. Si no, null.
function ppBandejaParaTablero(estilo, idPuesta) {
  if (idPuesta && idPuesta !== 'arcoiris') return 'comprada';
  return estilo && estilo.material ? 'material' : null;
}
