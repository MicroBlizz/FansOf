// Fans of Rouflage · LA SALA VIVA (opción A del boceto, elegida por Daniel el 25-10-2026): en la sala CON AMIGOS, mientras se espera, todos
// están DENTRO del escenario del anfitrión a pantalla completa, cada uno con su colado: se mueven, se congelan, se pintan (el taller de
// siempre) y usan su habilidad o la granada SIN LÍMITE (se recargan solas). Es el juego de verdad en una fase propia, 'sala': sin reloj, sin
// becarios, sin bots y sin misiones ni logros (misionEvento no cuenta nada aquí). El escenario se hace mapa con mapa-escenario.js.
// La red es la del PvP (pvp-sync.js: estado e, piel p, granada gr, ropa rp, habilidades hb/tl…) por un canal aparte de la sala, 'esp-' + sala,
// para no mezclarse con el de la partida. Cada plaza es el número de sala de cada uno (orden): igual en todos los navegadores. Arriba, el código,
// cuántos sois e INVITAR; abajo, OPCIONES (la caja de siempre de la sala, como un cajón), el chat y EMPEZAR. Lo llama pvpPintaBusca.
'use strict';

const SV = { activo: false, codigo: '', datosTxt: '', modoTxt: '', jugTxt: '', tGr: 0, ui: null, n: 0 };
const SV_MSG = new Set(['e', 'p', 'gr', 'gs', 'rp', 'hb', 'tl', 'sz']);      // lo que se escucha en la sala (el resto es de la partida)
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
  Object.assign(SV, { activo: true, codigo: i.codigo, jugTxt: '', modoTxt: '', tGr: 0, n: 0 });
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
    rfpManda({ t: 'e', x: r1(yo.x), y: r1(yo.y), m: yo.moviendo ? 1 : 0, c: yo.congelado ? 1 : 0, mi: yo.mira, di: 0, ci: 0, f: 0, iv: Math.ceil(yo.invis || 0) });
  }
  rfpPideRopa(dt);
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
    + `<div class="sv-etq" id="sv-etq"></div>`
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
  E('sv-opciones').querySelector('span').textContent = tr('OPCIONES');
  E('sv-opciones').setAttribute('aria-label', tr('OPCIONES')); E('sv-chat').setAttribute('aria-label', tr('Chat')); E('sv-atras').setAttribute('aria-label', tr('Salir de la sala')); E('sv-cerrar').setAttribute('aria-label', tr('Cerrar'));
  // lo que se va a jugar, en pequeño: el modo, el mapa y con o sin talentos
  const d = soyAnf ? MODO_ELEGIDO : (i.modo || {}), etq = [], m = MODOS[d.m] ? d.m : 'normal';
  etq.push(['', tr(MODOS[m].nombre)]);
  const mapa = typeof mapaDeSala === 'function' && mapaDeSala(d), def = mapa && MAPAS[mapa];
  if (def) etq.push(['', tr(def.nombre)]);
  etq.push([ajusteSala(d.a, 't') === 1 ? 'tal' : '', ajusteSala(d.a, 't') === 1 ? tr('CON TALENTOS') : tr('CLÁSICO')]);
  const html = etq.map(([c, t]) => `<span class="sv-e ${c}">${esc(t)}</span>`).join('');
  const caja = E('sv-etq'); if (caja.innerHTML !== html) caja.innerHTML = html;
  // EMPEZAR: el anfitrión lo pulsa; los demás ven a quién esperan
  const b = E('sv-empezar'), faltan = Math.max(0, (salaCuantos(i.modo, (i.jugadores || []).length).total) - (i.jugadores || []).length);
  b.classList.toggle('espera', !soyAnf); b.disabled = !soyAnf;
  b.querySelector('b').textContent = soyAnf ? tr('EMPEZAR') : tr('ESPERANDO');
  const anf = (i.jugadores || []).find(j => j.orden === i.anfitrion);
  b.querySelector('small').textContent = soyAnf ? (faltan ? tr('El resto, bots: {n}', { n: faltan }) : '') : tr('Lo empieza {n}', { n: anf ? anf.nombre : '' });
}
// los nombres encima de cada colado de la sala (el del anfitrión, en amarillo): lo llama el dibujo (dibujo.js) tras los personajes
function salaVivaNombres(c) {
  if (!enSalaViva() || !RFP.info || TALLER.abierto) return;
  const anf = RFP.info.anfitrion;
  for (const sl of RFP.slots) {
    const e = sl && sl.humano && sl.ente; if (!e || (e !== J.yo && (e.invis > 0 || e.congelado))) continue;
    rotulo(c, e.nombre || '', e.x, e.y - 74, 12, sl.s === anf ? '#ffcb3d' : e === J.yo ? '#9fd0ff' : '#fff6ea', OL, LETRA_UI);
  }
}
