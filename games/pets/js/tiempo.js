// Fans Of Pets · TIEMPO: el paso del tiempo. Al abrir (y cada pocos segundos) se simula, minuto a minuto, lo que ha pasado desde la última vez,
// con un tope (PETS.tiempo.topeHoras) para no castigar las ausencias largas. Dentro: la eclosión del huevo, el horario de vida (se duerme al
// acostarse y se levanta a su hora, recuperando sueño y gastando poco), la siesta de día, despertarla de noche y el crecimiento del bebé.
'use strict';
const PT_MIN = 60000;
const ptMinDelDia = t => { const d = new Date(t); return d.getHours() * 60 + d.getMinutes(); };
function ptEnHorario(t, h = SAVE.horario) {   // ¿está dentro de su horario de vida (de día)?
  const m = ptMinDelDia(t);
  return h.despierta < h.acuesta ? m >= h.despierta && m < h.acuesta : m >= h.despierta || m < h.acuesta;
}
const ptRitmo = () => PETS.ritmos[SAVE.ritmo] || PETS.ritmos[PETS.ritmoPorDefecto];
const ptEclosionEn = () => SAVE.huevoDesde + PETS.huevoHoras * 60 * PT_MIN;
const ptBebeMin = () => ptRitmo().bebeHoras * 60;
const ptVisibles = () => PETS.visibles.bebe;
const ptCrece = () => ptVisibles().every(k => SAVE.nec[k] >= PETS.crecerMinimo);
const ptTriste = () => ptVisibles().some(k => SAVE.nec[k] < PETS.triste);

// se queda dormida (por la noche o por una siesta)
function ptDuerme(motivo) {
  const n = SAVE.nec, u = PETS.nocheMala.umbral;
  SAVE.dormida = true; SAVE.motivo = motivo; SAVE.despiertaHasta = 0;
  SAVE.nocheMala = motivo === 'noche' && (n.hambre < u || n.sed < u || n.limpieza < u);
}
function ptDespierta() { SAVE.dormida = false; SAVE.motivo = ''; SAVE.nocheMala = false; }

// un minuto de vida del bebé, a la hora t
function ptMinuto(t, eraDia) {
  const dia = ptEnHorario(t), n = SAVE.nec;
  if (eraDia && !dia && (!SAVE.dormida || SAVE.motivo === 'siesta')) ptDuerme('noche');               // hora de acostarse (una siesta larga pasa a ser la noche)
  if (!eraDia && dia) { if (SAVE.dormida && SAVE.motivo === 'noche') ptDespierta(); SAVE.despiertaHasta = 0; }   // hora de levantarse
  if (!dia && !SAVE.dormida && (!SAVE.despiertaHasta || t >= SAVE.despiertaHasta)) ptDuerme('noche');   // de noche, despierta solo un rato
  if (SAVE.dormida && SAVE.motivo === 'siesta' && n.sueno >= PETS.siestaHasta) ptDespierta();         // la siesta acaba sola
  const g = SAVE.dormida ? PETS.gastoDormida : PETS.gastoDespierta, x = SAVE.dormida ? 1 : ptRitmo().gasto, mala = SAVE.dormida && SAVE.nocheMala;
  for (const k in g) {
    let v = g[k] * x;
    if (mala && k === 'sueno') v *= PETS.nocheMala.sueno;
    if (mala && k === 'hambre') v *= PETS.nocheMala.hambre;
    n[k] = clamp(n[k] - v / 60, 0, 100);
  }
  if (ptCrece()) SAVE.crecido = Math.min(ptBebeMin(), SAVE.crecido + 1);
  return dia;
}

// simula desde SAVE.ultimo hasta ahora. Devuelve lo que ha pasado que merece contarse: { nacio, durmio, desperto }
function ptSimula() {
  const ahora = ptAhora(), pasa = {};
  if (SAVE.fase === 'huevo' && ahora >= ptEclosionEn()) {   // eclosiona: el bebé empieza a vivir a la hora de la eclosión
    const t0 = ptEclosionEn();
    SAVE.fase = 'bebe'; SAVE.nacio = t0; SAVE.ultimo = t0; SAVE.crecido = 0; SAVE.nec = Object.assign({}, PETS.nacer); ptDespierta(); SAVE.despiertaHasta = 0;
    pasa.nacio = true;
  }
  if (SAVE.fase !== 'bebe') return pasa;
  const tope = PETS.tiempo.topeHoras * 60 * PT_MIN;
  if (ahora - SAVE.ultimo > tope) SAVE.ultimo = ahora - tope;   // lo que pase del tope no cuenta
  const antes = SAVE.dormida;
  let t = SAVE.ultimo, eraDia = ptEnHorario(t);
  while (t + PT_MIN <= ahora) { t += PT_MIN; eraDia = ptMinuto(t, eraDia); }
  SAVE.ultimo = t;
  if (antes !== SAVE.dormida) pasa[SAVE.dormida ? 'durmio' : 'desperto'] = true;
  ptGuarda();
  return pasa;
}
// el reloj, en texto: «9:05»
const ptHora = m => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
// una duración en texto: «1 h 20 min»
function ptDura(min) {
  min = Math.max(0, Math.ceil(min)); const h = Math.floor(min / 60), m = min % 60;
  return h ? (m ? tr('{h} h {m} min', { h, m }) : tr('{h} h', { h })) : tr('{m} min', { m });
}
