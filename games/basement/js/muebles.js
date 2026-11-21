// Fans of Basement · Muebles (dominio): taquillas, fotocopiadoras, máquinas de café y racks viejos pegados a las paredes de las
// plantas. No atacan ni se mueven: tu arma les dispara cuando no hay bichos cerca y, al romperse, sueltan materiales para el
// taller (tornillos, cables, chips y discos, mejores cuanto más abajo). Los materiales van a la caja sin ocupar sitio y solo
// cuentan si subes a salvo. Los jefes también sueltan algunos al caer. Las cifras están en ajustes.js (muebles, materiales).
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const M = B.muebles = {};

  // Al generar una planta nueva: a veces, un mueble pegado a la pared izquierda o derecha.
  M.alGenerar = function (e, planta, rnd) {
    const AJ = e.aj, D = AJ.muebles;
    if (planta < 1 || rnd() >= D.prob) return;
    const tipos = Object.keys(D.tipos).filter((t) => (D.tipos[t].desde || 0) <= planta), tipo = tipos[Math.min(tipos.length - 1, Math.floor(rnd() * tipos.length))];
    const d = D.tipos[tipo], izq = rnd() < 0.5, vida = Math.round(d.vida * B.difDe(AJ, planta, e.rango).vida);
    const x = izq ? AJ.pared + d.radio + 4 : AJ.ancho - AJ.pared - d.radio - 4, y = (planta + 1) * AJ.altoPlanta - d.radio - 14;
    e.muebles.push({ id: e.ids++, tipo, x, y, vida, vidaMax: vida, radio: d.radio, golpeT: 0 });
  };

  // Un disparo le da; si se rompe, suelta sus materiales. Devuelve true si se ha roto.
  M.herir = function (e, m, dano, rnd, critico) {
    m.vida -= dano; m.golpeT = 0.12;
    e.eventos.push({ tipo: 'impacto', x: m.x, y: m.y, dano, critico: !!critico });
    if (m.vida > 0) return false;
    e.muebles.splice(e.muebles.indexOf(m), 1);
    e.mueblesRotos++;
    e.eventos.push({ tipo: 'mueble', x: m.x, y: m.y, mueble: m.tipo });
    suelta(e, m, rnd);
    return true;
  };

  // Lo que suelta según la planta: cada material, entre su mínimo y su máximo, desde su planta (y con su probabilidad).
  function suelta(e, m, rnd) {
    const AJ = e.aj, planta = B.plantaDe(AJ, m.y), S = AJ.muebles.suelta;
    let k = 0;
    for (const t of AJ.materiales) {
      const s = S[t];
      if (planta < s.desde || (s.prob != null && rnd() >= s.prob)) continue;
      const n = s.n[0] + Math.floor(rnd() * (s.n[1] - s.n[0] + 1));
      for (let i = 0; i < n; i++, k++) B.enemigos.soltar(e, t, m.x + (k % 4 - 1.5) * 10, m.y - 6 - Math.floor(k / 4) * 10);
    }
  }

  // Lo que suelta además un jefe vencido.
  M.botinJefe = function (e, x, y) {
    let k = 0;
    for (const [t, n] of Object.entries(e.aj.muebles.jefe)) for (let i = 0; i < n; i++, k++) B.enemigos.soltar(e, t, x + (k % 4 - 1.5) * 12, y + 20 + Math.floor(k / 4) * 12);
  };

  // Se borran los que quedan muy arriba; el destello del golpe se apaga.
  M.paso = function (e, dt) {
    const lejos = e.jugador.y - e.aj.generar.detras;
    e.muebles = e.muebles.filter((m) => m.y >= lejos);
    for (const m of e.muebles) m.golpeT = Math.max(0, m.golpeT - dt);
  };
})(BAS);
