// Fans of Ratkov · EL JUGADOR: andar (el peso, el frío y tu animal cuentan), esquivar, apuntar, disparar con tu arma y sus piezas y
// anomalías, recargar con las balas de la mochila, cambiar de arma, lanzar zanahorias bomba, usar vendas y botiquines (tardan), sangrar,
// que el chaleco y el casco paren daño y se gasten, y el Lag, que te desincroniza los controles unos segundos.
'use strict';
let JUG = null;
function creaJugador(x, z, a) {
  const A = ANIMALES[SAVE.animal];
  const mod = montaPersonaje(SAVE.animal, true);
  JUG = { x, z, a, vx: 0, vz: 0, radio: 0.5, vivo: true, vida: A.vida + 10 * nivelMejora('enfermeria'), max: A.vida + 10 * nivelMejora('enfermeria'), frio: 0, sangra: false, prisa: 0, lag: 0, esquiva: 0, tEsquiva: 0, invul: 0,
    activa: RAID.eq.arma1 ? 'arma1' : 'arma2', tDisparo: 0, recarga: 0, cuelgue: 0, uso: null, combate: 0, moviendo: false, fase: 0, mod, sigilo: SAVE.animal === 'fox' ? 0.6 : 1,
    retroceso: 0, colaLag: [], historial: [], tiroSuelto: true, apuntaT: 0 };
  mod.grupo.position.set(x, 0, z); MOTOR.escena.add(mod.grupo);
  ponArma(mod, armaJ() ? armaJ().id : null);
  // la línea de apuntar
  const linea = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 1), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.55, depthWrite: false }));
  linea.geometry.translate(0, 0, 0.5); MOTOR.escena.add(linea); JUG.linea = linea;
}
function quitaJugador() { if (!JUG) return; MOTOR.escena.remove(JUG.mod.grupo); MOTOR.escena.remove(JUG.linea); JUG = null; }
const armaJ = () => (JUG ? RAID.eq[JUG.activa] : null);

function avanzaJugador(dt) {
  const J = JUG; if (!J || !J.vivo) return;
  const A = ANIMALES[SAVE.animal];
  // con el Lag encima, los controles llegan tarde y a trompicones
  let mx = ENT.mx, mz = ENT.mz;
  J.historial.push([mx, mz]); if (J.historial.length > 30) J.historial.shift();
  if (J.lag > 0) { J.lag -= dt; const h = J.historial[Math.max(0, J.historial.length - 1 - 14)]; mx = h[0]; mz = h[1]; if (Math.random() < 0.08) { mx = 0; mz = 0; } }
  // la velocidad: tu animal, el peso, el frío y lo que estés haciendo
  const peso = pesoEncima(RAID.eq, RAID.mochila, RAID.bolsillos, RAID.rinonera);
  let fPeso = 1; if (peso > PESO_LIBRE) fPeso = Math.max(0.5, 1 - (peso - PESO_LIBRE) / PESO_LIBRE * (SAVE.animal === 'squirrel' ? 0.3 : 0.6));
  const st = statsArma(armaJ());
  const fSigilo = avanzaSigilo(J, dt, mx, mz, peso);
  let vel = fSigilo * 5.2 * A.vel * fPeso * (J.prisa > 0 ? 1.25 : 1) * (J.frio > 80 ? 0.85 : 1) * (J.uso ? 0.5 : 1) * (st && st.lento && J.apuntaT > 0 ? st.lento : 1);
  J.esquiva -= dt; J.invul -= dt; J.prisa -= dt; J.combate -= dt; J.apuntaT -= dt;
  // esquivar: un salto rápido hacia donde vas
  if (pulsado('esquiva') && J.esquiva <= 0) {
    const m = Math.hypot(mx, mz); const dx = m > 0.1 ? mx / m : Math.sin(J.a), dz = m > 0.1 ? mz / m : Math.cos(J.a);
    J.tEsquiva = 0.22; J.dEsquiva = { x: dx, z: dz }; J.invul = 0.25; J.esquiva = (SAVE.animal === 'bunny' ? 2.5 : 5) * (peso > PESO_LIBRE ? 1 + Math.min(1.5, (peso - PESO_LIBRE) / PESO_LIBRE * 2) : 1); 
    play('esquiva'); J.uso = null; J.agacha = false; // con sobrepeso te cansas: tardas más en volver a esquivar
    for (let k = 0; k < 6; k++) particula(J.x, 0.3, J.z, 0xe8eef4, entre(-2, 2), entre(1, 3), entre(-2, 2), 0.4);
  }
  let dx = mx * vel * dt, dz = mz * vel * dt;
  if (J.tEsquiva > 0) { J.tEsquiva -= dt; dx = J.dEsquiva.x * 16 * dt; dz = J.dEsquiva.z * 16 * dt; }
  const ax = J.x, az = J.z; mueve(J, dx, dz, J.radio);
  J.vx = (J.x - ax) / Math.max(dt, 1e-4); J.vz = (J.z - az) / Math.max(dt, 1e-4); J.moviendo = Math.hypot(J.vx, J.vz) > 0.5;
  if (J.moviendo) J.fase += dt * 11;
  if (modoAuto()) apuntaSolo(J, st); else el('h-blanco').hidden = true;
  // hacia dónde mira: adonde apuntas o adonde vas
  if (J.corre) J.a = Math.atan2(mx, mz);   // corriendo miras adonde vas
  else if (ENT.apunta) J.a = Math.atan2(ENT.ax, ENT.az); else if (Math.hypot(mx, mz) > 0.2) J.a = Math.atan2(mx, mz);
  J.mod.grupo.position.set(J.x, 0, J.z); J.mod.grupo.rotation.y += giroA(J.mod.grupo.rotation.y, J.a) * Math.min(1, dt * 18);
  animaPersonaje(J.mod, J.fase, J.moviendo);
  J.linea.visible = !!(ENT.apunta && ENT.tactil); if (J.linea.visible) { J.linea.position.set(J.x, 1.1, J.z); J.linea.rotation.y = J.a; J.linea.scale.z = st ? Math.min(12, st.alc * 0.5) : 4; }
  // el arma: recargar, cambiar, disparar
  if (J.cuelgue > 0) J.cuelgue -= dt;
  if (J.recarga > 0) { J.recarga -= dt; if (J.recarga <= 0) terminaRecarga(); }
  if (pulsado('recarga')) empiezaRecarga();
  if (pulsado('cambia')) cambiaArma();
  if (pulsado('granada')) tiraGranada();
  for (let i = 0; i < 3; i++) if (pulsado('b' + (i + 1))) usaBolsillo(i);
  J.tDisparo -= dt; J.retroceso = Math.max(0, J.retroceso - dt * 2.5);
  avanzaGolpe(J);
  if (ENT.dispara && !J.corre) intentaDisparo(st); else J.tiroSuelto = true;
  // la cola de disparos con lag (la anomalía): salen medio segundo tarde
  for (let i = J.colaLag.length - 1; i >= 0; i--) { const c = J.colaLag[i]; c.t -= dt; if (c.t <= 0) { bala(Object.assign(c.b, { x: J.x + Math.sin(c.b.a) * 0.9, z: J.z + Math.cos(c.b.a) * 0.9 })); play('lag'); J.colaLag.splice(i, 1); } }
  // usar algo (venda, botiquín…): tarda y se corta si disparas o esquivas
  if (J.uso) { J.uso.t -= dt; if (J.uso.t <= 0) terminaUso(); }
  // sangrar, curarse sola (MeerCat) y el frío
  if (J.sangra) J.vida -= 0.9 * dt;
  if (SAVE.animal === 'meercat' && J.combate <= 0 && !J.sangra) J.vida = Math.min(J.max, J.vida + 0.7 * dt);
  const fuego = fuegoCerca(J.x, J.z), casco = RAID.eq.casco ? 0.7 : 1;
  if (fuego < RADIO_CALOR) J.frio = Math.max(0, J.frio - 4 * dt);
  else J.frio = Math.min(100, J.frio + (0.22 * dif().frio + RAID.ventisca * 3.8) * casco * (1 - 0.12 * nivelMejora('estufa')) * dt);
  if (J.frio >= 100) J.vida -= (2 + RAID.ventisca * 4) * dt;
  if (J.vida <= 0) muereJugador();
}

/* ---------- disparar ---------- */
function intentaDisparo(st) {
  const J = JUG, o = armaJ();
  if (!o || !st || J.recarga > 0 || J.tEsquiva > 0) return;
  if (J.tDisparo > 0) return;
  if (!st.auto && !J.tiroSuelto && !ENT.tactil && !ENT.mando) return;      // con ratón, semiautomática = un clic por tiro; con el dedo o el mando, se mantiene
  if (J.cuelgue > 0) { play('vacio'); return; }
  if (st.anom !== 'crack' && (o.bal || 0) <= 0) { play('vacio'); J.tiroSuelto = false; J.tDisparo = 0.3; empiezaRecarga(); return; }
  J.tiroSuelto = false; J.uso = null; J.combate = 4; J.apuntaT = 0.6; RAID.tapReg = null;
  J.tDisparo = st.cad;
  // el cargador crackeado: no gasta, pero a veces el arma «deja de responder» (y muy pocas veces revienta)
  if (st.anom === 'crack') {
    if (azar(0.004)) { avisa(tr('¡El cargador crackeado ha reventado!'), 'malo'); golpeaJugador(15, { x: J.x, z: J.z, explosion: true }); o.anom = null; o.efecto = null; ponArma(J.mod, o.id); chispas(J.x, 1.2, J.z, 0x8a2bff, 12); return; }
    if (azar(0.022)) { J.cuelgue = 2.5; avisa(tr('El arma no responde. ¿Esperar o cerrar?'), 'raro'); play('cuelgue'); return; }
  } else o.bal--;
  const frio = J.frio > 70 ? 1.5 : 1, disp = st.disp * (1 + J.retroceso * (st.retro || 1)) * frio * (J.moviendo ? 1.3 : 1) * (J.agacha ? 0.75 : 1);
  const lejosB = SAVE.animal === 'fox' ? 1.25 : 1;
  for (let k = 0; k < st.perd; k++) {
    const a = J.a + entre(-disp, disp);
    const b = { x: J.x + Math.sin(J.a) * 0.9, z: J.z + Math.cos(J.a) * 0.9, a, dano: st.dano, vel: st.vel, alc: st.alc, quien: 'j', anom: st.anom, lejosB };
    bala(b);
    if (st.anom === 'lag') J.colaLag.push({ t: 0.45, b: Object.assign({}, b, { a: a + entre(-0.03, 0.03) }) });
  }
  J.retroceso = Math.min(2.5, J.retroceso + (st.auto ? 0.28 : 0.6));
  play(st.ruido < 0.6 ? 'silencio' : st.son, 1);
  const bx = J.x + Math.sin(J.a) * 1.1, bz = J.z + Math.cos(J.a) * 1.1;
  destello(bx, 1.3, bz, 0xffc060, 2.6, 0.06, 5); chispas(bx, 1.2, bz, 0xffd27a, 2);
  oyeRuido(J.x, J.z, 30 * st.ruido);
  if (st.perd > 3) temblor(0.12);
}
// el daño lejano de SlyFox: se aplica al dar (golpeaEnemigo no sabe de animales)
const _golpeaEnemigo = golpeaEnemigo;
golpeaEnemigo = function (e, dano, b) { if (b && b.lejosB > 1 && JUG && lejos(JUG.x, JUG.z, e.x, e.z) > 12) dano *= b.lejosB; return _golpeaEnemigo(e, dano, b); };

/* ---------- recargar y cambiar de arma ---------- */
function balasDisponibles(cal) { return cuantos(RAID.mochila, cal) + cuantos(RAID.bolsillos, cal); }
function empiezaRecarga() {
  const J = JUG, o = armaJ(), st = statsArma(o); if (!o || !st || J.recarga > 0 || st.anom === 'crack') return;
  if ((o.bal || 0) >= st.carg) return;
  if (balasDisponibles(st.cal) <= 0) { avisa(trf('No te quedan %1.', nombreDe(st.cal).toLowerCase()), 'malo'); play('vacio'); return; }
  J.recarga = st.rec; play('recarga'); J.uso = null;
}
function terminaRecarga() {
  const o = armaJ(), st = statsArma(o); if (!o) return;
  const falta = st.carg - (o.bal || 0);
  let q = quitar(RAID.mochila, st.cal, falta); if (q < falta) q += quitar(RAID.bolsillos, st.cal, falta - q);
  o.bal = (o.bal || 0) + q; compacta(RAID.mochila);
}
function cambiaArma() {
  const J = JUG, otra = J.activa === 'arma1' ? 'arma2' : 'arma1';
  if (!RAID.eq[otra]) { avisa(tr('No llevas otra arma.'), 'malo'); return; }
  J.activa = otra; J.recarga = 0; J.tDisparo = 0.35; ponArma(J.mod, RAID.eq[otra].id); play('select');
}
function tiraGranada() {
  const J = JUG;
  let q = quitar(RAID.bolsillos, 'granada', 1); if (!q) q = quitar(RAID.mochila, 'granada', 1);
  if (!q) { avisa(tr('No llevas zanahorias bomba.'), 'malo'); return; }
  compacta(RAID.mochila);
  const d = ENT.distRaton ? Math.min(15, ENT.distRaton) : 9;
  lanzaGranada(J.x + Math.sin(J.a) * 0.8, J.z + Math.cos(J.a) * 0.8, J.a, d * 0.95, 'j'); J.combate = 4;
}

/* ---------- usar cosas ---------- */
function usaBolsillo(i) { const o = RAID.bolsillos[i]; if (o) usaObjeto(RAID.bolsillos, i); }
function usaObjeto(lista, i) {
  const o = lista[i]; if (!o) return false;
  const D = OBJ[o.id];
  if (D.t === 'granada') { tiraGranada(); return true; }
  if (D.t !== 'med' || !D.usa) return false;
  if (JUG.uso) return false;
  JUG.uso = { t: D.usa.t, max: D.usa.t, id: o.id, lista, i, o };
  play(o.id === 'te' ? 'bebe' : 'registra'); return true;
}
function terminaUso() {
  const J = JUG, u = J.uso; J.uso = null; if (!u) return;
  const o = u.o; if (!o || o.id !== u.id || u.lista.indexOf(o) < 0) return;
  const ef = OBJ[u.id].usa, k = SAVE.animal === 'meercat' ? 1.5 : 1;
  if (ef.vida) J.vida = Math.min(J.max, J.vida + ef.vida * k);
  if (ef.sangra) J.sangra = false;
  if (ef.frio) J.frio = Math.max(0, J.frio - ef.frio);
  if (ef.prisa) J.prisa = ef.prisa;
  o.n--; if (o.n <= 0) u.lista[u.lista.indexOf(o)] = null; if (u.lista !== RAID.bolsillos) compacta(u.lista);
  play(u.id === 'te' ? 'bebe' : 'cura'); avisa(trf('Has usado: %1.', nombreDe(u.id)), 'bien');
}

/* ---------- recibir daño ---------- */
function golpeaJugador(dano, b) {
  const J = JUG; if (!J || !J.vivo || !(dano > 0)) return;
  if (J.invul > 0 && !b.explosion) return;
  // el chaleco y el casco paran parte y se gastan
  let resto = dano;
  for (const k of ['chaleco', 'casco']) {
    const p = RAID.eq[k]; if (!p || !(p.dur > 0)) continue;
    const para = resto * OBJ[p.id].arm; resto -= para; p.dur = Math.max(0, p.dur - para * 0.9);
    if (p.dur <= 0) avisa(trf('Tu %1 se ha roto.', nombreDe(p.id).toLowerCase()), 'malo');
  }
  J.vida -= resto; J.combate = 4; J.uso = null;
  if (!b.explosion && !b.lag && resto > 5 && azar(0.18) && !J.sangra) { J.sangra = true; avisa(tr('Estás sangrando: usa una venda.'), 'malo'); }
  RAID.dano = Math.min(1, RAID.dano + resto / 40); play('dolor'); vibra(Math.min(120, 30 + resto * 3)); temblor(Math.min(0.3, resto / 60));
  for (let k = 0; k < 3; k++) particula(J.x, 1.2, J.z, 0xd8303a, entre(-2, 2), entre(1, 3), entre(-2, 2), 0.3);
  // si no ves a quien te da, al menos sabes de dónde viene
  if (b && b.x != null) RAID.deDonde = { a: Math.atan2(b.x - J.x, b.z - J.z), t: 1.2 };
  if (J.vida <= 0) muereJugador();
}
function muereJugador() {
  const J = JUG; if (!J.vivo) return;
  J.vivo = false; J.vida = 0; J.mod.grupo.rotation.x = -Math.PI / 2; J.mod.grupo.position.y = 0.35; J.linea.visible = false;
  play('lose'); terminaIncursion(false);
}
