// Fans of Karts · LOS COSMÉTICOS PUESTOS: el kart del jugador con sus ruedas, su pintura, su chasis (la silla de oficina dorada o el
// carrito de micropagos) y su aspecto (CrazyBunny CEO), el color del humo del derrape, los iconos de oro y gemas, y la ventana de
// premios que sale encima de todo (¡DESBLOQUEADO!, nivel del pase, el obsequio del CEO…).
'use strict';

// ---------- los modelos con lo que llevas ----------
// la silla de oficina dorada: base de cinco patas con ruedecitas, columna, asiento, respaldo y brazos (y un volante, por si acaso)
function chasisSilla() {
  const p = [];
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.3, x = Math.cos(a) * 4.2, y = Math.sin(a) * 4.2; p.push(CAJA([x / 2, y / 2, 1.2], [Math.abs(x) / 2 + 0.4, Math.abs(y) / 2 + 0.4, 0.35], 'sillaPata', { parte: 1 }), ESF([x, y, 0.7], [0.75, 0.75, 0.7], 'rueda', { parte: 1 })); }
  p.push(CONO([0, 0, 2.6], [0.55, 0.55, 1.3], 'sillaPata', { parte: 2 }));
  p.push(CAJA([0, -0.4, 4.0], [2.9, 2.9, 0.55], 'sillaOro', { parte: 3 }), CAJA([0, -0.4, 4.45], [2.6, 2.6, 0.2], 'sillaCuero', { parte: 3 }));
  p.push(CAJA([0, -3.2, 6.4], [2.5, 0.55, 2.0], 'sillaOro', { parte: 5 }), CAJA([0, -2.75, 6.5], [2.1, 0.15, 1.6], 'sillaCuero', { parte: 5 }));
  for (const s of [-1, 1]) p.push(CAJA([s * 3.0, -0.6, 5.6], [0.35, 1.9, 0.3], 'sillaOro', { parte: 4 }), CAJA([s * 3.0, -1.8, 4.9], [0.25, 0.25, 0.8], 'sillaPata', { parte: 4 }));
  p.push(CONO([0, 2.15, 3.75], [0.95, 0.95, 0.16], 'rueda', { g: [0, 62, 0], parte: 6 }), CONO([0, 1.5, 2.9], [0.15, 0.15, 1.0], 'sillaPata', { g: [-35, 0, 0], parte: 6 }));
  return p;
}
// el carrito de la compra de los micropagos: la cesta de rejilla, el asa roja y cuatro ruedecitas
function chasisCarrito() {
  const p = [];
  for (const [x, y] of [[-2.9, -3.9], [2.9, -3.9], [-2.6, 4.2], [2.6, 4.2]]) p.push(ESF([x, y, 0.8], [0.8, 0.8, 0.8], 'rueda', { parte: 1 }), CAJA([x, y, 1.6], [0.2, 0.2, 0.6], 'rejilla', { parte: 1 }));
  p.push(CAJA([0, 0.2, 2.3], [3.1, 4.6, 0.2], 'rejilla', { parte: 2 }));
  for (const s of [-1, 1]) { p.push(CAJA([s * 3.1, 0.2, 4.0], [0.12, 4.6, 1.7], 'cesta', { parte: 3 })); for (let y = -3.5; y <= 4; y += 1.5) p.push(CAJA([s * 3.15, y, 4.0], [0.1, 0.12, 1.7], 'rejilla', { parte: 3 })); p.push(CAJA([s * 3.15, 0.2, 5.6], [0.14, 4.7, 0.14], 'rejilla', { parte: 3 })); }
  p.push(CAJA([0, 4.8, 4.0], [3.1, 0.12, 1.7], 'cesta', { parte: 3 }), CAJA([0, 4.85, 5.6], [3.2, 0.14, 0.14], 'rejilla', { parte: 3 }));
  p.push(CAJA([0, -4.4, 4.0], [3.1, 0.12, 1.7], 'cesta', { parte: 3 }), CAJA([0, -5.4, 6.4], [3.0, 0.35, 0.35], 'asa', { parte: 4 }));
  for (const s of [-1, 1]) p.push(CAJA([s * 2.8, -4.9, 5.4], [0.15, 0.6, 1.2], 'rejilla', { g: [30, 0, 0], parte: 4 }));
  p.push(CAJA([0, 4.95, 3.6], [1.5, 0.08, 0.6], 'precio', { parte: 3 }));       // la etiqueta del precio, delante
  p.push(CONO([0, 2.15, 3.75], [0.95, 0.95, 0.16], 'rueda', { g: [0, 62, 0], parte: 6 }));
  return p;
}
const MATS_CHASIS = { sillaOro: { c: '#ffcb3d', brillo: true }, sillaCuero: '#c98a1a', sillaPata: { c: '#9aa5ba', brillo: true }, rejilla: { c: '#c3cbe0', brillo: true }, cesta: { c: '#c3cbe0', fuerza: 0.6 }, asa: '#ff3348', precio: { c: '#ffe14d', plano: true } };
// CrazyBunny CEO: traje con corbata, gafas de sol, sin capa y con su maletín de billetes al lado
function aspectoCeo(piezas) {
  const p = piezas.filter(q => q.parte !== 12).map(q => (q.m === 'pelo' && (q.parte === 10 || (q.parte === 11 && q.r[1] > 1)) ? Object.assign({}, q, { m: 'traje' }) : q));
  p.push(CAJA([0, 0.38, 5.6], [0.75, 0.2, 1.0], 'camisa', { parte: 10 }), CAJA([0, 0.56, 5.4], [0.3, 0.1, 0.95], 'corbata', { parte: 10 }));
  p.push(CAJA([-1.28, 2.05, 9.05], [1.0, 0.2, 0.55], 'gafas', { parte: 24 }), CAJA([1.32, 2.05, 9.1], [1.0, 0.2, 0.55], 'gafas', { parte: 24 }), CAJA([0, 2.05, 9.2], [2.6, 0.16, 0.13], 'gafas', { parte: 24 }));
  p.push(CAJA([3.6, -1.2, 4.3], [0.55, 1.5, 1.05], 'maletin', { parte: 14 }), CAJA([3.66, -1.2, 4.3], [0.55, 0.5, 0.18], 'dinero', { parte: 14 }), CAJA([3.6, -1.2, 5.5], [0.2, 0.6, 0.18], 'gafas', { parte: 14 }));
  return p;
}
const MATS_CEO = { traje: '#2b2d3a', camisa: '#ffffff', corbata: '#ff3348', gafas: { c: '#1c1028', brillo: true }, maletin: '#5b3a26', dinero: '#5ef27a' };

// la figura del jugador (con lo que lleva puesto); sin nada puesto es la de siempre
const llevaPara = id => { const L = {}; for (const [t] of TIPOS_COS) { const c = llevaCos(t); if (c && sirveA(c, id)) L[t] = c; } return L; };
function claveJugador(id) { const L = llevaPara(id); return [id, L.ruedas, L.pintura, L.kart, L.skin].map(c => (c && c.id) || c || '').join('|'); }
function figuraCon(id, L) {
  const m = MODELOS[id](); let piezas = m.piezas; const mats = Object.assign({}, m.mats);
  if (L.ruedas) { mats.rueda = { c: L.ruedas.c[0], s: mezcla(L.ruedas.c[0], '#000000', 0.5), l: mezcla(L.ruedas.c[0], '#ffffff', 0.3) }; mats.llanta = { c: L.ruedas.c[1], brillo: true }; }
  if (L.pintura) { mats.kart = L.pintura.brillo ? { c: L.pintura.c[0], brillo: true } : L.pintura.c[0]; mats.raya = L.pintura.c[1]; }
  if (L.skin && L.skin.id === 'skin-ceo-bunny') { piezas = aspectoCeo(piezas); Object.assign(mats, MATS_CEO); }
  if (L.kart) { piezas = piezas.filter(q => q.parte > 7).concat(L.kart.id === 'kart-silla' ? chasisSilla() : chasisCarrito()); Object.assign(mats, MATS_CHASIS); }
  return new Figura({ ...CAJA_KART, piezas, mats });
}
function figuraJugador(id) {
  const k = claveJugador(id);
  if (k === id + '||||') return figuraDe(id);
  return FIGURAS[k] || (FIGURAS[k] = figuraCon(id, llevaPara(id)));
}
// para enseñar un cosmético en la tienda: el kart del piloto elegido con eso puesto (y lo demás que ya lleve)
function figuraPrueba(id, cos) {
  const L = llevaPara(id); if (cos && sirveA(cos, id) && cos.tipo !== 'humo' && cos.tipo !== 'titulo') L[cos.tipo] = cos;
  const k = [id, L.ruedas, L.pintura, L.kart, L.skin].map(c => (c && c.id) || '').join('|');
  if (k === id + '||||') return figuraDe(id);
  return FIGURAS[k] || (FIGURAS[k] = figuraCon(id, L));
}
// las fotos del kart del jugador, a la cola de la carga (la pantalla de carga espera a que estén)
function encolaJugador() {
  const f = figuraJugador(JUGABLES[PANT.piloto].id);
  if (f !== figuraDe(JUGABLES[PANT.piloto].id)) for (let n = 0; n <= 13; n++) COLA_FOTOS.unshift([f, n]);
  if (CAL === 2) for (const n of [-4, -5, -6]) COLA_FOTOS.unshift([f, n]);      // en HD, las grandes del tuyo (siempre lo tienes delante)
}

// ---------- el humo del derrape (sin chispas todavía: las azules y naranjas no cambian, que avisan del miniturbo) ----------
function colorHumo(k) {
  const h = k.esJugador ? llevaCos('humo') : null;
  if (!h) return '#e8e4da';
  if (h.c === 'arcoiris') return ['#ff5c8a', '#ffcb3d', '#5ef27a', '#22e3ff', '#c35cff'][Math.floor(RELOJ * 12) % 5];
  return Math.random() < 0.5 ? h.c[0] : h.c[1];
}

// ---------- fotos para las pantallas en grande (tienda, pase, premios): dibujos a cuadraditos que el HTML amplía sin suavizar ----------
const FOTOS = {};
const aUrl = c => c.toDataURL('image/png');
// un dibujo a partir de filas de letras (cada letra, un color)
function pixelArte(filas, col) {
  const [c, x] = lienzo(filas[0].length, filas.length);
  filas.forEach((f, j) => { for (let i = 0; i < f.length; i++) if (col[f[i]]) { x.fillStyle = col[f[i]]; x.fillRect(i, j, 1, 1); } });
  return c;
}
const ARTE_ORO = ['...oooooo...', '..oAAAAAAo..', '.oAABBBBAAo.', 'oAABAAAABAAo', 'oABAAAAAABAo', 'oABAAAAAABAo', 'oABAAAAAABAo', 'oABAAAAAABAo', 'oAABAAAABAAo', '.oAABBBBAAo.', '..oAAAAAAo..', '...oooooo...'];
const ARTE_GEMA = ['..oooooooo..', '.oBBCBBCBBo.', 'oBBCCBBCCBBo', 'oAAAAAAAAAAo', '.oAAABBAAAo.', '..oAABBAAo..', '...oAAAAo...', '....oAAo....', '.....oo.....'];
const COL_ORO = { o: '#1c1028', A: '#ffcb3d', B: '#fff3a0' }, COL_GEMA = { o: '#1c1028', A: '#c35cff', B: '#ff9af0', C: '#ffffff' };
function fotoIcono(t) { return FOTOS['ico-' + t] || (FOTOS['ico-' + t] = aUrl(t === 'oro' ? pixelArte(ARTE_ORO, COL_ORO) : pixelArte(ARTE_GEMA, COL_GEMA))); }
// un montón de gemas o de oro (para los packs y los premios grandes): n del 1 al 6
function fotoMonton(t, n) {
  const k = 'mon-' + t + n; if (FOTOS[k]) return FOTOS[k];
  const [c, x] = lienzo(40, 30), ic = t === 'oro' ? pixelArte(ARTE_ORO, COL_ORO) : pixelArte(ARTE_GEMA, COL_GEMA);
  const sitio = [[14, 16], [6, 18], [22, 18], [10, 9], [18, 9], [14, 2]];
  for (let i = Math.min(6, n) - 1; i >= 0; i--) x.drawImage(ic, sitio[i][0], sitio[i][1]);
  return (FOTOS[k] = aUrl(c));
}
// la placa de un título, con la letra del juego
function fotoTitulo(c) {
  const k = 'tit-' + c.id + IDIOMA_K; if (FOTOS[k]) return FOTOS[k];
  const [cv2, x] = lienzo(96, 56), ls = conLetraPixel(() => lineas(tr(c.nombre), 80)).slice(0, 2);
  x.fillStyle = '#1c1028'; x.fillRect(4, 10, 88, 36); x.fillStyle = '#b3870a'; x.fillRect(5, 11, 86, 34); x.fillStyle = '#ffcb3d'; x.fillRect(6, 12, 84, 31);
  x.fillStyle = '#fff3a0'; x.fillRect(6, 12, 84, 2); x.fillStyle = '#1c1028'; x.fillRect(10, 16, 2, 2); x.fillRect(84, 16, 2, 2); x.fillRect(10, 38, 2, 2); x.fillRect(84, 38, 2, 2);
  ls.forEach((l, i) => escribePx(x, l, 48, 28 - ls.length * 5 + i * 10, '#3b2410', null, 'centro'));
  return (FOTOS[k] = aUrl(cv2));
}
// un kart con lo que sea puesto, en tres cuartos (o de espaldas, para el humo)
function pintaKartCon(x, fig, cx, cy, esc, ang, humo, t = 0) {
  x.fillStyle = 'rgba(20,10,34,0.35)'; x.beginPath(); x.ellipse(cx, cy, 13 * esc / BASE_KART, 4 * esc / BASE_KART, 0, 0, TAU); x.fill();
  if (humo) for (let i = 0; i < 14; i++) {
    const f = ((i / 14) + t) % 1, s = Math.round((2 + f * 4) * esc / BASE_KART);
    x.fillStyle = humo.c === 'arcoiris' ? ['#ff5c8a', '#ffcb3d', '#5ef27a', '#22e3ff', '#c35cff'][i % 5] : humo.c[i & 1];
    x.globalAlpha = 1 - f * 0.6; x.fillRect(Math.round(cx + (i & 1 ? 1 : -1) * (6 + f * 16) * esc / BASE_KART - s / 2), Math.round(cy - 2 - f * 22 * esc / BASE_KART), s, s); x.globalAlpha = 1;
  }
  fig.pinta(x, Math.round(cx), Math.round(cy), esc, BASE_KART, ang);
}
function fotoCos(c, pil) {
  if (c.tipo === 'titulo') return fotoTitulo(c);
  const id = c.solo || pil, k = 'cos-' + c.id + '-' + id; if (FOTOS[k]) return FOTOS[k];
  const [cv2, x] = lienzo(96, 72), humo = c.tipo === 'humo' ? c : null;
  pintaKartCon(x, figuraPrueba(id, c), 48, 64, BASE_KART * 1.05, humo ? Math.PI * 0.08 : Math.PI - 0.75, humo);
  return (FOTOS[k] = aUrl(cv2));
}
function fotoPiloto(id) { const k = 'pil-' + id + claveJugador(id); if (FOTOS[k]) return FOTOS[k]; const [cv2, x] = lienzo(48, 48); figuraJugador(id).pinta(x, 24, 44, BASE_KART * 0.72, BASE_KART, Math.PI); return (FOTOS[k] = aUrl(cv2)); }
// un premio (de la ventana de premios o del pase) → su foto y su texto
function fotoPremio(l, pil) { return l.cos ? fotoCos(COS[l.cos], pil) : l.ico === 'oro' ? fotoMonton('oro', 3) : l.ico === 'gema' ? fotoMonton('gema', 3) : l.ico === 'xp' ? fotoXp() : null; }
// la estrella verde de la XP del pase
function fotoXp() { return FOTOS.xp || (FOTOS.xp = aUrl(pixelArte(['.....oo.....', '....oAAo....', '....oABo....', 'oooooABooooo', 'oAAAAABBAAAo', '.oAAAAABAAo.', '..oAAAAAAo..', '..oAAooAAo..', '.oAAo..oAAo.', '.ooo....ooo.'], { o: '#1c1028', A: '#5ef27a', B: '#c8ffd0' }))); }
