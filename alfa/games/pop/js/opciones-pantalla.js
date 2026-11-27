// Fans of Pop · la ventana de OPCIONES por bloques (tarea 430, boceto B de Pepins): Sonido, Juego, Cuenta y «Ayuda y más», con las filas
// comunes de core (OPCIONES de core/js/sistema/opciones-comunes.js, AHORRO y la fila de Cuenta, que trae dentro «Datos de partida anónimos»)
// y el estilo de Pop (css/opciones.css). Qué filas y en qué orden: PP_OPC_BLOQUES (js/opciones-bloques.js).
// Es la única ventana de Opciones desde que Pepins la dio por buena (27-11-2026): la columna de botones de antes y su flag «opciones-bloques» ya no están.
// También las dos ventanas que se abren desde aquí: NOVEDADES (la lista NEWS de js/novedades.js) y CRÉDITOS. Las dos vuelven a Opciones.
'use strict';
function ppOpcBotones(...botones) { const d = document.createElement('div'); d.className = 'pp-op-botones'; d.append(...botones); return d; }
const ppOpcBoton = (texto, f, clase = 'pp-sec') => ppBoton(texto, 'pp-btn2 ' + clase, f);
// las páginas legales de la web (privacidad/ y condiciones/), en una pestaña aparte y en el idioma del juego, como las enlaza la fila de Cuenta de core
function ppOpcWeb(pagina) {
  const base = location.pathname.replace(/games\/[^/]*\/.*$/, '');
  window.open(base + pagina + '/?idioma=' + encodeURIComponent(IDIOMA.actual), '_blank', 'noopener');
}
// la fila de Cuenta de core (con «Datos de partida anónimos» dentro); si core no la ha puesto, al menos el interruptor de los datos
function ppOpcCuenta() {
  return OPCIONES.cuenta() || OPCIONES.interruptor(tr('Datos de partida anónimos'), '', () => DATOS.activo(), v => DATOS.poner(v));
}
const PP_OPC_FILAS = {
  sonido: () => ppBarrasSonido(),
  vibracion: () => OPCIONES.interruptor(tr('Vibración'), tr('El móvil tiembla un poco al hacer pop.'), () => !SAVE.sinVibrar, v => { SAVE.sinVibrar = !v; ppGuarda(); }),
  idioma: () => OPCIONES.idioma(),
  ahorro: () => AHORRO.fila(),
  consejos: () => OPCIONES.interruptor(tr('Consejos de Lola'), tr('Lola te explica lo nuevo cuando sale.'), () => !SAVE.sinConsejos, v => { SAVE.sinConsejos = !v; ppGuarda(); }),
  cuenta: ppOpcCuenta,
  ayuda: () => ppOpcBotones(ppOpcBoton(tr('CÓMO SE JUEGA'), () => ppAyuda(ppOpciones)), ppOpcBoton(tr('NOVEDADES'), ppOpcNovedades)),
  legal: () => ppOpcBotones(ppOpcBoton(tr('PRIVACIDAD'), () => ppOpcWeb('privacidad')), ppOpcBoton(tr('CONDICIONES'), () => ppOpcWeb('condiciones')), ppOpcBoton(tr('CRÉDITOS'), ppOpcCreditos)),
  empezar: () => ppOpcBotones(ppOpcBoton(tr('EMPEZAR DE NUEVO'), ppConfirmaDeNuevo, 'pp-op-azul')),
};
function ppOpciones() {
  const t = ppAbre(`<h2>${tr('Opciones')}</h2>`);
  const caja = document.createElement('div'); caja.className = 'pp-op'; t.appendChild(caja);
  for (const b of PP_OPC_BLOQUES.bloques({ caminoEmpezado: !!(SAVE.run && SAVE.run.nivel > 0) })) {
    const h = document.createElement('h3'); h.className = 'pp-op-grupo'; h.textContent = tr(b.titulo);
    const l = document.createElement('div'); l.className = 'opt-list';
    for (const id of b.filas) { const f = PP_OPC_FILAS[id](); if (f) l.append(f); }
    caja.append(h, l);
  }
  caja.append(OPCIONES.versionTexto(tr('Fans of Pop · versión {v}', { v: VERSION }), 'opt-ver pp-op-ver'));
  ppBotonVolver(t, ppCierra, { tema: 'opciones' });
}
// las novedades del juego, la más nueva primero (los mismos textos que la tarjeta de la librería; su inglés, idioma/en-raiz.js).
// Las notas de broma solo de la versión más nueva, con su título; las de antes, solo lo real
function ppOpcNovedades() {
  const lista = l => (l && l.length ? `<ul>${l.map(x => `<li>${tr(x)}</li>`).join('')}</ul>` : '');
  const broma = n => (n.joke && n.joke.length ? '<h4>' + tr('NOTAS DE MICROBLIZZ Y PHONY') + '</h4>' + lista(n.joke) : '');
  const cuerpo = NEWS.map((n, i) => `<h4>${i ? tr('VERSIÓN') + ' ' + n.v : tr('LO NUEVO')}</h4>${lista(n.real)}${i ? '' : broma(n)}`).join('');
  const t = ppAbre(`<h2>${tr('NOVEDADES')}</h2><div class="pp-op-texto">${cuerpo}</div>`);
  ppBotonVolver(t, ppOpciones, { tema: 'opciones' });
}
function ppOpcCreditos() {
  const t = ppAbre(`<h2>${tr('CRÉDITOS')}</h2><div class="pp-op-texto pp-op-creditos">
    <p><b>Fans of Pop</b></p><p>${tr('Un juego de Fans Of, hecho por Arkioner y Pepins.')}</p>
    <p>${tr('Fans of Pop · versión {v}', { v: VERSION })}</p></div>`);
  ppBotonVolver(t, ppOpciones, { tema: 'opciones' });
}
