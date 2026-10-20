// Fans of Rouflage · ESPECTADOR: un camaleón despedido no se queda mirando su sello: se hace un fantasma (su galleta con cola de fantasma) que se pasea por el mapa (sin chocar con nada) para ver qué pasa,
// (y el cazador sin cartas igual) con las mismas teclas o la misma palanca de siempre. La partida sigue sin él; para irse, el menú de pausa (Salir al menú / Rendirse). El fantasma solo lo ve quien lo lleva.
'use strict';

const FANTASMA = { vel: 250, espera: 1.3 };      // velocidad (puntos por segundo) y segundos que se ve el sello antes de soltarse
// sin juego: camaleón despedido o cazador sin cartas (en los dos casos pasa a mirar)
const sinJuego = e => e.clase === 'cazador' ? e.balas <= 0 : !!e.fuera;
const espectando = () => J.fase === 'caza' && !J.pausa && !!J.yo && sinJuego(J.yo) && (J.yo.clase === 'cazador' || J.yo.tFuera > FANTASMA.espera);

// cada fotograma, desde controlaJugador: lo mueve según las teclas o la palanca
function mueveFantasma(dt) {
  const yo = J.yo;
  if (!J.fantasma) {
    J.fantasma = { x: yo.x, y: yo.y - 20, t: 0, poder: null, enfria: 0, usado: 0 };
    if (yo.clase === 'camaleon') poderElige(J.fantasma);      // a un colado despedido le toca un poder (fantasma-poder.js)
    avisa(yo.clase === 'cazador' ? (yo.cuerpo && yo.cuerpo.fuera ? tr('Estás fuera: pasea por el mapa para ver qué pasa') : tr('Sin cartas: pasea por el mapa para ver qué pasa')) : tr('Estás despedido: ayuda a los tuyos con tu poder de fantasma'), 'aviso'); refrescaHud(true);
  }
  const f = J.fantasma, [mx, my] = vectorMueve();
  f.t += dt; f.mueve = Math.hypot(mx, my) > 0.1; if (Math.abs(mx) > 0.15) f.mira = mx > 0 ? 1 : -1;
  f.x = limita(f.x + mx * FANTASMA.vel * dt, 6, ANCHO - 6); f.y = limita(f.y + my * FANTASMA.vel * dt, 6, ALTO - 6);
}
// el fantasma: tu misma galleta (cabeza, brazos, cara y las orejas de tu animal) pero con la parte de abajo en cola de fantasma,
// como Casper: flota, mueve los brazos y la cola se menea (al ir de lado, se queda atrás). Se pinta entero en un lienzo aparte y
// luego se pone medio transparente, para que no se vean las juntas entre las piezas.
const LIENZO_FANTASMA = { cv: null, c: null, esc: 4, w: 84, h: 112 };
// el cuerpo con la cola: tronco de la galleta que se estrecha hacia abajo y acaba en una punta enroscada
function trazaColaFantasma(c, t, mira, mueve) {
  const meneo = Math.sin(t * 3.2) * 2.6, atras = (mueve ? -mira * 5 : 0) + meneo;
  c.moveTo(-9, -32); c.bezierCurveTo(-3, -34, 3, -34, 9, -32);
  c.bezierCurveTo(13.5, -24, 14, -14, 11, -7);
  c.bezierCurveTo(8, -1, 6 + atras * 0.5, 3, 2 + atras, 6);
  c.bezierCurveTo(-1 + atras * 1.3, 9, -6 + atras * 1.4, 7, -4 + atras * 1.2, 3);   // la punta, enroscada
  c.bezierCurveTo(-3 + atras * 0.8, 1, -9 + atras * 0.4, 2, -11, -6);
  c.bezierCurveTo(-14, -14, -13.5, -24, -9, -32); c.closePath();
}
function pintaFantasma(c, t) {
  const f = J.fantasma; if (!f || !espectando()) return;
  pintaOtrosFantasmas(c, t);
  pintaFantasmaEn(c, t, f, J.yo, 0.8, tr('TÚ'), '#ffcb3d');
}
// un fantasma cualquiera (el tuyo, el de otro jugador o el del susto): `yo` es de quién es (su animal y su ropa), `alfa` lo transparente que
// se ve y, si hay `nombre`, el rótulo de encima
function pintaFantasmaEn(c, t, f, yo, alfa, nombre, color) {
  if (yo.ropa && yo.ropa.fantasma && yo.ropa.fantasma !== 'galleta') return pintaFantasmaArmario(c, t, f, yo.ropa.fantasma, alfa, nombre, color);
  const L = LIENZO_FANTASMA, mira = f.mira || 1, bote = Math.sin(t * 3.4) * 3;
  if (!L.cv) [L.cv, L.c] = lienzo(L.w * L.esc, L.h * L.esc);
  const g = L.c;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, L.cv.width, L.cv.height);
  g.setTransform(L.esc, 0, 0, L.esc, (L.w / 2) * L.esc, (L.h - 26) * L.esc);   // los «pies» (la punta de la cola) cerca de abajo
  g.rotate(Math.sin(t * 1.7) * 0.06 + (f.mueve ? mira * 0.1 : 0));            // se balancea al flotar y se inclina al avanzar
  // los brazos: abiertos hacia arriba, «¡buuu!», moviéndose un poco
  const brazos = [['brazoI', 0.55 + Math.sin(t * 4) * 0.18], ['brazoD', -0.25 + Math.sin(t * 4 + 1.6) * 0.18]];
  const traza = gg => { gg.beginPath(); for (const [k, giro] of brazos) capsula(gg, PIEZAS[k], giro); trazaColaFantasma(gg, t, mira, f.mueve); trazaCabeza(gg); };
  // primero el contorno grueso de todo y luego el relleno encima: así queda una sola silueta
  traza(g); g.lineWidth = 6; g.strokeStyle = OL; g.lineJoin = 'round'; g.stroke();
  traza(g); g.fillStyle = '#f4f1fa'; g.fill();
  // un poco de sombra en el lado contrario a la cara
  g.save(); traza(g); g.clip(); g.globalAlpha = 0.12; g.fillStyle = OL; g.beginPath(); g.rect(-30, -60, 60, 80); g.ellipse(4 * mira, -30, 15, 26, 0, 0, TAU); g.fill('evenodd'); g.restore();
  // la cara (mirando hacia donde va) y los adornos de tu animal
  g.save(); g.scale(mira, 1);
  const cx = CABEZA.x + 2, cy = CABEZA.y, parp = (t * 0.9) % 3.4 < 0.12;
  for (const s of [-1, 1]) {
    if (parp) raya(g, [cx + s * 4.4 - 1.8, cy - 0.5, cx + s * 4.4 + 1.8, cy - 0.5], OL, 1.6);
    else { g.beginPath(); g.ellipse(cx + s * 4.4, cy - 0.5, 1.9, 2.5, 0, 0, TAU); g.fillStyle = OL; g.fill(); punto(g, cx + s * 4.4 + 0.7, cy - 1.5, 0.7, '#ffffff'); }
    g.beginPath(); g.ellipse(cx + s * 7.2, cy + 3.4, 2, 1.2, 0, 0, TAU); g.fillStyle = 'rgba(255,120,150,0.45)'; g.fill();
  }
  g.beginPath(); g.ellipse(cx, cy + 4.4, 1.6, 2 + Math.sin(t * 2.5) * 0.4, 0, 0, TAU); g.fillStyle = OL; g.fill();   // la boca en «o»: ¡buuu!
  const ad = ADORNOS[yo.tipo];
  if (ad) { if (yo.clase === 'cazador') ad.delante(g, yo); else { g.save(); g.translate(0, CABEZA.y); g.scale(0.8, 0.8); g.translate(0, 33); ad.delante(g, yo); g.restore(); } }
  g.restore();
  // al mundo, medio transparente y flotando
  const x = f.x, y = f.y + 30 + bote;
  c.save(); c.globalAlpha = alfa;
  c.drawImage(L.cv, x - L.w / 2, y - (L.h - 26), L.w, L.h);
  c.restore();
  if (nombre) rotulo(c, nombre, x, y - 78, 10, color, OL, LETRA_UI);
}
// el fantasma que elegiste en el armario (sábana, globo, nube…), flotando y medio transparente como el de siempre
function pintaFantasmaArmario(c, t, f, tipo, alfa = 0.85, nombre = tr('TÚ'), color = '#ffcb3d') {
  const x = f.x, y = f.y + 30 + Math.sin(t * 3.4) * 3, mira = f.mira || 1;
  // vivo y al tamaño del de galleta (fantasmas-vivos.js); se inclina al avanzar y mira hacia donde va
  c.save(); c.globalAlpha = alfa; c.translate(x, y); c.rotate(Math.sin(t * 1.7) * 0.05 + (f.mueve ? mira * 0.1 : 0)); c.scale(mira * 1.1, 1.1);
  fantasmaVivo(c, tipo, t, { mueve: !!f.mueve }); c.restore();
  if (nombre) rotulo(c, nombre, x, y - 78, 10, color, OL, LETRA_UI);
}

// ---------- LOS DEMÁS FANTASMAS (PvP) ----------
// Cada fantasma manda dónde está (fg) cinco veces por segundo y los que también son fantasmas lo ven, medio transparente y con su nombre:
// así se hacen compañía, van juntos y se organizan los sustos. Los vivos no los ven (salvo el instante del susto, abajo).
const FANTASMAS_RED = {}, FG = { cada: 0.2, t: 0 };
function fantasmaRecibido(sl, m) {
  if (J.fase !== 'caza' || !sl.ente) return;
  const g = FANTASMAS_RED[m.de] || (FANTASMAS_RED[m.de] = { x: m.x, y: m.y });
  g.ax = m.x; g.ay = m.y; g.mira = m.m === -1 ? -1 : 1; g.mueve = !!m.v; g.visto = RELOJ; g.ente = sl.ente;
}
// cada fotograma: manda el tuyo, acerca suave los de los demás a donde dicen y olvida los que callan; y los sustos se apagan
function fantasmasAvanza(dt) {
  for (let i = SUSTOS.length - 1; i >= 0; i--) if ((SUSTOS[i].t += dt) > SUSTOS[i].dura) SUSTOS.splice(i, 1);
  if (!J.pvp || J.fase !== 'caza') { for (const k in FANTASMAS_RED) delete FANTASMAS_RED[k]; return; }
  for (const k in FANTASMAS_RED) {
    const g = FANTASMAS_RED[k]; if (RELOJ - g.visto > 3) { delete FANTASMAS_RED[k]; continue; }
    g.x += (g.ax - g.x) * Math.min(1, dt * 10); g.y += (g.ay - g.y) * Math.min(1, dt * 10);
  }
  const f = J.fantasma; if (!f || !espectando() || (FG.t -= dt) > 0) return;
  FG.t = FG.cada; rfpManda({ t: 'fg', x: Math.round(f.x), y: Math.round(f.y), m: f.mira === -1 ? -1 : 1, v: f.mueve ? 1 : 0 });
}
function pintaOtrosFantasmas(c, t) { for (const k in FANTASMAS_RED) { const g = FANTASMAS_RED[k]; pintaFantasmaEn(c, t + +k, g, g.ente, 0.6, g.ente.nombre, '#fff6ea'); } }

// ---------- EL SUSTO ----------
// Cuando un fantasma usa un poder de tocar (Apagón, Mano fría), todos lo ven un instante junto al becario: «¡BUUU!». Da risa y se sabe de
// dónde viene la broma. El silbido falso no: si se viera al fantasma, se sabría que el silbido es falso.
const SUSTOS = [];
function fantasmaSusto(x, y, quien) { if (quien) SUSTOS.push({ x, y, quien, t: 0, dura: 1.4 }); }
function pintaSustos(c, t) {
  for (const s of SUSTOS) {
    const a = s.t < 0.15 ? s.t / 0.15 : 1 - Math.max(0, s.t - 0.9) / (s.dura - 0.9);
    pintaFantasmaEn(c, t, { x: s.x, y: s.y - s.t * 10, mira: 1, mueve: false }, s.quien, 0.75 * a, null);
    c.save(); c.globalAlpha = a; rotulo(c, tr('¡BUUU!'), s.x, s.y - 58 - s.t * 10, 16, '#cfe9ff', OL, LETRA_UI); c.restore();
  }
}
