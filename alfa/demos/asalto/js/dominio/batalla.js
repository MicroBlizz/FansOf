// Fans of Asalto · DOMINIO · La batalla de una oleada, automática y en tiempo real. El campo mide 540 x 420 (medidas de la batalla):
// los héroes salen de su hueco (a la izquierda) y los enemigos entran por la derecha, en tandas. Cada uno busca al rival más cercano,
// anda hasta tenerlo a tiro y ataca; los que «corren» van derechos a cruzar la línea de la izquierda, y cruzarla quita una vida.
// Los héroes AGUANTAN en su sitio hasta que el enemigo se acerca (la línea de carga) o pasa un momento: entonces cargan.
// La batalla no dibuja ni suena: apunta lo que pasa en B.eventos y la pantalla lo recoge. El azar se le pasa (B.azar).
// Aquí: crear la batalla y sus unidades, moverlas, elegir objetivo y decidir cuándo acaba. Los golpes están en batalla-golpes.js
// y los jefes en batalla-jefes.js.
'use strict';
AS.batalla = (() => {
  const CAMPO = { w: 540, h: 420, linea: 24, yMin: 72, yMax: 404, carga: 330, espera: 1.0 };
  // los pies de cada hueco del campo: 0-2 el frente, 3-5 atrás
  const HUECOS = [[190, 120], [190, 240], [190, 360], [80, 120], [80, 240], [80, 360]];
  let ID = 0;

  function unidad(lado, tipo, c, x, y) {
    return { id: ++ID, lado, tipo, x, y, max: c.vida, vida: c.vida, dano: c.dano, cada: c.cada, alcance: c.alcance, vel: c.vel, area: c.area || 0, ataque: c.ataque,
      defensa: c.defensa || 0, critico: c.critico || 0, danoCrit: c.danoCrit || 0, reflejo: c.reflejo || 0, esquiva: c.esquiva || 0, salpica: c.salpica || 0,
      regenera: c.regenera || 0, roba: c.roba || 0, provoca: !!c.provoca, torbellino: c.torbellino || 0, dobleTiro: c.dobleTiro || 0, curaArea: c.curaArea || 0, maldice: c.maldice || 0,
      clases: c.clases || [], salto: !!c.salto, corre: !!c.corre, jefe: !!c.jefe, elite: !!c.elite, escala: c.escala || 1, radio: c.jefe ? 40 : c.elite ? 22 : 15, dorado: !!c.dorado, nivel: c.nivel || 0, ref: c.ref || null,
      cd: 0.4, anim: 'reposo', tAnim: 0, dura: 0.4, golpeYa: false, escudo: 0, veneno: 0, tVeneno: 0, lento: 0, maldito: 0, muerta: false, cruzo: false, ob: null, curaA: null };
  }
  function enemigo(B, e) {
    const jefe = e.jefe ? B.datos.jefes[e.tipo] : null, d = jefe || B.datos.enemigos[e.tipo];
    const u = unidad('enemigo', e.tipo, { vida: Math.round(d.vida * e.fuerza), dano: d.dano * Math.sqrt(e.fuerza), cada: d.cada, alcance: d.alcance, vel: d.vel, area: d.area,
      ataque: d.ataque, corre: d.corre, jefe: !!jefe, elite: e.elite, escala: e.elite ? 1.5 : 1 }, e.x, e.y);
    u.cd = 0.4 + B.azar() * 0.5;
    if (jefe) { u.golpes = jefe.golpes.map(g => ({ ...g, t: g.cada * 0.6 })); u.furia = jefe.furia; B.jefe = u; }
    return u;
  }
  // cfg: { datos, heroes: [{ hueco, cifras, ref }] (cifras de AS.poder), oleada (AS.oleadas.genera), nivel: clases activas, reliquias, azar }
  function crea(cfg) {
    const B = { datos: cfg.datos, azar: cfg.azar, t: 0, u: [], proy: [], avisos: [], eventos: [], cola: [], fin: null, tFin: 0, cruzados: 0, bajas: 0, oro: 0,
      nivel: cfg.nivel || {}, rel: new Set(cfg.reliquias || []), tHab: {}, jefe: null, oleada: cfg.oleada, tanda: 0, carga: false };
    for (const h of cfg.heroes) {
      const p = HUECOS[h.hueco], u = unidad('heroe', h.cifras.tipo, { ...h.cifras, ref: h.ref }, p[0], p[1]);
      u.cd = 0.3 + B.azar() * 0.5;
      if (B.rel.has('carton')) u.escudo = Math.round(u.max * 0.2);
      B.u.push(u);
    }
    for (const e of cfg.oleada.enemigos) { if (e.tanda === 0) B.u.push(enemigo(B, e)); else B.cola.push(e); }
    return B;
  }

  const vivos = (B, lado) => B.u.filter(u => !u.muerta && u.lado === lado);
  const rivales = (B, u) => vivos(B, u.lado === 'heroe' ? 'enemigo' : 'heroe');
  const valorClase = (B, k) => (B.nivel[k] ? B.datos.clases[k].v[B.nivel[k] - 1] : 0);
  const dist = (a, b) => Math.hypot(b.x - a.x, (b.y - a.y) * 1.3);
  function masCercano(u, lista) {
    let mejor = null, dm = 1e9;
    for (const r of lista) { const d = dist(u, r); if (d < dm) { dm = d; mejor = r; } }
    return mejor;
  }
  // a quién ataca: el asesino va a por el de más atrás; los enemigos, al guardián que provoca si lo tienen cerca; los tiradores, al que
  // corre hacia la línea; el resto, al más cercano
  function objetivo(B, u) {
    const lista = rivales(B, u);
    if (!lista.length) return null;
    if (u.salto) return lista.reduce((a, b) => ((u.lado === 'heroe' ? b.x > a.x : b.x < a.x) ? b : a));
    if (u.lado === 'enemigo') { const g = masCercano(u, lista.filter(r => r.provoca && dist(u, r) < 150)); if (g) return g; }
    // los que disparan de lejos van primero a por los que corren a cruzar la línea, si los tienen a tiro
    if (u.lado === 'heroe' && u.alcance > 100) { const c = masCercano(u, lista.filter(r => r.corre && dist(u, r) < u.alcance * 1.3)); if (c) return c; }
    return masCercano(u, lista);
  }
  function masHerido(B, lado) {
    let mejor = null, pm = 0.98;
    for (const a of vivos(B, lado)) { const p = a.vida / a.max; if (p < pm) { pm = p; mejor = a; } }
    return mejor;
  }

  // un enemigo cruza la línea: quita una vida y se va
  function cruza(B, u) {
    u.muerta = true; u.cruzo = true; u.vida = 0; B.cruzados++;
    B.eventos.push({ e: 'cruza', id: u.id, x: u.x, y: u.y, jefe: u.jefe });
    if (u.jefe) B.fin = 'derrota';
  }
  function anda(u, tx, ty, dt, prisa) {
    const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy) || 0.01, v = u.vel * prisa;
    u.x += dx / d * v * dt; u.y += dy / d * v * dt;
    if (u.anim !== 'andar') { u.anim = 'andar'; u.tAnim = 0; }
  }
  // un enemigo sin nadie a quien pegar (o de los que corren) va derecho a la línea
  function haciaLaLinea(B, u, dt, freno) {
    anda(u, -10, u.y, dt, freno);
    if (u.x <= CAMPO.linea) cruza(B, u);
  }
  function estados(B, u, dt) {
    if (u.tVeneno > 0) { u.tVeneno -= dt; u.vida -= u.veneno * dt; if (u.vida <= 0) { AS.golpes.muere(B, u); return false; } }
    if (u.lento > 0) u.lento -= dt;
    if (u.maldito > 0) u.maldito -= dt;
    const cura = u.regenera + (u.lado === 'heroe' && B.rel.has('tirita') ? 2 : 0);
    if (cura && u.vida < u.max) u.vida = Math.min(u.max, u.vida + u.max * cura / 100 * dt);
    return true;
  }
  function eligeObjetivo(B, u) {
    let ob = null;
    if (u.ataque === 'cura') { u.curaA = masHerido(B, u.lado); ob = u.curaA; }
    if (!ob) { u.curaA = null; ob = objetivo(B, u); }
    u.ob = ob;
    return ob;
  }
  const quieto = u => { if (u.anim !== 'reposo') { u.anim = 'reposo'; u.tAnim = 0; } };
  // los héroes cargan cuando un enemigo cruza la línea de carga o cuando ya han esperado bastante
  function miraCarga(B) {
    if (B.carga || (B.t < CAMPO.espera && !vivos(B, 'enemigo').some(e => e.x <= CAMPO.carga))) return;
    B.carga = true; B.eventos.push({ e: 'carga' });
  }
  function atacando(B, u) {
    if (!u.golpeYa && u.tAnim >= u.dura * 0.6) { u.golpeYa = true; AS.golpes.impacto(B, u); }
    if (u.tAnim >= u.dura) { u.anim = 'reposo'; u.tAnim = 0; }
  }
  function avanzaUnidad(B, u, dt) {
    u.tAnim += dt;
    if (u.muerta || !estados(B, u, dt)) return;
    if (u.anim === 'ataque') { atacando(B, u); return; }
    if (u.anim === 'golpe' && u.tAnim < 0.22) return;
    const freno = u.lento > 0 ? 0.6 : 1;
    u.cd -= dt * freno;
    if (u.corre) { haciaLaLinea(B, u, dt, freno); return; }
    const ob = eligeObjetivo(B, u);
    if (!ob) { if (u.lado === 'enemigo') haciaLaLinea(B, u, dt, freno); else quieto(u); return; }
    // a tiro: su alcance más lo que abultan los dos (un jefe es grande y se le pega desde más lejos)
    if (Math.hypot(ob.x - u.x, ob.y - u.y) > u.alcance + u.radio + ob.radio - 30) { if (u.lado === 'heroe' && !B.carga) quieto(u); else anda(u, ob.x, ob.y, dt, (u.salto ? 2.6 : 1) * freno); return; }
    u.salto = false;
    if (u.anim === 'andar') quieto(u);
    if (u.cd <= 0) { u.cd = u.cada; u.anim = 'ataque'; u.tAnim = 0; u.dura = Math.min(0.5, Math.max(0.3, u.cada * 0.5)); u.golpeYa = false; }
  }
  // que no se amontonen, y que nadie se salga del campo
  function separa(B, dt) {
    const v = B.u.filter(u => !u.muerta);
    for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) {
      const a = v[i], b = v[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.radio + b.radio;
      if (d >= min) continue;
      const p = (min - d) / 2 * Math.min(1, dt * 12), ka = a.jefe ? 0.1 : 1, kb = b.jefe ? 0.1 : 1;
      a.x -= dx / d * p * ka; a.y -= dy / d * p * ka; b.x += dx / d * p * kb; b.y += dy / d * p * kb;
    }
    for (const u of v) { u.y = Math.max(CAMPO.yMin, Math.min(CAMPO.yMax, u.y)); if (u.lado === 'heroe') u.x = Math.max(30, Math.min(CAMPO.w - 20, u.x)); }
  }
  function entraTanda(B) {
    const cada = B.datos.partida.tandaCada, toca = Math.floor(B.t / cada);
    if (!B.cola.length || toca <= B.tanda) return;
    B.tanda++;
    const ahora = B.cola.filter(e => e.tanda <= B.tanda);
    B.cola = B.cola.filter(e => e.tanda > B.tanda);
    for (const e of ahora) B.u.push(enemigo(B, { ...e, x: CAMPO.w + 30 + (e.x - 540) * 0.4 }));
    if (ahora.length) B.eventos.push({ e: 'tanda', n: ahora.length });
  }
  function miraFin(B) {
    if (!B.fin) {
      const quedan = vivos(B, 'enemigo').length + B.cola.length;
      if (!quedan) B.fin = 'victoria';
      else if (!vivos(B, 'heroe').length || B.t > B.datos.partida.limiteCombate) B.fin = 'derrota';
    }
    if (B.fin) B.eventos.push({ e: 'fin', fin: B.fin });
  }
  function avanza(B, dt) {
    B.t += dt;
    if (B.fin) { B.tFin += dt; for (const u of B.u) u.tAnim += dt; return; }
    entraTanda(B); miraCarga(B);
    for (const u of B.u) avanzaUnidad(B, u, dt);
    AS.golpes.habilidades(B, dt);
    if (B.jefe) { if (B.jefe.muerta) B.avisos = []; else AS.jefes.avanza(B, B.jefe, dt); }
    separa(B, dt);
    AS.golpes.proyectiles(B, dt);
    miraFin(B);
  }
  // lo que deja la batalla al acabar
  const resultado = B => ({ gano: B.fin === 'victoria', cruzados: B.cruzados, bajas: B.bajas, oro: B.oro, jefe: !!(B.jefe && B.jefe.muerta && !B.jefe.cruzo), duro: B.t,
    cruzoJefe: !!(B.jefe && B.jefe.cruzo), vivos: vivos(B, 'heroe').length });
  return { CAMPO, HUECOS, crea, avanza, resultado, vivos, rivales, valorClase, masHerido, masCercano, dist, enemigo };
})();
