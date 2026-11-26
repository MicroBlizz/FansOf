// Fans of Pop · ATAQUES DE LOS COMPAÑEROS QUE NO SALTAN, las cuentas (tarea #160, ADR 197, revisión del 25-11-2026 de Pepins:
// «los que no saltan lucen su ataque hacia lo que tocan»). Dominio puro: sin reloj, azar, SAVE ni dibujo. Dice a qué va cada
// habilidad que no salta ('pista': la burbuja que marca; 'toques', 'monedas' o 'corazones': ese contador de la cabecera;
// 'tablero': el centro del tablero o la burbuja que toca), dónde está cada contador de la cabecera y por dónde vuela el
// compañero de ida (de su hueco al destino, por su ruta propia de PP_ATAQUE.RUTAS) y de vuelta, sin salirse de la pantalla.
// Lo usa js/ataques-fx.js (PP_ATAQUE_FX.luce), solo con el flag 'ataques-companeros' abierto. Las reglas no cambian: esto solo se ve.
'use strict';
const PP_ATAQUE_DESTINO = (() => {
  const f = o => Object.freeze(o);
  const TIPOS = f(['pista', 'toques', 'monedas', 'corazones', 'tablero']);
  // las habilidades que no saltan (PP_COMP.HAB) y a qué van; las que saltan (saltito, lluvia, hielo, concha, cohete, burbuja y
  // primero) vuelan a sus burbujas con ppSaltaSlime y no están aquí
  const POR_HABILIDAD = f({
    chivato: 'pista', linterna: 'pista', lupa: 'pista',
    horas: 'toques', gordo: 'toques', cielo: 'toques', rescate: 'toques', calma: 'toques', fantasma: 'toques', estrella: 'toques',
    fortuna: 'monedas', limpia: 'monedas', bolsa: 'monedas',
    racha: 'tablero', ticket: 'tablero', rebobina: 'tablero', volteo: 'tablero', deshaz: 'tablero', despiste: 'tablero', salida: 'tablero', quita: 'tablero',
  });
  // a qué va la habilidad `hab` (las que no tienen fila, al tablero)
  const tipo = hab => POR_HABILIDAD[hab] || 'tablero';
  // dónde está cada contador de la cabecera (píxeles del juego, 540 de ancho): los de ppPintaMarcador (js/marcador.js) en la
  // sala y el monedero de ppPintaDuelo (js/duelo.js) en el duelo contra el CEO, que no tiene corazones ni toques
  const CABECERA = f({
    sala: f({ corazones: f({ x: 124, y: 52 }), monedas: f({ x: 40, y: 88 }), toques: f({ x: 396, y: 56 }) }),
    nim: f({ corazones: f({ x: 124, y: 52 }), monedas: f({ x: 40, y: 88 }) }),   // un nivel con duelo: sin toques (ppMarcadorNim)
    duelo: f({ monedas: f({ x: 40, y: 32 }) }),
  });
  // el punto del contador `t` en la pantalla `pantalla` ('sala', 'nim' o 'duelo'), o null si allí no está
  const cabecera = (t, pantalla) => (CABECERA[pantalla] && CABECERA[pantalla][t]) || null;
  // un valor que se acerca a un borde frena suave (tanh) en vez de salirse: dentro de [lo + borde, hi - borde] no cambia
  function suave(v, lo, hi, borde) {
    if (v < lo + borde) return lo + borde - borde * Math.tanh((lo + borde - v) / borde);
    if (v > hi - borde) return hi - borde + borde * Math.tanh((v - hi + borde) / borde);
    return v;
  }
  // el vuelo en u ∈ [0, 1]: de ida hasta IDA (llega al destino), se queda allí un momento hasta VUELTA (que se vea en el
  // contador o en la burbuja) y vuelve a su hueco
  const IDA = 0.45, VUELTA = 0.6;
  // el tramo del vuelo en u: de ida (k de 0 a 1 hacia el destino; 1 mientras se queda) o de vuelta (k de 0 a 1 hacia el hueco)
  function tramo(u) {
    if (u < IDA) return f({ ida: true, k: u / IDA });
    if (u < VUELTA) return f({ ida: true, k: 1 });
    return f({ ida: false, k: Math.min(1, (u - VUELTA) / (1 - VUELTA)) });
  }
  // dónde está en u el compañero que va de a (su hueco) a b (el destino) por su `vuelo` y vuelve por el mismo camino, dentro
  // de la caja { ancho, alto } con un margen que frena suave
  function ruta(vuelo, a, b, u, caja, margen = 24) {
    const t = tramo(Math.max(0, Math.min(1, u))), p = PP_ATAQUE.ruta(vuelo, a, b, t.ida ? t.k : 1 - t.k);
    return f({ x: suave(p.x, 0, caja.ancho, margen), y: suave(p.y, 0, caja.alto, margen), rot: p.rot });
  }
  return f({ TIPOS, POR_HABILIDAD, tipo, CABECERA, cabecera, suave, IDA, VUELTA, tramo, ruta });
})();
