// Fans of Nova · Enemigos de cada facción: en un sector de la campaña, los rastreros, fusileros, sepultureros y capitanes son de la facción que lo controla.
// Arte: «<facción>-<tipo>» en arte/enemigos/enemigos.json (como los de No-Muertos). Mientras no llega, se dibuja la nave de esa facción
// (rastrero = caza, fusilero = corbeta, sepulturero = fragata, capitán = crucero pesado) girada con la proa a la derecha.
// Armas: llevan los portadores y cargas de las tres armas de su facción (si un portador no lo usa el enemigo, como los drones, se queda el suyo).
// El nido de la facción solo cambia de arte; el jefe es la nave de su líder (misma IA que el Rey de los huesos, su arte y su nombre). Fuera de la campaña (y en No-Muertos o el núcleo de Microblizz) nada cambia.
'use strict';
const NV_ENEM_FAC_ETAPA = { rastrero: 0, fusilero: 1, sepulturero: 2, capitan: 3 };
function nvFacSector(S) { const f = S.duenoSector; return f && f !== 'nomuertos' && NOVA_FACCIONES[f] ? f : null; }
// Gancho de nvEnemigo (enemigos.js): marca la facción, el sprite y le cambia las armas.
function nvEnemigoFaccion(S, e) {
  const f = nvFacSector(S); if (!f) return;
  if (e.tipo === 'nido') { e.fac = f; e.spr = f + '-nido'; return; }   // el nido solo cambia de arte (sin arte propio se queda el de No-Muertos)
  if (e.tipo === 'jefe') {   // el jefe es la nave del líder de la facción: misma IA, su arte (sin arte propio se queda el Rey) y su nombre
    e.fac = f; e.spr = f + '-jefe';
    const L = typeof FACTIONS !== 'undefined' && FACTIONS[f] && FACTIONS[f].leader;
    if (L) e.d = Object.assign({}, e.d, { nombre: 'Nave de ' + nvCapNombre(L) });
    return;
  }
  if (!(e.tipo in NV_ENEM_FAC_ETAPA)) return;
  e.fac = f; e.spr = f + '-' + e.tipo;
  const F = NOVA_FACCIONES[f], ops = ['insignia', 'secreta', 'especial'].map(t => F[t]).filter(a => a && NV_ARMA_E[a.portador]);
  if (!ops.length || !e.armas) return;
  for (const w of e.armas) {
    if (Math.random() < 0.3) continue;   // alguna se queda como estaba: variedad
    const a = ops[Math.floor(Math.random() * ops.length)], cs = NV_ARMA_E[a.portador].cargas;
    w.portador = a.portador; w.carga = cs.includes(a.carga) ? a.carga : cs[Math.floor(Math.random() * cs.length)];
  }
}
// Sprite provisional: la nave de la facción en la etapa del tipo, en un cuadrado de 256 con la proa a la derecha.
function nvFacSpriteEnemigo(id) {
  if (NVE.meta[id] || typeof document === 'undefined' || !NVA.listo) return;
  const i = id.indexOf('-'), f = id.slice(0, i), tipo = id.slice(i + 1), casco = NOVA_FACCIONES[f].nave.casco || f, k = NV_ENEM_FAC_ETAPA[tipo];
  if (k === undefined) return;
  const ma = NVA.meta[casco + '-alas' + (k ? '-c' + (k + 1) : '')], mc = NVA.meta[casco + '-casco' + (k ? '-c' + (k + 1) : '')];
  if (!ma || !mc) return;
  const H = nvHull(casco, nvRangoClase(k)), ancho = Math.max(ma.ancho, mc.ancho) / 2;
  const arriba = mc.pivote[1] / 2, abajo = Math.max(mc.alto - mc.pivote[1], H.alas.y * 2 + ma.alto - ma.pivote[1]) / 2;
  const L = 256, esc = L * 0.94 / Math.max(ancho, arriba + abajo), cv = document.createElement('canvas'); cv.width = cv.height = L;
  const c = cv.getContext('2d');
  c.translate(L / 2, L / 2); c.rotate(Math.PI / 2); c.scale(esc, esc); c.translate(0, (arriba - abajo) / 2);   // proa (y negativa) hacia la derecha, centrada
  nvCuerpo(c, casco, k, 'alas'); nvCuerpo(c, casco, k, 'casco');
  const im = new Image(); im.src = cv.toDataURL();
  NVE.img[id] = im; NVE.meta[id] = { id, ancho: L, alto: L, pivote: [L / 2, L / 2], proa: 'derecha', provisional: true };
}
