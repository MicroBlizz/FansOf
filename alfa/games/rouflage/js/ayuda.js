// Fans of Rouflage · CÓMO SE JUEGA EN TARJETAS (pedido por Daniel el 25-10-2026: «que sea fácil, es para niños de 13 años»). En vez del muro de texto,
// dos pestañas (CAMALEÓN y CAZADOR) con 4 pasos cortos cada una (el cuarto: qué pasa cuando te quedas sin jugar, los poderes de fantasma) y su dibujo, hecho con las piezas del propio juego (como las tarjetas del título,
// pintaTarjetas en interfaz.js, y en el mismo trozo de mapa). La explicación larga de siempre sigue debajo, en MÁS DETALLES.
// muestraAyuda(luego, modo) (interfaz.js) abre la pestaña del papel que vas a jugar. Los dibujos se hacen una vez, al arrancar (ayudaDibuja).
'use strict';

const AYUDA = { tab: 'camaleon', detalles: false, hecho: false };
const AYUDA_PASOS = {
  camaleon: [
    ['ESCÓNDETE', 'Tienes 60 segundos para buscar un sitio con dibujo: un suelo, una pared, una planta.'],
    ['PÍNTATE', 'Toca PINTAR y cópiale los colores al suelo que tienes debajo.'],
    ['CONGÉLATE', 'Toca CONGELAR y no te muevas. ¡Si no te encuentran, ganas!'],
    ['SI TE DESPIDEN', 'Te haces fantasma y sigues ayudando con el botón de tu poder. Cada vez que lo usas, cambia a otro.'],
  ],
  cazador: [
    ['BUSCA', 'Hay 5 colados pintados por el mapa. Busca manchas raras con tu linterna.'],
    ['TOCA', 'Toca donde creas que hay uno para despedirlo. Tiene que estar cerca.'],
    ['NO FALLES', 'Tienes 5 cartas. Si fallas, pierdes una; si aciertas, la recuperas.'],
    ['SIN CARTAS', 'Te haces fantasma y ayudas a los tuyos con el botón de tu poder. Cada vez que lo usas, cambia a otro.'],
  ],
};
const AYUDA_TRUCO = {
  camaleon: 'Truco: antes de jugar eliges un TALENTO, un poder especial como la granada de humo.',
  cazador: 'Truco: escucha los silbidos, te dicen por dónde andan los colados.',
};

/* ---------- los 8 dibujos, con las piezas del juego ---------- */
function ayudaDibuja() {
  if (typeof MAPA === 'undefined' || !MAPA.fondo) return;
  AYUDA.cv = {};
  const falsa = (tipo, x, y, clase = 'camaleon') => { const [piel, pctx] = nuevaPiel(clase === 'cazador' ? '#aab4c4' : BLANCO_PIEL); return { clase, tipo, x, y, mira: 1, dir: 0, hielo: 0, piel, pctx, pasos: [], semilla: 3, anda: 0, alerta: 0, ciego: 0, balas: 5 }; };
  const lienzo = (id, x0, y0, z = 2.6) => { const cv = document.createElement('canvas'); cv.width = 220; cv.height = 160; const c = cv.getContext('2d'); c.setTransform(z, 0, 0, z, -x0 * z, -y0 * z); c.drawImage(MAPA.fondo, 0, 0, ANCHO, ALTO); AYUDA.cv[id] = cv; return c; };
  const borde = (c, e) => { c.save(); c.translate(e.x, e.y); c.beginPath(); trazaAlubia(c); c.setLineDash([3, 3]); c.lineWidth = 1.4; c.strokeStyle = '#fff6ea'; c.stroke(); c.restore(); };
  try {
    // CAMALEÓN · 1 escóndete: tu alubia sin pintar, buscando sitio
    let c = lienzo('camaleon0', 935, 296); const a = falsa('bunny', 976, 344); pintaAlubia(c, a, 1); pintaSigno(c, 976, 318, '?', '#e8731a', 0);
    // 2 píntate: a medio pintar
    c = lienzo('camaleon1', 978, 290); const b = falsa('fox', 1020, 336); pintaBot(b, 0.55); pintaAlubia(c, b, 1);
    // 3 congélate: pintada del todo y congelada (la raya de puntos es por dónde está)
    c = lienzo('camaleon2', 978, 290); const d = falsa('fox', 1020, 336); pintaBot(d, 0.95); d.hielo = 1; pintaAlubia(c, d, 1); borde(c, d);
    forma(c, poli(1012, 300, 1028, 300, 1020, 310), '#ffcb3d', 2.4);
    // CAZADOR · 1 busca: a oscuras, con la linterna
    c = lienzo('cazador0', 86, 462); const h = falsa('becario', 106, 510, 'cazador'), p = falsa('squirrel', 158, 500);
    pintaBot(p, 0.4); p.hielo = 1; pintaAlubia(c, p, 1);
    c.fillStyle = 'rgba(10,6,28,0.66)'; c.beginPath(); c.rect(80, 450, 110, 80); c.moveTo(118, 500); c.lineTo(195, 462); c.lineTo(195, 540); c.closePath(); c.fill('evenodd');
    pintaAlubia(c, h, 1);
    // 2 toca: la diana sobre el colado mal pintado
    c = lienzo('cazador1', 120, 462); const q = falsa('squirrel', 162, 506); pintaBot(q, 0.4); q.hielo = 1; pintaAlubia(c, q, 1);
    c.lineWidth = 3; c.strokeStyle = OL; c.beginPath(); c.arc(162, 500, 17, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.strokeStyle = '#ff7a1a'; c.beginPath(); c.arc(162, 500, 17, 0, Math.PI * 2); c.moveTo(162, 478); c.lineTo(162, 488); c.moveTo(162, 512); c.lineTo(162, 522); c.moveTo(140, 500); c.lineTo(150, 500); c.moveTo(174, 500); c.lineTo(184, 500); c.stroke();
    pintaSigno(c, 162, 476, '!', '#d23b3b', 0);
    // 3 no falles: las 5 cartas de despido, una tachada (dibujadas aquí, sin mapa)
    const cv = document.createElement('canvas'); cv.width = 220; cv.height = 160; AYUDA.cv.cazador2 = cv; c = cv.getContext('2d');
    c.fillStyle = '#1b2540'; c.fillRect(0, 0, 220, 160);
    for (let i = 0; i < 5; i++) {
      const x = 22 + i * 36, y = 46 + (i % 2) * 8, mala = i === 4;
      c.save(); c.translate(x + 16, y + 30); c.rotate((i - 2) * 0.08);
      forma(c, cc => rrPathRF(cc, -16, -30, 32, 60, 6), mala ? '#5c6578' : '#fff6ea', 3);
      forma(c, cc => rrPathRF(cc, -10, -6, 20, 14, 3), mala ? '#7a8294' : '#d23b3b', 2);
      if (mala) { c.lineWidth = 5; c.strokeStyle = OL; c.beginPath(); c.moveTo(-14, -24); c.lineTo(14, 24); c.moveTo(14, -24); c.lineTo(-14, 24); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#ff4b5c'; c.stroke(); }
      c.restore();
    }
    // CAMALEÓN · 4 si te despiden: tu fantasma le da un susto a un becario
    c = lienzo('camaleon3', 86, 462); const h2 = falsa('becario', 152, 522, 'cazador'); h2.mira = -1; pintaAlubia(c, h2, 1);
    pintaFantasmaEn(c, 1.2, { x: 108, y: 500, mira: 1, mueve: false }, falsa('fox', 0, 0), 0.85, null);
    rotulo(c, tr('¡BUUU!'), 140, 470, 8, '#cfe9ff', OL, LETRA_UI);
    // CAZADOR · 4 sin cartas: tu fantasma de becario deja un aviso donde hay un colado
    c = lienzo('cazador3', 120, 462); const q2 = falsa('squirrel', 176, 506); pintaBot(q2, 0.6); q2.hielo = 1; pintaAlubia(c, q2, 1);
    pintaFantasmaEn(c, 2.1, { x: 138, y: 500, mira: 1, mueve: false }, falsa('becario', 0, 0, 'cazador'), 0.85, null);
    c.save(); c.translate(176, 506); c.beginPath(); c.moveTo(0, -46); c.lineTo(10, -34); c.lineTo(0, -22); c.lineTo(-10, -34); c.closePath(); c.fillStyle = '#7fe8ff'; c.strokeStyle = OL; c.lineWidth = 2.4; c.lineJoin = 'round'; c.stroke(); c.fill();
    c.fillStyle = OL; c.fillRect(-1.3, -41, 2.6, 6.5); c.fillRect(-1.3, -32, 2.6, 2.6); c.restore();
  } catch (e) { AYUDA.cv = null; }
}

/* ---------- la pantalla ---------- */
function ayudaPrepara() {
  if (AYUDA.hecho) return; AYUDA.hecho = true;
  const caja = E('p-ayuda').querySelector('.caja'), pasos = caja.querySelector('.pasos');
  const d = document.createElement('div'); d.className = 'ay-nueva';
  d.innerHTML = '<div class="ay-pest"><button type="button" class="ay-tab camaleon" data-tab="camaleon"><i data-icono="pincel"></i><b></b></button><button type="button" class="ay-tab cazador" data-tab="cazador"><i data-icono="diana"></i><b></b></button></div>'
    + '<div class="ay-tarjetas" id="ay-tarjetas"></div><p class="ay-truco" id="ay-truco"></p><button type="button" class="boton gris peq ay-mas" id="b-ay-mas"></button>';
  pasos.before(d);
  d.querySelectorAll('[data-icono]').forEach(i => ponIcono(i, i.dataset.icono));
  d.querySelectorAll('.ay-tab').forEach(b => { b.onclick = () => { play('select'); AYUDA.tab = b.dataset.tab; ayudaPinta(); }; });
  E('b-ay-mas').onclick = () => { play('select'); AYUDA.detalles = !AYUDA.detalles; ayudaPinta(); if (AYUDA.detalles) pasos.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
}
function ayudaPinta(modo) {
  ayudaPrepara();
  if (modo === 'camaleon' || modo === 'cazador') AYUDA.tab = modo;
  if (!AYUDA.cv) ayudaDibuja();
  const caja = E('p-ayuda').querySelector('.caja');
  caja.querySelectorAll('.ay-tab').forEach(b => { b.classList.toggle('activa', b.dataset.tab === AYUDA.tab); b.querySelector('b').textContent = tr(b.dataset.tab === 'camaleon' ? 'CAMALEÓN' : 'CAZADOR'); });
  const lista = E('ay-tarjetas'); lista.innerHTML = ''; lista.className = 'ay-tarjetas ' + AYUDA.tab;
  AYUDA_PASOS[AYUDA.tab].forEach(([t, txt], i) => {
    const art = document.createElement('div'); art.className = 'ay-tarjeta';
    const dib = AYUDA.cv && AYUDA.cv[AYUDA.tab + i];
    if (dib) { const cv = document.createElement('canvas'); cv.width = dib.width; cv.height = dib.height; cv.getContext('2d').drawImage(dib, 0, 0); art.appendChild(cv); }
    const tx = document.createElement('div'); tx.innerHTML = `<b class="ol"><em>${i + 1}</em></b><p></p>`;
    tx.querySelector('b').append(tr(t)); tx.querySelector('p').textContent = tr(txt);
    art.appendChild(tx); lista.appendChild(art);
  });
  E('ay-truco').textContent = tr(AYUDA_TRUCO[AYUDA.tab]);
  caja.querySelector('.pasos').hidden = !AYUDA.detalles;
  E('b-ay-mas').textContent = AYUDA.detalles ? tr('MENOS DETALLES') : tr('MÁS DETALLES');
}
