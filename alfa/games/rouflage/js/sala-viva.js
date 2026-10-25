// Fans of Rouflage · LA SALA VIVA (opción A del boceto, elegida por Daniel el 25-10-2026): en la sala CON AMIGOS, mientras se espera, todos
// están DENTRO del escenario del anfitrión a pantalla completa, cada uno con su colado: se mueven, se congelan, se pintan (el taller de
// siempre) y usan su habilidad o la granada SIN LÍMITE (se recargan solas). Es el juego de verdad en una fase propia, 'sala': sin reloj, sin
// becarios, sin bots y sin misiones ni logros (misionEvento no cuenta nada aquí). El escenario se hace mapa con mapa-escenario.js.
// La red es la del PvP (pvp-sync.js: estado e, piel p, granada gr, ropa rp, habilidades hb/tl…) por un canal aparte de la sala, 'esp-' + sala,
// para no mezclarse con el de la partida. Cada plaza es el número de sala de cada uno (orden): igual en todos los navegadores. Arriba, el código,
// cuántos sois e INVITAR; abajo, OPCIONES (la caja de siempre de la sala, como un cajón), el chat y EMPEZAR. Lo llama pvpPintaBusca.
'use strict';

const SV = { activo: false, codigo: '', datosTxt: '', modoTxt: '', jugTxt: '', tGr: 0, ui: null, n: 0, vuelve: 0 };
const SV_MSG = new Set(['e', 'p', 'gr', 'gs', 'rp', 'hb', 'tl', 'sz', 'sc', 'st']);      // lo que se escucha en la sala (el resto es de la partida); sc y st son solo de aquí: cambio de papel y disparo
const SV_ESPERA = 3;      // segundos, como mucho, entre usos de la habilidad
const enSalaViva = () => J.fase === 'sala';

// ¿toca sala viva? Sala con amigos esperando a empezar
const salaVivaVale = i => !!(i && i.privada && i.estado === 'espera' && i.sala);

function salaVivaPaso(i, soyAnf) {
  const p = E('p-busca');
  if (!salaVivaVale(i)) { p.classList.remove('viva', 'cajon', 'charla', 'taller'); return; }      // al empezar la partida se ve la caja de siempre (rfpEmpieza lo limpia todo)
  const datos = SALA_ESP.datos || SALA_ESP_VACIA;
  if (!SV.activo || SV.codigo !== i.codigo || J.fase !== 'sala') salaVivaEntra(i, datos);
  else {
    if (JSON.stringify(datos) !== SV.datosTxt) salaVivaMapa(datos, false);
    salaVivaGente(i);
  }
  const modo = soyAnf ? MODO_ELEGIDO : (i.modo || {}), mt = JSON.stringify(modo);
  if (mt !== SV.modoTxt) { const antes = SV.modoTxt; SV.modoTxt = mt; modoPon(modo); if (antes) { talentosReparte(); salaVivaInfinito(); } }      // el anfitrión ha cambiado algo (CON TALENTOS o CLÁSICO, sobre todo)
  p.classList.add('viva');
  salaVivaPintaUI(i, soyAnf);
}

// entrar: el escenario como mapa, mi colado, los de la sala y el canal
function salaVivaEntra(i, datos) {
  limpiaPartida();
  Object.assign(SV, { activo: true, codigo: i.codigo, jugTxt: '', modoTxt: '', tGr: 0, n: 0, vuelve: 0 });
  salaVivaMapa(datos, true);
  J.pvp = true; J.fase = 'sala'; J.tFase = 0; J.modo = 'camaleon'; J.t = 0; J.reloj = 0;
  const red = RFRED.red;
  Object.assign(RFP, { activo: true, lobby: true, red, sala: i.sala, slots: [], yo: -1, host: 0, soyHost: false, mandoListo: false, rx: {}, ido: {}, listos: new Set(), n: 0, tEnvio: 0, tIA: 0,
    cerrado: false, resultado: null, redEstado: '', vuelta: false, sinPiel: false, modoMandado: RFP.modoMandado });
  RFP.canal = red.canal('esp-' + i.sala, rfpRecibe, est => { RFP.redEstado = est; });
  salaVivaGente(i);
  const mio = (i.jugadores || []).find(j => j.yo), soyAnf = !!mio && mio.orden === i.anfitrion, modo = soyAnf ? MODO_ELEGIDO : (i.modo || {});
  SV.modoTxt = JSON.stringify(modo); modoPon(modo);
  talentosReparte(); salaVivaInfinito();
  PIDE_ROPA.n = 0; PIDE_ROPA.t = 0.5; rfpMandaRopa(true);
  if (typeof chatSalaPliega === 'function' && !CHATS.plegado) chatSalaPliega(true);      // el chat empieza recogido: se abre con su botón
  document.body.classList.add('sala-viva');
  avanzaCamara(0, true); refrescaHud(true);
}
// el escenario hecho mapa; si cambia mientras se espera (el anfitrión ha movido algo), los que estaban se quedan donde estaban (o al lado, si ahora hay un mueble)
function salaVivaMapa(datos, inicial) {
  SV.datosTxt = JSON.stringify(datos);
  cargaMapa(mapaDeEscenario(datos));
  try { const f = MAPA.fondo, [cv, c] = lienzo(MINI_ANCHO, Math.round(MINI_ANCHO * f.height / f.width)); c.imageSmoothingQuality = 'high'; c.drawImage(f, 0, 0, cv.width, cv.height); MINIS_MAPA[MAPA_ESC.id] = cv.toDataURL('image/jpeg', 0.75); } catch (_) { /* sin miniatura */ }      // para el selector de mapas (pvp-mapas.js)
  if (inicial) return;
  for (const e of J.entes) { const [x, y] = sitioLibreCerca(e.x, e.y); e.x = x; e.y = y; }
}
// quién hay: los nuevos entran (cada uno en su plaza, la de su número de sala) y los que se van desaparecen
function salaVivaGente(i) {
  const jug = (i.jugadores || []).slice().sort((a, b) => a.orden - b.orden), txt = jug.map(j => j.orden + ':' + j.nombre).join('|');
  if (txt === SV.jugTxt) return;
  SV.jugTxt = txt;
  const vivos = new Set(jug.map(j => j.orden));
  for (const sl of RFP.slots) if (sl && sl.humano && !vivos.has(sl.s)) salaVivaQuita(sl);
  if (J.yo && !jug.some(j => j.yo)) return;      // (no debería pasar: la lista siempre me trae a mí)
  let nuevo = false;
  for (const j of jug) {
    const s = j.orden | 0; if (s < 0 || s > 40) continue;
    while (RFP.slots.length <= s) RFP.slots.push({ s: RFP.slots.length, humano: false, vacio: true });      // huecos: plazas de gente que ya se fue
    const nombre = j.nombre || ('Fan#' + (s + 1)), viejo = RFP.slots[s];
    if (viejo && viejo.humano && viejo.nombre === nombre && viejo.yo === !!j.yo) continue;
    if (viejo && viejo.humano) salaVivaQuita(viejo);      // en esa plaza hay ahora otra persona (en la red de pruebas los números se reparten de nuevo)
    const tipo = NOMBRES[j.animal] ? j.animal : 'bunny', sl = { s, humano: true, clase: 'camaleon', tipo, nombre, mana: 0, yo: !!j.yo, ropaFiada: 'ropa' in j, ropaSrv: j.ropa };
    RFP.slots[s] = sl; delete RFP.ido[s];
    if (sl.yo && J.yo) { sl.ente = J.yo; J.yo.slot = s; RFP.yo = s; continue; }      // yo sigo siendo yo, aunque cambie de plaza
    const [x, y] = sitioLibreCerca(...SALIDA_CAMALEONES[s % SALIDA_CAMALEONES.length]);      // cada plaza en su sitio del corro
    const e = nuevoEnte('camaleon', tipo, sl.nombre, x, y); e.slot = s; e.humano = true; sl.ente = e;
    if (sl.yo) { e.jugador = true; J.yo = e; RFP.yo = s; J.cuenta = e.pts; vistePartida(e, ropaPartida()); }
    else { e.remoto = true; RFP.rx[s] = RELOJ; nuevo = true; if (sl.ropaFiada) { vistePartida(e, sl.ropaSrv || {}); sl.ropaOk = true; } }
  }
  // al que llega le cuento lo mío: la ropa y la habilidad, y mi piel si estoy congelado
  if (nuevo && J.yo && J.fase === 'sala') { PIDE_ROPA.n = 0; rfpMandaRopa(true); if (J.yo.congelado) rfpMandaPiel(J.yo); }
}
function salaVivaQuita(sl) {
  const e = sl.ente;
  if (e && e !== J.yo) { for (const L of [J.entes, J.camaleones, J.cazadores]) { const k = L.indexOf(e); if (k >= 0) L.splice(k, 1); } }
  RFP.slots[sl.s] = { s: sl.s, humano: false, vacio: true };
}
// la habilidad y la granada no se gastan: siempre quedan usos y la espera es corta
function salaVivaInfinito() {
  const yo = J.yo; if (!yo) return;
  if (yo.hab) { yo.habUsos = 99; yo.habEspera = Math.min(yo.habEspera || 0, SV_ESPERA); }
  if (!yo.hab || yo.hab === 'granada') yo.granada = Math.max(yo.granada || 0, yo.invis > 0 ? 0 : 1);
}

// cada fotograma (desde rfpPaso): mando dónde estoy, pido la ropa que falte y recargo la habilidad
function salaVivaAvanza(dt) {
  if (!RFP.buscando || !salaVivaVale(RFP.info)) { if (!RFP.info || RFP.info.estado === 'espera') salaVivaSale(); return; }      // te has ido de la sala (o se ha cerrado)
  const yo = J.yo; if (!yo) return;
  RFP.tEnvio -= dt;
  if (RFP.tEnvio <= 0) {
    const quieto = yo.congelado || (!yo.moviendo && Math.abs(yo.vx) < 1 && Math.abs(yo.vy) < 1);
    RFP.tEnvio = quieto ? 1 / RFP_AJ.quietoHz : 1 / RFP_AJ.envioHz;
    rfpManda({ t: 'e', x: r1(yo.x), y: r1(yo.y), m: yo.moviendo ? 1 : 0, c: yo.congelado ? 1 : 0, mi: yo.mira, di: Math.round(yo.dir * 100) / 100, ci: 0, f: 0, iv: Math.ceil(yo.invis || 0), k: yo.clase === 'cazador' ? 1 : 0 });      // k: soy becario (para quien acaba de llegar)
  }
  rfpPideRopa(dt);
  if (yo.clase === 'cazador') yo.balas = REGLAS.balas;      // las cartas de despido tampoco se gastan
  if (SV.vuelve > 0 && (SV.vuelve -= dt) <= 0) salaVivaVuelve();
  if (yo.hab) { if (yo.habUsos < 50) yo.habUsos = 99; if (yo.habEspera > SV_ESPERA) yo.habEspera = SV_ESPERA; }
  if ((!yo.hab || yo.hab === 'granada') && !(yo.granada > 0) && !(yo.invis > 0)) { SV.tGr += dt; if (SV.tGr > 1.5) { yo.granada = 1; SV.tGr = 0; } } else SV.tGr = 0;
  // el chat: si se ha recogido con su propia barra, el botón de abajo vuelve a mandar
  const p = E('p-busca'); if (p.classList.contains('charla') && CHATS.plegado) p.classList.remove('charla');
  if (p.classList.contains('taller') !== !!TALLER.abierto) p.classList.toggle('taller', !!TALLER.abierto);
  if (!p.classList.contains('charla') && typeof chatConsejoCierra === 'function' && CHAT_CONSEJO.el && CHAT_CONSEJO.el.closest('.chat-sala')) chatConsejoCierra();      // el consejo del chat señalaba su barra, que aquí está recogida
  if (SV.ui) { const n = CHATS.nuevos || 0, b = SV.ui.chatN; if (b.textContent !== (n ? String(n) : '')) { b.textContent = n ? String(n) : ''; b.hidden = !n; } }
}
// salir de la sala (CANCELAR, o la sala se cierra): al mapa del título
function salaVivaSale() {
  if (!SV.activo) return;
  const enSala = J.fase === 'sala';
  salaVivaApaga();
  if (enSala) { limpiaPartida(); escenaTitulo(); refrescaHud(true); }
}
// lo llama rfpTermina: el canal ya se ha cerrado (sale de la sala, o empieza la partida)
function salaVivaApaga() {
  SV.activo = false; SV.codigo = ''; RFP.lobby = false;
  document.body.classList.remove('sala-viva');
  const p = E('p-busca'); if (p) p.classList.remove('viva', 'cajon', 'charla', 'taller');
}

/* ---------- lo de encima: la barra de arriba, las etiquetas de lo que se juega y la barra de abajo ---------- */
const SV_ICO = {
  atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  opciones: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="#20102c" stroke-width="5" stroke-linecap="round"/><path d="M4 7h16M4 12h16M4 17h16" stroke="#fff6ea" stroke-width="2.4" stroke-linecap="round"/><circle cx="9" cy="7" r="2.6" fill="#ffcb3d" stroke="#20102c" stroke-width="2"/><circle cx="15" cy="12" r="2.6" fill="#ffcb3d" stroke="#20102c" stroke-width="2"/><circle cx="8" cy="17" r="2.6" fill="#ffcb3d" stroke="#20102c" stroke-width="2"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/></svg>',
};
function salaVivaUI() {
  if (SV.ui) return SV.ui;
  const d = document.createElement('div'); d.className = 'sv-ui'; d.id = 'sv-ui';
  d.innerHTML = `<div class="sv-arriba"><button type="button" class="sv-atras" id="sv-atras">${SV_ICO.atras}</button><div class="sv-chip sv-cod"><span></span><b class="ol" id="sv-codigo"></b></div>`
    + `<span class="sv-hueco"></span><div class="sv-chip" id="sv-n"></div><button type="button" class="sv-chip sv-invitar" id="sv-invitar"></button></div>`
    + `<div class="sv-fila2"><div class="sv-etq" id="sv-etq"></div><button type="button" class="sv-papel" id="sv-papel"><i></i><b></b></button></div>`
    + `<div class="sv-abajo"><button type="button" class="sv-b sv-opc" id="sv-opciones">${SV_ICO.opciones}<span></span></button>`
    + `<button type="button" class="sv-b sv-chat" id="sv-chat"></button><button type="button" class="sv-b sv-emp" id="sv-empezar"><b class="ol"></b><small></small></button></div>`;
  E('p-busca').appendChild(d);
  E('sv-chat').innerHTML = (typeof chatIcono === 'function' ? chatIcono('#ffcb3d', false, 30) : '') + '<i class="sv-chat-n" hidden></i>';
  // el cajón de OPCIONES: la caja de siempre de la sala, con su cruz para cerrarla
  const caja = E('p-busca').querySelector(':scope > .caja'), x = document.createElement('button');
  x.type = 'button'; x.className = 'sv-cerrar'; x.id = 'sv-cerrar'; x.innerHTML = SV_ICO.cerrar; caja.prepend(x);
  const cajon = si => { play('select'); E('p-busca').classList.toggle('cajon', si); if (si) E('p-busca').classList.remove('charla'); };
  E('sv-atras').onclick = () => E('b-busca-cancelar').click();
  E('sv-invitar').onclick = () => cajon(true);      // dentro están COMPARTIR ENLACE e INVITAR AMIGOS
  E('sv-opciones').onclick = () => cajon(!E('p-busca').classList.contains('cajon'));
  x.onclick = () => cajon(false);
  E('sv-chat').onclick = () => { play('select'); const p = E('p-busca'), abre = !p.classList.contains('charla'); p.classList.toggle('charla', abre); p.classList.remove('cajon'); if (typeof chatSalaPliega === 'function') chatSalaPliega(!abre); };
  E('sv-papel').onclick = salaVivaCambia;
  E('sv-empezar').onclick = () => { const b = E('b-busca-empezar'); if (!b.hidden && !b.disabled) b.click(); };
  SV.ui = { chatN: d.querySelector('.sv-chat-n') };
  return SV.ui;
}
function salaVivaPintaUI(i, soyAnf) {
  salaVivaUI();
  E('sv-codigo').textContent = i.codigo || '----';
  E('p-busca').querySelector('.sv-cod span').textContent = tr('SALA');
  E('sv-n').textContent = (i.n || 0) + ' / ' + (i.max || 10);
  E('sv-invitar').textContent = tr('INVITAR');
  E('sv-opciones').querySelector('span').textContent = tr('CONFIGURAR PARTIDA');
  E('sv-opciones').setAttribute('aria-label', tr('CONFIGURAR PARTIDA')); E('sv-chat').setAttribute('aria-label', tr('Chat')); E('sv-atras').setAttribute('aria-label', tr('Salir de la sala')); E('sv-cerrar').setAttribute('aria-label', tr('Cerrar'));
  // lo que se va a jugar, en pequeño: el modo, el mapa y con o sin talentos
  const d = soyAnf ? MODO_ELEGIDO : (i.modo || {}), etq = [], m = MODOS[d.m] ? d.m : 'normal';
  etq.push(['', tr(MODOS[m].nombre)]);
  const mapa = typeof mapaDeSala === 'function' && mapaDeSala(d), def = mapa && MAPAS[mapa];
  if (def) etq.push(['', mapa === MAPA_ESC.id ? tr(soyAnf ? 'MI ESCENARIO' : 'ESTE ESCENARIO') : tr(def.nombre)]);
  etq.push([ajusteSala(d.a, 't') === 1 ? 'tal' : '', ajusteSala(d.a, 't') === 1 ? tr('CON TALENTOS') : tr('CLÁSICO')]);
  // el botón de cambiar de papel: dice a cuál pasas
  const caz = !!(J.yo && J.yo.clase === 'cazador'), bp = E('sv-papel');
  if (bp.dataset.caz !== String(caz)) { bp.dataset.caz = String(caz); bp.classList.toggle('caz', !caz); ponIcono(bp.querySelector('i'), caz ? 'pincel' : 'diana'); }
  bp.querySelector('b').textContent = caz ? tr('SER CAMALEÓN') : tr('SER CAZADOR');
  const html = etq.map(([c, t]) => `<span class="sv-e ${c}">${esc(t)}</span>`).join('');
  const caja = E('sv-etq'); if (caja.innerHTML !== html) caja.innerHTML = html;
  // EMPEZAR: el anfitrión lo pulsa; los demás ven a quién esperan
  const b = E('sv-empezar'), faltan = Math.max(0, (salaCuantos(i.modo, (i.jugadores || []).length).total) - (i.jugadores || []).length);
  b.classList.toggle('espera', !soyAnf); b.disabled = !soyAnf;
  const solo = soyAnf && (i.n || 0) < 2; b.classList.toggle('largo', solo);
  b.querySelector('b').textContent = soyAnf ? (solo ? tr('RELLENAR CON BOTS') : tr('EMPEZAR')) : tr('ESPERANDO');      // como siempre: solo, se juega ya con la máquina
  const anf = (i.jugadores || []).find(j => j.orden === i.anfitrion);
  b.querySelector('small').textContent = soyAnf ? (faltan ? tr('El resto, bots: {n}', { n: faltan }) : '') : tr('Lo empieza {n}', { n: anf ? anf.nombre : '' });
}
// los nombres encima de cada colado de la sala (el del anfitrión, en amarillo): lo llama el dibujo (dibujo.js) tras los personajes
function salaVivaNombres(c) {
  if (!enSalaViva() || !RFP.info || TALLER.abierto) return;
  const anf = RFP.info.anfitrion;
  for (const sl of RFP.slots) {
    const e = sl && sl.humano && sl.ente; if (!e || e.clase === 'cazador' || (e !== J.yo && (e.invis > 0 || e.congelado))) continue;      // (el becario ya lleva su nombre)
    rotulo(c, e.nombre || '', e.x, e.y - 74, 12, sl.s === anf ? '#ffcb3d' : e === J.yo ? '#9fd0ff' : '#fff6ea', OL, LETRA_UI);
  }
}

/* ---------- ser becario en la sala: un botón para cambiar de papel; los disparos despiden y el colado vuelve a salir enseguida ---------- */
// cambia el personaje de una plaza (el mío o el de otro) por uno del otro papel, en el mismo sitio y con su ropa
function salaVivaPapel(e, clase) {
  const sl = e && RFP.slots[e.slot]; if (!sl || e.clase === clase) return e;
  for (const L of [J.entes, J.camaleones, J.cazadores]) { const k = L.indexOf(e); if (k >= 0) L.splice(k, 1); }
  const n = nuevoEnte(clase, clase === 'cazador' ? 'becario' : sl.tipo, e.nombre, e.x, e.y);
  Object.assign(n, { slot: e.slot, humano: true, jugador: e.jugador, remoto: e.remoto, red: e.red, mira: e.mira });
  if (clase === 'cazador') { n.balas = REGLAS.balas; n.dir = e.mira < 0 ? Math.PI : 0; }
  sl.ente = n; sl.clase = clase;
  if (n.jugador) { J.yo = n; J.cuenta = n.pts; J.modo = clase; if (TALLER.abierto) cierraTaller(); }
  vistePartida(n, n.jugador ? ropaPartida() : (sl.ropaIds || sl.ropaSrv || {}));
  const papel = papelDe(clase);
  if (talOn()) habPon(n, n.jugador ? talElegida(papel) : ((sl.habs && sl.habs[clase === 'cazador' ? 'b' : 'c']) || habsDe(papel)[0].id), n.jugador ? talNivel(papel) : 1);
  if (n.jugador) { salaVivaInfinito(); refrescaHud(true); }
  return n;
}
function salaVivaCambia() {
  const yo = J.yo; if (!yo || !enSalaViva()) return;
  play('select');
  const n = salaVivaPapel(yo, yo.clase === 'cazador' ? 'camaleon' : 'cazador');
  rfpManda({ t: 'sc', c: n.clase });
  RFP.tEnvio = 0;
  pista(n.clase === 'cazador' ? tr('Toca a un colado para despedirlo. Aquí no se gastan las cartas.') : tr('Vuelves a ser colado: píntate y congélate'), 3);
}
// lo de la sala que llega de los demás (antes que lo de siempre, pvp-sync.js). Devuelve true si ya está hecho
function salaVivaRecibe(sl, m) {
  if (m.t === 'rp' && m.r) sl.ropaIds = m.r;      // (para vestirle igual si cambia de papel)
  if (m.t === 'e' && m.k !== undefined && sl.ente && (sl.ente.clase === 'cazador') !== !!m.k) salaVivaPapel(sl.ente, m.k ? 'cazador' : 'camaleon');
  if (m.t === 'sc') { if (sl.ente && (m.c === 'cazador' || m.c === 'camaleon')) salaVivaPapel(sl.ente, m.c); return true; }
  if (m.t === 'st') {
    const h = sl.ente; if (!h || h.clase !== 'cazador') return true;
    const x = +m.x || 0, y = +m.y || 0; h.dir = Math.atan2(y - h.y + 6, x - h.x); h.mira = Math.cos(h.dir) >= 0 ? 1 : -1; h.tApunta = 0.7;
    fxDisparo(h, x, y);
    const v = m.k >= 0 && RFP.slots[m.k] && RFP.slots[m.k].ente;
    if (v && v.clase === 'camaleon') salaVivaDespedido(v, h); else fxMancha(x, y);
    return true;
  }
  return false;
}
// el disparo del becario en la sala: lo decide quien dispara (aquí no hay anfitrión) y se lo cuenta a todos
function salaVivaDispara(x, y, margen) {
  const yo = J.yo; if (!yo || yo.clase !== 'cazador' || TALLER.abierto) return;
  if (yo.enfria > 0) { play('deny'); return; }
  const ox = yo.x, oy = yo.y - 6;
  if (lejos(ox, oy, x, y) > REGLAS.alcance) { pista(tr('Demasiado lejos: acércate más'), 1.6); play('deny'); return; }
  let sy = y; while (celdaEn(x, sy) === CARA) sy += CEL;
  if (celdaEn(x, sy) !== SUELO || !seVen(ox, oy, x, Math.min(sy, Math.max(y, Math.floor(sy / CEL) * CEL + 3)))) { pista(tr('Ahí no llegas: hay un muro en medio'), 1.6); play('deny'); return; }
  yo.dir = Math.atan2(y - oy, x - ox); yo.mira = Math.cos(yo.dir) >= 0 ? 1 : -1; yo.tApunta = 0.7; yo.enfria = REGLAS.enfria * 0.7;
  fxDisparo(yo, x, y);
  const k = J.camaleones.find(c => !c.fuera && !invisible(c) && dentroDeAlubia(c, x, y, margen));
  rfpManda({ t: 'st', x: Math.round(x), y: Math.round(y), k: k ? k.slot : -1 });
  if (k) salaVivaDespedido(k, yo); else { fxMancha(x, y); play('clank'); }
}
// el sello de despedido (como en la partida), pero nadie queda fuera: el despedido vuelve a salir enseguida en blanco
function salaVivaDespedido(k, por) {
  fxSello(k.x, k.y - 26, por && por.ropa && por.ropa.sello); fxSalpica(k.x, k.y - 26, '#ff4b5c', [14, 10, 6][graficosAdornos()]);
  suenaEn('sello', k.x, k.y, k.jugador || (por && por.jugador) ? 1.3 : 1);
  if (por && por.jugador) avisa(tr('Has despedido a {b}').replace('{b}', k.nombre), 'bueno');
  else if (k.jugador) { avisa(tr('{a} te ha despedido').replace('{a}', por ? por.nombre : ''), 'malo'); CAM.tiembla = 0.35; }
  if (k.jugador && !SV.vuelve) { if (TALLER.abierto) cierraTaller(); if (k.congelado) descongela(k); k.vx = k.vy = 0; SV.vuelve = 1.2; }
}
// el despedido sale otra vez, en blanco y en otro sitio del corro
function salaVivaVuelve() {
  const yo = J.yo; if (!yo || yo.clase !== 'camaleon') return;
  [yo.piel, yo.pctx] = nuevaPiel(BLANCO_PIEL, yo.postura || 'firmes'); yo.pintado = false; yo.camo = 0; if (yo.pasos) yo.pasos.length = 0;
  const p = SALIDA_CAMALEONES[Math.floor(Math.random() * SALIDA_CAMALEONES.length)], [x, y] = sitioLibreCerca(p[0] + rand(-20, 20), p[1] + rand(-20, 20));
  yo.x = x; yo.y = y; vistePartida(yo, ropaPartida()); fxAro(x, y - 20, '#7ee04a'); play('select'); RFP.tEnvio = 0;
}
