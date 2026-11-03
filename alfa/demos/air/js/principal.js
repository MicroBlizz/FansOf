// Fans of Air · Principal: arranca el lienzo, lee el dedo y el teclado, mueve la misión a 60 pasos por segundo, convierte los
// eventos del dominio en efectos (explosiones, carteles, temblor, vibración y sonidos: los de Yoshi si están, si no pitidos
// sintetizados) y pasa entre pantallas: título, hangar, misión y final. Guarda en el navegador el caza elegido y el récord.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const CV = document.getElementById('juego'), G = CV.getContext('2d'), V = A.vista, UI = A.ui, FX = A.efectos, PASO = 1 / 60;
  const est = { modo: 'titulo', e: null, t: 0, acum: 0, ultimo: 0, fuego: false, especial: false, sel: { caza: 'bunny' }, mejor: 0, record: false, tactil: false, flash: -9 };
  const joy = { activo: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 }, teclas = {};
  A._est = est;   // para las pruebas automáticas y el panel DEV

  function ajusta() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), k = Math.min(innerWidth / V.W, innerHeight / V.H);
    CV.style.width = Math.floor(V.W * k) + 'px'; CV.style.height = Math.floor(V.H * k) + 'px';
    CV.width = Math.floor(V.W * k * dpr); CV.height = Math.floor(V.H * k * dpr);
  }

  // ---------- guardado (solo comodidad: si falla, se empieza con lo de siempre) ----------
  function guardar() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ caza: est.sel.caza, mejor: est.mejor })); }
    catch (err) { console.warn('Air: no se guarda', err); }
  }
  function leer() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      if (A.AJ.cazas.some((c) => c.id === d.caza)) est.sel.caza = d.caza;
      est.mejor = Number(d.mejor) || 0;
    } catch (err) { console.warn('Air: no se lee lo guardado', err); }
  }

  // ---------- sonido: los mp3 de Yoshi (audio/) si cargan; si no, pitidos sintetizados ----------
  let AC = null;
  const AUDIO = {};
  function cargarAudio() {
    for (const n of ['misil', 'explosion', 'bomba']) {   // los de Yoshi que valen; ametralladora, fijado e impacto van sintetizados
      const a = new Audio(); a.preload = 'auto';
      a.addEventListener('canplaythrough', () => { AUDIO[n] = a; }, { once: true });
      a.addEventListener('error', () => { AUDIO[n] = null; });
      a.src = 'audio/' + n + '.mp3';
    }
  }
  function sintetiza(f, dura, tipo, sube, vol) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), v = AC.createGain(), t = AC.currentTime;
      o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t);
      if (sube) o.frequency.exponentialRampToValueAtTime(f * sube, t + dura);
      v.gain.setValueAtTime(vol || 0.1, t); v.gain.exponentialRampToValueAtTime(0.001, t + dura);
      o.connect(v).connect(AC.destination); o.start(t); o.stop(t + dura);
    } catch (err) { console.warn('Air: sin sonido', err); }
  }
  const SINTE = {
    ametralladora: () => sintetiza(900, 0.05, 'square', 0.4, 0.05),
    misil: () => sintetiza(200, 0.5, 'sawtooth', 4, 0.1),
    explosion: () => { sintetiza(90, 0.5, 'sawtooth', 0.3, 0.14); sintetiza(50, 0.6, 'square', 0.5, 0.1); },
    fijado: () => { sintetiza(1200, 0.08, 'square'); setTimeout(() => sintetiza(1500, 0.1, 'square'), 110); },
    bomba: () => sintetiza(1400, 0.6, 'sine', 0.25, 0.08),
    impacto: () => sintetiza(300, 0.08, 'square', 0.6, 0.07),
    toque: () => sintetiza(520, 0.06, 'square'),
    alarma: () => { for (let i = 0; i < 3; i++) setTimeout(() => sintetiza(660, 0.18, 'square', 0.75, 0.1), i * 220); },
    fanfarria: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => sintetiza(f, 0.2, 'square'), i * 120)),
    error: () => sintetiza(160, 0.2, 'sawtooth', 0.6, 0.08),
  };
  function sonar(n, vol) {
    const a = AUDIO[n];
    if (a) { try { const c = a.cloneNode(); c.volume = vol || 0.5; c.play().catch(() => {}); return; } catch (err) { console.warn('Air: sin audio', err); } }
    if (SINTE[n]) SINTE[n]();
  }
  function vibrar(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (err) { console.warn('Air: sin vibración', err); } }

  // ---------- eventos del dominio -> efectos ----------
  const enAire = (ev) => V.aire.pantalla(est.e, ev), enTierra = (ev) => V.tierra.pantalla(est.e, ev);
  const EFECTOS = {
    disparo: () => sonar('ametralladora', 0.25),
    misil: () => sonar('misil'),
    fijado: () => { sonar('fijado'); FX.cartel(tr('¡FIJADO!'), '#ff5a3a', 0.6); },
    sinMisiles: () => { sonar('error'); FX.cartel(tr('SIN MISILES'), '#ff5a3a', 0.8); },
    sinBombas: () => { sonar('error'); FX.cartel(tr('SIN BOMBAS'), '#ff5a3a', 0.8); },
    impacto: (ev) => { const p = enAire(ev); FX.chispas(p.x, p.y, p.s + 0.4); sonar('impacto', 0.3); },
    derribo: (ev) => { const p = enAire(ev); FX.explosion(p.x, p.y, 1 + p.s * 1.5); FX.temblor = 6; sonar('explosion', 0.6); if (ev.combo > 1) FX.cartel(tr('RABIA') + ' x' + ev.combo, '#ff8a2a', 0.7); },
    explosion: (ev) => { const p = enAire(ev); FX.explosion(p.x, p.y, (ev.grande ? 1.6 : 1) + p.s * 1.5, 22); FX.temblor = 8; sonar('explosion'); },
    golpe: (ev) => { FX.temblor = 14; est.flash = est.t; vibrar(40); sonar('impacto'); if (est.e.fase === 'tierra') { const p = enTierra(ev); FX.chispas(p.x, p.y, 1.2, '#ff5a3a'); } },
    dano: (ev) => { if (ev.motivo === 'choque') { FX.temblor = 18; est.flash = est.t; vibrar(70); } },
    jefe: () => { FX.cartel(tr('¡SURVIVALBOT!'), '#ff5a3a', 2.2, tr('El robot de los despidos')); sonar('alarma'); },
    jefeDerribado: (ev) => { const p = enAire(ev); for (let i = 0; i < 4; i++) setTimeout(() => FX.explosion(p.x + (Math.random() - 0.5) * 120, p.y + (Math.random() - 0.5) * 80, 2.5, 28), i * 160); FX.temblor = 26; vibrar(120); sonar('explosion'); },
    despejado: () => { FX.cartel(tr('¡LOS TENEMOS!'), '#5fe05f', 2.6, tr('Piloto automático: rumbo a la base de Microblizz')); sonar('fanfarria'); },
    faseTierra: () => { V.tierra.reiniciar(); FX.cartel(tr('ATAQUE A TIERRA'), '#ffe14a', 2.4, tr('Sigue la flecha y arrasa la base')); },
    bomba: () => sonar('bomba'),
    estallido: (ev) => { const p = enTierra(ev); FX.explosion(p.x, p.y, ev.radio / 60, 26); FX.temblor = 12; vibrar(30); sonar('explosion'); },
    impactoSuelo: (ev) => { const p = enTierra(ev); FX.chispas(p.x, p.y, 1); sonar('impacto', 0.25); },
    destruido: (ev) => { const p = enTierra(ev); FX.explosion(p.x, p.y, ev.final ? 3 : 1.6, ev.final ? 40 : 18); FX.temblor = ev.final ? 30 : 8; sonar('explosion', 0.7); if (ev.final) FX.cartel(tr('¡LA TORRE HA CAÍDO!'), '#5fe05f', 2.2); else if (ev.primario) FX.cartel(tr('¡OBJETIVO DESTRUIDO!'), '#5fe05f', 1.2); },
    baseArrasada: () => { FX.cartel(tr('¡BASE ARRASADA!'), '#5fe05f', 2.2, tr('Misión cumplida: vuelta a La Madriguera')); },
    fin: (ev) => { est.record = ev.puntos > est.mejor; if (est.record) est.mejor = ev.puntos; guardar(); sonar(ev.como === 'cumplida' ? 'fanfarria' : 'error'); },
  };

  // ---------- entrada ----------
  function aLogico(ev) { const r = CV.getBoundingClientRect(); return { x: (ev.clientX - r.left) * V.W / r.width, y: (ev.clientY - r.top) * V.H / r.height }; }
  const dentro = (p, b) => Math.hypot(p.x - b.x, p.y - b.y) < b.r + 16;

  function abajo(ev) {
    ev.preventDefault();
    if (ev.pointerType === 'touch') est.tactil = true;
    const p = aLogico(ev);
    if (est.modo !== 'juego') { tocarFuera(p); return; }
    const B = UI.botones;
    if (dentro(p, B.fuego)) { est.fuego = true; B.fuego.pulsado = ev.pointerId; return; }
    if (dentro(p, B.especial)) { est.especial = true; B.especial.pulsado = ev.pointerId; return; }
    if (p.x < V.W * 0.55 && !joy.activo) Object.assign(joy, { activo: true, id: ev.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 });
  }
  function mueve(ev) {
    if (!joy.activo || ev.pointerId !== joy.id) return;
    const p = aLogico(ev), dx = (p.x - joy.ox) / 60, dy = (p.y - joy.oy) / 60, m = Math.hypot(dx, dy);
    joy.dx = m > 1 ? dx / m : dx; joy.dy = m > 1 ? dy / m : dy;
  }
  function arriba(ev) {
    if (ev.pointerId === joy.id) Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 });
    const B = UI.botones;
    if (B.fuego.pulsado === ev.pointerId) { B.fuego.pulsado = null; est.fuego = !!teclas[' ']; }
    if (B.especial.pulsado === ev.pointerId) { B.especial.pulsado = null; est.especial = false; }
  }

  function tocarFuera(p) {
    if (est.modo === 'titulo') { est.modo = 'hangar'; sonar('toque'); return; }
    if (est.modo === 'final') { if (est.e.finT > 1.2) { est.modo = 'hangar'; sonar('toque'); } return; }
    if (est.modo !== 'hangar') return;
    const t = UI.tocarHangar(p, A.AJ);
    if (!t) return;
    if (t.jugar) { empezar(); return; }
    est.sel.caza = t.caza; sonar('toque'); guardar();
  }

  const ESPECIAL = { m: true, x: true }, IZQ = { arrowleft: true, a: true }, DER = { arrowright: true, d: true };
  function teclaJuego(k, baja, ev) {
    if (k === ' ') { est.fuego = baja || UI.botones.fuego.pulsado != null; ev.preventDefault(); }
    if (ESPECIAL[k]) { est.especial = baja || UI.botones.especial.pulsado != null; if (baja) est.pulso = true; }   // pulso: que una pulsación corta no se pierda entre dos pasos
  }
  function teclaMenu(k) {
    if (k === ' ' || k === 'enter') { if (est.modo === 'hangar') empezar(); else tocarFuera({ x: -1, y: -1 }); return; }
    if (est.modo !== 'hangar' || !(IZQ[k] || DER[k])) return;
    const ids = A.AJ.cazas.map((c) => c.id), i = ids.indexOf(est.sel.caza), d = IZQ[k] ? -1 : 1;
    est.sel.caza = ids[(i + d + ids.length) % ids.length]; sonar('toque'); guardar();
  }
  function tecla(ev, baja) {
    const k = ev.key.toLowerCase();
    teclas[k] = baja;
    if (est.modo === 'juego') teclaJuego(k, baja, ev);
    else if (baja) teclaMenu(k);
  }

  function orden() {
    const T = (a, b) => (teclas[a] || teclas[b] ? 1 : 0);
    const mx = joy.dx + T('arrowright', 'd') - T('arrowleft', 'a'), my = joy.dy + T('arrowdown', 's') - T('arrowup', 'w');
    const especial = est.especial || !!est.pulso;
    est.pulso = false;
    return { mx: Math.max(-1, Math.min(1, mx)), my: Math.max(-1, Math.min(1, my)), fuego: est.fuego, especial };
  }

  // ---------- misión ----------
  function empezar() {
    est.e = A.nuevaMision(A.AJ, { caza: est.sel.caza });
    Object.assign(est, { modo: 'juego', record: false, fuego: false, especial: false, acum: 0 });
    FX.limpiar(); V.aire.golpes = {}; V.tierra.reiniciar();
    guardar(); sonar('toque');
    FX.cartel(tr('DESPEJA EL CIELO'), '#ffe14a', 2, tr('Derriba a la patrulla de Microblizz'));
  }

  function simular(dt) {
    const e = est.e;
    A.paso(e, dt, orden(), Math.random);
    for (const ev of e.eventos) {
      if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev);
      V.aire.evento(ev); V.tierra.evento(ev); A.cabina.evento(ev);
    }
    if (e.fin && e.finT > 0.9 && est.modo === 'juego') est.modo = 'final';
  }

  function avanzar(dt) {
    est.acum += dt;
    while (est.acum >= PASO) { simular(PASO); est.acum -= PASO; }
  }

  function pintarMision(dt) {
    const e = est.e;
    if (FX.temblor > 0) G.translate((Math.random() - 0.5) * FX.temblor, (Math.random() - 0.5) * FX.temblor);
    if (e.fase === 'tierra') V.tierra.dibujar(G, e, dt, est.t); else V.aire.dibujar(G, e, dt, est.t);
    if (est.t - est.flash < 0.18) { G.fillStyle = 'rgba(255,60,40,' + (0.45 * (1 - (est.t - est.flash) / 0.18)) + ')'; G.fillRect(-40, -40, 1360, 800); }
    UI.hud(G, e, V.img['r-' + e.caza.id]);
    FX.dibujarCarteles(G, UI.texto);
    if (est.modo === 'juego') UI.mandos(G, joy, e, est.tactil);
  }

  function fotograma(ahora) {
    const dt = Math.min(0.05, (ahora - (est.ultimo || ahora)) / 1000);
    est.ultimo = ahora; est.t += dt;
    const k = CV.width / V.W;
    G.setTransform(k, 0, 0, k, 0, 0);
    G.fillStyle = '#0b1020'; G.fillRect(0, 0, V.W, V.H);
    if (innerHeight > innerWidth * 1.1) { UI.girar(G); requestAnimationFrame(fotograma); return; }
    FX.paso(dt);
    if (est.modo === 'juego') { avanzar(dt); pintarMision(dt); }
    else if (est.modo === 'final') { UI.final(G, est.e, est.t, est.record, V.img); }
    else if (est.modo === 'hangar') UI.hangar(G, A.AJ, est.sel, V.img, est.t, est.mejor);
    else UI.titulo(G, est.t, V.img);
    requestAnimationFrame(fotograma);
  }

  function imagenes() {
    const n = ['cielo', 'hangar', 'arbol', 'matorral', 'dron-becario', 'bombardero-caja', 'jefe-survivalbot'];
    for (const c of A.AJ.cazas) n.push('cenital-' + c.id, 'hangar-' + c.id, 'r-' + c.id);
    for (const o of Object.keys(A.AJ.tierra.objetivos)) n.push('suelo-' + o);
    return n;
  }
  V.cargar = function (nombres) {
    for (const n of nombres) {
      const im = new Image();
      im.onload = () => { V.img[n] = im; };
      im.src = 'img/' + n + (/^(cielo|hangar)$/.test(n) ? '.jpg' : '.png');
    }
  };

  async function arranca() {
    ajusta(); leer();
    V.cargar(imagenes()); cargarAudio();
    try { await Promise.race([document.fonts.load("12px 'Press Start 2P'"), new Promise((r) => setTimeout(r, 2000))]); } catch (err) { console.warn('Air: sin letra propia', err); }
    document.getElementById('carga').hidden = true;
    CV.addEventListener('pointerdown', abajo); CV.addEventListener('pointermove', mueve);
    addEventListener('pointerup', arriba); addEventListener('pointercancel', arriba);
    addEventListener('keydown', (ev) => tecla(ev, true)); addEventListener('keyup', (ev) => tecla(ev, false));
    addEventListener('resize', ajusta);
    requestAnimationFrame(fotograma);
  }
  arranca();
})(AIR);
