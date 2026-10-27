// Fans of Rouflage · LA MÚSICA DE LA INTRO (pantalla de carga): hecha con código como el resto de canciones del juego (sin archivos de sonido)
// y clavada a lo que pasa en la escena (los tiempos de las animaciones de #carga en index.html). Se carga antes que nada del juego, así que
// lleva su propio sintetizador mínimo: punteo, campanita, bajo, platillos, silbato y «boing».
//   0,5 s «FANS OF» cae (silbido) · ~1,25 s aterriza (boing) · 1,5–1,92 s cada letra de ROUFLAGE estalla (una campanita por letra, escala arriba)
//   Cada ciclo de 7 s: 0–2 s escondido (tic-tac de puntillas) · 2,0 s entra el becario (melodía de puntillas, una nota por paso) · 3,1 s se para (silencio)
//   3,3 s «!» (golpe y silbato que sube) · 3,5–4,8 s persecución (galope y arpegios) · 4,8 s se van (zas) · 5–7 s calma con campanitas · 6,45 s «plop» (se esconde)
// INTRO_MUSICA.empieza() intenta sonar al abrir (en la app de Android se permite; en el navegador del móvil no hasta tocar) y INTRO_MUSICA.para()
// la apaga con un fundido al tocar para jugar (entonces entra la música del juego). Respeta el volumen guardado de las opciones.
'use strict';
const INTRO_MUSICA = (() => {
  const CICLO = 7;
  const nota = n => 440 * Math.pow(2, (n - 69) / 12);      // número MIDI → hercios
  let ctx = null, sal = null, activa = false, parada = false, visto = 0;
  const T0 = performance.now();
  // la ventana (en el reloj del audio) de lo que se programa en esta vuelta: lo de fuera no se crea (así se programa poco a poco, a la par de la escena)
  const VEN = { a: -Infinity, b: Infinity };
  const fuera = t => t < 0 || t < VEN.a || t >= VEN.b || (VEN.a > -Infinity && t < ctx.currentTime - 0.12);      // (lo que ya pasó hace rato tampoco: sonaría todo de golpe)
  // el volumen de las opciones del juego (rouflage-vol × rouflage-vol-musica); por defecto 1 × 0,5
  function volumen() {
    try {
      const v = localStorage.getItem('rouflage-vol'), m = localStorage.getItem('rouflage-vol-musica');
      const vol = v === null ? (localStorage.getItem('rouflage-mudo') === '1' ? 0 : 1) : Math.min(1, Math.max(0, +v));
      const mus = m === null ? (localStorage.getItem('rouflage-sin-musica') === '1' ? 0 : 0.5) : Math.min(1, Math.max(0, +m));
      return vol * mus;
    } catch (_) { return 0.5; }
  }
  // ---------- los instrumentos ----------
  function env(t, ata, cae, vol) { const g = ctx.createGain(); if (fuera(t)) return g; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + ata); g.gain.exponentialRampToValueAtTime(0.0001, t + ata + cae); g.connect(sal); return g; }
  function osc(tipo, f, t, dura, destino) { const o = ctx.createOscillator(); if (fuera(t)) return o; o.type = tipo; o.frequency.setValueAtTime(f, t); o.connect(destino); o.start(t); o.stop(t + dura + 0.05); return o; }
  const punteo = (t, n, vol = 0.18, cae = 0.16) => osc('triangle', nota(n), t, cae + 0.01, env(t, 0.004, cae, vol));
  function campana(t, n, vol = 0.14, cae = 0.9) {      // como la «bell» del motor de la serie: seno con un armónico metálico que se apaga antes
    osc('sine', nota(n), t, cae, env(t, 0.003, cae, vol));
    osc('sine', nota(n) * 2.76, t, cae * 0.35, env(t, 0.002, cae * 0.35, vol * 0.25));
  }
  function bajo(t, n, vol = 0.3, cae = 0.18, tipo = 'triangle') {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; f.connect(env(t, 0.005, cae, vol));
    osc(tipo, nota(n), t, cae, f);
  }
  let _ruido = null;
  function ruido(t, dura, tipo, frec, vol, q = 1) {
    if (!_ruido) { const n = ctx.sampleRate; _ruido = ctx.createBuffer(1, n, n); const d = _ruido.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    const f0 = ctx.createBiquadFilter(); if (fuera(t)) return f0;
    const s = ctx.createBufferSource(); s.buffer = _ruido; const f = f0; f.type = tipo; f.frequency.value = frec; f.Q.value = q;
    s.connect(f); f.connect(env(t, 0.002, dura, vol)); s.start(t); s.stop(t + dura + 0.05); return f;
  }
  const platillo = (t, vol = 0.05) => ruido(t, 0.04, 'highpass', 7000, vol);
  const caja = (t, vol = 0.12) => ruido(t, 0.09, 'bandpass', 1800, vol, 0.8);
  function bombo(t, vol = 0.35) { const g = env(t, 0.003, 0.16, vol), o = osc('sine', 120, t, 0.18, g); o.frequency.exponentialRampToValueAtTime(42, t + 0.15); }
  function silbato(t, dura, f0, f1, vol = 0.09) {      // silbato de dibujos animados, con un poco de vibrato
    if (fuera(t)) return;
    const g = env(t, 0.02, dura, vol), o = osc('sine', f0, t, dura, g), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.frequency.exponentialRampToValueAtTime(f1, t + dura); lfo.frequency.value = 9; lg.gain.value = f0 * 0.03; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dura + 0.05);
  }
  function boing(t) { const g = env(t, 0.004, 0.45, 0.16), o = osc('triangle', 180, t, 0.45, g); o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.06); o.frequency.exponentialRampToValueAtTime(140, t + 0.4); }
  function golpe(t) {      // el susto: acorde corto de cuadrada brillante + platillo abierto
    for (const n of [69, 72, 76, 81]) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.3); f.connect(env(t, 0.004, 0.32, 0.06)); osc('square', nota(n), t, 0.32, f); }
    ruido(t, 0.5, 'highpass', 5000, 0.08); bombo(t, 0.4);
  }
  // ---------- la partitura ----------
  // una vez: la caída de «FANS OF» y las letras
  function letras(t0) {
    silbato(t0 + 0.5, 0.7, 1500, 320, 0.07);
    boing(t0 + 1.22); bombo(t0 + 1.22, 0.3);
    [69, 71, 72, 74, 76, 77, 79, 81].forEach((n, i) => { const t = t0 + 1.5 + i * 0.06; campana(t, n + 12, 0.11, 0.5); ruido(t, 0.03, 'bandpass', 3000, 0.04); });
    campana(t0 + 2.0, 81, 0.1, 1.2); campana(t0 + 2.0, 88, 0.06, 1.2);
  }
  // cada ciclo de 7 s
  function ciclo(t0, n) {
    // 0–2 s: escondido. Tic-tac de puntillas (en el primer ciclo, más suave: mandan las letras)
    const suave = n === 0 ? 0.5 : 1;
    for (let k = 0; k < 4; k++) { bajo(t0 + k * 0.5, k % 2 ? 40 : 45, 0.22 * suave, 0.12); platillo(t0 + k * 0.5 + 0.25, 0.03 * suave); }
    // 2,0–3,1 s: el becario busca. Melodía de puntillas con swing, cromática, en la menor
    const pasos = [[2.0, 64], [2.2, 65], [2.4, 64], [2.6, 63], [2.8, 64], [3.0, 60]];
    for (const [t, m] of pasos) { punteo(t0 + t, m, 0.2, 0.14); punteo(t0 + t, m - 12, 0.08, 0.1); }
    for (const t of [2.0, 2.4, 2.8]) bajo(t0 + t, 45, 0.26, 0.12);
    for (const t of [2.2, 2.6, 3.0]) bajo(t0 + t, 52, 0.2, 0.1);
    // 3,1 s: se para. Silencio, solo un latido; 3,3 s: «!»
    bombo(t0 + 3.15, 0.18);
    golpe(t0 + 3.3); silbato(t0 + 3.32, 0.18, 500, 1700, 0.08);
    // 3,5–4,8 s: la persecución, a toda prisa (semicorcheas de 0,1 s)
    const arp = [69, 72, 76, 72, 69, 72, 76, 79, 81, 79, 76, 72, 69, 72, 76];
    for (let k = 0; k < 13; k++) {
      const t = t0 + 3.5 + k * 0.1;
      bajo(t, k % 4 === 2 ? 57 : 45, 0.24, 0.08, 'square');
      punteo(t, arp[k % arp.length] + 12, 0.07, 0.08);
      if (k % 2 === 0) platillo(t, 0.04);
      if (k % 4 === 0) bombo(t, 0.28); if (k % 4 === 2) caja(t, 0.1);
    }
    [84, 83, 81, 79, 77, 76, 74, 72].forEach((m, i) => campana(t0 + 4.4 + i * 0.05, m, 0.07, 0.25));
    // 4,8 s: se van (zas)
    silbato(t0 + 4.8, 0.25, 1400, 260, 0.06); ruido(t0 + 4.8, 0.2, 'bandpass', 1200, 0.05, 0.6);
    // 5–7 s: calma, campanitas con swing (como el tema del título)
    [[5.1, 72], [5.4, 76], [5.7, 79], [6.0, 77], [6.6, 76], [6.85, 74]].forEach(([t, m]) => campana(t0 + t, m, 0.1, 0.8));
    for (const t of [5.1, 5.7, 6.3]) bajo(t0 + t, 48, 0.16, 0.3, 'sine');
    // 6,45 s: el colado vuelve a su sitio: «plop»
    const g = env(t0 + 6.45, 0.004, 0.14, 0.14), o = osc('sine', 900, t0 + 6.45, 0.15, g); o.frequency.exponentialRampToValueAtTime(260, t0 + 6.58);
  }
  // el reloj de la escena: el tiempo que lleva en marcha la animación del colado (empieza con la pantalla y nunca para); si no se puede leer, desde que cargó esto
  function tiempoIntro() {
    try { const el = document.querySelector('#carga .cg-oculto'), an = el && el.getAnimations && el.getAnimations()[0]; if (an && an.currentTime != null) return an.currentTime / 1000; } catch (_) { /* sin animaciones */ }
    return (performance.now() - T0) / 1000;
  }
  // cada 0,2 s programa lo que toca en los próximos 0,6 s de la escena, contado con el reloj de la animación: si el móvil va justo o Android
  // pausa el audio un momento, la música sigue a la par de lo que se ve (lo que se perdió no suena tarde: se salta)
  function tic() {
    if (!activa) return;
    if (ctx.state !== 'running') { ctx.resume().catch(() => {}); setTimeout(tic, 200); return; }
    try { programa(); } catch (_) { /* un fallo de audio no debe parar la música ni el juego */ }
    setTimeout(tic, 200);
  }
  function programa() {
    const V = tiempoIntro(), hasta = V + 0.6, desde = Math.max(visto, V - 0.1), base = ctx.currentTime - V;      // base: el segundo 0 de la escena en el reloj del audio
    if (hasta > desde) {
      VEN.a = base + desde; VEN.b = base + hasta;
      if (desde < 2.6) letras(base);
      for (let k = Math.max(0, Math.floor(desde / CICLO)); k * CICLO < hasta; k++) ciclo(base + k * CICLO, k);
      visto = hasta;
    }
  }
  return {
    CICLO,
    // para grabarla sin tiempo real (OfflineAudioContext): las letras y n ciclos seguidos desde el segundo 0
    partitura(c, destino, n) { ctx = c; sal = destino; VEN.a = -Infinity; VEN.b = Infinity; letras(0); for (let k = 0; k < n; k++) ciclo(k * CICLO, k); },
    // en la página: intenta sonar ya (va siempre a la par de la escena: lee el reloj de sus animaciones)
    empieza() {
      const v = volumen(); if (v <= 0 || activa || parada) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        const c = new AC(), m = c.createGain(), comp = c.createDynamicsCompressor();
        m.gain.value = Math.min(1, v * 1.6); comp.connect(m); m.connect(c.destination);
        const va = () => { if (parada || c.state !== 'running') { try { c.close(); } catch (_) { /* nada */ } return; } INTRO_MUSICA._m = m; INTRO_MUSICA._c = c; ctx = c; sal = comp; activa = true; tic(); };
        if (c.state === 'running') va(); else c.resume().then(va, () => c.close());
        setTimeout(() => { if (c.state !== 'running' && !activa) try { c.close(); } catch (_) { /* nada */ } }, 600);
      } catch (_) { /* sin sonido */ }
    },
    para() {
      parada = true; activa = false; const c = INTRO_MUSICA._c, m = INTRO_MUSICA._m; if (!c || !m) return;
      try { m.gain.setTargetAtTime(0.0001, c.currentTime, 0.12); setTimeout(() => { try { c.close(); } catch (_) { /* nada */ } }, 900); } catch (_) { /* nada */ }
    },
  };
})();
