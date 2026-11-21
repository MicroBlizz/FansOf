// Fans of Pinball · dominio · GOLPES: qué pasa cuando la bola (o una explosión) da a algo: el daño (10 y +2 por nivel de la criatura,
// Bola gorda, doble con golpe fuerte, crítico, triple con la emboscada del zorro), el casco del becario, las cajas y el núcleo del jefe,
// los premios (puntos, fichas, CAOS, tiempo) y la barra de sala. Las dianas (setas en el código) no tienen vida: dan puntos, combo y, con
// Dianas locas, chispas. Las máquinas de café y los rebotadores son decorado fijo: premian como mucho una vez cada `esperaGolpeFijo` s
// (apoyarse no da nada) y se encienden un momento (luz, para la pantalla).
'use strict';
PB.golpes = (() => {
  const SIN = { fuerte: false, critico: false };
  // el daño de un golpe de la bola `b` que va a velocidad `v`: { dano, fuerte, critico }
  function dano(s, b, v) {
    const fuerte = v >= s.r.fisica.golpeFuerte;
    let d = (b.cif.dano + s.cif.dano) * (fuerte ? s.r.puntos.fuerte : 1);
    const critico = s.cif.critico > 0 && s.az.pasa(s.cif.critico);
    if (critico) d *= s.cif.criticoX;
    if (b.oculta) d *= b.cif.multiplicador;
    return { dano: d, fuerte, critico };
  }
  const golpeEv = (s, o, d, g) => PB.emite(s, 'golpe', { x: o.x, y: o.y, objetivo: o.tipo, dano: d, fuerte: g.fuerte, critico: g.critico });
  function rompible(s, o, d, g) {
    o.vida -= d; golpeEv(s, o, d, g);
    if (o.vida > 0) return false;
    o.vivo = false;
    const p = PB.marcador.premia(s, s.r.puntos.cosas[o.tipo]);
    PB.emite(s, 'rompe', { x: o.x, y: o.y, clase: o.tipo, ...p });
    if (o.tipo === 'cofre') {
      const segundos = s.r.reloj.cofre + s.cif.segCofre;
      PB.marcador.sumaTiempo(s, segundos);
      PB.emite(s, 'cofre', { x: o.x, y: o.y, fichas: p.fichas, segundos });
    }
    PB.marcador.cuentaSala(s);
    return true;
  }
  // el casco se lleva el daño primero; el golpe fuerte lo quita de una vez
  function casco(s, o, d, g) {
    o.casco = g.fuerte ? 0 : Math.max(0, o.casco - d);
    golpeEv(s, o, d, g);
    return false;
  }
  function enemigo(s, o, d, g) {
    if (o.casco > 0) return casco(s, o, d, g);
    o.vida -= d; golpeEv(s, o, d, g);
    if (o.vida > 0) return false;
    o.vivo = false;
    const p = PB.marcador.premia(s, s.r.puntos.cosas[o.tipo]), segundos = s.r.reloj.enemigo + s.cif.segEnemigo;
    PB.marcador.sumaTiempo(s, segundos);
    PB.emite(s, 'enemigo_vencido', { x: o.x, y: o.y, clase: o.tipo, segundos, ...p });
    if (!o.llamado) PB.marcador.cuentaSala(s);
    return true;
  }
  function caja(s, o, d, g) {
    o.vida -= d; golpeEv(s, o, d, g);
    if (o.vida > 0) return false;
    o.vivo = false;
    PB.emite(s, 'rompe', { x: o.x, y: o.y, clase: 'caja', ...PB.marcador.premia(s, s.r.puntos.cosas.caja) });
    PB.jefe.cajaRota(s);
    return true;
  }
  // solo el núcleo abierto le quita vida; con él cerrado el golpe rebota sin daño
  function jefe(s, o, d, g) {
    if (o.nucleo <= 0) { golpeEv(s, o, 0, g); return false; }
    o.vida = Math.max(0, o.vida - d);
    PB.emite(s, 'jefe_golpe', { x: o.x, y: o.y, dano: d, vida: o.vida, vidaMax: o.vidaMax });
    return PB.jefe.herido(s);
  }
  const APLICA = { vasija: rompible, cofre: rompible, caja, jefe };
  // aplica `d` de daño a la cosa `o`; devuelve si la ha roto o vencido
  const aplica = (s, o, d, g = SIN) => (o.vivo ? (APLICA[o.tipo] || enemigo)(s, o, d, g) : false);
  // la bola `b` golpea la cosa `o` a velocidad `v`: devuelve si la atraviesa (la rompió y lleva Perforante)
  function toca(s, b, o, v) {
    const g = dano(s, b, v), emboscada = b.oculta;
    PB.marcador.golpe(s);
    b.sinTocar = 0; b.desdeToque = 0; b.oculta = false;
    const murio = aplica(s, o, g.dano, g);
    PB.poderes.alGolpear(s, b, o, g, murio, emboscada);
    return murio && s.cif.perforante;
  }
  // todo lo que tiene vida, para explosiones y chispas
  function blancos(s) {
    const j = s.sala.jefe, lista = s.sala.rompibles.concat(s.sala.enemigos);
    return j ? lista.concat(j.cajas, j) : lista;
  }
  function explota(s, x, y, radio, d, origen) {
    PB.emite(s, 'explosion', { x, y, radio, dano: d, origen });
    for (const o of blancos(s)) if (o.vivo && Math.hypot(o.x - x, o.y - y) < radio + o.r) aplica(s, o, d);
  }
  // Setas locas: chispas a las cosas más cercanas
  function chispas(s, x, y) {
    const m = s.cif.setasLocas, cerca = blancos(s).filter(o => o.vivo).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    for (const o of cerca.slice(0, m.chispas)) aplica(s, o, m.dano);
  }
  function seta(s, b, o) {
    const locas = s.cif.setasLocas;
    PB.marcador.golpe(s, 1 + (locas ? locas.combo : 0));
    b.sinTocar = 0; b.desdeToque = 0;
    const p = PB.marcador.premia(s, s.r.puntos.cosas.seta);
    PB.emite(s, 'seta', { x: o.x, y: o.y, puntos: p.puntos });
    if (locas) chispas(s, o.x, o.y);
  }
  const LUZ = 0.25;   // segundos que se ve encendida una máquina o un rebotador
  // un golpe a una pieza fija (máquina o rebotador, estado { luz, espera }): devuelve si cuenta (no está esperando)
  function fijo(s, b, o) {
    if (o.espera > 0) return false;
    o.espera = s.r.fisica.esperaGolpeFijo; o.luz = LUZ;
    b.sinTocar = 0; b.desdeToque = 0;
    return true;
  }
  // la máquina de café: rebota fuerte, suelta fichas y llena el CAOS (con Dianas locas, también chispas)
  function maquina(s, b, o) {
    if (!fijo(s, b, o)) return;
    const locas = s.cif.setasLocas;
    PB.marcador.golpe(s, 1 + (locas ? locas.combo : 0));
    const p = PB.marcador.premia(s, s.r.puntos.cosas.maquina);
    PB.emite(s, 'maquina', { x: o.x, y: o.y, id: o.id, puntos: p.puntos, fichas: p.fichas });
    if (locas) chispas(s, o.x, o.y);
  }
  // la patada de un rebotador (p: su pared, con el índice i del rebotador)
  function rebotador(s, b, p) {
    const o = s.sala.rebotadores[p.i];
    if (!fijo(s, b, o)) return;
    PB.marcador.golpe(s);
    const pr = PB.marcador.premia(s, s.r.puntos.cosas.rebotador);
    PB.emite(s, 'rebotador', { x: b.x, y: b.y, lado: o.lado, puntos: pr.puntos });
  }
  // las luces y esperas de las piezas fijas bajan con el tiempo
  function enfriaFijos(s, dt) {
    for (const o of s.sala.maquinas) { o.luz = Math.max(0, o.luz - dt); o.espera = Math.max(0, o.espera - dt); }
    for (const o of s.sala.rebotadores) { o.luz = Math.max(0, o.luz - dt); o.espera = Math.max(0, o.espera - dt); }
  }
  // la bola rompe en el aire un proyectil (cubito del jefe o café)
  function proyectil(s, o) {
    o.vivo = false;
    PB.emite(s, 'rompe', { x: o.x, y: o.y, clase: o.tipo, ...PB.marcador.premia(s, s.r.puntos.cosas[o.tipo]) });
  }
  return { dano, aplica, toca, explota, seta, maquina, rebotador, enfriaFijos, proyectil };
})();
