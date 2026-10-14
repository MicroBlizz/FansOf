// Fans of Karts · LAS MISIONES ONLINE DE CADA DÍA y EL PREMIO DE LA TEMPORADA. Cada día tocan 3 misiones de la lista (salen de la fecha:
// iguales para todos ese día); se cuentan solas en las carreras online y se cobran al cumplirlas (oro y XP del pase). Se ven en el pase.
// La temporada la lleva el servidor (karts_temporada): al entrar en el PvP se pregunta una vez y, si acabó una con premio, se cobran las gemas.
'use strict';

const MISIONES = [
  { id: 'carreras', txt: 'Corre 3 carreras online', n: 3 },
  { id: 'gana', txt: 'Gana una carrera online', n: 1 },
  { id: 'podio', txt: 'Acaba 2 veces en el podio online', n: 2 },
  { id: 'objetos', txt: 'Usa 6 objetos en carreras online', n: 6 },
  { id: 'tocado', txt: 'Dale 3 veces a otro jugador con un objeto', n: 3 },
  { id: 'chat', txt: 'Manda un mensaje rápido', n: 1 },
  { id: 'amigos', txt: 'Juega una sala con amigos', n: 1 },
];
const PREMIO_MISION = { oro: 60, xp: 40 };
const MISION = {}; for (const m of MISIONES) MISION[m.id] = m;

function misionesHoy() {
  const hoy = new Date().toLocaleDateString('sv');      // AAAA-MM-DD en tu hora
  if (!SAVE.misiones || SAVE.misiones.dia !== hoy) {
    let h = 7; for (const c of hoy) h = (h * 31 + c.charCodeAt(0)) | 0;
    const az = azarDe(h), ids = MISIONES.map(m => m.id), lista = [];
    while (lista.length < 3) lista.push(ids.splice(Math.floor(az() * ids.length), 1)[0]);
    SAVE.misiones = { dia: hoy, lista: lista.map(id => ({ id, n: 0, hecha: false })) };
    guardaPartida();
  }
  return SAVE.misiones;
}
function misionSuma(id, cuanto = 1) {
  const m = misionesHoy().lista.find(x => x.id === id), def = MISION[id];
  if (!m || m.hecha || !def) return;
  m.n = Math.min(def.n, m.n + cuanto);
  if (m.n >= def.n) {
    m.hecha = true;
    const l = daPremio({ oro: PREMIO_MISION.oro }); darXp(PREMIO_MISION.xp);
    avisaPremio('¡MISIÓN CUMPLIDA!', [{ ico: 'cos', txt: tr(def.txt) }, l, { ico: 'xp', txt: '+' + PREMIO_MISION.xp + ' XP' }], '#5ef27a');
  }
  guardaPartida();
}
// usar un objeto en una carrera online cuenta para la misión
const usaObjetoSinMision = usaObjeto;
usaObjeto = (k, C) => {
  const antes = k.objeto, usos = k.usos;
  usaObjetoSinMision(k, C);
  if (C.pvp && k.esJugador && antes && (k.objeto !== antes || k.usos !== usos)) misionSuma('objetos');
};
// para el pase: las tres de hoy
function misionesHtml() {
  const M = misionesHoy();
  return el('div.kt-misiones', {}, M.lista.map(m => {
    const d = MISION[m.id]; if (!d) return null;
    return el('div.kt-mision' + (m.hecha ? '.hecha' : ''), {},
      el('div', {}, el('b', {}, tr(d.txt)), el('div.kt-barra.mini', {}, el('i', { style: 'width:' + (m.n / d.n * 100) + '%' }), el('span.ol', {}, m.n + ' / ' + d.n))),
      el('div.kt-mision-premio.ol', {}, icono24('oro'), String(PREMIO_MISION.oro), ' · ' + PREMIO_MISION.xp + ' XP'),
      m.hecha ? marca(SVG_HECHO) : null);
  }));
}

// ---------- la temporada del servidor ----------
let TEMPORADA_VISTA = false;
function pvpTemporadaAlEntrar() {
  if (TEMPORADA_VISTA || KRED.esLocal() || !KRED.vinculada()) return;
  TEMPORADA_VISTA = true;
  KRED.red.temporada().then(r => {
    if (!r) return;
    if (r.fin) KTEMP.fin = String(r.fin).slice(0, 10);
    if (r.premio && r.premio.gemas > 0) {
      SAVE.gemas += r.premio.gemas; guardaPartida();
      avisaPremio('FIN DE TEMPORADA', [{ ico: 'gema', txt: '+' + r.premio.gemas + ' ' + tr('GEMAS') }, { ico: 'cos', txt: trf('Temporada %1: acabaste con %2 puntos.', r.premio.temporada, r.premio.puntos) }], '#ff5cf0');
    }
  }).catch(() => { TEMPORADA_VISTA = false; });
}
