// Fans of Ratkov · LAS ARMAS: sus números, las piezas que se les montan, las anomalías bugueadas y los efectos secundarios que puede
// dejar montar una anomalía. statsArma(objeto) junta todo y da los números finales con los que dispara.
// Números: daño por bala (dano), balas por disparo (perd), segundos entre disparos (cad), automática (auto), cargador (carg), segundos
// de recarga (rec), dispersión en radianes (disp), alcance (alc), velocidad de la bala (vel), calibre (cal) y lo que se oye (ruido, 1 = normal).
'use strict';
const ARMAS = {
  pistola: { dano: 24, perd: 1, cad: 0.22, auto: false, carg: 8, rec: 1.2, disp: 0.05, alc: 20, vel: 46, cal: 'm9', ruido: 0.9, son: 'pistola' },
  metralleta: { dano: 15, perd: 1, cad: 0.075, auto: true, carg: 30, rec: 1.8, disp: 0.1, alc: 18, vel: 44, cal: 'm9', ruido: 1, son: 'metralleta' },
  escopeta: { dano: 13, perd: 7, cad: 0.75, auto: false, carg: 6, rec: 2.3, disp: 0.26, alc: 11, vel: 40, cal: 'cart', ruido: 1.3, son: 'escopeta' },
  fusil: { dano: 31, perd: 1, cad: 0.11, auto: true, carg: 30, rec: 2.2, disp: 0.055, alc: 28, vel: 54, cal: 'm762', ruido: 1.2, son: 'fusil' },
  franco: { dano: 105, perd: 1, cad: 1.25, auto: false, carg: 5, rec: 2.9, disp: 0.008, alc: 46, vel: 80, cal: 'm762', ruido: 1.5, son: 'franco', lento: 0.55 },
};
// las ranuras de un arma, en el orden del taller
const RANURAS = ['boca', 'canon', 'mira', 'cargador', 'culata'];
const NOMBRE_RANURA = { boca: 'BOCA', canon: 'CAÑÓN', mira: 'MIRA', cargador: 'CARGADOR', culata: 'CULATA', anom: 'ANOMALÍA' };
// lo que hace cada pieza (multiplica)
const MODS = {
  silenciador: { ruido: 0.35, dano: 0.95 },
  canon: { dano: 1.15, alc: 1.18, vel: 1.1 },
  mira: { disp: 0.65, alc: 1.25 },
  cargador: { carg: 1.5 },
  culata: { disp: 0.8, retro: 0.5 },
};
// las anomalías: lo que hacen está en js/balas.js y js/jugador.js (efecto 'lag', 'crack', 'rebote', 'hitbox', 'hielo', 'desync')
const ANOMALIAS = { 'an-lag': 'lag', 'an-crack': 'crack', 'an-rebote': 'rebote', 'an-hitbox': 'hitbox', 'an-hielo': 'hielo', 'an-desync': 'desync' };
// lo malo que puede quedarse al montar una anomalía (una de cada tres veces, más o menos)
const EFECTOS = {
  pesada: { n: 'PESADA', d: 'El arma pesa 2 kg más.', peso: 2 },
  ruidosa: { n: 'RUIDOSA', d: 'Se oye el doble de lejos.', ruido: 2 },
  temblona: { n: 'TEMBLONA', d: 'Dispersa un 40 % más.', disp: 1.4 },
  hambrienta: { n: 'HAMBRIENTA', d: 'Cargador un 40 % más pequeño.', carg: 0.6 },
  perezosa: { n: 'PEREZOSA', d: 'Dispara un 25 % más despacio.', cad: 1.25 },
};
const PROB_EFECTO = 0.35, COSTE_ANOMALIA = 150;

function statsArma(o) {
  if (!o || !ARMAS[o.id]) return null;
  const s = Object.assign({ retro: 1, peso: OBJ[o.id].p }, ARMAS[o.id]);
  const mods = o.mods || {};
  for (const r of RANURAS) { const m = mods[r]; if (m && MODS[m]) for (const [k, f] of Object.entries(MODS[m])) s[k] *= f; if (m && OBJ[m]) s.peso += OBJ[m].p; }
  if (o.anom) { s.anom = ANOMALIAS[o.anom]; s.peso += OBJ[o.anom].p; }
  const e = o.efecto && EFECTOS[o.efecto];
  if (e) { if (e.peso) s.peso += e.peso; if (e.ruido) s.ruido *= e.ruido; if (e.disp) s.disp *= e.disp; if (e.carg) s.carg *= e.carg; if (e.cad) s.cad *= e.cad; }
  s.carg = Math.max(1, Math.round(s.carg));
  return s;
}
// el peso de cualquier objeto guardado (las armas con sus piezas; la munición por bala)
function pesoDe(o) {
  if (!o) return 0;
  if (ARMAS[o.id]) return statsArma(o).peso;
  return (OBJ[o.id] ? OBJ[o.id].p : 0) * (o.n || 1);
}
// lo que vale (las armas, con sus piezas; las anomalías montadas cuentan)
function valorDe(o) {
  if (!o || !OBJ[o.id]) return 0;
  let v = OBJ[o.id].v * (o.n || 1);
  if (o.mods) for (const m of Object.values(o.mods)) if (m && OBJ[m]) v += OBJ[m].v;
  if (o.anom && OBJ[o.anom]) v += OBJ[o.anom].v;
  if (o.dur != null && OBJ[o.id].dur) v = Math.round(v * (0.35 + 0.65 * o.dur / OBJ[o.id].dur));
  return v;
}
