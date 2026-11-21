// Fans of Pop · PRIMEROS PASOS en el juego (composición; tarea #140): junta las reglas (js/primeros-pasos.js) con la partida, la portada,
// el lateral del camino y Lola. Todo va tras el flag 'primeros-pasos' (abierto solo en la alfa) y solo en partidas NUEVAS: SAVE.primeros
// vale 'nueva' en una partida creada desde que existe esto y 'vieja' en las de antes (js/guardado.js). Con el flag cerrado, una partida
// nueva que gana un nivel pasa a 'vieja' (así, si un día se abre en la web, nadie que ya jugaba ve cosas cerrarse).
// · ppPrimerosVe(cosa): si se ve ya (duelos, memoria, pase, hucha…). Lo cerrado se pinta apagado, con candado y «Nivel N».
// · ppPrimerosEstreno(): al llegar al camino, Lola estrena lo que se acaba de abrir y da su regalito (una sola cosa cada vez).
'use strict';
const ppPrimerosActivo = () => NUCLEO.flag('primeros-pasos', 'Pop: primeros minutos más fáciles, una novedad por nivel (tarea #140)', false);
// la situación de la partida para las reglas
function ppPrimeros() {
  const nivel = PP_P ? PP_P.nivel : SAVE.run && SAVE.run.v === 2 ? SAVE.run.nivel : 0;
  return { nueva: ppPrimerosActivo() && SAVE.primeros === 'nueva', nivel };
}
// lo ya estrenado sigue abierto aunque se empiece de nuevo (EMPEZAR DE NUEVO vuelve el camino al nivel 1)
const ppPrimerosVe = cosa => PP_PRIMEROS.abierto(PP_CFG.primeros, cosa, ppPrimeros()) || !!(SAVE.estrenos || {})[cosa];
// el nivel g que se está jugando en el camino normal (null fuera de un nivel)
const ppPrimerosG = () => (PP_P && PP_P.T && PP_P.T.d && !PP_P.T.d.dif ? PP_P.T.d.g : null);
// con el flag cerrado, una partida nueva se queda como vieja al ganar su primer nivel (lo llama ppSalaHecha)
function ppPrimerosAlGanar() {
  if (!ppPrimerosActivo() && SAVE.primeros === 'nueva') { SAVE.primeros = 'vieja'; ppGuarda(); }
}
// el nivel que se está jugando: ¿quedarse sin toques (o salir a medias) es gratis? (niveles 1 a 3)
const ppPrimerosGratis = () => { const d = PP_P && PP_P.T && PP_P.T.d; return !!d && PP_PRIMEROS.sinCorazon(PP_CFG.primeros, ppPrimeros(), d.g, d.dif); };
// ¿la barra de ayudas sale en el nivel T? (los duelos, siempre)
const ppPrimerosAyudas = T => !T.d || PP_PRIMEROS.verAyudas(PP_CFG.primeros, ppPrimeros(), T.d.dif ? null : T.d.g, !!T.nim);
// ¿la explicación k de Lola espera a un nivel más adelante?
const ppPrimerosEspera = k => PP_PRIMEROS.tutoEspera(PP_CFG.primeros, ppPrimeros(), k, ppPrimerosG());
// sin toques en los niveles gratis: se repite sin perder corazón (lo llama ppSinToques)
function ppVentanaSinToquesGratis() {
  const t = ppAbreDerrota(tr('¡Tranquilidad! En los primeros niveles no pierdes corazones.'));   // js/pantalla-victoria.js
  t.appendChild(ppBoton(tr('¡OTRA VEZ!'), 'pp-btn', ppOtraVez));
  t.appendChild(ppBoton(tr('Al camino'), 'pp-btn2 pp-volver', ppAlCamino));
}
// el botón SIGUIENTE de «¡Nivel superado!»: en los niveles 1 y 2 de una partida nueva, directo al siguiente; si no, al camino
function ppPrimerosSiguiente() {
  const d = PP_P && PP_P.T && PP_P.T.d;
  if (d && PP_PRIMEROS.seguido(PP_CFG.primeros, ppPrimeros(), d.g, d.dif)) { ppCierra(); ppEntra(); } else ppAlCamino();
}
// lo que existe en esta copia del juego: el Perfil y los corazones entre amigos van con su propio flag
const PP_PRIMEROS_HAY = { perfil: () => ppPerfilActivo(), amigos: () => ppCorazonesActivo() };
const ppPrimerosHay = cosa => (PP_PRIMEROS_HAY[cosa] ? PP_PRIMEROS_HAY[cosa]() : true);

/* ---------- lo cerrado: apagado, con candado y «Nivel N» ---------- */
const PP_PRIMEROS_PORTADA = { duelos: '#pp-duelo', memoria: '#pp-memoria', ranking: '#pp-ranking', perfil: '#pp-perfil' };
function ppPrimerosCandado(b, cosa) {
  const n = PP_PRIMEROS.nivelDe(PP_CFG.primeros, cosa), cerrado = !ppPrimerosVe(cosa);
  b.classList.toggle('pp-cerrado', cerrado);
  b.classList.toggle('pp-nuevo', !cerrado && (SAVE.estrenos || {})[cosa] === 1);   // estrenado y aún sin tocar: con la manita
  b.querySelectorAll('.pp-candado').forEach(e => e.remove());
  if (cerrado) b.insertAdjacentHTML('beforeend', `<span class="pp-candado"><i></i>${tr('Nivel {n}', { n })}</span>`);
  return cerrado;
}
// la portada: lo que aún no toca, apagado (lo llama ppIrA('titulo'))
function ppPrimerosPortada() {
  for (const [cosa, sel] of Object.entries(PP_PRIMEROS_PORTADA)) { const b = $pp(sel); if (b) ppPrimerosCandado(b, cosa); }
}
// al tocar algo cerrado, Lola dice cuándo se abre; al tocar algo recién estrenado, se le quita la manita. Devuelve si se puede usar.
function ppPrimerosToca(cosa) {
  if (!ppPrimerosVe(cosa)) {
    ppLolaDice(tr('¡Eso se abre al pasar el nivel {n}! Sigue jugando.', { n: PP_PRIMEROS.nivelDe(PP_CFG.primeros, cosa) }));
    return false;
  }
  if ((SAVE.estrenos || {})[cosa] === 1) { SAVE.estrenos[cosa] = 2; ppGuarda(); }
  return true;
}
// un botón del lateral del camino: abierto, como siempre; cerrado, apagado con candado y su nivel
function ppPrimerosLado(b, cosa) {
  const abre = b.onclick;
  b.onclick = ppPrimerosCandado(b, cosa) ? () => { play('select'); ppPrimerosToca(cosa); } : () => { if (ppPrimerosToca(cosa)) { b.classList.remove('pp-nuevo'); if (abre) abre(); } };
  return b;
}

/* ---------- el estreno ---------- */
// Lola dice algo ya traducido, por encima de lo que haya
function ppLolaDice(texto) {
  const frase = { t: texto, ya: true, encima: true };
  PP_LOLA.cola.push(frase);
  if (!PP_LOLA.actual) ppLolaSiguiente();
  return frase;
}
// al llegar al camino: estrena lo que toque (una sola cosa). Devuelve true si ya ha salido algo (y no debe salir otra ventana).
function ppPrimerosEstreno() {
  const p = ppPrimeros(), cfg = PP_CFG.primeros;
  SAVE.estrenos = SAVE.estrenos || {};
  let cosa, r = null;
  // lo que se estrena con su propia ventana (regalo, oferta) o con el rescate (equipo) se apunta sin más
  while (!r && (cosa = PP_PRIMEROS.estreno(cfg, p, SAVE.estrenos, ppPrimerosHay))) {
    r = PP_PRIMEROS.regalito(cfg, cosa);
    SAVE.estrenos[cosa] = r ? 1 : 2;   // 1: estrenado y sin tocar (lleva la manita); 2: ya visto
  }
  ppGuarda();
  if (!r) return false;
  const dice = ppLolaDice(tr(r.texto));
  ppPrimerosTrasVale(dice, () => ppPrimerosVuela(r.premio));   // al pulsar ¡VALE!: así se ve la barra de abajo, que Lola tapa
  return true;
}
// espera a que Lola deje de decir `frase` (se pulsó ¡VALE! o se cerró) y entonces llama a `f`
function ppPrimerosTrasVale(frase, f) {
  const mira = setInterval(() => {
    const sigue = PP_LOLA.actual === frase || PP_LOLA.cola.includes(frase);   // aún la dice o le toca después
    if (!sigue) { clearInterval(mira); f(); }
  }, 200);
}
/* ---------- el regalito vuela desde Lola hasta su sitio (Pepins, 19-11-2026) ---------- */
// un punto del lienzo (coordenadas lógicas) como rectángulo de pantalla de `lado`
function ppPrimerosRect(x, y, lado) { const r = PP_CV.getBoundingClientRect(), s = PP_V.sc; return { left: r.left + (x - lado / 2) * s, top: r.top + (y - lado / 2) * s, width: lado * s, height: lado * s }; }
// las monedas van a su contador del mapa (y se suman al llegar); una ayuda, a la barra de abajo, con «+1» y su dibujo
function ppPrimerosVuela(premio) {
  const cuenta = (PP_MAPA.cuentas || [])[1];
  if (!cuenta || PP_PANT.actual !== 'mapa') { ppPrimerosSuma(premio); return; }
  const desde = ppPrimerosRect(80, PP_V.H - 110, 56);   // de donde estaba Lola (abajo a la izquierda): al pulsar ¡VALE! ya se ha ido
  const ayuda = Object.keys(premio.ayudas || {})[0], hasta = ayuda ? ppPrimerosRect(270, PP_V.H - 130, 60) : ppPrimerosRect(cuenta.x, cuenta.y, 34);
  const n = ayuda ? 1 : 6;
  let llegadas = 0;
  const llega = () => { if (llegadas++ === 0) { ppPrimerosSuma(premio); if (ayuda) ppPrimerosMasUno(hasta, ayuda); } play('ppPop', llegadas); };
  for (let k = 0; k < n; k++) ppVicMoneda(desde, hasta, k * 90, llega, ayuda ? 'i-' + ayuda : 'i-moneda');
}
function ppPrimerosSuma(premio) { ppDaPremio(premio); play('ppPremio'); ppPintaLateral(); }
// el «+1» con el dibujo de la ayuda, que sube y se va
function ppPrimerosMasUno(r, ayuda) {
  const e = document.createElement('div'); e.className = 'pp-regalo-mas';
  e.innerHTML = `<b>+1</b>${ppIcono('i-' + ayuda, Math.round(r.width), '#ffd1ec')}`;
  e.style.left = r.left + 'px'; e.style.top = r.top + 'px';
  document.body.appendChild(e); setTimeout(() => e.remove(), 1600);
}
