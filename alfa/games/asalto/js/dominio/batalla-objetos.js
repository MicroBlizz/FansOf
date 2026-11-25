// Fans of Asalto · DOMINIO · Los objetos de la tienda dentro de la batalla. Dos fuentes: los efectos del equipo entero (B.ef, de
// AS.objetos.efectos: escudo al empezar, vida por filas, carga de hechizos, Reloj, Cuerno, ira, segunda oportunidad, contrato, mártir,
// confeti y eco de hechizos) y lo que cada héroe trae en sus cifras (u.ex, de poder.js: primer golpe, quemar, envenenar, atontar, frenar,
// rayo en cadena, espejo, lupa, rabia, vela y cura). Cada mecánica es una entrada de una tabla; batalla.js y batalla-golpes.js solo
// llaman a estos ganchos. Las cifras fijas están en ASALTO.efectosObjetos. Puro: el azar es B.azar.
'use strict';
AS.objetosBatalla = (() => {
  const K = B => B.datos.efectosObjetos;
  const ef = (B, k) => (B.ef[k] ? B.ef[k].v : 0);
  const exDe = u => u.ex || {};
  const delante = hueco => hueco < 3;

  /* ---------- al crear la batalla ---------- */
  // lo de todo el equipo que se gasta durante el combate
  function prepara(B, efectos) {
    B.ef = efectos || {};
    B.ira = 0; B.contratos = ef(B, 'contrato'); B.segunda = ef(B, 'segunda') > 0;
  }
  // un héroe entra en el campo por su hueco: vida de su fila y el escudo del Pósit
  function entra(B, u, hueco) {
    const fila = ef(B, delante(hueco) ? 'delante' : 'atras');
    if (fila) { u.max = Math.round(u.max * (1 + fila / 100)); u.vida = u.max; }
    const posit = ef(B, 'posit');
    if (posit) u.escudo = Math.max(u.escudo, Math.round(u.max * posit / 100));
  }

  /* ---------- el daño que hace un héroe ---------- */
  // lo que suma cada mecánica al golpe de `de` contra `a` (en tanto por uno)
  const MAS = [
    (B) => (B.t < K(B).cuerno ? ef(B, 'cuerno') / 100 : 0),
    (B) => Math.min(B.ira, B.ef.ira ? B.ef.ira.w : 0) / 100,
    (B, de, a) => (a.elite || a.jefe ? exDe(de).lupa || 0 : 0),
    (B, de) => (de.vida < de.max / 2 ? exDe(de).rabia || 0 : 0),
    (B, de) => (de.pego ? 0 : (exDe(de).primero || 0) + (exDe(de).primeroCrit || 0)),
  ];
  // el multiplicador del golpe y si es crítico seguro (la Capa de sombras en el primer golpe del asesino)
  function golpe(B, de, a) {
    if (!de || de.lado !== 'heroe') return { k: 1, crit: false };
    let k = 1;
    for (const f of MAS) k += f(B, de, a);
    return { k, crit: !de.pego && !!exDe(de).primeroCrit };
  }
  // la prisa de más al cargar el ataque (el Reloj de arena, los primeros segundos)
  const prisa = (B, u) => (u.lado === 'heroe' && B.t < K(B).reloj ? 1 + ef(B, 'reloj') / 100 : 1);

  /* ---------- lo que deja un golpe que entra ---------- */
  const tope = (B, a) => (a.jefe ? K(B).jefe : 1);
  const SECUELA = {
    quema: (B, a, v) => { a.quema = Math.max(a.quema || 0, a.max * v * tope(B, a)); a.tQuema = K(B).quema; },
    envenena: (B, a, v, de) => { a.veneno = Math.max(a.tVeneno > 0 ? a.veneno : 0, a.max * v * tope(B, a)); a.tVeneno = K(B).veneno; a.venenoDe = de; },
    atonta: (B, a, v) => { if (!a.jefe && B.azar() < v) { a.atonito = K(B).atonta; B.eventos.push({ e: 'atonta', id: a.id, x: a.x, y: a.y }); } },
    frena: (B, a, v) => { a.lento = Math.max(a.lento, K(B).frena); a.frena = Math.max(a.frena || 0, v); },
  };
  function secuelas(B, de, a) {
    if (!de || de.lado !== 'heroe' || a.muerta) return;
    const x = exDe(de);
    for (const k in SECUELA) if (x[k]) SECUELA[k](B, a, x[k], de);
  }
  // el Espejo de feria: esquiva el golpe y se lo devuelve al que pega, como daño plano (igual que el reflejo: no es un ataque del
  // héroe, así que ni gasta su primer golpe ni lleva sus efectos). Devuelve si lo ha esquivado
  function espeja(B, de, a, dano) {
    const p = exDe(a).espejo;
    if (!p || !de || de.muerta || B.azar() >= p) return false;
    B.eventos.push({ e: 'esquiva', id: a.id, x: a.x, y: a.y, espejo: true });
    AS.golpes.quita(B, de, Math.max(1, Math.round(dano)), a);
    if (de.vida <= 0) AS.golpes.muere(B, de, a);
    return true;
  }
  // el Báculo de rayos: cada pocos ataques del mago, un rayo salta de enemigo en enemigo. Cuenta ataques (batalla-golpes.js lo llama
  // una vez por ataque, en impacto), no golpes: el golpe que repite la carta Eco no cuenta
  function ataca(B, u) {
    const n = exDe(u).cadena;
    if (!n) return;
    u.ataques = (u.ataques || 0) + 1;
    if (u.ataques % K(B).cadenaCada) return;
    let desde = u;
    for (const r of B.azar.baraja(AS.batalla.rivales(B, u)).slice(0, n)) {
      B.eventos.push({ e: 'rayo', x1: desde.x, y1: desde.y - 40, x2: r.x, y2: r.y - 30 });
      AS.golpes.dana(B, u, r, u.dano * K(B).cadenaDano, 'magia', true);
      desde = r;
    }
  }

  /* ---------- curas ---------- */
  // cuánto más cura un sanador (Incienso de bazar)
  const cura = (de, cant) => cant * (1 + (exDe(de || {}).cura || 0));
  // la Vela de cumpleaños: la cura que sobra se vuelve escudo, hasta su tope; un escudo que ya lo pasaba (el del tanque) no baja
  function sobra(B, a, cant, de) {
    const v = exDe(de || {}).vela, resto = cant - (a.max - a.vida), antes = a.escudo || 0;
    if (!v || resto <= 0) return;
    a.escudo = Math.max(antes, Math.min(Math.round(a.max * v), Math.round(antes + resto)));
  }

  /* ---------- estados por segundo ---------- */
  // la quemadura y el atontado; devuelve si la unidad sigue viva
  function estados(B, u, dt) {
    if (u.atonito > 0) u.atonito -= dt;
    if (u.lento <= 0) u.frena = 0;
    if (!(u.tQuema > 0)) return true;
    u.tQuema -= dt; AS.golpes.quita(B, u, u.quema * dt, null);
    if (u.vida > 0) return true;
    AS.golpes.muere(B, u, null);
    return u.vida > 0;
  }
  const atontado = u => u.atonito > 0;

  /* ---------- caer ---------- */
  // ¿se salva el héroe que iba a caer? El Contrato lo deja con 1 de vida (cada héroe una sola vez, hasta los héroes que dé) y, si no,
  // el Amuleto lo levanta una vez por oleada
  function salva(B, u) {
    if (u.lado !== 'heroe' || u.extra) return false;   // un señuelo o un minimapache de los legendarios no se salva
    if (B.contratos > 0 && !u.contratado) {
      B.contratos--; u.contratado = true; u.vida = 1;
      B.eventos.push({ e: 'salva', id: u.id, x: u.x, y: u.y, como: 'contrato' });
      return true;
    }
    if (!B.segunda) return false;
    B.segunda = false; u.vida = Math.max(1, Math.round(u.max * ef(B, 'segunda') / 100));
    B.eventos.push({ e: 'salva', id: u.id, x: u.x, y: u.y, como: 'segunda' });
    return true;
  }
  const CAE = {
    heroe: (B, u) => {
      const v = u.extra ? 0 : ef(B, 'martir');   // la caída de un señuelo o un minimapache no cuenta
      if (v) for (const a of AS.batalla.vivos(B, 'heroe')) AS.golpes.cura(B, a, a.max * v / 100, null);
    },
    enemigo: (B, u) => {
      if (B.ef.ira) B.ira += B.ef.ira.v;
      const v = ef(B, 'confeti');
      if (!v) return;
      B.eventos.push({ e: 'confeti', x: u.x, y: u.y, radio: K(B).confeti });
      for (const r of AS.batalla.vivos(B, 'enemigo')) if (Math.hypot(r.x - u.x, r.y - u.y) < K(B).confeti) confeti(B, r, v);
    },
  };
  function confeti(B, r, v) {
    AS.golpes.quita(B, r, Math.max(1, Math.round(r.max * v / 100 * tope(B, r))), null);
    if (r.vida <= 0) AS.golpes.muere(B, r, null);
  }
  const cae = (B, u) => CAE[u.lado](B, u);

  /* ---------- hechizos de clase ---------- */
  // la carga de los hechizos (Termo de café) y el eco del Grimorio prohibido para magos y brujos (en tanto por uno, 0 si no hay)
  const carga = B => 1 + ef(B, 'carga') / 100;
  const eco = (B, clase) => (clase === 'mago' || clase === 'brujo' ? ef(B, 'eco') / 100 : 0);

  return { prepara, entra, golpe, prisa, secuelas, espeja, ataca, cura, sobra, estados, atontado, salva, cae, carga, eco };
})();
