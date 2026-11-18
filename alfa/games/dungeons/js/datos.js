// Fans of Dungeons · Los datos del juego: clases, enemigos, jefes, objetos, zonas y la tabla de plantas. Todas las cifras viven
// aquí (nada «a mano» dentro de las funciones) para poder tocarlas en la fase de balance. Los textos van en español y su
// inglés está en textos.js.
'use strict';

// las clases: los líderes de las facciones. pasiva y habilidad se resuelven en jugador.js
const CLASES = {
  bunny: { nombre: 'CrazyBunny', faccion: 'Animales Locos', papel: 'Guerrero caótico', vida: 42, atq: 7, def: 1, cafe: 20, vision: 7, vel: 100, arma: 'zanahoria', alcance: 1,
    habilidad: 'Chaos Jump', habDesc: 'Salta hasta 3 casillas sobre el grupo de enemigos más grande y pega a todos los de alrededor.', coste: 8, enfria: 6,
    pasiva: 'Rabia', pasivaDesc: 'Pega un 15 % más por cada enemigo que tenga pegado.', libera: '' },
  cybermarine: { nombre: 'CyberMarine', faccion: 'Ciberpunks', papel: 'Tirador', vida: 34, atq: 6, def: 2, cafe: 24, vision: 9, vel: 100, arma: 'fusil', alcance: 5,
    habilidad: 'Ráfaga', habDesc: 'Dispara a todos los enemigos en línea recta hasta 5 casillas.', coste: 10, enfria: 5,
    pasiva: 'Escudos', pasivaDesc: 'Un escudo de plasma de 8 puntos que se recarga si no te pegan en 3 turnos.', libera: 'Vence a SurvivalBot (planta 4)' },
  necrolord: { nombre: 'NecroLord', faccion: 'No-Muertos', papel: 'Mago e invocador', vida: 36, atq: 6, def: 2, cafe: 40, vision: 7, vel: 100, arma: 'baculo', alcance: 3,
    habilidad: 'Invocar bug', habDesc: 'Levanta un bug aliado de los restos de un enemigo (o de la nada). Te sigue para siempre, también de planta en planta; hasta 3. Con los 3 en pie, el Poder los repara.', coste: 10, enfria: 3,
    pasiva: 'Renacer', pasivaDesc: 'La primera vez que caes, te levantas con la mitad de la vida.', libera: 'Llega al Cementerio de juegos (planta 5)' },
  slyfox: { nombre: 'SlyFox', faccion: 'Animales Locos', papel: 'Ladrón', vida: 30, atq: 7, def: 1, cafe: 24, vision: 8, vel: 110, arma: 'abrecartas', alcance: 1,
    habilidad: 'Esfumarse', habDesc: 'Te vuelves invisible 4 turnos: los enemigos te pierden de vista. Si despides a alguien a traición, sigues invisible.', coste: 8, enfria: 7,
    pasiva: 'A traición', pasivaDesc: 'El golpe a un enemigo que no te ha visto (o desde la invisibilidad) hace dos veces y media más daño. Y abre las puertas con llave con su ganzúa.', libera: 'Abre una sala de tesoro' },
};
const CLASES_ORDEN = ['bunny', 'cybermarine', 'necrolord', 'slyfox'];

// las zonas de la torre y sus plantas
const ZONAS = {
  oficinas: { nombre: 'Las Oficinas', desde: 1, hasta: 4, receta: 'salas', enemigos: ['becario', 'starbot', 'cajabotin', 'reclutador', 'impresora'], elite: 'cajabotin', jefe: 'survivalbot', mini: 'rrhh' },
  cementerio: { nombre: 'El Cementerio de juegos', desde: 5, hasta: 8, receta: 'cuevas', enemigos: ['esqueleto', 'zombi', 'fantasma', 'murcielago'], elite: 'cosido', jefe: 'becariomes', mini: 'lich' },
  foro: { nombre: 'El Foro Infinito', desde: 9, hasta: 12, receta: 'salas', enemigos: ['soporte', 'fallen', 'abogado', 'troll'], elite: 'fallen', jefe: 'parche', mini: 'moderador' },
  azotea: { nombre: 'El despacho del CEO', desde: 13, hasta: 13, receta: 'salas', enemigos: ['becario', 'esqueleto', 'abogado', 'soporte'], elite: 'fallen', jefe: 'ceo' },
};
function zonaDe(planta) { for (const z in ZONAS) if (planta >= ZONAS[z].desde && planta <= ZONAS[z].hasta) return z; return 'azotea'; }
const PLANTA_FINAL = 13;

// la tabla de plantas: tamaño, presupuesto de enemigos, elites, trampas y rarezas del botín (común / raro / épico o mejor)
const PLANTAS = {
  1: { w: 40, h: 28, presupuesto: 11, elites: 0, trampas: 2, botin: [80, 18, 2], cofres: 1, objetos: 4 },
  2: { w: 44, h: 30, presupuesto: 14, elites: 0.05, trampas: 3, botin: [75, 22, 3], cofres: 1, objetos: 4 },
  3: { w: 48, h: 32, presupuesto: 17, elites: 0.1, trampas: 4, botin: [70, 25, 5], cofres: 2, objetos: 4, tienda: true },
  4: { w: 48, h: 32, presupuesto: 12, elites: 0.1, trampas: 3, botin: [60, 30, 10], cofres: 1, objetos: 3, jefe: true },
  5: { w: 52, h: 36, presupuesto: 16, elites: 0.1, trampas: 5, botin: [60, 30, 10], cofres: 2, objetos: 4 },
  6: { w: 52, h: 36, presupuesto: 19, elites: 0.1, trampas: 5, botin: [60, 30, 10], cofres: 2, objetos: 4 },
  7: { w: 52, h: 36, presupuesto: 22, elites: 0.1, trampas: 5, botin: [60, 30, 10], cofres: 2, objetos: 5, tienda: true },
  8: { w: 52, h: 36, presupuesto: 18, elites: 0.15, trampas: 4, botin: [50, 35, 15], cofres: 1, objetos: 3, jefe: true },
  9: { w: 56, h: 40, presupuesto: 24, elites: 0.15, trampas: 6, botin: [50, 35, 15], cofres: 2, objetos: 5 },
  10: { w: 56, h: 40, presupuesto: 27, elites: 0.15, trampas: 6, botin: [50, 35, 15], cofres: 2, objetos: 5 },
  11: { w: 56, h: 40, presupuesto: 30, elites: 0.15, trampas: 6, botin: [50, 35, 15], cofres: 2, objetos: 5, tienda: true },
  12: { w: 56, h: 40, presupuesto: 26, elites: 0.2, trampas: 5, botin: [40, 40, 20], cofres: 1, objetos: 4, jefe: true },
  13: { w: 34, h: 30, presupuesto: 10, elites: 0.25, trampas: 0, botin: [30, 40, 30], cofres: 1, objetos: 3, jefe: true },
};
const SUBIDA_POR_PLANTA = 0.08;   // vida y ataque de los enemigos: +8 % por planta

// los enemigos: cifras de la planta 1 de su zona. comp: cazador, patrulla, guardian, tirador, cobarde, mimico, sanador
const ENEMIGOS = {
  becario: { nombre: 'Becario', vida: 12, atq: 4, def: 0, vel: 100, vision: 6, comp: 'cazador', coste: 1, xp: 5, fig: 'becario', frase: '¿Esto cuenta como prácticas?' },
  starbot: { nombre: 'StarBot', vida: 10, atq: 5, def: 1, vel: 110, vision: 8, comp: 'tirador', alcance: 4, coste: 2, xp: 8, fig: 'starbot', vuela: true, frase: 'Escaneando… talento no rentable.' },
  cajabotin: { nombre: 'CajaBotín', vida: 26, atq: 5, def: 3, vel: 90, vision: 2, comp: 'mimico', coste: 2, xp: 12, fig: 'cajabotin', suelta: true, frase: '¡Ábreme! Solo 9,99 €.' },
  esqueleto: { nombre: 'SkeletonCrew', vida: 18, atq: 6, def: 2, vel: 100, vision: 6, comp: 'patrulla', coste: 2, xp: 10, fig: 'esqueleto', frase: 'Horas extra eternas. Sin cobrar.' },
  zombi: { nombre: 'CrunchZombie', vida: 32, atq: 8, def: 1, vel: 80, vision: 5, comp: 'cazador', coste: 3, xp: 12, fig: 'zombi', frase: 'Cafééé… y un parche para el viernes…' },
  fantasma: { nombre: 'GhostMage', vida: 14, atq: 7, def: 0, vel: 110, vision: 7, comp: 'tirador', alcance: 5, coste: 3, xp: 14, fig: 'fantasma', vuela: true, frase: 'Uuuuh… ¿has leído el contrato?' },
  cosido: { nombre: 'StitchBrute', vida: 64, atq: 12, def: 4, vel: 90, vision: 6, comp: 'cazador', coste: 6, xp: 30, fig: 'cosido', frase: 'Hecho con trozos de cinco juegos cerrados.' },
  soporte: { nombre: 'SoporteBot', vida: 20, atq: 5, def: 3, vel: 100, vision: 7, comp: 'sanador', alcance: 3, coste: 3, xp: 14, fig: 'soporte', frase: '¿Ha probado a apagarlo y encenderlo?' },
  fallen: { nombre: 'FallenHero', vida: 42, atq: 12, def: 5, vel: 100, vision: 7, comp: 'cazador', coste: 5, xp: 25, fig: 'fallen', frase: 'Antes era un héroe. Ahora cobro por evento.' },
  abogado: { nombre: 'Abogado', vida: 22, atq: 9, def: 2, vel: 100, vision: 7, comp: 'tirador', alcance: 3, coste: 3, xp: 16, fig: 'abogado', demanda: true, frase: 'La letra pequeña es MUY pequeña.' },
  reclutador: { nombre: 'Reclutador', vida: 14, atq: 5, def: 1, vel: 100, vision: 7, comp: 'tirador', alcance: 3, coste: 2, xp: 9, fig: 'reclutador', roba: true, frase: 'Te ofrecemos visibilidad. Y nada más.' },
  impresora: { nombre: 'Impresora atascada', vida: 30, atq: 6, def: 2, vel: 70, vision: 5, comp: 'guardian', coste: 3, xp: 14, fig: 'impresora', suelta: true, frase: 'ERROR 0x0BAD: atasco de papel en la bandeja 2.' },
  murcielago: { nombre: 'BetaBat', vida: 9, atq: 6, def: 0, vel: 140, vision: 8, comp: 'cazador', coste: 2, xp: 9, fig: 'murcielago', vuela: true, frase: 'Bzzz… píxel muerto… bzzz.' },
  troll: { nombre: 'Troll del foro', vida: 40, atq: 10, def: 3, vel: 100, vision: 7, comp: 'cazador', coste: 4, xp: 20, fig: 'troll', flamea: true, frase: 'PRIMERO. Ah, no. Bueno, da igual: TODO ES PEOR QUE ANTES.' },
  // mini-jefes: uno por zona, a veces, en una sala apartada (corona y botín bueno)
  rrhh: { nombre: 'Directora de RR. HH.', vida: 70, atq: 9, def: 3, vel: 100, vision: 8, comp: 'cazador', coste: 0, xp: 70, fig: 'rrhh', mini: true, suelta: true, invoca: 'becario', cada: 5, frase: 'Esto no es un despido. Es una oportunidad de crecimiento… fuera.' },
  lich: { nombre: 'Lich de la Beta Cerrada', vida: 90, atq: 12, def: 3, vel: 100, vision: 8, comp: 'tirador', alcance: 4, coste: 0, xp: 110, fig: 'lich', mini: true, suelta: true, invoca: 'esqueleto', cada: 6, frase: 'Tu acceso a la beta ha caducado. Para siempre.' },
  moderador: { nombre: 'Moderador Supremo', vida: 120, atq: 15, def: 5, vel: 100, vision: 8, comp: 'cazador', coste: 0, xp: 160, fig: 'moderador', mini: true, suelta: true, congela: 0.2, frase: 'Hilo cerrado. Usuario baneado. Fin.' },
  // jefes
  survivalbot: { nombre: 'SurvivalBot', vida: 110, atq: 10, def: 4, vel: 90, vision: 9, comp: 'cazador', coste: 0, xp: 120, fig: 'survivalbot', jefe: true, invoca: 'becario', cada: 4, congela: 0.25, frase: 'Tu puesto ha sido optimizado.' },
  becariomes: { nombre: 'El Becario del Mes', vida: 180, atq: 14, def: 4, vel: 100, vision: 9, comp: 'tirador', alcance: 4, coste: 0, xp: 200, fig: 'becariomes', jefe: true, invoca: 'becario', cada: 3, frase: 'Llevo 14 cafés. Y es lunes.' },
  parche: { nombre: 'Parche Día 1', vida: 250, atq: 16, def: 6, vel: 100, vision: 9, comp: 'cazador', coste: 0, xp: 320, fig: 'parche', jefe: true, invoca: 'starbot', cada: 5, reglas: true, frase: 'Instalando… 99 %… 99 %… 99 %…' },
  ceo: { nombre: 'El CEO', vida: 340, atq: 20, def: 8, vel: 100, vision: 10, comp: 'cazador', coste: 0, xp: 1000, fig: 'ceo', jefe: true, invoca: 'cualquiera', cada: 4, despido: 6, frase: 'No es un despido: es una optimización de la plantilla.' },
};

// las rarezas, como en el resto de la serie
const RAREZAS = ['Común', 'Poco común', 'Rara', 'Épica', 'Legendaria'];
const RAR_COLOR = ['#d9d2e0', '#5fd36a', '#4aa3ff', '#b06cff', '#ffb02e'];
const RAR_VALOR = [1, 1.6, 2.4, 3.6, 5];   // cuánto vale (y cuánto cuesta) según la rareza

// los objetos. tipo: consumible, arma, armadura, accesorio, llave, monedas. Las cifras de equipo suben con la rareza
const OBJETOS = {
  cafe_solo: { nombre: 'Café solo', tipo: 'consumible', icono: 'cafe_solo', precio: 12, desc: 'Cura 30 de Vida. Invita la casa (la casa es Lola).', efecto: 'vida', valor: 30 },
  cafe_hielo: { nombre: 'Café con hielo', tipo: 'consumible', icono: 'cafe_hielo', precio: 12, desc: 'Recupera 20 de Café. Frío, como el trato de Recursos Humanos.', efecto: 'cafe', valor: 20 },
  cafe_doble: { nombre: 'Café doble', tipo: 'consumible', icono: 'cafe_doble', precio: 20, desc: 'Cafeinado 10 turnos: actúas más rápido que los enemigos.', efecto: 'cafeinado', valor: 10 },
  cafe_quemado: { nombre: 'Café quemado', tipo: 'consumible', icono: 'cafe_quemado', precio: 18, desc: 'Se lanza: 20 de daño y quemado a todos los enemigos pegados a ti.', efecto: 'quemar', valor: 20 },
  perg_despido: { nombre: 'Despido fulminante', tipo: 'consumible', icono: 'perg_despido', precio: 45, desc: 'Pergamino: elimina al enemigo normal más cercano que veas. Los jefes tienen abogados.', efecto: 'despido' },
  perg_reestructuracion: { nombre: 'Reestructuración', tipo: 'consumible', icono: 'perg_reestructuracion', precio: 25, desc: 'Pergamino: te traslada a otra sala al azar de la planta.', efecto: 'teletransporte' },
  perg_auditoria: { nombre: 'Auditoría', tipo: 'consumible', icono: 'perg_auditoria', precio: 30, desc: 'Pergamino: revela el plano de la planta, trampas incluidas.', efecto: 'revelar' },
  perg_ascenso: { nombre: 'Ascenso', tipo: 'consumible', icono: 'perg_ascenso', precio: 60, desc: 'Pergamino: subes a la siguiente planta ahora mismo. Enhorabuena.', efecto: 'ascenso' },
  descafeinado: { nombre: 'Café descafeinado', tipo: 'consumible', icono: 'descafeinado', precio: 22, desc: 'Invisible 5 turnos: nadie se fija en quien bebe descafeinado.', efecto: 'invisible', valor: 5 },
  manzanilla: { nombre: 'Manzanilla', tipo: 'consumible', icono: 'manzanilla', precio: 14, desc: 'Quita el veneno, el fuego y el bug, y cura 10. Para los nervios de la oficina.', efecto: 'antidoto', valor: 10 },
  bomba: { nombre: 'Bomba de confeti corporativo', tipo: 'consumible', icono: 'bomba', precio: 30, desc: 'Se lanza al enemigo más cercano que veas (hasta 5 casillas): explota y daña a todo lo que hay alrededor.', efecto: 'bomba', valor: 18 },
  rinonera: { nombre: 'Riñonera de merchandising', tipo: 'consumible', icono: 'rinonera', precio: 45, desc: '+6 huecos en la mochila, para siempre. Lleva el logo de Microblizz, pero cabe de todo.', efecto: 'mochila' },
  parche: { nombre: 'Parche', tipo: 'consumible', icono: 'parche', precio: 35, desc: 'Sube un punto el arma o la armadura que lleves (lo que esté peor).', efecto: 'parche' },
  llave: { nombre: 'Llave de la sala de tesoro', tipo: 'llave', icono: 'llave', precio: 0, desc: 'Abre la puerta cerrada de esta planta. Microblizz no hace copias.' },
  monedas: { nombre: 'Monedas', tipo: 'monedas', icono: 'monedas', precio: 0, desc: 'Lo único que Microblizz respeta.' },
  // armas (atq por rareza), armaduras (def) y accesorios (otra cosa)
  grapadora: { nombre: 'Grapadora', tipo: 'arma', icono: 'grapadora', precio: 30, desc: 'Arma de oficina. Duele más de lo que parece.', atq: [2, 4, 6, 9, 13] },
  teclado: { nombre: 'Teclado mecánico', tipo: 'arma', icono: 'teclado', precio: 40, desc: 'Cada golpe suena a crunch.', atq: [3, 5, 7, 10, 14] },
  espada: { nombre: 'Espada de la intranet', tipo: 'arma', icono: 'espada', precio: 55, desc: 'La encontraron en un juego cerrado. Sigue cortando.', atq: [4, 6, 9, 12, 16] },
  chaleco: { nombre: 'Chaleco de becario', tipo: 'armadura', icono: 'chaleco', precio: 30, desc: 'Con el logo de Microblizz. Da vergüenza, pero protege.', def: [1, 2, 3, 5, 7] },
  bata: { nombre: 'Bata de soporte', tipo: 'armadura', icono: 'bata', precio: 40, desc: 'Blanca, con una mancha de café que no se va.', def: [1, 2, 4, 6, 8] },
  armadura: { nombre: 'Armadura de FallenHero', tipo: 'armadura', icono: 'armadura', precio: 60, desc: 'Un héroe la vendió por un contrato. Tú la llevas gratis.', def: [2, 3, 5, 7, 10] },
  gafas: { nombre: 'Gafas de auditor', tipo: 'accesorio', icono: 'gafas', precio: 35, desc: 'Ves más lejos. También las trampas.', vision: [1, 2, 3, 4, 5] },
  anillo: { nombre: 'Anillo de accionista', tipo: 'accesorio', icono: 'anillo', precio: 50, desc: 'Más Vida máxima. Los accionistas nunca pierden.', vidaMax: [8, 14, 22, 32, 45] },
  termo: { nombre: 'Termo sin fondo', tipo: 'accesorio', icono: 'termo', precio: 45, desc: 'Más Café máximo y se recupera más rápido.', cafeMax: [6, 10, 16, 24, 34] },
};
const ARMAS = ['grapadora', 'teclado', 'espada'], ARMADURAS = ['chaleco', 'bata', 'armadura'], ACCESORIOS = ['gafas', 'anillo', 'termo'];
const CONSUMIBLES = { cafe_solo: 30, cafe_hielo: 14, cafe_doble: 10, cafe_quemado: 12, perg_despido: 6, perg_reestructuracion: 10, perg_auditoria: 8, perg_ascenso: 3, parche: 7, rinonera: 3, descafeinado: 8, manzanilla: 10, bomba: 9 };   // pesos para el botín

// los hitos que liberan clases y lo demás que se guarda para siempre
const HITOS = {
  survivalbot: { texto: 'Vence a SurvivalBot', libera: 'cybermarine' },
  planta5: { texto: 'Llega al Cementerio de juegos', libera: 'necrolord' },
  planta9: { texto: 'Llega al Foro Infinito' },
  ceo: { texto: 'Despide al CEO' },
  limpia: { texto: 'Deja una planta limpia' },
  tesoro: { texto: 'Abre una sala de tesoro', libera: 'slyfox' },
  ardilla: { texto: 'Rescata a MadSquirrel' },
};

// experiencia que hace falta para subir al nivel n
const xpPara = n => 14 + n * 12;
// la puntuación de una partida
const puntuacion = (planta, monedas, muertes, jefes) => planta * 100 + monedas + muertes * 5 + jefes * 500;
