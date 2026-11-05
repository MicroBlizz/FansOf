// Fans of Basement · Enemigos (dominio): los bichos de la oficina. Bugs que corretean y te persiguen si te acercas, correos
// «RE: RE: URGENTE» que te siguen y al romperse se parten en dos, y reuniones grandes y lentas que, si te tocan, te frenan.
// Salen por tramos según la planta (más y más duros cuanto más abajo), se borran al quedar muy arriba y sueltan botín al caer.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const E = B.enemigos = {};

  E.crear = function (e, tipo, x, y) {
    const AJ = e.aj, d = AJ.enemigos[tipo], planta = B.plantaDe(AJ, y);
    const vida = Math.round(d.vida * (1 + AJ.vidaPorPlanta * planta));
    const en = { id: e.ids++, tipo, x, y, vida, vidaMax: vida, radio: d.radio, fase: (x * 7 + y) % 6.28, dir: x < AJ.ancho / 2 ? 1 : -1, golpeT: 0 };
    e.enemigos.push(en);
    return en;
  };

  // Elige qué sale en esta planta según los pesos de los enemigos ya abiertos.
  function eligeTipo(AJ, planta, r) {
    const tipos = Object.keys(AJ.enemigos).filter((t) => AJ.enemigos[t].desde <= planta && AJ.enemigos[t].peso > 0);
    const total = tipos.reduce((s, t) => s + AJ.enemigos[t].peso, 0);
    let x = r * total;
    for (const t of tipos) { x -= AJ.enemigos[t].peso; if (x <= 0) return t; }
    return tipos[tipos.length - 1];
  }

  E.densidad = (AJ, planta) => Math.min(AJ.generar.max, AJ.generar.base + AJ.generar.porPlanta * planta);

  // Va llenando el pozo por debajo del jugador, tramo a tramo.
  function generar(e, rnd) {
    const AJ = e.aj, G = AJ.generar;
    while (e.generadoHasta < e.jugador.y + G.delante) {
      const y = e.generadoHasta, planta = B.plantaDe(AJ, y);
      if (e.enemigos.length < G.maxActivos && rnd() < E.densidad(AJ, planta)) {
        const x = AJ.pared + 20 + rnd() * (AJ.ancho - 2 * AJ.pared - 40);
        E.crear(e, eligeTipo(AJ, planta, rnd()), x, y + rnd() * G.tramo);
      }
      e.generadoHasta += G.tramo;
    }
  }

  const MOVER = {
    bug(e, en, d, dt, cerca) {
      if (cerca) return hacia(e, en, d.vel * 1.3, dt);
      en.x += en.dir * d.vel * dt; en.y += Math.sin(e.t * 3 + en.fase) * 12 * dt;
    },
    correo(e, en, d, dt, cerca) { if (cerca) hacia(e, en, d.vel, dt); else en.y += Math.sin(e.t * 2 + en.fase) * 10 * dt; },
    reunion(e, en, d, dt) { en.x += en.dir * d.vel * dt; en.y += Math.sin(e.t + en.fase) * 6 * dt; },
  };
  MOVER.miniCorreo = MOVER.correo;

  function hacia(e, en, vel, dt) {
    const dx = e.jugador.x - en.x, dy = e.jugador.y - en.y, m = Math.hypot(dx, dy) || 1;
    en.x += dx / m * vel * dt; en.y += dy / m * vel * dt;
    if (Math.abs(dx) > 1) en.dir = dx > 0 ? 1 : -1;
  }

  // Rebota en las paredes del pozo.
  function paredes(AJ, en) {
    const min = AJ.pared + en.radio, max = AJ.ancho - AJ.pared - en.radio;
    if (en.x < min) { en.x = min; en.dir = 1; }
    if (en.x > max) { en.x = max; en.dir = -1; }
  }

  function tocar(e, en, d) {
    const j = e.jugador, r = en.radio + e.aj.jugador.radio;
    if ((j.x - en.x) ** 2 + (j.y - en.y) ** 2 > r * r) return;
    if (d.frena) { if (j.frenoT <= 0) e.eventos.push({ tipo: 'frenado', x: j.x, y: j.y }); j.frenoT = d.frenaT; }
    B.herirJugador(e, d.golpe, en.tipo);
  }

  E.paso = function (e, dt, rnd) {
    generar(e, rnd);
    const AJ = e.aj, j = e.jugador;
    for (let i = e.enemigos.length - 1; i >= 0; i--) {
      const en = e.enemigos[i], d = AJ.enemigos[en.tipo];
      if (en.y < j.y - AJ.generar.detras) { e.enemigos.splice(i, 1); continue; }
      const cerca = d.persigue > 0 && (j.x - en.x) ** 2 + (j.y - en.y) ** 2 < d.persigue * d.persigue;
      MOVER[en.tipo](e, en, d, dt, cerca);
      paredes(AJ, en);
      en.golpeT = Math.max(0, en.golpeT - dt);
      tocar(e, en, d);
    }
  };

  // Un disparo le da: si se queda sin vida cae, suelta su botín (y a veces una taza de café) y, si es un correo, se parte en dos.
  E.herir = function (e, en, dano, rnd) {
    en.vida -= dano; en.golpeT = 0.12;
    e.eventos.push({ tipo: 'impacto', x: en.x, y: en.y, dano });
    if (en.vida > 0) return false;
    const i = e.enemigos.indexOf(en);
    if (i >= 0) e.enemigos.splice(i, 1);
    morir(e, en, rnd);
    return true;
  };

  function morir(e, en, rnd) {
    const AJ = e.aj, d = AJ.enemigos[en.tipo];
    e.bajas++;
    e.eventos.push({ tipo: 'baja', x: en.x, y: en.y, enemigo: en.tipo });
    if (d.botin) soltar(e, d.botin, en.x, en.y);
    if (rnd() < AJ.probCafe) soltar(e, 'cafe', en.x + 8, en.y);
    if (d.divide) {
      for (const s of [-1, 1]) E.crear(e, d.divide, en.x + s * 10, en.y).dir = s;
      e.eventos.push({ tipo: 'divide', x: en.x, y: en.y });
    }
  }

  function soltar(e, tipo, x, y) {
    const AJ = e.aj, o = AJ.objetos[tipo], planta = B.plantaDe(AJ, y);
    const valor = Math.round(o.valor * (1 + AJ.valorPorPlanta * planta));
    e.objetos.push({ id: e.ids++, tipo, x, y, valor, peso: o.peso });
  }
  E.soltar = soltar;
})(BAS);
