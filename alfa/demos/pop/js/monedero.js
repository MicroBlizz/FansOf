// Fans of Pop · MONEDERO (fase 2 de los mundos, 30-10-2026): los CORAZONES que se recargan solos (como Candy Crush: 5, uno
// cada 30 minutos, se pierde uno al fallar un nivel), las MONEDAS (la moneda ganada: solo sale de jugar y nunca se vende,
// ADR 004), los COFRES de premio y lo que se compra con monedas: llenar los corazones y los HUECOS extra del equipo.
// Todo vive en SAVE (no en el camino): empezar de nuevo no devuelve corazones ni quita lo comprado.
'use strict';
// --- corazones ---
// pone al día los corazones según el tiempo que ha pasado (también con el juego cerrado) y dice cuántos hay
function ppVidas() {
  const ahora = Date.now(), max = PP_CFG.vida, cada = PP_CFG.recarga;
  if (SAVE.vidas >= max) { SAVE.vidaT = ahora; return SAVE.vidas; }
  if (!SAVE.vidaT || SAVE.vidaT > ahora) SAVE.vidaT = ahora;   // reloj cambiado hacia atrás: se cuenta desde ahora
  const n = Math.floor((ahora - SAVE.vidaT) / cada);
  if (n > 0) { SAVE.vidas = Math.min(max, SAVE.vidas + n); SAVE.vidaT = SAVE.vidas >= max ? ahora : SAVE.vidaT + n * cada; ppGuarda(); }
  return SAVE.vidas;
}
// milisegundos hasta el siguiente corazón (0 si están todos)
function ppFaltaVida() { return ppVidas() >= PP_CFG.vida ? 0 : Math.max(0, SAVE.vidaT + PP_CFG.recarga - Date.now()); }
const ppReloj = ms => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function ppPierdeVida() {
  const lleno = ppVidas() >= PP_CFG.vida;
  SAVE.vidas = Math.max(0, SAVE.vidas - 1);
  if (lleno) SAVE.vidaT = Date.now();   // el reloj de la recarga empieza al perder el primero
  ppGuarda();
}
function ppSumaVida(n) { ppVidas(); SAVE.vidas = Math.min(PP_CFG.vida, SAVE.vidas + n); ppGuarda(); }
// --- monedas ---
function ppCobra(precio) { if (SAVE.monedas < precio) return false; SAVE.monedas -= precio; ppGuarda(); return true; }
function ppLlenaVidas() { if (ppVidas() >= PP_CFG.vida || !ppCobra(PP_CFG.precioVidas)) return false; SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); ppGuarda(); return true; }
// --- huecos del equipo: 4 de serie y hasta 2 más comprados (nunca más que amigos haya), cada uno más caro ---
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
  while (Math.floor(total / PP_CFG.cofreCada) > SAVE.cofres) { SAVE.cofres++; p.cofre += PP_CFG.cofre[0] + Math.floor(Math.random() * (PP_CFG.cofre[1] - PP_CFG.cofre[0] + 1)); }
  if (nuevo && jefe) p.cofre += PP_CFG.cofreJefe * x;
  SAVE.monedas += p.monedas + p.cofre; ppGuarda();
  return p;
}
// --- salir a media partida cuesta un corazón (si ya has tocado algo), también cerrando el juego: así no se esquiva perder ---
function ppMarcaDentro(si) { if (!!SAVE.dentro === si) return; SAVE.dentro = si; ppGuarda(); }
function ppRevisaDentro() { if (SAVE.dentro) { SAVE.dentro = false; ppPierdeVida(); } }
