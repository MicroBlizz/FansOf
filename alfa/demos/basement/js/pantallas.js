// Fans of Basement · Pantallas (solo pantalla): la letra con contorno, el marcador de la bajada (café, planta y zona, caja del
// despedido y el botón del ascensor), la palanca del dedo y las pantallas de fuera: portada, tu mesa (las tres mejoras y BAJAR)
// y el resultado de la bajada. Cada pantalla devuelve sus botones para que principal.js sepa qué se ha tocado.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const UI = B.ui = {};
  const TITULO = "'Luckiest Guy', 'Arial Black', Impact, sans-serif", LETRA = "'Baloo 2', 'Trebuchet MS', system-ui, sans-serif";
  const C = { naranja: '#ff8a2a', verde: '#2fbf5a', rojo: '#e5322d', amarillo: '#ffe14a', azul: '#3b8de0', tinta: '#161616', crema: '#fff4dc', marron: '#a65a1f' };
  UI.C = C;

  UI.texto = function (g, t, x, y, tam, color, alin, titulo, contorno) {
    g.font = (titulo ? '' : '800 ') + tam + 'px ' + (titulo ? TITULO : LETRA);
    g.textAlign = alin || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (contorno !== false) { g.lineWidth = Math.max(3, tam / 4); g.strokeStyle = C.tinta; g.strokeText(t, x, y); }
    g.fillStyle = color; g.fillText(t, x, y);
  };
  const T = UI.texto;
  // Igual que texto(), pero baja el tamaño de la letra hasta que quepa en `ancho`.
  UI.textoCabe = function (g, t, x, y, tam, ancho, color, alin, titulo, contorno) {
    let n = tam;
    g.font = (titulo ? '' : '800 ') + n + 'px ' + (titulo ? TITULO : LETRA);
    while (n > 8 && g.measureText(t).width > ancho) { n--; g.font = (titulo ? '' : '800 ') + n + 'px ' + (titulo ? TITULO : LETRA); }
    T(g, t, x, y, n, color, alin, titulo, contorno);
  };

  function caja(g, x, y, w, h, color, r) {
    g.fillStyle = C.tinta; redondo(g, x - 3, y - 3, w + 6, h + 6, (r || 10) + 3); g.fill();
    g.fillStyle = color; redondo(g, x, y, w, h, r || 10); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; redondo(g, x + 4, y + 3, w - 8, h * 0.35, (r || 10) - 2); g.fill();
  }
  function redondo(g, x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
  UI.caja = caja;

  function boton(g, b, color, texto, tam, sub) {
    caja(g, b.x, b.y, b.w, b.h, color, 12);
    T(g, texto, b.x + b.w / 2, b.y + b.h / 2 + (sub ? -7 : 2), tam, '#ffffff', 'center', true);
    if (sub) T(g, sub, b.x + b.w / 2, b.y + b.h / 2 + 13, 12, C.amarillo);
  }
  UI.dentro = (p, b) => p.x >= b.x - 6 && p.x <= b.x + b.w + 6 && p.y >= b.y - 6 && p.y <= b.y + b.h + 6;

  function moneda(g, x, y, r) {
    g.fillStyle = C.tinta; g.beginPath(); g.arc(x, y, r + 2, 0, 7); g.fill();
    g.fillStyle = C.amarillo; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    T(g, 'M', x, y + 1, r * 1.2, '#c98f00', 'center', true, false);
  }
  UI.moneda = moneda;

  // ---------- marcador de la bajada ----------
  UI.botonAscensor = (W, H) => ({ x: W / 2 - 84, y: H - 74, w: 168, h: 52 });

  function cafe(g, e) {
    const x = 44, y = 46, r = 32, f = e.cafe / e.cafeMax, bajo = f < 0.25 && Math.floor(e.t * 4) % 2;
    g.fillStyle = C.tinta; g.beginPath(); g.arc(x, y, r + 4, 0, 7); g.fill();
    g.fillStyle = '#3a2416'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.strokeStyle = bajo ? C.rojo : C.naranja; g.lineWidth = 7; g.beginPath(); g.arc(x, y, r - 5, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); g.stroke();
    T(g, String(Math.ceil(e.cafe)), x, y + 3, 24, bajo ? C.rojo : '#ffffff', 'center', true);
    B.dibujaSprite(g, 'taza_hud', x + 28, y + 26, 2);
  }

  function planta(g, e, W) {
    T(g, tr('PLANTA') + ' ' + (e.planta ? '-' + e.planta : '0'), W / 2, 26, 22, '#ffffff', 'center', true);
    T(g, tr(e.zona.nombre).toUpperCase(), W / 2, 50, 12, C.amarillo);
    if (!e.zona.crunch) return;
    caja(g, W / 2 - 52, 62, 104, 20, C.rojo, 6);
    T(g, tr('CRUNCH ZONE'), W / 2, 73, 11, '#ffffff', 'center', true, false);
  }

  function cajaHud(g, e, W) {
    const x = W - 60, llena = e.caja.peso >= e.caja.cap;
    B.dibujaSprite(g, 'caja', x - 30, 36, 3);
    T(g, e.caja.peso + '/' + e.caja.cap, x + 20, 38, 18, llena ? C.rojo : '#ffffff', 'center', true);
    g.fillStyle = C.tinta; g.fillRect(x - 46, 58, 96, 9);
    g.fillStyle = llena ? C.rojo : C.verde; g.fillRect(x - 44, 60, 92 * Math.min(1, e.caja.peso / e.caja.cap), 5);
  }

  function ascensor(g, e, W, H) {
    const b = UI.botonAscensor(W, H);
    if (e.ascensorT >= 0) boton(g, b, C.verde, tr('LLEGA EN') + ' ' + Math.ceil(e.ascensorT), 20);
    else boton(g, b, C.naranja, tr('ASCENSOR'), 22, tr('subir con la caja'));
  }

  UI.marcador = function (g, e, W, H) { cafe(g, e); planta(g, e, W); cajaHud(g, e, W); if (!e.fin) ascensor(g, e, W, H); };

  UI.palanca = function (g, joy) {
    if (!joy.activo) return;
    g.globalAlpha = 0.5;
    g.fillStyle = C.tinta; g.beginPath(); g.arc(joy.ox, joy.oy, 46, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(joy.ox, joy.oy, 42, 0, 7); g.fill();
    g.globalAlpha = 0.9;
    g.fillStyle = C.tinta; g.beginPath(); g.arc(joy.ox + joy.dx * 40, joy.oy + joy.dy * 40, 22, 0, 7); g.fill();
    g.fillStyle = C.naranja; g.beginPath(); g.arc(joy.ox + joy.dx * 40, joy.oy + joy.dy * 40, 19, 0, 7); g.fill();
    g.globalAlpha = 1;
  };

  // ---------- fondo de las pantallas de fuera: el hueco del ascensor visto desde arriba ----------
  function fondo(g, W, H, t) {
    g.fillStyle = '#2a3250'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#323c60';
    for (let y = ((t * 30) % 60) - 60; y < H; y += 60) g.fillRect(0, y, W, 30);
  }
  UI.fondo = fondo;

  // ---------- portada ----------
  UI.portada = function (g, W, H, t) {
    fondo(g, W, H, t);
    T(g, 'FANS OF', W / 2, H * 0.17, 30, C.amarillo, 'center', true);
    T(g, 'BASEMENT', W / 2, H * 0.17 + 44, 52, C.naranja, 'center', true);
    T(g, tr('Baja al sótano de Microblizz'), W / 2, H * 0.17 + 86, 15, '#ffffff');
    B.dibujaSprite(g, 'jugador', W / 2, H * 0.5 + Math.sin(t * 2) * 6, 6);
    B.dibujaSprite(g, 'bug', W / 2 - 110, H * 0.6 + Math.sin(t * 3) * 8, 4);
    B.dibujaSprite(g, 'correo', W / 2 + 105, H * 0.42 + Math.sin(t * 2.4) * 8, 4);
    B.dibujaSprite(g, 'reunion', W / 2 + 96, H * 0.68 + Math.sin(t * 1.7) * 6, 3);
    if (Math.floor(t * 2) % 2) T(g, tr('Toca para empezar'), W / 2, H * 0.84, 20, '#ffffff', 'center', true);
    return [];
  };
})(BAS);
