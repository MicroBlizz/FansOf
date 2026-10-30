// Fans of Nova · Campaña: la galaxia de sectores y la nave capital que guarda lo ganado entre misiones (aleación, núcleo, sectores liberados).
// Prototipo: se guarda en este navegador (localStorage). Diseño completo en docs/nova/mapa-y-facciones.md y docs/nova/economia.md.
'use strict';
const NV_CAMP_CLAVE = 'nova-campana-2';
const NV_GAL_R = 7;   // rejilla hexagonal de radio 5, recortada en forma de decágono: 10 cuñas = 9 facciones + tu enclave rebelde
// Mismos colores que la serie (core/js/serie/iconos.js, FAC_COLOR); Nova carga core «ligero» y no lo trae.
const NV_FAC_COLOR = { animales: '#ff9a3c', nomuertos: '#5ef2c0', streamers: '#c084fc', heroes: '#ffcb3d', ciber: '#22e3ff', memes: '#a3e635', gamer: '#4ade80', olvidados: '#d6a96a', pop: '#ff6b9a', microblizz: '#ff5b5b' };
const NV_FACCIONES = ['animales', 'nomuertos', 'streamers', 'heroes', 'ciber', 'memes', 'gamer', 'olvidados', 'pop'];
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
  { id: 'academia', nombre: 'Academia', txt: '+1 rango al empezar cada misión; la chatarra para subir sigue igual', max: 40, coste: k => 50 + 30 * k },
  { id: 'arsenal', nombre: 'Arsenal', txt: 'Desbloquea armas y módulos mejores en el pool de cartas (rarezas hasta legendaria)', max: 4, coste: k => 80 + 100 * k },
  { id: 'astillero', nombre: 'Astillero', txt: 'Empiezas la misión con la ranura vacía ya armada', max: 1, coste: () => 300 }
];

function nvHexDist(a, b) { return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs((a.q + a.r) - (b.q + b.r))) / 2; }
function nvHexVecinos(h) { return [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]].map(([dq, dr]) => ({ q: h.q + dq, r: h.r + dr })); }
function nvHexClave(h) { return h.q + ',' + h.r; }
function nvAzar(sem) { let s = sem >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

function nvHexXY(h) { return [Math.sqrt(3) * (h.q + h.r / 2), 1.5 * h.r]; }   // centro del hexágono, en tamaños de hexágono
// La galaxia sale siempre igual para la misma semilla y facción: un decágono de 10 cuñas alrededor del núcleo de Microblizz.
// Las 9 facciones se barajan; tu enclave rebelde ocupa la cuña opuesta a la de tu facción oficial, y tu base, su punta exterior.
function nvGalaxia(semilla, faccion) {
  const rnd = nvAzar(semilla), tipos = ['planeta', 'cinturon', 'nebulosa', 'estacion', 'pecio'], out = {};
  const orden = NV_FACCIONES.slice().sort(() => rnd() - 0.5), cunas = new Array(10), suya = orden.indexOf(faccion);
  // 10 cuñas: las 9 en su orden barajado y el enclave insertado enfrente de la tuya
  const sinYo = orden.filter(f => f !== faccion); let k = 0;
  const iOf = suya < 0 ? 0 : suya, iReb = (iOf + 5) % 10;
  for (let i = 0; i < 10; i++) cunas[i] = i === iOf ? faccion : i === iReb ? 'rebelde' : sinYo[k++];
  const D = 8.4, ap = D * Math.cos(Math.PI / 10);   // radio y apotema del decágono
  for (let q = -NV_GAL_R; q <= NV_GAL_R; q++) for (let r = -NV_GAL_R; r <= NV_GAL_R; r++) {
    const h = { q, r }; if (nvHexDist(h, { q: 0, r: 0 }) > NV_GAL_R) continue;
    const [x, y] = nvHexXY(h), dist = Math.hypot(x, y), ang = (Math.atan2(y, x) + Math.PI * 2.5) % (Math.PI * 2);   // 0 = arriba
    const rel = (ang % (Math.PI / 5)) - Math.PI / 10;
    if (dist > ap / Math.cos(rel) - 0.4) continue;   // fuera del decágono
    const anillo = nvHexDist(h, { q: 0, r: 0 }), dueno = anillo <= 2 ? 'microblizz' : cunas[Math.floor(ang / (Math.PI / 5)) % 10];   // Microblizz: el núcleo y dos anillos alrededor
    out[nvHexClave(h)] = { q, r, x, y, dist, dueno, tipo: anillo === 0 ? 'nucleo' : tipos[Math.floor(rnd() * tipos.length)] };
  }
  // la base: la celda más exterior del enclave, en el eje de su cuña
  const ejeReb = (iReb + 0.5) * Math.PI / 5;
  let base = null, mejor = -1e9;
  for (const kk in out) { const s = out[kk]; if (s.dueno !== 'rebelde') continue; const ang = (Math.atan2(s.y, s.x) + Math.PI * 2.5) % (Math.PI * 2), v = s.dist - 3 * Math.abs(ang - ejeReb); if (v > mejor) { mejor = v; base = kk; } }
  out[base].base = true; out[base].tipo = 'estacion';
  // peligro 1–5: por distancia a la base; el núcleo, siempre 5
  let maxd = 1; for (const kk in out) maxd = Math.max(maxd, nvHexDist(out[kk], out[base]));
  for (const kk in out) { const s = out[kk]; s.peligro = s.dueno === 'microblizz' ? 5 : Math.max(1, Math.min(5, Math.ceil(5 * nvHexDist(s, out[base]) / maxd))); }
  out._base = base;
  return out;
}

function nvCampNueva(prev) { return { v: 2, faccion: null, semilla: 1 + Math.floor(Math.random() * 1e9), aleacion: prev ? prev.aleacion || 0 : 0, mejoras: prev ? prev.mejoras || {} : {}, libres: [], misiones: prev ? prev.misiones || 0 : 0, victorias: prev ? prev.victorias || 0 : 0, fac: prev && prev.fac ? prev.fac : {} }; }   // fac: armas de facción desbloqueadas, para siempre
function nvCamp() {
  if (NVP.camp) return NVP.camp;
  let c = null, viejo = null;
  try { c = JSON.parse(localStorage.getItem(NV_CAMP_CLAVE) || 'null'); viejo = JSON.parse(localStorage.getItem('nova-campana-1') || 'null'); } catch (e) { c = null; }
  NVP.camp = c && c.v === 2 ? c : nvCampNueva(viejo);   // de la v1 se conservan la aleación y las mejoras de la nave capital
  if (NVP.camp.faccion) nvCampGalaxia();
  return NVP.camp;
}
function nvCampGalaxia() { NVP.gal = nvGalaxia(NVP.camp.semilla, NVP.camp.faccion); if (!NVP.camp.libres.length) NVP.camp.libres = [NVP.gal._base]; }
function nvCampFaccion(f) { const c = nvCamp(); c.faccion = f; nvCampGalaxia(); nvCampGuarda(); }
// De quién es un sector ahora: lo liberado pasa a ser de tu facción.
function nvDuenoActual(k) { const s = NVP.gal[k]; return nvCamp().libres.includes(k) ? NVP.camp.faccion : s.dueno; }
function nvCampGuarda() { try { localStorage.setItem(NV_CAMP_CLAVE, JSON.stringify(NVP.camp)); } catch (e) { /* sin almacenamiento: la campaña dura lo que la pestaña */ } }
// Un sector se puede atacar si es vecino de uno liberado (o es tu base).
function nvSectorAbierto(k) {
  const c = nvCamp(), s = NVP.gal && NVP.gal[k]; if (!s || k[0] === '_') return false;
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
  if (s) S.duenoSector = s.dueno;
  S.sector = s ? NVP.sector : null; S.peligro = s ? s.peligro : 1; S.tipoSector = s ? s.tipo : null;
}
function nvAplicaCampana(S) {
  if (!NVP.camp) return;
  const n = S.nave, k = nvNivelCapital('nucleo'), r0 = nvRangoInicial();
  if (r0 > 1) {   // empiezas ya en ese rango (y su clase de nave); la chatarra que falta para el siguiente es la de siempre
    n.rango = r0; n.escala = nvEscalaRango(r0); n.rAncho = nvRAncho(S.casco, r0); n.r = 0.42 * n.rAncho * n.escala; n.hpMax = n.hp = Math.round(n.hpMax * Math.pow(1.08, r0 - 1));
    S.chat = nvUmbralS(S, r0 - 1); nvAjustaTamanos(S);
  }
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
  S.desbloqueos = nvFacCierra(S, c);   // facciones.js: rango máximo, campaña pasada y armas nuevas
  nvCampGuarda();
  S.aleacionGanada = a;
  return a;
}
