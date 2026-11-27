// Fans of Pop · qué enseña un botón de la barra de ayudas de la partida y qué hace al tocarlo (tarea 437, Pepins): en la partida no
// se ve ningún precio. Con alguna, su número; a 0, un «+», y al tocarlo se para la partida y sale la ventanita de comprar esa ayuda
// (js/ayuda-compra.js), con el precio. Gratis (la lupa de Lola, los compañeros de duelo), GRATIS y se usa. Sin DOM ni SAVE.
'use strict';
const PP_AYUDA_BOTON = {
  // { gratis, tengo } → { marca: 'gratis' | 'mas' | 'numero', n } — lo que lleva la pastilla del botón
  marca({ gratis = false, tengo = 0 } = {}) {
    if (gratis) return { marca: 'gratis', n: 0 };
    return tengo > 0 ? { marca: 'numero', n: tengo } : { marca: 'mas', n: 0 };
  },
  // { gratis, tengo } → 'usar' | 'comprar' — qué hace al tocarlo
  alPulsar({ gratis = false, tengo = 0 } = {}) {
    return gratis || tengo > 0 ? 'usar' : 'comprar';
  },
};
