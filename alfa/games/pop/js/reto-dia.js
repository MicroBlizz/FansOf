// Fans of Pop · EL RETO DEL DÍA (tarea 367, ADR 226; reglas en js/reto-dia-reglas.js, servidor en js/reto-dia-servidor.js): cada día la misma
// melodía de Memoria para todos, en el mundo del día, en Normal y sin ayudas, con su ranking del día. Todo en PP_RETO:
// · tarjeta(): la tarjeta dorada de arriba de la pantalla de elegir Memoria (js/memoria-elige.js): el mundo de hoy, los intentos y el botón
//   del siguiente (gratis; luego perlas o, donde hay anuncios, un anuncio). Antes de cobrar se mira otra vez que el intento siga siendo ese.
// · ronda(M): cada ronda superada guarda ya tu mejor de hoy y sus monedas (js/memoria.js): si sales a medias o se cierra el juego, no se pierde.
// · fin(M, rondas): al fallar, la ventana con tus monedas, tu mejor de hoy y tu puesto (el servidor lo dice al subir).
// · sube(): sube tu mejor marca guardada si el servidor aún no la tiene, con su propio día (una partida que pasa de medianoche cuenta
//   para el día en que empezó); sin red, se queda para luego. ranking(dia): el del día, para la pestaña «Hoy» (js/ranking.js).
// El día es el de España con el reloj de confianza (HORA). Lo de hoy se guarda en SAVE.reto. Todo tras el flag 'reto-dia'.
'use strict';
const PP_RETO = (() => {
  const C = () => PP_CFG.reto;
  const srv = PP_RETO_SERVIDOR.crea({ rpc: (n, a) => CUENTA.rpc(n, a), hay: () => ppHayRanking() });
  let subida = null;   // la subida en marcha (una a la vez)
  const activo = () => NUCLEO.flag('reto-dia', 'Pop: reto del día de Memoria con ranking del día (tarea 367)', false);
  const dia = () => new Date(typeof HORA !== 'undefined' ? HORA.ahora() : Date.now()).toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  const estado = () => PP_RETO_R.deHoy(SAVE.reto, dia());
  // lo guardado con su propio día (puede ser el de ayer si la partida pasó de medianoche)
  const guardado = () => (SAVE.reto && PP_RETO_R.diaValido(SAVE.reto.dia) ? PP_RETO_R.deHoy(SAVE.reto, SAVE.reto.dia) : null);

  function sube() {
    if (subida) return subida.then(() => sube());   // tras la que está en marcha, por si ya hay otra marca mejor
    const e = guardado();
    if (!e || !PP_RETO_R.pendiente(e)) return Promise.resolve(null);
    subida = srv.sube(e.dia, e.mejor).then(r => {
      const g = guardado();
      if ((r.ok || r.error === 'no_vale') && g && g.dia === e.dia) { SAVE.reto = PP_RETO_R.trasSubir(g, e.mejor); ppGuarda(); }
      if (r.ok) PP_RANK.datos = {};
      return Object.freeze({ ...r, dia: e.dia });
    }).finally(() => { subida = null; });
    return subida;
  }
  const ranking = d => srv.ranking(d);

  // empezar un intento del día `d` (el de la tarjeta); si ya no es ese día o ese intento, se vuelve a pintar la tarjeta y no se cobra nada
  function sigueSiendo(d, como) {
    const e = estado(), s = PP_RETO_R.siguiente(e, C());
    return e.dia === d && s.ok && s.como === como;
  }
  function juega(d, como, pago) {
    const r = PP_RETO_R.empieza(estado(), C(), pago);
    if (!r.ok || r.estado.dia !== d || r.como !== como) { ppEligeMemoria(); return; }
    SAVE.reto = r.estado; ppGuarda();
    ppCierra();
    ppNuevaMemoria(PP_RETO_R.mundo(d, C().mundos), 'normal', { reto: { dia: d, azar: ppAzar(PP_RETO_R.semilla(d)), mejor: r.estado.mejor, monedas: 0, nuevo: false } });
  }
  // el botón de pagar con perlas: mira antes de cobrar; si faltan, la tienda y vuelta a la tarjeta
  function botonPerlas(d, perlas) {
    const paga = () => {
      if (!sigueSiendo(d, 'pago')) { ppEligeMemoria(); return; }
      if (ppPerlas(-perlas, 'reto')) juega(d, 'pago', 'perlas'); else ppFaltanPerlas(perlas, paga, () => ppEligeMemoria());
    };
    const b = ppBoton('', 'pp-btn pp-pago', paga);
    b.innerHTML = `${tr('OTRO INTENTO')} · ${ppPerlasPrecioHtml(perlas, 28)}`;
    return b;
  }
  // el botón del anuncio: se apaga al primer toque (un doble toque no abre dos) y se enciende si no se ve entero
  function botonAnuncio(d) {
    const b = ppBoton(tr('OTRO INTENTO: VER ANUNCIO'), 'pp-btn2 pp-sec', () => {
      if (b.disabled) return;
      if (!sigueSiendo(d, 'pago')) { ppEligeMemoria(); return; }
      b.disabled = true;
      ppVerAnuncio('pop-reto', () => juega(d, 'pago', 'anuncio'), () => { b.disabled = false; });
    });
    return b;
  }
  function botones(caja, e) {
    const s = PP_RETO_R.siguiente(e, C());
    if (!s.ok) { caja.insertAdjacentHTML('beforeend', `<p class="pp-sub">${tr('¡Ya has jugado los {n} de hoy! Vuelve mañana.', { n: C().intentos })}</p>`); return; }
    if (s.como === 'gratis') { caja.appendChild(ppBoton(tr('JUGAR EL RETO'), 'pp-btn pp-pago', () => juega(e.dia, 'gratis'))); return; }
    caja.appendChild(botonPerlas(e.dia, s.perlas));
    if (ppHayAnuncios()) caja.appendChild(botonAnuncio(e.dia));
  }
  const verRanking = () => { ppCierra(); if (PP_MEM) ppSalMemoria(); ppVentanaRanking('hoy'); };
  function tarjeta() {
    const e = estado(), m = PP_RETO_R.mundo(e.dia, C().mundos);
    const caja = document.createElement('div'); caja.className = 'pp-reto';
    const mejor = e.jugados ? ` · ${tr('Tu mejor hoy: {n}', { n: e.mejor })}` : '';
    caja.innerHTML = `<h3>${tr('RETO DEL DÍA')}</h3>
      <p class="pp-sub">${tr('La misma melodía para todos. Mundo de hoy: {m}', { m: tr(PP_MUNDOS[m].nombre) })}</p>
      <p class="pp-sub">${tr('Intentos: {n} de {t}', { n: e.jugados, t: C().intentos })}${mejor}</p>`;
    botones(caja, e);
    caja.appendChild(ppBoton(tr('RANKING DE HOY'), 'pp-btn2 pp-sec', verRanking));
    sube();
    return caja;
  }

  // cada ronda superada (`rondas` hechas): tu mejor de hoy y sus monedas, ya guardadas; M.reto lleva lo de esta partida
  function ronda(M, rondas) {
    const g = PP_RETO_R.deHoy(SAVE.reto, M.reto.dia), r = PP_RETO_R.acaba(g, C(), rondas);
    SAVE.reto = r.estado; SAVE.monedas += r.monedas; ppGuarda();
    Object.assign(M.reto, { mejor: r.estado.mejor, monedas: M.reto.monedas + r.monedas, nuevo: M.reto.nuevo || r.nuevo, lleno: r.lleno });
  }
  // al fallar: la ventana del final
  function fin(M, rondas) {
    ronda(M, rondas);
    const R = M.reto, nuevo = R.nuevo && rondas > 0;
    if (nuevo) play('ppVictoria');
    const premio = R.monedas ? `<p class="pp-premio">+${ppMonedasHtml(R.monedas)}</p>`
      : R.lleno ? `<p class="pp-sub">${tr('Hoy ya tienes todas las monedas del reto.')}</p>` : '';
    const t = ppAbre(`<h2>${nuevo ? tr('¡Tu mejor marca de hoy!') : tr('¡Uy, esa no era!')}</h2>
      <p class="pp-sub">${rondas === 1 ? tr('Has repetido 1 melodía.') : tr('Has repetido {n} melodías.', { n: rondas })}</p>
      ${premio}<p class="pp-sub pp-reto-puesto">${tr('Tu mejor hoy: {n}', { n: R.mejor })}</p>`);
    puesto(t.querySelector('.pp-reto-puesto'), R);
    if (PP_RETO_R.quedan(estado(), C()) > 0) t.appendChild(ppBoton(tr('OTRO INTENTO'), 'pp-btn', () => { ppCierra(); ppEligeMemoria(); }));
    t.appendChild(ppBoton(tr('RANKING DE HOY'), 'pp-btn2 pp-sec', verRanking));
    t.appendChild(ppBoton(tr('Portada'), 'pp-btn2 pp-azul', () => { ppCierra(); ppSalMemoria(); }));
  }
  // el puesto de ese día en la ventana del final: tras subir (si hacía falta), lo que diga el ranking
  function puesto(p, R) {
    const pinta = (n, total) => { if (p.isConnected) p.textContent = tr('Tu mejor hoy: {n} · puesto {p} de {t}', { n: R.mejor, p: n, t: total }); };
    sube().then(r => {
      if (r && r.ok && r.dia === R.dia) { pinta(r.puesto, r.total); return; }
      if (r && r.error === 'sin_red') { if (p.isConnected) p.textContent = tr('Tu marca se subirá al ranking cuando haya conexión.'); return; }
      if (R.mejor > 0) ranking(R.dia).then(d => { if (d.ok && d.yo) pinta(d.yo.puesto, d.total); });
    });
  }
  window.addEventListener('online', () => setTimeout(() => { if (activo()) sube(); }, 2000));
  return Object.freeze({ activo, dia, tarjeta, ronda, fin, sube, ranking });
})();
