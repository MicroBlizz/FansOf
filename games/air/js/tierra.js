// Fans of Air · La tierra (dominio): la fase de ataque a la base de Microblizz, en vista isométrica como el original. El caza
// vuela libre por un mapa grande sin pararse (es un reactor): vira hacia donde empujas la palanca y rebota en los bordes.
// Ametralladora hacia donde apunta el morro y bombas que caen un poco por delante y estallan al rato. Oficinas, servidores y la
// Torre del CEO son los objetivos primarios (la flecha del HUD señala el más cercano); torretas y tanques disparan si te acercas.
// Destruir todos los primarios cumple la misión.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const T = A.tierra = {};

  T.nueva = function (AJ) {
    const Tj = AJ.tierra;
    const objetivos = Tj.mapa.map((o, i) => {
      const base = Tj.bases.find((b) => o.x >= b.x && o.x <= b.x + b.w && o.y >= b.y && o.y <= b.y + b.h);
      return { id: i + 1, tipo: o.tipo, x: o.x, y: o.y, vida: Tj.objetivos[o.tipo].vida, disparaT: 1 + (i % 3) * 0.5, dir: i % 2 ? 1 : -1,
        patrulla: base ? [base.x + 60, base.x + base.w - 60] : [o.x - 150, o.x + 150] };
    });
    return { jugador: { x: Tj.inicio.x, y: Tj.inicio.y, rumbo: Tj.inicio.rumbo }, objetivos, balas: [], bombas: [], tiros: [], fuegoT: 0,
      especialAntes: false, fin: false, finT: 0, t: 0 };
  };

  // El objetivo primario vivo más cercano al caza (adonde apunta la flecha), o null si no queda ninguno.
  T.objetivo = function (t, AJ) {
    const j = t.jugador;
    let mejor = null, mejorD = Infinity;
    for (const ob of t.objetivos) {
      if (!AJ.tierra.objetivos[ob.tipo].primario) continue;
      const d = Math.hypot(ob.x - j.x, ob.y - j.y);
      if (d < mejorD) { mejorD = d; mejor = ob; }
    }
    return mejor;
  };
  // Dónde caería ahora una bomba: un poco por delante del morro.
  T.puntoBomba = (t, AJ) => ({ x: t.jugador.x + Math.cos(t.jugador.rumbo) * AJ.tierra.bomba.delante, y: t.jugador.y + Math.sin(t.jugador.rumbo) * AJ.tierra.bomba.delante });

  T.paso = function (e, dt, o, rnd) {
    const t = e.tierra;
    if (t.fin) { t.finT -= dt; if (t.finT <= 0) A.terminar(e, 'cumplida'); return; }
    t.t += dt;
    moverJugador(e, t, dt, o);
    armas(e, t, dt, o);
    for (const ob of t.objetivos) objetivo(e, t, ob, dt, rnd);
    balas(e, t, dt);
    bombas(e, t, dt);
    tiros(e, t, dt);
  };

  function quitar(lista, x) { const i = lista.indexOf(x); if (i >= 0) lista.splice(i, 1); }
  const normaliza = (a) => Math.atan2(Math.sin(a), Math.cos(a));

  // Vira hacia donde empuja la palanca (lo que permita el giro del caza), avanza siempre y rebota en los bordes del mapa.
  function moverJugador(e, t, dt, o) {
    const j = t.jugador, AJ = e.aj.tierra, V = AJ.vel * e.caza.vel, m = Math.hypot(o.mx || 0, o.my || 0);
    if (m > 0.25) { const d = normaliza(Math.atan2(o.my, o.mx) - j.rumbo); j.rumbo = normaliza(j.rumbo + A.util.limita(d, -AJ.giro * dt, AJ.giro * dt)); }
    j.x += Math.cos(j.rumbo) * V * dt; j.y += Math.sin(j.rumbo) * V * dt;
    if (j.x < AJ.margen || j.x > AJ.ancho - AJ.margen) { j.x = A.util.limita(j.x, AJ.margen, AJ.ancho - AJ.margen); j.rumbo = normaliza(Math.PI - j.rumbo); }
    if (j.y < AJ.margen || j.y > AJ.alto - AJ.margen) { j.y = A.util.limita(j.y, AJ.margen, AJ.alto - AJ.margen); j.rumbo = normaliza(-j.rumbo); }
  }

  function armas(e, t, dt, o) {
    const j = t.jugador, B = e.aj.tierra.bala;
    t.fuegoT -= dt;
    if (o.fuego && t.fuegoT <= 0) {
      t.balas.push({ x: j.x + Math.cos(j.rumbo) * 30, y: j.y + Math.sin(j.rumbo) * 30, vx: Math.cos(j.rumbo) * B.vel, vy: Math.sin(j.rumbo) * B.vel, recorrido: 0 });
      t.fuegoT = B.cada / (1 + e.caza.rabia * e.combo); e.disparos++;
      e.eventos.push({ tipo: 'disparo' });
    }
    const pulsa = o.especial && !t.especialAntes;
    t.especialAntes = !!o.especial;
    if (pulsa) soltarBomba(e, t);
  }

  function soltarBomba(e, t) {
    if (e.bombas <= 0) { e.eventos.push({ tipo: 'sinBombas' }); return; }
    const p = T.puntoBomba(t, e.aj);
    e.bombas--;
    t.bombas.push({ x: p.x, y: p.y, t: e.aj.tierra.bomba.cae });
    e.eventos.push({ tipo: 'bomba' });
  }

  function objetivo(e, t, ob, dt, rnd) {
    const AJ = e.aj.tierra, d = AJ.objetivos[ob.tipo], j = t.jugador;
    if (d.mueve) { ob.x += ob.dir * d.mueve * dt; if (ob.x < ob.patrulla[0] || ob.x > ob.patrulla[1]) { ob.dir = -ob.dir; ob.x = A.util.limita(ob.x, ob.patrulla[0], ob.patrulla[1]); } }
    if (!d.dispara || Math.hypot(ob.x - j.x, ob.y - j.y) > AJ.tiro.alcance) return;
    ob.disparaT -= dt;
    if (ob.disparaT > 0) return;
    ob.disparaT = d.dispara / e.caza.sigilo * (0.8 + rnd() * 0.4);
    const n = d.final ? 3 : 1;
    for (let k = 0; k < n; k++) dispara(e, t, ob, (k - (n - 1) / 2) * 0.35);
  }

  // Un tiro desde el suelo hacia donde está el caza (con `desvio` radianes para las ráfagas en abanico).
  function dispara(e, t, desde, desvio) {
    const j = t.jugador, V = e.aj.tierra.tiro.vel, ang = Math.atan2(j.y - desde.y, j.x - desde.x) + desvio;
    t.tiros.push({ x: desde.x, y: desde.y, vx: Math.cos(ang) * V, vy: Math.sin(ang) * V, recorrido: 0 });
    e.eventos.push({ tipo: 'tiroEnemigo', clase: 'suelo' });
  }

  function blanco(e, t, p, radio) {
    const AJ = e.aj.tierra;
    return t.objetivos.find((ob) => Math.hypot(ob.x - p.x, ob.y - p.y) < radio + AJ.objetivos[ob.tipo].radio * 0.7) || null;
  }

  function balas(e, t, dt) {
    const B = e.aj.tierra.bala;
    for (const b of [...t.balas]) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.recorrido += B.vel * dt;
      if (b.recorrido > B.alcance) { quitar(t.balas, b); continue; }
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
      e.eventos.push({ tipo: 'estallido', x: b.x, y: b.y, radio: R });
      for (const ob of [...t.objetivos]) if (Math.hypot(ob.x - b.x, ob.y - b.y) < R + AJ.objetivos[ob.tipo].radio * 0.5) herir(e, t, ob, AJ.bomba.dano, ob);
    }
  }

  function herir(e, t, ob, dano, donde) {
    const d = e.aj.tierra.objetivos[ob.tipo];
    ob.vida -= dano;
    e.eventos.push({ tipo: 'impactoSuelo', x: donde.x, y: donde.y });
    if (ob.vida > 0) return;
    quitar(t.objetivos, ob); e.destruidos++;
    A.sumar(e, d.puntos);
    e.eventos.push({ tipo: 'destruido', x: ob.x, y: ob.y, objetivo: ob.tipo, final: !!d.final, primario: !!d.primario });
    if (d.primario && !T.objetivo(t, e.aj)) { t.fin = true; t.finT = 2.2; t.tiros = []; e.eventos.push({ tipo: 'baseArrasada' }); }
  }

  function tiros(e, t, dt) {
    const j = t.jugador, AJ = e.aj.tierra;
    for (const s of [...t.tiros]) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.recorrido += AJ.tiro.vel * dt;
      if (s.recorrido > AJ.tiro.recorrido) { quitar(t.tiros, s); continue; }
      if (Math.hypot(s.x - j.x, s.y - j.y) >= AJ.radioJugador + AJ.tiro.radio) continue;
      quitar(t.tiros, s);
      A.danar(e, AJ.tiro.dano, 'suelo');
      e.eventos.push({ tipo: 'golpe', x: s.x, y: s.y });
    }
  }
})(AIR);
