// Fans of Ratkov · EL REFUGIO (1): las pestañas, preparar la incursión (lo que llevas, tu animal, el kit gratis si te has quedado sin
// nada), el alijo (equipar, llenar la mochila, los bolsillos y la riñonera) y los retratos del escuadrón (se pintan una vez con el motor).
'use strict';
let PESTANA = 'incursion';
function abreRefugio(p = PESTANA) {
  el('titulo').hidden = true; el('refugio').hidden = false; muestraHud(false); musica(SAVE.menuMus || 'olvidados');
  // la primera vez se ofrece el tutorial
  if (!SAVE.visto.tuto && !SAVE.visto.ofrecido) { SAVE.visto.ofrecido = true; guardaPartida(); setTimeout(() => confirmBox(tr('¿EMPEZAMOS POR EL TUTORIAL?'), esc(tr('Un patio tranquilo donde aprendes a andar, registrar, disparar, curarte y salir. Tarda un par de minutos y BoomBeaver te da un premio.')), tr('IR AL TUTORIAL'), empiezaTutorial), 300); }
  cambiaPestana(p);
}
function cambiaPestana(p) {
  PESTANA = p;
  document.querySelectorAll('#r-pestanas button').forEach(b => b.classList.toggle('activa', b.dataset.p === p));
  pon2('r-chapas', miles(SAVE.chapas));
  const f = { incursion: pintaIncursion, alijo: pintaAlijo, mercader: pintaMercader, banco: pintaBanco, taller: pintaTaller, mejoras: pintaMejoras, escuadron: pintaEscuadron, encargos: pintaEncargos }[p];
  el('r-cuerpo').innerHTML = ''; f(el('r-cuerpo')); el('r-cuerpo').scrollTop = 0;
}
function repinta() { const y = el('r-cuerpo').scrollTop; cambiaPestana(PESTANA); el('r-cuerpo').scrollTop = y; }
const pon2 = (id, t) => { el(id).textContent = t; };
const conClick = (raiz, f) => raiz.querySelectorAll('[data-a]').forEach(b => (b.onclick = () => f(b.dataset.a, b.dataset.i, b)));

/* ---------- retratos: el modelo 3D pintado una vez en pequeño ---------- */
const RETRATOS = {};
function retrato(tipo, esAnimal = true) {
  const k = tipo + (esAnimal ? '' : '-e'); if (RETRATOS[k]) return RETRATOS[k];
  const N = 96, rt = new THREE.WebGLRenderTarget(N, N), esc3 = new THREE.Scene(), p = montaPersonaje(tipo, esAnimal);
  ponArma(p, esAnimal ? 'fusil' : TIPOS_ENEMIGO[tipo].arma); p.grupo.rotation.y = 0.5; esc3.add(p.grupo);
  esc3.add(new THREE.HemisphereLight(0xdfe8f4, 0x50586a, 0.9)); const s = new THREE.DirectionalLight(0xffffff, 0.6); s.position.set(-3, 5, 6); esc3.add(s);
  const alto = (tipo === 'auditor' ? 4.4 : 3.6), cam = new THREE.OrthographicCamera(-alto / 2, alto / 2, alto / 2, -alto / 2, 0.1, 50);
  cam.position.set(0, alto / 2 + 0.6, 10); cam.lookAt(0, alto / 2 - 0.1, 0);
  MOTOR.r.setRenderTarget(rt); MOTOR.r.setClearColor(0x000000, 0); MOTOR.r.clear(); MOTOR.r.render(esc3, cam); MOTOR.r.setRenderTarget(null); MOTOR.r.setClearColor(0x000000, 1);
  const px = new Uint8Array(N * N * 4); MOTOR.r.readRenderTargetPixels(rt, 0, 0, N, N, px);
  const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const a = ((N - 1 - y) * N + x) * 4, b = (y * N + x) * 4; for (let i = 0; i < 4; i++) img.data[b + i] = px[a + i]; }
  // contorno de un punto, como en el juego
  const d = img.data, solido2 = i => d[i * 4 + 3] > 10, borde = [];
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; if (!solido2(i) && (solido2(i - 1) || solido2(i + 1) || solido2(i - N) || solido2(i + N))) borde.push(i); }
  for (const i of borde) { d[i * 4] = 18; d[i * 4 + 1] = 14; d[i * 4 + 2] = 24; d[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0); rt.dispose();
  return (RETRATOS[k] = c.toDataURL());
}

/* ---------- INCURSIÓN: preparar y entrar ---------- */
function pintaIncursion(raiz) {
  const eq = SAVE.equipo, A = ANIMALES[SAVE.animal], cas = casillasMochila();
  const peso = pesoEncima(eq, SAVE.mochila, SAVE.bolsillos, SAVE.rinonera);
  const sinNada = !eq.arma1 && !eq.arma2 && !SAVE.alijo.some(o => o && ARMAS[o.id]);
  let h = '<section class="tarjeta prepara"><img class="retrato" alt="" src="' + retrato(SAVE.animal) + '"><div><p class="sup">' + esc(tr(A.rol)) + '</p><h2>' + esc(A.n) + '</h2><p>' + esc(tr(A.d)) + '</p>' +
    '<p class="datos">' + esc(tr('VIDA')) + ' <b>' + A.vida + '</b> · ' + esc(tr('MOCHILA')) + ' <b>' + cas.w + '×' + cas.h + '</b> ' + esc(tr('casillas')) + ' · ' + esc(tr('PESO')) + ' <b>' + peso.toFixed(1) + '</b>/' + PESO_LIBRE + ' kg</p></div></section>';
  h += '<section class="tarjeta"><h3>' + esc(tr('LO QUE LLEVAS')) + '</h3><div class="lista">';
  for (const [k, n] of [['arma1', 'ARMA 1'], ['arma2', 'ARMA 2'], ['chaleco', 'CHALECO'], ['casco', 'CASCO'], ['mochila', 'MOCHILA']]) {
    const o = eq[k]; h += o ? filaObj(o, '', '<em>' + esc(tr(n)) + '</em>' + avisoMunicion(o)) : '<div class="fila-obj hueco"><i class="ic"></i><div class="fo-t"><b>' + esc(tr(n)) + '</b><span>' + esc(tr('vacío')) + '</span></div></div>';
  }
  h += '</div><p class="nota">' + esc(trf('En la mochila: %1 de %2 casillas. En los bolsillos: %3.', casillasUsadas(SAVE.mochila), totalCasillas(cas), casillasUsadas(SAVE.bolsillos))) + '</p>';
  h += '<button type="button" class="btn" data-a="alijo">' + esc(tr('CAMBIAR EN EL ALIJO')) + '</button></section>';
  if (sinNada) h += '<section class="tarjeta aviso-t"><h3>' + esc(tr('KIT DE REINSERCIÓN LABORAL')) + '</h3><p>' + esc(tr('Microblizz te regala una pistola, unas balas y una venda para que vuelvas al trabajo. Qué detalle.')) + '</p><button type="button" class="btn" data-a="kit">' + esc(tr('ACEPTAR EL KIT')) + '</button></section>';
  h += '<section class="tarjeta' + (SAVE.visto.tuto ? '' : ' aviso-t') + '"><h3>' + esc(tr('TUTORIAL: EL PATIO DEL REFUGIO')) + (SAVE.visto.tuto ? ' <small class="bien">' + esc(tr('HECHO')) + '</small>' : '') + '</h3><p>' + esc(tr('Aprende lo básico en un sitio seguro: andar, registrar, disparar, curarte, calentarte y salir.')) + '</p><button type="button" class="btn" data-a="tuto">' + esc(tr(SAVE.visto.tuto ? 'REPETIR EL TUTORIAL' : 'EMPEZAR EL TUTORIAL')) + '</button></section>';
  // el seguro de Phony: pagas antes de entrar; si caes, te devuelve lo que llevabas puesto… casi siempre
  const prS = precioSeguro();
  h += '<section class="tarjeta"><h3>' + esc(tr('SEGURO DE PHONY')) + (SAVE.seguro ? ' <small class="bien">' + esc(tr('CONTRATADO')) + '</small>' : '') + '</h3><p>' + esc(tr('Si caes, Phony te devuelve lo que llevas puesto (armas, chaleco, casco y mochila, sin lo de dentro). Casi siempre: a veces pierde el papeleo.')) + '</p>' + (SAVE.seguro ? '<p class="datos">' + esc(tr('Vale para la próxima incursión.')) + '</p>' : (paseVip() ? '<button type="button" class="btn" data-a="seguro"' + (SAVE.chapas < prS ? ' disabled' : '') + '>' + esc(trf('CONTRATAR (%1 chapas)', miles(prS))) + '</button>' : botonVip('CONTRATAR', 'seguro', 'btn'))) + '</section>';
  h += '<section class="tarjeta"><h3>' + esc(tr('EL DISTRITO MICROBLIZZ')) + '</h3><p>' + esc(tr('Entras por un sitio al azar. Tienes 9 minutos antes de que llegue la ventisca. Salidas: el metro (siempre), el puente del este (algunos días) y la alcantarilla (con palanca). Si caes, pierdes lo que llevas; la riñonera se salva.')) + '</p>' +
    '<p class="datos">' + esc(tr('DIFICULTAD')) + ': <b>' + esc(tr(dif().n)) + '</b> ' + boton('CAMBIAR', 'dif', 0) + '</p><button type="button" class="btn-grande" data-a="entra">' + esc(tr('ENTRAR AL DISTRITO')) + '</button></section>';
  const c = SAVE.cuentas;
  h += '<section class="tarjeta"><h3>' + esc(tr('TU HISTORIAL')) + '</h3><div class="fin-datos"><div><b>' + c.incursiones + '</b><span>' + esc(tr('INCURSIONES')) + '</span></div><div><b>' + c.salidas + '</b><span>' + esc(tr('SALIDAS')) + '</span></div><div><b>' + c.bajas + '</b><span>' + esc(tr('BAJAS')) + '</span></div><div><b>' + miles(c.mejor) + '</b><span>' + esc(tr('MEJOR BOTÍN')) + '</span></div></div></section>';
  raiz.innerHTML = h;
  conClick(raiz, a => {
    if (a === 'alijo') cambiaPestana('alijo');
    if (a === 'kit') { SAVE.equipo.arma1 = Object.assign(nuevoObj('pistola'), { bal: 8 }); meter(SAVE.mochila, nuevoObj('m9', 24), casillasMochila()); meter(SAVE.bolsillos, nuevoObj('venda', 1), 3); if (!SAVE.equipo.mochila) SAVE.equipo.mochila = nuevoObj('mochila-p'); guardaPartida(); play('compra'); toast(tr('Microblizz te desea un feliz regreso al trabajo.'), true); repinta(); }
    if (a === 'entra') entraAlDistrito();
    if (a === 'seguro' && !paseVip()) { avisoVip(); return; }
    if (a === 'seguro' && !SAVE.seguro && SAVE.chapas >= prS) { SAVE.chapas -= prS; SAVE.seguro = true; guardaPartida(); play('compra'); toast(tr('Phony: «Firmado. Tu equipo está en buenas manos. Las mías.»'), true); repinta(); }
    if (a === 'tuto') { play('go'); empiezaTutorial(); }
    if (a === 'dif') { AJUSTES.dificultad = AJUSTES.dificultad === 'normal' ? 'becario' : 'normal'; guardaAjustes(); play('select'); repinta(); }
  });
}
const PUESTO = ['arma1', 'arma2', 'chaleco', 'casco', 'mochila'];
const precioSeguro = () => Math.max(60, Math.round(PUESTO.reduce((t, k) => t + valorDe(SAVE.equipo[k]), 0) * 0.2));
function avisoMunicion(o) {
  const st = statsArma(o); if (!st || st.anom === 'crack') return '';
  const n = cuantos(SAVE.mochila, st.cal) + cuantos(SAVE.bolsillos, st.cal);
  return n < st.carg ? '<span class="malo">' + esc(trf('Te quedan pocas %1 en la mochila (%2).', nombreDe(st.cal).toLowerCase(), n)) + '</span>' : '';
}
function entraAlDistrito() {
  const eq = SAVE.equipo;
  const go = () => { play('go'); el('refugio').hidden = true; empiezaIncursion(); };
  if (!eq.arma1 && !eq.arma2) { confirmBox(tr('¿SIN ARMA?'), esc(tr('Vas a entrar sin arma. Puedes registrar y huir, pero no defenderte.')), tr('ENTRAR IGUAL'), go); return; }
  go();
}

/* ---------- ALIJO ---------- */
let FILTRO_ALIJO = 'todo';
const FILTROS = { todo: () => true, armas: o => ['arma', 'mod', 'anom'].includes(OBJ[o.id].t), equipo: o => ['chaleco', 'casco', 'mochila', 'llave'].includes(OBJ[o.id].t), uso: o => ['med', 'granada', 'muni'].includes(OBJ[o.id].t), material: o => OBJ[o.id].t === 'material', botin: o => OBJ[o.id].t === 'botin' };
const NOMBRE_FILTRO = { todo: 'TODO', armas: 'ARMAS', equipo: 'EQUIPO', uso: 'USAR', material: 'MATERIAL', botin: 'BOTÍN' };
function pintaAlijo(raiz) {
  const eq = SAVE.equipo, cas = casillasMochila();
  let h = '<section class="tarjeta"><h3>' + esc(tr('LO QUE LLEVAS')) + ' <small>' + esc(trf('%1 kg', pesoEncima(eq, SAVE.mochila, SAVE.bolsillos, SAVE.rinonera).toFixed(1))) + '</small></h3><div class="lista">';
  for (const [k, n] of [['arma1', 'ARMA 1'], ['arma2', 'ARMA 2'], ['chaleco', 'CHALECO'], ['casco', 'CASCO'], ['mochila', 'MOCHILA']]) {
    const o = eq[k]; h += o ? filaObj(o, boton('AL ALIJO', 'qeq', k), '<em>' + esc(tr(n)) + '</em>') : '<div class="fila-obj hueco"><i class="ic"></i><div class="fo-t"><b>' + esc(tr(n)) + '</b><span>' + esc(tr('vacío')) + '</span></div></div>';
  }
  // la mochila Tetris: aquí, en el refugio, sí hay ORDENAR
  h += '</div><h4>' + esc(trf('MOCHILA (%1 de %2)', casillasUsadas(SAVE.mochila), totalCasillas(cas))) + ' ' + boton('ORDENAR', 'ordena', 0, 'oro') + boton('VACIAR', 'vacia', 0) + '</h4>';
  h += '<div class="rejillas"><div class="bloque-rej"><div data-sitio="moch"></div></div><div class="fila-rej"><div><h5>' + esc(tr('BOLSILLOS')) + '</h5><div class="bols"><div data-sitio="b0"></div><div data-sitio="b1"></div><div data-sitio="b2"></div></div></div>';
  h += '<div><h5>' + esc(tr('RIÑONERA')) + ' <small>' + esc(tr('no se pierde nunca')) + '</small></h5><div data-sitio="rin"></div></div></div></div><div class="rej-info fila-obj"></div></section>';
  // el alijo
  const lista = SAVE.alijo.map((o, i) => [o, i]).filter(([o]) => o && FILTROS[FILTRO_ALIJO](o));
  h += '<section class="tarjeta"><h3>' + esc(tr('ALIJO')) + ' <small>' + esc(trf('%1 de %2 casillas', casillasUsadas(SAVE.alijo), ALIJO_MAX)) + '</small></h3><div class="filtros">' + Object.keys(FILTROS).map(f => '<button type="button" class="mini' + (f === FILTRO_ALIJO ? ' activa' : '') + '" data-a="filtro" data-i="' + f + '">' + esc(tr(NOMBRE_FILTRO[f])) + '</button>').join('') + '</div><div class="lista">';
  if (!lista.length) h += '<p class="vacio">' + esc(tr('Aquí no hay nada.')) + '</p>';
  for (const [o, i] of lista) {
    const D = OBJ[o.id]; let b = '';
    if (D.t === 'arma') b += boton('ARMA 1', 'e1', i, 'bien') + boton('ARMA 2', 'e2', i, 'bien');
    if (['chaleco', 'casco', 'mochila'].includes(D.t)) b += boton('PONER', 'pon', i, 'bien');
    if (['med', 'granada', 'muni'].includes(D.t)) b += boton('BOLSILLO', 'abo', i);
    b += boton('MOCHILA', 'amo', i);
    if (!ARMAS[o.id] && (o.n === 1 || apilable(o))) b += boton('RIÑONERA', 'ari', i);
    h += filaObj(o, b);
  }
  h += '</div></section>';
  raiz.innerHTML = h;
  conClick(raiz, (a, i) => accionAlijo(a, i));
  // las cuadrículas de lo que llevas
  const q = id => raiz.querySelector('[data-sitio="' + id + '"]');
  const sitios = [{ id: 'moch', raiz: q('moch'), lista: SAVE.mochila, dim: cas }, ...[0, 1, 2].map(i => ({ id: 'b' + i, raiz: q('b' + i), lista: SAVE.bolsillos, i })), { id: 'rin', raiz: q('rin'), lista: SAVE.rinonera, dim: DIM_RINONERA, acepta: o => !ARMAS[o.id] }];
  const info = raiz.querySelector('.rej-info'), C = casillaPara(Math.min(raiz.clientWidth - 48, 460), Math.max(cas.w, 5));
  const pintaInfoR = (o, s) => { info.innerHTML = htmlInfo(o, o ? boton('AL ALIJO', 'alalijo', 0) + (s && s.dim ? boton('GIRAR', 'girar', 0) : '') : ''); info.querySelectorAll('[data-a]').forEach(b => (b.onclick = () => { if (b.dataset.a === 'girar') return giraEnSitio(o); if (meterAlijo(o)) return toast(tr('El alijo está lleno.')); quitaDe(s, o); REJ.sel = null; guardaPartida(); repinta(); })); };
  montaRejillas(sitios, { C, alCambiar: () => { guardaPartida(); repinta(); }, alElegir: pintaInfoR });
  pintaInfoR(REJ.sel, REJ.sel && sitioDePieza(REJ.sel));
}
function accionAlijo(a, i) {
  const eq = SAVE.equipo, cas = casillasMochila(), al = SAVE.alijo;
  const alAlijo = o => { if (meterAlijo(o)) { toast(tr('El alijo está lleno.')); return false; } return true; };
  if (a === 'filtro') { FILTRO_ALIJO = i; return repinta(); }
  if (a === 'qeq') { const o = eq[i]; if (o && alAlijo(o)) { eq[i] = null; if (i === 'mochila') sobraMochila(); } }
  if (a === 'vacia') { for (const o of SAVE.mochila.slice()) if (o && alAlijo(o)) SAVE.mochila.splice(SAVE.mochila.indexOf(o), 1); }
  if (a === 'ordena') { if (ordenaRejilla(SAVE.mochila, cas)) toast(tr('Mochila ordenada.'), true); else toast(tr('ORDENAR lo dejaba peor, como el último parche. Te lo dejo como estaba.')); }
  const o = al[+i];
  if (o && (a === 'e1' || a === 'e2' || a === 'pon')) {
    const k = a === 'e1' ? 'arma1' : a === 'e2' ? 'arma2' : OBJ[o.id].t;
    const viejo = eq[k]; eq[k] = o; al[+i] = viejo || null; if (k === 'mochila') sobraMochila(); play('recarga');
  }
  if (o && a === 'amo') { const r = meter(SAVE.mochila, o, cas); if (r === o.n) toast(tr('No cabe en la mochila.')); else if (r) o.n = r; else al[+i] = null; }
  if (o && a === 'abo') { const r = meter(SAVE.bolsillos, o, 3); if (r === o.n) toast(tr(celdasDe(o.id) > 1 ? 'En los bolsillos solo cabe lo de una casilla.' : 'Los bolsillos están llenos.')); else if (r) o.n = r; else al[+i] = null; }
  if (o && a === 'ari') { const r = meter(SAVE.rinonera, o, DIM_RINONERA); if (r === o.n) toast(tr('La riñonera está llena.')); else if (r) o.n = r; else al[+i] = null; }
  compacta(al); compacta(SAVE.mochila); guardaPartida(); play('select'); repinta();
}
// si la mochila nueva es más pequeña, lo que sobra vuelve al alijo
function sobraMochila() {
  for (const o of colocaTodo(SAVE.mochila, casillasMochila())) if (meterAlijo(o)) toast(tr('El alijo está lleno: algo se ha quedado fuera.'));
}
