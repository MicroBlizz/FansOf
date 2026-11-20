// Fans of Pinball · dominio · ENEMIGOS: los becarios de Microblizz andan de lado a lado por su nivel y bajan poco a poco hacia la parte
// baja (siempre hay algo cerca de las palas). Nunca se meten en la bola, en otra cosa ni fuera de su zona: si algo les corta el paso, se
// dan la vuelta. El cafetero lanza un café cada 5 s; el fichador quita 1 s cada 4 s mientras vive.
'use strict';
PB.enemigos = (() => {
  // ¿hay algo en (x, y) que no deje pasar al enemigo `o`?
  // (sin crear listas: corre en cada paso)
  function choca(lista, o, x, y, hueco) {
    for (let i = 0; i < lista.length; i++) {
      const c = lista[i], dx = c.x - x, dy = c.y - y, lim = c.r + o.r + hueco;
      if (c !== o && c.vivo !== false && dx * dx + dy * dy < lim * lim) return true;
    }
    return false;
  }
  function ocupado(s, o, x, y) {
    const sala = s.sala, j = sala.jefe;
    if (choca(s.bolas, o, x, y, 1)) return true;
    for (const lista of [sala.enemigos, sala.rompibles, sala.setas, sala.maquinas]) if (choca(lista, o, x, y, 2)) return true;
    return Boolean(j) && (choca(j.cajas, o, x, y, 2) || (j.vivo && Math.hypot(j.x - x, j.y - y) < j.r + o.r + 2));
  }
  function dentro(s, o, x, y) {
    const z = s.r.enemigos.zonas[o.nivel];
    return x >= z.x0 && x <= z.x1 && y <= z.y1;
  }
  const puede = (s, o, x, y) => dentro(s, o, x, y) && !ocupado(s, o, x, y);
  function anda(s, o, h) {
    const re = s.r.enemigos, nx = o.x + o.dir * re.velocidad * h;
    o.vx = 0;
    if (puede(s, o, nx, o.y)) { o.x = nx; o.vx = o.dir * re.velocidad; } else o.dir = -o.dir;
    const ny = Math.min(o.y + re.bajada * h, re.zonas[o.nivel].y1);
    if (ny > o.y && puede(s, o, o.x, ny)) o.y = ny;
  }
  function cafetero(s, o, h) {
    o.reloj += h;
    if (o.reloj < s.r.enemigos.cafe.cada) return;
    o.reloj = 0;
    PB.proyectiles.cafe(s, o);
  }
  function fichador(s, o, h) {
    const f = s.r.reloj.fichador;
    o.reloj += h;
    if (o.reloj < f.cada) return;
    o.reloj -= f.cada;
    PB.emite(s, 'fichaje', { x: o.x, y: o.y, segundos: PB.marcador.quitaTiempo(s, f.quita) });
  }
  const PROPIO = { cafetero, fichador };
  function paso(s, h) {
    for (const o of s.sala.enemigos) {
      if (!o.vivo) continue;
      anda(s, o, h);
      if (PROPIO[o.tipo]) PROPIO[o.tipo](s, o, h);
    }
  }
  return { paso, ocupado };
})();
