// Fans of Recruit · LA PARTIDA: todo lo que hay en la misión (enemigos, balas, premios y efectos), la cámara que solo avanza,
// el guion que saca cada cosa cuando toca, las zonas donde la pantalla se para hasta que no queda nadie, el reloj y los
// puntos. Cada paso (60 por segundo) mueve lo de cada lista; dibujo.js lo pinta.
'use strict';

const SUELO = OFI.SUELO;   // la línea del suelo: ahí pisan todos
const GRAV = 0.23;         // lo que tira hacia abajo en cada paso
const J = {
  W: 400, H: 240, camY: 0, estado: 'carga', t: 0,                      // la pantalla y en cuál estamos (carga, titulo, juego, pausa, fin, victoria)
  camX: 0, tope: 0, gi: 0, zona: null, fase: '', ft: 0,                // la misión: cámara, por dónde va el guion y el momento
  puntos: 0, caosP: 0, caos: 0, tiempo: 60, tt: 0, fans: 0, bajas: 0, continuado: 0, total: 0,
  tiembla: 0, flash: 0, tinte: 0, adelante: 0, rotulo: null, sello: 0,
  enes: [], balas: [], tiros: [], cosas: [], fx: [], flotan: [], luego: [], jefe: null,
};
// utilidades para probar (solo en localhost): ?inmortal=1 · ?ir=1100 (empieza en esa x) · ?caos=1 · ?arma=1
const DEV = (() => { const q = new URLSearchParams(location.search), local = /^(localhost|127\.)/.test(location.hostname); return { inmortal: local && q.get('inmortal') === '1', ir: local ? +q.get('ir') || 0 : 0, caos: local && q.get('caos') === '1', arma: local && q.get('arma') === '1' }; })();

const enPantalla = (x, m = 0) => x > J.camX - m && x < J.camX + J.W + m;
const acota = (v, a, b) => (v < a ? a : v > b ? b : v);
function luego(pasos, fn) { J.luego.push({ t: pasos, fn }); }

function nuevaPartida() {
  Object.assign(J, { estado: 'juego', t: 0, camX: 0, tope: 0, gi: 0, zona: null, fase: 'entra', ft: 0, puntos: 0, caosP: 0, caos: 0, tiempo: 60, tt: 0, fans: 0, bajas: 0, continuado: 0,
    tiembla: 0, flash: 0, tinte: 0, adelante: 0, rotulo: null, sello: 0, jefe: null });
  for (const k of ['enes', 'balas', 'tiros', 'cosas', 'fx', 'flotan', 'luego']) J[k] = [];
  nuevoJugador();
  nuevoChat();
  rotulo([['MISIÓN 1', BLANCO_ROTULO, 2], ['LA GRAN COMPRA', ORO_ROTULO, 3]], 150);
  musica('heroes'); play('rotulo'); chat('inicio');
  if (DEV.ir) { J.camX = DEV.ir; JG.x = DEV.ir + 90; J.fase = 'normal'; while (J.gi < GUION.length && (GUION[J.gi].x !== undefined ? GUION[J.gi].x : GUION[J.gi].zona !== undefined ? GUION[J.gi].zona : 1e9) < DEV.ir) J.gi++; }
  if (DEV.caos) { J.caosP = 30; J.caos = 10; }
  if (DEV.arma) { JG.arma = 1; JG.municion = 200; }
}

/* ---------- un paso de la partida ---------- */
function pasoJuego() {
  J.t++; J.ft++;
  if (MANDO.p.pausa) { pausa(true); return; }
  for (let k = J.luego.length - 1; k >= 0; k--) if (--J.luego[k].t <= 0) { const f = J.luego[k].fn; J.luego.splice(k, 1); f(); }
  pasoFase();
  pasoJugador();
  pasoCamara(); pasoGuion();
  pasoEnemigos(); pasoBalas(); pasoTiros(); pasoCosas(); pasoEfectos();
  pasoReloj(); pasoChat();
  if (J.tiembla > 0) J.tiembla--;
  if (J.flash > 0) J.flash--;
  if (J.tinte > 0) J.tinte--;
  if (J.adelante > 0) J.adelante--;
  if (J.sello) J.sello++;
  if (J.rotulo && ++J.rotulo.t >= J.rotulo.dur) J.rotulo = null;
}
// los momentos de la misión: entra (CrazyBunny llega corriendo), normal, jefe-aviso, jefe, jefe-muere y gana
function pasoFase() {
  if (J.fase === 'entra') { if (J.ft > 96) { J.fase = 'normal'; J.ft = 0; play('go'); } }
  else if (J.fase === 'jefe-aviso') {
    if (J.ft === 85) play('alarma');
    if (J.ft >= 170) { nuevoJefe(); J.fase = 'jefe'; J.ft = 0; J.tiempo = 99; musica('boss0'); }
  } else if (J.fase === 'gana') { if (J.ft > 210) { J.estado = 'victoria'; J.t = 0; J.sello = 0; } }
}
// el reloj: 60 segundos por tramo. Si se acaba, se pierde una vida («se acabó la jornada»)
function pasoReloj() {
  if (J.fase !== 'normal' && J.fase !== 'jefe') return;
  if (++J.tt < 60) return;
  J.tt = 0;
  if (J.tiempo > 0) J.tiempo--;
  if (J.tiempo <= 10 && J.tiempo > 0) play('tick');
  if (J.tiempo === 0 && !JG.muerto) { flota('¡SE ACABÓ LA JORNADA!', JG.x, JG.y - 60, ROJO_ROTULO, true); danaJugador(true); J.tiempo = 30; }
}

/* ---------- la cámara y el guion ---------- */
// hasta dónde puede avanzar la pantalla ahora: la zona en la que está parada o la siguiente parada del guion
function topeCamara() {
  if (J.zona) return J.zona.x;
  for (let k = J.gi; k < GUION.length; k++) {
    const q = GUION[k];
    if (q.zona !== undefined) return Math.max(J.camX, q.zona + ((400 - J.W) >> 1));
    if (q.jefe) return Math.max(J.camX, NIVEL.ascensor + 96 - J.W);
  }
  return NIVEL.largo - J.W;
}
function pasoCamara() {
  const tope = Math.min(NIVEL.largo - J.W, topeCamara()), obj = JG.x - J.W * 0.36;
  J.tope = tope;
  if (obj > J.camX && J.camX < tope) J.camX = Math.min(tope, J.camX + Math.min(3, obj - J.camX));
}
function pasoGuion() {
  while (J.gi < GUION.length && !J.zona) {
    const q = GUION[J.gi];
    if (q.x !== undefined) { if (J.camX + J.W + 40 < q.x) break; aparece(q); J.gi++; }
    else if (J.camX >= J.tope - 0.5) { J.gi++; if (q.jefe) avisaJefe(); else { J.zona = { x: J.camX, olas: q.olas, k: -1, t: 0, pend: [] }; J.tiempo = 60; J.tt = 0; } }
    else break;
  }
  // la zona de combate: saca sus oleadas una detrás de otra y, cuando no queda nadie, deja seguir
  const z = J.zona;
  if (!z || !z.olas) return;
  z.t++;
  for (let k = z.pend.length - 1; k >= 0; k--) if (z.t >= z.pend[k][2]) { entraEnemigo(z.pend[k][0], z.pend[k][1]); z.pend.splice(k, 1); }
  if (!z.pend.length && z.t > 40 && !J.enes.some(e => e.est !== 'huye')) {
    if (++z.k >= z.olas.length) { J.zona = null; adelante(); } else { z.pend = z.olas[z.k].slice(); z.t = 0; J.tiempo = 60; J.tt = 0; }
  }
}
// algo del guion aparece en su sitio
function aparece(q) {
  if (q.t === 'becario') nuevoBecario(q.x, q);
  else if (q.t === 'dron') nuevoDron(q.x, 1);
  else if (q.t === 'caja') J.cosas.push({ tipo: 'caja', x: q.x, y: SUELO, z: -3, hp: 2, da: q.da, t: 0, flash: 0, r: 13, alto: 18 });
  else if (q.t === 'fan') J.cosas.push({ tipo: 'fan', x: q.x, y: SUELO, z: -7, est: 'atado', da: q.da, t: 0, anim: 0, r: 9, alto: 30 });
  else if (q.t === 'mecha') J.cosas.push({ tipo: 'mecha', x: q.x, y: SUELO, z: -2, hp: 3, t: 0, dir: 1 });
}
// un enemigo de una oleada entra por un lado de la pantalla (1 = por la derecha)
function entraEnemigo(tipo, lado) {
  const x = lado > 0 ? J.camX + J.W + 22 + rand(0, 26) : J.camX - 22 - rand(0, 20);
  if (tipo === 'dron') nuevoDron(x, lado); else nuevoBecario(x, {});
}
function adelante() { J.adelante = 170; J.tiempo = 60; J.tt = 0; play('go'); }

/* ---------- efectos, letreros y puntos ---------- */
/* un efecto: s = un dibujo o una lista (animación). o: vx, vy, g (peso), vmax, dur (pasos que dura), gira (pasos por dibujo,
   dando vueltas), bota (rebota en el suelo, a esa distancia de la línea), capa (0 = detrás de los personajes), parp (parpadea al irse) */
function efecto(s, x, y, o) { const e = Object.assign({ s, x, y, vx: 0, vy: 0, g: 0, dur: 20, t: 0, capa: 1 }, o); J.fx.push(e); return e; }
function polvo(x, y, humo) { efecto(humo ? SPR.humo : SPR.polvo, x, y - 3, { vx: rand(-0.2, 0.2), vy: -0.15, dur: 22, capa: 0 }); }
// una explosión: tam 0 = pequeña, 1 = normal, 2 = enorme
function explota(x, y, tam = 0) {
  efecto([SPR.boom2, SPR.boom, SPR.boom3][tam], x, y, { dur: [32, 42, 52][tam] });
  play(tam ? 'boom' : 'trash');
  J.tiembla = Math.max(J.tiembla, [3, 8, 18][tam]);
}
// una explosión que hace daño a todo lo que pilla cerca
function estalla(x, y, R, d) {
  explota(x, y, 1);
  for (const e of J.enes.slice()) if (!e.intocable && Math.abs(e.x - x) < R + e.r && Math.abs(e.y - e.alto / 2 - y) < R + e.alto / 2) golpea(e, e.tipo === 'jefe' ? Math.min(d, 6) : d, true);   // al jefe las bombas le hacen menos
  for (const c of J.cosas.slice()) if (c.r && Math.abs(c.x - x) < R + c.r && Math.abs(c.y - c.alto / 2 - y) < R + c.alto / 2) golpea(c, d, true);
}
function trozos(x, y, n) { for (let k = 0; k < n; k++) efecto(SPR.trozo[k % 4], x, y, { vx: rand(-2.4, 2.4), vy: rand(-4.2, -1.6), g: 0.22, dur: 50 + k * 3, bota: rand(1, 10), parp: true }); }
function papeles(x, y, n) { for (let k = 0; k < n; k++) efecto(SPR.folio, x, y, { vx: rand(-1.7, 1.7), vy: rand(-3.2, -1), g: 0.06, vmax: 0.7, dur: 100 + k * 8, gira: 9, f0: k, parp: true }); }
function sueltaMonedas(x, y, n) { for (let k = 0; k < n; k++) J.cosas.push({ tipo: 'moneda', x, y, vx: rand(-1.6, 1.6), vy: rand(-3.9, -2), t: 0, z: 2, f0: (Math.random() * 8) | 0, suelo: SUELO + rand(0, 8) }); }
// un letrero que sube y se va. grande = con la letra normal (si no, la pequeña)
function flota(s, x, y, c, grande) { J.flotan.push({ s, x, y, c: c || ORO_ROTULO, g: !!grande, t: 0 }); }
function suma(p, x, y) { J.puntos += p; if (x !== undefined) flota(String(p), x, y); }
function sumaCaos(n) {
  J.caosP = Math.min(30, J.caosP + n);
  const c = (J.caosP / 3) | 0;
  if (c > J.caos) { J.caos = c; if (c === 10) { play('hype'); flota('¡CAOS A TOPE!', JG.x, JG.y - 58, ['#f3e6ff', '#c79bff', '#8a4be0'], true); } }
}
// el rótulo grande del centro: lineas = [[texto, colores, tamaño], …]
function rotulo(lineas, dur) { J.rotulo = { lineas, t: 0, dur }; }

/* ---------- golpes ---------- */
// algo recibe d de daño. fuerte: lo ha matado una explosión (revienta más)
function golpea(e, d, fuerte) {
  if (e.muerto || e.fuera || e.intocable) return;
  if (e.tipo === 'caja') { e.hp -= d; e.flash = 4; if (e.hp <= 0) rompeCaja(e); else play('hit'); return; }
  if (e.tipo === 'fan') { liberaFan(e); return; }
  e.hp -= d;
  if (e.tipo !== 'jefe') e.flash = 4; else if (e.flash <= 0) e.flash = 6;   // el jefe, un destello corto (no se queda en blanco bajo una ráfaga)
  if (e.tipo === 'becario' && e.est === 'cafe') { e.est = 'susto'; e.t = 0; tiraTaza(e); }
  if (e.tipo === 'jefe' && !e.roto && e.hp > 0 && e.hp <= JEFE_VIDA / 2) jefeTocado(e);
  if (e.hp <= 0) mata(e, fuerte); else play('hit');
}
function mata(e, fuerte) {
  if (e.muerto) return;
  if (e.tipo === 'jefe') { jefeMuere(e); return; }
  e.muerto = true;
  const cy = e.y - e.alto / 2, huia = e.est === 'huye';
  explota(e.x, cy, fuerte ? 1 : 0);
  trozos(e.x, cy, e.tipo === 'dron' ? 3 : 4);
  if (e.tipo === 'becario') papeles(e.x, cy, 3);
  sueltaMonedas(e.x, cy, e.tipo === 'dron' ? 3 : huia ? 5 : 2);
  suma(e.tipo === 'dron' ? 150 : huia ? 300 : 100, e.x, e.y - e.alto - 8);
  J.bajas++;
  if (Math.random() < 0.3) chat(e.tipo);
}

/* ---------- las balas de CrazyBunny: 0 = bala, 1 = plasma de la MechaVaca, 2 = zanahoria bomba ---------- */
// ¿qué toca este punto? un enemigo, una caja o un fan atado
function tocaAlgo(b, m) {
  for (const e of J.enes) if (!e.intocable && !e.muerto && Math.abs(b.x - e.x) < e.r + m && b.y > e.y - e.alto - m && b.y < e.y + m) return e;
  for (const c of J.cosas) if (c.r && !c.fuera && Math.abs(b.x - c.x) < c.r + m && b.y > c.y - c.alto - m && b.y < c.y + m) return c;
  return null;
}
function pasoBalas() {
  const L = J.balas;
  for (let k = L.length - 1; k >= 0; k--) {
    const b = L[k];
    b.t++;
    if (b.g) b.vy += b.g;
    b.x += b.vx; b.y += b.vy;
    let fuera = b.x < J.camX - 26 || b.x > J.camX + J.W + 26 || b.y < -40;
    if (b.tipo === 2) {
      if (b.y >= SUELO - 3 || tocaAlgo(b, 4)) { estalla(b.x, Math.min(b.y, SUELO - 8), 38, b.d); fuera = true; }
    } else if (b.y >= SUELO + 5) { efecto(SPR.impacto, b.x, SUELO + 3, { dur: 6 }); fuera = true; }
    else if (!fuera) {
      const e = tocaAlgo(b, 2);
      if (e) { efecto(SPR.impacto, b.x, b.y, { dur: b.tipo ? 9 : 6 }); golpea(e, b.d, false); fuera = true; }
    }
    if (fuera) L.splice(k, 1);
  }
}
function pasoEfectos() {
  const L = J.fx;
  for (let k = L.length - 1; k >= 0; k--) {
    const e = L[k];
    if (++e.t >= e.dur) { L.splice(k, 1); continue; }
    if (e.g) { e.vy += e.g; if (e.vmax && e.vy > e.vmax) e.vy = e.vmax; }
    e.x += e.vx; e.y += e.vy;
    if (e.bota && e.vy > 0 && e.y > SUELO + e.bota) { e.y = SUELO + e.bota; e.vy *= -0.4; e.vx *= 0.6; if (e.vy > -0.6) { e.vy = 0; e.vx = 0; e.g = 0; } }
  }
  const T = J.flotan;
  for (let k = T.length - 1; k >= 0; k--) { const f = T[k]; f.y -= f.t < 30 ? 0.6 : 0.2; if (++f.t > (f.g ? 80 : 46)) T.splice(k, 1); }
}
