// Fans Of Mining · DATOS: qué hay en el juego (materiales, zonas, facciones, mejoras, Recuerdos, plan de carrera y objetos), con sus textos
// en español (el inglés, en idioma/en-mining.js). Las cifras de cada cosa están en ajustes.js; aquí solo qué existe y qué bono da.
// Un bono es { clave: cantidad por nivel }; lo suma o lo multiplica MN.bonos (dominio/bonos.js) según la clave.
'use strict';
MN.MATERIALES = [
  { id: 'carton', nombre: 'Cartón', color: '#c8945a', bono: { dano: 0.10 }, txt: '+10 % de daño del pico' },
  { id: 'grapas', nombre: 'Grapas', color: '#b8c4d0', bono: { vel: 0.03 }, txt: '+3 % de velocidad' },
  { id: 'clips', nombre: 'Clips', color: '#ff6fae', bono: { x2: 0.02 }, txt: '+2 % de reciclado doble' },
  { id: 'carpetas', nombre: 'Carpetas', color: '#ffd23f', bono: { precio: 0.10 }, txt: '+10 % de precio de venta' },
  { id: 'disquetes', nombre: 'Disquetes', color: '#4aa3ff', bono: { xp: 0.10 }, txt: '+10 % de experiencia' },
  { id: 'cables', nombre: 'Cables', color: '#ff7a3d', bono: { dinamita: 0.25 }, txt: '+25 % de daño de la dinamita' },
  { id: 'discos', nombre: 'Discos duros', color: '#9aa7b8', bono: { multiRoca: 0.01 }, txt: '+1 % de bloque triple' },
  { id: 'placas', nombre: 'Placas', color: '#3ddc84', bono: { crit: 0.01 }, txt: '+1 % de golpe crítico' },
  { id: 'cartuchos', nombre: 'Cartuchos', color: '#b06bff', bono: { dorada: 0.005 }, txt: '+0,5 % de planta dorada' },
  { id: 'cds', nombre: 'CD', color: '#7ef9ff', bono: { dano: 0.20 }, txt: '+20 % de daño del pico' },
  { id: 'consolas', nombre: 'Consolas', color: '#ff4d5e', bono: { indemn: 0.05 }, txt: '+5 % de Indemnización' },
  { id: 'servidor', nombre: 'Servidores viejos', color: '#6f7d8c', bono: { trit: 0.10 }, txt: '+10 % de daño a la Trituradora' },
];

MN.ZONAS = [
  { id: 'archivo', nombre: 'El Archivo', fondo: 'archivo', musica: 'animales' },
  { id: 'servidores', nombre: 'La Sala de servidores', fondo: 'servidores', musica: 'ciber' },
  { id: 'almacen', nombre: 'El Almacén de los Olvidados', fondo: 'almacen', musica: 'olvidados' },
];

// las facciones en el orden en que se liberan: la primera ya está; cada nivel roto de la Trituradora libera la siguiente.
// fac = la facción de core/js/serie; arte = el dibujo de su líder (ART de core/js/serie/arte); bono = su poder en Mining.
// La última no es una facción del jugador: es el becario de Microblizz, que se pasa a tu bando
MN.FACCIONES = [
  { fac: 'animales', arte: 'bunny', lider: 'CrazyBunny', poder: 'RABIA', bono: { dano: 0.15 }, txt: '+15 % de daño del pico' },
  { fac: 'streamers', arte: 'twitchking', lider: 'StreamKing', poder: 'HYPE', bono: { vel: 0.10 }, txt: '+10 % de velocidad' },
  { fac: 'nomuertos', arte: 'necrolord', lider: 'NecroLord', poder: 'RENACER', bono: { multiRoca: 0.03 }, txt: '+3 % de bloque triple' },
  { fac: 'heroes', arte: 'epicchampion', lider: 'EpicChampion', poder: 'EXPERIENCIA', bono: { xp: 0.25 }, txt: '+25 % de experiencia' },
  { fac: 'ciber', arte: 'cybermarine', lider: 'CyberMarine', poder: 'ESCUDOS', bono: { trit: 0.25 }, txt: '+25 % de daño a la Trituradora' },
  { fac: 'memes', arte: 'memelord', lider: 'MemeLord', poder: 'RNG', bono: { crit: 0.03 }, txt: '+3 % de golpe crítico' },
  { fac: 'gamer', arte: 'progamer', lider: 'ProGamer', poder: 'COMUNIDAD', bono: { ayud: 0.25 }, txt: '+25 % de daño de los ayudantes' },
  { fac: 'olvidados', arte: 'vikingo', lider: 'VikingoPerdido', poder: 'NOSTALGIA', bono: { horasExtra: 0.10 }, txt: '+10 % de horas extra' },
  { fac: 'pop', arte: 'directora', lider: 'LaDirectora', poder: 'SECUELA', bono: { dinamita: 0.5 }, txt: '+50 % de daño de la dinamita' },
  { fac: 'microblizz', arte: 'becario', lider: 'El Becario', poder: 'SIN CONTRATO', bono: { precio: 0.5 }, txt: '+50 % de precio de venta' },
];

// los Recuerdos: bonos permanentes que se compran con Indemnización
MN.RECUERDOS = [
  { id: 'zanahoria', nombre: 'La zanahoria de oro', bono: { dano: 0.25 }, txt: '+25 % de daño del pico' },
  { id: 'mando', nombre: 'Un mando sin cable', bono: { vel: 0.05 }, txt: '+5 % de velocidad' },
  { id: 'caja', nombre: 'La caja del primer juego', bono: { precio: 0.20 }, txt: '+20 % de precio de venta' },
  { id: 'manual', nombre: 'El manual de instrucciones', bono: { coste: 0.04 }, txt: '−4 % de coste de reciclar' },
  { id: 'guardado', nombre: 'Una partida guardada', bono: { xp: 0.15 }, txt: '+15 % de experiencia' },
  { id: 'petardo', nombre: 'El petardo de la fiesta de lanzamiento', bono: { dinamita: 0.25 }, txt: '+25 % de daño de la dinamita' },
  { id: 'enchufe', nombre: 'El enchufe arrancado', bono: { espera: 0.04 }, txt: '−4 % de espera de la Trituradora' },
  { id: 'carta', nombre: 'La carta de un fan', bono: { indemn: 0.10 }, txt: '+10 % de Indemnización' },
];

// el plan de carrera (el árbol de habilidades): cada nodo cuesta puntos y algunos piden otro antes
MN.CARRERA = [
  { id: 'auto', nombre: 'Becario de la dinamita', coste: 1, pide: null, bono: { autoDinamita: 1 }, txt: 'La dinamita se lanza sola' },
  { id: 'crit', nombre: 'Ojo crítico', coste: 1, pide: null, bono: { crit: 0.05 }, txt: '+5 % de golpe crítico' },
  { id: 'super', nombre: 'Crítico del crítico', coste: 2, pide: 'crit', bono: { superCrit: 0.10 }, txt: 'Un 10 % de los críticos pegan x3 más' },
  { id: 'dorada', nombre: 'Olfato de oro', coste: 1, pide: null, bono: { dorada: 0.03 }, txt: '+3 % de planta dorada' },
  { id: 'arcoiris', nombre: 'Planta arcoíris', coste: 2, pide: 'dorada', bono: { arcoiris: 0.15 }, txt: 'Un 15 % de las plantas doradas pasan a arcoíris (x10)' },
  { id: 'tope', nombre: 'Horas de formación', coste: 2, pide: null, bono: { topeMaterial: 10 }, txt: '+10 niveles de tope en las mejoras de material' },
  { id: 'equipo', nombre: 'Trabajo en equipo', coste: 2, pide: null, bono: { ayud: 0.5 }, txt: '+50 % de daño de los ayudantes' },
  { id: 'correo', nombre: 'Bandeja de entrada', coste: 1, pide: null, bono: { correosDobles: 1 }, txt: 'Los correos del CEO dan el doble' },
  { id: 'cofres', nombre: 'Inventario', coste: 1, pide: null, bono: { medidor: 0.5 }, txt: 'Los cofres se llenan un 50 % más rápido' },
  { id: 'extra', nombre: 'Convenio colectivo', coste: 2, pide: 'cofres', bono: { horasExtra: 0.15 }, txt: '+15 % de horas extra' },
  { id: 'triple', nombre: 'Reciclaje creativo', coste: 2, pide: null, bono: { x3: 0.05 }, txt: 'Un 5 % de reciclado triple' },
  { id: 'autodespido', nombre: 'Carta de despido firmada', coste: 2, pide: 'auto', bono: {}, txt: 'El equipo se despide solo al llegar al nivel que elijas' },
  { id: 'abogado', nombre: 'Abogado laboralista', coste: 3, pide: 'extra', bono: { indemn: 0.25 }, txt: '+25 % de Indemnización' },
];

// los objetos de los cofres: se guardan y se usan cuando quieres; duran AJ.cofre.duracion segundos (el mechero es al momento)
MN.OBJETOS = [
  { id: 'cafe', nombre: 'Café de máquina', bono: { vel: 1 }, txt: 'x2 de velocidad durante un minuto' },
  { id: 'pizza', nombre: 'Pizza de reunión', bono: { botin: 1 }, txt: 'x2 de materiales durante un minuto' },
  { id: 'bocadillo', nombre: 'Bocadillo de la madre del streamer', bono: { xp: 1 }, txt: 'x2 de experiencia durante un minuto' },
  { id: 'mechero', nombre: 'Mechero del castor', bono: {}, txt: 'La dinamita, lista al momento' },
];
