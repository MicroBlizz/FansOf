// Fans Of Paperwork · PRINCIPAL: la composición. Crea los adaptadores (almacén, reloj, sonido, retos), les pasa el azar a los casos de uso y
// arranca el lienzo, el bucle de cada fotograma (avanza el motor con el tiempo real y pinta) y los paneles de abajo. Es el único archivo que
// conoce todas las capas.
'use strict';
// pestana: la abierta (las del turno o las de la carrera, adaptadores/paneles.js); elegido: el trabajador al que se va a mandar a otro
// archivador (0 = ninguno); alto: el del lienzo, que crece en pantallas alargadas
PW.ui = { pestana: 'utiles', cortinilla: false, elegido: 0, t: 0, sucio: true, velocidad: 1, html: {}, alto: 960 };
// con el guardado del navegador bloqueado, leer localStorage lanza: se juega sin guardar y se dice
PW.almacenamiento = (() => { try { return window.localStorage; } catch (error) { console.warn('Paperwork: sin almacenamiento', error); return null; } })();
PW.avisosAlmacen = [];
PW.almacen = PW.creaAlmacenLocal(SAVE_KEY, PW.almacenamiento, (motivo, error) => { console.warn('Paperwork: guardado', motivo, error); PW.avisosAlmacen.push(motivo); });
PW.reloj = PW.creaReloj();
PW.sonido = PW.creaSonido(PW.almacen);
PW.retos = PW.creaRetos(PW.almacen, PW.reloj, n => PW.casos.ingresa(n));   // paga por los casos de uso (que se crean justo después)
PW.casos = PW.creaCasos({ almacen: PW.almacen, reloj: PW.reloj, azar: Math.random, retos: PW.retos });

PW.principal = (() => {
  const CV = document.getElementById('cv'), CTX = CV.getContext('2d'), UI = document.getElementById('pw-ui');
  const V = { sc: 1, dpr: 1, W: 540, H: 960 }, ui = PW.ui;
  const PESTANAS = {
    utiles: (e, B) => PW.paneles.utiles(e, B), documentos: (e, B) => PW.paneles.documentos(e, B), trituradora: (e, B) => PW.paneles.trituradora(e, B),
    plantas: (e, B) => PW.panelesTurno.plantas(e, B), jefe: (e, B) => PW.panelesTurno.jefe(e, B),
    cofres: e => PW.paneles.cofres(e), despido: (e, B) => PW.panelesCarrera.despido(e, B), recuerdos: e => PW.panelesCarrera.recuerdos(e), meritos: e => PW.panelesCarrera.meritos(e),
    plan: e => PW.panelesCarrera.plan(e), equipo: (e, B) => PW.panelesCarrera.equipo(e, B), retos: () => PW.panelesCarrera.retos(), opciones: () => PW.panelesCarrera.opciones(),
  };
  // el sonido de cada suceso del motor (los que no salen, callan)
  const SONIDOS = { vistazo: 'hit', vacio: 'clank', nivel: 'levelup', planta: 'blip', trituradora: 'crown', despido: 'despido', estanteria: 'boom', correo: 'card', empujon: 'hit', 'intento-fin': 'sad', 'pedido-ok': 'crown', 'pedido-mal': 'sad', requisa: 'sad' };

  // el escenario ocupa todo el alto que haya: 540 de ancho de diseño y de 960 a 1280 de alto (un móvil alargado gana panel, no bandas vacías)
  function ajusta() {
    const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 600 ? 0 : 24;
    const libreW = bw - pad * 2, libreH = bh - pad * 2;
    V.H = Math.round(Math.max(960, Math.min(1280, (V.W * libreH) / libreW)));
    const w = Math.max(200, Math.floor(Math.min(libreW, (libreH * V.W) / V.H))), h = Math.floor((w * V.H) / V.W);
    const st = document.getElementById('stage'); st.style.width = w + 'px'; st.style.height = h + 'px';
    V.sc = w / V.W; V.dpr = Math.min(window.devicePixelRatio || 1, 3); ui.alto = V.H;
    CV.width = Math.round(w * V.dpr); CV.height = Math.round(h * V.dpr);
    UI.style.height = V.H + 'px';
    UI.style.transform = `scale(${V.sc})`;
  }
  // pone el HTML de un trozo solo si cambió (así no se pierden los toques ni el desplazamiento)
  function pon(id, html) {
    if (ui.html[id] === html) return;
    ui.html[id] = html;
    document.getElementById(id).innerHTML = html;
  }
  function refresca() {
    const e = PW.casos.partida, B = PW.casos.bonos();
    // durante un intento contra la Trituradora no hay menús: es una pelea de jefe (y se vuelve al pasillo al acabar)
    const jefe = PW.trituradora.atascando(e);
    if (jefe) ui.pestana = 'utiles';
    UI.dataset.nivel = jefe ? 'jefe' : PW.paneles.enCarrera(ui.pestana) ? 'carrera' : 'turno';
    pon('pw-hud', PW.paneles.hud(e, B));
    pon('pw-acciones', PW.paneles.acciones(e, B));
    pon('pw-recursos', PW.panelesTurno.recursos(e, B));
    pon('pw-lateral', PW.panelesTurno.lateral(e, B));
    pon('pw-pestanas', PW.paneles.pestanas(e, B, ui.pestana));
    pon('pw-panel', PESTANAS[jefe ? 'jefe' : ui.pestana](e, B));
    pon('pw-cortinilla', ui.cortinilla && PW.trituradora.lista(e) ? PW.panelesTurno.cortinilla(e, B) : '');
    ui.sucio = false;
  }
  function suenan(sucesos) {
    const ya = {};
    for (const s of sucesos) if (SONIDOS[s.t] && !ya[s.t]) { ya[s.t] = 1; PW.sonido.toca(SONIDOS[s.t]); }
  }
  let antes = 0, ultimoPanel = 0;
  function fotograma(ms) {
    const t = ms / 1000, dt = antes ? Math.min(1, t - antes) : 0;
    antes = t; ui.t = t;
    const sucesos = PW.casos.tick(dt * ui.velocidad);
    PW.efectos.sucesos(sucesos, t);
    suenan(sucesos);
    const k = V.sc * V.dpr;
    CTX.setTransform(k, 0, 0, k, 0, 0);
    PW.escena.pinta(CTX, PW.casos.partida, t);
    if (ui.sucio || t - ultimoPanel > 0.25) { ultimoPanel = t; refresca(); }
    requestAnimationFrame(fotograma);
  }
  // un toque en el lienzo: el correo, un trabajador de la fila (queda elegido para mandarlo) o un archivador (un vistazo, o el destino del elegido)
  function toca(ev, primero = true) {
    const r = CV.getBoundingClientRect(), x = (ev.clientX - r.left) / V.sc, y = (ev.clientY - r.top) / V.sc;
    // en plena pelea, cualquier toque en el lienzo empuja a la Trituradora
    if (PW.trituradora.atascando(PW.casos.partida)) { const s = PW.casos.toca(0).sucesos; PW.efectos.sucesos(s, ui.t); suenan(s); return; }
    const q = PW.escena.toque(PW.casos.partida, x, y);
    if (!q) return;
    if (q.que === 'correo') { if (primero) abreCorreo(); }
    else if (q.que === 'trabajador') { if (primero) { ui.elegido = ui.elegido === q.k ? 0 : q.k; PW.sonido.toca('select'); } }
    else if (ui.elegido) { if (primero) { PW.botones.cuenta(PW.casos.manda(ui.elegido, q.i)); ui.elegido = 0; } }
    else PW.efectos.sucesos(PW.casos.toca(q.i).sucesos, ui.t);
  }
  // con el dedo apoyado se sigue rebuscando donde esté (5 toques por segundo): no hace falta aporrear la pantalla
  let dedo = null;
  function mantiene(ev) {
    suelta();
    CV.setPointerCapture(ev.pointerId);   // el final del toque llega al lienzo aunque el dedo acabe fuera o salga algo encima
    dedo = { ev, reloj: setInterval(() => toca(dedo.ev, false), 200) };
  }
  function suelta() {
    if (dedo) clearInterval(dedo.reloj);
    dedo = null;
  }
  function abreCorreo() {
    const res = PW.casos.abreCorreo();
    if (!PW.botones.cuenta(res, 'pop')) return;
    const p = res.valor.pedido;
    if (p) { toast(tr('Pedido del CEO: vacía {n} archivadores en {t}', { n: p.n, t: PW.txt.tiempo(p.falta) }), true); return; }
    toast(res.valor.cofre ? tr('El CEO te manda un cofre por error') : tr('Correo del CEO: {n} de oro', { n: PW.txt.num(res.valor.oro) }), true);
  }
  function bienvenida(v) {
    if (v && v.oro > 0) confirmBox(tr('HORAS EXTRA'), tr('Mientras no estabas ({t}), tu equipo ha sacado {n} de oro.', { t: PW.txt.tiempo(v.segundos), n: PW.txt.num(v.oro) }), '', null, tr('A REBUSCAR'));
  }
  // lo que el almacén no ha podido leer o guardar se dice una vez, en cuanto hay pantalla
  const AVISO_ALMACEN = {
    'sin-almacenamiento': () => tr('Este navegador no deja guardar: la partida se perderá al cerrar'),
    'no-guarda': () => tr('No se ha podido guardar la partida'),
    ilegible: () => tr('La partida guardada no se podía leer: se ha apartado una copia'),
  };
  function avisaAlmacen() {
    const motivo = PW.avisosAlmacen.shift();
    if (motivo) toast(AVISO_ALMACEN[motivo]());
  }
  function arranca() {
    ajusta();
    window.addEventListener('resize', ajusta);
    PW.arte.precarga();
    bienvenida(PW.casos.arranca().valor.vuelta);
    avisaAlmacen();
    setInterval(avisaAlmacen, 5000);
    PW.botones.engancha(UI);
    CV.addEventListener('pointerdown', ev => { if (typeof audioInit === 'function') audioInit(); toca(ev); mantiene(ev); });
    CV.addEventListener('pointermove', ev => { if (dedo) dedo.ev = ev; });
    for (const fin of ['pointerup', 'pointercancel', 'lostpointercapture']) CV.addEventListener(fin, suelta);
    window.addEventListener('blur', suelta);
    UI.addEventListener('pointerdown', () => { if (typeof audioInit === 'function') audioInit(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { suelta(); PW.casos.sale(); } else bienvenida(PW.casos.entra()); });
    setInterval(() => { try { musicUpdate(); } catch (e) { /* la música nunca debe parar el juego */ } }, 200);
    document.getElementById('carga').remove();
    requestAnimationFrame(fotograma);
    if (typeof NUCLEO !== 'undefined' && NUCLEO.listo) NUCLEO.listo();
  }
  return { arranca };
})();
PW.principal.arranca();
