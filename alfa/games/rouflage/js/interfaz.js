// Fans of Rouflage (prototipo) · LA INTERFAZ: todo lo que va por encima del lienzo. El marcador y
// los botones de la partida, los avisos y las pantallas de título, ayuda y pausa. La pantalla del final (con su
// mapa de dónde estaba cada uno) está en interfaz-fin.js y el panel del
// taller (pintarse), en interfaz-taller.js.
'use strict';

const E = id => document.getElementById(id);
// (los iconos, ICONOS, están en js/iconos.js, que va justo antes)
const ESTRELLA = '<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
function ponIcono(el, nombre) { el.dataset.icono = nombre; el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>'; }
function ponIconos() { for (const el of document.querySelectorAll('i[data-icono]')) ponIcono(el, el.dataset.icono); }

/* ---------- avisos, cartel y pista ---------- */
function avisa(texto, tipo = 'aviso') {
  const caja = E('avisos'), p = document.createElement('p'); p.className = tipo; p.textContent = texto; caja.appendChild(p);
  // en el móvil en vertical: como mucho dos a la vez, duran menos y salen justo debajo del marcador (y de la tira de retratos), nunca encima
  const movil = matchMedia('(orientation: portrait) and (max-width: 600px)').matches;
  while (caja.children.length > (movil ? 2 : 4)) caja.firstChild.remove();
  colocaAvisos();
  const dura = Math.max(movil ? 2800 : 4200, tiempoLectura(texto) * 1000);      // los largos, lo que se tarda en leerlos
  setTimeout(() => p.classList.add('adios'), dura); setTimeout(() => p.remove(), dura + 500);
}
// dónde acaba por abajo lo de arriba del marcador (reloj, CARTAS / COLADOS y la tira de retratos)
function finMarcador() {
  let abajo = 0;
  for (const id of ['arriba', 'estado', 'retratos']) { const el = E(id); if (el && !el.hidden && el.getClientRects().length) abajo = Math.max(abajo, el.getBoundingClientRect().bottom); }
  return abajo;
}
function colocaAvisos() { const abajo = finMarcador(); E('avisos').style.top = abajo ? Math.round(abajo + 8) + 'px' : ''; }
// para la cámara: cuánto tapa el marcador por arriba, para que el borde de arriba del mapa pueda bajar por debajo de él y no quede nadie escondido detrás
const MARGEN = { t: -1e9, px: 70 };
function margenArriba() {
  const ahora = performance.now();
  if (ahora - MARGEN.t > 400) { MARGEN.t = ahora; MARGEN.px = E('hud').hidden ? 70 : Math.max(70, finMarcador() + 8); }
  return MARGEN.px;
}
function limpiaAvisos() { E('avisos').textContent = ''; E('cartel').hidden = true; PISTA.hasta = 0; }
// el cartel grande del centro; con `numero`, la cifra de la cuenta atrás
function cartel(titulo, sub = '', numero = false) {
  const c = E('cartel'); E('cartel-t').textContent = titulo; E('cartel-s').textContent = sub;
  c.hidden = false; c.classList.toggle('numero', numero && titulo.length < 3); c.classList.remove('sale'); void c.offsetWidth; c.classList.add('sale');
}
// una frase de ayuda sobre los botones: la que toca en cada momento o, durante unos segundos, una concreta
const PISTA = { texto: '', hasta: 0, vista: '' };
const tiempoLectura = texto => 1.2 + String(texto).length / 14;      // segundos para leer un texto con calma (unas 14 letras por segundo)
function pista(texto, segundos = 2.5) { PISTA.texto = texto; PISTA.hasta = J.t + Math.max(segundos, tiempoLectura(texto)); }
function pistaDeAhora() {
  if (bocadilloActivo()) return '';      // con un bocadillo del tutorial en pantalla, la franja de pistas se calla
  if (J.t < PISTA.hasta) return PISTA.texto;
  const yo = J.yo; if (!yo || TALLER.abierto) return '';
  if (espectando()) {      // la explicación del fantasma sale los primeros segundos y luego se va (antes se quedaba para siempre tapando su botón)
    if (yo.tPistaFant === undefined) yo.tPistaFant = J.t;
    if (J.t - yo.tPistaFant > 15) return '';
    const p = poderDe(); return p ? tr(p.pista) : tr('Espectador: pasea por el mapa (WASD o arrastra el dedo). Para irte, ME RETIRO.'); }      // la pista del poder que llevas (cambia al usarlo)
  if (yo.fuera) return '';
  if (yo.invis > 0) return tr('Invisible: los becarios no te ven ({n} s)', { n: Math.ceil(yo.invis) });
  if (yo.clase === 'camaleon') {
    if (J.fase === 'prep') return !yo.pintado ? tr('Ve a donde quieras esconderte y toca PINTAR') : !yo.congelado ? tr('Toca CONGELAR para quedarte quieto y desaparecer') : tr('Congelado. Toca ¡LISTO! o retócate con PINTAR');
    if (J.fase === 'caza') {
      const mira = J.cazadores.find(h => h.bot && !h.fuera && h.bot.objetivo === yo && (h.bot.estado === 'sospecha' || h.bot.estado === 'apunta'));
      if (mira && mira.bot.estado === 'apunta') return yo.granada > 0 ? tr('¡Te ha visto! Corre o lanza la granada de humo') : tr('¡Te ha visto! Arrastra para salir corriendo');
      if (!yo.congelado) return tr('¡Se te ve! Corre a otro sitio y toca CONGELAR');
      if (mira) return tr('Un becario sospecha de ti: quieto… o corre');
      return J.tFase < 7 ? tr('Quieto. Si un becario pone «!», sal corriendo') : '';
    }
  } else if (J.fase === 'prep') {
    // las prácticas: la explicación se queda hasta el primer acierto (así se aprende a disparar) y luego cuánto falta
    if (!PRACTICA.activa) return tr('Espera en Recursos Humanos: los colados se están pintando');
    if (!PRACTICA.aciertos) return ENTRADA.tactil || matchMedia('(pointer: coarse)').matches ? tr('Prácticas: arrastra para andar y TOCA a un camaleón escondido para dispararle. Fallar no gasta cartas') : tr('Prácticas: WASD para andar y HAZ CLIC en un camaleón escondido para dispararle. Fallar no gasta cartas');
    if (PRACTICA.extra >= REGLAS.balasExtra) return tr('¡Cartas al máximo! Sigue practicando hasta la caza');
    return tr('Cada {n} despidos, una carta extra ({c} de {m} ganadas)', { n: PRACTICA_POR_CARTA, c: PRACTICA.extra, m: REGLAS.balasExtra });
  }
  else if (J.fase === 'caza' && (J.tFase < 9 || !(SAVE.tuto && SAVE.tuto.disparo))) return ENTRADA.tactil ? tr('Arrastra para andar. Toca donde creas que hay un colado') : tr('WASD para andar. Haz clic donde creas que hay un colado');
  return '';
}

/* ---------- la clasificación en vivo (botón de la esquina): quién va primero, solo números sobre el mapa ---------- */
const RANKING = { abierto: (() => { try { return localStorage.getItem('rouflage-ranking') === '1'; } catch (_) { return false; } })(), t: 0, txt: '' };
function refrescaRanking() {
  const ver = RANKING.abierto && J.fase !== 'titulo' && J.fase !== 'paseo' && !TALLER.abierto && !extraOn('apagon'), el = E('ranking'), b = E('b-ranking');
  if (b.hidden !== extraOn('apagon')) b.hidden = extraOn('apagon');      // Apagón total: ni ranking ni botón
  if (b.classList.contains('puesto') !== RANKING.abierto) b.classList.toggle('puesto', RANKING.abierto);
  if (el.hidden === ver) { el.hidden = !ver; RANKING.txt = ''; }      // al volver a salir, se pinta de nuevo al momento
  if (!ver || (RELOJ - RANKING.t < 0.5 && RANKING.txt)) return;      // dos veces por segundo basta (con el reloj general: J.t vuelve a 0 en cada partida)
  RANKING.t = RELOJ;
  const html = clasificacion().map((r, i) => `<li class="${r.jugador ? 'yo' : ''}${r.fuera ? ' fuera' : ''}"><i>${i + 1}</i><span${marcoColor(r.marco) ? ` class="marco-ar" style="border-color:${marcoColor(r.marco)}"` : ''}>${esc(r.nombre)}</span><b>${r.puntos}</b></li>`).join('');
  if (html !== RANKING.txt) { RANKING.txt = html; el.innerHTML = html; }
}

/* ---------- el marcador y los botones ---------- */
const HUD = {};
function ponTexto(clave, el, txt) { if (HUD[clave] !== txt) { HUD[clave] = txt; el.textContent = txt; } }
function colorCamo(n) { return n < 50 ? '#ff4b5c' : n < 70 ? '#ffcb3d' : '#7ee04a'; }
// lo que le espera a un camaleón con ese camuflaje, en una frase
function veredicto(n) { return n < 50 ? tr('Se te ve mucho: mejor píntate un poco más') : n < 65 ? tr('Regular: de lejos cuelas, de cerca no') : n < 80 ? tr('Bien pintado. De cerca aún te la juegas') : tr('¡Casi no se te ve!'); }
function refrescaHud(todo) {
  const yo = J.yo, enPartida = J.fase !== 'titulo' && !!yo && !J.finMostrado && !(J.fase === 'sala' && E('p-busca').hidden && !(typeof VISITA !== 'undefined' && VISITA.activa));      // la sala viva, solo con su pantalla delante
  if (todo) for (const k in HUD) delete HUD[k];
  if (HUD.visible !== enPartida) { HUD.visible = enPartida; E('hud').hidden = !enPartida; }
  if (!enPartida) { E('peligro').style.opacity = 0; E('ranking').hidden = true; RANKING.txt = ''; return; }
  const cam = yo.clase === 'camaleon', caza = J.fase === 'caza', paseo = J.fase === 'paseo';
  if (HUD.rol !== J.modo) { HUD.rol = J.modo; const c = E('chip-rol'); c.dataset.rol = J.modo; c.querySelector('b').textContent = cam ? tr('CAMALEÓN') : tr('CAZADOR'); ponIcono(c.querySelector('i'), cam ? 'pincel' : 'diana'); }
  ponTexto('fase', E('fase-txt'), paseo ? tr('Habitación') : J.fase === 'prep' ? (cam ? tr('Píntate') : tr('Calentamiento')) : J.fase === 'cuenta' ? tr('Preparados') : caza ? (cam ? tr('Aguanta') : tr('Encuéntralos')) : '');
  // el silbato caliente va en su propia etiqueta, en la fila de abajo (encima del reloj pisaba el resto en el móvil)
  const caliente = caza ? silbatoTexto() : ''; if (HUD.calienteVer !== !!caliente) { HUD.calienteVer = !!caliente; E('e-caliente').hidden = !caliente; }
  if (caliente) ponTexto('caliente', E('e-caliente-n'), caliente);
  ponTexto('reloj', E('reloj'), J.fase === 'cuenta' || J.fase === 'fin' || paseo ? '' : mmss(J.reloj));
  const prisa = (J.fase === 'prep' || caza) && J.reloj <= 10; if (HUD.prisa !== prisa) { HUD.prisa = prisa; E('reloj').classList.toggle('prisa', prisa); }
  refrescaPoder(); refrescaChivato(); refrescaHab();      // los botones del fantasma (fantasma-poder.js, modos-fantasma.js)
  refrescaRanking();
  // lo de cada papel
  const ver = { 'e-camo': cam && !paseo, 'e-silbo': cam && caza, 'e-balas': !cam && !paseo && J.fase !== 'sala', 'e-quedan': !cam && !paseo && J.fase !== 'sala', 'acciones': cam && (J.fase === 'prep' || caza || J.fase === 'sala') && !TALLER.abierto && !yo.fuera,
    'b-silbar': caza && !espectando(), 'b-zoom': !cam && !paseo && !yo.fuera && !TALLER.abierto, 'b-retiro': espectando(), 'b-granada': cam && (caza || J.fase === 'sala') && yo.granada > 0 && !yo.fuera, 'b-listo': J.fase === 'prep' && yo.congelado && !yo.listo, 'estado': !TALLER.abierto, 'avisos': !TALLER.abierto };
  for (const id in ver) if (HUD['v-' + id] !== ver[id]) { HUD['v-' + id] = ver[id]; E(id).hidden = !ver[id]; }
  if (cam) {
    const medido = yo.congelado || TALLER.abierto, n = medido ? yo.camo : -1;
    if (HUD.camo !== n) { HUD.camo = n; E('e-camo-n').textContent = n < 0 ? '—' : n + ' %'; E('e-camo-b').style.width = Math.max(0, n) + '%'; E('e-camo-b').style.background = colorCamo(n); }
    if (HUD.hielo !== yo.congelado) { HUD.hielo = yo.congelado; E('b-congelar-t').textContent = yo.congelado ? tr('MOVERSE') : tr('CONGELAR'); E('b-congelar').classList.toggle('puesto', yo.congelado); ponIcono(E('b-congelar').querySelector('i'), yo.congelado ? 'andar' : 'hielo'); }
    if (caza) { ponTexto('silbo', E('e-silbo-n'), yo.silbido > 1e6 ? '—' : String(Math.max(0, Math.ceil(yo.silbido)))); const pronto = yo.silbido <= 5; if (HUD.pronto !== pronto) { HUD.pronto = pronto; E('e-silbo').classList.toggle('pronto', pronto); } }      // (— con SIN SILBIDO)
    E('peligro').style.opacity = caza ? (J.peligro * J.peligro * (0.75 + 0.25 * Math.sin(J.t * 9))).toFixed(3) : 0;
  } else {
    if (HUD.balas !== yo.balas) { HUD.balas = yo.balas; E('e-balas-n').innerHTML = Array.from({ length: REGLAS.balas }, (_, i) => `<i${i < yo.balas ? '' : ' class="gastada"'}></i>`).join(''); }
    ponTexto('quedan', E('e-quedan-n'), String(escondidos().length));
    E('peligro').style.opacity = yo.ciego > 0 ? 0.16 : 0;
  }
  const p = caza || J.fase === 'prep' ? pistaDeAhora() : '';
  if (HUD.pista !== p) { HUD.pista = p; E('pista').hidden = !p; E('pista').textContent = p; }
}

/* ---------- pantallas ---------- */
const PANTALLAS = ['p-titulo', 'p-bots', 'p-ayuda', 'p-opciones', 'p-pausa', 'p-fin', 'p-pvp', 'p-amigos', 'p-busca', 'p-clasif', 'p-pvp-info', 'p-diario', 'p-pase', 'p-tienda', 'p-gacha'];
// el caos primordial (lo que gasta jugar en línea) solo se ve donde se gasta: en el botón EN LÍNEA del título y en las pantallas del PvP (decidido por Daniel el 24-10-2026: en todos los menús molestaba)
const PANTALLAS_CAOS = ['p-titulo', 'p-pvp', 'p-amigos', 'p-busca', 'p-pvp-info'];
function pantalla(id) { REPORTE.suceso('pantalla', { id }); for (const p of PANTALLAS) E(p).hidden = p !== id; if (typeof energiaMenu === 'function') energiaMenu(PANTALLAS_CAOS.includes(id)); }
let _trasAyuda = null;
function irTitulo() { escenaTitulo(); pantalla('p-titulo'); refrescaHud(true); refrescaSonido(); diarioAlTitulo(); misionBoton(); if (typeof refrescaTitulo === 'function') refrescaTitulo(); }
function muestraAyuda(luego, modo) { _trasAyuda = luego || null; if (typeof ayudaPinta === 'function') ayudaPinta(modo); pantalla('p-ayuda'); misionEvento('ayuda'); }      // ayuda.js: las tarjetas
function muestraPausa(si) {
  E('b-reiniciar').hidden = J.pvp; J.avisoRetiro = false; E('b-salir').textContent = J.pvp ? tr('Rendirse') : typeof ESC_PRUEBA !== 'undefined' && ESC_PRUEBA.activa ? tr('VOLVER A MI ESCENARIO') : tr('Salir al menú');      // por internet no se reinicia: solo se sigue o se rinde uno
  pantalla(si ? 'p-pausa' : null); refrescaSonido();
}
// al elegir papel: la primera vez se enseña antes cómo se juega
// la pantalla CONTRA BOTS: el papel (viene marcado desde la tarjeta del título) y el mapa, y luego ¡JUGAR!
const BOTS = { modo: 'camaleon' };
function abreBots(modo) { audioInit(); play('select'); BOTS.modo = modo; pintaBots(); if (MAPA.id !== mapaElegido()) { cargaMapa(mapaElegido()); escenaTitulo(); } pintaBotonesMapa(); pantalla('p-bots'); }      // los candados de los mapas, al día (elige-mapa.js)
function pintaBots() {
  E('b-bots-camaleon').classList.toggle('elegido', BOTS.modo === 'camaleon');
  E('b-bots-cazador').classList.toggle('elegido', BOTS.modo === 'cazador');
}
function elige(modo) {
  audioInit(); play('select');
  let visto = false; try { visto = localStorage.getItem('rouflage-ayuda') === '1'; } catch (_) { /* sin guardar */ }
  if (!visto) { try { localStorage.setItem('rouflage-ayuda', '1'); } catch (_) { /* sin guardar */ } muestraAyuda(() => empiezaSeguro(modo), modo); return; }
  empiezaSeguro(modo);
}
// empezar sin quedarse pillado: si algo falla (una partida guardada rara, por ejemplo), se dice, se apunta (errores.js lo manda al servidor) y se vuelve al título
function empiezaSeguro(modo) {
  pantalla(null);
  try { empiezaPartida(modo); }
  catch (e) {
    setTimeout(() => { throw e; });      // para el registro de errores
    irTitulo(); avisa(tr('No se ha podido empezar la partida. Si se repite, prueba OPCIONES › Borrar todo mi progreso (alfa).'), 'malo');
  }
}
// las barras de volumen (título y pausa) enseñan lo que hay; el icono de al lado silencia y recupera
function refrescaSonido() {
  for (const id of ['b-sonido', 'b-sonido2']) E(id).classList.toggle('apagado', AUDIO.mudo);
  for (const id of ['b-musica', 'b-musica2']) E(id).classList.toggle('apagado', AUDIO.sinMusica);
  for (const id of ['v-sonido', 'v-sonido2']) E(id).value = Math.round(AUDIO.vol * 100);
  for (const id of ['v-musica', 'v-musica2']) E(id).value = Math.round(AUDIO.volMus * 100);
  for (const id of ['b-viejo', 'b-viejo2']) { E(id).hidden = !NUCLEO.desarrollo; E(id).textContent = AUDIO.viejo ? tr('Sonido: antiguo') : tr('Sonido: nuevo'); }      // temporal, para comparar el sonido viejo con el nuevo (solo en desarrollo: en la web no tiene sentido)
}

// los dibujos de las dos tarjetas del título, hechos con las piezas del propio juego
function pintaTarjetas() {
  const falsa = (tipo, x, y, clase = 'camaleon') => { const [piel, pctx] = nuevaPiel(clase === 'cazador' ? '#aab4c4' : BLANCO_PIEL); return { clase, tipo, x, y, mira: 1, dir: 0, hielo: 0, piel, pctx, pasos: [], semilla: 3, anda: 0, alerta: 0, ciego: 0, balas: 5 }; };
  const trozo = (c, x0, y0, z) => { c.setTransform(z, 0, 0, z, -x0 * z, -y0 * z); c.drawImage(MAPA.fondo, 0, 0, ANCHO, ALTO); };
  // camaleón: una alubia sin pintar y otra ya pintada y congelada sobre el damero
  let c = E('dib-camaleon').getContext('2d');
  trozo(c, 926, 262, 2.5);
  const a = falsa('bunny', 962, 340), b = falsa('fox', 1020, 334);
  pintaBot(b, 0.93); b.hielo = 1;
  pintaAlubia(c, a, 1); pintaAlubia(c, b, 1);
  c.save(); c.translate(b.x, b.y); c.beginPath(); trazaAlubia(c); c.setLineDash([3, 3]); c.lineWidth = 1.4; c.strokeStyle = '#fff6ea'; c.stroke(); c.restore();
  forma(c, poli(1012, 272, 1028, 272, 1020, 282), '#ffcb3d', 2.4);
  // cazador: a oscuras, el becario alumbra a uno mal pintado sobre la moqueta
  c = E('dib-cazador').getContext('2d');
  trozo(c, 80, 432, 2.5);
  const h = falsa('becario', 112, 510, 'cazador'), p = falsa('squirrel', 180, 498);
  pintaBot(p, 0.4); p.hielo = 1; pintaAlubia(c, p, 1); pintaAlubia(c, h, 1);
  c.fillStyle = 'rgba(10,6,28,0.66)'; c.beginPath(); c.rect(70, 424, 150, 110); c.moveTo(126, 496); c.lineTo(230, 438); c.lineTo(230, 548); c.closePath(); c.fill('evenodd');
  c.fillStyle = 'rgba(255,236,170,0.1)'; c.beginPath(); c.moveTo(126, 496); c.lineTo(230, 438); c.lineTo(230, 548); c.closePath(); c.fill();
  pintaAlubia(c, h, 1);
  pintaSigno(c, 112, 436, '?', '#e8731a', 0);
  if (typeof ayudaDibuja === 'function') ayudaDibuja();      // los dibujos de CÓMO SE JUEGA, con el mismo mapa
}

function preparaInterfaz() {
  pintaTarjetas();
  // las tarjetas del título abren CONTRA BOTS con ese papel marcado; ahí se elige el mapa y se pulsa ¡JUGAR!
  E('b-camaleon').onclick = () => abreBots('camaleon'); E('b-cazador').onclick = () => abreBots('cazador');
  E('b-bots-camaleon').onclick = () => { play('select'); BOTS.modo = 'camaleon'; pintaBots(); };
  E('b-bots-cazador').onclick = () => { play('select'); BOTS.modo = 'cazador'; pintaBots(); };
  E('b-bots-jugar').onclick = () => elige(BOTS.modo);
  E('b-bots-volver').onclick = () => { play('select'); pantalla('p-titulo'); };
  E('b-ayuda').onclick = () => { play('select'); muestraAyuda(() => pantalla('p-titulo')); };
  E('b-opciones').onclick = () => { play('select'); pantalla('p-opciones'); refrescaSonido(); reinicioRevisa(); };
  E('b-opciones-ok').onclick = () => { play('select'); pantalla('p-titulo'); };
  E('b-ayuda2').onclick = () => { play('select'); muestraAyuda(() => pantalla('p-pausa')); };
  E('b-ayuda-ok').onclick = () => { play('select'); const f = _trasAyuda; _trasAyuda = null; if (f) f(); else pantalla('p-titulo'); };
  for (const id of ['b-sonido', 'b-sonido2']) E(id).onclick = () => { cambiaSonido(); refrescaSonido(); };
  for (const id of ['b-musica', 'b-musica2']) E(id).onclick = () => { cambiaMusica(); refrescaSonido(); };
  for (const id of ['v-sonido', 'v-sonido2']) E(id).oninput = ev => { ponVolumen('vol', ev.target.value / 100); refrescaSonido(); };
  for (const id of ['v-musica', 'v-musica2']) E(id).oninput = ev => { ponVolumen('volMus', ev.target.value / 100); refrescaSonido(); };
  for (const id of ['b-viejo', 'b-viejo2']) E(id).onclick = () => { cambiaSonidoViejo(); refrescaSonido(); };
  try { pintarBanderas(E('idioma-banderas'))(); } catch (e) { /* sin banderas */ }      // las banderas de core: los idiomas que tiene el juego (cambiar recarga la página)
  E('b-tuto-repite').onclick = bocadilloRepite;
  E('b-ranking').onclick = () => { RANKING.abierto = !RANKING.abierto; try { localStorage.setItem('rouflage-ranking', RANKING.abierto ? '1' : '0'); } catch (_) { /* sin guardar */ } play('select'); refrescaHud(true); };
  E('b-pausa').onclick = accionPausa; E('b-seguir').onclick = accionPausa;
  E('b-reiniciar').onclick = () => { pantalla(null); empiezaPartida(J.modo); };
  E('b-salir').onclick = () => {
    // en PvP, irse estando en juego deja a los tuyos con un jugador menos: el primer toque avisa y el segundo se va (más adelante, con penalización si se repite)
    if (J.pvp && J.fase === 'caza' && J.yo && !sinJuego(J.yo) && !J.avisoRetiro) { play('deny'); J.avisoRetiro = true; E('b-salir').textContent = tr('¿SEGURO? PIERDES PUNTOS Y DEJAS A TU EQUIPO SIN TI'); return; }
    play('select'); if (J.pvp) rfpRendirse(!(J.yo && sinJuego(J.yo))); if (escPruebaVuelve()) return; irTitulo();      // (la partida de prueba de Mi escenario vuelve al editor)
  };      // por internet, salir en plena partida es rendirse
  E('b-otra').onclick = () => { play('select'); if (J.pvp) { pvpBuscar(RFP.soloBots ? { crear: true, soloBots: true } : undefined); return; }      // contra bots: otra sala tuya con el menú, no BUSCAR PARTIDA
   pantalla(null); empiezaPartida(J.modo); };
  E('b-foto').onclick = fotoComparte;
  E('b-cambia').onclick = () => { play('select'); pantalla(null); empiezaPartida(J.modo === 'camaleon' ? 'cazador' : 'camaleon'); };
  E('b-menu').onclick = () => { play('select'); if (J.pvp) rfpSale(); if (escPruebaVuelve()) return; irTitulo(); };
  botonAccion(E('b-pintar'), accionPintar); botonAccion(E('b-congelar'), accionCongelar); E('t-senuelo').onclick = () => tallerHerramienta('senuelo'); botonAccion(E('b-silbar'), accionSilbar); botonAccion(E('b-granada'), accionGranada); botonAccion(E('b-poder'), accionPoder); botonAccion(E('b-chivato'), accionChivato); E('b-retiro').onclick = () => { play('select'); if (J.pvp) rfpRendirse(false); irTitulo(); }; botonAccion(E('b-listo'), accionListo);
  E('t-gota').onclick = () => tallerHerramienta('gota');
  for (const b of document.querySelectorAll('.t-radio')) b.onclick = () => tallerRadio(+b.dataset.radio);
  for (const b of document.querySelectorAll('.t-cabezal')) b.onclick = () => tallerCabezal(b.dataset.cabezal);
  for (const b of document.querySelectorAll('.t-figura')) b.onclick = () => tallerFigura(b.dataset.figura);
  for (const b of document.querySelectorAll('.t-postura')) {
    b.onclick = () => tallerPostura(b.dataset.postura);
    // su dibujito: la silueta de esa postura
    const c = b.querySelector('canvas').getContext('2d'); c.setTransform(1.2, 0, 0, 1.2, 33, 72);
    c.beginPath(); trazaAlubia(c, null, b.dataset.postura); c.fillStyle = '#f4f1fa'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = OL; c.lineJoin = 'round'; c.stroke();
  }
  E('t-cubo').onclick = tallerRellena; E('t-rapida').onclick = tallerRapida; E('t-deshacer').onclick = tallerDeshace; E('t-calco').onclick = tallerCalco;
  E('t-listo').onclick = () => { cierraTaller(); play('select'); };
  E('t-plegar').onclick = tallerPlegar;
}
