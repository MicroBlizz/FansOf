// Fans of Rumble · Arte pintado (ADR 084): personajes animados fotograma a fotograma (hojas de img/pintado/anim/, datos en anim.js).
// Cinco animaciones (quieto, andar, atacar, golpe, morir) y los dos lados pintados aparte: nunca se voltea el dibujo,
// así el arma no cambia de mano al girar (Daniel). Si sube por el camino se le ve de espaldas («esp»), cuando la hoja la tiene.
// Se carga después de arte.js y antes de 21-arranque.js. Solo con PINTADO.activo() (ajustes.js).
// El personaje que aún no tiene hoja se sigue viendo como antes (imagen pintada o dibujo original).
'use strict';
const V2A = (() => {
  const HOJA = {};                                  // clave -> Image de la hoja
  const DUR = { atacar: 0.5, golpe: 0.32, morir: 0.9 };   // las que se juegan una vez (segundos)
  const FPS = { quieto: 7, andar: 12 };             // las que se repiten
  const cache = {};                                 // fotogramas ya preparados para drawUnit
  const muertos = [];                               // los que están haciendo la animación de morir
  const fila = (D, lado, a) => { const i = D.filas.indexOf(lado + '-' + a); return i >= 0 ? i : D.filas.indexOf(lado + '-quieto'); };
  const escala = (key, D) => (BOX[key][3] + 3) / D.alto;   // unidades del juego por píxel: el quieto mide lo que el dibujo de siempre
  const escalaCampo = (key, D) => escala(key, D) * (PINTADO.tamano[key] || 1);   // en el campo, con el tamaño que eligió Daniel

  // un fotograma listo para drawUnit, que da la vuelta al dibujo cuando u.face = -1: si va a darle la vuelta, se guarda ya
  // volteado (espejo), así queda bien (el izquierdo pintado y la espalda tal cual, nunca el derecho en espejo)
  function fotograma(key, D, lado, a, col, espejo) {
    const id = key + '|' + lado + '|' + a + '|' + col + '|' + espejo;
    if (cache[id]) return cache[id];
    const im = HOJA[key], [cw, ch] = D.celda, f = Math.max(0, fila(D, lado, a)), sc = escalaCampo(key, D);
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const x = c.getContext('2d');
    if (espejo) { x.translate(cw, 0); x.scale(-1, 1); }
    x.drawImage(im, col * cw, f * ch, cw, ch, 0, 0, cw, ch);
    const masc = color => { const m = document.createElement('canvas'); m.width = cw; m.height = ch; const mx = m.getContext('2d'); mx.drawImage(c, 0, 0); mx.globalCompositeOperation = 'source-in'; mx.fillStyle = color; mx.fillRect(0, 0, cw, ch); return m; };
    const [px, py] = D.pies[lado] || D.pies.der;
    const r = { c, w: masc('#fff'), g: masc('#9aa3a0'), wd: cw * sc, ht: ch * sc, ax: (espejo ? cw - px : px) * sc, ay: py * sc, corrupto: null };
    r.corrupt = () => { if (!r.corrupto) { const t = document.createElement('canvas'); t.width = cw; t.height = ch; const tx = t.getContext('2d'); tx.drawImage(c, 0, 0); tx.globalCompositeOperation = 'source-atop'; tx.fillStyle = 'rgba(110,0,60,.34)'; tx.fillRect(0, 0, cw, ch); r.corrupto = t; } return r.corrupto; };
    return (cache[id] = r);
  }

  // qué animación toca a cada unidad (los golpes y ataques se juegan enteros; andar y quieto se repiten)
  function estado(u, D) {
    const v = u.v2 || (u.v2 = { a: 'quieto', t0: G.t, lunge: false, hit: false });
    if (u.lungeT > 0 && !v.lunge) { v.a = 'atacar'; v.t0 = G.t; }
    v.lunge = u.lungeT > 0;
    const golpe = u.hitT > 0 || u.kbT > 0;
    if (golpe && !v.hit && v.a !== 'atacar') { v.a = 'golpe'; v.t0 = G.t; }
    v.hit = golpe;
    const t = G.t - v.t0;
    if (DUR[v.a] && t < DUR[v.a]) return [v.a, Math.min(D.n - 1, Math.floor(t / DUR[v.a] * D.n))];
    const a = u.deployT > 0 ? 'quieto' : u.moving && u.stunT <= 0 ? 'andar' : 'quieto';
    if (v.a !== a) { v.a = a; v.t0 = G.t; }
    if (u.deployT > 0 || u.stunT > 0) return [a, 0];
    return [a, Math.floor((G.t - v.t0) * FPS[a] + (u.id || 0)) % D.n];
  }

  // de lado o de espaldas: de espaldas mientras sube (va hacia arriba más que hacia los lados) y la hoja tiene esa animación;
  // al atacar o recibir un golpe sigue con la vista que llevaba
  function vista(u, D, a) {
    const v = u.v2, dx = u.x - (v.x ?? u.x), dy = u.y - (v.y ?? u.y);
    v.x = u.x; v.y = u.y;
    if (u.moving && (dx || dy)) v.sube = dy < 0 && -dy > Math.abs(dx) * 0.7;
    else if (!u.moving && !u.target) v.sube = false;   // parado y sin pelea: de lado; peleando sigue como llegó
    const lado = u.face < 0 ? 'izq' : 'der';
    return v.sube && D.filas.includes('esp-' + a) ? 'esp' : lado;
  }

  // drawUnit del original con el fotograma que toca puesto en su sprite (y se deja como estaba al acabar)
  const drawUnitOriginal = drawUnit;
  drawUnit = function (u) {
    const D = V2_ANIM[u.type];
    if (!D || !HOJA[u.type] || !PINTADO.activo()) return drawUnitOriginal(u);
    const s = SPR[u.type], antes = { c: s.c, w: s.w, g: s.g, wd: s.wd, ht: s.ht, ax: s.ax, ay: s.ay };
    const [a, col] = estado(u, D), lado = vista(u, D, a), f = fotograma(u.type, D, lado, a, col, u.face < 0);
    const corrAntes = CORRUPT[u.type], T = TYPES[u.type], pieAntes = T.foot;
    T.foot = null;   // los pies dibujados del original no: la animación ya trae los suyos (se veían superpuestos)
    Object.assign(s, { c: f.c, w: f.w, g: f.g, wd: f.wd, ht: f.ht, ax: f.ax, ay: f.ay });
    if (u.corrupt) CORRUPT[u.type] = f.corrupt();
    try { drawUnitOriginal(u); }
    finally { Object.assign(s, antes); T.foot = pieAntes; if (u.corrupt) { if (corrAntes) CORRUPT[u.type] = corrAntes; else delete CORRUPT[u.type]; } }
  };

  // al morir, se queda en el suelo haciendo su animación y luego se desvanece
  const killOriginal = kill;
  kill = function (t, src) {
    const D = t && t.kind === 'unit' && V2_ANIM[t.type];
    if (D && HOJA[t.type] && PINTADO.activo() && D.filas.some(f => f.endsWith('-morir'))) muertos.push({ key: t.type, x: t.x, y: t.y, lado: t.face < 0 ? 'izq' : 'der', t0: G.t, corrupt: !!t.corrupt });
    return killOriginal(t, src);
  };
  const locasSueloOriginal = locasSuelo;
  locasSuelo = function () {
    locasSueloOriginal();
    for (let i = muertos.length - 1; i >= 0; i--) {
      const m = muertos[i], t = G.t - m.t0, D = V2_ANIM[m.key];
      if (t < 0 || t > DUR.morir + 1.4 || !D) { muertos.splice(i, 1); continue; }
      const [cw, ch] = D.celda, sc = escalaCampo(m.key, D), f = fila(D, m.lado, 'morir'), col = Math.min(D.n - 1, Math.floor(t / DUR.morir * D.n));
      const [px, py] = D.pies[m.lado] || D.pies.der;
      ctx.save(); ctx.globalAlpha = t > DUR.morir + 0.8 ? Math.max(0, 1 - (t - DUR.morir - 0.8) / 0.6) : 1;
      ctx.drawImage(HOJA[m.key], col * cw, f * ch, cw, ch, m.x - px * sc, m.y - py * sc, cw * sc, ch * sc);
      ctx.restore();
    }
  };

  // cartas, retratos y título: el retrato de frente si lo tiene (lo pinta arte.js); si no, el primer fotograma del quieto,
  // ajustado como los demás (misma altura, centrado: V2.dibujaAjustado)
  const drawVectorAntes = drawVector, marco = {};
  drawVector = function (c, key, x, y, h, flip = 1) {
    const D = V2_ANIM[key];
    if (!D || !HOJA[key] || V2.IMG['frente/' + key] || !PINTADO.activo()) return drawVectorAntes(c, key, x, y, h, flip);
    const lado = flip < 0 ? 'izq' : 'der', id = key + '-' + lado;
    if (!marco[id]) {
      const [cw, ch] = D.celda, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      cv.getContext('2d').drawImage(HOJA[key], 0, fila(D, lado, 'quieto') * ch, cw, ch, 0, 0, cw, ch); marco[id] = cv;
    }
    V2.dibujaAjustado(c, marco[id], x, y, h, 1);
  };

  // las hojas se bajan solo cuando el arte pintado está encendido (y una sola vez)
  let bajando = false;
  function bajaHojas() {
    if (bajando || !PINTADO.activo()) return;
    bajando = true;
    const ver = '?v=' + encodeURIComponent(NUCLEO.version || '0');
    for (const key in V2_ANIM) {
      const im = new Image();
      im.onload = () => { HOJA[key] = im; };
      im.src = PINTADO.ruta() + 'anim/' + key + '.webp' + ver;
    }
  }
  bajaHojas();
  NUCLEO.alCambiarFlags(bajaHojas);
  return { HOJA, muertos };
})();
