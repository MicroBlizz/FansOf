// Fans Of Paperwork · PRINCIPAL: la composición. Crea los adaptadores (almacén, reloj, sonido, retos), les pasa el azar a los casos de uso y
// arranca el lienzo, el bucle de cada fotograma (avanza el motor con el tiempo real y pinta) y los paneles de abajo. Es el único archivo que
// conoce todas las piezas.
'use strict';
PW.ui = { pestana: 'pico', t: 0, sucio: true, velocidad: 1, html: {}, alto: 960 };   // alto: el del lienzo, que crece en pantallas alargadas
PW.almacen = PW.creaAlmacenLocal(SAVE_KEY, localStorage);
PW.reloj = PW.creaReloj();
PW.sonido = PW.creaSonido(PW.almacen);
PW.retos = PW.creaRetos(PW.almacen, PW.reloj, n => PW.casos.ingresa(n));   // paga por los casos de uso (que se crean justo después)
PW.casos = PW.creaCasos({ almacen: PW.almacen, reloj: PW.reloj, azar: Math.random, retos: PW.retos });

PW.principal = (() => {
  const CV = document.getElementById('cv'), CTX = CV.getContext('2d'), UI = document.getElementById('pw-ui');
  const V = { sc: 1, dpr: 1, W: 540, H: 960 }, ui = PW.ui;
  const PESTANAS = {
    pico: (e, B) => PW.paneles.pico(e, B), materiales: (e, B) => PW.paneles.materiales(e, B), trituradora: (e, B) => PW.paneles.trituradora(e, B),
    cofres: e => PW.paneles.cofres(e), carrera: (e, B) => PW.panelesCarrera.carrera(e, B), retos: () => PW.panelesCarrera.retos(), opciones: () => PW.panelesCarrera.opciones(),
  };
  // el sonido de cada suceso del motor (los que no salen, callan)
  const SONIDOS = { golpe: 'hit', roto: 'clank', nivel: 'levelup', planta: 'blip', trituradora: 'crown', despido: 'despido', dinamita: 'boom', correo: 'card', 'intento-fin': 'sad' };

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
    pon('pw-hud', PW.paneles.hud(e, B));
    pon('pw-acciones', PW.paneles.acciones(e, B));
    pon('pw-panel', PESTANAS[ui.pestana](e, B));
    const avisos = PW.paneles.avisos(e, B);
    document.querySelectorAll('#pw-pestanas [data-arg]').forEach(b => {
      b.classList.toggle('activo', b.dataset.arg === ui.pestana);
      b.dataset.globo = avisos[b.dataset.arg] || '';
    });
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
  // un toque en el lienzo: el correo o un bloque
  function toca(ev) {
    const r = CV.getBoundingClientRect(), x = (ev.clientX - r.left) / V.sc, y = (ev.clientY - r.top) / V.sc;
    const q = PW.escena.toque(PW.casos.partida, x, y);
    if (!q) return;
    if (q.que === 'correo') abreCorreo();
    else PW.efectos.sucesos(PW.casos.toca(q.i).sucesos, ui.t);
  }
  // con el dedo apoyado se sigue picando donde esté (5 toques por segundo): no hace falta aporrear la pantalla
  let dedo = null;
  function mantiene(ev) {
    suelta();
    CV.setPointerCapture(ev.pointerId);   // el final del toque llega al lienzo aunque el dedo acabe fuera o salga algo encima
    dedo = { ev, reloj: setInterval(() => toca(dedo.ev), 200) };
  }
  function suelta() {
    if (dedo) clearInterval(dedo.reloj);
    dedo = null;
  }
  function abreCorreo() {
    const res = PW.casos.abreCorreo();
    if (!PW.botones.cuenta(res, 'pop')) return;
    toast(res.valor.cofre ? tr('El CEO te manda un cofre por error') : tr('Correo del CEO: {n} de oro', { n: PW.txt.num(res.valor.oro) }), true);
  }
  function bienvenida(v) {
    if (v && v.oro > 0) confirmBox(tr('HORAS EXTRA'), tr('Mientras no estabas ({t}), tu equipo ha sacado {n} de oro.', { t: PW.txt.tiempo(v.segundos), n: PW.txt.num(v.oro) }), '', null, tr('A PICAR'));
  }
  function arranca() {
    ajusta();
    window.addEventListener('resize', ajusta);
    PW.arte.precarga();
    bienvenida(PW.casos.arranca().valor.vuelta);
    document.querySelectorAll('#pw-pestanas [data-arg]').forEach(b => { if (b.dataset.arg !== 'opciones') b.textContent = tr(b.textContent.trim()); });
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
