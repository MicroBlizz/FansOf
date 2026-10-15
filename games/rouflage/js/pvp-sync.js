// Fans of Rouflage (prototipo) · PvP, LA SINCRONÍA: lo que se manda por el canal de la sala y qué se hace con lo que llega. Cada jugador lleva su personaje y avisa de dónde está (e);
// los demás lo ven como una copia que se mueve suave hacia ese punto. La piel pintada se manda una sola vez, al congelarse (p). El ANFITRIÓN manda cómo van los personajes de la máquina,
// el reloj y la fase (a, fa), decide los disparos (tq → t) y el final (fn). Silbidos (s), «¡listo!» (l) y rendirse (rd) los manda cada uno.
// Todos los avisos llevan `de`: la plaza de quien los manda. Mensajes (t): e estado · a máquina+reloj · fa fase · p piel · s silbido · tq pido disparar · t resultado del disparo · l listo · fn final · rd me voy.
'use strict';

const rfpManda = m => { if (RFP.canal && RFP.activo) RFP.canal.enviar(Object.assign({ de: RFP.yo }, m)); };
const r1 = n => Math.round(n * 10) / 10;
const MARCAS = ['', '?', '!'];
const FASES = { prep: 0, cuenta: 1, caza: 2, fin: 3 };

// ---------- cada fotograma ----------
function rfpPaso(dt) {
  if (!RFP.activo) return;
  rfpActualizaAnfitrion();
  rfpConfinaBecario();
  if (RFP.vuelta) { rfpPideEstado(dt); return; }      // volviendo: ni mando ni mando yo hasta tener la foto del anfitrión
  rfpVigilaSilencios();
  rfpLatido(dt);
  rfpEnvia(dt);
}
// cada 30 s le dice al servidor que sigues aquí (y si juegas o miras): si desapareces vivo más de 3 minutos, cuenta como abandono y resta puntos
const LATIDO = { cada: 30, t: 0 };
function rfpLatido(dt) {
  if ((LATIDO.t -= dt) > 0 || !RFP.red || J.fase === 'fin' || RFP.cerrado) return;
  LATIDO.t = LATIDO.cada; RFP.red.latido(!(J.yo && sinJuego(J.yo)));
}
// un becario espera en su sala (Recursos Humanos, el vestíbulo…) mientras los colados se pintan
function rfpConfinaBecario() {
  const yo = J.yo, z = salaEspera();
  if (!yo || !z || yo.clase !== 'cazador' || (J.fase !== 'prep' && J.fase !== 'cuenta')) return;
  yo.x = limita(yo.x, z.px + 12, z.px + z.pw - 12); yo.y = limita(yo.y, z.py + 22, z.py + z.ph - 6);
}
function rfpEnvia(dt) {
  const yo = J.yo; if (!yo || J.fase === 'fin' || RFP.vuelta) return;
  if (!yo.congelado && yo.listo) { yo.listo = false; RFP.listos.delete(RFP.yo); }      // si rompes el hielo ya no estás listo
  RFP.tEnvio -= dt;
  if (RFP.tEnvio <= 0) {
    const nh = RFP.slots.filter(s => s.humano).length, hz = Math.min(RFP_AJ.envioHz, Math.max(4, RFP_AJ.avisosSala / Math.max(1, nh)));
    RFP.tEnvio = 1 / hz;
    rfpManda({ t: 'e', x: r1(yo.x), y: r1(yo.y), m: yo.moviendo ? 1 : 0, c: yo.congelado ? 1 : 0, mi: yo.mira, di: Math.round(yo.dir * 100) / 100, ci: yo.ciego > 0 ? 1 : 0, f: yo.fuera ? 1 : 0, iv: Math.ceil(yo.invis) });
  }
  if (!RFP.soyHost) return;
  RFP.tIA -= dt;
  if (RFP.tIA > 0) return;
  RFP.tIA = 1 / RFP_AJ.iaHz;
  const ks = [], fu = [], ba = [];
  for (const e of J.entes) {
    if (e.fuera) fu.push(e.slot);
    if (e.clase === 'cazador') ba.push([e.slot, e.balas]);
    if (e.humano || e.remoto || e.fuera) continue;
    ks.push([e.slot, r1(e.x), r1(e.y), e.moviendo ? 1 : 0, e.mira, Math.round(e.dir * 100) / 100, e.congelado ? 1 : 0, Math.max(0, MARCAS.indexOf(e.marca)), e.alerta >= 1 ? 1 : 0, e.ciego > 0 ? 1 : 0]);
  }
  rfpManda({ t: 'a', f: J.fase, r: Math.round(J.reloj * 10) / 10, ks, fu, ba });
}

// ---------- lo que llega ----------
function rfpRecibe(m) {
  if (!RFP.activo || !m || typeof m.de !== 'number') return;
  const sl = RFP.slots[m.de]; if (!sl || !sl.humano || m.de === RFP.yo) return;
  RFP.rx[m.de] = m.t === 'hv' ? RELOJ - 99 : RELOJ;      // «ponme al día»: perdió la partida, no manda aunque fuera el anfitrión (otro le contesta)
  if (RFP.ido[m.de]) return;
  if (sl.ausente && m.t !== 'hv') rfpVuelve(sl);      // si hablaba, no se había ido
  rfpActualizaAnfitrion();      // si el que escribe es de menor plaza que el anfitrión que tengo, ya es el anfitrión
  switch (m.t) {
    case 'e': rfpEstado(sl, m); break;
    case 'p': rfpPiel(m); break;
    case 's': { const e = RFP.slots[m.s] && RFP.slots[m.s].ente; if (e && e !== J.yo && (m.de === m.s || m.de === RFP.host)) silba(e, !!m.fz); break; }
    case 'l': RFP.listos.add(m.de); break;
    case 'rd': rfpSeVa(m.de); break;
    case 'sz': senueloRecibe(m.l); break;
    case 'gr': if (sl.ente && !sl.ente.fuera) { sl.ente.granada = 0; sl.ente.invis = Math.max(sl.ente.invis, GRANADA.dura); granadaEstalla(m.x, m.y, null); } break;
    case 'hv': if (RFP.soyHost && !RFP.vuelta) rfpMandaEstado(m.de); break;
    case 'sn': if (m.de !== RFP.yo) rfpAplicaEstado(m); break;
    case 'tq': if (RFP.soyHost) rfpTiroPedido(sl, m); break;
    case 'cg': if (RFP.soyHost) rfpCartasExtra(sl, m); break;
    case 'fp': rfpPoderRecibido(m); break;
    case 'a': if (m.de === RFP.host && !RFP.soyHost) rfpEstadoIA(m); break;
    case 'fa': if (m.de === RFP.host && !RFP.soyHost) rfpSigueFase(m.f, m.r); break;
    case 't': if (m.de === RFP.host && !RFP.soyHost) rfpAplicaTiro(m); break;
    case 'fn': if (m.de === RFP.host && !RFP.soyHost) rfpFinRecibido(m); break;
  }
}
// el estado de otro jugador: dónde está, si se mueve, si está congelado, hacia dónde mira y apunta
function rfpEstado(sl, m) {
  const e = sl.ente; if (!e || e.fuera) return;
  const r = e.red || (e.red = { x: m.x, y: m.y, m: false, mi: 1, di: 0 });
  rfpFijaRed(r, m.x, m.y); r.m = !!m.m; r.mi = m.mi; r.di = m.di || 0;
  e.ciego = m.ci ? 0.5 : 0; e.invis = m.iv || 0;
  if (e.clase === 'camaleon') {
    if (m.c && !e.congelado) { e.congelado = true; e.x = m.x; e.y = m.y; }       // (la piel llega en su propio aviso)
    else if (!m.c && e.congelado) { descongela(e); RFP.listos.delete(sl.s); }
  }
}
// el estado de la máquina que manda el anfitrión, más el reloj, quién está fuera y las cartas de cada becario
function rfpEstadoIA(m) {
  if (m.f && m.f !== J.fase) rfpSigueFase(m.f, m.r);
  if (typeof m.r === 'number' && J.fase !== 'fin') J.reloj = Math.abs(J.reloj - m.r) > 0.4 ? m.r : J.reloj + (m.r - J.reloj) * 0.3;
  for (const k of m.ks || []) {
    const e = RFP.slots[k[0]] && RFP.slots[k[0]].ente; if (!e || !e.remoto || e.humano || e.fuera) continue;
    const r = e.red || (e.red = {});
    rfpFijaRed(r, k[1], k[2]); r.m = !!k[3]; r.mi = k[4]; r.di = k[5];
    if (e.clase === 'camaleon') { if (k[6] && !e.congelado) { e.congelado = true; e.x = k[1]; e.y = k[2]; } else if (!k[6] && e.congelado) descongela(e); }
    else { e.marca = MARCAS[k[7]] || ''; e.alerta = k[8] ? 1 : 0; e.ciego = k[9] ? 0.5 : 0; }
  }
  for (const s of m.fu || []) { const e = RFP.slots[s] && RFP.slots[s].ente; if (e && !e.fuera) rfpApartar(e); }
  for (const [s, b] of m.ba || []) { const e = RFP.slots[s] && RFP.slots[s].ente; if (e && e.clase === 'cazador') e.balas = b; }
}
// el anfitrión cambia de fase: los demás lo siguen (siempre hacia delante)
function rfpSigueFase(f, reloj) {
  if (!(f in FASES) || f === 'fin' || FASES[f] <= FASES[J.fase]) return;
  while (FASES[J.fase] < FASES[f]) cambiaFase(['prep', 'cuenta', 'caza'][FASES[J.fase] + 1]);
  if (typeof reloj === 'number') J.reloj = reloj;
}
// el anfitrión cambia de fase (lo llama cambiaFase): se lo cuenta a todos y, al salir a la caza, repite las pieles por si alguien no las tenía
function rfpFase(f) {
  if (!RFP.activo) return;
  if (RFP.soyHost) rfpManda({ t: 'fa', f, r: Math.round(J.reloj * 10) / 10 });
  if (f === 'cuenta' || f === 'caza') {
    let n = 0;
    for (const e of J.entes) if (e.clase === 'camaleon' && !e.fuera && e.congelado && (e === J.yo || (e.bot && RFP.soyHost))) setTimeout(() => { if (RFP.activo && e.congelado) rfpMandaPiel(e); }, 120 + 80 * n++ + (f === 'caza' ? 1500 : 0));
  }
}
// uno ha escrito «¡listo!»: si ya lo están todos los camaleones de carne y hueso, se acaba el tiempo de pintarse
function rfpListo() {
  const yo = J.yo; yo.listo = true; RFP.listos.add(RFP.yo); rfpManda({ t: 'l' });
  pista(tr('Esperando a que los demás estén listos…'), 60);
}
function rfpTodosListos() {
  const hum = RFP.slots.filter(sl => sl.humano && sl.clase === 'camaleon' && !RFP.ido[sl.s] && !sl.ausente && sl.ente && !sl.ente.fuera);
  return hum.length > 0 && hum.every(sl => RFP.listos.has(sl.s));
}

// ---------- las copias se mueven suave hacia donde les dicen (lo llama avanzaEnte) ----------
// una posición recién llegada: se anota con su hora y la velocidad que llevaba, para seguirla hacia delante hasta que llegue la siguiente
function rfpFijaRed(r, x, y) {
  const t = performance.now() / 1000;
  if (r.t !== undefined && r.x !== undefined) {
    const d = t - r.t;
    if (d > 0.02 && d < 0.6) { const vx = (x - r.x) / d, vy = (y - r.y) / d; r.vx = (r.vx || 0) * 0.4 + vx * 0.6; r.vy = (r.vy || 0) * 0.4 + vy * 0.6; }
    else { r.vx = 0; r.vy = 0; }
  }
  r.x = x; r.y = y; r.t = t;
}
function avanzaRemoto(e, dt) {
  const r = e.red; if (!r) { e.moviendo = false; return; }
  if (e.congelado) { e.x = r.x; e.y = r.y; }
  else {
    const adelanto = r.m && r.t !== undefined ? Math.min(0.3, performance.now() / 1000 - r.t) : 0;      // avanza con su velocidad hasta la siguiente noticia
    const tx = r.x + (r.vx || 0) * adelanto, ty = r.y + (r.vy || 0) * adelanto, k = Math.min(1, dt * 18);
    e.x += (tx - e.x) * k; e.y += (ty - e.y) * k; if (lejos(e.x, e.y, r.x, r.y) > 140) { e.x = r.x; e.y = r.y; }
  }
  e.vx = e.vy = 0; e.moviendo = !!r.m && !e.congelado; e.mira = r.mi < 0 ? -1 : 1;
  if (e.clase === 'cazador') e.dir += giro(e.dir, r.di) * Math.min(1, dt * 16);
  if (e.moviendo) { e.anda += dt * e.prisa; e.movido = 0.5; }
}

// ---------- la piel: una imagen pequeña al congelarse (la de la máquina la manda el anfitrión) ----------
// la llama congela() para cada personaje que llevo yo (o, siendo anfitrión, la máquina)
function rfpCongela(e) {
  if (!RFP.activo || e.clase !== 'camaleon' || !(e.jugador || (e.bot && RFP.soyHost))) return;
  rfpMandaPiel(e);
}
function rfpMandaPiel(e) {
  if (RFP.sinPiel && e === J.yo) return;      // recién vuelto: mi piel en blanco no debe pisar la buena
  let png; try { png = e.piel.toDataURL('image/png'); } catch (x) { return; }
  rfpManda({ t: 'p', s: e.slot, x: e.x, y: e.y, po: e.postura || 'firmes', pi: e.pintado ? 1 : 0, cm: e.camo, png: png.slice(png.indexOf(',') + 1) });
}
function rfpPiel(m) {
  const e = RFP.slots[m.s] && RFP.slots[m.s].ente; if (!e || (e === J.yo && !RFP.sinPiel) || e.fuera || (!e.remoto && e !== J.yo) || (m.de !== m.s && !(RFP.slots[m.de] && RFP.slots[m.de].humano)) || typeof m.png !== 'string') return;
  const img = new Image();
  img.onload = () => {
    if (!RFP.activo || (!e.remoto && e !== J.yo)) return;
    if ((e.postura || 'firmes') !== m.po && POSTURAS[m.po]) { const [cv, g] = nuevaPiel(BLANCO_PIEL, m.po); e.piel = cv; e.pctx = g; e.postura = m.po; e.pz = null; }
    e.pctx.save(); e.pctx.globalCompositeOperation = 'copy'; e.pctx.drawImage(img, 0, 0); e.pctx.restore();
    e.pintado = !!m.pi; e.x = m.x; e.y = m.y; if (e.red) { e.red.x = m.x; e.red.y = m.y; }
    e.congelado = true; if (e === J.yo) RFP.sinPiel = false;
    if (RFP.soyHost || e === J.yo) mideCamuflaje(e); else e.camo = m.cm || 0;      // quien manda la mide él mismo (los becarios bot ven con esa cifra)
  };
  img.src = 'data:image/png;base64,' + m.png;
}

// ---------- silbidos: los manda quien silba (o el anfitrión, si es de la máquina); lo llama silba() ----------
function rfpSilbo(e, forzado) {
  if (!RFP.activo || e.remoto || !(e.jugador || (e.bot && RFP.soyHost))) return;
  rfpManda({ t: 's', s: e.slot, fz: forzado ? 1 : 0 });
}

// ---------- disparos: el cazador apunta, el anfitrión decide y se lo cuenta a todos ----------
// el cazador que eres tú ha disparado a (x, y): si eres el anfitrión se decide aquí; si no, se pide
function rfpDispara(x, y, margen) {
  const yo = J.yo; yo.enfria = REGLAS.enfria;
  if (RFP.soyHost) { const r = rfpResuelve(yo, x, y, margen); rfpAplicaTiro(r); rfpManda(Object.assign({ t: 't' }, r)); }
  else rfpManda({ t: 'tq', x: Math.round(x), y: Math.round(y), mg: margen });
}
function rfpTiroPedido(sl, m) {
  const h = sl.ente;
  if (!h || h.clase !== 'cazador' || h.fuera || h.balas <= 0 || J.fase !== 'caza' || lejos(h.x, h.y - 6, m.x, m.y) > REGLAS.alcance * 1.4) return;
  const r = rfpResuelve(h, m.x, m.y, Math.min(6, +m.mg || 4));
  rfpAplicaTiro(r); rfpManda(Object.assign({ t: 't' }, r));
}
// solo el anfitrión: ¿a quién le da? cs: 0 acierta · 1 dispara a alguien que corre (no gasta carta) · 2 despido improcedente (pierde una carta) · 3 contra un señuelo (un extintor…)
function rfpResuelve(h, x, y, margen) {
  const r = { s: h.slot, x, y, k: -1, cs: 2, sn: -1, b: h.balas };
  const k = J.camaleones.find(c => !c.fuera && !invisible(c) && dentroDeAlubia(c, x, y, margen));
  if (k) { r.k = k.slot; r.cs = 0; h.balas = Math.min(REGLAS.balas, h.balas + 1); }
  else if (J.camaleones.some(c => !c.fuera && !invisible(c) && c.hielo < 0.85 && (c.moviendo || c.movido > 0) && lejos(c.x, c.y - 24, x, y) < 60)) r.cs = 1;
  else {
    h.balas--; h.pts.fallos++;
    const mi = MUEBLES.findIndex(m => m.T.senuelo && x > m.dib.x0 + 8 && x < m.dib.x0 + m.dib.w - 8 && y > m.dib.y0 && y < m.y + 2);
    if (mi >= 0) { r.cs = 3; r.sn = mi; }
  }
  r.b = h.balas;
  return r;
}
// un disparo de un becario de la máquina (lo llama disparaBot, solo el anfitrión): ya se ha aplicado aquí, se cuenta a los demás
function rfpTiroIA(e, x, y, k, cs) { rfpManda({ t: 't', s: e.slot, x: Math.round(x), y: Math.round(y), k: k ? k.slot : -1, cs, sn: -1, b: e.balas }); }
// en todos los navegadores (menos en el del anfitrión, para los disparos de la máquina): el disparo se ve y se nota
function rfpAplicaTiro(r) {
  const h = RFP.slots[r.s] && RFP.slots[r.s].ente, k = r.k >= 0 && RFP.slots[r.k] ? RFP.slots[r.k].ente : null; if (!h) return;
  const mio = h === J.yo;
  if (!mio) {
    h.dir = Math.atan2(r.y - (h.y - 6), r.x - h.x); h.mira = Math.cos(h.dir) >= 0 ? 1 : -1; h.tApunta = 0.7; if (h.red) { h.red.di = h.dir; h.red.mi = h.mira; }
    fxDisparo(h, r.x, r.y);
  }
  if (k) { if (!k.fuera) despide(k, h); }
  else { fxMancha(r.x, r.y); play(r.cs === 1 ? 'gun' : 'clank'); }
  if (mio) {
    if (r.cs <= 1) h.enfria = REGLAS.enfria * 0.7;
    else {
      h.ciego = REGLAS.ciego; h.enfria = REGLAS.enfriaFallo; J.cuenta.fallos++; CAM.tiembla = 0.18; play('deny');
      if (r.cs === 3 && MUEBLES[r.sn]) { J.cuenta.senuelos++; avisa(tr('Has despedido a {b}. Despido improcedente.', { b: tr(NOMBRE_SENUELO[MUEBLES[r.sn].t]) }), 'malo'); }
      else avisa(tr('Ahí no había nadie. Despido improcedente: pierdes una carta.'), 'malo');
    }
  } else if (r.cs >= 2) { h.ciego = REGLAS.ciego; avisa(tr('{a} ha fallado. Despido improcedente.', { a: h.nombre }), 'bueno'); }
  h.balas = r.b;
  refrescaHud(true);
}

// ---------- el final: lo decide el anfitrión ----------
// solo el anfitrión, durante la caza: ¿ha ganado algún bando?
function rfpComprueba() {
  if (J.fase !== 'caza') return;
  if (!escondidos().length) rfpFinHost('cazador', 'todos');
  else if (!cazadoresVivos().length) rfpFinHost('camaleon', 'cartas');
  else if (J.reloj <= 0) rfpFinHost('camaleon', 'tiempo');
}
function rfpFinHost(g, mo) {
  const rows = J.entes.map(e => ({ s: e.slot, p: marcadorDe(e), k: e.pts, c: e.camo, f: e.fuera ? 1 : 0 })), fin = { g, mo, rows };
  rfpManda(Object.assign({ t: 'fn' }, fin));
  [400, 1300].forEach(ms => setTimeout(() => rfpManda(Object.assign({ t: 'fn' }, fin)), ms));      // por si se pierde uno
  termina((J.yo.clase === 'camaleon') === (g === 'camaleon'), mo, fin);
}
function rfpFinRecibido(m) { if (J.fase !== 'fin') termina((J.yo.clase === 'camaleon') === (m.g === 'camaleon'), m.mo, m); }
// los puntos y las cifras de cada uno, como las ha contado el anfitrión
function rfpAplicaFin(fin) {
  for (const r of fin.rows || []) {
    const e = RFP.slots[r.s] && RFP.slots[r.s].ente; if (!e) continue;
    e.puntosRed = r.p; Object.assign(e.pts, r.k || {}); e.camo = r.c || 0;
    if (r.f && !e.fuera) rfpApartar(e);
  }
}
// si no queda anfitrión que cierre la partida (y el tiempo ya pasó), se cierra con lo que se sabe
function rfpSinAnfitrion() {
  if (J.fase === 'caza' && J.reloj < -8) { const g = escondidos().length ? 'camaleon' : 'cazador'; termina((J.yo.clase === 'camaleon') === (g === 'camaleon'), 'tiempo'); }
}

// un cazador dice cuántas cartas extra ha ganado en las prácticas: el anfitrión se las pone (con tope, y solo antes de la caza)
function rfpCartasExtra(sl, m) {
  const h = sl.ente; if (!h || h.clase !== 'cazador' || h.bot || !['prep', 'cuenta'].includes(J.fase)) return;
  h.balas = Math.max(h.balas, Math.min(REGLAS.balas, REGLAS.balasIni + Math.max(0, Math.min(REGLAS.balasExtra, m.n | 0))));
}
