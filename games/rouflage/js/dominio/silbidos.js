// Fans of Rouflage · DOMINIO: EL SILBIDO OBLIGATORIO. Cada colado tiene su propio reloj: al llegar a 0 silba a la fuerza y, si silba por gusto,
// su reloj vuelve a empezar. A 5 segundos avisa a su dueño. Los bots con maña también silban por gusto, en el momento que ellos eligen, cuando
// están congelados y no hay ningún becario cerca. Regla pura: dice qué toca; quien llama silba, avisa y suena.
'use strict';

RF.Silbidos = (() => {
  const AVISO = 5, GUSTO = { manaMin: 0.5, desde: 1, hasta: 9, probabilidad: 0.5 };      // probabilidad por segundo
  // e: { silbido (segundos que le quedan), avisado, esMio (lo lleva este navegador: yo o, en el PvP, la máquina que llevo), congelado, bot: { mana } | null }
  // azar() y sinBecariosCerca() se piden solo si hacen falta (el azar no se gasta sin motivo)
  // → { silbido, avisado, avisa, forzado, gusto }
  const paso = (e, dt, azar, sinBecariosCerca) => {
    const silbido = e.silbido - dt;
    let avisado = e.avisado, avisa = false;
    if (e.esMio && silbido <= AVISO && !avisado) { avisado = true; avisa = true; }
    const forzado = silbido <= 0;
    const gusto = !forzado && !!e.bot && e.congelado && e.bot.mana >= GUSTO.manaMin && silbido > GUSTO.desde && silbido < GUSTO.hasta
      && azar() < dt * GUSTO.probabilidad && sinBecariosCerca();
    return { silbido, avisado, avisa, forzado, gusto };
  };
  return { paso, AVISO };
})();
