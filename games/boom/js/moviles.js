// Fans of Boom · MÓVILES: crear uno, ponerlo en el suelo, caminar por el relieve y caerse cuando se queda sin suelo.
// (Fase 1: un móvil genérico con Tiro 1 y Tiro 2; los móviles propios de la serie llegan en la fase 2.) Sin DOM.
'use strict';
const MOVIL = (() => {
  const C = BOOM.movil, W = BOOM.mundo.ancho, H = BOOM.mundo.alto, DT = BOOM.paso;
  function crea(id, plaza, equipo, x, dir, defId) {
    const def = BOOM.moviles.find(d => d.id === defId) || BOOM.moviles[0];
    const m = { id, plaza, equipo, def, nombre: '', ia: false, nivel: 1, x, y: 0, dir, ang: 45, pot: 55, tiro: 0, vida: def.vida, vidaMax: def.vida, caos: 0, objetos: BOOM.objetos.inicial.slice(), doble: false, bungee: false, extra: 0,
      retraso: BOOM.salida[plaza] || 0, vivo: true, energia: C.energia, cayendo: false, vy: 0, y0: 0, marca: null };
    m.y = TERRENO.suelo(x, 0);
    return m;
  }
  // camina un trocito (dt segundos) hacia dir (-1 / 1); devuelve los píxeles que ha avanzado. Sube cuestas hasta C.trepa y se cae por los bordes.
  function mueve(m, dir, dt) {
    m.dir = dir;
    if (m.energia <= 0 || m.cayendo || !m.vivo) return 0;
    const paso = Math.min(m.def.velocidad * dt, m.energia), nx = m.x + dir * paso, sube = paso * C.trepa + 1.5;
    if (nx < 14 || nx > W - 14) return 0;
    if (TERRENO.solido(nx, m.y - sube)) return 0;   // pared demasiado alta
    let gy = -1;
    for (let y = Math.floor(m.y - sube); y <= m.y + 4; y++) if (TERRENO.solido(nx, y)) { gy = y; break; }
    m.x = nx; m.energia -= paso;
    if (gy < 0) { m.cayendo = true; m.vy = 0; m.y0 = m.y; } else m.y = gy;
    return paso;
  }
  // un paso de caída. Devuelve 'quieto', 'sigue', 'aterriza' (con m.caida = píxeles caídos) o 'vacio' (se ha perdido por el fondo)
  function cae(m, dt) {
    if (!m.vivo) return 'quieto';
    if (!m.cayendo) {
      if (TERRENO.solido(m.x, m.y)) return 'quieto';
      m.cayendo = true; m.vy = 0; m.y0 = m.y;
    }
    m.vy += BOOM.gravedad * dt;
    let dy = m.vy * dt;
    while (dy > 0) {
      const s = Math.min(dy, 1); m.y += s; dy -= s;
      if (TERRENO.solido(m.x, m.y)) { m.y = Math.floor(m.y); m.cayendo = false; m.caida = m.y - m.y0; return 'aterriza'; }
      if (m.y > H + BOOM.caida.vacio) { m.cayendo = false; return 'vacio'; }
    }
    return 'sigue';
  }
  // la inclinación del suelo bajo el móvil, en radianes (para dibujarlo apoyado en la cuesta)
  function inclinacion(m) {
    const a = TERRENO.suelo(m.x - 14, m.y - 30), b = TERRENO.suelo(m.x + 14, m.y - 30);
    return Math.atan2(b - a, 28);
  }
  return { crea, mueve, cae, inclinacion, DT };
})();
