// Fans of Basement · Becarios atrapados (dominio): en algunas plantas hay un becario atrapado (en la fotocopiadora o en una
// reunión eterna) pidiendo ayuda. Si lo tocas, lo rescatas: te sigue y dispara solo durante la bajada (hasta 3 a la vez), y si
// subes a salvo te da una propina. En las plantas con jefe no hay becarios.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const BC = B.becarios = {};

  // Se llama al generar el primer tramo de cada planta.
  BC.alGenerar = function (e, planta, rnd) {
    const AJ = e.aj, Q = AJ.becarios;
    if (planta < Q.desde || B.jefes.dePlanta(AJ, planta) || rnd() >= Q.prob) return;
    const x = AJ.pared + 40 + rnd() * (AJ.ancho - 2 * AJ.pared - 80), y = planta * AJ.altoPlanta + 160 + rnd() * 150;
    e.becarios.push({ id: e.ids++, x, y, trampa: rnd() < 0.5 ? 'fotocopiadora' : 'reunion' });
  };

  BC.paso = function (e) {
    const AJ = e.aj, j = e.jugador, r = AJ.becarios.radio + AJ.jugador.radio;
    for (let i = e.becarios.length - 1; i >= 0; i--) {
      const b = e.becarios[i];
      if ((b.x - j.x) ** 2 + (b.y - j.y) ** 2 <= r * r) { e.becarios.splice(i, 1); rescatar(e, b); }
      else if (b.y < j.y - AJ.generar.detras) e.becarios.splice(i, 1);
    }
  };

  function rescatar(e, b) {
    const Q = e.aj.becarios;
    e.rescatados++;
    const ayuda = e.ayudantes.filter((a) => a.tipo === 'becario').length < Q.max;
    if (ayuda) B.arma.nuevoAyudante(e, 'becario', { dano: e.stats.dano * Q.dano, cadencia: Q.cadencia, alcance: Q.alcance }, b);
    e.eventos.push({ tipo: 'rescate', x: b.x, y: b.y, ayuda });
  }
})(BAS);
