// Fans of Rouflage · LOS PODERES DEL FANTASMA: quien se queda sin jugar (colado despedido o becario sin cartas) no solo mira: lleva UN poder para
// echar una mano a los suyos y, cada vez que lo usa, cambia a otro al azar (nunca repite el que acaba de usar; el botón ya enseña el siguiente).
// Entre usos hay espera (PODER.cada; AVISAR, la suya corta). Los de colado molestan a los becarios o ayudan a otro colado; los de becario
// ayudan a encontrar colados. Lo que dejan en el mapa (vaho, charco, foco) y sus dibujos están en fantasma-efectos.js; los iconos, en fantasma-iconos.js.
// Se dispara con el botón PODER (o Espacio / Q). En el PvP se avisa a todos con `fp` (AVISAR, con `bz`, baliza.js) y cada navegador se lo aplica
// a lo SUYO: a su propio personaje o, el anfitrión, a los de la máquina. Quien cambia una piel (retoque, soplo) la vuelve a mandar.
'use strict';

// papel: de quién es el fantasma. alcance: a qué distancia tiene que estar el objetivo (0: se usa donde estás). a: a quién (becario o colado)
const PODERES = {
  apagon: { papel: 'colado', nombre: 'APAGÓN', n: 'Apagón', alcance: 150, a: 'becario', dura: 1, d: 'Apagas la linterna de un becario 1 s.', pista: 'Apagón: acércate a un becario y apágale la linterna 1 segundo' },
  silbido: { papel: 'colado', nombre: 'SILBIDO', n: 'Silbido falso', alcance: 0, d: 'Los becarios van a mirar donde estás.', pista: 'Silbido falso: silba desde donde estés y los becarios irán a mirar ahí' },
  mano: { papel: 'colado', nombre: 'MANO FRÍA', n: 'Mano fría', alcance: 110, a: 'becario', dura: 2, d: 'Le tiembla la linterna a un becario 2 s.', pista: 'Mano fría: toca a un becario y le temblará la linterna 2 segundos' },
  retoque: { papel: 'colado', nombre: 'RETOQUE', n: 'Retoque', alcance: 130, a: 'colado', d: 'Mejoras el camuflaje de un colado cercano.', pista: 'Retoque: acércate a un colado escondido y mejora su camuflaje' },
  vaho: { papel: 'colado', nombre: 'VAHO', n: 'Vaho', alcance: 0, dura: 3, d: 'Una nube fría tapa las linternas 3 s.', pista: 'Vaho: echas una nube fría donde estás que tapa las linternas 3 segundos' },
  charco: { papel: 'colado', nombre: 'CHARCO', n: 'Charco', alcance: 0, d: 'El becario que lo pisa va más lento.', pista: 'Charco: dejas un charco de pintura y el becario que lo pise irá más lento' },
  susto: { papel: 'colado', nombre: 'SUSTO', n: 'Susto', alcance: 120, a: 'becario', dura: 1.6, d: 'Un becario se da la vuelta de golpe.', pista: 'Susto: sopla en la nuca a un becario y se dará la vuelta de golpe' },
  portazo: { papel: 'colado', nombre: 'PORTAZO', n: 'Portazo', alcance: 0, d: 'Cierras de golpe la puerta más cercana 4 s.', pista: 'Portazo: cierras de golpe la puerta más cercana unos segundos y los becarios irán a mirar' },
  avisar: { papel: 'becario', nombre: 'AVISAR', n: 'Avisar', alcance: 0, cada: 6, d: 'Dejas una marca: «aquí hay un colado».', pista: 'Avisar: deja una marca para tus compañeros donde creas que hay un colado' },
  soplo: { papel: 'becario', nombre: 'SOPLO', n: 'Soplo', alcance: 130, a: 'colado', d: 'Le quitas un poco de pintura a un colado.', pista: 'Soplo: acércate a un colado y sóplale: se le irá un poco la pintura' },
  foco: { papel: 'becario', nombre: 'FOCO', n: 'Foco', alcance: 0, dura: 2.5, d: 'Alumbras una zona 2 s para todos los becarios.', pista: 'Foco: alumbras la zona donde estás para todos los becarios' },
};
const PODER = { cada: 15, primero: { colado: 4, becario: 1 } };      // la espera entre usos, y la del principio (al hacerse fantasma)
const poderesDe = papel => Object.keys(PODERES).filter(k => PODERES[k].papel === papel && !(k === 'apagon' && extraOn('apagon')));      // en el Apagón total no hay linternas que apagar
const papelFantasma = () => (J.yo && J.yo.clase === 'cazador' ? 'becario' : 'colado');
// uno al azar de ese papel que no sea `menos`
const poderAzar = (papel, menos) => { const op = poderesDe(papel).filter(k => k !== menos); return op.length ? pick(op) : menos; };

// al hacerse fantasma: le toca uno, y ya se sabe cuál viene después
function poderElige(f) {
  const papel = papelFantasma();
  f.poder = poderAzar(papel, null); f.sig = poderAzar(papel, f.poder); f.enfria = f.espera = PODER.primero[papel];
}
const poderDe = () => (J.fantasma && J.yo && J.fantasma.poder) ? PODERES[J.fantasma.poder] : null;
// el más cercano al fantasma del bando que toca, si está al alcance del poder
function poderObjetivo(p) {
  const f = J.fantasma; let mejor = null, md = p.alcance;
  if (p.a === 'becario') { for (const h of J.cazadores) { if (h.fuera || h.balas <= 0) continue; const d = lejos(f.x, f.y, h.x, h.y - 20); if (d < md) { md = d; mejor = h; } } }
  else for (const k of J.camaleones) {
    if (k.fuera || k === J.yo || k.invis > 0) continue;
    if (p === PODERES.retoque && !(k.congelado && k.pintado)) continue;      // retocar solo a quien está escondido y pintado
    const d = lejos(f.x, f.y, k.x, k.y - 20); if (d < md) { md = d; mejor = k; }
  }
  return mejor;
}

function accionPoder() {
  const p = poderDe(), f = J.fantasma; if (!p || !espectando()) return;
  if (f.enfria > 0) { play('deny'); pista(tr('Poder recargándose: {n} s', { n: Math.ceil(f.enfria) }), 1.5); return; }
  const k = f.poder, h = p.alcance ? poderObjetivo(p) : k === 'portazo' ? fpPuertaCerca(f.x, f.y) : null;      // el portazo cierra el paso más cercano, si hay
  if (p.alcance && !h) { play('deny'); pista(tr(p.a === 'colado' ? (k === 'retoque' ? 'Acércate más a un colado escondido' : 'Acércate más a un colado') : 'Acércate más a un becario'), 1.5); return; }
  f.enfria = f.espera = p.cada || PODER.cada; f.usado = (f.usado || 0) + 1;
  f.poder = f.sig || poderAzar(p.papel, k); f.sig = poderAzar(p.papel, f.poder);      // cambia: el siguiente nunca es el que acabas de usar
  misionEvento('poder');      // misiones y logros (misiones.js)
  if (k === 'avisar') { balizaPon(f.x, f.y, J.yo.nombre, true); if (J.pvp) rfpManda({ t: 'bz', x: Math.round(f.x), y: Math.round(f.y) }); }
  else {
    poderAplica(k, h, f.x, f.y, true, J.yo);
    if (J.pvp) rfpManda(Object.assign({ t: 'fp', p: k, s: h && h.slot != null ? h.slot : -1, x: Math.round(f.x), y: Math.round(f.y) }, k === 'portazo' && h ? { pu: [h.x, h.y, h.w, h.h, h.hor ? 1 : 0] } : {}));
  }
  refrescaPoder();
}
// ¿lleva este navegador a ese personaje? (el suyo, o los de la máquina si juega solo o es el anfitrión)
const poderMio = e => !!e && (e.jugador || (e.bot && (!J.pvp || RFP.soyHost)));
// el efecto en sí (aquí y en los demás navegadores): `mio` si lo ha lanzado este fantasma; `quien`, de quién es el fantasma (para el susto)
function poderAplica(k, h, x, y, mio, quien) {      // (en el PORTAZO, `h` es la puerta que se cierra: { x, y, w, h, hor })
  if (k === 'silbido') {
    ondaSilbido(x, y, null);
    const antes = REGLAS.oido; if (extraOn('apagon')) REGLAS.oido = antes * 2;      // Apagón total: el silbido falso se oye el doble
    if (!J.pvp || RFP.soyHost) for (const b of J.cazadores) if (b.bot && !b.fuera) oyeSilbido(b, x, y);
    REGLAS.oido = antes;
    if (mio) { fxTexto(x, y - 60, tr('¡Fiuuu!'), '#fff6ea'); play('silbido'); }
    return;
  }
  if (k === 'vaho' || k === 'charco' || k === 'foco' || k === 'portazo') { fpZonaPon(k, x, y, h); return; }      // lo que se queda en el mapa (fantasma-efectos.js); en el portazo, `h` es la puerta
  if (!h) return;
  if (k === 'retoque' || k === 'soplo') { fpPiel(k, h, x, y, mio, quien); return; }
  if (k === 'apagon') { h.apagada = Math.max(h.apagada, PODERES.apagon.dura); play('apagon'); if (h.jugador) avisa(tr('¡Un fantasma te ha apagado la linterna!'), 'malo'); }
  else if (k === 'mano') { h.manoFria = Math.max(h.manoFria, PODERES.mano.dura); play('manoFria'); if (h.jugador) avisa(tr('¡Una mano fría! Te tiembla la linterna'), 'malo'); }
  else if (k === 'susto') { h.vuelta = PODERES.susto.dura; play('fpSusto'); if (h.jugador) avisa(tr('¡BUUU! Del susto te das la vuelta'), 'malo'); }
  fxSalpica(h.x, h.y - 30, '#cfe9ff', 8); fxTexto(h.x, h.y - 70, tr(k === 'susto' ? '¡Ay!' : '¡Brrr!'), '#cfe9ff');
  if (!mio) fantasmaSusto(x, y, quien);      // los demás lo ven un instante (espectador.js); el que lo lanza ya se ve
}
// PvP: un fantasma ha usado su poder. Cada navegador se lo aplica a lo suyo; a lo de los demás, solo lo que se ve
function rfpPoderRecibido(m) {
  if (J.fase !== 'caza' || !(m.p in PODERES)) return;
  const sl = RFP.slots[m.s], h = sl && sl.ente, de = RFP.slots[m.de], quien = de && de.ente, p = PODERES[m.p];
  if (!p.alcance) { const pu = m.p === 'portazo' && Array.isArray(m.pu) && m.pu.length === 5 ? { x: +m.pu[0], y: +m.pu[1], w: Math.min(+m.pu[2], 6 * CEL), h: Math.min(+m.pu[3], 6 * CEL), hor: !!m.pu[4] } : null; poderAplica(m.p, pu, m.x, m.y, false, quien); return; }
  if (!h || h.clase !== (p.a === 'colado' ? 'camaleon' : 'cazador')) return;
  if (!(poderMio(h) || h.remoto)) { fantasmaSusto(m.x, m.y, quien); return; }      // no es mío ni de la máquina: solo el susto
  poderAplica(m.p, h, m.x, m.y, false, quien);
}
// hacia dónde apunta de verdad la linterna de un becario: con la mano fría, tiembla; con el susto, mira para atrás
const dirLuz = e => (e.vuelta > 0 ? Math.PI : 0) + (e.manoFria > 0 ? e.dir + Math.sin(J.t * 41) * 0.38 + Math.sin(J.t * 23) * 0.2 : e.dir);

// cada fotograma: la espera del poder
function poderAvanza(dt) { const f = J.fantasma; if (f) f.enfria = Math.max(0, (f.enfria || 0) - dt); }
// el botón: el dibujo del poder que llevas, su nombre, la espera y, debajo, el que viene
function refrescaPoder() {
  const b = E('b-poder'), p = poderDe(), ver = !!p && espectando();
  if (b.hidden === ver) b.hidden = !ver;
  if (!ver) return;
  const f = J.fantasma, carga = f.enfria > 0;
  if (!b.querySelector('canvas')) {
    const i = b.querySelector('i'); if (i) i.remove();
    const cv = document.createElement('canvas'); cv.width = cv.height = 96; b.prepend(cv);
    const s = document.createElement('span'); s.className = 'fp-sig'; b.appendChild(s);
  }
  if (b.dataset.poder !== f.poder) {
    b.dataset.poder = f.poder; b.dataset.papel = p.papel;
    const c = b.querySelector('canvas').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 96, 96); pintaPoderIcono(c, 96, f.poder);
    b.querySelector('b').textContent = tr(p.nombre);
  }
  b.classList.toggle('cargando', carga);
  b.style.setProperty('--carga', carga ? Math.round(360 * f.enfria / (f.espera || PODER.cada)) + 'deg' : '0deg');
  b.querySelector('small').textContent = carga ? Math.ceil(f.enfria) + ' s' : tr('¡Listo!');
  const sig = f.sig && PODERES[f.sig] ? tr('Siguiente: {p}', { p: tr(PODERES[f.sig].nombre) }) : '';
  const s = b.querySelector('.fp-sig'); if (s.textContent !== sig) s.textContent = sig;
}
