// Fans of Basement · Principal (composición): arranca el lienzo vertical (540 de ancho, como Swipe), carga la letra y los dibujos,
// lee el dedo (palanca donde lo pones, como en Well Diver; mientras habla Lola, cada toque pasa su bocadillo) y el teclado, mueve la bajada a 60 pasos por segundo, convierte los eventos del dominio en efectos y sonidos, y pasa entre
// pantallas: portada, tu mesa, la bajada y el resultado. Es el único archivo que conoce todas las piezas.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const CV = document.getElementById('juego'), G = CV.getContext('2d'), PASO = 1 / 60, W = B.ui.W, FX = B.efectos, UI = B.ui, TU = B.tuto;
  const est = { modo: 'portada', e: null, t: 0, acum: 0, ultimo: 0, H: 960, botones: [], record: false, pulsoAscensor: false, resultadoT: 0,
    mesa: { pestana: 'formacion', sel: null, apertura: null } };
  const joy = { activo: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 }, teclas = {};
  B._est = est;   // para las pruebas automáticas y el panel DEV

  function ajusta() {
    est.H = Math.max(860, Math.min(1200, Math.round(W * innerHeight / innerWidth)));
    const dpr = Math.min(2, window.devicePixelRatio || 1), k = Math.min(innerWidth / W, innerHeight / est.H);
    CV.style.width = Math.floor(W * k) + 'px'; CV.style.height = Math.floor(est.H * k) + 'px';
    CV.width = Math.floor(W * k * dpr); CV.height = Math.floor(est.H * k * dpr);
  }

  // ---------- eventos del dominio -> efectos y sonidos ----------
  const EFECTOS = {
    disparo: () => basSuena('disparo'),
    impacto: (ev) => { FX.numero(ev.x, ev.y - 10, Math.round(ev.dano), '#ffffff', 12); FX.chispas(ev.x, ev.y, 4, '#ffe14a', 70); basSuena('impacto'); },
    baja: (ev) => { FX.chispas(ev.x, ev.y, 14, ev.enemigo === 'bug' ? '#3fa34d' : '#ffffff', 110); FX.temblor = Math.max(FX.temblor, 3); basSuena('baja'); },
    divide: (ev) => { FX.numero(ev.x, ev.y - 18, 'RE: RE:', '#e5322d', 12); basSuena('divide'); },
    recoge: (ev) => { FX.numero(ev.x, ev.y - 12, '+' + ev.valor, '#ffe14a', 14); basSuena('recoge'); },
    cafe: (ev) => { FX.numero(ev.x, ev.y - 12, '+' + tr('CAFÉ'), '#ff8a2a', 14); basSuena('cafe'); },
    golpe: (ev) => { FX.numero(ev.x, ev.y - 20, '-' + ev.cuanto, '#e5322d', 16); FX.temblor = 10; vibrar(40); basSuena('golpe'); },
    frenado: () => { FX.cartel(tr('¡REUNIÓN!'), '#e5322d', 1, tr('Te ha frenado')); basSuena('frenado'); },
    cajaLlena: () => { FX.cartel(tr('¡CAJA LLENA!'), '#ffe14a', 1.4, tr('Llama al ascensor')); basSuena('cajaLlena'); },
    planta: (ev) => { if (ev.planta % 5) basSuena('planta'); },
    zona: (ev) => { FX.cartel(tr(ev.zona.nombre).toUpperCase(), '#ffe14a', 2, ev.zona.crunch ? tr('CRUNCH ZONE: el café se gasta más rápido') : ''); basSuena('zona'); },
    cafeBajo: () => { FX.cartel(tr('¡QUEDA POCO CAFÉ!'), '#e5322d', 1.6, tr('Sube antes de desmayarte')); basSuena('cafeBajo'); },
    ascensorLlamado: () => { FX.cartel(tr('ASCENSOR EN CAMINO'), '#5fe05f', 1.4, tr('Aguanta unos segundos')); basSuena('ascensorLlamado'); },
    jefe: (ev) => { TU.lanza('jefe', est.t); FX.cartel(tr(ev.nombre).toUpperCase(), '#e5322d', 2.2, tr('No podrás bajar hasta vencerlo')); FX.temblor = 14; vibrar(80); basSuena('jefe'); },
    jefeVencido: (ev) => { FX.confeti(ev.x, ev.y); FX.chispas(ev.x, ev.y, 40, '#ffe14a', 200); FX.temblor = 20; FX.cartel(tr('¡JEFE VENCIDO!'), '#5fe05f', 2, tr('Recoge el paquete')); vibrar(120); basSuena('jefeVencido'); },
    ataqueJefe: () => basSuena('ataqueJefe'),
    bloqueado: (ev) => { FX.numero(ev.x, ev.y - 30, tr('¡ESCUDO!'), '#3b8de0', 12); basSuena('no'); },
    rescate: (ev) => { FX.confeti(ev.x, ev.y); FX.cartel(tr('¡BECARIO RESCATADO!'), '#5fe05f', 1.4, ev.ayuda ? tr('Ahora dispara contigo') : tr('Te dará propina')); basSuena('rescate'); },
    paquete: (ev) => { FX.numero(ev.x, ev.y - 14, '+' + tr('PAQUETE'), '#ffe14a', 16); FX.confeti(ev.x, ev.y); basSuena('compra'); },
    dronCafe: (ev) => FX.numero(ev.x, ev.y - 14, tr('¡PIZZA Y CAFÉ!'), '#ff8a2a', 12),
    fin: (ev) => { if (ev.como === 'ascensor') FX.confeti(est.e.jugador.x, est.e.jugador.y); else { FX.cartel(tr('¡DESMAYADO!'), '#e5322d', 1.5); vibrar(150); } },
  };
  function vibrar(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (err) { console.warn('Basement: sin vibración', err); } }

  // ---------- entrada ----------
  function aLogico(ev) { const r = CV.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * est.H / r.height }; }

  function abajo(ev) {
    ev.preventDefault();
    const p = aLogico(ev);
    if (TU.habla()) { TU.toca(est.t); return; }   // mientras habla Lola, cada toque pasa al siguiente bocadillo
    if (est.modo !== 'bajada') { tocarFuera(p); return; }
    if (!est.e.fin && UI.dentro(p, UI.botonAscensor(W, est.H))) { est.pulsoAscensor = true; return; }
    if (!joy.activo) Object.assign(joy, { activo: true, id: ev.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 });
  }
  function mueve(ev) {
    if (!joy.activo || ev.pointerId !== joy.id) return;
    const p = aLogico(ev), dx = (p.x - joy.ox) / 56, dy = (p.y - joy.oy) / 56, m = Math.hypot(dx, dy);
    joy.dx = m > 1 ? dx / m : dx; joy.dy = m > 1 ? dy / m : dy;
  }
  function arriba(ev) { if (ev.pointerId === joy.id) Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 }); }

  // Una regla del dominio que devuelve ok/error: si sale bien, se guarda el progreso nuevo; si no, suena «no».
  function aplica(r, sonido) {
    if (!r.ok) { basSuena('no'); return false; }
    SAVE.progreso = r.valor; basGuarda(); basSuena(sonido || 'compra');
    return true;
  }
  function abrirPaquete(tipo) {
    const r = B.abrirPaquete(B.AJ, SAVE.progreso, tipo, Math.random);
    if (!r.ok) { basSuena('no'); return; }
    SAVE.progreso = r.valor.progreso; basGuarda();
    est.mesa.apertura = { tipo, premio: r.valor.premio, t0: est.t, revelado: false };
    basSuena('tiembla');
  }
  const ACCIONES = {
    bajar: () => empezar(),
    mesa: () => alaMesa(),
    pestana: (b) => { est.mesa.pestana = b.id; basSuena('boton'); TU.lanza(b.id, est.t); },
    curso: (b) => { est.mesa.sel = b.id; basSuena('boton'); },
    cerrar: () => { est.mesa.sel = null; },
    comprarCurso: (b) => { if (aplica(B.comprarCurso(B.AJ, SAVE.progreso, b.id))) est.mesa.sel = null; },
    equipar: (b) => aplica(B.equipar(B.AJ, SAVE.progreso, b.hueco, b.rareza), 'boton'),
    mascota: (b) => aplica(B.ponerMascota(B.AJ, SAVE.progreso, b.id), 'boton'),
    comprarPaquete: (b) => aplica(B.comprarPaquete(B.AJ, SAVE.progreso, b.id)),
    abrirPaquete: (b) => abrirPaquete(b.id),
    cerrarApertura: () => { est.mesa.apertura = null; basSuena('boton'); },
  };
  function alaMesa() { est.modo = 'mesa'; basSuena('boton'); TU.lanza('mesa', est.t); }
  function tocarFuera(p) {
    if (est.modo === 'portada') { alaMesa(); return; }
    if (est.modo === 'resultado' && est.resultadoT < 0.8) return;
    const b = est.botones.find((q) => UI.dentro(p, q));
    if (b && ACCIONES[b.accion]) ACCIONES[b.accion](b);
  }

  function tecla(ev, baja) {
    const k = ev.key.toLowerCase();
    teclas[k] = baja;
    if (!baja) return;
    if (est.modo === 'bajada' && (k === ' ' || k === 'e')) { est.pulsoAscensor = true; ev.preventDefault(); }
    else if (est.modo !== 'bajada' && (k === ' ' || k === 'enter')) teclaMenu();
  }
  function teclaMenu() {
    if (est.modo === 'portada') tocarFuera({ x: -99, y: -99 });
    else if (est.modo === 'resultado' && est.resultadoT >= 0.8) ACCIONES.mesa();
    else if (est.modo === 'mesa' && !est.mesa.sel && !est.mesa.apertura) empezar();
  }

  function orden() {
    const T = (a, b) => (teclas[a] || teclas[b] ? 1 : 0);
    const mx = joy.dx + T('arrowright', 'd') - T('arrowleft', 'a'), my = joy.dy + T('arrowdown', 's') - T('arrowup', 'w');
    const ascensor = est.pulsoAscensor;
    est.pulsoAscensor = false;
    return { mx: Math.max(-1, Math.min(1, mx)), my: Math.max(-1, Math.min(1, my)), ascensor };
  }

  // ---------- bajada ----------
  function empezar() {
    est.e = B.nuevaBajada(B.AJ, B.statsDe(B.AJ, SAVE.progreso), SAVE.progreso.vencidos);
    Object.assign(est, { modo: 'bajada', acum: 0, record: false, pulsoAscensor: false });
    FX.limpiar(); B.vista.reiniciar(est.e, est.H); basSuena('boton');
    FX.cartel(tr('¡A BAJAR!'), '#ffd23a', 1.8, tr('El servidor se ha caído: baja a arreglarlo'));
    TU.lanza('bajada', est.t);
  }

  function simular(dt) {
    const e = est.e;
    B.paso(e, dt, orden(), Math.random);
    for (const ev of e.eventos) if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev);
    if (e.becarios.some((b) => Math.abs(b.y - e.jugador.y) < 260)) TU.lanza('becario', est.t);
    if (e.fin && e.finT > 1.1 && est.modo === 'bajada') terminar(e);
  }
  function terminar(e) {
    est.record = e.resultado.planta > SAVE.progreso.record;
    SAVE.progreso = B.cobrar(SAVE.progreso, e.resultado);
    basGuarda();
    Object.assign(est, { modo: 'resultado', resultadoT: 0 });
    Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 });
  }

  function pintarBajada(dt) {
    const e = est.e;
    est.acum = TU.habla() ? 0 : est.acum + dt;   // mientras habla Lola, la bajada espera
    while (est.acum >= PASO && est.modo === 'bajada') { simular(PASO); est.acum -= PASO; }
    B.vista.camara(e, est.H, dt);
    G.save();
    if (FX.temblor > 0) G.translate((Math.random() - 0.5) * FX.temblor, (Math.random() - 0.5) * FX.temblor);
    B.vista.dibujar(G, e, W, est.H);
    G.restore();
    UI.marcador(G, e, W, est.H);
    FX.dibujarCarteles(G, UI.texto, W, est.H);
    UI.palanca(G, joy);
  }

  // La mesa; al abrir un paquete, cuando se revela el premio, confeti y fanfarria (más cuanto más raro).
  function pintarMesa() {
    est.botones = UI.mesa(G, W, est.H, est.t, B.AJ, SAVE.progreso, est.mesa);
    const a = est.mesa.apertura;
    if (a && !a.revelado && est.t - a.t0 >= UI.REVELA) {
      a.revelado = true;
      const n = B.AJ.rarezas.indexOf(a.premio.rareza) + 1;
      for (let i = 0; i < n; i++) FX.confeti(W / 2, est.H * 0.42);
      basSuena(n >= 3 ? 'jefeVencido' : 'compra'); vibrar(30 * n);
    }
    FX.dibujarMundo(G, UI.texto);
  }

  function fotograma(ahora) {
    const dt = Math.min(0.05, (ahora - (est.ultimo || ahora)) / 1000);
    est.ultimo = ahora; est.t += dt; est.resultadoT += dt;
    const k = CV.width / W;
    G.setTransform(k, 0, 0, k, 0, 0);
    G.imageSmoothingEnabled = false;
    FX.paso(dt);
    if (est.modo === 'bajada') { est.botones = []; pintarBajada(dt); }
    else if (est.modo === 'resultado') est.botones = UI.resultado(G, W, est.H, est.t, est.e.resultado, est.record);
    else if (est.modo === 'mesa') pintarMesa();
    else est.botones = UI.portada(G, W, est.H, est.t);
    if (TU.habla()) est.botones = TU.dibuja(G, W, est.H, est.t);
    basMusica(est.modo, est.e);
    requestAnimationFrame(fotograma);
  }

  async function arranca() {
    basCarga(); ajusta(); basCargaSonidos();
    try { await Promise.race([Promise.all([document.fonts.load('40px "Jersey 10"'), UI.cargaImagenes()]), new Promise((r) => setTimeout(r, 4000))]); }
    catch (err) { console.warn('Basement: sin letra o dibujos', err); }
    document.getElementById('carga').hidden = true;
    CV.addEventListener('pointerdown', abajo); CV.addEventListener('pointermove', mueve);
    addEventListener('pointerup', arriba); addEventListener('pointercancel', arriba);
    addEventListener('keydown', (ev) => tecla(ev, true)); addEventListener('keyup', (ev) => tecla(ev, false));
    addEventListener('resize', ajusta);
    requestAnimationFrame(fotograma);
  }
  B.empezar = empezar;
  arranca();
})(BAS);
