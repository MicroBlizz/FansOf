// Fans of Pop · MONEDERO (fase 2 de los mundos, 30-10-2026): los CORAZONES que se recargan solos (como Candy Crush: 5, uno
// cada 30 minutos, se pierde uno al fallar un nivel), las MONEDAS (la moneda ganada: solo sale de jugar y nunca se vende,
// ADR 004), los COFRES de premio y lo que se compra con monedas: llenar los corazones y los HUECOS extra del equipo.
// Todo vive en SAVE (no en el camino): empezar de nuevo no devuelve corazones ni quita lo comprado.
'use strict';
// --- corazones ---
// pone al día los corazones según el tiempo que ha pasado (también con el juego cerrado) y dice cuántos hay
function ppVidas() {
  const ahora = Date.now(), max = PP_CFG.vida, cada = PP_CFG.recarga;
  if (ppInfinitas()) return max;   // corazones infinitos (js/ofertas.js): siempre llenos mientras duran
  if (SAVE.vidas >= max) { SAVE.vidaT = ahora; return SAVE.vidas; }
  if (!SAVE.vidaT || SAVE.vidaT > ahora) SAVE.vidaT = ahora;   // reloj cambiado hacia atrás: se cuenta desde ahora
  const n = Math.floor((ahora - SAVE.vidaT) / cada);
  if (n > 0) { SAVE.vidas = Math.min(max, SAVE.vidas + n); SAVE.vidaT = SAVE.vidas >= max ? ahora : SAVE.vidaT + n * cada; ppGuarda(); }
  return SAVE.vidas;
}
// milisegundos hasta el siguiente corazón (0 si están todos)
function ppFaltaVida() { return ppVidas() >= PP_CFG.vida ? 0 : Math.max(0, SAVE.vidaT + PP_CFG.recarga - Date.now()); }
const ppReloj = ms => { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
// corazones infinitos: hasta cuándo (SAVE.infinitas, ms); se compran con perlas o vienen en ofertas y en el pase
const ppInfinitas = () => (SAVE.infinitas || 0) > Date.now();
function ppDaInfinitas(min) { SAVE.infinitas = Math.max(Date.now(), SAVE.infinitas || 0) + min * 60000; ppGuarda(); }
// `guardaRacha`: la racha sigue (Racha a salvo de los compañeros, js/habilidades-niveles.js)
function ppPierdeVida(guardaRacha = false) {
  if (!guardaRacha) SAVE.racha = PP_PRESION.bajaRacha(SAVE.racha);   // perder un corazón baja la racha un escalón (js/presion.js, tarea #186)
  if (ppInfinitas()) { ppGuarda(); return; }
  const lleno = ppVidas() >= PP_CFG.vida;
  SAVE.vidas = Math.max(0, SAVE.vidas - 1);
  if (lleno) SAVE.vidaT = Date.now();   // el reloj de la recarga empieza al perder el primero
  ppGuarda();
}
function ppSumaVida(n) { ppVidas(); SAVE.vidas = Math.min(PP_CFG.vida, SAVE.vidas + n); ppGuarda(); }
// los corazones que ya ha dado hoy la Caja de botín (tarea #236): solo da PP_CFG.cofreVidasDia al día; el contador se pone a cero cada día
function ppCofreVidasHoy() { if (SAVE.cofreDia !== ppHoy()) { SAVE.cofreDia = ppHoy(); SAVE.cofreHoy = 0; } return SAVE.cofreHoy; }
const ppCofreDaVida = () => ppVidas() < PP_CFG.vida && ppCofreVidasHoy() < PP_CFG.cofreVidasDia;
// --- monedas ---
function ppCobra(precio) { if (SAVE.monedas < precio) return false; SAVE.monedas -= precio; ppGuarda(); return true; }
function ppLlenaVidas() { if (ppVidas() >= PP_CFG.vida || !ppCobra(PP_CFG.precioVidas)) return false; SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); ppGuarda(); return true; }
// --- huecos del equipo: 3 de serie y hasta 3 más comprados (nunca más que amigos haya), cada uno más caro ---
const ppHuecos = () => PP_CFG.equipo + (SAVE.huecos || 0);
const ppHuecosMax = () => Math.min(PP_CFG.huecosMax, PP_SLIME_IDS.length);
const ppPrecioHueco = () => (ppHuecos() < ppHuecosMax() ? PP_CFG.precioHueco[SAVE.huecos || 0] : null);
function ppCompraHueco() { const p = ppPrecioHueco(); if (p === null || !ppCobra(p)) return false; SAVE.huecos = (SAVE.huecos || 0) + 1; ppGuarda(); return true; }
// --- el premio de un nivel superado ---
// Monedas solo por lo NUEVO (para que repetir los primeros niveles no dé monedas sin fin): la primera vez que lo pasas y cada
// estrella que mejora tu récord en ese nivel. Cada PP_CFG.cofreCada estrellas de récord, un cofre; cada jefe nuevo, un cofre grande.
// `clave`: el nivel global (y 'd' delante en difícil, que da el doble: `x`).
function ppPremioNivel(clave, estrellas, jefe, x = 1) {
  const antes = SAVE.mejor[clave] || 0, nuevo = !(clave in SAVE.mejor);
  const p = { monedas: 0, cofre: 0 };
  if (nuevo) p.monedas += (jefe ? PP_CFG.monedas.jefe : PP_CFG.monedas.nivel) * x;
  if (estrellas > antes) { p.monedas += (estrellas - antes) * PP_CFG.monedas.estrella * x; SAVE.mejor[clave] = estrellas; }
  else if (nuevo) SAVE.mejor[clave] = estrellas;
  const total = Object.values(SAVE.mejor).reduce((a, b) => a + b, 0);
  // `p.cofresAbiertos`: cuántos cofres de estrellas se han abierto ahora (con el flag `companeros`, cada uno da un compañero: js/companeros-vias.js)
  while (Math.floor(total / PP_CFG.cofreCada) > SAVE.cofres) { SAVE.cofres++; p.cofresAbiertos = (p.cofresAbiertos || 0) + 1; p.cofre += PP_CFG.cofre[0] + Math.floor(Math.random() * (PP_CFG.cofre[1] - PP_CFG.cofre[0] + 1)); }
  if (nuevo && jefe) { p.cofre += PP_CFG.cofreJefe * x; p.perlas = PP_CFG.perlas.jefe; ppPerlas(p.perlas, 'jefe', 'jefe:' + clave); }
  if (p.monedas && typeof ppEnEquipo === 'function' && ppEnEquipo('maneki')) p.monedas = Math.round(p.monedas * (1 + ppFxDe('maneki').monedas));   // el Gatito de la suerte
  SAVE.monedas += p.monedas + p.cofre; ppGuarda();
  return p;
}
// --- salir a media partida cuesta un corazón (si ya has tocado algo), también cerrando el juego: así no se esquiva perder ---
// en los niveles gratis de una partida nueva (1 a 3, js/primeros-pasos-juego.js) salir no cuesta, así que tampoco se marca: recargar ahí
// no quita el corazón ni lo avisa (tarea #185)
function ppMarcaDentro(si) { si = si && !ppPrimerosGratis(); if (!!SAVE.dentro === si) return; SAVE.dentro = si; ppGuarda(); }
// al abrir el juego: true si se cerró a media partida y ha costado un corazón (entonces se avisa: tarea #185); con infinitos no cuesta
function ppRevisaDentro() { if (!SAVE.dentro) return false; SAVE.dentro = false; const cuesta = !ppInfinitas(); ppPierdeVida(); return cuesta; }
