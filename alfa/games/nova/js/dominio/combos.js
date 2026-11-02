// Fans Of Nova · NV.Combos: qué combinaciones con nombre puede descubrir el jugador (reacciones, combos de carga, talentos de portador y el
// Apagón), cuáles actúan en un golpe y cómo se apuntan en la campaña. Sin pantalla, sonido ni azar: el aviso y la página del Arsenal son
// adaptadores (armas.js, interfaz.js, arsenal-combos.js). Diseño en docs/nova/avisos-de-combos.md; probado en tests/nova/unitarios.
'use strict';
NV.Combos = (() => {
  // Los combos de NOVA_ARMAS.combos que son reglas de base de una carga, no algo que se descubra al combinar
  const DE_BASE = ['interferencia', 'laser'];

  // La lista de descubribles, en orden de la página: { id, nombre, efecto, cargas: [dos cargas, la pista], portador? }
  function catalogo(A) {
    const out = A.reacciones.map(r => ({ id: r.id, nombre: r.nombre, efecto: r.efecto, cargas: [r.cargaA, r.cargaB] }));
    for (const id in A.combos) {
      if (DE_BASE.includes(id)) continue;
      const k = A.combos[id], cargas = (k.cargas || []).slice(0, 2);
      out.push({ id, nombre: k.nombre, efecto: k.efecto, cargas, portador: k.portador || null });
    }
    out.push({ id: 'apagon', nombre: A.estados.apagon.nombre, efecto: A.estados.apagon.efecto, cargas: ['em', 'em'] });
    return out;
  }

  // Los combos que actúan en este golpe, mirados ANTES de aplicarlo (las reacciones y el Apagón los avisa quien los resuelve).
  // `seAleja` y `escudoArriba` los calcula quien llama; `sinEstado`: golpe que no deja estado (onda de una sobrecarga).
  function delGolpe(e, w, seAleja, escudoArriba, sinEstado) {
    const carga = w.carga, est = e.est, calor = e.calor || 0, out = [];
    if ((carga === 'cinetica' || carga === 'explosiva') && calor > 0) out.push('ablandado');
    if (w.portador === 'lanzador' && seAleja) out.push('cazador');
    if (w.portador === 'railgun' && carga === 'cinetica' && escudoArriba) out.push('perforaescudos');
    if (sinEstado) return out;
    if (carga === 'termica' && est.interferido > 0) out.push('sobrecargaLenta');
    if (carga === 'em' && est.escudoCaido > 0) out.push('cortacircuitos');
    if (carga === 'energia' && calor > 0 && calor < 99) out.push('plasma');
    if (w.portador === 'flak' && carga === 'termica') out.push('metrallaIncendiaria');
    return out;
  }

  // ¿Es la primera vez? `vistos` es lo que la campaña ya conoce ({ id: veces }) y `nuevos`, lo descubierto en esta misión
  function esNuevo(vistos, nuevos, id) { return !((vistos || {})[id] > 0) && !nuevos.includes(id); }

  // Al cerrar la misión: suma las veces de cada combo a la campaña (`c.combos`) y devuelve los que eran nuevos para ella
  function junta(c, veces) {
    const vistos = c.combos || (c.combos = {}), nuevos = [];
    for (const id in veces) {
      if (!(veces[id] > 0)) continue;
      if (!(vistos[id] > 0)) nuevos.push(id);
      vistos[id] = (vistos[id] || 0) + veces[id];
    }
    return nuevos;
  }

  // Cuántos llevas descubiertos de los que hay
  function cuenta(c, A) {
    const vistos = c.combos || {}, todos = catalogo(A);
    return { hechos: todos.filter(x => vistos[x.id] > 0).length, total: todos.length };
  }

  return { catalogo, delGolpe, esNuevo, junta, cuenta };
})();
