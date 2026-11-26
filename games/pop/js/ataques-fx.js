// Fans of Pop · ATAQUES DE LOS COMPAÑEROS, lo que se ve y se oye (tarea #160, ADR 197), tras el flag 'ataques-companeros'.
// Con el flag abierto, el compañero que salta vuela por su ruta PROPIA (revisión del 21-11-2026: un ataque por compañero), se
// estira al despegar (con su cara de siempre), deja una estela de su color llena de sus cositas, golpea con doble aro de luz,
// su golpe propio y una ráfaga de cositas y confeti, y el tablero se mece un poco (intensidad Fiesta), todo cozy y sin
// contorno, en el estilo fijo del compañero (hada o acuarela). Las cuentas están en js/ataques.js (PP_ATAQUE), el dibujo de
// cada estilo en js/ataques-estilos.js (PP_ATAQUE_ESTILO, con las piezas de js/ataques-piezas.js o los dibujos
// img-liso/fx-<pieza>.png de Yoshi si ya llegaron) y los golpes en js/ataques-golpes.js. Con el flag cerrado todo hace
// exactamente lo de siempre (ppFxImpacto y el sonido ppSalto). Lo engancha js/efectos.js (vuelo y avance), js/pintar.js
// (dibujo) y js/partida.js (golpe y sonido).
// Los que NO saltan (revisión del 25-11-2026, Pepins) lucen su ataque con luce(id, tipo): vuelan de su hueco a lo que tocan
// (la burbuja que marcan, el contador de la cabecera o el tablero: js/ataques-destino.js) y vuelven, con un golpe suave de su
// estilo al llegar; el contador brilla un instante y la burbuja de la pista queda marcada con su aro de luz, su lupa (su primera
// cosita) y destellos que giran mientras siga la pista. Solo se ve: lo llaman junto a ppFxHabilidad sin tocar lo que hace la habilidad.
'use strict';
const PP_ATAQUE_FX = (() => {
  const estado = { parts: [], puntos: [], golpes: [], brillos: [], marca: null };
  const activo = () => NUCLEO.flag('ataques-companeros', 'Pop: ataques de los compañeros con estela y golpe propios (tarea #160)', false);
  // el ataque de un compañero: su habilidad (la ficha del álbum) y su color, por si no tiene fila de cositas
  function ataqueDe(id) {
    const info = PP_COMP.INFO[id], sl = ppSlimeDe(id) || {};
    return PP_ATAQUE.de(id, info ? info.hab : null, sl.color2 || sl.color || '#ffffff');
  }
  function limpia() { estado.parts = []; estado.puntos = []; estado.golpes = []; estado.brillos = []; estado.marca = null; }
  // un vuelo nuevo (lo crea ppFxVuelo): con el flag abierto lleva su ataque; cerrado no se toca
  function prepara(v) { if (activo()) { v.ataque = ataqueDe(v.id); v.acc = 0; } }
  const caja = () => ({ ancho: 540, alto: PP_V.H });
  function punto(v) {
    const a = { x: v.x0, y: v.y0 }, b = { x: v.x1, y: v.y1 }, u = v.t / v.dur;
    return v.luce ? PP_ATAQUE_DESTINO.ruta(v.ataque.vuelo, a, b, u, caja()) : PP_ATAQUE.ruta(v.ataque.vuelo, a, b, u);
  }
  // la estela sale en el vuelo de los que saltan y en la ida de los que lucen (a la vuelta, limpio)
  const dejaEstela = v => v.ataque && v.t < v.dur && (!v.luce || v.t < v.dur * PP_ATAQUE_DESTINO.IDA);
  // la estela de un vuelo en este paso: un punto de luz (o de aguada) y las cositas que tocan, cada una con su mota de polvo
  function estela(v, dt) {
    const p = punto(v), e = PP_ATAQUE.emite(v.acc, dt, (v.luce ? PP_ATAQUE.INTENSIDAD.normal : PP_ATAQUE.FIESTA).porSegundo), a = v.ataque;   // los que lucen, más suave
    v.acc = e.acc;
    estado.puntos.push({ x: p.x, y: p.y, v: 1, rot: Math.random() * Math.PI * 2, col: PP_ATAQUE_ESTILO.pastel(a.color), estilo: a.estilo });
    for (let k = 0; k < e.n; k++) estado.parts.push(PP_ATAQUE.cosita(p.x, p.y, a, Math.random), PP_ATAQUE.polvo(p.x, p.y, a, Math.random));
  }
  function avanza(dt, vuelos) {
    for (const v of vuelos) if (dejaEstela(v)) estela(v, dt);
    for (const v of vuelos) if (v.luce && !v.luce.llego && v.t >= v.dur * PP_ATAQUE_DESTINO.IDA) llega(v);
    estado.parts = PP_ATAQUE.avanzaCositas(estado.parts, dt);
    for (const b of estado.brillos) b.t += dt;
    estado.brillos = estado.brillos.filter(b => b.t < b.dur);
    avanzaMarca(dt);
    for (const q of estado.puntos) q.v -= dt * PP_ATAQUE_ESTILO.DESVANECE[q.estilo];
    estado.puntos = estado.puntos.filter(q => q.v > 0);
    for (const g of estado.golpes) g.t += dt;
    estado.golpes = estado.golpes.filter(g => g.t < g.dur);
  }
  // el golpe del compañero `id` al llegar a la burbuja i; con el flag cerrado, el de siempre
  function golpe(T, i, id) {
    if (!activo()) return ppFxImpacto(T, i, id === 'ceo');
    const a = ataqueDe(id), g = PP_ATAQUE.golpe(a.golpe, id === 'ceo'), [x, y] = ppCentro(ppGeom(T.n), i);
    estado.golpes.push(...PP_ATAQUE_GOLPES.golpes(x, y, g, a, Math.random));
    estado.parts.push(...PP_ATAQUE.rafaga(x, y, g, a, Math.random));
    PP_FX.temblor = Math.max(PP_FX.temblor, g.temblor);
    ppVibra(id === 'ceo' ? [40, 30, 60] : 30);
  }
  // el sonido al despegar: el de la forma si sonidos.js lo tiene; si no (o con el flag cerrado), el salto de siempre
  function suena(id) {
    const s = activo() ? ataqueDe(id).sonido : null;
    play(s && typeof SFX[s] === 'function' ? s : 'ppSalto');
  }

  /* ---------- los que no saltan lucen su ataque hacia lo que tocan (js/ataques-destino.js) ---------- */
  const DUR_LUCE = 1.5;   // segundos de ida y vuelta
  const pantalla = () => (PP_PANT.actual === 'duelo' ? 'duelo' : 'sala');
  const tableroAhora = () => (pantalla() === 'duelo' ? typeof PP_DUELO !== 'undefined' && PP_DUELO && PP_DUELO.T : PP_P && PP_P.T) || null;
  // las burbujas que marca ahora la pista: la de los niveles (T.pista) o las de la jugada que gana en un nivel con duelo
  // (solo las que siguen arriba: en un duelo, la jugada que gana sigue en pistaNim hasta acabar el turno)
  function marcadas(T) {
    const m = T.pista !== null && T.pista !== undefined ? [T.pista] : (T.nim && T.nim.pistaNim) || [];
    return m.filter(i => !T.up || T.up[i]);
  }
  const deCelda = (T, i) => { const [x, y] = ppCentro(ppGeom(T.n), i); return { x, y }; };
  const centroTablero = T => { const g = ppGeom(T.n); return { x: g.x + g.lado / 2, y: g.y + g.lado / 2 }; };
  // de dónde sale: de su hueco del equipo si está a la vista; el CEO del duelo, de su cara; si no, desde abajo de la pantalla
  function origen(id, T) {
    if (id === 'ceo' && pantalla() === 'duelo') return { x: 400, y: 100 };
    const k = !T.nim && pantalla() === 'sala' ? ppEquipoNivel(T.d).indexOf(id) : -1;
    if (k < 0) return { x: 270, y: PP_V.H + 20 };
    const [x, y] = ppHuecoEquipo(k, T.n);
    return { x, y };
  }
  // adónde va y qué deja al llegar: el brillo del contador o la marca en las burbujas de la pista
  function destino(tipo, T, celda) {
    const zona = pantalla() === 'sala' && T.nim ? 'nim' : pantalla(), c = PP_ATAQUE_DESTINO.cabecera(tipo, zona), m = tipo === 'pista' ? marcadas(T) : [];
    if (c) return { b: c, brillo: true, marca: null };
    if (m.length) return { b: deCelda(T, m[0]), brillo: false, marca: m.slice() };
    return { b: celda === undefined ? centroTablero(T) : deCelda(T, celda), brillo: false, marca: null };
  }
  // el compañero `id` luce su ataque hacia lo que toca su habilidad (o `tipo`, si quien llama lo sabe mejor: el corazón del
  // Premio doble) o, en el tablero, hacia la burbuja `celda`. Con el flag cerrado no hace nada
  function luce(id, tipo, celda) {
    const T = tableroAhora();
    if (!activo() || !T) return;
    const info = PP_COMP.INFO[id], a = origen(id, T), d = destino(tipo || PP_ATAQUE_DESTINO.tipo(info ? info.hab : null), T, celda);
    PP_FX.vuelos.push({ id, x0: a.x, y0: a.y, x1: d.b.x, y1: d.b.y, t: 0, dur: DUR_LUCE, ataque: ataqueDe(id), acc: 0, luce: { brillo: d.brillo, marca: d.marca, T, llego: false } });
  }
  // al llegar: un golpe suave de su estilo (intensidad normal, sin temblor) y el brillo del contador o la marca de la pista
  function llega(v) {
    const a = v.ataque, g = PP_ATAQUE.golpe(a.golpe, false, PP_ATAQUE.INTENSIDAD.normal), L = v.luce;
    L.llego = true;
    estado.golpes.push(...PP_ATAQUE_GOLPES.golpes(v.x1, v.y1, g, a, Math.random));
    estado.parts.push(...PP_ATAQUE.rafaga(v.x1, v.y1, g, a, Math.random, PP_ATAQUE.INTENSIDAD.normal.tam));
    if (L.brillo) estado.brillos.push({ x: v.x1, y: v.y1, t: 0, dur: 0.9, col: PP_ATAQUE_ESTILO.pastel(a.color), estilo: a.estilo });
    if (L.marca) estado.marca = { celdas: L.marca, T: L.T, ataque: a, t: 0 };
  }
  // la marca dura lo que dure la pista en alguna de sus burbujas (y en el mismo tablero)
  const sigueMarca = m => m.T === tableroAhora() && m.celdas.some(i => marcadas(m.T).includes(i));
  function avanzaMarca(dt) {
    if (!estado.marca) return;
    estado.marca.t += dt;
    if (!sigueMarca(estado.marca)) estado.marca = null;
  }

  /* ---------- dibujo (en el estilo de cada compañero: js/ataques-estilos.js) ---------- */
  // detrás el manchón de aguada; luego la estela, las cositas y delante los aros y el dibujo propio de cada golpe
  function pinta(c) {
    const E = PP_ATAQUE_ESTILO, G = PP_ATAQUE_GOLPES;
    for (const g of estado.golpes) if (g.fondo) G.pinta(c, g);
    for (const q of estado.puntos) E.pintaPunto(c, q);
    for (const p of estado.parts) E.pintaCosita(c, p);
    for (const g of estado.golpes) if (!g.fondo) G.pinta(c, g);
    for (const b of estado.brillos) pintaBrillo(c, b);
    if (estado.marca && sigueMarca(estado.marca)) pintaMarca(c, estado.marca);
  }
  const escala = c => { const m = c.getTransform(); return Math.hypot(m.a, m.b) || 1; };
  // el contador que recibe el ataque brilla un instante: un punto de luz (o de aguada) y un aro que se abre
  function pintaBrillo(c, b) {
    const E = PP_ATAQUE_ESTILO, u = b.t / b.dur, e = 1 - Math.pow(1 - u, 3), al = Math.pow(1 - u, 1.5);
    E.pon(c, E.mancha(b.estilo, b.col), b.x, b.y, 30 * (0.7 + 0.3 * e), 0, al * 0.6);
    c.save(); c.translate(b.x, b.y); c.globalAlpha = al;
    E.aroDeLuz(c, b.estilo, 22 + 30 * e, b.col, 6 * (1 - e) + 2, escala(c));
    c.restore();
  }
  // la burbuja marcada (como en el boceto cozy de Lola): un resplandor, su aro de luz que late, destellos que giran y la lupa
  // (la primera cosita del compañero) flotando arriba a la derecha
  function pintaMarca(c, m) {
    const E = PP_ATAQUE_ESTILO, a = m.ataque, r = ppGeom(m.T.n).celda * 0.4, ent = Math.min(1, m.t / 0.35), pulso = 1 + 0.05 * Math.sin(m.t * 4);
    const hada = a.estilo !== 'acuarela', n = hada ? 5 : 3, ahora = marcadas(m.T);
    for (const i of m.celdas) {
      if (!ahora.includes(i)) continue;
      const p = deCelda(m.T, i);
      E.pon(c, E.mancha(a.estilo, '#ffe08a'), p.x, p.y, r * 0.75 * ent, 0, hada ? 0.55 : 0.45);
      c.save(); c.translate(p.x, p.y);
      E.aroDeLuz(c, a.estilo, (r + 8) * pulso * ent, E.pastel(a.color), 10, escala(c));   // su aro de luz, de su color
      E.aroDeLuz(c, a.estilo, (r + 8) * pulso * ent, '#ffd45c', 4, escala(c));
      c.restore();
      for (let k = 0; k < n; k++) {
        const ang = m.t * 1.2 + k * Math.PI * 2 / n, rr = (r + 18) * ent, tw = 0.75 + 0.25 * Math.sin(m.t * 5 + k * 1.7);
        E.pon(c, E.sprite(a.estilo, 'destello', E.pastel(a.color)), p.x + Math.cos(ang) * rr, p.y + Math.sin(ang) * rr, r * 0.45 * tw, 0, ent * tw);
      }
      E.pon(c, E.sprite(a.estilo, a.piezas[0], E.pastel(a.color)), p.x + r * 0.6, p.y - r * 0.75 + Math.sin(m.t * 2.5) * 3, r * 0.6 * ent, -0.3, ent);
    }
  }
  // lo que lleva de despegue (para el estirón: los que lucen despegan una vez, a la ida) y cuánto ha crecido en el aire (0 a 1)
  const despegue = (v, u) => { if (!v.luce) return u; const r = PP_ATAQUE_DESTINO.tramo(u); return r.ida ? r.k : 1; };
  function crece(v, u) {
    if (!v.luce) return Math.sin(u * Math.PI);
    const r = PP_ATAQUE_DESTINO.tramo(u);
    return r.ida ? Math.sin(r.k * Math.PI / 2) : Math.cos(r.k * Math.PI / 2);
  }
  // el compañero en el aire: por su ruta, girando lo que diga y estirado al despegar, con su cara de siempre
  function pintaVuelo(c, v, t) {
    const u = Math.min(1, v.t / v.dur), p = punto(v), [sx, sy] = PP_ATAQUE.estira(despegue(v, u));
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(sx, sy);
    ppSlimeRepuestoOImagen(c, v.id, 0, 0, 34 + crece(v, u) * 10, t, 1);
    c.restore();
  }
  return Object.freeze({ activo, ataqueDe, limpia, prepara, avanza, golpe, suena, luce, pinta, pintaVuelo, estado });
})();
