// Fans of Asalto · ADAPTADORES · Los dibujos: carga las tiras de img/ (pixel art de Yoshi, sacado con herramientas/comfyui/asalto/
// sprites.py) y los iconos, y pinta a cada muñeco en su animación: reposo, andar, ataque, golpe y muerte. Si a un personaje le falta
// algún fotograma, se suple moviendo su dibujo por código. Nunca se voltea un dibujo: los héroes miran a la derecha y los enemigos a
// la izquierda. Todo a su tamaño real (un píxel del dibujo, un píxel del lienzo) o a un múltiplo entero, sin suavizar.
'use strict';
AS.dibujos = (() => {
  const IMG = {}, TINTE = {}, CAJAS = {};
  const ANIM = {
    reposo: { f: ['reposo-1', 'reposo-2', 'reposo-3'], t: 0.45, bucle: true },
    andar: { f: ['andar-1', 'andar-2', 'andar-3', 'andar-4'], t: 0.12, bucle: true },
    ataque: { f: ['ataque-1', 'ataque-2', 'ataque-3', 'ataque-4', 'ataque-5', 'ataque-6'], t: 0, bucle: false },   // su ritmo lo pone la duración del ataque
    golpe: { f: ['golpe-1', 'golpe-2'], t: 0.22, bucle: false },
    muerte: { f: ['muerte-1', 'muerte-2'], t: 0.22, bucle: false },
  };
  // las tiras de los personajes y las de los héroes superiores (tarea #85), que traen más posturas: cada tira anima con las que tenga
  let TODAS = null;
  const tiras = () => TODAS || (TODAS = { ...AS.DIBUJOS.tiras, ...((AS.SUPERIORES && AS.SUPERIORES.tiras) || {}) });

  function carga(listo) {
    const nombres = [...Object.keys(tiras()), ...AS.DIBUJOS.fondos, ...AS.DIBUJOS.iconos.map(n => 'icono-' + n)];
    let faltan = nombres.length;
    const uno = () => { if (--faltan === 0) listo(); };
    for (const n of nombres) {
      const im = new Image();
      im.onload = () => { IMG[n] = im; uno(); };
      im.onerror = uno;
      im.src = 'img/' + n + '.png?v=' + NUCLEO.version;
    }
  }
  const hay = tipo => !!(IMG[tipo] && tiras()[tipo]);
  // la misma tira teñida entera de un color (blanco para el destello del golpe, oro para el Animal Dorado)
  function tenida(tipo, color, fuerza) {
    const clave = tipo + color;
    if (TINTE[clave]) return TINTE[clave];
    const im = IMG[tipo], cv = document.createElement('canvas'), c = cv.getContext('2d');
    cv.width = im.width; cv.height = im.height;
    c.drawImage(im, 0, 0); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = fuerza; c.fillStyle = color; c.fillRect(0, 0, cv.width, cv.height);
    return (TINTE[clave] = cv);
  }
  // el fotograma de la animación en ese momento, entre las posturas que tiene su tira (sin ninguna, el primero y se mueve por código)
  function cuadro(tipo, anim, tiempo, dura) {
    const d = tiras()[tipo], a = ANIM[anim] || ANIM.reposo, f = a.f.filter(k => d.f.includes(k));
    if (!f.length) return { i: 0, propio: false };
    const paso = a.t || (dura || 0.4) / f.length;
    let i = Math.floor(tiempo / paso);
    i = a.bucle ? i % f.length : Math.min(f.length - 1, i);
    return { i: d.f.indexOf(f[i]), propio: true };
  }
  // el movimiento por código cuando falta el fotograma propio: { dx, dy, giro }
  function suplido(u, hacia) {
    const t = u.tAnim || 0, fase = t + (u.id || 0) * 0.37;
    if (u.anim === 'andar') return { dx: 0, dy: -Math.abs(Math.sin(fase * 11)) * 4, giro: Math.sin(fase * 11) * 0.06 };
    if (u.anim === 'ataque') {
      const p = Math.min(1, t / (u.dura || 0.4)), emb = p < 0.35 ? -p / 0.35 * 0.4 : p < 0.6 ? -0.4 + (p - 0.35) / 0.25 * 1.4 : 1 - (p - 0.6) / 0.4;
      return { dx: emb * 12 * hacia, dy: 0, giro: emb * 0.12 * hacia };
    }
    if (u.anim === 'golpe') return { dx: -4 * hacia, dy: 0, giro: -0.1 * hacia };
    if (u.anim === 'muerte') { const p = Math.min(1, t / 0.5); return { dx: 0, dy: p * 6, giro: -p * 1.4 * hacia }; }
    return { dx: 0, dy: 0, giro: 0 };
  }
  // el movimiento que se suma a sus fotogramas propios: al andar, el bote del paso (AS.bote, acompasado con los fotogramas)
  function propio(u, esc) {
    return { dx: 0, dy: u.anim === 'andar' ? AS.bote(u.tAnim || 0, ANIM.andar.t, esc) : 0, giro: 0 };
  }
  // la tira con la que se pinta a alguien: los campeones de élite tienen la suya, más grande; si faltara, la normal al doble
  function tiraDe(tipo, elite) {
    if (elite && hay(tipo + '-elite')) return { tipo: tipo + '-elite', esc: 1 };
    return { tipo, esc: elite ? 2 : 1 };
  }
  // la tira que se ve de un héroe: la de su aspecto (AS.aspecto: la superior si ha ascendido, la de legendario o la de ser) si está
  // cargada; si no, su respaldo (la superior: mientras no llegue el dibujo del legendario o del ser); y si tampoco, la de su tipo
  function cual(aspecto, tipo) {
    if (!aspecto) return tipo;
    if (hay(aspecto.tira)) return aspecto.tira;
    return aspecto.respaldo && hay(aspecto.respaldo) ? aspecto.respaldo : tipo;
  }
  // los legendarios y los seres (tarea #109), hasta que llegue su dibujo: un aura que late detrás (dorada; la del ser, de dos colores)
  // y unos destellos que giran a su alrededor. En píxeles, sin suavizar
  const AURA = { legendario: ['#ffd23a', '#fff3d6'], ser: ['#ff7a1a', '#5ae0ff'], dios: ['#ffffff', '#ffd23a'] };
  // tarea #156: el dios, hasta que llegue su dibujo (tira «dios-<id>»), lleva detrás rayos de luz blancos y dorados que giran, además
  // del aura (blanca y dorada) y los destellos
  function rayos(g, w, h, t) {
    const cy = -h * 0.42, base = g.globalAlpha, largo = Math.max(w, h) * 0.85;
    for (let i = 0; i < 12; i++) {
      const a = t * 0.6 + i * Math.PI / 6, k = 0.5 + 0.5 * Math.sin(t * 5 + i), ancho = i % 2 ? 4 : 7;
      g.globalAlpha = base * (0.25 + k * 0.35);
      g.fillStyle = i % 2 ? '#ffd23a' : '#ffffff';
      for (let r = w * 0.2; r < largo * (0.75 + k * 0.25); r += 6) g.fillRect(Math.round(Math.cos(a) * r) - ancho / 2, Math.round(cy + Math.sin(a) * r) - ancho / 2, ancho, ancho);
    }
    g.globalAlpha = base;
  }
  function aura(g, aspecto, w, h, t) {
    if (aspecto.dios) rayos(g, w, h, t);
    const col = AURA[aspecto.dios ? 'dios' : aspecto.ser ? 'ser' : 'legendario'], k = 0.5 + Math.sin(t * 4) * 0.5, cy = -h * 0.42, base = g.globalAlpha;
    for (let i = 3; i >= 1; i--) {
      g.globalAlpha = base * (0.3 + k * 0.2) * (4 - i) / 3;
      g.fillStyle = col[i % 2 ? 0 : 1];
      const rx = Math.round(w * (0.26 + i * 0.07) + k * 3), ry = Math.round(h * (0.3 + i * 0.07) + k * 3);
      for (let y = -ry; y <= ry; y += 3) { const a = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))); g.fillRect(-a, Math.round(cy + y), a * 2, 3); }
    }
    g.globalAlpha = base;
    for (let i = 0; i < 4; i++) {   // los destellos: cruces de píxeles que giran
      const a = t * 2 + i * Math.PI / 2, x = Math.round(Math.cos(a) * w * 0.42), y = Math.round(cy + Math.sin(a) * h * 0.36), n = (i + Math.floor(t * 6)) % 3 === 0 ? 4 : 2;
      g.fillStyle = col[i % 2]; g.fillRect(x - n, y - 1, n * 2, 2); g.fillRect(x - 1, y - n, 2, n * 2);
    }
  }
  // los emblemas de sus improntas: giran despacio a su alrededor a media altura, pequeños (20 px) y con un halo del color de la clase
  function emblemas(g, lista, x, y, w, h, t) {
    const n = lista.length, L = 20;
    lista.forEach((k, i) => {
      const a = t * 1.6 + i * Math.PI * 2 / n, ex = Math.round(x + Math.cos(a) * w * 0.48), ey = Math.round(y - h * 0.42 + Math.sin(a) * 10);
      const im = IMG['icono-clase-' + k];
      g.fillStyle = ASALTO.clases[k].col; g.globalAlpha *= 0.35;
      g.beginPath(); g.arc(ex, ey, 12, 0, Math.PI * 2); g.fill(); g.globalAlpha /= 0.35;
      if (im) { g.imageSmoothingEnabled = false; g.drawImage(im, ex - L / 2, ey - L / 2, L, L); }
    });
  }
  // la tira con la que se pinta y a qué escala: la de su aspecto o la suya (con la de élite), por la escala propia (seres, Gigante, minimapaches)
  function tiraYEscala(u) {
    const visto = cual(u.aspecto, u.tipo), t = visto === u.tipo ? tiraDe(u.tipo, u.elite) : { tipo: visto, esc: 1 };
    return { tipo: t.tipo, esc: t.esc * (u.escala || 1) };
  }
  // la sombra en el suelo, a píxel
  function sombra(g, w, esc) {
    g.fillStyle = 'rgba(8,4,12,0.4)';
    const rx = Math.round(w * 0.3), ry = Math.max(3, Math.round(4 * esc));
    for (let i = -ry; i <= ry; i++) { const a = Math.round(rx * Math.sqrt(1 - (i * i) / (ry * ry + 0.01))); g.fillRect(-a, i - 1, a * 2, 1); }
  }
  const alfaDe = u => (u.alfa === undefined ? 1 : u.alfa);
  const vivo = u => u.anim !== 'muerte';
  // pinta un muñeco con los pies en (x, y). u: { tipo, aspecto (AS.aspecto, de los héroes), elite, anim, tAnim, dura, lado, alfa, destello (0-1), dorado, id,
  // escala (la de los seres, Gigante y los minimapaches; sin ella, 1) }
  function muneco(g, u, x, y) {
    if (!hay(u.tipo)) return;
    const { tipo, esc } = tiraYEscala(u), d = tiras()[tipo], w = Math.round(d.w * esc), h = Math.round(d.h * esc);
    const f = cuadro(tipo, u.anim, u.tAnim || 0, u.dura), m = f.propio ? propio(u, esc) : suplido(u, u.lado === 'heroe' ? 1 : -1);
    const img = u.dorado ? tenida(tipo, '#ffc21a', 0.42) : IMG[tipo], px = Math.round(x + m.dx), py = Math.round(y + m.dy), dy = Math.round(-h + 2 * esc);
    g.save();
    g.globalAlpha = alfaDe(u);
    g.translate(px, py);
    sombra(g, w, esc);
    if (u.aspecto && u.aspecto.legendario && vivo(u)) aura(g, u.aspecto, w, h, performance.now() / 1000 + (u.id || 0) * 0.3);
    if (m.giro) g.rotate(m.giro);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, f.i * d.w, 0, d.w, d.h, Math.round(-w / 2), dy, w, h);
    if (u.destello > 0) { g.globalAlpha *= Math.min(1, u.destello); g.drawImage(tenida(tipo, '#ffffff', 1), f.i * d.w, 0, d.w, d.h, Math.round(-w / 2), dy, w, h); }
    g.restore();
    conEmblemas(g, u, px, py, w, h);
  }
  // los emblemas de sus improntas, si los tiene y no está cayendo
  function conEmblemas(g, u, x, y, w, h) {
    if (!u.aspecto || !u.aspecto.emblemas.length || !vivo(u)) return;
    g.save(); g.globalAlpha = alfaDe(u);
    emblemas(g, u.aspecto.emblemas, x, y, w, h, (u.tAnim || 0) + (u.id || 0));
    g.restore();
  }
  // lo que mide de alto su fotograma (el dibujo deja un poco de aire arriba); escala: la suya, si no es 1
  function alto(tipo, elite, escala) {
    if (!hay(tipo)) return 80;
    const t = tiraDe(tipo, elite);
    return Math.round(tiras()[t.tipo].h * t.esc * (escala || 1));
  }
  const anchoDe = tipo => (hay(tipo) ? tiras()[tipo].w : 60);
  // dónde está de verdad el dibujo dentro de su primer fotograma (la tira deja sitio alrededor para los golpes): { x, y, w, h }
  function caja(tipo) {
    if (CAJAS[tipo]) return CAJAS[tipo];
    const d = tiras()[tipo], cv = document.createElement('canvas'), c = cv.getContext('2d', { willReadFrequently: true });
    cv.width = d.w; cv.height = d.h;
    c.drawImage(IMG[tipo], 0, 0, d.w, d.h, 0, 0, d.w, d.h);
    const a = c.getImageData(0, 0, d.w, d.h).data;
    let x0 = d.w, y0 = d.h, x1 = 0, y1 = 0;
    for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) if (a[(y * d.w + x) * 4 + 3] > 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return (CAJAS[tipo] = { x: x0, y: y0, w: Math.max(1, x1 - x0 + 1), h: Math.max(1, y1 - y0 + 1) });
  }
  // el busto de un personaje (su primer fotograma, a su tamaño) dentro de un rectángulo: la cabeza arriba, centrado, y lo que no cabe se corta
  function busto(g, tipo, r, dorado) {
    if (!hay(tipo)) return;
    const d = tiras()[tipo], c = caja(tipo);
    g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, r.h); g.clip();
    g.imageSmoothingEnabled = false;
    g.drawImage(dorado ? tenida(tipo, '#ffc21a', 0.42) : IMG[tipo], 0, 0, d.w, d.h, Math.round(r.x + r.w / 2 - c.x - c.w / 2), Math.round(r.y + 2 - c.y + Math.max(0, (r.h - c.h) / 2)), d.w, d.h);
    g.restore();
  }
  // un icono centrado en (x, y), a k veces su tamaño (entero). Devuelve si existe.
  function icono(g, nombre, x, y, k) {
    const im = IMG['icono-' + nombre];
    if (!im) return false;
    const e = Math.max(1, Math.round(k || 1));
    g.imageSmoothingEnabled = false;
    g.drawImage(im, Math.round(x - im.width * e / 2), Math.round(y - im.height * e / 2), im.width * e, im.height * e);
    return true;
  }
  const fondo = nombre => IMG[nombre] || null;
  // para las ventanas (HTML): la ruta del icono, y el estilo CSS que enseña el primer fotograma de un personaje
  const rutaIcono = nombre => 'img/icono-' + nombre + '.png?v=' + NUCLEO.version;
  function cssRetrato(tipo, k, fotograma) {
    const d = tiras()[tipo];
    if (!d) return '';
    const u = n => `calc(var(--as-u) * ${n * (k || 1)})`;
    return `background-image:url(img/${tipo}.png?v=${NUCLEO.version});width:${u(d.w)};height:${u(d.h)};background-size:${u(d.w * d.f.length)} ${u(d.h)};background-position:${u(-d.w * (fotograma || 0))} 0`;
  }
  return { carga, hay, cual, muneco, alto, anchoDe, caja, busto, icono, fondo, rutaIcono, cssRetrato };
})();
