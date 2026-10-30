// Fans of Rouflage · LAS HABILIDADES EN EL PvP Y EL TUTORIAL (talentos): lo que lleva cada jugador ({ t: 'hb', b, c }, junto a la ropa), los efectos que llegan de
// los demás ({ t: 'tl', h, s, … }: los aplica habEfecto de talentos-partida.js), el aviso de qué llevan los rivales y el consejo de la primera vez con cada habilidad.
'use strict';

/* ---------- PvP: lo que lleva cada uno ---------- */
function talMandaHab() { if (J.pvp) rfpManda({ t: 'hb', b: talElegida('becario'), c: talElegida('colado') }); }
function talRecibe(sl, m) {
  if (m.t === 'hb') {
    sl.habs = { b: habDef(m.b) ? m.b : 'contador', c: habDef(m.c) ? m.c : 'granada' };
    const e = sl.ente; if (e && (J.fase === 'prep' || J.fase === 'sala') && talOn()) habPon(e, sl.habs[e.clase === 'cazador' ? 'b' : 'c']);
    return;
  }
  if (!talOn()) return;      // en una sala CLÁSICO (sin talentos) no vale ninguna
  const s = RFP.slots[m.s], e = s && s.ente; if (!e || !habDef(m.h) && m.h !== 'dronx' && m.h !== 'senx') return;
  if (!(m.de === m.s || (m.de === RFP.host && !s.humano) || m.h === 'dronx' || m.h === 'senx')) return;
  if (m.h !== 'dronx' && m.h !== 'senx') { e.habUsos = Math.max(0, (e.habUsos || 1) - 1); }
  habEfecto(e, m.h, m, true);
}
// al empezar la caza en el PvP: qué llevan los del otro bando (justo: todos saben a qué se enfrentan)
function talAvisaRivales() {
  if (!J.pvp || !J.yo || !talOn()) return;
  const rivales = J.entes.filter(e => e.clase !== J.yo.clase && e.hab && !e.dueno), n = {};
  for (const e of rivales) { const h = habDef(e.hab); n[tr(h.n)] = (n[tr(h.n)] || 0) + 1; }
  const l = Object.entries(n).map(([k, v]) => v > 1 ? k + ' ×' + v : k).join(', ');
  if (l) avisa((J.yo.clase === 'cazador' ? tr('Los colados llevan: {l}', { l }) : tr('Los becarios llevan: {l}', { l })), 'aviso');
}

/* ---------- el tutorial: la primera vez con cada habilidad, un consejo ---------- */
Object.assign(TUTO_TEXTOS, {
  'hab-contador': ['Tu habilidad: CONTAR. Úsala al entrar en una sala y sabrás cuántos colados hay dentro. Tienes dos.', 8],
  'hab-dron': ['Tu habilidad: DRON. Vuela hasta un colado y lo marca con su nombre. Si tira la granada antes de que llegue, se pierde la señal.', 9],
  'hab-silbato': ['Tu habilidad: SILBATO. Pita y todos los colados silban a la vez: fíjate bien en de dónde salen las ondas.', 8],
  'hab-uv': ['Tu habilidad: UV. Durante 5 segundos brilla la pintura de los colados que alumbres. Guárdala para cuando sospeches de algo.', 9],
  'hab-cafe': ['Tu habilidad: CAFÉ. Corres más durante 8 segundos: perfecto para llegar a un silbido antes de que se escondan.', 8],
  'hab-senuelo': ['Tu habilidad: SEÑUELO. Deja una galleta pintada como tú donde estás y vete a otro sitio: si un becario la despide, falla. Además, en el taller llegas más lejos con los garabatos.', 10],
  'hab-gato': ['Tu habilidad: GATO. Durante 10 segundos los becarios bot no notan que te mueves: para cambiar de escondite.', 8],
  'hab-cambiazo': ['Tu habilidad: CAMBIAZO. Te cambias de sitio con otro colado: úsala si un becario está a punto de pillarte.', 8],
  'hab-rapida': ['Llevas la pintura rápida mejorada: el botón RÁPIDA del taller te camufla mejor y recarga en 30 segundos.', 8],
});
// al empezar la caza: el consejo de tu habilidad (un poco después de los demás) y, en el PvP, qué llevan los rivales
function talentosCaza() {
  for (const e of J.camaleones) if (e.bot && !e.remoto && !e.fuera && e.hab === 'senuelo') talBotGarabatos(e);
  const yo = J.yo; if (!yo || !yo.hab) return;
  if (yo.hab !== 'granada' && yo.hab !== 'rapida') TALP.pend.push({ t: 5, f: () => { if (J.fase === 'caza' && !yo.fuera) tutoDi('hab-' + yo.hab); } });
  talAvisaRivales();
}
