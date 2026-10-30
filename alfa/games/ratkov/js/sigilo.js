// Fans of Ratkov · CORRER, AGACHARSE Y DESPEDIR. Correr (Mayús, o el dedo más allá del aro de la palanca) va más rápido, gasta AGUANTE
// (más con sobrepeso), hace ruido, calienta un poco y no deja disparar. Agacharse (C, o el botón AGACHARSE) va a media velocidad, los
// enemigos te ven a la mitad de distancia y no haces ruido. Con F (o el botón grande): agachado y por la espalda de alguien que no te ha
// visto, lo DESPIDES de un golpe y sin ruido (a los jefes solo les quita mucha vida). Para despedir hace falta llevar un ABRECARTAS
// (bolsillos, mochila o riñonera), que se mella con cada despido. Si no, das un culatazo que empuja y aturde (eso es gratis).
'use strict';
// lo especial de cada animal con esto: CrazyBunny patea (aturde el doble), MadSquirrel gasta la mitad de aguante, SlyFox despide sin
// agacharse y su abrecartas se mella la mitad, JunkCoon (en js/minijuegos.js) necesita un acierto menos en las cerraduras y rebusca
// más rápido, y MeerCat recupera el aguante el doble de rápido
const esAnimal = id => SAVE.animal === id;
const SIGILO = {
  velCorre: 1.55, velAgacha: 0.5,     // lo que multiplica la velocidad
  gastoCorre: 1 / 5.5,                 // aguante por segundo corriendo (se vacía en 5,5 s)
  recupera: 1 / 4, recuperaAndando: 1 / 7,
  ruidoCorre: 10,                      // a cuántos metros te oyen correr
  vistaAgacha: 0.5,                    // los enemigos te ven a esta parte de la distancia
  alcanceGolpe: 1.8, danoCulatazo: 16, danoPunetazo: 9, empuje: 1.3, aturde: 0.9, esperaGolpe: 0.75,
  danoJefe: 0.3,                       // a los jefes, por la espalda: esta parte de su vida
};
// cada fotograma, antes de mover al jugador: decide si corre, si está agachado y lo que eso cambia. Devuelve el multiplicador de velocidad
function avanzaSigilo(J, dt, mx, mz, peso) {
  if (J.aguante == null) { J.aguante = 1; J.agacha = false; J.corre = false; J.agotado = false; J.tRuido = 0; J.tGolpe = 0; J.alto = 1; }
  J.tGolpe -= dt;
  if (pulsado('agacha')) { J.agacha = !J.agacha; play('select'); }
  const anda = Math.hypot(mx, mz) > 0.2;
  // correr: hace falta aguante (si se vacía, hasta que recuperes un tercio no vuelves a correr)
  if (J.agotado && J.aguante > 0.33) J.agotado = false;
  const quiere = ENT.corre && anda && !J.uso && J.tEsquiva <= 0;
  J.corre = quiere && !J.agotado && J.aguante > 0;
  if (J.corre) {
    if (J.agacha) J.agacha = false;   // correr te levanta
    const extra = peso > PESO_LIBRE ? 1 + Math.min(1.5, (peso - PESO_LIBRE) / PESO_LIBRE * 2) : 1;
    J.aguante = Math.max(0, J.aguante - SIGILO.gastoCorre * extra * (esAnimal('squirrel') ? 0.5 : 1) / (1 + 0.15 * nivelMejora('gimnasio')) * dt);
    if (J.aguante <= 0) { J.agotado = true; avisa(tr('Sin aliento. Microblizz no paga el gimnasio.'), 'malo'); }
    J.tRuido -= dt; if (J.tRuido <= 0) { J.tRuido = 0.45; oyeRuido(J.x, J.z, SIGILO.ruidoCorre); }
    J.frio = Math.max(0, J.frio - 0.7 * dt);   // correr calienta un poco
    if (J.recarga > 0) J.recarga = 0;          // no se puede recargar corriendo
  } else J.aguante = Math.min(1, J.aguante + (anda ? SIGILO.recuperaAndando : SIGILO.recupera) * (esAnimal('meercat') ? 2 : 1) * dt);
  // el cuerpo: más bajito si vas agachado
  const alto = J.agacha ? 0.72 : 1; J.alto += (alto - J.alto) * Math.min(1, dt * 12);
  J.mod.grupo.scale.y = J.alto;
  return J.corre ? SIGILO.velCorre : J.agacha ? SIGILO.velAgacha : 1;
}
// cuánto te ve un enemigo: lo del animal, por si vas agachado
const vistaJugador = J => (J.sigilo || 1) * (J.agacha ? SIGILO.vistaAgacha : 1);

/* ---------- el golpe ---------- */
// ¿a quién golpearías? El enemigo vivo más cercano a tu alcance y por delante de ti (o pegado a ti)
function blancoGolpe(J) {
  let mejor = null, dMin = SIGILO.alcanceGolpe;
  for (const e of ENEMIGOS) {
    if (!e.vivo) continue; const d = lejos(J.x, J.z, e.x, e.z); if (d > dMin + e.radio) continue;
    const delante = Math.abs(giroA(J.a, Math.atan2(e.x - J.x, e.z - J.z))) < 1.1;
    if (delante || d < 1) { dMin = d - e.radio; mejor = e; }
  }
  return mejor;
}
// ¿estás a su espalda y no te ha visto? (el ángulo entre hacia dónde mira él y dónde estás tú)
function porLaEspalda(J, e) {
  if (e.estado === 'combate' || e.alerta >= 1) return false;
  return Math.abs(giroA(e.a, Math.atan2(J.x - e.x, J.z - e.z))) > 1.9;
}
// cada fotograma: busca a quién despedirías (para el botón y el aviso) y da el golpe si lo pides
const LISTAS_J = () => [RAID.bolsillos, RAID.mochila, RAID.rinonera];
const abrecartas = () => { for (const li of LISTAS_J()) { const o = li.find(o => o && o.id === 'abrecartas'); if (o) return o; } return null; };
// cada despido mella el abrecartas; con la última mella se rompe y desaparece
function gastaAbrecartas() {
  const o = abrecartas(); if (!o) return;
  o.dur = (o.dur || 1) - (esAnimal('fox') ? 0.5 : 1);
  if (o.dur <= 0) { for (const li of LISTAS_J()) { const k = li.indexOf(o); if (k < 0) continue; if (li === RAID.bolsillos) li[k] = null; else li.splice(k, 1); } avisa(tr('El abrecartas se ha roto. Toca comprar otro.'), 'malo'); }
}
function avanzaGolpe(J) {
  const e = J.tGolpe > 0 ? null : blancoGolpe(J);
  const espalda = e && (J.agacha || esAnimal('fox')) && porLaEspalda(J, e);
  J.blancoDespide = espalda && abrecartas() ? e : null;
  J.sinAbrecartas = espalda && !J.blancoDespide ? e : null;   // podrías, pero no llevas con qué
  if (!pulsado('despide') || J.tGolpe > 0 || J.tEsquiva > 0 || J.uso) return;
  J.tGolpe = SIGILO.esperaGolpe; J.corre = false;
  const o = armaJ();
  // un pasito hacia delante y el golpe
  mueve(J, Math.sin(J.a) * 0.35, Math.cos(J.a) * 0.35, J.radio);
  if (!e) { play('esquiva'); return; }
  const b = { x: J.x, z: J.z, melee: true };
  if (J.blancoDespide === e) {
    // DESPEDIR: por la espalda y sin que te vea
    const jefe = e.T.jefe || e.tipo === 'lag';
    const dano = jefe ? e.max * SIGILO.danoJefe : e.vida + 999;
    golpeaEnemigo(e, dano, Object.assign(b, { sigilo: !jefe, explosion: e.tipo === 'lag' }));
    gastaAbrecartas(); vibra([40, 30, 80]);
    if (!e.vivo) { avisa(tr(pick(FRASES_DESPIDO)), 'bien'); RAID.cuentas.despidos = (RAID.cuentas.despidos || 0) + 1; }
    else avisa(tr('Es un jefe: no se deja despedir así como así.'), 'malo');
    temblor(0.15); for (let k = 0; k < 8; k++) particula(e.x, 1.1, e.z, 0xf9c531, entre(-2, 2), entre(1, 3), entre(-2, 2), 0.4);
    J.blancoDespide = null; return;
  }
  // el culatazo (o el puñetazo, sin arma): poco daño, lo empuja y lo deja aturdido un momento
  golpeaEnemigo(e, o ? SIGILO.danoCulatazo : SIGILO.danoPunetazo, b);
  if (e.vivo) {
    const a = Math.atan2(e.x - J.x, e.z - J.z);
    mueve(e, Math.sin(a) * SIGILO.empuje, Math.cos(a) * SIGILO.empuje, e.radio);
    const at = SIGILO.aturde * (esAnimal('bunny') ? 2 : 1);   // la patada de CrazyBunny
    e.aturdido = at; e.tDisparo = Math.max(e.tDisparo || 0, at);
  }
  play('metal'); temblor(0.08); oyeRuido(J.x, J.z, 6);
}
const FRASES_DESPIDO = ['Despido por la espalda. Recursos Humanos lo aprueba.', 'Despedido. Ni carta de despido ni finiquito.', 'Reestructuración de plantilla completada.', 'Ha pasado a «buscar nuevos retos profesionales».'];
