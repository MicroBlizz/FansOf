// Fans of Zombies · LAS HABILIDADES (dominio): se mejora haciendo las cosas, como en Zomboid. Seis habilidades (pelea, disparo, sigilo,
// carpintería, cocina y mecánica) de nivel 0 a 10; cada acción da experiencia (AJ.habilidades.xp) y cada nivel mejora un poco lo suyo
// (AJ.habilidades.efecto). Se guardan en el jugador (J.hab) y se pierden al morir.
'use strict';
var ZOM = globalThis.ZOM || (globalThis.ZOM = {});
(function (Z) {
  Z.HABILIDADES = ['pelea', 'disparo', 'sigilo', 'carpinteria', 'cocina', 'mecanica'];
  const xpDe = (J, h) => (J.hab && J.hab[h]) || 0;
  // el nivel con tanta experiencia (el último umbral que se pasa)
  Z.nivelCon = (AJ, xp) => { const N = AJ.habilidades.niveles; let n = 0; while (n + 1 < N.length && xp >= N[n + 1]) n++; return n; };
  Z.nivel = (AJ, J, h) => Z.nivelCon(AJ, xpDe(J, h));
  // cuánto le falta al nivel siguiente (0 a 1), para la barra
  Z.progreso = function (AJ, J, h) {
    const N = AJ.habilidades.niveles, n = Z.nivel(AJ, J, h);
    if (n + 1 >= N.length) return 1;
    return (xpDe(J, h) - N[n]) / (N[n + 1] - N[n]);
  };
  // el multiplicador de un efecto: «más» (daño, lo que alimenta) o «menos» (tiempo, ruido, aguante, lo que te ven)
  Z.mas = (AJ, J, h, campo) => 1 + Z.nivel(AJ, J, h) * AJ.habilidades.efecto[h][campo];
  Z.menos = (AJ, J, h, campo) => 1 - Z.nivel(AJ, J, h) * AJ.habilidades.efecto[h][campo];
  // ganar experiencia por una acción (AJ.habilidades.xp[accion]); al subir de nivel, un evento
  Z.ganaXp = function (AJ, e, h, accion, veces = 1) {
    const J = e.jugador, antes = Z.nivel(AJ, J, h);
    J.hab = J.hab || {};
    J.hab[h] = xpDe(J, h) + AJ.habilidades.xp[accion] * veces;
    const ahora = Z.nivel(AJ, J, h);
    if (ahora > antes) e.eventos.push({ tipo: 'subeNivel', hab: h, nivel: ahora });
    return ahora;
  };
})(ZOM);
