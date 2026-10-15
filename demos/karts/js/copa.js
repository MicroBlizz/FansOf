// Fans of Karts · MUNDOS, PISTAS Y MODO COPA: la pantalla de elegir mundo (cuatro copas de cuatro pistas), la de elegir pista dentro
// del mundo (con el paisaje de la pista en movimiento) y la copa: las cuatro carreras seguidas con puntos, la clasificación entre
// carrera y carrera y el podio final. El mejor puesto de cada copa se guarda en este navegador.
'use strict';

const MUNDOS = [
  { nombre: 'ACCESO ANTICIPADO', lema: 'Para empezar. Todo funciona a medias, como en cualquier acceso anticipado.', color: '#2fb0d8', oscuro: '#164a66', fig: 'palmera' },
  { nombre: 'PASE DE BATALLA', lema: 'Cuatro pistas para farmear. El nivel 100 se desbloquea pagando.', color: '#e0a050', oscuro: '#6a3a14', fig: 'cactus' },
  { nombre: 'SERVIDORES CAÍDOS', lema: 'Hielo, lag, lava y la Nube. Nada de esto tiene copia de seguridad.', color: '#8a7ae8', oscuro: '#2a2060', fig: 'pino' },
  { nombre: 'REMASTER', lema: 'Las pistas más difíciles. Las de siempre, pero a 69,99 €.', color: '#e63946', oscuro: '#5a1020', fig: 'estatua' },
];
const PUNTOS_COPA = [15, 12, 10, 8, 6, 4, 2, 1];
const COPA = { activa: false, mundo: 0, n: 0, puntos: {}, ultimos: {} };
const pistasDe = m => PISTAS.filter(p => p.mundo === m + 1);
let RECORDS = {};
try { RECORDS = JSON.parse(localStorage.getItem('fok-copas') || '{}'); } catch (_) { RECORDS = {}; }
function guardaRecord(m, puesto) { if (!RECORDS[m] || puesto < RECORDS[m]) { RECORDS[m] = puesto; try { localStorage.setItem('fok-copas', JSON.stringify(RECORDS)); } catch (_) { /* sin guardar */ } } }

// una copa de premio pintada a cuadraditos (oro, plata o bronce; gris si aún no hay)
function trofeo(x, y, puesto) {
  const c = puesto === 1 ? ['#ffcb3d', '#fff3a0', '#c9841a'] : puesto === 2 ? ['#c3cbe0', '#ffffff', '#6a7390'] : puesto === 3 ? ['#d88a4a', '#ffc08a', '#8a4a20'] : ['#4a3a6a', '#5b4a7a', '#2a1840'];
  lx.fillStyle = '#1c1028'; lx.fillRect(x - 1, y - 1, 11, 13);
  lx.fillStyle = c[0]; lx.fillRect(x + 1, y, 7, 5); lx.fillRect(x, y + 1, 1, 3); lx.fillRect(x + 8, y + 1, 1, 3); lx.fillRect(x + 3, y + 5, 3, 3); lx.fillRect(x + 2, y + 8, 5, 2);
  lx.fillStyle = c[1]; lx.fillRect(x + 2, y + 1, 1, 3); lx.fillStyle = c[2]; lx.fillRect(x + 7, y + 1, 1, 4); lx.fillRect(x + 2, y + 9, 5, 1);
}

// ---------- elegir mundo ----------
function pantallaMundo() {
  paseo(14, 34); velo(0.55);
  const n = MUNDOS.length;
  if (UI.tecla === 'izq' || UI.tecla === 'der') { PANT.mundo = (PANT.mundo + (UI.tecla === 'der' ? 1 : n - 1)) % n; play('tick'); UI.tecla = null; }
  if (UI.tecla === 'arr' || UI.tecla === 'aba') UI.tecla = null;
  escribeB(lx, tr('ELIGE MUNDO'), PW / 2, 4, '#ffcb3d', '#1c1028', 'centro');
  MUNDOS.forEach((m, i) => {
    const sel = i === PANT.mundo, x = 5 + i * 58, sube = sel ? Math.round(2 + Math.sin(RELOJ * 4) * 1.5) : 0, y = 17 - sube, w = 54, h = 100;
    marco(x, y, w, h, m.oscuro, '#1c1028', sel ? (Math.sin(RELOJ * 6) > 0 ? '#ffcb3d' : '#fff3a0') : '#5b3a86');
    // rayas que corren en diagonal, del color del mundo
    lx.save(); lx.beginPath(); lx.rect(x + 2, y + 2, w - 4, h - 4); lx.clip();
    lx.fillStyle = m.color; lx.globalAlpha = sel ? 0.45 : 0.22;
    for (let k = -2; k < 8; k++) { const o = ((RELOJ * (sel ? 14 : 5)) % 14) + k * 14; lx.beginPath(); lx.moveTo(x + o, y); lx.lineTo(x + o + 7, y); lx.lineTo(x + o + 7 - h, y + h); lx.lineTo(x + o - h, y + h); lx.fill(); }
    lx.globalAlpha = 1; lx.restore();
    mini(lx, trf('MUNDO %1', i + 1), x + 5, y + 5, '#ffffff', '#1c1028');      // a la izquierda: a la derecha va el trofeo
    trofeo(x + w - 13, y + 4, RECORDS[i]);
    // la figura del mundo, botando
    figCosa(m.fig).pinta(lx, x + w / 2, y + 50 + Math.round(sel ? Math.sin(RELOJ * 5) * 1.5 : 0), BASE_COSA * 0.62, BASE_COSA, 0);
    lineas(tr(m.nombre), w - 4).slice(0, 2).forEach((l, j) => escribe(lx, l, x + w / 2, y + 55 + j * 10, sel ? '#ffffff' : '#d8d2ea', '#1c1028', 'centro'));
    // las cuatro pistas del mundo, en pequeño
    pistasDe(i).forEach((d, j) => { const mm = miniDePista(d); if (mm) { lx.fillStyle = '#1c1028'; lx.fillRect(x + 4 + j * 12, y + 80, 11, 11); lx.drawImage(mm, x + 4 + j * 12, y + 80, 11, 11); } });
    for (let s = 0; s < 4; s++) { lx.fillStyle = s <= i ? '#ff5c8a' : '#3a2a52'; lx.fillRect(x + 12 + s * 8, y + 93, 6, 3); }
    PANT.acciones.push(() => { if (PANT.mundo === i) entraEnMundo(i); else { PANT.mundo = i; play('tick'); } }); PANT.rects.push(x, y, w, h); PANT.directas.push(null);
  });
  const m = MUNDOS[PANT.mundo];
  escribeLineas(lx, tr(m.lema), PW / 2, 121, 228, '#ffe9a8', '#1c1028', 'centro', 9);
  const n0 = PANT.acciones.length;
  boton('VOLVER', 4, 143, 60, () => ve('piloto'));
  boton('ELEGIR', 150, 143, 86, () => entraEnMundo(PANT.mundo));
  if (PANT.foco < n0) PANT.foco = n0 + 1;
  PANT.atras = () => ve('piloto');
}
function entraEnMundo(i) {
  PANT.mundo = i;
  const ps = pistasDe(i);
  if (!ps.includes(PISTAS[PANT.pista])) PANT.pista = PISTAS.indexOf(ps[0]);
  ve('pista');
}

// ---------- elegir pista ----------
// el paisaje de cada pista (su cielo, las dos capas) para la ventana de arriba: se hace una vez y se guarda
const VISTAS = {};
function vistaDe(d) {
  if (!VISTAS[d.id]) { const P = { def: d }; creaCielo(P); const [c, x] = lienzo(232, 46); VISTAS[d.id] = { A: P.cieloA, B: P.cieloB, c, x, img: x.createImageData(232, 46) }; }
  return VISTAS[d.id];
}
function pintaVista(d, X, Y) {
  const v = vistaDe(d), px = new Uint32Array(v.img.data.buffer), oA = Math.floor(RELOJ * 9) & 1023, oB = Math.floor(RELOJ * 16) & 1023, y0 = HZ - 46;
  for (let y = 0; y < 46; y++) { const f = (y + y0) * CIELO_W; for (let x = 0; x < 232; x++) { const b = v.B[f + ((x + oB) & 1023)]; px[y * 232 + x] = b || v.A[f + ((x + oA) & 1023)]; } }
  v.x.putImageData(v.img, 0, 0); lx.drawImage(v.c, X, Y);
}
function pantallaPista() {
  const m = MUNDOS[PANT.mundo] || MUNDOS[0], ps = pistasDe(PANT.mundo), d = PISTAS[PANT.pista];
  lx.fillStyle = m.oscuro; lx.fillRect(0, 0, PW, PH);
  if (UI.tecla === 'izq' || UI.tecla === 'der') { const j = (ps.indexOf(d) + (UI.tecla === 'der' ? 1 : ps.length - 1)) % ps.length; PANT.pista = PISTAS.indexOf(ps[j]); play('tick'); UI.tecla = null; }
  // con teclado o mando: a los lados se cambia de pista; arriba y abajo se pasa por los botones de abajo (volver, nivel, copa, a correr)
  if (UI.tecla === 'arr' || UI.tecla === 'aba') { const n0 = ps.length; PANT.foco = n0 + ((Math.max(0, PANT.foco - n0) + (UI.tecla === 'aba' ? 1 : 4)) % 5); play('tick'); UI.tecla = null; }
  // arriba: el mundo y el paisaje de la pista, moviéndose
  marco(2, 2, 236, 60, '#1c1028', '#1c1028', m.color);
  pintaVista(d, 4, 14);
  lx.fillStyle = m.color; lx.fillRect(4, 4, 232, 10);
  escribe(lx, trf('MUNDO %1', PANT.mundo + 1) + ' · ' + tr(m.nombre), 7, 6, '#ffffff', '#1c1028');
  trofeo(224, 3, RECORDS[PANT.mundo]);
  lx.fillStyle = 'rgba(20,10,34,0.55)'; lx.fillRect(4, 46, 232, 14);
  escribeB(lx, tr(d.nombre), 8, 49, '#ffcb3d', '#1c1028');
  for (let s = 0; s < 3; s++) { lx.fillStyle = '#1c1028'; lx.fillRect(206 + s * 9, 50, 8, 8); lx.fillStyle = s < d.dificultad ? '#ff5c8a' : '#3a2a52'; lx.fillRect(207 + s * 9, 51, 6, 6); }
  // las cuatro pistas del mundo
  ps.forEach((p, i) => {
    const sel = p === d, x = 4 + i * 58, sube = sel ? Math.round(1.5 + Math.sin(RELOJ * 5) * 1.5) : 0, y = 66 - sube;
    marco(x, y, 56, 52, sel ? '#4a2f72' : '#2a1840', '#1c1028', sel ? '#ffcb3d' : '#5b3a86');
    lx.fillStyle = p.color; lx.fillRect(x + 3, y + 3, 50, 28);
    const mm = miniDePista(p); if (mm) lx.drawImage(mm, x + 14, y + 3, 28, 28);
    lineasMini(tr(p.nombre), 52).slice(0, 2).forEach((l, j) => mini(lx, l, x + 28, y + 34 + j * 7, sel ? '#ffffff' : '#bdb6d6', '#1c1028', 'centro'));
    PANT.acciones.push(() => { if (PANT.pista === PISTAS.indexOf(p)) empiezaCarga(); else { PANT.pista = PISTAS.indexOf(p); play('tick'); } }); PANT.rects.push(x, y, 56, 52); PANT.directas.push(null);
  });
  // el modo (carrera, contrarreloj o espejo: crono.js) y el lema de la pista al lado
  const lema = lineasMini(tr(d.lema), 144);
  lema.slice(0, 3).forEach((l, j) => mini(lx, l, 162, 122 + j * 7 - (lema.length > 2 ? 3 : 0), '#ffe9a8', '#1c1028', 'centro'));
  if (PANT.modo === 'crono' && SAVE.crono[d.id]) mini(lx, tr('RÉCORD') + ' ' + tiempoTxt(SAVE.crono[d.id]), 44, 136, '#22e3ff', '#1c1028', 'centro');
  else if (!espejoAbierto()) mini(lx, tr('ESPEJO: GANA EN CEO'), 44, 136, '#8a7aa8', null, 'centro');
  const n0 = PANT.acciones.length;
  boton('VOLVER', 4, 143, 40, () => ve('mundo'));
  boton(trf('NIVEL: %1', tr(dificultad().nombre)), 47, 143, 76, () => { AJUSTES.dificultad = (AJUSTES.dificultad + 1) % 3; guardaAjustes(); }, 14, '#22e3ff');
  boton('COPA', 126, 143, 44, () => copaEmpieza(PANT.mundo), 14, '#5ef27a');
  boton('¡A CORRER!', 173, 143, 63, () => { COPA.activa = false; empiezaCarga(); });
  boton(NOMBRE_MODO[PANT.modo], 4, 121, 80, cambiaModo, 13, PANT.modo === 'crono' ? '#22e3ff' : PANT.modo === 'espejo' ? '#c35cff' : '#ffcb3d');
  if (PANT.foco < n0) PANT.foco = n0 + 3;
  PANT.atras = () => ve('mundo');
}
// partir un texto en líneas que quepan en `ancho` con la letra pequeña
function lineasMini(t, ancho) {
  const sal = []; let l = '';
  for (const p of t.toUpperCase().split(' ')) { const n = l ? l + ' ' + p : p; if (anchoMini(n) > ancho && l) { sal.push(l); l = p; } else l = n; }
  if (l) sal.push(l);
  return sal;
}
// el mapa pequeño de cada pista (se saca de sus puntos, sin construir la pista entera)
const MINIS = {};
function miniDePista(d) {
  if (MINIS[d.id]) return MINIS[d.id];
  const L = 44, [c, x] = lienzo(L, L), pts = curvaCerrada(d.puntos, 6).pts;
  for (const [col, r] of [['#1c1028', 2.6], ['#f4f4f8', 1.4]]) { x.fillStyle = col; for (const p of pts) x.fillRect(Math.round(p[0] / TM * L - r), Math.round(p[1] / TM * L - r), Math.round(r * 2), Math.round(r * 2)); }
  return (MINIS[d.id] = c);
}

// ---------- la copa ----------
function copaEmpieza(m) {
  Object.assign(COPA, { activa: true, mundo: m, n: 0, puntos: {}, ultimos: {}, sumada: -1 }); PANT.guardado = false;
  PANT.pista = PISTAS.indexOf(pistasDe(m)[0]);
  empiezaCarga();
}
function copaFin() { COPA.activa = false; }
// al acabar cada carrera: los puntos de cada uno según su puesto
function copaSuma() {
  if (COPA.sumada === COPA.n) return;          // una vez por carrera
  COPA.sumada = COPA.n; COPA.ultimos = {};
  for (const r of CARRERA.resultado) { const p = PUNTOS_COPA[r.puesto - 1] || 0, id = r.piloto.id; COPA.puntos[id] = (COPA.puntos[id] || 0) + p; COPA.ultimos[id] = p; }
}
function clasificacionCopa() {
  return CARRERA.resultado.map(r => ({ r, pts: COPA.puntos[r.piloto.id] || 0, mas: COPA.ultimos[r.piloto.id] || 0 })).sort((a, b) => b.pts - a.pts || a.r.puesto - b.r.puesto);
}
function siguienteDeCopa() {
  COPA.n++;
  if (COPA.n >= 4) { ve('podio'); musica('win'); return; }
  PANT.pista = PISTAS.indexOf(pistasDe(COPA.mundo)[COPA.n]);
  empiezaCarga();
}
function pantallaCopa() {
  const m = MUNDOS[COPA.mundo], T = clasificacionCopa();
  paseo(16, 34); velo(0.66);
  escribeB(lx, trf('COPA %1', tr(m.nombre)), PW / 2, 3, m.color, '#1c1028', 'centro');
  mini(lx, trf('CARRERA %1 DE 4', COPA.n + 1), PW / 2, 14, '#ffffff', '#1c1028', 'centro');
  marco(4, 22, 150, 96);
  T.forEach((t, i) => {
    const y = 26 + i * 11;
    if (t.r.jugador) { lx.fillStyle = '#4a2f72'; lx.fillRect(6, y - 2, 146, 11); }
    escribe(lx, puestoTxt(i + 1), 9, y, COLOR_PUESTO[i], '#1c1028');
    lx.fillStyle = t.r.piloto.color; lx.fillRect(31, y + 1, 4, 5);
    escribe(lx, tr(t.r.piloto.nombre), 38, y, t.r.jugador ? '#ffffff' : '#d8d2ea', '#1c1028');
    escribe(lx, String(t.pts), 136, y, '#ffcb3d', '#1c1028', 'der');
    if (t.mas) mini(lx, '+' + t.mas, 150, y + 1, '#5ef27a', null, 'der');
  });
  marco(158, 22, 78, 96);
  const ult = COPA.n >= 3, sig = ult ? null : pistasDe(COPA.mundo)[COPA.n + 1];
  if (sig) {
    mini(lx, tr('SIGUIENTE'), 197, 27, '#bdb6d6', null, 'centro');
    lx.fillStyle = sig.color; lx.fillRect(167, 35, 60, 44); const mm = miniDePista(sig); if (mm) lx.drawImage(mm, 175, 35);
    lineasMini(tr(sig.nombre), 72).slice(0, 2).forEach((l, j) => mini(lx, l, 197, 84 + j * 8, '#ffffff', '#1c1028', 'centro'));
  } else {
    figCosa('copa').pinta(lx, 197, 80, BASE_COSA * 1.1, BASE_COSA, 0);
    escribeLineas(lx, tr('¡Última carrera hecha! Vamos al podio.'), 197, 86, 70, '#ffe9a8', null, 'centro', 9);
  }
  boton('ABANDONAR', 4, 143, 80, () => { copaFin(); musica('menu'); ve('mundo'); }, 13, '#ff5c8a');
  boton(ult ? 'VER PODIO' : 'SIGUIENTE CARRERA', 104, 143, 132, siguienteDeCopa, 13, '#5ef27a');
  PANT.foco = Math.max(PANT.foco, 0);
  PANT.atras = null;
}
const FRASES_PODIO = [
  '¡Copa ganada! Microblizz ya la vende como DLC.',
  'Segundo. Microblizz te da una medalla de chocolate (cobrada aparte).',
  'Tercero. Tu premio llegará en el próximo pase de batalla.',
  'Sin podio. Microblizz te ofrece una copa en forma de micropago.',
];
function pantallaPodio() {
  const m = MUNDOS[COPA.mundo], T = clasificacionCopa(), yo = T.findIndex(t => t.r.jugador) + 1;
  if (!PANT.guardado) { PANT.guardado = true; guardaRecord(COPA.mundo, yo); premioCopa(COPA.mundo, yo); }
  paseo(10, 34); velo(0.5);
  escribeB(lx, trf('COPA %1', tr(m.nombre)), PW / 2, 4, '#ffcb3d', '#1c1028', 'centro');
  // el podio: 2º a la izquierda, 1º en medio, 3º a la derecha
  for (const [i, x, h] of [[1, 48, 22], [0, 120, 34], [2, 192, 14]]) {
    const t = T[i]; if (!t) continue;
    marco(x - 30, 108 - h, 60, h + 4, ['#c9841a', '#6a7390', '#8a4a20'][i], '#1c1028', ['#fff3a0', '#ffffff', '#ffc08a'][i]);
    escribeB(lx, String(i + 1), x, 112 - h + Math.max(2, h / 2 - 6), '#ffffff', '#1c1028', 'centro');
    figuraDe(t.r.piloto.id).pinta(lx, x, 106 - h, BASE_KART * 0.8, BASE_KART, RELOJ * 1.5 + i);
    mini(lx, tr(t.r.piloto.nombre) + ' · ' + t.pts, x, 116, t.r.jugador ? '#ffcb3d' : '#ffffff', '#1c1028', 'centro');
  }
  if (Math.sin(RELOJ * 3) > -0.3) trofeo(115, 24, yo <= 3 ? yo : 0);
  escribeLineas(lx, tr(FRASES_PODIO[Math.min(3, yo - 1)]), PW / 2, 124, 228, '#ffe9a8', '#1c1028', 'centro', 9);
  boton('MENÚ', 4, 143, 110, () => { copaFin(); PANT.guardado = false; musica('menu'); ve('titulo'); }, 13);
  boton('OTRA COPA', 126, 143, 110, () => { copaFin(); PANT.guardado = false; musica('menu'); ve('mundo'); }, 13, '#5ef27a');
  PANT.atras = null;
}
