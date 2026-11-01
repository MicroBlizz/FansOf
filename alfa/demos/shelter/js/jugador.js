// Fans of Shelter · CRAZYBUNNY: moverse por el mapa chocando con lo sólido, hacia dónde mira, la acción de día (talar, picar, empujar
// el bloque, abrir el cofre, usar la mesa, dormir en la hoguera) y de noche (el esquive), la vida, la experiencia y los niveles.
'use strict';

const J = {};   // el jugador (se rellena en jugadorNuevo)
const J_ANCHO = 14, J_ALTO = 10;   // la caja de los pies, para chocar
const VEL_BASE = 84;

function jugadorNuevo() {
  Object.assign(J, {
    x: MAPA.inicio.x, y: MAPA.inicio.y, mira: { x: 0, y: 1 }, paso: 0, andando: false,
    vida: 5, vidaMax: 5, inmune: 0, golpe: 0,       // golpe: la animación de dar con la zanahoria
    inv: { madera: 0, piedra: 0, hierro: 0, cristal: 0 },
    arma: { nivel: 1, fuego: 0, orbes: 0, zanahorias: 1, giro: 1, dano: 0, iman: 0, cadencia: 1 },
    nivel: 1, xp: 0, bajas: 0, esquiva: 0, esquivaCd: 0, vel: 1, dorm: 0,
  });
}
const xpParaSubir = () => 6 + J.nivel * 4;

function avanzaJugador(dt) {
  const d = ENTRADA.dir;
  if (J.inmune > 0) J.inmune -= dt;
  if (J.golpe > 0) J.golpe -= dt;
  if (J.esquivaCd > 0) J.esquivaCd -= dt;
  // el esquive de noche: un salto rápido en la dirección que mira, sin recibir daño
  if (J.esquiva > 0) {
    J.esquiva -= dt;
    const v = 250 * dt, [nx, ny] = mueveChocando(J.x - J_ANCHO / 2, J.y - J_ALTO, J_ANCHO, J_ALTO, J.mira.x * v, J.mira.y * v);
    J.x = nx + J_ANCHO / 2; J.y = ny + J_ALTO;
    return;
  }
  const mov = Math.hypot(d.x, d.y) > 0.05 && J.golpe <= 0.15;
  J.andando = mov;
  if (mov) {
    if (Math.abs(d.x) > Math.abs(d.y)) J.mira = { x: Math.sign(d.x), y: 0 }; else J.mira = { x: 0, y: Math.sign(d.y) };
    const v = VEL_BASE * J.vel * dt;
    const [nx, ny] = mueveChocando(J.x - J_ANCHO / 2, J.y - J_ALTO, J_ANCHO, J_ALTO, d.x * v, d.y * v);
    J.x = nx + J_ANCHO / 2; J.y = ny + J_ALTO;
    J.paso += dt * 7;
  }
  if (ENTRADA.accionPulsa) accionJugador();
}

// la casilla a la que mira CrazyBunny (la de delante de sus pies)
function casillaMirada() {
  const i = Math.floor(J.x / CAS) + J.mira.x, j = Math.floor((J.y - 5) / CAS) + J.mira.y;
  return { i, j, c: casilla(i, j) };
}
function accionJugador() {
  if (NOCHE.fase === 'noche') {   // de noche: esquive
    if (J.esquivaCd > 0) return;
    J.esquiva = 0.18; J.esquivaCd = 1.2; J.inmune = Math.max(J.inmune, 0.3); SONIDO.esquiva();
    chispas(J.x, J.y, PALETA.w, 5, 30);
    return;
  }
  const m = casillaMirada(), c = m.c;
  if (RECURSO[c]) {
    J.golpe = 0.25; SONIDO.golpe(c === 'T');
    MAPA.tiembla = { k: m.i + ',' + m.j, t: 0.2 };
    chispas((m.i + 0.5) * CAS, (m.j + 0.5) * CAS, c === 'T' ? PALETA.H : PALETA.t, 4, 30);
    const da = golpea(m.i, m.j);
    if (da) { for (const k in da) { J.inv[k] += da[k]; numero((m.i + 0.5) * CAS, (m.j + 0.3) * CAS, '+' + da[k] + ' ' + tr(NOMBRE_RECURSO[k]), PALETA.Y); } SONIDO.cae(); tiembla(0.5); }
    return;
  }
  if (c === 'B') {
    const r = empuja(m.i, m.j, J.mira.x, J.mira.y);
    if (r) { SONIDO.empuja(); J.golpe = 0.2; }
    if (r === 'puerta') { SONIDO.puerta(); aviso(tr('¡Se abre la puerta!'), 2, PALETA.H); tiembla(1); }
    return;
  }
  if (c === 'M') { abreCrafteo(); return; }
  if (c === 'C' && !MAPA.cofreAbierto) {
    MAPA.cofreAbierto = true; J.inv.cristal += 3; J.inv.hierro += 2; SONIDO.cofre();
    numero((m.i + 0.5) * CAS, m.j * CAS, '+3 ' + tr('Cristal'), PALETA.Q); numero((m.i + 0.5) * CAS, m.j * CAS + 8, '+2 ' + tr('Hierro'), PALETA.Y);
    return;
  }
  if (c === 'H') { abreDormir(); return; }
}

// daño al jugador (de un enemigo o del jefe). dx, dy: de dónde viene, para el empujón
function hiereJugador(n, dx, dy) {
  if (J.inmune > 0 || J.esquiva > 0) return;
  J.vida -= n; J.inmune = 1.0; SONIDO.herido(); tiembla(0.8);
  chispas(J.x, J.y - 14, PALETA.R, 8, 60);
  const d = Math.hypot(dx, dy) || 1;
  const [nx, ny] = mueveChocando(J.x - J_ANCHO / 2, J.y - J_ALTO, J_ANCHO, J_ALTO, dx / d * 12, dy / d * 12);
  J.x = nx + J_ANCHO / 2; J.y = ny + J_ALTO;
  if (J.vida <= 0) { J.vida = 0; muereJugador(); }
}
function ganaXp(n) {
  J.xp += n;
  while (J.xp >= xpParaSubir()) { J.xp -= xpParaSubir(); J.nivel++; abreMejoras(); }
}

function pintaJugador(ctx, cam, silueta) {
  const parpadea = J.inmune > 0 && Math.floor(J.inmune * 20) % 2 === 0;
  if (parpadea) return;
  const f = J.andando ? Math.floor(J.paso) % 2 : 0;
  let s, espejo = false;
  if (J.mira.y > 0) s = 'bunny_abajo_' + f; else if (J.mira.y < 0) s = 'bunny_arriba_' + f; else { s = 'bunny_lado_' + f; espejo = J.mira.x < 0; }
  const x = J.x - cam.x, y = J.y - cam.y;
  // la sombra
  ctx.globalAlpha = 0.25; caja(ctx, x - 8, y - 2, 16, 3, PALETA.K); ctx.globalAlpha = 1;
  // de día lleva la zanahoria en la mano (de noche gira sola: la pinta armas.js)
  if (NOCHE.fase !== 'noche' && !hayImagen('bunny_abajo')) pintaZanahoriaMano(ctx, x, y);
  const bote = J.andando && f === 1 && !IMG[s] ? -1 : 0;   // sin fotograma propio, el paso 1 es un botecito
  pintaSpr(ctx, s, x, y + bote, { ancla: 'pies', espejo, blanco: !!silueta });
}
function pintaZanahoriaMano(ctx, x, y) {
  const g = J.golpe > 0 ? 1 - J.golpe / 0.25 : 0, s = J.arma.fuego ? 'zanahoria_fuego' : 'zanahoria', z = spr(s), h = spr('zanahoria_hojas');
  ctx.save();
  if (J.mira.y > 0) { ctx.translate(x + 9, y - 12); ctx.rotate(0.9 + g * 1.4); }
  else if (J.mira.y < 0) { ctx.translate(x - 9, y - 20); ctx.rotate(-0.9 - g * 1.4); }
  else { ctx.translate(x + J.mira.x * 9, y - 12); ctx.rotate(J.mira.x > 0 ? -0.7 + g * 1.5 : Math.PI + 0.7 - g * 1.5); }
  ctx.drawImage(z, -Math.round(z.width * 0.15), -Math.round(z.height / 2)); if (!hayImagen('zanahoria')) ctx.drawImage(h, -9, -6);
  ctx.restore();
}
