// Fans of Karts · PvP, LA SALA DE ESPERA Y LA DE AMIGOS (en grande, HTML encima del juego):
//   · la sala de espera: los 8 huecos con quién los ocupa (con su kart tuneado y su título), votar la pista entre tres (salen de la semilla de
//     la sala, iguales para todos), mensajes rápidos y, en las salas con amigos, el código para compartir y el botón EMPEZAR del anfitrión
//     (una carrera o una copa de 4).
//   · jugar con amigos: crear una sala (código de 4 letras) o entrar en la de otro. El enlace ?sala=CODIGO abre esta pantalla con el código puesto.
//   · por el canal de la sala también va lo que lleva puesto cada uno ('look') y los mensajes rápidos ('chat'; solo se manda el número de la frase).
'use strict';

const FRASES_RAPIDAS = ['GG', '¡LAG!', 'FUE EL NERF', 'REVANCHA'];
const SALA = { caja: null, clave: '', tLook: 0, copa: false, aviso: '', voto: null, amigos: null, claveAm: '', codigo: '', url: null, tChat: 0 };
SALA.url = (() => { try { const c = new URLSearchParams(location.search).get('sala'); return c ? c.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) : null; } catch (_) { return null; } })();

// ---------- lo que lleva cada uno ----------
function miLook() {
  const L = llevaPara(JUGABLES[PANT.piloto].id), t = llevaCos('titulo');
  return { lleva: Object.fromEntries(Object.entries(L).filter(([k]) => k !== 'titulo').map(([k, c]) => [k, c.id])), titulo: t ? t.id : null };
}
function pvpMandaLook(pide) { if (KPVP.canal) pvpManda(Object.assign({ t: 'look', pide: pide ? 1 : undefined }, miLook())); }
// la figura de un rival con lo que lleva (solo lo que existe y le sirve a ese piloto)
function figuraLook(id, look) {
  const L = {}; for (const [t, c] of Object.entries((look && look.lleva) || {})) if (COS[c] && COS[c].tipo === t && sirveA(COS[c], id) && t !== 'humo') L[t] = COS[c];
  const k = 'red|' + [id, L.ruedas, L.pintura, L.kart, L.skin].map(c => (c && c.id) || '').join('|');
  if (k === 'red|' + id + '||||') return figuraDe(id);
  return FIGURAS[k] || (FIGURAS[k] = figuraCon(id, L));
}
const humoLook = look => { const h = look && look.lleva && COS[look.lleva.humo]; return h && h.tipo === 'humo' ? h : null; };
function fotoLook(id, look) {
  const f = figuraLook(id, look), k = 'look-' + id + '|' + JSON.stringify((look && look.lleva) || {});
  if (FOTOS[k]) return FOTOS[k];
  const [cv2, x] = lienzo(48, 48); f.pinta(x, 24, 44, BASE_KART * 0.72, BASE_KART, Math.PI); return (FOTOS[k] = aUrl(cv2));
}
// en carrera: el kart del rival se viste en cuanto llega lo que lleva
function pvpAplicaLook(o) {
  const k = KPVP.activo && KPVP.remotos[o], look = KPVP.looks[o];
  if (!k || k.plaza != null || !look) return;
  k.fig = figuraLook(k.piloto.id, look); k.humoCos = humoLook(look);
}
const colorHumoSinRed = colorHumo;
colorHumo = k => {
  const h = k.humoCos; if (!h) return colorHumoSinRed(k);
  if (h.c === 'arcoiris') return ['#ff5c8a', '#ffcb3d', '#5ef27a', '#22e3ff', '#c35cff'][Math.floor(RELOJ * 12) % 5];
  return Math.random() < 0.5 ? h.c[0] : h.c[1];
};
// las fotos de los karts tuneados de los rivales se hacen en la pantalla de carga, como las del tuyo
const encolaJugadorSinRed = encolaJugador;
encolaJugador = () => {
  encolaJugadorSinRed();
  if (!KPVP.activo) return;
  for (const j of KPVP.jugadores) {
    if (j.orden === KPVP.orden || !KPVP.looks[j.orden] || !PILOTO[j.piloto]) continue;
    const f = figuraLook(j.piloto, KPVP.looks[j.orden]); if (f !== figuraDe(j.piloto)) for (let n = 0; n <= 13; n++) COLA_FOTOS.push([f, n]);
  }
};
const pvpPreparaKartsSinLook = pvpPreparaKarts;
pvpPreparaKarts = C => {
  pvpPreparaKartsSinLook(C);
  for (const [o, k] of Object.entries(KPVP.remotos)) {
    if (k.plaza != null) continue;
    pvpAplicaLook(+o);
    if (KPVP.salidos && KPVP.salidos[o]) { KPVP.listos[o] = true; k.ido = true; }      // en la copa: quien se fue en otra carrera ya no vuelve
  }
};

// ---------- los mensajes rápidos ----------
const nombreOrden = o => { const j = ((KPVP.info && KPVP.info.jugadores) || KPVP.jugadores || []).find(x => x.orden === o); return j ? (j.yo ? tr('TÚ') : String(j.nombre || '')) : '?'; };
function pvpEnviaChat(i) {
  if (!KPVP.canal || RELOJ - SALA.tChat < 1.2) return;
  SALA.tChat = RELOJ; pvpManda({ t: 'chat', f: i });
  KPVP.charla.push({ de: KPVP.orden, f: i, t: RELOJ }); misionSuma('chat');
}
function pvpOyeChat(m) {
  if (!(m.f >= 0 && m.f < FRASES_RAPIDAS.length)) return;
  KPVP.charla.push({ de: m.de, f: m.f, t: RELOJ }); if (KPVP.charla.length > 12) KPVP.charla.shift();
  if (PANT.id === 'carrera') comenta(nombreOrden(m.de) + ': ' + tr(FRASES_RAPIDAS[m.f]));
  else play('tick');
}
const charlaReciente = s => KPVP.charla.filter(c => RELOJ - c.t < s);

// lo que llega por el canal antes de lo de la carrera: lo que lleva cada uno, los mensajes, la copa y lo de otras carreras de la copa (se tira)
const pvpRecibirSinSala = pvpRecibir;
pvpRecibir = m => {
  if (!m || m.de == null || m.de === KPVP.orden) return;
  if (m.t === 'look') { KPVP.looks[m.de] = { lleva: m.lleva || {}, titulo: m.titulo || null }; pvpAplicaLook(m.de); if (m.pide) pvpMandaLook(); return; }
  if (m.t === 'chat') { pvpOyeChat(m); return; }
  if (m.t === 'sigue') { pvpCopaSigue(m.i); return; }
  if (m.t === 'rendir' && !KPVP.activo) { if (KPVP.salidos) KPVP.salidos[m.de] = true; return; }
  if (m.cr != null && m.cr !== (KPVP.carrera || 0)) return;
  pvpRecibirSinSala(m);
};
const pvpEmpezarSinSala = pvpEmpezar;
pvpEmpezar = (info, red) => {
  KPVP.semilla = info.semilla | 0; KPVP.privada = !!info.privada; KPVP.salidos = {};
  pvpEmpezarSinSala(info, red);
  if (info.privada) misionSuma('amigos');
};

// ---------- la sala de espera ----------
// las tres pistas a votar (salen de la semilla: todos ven las mismas)
// si alguien de la sala tiene el pase premium (info.premium), la tercera es de la Edición Premium
function pvpOpcionesPista(info) {
  const ids = PISTAS.filter(p => p.mundo > 0 && !p.premium).map(p => p.id), az = azarDe(((info && info.semilla) | 0) + 999), out = [];
  const prem = PISTAS.filter(p => p.premium).map(p => p.id), n = info && info.premium ? 2 : 3;
  while (out.length < n && ids.length) out.push(ids.splice(Math.floor(az() * ids.length), 1)[0]);
  if (info && info.premium && prem.length) out.push(prem[Math.floor(az() * prem.length)]);
  return out;
}
// al entrar en una sala, el juego dice si tiene el pase premium (una vez por sala)
function pvpDicePremium(info) {
  if (!info || !info.sala || SALA.premSala === info.sala || !KRED.red.premium) return;
  SALA.premSala = info.sala;
  KRED.red.premium(!!SAVE.premium).then(r => { if (r && r.sala === info.sala && r.estado === 'espera' && KPVP.busca) KPVP.info = r; }).catch(() => { /* servidor antiguo */ });
}
function fotoMapa(d) { const k = 'mapa-' + d.id; if (FOTOS[k]) return FOTOS[k]; const m = miniDePista(d); return m ? (FOTOS[k] = aUrl(m)) : null; }
function votaPista(id) {
  SALA.voto = id;
  KRED.red.votar(id).then(r => { if (r && r.sala && r.estado === 'espera' && KPVP.busca) KPVP.info = r; }).catch(() => { /* el sondeo lo arregla */ });
}
function empiezaSala() {
  SALA.aviso = '';
  KRED.red.empezar(SALA.copa).catch(e => { SALA.aviso = KRED.errorTexto(e); });
}
function compartirSala(codigo) {
  const url = location.origin + location.pathname + '?sala=' + codigo, txt = trf('¡Únete a mi sala de Fans of Karts! Código: %1', codigo);
  if (navigator.share) { navigator.share({ title: 'Fans of Karts', text: txt, url }).catch(() => { /* cancelado */ }); return; }
  try { navigator.clipboard.writeText(txt + ' ' + url).then(() => { SALA.aviso = tr('Enlace copiado: pégaselo a tus amigos.'); }); } catch (_) { SALA.aviso = url; }
}
function pintaSalaHtml(arranca) {
  if (!SALA.caja) { SALA.caja = el('section.kt-scr', { id: 'kt-sala' }); document.body.appendChild(SALA.caja); }
  const info = KPVP.info, lista = info ? info.jugadores || [] : [{ orden: 0, nombre: '', piloto: JUGABLES[PANT.piloto].id, yo: true }];
  const priv = !!(info && info.privada), soyAnf = priv && info.anfitrion === info.orden, dicho = {};
  for (const c of charlaReciente(5)) dicho[c.de] = c.f;
  let estado;
  if (arranca) estado = tr('¡A CORRER!') + ' · ' + tr(PISTAS[PANT.pista].nombre);
  else if (!info) estado = tr('BUSCANDO CARRERA') + '…';
  else if (priv) estado = soyAnf ? tr('Cuando estéis todos, pulsa EMPEZAR.') : tr('Esperando a que el anfitrión empiece.');
  else if (info.faltan != null) estado = info.faltan > 0 ? trf('Empieza en %1 s (o al llenarse)', info.faltan) : tr('Arrancando…');
  else estado = tr('Esperando a otro jugador…');
  const plaza = i => {
    const j = lista[i];
    if (!j) return el('div.kt-plaza.vacia', {}, el('span', {}, tr('MÁQUINA')));
    const look = j.yo ? miLook() : KPVP.looks[j.orden], tit = look && look.titulo && COS[look.titulo];
    return el('div.kt-plaza' + (j.yo ? '.yo' : ''), {},
      dicho[j.orden] != null ? el('div.kt-bocadillo', {}, tr(FRASES_RAPIDAS[dicho[j.orden]])) : null,
      img(j.yo ? fotoPiloto(j.piloto) : fotoLook(j.piloto, look)),
      el('b', {}, j.yo ? tr('TÚ') : String(j.nombre || '').slice(0, 12)),
      tit ? el('small', {}, tr(tit.nombre)) : null,
      priv && j.orden === info.anfitrion ? el('i', {}, tr('ANFITRIÓN')) : null);
  };
  const votos = (info && info.votos) || {}, mio = (lista.find(j => j.yo) || {}).voto || SALA.voto;
  const w = el('div.kt-wrap', { style: 'max-width:720px' },
    priv ? el('div.kt-codigo', {}, el('span', {}, tr('CÓDIGO DE LA SALA')), el('b.kt-d.ol', {}, info.codigo || '----'),
      el('button.kt-btn', { 'data-k': 1, on: () => compartirSala(info.codigo) }, tr('COMPARTIR'))) : null,
    el('div.kt-estado.kt-d.ol' + (arranca ? '.ya' : ''), {}, estado),
    !info && !arranca ? el('p.kt-nota', {}, tr(KPVP.tBusca > 40 ? 'Microblizz asegura que hay «millones de jugadores activos».' : 'Buscando a otros jugadores. Como mucho un minuto y salimos.')) : null,
    soyAnf && !arranca ? el('div.kt-anfitrion', {},
      el('button.kt-btn' + (SALA.copa ? '.verde' : '.gris'), { 'data-k': 1, on: () => { SALA.copa = !SALA.copa; } }, tr(SALA.copa ? 'COPA DE 4 CARRERAS' : 'UNA CARRERA')),
      el('button.kt-btn.oro', { 'data-k': 1, on: empiezaSala }, tr('EMPEZAR'))) : null,
    SALA.aviso ? el('div.kt-aviso', { style: 'text-align:center;margin-top:6px' }, SALA.aviso) : null,
    el('div.kt-plazas', {}, [0, 1, 2, 3, 4, 5, 6, 7].map(plaza)),
    info && !arranca ? [
      el('div.kt-rapidas', {}, FRASES_RAPIDAS.map((f, i) => el('button.kt-btn.gris', { 'data-k': 1, on: () => pvpEnviaChat(i) }, tr(f)))),
      el('div.kt-h3.ol', {}, tr('VOTA LA PISTA')),
      el('div.kt-votos', {}, pvpOpcionesPista(info).map(id => {
        const d = PISTAS.find(p => p.id === id), mapa = fotoMapa(d);
        return el('button.kt-voto' + (mio === id ? '.mio' : '') + (d.premium ? '.premium' : ''), { 'data-k': 1, on: () => votaPista(id), style: '--mundo:' + (d.premium ? '#ffcb3d' : MUNDOS[d.mundo - 1].color) },
          mapa ? img(mapa) : null, el('b', {}, tr(d.nombre)), el('small', {}, tr(d.premium ? 'EDICIÓN PREMIUM' : MUNDOS[d.mundo - 1].nombre)), el('span.ol', {}, trf('VOTOS: %1', votos[id] || 0)));
      })),
      info.premium ? el('p.kt-nota.premium', {}, tr(SAVE.premium ? 'Tienes el pase premium: toda la sala puede votar una pista de la Edición Premium.' : 'Alguien de la sala tiene el pase premium: hoy podéis votar una pista de la Edición Premium.')) : null,
      el('p.kt-nota', {}, tr('Gana la más votada. Si nadie vota, elige el servidor.'))] : null);
  SALA.caja.replaceChildren(el('header.kt-head', {}, el('button.kt-back', { 'data-k': 1, on: pvpCancelar }, tr('SALIR')),
    el('h2.kt-d.ol', {}, tr(priv ? 'SALA CON AMIGOS' : 'CARRERA ONLINE')), el('div.kt-cuantos.kt-d.ol', {}, (info ? info.n : 1) + '/8')), el('main.kt-body', {}, w));
  SALA.caja.hidden = false; NAV.raiz = null;
}
function pantallaPvpSala(dt) {
  paseo(22, 34); velo(0.4); calmaLienzo();
  KPVP.tBusca += dt;
  const info = KPVP.info;
  if (info && info.estado === 'espera') pvpDicePremium(info);
  if (info && info.orden != null && !KPVP.activo) KPVP.orden = info.orden;
  const arranca = KPVP.activo && PANT.encontrado > 0;
  if (arranca) { PANT.encontrado -= dt; if (PANT.encontrado <= 0) { SALA.caja.hidden = true; musica('menu'); empiezaCarga(); return; } }
  SALA.tLook -= dt; if (SALA.tLook <= 0 && KPVP.canal) { SALA.tLook = 3; pvpMandaLook(); }
  const clave = JSON.stringify([info, KPVP.looks, charlaReciente(5).length, arranca, SALA.copa, SALA.aviso, SALA.voto, Math.floor(KPVP.tBusca / 40)]);
  if (clave !== SALA.clave || !SALA.caja || SALA.caja.hidden) { SALA.clave = clave; pintaSalaHtml(arranca); }
  if (KPREMIOS.length) return;
  navega(SALA.caja, pvpCancelar);
}

// ---------- jugar con amigos: crear sala o entrar con un código ----------
function pintaAmigosHtml() {
  if (!SALA.amigos) { SALA.amigos = el('section.kt-scr', { id: 'kt-amigos' }); document.body.appendChild(SALA.amigos); }
  const caja = el('input.kt-input.kt-d', { 'data-k': 1, maxlength: 4, value: SALA.codigo, placeholder: 'ABCD', autocapitalize: 'characters', autocomplete: 'off', spellcheck: 'false', 'aria-label': tr('CÓDIGO DE LA SALA') });
  const entrar = () => {
    const c = (caja.value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    if (c.length !== 4) { KPVP.error = 'El código tiene 4 letras.'; play('deny'); return; }
    SALA.codigo = c; SALA.copa = false; SALA.voto = null; pvpBuscar({ codigo: c });
  };
  caja.oninput = () => { caja.value = caja.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); SALA.codigo = caja.value; };
  caja.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); entrar(); } };
  const p = JUGABLES[PANT.piloto];
  const w = el('div.kt-wrap', { style: 'max-width:560px' },
    el('div.kt-amigo', {}, el('h3.kt-d.ol', {}, tr('CREAR SALA')),
      el('p', {}, tr('Te damos un código de 4 letras para tus amigos. Hasta 8 jugadores; los huecos, la máquina.')),
      el('button.kt-btn.verde.ancho', { 'data-k': 1, on: () => { SALA.copa = false; SALA.voto = null; pvpBuscar({ crear: true }); } }, tr('CREAR SALA'))),
    el('div.kt-amigo', {}, el('h3.kt-d.ol', {}, tr('ENTRAR CON UN CÓDIGO')),
      el('p', {}, tr('Escribe el código que te han pasado.')),
      el('div.kt-fila-cod', {}, caja, el('button.kt-btn.oro', { 'data-k': 1, on: entrar }, tr('ENTRAR')))),
    KPVP.error ? el('div.kt-aviso', {}, tr(KPVP.error)) : null,
    el('div.kt-amigo.kt-quien', {}, img(fotoPiloto(p.id)), el('p', {}, trf('Corres con %1. Para cambiar de piloto, vuelve atrás.', tr(p.nombre)))),
    el('p.kt-nota', {}, tr('Las salas con amigos no gastan caos ni dan puntos de liga. Microblizz las llama «contenido social».')));
  SALA.amigos.replaceChildren(el('header.kt-head', {}, el('button.kt-back', { 'data-k': 1, on: () => ve('pvp') }, tr('VOLVER')), el('h2.kt-d.ol', {}, tr('JUGAR CON AMIGOS')), el('div')), el('main.kt-body', {}, w));
  SALA.amigos.hidden = false; NAV.raiz = null;
}
function pantallaPvpAmigos() {
  paseo(18, 34); velo(0.4); calmaLienzo();
  const clave = KPVP.error + '|' + PANT.piloto;
  if (!SALA.amigos || SALA.amigos.hidden || clave !== SALA.claveAm) { SALA.claveAm = clave; pintaAmigosHtml(); }
  if (KPREMIOS.length) return;
  navega(SALA.amigos, () => ve('pvp'));
}

// ---------- la barra de mensajes rápidos en los resultados (y en la copa) ----------
const CHARLA = el('div', { id: 'kt-charla', hidden: true }); document.body.appendChild(CHARLA);
let CHARLA_VISTA = '';
function charlaVista() {
  const ver = (PANT.id === 'resultado' || PANT.id === 'pvp-copa') && CARRERA && CARRERA.pvp && !!KPVP.canal && !KPREMIOS.length;
  CHARLA.hidden = !ver; if (!ver) return;
  const lista = charlaReciente(8).slice(-3), k = lista.map(c => c.de + ':' + c.f + ':' + c.t).join('|');
  if (k === CHARLA_VISTA && CHARLA.childElementCount) return;
  CHARLA_VISTA = k;
  CHARLA.replaceChildren(el('div.kt-dichos', {}, lista.map(c => el('div', {}, el('b', {}, nombreOrden(c.de) + ': '), tr(FRASES_RAPIDAS[c.f])))),
    el('div.kt-rapidas', {}, FRASES_RAPIDAS.map((f, i) => el('button.kt-btn.gris', { on: () => { pvpEnviaChat(i); CHARLA_VISTA = ''; } }, tr(f)))));
}

// ---------- cada fotograma: quitar lo que no toca, cerrar el canal al salir del PvP y el enlace ?sala= ----------
function pvpSalaVista(dt) {
  if (SALA.caja && PANT.id !== 'pvp-busca' && !SALA.caja.hidden) SALA.caja.hidden = true;
  if (SALA.amigos && PANT.id !== 'pvp-amigos' && !SALA.amigos.hidden) SALA.amigos.hidden = true;
  if (SALA.url && PANT.id === 'titulo') { SALA.codigo = SALA.url; SALA.url = null; KPVP.error = ''; ve('pvp-amigos'); }
  if (KPVP.canal && !KPVP.busca && !KPVP.activo && !['resultado', 'pvp-copa', 'carga', 'carrera', 'pvp-busca'].includes(PANT.id)) pvpCierraCanal();
  charlaVista();
  pvpCopaPaso(dt);
}
