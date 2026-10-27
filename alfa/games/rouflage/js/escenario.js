// Fans of Rouflage · MI ESCENARIO (el editor): tu escenario es un mapa grande como los del juego (escenario-mundo.js), donde paseas con tu
// galleta vestida con lo del armario (la cámara te sigue), lo decoras con tus muebles y lo pintas. Abajo, la BANDEJA (escenario-bandeja.js):
// Muebles, Plantas, Decoración (tocas una tarjeta y el mueble sale donde miras, o la arrastras al suelo), Escenario (el escenario base: el
// estilo y la forma del mapa) y Pintar (escenario-pincel.js). Al tocar un mueble puesto sale su burbuja (mover, voltear, color, quitar).
// El ARMARIO está en tu escenario para cambiarte de ropa. La cámara (arrastrar, zoom con dos dedos o la rueda) está en escenario-camara.js.
// Se guarda solo en SAVE.escenario ({ v: 2, id, m: [[mueble, x, y, variante, volteado]], p: la pintura en texto, yo: [x, y] }); la nube ya sube SAVE.
'use strict';
const MIESC = { abierto: false, modo: 'decorar', tab: 'muebles', sala: null, sel: null, poner: null, drag: null, sucio: true, vista: { ox: 0, oy: 0, k: 1, dpr: 1 },
  cam: { x: 0, y: 0, z: 1, sigue: true }, yo: null, camino: null, teclas: new Set(), ropa: null, t: 0, ult: 0, puntero: null, avisoT: 0, pops: [], chispas: [], cerca: false, alArmario: false };
Object.assign(ICONOS, {
  mueble: '<path d="M7 3.5h10v8H7z"/><path d="M5 11.5h14v3H5zM6.5 14.5V21M17.5 14.5V21"/>',
  planta: '<path d="M12 21v-8"/><path d="M12 13c-5 0-7-3-7-8 4 0 7 2 7 8zM12 11c0-4 2-7 7-7 0 5-3 7-7 7z" fill="currentColor"/><path d="M8 21h8"/>',
  deco: '<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>',
  goma: '<path d="M14.5 4.5l5 5-9 9H6l-2.5-2.5z"/><path d="M9.5 9.5l5 5" /><path d="M10.5 18.5H20"/>',
  voltear: '<path d="M12 3v18" stroke-dasharray="2 2.6"/><path d="M9 7 3.5 17H9zM15 7l5.5 10H15z" fill="currentColor"/>',
  quitar: '<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5"/><path d="M6.5 6.5l1 13.5h9l1-13.5M10 10v6.5M14 10v6.5"/>',
  paleta: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.4-2-.5-1.3.3-2.5 1.7-2.5h2.2a3.2 3.2 0 0 0 3.2-3.2C20.5 7.6 16.7 3.5 12 3.5z"/><circle cx="8" cy="10" r="1.3" fill="currentColor"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor"/><circle cx="16" cy="10" r="1.3" fill="currentColor"/>',
  escoba: '<path d="M19 3l-7 8"/><path d="M12.5 10.5l3 3-2 6.5c-3.5.3-7.5-1.4-10-4.5l5-4z"/><path d="M8 15.5l-2 2.5M11 17l-1.5 2.5"/>',
  bolsa: '<path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
  sala: '<path d="M3.5 20.5V9l8.5-5.5L20.5 9v11.5z"/><path d="M9.5 20.5v-6h5v6"/>',
  hecho: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="3.2"/>',
  mas: '<path d="M12 5v14M5 12h14" stroke-width="3.2"/>',
  menos: '<path d="M5 12h14" stroke-width="3.2"/>',
  centrar: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
  armario: '<path d="M5 3.5h14v17H5z"/><path d="M12 3.5v17M10 11h.01M14 11h.01" stroke-width="2.6"/><path d="M5 20.5v1M19 20.5v1"/>',
});

/* ---------- el escenario del jugador ---------- */
const escTiene = (cat, id) => { const it = arItem(cat, id); return !!it && arTiene(cat, it); };
function escenarioActual() { const s = SAVE.escenario; return s && ESCENARIOS[s.id] && escTiene('escenarios', s.id) ? s.id : 'oficina'; }
// lo de dentro (para dibujar y editar), hecho de SAVE.escenario; lo que ya no es tuyo no sale. Lo de la sala pequeña de antes se pasa al mapa grande
function escenarioSala() {
  if (MIESC.sala) return MIESC.sala;
  const s = SAVE.escenario || {}, viejo = s.v !== 2 && ((s.m && s.m.length) || s.p);
  const d = salaDeDatos({ v: s.v, e: escenarioActual(), m: s.m || [], p: s.p, lz: s.lz, g: s.g }) || { id: 'oficina', muebles: [], pint: null, ver: 0 };
  if (escBase(d.id) === 'lienzo') d.id = lzMio();      // el lienzo propio se edita como 'lienzo~mio' (escenario-obra.js)
  d.muebles = d.muebles.filter(m => escTiene('muebles', m.id));
  d.pint = !d.pint ? pinturaNueva() : d.pint.r === SALA.PR ? d.pint : pinturaRemuestra(d.pint, SALA.PR);
  MIESC.sala = d;
  if (viejo) escGuarda();
  return d;
}
const escMundoAct = () => escMundo(escenarioSala().id);
function escGuarda() {
  const sala = escenarioSala(), yo = MIESC.yo;
  let p = pinturaCodifica(sala.pint);
  for (const r of [4, 8, 12]) if (p.length > 30000) p = pinturaCodifica(pinturaRemuestra(sala.pint, r));      // la partida no engorda: como mucho ~30 KB de pintura
  SAVE.escenario = { v: 2, id: escBase(sala.id), m: sala.muebles.map(m => [m.id, Math.round(m.x), Math.round(m.y), m.v || 0, m.f ? 1 : 0]), p };
  const lz = lzMioTexto(); if (lz) SAVE.escenario.lz = lz;
  if (sala.peg && sala.peg.length) SAVE.escenario.g = pegADatos(sala.peg);      // las pegatinas (escenario-pegatinas.js)      // la forma de tu lienzo se guarda aunque ahora uses otro escenario
  if (yo) SAVE.escenario.yo = [Math.round(yo.x), Math.round(yo.y)];
  guardaPartida();
}
// algo de los muebles ha cambiado: el camino y lo que se enseña se recalculan
function escCambio() { const s = escenarioSala(); s.ver = (s.ver || 0) + 1; s._centro = null; MIESC.sucio = true; }

/* ---------- abrir, cerrar y el bucle ---------- */
function abreEscenario(conMueble) {
  if (MIESC.sala && escBase(MIESC.sala.id) !== escenarioActual()) MIESC.sala = null;      // volviendo del armario o del gachapón con otro escenario
  const sala = escenarioSala(), M = escMundo(sala.id);
  MIESC.abierto = true; MIESC.sel = null; MIESC.poner = null; MIESC.drag = null; MIESC.camino = null; MIESC.alArmario = false; MIESC.toques && MIESC.toques.clear();
  MIESC.ropa = ropaDe();
  if (!MIESC.yo || MIESC.yo.mundo !== M.id) {
    const g = (SAVE.escenario || {}).yo, [x, y] = Array.isArray(g) && escLibre(sala, M, g[0], g[1]) ? g : M.salida;
    MIESC.yo = { x, y, dir: 1, anda: 0, paso: 0, mundo: M.id };
    Object.assign(MIESC.cam, { x, y: y - 30, sigue: true, z: 0 });
  }
  pantalla('p-escenario'); escHuecoBoton(); escAjusta(); escModo(MIESC.modo, true); musica('rfTitulo');      // (MIS ESCENARIOS: escenario-huecos.js)
  if (conMueble) { const it = arItem('muebles', conMueble); if (it && arTiene('muebles', it)) { MIESC.tab = MUEBLES_SALA[it.id].g; escModo('decorar', true); escPonDondeMiras(it); } }
  cancelAnimationFrame(MIESC.raf); MIESC.ult = performance.now(); MIESC.raf = requestAnimationFrame(escBucle);
}
function cierraEscenario() { if (SEL_ESC.s) escSelSuelta(); if (MIESC.yo) escGuarda(); if (typeof escPublica === 'function') escPublica();      // tus amigos lo verán así (visita.js)
  MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); E('esc-burbuja').hidden = true; play('select'); irTitulo(); }
const escenarioAbierto = () => MIESC.abierto;
function escAbreArmario() { if (!MIESC.abierto) return; play('select'); escGuarda(); if (typeof escPublica === 'function') escPublica(); MIESC.abierto = false; cancelAnimationFrame(MIESC.raf); E('esc-burbuja').hidden = true; abreArmario(null, 'escenario'); }
function escBucle(ahora) {
  if (!MIESC.abierto) return;
  const dt = Math.min(0.05, (ahora - MIESC.ult) / 1000 || 0); MIESC.ult = ahora; MIESC.t += dt;
  MIESC.pops = MIESC.pops.filter(p => MIESC.t - p.t0 < 0.35);
  for (const q of MIESC.chispas) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; q.vida -= dt; }
  MIESC.chispas = MIESC.chispas.filter(q => q.vida > 0);
  const anda = escAnda(dt), mueve = escCamaraAvanza(dt);
  const anima = anda || mueve || MIESC.pops.length || MIESC.chispas.length || (ESCENARIOS[escBase(escenarioSala().id)] || {}).zumbido || MIESC.modo === 'pasear' || (typeof OBRA !== 'undefined' && !!OBRA.malas);
  if (MIESC.sucio || anima) { MIESC.sucio = escDibuja() > 0; }
  if (MIESC.avisoT && ahora > MIESC.avisoT) { MIESC.avisoT = 0; E('esc-aviso').classList.remove('ve'); }
  MIESC.raf = requestAnimationFrame(escBucle);
}
// la rejilla suave y la huella (verde si cabe, roja si no) del mueble que estás colocando
function escPintaHuella(c, m, cabe) {
  const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t], gx = Math.round(m.x / CEL) * CEL, gy = Math.round(m.y / CEL) * CEL;
  c.save();
  const gr = c.createRadialGradient(m.x, m.y - T.d / 2, 10, m.x, m.y - T.d / 2, 120); gr.addColorStop(0, 'rgba(255,246,234,0.35)'); gr.addColorStop(1, 'rgba(255,246,234,0)');
  c.strokeStyle = gr; c.lineWidth = 1.2; c.beginPath();
  for (let x = gx - 120; x <= gx + 120; x += CEL) { c.moveTo(x, gy - 120); c.lineTo(x, gy + 120); }
  for (let y = gy - 120; y <= gy + 120; y += CEL) { c.moveTo(gx - 120, y); c.lineTo(gx + 120, y); }
  c.stroke(); c.restore();
  c.fillStyle = cabe ? 'rgba(126,224,74,0.35)' : 'rgba(255,75,92,0.4)'; c.strokeStyle = cabe ? '#7ee04a' : '#ff4b5c'; c.lineWidth = 2.5;
  c.beginPath(); rrPathRF(c, m.x - T.w / 2 - 3, m.y - T.d, T.w + 6, T.d + 4, 6); c.fill(); c.stroke();
}
function escDibuja() {
  const cv = E('esc-lienzo'), c = cv.getContext('2d'), sala = escenarioSala(), M = escMundo(sala.id), v = escVista(), dpr = v.dpr;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0f1c'; c.fillRect(0, 0, cv.width, cv.height);
  const s = v.k * dpr, ox = v.ox * dpr, oy = v.oy * dpr;
  const faltan = escPintaFondo(c, sala, M, { s, ox, oy, w: cv.width, h: cv.height });
  c.setTransform(s, 0, 0, s, ox, oy);
  const R = { x0: -ox / s - 60, y0: -oy / s - 60, x1: (cv.width - ox) / s + 60, y1: (cv.height - oy) / s + 140 }, kc = escKs(s), d = MIESC.drag;
  pegPintaSala(c, sala, R);      // las pegatinas, pegadas al suelo y a las paredes (escenario-pegatinas.js)
  if (d && d.movido) escPintaHuella(c, d.m, escCabeEn(sala, d.m));
  const pops = {}; for (const p of MIESC.pops) { const q = (MIESC.t - p.t0) / 0.35; pops[sala.muebles.indexOf(p.m)] = 1 + Math.sin(q * Math.PI) * 0.22 * (1 - q); }
  const pers = [{ y: M.armario.y, pinta: g => escPintaArmario(g, M.armario, MIESC.t, MIESC.cerca) }];
  if (MIESC.yo) pers.push({ y: MIESC.yo.y, pinta: escPintaYo });
  salaPintaCosas(c, sala, R, { k: kc, personajes: pers, sel: MIESC.modo === 'decorar' ? MIESC.sel : null, pops });
  salaZumbido(c, sala, R, MIESC.t);
  escPintaChispas(c);
  const pt = MIESC.puntero;
  if (MIESC.modo === 'decorar' && MIESC.poner && pt && escEnSuelo(pt)) {      // el mueble que vas a poner, en fantasma con su huella
    const Mu = MUEBLES_SALA[MIESC.poner.id], sp = muebleSprite(Mu.t, 0, kc), m = { id: MIESC.poner.id, x: pt.x, y: pt.y };
    escPintaHuella(c, m, escCabeEn(sala, m));
    c.globalAlpha = 0.7; c.drawImage(sp.cv, m.x - sp.ox, m.y - sp.oy, sp.w, sp.h); c.globalAlpha = 1;
  }
  if (MIESC.modo === 'pintar' && typeof escPintaCursor === 'function') escPintaCursor(c, pt);      // (sin dedo encima también: la rejilla, el espejo y lo seleccionado)
  if (typeof obraPintaEncima === 'function' && (MIESC.modo === 'obra' || OBRA.malas)) obraPintaEncima(c, pt);      // CONSTRUIR (escenario-obra.js)
  const fin = MIESC.camino && MIESC.camino[MIESC.camino.length - 1];
  if (fin) { c.strokeStyle = 'rgba(255,246,234,0.85)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(fin[0], fin[1], 11 + Math.sin(MIESC.t * 6), 5, 0, 0, TAU); c.stroke(); }
  escColocaBurbuja();
  return faltan;
}
// las chispas al poner un mueble (estrellitas de colores) o el polvo al quitarlo
function escChispas(m, polvo) {
  const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t], cy = m.y - Math.min(30, (T.d + T.h) / 2);
  for (let i = 0; i < (polvo ? 9 : 12); i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * (polvo ? 3 : 2.6), v = (polvo ? 50 : 120) + Math.random() * 90;
    MIESC.chispas.push({ x: m.x + (Math.random() - 0.5) * T.w * 0.6, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (polvo ? 0 : 40), vida: 0.5 + Math.random() * 0.35,
      col: polvo ? '#cdb9ea' : ['#ffcb3d', '#ff6fb5', '#39d5e8', '#7ee04a', '#fff6ea'][i % 5], r: polvo ? 5 + Math.random() * 4 : 3 + Math.random() * 2.5, polvo });
  }
}
function escPintaChispas(c) {
  for (const q of MIESC.chispas) {
    c.globalAlpha = Math.min(1, q.vida / 0.3);
    if (q.polvo) { c.fillStyle = q.col; c.beginPath(); c.arc(q.x, q.y, q.r * (1.6 - q.vida), 0, TAU); c.fill(); continue; }
    c.beginPath(); starPath(c, q.x, q.y, q.r * 1.7, q.r * 0.75); c.fillStyle = q.col; c.fill(); c.lineWidth = 1.4; c.strokeStyle = OL; c.stroke();
  }
  c.globalAlpha = 1;
}
function escAviso(txt) { const a = E('esc-aviso'); a.textContent = txt; a.classList.add('ve'); MIESC.avisoT = performance.now() + 2600; }

/* ---------- los muebles ---------- */
const escEnSuelo = p => escTipoEn(escMundoAct(), p.x, p.y) === SUELO;
// el mueble dentro del mapa (si cabe o no lo dice la huella)
function escLimita(m) { const M = escMundoAct(); m.x = limita(m.x, 30, M.W - 30); m.y = limita(m.y, 40, M.H - 10); return m; }
// qué mueble hay bajo el dedo: con margen (unos 22 px de pantalla, para el pulgar) y, si no hay ninguno, el más cercano a menos de 40 px
function escMuebleEn(p) {
  const lista = escenarioSala().muebles.slice().sort((a, b) => b.y - a.y), z = MIESC.cam.z || 1, mg = Math.max(6, 22 / z);
  const dentro = lista.find(m => { const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t]; return p.x > m.x - T.w / 2 - mg && p.x < m.x + T.w / 2 + mg && p.y > m.y - (T.tope || T.d + T.h) - mg && p.y < m.y + mg; });
  if (dentro) return dentro;
  let mejor = null, dm = 40 / z;
  for (const m of lista) { const T = TIPOS_MUEBLE[MUEBLES_SALA[m.id].t], d = Math.hypot(p.x - m.x, p.y - (m.y - (T.tope || T.d + T.h) / 2)); if (d < dm) { dm = d; mejor = m; } }
  return mejor;
}
const escEnArmario = p => { const a = escMundoAct().armario; return Math.abs(p.x - a.x) < 34 && p.y > a.y - 96 && p.y < a.y + 8; };
// pone un mueble nuevo en p (o en el hueco libre más cercano, si está a mano): con su «pop», sus chispas y marcado
function escPon(it, p, lejos = 90) {
  const sala = escenarioSala();
  if (sala.muebles.length >= SALA.MAX_MUEBLES) { play('deny'); escAviso(tr('Ya no caben más muebles: quita alguno')); return null; }
  if (muebleQuedan(sala, it.id) <= 0) { muebleSinUnidades(it); return null; }      // sin unidades (muebles-unidades.js)
  const m = escLimita({ id: it.id, x: Math.round(p.x), y: Math.round(p.y), v: 0, f: 0 });
  if (!escCabeEn(sala, m)) { const h = escHueco(sala, m, m.x, m.y, lejos); if (!h) { play('deny'); escAviso(tr('Ahí no cabe: busca un hueco libre')); return null; } [m.x, m.y] = h; }
  sala.muebles.push(m); MIESC.pops.push({ m, t0: MIESC.t }); escChispas(m); MIESC.sel = m; play('pop'); escCambio(); escGuarda(); escBandeja();
  return m;
}
// tocar una tarjeta: el mueble sale donde miras (en el hueco libre más cercano al centro de la pantalla)
function escPonDondeMiras(it) {
  const c = MIESC.cam, yo = MIESC.yo, p = { x: c.x, y: c.y + 20 };
  if (yo && Math.hypot(p.x - yo.x, p.y - yo.y) < 60) p.x = yo.x + (yo.x + 70 < escMundoAct().W - 40 ? 70 : -70);      // nunca encima de tu galleta: a su lado
  const m = escPon(it, p, 700);
  if (m && MIESC.modo === 'decorar') escAviso(tr('Arrástralo a donde quieras'));
  return m;
}
function escEmpiezaArrastre(m, p) { MIESC.sel = m; MIESC.drag = { m, dx: m.x - p.x, dy: m.y - p.y, x0: m.x, y0: m.y, movido: false }; E('esc-burbuja').hidden = true; }
function escArrastra(p) {
  const d = MIESC.drag; if (!d) return;
  const nx = p.x + d.dx, ny = p.y + d.dy;
  if (d.movido || Math.hypot(nx - d.x0, ny - d.y0) > 4) { d.m.x = Math.round(nx); d.m.y = Math.round(ny - (d.levanta || 0)); escLimita(d.m); d.movido = true; }      // con el dedo, un poco por encima para verlo
  MIESC.sucio = true;
}
function escSuelta() {
  const d = MIESC.drag; MIESC.drag = null; if (!d) return;
  if (d.movido) {
    const sala = escenarioSala();
    if (escCabeEn(sala, d.m)) { MIESC.pops.push({ m: d.m, t0: MIESC.t }); escChispas(d.m); play('pop'); escCambio(); escGuarda(); }
    else { d.m.x = d.x0; d.m.y = d.y0; play('deny'); escAviso(tr('Ahí no cabe: busca un hueco libre')); }
  }
  MIESC.sucio = true;
}
// cambiar el escenario base: el estilo y la forma del mapa; lo que no quepa en la forma nueva se va al hueco más cercano
function escCambiaBase(id) {
  const sala = escenarioSala(); if (escBase(sala.id) === id) return;
  if (id === 'lienzo') id = lzMio();      // tu lienzo, como lo dejaste (escenario-obra.js)
  sala.id = id; const M = escMundo(id), n = escRecoloca(sala); escCambio(); escTilesFuera(sala);
  const yo = MIESC.yo; if (yo && !escLibre(sala, M, yo.x, yo.y)) { [yo.x, yo.y] = M.salida; Object.assign(MIESC.cam, { x: yo.x, y: yo.y - 30 }); }
  if (yo) yo.mundo = M.id; MIESC.camino = null;
  play('pop'); escGuarda(); escBandeja();
  if (n) escAviso(tr('{n} muebles no cabían y se han movido al hueco más cercano', { n }));
}

/* ---------- pasear ---------- */
function escVaA(x, y, alArmario) {
  const sala = escenarioSala(), M = escMundo(sala.id), yo = MIESC.yo; if (!yo) return;
  const c = escCamino(sala, M, yo.x, yo.y, x, y);
  MIESC.camino = c && c.length ? c : null; MIESC.alArmario = !!(alArmario && MIESC.camino); MIESC.cam.sigue = true;
  if (!MIESC.camino && alArmario) escAbreArmario();
}
function escAnda(dt) {
  const yo = MIESC.yo; if (!yo) return false;
  const sala = escenarioSala(), M = escMundo(sala.id), K = MIESC.teclas;
  let vx = 0, vy = 0;
  if (MIESC.modo === 'pasear') {
    if (K.has('ArrowLeft') || K.has('a')) vx--; if (K.has('ArrowRight') || K.has('d')) vx++; if (K.has('ArrowUp') || K.has('w')) vy--; if (K.has('ArrowDown') || K.has('s')) vy++;
    const pv = escPalancaVector(); if (pv) [vx, vy] = pv;      // la palanca del dedo (escenario-palanca.js)
  }
  if (vx || vy) { MIESC.camino = null; MIESC.alArmario = false; MIESC.cam.sigue = true; }
  else if (MIESC.camino) {
    const [tx, ty] = MIESC.camino[0], dx = tx - yo.x, dy = ty - yo.y, d = Math.hypot(dx, dy);
    if (d < 5) { MIESC.camino.shift(); if (!MIESC.camino.length) { MIESC.camino = null; if (MIESC.alArmario) { MIESC.alArmario = false; escAbreArmario(); } } }
    else { vx = dx / d; vy = dy / d; }
  }
  const a = M.armario, cerca = lejos(yo.x, yo.y, a.x, a.y) < 80;
  if (cerca !== MIESC.cerca) { MIESC.cerca = cerca; E('b-esc-armario').classList.toggle('cerca', cerca); if (cerca && MIESC.modo === 'pasear') escAviso(tr('Toca el armario para cambiarte de ropa')); MIESC.sucio = true; }
  const l = Math.hypot(vx, vy);
  if (!l) { if (yo.anda > 0) { yo.anda = Math.max(0, yo.anda - dt * 6); return true; } return false; }
  const v = 170 * dt / l, nx = yo.x + vx * v, ny = yo.y + vy * v;
  if (escLibre(sala, M, nx, ny)) { yo.x = nx; yo.y = ny; } else if (escLibre(sala, M, nx, yo.y)) yo.x = nx; else if (escLibre(sala, M, yo.x, ny)) yo.y = ny; else if (!MIESC.camino) { yo.anda = 0; return false; }
  if (Math.abs(vx) > 0.2) yo.dir = vx > 0 ? 1 : -1;
  yo.anda = Math.min(1, yo.anda + dt * 6); yo.paso = (yo.paso || 0) + dt * 11;
  return true;
}
// escPintaYo (la galleta, con el cuerpo de la partida): escenario-palanca.js

function preparaEscenario() {
  PANTALLAS.push('p-escenario');
  E('b-escenario').onclick = () => { play('select'); abreEscenario(); };
  E('b-esc-volver').onclick = cierraEscenario;
  E('b-esc-pasear').onclick = () => escModo(MIESC.modo === 'pasear' ? 'decorar' : 'pasear');
  E('b-esc-clase').onclick = escCambiaClase;
  E('b-esc-armario').onclick = escAbreArmario;
  preparaCamaraEsc(); preparaBandejaEsc(); preparaPincelEsc();
}
