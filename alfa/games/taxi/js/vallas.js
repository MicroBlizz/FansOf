// Fans Of Taxi · VALLAS: los quitamiedos, a los dos lados de las carreteras de fuera (tras el margen de tierra) y por fuera de la
// circunvalación. Así el mapa queda cerrado: de la carretera solo se sale al margen. Dominio puro (sin DOM ni three): recibe la red de
// carreteras y una pregunta («¿este punto pisa alguna calzada?») y devuelve los tramos de valla. Lo usa ciudad.js.
'use strict';
const VALLAS = (() => {
  // red: { nodos, aristaDe, rio, enlaces, monte, ciudades }; pisaCalzada(x, z, y): si ese punto está sobre alguna calzada a esa altura
  function crear(red, pisaCalzada) {
    const { nodos, aristaDe, rio, enlaces, monte, ciudades } = red, quitamiedos = [];
    // cada carretera es una cadena de nodos: el quitamiedos es su polilínea desplazada (en las curvas se desplaza por la bisectriz, así nunca cruza la calzada), recortada donde sale otra carretera o hay puente
    const anchoDe = (a, b) => aristaDe.get(a.id + ',' + b.id);
    // un quitamiedos nunca se mete en una calzada (pasa en el lado de dentro de las horquillas, donde las dos rectas se juntan): se
    // parte en trozos de unos 3 m y se quitan los que pisan alguna carretera a su altura
    function fueraDeCalzadas(A, B, u0, u1) {
      const n = Math.max(1, Math.ceil(Math.hypot(B.x - A.x, B.z - A.z) * (u1 - u0) / 3)), quedan = [];
      let desde = null;
      for (let k = 0; k < n; k++) {
        const v0 = lerp(u0, u1, k / n), v1 = lerp(u0, u1, (k + 1) / n), um = (v0 + v1) / 2;
        const libre = !pisaCalzada(lerp(A.x, B.x, um), lerp(A.z, B.z, um), lerp(A.nodo.y, B.nodo.y, um));
        if (libre && desde === null) desde = v0;
        if (!libre && desde !== null) { quedan.push([desde, v0]); desde = null; }
      }
      if (desde !== null) quedan.push([desde, u1]);
      return quedan;
    }
    // en una horquilla la bisectriz no sirve (la valla de fuera pasaría por la curva): la cadena se parte ahí y cada recta acaba con la suya
    const giraMucho = (a, p, b) => ((p.x - a.x) * (b.x - p.x) + (p.z - a.z) * (b.z - p.z)) / ((Math.hypot(p.x - a.x, p.z - a.z) * Math.hypot(b.x - p.x, b.z - p.z)) || 1) < -0.3;
    function vallaCadena(cadena, lados, cerrada) {
      if (!cerrada) for (let k = 1; k < cadena.length - 1; k++) if (giraMucho(cadena[k - 1], cadena[k], cadena[k + 1])) { vallaCadena(cadena.slice(0, k + 1), lados, false); vallaCadena(cadena.slice(k), lados, false); return; }
      const n = cadena.length; if (n < 2) return;
      const e0 = anchoDe(cadena[0], cadena[1]); if (!e0) return;
      const sep = e0.ancho / 2 + e0.margen + (e0.tipo === 'anillo' ? 4 : 1);   // en la circunvalación queda un arcén de 4 m
      for (const lado of lados) {
        const puntos = [];
        for (let k = 0; k < n; k++) {
          const p = cadena[k], a = cerrada ? cadena[(k - 1 + n) % n] : cadena[Math.max(0, k - 1)], b = cerrada ? cadena[(k + 1) % n] : cadena[Math.min(n - 1, k + 1)];
          let dx = b.x - a.x, dz = b.z - a.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;   // la tangente en p (bisectriz)
          const d1x = p.x - a.x, d1z = p.z - a.z, d2x = b.x - p.x, d2z = b.z - p.z, l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1;
          const cosMed = Math.max(0.5, Math.abs((d1x * d2x + d1z * d2z) / (l1 * l2) + 1) / 2);   // cuanto más cerrada la curva, más lejos queda la esquina del desplazamiento
          puntos.push({ x: p.x - dz * lado * sep / Math.sqrt(cosMed), z: p.z + dx * lado * sep / Math.sqrt(cosMed), nodo: p });
        }
        const m = cerrada ? n : n - 1;
        for (let k = 0; k < m; k++) {
          const A = puntos[k], B = puntos[(k + 1) % n], e = anchoDe(A.nodo, B.nodo); if (!e) continue;
          if (rio.length && CARRETERAS.cauce(rio, (A.x + B.x) / 2, (A.z + B.z) / 2).d < 40) continue;   // en el puente ya hay pretil
          // recortar alrededor de los cruces de este lado: donde sale otra carretera por aquí no hay valla
          let tramos = [[0, 1]];
          for (const P of [A.nodo, B.nodo]) for (const v of P.vecinos) {
            const o = nodos[v], oe = aristaDe.get(P.id + ',' + v); if (!oe || o === A.nodo || o === B.nodo || cadena.includes(o)) continue;
            const sx = -(B.z - A.z), sz = B.x - A.x; if (((o.x - P.x) * sx + (o.z - P.z) * sz) * lado < 0) continue;   // sale por el otro lado de la carretera: esta valla sigue
            // el hueco: donde la valla pasa por la franja de la otra carretera (su calzada y su margen, y 3 m más). Si sale en ángulo
            // cerrado, la cruza lejos del nudo: por eso se mira la franja entera y no solo un círculo alrededor del cruce
            const lo = Math.hypot(o.x - P.x, o.z - P.z) || 1, ux = (o.x - P.x) / lo, uz = (o.z - P.z) / lo, w = oe.ancho / 2 + oe.margen + 3;
            const lado0 = ux * (A.z - P.z) - uz * (A.x - P.x), lado1 = ux * (B.z - P.z) - uz * (B.x - P.x);   // a qué distancia del eje de la otra pasa la valla, en A y en B
            if (Math.abs(lado1 - lado0) < 1e-6) { if (Math.abs(lado0) >= w) continue; }
            const ta = Math.abs(lado1 - lado0) < 1e-6 ? 0 : Math.min((-w - lado0) / (lado1 - lado0), (w - lado0) / (lado1 - lado0)), tb = Math.abs(lado1 - lado0) < 1e-6 ? 1 : Math.max((-w - lado0) / (lado1 - lado0), (w - lado0) / (lado1 - lado0));
            const delante = t => ux * (lerp(A.x, B.x, t) - P.x) + uz * (lerp(A.z, B.z, t) - P.z);   // y que sea por delante del nudo, no por detrás
            if (Math.max(delante(clamp(ta, 0, 1)), delante(clamp(tb, 0, 1))) < -w || Math.min(delante(clamp(ta, 0, 1)), delante(clamp(tb, 0, 1))) > lo + w) continue;
            tramos = tramos.flatMap(([u0, u1]) => u1 <= ta || u0 >= tb ? [[u0, u1]] : [[u0, Math.min(u1, ta)], [Math.max(u0, tb), u1]].filter(([q0, q1]) => q1 - q0 > 0.02));
          }
          for (const [u0, u1] of tramos.flatMap(([u0, u1]) => fueraDeCalzadas(A, B, u0, u1))) {
            const q = { ax: lerp(A.x, B.x, u0), az: lerp(A.z, B.z, u0), bx: lerp(A.x, B.x, u1), bz: lerp(A.z, B.z, u1), ya: lerp(A.nodo.y, B.nodo.y, u0), yb: lerp(A.nodo.y, B.nodo.y, u1), arista: e };
            q.y0 = Math.min(A.nodo.y, B.nodo.y) - 3; q.y1 = Math.max(A.nodo.y, B.nodo.y) + 3; quitamiedos.push(q);
          }
        }
      }
    }
    for (const en of enlaces) vallaCadena(en, [-1, 1], false);
    for (const su of monte.subidas) vallaCadena(su, [-1, 1], false);
    if (monte.vuelta.length) vallaCadena(monte.vuelta, [-1, 1], true);
    for (const c of ciudades) {   // la circunvalación en orden, y solo el lado de fuera
      const inicio = c.anillo[0], orden = [inicio]; let prev = null, cur = inicio;
      for (let k = 0; k < c.anillo.length; k++) { const sig = cur.vecinos.map(v => nodos[v]).find(o => o !== prev && o.tipo === 'anillo' && o.ciudad === c.indice && o !== inicio); if (!sig) break; orden.push(sig); prev = cur; cur = sig; }
      const m = orden[1], lado = Math.sign(-(m.z - inicio.z) * (inicio.x - c.cx) + (m.x - inicio.x) * (inicio.z - c.cz)) || 1;
      vallaCadena(orden, [lado], true);
    }
    return quitamiedos;
  }
  return { crear };
})();
