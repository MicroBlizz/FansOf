// Fans of Pop · utilidades del panel DEV (31-10-2026, Daniel: «dinero ficticio para comprar las cosas del juego y probar los packs»).
// El panel DEV de core (core/js/sistema/desarrollo.js) solo existe en la alfa y en localhost, nunca en la web publicada: lo que se
// toca aquí es solo para probar. Incluye las COMPRAS DE PRUEBA: con ellas encendidas, los packs con euros (ofertas, perlas, hucha y
// pase) se dan sin cobrar nada (ppCompraDePrueba en js/ofertas.js y js/tienda.js).
'use strict';
const ppEsPruebas = () => typeof NUCLEO !== 'undefined' && (NUCLEO.alfa || NUCLEO.desarrollo);
const ppCompraDePrueba = () => ppEsPruebas() && !!SAVE.devCompras;
const UTILIDADES_JUEGO = [{ titulo: 'Fans of Pop: dinero de prueba', pinta(caja) {
  const fila = () => { const d = document.createElement('div'); d.className = 'fila'; caja.append(d); return d; };
  const boton = (d, txt, f) => d.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: () => { f(); ppGuarda(); ppRefrescaTodo(); estado.textContent = ppDevEstado(); } }));
  const estado = Object.assign(document.createElement('p'), { textContent: ppDevEstado(), style: 'margin:4px 0;color:#cdb9ea' });
  caja.append(estado);
  let d = fila();
  boton(d, '+100 perlas', () => { SAVE.perlas = (SAVE.perlas || 0) + 100; });
  boton(d, '+1000 perlas', () => { SAVE.perlas = (SAVE.perlas || 0) + 1000; });
  boton(d, '+1000 monedas', () => { SAVE.monedas += 1000; });
  boton(d, '+10000 monedas', () => { SAVE.monedas += 10000; });
  d = fila();
  boton(d, '+5 de cada ayuda', () => { for (const k in PP_CFG.ayudas) ppDaAyuda(k, 5); });
  boton(d, 'Llenar corazones', () => { SAVE.vidas = PP_CFG.vida; SAVE.vidaT = Date.now(); });
  boton(d, 'Quitar corazones', () => { SAVE.vidas = 0; SAVE.vidaT = Date.now(); SAVE.infinitas = 0; });
  boton(d, 'Infinitos 1 h', () => ppDaInfinitas(60));
  d = fila();
  boton(d, (SAVE.devCompras ? '● ' : '') + 'Compras con euros DE PRUEBA', () => { SAVE.devCompras = !SAVE.devCompras; caja.innerHTML = ''; UTILIDADES_JUEGO[0].pinta(caja); });
  boton(d, 'Volver a ver las ofertas', () => { SAVE.compras = {}; SAVE.vistoBienvenida = false; SAVE.atasco = 0; SAVE.atascoDia = ''; SAVE.regaloDia = ''; if (typeof PP_PASE_VISTO !== 'undefined') PP_PASE_VISTO.regalo = false; });
  boton(d, 'Abrir oferta de atasco', () => { SAVE.atasco = Date.now() + PP_CFG.ofertas.atasco.dura * 60000; SAVE.atascoDia = ppHoy(); });
  d = fila();
  boton(d, 'Hucha llena', () => { SAVE.hucha = PP_CFG.hucha.max; });
  boton(d, 'Pase: +30 puntos', () => { ppPaseAlDia().puntos += 30; });
  boton(d, 'Pase premium sí/no', () => { const P = ppPaseAlDia(); P.premium = !P.premium; });
  boton(d, 'Todas las bandejas', () => { SAVE.bandejas = {}; for (const B of PP_BANDEJAS) SAVE.bandejas[B.id] = true; });
  boton(d, 'Racha x3', () => { SAVE.racha = PP_CFG.racha.max; });
  d = fila();
  boton(d, 'Abrir todos los mundos', () => { if (!PP_P && !ppSigueCamino()) ppNuevaRuta(); PP_P.nivel = PP_TOTAL_NIVELES; ppGuardaCamino(); });
} }];
const ppDevEstado = () => `Perlas ${SAVE.perlas || 0} · Monedas ${SAVE.monedas} · Corazones ${ppVidas()} · Compras de prueba: ${SAVE.devCompras ? 'SÍ' : 'NO'}`;
// tras tocar algo en el panel, que se vea ya: la barra de ayudas, los botones del camino y la portada
function ppRefrescaTodo() { ppBarraAyudas(); ppPintaLateral(); if (PP_PANT.actual === 'titulo') ppIrA('titulo'); }
