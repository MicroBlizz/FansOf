// Fans of Soccer · Principal: arranca el lienzo, lee el dedo y el teclado, mueve el partido a 60 pasos por segundo,
// convierte los eventos del dominio en efectos (temblor, cámara lenta, chispas, carteles, sonidos) y cambia entre pantallas.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const CV = document.getElementById('juego'), G = CV.getContext('2d'), V = S.vista, UI = S.ui, PASO = 1 / 60;
  const est = { modo: 'titulo', e: null, controlado: 3, sel: { equipo: 0, campo: 'atico' }, lento: 0, t: 0, acum: 0, ultimo: 0, accion: null };
  const joy = { activo: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 }, teclas = {};

  function ajusta() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), k = Math.min(innerWidth / V.W, innerHeight / V.H);
    CV.style.width = Math.floor(V.W * k) + 'px'; CV.style.height = Math.floor(V.H * k) + 'px';
    CV.width = Math.floor(V.W * k * dpr); CV.height = Math.floor(V.H * k * dpr);
  }

  // ---------- sonido (sintetizado, sin archivos) ----------
  let AC = null;
  function sonar(f, dura, tipo, sube) {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), v = AC.createGain(), t = AC.currentTime;
      o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t);
      if (sube) o.frequency.exponentialRampToValueAtTime(f * sube, t + dura);
      v.gain.setValueAtTime(0.12, t); v.gain.exponentialRampToValueAtTime(0.001, t + dura);
      o.connect(v).connect(AC.destination); o.start(t); o.stop(t + dura);
    } catch (err) { console.warn('Soccer: sin sonido', err); }
  }

  // ---------- eventos del dominio -> efectos ----------
  const EFECTOS = {
    tiro: () => { sonar(160, 0.15, 'triangle', 0.5); V.temblor = 6; },
    super: (ev) => { est.lento = 0.45; V.temblor = 22; sonar(120, 0.6, 'sawtooth', 6); UI.avisar(ev.clase === 'zanahoria' ? tr('¡ZANAHORIAZO!') : tr('¡CHILENA DEL CEO!'), ev.clase === 'zanahoria' ? '#ff8a2a' : '#ff3b3b', 1.1); },
    pase: () => sonar(520, 0.06, 'square'),
    barrida: () => sonar(90, 0.2, 'sawtooth', 0.6),
    derribo: (ev, e) => { const j = e.jugadores[ev.quien]; V.temblor = 10; V.estallido(j.x, j.y, 1, '#ffe14a', 14); sonar(70, 0.25, 'square', 0.5); },
    parada: () => sonar(330, 0.12, 'triangle', 1.5),
    'portero-ko': (ev, e) => { const j = e.jugadores[ev.quien]; V.estallido(j.x, j.y, 2, '#ff5a5a', 30); V.temblor = 18; },
    rebote: () => sonar(220, 0.05, 'triangle'),
    gol: (ev, e) => {
      V.temblor = 26; V.estallido(e.balon.x, e.balon.y, 2, e.aj.equipos[ev.eq].color, 60); V.estallido(e.balon.x, e.balon.y, 3, '#fff', 30);
      UI.avisar(tr('¡GOL!'), e.aj.equipos[ev.eq].color, 2);
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => sonar(f, 0.18, 'square'), i * 110));
    },
    fin: () => { est.modo = 'final'; sonar(392, 0.6, 'triangle', 0.5); },
  };

  // ---------- entrada ----------
  function aLogico(ev) { const r = CV.getBoundingClientRect(); return { x: (ev.clientX - r.left) * V.W / r.width, y: (ev.clientY - r.top) * V.H / r.height }; }
  const dentro = (p, b) => Math.hypot(p.x - b.x, p.y - b.y) < b.r + 18;

  function abajo(ev) {
    ev.preventDefault();
    const p = aLogico(ev);
    if (est.modo !== 'juego') { tocarFuera(p); return; }
    const B = UI.botones;
    if (dentro(p, B.tiro)) { est.accion = 'tiro'; B.tiro.pulsado = ev.pointerId; return; }
    if (dentro(p, B.pase)) { est.accion = 'pase'; B.pase.pulsado = ev.pointerId; return; }
    if (p.x < V.W * 0.55 && !joy.activo) Object.assign(joy, { activo: true, id: ev.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 });
  }
  function tocarFuera(p) {
    if (est.modo !== 'menu') { est.modo = 'menu'; sonar(520, 0.06); return; }
    const t = UI.tocarMenu(p, S.AJ);
    if (!t) return;
    if (t.jugar) { empezar(); return; }
    Object.assign(est.sel, t); sonar(t.equipo !== undefined ? 440 : 600, 0.06); guardarEleccion();
  }

  // La última elección se recuerda en este navegador (solo comodidad: si falla, se empieza con la de siempre).
  function guardarEleccion() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ eleccion: est.sel })); } catch (err) { console.warn('Soccer: no se guarda la elección', err); } }
  function leerEleccion() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').eleccion;
      if (d && S.AJ.campos[d.campo] && S.AJ.equipos[d.equipo]) est.sel = { equipo: d.equipo, campo: d.campo };
    } catch (err) { console.warn('Soccer: no se lee la elección', err); }
  }

  function mueve(ev) {
    if (!joy.activo || ev.pointerId !== joy.id) return;
    const p = aLogico(ev), dx = (p.x - joy.ox) / 70, dy = (p.y - joy.oy) / 70, m = Math.hypot(dx, dy);
    joy.dx = m > 1 ? dx / m : dx; joy.dy = m > 1 ? dy / m : dy;
  }
  function arriba(ev) {
    if (ev.pointerId === joy.id) Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 });
    for (const b of Object.values(UI.botones)) if (b.pulsado === ev.pointerId) b.pulsado = null;
  }
  function tecla(ev, baja) {
    teclas[ev.key.toLowerCase()] = baja;
    if (!baja) return;
    if (est.modo !== 'juego') { teclaMenu(ev.key); return; }
    const k = ev.key.toLowerCase();
    if (k === 'x' || k === 'j') est.accion = 'pase';
    if (k === 'c' || k === 'k' || k === ' ') est.accion = 'tiro';
  }

  function teclaMenu(k) {
    if (est.modo !== 'menu') { if (k === ' ' || k === 'Enter') est.modo = 'menu'; return; }
    const ids = Object.keys(S.AJ.campos), i = ids.indexOf(est.sel.campo);
    if (k === 'ArrowUp' || k === 'ArrowDown') est.sel.equipo = 1 - est.sel.equipo;
    if (k === 'ArrowLeft') est.sel.campo = ids[(i + ids.length - 1) % ids.length];
    if (k === 'ArrowRight') est.sel.campo = ids[(i + 1) % ids.length];
    if (k === ' ' || k === 'Enter') empezar(); else guardarEleccion();
  }

  function ordenPersona() {
    const T = (a, b) => (teclas[a] || teclas[b] ? 1 : 0);
    let mx = joy.dx + T('arrowright', 'd') - T('arrowleft', 'a'), my = joy.dy + T('arrowdown', 's') - T('arrowup', 'w');
    const e = est.e, tiene = e.balon.dueno === est.controlado;
    // en pantalla «abajo» es acercarse a la cámara (más y); en el campo lo mismo
    const accion = est.accion === 'pase' && !tiene ? 'barrida' : est.accion;
    est.accion = null;
    return { mx, my, accion };
  }

  // ---------- bucle ----------
  function empezar() { est.e = S.nuevoPartido(S.AJ, est.sel.campo); est.modo = 'juego'; est.controlado = est.sel.equipo * 4 + 3; V.cam = 50; UI.cartel = null; sonar(660, 0.1); }

  function simular(dt) {
    const e = est.e;
    est.controlado = S.elegirControlado(e, est.sel.equipo, est.controlado);
    const ord = S.ordenesIA(e, est.controlado, Math.random);
    ord[est.controlado] = ordenPersona();
    S.paso(e, dt, ord, Math.random);
    for (const ev of e.eventos) if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev, e);
  }

  function fotograma(ahora) {
    const dt = Math.min(0.05, (ahora - (est.ultimo || ahora)) / 1000);
    est.ultimo = ahora; est.t += dt;
    const k = CV.width / V.W;
    G.setTransform(k, 0, 0, k, 0, 0);
    if (innerHeight > innerWidth * 1.1) { UI.girar(G); requestAnimationFrame(fotograma); return; }
    if (!est.e || (est.modo === 'menu' && est.e.aj.campo.id !== est.sel.campo)) est.e = S.nuevoPartido(S.AJ, est.sel.campo);   // de fondo, el campo elegido
    let dtJuego = dt;
    if (est.lento > 0) { est.lento -= dt; dtJuego = dt * 0.25; }
    if (est.modo === 'juego') { est.acum += dtJuego; while (est.acum >= PASO) { simular(PASO); est.acum -= PASO; } }
    V.dibujar(G, est.e, dt, est.t, est.modo === 'juego' ? est.controlado : -1);
    if (est.lento > 0) { G.fillStyle = 'rgba(255,255,255,.08)'; G.fillRect(0, 0, V.W, V.H); }
    UI.marcador(G, est.e);
    UI.carteles(G, dt);
    if (est.modo === 'juego') UI.mandos(G, est.e, joy, est.controlado, est.sel.equipo);
    else if (est.modo === 'titulo') UI.titulo(G, est.t);
    else if (est.modo === 'menu') UI.menu(G, S.AJ, est.sel, V.img, est.t);
    else UI.final(G, est.e, est.t, est.sel.equipo);
    requestAnimationFrame(fotograma);
  }

  async function arranca() {
    ajusta();
    leerEleccion();
    V.cargar(['bunny', 'zorro', 'ardilla', 'vaca', 'ceo', 'becario', 'survival', 'fondo', 'fondo-parking', 'fondo-servidores']);
    try { await Promise.race([document.fonts.load("12px 'Press Start 2P'"), new Promise((r) => setTimeout(r, 2000))]); } catch (err) { console.warn('Soccer: sin letra propia', err); }
    document.getElementById('carga').hidden = true;
    CV.addEventListener('pointerdown', abajo); CV.addEventListener('pointermove', mueve);
    addEventListener('pointerup', arriba); addEventListener('pointercancel', arriba);
    addEventListener('keydown', (ev) => tecla(ev, true)); addEventListener('keyup', (ev) => tecla(ev, false));
    addEventListener('resize', ajusta);
    requestAnimationFrame(fotograma);
  }
  arranca();
})(SOCCER);
