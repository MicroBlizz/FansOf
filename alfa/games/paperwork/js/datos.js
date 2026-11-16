// Fans Of Paperwork · DATOS: qué hay en el juego (tipos de documento, zonas, facciones, útiles, Recuerdos, plan de carrera y objetos), con sus
// textos en español (el inglés, en idioma/en-paperwork.js). Las cifras de cada cosa están en ajustes.js; aquí solo qué existe y qué bono da.
// Un bono es { clave: cantidad por nivel }; lo suma o lo multiplica PW.bonos (dominio/bonos.js) según la clave.
'use strict';
// los 12 tipos de documento, de lo más corriente a lo más enterrado: cuatro por zona
PW.DOCUMENTOS = [
  { id: 'tiques', nombre: 'Tiques de café', color: '#f2e9d8', bono: { dano: 0.10 }, txt: '+10 % de lectura' },
  { id: 'memos', nombre: 'Memos', color: '#ffd23f', bono: { vel: 0.03 }, txt: '+3 % de velocidad' },
  { id: 'facturas', nombre: 'Facturas', color: '#7ad0ff', bono: { x2: 0.02 }, txt: '+2 % de clasificado doble' },
  { id: 'contratos', nombre: 'Contratos', color: '#c8945a', bono: { precio: 0.10 }, txt: '+10 % de precio de venta' },
  { id: 'partes', nombre: 'Partes de errores', color: '#ff7a3d', bono: { xp: 0.10 }, txt: '+10 % de experiencia' },
  { id: 'actas', nombre: 'Actas de reunión', color: '#b8c4d0', bono: { estanteria: 0.25 }, txt: '+25 % de fuerza del castor' },
  { id: 'copias', nombre: 'Copias de seguridad', color: '#4aa3ff', bono: { repleto: 0.01 }, txt: '+1 % de archivador repleto' },
  { id: 'codigo', nombre: 'Código fuente', color: '#3ddc84', bono: { confidencial: 0.01 }, txt: '+1 % de sello confidencial' },
  { id: 'guiones', nombre: 'Guiones', color: '#ff6fae', bono: { jefe: 0.005 }, txt: '+0,5 % de archivo del jefe' },
  { id: 'bocetos', nombre: 'Bocetos', color: '#b06bff', bono: { dano: 0.20 }, txt: '+20 % de lectura' },
  { id: 'disenos', nombre: 'Diseños cancelados', color: '#7ef9ff', bono: { indemn: 0.05 }, txt: '+5 % de Indemnización' },
  { id: 'master', nombre: 'El máster de oro', color: '#ffb300', bono: { trit: 0.10 }, txt: '+10 % de atasco a la Trituradora' },
];

// cada zona guarda su papel de una manera (grapado, plastificado, encuadernado) y tiene su herramienta, que le quita dureza
PW.ZONAS = [
  { id: 'archivo', nombre: 'El Archivo', fondo: 'archivo', musica: 'animales', papel: 'grapado', herramienta: { id: 'quitagrapas', nombre: 'Quitagrapas' } },
  { id: 'servidores', nombre: 'La Sala de servidores', fondo: 'servidores', musica: 'ciber', papel: 'plastificado', herramienta: { id: 'cuter', nombre: 'Cúter' } },
  { id: 'almacen', nombre: 'El Almacén de los Olvidados', fondo: 'almacen', musica: 'olvidados', papel: 'encuadernado', herramienta: { id: 'abrecartas', nombre: 'Abrecartas' } },
];

// lo que se abre al atascar cada nivel de la Trituradora (dominio/desbloqueos.js). Lo que no sale aquí está desde el principio.
PW.DESBLOQUEOS = [
  { id: 'carrera', nivel: 1, nombre: 'Tu carrera', txt: 'El Despido, los Recuerdos, tu equipo y las cartas de recomendación' },
  { id: 'carrito', nivel: 1, nombre: 'Carrito de archivo', txt: 'Un útil nuevo: se lleva también lo del archivador de al lado' },
  { id: 'sellos', nivel: 2, nombre: 'Sellos y munición', txt: 'Documentos confidenciales, urgentes y caducados, y elegir qué le echas a la Trituradora' },
  { id: 'cofres', nivel: 2, nombre: 'Cofres', txt: 'Vaciando archivadores salen cofres con objetos' },
  { id: 'plan', nivel: 3, nombre: 'Plan de carrera y retos', txt: 'Puntos de carrera para mejoras permanentes, y misiones diarias y logros' },
  { id: 'sindicato', nivel: 1, nombre: 'Paquete del sindicato', txt: 'Cada 10 minutos, un mérito para toda la carrera y grapas de oro' },
  { id: 'rarezas', nivel: 4, nombre: 'Méritos raros', txt: 'Los méritos del paquete pueden salir raros, épicos, legendarios o míticos, y valen más' },
  { id: 'encargos', nivel: 4, nombre: 'Pedidos del CEO y auditorías', txt: 'Encargos con plazo en los correos y archivadores precintados por IAhorro' },
];
// los útiles del líder, que se compran con oro y se pierden con el Despido (las cifras, en AJ.utiles)
PW.UTILES = [
  { id: 'gafas', nombre: 'Gafas de cerca' },
  { id: 'cafe', nombre: 'Café' },
  { id: 'guantes', nombre: 'Guantes', duro: true },   // sale cuando aparece el primer papel con dureza
  { id: 'carrito', nombre: 'Carrito de archivo', abre: 'carrito' },   // sale al abrirse su desbloqueo
  { id: 'fundas', nombre: 'Fundas de plástico', zona: 2 },   // solo sale al llegar a su zona
];

// las facciones en el orden en que se liberan: la primera ya está; cada nivel atascado de la Trituradora libera la siguiente.
// fac = la facción de core/js/serie; arte = el dibujo de su líder (ART de core/js/serie/arte); bono = su poder en Paperwork;
// mania = cómo rebusca cuando trabaja en su archivador (la regla, en dominio/equipo.js y AJ.manias).
// La última no es una facción del jugador: es el becario de Microblizz, que se pasa a tu bando
PW.FACCIONES = [
  { fac: 'animales', arte: 'bunny', lider: 'CrazyBunny', poder: 'RABIA', bono: { dano: 0.15 }, txt: '+15 % de lectura', mania: 'Es el líder: rebusca donde le señales' },
  { fac: 'streamers', arte: 'twitchking', lider: 'StreamKing', poder: 'HYPE', bono: { vel: 0.10 }, txt: '+10 % de velocidad', mania: 'Lee el doble si has tocado un archivador en los últimos 5 s' },
  { fac: 'nomuertos', arte: 'necrolord', lider: 'NecroLord', poder: 'RENACER', bono: { repleto: 0.03 }, txt: '+3 % de archivador repleto', mania: 'Un 20 % de las veces saca el doble de documentos' },
  { fac: 'heroes', arte: 'epicchampion', lider: 'EpicChampion', poder: 'EXPERIENCIA', bono: { xp: 0.25 }, txt: '+25 % de experiencia', mania: 'Gana el triple de experiencia con lo que vacía' },
  { fac: 'ciber', arte: 'cybermarine', lider: 'CyberMarine', poder: 'ESCUDOS', bono: { trit: 0.25 }, txt: '+25 % de atasco a la Trituradora', mania: 'No nota la dureza del papel' },
  { fac: 'memes', arte: 'memelord', lider: 'MemeLord', poder: 'RNG', bono: { confidencial: 0.03 }, txt: '+3 % de sello confidencial', mania: 'Cada vistazo suyo lee entre nada y el triple' },
  { fac: 'gamer', arte: 'progamer', lider: 'ProGamer', poder: 'COMUNIDAD', bono: { trab: 0.25 }, txt: '+25 % de lectura de los trabajadores', mania: 'Rebusca un 50 % más rápido' },
  { fac: 'olvidados', arte: 'vikingo', lider: 'VikingoPerdido', poder: 'NOSTALGIA', bono: { horasExtra: 0.10 }, txt: '+10 % de horas extra', mania: 'Lee el doble en el Almacén de los Olvidados' },
  { fac: 'pop', arte: 'directora', lider: 'LaDirectora', poder: 'SECUELA', bono: { estanteria: 0.5 }, txt: '+50 % de fuerza del castor', mania: 'Cada vistazo suyo da también al archivador de al lado' },
  { fac: 'microblizz', arte: 'becario', lider: 'El Becario', poder: 'SIN CONTRATO', bono: { precio: 0.5 }, txt: '+50 % de precio de venta', mania: 'Va a la mitad de velocidad, pero saca un 15 % más de confidenciales' },
];

// los Recuerdos: bonos permanentes que se compran con Indemnización
PW.RECUERDOS = [
  { id: 'zanahoria', nombre: 'La zanahoria de oro', bono: { dano: 0.25 }, txt: '+25 % de lectura' },
  { id: 'mando', nombre: 'Un mando sin cable', bono: { vel: 0.05 }, txt: '+5 % de velocidad' },
  { id: 'caja', nombre: 'La caja del primer juego', bono: { precio: 0.20 }, txt: '+20 % de precio de venta' },
  { id: 'manual', nombre: 'El manual de instrucciones', bono: { coste: 0.04 }, txt: '−4 % de documentos por expediente' },
  { id: 'guardado', nombre: 'Una partida guardada', bono: { xp: 0.15 }, txt: '+15 % de experiencia' },
  { id: 'petardo', nombre: 'El petardo de la fiesta de lanzamiento', bono: { estanteria: 0.25 }, txt: '+25 % de fuerza del castor' },
  { id: 'enchufe', nombre: 'El enchufe arrancado', bono: { espera: 0.04 }, txt: '−4 % de espera de la Trituradora' },
  { id: 'carta', nombre: 'La carta de un fan', bono: { indemn: 0.10 }, txt: '+10 % de Indemnización' },
  { id: 'plano', nombre: 'El plano del archivo', bono: { entrada: 0.04 }, txt: '−4 % de archivadores para encontrar la entrada' },
];

// la rareza de un mérito del paquete (abierta al nivel 4 de la Trituradora): peso de cada 100 tiradas y por cuánto multiplica su bono
PW.RAREZAS = [
  { id: 'comun', nombre: 'común', peso: 48, vale: 1, color: '#c8c8d0' },
  { id: 'raro', nombre: 'raro', peso: 30, vale: 2, color: '#4da3ff' },
  { id: 'epico', nombre: 'épico', peso: 14, vale: 3, color: '#b06cff' },
  { id: 'legendario', nombre: 'legendario', peso: 7, vale: 5, color: '#ffb02e' },
  { id: 'mitico', nombre: 'mítico', peso: 1, vale: 10, color: '#ff4d8d' },
];
// los hitos: lo que se regala al acumular Despidos (lo tedioso se automatiza solo). nodo = el del plan de carrera que regala (si lo hay)
PW.HITOS = [
  { id: 'castor', despidos: 3, nodo: 'auto', bono: { autoEstanteria: 1 }, nombre: 'Castor en plantilla', txt: 'El castor vuelca la estantería solo' },
  { id: 'carta', despidos: 6, nodo: 'autodespido', bono: {}, nombre: 'Carta de despido firmada', txt: 'El equipo se despide solo al llegar al nivel que elijas' },
  { id: 'veterano', despidos: 10, bono: { sindicatoMax: 1 }, nombre: 'Veterano del sindicato', txt: 'Cabe un paquete más en la taquilla' },
];
// los méritos: los trae el paquete del sindicato, uno al azar cada vez; cada uno suma su bono por su rareza, sin tope, y no se pierden nunca
PW.MERITOS = [
  { id: 'puntual', nombre: 'Llega puntual', bono: { dano: 0.01 }, txt: '+1 % de lectura' },
  { id: 'cafe', nombre: 'Hace el café para todos', bono: { vel: 0.01 }, txt: '+1 % de velocidad' },
  { id: 'cliente', nombre: 'Cliente satisfecho', bono: { precio: 0.01 }, txt: '+1 % de precio de venta' },
  { id: 'curso', nombre: 'Curso de formación', bono: { xp: 0.01 }, txt: '+1 % de experiencia' },
  { id: 'castor', nombre: 'Amigo del castor', bono: { estanteria: 0.01 }, txt: '+1 % de fuerza del castor' },
  { id: 'atasco', nombre: 'Atascador del mes', bono: { trit: 0.01 }, txt: '+1 % de atasco a la Trituradora' },
  { id: 'antiguedad', nombre: 'Antigüedad', bono: { indemn: 0.01 }, txt: '+1 % de Indemnización' },
  { id: 'atajo', nombre: 'Se sabe los atajos', bono: { entrada: 0.005 }, txt: '−0,5 % de archivadores para encontrar la entrada' },
];

// el plan de carrera (el árbol de habilidades): cada nodo cuesta puntos y algunos piden otro antes
PW.CARRERA = [
  { id: 'auto', nombre: 'Castor en plantilla', coste: 1, pide: null, bono: { autoEstanteria: 1 }, txt: 'El castor vuelca la estantería solo' },
  { id: 'sello', nombre: 'Ojo para lo confidencial', coste: 1, pide: null, bono: { confidencial: 0.05 }, txt: '+5 % de sello confidencial' },
  { id: 'secreto', nombre: 'Alto secreto', coste: 2, pide: 'sello', bono: { altoSecreto: 0.10 }, txt: 'Un 10 % de los confidenciales son alto secreto (x9)' },
  { id: 'jefe', nombre: 'Olfato de despacho', coste: 1, pide: null, bono: { jefe: 0.03 }, txt: '+3 % de archivo del jefe' },
  { id: 'ceo', nombre: 'La llave del CEO', coste: 2, pide: 'jefe', bono: { ceo: 0.15 }, txt: 'Un 15 % de los archivos del jefe pasan a archivo del CEO (x10)' },
  { id: 'tope', nombre: 'Horas de formación', coste: 2, pide: null, bono: { topeDocumento: 10 }, txt: '+10 niveles de tope en las mejoras de documento' },
  { id: 'equipo', nombre: 'Trabajo en equipo', coste: 2, pide: null, bono: { trab: 0.5 }, txt: '+50 % de lectura de los trabajadores' },
  { id: 'correo', nombre: 'Bandeja de entrada', coste: 1, pide: null, bono: { correosDobles: 1 }, txt: 'Los correos del CEO dan el doble' },
  { id: 'cofres', nombre: 'Inventario', coste: 1, pide: null, bono: { medidor: 0.5 }, txt: 'Los cofres se llenan un 50 % más rápido' },
  { id: 'extra', nombre: 'Convenio colectivo', coste: 2, pide: 'cofres', bono: { horasExtra: 0.15 }, txt: '+15 % de horas extra' },
  { id: 'triple', nombre: 'Clasificación creativa', coste: 2, pide: null, bono: { x3: 0.05 }, txt: 'Un 5 % de clasificado triple' },
  { id: 'autodespido', nombre: 'Carta de despido firmada', coste: 2, pide: 'auto', bono: {}, txt: 'El equipo se despide solo al llegar al nivel que elijas' },
  { id: 'fotocopiadora', nombre: 'La fotocopiadora', coste: 2, pide: null, bono: {}, txt: 'Elige un tipo de documento: sus archivadores dan el doble' },
  { id: 'dron', nombre: 'Dron de reparto', coste: 2, pide: 'equipo', bono: { drones: 1 }, txt: 'Un dron rebusca en la fila de arriba del pasillo' },
  { id: 'enlace', nombre: 'Enlace sindical', coste: 1, pide: null, bono: { sindicatoCada: 150 }, txt: 'El paquete del sindicato llega 2,5 minutos antes' },
  { id: 'delegado', nombre: 'Delegado sindical', coste: 3, pide: 'enlace', bono: { sindicatoCada: 150 }, txt: 'Y otros 2,5 minutos antes (cada 5 minutos)' },
  { id: 'afiliados', nombre: 'Más afiliados', coste: 1, pide: null, bono: { sindicatoMax: 3 }, txt: 'Se guardan 3 paquetes más' },
  { id: 'comite', nombre: 'Comité de empresa', coste: 3, pide: 'afiliados', bono: { sindicatoMax: 3 }, txt: 'Y otros 3 más (hasta 10)' },
  { id: 'cuota', nombre: 'Cuota sindical', coste: 2, pide: null, bono: { grapasPaquete: 1 }, txt: '+1 grapa de oro en cada paquete' },
  { id: 'caja', nombre: 'Caja de resistencia', coste: 4, pide: 'cuota', bono: { grapasPaquete: 2 }, txt: '+2 grapas de oro más en cada paquete' },
  { id: 'abogado', nombre: 'Abogado laboralista', coste: 3, pide: 'extra', bono: { indemn: 0.25 }, txt: '+25 % de Indemnización' },
];

// los objetos de los cofres: se guardan y se usan cuando quieres; duran AJ.cofre.duracion segundos (el silbato es al momento)
PW.OBJETOS = [
  { id: 'cafe', nombre: 'Café doble', bono: { vel: 1 }, txt: 'x2 de velocidad durante un minuto' },
  { id: 'pizza', nombre: 'Pizza de reunión', bono: { botin: 1 }, txt: 'x2 de documentos durante un minuto' },
  { id: 'bocadillo', nombre: 'Bocadillo de la madre del streamer', bono: { xp: 1 }, txt: 'x2 de experiencia durante un minuto' },
  { id: 'silbato', nombre: 'Silbato del castor', bono: {}, txt: 'El castor vuelca la estantería al momento' },
];

// las cartas de recomendación: tras cada Despido se ofrecen AJ.cartas.ofrece al azar y se elige una para el turno que empieza
// (lo que hace cada una, en dominio/cartas.js; las cifras, en AJ.cartas)
PW.CARTAS = [
  { id: 'termo', nombre: 'Un termo lleno', txt: 'Café doble durante 10 minutos' },
  { id: 'temporal', nombre: 'Un dron prestado', txt: 'Un dron más en el equipo durante este turno' },
  { id: 'ascensor', nombre: 'La llave del ascensor', txt: 'Bajas 10 plantas de golpe' },
  { id: 'guantes', nombre: 'Guantes de segunda mano', txt: '+5 niveles de guantes' },
  { id: 'adelanto', nombre: 'Un adelanto de la nómina', txt: 'Oro en el bolsillo, más cuanto más atascada esté la Trituradora' },
  { id: 'lacre', nombre: 'Un sello de lacre', txt: '+10 % de sello confidencial durante este turno' },
];
