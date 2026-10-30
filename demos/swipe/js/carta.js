// Fans of Swipe · CARTA: la carta del centro y el gesto de deslizarla. Arrastrar con el dedo (o el ratón) la inclina hacia
// un lado y enseña la previsión de ese lado; al soltar lejos (o con un tirón rápido) sale volando hacia ese lado y se elige.
// También vale tocar uno de los dos lados o usar las flechas del teclado. La siguiente carta cae desde arriba.
'use strict';
const SW_G = { x: 0, y: 0, arrastra: false, x0: 0, y0: 0, t0: 0, vx: 0, ux: 0, ut: 0, sale: 0, dir: 0, entra: 1, carta: null, prevL: null, prevR: null };
const SW_UMBRAL = 105;

// la previsión del lado hacia el que se inclina la carta (se calcula una vez por carta y lado)
function swPrevisionActual() {
  const P = SW_P; if (!P || !P.carta || P.fase !== 'carta') return null;
  if (SW_G.carta !== P.carta) { SW_G.carta = P.carta; SW_G.prevL = SW_G.prevR = undefined; SW_G.entra = 0; SW_G.x = 0; SW_G.sale = 0; }
  const k = SW_G.x / SW_UMBRAL;
  if (Math.abs(k) < 0.25) return null;
  if (k < 0) { if (SW_G.prevL === undefined) SW_G.prevL = swPrevision(P, P.carta, 'L'); return SW_G.prevL; }
  if (SW_G.prevR === undefined) SW_G.prevR = swPrevision(P, P.carta, 'R');
  return SW_G.prevR;
}

/* ---------- el gesto ---------- */
function swCartaDentro(lx, ly) { return Math.abs(lx - 270 - SW_G.x) < 135 * SW_V.kc + 24 && ly > SW_V.cartaY - 24 && ly < SW_V.cartaY + 360 * SW_V.kc + 20; }
function swEmpiezaArrastre(lx, ly) {
  if (!SW_P || !SW_P.carta || SW_P.fase !== 'carta' || SW_G.sale) return false;
  if (!swCartaDentro(lx, ly)) return false;
  Object.assign(SW_G, { arrastra: true, x0: lx - SW_G.x, y0: ly, t0: performance.now(), ux: lx, ut: performance.now(), vx: 0 });
  return true;
}
function swMueveArrastre(lx, ly) {
  if (!SW_G.arrastra) return;
  const ahora = performance.now(), dt = Math.max(1, ahora - SW_G.ut);
  SW_G.vx = SW_G.vx * 0.6 + ((lx - SW_G.ux) / dt) * 0.4; SW_G.ux = lx; SW_G.ut = ahora;
  SW_G.x = lx - SW_G.x0; SW_G.y = clamp((ly - SW_G.y0) * 0.25, -20, 30);
}
function swSueltaArrastre() {
  if (!SW_G.arrastra) return;
  SW_G.arrastra = false;
  const rapido = Math.abs(SW_G.vx) > 0.7 && Math.abs(SW_G.x) > 30;
  if (Math.abs(SW_G.x) > SW_UMBRAL || rapido) swLanza(SW_G.x < 0 || (rapido && SW_G.vx < 0) ? 'L' : 'R');
}
// intentar elegir un lado: si se puede, la carta sale volando; si no, vuelve con un meneo
function swLanza(lado) {
  const P = SW_P; if (!P || !P.carta || P.fase !== 'carta' || SW_G.sale) return;
  const L = swLados(P, P.carta)[lado === 'L' ? 0 : 1];
  if (L.bloqueado) { play('swNoVale'); swAviso(L.porque, '#ff5a4f'); SW_G.x = lado === 'L' ? 24 : -24; return; }
  SW_G.dir = lado === 'L' ? -1 : 1; SW_G.sale = 0.001;
  SW_G.cartaSale = P.carta;
  swElige(lado);
}

/* ---------- dibujarla ---------- */
function swPintaCarta(c, t, dt) {
  const P = SW_P;
  // animaciones: entrar cayendo, volver al centro al soltar, salir volando
  SW_G.entra = Math.min(1, SW_G.entra + dt * 4.5);
  if (!SW_G.arrastra && !SW_G.sale) { SW_G.x *= Math.pow(0.0005, dt); SW_G.y *= Math.pow(0.0005, dt); if (Math.abs(SW_G.x) < 0.5) SW_G.x = 0; }
  if (SW_G.sale) { SW_G.sale += dt * 3.2; if (SW_G.sale >= 1) { SW_G.sale = 0; SW_G.x = 0; SW_G.y = 0; SW_G.entra = 0; } }
  const carta = SW_G.sale ? SW_G.cartaSale : P.carta; if (!carta) return;
  let x = SW_G.x, y = SW_G.y, rot = SW_G.x / 700, alfa = 1;
  if (SW_G.sale) { const k = SW_G.sale; x = SW_G.dir * (SW_UMBRAL + k * 520); y = k * 60; rot = SW_G.dir * (0.18 + k * 0.6); alfa = 1 - k * 0.6; }
  else { const e = 1 - Math.pow(1 - SW_G.entra, 3); y += (1 - e) * -420; rot += (1 - e) * 0.3; alfa = Math.min(1, SW_G.entra * 2); }
  c.save(); c.globalAlpha = alfa;
  // al salir volando deja estelas (líneas de velocidad) detrás
  if (SW_G.sale) { const k = SW_G.sale; for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.55)' : 'rgba(255,216,74,.6)'; const ly = SW_V.cartaCY - 120 + i * 40 + k * 40, lx = 270 + x - SW_G.dir * (150 + i * 9), largo = 140 + i * 22; c.fillRect(Math.round(SW_G.dir > 0 ? lx - largo : lx), Math.round(ly), largo, 6); } }
  c.translate(270 + x, SW_V.cartaCY + y); c.rotate(rot); c.scale(SW_V.kc, SW_V.kc);
  swDibujaCartaEn(c, P, carta, t, Math.abs(SW_G.x) > 20 ? Math.sign(SW_G.x) : 0);
  c.restore();
}
// la carta centrada en (0,0): marco de pergamino, título, dibujo y texto
function swDibujaCartaEn(c, P, carta, t, inclina) {
  const A = swAspecto(P, carta), W = 270, Hh = 360;
  // sombra
  c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-W / 2 + 10, -Hh / 2 + 14, W, Hh);
  if (SW_FX.calor > 0 && P.C && carta.tipo === 'accion') {
    const p = 6 + Math.round((2 + 2 * Math.sin(t * 12)) / 2) * 6;
    c.globalAlpha *= SW_FX.calor;
    c.fillStyle = '#ff5a1f'; c.fillRect(-W / 2 - p, -Hh / 2 - p, W + 2 * p, Hh + 2 * p);
    c.fillStyle = '#ffd84a'; c.fillRect(-W / 2 - p / 2, -Hh / 2 - p / 2, W + p, Hh + p);
    for (let x = -W / 2; x < W / 2; x += 12) swLlama(c, x, -Hh / 2 - p + 6, 26 + 18 * Math.abs(Math.sin(x * 0.11 + t * 3)), t, x);
    c.globalAlpha /= SW_FX.calor;
  }
  // cada tipo de carta tiene su marco (combate, evento, tienda…); si aún no ha llegado su dibujo, el marco común
  const marco = 'carta-' + (SW_MARCO[carta.tipo] || 'combate');
  if (SW_IMG[marco]) swDibujaC(c, marco, 0, 0, 3);
  else if (SW_IMG.carta) swDibujaC(c, 'carta', 0, 0, 3);
  else { swPanel(c, -W / 2, -Hh / 2, W, Hh, '#6b4424', '#8a5a30', '#3e2612', 6); swPanel(c, -W / 2 + 18, -Hh / 2 + 18, W - 36, Hh - 36, '#f4e6c8', '#fff8e6', '#d8c49a', 3); }
  // la cinta del título, del color de la rareza
  const col = A.rareza != null ? SW_RAREZAS[A.rareza].col : '#c2432e';
  swPanel(c, -112, -Hh / 2 + 22, 224, 40, col, 'rgba(255,255,255,.35)', 'rgba(0,0,0,.25)');
  const tt = swParte(c, A.titulo.toUpperCase(), 206, 20);
  swTexto(c, tt[0] || '', 0, -Hh / 2 + 43, tt[0] && tt[0].length > 16 ? 17 : 20);
  if (A.etiqueta) swTexto(c, A.etiqueta, 0, -Hh / 2 + 76, 14, '#c2432e', 'center', 0);
  let y = -Hh / 2 + 78;
  if (A.iconos) {
    // las dos acciones: izquierda y derecha, con su flecha
    const [a, b] = A.iconos;
    const lx = -58, rx = 58, yy = y + 68;
    if (carta.tipo === 'accion') {   // el lado que ataca lleva un fondo rojo
      const [LL, RR] = swLados(P, carta);
      for (const [S, x] of [[LL, lx], [RR, rx]]) if (swEsAtaque(S)) { c.fillStyle = 'rgba(232,65,58,.22)'; c.fillRect(x - 54, yy - 54, 108, 128); c.fillStyle = '#e8413a'; c.fillRect(x - 54, yy - 54, 108, 5); }
    }
    c.save(); c.globalAlpha = inclina > 0 ? 0.4 : 1; swDibujaC(c, a, lx, yy, 5); swDibujaC(c, 'i-flecha', lx, yy + 70, 2, true); c.restore();
    c.save(); c.globalAlpha = inclina < 0 ? 0.4 : 1; swDibujaC(c, b, rx, yy, 5); swDibujaC(c, 'i-flecha', rx, yy + 70, 2); c.restore();
    c.fillStyle = '#c8b08a'; c.fillRect(-2, yy - 54, 4, 128);
    if (carta.tipo === 'accion') {
      const [L, R] = swLados(P, carta);
      if (L.coste) { swDibujaC(c, 'i-caos', lx - 46, yy - 44, 2); swTexto(c, String(L.coste), lx - 30, yy - 36, 18, '#ffb13d', 'center', 4); }
      if (R.coste) { swDibujaC(c, 'i-caos', rx + 46, yy - 44, 2); swTexto(c, String(R.coste), rx + 62, yy - 36, 18, '#ffb13d', 'center', 4); }
      // el nombre de cada acción bajo su dibujo: en una o dos líneas, sin pisar al de al lado
      for (const [S, x] of [[L, lx], [R, rx]]) {
        const ls = swParte(c, tr(S.nombre) + (S.mas ? '+' : ''), 104, 15).slice(0, 2);
        ls.forEach((l, i) => swTextoCabe(c, l, x, yy + 100 + i * 23 - (ls.length - 1) * 8, 15, 104, '#3a2414', 'center', 0));
      }
    }
    y = yy + 122;
  } else if (A.reliquia) {
    swDibujaC(c, A.reliquia, 0, y + 78 + Math.round(Math.sin(t * 3) * 2) * 2, 6);
    y += 160;
  } else if (A.arte) {
    const [w, h] = swTam(A.arte, 3);
    swPanel(c, -w / 2 - 6, y - 4, w + 12, h + 12, SW_TINTA, SW_TINTA, SW_TINTA, 3);
    swDibuja(c, A.arte, -w / 2, y + 2, 3);
    y += h + 20;
  }
  if (A.texto) {
    const lineas = swParte(c, A.texto, 220, 16);
    const tam = lineas.length > 4 ? 14 : 16, sitio = Hh / 2 - 24 - y, paso = Math.round(tam * 1.5) + 2;
    swParte(c, A.texto, 226, tam).slice(0, Math.max(1, Math.floor(sitio / paso))).forEach((l, i) => swTexto(c, l, 0, y + 8 + i * paso, tam, '#3a2414', 'center', 0, 600));
  }
}
