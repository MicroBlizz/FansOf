// Fans of Asalto · AJUSTES: el nombre de la demo para core, la clave de su partida y TODA la calibración (ASALTO): las 7 clases, los
// héroes, los enemigos y los jefes, el Altar de invocación (los pesos de sus runas, lo que cuesta invocar), el campo y el banquillo,
// las rarezas de los héroes, los niveles, las herencias y las ramas del ascenso, las oleadas de cada zona, las reliquias, las misiones, las mejoras permanentes, el equipo y
// los logros. Solo datos: las reglas que los usan están en js/dominio/. Los textos van en español; su inglés, en idioma/en*.js.
'use strict';
const AJUSTES = {
  id: 'asalto',                // para core: la partida en la nube lleva este nombre
  guardado: 'fansof-asalto',   // la clave de la partida en este navegador
};

const ASALTO = {
  // Las 7 clases. Cada héroe del campo da 1 punto a cada una de sus dos clases (2 a la que elige al ascender).
  // umbral = puntos que hacen falta para cada nivel de la habilidad; v = el número de cada nivel; cada = segundos entre usos.
  clases: {
    tanque:   { nombre: 'Tanque',   col: '#3f8ae8', umbral: [2, 3, 4, 5], v: [10, 12, 14, 16], cada: 6, txt: 'Los tanques se ponen un escudo del {v} % de su vida cada 6 s' },
    luchador: { nombre: 'Luchador', col: '#e8572c', umbral: [2, 3, 4, 5], v: [10, 15, 20, 25], txt: 'Los luchadores pegan un {v} % más fuerte' },
    asesino:  { nombre: 'Asesino',  col: '#1ca49e', umbral: [2, 3, 4, 5], v: [1, 1.5, 2, 2.5], cada: 12, txt: 'Los asesinos lanzan un dardo venenoso cada 12 s: {v} % de la vida del enemigo por segundo' },
    tirador:  { nombre: 'Tirador',  col: '#5fb83a', umbral: [2, 3, 4, 5], v: [20, 30, 40, 50], txt: 'Los tiradores disparan un {v} % más rápido' },
    mago:     { nombre: 'Mago',     col: '#f0a92a', umbral: [2, 3, 4, 5], v: [50, 60, 70, 80], cada: 6, txt: 'Los magos lanzan una cadena de rayos cada 6 s: {v} % de su daño a 3 enemigos' },
    sanador:  { nombre: 'Sanador',  col: '#f06aa0', umbral: [1, 2, 3, 4], v: [3, 4, 5, 6], cada: 3, txt: 'Los sanadores curan un {v} % de la vida a un aliado cada 3 s' },
    brujo:    { nombre: 'Brujo',    col: '#a8243e', umbral: [2, 3, 4, 5], v: [4, 5, 6, 7], cada: 6, txt: 'Los brujos lanzan {v} misiles de sombra cada 6 s' },
  },

  // Los héroes: los Animales Locos en versión medieval. Dos clases cada uno: la primera es la principal (la que deja de herencia).
  // escasez: lo difícil que es que el Altar lo traiga (0 habitual, 1 escaso, 2 muy escaso: es el que llega con la línea de comodines). No es
  // su rareza: la rareza (Común, Raro…) es de cada héroe que llega y está más abajo, en `rarezas`. ataque: 'cuerpo', 'flecha', 'magia' (bola que vuela), 'bomba' (cae en un área) o 'cura'.
  // salto: corre a la retaguardia enemiga al empezar. fila: dónde se coloca solo al llegar ('frente' o 'atras').
  heroes: {
    'heroe-huron':     { nombre: 'HurónNinja', clases: ['asesino', 'luchador'], escasez: 0, vida: 85, dano: 15, cada: 0.8, alcance: 34, vel: 60, ataque: 'cuerpo', salto: true, fila: 'frente' },
    'heroe-bunny':     { nombre: 'CrazyBunny', clases: ['luchador', 'tanque'], escasez: 0, vida: 120, dano: 14, cada: 1.0, alcance: 36, vel: 46, ataque: 'cuerpo', fila: 'frente' },
    'heroe-ardilla':   { nombre: 'MadSquirrel', clases: ['tirador', 'asesino'], escasez: 0, vida: 70, dano: 12, cada: 0.9, alcance: 190, vel: 40, ataque: 'flecha', fila: 'atras' },
    'heroe-zorro':     { nombre: 'SlyFox', clases: ['asesino', 'brujo'], escasez: 1, vida: 90, dano: 22, cada: 0.9, alcance: 34, vel: 62, ataque: 'cuerpo', salto: true, fila: 'frente' },
    'heroe-castor':    { nombre: 'BoomBeaver', clases: ['tirador', 'mago'], escasez: 1, vida: 80, dano: 18, cada: 1.6, alcance: 170, vel: 38, ataque: 'bomba', area: 46, fila: 'atras' },
    'heroe-mechavaca': { nombre: 'MechaVaca', clases: ['tanque', 'luchador'], escasez: 1, vida: 260, dano: 11, cada: 1.3, alcance: 36, vel: 34, ataque: 'cuerpo', fila: 'frente' },
    'heroe-suricata':  { nombre: 'MeerCat', clases: ['sanador', 'brujo'], escasez: 2, vida: 90, dano: 16, cada: 1.2, alcance: 170, vel: 36, ataque: 'cura', fila: 'atras' },
    'heroe-mapache':   { nombre: 'JunkCoon', clases: ['mago', 'brujo'], escasez: 2, vida: 85, dano: 26, cada: 1.4, alcance: 180, vel: 36, ataque: 'magia', fila: 'atras' },
  },

  // Los enemigos: los de Microblizz. corre: no se para a pelear, va derecho a cruzar la línea.
  enemigos: {
    'enemigo-becario':    { nombre: 'Becario', vida: 60, dano: 8, cada: 1.0, alcance: 34, vel: 44, ataque: 'cuerpo' },
    'enemigo-starbot':    { nombre: 'StarBot', vida: 50, dano: 9, cada: 1.1, alcance: 170, vel: 40, ataque: 'magia' },
    'enemigo-soportebot': { nombre: 'SoporteBot', vida: 110, dano: 9, cada: 1.2, alcance: 36, vel: 36, ataque: 'cuerpo' },
    'enemigo-parche':     { nombre: 'Parche Día 1', vida: 40, dano: 0, cada: 1.0, alcance: 34, vel: 58, ataque: 'cuerpo', corre: true },
    'enemigo-fallen':     { nombre: 'FallenHero', vida: 150, dano: 15, cada: 1.2, alcance: 36, vel: 38, ataque: 'cuerpo' },
    'enemigo-cajabotin':  { nombre: 'Caja Botín', vida: 130, dano: 12, cada: 1.0, alcance: 34, vel: 46, ataque: 'cuerpo' },
  },

  // Los jefes: uno por zona. golpes = sus ataques especiales (js/dominio/batalla-jefes.js), cada uno con su espera en segundos, el aviso
  // previo (lo que tarda en caer) y su fuerza. furia: por debajo de esa parte de la vida pega y se mueve más rápido.
  jefes: {
    'jefe-caido': { nombre: 'El Héroe Caído', lema: 'Antes salvaba el mundo. Ahora ficha a las ocho.', musica: 'boss3', vida: 9000, dano: 38, cada: 1.3, alcance: 62, vel: 34, ataque: 'cuerpo', area: 60,
      furia: 0.5, golpes: [{ tipo: 'torbellino', cada: 8, aviso: 1.1, radio: 120, mult: 1.8 }] },
    'jefe-caja':  { nombre: 'La Gran Caja Botín', lema: 'Contiene sorpresas. Ninguna buena.', musica: 'boss', vida: 17500, dano: 46, cada: 1.2, alcance: 60, vel: 36, ataque: 'cuerpo', area: 0,
      furia: 0.5, golpes: [{ tipo: 'invoca', cada: 7, aviso: 0.8, quien: ['enemigo-becario', 'enemigo-parche'], cuantos: 2, tope: 6 }, { tipo: 'mordisco', cada: 10, aviso: 1.0, mult: 3.2 }] },
    'jefe-ceo':   { nombre: 'El CEO de Microblizz', lema: 'Esta reunión podía haber sido un correo.', musica: 'boss6', vida: 32000, dano: 56, cada: 1.4, alcance: 70, vel: 30, ataque: 'cuerpo', area: 64,
      furia: 0.4, golpes: [{ tipo: 'despido', cada: 9, aviso: 1.3, ancho: 60, mult: 2.6 }, { tipo: 'invoca', cada: 13, aviso: 0.8, quien: ['enemigo-soportebot'], cuantos: 2, tope: 4 }, { tipo: 'maletin', cada: 11, aviso: 1.2, radio: 100, mult: 2.4 }] },
  },

  // El Altar de invocación: 3 columnas de runas (se ven 3 y se asoman la de arriba y la de abajo). pesos = con qué frecuencia sale cada runa.
  altar: {
    pesos: { luchador: 20, asesino: 20, tanque: 17, tirador: 17, mago: 11, brujo: 9, sanador: 6, comodin: 4 },   // con estos pesos, 3 de cada 10 invocaciones traen línea
    red: { desde: 3, prob: [0.3, 0.6, 1] },   // la red contra la mala suerte: con 3, 4 y 5 invocaciones seguidas sin línea, la siguiente que falle se arregla con esa probabilidad
    coste: 3, subida: 1,            // la primera invocación de la oleada cuesta 3 de oro y cada una más, 1 más
    empujones: 1,                   // empujones por oleada
    escasez: [70, 24, 6],           // peso de que el héroe de la clase sea uno habitual, escaso o muy escaso
    premioLineas: [0, 0, 2, 5, 10, 16],   // oro extra por hacer 0, 1, 2, 3, 4 o 5 líneas de una vez
    dorado: { lineas: 6, nivel: 5, oro: 20 },   // el premio gordo (6 líneas o más de una vez): además, un Animal Dorado
    racha: [0, 0, 1, 2, 2],         // oro extra por llevar 0, 1, 2, 3 o 4 (o más) invocaciones seguidas con línea
  },

  // Las rarezas de un héroe, de menos a más. Cada héroe que llega tira la suya: peso = lo que pesa cada una entre las ABIERTAS;
  // mult = por cuánto multiplica su vida y su daño. Una partida nueva solo da Común: las demás empiezan con candado y se abren
  // fuera de la partida, en Mejoras, una detrás de otra, con plumas y con su zona superada (zona = su número en `zonas`).
  rarezas: [
    { id: 'comun',      nombre: 'Común',      peso: 70,  mult: 1 },
    { id: 'raro',       nombre: 'Raro',       peso: 20,  mult: 1.15, plumas: 80,  zona: 0 },
    { id: 'epico',      nombre: 'Épico',      peso: 7,   mult: 1.3,  plumas: 160, zona: 1 },
    { id: 'legendario', nombre: 'Legendario', peso: 2.5, mult: 1.5,  plumas: 320, zona: 2 },
    { id: 'mitico',     nombre: 'Mítico',     peso: 0.5, mult: 1.8,  plumas: 600, zona: 2 },
  ],

  // El campo: 2 columnas (frente y atrás) x 3 filas. Los huecos van numerados: 0-2 el frente (de arriba abajo), 3-5 atrás.
  campo: { huecos: 6, abiertos: 5, banquillo: 3 },

  // Niveles: cada nivel sube la vida y el daño; al llegar a `ascenso` el héroe puede ascender. Herencias: cada `marcas` héroes
  // absorbidos de una clase dan un grado de su herencia (hasta `tope`).
  // margen: cada héroe llega con su vida y su daño un poco distintos, hasta ese % arriba o abajo (dos iguales no son gemelos).
  // huecos: el nivel al que se abre cada hueco de impronta. Una impronta es la clase de un héroe absorbido grabada en un hueco:
  // solo las clases con hueco dan su herencia (las demás marcas se guardan y cuentan cuando se abra otro hueco).
  niveles: { porNivel: 0.22, ascenso: 5, marcas: 2, tope: 5, margen: 10, huecos: [1, 5, 10] },
  herencias: {
    tanque:   { stat: 'vida',    v: 8,  txt: '+{v} % de vida' },
    luchador: { stat: 'dano',    v: 6,  txt: '+{v} % de daño' },
    asesino:  { stat: 'critico', v: 4,  txt: '+{v} % de golpes críticos' },
    tirador:  { stat: 'prisa',   v: 6,  txt: '+{v} % de velocidad de ataque' },
    mago:     { stat: 'salpica', v: 10, txt: 'Sus golpes salpican un {v} % del daño a los enemigos de al lado' },
    sanador:  { stat: 'regenera', v: 1, txt: 'Recupera un {v} % de vida por segundo' },
    brujo:    { stat: 'roba',    v: 5,  txt: 'Se cura un {v} % del daño que hace' },
  },
  // Las ramas del ascenso (nivel 5): el héroe elige una de sus dos clases, que pasa a contar 2 puntos, y gana esto.
  ramas: {
    tanque:   { titulo: 'Guardián',   txt: '+40 % de vida y los enemigos cercanos le atacan a él' },
    luchador: { titulo: 'Campeón',    txt: 'Sus golpes dan a todos los enemigos que tiene alrededor' },
    asesino:  { titulo: 'Sombra',     txt: '+25 % de golpes críticos, y sus críticos pegan el triple' },
    tirador:  { titulo: 'Halcón',     txt: 'Cada ataque lanza un segundo disparo al 60 %' },
    mago:     { titulo: 'Archimago',  txt: 'Sus ataques estallan en un área grande' },
    sanador:  { titulo: 'Curandero',  txt: 'Sus curas llegan también, a medias, a todos los aliados' },
    brujo:    { titulo: 'Nigromante', txt: 'Los enemigos que golpea reciben un 20 % más de daño durante 4 s' },
  },

  // La partida: con qué se empieza y lo que da cada cosa.
  partida: {
    oro: 18, vidas: 5,
    oroPorMuerte: 1,
    oroOleada: n => 4 + Math.floor(n / 3),   // n = número de oleada
    oroElite: 8, plumasOleada: 2,
    vidasPorPerder: 1, topeVidasOleada: 3,    // perder una oleada normal quita 1 vida y se repite esa oleada; al ganarla, los que cruzan quitan 3 como mucho
    reliquiaCada: 3,                          // se elige reliquia tras las oleadas 3, 6, 9…
    eliteCada: 5,                             // cada 5 oleadas, una de élite (la Auditoría); la última de la zona es el jefe
    oroCofre: [8, 14], plumasCofre: [13, 39],
    oroJefe: 25, plumasJefe: 50, objetosJefe: 3,
    limiteCombate: 75, muerteSubita: 40,
    tandaCada: 5, porTanda: 6,                // los enemigos entran en tandas de hasta 6, una cada 5 s
  },

  // Las zonas: cada una es una tira de oleadas con el jefe al final. fuerza multiplica la vida de los enemigos según la oleada;
  // cuantos, cuántos vienen. tema: cómo se pinta la mazmorra (js/adaptadores/mazmorra.js).
  zonas: [
    { nombre: 'Sótanos de Microblizz', oleadas: 15, tema: 'sotano', musica: 'animales', enemigos: ['enemigo-becario', 'enemigo-starbot', 'enemigo-soportebot', 'enemigo-parche'],
      jefe: 'jefe-caido', fuerza: n => 0.55 + n * 0.12 + n * n * 0.019, cuantos: n => Math.min(14, 1 + n) },
    { nombre: 'Oficinas del CEO', oleadas: 20, tema: 'oficina', musica: 'heroes', enemigos: ['enemigo-becario', 'enemigo-soportebot', 'enemigo-parche', 'enemigo-fallen', 'enemigo-cajabotin'],
      jefe: 'jefe-caja', fuerza: n => 0.6 + n * 0.125 + n * n * 0.0175, cuantos: n => Math.min(16, 1 + n) },
    { nombre: 'La nube de servidores', oleadas: 25, tema: 'nube', musica: 'ciber', enemigos: ['enemigo-starbot', 'enemigo-soportebot', 'enemigo-parche', 'enemigo-fallen', 'enemigo-cajabotin'],
      jefe: 'jefe-ceo', fuerza: n => 0.6 + n * 0.15 + n * n * 0.019, cuantos: n => Math.min(18, 1 + n) },
  ],
  // El modo sin fin (se abre al terminar una zona): la fuerza sigue subiendo y cada 10 oleadas viene un jefe, por turnos.
  sinFin: { fuerzaPorOleada: 0.14, jefeCada: 10, jefes: ['jefe-caido', 'jefe-caja', 'jefe-ceo'], plumasOleada: 3 },

  // Las reliquias: valen hasta el final de la partida. Las de `clase` solo sirven a esa clase; las de `altar` cambian el Altar.
  reliquias: {
    espinas:   { nombre: 'Aura de espinas', clase: 'tanque', txt: 'Los tanques devuelven el 20 % del daño que reciben' },
    perforar:  { nombre: 'Perforar', clase: 'tirador', txt: 'Las flechas de los tiradores atraviesan y dan a un segundo enemigo' },
    esprint:   { nombre: 'Esprint', clase: 'asesino', txt: 'Los asesinos corren y atacan un 30 % más rápido' },
    tenacidad: { nombre: 'Tenacidad', clase: 'luchador', txt: 'Los luchadores tienen un 25 % más de vida' },
    escondite: { nombre: 'Escondite', clase: 'sanador', txt: 'Los sanadores esquivan el 30 % de los golpes' },
    helado:    { nombre: 'Toque helado', clase: 'mago', txt: 'Los golpes de los magos pueden frenar al enemigo' },
    sombra:    { nombre: 'Sombra larga', clase: 'brujo', txt: 'Los misiles de los brujos hacen un 50 % más de daño' },
    zelote:    { nombre: 'Zelote', txt: 'Todos pegan un 10 % más fuerte', icono: 'reliquia-colmillo' },
    reflejo:   { nombre: 'Espejo roto', txt: 'Todos devuelven el 10 % del daño recibido', icono: 'reliquia-espejo' },
    mortal:    { nombre: 'Golpe mortal', txt: '15 % de golpes críticos (x2)', icono: 'reliquia-dado' },
    furia:     { nombre: 'Furia', txt: 'Con menos del 30 % de vida, +30 % de daño', icono: 'reliquia-reloj' },
    carton:    { nombre: 'Escudo de cartón', txt: 'Todos empiezan cada combate con un escudo del 20 %', icono: 'reliquia-escudo' },
    hucha:     { nombre: 'Hucha rota', txt: '+3 de oro en cada victoria', icono: 'reliquia-hucha' },
    tirita:    { nombre: 'Tirita mágica', txt: 'Todos recuperan un 2 % de vida por segundo', icono: 'reliquia-tirita' },
    botas:     { nombre: 'Botas de prisa', txt: '+35 % de velocidad al andar', icono: 'equipo-botas' },
    coraza:    { nombre: 'Coraza de zanahoria', txt: '+25 % de vida para todos', icono: 'reliquia-coraza' },
    comodin:   { nombre: 'Runa comodín', altar: true, txt: 'En el Altar salen el doble de comodines', icono: 'gema' },
    rebaja:    { nombre: 'Vale descuento', altar: true, txt: 'Invocar cuesta 1 de oro menos', icono: 'moneda' },
    gratis:    { nombre: 'Primera ronda', altar: true, txt: 'La primera invocación de cada oleada es gratis', icono: 'trofeo' },
    repite:    { nombre: 'Segunda oportunidad', altar: true, txt: 'Si la primera invocación de la oleada no da línea, se repite gratis', icono: 'reliquia-dado' },
    palanca:   { nombre: 'Palanca', altar: true, txt: '+1 empujón en cada oleada', icono: 'yunque' },
    eco:       { nombre: 'Eco', altar: true, txt: 'Uno de cada cuatro héroes invocados llega ya con nivel 2', icono: 'pluma' },
    interes:   { nombre: 'Caja de ahorros', txt: 'Al empezar cada oleada, +1 de oro por cada 5 que tengas (5 como mucho)', icono: 'reliquia-hucha' },
  },

  // Las misiones de la partida: salen `cuantas` al empezar (en la partida guiada, las de `guia`). Cada una mira un contador de la
  // partida (stat) y tiene varios escalones (metas): al llegar a uno se cobra sola (oro y plumas, algo más en cada escalón) y pasa al siguiente.
  misiones: {
    cuantas: 3, guia: ['lineas', 'absorbe', 'bajas'], porEscalon: 1,
    lista: {
      lineas:  { txt: 'Haz {n} líneas en el Altar', stat: 'lineas', metas: [3, 10, 22], oro: 3, plumas: 2, icono: 'reliquia-dado' },
      doble:   { txt: 'Haz varias líneas de una vez, {n} veces', stat: 'dobles', metas: [1, 3, 6], oro: 4, plumas: 3, icono: 'gema' },
      racha:   { txt: 'Encadena {n} invocaciones seguidas con línea', stat: 'rachaMax', metas: [2, 3, 4], oro: 4, plumas: 3, icono: 'trofeo' },
      absorbe: { txt: 'Une a {n} héroes', stat: 'absorbidos', metas: [1, 5, 12], oro: 3, plumas: 2, icono: 'yunque' },
      nivel:   { txt: 'Sube un héroe al nivel {n}', stat: 'nivelMax', metas: [3, 5, 8], oro: 3, plumas: 3, icono: 'pluma' },
      bajas:   { txt: 'Derrota a {n} enemigos', stat: 'bajas', metas: [10, 40, 100], oro: 3, plumas: 2, icono: 'sala-combate' },
      limpia:  { txt: 'Gana {n} oleadas sin perder vidas', stat: 'limpias', metas: [2, 5, 9], oro: 4, plumas: 3, icono: 'corazon' },
    },
  },

  // Las mejoras permanentes: se compran con plumas en el menú y valen para todas las partidas. coste = plumas de cada nivel.
  mejoras: {
    corazon:  { nombre: 'Corazón de más', txt: '+1 vida al empezar', coste: [60, 150, 300], icono: 'corazon' },
    hueco:    { nombre: 'Sexto hueco', txt: 'Abre el sexto hueco del campo', coste: [200], icono: 'sala-combate' },
    bolsa:    { nombre: 'Bolsa de viaje', txt: '+3 de oro al empezar', coste: [40, 100, 200], icono: 'moneda' },
    runa:     { nombre: 'Runa tallada', txt: 'Sale algún comodín más en el Altar', coste: [100, 200, 400], icono: 'altar' },
    palanca:  { nombre: 'Palanca engrasada', txt: '+1 empujón en cada oleada', coste: [250], icono: 'yunque' },
    veterano: { nombre: 'Veteranos', txt: 'El primer héroe de cada partida llega con más nivel', coste: [120, 240], icono: 'trofeo' },
  },

  // El equipo (fuera de la partida): 6 huecos, cada objeto sube una estadística en % para TODOS los héroes.
  equipo: {
    huecos: ['casco', 'arma', 'armadura', 'guantes', 'pantalon', 'botas'],
    nombres: { casco: 'Casco', arma: 'Arma', armadura: 'Armadura', guantes: 'Guantes', pantalon: 'Pantalón', botas: 'Botas' },
    stats: { vida: 'Vida', ataque: 'Ataque', defensa: 'Defensa', velAtaque: 'Velocidad de ataque', velMov: 'Velocidad', critico: 'Prob. de crítico', danoCrit: 'Daño crítico', reflejo: 'Reflejo' },
    porHueco: { casco: ['vida', 'defensa'], arma: ['ataque', 'critico', 'danoCrit'], armadura: ['vida', 'defensa', 'reflejo'], guantes: ['velAtaque', 'critico'], pantalon: ['vida', 'defensa'], botas: ['velMov', 'velAtaque'] },
    rarezas: [{ nombre: 'Normal', valor: [1, 2] }, { nombre: 'Raro', valor: [2, 4] }, { nombre: 'Épico', valor: [4, 7] }],
    mochila: 12,
    desencantar: [8, 20, 50],        // plumas que da deshacer un objeto, por rareza
    herreria: 15,                    // subir un objeto un nivel cuesta 15 x (nivel + 1) plumas y le da +1 %
    cofreTienda: 60,                 // plumas que cuesta un cofre de equipo en la Tienda
  },

  // Los logros: premio en plumas. stat y meta: el contador de la partida guardada y cuánto hace falta (zona: haber terminado esa zona).
  logros: [
    { id: 'oro100', txt: 'Junta 100 de oro en total', premio: 20, stat: 'oroTotal', meta: 100 },
    { id: 'oro1000', txt: 'Junta 1.000 de oro en total', premio: 60, stat: 'oroTotal', meta: 1000 },
    { id: 'enem50', txt: 'Derrota a 50 enemigos', premio: 20, stat: 'enemigos', meta: 50 },
    { id: 'enem200', txt: 'Derrota a 200 enemigos', premio: 50, stat: 'enemigos', meta: 200 },
    { id: 'enem1000', txt: 'Derrota a 1.000 enemigos', premio: 120, stat: 'enemigos', meta: 1000 },
    { id: 'lineas50', txt: 'Haz 50 líneas en el Altar', premio: 25, stat: 'lineas', meta: 50 },
    { id: 'lineas500', txt: 'Haz 500 líneas en el Altar', premio: 100, stat: 'lineas', meta: 500 },
    { id: 'nivel10', txt: 'Sube un héroe al nivel 10', premio: 30, stat: 'nivelMax', meta: 10 },
    { id: 'nivel20', txt: 'Sube un héroe al nivel 20', premio: 80, stat: 'nivelMax', meta: 20 },
    { id: 'ascensos5', txt: 'Asciende a 5 héroes', premio: 40, stat: 'ascensos', meta: 5 },
    { id: 'dorado1', txt: 'Consigue un Animal Dorado', premio: 100, stat: 'dorados', meta: 1 },
    { id: 'zona1', txt: 'Termina los Sótanos de Microblizz', premio: 100, zona: 0 },
    { id: 'zona2', txt: 'Termina las Oficinas del CEO', premio: 150, zona: 1 },
    { id: 'zona3', txt: 'Echa al CEO de la nube de servidores', premio: 250, zona: 2 },
    { id: 'jefes5', txt: 'Derrota a 5 jefes', premio: 60, stat: 'jefes', meta: 5 },
    { id: 'sinfin20', txt: 'Llega a la oleada 20 del modo sin fin', premio: 120, stat: 'sinFinMax', meta: 20 },
  ],
};
