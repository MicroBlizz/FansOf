// Fans of Rumble: Tácticas · COMBATE: barras de tiempo (cada uno actúa cuando se le llena), menús, técnicas, objetos, IA enemiga y final del combate.
'use strict';
/* =========================================================
   CREAR LOS LUCHADORES
   ========================================================= */
// las posiciones se piensan en el campo antiguo (y de 205 a 420) y aEscena las lleva al suelo de la maqueta (y de 400 a 650)
const aEscena = ([x, y]) => [x, Math.round(400 + (y - 205) * 1.15)];
const profundidad = y => 0.94 + (y - 430) / 200 * 0.08;   // lo de delante, un poco más grande
const POS_HEROES = [[374, 211], [406, 270], [438, 327], [470, 385]];
const alto = u => (SPR[u.key] ? SPR[u.key].ay : 50) * u.esc;   // altura del dibujo en pantalla
function posEnemigos(lista) {
  const n = lista.length, jefe = lista.findIndex(k => ENEMIGOS[k].jefe);
  if (jefe >= 0) return lista.map((k, i) => i === jefe ? [215, 372] : i < jefe ? [70, 245] : [78, 410]);
  return { 1: [[170, 340]], 2: [[120, 265], [225, 375]], 3: [[105, 240], [240, 310], [105, 395]], 4: [[90, 235], [225, 270], [90, 360], [225, 410]] }[n];
}
const nombreHeroe = key => CFG.cards[key].name;
function nombreDe(key) {
  const e = ENEMIGOS[key]; if (e && e.nombre) return e.nombre;
  const c = CFG.enemyCards[key] || CFG.cards[key];
  return (c && c.name) || key;
}
function estadoVacio() { return { atk: 0, def: 0, prisa: 0, provoca: 0, bajo: 0, aturdido: 0 }; }
function crearHeroe(key, i) {
  const s = statsHeroe(key), g = SAVE.heroes[key];
  const hp = g.hp == null ? s.hp : Math.min(g.hp, s.hp), mp = g.mp == null ? s.mp : Math.min(g.mp, s.mp);
  return { key, lado: 'h', nombre: nombreHeroe(key), lvl: g.lvl, ...s, hpMax: s.hp, mpMax: s.mp, hp, mp, atb: rand(10, 60),
    x: aEscena(POS_HEROES[i])[0], y: aEscena(POS_HEROES[i])[1], esc: 0.95 * 1.25 * profundidad(aEscena(POS_HEROES[i])[1]), id: ++B_ID, est: estadoVacio(), guardia: false, esperando: false, dx: 0, golpe: 0, alfa: 1 };
}
let B_ID = 0;
function crearEnemigo(key, pos) {
  const e = ENEMIGOS[key]; pos = aEscena(pos);
  return { key, lado: 'e', nombre: nombreDe(key), jefe: !!e.jefe, corrupto: !!e.corrupto, hp: e.hp, hpMax: e.hp, mp: 0, mpMax: 0, atk: e.atk, def: e.def, mag: e.atk, spd: e.spd,
    atb: rand(0, 45), x: pos[0], y: pos[1], esc: (e.esc || 1.2) * 1.25 * profundidad(pos[1]), id: ++B_ID, est: estadoVacio(), guardia: false, esperando: false, dx: 0, golpe: 0, alfa: 1, muerto: false, fase2: false };
}

/* =========================================================
   EMPEZAR Y BUCLE
   ========================================================= */
function empezarBatalla(wi, li) {
  const nivel = MUNDOS[wi].niveles[li];
  const pos = posEnemigos(nivel.e);
  const heroes = SAVE.grupo.map((k, i) => crearHeroe(k, i));
  if (heroes.every(h => h.hp <= 0)) { aviso('Tu grupo está fuera de combate: pasa por el café.'); return; }
  B = { wi, li, nivel, heroes, enemigos: nivel.e.map((k, i) => crearEnemigo(k, pos[i])), cola: [], listos: [], menu: null, eligiendo: null,
    ocupado: false, pausa: false, fin: false, t: 0, esperas: [], parts: [], nums: [], ondas: [], fx: [], anims: [], fantasmas: [], parada: 0, temblor: 0, revivido: false, oroRobado: 0, ultimo: 0 };
  mostrar('p-batalla'); ajustarCanvas(); pintarFilas(); cerrarMenu();
  const musica = nivel.jefe ? MUNDOS[wi].musica : HEROES[SAVE.grupo[0]].fac;
  musicSet(TRACKS[musica] ? musica : 'boss');
  cartel(nivel.jefe ? '¡Jefe: ' + nombreDe(nivel.e.find(k => ENEMIGOS[k].jefe)) + '!' : nivel.nombre, nivel.jefe);
  play('horn'); evento('batalla_empieza', { mundo: wi, nivel: li });
  B.ultimo = performance.now(); requestAnimationFrame(bucle);
}
// la escena es de 540 × 960 lógicos: se escala para caber entera en la pantalla (la interfaz de encima, igual)
function ajustarCanvas() {
  const p = $('#p-batalla'), W = p.clientWidth || innerWidth, H = p.clientHeight || innerHeight, K = Math.max(0.2, Math.min(W / LW, H / LH));
  const esc = $('#escena'); esc.style.width = LW * K + 'px'; esc.style.height = LH * K + 'px'; $('#capa').style.transform = `scale(${K})`;
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
  cv.width = Math.round(LW * K * dpr); cv.height = Math.round(LH * K * dpr);
}
window.addEventListener('resize', () => { if (B) ajustarCanvas(); });
function bucle(ahora) {
  if (!B) return;
  const dt = Math.min(0.05, (ahora - B.ultimo) / 1000); B.ultimo = ahora;
  if (!B.pausa) actualizar(dt * (SAVE.ajustes.vel || 1));
  dibujar();
  requestAnimationFrame(bucle);
}
// espera en tiempo de juego (se para con la pausa y va más rápido con la velocidad)
function espera(ms) { return new Promise(r => B.esperas.push({ fin: B.t + ms / 1000, r })); }
const vivos = lista => lista.filter(u => u.hp > 0);

function actualizar(dt) {
  if (B.parada > 0) { B.parada -= dt; dt *= 0.08; }   // parón al golpear fuerte
  B.t += dt;
  avanzaFx(dt);
  for (let i = B.esperas.length - 1; i >= 0; i--) if (B.t >= B.esperas[i].fin) { const e = B.esperas.splice(i, 1)[0]; e.r(); }
  // partículas, números y ondas
  for (const p of B.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.v -= dt; }
  B.parts = B.parts.filter(p => p.v > 0);
  for (const n of B.nums) n.v += dt; B.nums = B.nums.filter(n => n.v < 1.1);
  for (const o of B.ondas) o.v += dt; B.ondas = B.ondas.filter(o => o.v < o.dur);
  B.temblor = Math.max(0, B.temblor - dt * 30);
  for (const u of [...B.heroes, ...B.enemigos]) { u.golpe = Math.max(0, u.golpe - dt * 4); if (u.muerto && u.alfa > 0) u.alfa = Math.max(0, u.alfa - dt * 1.6); }
  if (B.fin) return;
  // las barras: se paran mientras alguien actúa y, en modo Espera, mientras eliges
  const parar = B.ocupado || (SAVE.ajustes.espera && B.menu);
  if (!parar) {
    for (const u of [...B.heroes, ...B.enemigos]) {
      if (u.hp <= 0 || u.esperando) continue;
      u.atb += (AJUSTES.atbBase + u.spd * AJUSTES.atbVel) * (u.est.prisa > 0 ? 1.5 : 1) * (u.fase2 ? 1.35 : 1) * dt;
      if (u.atb >= 100) turnoLleno(u);
    }
  }
  if (!B.menu && B.listos.length) abrirMenu(B.listos[0]);
  if (!B.ocupado && B.cola.length) ejecutar(B.cola.shift());
  actualizarFilas();
}
function turnoLleno(u) {
  u.atb = 100; u.guardia = false;
  if (u.est.aturdido > 0) { u.est.aturdido--; u.atb = 0; numero(u, 'ATURDIDO', '#c08bff', 18); return; }
  u.esperando = true;
  if (u.lado === 'h') { B.listos.push(u); play('select'); }
  else B.cola.push(decidirEnemigo(u));
}

/* =========================================================
   EFECTOS
   ========================================================= */
let cartelT = null;
function cartel(txt, malo) { const c = $('#cartel'); c.textContent = txt; c.classList.toggle('malo', !!malo); c.hidden = false; clearTimeout(cartelT); cartelT = setTimeout(() => (c.hidden = true), 1500); }
function numero(u, txt, col = '#fff', tam = 26) { B.nums.push({ x: u.x + rand(-8, 8), y: u.y - alto(u) * 0.7, txt: String(txt), col, tam, v: 0 }); }
function chispas(x, y, cols, n = 14, vel = 160) { for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), s = rand(vel * 0.4, vel); B.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, g: 380, v: rand(0.35, 0.7), r: rand(2, 4.5), col: pick(cols) }); } }
function onda(x, y, col, r = 70, dur = 0.45) { B.ondas.push({ x, y, col, r, dur, v: 0 }); }
function centro(u) { return [u.x, u.y - alto(u) * 0.45]; }
function efecto(fx, u) {
  const [x, y] = centro(u);
  if (fx === 'slam') { onda(x, u.y, '#ffb347', 80); chispas(x, u.y - 6, ['#ffb347', '#ff7a1a', '#fff'], 16); B.temblor = 6; }
  else if (fx === 'tajo') { B.ondas.push({ x, y, col: '#fff', tajo: true, dur: 0.25, v: 0 }); chispas(x, y, ['#fff', '#ffe58a'], 10); }
  else if (fx === 'rayo') { B.ondas.push({ x, y, col: '#22e3ff', rayo: true, dur: 0.3, v: 0 }); chispas(x, y, ['#22e3ff', '#fff'], 12); }
  else if (fx === 'alma') { chispas(x, y, ['#5ef2a0', '#c8ffe0'], 16, 120); onda(x, y, '#5ef2a0', 50); }
  else if (fx === 'balas') { chispas(x, y, ['#ffe14d', '#ff7a1a'], 8, 220); }
  else if (fx === 'cura') { for (let i = 0; i < 10; i++) B.parts.push({ x: x + rand(-18, 18), y: y + rand(-10, 20), vx: 0, vy: rand(-70, -40), v: rand(0.6, 1), r: rand(2.5, 4), col: pick(['#8be06a', '#d6ffc2', '#fff']), cruz: true }); }
  else chispas(x, y, ['#fff', '#ffb347'], 10);
}

/* =========================================================
   CÁLCULOS
   ========================================================= */
function danio(at, ob, stat, pow) {
  let n = at[stat] * pow * 2 * AJUSTES.defensa / (AJUSTES.defensa + ob.def);
  if (at.est.atk > 0) n *= 1.4; if (at.est.bajo > 0) n *= 0.7;
  if (ob.est.def > 0) n *= 0.6; if (ob.guardia) n *= 0.5;
  n *= rand(0.9, 1.1);
  const crit = Math.random() < AJUSTES.critico; if (crit) n *= AJUSTES.critMult;
  return { n: Math.max(1, Math.round(n)), crit };
}
function herir(u, d) {
  if (u.hp <= 0) return;
  u.hp = Math.max(0, u.hp - d.n); u.golpe = 1; luzGolpe(u, d);
  numero(u, d.n, d.crit ? '#ffcb3d' : '#fff', d.crit ? 34 : 26); if (d.crit) { cartelCrit(); B.temblor = Math.max(B.temblor, 5); }
  play('hit');
  if (u.hp <= 0) caer(u);
  else if (u.jefe && !u.fase2 && u.hp < u.hpMax / 2) { u.fase2 = true; cartel(u.nombre + ' se enfada', true); play('womp'); }
}
function cartelCrit() { numeroLibre('¡CRÍTICO!', '#ffcb3d'); }
function numeroLibre(t, col) { B.nums.push({ x: LW / 2, y: 214, txt: t, col, tam: 30, v: 0 }); }
function curar(u, n) { if (u.hp <= 0) return; n = Math.round(Math.min(n, u.hpMax - u.hp)); u.hp += n; numero(u, '+' + n, '#8be06a'); efecto('cura', u); }
function caer(u) {
  u.esperando = false; u.atb = 0; u.est = estadoVacio();
  B.cola = B.cola.filter(a => a.actor !== u);
  if (u.lado === 'h') { B.listos = B.listos.filter(x => x !== u); if (B.menu && B.menu.h === u) cerrarMenu(); play('womp'); }
  else { u.muerto = true; chispas(...centro(u), ['#fff', '#cdb9ea', '#8f7ab0'], 18, 140); play('poof'); }
}
function revivir(u, frac) { u.hp = Math.max(1, Math.round(u.hpMax * frac)); u.muerto = false; u.alfa = 1; u.atb = 0; numero(u, 'REVIVE', '#8be06a', 22); efecto('cura', u); play('revive'); }
function otroVivo(lado, prefer) {
  const l = vivos(lado === 'e' ? B.enemigos : B.heroes); if (prefer && prefer.hp > 0) return prefer; return l.length ? pick(l) : null;
}

/* =========================================================
   EJECUTAR UNA ACCIÓN (de héroe o de enemigo)
   ========================================================= */
async function ejecutar(a) {
  const u = a.actor; if (!u || u.hp <= 0) return;
  B.ocupado = true; B.actuando = u;
  try {
    if (u.lado === 'h') await accionHeroe(u, a); else await accionEnemigo(u, a);
  } catch (err) { console.error(err); }
  u.atb = 0; u.esperando = false;
  for (const k of ['atk', 'def', 'prisa', 'provoca', 'bajo']) if (u.est[k] > 0) u.est[k]--;
  await espera(160);
  B.ocupado = false; B.actuando = null;
  comprobarFin();
}
async function embestir(u, dir) {   // el que actúa da un paso adelante
  const d = u.lado === 'h' ? -1 : 1;
  for (let i = 1; i <= 6; i++) { u.dx = d * 30 * (i / 6); await espera(16); }
  if (dir === 'volver') return;
}
async function retroceder(u) { for (let i = 5; i >= 0; i--) { u.dx = (u.lado === 'h' ? -1 : 1) * 30 * (i / 6); await espera(16); } u.dx = 0; }

async function accionHeroe(h, a) {
  if (a.tipo === 'defender') { h.guardia = true; numero(h, 'DEFIENDE', '#c08bff', 20); play('shield'); await espera(350); return; }
  if (a.tipo === 'atacar') {
    const ob = otroVivo('e', a.obj); if (!ob) return;
    const A = TEC_ANIM.atacar; await A.antes(h, [ob]); play(pick(['hit', 'slam'])); A.golpe(h, ob); herir(ob, danio(h, ob, 'atk', 1)); const gana = Math.min(AJUSTES.caosAtaque, h.mpMax - h.mp); if (gana > 0) { h.mp += gana; numero(h, '+' + gana + ' CAOS', '#f3a6ff', 18); } await espera(260); await A.despues(h); return;
  }
  if (a.tipo === 'objeto') {
    const o = OBJETOS[a.id]; if (!(SAVE.items[a.id] > 0)) { aviso('Ya no te quedan.'); return; }
    SAVE.items[a.id]--; guardar(); cartel(o.nombre); await embestir(h);
    if (o.a === 'grupo') vivos(B.heroes).forEach(x => curar(x, o.curaFija));
    else if (o.revive) { const ob = a.obj && a.obj.hp <= 0 ? a.obj : B.heroes.find(x => x.hp <= 0); if (ob) revivir(ob, o.revive); }
    else { const ob = otroVivo('h', a.obj); if (o.curaFija) curar(ob, o.curaFija); if (o.caos) { const n = Math.min(o.caos, ob.mpMax - ob.mp); ob.mp += n; numero(ob, '+' + n + ' CAOS', '#f3a6ff', 20); } }
    play('heal'); await espera(420); await retroceder(h); return;
  }
  // técnica
  const t = TECNICAS[a.id]; if (h.mp < t.mp) return;
  h.mp -= t.mp; cartel(t.nombre); play(t.sfx || 'card');
  // a quién va (para la animación) y la animación de la técnica (espectaculo-tecnicas.js)
  const obs = t.a === 'enemigo' ? [otroVivo('e', a.obj)] : t.a === 'enemigos' ? vivos(B.enemigos) : t.a === 'aliado' ? [otroVivo('h', a.obj)]
    : t.a === 'caido' ? [a.obj && a.obj.hp <= 0 ? a.obj : B.heroes.find(x => x.hp <= 0)].filter(Boolean) : t.a === 'yo' ? [h] : vivos(B.heroes);
  const an = TEC_ANIM[a.id] || {}, vuelve = () => (an.despues ? an.despues(h, obs) : retroceder(h));
  if (an.antes) await an.antes(h, obs); else { await embestir(h); await espera(120); }
  if (t.ruleta) { await ruleta(h); await vuelve(); return; }
  if (t.a === 'enemigo' || t.a === 'enemigos') {
    for (let g = 0; g < (t.golpes || 1); g++) {
      for (const ob of obs) {
        if (!ob || ob.hp <= 0) continue;
        if (t.pow) { if (an.golpe) an.golpe(h, ob, g); else efecto(t.fx, ob); const d = danio(h, ob, t.st, t.pow); herir(ob, d); if (t.roba) curar(h, d.n * t.roba); }
        if (t.aturde && ob.hp > 0) { if (Math.random() < (ob.jefe ? t.aturde * 0.4 : t.aturde)) { ob.est.aturdido = 1; numero(ob, 'SIN TURNO', '#c08bff', 18); } else numero(ob, 'FALLA', '#cdb9ea', 18); }
      }
      if (t.golpes > 1) { play(t.sfx); await (an.entre ? an.entre(h, obs, g) : espera(200)); }
    }
    if (t.caosGrupo) for (const ob of vivos(B.heroes)) { const n = Math.min(t.caosGrupo, ob.mpMax - ob.mp); if (n > 0) { ob.mp += n; numero(ob, '+' + n + ' CAOS', '#f3a6ff', 20); } }
    if (t.oro) { SAVE.oro += t.oro; numero(h, '+' + t.oro + ' oro', '#ffcb3d', 20); guardar(); }
  } else if (t.a === 'grupo' || t.a === 'yo') {
    const obs = t.a === 'yo' ? [h] : vivos(B.heroes);
    for (const ob of obs) {
      if (t.mejora) { ob.est[t.mejora] = t.turnos + (ob === h ? 1 : 0); if (t.extra) ob.est[t.extra] = t.turnos + 1; numero(ob, { atk: 'ATQ+', def: 'DEF+', prisa: 'PRISA', provoca: 'PROVOCA' }[t.mejora], '#c08bff', 20); }
      if (t.cura) curar(ob, h[t.st] * t.cura * rand(2.6, 3));
    }
  } else if (t.a === 'aliado') {
    const ob = obs[0] || otroVivo('h', a.obj); curar(ob, h[t.st] * t.cura * rand(2.6, 3)); if (t.limpia) { ob.est.bajo = 0; ob.est.aturdido = 0; }
  } else if (t.a === 'caido') {
    const ob = obs[0]; if (ob && ob.hp <= 0) revivir(ob, t.revive); else numero(h, 'FALLA', '#cdb9ea', 18);
  }
  await espera(380); await vuelve();
}
async function ruleta(h) {
  const r = Math.random();
  if (r < 0.3) { cartel('¡Bomba de memes!'); for (const ob of vivos(B.enemigos)) { efecto('slam', ob); herir(ob, danio(h, ob, 'mag', 1.8)); } play('boom'); }
  else if (r < 0.55) { cartel('¡Curación viral!'); vivos(B.heroes).forEach(x => curar(x, x.hpMax * 0.4)); play('heal'); }
  else if (r < 0.75) { cartel('¡Lluvia de oro!'); SAVE.oro += 60; guardar(); numero(h, '+60 oro', '#ffcb3d', 24); play('crown'); }
  else if (r < 0.9) { cartel('normal…'); numero(h, 'NO PASA NADA', '#cdb9ea', 18); play('womp'); }
  else { cartel('¡Le sale mal!', true); herir(h, { n: Math.round(h.hpMax * 0.1), crit: false }); play('laugh'); }
  await espera(500);
}

/* ---------- IA enemiga ---------- */
function decidirEnemigo(u) {
  const accs = ENEMIGOS[u.key].acc.filter(x => {
    if (x.t === 'curar' && !x.yo) return vivos(B.enemigos).some(e => e.hp < e.hpMax * 0.7);
    if (x.t === 'curar' && x.yo) return u.hp < u.hpMax * 0.6;
    if (x.t === 'llamar') return vivos(B.enemigos).length < 4;
    return true;
  });
  let tot = accs.reduce((s, x) => s + x.p, 0), r = Math.random() * tot, elegida = accs[0];
  for (const x of accs) { r -= x.p; if (r <= 0) { elegida = x; break; } }
  return { actor: u, acc: elegida };
}
function objetivoHeroe() {
  const l = vivos(B.heroes); const prov = l.filter(h => h.est.provoca > 0);
  return prov.length ? pick(prov) : pick(l);
}
async function accionEnemigo(u, a) {
  const x = a.acc; cartel(x.n, true);
  await previaEnemigo(u, x); await embestir(u); if (x.sfx) play(x.sfx);
  if (x.t === 'golpe' || x.t === 'drenar' || x.t === 'robar' || x.t === 'aturdir') {
    const h = objetivoHeroe(); if (!h) return;
    efecto(u.jefe ? 'slam' : 'tajo', h); golpeEnemigo(u, h, x); const d = danio(u, h, 'atk', x.pow || 1); herir(h, d);
    if (x.t === 'drenar') curar(u, d.n * 0.5);
    if (x.t === 'robar') { const n = Math.min(SAVE.oro, 10 + Math.round(rand(0, 10))); if (n > 0) { SAVE.oro -= n; B.oroRobado += n; numero(h, '−' + n + ' oro', '#ffcb3d', 20); guardar(); } }
    if (x.t === 'aturdir' && h.hp > 0 && Math.random() < 0.6) { h.est.aturdido = 1; numero(h, 'SIN TURNO', '#c08bff', 18); }
  } else if (x.t === 'todos') {
    B.temblor = 7; for (const h of vivos(B.heroes)) { efecto('slam', h); golpeEnemigo(u, h, x); herir(h, danio(u, h, 'atk', x.pow)); }
  } else if (x.t === 'curar') {
    const l = vivos(B.enemigos).sort((p, q) => p.hp / p.hpMax - q.hp / q.hpMax); const ob = x.yo ? u : l[0];
    curar(ob, x.yo ? u.hpMax * 0.08 * x.pow : u.atk * x.pow * 2);
  } else if (x.t === 'bajar') {
    for (const h of vivos(B.heroes)) { h.est.bajo = 3; numero(h, 'ATQ−', '#ff8aa0', 20); }
  } else if (x.t === 'llamar') {
    const ocup = B.enemigos.filter(e => !e.muerto).map(e => e.x + ',' + e.y);
    const sitio = [[155, 205], [65, 325], [300, 215], [290, 420]].find(p => !ocup.includes(aEscena(p).join(','))) || [60 + rand(0, 200), 230 + rand(0, 160)];
    const n = crearEnemigo(x.que, sitio); n.atb = 0; B.enemigos.push(n); chispas(n.x, n.y - 20, ['#c08bff', '#fff'], 16); numero(n, '¡CONTRATADO!', '#ff8aa0', 16);
  }
  await espera(380); await retroceder(u);
}

