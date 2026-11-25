// Fans of Pop · MEMORIA, LAS AYUDAS (tarea #141 fase 2, ADR 216): la ventana «¡Casi!» para SEGUIR tras fallar (una vez por partida,
// con perlas o viendo un anuncio; la misma ronda se enseña otra vez) y el botón «Repetir melodía» de tu turno (#pp-mem-pista, bajo el
// tablero: con perlas, una vez por ronda y PP_CFG.memoria.pista.porPartida por partida; en Difícil se repite solo el sonido, como la
// melodía). Cuándo se puede cada cosa lo dicen las reglas (PP_MEM_R, js/memoria-reglas.js); una partida `limpio` no tiene ninguna.
// Las perlas se cobran por el camino de siempre (ppBotonPerlas y ppFaltanPerlas, js/tienda.js) y el anuncio es voluntario (ppVerAnuncio).
'use strict';
/* ---------- seguir tras fallar ---------- */
// el fallo ya está cobrado (ppMemCobra): «Terminar» enseña el resultado con lo que lleva la partida
function ppMemOfreceSeguir(M, rondas) {
  if (PP_MEM !== M) return;
  const otra = () => ppMemOfreceSeguir(M, rondas);
  const t = ppAbre(`<h2>${tr('¡Casi!')}</h2><p class="pp-sub">${tr('Sigue en la ronda {n}: Lola te repite la melodía.', { n: M.sec.length })}</p>
    <p class="pp-sub">${tr('Solo una vez por partida.')}</p><p class="pp-sub">${tr('Tienes:')} ${ppPerlasHtml(SAVE.perlas || 0, 26)}</p>`);
  t.appendChild(ppBotonPerlas(tr('SEGUIR'), PP_CFG.memoria.seguir.perlas, 'pp-btn pp-pago', () => ppMemSigue(M), otra, 'seguir'));
  if (ppHayAnuncios()) t.appendChild(ppMemBotonAnuncio(M));
  t.appendChild(ppBoton(tr('Terminar'), 'pp-btn2 pp-azul', () => ppMemResultado(M, rondas, M.cobro)));
}
// se apaga al primer toque (un doble toque no abre dos anuncios); si no se ve entero, vuelve a encenderse
function ppMemBotonAnuncio(M) {
  const b = ppBoton(tr('VER ANUNCIO: SEGUIR'), 'pp-btn2 pp-sec', () => {
    if (b.disabled) return;
    b.disabled = true;
    ppVerAnuncio('pop-memoria', () => ppMemSigue(M), () => { b.disabled = false; });
  });
  return b;
}
// la partida sigue: la burbuja buena deja de parpadear y Lola enseña otra vez la melodía de esta ronda
function ppMemSigue(M) {
  if (PP_MEM !== M || !PP_MEM_R.puedeSeguir(M, PP_CFG.memoria)) return;
  ppCierra();
  Object.assign(M, PP_MEM_R.trasSeguir(M));
  M.reloj = 1.1; M.espera = 0; M.falla = undefined; M.brillos = {};
  ppFlota(tr('¡Sigues!'), 270, ppGeom(M.T.n).y - 30, '#ffd64a'); play('ppPremio');
}
/* ---------- repetir la melodía ---------- */
// el botón sale y se va con tu turno; se repinta solo cuando cambia lo que enseña (lo llaman ppMemAvanza y ppIrA)
function ppMemPistaBoton() {
  const b = $pp('#pp-mem-pista'); if (!b) return;
  const M = PP_MEM, C = PP_CFG.memoria, ver = PP_PANT.actual === 'memoria' && !!M && PP_MEM_R.hayPista(M, C);
  const quedan = ver ? PP_MEM_R.pistasQuedan(M, C) : 0, marca = ver ? String(quedan) : '';
  b.hidden = !ver;
  if (!ver) { b.dataset.marca = ''; return; }   // al volver a salir se repinta (por si cambió el idioma o el precio en euros)
  if (b.dataset.marca === marca) return;
  b.dataset.marca = marca;
  b.innerHTML = `<span>${tr('Repetir melodía')} · ${ppPerlasPrecioHtml(C.pista.perlas, 24)}</span><small>${quedan === 1 ? tr('Te queda 1') : tr('Te quedan {n}', { n: quedan })}</small>`;
  b.onclick = () => { play('select'); ppMemPista(); };
}
// pulsar «Repetir melodía»: si no llegan las perlas, la ventana de siempre (y al volver con perlas, se usa)
function ppMemPista() {
  const M = PP_MEM, C = PP_CFG.memoria; if (!M || PP_PANT.pausa) return;
  const r = PP_MEM_R.puedePista(M, SAVE.perlas || 0, C);
  if (!r.ok && r.error !== 'perlas') return;
  if (!r.ok || !ppPerlas(-C.pista.perlas, 'ayuda')) { ppFaltanPerlas(C.pista.perlas, ppMemPista); return; }
  ppCierra();   // si vienes de comprar perlas, su ventana
  Object.assign(M, PP_MEM_R.trasPista(M));
  M.reloj = 0.6; M.espera = 0;
  play('ppPremio'); ppMemPistaBoton();
}
