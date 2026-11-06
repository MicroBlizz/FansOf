// Fans of Basement · Captura (dominio): como en Well Diver, no todo se mata. Con el botón RED lanzas una red de cables al bicho
// más cercano; si ya está débil (le queda poca vida), queda atrapado vivo: vale más que su botín, cuenta para el catálogo y, si
// subes a salvo, va al terrario de tu despacho. Si está demasiado entero se escapa y la red se pierde. Los jefes no se capturan.
// Cifras en ajustes.js (captura). Lo que hay en el despacho, en despacho.js.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const C = B.captura = {};

  // El bicho al que va la red: el más cercano a su alcance (o null).
  C.blanco = function (e) {
    const j = e.jugador, r2 = e.aj.captura.alcance ** 2;
    let mejor = null, md = r2;
    for (const en of e.enemigos) { const d = (en.x - j.x) ** 2 + (en.y - j.y) ** 2; if (d < md) { md = d; mejor = en; } }
    return mejor;
  };
  C.puede = (e, en) => en.vida <= en.vidaMax * e.aj.captura.umbral;

  // Si has pulsado RED y te quedan redes: la lanza. Atrapado o escapado, la red se gasta.
  C.paso = function (e, o) {
    if (!o.red || e.redes <= 0) return;
    const en = C.blanco(e);
    if (!en) { e.eventos.push({ tipo: 'sinBlanco' }); return; }
    e.redes--;
    if (!C.puede(e, en)) { e.eventos.push({ tipo: 'escapa', x: en.x, y: en.y }); return; }
    const AJ = e.aj, d = AJ.enemigos[en.tipo];
    e.enemigos.splice(e.enemigos.indexOf(en), 1);
    e.capturas[en.tipo] = (e.capturas[en.tipo] || 0) + 1;
    e.bajasPorTipo[en.tipo] = (e.bajasPorTipo[en.tipo] || 0) + 1;   // cuenta para el catálogo
    const valor = Math.round(AJ.captura.valor[d.raro ? 'raro' : 'normal'] * B.difDe(AJ, B.plantaDe(AJ, en.y), 0).valor * e.stats.valor);
    e.capturasValor += valor;
    e.eventos.push({ tipo: 'captura', enemigo: en.tipo, valor, x: en.x, y: en.y });
  };
})(BAS);
