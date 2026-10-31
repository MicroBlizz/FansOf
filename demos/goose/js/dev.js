// Fans of Goose · utilidades del panel DEV (31-10-2026, Daniel: «huevos y monedas infinitos y desbloquear todo»). El panel DEV de core
// (core/js/sistema/desarrollo.js) solo existe en la alfa y en localhost, nunca en la web publicada: lo de aquí es solo para probar.
// Incluye las COMPRAS DE PRUEBA: encendidas, lo que se paga con euros (pestaña TESORO) se da sin cobrar (compraEuros en js/monetiza.js).
'use strict';
const esPruebas = () => typeof NUCLEO !== 'undefined' && (NUCLEO.alfa || NUCLEO.desarrollo);
const compraDePrueba = () => esPruebas() && !!SAVE.devCompras;

// con «infinitos» encendido, las monedas y los huevos de oro se rellenan solos cada segundo
const DEV_TOPE = 999999;
setInterval(() => { if (esPruebas() && SAVE.devInfinito && (SAVE.monedas < DEV_TOPE || huevos() < DEV_TOPE)) { SAVE.monedas = DEV_TOPE; SAVE.huevos = DEV_TOPE; guarda(); } }, 1000);

// todo abierto: mejoras al máximo (la Maldición y la Horda compradas pero apagadas), noches, desafíos, aspecto y el Pase Real completo
function devDesbloqueaTodo() {
  for (const m of CFG.tienda) SAVE.mejoras[m.id] = m.max;
  SAVE.activo = Object.assign({}, SAVE.activo, { maldicion: 0, horda: 0 });
  if (!SAVE.desafios) SAVE.desafios = {};
  for (const d of DESAFIOS) SAVE.desafios[d.id] = 1;
  if (typeof NOCHE_MAX !== 'undefined') SAVE.nocheMax = NOCHE_MAX;
  const A = aspecto();
  for (const c of CFG.aspecto.capas) A.capas[c.id] = 1;
  for (const l of CFG.aspecto.luces) A.luces[l.id] = 1;
  const P = paseAlDia(); P.real = true; P.puntos = Math.max(P.puntos, CFG.pase.escalones * CFG.pase.puntos); cobraPase();
}
function devEstado() {
  return `Monedas: ${SAVE.monedas} · Huevos de oro: ${huevos()} · Pase: casilla ${escalonPase()}${paseAlDia().real ? ' (Real)' : ''} · Sin anuncios: ${SAVE.sinAnuncios ? 'sí' : 'no'}`;
}

const UTILIDADES_JUEGO = [{ titulo: 'Fans of Goose: dinero y desbloqueos de prueba', pinta(caja) {
  const fila = () => { const d = document.createElement('div'); d.className = 'fila'; caja.append(d); return d; };
  const repinta = () => { caja.innerHTML = ''; UTILIDADES_JUEGO[0].pinta(caja); };
  const boton = (d, txt, f) => d.append(Object.assign(document.createElement('button'), { textContent: txt, onclick: () => { f(); guarda(); repinta(); } }));
  caja.append(Object.assign(document.createElement('p'), { textContent: devEstado(), style: 'margin:4px 0;color:#ffd34d' }));
  let d = fila();
  boton(d, (SAVE.devInfinito ? '● ' : '') + 'Monedas y huevos INFINITOS', () => { SAVE.devInfinito = !SAVE.devInfinito; if (SAVE.devInfinito) { SAVE.monedas = DEV_TOPE; SAVE.huevos = DEV_TOPE; } });
  boton(d, '+10000 monedas', () => { SAVE.monedas += 10000; });
  boton(d, '+1000 huevos de oro', () => { SAVE.huevos = huevos() + 1000; });
  d = fila();
  boton(d, 'DESBLOQUEAR TODO', devDesbloqueaTodo);
  boton(d, (SAVE.devCompras ? '● ' : '') + 'Compras con euros DE PRUEBA', () => { SAVE.devCompras = !SAVE.devCompras; });
  d = fila();
  boton(d, 'Pase: +1 casilla', () => { paseAlDia().puntos += CFG.pase.puntos; cobraPase(); });
  boton(d, 'Pase Real sí/no', () => { const P = paseAlDia(); P.real = !P.real; if (P.real) cobraPase(); });
  boton(d, 'Sin anuncios sí/no', () => { SAVE.sinAnuncios = SAVE.sinAnuncios ? 0 : 1; });
  boton(d, 'Volver a comprar packs', () => { SAVE.compras = {}; });
  d = fila();
  boton(d, 'Monedas y huevos a 0', () => { SAVE.devInfinito = 0; SAVE.monedas = 0; SAVE.huevos = 0; });
} }];
