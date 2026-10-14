// Fans of Dark · arte píxel (1 de 2): las paletas que salen de los colores de cada mazmorra, las texturas de paredes, suelos, techos y
// puertas (64x64, dibujadas a mano con píxeles gordos), los personajes de la serie pasados a píxel, los cofres, el botín, los portales,
// las antorchas y el texto píxel. No sabe nada del juego: solo fabrica dibujos. Los decorados, las armas y los iconos van en pixel-props.js.
'use strict';
const PX_CACHE = {};
function pxRng(semilla) { let a = semilla >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function pxLienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c, x]; }

/* ---------- colores ---------- */
function pxHex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function pxCss(c) { return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; }
// aclara (f > 0, hacia el blanco) u oscurece (f < 0, hacia el negro) un color
function pxTono(c, f) { return f >= 0 ? c.map(v => v + (255 - v) * f) : c.map(v => v * (1 + f)); }
function pxMezcla(a, b, f) { return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
// la paleta de una pared o un suelo a partir de un solo color: tonos, juntas, luz y sombra
function pxPaleta(hexBase) {
  const b = pxHex(hexBase);
  return { base: b, tonos: [pxTono(b, 0.1), b, pxTono(b, -0.12), pxTono(b, 0.04)].map(pxCss), mortero: pxCss(pxTono(b, -0.5)), luz: pxCss(pxTono(b, 0.28)), sombra: pxCss(pxTono(b, -0.35)), oscuro: pxCss(pxTono(b, -0.65)) };
}
// deja pocos colores por canal: así hasta un dibujo suave parece de píxel gordo
function pxPosteriza(d, paso = 24, corte = 110) {
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < corte) { d[i + 3] = 0; continue; }
    d[i + 3] = 255; d[i] = Math.min(255, Math.round(d[i] / paso) * paso); d[i + 1] = Math.min(255, Math.round(d[i + 1] / paso) * paso); d[i + 2] = Math.min(255, Math.round(d[i + 2] / paso) * paso);
  }
}
const pxTex = fn => { const [c, x] = pxLienzo(64, 64); fn(x); return x.getImageData(0, 0, 64, 64); };
function pxPuntos(x, r, n, x0, y0, w, h, a, b, alfa = 0.45) {   // granito: puntitos claros y oscuros al azar
  x.globalAlpha = alfa; for (let k = 0; k < n; k++) { x.fillStyle = r() < 0.5 ? a : b; x.fillRect(x0 + Math.floor(r() * w), y0 + Math.floor(r() * h), 1, 1); } x.globalAlpha = 1;
}

/* ---------- paredes: 'piedra' (ladrillos), 'bloques' (sillares grandes), 'paneles' (metal), 'madera' (tablones) ---------- */
function pxPared(estilo, hexBase, hexAcento, semilla = 7) {
  const key = 'pared:' + estilo + hexBase + hexAcento + semilla; if (PX_CACHE[key]) return PX_CACHE[key];
  const pal = pxPaleta(hexBase), ac = pxHex(hexAcento);
  const acento = pxCss(ac), acentoS = pxCss(pxTono(ac, -0.35));
  return (PX_CACHE[key] = pxTex(x => {
    const r = pxRng(semilla);
    x.fillStyle = pal.mortero; x.fillRect(0, 0, 64, 64);
    if (estilo === 'piedra' || estilo === 'bloques') {
      const bw = estilo === 'bloques' ? 64 : 32, bh = estilo === 'bloques' ? 32 : 16;
      for (let fila = 0; fila < 64 / bh; fila++) {
        const off = (fila % 2) * (bw / 2);
        for (let i = -1; i <= 64 / bw; i++) {
          const bx = i * bw + off, by = fila * bh, w = bw - 2, h = bh - 2;
          x.fillStyle = pal.tonos[Math.floor(r() * pal.tonos.length)]; x.fillRect(bx + 1, by + 1, w, h);
          x.fillStyle = pal.luz; x.fillRect(bx + 1, by + 1, w, 1); x.fillRect(bx + 1, by + 1, 1, h);
          x.fillStyle = pal.sombra; x.fillRect(bx + 1, by + h, w, 1); x.fillRect(bx + w, by + 1, 1, h);
          pxPuntos(x, r, estilo === 'bloques' ? 36 : 9, bx + 2, by + 2, w - 2, h - 2, pal.luz, pal.sombra);
        }
      }
      for (let k = 0; k < (estilo === 'bloques' ? 4 : 7); k++) {   // manchas del color de la mazmorra: musgo, moho, neón… según la facción
        const mx = Math.floor(r() * 60), my = 30 + Math.floor(r() * 30), mw = 3 + Math.floor(r() * 9), mh = 2 + Math.floor(r() * 3);
        x.fillStyle = acento; x.fillRect(mx, my, mw, mh); x.fillStyle = acentoS; x.fillRect(mx, my + mh, mw - 1, 1);
      }
    } else if (estilo === 'paneles') {
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const bx = i * 32, by = j * 32;
        x.fillStyle = pal.tonos[(i + j) % 2 ? 0 : 1]; x.fillRect(bx + 2, by + 2, 28, 28);
        x.fillStyle = pal.luz; x.fillRect(bx + 2, by + 2, 28, 1); x.fillRect(bx + 2, by + 2, 1, 28);
        x.fillStyle = pal.sombra; x.fillRect(bx + 2, by + 29, 28, 1); x.fillRect(bx + 29, by + 2, 1, 28);
        x.fillStyle = pal.oscuro; for (const [px, py] of [[5, 5], [26, 5], [5, 26], [26, 26]]) x.fillRect(bx + px, by + py, 2, 2);   // remaches
        pxPuntos(x, r, 10, bx + 4, by + 4, 24, 24, pal.luz, pal.sombra, 0.3);
      }
      x.fillStyle = acento; x.fillRect(8, 44, 14, 3); x.fillRect(42, 12, 10, 3); x.fillStyle = acentoS; x.fillRect(8, 47, 14, 1); x.fillRect(42, 15, 10, 1);   // luces y cables
      x.fillStyle = pal.oscuro; x.fillRect(0, 31, 64, 2); x.fillRect(31, 0, 2, 64);
    } else {   // madera: tablones verticales
      for (let i = 0; i < 8; i++) {
        x.fillStyle = pal.tonos[i % 3]; x.fillRect(i * 8 + 1, 0, 7, 64); x.fillStyle = pal.luz; x.fillRect(i * 8 + 1, 0, 1, 64);
        for (let k = 0; k < 3; k++) { x.fillStyle = pal.sombra; const vy = Math.floor(r() * 56); x.fillRect(i * 8 + 2 + Math.floor(r() * 4), vy, 1, 4 + Math.floor(r() * 10)); }
        x.fillStyle = pal.oscuro; x.fillRect(i * 8 + 4, 6 + (i % 2) * 48, 2, 2);   // los clavos
      }
      x.fillStyle = acento; x.fillRect(0, 22, 64, 3); x.fillStyle = acentoS; x.fillRect(0, 25, 64, 1);   // una banda del color de la mazmorra
    }
  }));
}
// 'losas' (piedra), 'baldosas' (damero), 'rejilla' (metal), 'tablas' (madera), 'moqueta' (oficina)
function pxSuelo(estilo, hexBase, hexAcento, semilla = 21) {
  const key = 'suelo:' + estilo + hexBase + hexAcento + semilla; if (PX_CACHE[key]) return PX_CACHE[key];
  const pal = pxPaleta(hexBase), acento = pxCss(pxHex(hexAcento));
  return (PX_CACHE[key] = pxTex(x => {
    const r = pxRng(semilla);
    x.fillStyle = pal.mortero; x.fillRect(0, 0, 64, 64);
    if (estilo === 'losas' || estilo === 'baldosas') {
      const n = estilo === 'baldosas' ? 4 : 2, t = 64 / n;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        x.fillStyle = estilo === 'baldosas' ? pal.tonos[(i + j) % 2 ? 2 : 0] : pal.tonos[Math.floor(r() * pal.tonos.length)]; x.fillRect(i * t + 1, j * t + 1, t - 1, t - 1);
        x.fillStyle = pal.luz; x.fillRect(i * t + 1, j * t + 1, t - 1, 1);
        pxPuntos(x, r, estilo === 'baldosas' ? 4 : 14, i * t + 2, j * t + 2, t - 3, t - 3, pal.luz, pal.sombra, 0.4);
        if (estilo === 'losas' && r() < 0.6) { x.fillStyle = pal.sombra; let cx = i * t + 6 + Math.floor(r() * 18), cy = j * t + 6 + Math.floor(r() * 18); for (let k = 0; k < 7; k++) { x.fillRect(cx, cy, 1, 1); cx += r() < 0.6 ? 1 : 0; cy += r() < 0.5 ? 1 : -1; } }   // grietas
      }
    } else if (estilo === 'rejilla') {
      x.fillStyle = pal.tonos[2]; x.fillRect(0, 0, 64, 64);
      x.fillStyle = pal.oscuro; for (let i = 4; i < 64; i += 8) { x.fillRect(i, 0, 2, 64); x.fillRect(0, i, 64, 2); }
      x.fillStyle = pal.luz; for (let i = 3; i < 64; i += 8) { x.fillRect(i, 0, 1, 64); x.fillRect(0, i, 64, 1); }
      x.fillStyle = acento; x.globalAlpha = 0.5; x.fillRect(0, 30, 64, 4); x.globalAlpha = 1;   // una franja de luz por debajo
    } else if (estilo === 'tablas') {
      for (let j = 0; j < 8; j++) { x.fillStyle = pal.tonos[j % 3]; x.fillRect(0, j * 8 + 1, 64, 7); x.fillStyle = pal.sombra; x.fillRect((j * 23) % 64, j * 8 + 1, 1, 7); pxPuntos(x, r, 8, 0, j * 8 + 1, 64, 7, pal.luz, pal.sombra, 0.35); }
    } else {   // moqueta de oficina
      x.fillStyle = pal.tonos[1]; x.fillRect(0, 0, 64, 64); pxPuntos(x, r, 500, 0, 0, 64, 64, pal.luz, pal.sombra, 0.3);
      x.fillStyle = pal.sombra; x.fillRect(0, 31, 64, 1); x.fillRect(31, 0, 1, 64);
    }
  }));
}
function pxTecho(hexBase, hexAcento, semilla = 33) {
  const key = 'techo:' + hexBase + hexAcento; if (PX_CACHE[key]) return PX_CACHE[key];
  const pal = pxPaleta(hexBase);
  return (PX_CACHE[key] = pxTex(x => {
    const r = pxRng(semilla);
    x.fillStyle = pal.tonos[1]; x.fillRect(0, 0, 64, 64); pxPuntos(x, r, 160, 0, 0, 64, 64, pal.luz, pal.sombra, 0.3);
    x.fillStyle = pal.tonos[2]; for (let i = 0; i < 64; i += 32) { x.fillRect(i, 0, 2, 64); x.fillRect(0, i, 64, 2); }   // vigas, discretas
  }));
}
// puerta de madera con herrajes; si lleva cerradura, un candado del color de la llave que la abre
function pxPuerta(hexBase, hexLlave = null) {
  const key = 'puerta:' + hexBase + hexLlave; if (PX_CACHE[key]) return PX_CACHE[key];
  const m = pxHex('#8a5a30'), madera = [pxCss(pxTono(m, 0.12)), pxCss(m), pxCss(pxTono(m, -0.2))], hierro = '#8d93a8', hierroS = '#4d5468', marco = pxCss(pxTono(pxHex(hexBase), -0.55));
  return (PX_CACHE[key] = pxTex(x => {
    for (let i = 0; i < 8; i++) { x.fillStyle = madera[i % 3]; x.fillRect(i * 8, 0, 8, 64); x.fillStyle = madera[2]; x.fillRect(i * 8, 0, 1, 64); }
    for (const by of [10, 46]) { x.fillStyle = hierro; x.fillRect(0, by, 64, 7); x.fillStyle = hierroS; x.fillRect(0, by + 6, 64, 1); for (let i = 0; i < 6; i++) x.fillRect(5 + i * 11, by + 2, 2, 2); }
    x.fillStyle = marco; x.fillRect(0, 0, 3, 64); x.fillRect(61, 0, 3, 64); x.fillRect(0, 0, 64, 3);
    if (hexLlave) { x.fillStyle = hierroS; x.fillRect(24, 24, 16, 18); x.fillStyle = hexLlave; x.fillRect(26, 26, 12, 14); x.fillStyle = '#1a1226'; x.fillRect(30, 30, 4, 4); x.fillRect(31, 34, 2, 4); }
    else { x.fillStyle = hierro; x.fillRect(48, 30, 5, 5); x.fillStyle = hierroS; x.fillRect(49, 31, 2, 2); }
  }));
}
// pared con grieta: esconde un secreto (misma textura y una raja que se nota si te fijas)
function pxSecreto(base) {
  const key = 'secreto:' + base.data.length + base.data[0] + base.data[1000] + base.data[8000]; if (PX_CACHE[key]) return PX_CACHE[key];
  return (PX_CACHE[key] = pxTex(x => {
    x.putImageData(base, 0, 0); x.fillStyle = '#120a16';
    let cx = 30, cy = 4; for (let k = 0; k < 56; k++) { x.fillRect(cx, cy, 1, 1); cy += 1; cx += (k % 7 === 3) ? 1 : (k % 11 === 5) ? -1 : 0; }
  }));
}

/* ---------- personajes: los dibujos de la serie, encogidos y con pocos colores ---------- */
function pxPersonaje(k, alto = 64) {
  const key = 'pers:' + k + '@' + alto; if (PX_CACHE[key]) return PX_CACHE[key];
  const sp = SPR[k]; if (!sp) return null;
  const w = Math.max(2, Math.round(alto * sp.wd / sp.ht)), h = alto, [c, x] = pxLienzo(w, h);
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(sp.c, 0, 0, w, h);
  const img = x.getImageData(0, 0, w, h); pxPosteriza(img.data);
  const flash = new ImageData(new Uint8ClampedArray(img.data), w, h), f = flash.data;
  for (let i = 0; i < f.length; i += 4) if (f[i + 3]) { f[i] = 255; f[i + 1] = 240; f[i + 2] = 240; }
  return (PX_CACHE[key] = { img, flash, w, h, pie: sp.ay / sp.ht });
}
const pxImg = (c, x) => { const img = x.getImageData(0, 0, c.width, c.height); return { img, w: c.width, h: c.height, pie: 1 }; };

/* ---------- cosas de la mazmorra ---------- */
function pxCofre(abierto) {
  const key = 'cofre:' + abierto; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(24, 20), o = '#1a1226';
  x.fillStyle = o; x.fillRect(0, 6, 24, 14); x.fillStyle = '#9a5a2a'; x.fillRect(1, 7, 22, 12); x.fillStyle = '#c47a3a'; x.fillRect(2, 13, 20, 2);
  x.fillStyle = '#e8c252'; x.fillRect(1, 11, 22, 2); x.fillRect(4, 7, 2, 12); x.fillRect(18, 7, 2, 12);
  if (abierto) { x.fillStyle = o; x.fillRect(0, 0, 24, 7); x.fillStyle = '#7a4420'; x.fillRect(1, 1, 22, 5); x.fillStyle = '#e8c252'; x.fillRect(1, 1, 22, 1); x.fillStyle = '#fff3a0'; x.fillRect(6, 8, 12, 2); x.fillStyle = '#ffd24a'; x.fillRect(4, 9, 16, 2); }
  else { x.fillStyle = o; x.fillRect(0, 3, 24, 5); x.fillStyle = '#c47a3a'; x.fillRect(1, 4, 22, 3); x.fillStyle = '#e8c252'; x.fillRect(4, 4, 2, 3); x.fillRect(18, 4, 2, 3); x.fillStyle = '#fff3a0'; x.fillRect(11, 10, 2, 3); x.fillStyle = o; x.fillRect(11, 11, 2, 1); }
  return (PX_CACHE[key] = pxImg(c, x));
}
// el botín del suelo: un arma, una armadura o un tesoro, con el brillo de su rareza
function pxBotin(tipo, rareza) {
  const key = 'botin:' + tipo + rareza; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(16, 16), o = '#1a1226', col = DK_COLOR_RAREZA[rareza];
  x.fillStyle = col; x.globalAlpha = 0.35; x.fillRect(1, 12, 14, 4); x.globalAlpha = 1;   // el halo en el suelo
  if (tipo === 'arma') { x.fillStyle = o; x.fillRect(6, 0, 4, 12); x.fillRect(3, 9, 10, 2); x.fillStyle = '#d9dbe8'; x.fillRect(7, 1, 2, 8); x.fillStyle = '#8a5a30'; x.fillRect(7, 11, 2, 3); x.fillStyle = col; x.fillRect(4, 9, 8, 1); }
  else if (tipo === 'armadura') { x.fillStyle = o; x.fillRect(2, 2, 12, 12); x.fillStyle = '#9aa0b4'; x.fillRect(3, 3, 10, 10); x.fillStyle = '#d9dbe8'; x.fillRect(4, 4, 3, 3); x.fillStyle = col; x.fillRect(7, 7, 2, 4); x.fillStyle = o; x.fillRect(6, 3, 4, 1); }
  else { x.fillStyle = o; x.fillRect(4, 2, 8, 11); x.fillRect(2, 5, 12, 5); x.fillStyle = col; x.fillRect(5, 3, 6, 9); x.fillRect(3, 6, 10, 3); x.fillStyle = '#fff'; x.fillRect(6, 4, 2, 2); }
  return (PX_CACHE[key] = pxImg(c, x));
}
function pxPortal(fase) {   // 4 fases: el remolino gira
  const key = 'portal:' + fase; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(28, 36), r = pxRng(5 + fase);
  for (let j = 0; j < 36; j++) for (let i = 0; i < 28; i++) {
    const d = Math.hypot((i - 13.5) / 14, (j - 18) / 18); if (d > 1) continue;
    const giro = (Math.atan2(j - 18, i - 13.5) + fase * 0.8 + d * 4) % 1.2;
    x.fillStyle = d > 0.8 ? '#c9a6ff' : giro < 0.5 ? '#8b3dff' : d < 0.35 ? (r() < 0.4 ? '#f0e4ff' : '#5a1fd0') : '#a569ff'; x.fillRect(i, j, 1, 1);
  }
  return (PX_CACHE[key] = pxImg(c, x));
}
function pxPortalCerrado() {
  const key = 'portal:cerrado'; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(28, 36);
  x.fillStyle = '#2a2440'; for (let j = 0; j < 36; j++) for (let i = 0; i < 28; i++) { const d = Math.hypot((i - 13.5) / 14, (j - 18) / 18); if (d > 1 || d < 0.78) continue; x.fillRect(i, j, 1, 1); }
  x.fillStyle = '#5a4a7a'; x.fillRect(12, 16, 4, 4);
  return (PX_CACHE[key] = pxImg(c, x));
}
function pxAntorcha(fase, hexLuz = '#ffb02a') {   // 3 fases de llama, del color de la luz de la mazmorra
  const key = 'antorcha:' + fase + hexLuz; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(10, 26), o = '#1a1226', l = pxHex(hexLuz), fuera = pxCss(pxTono(l, -0.2)), dentro = pxCss(pxTono(l, 0.35)), punta = pxCss(pxTono(l, 0.75));
  x.fillStyle = o; x.fillRect(3, 12, 4, 14); x.fillStyle = '#7a4a22'; x.fillRect(4, 13, 2, 12); x.fillStyle = '#5a5a6a'; x.fillRect(2, 11, 6, 2);
  const ll = [[1, 4, 8, 7], [2, 2, 6, 9], [1, 5, 8, 6]][fase];
  x.fillStyle = fuera; x.fillRect(ll[0], ll[1], ll[2], ll[3]); x.fillStyle = dentro; x.fillRect(ll[0] + 1, ll[1] + 1, ll[2] - 2, ll[3] - 3); x.fillRect(4, ll[1] - 2, 2, 3); x.fillStyle = punta; x.fillRect(4, ll[1] + 3, 2, 2);
  return (PX_CACHE[key] = pxImg(c, x));
}
function pxProyectil(color, grande) {
  const key = 'proy:' + color + grande; if (PX_CACHE[key]) return PX_CACHE[key];
  const n = grande ? 12 : 8, [c, x] = pxLienzo(n, n), m = n / 2;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const d = Math.hypot(i + 0.5 - m, j + 0.5 - m) / m; if (d > 1) continue; x.fillStyle = d < 0.45 ? '#fff' : d < 0.8 ? color : '#1a1226'; x.fillRect(i, j, 1, 1); }
  return (PX_CACHE[key] = pxImg(c, x));
}
function pxLlave(color) {
  const key = 'llave:' + color; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(14, 16), o = '#1a1226';
  x.fillStyle = o; x.fillRect(2, 0, 10, 8); x.fillRect(5, 7, 4, 9); x.fillRect(8, 10, 3, 2); x.fillRect(8, 13, 3, 2);
  x.fillStyle = color; x.fillRect(3, 1, 8, 6); x.fillRect(6, 7, 2, 8); x.fillRect(8, 11, 2, 1); x.fillRect(8, 14, 2, 1); x.fillStyle = o; x.fillRect(5, 3, 3, 2);
  x.fillStyle = '#fff'; x.fillRect(3, 1, 2, 1);
  return (PX_CACHE[key] = pxImg(c, x));
}
// un estallido: círculo de píxeles del color dado (fase 0..1 lo abre y lo deshace)
function pxEstallido(color, fase) {
  const f = Math.min(3, Math.floor(fase * 4)), key = 'boom:' + color + f; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c, x] = pxLienzo(32, 32), r = pxRng(9 + f), rad = 6 + f * 4;
  for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { const d = Math.hypot(i - 15.5, j - 15.5); if (d > rad || (f > 1 && d < rad - 5) || r() < f * 0.2) continue; x.fillStyle = d < rad - 3 ? (f < 2 ? '#fff3a0' : color) : color; x.fillRect(i, j, 1, 1); }
  return (PX_CACHE[key] = pxImg(c, x));
}

/* ---------- texto de píxel gordo (los números de daño, los avisos en el lienzo) ---------- */
function pxTexto(s, size = 8, color = '#fff', borde = '#120a1a') {
  const fuente = (document.fonts && document.fonts.check(`${size}px "Press Start 2P"`)) ? `${size}px "Press Start 2P"` : `bold ${size}px Verdana, Arial, sans-serif`;
  const key = 'txt:' + s + size + color + borde + fuente[0]; if (PX_CACHE[key]) return PX_CACHE[key];
  const [c0, x0] = pxLienzo(8, 8); x0.font = fuente; const tw = Math.ceil(x0.measureText(s).width);
  const w = tw + 6, h = size + 6, [c, x] = pxLienzo(w, h);
  x.font = fuente; x.textBaseline = 'top'; x.fillStyle = borde;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) x.fillText(s, 3 + dx, 3 + dy);
  x.fillStyle = color; x.fillText(s, 3, 3);
  const img = x.getImageData(0, 0, w, h); pxPosteriza(img.data, 1, 120);
  return (PX_CACHE[key] = { img, w, h, pie: 1 });
}
