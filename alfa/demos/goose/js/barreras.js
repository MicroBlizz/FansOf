// Fans of Goose · LAS BARRERAS: entre casilla y casilla hay una barrera con el aire de su tierra (img/barrera-<tierra>.png, de Yoshi).
// Al tirar el dado se abren las barreras hasta la casilla que toque y vas tú andando, a tu ritmo, matando lo que quieras (el CAMINO).
// Cada barrera que cruzas se cierra a tu espalda: no se vuelve atrás. El derrumbe se come las casillas que dejas atrás, pero se para
// en la barrera cerrada de detrás de ti (js/tablero.js, avanzaDerrumbe). Al pisar la casilla de destino se resuelve como siempre (llegada).
'use strict';

const BARRERAS_PNG = ['bosque', 'pantano', 'cementerio', 'aldea', 'catacumbas', 'castillo', 'feria', 'helada', 'mina'].map(n => 'barrera-' + n);
const BARRERA = { alto: 30, abre: 2.8, velCamino: 1.3 };   // alto en unidades; abre = lo rápido que se hunde o sube; el camino se anda un 30 % más rápido
const ABIERTA = new Map();   // casilla t -> cuánto está abierta la barrera de su borde de arriba (0 cerrada, 1 abierta)

// ¿debe estar abierta la barrera del borde de arriba de la casilla t?
const barreraAbierta = t => JUEGO.fase === 'camino' && t >= JUEGO.paso && t < JUEGO.destino;
// el borde de atrás que no se puede cruzar (la barrera cerrada de detrás): en el camino, la de la casilla que pisas; si no, la tuya
const casillaAtras = () => (JUEGO.fase === 'camino' ? JUEGO.paso : JUEGO.casilla);

// --- al tirar el dado: se abren las barreras hasta el destino ---
function empiezaCamino(destino) {
  const J = JUEGO;
  J.destino = destino; J.paso = J.casilla; J.fase = 'camino'; J.escena = null; J.quieto = 0; J.tramoT = 0;
  J.invul = Math.max(J.invul, 0.5); SONIDO.empieza();
  for (let t = J.casilla; t < destino; t++) { const y = -t * TH; anillo(cxY(y), y, 30, '#f6e7b8', 0.35, 3); }
}

// --- andando por el camino abierto: como parado, pero hasta el destino y sin volver atrás ---
function avanzaCamino(dt) {
  const J = JUEGO, yo = J.yo; J.tramoT += dt; J.quieto += dt * 0.5;   // remolonear también llama ocas, aunque menos
  let mx = ENTRADA.mx, my = ENTRADA.my; if (invertido()) { mx = -mx; my = -my; }
  const m = Math.hypot(mx, my);
  yo.moviendo = m > 0.12;
  const v = yo.moviendo ? J.st.vel * BARRERA.velCamino * multiVel() * velTierra() * Math.min(1, m) : 0;
  const [vx, vy] = hielo(yo.moviendo ? mx / Math.max(1, m) * v : 0, yo.moviendo ? my / Math.max(1, m) * v : 0, dt);
  yo.x += vx * dt; yo.y += vy * dt;
  if (yo.moviendo) { yo.miraX = mx / m; yo.miraY = my / m; yo.anda += dt * 10; }
  // al cruzar una barrera, se cierra detrás
  const aqui = Math.min(J.destino, Math.max(J.paso, casillaDe(yo.y)));
  if (aqui > J.paso) { J.paso = aqui; tiembla(1.5); SONIDO.aterriza(); }
  // ni por detrás de la barrera cerrada ni por delante de la del destino
  const top = -J.destino * TH + 6, bottom = -(J.paso - 1) * TH - 6;
  yo.y = clamp(yo.y, top, bottom);
  // ya pisa el destino: se resuelve la casilla
  if (yo.y < -(J.destino - 1) * TH - 12) llegada(J.destino);
}

// --- cada fotograma: abrir y cerrar con su animación ---
function avanzaBarreras(dt) {
  const J = JUEGO, t0 = Math.max(1, casillaDe(J.camY + PAN.H + 20)), t1 = Math.min(CFG.jardin - 1, casillaDe(J.camY - 40));
  for (let t = t0; t <= t1; t++) {
    const a = ABIERTA.get(t) || 0, quiere = barreraAbierta(t) ? 1 : 0;
    if (a === quiere) continue;
    const n = quiere ? Math.min(1, a + dt * BARRERA.abre) : Math.max(0, a - dt * BARRERA.abre);
    if (a === 0 && quiere) SONIDO.boton && SONIDO.boton();
    ABIERTA.set(t, n);
    if ((J.cuadro & 1) === 0 && n > 0 && n < 1) { const y = -t * TH, [l, r] = bordes(y + 1); particula(l + Math.random() * (r - l), y, (Math.random() - 0.5) * 30, -10 - Math.random() * 20, 0.6, 2.5, '#6e4426', 60, 3); }
  }
}
function vaciaBarreras() { ABIERTA.clear(); }

// --- dibujo: la barrera se hunde en el suelo al abrirse (se pinta solo lo que asoma) ---
function pintaBarreras() {
  const J = JUEGO, arriba = J.camY - 40, abajo = J.camY + PAN.H + 40;
  const t0 = Math.max(1, casillaDe(abajo)), t1 = Math.min(CFG.jardin - 1, casillaDe(arriba));
  const P = J.escena && J.escena.tipo === 'puente' ? J.escena : null;
  for (let t = t0; t <= t1; t++) {
    const y = -t * TH; if (y > J.yD || y < arriba || y > abajo) continue;
    if (P && t >= P.de && t < P.a) continue;   // en el Puente no hay barreras: hay vacío
    const a = ABIERTA.get(t) || 0; if (a >= 1) continue;
    const [l, r] = bordes(y + 1), w = r - l + 10, x0 = l - 5, B = biomaDe(t + 1), im = IMG['barrera-' + B.id];
    const alto = im ? clamp(w * im.height / im.width, 16, BARRERA.alto + 4) : BARRERA.alto, asoma = alto * (1 - a);   // el dibujo, sin deformar
    // la sombra en el suelo de delante
    G.globalAlpha = 0.35; G.fillStyle = '#000'; G.fillRect(x0 + 3, y - 2, w - 6, 4); G.globalAlpha = 1;
    if (im) {
      const sh = im.height * (1 - a);   // el trozo de arriba del dibujo, que es lo que asoma
      if (sh >= 1) G.drawImage(im, 0, 0, im.width, sh, x0, y - asoma, w, asoma);
    } else pintaBarreraCodigo(x0, y - asoma, w, asoma, B);
    if (a > 0) { G.fillStyle = '#120805'; G.fillRect(x0, y - 1, w, 2); }   // la ranura por la que se hunde
  }
}
// sin dibujo de Yoshi: una empalizada de tablones en píxeles con los colores de la tierra
function pintaBarreraCodigo(x, y, w, h, B) {
  if (h < 1) return;
  const n = Math.max(4, Math.round(w / 9)), tw = w / n;
  for (let i = 0; i < n; i++) {
    const px = x + i * tw, pico = (i % 2 ? 3 : 5);
    G.fillStyle = '#120805'; G.fillRect(px, y, tw, h);
    G.fillStyle = i % 2 ? B.veta : '#6e4426'; G.fillRect(px + 1, y + Math.min(h, pico), tw - 2, Math.max(0, h - pico - 1));
    G.fillStyle = B.niebla; G.globalAlpha = 0.25; G.fillRect(px + 1, y + Math.min(h, pico), 1.5, Math.max(0, h - pico - 1)); G.globalAlpha = 1;
  }
  G.fillStyle = '#3d2414'; if (h > 10) { G.fillRect(x, y + h * 0.3, w, 2.5); G.fillRect(x, y + h * 0.7, w, 2.5); }
}
