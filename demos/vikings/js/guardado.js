// Fans of Vikings · La partida guardada: oro, almacén, nivel de aldea, los 4 fans (nivel, vida y equipo), las colas de cada
// edificio con su hora de fin (van con el reloj real: al volver se cobra lo que se hizo con el juego cerrado), el asalto y la
// planta de la sede por la que vas, la guía y el sonido. Todo en un objeto (SAVE) que core sube a la nube (cuenta.js).
'use strict';
const VK_NUEVA = () => {
  const s = { v: 1, oro: 20, inv: { zanahoria: 3, pan: 1, espada: 0, escudo: 0 }, nivel: 1, xp: 0, fans: {}, colas: {},
    asalto: 0, planta: 0, mision: 0, hechos: { zanahoria: 0, pan: 0, comer: 0, equipar: 0, espada: 0, escudo: 0 },
    muted: false, musica: true, ayuda: false };
  for (const id of VK_ORDEN_FANS) s.fans[id] = { nivel: 1, xp: 0, vida: VK_FANS[id].vida, arma: 0, escudo: 0 };
  for (const id in VK_EDIFICIOS) if (VK_EDIFICIOS[id].recetas) s.colas[id] = [];
  return s;
};
const SAVE = (() => {
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { s = null; }
  const n = VK_NUEVA();
  if (!s || typeof s !== 'object' || s.v !== 1) return n;
  for (const k in n) if (s[k] === undefined || s[k] === null) s[k] = n[k];
  for (const k of ['inv', 'hechos', 'colas', 'fans']) for (const j in n[k]) if (s[k][j] === undefined) s[k][j] = n[k][j];
  return s;
})();
let VK_GUARDA_T = 0;
function vkGuarda() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { /* sin almacenamiento: se juega igual */ }
  if (typeof CUENTA !== 'undefined' && CUENTA.cambio) try { CUENTA.cambio(); } catch (e) { /* sin cuenta */ }
}
function vkGuardaLuego() { if (!VK_GUARDA_T) VK_GUARDA_T = setTimeout(() => { VK_GUARDA_T = 0; vkGuarda(); }, 400); }
function vkBorraTodo() { const n = VK_NUEVA(); for (const k of Object.keys(SAVE)) delete SAVE[k]; Object.assign(SAVE, n); vkGuarda(); }
addEventListener('pagehide', vkGuarda);
document.addEventListener('visibilitychange', () => { if (document.hidden) vkGuarda(); });

// lo que pide el motor de sonido de core
function sonidoApagado() { return !!SAVE.muted; }
function volGeneral() { return SAVE.muted ? 0 : 1; }
function volMusica() { return SAVE.musica === false ? 0 : 0.14; }
function musicUpdate() { /* la música la elige vkMusica (js/sonidos.js) */ }

/* ---------- los fans: sus números con el nivel y el equipo ---------- */
function vkStats(id) {
  const F = VK_FANS[id], s = SAVE.fans[id], n = s.nivel - 1;
  const arma = s.arma ? VK_COSAS.espada : null, esc = s.escudo ? VK_COSAS.escudo : null;
  return {
    vidaMax: Math.round(F.vida * (1 + 0.08 * n)) + (esc ? esc.vida : 0),
    atq: F.atq + n + (arma ? arma.atq : 0),
    def: F.def + n + (esc ? esc.def : 0),
  };
}
function vkVida(id) { const s = SAVE.fans[id]; s.vida = Math.max(0, Math.min(vkStats(id).vidaMax, s.vida)); return s.vida; }
function vkDaXpFan(id, xp) {
  const s = SAVE.fans[id]; let sube = false;
  s.xp += xp;
  while (s.xp >= vkXpFan(s.nivel)) { s.xp -= vkXpFan(s.nivel); s.nivel++; sube = true; }
  if (sube) s.vida = Math.min(vkStats(id).vidaMax, s.vida + 15);
  return sube;
}

/* ---------- la aldea ---------- */
function vkDaXpAldea(xp) {
  let sube = false;
  SAVE.xp += xp;
  while (SAVE.xp >= vkXpNivel(SAVE.nivel)) { SAVE.xp -= vkXpNivel(SAVE.nivel); SAVE.nivel++; sube = true; }
  if (sube) { vkAviso(tr('¡Aldea a nivel {n}!', { n: SAVE.nivel }), 'oro'); play('vkNivel'); }
}
const vkCabe = cosa => (SAVE.inv[cosa] || 0) < VK_TOPE_ALMACEN;
function vkMete(cosa, n) { SAVE.inv[cosa] = Math.min(VK_TOPE_ALMACEN, (SAVE.inv[cosa] || 0) + n); }
function vkPuedePagar(coste) {
  for (const k in coste) if ((k === 'oro' ? SAVE.oro : SAVE.inv[k] || 0) < coste[k]) return false;
  return true;
}
function vkPaga(coste) { for (const k in coste) { if (k === 'oro') SAVE.oro -= coste[k]; else SAVE.inv[k] -= coste[k]; } }

// pone una receta en la cola del edificio: empieza cuando acabe la anterior (o ya, si no hay)
function vkEncola(edif, i) {
  const E = VK_EDIFICIOS[edif], r = E.recetas[i], cola = SAVE.colas[edif], ahora = Date.now();
  if (cola.length >= E.cola) return 'llena';
  if (!vkPuedePagar(r.coste)) return 'falta';
  vkPaga(r.coste);
  const ini = cola.length ? cola[cola.length - 1].fin : ahora;
  cola.push({ r: i, ini, fin: ini + r.seg * 1000 });
  vkGuardaLuego();
  return 'ok';
}
// cobra lo que ya ha terminado en todas las colas (también lo hecho con el juego cerrado). Devuelve [{ edif, cosa, n }]
function vkCobra() {
  const ahora = Date.now(), hecho = [];
  for (const edif in SAVE.colas) {
    const cola = SAVE.colas[edif];
    while (cola.length && cola[0].fin <= ahora) {
      const t = cola.shift(), r = VK_EDIFICIOS[edif].recetas[t.r];
      vkMete(r.da, r.n);
      SAVE.hechos[r.da] = (SAVE.hechos[r.da] || 0) + r.n;
      vkDaXpAldea(r.xp);
      hecho.push({ edif, cosa: r.da, n: r.n });
    }
  }
  if (hecho.length) vkGuardaLuego();
  return hecho;
}
// lo que falta de la tarea en marcha de un edificio (0..1) o null si está parado
function vkProgreso(edif) {
  const cola = SAVE.colas[edif]; if (!cola || !cola.length) return null;
  const t = cola[0], ahora = Date.now();
  return Math.max(0, Math.min(1, (ahora - t.ini) / Math.max(1, t.fin - t.ini)));
}
const vkTrabajando = edif => !!(SAVE.colas[edif] && SAVE.colas[edif].length && SAVE.colas[edif][0].ini <= Date.now());

/* ---------- la guía ---------- */
function vkMisionActual() { return VK_MISIONES[SAVE.mision] || null; }
function vkMiraMision() {
  const m = vkMisionActual();
  if (m && m.hecho(SAVE)) {
    SAVE.oro += m.oro; SAVE.mision++;
    vkAviso(tr('Misión cumplida: +{n} de oro', { n: m.oro }), 'oro'); play('vkMision');
    vkGuardaLuego();
  }
}
