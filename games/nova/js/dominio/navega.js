// Fans Of Nova · NV.Navega: cómo pilotan las naves enemigas armadas, en cuentas puras: el rumbo que buscan según su estilo y cuánto
// pueden girar. El estado de cada nave (e.nav) y el azar de sus cambios de lado los lleva navegacion-enemiga.js.
'use strict';
NV.Navega = (() => {
  // Gira el ángulo `a` hacia `meta` como mucho `max` radianes, por el lado corto
  function gira(a, meta, max) {
    const da = Math.atan2(Math.sin(meta - a), Math.cos(meta - a));
    return a + Math.max(-max, Math.min(max, da));
  }
  // Los de alcance medio y largo se quedan a su distancia ideal (70 % o 85 % del alcance): se acercan, se alejan girando o dan vueltas.
  // Devuelve [rumbo, multiplicador de velocidad]. `ang`: hacia tu nave; `bamb`: el zigzag de este momento.
  function rumboADistancia(st, ang, dist, alc, bamb) {
    const ideal = alc * (st.estilo === 'largo' ? 0.85 : 0.7);
    if (dist > ideal * 1.15) return [ang + bamb, 1];
    if (dist < ideal * 0.75) return [ang + Math.PI * 0.9 * st.lado + bamb, 1.1];
    return [ang + st.lado * 1.2 + bamb, 0.9];
  }
  return { gira, rumboADistancia };
})();
