// Fans Of Nova · NV.Habilidad: las reglas de la habilidad activa de la nave (cuál te toca, cuándo se desbloquea, la recarga y cuánto dura),
// sin pantalla, sonido ni azar propio: lo que hace cada una en la partida está en habilidad.js. Datos en datos-habilidades.js.
// Probado en tests/nova/unitarios/habilidad-dominio.test.mjs.
'use strict';
NV.Habilidad = (() => {
  // La habilidad de una facción, lista para la misión: sin usar, sin recarga y sin efecto activo
  function nueva(H, faccion) {
    const def = H.facciones[faccion];
    if (!def) return null;
    return { def, id: def.id, cd: 0, activa: 0, efecto: null };
  }

  // Se desbloquea en cada misión al llegar la nave al rango que dicen los datos (el 2)
  function desbloqueada(H, rango) { return rango >= H.rango; }
  function lista(h, H, rango) { return !!h && desbloqueada(H, rango) && h.cd <= 0 && h.activa <= 0; }

  // Cuánto falta de la recarga, de 0 (lista) a 1 (recién usada): el anillo del botón
  function falta(h) { return h && h.cd > 0 ? Math.min(1, h.cd / h.def.recarga) : 0; }

  // Usarla: empieza la recarga y el efecto. La Tirada elige con el azar que se le pasa cuál de sus opciones hace.
  // Devuelve la definición del efecto que toca (la propia o la elegida), o null si no se puede.
  function usa(h, H, rango, azar, F) {
    if (!lista(h, H, rango)) return null;
    let def = h.def;
    if (def.opciones) { const id = def.opciones[Math.floor(azar() * def.opciones.length)]; def = Object.values(F).find(f => f.id === id); }
    h.cd = h.def.recarga; h.activa = def.dura || 0; h.efecto = def;
    return def;
  }

  // Pasa el tiempo. Devuelve el efecto que acaba de terminar (para deshacerlo) o null.
  function paso(h, dt) {
    if (!h) return null;
    if (h.cd > 0) h.cd = Math.max(0, h.cd - dt);
    if (h.activa <= 0) return null;
    h.activa -= dt;
    if (h.activa > 0) return null;
    const fin = h.efecto; h.activa = 0; h.efecto = null;
    return fin;
  }

  // ¿Está actuando ahora este efecto?
  function actua(h, id) { return !!h && h.activa > 0 && !!h.efecto && h.efecto.id === id; }

  return { nueva, desbloqueada, lista, falta, usa, paso, actua };
})();
