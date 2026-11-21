// Fans of Pinball · adaptador · POSTURAS CÓMICAS del héroe dentro de la cápsula (ARTE.md, «Receta de estilo»): decide, para cada bola,
// si toca una postura y cuál. Aplastado unos 0,3 s tras un golpe fuerte; mareado tras muchos rebotes seguidos sin tocar una pala;
// dormido cuando la bola espera en el lanzador o se queda atrapada en una pala un rato; cabeza abajo al caer rápido. Las cifras y los
// nombres están en AJUSTES.arte.posturas; si el dibujo de una postura aún no existe, el pintor usa el ovillo normal. Solo pantalla.
'use strict';
PB.creaPosturas = arte => {
  const P = arte.posturas, estado = new Map();   // id de bola → { aplastado, mareado, rebotes, quieta }
  let ultima = null;   // la foto del último paso (para saber qué bola está cerca de un golpe)
  const de = id => estado.get(id) || estado.set(id, { aplastado: 0, mareado: 0, rebotes: 0, quieta: 0 }).get(id);
  // la bola más cercana a (x, y) (las de la foto anterior), o null
  function cercana(x, y) {
    let mejor = null, d = 40;
    for (const b of (ultima ? ultima.bolas : [])) { const e = Math.hypot(b.x - x, b.y - y); if (e < d) { d = e; mejor = b; } }
    return mejor;
  }
  return {
    // un rebote contra algo en (x, y); fuerte: aplasta
    rebote(x, y, fuerte) {
      const b = cercana(x, y);
      if (!b) return;
      const e = de(b.id);
      e.rebotes += 1;
      if (fuerte) e.aplastado = P.aplastado.segundos;
      if (e.rebotes >= P.mareado.rebotes) { e.mareado = P.mareado.segundos; e.rebotes = 0; }
    },
    // la pala toca la bola: se acaba la racha de rebotes (y si va muy fuerte, también se aplasta)
    pala(x, y, fuerte) {
      const b = cercana(x, y);
      if (!b) return;
      const e = de(b.id);
      e.rebotes = 0;
      if (fuerte) e.aplastado = P.aplastado.segundos;
    },
    paso(foto, dt) {
      ultima = foto;
      for (const b of foto.bolas) {
        const e = de(b.id), quieta = b.espera || (b.atrapada && Math.hypot(b.vx, b.vy) < 15);
        e.aplastado = Math.max(0, e.aplastado - dt); e.mareado = Math.max(0, e.mareado - dt);
        e.quieta = quieta ? e.quieta + dt : 0;
      }
      if (estado.size > 12) estado.clear();   // bolas de salas pasadas
    },
    // el nombre de la postura de la bola (de AJUSTES.arte.posturas) o null
    cual(b) {
      const e = estado.get(b.id);
      if (!e) return b.espera ? 'dormido' : null;
      if (e.aplastado > 0) return 'aplastado';
      if (e.mareado > 0) return 'mareado';
      if (b.espera || e.quieta >= P.dormido.segundos) return 'dormido';
      return !b.viajando && b.vy > P.cabezaAbajo.velocidad ? 'cabezaAbajo' : null;
    },
  };
};
