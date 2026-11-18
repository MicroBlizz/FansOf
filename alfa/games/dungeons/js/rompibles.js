// Fans of Dungeons · Lo que se rompe y la mochila que crece. Por las salas hay cajas de mudanza, papeleras, urnas y servidores
// viejos: se rompen de un golpe (o empujando a un enemigo contra ellos) y sueltan monedas, objetos… o un becario escondido.
// Y la Riñonera de merchandising: +6 huecos de mochila para siempre (de 18 hasta 30).
'use strict';

/* ---------- la mochila ---------- */
const MOCHILA_BASE = 18, MOCHILA_TOPE = 30, MOCHILA_PASO = 6;
const capacidad = h => (h && h.mochilaMax) || MOCHILA_BASE;
const CAP_CAFES = 12, BUGS_MAX = 3;   // los cafés y pergaminos van en su propio bolsillo: no quitan sitio a los objetos
const esConsumible = o => !!o && OBJETOS[o.id] && OBJETOS[o.id].tipo === 'consumible';
const indicesBolsillo = (h, cafes) => { const l = []; h.mochila.forEach((o, i) => { if (esConsumible(o) === cafes) l.push(i); }); return l; };
// ¿cabe este objeto? (cada bolsillo tiene su sitio)
const mochilaLlena = (h, o) => { const cafes = esConsumible(o); return indicesBolsillo(h, cafes).length >= (cafes ? CAP_CAFES : capacidad(h)); };
function amplia(h) {
  if (capacidad(h) >= MOCHILA_TOPE) { log(tr('Tu mochila ya no da más de sí. Ni con cinta americana.'), '#8c879a'); return false; }
  h.mochilaMax = capacidad(h) + MOCHILA_PASO;
  fxRotulo(fmt(tr('¡MOCHILA DE {n}!'), { n: h.mochilaMax }), '#ff9a2a'); fxExplosion(h.x, h.y, 0.5, '#ff9a2a');
  log(fmt(tr('Te pones la riñonera: ahora caben {n} cosas en la mochila.'), { n: h.mochilaMax }), '#ff9a2a');
  return true;
}

/* ---------- lo que se rompe ---------- */
const ROMPIBLES = ['caja', 'papelera', 'urna', 'servidor'];
const ROMPIBLE_NOMBRE = { caja: 'Caja de mudanza', papelera: 'Papelera', urna: 'Urna de juego cancelado', servidor: 'Servidor viejo' };
const ROMPIBLES_ZONA = { oficinas: [0, 1], cementerio: [2, 0], foro: [3, 1], azotea: [0, 3] };
const rompibleDe = (m, x, y) => ROMPIBLES[m.v[y * m.w + x]] || 'caja';

// el generador: unas cuantas cosas rompibles pegadas a las paredes de las salas, sin cortar nunca el paso
function ponRompibles(m, d, planta, out) {
  const ocupadas = new Set(out.ocupadas);
  for (const o of out.objetos) ocupadas.add(clave(o.x, o.y));
  for (const e of out.enemigos) ocupadas.add(clave(e.x, e.y));
  const cuenta = () => { const c = campoM(m, [[m.llegada.x, m.llegada.y]]); let n = 0; for (const v of c) if (v >= 0) n++; return n; };
  let total = cuenta();
  const tipos = ROMPIBLES_ZONA[m.zona] || [0, 1];
  for (const s of m.salas) {
    if (s.tipo === 'llegada' || s.tipo === 'jefe' || s.tipo === 'tienda' || s.tipo === 'altar' || s.tipo === 'maldita' || s.tipo === 'prision' || s.tipo === 'biblioteca') continue;
    const cas = d.baraja(casillasDe(m, s, T.SUELO).filter(([x, y]) => {
      if (ocupadas.has(clave(x, y)) || m.trampas.has(clave(x, y))) return false;
      let pared = false, estorba = false;
      for (const [dx, dy] of DIRS8) { const t = enM(m, x + dx, y + dy); if (t === T.MURO) pared = true; if (t === T.PUERTA || t === T.PUERTA_CERRADA || t === T.PUERTA_ABIERTA || t === T.SUBIDA || t === T.LLEGADA || t === T.ROMPIBLE) estorba = true; }
      return pared && !estorba;
    }));
    if (s.tipo !== 'tesoro' && !d.prob(0.55)) continue;   // no todas las salas tienen trastos
    const n = Math.min(cas.length, d.entre(1, s.w * s.h > 40 ? 3 : 2));
    for (let i = 0; i < n; i++) {
      const [x, y] = cas[i];
      if (enM(m, x, y) !== T.SUELO) continue;
      ponM(m, x, y, T.ROMPIBLE); m.v[y * m.w + x] = d.prob(0.65) ? tipos[0] : tipos[1];
      const ahora = cuenta();
      if (ahora < total - 1 || !todoComunicado(m)) { ponM(m, x, y, T.SUELO); continue; }   // cortaba el paso: fuera
      total = ahora; ocupadas.add(clave(x, y));
    }
  }
}
// romper: explosión de cartón, papeles o cerámica y lo que hubiera dentro
function rompe(x, y, quien) {
  const m = J.mapa, tipo = rompibleDe(m, x, y);
  ponM(m, x, y, T.SUELO); m.v[y * m.w + x] = 0; cuenta('rotos');
  fxEscombros(x, y, 10, 'rompible_' + tipo); fxExplosion(x, y, 0.45, '#c8a070'); sonido('golpe');
  TEMBLOR.t = Math.max(TEMBLOR.t, 0.08); TEMBLOR.f = 2;
  const h = J.heroe, r = D.f();
  if (r < 0.04 && J.planta >= 2) {   // sorpresa
    const e = nuevoEnemigo('becario', x, y, J.planta, false); e.despierto = true; J.enemigos.push(e);
    log(tr('¡Había un becario escondido dentro! Llevaba ahí desde la última reestructuración.'), '#ff9aa4'); sonido('jefe'); return;
  }
  if (r < 0.07 && capacidad(h) < MOCHILA_TOPE) { J.objetos.push({ x, y, obj: { id: 'rinonera', rar: 0 } }); log(tr('¡Una riñonera de merchandising! Más sitio en la mochila.'), '#ff9a2a'); return; }
  if (r < 0.22) { J.objetos.push({ x, y, obj: generaObjeto(J.planta, D) }); log(fmt(tr('Rompes {r}: había algo dentro.'), { r: tr(ROMPIBLE_NOMBRE[tipo]).toLowerCase() }), '#ffd040'); return; }
  if (r < 0.75) { const n = D.entre(2 + J.planta, 5 + J.planta * 2) * (hayMod('rico') ? 2 : 1); J.objetos.push({ x, y, obj: { id: 'monedas', n } }); fxMonedas(x, y, 4); return; }
  if (quien === h && D.prob(0.3)) log(D.elige([tr('Solo había facturas sin pagar.'), tr('Solo había currículums de gente despedida.'), tr('Estaba vacía. Como las promesas de Microblizz.')]), '#8c879a');
}

/* ---------- el dibujo ---------- */
function creaRompibles() {
  const P = PAL_OBJ, carton = pal5('#b08a5a', '#7a5a34', '#d4b080', '#3a2810'), cinta = pal5('#d8c8a0', '#a89870', '#f4ead0', '#5a4e30');
  const metal = pal5('#6a7088', '#454a5e', '#9aa0b8', '#1e2130'), barro = pal5('#8a5a48', '#5e3a2e', '#b07a64', '#2a160e');
  const torre = pal5('#3a3e4e', '#24273a', '#5a5f74', '#0e1018');
  icono('rompible_caja', 32, 40, p => {   // caja de mudanza con cinta y una flecha de «este lado arriba»
    p.parte(F.rr(-11, -21, 22, 19, 1), carton, { sombra: 2 });
    p.parte(F.re(-11, -22, 22, 3), carton, { sombra: 1 });
    p.plano(F.re(-2, -22, 4, 20), cinta.b); p.plano(F.re(-2, -22, 1, 20), cinta.l);
    p.plano(F.pol(-8, -11, -6, -14, -4, -11), carton.o); p.plano(F.re(-7, -11, 2, 4), carton.o);
    p.px(5, -9, carton.o); p.px(7, -8, carton.o); p.px(6, -12, carton.s);
  });
  icono('rompible_papelera', 32, 40, p => {   // papelera de rejilla llena de bolas de papel
    p.parte(F.pol(-9, -20, 9, -20, 7, -2, -7, -2), metal, { sombra: 2 });
    for (let x = -6; x <= 6; x += 3) p.plano(F.re(x, -18, 1, 15), metal.o);
    p.parte(F.re(-10, -21, 20, 2), metal, { sombra: 0 });
    for (const [x, y, r] of [[-4, -22, 3.5], [2, -23, 4], [6, -21, 2.5], [-1, -26, 3]]) p.parte(F.ov(x, y, r, r * 0.85), P.papel, { sombra: 1 });
  });
  icono('rompible_urna', 32, 40, p => {   // urna de barro con una grieta y el logo de un juego cancelado
    p.parte(F.ov(0, -11, 9, 9), barro, { sombra: 2 });
    p.parte(F.rr(-5, -24, 10, 6, 1.5), barro, { sombra: 1 });
    p.parte(F.re(-6, -25, 12, 2), barro, { sombra: 0 });
    p.plano(F.ov(0, -11, 4, 2.5), '#3a1e14'); p.px(-1, -11, '#c8a040'); p.px(1, -11, '#c8a040');
    for (const [x, y] of [[4, -17], [5, -15], [4, -13], [6, -12]]) p.px(x, y, '#1e0e08');
  });
  icono('rompible_servidor', 32, 40, p => {   // torre de servidor de hace veinte años, con un piloto que parpadea
    p.parte(F.rr(-8, -28, 16, 26, 1.5), torre, { sombra: 2 });
    for (let y = -25; y <= -15; y += 4) { p.plano(F.re(-6, y, 12, 2), torre.o); p.plano(F.re(-6, y, 12, 1), torre.l); }
    p.px(-5, -8, '#3fcf6a'); p.px(-3, -8, '#ff4b5c');
    for (let y = -11; y <= -5; y += 2) p.plano(F.re(1, y, 5, 1), torre.s);
  });
  icono('rinonera', 26, 26, p => {   // la riñonera naranja de merchandising, con su hebilla
    p.plano(F.re(-12, -11, 24, 2), '#2a2228');
    p.parte(F.ov(0, -8, 9, 6), pal5('#e8762a', '#a84a14', '#ffb070', '#4a1e06'), { sombra: 2 });
    p.plano(F.re(-6, -10, 12, 1), '#4a1e06'); p.plano(F.re(-1, -9, 3, 3), P.oro.b);
  });
  ESCOMBROS_COLOR.rompible_caja = ['#b08a5a', '#7a5a34', '#d8c8a0'];
  ESCOMBROS_COLOR.rompible_papelera = ['#6a7088', '#f4e6c2', '#c9b58a'];
  ESCOMBROS_COLOR.rompible_urna = ['#8a5a48', '#5e3a2e', '#b07a64'];
  ESCOMBROS_COLOR.rompible_servidor = ['#3a3e4e', '#5a5f74', '#3fcf6a'];
}
