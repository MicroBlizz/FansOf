// Fans Of · Gashapón animado (tras el flag 'gashapon-nuevo'): la revelación a pantalla completa (la cápsula sale de la máquina, vuela al centro, tiembla más
// cuanto mejor es y se abre con rayos) y el marco de las máquinas animadas. Cada máquina es un «estilo»: la clásica (gachapon-clasica.js) la usan todos los juegos;
// un juego puede añadir otro con GACHA_FX.estilo('nombre', {...}) y ponérselo a una máquina suya (MAQUINAS.x.estilo). Ver la clásica como ejemplo.
// gachapon.js la llama: GACHA_FX.on() dice si está abierta; GACHA_FX.maquina(cv, X, tab) dibuja la máquina; GACHA_FX.tirada(rarezas, X, mostrar) hace la animación
// y al abrirse la cápsula llama a mostrar() (la carta o la cuadrícula de siempre). Tocar la pantalla durante la animación la salta.
'use strict';
const GACHA_FX = (() => {
  const TAU = Math.PI * 2;
  const on = () => NUCLEO.flag('gashapon-nuevo', 'Máquina y animación nuevas del gashapón (bolas que se mueven, cápsula que tiembla y se abre)', false);
  // sonidos propios: la manivela, cada temblor (más agudo cuanto más cerca de abrirse), el suspense, la mejora sorpresa y la apertura
  Object.assign(SFX, {
    gcrank: () => { tone(540, 470, 0.05, 'square', 0.045); noise(0.04, 0.05, 2400, 'bandpass'); },
    gwobble: (k = 0) => { tone(260 + k * 120, 320 + k * 150, 0.16, 'triangle', 0.09); noise(0.07, 0.05, 1500, 'bandpass'); },
    gtension: () => { tone(180, 880, 0.55, 'sawtooth', 0.03); tone(90, 440, 0.55, 'sine', 0.06); },
    gupgrade: () => { tone(660, 1320, 0.22, 'square', 0.05); tone(990, 1980, 0.3, 'triangle', 0.08, 0.07); },
    gopen: (big = 0) => { noise(0.22 + big * 0.25, 0.16 + big * 0.1, 1700); tone(480, 1150 + big * 700, 0.22, 'triangle', 0.11); if (big) { tone(240, 120, 0.45, 'sine', 0.18); tone(1046, 1568, 0.4, 'triangle', 0.07, 0.12); } },
  });
  const BOLAS = ['#ff5fa8', '#ffe14d', '#7be04a', '#63cfe0', '#d08cff', '#ffb04f'], CONF = ['#ffcb3d', '#ff5fa8', '#7df3ff', '#7be04a', '#fff6ea'];
  const TIEMBLA = { basic: 1, common: 1, rare: 2, epic: 3, legendary: 3, mythic: 3 };
  const ease = t => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3)), easeIn = t => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * t);
  const easeIO = t => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = t => { t = Math.min(1, Math.max(0, t)) - 1; return t * t * (2.9 * t + 1.9) + 1; };
  const lerp = (a, b, k) => a + (b - a) * k, rnd = (a, b) => a + Math.random() * (b - a);
  const top = r => RAR_ORDER[r] <= 1;   // épica o mejor

  /* ---------- dibujo ---------- */
  function fs(c, path, fill, lw = 3) { c.beginPath(); path(c); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); } }
  const cir = (x, y, r) => c => c.arc(x, y, r, 0, TAU), rec = (x, y, w, h, r) => c => rrPath(c, x, y, w, h, r);
  function texto(c, s, x, y, size, fill, lw) { c.font = `${size}px ${FONT_D}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; s = tr(s); if (lw !== 0) { c.lineWidth = lw || Math.max(3, size / 3.2); c.strokeStyle = OL; c.strokeText(s, x, y); } c.fillStyle = fill; c.fillText(s, x, y); }
  // una cápsula: arriba de color, abajo blanca. abre (0-1) separa las mitades; grietas (0-1) le van saliendo antes de abrirse
  function capsula(c, x, y, r, col, rot = 0, abre = 0, alfa = 1, grietas = 0) {
    c.save(); c.globalAlpha = alfa; c.translate(x, y); c.rotate(rot); const d = abre * r * 1.7, lw = Math.max(1.6, r / 6);
    c.save(); c.translate(0, d); c.rotate(abre * 0.9); fs(c, c2 => { c2.arc(0, 0, r, 0, Math.PI); c2.closePath(); }, '#fff6ea', lw); c.restore();
    c.save(); c.translate(0, -d); c.rotate(-abre * 0.9); fs(c, c2 => { c2.arc(0, 0, r, Math.PI, TAU); c2.closePath(); }, col, lw);
    c.beginPath(); c.ellipse(-r * 0.36, -r * 0.48, r * 0.24, r * 0.15, -0.5, 0, TAU); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill(); c.restore();
    if (grietas > 0 && !abre) { c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = Math.max(1.2, r / 14); c.beginPath();
      const g = [[-0.2, -0.1, 0.05, -0.45, -0.1, -0.7], [0.3, 0.05, 0.5, -0.3, 0.42, -0.6], [-0.55, 0.08, -0.7, -0.2], [0.1, 0.1, 0.25, 0.45, 0.05, 0.7]];
      g.slice(0, Math.ceil(grietas * g.length)).forEach(p => { c.moveTo(p[0] * r, p[1] * r); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i] * r, p[i + 1] * r); }); c.stroke(); }
    c.restore();
  }
  function brillo(c, x, y, r, col, a) { if (a <= 0 || r <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = Math.min(1, a); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalAlpha = 1; }
  function rayos(c, x, y, col, a, n, len, giro) {
    c.save(); c.translate(x, y); c.rotate(performance.now() / 1000 * giro); c.globalAlpha = a; c.fillStyle = col;
    for (let i = 0; i < n; i++) { const an = i * TAU / n; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an - 0.09) * len, Math.sin(an - 0.09) * len); c.lineTo(Math.cos(an + 0.09) * len, Math.sin(an + 0.09) * len); c.closePath(); c.fill(); }
    c.restore(); c.globalAlpha = 1;
  }
  function chispas(arr, x, y, n, cols, v, tipo = 'punto') { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = rnd(v * 0.35, v); arr.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (tipo === 'confeti' ? 110 : 0), vida: rnd(0.6, 1.2), max: 1.2, col: cols[i % cols.length], s: rnd(2.5, 5.5), tipo, rot: rnd(0, 6), vr: rnd(-10, 10) }); } }
  function pinta(c, arr, dt) {
    for (const p of arr) {
      p.vida -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985;
      if (p.tipo === 'confeti') { p.vy += 380 * dt; p.rot += p.vr * dt; } else if (p.tipo === 'estrella') p.vy -= 20 * dt; else { p.vy += 120 * dt; p.vy *= 0.97; }
      c.globalAlpha = Math.max(0, Math.min(1, p.vida / p.max * 1.6));
      if (p.tipo === 'confeti') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.fillRect(-p.s, -p.s * 0.45, p.s * 2, p.s * 0.9); c.restore(); }
      else if (p.tipo === 'estrella') { c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? p.s * 0.35 : p.s; c.lineTo(Math.cos(i * TAU / 8) * r, Math.sin(i * TAU / 8) * r); } c.fill(); c.restore(); }
      else { c.beginPath(); c.arc(p.x, p.y, p.s, 0, TAU); c.fillStyle = p.col; c.fill(); }
    }
    c.globalAlpha = 1;
    return arr.filter(p => p.vida > 0);
  }

  /* ---------- las máquinas: cada estilo se dibuja en su propio espacio y se encoge a 300 × 350 (vista: escala y desplazamiento) ---------- */
  // Un estilo: { primera: 'fase inicial', vista: { es, dx, dy }, salida: [x, y] (por dónde sale la cápsula), inicia(), actualiza(dt, S), dibuja(c, X, tab, t, S), acaba(S) }.
  // S es la tirada en curso: S.f la fase, S.t el tiempo en ella (lo cuenta este archivo), S.aviso el color de las chispas de aviso (o null), S.col el color de la cápsula;
  // cuando la cápsula llega a la salida, el estilo pone S.f = 'fuera' y llama a S.llega(). acaba(S) deja la máquina como estaba (cuando se cierra el premio).
  const LW = 300, LH = 350, ESTILOS = {};
  const M = { st: null, ultimo: 0, parts: [] };
  const estiloDe = X => (X && X.estilo && ESTILOS[X.estilo]) || ESTILOS.clasica;
  function acabaTirada() { const S = M.st; if (!S) return; S.hecho = true; if (S.estilo.acaba) S.estilo.acaba(S); M.st = null; }
  function maquina(cv, X, tab) {
    const R2 = 2; if (cv.width !== LW * R2 || cv.height !== LH * R2) { cv.width = LW * R2; cv.height = LH * R2; }
    cv.classList.add('nueva');
    const E = estiloDe(X), c = cv.getContext('2d'), now = performance.now(), dt = Math.min(0.05, (now - (M.ultimo || now)) / 1000); M.ultimo = now;
    if (E.inicia) E.inicia();
    let S = M.st && M.st.estilo === E ? M.st : null;
    if (S) { S.t += dt; if (S.salta && S.f !== 'fuera') { S.f = 'fuera'; S.llega(); } }
    E.actualiza(dt, S && S.f !== 'fuera' ? S : null);
    if (S && S.f === 'fuera' && S.hecho) { acabaTirada(); S = null; }
    c.setTransform(R2, 0, 0, R2, 0, 0); c.clearRect(0, 0, LW, LH);
    const V = E.vista; c.setTransform(R2 * V.es, 0, 0, R2 * V.es, R2 * V.dx, R2 * V.dy); c.lineJoin = 'round'; c.lineCap = 'round';
    E.dibuja(c, X, tab, now / 1000, S);
    M.parts = pinta(c, M.parts, dt);
  }

  /* ---------- la revelación (una capa encima de la pantalla del gashapón) ---------- */
  const F = { cv: null, c: null, W: 0, H: 0, d: 1, raf: 0, rev: null, plan: null, parts: [], sacudida: 0, ultimo: 0, salta: false };
  function capa() {
    let cv = $('#gacha-fx'); if (cv) return cv;
    cv = document.createElement('canvas'); cv.id = 'gacha-fx'; cv.setAttribute('aria-hidden', 'true'); cv.hidden = true;
    cv.addEventListener('pointerdown', saltar); $('#scr-gacha').appendChild(cv); return cv;
  }
  function colocar() {   // la capa y la carta ocupan lo que se ve de la pantalla (que se puede deslizar)
    const scr = $('#scr-gacha'), cv = capa(), gr = $('#gacha-result'), d = Math.min(2, window.devicePixelRatio || 1);
    F.W = scr.clientWidth; F.H = scr.clientHeight; F.d = d; cv.style.top = scr.scrollTop + 'px'; cv.style.height = F.H + 'px'; cv.style.pointerEvents = 'auto';
    cv.width = Math.round(F.W * d); cv.height = Math.round(F.H * d); F.cv = cv; F.c = cv.getContext('2d'); cv.hidden = false;
    gr.style.top = scr.scrollTop + 'px'; gr.style.bottom = 'auto'; gr.style.height = F.H + 'px';
  }
  function saltar(e) { if (e) e.preventDefault(); if (!F.plan || F.plan.visto) return; F.salta = true; if (M.st) M.st.salta = true; }
  function tirada(rars, X, mostrar) {
    if (REDUCED) { setTimeout(mostrar, 250); return; }   // con «menos animaciones»: directo al premio
    if (F.raf) terminar(false);
    if (M.st) acabaTirada();
    const best = rars.reduce((a, r) => (RAR_ORDER[r] < RAR_ORDER[a] ? r : a)), cols = X ? X.colores : RARITY;
    // el aviso en la cúpula: casi siempre con legendaria (dorado) o épica (morado)… y alguna vez de farol
    const p = Math.random(), aviso = best === 'legendary' || best === 'mythic' ? (p < 0.75 ? '#ffcb3d' : p < 0.9 ? '#d08cff' : null) : best === 'epic' ? (p < 0.6 ? '#d08cff' : null) : p < 0.1 ? '#d08cff' : null;
    F.plan = { rars, best, cols, mostrar, visto: false, carta: -1 }; F.parts = []; F.rev = null; F.salta = false; F.sacudida = 0;
    colocar();
    const E = estiloDe(X); M.st = { estilo: E, f: E.primera, t: 0, clic: -1, aviso, col: BOLAS[Math.floor(rnd(0, 6))], llega: empieza };
    play('roll'); F.ultimo = performance.now(); F.raf = requestAnimationFrame(frame);
  }
  function empieza() {   // la bola sale de la trampilla de la máquina y empieza la revelación
    const P = F.plan, E = M.st ? M.st.estilo : estiloDe(null), V = E.vista, cvm = $('#gacha-cv'), r = cvm.getBoundingClientRect(), s = $('#scr-gacha').getBoundingClientRect(), k = r.width / LW || 1;
    const x0 = r.left - s.left + (V.dx + E.salida[0] * V.es) * k, y0 = r.top - s.top + (V.dy + E.salida[1] * V.es) * (r.height / LH || 1);
    F.rev = { t: 0, x0, y0, r0: 14 * V.es * k, col: M.st ? M.st.col : BOLAS[0], multi: P.rars.length > 1, sube: (P.best === 'legendary' || P.best === 'mythic') && Math.random() < 0.5 };
    if (F.salta) F.rev.t = 99;
  }
  function ensenar() {   // la carta (o la cuadrícula) de siempre, que entra con su animación
    const P = F.plan; if (P.visto) return; P.visto = true;
    const gr = $('#gacha-result'); gr.classList.add('fx'); P.mostrar();
    gr.querySelectorAll('.gt').forEach((b, i) => b.style.setProperty('--i', Math.min(i, 40)));
    const card = $('#gr-card'), s = $('#scr-gacha').getBoundingClientRect(); P.carta = card ? card.getBoundingClientRect().top - s.top : -1;
    if (F.cv) F.cv.style.pointerEvents = 'none';
  }
  function terminar(salida) {
    if (F.raf) cancelAnimationFrame(F.raf); F.raf = 0;
    if (F.plan && !F.plan.visto) ensenar();
    if (M.st) M.st.hecho = true;   // la máquina vuelve a su sitio en el siguiente dibujo (acaba del estilo)
    if (F.cv) F.cv.hidden = true;
    const gr = $('#gacha-result'); if (gr && (gr.hidden || salida)) { gr.classList.remove('fx'); gr.style.top = gr.style.bottom = gr.style.height = ''; }
    F.rev = null; F.plan = null; F.parts = [];
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - F.ultimo) / 1000); F.ultimo = now;
    const scr = $('#scr-gacha'); if (!scr || scr.hidden) { terminar(true); return; }
    const c = F.c; c.setTransform(F.d, 0, 0, F.d, 0, 0); c.clearRect(0, 0, F.W, F.H);
    if (F.sacudida > 0) { c.translate(rnd(-F.sacudida, F.sacudida), rnd(-F.sacudida, F.sacudida)); F.sacudida = Math.max(0, F.sacudida - dt * 40); }
    if (F.rev) (F.rev.multi ? varias : una)(c, dt);
    F.parts = pinta(c, F.parts, dt);
    if (F.plan.visto && $('#gacha-result').hidden) { terminar(false); return; }
    F.raf = requestAnimationFrame(frame);
  }
  const fondo = (c, a) => { c.fillStyle = `rgba(12,6,20,${a})`; c.fillRect(-30, -30, F.W + 60, F.H + 60); };
  function cartel(c, best, to) {   // «¡LEGENDARIA!» encima de la carta, si cabe
    const t = { legendary: '¡LEGENDARIA!', epic: '¡ÉPICA!', mythic: '¡MÍTICA!' }[best]; if (!t || F.plan.carta < 70 || to < 0.25) return;
    const k = back((to - 0.25) / 0.4); c.save(); c.translate(F.W / 2, F.plan.carta - 30); c.scale(k, k); c.rotate(-0.05); texto(c, t, 0, 0, Math.min(38, F.W / 10), best === 'epic' ? '#e9c4ff' : '#ffcb3d', 8); c.restore();
  }
  function abre(x, y, best, C1, C2) {
    const g = top(best), leg = best === 'legendary' || best === 'mythic';
    play('gopen', g ? 1 : 0); F.sacudida = leg ? 14 : g ? 9 : 4;
    chispas(F.parts, x, y, leg ? 70 : g ? 45 : best === 'rare' ? 28 : 16, [C1, '#fff6ea', C2], leg ? 420 : 300);
    if (g) chispas(F.parts, x, y - 20, leg ? 80 : 35, CONF, 340, 'confeti');
  }
  function una(c, dt) {
    const R = F.rev, P = F.plan, W = F.W, H = F.H, cx = W / 2, cy = H * 0.42, rf = Math.min(46, W * 0.12);
    R.t += dt; const t = R.t, C1 = P.cols[P.best][1], C2 = P.cols[P.best][2], leg = P.best === 'legendary' || P.best === 'mythic', g = top(P.best), nW = TIEMBLA[P.best] || 1;
    const tVuela = 0.45, tTiembla = tVuela + nW * 0.5 + (R.sube ? 0.6 : 0), tAbre = tTiembla + (g ? 0.4 : 0.05);
    if (F.salta && !R.abierta && t < tAbre) R.t = tAbre;
    fondo(c, Math.min(0.82, t * 2.2));
    if (t < tAbre) {
      const k = ease(t / tVuela), x = lerp(R.x0, cx, k), r = lerp(R.r0, rf, k); let y = lerp(R.y0, cy, k) - Math.sin(k * Math.PI) * 70;
      let rot = 0, bump = 0, gcol = 'rgba(255,255,255,.9)', ga = 0.3 * k, grietas = 0;
      if (t > tVuela) {
        const w = (t - tVuela) / 0.5, i = Math.floor(w), f = w - i, ultimo = i >= nW - 1;
        grietas = Math.min(1, (t - tVuela) / (nW * 0.5));
        if (i < nW) { rot = Math.sin(f * TAU * 2) * 0.3 * (1 - f) * (1 + i * 0.3); bump = Math.sin(f * Math.PI) * 0.1 * (1 + i * 0.3);
          if (!R['w' + i]) { R['w' + i] = 1; play('gwobble', i + (ultimo && g ? 2 : 0)); chispas(F.parts, x, y, 5 + i * 4, ['#fff6ea', ultimo ? C1 : '#fff6ea'], 150 + i * 40, 'estrella'); F.sacudida = Math.max(F.sacudida, 1.5 + i * 1.5); } }
        if (R.sube) {   // la legendaria disfrazada: brilla morada… y de golpe se vuelve dorada
          const tc = tVuela + nW * 0.5 + 0.3, ep = (P.cols.epic || RARITY.epic)[1];
          gcol = ultimo ? (t > tc ? C1 : ep) : gcol;
          if (t > tc && !R.subida) { R.subida = 1; play('gupgrade'); F.sacudida = 10; R.destello = 1; chispas(F.parts, x, y, 34, [C1, '#fff6ea'], 340, 'estrella'); }
          if (t > tVuela + nW * 0.5 && t < tTiembla) { rot = Math.sin(t * 40) * 0.08; }
        } else if (ultimo) gcol = C1;
        ga = ultimo ? 0.6 + 0.25 * Math.sin(t * 18) : 0.35 + i * 0.1;
        if (t > tTiembla) { y -= ease((t - tTiembla) / Math.max(0.01, tAbre - tTiembla)) * 16; ga = 0.95; if (!R.tension && g) { R.tension = 1; play('gtension'); } }
        if (g && (ultimo || leg)) rayos(c, cx, cy, gcol, Math.min(0.3, (t - tVuela) * 0.25), 14, Math.max(W, H), 0.25);
      }
      brillo(c, x, y, r * 3.4, gcol, ga);
      capsula(c, x, y, r * (1 + bump), R.col, rot, 0, 1, grietas);
      if (R.destello) { c.globalAlpha = R.destello; c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; R.destello = Math.max(0, R.destello - dt * 4); }
      if (t > 0.7) { c.globalAlpha = 0.55; texto(c, 'Toca para saltar', cx, H - 26, 13, '#fff6ea', 4); c.globalAlpha = 1; }
      return;
    }
    if (!R.abierta) { R.abierta = true; abre(cx, cy, P.best, C1, C2); }
    const to = t - tAbre;
    rayos(c, cx, cy, C1, leg ? 0.5 : g ? 0.4 : 0.22, leg ? 18 : 14, Math.max(W, H), leg ? 0.45 : 0.25);
    brillo(c, cx, cy, Math.min(W, H) * 0.55, C1, 0.55);
    if (to < 0.22) { c.globalAlpha = (1 - to / 0.22) * (leg ? 1 : 0.75); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    if (to < 0.6) capsula(c, cx, cy, rf, R.col, 0, ease(to / 0.35), 1 - to / 0.6);
    if (to > 0.1) ensenar();
    if (leg && Math.random() < 0.4) chispas(F.parts, rnd(0, W), -10, 1, CONF, 60, 'confeti');
    cartel(c, P.best, to);
  }
  function varias(c, dt) {
    const R = F.rev, P = F.plan, W = F.W, H = F.H, n = P.rars.length;
    if (!R.rejilla) {   // de la peor a la mejor: la mejor se abre la última
      const cols = n <= 10 ? 5 : 10, filas = Math.ceil(n / cols), cw = Math.min(n <= 10 ? 66 : 34, (W - 32) / cols), x0 = W / 2 - (cols - 1) * cw / 2, y0 = H * 0.42 - (filas - 1) * cw * 1.1 / 2;
      const orden = P.rars.slice().sort((a, b) => RAR_ORDER[b] - RAR_ORDER[a]);
      R.rejilla = orden.map((rar, k) => ({ rar, x: x0 + (k % cols) * cw, y: y0 + Math.floor(k / cols) * cw * 1.1, col: BOLAS[k % 6] }));
      R.r = cw * 0.34; R.paso = n <= 10 ? 0.14 : 0.035; R.vuelo = n <= 10 ? 0.05 : 0.018;
    }
    const mejor = R.rejilla[n - 1], suspense = top(mejor.rar) ? 1.0 : 0.25, tLlegan = 0.45 + n * R.vuelo, tFin = tLlegan + 0.15 + n * R.paso + suspense + 0.45;
    if (F.salta && !R.saltada) { R.saltada = true; R.t = Math.max(R.t, tFin - 0.3); }
    R.t += dt; const t = R.t;
    fondo(c, Math.min(0.82, t * 2.2));
    if (P.visto) { if (top(mejor.rar)) rayos(c, W / 2, H / 2, P.cols[mejor.rar][1], 0.3, 16, Math.max(W, H), 0.3); return; }
    for (let k = 0; k < n; k++) {
      const G = R.rejilla[k], kf = ease((t - k * R.vuelo) / 0.45); if (kf <= 0) continue;
      const x = lerp(R.x0, G.x, kf), y = lerp(R.y0, G.y, kf) - Math.sin(kf * Math.PI) * 50, C1 = P.cols[G.rar][1];
      const tAbre = tLlegan + 0.15 + k * R.paso + (k === n - 1 ? suspense : 0);
      if (t < tAbre) {
        let rot = 0;
        if (k === n - 1 && t > tAbre - suspense) { const f = (t - tAbre + suspense) / suspense; rot = Math.sin(t * 26) * 0.25 * f; brillo(c, x, y, R.r * 3.2, f > 0.6 ? C1 : 'rgba(255,255,255,.9)', 0.4 + f * 0.4); if (!R.ws && top(G.rar)) { R.ws = 1; play('gtension'); } }
        capsula(c, x, y, R.r, G.col, rot); continue;
      }
      if (!G.abierta) { G.abierta = 1; const gg = top(G.rar); chispas(F.parts, G.x, G.y, gg ? 30 : 8, [C1, '#fff6ea'], gg ? 280 : 140); play(gg ? 'gopen' : 'pop', gg ? 1 : 0); if (gg) { F.sacudida = 7; chispas(F.parts, G.x, G.y, 30, CONF, 300, 'confeti'); } }
      const kk = back((t - tAbre) / 0.3);
      brillo(c, G.x, G.y, R.r * 2.6, C1, top(G.rar) ? 0.75 : 0.4);
      fs(c, cir(G.x, G.y, Math.max(0.1, R.r * 0.9 * kk)), C1, 2.5);
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(G.x - R.r * 0.3, G.y - R.r * 0.35, R.r * 0.22 * kk, R.r * 0.14 * kk, -0.5, 0, TAU); c.fill();
      if (t - tAbre < 0.4) capsula(c, G.x, G.y, R.r, G.col, 0, ease((t - tAbre) / 0.3), 1 - (t - tAbre) / 0.4);
    }
    if (t > 0.7 && t < tFin) { c.globalAlpha = 0.55; texto(c, 'Toca para saltar', W / 2, H - 26, 13, '#fff6ea', 4); c.globalAlpha = 1; }
    if (t > tFin) ensenar();
  }
  // para los estilos: las ayudas de dibujo y las chispas de la máquina
  const util = { TAU, BOLAS, fs, cir, rec, texto, capsula, brillo, ease, easeIn, easeIO, back, lerp, rnd, chispas: (x, y, n, cols, v, tipo) => chispas(M.parts, x, y, n, cols, v, tipo) };
  return { on, maquina, tirada, estilo: (nombre, e) => { ESTILOS[nombre] = e; }, util };
})();
