// Fans of Basement · Habilidad (dominio): el botón especial de la bajada. Llevas una (la eliges en EQUIPO): la Reunión de
// emergencia congela a los bichos y al jefe unos segundos, Ctrl+Z te devuelve café y el Despido masivo daña a todo lo que tengas
// cerca. Después hay que esperar su recarga. Las dos últimas se abren al vencer a los jefes de Soporte y de QA. Cifras en
// ajustes.js (habilidades). Las reglas del progreso (cuáles tienes y cuál llevas) también están aquí.
'use strict';
var BAS = globalThis.BAS || (globalThis.BAS = {});
(function (B) {
  const H = B.habilidad = {};

  // Las que tienes: las que no piden jefe y las de los jefes que ya has vencido.
  B.habilidadesAbiertas = (AJ, p) => Object.keys(AJ.habilidades).filter((id) => AJ.habilidades[id].abre == null || p.vencidos.includes(AJ.habilidades[id].abre));
  // La que llevas (si la elegida ya no vale, la primera).
  B.habilidadDe = (AJ, p) => (B.habilidadesAbiertas(AJ, p).includes(p.habilidad) ? p.habilidad : Object.keys(AJ.habilidades)[0]);
  B.ponerHabilidad = function (AJ, p, id) {
    if (!AJ.habilidades[id]) return B.error('habilidadDesconocida', { id });
    if (!B.habilidadesAbiertas(AJ, p).includes(id)) return B.error('habilidadCerrada', { id });
    return B.ok({ ...B.copiaProgreso(p), habilidad: id });
  };

  const USA = {
    congelar: (e, d) => { e.congeladoT = d.dura; },
    ctrlz: (e, d) => { e.cafe = Math.min(e.cafeMax, e.cafe + e.cafeMax * d.cafe); },
    despido: (e, d, rnd) => {
      const j = e.jugador, cerca = (q) => (q.x - j.x) ** 2 + (q.y - j.y) ** 2 <= d.alcance * d.alcance, dano = d.dano * e.stats.dano;
      for (const en of e.enemigos.filter(cerca)) B.enemigos.herir(e, en, dano, rnd);
      for (const m of e.muebles.filter(cerca)) B.muebles.herir(e, m, dano, rnd);
      if (e.jefe && cerca(e.jefe)) B.jefes.herir(e, dano);
    },
  };

  // Cada paso: baja la recarga y la congelación y, si has pulsado el botón y está lista, la usa.
  H.paso = function (e, dt, o, rnd) {
    e.habilidadT = Math.max(0, e.habilidadT - dt);
    e.congeladoT = Math.max(0, e.congeladoT - dt);
    if (!o.habilidad || !e.habilidad || e.habilidadT > 0) return;
    const d = e.aj.habilidades[e.habilidad];
    USA[e.habilidad](e, d, rnd);
    e.habilidadT = d.recarga;
    e.habilidadUsos++;
    e.eventos.push({ tipo: 'habilidad', id: e.habilidad, x: e.jugador.x, y: e.jugador.y, alcance: d.alcance || 0 });
  };
  H.congelados = (e) => e.congeladoT > 0;
})(BAS);
