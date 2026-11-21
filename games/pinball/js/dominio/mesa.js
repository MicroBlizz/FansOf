// Fans of Pinball · dominio · MESA: la parte fija de la mesa de dos niveles, hecha una vez desde AJUSTES.mesa: las paredes (con los
// marcos y las puertas del ascensor y de la tienda de Lola, y los rebotadores, cuya cara de dentro da patada), las máquinas de café,
// en qué nivel está una altura y si un sitio está libre para poner algo sin que se solape con paredes, palas, máquinas, la boca del
// ascensor, la puerta de la tienda, las salidas ni con otras cosas (lo usan el generador de salas, los enemigos y el jefe).
'use strict';
PB.mesa = (() => {
  // pared = { ax, ay, bx, by, tipo: 'pared' | 'marco' | 'puerta' | 'rebotador' } (el rebotador lleva además su índice i)
  const pared = (s, tipo) => ({ ax: s[0], ay: s[1], bx: s[2], by: s[3], tipo });
  // los tres lados de un rebotador: la cara de dentro (a → c) da patada; los otros dos son pared
  const rebotador = (r, i) => [{ ...pared([r.a[0], r.a[1], r.c[0], r.c[1]], 'rebotador'), i }, pared([r.a[0], r.a[1], r.b[0], r.b[1]], 'pared'),
    pared([r.b[0], r.b[1], r.c[0], r.c[1]], 'pared')];
  // el hueco de la tienda: marcos a los lados de la puerta y el techo de dentro (la puerta, aparte: solo cierra a veces)
  const tienda = t => [pared([t.x0, t.fondo, t.x0, t.techo], 'marco'), pared([t.x1, t.fondo, t.x1, t.techo], 'marco'),
    pared([t.x0, t.techo, t.x1, t.techo], 'pared')];
  function crea(reglas) {
    const m = reglas.mesa, e = m.escalera, t = m.tienda;
    const paredes = m.paredes.map(s => pared(s, 'pared'));
    paredes.push(pared([e.x0, 0, e.x0, e.fondo], 'marco'), pared([e.x1, 0, e.x1, e.fondo], 'marco'), ...tienda(t));
    m.rebotadores.forEach((r, i) => paredes.push(...rebotador(r, i)));
    const maquinas = m.maquinas.map(([x, y], i) => ({ id: i, x, y, r: m.radioMaquina }));
    return { reglas: m, paredes, maquinas, puerta: pared([e.x0, e.fondo, e.x1, e.fondo], 'puerta'),
      puertaTienda: pared([t.x0, t.fondo, t.x1, t.fondo], 'puerta') };
  }
  // el id del nivel en que está la altura y ('arriba' | 'abajo')
  const nivelDe = (m, y) => (y < m.niveles[0].y1 ? m.niveles[0].id : m.niveles[1].id);
  const nivel = (m, id) => m.niveles.find(n => n.id === id);
  // lejos de todas las paredes (y de las puertas del ascensor y de la tienda)
  function lejosDeParedes(mesa, x, y, hueco) {
    const todas = mesa.paredes.concat(mesa.puerta, mesa.puertaTienda);
    return todas.every(p => PB.geo.dist2Segmento(x, y, p.ax, p.ay, p.bx, p.by) >= hueco * hueco);
  }
  const ANGULOS = 6;   // posiciones de la pala que se miran entre el reposo y arriba (cada unos 15 grados)
  // lejos de lo que barre una pala al girar (la cápsula en cada posición entre el reposo y arriba)
  function lejosDePala(p, x, y, hueco) {
    const lim = (p.grosor + hueco) * (p.grosor + hueco);
    for (let i = 0; i <= ANGULOS; i++) {
      const a = p.reposo + (p.arriba - p.reposo) * i / ANGULOS;
      if (PB.geo.dist2Segmento(x, y, p.x, p.y, p.x + Math.cos(a) * p.largo, p.y + Math.sin(a) * p.largo) < lim) return false;
    }
    return true;
  }
  const lejosDePalas = (m, x, y, hueco) => m.palas.every(p => lejosDePala(p, x, y, hueco));
  const lejosDeProhibidas = (m, x, y, r) => m.prohibidas.every(z => Math.hypot(x - z.x, y - z.y) >= z.r + r);
  // lejos de otras cosas { x, y, r } (las que no estén vivas no cuentan)
  const lejosDeCosas = (cosas, x, y, r, hueco) => cosas.every(c => c.vivo === false || Math.hypot(x - c.x, y - c.y) >= c.r + r + hueco);
  // ¿cabe una cosa de radio r en (x, y) dejando `hueco` libre alrededor? (las máquinas de café cuentan siempre, aunque se retiren)
  function libre(mesa, x, y, r, cosas, hueco) {
    const m = mesa.reglas;
    if (x - r < 0 || x + r > m.ancho || y - r < 0 || y + r > m.alto) return false;
    return lejosDeParedes(mesa, x, y, r + hueco) && lejosDePalas(m, x, y, r + hueco) && lejosDeProhibidas(m, x, y, r)
      && lejosDeCosas(mesa.maquinas, x, y, r, hueco) && lejosDeCosas(cosas, x, y, r, hueco);
  }
  return { crea, nivelDe, nivel, libre, lejosDeCosas, lejosDeParedes };
})();
