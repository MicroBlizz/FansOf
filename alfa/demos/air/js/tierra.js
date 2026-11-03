// Fans of Air · La tierra (dominio): la fase de ataque a la base de Microblizz en vista cenital. El mapa baja (tú avanzas) y
// el caza vuela libre por la pantalla; ametralladora hacia arriba y bombas que caen un poco por delante y estallan al rato.
// Oficinas y servidores no se defienden; torretas, tanques y la Torre del CEO disparan hacia donde estás. El avance se para
// al llegar a la Torre, el objetivo final: destruirla cumple la misión.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const T = A.tierra = {};

  T.nueva = function (AJ) {
    const objetivos = AJ.tierra.mapa.map((o, i) => ({ id: i + 1, tipo: o.tipo, x: o.x, y: o.y, vida: AJ.tierra.objetivos[o.tipo].vida,
      disparaT: 1 + (i % 3) * 0.5, dir: i % 2 ? 1 : -1 }));
    return { jugador: { x: 640, y: 520, vx: 0, vy: 0 }, avance: 0, objetivos, balas: [], bombas: [], tiros: [], fuegoT: 0, parado: false,
      especialAntes: false, fin: false, finT: 0 };
  };

  // Lo del suelo vive en «avance» (píxeles recorridos desde el principio); en pantalla baja según se avanza.
  T.pantallaY = (t, alto, y) => t.avance + alto - y;
  T.mundoY = (t, alto, sy) => t.avance + alto - sy;
  T.enPantalla = (t, alto, ob) => { const sy = T.pantallaY(t, alto, ob.y); return sy > -80 && sy < alto + 80; };

  T.paso = function (e, dt, o, rnd) {
    const t = e.tierra;
    if (t.fin) { t.finT -= dt; if (t.finT <= 0) A.terminar(e, 'cumplida'); return; }
    avanzar(e, t, dt);
    moverJugador(e, t, dt, o);
    armas(e, t, dt, o);
    for (const ob of t.objetivos) objetivo(e, t, ob, dt, rnd);
    balas(e, t, dt);
    bombas(e, t, dt);
    tiros(e, t, dt);
  };

  function quitar(lista, x) { const i = lista.indexOf(x); if (i >= 0) lista.splice(i, 1); }

  function avanzar(e, t, dt) {
    const AJ = e.aj.tierra, torre = t.objetivos.find((ob) => AJ.objetivos[ob.tipo].final);
    if (t.parado) return;
    t.avance += AJ.scroll * dt;
    if (torre && T.pantallaY(t, AJ.alto, torre.y) >= 230) { t.avance = torre.y - AJ.alto + 230; t.parado = true; e.eventos.push({ tipo: 'torre' }); }
  }

  function moverJugador(e, t, dt, o) {
    const j = t.jugador, AJ = e.aj.tierra, V = AJ.velBase * e.caza.vel;
    j.vx = A.util.acerca(j.vx, (o.mx || 0) * V, 8, dt);
    j.vy = A.util.acerca(j.vy, (o.my || 0) * V, 8, dt);
    j.x = A.util.limita(j.x + j.vx * dt, 40, AJ.ancho - 40);
    j.y = A.util.limita(j.y + j.vy * dt, 170, AJ.alto - 60);   // 170: por debajo del HUD
  }

  function armas(e, t, dt, o) {
    const j = t.jugador, B = e.aj.tierra.bala;
    t.fuegoT -= dt;
    if (o.fuego && t.fuegoT <= 0) {
      t.balas.push({ x: j.x, y: j.y - 30 });
      t.fuegoT = B.cada / (1 + e.caza.rabia * e.combo); e.disparos++;
      e.eventos.push({ tipo: 'disparo' });
    }
    const pulsa = o.especial && !t.especialAntes;
    t.especialAntes = !!o.especial;
    if (pulsa) soltarBomba(e, t);
  }

  // La bomba cae donde marca el punto de mira (por delante del caza); como es del suelo, baja con el mapa hasta estallar.
  function soltarBomba(e, t) {
    if (e.bombas <= 0) { e.eventos.push({ tipo: 'sinBombas' }); return; }
    const j = t.jugador, AJ = e.aj.tierra;
    e.bombas--;
    t.bombas.push({ x: j.x, y: T.mundoY(t, AJ.alto, j.y - AJ.bomba.delante), t: AJ.bomba.cae });
    e.eventos.push({ tipo: 'bomba' });
  }

  function objetivo(e, t, ob, dt, rnd) {
    const AJ = e.aj.tierra, d = AJ.objetivos[ob.tipo];
    if (d.mueve) { ob.x += ob.dir * d.mueve * dt; if (ob.x < 60 || ob.x > AJ.ancho - 60) { ob.dir = -ob.dir; ob.x = A.util.limita(ob.x, 60, AJ.ancho - 60); } }
    if (!d.dispara || !T.enPantalla(t, AJ.alto, ob)) return;
    ob.disparaT -= dt;
    if (ob.disparaT > 0) return;
    ob.disparaT = d.dispara / e.caza.sigilo * (0.8 + rnd() * 0.4);
    const sy = T.pantallaY(t, AJ.alto, ob.y), n = d.final ? 3 : 1;
    for (let k = 0; k < n; k++) dispara(e, t, { x: ob.x, y: sy }, (k - (n - 1) / 2) * 0.35);
  }

  // Un tiro desde el suelo hacia donde está el caza (con `desvio` radianes para las ráfagas en abanico).
  function dispara(e, t, desde, desvio) {
    const j = t.jugador, V = e.aj.tierra.tiro.vel, ang = Math.atan2(j.y - desde.y, j.x - desde.x) + desvio;
    t.tiros.push({ x: desde.x, y: desde.y, vx: Math.cos(ang) * V, vy: Math.sin(ang) * V });
    e.eventos.push({ tipo: 'tiroEnemigo', clase: 'suelo' });
  }

  function blanco(e, t, p, radio) {
    const AJ = e.aj.tierra;
    return t.objetivos.find((ob) => T.enPantalla(t, AJ.alto, ob) && Math.hypot(ob.x - p.x, T.pantallaY(t, AJ.alto, ob.y) - p.y) < radio + AJ.objetivos[ob.tipo].radio * 0.7) || null;
  }

  function balas(e, t, dt) {
    const B = e.aj.tierra.bala;
    for (const b of [...t.balas]) {
      b.y -= B.vel * dt;
      if (b.y < -20) { quitar(t.balas, b); continue; }
      const ob = blanco(e, t, b, B.radio);
      if (!ob) continue;
      quitar(t.balas, b); e.aciertos++;
      herir(e, t, ob, B.dano, b);
    }
  }

  function bombas(e, t, dt) {
    const AJ = e.aj.tierra, R = AJ.bomba.radio * e.caza.radioBomba;
    for (const b of [...t.bombas]) {
      b.t -= dt;
      if (b.t > 0) continue;
      quitar(t.bombas, b);
      const sy = T.pantallaY(t, AJ.alto, b.y);
      e.eventos.push({ tipo: 'estallido', x: b.x, y: sy, radio: R });
      for (const ob of [...t.objetivos]) if (Math.hypot(ob.x - b.x, ob.y - b.y) < R + AJ.objetivos[ob.tipo].radio * 0.5) herir(e, t, ob, AJ.bomba.dano, { x: ob.x, y: T.pantallaY(t, AJ.alto, ob.y) });
    }
  }

  function herir(e, t, ob, dano, donde) {
    const d = e.aj.tierra.objetivos[ob.tipo];
    ob.vida -= dano;
    e.eventos.push({ tipo: 'impactoSuelo', x: donde.x, y: donde.y });
    if (ob.vida > 0) return;
    quitar(t.objetivos, ob); e.destruidos++;
    A.sumar(e, d.puntos);
    e.eventos.push({ tipo: 'destruido', x: ob.x, y: T.pantallaY(t, e.aj.tierra.alto, ob.y), objetivo: ob.tipo, final: !!d.final });
    if (d.final) { t.fin = true; t.finT = 2.2; t.tiros = []; }
  }

  function tiros(e, t, dt) {
    const j = t.jugador, AJ = e.aj.tierra;
    for (const s of [...t.tiros]) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.x < -30 || s.x > AJ.ancho + 30 || s.y < -30 || s.y > AJ.alto + 30) { quitar(t.tiros, s); continue; }
      if (Math.hypot(s.x - j.x, s.y - j.y) >= AJ.radioJugador + AJ.tiro.radio) continue;
      quitar(t.tiros, s);
      A.danar(e, AJ.tiro.dano, 'suelo');
      e.eventos.push({ tipo: 'golpe', x: s.x, y: s.y });
    }
  }
})(AIR);
