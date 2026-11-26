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
  cofreVidasDia: 3,          // corazones al día que puede dar el Cofre del tesoro con un toque de 5 (tarea #236, Pepins 20-11-2026); después da +1 toque
  cofrePops: { toque: 4, vida: 5 },   // el Premio doble del Cofre: un toque de 4 pops da +1 toque; uno de 5, +1 corazón (js/habilidades.js, premio)
  precioVidas: 150,          // monedas por llenar los corazones de golpe
  equipo: 3,                 // huecos del equipo de serie (Daniel, 02-11-2026: con 4 era muy fácil; antes 4)
  huecosMax: 6,              // con los comprados (Daniel, 30-10-2026: comprar huecos con monedas, hasta 6, cada uno más caro)
  precioHueco: [200, 400, 800],   // el 4.º, el 5.º y el 6.º hueco
  monedas: { nivel: 10, jefe: 30, estrella: 5 },   // la primera vez que pasas un nivel (o un jefe) y por cada estrella que mejora tu récord
  sobrantes: { porToque: 1, tope: 10 },   // la fiesta de toques sobrantes al ganar un nivel nuevo: 1 moneda por toque, como mucho 10 (Pepins, 19-11-2026)
  curvaRegion: { inicio: 0.8, fin: 0.55 },   // la curva de la lista en las regiones 2 a 10: del 80 % al empezar su primer mundo al 55 % al acabar el décimo (tarea #152, Pepins); la región 1 es la del ADR 214 (js/regiones/curva.js)
  cofreCada: 15,             // un cofre cada 15 estrellas de récord…
  cofre: [40, 80],           // …con entre 40 y 80 monedas
  cofreJefe: 100,            // y uno grande, de 100, al ganar a un jefe por primera vez
  // fase 3 (30-10-2026, «como Candy Crush»): las PERLAS, la moneda de pago (js/tienda.js). Precios fijos, sin azar.
  perlas: {
    seguir: 9,               // +5 toques al quedarte sin toques: precio fijo, nunca sube en el mismo intento (tarea #186)
    toquesSeguir: 5,
    vidas: 12,               // llenar los corazones
    hueco: [20, 40, 80],     // el 4.º, el 5.º y el 6.º hueco del equipo (también se pueden pagar con monedas)
    jefe: 3,                 // perlas de regalo al ganar a un jefe por primera vez (la comprada «cae poco a poco jugando»)
  },
  // SALTAR AL JEFE (tarea #95, ADR 152; Pepins, 18-11-2026): atascado en el jefe del camino normal, abrir el mundo siguiente con perlas
  saltarJefe: { perlas: 40, fallos: 3 },   // precio fijo y desde el 3.er fallo en ese jefe (js/saltar-jefe.js)
  // PRIMEROS PASOS (tarea #140; Pepins, 19-11-2026): en una partida nueva cada cosa se abre al GANAR su nivel (1 = el primero) y Lola la
  // estrena con un regalito pequeño (monedas o una ayuda, nunca perlas). La tienda y las opciones, siempre. `texto`: lo que dice Lola al
  // estrenarla (sin texto, la estrena su propia ventana: el regalo diario y la oferta; el equipo, el primer rescate). Reglas: js/primeros-pasos.js
  // CUENTA (tarea #155; Pepins, 20-11-2026): Lola invita a crearla al ganar el nivel `primera` y, si dijeron «más tarde», una vez más en `recuerdo`.
  cuenta: { primera: 5, recuerdo: 10 },
  primeros: {
    cosas: {
      equipo:  { nivel: 3, lugar: 'juego' },
      regalo:  { nivel: 3, lugar: 'lateral' },
      duelos:  { nivel: 5, lugar: 'portada', regalo: { ayudas: { pista: 1 } }, texto: '¡Nuevo: DUELOS! Toma una lupa de regalo.' },
      hucha:   { nivel: 6, lugar: 'lateral', regalo: { monedas: 30 }, texto: '¡Nueva: la hucha! Toma 30 monedas.' },
      oferta:  { nivel: 7, lugar: 'lateral' },
      memoria: { nivel: 8, lugar: 'portada', regalo: { ayudas: { martillo: 1 } }, texto: '¡Nuevo: MEMORIA! Toma un martillo de regalo.' },
      pase:    { nivel: 9, lugar: 'lateral', regalo: { ayudas: { bomba: 1 } }, texto: '¡Nuevo: el Pase! Toma una bomba de regalo.' },
      ranking: { nivel: 10, lugar: 'portada', regalo: { monedas: 30 }, texto: '¡Nuevo: RANKING! Toma 30 monedas.' },
      feria:   { nivel: 11, lugar: 'lateral', regalo: { monedas: 50 }, texto: '¡Nueva: la Feria del finde! Toma 50 monedas.' },
      perfil:  { nivel: 12, lugar: 'portada', regalo: { monedas: 30 }, texto: '¡Nuevo: tu PERFIL! Toma 30 monedas.' },
      amigos:  { nivel: 12, lugar: 'juego', regalo: { monedas: 30 }, texto: '¡Pide corazones a tus amigos! Toma 30 monedas.' },
    },
    seguidos: 3,       // niveles 1 a 3: SIGUIENTE entra directo en el siguiente, sin pasar por el camino
    sinCorazon: 3,     // niveles 1 a 3: quedarte sin toques no cuesta corazón
    ayudasDesde: 4,    // la barra de ayudas de los niveles normales sale desde el nivel 4
    tutos: { ayudasDuelo: 10, trucoNim: 15 },   // Lola espera a ese nivel para explicarlo (el primer duelo es el 5: solo cómo se juega)
  },
  // los paquetes de perlas con euros. PRECIOS FINALES (Pepins, 24-11-2026, tarea #245, ADR 213): `id` = el producto en Play Console y
  // en servidor/90 cuando se den de alta; cambiar uno después obliga a cambiarlo también en Play. Hasta entonces, la ventana de core dice
  // que llegarán con la app.
  packs: [
    { id: 'pop_perlas_10', perlas: 10, precio: '0,99 €' },
    { id: 'pop_perlas_25', perlas: 25, precio: '2,29 €' },   // tarea #266: dos tamaños más (25 y el grande, hoy 750); el «+N %» de cada uno se calcula (js/precios.js)
    { id: 'pop_perlas_50', perlas: 50, precio: '4,49 €' },
    { id: 'pop_perlas_120', perlas: 120, precio: '9,99 €', recomendado: true },   // cinta RECOMENDADO (opinión nuestra; MEJOR VALOR se calcula: js/precios.js, tarea #187)
    { id: 'pop_perlas_330', perlas: 330, precio: '21,99 €' },   // ADR 213: los grandes premian más (antes 300 y 650 por el mismo precio)
    { id: 'pop_perlas_750', perlas: 750, precio: '44,99 €' },
  ],
  // LOTES con euros (tarea #266): perlas, ayudas y corazones infinitos juntos, en la pestaña Perlas. Precios finales como los packs y
  // con más perlas desde el ADR 213, para que sigan valiendo más que su precio con el pack de 750.
  // Sin precio «antes»: su «Vale X €» lo calcula PP_PRECIOS.valorOferta. Uno de ellos es el «lote de hoy» (PP_OFERTAS_R.loteDeHoy)
  lotes: [
    { id: 'pop_lote_pequeno', nombre: 'Lote pequeño', corto: 'Pequeño', precio: '2,99 €', perlas: 30, ayudas: { martillo: 2, bomba: 1 }, infinitas: 30 },
    { id: 'pop_lote_mediano', nombre: 'Lote mediano', corto: 'Mediano', precio: '6,99 €', perlas: 70, ayudas: { martillo: 3, bomba: 3, toques3: 2 }, infinitas: 60 },
    { id: 'pop_lote_grande', nombre: 'Lote grande', corto: 'Grande', precio: '14,99 €', perlas: 160, ayudas: { martillo: 5, bomba: 5, toques3: 5 }, infinitas: 180 },
  ],
  // ver un anuncio (siempre porque tú quieres, nunca en mitad del juego sin pedirlo)
  anuncio: { toques: 3, vidasDia: 3 },   // +3 toques una vez por intento al quedarte sin toques · +1 corazón, hasta 3 veces al día
  // el DUELO contra el CEO (js/duelo.js): pop-it de verdad por turnos, pierde quien revienta la última
  duelo: { premio: 15, premiosDia: 5, fallo: [0.45, 0.08], paso: 0.06 },   // monedas por victoria (con premio las 5 primeras del día) · cuánto se equivoca el CEO (del 45 % baja hasta el 8 % según ganas)
  // el ritmo del rival en los niveles con duelo (js/nimnivel.js), en ms: `espera` hasta su primera burbuja y `paso` entre una y otra.
  // Si abre él la partida, sale «¡Empieza …!» y va más despacio para que se vea qué quita (tarea #180)
  rivalNim: { normal: { espera: 380, paso: 380 }, abre: { espera: 1100, paso: 650 } },
  // el generador de niveles (js/niveles.js, ppConstruye; tarea #196): cuántas partidas simula de quien juega normal para poner el límite
  // (antes 40) y cuántas de una que no se despista, para que nunca salga un nivel que ni ella pueda pasar
  generador: { tiradas: 200, listas: 20, tiradasLista: 40 },   // tiradasLista: partidas de la lista desde el mundo 2 (tarea #353, ADR 214)
  // «COPIARNOS DE CANDY CRUSH» (Daniel, 30-10-2026: «hay que sacar el máximo beneficio monetario»). Todo a precio FIJO: nada
  // de pagar por azar (ADR 004). Ver js/potenciadores.js, js/ofertas.js y js/pase.js; la tienda con pestañas en js/tienda.js.
  // AYUDAS (potenciadores): se ganan jugando (regalo diario, pase, cofres de oferta) o se compran con perlas. `nim`: solo en duelos.
  ayudas: {
    martillo: { perlas: 6, nombre: 'Martillo', texto: 'Hace pop del todo en una burbuja. No gasta toque.' },
    bomba:    { perlas: 9, nombre: 'Bomba', texto: 'Golpea un cuadrado de 3x3 sin gastar toque.' },
    toques3:  { perlas: 6, nombre: '+3 toques', texto: 'Tres toques más en este nivel.' },
    deshacer: { perlas: 5, nombre: 'Deshacer', texto: 'En un duelo, deshace tu última jugada.', nim: true },
    pista:    { perlas: 4, nombre: 'Pista de Lola', texto: 'En un duelo, Lola te marca la jugada ganadora.', nim: true },
    red:      { perlas: 9, nombre: 'Red', texto: 'Captura al momento un compañero repetido de la burbuja arcoíris, sin duelo.', esc: true },   // tarea #329: solo en la ventana del repetido
  },
  ayudasTres: 0.8,           // el lote de 3 de la misma ayuda, al 80 %
  // CORAZONES INFINITOS por tiempo (con perlas; también vienen en las ofertas y el pase)
  infinitas: [{ min: 30, perlas: 10 }, { min: 60, perlas: 18 }, { min: 120, perlas: 30 }],
  // OFERTAS con euros (precios finales como los packs, ADR 213; los productos aún no existen en Play ni en el servidor). Sin precio «antes»
  // inventado: la ventana dice lo que vale lo que trae, calculado solo (js/precios.js, tarea #177)
  ofertas: {
    bienvenida: { id: 'pop_pack_bienvenida', precio: '0,99 €', perlas: 30, ayudas: { martillo: 3, bomba: 3 }, infinitas: 60, desdeNivel: 5, horas: 48 },   // `horas`: dura eso desde que sale y luego desaparece de verdad (tarea #187)
    // tarea #187: el pack de «Sin toques» (una vez por intento, debajo de +5 toques) y el segundo pack, al abrir el mundo 2 (48 h, una vez)
    sinToques: { id: 'pop_pack_sin_atascos', precio: '0,99 €', ayudas: { martillo: 1, bomba: 1, toques3: 1 } },
    mundo2: { id: 'pop_pack_mundo2', precio: '1,99 €', perlas: 40, ayudas: { martillo: 2, bomba: 2 }, infinitas: 60, mundo: 1, horas: 48 },
    atasco: { id: 'pop_pack_atasco', precio: '1,99 €', perlas: 25, ayudas: { martillo: 2, bomba: 2, toques3: 2, deshacer: 2 }, fallos: 3,
      regalo: { ayudas: { martillo: 1 }, texto: '¡Un martillo de regalo! Hace pop sin gastar toque.' } },   // sin reloj ni salir solo: tras 3 fallos Lola regala esto (tarea #186)
  },
  // la HUCHA de perlas: cada nivel nuevo superado mete perlas; desde `minimo` se puede romper pagando y te las quedas todas
  // la EDAD (tarea #254, js/edad.js): a quien no llega a esta edad no se le enseñan ofertas con euros. Se pregunta solo el año, así que ante la duda es menor
  edad: { mayor: 18 },
  hucha: { porNivel: 2, porJefe: 6, minimo: 40, max: 150, id: 'pop_hucha', precio: '2,99 €' },
  // el PASE de temporada (un mes): puntos al ganar niveles (1, y 1 más con 3 estrellas); cada `puntos` puntos, un escalón con su
  // premio gratis y su premio premium (el premium se compra una vez por temporada)
  pase: { id: 'pop_pase', precio: '4,99 €', escalones: 30, puntos: 3,
    plus: { id: 'pop_pase_plus', precio: '9,99 €' } },   // Dorado+ (flag 'pase-nuevo', tarea #165): el mismo pase y salta 10 escalones
  racha: { max: 1 },         // RACHA: ganar un nivel nuevo sin perder un corazón da +1 toque al empezar los siguientes (hasta 1; antes 3: tarea #353, ADR 214)
  // MEMORIA (js/memoria.js, fase 4): el «Simón dice» del pop-it. Tablero de 3x3; cada burbuja de la melodía dura `paso` segundos en
  // la ronda 1 y `acelera` menos cada ronda, hasta `pasoMin`. Premio del día: `porRonda` monedas por ronda (solo lo que mejora tu
  // mejor ronda de hoy), hasta `tope` al día. Sin corazones.
  // Tarea #141 (fase 1, ADR 215; reglas en js/memoria-reglas.js): el tablero CRECE (3x3 hasta la ronda `lado4`, 4x4 hasta `forma` y
  // luego la forma de `ladoForma` del mundo elegido), cada mundo suena con su `instrumentos[m]` (js/memoria-instrumentos.js) y hay tres
  // DIFICULTADES: `paso` y `pasoMin` multiplican los de arriba, `pista` = segundos de duda tras los que brilla la buena (0 = nunca) y
  // `luces` = si la melodía se ve al sonar (en Difícil solo se oye). Normal es la de siempre y su récord, el de la clasificación.
  // Fase 2 (ADR 216; js/memoria-ayudas.js): `seguir` = tras fallar, una vez por partida, se sigue en la misma ronda por `perlas` o viendo
  // un anuncio (se ofrece desde la ronda `desdeRonda`); `pista` = «Repetir melodía» en tu turno, por `perlas`, una vez por ronda y
  // `porPartida` veces como mucho. Ninguna de las dos vale en una partida `limpio` (duelos contra gente, cuando los haya).
  memoria: { lado: 3, paso: 0.62, acelera: 0.025, pasoMin: 0.34, porRonda: 3, tope: 60,
    seguir: { perlas: 9, desdeRonda: 2 }, pista: { perlas: 4, porPartida: 2 },
    crece: { lado4: 6, forma: 11, ladoForma: 5 },
    dificultades: {
      facil: { paso: 1.4, pasoMin: 1.4, pista: 3, luces: true },
      normal: { paso: 1, pasoMin: 1, pista: 0, luces: true },
      dificil: { paso: 0.8, pasoMin: 0.75, pista: 0, luces: false },
    },
    instrumentos: ['cajita', 'xilofono', 'campanillas', 'tambor', 'organillo', 'arpa', 'flauta', 'marimba', 'koto', 'sinte'] },
  // RETO DEL DÍA (tarea 367, ADR 226; js/reto-dia-reglas.js): `intentos` al día, los `gratis` primeros sin pagar y los demás por `perlas` (o un
  // anuncio, donde los hay). Monedas: `porRonda` por ronda de tu mejor marca de hoy (solo lo que la mejora), hasta `tope` al día.
  // `mundos`: entre cuántos mundos rota el del día (fijo: si cambia, el día de
  // la nueva versión no juega el mismo tablero que las viejas; no se toca aunque haya más mundos).
  reto: { intentos: 3, gratis: 1, perlas: 5, porRonda: 2, tope: 40, mundos: 10 },
  // PERFIL DE JUGADOR (tarea #41, ADR 130; precios medios que eligió Pepins el 17-11-2026): perlas por cada cosa del perfil, según su tipo.
  // Lo de serie y los amigos ya rescatados son gratis (js/perfil-catalogo.js). Lo cobra el servidor (comprar_fijo) y se sube con herramientas/pop/pop_datos.js.
  perfil: { frase: 10, titulo: 10, pegatina: 15, marco: 25, fondo: 30, efecto: 40, personaje: 50, entrada: 60 },
};
// Los mundos están en js/regiones/ y sus niveles y la curva de dificultad, en js/niveles.js (se generan solos).

// Los slimes rescatables y su pasiva. Todas HACEN algo en el tablero (no solo protegen): saltar a reventar burbujas,
// premios por combos o por toques gordos. COMBO = toques seguidos que revientan más burbujas de las que suben.
// El dibujo está en img/sl-<id>.png (Yoshi); mientras no esté, el juego pinta un slime de ese color con el detalle de `pinta`.
//   salta: cada cuántas burbujas reventadas salta al tablero · golpes: cuántas burbujas de la solución revienta gratis al saltar
//   combo: con qué combo actúa · gratis: toques que no cuentan · pista: burbujas marcadas · premio: toques de 4 y 5 burbujas
const PP_SLIMES = {
  bunny:   { nombre: 'CrazyBunny', color: '#f6f1ff', color2: '#cfc2ea', pinta: 'orejas',
             pasiva: 'Zanahoriazo', texto: 'Cada 8 pops, hace pop en una burbuja buena.', fx: { salta: 8, golpes: 1 } },
  becario: { nombre: 'El Becario', color: '#7fc4ff', color2: '#3f86d8', pinta: 'antena',
             pasiva: 'Horas extra', texto: 'Con un COMBO x3, tu siguiente toque no cuenta.', fx: { combo: 3, gratis: 1 } },
  lola:    { nombre: 'Lola', color: '#ffb88a', color2: '#e07a3c', pinta: 'pelo',
             pasiva: 'Chivatazo', texto: 'Al empezar te marca una burbuja buena, y otra cada 2 combos. En duelos, una lupa gratis.', fx: { combo: 2, pista: 1 } },
  cofre:   { nombre: 'Cofre del tesoro', color: '#ffd64a', color2: '#c98a12', pinta: 'dientes',
             pasiva: 'Premio doble', texto: 'Con 4 pops en un toque, +1 toque. Con 5, +1 corazón (máximo 3 veces al día).', fx: { premio: 1 } },
  ceo:     { nombre: 'El CEO', color: '#8a8aa8', color2: '#4a4a66', pinta: 'corbata',
             pasiva: 'Recorte de plantilla', texto: 'Cada 15 pops, hace pop en dos burbujas buenas.', fx: { salta: 15, golpes: 2 } },
  // los amigos de los mundos 3 a 6 (30-10-2026, para que los huecos 5.º y 6.º sirvan); `prefiere`: salta antes a las de ese tipo
  copito:  { nombre: 'Copito', color: '#bfe9ff', color2: '#6fb8e8', pinta: '',
             pasiva: 'Deshielo', texto: 'Cada 10 pops, hace pop en un hielo.', fx: { salta: 10, golpes: 1, prefiere: 1 } },
  medusa:  { nombre: 'Medusita', color: '#ffc4e6', color2: '#e07ab5', pinta: '',
             pasiva: 'Cosquillas', texto: 'Cada 12 pops, hace pop en una concha.', fx: { salta: 12, golpes: 1, prefiere: 2 } },
  algodon: { nombre: 'Algodón', color: '#ffd6f0', color2: '#9fdcff', pinta: '',
             pasiva: 'Lluvia de azúcar', texto: 'Cada 18 pops llueve azúcar sobre tres burbujas buenas.', fx: { salta: 18, golpes: 3 } },
  nubecita: { nombre: 'Nubecita', color: '#f4f0ff', color2: '#c9b8f0', pinta: '',
             pasiva: 'Cielo despejado', texto: 'Al empezar cada nivel, +1 toque extra.', fx: { extra: 1 } },
  // mundos 7 a 10 (31-10-2026)
  hada:    { nombre: 'Hadita', color: '#b8f0d0', color2: '#4fc98a', pinta: '',
             pasiva: 'Polvo de hada', texto: 'Cada 14 pops vuela a un cohete y lo apaga: revienta sin levantar nada.', fx: { salta: 14, golpes: 1, prefiere: 3 } },
  sirena:  { nombre: 'Sirenita', color: '#9fe8f0', color2: '#3ab0c8', pinta: '',
             pasiva: 'Ola', texto: 'Cada 12 pops, hace pop en una burbujeante.', fx: { salta: 12, golpes: 1, prefiere: 4 } },
  maneki:  { nombre: 'Gatito de la suerte', color: '#fff8f0', color2: '#e0c8b0', pinta: '',
             pasiva: 'Fortuna', texto: 'Al ganar un nivel nuevo, la mitad de monedas más.', fx: { monedas: 0.5 } },
  astro:   { nombre: 'Astronauta', color: '#e0d0ff', color2: '#9a80d8', pinta: '',
             pasiva: 'Lluvia de estrellas', texto: 'Cada 20 pops caen estrellas sobre cuatro burbujas buenas.', fx: { salta: 20, golpes: 4 } },
  // el jefe del último mundo (no se rescata)
  ceoespacial: { nombre: 'El CEO espacial', color: '#8a8aa8', color2: '#4a4a66', pinta: 'corbata', rival: true,
             pasiva: '', texto: '', fx: {} },
};
const PP_SLIME_IDS = Object.keys(PP_SLIMES).filter(k => !PP_SLIMES[k].rival);   // los que se rescatan (el CEO espacial solo es jefe)
