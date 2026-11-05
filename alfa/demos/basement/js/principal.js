// Fans of Basement · Principal (composición): arranca el lienzo vertical (540 de ancho, como Swipe), carga la letra y los dibujos,
// lee el dedo (palanca donde lo pones, como en Well Diver; mientras habla Lola, cada toque pasa su bocadillo) y el teclado, mueve la bajada a 60 pasos por segundo, convierte los eventos del dominio en efectos y sonidos, y pasa entre
// pantallas: portada, tu mesa, la bajada y el resultado. Es el único archivo que conoce todas las piezas.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const CV = document.getElementById('juego'), G = CV.getContext('2d'), PASO = 1 / 60, W = B.ui.W, FX = B.efectos, UI = B.ui, TU = B.tuto;
  const est = { modo: 'portada', e: null, t: 0, acum: 0, ultimo: 0, H: 960, botones: [], record: false, pulsoAscensor: false, resultadoT: 0,
    mesa: { pestana: 'formacion', sel: null, apertura: null, dep: false, ascenso: false, armeria: false, taller: null, retos: null }, nuevos: [] };
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
    impacto: (ev) => { if (ev.critico) { FX.numero(ev.x, ev.y - 16, Math.round(ev.dano) + '!', '#ffd23a', 20); FX.chispas(ev.x, ev.y, 10, '#ffd23a', 140); } else FX.numero(ev.x, ev.y - 10, Math.round(ev.dano), '#ffffff', 12); FX.chispas(ev.x, ev.y, 4, '#ffe14a', 70); basSuena('impacto'); },
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
    jefe: () => { FX.temblor = 14; vibrar(80); basSuena('jefe'); },   // la entrada de película la pinta sensacion.js; Lola explica después
    fase: (ev) => { FX.cartel(tr('¡FASE {n}!', { n: ev.fase }), '#e5322d', 1.2, tr('Se ha enfadado')); FX.chispas(ev.x, ev.y, 30, '#e5322d', 220); FX.temblor = 12; vibrar(60); basSuena('jefe'); },
    jefeVencido: (ev) => { FX.confeti(ev.x, ev.y); FX.chispas(ev.x, ev.y, 40, '#ffe14a', 200); FX.temblor = 20; FX.cartel(tr('¡JEFE VENCIDO!'), '#5fe05f', 2, tr('Recoge el paquete')); vibrar(120); basSuena('jefeVencido'); },
    ataqueJefe: () => basSuena('ataqueJefe'),
    bloqueado: (ev) => { FX.numero(ev.x, ev.y - 30, tr('¡ESCUDO!'), '#3b8de0', 12); basSuena('no'); },
    rescate: (ev) => { FX.confeti(ev.x, ev.y); FX.cartel(tr('¡BECARIO RESCATADO!'), '#5fe05f', 1.4, ev.ayuda ? tr('Ahora dispara contigo') : tr('Te dará propina')); basSuena('rescate'); },
    paquete: (ev) => { FX.numero(ev.x, ev.y - 14, '+' + tr('PAQUETE'), '#ffe14a', 16); FX.confeti(ev.x, ev.y); basSuena('compra'); },
    dronCafe: (ev) => FX.numero(ev.x, ev.y - 14, tr('¡PIZZA Y CAFÉ!'), '#ff8a2a', 12),
    eleccion: () => { TU.lanza('ventaja', est.t); basSuena('zona'); },
    ventaja: () => basSuena('compra'),
    reabierto: (ev) => FX.numero(ev.x, ev.y - 20, tr('¡REABIERTO!'), '#e8413a', 14),
    duplicado: (ev) => FX.numero(ev.x, ev.y - 20, tr('¡DUPLICADO!'), '#e8413a', 14),
    explosion: (ev) => { FX.chispas(ev.x, ev.y, 26, ev.arma === 'sello' ? '#e5322d' : '#ffffff', 160); FX.temblor = Math.max(FX.temblor, 6); if (ev.arma === 'sello') FX.numero(ev.x, ev.y - 14, tr('¡APROBADO!'), '#e5322d', 16); },
    mueble: (ev) => { FX.chispas(ev.x, ev.y, 18, '#c8d2e0', 140); FX.temblor = Math.max(FX.temblor, 4); basSuena('baja'); },
    material: (ev) => { FX.numero(ev.x, ev.y - 12, '+1', COLOR_MATERIAL[ev.material], 13); basSuena('recoge'); },
    habilidad: (ev) => { const d = B.AJ.habilidades[ev.id]; FX.cartel(tr(d.nombre).toUpperCase(), '#8ac4ff', 1.2); FX.temblor = Math.max(FX.temblor, ev.id === 'despido' ? 14 : 4); FX.chispas(ev.x, ev.y, 30, ev.id === 'despido' ? '#e5322d' : '#8ac4ff', ev.id === 'despido' ? 320 : 160); basSuena('jefe'); vibrar(60); },
    combo: (ev) => { FX.cartel(tr('¡COMBO!'), '#ffd23a', 1.6, tr(ev.nombre)); basSuena('jefeVencido'); },
    cafeArma: (ev) => FX.numero(ev.x, ev.y - 12, '+' + tr('CAFÉ'), '#ff8a2a', 12),
    apagon: () => { FX.cartel(tr('¡APAGÓN!'), '#8ac4ff', 1); basSuena('cafeBajo'); },
    eventoPlanta: (ev) => { const E = EVENTO[ev.evento]; FX.cartel(tr(E[0]), E[1], 2, tr(E[2])); basSuena('zona'); },
    auditoriaAscensor: () => { FX.cartel(tr('¡AUDITORÍA!'), '#e8413a', 1.2, tr('El ascensor no para en esta planta')); basSuena('no'); },
    final: () => { FX.cartel(tr('¡SERVIDOR ARREGLADO!'), '#4fc25a', 1.6, tr('Microblizz vuelve a funcionar')); FX.cartel(tr('¡EL EDIFICIO SE DERRUMBA!'), '#e5322d', 3, tr('Aguanta hasta que llegue el ascensor')); FX.confeti(est.e.jugador.x, est.e.jugador.y); FX.confeti(est.e.jugador.x, est.e.jugador.y - 60); vibrar(300); TU.lanza('final', est.t); },
    fin: (ev) => { if (ev.como === 'ascensor') FX.confeti(est.e.jugador.x, est.e.jugador.y); else { FX.cartel(tr('¡DESMAYADO!'), '#e5322d', 1.5); vibrar(150); } },
  };
  const COLOR_MATERIAL = { tornillo: '#c8d2e0', cable: '#e5322d', chip: '#5fe05f', disco: '#ffd23a' };
  const EVENTO = {
    apagon: ['¡APAGÓN EN LA PLANTA!', '#8ac4ff', 'Solo ves lo que tienes cerca'],
    cafe: ['¡MÁQUINA DE CAFÉ!', '#ff8a2a', 'Tazas gratis en esta planta'],
    auditoria: ['¡AUDITORÍA!', '#ffd23a', 'Botín doble, pero el ascensor no para aquí'],
    paquete: ['¡PAQUETE PERDIDO!', '#ffd23a', 'Lo vigilan unas reuniones'],
  };
  // los carteles de racha (10, 25, 50 y 100 bajas seguidas)
  function racha(r) { if (!r) return; const j = est.e.jugador; FX.numero(j.x, j.y - 50, tr('¡RACHA x{n}!', { n: r.n }) + ' ' + tr(r.n >= 50 ? '¡Imparable!' : '¡Sigue así!'), r.n >= 50 ? '#ff8a2a' : '#ffd23a', 18); FX.confeti(j.x, j.y - 30); basSuena('jefeVencido'); vibrar(40); }
  function vibrar(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (err) { console.warn('Basement: sin vibración', err); } }

  // ---------- entrada ----------
  function aLogico(ev) { const r = CV.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * est.H / r.height }; }

  function abajo(ev) {
    ev.preventDefault();
    const p = aLogico(ev);
    if (TU.habla()) { TU.toca(est.t); return; }   // mientras habla Lola, cada toque pasa al siguiente bocadillo
    if (est.modo !== 'bajada') { tocarFuera(p); return; }
    if (est.e.eleccion) { const b = est.botones.find((q) => UI.dentro(p, q)); if (b) aplicaVentaja(b.id); return; }
    if (!est.e.fin && UI.dentro(p, UI.botonAscensor(W, est.H))) { est.pulsoAscensor = true; return; }
    if (!est.e.fin && est.e.habilidad && UI.dentro(p, UI.botonHabilidad(W, est.H))) { est.pulsoHabilidad = true; return; }
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
  function aplicaVentaja(id) { if (B.elegirVentaja(est.e, id).ok) for (const ev of est.e.eventos) if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev); }
  // BAJAR: si hay más de un departamento abierto, se elige dónde; si no, a Marketing.
  function bajar() {
    const abiertos = B.departamentos(B.AJ, SAVE.progreso).filter((d) => d.abierto);
    if (abiertos.length < 2) { empezar(0); return; }
    est.mesa.dep = abiertos[abiertos.length - 1].id;   // marcado el más hondo; tocar otro lo cambia y BAJAR AQUÍ confirma basSuena('boton'); TU.lanza('departamento', est.t);
  }
  const ACCIONES = {
    bajar: () => bajar(),
    departamento: (b) => { est.mesa.dep = b.id; basSuena('boton'); },
    bajarAqui: () => { const r = B.inicioDe(B.AJ, SAVE.progreso, est.mesa.dep); if (r.ok) { est.mesa.dep = false; empezar(r.valor); } },
    cerrarDep: () => { est.mesa.dep = false; basSuena('boton'); },
    ascender: () => { est.mesa.ascenso = true; basSuena('boton'); },
    cerrarAscenso: () => { est.mesa.ascenso = false; basSuena('boton'); },
    confirmarAscenso: () => { if (aplica(B.ascender(B.AJ, SAVE.progreso), 'jefeVencido')) { est.mesa.ascenso = false; FX.confeti(W / 2, est.H * 0.3); BAS_RETOS.maximo('cargo', SAVE.progreso.rango); } },
    arma: (b) => { if (aplica(B.ponerArma(B.AJ, SAVE.progreso, b.id), 'boton')) est.mesa.armeria = false; },
    armeria: () => { est.mesa.armeria = true; basSuena('boton'); },
    habilidad: (b) => aplica(B.ponerHabilidad(B.AJ, SAVE.progreso, b.id), 'boton'),
    cerrarArmeria: () => { est.mesa.armeria = false; basSuena('boton'); },
    taller: (b) => { est.mesa.taller = b.receta; basSuena('boton'); },
    usarTaller: () => { if (aplica(B.usarTaller(B.AJ, SAVE.progreso, est.mesa.taller), 'jefeVencido')) { FX.confeti(W / 2, est.H * 0.4); BAS_RETOS.evento('taller', 1); } },
    retos: () => { est.mesa.retos = 'misiones'; basSuena('boton'); },
    pestanaRetos: (b) => { est.mesa.retos = b.id; basSuena('boton'); if (b.id === 'ranking') basCargaRanking(); },
    reintentarRanking: () => basCargaRanking(),
    cobrarReto: (b) => { if (BAS_RETOS.cobrar(b.p, b.id)) { basSuena('compra'); FX.confeti(W / 2, est.H * 0.3); } },
    cerrarRetos: () => { est.mesa.retos = null; basSuena('boton'); },
    cerrarTaller: () => { est.mesa.taller = null; basSuena('boton'); },
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
    else if (est.modo === 'bajada' && k === 'q') est.pulsoHabilidad = true;
    else if (est.modo !== 'bajada' && (k === ' ' || k === 'enter')) teclaMenu();
  }
  function teclaMenu() {
    if (est.modo === 'portada') tocarFuera({ x: -99, y: -99 });
    else if (est.modo === 'resultado' && est.resultadoT >= 0.8) ACCIONES.mesa();
    else if (est.modo === 'mesa' && !est.mesa.sel && !est.mesa.apertura && !est.mesa.dep && !est.mesa.ascenso && !est.mesa.armeria && !est.mesa.taller && !est.mesa.retos) bajar();
  }

  function orden() {
    const T = (a, b) => (teclas[a] || teclas[b] ? 1 : 0);
    const mx = joy.dx + T('arrowright', 'd') - T('arrowleft', 'a'), my = joy.dy + T('arrowdown', 's') - T('arrowup', 'w');
    const ascensor = est.pulsoAscensor, habilidad = est.pulsoHabilidad;
    est.pulsoAscensor = false; est.pulsoHabilidad = false;
    return { mx: Math.max(-1, Math.min(1, mx)), my: Math.max(-1, Math.min(1, my)), ascensor, habilidad };
  }

  // ---------- bajada ----------
  function empezar(inicio) {
    const p = SAVE.progreso;
    est.e = B.nuevaBajada(B.AJ, B.statsDe(B.AJ, p), { vencidos: p.vencidos, inicio: inicio || 0, rango: p.rango, ventajas: true });
    est.aspecto = B.aspectoDe(B.AJ, p);
    Object.assign(est, { modo: 'bajada', acum: 0, record: false, pulsoAscensor: false, pulsoHabilidad: false });
    FX.limpiar(); B.sensacion.reinicia(); B.vista.reiniciar(est.e, est.H); basSuena('boton');
    FX.cartel(tr('¡A BAJAR!'), '#ffd23a', 1.8, tr('El servidor se ha caído: baja a arreglarlo'));
    TU.lanza('bajada', est.t);
  }

  function simular(dt) {
    const e = est.e;
    B.paso(e, dt, orden(), Math.random);
    for (const ev of e.eventos) { if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev); racha(B.sensacion.alEvento(ev)); }
    if (e.becarios.some((b) => Math.abs(b.y - e.jugador.y) < 260)) TU.lanza('becario', est.t);
    if (e.fin && e.finT > 1.1 && est.modo === 'bajada') terminar(e);
  }
  function terminar(e) {
    est.record = e.resultado.planta > SAVE.progreso.record;
    est.nuevos = B.catalogoNuevos(B.AJ, SAVE.progreso, e.resultado);
    SAVE.progreso = B.cobrar(SAVE.progreso, e.resultado, B.AJ);
    basGuarda();
    basRetosBajada(e.resultado);
    basRankingBajada(e.resultado);
    Object.assign(est, { modo: 'resultado', resultadoT: 0 });
    Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 });
  }

  function pintarBajada(dt) {
    const e = est.e;
    if (!TU.habla() && e.habilidad && e.t > 4) TU.lanza('habilidad', est.t);
    if (!TU.habla() && e.jefe && !B.sensacion.enIntro()) TU.lanza('jefe', est.t);   // tras la entrada de película
    if (e.derrumbe && !e.fin) FX.temblor = Math.max(FX.temblor, 4);   // tras el primer guion, el botón especial
    est.acum = TU.habla() ? 0 : est.acum + dt * B.sensacion.velocidad(dt);   // mientras habla Lola, la bajada espera; la pausa y la cámara lenta, sensacion.js
    while (est.acum >= PASO && est.modo === 'bajada') { simular(PASO); est.acum -= PASO; }
    B.vista.camara(e, est.H, dt);
    G.save();
    if (FX.temblor > 0) G.translate((Math.random() - 0.5) * FX.temblor, (Math.random() - 0.5) * FX.temblor);
    B.vista.dibujar(G, e, W, est.H, est.aspecto);
    G.restore();
    UI.apagon(G, W, est.H, e);
    UI.marcador(G, e, W, est.H);
    B.sensacion.dibuja(G, W, est.H);
    FX.dibujarCarteles(G, UI.texto, W, est.H);
    UI.palanca(G, joy);
    if (e.eleccion) est.botones = UI.eleccion(G, W, est.H, e, est.t - (est.eleccionT || (est.eleccionT = est.t)));
    else est.eleccionT = 0;
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
    else if (est.modo === 'resultado') est.botones = UI.resultado(G, W, est.H, est.t, est.e.resultado, est.record, est.nuevos, est.aspecto);
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
