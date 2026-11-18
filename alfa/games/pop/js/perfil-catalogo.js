// Fans of Pop · CATÁLOGO DEL PERFIL DE JUGADOR (tarea #41, ADR 130): qué se puede elegir para lucir en el VS. Solo datos.
// Los precios en perlas por tipo están en PP_CFG.perfil (js/ajustes.js); las reglas, en js/perfil.js; el dibujo, en js/pintar-perfil.js.
// `serie: true` = viene gratis con el juego (Pepins, 17-11-2026: Lola, un marco sencillo, una frase, un título, una pegatina y el fondo
// del Jardín; el efecto y la entrada normales). Los personajes son los amigos rescatables (PP_SLIME_IDS): gratis si ya lo rescataste.
// Mientras Yoshi no pinte el arte nuevo, los marcos, efectos y entradas se dibujan por código y las pegatinas usan los flotantes (f-*).
'use strict';
const PP_PERFIL_CAT = Object.freeze({
  marco: [
    { id: 'sencillo', nombre: 'Sencillo', colores: ['#ffffff', '#ffd1ec'], serie: true },
    { id: 'flores', nombre: 'Flores', colores: ['#ffe3f1', '#ff8cc6'], adorno: 'flor' },
    { id: 'corazones', nombre: 'Corazones', colores: ['#ffd9e2', '#ff5d8f'], adorno: 'corazon' },
    { id: 'estrellas', nombre: 'Estrellas', colores: ['#fff4c4', '#ffc22e'], adorno: 'estrella' },
    { id: 'menta', nombre: 'Menta', colores: ['#d9fff0', '#3fcf98'], adorno: 'punto' },
    { id: 'arcoiris', nombre: 'Arcoíris', colores: ['#ff8a8a', '#ffd166', '#7be0a0', '#7ec8ff', '#ff9ad5'], adorno: 'arcoiris' },
    { id: 'perlas', nombre: 'Perlas', colores: ['#fff8fc', '#e8c9ff'], adorno: 'perla' },
  ],
  frase: [
    { id: 'hola', texto: '¡A por todas!', serie: true },
    { id: 'plop', texto: '¡Plop, plop, plop!' },
    { id: 'suerte', texto: '¡Que gane la más mona!' },
    { id: 'calma', texto: 'Respira y haz pop.' },
    { id: 'reto', texto: '¿Seguro que quieres jugar?' },
    { id: 'merienda', texto: 'Juego y me voy a merendar.' },
    { id: 'capibara', texto: 'Hoy vengo en modo capibara.' },
  ],
  titulo: [
    { id: 'aprendiz', texto: 'Aprendiz de pop', serie: true },
    { id: 'burbujas', texto: 'Experta en burbujas' },
    { id: 'jefa', texto: 'Jefa del pop-it' },
    { id: 'nube', texto: 'Cabeza en las nubes' },
    { id: 'dulce', texto: 'Pura chuche' },
    { id: 'imparable', texto: 'Imparable' },
  ],
  pegatina: [
    { id: 'corazon', img: 'f-corazon', serie: true },
    { id: 'unicornio', img: 'f-unicornio' }, { id: 'capibara', img: 'f-capibara' }, { id: 'arcoiris', img: 'f-arcoiris' },
    { id: 'gatito', img: 'f-gatito' }, { id: 'conejito', img: 'f-conejito' }, { id: 'cupcake', img: 'f-cupcake' },
    { id: 'helado', img: 'f-helado' }, { id: 'donut', img: 'f-donut' }, { id: 'piruleta', img: 'f-piruleta' },
  ],
  efecto: [
    { id: 'normal', nombre: 'Normal', serie: true },
    { id: 'corazones', nombre: 'Corazones', color: '#ff5d8f' },
    { id: 'estrellas', nombre: 'Estrellas', color: '#ffc22e' },
    { id: 'confeti', nombre: 'Confeti', color: '#7ec8ff' },
    { id: 'burbujitas', nombre: 'Burbujitas', color: '#9fe8ff' },
  ],
  fondo: [
    { id: 'jardin', img: 'fondo-jardin', serie: true },
    { id: 'pasteleria', img: 'fondo-pasteleria' }, { id: 'heladeria', img: 'fondo-heladeria' }, { id: 'playa', img: 'fondo-playa' },
    { id: 'feria', img: 'fondo-feria' }, { id: 'nubes', img: 'fondo-nubes' }, { id: 'bosque', img: 'fondo-bosque' },
    { id: 'mar', img: 'fondo-mar' }, { id: 'sakura', img: 'fondo-sakura' }, { id: 'espacio', img: 'fondo-espacio' },
  ],
  entrada: [
    { id: 'normal', nombre: 'Normal', serie: true },
    { id: 'salto', nombre: 'De un salto' },
    { id: 'giro', nombre: 'Girando' },
    { id: 'nube', nombre: 'En una nube' },
  ],
});
