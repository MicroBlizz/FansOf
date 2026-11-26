// Fans of Pop · PRUEBA DE RENDIMIENTO, el juego solo (tarea 404; aplicación y adaptador): con ?banco=1&nube=0 Pop recorre el plan de
// js/banco-reglas.js: para cada paso entra en su escenario (un nivel de cada lado, la victoria, la derrota, el duelo o la memoria), aplica
// la variante (quita partes del dibujo, el desenfoque de la victoria o enciende el ahorro), espera a que se asiente y mide los ms de cada
// fotograma. Un bot va tocando mientras se mide (js/banco-bot.js). Al acabar guarda la tanda con los datos del aparato y vuelve a la
// dirección normal de Pop, donde js/banco-vista.js la enseña. La partida es de usar y tirar (js/banco-url.js): la real no se toca.
// Lo único de fuera que se cambia es «Ahorro de batería» (AHORRO, de core): se devuelve a como estaba al acabar o al cerrar la página.
// El envío al servidor lo hace js/banco-envio.js con hook('pop-banco') (lo dispara PP_BANCO_VISTA.alVolver, js/banco-vista.js).
'use strict';
const PP_BANCO = (() => {
  const P = PP_BANCO_URL.parametros(location.search), K = PP_BANCO_URL.CLAVES;
  const NIVEL_DE_LADO = Object.freeze({ 4: 5, 5: 10, 6: 30 });   // el nivel global que se juega para cada lado de tablero (ninguno es de duelo: el nivel 5 es el primero de 4 por 4 normal)
  const ESPERA_MAX = 20000;   // lo más que se espera a que salga el panel de victoria o la ventana de derrota
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const SIN_PARTE = 'pp-sin-desenfoque';
  let bot = null, ahorroInicial = false, rotulo = null, coleAntes = null;

  // el rótulo pequeño de arriba: no tapa el juego y no recibe toques
  function pintaRotulo(n, total) {
    if (!rotulo) {
      rotulo = document.createElement('div');
      rotulo.style.cssText = 'position:fixed;left:6px;top:6px;z-index:99999;padding:2px 8px;border-radius:10px;background:rgba(20,10,40,.72);color:#fff;font:11px/1.4 sans-serif;pointer-events:none';
      document.body.append(rotulo);
    }
    rotulo.textContent = tr('Prueba de rendimiento · paso {n} de {N}', { n, N: total });
  }
  // todo como si nada: partes pintadas, desenfoque puesto, sin ventanas, sin ahorro y sin bot
  function limpia() {
    paraBot();
    quitaEquipo();
    PP_MEDIDOR.PARTES.forEach(p => PP_MEDIDOR.quita(p, false));
    document.body.classList.remove(SIN_PARTE);
    AHORRO.poner(false);
    ppCierra();
  }
  function aplica(paso) {
    for (const parte of paso.quita) { if (parte === 'desenfoque') document.body.classList.add(SIN_PARTE); else PP_MEDIDOR.quita(parte, true); }
    AHORRO.poner(paso.ahorro);
  }
  const paraBot = () => { if (bot) { clearInterval(bot); bot = null; } };
  const arrancaBot = (f, ms) => { paraBot(); bot = setInterval(() => { try { f(); } catch (e) { paraBot(); console.error('banco: el bot ha fallado', e); } }, ms); };
  async function hasta(cond, motivo) {
    const fin = performance.now() + ESPERA_MAX;
    while (!cond()) { if (performance.now() > fin) throw new Error(motivo); await espera(100); }
  }

  // el equipo de un escenario (PP_BANCO_REGLAS.EQUIPOS): todos al máximo y ese equipo en Niveles; al acabar el paso, la colección de antes
  function ponEquipo(nombre) {
    if (!nombre) return;
    coleAntes = ppCole();
    const e = PP_COLE.todosAlMaximo(coleAntes);
    e.eq.N = [...PP_BANCO_REGLAS.EQUIPOS[nombre]];
    ppColeGuarda(e);
  }
  function quitaEquipo() { if (coleAntes) { ppColeGuarda(coleAntes); coleAntes = null; } }

  // --- entrar en cada escenario y tocar ---
  const tablero = () => PP_P && PP_P.T;
  function entraNivel(lado) {
    const g = NIVEL_DE_LADO[lado];
    if (!PP_P) ppNuevaRuta();
    PP_P.nivel = g; ppEntra(g);
    if (PP_PANT.actual !== 'sala' || !tablero()) throw new Error('sin-nivel');
    return g;
  }
  const estado = (T, extra) => Object.assign({ n: T.n, mask: T.mask, up: T.up, sol: [...T.sol], turnos: false, fila: null, pierde: false }, extra);
  // un toque del bot en un nivel; con el último toque a mano, vuelve a entrar para no ganarlo (así sigue habiendo tablero que pintar)
  function tocaNivel(g) {
    if (ppCortActiva()) { ppCortPulsa(); return; }
    const T = tablero();
    if (!T || T.hecho || PP_PANT.actual !== 'sala' || !PP_BANCO_BOT.sinUltimo([...T.sol])) { ppCierra(); ppEntra(g); return; }
    const i = PP_BANCO_BOT.eligeToque(estado(T));
    if (i >= 0) ppToque(i);
  }
  // en el duelo (por turnos): un toque en su fila y, al siguiente latido, ¡LISTO!
  function tocaPorTurnos(D, e, toque, listo) {
    if (D.turno !== 'yo') return;
    if (D.esta.length) { listo(); return; }
    const i = PP_BANCO_BOT.eligeToque(e);
    if (i >= 0) toque(i);
  }
  function tocaDuelo() {
    if (ppCortActiva()) { ppCortPulsa(); return; }
    const D = PP_DUELO;
    if (!D || D.fin) { PP_P = null; ppNuevoDuelo(); return; }
    tocaPorTurnos(D, { n: D.T.n, mask: D.T.mask, up: D.T.up, sol: [], turnos: true, fila: D.fila, pierde: false }, ppDueloToque, ppDueloListo);
  }
  // la victoria: el bot juega el nivel entero (a ritmo rápido) hasta que sale el panel con el desenfoque
  async function entraVictoria(lado) {
    const g = entraNivel(lado);
    arrancaBot(() => {
      if (ppCortActiva()) { ppCortPulsa(); return; }
      const T = tablero(); if (!T || T.hecho) return;
      const i = PP_BANCO_BOT.eligeToque(estado(T)); if (i >= 0) ppToque(i);
    }, 120);
    await hasta(() => !!document.querySelector('.pp-vic-panel'), 'sin-victoria-g' + g);
    paraBot();
  }
  // la derrota: el bot gasta los toques fuera de la solución hasta que sale la ventana de «sin toques»
  async function entraDerrota(lado) {
    entraNivel(lado);
    arrancaBot(() => {
      if (ppCortActiva()) { ppCortPulsa(); return; }
      const T = tablero(); if (!T || T.hecho || T.parado) return;
      const i = PP_BANCO_BOT.eligeToque(estado(T, { pierde: true })); if (i >= 0) ppToque(i);
    }, 100);
    await hasta(() => !$pp('#pp-modal').hidden, 'sin-derrota');
    paraBot();
  }
  async function entra(paso) {
    if (paso.tipo === 'nivel') { ponEquipo(paso.equipo); const g = entraNivel(paso.lado); arrancaBot(() => tocaNivel(g), 400); }
    else if (paso.tipo === 'victoria') await entraVictoria(paso.lado);
    else if (paso.tipo === 'derrota') await entraDerrota(paso.lado);
    else if (paso.tipo === 'duelo') { PP_P = null; ppNuevoDuelo(); arrancaBot(tocaDuelo, 400); }
    else { PP_P = null; ppNuevaMemoria(0, 'facil'); }
  }

  // --- medir ---
  // los ms de cada fotograma durante `ms`
  function mideFotogramas(ms) {
    return new Promise(listo => {
      const medidas = []; let antes = null; const fin = performance.now() + ms;
      const paso = ahora => {
        if (antes !== null) medidas.push(ahora - antes);
        antes = ahora;
        if (ahora < fin) requestAnimationFrame(paso); else listo(medidas);
      };
      requestAnimationFrame(paso);
    });
  }
  // un paso entero: entra, aplica la variante, espera y mide; si algo falla, lo apunta con su motivo y sigue
  async function medida(paso) {
    try {
      limpia();
      await entra(paso);
      aplica(paso);
      await espera(paso.calienta);
      const r = PP_BANCO_REGLAS.resumen(await mideFotogramas(paso.mide));
      return r || { fallo: 'sin-fotogramas' };
    } catch (e) {
      return { fallo: String((e && e.message) || e) };
    } finally {
      paraBot();
    }
  }
  const aparato = corta => ({
    ancho: innerWidth, alto: innerHeight, dpr: window.devicePixelRatio || 1, nucleos: navigator.hardwareConcurrency || 0,
    memoria: navigator.deviceMemory || 0, version: typeof VERSION !== 'undefined' ? String(VERSION) : '0', corta: !!corta, origen: P.origen, cpu: P.cpu,
  });
  function guarda(tanda) {
    try { localStorage.setItem(K.resultado, JSON.stringify(tanda)); return true; } catch (e) { console.error('banco: no se pudo guardar el resultado', e); return false; }
  }
  const restauraAhorro = () => { try { AHORRO.poner(ahorroInicial); } catch (e) { console.error('banco: no se pudo devolver el ahorro', e); } };

  async function ejecuta() {
    const pasos = PP_BANCO_REGLAS.plan({ corta: P.corta, solo: P.solo }), medidas = [];
    ahorroInicial = AHORRO.activo();
    window.addEventListener('pagehide', restauraAhorro);   // si se cierra a medias, el ahorro vuelve a como lo tenía la persona
    ppLolaSalta();   // sin consejos de Lola: la partida es de usar y tirar
    for (let i = 0; i < pasos.length; i++) { pintaRotulo(i + 1, pasos.length); medidas.push(await medida(pasos[i])); }
    limpia(); restauraAhorro();
    const tanda = Object.assign(PP_BANCO_REGLAS.tanda(pasos, medidas), { aparato: aparato(P.corta), fecha: Date.now() });
    guarda(tanda);
    location.replace(PP_BANCO_URL.urlNormal(location.href));
  }
  // si la prueba se rompe entera: se apunta y se vuelve a la dirección normal (la partida real sigue intacta)
  function vuelve(e) { console.error('banco: la prueba ha fallado', e); restauraAhorro(); location.replace(PP_BANCO_URL.urlNormal(location.href)); }
  // lo llama js/principal.js al arrancar: en modo banco, empieza cuando la portada ya se ve; si no, enseña el resultado pendiente
  function arranca() {
    if (!P.activo || !ppEsPruebas()) { PP_BANCO_VISTA.alLlegar(); return; }   // en la release, ?banco=1 no hace nada (solo alfa y desarrollo, como el resto de lo nuevo de Pop)
    const mira = () => { if (PP_ESCENARIO.style.visibility === '') ejecuta().catch(vuelve); else setTimeout(mira, 200); };
    mira();
  }
  return Object.freeze({ arranca, activo: P.activo });
})();
