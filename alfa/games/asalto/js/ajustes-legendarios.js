// Fans of Asalto · Los ajustes de los LEGENDARIOS, el DESPERTAR y los SERES SECRETOS (tarea #109; aparte de ajustes.js, que ya va lleno).
// Solo datos: las reglas están en dominio/legendario.js (y lo que hace cada habilidad en la batalla, en la batalla).
'use strict';
ASALTO.legendarios = {
  // un héroe ya ascendido que llega a este nivel se hace legendario (si cabe en el tope del equipo)
  nivel: 12,
  // cuántos legendarios puede haber a la vez en el equipo de una partida: uno en la normal y dos en las largas
  // (modo sin fin o dificultad 1 o más). Decisión de Pepins.
  tope: { normal: 1, larga: 2 },
  // los niveles de los Despertares I, II y III: en cada uno el legendario elige una carta de Despertar
  despertar: [16, 22, 30],
  // plumas para abrir fuera de la partida el Despertar I, II y III (mejora permanente «Poder Dormido»). Provisional: se calibra luego.
  dormido: [120, 240, 480],
  // la cumbre de cada rama: el poder extra que da la clase en la que ascendió el legendario
  cumbres: {
    tanque:   { nombre: 'Bastión', txt: 'Devuelve parte del daño que recibe y, una vez por combate, nadie le hace daño durante unos segundos.' },
    luchador: { nombre: 'Señor de la Guerra', txt: 'Cada enemigo que cae le da +5 % de daño hasta que acaba el combate.' },
    asesino:  { nombre: 'Verdugo', txt: 'Mata de golpe a los enemigos normales con poca vida.' },
    tirador:  { nombre: 'Tormenta', txt: 'Dispara 3 flechas por ataque y atraviesan.' },
    mago:     { nombre: 'Cataclismo', txt: 'Cada 4 ataques cae un meteorito que aturde.' },
    sanador:  { nombre: 'Oráculo', txt: 'Una vez por combate revive al primer aliado que cae.' },
    brujo:    { nombre: 'Señor de la Plaga', txt: 'Su maldición salta a otro enemigo cuando el primero muere.' },
  },
  // los 16 legendarios, uno por héroe y rama (las mismas claves que las tiras superiores): nombre, habilidad (id) y qué hace
  lista: {
    'heroe-huron-asesino':     { nombre: 'Hurón de la Última Sombra', habilidad: 'sombra', txt: 'Es invisible 3 s al empezar y su primer golpe es crítico.' },
    'heroe-huron-luchador':    { nombre: 'Shogun Hurón', habilidad: 'abanico', txt: 'Cada 3.er ataque da un tajo a todos los enemigos de delante.' },
    'heroe-bunny-luchador':    { nombre: 'Rey Conejo Desatado', habilidad: 'salto', txt: 'Al empezar salta sobre el enemigo más fuerte y lo aturde.' },
    'heroe-bunny-tanque':      { nombre: 'Conejo Muralla', habilidad: 'muralla', txt: 'Obliga a los enemigos a atacarle a él durante 4 s.' },
    'heroe-ardilla-tirador':   { nombre: 'Ardilla de las Mil Bellotas', habilidad: 'bellotas', txt: 'Cada 8 s cae una lluvia de bellotas sobre toda la arena.' },
    'heroe-ardilla-asesino':   { nombre: 'Ardilla Sin Aviso', habilidad: 'sinaviso', txt: 'Su primer disparo del combate mata de golpe a un enemigo normal.' },
    'heroe-zorro-asesino':     { nombre: 'Zorro Guadaña', habilidad: 'guadana', txt: 'Al matar, salta al siguiente enemigo y ataca otra vez.' },
    'heroe-zorro-brujo':       { nombre: 'Zorro de los Nueve Engaños', habilidad: 'enganos', txt: 'Crea 2 copias falsas que distraen a los enemigos.' },
    'heroe-castor-tirador':    { nombre: 'Castor Artillero Mayor', habilidad: 'fuego', txt: 'Sus bombas dejan fuego en el suelo.' },
    'heroe-castor-mago':       { nombre: 'Castor del Juicio Final', habilidad: 'juicio', txt: 'Al caer, explota con mucho daño alrededor.' },
    'heroe-mechavaca-tanque':  { nombre: 'Fortaleza Vaca', habilidad: 'fortaleza', txt: 'Al empezar da un escudo a todos sus aliados.' },
    'heroe-mechavaca-luchador': { nombre: 'MechaVaca Titán', habilidad: 'embestida', txt: 'Empuja a todos los enemigos hacia atrás.' },
    'heroe-suricata-sanador':  { nombre: 'Suricata Vidente', habilidad: 'vidente', txt: 'Cada 5 s cura un poco a todos sus aliados.' },
    'heroe-suricata-brujo':    { nombre: 'Suricata del Mal de Ojo', habilidad: 'malojo', txt: 'Los enemigos malditos hacen un 25 % menos de daño.' },
    'heroe-mapache-mago':      { nombre: 'Mapache Cometa', habilidad: 'cometa', txt: 'Al empezar cae un cometa en medio de los enemigos.' },
    'heroe-mapache-brujo':     { nombre: 'Mapache Rey de la Chatarra Maldita', habilidad: 'chatarra', txt: 'Cada enemigo que cae deja un minimapache de chatarra que lucha 5 s.' },
  },
  // las 12 cartas de Despertar: en cada Despertar se elige una de 3 que el legendario aún no tiene
  cartas: {
    matajefes:  { nombre: 'Matajefes', txt: '+30 % de daño a los jefes.' },
    escudo:     { nombre: 'Escudo compartido', txt: 'Aguanta parte del daño que reciben sus vecinos.' },
    segunda:    { nombre: 'Segunda vida', txt: 'Revive una vez por combate con media vida.' },
    estandarte: { nombre: 'Estandarte', txt: 'Sus vecinos hacen +10 % de daño.' },
    gigante:    { nombre: 'Gigante', txt: '+40 % de vida y se ve más grande.' },
    eco:        { nombre: 'Eco', txt: '1 de cada 5 ataques se repite.' },
    sed:        { nombre: 'Sed', txt: 'Se cura con parte del daño que hace.' },
    furia:      { nombre: 'Furia', txt: 'Cuanta menos vida le queda, más rápido ataca.' },
    atraviesa:  { nombre: 'Golpe que atraviesa', txt: 'Da también al enemigo de detrás.' },
    cosecha:    { nombre: 'Cosecha', txt: 'Cada enemigo que mata da 1 de esencia.' },
    hueco:      { nombre: 'Cuarto hueco', txt: 'Un hueco más para improntas.' },
    hambre:     { nombre: 'Hambre', txt: 'Al absorber a otro héroe gana el doble de nivel.' },
  },
  // los 28 seres secretos: salen al unir dos legendarios de distinto tipo. Clave: los dos tipos ordenados alfabéticamente, unidos por '+'
  seres: {
    'heroe-bunny+heroe-mechavaca':     { nombre: 'Vacuniejo Acorazado' },
    'heroe-bunny+heroe-huron':         { nombre: 'Hurojo Relámpago' },
    'heroe-ardilla+heroe-bunny':       { nombre: 'Ardilebre Saltabosques' },
    'heroe-bunny+heroe-zorro':         { nombre: 'Zorrejo Embaucador' },
    'heroe-bunny+heroe-castor':        { nombre: 'Castonejo Dinamitero' },
    'heroe-bunny+heroe-suricata':      { nombre: 'Suricoja Centinela' },
    'heroe-bunny+heroe-mapache':       { nombre: 'Mapanejo Chatarrero' },
    'heroe-huron+heroe-mechavaca':     { nombre: 'Hurovaca Ninja de Hierro' },
    'heroe-ardilla+heroe-mechavaca':   { nombre: 'Ardivaca Catapulta' },
    'heroe-mechavaca+heroe-zorro':     { nombre: 'Zorrovaca Matona' },
    'heroe-castor+heroe-mechavaca':    { nombre: 'Castorvaca, la Presa Andante' },
    'heroe-mechavaca+heroe-suricata':  { nombre: 'Surivaca Sagrada' },
    'heroe-mapache+heroe-mechavaca':   { nombre: 'Mapavaca Reciclada' },
    'heroe-ardilla+heroe-huron':       { nombre: 'Ardiurón Francotirador' },
    'heroe-huron+heroe-zorro':         { nombre: 'Zorrurón de las Mil Dagas' },
    'heroe-castor+heroe-huron':        { nombre: 'Castorón Kamikaze' },
    'heroe-huron+heroe-suricata':      { nombre: 'Surirón Vigía Nocturno' },
    'heroe-huron+heroe-mapache':       { nombre: 'Mapurón Ladrón de Grapas' },
    'heroe-ardilla+heroe-zorro':       { nombre: 'Zorrardilla Tramposa' },
    'heroe-ardilla+heroe-castor':      { nombre: 'Castardilla Lanzabellotas' },
    'heroe-ardilla+heroe-suricata':    { nombre: 'Suriardilla Adivina' },
    'heroe-ardilla+heroe-mapache':     { nombre: 'Mapardilla Cometa' },
    'heroe-castor+heroe-zorro':        { nombre: 'Zorrocastor Ingeniero del Caos' },
    'heroe-suricata+heroe-zorro':      { nombre: 'Surizorro Hipnotizador' },
    'heroe-mapache+heroe-zorro':       { nombre: 'Mapazorro Rey de los Ladrones' },
    'heroe-castor+heroe-suricata':     { nombre: 'Suricastor Constructor de Templos' },
    'heroe-castor+heroe-mapache':      { nombre: 'Mapacastor Bomba de Basura' },
    'heroe-mapache+heroe-suricata':    { nombre: 'Surimapache, el Becario Maldito' },
  },
  // el ser es más grande y más fuerte: escala del dibujo y multiplicador de su vida y su daño (lo aplica la batalla)
  ser: { escala: 1.15, mult: 1.2 },
  // las cifras de lo que hacen en la BATALLA (dominio/batalla-legendarios.js y poder.js). Tiempos en segundos, distancias en px del
  // campo, `mult` multiplica el daño del legendario y los tantos van de 0 a 1 (sed va en %, como el robo de vida)
  efectos: {
    // poderes cumbre
    bastion: { reflejo: 0.15, umbral: 0.5, dura: 3 },   // reflejo de más; al bajar de `umbral` de vida, invulnerable `dura` s (una vez por combate)
    guerra: 0.05,                                         // daño de más por cada enemigo que cae, hasta acabar el combate
    verdugo: 0.15,                                        // un enemigo normal que tras su golpe queda por debajo de este tanto, muere
    tormenta: { extra: 2 },                               // proyectiles de más por ataque (a los más cercanos al objetivo); atraviesan como la carta
    cataclismo: { cada: 4, mult: 2, radio: 80, aturde: 1 },
    oraculo: 0.5,                                         // vida con la que revive el primer aliado que cae
    // habilidades únicas
    sombra: 3,                                            // segundos invisible al empezar
    abanico: { cada: 3, radio: 90 },
    salto: { aturde: 1.5 },
    muralla: 4,                                           // segundos en que todos los enemigos van a por él
    bellotas: { cada: 8, mult: 0.6 },
    enganos: { cuantos: 2, vida: 0.3, x: 20, y: 45 },     // señuelos: su parte de vida y dónde salen (a su lado)
    fuego: { dura: 3, radio: 50, dps: 0.2 },              // dps: daño por segundo, sobre su daño
    juicio: { mult: 3, radio: 120 },
    fortaleza: 0.25,                                      // escudo al empezar: este tanto de la vida máxima de cada aliado
    embestida: { cada: 10, empuje: 60 },
    vidente: { cada: 5, cura: 0.08 },
    malojo: 0.25,                                         // daño de menos de los enemigos malditos
    cometa: { mult: 4, radio: 100 },
    chatarra: { parte: 0.2, dura: 5, tope: 4, cada: 0.8, alcance: 30, vel: 70, escala: 0.6 },   // minimapaches: su parte de vida y daño
    // cartas de Despertar
    matajefes: 0.3, segunda: 0.5, eco: 0.2, sed: 10, furia: 0.5,
    escudo: { parte: 0.2, radio: 120 },
    estandarte: { mas: 0.1, radio: 130 },
    gigante: { vida: 1.4, escala: 1.2 },
    atraviesa: { parte: 0.5, detras: 60 },
  },
};
