// Fans Of · /gestion, pestaña RENDIMIENTO de cada juego: las reglas (dominio, sin red, reloj ni DOM). De lo que devuelve gestion_rendimiento_juego
// (servidor/191-rendimiento-detalle.sql): cómo se nombra un aparato, la comparación con y sin «Ahorro de batería» (ADR 218) y los datos extra de cada
// juego agrupados por clave (pantalla, nivel, cortinilla…). Una clave con muchos valores (como el máximo de partículas) se enseña por sus valores más lentos.
// Y lo que ocupa la tabla (servidor/196-rendimiento-tamano-y-claves.sql), para vigilarla.
'use strict';
const RENDIMIENTO_DATOS = (() => {
  const MUCHOS = 12, LENTOS = 6;
  const OCULTAS = Object.freeze(['ahorro', 'app']);   // la comparación de ahorro va aparte y «app» ya sale en el aparato
  // «móvil 343×701 ×2,1 · 8 núcleos · 8 GB»; lo que no se sepa no sale
  function aparato(a) {
    const trozos = [(a.app ? 'app Android' : a.plataforma === 'pc' ? 'PC' : 'móvil') + (a.ancho && a.alto ? ` ${a.ancho}×${a.alto}` : '') + (a.dpr ? ` ×${String(a.dpr).replace('.', ',')}` : '')];
    if (a.nucleos) trozos.push(`${a.nucleos} núcleos`);
    if (a.memoria) trozos.push(`${String(a.memoria).replace('.', ',')} GB`);
    return trozos.join(' · ');
  }
  // con y sin ahorro, de las filas «ahorro» de los datos: { con, sin }, cada una { partidas, fps_medio, fps_p1_medio } o null
  function ahorro(datos) {
    const de = v => datos.find(d => d.clave === 'ahorro' && d.valor === v) || null;
    return { con: de('1'), sin: de('0') };
  }
  const porNumero = (a, b) => (isFinite(a.valor) && isFinite(b.valor) ? a.valor - b.valor : String(a.valor).localeCompare(String(b.valor)));
  // las claves de los datos extra, en orden; cada una con sus filas (por valor) o, si tiene muchos valores, solo las más lentas
  function porClave(datos) {
    const grupos = new Map();
    for (const d of datos) if (!OCULTAS.includes(d.clave)) { if (!grupos.has(d.clave)) grupos.set(d.clave, []); grupos.get(d.clave).push(d); }
    return [...grupos].sort(([a], [b]) => a.localeCompare(b)).map(([clave, filas]) => {
      const muchos = filas.length > MUCHOS;
      const vistas = muchos ? [...filas].sort((a, b) => a.fps_medio - b.fps_medio).slice(0, LENTOS) : [...filas].sort(porNumero);
      return { clave, muchos, valores: filas.length, filas: vistas };
    });
  }
  // cuánto ocupa lo guardado, para vigilar que no crece de más: «304 partidas guardadas (en todos los juegos) · 184 kB · la base entera, 65 MB»
  const medida = b => (b >= 1048576 ? `${String(Math.round(b / 104857.6) / 10).replace('.', ',')} MB` : `${Math.max(1, Math.round(b / 1024))} kB`);
  function tamano(t) {
    if (!t || !Number.isFinite(t.filas) || !Number.isFinite(t.bytes)) return null;
    return `${String(t.filas).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} partidas guardadas (en todos los juegos) · ${medida(t.bytes)}` + (Number.isFinite(t.base_bytes) ? ` · la base entera, ${medida(t.base_bytes)}` : '');
  }
  return Object.freeze({ aparato, ahorro, porClave, tamano, MUCHOS, LENTOS });
})();
if (typeof module !== 'undefined') module.exports = RENDIMIENTO_DATOS;
