// Fans of Soccer · Principal: arranca el lienzo, lee el dedo y el teclado, mueve el partido a 60 pasos por segundo, convierte
// los eventos del dominio en efectos (golpes con parón, cámara lenta, corte de súper tiro, repetición del gol, vibración, sonidos)
// y pasa entre pantallas: título, menú, partido, descanso y final (con la Copa). Guarda en el navegador la elección y la Copa.
'use strict';
var SOCCER = globalThis.SOCCER || (globalThis.SOCCER = {});
(function (S) {
  const CV = document.getElementById('juego'), G = CV.getContext('2d'), V = S.vista, UI = S.ui, FX = S.efectos, PASO = 1 / 60;
  const est = { modo: 'titulo', e: null, controlado: 3, t: 0, acum: 0, ultimo: 0, boton: null, lento: 0, paron: 0, zoomT: 0, copaRes: null,
    sel: { modo: 'copa', equipo: 'animales', rival: 'microblizz', campo: 'atico', estrategia: { pasan: true, presionan: true, porteroSube: false } },
    progreso: {}, tutorialHecho: false };
  const joy = { activo: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 }, teclas = {};

  function ajusta() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), k = Math.min(innerWidth / V.W, innerHeight / V.H);
    CV.style.width = Math.floor(V.W * k) + 'px'; CV.style.height = Math.floor(V.H * k) + 'px';
    CV.width = Math.floor(V.W * k * dpr); CV.height = Math.floor(V.H * k * dpr);
  }

  // ---------- guardado (solo comodidad: si falla, se empieza con lo de siempre) ----------
  function guardar() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ eleccion: est.sel, copa: est.progreso, tutorial: est.tutorialHecho })); }
    catch (err) { console.warn('Soccer: no se guarda', err); }
  }
  function leer() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'), ids = S.AJ.equipos.map((q) => q.id), s = d.eleccion;
      if (s && ids.includes(s.equipo) && ids.includes(s.rival) && S.AJ.campos[s.campo]) est.sel = Object.assign(est.sel, s, { estrategia: Object.assign(est.sel.estrategia, s.estrategia) });
      if (d.copa) est.progreso = d.copa;
      est.tutorialHecho = !!d.tutorial;
    } catch (err) { console.warn('Soccer: no se lee lo guardado', err); }
  }
  const progreso = () => est.progreso[est.sel.equipo] || 0;

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
  function vibrar(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (err) { console.warn('Soccer: sin vibración', err); } }
  const golpe = (paron, temblor, ms) => { est.paron = Math.max(est.paron, paron); V.temblor = Math.max(V.temblor, temblor); vibrar(ms); };

  // ---------- eventos del dominio -> efectos ----------
  const mio = (ev) => ev.quien !== undefined && ev.quien < 4;
  const EFECTOS = {
    tiro: () => { sonar(160, 0.15, 'triangle', 0.5); V.temblor = 6; },
    super: (ev, e) => { FX.cortar(e.aj.equipos[ev.eq]); sonar(120, 0.8, 'sawtooth', 6); vibrar(60); },
    chilena: () => sonar(700, 0.12, 'square', 0.6),
    pase: () => sonar(520, 0.06, 'square'),
    barrida: () => sonar(90, 0.2, 'sawtooth', 0.6),
    empujon: () => sonar(140, 0.12, 'square', 0.7),
    derribo: (ev, e) => { const j = e.jugadores[ev.quien]; V.vidaVista[j.id] = est.t; FX.estallido(j.x, j.y, 1, '#ffe14a', 14); golpe(0.06, 10, 25); sonar(70, 0.25, 'square', 0.5); },
    atropello: (ev, e) => { const j = e.jugadores[ev.quien]; V.vidaVista[j.id] = est.t; FX.estallido(j.x, j.y, 1, '#fff', 12); golpe(0.05, 8, 20); },
    ko: (ev, e) => { const j = e.jugadores[ev.quien]; UI.avisar(tr('¡KO!'), '#ff5a5a', 0.9); FX.estallido(j.x, j.y, 2, '#ff5a5a', 30); golpe(0.14, 20, 80); sonar(55, 0.5, 'sawtooth', 0.4); },
    vuelve: () => sonar(880, 0.08, 'triangle'),
    cargado: (ev, e) => { if (mio(ev)) { const j = e.jugadores[ev.quien]; FX.estallido(j.x, j.y, 2, '#ffe14a', 18); sonar(990, 0.15, 'square', 1.5); vibrar(20); } },
    cargando: () => sonar(300, 0.5, 'square', 1.2),
    salto: (ev) => { FX.estallido(ev.x, ev.y, 1, '#18d2e6', 8); sonar(1200, 0.04, 'square'); },
    parada: (ev) => { sonar(330, 0.12, 'triangle', 1.5); if (ev.clase === 'super') UI.avisar(tr('¡PARADÓN!'), '#5fe05f', 1); },
    'portero-ko': (ev, e) => { const j = e.jugadores[ev.quien]; FX.estallido(j.x, j.y, 2, '#ff5a5a', 30); golpe(0.12, 22, 70); },
    rebote: () => sonar(220, 0.05, 'triangle'),
    orden: (ev) => { V.globos[ev.quien] = { texto: ev.ok ? tr('¡Voy!') : tr('¡No puedo!'), ok: ev.ok, desde: est.t }; },
    clima: (ev) => { UI.avisar(tr(FX.avisoClima[ev.clima]), '#9fe0ff', 1.4); sonar(200, 0.6, 'sawtooth', 0.6); },
    oro: () => { UI.avisar(tr('¡GOL DE ORO!'), '#ffcf3a', 2); sonar(660, 0.4, 'square', 1.5); },
    descanso: () => { est.modo = 'descanso'; sonar(392, 0.4, 'triangle'); },
    gol: (ev, e) => {
      golpe(0.1, 26, 120); FX.estallido(e.balon.x, e.balon.y, 2, e.aj.equipos[ev.eq].color, 60); FX.estallido(e.balon.x, e.balon.y, 3, '#fff', 30);
      UI.avisar(tr('¡GOL!'), e.aj.equipos[ev.eq].color, 1.2); est.repetirEn = 1.2;
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => sonar(f, 0.18, 'square'), i * 110));
    },
    fin: (ev, e) => { est.modo = 'final'; est.repetirEn = 0; sonar(392, 0.6, 'triangle', 0.5); terminarCopa(e); },
  };

  function terminarCopa(e) {
    if (est.sel.modo !== 'copa') { est.copaRes = null; return; }
    const r = S.copa.avanzar(progreso(), est.sel.equipo, e.marcador), lista = S.copa.rivales(est.sel.equipo);
    est.progreso[est.sel.equipo] = r.progreso;
    const sig = lista[r.progreso];
    est.copaRes = { gana: r.gana, campeon: r.campeon, siguiente: r.gana && sig ? S.AJ.equipos.find((q) => q.id === sig.equipo).nombre : null };
    guardar();
  }

  // ---------- entrada ----------
  function aLogico(ev) { const r = CV.getBoundingClientRect(); return { x: (ev.clientX - r.left) * V.W / r.width, y: (ev.clientY - r.top) * V.H / r.height }; }
  const dentro = (p, b) => Math.hypot(p.x - b.x, p.y - b.y) < b.r + 18;

  function abajo(ev) {
    ev.preventDefault();
    const p = aLogico(ev);
    if (est.modo !== 'juego') { tocarFuera(p); return; }
    const B = UI.botones;
    if (dentro(p, B.tiro)) { est.boton = 'rojo'; B.tiro.pulsado = ev.pointerId; return; }
    if (dentro(p, B.pase)) { est.boton = 'azul'; B.pase.pulsado = ev.pointerId; return; }
    if (p.x < V.W * 0.55 && !joy.activo) Object.assign(joy, { activo: true, id: ev.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 });
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

  function tocarFuera(p) {
    if (est.modo === 'titulo') { est.modo = 'menu'; sonar(520, 0.06); return; }
    if (est.modo === 'descanso') { S.reanudar(est.e); est.modo = 'juego'; sonar(660, 0.1); return; }
    if (est.modo === 'final') { est.modo = 'menu'; return; }
    if (est.modo !== 'menu') return;
    const t = UI.tocarMenu(p, S.AJ, est.sel);
    if (t) elegir(t);
  }

  function elegir(t) {
    const s = est.sel;
    if (t.jugar) { empezar(); return; }
    if (t.estrategia) s.estrategia[t.estrategia] = !s.estrategia[t.estrategia];
    else Object.assign(s, t);
    if (s.rival === s.equipo) s.rival = S.AJ.equipos.find((q) => q.id !== s.equipo).id;
    sonar(t.equipo ? 440 : 600, 0.06); guardar();
  }

  function tecla(ev, baja) {
    const k = ev.key.toLowerCase();
    teclas[k] = baja;
    if (!baja) return;
    if (est.modo !== 'juego') { if (k === ' ' || k === 'enter') { if (est.modo === 'menu') empezar(); else tocarFuera({ x: -1, y: -1 }); } return; }
    if (k === 'x' || k === 'j') est.boton = 'azul';
    if (k === 'c' || k === 'k' || k === ' ') est.boton = 'rojo';
  }

  // ---------- lo que hace la persona ----------
  function contexto(e) {
    const b = e.balon, j = e.jugadores[est.controlado], r = e.aj.remate;
    if (b.dueno === est.controlado) return 'conBalon';
    if (b.dueno >= 0 && e.jugadores[b.dueno].eq === 0) return 'companero';
    if (b.dueno < 0 && b.z > r.zMin && b.z < r.zMax && S.util.dist(j, b) < r.alcance + 1) return 'aire';
    return 'sinBalon';
  }
  const ACCION = { conBalon: ['pase', 'tiro'], companero: ['pase', 'tiro'], aire: ['empujon', 'tiro'], sinBalon: ['empujon', 'barrida'] };

  function direccion() {
    const T = (a, b) => (teclas[a] || teclas[b] ? 1 : 0);
    return [joy.dx + T('arrowright', 'd') - T('arrowleft', 'a'), joy.dy + T('arrowdown', 's') - T('arrowup', 'w')];
  }

  function ordenPersona(e) {
    const [mx, my] = direccion(), ctx = contexto(e);
    const accion = est.boton ? ACCION[ctx][est.boton === 'azul' ? 0 : 1] : null;
    est.boton = null;
    return { mx, my, accion, ordena: ctx === 'companero' };
  }

  // ---------- partido ----------
  function empezar() {
    const s = est.sel, enCopa = s.modo === 'copa', lista = S.copa.rivales(s.equipo);
    if (enCopa && progreso() >= lista.length) est.progreso[s.equipo] = 0;   // campeón: la Copa vuelve a empezar
    const r = enCopa ? lista[progreso()] : { equipo: s.rival, campo: s.campo };
    est.e = S.nuevoPartido(S.AJ, { campo: r.campo, equipos: [s.equipo, r.equipo], estrategia: s.estrategia });
    est.e.estrategia[1].presionan = S.AJ.equipos.find((q) => q.id === r.equipo).nivel > 0.5;
    Object.assign(est, { modo: 'juego', controlado: 3, copaRes: null, repetirEn: 0 });
    V.cam = 50; UI.cartel = null; FX.fotos = []; FX.repe = null; FX.corte = null;
    if (!est.tutorialHecho) S.tutorial.empezar();
    guardar(); sonar(660, 0.1);
  }

  function simular(dt) {
    const e = est.e;
    est.controlado = S.elegirControlado(e, 0, est.controlado);
    const ord = S.ordenesIA(e, est.controlado, Math.random);
    ord[est.controlado] = ordenPersona(e);
    S.paso(e, dt, ord, Math.random);
    FX.grabar(e);
    for (const ev of e.eventos) if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev, e);
    if (S.tutorial.mirar(e.eventos, dt, Math.hypot(...direccion()) > 0.3)) { est.tutorialHecho = true; guardar(); }
    if (e.eventos.some((ev) => ev.tipo === 'super')) { est.zoomT = 0.8; }
  }

  // Avanza el tiempo del partido teniendo en cuenta el corte de súper tiro, los parones de golpe, la cámara lenta y la repetición.
  function avanzar(dt) {
    if (FX.enCorte()) return;
    if (est.paron > 0) { est.paron -= dt; return; }
    if (est.repetirEn > 0) { est.repetirEn -= dt; if (est.repetirEn <= 0) { FX.empezarRepeticion(); est.modo = 'repeticion'; return; } }
    est.zoomT = Math.max(0, est.zoomT - dt); V.zoomObj = est.zoomT > 0 ? 1.25 : 1;
    let k = 1;
    if (est.zoomT > 0.5) k = 0.3;   // cámara lenta al salir el súper tiro
    est.acum += dt * k;
    while (est.acum >= PASO && est.modo === 'juego') { simular(PASO); est.acum -= PASO; }
  }

  function pintarJuego(dt) {
    const e = est.e, ctx = contexto(e), j = e.jugadores[est.controlado];
    V.dibujar(G, e, dt, est.t, est.controlado, { flecha: ctx === 'conBalon' ? direccion() : null });
    UI.marcador(G, e);
    UI.carrerilla(G, e, j);
    UI.carteles(G, dt);
    UI.mandos(G, joy, ctx, S.puedeSuper(e, j));
    S.tutorial.dibujar(G, est.t);
    FX.dibujarCorte(G, dt);
  }

  function pintarRepeticion(dt) {
    const foto = FX.fotoRepeticion(est.e, dt);
    if (!foto) { est.modo = 'juego'; est.e.pausa = Math.min(est.e.pausa, 0.4); V.zoomObj = 1; return pintarJuego(dt); }
    V.zoomObj = 1.15;
    V.dibujar(G, foto, dt, est.t, -1);
    UI.marcador(G, est.e);
    UI.repeticion(G, est.t);
  }

  function fotograma(ahora) {
    const dt = Math.min(0.05, (ahora - (est.ultimo || ahora)) / 1000);
    est.ultimo = ahora; est.t += dt;
    const k = CV.width / V.W;
    G.setTransform(k, 0, 0, k, 0, 0);
    G.fillStyle = '#0b1020'; G.fillRect(0, 0, V.W, V.H);
    if (innerHeight > innerWidth * 1.1) { UI.girar(G); requestAnimationFrame(fotograma); return; }
    if (!est.e) est.e = S.nuevoPartido(S.AJ, { campo: est.sel.campo });
    if (est.modo === 'juego') { avanzar(dt); if (est.modo === 'repeticion') pintarRepeticion(dt); else pintarJuego(dt); }
    else if (est.modo === 'repeticion') pintarRepeticion(dt);
    else if (est.modo === 'descanso') UI.descanso(G, est.e, V.img, est.t);
    else {
      V.dibujar(G, est.e, dt, est.t, -1);
      if (est.modo === 'titulo') UI.titulo(G, est.t);
      else if (est.modo === 'menu') UI.menu(G, S.AJ, est.sel, V.img, est.t, progreso());
      else { UI.marcador(G, est.e); UI.final(G, est.e, est.t, est.copaRes); }
    }
    requestAnimationFrame(fotograma);
  }

  function imagenes() {
    const n = ['fondo', 'fondo-parking', 'fondo-servidores', 'r-bunny', 'r-ceo', 'r-necro', 'r-marine', 'r-presidente'];
    for (const q of S.AJ.equipos) { n.push('d-' + q.id); for (const d of q.jugadores) if (!n.includes(d[0])) n.push(d[0]); }
    return n;
  }

  async function arranca() {
    ajusta(); leer();
    V.cargar(imagenes());
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
