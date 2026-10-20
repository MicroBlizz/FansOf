// Fans of Jump · Lo que se ve en la partida: el río, las cintas de obra, los troncos, el conejo con sus amigos a la espalda,
// la ola, la puntería (puntitos y zanahoria de fuerza), el marcador (la RABIA) y el parte de incidencias del final. También
// recoge el dedo: los botones y los paneles primero; si no, arrastrar hacia atrás para apuntar y soltar para saltar.
'use strict';

const TAM_CONEJO = 14, TAM_JINETE = 10;

// parte un texto en líneas que caben en «ancho»
function envuelve(s, ancho, size) {
  const out = []; let linea = '';
  for (const p of s.split(' ')) {
    const prueba = linea ? linea + ' ' + p : p;
    if (!linea || anchoLetras(prueba, size, { peso: 700 }) <= ancho) linea = prueba; else { out.push(linea); linea = p; }
  }
  if (linea) out.push(linea);
  return out;
}

// el fotograma del conejo: quieto (la capa se mece), agachado al apuntar, el salto (según lo que lleva de vuelo) y la caída
function cuadroConejo() {
  const J = JUEGO, c = J.conejo, s = c.salto;
  if (s) return 'salto' + Math.min(5, Math.floor(Math.min(1, s.t / s.T) * 6));
  if (J.modo === 'fin') return 'aterriza0';
  if (c.cae > 0) return 'aterriza' + Math.min(3, Math.floor((1 - c.cae) * 4));
  if (APUNTA.activo && saltoApuntado()) return 'agacha';
  return 'quieto' + Math.floor(J.t * 7) % 8;
}
function pintaConejo() {
  const J = JUEGO, c = J.conejo, s = c.salto, t = J.t;
  let y = pantY(c.wy), h = 0, sx = 1, sy = 1;
  if (s) {
    const k = Math.min(1, s.t / s.T), arco = Math.sin(Math.PI * k), cerca = 1 + arco * (GUARDA.suave ? 0.12 : 0.32);   // al subir se acerca a la cámara: crece
    h = arco * s.alto; sx = sy = cerca;
  } else if (APUNTA.activo) { const f = (saltoApuntado() || { fuerza: 0 }).fuerza; sx = 1 + f * 0.06; sy = 1 - f * 0.08; }
  if (c.tronco) y += 1.2;
  // la sombra en el agua (se encoge y se aclara al subir)
  if (J.modo !== 'fin') { const lejos = Math.min(1, h / 30); elipse(c.x + 1.5, y + 2, 13 * (1 - lejos * 0.35), 5.5 * (1 - lejos * 0.35), `rgba(30,70,80,${0.3 - lejos * 0.14})`, null); }
  // en la Fiebre, un aro de arcoíris a sus pies; con el casco de obra, el casco amarillo encima
  if (J.fiebre > 0 && J.modo !== 'fin') ARCOIRIS.forEach((col, i) => elipse(c.x, y - h * 0.3, 15 + i * 1.2 + Math.sin(t * 8) * 0.8, 6 + i * 0.5, null, col, 0.8));
  const dibuja = () => {
    spriteConejo(cuadroConejo(), c.x, y - h, TAM_CONEJO, c.ang, sx, sy);
    // los amigos rescatados, montados a la espalda: se balancean más cuanto más arriba
    const base = altoModelo(0.95, TAM_CONEJO) * sy, paso = altoModelo(1.15, TAM_JINETE);
    J.cuestas.slice(-3).forEach((id, i) => {   // a la espalda caben 3; el resto se cuentan en el marcador
      const mece = Math.sin(t * 3 + i) * (i + 1) * 0.5 - (s ? Math.sin(c.ang) * (i + 1) * 1.2 : 0);
      const dx = Math.sin(c.ang) * (base + i * paso), dy = Math.cos(c.ang) * (base + i * paso);
      sprite(id + '_espalda', c.x + dx + mece, y - h - dy + 6, TAM_JINETE * (sx + 1) / 2, c.ang + mece * 0.03);
    });
  };
  if (J.modo === 'fin') {
    // se hunde: solo se ve lo que queda por encima del agua
    G.save(); G.beginPath(); G.rect(0, 0, PAN.W, y + 3); G.clip(); G.translate(0, c.hunde * 46); dibuja(); G.restore();
    return;
  }
  dibuja();
  if (J.casco) {
    const hy = y - h - altoModelo(2.35, TAM_CONEJO);
    blanda([c.x - 7, hy + 2, c.x - 6, hy - 3, c.x, hy - 5.5, c.x + 6, hy - 3, c.x + 7, hy + 2], vol(c.x, hy - 2, 7, 5, '#ffd84a'));
    caja(c.x - 8.5, hy + 1, 17, 2.2, 1.1, '#f0b414');
  }
}

function pintaCaen() {
  for (const f of JUEGO.caen) sprite(f.id + '_susto0', f.x, pantY(f.wy) - f.z, 7, f.giro, 1, 1, Math.max(0, Math.min(1, f.v * 2)));
}

// las metas: una cinta de obra de orilla a orilla (amarilla y negra; la de tu mejor marca, lila y oro) con su cartelito;
// al cruzarla se rompe y quedan los dos cabos colgando de las orillas
function pintaMetas(t) {
  for (const m of JUEGO.metas) {
    const y = pantY(m.wy);
    if (y < -20 || y > PAN.H + 10) continue;
    const [L, R] = orillas(m.wy), [c1, c2] = m.tipo === 'record' ? [PASTEL.lila, PASTEL.oro] : ['#ffd84a', '#3d2a5c'];
    const tramo = (a, b) => {
      G.save(); G.beginPath(); G.rect(a, y - 2, b - a, 4); G.clip();
      G.fillStyle = c1; G.fillRect(a, y - 2, b - a, 4); G.fillStyle = c2;
      for (let x = a - 8; x < b; x += 8) { G.beginPath(); G.moveTo(x, y + 2); G.lineTo(x + 4, y - 2); G.lineTo(x + 8, y - 2); G.lineTo(x + 4, y + 2); G.fill(); }
      G.restore(); caja(a, y - 2, b - a, 4, 1, null, OLC, 0.5);
    };
    if (!m.hecha) tramo(L, R);
    else { m.rota = Math.min(1, (m.rota || 0) + 0.04); const cae = 18 + m.rota * 10; tramo(L, L + cae); tramo(R - cae, R); }
    for (const px of [L - 2, R + 2]) { caja(px - 1.5, y - 8, 3, 12, 1, '#f0f0f6', OLC, 0.5); caja(px - 1.5, y - 5, 3, 2, 0, '#ff7a3a', null); }
    const w = anchoLetras(m.txt, 7) + 10;
    caja(R - w - 6, y - 15, w, 10, 2, m.tipo === 'record' ? PASTEL.oro : '#fff4b8', OLC, 0.7);
    if (m.tipo === 'record') forma([R - w - 2, y - 13, R - w + 1, y - 11, R - w + 4, y - 13, R - w + 4, y - 9, R - w - 2, y - 9], PASTEL.oroO, null);
    letras(m.txt, R - 6 - w / 2 + (m.tipo === 'record' ? 2 : 0), y - 9.6, 7, PASTEL.texto);
  }
}

function pintaPunteria() {
  const s = APUNTA.activo && saltoApuntado(), c = JUEGO.conejo;
  if (!s) return;
  const x0 = c.x, y0 = pantY(c.wy) - 6, x1 = s.x, y1 = pantY(s.wy), n = Math.max(3, Math.floor(s.d / 7));
  // al máximo, los puntitos se vuelven arcoíris; con la mirilla se ve el salto entero
  const max = s.fuerza > 0.97, arco = max || JUEGO.fiebre > 0, mira = JUEGO.mirilla > 0;
  for (let i = 1; i <= n; i++) {
    const k = i / (n + 1); if (k > 0.5 && !mira) break;
    const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - Math.sin(Math.PI * k) * s.d * 0.14;
    G.globalAlpha = mira ? 1 : Math.min(1, (0.55 - k) * 3);
    elipse(x, y, max ? 1.9 : 1.6, max ? 1.9 : 1.6, arco ? ARCOIRIS[(i + Math.floor(JUEGO.t * 12)) % 7] : '#ffffff', OLC, 0.7);
  }
  G.globalAlpha = 1;
  if (mira) { elipse(x1, y1, 7, 5, null, '#ffffff', 1.6); elipse(x1, y1, 7, 5, null, OLC, 0.5); iconoMirilla(x1, y1, 3); }
  // la fuerza, a la derecha: una zanahoria que se llena de abajo arriba
  const bx = PAN.W - 10, by = PAN.H * 0.3, bh = PAN.H * 0.3, lleno = bh * s.fuerza;
  const zana = () => { G.beginPath(); G.moveTo(bx - 4.5, by); G.lineTo(bx + 4.5, by); G.lineTo(bx + 0.8, by + bh); G.lineTo(bx - 0.8, by + bh); G.closePath(); };
  zana(); pinta('rgba(251,244,255,0.85)', OLC, 0.9);
  G.save(); zana(); G.clip(); G.fillStyle = s.fuerza > 0.97 ? '#ff5a3a' : '#ff9a3c'; G.fillRect(bx - 5, by + bh - lleno, 10, lleno); G.restore();
  zana(); pinta(null, OLC, 0.9);
  for (const d of [-2.4, 0, 2.4]) elipse(bx + d, by - 3, 1.3, 3.2, '#6cc04a', OLC, 0.5, d * 0.2);
}

function pintaMarcador() {
  const J = JUEGO, W = PAN.W;
  // las pérdidas para Microblizz (los puntos), en una etiqueta dorada
  const p = J.puntos.toLocaleString('es-ES') + ' €', wp = Math.max(52, anchoLetras(p, 13) + 20);
  caja(W / 2 - wp / 2, 8, wp, 18, 4, OLC, null); caja(W / 2 - wp / 2, 6.5, wp, 18, 4, J.fiebre > 0 ? '#ffe8f6' : '#fff2c0', OLC, 0.9);
  letras(p, W / 2, 16, 13, PASTEL.texto);
  letras(tr('Pérdidas de Microblizz'), W / 2, 29, 6, PASTEL.texto, { borde: '#ffffff', bw: 2, peso: 700 });
  // los metros, en una estaca
  const m = J.metros + ' m', wm = anchoLetras(m, 9) + 10;
  caja(W - wm - 6, 9, wm, 13, 2, PASTEL.menta, OLC, 0.8); letras(m, W - 6 - wm / 2, 15.8, 9, PASTEL.texto);
  // la RABIA (el multiplicador): las caras de los que llevas a la espalda
  const n = J.cuestas.length, r = tr('Rabia') + ' x' + (1 + n), wr = anchoLetras(r, 8.5) + 14 + Math.min(3, n) * 7;
  caja(6, 9, wr, 13, 2, n ? PASTEL.lila : PASTEL.papel, OLC, 0.8);
  letras(r, 12, 15.8, 8.5, PASTEL.texto, { alin: 'left' });
  J.cuestas.slice(-3).forEach((id, i) => spriteEnCaja(id + '_susto0', 12 + anchoLetras(r, 8.5) + 3.5 + i * 7, 9.5, 7, 12, 0.3));
  let yy = 26;
  if (J.zanas) { const z = String(J.zanas); caja(6, yy, anchoLetras(z, 8.5) + 22, 13, 4, '#ffe6d2', OLC, 0.8); iconoZana(13.5, yy + 6.5, 12); letras(z, 21, yy + 6.9, 8.5, PASTEL.melocotonO, { alin: 'left' }); }
  // la racha y la fiebre
  if (J.racha >= 2) { const rr = tr('Racha') + ' x' + J.racha; letras(rr, W / 2, 39, 8.5, J.racha >= 10 ? '#ff5a6e' : J.racha >= 5 ? '#ff9a3c' : '#ffffff', { borde: OLC, bw: 2.4 }); }
  if (J.fiebre > 0) {
    const w = 60, k = J.fiebre / FIEBRE_SEG, g = G.createLinearGradient(W / 2 - w / 2, 0, W / 2 + w / 2, 0); ARCOIRIS.forEach((c, i) => g.addColorStop(i / 6, c));
    caja(W / 2 - w / 2, 45, w, 5, 2.5, 'rgba(251,244,255,0.85)'); caja(W / 2 - w / 2 + 0.8, 45.8, (w - 1.6) * k, 3.4, 1.7, g, null);
  }
  pintaObjetosMarcador();
  if (J.cafe > 0) letras(tr('Pausa del café') + ' ' + Math.ceil(J.cafe), W - 8, 30, 7.5, PASTEL.texto, { alin: 'right', borde: '#ffffff', bw: 2 });
}

/* ---------- el final: el parte de incidencias de Microblizz ---------- */
const MOTIVO_FIN = { barro: 'Se cayó al agua', ola: 'Lo alcanzó el barro' };
const CONSEJOS = [
  ['Lola', 'Cae en el centro del tronco y nadie se te caerá de la espalda.'],
  ['MeerCat', 'Si saltas enseguida, la racha sube. ¡Y la rabia también!'],
  ['SlyFox', 'Tres ¡Perfecto! seguidos y llega la Fiebre arcoíris.'],
  ['JunkCoon', 'Las zanahorias se gastan en el puesto de Lola. Yo me las comería.'],
  ['BoomBeaver', 'Rescátame y verás lo que le pasa a esa ola.'],
];
function pintaFinal() {
  const J = JUEGO, W = PAN.W, H = PAN.H, F_ = J.fin;
  if (J.tFin < 0.6) return;
  const e = Math.min(1, (J.tFin - 0.6) / 0.25), sube = (1 - e) * 30;
  G.fillStyle = `rgba(40,25,60,${0.42 * e})`; G.fillRect(0, 0, W, H);
  G.globalAlpha = e;
  const res = J.resumenMisiones || [], cw = W - 26, chh = 186 + res.length * 10 + (hayAnuncios() ? 8 : 0), cx = 13, cy = Math.max(22, H / 2 - chh / 2) + sube;
  // la hoja del parte, con su cinta de arriba
  caja(cx + 2, cy + 3, cw, chh, 4, 'rgba(40,25,60,0.35)', null);
  caja(cx, cy, cw, chh, 4, PASTEL.papel, OLC, 1);
  caja(cx, cy, cw, 15, [4, 4, 0, 0], PASTEL.lila, OLC, 1);
  letras(tr('MICROBLIZZ · PARTE DE INCIDENCIAS'), W / 2, cy + 8, 7, PASTEL.texto);
  let y = cy + 26;
  letras(tr('Empleado') + ': CrazyBunny', cx + 10, y, 8, PASTEL.texto, { alin: 'left' });
  letras(tr('Motivo') + ': ' + tr(MOTIVO_FIN[F_.motivo]), cx + 10, y + 10, 7.5, PASTEL.suave, { alin: 'left', peso: 700 });
  if (RETO.activo) letras(tr('Reto del día') + ': ' + retoDeHoy().mejor.toLocaleString('es-ES') + ' €', cx + 10, y + 19, 6.6, PASTEL.lilaO, { alin: 'left', peso: 800 });
  // el sello
  aqui(cx + cw - 28, y + 4, -0.15, 1, 1, () => {
    const s = F_.record ? tr('¡RÉCORD!') : tr('¡ESCAPÓ!'), col = F_.record ? PASTEL.oroO : '#e0463e', ws = anchoLetras(s, 8, { logo: true }) + 10;
    caja(-ws / 2, -6.5, ws, 13, 3, 'rgba(255,255,255,0.55)', col, 1.2); letras(s, 0, 0.6, 8, col, { logo: true });
  });
  y += 26;
  letras(tr('Pérdidas para Microblizz'), W / 2, y, 7.5, PASTEL.suave, { peso: 700 });
  letras(J.puntos.toLocaleString('es-ES') + ' €', W / 2, y + 15, 21, PASTEL.texto, { logo: true });
  y += 32;
  letras(tr('Huida') + ': ' + J.metros + ' m', cx + 10, y, 8, PASTEL.texto, { alin: 'left' });
  letras(tr('Mejor') + ': ' + GUARDA.mejor.toLocaleString('es-ES') + ' €', cx + cw - 10, y, 8, PASTEL.texto, { alin: 'right' });
  y += 12;
  letras(tr('Empleados liberados') + ':', cx + 10, y, 8, PASTEL.texto, { alin: 'left' });
  if (J.liberados.length) J.liberados.forEach((id, i) => spriteEnCaja(id + '_susto0', cx + 86 + i * 13, y - 6.5, 12, 13, 0.3));
  else letras(tr('ninguno'), cx + 92, y, 7.5, PASTEL.flojo, { alin: 'left', peso: 700 });
  y += 14;
  // las órdenes incumplidas, como pósits
  letras(tr('Órdenes incumplidas'), cx + 10, y, 8, PASTEL.texto, { alin: 'left' });
  res.forEach((m, i) => {
    const yy = y + 10 + i * 10;
    caja(cx + 10, yy - 3.5, 7, 7, 1, m.hecha ? PASTEL.menta : PASTEL.fondo, OLC, 0.5);
    if (m.hecha) { trazo(cx + 11.6, yy, cx + 13, yy + 1.6, 0.7, PASTEL.mentaO, null); trazo(cx + 13, yy + 1.6, cx + 15.6, yy - 1.6, 0.7, PASTEL.mentaO, null); }
    letras(m.txt, cx + 21, yy, 6.6, m.hecha ? PASTEL.texto : PASTEL.flojo, { alin: 'left', peso: 700 });
    letras(m.hecha ? '+' + m.premio : m.va + '/' + m.n, cx + cw - 10, yy, 7, m.hecha ? PASTEL.melocotonO : PASTEL.flojo, { alin: 'right' });
  });
  y += 12 + res.length * 10;
  iconoZana(cx + 15, y, 12);
  letras(tr('Zanahorias') + ': +' + J.ganadas, cx + 23, y, 8.5, PASTEL.melocotonO, { alin: 'left' });
  if (hayAnuncios() && J.ganadas > 0) {
    // el anuncio con premio (de prueba): duplica las zanahorias de esta partida
    const ya = J.duplicado, quedan = anunciosQuedan(), t2 = ya ? tr('¡Duplicadas!') : quedan ? tr('Duplícalas con un anuncio') : tr('Mañana más anuncios'), aw = anchoLetras(t2, 6.8) + 14;
    caja(cx + cw - 10 - aw, y - 7.5, aw, 15, 5, ya || !quedan ? PASTEL.fondo : PASTEL.menta, OLC, 0.7);
    letras(t2, cx + cw - 10 - aw / 2, y + 0.4, 6.8, ya || !quedan ? PASTEL.suave : '#ffffff', ya || !quedan ? {} : { borde: PASTEL.mentaO, bw: 1.8 });
    if (!ya && quedan && e >= 1) boton(cx + cw - 14 - aw, y - 10, aw + 8, 20, duplicaZanas);
    y += 8;
  }
  // un consejo de alguien de la pandilla
  const [quien, dice] = J.tutoHecho ? ['Lola', 'Las zanahorias que ganes, gástalas en mi puesto: tengo amigos que te ayudarán.'] : CONSEJOS[GUARDA.partidas % CONSEJOS.length];
  y += 12;
  envuelve(quien + ': «' + tr(dice) + '»', cw - 24, 6.8).slice(0, 2).forEach((l, i) => letras(l, W / 2, y + i * 8, 6.8, PASTEL.suave, { peso: 700 }));
  const bw = 96, bh = 20, bx = W / 2 - bw / 2 + 16, by = cy + chh - 26;
  caja(bx, by + 2, bw, bh, 5, OLC, null);
  caja(bx, by, bw, bh, 5, PASTEL.melocoton, OLC, 1);
  letras(tr('¡Más caos!'), bx + bw / 2, by + 10.5, 12, '#ffffff', { logo: true, borde: PASTEL.melocotonO, bw: 2.6 });
  // y para volver a la portada
  const mx = bx - 36, mw = 28;
  caja(mx, by + 2, mw, bh, 5, OLC, null); caja(mx, by, mw, bh, 5, PASTEL.papel, OLC, 1); iconoCasa(mx + mw / 2, by + 10);
  G.globalAlpha = 1;
  if (e >= 1) boton(bx - 6, by - 6, bw + 12, bh + 12, () => { nuevaPartida('listo'); SONIDO.boton(); });
  if (e >= 1) boton(mx - 4, by - 4, mw + 8, bh + 8, vuelveAlMenu);
}

function pintaTodo() {
  const J = JUEGO, t = J.t;
  BOTONES = [];
  G.save();
  if (J.temblor > 0) G.translate((Math.random() - 0.5) * 3 * J.temblor / 0.1, (Math.random() - 0.5) * 2 * J.temblor / 0.1);
  pintaRio(t);
  pintaFx('agua');
  pintaBonitoAgua(t);
  if (J.modo !== 'menu' && !PANEL.abierto) pintaMetas(t);
  pintaTroncos(t, J.conejo.tronco);
  pintaGuiaTuto(t);
  pintaCaen();
  pintaFantasma();
  pintaConejo();
  pintaDron(t);
  pintaOla(t);
  pintaFx('aire');
  pintaLuz(t);
  pintaArco();
  if (!GUARDA.suave) pintaBonitoAire(t);
  G.restore();
  pintaPunteria();
  pintaBanderas();
  if (J.modo === 'menu') pintaPortada();
  else if (J.modo === 'listo') pintaListo(t);
  else pintaMarcador();
  pintaZanasVuelan();
  pintaTuto(t);
  if (J.modo === 'fin') pintaFinal();
  pintaCasi();
  pintaPanel();
  pintaAnuncio();
}

/* ---------- el dedo ---------- */
const DEDO = { boton: null, x0: 0, y0: 0, mueve: false, scroll0: 0 };
function dedoBaja(x, y) {
  const c = JUEGO.conejo;
  Object.assign(DEDO, { boton: botonEn(x, y), x0: x, y0: y, mueve: false, scroll0: PANEL.scroll });
  if (PANEL.abierto || DEDO.boton || ANUNCIO.activo || (JUEGO.modo !== 'listo' && JUEGO.modo !== 'juego') || c.salto || !c.tronco) return;
  Object.assign(APUNTA, { activo: true, x0: x, y0: y, x, y });
}
function dedoMueve(x, y) {
  if (APUNTA.activo) { APUNTA.x = x; APUNTA.y = y; return; }
  if (Math.hypot(x - DEDO.x0, y - DEDO.y0) > 4) DEDO.mueve = true;
  if (PANEL.abierto && DEDO.mueve) PANEL.scroll = Math.max(0, Math.min(PANEL.alto, DEDO.scroll0 - (y - DEDO.y0)));
}
function dedoSube(x, y) {
  if (APUNTA.activo) { APUNTA.x = x; APUNTA.y = y; salta(); return; }
  // los botones se apuntan de nuevo en cada fotograma: es el mismo si está en el mismo sitio
  const b = botonEn(x, y), a = DEDO.boton;
  if (b && a && !DEDO.mueve && Math.abs(b.x - a.x) < 1 && Math.abs(b.y - a.y) < 1 && b.w === a.w) b.fn(x, y);
  DEDO.boton = null;
}
