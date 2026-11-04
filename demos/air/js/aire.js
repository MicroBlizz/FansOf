// Fans of Air · El aire (dominio): la fase de combate aéreo en falso 3D. El caza se mueve en x e y; los becarios voladores y los
// bombarderos de cajas sorpresa vienen desde lejos (z grande) hasta pasar junto a ti (z = 0), disparan hacia donde estás y se
// esquivan moviéndose. Ametralladora en línea recta, retícula que fija un blanco y misiles guiados; tras los derribos de la
// misión llega SurvivalBot (el jefe) y, al caer, el cielo queda despejado. La proyección (proyectar) la usa también la vista.
'use strict';
var AIR = globalThis.AIR || (globalThis.AIR = {});
(function (A) {
  const F = 420;   // distancia focal del falso 3D: lo que está a z se ve a escala F / (F + z)
  const AIRE = A.aire = {};

  // Mundo -> pantalla desde la cabina (como el original): la cámara es el caza, así que todo se ve respecto a su posición;
  // el morro apunta al centro de la vista y ahí van las balas y la retícula.
  AIRE.proyectar = function (j, p) {
    const s = F / (F + Math.max(0, p.z));
    return { sx: (p.x - j.x) * s, sy: (p.y - j.y) * s, s };
  };
  AIRE.reticula = () => ({ x: 0, y: 0 });

  AIRE.nueva = function () {
    return { jugador: { x: 0, y: 0, vx: 0, vy: 0, roll: 0 }, enemigos: [], balas: [], misiles: [], tiros: [],
      fijando: { id: null, t: 0, fijado: false }, spawnT: 0.8, fuegoT: 0, jefe: null, estado: 'patrulla', despejadoT: 0, especialAntes: false };
  };

  AIRE.paso = function (e, dt, o, rnd) {
    const a = e.aire;
    moverJugador(e, a, dt, o);
    armas(e, a, dt, o);
    aparecer(e, a, dt, rnd);
    for (const en of [...a.enemigos]) enemigo(e, a, en, dt, rnd);
    if (a.jefe) jefe(e, a, a.jefe, dt, rnd);
    balas(e, a, dt);
    misiles(e, a, dt);
    tiros(e, a, dt);
    fijar(e, a, dt);
    if (a.estado === 'despejado') { a.despejadoT -= dt; if (a.despejadoT <= 0) A.despejado(e); }
  };

  function quitar(lista, x) { const i = lista.indexOf(x); if (i >= 0) lista.splice(i, 1); }
  const todos = (a) => (a.jefe ? a.enemigos.concat([a.jefe]) : a.enemigos);

  function moverJugador(e, a, dt, o) {
    const j = a.jugador, L = e.aj.aire.limites, V = e.aj.aire.velBase * e.caza.vel;
    j.vx = A.util.acerca(j.vx, (o.mx || 0) * V, 7, dt);
    j.vy = A.util.acerca(j.vy, (o.my || 0) * V, 7, dt);
    j.x = A.util.limita(j.x + j.vx * dt, -L.x, L.x);
    j.y = A.util.limita(j.y + j.vy * dt, -L.y, L.y);
    j.roll = -j.vx / V * 0.5;
  }

  function armas(e, a, dt, o) {
    const j = a.jugador, B = e.aj.aire.bala;
    a.fuegoT -= dt;
    if (o.fuego && a.fuegoT <= 0) {
      a.lado = -(a.lado || 1);
      a.balas.push({ x: j.x, y: j.y, z: 10, lado: a.lado });
      a.fuegoT = B.cada / (1 + e.caza.rabia * e.combo); e.disparos++;
      e.eventos.push({ tipo: 'disparo' });
    }
    const pulsa = o.especial && !a.especialAntes;
    a.especialAntes = !!o.especial;
    if (pulsa) lanzarMisil(e, a);
  }

  function lanzarMisil(e, a) {
    if (e.misiles <= 0) { e.eventos.push({ tipo: 'sinMisiles' }); return; }
    const j = a.jugador, f = a.fijando, objetivo = f.fijado ? f.id : null;
    e.misiles--;
    a.misiles.push({ x: j.x, y: j.y, z: 20, objetivo, lado: e.misiles % 2 ? 1 : -1 });
    e.eventos.push({ tipo: 'misil', fijado: objetivo !== null });
  }

  function aparecer(e, a, dt, rnd) {
    const AJ = e.aj.aire;
    if (a.estado !== 'patrulla') return;
    if (e.derribos >= AJ.derribos) { llegaJefe(e, a); return; }
    a.spawnT -= dt;
    if (a.spawnT > 0 || a.enemigos.length >= AJ.oleada.maximo) return;
    a.spawnT = AJ.oleada.cada;
    const tipo = rnd() < 0.72 ? 'becario' : 'caja';
    a.enemigos.push(nuevoEnemigo(e, tipo, rnd));
  }

  function nuevoEnemigo(e, tipo, rnd) {
    const L = e.aj.aire.limites, d = e.aj.aire.enemigos[tipo];
    const bx = (rnd() - 0.5) * 2 * L.x * 0.9, by = (rnd() - 0.5) * 2 * L.y * 0.8;
    return { id: e.ids++, tipo, x: bx, y: by, z: e.aj.aire.zLejos, bx, by, fase: rnd() * 6.28, vida: d.vida, radio: d.radio, disparaT: 1 + rnd() * d.dispara };
  }

  function enemigo(e, a, en, dt, rnd) {
    const AJ = e.aj.aire, d = AJ.enemigos[en.tipo], j = a.jugador;
    en.z -= d.vel * dt; en.fase += dt * 1.7;
    en.x = en.bx + Math.sin(en.fase) * d.balanceo; en.y = en.by + Math.cos(en.fase * 0.7) * d.balanceo * 0.5;
    en.disparaT -= dt;
    if (en.z > d.zMinTiro && en.disparaT <= 0) { dispara(e, a, en, d.tiro); en.disparaT = d.dispara / e.caza.sigilo * (0.7 + rnd() * 0.6); }
    if (en.z > 0) return;
    if (A.util.dist(en, j) < AJ.choque.radio) {
      A.danar(e, AJ.choque.dano, 'choque');
      e.eventos.push({ tipo: 'explosion', x: en.x, y: en.y, z: 0, grande: false });
      quitar(a.enemigos, en);
    } else if (a.estado === 'patrulla') {   // pasa de largo y vuelve a entrar desde el fondo
      const L = AJ.limites;
      Object.assign(en, { z: AJ.zLejos, bx: (rnd() - 0.5) * 2 * L.x * 0.9, by: (rnd() - 0.5) * 2 * L.y * 0.8 });
    } else quitar(a.enemigos, en);
  }

  // Un disparo enemigo sale de donde está el enemigo hacia donde estás tú ahora: si te mueves, no te da.
  function dispara(e, a, desde, clase) {
    const j = a.jugador, T = e.aj.aire.tiro;
    const dx = j.x - desde.x, dy = j.y - desde.y, dz = -desde.z, n = Math.hypot(dx, dy, dz) || 1;
    a.tiros.push({ x: desde.x, y: desde.y, z: desde.z, vx: dx / n * T.vel, vy: dy / n * T.vel, vz: dz / n * T.vel, clase });
    e.eventos.push({ tipo: 'tiroEnemigo', clase });
  }

  function tiros(e, a, dt) {
    const j = a.jugador, T = e.aj.aire.tiro;
    for (const t of [...a.tiros]) {
      t.x += t.vx * dt; t.y += t.vy * dt; t.z += t.vz * dt;
      if (t.z > 0) continue;
      if (A.util.dist(t, j) < T.radio) { A.danar(e, T.dano, t.clase); e.eventos.push({ tipo: 'golpe', x: t.x, y: t.y }); }
      quitar(a.tiros, t);
    }
  }

  function blanco(a, p, radio, radioZ) {
    return todos(a).find((en) => Math.abs(en.z - p.z) < radioZ && A.util.dist(en, p) < radio + en.radio * 0.6) || null;
  }

  function balas(e, a, dt) {
    const B = e.aj.aire.bala;
    for (const b of [...a.balas]) {
      b.z += B.vel * dt;
      if (b.z > B.alcance) { quitar(a.balas, b); continue; }
      const en = blanco(a, b, B.radio, B.radioZ);
      if (!en) continue;
      quitar(a.balas, b); e.aciertos++;
      herir(e, a, en, B.dano, b);
    }
  }

  function herir(e, a, en, dano, donde) {
    en.vida -= dano;
    e.eventos.push({ tipo: 'impacto', x: donde.x, y: donde.y, z: donde.z, jefe: en.tipo === 'jefe', id: en.id });
    if (en.tipo === 'jefe') { A.sumar(e, e.aj.aire.jefe.puntosGolpe); if (en.vida <= 0) jefeDerribado(e, a); return; }
    if (en.vida > 0) return;
    A.derribo(e, e.aj.aire.enemigos[en.tipo].puntos);
    e.eventos.push({ tipo: 'derribo', x: en.x, y: en.y, z: en.z, enemigo: en.tipo, combo: e.combo });
    quitar(a.enemigos, en);
  }

  const objetivoDe = (a, id) => (id === null ? null : todos(a).find((en) => en.id === id) || null);

  function guiar(m, obj, M, dt) {
    const dx = obj.x - m.x, dy = obj.y - m.y, dz = obj.z - m.z, n = Math.hypot(dx, dy, dz) || 1, paso = M.vel * dt;
    m.x += dx / n * paso; m.y += dy / n * paso; m.z += dz / n * paso;
  }

  function misiles(e, a, dt) {
    const M = e.aj.aire.misil;
    for (const m of [...a.misiles]) {
      const obj = objetivoDe(a, m.objetivo);
      if (obj) guiar(m, obj, M, dt); else m.z += M.vel * dt;
      if (m.z > e.aj.aire.zLejos + 100) { quitar(a.misiles, m); continue; }
      const en = blanco(a, m, M.radio, M.radioZ);
      if (!en) continue;
      quitar(a.misiles, m);
      e.eventos.push({ tipo: 'explosion', x: en.x, y: en.y, z: en.z, grande: true });
      herir(e, a, en, M.dano, en);
    }
  }

  // La retícula: el enemigo que más cerca queda de ella; si se mantiene encima `fijar` segundos, el misil lo persigue.
  function fijar(e, a, dt) {
    const j = a.jugador, r = AIRE.reticula(j), f = a.fijando;
    let mejor = null, mejorD = 70;
    for (const en of todos(a)) {
      if (en.z < 150) continue;
      const p = AIRE.proyectar(j, en), d = Math.hypot(p.sx - r.x, p.sy - r.y);
      if (d < mejorD) { mejorD = d; mejor = en; }
    }
    if (!mejor) { if (f.id !== null) e.eventos.push({ tipo: 'fijadoPerdido' }); Object.assign(f, { id: null, t: 0, fijado: false }); return; }
    if (mejor.id !== f.id) Object.assign(f, { id: mejor.id, t: 0, fijado: false });
    f.t += dt;
    if (!f.fijado && f.t >= e.caza.fijar) { f.fijado = true; e.eventos.push({ tipo: 'fijado' }); }
  }

  function llegaJefe(e, a) {
    const J = e.aj.aire.jefe;
    a.estado = 'jefe';
    a.jefe = { id: e.ids++, tipo: 'jefe', x: 0, y: -40, z: e.aj.aire.zLejos + 400, vida: J.vida, radio: J.radio, disparaT: 2, t: 0, dir: 1 };
    e.eventos.push({ tipo: 'jefe' });
  }

  function jefe(e, a, b, dt, rnd) {
    const J = e.aj.aire.jefe, L = e.aj.aire.limites;
    b.t += dt;
    if (b.z > J.z) b.z = Math.max(J.z, b.z - J.vel * 2 * dt);
    b.x += b.dir * J.vel * dt;
    if (Math.abs(b.x) > L.x * 0.8) b.dir = -Math.sign(b.x);
    b.y = -40 + Math.sin(b.t * 1.3) * 60;
    b.disparaT -= dt;
    if (b.disparaT > 0 || b.z > J.z + 50) return;
    for (let k = 0; k < J.rafaga; k++) dispara(e, a, { x: b.x + (k - 1) * 40, y: b.y, z: b.z }, J.tiro);
    b.disparaT = J.dispara / e.caza.sigilo * (0.8 + rnd() * 0.4);
  }

  function jefeDerribado(e, a) {
    A.sumar(e, e.aj.aire.jefe.puntos); e.derribos++;
    e.eventos.push({ tipo: 'jefeDerribado', x: a.jefe.x, y: a.jefe.y, z: a.jefe.z });
    a.jefe = null; a.estado = 'despejado'; a.despejadoT = 1.2; a.tiros = [];
  }
})(AIR);
