// Fans of Swipe · PINTAR: todo lo que se ve en la partida menos la carta (js/carta.js). El fondo del piso, las manos de CrazyBunny
// en primera persona, el enemigo con su vida y su intención, el mapa de la torre arriba, las reliquias, los dos lados de la carta
// a izquierda y derecha y el marcador de abajo (vida, escudo, caos y tus últimos gestos). Letra pixelada con contorno grueso.
'use strict';
const SW_V = { H: 960, sc: 1, dpr: 1 };
const SW_LETRA = '"Jersey 10", "Courier New", monospace';
const SW_TINTA = '#1a0f1f';
let SW_BOTONES = [];

/* ---------- letra ---------- */
function swLetra(c, tam) { c.font = `${Math.round(tam * 1.5)}px ${SW_LETRA}`; }   // Jersey 10 es estrecha: se agranda para que se lea igual
function swTexto(c, txt, x, y, tam, col = '#fff', alinea = 'center', borde = 5, peso = 700) {
  swLetra(c, tam, peso); c.textAlign = alinea; c.textBaseline = 'middle';
  x = Math.round(x); y = Math.round(y);
  if (borde) {
    // contorno limpio: un trazo oscuro de esquinas rectas y una sombra dura debajo (nada de copias difuminadas)
    c.lineJoin = 'miter'; c.miterLimit = 2.5; c.lineWidth = Math.max(3, borde * 0.95); c.strokeStyle = SW_TINTA;
    c.strokeText(txt, x, y + Math.max(2, Math.round(borde * 0.45))); c.strokeText(txt, x, y);
  }
  c.fillStyle = col; c.fillText(txt, x, y);
}
// como swTexto, pero si no cabe en «max» se hace más pequeño (hasta un 60 %)
function swTextoCabe(c, txt, x, y, tam, max, col, alinea = 'center', borde = 5, peso = 700) {
  let t = tam; swLetra(c, t); while (t > tam * 0.6 && c.measureText(txt).width > max) { t -= 0.5; swLetra(c, t); }
  swTexto(c, txt, x, y, t, col, alinea, borde, peso);
}
// el título dorado de la serie (degradado de amarillo a naranja, contorno grueso y sombra)
function swTitulo(c, txt, x, y, tam) {
  swLetra(c, tam); c.textAlign = 'center'; c.textBaseline = 'middle';
  const b = Math.max(2, Math.round(tam * 0.09)); c.fillStyle = SW_TINTA;
  for (let dy = -b; dy <= b * 2.2; dy += b) for (const dx of [-b, 0, b]) c.fillText(txt, x + dx, y + dy);
  const g = c.createLinearGradient(0, y - tam / 2, 0, y + tam / 2); g.addColorStop(0, '#fff6a0'); g.addColorStop(0.5, '#ffd23a'); g.addColorStop(1, '#ff9a1a');
  c.fillStyle = g; c.fillText(txt, x, y);
}
function swParte(c, txt, max, tam) {
  swLetra(c, tam); const out = [];
  for (const parr of String(txt).split('\n')) {
    let l = '';
    for (const w of parr.split(' ')) { const t = l ? l + ' ' + w : w; if (c.measureText(t).width > max && l) { out.push(l); l = w; } else l = t; }
    if (l) out.push(l);
  }
  return out;
}

/* ---------- paneles pixelados (madera, pergamino, botones) ---------- */
function swPanel(c, x, y, w, h, base = '#8c2a26', luz = '#c2432e', sombra = '#5a1714', p = 3) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  c.fillStyle = SW_TINTA; c.fillRect(x + p, y, w - 2 * p, h); c.fillRect(x, y + p, w, h - 2 * p);
  c.fillStyle = base; c.fillRect(x + p, y + p, w - 2 * p, h - 2 * p);
  c.fillStyle = luz; c.fillRect(x + 2 * p, y + p, w - 4 * p, p);
  c.fillStyle = sombra; c.fillRect(x + 2 * p, y + h - 2 * p, w - 4 * p, p);
}
function swBarra(c, x, y, w, h, v, max, col, fantasma = 0, t = 0) {
  swPanel(c, x, y, w, h, '#2a1830', '#3a2440', '#1a0f1f');
  const iw = w - 12, f = clamp(v / Math.max(1, max), 0, 1), g = clamp(fantasma / Math.max(1, max), 0, f);
  c.fillStyle = col; c.fillRect(x + 6, y + 6, Math.round(iw * (f - g)), h - 12);
  if (g > 0) { c.fillStyle = `rgba(255,255,255,${0.45 + 0.45 * Math.sin(t * 10)})`; c.fillRect(x + 6 + Math.round(iw * (f - g)), y + 6, Math.round(iw * g), h - 12); }
  c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x + 6, y + 6, Math.round(iw * (f - g)), 3);
}

/* ---------- medidas que dependen del alto ---------- */
function swMide() {
  const H = SW_V.H, extra = H - 960;
  SW_V.hud = H - 96;
  SW_V.kc = 0.84;                                // la carta, algo más pequeña, abajo del todo (encima del marcador)
  SW_V.cartaCY = SW_V.hud - 38 - 180 * SW_V.kc;
  SW_V.cartaY = SW_V.cartaCY - 180 * SW_V.kc;    // arriba de la carta
  SW_V.barraE = 158 + extra * 0.25;              // nombre y vida del enemigo
  SW_V.pieE = SW_V.cartaY - 4;                   // el enemigo, entero, de pie justo encima de la carta
  SW_POS.enemigo = [270, SW_V.pieE - 140];
  SW_POS.vida = [96, SW_V.hud + 30]; SW_POS.escudo = [250, SW_V.hud + 30]; SW_POS.caos = [370, SW_V.hud + 30]; SW_POS.oro = [470, 28];
}

/* ---------- el escenario ---------- */
function swPintaFondo(c, zona, t) {
  const H = SW_V.H;
  c.fillStyle = '#120a1c'; c.fillRect(0, 0, 540, H);
  const im = SW_IMG[zona];
  if (im) { const s = Math.ceil(Math.max(540 / im.width, H / im.height)); swDibuja(c, zona, (540 - im.width * s) / 2, (H - im.height * s) / 2, s); }
  // oscurece arriba y abajo para que la carta y el marcador se lean
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(10,5,20,.55)'); g.addColorStop(0.18, 'rgba(10,5,20,0)'); g.addColorStop(0.55, 'rgba(10,5,20,0)'); g.addColorStop(1, 'rgba(10,5,20,.7)');
  c.fillStyle = g; c.fillRect(0, 0, 540, H);
}
// las manos de CrazyBunny: la izquierda (antorcha) se levanta al cubrirse y la derecha (garrote) golpea
function swPintaManos(c, t) {
  const im = SW_IMG.manos; if (!im) return;
  const s = 4, w = im.width, h = im.height, base = SW_V.H - h * s + 40, mitad = Math.floor(w / 2);
  const resp = Math.round(Math.sin(t * 2.2) * 2) * s;
  c.imageSmoothingEnabled = false;
  const izq = SW_FX.manoIzq, der = SW_FX.mano;
  c.save(); c.translate(0, base + resp - izq * 60); c.drawImage(im, 0, 0, mitad, h, 0, 0, mitad * s, h * s); c.restore();
  c.save(); c.translate(mitad * s + der * -40, base - resp - der * 120); c.translate(mitad * s / 2, h * s); c.rotate(-der * 0.5); c.translate(-mitad * s / 2, -h * s);
  c.drawImage(im, mitad, 0, w - mitad, h, 0, 0, (w - mitad) * s, h * s); c.restore();
}
function swEscalaEnemigo(id) { const [w, h] = swTam(id), alto = SW_V.pieE - SW_V.barraE - 40; return clamp(Math.min(Math.floor(alto / h), Math.floor(460 / w)), 3, 7); }
function swPintaEnemigo(c, t, prev) {
  const P = SW_P, C = P && P.C; if (!C) return;
  const id = C.en, s = swEscalaEnemigo(id), [w, h] = swTam(id, s), cx = 270, base = SW_V.pieE;
  const bob = Math.round(Math.sin(t * 2.6) * 1.5) * s, lunge = SW_FX.golpeE < 0 ? -SW_FX.golpeE : 0, empuje = SW_FX.golpeE > 0 ? SW_FX.golpeE : 0;
  const tx = cx + (SW_FX.temblor > 0 ? rand(-1, 1) * SW_FX.temblor * 0.6 : 0);
  // sombra en el suelo
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(cx - w * 0.35, base - 6, w * 0.7, 12);
  // al recibir: se encoge y salta hacia atrás; al atacar: se abalanza hacia la cámara
  c.save(); c.translate(tx, base - empuje * 22 + lunge * 60); const k = 1 + lunge * 0.4; c.scale(k * (1 + empuje * 0.16), k * (1 - empuje * 0.13)); c.rotate((empuje * 0.08) * (Math.sin(t * 50) > 0 ? 1 : -1));
  if (SW_FX.flashE > 0.5) c.filter = 'brightness(3) saturate(0)';
  else if (C.congelado > 0) c.filter = 'hue-rotate(160deg) saturate(.6) brightness(1.25)';
  swDibuja(c, id, -w / 2, -h + bob, s);
  c.filter = 'none'; c.restore();
  if (C.veneno > 0) for (let i = 0; i < 3; i++) { c.fillStyle = '#9cff57'; c.fillRect(Math.round(cx - w / 3 + ((t * 40 + i * 50) % (w * 0.66))), Math.round(base - h * 0.3 - ((t * 60 + i * 37) % 80)), 6, 6); }
  // nombre, vida y lo que va a hacer (la intención va en un globo a la izquierda de la barra)
  const top = base - h - 14 + bob, E = SW_ENEMIGOS[id];
  const yb = SW_V.barraE, bx = 214;
  swTexto(c, tr(E.nombre), bx + 105, yb - 22, 24, E.tipo === 'normal' ? '#ffffff' : E.tipo === 'elite' ? '#ffb13d' : '#ff5a4f');
  const fantasma = prev && prev.enemigo > 0 ? prev.enemigo : 0;
  swBarra(c, bx, yb - 6, 210, 26, C.vida, C.vidaMax, '#e8413a', fantasma, t);
  swTexto(c, `${C.vida}/${C.vidaMax}`, bx + 105, yb + 7, 16);
  if (C.escudo > 0) { swDibujaC(c, 'i-escudo', bx + 232, yb + 7, 2); swTexto(c, String(C.escudo), bx + 232, yb + 8, 15); }
  if (fantasma) swTexto(c, prev.mata ? tr('¡K.O.!') : '-' + fantasma, bx + 105, yb + 40, 26 + Math.sin(t * 10) * 2, prev.mata ? '#ffd84a' : '#ffffff', 'center', 6);
  const I = swIntencion(P), gx = 106, gy = yb + 4;
  swPanel(c, gx, gy - 30, 100, 56, '#f4e6c8', '#fff8e6', '#c8b08a');
  const ix = gx + 26;
  if (I.congelado) swDibujaC(c, 'a-hielo', gx + 50, gy - 2, 2);
  else if (I.aturdido) { for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1; c.fillStyle = '#ffd84a'; c.fillRect(Math.round(gx + 50 + Math.cos(a) * 26) - 5, Math.round(gy - 2 + Math.sin(a) * 9) - 5, 10, 10); } swTexto(c, tr('¡ZZZ!'), gx + 50, gy - 1, 20, '#3a2414', 'center', 0); }
  else if (I.carga) {
    // cargando: cuánto daño le llevas este turno contra lo que hace falta para cortarlo
    const hecho = Math.min(I.carga, C.danoTurno + (prev && prev.enemigo > 0 ? prev.enemigo : 0)), parpadea = Math.sin(t * 12) > 0;
    swDibujaC(c, 'a-caos', ix, gy - 2, 2);
    swTexto(c, `${hecho}/${I.carga}`, ix + 44, gy - 1, 20, hecho >= I.carga ? '#4fc25a' : parpadea ? '#ff5a4f' : '#c2432e');
    swTexto(c, tr('¡Córtalo!'), gx + 50, gy + 58, 15, '#ff8a2a', 'center', 4);
  }
  else if (I.atq) { swDibujaC(c, 'i-espada', ix, gy - 2, 2); swTexto(c, I.k > 1 ? `${I.atq}x${I.k}` : String(I.atq), ix + 44, gy - 1, 21, '#ff5a4f'); }
  else if (I.def) { swDibujaC(c, 'i-escudo', ix, gy - 2, 2); swTexto(c, String(I.def), ix + 44, gy - 1, 21, '#9fd4ff'); }
  else if (I.cura) { swDibujaC(c, 'a-cura', ix, gy - 2, 2); swTexto(c, String(I.cura), ix + 44, gy - 1, 21, '#6ee36a'); }
  else if (I.fuerza) { swDibujaC(c, 'a-caos', ix, gy - 2, 2); swTexto(c, '+' + I.fuerza, ix + 44, gy - 1, 21, '#ffb13d'); }
  if (I.txt && !I.congelado) swTexto(c, tr(I.txt), gx + 50, gy + 40, 14, I.cargado ? '#ff5a4f' : '#fff6a0', 'center', 4);
  else if (I.congelado) swTexto(c, tr('Congelado'), gx + 50, gy + 40, 14, '#9fe8ff', 'center', 4);
}

/* ---------- arriba: piso, oro, mapa y reliquias ---------- */
function swPintaArriba(c, t) {
  const P = SW_P;
  swPanel(c, 10, 8, 52, 44, '#3a73c4', '#5a95e6', '#244e8c');
  c.fillStyle = '#fff'; c.fillRect(27, 20, 6, 20); c.fillRect(39, 20, 6, 20);
  SW_BOTONES.push({ id: 'pausa', x: 6, y: 4, w: 60, h: 52 });
  const A = swActoDePiso(P.piso);   // el mapa enseña los 15 pisos del acto en el que estás
  swTexto(c, tr('PISO {n}/{t}', { n: P.piso, t: P.mapa.length > 15 || SAVE.acto2 ? 30 : 15 }), 270, 30, 26);
  swDibujaC(c, 'i-oro', 448, 30, 2); swTexto(c, fmt(P.oro), 470, 31, 24, '#ffd84a', 'left');
  // el mapa de la torre
  const x0 = 270 - (15 * 32) / 2, y = 66;
  for (let k = 0; k < 15; k++) {
    const i = A.desde - 1 + k, x = x0 + k * 32, piso = i + 1, op = P.mapa[i] || ['combate'], hecho = P.camino[i];
    const actual = piso === P.piso, jefe = (hecho || op[0]) === 'jefe' && op.length === 1;
    let icono = jefe ? A.iconoJefe : hecho ? SW_NODOS[hecho].icono : op.length === 1 ? SW_NODOS[op[0]].icono : null;
    if (actual) swPanel(c, x, y - 4 + Math.round(Math.sin(t * 5)) * 2, 30, 34, '#ffd23a', '#fff6a0', '#c88a10');
    else swPanel(c, x, y, 30, 30, piso < P.piso ? '#3a2a40' : '#2a1a34', '#4a3a50', '#1a0f1f');
    c.save(); if (piso < P.piso) c.globalAlpha = 0.55;
    if (icono) swDibujaC(c, icono, x + 15, y + 15 + (actual ? Math.round(Math.sin(t * 5)) * 2 - 2 : 0), 1);
    else swTexto(c, '?', x + 15, y + 16, 16, '#8a7a9a', 'center', 3);
    c.restore();
  }
  // las reliquias
  const rel = P.reliquias;
  rel.forEach((r, i) => {
    const col = Math.floor(i / 7), x = col % 2 ? 484 : 4, yy = 108 + (i % 7) * 54 + (col > 1 ? 27 : 0);
    swDibuja(c, r, x, yy, 2);
    SW_BOTONES.push({ id: 'rel:' + r, x, y: yy, w: 48, h: 48 });
  });
}

/* ---------- los dos lados de la carta ---------- */
function swPintaLados(c, t, lados, carta, inclina) {
  const y0 = SW_V.cartaY + 70;
  for (const [i, L] of lados.entries()) {
    const izq = i === 0, cx = izq ? 74 : 466, hacia = izq ? inclina < -0.15 : inclina > 0.15, aleja = izq ? inclina > 0.15 : inclina < -0.15;
    const k = hacia ? 1 + Math.min(0.15, Math.abs(inclina) * 0.2) : 1;
    c.save(); c.translate(cx, y0); c.scale(k, k); c.globalAlpha = aleja ? 0.45 : 1;
    swDibujaC(c, 'i-flecha', izq ? -2 : 2, 0, 3, izq);
    const icono = L.icono && SW_IMG[L.icono] ? L.icono : null;
    if (icono) swDibujaC(c, icono, 0, 66, 4);
    const col = L.bloqueado ? '#ff8a80' : hacia ? '#ffd84a' : swEsAtaque(L) ? '#ff7a6e' : '#ffffff';   // los ataques, en rojo
    const ANCHO = 122;   // lo que cabe a cada lado de la carta
    const nom = swParte(c, (tr(L.nombre) + (L.mas ? '+' : '')).toUpperCase(), ANCHO, 19);
    nom.slice(0, 2).forEach((l, j) => swTextoCabe(c, l, 0, 114 + j * 28, 19, ANCHO, col));
    let yy = 114 + Math.min(2, nom.length) * 28 + 2;
    const lineas = L.bloqueado ? [L.porque] : swLineas(SW_P, carta, L);
    for (const ln of lineas) for (const l of swParte(c, ln, ANCHO, 15)) { swTextoCabe(c, l, 0, yy, 15, ANCHO, L.bloqueado ? '#ff8a80' : '#fff6d8', 'center', 4); yy += 23; }
    c.restore();
    SW_BOTONES.push({ id: izq ? 'lado:L' : 'lado:R', x: cx - 66, y: y0 - 30, w: 132, h: 260 });
  }
}

/* ---------- abajo: el marcador ---------- */
function swPintaMarcador(c, t, prev) {
  const P = SW_P, y = SW_V.hud, C = P.C;
  swPanel(c, -6, y, 552, 104);
  const vx = 20;
  swDibujaC(c, 'i-vida', vx + 14, y + 30, 3);
  swBarra(c, vx + 36, y + 16, 150, 28, P.vida, P.vidaMax, '#e8413a', prev && prev.vida < 0 ? -prev.vida : 0, t);
  swTexto(c, `${Math.max(0, P.vida)}/${P.vidaMax}`, vx + 111, y + 31, 17);
  if (prev && prev.vida) swTexto(c, (prev.vida > 0 ? '+' : '') + prev.vida, vx + 111, y + 64, 20, prev.vida > 0 ? '#6ee36a' : '#ff5a4f');
  if (C) {
    swDibujaC(c, 'i-escudo', 236, y + 30, 3); swTexto(c, String(C.escudoJ), 268, y + 31, 24, '#9fd4ff', 'left');
    if (prev && prev.escudo) swTexto(c, '+' + prev.escudo, 252, y + 64, 20, '#9fd4ff');
    for (let i = 0; i < SW_CFG.caosMax; i++) { c.save(); c.globalAlpha = i < C.caos ? 1 : 0.25; swDibujaC(c, 'i-caos', 326 + i * 30, y + 30, 2); c.restore(); }
    if (prev && prev.caos) swTexto(c, (prev.caos > 0 ? '+' : '') + prev.caos, 356, y + 64, 20, prev.caos > 0 ? '#ffb13d' : '#ff8a80');
    // tus últimos gestos (para los combos)
    const h = C.hist.padStart(3, ' ');
    for (let i = 0; i < 3; i++) {
      const x = 428 + i * 34; swPanel(c, x, y + 14, 32, 32, '#2a1830', '#3a2440', '#1a0f1f');
      if (h[i] !== ' ') swDibujaC(c, 'i-flecha', x + 16, y + 30, 1, h[i] === 'L');
    }
    swTexto(c, tr('COMBO'), 479, y + 64, 14, '#fff6a0', 'center', 4);
  } else {
    swTexto(c, tr('Mazo: {n} cartas', { n: P.mazo.length }), 300, y + 31, 18, '#fff6d8', 'left');
    SW_BOTONES.push({ id: 'mazo', x: 290, y, w: 240, h: 60 });
  }
  if (prev && prev.oro) swTexto(c, (prev.oro > 0 ? '+' : '') + prev.oro, 470, 66 + 44, 20, prev.oro > 0 ? '#ffd84a' : '#ff8a80', 'left');
}

/* ---------- la capa de efectos ---------- */
function swPintaEfectos(c, t) {
  for (const p of SW_FX.parts) { c.globalAlpha = 1 - p.t / p.vida; c.fillStyle = p.col; c.fillRect(Math.round(p.x), Math.round(p.y), p.lado, p.lado); }
  c.globalAlpha = 1;
  swPintaGolpes(c, t);
  // los números: revientan grandes, rebotan y suben
  for (const n of SW_FX.nums) {
    const k = n.t / n.vida, pop = n.grande ? 1 + Math.max(0, 1 - n.t * 7) * (n.enorme ? 1.6 : 1) : 1;
    c.save(); c.globalAlpha = 1 - k * k; c.translate(n.x, n.y - k * 70 - (n.grande ? Math.sin(Math.min(1, n.t * 5) * Math.PI) * 26 : 0)); c.rotate(n.grande ? n.rot : 0); c.scale(pop, pop);
    swTexto(c, n.txt, 0, 0, n.enorme ? 64 : n.grande ? 46 : 28, n.col, 'center', n.enorme ? 10 : 7); c.restore();
  }
  c.globalAlpha = 1;
  SW_FX.avisos.forEach((a, i) => {
    const k = a.t / 1.5, esc = a.t < 0.15 ? a.t / 0.15 : 1; c.save(); c.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1;
    c.translate(270, SW_V.cartaY - 36 - i * 40); c.scale(esc, esc); swTexto(c, a.txt, 0, 0, 30, a.col, 'center', 7); c.restore();
  });
  if (SW_FX.rojo > 0) { c.fillStyle = `rgba(220,30,30,${SW_FX.rojo * 0.35})`; c.fillRect(0, 0, 540, SW_V.H); }
  if (SW_FX.hielo > 0) { c.fillStyle = `rgba(160,230,255,${SW_FX.hielo * 0.25})`; c.fillRect(0, 0, 540, SW_V.H); }
}

/* ---------- toda la partida ---------- */
function swPintaPartida(c, t, dt) {
  const P = SW_P; SW_BOTONES = [];
  const sacude = SW_FX.temblor > 0 ? [rand(-1, 1) * SW_FX.temblor * 0.4, rand(-1, 1) * SW_FX.temblor * 0.4] : [0, 0];
  c.save(); c.translate(...sacude);
  const z = 1 + SW_FX.zoom * 0.07, ez = SW_POS.enemigo[1];   // el zoom del golpe, hacia el enemigo
  c.translate(270, ez); c.scale(z, z); c.translate(-270, -ez);
  swPintaFondo(c, swZona(P.piso), t);
  const prev = swPrevisionActual();
  swPintaEnemigo(c, t, prev);
  if (!P.C && P.carta) swPintaTituloNodo(c, t);
  swPintaManos(c, t);
  c.restore();
  swPintaArriba(c, t);
  swPintaProxima(c, t);
  if (P.carta) swPintaLados(c, t, swLados(P, P.carta), P.carta, SW_G.x / 120);
  if (P.carta || SW_G.sale) swPintaCarta(c, t, dt);
  if (!P.carta && !SW_G.sale && P.fase === 'enemigo') swTexto(c, tr('Turno del enemigo…'), 270, SW_V.cartaCY, 24, '#fff6a0');
  swPintaMecha(c, t);
  swPintaFrenesi(c, t);
  swPintaMarcador(c, t, prev);
  swPintaEstallido(c, t);
  if (prev && prev.combo) swTexto(c, tr('¡COMBO! {n}', { n: tr(prev.combo) }), 270, SW_V.cartaY - 24, 24 + Math.sin(t * 10), '#ffd84a', 'center', 6);
  else if (prev && prev.corta) swTexto(c, tr('¡LE CORTAS EL GOLPE!'), 270, SW_V.cartaY - 24, 24 + Math.sin(t * 12), '#4fc25a', 'center', 6);
  swPintaEfectos(c, t);
}
// fuera de combate: el nombre de lo que hay en el piso, grande, donde estaría el enemigo
function swPintaTituloNodo(c, t) {
  const P = SW_P, n = SW_NODOS[P.nodo] || null;
  const y = SW_V.pieE - 150;
  if (n) { swDibujaC(c, n.icono, 270, y - 50 + Math.round(Math.sin(t * 3) * 2) * 3, 6); swTitulo(c, tr(n.nombre).toUpperCase(), 270, y + 60, 44); }
  else if (P.nodo === 'cruce') { swTitulo(c, tr('ELIGE CAMINO'), 270, y + 40, 44); }
  else if (P.nodo === 'inicio') { swTitulo(c, tr('LA TORRE'), 270, y, 52); swTexto(c, tr('de Microblizz'), 270, y + 46, 26, '#fff6d8'); }
}

/* ---------- la mecha (el tiempo de cada carta en combate) y el frenesí ---------- */
function swPintaMecha(c, t) {
  const P = SW_P, C = P.C; if (!C) return;
  if (P.carta && P.fase === 'carta' && !SW_G.sale) {
    const k = clamp(SW_MECHA.t / (SW_MECHA.max || SW_CFG.mecha), 0, 1), y = SW_V.cartaCY + 180 * SW_V.kc + 6, w = 230;
    swPanel(c, 270 - w / 2 - 6, y, w + 12, 20, '#2a1830', '#3a2440', '#1a0f1f');
    const urge = k < 0.3;
    c.fillStyle = urge ? (Math.sin(t * 24) > 0 ? '#ff5a4f' : '#ffd84a') : '#ffb13d';
    c.fillRect(270 - w / 2, y + 6, Math.round(w * k), 8);
    // la chispa de la mecha
    const cx = 270 - w / 2 + w * k; c.fillStyle = '#fff6a0'; c.fillRect(Math.round(cx) - 3, y + 3 + (Math.sin(t * 40) > 0 ? 0 : 3), 6, 6);
  }
  // la racha: 4 llamitas que se encienden antes del frenesí
  // a la derecha de la carta, encima del marcador, sin pisar la mecha
  const fr = C.racha >= SW_CFG.frenesi, yr = SW_V.hud - 22;
  if (!fr) {
    for (let i = 0; i < SW_CFG.frenesi; i++) {
      const on = i < C.racha, x = 416 + i * 28;
      c.fillStyle = SW_TINTA; c.fillRect(x - 2, yr - 12, 22, 24);
      c.fillStyle = on ? (i === C.racha - 1 && Math.sin(t * 16) > 0 ? '#fff6a0' : '#ff8a2a') : '#3a2440'; c.fillRect(x, yr - 10, 18, 20);
      if (on) { c.fillStyle = '#ffd84a'; c.fillRect(x + 6, yr - 4, 6, 10); }
    }
    if (C.racha >= 1) swTexto(c, tr('RACHA'), 470, yr - 26, 16, '#fff6a0', 'center', 5);
  }
}
/* ---------- el FRENESÍ: la pantalla arde ---------- */
function swLlama(c, x, base, alto, t, sem) {
  // una lengua de fuego pixelada (columnas de 6 px: rojo abajo, naranja, amarillo y punta blanca)
  const capas = [['#b3200f', 1], ['#ff5a1f', 0.8], ['#ffb13d', 0.55], ['#fff2a0', 0.28]];
  for (const [col, f] of capas) {
    const h = Math.round((alto * f * (0.75 + 0.25 * Math.sin(t * 11 + sem))) / 6) * 6;
    c.fillStyle = col; c.fillRect(x, base - h, 12, h);
  }
}
function swPintaFrenesi(c, t) {
  const F = SW_FX, H = SW_V.H, P = SW_P, C = P && P.C;
  const ardor = F.calor, racha = C ? C.racha : 0;
  if (ardor > 0) {
    // calor: el borde de la pantalla se pone naranja y late
    const g = c.createRadialGradient(270, H * 0.45, H * 0.25, 270, H * 0.45, H * 0.75);
    g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, `rgba(255,70,10,${(0.38 + 0.12 * Math.sin(t * 8)) * ardor})`);
    c.fillStyle = g; c.fillRect(0, 0, 540, H);
    // llamas por abajo (detrás del marcador) y por los lados; crecen con la racha
    const extra = Math.min(1.8, 1 + (racha - SW_CFG.frenesi) * 0.15), alto = 70 * ardor * extra;
    for (let x = -6; x < 546; x += 12) swLlama(c, x, SW_V.hud + 6, alto * (0.6 + 0.4 * Math.abs(Math.sin(x * 0.07))), t, x * 0.3);
    c.save(); c.translate(0, 0);
    for (let y = 120; y < SW_V.hud; y += 12) {
      const a = alto * 0.55 * (0.5 + 0.5 * Math.abs(Math.sin(y * 0.05 + t * 2)));
      c.save(); c.translate(0, y); c.rotate(Math.PI / 2); swLlama(c, 0, 0, a, t, y); c.restore();
      c.save(); c.translate(540, y + 12); c.rotate(-Math.PI / 2); swLlama(c, 0, 0, a, t, y + 9); c.restore();
    }
    c.restore();
    // las brasas que suben
    for (const b of F.brasas) { c.globalAlpha = 1 - b.t / b.vida; c.fillStyle = b.col; c.fillRect(Math.round(b.x / 3) * 3, Math.round(b.y / 3) * 3, b.lado, b.lado); }
    c.globalAlpha = 1;
    // el letrero de siempre mientras dura
    if (C && racha >= SW_CFG.frenesi && F.estallido < 0.55) {
      c.save(); c.translate(270, SW_V.barraE + 66); const k = 1 + 0.06 * Math.sin(t * 14); c.scale(k, k);
      swTituloFuego(c, tr('¡FRENESÍ! x{n}', { n: racha }), 0, 0, 30); c.restore();
    }
  }
}
// la entrada en FRENESÍ (encima de todo): onda de choque, destello y el letrero gigante
function swPintaEstallido(c, t) {
  const F = SW_FX, H = SW_V.H;
  if (F.humo > 0) { for (let i = 0; i < 14; i++) { c.globalAlpha = F.humo * 0.5; c.fillStyle = i % 2 ? '#5a4a66' : '#3a2e44'; const s = 18 + (1 - F.humo) * 40; c.fillRect(i * 40 + Math.sin(i) * 10, SW_V.hud - 30 - (1 - F.humo) * 80 - (i % 3) * 14, s, s); } c.globalAlpha = 1; }
  // la onda de choque al entrar: un anillo de píxeles que se abre
  if (F.onda > 0) {
    const r = F.onda * 620, n = 64; c.globalAlpha = 1 - F.onda;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; c.fillStyle = i % 2 ? '#fff6a0' : '#ff8a2a'; c.fillRect(Math.round(270 + Math.cos(a) * r) - 9, Math.round(SW_V.cartaCY + Math.sin(a) * r) - 9, 18, 18); }
    c.globalAlpha = 1;
  }
  // el estallido: destello blanco y el letrero gigante que cae y rebota
  if (F.estallido > 0) {
    const e = F.estallido, tt = 1 - e;   // tt va de 0 a 1
    if (tt < 0.15) { c.fillStyle = `rgba(255,240,200,${(1 - tt / 0.15) * 0.85})`; c.fillRect(0, 0, 540, H); }
    const caida = tt < 0.18 ? 3.2 - (tt / 0.18) * 2.2 : 1 + Math.sin((tt - 0.18) * 30) * 0.08 * Math.max(0, 1 - (tt - 0.18) * 3);
    c.save(); c.globalAlpha = tt > 0.8 ? (1 - tt) * 5 : 1;
    c.translate(270, SW_POS.enemigo[1] - 20); c.rotate(-0.08 + Math.sin(tt * 20) * 0.02 * e); c.scale(caida, caida);
    swTituloFuego(c, tr('¡FRENESÍ!'), 0, 0, 76);
    swTexto(c, tr('x{n} daño · x{m} oro', { n: SW_CFG.frenesiDano, m: SW_CFG.frenesiOro }), 0, 62, 24, '#fff6a0', 'center', 6);
    c.restore();
  }
}
// letras de fuego: degradado de amarillo a rojo, contorno grueso y sombra roja
function swTituloFuego(c, txt, x, y, tam) {
  swLetra(c, tam); c.textAlign = 'center'; c.textBaseline = 'middle';
  const b = Math.max(2, Math.round(tam * 0.08));
  c.fillStyle = '#7a1408'; for (const [dx, dy] of [[0, b * 3], [b, b * 3], [-b, b * 3]]) c.fillText(txt, x + dx, y + dy);
  c.fillStyle = SW_TINTA; for (let dy = -b; dy <= b * 2; dy += b) for (const dx of [-b, 0, b]) c.fillText(txt, x + dx, y + dy);
  const g = c.createLinearGradient(0, y - tam / 2, 0, y + tam / 2); g.addColorStop(0, '#fffbd0'); g.addColorStop(0.35, '#ffd23a'); g.addColorStop(0.7, '#ff7a1a'); g.addColorStop(1, '#e8301a');
  c.fillStyle = g; c.fillText(txt, x, y);
}

/* ---------- los golpes: tajos, estrellas de impacto, zarpazos, escudo, K.O. y el contador ---------- */
// una línea gorda de píxeles entre dos puntos (para los tajos y zarpazos)
function swLineaPx(c, x0, y0, x1, y1, grueso, col) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6); c.fillStyle = col;
  for (let i = 0; i <= n; i++) { const k = i / n, g = Math.max(3, grueso * Math.sin(k * Math.PI)); c.fillRect(Math.round((x0 + (x1 - x0) * k - g / 2) / 3) * 3, Math.round((y0 + (y1 - y0) * k - g / 2) / 3) * 3, g, g); }
}
function swPintaGolpes(c, t) {
  const F = SW_FX;
  for (const s of F.tajos) {
    if (s.t < 0) continue;
    const k = s.t / s.vida, avance = Math.min(1, 0.45 + k * 4), dx = Math.cos(s.ang), dy = Math.sin(s.ang), L = s.largo;
    const ax = s.x - dx * L / 2, ay = s.y - dy * L / 2, bx = ax + dx * L * avance, by = ay + dy * L * avance;
    const g = 44 * (1 - k * 0.8);
    c.globalAlpha = 1 - k * 0.6;
    swLineaPx(c, ax, ay, bx, by, g + 24, SW_TINTA); swLineaPx(c, ax, ay, bx, by, g + 14, s.col[2]); swLineaPx(c, ax, ay, bx, by, g + 6, s.col[1]); swLineaPx(c, ax, ay, bx, by, g * 0.5, s.col[0]);
  }
  for (const e of F.estrellas) {
    const k = e.t / e.vida, r = e.r * (0.4 + k * 0.9); c.globalAlpha = 1 - k;
    for (const [col, f] of [['#ff8a2a', 1], ['#fff6a0', 0.7], ['#ffffff', 0.42]]) {
      c.fillStyle = col; c.beginPath();
      for (let i = 0; i < e.puntas * 2; i++) { const a = (i / (e.puntas * 2)) * Math.PI * 2 + e.x, rr = (i % 2 ? r * 0.38 : r) * f; c.lineTo(Math.round((e.x + Math.cos(a) * rr) / 4) * 4, Math.round((e.y + Math.sin(a) * rr) / 4) * 4); }
      c.closePath(); c.fill();
    }
  }
  for (const z of F.zarpazos) {
    if (z.t < 0) continue;
    const k = z.t / z.vida, av = Math.min(1, 0.4 + k * 5), L = SW_V.H * 0.55;
    c.globalAlpha = 1 - k * 0.7;
    const x0 = z.x + 90, y0 = z.y - L * 0.3, x1 = x0 - 180 * av, y1 = y0 + L * av;
    swLineaPx(c, x0, y0, x1, y1, 46 * (1 - k * 0.5), '#5a0606'); swLineaPx(c, x0, y0, x1, y1, 32 * (1 - k * 0.5), '#e8301a'); swLineaPx(c, x0, y0, x1, y1, 12, '#ffd0c0');
  }
  c.globalAlpha = 1;
  // el escudo: un muro de hexágonos azules delante de la cámara
  if (F.escudoFx > 0) {
    c.globalAlpha = F.escudoFx * 0.6;
    for (let y = SW_V.cartaY - 110; y < SW_V.cartaY + 90; y += 36) for (let x = 30 + ((y / 36) % 2) * 18; x < 520; x += 36) {
      c.fillStyle = '#3f8cff'; c.fillRect(x - 15, y - 15, 30, 30); c.fillStyle = '#9fe8ff'; c.fillRect(x - 11, y - 11, 22, 22); c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(x - 11, y - 11, 22, 5);
    }
    c.globalAlpha = 1;
  }
  // K.O.: el enemigo sale volando dando vueltas y un sello gigante
  if (F.ko) {
    const k = F.ko.t, s = F.ko.s, [w, h] = swTam(F.ko.id, s), [ex, ey] = SW_POS.enemigo;
    c.save(); c.globalAlpha = Math.max(0, 1 - k * 0.9); c.translate(ex + k * 380, ey - k * 520 + k * k * 300); c.rotate(k * 9); const e = Math.max(0.2, 1 - k * 0.6); c.scale(e, e);
    c.filter = k < 0.12 ? 'brightness(4) saturate(0)' : 'none'; swDibuja(c, F.ko.id, -w / 2, -h / 2, s); c.filter = 'none'; c.restore();
    const sello = k < 0.12 ? 2.4 - k * 11 : 1 + Math.sin(k * 30) * 0.04 * Math.max(0, 1 - k);
    c.save(); c.globalAlpha = k > 0.85 ? (1.1 - k) * 4 : 1; c.translate(270, ey - 10); c.rotate(-0.12); c.scale(sello, sello);
    swTituloFuego(c, tr('¡K.O.!'), 0, 0, 110); c.restore();
  }
  // el contador de golpes seguidos
  if (F.cuenta.n >= 2 && F.cuenta.t < 1.1) {
    const pop = 1 + Math.max(0, 0.6 - F.cuenta.t * 4);
    c.save(); c.globalAlpha = F.cuenta.t > 0.8 ? (1.1 - F.cuenta.t) * 3.3 : 1; c.translate(420, SW_POS.enemigo[1] - 120); c.rotate(0.12); c.scale(pop, pop);
    swTituloFuego(c, tr('{n} GOLPES', { n: F.cuenta.n }), 0, 0, 40); c.restore();
  }
}

/* ---------- la siguiente carta (pequeña, a la derecha, para poder planear) ---------- */
function swPintaProxima(c, t) {
  const P = SW_P; if (!P.C || P.fase === 'fin') return;
  const sig = swProximaCarta(P); if (!sig) return;
  const D = SW_CARTAS[sig.id], arte = sig.giro ? [D.arte[1], D.arte[0]] : D.arte;
  const w = 92, h = 104, x = 540 - w - 6, y = SW_V.barraE + 58;
  c.save(); c.globalAlpha = 0.95;
  swPanel(c, x, y, w, h, '#6b4424', '#8a5a30', '#3e2612', 3);
  swPanel(c, x + 6, y + 6, w - 12, h - 12, '#f4e6c8', '#fff8e6', '#d8c49a', 3);
  swTexto(c, tr('SIGUIENTE'), x + w / 2, y - 10, 14, '#fff6a0', 'center', 4);
  swDibujaC(c, arte[0], x + 26, y + 38, 2); swDibujaC(c, arte[1], x + w - 26, y + 38, 2);
  c.fillStyle = '#c8b08a'; c.fillRect(x + w / 2 - 1, y + 18, 2, 40);
  swTextoCabe(c, swNombreCarta(sig.id, sig.mejor), x + w / 2, y + 80, 13, w - 16, '#3a2414', 'center', 0);
  c.restore();
}
