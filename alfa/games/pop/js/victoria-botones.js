// Fans of Pop · PANTALLA DE VICTORIA, los botones y la fiesta (Pepins, 19-11-2026: «más opciones, lo de compartir y tal, más
// destellos, que sea una fiesta»). «Gastar monedas» (a la tienda), doblar las monedas viendo un anuncio,
// compartir el resultado e ir al mapa; y el confeti, los destellos y las burbujitas, que salen según las estrellas
// (PP_VICTORIA.fiesta, js/victoria.js). La ventana, en js/pantalla-victoria.js.
'use strict';
const PP_VIC_WEB = 'https://fansof.games/games/pop/';
const PP_VIC_CONFETI = ['#ffd64a', '#ff6eb5', '#6ad1ff', '#7be08a', '#ffa64d', '#fff3a8'];
// «Gastar monedas»: al lado del premio, un atajo dorado a la tienda (para que destaque)
function ppVictoriaTienda(t, opc) {
  const hueco = t.querySelector('.pp-vic-gastar-hueco'); if (!hueco) return;
  hueco.appendChild(ppBoton(tr('Gastar monedas') + ' ›', 'pp-vic-tienda', () => ppTienda(opc.vuelta || null, 'bandejas')));   // lo que se compra con monedas (Pepins, 19-11-2026)
}
// doblar las monedas del nivel viendo un anuncio (una vez por nivel ganado)
function ppVictoriaDoble(t, T) {
  const hueco = t.querySelector('.pp-vic-doble-hueco'), m = T.premio && T.premio.monedas;
  if (!hueco || !m || !ppHayAnuncios()) return;
  if (T.doblado) { hueco.innerHTML = `<span class="pp-vic-doblado">${tr('¡Doblado!')}</span>`; return; }
  const b = ppBoton('', 'pp-btn2 pp-verde pp-vic-doble', () => ppVerAnuncio('pop-doblar', () => ppVictoriaDobla(t, T)));
  b.innerHTML = `<span class="pp-vic-x2">x2</span>${tr('Doblar')}`;
  hueco.appendChild(b);
}
function ppVictoriaDobla(t, T) {
  if (T.doblado) return;
  const m = T.premio.monedas; T.doblado = true; SAVE.monedas += m; ppGuarda(); play('ppPremio');
  ppVicCuenta(t.querySelector('.pp-vic-cuenta'), m, m * 2, 0.6, 0);
  ppVicVuela(t, SAVE.monedas - m, m, 300);   // las del anuncio también vuelan a la barra (js/victoria-panel.js)
  ppVictoriaDoble(t, T);   // el botón deja sitio a «¡Doblado!»
  ppVictoriaFiesta(t, 2);   // al doblar, otra tanda de confeti
}
// el texto para compartir: el nivel, las estrellas y cómo lo hiciste
function ppVictoriaTextoCompartir(T) {
  const r = ppVictoriaResumen(T), est = PP_VICTORIA.estrellasTexto(T.estrellas), t = PP_VICTORIA.reloj(r.seg), nivel = T.titulo || 'Fans of Pop';
  if (r.duelo) return tr('{nivel} de Fans of Pop: {est} con {e} errores en {t}. ¿Me superas?', { nivel, est, e: r.errores, t });
  return tr('{nivel} de Fans of Pop: {est} en {n} toques ({t}). ¿Me superas?', { nivel, est, n: r.toques, t });
}
// compartir con lo que tenga el móvil; si no hay, se copia y se avisa en el mismo botón
function ppVictoriaCompartir(T, b) {
  const texto = ppVictoriaTextoCompartir(T);
  play('select');
  if (navigator.share) { navigator.share({ title: 'Fans of Pop', text: texto, url: PP_VIC_WEB }).catch(() => {}); return; }
  const avisa = msg => { const antes = b.innerHTML; b.textContent = msg; setTimeout(() => { if (b.isConnected) b.innerHTML = antes; }, 1800); };
  if (navigator.clipboard) navigator.clipboard.writeText(texto + ' ' + PP_VIC_WEB).then(() => avisa(tr('¡Copiado!')), () => avisa(PP_VIC_WEB));
  else avisa(PP_VIC_WEB);
}
// Compartir, fuera del panel y encima de ¡SIGUIENTE!, del mismo tamaño (Pepins, 19-11-2026, boceto de la 2.ª vuelta): blanco con
// letra azul y el dibujito de compartir, para que ¡SIGUIENTE! (rosa) siga siendo el que manda
const PP_VIC_ICONO_COMPARTIR = '<svg class="pp-vic-comp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">'
  + '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
function ppVictoriaPie(t, T) {
  const comp = ppBoton('', 'pp-btn pp-vic-compartir', () => ppVictoriaCompartir(T, comp));
  comp.innerHTML = PP_VIC_ICONO_COMPARTIR + `<span>${tr('COMPARTIR')}</span>`;
  t.appendChild(comp);
}
// «A por 3 estrellas»: un botoncito junto a la frase, dentro del panel, si te ha faltado alguna
function ppVictoriaOtraVez(t, T, opc) {
  const frase = t.querySelector('.pp-vic-panel .pp-vic-frase');
  if (!opc.otraVez || !frase || T.estrellas >= 3) return;
  frase.insertAdjacentElement('afterend', ppBoton(tr('A por 3 estrellas') + ' ›', 'pp-vic-otra', ppOtraVez));
}
function ppVictoriaBotones(t, T, opc) {
  ppVictoriaTienda(t, opc);
  ppVictoriaDoble(t, T);
  ppVictoriaOtraVez(t, T, opc);
  ppVictoriaPie(t, T);
}
/* ---------- la fiesta ---------- */
const ppVicAzar = (a, b) => a + Math.random() * (b - a);   // solo para el adorno: dónde cae cada trocito
// los destellos que parpadean alrededor de las estrellas
function ppVictoriaBrillos(t, n) {
  const caja = t.querySelector('.pp-vic-brillos'); if (!caja) return;
  for (let k = 0; k < n; k++) {
    const s = document.createElement('i');
    s.style.cssText = `left:${ppVicAzar(4, 92)}%;top:${ppVicAzar(0, 70)}%;--tam:${ppVicAzar(12, 26)}px;animation-delay:${ppVicAzar(0.9, 2.6)}s,${ppVicAzar(0.9, 2.6)}s`;
    caja.appendChild(s);
  }
}
// confeti que cae por toda la pantalla, o burbujitas que suben (0 o 1 estrella); se quita solo
function ppVictoriaLluvia(n, clase, colores, retraso = 0) {
  if (!n) return;
  const capa = document.createElement('div'); capa.className = 'pp-vic-fiesta';
  for (let k = 0; k < n; k++) {
    const p = document.createElement('i'); p.className = clase;
    p.style.cssText = `left:${ppVicAzar(0, 100)}%;background:${colores[k % colores.length]};--giro:${ppVicAzar(-540, 540)}deg;--dx:${ppVicAzar(-60, 60)}px;`
      + `animation-delay:${retraso + ppVicAzar(0.8, 1.8)}s;animation-duration:${ppVicAzar(2.2, 3.6)}s;--tam:${ppVicAzar(8, 16)}px`;
    capa.appendChild(p);
  }
  $pp('#pp-modal').appendChild(capa);
  setTimeout(() => capa.remove(), 6500 + retraso * 1000);
}
function ppVictoriaFiesta(t, estrellas) {
  $pp('#pp-modal').querySelectorAll('.pp-vic-fiesta').forEach(c => c.remove());
  if (estrellas >= 3) setTimeout(() => ppVibra([20, 40, 20, 40, 60]), 950);   // el móvil vibra al caer la tercera (y la ventana tiembla, CSS)
  const f = PP_VICTORIA.fiesta(estrellas);
  ppVictoriaBrillos(t, f.brillos);
  for (let k = 0; k < (f.oleadas || 0); k++) ppVictoriaLluvia(f.confeti, 'pp-vic-confeti', PP_VIC_CONFETI, k * 1.3);   // una tanda tras otra
  ppVictoriaLluvia(f.burbujas, 'pp-vic-burbuja', ['rgba(255,255,255,0.55)']);
}
