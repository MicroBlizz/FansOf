// Fans of Pop · ESTILO POR MUNDO (dominio): qué burbujas y qué bandeja tiene cada mundo (tarea #110). La muestra es la Pastelería:
// burbujas de macaron sobre un tablero de galleta; la Heladería, bolas de helado sobre vainilla; el Jardín prueba el botón de silicona con caritas variadas. Todo son datos congelados y funciones puras (sin reloj, azar, SAVE ni dibujo): el
// dibujo lo hacen pintar.js y bandeja.js. Lo único de fuera del dominio es ppEstiloActivo(), que pregunta el flag 'estilo-mundo'.
'use strict';
// Por índice del mundo en PP_MUNDOS (datos en js/regiones/): 0 = Jardín, 1 = Pastelería, 2 = Heladería. Un mundo sin entrada se pinta como siempre.
// `caritas`: dónde va la cara ('tapa' del macaron, visto de lado; 'centro' del botón, visto desde arriba) y si cada burbuja lleva
// una cara distinta (js/caritas-variadas.js) o todas la misma; `tintaPulsada`, el color claro de la cara sobre el botón pulsado;
// `propia`, que el dibujo de la burbuja ya trae su cara y el juego no pinta ninguna encima.
const PP_ESTILO_MUNDO = Object.freeze({
  // la muestra del botón de silicona con carita (Daniel, 19-11-2026): cambia la burbuja y la bandeja gana relieve de molde
  // (`relieve`, js/bandeja-relieve.js); los colores de la bandeja y los paneles, los de siempre
  0: Object.freeze({ burbuja: 'boton', bandeja: null, material: null, panel: null, caritas: Object.freeze({ sitio: 'centro', variadas: true, tintaPulsada: '#ffeef3' }), relieve: true }),
  1: Object.freeze({
    burbuja: 'macaron',
    bandeja: 'tablero-galleta',
    // la galleta dorada del tablero
    material: Object.freeze({ relleno: '#e8b46a', borde: '#a8672c', sombra: '#7a4518', adorno: '#fbe3b0' }),
    // los paneles del mundo: crema y marrón (nunca lila ni gris)
    panel: Object.freeze({ fondo: '#fff3d9', borde: '#8a4f22', texto: '#5a2f10' }),
    // el macaron que eligió Pepins (22-11-2026) ya trae su carita dibujada por Yoshi: el juego no le pinta otra (`propia`)
    caritas: Object.freeze({ propia: true }), relieve: false,
  }),
  // fase 2 (ADR 153): la bola de helado de fresa con sprinkles que eligió Pepins (25-11-2026), que también trae su carita
  2: Object.freeze({
    burbuja: 'helado',
    bandeja: 'tablero-vainilla',
    // el helado de vainilla, con sus motitas (los puntitos del borde) y el tostado de barquillo: contrasta con el fondo menta del mundo
    material: Object.freeze({ relleno: '#fbe6b2', borde: '#b98545', sombra: '#7d5424', adorno: '#fff8e4' }),
    // los paneles, menta: crema de menta con borde y texto verde oscuro (nunca lila ni gris)
    panel: Object.freeze({ fondo: '#eefaf3', borde: '#2f8c6e', texto: '#1d5a46' }),
    caritas: Object.freeze({ propia: true }), relieve: false,
  }),
});
const PP_ESTILO_DEFECTO = Object.freeze({ burbuja: null, bandeja: null, material: null, panel: null, caritas: null, relieve: false });

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
// pagó): 'comprada'. Con la de siempre ('arcoiris') y un mundo con material (la galleta de la Pastelería): 'material'; con uno que pide relieve (el Jardín): 'relieve'. Si no, null.
function ppBandejaParaTablero(estilo, idPuesta) {
  if (idPuesta && idPuesta !== 'arcoiris') return 'comprada';
  if (estilo && estilo.material) return 'material';
  return estilo && estilo.relieve ? 'relieve' : null;   // con relieve, también el tablero cuadrado se dibuja (no vale la foto plana)
}
