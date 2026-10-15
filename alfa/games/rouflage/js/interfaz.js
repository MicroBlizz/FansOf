// Fans of Rouflage (prototipo) · LA INTERFAZ: todo lo que va por encima del lienzo. Los iconos (dibujados, sin emojis), el marcador y
// los botones de la partida, los avisos, el panel del taller y las pantallas de título, ayuda, pausa y final (con su mapa de
// dónde estaba cada uno).
'use strict';

const E = id => document.getElementById(id);
const ICONOS = {
  pincel: '<path d="M20 4l-7.6 7.6"/><path d="M12.7 11.3l2 2c-1 3.4-3.7 6.1-9.7 6.6 1.6-1.9 1.4-3 1.8-4.6.5-2 2.5-3.6 5.9-4z" fill="currentColor"/>',
  gota: '<path d="M13.4 6.6l4 4"/><path d="M15 8.2 6.2 17l-1.6 3.4L8 18.8l8.8-8.8"/><path d="M16.2 4.2a2.5 2.5 0 0 1 3.6 3.6l-2 2-3.6-3.6z" fill="currentColor"/>',
  cubo: '<path d="M5 11.6 12 4.6l7 7-6.4 6.4a1.5 1.5 0 0 1-2.1 0L5 12.6z"/><path d="M8.6 8 5.2 4.6"/><path d="M19.6 15.4c1 1.4 1.6 2.3 1.6 3.1a1.6 1.6 0 0 1-3.2 0c0-.8.6-1.7 1.6-3.1z" fill="currentColor"/>',
  deshacer: '<path d="M8 5 3.5 9.5 8 14"/><path d="M3.5 9.5H14a5.5 5.5 0 0 1 0 11h-3"/>',
  ojo: '<path d="M2 12c2.6-4.4 6-6.5 10-6.5s7.4 2.1 10 6.5c-2.6 4.4-6 6.5-10 6.5S4.6 16.4 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  hielo: '<path d="M12 2v20M3.4 7l17.2 10M3.4 17 20.6 7"/><path d="M9.5 3.6 12 6l2.5-2.4M9.5 20.4 12 18l2.5 2.4"/>',
  andar: '<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  cabezaRedonda: '<circle cx="12" cy="12" r="6.5" fill="currentColor"/>',
  cabezaCuadrada: '<rect x="5.5" y="5.5" width="13" height="13" fill="currentColor"/>',
  senuelo: '<path d="M3 15c3-7 5 3 8-4s4 4 7-3"/><circle cx="19.5" cy="17.5" r="2.2"/>',
  podio: '<path d="M3 20h18M9 20V10h6v10M3 20v-6h6M15 20v-8h6M12 3l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 9l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z"/>',
  apagon: '<path d="M4 7.5h7l5-3v12l-5-3H4zM16 9.5v2M3 3l18 18"/>',
  mano: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v7.5a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.4L3.6 14.2a1.4 1.4 0 0 1 2.3-1.6L8 15V12"/>',
  granada: '<circle cx="11" cy="14.5" r="6.2"/><path d="M9 8.4V5.2h4v3.2M13 5.2l4.2-1.8M3.2 4.6l2 1.4M2.4 9.6h2.4M20 10.6l1.6-1.6M20.6 14.6h1.8"/>',
  silbato: '<path d="M3 9.5h11.5M3 9.5V13h6.2"/><circle cx="14.5" cy="14" r="5.6"/><circle cx="14.5" cy="14" r="1.5" fill="currentColor"/><path d="M14.5 2.4v2.4M19 3.8l-1.3 2.1M10 3.8l1.3 2.1"/>',
  pausa: '<path d="M8.2 5v14M15.8 5v14" stroke-width="3.6"/>',
  sonido: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor"/><path d="M15.5 9.5c1.3 1.4 1.3 3.6 0 5M18 7c2.6 2.8 2.6 7.2 0 10"/>',
  musica: '<path d="M9 18V6l10-2v12"/><circle cx="6.8" cy="18" r="2.4" fill="currentColor"/><circle cx="16.8" cy="16" r="2.4" fill="currentColor"/>',
  linea: '<path d="M5 19 19 5" stroke-width="3"/><circle cx="5" cy="19" r="1.8" fill="currentColor"/><circle cx="19" cy="5" r="1.8" fill="currentColor"/>',
  cuadro: '<rect x="4.5" y="5.5" width="15" height="13" rx="2" fill="currentColor" fill-opacity=".35"/>',
  circulo: '<circle cx="12" cy="12" r="7.5" fill="currentColor" fill-opacity=".35"/>',
  diana: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M12 1.4v3M12 19.6v3M1.4 12h3M19.6 12h3"/>',
};
const ESTRELLA = '<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
function ponIcono(el, nombre) { el.dataset.icono = nombre; el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + '</svg>'; }
function ponIconos() { for (const el of document.querySelectorAll('i[data-icono]')) ponIcono(el, el.dataset.icono); }

/* ---------- avisos, cartel y pista ---------- */
function avisa(texto, tipo = 'aviso') {
  const caja = E('avisos'), p = document.createElement('p'); p.className = tipo; p.textContent = texto; caja.appendChild(p);
  while (caja.children.length > 4) caja.firstChild.remove();
  setTimeout(() => p.classList.add('adios'), 4200); setTimeout(() => p.remove(), 4800);
}
function limpiaAvisos() { E('avisos').textContent = ''; E('cartel').hidden = true; PISTA.hasta = 0; }
// el cartel grande del centro; con `numero`, la cifra de la cuenta atrás
function cartel(titulo, sub = '', numero = false) {
  const c = E('cartel'); E('cartel-t').textContent = titulo; E('cartel-s').textContent = sub;
  c.hidden = false; c.classList.toggle('numero', numero && titulo.length < 3); c.classList.remove('sale'); void c.offsetWidth; c.classList.add('sale');
}
// una frase de ayuda sobre los botones: la que toca en cada momento o, durante unos segundos, una concreta
const PISTA = { texto: '', hasta: 0, vista: '' };
function pista(texto, segundos = 2.5) { PISTA.texto = texto; PISTA.hasta = J.t + segundos; }
function pistaDeAhora() {
  if (J.t < PISTA.hasta) return PISTA.texto;
  const yo = J.yo; if (!yo || TALLER.abierto) return '';
  if (espectando()) { const p = poderDe(); return p && !J.fantasma.usado ? tr(p.pista) : tr('Espectador: pasea por el mapa (WASD o arrastra el dedo). Para irte, ME RETIRO.'); }
  if (yo.fuera) return '';
  if (yo.invis > 0) return tr('Invisible: los becarios no te ven ({n} s)', { n: Math.ceil(yo.invis) });
  if (yo.clase === 'camaleon') {
    if (J.fase === 'prep') return !yo.pintado ? tr('Ve a donde quieras esconderte y toca PINTAR') : !yo.congelado ? tr('Toca CONGELAR para quedarte quieto y desaparecer') : tr('Congelado. Toca ¡LISTO! o retócate con PINTAR');
    if (J.fase === 'caza') {
      const mira = J.cazadores.find(h => h.bot && !h.fuera && h.bot.objetivo === yo && (h.bot.estado === 'sospecha' || h.bot.estado === 'apunta'));
      if (mira && mira.bot.estado === 'apunta') return yo.granada > 0 ? tr('¡Te ha visto! Corre o lanza la granada cegadora') : tr('¡Te ha visto! Arrastra para salir corriendo');
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
  else if (J.fase === 'caza' && J.tFase < 9) return ENTRADA.tactil ? tr('Arrastra para andar. Toca donde creas que hay un colado') : tr('WASD para andar. Haz clic donde creas que hay un colado');
  return '';
}

/* ---------- la clasificación en vivo (botón de la esquina): quién va primero, solo números sobre el mapa ---------- */
const RANKING = { abierto: (() => { try { return localStorage.getItem('rouflage-ranking') === '1'; } catch (_) { return false; } })(), t: 0, txt: '' };
function refrescaRanking() {
  const ver = RANKING.abierto && (J.fase === 'caza' || J.fase === 'fin') && !TALLER.abierto, el = E('ranking'), b = E('b-ranking');
  if (b.classList.contains('puesto') !== RANKING.abierto) b.classList.toggle('puesto', RANKING.abierto);
  if (el.hidden === ver) el.hidden = !ver;
  if (!ver || J.t - RANKING.t < 0.5) return;      // dos veces por segundo basta
  RANKING.t = J.t;
  const html = clasificacion().map((r, i) => `<li class="${r.jugador ? 'yo' : ''}${r.fuera ? ' fuera' : ''}"><i>${i + 1}</i><span>${r.nombre}</span><b>${r.puntos}</b></li>`).join('');
  if (html !== RANKING.txt) { RANKING.txt = html; el.innerHTML = html; }
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
  if (HUD.visible !== enPartida) { HUD.visible = enPartida; E('hud').hidden = !enPartida; }
  if (!enPartida) { E('peligro').style.opacity = 0; return; }
  const cam = yo.clase === 'camaleon', caza = J.fase === 'caza', paseo = J.fase === 'paseo';
  if (HUD.rol !== J.modo) { HUD.rol = J.modo; const c = E('chip-rol'); c.dataset.rol = J.modo; c.querySelector('b').textContent = cam ? tr('CAMALEÓN') : tr('CAZADOR'); ponIcono(c.querySelector('i'), cam ? 'pincel' : 'diana'); }
  ponTexto('fase', E('fase-txt'), paseo ? tr('Habitación') : J.fase === 'prep' ? (cam ? tr('Píntate') : tr('Calentamiento')) : J.fase === 'cuenta' ? tr('Preparados') : caza ? (cam ? tr('Aguanta') : tr('Encuéntralos')) : '');
  ponTexto('reloj', E('reloj'), J.fase === 'cuenta' || J.fase === 'fin' || paseo ? '' : mmss(J.reloj));
  const prisa = (J.fase === 'prep' || caza) && J.reloj <= 10; if (HUD.prisa !== prisa) { HUD.prisa = prisa; E('reloj').classList.toggle('prisa', prisa); }
  refrescaPoder();      // el botón del poder del fantasma (fantasma-poder.js)
  refrescaRanking();
  // lo de cada papel
  const ver = { 'e-camo': cam && !paseo, 'e-silbo': cam && caza, 'e-balas': !cam && !paseo, 'e-quedan': !cam && !paseo, 'acciones': cam && (J.fase === 'prep' || caza) && !TALLER.abierto && !yo.fuera,
    'b-silbar': caza && !espectando(), 'b-retiro': espectando(), 'b-granada': cam && caza && yo.granada > 0 && !yo.fuera, 'b-listo': J.fase === 'prep' && yo.congelado && !yo.listo, 'estado': !TALLER.abierto, 'avisos': !TALLER.abierto };
  for (const id in ver) if (HUD['v-' + id] !== ver[id]) { HUD['v-' + id] = ver[id]; E(id).hidden = !ver[id]; }
  if (cam) {
    const medido = yo.congelado || TALLER.abierto, n = medido ? yo.camo : -1;
    if (HUD.camo !== n) { HUD.camo = n; E('e-camo-n').textContent = n < 0 ? '—' : n + ' %'; E('e-camo-b').style.width = Math.max(0, n) + '%'; E('e-camo-b').style.background = colorCamo(n); }
    if (HUD.hielo !== yo.congelado) { HUD.hielo = yo.congelado; E('b-congelar-t').textContent = yo.congelado ? tr('MOVERSE') : tr('CONGELAR'); E('b-congelar').classList.toggle('puesto', yo.congelado); ponIcono(E('b-congelar').querySelector('i'), yo.congelado ? 'andar' : 'hielo'); }
    if (caza) { ponTexto('silbo', E('e-silbo-n'), String(Math.max(0, Math.ceil(yo.silbido)))); const pronto = yo.silbido <= 5; if (HUD.pronto !== pronto) { HUD.pronto = pronto; E('e-silbo').classList.toggle('pronto', pronto); } }
    E('peligro').style.opacity = caza ? (J.peligro * J.peligro * (0.75 + 0.25 * Math.sin(J.t * 9))).toFixed(3) : 0;
  } else {
    if (HUD.balas !== yo.balas) { HUD.balas = yo.balas; E('e-balas-n').innerHTML = Array.from({ length: REGLAS.balas }, (_, i) => `<i${i < yo.balas ? '' : ' class="gastada"'}></i>`).join(''); }
    ponTexto('quedan', E('e-quedan-n'), String(escondidos().length));
    E('peligro').style.opacity = yo.ciego > 0 ? 0.16 : 0;
  }
  const p = caza || J.fase === 'prep' ? pistaDeAhora() : '';
  if (HUD.pista !== p) { HUD.pista = p; E('pista').hidden = !p; E('pista').textContent = p; }
}

/* ---------- el panel del taller ---------- */
function muestraTaller(si) { E('taller').hidden = !si; if (si) refrescaTaller(); refrescaHud(true); }
function pintaMedidor(n) { E('t-camo').textContent = n + ' %'; const b = E('t-barra'); b.style.width = n + '%'; b.style.background = colorCamo(n); }
function refrescaTinta() { const yo = J.yo; if (!yo) return; const n = Math.max(0, Math.ceil(yo.tinta)); ponTexto('tinta', E('t-tinta-n'), String(n)); E('t-tinta-barra').style.width = Math.max(0, yo.tinta) + '%'; }
function refrescaTaller() {
  E('taller').classList.toggle('plegado', TALLER.plegado);
  const pl = E('t-plegar'); pl.setAttribute('aria-expanded', String(!TALLER.plegado)); pl.setAttribute('aria-label', TALLER.plegado ? tr('Mostrar las herramientas') : tr('Ocultar las herramientas'));
  E('t-gota').classList.toggle('puesto', TALLER.herr === 'gota');
  for (const b of document.querySelectorAll('.t-radio')) b.classList.toggle('puesto', TALLER.herr === 'pincel' && RADIOS[+b.dataset.radio] === TALLER.radio);
  E('t-calco').classList.toggle('puesto', TALLER.calco); E('t-senuelo').classList.toggle('puesto', TALLER.herr === 'senuelo');
  E('t-ayuda').textContent = TALLER.herr === 'senuelo' ? tr('Señuelo: pinta en el suelo, cerca de ti. Gasta tinta y los becarios pueden picar.') : tr('Toca el suelo para coger su color y pinta tu cuerpo con el dedo.');
  refrescaTinta();
  for (const b of document.querySelectorAll('.t-cabezal')) b.classList.toggle('puesto', TALLER.cabezal === b.dataset.cabezal);
  for (const b of document.querySelectorAll('.t-figura')) b.classList.toggle('puesto', TALLER.herr === b.dataset.figura);
  const post = (J.yo && J.yo.postura) || 'firmes';
  for (const b of document.querySelectorAll('.t-postura')) b.classList.toggle('puesto', b.dataset.postura === post);
  const pal = E('t-paleta');
  if (!pal.children.length) for (const col of paletaDelMapa()) {
    const b = document.createElement('button'); b.type = 'button'; b.style.background = col; b.dataset.color = col; b.setAttribute('aria-label', tr('Color') + ' ' + col);
    b.onclick = () => { ponColor(col); if (TALLER.herr === 'gota') TALLER.herr = 'pincel'; play('select'); refrescaTaller(); };
    pal.appendChild(b);
  }
  for (const b of pal.children) b.classList.toggle('puesto', b.dataset.color === TALLER.color);
  E('t-color').style.background = TALLER.color;
  const caja = E('t-recientes'); caja.textContent = '';
  for (const col of TALLER.recientes) {
    const b = document.createElement('button'); b.type = 'button'; b.style.background = col; b.setAttribute('aria-label', tr('Color') + ' ' + col);
    if (col === TALLER.color) b.className = 'puesto';
    b.onclick = () => { ponColor(col); if (TALLER.herr === 'gota') TALLER.herr = 'pincel'; play('select'); refrescaTaller(); };
    caja.appendChild(b);
  }
}

/* ---------- pantallas ---------- */
const PANTALLAS = ['p-titulo', 'p-ayuda', 'p-opciones', 'p-pausa', 'p-fin', 'p-pvp', 'p-amigos', 'p-busca', 'p-clasif', 'p-pvp-info'];
function pantalla(id) { for (const p of PANTALLAS) E(p).hidden = p !== id; if (typeof energiaMenu === 'function') energiaMenu(id && id !== 'p-pausa'); }
let _trasAyuda = null;
function irTitulo() { escenaTitulo(); pantalla('p-titulo'); refrescaHud(true); refrescaSonido(); }
function muestraAyuda(luego) { _trasAyuda = luego || null; pantalla('p-ayuda'); }
function muestraPausa(si) {
  E('b-reiniciar').hidden = J.pvp; J.avisoRetiro = false; E('b-salir').textContent = J.pvp ? tr('Rendirse') : tr('Salir al menú');      // por internet no se reinicia: solo se sigue o se rinde uno
  pantalla(si ? 'p-pausa' : null); refrescaSonido();
}
// al elegir papel: la primera vez se enseña antes cómo se juega
function elige(modo) {
  audioInit(); play('select');
  let visto = false; try { visto = localStorage.getItem('rouflage-ayuda') === '1'; } catch (_) { /* sin guardar */ }
  if (!visto) { try { localStorage.setItem('rouflage-ayuda', '1'); } catch (_) { /* sin guardar */ } muestraAyuda(() => { pantalla(null); empiezaPartida(modo); }); return; }
  pantalla(null); empiezaPartida(modo);
}
// las barras de volumen (título y pausa) enseñan lo que hay; el icono de al lado silencia y recupera
function refrescaSonido() {
  for (const id of ['b-sonido', 'b-sonido2']) E(id).classList.toggle('apagado', AUDIO.mudo);
  for (const id of ['b-musica', 'b-musica2']) E(id).classList.toggle('apagado', AUDIO.sinMusica);
  for (const id of ['v-sonido', 'v-sonido2']) E(id).value = Math.round(AUDIO.vol * 100);
  for (const id of ['v-musica', 'v-musica2']) E(id).value = Math.round(AUDIO.volMus * 100);
  for (const id of ['b-viejo', 'b-viejo2']) E(id).textContent = AUDIO.viejo ? tr('Sonido: antiguo') : tr('Sonido: nuevo');      // temporal, para comparar
}
// el botón de idioma del título: core guarda el idioma elegido y recarga la página (como en los demás juegos)
function cambiaIdioma() { NUCLEO.elegirIdioma(IDIOMA_RF === 'es' ? 'en' : 'es'); }

// el final: título, estrellas, el mapa con dónde estaba cada uno y las cifras
function muestraFin() {
  const r = J.resultado; if (!r) return;
  E('fin-titulo').textContent = r.titulo; E('fin-titulo').classList.toggle('mal', !r.victoria); E('fin-sub').textContent = r.sub;
  E('fin-estrellas').innerHTML = [0, 1, 2].map(i => ESTRELLA.replace('<svg', i < r.estrellas ? '<svg class="si"' : '<svg')).join('');
  E('fin-filas').innerHTML = r.filas.map(([a, b]) => `<span>${a}</span><b>${b}</b>`).join('') + `<div class="total"><span>${tr('PUNTOS')}</span><b>${r.puntos}</b></div>`;
  // la clasificación: todos (personas y bots) por puntos; tú resaltado
  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  E('fin-ranking').innerHTML = r.ranking.map((f, i) => `<li class="${f.jugador ? 'yo' : ''}${f.fuera ? ' fuera' : ''}"><span class="pos">${i + 1}</span><i class="${f.clase}"></i><span class="nom">${esc(f.nombre)}<small>${esc(f.detalle)}</small></span><b>${f.puntos}</b></li>`).join('');
  E('b-cambia').textContent = J.modo === 'camaleon' ? tr('Ahora de cazador') : tr('Ahora de camaleón');
  E('b-cambia').hidden = J.pvp; E('b-otra').textContent = J.pvp ? tr('OTRA PARTIDA') : tr('OTRA VEZ');      // por internet los papeles los reparte el servidor al azar
  pintaMapaFinal();
  pantalla('p-fin');
}
function pintaMapaFinal() {
  const m = E('fin-mapa'), c = m.getContext('2d'), k = m.width / ANCHO;
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
  E('fin-leyenda').innerHTML = `<span><i class="libre"></i>${tr('No le han pillado')}</span><span><i class="fuera"></i>${tr('Despedido')}</span><span><i class="becario"></i>${tr('Becario')}</span>`;
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
}

function preparaInterfaz() {
  pintaTarjetas();
  E('b-camaleon').onclick = () => elige('camaleon'); E('b-cazador').onclick = () => elige('cazador');
  E('b-ayuda').onclick = () => { play('select'); muestraAyuda(() => pantalla('p-titulo')); };
  E('b-opciones').onclick = () => { play('select'); pantalla('p-opciones'); refrescaSonido(); };
  E('b-opciones-ok').onclick = () => { play('select'); pantalla('p-titulo'); };
  E('b-ayuda2').onclick = () => { play('select'); muestraAyuda(() => pantalla('p-pausa')); };
  E('b-ayuda-ok').onclick = () => { play('select'); const f = _trasAyuda; _trasAyuda = null; if (f) f(); else pantalla('p-titulo'); };
  for (const id of ['b-sonido', 'b-sonido2']) E(id).onclick = () => { cambiaSonido(); refrescaSonido(); };
  for (const id of ['b-musica', 'b-musica2']) E(id).onclick = () => { cambiaMusica(); refrescaSonido(); };
  for (const id of ['v-sonido', 'v-sonido2']) E(id).oninput = ev => { ponVolumen('vol', ev.target.value / 100); refrescaSonido(); };
  for (const id of ['v-musica', 'v-musica2']) E(id).oninput = ev => { ponVolumen('volMus', ev.target.value / 100); refrescaSonido(); };
  for (const id of ['b-viejo', 'b-viejo2']) E(id).onclick = () => { cambiaSonidoViejo(); refrescaSonido(); };
  E('b-idioma').textContent = IDIOMA_RF === 'es' ? 'English' : 'Español';
  E('b-idioma').onclick = () => { cambiaIdioma(); play('select'); };
  E('b-ranking').onclick = () => { RANKING.abierto = !RANKING.abierto; try { localStorage.setItem('rouflage-ranking', RANKING.abierto ? '1' : '0'); } catch (_) { /* sin guardar */ } play('select'); refrescaHud(true); };
  E('b-pausa').onclick = accionPausa; E('b-seguir').onclick = accionPausa;
  E('b-reiniciar').onclick = () => { pantalla(null); empiezaPartida(J.modo); };
  E('b-salir').onclick = () => {
    // en PvP, irse estando en juego deja a los tuyos con un jugador menos: el primer toque avisa y el segundo se va (más adelante, con penalización si se repite)
    if (J.pvp && J.fase === 'caza' && J.yo && !sinJuego(J.yo) && !J.avisoRetiro) { play('deny'); J.avisoRetiro = true; E('b-salir').textContent = tr('¿SEGURO? PIERDES PUNTOS Y DEJAS A TU EQUIPO SIN TI'); return; }
    play('select'); if (J.pvp) rfpRendirse(!(J.yo && sinJuego(J.yo))); irTitulo();
  };      // por internet, salir en plena partida es rendirse
  E('b-otra').onclick = () => { play('select'); if (J.pvp) { pvpBuscar(); return; } pantalla(null); empiezaPartida(J.modo); };
  E('b-cambia').onclick = () => { play('select'); pantalla(null); empiezaPartida(J.modo === 'camaleon' ? 'cazador' : 'camaleon'); };
  E('b-menu').onclick = () => { play('select'); if (J.pvp) rfpSale(); irTitulo(); };
  E('b-pintar').onclick = accionPintar; E('b-congelar').onclick = accionCongelar; E('t-senuelo').onclick = () => tallerHerramienta('senuelo'); E('b-silbar').onclick = accionSilbar; E('b-granada').onclick = accionGranada; E('b-poder').onclick = accionPoder; E('b-retiro').onclick = () => { play('select'); if (J.pvp) rfpRendirse(false); irTitulo(); }; E('b-listo').onclick = accionListo;
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
  E('t-cubo').onclick = tallerRellena; E('t-deshacer').onclick = tallerDeshace; E('t-calco').onclick = tallerCalco;
  E('t-listo').onclick = () => { cierraTaller(); play('select'); };
  E('t-plegar').onclick = tallerPlegar;
}
