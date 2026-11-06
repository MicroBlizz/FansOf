// Fans of Zombies · LAS PANTALLAS (pantalla): el menú principal (una tele de emergencia con estática y cinta de aviso), la ficha de
// evacuación (eliges animal y dificultad), la pausa (con las teclas) y el cartel de «SE BUSCA» al morir («Así es como cayó…»).
'use strict';
const VENTAJAS_TXT = {
  bunny: 'Más vida, y sus orejas te dicen cuántos fans hay cerca.',
  squirrel: 'Corre más y deja la mitad de huellas en la nieve.',
  fox: 'Hace la mitad de ruido al andar y al golpear.',
  junkcoon: 'Registra mucho más rápido y encuentra una cosa más.',
  meercat: 'La infección le avanza más despacio y venda mejor.',
};
const NOMBRE_ZOMBI = { fan: 'Fan', streamer: 'Streamer', speedrunner: 'Speedrunner', ballena: 'Ballena', bot: 'Bot', troll: 'Troll' };
const ORDEN_ANIMALES = ['bunny', 'squirrel', 'fox', 'junkcoon', 'meercat'];
const RETRATOS = {};
function retrato(tipo) {
  if (RETRATOS[tipo]) return RETRATOS[tipo];
  const N = 96, rt = new THREE.WebGLRenderTarget(N, N), esc3 = new THREE.Scene(), p = montaPersonaje(tipo, true);
  ponArma(p, 'escopeta'); p.grupo.rotation.y = 0.5; esc3.add(p.grupo);
  esc3.add(new THREE.HemisphereLight(0xdfe8f4, 0x50586a, 0.9)); const s = new THREE.DirectionalLight(0xffffff, 0.6); s.position.set(-3, 5, 6); esc3.add(s);
  const cam = new THREE.OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 0.1, 50); cam.position.set(0, 2.4, 10); cam.lookAt(0, 1.7, 0);
  MOTOR.r.setRenderTarget(rt); MOTOR.r.setClearColor(0x000000, 0); MOTOR.r.clear(); MOTOR.r.render(esc3, cam); MOTOR.r.setRenderTarget(null); MOTOR.r.setClearColor(0x000000, 1);
  const px = new Uint8Array(N * N * 4); MOTOR.r.readRenderTargetPixels(rt, 0, 0, N, N, px);
  const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) img.data.set(px.subarray((N - 1 - y) * N * 4, (N - y) * N * 4), y * N * 4);   // WebGL lee del revés
  g.putImageData(img, 0, 0); rt.dispose();
  return (RETRATOS[tipo] = c.toDataURL());
}
const capa = (html) => { el('zb').innerHTML = '<div class="zb-oscuro"></div>' + html; };

/* ---------- el menú: la tele de emergencia ---------- */
function abreMenu() {
  JUEGO.pantalla = 'menu'; musica('olvidados');
  const m = SAVE.mejor, g = leeMundo(), hay = g && g.v === ZOM.VERSION_GUARDADO && g.partida && ZOM.AJ.animales[g.partida.jugador.animal] ? g : null;
  capa('<div class="zb-tele"><div class="zb-pantalla"><canvas id="zb-estatica" width="160" height="100"></canvas>' +
    '<div class="zb-tv-cinta">' + esc(tr('AVISO DE EMERGENCIA · DISTRITO MICROBLIZZ · NO SALGA DE CASA · NO HAGA RUIDO · NO ACTUALICE EL JUEGO') + ' · ').repeat(3) + '</div>' +
    '<p class="zb-tv-pre">' + esc(tr('MICROBLIZZ PRESENTA, AUNQUE NO QUIERA')) + '</p><h1>FANS OF <b>ZOMBIES</b></h1>' +
    '<p class="zb-tv-lema">' + esc(tr('El parche 1.0 salió mal. Los fans ya no juegan: te buscan.')) + '</p>' +
    '<nav class="zb-canales">' + (hay ? '<button id="m-seguir" class="sel"><em>CH 0</em>' + esc(tr('CONTINUAR')) + '<small>' + esc(trf('Día %1 · %2', ZOM.diaDe(hay.partida.min), ZOM.AJ.animales[hay.partida.jugador.animal].n)) + '</small></button>' : '') +
    '<button id="m-nueva"' + (hay ? '' : ' class="sel"') + '><em>CH 1</em>' + esc(tr('NUEVA PARTIDA')) + (m.min ? '<small>' + esc(trf('Tu mejor: %1', tiempoVivo(m.min))) + '</small>' : '') + '</button>' +
    '<button id="m-sonido"><em>CH 2</em>' + esc(tr(AJUSTES.mudo ? 'SONIDO: NO' : 'SONIDO: SÍ')) + '</button><a class="boton-canal" href="../../"><em>CH 3</em>' + esc(tr('BIBLIOTECA')) + '</a></nav>' +
    '<p class="zb-tv-rec">' + esc(tr('EN DIRECTO')) + ' ●</p></div><div class="zb-tele-pie"><i></i><i></i><span>MICROBLIZZ VISION</span></div></div>' +
    '<div class="zb-nota">' + esc(tr('Si ves esto, sigues vivo. No abras la puerta a nadie con sudadera.')) + '<span>— CB</span></div>' +
    '<p class="zb-ver">' + esc(tr('PROTOTIPO')) + ' · v' + ZOM.AJ.version + '</p>');
  el('m-nueva').onclick = () => { play('select'); if (hay) confirmBox(tr('¿EMPEZAR DE NUEVO?'), esc(tr('Se perderá la partida que tienes empezada.')), tr('EMPEZAR'), abreFicha); else abreFicha(); };
  if (hay) el('m-seguir').onclick = () => { play('go'); continuaPartida(); };
  el('m-sonido').onclick = () => { cambiaSonido(); abreMenu(); };
  estatica();
}
function estatica() {
  const cv = el('zb-estatica'); if (!cv) return;
  const g = cv.getContext('2d'), img = g.createImageData(160, 100);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0); requestAnimationFrame(estatica);
}

/* ---------- la ficha de evacuación ---------- */
function abreFicha() {
  JUEGO.pantalla = 'ficha';
  const a = SAVE.animal, A = ZOM.AJ.animales[a];
  capa('<div class="zb-ficha"><div class="zb-sello">' + esc(tr('REFUGIADO')) + '</div>' +
    '<header><span>' + esc(tr('MICROBLIZZ · PROTECCIÓN CIVIL (MÁS O MENOS)')) + '</span><h2>' + esc(trf('FICHA DE EVACUACIÓN Nº %1', String(SAVE.partidas + 1).padStart(4, '0'))) + '</h2></header>' +
    '<div class="zb-ficha-cuerpo"><div class="zb-polaroid"><img alt="" src="' + retrato(a) + '"><span>' + esc(A.n) + '</span></div><div class="zb-datos">' +
    '<p class="zb-campo"><span>' + esc(tr('NOMBRE')) + '</span><b>' + esc(A.n) + '</b></p><p class="zb-campo"><span>' + esc(tr('VENTAJA')) + '</span><b>' + esc(tr(A.ventaja)) + '</b></p>' +
    '<p class="zb-desc">' + esc(tr(VENTAJAS_TXT[a])) + '</p><p class="zb-desc">' + esc(tr('Sobrevive todos los días que puedas. Come, bebe, duerme y no hagas ruido.')) + '</p></div></div>' +
    '<p class="zb-sub">' + esc(tr('¿QUIÉN SALE?')) + '</p><div class="zb-animales">' + ORDEN_ANIMALES.map((k) => '<button class="zb-anim' + (k === a ? ' sel' : '') + '" data-a="' + k + '"><img alt="" src="' + retrato(k) + '"><b>' + esc(ZOM.AJ.animales[k].n) + '</b><small>' + esc(tr(ZOM.AJ.animales[k].ventaja)) + '</small></button>').join('') + '</div>' +
    '<p class="zb-sub">' + esc(tr('CÓMO DE MAL QUIERES PASARLO')) + '</p><div class="zb-dif">' + Object.entries(ZOM.AJ.dificultades).map(([k, d]) => '<button data-d="' + k + '"' + (k === SAVE.dificultad ? ' class="sel"' : '') + '>' + esc(tr(d.n)) + '<small>' + esc(tr(DIF_TXT[k])) + '</small></button>').join('') + '</div>' +
    '<div class="zb-firma"><button class="btn" id="f-volver">' + esc(tr('VOLVER')) + '</button><button class="btn-grande" id="f-salir">' + esc(tr('FIRMAR Y SALIR')) + '</button></div></div>');
  document.querySelectorAll('.zb-anim').forEach((b) => (b.onclick = () => { play('select'); SAVE.animal = b.dataset.a; abreFicha(); }));
  document.querySelectorAll('.zb-dif button').forEach((b) => (b.onclick = () => { play('select'); SAVE.dificultad = b.dataset.d; abreFicha(); }));
  el('f-volver').onclick = () => { play('select'); abreMenu(); };
  el('f-salir').onclick = () => { play('go'); guardaPartida(); empiezaPartida(); };
}
const DIF_TXT = { turista: 'Menos fans, muerden flojo y el hambre va despacio', superviviente: 'Lo normal', caiste: 'Más fans, más hambre y muerden fuerte' };

/* ---------- la pausa ---------- */
function abrePausa() {
  JUEGO.pausa = true; guardaAhora();
  const teclas = [['WASD / flechas', 'andar'], ['Mayús', 'correr (mucho ruido)'], ['C', 'agacharse (sin ruido)'], ['Clic / espacio', 'atacar hacia el ratón'], ['Clic derecho / R', 'empujar (tumba sin ruido)'], ['1 a 6', 'escopeta, pistola, palanca, bate, hacha y cuchillo'],
    ['F', 'registrar o abrir y cerrar puertas'], ['B', 'clavar tablas (martillo, tablas y 2 clavos)'], ['Tab', 'abrir y cerrar la mochila'], ['M', 'el mapa de lo que has visto'], ['E / Q / V', 'comer / beber / vendarte'], ['Z', 'dormir (sin fans cerca)']];
  el('zb-capa').innerHTML = '<div class="zb-oscuro"></div><div class="zb-pausa"><h2>' + esc(tr('PAUSA')) + '</h2><ul>' + teclas.map(([k, t]) => '<li><b>' + esc(tr(k)) + '</b>' + esc(tr(t)) + '</li>').join('') + '</ul>' +
    '<p>' + esc(tr('Todo hace ruido y el ruido los atrae: los anillos te dicen hasta dónde llega. Las huellas en la nieve también te delatan.')) + '</p>' +
    '<div class="zb-botones"><button class="btn-grande" id="p-seguir">' + esc(tr('SEGUIR')) + '</button><button class="btn" id="p-menu">' + esc(tr('RENDIRSE')) + '</button></div></div>';
  el('p-seguir').onclick = cierraPausa;
  el('p-menu').onclick = () => { cierraPausa(); ZOM.dana(JUEGO.e, 9999, 'rendirse'); };
}
function cierraPausa() { JUEGO.pausa = false; el('zb-capa').innerHTML = ''; }

/* ---------- al morir: el cartel ---------- */
function tiempoVivo(min) { const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60); return trf('%1 días y %2 horas', d, h); }
function causaTxt(m) {
  const c = m.causa || {};
  if (c.causa === 'mordisco') return trf('Mordido por un fan %1.', tr(NOMBRE_ZOMBI[c.quien] || 'Fan'));
  return tr({ hambre: 'Se le olvidó comer.', sed: 'Se le olvidó beber.', sueno: 'Se quedó dormido de pie para siempre.', infeccion: 'La infección pudo con él.', comida: 'Comió lo que no debía.', rendirse: 'Se rindió. Le entendemos.' }[c.causa] || 'Nadie sabe cómo.');
}
function abreMuerte(m) {
  JUEGO.pantalla = 'muerte'; musica('lose');
  const A = ZOM.AJ.animales[m.animal], record = m.min > SAVE.mejor.min;
  SAVE.partidas++; if (record) SAVE.mejor = { min: m.min, bajas: m.bajas }; guardaPartida();
  el('zb-capa').innerHTML = '<div class="zb-oscuro rojo"></div><div class="zb-cartel"><p class="zb-cinta">' + esc(tr('NO CRUZAR · ZONA INFECTADA · NO CRUZAR · ZONA INFECTADA')) + '</p>' +
    '<h2>' + esc(tr('SE BUSCA')) + '</h2><p class="zb-cartel-sub">' + esc(tr('(aunque ya no hace falta)')) + '</p>' +
    '<div class="zb-polaroid gris"><img alt="" src="' + retrato(m.animal) + '"><span>' + esc(A.n) + '</span></div>' +
    '<h3>' + esc(trf('ASÍ ES COMO CAYÓ %1', A.n.toUpperCase())) + '</h3><p class="zb-causa">' + esc(causaTxt(m)) + '</p>' +
    '<div class="zb-stats"><p><b>' + esc(tiempoVivo(m.min)) + '</b><span>' + esc(tr('SOBREVIVIDO')) + '</span></p><p><b>' + m.bajas + '</b><span>' + esc(tr('FANS DESPEDIDOS')) + '</span></p><p><b>' + m.registros + '</b><span>' + esc(tr('SITIOS REGISTRADOS')) + '</span></p></div>' +
    (record ? '<p class="zb-desbloq">' + esc(tr('¡TU MEJOR PARTIDA!')) + '</p>' : '<p class="zb-desbloq">' + esc(trf('Tu mejor: %1', tiempoVivo(SAVE.mejor.min))) + '</p>') +
    '<div class="zb-botones"><button class="btn-grande" id="d-otro">' + esc(tr('OTRO SUPERVIVIENTE')) + '</button><button class="btn" id="d-menu">' + esc(tr('MENÚ')) + '</button></div></div>';
  el('d-otro').onclick = () => { play('select'); terminaPartida(); abreFicha(); };
  el('d-menu').onclick = () => { play('select'); terminaPartida(); abreMenu(); };
}
