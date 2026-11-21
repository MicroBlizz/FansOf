// Fans of Pinball · dominio · TIENDA DE LOLA: el quiosco de arriba a la izquierda. Con la persiana subida y fichas de la partida para lo
// más barato, la bola entra por la puerta: la mesa se para (fase «comprando») y Lola ofrece 3 mejoras (sin pasar del tope de cada una) a
// cambio de fichas, con un precio por rareza (AJUSTES.tienda). Comprar aplica la mejora como en la elección normal; comprar o salir
// devuelve la bola a la mesa por la puerta y baja la persiana hasta la planta siguiente. Sin fichas, la puerta rebota y Lola avisa.
// Estado de la sala: sala.tienda = 'lista' | 'usada'. Trabaja sobre el estado `s` de la partida.
'use strict';
PB.tienda = (() => {
  const minimo = r => Math.min(...Object.values(r.tienda.precios));
  const precio = (r, id) => r.tienda.precios[r.mejoras.lista.find(m => m.id === id).rareza];
  const fichas = s => Math.floor(s.fichas);
  // ¿la bola puede entrar ahora? (persiana subida y fichas para lo más barato)
  const puedeEntrar = s => s.sala.tienda === 'lista' && fichas(s) >= minimo(s.r);
  // la bola entra: se esconde dentro y la mesa se para hasta comprar o salir
  function entra(s, b) {
    s.sala.tienda = 'usada';
    b.estado = 'tienda'; b.vx = 0; b.vy = 0;
    s.compra = { bola: b.id, oferta: PB.mejoras.ofrece(s.r, s.az, s.mejoras, {}).slice(0, s.r.tienda.ofrece) };
    s.fase = 'comprando';
    PB.emite(s, 'tienda_entra', { x: b.x, y: b.y, fichas: fichas(s) });
  }
  // la bola da en la puerta cerrada: aviso de «faltan fichas» (no más de uno cada `avisoCada` s; con la persiana bajada, nada)
  function avisa(s, b) {
    const sala = s.sala;
    if (sala.tienda !== 'lista' || sala.tiempo - sala.avisoTienda < s.r.tienda.avisoCada) return;
    sala.avisoTienda = sala.tiempo;
    PB.emite(s, 'tienda_sin_fichas', { x: b.x, y: b.y, faltan: minimo(s.r) - fichas(s) });
  }
  // la bola sale por la puerta hacia abajo y la mesa sigue
  function sale(s, mejora) {
    const b = s.bolas.find(x => x.id === s.compra.bola), t = s.r.mesa.tienda.sale;
    if (b) Object.assign(b, { estado: 'mesa', x: t.x, y: t.y, vx: t.vx, vy: t.vy, quieta: 0, sinTocar: 0 });
    s.compra = null; s.fase = 'jugando';
    PB.emite(s, 'tienda_sale', { x: t.x, y: t.y, mejora });
  }
  function salir(s) {
    if (s.fase !== 'comprando') return PB.error('no_toca', { fase: s.fase });
    sale(s, '');
    return PB.ok(null);
  }
  // compra la mejora i de la oferta: cobra, la aplica (las bolas en juego cambian de tamaño con Bola gorda) y sale
  function compra(s, i) {
    if (s.fase !== 'comprando') return PB.error('no_toca', { fase: s.fase });
    const id = s.compra.oferta[i];
    if (!id) return PB.error('indice', { i });
    const cuesta = precio(s.r, id);
    if (fichas(s) < cuesta) return PB.error('sin_fichas', { faltan: cuesta - fichas(s) });
    s.fichas -= cuesta;
    s.mejoras[id] = (s.mejoras[id] || 0) + 1;
    s.cif = PB.mejoras.cifras(s.r, s.mejoras);
    for (const b of s.bolas) b.r = s.r.fisica.radioBola * s.cif.radio;
    PB.emite(s, 'mejora', { mejora: id, nivel: s.mejoras[id] });
    PB.emite(s, 'tienda_compra', { mejora: id, precio: cuesta });
    sale(s, id);
    return PB.ok({ mejora: id, nivel: s.mejoras[id], precio: cuesta });
  }
  return { minimo, precio, puedeEntrar, entra, avisa, compra, salir };
})();
