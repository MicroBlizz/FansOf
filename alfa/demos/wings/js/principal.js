// Fans of Wings · Principal: arranca los dos lienzos (el mundo 3D y el HUD encima), lee el dedo, el ratón y el teclado, mueve la
// misión a 60 pasos por segundo, convierte los eventos del dominio en efectos, carteles y sonidos, y pasa entre pantallas: título,
// hangar, ajustes, partes y novedades, misión, pausa y parte final (qué se pulsa en cada una lo dicen menu.js y partes.js). Guarda
// en el navegador el caza elegido, la palanca, el sonido, la cámara, el récord con su rango y los partes del escuadrón.
'use strict';
var WINGS = globalThis.WINGS || (globalThis.WINGS = {});
(function (A) {
  const CV = document.getElementById('hud'), G = CV.getContext('2d'), VI = A.vista, UI = A.ui, E = A.estilo, FX = A.efectos, S = A.sonido, R = A.gl.R, PASO = 1 / 60;
  const est = { modo: 'titulo', e: null, t: 0, acum: 0, ultimo: 0, fuego: false, especial: false, sel: { caza: 'bunny', normal: false }, mejor: 0, mejorRango: '', record: false, tactil: false, flash: -9, exhib: null, k: 1,
    cursor: 0, ajustes: false, mudo: false, ips: 0, partes: { misiones: 0, cumplidas: 0, derribos: {} } };
  const joy = { activo: false, id: -1, ox: 0, oy: 0, dx: 0, dy: 0 }, teclas = {};
  const ritmo = { n: 0, t: 0 };   // imágenes por segundo, para ver en el hangar cómo va de fluido el móvil
  const NOMBRE_CAMARA = { arriba: 'DESDE ARRIBA', persecucion: 'PERSECUCIÓN', cabina: 'CABINA' };
  A._est = est;   // para las pruebas automáticas y el panel DEV

  // El mundo 3D se pinta a pocas líneas (píxel gordo) y se estira; el HUD, a la resolución de la pantalla.
  function ajusta() {
    // Se mide el lienzo tal como se ve (no la ventana): en el móvil, con la barra de direcciones a la vista, la ventana es más alta.
    const ancho = CV.clientWidth || innerWidth, alto = CV.clientHeight || innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1), asp = Math.max(1, ancho / alto), lineas = A.AJ.pantalla.lineas;
    A.gl.medida(Math.min(A.AJ.pantalla.anchoMax, Math.round(lineas * asp)), lineas);
    CV.width = Math.floor(ancho * dpr); CV.height = Math.floor(alto * dpr);
    est.k = CV.height / 720; UI.medida(CV.width / est.k);
  }

  // ---------- guardado (solo comodidad: si falla, se empieza con lo de siempre) ----------
  function guardar() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ caza: est.sel.caza, normal: est.sel.normal, mejor: est.mejor, mejorRango: est.mejorRango, camara: VI.modo, mudo: est.mudo, partes: est.partes })); }
    catch (err) { console.warn('Wings: no se guarda', err); }
  }
  function leer() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      if (A.AJ.cazas.some((c) => c.id === d.caza)) est.sel.caza = d.caza;
      est.mejor = Number(d.mejor) || 0; est.sel.normal = !!d.normal;
      if ([0, 1, 2].includes(d.camara)) VI.ponCamara(d.camara);
      est.mejorRango = typeof d.mejorRango === 'string' ? d.mejorRango.slice(0, 1) : '';
      est.mudo = !!d.mudo; S.mudo = est.mudo;
      const q = d.partes || {};
      est.partes = { misiones: Number(q.misiones) || 0, cumplidas: Number(q.cumplidas) || 0, derribos: {} };
      for (const c of A.AJ.cazas) est.partes.derribos[c.id] = Number(q.derribos && q.derribos[c.id]) || 0;
    } catch (err) { console.warn('Wings: no se lee lo guardado', err); }
  }

  // ---------- eventos del dominio -> efectos ----------
  const aviso = () => S.sonar('alarma');
  const EFECTOS = {
    disparo: () => S.sonar('ametralladora', 0.25),
    misil: () => S.sonar('misil'),
    fijado: () => S.sonar('fijado'),
    sinMisiles: () => { S.sonar('error'); FX.cartel(tr('SIN MISILES'), '#ff5a3a', 0.8); },
    impacto: (ev) => { FX.chispas(R(ev.pos), ev.jefe ? 2.4 : 1.4); S.sonar('impacto', 0.3); },
    derribo: (ev) => { FX.explosion(R(ev.pos), ev.enemigo === 'caja' ? 2.2 : 1.5); FX.temblor = 6; S.sonar('explosion', 0.6); if (ev.combo > 1) FX.cartel(tr('RABIA') + ' x' + ev.combo, '#ff8a2a', 0.7); },
    explosion: (ev) => { FX.explosion(R(ev.pos), ev.grande ? 2.6 : 1.6, 26); FX.temblor = 8; S.sonar('explosion'); },
    golpe: (ev) => { FX.chispas(R(ev.pos), 1.2, '#ff5a3a'); FX.temblor = 14; est.flash = est.t; S.vibrar(40); S.sonar('impacto'); },
    dano: (ev) => { if (ev.motivo === 'choque') { FX.temblor = 18; est.flash = est.t; S.vibrar(70); } },
    jefe: () => { FX.cartel(tr('¡SURVIVALBOT!'), '#ff5a3a', 2.2, tr('El robot de los despidos')); S.sonar('alarma'); },
    alturaMax: () => { aviso(); FX.cartel(tr('ALTURA MÁXIMA'), '#ffe14a', 1.2); },
    alturaBaja: () => { aviso(); FX.cartel(tr('¡SUBE!'), '#ff5a3a', 1.2, tr('Vas muy bajo')); },
    perdida: () => { aviso(); FX.cartel(tr('¡PÉRDIDA!'), '#ff5a3a', 1.2, tr('Baja el morro para coger velocidad')); },
    combustibleBajo: () => { aviso(); FX.cartel(tr('POCO COMBUSTIBLE'), '#ff8a2a', 1.6, tr('Los enemigos derribados sueltan bidones')); },
    estrellado: () => { FX.explosion(R(est.e.aire.jugador.pos), 5, 50); FX.temblor = 34; est.flash = est.t; S.vibrar(200); S.sonar('explosion'); },
    premioSuelto: () => S.sonar('premioSuelto'),
    premio: (ev) => { S.sonar('premio'); S.vibrar(20); FX.cartel('+ ' + tr(PREMIO[ev.premio]), '#5fe05f', 0.9); },
    jefeDerribado: (ev) => { const p = R(ev.pos); for (let i = 0; i < 4; i++) setTimeout(() => FX.explosion([p[0] + (Math.random() - 0.5) * 60, p[1] + (Math.random() - 0.5) * 30, p[2] + (Math.random() - 0.5) * 60], 3.4, 28), i * 160); FX.temblor = 26; S.vibrar(120); S.sonar('explosion'); },
    despejado: () => { FX.cartel(tr('¡LOS TENEMOS!'), '#5fe05f', 2.6, tr('Cielo despejado')); S.sonar('fanfarria'); },
    fin: (ev) => { apuntaParte(ev); S.sonar(ev.como === 'cumplida' ? 'fanfarria' : 'error'); },
  };
  // El parte de la misión que acaba: récord (con su rango), misiones voladas y cumplidas, y los derribos del piloto.
  function apuntaParte(ev) {
    const Q = est.partes, id = est.e.caza.id;
    est.record = ev.puntos > est.mejor;
    if (est.record) { est.mejor = ev.puntos; est.mejorRango = ev.rango; }
    Q.misiones++; if (ev.como === 'cumplida') Q.cumplidas++;
    Q.derribos[id] = (Q.derribos[id] || 0) + est.e.derribos;
    guardar();
  }
  const PREMIO = { misiles: 'MISILES', bombas: 'BOMBAS', reparacion: 'REPARACIÓN', combustible: 'COMBUSTIBLE' };

  // ---------- entrada ----------
  const aLogico = (ev) => { const r = CV.getBoundingClientRect(); return { x: (ev.clientX - r.left) * UI.W / r.width, y: (ev.clientY - r.top) * 720 / r.height }; };   // el toque, en la pantalla lógica
  const dentro = (p, b) => Math.hypot(p.x - b.x, p.y - b.y) < b.r + 16;

  function cambiaCamara() { const n = VI.cambiaCamara(); S.sonar('camara'); FX.cartel(tr('CÁMARA') + ': ' + tr(NOMBRE_CAMARA[n]), '#ffe14a', 0.9); guardar(); }

  // Con la pantalla de pie, un toque en cualquier sitio pone la pantalla completa fijada en horizontal (core: HORIZONTAL, ADR 133).
  function giraConToque() { if (HORIZONTAL.deCanto()) HORIZONTAL.fijar(); }
  const MANTENER = ['fuego', 'especial', 'turbo', 'freno'];   // botones táctiles que valen mientras se aprietan
  function abajo(ev) {
    ev.preventDefault();
    if (HORIZONTAL.deCanto()) return;   // de pie solo se ve el aviso: el toque lo recoge giraConToque
    est.tactil = ev.pointerType === 'touch' ? true : est.tactil;
    const p = aLogico(ev);
    if (est.modo !== 'juego') { tocarMenu(p); return; }
    const B = UI.botones;
    if (dentro(p, B.pausa)) { pausar(); return; }
    if (est.tactil && dentro(p, B.camara)) { cambiaCamara(); return; }
    for (const n of MANTENER) if (est.tactil && dentro(p, B[n])) { B[n].pulsado = ev.pointerId; if (n === 'especial') est.pulso = true; return; }
    if (est.tactil && p.x < UI.W * 0.55 && !joy.activo) Object.assign(joy, { activo: true, id: ev.pointerId, ox: p.x, oy: p.y, dx: 0, dy: 0 });
  }
  function mueve(ev) {
    if (est.modo !== 'juego') { if (ev.pointerType === 'mouse') apuntaMenu(aLogico(ev)); return; }
    if (!joy.activo || ev.pointerId !== joy.id) return;
    const p = aLogico(ev), dx = (p.x - joy.ox) / 60, dy = (p.y - joy.oy) / 60, m = Math.hypot(dx, dy);
    joy.dx = m > 1 ? dx / m : dx; joy.dy = m > 1 ? dy / m : dy;
  }
  function arriba(ev) {
    if (ev.pointerId === joy.id) Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 });
    for (const n of MANTENER) if (UI.botones[n].pulsado === ev.pointerId) UI.botones[n].pulsado = null;
  }
  function sueltaTodo() {
    Object.assign(joy, { activo: false, id: -1, dx: 0, dy: 0 });
    for (const n of MANTENER) UI.botones[n].pulsado = null;
    for (const k of Object.keys(teclas)) teclas[k] = false;
  }

  // ---------- menús: qué pantalla se ve, su cursor y qué hace cada cosa que se pulsa ----------
  const pantalla = () => (est.ajustes ? 'ajustes' : est.modo);
  const zonas = () => UI.pantallas[pantalla()].zonas(est);
  function ir(modo) { est.modo = modo; est.ajustes = false; est.cursor = modo === 'hangar' ? A.AJ.cazas.length + 1 : 0; S.sonar('toque'); }
  function cambiaCaza(d) {
    const ids = A.AJ.cazas.map((c) => c.id), i = ids.indexOf(est.sel.caza);
    eligeCaza(ids[(i + d + ids.length) % ids.length]);
  }
  function eligeCaza(id) { est.sel.caza = id; est.exhib = null; S.sonar('toque'); guardar(); }
  function pausar() { if (est.modo !== 'juego' || est.e.fin) return; sueltaTodo(); ir('pausa'); }
  const ACCIONES = {
    iniciar: () => empezar(), despegar: () => empezar(), otra: () => empezar(), reintentar: () => empezar(),
    hangar: () => ir('hangar'), novedades: () => ir('novedades'),
    alHangar: () => { est.exhib = null; ir('hangar'); }, abandonar: () => { est.exhib = null; ir('hangar'); },
    ajustes: () => { est.ajustes = true; est.cursor = 0; S.sonar('toque'); },
    seguir: () => { est.modo = 'juego'; est.cursor = 0; S.sonar('toque'); },
    palanca: () => { est.sel.normal = !est.sel.normal; S.sonar('toque'); guardar(); },
    sonido: () => { est.mudo = !est.mudo; S.mudo = est.mudo; S.sonar('toque'); guardar(); },
    volver: () => volver(),
  };
  // Atrás: de los ajustes a la pantalla de debajo, de la pausa a volar y de lo demás al título.
  function volver() {
    if (est.ajustes) { est.ajustes = false; est.cursor = 0; S.sonar('toque'); return; }
    if (est.modo === 'pausa') { ACCIONES.seguir(); return; }
    if (est.modo === 'hangar' || est.modo === 'novedades') ir('titulo');
  }
  const bloqueado = () => est.modo === 'final' && est.e.finT <= 1.2;   // que un toque de la batalla no se salte el parte
  function pulsa(z) {
    if (!z || bloqueado()) return;
    if (z.id.startsWith('caza:')) { eligeCaza(z.id.slice(5)); return; }
    ACCIONES[z.id]();
  }
  function tocarMenu(p) { const Z = zonas(), i = Z.findIndex((z) => E.dentro(p, z)); if (i >= 0) { est.cursor = i; pulsa(Z[i]); } }
  function apuntaMenu(p) { const i = zonas().findIndex((z) => E.dentro(p, z)); if (i >= 0) est.cursor = i; }

  const ESPECIAL = { m: true, x: true }, IZQ = { arrowleft: true, a: true }, DER = { arrowright: true, d: true }, SUBE = { arrowup: true, w: true }, BAJA = { arrowdown: true, s: true };
  function teclaJuego(k, baja, ev) {
    if (k === ' ') ev.preventDefault();
    if (ESPECIAL[k] && baja) est.pulso = true;   // pulso: que una pulsación corta no se pierda entre dos pasos
    if (k === 'c' && baja && !ev.repeat) cambiaCamara();
    if ((k === 'escape' || k === 'p') && baja && !ev.repeat) pausar();
  }
  function teclaMenu(k, ev) {
    const Z = zonas(), n = Z.length;
    if (k === ' ' || k === 'enter') { ev.preventDefault(); pulsa(est.modo === 'hangar' && !est.ajustes && Z[est.cursor].id.startsWith('caza:') ? Z.find((z) => z.id === 'despegar') : Z[est.cursor]); return; }
    if (k === 'escape' || k === 'backspace') { volver(); return; }
    if (est.modo === 'hangar' && !est.ajustes && (IZQ[k] || DER[k])) { cambiaCaza(IZQ[k] ? -1 : 1); return; }
    const d = SUBE[k] || IZQ[k] ? -1 : BAJA[k] || DER[k] ? 1 : 0;
    if (d) { est.cursor = (est.cursor + d + n) % n; S.sonar('toque'); }
  }
  function tecla(ev, baja) {
    const k = ev.key.toLowerCase();
    teclas[k] = baja;
    if (baja) est.tactil = false;
    if (est.modo === 'juego') teclaJuego(k, baja, ev);
    else if (baja && !ev.repeat) teclaMenu(k, ev);
  }

  // La palanca hacia ti (abajo) sube el morro, como en un avión; con la opción «normal» del hangar, al revés.
  function orden() {
    const T = (a, b) => (teclas[a] || teclas[b] ? 1 : 0), invierte = est.sel.normal ? -1 : 1;
    const mx = joy.dx + T('arrowright', 'd') - T('arrowleft', 'a'), my = (joy.dy + T('arrowdown', 's') - T('arrowup', 'w')) * invierte;
    const B = UI.botones, especial = !!est.pulso;
    est.pulso = false;
    est.mando = { mx: Math.max(-1, Math.min(1, mx)), my: Math.max(-1, Math.min(1, my)), fuego: !!teclas[' '] || B.fuego.pulsado != null, especial,
      turbo: !!teclas.shift || B.turbo.pulsado != null, freno: !!teclas.q || B.freno.pulsado != null };   // la cabina la mira para mover la palanca
    return est.mando;
  }

  // ---------- misión ----------
  function empezar() {
    est.e = A.nuevaMision(A.AJ, { caza: est.sel.caza });
    Object.assign(est, { modo: 'juego', ajustes: false, cursor: 0, record: false, pulso: false, acum: 0, conTurbo: false });
    sueltaTodo();
    FX.limpiar(); VI.reiniciar();
    guardar(); S.sonar('toque');
    FX.cartel(tr('DESPEJA EL CIELO'), '#ffe14a', 2, tr('Derriba a la patrulla de Microblizz'));
  }

  function simular(dt) {
    const e = est.e;
    A.paso(e, dt, orden(), Math.random);
    for (const ev of e.eventos) { if (EFECTOS[ev.tipo]) EFECTOS[ev.tipo](ev); VI.evento(ev, est.t); }
    const conTurbo = e.fase === 'aire' && e.aire.jugador.conTurbo;
    if (conTurbo && !est.conTurbo) S.sonar('turbo');
    est.conTurbo = conTurbo;
    if (e.fin && e.finT > 1.4 && est.modo === 'juego') { est.modo = 'final'; est.cursor = 0; }
  }
  function avanzar(dt) {
    est.acum += dt;
    while (est.acum >= PASO) { simular(PASO); est.acum -= PASO; }
  }

  // El caza que vuela solo detrás de los menús.
  function exhibicion(dt) {
    const caza = A.AJ.cazas.find((c) => c.id === est.sel.caza);
    if (!est.exhib) { est.exhib = A.vuelo.nuevo(A.AJ, caza); VI.reiniciar(); }
    A.vuelo.paso(est.exhib, dt, { mx: 0, my: 0 }, A.AJ, caza);
    VI.dibujar({ j: est.exhib, cazaId: caza.id, aire: null, orbita: est.t * 0.35 + 2, dt, t: est.t, empuje: 0.4 });
  }
  function pintarMundo(dt) {
    if (est.modo === 'titulo' || est.modo === 'hangar' || est.modo === 'novedades') { exhibicion(dt); return; }
    const e = est.e, j = e.aire.jugador, P = e.aj.aire.vuelo;
    VI.dibujar({ j, cazaId: e.caza.id, aire: e.aire, orbita: est.modo === 'final' ? est.t * 0.3 : null, dt: est.modo === 'pausa' ? 0 : dt, t: est.modo === 'pausa' ? est.tPausa : est.t, empuje: Math.min(1.3, (j.vel - P.velMin) / (P.velMax - P.velMin)) });
  }
  function pintarMenu() { const Z = zonas(); UI.pantallas[pantalla()].pintar(G, est, Z, Math.min(est.cursor, Z.length - 1)); }
  function pintarHud() {
    const e = est.e;
    if (est.modo === 'juego' || est.modo === 'pausa') {
      A.cabina(G, e, VI.pesoCabina, UI.W, est.mando);
      if (est.t - est.flash < 0.18) { G.fillStyle = 'rgba(255,60,40,' + (0.45 * (1 - (est.t - est.flash) / 0.18)) + ')'; G.fillRect(0, 0, UI.W, 720); }
      if (est.modo === 'juego') UI.hud(G, e, VI.pesoCabina);
    }
    if (est.modo === 'juego') { FX.dibujarCarteles(G, UI.texto, UI.W / 2); UI.mandos(G, joy, est.tactil, e); }
    else pintarMenu();
    E.barrido(G, UI.W);
  }

  function fotograma(ahora) {
    const dt = Math.min(0.05, (ahora - (est.ultimo || ahora)) / 1000);
    est.ultimo = ahora; est.t += dt;
    ritmo.n++; ritmo.t += dt; if (ritmo.t >= 0.5) { est.ips = Math.round(ritmo.n / ritmo.t); ritmo.n = 0; ritmo.t = 0; }
    if (est.modo !== 'pausa') est.tPausa = est.t;
    G.setTransform(est.k, 0, 0, est.k, 0, 0);
    G.clearRect(0, 0, UI.W, 720);
    if (HORIZONTAL.deCanto()) { UI.girar(G, HORIZONTAL.lineas()); requestAnimationFrame(fotograma); return; }
    if (est.modo !== 'pausa') FX.paso(dt);
    if (est.modo === 'juego') avanzar(dt);
    pintarMundo(dt); pintarHud();
    requestAnimationFrame(fotograma);
  }

  async function arranca() {
    const carga = document.getElementById('carga');
    if (!A.gl.iniciar(document.getElementById('mundo'))) { carga.textContent = tr('Este navegador no tiene 3D (WebGL) activado.'); return; }
    await new Promise((r) => setTimeout(r, 30));   // que se vea «Cargando» antes de cortar los modelos
    const t0 = performance.now();
    A.modelos.crear(); A.mundo.crear();
    est.cargaMs = Math.round(performance.now() - t0);   // lo que tarda en cortar los modelos (se ve en el panel DEV y en las pruebas)
    leer(); ajusta(); S.cargar();
    est.tactil = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);   // móvil o PC: cambia solo al tocar o al usar el teclado
    try { await Promise.race([document.fonts.load("12px 'Press Start 2P'"), new Promise((r) => setTimeout(r, 2000))]); } catch (err) { console.warn('Wings: sin letra propia', err); }
    carga.hidden = true;
    addEventListener('pointerdown', giraConToque);   // en toda la ventana: con la pantalla de pie el lienzo puede no ocuparla entera
    CV.addEventListener('pointerdown', abajo); CV.addEventListener('pointermove', mueve);
    addEventListener('pointerup', arriba); addEventListener('pointercancel', arriba);
    addEventListener('keydown', (ev) => tecla(ev, true)); addEventListener('keyup', (ev) => tecla(ev, false));
    document.addEventListener('visibilitychange', () => { if (document.hidden) pausar(); });   // al salir de la pestaña, pausa
    addEventListener('blur', sueltaTodo);
    addEventListener('resize', ajusta); CV.addEventListener('contextmenu', (ev) => ev.preventDefault());
    requestAnimationFrame(fotograma);
  }
  arranca();
})(WINGS);
