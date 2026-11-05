// Fans of Basement · Estilo (solo pantalla): el aspecto de Fans of Swipe, la Torre de Microblizz. Letra pixelada Jersey 10 con
// contorno grueso de esquinas rectas, el título dorado de la serie, paneles y botones de píxel (esquinas cortadas, luz arriba,
// sombra abajo), ventanas de pergamino con marco de madera y los dibujos de Yoshi (img/, copiados de Swipe) pintados sin suavizar.
// La pantalla mide 540 de ancho (como Swipe); el alto depende del móvil.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui = {};
  const LETRA = '"Jersey 10", "Courier New", monospace', TINTA = '#1a0f1f';
  UI.W = 540;
  UI.C = { tinta: TINTA, perg: '#f4e6c8', perg2: '#fff8e6', cafe: '#3a2414', naranja: '#ff8a2a', verde: '#4fc25a', azul: '#3a8ee6', rojo: '#e8413a',
    amarillo: '#ffd23a', oro: '#ffd84a', madera: '#8c2a26', crema: '#fff6d8', gris: '#6b4424' };
  const C = UI.C;
  // los botones: color, luz y sombra (los de Swipe)
  const BOTON = { naranja: ['#ff8a2a', '#ffc07a', '#c85a10'], verde: ['#4fc25a', '#9ee38a', '#2e8a3a'], azul: ['#3a8ee6', '#8ac4ff', '#1f5aa0'],
    rojo: ['#e8413a', '#ff9a8e', '#9a1f1a'], oro: ['#ffd23a', '#fff3a0', '#c8901a'], madera: ['#8c2a26', '#c2432e', '#5a1714'], apagado: ['#6b5a4a', '#8a7a68', '#4a3a2c'] };

  // ---------- letra ----------
  const fuente = (g, tam) => { g.font = Math.round(tam * 1.5) + 'px ' + LETRA; };   // Jersey 10 es estrecha: se agranda para que se lea igual
  UI.fuente = fuente;
  UI.texto = function (g, t, x, y, tam, color, alin, borde) {
    fuente(g, tam); g.textAlign = alin || 'center'; g.textBaseline = 'middle';
    x = Math.round(x); y = Math.round(y);
    const b = borde == null ? Math.max(3, tam / 5) : borde;
    if (b) { g.lineJoin = 'miter'; g.miterLimit = 2.5; g.lineWidth = b; g.strokeStyle = TINTA; g.strokeText(t, x, y + Math.max(2, Math.round(b * 0.45))); g.strokeText(t, x, y); }
    g.fillStyle = color || '#ffffff'; g.fillText(t, x, y);
  };
  // como texto(), pero si no cabe en `ancho` se hace más pequeño
  UI.textoCabe = function (g, t, x, y, tam, ancho, color, alin, borde) {
    let n = tam; fuente(g, n);
    while (n > tam * 0.55 && g.measureText(t).width > ancho) { n -= 0.5; fuente(g, n); }
    UI.texto(g, t, x, y, n, color, alin, borde);
  };
  // parte un texto en líneas que quepan en `ancho` y las pinta; devuelve cuántas líneas
  UI.lineas = function (g, t, x, y, tam, ancho, color, alin, borde, interlinea) {
    fuente(g, tam);
    const filas = [];
    for (const parr of String(t).split('\n')) {
      let l = '';
      for (const p of parr.split(' ')) { const q = l ? l + ' ' + p : p; if (g.measureText(q).width > ancho && l) { filas.push(l); l = p; } else l = q; }
      if (l) filas.push(l);
    }
    filas.forEach((f, i) => UI.texto(g, f, x, y + i * (interlinea || tam * 1.25), tam, color, alin, borde));
    return filas.length;
  };
  // el título dorado de la serie
  UI.titulo = function (g, t, x, y, tam) {
    fuente(g, tam); g.textAlign = 'center'; g.textBaseline = 'middle';
    const b = Math.max(2, Math.round(tam * 0.09));
    g.fillStyle = TINTA;
    for (let dy = -b; dy <= b * 2.2; dy += b) for (const dx of [-b, 0, b]) g.fillText(t, x + dx, y + dy);
    const gr = g.createLinearGradient(0, y - tam / 2, 0, y + tam / 2);
    gr.addColorStop(0, '#fff6a0'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(1, '#ff9a1a');
    g.fillStyle = gr; g.fillText(t, x, y);
  };

  // ---------- paneles y botones de píxel ----------
  UI.panel = function (g, x, y, w, h, base, luz, sombra, p) {
    p = p || 4; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    g.fillStyle = TINTA; g.fillRect(x + p, y, w - 2 * p, h); g.fillRect(x, y + p, w, h - 2 * p);
    g.fillStyle = base; g.fillRect(x + p, y + p, w - 2 * p, h - 2 * p);
    if (luz) { g.fillStyle = luz; g.fillRect(x + p, y + p, w - 2 * p, Math.max(p, Math.round(h * 0.12))); }
    if (sombra) { g.fillStyle = sombra; g.fillRect(x + p, y + h - p - Math.max(p, Math.round(h * 0.14)), w - 2 * p, Math.max(p, Math.round(h * 0.14))); }
  };
  // un botón: b = { x, y, w, h }; color: 'naranja' | 'verde' | 'azul' | 'rojo' | 'oro' | 'madera' | 'apagado'
  UI.boton = function (g, b, color, texto, tam, colorTexto) {
    const [base, luz, sombra] = BOTON[color] || BOTON.naranja;
    UI.panel(g, b.x, b.y, b.w, b.h, base, luz, sombra, 5);
    if (texto) UI.textoCabe(g, texto, b.x + b.w / 2, b.y + b.h / 2 - 1, tam || 28, b.w - 20, colorTexto || '#ffffff');
  };
  // la ventana de pergamino con marco de madera
  UI.pergamino = function (g, x, y, w, h) {
    UI.panel(g, x, y, w, h, '#6b4424', null, null, 5);
    UI.panel(g, x + 8, y + 8, w - 16, h - 16, C.perg, C.perg2, '#e2cfa6', 4);
  };
  // la franja oscura de los lemas (como el de la portada de Swipe)
  UI.franja = function (g, t, x, y, tam, ancho) {
    fuente(g, tam);
    const w = Math.min(ancho || 500, g.measureText(t).width + 36);
    g.fillStyle = TINTA; g.fillRect(x - w / 2 - 4, y - tam * 0.9 - 4, w + 8, tam * 1.8 + 8);
    g.fillStyle = 'rgba(26,15,31,0.86)'; g.fillRect(x - w / 2, y - tam * 0.9, w, tam * 1.8);
    UI.textoCabe(g, t, x, y, tam, w - 20, C.crema, 'center', 0);
  };
  UI.barra = function (g, x, y, w, h, v, color) {
    UI.panel(g, x, y, w, h, '#2a1830', '#3a2440', TINTA, 3);
    const f = Math.max(0, Math.min(1, v));
    g.fillStyle = color; g.fillRect(x + 6, y + 6, Math.round((w - 12) * f), h - 12);
    g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(x + 6, y + 6, Math.round((w - 12) * f), 3);
  };
  UI.dentro = (p, b) => p.x >= b.x - 4 && p.x <= b.x + b.w + 4 && p.y >= b.y - 4 && p.y <= b.y + b.h + 4;

  // ---------- los dibujos de Yoshi (img/) ----------
  const IMG = UI.IMG = {};
  UI.LISTA_IMG = ['becario', 'descargabot', 'plusbot', 'ladirectora', 'survivalbot', 'servidorbot', 'presidente', 'cajabotin', 'r-taza', 'r-post',
    'r-grapadora', 'r-silla', 'r-auriculares', 'r-tarjeta', 'r-iman', 'i-oro', 'ev-lola', 'soportebot', 'fondo-vestibulo', 'fondo-estudios',
    'fondo-oficinas', 'fondo-lan', 'fondo-servidores', 'fondo-sede', 'i-flecha'];
  UI.cargaImagenes = () => Promise.all(UI.LISTA_IMG.map((n) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => { IMG[n] = im; ok(); };
    im.onerror = () => { console.warn('Basement: falta la imagen', n); ok(); };
    im.src = 'img/' + n + '.png';
  })));
  // pinta un dibujo centrado en (x, y) a `esc` píxeles de pantalla por píxel del dibujo (entero = nítido)
  UI.dibuja = function (g, n, x, y, esc, opc) {
    const im = IMG[n];
    if (!im) return false;
    const o = opc || {}, w = im.width * esc, h = im.height * esc;
    g.save(); g.imageSmoothingEnabled = false;
    if (o.alfa != null) g.globalAlpha = o.alfa;
    if (o.filtro) g.filter = o.filtro;
    g.translate(Math.round(x), Math.round(y));
    if (o.izq) g.scale(-1, 1);
    g.drawImage(im, Math.round(-w / 2), Math.round(o.pie ? -h : -h / 2), Math.round(w), Math.round(h));
    g.restore();
    return true;
  };
  // un fondo vertical (135×240) que llena el rectángulo, recortado y centrado
  UI.fondo = function (g, n, x, y, w, h, oscuro) {
    const im = IMG[n];
    g.fillStyle = '#120a1c'; g.fillRect(x, y, w, h);
    if (!im) return;
    const s = Math.ceil(Math.max(w / im.width, h / im.height));
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.imageSmoothingEnabled = false;
    g.drawImage(im, Math.round(x + (w - im.width * s) / 2), Math.round(y + (h - im.height * s) / 2), im.width * s, im.height * s);
    if (oscuro) { g.fillStyle = 'rgba(10,5,20,' + oscuro + ')'; g.fillRect(x, y, w, h); }
    g.restore();
  };
  // el fondo de las pantallas de fuera de la bajada: el vestíbulo de Microblizz, oscurecido arriba y abajo
  UI.fondoMenu = function (g, W, H, n) {
    UI.fondo(g, n || 'fondo-vestibulo', 0, 0, W, H);
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, 'rgba(10,5,20,.6)'); gr.addColorStop(0.25, 'rgba(10,5,20,.15)'); gr.addColorStop(0.7, 'rgba(10,5,20,.25)'); gr.addColorStop(1, 'rgba(10,5,20,.75)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  };
  UI.moneda = (g, x, y, esc) => UI.dibuja(g, 'i-oro', x, y, esc || 2);
})(BAS);
