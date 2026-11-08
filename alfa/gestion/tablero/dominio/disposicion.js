// Fans Of · /gestion · TABLERO · dominio · DISPOSICIÓN: dónde va cada caja y cada flecha para dibujar el grafo de una tarea (TABLERO.Grafo) de izquierda a derecha,
// un nivel por columna. Solo cuentas: devuelve posiciones y trazados, no HTML. Las flechas bajan y suben por los huecos entre columnas y, si saltan niveles,
// recorren un carril por debajo de todas las cajas, así nunca pasan por encima de una caja. Sin reloj, red ni pantalla.
'use strict';
TABLERO.disposicion = (() => {
  const M = Object.freeze({ ancho: 150, alto: 58, hueco: 48, vertical: 18, margen: 12, carril: 9, letras: 20, letrasMeta: 26, paso: 5 });

  const corta = (t, max) => (t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t);
  // el texto en hasta `cuantas` líneas de `max` letras, partiendo por palabras; si sobra texto, la última acaba en «…»
  function lineas(texto, max, cuantas) {
    const out = [];
    for (const palabra of texto.split(/\s+/).filter(Boolean)) {
      const ultima = out.length - 1;
      if (ultima >= 0 && out[ultima].length + 1 + palabra.length <= max) out[ultima] += ' ' + palabra;
      else out.push(palabra);
    }
    const vistas = out.slice(0, cuantas).map(l => corta(l, max));
    if (out.length > cuantas) vistas[cuantas - 1] = corta(out[cuantas - 1], max - 1).replace(/…$/, '') + '…';
    return vistas;
  }
  const meta = n => corta([TABLERO.estadoNodoTexto(n.estado), n.modelo].filter(Boolean).join(' · ') + (n.intentos ? ' × ' + n.intentos : ''), M.letrasMeta);

  // Las filas de cada nivel, ordenadas por la media de la fila de sus dependencias (menos cruces); lo que no depende de nadie conserva su orden
  function ordenaFilas(niveles) {
    const fila = new Map();
    return niveles.map(nivel => {
      const clave = n => (n.depende.length ? n.depende.reduce((s, d) => s + fila.get(d), 0) / n.depende.length : Infinity);
      const orden = nivel.map((n, i) => ({ n, i, k: clave(n) })).sort((a, b) => (a.k === b.k ? a.i - b.i : a.k - b.k)).map(o => o.n);
      orden.forEach((n, j) => fila.set(n.id, j));
      return orden;
    });
  }
  function situa(niveles) {
    const paso = M.alto + M.vertical, mayor = Math.max(1, ...niveles.map(f => f.length));
    return new Map(niveles.flatMap((filaNodos, i) => filaNodos.map((n, j) => [n.id, Object.freeze({
      id: n.id, nivel: i, estado: n.estado, x: M.margen + i * (M.ancho + M.hueco), y: M.margen + ((mayor - filaNodos.length) * paso) / 2 + j * paso,
      w: M.ancho, h: M.alto, lineas: lineas(n.titulo || n.id, M.letras, 2), meta: meta(n),
    })])));
  }

  // Las ranuras reparten las bajadas y subidas dentro de cada hueco entre columnas para que las flechas no se pisen: cada flecha, la suya; si en un hueco
  // caben menos de las que hay, se juntan lo justo (nunca dos en la misma x)
  function reparte(niveles, nodos) {
    const cuenta = new Map(), usos = new Map();
    const suma = h => cuenta.set(h, (cuenta.get(h) || 0) + 1);
    for (const n of niveles.flat()) for (const d of n.depende) { suma(nodos.get(d).nivel); suma(nodos.get(n.id).nivel - 1); }
    const paso = Math.min(M.paso, (M.hueco - 8) / Math.max(1, ...cuenta.values()));
    return hueco => { const k = usos.get(hueco) || 0; usos.set(hueco, k + 1); return 4 + k * paso; };
  }
  function trazado(de, a, ranura, carril) {
    const x1 = de.x + de.w, y1 = de.y + de.h / 2, y2 = a.y + a.h / 2, g1 = x1 + ranura(de.nivel);
    if (a.nivel - de.nivel === 1) return `M${x1} ${y1}H${g1}V${y2}H${a.x}`;
    const g2 = a.x - M.hueco + ranura(a.nivel - 1);
    return `M${x1} ${y1}H${g1}V${carril}H${g2}V${y2}H${a.x}`;
  }
  function flechas(niveles, nodos, bajoCajas) {
    const ranura = reparte(niveles, nodos);
    let largas = 0;
    return niveles.flat().flatMap(n => n.depende.map(dep => {
      const de = nodos.get(dep), a = nodos.get(n.id), larga = a.nivel - de.nivel > 1;
      const carril = bajoCajas + 8 + (larga ? largas++ : 0) * M.carril;
      return Object.freeze({ de: dep, a: n.id, d: trazado(de, a, ranura, carril), larga });
    }));
  }

  // niveles: lo que da Grafo.niveles(). Devuelve { ancho, alto, nodos: [{ id, x, y, w, h, estado, lineas, meta }], flechas: [{ de, a, d }] }
  function disposicion(niveles) {
    const ordenados = ordenaFilas(niveles), nodos = situa(ordenados);
    const mayor = Math.max(1, ...ordenados.map(f => f.length)), bajoCajas = M.margen + mayor * (M.alto + M.vertical) - M.vertical;
    const lista = flechas(ordenados, nodos, bajoCajas), largas = lista.filter(f => f.larga).length;
    return Object.freeze({
      ancho: 2 * M.margen + ordenados.length * M.ancho + Math.max(0, ordenados.length - 1) * M.hueco,
      alto: bajoCajas + M.margen + (largas ? 8 + (largas - 1) * M.carril : 0),
      nodos: Object.freeze([...nodos.values()]), flechas: Object.freeze(lista),
    });
  }
  return disposicion;
})();
