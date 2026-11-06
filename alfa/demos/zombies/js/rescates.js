// Fans of Zombies · LOS SUPERVIVIENTES Y TU REFUGIO (dominio): en algunos edificios de los trozos del mundo hay un animal de la serie
// atrapado, rodeado de fans. Si llegas hasta él y lo rescatas (F), se va a tu refugio (la casa o el edificio donde empezaste) y hace su
// oficio solo: el vigía avisa por la radio de los fans que se acercan y pega a los que entran; la cocinera deja comida cada mañana en la
// despensa; la carpintera repone tablas en las puertas y ventanas del refugio al anochecer; la médica te cura si estás dentro. Si los fans
// entran en el refugio, les hacen daño y pueden morir. Todo en AJ.rescates. El mundo da los sitios libres (mundo.puntoDentro).
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const dentro = (R, x, z) => x > R.x0 && x < R.x1 && z > R.z0 && z < R.z1;
  Z.dentroRefugio = (e, x, z) => !!e.refugio && dentro(e.refugio, x, z);
  Z.oficioDe = (AJ, animal) => AJ.rescates.oficios[animal];
  // el refugio de la partida: una caja (la casa), sus puertas y ventanas y la despensa (empieza vacía y abierta)
  Z.ponRefugio = function (e, r) {
    if (!r) return;
    e.refugio = { x0: r.x0, z0: r.z0, x1: r.x1, z1: r.z1, cx: (r.x0 + r.x1) / 2, cz: (r.z0 + r.z1) / 2, huecos: r.huecos || [], despensa: r.despensa || null, cocina: 0, repara: 0, aviso: -1e9 };
    e.contenidos.refugio = e.contenidos.refugio || []; e.registrados.refugio = true;
  };
  // al llenar un trozo por primera vez: a veces, alguien atrapado en uno de sus edificios (con fans de guardia alrededor)
  Z.ponRescate = function (AJ, e, P, mundo, azar) {
    const R = AJ.rescates, sitios = P.casas.concat(P.edificios.filter((b) => b.tipo !== 'contenedores'));
    e.rescates = e.rescates || [];
    const libres = Object.keys(AJ.animales).filter((a) => a !== e.jugador.animal && !e.rescates.some((s) => s.animal === a && s.estado !== 'muerto'));
    if (!sitios.length || !libres.length || azar() >= R.prob) return null;
    const b = sitios[Math.floor(azar() * sitios.length)], caja = { x0: b.cx - b.w / 2, z0: b.cz - b.d / 2, x1: b.cx + b.w / 2, z1: b.cz + b.d / 2 };
    const p = mundo.puntoDentro(caja, azar); if (!p) return null;
    const s = { id: 's' + (e.rescates.length + 1), animal: libres[Math.floor(azar() * libres.length)], x: p.x, z: p.z, estado: 'atrapado', vida: R.vida };
    e.rescates.push(s);
    const fuera = { x0: caja.x0 - 8, z0: caja.z0 - 8, x1: caja.x1 + 8, z1: caja.z1 + 8 };
    const J = e.jugador;
    for (let i = 0; i < R.guardia; i++) { const q = mundo.puntoTrozo(fuera, azar); if (q && Z.dist(q.x, q.z, J.x, J.z) >= AJ.trozos.lejosDeTi) Z.nuevoZombi(AJ, e, Z.sortea(AJ.reparto, azar), q.x, q.z, azar); }
    e.eventos.push({ tipo: 'hayRescate', animal: s.animal });
    return s;
  };
  // rescatar a quien tienes al lado: se va a tu refugio
  Z.rescata = function (AJ, e, id, mundo, azar) {
    const s = (e.rescates || []).find((q) => q.id === id), J = e.jugador;
    if (!s || s.estado !== 'atrapado') return Z.error('nadaCerca');
    if (Z.dist(s.x, s.z, J.x, J.z) > AJ.rescates.alcance) return Z.error('nadaCerca');
    if (!e.refugio) return Z.error('sinRefugio');
    const p = mundo.puntoDentro(e.refugio, azar) || { x: e.refugio.cx, z: e.refugio.cz };
    s.estado = 'refugio'; s.x = p.x; s.z = p.z;
    e.eventos.push({ tipo: 'rescate', animal: s.animal, oficio: Z.oficioDe(AJ, s.animal) });
    return Z.ok(s);
  };
  // cada fotograma: los del refugio hacen su oficio y sufren si hay fans dentro
  Z.pasoRefugio = function (AJ, e, dt) {
    const R = e.refugio, en = (e.rescates || []).filter((s) => s.estado === 'refugio');
    if (!R || !en.length) return;
    const intrusos = Z.vivos(e).filter((z) => dentro(R, z.x, z.z));
    for (const s of en) { OFICIOS[Z.oficioDe(AJ, s.animal)](AJ, e, R, dt, intrusos); sufre(AJ, e, s, dt, intrusos.length); }
  };
  function sufre(AJ, e, s, dt, n) {
    if (!n) return;
    s.vida -= n * AJ.rescates.danoFans * dt;
    if (s.vida > 0) return;
    s.estado = 'muerto'; s.vida = 0;
    e.eventos.push({ tipo: 'rescateMuere', animal: s.animal });
  }
  const OFICIOS = {
    // avisa de los fans que se acercan (como mucho una vez cada AJ.rescates.avisoCada minutos) y pega a los que entran
    vigia(AJ, e, R, dt, intrusos) {
      const V = AJ.rescates.vigia, cerca = Z.vivos(e).filter((z) => Z.dist(z.x, z.z, R.cx, R.cz) < V.radio).length;
      if (cerca && e.min - R.aviso >= V.cada) { R.aviso = e.min; e.eventos.push({ tipo: 'vigia', n: cerca }); }
      if (intrusos.length) Z.golpeaZombi(AJ, e, intrusos[0], V.dano * dt);
    },
    // cada mañana deja comida en la despensa (sin pasarse del tope)
    cocinera(AJ, e, R) {
      const C = AJ.rescates.cocina, dia = Z.diaDe(e.min), lista = e.contenidos.refugio;
      if (R.cocina === dia || Z.horaDe(e.min) < C.hora) return;
      R.cocina = dia;
      for (const [id, n] of C.deja) if (lista.reduce((t, c) => t + (c.id === id ? c.n : 0), 0) < C.tope) lista.push({ id, n });
      e.eventos.push({ tipo: 'despensa' });
    },
    // al anochecer repone una tabla en cada puerta o ventana del refugio que no esté rota
    carpintera(AJ, e, R) {
      const dia = Z.diaDe(e.min);
      if (R.repara === dia || Z.horaDe(e.min) < AJ.reloj.anochece - 60) return;
      R.repara = dia;
      let n = 0;
      for (const id of R.huecos) { const h = e.huecos[id]; if (h && !h.roto && h.tablas < AJ.huecos.barricada.max) { h.tablas++; h.vida = AJ.huecos.barricada.vidaTabla; n++; } }
      e.eventos.push({ tipo: 'reparado', n });
    },
    // si estás dentro del refugio, te cura y te baja la infección
    medica(AJ, e, R, dt) {
      const J = e.jugador, M = AJ.rescates.medica;
      if (!dentro(R, J.x, J.z)) return;
      J.vida = Math.min(J.max, J.vida + M.vida * dt); J.infeccion = Math.max(0, J.infeccion - M.infeccion * dt);
    },
  };
})(ZOM);
