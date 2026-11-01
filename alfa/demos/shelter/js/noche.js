// Fans of Shelter · EL CICLO: de día (DIA_SEG segundos, o antes si duermes en la hoguera) exploras y crafteas; al caer la noche
// llega la horda (NOCHE_SEG segundos, cada noche más grande) y al final el jefe. Si aguantas, amanece: parte del bosque rebrota.
// Aquí también la partida entera (empezar, morir) y las mejoras que se eligen al subir de nivel.
'use strict';

const DIA_SEG = 80, NOCHE_SEG = 100;
const NOCHE = { fase: 'portada', t: 0, noche: 0, tSpawn: 0, jefe: false, jefeVencido: false, tFin: 0, oscuro: 0 };

function nuevaPartida() {
  mapaNuevo(); jugadorNuevo();
  ENEMIGOS.length = 0; CRISTALES.length = 0; PROY.length = 0; FX.part.length = 0; FX.nums.length = 0;
  Object.assign(NOCHE, { fase: 'dia', t: DIA_SEG, noche: 0, tSpawn: 0, jefe: false, jefeVencido: false, oscuro: 0 });
  SAVE.partidas++; guarda();
  aviso(tr('Día {n}', { n: 1 }), 2.5, PALETA.f);
  setTimeout(() => { if (NOCHE.fase === 'dia' && NOCHE.noche === 0) aviso(tr('Pica, tala y craftea antes de que anochezca'), 3, PALETA.W); }, 2600);
}
function empiezaNoche() {
  NOCHE.noche++; NOCHE.fase = 'noche'; NOCHE.t = NOCHE_SEG; NOCHE.tSpawn = 0; NOCHE.jefe = false; NOCHE.jefeVencido = false;
  cierraVentanas();
  aviso(tr('¡Cae la noche {n}!', { n: NOCHE.noche }), 2.5, PALETA.M);
  SONIDO.noche();
}
function amanece() {
  NOCHE.fase = 'amanecer'; NOCHE.tFin = 2.5;
  // los que quedan se van con la luz
  for (const e of ENEMIGOS) chispas(e.x, e.y - 6, PALETA.M, 4, 30);
  ENEMIGOS.length = 0; PROY.length = 0;
  J.vida = Math.min(J.vidaMax, J.vida + 1);
  if (NOCHE.noche > SAVE.record) { SAVE.record = NOCHE.noche; guarda(); }
  SONIDO.amanece();
}
function abreDormir() {
  abreVentana('dormir');
}
function muereJugador() {
  NOCHE.faseAntes = NOCHE.fase; NOCHE.fase = 'fin'; NOCHE.tFin = 0;
  if (J.bajas > SAVE.bajasRecord) SAVE.bajasRecord = J.bajas;
  guarda(); SONIDO.pierde();
  sueltaTodo();
}

function avanzaCiclo(dt) {
  if (NOCHE.fase === 'dia') {
    NOCHE.t -= dt;
    NOCHE.oscuro = Math.max(0, Math.min(1, (12 - NOCHE.t) / 12)) * 0.55;   // los últimos 12 segundos atardece
    if (NOCHE.t <= 0) empiezaNoche();
    if (MAPA.tiembla) { MAPA.tiembla.t -= dt; if (MAPA.tiembla.t <= 0) MAPA.tiembla = null; }
  } else if (NOCHE.fase === 'noche') {
    NOCHE.t -= dt; NOCHE.oscuro = Math.min(0.58, NOCHE.oscuro + dt * 0.4);
    generaHorda(dt);
    if (NOCHE.t <= 0 && (NOCHE.jefeVencido || !NOCHE.jefe)) amanece();
    else if (NOCHE.t <= 0 && !NOCHE.jefeVencido) NOCHE.t = 0;   // el jefe no deja amanecer hasta que cae
  } else if (NOCHE.fase === 'amanecer') {
    NOCHE.tFin -= dt; NOCHE.oscuro = Math.max(0, NOCHE.oscuro - dt * 0.4);
    if (NOCHE.tFin <= 0) {
      NOCHE.fase = 'dia'; NOCHE.t = DIA_SEG; rebrota(0.5);
      aviso(tr('Día {n}', { n: NOCHE.noche + 1 }), 2.5, PALETA.f);
    }
  } else if (NOCHE.fase === 'fin') NOCHE.tFin += dt;
}
// cuántos y cuáles salen según la noche y el momento
function generaHorda(dt) {
  const n = NOCHE.noche, pasado = NOCHE_SEG - NOCHE.t;
  if (!NOCHE.jefe && pasado >= NOCHE_SEG * 0.7) {
    NOCHE.jefe = true;
    const [x, y] = casillaLibreLejos(J.x, J.y, 180);
    creaEnemigo('jefe', x, y, 1 + (n - 1) * 0.6);
    aviso(tr('¡El Murciélago Gigante!'), 2.5, PALETA.R); SONIDO.jefe(); tiembla(1);
  }
  if (NOCHE.t <= 0) return;   // ya solo queda el jefe
  NOCHE.tSpawn -= dt;
  if (NOCHE.tSpawn > 0) return;
  const ritmo = Math.max(0.25, 1.0 - n * 0.1 - pasado / NOCHE_SEG * 0.45);
  NOCHE.tSpawn = ritmo;
  const tope = 35 + n * 15;
  if (ENEMIGOS.length >= tope) return;
  const grupo = 1 + Math.floor(pasado / 25) + Math.floor(n / 2);
  for (let k = 0; k < grupo; k++) {
    const r = Math.random();
    const tipo = n >= 2 && r < 0.2 + n * 0.03 ? 'murci' : (r > 0.72 - n * 0.03 && pasado > 15) ? 'esqueleto' : 'goblin';
    const [x, y] = sitioDeSalida(tipo === 'murci');
    creaEnemigo(tipo, x, y, 1 + (n - 1) * 0.25);
  }
}
// justo fuera de la pantalla, alrededor del conejo (los que vuelan pueden salir sobre cualquier cosa)
function sitioDeSalida(vuela) {
  const d = Math.hypot(PAN.W, PAN.H) / 2 + 14;
  for (let k = 0; k < 24; k++) {
    const a = Math.random() * Math.PI * 2, x = J.x + Math.cos(a) * d, y = J.y + Math.sin(a) * d;
    const i = Math.floor(x / CAS), j = Math.floor(y / CAS);
    if (i < 1 || j < 1 || i >= MAPA.w - 1 || j >= MAPA.h - 1) continue;
    if (vuela || pasable(i, j)) return [x, y];
  }
  return casillaLibreLejos(J.x, J.y, 150);
}

// LAS MEJORAS al subir de nivel: 3 al azar de estas (las que tengan sentido)
const MEJORAS = [
  { id: 'zana', nombre: '+1 zanahoria', que: 'Otra zanahoria girando', ok: () => J.arma.zanahorias < 6, hace: () => J.arma.zanahorias++ },
  { id: 'giro', nombre: 'Giro rápido', que: 'Las zanahorias giran más deprisa', ok: () => J.arma.giro < 5, hace: () => J.arma.giro++ },
  { id: 'dano', nombre: '+1 daño', que: 'Todo pega más fuerte', ok: () => true, hace: () => J.arma.dano++ },
  { id: 'vida', nombre: '+1 corazón', que: 'Y te cura uno', ok: () => J.vidaMax < 9, hace: () => { J.vidaMax++; J.vida = Math.min(J.vidaMax, J.vida + 1); } },
  { id: 'iman', nombre: 'Imán', que: 'Los cristales vienen de más lejos', ok: () => J.arma.iman < 3, hace: () => J.arma.iman++ },
  { id: 'vel', nombre: 'Patas rápidas', que: 'CrazyBunny corre más', ok: () => J.vel < 1.5, hace: () => { J.vel += 0.12; } },
  { id: 'fuego', nombre: 'Más fuego', que: 'La zanahoria de fuego dispara más', ok: () => J.arma.fuego > 0 && J.arma.cadencia < 2.5, hace: () => { J.arma.cadencia += 0.35; } },
  { id: 'orbe', nombre: '+1 orbe', que: 'Otro orbe mágico', ok: () => J.arma.orbes > 0 && J.arma.orbes < 6, hace: () => J.arma.orbes++ },
  { id: 'sopa', nombre: 'Zanahoria crujiente', que: 'Cura 2 corazones', ok: () => J.vida < J.vidaMax, hace: () => { J.vida = Math.min(J.vidaMax, J.vida + 2); } },
];
function eligeMejoras() {
  const ok = MEJORAS.filter(m => m.ok()), sal = [];
  while (sal.length < 3 && ok.length) sal.push(ok.splice(Math.floor(Math.random() * ok.length), 1)[0]);
  return sal;
}
