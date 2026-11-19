// Fans of Pop · PASE NUEVO, lo del juego (tarea #165, ADR 165): tras el flag 'pase-nuevo' (abierto solo en la alfa). Puntos por todo
// el juego (niveles nuevos y repetidos, duelos, tickets de la Feria y 3 misiones diarias con RETOSL de core), tema del mes, Pase dorado y
// Dorado+, y escalones extra tras el 60. Las reglas son PP_PASE_R (js/pase-reglas.js) y los temas PP_PASE_TEMAS (js/pase-temas.js);
// la pantalla, js/pase-pantalla.js. Los puntos nuevos van en SAVE.pase.p2 (los del pase de siempre no se tocan: el flag se puede cerrar).
'use strict';
const ppPaseNuevo = () => NUCLEO.flag('pase-nuevo', 'Pop: pase completo, con tema al mes, puntos por todo, misiones, Dorado+ y escalones extra (tarea #165)', false);
// los puntos nuevos de esta temporada (la primera vez, los del pase de siempre pasados a la escala nueva, sin perder escalón)
function ppPasePuntos() {
  const P = ppPaseAlDia();
  if (typeof P.p2 !== 'number') { P.p2 = PP_PASE_R.desdeViejos(P.puntos); P.extra = 0; }
  return P.p2;
}
const ppPaseTema = () => PP_PASE_TEMAS.de(ppPaseAlDia().t);
// los puntos ganados jugando hoy (para el tope diario)
function ppPaseHoy() {
  const P = ppPaseAlDia();
  if (!P.hoy || P.hoy.dia !== ppHoy()) P.hoy = { dia: ppHoy(), n: 0 };
  return P.hoy;
}
// suma n puntos ganados jugando (con el tope del día: PP_PASE_R.conTope); devuelve { n, sube, escalon, tope }
function ppPaseSumaJugando(n) {
  const H = ppPaseHoy(), m = PP_PASE_R.conTope(H.n, n);
  H.n += m;
  return { ...ppPaseSuma(m), tope: m < n };
}
// suma n puntos; devuelve { n, sube, escalon } (sube: escalones nuevos, también los extra)
function ppPaseSuma(n) {
  const P = ppPaseAlDia(), r = PP_PASE_R.suma(ppPasePuntos(), n);
  P.p2 = r.puntos; ppGuarda();
  return { n, sube: r.sube, escalon: PP_PASE_R.escalon(r.puntos) + PP_PASE_R.extras(r.puntos) };
}
// el premio de un escalón con el tema del mes; el compañero (la Suricata y la Luciérnaga en el 15, el del mes en el 60) solo con el
// flag `companeros` abierto (js/coleccion-juego.js)
function ppPremioPaseNuevo(k, premium) {
  const base = premium ? PP_PASE_R.dorado(k, ppPaseTema()) : PP_PASE_R.gratis(k);
  const comp = base.companero || (k === 15 ? PP_COLE.delPase(k, premium) : null);
  const { companero, ...resto } = base;
  return comp && ppCompanerosActivo() ? { ...resto, companero: comp } : resto;
}
/* ---------- escalones extra (tras el 60) ---------- */
function ppPaseExtrasListos() {
  const n = PP_PASE_R.extrasListos(ppPasePuntos(), ppPaseAlDia().extra || 0);
  return Array.from({ length: n }, () => ({ extra: true }));
}
function ppPaseEntregaExtra() {
  const P = ppPaseAlDia(); P.extra = (P.extra || 0) + 1;
  ppDaPremio(PP_PASE_R.premioExtra(P.premium), { motivo: 'pase', clave: PP_PASE_R.claveExtra(P.t, P.extra) });
}
/* ---------- de dónde salen los puntos ---------- */
// una victoria en un nivel (nueva o repetida) y sus tickets de la Feria (js/partida.js, ppSalaHecha). Con el flag cerrado, null
function ppPaseGana(nuevo, estrellas, tickets) {
  if (!ppPaseNuevo()) return null;
  ppPaseMision('nivel'); if (!nuevo) ppPaseMision('repetido'); if (estrellas === 3) ppPaseMision('tres');
  return ppPaseSumaJugando(PP_PASE_R.deNivel(nuevo, estrellas, tickets));
}
// un duelo ganado (contra el CEO o contra gente; js/duelo.js)
function ppPaseDuelo() {
  if (!ppPaseNuevo()) return;
  ppPaseMision('duelo'); ppPaseSumaJugando(PP_PASE_R.CFG.puntos.duelo);
}
// misiones diarias: 3 al día de esta lista (las mismas para todo el mundo); cada una da 5 puntos al cobrarla
const PP_PASE_MIS = RETOSL.crear({
  save: () => { SAVE.paseMis = SAVE.paseMis || {}; return SAVE.paseMis; },
  guardar: () => ppGuarda(),
  pagar: r => ppPaseSuma(r.puntos),
  diarias: [
    { id: 'gana3', txt: 'Gana 3 niveles', goal: 3, ev: 'nivel', r: { puntos: 5 } },
    { id: 'gana5', txt: 'Gana 5 niveles', goal: 5, ev: 'nivel', r: { puntos: 5 } },
    { id: 'tres1', txt: 'Consigue 3 estrellas en un nivel', goal: 1, ev: 'tres', r: { puntos: 5 } },
    { id: 'tres2', txt: 'Consigue 3 estrellas en 2 niveles', goal: 2, ev: 'tres', r: { puntos: 5 } },
    { id: 'duelo1', txt: 'Gana un duelo', goal: 1, ev: 'duelo', r: { puntos: 5 } },
    { id: 'repe1', txt: 'Vuelve a ganar un nivel que ya pasaste', goal: 1, ev: 'repetido', r: { puntos: 5 } },
  ],
  semanales: [], logros: [], nDiarias: 3, nSemanales: 0,
});
const ppPaseMision = ev => PP_PASE_MIS.evento(ev, 1);
/* ---------- comprar ---------- */
// el Pase dorado (4,99 €) o el Dorado+ (9,99 €, salta 10 escalones). Compra de prueba en la alfa: el cobro de verdad es la tarea #167
function ppPaseCompra(plus) {
  const C = PP_CFG.pase, nombre = plus ? tr('Pase dorado+') : tr('Pase dorado');
  const html = `<p>${plus ? tr('Todos los premios dorados de este mes y 10 escalones de golpe.') : tr('Todos los premios dorados de este mes.')}</p>`;
  ppCompraEuros(nombre, html, plus ? C.plus.id : C.id, () => {
    const P = ppPaseAlDia();
    if (P.premium && (P.plus || !plus)) return;   // ya lo tenía (dos ventanas de compra a la vez): no salta otra vez
    P.premium = true; P.plus = !!plus;
    ppPaseSuma(PP_PASE_R.deCompra(plus)); ppGuarda(); ppVentanaPase(); ppPintaLateral();
  });
}
// la línea del pase en la ventana de victoria
function ppPaseLinea(T) {
  if (!T || !T.pase) return '';
  if (!T.pase.n && T.pase.tope) return `<div class="pp-gana-tk">${ppIcono('i-pase', 26, '#ffd64a')} ${tr('Pase: tope de hoy alcanzado. ¡Mañana más!')}</div>`;
  const sube = T.pase.sube > 0 ? ` · <b>${tr('¡Escalón {e}!', { e: T.pase.escalon })}</b>` : '';
  return `<div class="pp-gana-tk">${ppIcono('i-pase', 26, '#ffd64a')} ${tr('+{n} puntos del pase', { n: T.pase.n })}${sube}</div>`;
}
