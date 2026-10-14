// Fans of Ratkov · LO QUE HAY AHÍ FUERA: becarios carroñeros (van por libre y huyen si les va mal), Seguridad Microblizz (en grupo, con
// escudo por delante), El Auditor (el jefe: su maletín es una ametralladora, y pide refuerzos a media vida) y El Lag (la anomalía de la
// grieta: va a saltos y, si te toca, te desincroniza). Ven con un cono de vista (SlyFox se esconde mejor), oyen los disparos y, cuando
// caen, dejan su cuerpo con lo que llevaban (un contenedor más).
'use strict';
const ENEMIGOS = [];
const TIPOS_ENEMIGO = {
  carronero: { n: 'Becario carroñero', vida: 75, vel: 3.3, radio: 0.5, vista: 17, dist: [5, 9], arma: 'trabuco', dano: 7, perd: 4, disp: 0.22, balaVel: 30, alc: 13, cad: 1.35, rafaga: 1, cadRafaga: 0, reaccion: 0.7 },
  seguridad: { n: 'Seguridad Microblizz', vida: 135, vel: 2.9, radio: 0.6, vista: 21, dist: [9, 15], arma: 'rifleSeg', dano: 9, perd: 1, disp: 0.07, balaVel: 42, alc: 23, cad: 1.5, rafaga: 3, cadRafaga: 0.13, reaccion: 0.5, escudo: true },
  auditor: { n: 'El Auditor', vida: 1150, vel: 2.3, radio: 0.85, vista: 24, dist: [8, 14], arma: 'maletin', dano: 6, perd: 1, disp: 0.15, balaVel: 40, alc: 22, cad: 1.6, rafaga: 34, cadRafaga: 0.07, reaccion: 0.4, jefe: true },
  practicas: { n: 'Becario de prácticas', vida: 40, vel: 1.9, radio: 0.5, vista: 14, dist: [3, 6], arma: 'trabuco', dano: 2, perd: 3, disp: 0.3, balaVel: 22, alc: 10, cad: 2.2, rafaga: 1, cadRafaga: 0, reaccion: 1.5 },
  lag: { n: 'El Lag', vida: 280, vel: 3.6, radio: 0.6, vista: 18, dist: [0, 1.4], arma: null, dano: 22, reaccion: 0.3, salta: true },
};
// dónde puede aparecer cada uno (se sortea en cada incursión)
const SITIOS = {
  carronero: [[-45, -24], [-52, -12], [-60, 26], [-70, 30], [-24, 32], [-4, 30], [6, 40], [40, 32], [56, 28], [66, 46], [-30, 0], [22, 2], [-56, -40], [70, -8], [30, -40], [-20, -34]],
  seguridad: [[48, -14, 3], [-2, 6, 2], [58, 44, 2], [-36, -46, 2]],
};
let MARCAS = null;
function marcaTex(txt, color) { return textura(16, 16, g => { g.fillStyle = '#120e18'; g.fillRect(3, 1, 10, 14); g.fillStyle = color; g.fillRect(4, 2, 8, 12); g.fillStyle = '#120e18'; g.font = 'bold 11px monospace'; g.textAlign = 'center'; g.fillText(txt, 8, 12); }); }

function creaEnemigo(tipo, x, z, extra = {}) {
  const T = TIPOS_ENEMIGO[tipo], p = libreCerca(x, z, T.radio);
  const mod = montaPersonaje(tipo, false); ponArma(mod, T.arma);
  if (!MARCAS) MARCAS = { '?': new THREE.SpriteMaterial({ map: marcaTex('?', '#ffcb3d') }), '!': new THREE.SpriteMaterial({ map: marcaTex('!', '#ff4b5c') }) };
  const marca = new THREE.Sprite(MARCAS['?']); marca.scale.set(0.9, 0.9, 1); marca.visible = false; MOTOR.escena.add(marca);
  const e = Object.assign({ tipo, T, x: p.x, z: p.z, a: entre(0, TAU), vida: T.vida, max: T.vida, radio: T.radio, vivo: true, estado: 'ronda', alerta: 0,
    casa: { x: p.x, z: p.z }, obj: null, tPensar: 0, tDisparo: entre(0.5, 1.5), quedan: 0, visto: null, tVisto: 0, tReaccion: 0, fase: entre(0, 6),
    hielo: 0, atasco: 0, desvio: null, tDesvio: 0, mod, marca, salto: 0, refuerzos: false, ruido: 0 }, extra);
  mod.grupo.position.set(e.x, 0, e.z); MOTOR.escena.add(mod.grupo);
  ENEMIGOS.push(e); return e;
}
function limpiaEnemigos() { for (const e of ENEMIGOS) { MOTOR.escena.remove(e.mod.grupo); MOTOR.escena.remove(e.marca); } ENEMIGOS.length = 0; }
function pueblaMapa() {
  const sitios = baraja(SITIOS.carronero.slice()).slice(0, Math.round(10 * dif().cuantos));
  for (const [x, z] of sitios) creaEnemigo('carronero', x + entre(-2, 2), z + entre(-2, 2));
  for (const [x, z, n0] of SITIOS.seguridad) { const g = {}, n = Math.max(1, Math.round(n0 * dif().cuantos)); for (let i = 0; i < n; i++) creaEnemigo('seguridad', x + i * 1.6, z + (i % 2) * 1.4, { grupo: g }); }
  if (azar(0.7)) { const g = {}; creaEnemigo('auditor', 0, -40, { grupo: g }); creaEnemigo('seguridad', -3, -38, { grupo: g }); creaEnemigo('seguridad', 3, -38, { grupo: g }); RAID.hayAuditor = true; }
  if (azar(0.75)) { creaEnemigo('lag', 1, -11); RAID.hayLag = true; }
}
const baraja = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- pensar y moverse ---------- */
function avanzaEnemigos(dt) {
  for (const e of ENEMIGOS) {
    if (!e.vivo) continue;
    const dJ = JUG && JUG.vivo ? lejos(e.x, e.z, JUG.x, JUG.z) : 999;
    if (dJ > 70 && e.estado === 'ronda') { e.marca.visible = false; continue; }      // muy lejos: duerme
    const T = e.T, lento = e.hielo > 0 ? 0.5 : 1; e.hielo -= dt;
    // el del tutorial que espera de espaldas, y el que se ha llevado un culatazo: no hacen nada un momento
    if (e.quieto) { e.marca.visible = false; mueveEnemigo(e, 0, 0, 0, dt); continue; }
    if (e.aturdido > 0) { e.aturdido -= dt; e.marca.visible = true; e.marca.material = MARCAS['?']; e.marca.position.set(e.x, 2.3 * e.mod.escala / 1.5 + 1.2, e.z); mueveEnemigo(e, 0, 0, 0, dt); continue; }
    // ¿te ve?
    let ve = false;
    if (JUG && JUG.vivo) {
      const rango = T.vista * dif().vista * vistaJugador(JUG) * (RAID.ventisca > 0.5 ? 0.7 : 1), pegado = JUG.agacha ? 1.6 : 4;
      const ang = Math.abs(giroA(e.a, Math.atan2(JUG.x - e.x, JUG.z - e.z)));
      if (dJ < rango && (dJ < pegado || ang < 1.15 || e.estado === 'combate') && seVe(e.x, e.z, JUG.x, JUG.z)) ve = true;
    }
    if (ve) {
      e.alerta = Math.min(1.2, e.alerta + dt * (e.estado === 'combate' ? 9 : 1.4 + 4 * (1 - dJ / T.vista)));
      if (e.alerta >= 1 && e.estado !== 'combate') { e.estado = 'combate'; e.tReaccion = T.reaccion * dif().reaccion * entre(0.8, 1.4); avisaGrupo(e); if (T.jefe) avisaJefe(e); play('alerta'); }
      e.visto = { x: JUG.x, z: JUG.z }; e.tVisto = 0;
    } else {
      e.tVisto += dt;
      if (e.estado === 'combate' && e.tVisto > 1.2) { e.estado = 'busca'; e.obj = e.visto ? { x: e.visto.x, z: e.visto.z } : null; }
      if (e.estado === 'busca' && e.tVisto > 9) { e.estado = 'ronda'; e.alerta = 0.2; e.obj = null; }
      if (e.estado === 'ronda') e.alerta = Math.max(0, e.alerta - dt * 0.2);
    }
    // la marca encima de la cabeza
    const marca = e.estado === 'combate' ? '!' : e.alerta > 0.25 || e.estado === 'busca' || e.estado === 'oye' ? '?' : null;
    e.marca.visible = !!marca; if (marca) { e.marca.material = MARCAS[marca]; e.marca.position.set(e.x, 2.3 * e.mod.escala / 1.5 + 1.2, e.z); }
    // qué hace
    let mx = 0, mz = 0, corre = 1;
    if (e.estado === 'combate' && JUG && JUG.vivo) {
      e.a = Math.atan2(JUG.x - e.x, JUG.z - e.z);
      if (T.salta) { lagSalta(e, dt, dJ); continue; }
      const huye = e.tipo === 'carronero' && e.vida < e.max * 0.3 && dJ < 9;
      const [cerca, lejosD] = T.dist;
      if (huye) { mx = -Math.sin(e.a); mz = -Math.cos(e.a); corre = 1.25; }
      else if (dJ > lejosD) { mx = Math.sin(e.a); mz = Math.cos(e.a); }
      else if (dJ < cerca) { mx = -Math.sin(e.a) * 0.7; mz = -Math.cos(e.a) * 0.7; }
      else { const lado = Math.sin(e.fase * 0.4) > 0 ? 1 : -1; mx = Math.cos(e.a) * lado * 0.6; mz = -Math.sin(e.a) * lado * 0.6; }
      if (ve) disparaEnemigo(e, dt, dJ);
    } else if (e.estado === 'busca' || e.estado === 'oye') {
      if (e.obj) { const d = lejos(e.x, e.z, e.obj.x, e.obj.z); if (d > 1) { e.a = Math.atan2(e.obj.x - e.x, e.obj.z - e.z); mx = Math.sin(e.a); mz = Math.cos(e.a); } else { e.obj = null; e.a += dt * 1.5; } }
      else e.a += dt * 1.2;
      if (e.estado === 'oye') { e.tPensar -= dt; if (e.tPensar <= 0) e.estado = 'ronda'; }
    } else {
      // la ronda: pasea cerca de su casa
      e.tPensar -= dt;
      if (!e.obj || e.tPensar <= 0) { const p = libreCerca(e.casa.x + entre(-9, 9), e.casa.z + entre(-9, 9), e.radio); e.obj = p; e.tPensar = entre(4, 9); }
      const d = lejos(e.x, e.z, e.obj.x, e.obj.z);
      if (d > 0.8) { const q = Math.atan2(e.obj.x - e.x, e.obj.z - e.z); e.a += giroA(e.a, q) * Math.min(1, dt * 4); mx = Math.sin(e.a) * 0.45; mz = Math.cos(e.a) * 0.45; }
    }
    mueveEnemigo(e, mx, mz, T.vel * corre * lento, dt);
  }
}
function mueveEnemigo(e, mx, mz, vel, dt) {
  if (e.desvio && e.tDesvio > 0) { e.tDesvio -= dt; mx = e.desvio.x; mz = e.desvio.z; }
  const quiere = Math.hypot(mx, mz) > 0.05;
  if (quiere) {
    const ax = e.x, az = e.z;
    mueve(e, mx * vel * dt, mz * vel * dt, e.radio);
    if (lejos(ax, az, e.x, e.z) < vel * dt * 0.3) { e.atasco += dt; if (e.atasco > 0.4) { const s = azar(0.5) ? 1 : -1; e.desvio = { x: mz * s, z: -mx * s }; e.tDesvio = entre(0.5, 1.1); e.atasco = 0; } }
    else e.atasco = 0;
    e.fase += dt * 9 * vel / 3;
  }
  e.mod.grupo.position.set(e.x, 0, e.z);
  e.mod.grupo.rotation.y += giroA(e.mod.grupo.rotation.y, e.a) * Math.min(1, dt * 12);
  animaPersonaje(e.mod, e.fase, quiere);
}
// disparar: espera a reaccionar, luego ráfagas con algo de error (peor si te mueves y si está lejos)
function disparaEnemigo(e, dt, d) {
  const T = e.T; if (!T.arma) return;
  if (e.tReaccion > 0) { e.tReaccion -= dt; return; }
  e.tDisparo -= dt; if (e.tDisparo > 0) return;
  if (d > T.alc + 2) return;
  if (e.quedan <= 0) e.quedan = T.rafaga;
  const mueveJ = JUG.moviendo ? 0.06 : 0, error = T.disp + mueveJ + d * 0.003;
  // apunta adonde vas a estar (más o menos)
  const t = d / T.balaVel, px = JUG.x + JUG.vx * t * 0.6, pz = JUG.z + JUG.vz * t * 0.6, a = Math.atan2(px - e.x, pz - e.z);
  for (let k = 0; k < T.perd; k++) bala({ x: e.x + Math.sin(a) * 0.8, z: e.z + Math.cos(a) * 0.8, a: a + entre(-error, error), dano: T.dano * dif().dano, vel: T.balaVel, alc: T.alc, quien: 'e', dueno: e });
  play(e.tipo === 'auditor' ? 'minigun' : 'enemigo');
  destello(e.x + Math.sin(a), 1.3, e.z + Math.cos(a), 0xffc060, 2, 0.08, 4);
  e.quedan--; e.tDisparo = e.quedan > 0 ? T.cadRafaga : T.cad * entre(0.8, 1.3);
}
// El Lag: va a saltos hacia ti, dejando trocitos bugueados; si te alcanza, te pega y te desincroniza
function lagSalta(e, dt, d) {
  e.salto -= dt; e.tDisparo -= dt;
  if (d < 1.6 && e.tDisparo <= 0) { golpeaJugador(e.T.dano * dif().dano, { x: e.x, z: e.z, lag: true }); JUG.lag = 4; play('lag'); e.tDisparo = 1.3; }
  if (e.salto <= 0 && d > 1.4) {
    const paso = Math.min(d - 1.2, entre(2.5, 4.5)), a = e.a + entre(-0.5, 0.5), nx = e.x + Math.sin(a) * paso, nz = e.z + Math.cos(a) * paso;
    for (let k = 0; k < 8; k++) particula(e.x, entre(0.5, 2.2), e.z, k % 2 ? 0x8a2bff : 0x39d5e8, entre(-2, 2), entre(0, 3), entre(-2, 2), 0.4, 2);
    if (!choca(nx, nz, e.radio)) { e.x = nx; e.z = nz; }
    e.salto = entre(0.9, 1.5); play('lag');
  }
  e.mod.grupo.position.set(e.x + (Math.random() < 0.1 ? entre(-0.2, 0.2) : 0), 0, e.z); e.mod.grupo.rotation.y = e.a;
  e.marca.position.set(e.x, 4.2, e.z);
}
// cuando uno te ve, los de su grupo también se enteran
function avisaGrupo(e) { if (!e.grupo) return; for (const o of ENEMIGOS) if (o.vivo && o.grupo === e.grupo && o !== e && o.estado !== 'combate') { o.estado = 'busca'; o.alerta = 0.8; o.obj = { x: JUG.x, z: JUG.z }; o.tVisto = 0; o.visto = { x: JUG.x, z: JUG.z }; } }
function avisaJefe(e) { avisa(tr('EL AUDITOR te ha visto. Que empiece la auditoría.'), 'jefe'); musica('boss'); }
// un ruido en (x, z) que se oye a «radio»: los que lo oyen vienen a mirar
function oyeRuido(x, z, radio) {
  for (const e of ENEMIGOS) {
    if (!e.vivo || e.estado === 'combate') continue;
    const d = lejos(x, z, e.x, e.z); if (d > radio) continue;
    e.estado = 'oye'; e.obj = { x: x + entre(-3, 3), z: z + entre(-3, 3) }; e.tPensar = 10; e.alerta = Math.max(e.alerta, 0.5);
  }
}

/* ---------- recibir daño y caer ---------- */
function golpeaEnemigo(e, dano, b) {
  if (!e.vivo || !(dano > 0)) return;
  if (e.tipo === 'lag' && !b.explosion && azar(0.25)) { avisa(tr('Impacto no registrado.'), 'raro'); chispas(e.x, 1.4, e.z, 0x39d5e8, 5); return; }
  // el escudo de Seguridad para casi todo lo que le llega de frente
  if (e.T.escudo && !b.explosion) { const de = Math.atan2(b.x - e.x, b.z - e.z); if (Math.abs(giroA(e.a, de)) < 0.9) { dano *= 0.25; play('metal'); chispas(e.x + Math.sin(e.a) * 0.7, 1.2, e.z + Math.cos(e.a) * 0.7, 0xffd27a, 3); } }
  if (b.hielo || (b.anom === 'hielo')) e.hielo = 2;
  e.vida -= dano; play('carne');
  for (let k = 0; k < 3; k++) particula(e.x, 1.2, e.z, e.tipo === 'lag' ? 0x8a2bff : e.tipo === 'carronero' ? 0xb8c0cc : 0x3a4660, entre(-2, 2), entre(1, 4), entre(-2, 2), 0.3);
  // si no te había visto, ahora sí sabe de dónde viene
  if (e.estado !== 'combate' && JUG && !(b.sigilo && e.vida <= 0)) { e.estado = 'combate'; e.alerta = 1; e.visto = { x: JUG.x, z: JUG.z }; e.tVisto = 0; e.tReaccion = 0.3; avisaGrupo(e); if (e.T.jefe) avisaJefe(e); }
  if (e.tipo === 'auditor' && !e.refuerzos && e.vida < e.max * 0.5) {
    e.refuerzos = true; avisa(tr('El Auditor llama a Recursos Humanos: llegan refuerzos.'), 'jefe');
    for (let i = 0; i < 2; i++) { const r = creaEnemigo('seguridad', e.x + entre(-6, 6), e.z - 6, { grupo: e.grupo }); r.estado = 'busca'; r.obj = { x: JUG.x, z: JUG.z }; r.alerta = 1; }
  }
  if (e.vida <= 0) muere(e);
}
function muere(e) {
  e.vivo = false; e.marca.visible = false;
  const g = e.mod.grupo; g.rotation.x = -Math.PI / 2; g.position.y = 0.35; g.rotation.y = e.a;
  if (e.tipo === 'lag') { MOTOR.escena.remove(g); for (let k = 0; k < 30; k++) particula(e.x, entre(0.5, 2.5), e.z, [0x8a2bff, 0x39d5e8, 0xff4b5c][k % 3], entre(-4, 4), entre(1, 6), entre(-4, 4), 0.9); play('raro'); }
  RAID.cuentas.bajas++; if (e.tipo === 'carronero') RAID.cuentas.carroneros++; if (e.tipo === 'auditor') { RAID.cuentas.auditor++; avisa(tr('El Auditor ha sido auditado.'), 'bien'); musica('ciber'); } if (e.tipo === 'lag') { RAID.cuentas.lag++; avisa(tr('El Lag se ha desconectado.'), 'bien'); }
  const c = contenedor('cadaver', e.x, e.z, { nombre: e.T.n, cosas: sorteaBotin(TABLAS_ENEMIGO[e.tipo]), t: 1.0 });
  // lo que llevaba en la mano a veces se queda (las armas de los enemigos no son de tu tamaño)
  if (e.tipo === 'carronero' && azar(0.3)) c.cosas.push({ id: 'm9', n: entero(8, 20) });
  // y a veces esconde algo mejor (el minijuego de rebuscar)
  if (e.tipo !== 'lag') ponEscondite(c, e.tipo, RAID.tuto);
  play('dolor');
}
