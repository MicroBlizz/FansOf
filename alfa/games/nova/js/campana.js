// Fans of Nova · Campaña: la galaxia de sectores y la nave capital que guarda lo ganado entre misiones (aleación, núcleo, sectores liberados).
// Prototipo: se guarda en este navegador (localStorage). Diseño completo en docs/nova/mapa-y-facciones.md y docs/nova/economia.md.
'use strict';
const NV_CAMP_CLAVE = 'nova-campana-1';
const NV_GAL_RADIO = 3;   // galaxia de prueba: un hexágono de radio 3 (37 sectores)
const NV_BASE = { q: -3, r: 0 };   // tu enclave rebelde, en un borde
const NV_NUCLEO_MB = { q: 3, r: 0 };   // el núcleo corporativo de Microblizz, en el borde opuesto
const NV_TIPOS_SECTOR = {
  planeta: { nombre: 'Planeta', color: '#5be36b', txt: 'Mucho tráfico: naves de todos los tamaños' },
  cinturon: { nombre: 'Cinturón de asteroides', color: '#c8a37a', txt: 'Rocas que estorban y esconden enemigos' },
  nebulosa: { nombre: 'Nebulosa', color: '#b46bff', txt: 'Se ve poco: los enemigos aparecen de cerca' },
  estacion: { nombre: 'Estación comercial', color: '#6fc4ff', txt: 'Más estaciones para reparar y cambiar armas' },
  pecio: { nombre: 'Pecio', color: '#ff9a3c', txt: 'Restos por todas partes: más chatarra' },
  nucleo: { nombre: 'Núcleo corporativo', color: '#ff5b5b', txt: 'La sede de Microblizz. Peligro máximo' }
};
// Mejoras de la nave capital. coste(nivel) en aleación; efecto aplicado al empezar cada misión (nvAplicaCampana).
const NV_CAPITAL = [
  { id: 'nucleo', nombre: 'Núcleo', txt: '+2 % de daño y de casco por nivel', max: 20, coste: k => 40 + 25 * k },
  { id: 'hangar', nombre: 'Hangar', txt: 'Empiezas con más chatarra en la cartera para la estación', max: 10, coste: k => 30 + 20 * k },
  { id: 'sensores', nombre: 'Sensores', txt: 'La chatarra te alcanza de más lejos', max: 5, coste: k => 50 + 40 * k },
  { id: 'astillero', nombre: 'Astillero', txt: 'Empiezas la misión con la ranura vacía ya armada', max: 1, coste: () => 300 }
];

function nvHexDist(a, b) { return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs((a.q + a.r) - (b.q + b.r))) / 2; }
function nvHexVecinos(h) { return [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]].map(([dq, dr]) => ({ q: h.q + dq, r: h.r + dr })); }
function nvHexClave(h) { return h.q + ',' + h.r; }
function nvAzar(sem) { let s = sem >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// La galaxia sale siempre igual para la misma semilla: tipo y peligro de cada sector.
function nvGalaxia(semilla) {
  const rnd = nvAzar(semilla), tipos = ['planeta', 'cinturon', 'nebulosa', 'estacion', 'pecio'], out = {};
  for (let q = -NV_GAL_RADIO; q <= NV_GAL_RADIO; q++) for (let r = -NV_GAL_RADIO; r <= NV_GAL_RADIO; r++) {
    const h = { q, r }; if (nvHexDist(h, { q: 0, r: 0 }) > NV_GAL_RADIO) continue;
    const d = nvHexDist(h, NV_BASE), base = d === 0, mb = q === NV_NUCLEO_MB.q && r === NV_NUCLEO_MB.r;
    out[nvHexClave(h)] = { q, r, base, tipo: base ? 'estacion' : mb ? 'nucleo' : tipos[Math.floor(rnd() * tipos.length)], peligro: mb ? 5 : Math.max(1, Math.min(5, Math.ceil(d / 1.4))) };
  }
  return out;
}

function nvCampNueva() { return { v: 1, semilla: 1 + Math.floor(Math.random() * 1e9), aleacion: 0, mejoras: {}, libres: [nvHexClave(NV_BASE)], misiones: 0, victorias: 0 }; }
function nvCamp() {
  if (NVP.camp) return NVP.camp;
  let c = null;
  try { c = JSON.parse(localStorage.getItem(NV_CAMP_CLAVE) || 'null'); } catch (e) { c = null; }
  NVP.camp = c && c.v === 1 ? c : nvCampNueva();
  NVP.gal = nvGalaxia(NVP.camp.semilla);
  return NVP.camp;
}
function nvCampGuarda() { try { localStorage.setItem(NV_CAMP_CLAVE, JSON.stringify(NVP.camp)); } catch (e) { /* sin almacenamiento: la campaña dura lo que la pestaña */ } }
// Un sector se puede atacar si es vecino de uno liberado (o es tu base).
function nvSectorAbierto(k) {
  const c = nvCamp(), s = NVP.gal[k]; if (!s) return false;
  if (c.libres.includes(k)) return true;
  return nvHexVecinos(s).some(v => c.libres.includes(nvHexClave(v)));
}
function nvNivelCapital(id) { return nvCamp().mejoras[id] || 0; }
function nvMejoraCapital(id) {
  const c = nvCamp(), m = NV_CAPITAL.find(x => x.id === id), k = nvNivelCapital(id);
  if (!m || k >= m.max || c.aleacion < m.coste(k)) return false;
  c.aleacion -= m.coste(k); c.mejoras[id] = k + 1; nvCampGuarda(); return true;
}

// Al empezar la misión: peligro del sector y mejoras de la nave capital.
function nvSectorPartida(S) {   // antes de generar el mundo: los enemigos ya nacen con el peligro del sector
  const s = NVP.sector && NVP.gal ? NVP.gal[NVP.sector] : null;
  S.sector = s ? NVP.sector : null; S.peligro = s ? s.peligro : 1; S.tipoSector = s ? s.tipo : null;
}
function nvAplicaCampana(S) {
  if (!NVP.camp) return;
  const n = S.nave, k = nvNivelCapital('nucleo');
  S.nucleoBono = 0.02 * k; n.hpMax = n.hp = Math.round(n.hpMax * (1 + S.nucleoBono));
  S.cartera += 25 * nvNivelCapital('hangar');
  S.mejoras.iman = (S.mejoras.iman || 0) + nvNivelCapital('sensores');
  if (S.tipoSector === 'pecio') S.chatExtra = 0.25;
  if (nvNivelCapital('astillero')) { const sl = nvRanuras(1, S)[1], C = NV_CASCOS[S.casco]; if (sl && !n.armas.some(w => w.slot === sl.id)) n.armas.push(nvArmaNueva(sl, C.arma[0], C.arma[1])); }
}
// Lo que paga una misión: por rango alcanzado y enemigos, más por peligro; perder paga la mitad.
function nvAleacionMision(S) {
  const base = 5 * S.nave.rango + 0.5 * S.stats.muertos, p = 1 + 0.3 * ((S.peligro || 1) - 1);
  return Math.round(base * p * (S.estado === 'victoria' ? 1 : 0.5));
}
// Cierra la misión una sola vez: suma aleación y, si ganaste, libera el sector.
function nvCierraMision(S) {
  if (S.cerrada || !NVP.camp) return 0;
  S.cerrada = true;
  const c = nvCamp(), a = nvAleacionMision(S);
  c.aleacion += a; c.misiones++;
  if (S.estado === 'victoria') { c.victorias++; if (S.sector && !c.libres.includes(S.sector)) c.libres.push(S.sector); }
  nvCampGuarda();
  S.aleacionGanada = a;
  return a;
}
