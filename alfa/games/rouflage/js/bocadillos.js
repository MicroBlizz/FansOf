// Fans of Rouflage · EL TUTORIAL CON BOCADILLOS: la primera vez que juegas contra bots con cada papel, un bocadillo señala el botón que toca
// (brilla en dorado y el resto se oscurece un poco) y espera a que lo hagas: pintarte, coger color, pintar el cuerpo, LISTO, congelarte, silbar…
// Los pasos solo informativos se cierran tocando el bocadillo o solos al rato. Se guarda al acabar cada papel (SAVE.tuto.bcam / bcaz); desde
// OPCIONES se puede repetir. Nunca sale en el PvP. Mientras hay bocadillo, la franja de pistas de abajo se calla (pistaDeAhora).
'use strict';

// cada paso: fase en la que sale, a qué apunta (selector, o null = al centro de la pantalla), el texto y cuándo se da por hecho
// (hecho(estado) → true; o `seg`: se cierra solo a los tantos segundos o al tocar el bocadillo)
const BOCADILLOS = {
  camaleon: [
    { fase: 'prep', a: '#b-pintar', t: '<b>¡PÍNTATE!</b> Toca aquí para pintarte con los colores del suelo que tienes detrás.', hecho: () => TALLER.abierto },
    { fase: 'prep', a: '#t-gota', t: '<b>CUENTAGOTAS</b>: tócalo y luego toca el suelo para coger su color.', empieza: s => { s.color = TALLER.color; }, hecho: s => TALLER.color !== s.color || !TALLER.abierto },
    { fase: 'prep', a: '#t-camo', t: 'Ahora pasa el dedo por tu cuerpo para pintarlo. Este número es tu <b>CAMUFLAJE</b>: cuanto más alto, menos te ven.', empieza: s => { s.camo = J.yo.camo || 0; }, hecho: s => (J.yo.camo || 0) >= s.camo + 8 || !TALLER.abierto, seg: 25 },
    { fase: 'prep', a: '#t-listo', t: 'Cuando te guste cómo has quedado, toca <b>LISTO</b>.', hecho: () => !TALLER.abierto },
    { fase: 'prep', a: '#b-congelar', t: '<b>CONGÉLATE</b>: te quedas quieto y desaparecen tu contorno y tus orejas. Solo queda la pintura.', hecho: () => J.yo.congelado },
    { fase: 'caza', a: '#e-silbo', t: 'Cada rato <b>SILBAS</b> sin querer y los becarios van a mirar. Aquí ves cuánto falta.', seg: 8 },
    { fase: 'caza', a: '#b-silbar', t: 'Si silbas tú cuando no hay becarios cerca, ese reloj vuelve a empezar. ¡Elige bien el momento!', empieza: s => { s.t0 = J.yo.silbido; }, hecho: s => J.yo.tSilbo > 0, seg: 12 },
    { fase: 'caza', a: '#b-granada', t: '¿Te han visto? La <b>GRANADA</b> te vuelve invisible un rato. Solo tienes una por partida.', seg: 8 },
  ],
  cazador: [
    { fase: 'prep', a: '#e-balas', t: 'Estas son tus <b>CARTAS DE DESPIDO</b>. Fallar gasta una; acertar te la devuelve.', seg: 8 },
    { fase: 'prep', a: null, t: 'Mientras los colados se pintan, <b>PRACTICA</b>: toca a los camaleones de prácticas que salen en la sala.', empieza: s => { s.n = PRACTICA.aciertos + J.cuenta.fallos; }, hecho: s => PRACTICA.aciertos + J.cuenta.fallos > s.n, seg: 20 },
    { fase: 'caza', a: null, t: '¡A buscar! <b>Toca</b> donde creas que hay un colado: busca colores que no casan y dibujos torcidos.', seg: 9 },
    { fase: 'caza', a: '#e-quedan', t: 'Aquí ves cuántos colados <b>QUEDAN</b>. Las ondas de los silbidos te dicen por dónde andan.', seg: 8 },
  ],
};
const BOC = { lista: null, i: 0, estado: {}, t: 0, caja: null, foco: null, txt: '' };
const bocadilloActivo = () => !!(BOC.lista && BOC.caja && !BOC.caja.hidden);

function bocadilloPrepara() {
  if (BOC.caja) return;
  BOC.foco = document.createElement('div'); BOC.foco.className = 'foco-tuto'; BOC.foco.hidden = true;
  BOC.caja = document.createElement('div'); BOC.caja.className = 'bocadillo'; BOC.caja.hidden = true;
  BOC.caja.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (e.target.closest('.salta')) { bocadilloAcaba(true); return; }
    const p = BOC.lista && BOC.lista[BOC.i]; if (p && p.seg) bocadilloSigue();      // los pasos que solo cuentan algo se cierran al tocarlos
  });
  document.body.append(BOC.foco, BOC.caja);
}
// al empezar una partida contra bots (la llama tutoFase al entrar en 'prep')
function bocadilloEmpieza() {
  BOC.lista = null;
  if (J.pvp || !J.yo || J.fase === 'paseo') return;
  const rol = J.yo.clase, clave = rol === 'cazador' ? 'bcaz' : 'bcam';
  if (SAVE.tuto && SAVE.tuto[clave]) return;
  bocadilloPrepara();
  BOC.lista = BOCADILLOS[rol]; BOC.rol = clave; BOC.i = -1; bocadilloSigue();
}
function bocadilloSigue() {
  BOC.i++; BOC.t = 0; BOC.estado = {}; BOC.empezado = false; BOC.txt = '';
  if (!BOC.lista || BOC.i >= BOC.lista.length) bocadilloAcaba(false);
}
function bocadilloAcaba(saltado) {
  if (BOC.rol) { SAVE.tuto = SAVE.tuto || {}; SAVE.tuto[BOC.rol] = 1; guardaPartida(); }
  BOC.lista = null; if (BOC.caja) { BOC.caja.hidden = true; BOC.foco.hidden = true; }
  if (saltado) play('select');
}
// cada fotograma (desde principal.js): coloca el bocadillo, mira si el paso está hecho y pasa al siguiente
function bocadilloAvanza(dt) {
  if (!BOC.lista || !BOC.caja) return;
  if (J.pvp || J.fase === 'titulo' || J.fase === 'fin' || J.fase === 'paseo' || !J.yo || J.yo.fuera) { if (J.fase === 'fin' || J.fase === 'titulo') { BOC.lista = null; } BOC.caja.hidden = BOC.foco.hidden = true; return; }
  const p = BOC.lista[BOC.i];
  const fase = J.fase === 'cuenta' ? 'prep' : J.fase;
  const tapado = J.pausa || document.querySelector('.pantalla:not([hidden])');
  if (!p || p.fase !== fase || tapado) { BOC.caja.hidden = BOC.foco.hidden = true; if (p && p.fase === 'prep' && fase === 'caza') bocadilloSigue(); return; }
  const el = p.a ? document.querySelector(p.a) : null, seVe = !p.a || (el && el.offsetParent);
  if (!BOC.empezado) { if (!seVe) { BOC.caja.hidden = BOC.foco.hidden = true; return; } BOC.empezado = true; if (p.empieza) p.empieza(BOC.estado); }      // empieza cuando se ve su botón
  // ¿ya está hecho? (se mira antes que si se ve el botón: al tocar PINTAR, por ejemplo, el botón se esconde)
  if (p.hecho && p.hecho(BOC.estado)) { play('select'); bocadilloSigue(); return; }
  BOC.t += dt;
  if (p.seg && BOC.t > p.seg) { bocadilloSigue(); return; }
  if (!seVe) { BOC.caja.hidden = BOC.foco.hidden = true; return; }
  // el texto, el paso y, si se cierra tocándolo, el aviso
  const txt = tr(p.t) + `<small><span>${tr('{n} de {t}', { n: BOC.i + 1, t: BOC.lista.length })}</span>` + (p.seg ? `<i>${tr('VALE')}</i>` : '') + `<u class="salta">${tr('Saltar tutorial')}</u></small>`;
  if (BOC.txt !== txt) { BOC.txt = txt; BOC.caja.innerHTML = txt; }
  BOC.caja.hidden = false;
  // dónde: encima del botón (o debajo, si no cabe); sin botón, en el centro
  const vw = innerWidth, vh = innerHeight, r = BOC.caja.getBoundingClientRect();
  if (el) {
    const b = el.getBoundingClientRect();
    Object.assign(BOC.foco.style, { left: (b.x - 6) + 'px', top: (b.y - 6) + 'px', width: (b.width + 12) + 'px', height: (b.height + 12) + 'px' }); BOC.foco.hidden = false;
    const x = limita(b.x + b.width / 2 - r.width / 2, 10, vw - r.width - 10), arriba = b.y - r.height - 26 > 8;
    BOC.caja.style.left = x + 'px'; BOC.caja.style.top = (arriba ? b.y - r.height - 26 : b.y + b.height + 26) + 'px';
    BOC.caja.classList.toggle('abajo', !arriba); BOC.caja.style.setProperty('--flecha', limita(b.x + b.width / 2 - x, 22, r.width - 22) + 'px');
  } else {
    BOC.foco.hidden = true; BOC.caja.classList.remove('abajo'); BOC.caja.classList.add('centro');
    BOC.caja.style.left = (vw - r.width) / 2 + 'px'; BOC.caja.style.top = vh * 0.24 + 'px';
  }
  if (el) BOC.caja.classList.remove('centro');
}
// OPCIONES › Repetir tutorial
function bocadilloRepite() { SAVE.tuto = {}; guardaPartida(); avisa(tr('El tutorial saldrá otra vez en tu próxima partida contra bots'), 'bueno'); play('select'); }
