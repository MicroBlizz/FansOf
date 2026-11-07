// Fans of Zombies · LAS HERIDAS (dominio, ADR 082): el cuerpo tiene 6 partes y cada una puede tener heridas (arañazo, corte, corte
// profundo, mordisco y fractura) en J.heridas = [{ id, parte, tipo, t, cura, venda, desinf, puntos, tablilla, tirado, protege }].
// Las heridas sangran hasta vendarlas (el corte profundo, hasta coserlo), se curan solas con el tiempo si la venda no está sucia, duelen
// (el dolor tiembla la puntería; los analgésicos lo quitan) y una hora después de hacerse se sabe si infectan (el desinfectante baja el
// riesgo). Pierna herida: vas más lento; brazo herido: pegas más flojo. Las cifras están en AJ.cuerpo.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  const PARTES = ['cabeza', 'torso', 'brazoI', 'brazoD', 'piernaI', 'piernaD'];
  Z.PARTES = PARTES;
  Z.heridasEn = (J, parte) => (J.heridas || []).filter((h) => h.parte === parte);

  // una herida nueva en una parte. protege = lo que la ropa de esa parte quita al riesgo de infección (se mira al hacerla)
  Z.hiere = function (AJ, e, parte, tipo, protege) {
    const J = e.jugador;
    if (!PARTES.includes(parte) || !AJ.cuerpo.heridas[tipo]) return Z.error('noEsHerida', { parte, tipo });
    if (!J.heridas) J.heridas = [];
    const h = { id: ++e.ultimoId, parte, tipo, t: 0, cura: 0, venda: null, desinf: false, puntos: false, tablilla: false, tirado: tipo === 'fractura', protege: protege || 0 };
    J.heridas.push(h);
    e.eventos.push({ tipo: 'herida', parte, herida: tipo });
    return Z.ok(h);
  };
  // un mordisco de un fan: dónde cae, si la ropa de esa parte lo para, qué herida deja y, si es la ballena, si te rompe algo.
  // Devuelve la parte (o null si la ropa lo ha parado del todo) para saber cuánto daño hace
  Z.muerdeEn = function (AJ, e, zb, azar) {
    const C = AJ.cuerpo, J = e.jugador, parte = Z.sortea(C.dondeMuerden, azar);
    if (azar() < Math.min(C.paraMax, Z.ropaEn(AJ, J, parte, 'para'))) { e.eventos.push({ tipo: 'ropaPara', parte }); return null; }
    let tipo = Z.sortea(C.queHerida, azar);
    if (tipo === 'corte' && azar() < C.profundo) tipo = 'profundo';
    Z.hiere(AJ, e, parte, tipo, Z.ropaEn(AJ, J, parte, 'infeccion'));
    if (zb.T.pesado && parte !== 'cabeza' && parte !== 'torso' && azar() < C.fracturaBallena) Z.hiere(AJ, e, parte, 'fractura');
    return parte;
  };
  // un choque fuerte con el coche te rompe una pierna (la del lado que toque)
  Z.choqueHiere = function (AJ, e, v) {
    if (v < AJ.cuerpo.fracturaChoque) return;
    const parte = Math.floor(e.min) % 2 ? 'piernaI' : 'piernaD';
    if (!Z.heridasEn(e.jugador, parte).some((h) => h.tipo === 'fractura')) Z.hiere(AJ, e, parte, 'fractura');
  };

  /* ---------- con el tiempo ---------- */
  const sucia = (AJ, h) => !!h.venda && h.venda.t >= AJ.cuerpo.vendaSucia;
  // lo que sangra una herida por hora
  Z.sangraDe = function (AJ, h) {
    const T = AJ.cuerpo.heridas[h.tipo];
    if (h.tipo === 'profundo') return h.puntos ? 0 : h.venda ? T.sangra * AJ.cuerpo.vendaProfundo : T.sangra;
    return h.venda ? 0 : T.sangra;
  };
  Z.sangra = (AJ, J) => (J.heridas || []).reduce((s, h) => s + Z.sangraDe(AJ, h), 0);
  Z.pasoHeridas = function (AJ, e, horas, azar) {
    const J = e.jugador;
    if (!J.heridas || !horas) return;
    J.analgesico = Math.max(0, (J.analgesico || 0) - horas);
    for (const h of J.heridas) pasoHerida(AJ, e, h, horas, azar);
    const curadas = J.heridas.filter((h) => h.cura >= AJ.cuerpo.heridas[h.tipo].cura);
    for (const h of curadas) e.eventos.push({ tipo: 'curada', parte: h.parte, herida: h.tipo });
    J.heridas = J.heridas.filter((h) => !curadas.includes(h));
    Z.dana(e, Z.sangra(AJ, J) * horas, 'sangra');
  };
  function pasoHerida(AJ, e, h, horas, azar) {
    h.t += horas;
    if (h.venda) h.venda.t += horas;
    if (!sucia(AJ, h) && Z.sangraDe(AJ, h) === 0) h.cura += horas;   // se cura sin sangrar y sin venda sucia
    if (!h.tirado && h.t >= AJ.cuerpo.desinfecta.hora) tiraInfeccion(AJ, e, h, azar);
  }
  // una hora después de hacerse: ¿infecta? (mordisco casi siempre, corte a veces, arañazo poco; el desinfectante y la ropa lo bajan)
  function tiraInfeccion(AJ, e, h, azar) {
    const J = e.jugador, C = AJ.cuerpo, D = C.desinfecta;
    h.tirado = true;
    const desinf = h.desinf ? (h.tipo === 'mordisco' ? D.mordisco : D.baja) : 1;
    const p = C.heridas[h.tipo].infecta * desinf * (1 - Math.min(1, h.protege)) * (J.A.infeccion || 1);
    if (J.infeccion > 0 || azar() >= p) return;
    J.infeccion = 1; e.eventos.push({ tipo: 'infectado', parte: h.parte });
  }

  /* ---------- curarse ---------- */
  // lo que se puede hacer a una herida: vendar (o cambiar la venda sucia), desinfectar, coser (corte profundo) y entablillar (fractura)
  const CURAS = {
    vendar: { cosa: 'venda', vale: (AJ, h) => h.tipo !== 'fractura' && (!h.venda || sucia(AJ, h)), haz: (h) => { h.venda = { t: 0 }; } },
    desinfectar: { cosa: 'desinfectante', vale: (AJ, h) => h.tipo !== 'fractura' && !h.desinf, haz: (h) => { h.desinf = true; } },
    puntos: { cosa: 'aguja', vale: (AJ, h) => h.tipo === 'profundo' && !h.puntos, haz: (h) => { h.puntos = true; } },
    tablilla: { cosa: 'tablilla', vale: (AJ, h) => h.tipo === 'fractura' && !h.tablilla, haz: (h) => { h.tablilla = true; } },
  };
  Z.CURAS = Object.keys(CURAS);
  Z.puedeCurar = (AJ, h, accion) => !!CURAS[accion] && CURAS[accion].vale(AJ, h);
  Z.cura = function (AJ, e, id, accion) {
    const J = e.jugador, h = (J.heridas || []).find((q) => q.id === id), C = CURAS[accion];
    if (!h || !C) return Z.error('noEsta', { id });
    if (!C.vale(AJ, h)) return Z.error('noHaceFalta', { accion });
    if (!Z.gastaLleva(J, C.cosa, 1).ok) return Z.error('faltan', { faltan: [[C.cosa, 1]] });
    C.haz(h);
    if (accion === 'vendar') J.vida = Math.min(J.max, J.vida + AJ.cuerpo.vendaVida * (J.A.venda || 1));   // MeerCat venda mejor
    e.eventos.push({ tipo: 'cura', accion, parte: h.parte });
    return Z.ok(h.id);
  };
  // la herida a la que le toca esa cura: la que más sangra (vendar), la más nueva (desinfectar) o la primera que lo necesite
  Z.curaSola = function (AJ, e, accion) {
    const hs = (e.jugador.heridas || []).filter((h) => Z.puedeCurar(AJ, h, accion));
    if (!hs.length) return Z.error('nadaQueCurar', { accion });
    const orden = accion === 'vendar' ? (a, b) => Z.sangraDe(AJ, b) - Z.sangraDe(AJ, a) : (a, b) => a.t - b.t;
    return Z.cura(AJ, e, hs.sort(orden)[0].id, accion);
  };
  Z.tomaAnalgesico = function (AJ, e) { e.jugador.analgesico = AJ.cuerpo.analgesico; };

  /* ---------- lo que hacen ---------- */
  // el dolor (0 a 100): la suma del de cada herida, salvo con analgésicos
  Z.dolor = (AJ, J) => (J.analgesico > 0 ? 0 : Math.min(100, (J.heridas || []).reduce((s, h) => s + AJ.cuerpo.heridas[h.tipo].dolor, 0)));
  // lo peor de un par de partes: fractura (con o sin tablilla) o herida
  function peor(AJ, J, partes, K) {
    let f = 1;
    for (const h of J.heridas || []) if (partes.includes(h.parte)) f = Math.min(f, h.tipo === 'fractura' ? (h.tablilla ? K.tablilla : K.rota) : K.herida);
    return f;
  }
  Z.velHeridas = (AJ, J) => peor(AJ, J, ['piernaI', 'piernaD'], AJ.cuerpo.piernas);
  Z.golpeHeridas = (AJ, J) => peor(AJ, J, ['brazoI', 'brazoD'], AJ.cuerpo.brazos);
  // la puntería con dolor: el cono de las armas de fuego se abre
  Z.temblor = (AJ, J) => 1 + Z.dolor(AJ, J) / 100 * AJ.cuerpo.temblor;
})(ZOM);
