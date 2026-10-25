// Fans of Rouflage (prototipo) · PvP, LAS PANTALLAS: el menú del PvP (con el caos primordial y la cuenta), la sala llenándose (quién hay y qué papel te toca), la clasificación, la
// explicación y la ventana de la cuenta. Todo en HTML encima del lienzo (index.html); aquí se rellena y se conecta. La lógica está en pvp.js y pvp-sync.js.
'use strict';

// ---------- la cuenta: la fila de core (guardar con Google o email, entrar, cerrar sesión) en una ventana ----------
const CAJA_CUENTA = document.createElement('section'); CAJA_CUENTA.id = 'rf-cuenta'; CAJA_CUENTA.className = 'screen modal'; CAJA_CUENTA.hidden = true;
document.body.appendChild(CAJA_CUENTA);
function abreCuenta() {
  if (!window.filaCuenta) return;
  CAJA_CUENTA.innerHTML = '<div class="modal-card"><h3 class="ol">' + tr('CUENTA') + '</h3><div class="opt-list"></div><button class="btn-ghost ol" id="rf-cuenta-ok">' + tr('VOLVER') + '</button></div>';
  CAJA_CUENTA.querySelector('.opt-list').appendChild(window.filaCuenta);
  CAJA_CUENTA.hidden = false;
  E('rf-cuenta-ok').onclick = () => { play('select'); CAJA_CUENTA.hidden = true; if (!E('p-pvp').hidden) pvpPintaMenu(); };
}
hook('cuenta', () => { if (!CAJA_CUENTA.hidden) abreCuenta(); });

// ---------- el menú ----------
function pvpMuestra(id) {
  pantalla(id);
  if (id === 'p-pvp') pvpPintaMenu();
  else if (id === 'p-amigos') pvpPintaAmigos();
  else if (id === 'p-busca') pvpPintaBusca();
}
function pvpPintaMenu() {
  const err = E('pvp-error'); err.hidden = !RFP.error; err.textContent = RFP.error ? tr(RFP.error) : '';
  E('b-pvp-buscar-t').textContent = rfpSalaGuardada() ? tr('VOLVER A LA PARTIDA') : tr('BUSCAR PARTIDA');      // si te dejaste una partida abierta, buscar te devuelve a ella
  E('b-pvp-cuenta').hidden = RFRED.esLocal() || RFRED.vinculada();
  pvpPendientes(); tutoConsejoPvp();
}
// partidas de las que te retiraste de espectador: cómo acabaron y qué te tocó (el servidor te las apunta cuando alguien cierra la sala; se cuentan una sola vez)
function pvpPendientes() {
  const caja = E('pvp-pendiente'); if (!RFRED.red.pendientes || !RFRED.vinculada()) return;
  Promise.resolve(RFRED.red.pendientes()).then(lista => {
    if (!Array.isArray(lista) || !lista.length) return;
    caja.hidden = false;
    caja.textContent = lista.map(p => p.abandono ? tr('Abandonaste una partida') + ' · ' + p.delta + ' ' + tr('puntos') : (p.gano ? tr('Tu bando ganó la partida que dejaste') : tr('Tu bando perdió la partida que dejaste')) + ' · ' + (p.delta > 0 ? '+' : '') + p.delta + ' ' + tr('puntos') + (p.energia_premio > 0 ? ' · +' + p.energia_premio + ' ' + tr('de caos primordial') : '')).join('\n');
    setTimeout(() => { caja.hidden = true; }, 12000);
  }).catch(() => { /* sin red: ya saldrá la próxima vez */ });
}
const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// jugar con amigos: solo hay que enseñar el error, si lo hay (sin cuenta vinculada, código malo, sala llena…)
function pvpPintaAmigos() {
  const err = E('amigos-error'); err.hidden = !RFP.error; err.textContent = RFP.error ? tr(RFP.error) : '';
  if (!RFRED.esLocal() && !RFRED.conSesion()) { err.hidden = false; err.textContent = tr(RFRED.errorTexto(new Error('cuenta_no_vinculada'))); }
}
// compartir la sala con amigos: el enlace abre el juego con el código puesto (con la hoja de compartir del móvil, o copiado)
function pvpCompartir() {
  const i = RFP.info; if (!i || !i.codigo) return;
  const url = (typeof refEnlace === 'function' ? refEnlace : x => x)(location.origin + location.pathname + '?sala=' + i.codigo), txt = tr('¡Únete a mi sala de Fans of Rouflage! Código: {c}', { c: i.codigo });
  if (navigator.share) { navigator.share({ title: 'Fans of Rouflage', text: txt, url }).catch(() => { /* cancelado */ }); return; }
  const listo = () => { E('busca-sub').textContent = tr('Enlace copiado: pégaselo a tus amigos.'); };
  try { navigator.clipboard.writeText(txt + ' ' + url).then(listo, () => { E('busca-sub').textContent = url; }); } catch (_) { E('busca-sub').textContent = url; }
}
// la sala: quién hay y, cuando arranca, el papel de cada uno
function pvpPintaBusca() {
  const i = RFP.info, lista = E('busca-lista');
  chatSalaPaso(i);      // el chat de la sala de espera (chat-sala.js)
  if (!i) { E('busca-titulo').textContent = tr('BUSCANDO PARTIDA'); E('busca-sub').textContent = ''; lista.innerHTML = ''; return; }
  const jug = i.jugadores || [], jugando = i.estado !== 'espera', mio = jug.find(j => j.yo), priv = !!i.privada, soyAnf = priv && !!mio && mio.orden === i.anfitrion;
  E('busca-titulo').textContent = jugando ? tr('¡EMPIEZA LA PARTIDA!') : tr('SALA: {n} DE {max}', { n: i.n, max: i.max });
  E('busca-sub').textContent = jugando ? (mio && mio.rol === 'cazador' ? tr('Te toca de CAZADOR') : tr('Te toca de CAMALEÓN'))
    : priv ? (soyAnf ? (i.n >= 2 ? tr('Cuando estéis todos, pulsa EMPEZAR.') : tr('Elige modo y pulsa RELLENAR CON BOTS para jugar ya, o pásales el código a tus amigos.')) : tr('Esperando a que el anfitrión empiece.'))
    : i.modo ? tr('Empieza en {t} s. Si no hay gente suficiente, la máquina rellena con bots.', { t: i.faltan || 0 })
    : i.faltan != null ? tr('Empieza en {t} s, o en cuanto se llene', { t: i.faltan }) : tr('Esperando a otro jugador. Mientras estás solo, el reloj no corre.');
  // la sala con amigos: el código grande para compartir y el botón EMPEZAR del anfitrión
  salaEspPaso(i, soyAnf);      // con amigos: la sala de espera es el escenario del anfitrión (sala-escenario.js)
  salaVivaPaso(i, soyAnf);      // …y se juega dentro de él a pantalla completa (sala-viva.js)
  E('busca-codigo').hidden = !priv || jugando; E('busca-codigo-n').textContent = i.codigo || '----';
  const be = E('b-busca-empezar'); be.hidden = !soyAnf || jugando; be.textContent = i.n < 2 ? tr('RELLENAR CON BOTS') : tr('EMPEZAR');      // solo en la sala: la máquina rellena el resto y se juega ya
  const err = E('busca-error'); err.hidden = !RFP.error; err.textContent = RFP.error ? tr(RFP.error) : '';
  const hueco = Math.max(0, (priv && !jugando ? salaCuantos(i.modo, jug.length).total : i.max || 10) - jug.length);      // con amigos, los que eligió el anfitrión
  lista.innerHTML = jug.map(j => `<li class="${j.yo ? 'yo' : ''}"><i class="${j.rol === 'cazador' ? 'caz' : j.rol === 'camaleon' ? 'cam' : 'esp'}"></i><span>${esc(j.nombre)}</span>${priv && j.orden === i.anfitrion ? `<em>${tr('ANFITRIÓN')}</em>` : ''}${j.rol ? `<small>${j.rol === 'cazador' ? tr('CAZADOR') : tr('CAMALEÓN')}</small>` : ''}</li>`).join('')
    + (hueco ? `<li class="maquina"><i class="esp"></i><span>${tr('+ {n} de la máquina', { n: hueco })}</span></li>` : '');
  E('b-busca-cancelar').hidden = jugando;
  E('busca-modo').classList.toggle('publica', !priv);
  pvpPintaModo(priv ? !jugando : !!i.modo, soyAnf);      // en la pública se ve el modo que ha tocado (sin tocarlo) y, al arrancar, todo lo que se juega
  pvpPintaVoto(!priv && !!i.modo && !jugando && i.votos);
  talPintaSala();      // las habilidades que llevas (talentos-pantalla.js)
}
// la votación de la sala pública: EMPEZAR YA o +60 S. Gana el botón con más de la mitad de los votos; con empate se vota otra vez; tras ganar +60 S, 30 s sin votar
function pvpPintaVoto(ver) {
  const caja = E('busca-voto'); caja.hidden = !ver; if (!ver) return;
  const v = RFP.info.votos, libre = v.libre > 0;
  for (const [k, b] of [['ya', E('b-voto-ya')], ['mas', E('b-voto-mas')]]) {
    b.disabled = libre; b.classList.toggle('puesto', v.yo === k); b.setAttribute('aria-pressed', String(v.yo === k));
    E('voto-' + k).textContent = v[k] || 0;
  }
  E('voto-nota').textContent = RFP.votoError ? tr(RFP.votoError) : libre ? tr('Ha ganado +60 S. Se puede volver a votar en {n} s.', { n: v.libre })
    : v.empate ? tr('¡Empate! Se vota otra vez.') : tr('Gana el botón con más de la mitad de los votos.');
}
// tocar un botón vota; tocar otra vez el tuyo quita el voto
function pvpVota(k) {
  const i = RFP.info; if (!i || !i.votos || i.votos.libre > 0) return;
  play('select');
  const antes = i.votos.yo, nuevo = antes === k ? null : k;
  if (antes) i.votos[antes] = Math.max(0, (i.votos[antes] || 0) - 1);
  if (nuevo) i.votos[nuevo] = (i.votos[nuevo] || 0) + 1;
  i.votos.yo = nuevo; pvpPintaBusca();
  Promise.resolve(RFRED.red.voto && RFRED.red.voto(nuevo)).then(r => {
    if (r && r.sala && RFP.info && RFP.info.sala === r.sala && r.estado === 'espera') { RFP.info.votos = r.votos; RFP.info.faltan = r.faltan; pvpPintaBusca(); }
  }).catch(e => { RFP.votoError = RFRED.errorTexto(e); pvpPintaBusca(); setTimeout(() => { RFP.votoError = ''; if (!E('p-busca').hidden) pvpPintaBusca(); }, 3000); });
}
// el modo de la sala con amigos (modos.js): el anfitrión lo cambia con las flechas y los interruptores y el servidor se lo enseña a los demás
function pvpPintaModo(ver, soyAnf) {
  const caja = E('busca-modo'); caja.hidden = !ver; if (!ver) return;
  if (soyAnf && !RFP.modoMandado) { RFP.modoMandado = true; MODO_ELEGIDO.a = MODO_ELEGIDO.a || {}; MODO_ELEGIDO.a.t = talEstado().pvp ? 1 : 0; if (!MODO_ELEGIDO.mapa && typeof MAPA_ESC !== 'undefined' && MAPAS[MAPA_ESC.id]) MODO_ELEGIDO.mapa = MAPA_ESC.id; pvpMandaModo(); }      // sin mapa elegido (antes, AL AZAR): MI ESCENARIO      // recién abierta la sala: el modo de la última vez, con o sin talentos según el selector del PvP (talentos-pantalla.js)
  const vp = RFP.info && !RFP.info.privada ? salaPublicaModo(RFP.info) : null, azar = !!vp && !MODOS[vp.d.m];      // BUSCAR PARTIDA: solo lo que de verdad se jugará (pvp-mapas.js)
  const d = soyAnf ? MODO_ELEGIDO : vp ? vp.d : (RFP.info && RFP.info.modo) || { m: 'normal', x: {} }, m = MODOS[d.m] ? d.m : 'normal';
  caja.classList.toggle('mira', !soyAnf);
  E('busca-modo-n').textContent = azar ? tr('AL AZAR') : tr(MODOS[m].nombre); E('busca-modo-t').textContent = [azar ? '' : tr(MODOS[m].texto), vp && !vp.sabe ? tr('Las reglas de la sala se sortean al empezar la partida.') : ''].filter(Boolean).join(' ');
  pvpPintaMapas(d, soyAnf);
  const ex = E('busca-extras'), otros = Object.keys(EXTRAS).filter(k => !EXTRAS[k].luz);
  if (ex.dataset.anf !== String(soyAnf) || !ex.children.length) {
    ex.dataset.anf = String(soyAnf);
    // la luz: tres botones, siempre uno marcado (día, normal o apagón); debajo, los extras que se encienden aparte
    ex.innerHTML = `<div class="luz-sala"><small>${esc(tr('LUZ'))}</small><div class="luz-botones">${LUCES_SALA.map(l => `<button type="button" class="luz-b" data-luz="${l.k}" ${soyAnf ? '' : 'disabled'}>${esc(tr(l.nombre))}</button>`).join('')}</div><p class="nota-sala modo-texto" id="luz-texto"></p></div>`
      // las reglas de la sala (modos.js: AJUSTES_SALA), con los mismos botones que la luz
      + Object.keys(AJUSTES_SALA).map(k => `<div class="luz-sala"><small>${esc(tr(AJUSTES_SALA[k].nombre))}</small><div class="luz-botones">${AJUSTES_SALA[k].opciones.map(o => `<button type="button" class="luz-b" data-aj="${k}" data-v="${o.v}" ${soyAnf ? '' : 'disabled'}>${esc(tr(o.nombre))}</button>`).join('')}</div><p class="nota-sala modo-texto">${esc(tr(AJUSTES_SALA[k].texto))}</p></div>`).join('')
      + otros.map(k => `<label><input type="checkbox" id="x-${k}" ${soyAnf ? '' : 'disabled'}><span>${esc(tr(EXTRAS[k].nombre))}<small>${esc(tr(EXTRAS[k].texto))}</small></span></label>`).join('');
    if (soyAnf) {
      for (const b of ex.querySelectorAll('.luz-b[data-aj]')) b.onclick = () => { play('select'); MODO_ELEGIDO.a = MODO_ELEGIDO.a || {}; MODO_ELEGIDO.a[b.dataset.aj] = +b.dataset.v; if (b.dataset.aj === 't') { talEstado().pvp = b.dataset.v === '1'; guardaPartida(); talPintaCola(); } pvpMandaModo(); };      // TALENTOS es el mismo selector que el de fuera
      for (const b of ex.querySelectorAll('.luz-b[data-luz]')) b.onclick = () => { play('select'); for (const l of LUCES_SALA) if (l.k) delete MODO_ELEGIDO.x[l.k]; if (b.dataset.luz) MODO_ELEGIDO.x[b.dataset.luz] = 1; pvpMandaModo(); };
      for (const k of otros) E('x-' + k).onchange = ev => { play('select'); if (ev.target.checked) MODO_ELEGIDO.x[k] = 1; else delete MODO_ELEGIDO.x[k]; pvpMandaModo(); };
    }
  }
  const luz = luzDe(d);
  for (const b of ex.querySelectorAll('.luz-b[data-aj]')) { const si = ajusteSala(d.a, b.dataset.aj) === +b.dataset.v; b.classList.toggle('puesto', si); b.setAttribute('aria-pressed', String(si)); }
  for (const b of ex.querySelectorAll('.luz-b[data-luz]')) { const si = b.dataset.luz === luz; b.classList.toggle('puesto', si); b.setAttribute('aria-pressed', String(si)); }
  E('luz-texto').textContent = tr(LUCES_SALA.find(l => l.k === luz).texto);
  for (const k of otros) { const on = !!(d.x && d.x[k]); E('x-' + k).checked = on; E('x-' + k).closest('label').classList.toggle('on', on); }
  salaPublicaFiltra(ex, vp);
}
function pvpMandaModo() {
  modoElegidoGuarda();
  const i = RFP.info; if (i && i.privada) i.modo = { m: MODO_ELEGIDO.m, x: Object.assign({}, MODO_ELEGIDO.x), a: Object.keys(MODO_ELEGIDO.a || {}).length ? Object.assign({}, MODO_ELEGIDO.a) : undefined, mapa: MODO_ELEGIDO.mapa || undefined };
  if (RFRED.red.modo) Promise.resolve(RFRED.red.modo(RFP.info && RFP.info.modo)).catch(() => { /* se reintenta al cambiarlo otra vez */ });
  if (!E('p-busca').hidden) pvpPintaBusca();
}
function pvpCambiaModo(paso) {
  const lista = Object.keys(MODOS), i = Math.max(0, lista.indexOf(MODO_ELEGIDO.m));
  MODO_ELEGIDO.m = lista[(i + paso + lista.length) % lista.length]; play('select'); pvpMandaModo();
}
// la clasificación (los 20 primeros y tu sitio)
function pvpClasificacion() {
  pantalla('p-clasif'); E('clasif-lista').innerHTML = ''; E('clasif-yo').textContent = tr('Cargando…');
  Promise.resolve(RFRED.red.clasificacion()).then(r => {
    const y = r && r.yo; E('clasif-yo').textContent = y ? tr('Tienes {p} puntos (puesto {n})', { p: y.puntos, n: y.puesto }) : tr('Todavía no has jugado ninguna partida PvP.');
    E('clasif-lista').innerHTML = ((r && r.lista) || []).map((f, k) => `<li class="${f.yo ? 'yo' : ''}"><span class="pos">${k + 1}</span><span class="nom">${esc(f.nombre)}<small>${tr('{g} ganadas de {j}', { g: f.ganadas, j: f.jugadas })}</small></span><b>${f.puntos}</b></li>`).join('');
  }).catch(e => { E('clasif-yo').textContent = tr(RFRED.errorTexto(e)); });
}
// los puntos que ha dado la partida, en la pantalla final (llegan del servidor un poco después)
function pvpResultadoExtra() {
  const p = E('fin-pvp'), r = RFP.resultado; if (!p || !J.pvp || !r) return;
  p.hidden = false; p.classList.toggle('mal', !!r.error);
  p.textContent = r.error ? tr(r.error) : r.privada ? tr('Sala con amigos: no cuenta para la clasificación') : r.delta != null && r.puntos != null ? tr('PvP: {p} puntos ({d})', { p: r.puntos, d: (r.delta >= 0 ? '+' : '') + r.delta }) : '';
}

function preparaPvp() {
  E('b-pvp').onclick = () => { audioInit(); play('select'); RFP.error = ''; pvpMuestra('p-pvp'); };
  E('b-cuenta').onclick = () => { play('select'); abreCuenta(); };
  E('b-pvp-cuenta').onclick = () => { play('select'); abreCuenta(); };
  E('b-pvp-buscar').onclick = () => { if (tutoFaltan().length && !rfpSalaGuardada()) { play('deny'); return; } play('select'); pvpBuscar(); };      // cerrado hasta jugar con los dos bandos (tutorial.js)
  // jugar con amigos: crear una sala o entrar con el código (el enlace ?sala=CODIGO abre esta pantalla con el código puesto)
  const caja = E('amigos-codigo');
  const entrar = () => {
    const c = (caja.value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    if (c.length !== 4) { RFP.error = 'El código tiene 4 letras.'; pvpPintaAmigos(); play('deny'); return; }
    play('select'); caja.blur(); pvpBuscar({ codigo: c });
  };
  caja.oninput = () => { caja.value = caja.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); };
  caja.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); entrar(); } ev.stopPropagation(); };
  caja.onkeyup = ev => ev.stopPropagation();
  E('b-pvp-amigos').onclick = () => { play('select'); RFP.error = ''; pvpMuestra('p-amigos'); };
  E('b-amigos-crear').onclick = () => { play('select'); pvpBuscar({ crear: true }); };
  E('b-amigos-entrar').onclick = entrar;
  E('b-amigos-volver').onclick = () => { play('select'); RFP.error = ''; pvpMuestra('p-pvp'); };
  E('b-busca-empezar').onclick = () => { play('select'); pvpEmpezar(); };
  E('b-voto-ya').onclick = () => pvpVota('ya'); E('b-voto-mas').onclick = () => pvpVota('mas');
  E('b-busca-compartir').onclick = () => { play('select'); pvpCompartir(); };
  E('b-pvp-bots').onclick = () => { play('select'); pvpBuscar({ crear: true }); };      // jugar contra bots: tu propia sala, para elegir modo y rellenar con la máquina
  E('b-modo-ant').onclick = () => pvpCambiaModo(-1); E('b-modo-sig').onclick = () => pvpCambiaModo(1);

  E('b-pvp-clasif').onclick = () => { play('select'); pvpClasificacion(); };
  E('b-pvp-info').onclick = () => { play('select'); pantalla('p-pvp-info'); };
  E('b-pvp-volver').onclick = () => { play('select'); irTitulo(); };
  E('b-busca-cancelar').onclick = () => { play('select'); pvpCancelar(); };
  E('b-clasif-volver').onclick = () => { play('select'); pvpMuestra('p-pvp'); };
  E('b-info-ok').onclick = () => { play('select'); pvpMuestra('p-pvp'); };
}
// al arrancar (tras el título): ?pvp=local o ?pvp=abrir entra directo en el menú del PvP (para probar); ?sala=CODIGO, en JUGAR CON AMIGOS con el código puesto
function pvpEntradaDirecta() {
  try {
    const q = new URLSearchParams(location.search), c = q.get('sala');
    if (c) { E('amigos-codigo').value = c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); pvpMuestra('p-amigos'); }
    else if (q.get('pvp') === 'local' || q.get('pvp') === 'abrir') pvpMuestra('p-pvp');
  } catch (_) { /* da igual */ }
}
