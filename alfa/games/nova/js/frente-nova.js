// Fans of Nova · GALAXIA DE LA COMUNIDAD (datos y reglas de Nova sobre el sistema común core/js/sistema/frente.js).
// La campaña personal alimenta un mapa común: cada misión suma puntos de tu facción patrón al sector equivalente. El mapa se recalcula
// cada día y el domingo se cierra la semana con el parte de guerra. Diseño: /mnt/project-files/nova/MEJORAS-Y-GALAXIA-COMUNIDAD.md y
// docs/nova/galaxia-comunidad.md. FASE 1: se simula en este aparato (la IA rellena y solo cuentan tus aportes); los puntos de todos irán al servidor.
'use strict';
const NV_FRENTE = {
  puntos: { mision: 10, victoria: 20, libera: 10 },     // lo que suma una misión a tu patrón
  defensaNucleo: 60,                                    // Microblizz defiende mejor su núcleo
  premio: { porPunto: 0.5, tope: 200, ganadora: 2 },    // aleación al cerrar la semana: la mitad de tus puntos, con tope; ×2 si tu patrón ganó
  cambio: { max: 400, min: 10 },                        // aleación por cambiar de patrón: muy caro a la 1.ª facción, casi gratis a la última
  cosmeticos: ['pintura', 'estela', 'emblema'],         // la colección de cada facción: se gana uno por semana ganada, en este orden
};
const nvFrenteActivo = () => NUCLEO.flag('nova-galaxia-comun', 'Galaxia de la comunidad de Nova (simulada en el aparato)', false);

// ---------- el mapa común de una semana: la misma geometría que la campaña, barajada con la semana ----------
const NV_FRENTE_CACHE = {};
function nvFrenteMapa(semana) {
  if (NV_FRENTE_CACHE[semana]) return NV_FRENTE_CACHE[semana];
  const gal = nvGalaxia(FRENTE.semillaDe('nova-' + semana), NV_FACCIONES[0]), mapa = {};   // la cuña «rebelde» queda como tierra de nadie
  for (const k in gal) {
    if (k[0] === '_') continue;
    const s = gal[k], vecinos = nvHexVecinos(s).map(nvHexClave).filter(v => gal[v]);
    mapa[k] = { dueno: s.dueno, vecinos, defensa: s.dueno === 'microblizz' ? NV_FRENTE.defensaNucleo : undefined };
  }
  return (NV_FRENTE_CACHE[semana] = { gal, mapa });
}
// Cómo va una semana: hoy cuentan los días ya cerrados; una semana pasada, los 7.
function nvFrenteEstado(semana, dias, aportes) {
  const { gal, mapa } = nvFrenteMapa(semana);
  const res = FRENTE.simula({ mapa, facciones: NV_FACCIONES, semilla: 'nova-' + semana, dias, aportes });
  return Object.assign({ semana, dias, gal }, res);
}

// ---------- lo tuyo: patrón, aportes y colección (en SAVE.frente, viaja a la nube con la campaña) ----------
// Las reglas están en dominio/frente.js (NV.Frente); aquí se les da la campaña, el reloj (NV_RELOJ) y los datos, y se guarda.
const NV_RELOJ = { ahora: () => new Date() };   // el único sitio de la galaxia de la comunidad que mira la hora (los tests lo cambian)
function nvFrente() { return NV.Frente.deSemana(nvCamp(), FRENTE.claveSemana(NV_RELOJ.ahora())); }
function nvPatron() { nvFrente(); return NV.Frente.patron(nvCamp()); }
function nvFrenteHoy() { return nvFrenteEstado(nvFrente().semana, FRENTE.diasCerrados(NV_RELOJ.ahora()), nvFrente().aportes); }

// El sector del mapa común que equivale al de tu campaña: uno del mismo dueño y del mismo anillo, mejor si toca a tu patrón.
function nvFrenteCasilla(S, est, patron) {
  const anillo = S.sector ? nvHexDist(NVP.gal[S.sector], { q: 0, r: 0 }) : 4, rival = S.duenoSector;
  let ids = Object.keys(est.duenos).filter(id => est.duenos[id] === rival);
  if (!ids.length) ids = FRENTE.frontera(nvFrenteMapa(est.semana).mapa, est.duenos, patron);
  let mejor = null, nota = Infinity;
  for (const id of ids.sort()) {
    const s = est.gal[id], toca = nvFrenteMapa(est.semana).mapa[id].vecinos.some(v => est.duenos[v] === patron);
    const n = 10 * Math.abs(nvHexDist(s, { q: 0, r: 0 }) - anillo) - (toca ? 5 : 0);
    if (n < nota) { nota = n; mejor = id; }
  }
  return mejor;
}
// Al cerrar una misión de campaña (nvCierraMision): suma los puntos de hoy a tu patrón.
function nvFrenteAporta(S, libero) {
  if (!nvFrenteActivo() || !NVP.camp || !NVP.camp.faccion) return null;
  const f = nvFrente(), patron = nvPatron(), est = nvFrenteHoy(), casilla = nvFrenteCasilla(S, est, patron);
  if (!casilla) return null;
  const puntos = NV.Frente.puntosMision(NV_FRENTE.puntos, S.estado === 'victoria', libero);
  f.aportes.push({ dia: FRENTE.diasCerrados(NV_RELOJ.ahora()), casilla, faccion: patron, puntos });
  return { casilla, puntos, patron };
}
const nvFrenteMisPuntos = aportes => NV.Frente.misPuntos(aportes);

// ---------- el cierre de la semana: parte de guerra y premios ----------
function nvFrenteParte() {
  const f = nvFrente();
  if (!f.previa || f.previa.cobrada) return null;
  return NV.Frente.parte(f, nvFrenteEstado(f.previa.semana, 7, f.previa.aportes), NV_FRENTE.premio, NV_FRENTE.cosmeticos);
}
function nvFrenteCobra(parte) { NV.Frente.cobra(nvCamp(), nvFrente(), parte); nvCampGuarda(); }

// ---------- cambiar de patrón: barato a quien va perdiendo, carísimo a quien va ganando ----------
function nvFrentePrecio(fac, est) { return NV.Frente.precio(fac, est.ranking, NV_FRENTE.cambio); }
function nvFrenteCambia(fac, est) {
  const ok = NV.Frente.cambia(nvCamp(), nvFrente(), fac, nvFrentePrecio(fac, est));
  if (ok) nvCampGuarda();
  return ok;
}
