// Fans Of Decks · Niveles de carta: Becario → Junior → Senior → CEO, que se suben de uno en uno. Todo tras el flag «decks-niveles» (en la web, cerrado: solo hay Becario y Junior, como siempre).
// · Una carta del mazo es { id, asc, niv, uid }: `niv` es el nivel (0 a 3) y `asc` sigue siendo «es Junior o más» (lo que miran los guardados y el código de antes). Sin `niv`, vale 1 si asc.
// · Las cifras de cada nivel salen de DC_CARTAS[id]: `asc` es lo que cambia en Junior (como siempre) y, si una carta lo quiere a mano, `nivs: [senior, ceo]` (cada uno con TODO lo que cambia sobre la carta base).
//   Si no lo trae, se deriva: cada cifra que sube en Junior sigue subiendo el mismo paso en cada nivel (el coste y las palabras clave solo cambian una vez, en Junior); si Junior solo cambia el coste o una palabra
//   clave, Senior y CEO suben un 20 % la cifra principal de la carta (daño, bloqueo, cura, fuerza…). Una carta que no puede subir más no sale en las listas de ascender (dcPuedeSubir).
// · Se enseña con dcNombre (+, ++, +++), la clase dc-niv-N de la carta y el nombre del nivel en el ascenso (dcVerAscenso, ascenso.js).
'use strict';
const DC_NIVELES = ['Becario', 'Junior', 'Senior', 'CEO'];
const DC_RAREZA_ORDEN = { basic: 0, common: 1, rare: 2, epic: 3, legendary: 4 };
const DC_CIFRA_PRINCIPAL = ['dano', 'bloqueo', 'cura', 'fuerza', 'fuerzaTurno', 'roba'];   // la que sube Senior/CEO si Junior solo cambia coste o palabras clave
// El nivel más alto que se puede tener ahora (3 con el flag abierto; 1 sin él).
function dcMaxNivel() { return NUCLEO.flag('decks-niveles', 'Cartas con 4 niveles: Becario, Junior, Senior y CEO', false) ? 3 : 1; }
// El nivel de una carta (nunca por encima de lo que permite el flag, por si un guardado de la alfa llega a la web).
function dcNiv(c) { return Math.min(c.niv !== undefined ? c.niv : c.asc ? 1 : 0, dcMaxNivel()); }
function dcNombreNivel(n) { return tr(DC_NIVELES[n] || DC_NIVELES[0]); }
// Lo que cambia sobre la carta base en el nivel n (1 a 3): un objeto como el `asc` de siempre.
function dcDelta(id, n) {
  const D = DC_CARTAS[id], A = D.asc; if (!A || n < 1) return {};
  if (n === 1) return A;
  const a_mano = D.nivs && D.nivs[n - 2]; if (a_mano) return Object.assign({}, A, a_mano);
  const out = Object.assign({}, A); let sube = false;
  for (const k in A) if (k !== 'coste' && typeof A[k] === 'number' && typeof D.fx[k] === 'number') { out[k] = D.fx[k] + (A[k] - D.fx[k]) * n; sube = true; }   // el mismo paso en cada nivel
  if (!sube) { const k = DC_CIFRA_PRINCIPAL.find(x => typeof D.fx[x] === 'number'); if (k) out[k] = D.fx[k] + Math.max(1, Math.round(D.fx[k] * 0.2)) * (n - 1); }
  return out;
}
// ¿Puede subir esta carta un nivel? Tiene que existir su ascenso, quedar nivel por encima y que el siguiente nivel cambie algo.
function dcPuedeSubir(c) {
  const n = dcNiv(c); if (!DC_CARTAS[c.id].asc || n >= dcMaxNivel()) return false;
  const delta = (id, m) => Object.assign({}, DC_CARTAS[id].fx, dcDelta(id, m)), a = delta(c.id, n), b = delta(c.id, n + 1);
  return Object.keys(Object.assign({}, a, b)).some(k => a[k] !== b[k]);
}
function dcSube(c) { c.niv = dcNiv(c) + 1; c.asc = true; }
function dcBaja(c) { c.niv = Math.max(0, dcNiv(c) - 1); c.asc = c.niv >= 1; }
// Una carta que se ofrece como recompensa: desde el segundo capítulo, la mitad llegan ya como Junior.
function dcNivelOferta(id) { return dcMaxNivel() > 1 && dcActo().cap >= 1 && DC_CARTAS[id].asc && Math.random() < 0.5 ? 1 : 0; }
// El evento «La rueda de ascensos»: tres cartas al azar suben un nivel y la de mayor rareza baja uno (al azar entre las de esa rareza). La bajada se mira ANTES de subir, para no deshacer una subida.
function dcSubeTresBajaUna() {
  const r = DCP.run, bajables = r.mazo.filter(c => dcNiv(c) > 0); let baja = null;
  if (bajables.length) { const rz = c => DC_RAREZA_ORDEN[DC_CARTAS[c.id].rar] || 0, top = Math.max(...bajables.map(rz)); baja = pick(bajables.filter(c => rz(c) === top)); dcBaja(baja); }
  const suben = shuffle(r.mazo.filter(c => c !== baja && dcPuedeSubir(c))).slice(0, 3); suben.forEach(dcSube);
  return { suben, baja };
}
