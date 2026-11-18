// Fans of Spy · ADAPTADORES · La escena: pinta una imagen entera del parking a partir de la vista (animacion.js): el escenario fijo,
// el agente (o su caja de mudanza con las orejas asomando), los Becarios con los ojos del color de su estado y su marca de «!» o
// «?», las cámaras, los cafés y, por encima, todo lo translúcido: los conos de visión (azul tranquilo, amarillo sospecha, rojo
// alerta, verde agua las cámaras), hacia dónde mira cada guardia, las casillas a las que se puede ir, el camino elegido (en rojo
// donde lo verían), el alcance del ruido, las ondas, las sombras y los haces de la meta y de la casilla que señala Lola.
// E = { planta, mundo, vis, cam, marcas, verConos }.
'use strict';
var SPY = globalThis.SPY || (globalThis.SPY = {});
(function (S) {
  const GL = S.gl, M = GL.M, R = S.rejilla;
  const COLOR = { tranquilo: [0.3, 0.72, 1], vuelve: [0.3, 0.72, 1], sospecha: [1, 0.8, 0.2], mira: [1, 0.8, 0.2], alerta: [1, 0.25, 0.22], cafe: [0.85, 0.55, 0.3], derribado: [0.16, 0.18, 0.24], camara: [0.12, 0.85, 0.7] };
  const IDENT = M.ident(), NIEBLA = [0.03, 0.045, 0.1], cache = new Map(), tintes = new Map();
  const con = (c, a) => [c[0], c[1], c[2], a];
  const tinte = (c) => { const k = c.join(); if (!tintes.has(k)) tintes.set(k, new Float32Array([c[0], c[1], c[2], 1])); return tintes.get(k); };
  const PERSONAJE = new Float32Array([1, 1, 1, 0.9]);   // los personajes llevan algo de luz propia para destacar en la penumbra
  const miran = (g) => g.estado !== 'derribado' && g.estado !== 'cafe';

  // La cámara y las luces de esta imagen: los 6 focos más cercanos a donde se mira y un temblor si acaban de pegar al agente.
  function luces(E) {
    const cam = E.cam, v = E.vis, cx = cam.x + cam.dx, cz = cam.z + cam.dz, focos = new Float32Array(24);
    const cerca = E.mundo.focos.slice().sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz)).slice(0, 6);
    cerca.forEach((f, i) => focos.set([f[0], 0, f[1], f[2]], i * 4));
    const tiembla = v.temblor > 0 ? M.traslada(Math.sin(v.t * 71) * v.temblor * 0.09, 0, Math.cos(v.t * 53) * v.temblor * 0.09) : IDENT;
    return { vp: M.mul(cam.vp, tiembla), ojo: cam.ojo, dir: GL.V.norma([-0.45, 0.8, 0.5]), ambiente: [0.4, 0.46, 0.7], niebla: NIEBLA, nieblaD: [cam.dist + 5, cam.dist + 22], focos, grosor: 0.022 };
  }

  function pintaCaja(E, a) {
    const t = E.vis.t;
    GL.pinta(S.modelos.caja, M.une(M.traslada(a.x, (1 - a.caja) * 1.2, a.z), M.rotaY(a.giro)), PERSONAJE);
    if (a.caja > 0.9) GL.pinta(S.modelos.orejas, M.une(M.traslada(a.x, 0.45 + Math.sin(t * 5) * 0.012, a.z), M.rotaY(a.giro + Math.sin(t * 1.3) * 0.2)), PERSONAJE);
  }
  function pintaAgente(E) {
    const a = E.vis.agente, mo = S.modelos.agente, t = E.vis.t;
    if (a.caja > 0.02) pintaCaja(E, a);
    if (a.caja > 0.6) return;
    const amplitud = { anda: 0.55, corre: 0.9, puntillas: 0.3 }[a.modo] || 0;
    const zanca = Math.sin(a.fase) * amplitud, bote = amplitud ? Math.abs(Math.sin(a.fase)) * 0.045 : Math.sin(t * 2.4) * 0.008;
    const base = M.une(M.traslada(a.x, bote, a.z), M.rotaY(a.giro), M.escala(1, a.modo === 'puntillas' ? 0.9 : 1, 1), M.rotaX(a.modo === 'corre' ? -0.22 : 0));
    GL.pinta(mo.cuerpo, base, PERSONAJE);
    GL.pinta(mo.brazoI, M.une(base, M.traslada(-mo.hombro[0], mo.hombro[1], 0), M.rotaX(zanca)), PERSONAJE);
    GL.pinta(mo.brazoD, M.une(base, M.traslada(mo.hombro[0], mo.hombro[1], 0), M.rotaX(-zanca * 0.4)), PERSONAJE);
    for (const s of [-1, 1]) GL.pinta(mo.pierna, M.une(base, M.traslada(s * mo.cadera[0], mo.cadera[1], 0), M.rotaX(s * zanca)), PERSONAJE);
  }

  // Las estrellitas que dan vueltas sobre un guardia tumbado.
  function estrellas(x, y, z, t, a) {
    for (let i = 0; i < 3; i++) {
      const giro = t * 3.2 + i * Math.PI * 2 / 3, px = x + Math.cos(giro) * 0.24, pz = z + Math.sin(giro) * 0.24, r = 0.075, c = [1, 0.85, 0.25, a];
      GL.tri([px - r, y, pz], [px, y, pz - r], [px + r, y, pz], c); GL.tri([px - r, y, pz], [px + r, y, pz], [px, y, pz + r], c);
    }
  }

  function pintaGuardia(E, g) {
    if (g.fuera > 0.97) return;
    const mo = S.modelos.becario, t = E.vis.t, vigilante = g.tipo === 'vigilante', k = (vigilante ? 1.1 : 1) * (1 - g.fuera);
    const d = R.DIRS[g.dir], empuje = g.embiste * 0.28, enPatinete = g.patinete && g.caido < 0.5, alto = enPatinete ? 0.075 : 0;
    const base = M.une(M.traslada(g.x + d.x * empuje, alto + g.caido * 0.17, g.z + d.y * empuje), M.rotaY(g.giro), M.rotaX(g.caido * Math.PI / 2), M.escala(k, k, k));
    const zanca = g.anda && !g.patinete ? Math.sin(g.fase) * 0.5 : 0;
    GL.pinta(mo.cuerpo, base, PERSONAJE);
    GL.pinta(mo.ojos, base, tinte(COLOR[g.estado] || COLOR.tranquilo), true);
    if (vigilante) GL.pinta(mo.gorra, base, PERSONAJE);
    GL.pinta(mo.brazoI, M.une(base, M.traslada(-mo.hombro[0], mo.hombro[1], 0), M.rotaX(zanca)), PERSONAJE);
    for (const s of [-1, 1]) GL.pinta(mo.pierna, M.une(base, M.traslada(s * mo.cadera[0], mo.cadera[1], 0), M.rotaX(-s * zanca)), PERSONAJE);
    if (enPatinete) GL.pinta(mo.patinete, M.une(M.traslada(g.x, 0, g.z), M.rotaY(g.giro)));
    if (g.caido > 0.5) estrellas(g.x - d.x * 0.25, 0.62, g.z - d.y * 0.25, t, 1 - g.fuera);
    pintaSenal(E, g, 1.22 + alto);
  }
  // Lo que lleva un guardia encima de la cabeza según su estado: «!» en alerta y «?» si sospecha. Mira siempre a la cámara.
  const SENAL = { alerta: 'exclama', sospecha: 'duda', mira: 'duda' };
  function pintaSenal(E, g, alto) {
    const modelo = S.modelos[SENAL[g.estado]];
    if (modelo) GL.pinta(modelo, M.une(M.traslada(g.x, alto + Math.sin(E.vis.t * 6) * 0.03, g.z), M.rotaY(E.cam.giro), M.escala(1.25, 1.25, 1.25)), tinte(COLOR[g.estado]));
  }

  // Lo que ve un vigía tal como está en pantalla (se guarda mientras no cambie de casilla ni de dirección).
  function conoDe(E, id, x, z, dir, ojos) {
    const clave = [E.planta.id, id, Math.floor(x), Math.floor(z), dir].join();
    if (!cache.has(clave)) {
      if (cache.size > 400) cache.clear();
      const celdas = S.vision.celdas(E.planta, { x: Math.floor(x), y: Math.floor(z), dir, alcance: ojos.alcance, apertura: ojos.apertura });
      cache.set(clave, { celdas, bordes: bordesDe(celdas) });
    }
    return cache.get(clave);
  }
  // El borde de una mancha de casillas: una tira fina por cada lado que no toca a otra casilla de la mancha.
  function bordesDe(celdas) {
    const dentro = new Set(celdas.map((q) => R.clave(q.x, q.y))), bordes = [], g = 0.08;
    for (const q of celdas) {
      if (!dentro.has(R.clave(q.x, q.y - 1))) bordes.push([q.x, q.y, q.x + 1, q.y + g]);
      if (!dentro.has(R.clave(q.x, q.y + 1))) bordes.push([q.x, q.y + 1 - g, q.x + 1, q.y + 1]);
      if (!dentro.has(R.clave(q.x - 1, q.y))) bordes.push([q.x, q.y, q.x + g, q.y + 1]);
      if (!dentro.has(R.clave(q.x + 1, q.y))) bordes.push([q.x + 1 - g, q.y, q.x + 1, q.y + 1]);
    }
    return bordes;
  }
  // Un cono de visión: la mancha entera de su color, que late un poco, y su borde bien marcado.
  function pintaCono(E, cono, color) {
    const a = 0.3 + Math.sin(E.vis.t * 3) * 0.05;
    for (const q of cono.celdas) GL.suelo(q.x, q.y, q.x + 1, q.y + 1, 0.014, con(color, a));
    for (const b of cono.bordes) GL.suelo(b[0], b[1], b[2], b[3], 0.018, con(color, 0.95));
  }
  // La punta de flecha en el suelo que dice hacia dónde mira un guardia: se ve siempre, aunque no se vean los conos.
  function pintaMirada(g) {
    const d = R.DIRS[g.dir], l = Math.hypot(d.x, d.y), dx = d.x / l, dz = d.y / l, c = con(COLOR[g.estado] || COLOR.tranquilo, 0.85);
    GL.tri([g.x + dx * 0.8, 0.02, g.z + dz * 0.8], [g.x + dx * 0.42 - dz * 0.2, 0.02, g.z + dz * 0.42 + dx * 0.2], [g.x + dx * 0.42 + dz * 0.2, 0.02, g.z + dz * 0.42 - dx * 0.2], c);
  }
  function pintaVigias(E) {
    const aj = S.AJ;
    for (const g of E.vis.guardias.values()) {
      if (g.fuera < 0.9) GL.anillo(g.x, g.z, 0, 0.27, 0.011, [0, 0, 0, 0.35 * (1 - g.fuera)], 14);
      if (!miran(g)) continue;
      pintaMirada(g);
      if (E.verConos) pintaCono(E, conoDe(E, g.id, g.x, g.z, g.dir, aj.guardias[g.tipo]), COLOR[g.estado] || COLOR.tranquilo);
    }
    for (const c of E.vis.camaras.values()) if (E.verConos) pintaCono(E, conoDe(E, c.id, c.x, c.z, c.dir, aj.camara), COLOR.camara);
  }

  // Lo que marca la pantalla al elegir una carta: a dónde se puede ir, el camino, a quién se puede atacar y hasta dónde llega el ruido.
  function pintaMarcas(E) {
    const m = E.marcas, t = E.vis.t, late = 0.5 + Math.sin(t * 6) * 0.5;
    for (const q of m.celdas) GL.suelo(q.x + 0.14, q.y + 0.14, q.x + 0.86, q.y + 0.86, 0.018, [0.25, 0.85, 1, 0.2 + late * 0.06]);
    for (const q of m.camino) {
      const visto = q.ven.length > 0, r = visto ? 0.2 : 0.11;
      GL.suelo(q.x + 0.5 - r, q.y + 0.5 - r, q.x + 0.5 + r, q.y + 0.5 + r, 0.022, visto ? [1, 0.2, 0.2, 0.95] : [1, 1, 1, 0.9]);
    }
    if (m.destino) GL.anillo(m.destino.x + 0.5, m.destino.y + 0.5, 0.3, 0.44, 0.024, [1, 0.82, 0.25, 0.95]);
    for (const g of m.guardias) GL.anillo(g.x + 0.5, g.y + 0.5, 0.36, 0.48, 0.024, m.guardia === g.id ? [1, 0.82, 0.25, 1] : [1, 0.35, 0.3, 0.55 + late * 0.4]);
    if (m.ruido) {
      const r = m.ruido, x0 = r.x - r.radio, x1 = r.x + r.radio + 1, z0 = r.y - r.radio, z1 = r.y + r.radio + 1, c = [1, 0.55, 0.12, 0.85], g = 0.07;
      GL.suelo(x0, z0, x1, z1, 0.016, [1, 0.55, 0.12, 0.07]);
      GL.suelo(x0, z0, x1, z0 + g, 0.02, c); GL.suelo(x0, z1 - g, x1, z1, 0.02, c); GL.suelo(x0, z0, x0 + g, z1, 0.02, c); GL.suelo(x1 - g, z0, x1, z1, 0.02, c);
    }
    if (m.guia) {
      GL.anillo(m.guia.x + 0.5, m.guia.y + 0.5, 0.32 + late * 0.06, 0.46 + late * 0.06, 0.026, [1, 0.82, 0.25, 0.95]);
      GL.haz(m.guia.x + 0.5, m.guia.y + 0.5, 0.26, 1.5, [1, 0.82, 0.25, 0.4]);
    }
  }

  function pintaSueltos(E) {
    const v = E.vis, t = v.t, meta = E.planta.meta;
    GL.haz(meta.x + 0.5, meta.y + 0.6, 0.34, 1.9, [0.24, 1, 0.6, 0.3 + Math.sin(t * 2.5) * 0.06]);
    GL.anillo(v.agente.x, v.agente.z, 0, 0.29, 0.011, [0, 0, 0, 0.38], 14);
    for (const o of v.objetos) GL.anillo(o.x, o.z, 0.2, 0.28 + Math.sin(t * 4) * 0.03, 0.016, [1, 0.6, 0.2, 0.7]);
    for (const o of v.ondas) { const k = o.t / o.dur, r = o.radio * (1 - (1 - k) * (1 - k)); GL.anillo(o.x, o.z, r * 0.84, r, 0.03, con(o.color, (1 - k) * 0.9)); }
    for (const s of E.secretos) if (!s.hecho) GL.anillo(s.x + 0.5, s.y + 0.5, 0.52, 0.58 + Math.sin(t * 3) * 0.03, 0.02, [1, 0.82, 0.25, 0.5]);
  }

  // Pinta la imagen entera.
  function pinta(E) {
    const v = E.vis;
    GL.empieza(luces(E));
    GL.pinta(E.mundo.malla, IDENT);
    pintaAgente(E);
    for (const g of v.guardias.values()) pintaGuardia(E, g);
    for (const c of v.camaras.values()) GL.pinta(S.modelos.camara, M.une(M.traslada(c.x, 1.45, c.z), M.rotaY(c.giro)));
    for (const o of v.objetos) GL.pinta(S.modelos.cafe, M.traslada(o.x, 0, o.z));
    if (v.bala) { const b = v.bala; GL.pinta(S.modelos.pelota, M.traslada(b.x0 + (b.x1 - b.x0) * b.k, 0.45 + Math.sin(b.k * Math.PI) * 0.3, b.z0 + (b.z1 - b.z0) * b.k), null, true); }
    pintaVigias(E);
    pintaMarcas(E);
    pintaSueltos(E);
    GL.pintaLote();
  }

  S.escena = Object.freeze({ pinta, COLOR });
})(SPY);
