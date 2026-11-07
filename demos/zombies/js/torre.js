// Fans of Zombies · LA TORRE DE MICROBLIZZ (dominio): subir y bajar de planta por las escaleras (e.planta: 0 = la calle, 1 a 10 las
// oficinas, 11 la azotea). La primera vez que entras en una planta se llena de fans (más y peores cuanto más arriba); en la azotea espera
// EL CEO con su escolta. El CEO llama a sus bots al bajar de vida y embiste. Si cae, deja su maletín (buen botín) y la partida SIGUE
// (decisión de Daniel: se juega hasta morir); queda apuntado en e.jefeCaido y sale en el cartel de muerte.
// El mundo da los sitios libres de cada planta (mundo.puntoPlanta(n, azar)).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.AZOTEA = (AJ) => AJ.torre.plantas + 1;
  // los pesos de cada tipo en la planta n (más ejecutivos arriba)
  Z.repartoPlanta = function (AJ, n) {
    const R = Object.assign({}, AJ.torre.reparto), A = AJ.torre.arriba;
    for (const k in A) R[k] = (R[k] || 0) + A[k] * n;
    return R;
  };
  // ir a la planta n, a la posición pos (la escalera de llegada)
  Z.cambiaPlanta = function (AJ, e, n, pos, mundo, azar) {
    if (n < 0 || n > Z.AZOTEA(AJ)) return Z.error('sinPlanta', { n });
    const J = e.jugador, T = e.torre || (e.torre = { visitadas: {} });
    J.x = pos.x; J.z = pos.z; J.registra = J.clava = J.desmonta = null; e.planta = n;
    if (n > 0 && !T.visitadas[n]) { T.visitadas[n] = true; pueblaPlanta(AJ, e, n, mundo, azar); }
    e.eventos.push({ tipo: 'planta', n });
    return Z.ok(n);
  };
  function pueblaPlanta(AJ, e, n, mundo, azar) {
    const T = AJ.torre;
    if (n === Z.AZOTEA(AJ)) {
      const p = mundo.puntoPlanta(n, azar), ceo = Z.nuevoZombi(AJ, e, 'ceo', p.x, p.z, azar).valor;
      ceo.planta = n; ceo.umbral = 0; ceo.tEmbiste = T.jefe.cadaEmbiste;
      for (let i = 0; i < T.jefe.escolta; i++) { const q = mundo.puntoPlanta(n, azar); Z.nuevoZombi(AJ, e, 'bot', q.x, q.z, azar).valor.planta = n; }
      return;
    }
    const cuantos = T.base + Math.round(T.crece * n), R = Z.repartoPlanta(AJ, n);
    for (let i = 0; i < cuantos; i++) { const q = mundo.puntoPlanta(n, azar); Z.nuevoZombi(AJ, e, Z.sortea(R, azar), q.x, q.z, azar).valor.planta = n; }
  }
  // lo que hace el jefe cada fotograma (además de lo normal): refuerzos al bajar de cada umbral y embestidas. Devuelve true si embiste
  Z.pasoJefe = function (AJ, e, zb, dt, mundo, azar) {
    const J = AJ.torre.jefe, u = J.umbrales[zb.umbral];
    if (u != null && zb.vida < zb.T.vida * u) {
      zb.umbral++;
      for (let i = 0; i < J.refuerzos; i++) { const q = mundo.puntoPlanta(e.planta, azar); const b = Z.nuevoZombi(AJ, e, 'bot', q.x, q.z, azar).valor; b.planta = e.planta; b.estado = 'persigue'; b.olvida = 99; }
      e.eventos.push({ tipo: 'refuerzos', n: J.refuerzos });
    }
    if (zb.estado !== 'persigue') return false;
    if (zb.embiste > 0) {
      zb.embiste -= dt;
      const a = zb.a; mundo.mueve(zb, Math.sin(a) * J.vel * dt, Math.cos(a) * J.vel * dt, zb.T.radio);
      return true;
    }
    if ((zb.tEmbiste -= dt) <= 0) {
      zb.tEmbiste = J.cadaEmbiste; zb.embiste = J.dura;
      zb.a = Math.atan2(e.jugador.x - zb.x, e.jugador.z - zb.z);
      e.eventos.push({ tipo: 'embiste' });
      return true;
    }
    return false;
  };
  // el CEO ha caído: deja su maletín para registrar y se apunta (la partida sigue)
  Z.jefeVencido = function (e, zb) {
    if (e.jefeCaido) return;
    e.jefeCaido = { min: e.min - e.inicio };
    e.cuerpos.push({ id: 'maletin-' + zb.id, x: zb.x, z: zb.z, tipo: 'maletin' });
    e.eventos.push({ tipo: 'jefeCaido' });
  };
})(ZOM);
