// Fans of Ratkov · LOS MINIJUEGOS de la incursión (la ventana v-mini; el juego sigue mientras tanto, así que hay que darse prisa):
// - LA CERRADURA: cajas fuertes y algunos archivadores y cajas militares vienen cerrados. Una aguja gira y hay que tocar cuando pasa por
//   la zona dorada (dos o tres aciertos). Con frío las manos tiemblan: la aguja va a tirones y la zona se encoge. Fallar hace ruido (los
//   enemigos cercanos lo oyen). La palanca fuerza a la primera, pero suena como una alarma; la llave de despacho abre sin ruido y se gasta.
// - REBUSCAR: algunos cuerpos esconden algo (la bota, la capucha…). Se ve el cuerpo de verdad en 3D, de cerca, y hay que frotar con el
//   dedo encima del brillo, adelante y atrás, antes de que lleguen los pasos.
'use strict';
const MINI = { tipo: null, c: null, t: 0, cv: null, g: null };
const PREMIOS_ESCONDITE = [['tarjeta', 1], ['llave-despacho', 3], ['blizzcoin', 4], ['chip', 5], ['documentos', 5], ['inyector', 4], ['an-hielo', 1], ['an-rebote', 1], ['mando', 2]];
const SITIOS_ESCONDITE = { bota: [0.14, 0.12, 0.05], capucha: [0, 1.62, -0.05], bolsillo: [0.1, 1.15, 0.18], cinturon: [0, 0.86, 0.2], manga: [0.42, 1.1, 0] };
const NOMBRE_SITIO = { bota: 'la bota', capucha: 'la capucha', bolsillo: 'el bolsillo de dentro', cinturon: 'el cinturón', manga: 'la manga' };
// ¿esconde algo este cuerpo? (el Auditor, siempre; el resto, a veces)
function ponEscondite(c, tipo, seguro = false) {
  if (!seguro && tipo !== 'auditor' && !azar(0.3)) return;
  c.escondite = { sitio: pick(Object.keys(SITIOS_ESCONDITE)), premio: sorteo(PREMIOS_ESCONDITE.map(p => [p[0], p[1]])), tipo };
}

function abreMini(html) {
  const v = abreVentana('v-mini', cabecera(MINI.titulo, '') + html); enganchaCerrar(v, 'v-mini');
  v.querySelector('[data-cierra]').onclick = () => cierraMini();
  MINI.cv = v.querySelector('canvas.mini-cv'); MINI.g = MINI.cv.getContext('2d'); MINI.g.imageSmoothingEnabled = false;
  return v;
}
function cierraMini() { cierraVentana('v-mini'); MINI.tipo = null; MINI.c = null; }
const miniEstado = (t, clase) => { const e = document.querySelector('#v-mini .mini-estado'); if (e) { e.textContent = t; e.className = 'mini-estado ' + (clase || ''); } };
const miniBarra = (id, f) => { const e = document.getElementById(id); if (e) e.style.width = Math.round(f * 100) + '%'; };

/* ---------- LA CERRADURA ---------- */
function abreCerradura(c) {
  if (MINI.tipo) return;
  const L = { c, ang: 0, vel: 2.1, zona: 0, ancho: 0.7, aciertos: 0, necesita: (c.tipo === 'caja_fuerte' ? 3 : 2) - (SAVE.animal === 'junkcoon' ? 1 : 0),   // JunkCoon: un acierto menos
    temblor: 0, chispa: 0, fallo: 0, ruido: 0 };
  Object.assign(MINI, { tipo: 'cerradura', c, L, t: 0, titulo: tr('CERRADURA') });
  const tiene = id => cuantos(RAID.mochila, id) + cuantos(RAID.bolsillos, id) + cuantos(RAID.rinonera, id) > 0;
  let b = '<button type="button" class="grande" data-m="toca">' + esc(tr('¡AHORA!')) + '</button>';
  b += tiene('palanca') ? '<button type="button" class="mini" data-m="palanca">' + esc(tr('FORZAR CON PALANCA')) + '</button>' : '';
  b += tiene('llave-despacho') ? '<button type="button" class="mini bien" data-m="llave">' + esc(tr('USAR LLAVE')) + '</button>' : '';
  const v = abreMini('<canvas class="mini-cv" width="128" height="128"></canvas><p class="mini-estado"></p><div class="mini-barra">' + esc(tr('RUIDO')) + '<i class="barra"><i id="mini-ruido" style="background:var(--rk-mal)"></i></i></div><div class="mini-botones">' + b + '</div>');
  nuevaZona(L);
  MINI.cv.addEventListener('pointerdown', e => { e.preventDefault(); tocaCerradura(); });
  v.querySelectorAll('[data-m]').forEach(x => x.addEventListener('pointerdown', e => { e.preventDefault(); const m = x.dataset.m; if (m === 'toca') tocaCerradura(); if (m === 'palanca') abreLaCerradura('palanca'); if (m === 'llave') abreLaCerradura('llave'); }));
  miniEstado(JUG.frio > 50 ? tr('Tienes las manos heladas: caliéntate en un bidón.') : trf('Toca cuando la aguja pase por lo dorado (%1 aciertos).', L.necesita), JUG.frio > 50 ? 'mal' : 'oro');
}
function nuevaZona(L) {
  const f = Math.min(1, JUG.frio / 100);
  L.ancho = 0.78 - f * 0.48; L.zona = L.ang + Math.PI * (0.8 + Math.random() * 0.9); L.vel = (2.1 + L.aciertos * 0.5) * (Math.random() < 0.5 ? 1 : -1);
}
function tocaCerradura() {
  const L = MINI.L; if (!L || L.abierta) return;
  const d = Math.atan2(Math.sin(L.ang + L.temblor - L.zona), Math.cos(L.ang + L.temblor - L.zona));
  if (Math.abs(d) <= L.ancho / 2) {
    L.aciertos++; L.chispa = 0.5; play('select'); vibra(25);
    if (L.aciertos >= L.necesita) return abreLaCerradura();
    miniEstado(trf('¡CLIC! %1 DE %2', L.aciertos, L.necesita), 'oro'); nuevaZona(L);
  } else {
    L.fallo = 0.4; L.ruido = Math.min(1, L.ruido + 0.25); if (L.aciertos > 0) L.aciertos--; play('metal'); vibra([60, 40, 60]);
    oyeRuido(L.c.x, L.c.z, 8 + L.ruido * 14); miniEstado(tr('¡CLANK! Has hecho ruido.'), 'mal'); nuevaZona(L);
  }
}
function abreLaCerradura(como) {
  const L = MINI.L, c = L.c; L.abierta = true; c.cerradura = false;
  if (como === 'palanca') { oyeRuido(c.x, c.z, 34); temblor(0.3); avisa(tr('¡CRAAACK! Abierta… y todo el Distrito lo sabe.'), 'malo'); play('metal'); }
  else if (como === 'llave') { const l = [RAID.mochila, RAID.bolsillos, RAID.rinonera].map(li => li.find(o => o && o.id === 'llave-despacho')).find(Boolean); if (l) { l.dur = (l.dur || 1) - 1; if (l.dur <= 0) for (const li of [RAID.mochila, RAID.bolsillos, RAID.rinonera]) { const k = li.indexOf(l); if (k >= 0) li[k] = null; } compacta(RAID.mochila); compacta(RAID.rinonera); } avisa(tr('Abierta con la llave. Ni un ruido.'), 'bien'); play('puerta'); }
  else { avisa(tr('¡Abierta!'), 'bien'); play('puerta'); }
  cierraMini(); RAID.registro = null; RAID.tapReg = c; // y se pone a registrar sola
}
function pintaCerradura() {
  const L = MINI.L, g = MINI.g, f = Math.min(1, JUG.frio / 100), CX = 64, CY = 70, R = 25;
  const p = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  g.clearRect(0, 0, 128, 128);
  for (let a = Math.PI; a <= Math.PI * 2; a += 0.01) for (let r = 22; r <= 28; r++) p(CX + Math.cos(a) * r, 34 + Math.sin(a) * r * 0.9, 1, 1, r === 22 || r === 28 ? '#07090c' : '#9aa5b2');
  for (const x of [CX - 28, CX + 22]) { p(x, 34, 7, 12, '#07090c'); p(x + 1, 34, 5, 12, '#9aa5b2'); }
  const cuerpo = L.c.tipo === 'caja_fuerte' ? ['#5c6670', '#8a97a8', '#3a3f47'] : ['#c99a3a', '#f0c870', '#8a5a08'];
  p(CX - 46, 38, 92, 74, '#07090c'); p(CX - 44, 40, 88, 70, cuerpo[0]); p(CX - 44, 40, 88, 4, cuerpo[1]); p(CX - 44, 104, 88, 6, cuerpo[2]);
  for (let y = -R - 4; y <= R + 4; y++) for (let x = -R - 4; x <= R + 4; x++) {
    const d = Math.hypot(x, y); if (d > R + 4) continue;
    let col = d > R + 2 ? '#07090c' : d > R ? '#5c6670' : '#1a1f27';
    if (d <= R && d >= R - 8 && Math.abs(Math.atan2(Math.sin(Math.atan2(y, x) - L.zona), Math.cos(Math.atan2(y, x) - L.zona))) <= L.ancho / 2) col = '#f9c531';
    p(CX + x, CY + y, 1, 1, col);
  }
  for (let i = 0; i < L.necesita; i++) { const x = CX - 4 - (L.necesita - 1) * 5 + i * 10; p(x - 1, 101, 7, 7, '#07090c'); p(x, 102, 5, 5, i < L.aciertos ? '#5fd068' : '#3a2c18'); }
  const a = L.ang + L.temblor;
  for (let r = 0; r < R - 2; r++) p(CX + Math.cos(a) * r, CY + Math.sin(a) * r, 2, 2, L.fallo > 0 ? '#e0503c' : '#dfe6ee');
  p(CX - 3, CY - 3, 6, 6, '#07090c'); p(CX - 2, CY - 2, 4, 4, '#9aa5b2');
  if (L.chispa > 0) for (let i = 0; i < 8; i++) { const b = L.zona + (i - 4) * 0.12, r = R + 4 + (0.5 - L.chispa) * 30 + (i % 3) * 3; p(CX + Math.cos(b) * r, CY + Math.sin(b) * r, 2, 2, '#ffd27a'); }
  const n = Math.floor(f * 90);
  for (let i = 0; i < n; i++) { const s = (i * 7919) % 997 / 997, t = (i * 104729) % 991 / 991, lado = i % 4; p(lado === 0 ? s * 6 : lado === 1 ? 127 - s * 6 : t * 128, lado < 2 ? t * 128 : lado === 2 ? s * 6 : 127 - s * 6, 1 + (i % 2), 1, i % 3 ? '#cfe9ff' : '#8fd3ff'); }
}
function avanzaCerradura(dt) {
  const L = MINI.L, f = Math.min(1, JUG.frio / 100);
  L.ang += L.vel * (1 + f * 1.2 * Math.sin(MINI.t * 7.3) * Math.sin(MINI.t * 2.1)) * dt;
  L.temblor = f * 0.28 * (Math.sin(MINI.t * 41) * 0.6 + Math.sin(MINI.t * 23.7) * 0.4);
  L.chispa = Math.max(0, L.chispa - dt); L.fallo = Math.max(0, L.fallo - dt); L.ruido = Math.max(0, L.ruido - dt * 0.06);
  miniBarra('mini-ruido', L.ruido); pintaCerradura();
}

/* ---------- REBUSCAR ---------- */
// el cuerpo de verdad en 3D, tumbado y visto desde arriba, con el contorno del juego; y dónde cae cada escondite en la imagen
const VISTA_CUERPO = {};
function vistaCuerpo(tipo) {
  if (VISTA_CUERPO[tipo]) return VISTA_CUERPO[tipo];
  const N = 128, rt = new THREE.WebGLRenderTarget(N, N), esc3 = new THREE.Scene(), p = montaPersonaje(tipo, false);
  ponArma(p, null); const alto = tipo === 'auditor' ? 5.6 : 3.7;
  p.grupo.rotation.x = -Math.PI / 2; p.grupo.rotation.z = 0.35; p.grupo.position.z = alto * 0.3; esc3.add(p.grupo);
  esc3.add(new THREE.HemisphereLight(0xdfe8f4, 0x50586a, 1.0)); const s = new THREE.DirectionalLight(0xffffff, 0.55); s.position.set(-3, 8, 2); esc3.add(s);
  const cam = new THREE.OrthographicCamera(-alto / 2, alto / 2, alto / 2, -alto / 2, 0.1, 50); cam.position.set(0, 10, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0);
  esc3.updateMatrixWorld(true);
  MOTOR.r.setRenderTarget(rt); MOTOR.r.setClearColor(0x000000, 0); MOTOR.r.clear(); MOTOR.r.render(esc3, cam); MOTOR.r.setRenderTarget(null); MOTOR.r.setClearColor(0x000000, 1);
  const px = new Uint8Array(N * N * 4); MOTOR.r.readRenderTargetPixels(rt, 0, 0, N, N, px); rt.dispose();
  const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), img = g.createImageData(N, N), d = img.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const a = ((N - 1 - y) * N + x) * 4, b = (y * N + x) * 4; for (let i = 0; i < 4; i++) d[b + i] = px[a + i]; }
  const lleno = i => d[i * 4 + 3] > 10, borde = [];
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; if (!lleno(i) && (lleno(i - 1) || lleno(i + 1) || lleno(i - N) || lleno(i + N))) borde.push(i); }
  for (const i of borde) { d[i * 4] = 18; d[i * 4 + 1] = 14; d[i * 4 + 2] = 24; d[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  const puntos = {}, k = tipo === 'auditor' ? 1.5 : 1;
  for (const [n, [x, y, z]] of Object.entries(SITIOS_ESCONDITE)) { const v = p.grupo.localToWorld(new THREE.Vector3(x * k, y * k, z * k)).project(cam); puntos[n] = [(v.x + 1) / 2 * N, (1 - v.y) / 2 * N]; }
  return (VISTA_CUERPO[tipo] = { c, puntos });
}
function abreRebuscar(c) {
  if (MINI.tipo || !c.escondite || c.escondite.hecho) return;
  const E = c.escondite, vista = vistaCuerpo(E.tipo || 'carronero');
  Object.assign(MINI, { tipo: 'rebuscar', c, t: 0, titulo: tr('REBUSCAR'), R: { busca: 0, pasos: 0, fin: false, tierra: [], ultimo: null, dir: 0, vista, punto: vista.puntos[E.sitio] } });
  const v = abreMini('<canvas class="mini-cv" width="128" height="128"></canvas><p class="mini-estado"></p><div class="mini-barra">' + esc(tr('REBUSCAR')) + '<i class="barra"><i id="mini-busca" style="background:var(--rk-oro)"></i></i></div><div class="mini-barra">' + esc(tr('PASOS')) + '<i class="barra"><i id="mini-pasos" style="background:var(--rk-mal)"></i></i></div><div class="mini-premio"></div><div class="mini-botones"><button type="button" class="mini" data-m="pasa">' + esc(tr('PASAR DE LARGO')) + '</button></div>');
  miniEstado(trf('Algo abulta en %1. Frota encima, adelante y atrás.', tr(NOMBRE_SITIO[E.sitio])), 'oro');
  const cv = MINI.cv, R = MINI.R, enDibujo = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 128, (e.clientY - r.top) / r.height * 128]; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); R.ultimo = enDibujo(e); });
  cv.addEventListener('pointermove', e => {
    if (!R.ultimo || R.fin) return;
    const [x, y] = enDibujo(e), [x0, y0] = R.ultimo; R.ultimo = [x, y];
    if (Math.hypot(x - R.punto[0], y - R.punto[1]) > 18) return;
    const dir = Math.sign(x - x0); let gana = Math.hypot(x - x0, y - y0) * 0.0028; if (dir && dir !== R.dir) { gana += 0.014; R.dir = dir; }
    R.busca = Math.min(1, R.busca + gana * (SAVE.animal === 'junkcoon' ? 1.6 : 1)); if (Math.random() < 0.5) R.tierra.push({ x, y, vx: entre(-30, 30), vy: entre(-60, -20), t: 0.6 });
    if (Math.random() < 0.08) play('registra');
    if (R.busca >= 1) sacaEscondite();
  });
  const suelta = () => { R.ultimo = null; }; cv.addEventListener('pointerup', suelta); cv.addEventListener('pointercancel', suelta);
  v.querySelector('[data-m="pasa"]').onclick = () => { c.escondite.hecho = true; cierraMini(); pintaBotin(); };
}
function sacaEscondite() {
  const R = MINI.R, c = MINI.c, id = c.escondite.premio, n = 1;
  R.fin = true; c.escondite.hecho = true;
  const o = nuevoObj(id, n); if (!RAID.tuto) o.fir = true;
  if (!c.dim) c.dim = dimContenedor(c);
  while (!sitioPara(c.cosas, c.dim, o.id) && c.dim.h < 40) c.dim.h++;
  Object.assign(o, sitioPara(c.cosas, c.dim, o.id)); c.cosas.splice(c.vistos || 0, 0, o); c.vistos = (c.vistos || 0) + 1;
  miniEstado(tr('¡LO TIENES! Está en el cuerpo: arrástralo a tu mochila.'), 'bien'); play(OBJ[id].r >= 3 ? 'raro' : 'coge');
  const p = document.querySelector('#v-mini .mini-premio'); if (p) p.innerHTML = filaObj(o, '');
  setTimeout(() => { if (MINI.tipo === 'rebuscar') { cierraMini(); pintaBotin(); } }, 1400);
}
function pintaRebuscar() {
  const R = MINI.R, g = MINI.g, p = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
  p(0, 0, 128, 128, '#d6dee8'); for (let i = 0; i < 60; i++) p((i * 37) % 128, (i * 53 + 11) % 128, 2, 1, '#e8eef4');
  g.drawImage(R.vista.c, 0, 0);
  if (!R.fin) {
    const [sx, sy] = R.punto, b = 0.5 + Math.sin(MINI.t * 6) * 0.5;
    for (let r = 14; r >= 4; r -= 2) { g.globalAlpha = 0.08 + b * 0.1; p(sx - r, sy - r, r * 2, r * 2, '#ffd27a'); } g.globalAlpha = 1;
    const n = Math.floor(R.busca * 32); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2 - Math.PI / 2; p(sx + Math.cos(a) * 15, sy + Math.sin(a) * 15, 2, 2, i < n ? '#f9c531' : 'rgba(7,9,12,.35)'); }
    if (Math.floor(MINI.t * 4) % 2) { p(sx - 1, sy - 5, 2, 3, '#fff2b0'); p(sx + 4, sy + 1, 2, 2, '#fff2b0'); }
  }
  for (const q of R.tierra) p(q.x, q.y, 2, 2, '#f4f8fc');
  if (R.pasos > 0.35) { const y = 128 - (R.pasos - 0.35) / 0.65 * 26; p(110, y, 10, 8, '#07090c'); p(111, y + 1, 8, 6, '#2b313a'); p(98, y + 6, 10, 8, '#07090c'); p(99, y + 7, 8, 6, '#2b313a'); }
}
function avanzaRebuscar(dt) {
  const R = MINI.R;
  if (!R.fin && !RAID.tuto) { R.pasos = Math.min(1, R.pasos + dt / 8); if (R.pasos >= 1) { R.fin = true; MINI.c.escondite.hecho = true; oyeRuido(JUG.x, JUG.z, 26); miniEstado(tr('¡Te han oído! El escondite se queda cerrado.'), 'mal'); play('alarma'); setTimeout(() => { if (MINI.tipo === 'rebuscar') cierraMini(); }, 1200); } }
  for (const q of R.tierra) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt; } R.tierra = R.tierra.filter(q => q.t > 0);
  miniBarra('mini-busca', R.busca); miniBarra('mini-pasos', R.pasos); pintaRebuscar();
}

// cada fotograma (desde la incursión): si te alejas, se cierra
function avanzaMini(dt) {
  if (!MINI.tipo) return; if (el('v-mini').hidden) { MINI.tipo = null; return; }
  MINI.t += dt;
  if (MINI.c && lejos(JUG.x, JUG.z, MINI.c.x, MINI.c.z) > 2.8) return cierraMini();
  const f = { cerradura: avanzaCerradura, rebuscar: avanzaRebuscar, trampa: avanzaTrampa, puente: avanzaPuente }[MINI.tipo]; if (f) f(dt);   // el terminal no se mueve solo
}
// en el ordenador: la tecla de registrar (E) para la cerradura. Espacio no: esa es esquivar
window.addEventListener('keydown', e => {
  if (MINI.tipo !== 'cerradura' || !teclasDe('accion').includes(e.code)) return;
  e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) tocaCerradura();
}, true);
