// Fans Of Pets · CRIATURAS: las 72 criaturas (los 8 personajes de cada una de las 9 facciones: líder, 6 unidades y mata-sanadores) y el azar con semilla.
// Los nombres y la rareza salen de las cartas de core (core/js/serie/facciones/<facción>.js) y el color, de FAC_COLOR (core/js/serie/iconos.js):
// aquí no se copia nada de la serie. Necesita que esos archivos se hayan cargado antes.
'use strict';
const PT_CRIATURAS = FACTION_ORDER.flatMap(fac => {
  const F = FACTIONS[fac];
  return [F.leader, ...F.units, PETS.mataSanadores[fac]].map(k => ({ id: fac + ':' + k, fac, carta: k, nombre: CFG.cards[k].name, rareza: CFG.cards[k].rarity }));
});
const ptCriatura = id => PT_CRIATURAS.find(c => c.id === id) || null;
const ptColor = fac => FAC_COLOR[fac] || '#ff9a3c';
const ptNombre = c => tr(c.nombre);
const ptFaccion = fac => tr(FACTIONS[fac].name);

// el azar con semilla: siempre los mismos huevos para la misma semilla
function ptHash(texto) {   // FNV-1a de 32 bits
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function ptAzar(semilla) {   // mulberry32: devuelve una función que da números entre 0 y 1
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// los huevos misteriosos: n criaturas de facciones distintas, al azar con la semilla
function ptHuevosDe(semilla, n = PETS.huevos) {
  const r = ptAzar(semilla), facs = FACTION_ORDER.slice(), out = [];
  for (let i = facs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [facs[i], facs[j]] = [facs[j], facs[i]]; }
  for (const fac of facs.slice(0, n)) { const de = PT_CRIATURAS.filter(c => c.fac === fac); out.push(de[Math.floor(r() * de.length)].id); }
  return out;
}
