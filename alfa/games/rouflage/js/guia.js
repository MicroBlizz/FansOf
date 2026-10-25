// Fans of Rouflage · LA GUÍA DEL TÍTULO (pedida por Daniel el 23-10-2026: «tutoriales que te lleven ahí y te guíen»). Con el título de 6 botones hay cosas que
// viven dentro de otras (MI ESCENARIO en el PERFIL, el GACHAPÓN en la TIENDA…). Cada vez que vuelves al título, si toca algo nuevo según las partidas que
// llevas, un bocadillo (el mismo dorado del tutorial de partida, bocadillos.js) te lleva de la mano paso a paso hasta ahí. Una guía cada vez, nunca en el PvP.
// · GUIAS: id, desde cuántas partidas sale (titJugadas, titulo.js) y sus pasos: en qué pantalla sale (en), a qué apunta (a), el texto (t) y cuándo
//   se da por hecho (hecho → true, o seg: se cierra sola o tocándola). Si te vas a otra pantalla a mitad, la guía vuelve a empezar en el título.
// · Se guarda en SAVE.guia = { hechas: [ids] }. «Saltar» salta solo esa guía. OPCIONES › Repetir tutorial también las repite.
'use strict';

const visible = id => { const e = E(id); return !!(e && !e.hidden); };
const GUIAS = [
  { id: 'jugar', desde: 0, pasos: [
    { en: 'p-titulo', a: '.tit-papeles', t: '<b>¡EMPIEZA AQUÍ!</b> Elige papel y juega contra bots para aprender: de camaleón te escondes, de cazador buscas.', hecho: () => visible('p-bots') },
  ] },
  { id: 'diario', desde: 1, si: () => diarioPuede(), pasos: [
    { en: 'p-titulo', a: '#b-diario', t: '<b>PREMIO DIARIO</b>: cada día que entras hay premio. Si vienes días seguidos, empieza tu <b>RACHA</b> y da más.', hecho: () => visible('p-diario') },
    { en: 'p-diario', a: '#b-diario-recoger', t: 'Toca <b>RECOGER</b>. Mañana, más.', hecho: () => !diarioPuede() },
  ] },
  { id: 'armario', desde: 1, pasos: [
    { en: 'p-titulo', a: '#b-armario', t: 'Tu <b>ARMARIO</b>: ropa, caras, mascotas y colores para tu galleta. Lo que llevas lo ven todos.', hecho: () => visible('p-armario') },
    { en: 'p-armario', a: '#ar-pestanas', t: 'Cada pestaña es una parte de tu galleta. Toca una casilla para probártela.', seg: 9 },
  ] },
  { id: 'misiones', desde: 2, pasos: [
    { en: 'p-titulo', a: '#b-misiones', t: 'Cada día hay 6 <b>MISIONES</b> nuevas y cada lunes, las de la semana. Dan gotas.', hecho: () => visible('p-misiones') },
  ] },
  { id: 'escenario', desde: 3, pasos: [
    { en: 'p-titulo', a: '#b-perfil', t: 'Toca tu <b>PERFIL</b>: ahí dentro está tu habitación.', hecho: () => visible('p-perfil') },
    { en: 'p-perfil', a: '#b-escenario', t: '<b>MI ESCENARIO</b>: tu propia habitación para decorar con muebles y pintar a tu gusto.', hecho: () => visible('p-escenario') },
    { en: 'p-escenario', a: null, t: 'Esta es tu habitación. Coloca muebles, pinta el suelo y las paredes y pasea con tu galleta. Tus amigos la verán en vuestras salas.', seg: 10 },
  ] },
  { id: 'amigos', desde: 4, pasos: [
    { en: 'p-titulo', a: '#b-social', t: '<b>AMIGOS</b>: mira quién está en línea e invítale a jugar contigo.', hecho: () => visible('p-amigoslista') },
    { en: 'p-amigoslista', a: '#b-amg-traer', t: 'Aquí está tu código. Si un amigo nuevo juega dos partidas con tu enlace, <b>ganáis los dos</b>.', hecho: () => visible('p-invita') },
    { en: 'p-invita', a: '#b-inv-compartir', t: 'Mándale el enlace por WhatsApp o donde quieras. Trayendo amigos ganas premios que no se venden.', seg: 10 },
  ] },
  { id: 'temporada', desde: 2, pasos: [
    { en: 'p-titulo', a: '#b-temporada', t: 'La <b>TEMPORADA</b>: en BUSCAR PARTIDA ganas puntos de liga. Al acabar, premio según tu liga.', hecho: () => visible('p-temporada') },
  ] },
  { id: 'talentos', desde: 5, pasos: [
    { en: 'p-titulo', a: '#b-perfil', t: 'En tu <b>PERFIL</b> están también tus <b>TALENTOS</b>.', hecho: () => visible('p-perfil') },
    { en: 'p-perfil', a: '#b-talentos', t: '<b>TALENTOS</b>: jugando subes de nivel y desbloqueas habilidades para cada papel.', hecho: () => visible('p-talentos') },
  ] },
  { id: 'pase', desde: 6, pasos: [
    { en: 'p-titulo', a: '#b-pase', t: 'El <b>PASE</b>: cada partida te da experiencia y cada nivel, un premio.', hecho: () => visible('p-pase') },
  ] },
  { id: 'tienda', desde: 7, pasos: [
    { en: 'p-titulo', a: '#b-tienda', t: 'En la <b>TIENDA</b> está también el <b>GACHAPÓN</b>, con tiradas gratis cada día.', hecho: () => visible('p-tienda') },
    { en: 'p-tienda', a: '#b-gacha', t: 'Toca aquí para abrir el <b>GACHAPÓN</b>.', hecho: () => visible('p-gacha') },
  ] },
  // EL LIENZO de Mi escenario (escenario-obra.js): la primera vez que tienes uno, paso a paso por CONSTRUIR (pedido por Daniel el 25-10-2026)
  { id: 'construir', desde: 0, si: () => typeof MIESC !== 'undefined' && MIESC.abierto && escBase(escenarioSala().id) === 'lienzo', pasos: [
    { en: 'p-escenario', a: '#esc-pest-obra', t: '<b>CONSTRUIR</b>: aquí haces tu escenario a tu gusto, con suelos, paredes y puertas.', hecho: () => MIESC.modo === 'obra' },
    { en: 'p-escenario', a: '#obra-b-baldosa', t: '<b>SUELO</b>: elige uno abajo y arrastra el dedo por el escenario para ponerlo.', hecho: () => !!OBRA.uso.suelo },
    { en: 'p-escenario', a: '#obra-b-ladrillo', t: '<b>PARED</b>: arrastra el dedo para levantar paredes y hacer salas.', hecho: () => !!OBRA.uso.pared },
    { en: 'p-escenario', a: '#obra-b-puerta', t: '<b>PUERTA</b>: pasa el dedo por una pared para abrir un paso entre salas.', hecho: () => !!OBRA.uso.puerta },
    { en: 'p-escenario', a: '#obra-b-diana', t: '<b>BECARIOS</b>: toca la sala donde esperan los cazadores al empezar la partida. Se pone en azul.', hecho: () => !!OBRA.uso.becarios },
    { en: 'p-escenario', a: '#obra-b-comprobar', t: '<b>COMPROBAR</b> te dice si se puede jugar. Lo que falla sale en rojo.', hecho: () => !!OBRA.uso.comprobar },
    { en: 'p-escenario', a: '#obra-b-jugar', t: '<b>PROBAR</b>: juega una partida contra bots en tu escenario. Luego, invita a tus amigos.', seg: 12 },
  ] },
  // al acabar una partida de colado en la que sobrevives: el reto (reto.js)
  { id: 'reto', desde: 0, si: () => typeof fotoHay === 'function' && fotoHay(), pasos: [
    { en: 'p-fin', a: '#b-foto', t: '<b>¡RETA A UN AMIGO!</b> Manda la foto de tu escondite: tendrá 20 segundos para encontrarte, sin descargar nada.', seg: 12 },
  ] },
];
const GUIA = { g: null, i: 0, t: 0, caja: null, foco: null, txt: '' };
const guiaHechas = () => { if (!SAVE.guia || !Array.isArray(SAVE.guia.hechas)) SAVE.guia = { hechas: [] }; return SAVE.guia.hechas; };
function guiaFin(saltada) {
  if (GUIA.g) { const h = guiaHechas(); if (!h.includes(GUIA.g.id)) h.push(GUIA.g.id); guardaPartida(); }
  GUIA.g = null; GUIA.caja.hidden = GUIA.foco.hidden = true;
  if (saltada) play('select');
}
// ¿toca alguna? La primera que no esté hecha, con las partidas que pide y que cumpla su condición, en la pantalla de su primer paso
function guiaBusca() {
  const h = guiaHechas(), n = titJugadas();
  return GUIAS.find(g => !h.includes(g.id) && n >= g.desde && (!g.si || g.si()) && visible(g.pasos[0].en)) || null;
}
function guiaPaso(dt) {
  if (!GUIA.caja) return;
  const ocultar = () => { GUIA.caja.hidden = GUIA.foco.hidden = true; };
  if (J.pvp || !E('carga').hidden || (typeof bocadilloActivo === 'function' && bocadilloActivo()) || (typeof RETO !== 'undefined' && RETO.activo)) { ocultar(); return; }
  if (!GUIA.g) { GUIA.g = guiaBusca(); GUIA.i = 0; GUIA.t = 0; if (!GUIA.g) { ocultar(); return; } }
  const p = GUIA.g.pasos[GUIA.i];
  if (p.hecho && p.hecho()) { play('select'); guiaSigue(); return; }      // primero si ya está hecho (al tocar el botón se cambia de pantalla)
  if (!visible(p.en)) {
    // te has ido a otra pantalla: al volver al título, la guía empieza otra vez (o la siguiente que toque)
    if ((visible('p-titulo') && GUIA.i > 0) || GUIA.i === 0) { GUIA.g = null; }      // (sin empezar: se suelta, y así otra pantalla puede tener la suya, como CONSTRUIR)
    ocultar(); return;
  }
  GUIA.t += dt;
  if (p.seg && GUIA.t > p.seg) { guiaSigue(); return; }
  const el = p.a ? document.querySelector(p.a) : null;
  if (p.a && !(el && el.offsetParent)) { ocultar(); return; }
  const txt = tr(p.t) + `<small><span>${tr('{n} de {t}', { n: GUIA.i + 1, t: GUIA.g.pasos.length })}</span>` + (p.seg ? `<i>${tr('VALE')}</i>` : '') + `<u class="salta">${tr('Saltar')}</u></small>`;
  if (GUIA.txt !== txt) { GUIA.txt = txt; GUIA.caja.innerHTML = txt; }
  GUIA.caja.hidden = false;
  const vw = innerWidth, vh = innerHeight, r = GUIA.caja.getBoundingClientRect();
  if (el) {
    const b = el.getBoundingClientRect();
    Object.assign(GUIA.foco.style, { left: (b.x - 6) + 'px', top: (b.y - 6) + 'px', width: (b.width + 12) + 'px', height: (b.height + 12) + 'px' }); GUIA.foco.hidden = false;
    const x = limita(b.x + b.width / 2 - r.width / 2, 10, vw - r.width - 10), arriba = b.y - r.height - 26 > 8;
    GUIA.caja.style.left = x + 'px'; GUIA.caja.style.top = limita(arriba ? b.y - r.height - 26 : b.y + b.height + 26, 8, vh - r.height - 8) + 'px';      // nunca fuera de la pantalla
    GUIA.caja.classList.toggle('abajo', !arriba); GUIA.caja.classList.remove('centro'); GUIA.caja.style.setProperty('--flecha', limita(b.x + b.width / 2 - x, 22, r.width - 22) + 'px');
  } else {
    GUIA.foco.hidden = true; GUIA.caja.classList.remove('abajo'); GUIA.caja.classList.add('centro');
    GUIA.caja.style.left = (vw - r.width) / 2 + 'px'; GUIA.caja.style.top = vh * 0.24 + 'px';
  }
}
function guiaSigue() { GUIA.i++; GUIA.t = 0; if (!GUIA.g || GUIA.i >= GUIA.g.pasos.length) guiaFin(false); }

function preparaGuia() {
  GUIA.foco = document.createElement('div'); GUIA.foco.className = 'foco-tuto'; GUIA.foco.hidden = true;
  GUIA.caja = document.createElement('div'); GUIA.caja.className = 'bocadillo guia'; GUIA.caja.hidden = true;
  GUIA.caja.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (e.target.closest('.salta')) { guiaFin(true); return; }
    const p = GUIA.g && GUIA.g.pasos[GUIA.i]; if (p && p.seg) { play('select'); guiaSigue(); }
  });
  document.body.append(GUIA.foco, GUIA.caja);
  let antes = performance.now();
  setInterval(() => { const ahora = performance.now(); guiaPaso(Math.min(0.5, (ahora - antes) / 1000)); antes = ahora; }, 150);
  // OPCIONES › Repetir tutorial: también las guías del título
  const repite = E('b-tuto-repite').onclick;
  E('b-tuto-repite').onclick = ev => { SAVE.guia = { hechas: [] }; repite(ev); };
}
