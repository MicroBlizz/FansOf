// Fans of Asalto · DOMINIO · Los golpes de la batalla: el daño (con esquiva, crítico, defensa, escudo, reflejo, robo de vida, salpicadura
// y las reliquias que lo cambian), las curas, la muerte, el momento del impacto de cada tipo de ataque (cuerpo a cuerpo, flecha, bola
// mágica, bomba o cura), los proyectiles en vuelo y las habilidades de las 7 clases, que saltan cada pocos segundos. Cada vida que se quita o se da pasa por `quita` o `sana`, que la apuntan en las cifras del combate (cifras.js).
// Todo lo que pasa se apunta en B.eventos para que la pantalla lo pinte y lo haga sonar. Los legendarios (tarea #109) se enganchan
// aquí con AS.leyendas (batalla-legendarios.js): al contar el golpe, al repartirlo, después de darlo, al atacar, al revivir y al morir.
'use strict';
AS.golpes = (() => {
  const BT = () => AS.batalla;
  const ev = (B, e) => { B.eventos.push(e); };
  // para que ninguna batalla se eternice: desde el segundo 40 todo pega cada vez más
  const muerteSubita = B => { const m = B.datos.partida.muerteSubita; return B.t > m ? 1 + (B.t - m) / 8 : 1; };

  const CI = () => AS.cifras;
  // le quita d de vida a `a`, a nombre de `de` (el que pega): es daño hecho si `a` es un enemigo y daño aguantado si es un héroe.
  // Para las cifras solo cuenta la vida que le quedaba
  function quita(B, a, d, de) {
    const real = Math.min(d, Math.max(0, a.vida));
    a.vida -= d;
    if (a.lado === 'enemigo') CI().apunta(B, de, 'dano', real); else CI().apunta(B, a, 'aguante', real);
    if (a.leg) AS.leyendas.bastion(B, a);
  }
  // le sube la vida a `a` (sin pasar de su máximo), a nombre de `de` (el que cura)
  function sana(B, a, cant, de) {
    const real = Math.max(0, Math.min(cant, a.max - a.vida));
    a.vida += real;
    if (a.lado === 'heroe') CI().apunta(B, de, 'cura', real);
  }
  // de = quien lo ha derrotado (para las cifras)
  // (un héroe puede revivir: Segunda vida u Oráculo). extra = un señuelo o un minimapache
  function muere(B, u, de) {
    if (u.muerta || AS.leyendas.revive(B, u)) return;
    u.muerta = true; u.vida = 0; u.anim = 'muerte'; u.tAnim = 0;
    if (u.lado === 'enemigo') { B.oro += B.datos.partida.oroPorMuerte; B.bajas++; CI().apunta(B, de, 'bajas', 1); }
    ev(B, { e: 'muere', id: u.id, lado: u.lado, x: u.x, y: u.y, jefe: u.jefe, elite: u.elite, extra: u.extra });
    AS.leyendas.alMorir(B, u, de);
  }
  // de = quien cura (para las cifras)
  function cura(B, a, cant, de) {
    if (!a || a.muerta) return;
    const c = Math.max(1, Math.round(cant));
    sana(B, a, c, de);
    ev(B, { e: 'cura', id: a.id, x: a.x, y: a.y, c });
  }
  // cuánto quita el golpe antes de la defensa: azar, muerte súbita, crítico, furia y maldición (y lo de los legendarios: L.mult de
  // más o de menos, L.crit = crítico seguro, L.mata = lo mata de golpe)
  function cuenta(B, de, a, dano) {
    const L = AS.leyendas.mods(B, de, a);
    if (L.mata) return { d: Math.ceil(a.vida + a.escudo), crit: true };
    let d = dano * B.azar.entre(0.9, 1.1) * muerteSubita(B) * L.mult, crit = false;
    if (L.crit || (de && de.critico && B.azar() < de.critico)) { d *= 2 + (de.danoCrit || 0); crit = true; }
    if (de && de.lado === 'heroe' && B.rel.has('furia') && de.vida < de.max * 0.3) d *= 1.3;
    if (a.maldito > 0) d *= 1.2;
    if (a.defensa) d *= Math.max(0.3, 1 - a.defensa);
    return { d: Math.max(1, Math.round(d)), crit };
  }
  // lo que le vuelve o le llega al que pega: reflejo, robo de vida, frenar (toque helado) y maldecir
  function secuelas(B, de, a, d) {
    if (!de || de.muerta) return;
    if (a.reflejo) { quita(B, de, Math.max(1, Math.round(d * a.reflejo)), a); if (de.vida <= 0) { muere(B, de, a); return; } }
    if (de.roba) sana(B, de, d * de.roba / 100, de);
    if (de.lado === 'heroe' && B.rel.has('helado') && de.clases.includes('mago') && B.azar() < 0.3) a.lento = 2;
    if (de.maldice) a.maldito = de.maldice;
  }
  // el escudo se come lo que pueda del golpe (cuenta como daño aguantado): devuelve lo que pasa
  function escuda(B, a, d) {
    if (!(a.escudo > 0)) return d;
    const q = Math.min(a.escudo, d);
    a.escudo -= q; CI().apunta(B, a, 'aguante', q);
    return d - q;
  }
  // el que recibe se encoge (menos si ya está atacando, muriendo o es un jefe)
  function encoge(a) { if (a.anim !== 'ataque' && a.anim !== 'muerte' && !a.jefe) { a.anim = 'golpe'; a.tAnim = 0; } }
  function salpica(B, de, a, dano, tipoGolpe) {
    if (!de || !de.salpica) return;
    for (const r of BT().rivales(B, de)) if (r !== a && Math.hypot(r.x - a.x, r.y - a.y) < 60) dana(B, de, r, dano * de.salpica / 100, tipoGolpe, true);
  }
  // dana: de pega a `a`. tipoGolpe: 'cuerpo', 'flecha', 'magia'… (para el dibujo); eco = es un golpe de rebote (salpicadura, el que
  // atraviesa, un área de habilidad): no vuelve a salpicar ni a atravesar
  function dana(B, de, a, dano, tipoGolpe, eco) {
    if (!a || a.muerta) return;
    if (a.esquiva && B.azar() < a.esquiva) { ev(B, { e: 'esquiva', id: a.id, x: a.x, y: a.y }); return; }
    const c = a.invul > 0 ? { d: 0 } : cuenta(B, de, a, dano), d = escuda(B, a, AS.leyendas.reparte(B, a, c.d));
    if (!d) { ev(B, { e: 'bloqueo', id: a.id, x: a.x, y: a.y }); return; }
    quita(B, a, d, de);
    encoge(a);
    ev(B, { e: 'golpe', id: a.id, lado: a.lado, x: a.x, y: a.y, d, crit: c.crit, tipo: tipoGolpe || 'cuerpo', jefe: a.jefe });
    secuelas(B, de, a, d);
    if (!eco) { salpica(B, de, a, dano, tipoGolpe); AS.leyendas.trasGolpe(B, de, a, dano, tipoGolpe); }
    if (a.vida <= 0) muere(B, a, de);
  }
  const enArea = (B, u, x, y, radio) => BT().rivales(B, u).filter(r => Math.hypot(r.x - x, r.y - y) < radio);

  function dispara(B, u, ob, mult, retraso) {
    const t = u.ataque, alto = 34 * u.escala;
    B.proy.push({ x: u.x, y: u.y - alto, x0: u.x + (u.lado === 'heroe' ? 14 : -14), y0: u.y - alto, ob, de: u, tipo: t, dano: u.dano * mult, area: u.area,
      t: -(retraso || 0), dura: t === 'bomba' ? 0.7 : 0.3 + Math.hypot(ob.x - u.x, ob.y - u.y) / 700,
      perfora: t === 'flecha' && u.lado === 'heroe' && B.rel.has('perforar') && u.clases.includes('tirador') });
  }
  // el golpe de un ataque, según su tipo (también lo repite la carta Eco)
  function golpea(B, u, ob) {
    if (u.ataque === 'cuerpo') {
      const radio = Math.max(u.area, u.torbellino);
      if (radio) { for (const r of enArea(B, u, ob.x, ob.y, radio)) dana(B, u, r, u.dano); AS.leyendas.golpeDeArea(B, u, ob.x, ob.y); }
      else dana(B, u, ob, u.dano);
      ev(B, { e: 'ataque', tipo: 'cuerpo', id: u.id, x: ob.x, y: ob.y, radio });
    } else if (u.ataque === 'cura') {
      if (!u.curaA) return;
      cura(B, u.curaA, u.dano * 1.4, u);
      if (u.curaArea) for (const a of BT().vivos(B, u.lado)) if (a !== u.curaA) cura(B, a, u.dano * 1.4 * u.curaArea, u);
      ev(B, { e: 'ataque', tipo: 'cura', id: u.id, x: u.curaA.x, y: u.curaA.y });
    } else {
      dispara(B, u, ob, 1, 0);
      if (u.dobleTiro) dispara(B, u, ob, u.dobleTiro, 0.12);
      ev(B, { e: 'ataque', tipo: u.ataque, id: u.id, x: u.x, y: u.y });
    }
  }
  // el momento del golpe de cada ataque
  function impacto(B, u) {
    const ob = u.ob; if (!ob) return;
    golpea(B, u, ob);
    AS.leyendas.alAtacar(B, u, ob);
  }

  function llega(B, p) {
    const ob = p.ob, tx = ob.x, ty = ob.y;
    if (p.tipo === 'dardo') return;
    if (p.area) {
      for (const r of enArea(B, p.de, tx, ty, p.area)) dana(B, p.de, r, p.dano, 'magia');
      ev(B, { e: 'onda', x: tx, y: ty, radio: p.area, tipo: p.tipo });
      AS.leyendas.golpeDeArea(B, p.de, tx, ty);
      return;
    }
    dana(B, p.de, ob, p.dano, p.tipo);
    if (!p.perfora) return;
    const otro = BT().rivales(B, p.de).filter(r => r !== ob).sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty))[0];
    if (otro && Math.hypot(otro.x - tx, otro.y - ty) < 80) dana(B, p.de, otro, p.dano * 0.7, 'flecha');
  }
  function proyectiles(B, dt) {
    for (const p of B.proy) {
      p.t += dt; if (p.t < 0) continue;
      const k = Math.min(1, p.t / p.dura), ty = p.ob.y - 34 * p.ob.escala * 0.6;
      p.x = p.x0 + (p.ob.x - p.x0) * k; p.y = p.y0 + (ty - p.y0) * k - (p.tipo === 'bomba' ? Math.sin(k * Math.PI) * 70 : 0);
      if (k >= 1) { p.fin = true; llega(B, p); }
    }
    B.proy = B.proy.filter(p => !p.fin);
  }

  /* ---------- las habilidades de las clases, cada pocos segundos ---------- */
  const HAB = {
    tanque: (B, suyos, v) => { for (const u of suyos) u.escudo = Math.max(u.escudo, Math.round(u.max * v / 100)); },
    asesino: (B, suyos, v, enem) => {
      for (const u of suyos) {
        const r = B.azar.elige(enem), tope = r.jefe ? 0.25 : 1;   // a un jefe el veneno le hace la cuarta parte
        r.veneno = r.max * v / 100 * tope; r.tVeneno = 3; r.venenoDe = u;
        B.proy.push({ x: u.x, y: u.y - 30, x0: u.x, y0: u.y - 30, ob: r, de: u, tipo: 'dardo', dano: 0, area: 0, t: 0, dura: 0.3 });
      }
    },
    mago: (B, suyos, v, enem) => {
      for (const u of suyos) {
        let desde = u;
        for (const r of B.azar.baraja(enem).slice(0, 3)) { ev(B, { e: 'rayo', x1: desde.x, y1: desde.y - 40, x2: r.x, y2: r.y - 30 }); dana(B, u, r, u.dano * v / 100, 'magia'); desde = r; }
      }
    },
    sanador: (B, suyos, v, enem, heroes) => { for (let i = 0; i < suyos.length; i++) { const a = BT().masHerido(B, 'heroe') || B.azar.elige(heroes); cura(B, a, a.max * v / 100, suyos[i]); } },
    brujo: (B, suyos, v, enem) => {
      const mas = B.rel.has('sombra') ? 1.5 : 1;
      for (const u of suyos) for (let i = 0; i < v; i++) {
        const r = B.azar.elige(enem);
        B.proy.push({ x: u.x, y: u.y - 34, x0: u.x, y0: u.y - 34 - i * 6, ob: r, de: u, tipo: 'sombra', dano: u.dano * 0.6 * mas, area: 0, t: -i * 0.08, dura: 0.5 });
      }
    },
  };
  function habilidades(B, dt) {
    const heroes = BT().vivos(B, 'heroe'), enem = BT().vivos(B, 'enemigo');
    if (!heroes.length || !enem.length) return;
    for (const k in HAB) {
      if (!B.nivel[k]) continue;
      B.tHab[k] = (B.tHab[k] || 0) + dt;
      if (B.tHab[k] < B.datos.clases[k].cada) continue;
      B.tHab[k] = 0;
      const suyos = heroes.filter(u => u.clases.includes(k) && !u.muerta), quedan = enem.filter(e => !e.muerta);
      if (!suyos.length || !quedan.length) continue;
      HAB[k](B, suyos, BT().valorClase(B, k), quedan, heroes);
      ev(B, { e: 'habilidad', clase: k, ids: suyos.map(u => u.id) });
    }
  }
  return { dana, cura, muere, quita, sana, impacto, golpea, dispara, proyectiles, habilidades, enArea };
})();
