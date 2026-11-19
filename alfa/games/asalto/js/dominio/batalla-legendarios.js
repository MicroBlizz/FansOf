// Fans of Asalto · DOMINIO · Lo que hacen en la BATALLA los legendarios y los seres secretos (tarea #109; cifras en
// ajustes-legendarios.js, bloque `efectos`; sus cifras de base, en poder.js): los 7 poderes cumbre (uno por rama), las 16 habilidades
// únicas y las cartas de Despertar que actúan en combate. batalla.js y batalla-golpes.js lo llaman en sus momentos: al empezar
// (empieza), en cada paso (avanza), al elegir objetivo (visibles, forzado), al contar la prisa (prisa), al contar y repartir un golpe
// (mods, reparte), después de darlo (trasGolpe), al perder vida (bastion), al atacar (alAtacar, golpeDeArea) y al morir (revive,
// alMorir). Si no hay ningún legendario en el campo (B.hayLeg falso) nada de esto hace nada ni gasta azar.
// Lo que deja en la batalla: B.cosecha (cuántos enemigos han matado los que llevan la carta Cosecha: la partida lo lee al acabar la
// oleada y da esa esencia), B.fuegos (zonas de fuego en el suelo) y unidades de más del lado de los héroes con `extra: true`
// (señuelos con `senuelo`, minimapaches con `mini`; los dos con `amo` = id del legendario) que no cuentan para perder.
// Eventos que apunta en B.eventos (la pantalla los pinta; todos llevan id, x, y del que lo hace salvo donde se dice):
//   { e: 'cumbre', cual, id, x, y, a? }  cual: tanque|luchador|asesino|tirador|mago|sanador|brujo. Luchador lleva `mas` (su daño
//                                         de más ya sumado); asesino, sanador y brujo, `a` (id del rematado, revivido o nuevo maldito);
//                                         tirador, `a` = lista de ids de los objetivos de más
//   { e: 'habilidad', hab, id, x, y, radio?, a? }  hab: sombra|abanico|salto|muralla|sinaviso|guadana|fortaleza|vidente (sin `clase`:
//                                         no se confunde con el de las habilidades de clase). salto, sinaviso y guadana llevan `a`
//   { e: 'carta', carta, id, x, y, a?, radio? }  carta: eco|segunda|escudo|estandarte|atraviesa|cosecha (escudo: `a` = el protegido)
//   { e: 'revive', id, x, y, por, de }   por: 'segunda'|'oraculo'; de = id de quien le revive
//   { e: 'invulnerable', id, x, y, dura }
//   { e: 'meteorito', id, x, y, radio }   { e: 'cometa', id, x, y, radio }   { e: 'explota', id, x, y, radio }
//   { e: 'bellotas', id, x, y }           { e: 'fuego', id, x, y, radio, dura }   { e: 'embestida', id, x, y, empuje }
//   { e: 'senuelo', id, x, y, amo }       { e: 'minimapache', id, x, y, amo, fin? }  (fin: true cuando se le acaba el tiempo y se va)
'use strict';
AS.leyendas = (() => {
  const BT = () => AS.batalla, G = () => AS.golpes;
  const E = B => B.datos.legendarios.efectos;
  const ev = (B, e) => { B.eventos.push(e); };
  const aqui = (u, mas) => ({ id: u.id, x: u.x, y: u.y, ...mas });
  const lejos = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const tieneCumbre = (u, k) => !!u.leg && u.cumbres.includes(k);
  const tieneHab = (u, k) => !!u.leg && u.habilidades.includes(k);
  const tieneCarta = (u, k) => !!u.leg && u.cartas.includes(k);
  const leyendas = B => BT().vivos(B, 'heroe').filter(u => u.leg);
  const enemigos = B => BT().vivos(B, 'enemigo');
  const media = (lista, k) => lista.reduce((s, u) => s + u[k], 0) / lista.length;

  function aturde(u, t) {
    if (u.muerta) return;
    u.aturdido = Math.max(u.aturdido, t);
    if (u.anim === 'ataque') { u.anim = 'reposo'; u.tAnim = 0; }
  }
  // daña a todos los enemigos de `u` en el círculo (golpe de rebote: no salpica ni atraviesa); devuelve los tocados
  function golpeArea(B, u, x, y, radio, mult, tipo) {
    const tocados = G().enArea(B, u, x, y, radio);
    for (const r of tocados) G().dana(B, u, r, u.dano * mult, tipo, true);
    return tocados;
  }

  /* ---------- al empezar ---------- */
  function senuelos(B, u) {
    const C = E(B).enganos;
    for (let i = 0; i < C.cuantos; i++) {
      const s = BT().unidad('heroe', u.tipo, { vida: Math.max(1, Math.round(u.max * C.vida)), dano: 0, cada: 1e9, alcance: 0, vel: 0, ataque: 'cuerpo', escala: u.escala, ref: u.ref },
        u.x + C.x, u.y + (i % 2 ? C.y : -C.y));
      Object.assign(s, { extra: true, senuelo: true, cd: 1e9, amo: u.id });
      B.u.push(s);
      ev(B, aqui(s, { e: 'senuelo', amo: u.id }));
    }
  }
  function salto(B, u) {
    const lista = enemigos(B);
    if (!lista.length) return;
    const t = lista.reduce((a, b) => (b.max > a.max ? b : a));
    u.x = t.x - (u.radio + t.radio); u.y = t.y;
    aturde(t, E(B).salto.aturde);
    ev(B, aqui(u, { e: 'habilidad', hab: 'salto', a: t.id }));
  }
  function cometa(B, u) {
    const lista = enemigos(B), C = E(B).cometa;
    if (!lista.length) return;
    const x = media(lista, 'x'), y = media(lista, 'y');
    ev(B, { e: 'cometa', id: u.id, x, y, radio: C.radio });
    golpeArea(B, u, x, y, C.radio, C.mult, 'magia');
  }
  function fortaleza(B, u) {
    for (const a of BT().vivos(B, 'heroe')) a.escudo = Math.max(a.escudo, Math.round(a.max * E(B).fortaleza));
    ev(B, aqui(u, { e: 'habilidad', hab: 'fortaleza' }));
  }
  function empuja(B, u) {
    const C = E(B).embestida, tope = BT().CAMPO.w + 30;
    for (const r of enemigos(B)) r.x = Math.min(tope, r.x + C.empuje);
    ev(B, aqui(u, { e: 'embestida', empuje: C.empuje }));
  }
  const INICIO = {
    sombra: (B, u) => { u.invisible = E(B).sombra; ev(B, aqui(u, { e: 'habilidad', hab: 'sombra' })); },
    muralla: (B, u) => { u.muralla = E(B).muralla; ev(B, aqui(u, { e: 'habilidad', hab: 'muralla' })); },
    salto, enganos: senuelos, fortaleza, embestida: empuja, cometa,
  };
  // Estandarte: los aliados cerca hacen más daño (se pone, no se suma: dos estandartes no se acumulan)
  function estandarte(B, u) {
    const C = E(B).estandarte;
    for (const a of BT().vivos(B, 'heroe')) if (lejos(u, a) < C.radio) a.estandarte = C.mas;
    ev(B, aqui(u, { e: 'carta', carta: 'estandarte', radio: C.radio }));
  }
  function prepara(u) {
    const hab = k => u.habilidades.includes(k);
    u.leg = { atq: 0, guerra: 0, t: {}, sombra: hab('sombra'), sinaviso: hab('sinaviso'), bastion: u.cumbres.includes('tanque'),
      oraculo: u.cumbres.includes('sanador'), segunda: u.cartas.includes('segunda') };
  }
  function empieza(B) {
    const leg = BT().vivos(B, 'heroe').filter(u => u.legendario);
    B.hayLeg = leg.length > 0;
    if (!B.hayLeg) return;
    for (const u of leg) prepara(u);
    B.malojo = leg.some(u => u.habilidades.includes('malojo'));
    for (const u of leg) if (u.cartas.includes('estandarte')) estandarte(B, u);
    for (const u of leg) for (const k of u.habilidades) if (INICIO[k]) INICIO[k](B, u);
  }

  /* ---------- en cada paso ---------- */
  function bellotas(B, u) {
    const lista = enemigos(B);
    if (!lista.length) return;
    ev(B, aqui(u, { e: 'bellotas' }));
    for (const r of lista) G().dana(B, u, r, u.dano * E(B).bellotas.mult, 'bellota', true);
  }
  function vidente(B, u) {
    ev(B, aqui(u, { e: 'habilidad', hab: 'vidente' }));
    for (const a of BT().vivos(B, 'heroe')) if (a.vida < a.max) G().cura(B, a, a.max * E(B).vidente.cura, u);
  }
  // las habilidades que saltan cada pocos segundos (su `cada` está en los efectos)
  const PERIODO = { bellotas, embestida: empuja, vidente };
  function periodicas(B, u, dt) {
    for (const k of u.habilidades) {
      if (!PERIODO[k]) continue;
      u.leg.t[k] = (u.leg.t[k] || 0) + dt;
      if (u.leg.t[k] < E(B)[k].cada) continue;
      u.leg.t[k] = 0;
      PERIODO[k](B, u);
    }
  }
  function caduca(B, u) {
    u.muerta = true; u.vida = 0; u.anim = 'muerte'; u.tAnim = 0;
    ev(B, aqui(u, { e: 'minimapache', amo: u.amo, fin: true }));
  }
  const RELOJES = ['invisible', 'invul', 'muralla'];
  function relojes(B, u, dt) {
    for (const k of RELOJES) if (u[k] > 0) u[k] -= dt;
    if (u.vence > 0) { u.vence -= dt; if (u.vence <= 0) caduca(B, u); }
  }
  function fuegos(B, dt) {
    for (const z of B.fuegos) {
      z.t -= dt;
      for (const r of G().enArea(B, z.de, z.x, z.y, z.radio)) { G().quita(B, r, z.dps * dt, z.de); if (r.vida <= 0) G().muere(B, r, z.de); }
    }
    B.fuegos = B.fuegos.filter(z => z.t > 0);
  }
  function avanza(B, dt) {
    if (!B.hayLeg) return;
    for (const u of B.u) if (!u.muerta) relojes(B, u, dt);
    for (const u of leyendas(B)) periodicas(B, u, dt);
    fuegos(B, dt);
  }

  /* ---------- al elegir objetivo y al contar la prisa ---------- */
  // los enemigos no ven a los invisibles (Sombra)
  const visibles = (B, u, lista) => (B.hayLeg && u.lado === 'enemigo' ? lista.filter(r => !(r.invisible > 0)) : lista);
  // mientras dura la Muralla, todos los enemigos van a por él
  const forzado = (B, u, lista) => (B.hayLeg && u.lado === 'enemigo' ? lista.find(r => r.muralla > 0) || null : null);
  // Furia: cuanta menos vida, más deprisa le baja la espera entre ataques
  const prisa = (B, u) => (tieneCarta(u, 'furia') ? 1 + E(B).furia * (1 - Math.max(0, u.vida) / u.max) : 1);

  /* ---------- al pegar ---------- */
  const NADA = Object.freeze({ mult: 1, crit: false, mata: false });
  function mult(B, de, a) {
    let m = 1 + de.estandarte + (de.leg ? de.leg.guerra : 0);
    if (a.jefe && tieneCarta(de, 'matajefes')) m *= 1 + E(B).matajefes;
    if (B.malojo && de.lado === 'enemigo' && de.maldito > 0) m *= 1 - E(B).malojo;
    return m;
  }
  // el primer golpe del combate: crítico seguro con Sombra; con Sin Aviso mata a un enemigo normal (a un jefe o élite, crítico seguro)
  function primerGolpe(B, de, a) {
    const L = de.leg;
    if (!L) return NADA;
    const crit = L.sombra;
    L.sombra = false;
    if (!L.sinaviso) return { crit, mata: false };
    L.sinaviso = false;
    const normal = !a.jefe && !a.elite;
    if (normal) ev(B, aqui(de, { e: 'habilidad', hab: 'sinaviso', a: a.id }));
    return { crit: crit || !normal, mata: normal };
  }
  // lo que cambia un golpe de `de` a `a`: { mult, crit (seguro), mata (de golpe) }
  function mods(B, de, a) {
    if (!B.hayLeg || !de) return NADA;
    const p = primerGolpe(B, de, a);
    return { mult: mult(B, de, a), crit: p.crit, mata: p.mata };
  }
  // Escudo compartido: un aliado con la carta, cerca, se lleva parte del golpe que recibe un héroe; devuelve lo que le queda a `a`
  function reparte(B, a, d) {
    if (!B.hayLeg || a.lado !== 'heroe' || !d) return d;
    const C = E(B).escudo, g = leyendas(B).find(h => h !== a && h.cartas.includes('escudo') && !(h.invul > 0) && lejos(h, a) < C.radio);
    const parte = g ? Math.round(d * C.parte) : 0;
    if (!parte) return d;
    G().quita(B, g, parte, null);
    ev(B, aqui(g, { e: 'carta', carta: 'escudo', a: a.id }));
    if (g.vida <= 0) G().muere(B, g, null);
    return d - parte;
  }
  // Verdugo: el enemigo normal que queda con poca vida tras su golpe, muere
  function verdugo(B, de, a) {
    if (a.vida <= 0 || a.jefe || a.elite || !tieneCumbre(de, 'asesino') || a.vida >= a.max * E(B).verdugo) return;
    G().quita(B, a, a.vida, de);
    ev(B, aqui(de, { e: 'cumbre', cual: 'asesino', a: a.id }));
  }
  // el golpe que atraviesa (carta o Tormenta): también al enemigo más cercano detrás del objetivo (más lejos de los héroes)
  function atraviesa(B, de, a, dano, tipo) {
    const C = E(B).atraviesa;
    const r = BT().masCercano(a, BT().rivales(B, de).filter(o => o !== a && o.x > a.x && lejos(a, o) < C.detras));
    if (!r) return;
    G().dana(B, de, r, dano * C.parte, tipo, true);
    if (tieneCarta(de, 'atraviesa')) ev(B, aqui(r, { e: 'carta', carta: 'atraviesa', de: de.id }));
  }
  // después de un golpe de un legendario (no de rebote) a un enemigo
  function trasGolpe(B, de, a, dano, tipo) {
    if (!B.hayLeg || !de || !de.leg || a.lado === de.lado) return;
    verdugo(B, de, a);
    if (tieneCarta(de, 'atraviesa') || tieneCumbre(de, 'tirador')) atraviesa(B, de, a, dano, tipo);
  }
  // Bastión: al bajar de la mitad de vida, invulnerable unos segundos (una vez por combate)
  function bastion(B, a) {
    const C = E(B).bastion;
    if (!a.leg.bastion || a.vida <= 0 || a.vida >= a.max * C.umbral) return;
    a.leg.bastion = false; a.invul = C.dura;
    ev(B, aqui(a, { e: 'invulnerable', dura: C.dura }));
    ev(B, aqui(a, { e: 'cumbre', cual: 'tanque' }));
  }

  /* ---------- al atacar ---------- */
  // Tormenta: dos objetivos más (los más cercanos al suyo); sus golpes atraviesan (trasGolpe)
  function tormenta(B, u, ob) {
    if (u.ataque === 'cura') return;
    const otros = BT().rivales(B, u).filter(r => r !== ob).sort((a, b) => lejos(a, ob) - lejos(b, ob)).slice(0, E(B).tormenta.extra);
    for (const r of otros) { if (u.ataque === 'cuerpo') G().dana(B, u, r, u.dano); else G().dispara(B, u, r, 1, 0.05); }
    ev(B, aqui(u, { e: 'cumbre', cual: 'tirador', a: otros.map(r => r.id) }));
  }
  // Cataclismo: cada pocos ataques, un meteorito sobre el objetivo que aturde
  function cataclismo(B, u, ob) {
    const C = E(B).cataclismo;
    if (u.leg.atq % C.cada) return;
    ev(B, { e: 'meteorito', id: u.id, x: ob.x, y: ob.y, radio: C.radio });
    ev(B, aqui(u, { e: 'cumbre', cual: 'mago' }));
    for (const r of golpeArea(B, u, ob.x, ob.y, C.radio, C.mult, 'magia')) aturde(r, C.aturde);
  }
  // Abanico: cada pocos ataques, un tajo a todos los enemigos de delante
  function abanico(B, u) {
    const C = E(B).abanico;
    if (u.leg.atq % C.cada) return;
    const delante = BT().rivales(B, u).filter(r => r.x >= u.x && lejos(u, r) < C.radio);
    ev(B, aqui(u, { e: 'habilidad', hab: 'abanico', radio: C.radio }));
    for (const r of delante) G().dana(B, u, r, u.dano, 'cuerpo', true);
  }
  const ATAQUE = { tirador: tormenta, mago: cataclismo, abanico };
  function alAtacar(B, u, ob) {
    if (!u.leg) return;
    u.leg.atq++;
    if (ob.lado !== u.lado) for (const k of [...u.cumbres, ...u.habilidades]) if (ATAQUE[k]) ATAQUE[k](B, u, ob);
    if (u.cartas.includes('eco') && B.azar() < E(B).eco) { ev(B, aqui(u, { e: 'carta', carta: 'eco' })); G().golpea(B, u, ob); }
  }
  // Fuego: sus golpes de área dejan fuego en el suelo
  function golpeDeArea(B, u, x, y) {
    if (!B.hayLeg || !tieneHab(u, 'fuego')) return;
    const C = E(B).fuego;
    B.fuegos.push({ x, y, radio: C.radio, t: C.dura, dps: u.dano * C.dps, de: u });
    ev(B, { e: 'fuego', id: u.id, x, y, radio: C.radio, dura: C.dura });
  }

  /* ---------- al morir ---------- */
  function levanta(B, u, por, de) {
    u.vida = Math.round(u.max * E(B)[por]); u.tVeneno = 0; u.anim = 'reposo'; u.tAnim = 0;
    ev(B, aqui(u, { e: 'revive', por, de: de.id }));
  }
  // Segunda vida (la suya) u Oráculo (el primer aliado que cae): devuelve true si se levanta
  function revive(B, u) {
    if (!B.hayLeg || u.lado !== 'heroe' || u.extra) return false;
    if (u.leg && u.leg.segunda) {
      u.leg.segunda = false; levanta(B, u, 'segunda', u);
      ev(B, aqui(u, { e: 'carta', carta: 'segunda' }));
      return true;
    }
    const o = leyendas(B).find(h => h !== u && h.leg.oraculo);
    if (!o) return false;
    o.leg.oraculo = false; levanta(B, u, 'oraculo', o);
    ev(B, aqui(o, { e: 'cumbre', cual: 'sanador', a: u.id }));
    return true;
  }
  // Señor de la Plaga: la maldición del que muere pasa al enemigo vivo más cercano
  function plaga(B, u) {
    const r = BT().masCercano(u, enemigos(B));
    if (!r) return;
    r.maldito = Math.max(r.maldito, u.maldito);
    ev(B, aqui(u, { e: 'cumbre', cual: 'brujo', a: r.id }));
  }
  // Chatarra: del enemigo que cae sale un minimapache aliado que lucha unos segundos
  function minimapache(B, h, muerto) {
    const C = E(B).chatarra;
    if (B.u.filter(m => m.mini && !m.muerta && m.amo === h.id).length >= C.tope) return;
    const m = BT().unidad('heroe', h.tipo, { vida: Math.max(1, Math.round(h.max * C.parte)), dano: h.dano * C.parte, cada: C.cada, alcance: C.alcance, vel: C.vel,
      ataque: 'cuerpo', escala: C.escala, ref: h.ref }, muerto.x, muerto.y);
    Object.assign(m, { extra: true, mini: true, vence: C.dura, amo: h.id, cd: 0.2 });
    B.u.push(m);
    ev(B, aqui(m, { e: 'minimapache', amo: h.id }));
  }
  // Guadaña: al matar, se pone junto al siguiente enemigo y ataca ya
  function guadana(B, de) {
    const r = BT().masCercano(de, enemigos(B));
    if (!r) return;
    de.x = r.x - (de.radio + r.radio); de.y = r.y; de.cd = 0;
    ev(B, aqui(de, { e: 'habilidad', hab: 'guadana', a: r.id }));
  }
  function delMatador(B, de) {
    if (de.cartas.includes('cosecha')) { B.cosecha++; ev(B, aqui(de, { e: 'carta', carta: 'cosecha' })); }
    if (de.habilidades.includes('guadana') && !de.muerta) guadana(B, de);
  }
  function muereEnemigo(B, u, de) {
    for (const h of leyendas(B).filter(x => x.cumbres.includes('luchador'))) { h.leg.guerra += E(B).guerra; ev(B, aqui(h, { e: 'cumbre', cual: 'luchador', mas: h.leg.guerra })); }
    if (u.maldito > 0 && leyendas(B).some(x => x.cumbres.includes('brujo'))) plaga(B, u);
    for (const h of leyendas(B).filter(x => x.habilidades.includes('chatarra'))) minimapache(B, h, u);
    if (de && de.leg) delMatador(B, de);
  }
  // Juicio: al caer, explota
  function explota(B, u) {
    const C = E(B).juicio;
    ev(B, aqui(u, { e: 'explota', radio: C.radio }));
    golpeArea(B, u, u.x, u.y, C.radio, C.mult, 'magia');
  }
  function alMorir(B, u, de) {
    if (!B.hayLeg) return;
    if (u.lado === 'enemigo') muereEnemigo(B, u, de);
    else if (tieneHab(u, 'juicio')) explota(B, u);
  }

  return { empieza, avanza, visibles, forzado, prisa, mods, reparte, trasGolpe, bastion, alAtacar, golpeDeArea, revive, alMorir, aturde };
})();
