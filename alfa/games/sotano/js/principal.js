// Fans Of Sótano · PRINCIPAL: la composición. Crea los adaptadores (almacén, reloj, sonido, retos), les pasa el azar a los casos de uso y
// arranca el lienzo, el bucle de cada fotograma (avanza el motor con el tiempo real y pinta) y los paneles de abajo. Es el único archivo que
// conoce todas las piezas.
'use strict';
SO.ui = { pestana: 'pico', t: 0, sucio: true, velocidad: 1, html: {} };
SO.almacen = SO.creaAlmacenLocal(SAVE_KEY, localStorage);
SO.reloj = SO.creaReloj();
SO.sonido = SO.creaSonido(SO.almacen);
SO.retos = SO.creaRetos(SO.almacen, SO.reloj, n => SO.casos.ingresa(n));   // paga por los casos de uso (que se crean justo después)
SO.casos = SO.creaCasos({ almacen: SO.almacen, reloj: SO.reloj, azar: Math.random, retos: SO.retos });

SO.principal = (() => {
  const CV = document.getElementById('cv'), CTX = CV.getContext('2d'), UI = document.getElementById('so-ui');
  const V = { sc: 1, dpr: 1, W: 540, H: 960 }, ui = SO.ui;
  const PESTANAS = {
    pico: (e, B) => SO.paneles.pico(e, B), materiales: (e, B) => SO.paneles.materiales(e, B), trituradora: (e, B) => SO.paneles.trituradora(e, B),
    cofres: e => SO.paneles.cofres(e), carrera: (e, B) => SO.panelesCarrera.carrera(e, B), retos: () => SO.panelesCarrera.retos(), opciones: () => SO.panelesCarrera.opciones(),
  };
  // el sonido de cada suceso del motor (los que no salen, callan)
  const SONIDOS = { golpe: 'hit', roto: 'clank', nivel: 'levelup', planta: 'blip', trituradora: 'crown', despido: 'despido', dinamita: 'boom', correo: 'card', 'intento-fin': 'sad' };

  function ajusta() {
    const bw = document.body.clientWidth, bh = document.body.clientHeight, pad = bw < 600 ? 0 : 24;
    let w = bw - pad * 2, h = (w * V.H) / V.W;
    if (h > bh - pad * 2) { h = bh - pad * 2; w = (h * V.W) / V.H; }
    w = Math.max(200, Math.floor(w)); h = Math.floor((w * V.H) / V.W);
    const st = document.getElementById('stage'); st.style.width = w + 'px'; st.style.height = h + 'px';
    V.sc = w / V.W; V.dpr = Math.min(window.devicePixelRatio || 1, 3);
    CV.width = Math.round(w * V.dpr); CV.height = Math.round(h * V.dpr);
    UI.style.transform = `scale(${V.sc})`;
  }
  // pone el HTML de un trozo solo si cambió (así no se pierden los toques ni el desplazamiento)
  function pon(id, html) {
    if (ui.html[id] === html) return;
    ui.html[id] = html;
    document.getElementById(id).innerHTML = html;
  }
  function refresca() {
    const e = SO.casos.partida, B = SO.casos.bonos();
    pon('so-hud', SO.paneles.hud(e, B));
    pon('so-acciones', SO.paneles.acciones(e, B));
    pon('so-panel', PESTANAS[ui.pestana](e, B));
    const retos = SO.retos.listos();
    document.querySelectorAll('#so-pestanas [data-arg]').forEach(b => {
      b.classList.toggle('activo', b.dataset.arg === ui.pestana);
      if (b.dataset.arg === 'retos') b.dataset.globo = retos || '';
    });
    ui.sucio = false;
  }
  function suenan(sucesos) {
    const ya = {};
    for (const s of sucesos) if (SONIDOS[s.t] && !ya[s.t]) { ya[s.t] = 1; SO.sonido.toca(SONIDOS[s.t]); }
  }
  let antes = 0, ultimoPanel = 0;
  function fotograma(ms) {
    const t = ms / 1000, dt = antes ? Math.min(1, t - antes) : 0;
    antes = t; ui.t = t;
    const sucesos = SO.casos.tick(dt * ui.velocidad);
    SO.efectos.sucesos(sucesos, t);
    suenan(sucesos);
    const k = V.sc * V.dpr;
    CTX.setTransform(k, 0, 0, k, 0, 0);
    SO.escena.pinta(CTX, SO.casos.partida, t);
    if (ui.sucio || t - ultimoPanel > 0.25) { ultimoPanel = t; refresca(); }
    requestAnimationFrame(fotograma);
  }
  // un toque en el lienzo: el correo o un bloque
  function toca(ev) {
    const r = CV.getBoundingClientRect(), x = (ev.clientX - r.left) / V.sc, y = (ev.clientY - r.top) / V.sc;
    const q = SO.escena.toque(SO.casos.partida, x, y);
    if (!q) return;
    if (q.que === 'correo') abreCorreo();
    else SO.efectos.sucesos(SO.casos.toca(q.i).sucesos, ui.t);
  }
  function abreCorreo() {
    const res = SO.casos.abreCorreo();
    if (!SO.botones.cuenta(res, 'pop')) return;
    toast(res.valor.cofre ? tr('El CEO te manda un cofre por error') : tr('Correo del CEO: {n} de oro', { n: SO.txt.num(res.valor.oro) }), true);
  }
  function bienvenida(v) {
    if (v && v.oro > 0) confirmBox(tr('HORAS EXTRA'), tr('Mientras no estabas ({t}), tu equipo ha sacado {n} de oro.', { t: SO.txt.tiempo(v.segundos), n: SO.txt.num(v.oro) }), '', null, tr('A PICAR'));
  }
  function arranca() {
    ajusta();
    window.addEventListener('resize', ajusta);
    SO.arte.precarga();
    bienvenida(SO.casos.arranca().valor.vuelta);
    document.querySelectorAll('#so-pestanas [data-arg]').forEach(b => { if (b.dataset.arg !== 'opciones') b.textContent = tr(b.textContent.trim()); });
    SO.botones.engancha(UI);
    CV.addEventListener('pointerdown', ev => { if (typeof audioInit === 'function') audioInit(); toca(ev); });
    UI.addEventListener('pointerdown', () => { if (typeof audioInit === 'function') audioInit(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) SO.casos.sale(); else bienvenida(SO.casos.entra()); });
    setInterval(() => { try { musicUpdate(); } catch (e) { /* la música nunca debe parar el juego */ } }, 200);
    document.getElementById('carga').remove();
    requestAnimationFrame(fotograma);
    if (typeof NUCLEO !== 'undefined' && NUCLEO.listo) NUCLEO.listo();
  }
  return { arranca };
})();
SO.principal.arranca();
