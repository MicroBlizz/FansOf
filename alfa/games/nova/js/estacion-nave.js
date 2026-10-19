// Fans of Nova · La nave en la estación y el taller: se ve con sus armas en los anclajes, con el arco de tiro del anclaje elegido, y las armas se cambian de sitio (swap).
// Usa nvDibujaNave (dibujo.js) con una copia de la nave puesta de frente; las ranuras salen de nvRanuras (armas.js). Lo pinta nvRenderEstacion (interfaz.js).
'use strict';
const NV_EST_LADO = 400;   // el lienzo es cuadrado; la nave se dibuja con su escala de estación (cabe entera aunque sea un acorazado), no la de la partida
function nvEstEsc(n) { return [1.3, 1.25, 1.15, 1.05, 0.95, 0.85][nvClase(n.rango)]; }

// Una defensa solo cabe en la popa o en la dorsal; las demás armas, en cualquier anclaje.
function nvPuedeColocar(w, sl) { return !w || w.portador !== 'defensa' || sl.cara === 'popa' || sl.cara === 'dorsal'; }
function nvIntercambia(S, idA, idB) {
  const n = S.nave, ranuras = nvRanuras(n.rango, S), a = ranuras.find(r => r.id === idA), b = ranuras.find(r => r.id === idB);
  const wa = n.armas.find(w => w.slot === idA), wb = n.armas.find(w => w.slot === idB);
  if (!a || !b || a === b || (!wa && !wb)) return false;
  if (!nvPuedeColocar(wa, b) || !nvPuedeColocar(wb, a)) return false;
  if (wa) { wa.slot = b.id; wa.cara = b.cara; }
  if (wb) { wb.slot = a.id; wb.cara = a.cara; }
  return true;
}

// Sector de tiro de una cara, en el sistema de la nave (proa arriba): centro = hacia donde mira, ancho = su arco.
function nvSectorCara(c, x, y, cara, R, col, vivo) {
  const arco = NOVA_CASCOS.caras[cara].arco, f = NV_CARAS_DIR[cara], mid = Math.atan2(f[1], f[0]);
  c.save(); c.beginPath();
  if (arco >= 360) c.arc(x, y, R, 0, 6.283); else { c.moveTo(x, y); c.arc(x, y, R, mid - arco / 2 * Math.PI / 180, mid + arco / 2 * Math.PI / 180); c.closePath(); }
  c.globalAlpha = vivo ? 0.3 : 0.14; c.fillStyle = col; c.fill();
  c.globalAlpha = 0.9; c.lineWidth = 2; c.strokeStyle = col; c.setLineDash([6, 5]); c.stroke();
  c.restore();
}

// Qué admite cada anclaje: letras sobre el dibujo y lista de nombres en el texto.
const NV_LETRA_TIPO = { railgun: 'R', flak: 'F', laser: 'L', lanzador: 'M', drones: 'D', defensa: 'E' };
function nvAdmite(sl) {   // «Todas las armas» si admite las cinco; si no, sus nombres
  const ar = sl.tipos.filter(t => t !== 'defensa'), todas = NV_TIPOS_LIBRES.every(t => ar.includes(t));
  return (todas ? tr('Todas las armas') : ar.map(t => tr(NOVA_ARMAS.portadores[t].nombre)).join(', ')) + (sl.tipos.includes('defensa') ? (ar.length ? ' + ' : '') + tr('Defensa') : '');
}
function nvLetrasAnclaje(sl) {
  const ar = sl.tipos.filter(t => t !== 'defensa'), todas = NV_TIPOS_LIBRES.every(t => ar.includes(t));
  return (todas ? '★' : ar.map(t => NV_LETRA_TIPO[t]).join('')) + (sl.tipos.includes('defensa') ? 'E' : '');
}
// Pinta la nave de frente en el lienzo, con el arco del anclaje elegido y un aro en cada anclaje.
function nvPintaEstacion(cv, S) {
  const c = cv.getContext('2d'), n = S.nave, L = NV_EST_LADO, sel = S.estSlot, ESC = nvEstEsc(n);
  const falsa = { casco: S.casco, t: performance.now() / 1000, nave: { x: 0, y: 0, ang: 0, escala: ESC, rango: n.rango, golpeado: 0, esc: null, armas: n.armas.map(w => Object.assign({}, w, { ang: -1.5708, drones: null })) } };
  c.clearRect(0, 0, L, L); c.save(); c.translate(L / 2, L / 2 + 6);
  const ranuras = nvRanuras(n.rango, S), s = sel && ranuras.find(r => r.id === sel);
  if (s) nvSectorCara(c, s.x * ESC, s.y * ESC, s.cara, 95, nvColorAnclaje(n, s), !!n.armas.find(w => w.slot === s.id));
  nvDibujaNave(c, falsa);
  for (const r of ranuras) {   // aro en cada anclaje: amarillo el elegido, blanco los demás
    const w = n.armas.find(a => a.slot === r.id), rr = (NOVA_PIEZAS.radioRanura[w ? w.tam : 'S'] + 6) * ESC;
    c.beginPath(); c.arc(r.x * ESC, r.y * ESC, rr, 0, 6.283);
    c.lineWidth = r.id === sel ? 4 : 2; c.strokeStyle = r.id === sel ? '#ffd93d' : 'rgba(255,255,255,.55)'; c.setLineDash(w ? [] : [4, 4]); c.stroke(); c.setLineDash([]);
    c.font = '800 12px sans-serif'; c.textAlign = 'center'; c.lineWidth = 3; c.strokeStyle = '#1a0f2e'; c.fillStyle = w ? '#fff' : '#ffd93d';   // letras de lo que admite el anclaje
    const tx = nvLetrasAnclaje(r), ty = r.y * ESC + rr + 12; c.strokeText(tx, r.x * ESC, ty); c.fillText(tx, r.x * ESC, ty);
  }
  c.restore();
}
function nvColorAnclaje(n, sl) { const w = n.armas.find(a => a.slot === sl.id); return w ? NOVA_ARMAS.cargas[w.carga].color : '#9fb0ff'; }

// El lienzo de la nave: tocar un anclaje lo elige; tocar otro cambia las armas de sitio (si el otro está vacío, la arma se mueve).
// `alCambiar` repinta el panel; `aviso` es la línea donde sale por qué no se puede.
function nvLienzoNave(S, alCambiar, aviso) {
  const cv = document.createElement('canvas'); cv.width = cv.height = NV_EST_LADO; cv.className = 'nv-estnave';
  cv.onclick = ev => {
    const R = cv.getBoundingClientRect(), k = NV_EST_LADO / R.width, x = (ev.clientX - R.left) * k - NV_EST_LADO / 2, y = (ev.clientY - R.top) * k - NV_EST_LADO / 2 - 6;
    let mejor = null, md = 30 * 30; const ESC = nvEstEsc(S.nave);
    for (const r of nvRanuras(S.nave.rango, S)) { const d = (r.x * ESC - x) ** 2 + (r.y * ESC - y) ** 2; if (d < md) { md = d; mejor = r; } }
    if (!mejor) return;
    aviso.textContent = '';
    if (!S.estSlot || S.estSlot === mejor.id) { S.estSlot = S.estSlot === mejor.id ? null : mejor.id; alCambiar(); return; }
    if (nvIntercambia(S, S.estSlot, mejor.id)) { S.estSlot = mejor.id; alCambiar(); return; }
    if (!S.nave.armas.some(w => w.slot === S.estSlot) && !S.nave.armas.some(w => w.slot === mejor.id)) { S.estSlot = mejor.id; alCambiar(); return; }   // dos vacíos: solo cambia la elección
    aviso.textContent = tr('Una defensa solo cabe en la popa o en la dorsal');
  };
  const bucle = () => { if (!cv.isConnected) return; nvPintaEstacion(cv, S); requestAnimationFrame(bucle); };
  requestAnimationFrame(bucle);
  return cv;
}
// Texto que acompaña a la nave: qué hay en el anclaje elegido y hasta dónde tira.
function nvTextoAnclaje(S) {
  const sl = S.estSlot && nvRanuras(S.nave.rango, S).find(r => r.id === S.estSlot);
  if (!sl) return tr('Toca un anclaje para ver su arco de tiro, y otro para cambiar las armas de sitio');
  const w = S.nave.armas.find(a => a.slot === sl.id), arco = NOVA_CASCOS.caras[sl.cara].arco;
  return (w ? nvNombreArma(w) : tr('Vacío')) + ' · ' + tr(sl.cara) + ' · ' + tr('Arco de tiro') + ' ' + arco + '°\n' + tr('Admite') + ': ' + nvAdmite(sl) + ' · ' + tr({ S: 'pequeña', M: 'mediana', L: 'grande' }[sl.tam]);
}
// Leyenda de los anclajes: una línea por anclaje con lo que admite y si está libre.
function nvLeyendaAnclajes(S) {
  const cont = document.createElement('div'); cont.className = 'nv-leyenda';
  for (const r of nvRanuras(S.nave.rango, S)) {
    const w = S.nave.armas.find(a => a.slot === r.id), f = document.createElement('div'); f.className = 'nv-ley' + (w ? '' : ' nv-libre');
    f.textContent = tr(r.cara) + ' · ' + nvLetrasAnclaje(r) + ' · ' + (w ? (w.portador === 'defensa' ? tr('Defensa') : nvNombreArma(w)) : tr('Libre') + ': ' + nvAdmite(r));
    cont.appendChild(f);
  }
  return cont;
}
