// Fans of Rouflage (prototipo) · EL BECARIO BOT: el cazador que lleva la máquina cuando tú eres camaleón. Hace la ronda sala por sala
// con su linterna y acude a los silbidos. No sabe dónde estás: solo «ve» con la misma medida de camuflaje que tu marcador.
// Cómo ve: a cada distancia hay un mínimo de «cantar» para que te distinga (de cerca le basta con poco; de lejos tienes que cantar
// mucho). Su sospecha sube hacia lo que cantas dividido por ese mínimo: con 0,5 le pica la curiosidad y se acerca a mirar («?»);
// con 1 te ha visto, apunta («!») y dispara. Si estás bien pintado, por mucho que mire no pasa de la curiosidad y se va.
// Y se equivoca como una persona: a veces despide a un extintor, y a los medio bien pintados les puede plantar el sello al lado.
'use strict';

function cerebroCazador(e) {
  e.bot = { estado: 'espera', t: 0, camino: null, i: 0, atasco: 0, ax: e.x, ay: e.y, puntos: [], sala: null, visitadas: [], sosp: new Map(), ignora: new Map(),
    objetivo: null, destino: null, base: 0, dura: 0, ancho: 1, punto: null, tRuta: 0, falsos: 0, tSenuelo: rand(8, 15), atento: 1, pisados: new Set(), ojo: new Map(), visto: null, tCerca: 0 };
}
// ¿ve este cazador el punto (x, y)? Devuelve a qué distancia lo ve, o 0 si no lo ve (fuera de su luz o con un muro en medio)
function veCazador(e, x, y) {
  const ox = e.x, oy = e.y - 6, d = lejos(ox, oy, x, y), largo = AJUSTES.luzLargo * (e.ciego > 0 ? 0.5 : 1);
  if (d > largo) return 0;
  if (d > AJUSTES.luzCerca && Math.abs(giro(e.dir, Math.atan2(y - oy, x - ox))) > AJUSTES.luzAngulo) return 0;
  return seVen(ox, oy, x, y) ? Math.max(d, 0.01) : 0;
}
// lo que tiene que «cantar» un camaleón (de 0 a 1) para que un becario lo distinga a esa distancia; si va atento (tras un silbido), algo menos
const minimoVista = (d, atento) => entre(AJUSTES.vistaCerca, AJUSTES.vistaLejos, Math.min(1, d / AJUSTES.luzLargo)) * (atento > 1 ? 0.85 : 1);
// cada vez que un becario se fija en alguien lo hace con mejor o peor ojo (de 0,55 a 1,45 veces el mínimo): así el mismo camuflaje
// unas veces cuela y otras no, y no hay una cifra mágica a partir de la cual seas invisible
const ojoPara = (b, k) => { let o = b.ojo.get(k); if (!o) { o = rand(0.55, 1.45); b.ojo.set(k, o); } return o; };

/* ---------- andar por un camino (lo usan también los camaleones bot) ---------- */
function ponRumbo(e, x, y) { const b = e.bot; b.camino = buscaCamino(e.x, e.y, x, y); b.i = 0; b.atasco = 0; b.ax = e.x; b.ay = e.y; return !!b.camino; }
// si alguien se queda trabado contra una esquina: se le coloca en el centro de la casilla libre más cercana (son unos píxeles) y sigue
function destraba(e) { const c = casillaCerca(e.x, e.y); if (c && cabe(c[0] * CEL + 10, c[1] * CEL + 14)) { e.x = c[0] * CEL + 10; e.y = c[1] * CEL + 14; } }
// da un paso por su camino; devuelve true cuando ha llegado
function sigueCamino(e, dt) {
  const b = e.bot;
  if (!b.camino || b.i >= b.camino.length) { e.vx = e.vy = 0; return true; }
  const [tx, ty] = b.camino[b.i], d = lejos(e.x, e.y, tx, ty);
  if (d < 7) { b.i++; if (b.i >= b.camino.length) { e.vx = e.vy = 0; return true; } return false; }
  e.vx = (tx - e.x) / d; e.vy = (ty - e.y) / d;
  b.atasco += dt;   // si lleva un rato sin avanzar, busca otro camino al mismo sitio; si ni así, se le destraba
  if (b.atasco > 0.7) {
    if (lejos(b.ax, b.ay, e.x, e.y) < 6) { const f = b.camino[b.camino.length - 1]; b.trabado = (b.trabado || 0) + 1; if (b.trabado > 1) destraba(e); if (!ponRumbo(e, f[0], f[1])) b.camino = null; }
    else b.trabado = 0;
    b.atasco = 0; b.ax = e.x; b.ay = e.y;
  }
  return false;
}
const giraHacia = (e, a, dt, vel = 7) => { e.dir += giro(e.dir, a) * Math.min(1, dt * vel); };

/* ---------- la ronda ---------- */
function puntosDe(z, n) { const pts = []; if (z) for (let k = 0; k < n; k++) { const p = sitioLibre({ sala: z, lejosDe: pts, min: 130, intentos: 60 }); if (p) pts.push(p); } return pts; }
function nuevaSala(e) {
  const b = e.bot, aqui = salaDe(e.x, e.y), otro = J.cazadores.find(h => h !== e && h.bot && !h.fuera);
  let cand = SALAS.filter(z => z !== aqui && !b.visitadas.includes(z.id) && !(otro && otro.bot.sala === z));
  if (!cand.length) { b.visitadas = aqui ? [aqui.id] : []; cand = SALAS.filter(z => z !== aqui); }
  // la más cercana de las que le quedan, con algo de azar para que no haga siempre el mismo recorrido
  let mejor = cand[0], md = 1e9;
  for (const z of cand) { const d = lejos(e.x, e.y, z.px + z.pw / 2, z.py + z.ph / 2) + rand(0, 380) + (z.id === 'rrhh' ? 500 : 0); if (d < md) { md = d; mejor = z; } }
  b.sala = mejor; b.visitadas.push(mejor.id); b.puntos = puntosDe(mejor, mejor.pw * mejor.ph > 150000 ? 3 : 2);
}
function ronda(e) { const b = e.bot; b.estado = 'ronda'; b.t = 0; b.objetivo = null; b.camino = null; b.atento = 1; e.marca = ''; e.alerta = 0; e.prisa = 1; }
function mira(e, dura, ancho) { const b = e.bot; b.estado = 'mira'; b.t = 0; b.base = e.dir; b.dura = dura; b.ancho = ancho; e.vx = e.vy = 0; }
function sospecha(e, k) { const b = e.bot; b.estado = 'sospecha'; b.t = 0; b.tCerca = 0; b.objetivo = k; b.visto = [k.x, k.y]; b.tRuta = 0; e.marca = '?'; e.alerta = 0.5; e.prisa = 1; if (k.jugador) play('blip'); }

// oye un silbido (o recibe un chivatazo en la recta final): deja la ronda y va a mirar por esa zona
function oyeSilbido(e, x, y) {
  const b = e.bot; if (!b || e.fuera || e.balas <= 0 || !['ronda', 'mira', 'investiga'].includes(b.estado)) return;
  const d = lejos(e.x, e.y, x, y); if (d > AJUSTES.oido) return;
  if (b.estado === 'investiga' && b.destino && lejos(e.x, e.y, b.destino[0], b.destino[1]) < d) return;   // ya va a por uno más cercano
  const c = casillaCerca(x, y); if (!c) return;
  b.destino = [c[0] * CEL + 10, c[1] * CEL + 14];
  if (ponRumbo(e, b.destino[0], b.destino[1])) { b.estado = 'investiga'; b.t = 0; b.atento = 1.8; e.marca = '?'; e.alerta = 0.5; }
}

// de vez en cuando un becario se fija en algo con forma de alubia que no lo es
const NOMBRE_SENUELO = { extintor: 'un extintor', papelera: 'una papelera', cono: 'un cono', maniqui: 'el Empleado del Mes' };
function senueloCerca(e, dt) {
  const b = e.bot; b.tSenuelo -= dt;
  if (b.tSenuelo > 0 || b.falsos >= 2 || e.balas <= 2 || e.enfria > 0) return false;
  b.tSenuelo = rand(7, 13);
  const m = MUEBLES.find(m => m.T.senuelo && lejos(e.x, e.y, m.x, m.y) > 60 && veCazador(e, m.x, m.y - 6));
  if (!m || Math.random() > 0.55) return false;
  sospecha(e, { senuelo: true, x: m.x, y: m.y, hielo: 1, nombre: tr(NOMBRE_SENUELO[m.t]) });
  return true;
}

function disparaBot(e) {
  const b = e.bot, k = b.objetivo; let [x, y] = b.punto;
  e.enfria = AJUSTES.enfria; e.alerta = 0;
  if (k.senuelo) {
    fxDisparo(e, x, y); fxMancha(x, y); e.balas--; b.falsos++; e.ciego = AJUSTES.ciego; e.enfria = AJUSTES.enfriaFallo; play('clank');
    avisa(tr('{a} ha despedido a {b}. Despido improcedente.').replace('{a}', e.nombre).replace('{b}', k.nombre), 'bueno');
    b.estado = 'confuso'; b.t = 0; return;
  }
  const corre = k.hielo < 0.85 && (k.moviendo || k.movido > 0);
  // cuanto mejor pintado está, más fácil es que el sello caiga al lado
  if (!corre && k.congelado && Math.random() < limita((k.camo - 50) / 60, 0, 0.4)) { const a = rand(0, TAU), d = rand(32, 46); x = k.x + Math.cos(a) * d; y = k.y - 24 + Math.sin(a) * d * 0.8; }
  fxDisparo(e, x, y);
  if (dentroDeAlubia(k, x, y, 3)) {
    despide(k, e); e.balas = Math.min(AJUSTES.balas, e.balas + 1); b.sosp.delete(k); b.estado = 'confuso'; b.t = 0.9; e.marca = '';
  } else if (corre) { b.estado = 'sospecha'; b.t = 0; fxMancha(x, y); play('gun'); }   // a quien huye se le puede disparar sin gastar
  else {
    e.balas--; e.ciego = AJUSTES.ciego; e.enfria = AJUSTES.enfriaFallo; b.ignora.set(k, 10); b.sosp.set(k, 0); b.ojo.delete(k); b.estado = 'confuso'; b.t = 0;
    fxMancha(x, y); play('clank');
    avisa(tr('{a} ha fallado. Despido improcedente.').replace('{a}', e.nombre), 'bueno');
    if (k.jugador) fxTexto(k.x, k.y - 72, tr('¡Uf!'), '#7ee04a');
  }
}

function piensaCazador(e, dt) {
  const b = e.bot; b.t += dt;
  if (b.estado === 'espera' || e.fuera) return;
  if (e.balas <= 0 && b.estado !== 'fuera') {   // sin cartas de despido: se vuelve a Recursos Humanos
    b.estado = 'fuera'; e.marca = ''; e.alerta = 0; e.prisa = 0.8;
    const s = SALIDA_CAZADORES[J.cazadores.indexOf(e) % SALIDA_CAZADORES.length]; ponRumbo(e, s[0], s[1]);
    avisa(tr('{a} se ha quedado sin cartas de despido').replace('{a}', e.nombre), 'bueno');
  }
  if (b.estado === 'fuera') { if (!sigueCamino(e, dt)) giraHacia(e, Math.atan2(e.vy, e.vx), dt); return; }

  // lo que ve: la sospecha de cada camaleón que tiene en la luz sube hacia su «nivel» (lo que canta entre el mínimo para verlo desde ahí)
  let top = null, topS = 0;
  for (const k of J.camaleones) {
    if (k.fuera) { b.sosp.delete(k); continue; }
    const ign = b.ignora.get(k) || 0; if (ign > 0) { b.ignora.set(k, ign - dt); if (k.hielo >= 0.85) continue; b.ignora.set(k, 0); }   // si se mueve, deja de ignorarlo
    const d = veCazador(e, k.x, k.y - 8); let s = b.sosp.get(k) || 0;
    if (d) {
      k.enVista = true;
      const nivel = loQueCanta(k) / (minimoVista(d, b.atento) * (k.hielo < 0.85 ? 1 : ojoPara(b, k)));
      if (nivel > s) s = Math.min(1.3, s + (nivel - s) * (k.hielo < 0.85 ? 3 : 1.4) * dt + 0.02 * dt);
      else s = Math.max(nivel, s - 0.2 * dt);
      if (d < 14 && e.moviendo && !b.pisados.has(k)) { b.pisados.add(k); s = Math.max(s, 0.55); }   // se ha tropezado con él: se para a mirar
    } else s = Math.max(0, s - 0.14 * dt);
    b.sosp.set(k, s);
    if (s > topS) { topS = s; top = k; }
  }
  const algo = top && topS >= 0.5;

  switch (b.estado) {
    case 'ronda':
      if (algo) { sospecha(e, top); break; }
      if (senueloCerca(e, dt)) break;
      if (!b.puntos.length) nuevaSala(e);
      if (!b.camino) { const p = b.puntos[0]; if (!p || !ponRumbo(e, p[0], p[1])) { b.puntos.shift(); break; } }
      if (sigueCamino(e, dt)) { b.puntos.shift(); b.camino = null; mira(e, 1.5, 1.25); } else giraHacia(e, Math.atan2(e.vy, e.vx), dt);
      break;
    case 'mira':        // parado, barriendo con la linterna a un lado y a otro
      if (algo) { sospecha(e, top); break; }
      e.dir = b.base + Math.sin(b.t * 2.4) * b.ancho;
      if (b.t > b.dura) { b.estado = 'ronda'; b.t = 0; b.atento = 1; e.marca = ''; e.alerta = 0; }
      break;
    case 'investiga':   // va a donde ha oído el silbido y, al llegar, mira bien alrededor
      e.prisa = 1.12;
      if (algo) { sospecha(e, top); break; }
      if (sigueCamino(e, dt)) { e.prisa = 1; b.puntos = puntosDe(salaDe(e.x, e.y), 1); b.camino = null; mira(e, 2.8, 1.9); } else giraHacia(e, Math.atan2(e.vy, e.vx), dt);
      break;
    case 'sospecha': {  // algo le ha llamado la atención: se acerca sin quitarle la luz de encima
      const k = b.objetivo;
      if (!k || k.fuera) { ronda(e); break; }
      // va hacia el último sitio donde lo ha visto: si el otro dobla una esquina, no sabe por dónde ha tirado
      const loVe = k.senuelo || veCazador(e, k.x, k.y - 8) > 0; if (loVe) b.visto = [k.x, k.y];
      const [vx, vy] = b.visto, s = k.senuelo ? b.t / 1.5 : b.sosp.get(k) || 0, d = lejos(e.x, e.y, vx, vy), corre = !k.senuelo && k.hielo < 0.85;
      e.marca = '?'; e.alerta = 0.5;
      giraHacia(e, Math.atan2(vy - 8 - (e.y - 6), vx - e.x), dt, 9);
      if (d > (corre ? 44 : 70)) { b.tRuta -= dt; if (b.tRuta <= 0) { ponRumbo(e, vx, vy); b.tRuta = 0.45; } sigueCamino(e, dt); } else { e.vx = e.vy = 0; b.tCerca += dt; }
      if (loVe && s >= 1 && e.enfria <= 0 && d < AJUSTES.alcance) { b.estado = 'apunta'; b.t = 0; b.punto = null; e.marca = '!'; e.alerta = 1; e.vx = e.vy = 0; if (k.jugador) play('hype'); break; }
      if (!loVe && d <= 46) { b.sosp.set(k, 0.3); mira(e, 2.2, 1.9); break; }   // ha llegado y ya no está: mira alrededor y sigue la ronda
      // falsa alarma: lo ha mirado bien de cerca un rato y no lo distingue; lo deja estar una temporada
      if ((b.tCerca > (k.senuelo ? 9 : 2.8) || b.t > 11) && s < 1) { if (!k.senuelo) { b.ignora.set(k, 14); b.sosp.set(k, 0.2); b.ojo.delete(k); if (k.jugador && k.congelado) fxTexto(k.x, k.y - 72, tr('¡Uf!'), '#7ee04a'); } ronda(e); }
      break;
    }
    case 'apunta': {    // medio segundo de aviso (el «!»): quien sale corriendo a tiempo puede librarse
      const k = b.objetivo; e.vx = e.vy = 0;
      if (!k || k.fuera) { ronda(e); break; }
      giraHacia(e, Math.atan2(k.y - 8 - (e.y - 6), k.x - e.x), dt, 10);
      if (b.t < 0.55 || !b.punto) b.punto = [k.x, k.y - (k.senuelo ? 14 : 24)];
      if (b.t >= 0.75) disparaBot(e);
      break;
    }
    case 'confuso':     // tras disparar: un momento parado antes de seguir la ronda
      e.vx = e.vy = 0; if (b.t > 1.7) ronda(e);
      break;
  }
}
