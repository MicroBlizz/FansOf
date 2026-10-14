// Fans of Karts (prototipo) · LAS PANTALLAS: título, elegir piloto, elegir pista, la carga (con sus excusas de Microblizz), la pausa,
// los resultados, las opciones y cómo se juega. Todo se pinta en la pantalla de 240 × 160. Los botones se activan tocándolos o con las
// flechas e Intro: cada pantalla los declara al pintarse (boton) y aquí se mira después cuál se ha elegido.
'use strict';

const PANT = { id: 'titulo', pausa: false, foco: 0, t: 0, acciones: [], rects: [], directas: [], atras: null, piloto: 0, pista: 0, mundo: 0, fase: 0, total: 1, frase: 0, nota: '', vuelve: 'titulo' };
function ve(id) { PANT.id = id; PANT.foco = 0; PANT.t = 0; PANT.pausa = false; PANT.nota = ''; UI.toque = null; UI.tecla = null; PULSOS.pausa = PULSOS.usa = PULSOS.salta = false; ajusta(); }

function marco(x, y, w, h, fondo = '#2a1840', borde = '#1c1028', luz = '#5b3a86') {
  lx.fillStyle = borde; lx.fillRect(x + 1, y, w - 2, h); lx.fillRect(x, y + 1, w, h - 2);
  lx.fillStyle = luz; lx.fillRect(x + 1, y + 1, w - 2, h - 2);
  lx.fillStyle = fondo; lx.fillRect(x + 2, y + 2, w - 4, h - 4);
}
// un botón: se pinta, se apunta y se activa al tocarlo, o con Intro si tiene el foco. Con `directa`, lo que hace se ejecuta dentro del
// propio toque (controles.js): es lo que piden los navegadores para la pantalla completa, la ventana de instalar o el permiso del giroscopio.
const NADA = () => {};
function boton(txt, x, y, w, accion, h = 14, color = '#ffcb3d', directa = null) {
  const i = PANT.acciones.length, foco = PANT.foco === i;
  PANT.acciones.push(accion); PANT.rects.push(x, y, w, h); PANT.directas.push(directa);
  lx.fillStyle = '#1c1028'; lx.fillRect(x + 1, y, w - 2, h); lx.fillRect(x, y + 1, w, h - 2);
  lx.fillStyle = foco ? color : '#4a2f72'; lx.fillRect(x + 1, y + 1, w - 2, h - 2);
  lx.fillStyle = foco ? '#fff3a0' : '#6b4a9a'; lx.fillRect(x + 2, y + 1, w - 4, 1);
  escribe(lx, tr(txt), x + (w >> 1), y + ((h - 7) >> 1), foco ? '#1c1028' : '#ffffff', foco ? null : '#1c1028', 'centro');
}
// después de pintar: ¿se ha tocado algún botón o se ha pulsado una tecla de menú?
function atiendeBotones() {
  const n = PANT.acciones.length;
  if (UI.toque) {
    const { x, y } = UI.toque;
    for (let i = 0; i < n; i++) { const a = PANT.rects[i * 4], b = PANT.rects[i * 4 + 1]; if (x >= a - 1 && x < a + PANT.rects[i * 4 + 2] + 1 && y >= b - 1 && y < b + PANT.rects[i * 4 + 3] + 1) { PANT.foco = i; play('select'); PANT.acciones[i](); break; } }
  } else if (UI.tecla && n) {
    const t = UI.tecla;
    if (t === 'izq' || t === 'arr') { PANT.foco = (PANT.foco - 1 + n) % n; play('tick'); }
    else if (t === 'der' || t === 'aba') { PANT.foco = (PANT.foco + 1) % n; play('tick'); }
    else if (t === 'ok') { const i = Math.min(PANT.foco, n - 1); play('select'); (PANT.directas[i] || PANT.acciones[i])(); }
    else if (t === 'atras' && PANT.atras) { play('tick'); PANT.atras(); }
  }
  UI.toque = null; UI.tecla = null;
}
function velo(a = 0.55) { lx.fillStyle = 'rgba(20,10,34,' + a + ')'; lx.fillRect(0, 0, PW, PH); }

// ---------- el fondo de los menús: la cámara pasea por la pista ----------
function paseo(vel = 26, alto = 30) {
  HZV = HZ;      // en los menús, sin cuestas
  const P = PISTA; if (!P) { lx.fillStyle = '#1c1028'; lx.fillRect(0, 0, PW, PH); return; }
  puenteAntesDePintar(P, null);
  const g = enVia(P, (RELOJ * vel) / P.largo);
  ponCamara(g.x - Math.cos(g.ang) * 30, g.y - Math.sin(g.ang) * 30, g.ang, alto);
  pintaMundo(P, RELOJ);
  for (const c of P.cosas) apunta(c.x, c.y, pintaCosa, c, c.fig ? c.fig.def.medio : 20);
  for (const m of P.monedas) apunta(m.x, m.y, pintaMoneda, m, 4);
  for (const c of P.regalos) apunta(c.x, c.y, pintaRegalo, c, 5);
  apuntaMariposas(P, null);
  pintaVistos();
  modoUI();
}

// ---------- título ----------
function pantallaTitulo() {
  paseo();
  lx.fillStyle = 'rgba(20,10,34,0.35)'; lx.fillRect(0, 0, PW, PH);
  escribeB(lx, 'FANS OF', PW / 2, 14, '#ffffff', '#1c1028', 'centro', 2);
  const bote = Math.round(Math.sin(RELOJ * 3) * 1.5);
  escribeB(lx, 'KARTS', PW / 2 + 2, 35 + bote + 2, '#b3360a', '#1c1028', 'centro', 5);
  escribeB(lx, 'KARTS', PW / 2, 35 + bote, '#ffcb3d', '#1c1028', 'centro', 5);
  escribeB(lx, tr('Microblizz ha comprado la carrera. Gánasela.'), PW / 2, 77, '#ffffff', '#1c1028', 'centro');
  if (pvpAbierto()) { boton('JUGAR', 22, 91, 94, () => ve('piloto'), 18); boton('PVP', 124, 91, 94, () => { KPVP.error = ''; KPVP.aviso = ''; ve('pvp'); }, 18, '#ff5c8a'); }
  else boton('JUGAR', 70, 91, 100, () => ve('piloto'), 18);
  // la tienda y el pase, grandes (se abren en pantallas en grande: tienda-karts.js y pase.js)
  boton('TIENDA', 22, 113, 94, () => abreTienda('destacado'), 16, '#ffcb3d');
  boton('PASE', 124, 113, 94, () => ve('pase'), 16, '#5ef27a');
  if (nivelPase() < KPASE.length && SAVE.xp % KECO.xpNivel >= KECO.xpNivel * 0.8 && Math.sin(RELOJ * 4) > 0) { lx.fillStyle = '#5ef27a'; lx.fillRect(213, 111, 6, 6); }
  const fila = [['AYUDA', () => ve('ayuda'), '#ffcb3d'], ['OPCIONES', () => { ve('opciones'); PANT.vuelve = 'titulo'; }, '#ffcb3d'], ['TUTORIAL', empiezaTutorial, '#5ef27a'], ['BIBLIOTECA', () => { location.href = '../../'; }, '#22e3ff']];
  fila.forEach(([t, f, c], i) => boton(t, 5 + i * 58, 133, 56, f, 13, c));
  // sin el tutorial hecho, el botón de TUTORIAL parpadea en verde
  if (!tutoHecho() && Math.sin(RELOJ * 5) > -0.2) { lx.strokeStyle = '#5ef27a'; lx.lineWidth = 1; lx.strokeRect(120.5, 131.5, 59, 16); }
  mini(lx, tr('PROTOTIPO') + ' ' + VERSION, 4, 152, '#bdb6d6', '#1c1028');
  mini(lx, 'ARKIONER Y PEPINS', PW - 4, 152, '#bdb6d6', '#1c1028', 'der');
  PANT.atras = null;
}

// ---------- elegir piloto ----------
function barra(x, y, n, color) { for (let i = 0; i < 5; i++) { lx.fillStyle = '#1c1028'; lx.fillRect(x + i * 9, y, 8, 5); lx.fillStyle = i < n ? color : '#3a2a52'; lx.fillRect(x + i * 9 + 1, y + 1, 6, 3); } }
function pantallaPiloto() {
  paseo(18, 34); velo(0.6);
  if (UI.tecla === 'izq' || UI.tecla === 'der') { PANT.piloto = (PANT.piloto + (UI.tecla === 'der' ? 1 : 5)) % 6; play('tick'); UI.tecla = null; }
  if (UI.tecla === 'arr' || UI.tecla === 'aba') UI.tecla = null;
  escribeB(lx, tr('ELIGE PILOTO'), PW / 2, 5, '#ffcb3d', '#1c1028', 'centro');
  JUGABLES.forEach((p, i) => {
    const x = 4 + i * 39, sel = i === PANT.piloto;
    marco(x, 17, 37, 40, sel ? '#4a2f72' : '#2a1840', '#1c1028', sel ? '#ffcb3d' : '#5b3a86');
    figuraDe(p.id).pinta(lx, x + 18, 47, BASE_KART * 0.6, BASE_KART, sel ? RELOJ * 1.6 : Math.PI);
    PANT.acciones.push(() => { PANT.piloto = i; }); PANT.rects.push(x, 17, 37, 40); PANT.directas.push(null);
  });
  const p = JUGABLES[PANT.piloto];
  marco(4, 60, 232, 80);
  figuraJugador(p.id).pinta(lx, 44, 124, BASE_KART, BASE_KART, RELOJ * 1.2);
  escribeB(lx, tr(p.nombre), 84, 65, p.color, '#1c1028', 'izq', 2);
  mini(lx, tr(p.faccion) + ' · ' + tr(p.kart), 84, 82, '#bdb6d6');
  { const t = llevaCos('titulo'); if (t) mini(lx, tr(t.nombre), 44, 64, '#ffcb3d', '#1c1028', 'centro'); }
  escribeLineas(lx, tr(p.lema), 84, 91, 148, '#ffe9a8', null, 'izq', 9);
  [['VEL', p.vel, '#ff8a1f'], ['ACE', p.ace, '#5ef27a'], ['MAN', p.man, '#22e3ff'], ['PESO', p.peso, '#ff5c8a']].forEach(([n, v, c], j) => {
    const x = 84 + (j & 1) * 76, y = 121 + (j >> 1) * 9;
    mini(lx, tr(n), x, y, '#ffffff'); barra(x + 20, y, v, c);
  });
  const n0 = PANT.acciones.length;
  boton('VOLVER', 4, 143, 60, () => ve('titulo'));
  boton('ELEGIR', 150, 143, 86, () => ve('mundo'));
  if (PANT.foco < n0) PANT.foco = n0 + 1;
  PANT.atras = () => ve('titulo');
}

// ---------- la carga: las fotos de los karts que falten y la pista ----------
const EXCUSAS = [
  'Conectando con los servidores… (no hacen falta, pero queda auténtico)',
  'Comprobando que has aceptado las 148 páginas de condiciones…',
  'Descargando el parche del día uno…',
  'Colocando micropagos en las curvas…',
  'Esta pista saldrá cuando esté terminada. O sea: Soon™.',
  'Despidiendo al becario que montó el circuito…',
  'Subiendo el precio de la gasolina virtual…',
];
function empiezaCarga() { encolaJugador(); ve('carga'); PANT.fase = 0; PANT.total = Math.max(1, COLA_FOTOS.length); PANT.frase = (Math.random() * EXCUSAS.length) | 0; }
function pantallaCarga() {
  lx.fillStyle = '#1c1028'; lx.fillRect(0, 0, PW, PH);
  const d = PISTAS[PANT.pista], p = JUGABLES[PANT.piloto];
  escribeB(lx, tr(d.nombre), PW / 2, 22, '#ffcb3d', '#1c1028', 'centro');
  figuraDe(p.id).pinta(lx, PW / 2, 86, BASE_KART, BASE_KART, RELOJ * 2);
  escribeLineas(lx, tr(EXCUSAS[(PANT.frase + Math.floor(PANT.t / 2.2)) % EXCUSAS.length]), PW / 2, 100, 220, '#ffffff', null, 'centro', 10);
  const quedan = COLA_FOTOS.length, f = PANT.fase >= 2 ? 1 : 0.9 * (1 - quedan / PANT.total);
  lx.fillStyle = '#5b3a86'; lx.fillRect(40, 132, 160, 8); lx.fillStyle = '#1c1028'; lx.fillRect(41, 133, 158, 6); lx.fillStyle = '#ffcb3d'; lx.fillRect(42, 134, Math.round(156 * f), 4);
  mini(lx, Math.round(f * 100) + '%', PW / 2, 144, '#bdb6d6', null, 'centro');
  if (PANT.fase === 0) { if (haceFotos(14) === 0) PANT.fase = 1; }
  else if (PANT.fase === 1) PANT.fase = 2;        // un fotograma con la barra casi llena antes del tirón de construir la pista
  else if (PANT.fase === 2) { nuevaCarrera(d, p.id); precalienta(PISTA); PANT.fase = 3; }
  else { ve('carrera'); musica(d.musica); ACUM = 0; }
}

// ---------- la carrera y su pausa ----------
function pantallaCarrera(dt) {
  const C = CARRERA;
  if (PULSOS.pausa) { PULSOS.pausa = false; if (C.estado === 'corre' || C.estado === 'cuenta') { PANT.pausa = !PANT.pausa; PANT.foco = 0; play('tick'); UI.tecla = null; UI.toque = null; } }
  sigueCamara(C.jugador, PANT.pausa ? 0 : dt);
  pintaCarrera(PISTA, C);
  pintaAmbiente(PISTA, PANT.pausa ? 0 : dt);
  if (C.espejo) volteaPantalla();
  pintaMarcador(C, PANT.pausa ? 0 : dt);
  pintaEfectos(C);      // el spam en tu pantalla (objetos-2.js)
  if (TUTO.activo && !PANT.pausa) pintaTuto();
  if (PANT.pausa) {
    velo(0.5); marco(60, 26, 120, 112);
    escribeB(lx, tr('PAUSA'), PW / 2, 32, '#ffcb3d', '#1c1028', 'centro', 2);
    boton('SEGUIR', 70, 54, 100, () => { PANT.pausa = false; });
    if (C.pvp) mini(lx, tr('LA CARRERA SIGUE'), PW / 2, 77, '#ff5c8a', '#1c1028', 'centro'); else boton('EMPEZAR DE NUEVO', 70, 73, 100, () => empiezaCarga());
    if (C.pvp) boton(AJUSTES.mudo ? 'SONIDO: NO' : 'SONIDO: SÍ', 70, 92, 100, cambiaSonido);      // en PvP la carrera no se para: no se sale a Opciones
    else boton('OPCIONES', 70, 92, 100, () => { ve('opciones'); PANT.vuelve = 'carrera'; });
    boton(C.pvp ? (PANT.seguro ? '¿SEGURO? PIERDES PUNTOS' : 'RENDIRSE') : 'SALIR', 70, 111, 100, () => { if (C.pvp && !C.jugador.fin && !PANT.seguro) { PANT.seguro = true; return; } PANT.seguro = false; copaFin(); if (C.pvp) pvpRendirse(); musica('menu'); ve(C.pvp ? 'pvp' : 'titulo'); }, 14, '#ff5c8a');
    PANT.atras = () => { PANT.pausa = false; PANT.seguro = false; };
  } else { PANT.seguro = false; UI.toque = null; UI.tecla = null; }
}

// ---------- resultados ----------
const FRASES_PUESTO = [
  'Has ganado. Microblizz ya ha anunciado un nerf para ti.',
  'Podio. Microblizz te ofrece un contrato en prácticas.',
  'Podio. Microblizz te ofrece un contrato en prácticas.',
  'Microblizz lo llama «éxito de participación».', 'Microblizz lo llama «éxito de participación».', 'Microblizz lo llama «éxito de participación».', 'Microblizz lo llama «éxito de participación».',
  'Último. La culpa es del lag, claro.',
];
function abreResultados() { if (COPA.activa && !CARRERA.pvp) copaSuma(); cierraCrono(); premiosCarrera(); ve('resultado'); PANT.foco = 0; }
// repetir la carrera de la copa desde la salida (gratis): se quitan los puntos que acaba de dar
function repiteDeCopa() { for (const id in COPA.ultimos) COPA.puntos[id] -= COPA.ultimos[id]; COPA.ultimos = {}; COPA.sumada = -1; empiezaCarga(); }
function pantallaResultado() {
  const C = CARRERA, R = C.resultado, yo = R.find(r => r.jugador), gana = R[0];
  if (C.crono) { pantallaCrono(); return; }
  paseo(20, 34); velo(0.66);
  escribeB(lx, tr(yo.puesto === 1 ? '¡HAS GANADO!' : yo.puesto <= 3 && (!C.pvp || R.length >= 3) ? '¡PODIO!' : 'RESULTADOS'), PW / 2, 4, '#ffcb3d', '#1c1028', 'centro', 2);
  marco(4, 22, 134, 96);
  R.forEach((r, i) => {
    const y = 27 + i * 11;
    if (r.jugador) { lx.fillStyle = '#4a2f72'; lx.fillRect(6, y - 2, 130, 11); if (SAVE.vip) { lx.strokeStyle = '#ffcb3d'; lx.strokeRect(6.5, y - 1.5, 129, 10); } }
    escribe(lx, puestoTxt(r.puesto), 9, y, COLOR_PUESTO[i], '#1c1028');
    lx.fillStyle = r.piloto.color; lx.fillRect(31, y + 1, 4, 5);
    escribe(lx, r.nombre || tr(r.piloto.nombre), 38, y, r.jugador ? '#ffffff' : '#d8d2ea', '#1c1028');
    mini(lx, r.ido ? tr('SE FUE') : r.tiempo ? tiempoTxt(r.tiempo) : '--:--', 134, y + 1, r.jugador ? '#ffe9a8' : '#bdb6d6', null, 'der');
  });
  marco(142, 22, 94, 96);
  figuraDe(gana.piloto.id).pinta(lx, 189, 68, BASE_KART * 0.774, BASE_KART, RELOJ * 1.4);
  escribeLineas(lx, '«' + tr(gana.piloto.gana) + '»', 189, 74, 88, '#ffe9a8', null, 'centro', 9);
  const nl = escribeLineas(lx, tr(C.pvp ? FRASES_PUESTO[yo.puesto === 1 ? 0 : yo.puesto === R.length ? 7 : yo.puesto <= 3 ? 1 : 3] : FRASES_PUESTO[yo.puesto - 1]), PW / 2, 120, 232, '#ffffff', '#1c1028', 'centro', 9);
  const com = Math.max(0, yo.monedas - 1);
  if (C.pvp) pvpResultadoExtra();
  if (C.gana) mini(lx, trf('+%1 ORO · +%2 XP DE PASE', C.gana.oro, C.gana.xp) + (C.pvp ? '' : ' · ' + trf('COMISIÓN DE MICROBLIZZ: %1', com)), PW / 2, nl < 2 ? 133 : 137, '#bdb6d6', '#1c1028', 'centro');
  if (C.pvp) {
    pvpBotonesResultado();      // otra carrera, la copa online o salir (pvp-copa.js)
  } else if (COPA.activa) {
    boton('ABANDONAR', 4, 144, 72, () => { copaFin(); musica('menu'); ve('mundo'); }, 13, '#ff5c8a');
    boton('REINTENTAR', 80, 144, 72, repiteDeCopa, 13, '#22e3ff');
    boton('CLASIFICACIÓN', 156, 144, 80, () => { musica('menu'); ve('copa'); }, 13, '#5ef27a');
    if (PANT.foco === 0 && yo.puesto > 3 && PANT.t < 0.05) PANT.foco = 1;
  } else {
    boton(yo.puesto > 3 ? 'REINTENTAR' : 'OTRA VEZ', 4, 144, 74, () => empiezaCarga(), 13, yo.puesto > 3 ? '#22e3ff' : '#ffcb3d');
    boton('OTRA PISTA', 83, 144, 74, () => { musica('menu'); ve(TUTO.activo ? 'mundo' : 'pista'); }, 13);
    boton('MENÚ', 162, 144, 74, () => { musica('menu'); ve('titulo'); }, 13);
  }
  PANT.atras = null;
}

// ---------- opciones y cómo se juega ----------
// de Opciones se vuelve al título o, si se abrió desde la pausa, a la carrera (que sigue en pausa)
function salDeOpciones() { const a = PANT.vuelve; ve(a === 'carrera' ? 'carrera' : 'titulo'); if (a === 'carrera') PANT.pausa = true; PANT.vuelve = 'titulo'; }
function cambiaGiro() { AJUSTES.giro = !AJUSTES.giro; guardaAjustes(); PANT.nota = ''; if (AJUSTES.giro) inclActiva(); else inclApaga(); }
function instalaJuego() { PANT.nota = INSTALAR.instala() || 'Sigue los pasos de la ventana del navegador.'; }
function pantallaCompleta() {
  const d = document, e = d.documentElement;
  try {
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else if (e.requestFullscreen) e.requestFullscreen().catch(() => { PANT.nota = 'Este navegador no deja poner la pantalla completa.'; });
    else if (e.webkitRequestFullscreen) e.webkitRequestFullscreen();
    else PANT.nota = 'Este navegador no deja poner la pantalla completa. Prueba a instalar el juego: se abre sin barras.';
  } catch (_) { PANT.nota = 'Este navegador no deja poner la pantalla completa.'; }
}
function cambiaPantalla() {
  AJUSTES.pantalla = AJUSTES.pantalla === 'auto' ? 'horizontal' : AJUSTES.pantalla === 'horizontal' ? 'vertical' : 'auto'; guardaAjustes(); ajusta();
  PANT.nota = !ENT.tactil ? 'Esto solo cambia en el móvil.' : AJUSTES.pantalla === 'horizontal' ? 'Coge el móvil tumbado, con la parte de arriba hacia la izquierda.' : AJUSTES.pantalla === 'vertical' ? 'Coge el móvil de pie.' : 'El juego se coloca según tengas el móvil.';
}
function cambiaEnvoltorio() {
  AJUSTES.envoltorio = envoltorio() === 'regalo' ? 'gashapon' : 'regalo'; guardaAjustes();
  PANT.nota = envoltorio() === 'gashapon' ? 'Los objetos salen de cápsulas de gashapon, con su zanahoria de premio dentro.' : 'Los objetos salen de regalos con lazo.';
}
// la imagen: HD (el mundo al doble de puntos) o clásica (como una consola portátil de 2001, y gasta mucho menos)
function cambiaCalidad() {
  AJUSTES.calidad = AJUSTES.calidad === 'clasica' ? 'hd' : 'clasica'; guardaAjustes(); ponCalidad(AJUSTES.calidad === 'clasica' ? 1 : 2);
  PANT.nota = CAL === 2 ? 'Imagen HD: el doble de puntos. Gasta más batería; si tu móvil no puede, vuelve sola a la clásica.' : 'Imagen clásica: como una consola portátil de 2001. Gasta mucho menos.';
}
function pantallaOpciones() {
  paseo(18, 34); velo(0.66); marco(4, 4, 232, 152);
  escribeB(lx, tr('OPCIONES'), 10, 9, '#ffcb3d', '#1c1028');
  boton('VOLVER', 172, 6, 60, salDeOpciones, 13, '#22e3ff');
  if (CUENTA.activa) boton(CUENTA.invitado ? 'CUENTA: GUARDAR' : 'CUENTA', 74, 6, 94, abreCuenta, 13);   // la cuenta de la serie (js/cuenta.js)
  const A = 8, B = 128, w = 116, w2 = 104;      // dos columnas: la de la izquierda, algo más ancha (lleva los textos largos)
  boton(IDIOMA_K === 'es' ? 'IDIOMA: ESPAÑOL' : 'LANGUAGE: ENGLISH', A, 24, w, () => ponIdioma(IDIOMA_K === 'es' ? 'en' : 'es'));
  boton(trf('NIVEL: %1', tr(dificultad().nombre)), B, 24, w2, () => { AJUSTES.dificultad = (AJUSTES.dificultad + 1) % 3; guardaAjustes(); });
  boton(AJUSTES.mudo ? 'SONIDO: NO' : 'SONIDO: SÍ', A, 41, w, cambiaSonido);
  boton(AJUSTES.sinMusica ? 'MÚSICA: NO' : 'MÚSICA: SÍ', B, 41, w2, cambiaMusica);
  boton(AJUSTES.autoGas === 'si' ? 'ACELERA SOLO: SÍ' : AJUSTES.autoGas === 'no' ? 'ACELERA SOLO: NO' : 'ACELERA SOLO: AUTO', A, 58, w, () => {
    AJUSTES.autoGas = AJUSTES.autoGas === 'auto' ? 'si' : AJUSTES.autoGas === 'si' ? 'no' : 'auto'; guardaAjustes(); ENT.autoGas = AJUSTES.autoGas === 'si' || (AJUSTES.autoGas === 'auto' && ENT.tactil);
  });
  boton(!AJUSTES.giro ? 'GIROSCOPIO: NO' : INCL.estado === 'si' ? 'GIROSCOPIO: SÍ' : INCL.estado === 'pide' || INCL.estado === 'no' ? 'GIROSCOPIO: …' : 'GIROSCOPIO: NO VA', B, 58, w2, NADA, 14, '#ffcb3d', cambiaGiro);
  boton('PANTALLA COMPLETA', A, 75, w, NADA, 14, '#ffcb3d', pantallaCompleta);
  boton(INSTALAR.yaInstalada() ? 'YA INSTALADO' : 'INSTALAR', B, 75, w2, NADA, 14, '#ffcb3d', instalaJuego);
  boton(trf('JUGAR EN: %1', tr(AJUSTES.pantalla === 'horizontal' ? 'HORIZONTAL' : AJUSTES.pantalla === 'vertical' ? 'VERTICAL' : 'AUTO')), A, 92, w, cambiaPantalla);
  boton(envoltorio() === 'gashapon' ? 'OBJETOS: GASHAPON' : 'OBJETOS: REGALOS', B, 92, w2, cambiaEnvoltorio);
  boton(AJUSTES.calidad === 'clasica' ? 'IMAGEN: CLÁSICA' : 'IMAGEN: HD', A, 109, w, cambiaCalidad);
  // la nota de abajo: lo último que haya que explicar (cómo instalar, qué pasa con el giroscopio…)
  escribeLineas(lx, tr(PANT.nota || inclTexto() || 'Instálalo para abrirlo como una app y jugar sin internet.'), 10, 128, 220, '#ffe9a8', null, 'izq', 9);
  PANT.atras = salDeOpciones;
}
function pantallaAyuda() {
  paseo(18, 34); velo(0.7); marco(4, 4, 232, 152);
  escribeB(lx, tr('CÓMO SE JUEGA'), 10, 9, '#ffcb3d', '#1c1028');
  const f = [
    ['#22e3ff', 'Dedos:', 'botones en pantalla. El kart acelera solo.'],
    ['#22e3ff', 'Teclado:', 'flechas para conducir. Espacio: derrape. X: objeto. Esc: pausa.'],
    ['#ff8a1f', 'Derrape:', 'mantén DERRAPE mientras giras. Cuando salten chispas azules o naranjas, suelta: ¡miniturbo!'],
    ['#ffcb3d', 'Oro:', 'cada moneda te hace más rápido (hasta 10). Si te dan, pierdes tres.'],
    ['#ff5c8a', envoltorio() === 'gashapon' ? 'Gashapon:' : 'Regalos:', 'dan un objeto por ruleta. Cuanto más atrás vas, mejores salen.'],
    ['#5ef27a', 'Salida turbo:', 'aprieta justo antes del ¡YA! Si te adelantas mucho: Error 37.'],
  ];
  let y = 24;
  for (const [c, t, d] of f) {     // el título de cada consejo va en color, en la misma línea que su texto
    const tit = tr(t), ls = lineas(tit + ' ' + tr(d), 220);
    ls.forEach((l, i) => escribe(lx, l, 10, y + i * 9, '#ffffff', null));
    escribe(lx, tit, 10, y, c, null);
    y += ls.length * 9 + 3;
  }
  boton('VOLVER', 172, 6, 60, () => ve('titulo'), 13);
  PANT.atras = () => ve('titulo');
}

function pintaPantalla(dt) {
  energiaVista();
  modoUI();
  htmlKartsVista();      // la tienda y el pase en grande se quitan al salir de ellos (tienda-karts.js)
  pvpSalaVista(dt);      // la sala de espera, la de amigos y los mensajes rápidos (pvp-sala.js)
  PANT.acciones.length = 0; PANT.rects.length = 0; PANT.directas.length = 0; PANT.t += dt;
  if (PANT.id === 'carrera') pantallaCarrera(dt);
  else if (PANT.id === 'titulo') pantallaTitulo();
  else if (PANT.id === 'piloto') pantallaPiloto();
  else if (PANT.id === 'mundo') pantallaMundo();
  else if (PANT.id === 'pista') pantallaPista();
  else if (PANT.id === 'copa') pantallaCopa();
  else if (PANT.id === 'podio') pantallaPodio();
  else if (PANT.id === 'carga') pantallaCarga();
  else if (PANT.id === 'resultado') pantallaResultado();
  else if (PANT.id === 'opciones') pantallaOpciones();
  else if (PANT.id === 'ayuda') pantallaAyuda();
  else if (PANT.id === 'pvp') pantallaPvp();
  else if (PANT.id === 'pvp-busca') pantallaPvpSala(dt);
  else if (PANT.id === 'pvp-amigos') pantallaPvpAmigos();
  else if (PANT.id === 'pvp-copa') pantallaPvpCopa();
  else if (PANT.id === 'pvp-clasif') pantallaPvpClasif(dt);
  else if (PANT.id === 'tienda') pantallaTienda();
  else if (PANT.id === 'pase') pantallaPase();
  if (PANT.id !== 'carrera' && PANT.id !== 'carga') pintaPremios();      // ¡DESBLOQUEADO!, nivel del pase… (economia.js)
  atiendeBotones();
}
