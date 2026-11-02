// Fans of Chef · CANTINA: el servicio al estilo Overcooked (diseño en docs/demos/chef/CANTINA.md). El cocinero anda por la cocina de la
// escena (cantina-escena.js) con una cosa en las manos (J.mano): coge de las cajas de la despensa, corta en la tabla (manteniendo B),
// mete lo cortado en la olla o la sartén (se cocina sola y luego se quema), emplata y sirve en la ventanilla. Las comandas llegan con su
// barra de paciencia; servir en orden sube el combo de la propina. Los puntos del servicio son el oro del día. Pintar: pantalla-cantina.js.
'use strict';

const CANTINA = { objetivo: null, t: 0, comandas: [], proxima: 0, puntos: 0, combo: 1, servidos: 0, caducadas: 0, estaciones: [], cerca: null, cortando: 0, aviso: null, fin: 0, enJuego: 0 };

function empiezaServicio() {
  JORNADA.fase = 'servicio'; Object.assign(CANTINA, { objetivo: null, t: 0, comandas: [], proxima: CIFRAS.comandaCada, puntos: 0, combo: 1, servidos: 0, caducadas: 0, cerca: null, cortando: 0, aviso: null, fin: 0, enJuego: 0 });
  // la escena: la cantina pasa a ser «la sala» (el cocinero, la cámara y la luz van igual que en el sótano)
  ENEMIGOS.length = 0; BOTIN.length = 0; MAPA.sala = CANTINA_ESCENA; MAPA.antorchas = []; MAPA.montacargas = null; MAPA.cofre = null;
  CANTINA.estaciones = CANTINA_ESCENA.estaciones.map(e => Object.assign({ item: null, contenido: [], estado: 'vacia', tt: 0, receta: null }, e));
  jugadorNuevo(500, 190); J.mano = null; J.dir = 'izq'; J.mx = -1; J.my = 0;
  CAM.x = J.x - PAN.W / 2; CAM.y = J.y - PAN.H / 2;
  for (let i = 0; i < CIFRAS.comandasInicio; i++) nuevaComanda();
  cierraVentanas(); SONIDO.campana(); aviso(tr('¡Servicio! Cocina lo que pide la empresa'), 2.2);
}
const avisoCantina = (txt, color = PALETA.Y) => { CANTINA.aviso = { txt, t: 1.6, color }; };
const lleva = r => Object.keys(RECETAS[r].lleva).reduce((a, k) => a + RECETAS[r].lleva[k], 0);

// --- comandas: solo se pide lo que aún se puede hacer con la despensa (descontando lo que ya piden las comandas abiertas) ---
function despensaLibre() {
  const d = Object.assign({}, JORNADA.despensa);
  for (const c of CANTINA.comandas) for (const k in RECETAS[c.receta].lleva) d[k] = (d[k] || 0) - RECETAS[c.receta].lleva[k];
  return d;
}
function recetasPosibles() {
  const d = despensaLibre();
  return Object.keys(RECETAS).filter(r => Object.keys(RECETAS[r].lleva).every(k => (d[k] || 0) >= RECETAS[r].lleva[k]));
}
function nuevaComanda() {
  if (CANTINA.comandas.length >= CIFRAS.comandasMax) return false;
  const pos = recetasPosibles(); if (!pos.length) return false;
  const receta = pick(pos), dur = lleva(receta) >= 3 ? CIFRAS.comandaSeg[1] : CIFRAS.comandaSeg[0];
  CANTINA.comandas.push({ receta, t: dur, dur, quien: pick(CLIENTES), n: ++CANTINA.enJuego });
  SONIDO.campana(); return true;
}

// el punto del suelo más cercano a una estación (adonde va el cocinero en modo tocar) y la distancia de los pies a ella
function puntoJunto(e) {
  const cx = (e.r[0] + e.r[2]) / 2, cy = (e.r[1] + e.r[3]) / 2; let mejor = null, md = 1e9;
  for (let y = e.r[1] - 40; y <= e.r[3] + 40; y += 2) for (let x = e.r[0] - 40; x <= e.r[2] + 40; x += 2) {
    if (!pisable(x, y) || !pisable(x - 8, y) || !pisable(x + 8, y) || !pisable(x, y - 10)) continue;
    const d = Math.hypot(x - cx, y - cy); if (d < md) { md = d; mejor = [x, y]; }
  }
  return mejor;
}
const distEstacion = e => { const px = J.x, py = J.y - 6; return Math.hypot(Math.max(e.r[0] - px, 0, px - e.r[2]), Math.max(e.r[1] - py, 0, py - e.r[3])); };

// --- la estación que tiene delante: la más cercana al punto al que mira, si está a mano ---
function estacionCerca() {
  const px = J.x + J.mx * 14, py = J.y - 6 + J.my * 12;
  let mejor = null, md = 26;
  for (const e of CANTINA.estaciones) {
    const dx = Math.max(e.r[0] - px, 0, px - e.r[2]), dy = Math.max(e.r[1] - py, 0, py - e.r[3]), d = Math.hypot(dx, dy);
    if (d < md) { md = d; mejor = e; }
  }
  return mejor;
}
// qué haría el botón A ahora (para el rótulo) y hacerlo
function accionDe(e) {
  const m = J.mano; if (!e) return null;
  if (e.tipo === 'caja') return !m ? ((JORNADA.despensa[e.que] || 0) > 0 ? { txt: tr('Coger {que}', { que: tr(INGREDIENTES[e.que].nombre) }), hace: () => { JORNADA.despensa[e.que]--; J.mano = { tipo: 'ing', que: e.que, cortado: false }; SONIDO.coge(); } } : { txt: tr('No queda'), no: true }) : null;
  if (e.tipo === 'tabla') {
    if (m && m.tipo === 'ing' && !m.cortado && !e.item) return { txt: tr('Poner en la tabla'), hace: () => { e.item = m; e.item.progreso = 0; J.mano = null; SONIDO.boton(); } };
    if (!m && e.item) return { txt: e.item.cortado ? tr('Coger (cortado)') : tr('Coger'), hace: () => { J.mano = e.item; e.item = null; SONIDO.coge(); } };
    return null;
  }
  if (e.tipo === 'encimera') {
    if (m && !e.item) return { txt: tr('Dejar'), hace: () => { e.item = m; J.mano = null; SONIDO.boton(); } };
    if (!m && e.item) return { txt: tr('Coger'), hace: () => { J.mano = e.item; e.item = null; SONIDO.coge(); } };
    return null;
  }
  if (e.tipo === 'fuego') {
    if (m && m.tipo === 'ing' && (e.estado === 'vacia' || e.estado === 'llena')) {
      if (!m.cortado) return { txt: tr('Hay que cortarlo antes'), no: true };
      const cont = e.contenido.concat(m.que), cabe = Object.keys(RECETAS).filter(r => RECETAS[r].fuego === e.clase && cuentaCabe(cont, RECETAS[r].lleva));
      if (!cabe.length) return { txt: tr('Eso no va ahí'), no: true };
      return { txt: tr('Echar a la {f}', { f: e.clase === 'olla' ? tr('olla') : tr('sartén') }), hace: () => {
        e.contenido = cont; J.mano = null; SONIDO.cocina();
        const lista = cabe.find(r => cuentaIgual(cont, RECETAS[r].lleva));
        if (lista) { e.receta = lista; e.estado = 'cocinando'; e.tt = 0; } else e.estado = 'llena';
      } };
    }
    if (m && m.tipo === 'plato' && !m.receta && e.estado === 'hecha') return { txt: tr('Emplatar'), hace: () => { m.receta = e.receta; e.contenido = []; e.receta = null; e.estado = 'vacia'; SONIDO.servido(); } };
    if (!m && e.estado === 'quemada') return { txt: tr('Sacar lo quemado'), hace: () => { J.mano = { tipo: 'quemado' }; e.contenido = []; e.receta = null; e.estado = 'vacia'; SONIDO.no(); } };
    if (!m && e.estado === 'hecha') return { txt: tr('Trae un plato'), no: true };
    return null;
  }
  if (e.tipo === 'platos') return !m ? { txt: tr('Coger un plato'), hace: () => { J.mano = { tipo: 'plato', receta: null }; SONIDO.coge(); } } : null;
  if (e.tipo === 'ventanilla') {
    if (m && m.tipo === 'plato' && m.receta) { const c = CANTINA.comandas.find(x => x.receta === m.receta); return c ? { txt: tr('Servir'), hace: () => sirve(c) } : { txt: tr('Nadie ha pedido eso'), no: true }; }
    return null;
  }
  if (e.tipo === 'basura') return m ? { txt: tr('Tirar'), hace: () => { J.mano = null; SONIDO.no(); } } : null;
  return null;
}
const cuenta = lista => lista.reduce((a, k) => { a[k] = (a[k] || 0) + 1; return a; }, {});
const cuentaCabe = (lista, lleva) => { const c = cuenta(lista); return Object.keys(c).every(k => (lleva[k] || 0) >= c[k]); };
const cuentaIgual = (lista, lleva) => { const c = cuenta(lista); return Object.keys(lleva).every(k => c[k] === lleva[k]) && Object.keys(c).every(k => lleva[k]); };

function sirve(c) {
  const R = RECETAS[c.receta], frac = c.t / c.dur, propina = Math.round(CIFRAS.propinaMax * frac);
  const enOrden = CANTINA.comandas[0] === c;
  CANTINA.combo = enOrden ? Math.min(CIFRAS.comboMax, CANTINA.combo + 1) : 1;
  const mult = enOrden ? CANTINA.combo : 1, total = R.puntos + propina * mult;
  CANTINA.puntos += total; CANTINA.servidos++; SAVE.platos++;
  CANTINA.comandas.splice(CANTINA.comandas.indexOf(c), 1); J.mano = null;
  SONIDO.servido(); numero(J.x, J.y - 70, '+' + total, PALETA.Y); if (mult > 1) avisoCantina(tr('¡Combo x{n}!', { n: mult }), PALETA.G);
  chispas(J.x, J.y - 40, PALETA.Y, 10, 60);
  if (CANTINA.comandas.length < 2) nuevaComanda();
}

function avanzaServicio(dt) {
  CANTINA.t += dt;
  if (CANTINA.aviso) { CANTINA.aviso.t -= dt; if (CANTINA.aviso.t <= 0) CANTINA.aviso = null; }
  // modo tocar: tocar una estación es ir hasta ella y usarla al llegar; tocar el suelo, ir allí
  if (ENTRADA.toqueMundo) {
    const q = ENTRADA.toqueMundo, est = CANTINA.estaciones.find(e => q.x >= e.r[0] - 6 && q.x <= e.r[2] + 6 && q.y >= e.r[1] - 10 && q.y <= e.r[3] + 6);
    if (est) { const p = puntoJunto(est); CANTINA.objetivo = est; ENTRADA.destino = p ? { x: p[0], y: p[1] } : null; if (!p) CANTINA.objetivo = null; }
    else { CANTINA.objetivo = null; ENTRADA.destino = { x: q.x, y: q.y }; }
    J.atasco = 0;
  }
  avanzaJugador(dt);
  let accion = !!ENTRADA.ataquePulsa, usa = null;
  const obj = CANTINA.objetivo;
  if (obj && !ENTRADA.destino && distEstacion(obj) < 30) {
    mira((obj.r[0] + obj.r[2]) / 2 - J.x, (obj.r[1] + obj.r[3]) / 2 - (J.y - 6));
    usa = obj;
    if (!(obj.tipo === 'tabla' && obj.item && !obj.item.cortado && !J.mano)) { accion = true; CANTINA.objetivo = null; }   // en la tabla se queda cortando
  } else if (obj && !ENTRADA.destino) CANTINA.objetivo = null;
  CANTINA.cerca = usa || estacionCerca();
  // botón A: la acción de la estación; botón B mantenido en la tabla (o tocarla, en modo tocar): cortar
  if (accion) { const a = accionDe(CANTINA.cerca); if (a && a.hace) a.hace(); else if (a && a.no) { avisoCantina(a.txt, PALETA.R); SONIDO.no(); } }
  const e = CANTINA.cerca;
  const corta = ENTRADA.bloqueo || (usa && usa.tipo === 'tabla');
  if (corta && e && e.tipo === 'tabla' && e.item && !e.item.cortado && !J.mano) {
    e.item.progreso += dt / CIFRAS.cortarSeg; CANTINA.cortando = 0.1;
    if (e.item.progreso >= 1) { e.item.cortado = true; e.item.progreso = 1; SONIDO.cuchillo(); if (CANTINA.objetivo === e) CANTINA.objetivo = null; chispas(e.r[0] + 20, e.r[1], INGREDIENTES[e.item.que].luz, 6, 40); }
    else if (Math.floor(e.item.progreso * 8) !== Math.floor((e.item.progreso - dt / CIFRAS.cortarSeg) * 8)) SONIDO.golpeEnemigo();
  } else CANTINA.cortando = Math.max(0, CANTINA.cortando - dt);
  // los fuegos trabajan solos
  for (const f of CANTINA.estaciones) {
    if (f.tipo !== 'fuego') continue;
    if (f.estado === 'cocinando') { f.tt += dt; if (f.tt >= CIFRAS.cocinarSeg) { f.estado = 'hecha'; f.tt = 0; SONIDO.campana(); } }
    else if (f.estado === 'hecha') { f.tt += dt; const q = f.tt / CIFRAS.quemarSeg; if (q >= 1) { f.estado = 'quemada'; f.tt = 0; SONIDO.explota(); avisoCantina(tr('¡Se ha quemado!'), PALETA.R); } else if (Math.floor(q * 4) !== Math.floor((q - dt / CIFRAS.quemarSeg) * 4)) SONIDO.aviso(); }
  }
  // las comandas
  for (const c of CANTINA.comandas) c.t -= dt;
  const caducadas = CANTINA.comandas.filter(c => c.t <= 0);
  for (const c of caducadas) { CANTINA.comandas.splice(CANTINA.comandas.indexOf(c), 1); CANTINA.caducadas++; CANTINA.puntos = Math.max(0, CANTINA.puntos - CIFRAS.caducaPuntos); CANTINA.combo = 1; SONIDO.no(); avisoCantina(tr('{quien} se va sin comer (−{n})', { quien: tr(c.quien), n: CIFRAS.caducaPuntos }), PALETA.R); }
  CANTINA.proxima -= dt;
  if (CANTINA.proxima <= 0) { nuevaComanda(); CANTINA.proxima = CIFRAS.comandaCada; }
  // se acaba: por tiempo, o cuando no queda nada que pedir ni que cocinar
  const r = CIFRAS.servicioSeg - CANTINA.t;
  if (r <= 30.5 && r + dt > 30.5) { aviso(tr('¡30 segundos!'), 1.5, PALETA.Y); SONIDO.aviso(); }
  if (r <= 10.5 && r + dt > 10.5) { aviso(tr('¡10 segundos!'), 1.5, PALETA.R); SONIDO.aviso(); }
  const nadaQueHacer = !CANTINA.comandas.length && !recetasPosibles().length;
  if (nadaQueHacer) CANTINA.fin += dt; else CANTINA.fin = 0;
  if (r <= 0 || CANTINA.fin > 2.5) { JORNADA.oroDia = CANTINA.puntos; cierraJornada(); }
}
