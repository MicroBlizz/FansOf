// Fans of Rouflage · LAS HABILIDADES EN LA PARTIDA (talentos): quién lleva cuál (la elegida, o al azar los bots), el botón y su tecla (E), lo que hace cada
// una y cuándo la usan los bots. En el PvP cada efecto se manda con rfpManda({ t: 'tl', h, s, … }) y cada navegador lo aplica igual (habEfecto); lo que
// lleva cada jugador se avisa con { t: 'hb', b, c } junto a la ropa. Los dibujos y los sonidos están en talentos-efectos.js. Cifras: TALENTOS (talentos-datos.js).
'use strict';

const TALP = { drones: [], senuelos: [], fx: [], pend: [], nsen: 0, boton: '' };

function talentosLimpia() { TALP.drones.length = 0; TALP.senuelos.length = 0; TALP.fx.length = 0; TALP.pend.length = 0; TALP.nsen = 0; TALP.boton = ''; }
function habPon(e, id, nivel) {
  const h = habDef(id); if (!h || h.papel !== papelDe(e.clase)) return;
  e.hab = id; e.habUsos = h.usos || 0; e.habEspera = 0; e.uv = 0; e.cafe = 0; e.gato = 0; e.marcaDron = 0;
  e.habNivel = nivel || 1;
  if (e.clase === 'camaleon') { e.granada = id === 'granada' ? 1 : 0; e.tinta = tintaSen(e); }      // la granada es la habilidad de nivel 1: quien elige otra no la lleva
}
// al empezar (cambiaFase('prep')): la tuya, la que avisó cada persona del PvP, y al azar la de los bots (en el PvP, la misma en todos los navegadores)
function talentosReparte() {
  talentosLimpia();
  if (J.pvp && J.fase !== 'sala') talRotuloPartida(talOn());      // el rótulo CON TALENTOS o CLÁSICO al empezar (talentos-pantalla.js); en la sala con amigos no, que salía en cada cambio
  if (!talOn()) { for (const e of J.entes) { e.hab = null; if (e.clase === 'camaleon') { e.granada = 1; e.tinta = SEN.max; } } return; }      // SIN TALENTOS: como siempre, la granada para todos los colados
  for (const e of J.entes) {
    if (e.dueno) continue;
    const papel = papelDe(e.clase), sl = J.pvp && RFP.slots ? RFP.slots[e.slot] : null;
    if (e.jugador) habPon(e, talElegida(papel), talNivel(papel));
    else if (sl && sl.humano) habPon(e, (sl.habs && sl.habs[papel === 'becario' ? 'b' : 'c']) || habsDe(papel)[0].id);
    else habPon(e, talBot(papel, J.pvp && RFP.info ? (RFP.info.semilla * 31 + e.slot * 7919 + 17) % 2147483646 + 1 : null), TAL.nivelBot);
  }
  TALP.boton = '';
  if (J.yo && J.yo.hab === 'rapida') TALP.pend.push({ t: 10, f: () => { if (J.fase === 'prep') tutoDi('hab-rapida'); } });
}
const habActiva = e => e.uv > 0 || e.cafe > 0 || e.gato > 0;
// ¿se puede usar ahora? Devuelve '' o el motivo
function habPuede(e) {
  const h = habDef(e && e.hab); if (!h || h.pasiva || h.titulo) return 'no';
  if ((J.fase !== 'caza' && J.fase !== 'sala') || e.fuera || (e.clase === 'cazador' && e.balas <= 0)) return tr('Solo durante la caza');
  if (h.id === 'granada') return e.granada > 0 ? '' : tr('Ya la has usado');
  if (e.habUsos <= 0) return tr('Ya la has usado');
  if (e.habEspera > 0) return tr('Espera {n} s', { n: Math.ceil(e.habEspera) });
  if (habActiva(e) || TALP.drones.some(d => d.dueno === e && d.fase !== 'fin')) return tr('Ya está en marcha');
  if (h.id === 'senuelo' && TALLER.abierto && e.jugador) return tr('Cierra el taller primero');
  if (h.id === 'dron' && !talObjetivoDron(e)) return tr('No queda ningún colado a la vista del dron');
  if (h.id === 'cambiazo' && !talOtroColado(e)) return tr('No queda otro colado con quien cambiarte');
  return '';
}
const talObjetivoDron = e => { const v = J.camaleones.filter(k => !k.fuera && k !== e.cuerpo && !invisible(k) && !idaOculto(k)); return v.length ? pick(v) : null; };
const talOtroColado = e => { const v = J.camaleones.filter(k => k !== e && !k.fuera && !invisible(k) && !k.dueno); return v.length ? pick(v) : null; };

// usar la habilidad: comprueba, gasta un uso, la aplica aquí y, en el PvP, se la cuenta a los demás
function habUsa(e) {
  if (habPuede(e)) return false;
  const h = habDef(e.hab);
  if (h.id === 'granada') return lanzaGranada(e);
  const d = { t: 'tl', h: h.id, s: e.slot };
  if (h.id === 'dron') { const k = talObjetivoDron(e); d.o = k.slot; d.oi = J.entes.indexOf(k); }
  if (h.id === 'senuelo') { d.id = (Math.max(0, e.slot) * 16 + TALP.nsen++ % 16) + 1; d.x = Math.round(e.x); d.y = Math.round(e.y); }
  if (h.id === 'cambiazo') { const k = talOtroColado(e); d.o = k.slot; d.oi = J.entes.indexOf(k); d.x1 = Math.round(e.x); d.y1 = Math.round(e.y); d.x2 = Math.round(k.x); d.y2 = Math.round(k.y); }
  e.habUsos--; e.habEspera = h.espera || 0;
  habEfecto(e, h.id, d, false);
  if (J.pvp) rfpManda(d);
  misionEvento('habilidad', e, h.id);
  return true;
}
// lo que hace cada una (aquí y en los demás navegadores). d: los datos del mensaje; remoto: viene de otro navegador
function habEfecto(e, id, d, remoto) {
  const otro = i => (J.pvp && RFP.slots && d.o >= 0 && RFP.slots[d.o] ? RFP.slots[d.o].ente : J.entes[d.oi]);
  const mio = x => x && !x.remoto && (!J.pvp || x.jugador || (x.bot && RFP.soyHost));      // lo mueve este navegador
  switch (id) {
    case 'contador': {
      const z = salaDe(e.x, e.y), n = J.camaleones.filter(k => !k.fuera && k !== e.cuerpo && (z ? salaDe(k.x, k.y) === z : lejos(k.x, k.y, e.x, e.y) < 300)).length;
      talFx({ k: 'contador', e, n: e.jugador ? n : -1, dur: 2.4 }); suenaEn('contador', e.x, e.y, e.jugador ? 1 : 0.7);
      if (e.jugador) avisa(n === 0 ? tr('Aquí no hay ningún colado') : n === 1 ? tr('Aquí hay 1 colado') : tr('Aquí hay {n} colados', { n }), n ? 'bueno' : 'aviso');
      if (e.bot && !remoto) talBotContador(e, n);
      return n;
    }
    case 'dron': {
      const k = otro(); if (!k) return;
      TALP.drones.push({ dueno: e, obj: k, x0: e.x, y0: e.y - 30, x: e.x, y: e.y - 30, alto: 0, fase: 'vuela', t: 0, zumbido: 0 });
      if (e.jugador) avisa(tr('Dron en camino…'), 'aviso');
      if (k.jugador) avisa(tr('¡Un dron viene a por ti! Tira la granada o aguanta quieto'), 'malo');
      play('dronSale'); break;
    }
    case 'silbato':
      talFx({ k: 'silbato', e, dur: 1.4 }); suenaEn('pito', e.x, e.y, 1.2); agachaMusica(1);
      TALP.pend.push({ t: 0.55, f: () => { for (const k of J.camaleones) if (!k.fuera && mio(k)) { k.tSilbo = 0; silba(k, true); } } });
      if (!e.jugador) avisa(tr('{a} ha pitado: ¡todos los colados silban!', { a: e.nombre }), J.yo && J.yo.clase === 'camaleon' ? 'malo' : 'aviso');
      else avisa(tr('¡Priiiii! Todos los colados silban'), 'bueno');
      break;
    case 'uv': e.uv = habDef('uv').dura; suenaEn('uv', e.x, e.y); if (e.jugador) avisa(tr('Linterna ultravioleta: la pintura de los colados brilla'), 'bueno'); break;
    case 'cafe': e.cafe = habDef('cafe').dura; suenaEn('cafe', e.x, e.y); talFx({ k: 'cafe', e, dur: 1.1 }); if (e.jugador) avisa(tr('¡Café doble! Corres más durante {n} s', { n: e.cafe }), 'bueno'); break;
    case 'gato': e.gato = habDef('gato').dura; if (e.jugador) { play('gato'); avisa(tr('Pasos de gato: los becarios bot no notan que andas ({n} s)', { n: e.gato }), 'bueno'); } break;
    case 'senuelo': talSenueloPon(e, d.id, d.x, d.y); break;
    case 'cambiazo': {
      const k = otro(); if (!k || k.fuera) return;
      const pon = (x, nx, ny) => {
        if (x.jugador && TALLER.abierto) cierraTaller();
        x.x = nx; x.y = ny; x.vx = x.vy = 0; if (x.red) { x.red.x = nx; x.red.y = ny; }
        if (mio(x)) { if (x.bot) { x.sitio = [nx, ny]; if (x.bot.estado === 'quieto' || x.congelado) { congela(x); x.hielo = 1; } } if (x.congelado || x.bot) mideCamuflaje(x); if (J.pvp && x.bot) rfpMandaPiel(x); }
      };
      talFx({ k: 'poof', x: d.x1, y: d.y1, dur: 0.8 }); talFx({ k: 'poof', x: d.x2, y: d.y2, dur: 0.8 }); talFx({ k: 'cambiazo', x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, dur: 0.9 });
      // también os cambiáis la pintura (y la postura, que va con ella): cada uno se queda con la que casaba con su sitio nuevo (BALANCE: sin esto, los dos salían descamuflados)
      for (const c of ['piel', 'pctx', 'postura']) { const v = e[c]; e[c] = k[c]; k[c] = v; }
      const cv = e.camo; e.camo = k.camo; k.camo = cv;
      pon(e, d.x2, d.y2); pon(k, d.x1, d.y1);
      for (const h of J.cazadores) { const b = h.bot; if (!b || h.remoto || !b.sosp) continue; b.sosp.delete(e); b.sosp.delete(k); b.ojo.delete(e); b.ojo.delete(k); if (b.objetivo === e || b.objetivo === k) ronda(h); }      // los becarios de la máquina pierden la pista
      suenaEn('cambiazo', d.x1, d.y1); suenaEn('cambiazo', d.x2, d.y2, 0.6);
      if (e.jugador) { avisa(tr('¡Cambiazo! Ahora estás donde estaba {b}', { b: k.nombre }), 'bueno'); avanzaCamara(0, true); if (J.pvp) rfpMandaPiel(e); }
      if (k.jugador) { avisa(tr('¡{a} te ha hecho el cambiazo! Ahora estás en su sitio y con su pintura', { a: e.nombre }), 'malo'); avanzaCamara(0, true); if (J.pvp) rfpMandaPiel(k); }
      break;
    }
    case 'dronx': for (const dr of TALP.drones) if (dr.obj === otro() && (dr.fase === 'vuela' || dr.fase === 'barre')) talDronPierde(dr); break;
    case 'senx': talSenueloRompe(d.id, e, true); break;
  }
}
const talFx = f => { f.t = 0; TALP.fx.push(f); };

/* ---------- cada fotograma ---------- */
function talentosAvanza(dt) {
  if (J.fase === 'titulo') return;
  for (const e of J.entes) {
    if (!e.hab) continue;
    e.habEspera = Math.max(0, (e.habEspera || 0) - dt); e.uv = Math.max(0, (e.uv || 0) - dt); e.cafe = Math.max(0, (e.cafe || 0) - dt); e.gato = Math.max(0, (e.gato || 0) - dt); e.marcaDron = Math.max(0, (e.marcaDron || 0) - dt);
    if (e.cafe > 0 && e.moviendo && Math.random() < dt * 9) TALP.fx.push({ k: 'vapor', x: e.x - e.mira * 10 + rand(-4, 4), y: e.y - 18 + rand(-6, 6), t: 0, dur: 0.6 });
    if (e.gato > 0 && e.moviendo && (e.tHuella = (e.tHuella || 0) - dt) <= 0) { e.tHuella = 0.32; TALP.fx.push({ k: 'huella', x: e.x + (e.anda % 2 > 1 ? 5 : -5), y: e.y - 2, a: Math.atan2(e.vy, e.vx), t: 0, dur: 1.2 }); }
    if (J.fase === 'caza' && e.bot && !e.remoto && !e.fuera) talBotPiensa(e, dt);
  }
  for (let i = TALP.pend.length - 1; i >= 0; i--) { const p = TALP.pend[i]; p.t -= dt; if (p.t <= 0) { TALP.pend.splice(i, 1); p.f(); } }
  for (const dr of TALP.drones) talDronAvanza(dr, dt);
  TALP.drones = TALP.drones.filter(d => d.fase !== 'fin');
  for (const f of TALP.fx) f.t += dt;
  TALP.fx = TALP.fx.filter(f => f.t < f.dur);
  for (const s of TALP.senuelos) { s.t += dt; if (s.rota) s.rota += dt; }
  TALP.senuelos = TALP.senuelos.filter(s => !s.rota || s.rota < 1);
}
// el dron: vuela (3,6 s) hasta encima del colado, barre (1,1 s) y lo marca. Si el colado se vuelve invisible mientras vuela o barre: señal perdida
function talDronAvanza(dr, dt) {
  const k = dr.obj, T = TALENTOS; dr.t += dt;
  if ((dr.zumbido -= dt) <= 0 && dr.fase !== 'fin') { dr.zumbido = 0.22; suenaEn('dron', dr.x, dr.y, dr.fase === 'perdida' ? 0.5 : 1); }
  if ((dr.fase === 'vuela' || dr.fase === 'barre') && (k.fuera || invisible(k))) { talDronPierde(dr); if (J.pvp && !k.remoto && (k.jugador || RFP.soyHost)) rfpManda({ t: 'tl', h: 'dronx', s: dr.dueno.slot, o: k.slot }); return; }
  if (dr.fase === 'vuela') {
    const p = Math.min(1, dr.t / T.dronVuela), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    dr.x = dr.x0 + (k.x - dr.x0) * e; dr.y = dr.y0 + (k.y - 30 - dr.y0) * e; dr.alto = Math.sin(p * Math.PI) * 60 + 34 * Math.min(1, p * 4);
    if (p >= 1) { dr.fase = 'barre'; dr.t = 0; play('dronBip'); }
  } else if (dr.fase === 'barre') {
    dr.x = k.x + Math.sin(dr.t * 5) * 6; dr.y = k.y - 30; dr.alto = 34;
    if (dr.t >= T.dronBarre) talDronMarca(dr);
  } else if (dr.fase === 'marca') {
    dr.x = k.x + Math.sin(dr.t * 2) * 10; dr.y = k.y - 30; dr.alto = 50 + Math.sin(dr.t * 3) * 3;
    if (dr.t >= habDef('dron').dura || k.fuera) { dr.fase = 'vuelve'; dr.t = 0; dr.x0 = dr.x; dr.y0 = dr.y; }
  } else if (dr.fase === 'vuelve' || dr.fase === 'perdida') {
    dr.alto += dt * (dr.fase === 'perdida' ? -30 : 90); dr.y -= dt * 60; if (dr.fase === 'perdida') dr.x += Math.sin(dr.t * 23) * 2;
    if (dr.t > 1.4) dr.fase = 'fin';
  }
}
function talDronPierde(dr) {
  dr.fase = 'perdida'; dr.t = 0; play('senal');
  fxTexto(dr.x, dr.y - dr.alto - 20, tr('SEÑAL PERDIDA'), '#ff8a8a', 15);
  if (dr.dueno.jugador) avisa(tr('Señal perdida: el colado se ha esfumado'), 'malo');
  if (dr.obj.jugador) avisa(tr('¡Le has dado esquinazo al dron!'), 'bueno');
}
function talDronMarca(dr) {
  const k = dr.obj; dr.fase = 'marca'; dr.t = 0; k.marcaDron = habDef('dron').dura; play('dronMarca');
  if (J.yo && J.yo.clase === 'cazador') avisa(tr('El dron ha marcado a {b}', { b: k.nombre }), 'bueno');
  if (k.jugador) avisa(tr('¡El dron te ha marcado! Los becarios saben dónde estás'), 'malo');
  // los becarios de la máquina (los que lleva este navegador) van a mirar
  // el becario de la máquina más cercano (el dueño, si es un bot) va a mirar por la zona: sabe la sala, no el punto exacto (BALANCE: con todos y al punto, el dron era el doble de fuerte)
  const libres = J.cazadores.filter(h => h.bot && !h.remoto && !h.fuera && h.balas > 0 && !['apunta', 'fuera', 'sospecha'].includes(h.bot.estado));
  const h = libres.includes(dr.dueno) ? dr.dueno : libres.sort((a, c) => lejos(a.x, a.y, k.x, k.y) - lejos(c.x, c.y, k.x, k.y))[0];
  if (h) {
    const b = h.bot, a = rand(0, TAU), d = rand(30, 70), p = casillaCerca(k.x + Math.cos(a) * d, k.y + Math.sin(a) * d * 0.7);
    b.ignora.delete(k); if (p) b.destino = [p[0] * CEL + 10, p[1] * CEL + 14];
    if (p && ponRumbo(h, b.destino[0], b.destino[1])) { b.estado = 'investiga'; b.t = 0; b.atento = 1.4; h.marca = '?'; h.alerta = 0.5; }
  }
}

/* ---------- el señuelo pintado: una galleta falsa con tu pintura, quieta donde estabas ---------- */
function talSenueloPon(e, id, x, y) {
  if (TALP.senuelos.some(s => s.id === id)) return;
  const [piel, pctx] = lienzo(e.piel.width, e.piel.height); pctx.drawImage(e.piel, 0, 0);
  const s = Object.assign({}, e, { piel, pctx, x, y, hielo: 1, congelado: true, moviendo: false, movido: 0, tiembla: 0, fuera: false, invis: 0, bot: null, jugador: false, remoto: false, red: null, senuelo: true, talSen: id, id, t: 0, rota: 0, dueno2: e, nombre: e.nombre });
  delete s.cuerpo; TALP.senuelos.push(s);
  // los becarios de la máquina que ya sospechaban del colado miran al señuelo, que está justo donde él estaba (el colado aprovecha para irse)
  for (const h of J.cazadores) {
    const b = h.bot; if (!b || h.remoto || h.fuera || !b.sosp || !(b.objetivo === e || (b.sosp.get(e) || 0) > 0.3)) continue;
    b.sosp.set(e, 0); b.ignora.set(e, 5); (s.vistoPor = s.vistoPor || new Set()).add(h);
    if (b.estado === 'sospecha' || b.estado === 'apunta') sospecha(h, { senuelo: true, x, y, hielo: 1, nombre: tr('el señuelo de {b}', { b: e.nombre }), talSen: id });
  }
  talFx({ k: 'poof', x, y, dur: 0.7 }); suenaEn('senuelo', x, y);
  if (e.jugador) avisa(tr('Señuelo puesto. ¡Ahora vete a otro sitio!'), 'bueno');
}
// ¿hay un señuelo en ese punto? (para los disparos)
const talSenueloEn = (x, y, margen) => TALP.senuelos.find(s => !s.rota && dentroDeAlubia(s, x, y, margen)) || null;
function talSenueloRompe(id, por, remoto) {
  const s = TALP.senuelos.find(q => q.id === id); if (!s || s.rota) return;
  s.rota = 0.001; fxSalpica(s.x, s.y - 26, '#b45cff', 12); fxTexto(s.x, s.y - 70, tr('¡ERA UN SEÑUELO!'), '#e2b8ff', 16); suenaEn('senuelo', s.x, s.y);
  if (por && por.jugador) avisa(tr('¡Era un señuelo de {b}! Despido improcedente.', { b: s.nombre }), 'malo');
  else if (s.dueno2 && s.dueno2.jugador) avisa(tr('¡{a} ha despedido a tu señuelo!', { a: por ? por.nombre : '?' }), 'bueno');
  if (J.pvp && !remoto && por && por.bot && RFP.soyHost) rfpManda({ t: 'tl', h: 'senx', s: por.slot, id });
}
// un becario de la máquina «ve» un señuelo: pica casi siempre (es una galleta entera); no repite con el mismo
function talSenueloBot(e) {
  for (const s of TALP.senuelos) {
    if (s.rota || (s.vistoPor = s.vistoPor || new Set()).has(e) || lejos(e.x, e.y, s.x, s.y) < 50 || !veCazador(e, s.x, s.y - 8)) continue;
    s.vistoPor.add(e); if (Math.random() < 0.25) return null;
    return { senuelo: true, x: s.x, y: s.y, hielo: 1, nombre: tr('el señuelo de {b}', { b: s.nombre }), talSen: s.id };
  }
  return null;
}

/* ---------- los bots ---------- */
function talBotPiensa(e, dt) {
  if (habPuede(e)) return;
  const b = e.bot, id = e.hab, az = p => Math.random() < dt * p;
  if (e.clase === 'cazador') {
    if (b.estado === 'espera' || b.estado === 'fuera') return;
    if (id === 'contador' && b.estado === 'ronda' && b.sala && e.habSala !== b.sala && salaDe(e.x, e.y) === b.sala) { e.habSala = b.sala; habUsa(e); }
    else if (id === 'dron' && J.tFase > 18 && (b.estado === 'ronda' || b.estado === 'mira') && az(0.07)) habUsa(e);
    else if (id === 'silbato' && J.tFase > 22 && (b.estado === 'ronda' || b.estado === 'mira') && az(0.06)) habUsa(e);
    else if (id === 'uv' && ((b.estado === 'sospecha' && b.objetivo && !b.objetivo.senuelo && az(1.2)) || (b.estado === 'mira' && J.tFase > 15 && az(0.12)))) habUsa(e);
    else if (id === 'cafe' && b.estado === 'investiga' && az(2)) habUsa(e);
  }
}
// un colado bot con el señuelo pintado llena de garabatos su alrededor (con su tinta y su alcance, como lo haría una persona en el taller)
function talBotGarabatos(e) {
  const al = alcanceSen(e), cols = ['#ff4b5c', '#ffcb3d', '#39d5e8', '#7ee04a', '#b45cff', '#fff6ea'];
  for (let n = 0; n < 12 && e.tinta > 4; n++) {
    const a = rand(0, TAU), d = rand(al * 0.35, al * 0.95); let x = e.x + Math.cos(a) * d, y = e.y - 20 + Math.sin(a) * d * 0.8;
    if (celdaEn(x, y) !== SUELO) continue;
    const r = rand(3, 5.5), col = Math.random() < 0.5 ? tono(cuentagotas(x, y), rand(-0.35, 0.35)) : pick(cols);
    for (let k = 0; k < 7 && e.tinta > 0; k++) {
      const nx = x + rand(-26, 26), ny = y + rand(-18, 18), coste = senueloCoste(Math.hypot(nx - x, ny - y), r);
      if (lejos(e.x, e.y - 20, nx, ny) > al) break;
      e.tinta -= coste; senueloTraza(x, y, nx, ny, r, col, 'redondo');
      SEN.pend.push([Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), r, col, 0]); x = nx; y = ny;
    }
  }
}
// el contador de un bot: si no hay nadie, se salta la sala; si hay alguien, la mira más a fondo y más atento
function talBotContador(e, n) {
  const b = e.bot; if (!b) return;
  if (!n) { b.puntos = []; b.camino = null; }
  else { b.puntos = puntosDe(b.sala, 3); b.camino = null; b.atento = 1.6; }
}
// un colado bot en apuros (lo llama botGranada en vez de tirar la granada, si lleva otra cosa): señuelo y a correr, pasos de gato y a correr, o el cambiazo
function habBotPeligro(e, dt) {
  if (Math.random() > dt * 3 || habPuede(e)) return false;
  const id = e.hab;
  if (id === 'senuelo') { if (!habUsa(e)) return false; huye(e); return true; }
  if (id === 'gato') { if (!habUsa(e)) return false; huye(e); return true; }
  if (id === 'cambiazo') return habUsa(e);
  return false;
}

/* ---------- el botón (y la tecla E) ---------- */
function accionHabilidad() {
  const yo = J.yo; if (!yo || !jugando() || !yo.hab) return;
  if (yo.hab === 'granada') { accionGranada(); return; }
  const no = habPuede(yo);
  if (no) { play('deny'); if (no !== 'no') pista(no, 1.6); return; }
  habUsa(yo); refrescaHab(true);
}
function talBotonCrea(id, dentro) {
  const b = document.createElement('button'); b.type = 'button'; b.id = id; b.className = 'accion hab'; b.hidden = true;
  b.innerHTML = '<canvas width="88" height="88"></canvas><b></b><span class="hab-usos"></span><kbd>E</kbd>';
  botonAccion(b, accionHabilidad); dentro.appendChild(b); return b;
}
// lo pinta refrescaHud: de colado va en la fila de botones, en el hueco de la granada; de becario, abajo a la derecha. Con su carga y sus usos
function refrescaHab(todo) {
  const yo = J.yo, b1 = E('b-hab'), b2 = E('b-hab-b'); if (!b1) return;
  const h = yo && habDef(yo.hab), ver = !!h && !h.pasiva && h.id !== 'granada' && (J.fase === 'caza' || J.fase === 'sala') && !yo.fuera && !TALLER.abierto && !(yo.clase === 'cazador' && (yo.balas <= 0 || espectando()));
  const b = yo && yo.clase === 'cazador' ? b2 : b1, otro = b === b1 ? b2 : b1;
  if (!otro.hidden) otro.hidden = true;
  if (b.hidden === ver) b.hidden = !ver;
  if (!ver) { TALP.boton = ''; return; }
  const clave = h.id + (todo ? Math.random() : '');
  if (TALP.boton !== h.id || todo) {
    TALP.boton = h.id; b.dataset.hab = h.id; b.querySelector('b').textContent = tr(TAL_CORTO[h.id] || h.n);
    const c = b.querySelector('canvas').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 88, 88); pintaHabIcono(c, 88, h.id);
    b.setAttribute('aria-label', tr(h.n)); void clave;
  }
  const usos = yo.habUsos, activo = habActiva(yo) || TALP.drones.some(d => d.dueno === yo && d.fase !== 'fin');
  const carga = activo ? 0 : yo.habEspera > 0 && usos > 0 ? yo.habEspera / (h.espera || 1) : 0;
  b.style.setProperty('--carga', (carga * 360).toFixed(0) + 'deg');
  b.classList.toggle('gastada', usos <= 0 && !activo); b.classList.toggle('activa', activo); b.classList.toggle('cargando', carga > 0);
  const u = b.querySelector('.hab-usos'), seg = Math.ceil(Math.max(yo.uv, yo.cafe, yo.gato)), txt = activo ? (seg > 0 ? seg + ' s' : '•••') : J.fase === 'sala' ? '' : '×' + usos;      // en la sala viva no se gasta: sin contador
  if (u.textContent !== txt) u.textContent = txt;
}
const TAL_CORTO = { contador: 'CONTAR', dron: 'DRON', silbato: 'SILBATO', uv: 'UV', cafe: 'CAFÉ', senuelo: 'SEÑUELO', gato: 'GATO', cambiazo: 'CAMBIAZO' };
function preparaHab() { talBotonCrea('b-hab', E('acciones')); E('acciones').insertBefore(E('b-hab'), E('b-silbar')); talBotonCrea('b-hab-b', E('hud')); E('b-hab-b').classList.add('becario'); }
