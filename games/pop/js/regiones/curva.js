// Fans of Pop · la curva de dificultad de «la lista» por región (tarea #152). Dominio puro: sin pantalla, azar, reloj ni guardado.
// ppCurvaLista da la probabilidad base de que la jugadora lista pase un nivel (antes del respiro tras un difícil y del modo difícil,
// que pone ppObjetivo en js/niveles.js). La región 1 es la del ADR 214 y no se toca; las demás bajan del `inicio` al `fin` de PP_CFG.curvaRegion.
// Se carga después de js/regiones/regiones.js y antes de js/niveles.js.
'use strict';
const PP_CURVA_R1 = { inicio: 0.85, caida: 0.3 };   // región 1 (ADR 214): del 85 % al empezar el mundo 2 al 55 % al acabar el último. No se toca.
// region: 1-10 · w: mundo dentro de su región (0-9) · l: nivel (1..niveles) · niveles: niveles del mundo · cfg: { inicio, fin } de las regiones 2-10
// Fuera de rango es un fallo de programación: lanza (la región 1 empieza en su mundo 2, w = 1: el mundo 1 lo mide la normal).
function ppCurvaLista(region, w, l, niveles, cfg) {
  if (!Number.isInteger(region) || region < 1 || region > PP_REGIONES.length) throw new Error('ppCurvaLista: no existe la región ' + region);
  if (!Number.isInteger(w) || w < (region === 1 ? 1 : 0) || w >= PP_MUNDOS_POR_REGION) throw new Error('ppCurvaLista: mundo ' + w + ' fuera de la región ' + region);
  if (!(l >= 1 && l <= niveles)) throw new Error('ppCurvaLista: nivel ' + l + ' fuera de 1..' + niveles);
  if (!(cfg && cfg.inicio >= cfg.fin)) throw new Error('ppCurvaLista: la curva de las regiones tiene que bajar (inicio >= fin)');
  const avance = l / niveles;
  if (region === 1) return PP_CURVA_R1.inicio - PP_CURVA_R1.caida * ((w - 1 + avance) / (PP_MUNDOS_POR_REGION - 1));
  const p = (w + avance) / PP_MUNDOS_POR_REGION;
  return Math.max(cfg.fin, cfg.inicio - (cfg.inicio - cfg.fin) * p);
}
