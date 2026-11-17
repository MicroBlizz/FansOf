// Fans Of Paperwork · calibrado · AJUSTAR Y COMPARAR: cambia cifras de PW.AJ por su ruta («trituradora.capacidadBase»), juega las mismas
// partidas con las cifras de siempre y con las cambiadas, y deja PW.AJ como estaba. Da el resumen de cada lado (la mediana de las semillas)
// y el texto del cambio para llevarlo a mano a ajustes.js: nunca escribe en el repo. Las funciones del dominio leen PW.AJ al usarlo, así
// que se cambia en su sitio (nunca se reemplaza el objeto). ADR 122.
'use strict';
PW.calibrado = PW.calibrado || {};
PW.calibrado.ajusta = (() => {
  const partes = ruta => String(ruta).split('.');
  // el objeto que guarda la cifra y su clave, o null si la ruta no lleva a un número
  function sitio(ruta) {
    const p = partes(ruta), clave = p.pop();
    const padre = p.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), PW.AJ);
    return padre && typeof padre === 'object' && typeof padre[clave] === 'number' ? { padre, clave } : null;
  }
  // todas las rutas de PW.AJ que llevan a un número, en orden (para el selector del panel)
  function rutas(o = PW.AJ, pre = '') {
    return Object.keys(o).flatMap(k => {
      const v = o[k], r = pre + k;
      if (typeof v === 'number') return [r];
      return v && typeof v === 'object' ? rutas(v, r + '.') : [];
    });
  }
  const lee = ruta => { const s = sitio(ruta); return s ? s.padre[s.clave] : undefined; };
  // aplica una lista de { ruta, valor }: todo o nada. Resultado: PW.ok(deshaz) o 'ruta-desconocida' / 'valor-invalido' con la ruta
  function aplica(cambios) {
    for (const c of cambios) {
      if (!sitio(c.ruta)) return PW.error('ruta-desconocida', { ruta: c.ruta });
      if (typeof c.valor !== 'number' || !Number.isFinite(c.valor)) return PW.error('valor-invalido', { ruta: c.ruta });
    }
    const antes = cambios.map(c => { const s = sitio(c.ruta), v = s.padre[s.clave]; s.padre[s.clave] = c.valor; return [s, v]; });
    return PW.ok(() => antes.reverse().forEach(([s, v]) => { s.padre[s.clave] = v; }));
  }
  const mediana = l => { const s = l.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  // la mediana de varias partidas: segundos hasta cada nivel de la Trituradora (con cuántas semillas llegaron) y el final de la serie
  function resume(partidas) {
    const niveles = Math.max(0, ...partidas.map(p => p.hitos.trituradora.length));
    const trituradora = Array.from({ length: niveles }, (_, k) => {
      const t = partidas.map(p => p.hitos.trituradora[k]).filter(x => x !== undefined);
      return { nivel: k + 1, t: mediana(t), llegan: t.length };
    });
    const finales = partidas.map(p => p.serie[p.serie.length - 1]), fin = {};
    for (const k of Object.keys(finales[0])) fin[k] = mediana(finales.map(f => f[k]));
    return { trituradora, despidos: mediana(partidas.map(p => p.hitos.despidos.length)), fin };
  }
  // progreso(): se llama al acabar cada partida (para que el panel diga cuánto falta)
  function juegaVarias({ perfil, horas, semillas, progreso }) {
    const partidas = [];
    for (const semilla of semillas) {
      const r = PW.calibrado.jugador.juega({ perfil, horas, semilla });
      if (!r.ok) return r;
      partidas.push({ semilla, hitos: r.valor.hitos, serie: r.valor.serie });
      progreso();
    }
    return PW.ok(partidas);
  }
  // juega con las cifras de siempre y con los cambios. Resultado: PW.ok({ base, cambiado }) con { partidas, resumen } cada uno, o el error
  function compara({ cambios = [], perfil = 'activo', horas = 6, semillas = [7], progreso = () => {} } = {}) {
    const base = juegaVarias({ perfil, horas, semillas, progreso });
    if (!base.ok) return base;
    const ap = aplica(cambios);
    if (!ap.ok) return ap;
    let cambiado;
    try { cambiado = juegaVarias({ perfil, horas, semillas, progreso }); } finally { ap.valor(); }
    if (!cambiado.ok) return cambiado;
    return PW.ok({ base: { partidas: base.valor, resumen: resume(base.valor) }, cambiado: { partidas: cambiado.valor, resumen: resume(cambiado.valor) } });
  }
  // la serie mediana de un campo entre varias partidas del mismo perfil y horas (apuntan en los mismos segundos), con `max` puntos como
  // mucho (se queda uno de cada k, siempre con el último): [[t, valor]…]
  function serieMediana(partidas, campo, max = 600) {
    const n = Math.min(...partidas.map(p => p.serie.length)), k = Math.max(1, Math.ceil(n / max)), fuera = [];
    for (let i = 0; i < n; i += k) fuera.push(i);
    if (fuera[fuera.length - 1] !== n - 1) fuera.push(n - 1);
    return fuera.map(i => [partidas[0].serie[i].t, mediana(partidas.map(p => p.serie[i][campo]))]);
  }
  // las tablas de las fórmulas con las cifras de siempre y con los cambios (PW.AJ queda como estaba)
  function formulas(cambios, perfil, n) {
    const F = PW.calibrado.formulas, base = F.todo(perfil, n), ap = aplica(cambios);
    if (!ap.ok) return ap;
    let cambiado;
    try { cambiado = F.todo(perfil, n); } finally { ap.valor(); }
    return PW.ok({ base, cambiado });
  }
  // el texto del cambio, una línea por cifra: «trituradora.capacidadBase: 3.5 → 4»
  const texto = cambios => cambios.map(c => `${c.ruta}: ${lee(c.ruta)} → ${c.valor}`).join('\n');
  return { rutas, lee, aplica, resume, compara, serieMediana, formulas, texto };
})();
