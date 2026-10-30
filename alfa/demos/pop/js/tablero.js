// Fans of Pop · TABLERO: la lógica del pop-it (sin dibujo). Es un «Lights Out»: al tocar una burbuja se da la vuelta ella
// y sus cuatro vecinas (la que estaba arriba se revienta, la reventada vuelve a subir). La sala se supera cuando TODAS
// están reventadas. El tablero se desordena desde la solución con `lio` toques distintos: así siempre se puede resolver
// con esos mismos toques (la «solución» que usa la pista de Lola y el límite de toques).
'use strict';
function ppNuevoTablero(tipo, fx) {
  const d = PP_CFG.salas[tipo], n = d.lado, total = n * n;
  const lio = Math.round(rand(d.lio[0], d.lio[1]));
  const T = { tipo, n, up: new Uint8Array(total), sol: new Set(), slimes: {}, trampas: new Set(), toques: 0, pops: 0, pista: null, fianza: fx.fianza || 0, hecho: false };
  // desordena: lio toques distintos al azar (dos veces la misma se anularían)
  const celdas = [...Array(total).keys()];
  for (let i = 0; i < lio; i++) {
    const j = i + Math.floor(Math.random() * (celdas.length - i));
    [celdas[i], celdas[j]] = [celdas[j], celdas[i]];
    ppVoltea(T, celdas[i]);
    T.sol.add(celdas[i]);
  }
  if (ppResuelto(T)) { ppVoltea(T, celdas[0]); T.sol.delete(celdas[0]); }
  T.limite = lio + (d.holgura !== undefined ? d.holgura : PP_CFG.holgura) + (fx.margen || 0);
  // los slimes atrapados viven en burbujas que están arriba (se ven dentro)
  const arriba = celdas.filter(i => T.up[i]);
  const libres = PP_SLIME_IDS.filter(id => !fx.equipo.includes(id));
  for (let k = 0; k < d.slimes && arriba.length && libres.length; k++) {
    const i = arriba.splice(Math.floor(Math.random() * arriba.length), 1)[0];
    T.slimes[i] = libres.splice(Math.floor(Math.random() * libres.length), 1)[0];
  }
  // las trampas del jefe: tocarlas directamente cuesta un corazón (voltearlas de rebote, no)
  for (let k = 0; k < (d.trampas || 0) && arriba.length; k++) T.trampas.add(arriba.splice(Math.floor(Math.random() * arriba.length), 1)[0]);
  if (fx.pista) ppPista(T);
  return T;
}
function ppVecinas(T, i) {
  const n = T.n, x = i % n, y = (i - x) / n, v = [i];
  if (x > 0) v.push(i - 1); if (x < n - 1) v.push(i + 1); if (y > 0) v.push(i - n); if (y < n - 1) v.push(i + n);
  return v;
}
// da la vuelta a la celda y sus vecinas; devuelve [reventadas, subidas] (listas de índices) para el dibujo y el sonido
function ppVoltea(T, i) {
  const pops = [], subes = [];
  for (const j of ppVecinas(T, i)) { T.up[j] ^= 1; (T.up[j] ? subes : pops).push(j); }
  return [pops, subes];
}
function ppResuelto(T) { for (let i = 0; i < T.up.length; i++) if (T.up[i]) return false; return true; }
function ppPista(T) { const s = [...T.sol]; T.pista = s.length ? s[Math.floor(Math.random() * s.length)] : null; }
// un toque del jugador. Devuelve qué ha pasado para que partida.js reparta los efectos.
function ppToca(T, i) {
  if (T.hecho) return null;
  const [pops, subes] = ppVoltea(T, i);
  T.toques++; T.pops += pops.length;
  if (T.sol.has(i)) T.sol.delete(i); else T.sol.add(i);   // la solución que queda se actualiza con cada toque
  if (T.pista === i || (T.pista !== null && !T.sol.has(T.pista))) T.pista = null;
  let castigo = 0;
  if (T.toques > T.limite) { if (T.fianza > 0) T.fianza--; else castigo = 1; }
  if (T.trampas.has(i)) castigo++;
  T.hecho = ppResuelto(T);
  return { pops, subes, castigo, hecho: T.hecho, pasado: T.toques > T.limite };
}
