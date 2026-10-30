// Fans of Rouflage · EL MICROBLIZZ ROASTER, el coche del jefe, aparcado en su plaza del parking: un superdeportivo blanco en cuña, muy bajo, con el techo
// de cristal negro, faros finos, llantas oscuras, alerón y la matrícula «JEFE 1» (una parodia nuestra: sin marcas de verdad). Es un mueble como los demás
// coches (choca y tapa la vista) y lleva el EVENTO «turbo»: cada 12-20 s (sacado de la semilla) avisa 1,2 s antes (faros que parpadean, ronroneo,
// flechas en el suelo) y suelta chorros de aire por los escapes o por las rejillas de los lados que EMPUJAN a quien anda cerca (con choques: nunca
// dentro de una pared ni fuera del mapa). A un colado congelado solo le hace temblar. El horario va con el reloj de la caza (J.reloj, que en el PvP
// manda el anfitrión): en todos los navegadores sopla a la vez; cada uno empuja a lo suyo (eventoLeToca: su personaje y, el anfitrión, la máquina).
'use strict';

/* ---------- el coche ---------- */
const ROASTER = { w: 54, d: 78, aviso: 1.2, sopla: 1.3, fuerza: 470, freno: 4.4, largo: 175, lado: 150, salto: 2.6, alto: 48 };
// muy de vez en cuando (1 de cada ~12 ráfagas) el coche SALTA: los chorros de abajo lo levantan, se queda un instante en el aire y baja frenando con
// chorros hasta caer en su plaza. Los chorros del despegue y del aterrizaje empujan como los demás.
const altoRoaster = t => t < 0.5 ? ROASTER.alto * Math.sin(t / 0.5 * Math.PI / 2) : t < 1.3 ? ROASTER.alto + Math.sin((t - 0.5) * 9) * 2.5 : ROASTER.alto * (1 - (u => u * u * (3 - 2 * u))(Math.min(1, (t - 1.3) / (ROASTER.salto - 1.3))));
const soplaRoaster = p => p.tipo === 'salto' ? ROASTER.salto : ROASTER.sopla;
const chorroSalto = (p, t) => p.tipo !== 'salto' || t < 0.55 || t > 1.75;      // en el salto, soplan al despegar y al frenar la caída

Object.assign(TIPOS_MUEBLE, {
  // visto desde arriba con el morro hacia arriba; ocupa 54 × 78 (una plaza grande)
  roaster: { w: ROASTER.w, d: ROASTER.d, h: 10, pinta(c) {
    const B = '#f6f2ea', S = '#d8d2c8', N = '#1b1526', G = '#2c2538';
    forma(c, c2 => poli(-12, -80, 12, -80, 25, -66, 27, -32, 27, -4, 20, 3, -20, 3, -27, -4, -27, -32, -25, -66)(c2), 'rgba(24,12,40,0.3)', 0);      // la sombra
    // las ruedas: anchas, oscuras, con la llanta de radios asomando
    for (const [x, y, h] of [[-25, -62, 15], [25, -62, 15], [-26, -22, 18], [26, -22, 18]]) {
      forma(c, caja(x - 4.5, y - h / 2, 9, h, 3), OL, 0);
      forma(c, caja(x - 2.5, y - h / 2 + 2.5, 5, h - 5, 1.5), '#4a4458', 1.2);
      raya(c, [x, y - h / 2 + 3, x, y + h / 2 - 3], '#7a7388', 1.2);
    }
    // la carrocería: una cuña de aristas rectas, estrecha en el morro y ancha en las aletas de atrás
    const cuerpo = poli(-9, -82, 9, -82, 20, -73, 23, -60, 20, -48, 25, -38, 26, -10, 22, -1, -22, -1, -26, -10, -25, -38, -20, -48, -23, -60, -20, -73);
    forma(c, cuerpo, B, 3);
    c.save(); c.beginPath(); cuerpo(c); c.clip();
    c.fillStyle = S; c.beginPath(); c.moveTo(8, -82); c.lineTo(30, -82); c.lineTo(30, 4); c.lineTo(14, 4); c.lineTo(17, -40); c.closePath(); c.fill();      // el lado en sombra
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.moveTo(-17, -71); c.lineTo(-11, -79); c.lineTo(-9, -79); c.lineTo(-15, -66); c.closePath(); c.fill();   // brillo del morro
    c.restore();
    // las aristas: del morro a las aletas y la del capó, finas, como chapa doblada
    raya(c, [-9, -81, -14, -56, -20, -48], 'rgba(32,16,44,0.4)', 1.4); raya(c, [9, -81, 14, -56, 20, -48], 'rgba(32,16,44,0.4)', 1.4);
    raya(c, [0, -80, 0, -60], 'rgba(32,16,44,0.28)', 1.2);
    // las tomas del capó: dos rajas oscuras en flecha
    forma(c, poli(-10, -66, -3, -70, -3, -67, -9, -63), N, 1.4); forma(c, poli(10, -66, 3, -70, 3, -67, 9, -63), N, 1.4);
    // los faros: dos rayas finas y afiladas, y la boca del morro
    forma(c, poli(-19, -72, -9, -80, -7, -79, -17, -69), '#fff6ea', 1.6); forma(c, poli(19, -72, 9, -80, 7, -79, 17, -69), '#fff6ea', 1.6);
    forma(c, poli(-6, -81.5, 6, -81.5, 4, -79, -4, -79), N, 1.2);
    // los retrovisores, pequeños y en punta
    forma(c, poli(-20, -52, -27, -50, -26, -47, -20, -48), B, 2); forma(c, poli(20, -52, 27, -50, 26, -47, 20, -48), S, 2);
    // el techo: una burbuja de cristal negro, con su arista y sus reflejos
    const techo = poli(-11, -56, 11, -56, 16, -46, 16, -26, 12, -16, -12, -16, -16, -26, -16, -46);
    forma(c, techo, N, 3);
    c.save(); c.beginPath(); techo(c); c.clip();
    c.fillStyle = G; c.fillRect(-17, -57, 13, 42);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(-9, -55); c.lineTo(-3, -55); c.lineTo(-13, -33); c.lineTo(-16, -33); c.lineTo(-16, -40); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(1, -55); c.lineTo(4, -55); c.lineTo(-8, -24); c.lineTo(-11, -24); c.closePath(); c.fill();
    c.fillStyle = 'rgba(159,214,232,0.35)'; c.beginPath(); c.moveTo(8, -26); c.lineTo(16, -42); c.lineTo(16, -30); c.lineTo(12, -22); c.closePath(); c.fill();
    c.restore();
    raya(c, [-11, -46, 11, -46], 'rgba(255,255,255,0.18)', 1.2);      // la junta del parabrisas
    // las rejillas de los lados (de ahí salen los chorros): triángulos oscuros con lamas
    for (const s of [-1, 1]) {
      forma(c, poli(s * 18, -44, s * 25, -37, s * 25, -24, s * 18, -30), N, 1.8);
      for (const y of [-36, -31.5, -27]) raya(c, [s * 19.5, y - 1.5, s * 23.5, y + 1], '#6d6680', 1.2);
    }
    // la tapa del motor con sus lamas, detrás del techo
    forma(c, poli(-12, -15, 12, -15, 15, -6, -15, -6), S, 2);
    for (const y of [-12.5, -9.5]) raya(c, [-10, y, 10, y], 'rgba(32,16,44,0.55)', 1.6);
    // el alerón negro de punta a punta, con sus aletas
    forma(c, caja(-25, -6, 50, 5, 1.5), G, 2.2); forma(c, caja(-25, -8, 4, 9, 1), G, 1.8); forma(c, caja(21, -8, 4, 9, 1), G, 1.8);
    raya(c, [-21, -4, 21, -4], 'rgba(255,255,255,0.22)', 1);
    // pilotos traseros: dos rayas rojas finas
    forma(c, poli(-22, -1, -11, -1, -12, 1.5, -21, 1.5), '#ff4b5c', 1.4); forma(c, poli(22, -1, 11, -1, 12, 1.5, 21, 1.5), '#ff4b5c', 1.4);
    // la matrícula y los cuatro escapes
    for (const x of [-19.5, -15, 15, 19.5]) { forma(c, ovalo(x, 4.2, 2.3, 2.1), '#b8bcc6', 1.3); forma(c, ovalo(x, 4.4, 1.3, 1.1), OL, 0); }
    forma(c, caja(-11, 0, 22, 7.5, 1.5), '#fff6ea', 1.6); c.fillStyle = '#3a7de0'; c.fillRect(-10.2, 0.8, 2.6, 5.9);
    const mat = tr('JEFE 1'); c.font = '800 6px ' + LETRA_UI; const ancho = c.measureText(mat).width;
    rotulo(c, mat, 1.3, 4, 6 * Math.min(1, 16 / ancho), OL, null, LETRA_UI);
  } },
});

Object.assign(PEGATINAS_EXTRA, {
  // la plaza del jefe: más ancha, con las rayas amarillas y «SOLO JEFE» pintado delante
  plazaJefe(c, x, y) {
    c.strokeStyle = 'rgba(242,194,48,0.85)'; c.lineWidth = 3.5; c.beginPath();
    c.moveTo(x - 40, y - 96); c.lineTo(x - 40, y + 6); c.moveTo(x + 40, y - 96); c.lineTo(x + 40, y + 6); c.stroke();
    c.save(); c.globalAlpha = 0.75; rotulo(c, tr('SOLO JEFE'), x, y - 112, 15, '#f2c230'); c.restore();
  },
});

/* ---------- el sonido ---------- */
Object.assign(SFX, {
  // el aviso: el motor ronronea y dos pitidos cortos (el cierre centralizado)
  turboAviso: (v = 1, out = master) => { tonoEn(out, 52, 78, 1.1, 'sawtooth', 0.07 * v); tonoEn(out, 104, 150, 1.1, 'square', 0.018 * v); tonoEn(out, 1320, 1320, 0.08, 'square', 0.05 * v, 0.08); tonoEn(out, 1320, 1320, 0.08, 'square', 0.05 * v, 0.3); },
  // el chorro: ¡FIUUU! (aire que silba y baja)
  turboSopla: (v = 1, out = master) => { ruidoEn(out, 1.1, 0.2 * v, 2200, 'bandpass'); ruidoEn(out, 0.5, 0.1 * v, 5200, 'highpass'); tonoEn(out, 1500, 420, 0.6, 'sine', 0.05 * v); agachaMusica(0.7); },
});
Object.assign(THROTTLE, { turboAviso: 400, turboSopla: 400 });

/* ---------- el evento ---------- */
// por dónde sopla cada chorro, en el mundo: el origen, la dirección (dx, dy) y lo largo que llega
function chorrosRoaster(m, tipo) {
  if (tipo === 'salto') tipo = 'todo';
  const atras = { x: m.x, y: m.y + 6, dx: 0, dy: 1, largo: ROASTER.largo, ancho: 22 };
  const lados = [-1, 1].map(s => ({ x: m.x + s * 29, y: m.y - 30, dx: s, dy: 0, largo: ROASTER.lado, ancho: 22 }));
  return tipo === 'atras' ? [atras] : tipo === 'lados' ? lados : [atras, ...lados];
}
// ¿le pilla el chorro a alguien con los pies en (x, y)? Devuelve lo metido que está (0 = en la boca, 1 = al final) o -1
function enChorro(ch, x, y) {
  const px = x - ch.x, py = (y - 18) - ch.y;      // el cuerpo, no solo los pies
  const a = px * ch.dx + py * ch.dy, b = Math.abs(px * ch.dy - py * ch.dx);
  if (a < -8 || a > ch.largo) return -1;
  if (b > ch.ancho + 16 + Math.max(0, a) * 0.22) return -1;
  return Math.max(0, a) / ch.largo;
}
EVENTOS.turbo = {
  primero: 0, cada: 0, dura: 1e9,      // vigila toda la caza; el horario lo lleva él con el reloj de la caza
  nuevo(cfg, azar) {
    const m = MUEBLES.find(q => q.t === 'roaster'), plan = [];
    const az = azarDe((azar() * 2147483647) | 0);
    // el horario, en segundos que le quedan al reloj de la caza, de 900 hacia abajo: así vale para cualquier duración y al volver a una partida
    for (let r = 900 - 6; r > 1; r -= 12 + az() * 8) { const k = az(); plan.push({ r: Math.round(r * 10) / 10, tipo: k < 0.08 ? 'salto' : k < 0.42 ? 'atras' : k < 0.76 ? 'lados' : 'todo' }); }
    return { m, plan, top: 0, act: null, fase: '', empujes: new Map(), parts: [], primera: true };
  },
  empieza() {},
  // la ráfaga que toca ahora mismo según el reloj (o null): aviso los 1,2 s de antes y luego sopla
  ahora(est) {
    const r = J.reloj;
    for (const p of est.plan) {
      if (p.r + ROASTER.aviso > est.top - 5) continue;      // ninguna en los primeros segundos de la caza
      if (r <= p.r + ROASTER.aviso && r > p.r - soplaRoaster(p)) return { p, fase: r > p.r ? 'aviso' : 'sopla', t: r > p.r ? p.r + ROASTER.aviso - r : p.r - r };
      if (p.r + ROASTER.aviso < r) break;
    }
    return null;
  },
  avanza(est, dt) {
    if (!est.m) return;
    est.top = Math.max(est.top, J.reloj);
    const a = this.ahora(est), m = est.m, antes = est.fase;
    est.act = a; est.fase = a ? a.fase + a.p.r : '';
    if (a && est.fase !== antes) {
      if (a.fase === 'aviso') {
        suenaEn('turboAviso', m.x, m.y - 40);
        if (J.yo && lejos(J.yo.x, J.yo.y, m.x, m.y) < 520) tutoDi('mapa-turbo');
      } else {
        suenaEn('turboSopla', m.x, m.y - 40);
        const ch = chorrosRoaster(m, a.p.tipo)[0];
        if (volumenEn(m.x, m.y) > 0.05) fxTexto(ch.x + ch.dx * 62 + ch.dy * 64, ch.y + ch.dy * 50 - 36, tr('¡FIUUU!'), '#bff3ff', 20);
      }
    }
    // los chorros: empujan a quien pillan (solo a lo que lleva este navegador) y echan aire, vaho y papelitos
    if (m) m.vuela = !!(a && a.fase === 'sopla' && a.p.tipo === 'salto' && altoRoaster(a.t) > 0.5);      // en el aire: dibujo.js no pinta el de la plaza
    if (a && a.fase === 'sopla' && a.p.tipo === 'salto' && est.fase !== antes) { fxTexto(m.x, m.y - 110, tr('¡AL AIRE!'), '#ffcb3d', 22); if (J.yo && lejos(J.yo.x, J.yo.y, m.x, m.y) < 650) misionEvento('coche'); }      // logro secreto (misiones.js)
    if (a && a.fase === 'sopla' && a.p.tipo === 'salto' && a.t > ROASTER.salto - 0.12 && !est.aterriza) { est.aterriza = true; suenaEn('turboSopla', m.x, m.y - 40); if (J.yo && lejos(J.yo.x, J.yo.y, m.x, m.y) < 360) CAM.tiembla = Math.max(CAM.tiembla, 0.25); for (let k = 0; k < 14; k++) { const ang = k / 14 * TAU; est.parts.push({ k: 'vaho', x: m.x + Math.cos(ang) * 30, y: m.y - 38 + Math.sin(ang) * 40, vx: Math.cos(ang) * 120, vy: Math.sin(ang) * 90, t: 0, dur: 0.7, r: 6 }); } }
    if (!(a && a.p.tipo === 'salto')) est.aterriza = false;
    if (a && a.fase === 'sopla' && chorroSalto(a.p, a.t)) {
      const chs = chorrosRoaster(m, a.p.tipo), q = [1, 0.6, 0.3][graficosAdornos()] || 0.3;
      for (const ch of chs) {
        for (const e of J.entes) {
          if (!eventoLeToca(e)) continue;
          const d = enChorro(ch, e.x, e.y); if (d < 0 || !seVen(ch.x, ch.y, e.x, e.y - 10)) continue;
          if (e.congelado || (e === J.yo && TALLER.abierto)) { if (e === J.yo) e.tiembla = Math.max(e.tiembla, 0.3); continue; }      // congelado: solo tiembla (no rompe su escondite)
          this.empuja(est, e, ch, d);
        }
        for (const k of MASC.lista) { const d = enChorro(ch, k.x, k.y); if (d >= 0) this.empuja(est, k, ch, d); }      // las mascotas, cada pantalla las suyas
        // las partículas (solo se ven: cada navegador las suyas)
        for (let n = 0; n < 2; n++) if (est.parts.length < 150 && Math.random() < dt * 32 * q) {
          const k = Math.random(), lado = (Math.random() - 0.5) * ch.ancho * 1.4, v = rand(380, 560);
          const p = { x: ch.x + ch.dy * lado, y: ch.y - 8 + ch.dx * lado * 0.6, vx: ch.dx * v + ch.dy * rand(-60, 60), vy: ch.dy * v + ch.dx * rand(-40, 40), t: 0 };
          if (k < 0.5) Object.assign(p, { k: 'raya', dur: rand(0.3, 0.5) });
          else if (k < 0.72) Object.assign(p, { k: 'vaho', dur: rand(0.45, 0.7), r: rand(4, 7) });
          else Object.assign(p, { k: 'papel', dur: rand(0.7, 1.1), rot: rand(0, TAU), vr: rand(-14, 14), col: pick(['#fff6ea', '#fff6ea', '#f2c230', '#c98a3b', '#9fd6e8']),
            x: ch.x + ch.dx * rand(10, 90) + ch.dy * lado, y: ch.y + ch.dy * rand(10, 90) + ch.dx * lado * 0.6, vx: p.vx * 0.8, vy: p.vy * 0.8 - 40 });
          est.parts.push(p);
        }
      }
    } else if (a && a.fase === 'aviso' && Math.random() < dt * 14) {      // el aviso: un poco de vaho que se escapa por donde va a soplar
      for (const ch of chorrosRoaster(m, a.p.tipo)) est.parts.push({ k: 'vaho', x: ch.x + rand(-6, 6), y: ch.y - 8 + rand(-6, 6), vx: ch.dx * rand(30, 70), vy: ch.dy * rand(30, 70) - 10, t: 0, dur: rand(0.5, 0.8), r: rand(3, 5) });
    }
    // los empujones siguen un ratito después de salir del chorro (frenando), con los choques de siempre
    for (const [e, v] of est.empujes) {
      v.t += dt; const f = Math.exp(-ROASTER.freno * v.t), dx = v.vx * f * dt, dy = v.vy * f * dt;
      if (e.fuera || e.congelado || f < 0.05) { est.empujes.delete(e); continue; }
      if (!mueve(e, dx, dy) && v.t > 0.15) est.empujes.delete(e);      // contra una pared o un mueble: se para ahí
      else if (e.clase && Math.abs(dx) > 0.3) e.mira = dx > 0 ? -1 : 1;      // mira hacia el coche mientras sale volando de espaldas
    }
    for (let i = est.parts.length - 1; i >= 0; i--) {
      const p = est.parts[i]; p.t += dt;
      if (p.t >= p.dur) { est.parts.splice(i, 1); continue; }
      const fr = Math.exp(-(p.k === 'raya' ? 1.2 : 3) * dt); p.vx *= fr; p.vy *= fr; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === 'papel') { p.rot += p.vr * dt; p.vy += 60 * dt; } else if (p.k === 'vaho') p.r += 16 * dt;
    }
  },
  // un empujón: fuerte en la boca del chorro, más flojo al final; si ya iba volando, solo lo renueva
  empuja(est, e, ch, d) {
    const v = ROASTER.fuerza * (1 - d * 0.45), ya = est.empujes.get(e);
    const vx = ch.dx * v + ch.dy * Math.sign(e.x - ch.x || 1) * v * 0.18, vy = ch.dy * v + ch.dx * Math.sign(e.y - 18 - ch.y || 1) * v * 0.12;
    if (ya && ya.t < 0.35) return;
    est.empujes.set(e, { vx, vy, t: 0 });
    if (e === J.yo && !ya) {
      play('pop'); vibra(40); fxTexto(e.x, e.y - 76, tr('¡Uaaah!'), '#fff6ea');
      if (est.primera) { est.primera = false; SAVE.tuto = SAVE.tuto || {}; if (!SAVE.tuto['turbo-ay']) { SAVE.tuto['turbo-ay'] = 1; guardaPartida(); avisa(tr('El coche del jefe tiene el turbo puesto. Phony lo aparcó así.'), 'aviso'); } }
    }
  },
  // el salto: en el suelo, la sombra que se encoge con la altura; encima de todos, el coche en el aire con sus chorros hacia abajo
  pintaSuelo(c, est) {
    const a = est.act, m = est.m; if (!m || !a || a.fase !== 'sopla' || a.p.tipo !== 'salto') return;
    const h = altoRoaster(a.t), k = 1 - h / (ROASTER.alto * 2.2);
    c.save(); c.globalAlpha = 0.35; forma(c, ovalo(m.x, m.y - 38, 30 * k, 44 * k), 'rgba(24,12,40,1)', 0); c.restore();
  },
  pintaSalto(c, est, reloj) {      // lo llama pintaVelo: por encima de la oscuridad, para que el salto se vea aunque no le dé la linterna
    const a = est.act, m = est.m; if (!m || !a || a.fase !== 'sopla' || a.p.tipo !== 'salto') return;
    const h = altoRoaster(a.t); if (h <= 0.5) return;
    if (chorroSalto(a.p, a.t)) for (const [dx, dy] of [[-18, -66], [18, -66], [-18, -12], [18, -12]]) {      // cuatro chorros de aire bajo el coche hasta el suelo
      const x = m.x + dx, y0 = m.y + dy - h, y1 = m.y + dy, g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgba(234,246,255,0.85)'); g.addColorStop(1, 'rgba(234,246,255,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - 4, y0); c.lineTo(x + 4, y0); c.lineTo(x + 11 + Math.sin(reloj * 30 + dx) * 2, y1); c.lineTo(x - 11, y1); c.closePath(); c.fill();
    }
    c.save(); c.translate(m.x, m.y - h); c.rotate(Math.sin(a.t * 5) * 0.05); c.scale(1 + h / 320, 1 + h / 320);
    TIPOS_MUEBLE.roaster.pinta(c);
    for (const sx of [-13, 13]) { const g = c.createRadialGradient(sx, -75, 1, sx, -75, 22); g.addColorStop(0, 'rgba(255,250,225,.95)'); g.addColorStop(1, 'rgba(255,250,225,0)'); c.fillStyle = g; c.beginPath(); c.arc(sx, -75, 22, 0, TAU); c.fill(); }      // con los faros encendidos
    c.restore();
  },
  termina() {},
  focos() { return []; },
  // por encima de todo (también de la oscuridad: el aire se ve aunque no le dé la linterna): faros, flechas, chorros y lo que vuela
  pintaVelo(c, est, t, reloj) {
    if (!est.m || J.fase !== 'caza') return;
    const m = est.m, a = est.act;
    this.pintaSalto(c, est, reloj);
    if (a && a.fase === 'aviso') {
      const on = (a.t * 7) % 1 < 0.55 ? 1 : 0.25;
      for (const s of [-1, 1]) {      // los faros parpadean (y los pilotos)
        const x = m.x + s * 13, y = m.y - 75, g = c.createRadialGradient(x, y, 1, x, y, 26);
        g.addColorStop(0, `rgba(255,250,225,${0.95 * on})`); g.addColorStop(1, 'rgba(255,250,225,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 26, 0, TAU); c.fill();
        const xr = m.x + s * 16, yr = m.y, gr = c.createRadialGradient(xr, yr, 1, xr, yr, 16);
        gr.addColorStop(0, `rgba(255,75,92,${0.85 * on})`); gr.addColorStop(1, 'rgba(255,75,92,0)'); c.fillStyle = gr; c.beginPath(); c.arc(xr, yr, 16, 0, TAU); c.fill();
      }
      // flechas en el suelo que salen hacia donde va a soplar
      for (const ch of chorrosRoaster(m, a.p.tipo)) for (let k = 0; k < 3; k++) {
        const q = (a.t * 1.6 + k / 3) % 1, d = 26 + q * (ch.largo - 50), al = Math.sin(q * Math.PI) * 0.85;
        c.save(); c.translate(ch.x + ch.dx * d, ch.y - (ch.dy ? 0 : 6) + ch.dy * d); c.rotate(Math.atan2(ch.dy, ch.dx)); c.globalAlpha = al;
        forma(c, poli(-8, -15, 4, 0, -8, 15, -2, 15, 10, 0, -2, -15), '#ffcb3d', 2.6);
        c.restore();
      }
      c.globalAlpha = 1;
    }
    if (a && a.fase === 'sopla' && chorroSalto(a.p, a.t)) {      // las líneas de viento de dibujo animado: rayas onduladas que corren hacia fuera
      const f = a.p.tipo === 'salto' ? 0.85 : Math.min(1, a.t / 0.15) * Math.min(1, (ROASTER.sopla - a.t) / 0.25);
      for (const ch of chorrosRoaster(m, a.p.tipo)) {
        c.save(); c.translate(ch.x, ch.y - (ch.dy ? 0 : 8)); c.rotate(Math.atan2(ch.dy, ch.dx));
        for (let k = 0; k < 4; k++) {
          const q = (reloj * 1.9 + k * 0.29) % 1, off = [-1, 0.35, -0.35, 1][k] * ch.ancho * 0.8, ini = 6 + q * ch.largo * 0.55, l = ch.largo * (0.28 + 0.12 * (k % 2));
          const ond = Math.sin(reloj * 10 + k * 2) * 5;
          c.globalAlpha = 0.9 * f * Math.sin(q * Math.PI);
          c.beginPath(); c.moveTo(ini, off); c.bezierCurveTo(ini + l * 0.33, off - ond, ini + l * 0.66, off + ond, ini + l, off);
          c.lineCap = 'round'; c.lineWidth = 6.5; c.strokeStyle = 'rgba(32,16,44,0.5)'; c.stroke(); c.lineWidth = 3.2; c.strokeStyle = '#eaf6ff'; c.stroke();
        }
        c.restore();
      }
      c.globalAlpha = 1;
    }
    for (const p of est.parts) {
      const q = p.t / p.dur, al = q < 0.15 ? q / 0.15 : 1 - (q - 0.15) / 0.85;
      if (p.k === 'raya') { c.globalAlpha = al * 0.8; raya(c, [p.x, p.y, p.x - p.vx * 0.045, p.y - p.vy * 0.045], '#f4fbff', 2.4); }
      else if (p.k === 'vaho') { c.globalAlpha = al * 0.5; forma(c, ovalo(p.x, p.y, p.r, p.r * 0.8), '#eef4ff', 1.8, 'rgba(32,16,44,0.5)'); }
      else { c.globalAlpha = Math.min(1, al * 1.4); c.save(); c.translate(p.x, p.y); c.rotate(p.rot); forma(c, caja(-4, -3, 8, 6, 1), p.col, 1.5); c.restore(); }
    }
    c.globalAlpha = 1;
  },
};
