// Fans of Asalto · Los 44 objetos de la tienda que llegaron con la tarea #108 (con los 16 de ajustes-tienda.js, 60). Solo datos: v (y w,
// cuando el objeto tiene dos cifras) es lo que dan en cada nivel (1, 2 y 3). Los que llevan `stat` cambian las cifras del héroe
// (dominio/poder.js); los que llevan `efecto` actúan en la batalla (dominio/batalla-objetos.js) o en la partida (dominio/objetos.js).
// Con `clases`, solo a los héroes de esas clases. El icono es provisional (dibujado por código) hasta que lleguen los de Yoshi.
'use strict';
// las cifras de las mecánicas que no van por nivel
ASALTO.efectosObjetos = {
  quema: 3, veneno: 3, atonta: 1, frena: 2,   // segundos que dura cada estado
  jefe: 0.25,           // a un jefe, quemadura, veneno y confeti le hacen la cuarta parte (como el veneno del asesino); atontar no le afecta
  cadenaCada: 4, cadenaDano: 0.5,   // el rayo del Báculo: cada 4 ataques del mago, con la mitad de su daño en cada salto
  reloj: 3, cuerno: 5,  // segundos del Reloj de arena y del Cuerno de guerra
  confeti: 70,          // radio de la explosión del confeti
  plomo: 0.95,          // las Botas de plomo frenan un 5 % el paso
  becario: 1,           // la Hoja del becario: % de daño por oleada ganada
};
Object.assign(ASALTO.objetos, {
  // comunes (2 de esencia)
  grapadora:  { nombre: 'Grapadora de bolsillo', icono: 'objeto-grapadora', rareza: 0, stat: 'roba', v: [4, 7, 10], txt: 'Todos se curan el {v} % del daño que hacen' },
  zapatillas: { nombre: 'Zapatillas de oficina', icono: 'objeto-zapatillas', rareza: 0, stat: 'esquiva', v: [5, 9, 13], txt: 'Todos esquivan el {v} % de los golpes' },
  termo:      { nombre: 'Termo de café', icono: 'objeto-termo', rareza: 0, efecto: 'carga', v: [15, 25, 35], txt: 'Todos cargan sus hechizos un {v} % antes' },
  posit:      { nombre: 'Pósit de ánimo', icono: 'objeto-posit', rareza: 0, efecto: 'posit', v: [6, 10, 14], txt: 'Al empezar cada oleada, todos llevan un escudo del {v} % de su vida' },
  hucha:      { nombre: 'Hucha rota', icono: 'objeto-hucha', rareza: 0, efecto: 'oro', v: [1, 2, 3], txt: '+{v} de oro al ganar cada oleada' },
  lanza:      { nombre: 'Lanza de prácticas', icono: 'objeto-lanza', rareza: 0, stat: 'primero', v: [10, 18, 26], txt: 'El primer golpe de cada héroe en el combate hace un {v} % más' },
  mantita:    { nombre: 'Mantita de la siesta', icono: 'objeto-mantita', rareza: 0, efecto: 'atras', v: [6, 11, 16], txt: '+{v} % de vida para la fila de atrás' },
  carton:     { nombre: 'Escudo de cartón', icono: 'objeto-carton', rareza: 0, efecto: 'delante', v: [8, 14, 20], txt: '+{v} % de vida para la fila de delante' },
  rio:        { nombre: 'Piedra de río', icono: 'objeto-rio', rareza: 0, stat: 'defensa', v: [8, 14, 20], clases: ['tanque'], txt: 'Los tanques reciben un {v} % menos de daño' },
  arco:       { nombre: 'Arco de juguete', icono: 'objeto-arco', rareza: 0, stat: 'dano', v: [10, 18, 26], clases: ['tirador'], txt: '+{v} % de daño para los tiradores' },
  varita:     { nombre: 'Varita de saldo', icono: 'objeto-varita', rareza: 0, stat: 'prisa', v: [10, 18, 26], clases: ['mago'], txt: 'Los magos atacan un {v} % más rápido' },
  panuelo:    { nombre: 'Pañuelo de seda', icono: 'objeto-panuelo', rareza: 0, stat: 'esquiva', v: [6, 11, 16], clases: ['asesino'], txt: 'Los asesinos esquivan el {v} % de los golpes' },
  punos:      { nombre: 'Puños vendados', icono: 'objeto-punos', rareza: 0, stat: 'roba', v: [8, 14, 20], clases: ['luchador'], txt: 'Los luchadores se curan el {v} % del daño que hacen' },
  incienso:   { nombre: 'Incienso de bazar', icono: 'objeto-incienso', rareza: 0, stat: 'cura', v: [12, 20, 28], clases: ['sanador'], txt: 'Los sanadores curan un {v} % más' },
  // raros (3 de esencia)
  antorcha:   { nombre: 'Antorcha', icono: 'objeto-antorcha', rareza: 1, stat: 'quema', v: [1, 2, 3], txt: 'Los golpes queman: {v} % de la vida del enemigo por segundo durante 3 s' },
  tintero:    { nombre: 'Tintero maldito', icono: 'objeto-tintero', rareza: 1, stat: 'envenena', v: [2, 3, 4], clases: ['brujo'], txt: 'Los brujos envenenan: {v} % de vida por segundo durante 3 s' },
  martillo:   { nombre: 'Martillo de forja', icono: 'objeto-martillo', rareza: 1, stat: 'atonta', v: [6, 10, 14], txt: '{v} % de dejar al enemigo atontado 1 s' },
  hachaDoble: { nombre: 'Hacha doble', icono: 'objeto-hachaDoble', rareza: 1, stat: 'salpica', v: [30, 45, 60], clases: ['luchador'], txt: 'Los luchadores dan también al de al lado ({v} % del golpe)' },
  escarcha:   { nombre: 'Flecha de escarcha', icono: 'objeto-escarcha', rareza: 1, stat: 'frena', v: [15, 25, 35], clases: ['tirador'], txt: 'Los tiradores frenan al enemigo un {v} % durante 2 s' },
  sombras:    { nombre: 'Capa de sombras', icono: 'objeto-sombras', rareza: 1, stat: 'primeroCrit', v: [20, 35, 50], clases: ['asesino'], txt: 'El primer golpe de cada asesino es crítico y hace un {v} % más' },
  baculo:     { nombre: 'Báculo de rayos', icono: 'objeto-baculo', rareza: 1, stat: 'cadena', v: [2, 3, 4], clases: ['mago'], txt: 'Cada 4 ataques de un mago, rayo en cadena a {v} enemigos' },
  torre:      { nombre: 'Escudo de torre', icono: 'objeto-torre', rareza: 1, stat: 'reflejo', v: [15, 25, 35], clases: ['tanque'], txt: 'Los tanques devuelven el {v} % del daño' },
  amuleto:    { nombre: 'Amuleto de la segunda oportunidad', icono: 'objeto-amuleto', rareza: 1, efecto: 'segunda', v: [20, 35, 50], txt: 'El primer héroe que cae en cada oleada vuelve con el {v} % de vida' },
  avaro:      { nombre: 'Bolsa del avaro', icono: 'objeto-avaro', rareza: 1, efecto: 'esencia', v: [10, 18, 26], txt: 'Al ganar una oleada, {v} % de que dé 1 de esencia más' },
  reloj:      { nombre: 'Reloj de arena', icono: 'objeto-reloj', rareza: 1, efecto: 'reloj', v: [20, 35, 50], txt: 'Los 3 primeros segundos del combate todos atacan un {v} % más rápido' },
  ira:        { nombre: 'Gema de la ira', icono: 'objeto-ira', rareza: 1, efecto: 'ira', v: [2, 3, 4], w: [20, 30, 40], txt: 'Cada enemigo que cae da +{v} % de daño a todos en ese combate (tope {w} %)' },
  cuerno:     { nombre: 'Cuerno de guerra', icono: 'objeto-cuerno', rareza: 1, efecto: 'cuerno', v: [10, 18, 26], txt: 'Al empezar el combate, +{v} % de daño durante 5 s' },
  plomo:      { nombre: 'Botas de plomo', icono: 'objeto-plomo', rareza: 1, stat: 'plomo', v: [12, 20, 28], txt: '+{v} % de vida, pero todos van un 5 % más lentos' },
  espejo:     { nombre: 'Espejo de feria', icono: 'objeto-espejo', rareza: 1, stat: 'espejo', v: [6, 10, 14], txt: '{v} % de esquivar un golpe y devolverlo' },
  lupa:       { nombre: 'Lupa del auditor', icono: 'objeto-lupa', rareza: 1, stat: 'lupa', v: [15, 25, 35], txt: '+{v} % de daño a élites y jefes' },
  grilletes:  { nombre: 'Grilletes rotos', icono: 'objeto-grilletes', rareza: 1, stat: 'rabia', v: [20, 35, 50], txt: 'Con menos de media vida, el héroe hace un {v} % más de daño' },
  vela:       { nombre: 'Vela de cumpleaños', icono: 'objeto-vela', rareza: 1, stat: 'vela', v: [10, 18, 26], clases: ['sanador'], txt: 'La cura que sobra a los sanadores se vuelve escudo (hasta el {v} % de la vida)' },
  // épicos (5 de esencia)
  contrato:   { nombre: 'Contrato indefinido', icono: 'objeto-contrato', rareza: 2, efecto: 'contrato', v: [1, 2, 3], txt: 'La primera vez que cada héroe iba a caer, se queda con 1 de vida (hasta {v} héroes por combate)' },
  hoja:       { nombre: 'Hoja del becario eterno', icono: 'objeto-hoja', rareza: 2, stat: 'becario', v: [10, 15, 20], txt: 'Cada oleada ganada da +1 % de daño a todos hasta el final de la partida (tope {v} %)' },
  baston:     { nombre: 'Bastón del Altar', icono: 'objeto-baston', rareza: 2, efecto: 'rebaja', v: [1, 2, 3], txt: 'Invocar cuesta {v} de oro menos (nunca menos de 1)' },
  runa:       { nombre: 'Runa del comodín', icono: 'objeto-runa', rareza: 2, efecto: 'comodines', v: [5, 8, 11], txt: 'El Altar saca un {v} % más de comodines' },
  cetro:      { nombre: 'Cetro del CEO', icono: 'objeto-cetro', rareza: 2, stat: 'cetro', v: [12, 20, 28], txt: '+{v} % de vida y daño para los héroes épicos o mejores' },
  tambor:     { nombre: 'Tambor de guerra', icono: 'objeto-tambor', rareza: 2, stat: 'tambor', v: [10, 16, 22], txt: 'Todos atacan y se mueven un {v} % más rápido' },
  ojo:        { nombre: 'Ojo del dragón de la nube', icono: 'objeto-ojo', rareza: 2, stat: 'ojo', v: [10, 16, 22], w: [25, 40, 55], txt: '+{v} % de crítico y los críticos hacen un {w} % más' },
  manto:      { nombre: 'Manto del mártir', icono: 'objeto-manto', rareza: 2, efecto: 'martir', v: [15, 25, 35], txt: 'Cuando cae un héroe, los demás se curan el {v} % de su vida' },
  confeti:    { nombre: 'Bomba de confeti', icono: 'objeto-confeti', rareza: 2, efecto: 'confeti', v: [10, 18, 26], txt: 'Cada enemigo que cae explota y quita a los de al lado el {v} % de su vida' },
  brujula:    { nombre: 'Brújula del destino', icono: 'objeto-brujula', rareza: 2, efecto: 'brujula', v: [1, 1, 2], w: [10, 20, 30], txt: 'Más plazo en las misiones de piedra (+{v} oleadas) y un {w} % de que la piedra sea mejor' },
  prohibido:  { nombre: 'Grimorio prohibido', icono: 'objeto-prohibido', rareza: 2, efecto: 'eco', v: [30, 45, 60], txt: 'Cada hechizo de magos y brujos sale otra vez al {v} % de fuerza' },
  bandera:    { nombre: 'Bandera de la empresa', icono: 'objeto-bandera', rareza: 2, stat: 'bandera', v: [2, 3, 4], txt: '+{v} % de vida y daño a todos por cada clase distinta en el campo' },
});
