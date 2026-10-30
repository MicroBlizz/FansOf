// Fans of Pop · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración del prototipo:
// los corazones, cuánto mide cada sala, cuántos toques de margen hay, qué slimes existen y qué pasiva tiene cada uno,
// y cómo se reparte la ruta hasta el jefe. Se carga antes de lo común.
'use strict';
const AJUSTES = {
  id: 'pop',                 // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-pop',    // la clave de la partida en este navegador
  // Las dos monedas de la serie (core/js/sistema/monedas.js, ADR 004): Monedas = la ganada (solo jugando, nunca se vende) y
  // PERLAS = la comprada (con euros, como los lingotes de oro de Candy Crush; solo compra cosas a precio fijo, nunca azar). Sin puente.
  monedas: {
    ganada: { id: 'monedas', nombre: 'Monedas', nombre_en: 'Coins', icono: () => '' }, comprada: { id: 'perlas', nombre: 'Perlas', nombre_en: 'Pearls', icono: () => '' },
    ratio: 12, cambio: 0,
    leer: cual => (cual === 'comprada' ? SAVE.perlas : SAVE.monedas) || 0,
    escribir: (cual, n) => { SAVE[cual === 'comprada' ? 'perlas' : 'monedas'] = n; ppGuarda(); },
  },
};

const PP_CFG = {
  vida: 5,                   // corazones; se pierde uno al quedarte sin toques con burbujas sin reventar (o al salir a medias)
  recarga: 30 * 60 * 1000,   // cada cuánto vuelve un corazón (ms), también con el juego cerrado
  precioVidas: 150,          // monedas por llenar los corazones de golpe
  equipo: 4,                 // huecos del equipo de serie
  huecosMax: 6,              // con los comprados (Daniel, 30-10-2026: comprar huecos con monedas, hasta 6, cada uno más caro)
  precioHueco: [400, 800],   // el 5.º y el 6.º hueco
  monedas: { nivel: 10, jefe: 30, estrella: 5 },   // la primera vez que pasas un nivel (o un jefe) y por cada estrella que mejora tu récord
  cofreCada: 15,             // un cofre cada 15 estrellas de récord…
  cofre: [40, 80],           // …con entre 40 y 80 monedas
  cofreJefe: 100,            // y uno grande, de 100, al ganar a un jefe por primera vez
  // fase 3 (30-10-2026, «como Candy Crush»): las PERLAS, la moneda de pago (js/tienda.js). Precios fijos, sin azar.
  perlas: {
    seguir: [9, 15, 20],     // +5 toques al quedarte sin toques: cada vez más caro en el mismo intento
    toquesSeguir: 5,
    vidas: 12,               // llenar los corazones
    hueco: [40, 80],         // el 5.º y el 6.º hueco del equipo (también se pueden pagar con monedas)
    jefe: 3,                 // perlas de regalo al ganar a un jefe por primera vez (la comprada «cae poco a poco jugando»)
  },
  // los paquetes de perlas con euros (PROVISIONALES: los productos aún no existen en Play ni en el servidor; hasta entonces, la
  // ventana de core dice que llegarán con la app). `id` = el producto en Play Console y en servidor/90 cuando se den de alta.
  packs: [
    { id: 'pop_perlas_10', perlas: 10, precio: '0,99 €' },
    { id: 'pop_perlas_50', perlas: 50, precio: '4,49 €', extra: '+10 %' },
    { id: 'pop_perlas_120', perlas: 120, precio: '9,99 €', extra: '+20 %' },
    { id: 'pop_perlas_300', perlas: 300, precio: '21,99 €', extra: '+35 %' },
  ],
  // ver un anuncio (siempre porque tú quieres, nunca en mitad del juego sin pedirlo)
  anuncio: { toques: 3, vidasDia: 3 },   // +3 toques una vez por intento al quedarte sin toques · +1 corazón, hasta 3 veces al día
  // el DUELO contra el CEO (js/duelo.js): pop-it de verdad por turnos, pierde quien revienta la última
  duelo: { premio: 15, premiosDia: 5, fallo: [0.45, 0.08], paso: 0.06 },
  // MEMORIA (js/memoria.js, fase 4): el «Simón dice» del pop-it. Tablero de 3x3; cada burbuja de la melodía dura `paso` segundos en
  // la ronda 1 y `acelera` menos cada ronda, hasta `pasoMin`. Premio del día: `porRonda` monedas por ronda (solo lo que mejora tu
  // mejor ronda de hoy), hasta `tope` al día. Sin corazones.
  memoria: { lado: 3, paso: 0.62, acelera: 0.025, pasoMin: 0.34, porRonda: 3, tope: 60 },   // monedas por victoria (con premio las 5 primeras del día) · cuánto se equivoca el CEO (del 45 % baja hasta el 8 % según ganas)
};
// Los mundos, sus niveles y la curva de dificultad están en js/niveles.js (se generan solos).

// Los slimes rescatables y su pasiva. Todas HACEN algo en el tablero (no solo protegen): saltar a reventar burbujas,
// premios por combos o por toques gordos. COMBO = toques seguidos que revientan más burbujas de las que suben.
// El dibujo está en img/sl-<id>.png (Yoshi); mientras no esté, el juego pinta un slime de ese color con el detalle de `pinta`.
//   salta: cada cuántas burbujas reventadas salta al tablero · golpes: cuántas burbujas de la solución revienta gratis al saltar
//   combo: con qué combo actúa · gratis: toques que no cuentan · pista: burbujas marcadas · premio: toques de 4 y 5 burbujas
const PP_SLIMES = {
  bunny:   { nombre: 'CrazyBunny', color: '#f6f1ff', color2: '#cfc2ea', pinta: 'orejas',
             pasiva: 'Zanahoriazo', texto: 'Cada 8 burbujas reventadas salta al tablero y revienta gratis una de la solución.', fx: { salta: 8, golpes: 1 } },
  becario: { nombre: 'El Becario', color: '#7fc4ff', color2: '#3f86d8', pinta: 'antena',
             pasiva: 'Horas extra', texto: 'Con un COMBO x3, tu siguiente toque no cuenta.', fx: { combo: 3, gratis: 1 } },
  lola:    { nombre: 'Lola', color: '#ffb88a', color2: '#e07a3c', pinta: 'pelo',
             pasiva: 'Chivatazo', texto: 'Al entrar en una sala y con cada COMBO x2 te marca una burbuja de la solución.', fx: { combo: 2, pista: 1 } },
  cofre:   { nombre: 'Caja de botín', color: '#ffd64a', color2: '#c98a12', pinta: 'dientes',
             pasiva: 'Premio gordo', texto: 'Un toque que revienta 4 burbujas da +1 toque de margen; uno de 5, +1 corazón.', fx: { premio: 1 } },
  ceo:     { nombre: 'El CEO', color: '#8a8aa8', color2: '#4a4a66', pinta: 'corbata',
             pasiva: 'Recorte de plantilla', texto: 'Cada 15 burbujas reventadas explota y revienta gratis dos de la solución.', fx: { salta: 15, golpes: 2 } },
};
const PP_SLIME_IDS = Object.keys(PP_SLIMES);
