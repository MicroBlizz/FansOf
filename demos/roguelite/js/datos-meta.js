// Fans of Roguelite · Objetos (3 huecos: zanahoria, cabeza y amuleto), mejoras para siempre de La Madriguera y los
// encuentros con elección (cada uno con su dibujo y dos opciones). Los efectos usan las ayudas de reglas.js.
'use strict';

// atq, vida (máxima), crit (%), def (resta a cada golpe), monedas (%), suerte (%)
const OBJETOS = {
  z_madera:  { n: 'Zanahoria de madera', tipo: 'arma', rar: 'basic', atq: 3 },
  z_hierro:  { n: 'Zanahoria de hierro', tipo: 'arma', rar: 'common', atq: 6 },
  z_laser:   { n: 'Zanahoria láser', tipo: 'arma', rar: 'rare', atq: 9, crit: 5 },
  z_dorada:  { n: 'Zanahoria dorada', tipo: 'arma', rar: 'epic', atq: 14, monedas: 15 },
  z_excal:   { n: 'Excalizanahoria', tipo: 'arma', rar: 'legendary', atq: 22, crit: 10 },
  g_lana:    { n: 'Gorro de lana', tipo: 'cabeza', rar: 'basic', vida: 15 },
  g_obra:    { n: 'Casco de obra', tipo: 'cabeza', rar: 'common', vida: 25, def: 1 },
  g_cascos:  { n: 'Cascos de streamer', tipo: 'cabeza', rar: 'rare', vida: 30, crit: 6 },
  g_corona:  { n: 'Corona de repuesto', tipo: 'cabeza', rar: 'epic', vida: 55, def: 2 },
  g_mecha:   { n: 'Casco de MechaVaca', tipo: 'cabeza', rar: 'legendary', vida: 85, def: 4 },
  a_trebol:  { n: 'Trébol mordido', tipo: 'amuleto', rar: 'basic', suerte: 6 },
  a_ficha:   { n: 'Tarjeta de fichar', tipo: 'amuleto', rar: 'common', atq: 3, vida: 12 },
  a_llave:   { n: 'Llave de la Madriguera', tipo: 'amuleto', rar: 'rare', monedas: 30, vida: 15 },
  a_pata:    { n: 'Pata de conejo (de otro)', tipo: 'amuleto', rar: 'epic', crit: 12, suerte: 10 },
  a_medalla: { n: 'Medalla de la huelga', tipo: 'amuleto', rar: 'legendary', def: 4, atq: 8, vida: 30 },
};
const HUECOS = ['arma', 'cabeza', 'amuleto'];
const NOMBRE_HUECO = { arma: 'Zanahoria', cabeza: 'Cabeza', amuleto: 'Amuleto' };

// mejoras para siempre (se compran en La Madriguera con las monedas de todas las partidas)
const MEJORAS = {
  vida:     { n: 'Comida casera', d: '+{v} de vida al empezar.', v: 12, max: 10, coste: 20 },
  atq:      { n: 'Huerto propio', d: '+{v} de ataque al empezar.', v: 2, max: 10, coste: 25 },
  crit:     { n: 'Ojo más loco', d: '+{v} % de golpes críticos.', v: 2, max: 8, coste: 30 },
  suerte:   { n: 'Trébol mágico', d: '+{v} % de suerte: mejores premios.', v: 4, max: 8, coste: 30 },
  botin:    { n: 'Hucha de la casa', d: '+{v} % de monedas en cada partida.', v: 8, max: 10, coste: 25 },
  siesta:   { n: 'Siesta reparadora', d: 'Te curas un {v} % más al subir de nivel.', v: 5, max: 6, coste: 35 },
  contrato: { n: 'Contrato indefinido', d: 'Si caes, vuelves con media vida (una vez por partida).', v: 1, max: 1, coste: 450 },
};
const costeMejora = (id, nivel) => Math.round(MEJORAS[id].coste * Math.pow(1.45, nivel));

// encuentros: m = en qué mundos salen (todos si no se dice); prop = quién o qué aparece en el camino
const ENCUENTROS = [
  { id: 'lola', prop: 'puesto', quien: 'Lola', texto: 'Lola, despedida por Microblizz, ha montado un puesto de café. «Invita la casa. La casa soy yo».', opciones: [
    { n: 'Café triple', d: '+6 de ataque, pero te tiemblan las patas: -10 de vida.', efecto: h => { extra(h, 'atq', 6); dana(h, 10); }, dice: '«Vuelve cuando quieras. Bueno, cuando cierre Microblizz».' },
    { n: 'Café con leche', d: 'Te sientas un rato con Lola: te curas 50.', efecto: h => { cura(h, 50); }, dice: '«Me despidieron por correo. Con faltas de ortografía».' }] },
  { id: 'contrato', prop: 'abogado', quien: 'Abogado', texto: 'Un abogado de Microblizz te ofrece un contrato. La letra pequeña es MUY pequeña.', opciones: [
    { n: 'Firmar', d: '+40 % de ataque, pero te quitan 25 de vida máxima.', efecto: h => { extra(h, 'atq', Math.round(h.atq * 0.4)); extra(h, 'vida', -25); }, dice: '«Un placer hacer negocios. Sobre todo para mí».' },
    { n: 'Leer la letra pequeña', d: 'Pagan en «visibilidad». Te ríes tanto que te curas 30.', efecto: h => { cura(h, 30); }, dice: '«Mi cliente lo lamenta mucho». No lo lamenta.' }] },
  { id: 'becario', prop: 'becario', quien: 'Becario', m: [0, 2], texto: 'Un Becario llora en un banco: le han quitado hasta las prácticas.', opciones: [
    { n: 'Consolarle', d: 'Te curas 25 y te regala su café: +3 de ataque.', efecto: h => { cura(h, 25); extra(h, 'atq', 3); }, dice: '«Gracias… ¿esto cuenta como experiencia?»' },
    { n: 'Quitarle el café', d: '+6 de ataque, pero te sienta fatal: -15 de vida.', efecto: h => { extra(h, 'atq', 6); dana(h, 15); }, dice: '«¡Era descafeinado!»' }] },
  { id: 'encuesta', prop: 'soporte', quien: 'SoporteBot', texto: 'Un SoporteBot te para: «¿Qué tal su experiencia de despido? Puntúe del 1 al 10».', opciones: [
    { n: 'Rellenar la encuesta', d: '+20 monedas en cupones de Microblizz.', efecto: h => { ganaMonedas(h, 20); }, dice: '«Su opinión será ignorada con cariño».' },
    { n: 'Hacerla una bola', d: 'Te sientes muchísimo mejor: te curas 30.', efecto: h => { cura(h, 30); }, dice: '«Ticket cerrado: cliente satisfecho».' }] },
  { id: 'starbot', prop: 'starbotRoto', quien: 'StarBot', m: [0], texto: 'Un StarBot averiado pide ayuda con una lucecita roja.', opciones: [
    { n: 'Arreglarlo', d: 'Te da las gracias con un objeto que llevaba encima.', efecto: () => ({ premio: 'objeto', min: 'common' }), dice: '«Bip. Gracias. Bip. No se lo digas a mi jefe».' },
    { n: 'Desmontarlo', d: '+30 monedas en piezas.', efecto: h => { ganaMonedas(h, 30); }, dice: '«Bip… bip… bi…»' }] },
  { id: 'maquina', prop: 'maquina', quien: 'Máquina', texto: 'La máquina de café de la oficina, abandonada. Todavía funciona… más o menos.', opciones: [
    { n: 'Café solo', d: '+4 de ataque.', efecto: h => { extra(h, 'atq', 4); }, dice: '«Clonc. Glu, glu. Su café está listo»' },
    { n: 'Chocolate caliente', d: '+20 de vida máxima.', efecto: h => { extra(h, 'vida', 20); cura(h, 20); }, dice: '«Clonc. Sin azúcar, por recortes»' }] },
  { id: 'caja', prop: 'caja', quien: 'CajaBotín', texto: 'Una CajaBotín cerrada te guiña un ojo. «Esta vez sí, de verdad».', opciones: [
    { n: 'Abrirla', d: 'La mitad de las veces trae un objeto raro. La otra mitad, muerde: -25 de vida.', efecto: h => Math.random() < 0.5 ? { premio: 'objeto', min: 'rare' } : (dana(h, 25), { dice: '¡ÑAM! Era una CajaBotín. Siempre lo es.' }), dice: '«¡Felicidades! Esto… o no».' },
    { n: 'Darle una patada', d: '+15 monedas que se le caen.', efecto: h => { ganaMonedas(h, 15); }, dice: '«¡Ay! Probabilidad de patada: 100 %».' }] },
  { id: 'lapida', prop: 'tumba', quien: 'Lápida', m: [1], texto: 'Una lápida dice: «Aquí yace un juego al que solo le faltaba un parche».', opciones: [
    { n: 'Dejar flores', d: 'Te curas 40.', efecto: h => { cura(h, 40); }, dice: 'Descansa en paz, versión 0.9.' },
    { n: 'Rezar por la secuela', d: '+6 de ataque, pero da escalofríos: -20 de vida.', efecto: h => { extra(h, 'atq', 6); dana(h, 20); }, dice: 'La secuela fue anunciada… y cancelada.' }] },
  { id: 'zombi', prop: 'zombi', quien: 'CrunchZombie', m: [1], texto: 'Un zombi programador sigue trabajando en su ordenador. Son las 4 de la mañana.', opciones: [
    { n: 'Mandarlo a casa', d: 'Te lo agradece enseñándote una habilidad.', efecto: () => ({ premio: 'habilidad', min: 'basic' }), dice: '«¿Casa? ¿Qué es una casa?»' },
    { n: 'Robarle el ordenador', d: '+35 monedas.', efecto: h => { ganaMonedas(h, 35); }, dice: '«Mi… commit… sin guardar…»' }] },
  { id: 'rrhh', prop: 'abogado', quien: 'Recursos Humanos', m: [2], texto: 'Recursos Humanos te ofrece un «plan de bienestar»: una pieza de fruta.', opciones: [
    { n: 'Comerse la fruta', d: 'Te curas 25.', efecto: h => { cura(h, 25); }, dice: '«Su bienestar nos importa (legalmente)».' },
    { n: 'Pedir un aumento', d: 'La mitad de las veces: +9 de ataque. La otra: te despiden un poco (-30 de vida).', efecto: h => Math.random() < 0.5 ? (extra(h, 'atq', 9), { dice: '¡Aumento concedido! (por error)' }) : (dana(h, 30), { dice: '«Aumento denegado. Y una amonestación».' }), dice: '' }] },
  { id: 'ascensor', prop: null, quien: 'Ascensor', m: [2], texto: 'El ascensor de la torre está «en mantenimiento» desde 2019.', opciones: [
    { n: 'Subir por las escaleras', d: '+25 de vida máxima: piernas de acero.', efecto: h => { extra(h, 'vida', 25); cura(h, 25); }, dice: 'Planta 87… 88… 89…' },
    { n: 'Esperar sentado', d: 'Encuentras monedas en el sofá: +30.', efecto: h => { ganaMonedas(h, 30); }, dice: 'El ascensor no llegó. Las monedas, sí.' }] },
];

// el Pase Premium (sátira del pase de batalla): poder ahora y cuota cada día, o seguir siendo F2P con Lola
const PASE = { prop: 'abogado', quien: 'Comercial', texto: 'Un comercial de Microblizz te ofrece el Pase Premium. «Ventajas exclusivas. Cancelación: imposible».', opciones: [
  { n: 'Comprar el Pase Premium', d: 'Una habilidad legendaria ahora. Pero cada día te cobran la cuota: -1 de vida máxima.', efecto: h => { h.cuota = (h.cuota || 0) + 1; return { premio: 'habilidad', min: 'legendary' }; }, dice: '«¡Bienvenido a Premium! Su cuota se renovará… siempre».' },
  { n: 'Seguir siendo F2P', d: 'Lola te da un bocadillo de los que no se venden: te curas 40 y +5 % de suerte.', efecto: h => { cura(h, 40); extra(h, 'suerte', 5); }, dice: 'Lola: «Los de gratis también comemos».' }] };
const HOGUERA = { prop: 'hoguera', quien: 'Huelguistas', texto: 'Los trabajadores de Microblizz en huelga te invitan a calentarte en su hoguera.', opciones: [
  { n: 'Descansar', d: 'Te curas el 35 % de tu vida.', efecto: h => { cura(h, Math.round(h.vidaMax * 0.35)); }, dice: '«¡Hoy no se ficha!»' },
  { n: 'Afilar la zanahoria', d: 'Sube de nivel una de tus habilidades (si no puedes, +5 de ataque).', efecto: h => afilar(h), dice: '«¡Esa zanahoria corta más que un ERE!»' }] };

// los consejos de Lola (la moderadora del chat): salen la primera vez de cada cosa (chat.js)
const CONSEJOS = {
  inicio: 'CrazyBunny camina y pelea solo. Tú eliges: una habilidad al subir de nivel, qué hacer con los objetos y en cada encuentro. El día 40 te espera el jefe.',
  nivel: '¡Has subido de nivel! Elige 1 de 3 habilidades. Si sale una que ya tienes, sube de nivel (hasta 3). Las naranjas son legendarias: no las dejes escapar.',
  objeto: 'Un objeto. Tienes 3 huecos: zanahoria, cabeza y amuleto. Si lo cambias, el viejo se vende solo. Si no te sirve, véndelo: Microblizz lo haría.',
  tienda: 'Mi tienda. Lo que gastes aquí no llega a La Madriguera, así que compra solo lo que necesites. Yo no debería decírtelo, pero ya estoy despedida.',
  ruleta: 'La ruleta de Microblizz. Es gratis. Bueno, eso dice Microblizz. Casi siempre toca algo bueno… casi.',
  gashapon: 'El gashapón: gratis te da un objeto cualquiera; pagando, uno raro o mejor. Como en los juegos de móvil, pero aquí te lo cuento antes.',
  hoguera: 'La hoguera de los huelguistas. Descansa si vas mal de vida, o afila la zanahoria para subir de nivel una habilidad.',
  pase: 'Cuidado con el Pase Premium: da una habilidad legendaria, pero cada día te cobra vida máxima. Para siempre. Como los de verdad.',
  elite: 'Ese enemigo brilla: es de élite. Pega más y aguanta más, pero siempre suelta un objeto.',
};
