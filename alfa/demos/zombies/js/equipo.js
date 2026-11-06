// Fans of Zombies · LA ROPA Y LA MOCHILA (dominio, ADR 079): lo que llevas puesto (J.equipo: cabeza, cuerpo, piernas, pies y la
// mochila), ponerse y quitarse las cosas, cambiar de mochila (lo que no cabe en la nueva se queda en el sitio o en el suelo), coser
// con tela, lo que gasta cada mordisco y lo que hace la ropa (frío, calor, mordiscos, infección, huellas, ruido y aguante).
// Las cifras están en AJ.ropa, AJ.vestir y AJ.mochilas.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  // las bolsas de un superviviente nuevo: la mochila de partida (JunkCoon, una fila más), la riñonera y los bolsillos
  Z.nuevoEquipo = function (AJ, A) {
    const M = AJ.mochilas[AJ.mochilaInicio], filaExtra = A.mochilaExtra || 0;
    return {
      equipo: { cabeza: null, cuerpo: null, piernas: null, pies: null, mochila: AJ.mochilaInicio },
      mochila: Z.nuevaMochila(M.w, M.h + filaExtra), rinonera: Z.nuevaMochila(AJ.rinonera.w, AJ.rinonera.h), bolsillos: Z.nuevaMochila(AJ.bolsillos.w, AJ.bolsillos.h, true), filaExtra,
    };
  };
  // las partidas de antes de la ropa (mochila de 6 x 5): pasan a la de mudanza, que es más grande, así no se pierde nada
  Z.pasaEquipo = function (AJ, J) {
    if (J.equipo) return;
    const M = AJ.mochilas.mochilaG, filaExtra = J.A.mochilaExtra || 0;
    J.equipo = { cabeza: null, cuerpo: null, piernas: null, pies: null, mochila: 'mochilaG' };
    J.mochila.w = Math.max(J.mochila.w, M.w); J.mochila.h = Math.max(J.mochila.h, M.h + filaExtra); J.filaExtra = filaExtra;
    J.rinonera = Z.nuevaMochila(AJ.rinonera.w, AJ.rinonera.h); J.bolsillos = Z.nuevaMochila(AJ.bolsillos.w, AJ.bolsillos.h, true);
  };
  Z.esRopa = (AJ, id) => !!AJ.ropa[id];
  Z.esMochila = (AJ, id) => !!AJ.mochilas[id];
  const AJ_HUECOS = ['cabeza', 'cuerpo', 'piernas', 'pies'];
  Z.puesto = (J) => AJ_HUECOS.map((h) => J.equipo && J.equipo[h]).filter(Boolean);

  // ponerse algo: desde una de tus bolsas ({ bolsa, uid }) o desde el sitio abierto ({ i })
  Z.ponerse = function (AJ, e, desde) {
    const r = tomar(e, desde);
    if (!r.ok) return r;
    const cosa = r.valor;
    if (Z.esRopa(AJ, cosa.id)) return Z.ok(ponPrenda(AJ, e, cosa));
    if (Z.esMochila(AJ, cosa.id)) return Z.ok(cambiaMochila(AJ, e, cosa));
    devolver(AJ, e, desde, cosa);
    return Z.error('noSePone', { id: cosa.id });
  };
  // coge la cosa de donde esté (sin dejarla en ningún sitio todavía)
  function tomar(e, desde) {
    if (desde.bolsa) { const m = e.jugador[desde.bolsa]; return m ? Z.sacar(m, desde.uid) : Z.error('noEsta'); }
    const lista = e.abierto && e.contenidos[e.abierto], c = lista && lista[desde.i];
    if (!c) return Z.error('noEsta');
    lista.splice(desde.i, 1);
    return Z.ok(c.dur != null ? { id: c.id, n: 1, dur: c.dur } : { id: c.id, n: 1 });
  }
  function devolver(AJ, e, desde, cosa) {
    if (desde.bolsa) { if (Z.meter(AJ, e.jugador[desde.bolsa], cosa.id, cosa.n, cosa.dur)) Z.dejaEnSitio(e, cosa); return; }
    Z.dejaEnSitio(e, cosa);
  }
  // la prenda va a su hueco; la que llevabas ahí, a tus bolsas (o al sitio o al suelo si no cabe)
  function ponPrenda(AJ, e, cosa) {
    const J = e.jugador, h = AJ.ropa[cosa.id].hueco, antes = J.equipo[h];
    J.equipo[h] = { id: cosa.id, dur: cosa.dur ?? AJ.ropa[cosa.id].dur };
    if (antes) guardaOSuelta(AJ, e, { id: antes.id, n: 1, dur: antes.dur });
    e.eventos.push({ tipo: 'viste', id: cosa.id });
    return h;
  }
  function guardaOSuelta(AJ, e, cosa) { if (Z.meterLleva(AJ, e.jugador, cosa.id, 1, cosa.dur)) Z.dejaEnSitio(e, cosa); }
  // la mochila nueva: lo de la vieja pasa a la nueva (lo grande primero); lo que no cabe y la mochila vieja se quedan en el sitio
  function cambiaMochila(AJ, e, cosa) {
    const J = e.jugador, M = AJ.mochilas[cosa.id], vieja = J.mochila, antes = J.equipo.mochila;
    const nueva = Z.nuevaMochila(M.w, M.h + (J.filaExtra || 0));
    const cosas = vieja.piezas.slice().sort((a, b) => Z.formaDe(AJ, b.id).c.length - Z.formaDe(AJ, a.id).c.length);
    for (const p of cosas) { const queda = Z.meter(AJ, nueva, p.id, p.n, p.dur); if (queda) Z.dejaEnSitio(e, p.dur != null ? { id: p.id, n: queda, dur: p.dur } : { id: p.id, n: queda }); }
    J.mochila = nueva; J.equipo.mochila = cosa.id;
    if (antes) Z.dejaEnSitio(e, { id: antes, n: 1 });
    e.eventos.push({ tipo: 'viste', id: cosa.id });
    return 'mochila';
  }
  // quitarse una prenda: a tus bolsas, o al sitio o al suelo si no cabe. La mochila no se quita (se cambia por otra)
  Z.quitarse = function (AJ, e, hueco) {
    const J = e.jugador, p = AJ_HUECOS.includes(hueco) && J.equipo[hueco];
    if (!p) return Z.error('noEsta', { hueco });
    J.equipo[hueco] = null;
    guardaOSuelta(AJ, e, { id: p.id, n: 1, dur: p.dur });
    return Z.ok(p.id);
  };
  // coser: con una tela, la prenda más gastada que llevas puesta recupera AJ.vestir.coser
  Z.coser = function (AJ, e) {
    const J = e.jugador, p = AJ_HUECOS.map((h) => J.equipo[h]).filter((q) => q && q.dur < AJ.ropa[q.id].dur).sort((a, b) => a.dur / AJ.ropa[a.id].dur - b.dur / AJ.ropa[b.id].dur)[0];
    if (!p) return Z.error('nadaQueCoser');
    if (!Z.gastaLleva(J, 'tela', 1).ok) return Z.error('faltan', { faltan: [['tela', 1]] });
    p.dur = Math.min(AJ.ropa[p.id].dur, p.dur + AJ.vestir.coser);
    e.eventos.push({ tipo: 'cose', id: p.id });
    return Z.ok(p.id);
  };
  // cada mordisco gasta todo lo que llevas puesto; lo que llega a cero se rompe
  Z.gastaRopa = function (AJ, e) {
    const J = e.jugador;
    for (const h of AJ_HUECOS) {
      const p = J.equipo[h];
      if (!p || (p.dur -= AJ.vestir.gastaMordisco) > 0) continue;
      J.equipo[h] = null; e.eventos.push({ tipo: 'ropaRota', id: p.id });
    }
  };

  /* ---------- lo que hace la ropa ---------- */
  // la suma de un efecto en todo lo que llevas puesto
  Z.ropa = (AJ, J, que) => AJ_HUECOS.reduce((s, h) => s + ((J.equipo && J.equipo[h] && AJ.ropa[J.equipo[h].id][que]) || 0), 0);
  // el hambre de la estación: el frío del invierno (hambre > 1) se quita con ropa de abrigo
  Z.hambreRopa = (AJ, J, E) => (E.hambre > 1 ? 1 + (E.hambre - 1) * (1 - Math.min(1, Z.ropa(AJ, J, 'frio'))) : E.hambre);
  // la sed de la estación: en verano (sed > 1) el abrigo da más
  Z.sedRopa = (AJ, J, E) => (E.sed > 1 ? E.sed * (1 + Z.ropa(AJ, J, 'calor')) : E.sed);
  // lo que queda del daño de un mordisco y de la probabilidad de infección
  Z.mordiscoRopa = (AJ, J) => 1 - Math.min(AJ.vestir.danoMax, Z.ropa(AJ, J, 'dano'));
  Z.infeccionRopa = (AJ, J) => 1 - Math.min(1, Z.ropa(AJ, J, 'infeccion'));
  // tus pasos (zapatillas) y tus ruidos con lluvia (chubasquero)
  Z.pasosRopa = (AJ, J) => 1 - Math.min(0.9, Z.ropa(AJ, J, 'pasos'));
  Z.lluviaRopa = (AJ, J, E) => (E.ruido < 1 ? 1 - Math.min(0.9, Z.ropa(AJ, J, 'lluvia')) : 1);
  // cada cuántos pasos dejas una huella (MadSquirrel y las botas de nieve: menos)
  Z.cadaHuella = (AJ, J) => Math.max(1, Math.round(1 / ((J.A.huellas || 1) * (1 - Math.min(0.9, Z.ropa(AJ, J, 'huellas'))))));
  // lo que gasta correr: el chándal ayuda; en el barro de la primavera cansa más, salvo con botas de goma
  Z.correrRopa = (AJ, J, E) => (1 - Math.min(0.9, Z.ropa(AJ, J, 'correr'))) * (E.barro && !Z.ropa(AJ, J, 'barro') ? E.barro : 1);
  // la mochila de mudanza pesa
  Z.velMochila = (AJ, J) => (J.equipo && AJ.mochilas[J.equipo.mochila] && AJ.mochilas[J.equipo.mochila].vel) || 1;
})(ZOM);
