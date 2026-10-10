// Fans of Rouflage (prototipo) · LA INTERFAZ: todo lo que va por encima del lienzo. Los iconos (dibujados, sin emojis), el marcador y
// los botones de la partida, los avisos, el panel del taller y las pantallas de título, ayuda, pausa y final (con su mapa de
// dónde estaba cada uno).
'use strict';

const $ = id => document.getElementById(id);
const ICONOS = {
  pincel: '<path d="M20 4l-7.6 7.6"/><path d="M12.7 11.3l2 2c-1 3.4-3.7 6.1-9.7 6.6 1.6-1.9 1.4-3 1.8-4.6.5-2 2.5-3.6 5.9-4z" fill="currentColor"/>',
  gota: '<path d="M13.4 6.6l4 4"/><path d="M15 8.2 6.2 17l-1.6 3.4L8 18.8l8.8-8.8"/><path d="M16.2 4.2a2.5 2.5 0 0 1 3.6 3.6l-2 2-3.6-3.6z" fill="currentColor"/>',
  cubo: '<path d="M5 11.6 12 4.6l7 7-6.4 6.4a1.5 1.5 0 0 1-2.1 0L5 12.6z"/><path d="M8.6 8 5.2 4.6"/><path d="M19.6 15.4c1 1.4 1.6 2.3 1.6 3.1a1.6 1.6 0 0 1-3.2 0c0-.8.6-1.7 1.6-3.1z" fill="currentColor"/>',
  deshacer: '<path d="M8 5 3.5 9.5 8 14"/><path d="M3.5 9.5H14a5.5 5.5 0 0 1 0 11h-3"/>',
  ojo: '<path d="M2 12c2.6-4.4 6-6.5 10-6.5s7.4 2.1 10 6.5c-2.6 4.4-6 6.5-10 6.5S4.6 16.4 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  hielo: '<path d="M12 2v20M3.4 7l17.2 10M3.4 17 20.6 7"/><path d="M9.5 3.6 12 6l2.5-2.4M9.5 20.4 12 18l2.5 2.4"/>',
  andar: '<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  silbato: '<path d="M3 9.5h11.5M3 9.5V13h6.2"/><circle cx="14.5" cy="14" r="5.6"/><circle cx="14.5" cy="14" r="1.5" fill="currentColor"/><path d="M14.5 2.4v2.4M19 3.8l-1.3 2.1M10 3.8l1.3 2.1"/>',
  pausa: '<path d="M8.2 5v14M15.8 5v14" stroke-width="3.6"/>',
  sonido: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9.5c1.3 1.4 1.3 3.6 0 5M18 7c2.6 2.8 2.6 7.2 0 10"/>',
  musica: '<path d="M9 18V6l10-2v12"/><circle cx="6.8" cy="18" r="2.4" fill="currentColor"/><circle cx="16.8" cy="16" r="2.4" fill="currentColor"/>',
  diana: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M12 1.4v3M12 19.6v3M1.4 12h3M19.6 12h3"/>',
};
const ESTRELLA = '<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
function ponIcono(el, nombre) { el.dataset.icono = nombre; el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>'; }
function ponIconos() { for (const el of document.querySelectorAll('i[data-icono]')) ponIcono(el, el.dataset.icono); }

/* ---------- avisos, cartel y pista ---------- */
function avisa(texto, tipo = 'aviso') {
  const caja = $('avisos'), p = document.createElement('p'); p.className = tipo; p.textContent = texto; caja.appendChild(p);
  while (caja.children.length > 4) caja.firstChild.remove();
  setTimeout(() => p.classList.add('adios'), 4200); setTimeout(() => p.remove(), 4800);
}
function limpiaAvisos() { $('avisos').textContent = ''; $('cartel').hidden = true; PISTA.hasta = 0; }
// el cartel grande del centro; con `numero`, la cifra de la cuenta atrás
function cartel(titulo, sub = '', numero = false) {
  const c = $('cartel'); $('cartel-t').textContent = titulo; $('cartel-s').textContent = sub;
  c.hidden = false; c.classList.toggle('numero', numero && titulo.length < 3); c.classList.remove('sale'); void c.offsetWidth; c.classList.add('sale');
}
// una frase de ayuda sobre los botones: la que toca en cada momento o, durante unos segundos, una concreta
const PISTA = { texto: '', hasta: 0, vista: '' };
function pista(texto, segundos = 2.5) { PISTA.texto = texto; PISTA.hasta = J.t + segundos; }
function pistaDeAhora() {
  if (J.t < PISTA.hasta) return PISTA.texto;
  const yo = J.yo; if (!yo || yo.fuera || TALLER.abierto) return '';
  if (yo.clase === 'camaleon') {
    if (J.fase === 'prep') return !yo.pintado ? tr('Ve a donde quieras esconderte y toca PINTAR') : !yo.congelado ? tr('Toca CONGELAR para quedarte quieto y desaparecer') : tr('Congelado. Toca ¡LISTO! o retócate con PINTAR');
    if (J.fase === 'caza') {
      const mira = J.cazadores.find(h => h.bot && !h.fuera && h.bot.objetivo === yo && (h.bot.estado === 'sospecha' || h.bot.estado === 'apunta'));
      if (mira && mira.bot.estado === 'apunta') return tr('¡Te ha visto! Arrastra para salir corriendo');
      if (!yo.congelado) return tr('¡Se te ve! Corre a otro sitio y toca CONGELAR');
      if (mira) return tr('Un becario sospecha de ti: quieto… o corre');
      return J.tFase < 7 ? tr('Quieto. Si un becario pone «!», sal corriendo') : '';
    }
  } else if (J.fase === 'caza' && J.tFase < 9) return ENTRADA.tactil ? tr('Arrastra para andar. Toca donde creas que hay un colado') : tr('WASD para andar. Haz clic donde creas que hay un colado');
  return '';
}

/* ---------- el marcador y los botones ---------- */
const HUD = {};
function ponTexto(clave, el, txt) { if (HUD[clave] !== txt) { HUD[clave] = txt; el.textContent = txt; } }
function colorCamo(n) { return n < 50 ? '#ff4b5c' : n < 70 ? '#ffcb3d' : '#7ee04a'; }
// lo que le espera a un camaleón con ese camuflaje, en una frase
function veredicto(n) { return n < 50 ? tr('Se te ve mucho: mejor píntate un poco más') : n < 65 ? tr('Regular: de lejos cuelas, de cerca no') : n < 80 ? tr('Bien pintado. De cerca aún te la juegas') : tr('¡Casi no se te ve!'); }
function refrescaHud(todo) {
  const yo = J.yo, enPartida = J.fase !== 'titulo' && !!yo && !J.finMostrado;
  if (todo) for (const k in HUD) delete HUD[k];
  if (HUD.visible !== enPartida) { HUD.visible = enPartida; $('hud').hidden = !enPartida; }
  if (!enPartida) { $('peligro').style.opacity = 0; return; }
  const cam = yo.clase === 'camaleon', caza = J.fase === 'caza';
  if (HUD.rol !== J.modo) { HUD.rol = J.modo; const c = $('chip-rol'); c.dataset.rol = J.modo; c.querySelector('b').textContent = cam ? tr('CAMALEÓN') : tr('CAZADOR'); ponIcono(c.querySelector('i'), cam ? 'pincel' : 'diana'); }
  ponTexto('fase', $('fase-txt'), J.fase === 'prep' ? tr('Píntate') : J.fase === 'cuenta' ? tr('Preparados') : caza ? (cam ? tr('Aguanta') : tr('Encuéntralos')) : '');
  ponTexto('reloj', $('reloj'), J.fase === 'cuenta' || J.fase === 'fin' ? '' : mmss(J.reloj));
  const prisa = (J.fase === 'prep' || caza) && J.reloj <= 10; if (HUD.prisa !== prisa) { HUD.prisa = prisa; $('reloj').classList.toggle('prisa', prisa); }
  // lo de cada papel
  const ver = { 'e-camo': cam, 'e-silbo': cam && caza, 'e-balas': !cam, 'e-quedan': !cam, 'acciones': cam && (J.fase === 'prep' || caza) && !TALLER.abierto && !yo.fuera,
    'b-silbar': caza, 'b-listo': J.fase === 'prep' && yo.congelado, 'estado': !TALLER.abierto, 'avisos': !TALLER.abierto };
  for (const id in ver) if (HUD['v-' + id] !== ver[id]) { HUD['v-' + id] = ver[id]; $(id).hidden = !ver[id]; }
  if (cam) {
    const medido = yo.congelado || TALLER.abierto, n = medido ? yo.camo : -1;
    if (HUD.camo !== n) { HUD.camo = n; $('e-camo-n').textContent = n < 0 ? '—' : n + ' %'; $('e-camo-b').style.width = Math.max(0, n) + '%'; $('e-camo-b').style.background = colorCamo(n); }
    if (HUD.hielo !== yo.congelado) { HUD.hielo = yo.congelado; $('b-congelar-t').textContent = yo.congelado ? tr('MOVERSE') : tr('CONGELAR'); $('b-congelar').classList.toggle('puesto', yo.congelado); ponIcono($('b-congelar').querySelector('i'), yo.congelado ? 'andar' : 'hielo'); }
    if (caza) { ponTexto('silbo', $('e-silbo-n'), String(Math.max(0, Math.ceil(J.silbido)))); const pronto = J.silbido <= 5; if (HUD.pronto !== pronto) { HUD.pronto = pronto; $('e-silbo').classList.toggle('pronto', pronto); } }
    $('peligro').style.opacity = caza ? (J.peligro * J.peligro * (0.75 + 0.25 * Math.sin(J.t * 9))).toFixed(3) : 0;
  } else {
    if (HUD.balas !== yo.balas) { HUD.balas = yo.balas; $('e-balas-n').innerHTML = Array.from({ length: AJUSTES.balas }, (_, i) => `<i${i < yo.balas ? '' : ' class="gastada"'}></i>`).join(''); }
    ponTexto('quedan', $('e-quedan-n'), String(escondidos().length));
    $('peligro').style.opacity = yo.ciego > 0 ? 0.16 : 0;
  }
  const p = caza || J.fase === 'prep' ? pistaDeAhora() : '';
  if (HUD.pista !== p) { HUD.pista = p; $('pista').hidden = !p; $('pista').textContent = p; }
}

/* ---------- el panel del taller ---------- */
function muestraTaller(si) { $('taller').hidden = !si; if (si) refrescaTaller(); refrescaHud(true); }
function pintaMedidor(n) { $('t-camo').textContent = n + ' %'; const b = $('t-barra'); b.style.width = n + '%'; b.style.background = colorCamo(n); }
function refrescaTaller() {
  $('t-gota').classList.toggle('puesto', TALLER.herr === 'gota');
  for (const b of document.querySelectorAll('.t-radio')) b.classList.toggle('puesto', TALLER.herr === 'pincel' && RADIOS[+b.dataset.radio] === TALLER.radio);
  $('t-calco').classList.toggle('puesto', TALLER.calco);
  $('t-color').style.background = TALLER.color;
  const caja = $('t-recientes'); caja.textContent = '';
  for (const col of TALLER.recientes) {
    const b = document.createElement('button'); b.type = 'button'; b.style.background = col; b.setAttribute('aria-label', tr('Color') + ' ' + col);
    if (col === TALLER.color) b.className = 'puesto';
    b.onclick = () => { ponColor(col); TALLER.herr = 'pincel'; play('select'); refrescaTaller(); };
    caja.appendChild(b);
  }
}

/* ---------- pantallas ---------- */
const PANTALLAS = ['p-titulo', 'p-ayuda', 'p-pausa', 'p-fin'];
function pantalla(id) { for (const p of PANTALLAS) $(p).hidden = p !== id; }
let _trasAyuda = null;
function irTitulo() { escenaTitulo(); pantalla('p-titulo'); refrescaHud(true); refrescaSonido(); }
function muestraAyuda(luego) { _trasAyuda = luego || null; pantalla('p-ayuda'); }
function muestraPausa(si) { pantalla(si ? 'p-pausa' : null); refrescaSonido(); }
// al elegir papel: la primera vez se enseña antes cómo se juega
function elige(modo) {
  audioInit(); play('select');
  let visto = false; try { visto = localStorage.getItem('rouflage-ayuda') === '1'; } catch (_) { /* sin guardar */ }
  if (!visto) { try { localStorage.setItem('rouflage-ayuda', '1'); } catch (_) { /* sin guardar */ } muestraAyuda(() => { pantalla(null); empiezaPartida(modo); }); return; }
  pantalla(null); empiezaPartida(modo);
}
function refrescaSonido() {
  for (const id of ['b-sonido', 'b-sonido2']) $(id).classList.toggle('apagado', AUDIO.mudo);
  for (const id of ['b-musica', 'b-musica2']) $(id).classList.toggle('apagado', AUDIO.sinMusica);
}
// el botón de idioma del título: cambia al momento, sin recargar la página (así va igual en la web, en un archivo suelto o dentro
// de un marco). Se vuelven a traducir la página y el mapa, que lleva sus carteles pintados de una sola vez.
function cambiaIdioma() {
  IDIOMA_RF = IDIOMA_RF === 'es' ? 'en' : 'es';
  try { localStorage.setItem('fansof-idioma', IDIOMA_RF); } catch (_) { /* sin guardar */ }
  // si la dirección traía ?idioma=, se le quita: al recargar volvería a mandar ella y no lo elegido
  try { const u = new URL(location.href); if (u.searchParams.has('idioma')) { u.searchParams.delete('idioma'); history.replaceState(null, '', u); } } catch (_) { /* da igual */ }
  document.documentElement.lang = IDIOMA_RF;
  traducePagina(); construyeMapa(); refrescaHud(true);
  $('b-idioma').textContent = IDIOMA_RF === 'es' ? 'English' : 'Español';
}

// el final: título, estrellas, el mapa con dónde estaba cada uno y las cifras
function muestraFin() {
  const r = J.resultado; if (!r) return;
  $('fin-titulo').textContent = r.titulo; $('fin-titulo').classList.toggle('mal', !r.victoria); $('fin-sub').textContent = r.sub;
  $('fin-estrellas').innerHTML = [0, 1, 2].map(i => ESTRELLA.replace('<svg', i < r.estrellas ? '<svg class="si"' : '<svg')).join('');
  $('fin-filas').innerHTML = r.filas.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('') + `<div class="total"><span>${tr('PUNTOS')}</span><b>${r.puntos}</b></div>`;
  $('b-cambia').textContent = J.modo === 'camaleon' ? tr('Ahora de cazador') : tr('Ahora de camaleón');
  pintaMapaFinal();
  pantalla('p-fin');
}
function pintaMapaFinal() {
  const m = $('fin-mapa'), c = m.getContext('2d'), k = m.width / ANCHO;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, m.width, m.height);
  c.drawImage(MAPA.fondo, 0, 0, m.width, m.height);
  c.setTransform(k, 0, 0, k, 0, 0);
  for (const f of MAPA.porY) c.drawImage(f.dibujo.cv, f.dib.x0, f.dib.y0, f.dib.w, f.dib.h);
  c.fillStyle = 'rgba(16,8,30,0.42)'; c.fillRect(0, 0, ANCHO, ALTO);
  const marca = (e, color, texto) => {
    const x = e.x, y = e.y - 22;
    c.beginPath(); c.arc(x, y, 24, 0, TAU); c.fillStyle = OL; c.fill(); c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fillStyle = color; c.fill();
    if (e.fuera) { c.strokeStyle = OL; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 9, y - 9); c.lineTo(x + 9, y + 9); c.moveTo(x + 9, y - 9); c.lineTo(x - 9, y + 9); c.stroke(); }
    if (texto) { c.font = '800 34px ' + LETRA_UI; const w = c.measureText(texto).width / 2 + 8; rotulo(c, texto, limita(x, w, ANCHO - w), y < 90 ? y + 50 : y - 46, 34, '#fff6ea', OL, LETRA_UI); }
  };
  for (const h of J.cazadores) marca(h, '#2e8bff', h.jugador ? tr('TÚ') : '');
  for (const e of J.camaleones) marca(e, e.jugador ? '#ffcb3d' : e.fuera ? '#ff4b5c' : '#7ee04a', e.jugador ? tr('TÚ') : e.nombre);
  $('fin-leyenda').innerHTML = `<span><i class="libre"></i>${tr('No le han pillado')}</span><span><i class="fuera"></i>${tr('Despedido')}</span><span><i class="becario"></i>${tr('Becario')}</span>`;
}

// los dibujos de las dos tarjetas del título, hechos con las piezas del propio juego
function pintaTarjetas() {
  const falsa = (tipo, x, y, clase = 'camaleon') => { const [piel, pctx] = nuevaPiel(clase === 'cazador' ? '#aab4c4' : BLANCO_PIEL); return { clase, tipo, x, y, mira: 1, dir: 0, hielo: 0, piel, pctx, pasos: [], semilla: 3, anda: 0, alerta: 0, ciego: 0, balas: 5 }; };
  const trozo = (c, x0, y0, z) => { c.setTransform(z, 0, 0, z, -x0 * z, -y0 * z); c.drawImage(MAPA.fondo, 0, 0, ANCHO, ALTO); };
  // camaleón: una alubia sin pintar y otra ya pintada y congelada sobre el damero
  let c = $('dib-camaleon').getContext('2d');
  trozo(c, 926, 262, 2.5);
  const a = falsa('bunny', 962, 340), b = falsa('fox', 1020, 334);
  pintaBot(b, 0.93); b.hielo = 1;
  pintaAlubia(c, a, 1); pintaAlubia(c, b, 1);
  c.save(); c.translate(b.x, b.y); c.beginPath(); trazaAlubia(c); c.setLineDash([3, 3]); c.lineWidth = 1.4; c.strokeStyle = '#fff6ea'; c.stroke(); c.restore();
  forma(c, poli(1012, 272, 1028, 272, 1020, 282), '#ffcb3d', 2.4);
  // cazador: a oscuras, el becario alumbra a uno mal pintado sobre la moqueta
  c = $('dib-cazador').getContext('2d');
  trozo(c, 80, 432, 2.5);
  const h = falsa('becario', 112, 510, 'cazador'), p = falsa('squirrel', 180, 498);
  pintaBot(p, 0.4); p.hielo = 1; pintaAlubia(c, p, 1); pintaAlubia(c, h, 1);
  c.fillStyle = 'rgba(10,6,28,0.66)'; c.beginPath(); c.rect(70, 424, 150, 110); c.moveTo(126, 496); c.lineTo(230, 438); c.lineTo(230, 548); c.closePath(); c.fill('evenodd');
  c.fillStyle = 'rgba(255,236,170,0.1)'; c.beginPath(); c.moveTo(126, 496); c.lineTo(230, 438); c.lineTo(230, 548); c.closePath(); c.fill();
  pintaAlubia(c, h, 1);
  pintaSigno(c, 112, 436, '?', '#e8731a', 0);
}

function preparaInterfaz() {
  pintaTarjetas();
  $('b-camaleon').onclick = () => elige('camaleon'); $('b-cazador').onclick = () => elige('cazador');
  $('b-ayuda').onclick = () => { play('select'); muestraAyuda(() => pantalla('p-titulo')); };
  $('b-ayuda2').onclick = () => { play('select'); muestraAyuda(() => pantalla('p-pausa')); };
  $('b-ayuda-ok').onclick = () => { play('select'); const f = _trasAyuda; _trasAyuda = null; if (f) f(); else pantalla('p-titulo'); };
  for (const id of ['b-sonido', 'b-sonido2']) $(id).onclick = () => { cambiaSonido(); refrescaSonido(); };
  for (const id of ['b-musica', 'b-musica2']) $(id).onclick = () => { cambiaMusica(); refrescaSonido(); };
  $('b-idioma').textContent = IDIOMA_RF === 'es' ? 'English' : 'Español';
  $('b-idioma').onclick = () => { cambiaIdioma(); play('select'); };
  $('b-pausa').onclick = accionPausa; $('b-seguir').onclick = accionPausa;
  $('b-reiniciar').onclick = () => { pantalla(null); empiezaPartida(J.modo); };
  $('b-salir').onclick = () => { play('select'); irTitulo(); };
  $('b-otra').onclick = () => { play('select'); pantalla(null); empiezaPartida(J.modo); };
  $('b-cambia').onclick = () => { play('select'); pantalla(null); empiezaPartida(J.modo === 'camaleon' ? 'cazador' : 'camaleon'); };
  $('b-menu').onclick = () => { play('select'); irTitulo(); };
  $('b-pintar').onclick = accionPintar; $('b-congelar').onclick = accionCongelar; $('b-silbar').onclick = accionSilbar; $('b-listo').onclick = accionListo;
  $('t-gota').onclick = () => tallerHerramienta('gota');
  for (const b of document.querySelectorAll('.t-radio')) b.onclick = () => tallerRadio(+b.dataset.radio);
  $('t-cubo').onclick = tallerRellena; $('t-deshacer').onclick = tallerDeshace; $('t-calco').onclick = tallerCalco;
  $('t-listo').onclick = () => { cierraTaller(); play('select'); };
}
