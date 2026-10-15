// Fans of Rouflage · EL PODER DEL FANTASMA: un colado despedido no solo mira: al hacerse fantasma le toca UNO de tres poderes al azar
// para echar una mano a los suyos, con espera entre usos (PODER.cada). Apagón: se acerca a un becario y le apaga la linterna un
// segundo. Silbido falso: silba desde donde está y los becarios van a mirar ahí. Mano fría: toca a un becario y le tiembla la
// linterna dos segundos (apunta peor). Se dispara con el botón PODER (o Espacio / Q). En el PvP se avisa a todos con `fp`, y cada
// navegador se lo aplica a SU becario (al suyo propio o, el anfitrión, a los de la máquina); el silbido lo oyen los bots del anfitrión.
'use strict';

const PODERES = {
  apagon: { nombre: 'APAGÓN', icono: 'apagon', alcance: 150, dura: 1, pista: 'Apagón: acércate a un becario y apágale la linterna 1 segundo' },
  silbido: { nombre: 'SILBIDO', icono: 'silbato', alcance: 0, dura: 0, pista: 'Silbido falso: silba desde donde estés y los becarios irán a mirar ahí' },
  mano: { nombre: 'MANO FRÍA', icono: 'mano', alcance: 110, dura: 2, pista: 'Mano fría: toca a un becario y le temblará la linterna 2 segundos' },
};
const PODER = { cada: 20 };

// al hacerse fantasma (solo los colados): le toca uno
function poderElige(f) { f.poder = pick(Object.keys(PODERES)); f.enfria = 4; }
const poderDe = () => (J.fantasma && J.yo && J.yo.clase === 'camaleon' && J.fantasma.poder) ? PODERES[J.fantasma.poder] : null;
// el becario con linterna más cercano al fantasma, si está al alcance del poder
function poderObjetivo(p) {
  const f = J.fantasma; let mejor = null, md = p.alcance;
  for (const h of J.cazadores) { if (h.fuera || h.balas <= 0) continue; const d = lejos(f.x, f.y, h.x, h.y - 20); if (d < md) { md = d; mejor = h; } }
  return mejor;
}

function accionPoder() {
  const p = poderDe(), f = J.fantasma; if (!p || !espectando()) return;
  if (f.enfria > 0) { play('deny'); pista(tr('Poder recargándose: {n} s', { n: Math.ceil(f.enfria) }), 1.5); return; }
  const k = J.fantasma.poder;
  const h = p.alcance ? poderObjetivo(p) : null;
  if (p.alcance && !h) { play('deny'); pista(tr('Acércate más a un becario'), 1.5); return; }
  f.enfria = PODER.cada; f.usado = (f.usado || 0) + 1;
  poderAplica(k, h, f.x, f.y, true);
  if (J.pvp) rfpManda({ t: 'fp', p: k, s: h ? h.slot : -1, x: Math.round(f.x), y: Math.round(f.y) });
}
// el efecto en sí (aquí y en los demás navegadores): `mio` si lo ha lanzado este fantasma
function poderAplica(k, h, x, y, mio) {
  if (k === 'silbido') {
    ondaSilbido(x, y, null);
    if (!J.pvp || RFP.soyHost) for (const b of J.cazadores) if (b.bot && !b.fuera) oyeSilbido(b, x, y);
    if (mio) { fxTexto(x, y - 60, tr('¡Fiuuu!'), '#fff6ea'); play('silbido'); }
    return;
  }
  if (!h) return;
  if (k === 'apagon') { h.apagada = Math.max(h.apagada, PODERES.apagon.dura); play('apagon'); if (h.jugador) avisa(tr('¡Un fantasma te ha apagado la linterna!'), 'malo'); }
  else if (k === 'mano') { h.manoFria = Math.max(h.manoFria, PODERES.mano.dura); play('manoFria'); if (h.jugador) avisa(tr('¡Una mano fría! Te tiembla la linterna'), 'malo'); }
  fxSalpica(h.x, h.y - 30, '#cfe9ff', 8); fxTexto(h.x, h.y - 70, tr('¡Brrr!'), '#cfe9ff');
}
// PvP: un fantasma ha usado su poder. Cada navegador se lo aplica a su becario (el suyo, o los de la máquina si es el anfitrión)
function rfpPoderRecibido(m) {
  if (J.fase !== 'caza' || !(m.p in PODERES)) return;
  const sl = RFP.slots[m.s], h = sl && sl.ente;
  if (m.p === 'silbido') { poderAplica('silbido', null, m.x, m.y, false); return; }
  if (!h || h.clase !== 'cazador' || !(h.jugador || (h.bot && RFP.soyHost) || h.remoto)) return;
  poderAplica(m.p, h, m.x, m.y, false);
}
// hacia dónde apunta de verdad la linterna de un becario: con la mano fría, tiembla
const dirLuz = e => e.manoFria > 0 ? e.dir + Math.sin(J.t * 41) * 0.38 + Math.sin(J.t * 23) * 0.2 : e.dir;

// cada fotograma: la espera del poder y el botón
function poderAvanza(dt) { const f = J.fantasma; if (f) f.enfria = Math.max(0, (f.enfria || 0) - dt); }
function refrescaPoder() {
  const b = E('b-poder'), p = poderDe(), ver = !!p && espectando();
  if (b.hidden === ver) b.hidden = !ver;
  if (!ver) return;
  const f = J.fantasma, carga = f.enfria > 0;
  if (b.dataset.poder !== J.fantasma.poder) { b.dataset.poder = J.fantasma.poder; ponIcono(b.querySelector('i'), p.icono); b.querySelector('b').textContent = tr(p.nombre); }
  b.classList.toggle('cargando', carga);
  b.querySelector('small').textContent = carga ? Math.ceil(f.enfria) + ' s' : tr('¡Listo!');
}
